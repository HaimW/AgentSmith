#!/usr/bin/env bash
# PostToolUse hook — runs after Claude edits a file.
#
# Two jobs, whichever applies:
#   1. Edited a swarm agent/skill  -> validate the canonical source immediately,
#      so a broken agent is caught at the edit, not at the next generate.
#   2. Edited project code         -> run the formatter recorded in
#      .agentsmith/profile.json (project-intake writes it; absent = skip).
#
# Exit 0 = silent pass. Exit 2 = surface the message back to Claude.
# This hook never blocks an edit for anything other than a real validation error.
set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
payload=$(cat 2>/dev/null || true)

# file_path out of the hook payload, without requiring jq
file=$(printf '%s' "$payload" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
[ -z "$file" ] && exit 0

rel="${file#"$ROOT"/}"

# ---- 1. swarm source edited -> validate ----
case "$rel" in
  agents/*.md|skills/*|domains/*/loop.md|\
  .agentsmith/agents/*.md|.agentsmith/skills/*|.agentsmith/domains/*/loop.md)
    for v in "$ROOT/tools/validate.mjs" "$ROOT/.agentsmith/tools/validate.mjs"; do
      [ -f "$v" ] || continue
      if ! out=$(cd "$(dirname "$(dirname "$v")")" && node "$v" 2>&1); then
        echo "Swarm validation failed after editing $rel:" >&2
        echo "$out" | grep -E '^ERROR' >&2
        echo "Fix the canonical source, then re-run: node tools/validate.mjs" >&2
        exit 2
      fi
      break
    done
    exit 0
    ;;
esac

# ---- 2. project code edited -> run the configured formatter ----
profile="$ROOT/.agentsmith/profile.json"
[ -f "$profile" ] || exit 0
fmt=$(sed -n 's/.*"formatCommand"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$profile" | head -1)
[ -z "$fmt" ] && exit 0

# Only format files the formatter plausibly handles.
case "$rel" in
  *.js|*.jsx|*.ts|*.tsx|*.mjs|*.cjs|*.json|*.css|*.scss|*.html|*.md|*.py|*.go|*.rs) ;;
  *) exit 0 ;;
esac

( cd "$ROOT" && eval "$fmt \"$file\"" ) >/dev/null 2>&1 || true
exit 0
