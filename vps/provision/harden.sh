#!/usr/bin/env bash
# DXB VPS hardening re-assert + evidence printer (07-04 Task 3). cloud-init
# applies the same state at first boot; this script is the idempotent second
# pass run over ssh, and its output IS the ✓ VERIFIED evidence for SUMMARY
# (sshd key-only, ufw default-deny, fail2ban sshd jail). No secrets read,
# no secrets printed.
set -euo pipefail

echo "== sshd hardening =="
sudo tee /etc/ssh/sshd_config.d/99-dxb-harden.conf >/dev/null <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
X11Forwarding no
MaxAuthTries 3
EOF
sudo systemctl reload ssh 2>/dev/null || sudo systemctl reload sshd
sudo sshd -T | grep -Ei '^(passwordauthentication|permitrootlogin|kbdinteractiveauthentication)'

echo "== ufw =="
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose

echo "== fail2ban =="
sudo tee /etc/fail2ban/jail.d/dxb-sshd.local >/dev/null <<'EOF'
[sshd]
enabled = true
maxretry = 4
bantime = 1h
findtime = 10m
EOF
sudo systemctl enable --now fail2ban
sudo systemctl restart fail2ban
sleep 2
sudo fail2ban-client status sshd

echo "== unattended-upgrades =="
systemctl is-enabled unattended-upgrades || sudo systemctl enable --now unattended-upgrades

echo "HARDEN_OK"
