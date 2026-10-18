# Proposal 1 — the holding architect (verbatim from the engineer, 2026-10-18)

## 1. Design

**Owner and contract.** The room is B42's "people on X" lane, not a new row. B42's plan says it is "PROPOSED, NOT APPROVED" and "He approves this before step 1" (`.planning/quick/20260827-arsenal-watch/PLAN.md:3,120`). So the lead shows him the adapted plan. That is a presentation, not a question. The contract is a registered adaptation in CAPABILITY_ARSENAL_DOCTRINE §9 (a "watch" lane beside the media lane precedent). The shelf rule goes in HOLDING_LIBRARY_SPEC as A11. No new spec, no new department: B42 names data-ai.

**Data.** All of it lives in one migration family. Both engines run the same `db/migrations` (SYSTEM_ARCHITECTURE:81-90).
- `watch_sources`: handle, tier, why, health state, last post time.
- `watch_runs`: one row per read pass. Calls used, posts that were new, whether the window is complete, a 429 with its resume time, and the next read. This is "the run records that it looked".
- `watch_posts`: keyed by the X status id, so a re-read updates the row instead of duplicating it. The text is flagged untrusted (§1 item 6). Posts that never become an item are purged after 30 days.
- `watch_items`: the thing itself (a repo, a model, a technique). It moves through seen → judged → trial → verdict, carries a heat count of independent authors, and holds the head's headline in both languages.
- `watch_judgments`: label, source reliability A–F, claim credibility 1–6, and the `task_id`. The reasoning stays in the task output; only a pointer is stored.
- `watch_trials`: the trial card.
- The author track record is a view, `v_watch_author_record`, not a table.
- His verdict is a row in the approval center (`operation_class 'other'`, `20260713110000_approval_center.sql:31`), and the item points to it.
- The shelf is `library_items` with `kind='research'` and `review_status='shelved'`. That column has no CHECK (`20260711002400_library_family.sql:22`). The revisit trigger goes in `usage_notes`, and `source_ref` points to `watch_items:<id>` (A3). It stores only the pointer, never the body (§16).
- Settings follow the `revenue.discovery.*` precedent: `watch.enabled`, `calls_per_pass`, `weekly_ceiling=1`, `max_findings=3`.

**Staff.**
- **Jev** sorts each post keep/drop, with Sonnet 5.5 medium taking what it is unsure of (B64 decision 7).
- **Scout:** market-intelligence-lead. It groups the kept posts into items and does the Stage 0 paper check.
- **Skeptic:** testing-reality-checker, judging blind to the scout's score.
- **Lab:** testing-tool-evaluator for tools, model-evaluation-lead for models and techniques.
- **Librarian:** knowledge-architect.
- **Head:** chief-ai-officer.

The two quality seats join data-ai through `agent_assignments`, a second membership and never a move (W9 precedent). The work runs as tasks on the existing worker rails, commissioned and then harvested exactly once. That is the `revenue_scout_runs` pattern (`20260726009000_revenue_discovery.sql:21-31`), with Agent SDK calls in the company's own home (`packages/kernel/src/sdk-isolation.ts`). The reader itself is code with no model.

**Voice.** B42 planned its own Monday 08:00 message. That message would be refused: `control_ceo_briefing_post` counts every slot against `max_per_day=1` (`20260727001000_w26_proactive_briefing.sql:337-338`), and the 07:00 briefing gets there first. Instead, `v_ceo_briefing` gains a section from `v_watch_week` on Mondays only: at most three findings, in both languages; the labels are written by the head at verdict time (the U29 headline precedent), so the renderer still writes nothing (the Phase 9 lock); nothing found means no section, while the runs still show the room looked.

**Surface.** A `v_watch_room` view, and every state change goes through `fn_opslive_notify`, the receipt door (`20260824003000_ops_live_event_receipt.sql`). The screen shows: last read and next read; the seat that is working, lit and named; items moving between columns; "0 değerli · 412 okundu" as a real answer; a 429 shown with its resume time. The drawing joins B32's package before anything is built.

## 2. The three shared decisions

**D1: where.** From the first day, the room belongs to the holding: company staff, company engine, company scheduler. It is never a construction tool. The construction keeps dxb-watch-links for the links he sends. Before the key turn, the room is built and tested on the construction engine (54422), inside the construction wall, using recorded posts (zero X calls). When its parts pass, it gets one purposeful factory trial: a single pass end to end with company staff, scheduler still disabled. From the key turn, its jobs run in `dxb-scheduler`: `watch.read` at `20 0,6,12,18 * * *` UTC, clear of the existing slots (`scheduler.ts:150-202`); then `watch.sort`, `watch.commission`, `watch.harvest`; and one `watch.lab` lane. When the holding's server stands, the reader moves to Hermes, which does the holding's browser work there (§10/§12). The `watch_posts` contract does not change. The lab stays on whichever machine has KVM. Construction sessions read the room only when they ask, through a named question on the read gateway. Never a line atop every session: that is the B55 removal.

**D2: how it reads X.** The company never uses the construction's hidden Chrome. It holds a copy of his sessions, and its port 9333 is on the never-reach list (wall 2). It also never uses his business account, which hit its quota twice today on reads shared with construction research. The room reads with its own account: a private list read with `list-tweets`, about 4–8 calls a day; `collection --until` for A-tier accounts only when the list window is incomplete; a hard budget per pass, and it stops at the first 429 and records when to resume. The path is B30's reach group: opencli is the backend Agent-Reach uses, and Agent-Reach is covered by his word `agent-reach-all-channels-2026-08-19`. The Chrome it drives is started per pass on the company's desk and stopped after, like the per-job SeedVR2 on :8189 (§11). X Articles are read with `article`. Videos are downloaded and transcribed locally, for A-tier items only.

**D3: the lab.** A throwaway QEMU/KVM VM per trial, with `restrict=on` and a `guestfwd` rule leading only to an allowlist proxy for that trial. The proxy injects the credential from outside the VM and logs every outbound call. The VM runs on a throwaway copy of a pinned cloud image and is created and destroyed by the `watch.lab` lane. Adding a lane inside an existing service is not a new service (SYSTEM_ARCHITECTURE:46). The lab gives way to the media lane's RAM guard: below 12 GiB free it refuses (§11). Nothing needs installing: qemu is present and `dxb` has a KVM ACL. The stages are 0 → 1 → 2 as in FACTS §6. The `watch_trials` row is the trial card. An INTEG-01 study card is written only when he says "install", and it cites the trial card id instead of restating it. The lab is proven first with a canary that tries to reach 9333, 4000, 11434 and `~/.claude`.

## 3. Top risks
1. Shelf flood: the A9 gate catches any task whose `output_contract` matches `\b(research|araştırma)` (`packages/hook/src/post-task.ts:131-135`), so every read pass would land on the library. Mitigation: room contracts say "gözlem hükmü", only the librarian shelves, through `control_library_action`; a test proves it.
2. Contention for X quota and identity. Mitigation: the room's own account, a budget in settings, stop on the first 429, next read shown on screen.
3. A wall breach through the lab or a post's text. Mitigation: VM blocks all egress except the proxy, credentials stay outside, posts never enter memory and never trigger gated actions, the canary trial must show the walls hold first.

## 4. What I would not do
A resident `dxb-gozlem.service` (R5) · run anything before the key turn · follow 80 accounts publicly from his business account · a second shelf or post text in `library_items` (§16) · buy an X feed (D1) · Docker, bwrap or the fleet jail for strangers' code · recommend the methodology-plugin class (1-ter) · treat likes or stars as signal.

## 5. For the CEO
- Hesap? A separate X account for the room, used only to read → Yes.
- Para? twitterapi.io ~$7/month or the official API ~$180/month, named beside the free path, not bought → No.
- Kurulum? None needed (no sbx, gVisor or opencli 2.0).
