# Phase 1: Security Baseline & Credential Remediation - Research

**Researched:** 2026-07-05
**Domain:** Credential rotation & dead-key verification, 2FA enrollment, repo secret hygiene, document sanitization
**Confidence:** MEDIUM-HIGH (every provider recipe cross-checked against current official docs via web; exact status codes for a few providers marked LOW where undocumented)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hard gate (CEO-locked)**
- Old credential/key/password/token values must verifiably return 401/access-denied before Phase 2 starts
- 2FA confirmed on Gmail, Cloudflare, Namecheap, hosting at minimum
- Source ODT sanitized (credentials section stripped; original stays out of git/cloud sync)
- Vault pattern (`.env` + loader + `.gitignore`) established
- Secret scan passes clean (pre-commit + CI)

**Division of labor (CEO-locked)**
- CEO personally performs all rotations (passwords, keys, 2FA enrollment) following the checklist
- The OS/builder prepares: the checklist, the verification procedures, the evidence structure, the vault scaffold, the scanning automation
- **Secret VALUES are never written into any project file, prompt, or chat** — the checklist references credentials by name/category only

**Deliverable shape (CEO-locked)**
- Credential remediation checklist covering every secret category in the source doc
- Verification evidence structure: per-item record that the old value is dead (e.g., API call returns 401; login rejected), captured without exposing new values
- Canonical numbering: this is Phase 1 of 11 (P0 label is historical only)

**Credential inventory to cover (categories only — values live nowhere in this repo)**
- Linux sudo password (laptop)
- Gmail account + application password
- Two Hotmail accounts
- WordPress admin (outleteuro)
- Hosting account (hostloom)
- Namecheap dashboard + private email (support@/sales@ outleteuro)
- Cloudflare: agent token + legacy fallback user token
- API keys: OpenAI, OpenRouter, 9Router, NVIDIA Build, Apify, Ollama, OpenCode
- Password-reuse hazard: the same passwords repeat across many services — every rotated value must be unique per service

### Claude's Discretion
- Checklist format and ordering (risk-first vs provider-grouped)
- Evidence record format and storage layout (no secrets in evidence)
- Secret-scanner choice (gitleaks or equivalent) and pre-commit/CI wiring
- Vault loader pattern details (dotenv conventions, template file naming)
- How to verify each provider's old key is dead (per-API 401 probes, login checks)

### Deferred Ideas (OUT OF SCOPE)
- LiteLLM virtual keys per department — Phase 4 (Safety Rails)
- Secrets/Vault MCP for agent runtime access — Phase 3+ (dxb-mcp)
- Cloudflare/hosting token re-issue with narrow scopes for agent use — Phase 7+ (only after gateway exists)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC-01 | CEO credential-rotation checklist covering every secret in the source doc; completion verified (old keys return 401/access-denied), not just ticked | Per-service rotation + dead-key probe recipes (this doc, "Per-Service Recipes"); evidence-record schema; risk-first ordering |
| SEC-02 | Secrets vault pattern (`.env` + loader + `.gitignore`) — no plaintext secret in repo, prompts, or agent-visible config | Vault scaffold layout; dotenv/dotenv-cli conventions for the future pnpm monorepo; agent access-denial pattern (`.claude/settings.json` deny rules) |
| SEC-03 | Automated secret scan (pre-commit + CI) passes clean | gitleaks selection rationale; plain git-hook + pre-commit-framework + GitHub Actions wiring; full-history scan; optional trufflehog verified sweep |
| SEC-04 | Source .odt credentials section stripped; sanitized copy in project docs | ODT-is-a-zip verification procedure (content.xml/styles.xml/meta.xml grep); tracked-changes/versions purge; cloud-sync sweep |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Security**: secrets only via vault/.env; no plaintext credentials in repo or prompts — this phase implements that constraint
- **Process**: "no guessing" — unknowns researched before action; every claim below carries provenance tags
- **Budget**: €50–150/mo — all tooling chosen here is free/open-source (gitleaks, trufflehog, dotenv); zero recurring cost
- **Stack alignment**: `direnv / dotenv + .gitignore vault pattern` is already the locked stack decision for secrets (CLAUDE.md stack table); LiteLLM virtual keys later mean most agents never see a real provider key — Phase 1 only lays the `.env` pattern
- **Workflow**: GSD entry points required for repo edits; this phase's repo artifacts (hooks, .gitignore, .env.example, evidence templates) land through `/gsd-execute-phase`

## Summary

Phase 1 is an operational security phase, not a build phase. The planner needs three kinds of material: (1) **per-service rotation + dead-key verification recipes** the CEO can follow mechanically, (2) **repo hygiene automation** (scanner + hook + vault scaffold) the builder installs, and (3) an **evidence schema** that proves the hard gate without ever recording a secret value.

The central procedural insight for dead-key verification: **capture the old value transiently before revoking it, revoke, then probe with the old value and record only the status code.** For API providers this is a curl call expecting HTTP 401 (or the provider's documented auth-rejection code); for password services it is a rejected login in a private browser window. Two providers have trapdoors: Apify's rotation offers a **24-hour grace window where the old token stays valid** [VERIFIED: docs.apify.com] — the probe must either use immediate invalidation or wait out the window; and **changing a Google account password auto-revokes all app passwords** [CITED: support.google.com/accounts/answer/185833] — so the Google password rotation and app-password verification are one combined step, in a fixed order.

For scanning: **gitleaks is the mandatory local gate** (single Go binary, offline, sub-second on diffs — the only tool fit for a pre-commit hook), with an optional **trufflehog verified sweep** as a second, semantic proof: after rotation, `trufflehog --only-verified` over full history should report zero live secrets, converting "we rotated" into "nothing in this repo authenticates anywhere anymore." detect-secrets' baseline workflow is unnecessary — this repo is young and must be clean, not baselined.

**Primary recommendation:** Order the checklist risk-first by *recovery-vector dependency* (email accounts → registrar/DNS → hosting → app admin → API keys → local machine), enroll TOTP 2FA at the same sitting as each password change, probe each old value immediately after rotation, and record one evidence row per item (ID, timestamp, probe method, observed status) in `.planning/phases/01-security-baseline-credential-remediation/evidence/`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Rotation actions (dashboards, password changes, 2FA enrollment) | CEO / manual browser | — | CEO-locked decision; provider dashboards require interactive auth + 2FA |
| Dead-key probes (curl 401 checks) | CEO terminal (local shell) | — | Old value must transit only the CEO's terminal, never a file or agent context |
| Evidence recording | Repo (`.planning/.../evidence/`) | — | Status codes + timestamps only; committed as phase artifact |
| Secret scanning (pre-commit) | Local git hook | CI (GitHub Actions, optional) | Local hook is the mandatory gate (CONTEXT); CI is defense-in-depth |
| Vault (`.env`) | Repo root, gitignored | Loader in Phase 2 monorepo | Phase 1 = pattern + template + ignore rules; runtime loader lands with the pnpm workspace |
| Agent secret-access denial | Claude Code config (`.claude/settings.json`) | Prompt discipline | Deny-read on `.env` is enforcement; prompt rules alone are Pitfall 2 |
| ODT sanitization | CEO desktop (LibreOffice) | Terminal verification (unzip/grep) | Edit is manual; verification is scripted and evidence-producing |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gitleaks | v8.24.x (binary/brew/docker `ghcr.io/gitleaks/gitleaks`) | Pre-commit secret gate + full-history scan | Fast offline regex+entropy Go binary; the de-facto pre-commit scanner; official pre-commit hook published [VERIFIED: github.com/gitleaks/gitleaks README] |
| dotenv | 17.4.2 | Runtime `.env` loading (Phase 2 monorepo loader) | 137M weekly downloads, canonical Node env loader [VERIFIED: npm registry + package-legitimacy OK] |
| dotenv-cli | 11.0.0 | Prepend-to-script env injection in pnpm workspace scripts | Standard answer for monorepo root-`.env` sharing [VERIFIED: npm registry + package-legitimacy OK] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| trufflehog | v3 latest (binary) | *Verified* history sweep — live-tests candidate secrets against providers | Once after rotation completes (proves history holds no live secret), then monthly/scheduled |
| pre-commit (framework) | latest (pip) | Managed hook runner | Optional alternative to a plain `.git/hooks/pre-commit` script; adds a Python dependency |
| gitleaks-action | v2 | CI scan on push/PR | Optional GitHub Actions wiring; free for personal repos, org repos need a (free-to-request) `GITLEAKS_LICENSE` [ASSUMED] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| gitleaks (pre-commit) | trufflehog everywhere | trufflehog's verification makes live API calls — too slow/networked for a commit hook; keep it for scheduled sweeps [VERIFIED: cross-source comparison] |
| gitleaks (pre-commit) | detect-secrets | Its strength is baselining thousands of legacy findings; this repo is young and must be *clean*, not baselined — baseline workflow adds ceremony with no payoff |
| plain `.git/hooks` script | husky | husky belongs to the Phase 2 pnpm monorepo (needs package.json); Phase 1 repo may pre-date it — plain hook has zero dependencies; migrate to husky in Phase 2 if desired |
| `.env` + dotenv | SOPS/age encrypted secrets, Infisical, Doppler | Overkill for a solo-CEO single-laptop estate at this phase; Secrets MCP for agent runtime is explicitly deferred (Phase 3+) |

**Installation:**
```bash
# gitleaks — pick one:
brew install gitleaks                                  # if brew present
# or binary release:
# download from https://github.com/gitleaks/gitleaks/releases (linux_x64 tar.gz), place in ~/.local/bin
# or docker:
docker pull ghcr.io/gitleaks/gitleaks:latest

# trufflehog (optional, post-rotation sweep):
# binary from https://github.com/trufflesecurity/trufflehog/releases

# Node deps land in Phase 2 with the monorepo:
pnpm add -w dotenv dotenv-cli
```

**Version verification:** `dotenv 17.4.2` and `dotenv-cli 11.0.0` confirmed on npm registry 2026-07-05 via `npm view`, both with `postinstall: null` (no install scripts) [VERIFIED: npm registry].

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| dotenv | npm | 10+ yrs (latest publish 2026-04) | ~137M/wk | github.com/motdotla/dotenv | OK | Approved |
| dotenv-cli | npm | mature (latest publish 2025-10) | ~5.1M/wk | github.com/entropitor/dotenv-cli | OK | Approved |
| gitleaks | GitHub releases (Go binary, not npm) | 21k+ stars | — | github.com/gitleaks/gitleaks | OK | Approved (verify checksum of release artifact) |
| trufflehog | GitHub releases (Go binary) | mature | — | github.com/trufflesecurity/trufflehog | OK | Approved (optional) |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Per-Service Recipes (rotate → prove dead → record)

> **Universal probe hygiene (applies to every recipe):**
> 1. Open a terminal; run ` export OLD='<paste old value>'` **with a leading space** (keeps it out of bash history; `HISTCONTROL=ignoreboth` is the Ubuntu default [ASSUMED — verify with `echo $HISTCONTROL`]).
> 2. Perform the rotation/revocation in the provider dashboard.
> 3. Run the probe using `$OLD`. Record **only** `date -u`, the probe method name, and the observed status.
> 4. `unset OLD` and close the terminal. The old value never touches a file, the repo, or an agent context.
> 5. Probe template (status code only, response body discarded):
> ```bash
> curl -sS -o /dev/null -w "%{http_code}\n" <URL> -H "Authorization: Bearer $OLD"
> ```
> **Acceptance rule:** the gate is "old value no longer authenticates." That is HTTP **401** for most APIs, but any documented auth-rejection (403/400-with-auth-error, SMTP 535, login-page rejection) satisfies it — record the actual observed code.

### 1. OpenAI API — confidence: HIGH

- **Rotate:** platform.openai.com → API keys (`platform.openai.com/api-keys`) → create replacement key first (store in password manager) → **Revoke** the leaked key. Keys never expire on their own; revocation is manual [CITED: help.openai.com/en/articles/6882433].
- **Prove dead:**
  ```bash
  curl -sS -o /dev/null -w "%{http_code}\n" https://api.openai.com/v1/models \
    -H "Authorization: Bearer $OLD"
  # EXPECT: 401
  ```
  A revoked key returns 401 `invalid_api_key` [CITED: developers.openai.com error-codes guide; community-confirmed].
- **Record:** `CRED-OPENAI | probe GET /v1/models | 401 | <UTC timestamp>`.
- **Also check:** other keys listed on the same page (delete any unknown/unused ones); usage page for unexplained spend since the leak.

### 2. OpenRouter — confidence: MEDIUM

- **Rotate:** openrouter.ai dashboard → key settings (`openrouter.ai/settings/keys` [ASSUMED — exact path]; programmatic: `DELETE https://openrouter.ai/api/v1/keys/{keyHash}` with a Management key [CITED: openrouter.ai/docs API keys reference]). Create the replacement first, then delete the leaked key.
- **Prove dead:**
  ```bash
  curl -sS -o /dev/null -w "%{http_code}\n" https://openrouter.ai/api/v1/key \
    -H "Authorization: Bearer $OLD"
  # EXPECT: 401  (GET /api/v1/key returns info about the presented key; deleted key cannot authenticate)
  ```
  Fallback probe if `/api/v1/key` behaves unexpectedly: a minimal `POST /api/v1/chat/completions` — expect 401. (Do NOT probe `GET /api/v1/models`; it is public and returns 200 without auth [ASSUMED].)
- **Record:** status + timestamp.
- **Also check:** credit balance/activity for unexplained usage.

### 3. 9Router — confidence: MEDIUM (nature of service verified; remediation is local)

**Important reframe:** 9Router is a **self-hosted local gateway** (`localhost:20128`) that stores *other providers'* keys/OAuth cookies in its local config — it is not a hosted service with its own cloud key [VERIFIED: github.com/decolua/9router, 9router.com].
- **Remediate:** (a) rotating the upstream providers (items 1, 2, 4, 6, 7) kills whatever 9Router had stored; (b) after rotations, open the 9Router dashboard and re-enter/refresh provider credentials; (c) sweep its local config directory for old key strings so stale copies don't linger on disk (see Runtime State Inventory).
- **Prove dead:** covered by the upstream providers' probes. Evidence row: `CRED-9ROUTER | local config swept + providers re-authed | N/A (local software) | <timestamp>`.

### 4. NVIDIA Build (build.nvidia.com) — confidence: MEDIUM

- **Rotate:** build.nvidia.com → Settings → API Keys (`build.nvidia.com/settings/api-keys`) → Action menu → **Rotate** (or delete). Personal keys support rotation and deletion with immediate revocation; for legacy keys, generating a new key auto-revokes the previous one [CITED: docs.nvidia.com NeMo/RAG api-key pages].
- **Prove dead:**
  ```bash
  curl -sS -o /dev/null -w "%{http_code}\n" https://integrate.api.nvidia.com/v1/chat/completions \
    -H "Authorization: Bearer $OLD" -H "Content-Type: application/json" \
    -d '{"model":"meta/llama-3.1-8b-instruct","messages":[{"role":"user","content":"x"}],"max_tokens":1}'
  # EXPECT: 401 (exact code for revoked nvapi- key not officially documented — accept any 4xx auth rejection) [LOW on exact code]
  ```
- **Record:** status + timestamp. Old keys are `nvapi-` prefixed — that prefix goes into the repo-sweep grep list (never the value).

### 5. Apify — confidence: HIGH (trapdoor documented)

- **Rotate:** console.apify.com → Settings → **API & Integrations** → token actions → Rotate.
- **⚠ TRAPDOOR:** rotation offers to keep the old token valid for a **24-hour grace period** [VERIFIED: docs.apify.com/platform/integrations/api]. For remediation choose **immediate invalidation**; if grace was selected, the 401 probe only passes after 24h — schedule the probe accordingly.
- **Prove dead:**
  ```bash
  curl -sS -o /dev/null -w "%{http_code}\n" https://api.apify.com/v2/users/me \
    -H "Authorization: Bearer $OLD"
  # EXPECT: 401
  ```
- **Record:** status + timestamp + whether grace period was declined.

### 6. Cloudflare (account/agent token + legacy user token + Global API Key) — confidence: HIGH

Three distinct credentials; handle all three:

**a) Account-owned (agent) token**
- **Rotate:** dash.cloudflare.com → account → Manage Account → API Tokens → three-dot menu → **Roll** (new secret, same permissions; old secret invalidated) — or delete outright [CITED: developers.cloudflare.com/fundamentals/api/how-to/roll-token/].
- **Prove dead:**
  ```bash
  curl -sS -o /dev/null -w "%{http_code}\n" \
    "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/tokens/verify" \
    -H "Authorization: Bearer $OLD"
  # EXPECT: 401 (verify endpoint reports active/disabled/expired for valid tokens; rolled-away secrets fail auth)
  ```
  [VERIFIED: developers.cloudflare.com API reference — `GET /accounts/{account_id}/tokens/verify`]

**b) Legacy user token**
- **Rotate:** My Profile → API Tokens → three-dot → Roll (or Delete) [CITED: roll-token doc — menu path verified].
- **Prove dead:**
  ```bash
  curl -sS -o /dev/null -w "%{http_code}\n" https://api.cloudflare.com/client/v4/user/tokens/verify \
    -H "Authorization: Bearer $OLD"
  # EXPECT: 401
  ```
  Note: IP-range restrictions do not apply to the verify endpoint — a clean auth test [CITED: Cloudflare fundamentals docs].

**c) Global API Key** (if it ever appeared in the leaked doc — it authorizes *everything*)
- **Rotate:** My Profile → API Tokens → Global API Key → View/**Change** [ASSUMED — exact button label].
- **Prove dead:**
  ```bash
  curl -sS -o /dev/null -w "%{http_code}\n" https://api.cloudflare.com/client/v4/user \
    -H "X-Auth-Email: <account email>" -H "X-Auth-Key: $OLD"
  # EXPECT: 400 or 403 with auth error (legacy key auth rejects with 400-class, not always 401) [LOW on exact code]
  ```
- **Also:** enable 2FA (see 2FA section) and Dashboard → My Profile → check active sessions if available [ASSUMED].

### 7. Ollama cloud — confidence: HIGH

- **Rotate:** ollama.com → account settings → **Keys** (`ollama.com/settings/keys`) → revoke leaked key, create replacement. Keys don't expire; revocation is immediate and manual [VERIFIED: docs.ollama.com/api/authentication].
- **Prove dead:**
  ```bash
  curl -sS -o /dev/null -w "%{http_code}\n" https://ollama.com/api/generate \
    -H "Authorization: Bearer $OLD" -H "Content-Type: application/json" \
    -d '{"model":"gpt-oss:120b","prompt":"x","stream":false}'
  # EXPECT: 401 (documented authenticated endpoint; exact revoked-key code not documented — accept 4xx auth rejection) [MEDIUM]
  ```
- **Record:** status + timestamp.

### 8. OpenCode (Zen) — confidence: MEDIUM

- **Rotate:** sign in at **opencode.ai/auth** → API keys → delete leaked key / Create API Key for replacement [CITED: opencode.ai/docs/zen/].
- **Prove dead:**
  ```bash
  curl -sS -o /dev/null -w "%{http_code}\n" https://opencode.ai/zen/v1/chat/completions \
    -H "Authorization: Bearer $OLD" -H "Content-Type: application/json" \
    -d '{"model":"claude-sonnet-4-5","messages":[{"role":"user","content":"x"}],"max_tokens":1}'
  # EXPECT: 401 [MEDIUM — endpoint shape cited from docs; revoked-key code undocumented]
  ```
- **Also:** the local opencode CLI stores auth on disk — sweep `~/.local/share/opencode/` for stale credentials after rotation (see Runtime State Inventory) [ASSUMED — path].

### 9. Google account (Gmail) — password + app password + 2FA — confidence: HIGH

**Order matters** — this is one combined procedure:
1. **Before rotating:** copy the old app password into the probe terminal (` export OLD_APP='...'`).
2. **Change the account password:** myaccount.google.com → Security → Password. **This automatically revokes all app passwords** [CITED: support.google.com/accounts/answer/185833] — the app-password rotation is free.
3. **Enroll TOTP 2FA** (same sitting): Security → 2-Step Verification → add **Authenticator app** (any TOTP app works [CITED: Google Workspace 2SV docs]) → save **backup codes** to the password manager.
4. **Sign out everywhere:** Security → Your devices → sign out unrecognized/all other sessions [ASSUMED — menu wording].
5. **Re-issue** a fresh app password only if some legacy client still needs one: myaccount.google.com/apppasswords (page only exists while 2SV is on).
- **Prove dead (old app password via SMTP AUTH):**
  ```bash
  curl -sS --url "smtps://smtp.gmail.com:465" \
    --user "<gmail address>:$OLD_APP" \
    --mail-from "<gmail address>" --mail-rcpt "<gmail address>" \
    -T /dev/null ; echo "curl exit: $?"
  # EXPECT: failure with SMTP "535-5.7.8 Username and Password not accepted" (curl exit 67) [MEDIUM]
  ```
- **Prove dead (old account password):** private/incognito window → accounts.google.com → sign in with old password → **expect "Wrong password" rejection**. Evidence: timestamp + "login rejected" (describe the screen; no screenshot with values).

### 10. Microsoft accounts (two Hotmail) — confidence: MEDIUM

Repeat for **each** of the two accounts:
1. account.microsoft.com → Security → **Change password** (unique per account — no reuse between the two).
2. **2FA/TOTP:** Security → Advanced security options → Add a new way to sign in or verify → **Use an app** (Microsoft Authenticator or any TOTP app) [CITED: support.microsoft.com two-step verification article]. Save recovery code.
3. **Sign out everywhere:** Security → Advanced security options → **Sign me out** / "Logout from All Locations" [CITED: Microsoft Q&A — menu wording varies; MEDIUM].
4. Password change with 2SV enabled auto-disables old Microsoft app passwords ("App Passwords Need to Be Updated" email is expected and benign) [CITED: Microsoft support].
- **Prove dead:** private window → login.live.com → old password → expect "Your account or password is incorrect." Record timestamp + rejection per account (two evidence rows).
- **Also check:** mailbox forwarding rules and connected apps for attacker persistence (Settings → Mail → Forwarding; Security → Manage sign-in activity) [ASSUMED].

### 11. WordPress admin (outleteuro) — confidence: HIGH

1. wp-admin → Users → Profile → **Set New Password** → Update Profile. Updating the password logs out other sessions; additionally click **"Log Out Everywhere Else"** [CITED: wordpress.org documentation / wpbeginner].
2. **Application passwords:** same profile screen → Application Passwords section → **Revoke all** [CITED: developer.wordpress.org advanced-administration].
3. **Rotate WP salts** (`AUTH_KEY`…`NONCE_SALT` in wp-config.php, via hosting file manager or the salt generator) — force-invalidates *every* auth cookie including any attacker's [ASSUMED — standard practice, verify against current WP docs during execution].
4. Audit Users list for unknown administrators.
- **Prove dead (admin password):** private window → `https://<site>/wp-login.php` → old password → expect login error. Timestamp + rejection.
- **Prove dead (old application password, if its value is still available):**
  ```bash
  curl -sS -o /dev/null -w "%{http_code}\n" \
    --user "<admin-username>:$OLD_APP_PW" "https://<site>/wp-json/wp/v2/users/me"
  # EXPECT: 401
  ```

### 12. Hosting (hostloom, cPanel-class) — confidence: LOW (provider-specific paths unverifiable)

Hostloom is a small cPanel-class host; two separate credentials likely exist:
1. **Client-area/billing portal password** (WHMCS-style): change via the client area profile page [LOW — provider-specific].
2. **cPanel password:** cPanel → Preferences → **Password & Security** → requires old password → changing it ends the current session [CITED: multiple host KBs incl. Namecheap KB]. If cPanel offers Two-Factor Authentication (Security section), enable it [CITED: Namecheap cPanel 2FA KB — availability varies per host].
3. This password often doubles as FTP/SSH/webmail for the primary account — assume all rotate together [ASSUMED].
- **Prove dead:** private window → `https://<host>:2083` (cPanel) → old password → expect rejection. Same for webmail `:2096` if used. Timestamp + rejection.
- **Fallback if URLs unknown:** use the host's KB/login links from the client area. Mark this item for CEO discovery — exact hostnames live outside the repo.

### 13. Namecheap dashboard + Private Email — confidence: HIGH

**Dashboard:**
1. namecheap.com → Profile → Security → change account password [ASSUMED — exact submenu]; then Profile → **Security → Access → Two-Factor Authentication → Enable → TOTP** (any TOTP app; backup codes issued at enrollment) [VERIFIED: namecheap.com KB 10073 + 9253].
- **Prove dead:** private window → namecheap.com sign-in → old password → rejection. Timestamp.

**Private Email (support@ / sales@ outleteuro):** for **each** mailbox:
1. Change password via privateemail.com webmail → Settings → **Basic settings → Change Password** ("Change password and sign out"), or via the Namecheap dashboard mailbox management [VERIFIED: namecheap KB 1053]. Log out of webmail/mail clients first — an active session can block the reset [CITED: same KB].
2. Private Email also supports its own 2FA and app-specific passwords [CITED: namecheap KB 10195, 10374] — enable 2FA on each mailbox.
- **Prove dead (per mailbox):**
  ```bash
  curl -sS --url "imaps://mail.privateemail.com:993" \
    --user "support@<domain>:$OLD" -X "LOGOUT" ; echo "curl exit: $?"
  # EXPECT: authentication failure (curl exit 67) [MEDIUM — host name from Namecheap client-config KB]
  ```
  Or: privateemail.com login with old password → rejection. Two evidence rows (one per mailbox).

### 14. Linux sudo password (laptop) — confidence: HIGH

1. Terminal: `passwd` → set a new unique password (password manager).
2. **Prove dead:** new terminal → `sudo -K` (drop cached credentials) → `sudo true` → type the **old** password → expect `Sorry, try again.` → Ctrl-C → then `sudo true` with the new password succeeds.
- **Record:** timestamp + "old password rejected at sudo prompt".
3. **Also:** if full-disk-encryption or the login keyring shares this password, update both (`gnome-keyring` prompts on next login) [ASSUMED].

## 2FA Enrollment (TOTP-first) — summary table

| Service | Path | Method | Backup |
|---------|------|--------|--------|
| Google | myaccount.google.com → Security → 2-Step Verification → Authenticator app | TOTP (any app) [CITED: Google 2SV docs] | Backup codes → password manager |
| Cloudflare | dash → My Profile → **Authentication** → Two-Factor Authentication → Set up → **Mobile App Authentication** → Add → scan QR | TOTP (any app) [VERIFIED: developers.cloudflare.com/fundamentals/user-profiles/2fa/] | Download/print backup codes; regenerable from dashboard |
| Namecheap | Profile → Security → **Access** → Two-Factor Authentication → Enable | TOTP (any app; U2F also available) [VERIFIED: namecheap KB 10073] | TOTP backup codes issued at setup |
| Microsoft (×2) | account.microsoft.com → Security → Advanced security options → Add a new way to sign in → Use an app | TOTP (MS Authenticator or third-party) [CITED: MS support] | Recovery code — save it |
| Namecheap Private Email (×2) | Per-mailbox 2FA [CITED: namecheap KB 10195] | TOTP | Per-mailbox recovery |
| cPanel (hostloom) | cPanel → Security → Two-Factor Authentication *(if host enables it)* [LOW] | TOTP | Host-dependent |

**TOTP app guidance:** one TOTP app (e.g., Aegis/2FAS on Android, or the password manager's TOTP feature) for all services; store every backup-code set in the password manager. SMS only where TOTP is unavailable. Evidence: "2FA enabled" + timestamp per service — the enrollment screens' existence is the evidence; no codes recorded.

## Secret Scanning: decision + wiring

**Decision: gitleaks** (mandatory local hook + full-history scan) **+ trufflehog once post-rotation** (optional but recommended verified sweep). detect-secrets rejected (baseline workflow solves a legacy-repo problem this repo doesn't have) [VERIFIED: cross-source comparison — rafter.so, jit.io, devsecops.ae].

### Local pre-commit hook (mandatory — zero-dependency variant)

`.git/hooks/pre-commit` (chmod +x):
```bash
#!/usr/bin/env sh
# Block any commit containing a detectable secret (staged changes only)
if ! command -v gitleaks >/dev/null 2>&1; then
  echo "ERROR: gitleaks not installed — commit blocked (fail closed)." >&2
  exit 1
fi
exec gitleaks git --pre-commit --staged --redact --verbose
```
Notes:
- `detect`/`protect` commands were deprecated in v8.19; current modes are `git`, `dir`, `stdin` [VERIFIED: gitleaks README]. `git --pre-commit --staged` is the documented replacement for `protect --staged` [MEDIUM — from the README-referenced migration gist].
- `--redact` ensures the hook's own output never prints a secret value — required by the CEO's no-values rule.
- Fail closed: missing scanner blocks the commit.
- Because `.git/hooks` is not versioned, also commit the script at `scripts/hooks/pre-commit` and add a documented one-liner `git config core.hooksPath scripts/hooks` so the hook survives clones [ASSUMED — standard git feature].

Alternative (if Python/pre-commit is acceptable): `.pre-commit-config.yaml`
```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.24.2
    hooks:
      - id: gitleaks
```
[VERIFIED: gitleaks README]

### Full-history scan (run once now, then in CI)

```bash
gitleaks git --redact -v --report-path .planning/phases/01-security-baseline-credential-remediation/evidence/gitleaks-history-report.json
# scans the full git history of the current repo; empty findings = clean
```
If history findings appear (repo is young): prefer **history rewrite** (`git filter-repo`) over baselining — the hard gate demands *clean*, and a young repo makes rewrite cheap. `.gitleaksignore` (finding fingerprints) only for confirmed false positives [VERIFIED: gitleaks README].

### CI (optional per CONTEXT; recommended)

`.github/workflows/secret-scan.yml`:
```yaml
name: secret-scan
on: [push, pull_request]
jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }   # full history every run
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
[MEDIUM — action name/inputs from ecosystem docs; verify pinned SHA at execution time. Free for personal repos; org repos need GITLEAKS_LICENSE [ASSUMED]]

### Post-rotation verified sweep (the elegant second proof)

```bash
trufflehog git file://. --only-verified --fail
# EXPECT: zero verified findings. trufflehog live-tests each candidate against its provider;
# after successful rotation, even secrets in old history are DEAD → nothing verifies.
# exit code 183 = verified secret found (fail); 0 = clean [MEDIUM]
```
This converts the per-item 401 evidence into a whole-repo statement: *no string anywhere in this repository authenticates against any provider.*

### Hook self-test (SEC-03 verification, no realistic fake secrets committed)

Create a throwaway file containing a synthetic detectable pattern (e.g., a random 40-hex string assigned to `aws_secret_access_key`), `git add` it, attempt `git commit` → hook must **block** (non-zero exit) → `git reset` and delete the file. Evidence: hook-blocked output line (redacted) + timestamp. The canary never reaches history.

## Vault Pattern (SEC-02)

### Phase 1 scaffold (pre-monorepo)

```
<repo root>
├── .env                # REAL values. gitignored. Created by CEO, never by an agent.
├── .env.example        # committed — names + __SET_ME__ placeholders + comments, zero real-looking values
├── .gitignore          # see below
└── scripts/hooks/pre-commit
```

`.gitignore` additions:
```gitignore
# vault
.env
.env.*
!.env.example
# leaked-source document — original never enters git
*.odt
```

`.env.example` convention (placeholders must look fake — no `sk-...` shapes):
```bash
# LLM providers
OPENAI_API_KEY=__SET_ME__
OPENROUTER_API_KEY=__SET_ME__
NVIDIA_API_KEY=__SET_ME__
OLLAMA_API_KEY=__SET_ME__
OPENCODE_API_KEY=__SET_ME__
# Infra
CLOUDFLARE_API_TOKEN=__SET_ME__
APIFY_TOKEN=__SET_ME__
```

### Phase 2 loader convention (pnpm monorepo — decided now so the scaffold survives)

- **Single root `.env`**, no per-package `.env` files — one rotation point, one gitignore rule [VERIFIED: monorepo best-practice cross-sources].
- Script injection: `"dev": "dotenv -e ../../.env -- node src/index.js"` via **dotenv-cli 11.x**, or programmatic `dotenv.config({ path: path.resolve(root, '.env') })` in a shared bootstrap module (dotenv 17.x).
- Later phases: LiteLLM container env holds the real provider keys; department agents get LiteLLM virtual keys (deferred — Phase 4).

### How agents reference secrets without reading .env

1. **Enforcement (not prompts):** add deny rules to `.claude/settings.json` permissions so agent tooling cannot read the vault:
   ```json
   { "permissions": { "deny": ["Read(./.env)", "Read(./.env.*)", "Read(**/.env)"] } }
   ```
   [MEDIUM — Claude Code supports permission deny rules for file reads; exact glob semantics to be confirmed at execution]
2. **Convention:** code and agents reference `process.env.OPENAI_API_KEY` / `${OPENAI_API_KEY}` **by name**; `.env.example` is the discoverable, committed name registry. An agent needing a new secret adds the *name* to `.env.example` and asks the CEO to fill `.env`.
3. **Defense in depth:** gitleaks hook catches values that leak into any committed file anyway; `search_gitignored: false` already set in `.planning/config.json` keeps GSD tooling out of ignored files.

## Document Sanitization (SEC-04)

ODT = a zip container; visible text lives in `content.xml`; also check `styles.xml` (headers/footers), `meta.xml` (metadata), `Thumbnails/thumbnail.png` (first-page render) [VERIFIED: opensource.com ODT structure + OpenOffice forums].

**Procedure:**
1. Work on a **copy**: `cp "DXB GLOBAL TECH...odt" /tmp/sanitize-work.odt` (never edit the original in place; original is already gitignored via `*.odt`).
2. Open the copy in LibreOffice (24.2 installed):
   - Delete the entire credentials section (§12-adjacent content).
   - **Edit → Track Changes → Manage** → accept all / ensure recording is off (deleted text can persist inside tracked changes).
   - **File → Versions** → delete stored versions.
   - Check headers/footers and comments for stray values.
3. **File → Save As** a new file — LibreOffice rewrites the whole zip, so no deleted-text remnants survive in the container.
4. Export the sanitized content as **Markdown or PDF into `docs/`** (e.g., `docs/source-architecture-notes-sanitized.md`) — an .odt copy inside the repo would be re-ignored by the `*.odt` rule and undiffable; Markdown is scannable by gitleaks and reviewable in git.
5. **Verify — zero residual secrets:**
   ```bash
   mkdir -p /tmp/odt-check && cd /tmp/odt-check && unzip -o /tmp/sanitize-work.odt >/dev/null
   grep -rIiEl 'password|passwd|api[_-]?key|token|secret|2fa|sk-[A-Za-z0-9]|sk-or-|nvapi-|apify_api' . || echo "CLEAN"
   # then scan the extracted XML with the secret scanner too:
   gitleaks dir /tmp/odt-check --redact -v
   ```
   Run the same grep/gitleaks over the exported Markdown before committing it. Evidence: "CLEAN" output + timestamp (the grep pattern list is safe to record; it contains categories, not values).
6. **Cloud-sync/backup purge:** locate every other copy of the original — cloud-sync folders, `~/.local/share/Trash`, backups, email attachments — and delete or move the original to a single non-synced location. Evidence: list of locations checked + action taken. (Copies already pasted into third-party AI tools are unrecoverable — which is exactly why every listed credential is treated as compromised and rotated.)
7. `git check-ignore -v "DXB GLOBAL TECH...odt"` must confirm the original is ignored; `git log --all --name-only | grep -i '\.odt'` must come back empty (never committed).

## Evidence-Record Schema (proposal)

Location: `.planning/phases/01-security-baseline-credential-remediation/evidence/ROTATION-EVIDENCE.md` (+ `gitleaks-history-report.json` beside it).

```markdown
# Phase 1 Rotation Evidence — status codes & timestamps only. NO secret values, old or new.

| ID | Category | Service / account | Action | Rotated (UTC) | 2FA | Dead-value probe | Probe (UTC) | Observed | DEAD? |
|----|----------|-------------------|--------|---------------|-----|------------------|-------------|----------|-------|
| CRED-01 | Email | Google (gmail acct) | pw changed; app pw auto-revoked; signed out all | 2026-07-06T09:12Z | TOTP ✓ | SMTP AUTH smtps://smtp.gmail.com:465 | 09:15Z | 535-5.7.8 | ✅ |
| CRED-02 | API key | OpenAI | key revoked, replacement issued | … | n/a | GET /v1/models | … | 401 | ✅ |
| … | | | | | | | | | |
```

Rules encoded in the template header:
- One row per credential (two Hotmail = two rows; two Private Email mailboxes = two rows; Cloudflare = up to three rows).
- `Observed` holds **only** a status/error code or the literal phrase "login rejected".
- A row is ✅ only when the probe column is filled — ticking without probing is structurally impossible to miss in review.
- Password-manager entry + uniqueness: add a final summary row "all new values unique, generated by password manager: YES/NO" (SEC-01 reuse hazard).
- The file is committed; CI secret-scan runs over it like everything else — a belt-and-braces guarantee no value sneaks in.

**Checklist ordering (recommended: recovery-vector risk-first):**
1. Google account (recovery hub for others) → 2. Microsoft ×2 → 3. Namecheap dashboard (registrar = DNS + email domain control) → 4. Namecheap Private Email ×2 → 5. Cloudflare (tokens + 2FA) → 6. Hosting/cPanel → 7. WordPress → 8. API keys (OpenAI, OpenRouter, NVIDIA, Apify, Ollama, OpenCode) → 9. 9Router local sweep → 10. Linux sudo. Rationale: whoever controls email + registrar can reset everything else; kill that vector first.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Secret detection | Custom grep-for-keys scripts | gitleaks rulepack (150+ provider patterns + entropy) | Provider key formats change; rules are maintained upstream |
| "Is this secret live?" | Manual probing of history findings | trufflehog `--only-verified` | Verification engines per provider already exist |
| TOTP | Anything custom | Standard TOTP apps (RFC 6238) | Never hand-roll auth |
| Password generation/uniqueness | Human-invented passwords | Password manager generator | The reuse hazard is the root cause being remediated |
| .env parsing | Custom loader | dotenv / dotenv-cli | Edge cases (quoting, multiline, export) already solved |

## Runtime State Inventory

This is a credential-rotation phase — after every dashboard shows a new key, where do OLD values still live?

| Category | Items Found / To Sweep | Action Required |
|----------|------------------------|-----------------|
| Stored data | No project DBs exist yet (pre-Phase 3). Browser password managers + any mail clients (Thunderbird etc.) hold OLD passwords/app-passwords | CEO updates saved logins after each rotation; delete stale saved passwords |
| Live service config | **9Router local config** (self-hosted gateway stores provider keys/cookies); **opencode CLI auth store** (`~/.local/share/opencode/` [ASSUMED path]); Claude Code / MCP configs in `~/.claude*` that may embed provider keys; any `~/.config/*/` tool configs (aider, litellm, etc.) | After rotations: re-auth each tool with new values; grep sweep of `~/.config`, `~/.local/share`, `~/.claude*` for old-key *prefixes* (`sk-`, `sk-or-`, `nvapi-`, `apify_api_`) — record file list only, then update/delete |
| OS-registered state | Shell rc files (`~/.bashrc`, `~/.profile`, `~/.bash_history`) may export old keys; cron/systemd user units none known | `grep -nE 'sk-|nvapi-|apify_api|API_KEY=' ~/.bashrc ~/.profile` → scrub hits; `history -c` + truncate `~/.bash_history` if old values were ever typed without leading space |
| Secrets/env vars | Stray `.env` files anywhere in home (`find ~ -maxdepth 4 -name '.env*' -not -path '*/node_modules/*' 2>/dev/null`) | Update to new values or delete; the repo-root `.env` becomes the single source |
| Build artifacts | None — no builds yet | None — verified by repo inspection (only `.planning/`, agency-agents, the .odt) |

**Canonical question answered:** after every dashboard rotation, the old strings can persist in: browser/mail-client stores, 9Router/opencode/tool configs, shell rc/history, stray .env files, and the un-sanitized .odt copies (cloud sync/trash). Each has a sweep step above; each sweep is an evidence row (files-touched list, no values).

## Common Pitfalls

### Pitfall 1: Probing before revocation actually takes effect
**What goes wrong:** Apify's 24h grace keeps the old token live → probe returns 200 → panic, or worse, a hurried "must be fine" tick. **Avoid:** decline grace (immediate invalidation); if grace already chosen, schedule the probe for T+24h. **Warning sign:** any 200 from an old-value probe [VERIFIED: docs.apify.com].

### Pitfall 2: Probing an endpoint that doesn't require auth
**What goes wrong:** `GET openrouter.ai/api/v1/models` (public) returns 200 with a dead key → false "still alive" or meaningless "pass". **Avoid:** every probe in this doc targets a documented authenticated endpoint; when unsure, first confirm the probe returns 200 with the NEW key, then 401 with the old (two calls, statuses only).

### Pitfall 3: Rotation without session/app-password kill
**What goes wrong:** attacker with a harvested session or app password survives a password change. **Avoid:** every recipe pairs password change with "sign out everywhere" + app-password revocation + (WordPress) salt rotation; 2FA enrollment in the same sitting blocks credential-stuffing re-entry.

### Pitfall 4: The old value leaks *during* verification
**What goes wrong:** old key pasted into a file, a chat, or plain shell history to run the probe — recreating the original incident. **Avoid:** leading-space `export`, `--redact` everywhere, status-code-only evidence, `unset` + close terminal. Never put old values in scripts, even temporary ones.

### Pitfall 5: Google ordering surprise
**What goes wrong:** CEO changes the Google password first, then tries to "rotate the app password" and finds it already gone — probe skipped because "nothing to revoke." **Avoid:** capture the old app password for the probe *before* the password change; the change itself is the revocation [CITED: Google support].

### Pitfall 6: Sanitized copy committed as .odt
**What goes wrong:** `*.odt` gitignore rule silently keeps the sanitized copy out of git → SEC-04 "sanitized copy lives in project docs" fails invisibly. **Avoid:** export sanitized content to Markdown/PDF in `docs/`; verify with `git status` that it's tracked.

### Pitfall 7: Hook exists but nothing proves it fires
**What goes wrong:** hook file present but not executable / wrong hooksPath → scanner never runs; scan "passes" because it never happened. **Avoid:** the planted-canary self-test (SEC-03 verification) is mandatory evidence, not optional.

### Pitfall 8: Password reuse re-enters through the new values
**What goes wrong:** CEO generates one strong password and uses it on three services — the original root cause survives rotation. **Avoid:** password-manager generation per service; evidence table's uniqueness attestation row.

## Code Examples

All probe snippets are in the Per-Service Recipes. Additional verified patterns:

### Full history scan + report (SEC-03)
```bash
# Source: gitleaks README (github.com/gitleaks/gitleaks)
gitleaks git --redact -v --report-path evidence/gitleaks-history-report.json
```

### Repo-clean spot check for key-shaped strings (belt-and-braces)
```bash
grep -rnIE 'sk-[A-Za-z0-9]{20,}|sk-or-v1-|nvapi-[A-Za-z0-9_-]{20,}|apify_api_[A-Za-z0-9]{20,}' \
  --exclude-dir=.git . || echo "CLEAN"
```

### Vault presence checks (SEC-02)
```bash
git check-ignore .env            # must print .env (ignored)
test -f .env.example && echo OK  # template committed
git ls-files | grep -x '.env' && echo "FAIL: .env tracked" || echo "OK: .env untracked"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `gitleaks detect` / `gitleaks protect` | `gitleaks git` / `gitleaks dir` / `gitleaks stdin` | v8.19 (deprecated) [VERIFIED: README] | Hook scripts must use `gitleaks git --pre-commit --staged` |
| Google "less secure apps" | App passwords only, and only with 2SV on | ~2024 | App-password page requires 2SV; password change revokes app passwords |
| Cloudflare Global API Key for automation | Scoped API tokens (user- and account-owned) with `tokens/verify` endpoints | ongoing | Global key should be treated as break-glass only; narrow re-issue deferred to Phase 7 per CONTEXT |
| SMS 2FA | TOTP apps / passkeys / hardware keys | ongoing | All five target services support TOTP [VERIFIED per-service above] |
| Committed per-package .env files | Single gitignored root .env + committed .env.example + CLI injection | monorepo era | One rotation point; one ignore rule |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | OpenRouter dashboard key page at `openrouter.ai/settings/keys` | Recipe 2 | Trivial — CEO finds keys via dashboard nav |
| A2 | `GET openrouter.ai/api/v1/models` is public (why it's banned as a probe) | Pitfall 2 | None — recipe already uses authenticated endpoints |
| A3 | Cloudflare Global API Key rejection is 400/403 (not 401) | Recipe 6c | Evidence row records actual code; acceptance rule covers any auth rejection |
| A4 | opencode CLI local auth path `~/.local/share/opencode/` | Recipe 8 / Runtime State | Sweep uses grep over `~/.local/share` broadly anyway |
| A5 | WordPress salt rotation invalidates all cookies | Recipe 11 | Sessions already killed by "Log Out Everywhere Else"; salts are extra depth |
| A6 | `git config core.hooksPath scripts/hooks` pattern | Hook wiring | Standard git ≥2.9 feature; fallback = copy into .git/hooks |
| A7 | gitleaks-action org licensing (free personal) | CI wiring | CI is optional per CONTEXT; local hook is the mandatory gate |
| A8 | Claude Code `permissions.deny Read(./.env)` glob semantics | Vault pattern | Verify at execution; prompt-level rule + gitleaks remain as backstops |
| A9 | Hostloom client-area vs cPanel are separate credentials | Recipe 12 | CEO discovers at login; checklist row covers both explicitly |
| A10 | Ubuntu default `HISTCONTROL=ignoreboth` (leading-space trick) | Probe hygiene | Checklist step says verify with `echo $HISTCONTROL` first |
| A11 | Namecheap account-password change submenu location | Recipe 13 | Trivial dashboard navigation |
| A12 | Gmail/Google "sign out all devices" menu wording | Recipe 9 | Menu labels drift; capability itself is stable |

## Open Questions (RESOLVED — each answered by a plan task: Q1→01-01 T3 full-history scan; Q2→01-03/01-04 hostloom discovery step + risk-acceptance path; Q3→01-04/01-05 synced-copy sweep rows; Q4→01-03 key-shape prefix greps)

1. **Does the git history already contain secrets?**
   - What we know: `.odt` was gitignored from the start; repo contains only planning docs; git status clean.
   - What's unclear: whether any early commit pasted a value into a planning doc.
   - Recommendation: the full-history gitleaks scan is a Phase 1 task with report as evidence; if findings → `git filter-repo` rewrite (repo is young, no remotes of consequence yet).
2. **Hostloom exact panel URLs and 2FA availability.**
   - What we know: cPanel-class host; generic cPanel paths documented.
   - Recommendation: checklist row includes a "discover + record panel URL (no creds)" sub-step; mark 2FA "if offered, else note unavailable" — the ROADMAP minimum lists "hosting" for 2FA, so if hostloom offers none, record that as a risk-acceptance line for CEO sign-off.
3. **Where exactly the .odt has synced copies** (which cloud accounts, backups).
   - Only the CEO knows; the sanitization checklist includes a guided sweep list (Downloads, cloud folders, trash, email attachments).
4. **9Router config location on this machine** — sweep step uses a home-directory grep, so an unknown path is still caught by prefix search.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| curl | all API probes | ✓ | 8.5.0 (smtps/imaps supported) | — |
| git | hooks, history scan | ✓ | 2.43.0 | — |
| unzip | ODT verification | ✓ | 6.00 | `python3 -m zipfile` |
| LibreOffice | ODT sanitization | ✓ | 24.2.7.2 | — |
| node | dotenv loader (Phase 2) | ✓ | 22.23.1 | — |
| gitleaks | SEC-03 | ✗ | — | **Install step is a Phase 1 task** (binary release or brew or docker) |
| trufflehog | optional verified sweep | ✗ | — | Optional; binary release, or skip (401 probes remain primary evidence) |
| pre-commit (framework) | optional hook runner | ✗ | — | Not needed — plain `.git/hooks` script recommended |
| pnpm | Phase 2 loader | ✗ | — | Out of scope for Phase 1 (vault pattern only) |
| Password manager | unique values, backup codes | unknown | — | **Blocking-adjacent:** checklist must name one (CEO's choice); uniqueness attestation depends on it |

**Missing dependencies with no fallback:** none blocking — gitleaks install is itself a phase task.
**Missing dependencies with fallback:** trufflehog (optional), pre-commit framework (plain hook instead).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | none (ops phase — command-based verification, no unit tests) |
| Config file | n/a |
| Quick run command | `gitleaks git --pre-commit --staged --redact` |
| Full suite command | `gitleaks git --redact -v` (full history) + vault presence checks |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC-01 | Every inventory item rotated & old value dead | manual-only (CEO probes) + evidence review | evidence table completeness check: every row has probe timestamp + observed code | ❌ Wave 0: evidence template |
| SEC-02 | No plaintext secret; vault pattern in place | smoke | `git check-ignore .env && test -f .env.example && gitleaks dir . --redact` | ❌ Wave 0: scaffold files |
| SEC-03 | Scan runs on every commit and passes clean | integration | canary-commit self-test (hook blocks) + `gitleaks git --redact -v` exits 0 | ❌ Wave 0: hook script |
| SEC-04 | Sanitized copy clean; original out of git/sync | smoke | `unzip -p <sanitized> content.xml \| grep -icE '<pattern-list>'` = 0; `git log --all --name-only \| grep -ci odt` = 0 | ❌ Wave 0: sanitize procedure doc |

Manual-only justification for SEC-01: probes require old secret values that must never enter agent-visible automation — CEO executes, evidence table is the machine-checkable artifact.

### Sampling Rate
- **Per task commit:** pre-commit gitleaks (automatic once hook lands)
- **Per wave merge:** `gitleaks git --redact -v` full history
- **Phase gate:** all four SEC checks above green + every evidence row ✅ before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `scripts/hooks/pre-commit` + `git config core.hooksPath` — covers SEC-03
- [ ] `.env.example`, `.gitignore` additions — covers SEC-02
- [ ] `evidence/ROTATION-EVIDENCE.md` template — covers SEC-01
- [ ] gitleaks binary install — covers SEC-02/03 commands

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Unique per-service passwords (manager-generated), TOTP 2FA (RFC 6238), backup codes stored offline |
| V3 Session Management | yes | Sign-out-everywhere after every password change; WP "Log Out Everywhere Else" + salt rotation |
| V4 Access Control | partial | Scoped tokens preferred over global keys (narrow re-issue deferred to Phase 7 per CONTEXT) |
| V5 Input Validation | no | No code surface this phase |
| V6 Cryptography | yes (indirect) | Never hand-roll: TOTP via standard apps; probes over TLS only (smtps/imaps/https) |
| V14 Configuration | yes | Secrets in gitignored `.env`; scanner as config-drift detector |

### Known Threat Patterns for this phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Credential stuffing via reused passwords | Spoofing | Unique values per service + 2FA (the phase's core purpose) |
| Session persistence post-rotation | Spoofing | Global sign-out + app-password revocation + salt rotation |
| Secret re-entry into repo/prompts | Information Disclosure | gitleaks hook (fail-closed), `--redact`, agent deny-rules, status-code-only evidence |
| Residual document copies | Information Disclosure | Zip-level verification + cloud-sync sweep + `*.odt` ignore |
| Attacker persistence (forwarding rules, rogue admins, extra API keys) | Elevation of Privilege | Each recipe's "Also check" step: forwarding rules, user lists, unknown keys |

## Sources

### Primary (HIGH confidence — official docs, tool-verified)
- npm registry — dotenv 17.4.2, dotenv-cli 11.0.0, postinstall-null, package-legitimacy OK verdicts (verified 2026-07-05)
- [gitleaks README](https://github.com/gitleaks/gitleaks) — pre-commit hook config, command modes, baseline, .gitleaksignore, install methods (fetched)
- [Cloudflare: Roll tokens](https://developers.cloudflare.com/fundamentals/api/how-to/roll-token/), [account token verify API](https://developers.cloudflare.com/api/resources/accounts/subresources/tokens/methods/verify/), [2FA setup](https://developers.cloudflare.com/fundamentals/user-profiles/2fa/) (fetched/search-verified)
- [Ollama cloud authentication](https://docs.ollama.com/api/authentication) — keys page, base URL, Bearer format (fetched)
- Local environment probe — curl/git/unzip/LibreOffice/node versions; gitleaks/trufflehog/pnpm absent (executed 2026-07-05)

### Secondary (MEDIUM confidence — official pages via search, cross-checked)
- [OpenAI: Incorrect API key](https://help.openai.com/en/articles/6882433-incorrect-api-key-provided), [error codes](https://developers.openai.com/api/docs/guides/error-codes)
- [OpenRouter management API keys](https://openrouter.ai/docs/guides/overview/auth/management-api-keys) (fetched), key-endpoint doc titles
- [NVIDIA API key docs](https://docs.nvidia.com/nemo/retriever/latest/extraction/api-keys/), [build.nvidia.com keys page](https://build.nvidia.com/settings/api-keys)
- [Apify API integration (token rotation, 24h grace)](https://docs.apify.com/platform/integrations/api)
- [OpenCode Zen docs](https://opencode.ai/docs/zen/)
- [Google app passwords](https://support.google.com/accounts/answer/185833), Workspace 2SV docs
- [Microsoft two-step verification](https://support.microsoft.com/en-us/account-billing/how-to-use-two-step-verification-with-your-microsoft-account-c7910146-672f-01e9-50a0-93b4585e7eb4), sign-out-all Q&A
- Namecheap KBs: [TOTP 2FA (10073)](https://www.namecheap.com/support/knowledgebase/article.aspx/10073/45/), [enable/disable 2FA (9253)](https://www.namecheap.com/support/knowledgebase/article.aspx/9253/45/), [Private Email password (1053)](https://www.namecheap.com/support/knowledgebase/article.aspx/1053/2215/), [Private Email 2FA (10195)](https://www.namecheap.com/support/knowledgebase/article.aspx/10195/2179/), [compromised mailbox (10729)](https://www.namecheap.com/support/knowledgebase/article.aspx/10729/93/)
- [WordPress application passwords](https://developer.wordpress.org/advanced-administration/security/application-passwords/), [reset password](https://wordpress.org/documentation/article/reset-your-password/)
- Scanner comparisons: [rafter.so](https://rafter.so/blog/secrets/secret-scanning-tools-comparison), [jit.io](https://www.jit.io/resources/appsec-tools/trufflehog-vs-gitleaks-a-detailed-comparison-of-secret-scanning-tools), [devsecops.ae 2026 comparison](https://devsecops.ae/secrets-scanners-comparison-2026/)
- Monorepo env patterns: [pnpm workspaces](https://pnpm.io/workspaces), community monorepo-env writeups (cross-checked)
- ODT structure: [opensource.com — How ODT files are structured](https://opensource.com/article/22/8/odt-files)
- [9Router GitHub](https://github.com/decolua/9router) — local-gateway architecture

### Tertiary (LOW confidence — flagged inline)
- Exact rejection codes for NVIDIA revoked keys, Cloudflare Global API Key, Ollama revoked keys (acceptance rule tolerates any 4xx auth rejection)
- Hostloom-specific panel paths (generic cPanel KBs used)

## Metadata

**Confidence breakdown:**
- Per-service rotation paths: HIGH/MEDIUM — all verified against current official docs this session; a few menu labels ASSUMED and flagged
- Dead-key probe endpoints: HIGH for OpenAI/Apify/Cloudflare/Ollama; MEDIUM for OpenRouter/NVIDIA/OpenCode (endpoints cited, exact revoked-status codes undocumented — acceptance rule compensates)
- Scanner choice + wiring: HIGH — README-verified snippets, cross-source comparison
- Vault pattern: MEDIUM — conventions cross-verified; Claude Code deny-rule semantics to confirm at execution
- ODT sanitization: HIGH — container structure verified; LibreOffice available locally

**Research date:** 2026-07-05
**Valid until:** 2026-08-05 (provider dashboard paths drift; re-verify menu paths if execution slips a month)
