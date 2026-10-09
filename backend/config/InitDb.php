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
                    linkText TEXT,
                    linkUrl TEXT,
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
            ");
        } else {
            // MySQL Schema
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

        self::seedData($pdo);
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

        // 3. Contacto
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

        // 4. Noticias Iniciales
        $countNoticias = $pdo->query("SELECT COUNT(*) FROM noticias")->fetchColumn();
        if ($countNoticias == 0) {
            $noticias = [
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
            $stmt = $pdo->prepare("
                INSERT INTO noticias (id, titulo, slug, extracto, contenido, categoria, imagen, autor, date, status, fuente)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            foreach ($noticias as $n) {
                $stmt->execute($n);
            }
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

        // 6. Proyectos
        $countProyectos = $pdo->query("SELECT COUNT(*) FROM proyectos")->fetchColumn();
        if ($countProyectos == 0) {
            $proyectos = [
                ['proyecto-1', '/img/proyectos/proyecto1.jpg', 'Infraestructura', 'En Progreso', 0, 'Parque Lineal del Río Chiquito', 'Recuperación ambiental, reforestación y creación de senderos ecológicos y espacios recreativos para familias leonesas.', 'Este mega proyecto contempla la limpieza integral del cauce, siembra de más de 5,000 árboles nativos, instalación de luminarias solares y construcción de ciclovías.', 'Río Chiquito, León', 'C$ 45.2M', 68, 'Enero 2024', '35,000 Habitantes', 1],
                ['proyecto-2', '/img/proyectos/proyecto2.jpg', 'Comercio & Economía', 'Completado', 1, 'Modernización del Mercado Municipal Santos Bárcenas', 'Renovación de tramos, sistema eléctrico moderno, agua potable y accesibilidad universal para comerciantes y clientes.', 'Rehabilitación total de techo, nuevo sistema contra incendios y ordenamiento de más de 300 tramos comerciales para garantizar compras seguras y cómodas.', 'Centro Histórico, León', 'C$ 32.8M', 100, 'Julio 2023', '50,000 Habitantes', 1],
                ['proyecto-3', '/img/proyectos/proyecto1.jpg', 'Vialidad', 'En Progreso', 0, 'Pavimentación y Drenaje en Barrios Periféricos', 'Mejoramiento de 15 kilómetros de calles adoquinadas y ampliación de alcantarillado sanitario.', 'Intervención integral en alcantarillado pluvial y mejoramiento de vialidad en zonas vulnerables durante la temporada de lluvias.', 'Sutiaba y Repartos Norte', 'C$ 28.5M', 82, 'Marzo 2024', '22,000 Habitantes', 1],
                ['proyecto-4', '/img/proyectos/proyecto2.jpg', 'Cultura & Turismo', 'Completado', 1, 'Restauración del Centro Cultural y Mosaicos Históricos', 'Preservación de monumentos emblemáticos, pintura en fachadas históricas e iluminación LED ornamental.', 'Restauración patrimonial respetando el estilo neoclásico y colonial de la primera capital.', 'Plaza de la Liberación', 'C$ 18.0M', 100, 'Noviembre 2023', '120,000 Visitantes', 1]
            ];
            $stmt = $pdo->prepare("
                INSERT INTO proyectos (id, img, category, status, isCompleted, title, `desc`, detailed_desc, location, cost, progress, startDate, beneficiaries, is_published)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            foreach ($proyectos as $p) {
                $stmt->execute($p);
            }
        }

        // 7. Turismo
        $countTurismo = $pdo->query("SELECT COUNT(*) FROM turismo")->fetchColumn();
        if ($countTurismo == 0) {
            $turismo = [
                ['turismo-1', '/img/turismo/catedral.jpg', 'Basílica Catedral de León', 'La catedral más grande de Centroamérica y Patrimonio de la Humanidad UNESCO.', 'Patrimonio & Historia', 'Plaza Mayor, Centro Histórico', 'La Real e Insigne Basílica Catedral de la Asunción de la Bienaventurada Virgen María es uno de los monumentos más icónicos de América Latina. En sus criptas descansan los restos del insigne poeta Rubén Darío.', 1, 1],
                ['turismo-2', '/img/turismo/leon-viejo.jpg', 'Ruinas de León Viejo', 'Primer asentamiento de la ciudad y Patrimonio Cultural UNESCO.', 'Patrimonio UNESCO', 'Puerto Momotombo', 'Fundada en 1524 por Francisco Hernández de Córdoba al pie del volcán Momotombo. Sepultada por las cenizas volcánicas, conserva el trazado urbano original del siglo XVI.', 1, 2],
                ['turismo-3', '/img/turismo/cerro-negro.jpg', 'Volcán Cerro Negro', 'El volcán más joven de Centroamérica y meca mundial del Volcano Boarding.', 'Aventura & Naturaleza', 'Cordillera de los Maribios', 'Siente la adrenalina descendiendo a toda velocidad sobre las laderas de arena negra de este activo volcán.', 1, 3],
                ['turismo-4', '/img/turismo/las-penitas.jpg', 'Playas de Las Peñitas y Poneloya', 'Playas paradisíacas con atardeceres espectaculares y olas ideales para el surf.', 'Playas & Sol', 'Costa del Pacífico leonés', 'Destino por excelencia para turistas nacionales e internacionales que buscan buena gastronomía marina, mariscos frescos y surfing.', 1, 4]
            ];
            $stmt = $pdo->prepare("
                INSERT INTO turismo (id, img, title, `desc`, category, location, content, is_published, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            foreach ($turismo as $t) {
                $stmt->execute($t);
            }
        }

        // 8. Cultura
        $countCultura = $pdo->query("SELECT COUNT(*) FROM cultura")->fetchColumn();
        if ($countCultura == 0) {
            $cultura = [
                ['cultura-1', 'fa-cross', 'Semana Santa y Alfombras de Aserrín', 'La tradición religiosa y artística más impresionante confeccionada en las calles de Sutiaba.', 'Marzo / Abril 2026', 'Todo el día', 'Barrio Sutiaba, León', '/img/cultura/semana_santa.jpg', 1],
                ['cultura-2', 'fa-fist-raised', 'La Gritería en Honor a la Purísima', 'La fiesta mariana más alegre, colorida y multitudinaria de Nicaragua.', '7 de Diciembre', '6:00 PM', 'Catedral y barrios de León', '/img/cultura/griteria.jpg', 1],
                ['cultura-3', 'fa-feather-alt', 'Festival Internacional de Poesía', 'El evento literario y cultural más importante en honor al príncipe de las letras castellanas.', '18 al 22 de Enero', '9:00 AM - 8:00 PM', 'Teatro Municipal José de la Cruz Mena', '/img/cultura/poesia.jpg', 1]
            ];
            $stmt = $pdo->prepare("
                INSERT INTO cultura (id, icon, title, `desc`, event_date, event_time, location, image_url, is_published)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            foreach ($cultura as $c) {
                $stmt->execute($c);
            }
        }

        // 9. Stats
        $countStats = $pdo->query("SELECT COUNT(*) FROM stats")->fetchColumn();
        if ($countStats == 0) {
            $stats = [
                ['stat-1', 'fa-users', 210500, '+', 'Población Estimada', 'Habitantes en el área urbana y comarcas rurales de León', 'Población', 'Demografía', 85, '#B22222', 'León es la segunda ciudad en importancia demográfica de Nicaragua, caracterizada por su juventud universitaria, historia viva y pujante desarrollo comunitario.', json_encode([
                    ['label' => 'Población Urbana', 'value' => '165,200 habitantes (78.5%)'],
                    ['label' => 'Población Rural', 'value' => '45,300 habitantes (21.5%)'],
                    ['label' => 'Comunidades atendidas', 'value' => '114 comarcas'],
                    ['label' => 'Estudiantes Universitarios', 'value' => '38,000+ inscritos']
                ]), 1, 1],
                ['stat-2', 'fa-map-marked-alt', 820, ' km²', 'Extensión Territorial', 'Área urbana y rural del municipio de León', 'Geografía', 'Territorio', 100, '#1E1D1B', 'Abarca desde la impresionante Cordillera de los Maribios hasta las hermosas playas del Océano Pacífico, combinando valles fértiles y biodiversidad.', json_encode([
                    ['label' => 'Área Urbana', 'value' => '42 km²'],
                    ['label' => 'Área Rural', 'value' => '778 km²'],
                    ['label' => 'Línea Costera', 'value' => '22 km de playas (Las Peñitas y Poneloya)'],
                    ['label' => 'Volcanes Jurisdiccionales', 'value' => 'Cerro Negro, Telica y Cerro Asososca']
                ]), 1, 2],
                ['stat-3', 'fa-landmark', 16, ' Templos', 'Patrimonio Cultural', 'Incluye la Catedral de León (UNESCO 2011)', 'Cultura', 'UNESCO', 95, '#8B0000', 'Reconocida internacionalmente como la Capital Cultural de Nicaragua, cuna del insigne poeta Rubén Darío y poseedora de joyas arquitectónicas.', json_encode([
                    ['label' => 'Insignia UNESCO 2011', 'value' => 'Real e Insigne Basílica Catedral de León'],
                    ['label' => 'Patrimonio UNESCO 2000', 'value' => 'Ruinas de León Viejo'],
                    ['label' => 'Templos Históricos', 'value' => 'El Sutiaba, La Recolección, San Francisco, El Calvario'],
                    ['label' => 'Espacios Culturales', 'value' => 'Museo Rubén Darío, Centro de Arte Fundación Ortiz-Gurdián']
                ]), 1, 3],
                ['stat-4', 'fa-city', 24, ' Obras', 'Proyectos Activos', 'Infraestructura vial, parques comunitarios y mejoramiento urbano', 'Desarrollo', 'Gestión 2024-2026', 78, '#C62828', 'El Gobierno Municipal impulsa proyectos de gran escala para transformar la infraestructura vial, el drenaje y la recreación familiar.', json_encode([
                    ['label' => 'Parque Lineal Río Chiquito', 'value' => '68% de avance'],
                    ['label' => 'Mercado Santos Bárcenas', 'value' => '100% Completado'],
                    ['label' => 'Calles para el Pueblo', 'value' => '42 cuadras asfaltadas y adoquinadas'],
                    ['label' => 'Espacios Verdes', 'value' => 'Reforestación y parques comunitarios']
                ]), 1, 4],
                ['stat-5', 'fa-broom', 98, '%', 'Cobertura de Servicios', 'Limpieza pública, iluminación LED y mantenimiento de parques', 'Servicios', 'Calidad 24/7', 98, '#2B2927', 'Equipos de servicios municipales despliegan jornadas continuas de limpieza, ornato e iluminación para mantener una ciudad limpia y segura.', json_encode([
                    ['label' => 'Rutas de Recolección', 'value' => '28 rutas diarias urbanas y rurales'],
                    ['label' => 'Volumen Recolectado', 'value' => '180+ toneladas de basura diarias'],
                    ['label' => 'Alumbrado LED', 'value' => '12,400 luminarias eficientes'],
                    ['label' => 'Parques Rehabilitados', 'value' => '35 áreas infantiles y deportivas']
                ]), 1, 5],
                ['stat-6', 'fa-plane-arrival', 125000, '+', 'Turistas Anuales', 'Visitantes que disfrutan de nuestra historia, volcanes y playas', 'Turismo', 'Economía Local', 90, '#B22222', 'Destino imperdible del turismo internacional por su combinación única de deporte extremo en volcanes, arquitectura colonial y hermosas playas.', json_encode([
                    ['label' => 'Turismo de Aventura', 'value' => 'Volcano Boarding en el volcán Cerro Negro'],
                    ['label' => 'Turismo de Playa', 'value' => 'Surfeo en Las Peñitas y tour en Isla Juan Venado'],
                    ['label' => 'Gastronomía León', 'value' => 'Quesillos, Fritanga y Chicha leonesa'],
                    ['label' => 'Oferta de Hospedaje', 'value' => '85+ hoteles y hostales familiares']
                ]), 1, 6]
            ];
            $stmt = $pdo->prepare("
                INSERT INTO stats (id, icon, number, suffix, title, subtitle, category, badge, percentage, color, description, breakdown, is_published, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            foreach ($stats as $s) {
                $stmt->execute($s);
            }
        }

        // 10. Servicios y Subservicios
        $countServicios = $pdo->query("SELECT COUNT(*) FROM servicios")->fetchColumn();
        if ($countServicios == 0) {
            $servicios = [
                [
                    'id' => 'tramites',
                    'title' => 'Trámites Municipales',
                    'badgeIcon' => '🏛️',
                    'icon' => 'fa-landmark',
                    'subtitle' => 'Permisos, licencias y gestiones',
                    'desc' => 'Gestiona autorizaciones urbanas, licencias comerciales y certificaciones sin complicaciones.',
                    'opciones' => [
                        ['id' => 'opt-1', 'icon' => 'fa-file-signature', 'title' => 'Permisos de Construcción y Obras', 'desc' => 'Solicitud y aprobación de proyectos de edificación, remodelación y licencias urbanísticas.', 'linkText' => 'Solicitar Permiso', 'linkUrl' => '#contacto'],
                        ['id' => 'opt-2', 'icon' => 'fa-certificate', 'title' => 'Licencias de Funcionamiento', 'desc' => 'Registro, apertura y renovación de licencias para establecimientos comerciales e industriales.', 'linkText' => 'Tramitar Licencia', 'linkUrl' => '#contacto'],
                        ['id' => 'opt-3', 'icon' => 'fa-stamp', 'title' => 'Gestiones y Constancias Administrativas', 'desc' => 'Emisión de solidez catastral, constancia de residencia y certificaciones municipales.', 'linkText' => 'Obtener Constancia', 'linkUrl' => '#contacto']
                    ]
                ],
                [
                    'id' => 'impuestos',
                    'title' => 'Impuestos y Pagos',
                    'badgeIcon' => '💰',
                    'icon' => 'fa-hand-holding-usd',
                    'subtitle' => 'Consulta y paga tus obligaciones',
                    'desc' => 'Realiza tus pagos municipales de forma rápida, segura y transparente desde cualquier lugar.',
                    'opciones' => [
                        ['id' => 'opt-4', 'icon' => 'fa-home', 'title' => 'Impuesto sobre Bienes Inmuebles (IBI)', 'desc' => 'Consulta tu estado de cuenta de IBI y realiza pagos en línea o en cajas autorizadas.', 'linkText' => 'Pagar IBI', 'linkUrl' => '#contacto'],
                        ['id' => 'opt-5', 'icon' => 'fa-receipt', 'title' => 'Impuesto sobre Ingresos y Matrícula', 'desc' => 'Declaración mensual de ventas, matriculación anual y solvencias municipales.', 'linkText' => 'Declarar / Pagar', 'linkUrl' => '#contacto'],
                        ['id' => 'opt-6', 'icon' => 'fa-calculator', 'title' => 'Consulta de Saldos y Solvencias', 'desc' => 'Verifica el historial de pagos y solicita tu certificado de solvencia municipal al día.', 'linkText' => 'Consultar Saldo', 'linkUrl' => '#contacto']
                    ]
                ],
                [
                    'id' => 'propiedades',
                    'title' => 'Propiedades y Comercio',
                    'badgeIcon' => '🏠',
                    'icon' => 'fa-store',
                    'subtitle' => 'Catastro, mercados y comercio',
                    'desc' => 'Accede a servicios catastrales, regulación de mercados locales y fomento al emprendimiento.',
                    'opciones' => [
                        ['id' => 'opt-7', 'icon' => 'fa-map-marked-alt', 'title' => 'Consultas Catastrales y Planos', 'desc' => 'Información sobre delimitación de terrenos, avalúos catastrales y mapas del municipio.', 'linkText' => 'Ver Catastro', 'linkUrl' => '#contacto'],
                        ['id' => 'opt-8', 'icon' => 'fa-store-alt', 'title' => 'Comercio y Mercados Municipales', 'desc' => 'Asignación y canon de tramos en mercados como Central, Santos Bárcenas y Sutiaba.', 'linkText' => 'Info Mercados', 'linkUrl' => '#contacto'],
                        ['id' => 'opt-9', 'icon' => 'fa-chart-line', 'title' => 'Fomento al Emprendimiento Local', 'desc' => 'Asesoría para nuevos comerciantes, ferias comunitarias y registro de PyMES.', 'linkText' => 'Registrar Negocio', 'linkUrl' => '#contacto']
                    ]
                ],
                [
                    'id' => 'servicios',
                    'title' => 'Servicios y Atención',
                    'badgeIcon' => '🛠️',
                    'icon' => 'fa-hand-holding-heart',
                    'subtitle' => 'Basura, cementerios, denuncias y citas',
                    'desc' => 'Servicios comunitarios directos para mejorar la calidad de vida y atención al ciudadano.',
                    'opciones' => [
                        ['id' => 'opt-10', 'icon' => 'fa-trash-alt', 'title' => 'Recolección de Basura y Limpieza Urbana', 'desc' => 'Consulta los días, rutas y horarios de recolección en tu barrio o comarca.', 'linkText' => 'Ver Rutas', 'linkUrl' => '#contacto'],
                        ['id' => 'opt-11', 'icon' => 'fa-church', 'title' => 'Servicios de Cementerios', 'desc' => 'Trámites de mantenimiento, títulos de propiedad y servicios funerarios municipales.', 'linkText' => 'Trámites Cementerio', 'linkUrl' => '#contacto'],
                        ['id' => 'opt-12', 'icon' => 'fa-exclamation-triangle', 'title' => 'Reportes y Denuncias Ciudadanas', 'desc' => 'Informa sobre fallas en alumbrado público, baches, fugas o perturbación de paz.', 'linkText' => 'Hacer Reporte', 'linkUrl' => '#contacto'],
                        ['id' => 'opt-13', 'icon' => 'fa-calendar-check', 'title' => 'Agenda de Citas y Atención Presencial', 'desc' => 'Reserva tu horario para trámites presenciales en el Palacio Municipal sin filas.', 'linkText' => 'Agendar Cita', 'linkUrl' => '#contacto']
                    ]
                ]
            ];

            $insertServ = $pdo->prepare("
                INSERT INTO servicios (id, title, subtitle, icon, color, badgeIcon, `desc`, count, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $insertSub = $pdo->prepare("
                INSERT INTO subservicios (id, servicio_id, title, `desc`, icon, linkText, linkUrl)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");

            foreach ($servicios as $idx => $s) {
                $insertServ->execute([
                    $s['id'], $s['title'], $s['subtitle'], $s['icon'], '', $s['badgeIcon'], $s['desc'], count($s['opciones']), $idx
                ]);
                foreach ($s['opciones'] as $opt) {
                    $insertSub->execute([
                        $opt['id'], $s['id'], $opt['title'], $opt['desc'], $opt['icon'], $opt['linkText'], $opt['linkUrl']
                    ]);
                }
            }
        }

        // 11. CMS Content (Centros de Atención y Redes Sociales)
        $stmt = $pdo->prepare("SELECT id FROM cms_content WHERE id = ?");
        $stmt->execute(['centros-atencion']);
        if (!$stmt->fetch()) {
            $centros = [
                [
                    'id' => 'centro-1',
                    'serviceLabel' => 'Atención tributaria',
                    'title' => 'Plantel Augusto C. Sandino - Fundeci',
                    'description' => 'Centro de atención tributaria para realizar consultas y recibir orientación sobre los tributos municipales.',
                    'image' => 'https://s3.laprensani.com/wp-content/uploads/2020/08/20200827_054944-1536x1152.jpg',
                    'mapsUrl' => 'https://www.google.com/maps/search/?api=1&query=Centro+de+Atenci%C3%B3n+Tributaria+Plantel+Augusto+C.+Sandino+Fundeci%2C+Le%C3%B3n%2C+Nicaragua',
                    'coordinates' => ''
                ],
                [
                    'id' => 'centro-2',
                    'serviceLabel' => 'Atención tributaria',
                    'title' => 'Cabildo de Sutiava',
                    'description' => 'Punto de atención tributaria para acercar las gestiones y la orientación municipal a las familias de Sutiava.',
                    'image' => 'https://scontent-mia3-2.xx.fbcdn.net/v/t1.6435-9/53316618_394104814483648_4424533071907258368_n.jpg?stp=dst-jpg_tt6&cstp=mx960x720&ctp=s960x720&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3PcCQj0ryUEQ7kNvwG3XSx2&_nc_oc=AdoxAGoshRtNEGX_QHNMI9aD6lIi_chPm-o43ljxO_Oz7pAu_UuOdJsClIbSZYgYYWU&_nc_zt=23&_nc_ht=scontent-mia3-2.xx&_nc_gid=jxOMDZYlSyA9Zk_-543mfg&_nc_ss=7b289&oh=00_AQOXamRbOgltC3qL1kyyigzMPEhiGYW5FWAJdpNVF9_nXg&oe=6AE759F1',
                    'mapsUrl' => 'https://www.google.com/maps/search/?api=1&query=12.4334625%2C-86.8962656',
                    'coordinates' => '12.4334625, -86.8962656'
                ],
                [
                    'id' => 'centro-3',
                    'serviceLabel' => 'Atención tributaria',
                    'title' => 'Plantel Rigoberto López Pérez - San Felipe',
                    'description' => 'Centro de atención para consultas y orientación sobre servicios y obligaciones tributarias municipales.',
                    'image' => 'https://scontent-mia3-3.xx.fbcdn.net/v/t39.30808-6/476904691_939569444988682_3573219317361155107_n.jpg?stp=dst-jpg_tt6&cstp=mx1280x853&ctp=s1280x853&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=JUqxMr1TfV4Q7kNvwHq84HC&_nc_oc=AdqTkGA-CddnuwnmLiLVVF5GRm_yIa2PR9IzcLvpi3AuwLuILReCEtsqg0IzI2K33z8&_nc_zt=23&_nc_ht=scontent-mia3-3.xx&_nc_gid=9qlya_IIbWhNiapJLGy3JQ&_nc_ss=7b289&oh=00_AQOcOsbnWkS47JJEu-B-MWKRNPkijxlszF7SReE7XtHUCg&oe=6AC5CA98',
                    'mapsUrl' => 'https://www.google.com/maps/search/?api=1&query=Centro+de+Atenci%C3%B3n+Tributaria+Plantel+Rigoberto+L%C3%B3pez+P%C3%A9rez+San+Felipe%2C+Le%C3%B3n%2C+Nicaragua',
                    'coordinates' => ''
                ],
                [
                    'id' => 'centro-4',
                    'serviceLabel' => 'Atención tributaria',
                    'title' => 'Parque Forestal - León Sureste',
                    'description' => 'Punto de atención tributaria para facilitar el acceso a las gestiones municipales en el sector sureste de León.',
                    'image' => 'https://scontent-mia3-3.xx.fbcdn.net/v/t1.6435-9/118441073_170572441204275_3221589260549251588_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1072&ctp=s2048x1072&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=o_gqKv5d38QQ7kNvwGrxh47&_nc_oc=AdrpB7QL_pU3b6N3tpaH5qdG2D0anL2q_DXP4xhDddj2ZxpBIhnIoYcCewIn6u3_M60&_nc_zt=23&_nc_ht=scontent-mia3-3.xx&_nc_gid=RPn-oKU82s85HMVwN8954g&_nc_ss=7b289&oh=00_AQOe8C_lAr16C0-AtBbqyBUhKAxKLf1gy3Ya1rKoiZVgNg&oe=6AE73BC9',
                    'mapsUrl' => 'https://www.google.com/maps/search/?api=1&query=12.4283875%2C-86.8527031',
                    'coordinates' => '12.4283875, -86.8527031'
                ],
                [
                    'id' => 'centro-5',
                    'serviceLabel' => 'Atención tributaria',
                    'title' => 'Edificio Central - Alcaldía Municipal de León',
                    'description' => 'Sede central de la Alcaldía para recibir atención y orientación sobre los servicios tributarios municipales.',
                    'image' => 'https://scontent-mia5-2.xx.fbcdn.net/v/t39.99422-6/789388685_1815192082973542_1054571313588336725_n.png?stp=dst-jpg_tt6&cstp=mx1599x1066&ctp=s1599x1066&_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_ohc=BTdimcd-Jz4Q7kNvwFmNTTs&_nc_oc=AdpigJop75FwQOgIn0j8Lp6ysRNptMFKlbISmHKSCGOS61BcwI-VJbQQyttWMpzkyCA&_nc_zt=14&_nc_ht=scontent-mia5-2.xx&_nc_gid=Wyae-OVUEYma3uKbK6Jjzg&_nc_ss=7b289&oh=00_AQOfn-jQ1FnmOHa3S0r8MoExqUkKDh5gKgk25b1oOtNVSQ&oe=6AC5BDD7',
                    'mapsUrl' => 'https://www.google.com/maps/search/?api=1&query=12.4354141%2C-86.8789709',
                    'coordinates' => '12.4354141, -86.8789709'
                ]
            ];
            $insert = $pdo->prepare("INSERT INTO cms_content (id, content) VALUES (?, ?)");
            $insert->execute(['centros-atencion', json_encode($centros, JSON_UNESCAPED_UNICODE)]);
        }

        $stmt = $pdo->prepare("SELECT id FROM cms_content WHERE id = ?");
        $stmt->execute(['redes-sociales']);
        if (!$stmt->fetch()) {
            $redes = [
                'eyebrow' => 'COMUNIDAD DIGITAL EN VIVO',
                'title' => 'Síguenos en Redes Sociales',
                'description' => 'Conéctate con la Alcaldía de León en todas nuestras plataformas oficiales para enterarte al instante de obras, noticias y eventos culturales.',
                'platforms' => [
                    ['id' => 'facebook', 'name' => 'Facebook', 'handle' => '@AlcaldiaLeon', 'url' => 'https://www.facebook.com/share/1EJ2g1UpjY/', 'icon' => 'fa-facebook-f', 'buttonClass' => 'facebook', 'statTarget' => 15234, 'statLabel' => 'Seguidores Facebook', 'color' => '#1877F2', 'profileDescription' => 'Transmisiones en directo, comunicados oficiales y avisos comunitarios.', 'images' => ['/img/Redes sociales/captura de facebook.png', '/img/Redes sociales/captura de facebook1.png', '/img/Redes sociales/captura de facebook3.png', '/img/Redes sociales/captura de facebook4.png']],
                    ['id' => 'instagram', 'name' => 'Instagram', 'handle' => '@alcaldia_leon', 'url' => 'https://www.instagram.com/alcaldia_leon', 'icon' => 'fa-instagram', 'buttonClass' => 'instagram', 'statTarget' => 8756, 'statLabel' => 'Seguidores Instagram', 'color' => '#E4405F', 'profileDescription' => 'Fotografías de León, actividades municipales y vida comunitaria.', 'images' => ['/img/Redes sociales/instagram-1.jpg', '/img/Redes sociales/instagram-2.jpg', '/img/Redes sociales/instagram-3.jpg', '/img/Redes sociales/instagram-4.jpg', '/img/Redes sociales/instagram-5.jpg', '/img/Redes sociales/instagram-6.jpg']],
                    ['id' => 'tiktok', 'name' => 'TikTok', 'handle' => '@alcaldia_leon', 'url' => 'https://www.tiktok.com/@leonalcaldia?_r=1&_t=ZS-98pfIgmPYhg', 'icon' => 'fa-tiktok', 'buttonClass' => 'tiktok', 'statTarget' => 12345, 'statLabel' => 'Seguidores TikTok', 'color' => '#000000', 'profileDescription' => 'Reportajes dinámicos, eventos culturales y resumen de obras.', 'images' => ['/img/Redes sociales/captura de tiktok.png', '/img/Redes sociales/captura de tiktok2.png', '/img/Redes sociales/captura de tiktok3.png', '/img/Redes sociales/captura de tiktok4.png']],
                    ['id' => 'youtube', 'name' => 'YouTube', 'handle' => '@AlcaldiaLeon', 'url' => 'https://www.youtube.com/@AlcaldiaLeon', 'icon' => 'fa-youtube', 'buttonClass' => 'youtube', 'statTarget' => 5432, 'statLabel' => 'Suscriptores YouTube', 'color' => '#FF0000', 'profileDescription' => 'Canal oficial de videos y transmisiones municipales.', 'images' => []],
                    ['id' => 'twitter', 'name' => 'Twitter/X', 'handle' => '@Alcaldia_Leon', 'url' => 'https://twitter.com/Alcaldia_Leon', 'icon' => 'fa-twitter', 'buttonClass' => 'twitter', 'statTarget' => null, 'statLabel' => '', 'color' => '#111111', 'profileDescription' => 'Comunicados y actualizaciones de la Alcaldía.', 'images' => []]
                ]
            ];
            $insert = $pdo->prepare("INSERT INTO cms_content (id, content) VALUES (?, ?)");
            $insert->execute(['redes-sociales', json_encode($redes, JSON_UNESCAPED_UNICODE)]);
        }
    }
}
