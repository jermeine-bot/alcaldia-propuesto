import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        avatar VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS noticias (
        id VARCHAR(255) PRIMARY KEY,
        titulo VARCHAR(500) NOT NULL,
        slug VARCHAR(500),
        extracto TEXT,
        contenido TEXT,
        categoria VARCHAR(100),
        imagen TEXT,
        autor VARCHAR(255) DEFAULT 'Prensa Alcaldía',
        date VARCHAR(100),
        status VARCHAR(50) DEFAULT 'published',
        fuente VARCHAR(100) DEFAULT 'manual',
        url_externa VARCHAR(500),
        external_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT,
        subtitle TEXT,
        video_url TEXT,
        fallback_image_url TEXT,
        primary_btn_text VARCHAR(255),
        primary_btn_link VARCHAR(500),
        secondary_btn_text VARCHAR(255),
        secondary_btn_link VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS proyectos (
        id VARCHAR(255) PRIMARY KEY,
        img TEXT,
        category VARCHAR(100),
        status VARCHAR(50),
        isCompleted BOOLEAN DEFAULT FALSE,
        title VARCHAR(500),
        \`desc\` TEXT,
        detailed_desc TEXT,
        location VARCHAR(255),
        cost VARCHAR(100),
        progress INT DEFAULT 0,
        startDate VARCHAR(100),
        beneficiaries VARCHAR(255),
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS turismo (
        id VARCHAR(255) PRIMARY KEY,
        img TEXT,
        title VARCHAR(500),
        \`desc\` TEXT,
        category VARCHAR(100),
        location VARCHAR(255),
        content TEXT,
        is_published BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cultura (
        id VARCHAR(255) PRIMARY KEY,
        icon VARCHAR(100),
        title VARCHAR(500),
        \`desc\` TEXT,
        event_date VARCHAR(100),
        event_time VARCHAR(100),
        location VARCHAR(255),
        image_url TEXT,
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stats (
        id VARCHAR(255) PRIMARY KEY,
        icon VARCHAR(100),
        number BIGINT DEFAULT 0,
        suffix VARCHAR(50),
        title VARCHAR(255),
        subtitle TEXT,
        category VARCHAR(100),
        badge VARCHAR(100),
        percentage INT DEFAULT 0,
        color VARCHAR(20),
        description TEXT,
        breakdown JSON,
        is_published BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacto (
        id VARCHAR(255) PRIMARY KEY,
        address TEXT,
        phone VARCHAR(50),
        secondary_phone VARCHAR(50),
        email VARCHAR(255),
        schedule VARCHAR(255),
        facebook_url VARCHAR(500),
        instagram_url VARCHAR(500),
        tiktok_url VARCHAR(500),
        youtube_url VARCHAR(500),
        twitter_url VARCHAR(500),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS servicios (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255),
        subtitle VARCHAR(255),
        icon VARCHAR(100),
        color VARCHAR(20),
        badgeIcon VARCHAR(100),
        \`desc\` TEXT,
        count INT DEFAULT 0,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subservicios (
        id VARCHAR(255) PRIMARY KEY,
        servicio_id VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        \`desc\` TEXT,
        icon VARCHAR(100),
        link VARCHAR(500),
        linkText VARCHAR(255),
        linkUrl VARCHAR(500),
        FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS servicios_settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
        eyebrow VARCHAR(255),
        title VARCHAR(255),
        description TEXT,
        phone VARCHAR(50)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255),
        userEmail VARCHAR(255),
        userName VARCHAR(255),
        role VARCHAR(50),
        action VARCHAR(100),
        module VARCHAR(100),
        details TEXT,
        ip VARCHAR(100),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_content (
        id VARCHAR(100) PRIMARY KEY,
        content JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

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
