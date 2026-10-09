<?php

namespace Services;

use Config\Database;
use PDO;

class FacebookService {
    public static function isConfigured(): bool {
        $pageId = Database::env('FACEBOOK_PAGE_ID');
        $token = Database::env('FACEBOOK_ACCESS_TOKEN');

        if (!$pageId || !$token) {
            return false;
        }

        if (preg_match('/^(tu_|your_|placeholder)/i', $token)) {
            return false;
        }

        return true;
    }

    private static function slugify(string $text): string {
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        $text = strtolower($text);
        return empty($text) ? 'noticia' : $text;
    }

    public static function syncPosts(): array {
        if (!self::isConfigured()) {
            return [
                'success' => false,
                'configured' => false,
                'importedCount' => 0,
                'error' => 'Configura FACEBOOK_PAGE_ID y FACEBOOK_ACCESS_TOKEN para sincronizar.'
            ];
        }

        $pageId = urlencode(Database::env('FACEBOOK_PAGE_ID'));
        $accessToken = Database::env('FACEBOOK_ACCESS_TOKEN');
        $url = "https://graph.facebook.com/v19.0/{$pageId}/feed?fields=id,message,created_time,full_picture,permalink_url&access_token=" . urlencode($accessToken);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data = json_decode((string)$response, true);
        if ($httpCode !== 200 || !is_array($data)) {
            $msg = $data['error']['message'] ?? 'Error al conectar con Facebook Graph API.';
            return ['success' => false, 'error' => $msg, 'importedCount' => 0];
        }

        $pdo = Database::getConnection();
        $importedCount = 0;
        $skippedCount = 0;

        foreach ($data['data'] ?? [] as $post) {
            if (empty($post['message'])) {
                $skippedCount++;
                continue;
            }

            $chk = $pdo->prepare("SELECT id FROM noticias WHERE external_id = ? LIMIT 1");
            $chk->execute([$post['id']]);
            if ($chk->fetch()) {
                $skippedCount++;
                continue;
            }

            $lines = array_filter(array_map('trim', explode("\n", $post['message'])));
            $firstLine = reset($lines) ?: 'Publicación Oficial de la Alcaldía de León';
            $title = mb_substr($firstLine, 0, 120);
            $slug = self::slugify($title);

            $date = date('d F Y', strtotime($post['created_time']));
            $extracto = mb_substr(implode(' ', array_slice($lines, 0, 2)), 0, 250);
            $id = 'noticia-fb-' . bin2hex(random_bytes(8));

            $insert = $pdo->prepare("
                INSERT INTO noticias (id, titulo, slug, extracto, contenido, categoria, imagen, autor, date, status, fuente, url_externa, external_id, created_at)
                VALUES (?, ?, ?, ?, ?, 'Facebook Oficial', ?, 'Facebook Alcaldía León', ?, 'published', 'facebook', ?, ?, ?)
            ");
            $insert->execute([
                $id,
                $title,
                $slug,
                $extracto,
                $post['message'],
                $post['full_picture'] ?? '/img/hero-bg.jpg',
                $date,
                $post['permalink_url'] ?? null,
                $post['id'],
                date('Y-m-d H:i:s', strtotime($post['created_time']))
            ]);

            $importedCount++;
        }

        return [
            'success' => true,
            'importedCount' => $importedCount,
            'skippedCount' => $skippedCount,
            'message' => "Sincronización completada: {$importedCount} noticias importadas de Facebook."
        ];
    }
}
