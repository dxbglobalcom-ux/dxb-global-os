#!/usr/bin/env bash
# E13.0 off-site leg — install the laptop's PUBLIC key on Storage Box
# subaccount u629578-sub1, using the VPS's existing key as the hop
# (no password anywhere). CEO-run: authorized_keys mutation is a
# credential step (recorded boundary). Idempotent — safe to re-run.
#
# Appends the key in BOTH formats: OpenSSH one-liner (port-23 SSH) and
# RFC4716 (port-22 ProFTPD SFTP silently rejects one-liners — vps/README:37).
set -euo pipefail

PUB="$HOME/.ssh/storagebox_laptop_ed25519.pub"
VPS="dxb@46.225.89.249"
VPSKEY="$HOME/.ssh/dxb_vps_ed25519"
BOX="u629578-sub1.your-storagebox.de"
MARK="dxb-laptop-x230-2026-07-18"

test -f "$PUB" || { echo "FAIL: $PUB missing"; exit 1; }
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
cp "$PUB" "$TMP/laptop.pub"
ssh-keygen -e -f "$TMP/laptop.pub" > "$TMP/laptop.rfc4716"
cat "$TMP/laptop.pub" "$TMP/laptop.rfc4716" > "$TMP/append.txt"

scp -q -i "$VPSKEY" "$TMP/append.txt" "$VPS:/tmp/laptop-append.txt"
ssh -i "$VPSKEY" -o BatchMode=yes "$VPS" '
set -e
printf "get .ssh/authorized_keys /tmp/ak.cur\n" | sftp -q -P 23 '"$BOX"' >/dev/null
if grep -q "'"$MARK"'" /tmp/ak.cur; then
  echo "ALREADY-INSTALLED (marker found, nothing changed)"
else
  cp /tmp/ak.cur /tmp/ak.bak.$(date +%s)
  cat /tmp/laptop-append.txt >> /tmp/ak.cur
  printf "put /tmp/ak.cur .ssh/authorized_keys\n" | sftp -q -P 23 '"$BOX"' >/dev/null
  echo "INSTALLED (backup of prior file left in VPS /tmp)"
fi
rm -f /tmp/laptop-append.txt /tmp/ak.cur'

echo "--- verifying laptop -> Storage Box auth (sftp, port 23) ---"
if printf "pwd\n" | sftp -q -i "$HOME/.ssh/storagebox_laptop_ed25519" -P 23 \
    -o BatchMode=yes -o StrictHostKeyChecking=accept-new "u629578-sub1@$BOX" >/dev/null 2>&1; then
  echo "LAPTOP-BOX-AUTH OK"
else
  echo "LAPTOP-BOX-AUTH FAIL (key uploaded but auth still refused — investigate)"
  exit 1
fi
