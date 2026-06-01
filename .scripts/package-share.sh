#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

python3 scripts/build-portable.py

ZIP="$ROOT/dist/Premium-Health-Certificate-Share.zip"
mkdir -p dist
rm -f "$ZIP"

(
  cd "$ROOT"
  zip -r "$ZIP" \
    "HOW TO USE.txt" \
    "Open Certificate.command" \
    "Open Certificate.bat" \
    "employee-certificate/project" \
    -x "*.DS_Store" \
    -x "*/.thumbnail" \
    -x "*/Employee Certificate - Digital (standalone).html"
)

chmod +x "Open Certificate.command" 2>/dev/null || true
echo "Created $ZIP"
