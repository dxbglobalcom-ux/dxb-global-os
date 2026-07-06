# PHASE 01 — Security Baseline & Credential Remediation ✅ KAPALI

**Statü:** Tamamlandı 2026-07-06, hard gate kapandı, CEO onayı 16:21Z (evidence/PHASE-1-GATE-REPORT.md)
**Bu dosya kayıt amaçlıdır** — master plan bütünlüğü için; yeniden iş üretmez.

## 1. Hedef + Kabul Kapısı (karşılandı)

- Sızmış her credential rotate edildi; eski anahtarlar doğrulanmış ölü (401/access-denied kanıtı satır satır kayıtlı)
- 2FA: Gmail, Cloudflare, Namecheap, hosting — CEO onaylı
- Repo/prompt/config'de düz metin secret yok; `.env` vault kalıbı canlı
- gitleaks pre-commit (fail-closed, canary-kanıtlı) + CI; trufflehog verified sweep temiz
- Kaynak .odt credentials bölümü söküldü; sanitize kopya repo'da, orijinal git/cloud dışı

## 2. Kalıcı Miraslar (sonraki fazların üstüne bastığı zemin)

- **Vault kalıbı:** gerçek `.env` repo kökünde, `.gitignore` korumalı; `.env.example` isim kayıt defteri. Yeni her secret önce `.env.example`'a isim olarak eklenir.
- **Agent deny kuralı:** ajan katmanında `.env` okuma reddi tool-layer'da doğrulanmış (A8 spot-check) — sonraki fazlarda Secrets erişimi yalnız Secrets/outbox-executor yoluyla.
- **Tarama disiplini:** her commit gitleaks'ten geçer; bu MASTER-PLAN dahil.
- **Kanıt disiplini şablonu:** 21-satır kanıt tablosu + probe komutlarının bayt-birebir kopyalanması kuralı — sonraki fazların verification bölümleri aynı disiplini kullanır.

## 3–6. (uygulanmaz — faz kapalı)

Tek açık bağ: gitleaks-action `@v2` tag'i remote go-live'da SHA-pin gerektirir (Phase 7 VPS/CI adımlarına taşındı — bkz. PHASE-07 §4).
