---
name: model-routing-hierarchy
description: "CEO-approved Fable-authorship matrix (2026-07-06 v3) — Fable writes plans AND ALL code/artifacts personally (no boilerplate exception); Sonnet support-only at high effort (research/checks/runs); no-unnecessary-subagent hard rule; Haiku fetch-and-carry only; budget-fallback mode documented"
metadata:
  type: feedback
  originSessionId: 6f441f82-3704-454a-83cd-11cd3bcd26d8
---

CEO-approved runtime build-workflow authority matrix (v3, 2026-07-06 — v2'deki "boilerplate'i Sonnet daktilo eder" istisnası CEO tarafından kaldırıldı: "plan ve kodlama sende olmalı; bunun haricindeki her şeyde Sonnet'i kullanabilirsin, high seviyesinde". Tarihçe: v1 "Opus taslak yazar" → v2 "Fable plan+kritik kod" → v3 "Fable TÜM yazarlık"). Scope: Claude Code/GSD session'larının DXB Global OS'u nasıl inşa ettiği. Şirket/ürün yönetişimi DEĞİL — proje dosyalarına (ROADMAP.md, PROJECT.md, REQUIREMENTS.md, faz planları, proje CLAUDE.md) asla yazılmaz. Üst çerçeve: [[fable-5-construction-governance]] (THE GOAL + bootstrap kuralı — her session ilk okuma).

**İlke: repo'ya giren HER satır Fable'dan çıkar — kod, config, migration, tracker, study card, doküman. İstisna yok (boilerplate dahil).**

**Yetki matrisi (CEO onaylı tablo, v3):**

| İş | Kim | Neden |
|---|---|---|
| Plan yazımı | **Fable, bizzat** | Tavan kalite, çift harcama yok |
| Kod + her repo artefaktı (boilerplate dahil) | **Fable, bizzat yazar** | Kalite tavanı her satırda Fable'da |
| Keşif/araştırma hammaddesi | Sonnet (high effort) / Opus paralel | Ham veri, yargı yok |
| Doğrulama koşuları, kontrol taramaları | Sonnet (high effort) | Yazarlık-dışı destek |
| Her commit öncesi diff okuma + verdict | **Fable** | Zaten kural |

**GEREKSİZ-SUBAGENT YASAĞI (CEO, sert kural):** Varsayılan her iş inline Fable — token şişmesi yasak. Subagent yalnız iki gerekçeyle açılır: (1) ana bağlamı şişirecek hacimli ham-veri toplama (kompakt dönüşle), (2) izole edilmesi şart uzun doğrulama koşusu. Tek komutluk işe subagent açmak ihlaldir. GSD akışında da geçerli: onaylı plan varsa executor subagent'ı yerine inline yürütme tercih edilir.

**Rol tanımları:**

- **Fable 5:** Baş mimar + orkestratör + inşaat sahibi + **plan yazarı + TÜM kod/artefakt yazarı**. Planlar subagent'a devredilmez; repo'ya giren her satır (boilerplate dahil) bizzat Fable'dan çıkar — normal modda yazarlık devri YOKTUR. Kritik artefaktları BİZZAT okur, final verdict verir, milestone statüsünü onaylar, commit'leri onaylar. **Fable incelemesi olmadan hiçbir final statü (PLANNED/DONE/PASSED/VERIFIED/APPROVED) ilan edilemez.**
- **Opus:** SADECE paralel keşif/araştırma hammaddesi. Taslak plan YAZAMAZ, mimari "aday karar" ÜRETEMEZ, kod YAZAMAZ; bulguları ham veridir, sentez ve karar Fable'da. İstisna: bütçe-fallback modu (aşağıda).
- **Sonnet:** Yazarlık-dışı destek, HIGH effort'ta: keşif/araştırma hammaddesi, checker/verifier koşuları (gsd-verifier, gsd-plan-checker, gsd-phase-researcher vb.), doğrulama komutları, kontrol taramaları. KOD/ARTEFAKT YAZAMAZ; bulgu raporlar ama final proje onayı VEREMEZ.
- **Haiku:** SADECE mekanik getir-götür: dosya getir, dosya varlığı kontrolü, grep sayımı, dosya adı listeleme, mekanik özet, ham metin çıkarma. **Kalite yargısı YOK. Verdict YOK. Onay YOK. "Passed" YOK. Mimari yargı YOK. Risk yargısı YOK. Milestone kararı YOK. Commit onayı YOK.** Haiku çıktısı verdict değil, HAM GİRDİdir.

**Checker PASS ≠ bitti (yönetişim maddesi):** Alt model (Sonnet dahil) "PASSED" dese bile iş bitmiş sayılmaz. Fable, "planned/done/approved" ilan etmeden önce üretilen artefaktları BİZZAT okur ve kendi yazılı verdict'ini üretir. Alt model çıktısını aynen aktarmak = yönetişim ihlali ([[fable-5-construction-governance]]).

**Bütçe-fallback modu (CEO onaylı, 2026-07-06):** Maddi kısıt durumunda onaylı fallback: Fable'ın yazdığı detaylı planı (MASTER-PLAN) **Opus 4.8 adım adım uygular**; verdict/diff-okuma kapıları mümkün olan en yüksek modelde kalır. Dürüst kalite beklentisi: tasarım kalitesi %100 korunur (plana gömülü), mikro-implementasyon (isimlendirme, hata mesajı, spec'in sustuğu edge-case refleksi) Opus seviyesinde kalır — "Fable tasarımı + Opus işçiliği". Verdict kapısı da düşerse güvence, plandaki yazılı adım-başı doğrulama komutlarına iner; MASTER-PLAN bu yüzden her adıma "çalıştır → şu çıktıyı gör" kontrolü gömer.

**Why:** (1) 2026-07-05: her GSD subagent'ı session modelini (claude-fable-5[1m]) miras aldı — $46.40'lık session'ın $46.14'ü yandı. Kök neden: `resolve_model_ids: "omit"`. Ders: `model=` her spawn'da açık; miras ancak BİLİNÇLİ karar olarak kullanılır (bkz. planner istisnası aşağıda). (2) 2026-07-06: gsd-plan-checker Haiku'da koştu ve Fable, 5 plan dosyasını okumadan Haiku'nun PASSED'ini son söz sayıp "PLANNED ✓" ilan etti — CEO yakaladı: zayıf modele büyük işin son kararı verilemez, Fable bizzat okumadan hiçbir şey onaylanamaz. (3) 2026-07-06 (v2): CEO, Opus-taslak+Fable-review örgüsünü reddetti — review yazarlık değildir; artefaktın kalite tavanını yazan belirler, reviewer sadece tabanı garanti eder.

**Observation/verification routing (CEO uzantısı):** Mekanik gözlem (screenshot, polling, log tail, tekrarlı durum kontrolü) ucuz subagent'lara gider (haiku salt-mekanikse; yorum gerekiyorsa sonnet). Fable dönen kanıtı OKUR ve karar verir. Tek atımlık komut (bir scrot, bir grep) subagent spawn'dan ucuz — inline Fable koşar. [[evidence-before-done]] her katmanda geçerli.

**How to apply:**
- Subagent spawn'da `model=` HER ZAMAN açıkça geçilir. Tek istisna: gsd-planner/gsd-debugger'ın Fable session modelini miras alması ARTIK İSTENEN durumdur (plan yazarlığı Fable'da) — bu miras bilinçli ve kayıtlıdır, yangın değildir.
- `.planning/config.json` backstop (v3): `model_profile: "adaptive"`, `resolve_model_ids: "resolve"`, `model_overrides`: **planner/debugger/executor → claude-fable-5** (yazan her subagent Fable modeli — ama varsayılan inline, subagent yasağına bak); phase-researcher/plan-checker/integration-checker/nyquist-auditor/verifier → sonnet. Haiku hiçbir kalite kapısında seçilemez.
- Yürütme varsayılanı INLINE: onaylı plan varsa executor subagent'ı açılmaz, Fable doğrudan uygular; subagent yalnız yukarıdaki iki gerekçeyle.
- Haiku'ya verilebilecek işler: gsd-codebase-mapper tarzı salt mekanik tarama/özet, dosya listeleme, sayım. Verdict cümlesi kurduracak hiçbir prompt Haiku'ya gitmez.
- Usage hygiene: 4+ paralel session'dan kaçın; 150k+ bağlam maratonu yerine faz başına taze session; terminal session'ı için düz Fable 5 yeterli (`[1m]` değil).
