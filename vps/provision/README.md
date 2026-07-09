# VPS Provisioning (07-04 — master PHASE-07 step 5)

CEO checkpoint doc. **Names and scopes only — no secret value ever appears in this
directory's tracked files** (gitleaks pre-commit enforces; T-07-11/14).

## Split of duties (CEO delegation rule)

| Who | Does |
|---|---|
| **CEO (identity/credential only)** | 1. Mint the Hetzner API token. 2. Create the DNS A record. Nothing else. |
| **Claude** | Everything else: keygen, `hcloud server create`, hardening, Caddy, verification. |

## CEO step 1 — Hetzner API token

- Console: Hetzner Cloud → **create a NEW project `dxb-global-os`** (do not reuse an
  existing project — blast radius) → Security → API tokens → **Generate API token**.
- Scope: **Read & Write**, project-level. Hetzner tokens are always project-scoped —
  creating the dedicated project IS the scoping step (T-07-11: a leak can only touch
  this project's infra).
- Paste the token as the ONLY line into the untracked carrier:

  ```
  vps/provision/.hetzner.local        # gitignored; format: HCLOUD_TOKEN=<value>
  ```

  Claude consumes it silently (`set -a && . vps/provision/.hetzner.local && set +a`)
  so it never prints and never enters the repo or a prompt.

## CEO step 2 — DNS A record

After the server exists, Claude reports its IPv4. CEO creates:

```
A  <host>.<ceo-domain>  →  <server-IPv4>   (TTL 300 while testing)
```

The chosen FQDN goes into the environment as `DXB_DOMAIN` (name only, tracked
nowhere as a secret; Caddyfile reads `{$DXB_DOMAIN}`).

## Claude step — VPS-only SSH keypair (LOCKED: separate credential set)

Generated at checkpoint approval, distinct from any laptop key (T-07-13):

```
ssh-keygen -t ed25519 -f ~/.ssh/dxb_vps_ed25519 -N "" -C "dxb-vps-hetzner-2026-07"
```

- Public half → Hetzner (`hcloud ssh-key create`) + cloud-init `@@VPS_SSH_PUBKEY@@`.
- Private half → `~/.ssh/` only (0600), never committed, never uploaded anywhere else.
- Fingerprint recorded here after generation: `SHA256:<pending — filled at keygen>`

## Server spec (CEO approves at checkpoint)

| Choice | Value | Why |
|---|---|---|
| Type | **CX42** (4 vCPU / 8GB / 80GB, ~€16.4/mo) — alternative CPX31 (AMD, ~€15.6/mo) | STACK.md 8GB RAM budget table |
| Location | **Nuremberg (nbg1)** — alternative Helsinki (hel1) | EU requirement |
| Image | ubuntu-24.04 | LTS, cloud-init native |
| First boot | `cloud-init.yaml` (this dir) | hardened from birth: key-only SSH, ufw, fail2ban |

Create command (Claude runs; token sourced silently):

```
set -a && . vps/provision/.hetzner.local && set +a
hcloud ssh-key create --name dxb-vps --public-key-from-file ~/.ssh/dxb_vps_ed25519.pub
sed "s|@@VPS_SSH_PUBKEY@@|$(cat ~/.ssh/dxb_vps_ed25519.pub)|" vps/provision/cloud-init.yaml > /tmp/dxb-cloud-init.yaml
hcloud server create --name dxb-vps-1 --type cx42 --location nbg1 \
  --image ubuntu-24.04 --ssh-key dxb-vps --user-data-from-file /tmp/dxb-cloud-init.yaml
```

## Verification gates (07-04 acceptance)

| Check | Command (from laptop) | Expected |
|---|---|---|
| Key-only login | `ssh -i ~/.ssh/dxb_vps_ed25519 dxb@<domain> true` | exit 0 |
| Password refused | `ssh -o PubkeyAuthentication=no -o PasswordAuthentication=yes dxb@<domain>` | `Permission denied` (no password prompt loop) |
| sshd state | `sudo sshd -T \| grep -i passwordauth` (on box) | `passwordauthentication no` |
| Firewall | `sudo ufw status verbose` | default deny incoming; 22/80/443 only |
| fail2ban | `sudo fail2ban-client status sshd` | jail active |
| TLS health | `curl -s -o /dev/null -w '%{http_code}' https://<domain>/health` | `200` |

Hetzner-console-only state (billing, console view) = ⚠ UNVERIFIED by machine; all
rows above are terminal-observable ✓ VERIFIED evidence for 07-04-SUMMARY.
