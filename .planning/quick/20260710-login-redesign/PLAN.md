---
task: login-redesign
type: quick
created: 2026-07-10
author: Fable 5 (inline — v5 authorship rule)
status: executing
---

# Quick Task — Login Redesign (CEO göz testi RET kapatma)

## Gerekçe

CEO göz testi (2026-07-10 ~13:30) login ekranını REDDETTİ: jenerik tek kart + boş arka plan + kahverengiye kayan glow + uydurma eğri logo sembolü. Kayıt: `memory/phase8-eye-test-verdict-login-fail.md`. Redesign en yüksek öncelik; ölçüt A1.4 — hem reddedilen login'den hem referans görselden açık ara güzel, ÖZGÜN sanat yönetimi (referans şablon değil).

## Sanat yönetimi — "Golden Threshold" (özgün, Fable)

Split-scene giriş: sol tarafta katmanlı marka atriyumu (zengin siyah zemin + özgün altın çizgi-sanat kule silueti + ışık ufku + derinlik katmanları), sağda rafine form paneli. Tek kart + boşluk düzeni tamamen gidiyor.

- **Altın kalibrasyonu:** kahve çamuru YASAK. Büyük düşük-alfa altın fill'ler (çamurun kaynağı) yerine ince parlak çizgiler + sıkı highlight'lar; `--accent` oklch(0.8 0.115 92) çizgi rengi, highlight daha yüksek L.
- **Logo:** eğri sembol çöpe. Yeni `DxbMark`: altın dikey bar/skyline mark (CEO yönü) + "DXB Global" wordmark. Shell dahil her yerde değişir (tek kaynak).
- **Motion:** skyline stroke-draw giriş (bir kez), ufuk çizgisinde yavaş ışık süpürmesi (imza ambient, A1 WebGL/motion izni), mevcut kapı-açılış geçişi korunur; reduced-motion global kill zaten var.
- **Responsive:** ≥1024 split; mobil = üst hero bandı + form; ultrawide letterbox yok (A1.2).
- **i18n:** EN birincil + TR tam eş (A2). Yeni anahtarlar: login.tagline, login.taglineSub (en+tr birlikte).

## Dosyalar

| Dosya | İş |
|---|---|
| `apps/dashboard/src/components/shell/app-shell.tsx` | DxbMark SVG → dikey bar skyline mark |
| `apps/dashboard/src/app/(auth)/login/page.tsx` | Görsel katman yeniden; auth mantığı AYNEN korunur (password-only lokal amendment dahil) |
| `apps/dashboard/src/app/globals.css` | login sahne keyframe/sınıfları |
| `apps/dashboard/messages/en.json`, `tr.json` | tagline anahtarları |

## Doğrulama

1. `pnpm --filter @dxb/dashboard build` yeşil.
2. Playwright: 1440×900 + 3440×1440 + 390×844 screenshot; login akışı (şifre → cockpit) makine-koşusu.
3. Kontrast: form metin/etiket çiftleri mevcut token'larda (audit'li) — yeni ad-hoc renk yok, token dışına çıkılmıyor.
4. CEO göz testi = ⚠ UNVERIFIED kalem; sunumda yan-yana karşılaştırma (RET screenshot + yeni) + giriş bilgileri tek mesajda.
