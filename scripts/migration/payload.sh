#!/usr/bin/env bash
# What travels from the X230 to the workstation, and what deliberately does not.
#
# CEO order 2026-08-16/17: a clean move, not a clone. The old laptop keeps
# everything — nothing is deleted there — so this list is about what the NEW
# machine needs to be the holding's control terminal, and nothing else. The
# 4.2 GB of plugin caches, the 12.4 GB of Docker images and the 1.1 GB of
# node_modules are all re-downloadable and are named here as REFUSED so that
# a future session does not "helpfully" drag them along.
#
# Usage:
#   payload.sh            list the payload with sizes
#   payload.sh --manifest write checksums for every file that travels
#   payload.sh --verify   compare this machine's checksums against a manifest
#
# The manifest is the proof at the end of the move: same list, same checksums,
# both sides, or the move is not finished.
set -euo pipefail

# Derived, never hardcoded: the same script must run on both machines, whose
# homes differ (/home/ghost on the X230, /home/dxb on the workstation). A
# hardcoded path made the manifest unprovable on the receiving side.
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLAUDE_DIR="$HOME/.claude"
PROJECT_KEY="-home-ghost-DxB-Global-OS"
OUT="${MIGRATION_OUT:-$HOME/dxb-migration}"

# --- what travels -----------------------------------------------------------
# Each entry: <label>|<absolute source path>|<rsync exclude args>
REPO_EXCLUDES="--exclude=node_modules --exclude=.next --exclude=dist --exclude=.pnpm-store --exclude=*.tsbuildinfo"

payload_rows() {
  cat <<ROWS
the repository (code, specs, the board, the rival evidence)|$REPO|$REPO_EXCLUDES
what Claude remembers about this holding|$CLAUDE_DIR/projects/$PROJECT_KEY/memory|
the always-on global file|$CLAUDE_DIR/CLAUDE.md|
the global skills (graphify, scrapling)|$CLAUDE_DIR/skills|
the memory plugin's store (claude-mem)|$HOME/.claude-mem|
the refuter's configuration (Codex)|$HOME/.codex/config.toml|
the refuter's instructions|$HOME/.codex/AGENTS.md|
the refuter's read-only profiles|$HOME/.codex/refuter.config.toml|
the refuter's second profile|$HOME/.codex/refuter55.config.toml|
the database, as a portable dump|$HOME/backups/dxb|
the ssh keys (VPS, storage box, migration)|$HOME/.ssh|
ROWS
}

# --- what is deliberately LEFT BEHIND ---------------------------------------
refused_rows() {
  cat <<ROWS
node_modules — restored by \`pnpm install\` from the lockfile|$REPO/node_modules
plugin caches and marketplaces — re-downloaded on first use|$CLAUDE_DIR/plugins
disabled skills — the CEO turned these off on 2026-08-09|$CLAUDE_DIR/skills-disabled
session transcripts — history, not state; stays on the X230|$CLAUDE_DIR/projects/$PROJECT_KEY
Docker images — 12.4 GB, pulled again from their registries|(docker)
the speaches voice model cache — re-downloaded on demand|(docker volume speaches-hf-cache)
the raw Postgres volume — replaced by the dump, which is version-safe|(docker volume supabase_db_DxB_Global_OS)
ROWS
}

human() { numfmt --to=iec --suffix=B "$1" 2>/dev/null || echo "$1"; }

case "${1:-list}" in
  list)
    total=0
    printf '%-58s %10s  %s\n' "WHAT TRAVELS" "SIZE" "PATH"
    printf '%s\n' "$(printf '%.0s-' {1..110})"
    while IFS='|' read -r label path _; do
      [ -n "$label" ] || continue
      if [ -e "$path" ]; then
        b=$(du -sb --exclude=node_modules --exclude=.next --exclude=dist --exclude=.pnpm-store "$path" 2>/dev/null | cut -f1)
        total=$((total + b))
        printf '%-58s %10s  %s\n' "$label" "$(human "$b")" "$path"
      else
        printf '%-58s %10s  %s\n' "$label" "MISSING" "$path"
      fi
    done < <(payload_rows)
    printf '%s\n' "$(printf '%.0s-' {1..110})"
    printf '%-58s %10s\n' "TOTAL THAT TRAVELS" "$(human "$total")"
    echo
    printf '%-58s %s\n' "LEFT BEHIND ON PURPOSE" "WHY"
    printf '%s\n' "$(printf '%.0s-' {1..110})"
    while IFS='|' read -r why path; do
      [ -n "$why" ] || continue
      printf '  %s\n' "$why"
    done < <(refused_rows)
    echo
    echo "SECRETS ARE NOT IN THIS LIST. The four .env files move by hand, out of"
    echo "band, and are never written to a manifest, a log or this terminal."
    ;;

  --manifest)
    mkdir -p "$OUT"
    m="$OUT/manifest-$(hostname)-$(date +%F).sha256"
    : > "$m"
    while IFS='|' read -r label path _; do
      [ -n "$label" ] && [ -e "$path" ] || continue
      if [ -d "$path" ]; then
        # These exclusions MUST mirror the rsync rules in push.sh exactly. When
        # they drifted, the manifest listed 18 build artefacts and one lock file
        # that were never meant to travel, and the proof read as a loss.
        find "$path" -type f \
          -not -path "*/node_modules/*" -not -path "*/.next/*" \
          -not -path "*/dist/*" -not -path "*/.pnpm-store/*" \
          -not -name "*.tsbuildinfo" -not -name "*.lock" \
          -not -name "authorized_keys" \
          -not -name "*.env" -not -name ".env*" -not -name "secrets.local" \
          -print0 | sort -z | xargs -0 -r sha256sum >> "$m"
      else
        sha256sum "$path" >> "$m"
      fi
    done < <(payload_rows)
    echo "MANIFEST_OK $m"
    echo "  files: $(wc -l < "$m")"
    ;;

  --verify)
    m="${2:-}"
    [ -f "$m" ] || { echo "give the manifest to verify against" >&2; exit 1; }
    if sha256sum -c "$m" --quiet; then
      echo "VERIFY_OK every file matches the manifest"
    else
      echo "VERIFY_FAIL the move is not finished" >&2
      exit 1
    fi
    ;;
esac
