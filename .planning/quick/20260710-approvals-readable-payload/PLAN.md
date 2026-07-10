---
task: approvals-readable-payload
type: quick
created: 2026-07-10
author: Fable 5 (inline)
status: executing
---

# Quick Task — Onay kartlarında çıplak JSON'un kaldırılması

## Gerekçe

CEO canlı incelemede (2026-07-10 ~16:00) Approvals sayfasını gördü: onay kartlarının içinde ham JSON blokları ("memo", "recipient", "amount_eur"...) — CEO'ya teknik veri gösterilmez, cockpit iç sayfaları görsel hizalama işinin (Task 2) ilk ve en acil parçası.

## Değişiklik

- `approval-card.tsx`: `PayloadView` ham `<pre>{JSON}` yerine etiketli okunur satırlar (`<dl>`) — bilinen alanlar sözlükten (approvals.fields, en+tr), bilinmeyen alanlar prettify (snake_case → kelime). `_eur` alanları para formatında. Ham JSON denetim için `<details>` arkasında durur ("Technical detail (JSON)" / "Teknik ayrıntı (JSON)"). Orta risk satırlarında tümü "Details/Detay" disclosure'ı arkasında (spec §4 medium=expandable korunur).
- `page.tsx`: `fields` + `details` metin geçişi.
- i18n: `approvals.fields` (20 etiket), `approvals.details`, `approvals.payload` yeniden adlandırma — en+tr eş.

## Doğrulama

1. Build yeşil.
2. Playwright: CEO hesabıyla giriş → /approvals screenshot — JSON blokları görünmez, okunur satırlar görünür.
3. i18n paritesi eş.
4. CEO gözü = ⚠ UNVERIFIED kalem.
