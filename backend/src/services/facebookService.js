import { db } from '../config/firebase.js';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore/lite';

const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
};

export const facebookService = {
  syncPosts: async () => {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!pageId || !accessToken || pageId.includes('tu_page_id') || accessToken.includes('tu_access_token')) {
      console.log('ℹ️ Credenciales de Facebook Graph API no configuradas en .env. Se usará el simulador de sincronización de Facebook.');
      return await facebookService.simulateSync();
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${pageId}/feed?fields=id,message,created_time,full_picture,permalink_url&access_token=${accessToken}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Error al conectar con Facebook Graph API');
      }

      const data = await response.json();
      const posts = data.data || [];

      let importedCount = 0;
      let skippedCount = 0;

      for (const post of posts) {
        if (!post.message) continue;

        const externalId = post.id;
        const exists = await facebookService.checkPostExists(externalId);

        if (exists) {
          skippedCount++;
          continue;
        }

        const messageLines = post.message.split('\n').filter(line => line.trim() !== '');
        const rawTitle = messageLines[0] || 'Publicación Oficial de la Alcaldía de León';
        const title = rawTitle.length > 120 ? rawTitle.substring(0, 117) + '...' : rawTitle;
        const summary = messageLines.slice(0, 2).join(' ').substring(0, 250);
        const slug = generateSlug(title);

        const createdDate = new Date(post.created_time).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        const newNoticia = {
          id: `noticia-fb-${externalId.replace(/[^a-zA-Z0-9]/g, '-')}`,
          titulo: title,
          title: title,
          slug,
          extracto: summary,
          summary,
          contenido: post.message,
          content: post.message,
          categoria: 'Facebook Oficial',
          category: 'Facebook Oficial',
          imagen: post.full_picture || '/img/hero-bg.jpg',
          img: post.full_picture || '/img/hero-bg.jpg',
          autor: 'Facebook Alcaldía León',
          author: 'Facebook Alcaldía León',
          date: createdDate,
          status: 'published',
          fuente: 'facebook',
          url_externa: post.permalink_url,
          external_id: externalId,
          created_at: post.created_time || new Date().toISOString()
        };

        if (db) {
          await setDoc(doc(db, 'noticias', newNoticia.id), newNoticia);
        }
        importedCount++;
      }

      console.log(`✅ Sincronización de Facebook finalizada: ${importedCount} noticias nuevas importadas, ${skippedCount} ya existían.`);
      return {
        success: true,
        importedCount,
        skippedCount,
        message: `Sincronización completada: ${importedCount} noticias importadas de Facebook.`
      };
    } catch (error) {
      console.error('Error durante la sincronización de Facebook:', error.message);
      return {
        success: false,
        error: error.message,
        importedCount: 0
      };
    }
  },

  checkPostExists: async (externalId) => {
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, 'noticias'));
        return querySnapshot.docs.some(d => d.data().external_id === externalId);
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  simulateSync: async () => {
    const mockFbPosts = [
      {
        id: `fb-post-${Date.now()}-1`,
        message: '🔴 EN VIVO: Avances de las obras de iluminación nocturna en el bulevar principal de León. ¡Compromiso y trabajo 24/7 para nuestro pueblo!',
        created_time: new Date().toISOString(),
        full_picture: '/img/noticias/noticia1.jpg',
        permalink_url: 'https://www.facebook.com/share/1EJ2g1UpjY/'
      }
    ];

    let importedCount = 0;
    for (const post of mockFbPosts) {
      const exists = await facebookService.checkPostExists(post.id);
      if (!exists) {
        const title = 'Avances de iluminación nocturna en bulevar principal';
        const newNoticia = {
          id: `noticia-fb-${post.id}`,
          titulo: title,
          title,
          slug: generateSlug(title),
          extracto: post.message.substring(0, 150),
          summary: post.message.substring(0, 150),
          contenido: post.message,
          content: post.message,
          categoria: 'Facebook Oficial',
          category: 'Facebook Oficial',
          imagen: post.full_picture,
          img: post.full_picture,
          autor: 'Facebook Alcaldía León',
          author: 'Facebook Alcaldía León',
          date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
          status: 'published',
          fuente: 'facebook',
          url_externa: post.permalink_url,
          external_id: post.id,
          created_at: new Date().toISOString()
        };

        if (db) {
          await setDoc(doc(db, 'noticias', newNoticia.id), newNoticia);
        }
        importedCount++;
      }
    }

    return {
      success: true,
      simulated: true,
      importedCount,
      message: `Sincronización simulada completada: ${importedCount} nueva noticia importada.`
    };
  }
};
