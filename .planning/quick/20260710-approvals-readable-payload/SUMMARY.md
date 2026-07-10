---
task: approvals-readable-payload
type: quick
status: complete
completed: 2026-07-10
author: Fable 5 (inline)
---

# SUMMARY — Onay kartları okunur payload

Onay kartlarındaki ham JSON blokları kaldırıldı; her alan etiketli okunur satır (bilinen 20 alan sözlükten en+tr, bilinmeyen alanlar prettify, `_eur` alanları para formatı). Ham JSON denetim amaçlı "Technical detail (JSON)" disclosure'ı arkasında yaşıyor; orta risk satırlarında tüm detay "Details/Detay" arkasında (spec §4 medium=expandable korundu; high=full payload visible ruhu korundu — içerik tam, format okunur).

## Doğrulama

- ✓ Build: "✓ Compiled successfully in 25.0s"
- ✓ Playwright (CEO hesabı): /approvals'ta görünür JSON blok sayısı **0**; okunur satırlar ekranda (screenshot: approvals-readable.png → references/)
- ✓ i18n paritesi: en 172 / tr 172 anahtar eş (fields haritası dahil)
- ⚠ UNVERIFIED — CEO gözü (sayfanın genel görsel lüks seviyesi ayrı iş; bu task yalnız JSON→okunur dönüşümü)
