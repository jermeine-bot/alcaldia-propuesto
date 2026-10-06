import { randomUUID } from 'node:crypto';
import pool from '../config/db.js';

const generateSlug = text => text
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\w\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/--+/g, '-');

export const isFacebookConfigured = () => {
  const values = [process.env.FACEBOOK_PAGE_ID, process.env.FACEBOOK_ACCESS_TOKEN];
  return values.every(value => value && !/^(tu_|your_|placeholder)/i.test(value));
};

export const facebookService = {
  syncPosts: async () => {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (!isFacebookConfigured()) {
      return {
        success: false,
        configured: false,
        importedCount: 0,
        error: 'Configura FACEBOOK_PAGE_ID y FACEBOOK_ACCESS_TOKEN para sincronizar.'
      };
    }

    try {
      const url = new URL(`https://graph.facebook.com/v19.0/${encodeURIComponent(pageId)}/feed`);
      url.searchParams.set('fields', 'id,message,created_time,full_picture,permalink_url');
      url.searchParams.set('access_token', accessToken);
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Error al conectar con Facebook Graph API.');
      }

      let importedCount = 0;
      let skippedCount = 0;
      for (const post of data.data || []) {
        if (!post.message || await facebookService.checkPostExists(post.id)) {
          skippedCount++;
          continue;
        }

        const lines = post.message.split('\n').filter(line => line.trim());
        const title = (lines[0] || 'Publicación Oficial de la Alcaldía de León').slice(0, 120);
        const date = new Date(post.created_time).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        await pool.query(
          `INSERT INTO noticias
           (id, titulo, slug, extracto, contenido, categoria, imagen, autor, date, status, fuente, url_externa, external_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 'facebook', ?, ?, ?)`,
          [`noticia-fb-${randomUUID()}`, title, generateSlug(title), lines.slice(0, 2).join(' ').slice(0, 250),
            post.message, 'Facebook Oficial', post.full_picture || '/img/hero-bg.jpg',
            'Facebook Alcaldía León', date, post.permalink_url || null, post.id, new Date(post.created_time)]
        );
        importedCount++;
      }
      return {
        success: true,
        importedCount,
        skippedCount,
        message: `Sincronización completada: ${importedCount} noticias importadas de Facebook.`
      };
    } catch (error) {
      console.error('Error durante la sincronización de Facebook:', error);
      return { success: false, error: error.message, importedCount: 0 };
    }
  },

  checkPostExists: async externalId => {
    const [rows] = await pool.query('SELECT id FROM noticias WHERE external_id = ? LIMIT 1', [externalId]);
    return rows.length > 0;
  }
};
