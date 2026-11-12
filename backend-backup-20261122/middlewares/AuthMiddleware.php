<?php

namespace Middlewares;

use Config\Database;
use Config\Jwt;
use PDO;

class AuthMiddleware {
    public static function handle(): array {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authHeader = null;

        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $authHeader = $value;
                break;
            }
        }

        if (!$authHeader) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        }

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            http_response_code(401);
            echo json_encode(['error' => 'Se requiere un token de acceso.']);
            exit;
        }

        $token = trim(substr($authHeader, 7));
        if ($token === '') {
            http_response_code(401);
            echo json_encode(['error' => 'El token de acceso está vacío.']);
            exit;
        }

        $secret = Database::env('JWT_SECRET', 'alcaldia_leon_dev_only_secret');
        $payload = Jwt::verify($token, $secret);

        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'El token de acceso no es válido o ha expirado.']);
            exit;
        }

        // Verifica que la sesión siga vigente (revocación tras cambiar credenciales o rol).
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT token_version FROM users WHERE id = ?");
        $stmt->execute([(string)($payload['id'] ?? '')]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(401);
            echo json_encode(['error' => 'La cuenta asociada a esta sesión ya no existe.']);
            exit;
        }

        $tokenVersion = (int)($payload['tv'] ?? 0);
        if ($tokenVersion !== (int)($row['token_version'] ?? 0)) {
            http_response_code(401);
            echo json_encode(['error' => 'La sesión ya no es válida. Inicia sesión nuevamente.']);
            exit;
        }

        return $payload;
    }
}
