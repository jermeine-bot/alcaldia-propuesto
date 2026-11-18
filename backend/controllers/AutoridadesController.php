<?php

namespace Controllers;

use Config\Database;
use Services\AuditService;
use PDO;
use Throwable;

class AutoridadesController {

    public static function ensureTable(PDO $pdo): void {
        try {
            $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
            if ($driver === 'mysql') {
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS autoridades (
                        id VARCHAR(50) PRIMARY KEY,
                        nombre VARCHAR(255) NOT NULL,
                        cargo VARCHAR(255) NOT NULL,
                        badge VARCHAR(100) DEFAULT 'Autoridad',
                        imagen LONGTEXT,
                        frase TEXT,
                        biografia TEXT,
                        responsabilidades LONGTEXT,
                        contacto VARCHAR(255),
                        telefono VARCHAR(100),
                        display_order INT DEFAULT 0,
                        is_active TINYINT(1) DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ");
            } else {
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS autoridades (
                        id TEXT PRIMARY KEY,
                        nombre TEXT NOT NULL,
                        cargo TEXT NOT NULL,
                        badge TEXT DEFAULT 'Autoridad',
                        imagen TEXT,
                        frase TEXT,
                        biografia TEXT,
                        responsabilidades TEXT,
                        contacto TEXT,
                        telefono TEXT,
                        display_order INTEGER DEFAULT 0,
                        is_active INTEGER DEFAULT 1,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                ");
            }
        } catch (Throwable $e) {
            error_log("Error in AutoridadesController::ensureTable: " . $e->getMessage());
        }
    }

    private static function getRawInput(): array {
        $raw = file_get_contents('php://input');
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }
        return $_POST ?: [];
    }

    private static function normalizeRow(array $row): array {
        $row['is_active'] = (bool)($row['is_active'] ?? 1);
        $row['isActive'] = $row['is_active'];
        $row['display_order'] = (int)($row['display_order'] ?? 0);

        // Decodificar responsabilidades (guardadas en JSON)
        $resp = [];
        if (!empty($row['responsabilidades'])) {
            if (is_array($row['responsabilidades'])) {
                $resp = $row['responsabilidades'];
            } else {
                $decoded = json_decode((string)$row['responsabilidades'], true);
                if (is_array($decoded)) {
                    $resp = $decoded;
                } else {
                    $resp = array_filter(array_map('trim', explode("\n", (string)$row['responsabilidades'])));
                }
            }
        }
        $row['responsabilidades'] = array_values(array_filter($resp));

        // Normalización de imagen y campos alternativos
        $img = !empty($row['imagen']) ? $row['imagen'] : (!empty($row['image']) ? $row['image'] : '/img/autoridades/alcaldesa.jpg');
        $row['imagen'] = $img;
        $row['image'] = $img;
        $row['badge'] = !empty($row['badge']) ? $row['badge'] : 'Autoridad';
        $row['contacto'] = $row['contacto'] ?? 'despachoalcaldeleon@gmail.com';
        $row['telefono'] = $row['telefono'] ?? '23113780';

        return $row;
    }

    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        self::ensureTable($pdo);
        $stmt = $pdo->query("SELECT * FROM autoridades ORDER BY display_order ASC, created_at ASC");
        $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        foreach ($rows as &$r) {
            $r = self::normalizeRow($r);
        }
        return $rows;
    }

    public static function getAll(): void {
        try {
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener autoridades: ' . $e->getMessage()]);
        }
    }

    public static function getById(string $id): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);
            $stmt = $pdo->prepare("SELECT * FROM autoridades WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'Autoridad no encontrada.']);
                return;
            }

            echo json_encode(self::normalizeRow($row));
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener autoridad: ' . $e->getMessage()]);
        }
    }

    public static function create(array $user, array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $nombre = trim((string)($data['nombre'] ?? $data['name'] ?? ''));
            $cargo = trim((string)($data['cargo'] ?? ''));

            if ($nombre === '' || $cargo === '') {
                http_response_code(400);
                echo json_encode(['error' => 'El nombre y el cargo de la autoridad son obligatorios.']);
                return;
            }

            $id = $data['id'] ?? ('autoridad-' . bin2hex(random_bytes(8)));
            $badge = trim((string)($data['badge'] ?? 'Autoridad'));
            $imagen = $data['imagen'] ?? $data['image'] ?? '/img/autoridades/alcaldesa.jpg';
            $frase = trim((string)($data['frase'] ?? ''));
            $biografia = trim((string)($data['biografia'] ?? $data['bio'] ?? ''));
            $contacto = trim((string)($data['contacto'] ?? $data['email'] ?? 'despachoalcaldeleon@gmail.com'));
            $telefono = trim((string)($data['telefono'] ?? $data['phone'] ?? '23113780'));
            $displayOrder = (int)($data['display_order'] ?? 0);
            $isActive = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1;

            $resp = $data['responsabilidades'] ?? [];
            if (!is_array($resp)) {
                $decoded = json_decode((string)$resp, true);
                $resp = is_array($decoded) ? $decoded : array_filter(array_map('trim', explode("\n", (string)$resp)));
            }
            $responsabilidadesJson = json_encode(array_values(array_filter($resp)), JSON_UNESCAPED_UNICODE);

            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->prepare("
                INSERT INTO autoridades (id, nombre, cargo, badge, imagen, frase, biografia, responsabilidades, contacto, telefono, display_order, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id,
                $nombre,
                $cargo,
                $badge,
                $imagen,
                $frase,
                $biografia,
                $responsabilidadesJson,
                $contacto,
                $telefono,
                $displayOrder,
                $isActive
            ]);

            AuditService::logAction(
                $user,
                'CREAR_AUTORIDAD',
                'Autoridades',
                "Autoridad creada: \"{$nombre}\" ({$cargo})"
            );

            http_response_code(201);
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear autoridad: ' . $e->getMessage()]);
        }
    }

    public static function update(string $id, array $user, array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $nombre = trim((string)($data['nombre'] ?? $data['name'] ?? ''));
            $cargo = trim((string)($data['cargo'] ?? ''));

            if ($nombre === '' || $cargo === '') {
                http_response_code(400);
                echo json_encode(['error' => 'El nombre y el cargo de la autoridad son obligatorios.']);
                return;
            }

            $badge = trim((string)($data['badge'] ?? 'Autoridad'));
            $imagen = $data['imagen'] ?? $data['image'] ?? '/img/autoridades/alcaldesa.jpg';
            $frase = trim((string)($data['frase'] ?? ''));
            $biografia = trim((string)($data['biografia'] ?? $data['bio'] ?? ''));
            $contacto = trim((string)($data['contacto'] ?? $data['email'] ?? 'despachoalcaldeleon@gmail.com'));
            $telefono = trim((string)($data['telefono'] ?? $data['phone'] ?? '23113780'));
            $displayOrder = (int)($data['display_order'] ?? 0);
            $isActive = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1;

            $resp = $data['responsabilidades'] ?? [];
            if (!is_array($resp)) {
                $decoded = json_decode((string)$resp, true);
                $resp = is_array($decoded) ? $decoded : array_filter(array_map('trim', explode("\n", (string)$resp)));
            }
            $responsabilidadesJson = json_encode(array_values(array_filter($resp)), JSON_UNESCAPED_UNICODE);

            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->prepare("
                UPDATE autoridades
                SET nombre=?, cargo=?, badge=?, imagen=?, frase=?, biografia=?, responsabilidades=?, contacto=?, telefono=?, display_order=?, is_active=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            ");
            $stmt->execute([
                $nombre,
                $cargo,
                $badge,
                $imagen,
                $frase,
                $biografia,
                $responsabilidadesJson,
                $contacto,
                $telefono,
                $displayOrder,
                $isActive,
                $id
            ]);

            AuditService::logAction(
                $user,
                'EDITAR_AUTORIDAD',
                'Autoridades',
                "Autoridad actualizada ID: {$id} ({$nombre})"
            );

            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar autoridad: ' . $e->getMessage()]);
        }
    }

    public static function delete(string $id, array $user): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->prepare("DELETE FROM autoridades WHERE id = ?");
            $stmt->execute([$id]);

            AuditService::logAction(
                $user,
                'ELIMINAR_AUTORIDAD',
                'Autoridades',
                "Autoridad eliminada ID: {$id}"
            );

            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar autoridad: ' . $e->getMessage()]);
        }
    }

    public static function uploadImage(): void {
        $file = $_FILES['image'] ?? null;
        if (!$file) {
            http_response_code(400);
            echo json_encode(['error' => 'No se seleccionó ninguna imagen.']);
            return;
        }

        $error = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($error !== UPLOAD_ERR_OK) {
            $tooLarge = in_array($error, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true);
            http_response_code($tooLarge ? 413 : 400);
            echo json_encode(['error' => $tooLarge
                ? 'El servidor rechazó la imagen por tamaño. El máximo permitido es 15 MB.'
                : 'No se pudo recibir la imagen.']);
            return;
        }

        if (($file['size'] ?? 0) > 15 * 1024 * 1024) {
            http_response_code(413);
            echo json_encode(['error' => 'La imagen no puede superar 15 MB.']);
            return;
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = $finfo ? finfo_file($finfo, $file['tmp_name']) : false;
        if ($finfo) {
            finfo_close($finfo);
        }

        $allowed = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
        ];

        if (!is_string($mime) || !isset($allowed[$mime])) {
            http_response_code(400);
            echo json_encode(['error' => 'Formato no permitido. Solo se aceptan JPEG, PNG, WEBP y GIF.']);
            return;
        }

        $ext = $allowed[$mime];
        $uploadsDir = dirname(__DIR__) . '/uploads';
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0755, true);
        }

        $filename = 'autoridad_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $target = $uploadsDir . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $target)) {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo guardar la imagen en el servidor.']);
            return;
        }

        echo json_encode(['url' => '/uploads/' . $filename]);
    }
}
