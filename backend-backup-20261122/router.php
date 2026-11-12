<?php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$uri = rawurldecode($uri);

$notFound = static function (): bool {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Recurso no encontrado.']);
    return true;
};

// Nunca servir archivos ocultos (.env, .git, .htaccess, etc.).
if (preg_match('~(^|/)\.~', $uri)) {
    return $notFound();
}

// Directorios internos que jamás deben servirse por HTTP.
foreach (['/config/', '/controllers/', '/middlewares/', '/services/', '/mysql/', '/data/'] as $prefix) {
    if (str_starts_with($uri, $prefix)) {
        return $notFound();
    }
}

// Archivos de desarrollo, respaldos y administración de base de datos.
$blockedFiles = [
    '/adminer.php',
    '/database.sqlite',
    '/start.sh',
    '/start.ps1',
    '/start.bat',
    '/composer.json',
    '/composer.lock',
    '/phpunit.xml',
];
if (in_array($uri, $blockedFiles, true)) {
    return $notFound();
}
if (preg_match('~\.(sqlite|sql|env|md|log|bak|ini|sh|ps1|bat|json|lock|yml|yaml)$~i', $uri)) {
    return $notFound();
}

// Archivos públicos de /uploads: solo medios y siempre dentro de la carpeta.
if (str_starts_with($uri, '/uploads/')) {
    $uploadsDir = realpath(__DIR__ . '/uploads');
    $filePath = realpath(__DIR__ . $uri);
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'mp4', 'webm'];

    if (
        $uploadsDir !== false
        && $filePath !== false
        && str_starts_with($filePath, $uploadsDir . DIRECTORY_SEPARATOR)
        && is_file($filePath)
        && in_array(strtolower(pathinfo($filePath, PATHINFO_EXTENSION)), $allowedExtensions, true)
    ) {
        $mime = mime_content_type($filePath) ?: 'application/octet-stream';
        header("Content-Type: {$mime}");
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: public, max-age=31536000, immutable');
        readfile($filePath);
        return true;
    }

    return $notFound();
}

// El front controller sí se ejecuta.
if (in_array($uri, ['/index.php', '/router.php'], true)) {
    return false;
}

// Cualquier otro archivo existente se considera privado.
if ($uri !== '/' && file_exists(__DIR__ . $uri) && !is_dir(__DIR__ . $uri)) {
    return $notFound();
}

require_once __DIR__ . '/index.php';
return true;
