# Credential Rotation Checklist (CEO-executed)

This is the document you (the CEO) follow mechanically to rotate every leaked credential and prove the old value is dead. Every step is written in simple English. Every step that is a trapdoor, an ordering constraint, an irreversible action, or otherwise ambiguous carries a line starting with `TR:` in Turkish directly underneath it — read those lines before acting.

Each service section ends with the evidence row IDs (`CRED-NN`) you fill in `evidence/ROTATION-EVIDENCE.md`. Do not tick a row without running its probe.

## 0. Before you start

1. Install/open a password manager. Every new value you create in this checklist must be **unique per service** — never reuse a password or key across two services. Password reuse is the root cause this phase fixes.
2. Pick **one** TOTP app (Aegis, 2FAS, or your password manager's built-in TOTP) and use it for every 2FA enrollment below. Save every backup-code set into the password manager as you go.
3. Universal probe hygiene — applies to every probe in this document:
   - Open a terminal and check `echo $HISTCONTROL` shows `ignoreboth` (keeps the next command out of history).
   - Capture the old value with a **leading-space** export, e.g. ` export OLD='<old value>'` (the leading space keeps it out of bash history).
   - Run the probe for that service (see each section below) using `$OLD`.
   - Record **only** the status code / error phrase and the UTC time (`date -u`) into the matching evidence row. Never the value itself.
   - `unset OLD` and close the terminal.
   - The old value must never be typed into a file, a chat, or an agent conversation.
4. **Acceptance rule:** the gate is "old value no longer authenticates." That is HTTP `401` for most APIs, but any documented auth-rejection (`403`, `400`-with-auth-error, SMTP `535`, "login rejected") satisfies it — record whatever you actually observe, even if it differs from the EXPECT line below.

TR: Eski şifre veya anahtar değerini asla bir dosyaya, sohbete veya ajan (agent) bağlamına yazmayın — sadece kendi terminalinizde kullanın, prova bitince `unset` yapıp terminali kapatın.

## 1. Google (recovery hub first)

Google controls recovery for several other accounts, so it goes first.

1. **Before changing the account password**, copy the OLD app password into your probe terminal: ` export OLD_APP='<old app password>'`.
2. Change the account password: myaccount.google.com → Security → Password. This automatically revokes ALL app passwords — the app-password rotation is free once you do this.
3. Enroll TOTP 2FA (same sitting): Security → 2-Step Verification → Authenticator app → save the backup codes into your password manager.
4. Sign out everywhere: Security → Your devices → sign out unrecognized/all other sessions.
5. Re-issue a fresh app password only if some legacy client still needs one: myaccount.google.com/apppasswords.

TR: Şifreyi değiştirmeden ÖNCE eski uygulama şifresini prob terminaline kopyalayın — şifre değişikliği tüm uygulama şifrelerini otomatik iptal eder; bu adım atlanırsa prova imkansız hale gelir.
TR: Hesap şifresini değiştirmek geri alınamaz bir işlemdir — tüm eski uygulama şifrelerini anında ve kalıcı olarak iptal eder.

**Prove dead — old app password (SMTP AUTH):**

```probe
  curl -sS --url "smtps://smtp.gmail.com:465" \
    --user "<gmail address>:$OLD_APP" \
    --mail-from "<gmail address>" --mail-rcpt "<gmail address>" \
    -T /dev/null ; echo "curl exit: $?"
  # EXPECT: failure with SMTP "535-5.7.8 Username and Password not accepted" (curl exit 67) [MEDIUM]
```

**Prove dead — old account password:** private/incognito window → accounts.google.com → sign in with the old password → expect "Wrong password" rejection. Record timestamp + "login rejected" (describe the screen; no screenshot with values).

Evidence: `CRED-01`.

## 2. Microsoft Hotmail accounts (×2)

Repeat everything below for **each** of the two Hotmail accounts.

1. account.microsoft.com → Security → Change password (unique per account — no reuse between the two accounts).
2. 2FA/TOTP: Security → Advanced security options → Add a new way to sign in or verify → Use an app → save the recovery code into your password manager.
3. Sign out everywhere: Security → Advanced security options → "Sign me out" / "Logout from All Locations".
4. Note: the password change with 2FA on auto-disables old Microsoft app passwords — an "App Passwords Need to Be Updated" email is expected and benign.

TR: Her iki Hotmail hesabı için de FARKLI ve benzersiz şifreler kullanın — aynı şifreyi iki hesapta kullanmayın.

**Prove dead (per account):** private window → `login.live.com` → old password → expect "Your account or password is incorrect." Record timestamp + rejection — one row per account.

**Also check:** mailbox forwarding rules and connected apps for attacker persistence (Settings → Mail → Forwarding; Security → Manage sign-in activity).

Evidence: `CRED-02` (account 1), `CRED-03` (account 2).

## 3. Namecheap dashboard

1. namecheap.com → Profile → Security → change account password.
2. Profile → Security → Access → Two-Factor Authentication → Enable → TOTP → save backup codes.

TR: Menü adları sağlayıcıya göre değişebilir — Profil > Güvenlik altında tam yolu kendiniz keşfedin, ekran metniyle burada yazılı olmayabilir.

**Prove dead:** private window → namecheap.com sign-in → old password → expect rejection. Record timestamp.

Evidence: `CRED-04`.

## 4. Namecheap Private Email (×2 — support@, sales@)

Repeat for **each** mailbox.

1. Log out of webmail and any mail clients FIRST — an active session can block the password reset.
2. Change password via privateemail.com webmail → Settings → Basic settings → Change Password ("Change password and sign out"), or via the Namecheap dashboard mailbox management.
3. Enable 2FA on each mailbox (Private Email supports its own 2FA).

TR: Şifreyi değiştirmeden önce webmail/posta istemcilerinden çıkış yapın — açık bir oturum şifre sıfırlamayı engelleyebilir.

**Prove dead (per mailbox):**

```probe
  curl -sS --url "imaps://mail.privateemail.com:993" \
    --user "support@<domain>:$OLD" -X "LOGOUT" ; echo "curl exit: $?"
  # EXPECT: authentication failure (curl exit 67) [MEDIUM — host name from Namecheap client-config KB]
```

Or: privateemail.com login with the old password → expect rejection.

Evidence: `CRED-05` (support@), `CRED-06` (sales@).

## 5. Cloudflare (agent token + legacy user token + Global API Key)

Three distinct credentials — handle all three that apply.

**a) Account-owned (agent) token:** dash.cloudflare.com → account → Manage Account → API Tokens → three-dot menu → Roll (or delete outright).

```probe
  curl -sS -o /dev/null -w "%{http_code}\n" \
    "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/tokens/verify" \
    -H "Authorization: Bearer $OLD"
  # EXPECT: 401 (verify endpoint reports active/disabled/expired for valid tokens; rolled-away secrets fail auth)
```

Evidence: `CRED-07`.

**b) Legacy user token:** My Profile → API Tokens → three-dot → Roll (or Delete).

```probe
  curl -sS -o /dev/null -w "%{http_code}\n" https://api.cloudflare.com/client/v4/user/tokens/verify \
    -H "Authorization: Bearer $OLD"
  # EXPECT: 401
```

Evidence: `CRED-08`.

**c) Global API Key** — only if it ever appeared in the leaked doc (it authorizes everything): My Profile → API Tokens → Global API Key → View/Change.

```probe
  curl -sS -o /dev/null -w "%{http_code}\n" https://api.cloudflare.com/client/v4/user \
    -H "X-Auth-Email: <account email>" -H "X-Auth-Key: $OLD"
  # EXPECT: 400 or 403 with auth error (legacy key auth rejects with 400-class, not always 401) [LOW on exact code]
```

TR: Global API Key sadece sızan belgede göründüyse döndürülür — göründüyse yukarıdaki adımları uygulayın; görünmediyse kanıt tablosunda DEAD? hücresine "N/A (reason)" yazın, boş bırakmayın.

Evidence: `CRED-09` (write `N/A (reason)` in the DEAD? column if this key never appeared in the leaked doc).

**2FA:** dash.cloudflare.com → My Profile → Authentication → Two-Factor Authentication → Set up → Mobile App Authentication → Add → scan QR with your TOTP app → download backup codes.

**Also check:** active sessions if the dashboard exposes them.

## 6. Hosting — hostloom

Hostloom is a small cPanel-class host; two separate credentials likely exist.

1. Client-area/billing portal password: change via the client area profile page.
2. cPanel password: cPanel → Preferences → Password & Security → requires old password (changing it ends the current session). If cPanel offers Two-Factor Authentication (Security section), enable it.
3. This password often doubles as FTP/SSH/webmail for the primary account — assume all rotate together.

TR: Host 2FA sunmuyorsa bunu kanıt satırına bir risk kabul notu olarak yazın — panel URL'lerini keşfedin ama hiçbir kimlik bilgisini buraya yazmayın.

**Prove dead:** private window → `https://<host>:2083` (cPanel) → old password → expect rejection. Same for webmail `:2096` if used. Record timestamp + rejection.

**Also check:** discover and note the exact panel URLs (no credentials) — the checklist above only has generic cPanel paths. If hostloom offers no 2FA, write that as a risk-acceptance line in the evidence row's Action column.

Evidence: `CRED-10` (client-area), `CRED-11` (cPanel).

## 7. WordPress — outleteuro

1. wp-admin → Users → Profile → Set New Password → Update Profile. This logs out other sessions; also click "Log Out Everywhere Else".
2. Application passwords: same profile screen → Application Passwords section → Revoke all.
3. Rotate WP salts (`AUTH_KEY` … `NONCE_SALT` in wp-config.php, via hosting file manager or the salt generator) — force-invalidates every auth cookie, including any attacker's.
4. Audit the Users list for unknown administrators.

TR: WP tuzlarını (salt) döndürmek geri alınamaz bir işlemdir — tüm oturum çerezlerini, saldırganınki dahil, anında ve kalıcı olarak geçersiz kılar.

**Prove dead (admin password):** private window → `https://<site>/wp-login.php` → old password → expect a login error. Record timestamp + rejection.

**Prove dead (old application password, if its value is still available):**

```probe
  curl -sS -o /dev/null -w "%{http_code}\n" \
    --user "<admin-username>:$OLD_APP_PW" "https://<site>/wp-json/wp/v2/users/me"
  # EXPECT: 401
```

**Also check:** the audited Users list for rogue admins.

Evidence: `CRED-12` (admin password), `CRED-13` (application passwords).

## 8. API keys — OpenAI, OpenRouter, NVIDIA Build, Apify, Ollama cloud, OpenCode Zen

### OpenAI

Rotate: platform.openai.com → API keys → create the replacement key first (store in password manager) → Revoke the leaked key.

```probe
  curl -sS -o /dev/null -w "%{http_code}\n" https://api.openai.com/v1/models \
    -H "Authorization: Bearer $OLD"
  # EXPECT: 401
```

**Also check:** other keys listed on the same page (delete any unknown/unused ones); usage page for unexplained spend since the leak.

Evidence: `CRED-14`.

### OpenRouter

Rotate: openrouter.ai dashboard → key settings → create the replacement first, then delete the leaked key.

```probe
  curl -sS -o /dev/null -w "%{http_code}\n" https://openrouter.ai/api/v1/key \
    -H "Authorization: Bearer $OLD"
  # EXPECT: 401  (GET /api/v1/key returns info about the presented key; deleted key cannot authenticate)
```

TR: OpenRouter'ın herkese açık `/api/v1/models` uç noktasını ASLA prob için kullanmayın — kimlik doğrulaması olmadan bile 200 döner ve yanlış bir "hâlâ çalışıyor" sonucu verir; sadece yukarıdaki `/api/v1/key` uç noktasını kullanın.

**Also check:** credit balance/activity for unexplained usage.

Evidence: `CRED-15`.

### NVIDIA Build

Rotate: build.nvidia.com → Settings → API Keys → Action menu → Rotate (or delete).

```probe
  curl -sS -o /dev/null -w "%{http_code}\n" https://integrate.api.nvidia.com/v1/chat/completions \
    -H "Authorization: Bearer $OLD" -H "Content-Type: application/json" \
    -d '{"model":"meta/llama-3.1-8b-instruct","messages":[{"role":"user","content":"x"}],"max_tokens":1}'
  # EXPECT: 401 (exact code for revoked nvapi- key not officially documented — accept any 4xx auth rejection) [LOW on exact code]
```

Evidence: `CRED-16`.

### Apify

Rotate: console.apify.com → Settings → API & Integrations → token actions → Rotate.

**⚠ TRAPDOOR:** rotation offers to keep the old token valid for a 24-hour grace period. Choose **immediate invalidation** (decline the grace period). If grace was accepted instead, the 401 probe only passes after 24h — do not panic if you see a 200 during that window, schedule the probe for T+24h. Either way, replace the `grace=__PENDING__` placeholder in the CRED-17 row's Action cell with exactly `grace=declined`, or `grace=accepted; probe_after_24h=yes` once the delayed probe has run.

TR: Apify rotasyonunda 24 saatlik "grace" (nezaket) penceresini REDDEDİN — kabul ederseniz eski anahtar 24 saat daha çalışır ve prob 200 dönebilir; panik yapmayın, T+24 saatte tekrar deneyin ve CRED-17 satırındaki `grace=__PENDING__` yerine `grace=declined` veya `grace=accepted; probe_after_24h=yes` yazın.

```probe
  curl -sS -o /dev/null -w "%{http_code}\n" https://api.apify.com/v2/users/me \
    -H "Authorization: Bearer $OLD"
  # EXPECT: 401
```

Evidence: `CRED-17` (Action cell: `grace=declined` or `grace=accepted; probe_after_24h=yes`).

### Ollama cloud

Rotate: ollama.com → account settings → Keys → revoke leaked key, create replacement.

```probe
  curl -sS -o /dev/null -w "%{http_code}\n" https://ollama.com/api/generate \
    -H "Authorization: Bearer $OLD" -H "Content-Type: application/json" \
    -d '{"model":"gpt-oss:120b","prompt":"x","stream":false}'
  # EXPECT: 401 (documented authenticated endpoint; exact revoked-key code not documented — accept 4xx auth rejection) [MEDIUM]
```

Evidence: `CRED-18`.

### OpenCode (Zen)

Rotate: sign in at opencode.ai/auth → API keys → delete leaked key / Create API Key for replacement.

```probe
  curl -sS -o /dev/null -w "%{http_code}\n" https://opencode.ai/zen/v1/chat/completions \
    -H "Authorization: Bearer $OLD" -H "Content-Type: application/json" \
    -d '{"model":"claude-sonnet-4-5","messages":[{"role":"user","content":"x"}],"max_tokens":1}'
  # EXPECT: 401 [MEDIUM — endpoint shape cited from docs; revoked-key code undocumented]
```

**Also check:** the local opencode CLI stores auth on disk — swept in Section 11.

Evidence: `CRED-19`.

TR: Her anahtarı iptal etmeden önce yenisini oluşturun — sırayı değiştirmek erişim kaybına yol açabilir.

## 9. 9Router — local config sweep

**Reframe:** 9Router is a self-hosted local gateway running on this machine — it stores OTHER providers' keys/OAuth cookies in its local config. There is no cloud dashboard token to revoke for 9Router itself.

1. Rotate the upstream providers first (Sections 3, 5, 8 — 9Router only ever held copies of those).
2. Open the 9Router dashboard and re-enter/refresh the provider credentials.
3. Sweep its local config directory for old key strings so stale copies don't linger on disk (see Section 11's prefix-grep sweep).

TR: 9Router bulutta değil bu makinede yerel bir yazılımdır — döndürülecek bulut anahtarı yoktur; önce üst sağlayıcıları döndürün, sonra 9Router panelinde kimlik bilgilerini yeniden girin ve yerel yapılandırma klasörünü eski anahtar dizeleri için tarayın.

**Prove dead:** covered by the upstream providers' probes above (Sections 3, 5, 8) — there is no separate 9Router probe.

Evidence: `CRED-20` (DEAD? column already reads `N/A (local software)` in the template; fill Action with "swept + providers re-authed" once done).

## 10. Linux sudo password (laptop)

1. Terminal: `passwd` → set a new unique password (store it in the password manager).
2. Prove dead: new terminal → `sudo -K` (drop cached credentials) → `sudo true` → type the OLD password → expect `Sorry, try again.` → Ctrl-C → then `sudo true` with the NEW password succeeds.
3. Also: if full-disk-encryption or the login keyring shares this password, update both (`gnome-keyring` prompts on next login).

TR: Şifreyi değiştirmeden önce yeni şifreyi parola yöneticinize kaydedin — yeni terminalde kilitlenmemek için önce eski şifrenin reddedildiğini doğrulayın, sonra yeni şifrenin çalıştığını test edin.

Evidence: `CRED-21` (Observed: "old password rejected at sudo prompt").

## 11. Runtime-state sweep (after all rotations)

Once every rotation above is done, sweep for old values that may still live outside the provider dashboards.

1. **Browser/mail-client saved logins:** update every saved password in your browser and mail client (e.g. Thunderbird) to the new values; delete stale saved entries. Mark `ATT-02` Status `DONE` in `evidence/ROTATION-EVIDENCE.md`, Notes = nothing sensitive (a short note is fine, no values).
2. **Tool configs — re-auth and prefix-sweep:** re-authenticate 9Router, the opencode CLI, and any Claude Code/MCP tool configs with the new values, then sweep for leftover old-key prefixes:

```bash
grep -rlI 'sk-\|sk-or-\|nvapi-\|apify_api_' ~/.config ~/.local/share ~/.claude* 2>/dev/null
```

   Update or delete anything the sweep finds. Mark `ATT-03` Status `DONE`, Notes = the file paths found (paths only, never values).
3. **Shell rc/history scrub:** check whether an old value was ever typed without a leading space:

```bash
grep -nE 'sk-|nvapi-|apify_api|API_KEY=' ~/.bashrc ~/.profile
```

   Scrub any hits, and if a value was ever typed into the shell, truncate history: `history -c` (then start a new session). Mark `ATT-04` Status `DONE`.
4. **Stray `.env` files:**

```bash
find ~ -maxdepth 4 -name '.env*' -not -path '*/node_modules/*' 2>/dev/null
```

   Update any hits to the new values or delete them — the repo-root `.env` becomes the single source going forward. Mark `ATT-05` Status `DONE`, Notes = the file paths found.
5. **Uniqueness attestation:** once every new value above has been generated by the password manager and confirmed unique per service, mark `ATT-01` Status `YES`.

TR: Her süpürme maddesi tamamlandığında ilgili ATT satırının Status hücresine tam olarak "DONE" (veya ATT-01 için "YES") yazın — Notes hücresine sadece dosya yolları yazın, asla bir değer yazmayın.

When Sections 1-11 and this sweep are all done, resume plan 01-04 — the builder verifies the evidence table and commits it.
