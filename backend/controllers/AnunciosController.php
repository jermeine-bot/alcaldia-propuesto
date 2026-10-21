<?php

namespace Controllers;

use Config\Database;
use PDO;
use Throwable;

class AnunciosController {

    public static function ensureTable(PDO $pdo): void {
        try {
            $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
            if ($driver === 'mysql') {
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS anuncios (
                        id VARCHAR(50) PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        image MEDIUMTEXT NOT NULL,
                        linkUrl VARCHAR(500) DEFAULT '',
                        buttonText VARCHAR(100) DEFAULT 'Ver más información',
                        badge VARCHAR(100) DEFAULT 'Aviso Importante',
                        is_active TINYINT(1) DEFAULT 1,
                        display_order INT DEFAULT 0,
                        start_date VARCHAR(50) DEFAULT NULL,
                        end_date VARCHAR(50) DEFAULT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ");
            } else {
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS anuncios (
                        id TEXT PRIMARY KEY,
                        title TEXT NOT NULL,
                        description TEXT,
                        image TEXT NOT NULL,
                        linkUrl TEXT DEFAULT '',
                        buttonText TEXT DEFAULT 'Ver más información',
                        badge TEXT DEFAULT 'Aviso Importante',
                        is_active INTEGER DEFAULT 1,
                        display_order INTEGER DEFAULT 0,
                        start_date TEXT,
                        end_date TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                ");
            }
        } catch (Throwable $e) {
            error_log("Error in AnunciosController::ensureTable: " . $e->getMessage());
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
        $row['linkUrl'] = $row['linkUrl'] ?? $row['link_url'] ?? '';
        $row['buttonText'] = $row['buttonText'] ?? $row['button_text'] ?? 'Ver más información';
        $row['badge'] = $row['badge'] ?? 'Aviso Importante';
        return $row;
    }

    public static function getAll(): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->query("SELECT * FROM anuncios ORDER BY display_order ASC, created_at DESC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

            $rows = array_map([self::class, 'normalizeRow'], $rows);

            echo json_encode($rows);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener anuncios: ' . $e->getMessage()]);
        }
    }

    public static function getPublic(): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->query("SELECT * FROM anuncios WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

            $today = date('Y-m-d');
            $activeRows = [];

            foreach ($rows as $row) {
                // Validación opcional de fechas de vigencia
                if (!empty($row['start_date']) && $row['start_date'] > $today) {
                    continue;
                }
                if (!empty($row['end_date']) && $row['end_date'] < $today) {
                    continue;
                }
                $activeRows[] = self::normalizeRow($row);
            }

            echo json_encode($activeRows);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener anuncios públicos: ' . $e->getMessage()]);
        }
    }

    public static function getById(string $id): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->prepare("SELECT * FROM anuncios WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'Anuncio no encontrado.']);
                return;
            }

            echo json_encode(self::normalizeRow($row));
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function create(?array $user, array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $title = trim($data['title'] ?? '');
            $image = trim($data['image'] ?? '');

            if (empty($title)) {
                http_response_code(400);
                echo json_encode(['error' => 'El título del anuncio es obligatorio.']);
                return;
            }

            if (empty($image)) {
                http_response_code(400);
                echo json_encode(['error' => 'La imagen del flyer o anuncio es obligatoria.']);
                return;
            }

            $id = $data['id'] ?? ('anuncio_' . time() . '_' . bin2hex(random_bytes(4)));
            $description = $data['description'] ?? '';
            $linkUrl = $data['linkUrl'] ?? $data['link_url'] ?? '';
            $buttonText = $data['buttonText'] ?? $data['button_text'] ?? 'Ver más información';
            $badge = $data['badge'] ?? 'Aviso Importante';
            $isActive = isset($data['is_active']) ? (int)$data['is_active'] : (isset($data['isActive']) ? (int)$data['isActive'] : 1);
            $displayOrder = isset($data['display_order']) ? (int)$data['display_order'] : (isset($data['displayOrder']) ? (int)$data['displayOrder'] : 0);
            $startDate = !empty($data['start_date']) ? $data['start_date'] : null;
            $endDate = !empty($data['end_date']) ? $data['end_date'] : null;

            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->prepare("
                INSERT INTO anuncios (id, title, description, image, linkUrl, buttonText, badge, is_active, display_order, start_date, end_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ");

            $stmt->execute([
                $id,
                $title,
                $description,
                $image,
                $linkUrl,
                $buttonText,
                $badge,
                $isActive,
                $displayOrder,
                $startDate,
                $endDate
            ]);

            self::getById($id);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear el anuncio: ' . $e->getMessage()]);
        }
    }

    public static function update(string $id, ?array $user, array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $title = trim($data['title'] ?? '');
            $image = trim($data['image'] ?? '');

            if (empty($title)) {
                http_response_code(400);
                echo json_encode(['error' => 'El título del anuncio es obligatorio.']);
                return;
            }

            if (empty($image)) {
                http_response_code(400);
                echo json_encode(['error' => 'La imagen del anuncio es obligatoria.']);
                return;
            }

            $description = $data['description'] ?? '';
            $linkUrl = $data['linkUrl'] ?? $data['link_url'] ?? '';
            $buttonText = $data['buttonText'] ?? $data['button_text'] ?? 'Ver más información';
            $badge = $data['badge'] ?? 'Aviso Importante';
            $isActive = isset($data['is_active']) ? (int)$data['is_active'] : (isset($data['isActive']) ? (int)$data['isActive'] : 1);
            $displayOrder = isset($data['display_order']) ? (int)$data['display_order'] : (isset($data['displayOrder']) ? (int)$data['displayOrder'] : 0);
            $startDate = !empty($data['start_date']) ? $data['start_date'] : null;
            $endDate = !empty($data['end_date']) ? $data['end_date'] : null;

            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->prepare("
                UPDATE anuncios 
                SET title = ?, description = ?, image = ?, linkUrl = ?, buttonText = ?, badge = ?, 
                    is_active = ?, display_order = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");

            $stmt->execute([
                $title,
                $description,
                $image,
                $linkUrl,
                $buttonText,
                $badge,
                $isActive,
                $displayOrder,
                $startDate,
                $endDate,
                $id
            ]);

            self::getById($id);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar el anuncio: ' . $e->getMessage()]);
        }
    }

    public static function toggleActive(string $id, ?array $user): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            // Cambia el estado en una sola operación para evitar que dos clics
            // rápidos lean el mismo valor y terminen dejando el anuncio activo.
            $update = $pdo->prepare("
                UPDATE anuncios
                SET is_active = CASE WHEN COALESCE(is_active, 1) = 1 THEN 0 ELSE 1 END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $update->execute([$id]);

            if ($update->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Anuncio no encontrado.']);
                return;
            }

            self::getById($id);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al cambiar estado del anuncio: ' . $e->getMessage()]);
        }
    }

    public static function delete(string $id, ?array $user): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->prepare("DELETE FROM anuncios WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Anuncio eliminado correctamente.']);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar anuncio: ' . $e->getMessage()]);
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
            $filename = 'anuncio_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . strtolower($ext);
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
