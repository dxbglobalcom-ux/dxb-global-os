# AUDIT RESPONSE 1 — the seven findings of Codex Solo 5.6, 2026-08-23

The auditor was right on all seven. Three of them broke claims this session had made, and one of
those was **exploited live** before it was closed. Nothing below is argued away; where a figure of
the auditor's did not reproduce, the measurement that replaced it is shown with the query that
produced it.

Base commit `3ab2976a`, nothing committed. Battery after these repairs:
`Test Files 96 passed (96)` · `Tests 719 passed | 15 skipped (734)` · `tsc --build` exit 0 ·
`pnpm verify:ledger` OK.

---

## 1 · "The writer is dead" was **false**. The guard compared text, not target.

**The auditor's attack:** the same company database written `localhost` in one place and
`127.0.0.1` in another is two different strings, so the guard waves it through.

**It was not theoretical — it was exploited.** The attack was written as a test and run against the
build that existed at the time:

```
× refuses when the same database is spelled two different ways
× refuses when one address names the default port and the other writes it out
× refuses when an address cannot be read at all
      Tests  4 failed | 5 passed (9)
```

The first of those failed **because the hook actually wrote the row** through the second spelling.

**The fix (`tools/hooks/src/tag-subscription-call.ts`):** the comparison is now by TARGET, not by
text. `target()` parses the address and reduces it to `server:port/database`; loopback spellings
(`localhost`, `127.0.0.1`, `::1`) collapse to one token because they are one machine; a missing port
becomes `5432` because that is what the driver uses; and **an address that cannot be parsed is
treated as a possible match**, so a malformed value can never buy a write.

```
after `pnpm typecheck`:  Tests  9 passed (9)
```

Four new cases now stand permanently: two spellings of one database · default port versus written
port · an unreadable address · and the negative control, that a genuinely different database is
still written to.

---

## 2 · The remaining-paths figure was stale, and the counter itself was wrong

**The auditor said 93.** Measured today: **94** — and the earlier "94" in the record was a different
94, because the crude counter had bucketed directories wrongly and had counted the hook itself.

**The counter was validated before it was trusted** (this repository has been burned by an
unvalidated counter before). It counts a file only where the company address is **assigned to
`DXB_DATABASE_URL` on a line that is not a comment**:

```
GERÇEK GERİ-DÜŞÜŞ (company URL assigned to DXB_DATABASE_URL): 94 files
   tests: 83 · scripts: 7 · db: 3 · apps: 1
SADECE ANMA (mentioned, never assigned): 1 file
   tests/b36/hook-never-writes-company.test.ts
ÜRETİM YOLU (not a test or a script):
   apps/dashboard/src/app/api/voice/call/route.ts:53
```

So: the hook has left the set; **one script had been missed all along**; and one file mentions the
address inside an assertion without assigning it.

**Why they are not closed today, stated plainly:** 83 of the 94 are test files. Removing their
fallback before the construction engine exists would leave them with nowhere to point. Block 2
builds that engine; Block 4 closes the fallbacks. The board row now carries the corrected figure,
the corrected breakdown, and that reason.

---

## 3 · "Safety net complete" was overstated. It is now verified properly.

**The off-site copy, by fingerprint instead of by size:**

```
local  : cf87ca2ddaa81958b6f49e98d76d860ddfd9081365cd94110b40ab39bf9501fa
remote : cf87ca2ddaa81958b6f49e98d76d860ddfd9081365cd94110b40ab39bf9501fa
OFFSITE_CHECKSUM_MATCH
```

**The restore, keeping owners and privileges instead of stripping them.** The earlier proof used
`--no-owner --no-privileges`, which is exactly why grants appeared to be fine — they had not been
restored at all. Restored properly, every class of object in the company's own schema was compared:

| Object | Live | Restored | |
|---|---|---|---|
| base tables | 60 | 60 | ✓ |
| row counts, all 60 tables | fingerprint | identical | ✓ |
| functions | 226 | 226 | ✓ |
| indexes | 117 | 117 | ✓ |
| RLS policies | 57 | 57 | ✓ |
| sequences | 1 | 1 | ✓ |
| table grants | 1482 | 1482 | ✓ |
| constraints | 610 | 610 | ✓ |
| triggers | 42 | 42 | ✓ |
| views | 34 | 34 | ✓ |

**A real limitation was found by restoring properly, and it is recorded rather than hidden.** The
privileged restore reported **117 ignored errors**, and every one of them belongs to Supabase's own
internals, not to the company:

```
37 must be able to SET ROLE "supabase_auth_admin"
35 must be able to SET ROLE "supabase_admin"
21 permission denied to change default privileges
 9 permission denied for schema realtime
 5 grant options cannot be granted back to your own grantor
 4 permission denied for schema supabase_functions
 …
```

**What that means, said honestly:** this dump restores **the company's own schema completely**, and
it does **not** carry Supabase's internal ownership and privileges — those are recreated by a
Supabase stack when one is started. So the backup is a database backup, **not a whole-cluster
backup**, and a recovery drill must start a Supabase stack first. That is now a named boundary of
the safety net instead of an unstated assumption.

**On the auditor's figures** — 417 grants, 141 functions, 58 policies, 17 sequences. Only the
policy count reproduces here, and only when counted across every schema (58 all-schema · 57 in
`public`). Measured for the others: grants **1482** in `public` / **2618** across all schemas;
functions **226** / **325**; sequences **1** / **5**. The auditor's point was right and is now
answered; their numbers came from some other filter, and naming it would let both counts be
reconciled.

---

## 4 · "The company never changed" rested on 4 tables. Now it rests on 60 — and on a wider window.

The claim is no longer defended by a spot count. The company database was compared against the
**backup taken on 2026-08-17, before this session existed**, across all 60 tables:

```
=== 2026-08-17 → TODAY, what changed in the company (60 tables) ===
< cost_ledger:1592
> cost_ledger:1612
```

**One table moved, by twenty rows, in six days.** And those twenty rows are named:

```
select count(*), count(*) filter (where source='hook') from cost_ledger
  where created_at > '2026-08-17 09:35+02'
20 | 20      (2026-08-17 → 2026-08-22)
```

**All twenty carry `source='hook'`.** Every single change to the holding's records since 17 August
was written by the very hook this row exists to kill. Nothing this session did touched the company,
and the root cause is confirmed by a route entirely independent of the one that found it.

---

## 5 · The three repaired checks had new blind spots. All three are closed.

| Check | The blind spot | What it does now |
|---|---|---|
| `tests/c9/work-generation.test.ts` | A third generated task carrying no `generated_work` row would be dropped by the new join, and the length assertion would still pass | The child tasks are counted **without the join first** — `select count(*) from tasks where parent_task_id = …` must equal 2 — so nothing can hide behind it |
| `tests/ops/freeze-guard.test.ts` | `/helper with no session/` could be satisfied by **someone else's** orphan while this case's own decoy went unseen | `sawOurOrphan(log, pid)` parses the guard's kill list and requires **our** process id on the line. The failure message prints the log |
| `tests/b21/agent-context.test.ts` | `filter(l => l !== gate)` erases **every** match, so a duplicated line would vanish from both sides unnoticed | Exactly **one** occurrence is removed by index, and the case additionally asserts the gate line appears **once**, not twice |

All three green: `9 passed` · `14 passed` · `8 passed`.

---

## 6 · The built file is not in the repository. A stale build can no longer pass the battery.

True, and it is the same disease that made B21 green against yesterday's code. `dist/` is ignored
(`.gitignore:30`) while `.claude/settings.json:39` runs the **built** file.

Two things are true and both are now stated: **no build means the hook does not run at all**, which
is safe; **a stale build** is the dangerous state, because it can still carry the old fallback.

A case now closes that:

```
it("is built from the source that is on disk right now")
   → tools/hooks/dist must not be older than tools/hooks/src
```

A stale build fails the battery with the command that fixes it.

---

## 7 · The board row's own facts were wrong, and the channel arithmetic was worse than "one missing"

**The row (`B36`):**

| Field | Was | Now |
|---|---|---|
| Opened | 2026-07-19 | **2026-08-23** — board law 4 orders by the date the row was opened. The complaint history keeps its dates inside the row, where it belongs |
| Waits on | "AUTHOR — the plan waits on the CEO" | **AUTHOR** — he approved the plan and the reversal on 2026-08-23; two later gates are his (the Block 5 dry-run, and whether `hook_violations`/`audit_log` are touched at all) |
| Remaining paths | 94, with a stale breakdown including the hook | **94, re-counted with a validated counter** — 83 tests · 7 scripts · 3 seeds · 1 live route — plus the reason they cannot move before Block 2 |

**The channels.** The record said 13 channels, 6 live, 6 waiting — which is 12. Rather than hunt the
thirteenth on paper, the tool was run:

```
$ agent-reach doctor --json
TOTAL CHANNELS: 13
LIVE WITH NO KEY (5): bilibili · rss · v2ex · web · youtube
WAITING ON A CREDENTIAL (5): github · reddit · twitter · xiaoyuzhou · xueqiu
OFF (3): xiaohongshu · linkedin · exa_search
5 + 5 + 3 = 13
```

**Both published numbers were wrong, and three channels had never been written down at all.**
`LITERATURE.md:46` and `INTEGRATION-TRACKER.md:37` now carry the measured figures with the date and
the command.

---

## What is still open, unchanged by this response

Blocks 2 through 7 of the plan: the construction stack, the read-only window, the 94 fallbacks, the
residue move (his eye on the dry-run first), and the proof command. The row is open and says so.
