#!/usr/bin/env bash
# Fail if the latest commit message contains a Cursor/Agent Co-authored-by trailer.
set -euo pipefail

msg="$(git log -1 --format=%B)"
if printf '%s\n' "$msg" | grep -Ei 'Co-authored-by:.*Cursor|Co-authored-by:.*cursoragent@' >/dev/null; then
  echo "ERROR: commit contains Cursor Co-authored-by trailer:" >&2
  git log -1 --format=full >&2
  exit 1
fi

echo "OK: no Cursor coauthor in HEAD"
