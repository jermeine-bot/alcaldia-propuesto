import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import noticiasRoutes from './routes/noticiasRoutes.js';
import heroRoutes from './routes/heroRoutes.js';
import proyectosRoutes from './routes/proyectosRoutes.js';
import turismoRoutes from './routes/turismoRoutes.js';
import culturaRoutes from './routes/culturaRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import contactoRoutes from './routes/contactoRoutes.js';
import facebookRoutes from './routes/facebookRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import serviciosRoutes from './routes/serviciosRoutes.js';
import cmsContentRoutes from './routes/cmsContentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servidor estático para imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta Raíz Informativa
app.get('/', (req, res) => {
  res.json({
    app: 'API Backend - Alcaldía Municipal de León',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      noticias: '/api/noticias',
      facebook_sync: '/api/facebook/sync',
      audit_logs: '/api/audit-logs',
      users: '/api/users',
      hero: '/api/hero',
      proyectos: '/api/proyectos',
      turismo: '/api/turismo',
      cultura: '/api/cultura',
      stats: '/api/stats',
      contacto: '/api/contacto',
      cms: '/api/cms',
      auth: '/api/auth/login'
    }
  });
});

// Montaje de Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/turismo', turismoRoutes);
app.use('/api/cultura', culturaRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/cms', cmsContentRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend API Alcaldía de León funcionando con Seguridad Avanzada y Bitácora de Auditoría.',
    timestamp: new Date().toISOString()
  });
});

// Manejador 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.originalUrl} no encontrada en la API.` });
});

export default app;
