import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { readFile } from 'node:fs/promises';
import {
  initialCentrosAtencionData,
  initialCulturaData,
  initialProyectosData,
  initialRedesSocialesData,
  initialServiciosData,
  initialServiciosSettings,
  initialStatsData,
  initialTurismoData
} from '../../../src/services/initialData.js';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'alcaldia_leon',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const seedRows = async (table, fields, rows) => {
  const sql = `INSERT IGNORE INTO \`${table}\` (${fields.map(field => `\`${field}\``).join(', ')})
    VALUES (${fields.map(() => '?').join(', ')})`;
  for (const row of rows) {
    await pool.query(sql, fields.map(field => (
      field === 'breakdown' ? JSON.stringify(row[field] || []) : row[field] ?? null
    )));
  }
};

const seedData = async () => {
  try {
    // 1. Usuario Superadmin
    const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@alcaldaleon.gob.ni']);
    if (userRows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)',
        ['u-1', 'Administrador General', 'admin@alcaldaleon.gob.ni', hashedPassword, 'superadmin', '/img/nav_logo/logo nav2.png']
      );
      console.log('✅ Usuario superadmin creado por defecto (admin@alcaldaleon.gob.ni)');
    }

    // 2. Hero
    const [heroRows] = await pool.query('SELECT id FROM hero WHERE id = ?', ['hero-1']);
    if (heroRows.length === 0) {
      await pool.query(
        `INSERT INTO hero (id, title, subtitle, video_url, fallback_image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['hero-1', 'Bienvenidos a la Alcaldía Municipal de León',
         'Construyendo juntos el futuro de nuestra ciudad, con transparencia, innovación y compromiso con cada leonés.',
         '/video/leon nicaragua vista de un dron.mp4', '/img/hero-bg.jpg',
         'Conoce León', '#turismo', 'Servicios Rápidos', '#servicios', true]
      );
      console.log('✅ Datos de Hero sembrados.');
    }

    // 3. Contacto
    const [contactoRows] = await pool.query('SELECT id FROM contacto WHERE id = ?', ['contacto-1']);
    if (contactoRows.length === 0) {
      await pool.query(
        `INSERT INTO contacto (id, address, phone, secondary_phone, email, schedule, facebook_url, instagram_url, tiktok_url, youtube_url, twitter_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['contacto-1', 'Palacio Municipal, Frente al Parque Central, León, Nicaragua',
         '+505 2315-0000', '+505 2315-1111', 'info@alcaldaleon.gob.ni',
         'Lunes a Viernes: 8:00 AM - 4:00 PM',
         'https://www.facebook.com/share/1EJ2g1UpjY/',
         'https://www.instagram.com/alcaldia_leon',
         'https://www.tiktok.com/@leonalcaldia',
         'https://www.youtube.com/@AlcaldiaLeon',
         'https://twitter.com/alcaldia_leon']
      );
      console.log('✅ Datos de contacto sembrados.');
    }

    // 4. Noticias
    const [noticiasCount] = await pool.query('SELECT COUNT(*) as cnt FROM noticias');
    if (noticiasCount[0].cnt === 0) {
      const noticias = [
        ['noticia-1', 'Inauguración del nuevo Parque Central', 'inauguracion-del-nuevo-parque-central',
         'Un espacio renovado para el disfrute de todas las familias leonesas.',
         'La Alcaldía Municipal de León se enorgullece en inaugurar las obras de remodelación y embellecimiento del Parque Central. El proyecto incluye nuevas áreas verdes, iluminación LED de última generación y zonas de recreación infantil.',
         'Obras Públicas', '/img/noticias/noticia1.jpg', 'Prensa Alcaldía', '15 Enero 2026', 'published', 'manual'],
        ['noticia-2', 'Nuevo sistema de recolección de basura', 'nuevo-sistema-de-recoleccion-de-basura',
         'Modernizamos el servicio para una ciudad más limpia y sostenible.',
         'Con la incorporación de una flota de camiones recolectores modernos y el establecimiento de 28 nuevas rutas urbanas y rurales, garantizamos una atención continua y eficiente para todas las familias.',
         'Servicios Municipales', '/img/noticias/noticia2.jpg', 'Dirección de Ornato', '12 Enero 2026', 'published', 'manual'],
        ['noticia-3', 'Festival de Poesía 2026', 'festival-de-poesia-2026',
         'León se prepara para el evento cultural más importante del año.',
         'Poetas e intelectuales de diversas naciones se darán cita en la Capital Cultural de Nicaragua para celebrar una nueva edición de este magno festival en homenaje a nuestro gran Rubén Darío.',
         'Cultura & Arte', '/img/noticias/festival de la poseia.jpg', 'Unidad de Cultura', '10 Enero 2026', 'published', 'manual'],
        ['noticia-4', 'Obras de pavimentación avanzan', 'obras-de-pavimentacion-avanzan',
         'Transformando las calles de León para mejorar la movilidad.',
         'Avanzamos a paso firme con el plan "Calles para el Pueblo", adoquinando y reasfaltando vías estratégicas en los barrios Sutiaba, Guadalupe y repartos periféricos.',
         'Vialidad', '/img/noticias/noticia3.jpg', 'Infraestructura', '8 Enero 2026', 'published', 'manual']
      ];
      for (const n of noticias) {
        await pool.query(
          `INSERT INTO noticias (id, titulo, slug, extracto, contenido, categoria, imagen, autor, date, status, fuente)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, n
        );
      }
      console.log('✅ Noticias iniciales sembradas.');
    }

    // 5. Servicios Settings
    const [settingsRows] = await pool.query('SELECT id FROM servicios_settings WHERE id = ?', ['main']);
    if (settingsRows.length === 0) {
      await pool.query(
        'INSERT INTO servicios_settings (id, eyebrow, title, description, phone) VALUES (?, ?, ?, ?, ?)',
        ['main', initialServiciosSettings.eyebrow, initialServiciosSettings.title,
          initialServiciosSettings.description, initialServiciosSettings.phone]
      );
      console.log('✅ Configuración de servicios sembrada.');
    }

    await seedRows('proyectos',
      ['id', 'img', 'category', 'status', 'isCompleted', 'title', 'desc', 'detailed_desc', 'location', 'cost', 'progress', 'startDate', 'beneficiaries', 'is_published'],
      initialProyectosData);
    await seedRows('turismo',
      ['id', 'img', 'title', 'desc', 'category', 'location', 'content', 'is_published', 'display_order'],
      initialTurismoData);
    await seedRows('cultura',
      ['id', 'icon', 'title', 'desc', 'event_date', 'event_time', 'location', 'image_url', 'is_published'],
      initialCulturaData);
    await seedRows('stats',
      ['id', 'icon', 'number', 'suffix', 'title', 'subtitle', 'category', 'badge', 'percentage', 'color', 'description', 'breakdown', 'is_published', 'display_order'],
      initialStatsData);

    for (const [index, service] of initialServiciosData.entries()) {
      await pool.query(
        `INSERT IGNORE INTO servicios (id, title, subtitle, icon, color, badgeIcon, \`desc\`, count, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [service.id, service.title, service.subtitle, service.icon || '', service.color || '',
          service.badgeIcon || '', service.desc || '', service.opciones.length, index]
      );
      await seedRows('subservicios',
        ['id', 'servicio_id', 'title', 'desc', 'icon', 'linkText', 'linkUrl'],
        service.opciones.map(option => ({
          ...option,
          servicio_id: service.id,
          linkText: option.linkText || '',
          linkUrl: option.linkUrl || ''
        })));
    }

    await pool.query(
      'INSERT IGNORE INTO cms_content (id, content) VALUES (?, ?), (?, ?)',
      ['centros-atencion', JSON.stringify(initialCentrosAtencionData),
        'redes-sociales', JSON.stringify(initialRedesSocialesData)]
    );
  } catch (error) {
    console.error('Error durante la siembra de datos iniciales:', error);
    throw error;
  }
};

const ensureColumn = async (table, column, definition) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, column]
  );
  if (rows.length === 0) {
    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
};

export const initDb = async () => {
    await pool.query('SELECT 1');
    console.log('🐬 Conectado exitosamente a MySQL.');

    const schema = await readFile(new URL('../../mysql/db.sql', import.meta.url), 'utf8');
    const statements = schema.split(';').map(statement => statement.trim()).filter(Boolean);
    for (const statement of statements) {
      await pool.query(statement);
    }

    await ensureColumn('stats', 'description', 'TEXT');
    await ensureColumn('stats', 'breakdown', 'JSON');
    await ensureColumn('servicios', 'badgeIcon', 'VARCHAR(100)');
    await ensureColumn('servicios', 'desc', 'TEXT');
    await ensureColumn('subservicios', 'linkText', 'VARCHAR(255)');
    await ensureColumn('subservicios', 'linkUrl', 'VARCHAR(500)');
    await pool.query(
      `UPDATE subservicios SET linkUrl = link
       WHERE (linkUrl IS NULL OR linkUrl = '') AND link IS NOT NULL`
    );

    console.log('📋 Todas las tablas MySQL verificadas/creadas.');
    await seedData();
};

export default pool;
