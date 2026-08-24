#!/usr/bin/env bash
# B36 · Block 3-bis — THE WALL ITSELF. THE INSTALLED COPY OF THIS FILE IS OWNED
# BY ROOT AND THE CONSTRUCTION CANNOT REWRITE IT.
#
#   source of truth for review : scripts/construction/sandbox.sh   (this file)
#   what actually runs         : /usr/local/sbin/dxb-construction-sandbox
#   installed by               : scripts/construction/install-wall.sh
#
# It is called through sudo by scripts/construction/run.sh, and it:
#
#   1. runs everything as the operating-system user `dxbbuild` — uid 997, its own
#      group, NOT in `docker`, NOT in `sudo`, shell `nologin`. It cannot even
#      enter /home/dxb from outside this sandbox;
#   2. gives it its OWN EMPTY NETWORK NAMESPACE. There is no route to anything.
#      The only TCP ports that exist inside are the ones in ALLOW below, each
#      carried in over a unix socket by a bridge this file starts. Default deny —
#      the company's 54322 and 54321 are not in the list and there is no way to
#      add one from inside;
#   3. binds no Docker socket, no credential file, no service environment, and
#      gives it an empty HOME, so there is nothing of the company's to read;
#   4. binds the repository read-write (the construction has to build) but
#      .git read-only, and leaves exactly one door open on the holding: the read
#      gateway's unix socket, which answers named questions and no SQL.
#
# Usage:  dxb-construction-sandbox <command …>
set -euo pipefail

REPO="/home/dxb/DxB Global OS"
BUILD_UID=997
BUILD_GID=973
OWNER_HOME="/home/dxb"
GATEWAY_SOCK="/run/user/1000/dxb/company-read.sock"

# ---------------------------------------------------------------- the allow list
# The construction's OWN stack and the local tools it drives. Nothing here
# belongs to the holding. Adding a port is a deliberate edit to a ROOT-OWNED file.
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

if [ "$(id -u)" != "0" ]; then
  echo "dxb-construction-sandbox: must be run through sudo — it drops to uid ${BUILD_UID} itself" >&2
  exit 2
fi

# Two rooms inside the bridge, on purpose. The bridge itself stays ROOT-OWNED so
# the inner script and the hosts file cannot be replaced; `sock/` belongs to the
# construction identity, because the forwarders run as that identity and have to
# be able to create their sockets. Measured 2026-08-24: with one root-owned room
# the forwarders could not bind, every TCP handshake still succeeded inside, and
# PostgreSQL answered "Connection terminated unexpectedly" — a wall that looked
# like a working bridge.
BRIDGE="$(mktemp -d /run/dxb-bridge.XXXXXX)"
chmod 755 "$BRIDGE"
mkdir -p "$BRIDGE/sock"
chown "$BUILD_UID:$BUILD_GID" "$BRIDGE/sock"
chmod 700 "$BRIDGE/sock"
PIDS=()
cleanup() { for p in "${PIDS[@]:-}"; do kill "$p" 2>/dev/null || true; done; rm -rf "$BRIDGE"; }
trap cleanup EXIT

# --------------------------------------------- carry the allowed ports inward
# Outside: one unix socket per allowed port, owned by the build identity so the
# forwarders themselves hold no privilege of ours.
for p in "${ALLOW[@]}"; do
  setpriv --reuid="$BUILD_UID" --regid="$BUILD_GID" --clear-groups \
    socat "UNIX-LISTEN:$BRIDGE/sock/$p.sock,fork,mode=600" "TCP:127.0.0.1:$p" >/dev/null 2>&1 &
  PIDS+=($!)
done

# The sandbox has no DNS — that is the point. The names it legitimately needs are
# written here, including the trailing-dot spelling one of the drills fires.
cat > "$BRIDGE/hosts" <<'HOSTSEOF'
127.0.0.1   localhost localhost. localhost.localdomain
127.0.0.2   localhost2
::1         localhost ip6-localhost ip6-loopback
HOSTSEOF

# Inside: the mirror image. Written by root, bound read-only, so the payload
# cannot change which ports exist.
cat > "$BRIDGE/inner.sh" <<INNEREOF
#!/bin/bash
umask 002
for p in ${ALLOW[*]}; do
  socat "TCP-LISTEN:\$p,fork,reuseaddr" "UNIX-CONNECT:/run/dxb-bridge/sock/\$p.sock" >/dev/null 2>&1 &
done
for _ in \$(seq 1 50); do
  ss -ltn 2>/dev/null | grep -q ":${ALLOW[0]} " && break
  sleep 0.1
done
exec "\$@"
INNEREOF
chmod 755 "$BRIDGE/inner.sh"

GATEWAY_ARGS=()
if [ -S "$GATEWAY_SOCK" ]; then
  GATEWAY_ARGS=(--bind "$GATEWAY_SOCK" /run/dxb/company-read.sock)
fi

# bwrap itself runs AS the construction identity — there is no root anywhere in
# the runtime path once this line is passed. `setpriv --clear-groups` strips even
# the supplementary groups root was carrying, so the payload holds uid 997, gid
# 973 and nothing else.
status=0
setpriv --reuid="$BUILD_UID" --regid="$BUILD_GID" --clear-groups \
bwrap \
  --ro-bind /usr /usr \
  --ro-bind /etc /etc \
  --symlink usr/bin /bin --symlink usr/sbin /sbin \
  --symlink usr/lib /lib --symlink usr/lib64 /lib64 \
  --proc /proc --dev /dev \
  --tmpfs /tmp --tmpfs /var --tmpfs /home --tmpfs /root \
  --tmpfs /run \
  --bind "$REPO" "$REPO" \
  --ro-bind "$REPO/.git" "$REPO/.git" \
  --tmpfs "$REPO/var/b36" \
  --ro-bind "$BRIDGE" /run/dxb-bridge \
  --ro-bind "$BRIDGE/hosts" /etc/hosts \
  "${GATEWAY_ARGS[@]}" \
  --ro-bind-try "$OWNER_HOME/.local/share/pnpm" /tmp/home/.local/share/pnpm \
  --ro-bind-try "$OWNER_HOME/.cache/node/corepack" /tmp/home/.cache/node/corepack \
  --setenv HOME /tmp/home \
  `# git refuses to read a repository owned by somebody else, and inside this` \
  `# sandbox the tree belongs to the author while the payload is the build` \
  `# identity. The exception is handed in through the environment, so it lives` \
  `# for exactly this run and no config file has to exist.` \
  --setenv XDG_RUNTIME_DIR /run \
  --setenv DXB_COMPANY_READ_SOCKET /run/dxb/company-read.sock \
  --setenv DXB_CONSTRUCTION_SANDBOX 1 \
  --setenv GIT_CONFIG_COUNT 1 \
  --setenv GIT_CONFIG_KEY_0 safe.directory \
  --setenv GIT_CONFIG_VALUE_0 "$REPO" \
  --chdir "$REPO" \
  --unshare-net --unshare-pid --unshare-ipc --unshare-uts \
  --new-session --die-with-parent \
  -- /run/dxb-bridge/inner.sh "$@" || status=$?

cleanup
trap - EXIT
exit "$status"
