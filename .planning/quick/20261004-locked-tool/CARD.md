job: His list item 2 — a locked tool resolved by the system itself (PLAN-locked-tool.md, his yes 2026-10-04): the lock goes to the security engineer as a tool-less review task, the tool returns only when the repository's manifest carries its new text, a 15-minute deterministic watch raises what must reach him, and the tool check runs after the machine wakes
range: 1965e1fa..HEAD
blast: 2
risk: 2
reasoning: 2
ambiguity: 1

# The card — 7 / 8, critical, Sol at `xhigh`

- **His words (conversation of session 5ab4ff38, verbatim):** *"bu holding henüz tam kurulmadı buluta vpn e
  alınmadı oyüzden uyuması normalde. ilk şıkla ilgili eet"* <!-- CEO-OK: locked-tool-plan-yes-2026-10-04 -->
  — the plan yes, last step at the construction engineer; no general night catch-up.
- blast 2 — gateway (pin-check, a new watch module), orchestrator (worker-shim), outbox-executor (scheduler),
  a migration on `tasks`, the seed manifest module and a new construction script, the dashboard's alert words,
  the session-start hook, one persona file.
- risk 2 — security (tool pins, an agent reading untrusted text), database (migration, company deploy), agents,
  governance (what reaches the CEO).
- reasoning 2 — an agent reads attacker-controlled text; concurrent pin-check runs; a watch that must act once.
- ambiguity 1 — the plan is exact; the edge choices inside it are recorded below.
- fable: start+end — critical. The start call was made on the plan (PLAN-locked-tool.md § Fable); the end call
  is owed before "done".
- arrangement: lead — the pieces are coupled (audit → task → alert in one transaction, the watch reads what the
  lock wrote); the lead's context holds every measured line. The persona refile goes to a `helper-writer`
  through the `dxb-persona` door (a separate file, a door procedure).

## Decisions inside his yes (the lead's)
- **Unlock rule.** A quarantined pin is lifted only in the drifted branch: the live hash differs from the pin's
  approved hash AND the repository vouches for the live hash (manifest entry, or our own dxb-mcp source). A
  server that restores the OLD text stays locked (test (4) stands): the manifest never vouched for a change.
- **The review link.** The lock writes `tool_quarantined` → the review task → `tool_review_opened`
  {lock_audit_id, task_id}; the watch follows that row. Append-only, no audit row is updated.
- **Untrusted framing.** Old and new text enter the objective as JSON strings between a per-task random
  delimiter, so the text cannot close its own frame; the seat runs with `tools_allowed = false` — no MCP server
  is mounted (`strictMcpConfig` from the company isolation, `tools: []`).
- **The verdict.** Read from the done task's `result.text`; written whole (reasons clipped) to
  `tool_drift_verdict`; alert texts carry only fixed sentences, never the seat's words.
- **Escalation once.** Each reason (`malicious`, `review-failed`, `lock-72h`) writes one `tool_lock_escalated`
  audit row per lock; its presence is the "once". The lock alert is raised to `high` (re-opened under the same
  dedup key if he resolved it).
- **A review that is no longer needed** (the tool was unlocked) is closed only while `inbox`/`queued`
  (→ `returned`, with a task event); a running one finishes and its verdict is recorded but raises nothing,
  because the watch acts only on still-quarantined pins.
- **The wake check.** The 15-minute watch also sends one `tool-pin-check` (singleton, one per hour) when the
  newest `tool_pins.last_checked` is older than 24 h — the start and the wake in one rule.
- **manifest-add.** `scripts/gateway/manifest-add.ts` (TypeScript like its sibling `refresh-pin-manifest.ts`,
  not `.mjs` as the plan named it — it imports the manifest module directly): without `--yes` it shows the
  locked text and writes nothing; with `--yes` it writes. Unlock latency: the lift happens at the next tool
  check after the commit — the daily run, or the watch's catch-up when the last one is > 24 h old.
- **Known gap, recorded:** a tool that changes AGAIN while locked is not re-audited (the existing
  short-circuit); adding the first locked text then lifts nothing, and the 72 h rule raises it to him.

## Done-list (each a command and its expected output)
1. `pnpm vitest run tests/phase7/locked-tool-review.test.ts` — RED before the code, GREEN after:
   (a) a lock writes an informational alert with `responsible_employee` = security-engineer, a queued review
   task (`department security`, `tools_allowed false`, labels EN/TR, the lock audit id in the objective) and a
   `tool_review_opened` row, in one transaction;
   (b) a poisoned description (an instruction to call `registry_activate`, plus a forged closing delimiter) sits
   inside the frame as a JSON string, and the executor's options for that task mount NO MCP server and NO tool;
   (c) lift: the manifest vouches for the locked text → unquarantined, `tool_unquarantined_auto`, the lock alert
   resolved through `control_alerts_action` (an `alert.resolve` audit row), the queued review task returned, an
   informational "unlocked" alert;
   (d) 72 h: the lock audit back-dated → the alert `high`, escalated, one `tool_lock_escalated`; a second watch
   run adds nothing;
   (e) malicious: the task done with a malicious verdict → `tool_drift_verdict` and `high`; no alert text carries
   the seat's reasons;
   (f) failed review → `high`;
   (g) the pin-check-due rule: 25 h old → due, 23 h → not, no pins → not;
   (h) manifest-add round trip: lock → the script without `--yes` writes nothing → with `--yes` the manifest
   verifies and carries the new text → `checkPins` lifts the pin.
2. `pnpm vitest run tests/phase7/pin-quarantine.test.ts tests/phase7/drift-review.test.ts tests/b49/pin-manifest.test.ts tests/b39/alert-language.test.ts`
   GREEN — (10) rewritten to the lift (LAW A, his yes), (15) rewritten to "no re-raise; a new review task".
3. `tests/b51/bundle2-prompts.test.ts` GREEN (worker-shim strings untouched).
4. Every new alert sentence has its TR pattern; the TR lines carry no English word (alert-language test).
5. `pnpm construction:schema` applies the migration; `\d tasks` shows `tools_allowed boolean not null default true`.
6. The session-start hook prints the locked-tools line only when N > 0; `tests/hooks/session-start-fits.test.ts` GREEN.
7. `scripts/sync-personas-to-db.sh --verify` → all MATCH after the security-engineer refile; the dossier says active.
8. Build exit 0; the battery once — GREEN.
9. Company deploy: migration applied through `scripts/bootstrap-db.sh` (ledger +1), `pnpm verify:schema-parity`
   → SCHEMA_PARITY, build, nothing in flight, `dxb-scheduler` restarted, `pgboss.schedule` carries
   `tool-lock-watch */15 * * * *`, its first job completes; the catch-up sends one `tool-pin-check`
   (last 2026-10-01) and it completes; `tool_pins.last_checked` moves to today.
