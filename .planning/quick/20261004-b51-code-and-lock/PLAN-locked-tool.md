# His list item 2 — a locked tool resolved by the system itself: the plan (his yes 2026-10-04 <!-- CEO-OK: locked-tool-plan-yes-2026-10-04 -->)

His question of 2026-10-01: *a locked tool should be resolved by the system itself; the alert should go to
whoever fixes it, not to the CEO* (`.planning/quick/20261004-his-list/item2-brief.txt:7`). Asked on 2026-10-04
with the three decisions of `item2-report.md` § ITEM 4 and their recommendations (1 yes · 2 yes · 3 no), he
answered *"gerekeni yap"* — not registered as his yes to the three; this plan restates them for one word.

## Measured before the plan (company engine, SELECT only, 2026-10-04 ~18:55)
- 76 pins on 5 servers, 0 quarantined; `tool_pins.last_checked` = 2026-10-01 19:39 for all 76.
- `pgboss.schedule` has `tool-pin-check 0 4 * * *` (UTC); `pgboss.job` holds ONE `tool-pin-check` row
  (2026-10-01 19:39, a manual send) — the 04:00 run has not fired since. Cause: the machine suspends at night
  (journal: suspend 2026-10-03 20:26 → resume 2026-10-04 10:36); `lease-reaper` (`* * * * *`) has 0 rows in
  UTC hours 01-06 across 8 days; no `memory-compaction`, `hr.*`, `revenue.*`, `ceo.briefing.morning` row in
  the 7-day window. pg-boss cron does not replay a missed slot.
- What he sees of it: `ceo_briefings` — the newest morning briefing is 2026-09-27 (8 rows ever); none since.
- Why the machine sleeps, measured: GNOME idle sleep is off (`sleep-inactive-ac-type 'nothing'`); each night
  logind received an explicit suspend request — 2026-10-02 23:19 → 10-03 09:44, 2026-10-03 20:26 → 10-04 10:36
  (`systemd-logind: The system will suspend now!`). Who or what sent it is not measured.
- `fn_alerts_evaluate()` (the escalation sweep) is defined and invoked by nothing: 13 alerts, 0 ever escalated.
- A lock today: `pin-check.ts` raises a `high` alert (re-raised while unresolved), `responsible_employee` null,
  quarantine sticky — lifted only by hand.
- `security-engineer`: active in the company, profile `security.mcp.json` = 23 dxb-mcp tools, among them
  `registry_activate`, `queue_dispatch`, `queue_create_task`, `approval_submit_draft`, `memory_commit` —
  none writes `tool_pins`, but each is a hand a poisoned description could try to use. Its dossier still says
  `Durum: dormant`.
- Profiles subtract quarantined pins at compile; `library.profile_recompile` recompiles on its cadence, so a
  lift reaches the seats at the next recompile.

## The design
1. **The lock goes to the fixer.** `raisePinAlert` (quarantined): level `informational`, `responsible_employee`
   = security-engineer, `suggested_action` names the review task. The re-raise-on-duplicate semantics go;
   what replaces them is the open review task and the 72 h rule (5).
2. **A review task, tool-less.** In the same transaction a `tasks` row: department `security`, `agent_id` =
   security-engineer, label EN/TR, the audit id, old and new text inside the objective framed as untrusted
   data, output contract = a JSON verdict `benign | suspect | malicious` + reasons. It runs on the normal road
   (live feed, gate, QA) but WITHOUT tools: a new `tasks.tools_allowed boolean NOT NULL DEFAULT true`
   (migration, company ledger), and `worker-shim` mounts no MCP server when it is false. The verdict text
   goes to an audit row (`tool_drift_verdict`), never into an alert title or body.
3. **Unlock = the repository's word.** `checkPins`: a quarantined pin whose live hash the manifest (or the
   own-source rule) now vouches for → one transaction: lift, new hash + text, audit `tool_unquarantined_auto`,
   the lock alert resolved through `control_alerts_action`, the review task closed if still open, an
   informational "unlocked" alert. The seat's verdict never unlocks (decision 3 = No).
4. **The manifest step is the construction's.** `scripts/gateway/manifest-add.mjs <audit_id>` appends the
   audit row's new text with its hash to `db/seed/tool-pins.manifest.json` after a person read it; the
   session-start hook (`.claude/hooks/spec-bootstrap.sh`) prints "locked tools waiting for the manifest: N
   (audit …)" from a SELECT on the company engine, so the next construction session sees it without him.
5. **What reaches him as `high`.** A `tool-lock-watch` job every 15 min (deterministic, no model): a done
   review task → its verdict audit row; verdict `malicious` → the lock alert to `high`, escalated; a lock
   older than 72 h (from the `tool_quarantined` audit row) → `high`, once; a review task failed or returned →
   `high`. The third condition he was shown ("a lock that blocks your approved work") is DROPPED: nothing
   measures it deterministically, and the 72 h rule covers it — he is told so.
6. **The check must run.** His word: the machine sleeping at night is normal until the holding moves to the
   cloud — the other night jobs stay as they are. The tool check alone runs when the scheduler starts or wakes
   and its last run is older than 24 h (the lead's choice inside his yes); without it this plan locks and
   unlocks nothing.
7. **Words.** New alert texts get their TR patterns in `apps/dashboard/src/lib/alert-title.ts` (door
   `dxb-surface`); `drift-review.ts:1-3` ("he must hear when one is") is replaced under LAW A by his yes;
   `security-engineer.md` dossier `Durum: dormant` → `active` and refiled.

## His decisions (2026-10-04, verbatim: *"bu holding henüz tam kurulmadı buluta vpn e alınmadı oyüzden uyuması
normalde. ilk şıkla ilgili eet"*)
- The plan: yes, with the last step at the construction engineer (decision 3 = No stands).
- The night jobs: no general catch-up — the sleep is normal before the cloud move.

## Card (to be filed at SCORE)
blast 2 (gateway, scheduler, worker-shim, migration, dashboard words, hook) · risk 2 (security · database ·
agents · governance) · reasoning 2 (agentic reading of untrusted text) · ambiguity 1 → 7/8 critical:
Sol `xhigh`, `fable: start+end`. Done-list includes a poisoned-description fixture proving the tool-less
review cannot act, a lift fixture, the 72 h fixture, the malicious fixture, and the manifest-add round trip.
Size: about a day; this session is at 35 % — the build goes to a successor at the handover gate.

## Fable
- **Start call** (Fable 5.1, 2026-10-04 ~19:10, the advisor call after this plan was written; the earlier call
  at ~18:58 read the approach): its gaps closed above — the tool-less review and why, the verdict kept out of
  alert texts, the work visible as the seat's task, his two sentences of 2026-10-01 named, the third escalation
  condition dropped and said so, unlock latency stated, the night-jobs dependency, the dormant dossier.
- **End call:** owed at the end of the build (critical job, `start+end`).
