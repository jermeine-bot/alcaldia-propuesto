<?php
require __DIR__.'/config/Database.php';
try {
    $pdo = Config\Database::getConnection();
    echo "OK\n";
} catch (Throwable $e) {
    echo "ERR: " . $e->getMessage() . "\n";
}
?>
