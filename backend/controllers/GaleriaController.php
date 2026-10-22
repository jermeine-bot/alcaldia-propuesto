<?php

namespace Controllers;

use Config\Database;
use PDO;
use Throwable;

class GaleriaController {

    public static function ensureTable(PDO $pdo): void {
        try {
            $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
            if ($driver === 'mysql') {
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS galeria (
                        id VARCHAR(50) PRIMARY KEY,
                        title VARCHAR(255) DEFAULT '',
                        description TEXT,
                        category VARCHAR(100) DEFAULT 'General',
                        image LONGTEXT NOT NULL,
                        display_order INT DEFAULT 0,
                        is_active TINYINT(1) DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ");
            } else {
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS galeria (
                        id TEXT PRIMARY KEY,
                        title TEXT DEFAULT '',
                        description TEXT,
                        category TEXT DEFAULT 'General',
                        image TEXT NOT NULL,
                        display_order INTEGER DEFAULT 0,
                        is_active INTEGER DEFAULT 1,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                ");
            }
        } catch (Throwable $e) {
            error_log("Error in GaleriaController::ensureTable: " . $e->getMessage());
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
        $row['image'] = $row['image'] ?? '';
        $row['img'] = $row['image'];
        $row['title'] = $row['title'] ?? '';
        $row['description'] = $row['description'] ?? '';
        $row['category'] = $row['category'] ?? 'General';
        return $row;
    }

    public static function getAll(): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->query("SELECT * FROM galeria ORDER BY display_order ASC, created_at DESC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            $rows = array_map([self::class, 'normalizeRow'], $rows);

            echo json_encode($rows);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener la galería: ' . $e->getMessage()]);
        }
    }

    public static function getPublic(): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->query("SELECT * FROM galeria WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            $rows = array_map([self::class, 'normalizeRow'], $rows);

            echo json_encode($rows);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener la galería pública: ' . $e->getMessage()]);
        }
    }

    public static function getById(string $id): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->prepare("SELECT * FROM galeria WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'Imagen de galería no encontrada.']);
                return;
            }

            echo json_encode(self::normalizeRow($row));
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function create(array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $image = trim((string)($data['image'] ?? $data['img'] ?? ''));
            if ($image === '') {
                http_response_code(400);
                echo json_encode(['error' => 'La imagen es obligatoria.']);
                return;
            }

            $id = $data['id'] ?? ('galeria_' . time() . '_' . bin2hex(random_bytes(4)));
            $title = trim((string)($data['title'] ?? ''));
            $description = (string)($data['description'] ?? '');
            $category = trim((string)($data['category'] ?? 'General')) ?: 'General';
            $displayOrder = isset($data['display_order']) ? (int)$data['display_order'] : 0;
            $isActive = isset($data['is_active']) ? (int)$data['is_active'] : (isset($data['isActive']) ? (int)$data['isActive'] : 1);

            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->prepare("
                INSERT INTO galeria (id, title, description, category, image, display_order, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ");
            $stmt->execute([$id, $title, $description, $category, $image, $displayOrder, $isActive]);

            self::getById($id);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al guardar la imagen de la galería: ' . $e->getMessage()]);
        }
    }

    public static function update(string $id, array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $image = trim((string)($data['image'] ?? $data['img'] ?? ''));
            if ($image === '') {
                http_response_code(400);
                echo json_encode(['error' => 'La imagen es obligatoria.']);
                return;
            }

            $title = trim((string)($data['title'] ?? ''));
            $description = (string)($data['description'] ?? '');
            $category = trim((string)($data['category'] ?? 'General')) ?: 'General';
            $displayOrder = isset($data['display_order']) ? (int)$data['display_order'] : 0;
            $isActive = isset($data['is_active']) ? (int)$data['is_active'] : (isset($data['isActive']) ? (int)$data['isActive'] : 1);

            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->prepare("
                UPDATE galeria
                SET title = ?, description = ?, category = ?, image = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $stmt->execute([$title, $description, $category, $image, $displayOrder, $isActive, $id]);

            if ($stmt->rowCount() === 0) {
                $check = $pdo->prepare("SELECT id FROM galeria WHERE id = ?");
                $check->execute([$id]);
                if (!$check->fetch()) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Imagen de galería no encontrada.']);
                    return;
                }
            }

            self::getById($id);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar la imagen de la galería: ' . $e->getMessage()]);
        }
    }

    public static function toggleActive(string $id): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $update = $pdo->prepare("
                UPDATE galeria
                SET is_active = CASE WHEN COALESCE(is_active, 1) = 1 THEN 0 ELSE 1 END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $update->execute([$id]);

            if ($update->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Imagen de galería no encontrada.']);
                return;
            }

            self::getById($id);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al cambiar el estado de la imagen: ' . $e->getMessage()]);
        }
    }

    public static function delete(string $id): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->prepare("DELETE FROM galeria WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Imagen eliminada correctamente.']);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar la imagen: ' . $e->getMessage()]);
        }
    }

    public static function uploadImage(): void {
        try {
            if (!isset($_FILES['image']) && !isset($_FILES['file'])) {
                http_response_code(400);
                echo json_encode(['error' => 'No se subió ningún archivo de imagen.']);
                return;
            }

            $file = $_FILES['image'] ?? $_FILES['file'];
            if ($file['error'] !== UPLOAD_ERR_OK) {
                $tooLarge = in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true);
                http_response_code($tooLarge ? 413 : 400);
                echo json_encode(['error' => $tooLarge
                    ? 'El servidor rechazó la imagen por tamaño. El máximo permitido es 15 MB.'
                    : 'Error al transferir el archivo: ' . $file['error']]);
                return;
            }
            if (($file['size'] ?? 0) > 15 * 1024 * 1024) {
                http_response_code(413);
                echo json_encode(['error' => 'La imagen no puede superar 15 MB.']);
                return;
            }

            $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            if (!in_array($mime, $allowedMimeTypes)) {
                http_response_code(400);
                echo json_encode(['error' => 'Formato no permitido. Solo se aceptan JPEG, PNG, WEBP y GIF.']);
                return;
            }

            $uploadsDir = dirname(__DIR__) . '/uploads';
            if (!is_dir($uploadsDir)) {
                mkdir($uploadsDir, 0777, true);
            }

            $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'][$mime];
            $filename = 'galeria_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . strtolower($ext);
            $dest = $uploadsDir . '/' . $filename;

            if (!move_uploaded_file($file['tmp_name'], $dest)) {
                http_response_code(500);
                echo json_encode(['error' => 'No se pudo mover la imagen al directorio de destino.']);
                return;
            }

            echo json_encode(['url' => "/uploads/{$filename}"]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al subir imagen: ' . $e->getMessage()]);
        }
    }
}
