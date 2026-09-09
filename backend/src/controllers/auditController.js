import { auditService } from '../services/auditService.js';

export const auditController = {
  getLogs: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit || '100', 10);
      const logs = await auditService.getLogs(limit);
      return res.json(logs);
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener la bitácora de auditoría.' });
    }
  }
};
