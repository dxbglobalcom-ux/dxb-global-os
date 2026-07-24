# SUMMARY — 19e decisions-leg content i18n (2026-07-24 night, CEO screenshot trigger)

**Outcome:** /gov/decisions renders zero raw DB codes in both locales; ledger 19e/19f row moved to ◐ (decisions leg closed, two legs stay honestly open).

| Item | Result | Evidence |
|---|---|---|
| Humanization | Measured finite vocabulary mapped EN+TR: decisions `routing_change`, `hook_escalation`, `hook_reject`, `escalation`, `employee-selection`, `task_plan` + door prefixes `model.assigned:` / `engine.owner:` (prefix match keeps the tail, e.g. "Model atandı: glm-5.2 → ..."); outcomes `applied`/`blocked`; actors `ceo`/`hook`/`resident-worker`/`orchestrator:escalate`/`orchestrator:dispatch` (orchestrator = Hamza, standing order 2). Who-filter options humanized, values raw. Unmapped free text renders as-is (already prose). | `decision-logs.tsx` + dict maps; live vocabulary measured via decision_log group-by |
| Battery | 4/4 EN+TR × 1366/1920: raw-code grep on rendered page = 0 hits, `applied` word absent, scrollOK, zero ellipsis; TR screenshot: "CEO · Model yönlendirmesi değişti · Uygulandı". | Eye-checked screenshot decisions-19e-tr.png |
| Checks | tsc 0 errors; build green + restart; i18n purity PASS (2328=2328); haram-vocab 0. | command outputs in session |

**Open legs on the ledger row (not dropped):** task-objective EN text on TR rail/lists — objectives are EN work artifacts by the language directive, CEO-facing translation needs an infra decision (title_tr-style column or render-time translation); hook-violation EN detail strings (C19+).
