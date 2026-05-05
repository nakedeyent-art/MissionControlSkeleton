#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_FILE="${OUT_DIR}/files.json"

BASES=(
  "/storage/emulated/0/Download"
  "/storage/emulated/0/Documents"
  "/storage/emulated/0/DCIM"
)

TMP_FILE="$(mktemp)"
for base in "${BASES[@]}"; do
  if [[ -d "$base" ]]; then
    find "$base" -type f 2>/dev/null >> "$TMP_FILE"
  fi
done

python3 - <<'PY' < "$TMP_FILE" > "$OUT_FILE"
import json, sys
paths = [line.strip() for line in sys.stdin if line.strip()]
print(json.dumps(paths, indent=2))
PY

rm -f "$TMP_FILE"
echo "Wrote files to $OUT_FILE"
