<?php

namespace Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;
    private static string $driver = 'mysql';

    public static function loadEnv(string $path = __DIR__ . '/../.env'): void {
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
            if (count($parts) === 2) {
                $key = trim($parts[0]);
                $val = trim($parts[1]);
                $val = trim($val, "\"'");
                if (!array_key_exists($key, $_ENV)) {
                    $_ENV[$key] = $val;
                    putenv("$key=$val");
                }
            }
        }
    }

    public static function env(string $key, $default = null) {
        self::loadEnv();
        $value = $_ENV[$key] ?? getenv($key);
        return $value === false || $value === null ? $default : $value;
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
        $pass = self::env('MYSQL_PASSWORD', 'root');

        if ($configuredDriver === 'mysql') {
            try {
                // Conectar inicialmente para asegurar que la base de datos exista
                $dsnWithoutDb = "mysql:host={$host};port={$port};charset=utf8mb4";
                $initPdo = new PDO($dsnWithoutDb, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_TIMEOUT => 2
                ]);
                $initPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");

                $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
                self::$driver = 'mysql';
                return self::$instance;
            } catch (PDOException $e) {
                error_log("Aviso: MySQL no disponible (" . $e->getMessage() . "). Activando fallback transparente a SQLite.");
            }
        }

        // Fallback a SQLite
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
