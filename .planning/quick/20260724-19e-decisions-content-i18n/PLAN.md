# Execution ticket — ledger 19e/19f, DECISIONS leg (DB enum content on CEO surface)

**Trigger:** CEO screenshot 2026-07-24 night — /gov/decisions TR shows raw `routing_change` / `applied` / `ceo` (rule 6: no code-language on first read; C17 humanization precedent).

**Measured live vocabulary (finite):** decisions: hook_escalation 27 · hook_reject 22 · escalation 21 · employee-selection 15 · task_plan 14 · routing_change 6 (+ door-written prefixes `model.assigned:` / `engine.owner:`); outcomes: applied · blocked; decided_by: ceo · hook · resident-worker · orchestrator:escalate · orchestrator:dispatch (orchestrator = Hamza, standing order 2).

**Scope:** humanize all three columns on /gov/decisions EN+TR via dictionary maps (exact codes + the two door prefixes; unmapped free text renders as-is); "who" filter options humanized (values stay raw). NOT in scope (stays open on the ledger row): task-objective EN text on TR rail/lists (work artifacts are EN by the language directive — needs a translation-infra decision) and hook-violation EN detail strings (C19+).

**Evidence:** red = `routing_change` present on rendered TR page (CEO screenshot + measured); green = zero raw codes rendered, humanized TR/EN labels visible; RULE #0 battery /gov/decisions EN+TR × 1366/1920; i18n purity PASS; commit + STATE + ledger note.
