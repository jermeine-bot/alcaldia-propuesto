<?php

namespace Controllers;

use Config\Database;
use PDO;
use Throwable;

class AnuncioController {
    private static function ensureTable(PDO $pdo): void {
        try {
            $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
            if ($driver === 'mysql') {
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS anuncio_portal (
                        id VARCHAR(50) PRIMARY KEY,
                        content LONGTEXT,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ");
            } else {
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS anuncio_portal (
                        id TEXT PRIMARY KEY,
                        content TEXT,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                ");
            }
        } catch (Throwable $e) {}
    }

    public static function get(): void {
        try {
            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $stmt = $pdo->prepare("SELECT content FROM anuncio_portal WHERE id = 'main'");
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row && !empty($row['content'])) {
                $data = json_decode($row['content'], true);
                echo json_encode(['content' => $data ?: $row['content']]);
            } else {
                echo json_encode(['content' => null]);
            }
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function save(): void {
        try {
            $raw = file_get_contents('php://input');
            $body = json_decode($raw, true);
            if (!$body) {
                $body = $_POST;
            }

            $pdo = Database::getConnection();
            self::ensureTable($pdo);

            $jsonContent = json_encode($body, JSON_UNESCAPED_UNICODE);

            $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
            if ($driver === 'mysql') {
                $stmt = $pdo->prepare("
                    INSERT INTO anuncio_portal (id, content, updated_at)
                    VALUES ('main', ?, CURRENT_TIMESTAMP)
                    ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = CURRENT_TIMESTAMP
                ");
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO anuncio_portal (id, content, updated_at)
                    VALUES ('main', ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = CURRENT_TIMESTAMP
                ");
            }

            $stmt->execute([$jsonContent]);

            echo json_encode(['success' => true, 'content' => $body]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al guardar el anuncio: ' . $e->getMessage()]);
        }
    }
}