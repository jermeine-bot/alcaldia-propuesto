import { randomUUID } from 'node:crypto';
import pool from '../config/db.js';

const getStats = async () => {
  const [rows] = await pool.query('SELECT * FROM stats ORDER BY display_order ASC, created_at ASC');
  return rows;
};

export const statsController = {
  getAll: async (_req, res) => {
    try {
      return res.json(await getStats());
    } catch (error) {
      console.error('Error al consultar estadísticas en MySQL:', error);
      return res.status(500).json({ error: 'No se pudieron consultar las estadísticas.' });
    }
  },

  create: async (req, res) => {
    try {
      const data = req.body;
      const id = data.id || `stat-${randomUUID()}`;
      await pool.query(
        `INSERT INTO stats (id, icon, number, suffix, title, subtitle, category, badge, percentage, color, description, breakdown, is_published, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, data.icon || null, Number(data.number) || 0, data.suffix || '', data.title || '',
          data.subtitle || '', data.category || '', data.badge || '', Number(data.percentage) || 0,
          data.color || '', data.description || '', JSON.stringify(data.breakdown || []),
          data.is_published ?? true, Number(data.display_order) || 0]
      );
      return res.status(201).json(await getStats());
    } catch (error) {
      console.error('Error al registrar estadística en MySQL:', error);
      return res.status(500).json({ error: 'Error al registrar estadística.' });
    }
  },

  update: async (req, res) => {
    try {
      const data = req.body;
      const [existing] = await pool.query('SELECT id FROM stats WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'No se encontró la estadística.' });
      }
      await pool.query(
        `UPDATE stats SET icon=?, number=?, suffix=?, title=?, subtitle=?, category=?, badge=?, percentage=?,
         color=?, description=?, breakdown=?, is_published=?, display_order=? WHERE id=?`,
        [data.icon || null, Number(data.number) || 0, data.suffix || '', data.title || '',
          data.subtitle || '', data.category || '', data.badge || '', Number(data.percentage) || 0,
          data.color || '', data.description || '', JSON.stringify(data.breakdown || []),
          data.is_published ?? true, Number(data.display_order) || 0, req.params.id]
      );
      return res.json(await getStats());
    } catch (error) {
      console.error('Error al actualizar estadística en MySQL:', error);
      return res.status(500).json({ error: 'Error al actualizar estadística.' });
    }
  },

  delete: async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM stats WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'No se encontró la estadística.' });
      }
      return res.json(await getStats());
    } catch (error) {
      console.error('Error al eliminar estadística en MySQL:', error);
      return res.status(500).json({ error: 'Error al eliminar estadística.' });
    }
  }
};
