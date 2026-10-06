import pool from '../config/db.js';

const HERO_ID = 'hero-1';

export const heroController = {
  getHero: async (_req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM hero WHERE id = ?', [HERO_ID]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No se encontró la configuración de portada.' });
      }
      return res.json(rows[0]);
    } catch (error) {
      console.error('Error al consultar portada en MySQL:', error);
      return res.status(500).json({ error: 'No se pudo consultar la configuración de portada.' });
    }
  },

  updateHero: async (req, res) => {
    try {
      const data = req.body;
      await pool.query(
        `INSERT INTO hero (id, title, subtitle, video_url, fallback_image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), video_url=VALUES(video_url),
         fallback_image_url=VALUES(fallback_image_url), primary_btn_text=VALUES(primary_btn_text),
         primary_btn_link=VALUES(primary_btn_link), secondary_btn_text=VALUES(secondary_btn_text),
         secondary_btn_link=VALUES(secondary_btn_link), is_active=VALUES(is_active)`,
        [HERO_ID, data.title, data.subtitle, data.video_url, data.fallback_image_url,
          data.primary_btn_text, data.primary_btn_link, data.secondary_btn_text,
          data.secondary_btn_link, data.is_active ?? true]
      );
      const [rows] = await pool.query('SELECT * FROM hero WHERE id = ?', [HERO_ID]);
      return res.json(rows[0]);
    } catch (error) {
      console.error('Error al actualizar portada en MySQL:', error);
      return res.status(500).json({ error: 'Error al actualizar la configuración de portada.' });
    }
  }
};
