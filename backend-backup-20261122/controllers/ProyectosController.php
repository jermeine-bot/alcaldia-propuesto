<?php

namespace Controllers;

use Config\Database;
use PDO;
use Throwable;

class ProyectosController {
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
                try {
                    $pdo->exec("ALTER TABLE proyectos MODIFY COLUMN img LONGTEXT");
                } catch (Throwable $e) {}

                $cols = $pdo->query("SHOW COLUMNS FROM proyectos LIKE 'linkUrl'")->fetchAll();
                if (empty($cols)) {
                    $pdo->exec("ALTER TABLE proyectos ADD COLUMN linkUrl TEXT");
                }
            } else {
                $cols = $pdo->query("PRAGMA table_info(proyectos)")->fetchAll(PDO::FETCH_ASSOC);
                $hasLink = false;
                foreach ($cols as $col) {
                    if (isset($col['name']) && strtolower($col['name']) === 'linkurl') {
                        $hasLink = true;
                        break;
                    }
                }
                if (!$hasLink) {
                    $pdo->exec("ALTER TABLE proyectos ADD COLUMN linkUrl TEXT DEFAULT ''");
                }
            }
        } catch (Throwable $e) {
            // Ignorar si la columna ya existe
        }
    }

    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        self::ensureSchema($pdo);
        $stmt = $pdo->query("SELECT * FROM proyectos ORDER BY created_at DESC");
        $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        foreach ($rows as &$r) {
            $r['isCompleted'] = (bool)($r['isCompleted'] ?? false);
            $r['is_published'] = (bool)($r['is_published'] ?? true);
            $r['progress'] = (int)($r['progress'] ?? 0);

            $imgVal = !empty($r['img']) ? $r['img'] : (!empty($r['image']) ? $r['image'] : '/img/proyectos/proyecto1.jpg');
            $r['img'] = $imgVal;
            $r['image'] = $imgVal;

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

    public static function create(array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $title = trim((string)($data['title'] ?? ''));
            if ($title === '') {
                http_response_code(400);
                echo json_encode(['error' => 'El título del proyecto es obligatorio.']);
                return;
            }

            $id = $data['id'] ?? ('proyecto-' . bin2hex(random_bytes(8)));
            $progress = (int)($data['progress'] ?? 0);
            $isCompleted = ($progress === 100);
            $status = $data['status'] ?? ($isCompleted ? 'Completado' : 'En Progreso');
            $img = $data['image'] ?? $data['img'] ?? '/img/proyectos/proyecto1.jpg';
            $linkUrl = trim((string)($data['linkUrl'] ?? $data['linkurl'] ?? $data['url'] ?? $data['link'] ?? ''));

            $pdo = Database::getConnection();
            self::ensureSchema($pdo);

            $stmt = $pdo->prepare("
                INSERT INTO proyectos (id, img, category, status, isCompleted, title, `desc`, detailed_desc, location, cost, progress, startDate, beneficiaries, is_published, linkUrl)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id,
                $img,
                $data['category'] ?? 'Infraestructura',
                $status,
                $isCompleted ? 1 : 0,
                $title,
                $data['desc'] ?? $data['summary'] ?? '',
                $data['detailed_desc'] ?? $data['desc'] ?? '',
                $data['location'] ?? 'León, Nicaragua',
                $data['cost'] ?? '',
                $progress,
                $data['startDate'] ?? $data['start_date'] ?? '2026',
                $data['beneficiaries'] ?? '',
                isset($data['is_published']) ? ($data['is_published'] ? 1 : 0) : 1,
                $linkUrl
            ]);

            http_response_code(201);
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear proyecto: ' . $e->getMessage()]);
        }
    }

    public static function update(string $id, array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $title = trim((string)($data['title'] ?? ''));
            if ($title === '') {
                http_response_code(400);
                echo json_encode(['error' => 'El título del proyecto es obligatorio.']);
                return;
            }

            $progress = (int)($data['progress'] ?? 0);
            $isCompleted = ($progress === 100);
            $status = $data['status'] ?? ($isCompleted ? 'Completado' : 'En Progreso');
            $img = $data['image'] ?? $data['img'] ?? '/img/proyectos/proyecto1.jpg';
            $linkUrl = trim((string)($data['linkUrl'] ?? $data['linkurl'] ?? $data['url'] ?? $data['link'] ?? ''));

            $pdo = Database::getConnection();
            self::ensureSchema($pdo);

            $stmt = $pdo->prepare("
                UPDATE proyectos SET img=?, category=?, status=?, isCompleted=?, title=?, `desc`=?, detailed_desc=?,
                location=?, cost=?, progress=?, startDate=?, beneficiaries=?, is_published=?, linkUrl=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            ");
            $stmt->execute([
                $img,
                $data['category'] ?? 'Infraestructura',
                $status,
                $isCompleted ? 1 : 0,
                $title,
                $data['desc'] ?? $data['summary'] ?? '',
                $data['detailed_desc'] ?? $data['desc'] ?? '',
                $data['location'] ?? 'León, Nicaragua',
                $data['cost'] ?? '',
                $progress,
                $data['startDate'] ?? $data['start_date'] ?? '2026',
                $data['beneficiaries'] ?? '',
                isset($data['is_published']) ? ($data['is_published'] ? 1 : 0) : 1,
                $linkUrl,
                $id
            ]);

            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar proyecto: ' . $e->getMessage()]);
        }
    }

    public static function delete(string $id): void {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("DELETE FROM proyectos WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar proyecto: ' . $e->getMessage()]);
        }
    }
}
