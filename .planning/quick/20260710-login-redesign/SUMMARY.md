---
task: login-redesign
type: quick
status: complete
completed: 2026-07-10
author: Fable 5 (inline)
---

# SUMMARY — Login Redesign "Golden Threshold"

## Ne değişti

| Dosya | Değişiklik |
|---|---|
| `apps/dashboard/src/components/shell/app-shell.tsx` | DxbMark: eğri uydurma sembol → altın dikey bar/skyline mark (CEO yönü; shell + login tek kaynak) |
| `apps/dashboard/src/app/(auth)/login/page.tsx` | Tek kart + boş ekran düzeni kaldırıldı → split-scene: sol katmanlı marka atriyumu (çift katman özgün skyline çizgi-sanatı, spire + beacon, yükseltilmiş ufuk + ışık süpürmesi + yansıma, şampanya key light), sağ rafine form paneli (altın dikiş, uppercase micro etiketler, surface-3 alanlar). Auth mantığı AYNEN korundu (AM-08-AUTH-1 password-only dahil) |
| `apps/dashboard/src/app/globals.css` | Login sahne keyframe'leri (skyline-draw, horizon-sweep, login-rise) + Chrome autofill düzeltmesi (mavi-beyaz alan → token yüzeyi) |
| `apps/dashboard/messages/en.json` + `tr.json` | `login.tagline`, `login.taglineSub`, `brand.holding` — EN birincil, TR tam eş |

## Sanat yönetimi kararları (RET şikayetlerine karşılık)

1. **Jenerik tek kart** → split-scene kompozisyon; arka plan artık boş değil: iki katmanlı skyline (uzak katman her genişliğe uzanır — 3440 ultrawide letterbox yok, A1.2), ufuk çizgisi, spire aurası.
2. **Kahverengi glow** → kaldırıldı; kalibrasyon kuralı koda comment olarak gömüldü: geniş düşük-alfa altın fill yasak, ince parlak çizgi + sıkı highlight; şampanya ışığı yüksek-L/düşük-alfa.
3. **Uydurma logo** → DxbMark artık dikey bar/skyline mark; wordmark "DXB Global" hero boyutunda atriyumda.
4. **Boş ekran** → mobilde de alt siluet bandı + ufuk çizgisi (CEO telefon testi §5.5).

## Doğrulama

- ✓ `pnpm --filter @dxb/dashboard build` — "✓ Compiled successfully", 14/14 route (flag'li final build dahil; `NEXT_PUBLIC_DXB_MFA_ENFORCED=false` BUILD sırasında da verilmek zorunda — runtime start yetmez, aşağıda sapma notu)
- ✓ `node scripts/contrast-audit.mjs` — 14/14 PASS
- ✓ i18n key paritesi — en 151 / tr 151, eksik 0
- ✓ Playwright canlı akış: `eyetest@local.dev` geçici kullanıcısıyla şifre → cockpit yönlendirmesi (kanıt: final URL `http://localhost:3000/`) — CEO hesabına dokunulmadı
- ✓ Screenshot matrisi 1440×900 / 3440×1440 / 390×844 — `.planning/phases/08-ceo-dashboard-crm/references/login-final-*.png`
- ⚠ UNVERIFIED — CEO göz testi (A1.4 "referanstan güzel"): insan gözü gerektirir; yan-yana karşılaştırma sunuldu

## Sapma / öğrenme

- **NEXT_PUBLIC_DXB_MFA_ENFORCED build-time inline'dır.** §5 handover yalnız `start` komutuna flag koyuyordu; `next build` flag'siz koşulursa client bundle MFA branch'ine düşer ve login "Something went wrong" verir (bu oturumda yaşandı, teşhis edildi). 08-VERIFICATION §5 komutu build+start ikilisini birlikte veriyor olmalı — düzeltme bu commit'te.
- Playwright MCP browser'ı `--force-device-scale-factor=1.5` ile açılıyor; viewport CSS-px doğrulaması için `newContext` + 1.5× çarpanlı boyut gerekti (gelecek görsel koşular için not).
- Geçici test kullanıcısı `eyetest@local.dev` doğrulama sonrası DB'den silindi.
