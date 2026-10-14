<?php

namespace Controllers;

use Config\Database;
use PDO;
use Throwable;

class HeroController {
    const HERO_ID = 'hero-1';

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
                $cols = $pdo->query("SHOW COLUMNS FROM hero LIKE 'badge_text'")->fetchAll();
                if (empty($cols)) {
                    $pdo->exec("ALTER TABLE hero ADD COLUMN badge_text VARCHAR(150) DEFAULT 'Alcaldía Municipal de León'");
                }
            } else {
                $cols = $pdo->query("PRAGMA table_info(hero)")->fetchAll(PDO::FETCH_ASSOC);
                $hasBadge = false;
                foreach ($cols as $col) {
                    if (isset($col['name']) && strtolower($col['name']) === 'badge_text') {
                        $hasBadge = true;
                        break;
                    }
                }
                if (!$hasBadge) {
                    $pdo->exec("ALTER TABLE hero ADD COLUMN badge_text TEXT DEFAULT 'Alcaldía Municipal de León'");
                }
            }
        } catch (Throwable $e) {}
    }

    public static function getHero(): void {
        try {
            $pdo = Database::getConnection();
            self::ensureSchema($pdo);

            $stmt = $pdo->prepare("SELECT * FROM hero WHERE id = ?");
            $stmt->execute([self::HERO_ID]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'No se encontró la configuración de portada.']);
                return;
            }

            $row['is_active'] = (bool)($row['is_active'] ?? true);
            $row['videoUrl'] = $row['video_url'] ?? '';
            $row['fallbackImg'] = $row['fallback_image_url'] ?? '';
            $row['primaryBtnText'] = $row['primary_btn_text'] ?? 'Conoce León';
            $row['primaryBtnLink'] = $row['primary_btn_link'] ?? '#turismo';
            $row['secondaryBtnText'] = $row['secondary_btn_text'] ?? 'Servicios Rápidos';
            $row['secondaryBtnLink'] = $row['secondary_btn_link'] ?? '#servicios';
            $row['badgeText'] = $row['badge_text'] ?? 'Alcaldía Municipal de León';

            echo json_encode($row);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function updateHero(array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $pdo = Database::getConnection();
            self::ensureSchema($pdo);

            $isActive = isset($data['is_active']) ? ((int)$data['is_active']) : 1;
            $title = $data['title'] ?? 'BIENVENIDOS A LA CIUDAD UNIVERSITARIA Y METROPOLITANA';
            $subtitle = $data['subtitle'] ?? '';
            $videoUrl = $data['videoUrl'] ?? $data['video_url'] ?? '';
            $fallbackImg = $data['fallbackImg'] ?? $data['fallback_image_url'] ?? '';
            $primaryBtnText = $data['primaryBtnText'] ?? $data['primary_btn_text'] ?? 'Conoce León';
            $primaryBtnLink = $data['primaryBtnLink'] ?? $data['primary_btn_link'] ?? '#turismo';
            $secondaryBtnText = $data['secondaryBtnText'] ?? $data['secondary_btn_text'] ?? 'Servicios Rápidos';
            $secondaryBtnLink = $data['secondaryBtnLink'] ?? $data['secondary_btn_link'] ?? '#servicios';
            $badgeText = $data['badgeText'] ?? $data['badge_text'] ?? 'Alcaldía Municipal de León';

            $stmt = $pdo->prepare("SELECT id FROM hero WHERE id = ?");
            $stmt->execute([self::HERO_ID]);
            if ($stmt->fetch()) {
                $update = $pdo->prepare("
                    UPDATE hero SET title=?, subtitle=?, video_url=?, fallback_image_url=?, primary_btn_text=?,
                    primary_btn_link=?, secondary_btn_text=?, secondary_btn_link=?, is_active=?, badge_text=?, updated_at=CURRENT_TIMESTAMP
                    WHERE id=?
                ");
                $update->execute([
                    $title,
                    $subtitle,
                    $videoUrl,
                    $fallbackImg,
                    $primaryBtnText,
                    $primaryBtnLink,
                    $secondaryBtnText,
                    $secondaryBtnLink,
                    $isActive,
                    $badgeText,
                    self::HERO_ID
                ]);
            } else {
                $insert = $pdo->prepare("
                    INSERT INTO hero (id, title, subtitle, video_url, fallback_image_url, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, is_active, badge_text)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $insert->execute([
                    self::HERO_ID,
                    $title,
                    $subtitle,
                    $videoUrl,
                    $fallbackImg,
                    $primaryBtnText,
                    $primaryBtnLink,
                    $secondaryBtnText,
                    $secondaryBtnLink,
                    $isActive,
                    $badgeText
                ]);
            }

            self::getHero();
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar portada: ' . $e->getMessage()]);
        }
    }
}
