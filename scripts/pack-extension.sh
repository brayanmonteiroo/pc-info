#!/usr/bin/env bash
# Build the EGO-ready ZIP (schemas + compiled locales, no po/ sources).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

UUID="pc-info@brayanmonteiroo.github.io"
PACKED="${UUID}.shell-extension.zip"
ZIP="${UUID}.zip"

glib-compile-schemas schemas/

rm -f "$PACKED" "$ZIP"
gnome-extensions pack \
  --force \
  --podir=po \
  --gettext-domain="$UUID" \
  --extra-source=LICENSE \
  --extra-source=stylesheet.css \
  --extra-source=lib \
  -o "$ROOT" \
  "$ROOT"

if [[ ! -f "$PACKED" ]]; then
  echo "ERROR: expected pack output missing: $PACKED" >&2
  ls -la "$ROOT"/*.zip 2>/dev/null || true
  exit 1
fi

mv -f "$PACKED" "$ZIP"
echo "Created $ZIP"
unzip -Z1 "$ZIP" | sort | sed 's/^/  /'
