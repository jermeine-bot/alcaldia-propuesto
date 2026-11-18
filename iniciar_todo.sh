#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "==================================================================="
echo "    INICIANDO SISTEMA ALCALDIA DE LEON (PHP PUERTO 5505 + FRONTEND)"
echo "==================================================================="

# Iniciar Backend PHP en segundo plano
echo "[1/2] Iniciando Backend en PHP (Puerto 5505)..."
bash "$DIR/backend/start.sh" &
BACKEND_PID=$!

# Trap para matar el backend al cerrar el script con Ctrl+C
cleanup() {
    echo ""
    echo "Deteniendo servidores..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Esperar 1 segundo y levantar el frontend
sleep 1
echo "[2/2] Iniciando Frontend React (Vite)..."
echo ""
echo "Todo listo:"
echo " - Backend API:  http://localhost:5505/api"
echo " - Frontend Web: http://localhost:5173"
echo "==================================================================="

npm run dev
