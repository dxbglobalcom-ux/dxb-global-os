---
phase: 08-ceo-dashboard-crm
plan: 06
status: complete
completed: 2026-07-10
commits: [f11fdcf, 35167aa]
requirements: [DASH-04]
author: Fable 5 (inline)
---

# 08-06 SUMMARY — CRM cockpit (4 entity, alan-kısıtlı CEO düzenleme)

## Sonuçlar

| İş | Durum | Kanıt |
|---|---|---|
| Task 1: EntityTable/EntityForm + 4 entity sayfası + sub-nav | ✓ VERIFIED | build: /crm + 4 alt route derlendi; katalog paritesi 145/145; DENSITY 5 tablo-önce (kart galerisi yok) |
| Task 2: crm_update kapısı + whitelist testleri + purity allowlist | ✓ VERIFIED | 39/39 PASS — whitelist iki katmanda pinli (zod strip + DB RAISE), UPDATE grant'ı YOK kanıtı, izinli edit persist + audit 1:1, enum CHECK kapıdan geçerken uygulanıyor, provenance türetimi |
| Migration 0017 lokal DB'de | ✓ VERIFIED | psql: anon exec=f, authenticated exec=t, crm_clients direct UPDATE=f |
| UI/RLS paritesi | ✓ VERIFIED (yapısal) | Hiç UPDATE grant'ı yok → her direct kolon yazımı reddedilir; UI whitelist'i DB fonksiyon whitelist'inin aynası, test diff'le pinli |
| Görsel doğrulama (tablo/side-panel/mobil 375px stacked) | ⚠ UNVERIFIED | GUI — wave-3 sonu Playwright turu (sıradaki adım) |

## Sapmalar / uyarlamalar (kayıtlı)

| # | Uyarlama | Gerekçe |
|---|---|---|
| 1 | Provenance = audit_log son yazar türetimi; kolon EKLENMEDİ | Plan "no new CRM schema" ile "writer fields" istiyordu — writer kolonu şemada hiç yoktu, crm.* MCP hâlâ stub. Audit trail = gerçek kaynak; ajan yazımları Phase 10'da kendi audit satırlarıyla gelince chip otomatik doğru kalır |
| 2 | Yazım kapısı kolon-grant'lı RLS değil DEFINER fonksiyon (0015 deseni) | Parite yapısal olur (grant yok = sapma imkânsız), audit aynı transaction'da, allowlist tek dosya |
| 3 | Sıralama sabit created_at desc; sort toggle eklenmedi | 50-satır sayfalama + filtre chip'leriyle DENSITY 5 ihtiyacı karşılanıyor; sort toggle = 08-07 polish adayı, fake kapsam şişirmesi yapılmadı |
| 4 | `/crm` kök sayfası clients'a redirect + `entity-view.tsx` ortak kompozisyon | 4 sayfa ince config kalsın diye |
| 5 | Purity allowlist 3 dosya (approvals, intent, crm) | Plan "4 yol" sayıyordu — audit append'ler DEFINER fonksiyonların içinde, ayrı dashboard dosyası yok; enumerated yazım-yolu kavramı aynen korunuyor |

## Not

Cockpit konsolundaki TÜM RSC 404'leri kapandı (route seti tamam: /approvals, /costs, /crm/*, /tasks/[id]). Wave 3 bitti — sırada wave-3 toplu Playwright görsel turu + 08-07 (kapanış/polish).
