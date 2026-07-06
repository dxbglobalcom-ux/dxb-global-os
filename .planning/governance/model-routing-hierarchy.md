<!-- REPO MIRROR — committed for portability/auditability (Codex, future agents, git clone, non-Claude tools).
     Runtime Claude memory source: ~/.claude/projects/-home-ghost-DxB-Global-OS/memory/model-routing-hierarchy.md
     Sync rule: whenever the runtime source changes, this mirror is updated in the same work session. -->

---
name: model-routing-hierarchy
description: "CEO-approved model authority matrix — Fable 5 owns the build and gives ALL final verdicts personally; Opus drafts; Sonnet executes/checks; Haiku is fetch-and-carry ONLY (no verdicts ever)"
metadata:
  type: feedback
  originSessionId: 6f441f82-3704-454a-83cd-11cd3bcd26d8
---

CEO-approved runtime build-workflow authority matrix (2026-07-06; sertleştirildi aynı gün — Haiku verdict ihlali sonrası). Scope: Claude Code/GSD session'larının DXB Global OS'u nasıl inşa ettiği. Şirket/ürün yönetişimi DEĞİL — proje dosyalarına (ROADMAP.md, PROJECT.md, REQUIREMENTS.md, faz planları, proje CLAUDE.md) asla yazılmaz. Üst çerçeve: [[fable-5-construction-governance]] (THE GOAL + bootstrap kuralı — her session ilk okuma).

**Hiyerarşi (CEO metni):**

- **Fable 5:** Baş mimar + orkestratör + inşaat sahibi. Projeyi baştan sona yönetir. Önemli işi atar. Kritik artefaktları BİZZAT okur. Final verdict verir. Milestone statüsünü onaylar. Commit'leri onaylar. **Fable incelemesi olmadan hiçbir final statü (PLANNED/DONE/PASSED/VERIFIED/APPROVED) ilan edilemez.**
- **Opus:** Karmaşık taslak, derin planlama, mimari öneri, debug (gsd-planner, gsd-debugger). Fable yönetiminde ADAY artefakt üretir. Final onay yetkisi YOK.
- **Sonnet:** Execution, araştırma, doğrulama, yapısal kontrol, implementasyon desteği (gsd-executor, gsd-phase-researcher, gsd-verifier ve artık **gsd-plan-checker** dahil tüm checker/auditor ajanları). Bulgularını raporlar ama final proje onayı VEREMEZ.
- **Haiku:** SADECE mekanik getir-götür: dosya getir, dosya varlığı kontrolü, grep sayımı, dosya adı listeleme, mekanik özet, ham metin çıkarma. **Kalite yargısı YOK. Verdict YOK. Onay YOK. "Passed" YOK. Mimari yargı YOK. Risk yargısı YOK. Milestone kararı YOK. Commit onayı YOK.** Haiku çıktısı verdict değil, HAM GİRDİdir.

**Checker PASS ≠ bitti (yönetişim maddesi):** Alt model (Sonnet dahil) "PASSED" dese bile iş bitmiş sayılmaz. Fable, "planned/done/approved" ilan etmeden önce üretilen artefaktları BİZZAT okur ve kendi yazılı verdict'ini üretir. Alt model çıktısını aynen aktarmak = yönetişim ihlali ([[fable-5-construction-governance]]).

**Why:** (1) 2026-07-05: her GSD subagent'ı session modelini (claude-fable-5[1m]) miras aldı — $46.40'lık session'ın $46.14'ü yandı. Kök neden: `resolve_model_ids: "omit"`. (2) 2026-07-06: gsd-plan-checker Haiku'da koştu ve Fable, 5 plan dosyasını okumadan Haiku'nun PASSED'ini son söz sayıp "PLANNED ✓" ilan etti — CEO yakaladı: zayıf modele büyük işin son kararı verilemez, Fable bizzat okumadan hiçbir şey onaylanamaz.

**Observation/verification routing (CEO uzantısı):** Mekanik gözlem (screenshot, polling, log tail, tekrarlı durum kontrolü) ucuz subagent'lara gider (haiku salt-mekanikse; yorum gerekiyorsa sonnet). Fable dönen kanıtı OKUR ve karar verir. Tek atımlık komut (bir scrot, bir grep) subagent spawn'dan ucuz — inline Fable koşar. [[evidence-before-done]] her katmanda geçerli.

**How to apply:**
- Subagent spawn'da `model=` HER ZAMAN açıkça geçilir. Omit = miras = Fable yangını.
- `.planning/config.json` backstop: `model_profile: "adaptive"`, `resolve_model_ids: "resolve"`, `model_overrides`: planner/debugger → opus; **plan-checker/integration-checker/nyquist-auditor/verifier → sonnet** (Haiku hiçbir kalite kapısında seçilemez).
- Haiku'ya verilebilecek işler: gsd-codebase-mapper tarzı salt mekanik tarama/özet, dosya listeleme, sayım. Verdict cümlesi kurduracak hiçbir prompt Haiku'ya gitmez.
- Usage hygiene: 4+ paralel session'dan kaçın; 150k+ bağlam maratonu yerine faz başına taze session; terminal session'ı için düz Fable 5 yeterli (`[1m]` değil).
