# TICKET — W2.6 PROACTIVE 07:00 BRIEFING

> Execution ticket, not a plan (CEO ruling 2026-07-13). The design lives in the SPEC.

- **Roadmap row:** `00-NOTE-FACTORY-COMPLETION-ROADMAP-2026-07-26.md` W2.6 — *"Proactive 07:00 briefing — the operating manual promises it; `scheduler.ts` has no such job. Hamza never opens a conversation."*
- **Owner spec:** `VOICE_INTERACTION_SPEC.md` §24quinquies (written this session — the spec was silent, so the design was registered there, CEO-visible, per roadmap §4.3) · companions §24ter (brief leg), §24quater (threads) · `CEO_COMMAND_CENTER_SPEC.md` §9ter (headline law) · `CEO_OPERATING_MANUAL.md` §2.1 (the promise).
- **Closing evidence (roadmap, verbatim):** *"the briefing lands on the chat board as a Hamza-opened thread."*
- **Session author:** Opus 5 (U30). Every line inline (K1).

## Measurements taken before writing (RULE #0-A)

| Claim | Measurement |
|---|---|
| No scheduled job writes to the CEO's board | `packages/outbox-executor/src/scheduler.ts:32-150` — 14 queues, none touching `chat_messages`; `pgboss.schedule` = 14 rows, all `timezone=UTC` |
| The manual's promise is passive | `CEO_OPERATING_MANUAL.md:21-22` (`/intelligence` renders the live view `v_morning_briefing` — "ready" at every hour) |
| Briefing content is LOCKED to one SQL view | `.planning/phases/09-jarvis-voice-layer/09-02-PLAN.md:14` — *"brifing tek SQL görünümden; ajan 'brifing yazmaz'"* |
| A thread row needs `session_id` (U26/U27) | `chat_messages.session_id NOT NULL` (migration `20260726008000`), live `\d chat_messages` |
| The board shows the newest thread by default | `(command)/chat/page.tsx:77` — `activeSessionId = params.s ?? sessions[0]?.id` over `v_chat_threads` ordered by `last_message_at DESC` |
| `source` accepts only chat/voice today | live CHECK `chat_messages_source_check = ANY (ARRAY['chat','voice'])` |
| Material the briefing may read | `v_morning_briefing`, `v_exec_overview` (24 columns), `v_revenue_capital_ceiling`, `generated_work`, `alerts`, `opportunities`, `revenue_ledger` — no new metric invented |

## Steps (each with its verification)

1. **RED first** — `tests/c9/proactive-briefing.test.ts` written against nothing (renderer, door, delivery, i18n legs). Verify: suite fails for the right reason.
2. **Migration** `20260727001000_w26_proactive_briefing.sql`: `chat_messages.content_tr`, `chat_sessions.title_tr`, `source` CHECK widened with `briefing`, `v_chat_threads` gains the TR leg, `v_ceo_briefing` (the ONE content source), `ceo_briefings` ledger `UNIQUE(briefing_date, slot)`, settings `briefing.proactive.enabled|max_per_day`, door `control_ceo_briefing_post`. Verify: applied + recorded in `supabase_migrations.schema_migrations`.
3. **Renderer** `packages/orchestrator/src/morning-briefing.ts` — pure `renderBriefing(facts, lang, date)` + `deliverMorningBriefing(db)`. Verify: red tests turn green.
4. **Scheduler** `ceo.briefing.morning`, cron `0 7 * * *` tz `Europe/Berlin`. Verify: `pgboss.schedule` row with `timezone=Europe/Berlin`.
5. **Surfaces** — board renders the locale leg + a briefing tag; thread list renders `title_tr`; dictionary keys EN+TR.
6. **Purity leg** — `scripts/i18n-purity-check.sh` gains the system-authored chat rows (a briefing message/thread missing a leg = FAIL).
7. **Full battery** — `pnpm vitest run` · `pnpm -w exec tsc -b` · `bash scripts/test/db-suite.sh` · `bash scripts/i18n-purity-check.sh` · authed Playwright.
8. **RULE #0 pass** on `/chat`, EN+TR × 1366 and 1920, screenshots read by eye, `scrollWidth === clientWidth`, zero visible "…".
9. **LIVE proof** — the job fires and the thread lands on the board with no CEO input; resident `dxb-scheduler` restarted in the same turn (U27 standing rule).
10. **Records** — spec §24quinquies (done), `00-INDEX` U37, roadmap row W2.6 closed with its evidence, `.planning/STATE.md`, commit.

## What the execution added to the ticket (recorded, not silent)

- **Two defects the author found and fixed in the same turn:** (1) the date leg crossed the driver as a local-midnight `Date` and `toISOString()` filed the first live delivery as "26 Temmuz" at 01:30 on the 27th → the view hands the day over as TEXT and `tests/c9/proactive-briefing.test.ts` pins it; (2) the door cases booked the REAL day, so once a live briefing existed every one of them answered `ALREADY_DELIVERED` → they now book a day the company will never live through (state-independent live-DB tests, R4.2 lesson).
- **Two content sharpenings from the perfection gate:** the failed line names the task AND its owning department (two tasks can share a headline — a reworded retry beside the attempt it replaced), and the alert count says how many are critical.
- **Governance mirror caught stale** (`.planning/governance/` had neither `audit-twin-rule.md` nor the current `MEMORY.md`, both owed since U36) — synced in this session, per the mirror rule in `opus-5-construction-governance`.

## Boundaries

- The SPOKEN briefing stays with wave W4 (voice repair) — recorded in §24quinquies, not silently dropped.
- Nothing faces outward: no email, no share, no spend.
- Zero revenue is not a defect (roadmap §0.1) — a briefing that reports it as failure is the defect.
