<?php

namespace Controllers;

use Config\Database;
use PDO;
use Throwable;

class StatsController {
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
                $cols = $pdo->query("SHOW COLUMNS FROM stats LIKE 'linkUrl'")->fetchAll();
                if (empty($cols)) {
                    $pdo->exec("ALTER TABLE stats ADD COLUMN linkUrl TEXT");
                }
            } else {
                $cols = $pdo->query("PRAGMA table_info(stats)")->fetchAll(PDO::FETCH_ASSOC);
                $hasLink = false;
                foreach ($cols as $col) {
                    if (isset($col['name']) && strtolower($col['name']) === 'linkurl') {
                        $hasLink = true;
                        break;
                    }
                }
                if (!$hasLink) {
                    $pdo->exec("ALTER TABLE stats ADD COLUMN linkUrl TEXT DEFAULT ''");
                }
            }
        } catch (Throwable $e) {
            // Ignorar si la columna ya existe
        }
    }

    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        self::ensureSchema($pdo);
        $stmt = $pdo->query("SELECT * FROM stats ORDER BY display_order ASC, created_at ASC");
        $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        foreach ($rows as &$r) {
            $r['number'] = (int)($r['number'] ?? 0);
            $r['percentage'] = (int)($r['percentage'] ?? 0);
            $r['display_order'] = (int)($r['display_order'] ?? 0);
            $r['is_published'] = (bool)($r['is_published'] ?? true);
            if (isset($r['breakdown']) && is_string($r['breakdown'])) {
                $decoded = json_decode($r['breakdown'], true);
                $r['breakdown'] = is_array($decoded) ? $decoded : [];
            } elseif (!isset($r['breakdown']) || !is_array($r['breakdown'])) {
                $r['breakdown'] = [];
            }

            // Normalizar detalles para el frontend
            if (!isset($r['detalles']) || !is_array($r['detalles'])) {
                $r['detalles'] = [
                    'descripcion' => $r['description'] ?? $r['subtitle'] ?? '',
                    'desglose' => $r['breakdown']
                ];
            }

            $linkVal = $r['linkUrl'] ?? $r['linkurl'] ?? $r['url'] ?? '';
            $r['linkUrl'] = (string)$linkVal;
            $r['url'] = (string)$linkVal;
            $r['externalLink'] = (string)$linkVal;
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

            $id = $data['id'] ?? ('stat-' . bin2hex(random_bytes(8)));
            $breakdown = '[]';
            if (array_key_exists('breakdown', $data)) {
                $breakdown = is_array($data['breakdown'])
                    ? json_encode($data['breakdown'], JSON_UNESCAPED_UNICODE)
                    : (string)$data['breakdown'];
            }
            $linkUrl = trim((string)($data['linkUrl'] ?? $data['linkurl'] ?? $data['url'] ?? $data['externalLink'] ?? ''));
            $desc = $data['description'] ?? $data['descripcion'] ?? $data['subtitle'] ?? '';

            $pdo = Database::getConnection();
            self::ensureSchema($pdo);

            $stmt = $pdo->prepare("
                INSERT INTO stats (id, icon, number, suffix, title, subtitle, category, badge, percentage, color, description, breakdown, is_published, display_order, linkUrl)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id,
                $data['icon'] ?? 'fa-chart-bar',
                (int)($data['number'] ?? 0),
                $data['suffix'] ?? '',
                $data['title'] ?? '',
                $data['subtitle'] ?? '',
                $data['category'] ?? '',
                $data['badge'] ?? '',
                (int)($data['percentage'] ?? 0),
                $data['color'] ?? '#B22222',
                $desc,
                $breakdown,
                isset($data['is_published']) ? ($data['is_published'] ? 1 : 0) : 1,
                (int)($data['display_order'] ?? 0),
                $linkUrl
            ]);

            http_response_code(201);
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear estadística: ' . $e->getMessage()]);
        }
    }

    public static function update(string $id, array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            // Si el CMS no envía breakdown, conservar el valor existente en lugar de borrarlo.
            $breakdown = null;
            if (array_key_exists('breakdown', $data)) {
                $breakdown = is_array($data['breakdown'])
                    ? json_encode($data['breakdown'], JSON_UNESCAPED_UNICODE)
                    : (string)$data['breakdown'];
            }
            $linkUrl = trim((string)($data['linkUrl'] ?? $data['linkurl'] ?? $data['url'] ?? $data['externalLink'] ?? ''));
            $desc = $data['description'] ?? $data['descripcion'] ?? $data['subtitle'] ?? '';

            $pdo = Database::getConnection();
            self::ensureSchema($pdo);

            $stmt = $pdo->prepare("
                UPDATE stats SET icon=?, number=?, suffix=?, title=?, subtitle=?, category=?, badge=?, percentage=?,
                color=?, description=?, breakdown=COALESCE(?, breakdown), is_published=?, display_order=?, linkUrl=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            ");
            $stmt->execute([
                $data['icon'] ?? 'fa-chart-bar',
                (int)($data['number'] ?? 0),
                $data['suffix'] ?? '',
                $data['title'] ?? '',
                $data['subtitle'] ?? '',
                $data['category'] ?? '',
                $data['badge'] ?? '',
                (int)($data['percentage'] ?? 0),
                $data['color'] ?? '#B22222',
                $desc,
                $breakdown,
                isset($data['is_published']) ? ($data['is_published'] ? 1 : 0) : 1,
                (int)($data['display_order'] ?? 0),
                $linkUrl,
                $id
            ]);

            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar estadística: ' . $e->getMessage()]);
        }
    }

    public static function delete(string $id): void {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("DELETE FROM stats WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar estadística: ' . $e->getMessage()]);
        }
    }
}
