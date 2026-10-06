import { randomUUID } from 'node:crypto';
import pool from '../config/db.js';

const getAllCultura = async () => {
  const [rows] = await pool.query('SELECT * FROM cultura ORDER BY created_at DESC');
  return rows;
};

export const culturaController = {
  getAll: async (_req, res) => {
    try {
      return res.json(await getAllCultura());
    } catch (error) {
      console.error('Error al consultar cultura en MySQL:', error);
      return res.status(500).json({ error: 'No se pudieron consultar los eventos culturales.' });
    }
  },

  create: async (req, res) => {
    try {
      const data = req.body;
      if (!data.title?.trim()) {
        return res.status(400).json({ error: 'El título del evento es obligatorio.' });
      }
      const id = data.id || `cultura-${randomUUID()}`;
      await pool.query(
        `INSERT INTO cultura (id, icon, title, \`desc\`, event_date, event_time, location, image_url, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, data.icon || '', data.title.trim(), data.desc || '', data.event_date || '',
          data.event_time || '', data.location || '', data.image_url || '', data.is_published ?? true]
      );
      return res.status(201).json(await getAllCultura());
    } catch (error) {
      console.error('Error al registrar evento cultural en MySQL:', error);
      return res.status(500).json({ error: 'Error al registrar evento cultural.' });
    }
  },

  update: async (req, res) => {
    try {
      const data = req.body;
      if (!data.title?.trim()) {
        return res.status(400).json({ error: 'El título del evento es obligatorio.' });
      }
      const [result] = await pool.query(
        `UPDATE cultura SET icon=?, title=?, \`desc\`=?, event_date=?, event_time=?, location=?, image_url=?, is_published=? WHERE id=?`,
        [data.icon || '', data.title.trim(), data.desc || '', data.event_date || '',
          data.event_time || '', data.location || '', data.image_url || '',
          data.is_published ?? true, req.params.id]
      );
      if (result.affectedRows === 0) {
        const [existing] = await pool.query('SELECT id FROM cultura WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'No se encontró el evento cultural.' });
      }
      return res.json(await getAllCultura());
    } catch (error) {
      console.error('Error al actualizar evento cultural en MySQL:', error);
      return res.status(500).json({ error: 'Error al actualizar evento cultural.' });
    }
  },

  delete: async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM cultura WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'No se encontró el evento cultural.' });
      return res.json(await getAllCultura());
    } catch (error) {
      console.error('Error al eliminar evento cultural en MySQL:', error);
      return res.status(500).json({ error: 'Error al eliminar evento cultural.' });
    }
  }
};
