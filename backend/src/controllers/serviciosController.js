import { randomUUID } from 'node:crypto';
import pool from '../config/db.js';

const readServices = async () => {
  const [services] = await pool.query(
    'SELECT * FROM servicios ORDER BY display_order ASC, created_at ASC'
  );
  if (services.length === 0) return [];

  const ids = services.map(service => service.id);
  const [options] = await pool.query(
    `SELECT id, servicio_id, title, \`desc\`, icon, linkText, linkUrl
     FROM subservicios WHERE servicio_id IN (${ids.map(() => '?').join(', ')}) ORDER BY id ASC`,
    ids
  );
  const byService = new Map();
  for (const option of options) {
    const { servicio_id: serviceId, ...data } = option;
    const list = byService.get(serviceId) || [];
    list.push(data);
    byService.set(serviceId, list);
  }
  return services.map(service => ({
    ...service,
    opciones: byService.get(service.id) || [],
    count: byService.get(service.id)?.length || 0
  }));
};

const getOptions = (options = []) => Array.isArray(options) ? options : [];

const saveOptions = async (connection, serviceId, options) => {
  await connection.query('DELETE FROM subservicios WHERE servicio_id = ?', [serviceId]);
  for (const option of options) {
    await connection.query(
      `INSERT INTO subservicios (id, servicio_id, title, \`desc\`, icon, linkText, linkUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [option.id || `opcion-${randomUUID()}`, serviceId, option.title || '',
        option.desc || '', option.icon || '', option.linkText || '', option.linkUrl || '']
    );
  }
};

const sendError = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({ error: message });
};

export const serviciosController = {
  getSettings: async (_req, res) => {
    try {
      const [rows] = await pool.query('SELECT eyebrow, title, description, phone FROM servicios_settings WHERE id = ?', ['main']);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No se encontró la configuración de servicios.' });
      }
      return res.json(rows[0]);
    } catch (error) {
      return sendError(res, error, 'No se pudo consultar la configuración de servicios.');
    }
  },

  updateSettings: async (req, res) => {
    try {
      const settings = {
        eyebrow: String(req.body.eyebrow || '').trim(),
        title: String(req.body.title || '').trim(),
        description: String(req.body.description || '').trim(),
        phone: String(req.body.phone || '').trim()
      };
      if (Object.values(settings).some(value => !value)) {
        return res.status(400).json({ error: 'Completa todos los campos de la sección.' });
      }
      await pool.query(
        `INSERT INTO servicios_settings (id, eyebrow, title, description, phone)
         VALUES ('main', ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE eyebrow=VALUES(eyebrow), title=VALUES(title),
         description=VALUES(description), phone=VALUES(phone)`,
        [settings.eyebrow, settings.title, settings.description, settings.phone]
      );
      return res.json(settings);
    } catch (error) {
      return sendError(res, error, 'No se pudo actualizar la sección de servicios.');
    }
  },

  getAll: async (_req, res) => {
    try {
      return res.json(await readServices());
    } catch (error) {
      return sendError(res, error, 'No se pudieron consultar los servicios.');
    }
  },

  create: async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const data = req.body;
      if (!data.title || !data.subtitle) {
        return res.status(400).json({ error: 'El título y el subtítulo son obligatorios.' });
      }
      const id = `servicio-${randomUUID()}`;
      await connection.beginTransaction();
      const [rows] = await connection.query('SELECT COUNT(*) AS total FROM servicios');
      await connection.query(
        `INSERT INTO servicios (id, title, subtitle, icon, color, badgeIcon, \`desc\`, display_order, count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, data.title, data.subtitle, data.icon || '', data.color || '', data.badgeIcon || '',
          data.desc || '', rows[0].total, getOptions(data.opciones).length]
      );
      await saveOptions(connection, id, getOptions(data.opciones));
      await connection.commit();
      return res.status(201).json(await readServices());
    } catch (error) {
      if (connection) await connection.rollback();
      return sendError(res, error, 'No se pudo crear la categoría de servicios.');
    } finally {
      connection?.release();
    }
  },

  update: async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { id } = req.params;
      const data = req.body;
      if (!data.title || !data.subtitle) {
        return res.status(400).json({ error: 'El título y el subtítulo son obligatorios.' });
      }
      await connection.beginTransaction();
      const [existing] = await connection.query('SELECT id FROM servicios WHERE id = ?', [id]);
      if (existing.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'No se encontró la categoría de servicios.' });
      }
      await connection.query(
        `UPDATE servicios SET title=?, subtitle=?, icon=?, color=?, badgeIcon=?, \`desc\`=? WHERE id=?`,
        [data.title, data.subtitle, data.icon || '', data.color || '', data.badgeIcon || '', data.desc || '', id]
      );
      if (Array.isArray(data.opciones)) await saveOptions(connection, id, data.opciones);
      const [[{ total }]] = await connection.query(
        'SELECT COUNT(*) AS total FROM subservicios WHERE servicio_id = ?',
        [id]
      );
      await connection.query('UPDATE servicios SET count = ? WHERE id = ?', [total, id]);
      await connection.commit();
      return res.json(await readServices());
    } catch (error) {
      if (connection) await connection.rollback();
      return sendError(res, error, 'No se pudo actualizar la categoría de servicios.');
    } finally {
      connection?.release();
    }
  },

  delete: async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM servicios WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'No se encontró la categoría de servicios.' });
      }
      return res.json(await readServices());
    } catch (error) {
      return sendError(res, error, 'No se pudo eliminar la categoría de servicios.');
    }
  },

  saveSubservicio: async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { id: serviceId } = req.params;
      const data = req.body;
      if (!data.title || !data.desc) {
        return res.status(400).json({ error: 'El nombre y la descripción del trámite son obligatorios.' });
      }
      const optionId = data.id || `opcion-${randomUUID()}`;
      await connection.beginTransaction();
      const [services] = await connection.query('SELECT id FROM servicios WHERE id = ?', [serviceId]);
      if (services.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'No se encontró la categoría de servicios.' });
      }
      if (req.method === 'PUT') {
        const [existingOptions] = await connection.query(
          'SELECT id FROM subservicios WHERE id = ? AND servicio_id = ?',
          [optionId, serviceId]
        );
        if (existingOptions.length === 0) {
          await connection.rollback();
          return res.status(404).json({ error: 'No se encontró el trámite o servicio.' });
        }
      }
      await connection.query(
        `INSERT INTO subservicios (id, servicio_id, title, \`desc\`, icon, linkText, linkUrl)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title=VALUES(title), \`desc\`=VALUES(\`desc\`),
         icon=VALUES(icon), linkText=VALUES(linkText), linkUrl=VALUES(linkUrl)`,
        [optionId, serviceId, data.title, data.desc, data.icon || '', data.linkText || '', data.linkUrl || '']
      );
      await connection.query(
        'UPDATE servicios SET count = (SELECT COUNT(*) FROM subservicios WHERE servicio_id = ?) WHERE id = ?',
        [serviceId, serviceId]
      );
      await connection.commit();
      return res.json(await readServices());
    } catch (error) {
      if (connection) await connection.rollback();
      return sendError(res, error, 'No se pudo guardar el trámite o servicio.');
    } finally {
      connection?.release();
    }
  },

  deleteSubservicio: async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { id: serviceId, subservicioId } = req.params;
      await connection.beginTransaction();
      const [services] = await connection.query('SELECT id FROM servicios WHERE id = ?', [serviceId]);
      if (services.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'No se encontró la categoría de servicios.' });
      }
      await connection.query(
        'DELETE FROM subservicios WHERE id = ? AND servicio_id = ?',
        [subservicioId, serviceId]
      );
      await connection.query(
        'UPDATE servicios SET count = (SELECT COUNT(*) FROM subservicios WHERE servicio_id = ?) WHERE id = ?',
        [serviceId, serviceId]
      );
      await connection.commit();
      return res.json(await readServices());
    } catch (error) {
      if (connection) await connection.rollback();
      return sendError(res, error, 'No se pudo eliminar el trámite o servicio.');
    } finally {
      connection?.release();
    }
  }
};
