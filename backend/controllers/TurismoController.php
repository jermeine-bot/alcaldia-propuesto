<?php

namespace Controllers;

use Config\Database;
use PDO;

class TurismoController {
    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM turismo ORDER BY display_order ASC, created_at ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$r) {
            $r['is_published'] = (bool)$r['is_published'];
            $r['display_order'] = (int)$r['display_order'];
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
            echo json_encode(['error' => 'El título del destino es obligatorio.']);
            return;
        }

        $id = $body['id'] ?? ('turismo-' . bin2hex(random_bytes(8)));
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO turismo (id, img, title, `desc`, category, location, content, is_published, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            $body['img'] ?? '',
            $title,
            $body['desc'] ?? '',
            $body['category'] ?? '',
            $body['location'] ?? '',
            $body['content'] ?? '',
            isset($body['is_published']) ? ($body['is_published'] ? 1 : 0) : 1,
            (int)($body['display_order'] ?? 0)
        ]);

        http_response_code(201);
        echo json_encode(self::fetchAll());
    }

    public static function update(string $id, array $body): void {
        $title = trim((string)($body['title'] ?? ''));
        if ($title === '') {
            http_response_code(400);
            echo json_encode(['error' => 'El título del destino es obligatorio.']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            UPDATE turismo SET img=?, title=?, `desc`=?, category=?, location=?, content=?, is_published=?, display_order=?, updated_at=CURRENT_TIMESTAMP
            WHERE id=?
        ");
        $stmt->execute([
            $body['img'] ?? '',
            $title,
            $body['desc'] ?? '',
            $body['category'] ?? '',
            $body['location'] ?? '',
            $body['content'] ?? '',
            isset($body['is_published']) ? ($body['is_published'] ? 1 : 0) : 1,
            (int)($body['display_order'] ?? 0),
            $id
        ]);

        echo json_encode(self::fetchAll());
    }

    public static function delete(string $id): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM turismo WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(self::fetchAll());
    }
}
