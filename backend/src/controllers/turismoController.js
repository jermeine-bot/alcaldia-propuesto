import { randomUUID } from 'node:crypto';
import pool from '../config/db.js';

const getAllTurismo = async () => {
  const [rows] = await pool.query('SELECT * FROM turismo ORDER BY display_order ASC, created_at ASC');
  return rows;
};

export const turismoController = {
  getAll: async (_req, res) => {
    try {
      return res.json(await getAllTurismo());
    } catch (error) {
      console.error('Error al consultar turismo en MySQL:', error);
      return res.status(500).json({ error: 'No se pudieron consultar los destinos turísticos.' });
    }
  },

  create: async (req, res) => {
    try {
      const data = req.body;
      if (!data.title?.trim()) {
        return res.status(400).json({ error: 'El título del destino es obligatorio.' });
      }
      const id = data.id || `turismo-${randomUUID()}`;
      await pool.query(
        `INSERT INTO turismo (id, img, title, \`desc\`, category, location, content, is_published, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, data.img || '', data.title.trim(), data.desc || '', data.category || '',
          data.location || '', data.content || '', data.is_published ?? true, Number(data.display_order) || 0]
      );
      return res.status(201).json(await getAllTurismo());
    } catch (error) {
      console.error('Error al registrar destino turístico en MySQL:', error);
      return res.status(500).json({ error: 'Error al registrar destino turístico.' });
    }
  },

  update: async (req, res) => {
    try {
      const data = req.body;
      if (!data.title?.trim()) {
        return res.status(400).json({ error: 'El título del destino es obligatorio.' });
      }
      const [result] = await pool.query(
        `UPDATE turismo SET img=?, title=?, \`desc\`=?, category=?, location=?, content=?, is_published=?, display_order=? WHERE id=?`,
        [data.img || '', data.title.trim(), data.desc || '', data.category || '',
          data.location || '', data.content || '', data.is_published ?? true,
          Number(data.display_order) || 0, req.params.id]
      );
      if (result.affectedRows === 0) {
        const [existing] = await pool.query('SELECT id FROM turismo WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'No se encontró el destino turístico.' });
      }
      return res.json(await getAllTurismo());
    } catch (error) {
      console.error('Error al actualizar destino turístico en MySQL:', error);
      return res.status(500).json({ error: 'Error al actualizar destino turístico.' });
    }
  },

  delete: async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM turismo WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'No se encontró el destino turístico.' });
      return res.json(await getAllTurismo());
    } catch (error) {
      console.error('Error al eliminar destino turístico en MySQL:', error);
      return res.status(500).json({ error: 'Error al eliminar destino turístico.' });
    }
  }
};
