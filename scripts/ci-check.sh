#!/usr/bin/env bash
# Lightweight CI checks for the GNOME Shell extension package.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

UUID="pc-info@brayanmonteiroo.github.io"
ZIP="${UUID}.zip"
SCHEMA="schemas/org.gnome.shell.extensions.pc-info.gschema.xml"
DOMAIN="$UUID"

echo "==> Validating metadata.json"
python3 - <<'PY'
import json
import sys
from pathlib import Path

path = Path("metadata.json")
data = json.loads(path.read_text(encoding="utf-8"))

required = {
    "uuid": "pc-info@brayanmonteiroo.github.io",
    "name": str,
    "description": str,
    "shell-version": list,
    "settings-schema": "org.gnome.shell.extensions.pc-info",
    "gettext-domain": "pc-info@brayanmonteiroo.github.io",
}

for key, expected in required.items():
    if key not in data:
        print(f"ERROR: missing metadata key: {key}", file=sys.stderr)
        sys.exit(1)
    value = data[key]
    if isinstance(expected, type):
        if not isinstance(value, expected):
            print(f"ERROR: {key} must be {expected.__name__}", file=sys.stderr)
            sys.exit(1)
    elif value != expected:
        print(f"ERROR: {key} must be {expected!r}, got {value!r}", file=sys.stderr)
        sys.exit(1)

shell_versions = data["shell-version"]
if not shell_versions or not all(isinstance(v, str) for v in shell_versions):
    print("ERROR: shell-version must be a non-empty list of strings", file=sys.stderr)
    sys.exit(1)

if "version" in data:
    print(
        "ERROR: do not set metadata version; EGO owns that field",
        file=sys.stderr,
    )
    sys.exit(1)

print("OK: metadata.json")
PY

echo "==> Checking schema and translation sources"
test -f "$SCHEMA"
test -f "po/${DOMAIN}.pot"
test -f "po/pt_BR.po"
test -f "po/pt.po"

echo "==> Compiling schemas and packing"
./scripts/pack-extension.sh

echo "==> Verifying ZIP contents"
mapfile -t entries < <(unzip -Z1 "$ZIP" | sort)
required_entries=(
  "metadata.json"
  "extension.js"
  "prefs.js"
  "stylesheet.css"
  "LICENSE"
  "schemas/org.gnome.shell.extensions.pc-info.gschema.xml"
  "schemas/gschemas.compiled"
)

missing=0
for entry in "${required_entries[@]}"; do
  if ! printf '%s\n' "${entries[@]}" | grep -Fxq "$entry"; then
    echo "ERROR: ZIP missing required entry: $entry" >&2
    missing=1
  fi
done

if ! printf '%s\n' "${entries[@]}" | grep -Eq '^lib/.+\.js$'; then
  echo "ERROR: ZIP has no lib/*.js modules" >&2
  missing=1
fi

if ! printf '%s\n' "${entries[@]}" | grep -Eq "^locale/.+/LC_MESSAGES/${DOMAIN}\\.mo$"; then
  echo "ERROR: ZIP has no compiled locale .mo files" >&2
  missing=1
fi

if printf '%s\n' "${entries[@]}" | grep -Eq '\.po$|\.pot$'; then
  echo "ERROR: ZIP must not include .po/.pot sources" >&2
  missing=1
fi

if [[ "$missing" -ne 0 ]]; then
  echo "ZIP contents:" >&2
  printf '  %s\n' "${entries[@]}" >&2
  exit 1
fi

echo "OK: ZIP has required entries"

echo "==> Syntax-checking JS with node"
mapfile -t js_files < <(find . -name '*.js' -not -path './.git/*' | sort)
for file in "${js_files[@]}"; do
  node --check "$file"
done
echo "OK: node --check passed (${#js_files[@]} files)"

echo "==> All CI checks passed"
