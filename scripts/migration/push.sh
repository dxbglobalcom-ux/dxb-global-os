#!/usr/bin/env bash
# Move the holding's control terminal from the X230 to the workstation.
#
# CEO order 2026-08-16/17. The laptop PUSHES; the workstation receives. That
# direction was chosen on a measurement: the laptop has no SSH server running
# (`port 22 not listening`), and opening one on a machine that is about to be
# retired is the wrong place to spend a root password. The workstation needs
# one anyway.
#
# Nothing is deleted anywhere. The X230 keeps every byte — the CEO's ruling of
# 2026-08-17, "herşey x230 da kalabilir" — so this is a copy with proof, not a
# cutover. If the move fails halfway, the old machine is still the live one.
#
# Usage:
#   push.sh --target ghost@192.168.178.NN            everything except secrets
#   push.sh --target ghost@192.168.178.NN --secrets  the four .env files, alone
#   push.sh --target ghost@192.168.178.NN --verify   compare both sides
#
# Order of the day:
#   1. push.sh --target …            (the bulk, resumable, ~3 GB)
#   2. push.sh --target … --secrets  (by hand, out of band, no log)
#   3. push.sh --target … --verify   (checksums both sides — the proof)
set -euo pipefail

REPO="/home/ghost/DxB Global OS"
KEY="$HOME/.ssh/dxb_migration_ed25519"
PROJECT_KEY="-home-ghost-DxB-Global-OS"
TARGET=""
MODE="bulk"

while [ $# -gt 0 ]; do
  case "$1" in
    --target)  TARGET="$2"; shift 2 ;;
    --secrets) MODE="secrets"; shift ;;
    --verify)  MODE="verify"; shift ;;
    *) echo "unknown argument: $1" >&2; exit 1 ;;
  esac
done

[ -n "$TARGET" ] || { echo "PUSH_FAIL: --target user@ip is required" >&2; exit 1; }
[ -f "$KEY" ] || { echo "PUSH_FAIL: migration key $KEY is missing" >&2; exit 1; }

SSH="ssh -i $KEY -o BatchMode=yes -o ConnectTimeout=10"
RSYNC_OPTS=(-a --partial --info=progress2 --human-readable -e "ssh -i $KEY -o BatchMode=yes")

reachable() {
  $SSH "$TARGET" 'echo REMOTE_OK' 2>/dev/null | grep -q REMOTE_OK
}

if ! reachable; then
  cat >&2 <<EOF
PUSH_FAIL: cannot reach $TARGET with the migration key.

Run this once on the WORKSTATION, then try again:
  sudo apt install -y openssh-server rsync
  mkdir -p ~/.ssh && chmod 700 ~/.ssh
  echo '$(cat "$KEY.pub")' >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
EOF
  exit 1
fi

REMOTE_HOME="$($SSH "$TARGET" 'echo $HOME')"
echo "target: $TARGET   home: $REMOTE_HOME"

# --------------------------------------------------------------------------
if [ "$MODE" = "secrets" ]; then
  # The four .env files. No names, no contents, no counts of what is inside
  # them reach this terminal or any log — only how many files landed.
  # Five files, not four. vps/open-notebook/secrets.local carries credentials
  # too and is git-ignored by an explicit rule (.gitignore:45) — it was missing
  # from this list on the first run and travelled with the bulk instead. It
  # arrived mode 600 and nothing leaked, but a secret must move by the path that
  # promises no log, not by luck.
  n=0
  for f in "$REPO/.env" "$REPO/.env.daemon" "$REPO/apps/dashboard/.env.local" \
           "$REPO/vps/litellm/.env" "$REPO/vps/open-notebook/secrets.local"; do
    [ -f "$f" ] || continue
    rel="${f#"$REPO"/}"
    $SSH "$TARGET" "mkdir -p '$REMOTE_HOME/DxB Global OS/$(dirname "$rel")'" >/dev/null 2>&1
    rsync -q --chmod=F600 -e "ssh -i $KEY -o BatchMode=yes" "$f" "$TARGET:$REMOTE_HOME/DxB Global OS/$rel" >/dev/null 2>&1 && n=$((n+1))
  done
  echo "SECRETS_OK $n file(s) placed, mode 600, nothing written to any log"
  exit 0
fi

# --------------------------------------------------------------------------
if [ "$MODE" = "verify" ]; then
  echo "=== local manifest ==="
  bash "$REPO/scripts/migration/payload.sh" --manifest
  local_m="$(ls -t "$HOME/dxb-migration"/manifest-*.sha256 | head -1)"
  echo "=== remote check against the same list ==="
  # The remote re-hashes ITS copy and we compare the two digests of the lists.
  $SSH "$TARGET" "cd '$REMOTE_HOME' && bash 'DxB Global OS/scripts/migration/payload.sh' --manifest" || true
  echo
  echo "local  list digest: $(sed "s|$HOME|~|g" "$local_m" | awk '{print $1}' | sort | sha256sum | cut -d' ' -f1)"
  echo "remote list digest: $($SSH "$TARGET" "sed \"s|\$HOME|~|g\" \$(ls -t \$HOME/dxb-migration/manifest-*.sha256 | head -1) | awk '{print \$1}' | sort | sha256sum | cut -d' ' -f1")"
  echo
  echo "The two digests must be identical. They cover every file that travelled;"
  echo "secrets are excluded from both by construction."
  exit 0
fi

# --------------------------------------------------------------------------
# Bulk move. A fresh dump first, so the newest company data travels.
echo "=== 1/3  fresh database dump ==="
bash "$REPO/scripts/backup/laptop-pg-dump.sh" 2>&1 | grep -E "BACKUP_OK|OFFSITE" || true

echo "=== 2/3  the repository ==="
$SSH "$TARGET" "mkdir -p '$REMOTE_HOME/DxB Global OS'"
rsync "${RSYNC_OPTS[@]}" \
  --exclude=node_modules --exclude=.next --exclude=dist \
  --exclude=.pnpm-store --exclude='*.tsbuildinfo' \
  --include='.env.example' --exclude='.env' --exclude='.env.*' \
  --exclude='secrets.local' \
  "$REPO/" "$TARGET:$REMOTE_HOME/DxB Global OS/"

echo "=== 3/3  memory, refuter, keys, dumps ==="
$SSH "$TARGET" "mkdir -p '$REMOTE_HOME/.claude/projects/$PROJECT_KEY' '$REMOTE_HOME/.codex' '$REMOTE_HOME/backups' '$REMOTE_HOME/.ssh' && chmod 700 '$REMOTE_HOME/.ssh'"
rsync "${RSYNC_OPTS[@]}" "$HOME/.claude/projects/$PROJECT_KEY/memory" "$TARGET:$REMOTE_HOME/.claude/projects/$PROJECT_KEY/"
rsync "${RSYNC_OPTS[@]}" "$HOME/.claude/CLAUDE.md"                    "$TARGET:$REMOTE_HOME/.claude/"
rsync "${RSYNC_OPTS[@]}" "$HOME/.claude/skills"                       "$TARGET:$REMOTE_HOME/.claude/"
rsync "${RSYNC_OPTS[@]}" "$HOME/.claude-mem"                          "$TARGET:$REMOTE_HOME/"
rsync "${RSYNC_OPTS[@]}" "$HOME/.codex/config.toml" "$HOME/.codex/AGENTS.md" \
      "$HOME/.codex/refuter.config.toml" "$HOME/.codex/refuter55.config.toml" \
      "$TARGET:$REMOTE_HOME/.codex/"
rsync "${RSYNC_OPTS[@]}" "$HOME/backups/dxb"                          "$TARGET:$REMOTE_HOME/backups/"
rsync "${RSYNC_OPTS[@]}" --chmod=F600 "$HOME/.ssh/"                   "$TARGET:$REMOTE_HOME/.ssh/"

cat <<EOF

PUSH_OK the bulk has landed. Two steps remain:
  push.sh --target $TARGET --secrets   the four .env files
  push.sh --target $TARGET --verify    checksums both sides

Nothing was deleted on this machine. The X230 is still the live one until the
workstation passes its acceptance battery.
EOF
