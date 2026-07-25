---
ticket: 20260725-ceo-morning-decisions
type: quick
status: complete
created: 2026-07-25
author: Fable 5 (inline, K1)
---

# Execution ticket — CEO morning decisions 2026-07-25

**This is an execution ticket, not a plan (CEO ruling 2026-07-13). Zero new design decisions.**

## Spec pointers

- MODEL_ROUTING_SPEC §4c step 4 (activation via `set_catalog_status` audited door), §13 (actor regime), §14-15 (decision_log + audit_log per step).
- Complaint ledger `00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md` C2 (embed-small open leg) + completeness-audit open list (per-item model exam records).
- STATE.md MORNING QUEUE FOR CEO (4 items, answered in chat 2026-07-25 morning).

## CEO decisions (verbatim source: CEO chat message 2026-07-25 morning)

> "1- 1 milyon için 0.02 dolarsa ok. zaten sonra konuşuruz 2-sonra yüklerim devam. 3. ok 4- feragat."

1. **embed-small: KEEP** (paid ~$0.02/M approved; revisit later possible).
2. **kimi-3 OpenRouter top-up: DEFERRED** ("sonra yüklerim") — stays `testing`, exam blocked on 402 until CEO tops up. No money-out action.
3. **deepseek-v4-pro: ACTIVATE** — §4c step-4 `set_catalog_status → active` through the audited door, actor=ceo (in-chat approval recorded above).
4. **/ai/memory store-card EN usage_notes: WAIVED** — no translation pass; record waiver.

## Tasks

1. Activate deepseek-v4-pro: `fn_update_routing('set_catalog_status', {model_id, status:'active'}, idem-key)` with CEO jwt claims (real CEO auth uid), per §4c step 4. Verify catalog row + audit_log + decision_log rows.
2. Record decisions 1/2/4 as CEO rows in `decision_log` (visible on /gov/decisions, never age — C4 standard).
3. Ledger updates: C2 embed-small leg closed; model-exam open item annotated (deepseek activated, kimi deferred by CEO, codex-5.6 boundary recorded); memory usage_notes waiver row.
4. RULE #0 battery on `/ai/models` (EN+TR × 1366/1920) — status change is a CEO-visible surface change; i18n purity check.
5. STATE.md position update + commit(s).

## Evidence contract

- psql outputs: fn response `{ok:true}`, catalog row `status='active'`, audit_log + decision_log rows cited.
- decision_log ids for the 3 CEO decision rows.
- Battery screenshots green + purity PASS output.
- git show --stat of closure commit.
