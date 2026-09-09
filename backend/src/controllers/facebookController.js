import { facebookService } from '../services/facebookService.js';

export const facebookController = {
  syncNow: async (req, res) => {
    try {
      const result = await facebookService.syncPosts();
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Error al ejecutar sincronización con Facebook.' });
    }
  },

  getStatus: (req, res) => {
    const isConfigured = Boolean(
      process.env.FACEBOOK_PAGE_ID &&
      process.env.FACEBOOK_ACCESS_TOKEN &&
      !process.env.FACEBOOK_PAGE_ID.includes('tu_page_id')
    );

    return res.json({
      configured: isConfigured,
      page_id: process.env.FACEBOOK_PAGE_ID || 'No configurado',
      sync_interval: `${process.env.FACEBOOK_SYNC_MINUTES || 30} minutos`
    });
  }
};
