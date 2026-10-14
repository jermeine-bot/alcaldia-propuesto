<?php

namespace Controllers;

use Config\Database;
use Services\AuditService;
use PDO;
use Throwable;

class NoticiasController {
    private static function slugify(string $text): string {
        $converted = @iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        if ($converted !== false) {
            $text = $converted;
        }
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        $text = strtolower($text);
        return empty($text) ? 'noticia' : $text;
    }

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
                try {
                    $pdo->exec("ALTER TABLE noticias MODIFY COLUMN imagen LONGTEXT");
                } catch (Throwable $e) {}

                $cols = $pdo->query("SHOW COLUMNS FROM noticias")->fetchAll(PDO::FETCH_COLUMN);
                $colsLower = array_map('strtolower', $cols ?: []);

                if (!in_array('date', $colsLower, true)) {
                    $pdo->exec("ALTER TABLE noticias ADD COLUMN `date` VARCHAR(120) DEFAULT ''");
                }
                if (!in_array('url_externa', $colsLower, true)) {
                    $pdo->exec("ALTER TABLE noticias ADD COLUMN url_externa TEXT");
                }
                if (!in_array('linkurl', $colsLower, true)) {
                    $pdo->exec("ALTER TABLE noticias ADD COLUMN linkUrl TEXT");
                }
            } else {
                $cols = $pdo->query("PRAGMA table_info(noticias)")->fetchAll(PDO::FETCH_ASSOC);
                $names = [];
                foreach ($cols as $col) {
                    if (isset($col['name'])) {
                        $names[] = strtolower($col['name']);
                    }
                }
                if (!in_array('date', $names, true)) {
                    $pdo->exec("ALTER TABLE noticias ADD COLUMN date TEXT DEFAULT ''");
                }
                if (!in_array('url_externa', $names, true)) {
                    $pdo->exec("ALTER TABLE noticias ADD COLUMN url_externa TEXT DEFAULT ''");
                }
                if (!in_array('linkurl', $names, true)) {
                    $pdo->exec("ALTER TABLE noticias ADD COLUMN linkUrl TEXT DEFAULT ''");
                }
            }
        } catch (Throwable $e) {
            // Ignorar si las columnas ya existen
        }
    }

    private static function extractLink(array $data): string {
        $candidates = [
            $data['linkUrl'] ?? null,
            $data['linkurl'] ?? null,
            $data['url_externa'] ?? null,
            $data['urlExterna'] ?? null,
            $data['url'] ?? null,
            $data['link'] ?? null,
            $data['href'] ?? null,
        ];
        foreach ($candidates as $val) {
            if (is_string($val) && trim($val) !== '') {
                return trim($val);
            }
        }
        return '';
    }

    private static function extractDate(array $data): string {
        $candidates = [
            $data['date'] ?? null,
            $data['fecha'] ?? null,
            $data['published_at'] ?? null,
            $data['created_at'] ?? null,
        ];
        foreach ($candidates as $val) {
            if (is_string($val) && trim($val) !== '') {
                return trim($val);
            }
        }
        return date('d M Y');
    }

    private static function normalizeRow(array $r): array {
        $title = $r['titulo'] ?? $r['title'] ?? '';
        $summary = $r['extracto'] ?? $r['summary'] ?? $r['text'] ?? '';
        $content = $r['contenido'] ?? $r['content'] ?? $summary;
        $category = $r['categoria'] ?? $r['category'] ?? 'General';
        $imgVal = !empty($r['imagen']) ? $r['imagen'] : (!empty($r['image']) ? $r['image'] : (!empty($r['img']) ? $r['img'] : '/img/noticias/noticia1.jpg'));

        $linkVal = '';
        foreach (['linkUrl', 'linkurl', 'url_externa', 'url'] as $k) {
            if (!empty($r[$k]) && is_string($r[$k]) && trim($r[$k]) !== '') {
                $linkVal = trim($r[$k]);
                break;
            }
        }

        $dateVal = '';
        if (!empty($r['date']) && is_string($r['date']) && trim($r['date']) !== '') {
            $dateVal = trim($r['date']);
        } elseif (!empty($r['created_at'])) {
            $dateVal = date('d M Y', strtotime((string)$r['created_at']));
        } else {
            $dateVal = date('d M Y');
        }

        $r['titulo'] = $title;
        $r['title'] = $title;
        $r['extracto'] = $summary;
        $r['summary'] = $summary;
        $r['text'] = $summary;
        $r['contenido'] = $content;
        $r['content'] = $content;
        $r['categoria'] = $category;
        $r['category'] = $category;
        $r['imagen'] = $imgVal;
        $r['image'] = $imgVal;
        $r['img'] = $imgVal;
        $r['url_externa'] = $linkVal;
        $r['linkUrl'] = $linkVal;
        $r['url'] = $linkVal;
        $r['date'] = $dateVal;
        $r['fecha'] = $dateVal;

        return $r;
    }

    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        self::ensureSchema($pdo);
        $stmt = $pdo->query("SELECT * FROM noticias ORDER BY created_at DESC");
        $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        foreach ($rows as &$r) {
            $r = self::normalizeRow($r);
        }
        return $rows;
    }

    public static function getAll(): void {
        try {
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function getById(string $id): void {
        try {
            $pdo = Database::getConnection();
            self::ensureSchema($pdo);
            $stmt = $pdo->prepare("SELECT * FROM noticias WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'Noticia no encontrada.']);
                return;
            }

            echo json_encode(self::normalizeRow($row));
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function create(array $user, array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $title = trim((string)($data['title'] ?? $data['titulo'] ?? ''));
            if ($title === '') {
                http_response_code(400);
                echo json_encode(['error' => 'El título de la noticia es obligatorio.']);
                return;
            }

            $id = $data['id'] ?? ('noticia-' . bin2hex(random_bytes(8)));
            $slug = self::slugify($title);
            $summary = $data['summary'] ?? $data['extracto'] ?? $data['text'] ?? '';
            $content = $data['content'] ?? $data['contenido'] ?? $summary;
            $category = $data['category'] ?? $data['categoria'] ?? 'General';
            $image = $data['image'] ?? $data['img'] ?? $data['imagen'] ?? '/img/noticias/noticia1.jpg';
            $author = $data['author'] ?? $data['autor'] ?? 'Prensa Alcaldía';
            $date = self::extractDate($data);
            $status = $data['status'] ?? 'published';
            $fuente = $data['fuente'] ?? 'manual';
            $linkUrl = self::extractLink($data);
            $externalId = $data['external_id'] ?? null;

            $pdo = Database::getConnection();
            self::ensureSchema($pdo);

            $stmt = $pdo->prepare("
                INSERT INTO noticias (id, titulo, slug, extracto, contenido, categoria, imagen, autor, `date`, status, fuente, url_externa, linkUrl, external_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id,
                $title,
                $slug,
                $summary,
                $content,
                $category,
                $image,
                $author,
                $date,
                $status,
                $fuente,
                $linkUrl,
                $linkUrl,
                $externalId
            ]);

            AuditService::logAction(
                $user,
                'CREAR_NOTICIA',
                'Noticias',
                "Noticia creada: \"{$title}\""
            );

            http_response_code(201);
            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear noticia: ' . $e->getMessage()]);
        }
    }

    public static function update(array $user, string $id, array $body = []): void {
        try {
            $raw = self::getRawInput();
            $data = array_merge($raw, $body);

            $title = trim((string)($data['title'] ?? $data['titulo'] ?? ''));
            if ($title === '') {
                http_response_code(400);
                echo json_encode(['error' => 'El título de la noticia es obligatorio.']);
                return;
            }

            $summary = $data['summary'] ?? $data['extracto'] ?? $data['text'] ?? '';
            $content = $data['content'] ?? $data['contenido'] ?? $summary;
            $category = $data['category'] ?? $data['categoria'] ?? 'General';
            $image = $data['image'] ?? $data['img'] ?? $data['imagen'] ?? '/img/noticias/noticia1.jpg';
            $author = $data['author'] ?? $data['autor'] ?? 'Prensa Alcaldía';
            $date = self::extractDate($data);
            $status = $data['status'] ?? 'published';
            $linkUrl = self::extractLink($data);

            $pdo = Database::getConnection();
            self::ensureSchema($pdo);

            $stmt = $pdo->prepare("
                UPDATE noticias
                SET titulo=?, slug=?, extracto=?, contenido=?, categoria=?, imagen=?, autor=?, `date`=?, status=?, url_externa=?, linkUrl=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            ");
            $stmt->execute([
                $title,
                self::slugify($title),
                $summary,
                $content,
                $category,
                $image,
                $author,
                $date,
                $status,
                $linkUrl,
                $linkUrl,
                $id
            ]);

            AuditService::logAction(
                $user,
                'EDITAR_NOTICIA',
                'Noticias',
                "Noticia actualizada ID: {$id}"
            );

            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar noticia: ' . $e->getMessage()]);
        }
    }

    public static function delete(array $user, string $id): void {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("DELETE FROM noticias WHERE id = ?");
            $stmt->execute([$id]);

            AuditService::logAction(
                $user,
                'ELIMINAR_NOTICIA',
                'Noticias',
                "Noticia eliminada ID: {$id}"
            );

            echo json_encode(self::fetchAll());
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar noticia: ' . $e->getMessage()]);
        }
    }

    public static function uploadImage(): void {
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No se seleccionó ninguna imagen o ocurrió un error al subir.']);
            return;
        }

        $file = $_FILES['image'];
        $mime = mime_content_type($file['tmp_name']);
        if (!str_starts_with($mime, 'image/')) {
            http_response_code(400);
            echo json_encode(['error' => 'Solo se permiten archivos de imagen (.jpg, .png, .webp).']);
            return;
        }

        $uploadsDir = dirname(__DIR__) . '/uploads';
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0777, true);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
        $filename = 'img-' . round(microtime(true) * 1000) . '-' . mt_rand(100000, 999999) . '.' . $ext;
        $dest = $uploadsDir . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo guardar la imagen en el servidor.']);
            return;
        }

        echo json_encode(['url' => "/uploads/{$filename}"]);
    }
}