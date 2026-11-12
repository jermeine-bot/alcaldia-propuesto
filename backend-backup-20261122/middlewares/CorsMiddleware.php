<?php

namespace Middlewares;

use Config\Database;

class CorsMiddleware {
    public static function handle(): void {
        $origin = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
        $appEnv = strtolower((string)Database::env('APP_ENV', 'production'));

        $configured = (string)Database::env(
            'CORS_ALLOWED_ORIGINS',
            (string)Database::env('FRONTEND_URL', '')
        );
        $allowedOrigins = array_values(array_filter(array_map('trim', explode(',', $configured))));

        // En desarrollo se aceptan los puertos locales habituales de Vite.
        if ($appEnv !== 'production' && $origin !== '' && preg_match('~^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$~i', $origin)) {
            $allowedOrigins[] = $origin;
        }

        if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Vary: Origin');
            header('Access-Control-Allow-Credentials: true');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, Origin, X-Requested-With');
        header('Access-Control-Max-Age: 600');

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
