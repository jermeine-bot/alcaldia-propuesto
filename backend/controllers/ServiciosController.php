<?php

namespace Controllers;

use Config\Database;
use PDO;

class ServiciosController {
    public static function getSettings(): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT eyebrow, title, description, phone FROM servicios_settings WHERE id = 'main'");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'No se encontró la configuración de servicios.']);
            return;
        }

        echo json_encode($row);
    }

    public static function updateSettings(array $body): void {
        $settings = [
            'eyebrow' => trim((string)($body['eyebrow'] ?? '')),
            'title' => trim((string)($body['title'] ?? '')),
            'description' => trim((string)($body['description'] ?? '')),
            'phone' => trim((string)($body['phone'] ?? ''))
        ];

        foreach ($settings as $val) {
            if ($val === '') {
                http_response_code(400);
                echo json_encode(['error' => 'Completa todos los campos de la sección.']);
                return;
            }
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id FROM servicios_settings WHERE id = 'main'");
        $stmt->execute();
        if ($stmt->fetch()) {
            $update = $pdo->prepare("
                UPDATE servicios_settings SET eyebrow=?, title=?, description=?, phone=? WHERE id='main'
            ");
            $update->execute([$settings['eyebrow'], $settings['title'], $settings['description'], $settings['phone']]);
        } else {
            $insert = $pdo->prepare("
                INSERT INTO servicios_settings (id, eyebrow, title, description, phone) VALUES ('main', ?, ?, ?, ?)
            ");
            $insert->execute([$settings['eyebrow'], $settings['title'], $settings['description'], $settings['phone']]);
        }

        echo json_encode($settings);
    }

    private static function fetchAll(): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM servicios ORDER BY display_order ASC, created_at ASC");
        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($services)) {
            return [];
        }

        $serviceIds = array_column($services, 'id');
        $placeholders = implode(',', array_fill(0, count($serviceIds), '?'));

        $subStmt = $pdo->prepare("
            SELECT id, servicio_id, title, `desc`, icon, linkText, linkUrl
            FROM subservicios WHERE servicio_id IN ($placeholders) ORDER BY id ASC
        ");
        $subStmt->execute($serviceIds);
        $allSub = $subStmt->fetchAll(PDO::FETCH_ASSOC);

        $byService = [];
        foreach ($allSub as $sub) {
            $sid = $sub['servicio_id'];
            unset($sub['servicio_id']);
            $byService[$sid][] = $sub;
        }

        foreach ($services as &$s) {
            $s['opciones'] = $byService[$s['id']] ?? [];
            $s['count'] = count($s['opciones']);
            $s['display_order'] = (int)$s['display_order'];
        }

        return $services;
    }

    public static function getAll(): void {
        echo json_encode(self::fetchAll());
    }

    public static function create(array $body): void {
        $title = trim((string)($body['title'] ?? ''));
        $subtitle = trim((string)($body['subtitle'] ?? ''));

        if ($title === '' || $subtitle === '') {
            http_response_code(400);
            echo json_encode(['error' => 'El título y el subtítulo son obligatorios.']);
            return;
        }

        $id = $body['id'] ?? ('servicio-' . bin2hex(random_bytes(8)));
        $pdo = Database::getConnection();
        $pdo->beginTransaction();

        try {
            $countStmt = $pdo->query("SELECT COUNT(*) FROM servicios");
            $total = (int)$countStmt->fetchColumn();

            $opciones = is_array($body['opciones'] ?? null) ? $body['opciones'] : [];

            $insert = $pdo->prepare("
                INSERT INTO servicios (id, title, subtitle, icon, color, badgeIcon, `desc`, display_order, count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $insert->execute([
                $id,
                $title,
                $subtitle,
                $body['icon'] ?? '',
                $body['color'] ?? '',
                $body['badgeIcon'] ?? '',
                $body['desc'] ?? '',
                $total,
                count($opciones)
            ]);

            $subInsert = $pdo->prepare("
                INSERT INTO subservicios (id, servicio_id, title, `desc`, icon, linkText, linkUrl)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            foreach ($opciones as $opt) {
                $subInsert->execute([
                    $opt['id'] ?? ('opt-' . bin2hex(random_bytes(4))),
                    $id,
                    $opt['title'] ?? '',
                    $opt['desc'] ?? '',
                    $opt['icon'] ?? '',
                    $opt['linkText'] ?? '',
                    $opt['linkUrl'] ?? ''
                ]);
            }

            $pdo->commit();
            http_response_code(201);
            echo json_encode(self::fetchAll());
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo crear la categoría de servicios: ' . $e->getMessage()]);
        }
    }

    public static function update(string $id, array $body): void {
        $title = trim((string)($body['title'] ?? ''));
        $subtitle = trim((string)($body['subtitle'] ?? ''));

        if ($title === '' || $subtitle === '') {
            http_response_code(400);
            echo json_encode(['error' => 'El título y el subtítulo son obligatorios.']);
            return;
        }

        $pdo = Database::getConnection();
        $pdo->beginTransaction();

        try {
            $update = $pdo->prepare("
                UPDATE servicios SET title=?, subtitle=?, icon=?, color=?, badgeIcon=?, `desc`=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            ");
            $update->execute([
                $title,
                $subtitle,
                $body['icon'] ?? '',
                $body['color'] ?? '',
                $body['badgeIcon'] ?? '',
                $body['desc'] ?? '',
                $id
            ]);

            if (isset($body['opciones']) && is_array($body['opciones'])) {
                $del = $pdo->prepare("DELETE FROM subservicios WHERE servicio_id = ?");
                $del->execute([$id]);

                $subInsert = $pdo->prepare("
                    INSERT INTO subservicios (id, servicio_id, title, `desc`, icon, linkText, linkUrl)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                foreach ($body['opciones'] as $opt) {
                    $subInsert->execute([
                        $opt['id'] ?? ('opt-' . bin2hex(random_bytes(4))),
                        $id,
                        $opt['title'] ?? '',
                        $opt['desc'] ?? '',
                        $opt['icon'] ?? '',
                        $opt['linkText'] ?? '',
                        $opt['linkUrl'] ?? ''
                    ]);
                }

                $cntUpdate = $pdo->prepare("UPDATE servicios SET count = ? WHERE id = ?");
                $cntUpdate->execute([count($body['opciones']), $id]);
            }

            $pdo->commit();
            echo json_encode(self::fetchAll());
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo actualizar la categoría de servicios.']);
        }
    }

    public static function delete(string $id): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM servicios WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(self::fetchAll());
    }

    public static function saveSubservicio(string $serviceId, array $body, ?string $subservicioId = null): void {
        $title = trim((string)($body['title'] ?? ''));
        $desc = trim((string)($body['desc'] ?? ''));

        if ($title === '' || $desc === '') {
            http_response_code(400);
            echo json_encode(['error' => 'El nombre y la descripción del trámite son obligatorios.']);
            return;
        }

        $optionId = $subservicioId ?: ($body['id'] ?? ('opt-' . bin2hex(random_bytes(4))));

        $pdo = Database::getConnection();
        $pdo->beginTransaction();

        try {
            $check = $pdo->prepare("SELECT id FROM subservicios WHERE id = ? AND servicio_id = ?");
            $check->execute([$optionId, $serviceId]);

            if ($check->fetch()) {
                $update = $pdo->prepare("
                    UPDATE subservicios SET title=?, `desc`=?, icon=?, linkText=?, linkUrl=? WHERE id=? AND servicio_id=?
                ");
                $update->execute([
                    $title,
                    $desc,
                    $body['icon'] ?? '',
                    $body['linkText'] ?? '',
                    $body['linkUrl'] ?? '',
                    $optionId,
                    $serviceId
                ]);
            } else {
                $insert = $pdo->prepare("
                    INSERT INTO subservicios (id, servicio_id, title, `desc`, icon, linkText, linkUrl)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                $insert->execute([
                    $optionId,
                    $serviceId,
                    $title,
                    $desc,
                    $body['icon'] ?? '',
                    $body['linkText'] ?? '',
                    $body['linkUrl'] ?? ''
                ]);
            }

            $cnt = $pdo->prepare("
                UPDATE servicios SET count = (SELECT COUNT(*) FROM subservicios WHERE servicio_id = ?) WHERE id = ?
            ");
            $cnt->execute([$serviceId, $serviceId]);

            $pdo->commit();
            echo json_encode(self::fetchAll());
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo guardar el trámite o servicio.']);
        }
    }

    public static function deleteSubservicio(string $serviceId, string $subservicioId): void {
        $pdo = Database::getConnection();
        $pdo->beginTransaction();

        try {
            $del = $pdo->prepare("DELETE FROM subservicios WHERE id = ? AND servicio_id = ?");
            $del->execute([$subservicioId, $serviceId]);

            $cnt = $pdo->prepare("
                UPDATE servicios SET count = (SELECT COUNT(*) FROM subservicios WHERE servicio_id = ?) WHERE id = ?
            ");
            $cnt->execute([$serviceId, $serviceId]);

            $pdo->commit();
            echo json_encode(self::fetchAll());
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo eliminar el trámite o servicio.']);
        }
    }
}
