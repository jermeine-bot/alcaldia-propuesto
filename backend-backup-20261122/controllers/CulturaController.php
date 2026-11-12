<?php

namespace Controllers;

use Config\Database;
use PDO;
use Throwable;

class CulturaController {
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

    private static function ensureSchema(PDO $pdo): void {
        try {
            $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
            if ($driver === 'mysql') {
                // ImageUploader guarda Base64; TEXT (64 KB) es insuficiente en MySQL.
                try {
                    $pdo->exec("ALTER TABLE cultura MODIFY COLUMN image_url LONGTEXT");
                } catch (Throwable $e) {
                    // Ignorar si la columna ya es LONGTEXT o no se puede alterar.
                }
            }
        } catch (Throwable $e) {
            // Ignorar errores de introspección.
        }
    }

    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        self::ensureSchema($pdo);
        $stmt = $pdo->query("SELECT * FROM cultura ORDER BY created_at DESC");
        $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        foreach ($rows as &$r) {
            $r['is_published'] = (bool)($r['is_published'] ?? true);
            $img = !empty($r['image_url']) ? $r['image_url'] : (!empty($r['image']) ? $r['image'] : '/img/noticias/festival de la poseia.jpg');
            $r['image_url'] = $img;
            $r['image'] = $img;
            $r['img'] = $img;
            $r['date'] = $r['event_date'] ?? '';
        }
        return $rows;
    }

    public static function getAll(): void {
        try {
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function create(array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $title = trim((string)($data['title'] ?? ''));
            if ($title === '') {
                http_response_code(400);
                echo json_encode(['error' => 'El título del evento es obligatorio.']);
                return;
            }

            $id = $data['id'] ?? ('cultura-' . bin2hex(random_bytes(8)));
            $image = $data['image'] ?? $data['image_url'] ?? $data['img'] ?? '/img/noticias/festival de la poseia.jpg';
            $eventDate = $data['event_date'] ?? $data['date'] ?? '';

            $pdo = Database::getConnection();
            self::ensureSchema($pdo);
            $stmt = $pdo->prepare("
                INSERT INTO cultura (id, icon, title, `desc`, event_date, event_time, location, image_url, is_published)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id,
                $data['icon'] ?? 'fa-cross',
                $title,
                $data['desc'] ?? $data['summary'] ?? '',
                $eventDate,
                $data['event_time'] ?? 'Todo el día',
                $data['location'] ?? 'León, Nicaragua',
                $image,
                isset($data['is_published']) ? ($data['is_published'] ? 1 : 0) : 1
            ]);

            http_response_code(201);
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear evento: ' . $e->getMessage()]);
        }
    }

    public static function update(string $id, array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $title = trim((string)($data['title'] ?? ''));
            if ($title === '') {
                http_response_code(400);
                echo json_encode(['error' => 'El título del evento es obligatorio.']);
                return;
            }

            $image = $data['image'] ?? $data['image_url'] ?? $data['img'] ?? '/img/noticias/festival de la poseia.jpg';
            $eventDate = $data['event_date'] ?? $data['date'] ?? '';

            $pdo = Database::getConnection();
            self::ensureSchema($pdo);
            $stmt = $pdo->prepare("
                UPDATE cultura SET icon=?, title=?, `desc`=?, event_date=?, event_time=?, location=?, image_url=?, is_published=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            ");
            $stmt->execute([
                $data['icon'] ?? 'fa-cross',
                $title,
                $data['desc'] ?? $data['summary'] ?? '',
                $eventDate,
                $data['event_time'] ?? 'Todo el día',
                $data['location'] ?? 'León, Nicaragua',
                $image,
                isset($data['is_published']) ? ($data['is_published'] ? 1 : 0) : 1,
                $id
            ]);

            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar evento: ' . $e->getMessage()]);
        }
    }

    public static function delete(string $id): void {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("DELETE FROM cultura WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar evento: ' . $e->getMessage()]);
        }
    }
}
