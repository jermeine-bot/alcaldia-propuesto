#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PORT="${PORT:-5505}"
UPLOAD_TMP_DIR="$(pwd)/data/tmp"
mkdir -p "$UPLOAD_TMP_DIR"

echo "Iniciando backend PHP en http://localhost:${PORT} ..."
exec php \
  -d upload_max_filesize=500M \
  -d post_max_size=512M \
  -d memory_limit=256M \
  -d max_execution_time=300 \
  -d upload_tmp_dir="$UPLOAD_TMP_DIR" \
  -S "0.0.0.0:${PORT}" router.php
