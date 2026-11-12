<?php

namespace Controllers;

use Config\Database;
use PDO;
use Throwable;

class HeroController {
    const HERO_ID = 'hero-1';
    const CAROUSEL_SLOTS = 6;
    const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

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

    private static function normalizeCarouselItem($item): array {
        if (is_string($item)) {
            return ['type' => 'image', 'src' => trim($item), 'poster' => ''];
        }
        if (!is_array($item)) {
            return ['type' => 'image', 'src' => '', 'poster' => ''];
        }
        $type = (($item['type'] ?? 'image') === 'video') ? 'video' : 'image';
        $src = is_string($item['src'] ?? null) ? trim($item['src']) : '';
        $poster = is_string($item['poster'] ?? null) ? trim($item['poster']) : '';
        // Los videos no se guardan en base64: deben ser una ruta o URL.
        if ($type === 'video' && str_starts_with(strtolower($src), 'data:')) {
            $src = '';
        }
        return ['type' => $type, 'src' => $src, 'poster' => $poster];
    }

    private static function ensureSchema(PDO $pdo): void {
        try {
            $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

            // Columnas que debemos asegurar
            $needed = [
                'badge_text'   => "TEXT DEFAULT 'Alcaldía Municipal de León'",
                'bg_type'      => "TEXT DEFAULT 'video'",
                'bg_image_url' => "TEXT DEFAULT ''",
                'carousel_images' => "TEXT DEFAULT '[]'",
                'overlay_color' => "TEXT DEFAULT '#1a1816'",
                'overlay_opacity' => "REAL DEFAULT 0.35",
            ];

            if ($driver === 'mysql') {
                $mysqlTypes = [
                    'badge_text'   => "VARCHAR(150) DEFAULT 'Alcaldía Municipal de León'",
                    'bg_type'      => "VARCHAR(20)  DEFAULT 'video'",
                    // Las imágenes del CMS se guardan como data URLs base64 y superan el límite de TEXT (64 KB).
                    'bg_image_url' => "LONGTEXT NULL",
                    'carousel_images' => "LONGTEXT NULL",
                    'overlay_color' => "VARCHAR(7) DEFAULT '#1a1816'",
                    'overlay_opacity' => "DECIMAL(3,2) DEFAULT 0.35",
                ];
                foreach ($needed as $col => $_) {
                    $check = $pdo->query("SHOW COLUMNS FROM hero LIKE '{$col}'")->fetchAll();
                    if (empty($check)) {
                        $pdo->exec("ALTER TABLE hero ADD COLUMN {$col} {$mysqlTypes[$col]}");
                    }
                }

                foreach (['fallback_image_url', 'bg_image_url'] as $imageColumn) {
                    $info = $pdo->query("SHOW COLUMNS FROM hero LIKE '{$imageColumn}'")->fetch(PDO::FETCH_ASSOC);
                    $type = strtolower((string)($info['Type'] ?? ''));
                    if ($type !== '' && !str_contains($type, 'longtext') && !str_contains($type, 'mediumtext')) {
                        $pdo->exec("ALTER TABLE hero MODIFY COLUMN {$imageColumn} LONGTEXT NULL");
                    }
                }
            } else {
                $cols = $pdo->query("PRAGMA table_info(hero)")->fetchAll(PDO::FETCH_ASSOC);
                $existing = [];
                foreach ($cols as $c) {
                    $existing[strtolower($c['name'])] = true;
                }
                foreach ($needed as $col => $sqliteDef) {
                    if (!isset($existing[strtolower($col)])) {
                        $pdo->exec("ALTER TABLE hero ADD COLUMN {$col} {$sqliteDef}");
                    }
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

            // Mapear campos snake_case a camelCase para el frontend
            $row['is_active']        = (bool)($row['is_active'] ?? true);
            $row['videoUrl']         = $row['video_url'] ?? '';
            $row['fallbackImg']      = $row['fallback_image_url'] ?? '';
            $row['primaryBtnText']   = $row['primary_btn_text'] ?? 'Conoce León';
            $row['primaryBtnLink']   = $row['primary_btn_link'] ?? '#turismo';
            $row['secondaryBtnText'] = $row['secondary_btn_text'] ?? 'Servicios Rápidos';
            $row['secondaryBtnLink'] = $row['secondary_btn_link'] ?? '#servicios';
            $row['badgeText']        = $row['badge_text'] ?? 'Alcaldía Municipal de León';
            $row['bgType']           = $row['bg_type'] ?? 'video';
            $row['bgImageUrl']       = $row['bg_image_url'] ?? '';

            // Carrusel: la base de datos guarda un JSON con las rutas de imagen.
            $carousel = $row['carousel_images'] ?? '';
            if (is_string($carousel)) {
                $decoded = json_decode($carousel, true);
                $carousel = is_array($decoded) ? $decoded : [];
            }
            if (!is_array($carousel)) {
                $carousel = [];
            }
            $carousel = array_values(array_map(static fn($item) => self::normalizeCarouselItem($item), $carousel));
            $carousel = array_slice(array_pad($carousel, self::CAROUSEL_SLOTS, ['type' => 'image', 'src' => '', 'poster' => '']), 0, self::CAROUSEL_SLOTS);
            $row['carousel_images']  = $carousel;
            $row['carouselImages']   = $carousel;

            $row['overlayColor']     = $row['overlay_color'] ?? '#1a1816';
            $row['overlayOpacity']  = (float)($row['overlay_opacity'] ?? 0.35);

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

            $isActive        = isset($data['is_active']) ? ((int)$data['is_active']) : 1;
            $title           = $data['title'] ?? 'BIENVENIDOS A LA CIUDAD UNIVERSITARIA Y METROPOLITANA';
            $subtitle        = $data['subtitle'] ?? '';
            $videoUrl        = $data['videoUrl'] ?? $data['video_url'] ?? '';
            $fallbackImg     = $data['fallbackImg'] ?? $data['fallback_image_url'] ?? '';
            $primaryBtnText  = $data['primaryBtnText'] ?? $data['primary_btn_text'] ?? 'Conoce León';
            $primaryBtnLink  = $data['primaryBtnLink'] ?? $data['primary_btn_link'] ?? '#turismo';
            $secondaryBtnText= $data['secondaryBtnText'] ?? $data['secondary_btn_text'] ?? 'Servicios Rápidos';
            $secondaryBtnLink= $data['secondaryBtnLink'] ?? $data['secondary_btn_link'] ?? '#servicios';
            $badgeText       = $data['badgeText'] ?? $data['badge_text'] ?? 'Alcaldía Municipal de León';
            $bgType          = $data['bgType'] ?? $data['bg_type'] ?? 'video';
            $bgImageUrl      = $data['bgImageUrl'] ?? $data['bg_image_url'] ?? '';

            // Carrusel: se reciben hasta 6 imágenes y se guardan como JSON.
            $carouselImages  = $data['carouselImages'] ?? $data['carousel_images'] ?? [];
            if (is_string($carouselImages)) {
                $decodedCarousel = json_decode($carouselImages, true);
                $carouselImages = is_array($decodedCarousel) ? $decodedCarousel : [];
            }
            if (!is_array($carouselImages)) {
                $carouselImages = [];
            }
            $carouselImages = array_values(array_map(static fn($item) => self::normalizeCarouselItem($item), $carouselImages));
            $carouselImages = array_slice(array_pad($carouselImages, self::CAROUSEL_SLOTS, ['type' => 'image', 'src' => '', 'poster' => '']), 0, self::CAROUSEL_SLOTS);
            $carouselJson    = json_encode($carouselImages, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

            $overlayColor    = $data['overlayColor'] ?? $data['overlay_color'] ?? '#1a1816';
            $overlayOpacity  = max(0, min(1, (float)($data['overlayOpacity'] ?? $data['overlay_opacity'] ?? 0.35)));
            if (!preg_match('/^#[0-9a-fA-F]{6}$/', (string)$overlayColor)) {
                $overlayColor = '#1a1816';
            }

            // Validar bgType
            if (!in_array($bgType, ['video', 'image', 'carousel', 'none'], true)) {
                $bgType = 'video';
            }

            $stmt = $pdo->prepare("SELECT id FROM hero WHERE id = ?");
            $stmt->execute([self::HERO_ID]);
            if ($stmt->fetch()) {
                $update = $pdo->prepare("
                    UPDATE hero SET title=?, subtitle=?, video_url=?, fallback_image_url=?, primary_btn_text=?,
                    primary_btn_link=?, secondary_btn_text=?, secondary_btn_link=?, is_active=?, badge_text=?,
                    bg_type=?, bg_image_url=?, carousel_images=?, overlay_color=?, overlay_opacity=?, updated_at=CURRENT_TIMESTAMP
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
                    $bgType,
                    $bgImageUrl,
                    $carouselJson,
                    $overlayColor,
                    $overlayOpacity,
                    self::HERO_ID
                ]);
            } else {
                $insert = $pdo->prepare("
                    INSERT INTO hero (id, title, subtitle, video_url, fallback_image_url, primary_btn_text, primary_btn_link,
                        secondary_btn_text, secondary_btn_link, is_active, badge_text, bg_type, bg_image_url, carousel_images, overlay_color, overlay_opacity)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    $badgeText,
                    $bgType,
                    $bgImageUrl,
                    $carouselJson,
                    $overlayColor,
                    $overlayOpacity
                ]);
            }

            self::getHero();
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar portada: ' . $e->getMessage()]);
        }
    }

    public static function uploadVideo(): void {
        try {
            $file = $_FILES['video'] ?? $_FILES['file'] ?? null;
            if (!$file) {
                $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
                http_response_code($contentLength > 0 ? 413 : 400);
                $postMax = ini_get('post_max_size') ?: 'el límite del servidor';
                echo json_encode([
                    'error' => $contentLength > 0
                        ? "El archivo supera el límite de la petición del servidor ({$postMax})."
                        : 'Selecciona un video para subir.'
                ]);
                return;
            }

            $error = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
            if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) {
                http_response_code(413);
                $uploadMax = ini_get('upload_max_filesize') ?: 'el límite del servidor';
                echo json_encode(['error' => "El video supera el límite configurado en el servidor ({$uploadMax})."]);
                return;
            }
            if ($error !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(['error' => 'No se pudo recibir el video. Código de error: ' . $error]);
                return;
            }

            if (($file['size'] ?? 0) > self::MAX_VIDEO_BYTES) {
                http_response_code(413);
                $maxMb = (int)(self::MAX_VIDEO_BYTES / (1024 * 1024));
                echo json_encode(['error' => "El video no puede superar {$maxMb} MB."]);
                return;
            }
            $extension = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
            $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
            $allowed = ['mp4' => ['video/mp4'], 'webm' => ['video/webm', 'application/octet-stream']];
            if (!isset($allowed[$extension]) || !in_array($mime, $allowed[$extension], true)) {
                http_response_code(400);
                echo json_encode(['error' => 'Solo se permiten videos MP4 o WebM válidos.']);
                return;
            }
            $uploadsDir = dirname(__DIR__) . '/uploads';
            if (!is_dir($uploadsDir) && !mkdir($uploadsDir, 0755, true) && !is_dir($uploadsDir)) {
                throw new \RuntimeException('No se pudo crear la carpeta de subidas.');
            }
            $filename = 'hero_' . bin2hex(random_bytes(12)) . '.' . $extension;
            if (!move_uploaded_file($file['tmp_name'], $uploadsDir . '/' . $filename)) {
                throw new \RuntimeException('No se pudo guardar el video.');
            }
            echo json_encode(['url' => '/uploads/' . $filename]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al subir video: ' . $e->getMessage()]);
        }
    }
}
