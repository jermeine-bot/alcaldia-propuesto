<?php

namespace Services;

use Config\Database;
use PDO;

class AuditService {
    public static function logAction(?array $user, string $action, string $module, string $details = ''): array {
        $pdo = Database::getConnection();

        $userId = $user['id'] ?? 'system';
        $userEmail = $user['email'] ?? 'sistema@alcaldaleon.gob.ni';
        $userName = $user['name'] ?? $userEmail ?? 'Sistema';
        $role = $user['role'] ?? 'admin';

        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if (str_contains($ip, ',')) {
            $ip = trim(explode(',', $ip)[0]);
        }

        $id = 'log-' . bin2hex(random_bytes(16));
        $now = date('Y-m-d H:i:s');

        $stmt = $pdo->prepare("
            INSERT INTO activity_logs (id, userId, userEmail, userName, role, action, module, details, ip, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$id, $userId, $userEmail, $userName, $role, $action, $module, $details, $ip, $now]);

        return [
            'id' => $id,
            'userId' => $userId,
            'userEmail' => $userEmail,
            'userName' => $userName,
            'role' => $role,
            'action' => $action,
            'module' => $module,
            'details' => $details,
            'ip' => $ip,
            'timestamp' => $now
        ];
    }

    public static function getLogs(int $limit = 100): array {
        $pdo = Database::getConnection();
        $safeLimit = max(1, min($limit, 500));

        $stmt = $pdo->prepare("SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT " . (int)$safeLimit);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Cuenta los intentos de login fallidos recientes para un correo e IP.
     * Se usa para bloquear temporalmente la fuerza bruta.
     */
    public static function countRecentFailedLogins(string $email, string $ip, int $minutes = 15): int {
        $pdo = Database::getConnection();
        $since = date('Y-m-d H:i:s', time() - ($minutes * 60));

        $stmt = $pdo->prepare("
            SELECT COUNT(*)
            FROM activity_logs
            WHERE action = 'LOGIN_FALLIDO'
              AND LOWER(userEmail) = ?
              AND ip = ?
              AND timestamp >= ?
        ");
        $stmt->execute([strtolower($email), $ip, $since]);

        return (int)$stmt->fetchColumn();
    }
}
