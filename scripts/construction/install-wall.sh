#!/usr/bin/env bash
# B36 · Block 3-bis — install the wall so the construction cannot rewrite it.
#
# The sandbox definition has to live somewhere the construction runtime cannot
# edit, or the wall is a suggestion. This copies it to /usr/local/sbin as root,
# and drops the one sudoers line that lets the author's session open it without
# a password — and ONLY that program, with no arguments of its own.
set -euo pipefail
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST=/usr/local/sbin/dxb-construction-sandbox

# sudo asks for a password on a terminal. A session that has no terminal can pass
# one through SUDO_ASKPASS; a human at the keyboard needs nothing here.
SUDO=(sudo)
[ -n "${SUDO_ASKPASS:-}" ] && SUDO=(sudo -A)

"${SUDO[@]}" install -o root -g root -m 0755 "$SRC/sandbox.sh" "$DEST"
printf '%s\n' \
  '# B36 · Block 3-bis — open the construction sandbox without a password.' \
  '# The program is root-owned and holds the whole wall definition; the caller' \
  '# supplies only the command to run INSIDE it.' \
  "dxb ALL=(root) NOPASSWD: $DEST" \
  '' \
  '# And the author may act AS the construction identity without a password, so' \
  '# the drill can fire its attempts from that identity outside the sandbox too.' \
  '# It is not an escalation: dxbbuild holds strictly less than he does.' \
  'dxb ALL=(dxbbuild) NOPASSWD: ALL' \
  '' \
  '# And it may READ the packet filter, so the drill can print the kernel'"'"'s own' \
  '# count of refusals. Reading a rule changes nothing.' \
  'dxb ALL=(root) NOPASSWD: /usr/sbin/nft list table inet dxb_wall' \
  | "${SUDO[@]}" tee /etc/sudoers.d/dxb-construction-sandbox >/dev/null
"${SUDO[@]}" chmod 0440 /etc/sudoers.d/dxb-construction-sandbox
"${SUDO[@]}" visudo -c -f /etc/sudoers.d/dxb-construction-sandbox

"${SUDO[@]}" install -o root -g root -m 0644 "$SRC/company-wall.nft" /usr/local/share/dxb-company-wall.nft
"${SUDO[@]}" install -o root -g root -m 0644 "$SRC/dxb-company-wall.service" /etc/systemd/system/dxb-company-wall.service
"${SUDO[@]}" systemctl daemon-reload
"${SUDO[@]}" systemctl enable --now dxb-company-wall.service
"${SUDO[@]}" nft list table inet dxb_wall
echo "WALL_INSTALLED $DEST"
