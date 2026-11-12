<?php

namespace Services;

use Config\Database;

class RequestService {
    /**
     * Devuelve la IP del cliente.
     * X-Forwarded-For solo se usa cuando TRUST_PROXY=1 (detrás de un proxy propio),
     * porque de lo contrario cualquiera puede falsificarla y saltarse el rate limit.
     */
    public static function clientIp(): string {
        $remote = (string)($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
        $trustProxy = in_array(
            strtolower((string)Database::env('TRUST_PROXY', '0')),
            ['1', 'true', 'yes', 'on'],
            true
        );

        if (!$trustProxy) {
            return $remote;
        }

        $forwarded = (string)($_SERVER['HTTP_X_FORWARDED_FOR'] ?? '');
        if ($forwarded === '') {
            return $remote;
        }

        $ip = trim(explode(',', $forwarded)[0]);
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : $remote;
    }
}
