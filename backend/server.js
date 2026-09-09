import app from './src/app.js';
import { initDb } from './src/config/db.js';
import { facebookService } from './src/services/facebookService.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await initDb();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend corriendo en: http://localhost:${PORT}`);
    console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔷 Módulo de Sincronización con Facebook Graph API Activo.`);

    // Sincronización automática periódica (Cada 30 minutos por defecto)
    const syncIntervalMinutes = parseInt(process.env.FACEBOOK_SYNC_MINUTES || '30', 10);
    setInterval(async () => {
      console.log('🔄 Ejecutando sincronización automática programada con Facebook...');
      await facebookService.syncPosts();
    }, syncIntervalMinutes * 60 * 1000);
  });
};

startServer();
