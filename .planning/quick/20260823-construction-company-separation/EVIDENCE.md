# B36 — execution evidence

Every line below is a command run in this session and the output it printed. Nothing here is a
prediction. What a terminal could not observe is labelled and listed apart.

---

## Order of work — corrected on the CEO's word, 2026-08-23

The plan puts the safety net first (Block 0) and the hook fix second (Block 1). He reversed that in
his own order — *"şu suçlu dediğin şey nedir? onu düzelttin mi? ayrıca şu 5 hatayı da düzelt. sonra
başla"* — so the writer was stopped first.

**The reversal is safe and the reason is not a preference:** Block 0 comes first in the plan because
the blocks that follow it MOVE and DELETE rows. Block 1 does neither — it removes a writer's ability
to reach the company at all. Stopping a bleed before taking a photograph of the patient costs
nothing and saves a row.

He also approved the architectural reversal in §3 of the plan the same message — *"tersini de
onaylıyorum, blok 0 ile başla"*: **the company does not move; the construction moves out.**

---

## Block 1 — the writer is dead (COMPLETE)

### What it was

`.claude/settings.json:39` runs `tools/hooks/dist/tag-subscription-call.js` at the end of every
construction session. Line 66 of its source read:

```ts
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
```

That address is the **company** database. The hook then summed the session's own tokens from the
transcript and inserted them into the holding's `cost_ledger` with `department='engineering'`,
`mode='subscription'`, `task_id=null`. Complaint C24, still running, last fired **2026-08-22
18:11:51**.

### The fix, at its source

`tools/hooks/src/tag-subscription-call.ts` — the fallback is gone. The hook writes only where
`DXB_CONSTRUCTION_DATABASE_URL` points, writes **nothing** when that is unset, and refuses when that
address reaches the company's own database.

> **CORRECTED TWICE, 2026-08-23, by two independent audits (LAW A — the superseded text is deleted,
> not annotated).**
>
> **First correction.** The guard compared the two addresses **as text**, and the audit broke it in
> one line: `localhost` and `127.0.0.1` are one machine written two ways. The hole was not
> theoretical — written as a test, it **wrote the row**.
>
> **Second correction, and the one that matters.** The replacement compared `server:port/database`,
> and the re-audit rejected that too. **Six spellings were measured connecting to the holding while
> that comparison called each of them a different database** — `?host=`, an address with no database
> in its path, `127.1`, `2130706433`, `localhost.` and `127.0.0.2`.
>
> **The address is no longer read at all.** The hook asks the server it actually reached for its
> cluster `system_identifier` and the database's own `oid` and name, and compares those with
> `tools/hooks/company-fingerprint.json`. It fails closed. Fifteen cases stand over it, and
> `node scripts/b36/prove-address-escapes.mjs` re-runs the whole attack read-only:
> **`ESCAPES THROUGH THE DELETED RULE: 6 of 6` · `ALL_ESCAPES_CLOSED`**. `AUDIT-RESPONSE-2.md` §1.

### Red first, then green — the same test, twice

`tests/b36/hook-never-writes-company.test.ts` (15 cases) drives the **compiled** hook the way Claude
Code drives it: stdin JSON, a real transcript file. No case can reach the company database.

**Against the pre-fix build:**

```
$ npx vitest run tests/b36/hook-never-writes-company.test.ts
 Test Files  1 failed (1)
      Tests  4 failed (4)
```

**After `pnpm typecheck` rebuilt it (`tsc --build`, exit 0):**

```
$ npx vitest run tests/b36/hook-never-writes-company.test.ts
 ✓ tests/b36/hook-never-writes-company.test.ts (4 tests) 363ms
 Test Files  1 passed (1)
      Tests  4 passed (4)
```

The four cases: writes nothing with no construction address · writes into the construction ledger
when that address is set · refuses when the two addresses are the same · neither the source nor the
build assigns the company database outside a comment.

### The company, before and after

```
$ psql -d postgres -c "select count(*) from cost_ledger"
1612
```

1612 is exactly the sum of the groups measured before the work began
(950 `<synthetic>` + 282 fable-5 + 122 opus-5 + 113 sonnet-5 + 109 opus-4.8 + 36 haiku). The test
cleaned up after itself: `select count(*) from dxb_test.cost_ledger where model='b36t-model'` → **0**.

---

## The five governance-gate failures (COMPLETE)

`pnpm verify:ledger` was **already red before this session**. Proven, not assumed: a detached
worktree at `HEAD` (`3ab2976a`) printed the identical five failures, so this session's edits added
none.

Each line was judged on what it actually says, not silenced:

| File:line | What it says | Marker attached | Why |
|---|---|---|---|
| `.planning/research/INTEGRATION-TRACKER.md:37` | Agent-Reach — *"the six that remain wait on a CREDENTIAL"*, and the text already names the row | `<!-- OPEN: B30 -->` | Real open work; B30 is the live row that carries it |
| `.planning/research/LITERATURE.md:46` | the same fact in Turkish — *"kalan 6'sı yalnız kimlik bilgisi bekliyor"* | `<!-- OPEN: B30 -->` | Same work, same row |
| `.planning/research/rival-intel/00-LEDGER.md:49` | *"What is left of stage 1 is the synthesis … and it waits on him"* | `<!-- OPEN: B22 -->` | The rival queue's own row; its text carries the synthesis |
| `.planning/research/rival-intel/35-dbsm7rmbszo.md:292` | a measured gap in our product found by watching a rival | `<!-- OPEN: B22 -->` | Matches the corpus precedent — rival-report gap rows carry B22 |
| `.planning/research/rival-intel/38-da4deqvlocg.md:76` | a timestamped transcription of a rival's landing page at 00:15 | `<!-- HISTORY -->` | A false trigger: the phrase *"the next frames … two five-star rows"* matched the future-work pattern. What the line describes is the past, so the marker is true, and the gate keeps its teeth |

```
$ pnpm verify:ledger
ledger truth OK: 8 state claims re-measured, 93 open markers resolved against 66 board rows,
96 trigger lines all accounted for, 17 rules each in exactly one owner,
70 CEO approval claims each backed by a registered approval
```

---

## Block 0 — the safety net (COMPLETE)

### The daily pipeline still works on this machine

Run first as a blast-radius check on the backup path itself:

```
$ bash scripts/backup/laptop-pg-dump.sh
BACKUP_OK 2026-08-23 23666672 bytes
OFFSITE_OK 2026-08-23
```

### The B36 dump, named so retention cannot prune it

The daily script deletes `dxb-laptop-*.dump` after 14 days. The safety net for this row is written
under its own name so that rule cannot touch it.

```
$ docker exec supabase_db_DxB_Global_OS pg_dump -U postgres -d postgres -Fc \
    > ~/backups/dxb/dxb-b36-pre-separation-2026-08-23.dump
B36_DUMP_OK 23666672 bytes
sha256 cf87ca2ddaa81958b6f49e98…

$ scp … dxb-storagebox:./
B36_OFFSITE_OK
$ ssh dxb-storagebox "ls -l dxb-b36-pre-separation-2026-08-23.dump"
-rw------- 1 u629578-sub1 1053 23666672 Aug 23 09:18 dxb-b36-pre-separation-2026-08-23.dump
```

Byte count identical on both sides: **23,666,672**.

> **SUPERSEDED, 2026-08-23, by the independent audit (LAW A).** The two claims below — that the
> off-site copy matched, and that the restore was proven — were **true but too narrow**: the copy was
> defended by its byte count, and the restore stripped owners and privileges (`--no-owner
> --no-privileges`), so grants were never actually restored and therefore never actually compared.
> The proper verification, including the **117 ignored errors** a privileged restore reveals and the
> boundary they mark, is in **`AUDIT-RESPONSE-1.md` §3**. What stands below is kept as the record of
> what was run at the time, not as the proof.

### The dump is proven by restoring it, not by its size

```
$ create database dxb_b36_verify; pg_restore -d dxb_b36_verify …
pg_restore: warning: errors ignored on restore: 2

$ <row-count fingerprint over every public base table, both databases>
canlı  uzunluk: 1012
geri yüklenen  : 1012
RESTORE_DIFF = 0 — bütün tabloların satır sayıları birebir aynı
tablo sayısı: 60
```

**The two ignored errors were measured, not waved away.** Both are `permission denied for table
secrets` — Supabase's own `vault.secrets`, which even the superuser may not COPY into. It holds
nothing:

```
$ select count(*) from vault.secrets   → live 0 · restored 0
```

So the dump loses nothing. **Recorded as a boundary all the same:** if the vault is ever used, this
backup path will not carry it, and that becomes its own row.

> **SUPERSEDED, 2026-08-23, by the independent audit (LAW A).** The four counts below are a spot
> check, and the sentence they carried — *"the company is untouched"* — reached wider than they do.
> It is now proven across **all 60 tables** and against the backup taken on **2026-08-17, before this
> session existed**: exactly one table moved, `cost_ledger` by twenty rows, and **all twenty carry
> `source='hook'`** — the writer this row exists to kill. See `AUDIT-RESPONSE-1.md` §4.

### The scratch database is gone and the company is untouched

```
$ drop database dxb_b36_verify;
DROP DATABASE
$ select datname from pg_database
_supabase dxb_test postgres template0 template1

$ select counts from the company
cost_ledger=1612 · tasks=217 · agents=205 · audit_log=29636
```

Identical to the figures measured before Block 0 began.

---

## Three defects the battery was hiding — found while proving this work, fixed at source

None of the three was caused by this session's changes, and all three were proven so before being
touched. They surfaced because `pnpm typecheck` rebuilt the packages, and the battery had been
running against a build older than its own source.

### 1 · `tests/b21/agent-context.test.ts` — green because the build was stale

`standingPrompt` returns eight lines and the case compared `slice(0, -1)`: it assumed the
approval-gate line was **last**. On **2026-08-21 01:11** commit `de149a53` appended `noRefusalLaw()`
after it (`packages/voice/src/prompt-core.ts:159-168`), and the assumption broke. The battery stayed
green because `packages/voice/dist/prompt-core.js` had never been rebuilt after that change — the
suite was testing yesterday's code.

The contract was never about position. It is that the two lanes differ in the approval-gate line and
in nothing else, so the case now compares by identity, not by index. `9 passed (9)`.

### 2 · `tests/c9/work-generation.test.ts` — an ordering that had no order

`AssertionError: expected [ 'sales', 'commerce' ] to deeply equal [ 'commerce', 'sales' ]`.

The query read `order by created_at`. Every task of one plan is written inside a single transaction,
so all of them carry the same `now()` and the tie was broken by whatever order the planner chose —
green alone, red inside the battery. `generated_work.step_index` is the order the plan actually has;
the query now joins it. This is the "nobody can count this project the same way twice" class.

### 3 · `tests/ops/freeze-guard.test.ts` — the live sweeper was eating the test's fixture

`expected '' to match /helper with no session/`.

The case starts a decoy carrying `npm exec @playwright/mcp@latest`. The **resident**
`dxb-freeze-guard.service` — installed on this machine 2026-08-21, `FREEZE_GUARD_INTERVAL=10`,
**real kills, not dry** — matches that exact pattern (`scripts/ops/freeze-guard.sh:157`) and can reap
the decoy inside the one second the case needs it. Then the case's own dry pass has nothing to
report. Nothing was wrong with the guard; the test was not isolated from the live one.

The case now clears its log first and rebuilds the fixture until its own pass has observed it.

### What the battery does after the three fixes

Six full runs today. Before the fixes: red on b21, then red on c9, then red on freeze-guard — a
different one each time. After them:

| Run | Result |
|---|---|
| 1 | `Test Files 96 passed (96)` · `Tests 714 passed \| 15 skipped` |
| 2 | 714 passed |
| 3 | **1 failed** — `tests/e10/hook.test.ts` §17 invalid policy JSON, `expected 'PASS' to be 'REJECT'` |
| 4 | 714 passed |
| 5 | 714 passed |

### 4 · `tests/e10/hook.test.ts` — root-caused, reproduced on demand, fixed

**The sentence that stood here — *"one failure in five runs, not root-caused, it belongs in its own
row"* — is deleted (LAW A).** The CEO refused it in one line: *"o 5 test'in 1 hata ise neden hatalı
testi yok saymayı teklif ediyorsun?"* He was right; frequency does not shrink a defect. It was found.

**The mechanism.** `fn_hook_set_policy` is idempotent BY KEY: given a key it has already recorded, it
returns the stored response and **does not apply the change** —
`db/migrations/20260714030000_e10_hook_engine.sql:231-236`:

```sql
    FROM control_idempotency WHERE key = p_idempotency_key;
    …
    RETURN v_prev.response;
```

The suite calls it with the **constant** key `e10t-invalid-rule`, and cleared its keys **only in
`afterAll`**. So a run that never reached `afterAll` — killed, timed out, machine frozen — left the
key behind. The next run then got `ok:true` from a replay while the broken rule was never written,
the gate correctly answered `PASS`, and the case failed for a reason that had nothing to do with the
code under test.

**It matches this session's own timeline exactly.** A battery loop was killed by a two-minute limit
(`exit 143`) mid-run; the very next full run is the one that failed.

**Reproduced on demand — the proof this is the cause and not a story:**

```
$ insert into control_idempotency(key,request_digest,response)
    values ('e10t-invalid-rule','fake','{"ok":true}');
$ npx vitest run tests/e10/hook.test.ts
 FAIL … §17 invalid policy JSON → gate REJECTS
      Tests  1 failed | 34 passed (35)
```

**The fix, at its source:** the suite now clears its own keys in `beforeAll` as well. A suite may not
inherit the residue of a predecessor that was killed.

```
$ (same residue inserted again)
$ npx vitest run tests/e10/hook.test.ts
      Tests  35 passed (35)
```

**Nine sibling suites also touch `control_idempotency`. None was fixed blindly — each was measured.**
Five build their keys per run (`${M}-${randomUUID()}`: `e122/widget-layout`, `e9/approval-center`,
`e9/workflow-runner`, and `e8/alerts` + `e8/audit-surface`, whose keys carry a freshly inserted row's
id). The three that DO use constant keys were tested by inserting their residue and running them:

```
tests/e9/library.test.ts          → Tests  13 passed (13)
tests/e9/project-command.test.ts  → Tests  17 passed (17)
tests/r42/knowledge-shelf.test.ts → Tests   6 passed (6)
```

All three survive the residue, so **none of them was touched.** `e10` was the only suite exposed,
because it is the only one that asserts the door's EFFECT rather than its `ok`.

### The battery after the fourth fix

The hardest run first: the poisoning residue deliberately left in place, then the full battery.

| Run | Condition | Result |
|---|---|---|
| 1 | **`e10t-invalid-rule` residue present** | `Test Files 96 passed (96)` · `Tests 714 passed \| 15 skipped` |
| 2 | clean | 96 files · 714 passed |
| 3 | clean | 96 files · 714 passed |

```
$ pnpm typecheck      → tsc --build, exit 0
$ pnpm verify:ledger  → ledger truth OK
```

**Three consecutive green full runs, one of them deliberately poisoned. Zero failures.**

---

## ⚠ UNVERIFIED — requires a human eye

- Nothing in this session changed a surface the CEO looks at, so no design pass was owed. The first
  visible change arrives in Block 5, when the coffee-token row leaves his risk register.


---

## The second audit, and what it cost — 2026-08-23 afternoon

Codex Solo 5.6 re-audited the answer above and rejected it in full: **"7 bulgunun 0'ı bütünüyle
kapandı."** It was right on all seven, and on the critical one it was more right than it knew — the
guard had **six** reproducible escapes, not three.

The full answer, command by command, is `AUDIT-RESPONSE-2.md`. What changed in the repository:

| | Was | Is |
|---|---|---|
| The hook's guard | compared the ADDRESS (`server:port/database`) | asks the SERVER for its cluster id, database oid and name; fails closed; `tools/hooks/company-fingerprint.json` + `scripts/b36/company-fingerprint.mjs` |
| The escape proof | none | `scripts/b36/prove-address-escapes.mjs` — read-only, re-runnable, `ALL_ESCAPES_CLOSED` |
| The fallback count | a shell pipeline nobody kept (94, then 93) | `scripts/b36/count-company-fallbacks.mjs` — **96 executable**, every non-test file printed with its line |
| The restore proof | a new database on the SAME engine | the off-site copy **fetched back** from Hetzner and restored into a **second cluster** in its own container, identical object for object and row for row |
| "The company was not touched" | four table counts, six days apart | `scripts/b36/company-write-watch.mjs` — PostgreSQL's own per-tuple counters, **0 inserted · 0 updated · 0 deleted** across all 60 tables since the engine started, and it refuses to answer if the epoch changes |
| The freeze-guard fixture | found by `pgrep -x sleep \| tail -1` — any sleep on the machine | the decoy reports its own pid, and the case proves the fixture is its own before testing it |
| The stale-build case | compared modification times (`touch` defeats it) | compiles the source in the test and compares the built file **byte for byte** |
| The records | approval register, board row and channel account each said something different | one measured account in each, the superseded text deleted |

```
$ npx vitest run
Test Files  96 passed (96)
     Tests  725 passed | 15 skipped (740)
$ pnpm typecheck                    → exit 0
$ pnpm verify:ledger                → ledger truth OK
$ node scripts/b36/company-write-watch.mjs
COMPANY UNTOUCHED SINCE THE BASELINE — 0 inserts, 0 updates, 0 deletes, 0 row-count changes
```
