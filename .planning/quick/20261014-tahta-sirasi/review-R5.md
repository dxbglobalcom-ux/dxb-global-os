# Review R5 — memory, screens and voice (L6 + L7), step 2

Measured 2026-10-14, 16:30-17:00 CEST. The company read SELECT-only through the read gateway (role
`dxb_gateway`); code read on the working tree; services and logs on this machine. The construction engine
(54422) was not touched.

Checked and found sound (not findings): all 109 tables, views and functions the V1 dashboard queries exist
on the company, and every view it reads answers a `select … limit 1` (only `v_project_command` refuses the
gateway role, and `authenticated` holds EXECUTE on the function behind it); the Turkish and English message
files have the same keys (0 missing either way); the two non-database memory stores resolve (the obsidian
note is on disk, the notebook note answers 200); the board page renders with no error (`var/board-watch.log`:
0 lines with "error"). The V1 dashboard is not served (nothing listens on 3000, no unit runs it) — by the
ruling `v2-location-and-v1-dead-2026-08-01` that is the expected state, so it is not reported.

### F-R5-1 — The board page he reads shows four closed rows as open and waiting on the author
- Evidence: Section 5 has a second table header at `00-BOARD-OPEN-WORK.md:394` (the complaint header, for
  C36); the four work rows after it — B61, B55, B53, B58, each opening with `**✓ CLOSED` — are parsed under
  that header, so `scripts/board/render.mjs:65` takes the "Opened" date as the body and `:69`
  (`/✓ CLOSED/.test(body.slice(0, 45))`) reads them as open. On `var/board/tahta.html` (16:27):
  `B61 … BENİ BEKLİYOR B61 27.07.2026 şikâyet defteri Bağlam sınırı … yalnız sizin gözünüzü bekliyor`;
  B55 shows "model nöbeti … sizin gözünüz kaldı" (removed entirely on his word 2026-10-01); B53 and B58 the
  same. The header says "77 açık satır · 23 kapandı" while Section 5 holds 27 rows.
- Owner row: NONE
- Layer: L7 · Severity: hurts · Needs his eye: no

### F-R5-2 — The morning briefing has not been made since 2026-09-27, and the nightly memory compaction ran once in a week, because the machine is asleep at their hour
- Evidence: `select briefing_date, created_at from ceo_briefings order by created_at desc` → last row
  `2026-09-27 05:00:42`. `pgboss.queue` (deletion after 7 days): `ceo.briefing.morning` total_count 0;
  `memory-compaction` 1 job (2026-10-10 03:00); also 0 for `hr.stale_persona_scan` and `revenue.scan`.
  Schedules (`pgboss.schedule`): briefing `0 7 * * *` Europe/Berlin, compaction `0 3 * * *` UTC
  (`packages/outbox-executor/src/scheduler.ts:152,202`). `journalctl -b -1 | grep 'PM: suspend'`: asleep
  Oct 11 22:50 → Oct 12 07:30, Oct 12 23:19 → Oct 13 07:42, Oct 13 14:58 → Oct 14 07:41 — every wake is
  after 07:00, and pg-boss does not catch up a missed cron (the 07:40 `revenue.brief` ran on Oct 12, the
  07:00 briefing did not). Root cause is shared with R2's engine area (the company stops when the machine
  sleeps).
- Owner row: NONE names it. Nearest: B11 ("Hermes set up inside the holding and its first unattended
  overnight job … until Hermes stands on the holding's server") — the 24/7 server, not this machine.
- Layer: L7 (cause in L2) · Severity: hurts · Needs his eye: no

### F-R5-3 — The voice line has been switched off since 2026-09-14 for a defect nobody owns, and three records still describe it as running
- Evidence: `systemctl --user status dxb-jarvis` → `disabled … inactive (dead)`; last line of
  `var/jarvis.log` `2026-09-14T08:15:14 SIGTERM — stopping`. The ledger entry
  `jarvis-silent-listening-voice-04-okayed-2026-09-14` gives the reason — the microphone call names no device
  and dragged his Bluetooth headset into phone-quality HFP — and says "the daemon code … is unchanged since
  2026-07-28" (still true: `git log -1 -- packages/voice/src/jarvis-daemon.ts` → `2bf1057c 2026-07-28`).
  VOICE-04 (his silent-listening law, `.planning/REQUIREMENTS.md:82`) is pending and on no board row
  (`grep -c VOICE-04 00-BOARD-OPEN-WORK.md` → 0). Records that read as if the daemon ran:
  `SYSTEM_ARCHITECTURE.md:68` "apps/jarvis + packages/voice (voice: live since R3.1)"; board B03 waits on
  "his ear at the real mic" with no word that the line is off; C38's cell "The voice daemon starts muted and
  holds a muted state". The company still holds `voice_daemon_state` = `muted | ceo | 2026-07-28 08:58`.
- Owner row: NONE for the device defect and VOICE-04. Stale cells: B03, C38 (reader A/D did not note the
  daemon is off); nearest owner of the voice stack: B12 ("VOICE — the CEO must be heard and answered in
  1.0-1.3 s").
- Layer: L7 · Severity: hurts · Needs his eye: no

### F-R5-4 — The library's usage counter has never counted anything, because it looks tools up by the wrong name
- Evidence: the trigger `trg_library_usage` on `tool_calls` (`db/migrations/20260714020000_e95_library.sql:401-403`)
  matches `name = 'dxb-mcp.' || NEW.tool OR name = NEW.tool`; real tool names are `mcp__dxb-mcp__memory_commit`
  style, library names `dxb-mcp.memory_commit`. Company: `tool_calls` 537 rows; matched by the trigger's rule
  → `0`; matched after stripping `mcp__<server>__` → `384`; `library_usage_log` 0 rows, `library_items.last_used_at`
  set on 0 of 417. So the library page's usage tab and `v_library_catalog.usage_count` show zero for tools
  that were used. `HOLDING_LIBRARY_SPEC.md:21` ("gateway her araç çağrısında … library_usage_log satırı")
  describes a write that does not happen.
- Owner row: C31 — "The catalogue is real but its use is empty: the usage log has no rows … What closes it:
  Usage recorded per item". New evidence: the emptiness is a matching bug, not only non-use.
- Layer: L6 · Severity: hurts · Needs his eye: no

### F-R5-5 — Seven open rows on his board page have no Turkish summary and seven more have a stale one, so he reads English or outdated Turkish
- Evidence: `var/board-watch.log` 16:27 `türkçe özeti olmayan: 16 · eskimiş olabilecek: 13`. Parsed from
  `tahta.html`: no Turkish on the open rows B64, B65, B66, B67, B68, B69, B70 (B64 is the current main job);
  stale on the open rows B09, B10, B11, B15, B41, B43, B51 (the rest are closed rows). The page announces
  it honestly; it still breaks the one-locale rule on a surface he reads (`scripts/board/tr.json` not
  updated when the rows were opened or rewritten).
- Owner row: NONE
- Layer: L7 · Severity: hurts · Needs his eye: no

### F-R5-6 — On the company, the not-signed-in role holds TRUNCATE (empty the whole table) on 34 of 62 tables, memory and briefings included
- Evidence: `has_table_privilege('anon', …, 'TRUNCATE')` → true on 34 of 62 public tables, including
  `memory_index`, `memory_embeddings`, `ceo_briefings`. Source: `db/migrations/20260717070000_grant_hardening_parity.sql:119-124`
  (`REVOKE ALL … FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE … TO anon`). The REST API offers no
  TRUNCATE, so reaching it needs SQL run as `anon` — reachability not measured (see Unsettled). Belongs to
  R1's area; found while reading the memory tables.
- Owner row: NONE (B64 step 1 closed EXECUTE on functions, not table privileges)
- Layer: L1 · Severity: hurts · Needs his eye: no

### F-R5-7 — The record of every tool call never says whether the call worked, how long it took or what failed
- Evidence: `select count(*), count(ok), count(duration_ms), count(error) from tool_calls` → `537|0|0|0`.
  Consequence in my area: nine `memory_commit` calls exist, and it cannot be told which of them succeeded
  (see Unsettled).
- Owner row: NONE
- Layer: L2 · Severity: hurts · Needs his eye: no

### F-R5-8 — Confirmed on the company: the voice and chat doors still open to anyone not signed in
- Evidence: `has_function_privilege('anon', …, 'EXECUTE')` → `control_voice_daemon_set_state(text,text,text)|t`,
  `fn_chat_post_message(text,text,uuid,boolean)|t`, `fn_update_routing(text,jsonb,text)|t`. All three are
  closed in `20261014010000` / `20261014030000` on the construction engine only.
- Owner row: B64 step 1 (built, not applied)
- Layer: L1 · Severity: hurts · Needs his eye: no

### F-R5-9 — A memory never records which agent run wrote it, so purging a run's records cannot find its memories
- Evidence: `memory_index.run_id` is documented as "which agent run produced the memory"
  (`db/migrations/20260711002600_memory_holding.sql:3,17`) and the purge functions clear memory by it
  (`20260719005000_control_records_purge.sql:44`); the writer `packages/memory-router/src/write-policy.ts:307-320`
  never sets it. Company: all 5 rows have `run_id` empty, though each was written by a run (task id only in
  `provenance`).
- Owner row: NONE (nearest: §2d "V2 memory — one brain, three abilities", which reader D found unowned)
- Layer: L6 · Severity: cosmetic · Needs his eye: no

## Unsettled

- Six `memory_commit` calls of 2026-07-26 (runs c18d348b, bc5dfd73, cf555e01, cc772ff9 — still in
  `agent_runs`) left no row in `memory_index`; the five rows that exist are all from 2026-09-05. Either the
  writes failed or the rows were later deleted (no migration deletes memory by anything but `run_id`, which is
  never set). Settles with: the audit_log entries of those runs, or their transcripts.
- Whether `anon`'s TRUNCATE (F-R5-6) is reachable: settles with a list of functions `anon` may EXECUTE that
  run dynamic SQL as the caller (SECURITY INVOKER + `EXECUTE`), read from `pg_proc`.

## For his eye

- ⚠ UNVERIFIED — requires human-eye confirmation: how the board page looks with F-R5-1 — four closed rows
  standing among "Beni bekliyor", B61 telling him it waits for his eye. Measured in the HTML; how it reads on
  his screen only he can say.
