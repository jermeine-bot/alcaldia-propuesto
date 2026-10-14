<?php

namespace Controllers;

use Config\Database;
use PDO;
use Throwable;

class TurismoController {
    private static function ensureSchema(PDO $pdo): void {
        try {
            $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
            if ($driver === 'mysql') {
                try {
                    $pdo->exec("ALTER TABLE turismo MODIFY COLUMN img LONGTEXT");
                } catch (Throwable $e) {}

                $cols = $pdo->query("SHOW COLUMNS FROM turismo LIKE 'linkUrl'")->fetchAll();
                if (empty($cols)) {
                    $pdo->exec("ALTER TABLE turismo ADD COLUMN linkUrl TEXT");
                }
            } else {
                $cols = $pdo->query("PRAGMA table_info(turismo)")->fetchAll(PDO::FETCH_ASSOC);
                $hasLink = false;
                foreach ($cols as $col) {
                    if (isset($col['name']) && strtolower($col['name']) === 'linkurl') {
                        $hasLink = true;
                        break;
                    }
                }
                if (!$hasLink) {
                    $pdo->exec("ALTER TABLE turismo ADD COLUMN linkUrl TEXT DEFAULT ''");
                }
            }
        } catch (Throwable $e) {
            // Ignorar si no requiere alteración
        }
    }

    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        self::ensureSchema($pdo);
        $stmt = $pdo->query("SELECT * FROM turismo ORDER BY display_order ASC, created_at ASC");
        $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        foreach ($rows as &$r) {
            $r['is_published'] = (bool)($r['is_published'] ?? true);
            $r['display_order'] = (int)($r['display_order'] ?? 0);

            $imgVal = !empty($r['img']) ? $r['img'] : (!empty($r['image']) ? $r['image'] : '/img/turismo/catedral.jpg');
            $r['img'] = $imgVal;
            $r['image'] = $imgVal;

            // Buscar linkUrl sin importar mayúsculas/minúsculas que devuelva PDO
            $linkVal = $r['linkUrl'] ?? $r['linkurl'] ?? $r['url'] ?? '';
            $r['linkUrl'] = (string)$linkVal;
            $r['url'] = (string)$linkVal;
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

    public static function create(array $body): void {
        try {
            $title = trim((string)($body['title'] ?? ''));
            if ($title === '') {
                http_response_code(400);
                echo json_encode(['error' => 'El título del destino es obligatorio.']);
                return;
            }

            $img = $body['image'] ?? $body['img'] ?? '/img/turismo/catedral.jpg';
            $linkUrl = trim((string)($body['linkUrl'] ?? $body['linkurl'] ?? $body['url'] ?? $body['link'] ?? ''));
            $id = $body['id'] ?? ('turismo-' . bin2hex(random_bytes(8)));

            $pdo = Database::getConnection();
            self::ensureSchema($pdo);

            $stmt = $pdo->prepare("
                INSERT INTO turismo (id, img, title, `desc`, category, location, content, linkUrl, is_published, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id,
                $img,
                $title,
                $body['desc'] ?? '',
                $body['category'] ?? '',
                $body['location'] ?? '',
                $body['content'] ?? '',
                $linkUrl,
                isset($body['is_published']) ? ($body['is_published'] ? 1 : 0) : 1,
                (int)($body['display_order'] ?? 0)
            ]);

            http_response_code(201);
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear destino: ' . $e->getMessage()]);
        }
    }

    public static function update(string $id, array $body): void {
        try {
            $title = trim((string)($body['title'] ?? ''));
            if ($title === '') {
                http_response_code(400);
                echo json_encode(['error' => 'El título del destino es obligatorio.']);
                return;
            }

            $img = $body['image'] ?? $body['img'] ?? '/img/turismo/catedral.jpg';
            $linkUrl = trim((string)($body['linkUrl'] ?? $body['linkurl'] ?? $body['url'] ?? $body['link'] ?? ''));

            $pdo = Database::getConnection();
            self::ensureSchema($pdo);

            $stmt = $pdo->prepare("
                UPDATE turismo SET img=?, title=?, `desc`=?, category=?, location=?, content=?, linkUrl=?, is_published=?, display_order=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            ");
            $stmt->execute([
                $img,
                $title,
                $body['desc'] ?? '',
                $body['category'] ?? '',
                $body['location'] ?? '',
                $body['content'] ?? '',
                $linkUrl,
                isset($body['is_published']) ? ($body['is_published'] ? 1 : 0) : 1,
                (int)($body['display_order'] ?? 0),
                $id
            ]);

            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar destino: ' . $e->getMessage()]);
        }
    }

    public static function delete(string $id): void {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("DELETE FROM turismo WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar destino: ' . $e->getMessage()]);
        }
    }
}