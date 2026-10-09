<?php

namespace Controllers;

use Config\Database;
use Config\Jwt;
use Services\AuditService;
use PDO;

class AuthController {
    public static function redirectLogin(): void {
        $frontendUrl = rtrim((string)Database::env('FRONTEND_URL', 'http://localhost:5173'), '/');
        header("Location: {$frontendUrl}/admin/login", true, 302);
        exit;
    }

    public static function login(array $body): void {
        $email = trim((string)($body['email'] ?? ''));
        $password = (string)($body['password'] ?? '');

        if ($email === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Debes proporcionar correo y contraseña.']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(email) = ?");
        $stmt->execute([strtolower($email)]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password'])) {
            AuditService::logAction(
                ['email' => $email],
                'LOGIN_FALLIDO',
                'Autenticación',
                "Intento de acceso fallido para {$email}"
            );
            http_response_code(401);
            echo json_encode(['error' => 'Credenciales inválidas. Verifica tu correo o contraseña.']);
            return;
        }

        $tokenPayload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role']
        ];

        $secret = Database::env('JWT_SECRET', 'alcaldia_leon_dev_only_secret');
        $token = Jwt::sign($tokenPayload, $secret, 7 * 86400);

        AuditService::logAction(
            $user,
            'LOGIN_EXITOSO',
            'Autenticación',
            "Inicio de sesión exitoso como [{$user['role']}]"
        );

        echo json_encode([
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'avatar' => $user['avatar'] ?? '/img/nav_logo/logo nav2.png'
            ],
            'token' => $token
        ]);
    }

    public static function getMe(array $user): void {
        echo json_encode([
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]);
    }

    public static function changePassword(array $user, array $body): void {
        $currentPassword = (string)($body['currentPassword'] ?? '');
        $newPassword = (string)($body['newPassword'] ?? '');

        if ($currentPassword === '' || strlen($newPassword) < 8) {
            http_response_code(400);
            echo json_encode(['error' => 'Proporciona tu contraseña actual y una nueva de al menos 8 caracteres.']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontró el usuario.']);
            return;
        }

        if (!password_verify($currentPassword, $row['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'La contraseña actual no es correcta.']);
            return;
        }

        $hashedNew = password_hash($newPassword, PASSWORD_BCRYPT);
        $update = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $update->execute([$hashedNew, $user['id']]);

        AuditService::logAction(
            $user,
            'CAMBIO_CONTRASEÑA',
            'Seguridad',
            "El usuario {$user['email']} cambió su contraseña."
        );

        echo json_encode(['message' => 'Contraseña actualizada correctamente.']);
    }
}
