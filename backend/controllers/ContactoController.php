<?php

namespace Controllers;

use Config\Database;
use PDO;

class ContactoController {
    const CONTACT_ID = 'contacto-1';

    public static function getContacto(): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM contacto WHERE id = ?");
        $stmt->execute([self::CONTACT_ID]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontró la información de contacto.']);
            return;
        }

        echo json_encode($row);
    }

    public static function updateContacto(array $body): void {
        $pdo = Database::getConnection();
        $fields = [
            'address' => $body['address'] ?? null,
            'phone' => $body['phone'] ?? null,
            'secondary_phone' => $body['secondary_phone'] ?? null,
            'email' => $body['email'] ?? null,
            'schedule' => $body['schedule'] ?? null,
            'facebook_url' => $body['facebook_url'] ?? null,
            'instagram_url' => $body['instagram_url'] ?? null,
            'tiktok_url' => $body['tiktok_url'] ?? null,
            'youtube_url' => $body['youtube_url'] ?? null,
            'twitter_url' => $body['twitter_url'] ?? null
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
    }
}
