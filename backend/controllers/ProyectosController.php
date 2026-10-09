<?php

namespace Controllers;

use Config\Database;
use PDO;

class ProyectosController {
    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM proyectos ORDER BY created_at DESC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$r) {
            $r['isCompleted'] = (bool)$r['isCompleted'];
            $r['is_published'] = (bool)$r['is_published'];
            $r['progress'] = (int)$r['progress'];
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
            echo json_encode(['error' => 'El título del proyecto es obligatorio.']);
            return;
        }

        $id = $body['id'] ?? ('proyecto-' . bin2hex(random_bytes(8)));
        $progress = (int)($body['progress'] ?? 0);
        $isCompleted = ($progress === 100);
        $status = $isCompleted ? 'Completado' : 'En Progreso';

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO proyectos (id, img, category, status, isCompleted, title, `desc`, detailed_desc, location, cost, progress, startDate, beneficiaries, is_published)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            $body['img'] ?? '',
            $body['category'] ?? '',
            $status,
            $isCompleted ? 1 : 0,
            $title,
            $body['desc'] ?? '',
            $body['detailed_desc'] ?? '',
            $body['location'] ?? '',
            $body['cost'] ?? '',
            $progress,
            $body['startDate'] ?? '',
            $body['beneficiaries'] ?? '',
            isset($body['is_published']) ? ($body['is_published'] ? 1 : 0) : 1
        ]);

        http_response_code(201);
        echo json_encode(self::fetchAll());
    }

    public static function update(string $id, array $body): void {
        $title = trim((string)($body['title'] ?? ''));
        if ($title === '') {
            http_response_code(400);
            echo json_encode(['error' => 'El título del proyecto es obligatorio.']);
            return;
        }

        $progress = (int)($body['progress'] ?? 0);
        $isCompleted = ($progress === 100);
        $status = $isCompleted ? 'Completado' : 'En Progreso';

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            UPDATE proyectos SET img=?, category=?, status=?, isCompleted=?, title=?, `desc`=?, detailed_desc=?,
            location=?, cost=?, progress=?, startDate=?, beneficiaries=?, is_published=?, updated_at=CURRENT_TIMESTAMP
            WHERE id=?
        ");
        $stmt->execute([
            $body['img'] ?? '',
            $body['category'] ?? '',
            $status,
            $isCompleted ? 1 : 0,
            $title,
            $body['desc'] ?? '',
            $body['detailed_desc'] ?? '',
            $body['location'] ?? '',
            $body['cost'] ?? '',
            $progress,
            $body['startDate'] ?? '',
            $body['beneficiaries'] ?? '',
            isset($body['is_published']) ? ($body['is_published'] ? 1 : 0) : 1,
            $id
        ]);

        echo json_encode(self::fetchAll());
    }

    public static function delete(string $id): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM proyectos WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(self::fetchAll());
    }
}
