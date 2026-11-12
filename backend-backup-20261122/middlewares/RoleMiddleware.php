<?php

namespace Middlewares;

class RoleMiddleware {
    public static function check(array $user, array $allowedRoles = []): void {
        $userRole = $user['role'] ?? 'visor';

        if ($userRole === 'superadmin') {
            return;
        }

        if (in_array($userRole, $allowedRoles, true)) {
            return;
        }

        http_response_code(403);
        $rolesStr = implode(', ', $allowedRoles);
        echo json_encode([
            'error' => "Acceso denegado. Se requiere rol [{$rolesStr}], pero tu rol actual es [{$userRole}]."
        ]);
        exit;
    }
}
