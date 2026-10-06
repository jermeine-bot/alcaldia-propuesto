import app from './src/app.js';
import { initDb } from './src/config/db.js';
import { facebookService, isFacebookConfigured } from './src/services/facebookService.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await initDb();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend corriendo en: http://localhost:${PORT}`);
    console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
    if (!isFacebookConfigured()) {
      console.log('ℹ️ Sincronización de Facebook deshabilitada: configura FACEBOOK_PAGE_ID y FACEBOOK_ACCESS_TOKEN.');
      return;
    }

    const configuredInterval = Number.parseInt(process.env.FACEBOOK_SYNC_MINUTES || '30', 10);
    const syncIntervalMinutes = Number.isFinite(configuredInterval) && configuredInterval > 0
      ? configuredInterval
      : 30;
    setInterval(async () => {
      console.log('🔄 Ejecutando sincronización automática programada con Facebook...');
      const result = await facebookService.syncPosts();
      if (!result.success) console.error('No se pudo sincronizar Facebook:', result.error);
    }, syncIntervalMinutes * 60 * 1000);
  });
};

startServer();
