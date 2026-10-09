<?php

namespace Controllers;

use Config\Database;
use Services\FacebookService;

class FacebookController {
    public static function getStatus(): void {
        $pageId = Database::env('FACEBOOK_PAGE_ID', 'No configurado');
        $interval = Database::env('FACEBOOK_SYNC_MINUTES', '30');

        echo json_encode([
            'configured' => FacebookService::isConfigured(),
            'page_id' => $pageId,
            'sync_interval' => "{$interval} minutos"
        ]);
    }

    public static function syncNow(): void {
        $result = FacebookService::syncPosts();
        if (empty($result['success'])) {
            http_response_code(500);
        }
        echo json_encode($result);
    }
}
