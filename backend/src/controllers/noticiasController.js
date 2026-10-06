import { randomUUID } from 'node:crypto';
import pool from '../config/db.js';
import { auditService } from '../services/auditService.js';

const generateSlug = text => String(text || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\w\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/--+/g, '-');

const getAllNoticias = async () => {
  const [rows] = await pool.query('SELECT * FROM noticias ORDER BY created_at DESC');
  return rows;
};

export const noticiasController = {
  getAll: async (_req, res) => {
    try {
      return res.json(await getAllNoticias());
    } catch (error) {
      console.error('Error al consultar noticias en MySQL:', error);
      return res.status(500).json({ error: 'No se pudieron consultar las noticias.' });
    }
  },

  getById: async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM noticias WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Noticia no encontrada.' });
      return res.json(rows[0]);
    } catch (error) {
      console.error('Error al consultar noticia en MySQL:', error);
      return res.status(500).json({ error: 'No se pudo consultar la noticia.' });
    }
  },

  create: async (req, res) => {
    try {
      const data = req.body;
      const title = data.title || data.titulo;
      if (!title?.trim()) {
        return res.status(400).json({ error: 'El título de la noticia es obligatorio.' });
      }

      const id = `noticia-${randomUUID()}`;
      const noticia = {
        title: title.trim(),
        slug: generateSlug(title),
        summary: data.summary || data.extracto || '',
        content: data.content || data.contenido || '',
        category: data.category || data.categoria || 'General',
        image: data.img || data.imagen || data.image || '/img/hero-bg.jpg',
        author: data.author || data.autor || 'Prensa Alcaldía',
        date: data.date || new Date().toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        status: data.status || 'published',
        fuente: data.fuente || 'manual',
        urlExterna: data.url_externa || null,
        externalId: data.external_id || null
      };
      await pool.query(
        `INSERT INTO noticias (id, titulo, slug, extracto, contenido, categoria, imagen, autor, date, status, fuente, url_externa, external_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, noticia.title, noticia.slug, noticia.summary, noticia.content, noticia.category,
          noticia.image, noticia.author, noticia.date, noticia.status, noticia.fuente,
          noticia.urlExterna, noticia.externalId]
      );
      await auditService.logAction({
        req,
        action: 'CREAR_NOTICIA',
        module: 'Noticias',
        details: `Noticia creada: "${noticia.title}"`
      });
      return res.status(201).json(await getAllNoticias());
    } catch (error) {
      console.error('Error al crear noticia en MySQL:', error);
      return res.status(500).json({ error: 'Error al crear la noticia.' });
    }
  },

  update: async (req, res) => {
    try {
      const data = req.body;
      const title = data.title || data.titulo;
      if (!title?.trim()) {
        return res.status(400).json({ error: 'El título de la noticia es obligatorio.' });
      }
      const [result] = await pool.query(
        `UPDATE noticias SET titulo=?, slug=?, extracto=?, contenido=?, categoria=?, imagen=?, autor=?, date=?, status=?
         WHERE id=?`,
        [title.trim(), generateSlug(title), data.summary ?? data.extracto ?? '',
          data.content ?? data.contenido ?? '', data.category ?? data.categoria ?? 'General',
          data.img ?? data.imagen ?? data.image ?? '', data.author ?? data.autor ?? 'Prensa Alcaldía',
          data.date ?? '', data.status ?? 'published', req.params.id]
      );
      if (result.affectedRows === 0) {
        const [existing] = await pool.query('SELECT id FROM noticias WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Noticia no encontrada.' });
      }
      await auditService.logAction({
        req,
        action: 'EDITAR_NOTICIA',
        module: 'Noticias',
        details: `Noticia actualizada ID: ${req.params.id}`
      });
      return res.json(await getAllNoticias());
    } catch (error) {
      console.error('Error al actualizar noticia en MySQL:', error);
      return res.status(500).json({ error: 'Error al actualizar noticia.' });
    }
  },

  delete: async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM noticias WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Noticia no encontrada.' });
      await auditService.logAction({
        req,
        action: 'ELIMINAR_NOTICIA',
        module: 'Noticias',
        details: `Noticia eliminada ID: ${req.params.id}`
      });
      return res.json(await getAllNoticias());
    } catch (error) {
      console.error('Error al eliminar noticia en MySQL:', error);
      return res.status(500).json({ error: 'Error al eliminar la noticia.' });
    }
  },

  uploadImage: async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se seleccionó ninguna imagen.' });
    return res.json({ url: `/uploads/${req.file.filename}` });
  }
};
