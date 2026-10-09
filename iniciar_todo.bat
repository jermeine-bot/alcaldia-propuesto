@echo off
title Sistema Alcaldia de Leon
cd /d "%~dp0"

echo ===================================================================
echo     INICIANDO SISTEMA ALCALDIA DE LEON (PHP PUERTO 5505 + FRONTEND)
echo ===================================================================

echo [1/2] Iniciando Backend en PHP Puro (Puerto 5505)...
start "Backend PHP (Puerto 5505)" cmd /k "cd /d "%~dp0backend" && start.bat"

echo [2/2] Iniciando Frontend React (Vite)...
start "Frontend React" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo Todo listo!
echo - Backend API:  http://localhost:5505
echo - Frontend Web: http://localhost:5173 (se abrira en unos segundos)
echo ===================================================================
timeout /t 3 >nul
start http://localhost:5173
pause
