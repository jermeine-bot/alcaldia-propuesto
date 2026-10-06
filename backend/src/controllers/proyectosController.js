import { randomUUID } from 'node:crypto';
import pool from '../config/db.js';

const getAllProyectos = async () => {
  const [rows] = await pool.query('SELECT * FROM proyectos ORDER BY created_at DESC');
  return rows;
};

export const proyectosController = {
  getAll: async (_req, res) => {
    try {
      return res.json(await getAllProyectos());
    } catch (error) {
      console.error('Error al consultar proyectos en MySQL:', error);
      return res.status(500).json({ error: 'No se pudieron consultar los proyectos.' });
    }
  },

  create: async (req, res) => {
    try {
      const data = req.body;
      if (!data.title?.trim()) {
        return res.status(400).json({ error: 'El título del proyecto es obligatorio.' });
      }
      const id = data.id || `proyecto-${randomUUID()}`;
      const progress = Number(data.progress) || 0;
      const isCompleted = progress === 100;
      await pool.query(
        `INSERT INTO proyectos (id, img, category, status, isCompleted, title, \`desc\`, detailed_desc, location, cost, progress, startDate, beneficiaries, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, data.img || '', data.category || '', isCompleted ? 'Completado' : 'En Progreso',
          isCompleted, data.title.trim(), data.desc || '', data.detailed_desc || '', data.location || '',
          data.cost || '', progress, data.startDate || '', data.beneficiaries || '', data.is_published ?? true]
      );
      return res.status(201).json(await getAllProyectos());
    } catch (error) {
      console.error('Error al registrar proyecto en MySQL:', error);
      return res.status(500).json({ error: 'Error al registrar el proyecto.' });
    }
  },

  update: async (req, res) => {
    try {
      const data = req.body;
      if (!data.title?.trim()) {
        return res.status(400).json({ error: 'El título del proyecto es obligatorio.' });
      }
      const progress = Number(data.progress) || 0;
      const isCompleted = progress === 100;
      const [result] = await pool.query(
        `UPDATE proyectos SET img=?, category=?, status=?, isCompleted=?, title=?, \`desc\`=?, detailed_desc=?,
         location=?, cost=?, progress=?, startDate=?, beneficiaries=?, is_published=? WHERE id=?`,
        [data.img || '', data.category || '', isCompleted ? 'Completado' : 'En Progreso', isCompleted,
          data.title.trim(), data.desc || '', data.detailed_desc || '', data.location || '', data.cost || '',
          progress, data.startDate || '', data.beneficiaries || '', data.is_published ?? true, req.params.id]
      );
      if (result.affectedRows === 0) {
        const [existing] = await pool.query('SELECT id FROM proyectos WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'No se encontró el proyecto.' });
      }
      return res.json(await getAllProyectos());
    } catch (error) {
      console.error('Error al actualizar proyecto en MySQL:', error);
      return res.status(500).json({ error: 'Error al actualizar el proyecto.' });
    }
  },

  delete: async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM proyectos WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'No se encontró el proyecto.' });
      return res.json(await getAllProyectos());
    } catch (error) {
      console.error('Error al eliminar proyecto en MySQL:', error);
      return res.status(500).json({ error: 'Error al eliminar el proyecto.' });
    }
  }
};
