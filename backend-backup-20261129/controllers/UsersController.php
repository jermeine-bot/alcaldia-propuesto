<?php

namespace Controllers;

use Config\Database;
use Services\AuditService;
use PDO;

class UsersController {
    private const PASSWORD_HASH_OPTIONS = ['cost' => 12];
    private const ALLOWED_ROLES = ['superadmin', 'editor', 'visor'];
    private const PASSWORD_MIN_LENGTH = 8;
    private const PASSWORD_MAX_LENGTH = 72;

    private static function validatePassword(string $password): ?string {
        if (strlen($password) < self::PASSWORD_MIN_LENGTH) {
            return 'La contraseña debe tener al menos ' . self::PASSWORD_MIN_LENGTH . ' caracteres.';
        }
        if (strlen($password) > self::PASSWORD_MAX_LENGTH) {
            return 'La contraseña no puede superar los ' . self::PASSWORD_MAX_LENGTH . ' caracteres.';
        }
        if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/\d/', $password)) {
            return 'La contraseña debe incluir al menos una letra y un número.';
        }
        return null;
    }

    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT id, name, email, role, avatar, created_at, updated_at FROM users ORDER BY created_at ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getAll(): void {
        echo json_encode(self::fetchAll());
    }

    public static function create(array $user, array $body): void {
        $name = trim((string)($body['name'] ?? ''));
        $email = trim(strtolower((string)($body['email'] ?? '')));
        $password = (string)($body['password'] ?? '');
        $role = (string)($body['role'] ?? 'editor');

        if ($name === '' || $email === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre, correo y contraseña son obligatorios.']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Ingresa un correo electrónico válido.']);
            return;
        }

        if (!in_array($role, self::ALLOWED_ROLES, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Rol no válido. Usa superadmin, editor o visor.']);
            return;
        }

        $policyError = self::validatePassword($password);
        if ($policyError !== null) {
            http_response_code(400);
            echo json_encode(['error' => $policyError]);
            return;
        }

        $pdo = Database::getConnection();
        $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$email]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Ya existe un usuario con ese correo.']);
            return;
        }

        $id = bin2hex(random_bytes(16));
        $hashed = password_hash($password, PASSWORD_BCRYPT, self::PASSWORD_HASH_OPTIONS);

        $stmt = $pdo->prepare("
            INSERT INTO users (id, name, email, password, role, avatar)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$id, $name, $email, $hashed, $role, '/img/nav_logo/logo nav2.png']);

        AuditService::logAction(
            $user,
            'CREAR_USUARIO',
            'Usuarios',
            "Nuevo usuario creado: {$email} con rol [{$role}]"
        );

        http_response_code(201);
        echo json_encode(self::fetchAll());
    }

    public static function update(array $user, string $id, array $body): void {
        $pdo = Database::getConnection();
        $check = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $check->execute([$id]);
        if (!$check->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontró el usuario.']);
            return;
        }

        $updates = [];
        $params = [];
        $invalidateTokens = false;

        if (isset($body['name'])) {
            $updates[] = "name = ?";
            $params[] = trim((string)$body['name']);
        }
        if (isset($body['role'])) {
            $role = (string)$body['role'];
            if (!in_array($role, self::ALLOWED_ROLES, true)) {
                http_response_code(400);
                echo json_encode(['error' => 'Rol no válido. Usa superadmin, editor o visor.']);
                return;
            }
            $updates[] = "role = ?";
            $params[] = $role;
            $invalidateTokens = true;
        }
        if (!empty($body['password'])) {
            $policyError = self::validatePassword((string)$body['password']);
            if ($policyError !== null) {
                http_response_code(400);
                echo json_encode(['error' => $policyError]);
                return;
            }
            $updates[] = "password = ?";
            $params[] = password_hash((string)$body['password'], PASSWORD_BCRYPT, self::PASSWORD_HASH_OPTIONS);
            $invalidateTokens = true;
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No se proporcionaron campos para actualizar.']);
            return;
        }

        if ($invalidateTokens) {
            $updates[] = "token_version = token_version + 1";
        }
        $updates[] = "updated_at = CURRENT_TIMESTAMP";
        $params[] = $id;

        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        AuditService::logAction(
            $user,
            'EDITAR_USUARIO',
            'Usuarios',
            "Usuario {$id} actualizado"
        );

        echo json_encode(self::fetchAll());
    }

    public static function delete(array $user, string $id): void {
        if ($id === $user['id']) {
            http_response_code(400);
            echo json_encode(['error' => 'No puedes eliminar tu propia cuenta de usuario.']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);

        AuditService::logAction(
            $user,
            'ELIMINAR_USUARIO',
            'Usuarios',
            "Usuario {$id} eliminado"
        );

        echo json_encode(self::fetchAll());
    }
}
