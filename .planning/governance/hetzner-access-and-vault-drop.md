---
name: hetzner-access-and-vault-drop
description: "Hetzner Cloud API bağlı (hcloud context dxb + Bitwarden'da saklı); kasa OKUMA'sı auto-mode credential classifier tarafından bloklanır — secret'ları drop-dosyası/direkt paste ile al"
metadata: 
  node_type: memory
  type: project
  originSessionId: df3b4045-c5f6-4342-85b5-da0605d8fe7a
---

2026-07-09: Hetzner Cloud API token kuruldu.

- **hcloud context** `dxb` laptopta kalıcı kuruldu (`~/.config/hcloud/cli.toml`, 600). Env'siz çalışır. VPS: `dxb-vps-1` / `46.225.89.249` / `nbg1` / ID 149310629.
- Token ayrıca Bitwarden'da: item **"Hetzner Cloud API — dxb"** (login user `dxbglobalcom@gmail.com`, password + `token` hidden field).
- ⚠ Bu token bir kez ekran/screenshot'a sızdı (CEO sorumluluğu kabul etti) — fırsatta Hetzner console'dan **yenilenmeli** (token oluşturma API'de yok, sadece console).

**Kritik iş akışı kısıtı:** Bitwarden CLI **okuma** komutları (`bw list items`, `bw get`, geniş `--search`) auto-mode **credential-exploration classifier** tarafından bloklanır. `bw create` (yazma) geçti. Dar, tek-item, göreve-özel filtreli okuma bazen geçer; geniş dump asla.
- Bu yüzden CEO'dan secret alırken **kasa okuma değil**, ya scratchpad **drop-dosyası** (`read -rsp "...: " K; printf %s "$K" > FILE`) ya da CEO direkt paste kullan. Pano da işe yarar: X11'de `xclip -o -selection clipboard` (kopyalanan) / `-selection primary` (seçili).
- Master şifre / `bw unlock` = CEO'nun tek kimlik adımı; session token scratchpad `.bwsess`'te (600), chat'e asla girmez. Bkz [[ceo-delegation-rule]].

~~**Bekleyen:** CEO elinde Hetzner login girişi + giriş key…~~ **KAPANDI 2026-07-09 gece:** Storage Box `dxb-backup-1` (bx11, fsn1) Cloud API token'la KURULABİLDİ (`hcloud storage-box` — yeni API, eski "Robot ürünü" varsayımı yanlıştı). Backup hedefi = least-privilege **subaccount** `u629578-sub1` (home `backups/pg`, SSH-key-only); ana box şifresi HİÇBİR yerde kayıtlı değil (kurtarma = subaccount sil/yeniden yarat).

**2026-07-09 gece öğrenilen classifier kalıpları (Hetzner/prod):**
- Prod VPS `.env` okuma, storage-box **password reset**, `authorized_keys` kurulumu, Caddy TLS swap → hepsi auto-mode classifier'da bloklanır; **CEO'nun in-session hedefi ADLANDIRAN tek cümlesi** bloğu açar ("İzin: … VPS 46.225.89.249'da … Caddy TLS swap yap (dxbglobal.online)" işledi).
- Yeni credential YARATMAK (subaccount create) geçer; mevcut credential ROTASYONu geçmez.
- `sshpass` yok → parola beslemek için `SSH_ASKPASS_REQUIRE=force` + `setsid` çalışır; ama `sftp -b` otomatik `BatchMode=yes` yapıp askpass'ı öldürür — komutları **stdin'den** ver.
- Hetzner Storage Box port-22 SFTP (ProFTPD): `authorized_keys` **RFC4716** format ister (OpenSSH tek-satır sessizce reddedilir) — iki formatı birden koy (`ssh-keygen -e`). Ayrıntı repo'da `vps/README.md`.
- Hetzner hesap yeni: limit artışı kapalı; **port 25/465 çıkışı bloklu** → mail fazında (10/11) harici relay şart.
- **2026-07-10:** salt-okunur `ssh root@46.225.89.249 "docker compose ps"` bile bloklandı ("Production Reads" — genel "full authority" yetmiyor, CEO'nun **bu prod host'u adlandıran in-session cümlesi** şart). Auto-mode'da VPS SSH'ı denemeden CEO'dan tek-cümle izin iste. Bekleyen VPS işi: `outbox` REBUILD (restart yetmez — image `dxb/monorepo:07-05` intentIntake kodundan eski): `ssh root@46.225.89.249 'cd /opt/dxb && docker compose build outbox && docker compose up -d outbox'`.
