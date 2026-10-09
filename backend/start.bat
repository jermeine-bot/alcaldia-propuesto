@echo off
title Backend PHP - Alcaldia de Leon (Puerto 5505)
cd /d "%~dp0"
echo ========================================================
echo   Iniciando Backend PHP Puro en http://localhost:5505
echo ========================================================
set "PHP_PATH=C:\Users\yacel\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe"
if exist "%PHP_PATH%\php.exe" (
    set "PATH=%PHP_PATH%;%PATH%"
)
php -S 0.0.0.0:5505 router.php
pause
