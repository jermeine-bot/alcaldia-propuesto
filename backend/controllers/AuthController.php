<?php

namespace Controllers;

use Config\Database;
use Config\Jwt;
use Services\AuditService;
use PDO;
use Throwable;

class AuthController {
    private const MAX_LOGIN_ATTEMPTS = 5;
    private const LOGIN_WINDOW_MINUTES = 15;
    private const PASSWORD_MIN_LENGTH = 8;
    private const PASSWORD_MAX_LENGTH = 72;

    public static function redirectLogin(): void {
        $frontendUrl = rtrim((string)Database::env('FRONTEND_URL', 'http://localhost:5173'), '/');
        header("Location: {$frontendUrl}/admin/login", true, 302);
        exit;
    }

    public static function login(array $body): void {
        $email = strtolower(trim((string)($body['email'] ?? '')));
        $password = (string)($body['password'] ?? '');

        if ($email === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Debes proporcionar correo y contraseña.']);
            return;
        }

        $ip = self::clientIp();
        $attempts = AuditService::countRecentFailedLogins($email, $ip, self::LOGIN_WINDOW_MINUTES);

        if ($attempts >= self::MAX_LOGIN_ATTEMPTS) {
            AuditService::logAction(
                ['email' => $email],
                'LOGIN_BLOQUEADO',
                'Seguridad',
                "Bloqueo temporal tras {$attempts} intentos fallidos desde {$ip}."
            );
            http_response_code(429);
            echo json_encode(['error' => 'Demasiados intentos fallidos. Espera 15 minutos antes de volver a intentar.']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(email) = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password'])) {
            AuditService::logAction(
                ['email' => $email],
                'LOGIN_FALLIDO',
                'Autenticación',
                "Intento de acceso fallido para {$email} desde {$ip}"
            );
            http_response_code(401);
            echo json_encode(['error' => 'Credenciales inválidas. Verifica tu correo o contraseña.']);
            return;
        }

        // Actualiza el hash si el algoritmo/costo cambió.
        if (password_needs_rehash($user['password'], PASSWORD_BCRYPT)) {
            $rehash = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
            $rehash->execute([password_hash($password, PASSWORD_BCRYPT), $user['id']]);
        }

        $token = self::issueToken($user);

        AuditService::logAction(
            $user,
            'LOGIN_EXITOSO',
            'Autenticación',
            "Inicio de sesión exitoso como [{$user['role']}]"
        );

        echo json_encode([
            'user' => self::publicUser($user),
            'token' => $token
        ]);
    }

    public static function getMe(array $user): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id, name, email, role, avatar FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontró el usuario.']);
            return;
        }

        echo json_encode(self::publicUser($row));
    }

    /**
     * Actualiza las credenciales del usuario autenticado.
     * Exige la contraseña actual para cualquier cambio.
     */
    public static function updateCredentials(array $user, array $body): void {
        $currentPassword = (string)($body['currentPassword'] ?? '');

        if ($currentPassword === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Debes confirmar tu contraseña actual para guardar los cambios.']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontró el usuario.']);
            return;
        }

        if (!password_verify($currentPassword, $row['password'])) {
            AuditService::logAction(
                $row,
                'CAMBIO_CREDENCIALES_FALLIDO',
                'Seguridad',
                'Intento de cambio de credenciales con contraseña actual incorrecta.'
            );
            http_response_code(401);
            echo json_encode(['error' => 'La contraseña actual no es correcta.']);
            return;
        }

        $updates = [];
        $params = [];
        $changed = [];

        if (array_key_exists('name', $body)) {
            $name = trim((string)$body['name']);
            if ($name === '') {
                http_response_code(400);
                echo json_encode(['error' => 'El nombre no puede estar vacío.']);
                return;
            }
            $nameLength = function_exists('mb_strlen') ? mb_strlen($name) : strlen($name);
            if ($nameLength > 150) {
                http_response_code(400);
                echo json_encode(['error' => 'El nombre no puede superar los 150 caracteres.']);
                return;
            }
            if ($name !== $row['name']) {
                $updates[] = "name = ?";
                $params[] = $name;
                $changed[] = 'nombre';
            }
        }

        if (array_key_exists('email', $body)) {
            $email = strtolower(trim((string)$body['email']));
            if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['error' => 'Ingresa un correo electrónico válido.']);
                return;
            }
            if ($email !== strtolower((string)$row['email'])) {
                $check = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = ? AND id <> ?");
                $check->execute([$email, $row['id']]);
                if ($check->fetch()) {
                    http_response_code(409);
                    echo json_encode(['error' => 'El correo ya está registrado por otro usuario.']);
                    return;
                }
                $updates[] = "email = ?";
                $params[] = $email;
                $changed[] = 'correo';
            }
        }

        $newPassword = (string)($body['newPassword'] ?? '');
        if ($newPassword !== '') {
            $confirmPassword = (string)($body['confirmPassword'] ?? '');
            if ($confirmPassword !== '' && !hash_equals($newPassword, $confirmPassword)) {
                http_response_code(400);
                echo json_encode(['error' => 'La confirmación de la nueva contraseña no coincide.']);
                return;
            }
            if (password_verify($newPassword, $row['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'La nueva contraseña debe ser diferente a la actual.']);
                return;
            }
            $policyError = self::validatePassword($newPassword);
            if ($policyError !== null) {
                http_response_code(400);
                echo json_encode(['error' => $policyError]);
                return;
            }
            $updates[] = "password = ?";
            $params[] = password_hash($newPassword, PASSWORD_BCRYPT);
            $changed[] = 'contraseña';
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No se detectaron cambios en las credenciales.']);
            return;
        }

        $updates[] = "token_version = token_version + 1";
        $updates[] = "updated_at = CURRENT_TIMESTAMP";
        $params[] = $row['id'];

        try {
            $update = $pdo->prepare("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?");
            $update->execute($params);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudieron actualizar las credenciales.']);
            return;
        }

        $stmt = $pdo->prepare("SELECT id, name, email, role, avatar, token_version FROM users WHERE id = ?");
        $stmt->execute([$row['id']]);
        $fresh = $stmt->fetch(PDO::FETCH_ASSOC);

        $token = self::issueToken($fresh);

        AuditService::logAction(
            $fresh,
            'ACTUALIZAR_CREDENCIALES',
            'Seguridad',
            'Campos actualizados: ' . implode(', ', $changed)
        );

        echo json_encode([
            'message' => 'Credenciales actualizadas correctamente.',
            'user' => self::publicUser($fresh),
            'token' => $token
        ]);
    }

    /**
     * Mantiene compatibilidad con la ruta anterior de cambio de contraseña.
     */
    public static function changePassword(array $user, array $body): void {
        self::updateCredentials($user, $body);
    }

    private static function validatePassword(string $password): ?string {
        if (strlen($password) < self::PASSWORD_MIN_LENGTH) {
            return 'La contraseña debe tener al menos ' . self::PASSWORD_MIN_LENGTH . ' caracteres.';
        }
        if (strlen($password) > self::PASSWORD_MAX_LENGTH) {
            return 'La contraseña no puede superar los ' . self::PASSWORD_MAX_LENGTH . ' caracteres.';
        }
        if (!preg_match('/[A-Za-z]/', $password)) {
            return 'La contraseña debe incluir al menos una letra.';
        }
        if (!preg_match('/\d/', $password)) {
            return 'La contraseña debe incluir al menos un número.';
        }
        return null;
    }

    private static function issueToken(array $user): string {
        $payload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role'],
            'tv' => (int)($user['token_version'] ?? 0)
        ];

        $secret = Database::env('JWT_SECRET', 'alcaldia_leon_dev_only_secret');
        return Jwt::sign($payload, $secret, 7 * 86400);
    }

    private static function publicUser(array $row): array {
        return [
            'id' => $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'role' => $row['role'],
            'avatar' => $row['avatar'] ?? '/img/nav_logo/logo nav2.png'
        ];
    }

    private static function clientIp(): string {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if (str_contains($ip, ',')) {
            $ip = trim(explode(',', $ip)[0]);
        }
        return $ip;
    }
}
