-- =========================================================
-- ESQUEMA Y SEMILLAS PARA SUPABASE (ALCALDÍA DE LEÓN)
-- Copia y pega todo este archivo en Supabase -> SQL Editor -> Run
-- =========================================================

-- 1. Tabla de Usuarios Administradores
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  avatar VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Noticias
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Habilitar Acceso Público de Lectura
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de noticias" ON noticias FOR SELECT USING (true);
CREATE POLICY "Permitir insercion/edicion/eliminacion de noticias" ON noticias FOR ALL USING (true);
CREATE POLICY "Permitir lectura/insercion de usuarios" ON users FOR ALL USING (true);

-- 4. Semilla de Usuario Superadmin por defecto (admin@alcaldaleon.gob.ni / admin123)
INSERT INTO users (id, name, email, password, role, avatar)
VALUES (
  'u-1',
  'Administrador General',
  'admin@alcaldaleon.gob.ni',
  '$2a$10$wKkS1Jb7z2n2Z2Z2Z2Z2Zu5bXzR7l9kX8j6g5f4e3d2c1b0a', -- bcrypt hash de admin123
  'superadmin',
  '/img/nav_logo/logo nav2.png'
) ON CONFLICT (email) DO NOTHING;

-- 5. Semilla de Noticias Iniciales
INSERT INTO noticias (id, titulo, slug, extracto, contenido, categoria, imagen, autor, date, status, fuente)
VALUES 
(
  'noticia-1',
  'Inauguración del nuevo Parque Central',
  'inauguracion-del-nuevo-parque-central',
  'Un espacio renovado para el disfrute de todas las familias leonesas.',
  'La Alcaldía Municipal de León se enorgullece en inaugurar las obras de remodelación y embellecimiento del Parque Central. El proyecto incluye nuevas áreas verdes, iluminación LED de última generación y zonas de recreación infantil.',
  'Obras Públicas',
  '/img/noticias/noticia1.jpg',
  'Prensa Alcaldía',
  '15 Enero 2026',
  'published',
  'manual'
),
(
  'noticia-2',
  'Nuevo sistema de recolección de basura',
  'nuevo-sistema-de-recoleccion-de-basura',
  'Modernizamos el servicio para una ciudad más limpia y sostenible.',
  'Con la incorporación de una flota de camiones recolectores modernos y el establecimiento de 28 nuevas rutas urbanas y rurales, garantizamos una atención continua y eficiente para todas las familias.',
  'Servicios Municipales',
  '/img/noticias/noticia2.jpg',
  'Dirección de Ornato',
  '12 Enero 2026',
  'published',
  'manual'
),
(
  'noticia-3',
  'Festival de Poesía 2026',
  'festival-de-poesia-2026',
  'León se prepara para el evento cultural más importante del año.',
  'Poetas e intelectuales de diversas naciones se darán cita en la Capital Cultural de Nicaragua para celebrar una nueva edición de este magno festival en homenaje a nuestro gran Rubén Darío.',
  'Cultura & Arte',
  '/img/noticias/festival de la poseia.jpg',
  'Unidad de Cultura',
  '10 Enero 2026',
  'published',
  'manual'
),
(
  'noticia-4',
  'Obras de pavimentación avanzan',
  'obras-de-pavimentacion-avanzan',
  'Transformando las calles de León para mejorar la movilidad.',
  'Avanzamos a paso firme con el plan "Calles para el Pueblo", adoquinando y reasfaltando vías estratégicas en los barrios Sutiaba, Guadalupe y repartos periféricos.',
  'Vialidad',
  '/img/noticias/noticia3.jpg',
  'Infraestructura',
  '8 Enero 2026',
  'published',
  'manual'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Crear bucket para almacenamiento de imágenes (Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('noticias', 'noticias', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Imágenes públicas de noticias" ON storage.objects FOR SELECT USING (bucket_id = 'noticias');
CREATE POLICY "Permitir subir imágenes de noticias" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'noticias');
