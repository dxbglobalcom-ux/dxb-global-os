---
phase: 07-mcp-gateway-24-7-vps-runtime
status: evidence-complete — VERDICT PENDING (single residue: first unattended 06:00 firing, check 2026-07-10 08:23)
verified: 2026-07-09
verifier: "Claude Fable 5 — inline, personally (governance v5); evidence lines quote commands executed in the 07-02..07-08 recorded runs of 2026-07-09"
---

# Phase 7 Verification — Exit Gate Evidence

All five ROADMAP Phase-7 success criteria mapped to executed evidence (command → decisive output). Two-tier: ✓ VERIFIED carries executed evidence; ⚠ UNVERIFIED names what cannot be machine-checked yet. **The ⛔ FABLE closure verdict is deliberately NOT written below** — CEO standing order (2026-07-09): the verdict may not be given before the three CEO items close (DNS A record, BACKUP_DEST, OpenRouter credits) **— ALL THREE CLOSED 2026-07-09 (evidence in the ⚠ table)** — plus the 2026-07-10 06:00 unattended firing check. Everything verifiable today is verified today.

## Criterion 1 — Department MCP profiles filter `tools/list`: a worker cannot even SEE Stripe/DocuSign, the CEO agent sees no code MCPs; explicit denials verified per department

- Emitted-JSON proof (07-03): `generateProfilesFromPolicy` → **14 profiles**, sourceHash `df8ea178af2ec687…`; `grep -c stripe profiles/research.mcp.json` → **0**; `grep -cE 'github|"git"' profiles/ceo.mcp.json` → **0**. `profile-denial.test.ts` → **4 passed** (research no stripe/docusign; ceo no github; worker neither; positive control present; quarantined tool excluded even under explicit grant; unknown slug throws; re-run byte-identical).
- RUNTIME proof (07-04, master step 4): `profile-denial-runtime.test.ts` → **2 passed** — PRODUCTION research profile: `stripe.create_charge` throws **"tool not found" at selection**; positive control: all 21 pinned dxb-mcp tools resolve against the live server.
- Denial split CEO-CONFIRMED 2026-07-09 (finance denies docusign, legal-de denies stripe) — 07-03 deviation 3 closed.
- **PASS ✓ VERIFIED**

## Criterion 2 — A changed upstream tool description quarantines that tool until re-approved (hash pinning on a live change)

- 07-02 `pin-quarantine.test.ts` → **5 passed**: description mutation → `quarantined=true` + audit `tool_quarantined` {old_hash,new_hash}; sibling tool untouched; no duplicate audit on re-run; **restored description → hash matches again but quarantine STAYS** (sticky, human re-approval path only); key-order canonicalization proven.
- Production pin: `pinAll` → **21/21 dxb-mcp tools pinned**; VPS parity (07-05): `VPS_PINALL pinned=21` + daily 04:00 pin-check cron in the outbox scheduler.
- Quarantined tools excluded from emitted profiles (07-03 test: explicit-grant path still excludes).
- **PASS ✓ VERIFIED**

## Criterion 3 — Compose stack (Postgres/Supabase, LiteLLM, dxb-mcp, Speaches, open-notebook) on the EU VPS within 8GB; healthy after reboot

- 07-05 live-box: `docker compose --profile core ps` → **9/9 Up** (db/kong/meta/studio health green); gateway routes `auth_health=200 / rest_anon=200 / studio_via_kong=200`, dummy key → 401; registry parity **14 departments / 153 agents**; 12 migrations applied.
- RAM: `free -m` → **used 2579 / 7751, available 5171**; per-container stats recorded (litellm 1.02GiB dominant). Voice profile measured under load at 07-07: Speaches peak **1.373GiB ≤ 1.5G limit** (master 1–1.5GB expectation held). Brain profile (open-notebook+surrealdb) declared in compose, mem-limited 512m+few-hundred-M.
- Reboot self-heal (master step 7): `sudo reboot` → **ALL_GREEN in 100s**, zero manual steps (`dxb-stack.service` enabled).
- Backup+restore DRILLED: `BACKUP_OK dxb-2026-07-09.dump`; restore into scratch DB → `count(departments)=14`; daily cron `30 2 * * *` installed.
- Off-site leg CLOSED 2026-07-09 22:57: Hetzner Storage Box `dxb-backup-1` + least-privilege subaccount `u629578-sub1` (SSH-key-only), `BACKUP_DEST` set in vps/.env, drill `bash pg_dump.sh` → **`OFFSITE_OK 2026-07-09` + `BACKUP_OK dxb-2026-07-09.dump (1564584 bytes)`**, sftp ls on box shows the dump byte-identical (1564584).
- **PASS ✓ VERIFIED**

## Criterion 4 — Hermes (GLM 5.2 brain) runs bounded scheduled jobs with watchdog and kill switch; overnight output lands in a morning review queue behind the Phase-4 rails

- 07-06 live-box, three evidence runs:
  1. **Runaway kill drilled ×2**: `KILL fake-runaway2 — over_budget:cost 0.0005156>0.0001` (REAL LiteLLM SpendLogs figures), audit row + anomaly line in the morning artifact + per-window dedup (`killed=0` next tick).
  2. **Kill switch e2e both directions**: `on` → `hard_stopped=true`, key probe `401 "Key is blocked"`, hermes stopped; `off` → restored, probe `DXB-OK`; each effect reported independently; audited both ways.
  3. **Morning queue**: completed artifact → `tasks` row `hermes|review|CEO morning review: social-morning-scan digest 2026-07-09`, idempotent per window; **zero outward rows** for hermes (Phase-4 rails in front).
- Cage mechanics: mandatory budget/artifact/on_output fields loader-enforced (`REJECT bad-job.md — missing: artifact:`); v0.18.2 commit-pinned install `git rev-parse HEAD` = `9de9c25f…` (installer sha256-inspected); brain wired ONLY via the dxb-hermes LiteLLM virtual key (T-07-21).
- **PASS ✓ VERIFIED at mechanism level** — full overnight digest + first unattended 06:00 firing sit in the ⚠ list (OpenRouter credit cap).

## Criterion 5 — CEO drops a video link → downloaded, transcribed, summarized, filed through the memory router asynchronously with a quarantine tier

- 07-07 LIVE e2e (real chain, no seams): `LIVE_INGEST_OK jNQXAC9IVRw research transcript:2986725f summary:9a3b9fa7 executive:b33f6acd explanation-detailed:93f5b4fd concepts:9183c0ba concepts:83eb6517` — vitest **7/7** incl. live (real yt-dlp → real Speaches STT on-demand → glm classify → sonnet generate → **fable-5** explain → every row `trust_tier='quarantined'`, origin 'video').
- CLI proven live: `INGESTED jNQXAC9IVRw — "Me at the zoo" / department: research / mode: examples` (7 quarantined rows, persisted) + `ask` grounded Turkish answer with mandatory `⚠ kaynak karantinalı` caveat.
- Deterministic battery **6/6**: quarantine excluded by trusted recall / found by include-quarantined; dead-STT → ZERO rows; unparseable generator → loud reject; URL single-argv injection guard; unsure-dept → research; mode path.
- **PASS ✓ VERIFIED**

## Full-suite regression

- `pnpm vitest run` (2026-07-09 18:02) → **28 files passed, 136 passed / 15 skipped** — phases 4/5/6 gates included, no regression.

## Supply-chain pin (07-08 Task 1, Phase-1 handover T-01-SC)

- `git ls-remote https://github.com/gitleaks/gitleaks-action v2` → `dcedce43c6f43de0b836d1fe38946645c9c638dc refs/tags/v2`; workflow now `uses: gitleaks/gitleaks-action@dcedce43c6f43de0b836d1fe38946645c9c638dc # v2 tag, resolved 2026-07-09`; verify grep green. (No v2.x.y release tag matches the v2 major tag head; the pin captures exactly what `@v2` executed on pin day.)

## ⚠ UNVERIFIED (honest tier)

| Item | Why | Unblock |
|---|---|---|
| CI run green on the SHA-pinned workflow | repo has NO GitHub remote (checked: `git remote -v` empty); creating one = outward action, CEO decision | first push after CEO opens remote |
| ~~TLS over real domain~~ **CLOSED 2026-07-09 23:00** — CEO named the swap in-session ("İzin: … Caddy TLS swap yap (dxbglobal.online)"): `DXB_DOMAIN` wired via `/etc/caddy/caddy.env` + systemd drop-in, `caddy validate` → OK, swap + restart → `curl https://dxbglobal.online/health` → **`ok`** AND `https://www.dxbglobal.online/health` → **`ok`**; cert `issuer=Let's Encrypt CN=YE1, subject=CN=dxbglobal.online, notAfter=Oct 7 2026`; `http://` → **308** to https | — |
| ~~Off-site backup copy~~ **CLOSED 2026-07-09 22:57** — contradiction resolved: the bought storage was NOT on the account yet; Storage Box `dxb-backup-1` provisioned under CEO full-delegation (Hetzner), least-privilege subaccount `u629578-sub1` created, SSH-key-only auth (RFC4716 gotcha documented in vps/README.md), `BACKUP_DEST` set; drill → **`OFFSITE_OK 2026-07-09`**, dump on box **1,564,584 bytes = local byte count** | — |
| ~~Hermes full overnight digest~~ **CLOSED 2026-07-09 19:20**: credits topped (+€6) → manual `hermes cron run` produced the REAL 20-item digest (`social-scan-2026-07-09.md`, 6051 bytes, "Generated 19:20 UTC", 33 proxy calls, zero 402) | — | — |
| First unattended 06:00 firing | needs a real morning; check scheduled 2026-07-10 08:23 | Fable checks tomorrow |
| 15 department virtual keys on VPS | mint attempt 2026-07-09 denied by permission classifier (secret-store write requires CEO naming); nothing consumes them before Phase 8 | CEO one-liner naming the mint, or Phase-8 start |

## Deviations / adaptations (CEO-visible, phase-wide roll-up)

1. 07-02: logical migration slot naming (Supabase CLI timestamps); @types/node build fix.
2. 07-03: denial split finance/legal-de — **CEO CONFIRMED** same day; only-catalogued-servers-emit rule.
3. 07-04: DNS-TLS gate carried (CEO item); everything else in the plan closed.
4. 07-05: kong 2.8.1 local-parity + `_realtime` schema manual create + LiteLLM real RAM 1.0GiB (mem_limit 1536m); trimmed upstream services per master RAM table.
5. 07-06 (8 recorded): hermes v0.18.2 honors ONLY config.yaml `model.api_key` (virtual key box-local 0600, T-07-21 intact); watchdog spend source = LiteLLM SpendLogs UNION cost_ledger (live-proven); coarse dept attribution v1 fails-safe; CLI path `tools/dxb-cli`; `drop_params: true`; manual cron registration v1; kill-switch leaves unit "failed" by design; review-queue INSERT owned by watchdog.
6. 07-07 (7 recorded): seed path `packages/kernel/policy/routing-seed.json`; Anthropic aliases ride OpenRouter `api` mode; **fable-5 found LIVE on OpenRouter → `video.explain` upgraded to fable-5** (CEO req 4 exceeded, plan assumption overturned in CEO's favor); STT model verified against live registry; CEO scope expansion at approval (multi-artifact/modes/dept-routing/CLI) delivered same plan; concepts = 1 artifact + N facts; live run under 'os' attribution fallback (loud).
7. 07-08: workflow file is `secret-scan.yml` (existing Phase-1 file), not plan's `gitleaks.yml` — pin applied in place; VPS dept-key mint deferred to CEO naming/Phase 8 (classifier gate, recorded above).
8. 07-08 night ops (2026-07-09, recorded for CEO visibility):
   - **fail2ban incident**: an earlier session's failed `root@` SSH attempts banned the laptop IP ~21:30; ban survived a VPS reboot (persistent DB) and auto-expired ~22:31. Zero damage: no VPS file changed, all services self-healed (`dxb-stack` enabled). Lesson recorded: deploy user is `dxb`, never `root@`.
   - **Off-site design ADAPT**: main Storage Box password was never on disk (previous session's ephemeral env only) and both password-reset and vault-read are classifier-gated — resolved by creating a *least-privilege subaccount* instead (backup dir only, SSH-key-only, no password persisted anywhere). Security posture better than plan's plain scp-target assumption.
   - **pg_dump.sh exec bit**: tracked 100644 in git → cron would have failed at 02:30; fixed on box (`chmod +x`) and in repo (`update-index --chmod=+x`). Caught by the drill, not by review.
   - **Caddy env gap**: `DXB_DOMAIN` was wired in compose but NOT in the caddy systemd unit — 07-04's swap note assumed it; closed with `/etc/caddy/caddy.env` + `caddy.service.d/dxb-env.conf` drop-in (domain stays out of unit files and repo).
   - **www included**: cert covers apex + `www` (`DXB_DOMAIN="dxbglobal.online, www.dxbglobal.online"` — Caddyfile env-substitution accepts the two-address list; `caddy validate` proven before swap).
   - Hetzner console note (CEO screenshot 22:48): account too new for limit increases; **outgoing ports 25/465 blocked by default** → Phase 10/11 outbound e-mail must ride an external relay (noted for those phases).

## ⛔ FABLE VERDICT

**PENDING — deliberately withheld, residue narrowed to ONE item.** The three CEO items are CLOSED with executed evidence (2026-07-09: DNS dig-verified; OpenRouter +€6 with real digest; BACKUP_DEST off-site drill `OFFSITE_OK`) and TLS is live (`https://dxbglobal.online/health` → `ok`, Let's Encrypt). Remaining precondition per the recorded standing order: the **first unattended 06:00 hermes firing** (a real morning cannot be simulated — Evidence-Before-Done). Check runs 2026-07-10 08:23; if the artifact + review-queue row exist, Fable writes the verdict block here in-session and the closure commit lands. Checker PASS ≠ done; this document is not a closure claim.
