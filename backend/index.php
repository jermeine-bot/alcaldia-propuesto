<?php

// Autoloader PSR-4 para clases internas
spl_autoload_register(function ($class) {
    $prefixes = [
        'Config\\' => __DIR__ . '/config/',
        'Controllers\\' => __DIR__ . '/controllers/',
        'Middlewares\\' => __DIR__ . '/middlewares/',
        'Services\\' => __DIR__ . '/services/'
    ];

    foreach ($prefixes as $prefix => $baseDir) {
        if (str_starts_with($class, $prefix)) {
            $relativeClass = substr($class, strlen($prefix));
            $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
            if (file_exists($file)) {
                require_once $file;
                return;
            }
        }
    }
});

use Config\Database;
use Config\InitDb;
use Middlewares\CorsMiddleware;
use Middlewares\AuthMiddleware;
use Middlewares\RoleMiddleware;
use Controllers\AuthController;
use Controllers\NoticiasController;
use Controllers\HeroController;
use Controllers\ProyectosController;
use Controllers\TurismoController;
use Controllers\CulturaController;
use Controllers\StatsController;
use Controllers\ContactoController;
use Controllers\ServiciosController;
use Controllers\CmsController;
use Controllers\UsersController;
use Controllers\AuditController;
use Controllers\FacebookController;

// 1. Manejo de CORS
CorsMiddleware::handle();

// 2. Inicialización de Base de Datos y Datos Semilla
static $dbInitialized = false;
if (!$dbInitialized) {
    try {
        $pdo = Database::getConnection();
        InitDb::run($pdo);
        $dbInitialized = true;
    } catch (\Throwable $e) {
        error_log("Error inicializando base de datos: " . $e->getMessage());
    }
}

// 3. Normalizar Método y Ruta
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = '/' . trim($path, '/');

// Leer cuerpo de la petición (JSON)
$rawBody = file_get_contents('php://input');
$body = [];
if (!empty($rawBody)) {
    $decoded = json_decode($rawBody, true);
    if (is_array($decoded)) {
        $body = $decoded;
    }
}
if (!empty($_POST)) {
    $body = array_merge($body, $_POST);
}

// Servir archivos estáticos de /uploads si se llama directamente a index.php
if (str_starts_with($path, '/uploads/')) {
    $filename = basename($path);
    $filepath = __DIR__ . '/uploads/' . $filename;
    if (file_exists($filepath)) {
        $mime = mime_content_type($filepath) ?: 'application/octet-stream';
        header("Content-Type: {$mime}");
        readfile($filepath);
        exit;
    }
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Archivo no encontrado.']);
    exit;
}

// Cabecera por defecto para respuestas de la API
header('Content-Type: application/json; charset=utf-8');

// -------------------------------------------------------------
// ENRUTADOR PRINCIPAL
// -------------------------------------------------------------

// Ruta Raíz Informativa
if ($path === '/' && $method === 'GET') {
    echo json_encode([
        'app' => 'API Backend - Alcaldía Municipal de León (PHP Puro)',
        'status' => 'online',
        'port' => 5505,
        'database_driver' => Database::getDriver(),
        'version' => '1.0.0',
        'endpoints' => [
            'health' => '/api/health',
            'noticias' => '/api/noticias',
            'facebook_sync' => '/api/facebook/sync',
            'audit_logs' => '/api/audit-logs',
            'users' => '/api/users',
            'hero' => '/api/hero',
            'proyectos' => '/api/proyectos',
            'turismo' => '/api/turismo',
            'cultura' => '/api/cultura',
            'stats' => '/api/stats',
            'contacto' => '/api/contacto',
            'cms' => '/api/cms',
            'auth' => '/api/auth/login'
        ]
    ]);
    exit;
}

// Health Check
if ($path === '/api/health' && $method === 'GET') {
    echo json_encode([
        'status' => 'ok',
        'message' => 'Backend API Alcaldía de León funcionando con Seguridad Avanzada y Bitácora de Auditoría en PHP Puro.',
        'timestamp' => date('c'),
        'database' => Database::getDriver()
    ]);
    exit;
}

// Rutas de Autenticación
if ($path === '/api/auth/login') {
    if ($method === 'GET') {
        AuthController::redirectLogin();
    } elseif ($method === 'POST') {
        AuthController::login($body);
        exit;
    }
}

if ($path === '/api/auth/me' && $method === 'GET') {
    $user = AuthMiddleware::handle();
    AuthController::getMe($user);
    exit;
}

if ($path === '/api/auth/change-password' && $method === 'PUT') {
    $user = AuthMiddleware::handle();
    AuthController::changePassword($user, $body);
    exit;
}

// Rutas de Noticias
if ($path === '/api/noticias/upload-image' && $method === 'POST') {
    AuthMiddleware::handle();
    NoticiasController::uploadImage();
    exit;
}

if ($path === '/api/noticias') {
    if ($method === 'GET') {
        NoticiasController::getAll();
        exit;
    } elseif ($method === 'POST') {
        $user = AuthMiddleware::handle();
        NoticiasController::create($user, $body);
        exit;
    }
}

if (preg_match('~^/api/noticias/([^/]+)$~', $path, $matches)) {
    $id = urldecode($matches[1]);
    if ($method === 'GET') {
        NoticiasController::getById($id);
        exit;
    } elseif ($method === 'PUT') {
        $user = AuthMiddleware::handle();
        NoticiasController::update($user, $id, $body);
        exit;
    } elseif ($method === 'DELETE') {
        $user = AuthMiddleware::handle();
        NoticiasController::delete($user, $id);
        exit;
    }
}

// Portada Hero
if ($path === '/api/hero') {
    if ($method === 'GET') {
        HeroController::getHero();
        exit;
    } elseif ($method === 'PUT') {
        AuthMiddleware::handle();
        HeroController::updateHero($body);
        exit;
    }
}

// Proyectos
if ($path === '/api/proyectos') {
    if ($method === 'GET') {
        ProyectosController::getAll();
        exit;
    } elseif ($method === 'POST') {
        AuthMiddleware::handle();
        ProyectosController::create($body);
        exit;
    }
}

if (preg_match('~^/api/proyectos/([^/]+)$~', $path, $matches)) {
    $id = urldecode($matches[1]);
    if ($method === 'PUT') {
        AuthMiddleware::handle();
        ProyectosController::update($id, $body);
        exit;
    } elseif ($method === 'DELETE') {
        AuthMiddleware::handle();
        ProyectosController::delete($id);
        exit;
    }
}

// Turismo
if ($path === '/api/turismo') {
    if ($method === 'GET') {
        TurismoController::getAll();
        exit;
    } elseif ($method === 'POST') {
        AuthMiddleware::handle();
        TurismoController::create($body);
        exit;
    }
}

if (preg_match('~^/api/turismo/([^/]+)$~', $path, $matches)) {
    $id = urldecode($matches[1]);
    if ($method === 'PUT') {
        AuthMiddleware::handle();
        TurismoController::update($id, $body);
        exit;
    } elseif ($method === 'DELETE') {
        AuthMiddleware::handle();
        TurismoController::delete($id);
        exit;
    }
}

// Cultura
if ($path === '/api/cultura') {
    if ($method === 'GET') {
        CulturaController::getAll();
        exit;
    } elseif ($method === 'POST') {
        AuthMiddleware::handle();
        CulturaController::create($body);
        exit;
    }
}

if (preg_match('~^/api/cultura/([^/]+)$~', $path, $matches)) {
    $id = urldecode($matches[1]);
    if ($method === 'PUT') {
        AuthMiddleware::handle();
        CulturaController::update($id, $body);
        exit;
    } elseif ($method === 'DELETE') {
        AuthMiddleware::handle();
        CulturaController::delete($id);
        exit;
    }
}

// Estadísticas
if ($path === '/api/stats') {
    if ($method === 'GET') {
        StatsController::getAll();
        exit;
    } elseif ($method === 'POST') {
        AuthMiddleware::handle();
        StatsController::create($body);
        exit;
    }
}

if (preg_match('~^/api/stats/([^/]+)$~', $path, $matches)) {
    $id = urldecode($matches[1]);
    if ($method === 'PUT') {
        AuthMiddleware::handle();
        StatsController::update($id, $body);
        exit;
    } elseif ($method === 'DELETE') {
        AuthMiddleware::handle();
        StatsController::delete($id);
        exit;
    }
}

// Contacto
if ($path === '/api/contacto') {
    if ($method === 'GET') {
        ContactoController::getContacto();
        exit;
    } elseif ($method === 'PUT') {
        AuthMiddleware::handle();
        ContactoController::updateContacto($body);
        exit;
    }
}

// Servicios Settings
if ($path === '/api/servicios/settings') {
    if ($method === 'GET') {
        ServiciosController::getSettings();
        exit;
    } elseif ($method === 'PUT') {
        $user = AuthMiddleware::handle();
        RoleMiddleware::check($user, ['superadmin', 'editor']);
        ServiciosController::updateSettings($body);
        exit;
    }
}

// Servicios (CRUD Principal)
if ($path === '/api/servicios') {
    if ($method === 'GET') {
        ServiciosController::getAll();
        exit;
    } elseif ($method === 'POST') {
        $user = AuthMiddleware::handle();
        RoleMiddleware::check($user, ['superadmin', 'editor']);
        ServiciosController::create($body);
        exit;
    }
}

// Subservicios: /api/servicios/{id}/subservicios/{subservicioId}
if (preg_match('~^/api/servicios/([^/]+)/subservicios/([^/]+)$~', $path, $matches)) {
    $serviceId = urldecode($matches[1]);
    $subservicioId = urldecode($matches[2]);
    $user = AuthMiddleware::handle();
    RoleMiddleware::check($user, ['superadmin', 'editor']);

    if ($method === 'PUT') {
        ServiciosController::saveSubservicio($serviceId, $body, $subservicioId);
        exit;
    } elseif ($method === 'DELETE') {
        ServiciosController::deleteSubservicio($serviceId, $subservicioId);
        exit;
    }
}

// Subservicios: /api/servicios/{id}/subservicios
if (preg_match('~^/api/servicios/([^/]+)/subservicios$~', $path, $matches)) {
    $serviceId = urldecode($matches[1]);
    $user = AuthMiddleware::handle();
    RoleMiddleware::check($user, ['superadmin', 'editor']);

    if ($method === 'POST') {
        ServiciosController::saveSubservicio($serviceId, $body);
        exit;
    }
}

if (preg_match('~^/api/servicios/([^/]+)$~', $path, $matches)) {
    $id = urldecode($matches[1]);
    $user = AuthMiddleware::handle();
    RoleMiddleware::check($user, ['superadmin', 'editor']);

    if ($method === 'PUT') {
        ServiciosController::update($id, $body);
        exit;
    } elseif ($method === 'DELETE') {
        ServiciosController::delete($id);
        exit;
    }
}

// CMS Content (Centros de Atención y Redes Sociales)
if (preg_match('~^/api/cms/([^/]+)$~', $path, $matches)) {
    $contentId = urldecode($matches[1]);
    if ($method === 'GET') {
        CmsController::get($contentId);
        exit;
    } elseif ($method === 'PUT') {
        $user = AuthMiddleware::handle();
        RoleMiddleware::check($user, ['superadmin', 'editor']);
        CmsController::save($contentId, $body);
        exit;
    }
}

// Usuarios (RBAC)
if ($path === '/api/users') {
    $user = AuthMiddleware::handle();
    if ($method === 'GET') {
        RoleMiddleware::check($user, ['superadmin', 'editor']);
        UsersController::getAll();
        exit;
    } elseif ($method === 'POST') {
        RoleMiddleware::check($user, ['superadmin']);
        UsersController::create($user, $body);
        exit;
    }
}

if (preg_match('~^/api/users/([^/]+)$~', $path, $matches)) {
    $id = urldecode($matches[1]);
    $user = AuthMiddleware::handle();
    RoleMiddleware::check($user, ['superadmin']);

    if ($method === 'PUT') {
        UsersController::update($user, $id, $body);
        exit;
    } elseif ($method === 'DELETE') {
        UsersController::delete($user, $id);
        exit;
    }
}

// Bitácora de Auditoría
if ($path === '/api/audit-logs' && $method === 'GET') {
    $user = AuthMiddleware::handle();
    RoleMiddleware::check($user, ['superadmin', 'editor']);
    AuditController::getLogs();
    exit;
}

// Facebook Graph API
if ($path === '/api/facebook/status' && $method === 'GET') {
    FacebookController::getStatus();
    exit;
}

if ($path === '/api/facebook/sync' && $method === 'POST') {
    AuthMiddleware::handle();
    FacebookController::syncNow();
    exit;
}

// 404 Manejador para rutas no encontradas
http_response_code(404);
echo json_encode(['error' => "Ruta {$path} no encontrada en la API."]);
