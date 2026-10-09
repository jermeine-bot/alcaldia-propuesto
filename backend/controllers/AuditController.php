<?php

namespace Controllers;

use Services\AuditService;

class AuditController {
    public static function getLogs(): void {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $logs = AuditService::getLogs($limit);
        echo json_encode($logs);
    }
}
