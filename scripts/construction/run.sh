#!/usr/bin/env bash
# B36 · Block 3-bis — THE DOOR THE CONSTRUCTION SITE RUNS THROUGH.
#
# Everything the construction does — the battery, the drills, the seeds, the
# night shift — runs inside this sandbox. Inside it there is:
#
#   · no Docker socket, so the holding's container cannot be entered;
#   · no credential file — a fresh empty HOME, and var/b36 replaced by an empty
#     directory, so nothing of the company's is on disk to read;
#   · NO NETWORK AT ALL. The sandbox gets its own empty network namespace. It is
#     not a filter with a hole for the company; the company simply has no route.
#     The only TCP ports that exist inside are the ones named in ALLOW below,
#     each carried in over a unix socket by a bridge started here. Default deny.
#   · exactly one way to see the holding: the read gateway's unix socket, which
#     answers named questions and no SQL (scripts/b36/company-read-gateway.mjs).
#
# The company's engine (54322) and the company's HTTP gateway (54321) are NOT in
# ALLOW, and there is no route to them from inside.
#
# Usage:  scripts/construction/run.sh <command …>
#         scripts/construction/run.sh pnpm test
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# ---------------------------------------------------------------- the allow list
# The construction's OWN stack and the local tools it drives. Nothing here
# belongs to the holding. Adding a port is a deliberate edit to this file.
ALLOW=(
  54422   # the construction site's own PostgreSQL (DxB_Build)
  54421   # the construction site's own Supabase gateway (DxB_Build kong)
  3000    # the dashboard under test, started by the construction itself
  3100    # the dashboard's alternate port, used when 3000 is taken
  8025    # mailpit's web interface
  1025    # mailpit's SMTP door
  8969    # the local speech model
  5055    # the local open-notebook service the phase-6 suites drive
)

GATEWAY_SOCK="${XDG_RUNTIME_DIR:-/tmp}/dxb/company-read.sock"
BRIDGE="$(mktemp -d "${XDG_RUNTIME_DIR:-/tmp}/dxb-bridge.XXXXXX")"
PIDS=()
cleanup() { for p in "${PIDS[@]:-}"; do kill "$p" 2>/dev/null || true; done; rm -rf "$BRIDGE"; }
trap cleanup EXIT

# --------------------------------------------- carry the allowed ports inward
# Outside: a unix socket per allowed port, forwarding to the real one.
for p in "${ALLOW[@]}"; do
  socat "UNIX-LISTEN:$BRIDGE/$p.sock,fork,mode=600" "TCP:127.0.0.1:$p" >/dev/null 2>&1 &
  PIDS+=($!)
done

# Inside: the mirror image — a listener on the same port number, connected to
# that socket. Written here so the sandbox's first act is visible in this file.
# The sandbox has no DNS — that is the point. The names it legitimately needs
# are written here, including the trailing-dot spelling the hook drill fires.
cat > "$BRIDGE/hosts" <<'HOSTSEOF'
127.0.0.1   localhost localhost. localhost.localdomain
127.0.0.2   localhost2
::1         localhost ip6-localhost ip6-loopback
HOSTSEOF

INNER="$BRIDGE/inner.sh"
cat > "$INNER" <<INNEREOF
#!/bin/bash
for p in ${ALLOW[*]}; do
  socat "TCP-LISTEN:\$p,fork,reuseaddr" "UNIX-CONNECT:/run/dxb-bridge/\$p.sock" >/dev/null 2>&1 &
done
# Give the listeners a moment to bind before the command starts asking for them.
for _ in \$(seq 1 50); do
  ss -ltn 2>/dev/null | grep -q ":${ALLOW[0]} " && break
  sleep 0.1
done
exec "\$@"
INNEREOF
chmod +x "$INNER"

GATEWAY_ARGS=()
if [ -S "$GATEWAY_SOCK" ]; then
  GATEWAY_ARGS=(--bind "$GATEWAY_SOCK" /run/dxb/company-read.sock)
fi

status=0
bwrap \
  --ro-bind /usr /usr \
  --ro-bind /etc /etc \
  --symlink usr/bin /bin --symlink usr/sbin /sbin \
  --symlink usr/lib /lib --symlink usr/lib64 /lib64 \
  --proc /proc --dev /dev \
  --tmpfs /tmp --tmpfs /var --tmpfs /home --tmpfs /root \
  --tmpfs /run \
  --bind "$REPO" "$REPO" \
  --tmpfs "$REPO/var/b36" \
  --ro-bind "$BRIDGE" /run/dxb-bridge \
  --ro-bind "$BRIDGE/hosts" /etc/hosts \
  "${GATEWAY_ARGS[@]}" \
  --ro-bind-try "$HOME/.local/share/pnpm" /tmp/home/.local/share/pnpm \
  --ro-bind-try "$HOME/.cache/node/corepack" /tmp/home/.cache/node/corepack \
  --setenv HOME /tmp/home \
  --setenv XDG_RUNTIME_DIR /run \
  --setenv DXB_COMPANY_READ_SOCKET /run/dxb/company-read.sock \
  --setenv DXB_CONSTRUCTION_SANDBOX 1 \
  --chdir "$REPO" \
  --unshare-net --unshare-pid --unshare-ipc --unshare-uts \
  --new-session --die-with-parent \
  -- /run/dxb-bridge/inner.sh "$@" || status=$?

cleanup
trap - EXIT
exit "$status"
