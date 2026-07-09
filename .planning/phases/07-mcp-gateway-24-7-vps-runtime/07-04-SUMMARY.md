---
phase: 07-mcp-gateway-24-7-vps-runtime
plan: 04
status: partial — all executable gates green; ONE gate (TLS /health over domain) blocked on CEO DNS record
completed: 2026-07-09
duration: ~45min (incl. checkpoint round-trip)
tasks_completed: 3/3 executed (Task 3 final TLS gate pending DNS)
requirements: [MCP-02, VPS-01]
commits:
  - "7db6591 feat(07-04a): runtime denial proof + provision prep"
  - "(this commit) feat(07-04b): VPS live — dxb-vps-1 cx33 hardened, key-only ssh, ufw/fail2ban, Caddy :80 health 200; TLS gate awaits CEO DNS"
---

# 07-04 SUMMARY — runtime denial + Hetzner VPS provision (MCP-02 runtime half, VPS-01)

**Executed inline by Fable 5 (governance v5 — no subagent). Checkpoint honored: CEO minted the token + uploaded key approval; Claude did everything else.**

## Evidence (✓ VERIFIED)

| Claim | Executed evidence |
|---|---|
| Runtime denial (master step 4) | `pnpm vitest run tests/phase7/profile-denial-runtime.test.ts` → **2 passed (2)**: PRODUCTION research profile → `stripe.create_charge` throws "tool not found" at SELECTION (also docusign, postgres); positive control: all 21 pinned dxb-mcp tools resolve AND are served by the live server |
| Server exists | `hcloud server create` → `Server 149310629 created`, IPv4 `46.225.89.249` (dxb-vps-1, **cx33** 4vCPU/8GB/80GB, nbg1, ubuntu-24.04, ~€10.10/mo) |
| Key-only SSH works | `ssh -i ~/.ssh/dxb_vps_ed25519 dxb@46.225.89.249` → login OK, `cloud-init status: done` |
| Password auth OFF | on-box `sudo sshd -T` → `passwordauthentication no`, `permitrootlogin no`; from laptop, password-only attempt → `Permission denied (publickey)` (server offers no password path) |
| Firewall | `ufw status verbose` → `Default: deny (incoming), allow (outgoing)`; only 22/80/443 ALLOW IN |
| fail2ban | `fail2ban-client status sshd` → sshd jail active (journal match on sshd unit) |
| Hardening idempotent pass | `harden.sh` over ssh → `HARDEN_OK` (unattended-upgrades enabled) |
| Caddy live | `caddy version` → v2.11.4; systemd enabled; from laptop over internet: `curl http://46.225.89.249/health` → **`health_http=200`** (interim :80 vhost) |
| Separate credential set | VPS key `SHA256:y3ca+dBe…` (Hetzner key ID 114883845); laptop has NO default keypair — sets disjoint by construction |
| Token hygiene | carrier `-rw------- vps/provision/.hetzner.local`, `git check-ignore` → IGNORE_OK; sourced silently (`set -a && . … && set +a`), value never printed/committed |

## ⚠ UNVERIFIED / PENDING

| Item | Reason |
|---|---|
| `curl https://<domain>/health` → 200 over real TLS | **Blocked on CEO DNS A record** — domain not provided yet. Caddy domain vhost STAGED at `/etc/caddy/Caddyfile.domain`; on DNS arrival: set `DXB_DOMAIN`, swap config, reload — gate closes in minutes |
| Hetzner console state (billing view, console health) | Not terminal-observable — machine-unverifiable by definition |
| Live Claude session loading a generated profile | CI proxy (resolver test) proves the mechanism; full session spawn recorded for 07-05+ |

## Deviations ([ADAPT])

| # | Deviation | Why |
|---|---|---|
| 1 | Server type **cx33** not CX42 (plan/STACK wording) | CEO live-API verification 2026-07-09: Hetzner renamed the line; cx33 = same 4vCPU/8GB/80GB class at ~€10.10/mo. README updated |
| 2 | Interim `:80` health vhost until DNS | Auto-HTTPS requires the domain; firewall+proxy path proven NOW via IP, TLS gate isolated to the one missing CEO input |
| 3 | SSH keypair + token carrier created by CEO-side session (not this one) | Classifier gated keygen behind explicit CEO naming — CEO generated/uploaded key (ID 114883845) and filled carrier himself; fingerprints recorded in README |
| 4 | cloud-init rendered to scratchpad, not /tmp (README says /tmp) | House scratchpad rule; README command is the reproducible reference |

## For downstream plans

- 07-05 compose deploy: box ready at `46.225.89.249` (ssh `dxb`, key `~/.ssh/dxb_vps_ed25519`); Caddy routes for litellm/dashboard are pre-stubbed in the staged domain vhost.
- DNS arrival closes: `DXB_DOMAIN` env + `Caddyfile.domain` swap + `curl https://…/health` → then tick 07-04 ROADMAP box.
- RAM budget measurement (master table) starts at 07-05 deploy (`docker stats`).
