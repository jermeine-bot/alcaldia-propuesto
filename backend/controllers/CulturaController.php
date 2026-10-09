<?php

namespace Controllers;

use Config\Database;
use PDO;

class CulturaController {
    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM cultura ORDER BY created_at DESC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$r) {
            $r['is_published'] = (bool)$r['is_published'];
        }
        return $rows;
    }

    public static function getAll(): void {
        echo json_encode(self::fetchAll());
    }

    public static function create(array $body): void {
        $title = trim((string)($body['title'] ?? ''));
        if ($title === '') {
            http_response_code(400);
            echo json_encode(['error' => 'El título del evento es obligatorio.']);
            return;
        }

        $id = $body['id'] ?? ('cultura-' . bin2hex(random_bytes(8)));
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO cultura (id, icon, title, `desc`, event_date, event_time, location, image_url, is_published)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            $body['icon'] ?? '',
            $title,
            $body['desc'] ?? '',
            $body['event_date'] ?? '',
            $body['event_time'] ?? '',
            $body['location'] ?? '',
            $body['image_url'] ?? '',
            isset($body['is_published']) ? ($body['is_published'] ? 1 : 0) : 1
        ]);

        http_response_code(201);
        echo json_encode(self::fetchAll());
    }

    public static function update(string $id, array $body): void {
        $title = trim((string)($body['title'] ?? ''));
        if ($title === '') {
            http_response_code(400);
            echo json_encode(['error' => 'El título del evento es obligatorio.']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            UPDATE cultura SET icon=?, title=?, `desc`=?, event_date=?, event_time=?, location=?, image_url=?, is_published=?, updated_at=CURRENT_TIMESTAMP
            WHERE id=?
        ");
        $stmt->execute([
            $body['icon'] ?? '',
            $title,
            $body['desc'] ?? '',
            $body['event_date'] ?? '',
            $body['event_time'] ?? '',
            $body['location'] ?? '',
            $body['image_url'] ?? '',
            isset($body['is_published']) ? ($body['is_published'] ? 1 : 0) : 1,
            $id
        ]);

        echo json_encode(self::fetchAll());
    }

    public static function delete(string $id): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM cultura WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(self::fetchAll());
    }
}
