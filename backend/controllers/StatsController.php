<?php

namespace Controllers;

use Config\Database;
use PDO;

class StatsController {
    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM stats ORDER BY display_order ASC, created_at ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$r) {
            $r['number'] = (int)$r['number'];
            $r['percentage'] = (int)$r['percentage'];
            $r['display_order'] = (int)$r['display_order'];
            $r['is_published'] = (bool)$r['is_published'];
            if (isset($r['breakdown']) && is_string($r['breakdown'])) {
                $decoded = json_decode($r['breakdown'], true);
                $r['breakdown'] = is_array($decoded) ? $decoded : [];
            } else {
                $r['breakdown'] = [];
            }
        }
        return $rows;
    }

    public static function getAll(): void {
        echo json_encode(self::fetchAll());
    }

    public static function create(array $body): void {
        $id = $body['id'] ?? ('stat-' . bin2hex(random_bytes(8)));
        $breakdown = isset($body['breakdown']) ? json_encode($body['breakdown'], JSON_UNESCAPED_UNICODE) : '[]';

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO stats (id, icon, number, suffix, title, subtitle, category, badge, percentage, color, description, breakdown, is_published, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            $body['icon'] ?? null,
            (int)($body['number'] ?? 0),
            $body['suffix'] ?? '',
            $body['title'] ?? '',
            $body['subtitle'] ?? '',
            $body['category'] ?? '',
            $body['badge'] ?? '',
            (int)($body['percentage'] ?? 0),
            $body['color'] ?? '',
            $body['description'] ?? '',
            $breakdown,
            isset($body['is_published']) ? ($body['is_published'] ? 1 : 0) : 1,
            (int)($body['display_order'] ?? 0)
        ]);

        http_response_code(201);
        echo json_encode(self::fetchAll());
    }

    public static function update(string $id, array $body): void {
        $breakdown = isset($body['breakdown']) ? json_encode($body['breakdown'], JSON_UNESCAPED_UNICODE) : '[]';

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            UPDATE stats SET icon=?, number=?, suffix=?, title=?, subtitle=?, category=?, badge=?, percentage=?,
            color=?, description=?, breakdown=?, is_published=?, display_order=?, updated_at=CURRENT_TIMESTAMP
            WHERE id=?
        ");
        $stmt->execute([
            $body['icon'] ?? null,
            (int)($body['number'] ?? 0),
            $body['suffix'] ?? '',
            $body['title'] ?? '',
            $body['subtitle'] ?? '',
            $body['category'] ?? '',
            $body['badge'] ?? '',
            (int)($body['percentage'] ?? 0),
            $body['color'] ?? '',
            $body['description'] ?? '',
            $breakdown,
            isset($body['is_published']) ? ($body['is_published'] ? 1 : 0) : 1,
            (int)($body['display_order'] ?? 0),
            $id
        ]);

        echo json_encode(self::fetchAll());
    }

    public static function delete(string $id): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM stats WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(self::fetchAll());
    }
}
