<?php

namespace Controllers;

use Config\Database;
use Services\AuditService;
use PDO;

class UsersController {
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
        $role = $body['role'] ?? 'editor';

        if ($name === '' || $email === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre, correo y contraseña son obligatorios.']);
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
        $hashed = password_hash($password, PASSWORD_BCRYPT);

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

        if (isset($body['name'])) {
            $updates[] = "name = ?";
            $params[] = trim((string)$body['name']);
        }
        if (isset($body['role'])) {
            $updates[] = "role = ?";
            $params[] = $body['role'];
        }
        if (!empty($body['password'])) {
            $updates[] = "password = ?";
            $params[] = password_hash($body['password'], PASSWORD_BCRYPT);
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No se proporcionaron campos para actualizar.']);
            return;
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
