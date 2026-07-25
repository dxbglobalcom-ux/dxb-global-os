# U20 — Fable 5 → Opus 5 rename + 4.8 retirement: SUMMARY

**Date:** 2026-07-25 ~16:10–17:20 · **Author:** Opus 5, in person (first session
under the new authorship) · **Ticket:** `20260725-fable-to-opus5-rename`

## Measured baseline (this session, before any edit)

| Metric | Value | Command |
|---|---|---|
| "Fable" occurrences | **3237 hits / 493 files** | `grep -rIo "Fable\|fable" \| wc -l` |
| — generated knowledge graph | 814 | `.planning/graphs/` (rebuildable, untouched) |
| — persona files | ~900 | `Created by`, `v2.0-fable`, §11 heading |
| — corpus + governance prose | ~600 | corpus `.md` |
| "4.8" occurrences | **86 hits** | `claude-opus-4-8` 52, `Opus 4.8` 35 |
| Live catalog | `fable-5` (Claude Fable 5) → `claude-opus-4-8` → `claude-sonnet-5` | `model_catalog` |
| Live slot lane | 10 role slots on `claude-opus-4-8` | `routing_rules.model_id` |
| Registry defaults | 11 model_ref keys = `claude-opus-4-8` | `settings_registry` |

## What changed

**Governance (forward-looking authority):** memory file renamed
`fable-5-construction-governance.md` → `opus-5-construction-governance.md`
(+ repo mirror `.planning/governance/` and MEMORY.md index);
`model-routing-hierarchy` at **v9** (authorship → Opus 5, backup layer removed,
history + internal IDs frozen); project `CLAUDE.md`, `README.md`,
`.planning/README.md`; corpus: `MASTER_PLAN` §2 chain, `MODEL_ROUTING_SPEC`
(+ registered adaptation A-2026-07-25), `BACKUP_PLAN` status banner,
`00-INDEX` header + **U-row U20**, `IMPLEMENTATION_ROADMAP` (K1/K2, §5 handover),
`EMPLOYEE_PERSONA_STANDARD`, `ACCEPTANCE_CRITERIA`, `AGENT_ORCHESTRATION_SPEC`,
`DESIGN_SYSTEM`, 6 CEO directives, complaint ledger standing order 11.
The CEO's own BEKLENTİLER text is **verbatim** — it got a reading banner instead
of edits (his words are never rewritten).

**Runtime (the substance of the order):** `packages/kernel/src/classify.ts`
`SDK_MODEL_IDS` now maps `fable-5` → **`claude-opus-5`** (was `claude-fable-5`);
`opus-4.8` also resolves to `claude-opus-5`; `opus-5` added. This is what
actually moves the company's critical-decision brain onto Opus 5.

**Live DB (2 migrations):** `20260725160000_u20_opus5_rename` — `fable-5`
display_name → "Claude Opus 5", every `claude-opus-4-8` reference repointed,
`orchestrator.fallback_order` default → single element, `claude-opus-4-8`
→ `status='retired'`, `fable_review_required` labels EN+TR.
`20260725161000_u20_opus5_rename_slotfix` — see Defects below.

**CEO-visible labels:** hook engine → "Opus 5 Hook" in both locales
(`colHook`, `hookTitle`, subtitle) and in the corpus (`SYSTEM_ARCHITECTURE`,
`WORKFLOW_ENGINE_SPEC`, `DATA_MODEL`, `RISK_REGISTER`, `FABLE_5_HOOK_SPEC` title
+ name/ID note). Gateway policy `_comment` rules → "construction-author change".

**Perfection-gate addition (RULE #0-B):** the retired 4.8 row still rendered on
`/ai/models`. Deleting it would erase cost/run history joins; showing it puts a
"4.8" in front of the CEO. Built the better version instead — retired rows leave
the default list behind a `Show retired models (N)` disclosure (CEO progressive-
disclosure preference), 2 new i18n keys EN+TR.

## Deliberately NOT changed (CEO decisions 1 + 2)

Persona `Created by: fable-5`, `<!-- v2 · fable-5 · … -->`, the 199 live
`persona_version='v2.0-fable'` rows, persona §11 heading `Fable 5 hook bağlantısı`
(the mechanical gate matches on that exact title — `packages/hr/src/template.ts:25`),
applied migration files, evidence notes, quick-ticket SUMMARYs, design-bank
records, `model_catalog.id='fable-5'`, `orchestrator.fable_review_required`,
`fable-final` ladder rung, `FABLE_5_HOOK_SPEC.md` filename, `/ai/memory`
construction-archive copy (it describes Fable's real build notes),
`.planning/graphs/` (regenerated artifact).

## Defects found and fixed in the same session

1. **My own migration was incomplete.** `routing_rules` carries two model
   columns; I rewrote `model` (kernel slug lane) but not `model_id` (the E7.1
   role-slot FK lane that `fn_select_model` reads). 10 slot rows stayed on the
   row I had just retired → `NO_MODEL_AVAILABLE` on backup/coding/critical_decision/
   design/execution/hr/planning/qa/research/review. Root-caused from the failing
   test rather than patched blind; fixed forward with migration
   `20260725161000` (applied migrations are history — never rewritten).
2. **Two live-DB tests encoded catalog shape as truth.** `tests/e7` asserted the
   literal `claude-opus-4-8`; `tests/e8` needed a three-rung chain that no longer
   exists. Both rewritten to be state-independent (read the live pointer / build
   probe rungs inside the rollback transaction) — the recorded lesson from R4.2.
3. **Pre-existing gap from commit 514f119** (spec-gap rule): DASH-05 purity gate
   flagged `app/api/voice/daemon/route.ts` — a governed `.rpc` door whose
   allowlist row never landed with the route. Added.
4. **My first design battery lied about locale.** It set `document.documentElement.lang`
   instead of the server-read `dxb-locale` cookie, so "EN+TR" was EN twice.
   Caught before reporting, fixed, re-run.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc -b` (root) | ✓ exit 0 |
| dashboard `tsc --noEmit` + `next build` | ✓ exit 0, compiled |
| `npx vitest run` | ✓ **71 files / 514 passed / 0 failed** (15 skipped) |
| `scripts/i18n-purity-check.sh` | ✓ PASS — en 2359 = tr 2359 |
| Catalog truth | ✓ `fable-5 = Claude Opus 5 / active`; `claude-opus-4-8 = Claude Opus 4.8 / retired` |
| Slot lane truth | ✓ `fable-5` × 11, `claude-haiku-4-5` × 2 — zero on a retired model |
| Registry defaults | ✓ 11 slots = `fable-5`; `fallback_order = ["fable-5"]` |
| RULE #0 battery | ✓ 3 routes × EN+TR × 1366/1920 = **12 shots, 0 findings** (no h-overflow, no "…", no stale name, "Claude Opus 5" present) |
| Retired disclosure probe | ✓ default 12 rows / 4.8 hidden → toggle → 13 rows / 4.8 shown |
| Residue | ✓ probe catalog rows 0, unresolved alerts 0 |
| Screenshots eyeballed | ✓ `/tmp/u20-shots/` — models (TR), policies (TR), employees (EN) read by eye |

## Cost note for the CEO

The real model behind the top slug moves `claude-fable-5` ($10/$50 per Mtok) →
`claude-opus-5` ($5/$25). Retiring 4.8 changes nothing ($5/$25 either way).
**Net direction: down, not up.**

## Boundaries (recorded, not done)

- Persona files still carry `## 11. Fable 5 hook bağlantısı` and `Created by:
  fable-5` — deliberate (U20 rows 3+4), CEO-approved; the dashboard never
  renders that heading verbatim.
- The **runtime** fallback chain is now `fable-5 → claude-sonnet-5` (one rung
  shorter). CEO decision 3 removed the backup layer for *construction
  authorship*; whether the product-runtime chain should also collapse to a
  single rung is a separate question and is **left open for the CEO**.
- `.planning/graphs/` still holds 814 stale "Fable" strings — regenerate with
  `/gsd-graphify build` at the next phase closure.
