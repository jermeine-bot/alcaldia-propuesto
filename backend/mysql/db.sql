-- Esquema principal de la base alcaldia_leon.
-- El backend ejecuta estas instrucciones al iniciar. Todo usa IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
);

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
);

CREATE TABLE IF NOT EXISTS proyectos (
  id VARCHAR(255) PRIMARY KEY,
  img TEXT,
  category VARCHAR(100),
  status VARCHAR(50),
  isCompleted BOOLEAN DEFAULT FALSE,
  title VARCHAR(500),
  `desc` TEXT,
  detailed_desc TEXT,
  location VARCHAR(255),
  cost VARCHAR(100),
  progress INT DEFAULT 0,
  startDate VARCHAR(100),
  beneficiaries VARCHAR(255),
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS turismo (
  id VARCHAR(255) PRIMARY KEY,
  img TEXT,
  title VARCHAR(500),
  `desc` TEXT,
  category VARCHAR(100),
  location VARCHAR(255),
  content TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cultura (
  id VARCHAR(255) PRIMARY KEY,
  icon VARCHAR(100),
  title VARCHAR(500),
  `desc` TEXT,
  event_date VARCHAR(100),
  event_time VARCHAR(100),
  location VARCHAR(255),
  image_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
);

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
);

CREATE TABLE IF NOT EXISTS servicios (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255),
  subtitle VARCHAR(255),
  icon VARCHAR(100),
  color VARCHAR(20),
  badgeIcon VARCHAR(100),
  `desc` TEXT,
  count INT DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subservicios (
  id VARCHAR(255) PRIMARY KEY,
  servicio_id VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  `desc` TEXT,
  icon VARCHAR(100),
  link VARCHAR(500),
  linkText VARCHAR(255),
  linkUrl VARCHAR(500),
  FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS servicios_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
  eyebrow VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  phone VARCHAR(50)
);

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
);

CREATE TABLE IF NOT EXISTS cms_content (
  id VARCHAR(100) PRIMARY KEY,
  content JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
