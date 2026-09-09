import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/alcaldia_leon',
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'alcaldia_leon',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Semilla de datos iniciales si la tabla está vacía
const seedData = async () => {
  try {
    // 1. Verificar/Crear Usuario Superadmin
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@alcaldaleon.gob.ni']);
    if (userRes.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        `INSERT INTO users (id, name, email, password, role, avatar)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['u-1', 'Administrador General', 'admin@alcaldaleon.gob.ni', hashedPassword, 'superadmin', '/img/nav_logo/logo nav2.png']
      );
      console.log('✅ Usuario superadmin creado por defecto (admin@alcaldaleon.gob.ni)');
    }

    // 2. Verificar/Crear Noticias por Defecto
    const noticiasRes = await pool.query('SELECT COUNT(*) FROM noticias');
    if (parseInt(noticiasRes.rows[0].count, 10) === 0) {
      const initialNoticias = [
        {
          id: 'noticia-1',
          titulo: 'Inauguración del nuevo Parque Central',
          slug: 'inauguracion-del-nuevo-parque-central',
          extracto: 'Un espacio renovado para el disfrute de todas las familias leonesas.',
          contenido: 'La Alcaldía Municipal de León se enorgullece en inaugurar las obras de remodelación y embellecimiento del Parque Central. El proyecto incluye nuevas áreas verdes, iluminación LED de última generación y zonas de recreación infantil.',
          categoria: 'Obras Públicas',
          imagen: '/img/noticias/noticia1.jpg',
          autor: 'Prensa Alcaldía',
          date: '15 Enero 2026',
          status: 'published',
          fuente: 'manual'
        },
        {
          id: 'noticia-2',
          titulo: 'Nuevo sistema de recolección de basura',
          slug: 'nuevo-sistema-de-recoleccion-de-basura',
          extracto: 'Modernizamos el servicio para una ciudad más limpia y sostenible.',
          contenido: 'Con la incorporación de una flota de camiones recolectores modernos y el establecimiento de 28 nuevas rutas urbanas y rurales, garantizamos una atención continua y eficiente para todas las familias.',
          categoria: 'Servicios Municipales',
          imagen: '/img/noticias/noticia2.jpg',
          autor: 'Dirección de Ornato',
          date: '12 Enero 2026',
          status: 'published',
          fuente: 'manual'
        },
        {
          id: 'noticia-3',
          titulo: 'Festival de Poesía 2026',
          slug: 'festival-de-poesia-2026',
          extracto: 'León se prepara para el evento cultural más importante del año.',
          contenido: 'Poetas e intelectuales de diversas naciones se darán cita en la Capital Cultural de Nicaragua para celebrar una nueva edición de este magno festival en homenaje a nuestro gran Rubén Darío.',
          categoria: 'Cultura & Arte',
          imagen: '/img/noticias/festival de la poseia.jpg',
          autor: 'Unidad de Cultura',
          date: '10 Enero 2026',
          status: 'published',
          fuente: 'manual'
        },
        {
          id: 'noticia-4',
          titulo: 'Obras de pavimentación avanzan',
          slug: 'obras-de-pavimentacion-avanzan',
          extracto: 'Transformando las calles de León para mejorar la movilidad.',
          contenido: 'Avanzamos a paso firme con el plan "Calles para el Pueblo", adoquinando y reasfaltando vías estratégicas en los barrios Sutiaba, Guadalupe y repartos periféricos.',
          categoria: 'Vialidad',
          imagen: '/img/noticias/noticia3.jpg',
          autor: 'Infraestructura',
          date: '8 Enero 2026',
          status: 'published',
          fuente: 'manual'
        }
      ];

      for (const n of initialNoticias) {
        await pool.query(
          `INSERT INTO noticias (id, titulo, slug, extracto, contenido, categoria, imagen, autor, date, status, fuente)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [n.id, n.titulo, n.slug, n.extracto, n.contenido, n.categoria, n.imagen, n.autor, n.date, n.status, n.fuente]
        );
      }
      console.log('✅ Noticias iniciales sembradas en la base de datos.');
    }
  } catch (err) {
    console.error('Error durante la siembra de datos iniciales:', err.message);
  }
};

// Inicializar tablas en la BD
export const initDb = async () => {
  try {
    // Probar conexión
    await pool.query('SELECT NOW()');
    console.log('🐘 Conectado exitosamente a PostgreSQL.');

    // Crear tabla users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        avatar VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla noticias
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('📋 Tablas `users` y `noticias` verificadas/creadas.');
    await seedData();
  } catch (error) {
    console.warn('⚠️ No se pudo conectar a PostgreSQL:', error.message);
    console.warn('ℹ️ Asegúrate de tener PostgreSQL ejecutándose en el puerto 5432 o configura DATABASE_URL en .env.');
  }
};

export default pool;
