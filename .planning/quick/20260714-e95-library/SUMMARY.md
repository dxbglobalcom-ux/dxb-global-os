---
status: complete
completed: 2026-07-14
commit: pending (feat(E9.5))
---

# E9.5 — Holding Library: intake + catalog UI + grant→profile compilation — SUMMARY

Roadmap row E9.5 ✓ (IMPLEMENTATION_ROADMAP.md:129). Spec: HOLDING_LIBRARY_SPEC (whole file). Adaptations A1–A8 registered in the spec (CEO-visible section).

## ✓ VERIFIED

| İş | Kanıt |
|----|-------|
| Migration `20260714020000_e95_library.sql` — expires_at (A2), source_ref (A3), v_library_catalog v2, `control_library_action` 4 op (A1 tek kapı; §13 CEO duvarı; idempotency ikizi; §5 change_log fn İÇİNDE; settings kanalı yayınları), `fn_library_usage` trigger (A7) | 2× idempotent uygulandı, exit 0; `\dt library_*` → 4 tablo; fn'ler pg_proc'ta |
| Intake — 352 GERÇEK varlık control fn üzerinden CEO bağlamında (A8) | `--dry-run` tür-başı rapor (sıfır türler açıkça listeli §26); `--apply` sonrası 10 kabul türü ≥1: skill 23 · plugin 18 · tool 21 · mcp 8 · persona 214 · policy 2 · sop 2 · research 8 · report 2 · memory_source 4; change_log 352 = audit 352; re-run planned writes 0 |
| Grant→profil→gateway reddi zinciri (G3, §21) | tests/e9/library 13/13: A4 kesişim (quality yalnız queue_*), §22 geri uyum (sıfır-grant dept bayt-özdeş), employee overlay, revoke→resolveTool/resolveSkill "not found" İKİ bacak; compileLibraryProfiles staging swap + hash-skip + stale temizlik + `profile.recompiled` dxb:system satırı |
| Scheduler `library.profile_recompile` 30 s self-chain (A6) | scheduler.ts worker + bootstrap; tsc -b 0 |
| CANLI derleme gerçek profiles/ dizinine | 21 dept profili + _manifest; 5 ölü-slug dosyası silindi; system olayı DB'de (`departments: 21`) |
| **FOUND+FIXED (kırık = anında düzelt):** Phase-7 policy dosyaları E5.x öncesi registry'ye kilitliydi — generator canlı tabloya karşı ÇALIŞMIYORDU | grants/denials 21 canlı slug'a re-key (SIFIR genişleme; sınıflar fonksiyonla taşındı; _schema'ya kayıt satırı); phase7 suite 30/1skip yeşil (stale runtime testi strategy'ye güncellendi) |
| /ai/library gerçek sayfa (ModuleWaiting ÖLDÜ) + /api/control/library seam + i18n | UI grant CANLI: quality grant id 44 → audit actor=ceo → UI revoke → grants=0; purity PASS 1226=1226; console 0 error |
| **CEO mid-pass yakalaması → anında fix:** 1400–1500 bandında 2-kolon ezilmesi + kaydırılamayan kırpılma | 2xl breakpoint + `min-w-[720px]` tablo; 1400 probe docW=innerW=1400, tablo konteyneri scrollW 843 > clientW 772 (gerçek kaydırma); liste tarih kolonu salt-tarih (1280 orta-kırpılma) |
| Regresyon | 46 dosya 305 PASS / 0 FAIL (15 skip); purity allowlist +library seam |

## ⚠ UNVERIFIED (insan gözü gerekli)

| Kalem | Neden |
|-------|-------|
| 8 baseline `e95-library-*.png` design-bank'te (INDEX PENDING) | Görsel kabul = CEO göz testi |
| Playwright penceresinin elle boyutlandırılması hâlâ kırpık görünür | Playwright viewport'u SABİTLER (1920) — gerçek tarayıcı davranışı değil; gerçek Chrome/Firefox'ta doğrulama CEO gözü |

## Boundaries (gelecek satırlara sınır kaydı)

- Kritik uyarı rayında alert BAŞLIKLARI İngilizce (DB verisi; alerts şemasında title_tr yok) — E8.4b'den beri global rail davranışı, library rotası değil → i18n data-surface takibi CC-SPEC/alerts satırına.
- `library.usage` haftalık mutabakat raporu → P7 (spec §18).
- Ajan-içi "elimde hangi yetenekler var" katalog sorgusu (spec §8 ikinci yarı) → E13.x MCP gateway satırı (dxb-mcp grubu ekleme oradan).
- Kind listesi genişletme prosedürü spec §27'de kalır (enum CHECK migration).

Sıradaki: roadmap E9 bloğu KAPANDI — sonraki satır E10.1 (hook engine) / IMPLEMENTATION_ROADMAP sırası.
