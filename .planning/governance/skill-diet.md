---
name: skill-diet
description: "CEO emri (2026-07-08) — gstack tamamen + kullanılmayan gsd skilleri kapalı; arşiv ~/.claude/skills-disabled/, geri alma = mv"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: edf5d9c1-092d-4eb0-b037-b573f88b022a
---

CEO emri (2026-07-08, token analizi sonrası): kullanılmayan skiller session açılış bağlamını şişiriyor — kapat.

**Yapılan:** 56 gstack skill dizini → `~/.claude/skills-disabled/gstack/`; 48 gsd skill dizini → `~/.claude/skills-disabled/gsd/`. Silme yok, `mv` ile arşiv — geri alma: `mv ~/.claude/skills-disabled/<grup>/<skill> ~/.claude/skills/`.

**Kalan 21 gsd çekirdeği:** complete-milestone, config, debug, discuss-phase, execute-phase, extract-learnings, fast, graphify, health, new-milestone, phase, plan-phase, progress, quick, secure-phase, spec-phase, stats, surface, undo, update, verify-work.

**Why:** Açılış bağlamı ölçüldü (~51k token); skill listesi ~10k'ydı, ~200 girişin çoğu hiç kullanılmıyordu. Token-diet devamı ([[master-plan-fidelity]] değil, işletme hijyeni).

**How to apply:**
- Faz 8 (dashboard) başlarken `gsd-ui-phase` + `gsd-ui-review` geri alınabilir; GitHub remote gelince `gsd-ship`/`gsd-pr-branch`.
- `gsd-update` çalıştırınca arşivlenen gsd skilleri geri gelebilir — update sonrası bu listeyi yeniden uygula.
- Yeni skill ihtiyacı çıkarsa önce arşivden geri yükle, yeniden kurma.
- **DOĞRULANDI 2026-07-17 (R4.1):** regresyon gerçekleşti — 50 gsd skili sessizce geri gelmişti; library intake dry-run'ının "+50 yeni skill" anomalisi yakaladı. Tespit deseni: aktif set ≠ DB'deki E9.5 23-skill ledger seti → farkı arşive taşı (o gün `moved=50`, sonuç 23/23).
