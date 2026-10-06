import { facebookService, isFacebookConfigured } from '../services/facebookService.js';

export const facebookController = {
  syncNow: async (req, res) => {
    try {
      const result = await facebookService.syncPosts();
      return res.json(result);
    } catch (error) {
      console.error('Error al ejecutar sincronización de Facebook:', error);
      return res.status(500).json({ error: 'Error al ejecutar sincronización con Facebook.' });
    }
  },

  getStatus: (req, res) => {
    return res.json({
      configured: isFacebookConfigured(),
      page_id: process.env.FACEBOOK_PAGE_ID || 'No configurado',
      sync_interval: `${process.env.FACEBOOK_SYNC_MINUTES || 30} minutos`
    });
  }
};
