#!/usr/bin/env bash
# Generate the Codex refuter's context from the Claude author's context.
#
# WHY THIS EXISTS (CEO order 2026-08-16). The refuter — Codex, gpt-5.6-sol at
# high reasoning — is the project's adversarial second eye, and it reads its own
# carriers: AGENTS.md at the repo root, .agents/skills/ for the doors, and
# .codex/hooks/ for the standing orders. Until tonight those carriers were made
# by a blind find/replace of the word "claude" -> "Codex". Measured damage:
#   * AGENTS.md pointed the refuter at `.Codex/hooks/` and `.Codex/skills/`.
#     The filesystem is case-sensitive; `.Codex` does not exist. It could not
#     open the doors it was told to open.
#   * 5 of the 9 doors had drifted the same way, and in dxb-verify the sentence
#     that explains WHY the audit is cross-model ("a Claude auditing a Claude
#     shares its blind spots") had been rewritten into "a Codex auditing a
#     Codex", destroying its own reason.
# The repair is not to patch the copies: it is to stop hand-making them. One
# rule, one owner — .claude/ is the source, this script is the only way the
# mirror is written, and it substitutes PATHS ONLY. Prose is never touched, so
# the word "Claude" survives wherever it means the model rather than a folder.
#
# Usage:
#   sync-codex-mirror.sh            regenerate the mirror
#   sync-codex-mirror.sh --check    exit 1 if the mirror is stale (battery gate)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

MODE="${1:-write}"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

# The ONLY substitutions. Repo paths, nothing else, longest first.
# A hook path moves only where the mirror really holds the file: the hooks folder itself and its
# *.sh (step 3 copies nothing else). Any other hook path -- a .py hook in the repo, a home path
# such as ~/.claude/hooks/dxb-cost-gate.py -- stays as written, because the mirror has no copy of
# it (Sol's single pass, 2026-10-04: the mirror named .codex/hooks/dxb-design-max.py, which does not
# exist).
rewrite() {
  sed -e 's|\.claude/CLAUDE\.md|AGENTS.md|g' \
      -e 's|\.claude/skills/|.agents/skills/|g' \
      -e 's|\.claude/hooks/\([A-Za-z0-9._-]*\.sh\)\([^A-Za-z0-9._-]\)|.codex/hooks/\1\2|g' \
      -e 's|\.claude/hooks/\([A-Za-z0-9._-]*\.sh\)$|.codex/hooks/\1|' \
      -e 's|\.claude/hooks/\([^A-Za-z0-9._-]\)|.codex/hooks/\1|g' \
      -e 's|\.claude/hooks/$|.codex/hooks/|'
}

BANNER='<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Source: .claude/CLAUDE.md · Generator: scripts/governance/sync-codex-mirror.sh
     Edit the source and re-run the generator; a hand edit here is overwritten
     and, worse, silently splits one rule into two owners. -->'

# 1. The always-on core -> AGENTS.md
{ printf '%s\n' "$BANNER"; rewrite < .claude/CLAUDE.md; } > "$STAGE/AGENTS.md"

# 2. The doors -> .agents/skills/
mkdir -p "$STAGE/skills"
for dir in .claude/skills/*/; do
  name="$(basename "$dir")"
  mkdir -p "$STAGE/skills/$name"
  find "$dir" -type f -print0 | while IFS= read -r -d '' f; do
    rel="${f#"$dir"}"
    mkdir -p "$STAGE/skills/$name/$(dirname "$rel")"
    case "$f" in
      *.md) rewrite < "$f" > "$STAGE/skills/$name/$rel" ;;
      *)    cp "$f" "$STAGE/skills/$name/$rel" ;;
    esac
  done
done

# 3. The standing orders -> .codex/hooks/
mkdir -p "$STAGE/hooks"
for f in .claude/hooks/*.sh; do
  rewrite < "$f" > "$STAGE/hooks/$(basename "$f")"
  chmod +x "$STAGE/hooks/$(basename "$f")"
done

# The mirror may never contain the broken capital-C path that caused this.
if grep -rqn '\.Codex' "$STAGE"; then
  echo "SYNC_FAIL: generated output still contains '.Codex'" >&2
  grep -rn '\.Codex' "$STAGE" >&2
  exit 1
fi

if [ "$MODE" = "--check" ]; then
  # Compiled Python is not part of a door. Running a door's scripts leaves
  # __pycache__/*.pyc on whichever side ran them, so the check ignores both, on
  # both sides; otherwise a fresh .pyc reads as a stale mirror (board row B63).
  mirror_diff() { diff -rq --exclude=__pycache__ --exclude='*.pyc' "$1" "$2"; }
  stale=0
  mirror_diff "$STAGE/AGENTS.md" AGENTS.md >/dev/null 2>&1 || stale=1
  mirror_diff "$STAGE/skills" .agents/skills >/dev/null 2>&1 || stale=1
  mirror_diff "$STAGE/hooks" .codex/hooks   >/dev/null 2>&1 || stale=1
  if [ "$stale" -ne 0 ]; then
    echo "SYNC_STALE: the Codex mirror does not match .claude/ — run scripts/governance/sync-codex-mirror.sh" >&2
    # Every differing path, uncut: a `head -10` here once pushed split.py out of
    # the listing behind .pyc lines (B63), and a stale file nobody is shown stays.
    mirror_diff "$STAGE/AGENTS.md" AGENTS.md >&2 || true
    mirror_diff "$STAGE/skills" .agents/skills >&2 || true
    mirror_diff "$STAGE/hooks" .codex/hooks >&2 || true
    exit 1
  fi
  echo "SYNC_OK mirror matches source"
  exit 0
fi

cp "$STAGE/AGENTS.md" AGENTS.md
rm -rf .agents/skills && mkdir -p .agents && cp -r "$STAGE/skills" .agents/skills
mkdir -p .codex/hooks && cp "$STAGE"/hooks/*.sh .codex/hooks/

echo "SYNC_OK AGENTS.md + $(find .agents/skills -name SKILL.md | wc -l) doors + $(ls -1 .codex/hooks/*.sh | wc -l) hooks regenerated from .claude/"
