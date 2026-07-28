#!/usr/bin/env bash
# Scan a repo for committed secrets — working tree and git history.
# Deterministic pattern matching; a clean result is not proof of safety, but a
# hit is almost always worth acting on.
#
#   ./scan-secrets.sh [dir]
set -uo pipefail
DIR="${1:-.}"
cd "$DIR" || { echo "cannot cd to $DIR" >&2; exit 2; }

hits=0
report() { hits=$((hits+1)); printf '\n[%s]\n%s\n' "$1" "$2"; }

# High-signal provider tokens. Deliberately narrow to keep noise down.
PATTERNS='
AKIA[0-9A-Z]{16}
ghp_[A-Za-z0-9]{36}
github_pat_[A-Za-z0-9_]{22,}
sk-[A-Za-z0-9]{20,}
sk_live_[A-Za-z0-9]{20,}
xox[baprs]-[A-Za-z0-9-]{10,}
-----BEGIN (RSA|OPENSSH|DSA|EC|PGP) PRIVATE KEY-----
eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}
'

EXCLUDE='--exclude-dir=.git --exclude-dir=node_modules --exclude-dir=vendor
--exclude-dir=dist --exclude-dir=build --exclude-dir=.venv --exclude-dir=target'

echo "== working tree =="
while IFS= read -r pat; do
  [ -z "$pat" ] && continue
  # shellcheck disable=SC2086
  out=$(grep -rEIn $EXCLUDE "$pat" . 2>/dev/null | head -20)
  [ -n "$out" ] && report "token: $pat" "$out"
done <<< "$PATTERNS"

# Assignments that look like real values (not placeholders).
out=$(grep -rEIn $EXCLUDE \
  '(password|passwd|secret|api[_-]?key|token|private[_-]?key)[[:space:]]*[:=][[:space:]]*["'\''][^"'\'']{8,}["'\'']' . 2>/dev/null \
  | grep -vEi '(example|sample|placeholder|dummy|changeme|your[_-]|xxx+|\*\*\*|<[^>]+>|\$\{|process\.env|os\.environ|getenv)' \
  | head -20)
[ -n "$out" ] && report "hardcoded credential assignment" "$out"

# .env files that are tracked by git (the classic mistake)
if git rev-parse --git-dir >/dev/null 2>&1; then
  out=$(git ls-files | grep -E '(^|/)\.env($|\.)' | grep -vE '\.(example|sample|template)$' | head -20)
  [ -n "$out" ] && report "tracked .env file" "$out"

  echo
  echo "== git history (last 200 commits) =="
  out=$(git log -p --no-color -200 2>/dev/null \
    | grep -E '^\+' \
    | grep -EIn 'AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|sk_live_[A-Za-z0-9]{20,}|-----BEGIN .* PRIVATE KEY-----' \
    | head -20)
  [ -n "$out" ] && report "secret in git history (rotate it — deleting the file is NOT enough)" "$out"
fi

echo
if [ "$hits" -eq 0 ]; then
  echo "No secrets matched. (Absence of a match is not proof of absence.)"
  exit 0
fi
echo "$hits pattern group(s) matched — review each above."
echo "If a real secret reached git history, ROTATE IT. Rewriting history does not un-leak it."
exit 1
