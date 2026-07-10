---
type: quick
slug: ui-spec-amendment-a1
status: complete
completed: 2026-07-10
author: Fable 5 (inline)
---

# SUMMARY — UI-SPEC Amendment A1

Kayıp session'ın 4 CEO kararı kurtarıldı ve kalıcılaştırıldı.

| İş | Durum | Kanıt |
|---|---|---|
| 08-UI-SPEC.md §1 WebGL izni + §5 ultrawide/TV modu + §9.5 göz testi + §10 Amendment Log | ✓ VERIFIED | `grep -n WebGL 08-UI-SPEC.md` → satır 16 "İZİNLİ (Amendment A1.1)"; A1 izi 10 eşleşme |
| 08-CONTEXT.md WebGL kararı revize | ✓ VERIFIED | `grep -c A1` → 1 eşleşme |
| Kalıcı memory: phase8-design-brief.md A1 bölümü + MEMORY.md index | ✓ VERIFIED | dosyalar güncellendi + governance aynasına kopyalandı |
| Governance ayna senkronu (.planning/governance/) | ✓ VERIFIED | cp tamamlandı, commit'te |

**Kapsam notu:** TV/toplantı modu Faz 8'e yeni gereksinim ekler (mod altyapısı + ana cockpit). Kalan 08 planları execute edilirken karşılanacak; plan revizyonu gerekirse deviation kaydıyla.

## Ek: Amendment A2 (CEO canlı emri 02:40, aynı quick task altında)

| İş | Durum | Kanıt |
|---|---|---|
| UI-SPEC §3 + §10 A2: iki dilli, EN birincil | ✓ VERIFIED | §10 A2 satırı + Fable verdict |
| 08-CONTEXT.md i18n satırı | ✓ VERIFIED | grep "en.json birincil" |
| `lib/i18n.ts` DEFAULT_LOCALE=en, Dictionary=typeof en; root `lang="en"` + metadata EN | ✓ VERIFIED | katalog paritesi 54/54 anahtar, iki yönde eksik 0 (node flatten script) |
| Memory: phase8-design-brief A2 + MEMORY.md + ceo-delegation-rule 4. teyit + ayna senkron | ✓ VERIFIED | cp + commit |

A1 commit: `66bc0f7a4fd068f3aa35f896115e3d806f5121be`
