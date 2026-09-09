import { db } from '../config/firebase.js';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore/lite';

let localAuditLogs = [
  {
    id: 'log-1',
    userEmail: 'admin@alcaldaleon.gob.ni',
    userName: 'Administrador General',
    action: 'INICIALIZACION_SISTEMA',
    module: 'Sistema',
    details: 'Sistema de bitácora de auditoría iniciado correctamente.',
    ip: '127.0.0.1',
    timestamp: new Date().toISOString()
  }
];

export const auditService = {
  logAction: async ({ req, user, action, module, details }) => {
    try {
      const userInfo = user || req?.user || { email: 'sistema@alcaldaleon.gob.ni', name: 'Sistema Automático' };
      const ip = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';

      const logEntry = {
        id: `log-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        userId: userInfo.id || 'system',
        userEmail: userInfo.email || 'desconocido',
        userName: userInfo.name || userInfo.email || 'Usuario',
        role: userInfo.role || 'admin',
        action,
        module,
        details: details || '',
        ip,
        timestamp: new Date().toISOString()
      };

      try {
        if (db) {
          await setDoc(doc(db, 'activity_logs', logEntry.id), logEntry);
        } else {
          localAuditLogs.unshift(logEntry);
        }
      } catch (fbErr) {
        localAuditLogs.unshift(logEntry);
      }

      console.log(`📜 [AUDIT LOG] ${logEntry.timestamp} | ${logEntry.userEmail} | ${action} | ${module}: ${details}`);
      return logEntry;
    } catch (error) {
      console.warn('⚠️ Error al guardar log de auditoría:', error.message);
    }
  },

  getLogs: async () => {
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, 'activity_logs'));
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
          return list;
        }
      }
      return localAuditLogs;
    } catch (error) {
      console.warn('⚠️ Error consultando logs en Firestore:', error.message);
      return localAuditLogs;
    }
  }
};
