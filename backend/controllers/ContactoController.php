<?php

namespace Controllers;

use Config\Database;
use PDO;
use Throwable;

class ContactoController {
    const CONTACT_ID = 'contacto-1';

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

    public static function getContacto(): void {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("SELECT * FROM contacto WHERE id = ?");
            $stmt->execute([self::CONTACT_ID]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'No se encontró la información de contacto.']);
                return;
            }

            // Mapear compatibilidad de nombres tanto con _url como simples
            $row['facebook'] = $row['facebook_url'] ?? '';
            $row['instagram'] = $row['instagram_url'] ?? '';
            $row['tiktok'] = $row['tiktok_url'] ?? '';
            $row['youtube'] = $row['youtube_url'] ?? '';
            $row['twitter'] = $row['twitter_url'] ?? '';

            echo json_encode($row);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function updateContacto(array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $pdo = Database::getConnection();
            $facebook = $data['facebook_url'] ?? $data['facebook'] ?? '';
            $instagram = $data['instagram_url'] ?? $data['instagram'] ?? '';
            $tiktok = $data['tiktok_url'] ?? $data['tiktok'] ?? '';
            $youtube = $data['youtube_url'] ?? $data['youtube'] ?? '';
            $twitter = $data['twitter_url'] ?? $data['twitter'] ?? '';

            $fields = [
                'address' => $data['address'] ?? '',
                'phone' => $data['phone'] ?? '',
                'secondary_phone' => $data['secondary_phone'] ?? '',
                'email' => $data['email'] ?? '',
                'schedule' => $data['schedule'] ?? '',
                'facebook_url' => $facebook,
                'instagram_url' => $instagram,
                'tiktok_url' => $tiktok,
                'youtube_url' => $youtube,
                'twitter_url' => $twitter
            ];

            $stmt = $pdo->prepare("SELECT id FROM contacto WHERE id = ?");
            $stmt->execute([self::CONTACT_ID]);
            if ($stmt->fetch()) {
                $sql = "UPDATE contacto SET address=?, phone=?, secondary_phone=?, email=?, schedule=?, facebook_url=?, instagram_url=?, tiktok_url=?, youtube_url=?, twitter_url=?, updated_at=CURRENT_TIMESTAMP WHERE id=?";
                $update = $pdo->prepare($sql);
                $update->execute([...array_values($fields), self::CONTACT_ID]);
            } else {
                $sql = "INSERT INTO contacto (id, address, phone, secondary_phone, email, schedule, facebook_url, instagram_url, tiktok_url, youtube_url, twitter_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $insert = $pdo->prepare($sql);
                $insert->execute([self::CONTACT_ID, ...array_values($fields)]);
            }

            self::getContacto();
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar contacto: ' . $e->getMessage()]);
        }
    }
}
