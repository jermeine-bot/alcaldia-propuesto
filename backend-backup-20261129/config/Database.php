<?php

namespace Config;

use PDO;
use PDOException;
use RuntimeException;

class Database {
    private static ?PDO $instance = null;
    private static string $driver = 'mysql';
    private static bool $envLoaded = false;

    public static function loadEnv(string $path = __DIR__ . '/../.env'): void {
        if (self::$envLoaded) {
            return;
        }
        self::$envLoaded = true;

        if (!file_exists($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            $parts = explode('=', $line, 2);
            if (count($parts) !== 2) {
                continue;
            }

            $key = trim($parts[0]);
            $val = trim(trim($parts[1]), "\"'");

            // Las variables reales del entorno siempre tienen prioridad sobre el archivo.
            if (getenv($key) !== false || array_key_exists($key, $_ENV)) {
                continue;
            }

            $_ENV[$key] = $val;
            putenv("$key=$val");
        }
    }

    public static function env(string $key, $default = null) {
        self::loadEnv();
        $value = $_ENV[$key] ?? getenv($key);
        return $value === false || $value === null ? $default : $value;
    }

    public static function isProduction(): bool {
        return strtolower((string)self::env('APP_ENV', 'production')) === 'production';
    }

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        self::loadEnv();

        $configuredDriver = strtolower((string)self::env('DB_DRIVER', 'mysql'));
        $host = self::env('MYSQL_HOST', 'localhost');
        $port = self::env('MYSQL_PORT', '3306');
        $dbName = self::env('MYSQL_DATABASE', 'alcaldia_leon');
        $user = self::env('MYSQL_USER', 'root');
        $pass = self::env('MYSQL_PASSWORD', '');

        if ($configuredDriver === 'mysql') {
            try {
                // Solo en desarrollo se crea la base automáticamente.
                if (!self::isProduction() && (string)self::env('DB_CREATE_DATABASE', '1') === '1') {
                    $initPdo = new PDO(
                        "mysql:host={$host};port={$port};charset=utf8mb4",
                        $user,
                        $pass,
                        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 2]
                    );
                    $initPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
                }

                $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
                self::$driver = 'mysql';
                // Aplicar modo SQL estricto en producción para mayor seguridad y compatibilidad
                if (self::isProduction()) {
                    self::$instance->exec("SET SESSION sql_mode='STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'");
                }
                return self::$instance;
            } catch (PDOException $e) {
                error_log('No se pudo conectar a MySQL: ' . $e->getMessage());
                if (self::isProduction()) {
                    throw new RuntimeException('No se pudo conectar a la base de datos configurada.');
                }
            }
        } elseif ($configuredDriver !== 'sqlite') {
            throw new RuntimeException('DB_DRIVER no soportado. Usa mysql o sqlite.');
        }

        // SQLite explícito o fallback de desarrollo cuando MySQL no está disponible.
        $sqlitePath = dirname(__DIR__) . '/database.sqlite';
        self::$instance = new PDO("sqlite:{$sqlitePath}", null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        self::$instance->exec('PRAGMA foreign_keys = ON;');
        self::$driver = 'sqlite';
        return self::$instance;
    }

    public static function getDriver(): string {
        if (self::$instance === null) {
            self::getConnection();
        }
        return self::$driver;
    }
}
