<?php

namespace Config;

use PDO;

class InitDb {
    public static function run(PDO $pdo): void {
        $driver = Database::getDriver();
        $isSqlite = ($driver === 'sqlite');

        // Definición de tablas compatibles con MySQL y SQLite
        if ($isSqlite) {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT DEFAULT 'admin',
                    avatar TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS noticias (
                    id TEXT PRIMARY KEY,
                    titulo TEXT NOT NULL,
                    slug TEXT,
                    extracto TEXT,
                    contenido TEXT,
                    categoria TEXT,
                    imagen TEXT,
                    autor TEXT DEFAULT 'Prensa Alcaldía',
                    date TEXT,
                    status TEXT DEFAULT 'published',
                    fuente TEXT DEFAULT 'manual',
                    url_externa TEXT,
                    linkUrl TEXT,
                    external_id TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS hero (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    subtitle TEXT,
                    video_url TEXT,
                    fallback_image_url TEXT,
                    primary_btn_text TEXT,
                    primary_btn_link TEXT,
                    secondary_btn_text TEXT,
                    secondary_btn_link TEXT,
                    badge_text TEXT DEFAULT 'Alcaldía Municipal de León',
                    is_active INTEGER DEFAULT 1,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS proyectos (
                    id TEXT PRIMARY KEY,
                    img TEXT,
                    category TEXT,
                    status TEXT,
                    isCompleted INTEGER DEFAULT 0,
                    title TEXT,
                    `desc` TEXT,
                    detailed_desc TEXT,
                    location TEXT,
                    cost TEXT,
                    progress INTEGER DEFAULT 0,
                    startDate TEXT,
                    beneficiaries TEXT,
                    linkUrl TEXT DEFAULT '',
                    is_published INTEGER DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS turismo (
                    id TEXT PRIMARY KEY,
                    img TEXT,
                    title TEXT,
                    `desc` TEXT,
                    category TEXT,
                    location TEXT,
                    content TEXT,
                    linkUrl TEXT DEFAULT '',
                    is_published INTEGER DEFAULT 1,
                    display_order INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS cultura (
                    id TEXT PRIMARY KEY,
                    icon TEXT,
                    title TEXT,
                    `desc` TEXT,
                    event_date TEXT,
                    event_time TEXT,
                    location TEXT,
                    image_url TEXT,
                    is_published INTEGER DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS stats (
                    id TEXT PRIMARY KEY,
                    icon TEXT,
                    number INTEGER DEFAULT 0,
                    suffix TEXT,
                    title TEXT,
                    subtitle TEXT,
                    category TEXT,
                    badge TEXT,
                    percentage INTEGER DEFAULT 0,
                    color TEXT,
                    description TEXT,
                    breakdown TEXT,
                    linkUrl TEXT DEFAULT '',
                    is_published INTEGER DEFAULT 1,
                    display_order INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS contacto (
                    id TEXT PRIMARY KEY,
                    address TEXT,
                    phone TEXT,
                    secondary_phone TEXT,
                    email TEXT,
                    schedule TEXT,
                    facebook_url TEXT,
                    instagram_url TEXT,
                    tiktok_url TEXT,
                    youtube_url TEXT,
                    twitter_url TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS servicios (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    subtitle TEXT,
                    icon TEXT,
                    color TEXT,
                    badgeIcon TEXT,
                    `desc` TEXT,
                    count INTEGER DEFAULT 0,
                    display_order INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS subservicios (
                    id TEXT PRIMARY KEY,
                    servicio_id TEXT NOT NULL,
                    title TEXT,
                    `desc` TEXT,
                    icon TEXT,
                    link TEXT,
                    linkText TEXT,
                    linkUrl TEXT,
                    requisitos TEXT,
                    departamento TEXT DEFAULT '',
                    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS servicios_settings (
                    id TEXT PRIMARY KEY DEFAULT 'main',
                    eyebrow TEXT,
                    title TEXT,
                    description TEXT,
                    phone TEXT
                );

                CREATE TABLE IF NOT EXISTS activity_logs (
                    id TEXT PRIMARY KEY,
                    userId TEXT,
                    userEmail TEXT,
                    userName TEXT,
                    role TEXT,
                    action TEXT,
                    module TEXT,
                    details TEXT,
                    ip TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS cms_content (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS anuncios (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    image TEXT NOT NULL,
                    linkUrl TEXT DEFAULT '',
                    buttonText TEXT DEFAULT 'Ver más información',
                    badge TEXT DEFAULT 'Aviso Importante',
                    is_active INTEGER DEFAULT 1,
                    display_order INTEGER DEFAULT 0,
                    start_date TEXT,
                    end_date TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS anuncio_portal (
                    id TEXT PRIMARY KEY,
                    content TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            ");
        } else {
            // MySQL Schema con soporte para anuncio_portal
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS anuncio_portal (
                    id VARCHAR(50) PRIMARY KEY,
                    content LONGTEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
            
            $schemaFile = dirname(__DIR__) . '/mysql/db.sql';
            if (file_exists($schemaFile)) {
                $sql = file_get_contents($schemaFile);
                $statements = array_filter(array_map('trim', explode(';', $sql)));
                foreach ($statements as $st) {
                    if (!empty($st)) {
                        $pdo->exec($st);
                    }
                }
            }
        }

        self::migrateSchema($pdo);
        self::applyProductionSeed($pdo);
        self::migrateLegacyAnnouncement($pdo);
        self::seedData($pdo);
    }

    private static function applyProductionSeed(PDO $pdo): void {
        $isSqlite = Database::getDriver() === 'sqlite';
        if ($isSqlite) {
            $pdo->exec("CREATE TABLE IF NOT EXISTS app_migrations (id TEXT PRIMARY KEY, applied_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
        } else {
            $pdo->exec("CREATE TABLE IF NOT EXISTS app_migrations (id VARCHAR(120) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        }

        $migrationId = 'production_backup_2026_10_20_v1';
        $check = $pdo->prepare('SELECT id FROM app_migrations WHERE id = ?');
        $check->execute([$migrationId]);
        if ($check->fetchColumn()) return;

        $seedFile = dirname(__DIR__) . '/data/production_seed.php';
        if (!is_file($seedFile)) return;
        $seed = require $seedFile;
        if (!is_array($seed)) throw new \RuntimeException('El respaldo inicial no es JSON válido.');

        $pdo->beginTransaction();
        try {
            foreach ($seed as $table => $rows) {
                if (!preg_match('/^[a-z_]+$/i', (string)$table) || !is_array($rows)) {
                    throw new \RuntimeException('El respaldo inicial contiene una tabla inválida.');
                }
                foreach ($rows as $row) {
                    if (!is_array($row) || !$row) continue;
                    $columns = array_keys($row);
                    foreach ($columns as $column) {
                        if (!preg_match('/^[a-z_][a-z0-9_]*$/i', (string)$column)) {
                            throw new \RuntimeException('El respaldo inicial contiene una columna inválida.');
                        }
                    }
                    $quotedColumns = implode(', ', array_map(static fn($column) => '`' . $column . '`', $columns));
                    $placeholders = implode(', ', array_fill(0, count($columns), '?'));
                    $verb = $isSqlite ? 'INSERT OR IGNORE' : 'INSERT IGNORE';
                    $insert = $pdo->prepare("{$verb} INTO `{$table}` ({$quotedColumns}) VALUES ({$placeholders})");
                    $insert->execute(array_values($row));
                }
            }

            $mark = $pdo->prepare('INSERT INTO app_migrations (id) VALUES (?)');
            $mark->execute([$migrationId]);
            $pdo->commit();
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('No se pudo importar el respaldo inicial: ' . $e->getMessage());
            throw $e;
        }
    }

    private static function migrateLegacyAnnouncement(PDO $pdo): void {
        try {
            $legacy = $pdo->query("SELECT content FROM anuncio_portal WHERE id = 'main'")->fetchColumn();
            if (!$legacy) return;

            $data = is_array($legacy) ? $legacy : json_decode((string)$legacy, true);
            if (!is_array($data) || empty($data['image'])) return;

            $insertPrefix = Database::getDriver() === 'sqlite' ? 'INSERT OR IGNORE' : 'INSERT IGNORE';
            $stmt = $pdo->prepare("{$insertPrefix} INTO anuncios (id, title, description, image, linkUrl, buttonText, badge, is_active, display_order, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                'legacy-main',
                $data['title'] ?? 'Aviso institucional',
                $data['description'] ?? '',
                $data['image'],
                $data['linkUrl'] ?? $data['link_url'] ?? '',
                $data['buttonText'] ?? $data['button_text'] ?? 'Ver más información',
                $data['badge'] ?? 'Aviso Importante',
                !empty($data['is_active'] ?? $data['isActive'] ?? true) ? 1 : 0,
                (int)($data['display_order'] ?? 0),
                $data['start_date'] ?? null,
                $data['end_date'] ?? null
            ]);
        } catch (\Throwable $e) {
            error_log('No se pudo migrar el anuncio legado: ' . $e->getMessage());
        }
    }

    private static function migrateSchema(PDO $pdo): void {
        try {
            $driver = Database::getDriver();
            $isSqlite = ($driver === 'sqlite');

            if ($isSqlite) {
                $tables = [
                    'noticias' => [
                        'linkUrl' => "ALTER TABLE noticias ADD COLUMN linkUrl TEXT DEFAULT ''",
                        'date' => "ALTER TABLE noticias ADD COLUMN date TEXT DEFAULT ''",
                        'url_externa' => "ALTER TABLE noticias ADD COLUMN url_externa TEXT DEFAULT ''"
                    ],
                    'subservicios' => [
                        'link' => "ALTER TABLE subservicios ADD COLUMN link TEXT DEFAULT ''",
                        'requisitos' => "ALTER TABLE subservicios ADD COLUMN requisitos TEXT DEFAULT ''",
                        'departamento' => "ALTER TABLE subservicios ADD COLUMN departamento TEXT DEFAULT ''"
                    ],
                    'proyectos' => [
                        'linkUrl' => "ALTER TABLE proyectos ADD COLUMN linkUrl TEXT DEFAULT ''"
                    ],
                    'turismo' => [
                        'linkUrl' => "ALTER TABLE turismo ADD COLUMN linkUrl TEXT DEFAULT ''"
                    ],
                    'stats' => [
                        'linkUrl' => "ALTER TABLE stats ADD COLUMN linkUrl TEXT DEFAULT ''"
                    ],
                    'hero' => [
                        'badge_text' => "ALTER TABLE hero ADD COLUMN badge_text TEXT DEFAULT 'Alcaldía Municipal de León'"
                    ]
                ];

                foreach ($tables as $table => $columns) {
                    $cols = $pdo->query("PRAGMA table_info({$table})")->fetchAll(PDO::FETCH_ASSOC);
                    $existing = [];
                    foreach ($cols as $c) {
                        if (isset($c['name'])) {
                            $existing[] = strtolower($c['name']);
                        }
                    }
                    foreach ($columns as $colName => $alterSql) {
                        if (!in_array(strtolower($colName), $existing, true)) {
                            try {
                                $pdo->exec($alterSql);
                            } catch (\Throwable $e) {}
                        }
                    }
                }
            } else {
                $tables = [
                    'noticias' => [
                        'linkUrl' => "ALTER TABLE noticias ADD COLUMN linkUrl TEXT",
                        'date' => "ALTER TABLE noticias ADD COLUMN `date` VARCHAR(120) DEFAULT ''",
                        'url_externa' => "ALTER TABLE noticias ADD COLUMN url_externa TEXT"
                    ],
                    'subservicios' => [
                        'link' => "ALTER TABLE subservicios ADD COLUMN link VARCHAR(500)",
                        'requisitos' => "ALTER TABLE subservicios ADD COLUMN requisitos TEXT",
                        'departamento' => "ALTER TABLE subservicios ADD COLUMN departamento VARCHAR(255) DEFAULT ''"
                    ],
                    'proyectos' => [
                        'linkUrl' => "ALTER TABLE proyectos ADD COLUMN linkUrl TEXT"
                    ],
                    'turismo' => [
                        'linkUrl' => "ALTER TABLE turismo ADD COLUMN linkUrl TEXT"
                    ],
                    'stats' => [
                        'linkUrl' => "ALTER TABLE stats ADD COLUMN linkUrl TEXT"
                    ],
                    'hero' => [
                        'badge_text' => "ALTER TABLE hero ADD COLUMN badge_text VARCHAR(150) DEFAULT 'Alcaldía Municipal de León'"
                    ]
                ];

                foreach ($tables as $table => $columns) {
                    $cols = $pdo->query("SHOW COLUMNS FROM `{$table}`")->fetchAll(PDO::FETCH_COLUMN);
                    $existing = array_map('strtolower', $cols ?: []);
                    foreach ($columns as $colName => $alterSql) {
                        if (!in_array(strtolower($colName), $existing, true)) {
                            try {
                                $pdo->exec($alterSql);
                            } catch (\Throwable $e) {}
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            // Ignorar errores de migración
        }
    }

    private static function seedData(PDO $pdo): void {
        // 1. Superadmin por defecto
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute(['admin@alcaldaleon.gob.ni']);
        if (!$stmt->fetch()) {
            $hashedPassword = password_hash('admin123', PASSWORD_BCRYPT);
            $insert = $pdo->prepare("
                INSERT INTO users (id, name, email, password, role, avatar)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $insert->execute([
                'u-1',
                'Administrador General',
                'admin@alcaldaleon.gob.ni',
                $hashedPassword,
                'superadmin',
                '/img/nav_logo/logo nav2.png'
            ]);
        }

        // 2. Hero
        $stmt = $pdo->prepare("SELECT id FROM hero WHERE id = ?");
        $stmt->execute(['hero-1']);
        if (!$stmt->fetch()) {
            $insert = $pdo->prepare("
                INSERT INTO hero (id, title, subtitle, video_url, fallback_image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $insert->execute([
                'hero-1',
                'Bienvenidos a la Alcaldía Municipal de León',
                'Construyendo juntos el futuro de nuestra ciudad, con transparencia, innovación y compromiso con cada leonés.',
                '/video/leon nicaragua vista de un dron.mp4',
                '/img/hero-bg.jpg',
                'Conoce León',
                '#turismo',
                'Servicios Rápidos',
                '#servicios',
                1
            ]);
        }

        // 4. Contacto
        $stmt = $pdo->prepare("SELECT id FROM contacto WHERE id = ?");
        $stmt->execute(['contacto-1']);
        if (!$stmt->fetch()) {
            $insert = $pdo->prepare("
                INSERT INTO contacto (id, address, phone, secondary_phone, email, schedule, facebook_url, instagram_url, tiktok_url, youtube_url, twitter_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $insert->execute([
                'contacto-1',
                'Palacio Municipal, Frente al Parque Central, León, Nicaragua',
                '+505 2315-0000',
                '+505 2315-1111',
                'info@alcaldaleon.gob.ni',
                'Lunes a Viernes: 8:00 AM - 4:00 PM',
                'https://www.facebook.com/share/1EJ2g1UpjY/',
                'https://www.instagram.com/alcaldia_leon',
                'https://www.tiktok.com/@leonalcaldia',
                'https://www.youtube.com/@AlcaldiaLeon',
                'https://twitter.com/alcaldia_leon'
            ]);
        }

        // 5. Configuración de Servicios
        $stmt = $pdo->prepare("SELECT id FROM servicios_settings WHERE id = 'main'");
        $stmt->execute();
        if (!$stmt->fetch()) {
            $insert = $pdo->prepare("
                INSERT INTO servicios_settings (id, eyebrow, title, description, phone)
                VALUES (?, ?, ?, ?, ?)
            ");
            $insert->execute([
                'main',
                'Servicios',
                'Trámites y Servicios Municipales',
                'Hemos simplificado nuestras gestiones en categorías principales para tu comodidad',
                '+505 2315-0000'
            ]);
        }
    }
}
