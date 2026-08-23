# AUDIT RESPONSE 2 — the re-audit of Codex Solo 5.6, 2026-08-23

The re-audit rejected the first answer in full: **"7 bulgunun 0'ı bütünüyle kapandı."** It was right
about all seven, and about the most important one it was more right than it knew — the critical
finding had **six** reproducible escapes, not three.

Nothing below is argued away. Every figure here comes from a command run in this session, and every
command is written next to its output. Where the auditor's number did not reproduce, mine did not
either: the third figure is the one a committed script prints.

Battery after these repairs: `Test Files 96 passed (96)` · `Tests 725 passed | 15 skipped (740)` ·
`tsc --build` exit 0 · `pnpm verify:ledger` OK · **the company database was not written to once**.

---

## 1 · CRITICAL — the guard was still bypassable. It no longer reads the address at all.

**The auditor:** *"PostgreSQL sürücüsünün gerçek adres çözümlemesiyle kancanın karşılaştırması
uyuşmuyor."* Correct. The repair compared `server:port/database`, and the driver does not resolve an
address that way.

**Measured — six disguises, each one CONNECTED to the holding while the guard called it a different
database.** Read-only; one identity query each, no writes:

```
spelling                  | deleted rule | actually reached        | live hook
--------------------------+--------------+-------------------------+----------
as written                | REFUSE       | postgres (oid 5) ← THE COMPANY | REFUSES
?host= query parameter    | ALLOW        | postgres (oid 5) ← THE COMPANY | REFUSES
no database in the path    | ALLOW        | postgres (oid 5) ← THE COMPANY | REFUSES
short IPv4                | ALLOW        | postgres (oid 5) ← THE COMPANY | REFUSES
IPv4 as one number        | ALLOW        | postgres (oid 5) ← THE COMPANY | REFUSES
trailing dot              | ALLOW        | postgres (oid 5) ← THE COMPANY | REFUSES
another loopback address  | ALLOW        | postgres (oid 5) ← THE COMPANY | REFUSES

ESCAPES THROUGH THE DELETED RULE: 6 of 6 disguises
REFUSED BY THE LIVE HOOK        : 7
ALL_ESCAPES_CLOSED
```

Why each one worked: `?host=` is obeyed by the driver and ignored by a URL parser · an address with
no database in its path makes libpq use the USER name, and the user is `postgres` · `127.1` and
`2130706433` are addresses a URL parser leaves alone and the resolver expands · a trailing dot is a
different string and the same host · `127.0.0.2` is a different address reaching the same server.

**THE FIX IS NOT A BETTER PARSER.** Text is the wrong thing to compare. The hook now asks the server
it actually reached who it is — the cluster's `system_identifier` and the database's own `oid` and
name — and compares that with `tools/hooks/company-fingerprint.json`. A connection cannot lie about
those: whatever spelling got it there, that is where the next `INSERT` would land.

It **fails closed**: no fingerprint file, no identity from the server, or no answer at all, and the
hook writes nothing. The match rule is `same cluster AND (same oid OR same name)` — the name is
there so a `supabase db reset` cannot blind the guard, the oid so a rename cannot open it.

```
$ npx vitest run tests/b36/hook-never-writes-company.test.ts
Tests  15 passed (15)
$ DXB_COMPANY_URL=… node scripts/b36/prove-address-escapes.mjs
ALL_ESCAPES_CLOSED
```

Both are re-runnable, and both are read-only.

---

## 2 · The count was 94, then 93, then 97, and now 96 — because nobody had committed the counter

**The auditor:** 93, and the seventh script does not exist.

Neither figure was reproducible, because both came from a shell pipeline that was thrown away. The
answer is not a better argument, it is a committed definition:

```
$ node scripts/b36/count-company-fallbacks.mjs
EXECUTABLE FALLBACKS (code or shell that can really connect): 96
   tests: 84 · scripts: 8 · db seeds: 3 · apps: 1
     apps/dashboard/src/app/api/voice/call/route.ts:53
     db/seed/apply-persona-v2.ts:71
     db/seed/import-personas.ts:84
     db/seed/import-routing-rules.ts:35
     scripts/dev/ops-live-collector.mjs:20
     scripts/dev/voice-latency-probe.mjs:13
     scripts/library/enrich.mjs:49
     scripts/library/intake.mjs:42
     scripts/library/register-arsenal.mjs:15
     scripts/org/workforce-gate.mjs:12
     scripts/phase3-lifecycle-battery.mjs:10
     scripts/systemd/install.sh:17
DOCUMENTED, NOT EXECUTABLE (.md quoting the line): 6
MENTION ONLY (address present, never bound): 11
RECONCILIATION: 96 executable + 6 documented + 11 mention = 113 files · 125 occurrences
```

**There are EIGHT scripts, and every one of them exists** — the twelve non-test files are printed
above with their line numbers, and each line was read back verbatim. The count moved from 97 to 96
inside this session when the B36 test file stopped binding the address and became a mention; the
script prints both lists and the reconciliation so a file can never fall into the gap between them.

---

## 3 · The restore now happens in a SEPARATE ENGINE, and the off-site copy was fetched back

**The auditor:** the backup was restored into a new database on the same PostgreSQL engine, and the
remote checksum was never independently verified.

**The off-site copy was not asked about — it was brought back and compared:**

```
$ sftp dxb-storagebox → get dxb-b36-pre-separation-2026-08-23.dump
local  : cf87ca2ddaa81958b6f49e98d76d860ddfd9081365cd94110b40ab39bf9501fa
fetched: cf87ca2ddaa81958b6f49e98d76d860ddfd9081365cd94110b40ab39bf9501fa
BYTE_IDENTICAL — the off-site copy was fetched back and compared, not asked about
```

**And it was THAT fetched file** — not the local one — that was restored, with owners and
privileges, into a second PostgreSQL cluster: its own container from the same Supabase image
(`public.ecr.aws/supabase/postgres:17.6.1.140`), its own port, its own volume, its own identity:

```
company : 7674907968528752679  port 54322  container supabase_db_DxB_Global_OS
restored: 7677196090715500578  port 54399  container dxb_b36_restore_probe
```

Object for object against the live company, and row for row across all sixty tables:

```
base tables|60   views|34    functions|226  indexes|117  rls policies|57
sequences|1      table grants|1482          constraints|241  triggers|30
INVENTORY_IDENTICAL
ROW_COUNTS_IDENTICAL   (sha256 of the 60-table fingerprint: 49bf4342…1a0f32 on both sides)
```

**It is a working database, not a pile of objects** — the same query answers identically on both:

```
 view_rows | joined_rows | active_agents | rls
        59 |         214 |             0 |  57      ← live company
        59 |         214 |             0 |  57      ← the fetched copy, restored
explain: Index Scan using idx_memory_kind on memory_index
```

**The limitation stays named:** 133 ignored errors, every one of them Supabase's own internals
(`supabase_realtime_admin` and `supabase_functions_admin` do not exist in the base image). This is a
**database backup, not a whole-cluster backup**; a recovery drill starts a Supabase stack first.

The probe container was destroyed with its volume and the fetched copy of his data deleted from the
scratchpad in the same hour.

---

## 4 · "The company was not touched" is now a measurement, not an inference

**The auditor:** table counts taken six days apart cannot show updates, cannot show net-zero
insert/delete pairs, and cannot show who did it. All three are true.

PostgreSQL keeps the answer itself. `pg_stat_all_tables` counts every tuple inserted, updated and
deleted per table since the statistics epoch — an `UPDATE` moves `n_tup_upd`, an insert-then-delete
moves two counters and leaves the row count exactly where it was.

```
$ DXB_COMPANY_URL=… node scripts/b36/company-write-watch.mjs
company           : 60 tables in public
engine up since   : 2026-08-23 07:49:54.617414+00
statistics reset  : never (counters run from the engine start above)
SINCE THAT EPOCH  : 0 inserted · 0 updated · 0 deleted
```

**The epoch is earlier than this work** — the engine came up at 07:49:54Z and the B36 work began
after 09:00Z — so the window covers the whole of it, and the answer inside that window is zero. The
epoch is proven, not assumed: `audit_log` holds 29,636 rows and its insert counter reads 0, which
can only mean the counters date from the engine's start.

Then the entire battery was run and the company measured again:

```
$ npx vitest run                          → Tests 725 passed | 15 skipped (740)
$ node scripts/b36/company-write-watch.mjs
COMPANY UNTOUCHED SINCE THE BASELINE — 0 inserts, 0 updates, 0 deletes, 0 row-count changes
```

The script **refuses to answer** if the engine restarts or the statistics are reset, rather than
quietly comparing numbers that no longer mean the same thing.

---

## 5 · The freeze-guard case was measuring a stranger's process

**The auditor:** it can still mistake another `sleep` on the machine for its own. Exactly right —
the discovery line was `pgrep -f <pattern> | head -1; pgrep -x sleep | tail -1` and the case took the
**last** line, which is any `sleep` at all.

**Reproduced, with a stranger deliberately started beside the decoy:**

```
our decoy   pid=535613  cmdline=[npm exec @playwright/mcp@latest 60 ]
deleted way pid=535655  cmdline=[sleep 95 ]
DIFFERENT — the deleted discovery measured a process this case never started
```

**The fix:** the decoy reports its own pid — `echo $$` inside the subshell, written before `exec`,
which replaces the program without changing the pid. The case then proves the fixture is the right
one before it tests anything: the command line must carry the pattern, and the parent must be a
reaper **by the guard's own definition** (`freeze-guard.sh:66-74` — pid 1 or this user's
`systemd --user`, which is what actually adopts an orphan here; measured ppid 7152, not 1).

```
$ npx vitest run tests/ops/freeze-guard.test.ts        (five consecutive runs)
Tests  8 passed (8) · 8 passed (8) · 8 passed (8) · 8 passed (8) · 8 passed (8)
```

Five runs because of his own standing correction: a defect that shows once in five is a defect.

---

## 6 · The stale-build check looked at the clock. It now compares the bytes.

**The auditor:** `touch` defeats it. Proven, by installing yesterday's compiled hook and touching it:

```
STALE BUILD INSTALLED: yesterday's hook, timestamp forced to now
THE DELETED CHECK (built.mtime >= src.mtime): PASSES — a stale build slips through
THE NEW CASE:
  × is built from the source that is on disk right now — byte for byte
    → tools/hooks/dist is not what tools/hooks/src compiles to — run `pnpm typecheck`.
      Built 6353 bytes, source compiles to 6631.
```

The case now compiles the source inside the test and requires the built file to be that compilation
**byte for byte** (measured: `tsc --build` and `transpileModule` emit identical bytes here). The good
build was restored and the suite is green again — and the company was re-measured afterwards, still
zero.

---

## 7 · The records now say one thing

| Record | What contradicted what | Now |
|---|---|---|
| `ceo-approvals.json` | Decision (1) still said **the company moves to its own Postgres** — the direction he REVERSED the same day before anything was built; and the conditions still said "nothing is executed until the plan is put in front of him", after he had approved it and the work had run | Decision (1) is written the way he approved it (the construction moves out, `DxB_Build`), the withdrawn direction is named as withdrawn, the verbatim carries **both** of his sentences, and the two gates that are still his — the Block 5 dry-run and `hook_violations`/`audit_log` — are written into the conditions |
| `INTEGRATION-TRACKER.md:37` | Carried **three** accounts at once: "4/13 live", "6 live · 6 waiting" (which is 12) and the corrected 5·5·3 | The stale lines are DELETED (LAW A). Re-measured this session: **5 live · 5 waiting on a credential · 3 off for want of a backend = 13**, each blocker named. **Eight are not live and not one is blocked by a policy** — the old text said six |
| Board row **B36** | Carried the unreproducible 94, `13,845 of 13,882` memory rows, and Block 0/1 evidence written before this audit | 96 with the committed counter · `13,845 of 13,919` (measured: 13,845 claude-mem + 37 pgvector + 32 obsidian + 5 notebook) · the evidence rewritten to what is proven above |

```
$ pnpm verify:ledger
ledger truth OK: 8 state claims re-measured, 94 open markers resolved against 66 board rows,
96 trigger lines all accounted for, 17 rules each in exactly one owner,
70 CEO approval claims each backed by a registered approval
```

---

## What is still open, unchanged by this response

Blocks 2 through 7 of the plan: the construction stack, the read-only window, the 96 fallbacks, the
residue move (his eye on the dry-run list first), and the proof command. The row is open and says so.

## ⚠ UNVERIFIED — what a terminal here cannot observe

- **Who wrote a row before 2026-08-23 07:49:54Z.** The counters begin at the engine's start; for
  anything earlier there is no per-tuple record, and the earlier claim of "session ownership" is
  withdrawn rather than defended. What can be said is what is written above: inside the window that
  contains all of this work, nothing was written at all.
- **The Storage Box's own copy of the file after this session.** It was fetched, hashed and compared
  during it; nothing here watches it afterwards.
