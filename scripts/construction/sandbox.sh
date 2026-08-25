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
# The relay below is one of $PIDS, so it dies with the run like every forwarder.
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

# ------------------------------------------- carry the read gateway inward
# The gateway's socket lives under /run/user/1000, which logind creates 0700 and
# owns as the author. `bwrap` below runs as uid 997 and resolves its OWN bind
# sources, so it cannot even traverse that directory — while the `[ -S ]` test
# here runs as root and sees the socket happily. The first version of this block
# bound the socket directly and therefore ARMED A BIND THAT COULD NOT BE
# RESOLVED: measured 2026-08-25, the entire sandboxed suite died before a single
# test ran with
#   bwrap: Can't find source path /run/user/1000/dxb/company-read.sock: Permission denied
# and `sudo -u dxbbuild ls /run/user/1000/` refuses for the same reason.
#
# Opening /run/user/1000 to uid 997 is NOT the fix: it holds the author's session
# bus and PipeWire sockets at srw-rw-rw-, so a traverse bit there would hand the
# construction identity his desktop. The socket is relayed instead — the same
# shape the allowed TCP ports already use — by a forwarder running AS THE OWNER
# OF THE SOCKET, which is the only identity that has to reach in. It carries
# bytes and nothing else: the gateway still answers 14 named questions and still
# refuses SQL, measured through the relay from uid 997 itself.
GATEWAY_ARGS=()
if [ -S "$GATEWAY_SOCK" ]; then
  GW_UID="$(stat -c %u "$GATEWAY_SOCK")"
  GW_GID="$(stat -c %g "$GATEWAY_SOCK")"
  # THE DIRECTORY IS THE GATE, and it has to stay one. The gateway's own access
  # control was /run/user/1000 at mode 0700 — the author and nobody else. The
  # first version of this relay re-published that socket in a 0755 room with a
  # 0666 socket, so ANY local identity could have asked the holding its named
  # questions through a forwarder running as the author. Measured 2026-08-25 and
  # confirmed by the audit; it is a widening, small in blast radius and real.
  # This room is owned by the forwarder's identity and carries the CONSTRUCTION's
  # group, at 0750: root, the author and uid 997 may enter, and nothing else can
  # even reach the path.
  mkdir -p "$BRIDGE/gw"
  chown "$GW_UID:$BUILD_GID" "$BRIDGE/gw"
  chmod 750 "$BRIDGE/gw"
  setpriv --reuid="$GW_UID" --regid="$GW_GID" --clear-groups \
    socat "UNIX-LISTEN:$BRIDGE/gw/company-read.sock,fork,mode=666" \
          "UNIX-CONNECT:$GATEWAY_SOCK" >/dev/null 2>&1 &
  PIDS+=($!)
  for _ in $(seq 1 50); do
    [ -S "$BRIDGE/gw/company-read.sock" ] && break
    sleep 0.1
  done
  if [ -S "$BRIDGE/gw/company-read.sock" ]; then
    GATEWAY_ARGS=(--bind "$BRIDGE/gw/company-read.sock" /run/dxb/company-read.sock)
  else
    echo "dxb-construction-sandbox: the read gateway relay did not come up; the sandbox opens WITHOUT the window" >&2
  fi
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
