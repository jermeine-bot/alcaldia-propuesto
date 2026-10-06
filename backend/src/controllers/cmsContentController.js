import pool from '../config/db.js';

const parseContent = value => typeof value === 'string' ? JSON.parse(value) : value;

export const cmsContentController = {
  get: async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT content FROM cms_content WHERE id = ?', [req.params.contentId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No se encontró el contenido solicitado.' });
      }
      return res.json(parseContent(rows[0].content));
    } catch (error) {
      console.error('Error al consultar contenido CMS en MySQL:', error);
      return res.status(500).json({ error: 'No se pudo consultar el contenido.' });
    }
  },

  save: async (req, res) => {
    try {
      const { contentId } = req.params;
      const content = req.body;
      const isValid = contentId === 'centros-atencion'
        ? Array.isArray(content) && content.every(item => item && item.id)
        : contentId === 'redes-sociales' && content && typeof content === 'object'
          && typeof content.title === 'string' && Array.isArray(content.platforms);
      if (!isValid) {
        return res.status(400).json({ error: 'El formato del contenido no es válido.' });
      }

      await pool.query(
        `INSERT INTO cms_content (id, content) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE content = VALUES(content)`,
        [contentId, JSON.stringify(content)]
      );
      return res.json(content);
    } catch (error) {
      console.error('Error al guardar contenido CMS en MySQL:', error);
      return res.status(500).json({ error: 'No se pudo guardar el contenido.' });
    }
  }
};
