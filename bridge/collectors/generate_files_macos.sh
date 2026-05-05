#!/usr/bin/env bash
set -euo pipefail

HOME_DIR="${HOME:-}"
if [[ -z "$HOME_DIR" ]]; then
  echo "HOME not set"
  exit 1
fi

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_FILE="${OUT_DIR}/files.json"

find "$HOME_DIR/Documents" "$HOME_DIR/Downloads" "$HOME_DIR/Desktop" -type f 2>/dev/null | \
  python3 - <<'PY' > "$OUT_FILE"
import json, sys
paths = [line.strip() for line in sys.stdin if line.strip()]
print(json.dumps(paths, indent=2))
PY

echo "Wrote files to $OUT_FILE"
