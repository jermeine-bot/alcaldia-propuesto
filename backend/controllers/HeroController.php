<?php

namespace Controllers;

use Config\Database;
use PDO;

class HeroController {
    const HERO_ID = 'hero-1';

    public static function getHero(): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM hero WHERE id = ?");
        $stmt->execute([self::HERO_ID]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontró la configuración de portada.']);
            return;
        }

        $row['is_active'] = (bool)$row['is_active'];
        echo json_encode($row);
    }

    public static function updateHero(array $body): void {
        $pdo = Database::getConnection();
        $isActive = isset($body['is_active']) ? ((int)$body['is_active']) : 1;

        $stmt = $pdo->prepare("SELECT id FROM hero WHERE id = ?");
        $stmt->execute([self::HERO_ID]);
        if ($stmt->fetch()) {
            $update = $pdo->prepare("
                UPDATE hero SET title=?, subtitle=?, video_url=?, fallback_image_url=?, primary_btn_text=?,
                primary_btn_link=?, secondary_btn_text=?, secondary_btn_link=?, is_active=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            ");
            $update->execute([
                $body['title'] ?? '',
                $body['subtitle'] ?? '',
                $body['video_url'] ?? '',
                $body['fallback_image_url'] ?? '',
                $body['primary_btn_text'] ?? '',
                $body['primary_btn_link'] ?? '',
                $body['secondary_btn_text'] ?? '',
                $body['secondary_btn_link'] ?? '',
                $isActive,
                self::HERO_ID
            ]);
        } else {
            $insert = $pdo->prepare("
                INSERT INTO hero (id, title, subtitle, video_url, fallback_image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $insert->execute([
                self::HERO_ID,
                $body['title'] ?? '',
                $body['subtitle'] ?? '',
                $body['video_url'] ?? '',
                $body['fallback_image_url'] ?? '',
                $body['primary_btn_text'] ?? '',
                $body['primary_btn_link'] ?? '',
                $body['secondary_btn_text'] ?? '',
                $body['secondary_btn_link'] ?? '',
                $isActive
            ]);
        }

        self::getHero();
    }
}
