<?php

namespace Controllers;

use Config\Database;
use PDO;

class CmsController {
    public static function get(string $contentId): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT content FROM cms_content WHERE id = ?");
        $stmt->execute([$contentId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontró el contenido solicitado.']);
            return;
        }

        $decoded = json_decode($row['content'], true);
        echo json_encode($decoded !== null ? $decoded : $row['content']);
    }

    public static function save(string $contentId, $body): void {
        $isValid = false;
        if ($contentId === 'centros-atencion' && is_array($body)) {
            $isValid = true;
            foreach ($body as $item) {
                if (!is_array($item) || empty($item['id'])) {
                    $isValid = false;
                    break;
                }
            }
        } elseif ($contentId === 'redes-sociales' && is_array($body) && isset($body['title'], $body['platforms']) && is_array($body['platforms'])) {
            $isValid = true;
        }

        if (!$isValid) {
            http_response_code(400);
            echo json_encode(['error' => 'El formato del contenido no es válido.']);
            return;
        }

        $pdo = Database::getConnection();
        $jsonStr = json_encode($body, JSON_UNESCAPED_UNICODE);

        $stmt = $pdo->prepare("SELECT id FROM cms_content WHERE id = ?");
        $stmt->execute([$contentId]);
        if ($stmt->fetch()) {
            $update = $pdo->prepare("UPDATE cms_content SET content=?, updated_at=CURRENT_TIMESTAMP WHERE id=?");
            $update->execute([$jsonStr, $contentId]);
        } else {
            $insert = $pdo->prepare("INSERT INTO cms_content (id, content) VALUES (?, ?)");
            $insert->execute([$contentId, $jsonStr]);
        }

        echo json_encode($body);
    }
}
