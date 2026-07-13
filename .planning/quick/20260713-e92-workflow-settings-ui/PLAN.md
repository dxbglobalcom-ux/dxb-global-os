---
type: quick
slug: e92-workflow-settings-ui
created: 2026-07-13
author: fable-5 (inline, K1)
roadmap: E9.2
---

# Execution ticket — E9.2: Workflow Settings UI (madde 6.4'ün 17 kalemi) + koşu geçmişi

**Spec pointers (no new design decisions here):**
- Directive madde 6.4 (17 items VERBATIM: oluşturma, düzenleme, kopyalama,
  devre dışı, trigger, model atama, çalışan atama, approval/review/retry/
  fallback adımı ekleme, bütçe, token, zaman aşımı, risk, logging, output
  standardı) — acceptance: "17 kalem denetim listesi UI'da işaretlenir".
- WORKFLOW_ENGINE_SPEC §7: step list vertical composition, per-kind config
  form derived from the Zod schemas (packages/shared workflow-steps.ts),
  run history panel (workflow_runs → drill agent_runs), live run view =
  Live Operations filter by corr.workflow_run_id.
- WORKFLOW_ENGINE_SPEC §8/§13: ALL mutations through /api/control/workflows
  (E9.1 seam) — UI never writes tables; CEO session already the only login.
- E9.1 registered adaptations A1 (10s drain — UI hints run pickup latency),
  A3 (B7b error surfaces verbatim from fn detail).
- CC-SPEC module map: /ops/workflows (E2.2 skeleton row), ModuleWaiting dies.

**Verified live baseline (this session):**
- /ops/workflows = ModuleWaiting stub. control_workflow_action + seam live
  (E9.1, af363ea). fn_routing_slots() EXECUTE granted to authenticated
  (13 slots). model_catalog 4 active rows. workflows table read policy live.
- alert-center.tsx = the established client-component idiom (labels prop,
  /api/control fetch, Broadcast → server refetch, DataGrid/Panel primitives).

**Recorded interpretations:**
1. §7 "sürükle-sıra": implemented as explicit up/down reorder controls —
   keyboard-accessible equivalent of drag; drag-handle polish deferred to a
   later UI pass (recorded, not silent).
2. Employee picker filters non-archived + persona v2 (fn rejects others —
   UI narrows to valid choices; the wall stays in the fn).
3. Run history "live view" = link into /live (Live Ops already streams
   run.* with workflow_run corr from E9.1 trigger); a dedicated workflow
   filter chip inside Live Ops stays a boundary note (Live Feed reads the
   ops:live stream envelope-wide today).

**Deliverables:**
1. `components/command/workflow-center.tsx` — list + editor (17 items) +
   step composer + run history drill.
2. `app/(command)/ops/workflows/page.tsx` — server fetch (workflows, steps,
   runs, agents, slots, models), ModuleWaiting DEAD.
3. messages/en.json + tr.json `command.workflows` namespace.

**Evidence contract:**
- 17-item checklist: each item exercised in the real browser (create,
  edit, copy, disable, trigger, model, employee, 4 step kinds, budget,
  token, timeout, risk, logging, output standard) — run_now → run history
  row appears; screenshot evidence.
- RULE #0: EN+TR × 1280+1920, CHECKLIST walk, i18n purity script PASS.
- tsc dashboards 0; full regression stays green (no engine change).
- Roadmap acceptance line: "17 kalem denetim listesi UI'da işaretlenir" —
  the checklist table in this ticket gets ✓ per item with evidence.

**Boundaries:** Live Ops workflow filter chip (Live Feed envelope filter UI)
→ CCC/Live Ops row; Approval Center page → E9.3; scheduler resident boot →
P7.
