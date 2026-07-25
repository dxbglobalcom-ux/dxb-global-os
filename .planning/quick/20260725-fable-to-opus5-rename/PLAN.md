# U20 — Fable 5 → Opus 5 rename + 4.8 retirement: EXECUTION TICKET

> ⛔ Execution ticket only (PLAN.md ≠ a plan). Zero new design decisions.
> Spec pointer: `HOLDING-OS-MASTER-PLAN/00-INDEX.md` U20 + `MODEL_ROUTING_SPEC.md`
> registered adaptation A-2026-07-25 + `MASTER_PLAN.md` §2 model chain (v9).

## Order

CEO, 2026-07-25 in chat: *"projenin heryerinde sadece Fable 5 geçen yerlerin
değiştirilip Opus 5 olmasını, 4.8 olarak geçen yerlerin de 5 olarak
güncellenmesini istiyorum."*

## CEO scope decisions (same turn, three questions answered)

| # | Question | CEO answer |
|---|---|---|
| 1 | History (persona `Created by`, `v2.0-fable`, applied migrations, evidence notes) | **Keep history; change forward-looking rules only** |
| 2 | Live identifiers (`model_catalog.id`, settings key, ladder rung, spec filename) | **Change visible labels only; keep the keys** |
| 3 | Model chain after 4.8→5 | **Remove the backup layer — one brain, Opus 5; errors surface as `blocked`** |

## Scope contract

Change = any sentence that states who has authority NOW or going forward, and
any CEO-VISIBLE label. Keep = any record of who did what in the past, and any
internal technical key.

## Evidence contract

| Gate | Command | Required outcome |
|---|---|---|
| Typecheck | `npx tsc -b` + dashboard `tsc --noEmit` | exit 0 |
| Full suite | `npx vitest run` | 71 files / 0 failed |
| i18n purity | `scripts/i18n-purity-check.sh` | PASS, EN=TR parity |
| Live catalog truth | `psql -c "select id,status,display_name from model_catalog where provider='anthropic'"` | `fable-5 = Claude Opus 5 / active`, `claude-opus-4-8 = retired` |
| Slot lane truth | `select model_id, count(*) from routing_rules where role_slot is not null group by 1` | zero rows on a retired model |
| RULE #0 battery | 3 routes × EN+TR × 1366/1920 + overflow + stale-name grep | 12 shots, 0 findings |
| Retired disclosure | behavioural probe on `/ai/models` | default hides the retired row; toggle reveals it |
| Residue | probe rows, unresolved alerts | 0 / 0 |
