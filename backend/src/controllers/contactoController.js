import pool from '../config/db.js';

const CONTACT_ID = 'contacto-1';
const CONTACT_FIELDS = [
  'address', 'phone', 'secondary_phone', 'email', 'schedule',
  'facebook_url', 'instagram_url', 'tiktok_url', 'youtube_url', 'twitter_url'
];

export const contactoController = {
  getContacto: async (_req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM contacto WHERE id = ?', [CONTACT_ID]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No se encontró la información de contacto.' });
      }
      return res.json(rows[0]);
    } catch (error) {
      console.error('Error al consultar contacto en MySQL:', error);
      return res.status(500).json({ error: 'No se pudo consultar la información de contacto.' });
    }
  },

  updateContacto: async (req, res) => {
    try {
      const values = CONTACT_FIELDS.map(field => req.body[field] ?? null);
      await pool.query(
        `INSERT INTO contacto (id, ${CONTACT_FIELDS.join(', ')}) VALUES (?, ${CONTACT_FIELDS.map(() => '?').join(', ')})
         ON DUPLICATE KEY UPDATE ${CONTACT_FIELDS.map(field => `${field} = VALUES(${field})`).join(', ')}`,
        [CONTACT_ID, ...values]
      );
      const [rows] = await pool.query('SELECT * FROM contacto WHERE id = ?', [CONTACT_ID]);
      return res.json(rows[0]);
    } catch (error) {
      console.error('Error al actualizar contacto en MySQL:', error);
      return res.status(500).json({ error: 'Error al actualizar información de contacto.' });
    }
  }
};
