# C-Series Remediation Waves A–E — Overnight Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans, INLINE execution only (model-routing v6: Fable authors every line in person; subagent authorship banned). Steps use checkbox syntax.

**Goal:** Close the CEO complaint ledger (C1–C25, 68 atomic items) wave by wave: Wave A trust-critical purges + routing, B CEO Chat Board, C systemic list/language standard, D IA moves + models, E measured answers.

**Spec pointer (no new design decisions here):** `HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md` (+ atomic Turkish doc `references/ceo-complaints-2026-07-19/SIKAYET-DEFTERI-DETAYLI.html`). All decisions below are transcriptions of registered CEO orders in that ledger.

**Architecture:** Next.js dashboard `(command)` route group is the sole CEO surface; `(cockpit)` legacy group dies. DB = single Supabase Postgres (`docker exec supabase_db_DxB_Global_OS psql -U postgres -d postgres`). Routing truth: `vps/litellm/config.yaml` + `packages/kernel/policy/routing-seed.json` + worker-shim mode dispatch (subscription = Agent SDK local auth; api = LiteLLM/OpenRouter).

**Evidence contract (every task):** RULE #0 design pass on touched surfaces (EN+TR, ≥2 widths, scrollWidth check, i18n-purity script) + Evidence-Before-Done two-tier report. Commit per task/wave.

## Global Constraints
- English artifacts; Turkish only in chat + the CEO-readability complaint doc (registered exception).
- OpenRouter = low-cost/Chinese models ONLY; Anthropic models never via OpenRouter (standing order 4).
- No haram-domain wording anywhere, even fixtures (standing order from C20).
- List-page standard: filter + select + bulk action + plain language + hover help EN+TR (standing order 5).
- No raw enums/codes/IDs on first read on CEO surfaces; progressive disclosure (standing order 6).
- No caveman-style copy on dashboard (C19).
- Audit trail preserved: destructive UI ops = archive/hide semantics or audited hard delete via control fn.

---

## Wave A — trust-critical

### Task A1: C20 fixture purge (FIRST — gambling-string probes off CEO surfaces)
**Files:** DB only + `HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md` (closure note)
- [ ] Measure FK deps of 3 probe workflows (`baab0110…`, `9e177fdb…`, `a6b3a33a…` — names `r23t-30019999 halal/pass/revise`): `select * from workflow_runs where workflow_id in (…)`; check `workflow_steps` table if exists.
- [ ] Delete runs/steps then the 3 workflow rows in one transaction; audit_log entry via insert (actor=fable, action='fixture.purge', reason=C20).
- [ ] Verify: `select count(*) from workflows` → 0 probe rows; grep repo for 'kumar' in fixtures/seeds — any test writing such strings gets its string neutralized ("test-topic-a" style).
- [ ] Commit `fix(C20): purge r23t probe workflows from CEO surface + fixture wording policy`.

### Task A2: C21 junk-intent purge
**Files:** DB only
- [ ] Delete junk intents (measured IDs): Korean `bcf530c1`, "May the do you, Muslim Hamza." `72dd7d58`, "Sessim do you hear me sir…" `043dccf7`, "Do you hear me? Why…" `60ffbbd6`, garbled "öbürçe" duplicates `d0339977`, `a8d5771e`, failed greeting `fcdac347`. Keep legit finance/CEO intents.
- [ ] Check FK: tasks.parent chains via `task_ids` array — junk intents dispatched → orphan tasks? Measure and cancel linked garbage tasks likewise.
- [ ] Audit_log entry; verify remaining `intents` list is clean; commit.

### Task A3: C6 legacy (cockpit) kill + link sweep
**Files:** Delete: `app/(cockpit)/**` (costs, tasks, tasks/[id], page.tsx, layout.tsx); delete now-orphaned legacy components (`components/command-bar.tsx`, `intent-strip.tsx`, `horizon-line.tsx`, `task-board.tsx`, `components/shell/app-shell.tsx` if only cockpit uses it — measure importers first). Modify: `components/command/live-feed.tsx:163-172`, `components/command/alert-center.tsx:345`, `app/(command)/approvals/[id]/page.tsx:252`.
- [ ] Measure: check whether root `/` is served by `(cockpit)/page.tsx` or a redirect exists; measure importers of each legacy component (`grep -rn`).
- [ ] Replace live-feed row drill: no legacy link — row click expands detail INLINE below the row (C3+ demand: collapse lifecycle chain per task, expand shows chain + task fields in plain language). If inline expansion too large for tonight, minimum: link → `/live` detail anchor that exists in (command); NO link to `/tasks/`.
- [ ] Repoint alert-center + approvals detail task links to the same surviving surface.
- [ ] Delete `(cockpit)` group + orphaned components; if `/` was cockpit, add `app/page.tsx` redirect → `/overview`.
- [ ] Build: `pnpm --filter dashboard build` green; grep `-rn "cockpit\|/tasks/"` → zero legacy refs.
- [ ] RULE #0 pass on live feed + approvals detail (EN+TR, 2 widths); commit.

### Task A4: C5 approval/task truth sync
**Files:** DB migration `supabase/migrations/<ts>_task_approval_truth_sync.sql`; possibly control fn.
- [ ] Resolve the 3 stale awaiting_approval tasks: Outleteuro campaign `f5f85dea` → cancelled (U19); R31 probe cash-flow `4a7cf6b2` → cancelled (probe class, C20); Haziran mutabakat `e454d9cb` → cancelled (demo-era stale). Status transition with feedback note, audited.
- [ ] Root cause: find code path that sets `awaiting_approval` without creating approvals row (grep packages/orchestrator + control fns). Fix: DB trigger on tasks status→awaiting_approval that inserts a pending approvals row if none exists (idempotent), so the two surfaces can never diverge again.
- [ ] Test: transition a scratch task to awaiting_approval in a rolled-back transaction → approval row appears; verify pending count matches tasks count.
- [ ] Commit migration + note.

### Task A5: C2 routing repair
**Files:** `vps/litellm/config.yaml`, `packages/kernel/policy/routing-seed.json`, `packages/orchestrator/src/escalate.ts` (measure roster), DB `model_routing` seed if live table exists.
- [ ] Remove `sonnet-5`, `opus-4.8`, `fable-5` entries from config.yaml model_list (lines 21-30). Anthropic access = subscription mode only.
- [ ] routing-seed.json: rows with anthropic model + `"mode": "api"` (video.summarize sonnet-5:25, video.explain fable-5:26 + opus-4.8:27) → `"mode": "subscription"`. Verify no other anthropic+api rows.
- [ ] Measure live DB routing table (if routing seed is materialized) and apply same fix there.
- [ ] escalate.ts: api rungs must draw ONLY from low-cost roster (glm-5.2, kimi, deepseek, qwen, minimax). Fix any anthropic api rung.
- [ ] embed-small (paid $0.02/M): measure usage (`grep -rn embed-small packages apps scripts` + litellm spend logs). Per CEO order paid non-Anthropic stays only if free → mark decision: replace with free route if one exists on OpenRouter, else disable + register open item to CEO (money-adjacent). Record outcome in ledger.
- [ ] Verify: `grep -n anthropic vps/litellm/config.yaml` → 0; restart LiteLLM container if running; commit.

### Task A6: C22 stale-risk refresh
**Files:** DB `project_risks`
- [ ] Close `c03b0990` (workforce activation gap) with note citing measured 198 active / 0 dormant-blocking (2026-07-19); review `4e48b9a4` (brown-token audit, stays open — registered deferral A4-open) and closed row untouched. Add wave-end risk refresh discipline note to ledger.
- [ ] Verify risks page renders updated truth (RULE #0 quick pass); commit with A-wave ledger updates.

---

## Wave B — CEO Chat Board (C1+C7+C10)

### Task B1: chat backend
**Files:** Create `apps/dashboard/src/app/api/chat/route.ts`; migration `<ts>_ceo_chat.sql` (table `chat_messages`: id, session_id, role ceo|hamza, content, mode normal|plan, created_at, intent_id nullable); reuse Hamza answer path from `packages/voice/src/answer.ts` (persona injection, HAMZA_SLUG) — extract/import shared answer fn.
- [ ] Migration + `pnpm db push` equivalent (`supabase db` flow used in repo — follow scripts/test/db-suite.sh pattern).
- [ ] POST /api/chat: persist CEO msg, call Hamza answer (subscription-mode model per routing voice.answer class), persist reply, return. Plan-mode flag routes to a planning prompt (discuss first, NO dispatch). Explicit `dispatch` action creates intent via existing /api/intent logic and links intent_id.
- [ ] Test with curl: greeting "selam Hamza nasılsın" returns conversational reply, creates NO task. Evidence logged.

### Task B2: chat UI + palette cleanup
**Files:** Create `app/(command)/chat/page.tsx` + `components/chat/chat-board.tsx`; modify `config/command-nav.ts` (add Chat at top), `components/command/command-palette.tsx` (remove intent submit :251-272 — palette = search only).
- [ ] Chat board: message list, input, plan-mode toggle, "Görev olarak gönder / Dispatch as task" button on Hamza proposals; EN+TR copy; Hamza name visible.
- [ ] Palette: intent path removed; verify search still works.
- [ ] RULE #0 pass both locales/widths; commit.

---

## Wave C — systemic list/language standard

### Task C-1: HelpTip component + heading coverage
**Files:** Create `components/primitives/help-tip.tsx` (hover tooltip, ?, EN+TR from messages dicts); apply to page/section headings on: overview, live, approvals, ops lists, cost/analytics, memory, runtime/observability, models, HR.
- [ ] Component: pure CSS hover (no click), accessible (aria-describedby), theme-aware; message keys `help.<page>.<section>` in `messages/en.json`+`tr.json` describing the PAGE plainly (C9: what is this, where data comes from, how reset).
- [ ] Apply + i18n-purity check; RULE #0; commit.

### Task C-2: delete/bulk-delete control surface (C4/C18)
**Files:** Create `app/api/control/purge/route.ts` (audited archive/hard-delete for tasks/alerts/intents/runs — archive semantics: status flag or move; audit_log every op); modify list pages: tasks list (ops), alerts, live feed — add checkbox select + "Seçilenleri kaldır/Tümünü temizle (filtreli)".
- [ ] API with zod validation, per-entity allowed ops, audit rows.
- [ ] UI selection model + bulk bar on the failed-tasks list first (C4's exact complaint), then alerts.
- [ ] Test: bulk-archive 2 scratch rows via curl; verify audit_log; RULE #0; commit.

### Task C-3: filter standard (C9)
**Files:** shared `components/primitives/filter-bar.tsx` (department select from live depts, model select, real date-range picker, project select where applicable) driving the WHOLE page below (URL params); wire on cost/analytics + tasks + runs pages.
- [ ] Commit per surface with RULE #0 evidence.

### Task C-4: plain-language sweep (C17/C19 + leak sites)
**Files:** `approvals/[id]/page.tsx:138-226` (raw action_type/operation_class/payload → plain projection with progressive disclosure "Teknik ayrıntı" collapsible), `live-feed.tsx:185`, `ai/memory/page.tsx:426`, runtime/observability page vocab, decision-log batch collapse (113 identical rows → one row with count, C17+), hook-violations detail strings EN-in-TR fix (C19+).
- [ ] Every raw enum passes through messages dicts; add missing keys both locales; i18n-purity script green; RULE #0; commit.

---

## Wave D — IA moves + models

### Task D1: nav IA (C11/C13)
**Files:** `config/command-nav.ts:110-149`
- [ ] Remove Tasks from Operations nav; move Portfolio, CRM, Opportunities, Objectives from Intelligence → Operations. Verify no orphan routes; RULE #0 on nav both locales; commit.

### Task D2: models page + catalog (C12)
**Files:** catalog migration (add codex-5.6, codex-5.5, glm-5.2, kimi-3, deepseek-v4-pro rows with honest mode fields; kimi-3 replaces kimi-2.7 pending exam — flag), `components/.../models-table.tsx` add-model dialog → name + API key + optional note only; strip info-free columns (C23/C25: `–` and €0.00 suppressed per A1 rule); stats fed from agent_runs; routing decision panel filters out `reason=test:` rows.
- [ ] MODEL_ROUTING_SPEC amendment: Fable fallback = Codex 5.6 solo, Opus 4.8 (standing order 3).
- [ ] RULE #0; commit.

### Task D3: HR cleanup (C8)
**Files:** `app/(command)/org/hr/page.tsx:166-167` (active-org-only counts for CEO view); create `HOLDING-OS-MASTER-PLAN/00-NOTE-PERSONA-DELETION-LIST.md` (15 `_library` files incl. loan-officer, real-estate — one-confirm list to CEO; no silent delete).
- [ ] RULE #0; commit.

---

## Wave E — measured answers (C14/C15/C16/C23/C24/C25)

### Task E1: token/cost attribution (C24) + zero-field suppression (C25)
- [ ] Measure how Tokenlar page aggregates dept (join path); fix dept attribution from task.department; separate construction-session usage (claude-fable-5 local) from runtime with a labeled split; suppress info-free €0.00/`–` fields.
- [ ] RULE #0; commit.

### Task E2: memory page plain copy + token-protection answer (C14)
- [ ] Plain EN/TR section explaining each segment + how memory avoids burning tokens (write-policy, compression) — cited from specs; commit.

### Task E3: skills/plugins/library provenance answers (C15/C16)
- [ ] Per-item measured answers: skills/plugins usability + study records (R4.3 catalog); yellow marker meaning read from component; library query for CEO-provided items → surface/answer doc. No guessing; anything unmeasurable = UNVERIFIED label.
- [ ] Ledger closure updates + final commit.

---

## Closing (morning)
- [ ] Ledger: mark each closed C-item with evidence line; STATE.md update; roadmap untouched (C-series is post-E13.1 remediation, tracked in ledger).
- [ ] Morning report to CEO (Turkish, table ✓/⚠/❌ + evidence), incl. any items intentionally left open with reasons.
