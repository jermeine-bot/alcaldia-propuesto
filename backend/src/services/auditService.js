import { randomUUID } from 'node:crypto';
import pool from '../config/db.js';

export const auditService = {
  logAction: async ({ req, user, action, module, details }) => {
    const userInfo = user || req?.user || {
      email: 'sistema@alcaldaleon.gob.ni',
      name: 'Sistema Automático'
    };
    const forwardedFor = req?.headers?.['x-forwarded-for'];
    const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]) || req?.ip || null;
    const logEntry = {
      id: `log-${randomUUID()}`,
      userId: userInfo.id || 'system',
      userEmail: userInfo.email || 'desconocido',
      userName: userInfo.name || userInfo.email || 'Usuario',
      role: userInfo.role || 'admin',
      action,
      module,
      details: details || '',
      ip,
      timestamp: new Date()
    };

    await pool.query(
      `INSERT INTO activity_logs (id, userId, userEmail, userName, role, action, module, details, ip, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [logEntry.id, logEntry.userId, logEntry.userEmail, logEntry.userName, logEntry.role,
        logEntry.action, logEntry.module, logEntry.details, logEntry.ip, logEntry.timestamp]
    );
    return logEntry;
  },

  getLogs: async (limit = 100) => {
    const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 100, 1), 500);
    const [rows] = await pool.query(
      'SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?',
      [safeLimit]
    );
    return rows;
  }
};
