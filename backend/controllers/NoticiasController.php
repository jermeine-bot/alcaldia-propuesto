<?php

namespace Controllers;

use Config\Database;
use Services\AuditService;
use PDO;

class NoticiasController {
    private static function slugify(string $text): string {
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        $text = strtolower($text);
        return empty($text) ? 'noticia' : $text;
    }

    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM noticias ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getAll(): void {
        echo json_encode(self::fetchAll());
    }

    public static function getById(string $id): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM noticias WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Noticia no encontrada.']);
            return;
        }

        echo json_encode($row);
    }

    public static function create(array $user, array $body): void {
        $title = trim((string)($body['title'] ?? $body['titulo'] ?? ''));
        if ($title === '') {
            http_response_code(400);
            echo json_encode(['error' => 'El título de la noticia es obligatorio.']);
            return;
        }

        $id = $body['id'] ?? ('noticia-' . bin2hex(random_bytes(8)));
        $slug = self::slugify($title);
        $summary = $body['summary'] ?? $body['extracto'] ?? '';
        $content = $body['content'] ?? $body['contenido'] ?? '';
        $category = $body['category'] ?? $body['categoria'] ?? 'General';
        $image = $body['img'] ?? $body['imagen'] ?? $body['image'] ?? '/img/hero-bg.jpg';
        $author = $body['author'] ?? $body['autor'] ?? 'Prensa Alcaldía';
        $date = $body['date'] ?? date('d F Y');
        $status = $body['status'] ?? 'published';
        $fuente = $body['fuente'] ?? 'manual';
        $urlExterna = $body['url_externa'] ?? null;
        $externalId = $body['external_id'] ?? null;

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO noticias (id, titulo, slug, extracto, contenido, categoria, imagen, autor, date, status, fuente, url_externa, external_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$id, $title, $slug, $summary, $content, $category, $image, $author, $date, $status, $fuente, $urlExterna, $externalId]);

        AuditService::logAction(
            $user,
            'CREAR_NOTICIA',
            'Noticias',
            "Noticia creada: \"{$title}\""
        );

        http_response_code(201);
        echo json_encode(self::fetchAll());
    }

    public static function update(array $user, string $id, array $body): void {
        $title = trim((string)($body['title'] ?? $body['titulo'] ?? ''));
        if ($title === '') {
            http_response_code(400);
            echo json_encode(['error' => 'El título de la noticia es obligatorio.']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            UPDATE noticias SET titulo=?, slug=?, extracto=?, contenido=?, categoria=?, imagen=?, autor=?, date=?, status=?
            WHERE id=?
        ");
        $stmt->execute([
            $title,
            self::slugify($title),
            $body['summary'] ?? $body['extracto'] ?? '',
            $body['content'] ?? $body['contenido'] ?? '',
            $body['category'] ?? $body['categoria'] ?? 'General',
            $body['img'] ?? $body['imagen'] ?? $body['image'] ?? '',
            $body['author'] ?? $body['autor'] ?? 'Prensa Alcaldía',
            $body['date'] ?? '',
            $body['status'] ?? 'published',
            $id
        ]);

        AuditService::logAction(
            $user,
            'EDITAR_NOTICIA',
            'Noticias',
            "Noticia actualizada ID: {$id}"
        );

        echo json_encode(self::fetchAll());
    }

    public static function delete(array $user, string $id): void {
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
