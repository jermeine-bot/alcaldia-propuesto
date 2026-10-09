<?php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Si es un archivo estático en uploads, servirlo directamente
if (str_starts_with($uri, '/uploads/')) {
    $filePath = __DIR__ . $uri;
    if (file_exists($filePath) && !is_dir($filePath)) {
        $mime = mime_content_type($filePath) ?: 'application/octet-stream';
        header("Content-Type: {$mime}");
        header('Access-Control-Allow-Origin: *');
        readfile($filePath);
        return true;
    }
}

// Si es un archivo estático real existente, dejar que PHP lo sirva
$staticFile = __DIR__ . $uri;
if ($uri !== '/' && file_exists($staticFile) && !is_dir($staticFile)) {
    return false;
}

// Redirigir todas las demás peticiones al Front Controller
require_once __DIR__ . '/index.php';
