<?php

namespace Services;

/**
 * Descarga imágenes remotas (por ejemplo de Facebook/u otros CDN) al almacenamiento
 * local del backend, para evitar depender de URLs externas que caducan (403).
 */
class MediaService {
    private const MAX_BYTES = 8 * 1024 * 1024;

    /**
     * Convierte un valor de imagen en una ruta local cuando es una URL remota viable.
     * Conserva sin cambios los data URLs, rutas locales y enlaces vacíos.
     */
    public static function localize(?string $value, string $fallback = ''): string {
        $value = is_string($value) ? trim($value) : '';
        if ($value === '') {
            return $fallback;
        }

        if (stripos($value, 'data:') === 0) {
            return $value;
        }

        if (!preg_match('~^https?://~i', $value)) {
            return $value;
        }

        $local = self::download($value);
        return $local ?? $value;
    }

    private static function download(string $url): ?string {
        if (self::isBlockedHost($url)) {
            return null;
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_CONNECTTIMEOUT => 7,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        ]);

        $body = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        curl_close($ch);

        if ($code < 200 || $code >= 300 || !is_string($body) || $body === '') {
            return null;
        }
        if (strlen($body) > self::MAX_BYTES) {
            return null;
        }
        if ($contentType !== '' && stripos($contentType, 'image/') === false) {
            return null;
        }

        $info = @getimagesizefromstring($body);
        if ($info === false) {
            return null;
        }

        $mime = $info['mime'] ?? ($contentType !== '' ? $contentType : 'image/jpeg');
        $ext = self::extensionForMime($mime);

        $uploadsDir = dirname(__DIR__) . '/uploads';
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0777, true);
        }

        $filename = 'remote-' . round(microtime(true) * 1000) . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
        $dest = $uploadsDir . '/' . $filename;

        if (file_put_contents($dest, $body) === false) {
            return null;
        }

        return '/uploads/' . $filename;
    }

    private static function extensionForMime(string $mime): string {
        return match (strtolower($mime)) {
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            'image/bmp' => 'bmp',
            'image/svg+xml' => 'svg',
            default => 'jpg',
        };
    }

    /**
     * Bloquea direcciones privadas/reservadas para prevenir SSRF.
     */
    private static function isBlockedHost(string $url): bool {
        $host = parse_url($url, PHP_URL_HOST);
        if (!$host) {
            return true;
        }

        $ips = [];
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            $ips[] = $host;
        } else {
            $ip = gethostbyname($host);
            if ($ip && $ip !== $host) {
                $ips[] = $ip;
            }
        }

        foreach ($ips as $ip) {
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                return true;
            }
        }

        return false;
    }
}
