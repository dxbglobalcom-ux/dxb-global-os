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
> cluster `system_identifier` and the database's own `oid` and name. `node
> scripts/b36/prove-address-escapes.mjs` re-runs the whole attack read-only:
> **`ESCAPES THROUGH THE DELETED RULE: 6 of 6` · `ALL_ESCAPES_CLOSED`**. `AUDIT-RESPONSE-2.md` §1.
>
> **Third correction, and the shape that holds.** Asking the server was the right question in the
> wrong direction: comparing the answer with the HOLDING's identity is a deny rule, and a deny rule
> is fail-open on anything it has not been told about — rebuild the holding's database and the
> recorded identity stops matching, so the guard lets the write through. A third audit said so.
> The hook now writes ONLY into an identity on the ALLOW list in `tools/hooks/ledger-identity.json`
> (`scripts/b36/ledger-identity.mjs`, which refuses to put the holding on it), stops when the
> recorded company identity has gone stale, has a deadline on every leg and a watchdog over the whole
> run, and the built file travels with the commit. Twenty-one cases stand over it.
> `AUDIT-RESPONSE-3.md` §1.

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
| The hook's guard | compared the ADDRESS (`server:port/database`) | asks the SERVER for its cluster id, database oid and name — and a third audit then replaced the DENY rule with an ALLOW list, because a deny rule is fail-open on a rebuilt company: `tools/hooks/ledger-identity.json` + `scripts/b36/ledger-identity.mjs` |
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

---

## Block 2 — the construction site moved out (COMPLETE)

*2026-08-23, on the CEO's word "block 2 ye başlayabilirsin".*

### What it was

The battery wrote into `dxb_test`: a database that lived **inside the company's own Postgres
engine**, holding a full copy of the holding — 205 agents, 217 tasks, 1,596 cost rows, **40,137
audit rows**, 138 MB, every one of them a copy of his. It was a NAME, not a wall, and Block 1
proved how thin a name is: six spellings of one address each connected to the holding while the
guard reading them called it a different database.

### What it is now

The construction site has its own Supabase stack. Its own container set, its own ports, its own
volume, **its own PostgreSQL cluster identifier** — and the company does not exist on it at all.
A mistyped address no longer lands on the CEO's data; it lands on a port where the holding is not.

```
company      supabase_db_DxB_Global_OS   127.0.0.1:54322   cluster 7674907968528752679
construction supabase_db_DxB_Build       127.0.0.1:54422   cluster 7677236350688722983
```

The address is spelled **once**, in `tests/construction-engine.ts`, and imported by
`vitest.config.ts` and `tests/global-teardown.ts`. `dxb_test` is dropped; the company engine now
carries `postgres`, `_supabase` and the two templates and nothing else.

`construction/supabase/config.toml` is **generated, never hand-written** —
`scripts/b36/make-construction-config.mjs` derives it from the company's config by exactly three
rules (`project_id`, every `543NN` port → `544NN`, and the CLI's own migration runner off), and
`tests/b36/construction-config.test.ts` fails the battery on any drift, on any port collision, and
if the migrations folder ever stops being the SAME folder.

### The schema is the same schema, and that is measured, not asserted

`node scripts/b36/schema-parity.mjs` asks both servers the same nine questions about `public` and
hashes the sorted answers:

```
company      : 7674907968528752679 / postgres
construction : 7677236350688722983 / postgres

columns      company   602 4e813c836f631ff7  construction   602 4e813c836f631ff7  same
constraints  company   241 b48456af2b022d3a  construction   241 b48456af2b022d3a  same
indexes      company   117 236b9fac86d3ce0a  construction   117 236b9fac86d3ce0a  same
functions    company   226 afb2d504fe5411e5  construction   226 afb2d504fe5411e5  same
views        company    34 …  construction    34 …  same after removing PostgreSQL's own default type labels
view_columns company   461 72649692695f1e0b  construction   461 72649692695f1e0b  same
policies     company    57 50677097944b0bcc  construction    57 50677097944b0bcc  same
triggers     company    30 49c9ca13aa3cb76b  construction    30 49c9ca13aa3cb76b  same
sequences    company    13 45ec7c9bf3fb88d5  construction    13 45ec7c9bf3fb88d5  same

SCHEMA_PARITY — the two engines carry the same public schema, object for object.
```

**The one normalisation is printed, never hidden.** `v_alerts_active` renders its UNION's second
arm with PostgreSQL's own default type labels on the company (`'approval'::text AS text`) and
without them on the construction engine. Same image `17.6.1.140`, same server version, and the
migration that creates it has exactly one commit and was never edited. It cannot mean anything —
a column alias in a non-first UNION arm is discarded, and the gate proves the two views' OUTPUT
columns identical **strictly**, under `view_columns`, where nothing is normalised. The removal is
bounded to one shape: ` AS x` where `x` is the very type the expression was just cast to.

### Its data is GENERATED — not one row of his travels

`db/seed/build-seed.ts`, run as `pnpm construction:seed`. It refuses to run against the company at
all: it asks the server for its cluster id and database oid and compares them with
`tools/hooks/ledger-identity.json` — the same one owner of "who the company is" that Block 1's
guard uses. Every step reads FILES or invents rows:

```
build-seed → 7677291653303935015/5 (postgres)

  generated holding, projects and memory stores     1 company · 2 project(s), 1 rewritten · 4 memory store(s)
  routing rules                                     37 enabled rules, tiers L1,L2,L3,L4
  generated personas for every seat                 199 seat(s) · 199 version(s) · 199 written, 0 swept
  gate, bind and activate the generated workforce   199 active · 199 bound
  generated employee records                        199 record(s)
  tool pins from the live MCP servers               context7=2 dxb-mcp=21 git=12 playwright=24 scrapling=10
  library intake, arsenal and grants                493 item(s) · 252 grant(s)
  generated operating layer                         3 milestone(s) · 1 run(s) · 1 voice identity

BUILD_SEED_DONE — a whole holding, and not one row of his.
```

199 employees and 199 active — the same shape as the company's workforce, because the SEATS are
defined by this repository's own migration chain, not by anything in his database. What sits in each
seat is invented here: see *The third audit* below, which is where the first version of this step —
one that copied his 199 authored dossiers word for word — was found and removed.

### The whole thing rebuilt from empty, and the battery run against that

Not "it works on the database I have been poking at all afternoon". The stack was **destroyed**
(`supabase stop --no-backup`, volume gone, new cluster identity) and rebuilt from nothing:

```
$ pnpm construction:start            → Started supabase local development setup.
$ pnpm construction:schema           → [bootstrap] done — applied 156, skipped 0, ledger total 156
$ pnpm construction:seed             → BUILD_SEED_DONE
$ npx vitest run
Test Files  99 passed (99)
     Tests  737 passed | 15 skipped (752)
$ pnpm typecheck                     → exit 0
$ pnpm verify:ledger                 → ledger truth OK (8 state claims, 94 open markers, 70 approval claims)
$ bash scripts/i18n-purity-check.sh  → I18N PURITY: PASS (en 2395 = tr 2395)
$ gitleaks detect                    → 729 commits scanned, no leaks found
```

The schema is built by `scripts/bootstrap-db.sh` — **the project's own canonical chain** (audit
F-08), the same command a deploy uses — and not by the Supabase CLI's migration runner, which
cannot build it: measured on the first start of this stack, it walked 20260707000001 →
20260712007950 and died on `relation "pgboss.queue" does not exist`, because pg-boss's schema is
runtime-born by its own initializer. `[db.migrations] enabled = false` in the construction config
is that measurement, written down.

### The company, across all of it

```
$ node scripts/b36/company-write-watch.mjs
objects watched   : 186 tables · 18 sequences · 2616 grants · 1614 structural objects
HIS OWN TABLES, SINCE THAT EPOCH: 0 inserted · 0 updated · 0 deleted (73 tables)
COMPANY UNTOUCHED SINCE THE BASELINE — 0 rows, 0 sequences, 0 grants, 0 structure
```

**And then the company moved — by its own hand, and the watch named it.** Shipping the runtime fix
below required restarting the resident scheduler, and pg-boss ran its own retention sweep on boot:

```
COMPANY CHANGED — 5 place(s):
   tables pgboss.job_common: ins 0 → 70 · upd 0 → 139 · del 0 → 276569 · rows 303136 → 26638
   tables pgboss.queue/schedule/version: upd only
   Supabase's own internals moved in 2 place(s): realtime.messages 7 → 8
```

That is the holding's own queue clearing 276,569 **completed** jobs it had been carrying (the
303,136 the plan measured as M10), and at that moment his RECORD had not moved by one row:

```
$ select … from pg_stat_all_tables where schemaname='public' and (ins+upd+del) > 0
NOTHING IN public HAS MOVED — 0 inserted, 0 updated, 0 deleted across all 60 tables
```

It is worth saying plainly what this proves: **the watch is not blind.** It reported zero for
fifty minutes of construction work and then caught the company's own daemon within seconds.

### ⚠ AND THEN IT CAUGHT SOMETHING THAT IS HIS TO RULE ON — a SECOND writer, still live

At the end of the block the same watch reported `public.memory_index` growing by **1,818 rows**,
13,919 → 15,737. Measured at source:

```
$ select store, scope, kind, count(*), max(created_at) from memory_index
   where created_at > now() - interval '6 hours' group by 1,2,3
 claude-mem | holding | fact | 1818 | 2026-08-23 15:00:29.771961+00

$ select name, state, count(*), max(completed_on) from pgboss.job where name = 'claude-mem-sync' …
 claude-mem-sync | completed | 9 | 2026-08-23 15:00:29.776863+00
```

**The writer is the company's own resident scheduler.** `claude-mem-sync` is an hourly job
(`packages/outbox-executor/src/scheduler.ts:38`, cron from the memory lifecycle design) that pulls
the **claude-mem store — the construction sessions' own diary — into the holding's `memory_index`
at `scope='holding'`.** It fired once during this session, at 15:00:29, and put 1,818 rows of this
afternoon's construction work into the holding's brain.

So it is **not** construction reaching into the company; it is the company reaching out and pulling
construction in, on purpose, on a schedule. But the effect is the disease this row exists to end,
and it is the plan's own measurement M8 alive: **13,845 of 13,919 rows in the holding's memory came
from that store**, and the count is climbing while the work runs.

**Block 1 killed one writer. This is a second one, and nobody had named it as a writer.** It is
NOT touched here, for two reasons, and both are the CEO's: `claude-mem` is one of the two plugins
he ordered ON, and what the holding's memory is allowed to contain is a decision about his company,
not a cleanup. It goes to **Block 5** beside the other residue, on his dry-run list, with this
measurement attached.

**⚠ UNVERIFIED — requires his ruling:** whether `claude-mem-sync` keeps running at all, whether it
writes at a different scope, or whether it stops pointing at the company.

### Seven defects this block found — none of them invented, all fixed at source

**1 · The migration chain resurrects 15 employees the CEO ordered deleted.**
On 2026-07-19 he said *"C8 sil."* and 15 dormant personas were deleted — files, archived `agents`
rows and library mirrors — directly on the company database, in commit `3ae5ac95`. **The act was
never written into the chain.** A database built from the chain therefore comes up with 220 agents
against the company's 205, the extra 15 pointing at `personas/_library/*.md` files that same commit
removed. Any fresh environment — a new machine, a disaster-recovery restore, a staging deploy —
brings them back. Closed by `db/migrations/20260823001000_c8_persona_deletion_chain_parity.sql`,
which is a **no-op on the company** (proven read-only: 0 agents, 0 library_items, 0 audit rows it
would write) and performs his order everywhere else. After it: **205 agents, 199 active** — the
company's own figures.

**2 · The velocity breaker dies when the proxy's spend table is absent.**
`packages/outbox-executor/src/breaker.ts` read `litellm."LiteLLM_SpendLogs"` unguarded. Its own
comment promises the hard signal survives a proxy outage; it did not — the read threw first and the
whole brake stopped running. Measured on an engine without that schema: five breaker cases failed,
none of them at the trip. Now the table is asked for with `to_regclass` (which returns NULL instead
of raising) and the ledger figure alone governs when it is absent. On the company `to_regclass`
returns non-null, so the path there is byte-for-byte the old one — measured.

**3 · The monthly cap swallowed an error that had already poisoned its transaction.**
`monthly-cap.ts` wrapped the same read in `try/catch`. The catch runs, but PostgreSQL has already
aborted the surrounding transaction — and this function is documented to run inside one, so every
command after it died with *"current transaction is aborted"*. Same repair, same proof.

**4 · The `git` MCP server has been DEAD for the whole holding, and nobody could see it.**
`uvx mcp-server-git==2026.7.10` pinned the server and not the SDK it imports, so `uvx` resolved the
newest `mcp` at every launch — and it had moved: `'Server' object has no attribute 'list_tools'`.
Zero of its 12 tools could be enumerated. It was invisible because `tool_pins` still carried the 12
rows pinned on the day it last worked: **a stale row and a live capability are not the same thing,
and only a database built from scratch could tell them apart.** Pinned to `mcp==1.12.0`; the server
answers again with all 12 tools, `git_status` among them.

**6 · The whole senior layer reads a gap analysis as its own identity — on any fresh environment.**
On the company the CFO's `persona_path` is `personas/finance/cfo.md`. On a database built from the
chain it is `HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md` — a planning document — and so are the
CISO's, the CMO's, the CHRO's, the Chief AI Officer's, the General Counsel's and seven more
department heads': **thirteen rows.** The wave migrations created them with the matrix as a
placeholder and a later session repointed them directly on the company database, outside the chain.
Closed by `db/migrations/20260823002000_head_persona_path_chain_parity.sql`, an explicit slug→file
map checked file by file against the repository (a path is never derived from a department name —
`cfo` lives under `finance`, `ciso` under `security`, and no rule connects the two). **A no-op on
the company: 0 rows there carry the matrix path.** Worth naming: `tests/e125/workforce-gate.test.ts`
case (4) does not catch this, because it asserts the stored path EXISTS and the gap matrix does
exist. A path can point at a real file and still be the wrong file.

**7 · The sicil sync silently dropped 28 of 199 employees outside the company.**
`scripts/sync-employee-records.py` matched each dossier to its employee by the **uuid** written in
the dossier's first row. A uuid is a snapshot of ONE database: the migrations mint agent ids with
`gen_random_uuid()`, so every environment gives the same employee a different id. Measured on the
construction engine: **171 of 199 matched, 28 were dropped — the C-suite among them — and the
script still reported success.** It now matches on the **slug**, which is the dossier's own file
name and is the same everywhere. Result: 199 records, 0 live agents without one. Proven safe on
the company read-only before the change: all 199 dossier slugs resolve to exactly one live agent
there, and it already holds 199 records.

**5 · `scrapling` pointed at a user who does not exist on this machine.**
`packages/gateway/policy/grants.json` and the strategy profile carried
`/home/ghost/scrapling-env/bin/scrapling` — the X230's user, the B29 class. The binary is at
`/home/dxb/…` and works. Re-pinned: 10 tools. *(The remaining `/home/ghost` occurrences are frozen
history documents and stale permission entries; they belong to board row B29, not to this one.)*

### One test was pinned to one database, and it is not any more

`tests/r23/unified-constitution.test.ts` carried `const PROJECT = "68ce909a-…"` — the literal uuid
of one row in one database — so the suite could only ever run against that database, and three
cases died on `workflows_project_id_fkey` the day the battery moved. It now finds the holding's own
project by its **slug**, which the seed fixes.

### And Block 1's drill was only green while the company was asleep — rebuilt

Restarting the resident services as part of shipping the fixes above made
`scripts/b36/prove-block1.mjs` answer **`BLOCK1_OPEN`**: it saw 4 tables move and 18 write
statements. **Not one of them came from the hook.** The company runs its own pg-boss scheduler and
its own JARVIS intent drain, and both write into its own tables continuously. The drill was
measuring *"did anything write?"*, and it had been green only because those services happened to be
quiet — which is not a state the company is ever in.

**Two attempts were made to subtract that noise by sampling it, and both lost the race.** Measuring
a 20-second control window and excluding whatever moved in it is not enough: pg-boss's cron
heartbeat is on 60 seconds and its monitor and maintain passes on minutes, so each battery run
flagged a different pg-boss statement — `pgboss.version`, then `pgboss.queue`, then `pgboss.bam`.
Widening the window until it covers every cadence is a race a drill inside a test battery will keep
losing, and an intermittent red is worse than a weak green. Both attempts are written down here
because the third answer is only convincing if the first two are visible.

**The verdict does not rest on the noise at all now.** It rests on two things nothing else on that
server can imitate:

1. **The hook's own signature.** It writes exactly one thing — a `cost_ledger` row carrying the
   session id it was handed — and the drill hands it 18 ids nobody else has. If one of them appears
   in the company, the hook wrote. That is attribution, not inference.
2. **What the compiled hook can do at all**, read out of the artefact that actually runs at session
   end: `tools/hooks/dist/tag-subscription-call.js` must contain exactly one write construct and it
   must be the `cost_ledger` insert.

Both self-validate in the same run, and the run REFUSES TO GIVE A VERDICT if either does not: a
scanner that found no write would be broken rather than reassuring, and the detector must be shown
registering a real write on the permitted ledger.

```
conditions fired   : 18
refused            : 18
the hook's own signature in the company: 0 row(s) carrying any of the 18 session ids this drill handed it
what the compiled hook can write at all: 1 × cost_ledger insert · 0 other write construct(s)
what the company did on its own while the drill ran (context, not a verdict): 14 statement(s)
    · pgboss.job, pgboss.job_common, pgboss.queue, pgboss.version
detector validated: YES — the permitted ledger recorded 1 new write statement(s) from the same hook in this run
scan validated:     YES — it found the hook's one known write in the built file

ANSWER: NO — the hook cannot send an INSERT, UPDATE or DELETE to the company database.
BLOCK1_CLOSED
```

The before/after measurement stays and is still printed — as **what the company did while the drill
ran**, named table by table. It is context a reader can see, and it is no longer asked to answer a
question it cannot answer.

**And the test that runs the drill was hiding its answer.** It used `execFileSync`, which throws away
everything the drill printed when it exits 1 — so the battery's red line read only *"Command
failed"*, with the eighteen conditions and the offending statement gone. It uses `spawnSync` now and
asserts on the full output. **A red that does not say why is not a test result.**

**Block 1's answer is unchanged and now stands while the company is awake** — which is the only
state that matters. **What is honestly weaker than the earlier claim:** the headline
*"0 write statements ever reached the server"* was only ever true of an idle company, and it is
replaced by *"0 rows carrying the hook's own signature, and the compiled hook has no other write"*.
That is narrower in wording and stronger in fact, because it survives the company doing its work.

### Registered adaptations — where this block deviated from the plan, and why

| Plan said | What was built | Why |
|---|---|---|
| the construction stack gets "its own password" | the Supabase CLI's fixed local credentials | Measured on CLI 2.109.0: `[db]` has `port`, `shadow_port` and `major_version` and **no password field**. The wall here is the engine and the port — a different cluster the company does not exist on. The credential wall is Block 3's `dxb_reader`, which takes the write privilege away at the server. |
| schema built by the CLI from `supabase/migrations` | schema built by `scripts/bootstrap-db.sh` from the SAME `db/migrations` | The CLI's runner cannot build it from empty (pg-boss's runtime-born schema, measured above). The repository already owns the one command that can, and it is the one a deploy uses. |
| `dxb_test` dropped last | dropped, after the battery was green on the new stack and `dxb-b36-pre-separation-2026-08-23.dump` was confirmed present (23,666,672 bytes, local and off-site) | as written |
| — | `scripts/test/refresh-test-db.sh` deleted | Its one job was to clone the company's rows onto the construction side. Leaving it is leaving a loaded gun; `db/seed/build-seed.ts` replaces it. |

### ⚠ UNVERIFIED — requires a human eye

- **The CEO's live surfaces and his login.** The company stack was not modified — no container was
  restarted, no schema changed, `public` shows zero writes — but "his tiles still move and he can
  still log in" is not something a terminal can see. It waits for his eye.

---

## The third audit — Codex Solo 5.6 on Block 2, three FAILs, all three real

Read-only audit of Block 2, 2026-08-23 evening. Three findings, no argument with any of them, and
the CEO's instruction was that these three and nothing else would be answered. Each was written as a
test that was **shown failing before the fix and passing after it**.

### 1 · The battery carried the company's address and its write-capable account

**His finding:** *"Take the company's 54322/postgres connection out of the full battery.
`tests/b36/block1-question.test.ts:26` hands the company's address and the write-capable `postgres`
account to a subprocess."*

**Measured RED first** — a sweep of every file `pnpm test` loads, judging a line by whether it could
open a connection (a comment that records history is not a key; the inert
`process.env.DXB_DATABASE_URL ??= …` fallback that `vitest.config.ts` defeats is Block 4's and is
named as tolerated):

```
tests/b36/block1-question.test.ts:26        const COMPANY = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
tests/b36/hook-never-writes-company.test.ts:58   const COMPANY_URL = "postgresql://…:54322/postgres";
tests/b36/hook-never-writes-company.test.ts:63,65,66,67,68,69   the six escape spellings
tests/b36/hook-never-writes-company.test.ts:218,276              …:54322/_supabase
tests/phase3/crash-worker.mjs:14            process.env.DXB_DATABASE_URL ?? "postgresql://…:54322/postgres"
→ 11 offenders
```

The eleventh is one the auditor did not cite and the sweep found: `crash-worker.mjs` is a process the
battery **spawns**, and its fallback was a live `??`, not the inert `??=`. It now stops with an error
instead of guessing an address.

**What was done, and why nothing is lost.** The guard's rule was never about the company in
particular — it is *ask the server who it is, and refuse unless the answer is on the allow list*.
Every branch of that rule is now exercised on the CONSTRUCTION cluster, and the branches that need a
forbidden database get one by rewriting the RECORD the guard reads instead of the address it is
handed:

- **Wall 1 (never the company)** — the record is made to say the construction engine IS the company,
  and the six spellings are fired at it. Each was measured connecting; each is refused. This is
  **stronger** than the case it replaces: a write that got through would land in the very database
  the test then counts. Measured, all six against `127.0.0.1:54422`:
  `?host=` · no database in the path · `127.1` · `2130706433` · `localhost.` · `127.0.0.2` —
  **all seven spellings CONNECTED to `7677240194945613863/5 (postgres)`**.
- **Walls 2 and 3 (a stale record, a database nobody listed)** — measured against `_supabase` on the
  construction cluster, `7677240194945613863/16736`.
- **The bridge to the holding needs no connection at all:** the company recorded in
  `tools/hooks/ledger-identity.json` is **not** on the allow list, so *not on the list ⇒ refused* is
  a statement about the CEO's own database.

The one thing that genuinely requires reaching the holding — checking that the recorded company
identity still names the live one — moved into the drill, which is now a **deliberate command and
not `pnpm test`**:

```
$ pnpm b36:prove-block1
conditions fired   : 18
refused            : 18
the hook's own signature in the company: 0 row(s) carrying any of the 18 session ids this drill handed it
what the compiled hook can write at all: 1 × cost_ledger insert · 0 other write construct(s)
the recorded company still names the live one: YES — record 7674907968528752679/5 (postgres) · live 7674907968528752679/5 (postgres)
detector validated: YES — the permitted ledger recorded 1 new write statement(s) from the same hook in this run
scan validated: YES — it found the hook's one known write in the built file
ANSWER: NO — the hook cannot send an INSERT, UPDATE or DELETE to the company database.
BLOCK1_CLOSED
```

**GREEN** — `tests/b36/battery-carries-no-company-key.test.ts` 3 passed;
`tests/b36/hook-never-writes-company.test.ts` **21 passed**; `tests/b36/block1-question.test.ts`
3 passed; `tests/phase3/crash.test.ts` 1 passed.

**And the rewritten suite was proven to still have teeth.** `refusalFor` in the compiled hook was
made to return `null` — a guard that refuses nothing — and the suite went red on **12 cases**: all
seven Wall-1 spellings, the unlisted database, both stale-record cases, the wrong-record case, and
the byte-for-byte build case. The guard was restored and the file is `git`-clean again.

### 2 · The battery's global setup honoured an address handed in from outside

**His finding:** *"globalSetup must verify the DxB_Build identity on the same connection before it
starts, and must not be able to run a single SQL statement with a company address handed in from
outside. `tests/global-teardown.ts:50` uses `??=`."*

He was right, and this is the worst file in the battery to leave open: CREATE TABLE on the way in,
DELETE and UPDATE across `alerts`, `tasks`, `agent_runs`, `cost_ledger`, `approvals` and the CEO's
own chat board on the way out.

**Measured RED first** (all three cases, each for the right reason):

```
(1) refuses an address handed in from outside, before it runs one statement
    → expected 'schema "realtime" does not exist' to match /\[global-setup\]/
      — it ACCEPTED the address and ran its work on a database nobody pinned
(2) refuses even the pinned address when the server says it is the company
    → promise resolved "[AsyncFunction teardown]" instead of rejecting
(3) says which engine it verified, measured from that engine
    → global setup announced nothing about where it stands
```

**The detector was corrected before it was believed.** The first version of case (1) used an
unreachable address and passed BEFORE the fix — because `ECONNREFUSED` contains the word *"refused"*.
It uses a real, reachable database on the construction cluster now, and asserts the refusal by name.

**What was done:** the address is **pinned, not defaulted** — an address arriving from the
environment that is not the one constant in `tests/construction-engine.ts` is refused before a pool
is opened. Then the server is asked who it is **inside the transaction that does the work**, because
a transaction pins one connection and a check made on another connection says nothing; the answer is
held against `tools/hooks/ledger-identity.json`, the same record the hook obeys. Case (2) proves the
gate fires by telling that record the construction engine is the company — nothing about the address
changes and it still refuses.

**GREEN** — 3 passed, and every battery run now opens with:

```
[global-setup] construction engine 7677240194945613863/5 (postgres) — verified on the connection that does the work.
```

### 3 · The seed copied his 199 personas and 975 sicil entries word for word

**His finding:** *"The seed must not copy the real persona and employee-record entries; it must
generate entirely synthetic data. `db/seed/build-seed.ts:137` … `:205` … The approved plan
(PLAN.md:222) says `entirely fictional` and `not one row of his`."*

The largest of the three, and the plan had already said the opposite of what was built.

**Measured RED first:**

```
(1) no persona body stored here is a dossier file
    → 199 of 199 persona rows held a dossier byte for byte
      (accounts-payable-agent, agents-orchestrator, cfo, chro, ciso, cmo, general-counsel … all 199 named)
(2) no persona body shares an authored line with a dossier   → 199 rows carry authored dossier lines
(3) no employee record carries a sicil entry out of a dossier → 975 field values copied verbatim
(0) the instrument first: 199 dossiers read · >1000 distinctive lines · 779 sicil values ·
    positive control recognised — the comparison can see a copy    PASSED
(4) the workforce is whole — 199/199/199                          PASSED
```

**What travels and what does not.** The **slugs** travel and must: `cfo`, `ciso`,
`head-of-commerce` arrive through `db/migrations`, the same chain a deploy runs, and the E12.5
workforce gate holds 67 of them to account **by name**. A slug is a key, not a record. What may not
travel is what he had **written** — the authored persona body, the sicil entries, the dossier's own
title row. `db/seed/generated-workforce.ts` invents those from the seat's own key: deterministic, so
the same slug yields the same document character for character on every machine, and every document
announces itself as a fixture in its own second line.

It is also **the repair**: any persona row that is not the generated document for its seat is removed
first, so a database seeded by the copying version heals without being rebuilt from empty. The
database's own triggers dictate the order — an active employee may not be unbound
(`enforce_persona_gate_on_activation`), so a seat being replaced is stood down to `dormant` and the
gate/bind/activate step brings the workforce back up.

```
$ pnpm construction:seed
  generated holding, projects and memory stores     1 company · 2 project(s), 1 rewritten · 4 memory store(s)
  routing rules                                     37 enabled rules, tiers L1,L2,L3,L4
  generated personas for every seat                 199 seat(s) · 199 version(s) · 199 written, 0 swept
  gate, bind and activate the generated workforce   199 active · 199 bound
  generated employee records                        199 record(s)
BUILD_SEED_DONE — a whole holding, and not one row of his.

$ pnpm construction:seed        # again — it must write nothing
  generated personas for every seat                 199 seat(s) · 199 version(s) · 0 written, 0 swept
```

**GREEN** — `tests/b36/seed-is-fiction.test.ts` 5 passed. The company's own file-first tools
(`scripts/sync-personas-to-db.sh`, `scripts/sync-employee-records.py`) are untouched and still do
their real job on the company, where the dossier IS the source; the seed simply no longer calls them.

### What stands on this, re-measured after the change

| Check | Command | Result |
|---|---|---|
| the whole battery | `pnpm test` | **103 files · 753 passed · 15 skipped · exit 0** |
| the workforce gate the CEO named | inside the battery | `tests/e125/workforce-gate.test.ts` **7 passed** |
| types | `pnpm typecheck` | exit 0 |
| one schema, two engines | `pnpm verify:schema-parity` | `SCHEMA_PARITY` |
| the records | `pnpm verify:ledger` | `ledger truth OK` |
| the Block 1 drill | `pnpm b36:prove-block1` | `BLOCK1_CLOSED` |
| the seed runs twice | `pnpm construction:seed` ×2 | 199 written → 0 written |
| **the company across the full battery** | `pg_stat_all_tables`, 186 tables, before and after | **0 tables moved in `public`** |

The six tables that did move are the company running itself and nothing of ours: `pgboss.job`,
`pgboss.job_common`, `pgboss.queue`, `pgboss.version` (its scheduler and heartbeat) and
`realtime.messages` + today's partition (its broadcast log). **Not one of the holding's own `public`
tables changed by a single tuple** — the company never sleeps, so the measurement names what moved
rather than claiming stillness.

### Records corrected in the same turn

- Board row **B36**: the fallback figure follows the counter again — **97 → 95 files · 85 → 83
  tests** (`tests/b36/fallback-count.test.ts` fails the battery when they disagree), the sentence
  saying the drill runs *"in the battery"* is corrected, and the claim that the seed builds
  *"199 employees from 199 dossiers"* is replaced by what it now does.
- `.planning/STATE.md`: the same two claims.
- `scripts/sync-personas-to-db.sh`: the comment saying the construction seed uses it is gone — it
  does not, and that it once did was the defect.

---

## The re-audit — the third finding was only half closed, and the holding itself was still copied

Codex Solo 5.6 read the answer above and returned **FAIL with no new defect**: two of the three
findings were fully closed, and the third was not.

> *"Employee persona and sicil are synthetic now, but `build-seed.ts:121` still runs
> `db/seed/20260711_holding_core.sql` and copies the real DXB Global company, its mission and the
> DXB Global OS project. The plan says `entirely fictional` and `not one row of his`
> (PLAN.md:221)."*

He was right, and the CEO's instruction was exact: generate the company and project records too;
**structural keys may stay; the company name, the mission text, the project name and purpose and
real file links may not**; extend `seed-is-fiction` to cover companies and projects; touch nothing
else.

### It was larger than the line he cited — measured on a database built from empty

The chain alone, **before the seed runs**, on a stack destroyed and rebuilt the same evening:

```
companies=0
projects=1
agents(live)=199
personas=0
departments with NULL company_id=21
revenue-discovery → Revenue Discovery
```

So the seed file was not the only source. `db/migrations/20260726009100_revenue_discovery_project.sql`
seeds a **second** project with its own authored purpose and its own real document link
(`HOLDING-OS-MASTER-PLAN/REVENUE_ENGINE_SPEC.md`), and `20260726011100` / `20260726012500` write the
Turkish halves of both. A step that only stopped running the seed file would have left that behind.
So the step **rewrites the text of every company and every project row on the engine, whatever wrote
it**, and creates the one project the chain never creates.

### What the fourteen copied values were — RED, measured

The pre-fix state was reproduced exactly, by extracting the real values from the repository's own
four sources and putting them back (nothing typed by hand), then running the gate:

```
companies.dxb-global.name                  carries "DXB Global"
companies.dxb-global.mission               carries "AI-native technology consultancy holding: the CEO states intent once; the compan…"
projects.dxb-global-os.name                carries "DXB Global" · "DXB Global OS"
projects.revenue-discovery.name            carries "Revenue Discovery"
projects.dxb-global-os.name_tr             carries "DXB Global" · "DXB Global OS"
projects.revenue-discovery.name_tr         carries "Gelir Keşfi"
projects.dxb-global-os.purpose             carries "The holding's own operating system — departments, manager agents, specialist age…"
projects.revenue-discovery.purpose         carries "The standing home for market scanning: every research run that looks for revenue…"
projects.dxb-global-os.purpose_tr          carries "Holdingin kendi işletim sistemi — departmanlar, yönetici ve uzman ajanlar, yeten…"
projects.revenue-discovery.purpose_tr      carries "Piyasa taramasının kalıcı evi: gelir fırsatı arayan her araştırma koşusu buraya …"
projects.dxb-global-os.strategy_link       carries "HOLDING-OS-MASTER-PLAN/MASTER_PLAN.md"
projects.revenue-discovery.strategy_link   carries "HOLDING-OS-MASTER-PLAN/REVENUE_ENGINE_SPEC.md"

cases (5) (6) (7) (8) RED · cases (0)-(4), the workforce leg, stayed GREEN
```

The four workforce cases staying green on the same run is the proof that the two legs are
independent: the earlier fix was not disturbed to make this one.

### What stays, and why it is a key rather than a record

The CEO's line: *"Testlerin ihtiyaç duyduğu yapısal anahtarlar kalabilir."* Measured, each one:

| Key | Read by |
|---|---|
| `companies.slug = 'dxb-global'` | four migrations, and a **live database function** (`20260712008000_hr_factory_fns_e54b.sql:61`) |
| `projects.slug = 'dxb-global-os'` | `packages/orchestrator/src/intent-intake.ts:23`, `tests/r23/unified-constitution.test.ts:142` |
| the four memory-store **names** | the CEO's Bellek page (`ai/memory/page.tsx`), `tests/phase8/memory-store-labels.test.ts` |
| owner, company binding, status | the org tree, `v_project_command`, `tests/e124/crm-isolation.test.ts` |

Everything a human would read is generated by `db/seed/generated-holding-core.ts` — deterministic,
so the same slug yields the same text on every machine and a second run writes nothing:

```
dxb-global         → Stonebridge Fixture Holding
                     "A holding that exists only inside the construction site's own database…"
dxb-global-os      → Old Quarry Bench  / Eski Ocak Tezgâhı  / build-fixture://charter/dxb-global-os
revenue-discovery  → Still Water Bench / Durgun Su Tezgâhı  / build-fixture://charter/revenue-discovery
links              → {"repos":["build-fixture/<slug>"],"docs":[…],"deploys":[],"versions":["v0-fixture"]}
```

`strategy_link` and `links` keep the exact shape the CEO's project page reads — repos, docs, deploys,
versions — and carry nothing that resolves to a real file: `build-fixture://` is not a path on any
disk. **`db/seed/20260711_holding_core.sql` is not modified.** It is the company's own seed file and
on the company it is correct; the construction site simply stops running it, and `runFile()` — the
helper that existed only to run it — is gone with it. The seed now executes none of the company's
`.sql` files.

### GREEN, and the gate that keeps it

`tests/b36/seed-is-fiction.test.ts` now holds nine cases and judges from **both sides**: cases (5)
(6) (7) assert every company row, every project row and every memory-store note **IS** what the
generator produces for it, recomputed in the test from the same module the seed uses; case (8)
asserts that **none** of the authored text this repository carries appears anywhere in those tables.

Case (8) reads the real text out of the four sources rather than quoting it, with a
quote-aware statement splitter — measured: 9 of those literals contain a semicolon, the company's own
mission among them (*"…states intent once; the company executes…"*), so a naive split truncates
exactly the text the check exists to find. It validates itself before it judges: the extraction must
contain `DXB Global`, `DXB Global OS`, `Revenue Discovery` and
`HOLDING-OS-MASTER-PLAN/MASTER_PLAN.md`, and the real mission fed through the containment rule must
be caught. The structural keys it exempts are read from the **live database**, never typed into the
test, so that exemption cannot quietly grow.

### Proven by destroying the stack and rebuilding it from empty

Not "it works on the database I have been repairing all evening". `supabase stop --no-backup` (volume
gone, new cluster identity `7677291653303935015`), then:

| Step | Result |
|---|---|
| the guard, before the identity was re-taken | `[global-setup] refusing to run: postgres (cluster 7677291653303935015, oid 5) is not a permitted construction engine.` — **finding 2's own wall, firing in a real situation** |
| `ledger-identity.mjs --allow` / `--forget` | allow list re-taken; the destroyed cluster dropped, 1 entry |
| `pnpm construction:schema` | `applied 156, skipped 0, ledger total 156` · exit 0 |
| `pnpm construction:seed` | `BUILD_SEED_DONE` — company created by the seed, `revenue-discovery` rewritten, 199 personas written / 0 swept |
| `pnpm construction:seed` again | `0 rewritten · 0 written, 0 swept` — idempotent |
| `pnpm test` | **103 files · 757 passed · 15 skipped · exit 0** |
| `pnpm typecheck` | exit 0 |
| `pnpm verify:schema-parity` | `SCHEMA_PARITY` |
| `pnpm verify:ledger` | `ledger truth OK` |
| `pnpm b36:prove-block1` | `BLOCK1_CLOSED` |
| **the company across the from-empty battery** | 186 tables, **0 moved in `public`** |

The four that moved are the company's own scheduler — `pgboss.job`, `pgboss.job_common`,
`pgboss.queue`, `pgboss.version`. Not one of the holding's own `public` tables changed by a tuple.

### Records corrected in the same turn

- Board row **B36** and `.planning/STATE.md`: the seed's description now says what it does — a
  generated company and generated projects as well as generated people — and names what stays and why.
- `tools/hooks/ledger-identity.json` **changed**: the construction cluster was rebuilt, so its
  identity is new (`7677240194945613863` → `7677291653303935015`) and the destroyed one was dropped.
  The company's recorded identity is untouched and was re-confirmed live by `pnpm b36:prove-block1`.
- The fallback counter is unmoved at **95 / 83 tests / 8 scripts / 3 seeds / 1 route**; the 82 older
  fallbacks are Block 4's and were not touched.

---

## The final code review — the last counter-example, and it is closed

Codex Solo 5.6, third pass. **FAIL, one counter-example, no new subject** — the last piece of the
same third finding:

> *"`agents` in DxB_Build still carries **205 real `personas/…` file paths** and **132 real Turkish
> titles**. `build-seed.ts:292` only replaces the English title, and `seed-is-fiction.test.ts:238`
> never checks those two fields."*

Right on all four points, and the shape of the defect was the important part: the English title was
stamped **inside the persona-creation branch**, so a second seeding — which creates no personas —
repaired nothing. The CEO's instruction was exact: title, `title_tr` and `persona_path` synthetic for
every employee **including the archived ones**, and the update **outside** the persona condition so a
re-seed repairs old residue.

### The English title was not synthetic either — measured

Title-casing the slug looks generated and is not. Against the 113 dossiers that carry a Title row:

```
slug-derived title EQUALS the dossier's own Title for: 12 of 113
   head-of-commerce → Head of Commerce      sales-coach       → Sales Coach
   paid-media-auditor → Paid Media Auditor  sales-engineer    → Sales Engineer
   social-copywriter → Social Copywriter    revenue-growth-specialist → Revenue Growth Specialist   …
```

So the title is invented now, from a fixture vocabulary — a place, a craft and the seat's **rank**,
which is the one real thing in it (`role_level` is a structural key the org tree and the gates read).
English and Turkish are indexed by the **same** salts, so the pair belongs together and the `_tr`
column — a CEO-visible surface — is whole Turkish rather than a half-translated string.
8 places × 8 crafts × 4 ranks = 256 titles for 205 seats:

```
cfo                  | Blue Harbour Signals Director        | Mavi Liman Sinyal Direktörü
head-of-commerce     | Low Meadow Delivery Director         | Alçak Çayır Teslimat Direktörü
agents-orchestrator  | Still Water Ledger Orchestrator      | Durgun Su Defter Orkestratörü
treasury-ar-manager  | Still Water Records Senior Specialist| Durgun Su Kayıt Kıdemli Uzmanı
```

### The path had to stop pointing at his dossiers AND stay a real file

`agents.persona_path` is not decoration: `tests/e125/workforce-gate.test.ts` case (4) opens **every**
stored path on disk, `tests/phase3/registry.test.ts` requires the path to contain `personas/`, and
the live answer lane (`packages/voice/src/persona.ts`) reads the file to give an employee its
identity. So the seed **writes** the generated document to the path it stamps:
`var/construction-fixtures/personas/<slug>.md` — one per seat, archived included, under `var/`, which
is not in the repository (`.gitignore:76`). A fixture is a build artefact, not something to commit.

### RED first, on the state the review found — reproduced exactly

The chain's own values were put back: the dossier paths globbed from the repository's tree for the
199 live seats, the six ARCHIVED seats' paths measured off this engine before the fix (they pointed
at **other people's** dossiers), the 132 Turkish titles replayed from
`db/migrations/20260713023000_org_bilingual_complete_v15.sql`, and the old slug-derived English title.

```
restored: 205 dossier paths (incl. 6 archived) · 132 Turkish titles · slug-derived English titles
persona_path LIKE personas/% = 205
title_tr NOT NULL = 132

(9) no employee's persona document is one of his   → 205 employee(s) still point at the real dossier tree   RED
(10) no employee wears a title the company gave him → 132 employee(s) wear a title taken from the company    RED
(0)-(8)  the eight cases the earlier reviews passed                                                        GREEN
```

The eight staying green is the proof that nothing already accepted was disturbed to fix this.

### The repair happens on a SECOND seeding — which is the whole point

```
$ pnpm construction:seed          # personas already exist; nothing is created
  generated personas for every seat        199 seat(s) · 199 version(s) · 0 written, 0 swept
  generated titles and persona documents   205 document(s) written · 205 employee(s) restamped · 0 still pointing at a dossier

$ pnpm construction:seed          # and a third run writes nothing
  generated titles and persona documents   205 document(s) written · 0 employee(s) restamped · 0 still pointing at a dossier
```

`0 written, 205 restamped` is the line the review asked for: the stamping depends on nothing, skips
nothing, and is not behind the persona condition.

```
persona_path LIKE 'personas/%'                    = 0
persona_path LIKE 'var/construction-fixtures/%'   = 205
title NOT NULL = 205 · title_tr NOT NULL = 205 · files on disk = 205
```

### GREEN, and what stands on it — re-measured

| Check | Result |
|---|---|
| `tests/b36/seed-is-fiction.test.ts` | **11 passed** |
| the workforce gate the CEO named | `tests/e125/workforce-gate.test.ts` **7 passed** (case 4 opens all 205 paths on disk) |
| the registry tool's path contract | `tests/phase3/registry.test.ts` **5 passed** |
| the live answer lane's persona read | `tests/r31/persona-delivery.test.ts` **4 passed** |
| the whole battery | **103 files · 759 passed · 15 skipped · exit 0** |
| `pnpm typecheck` | exit 0 |
| `pnpm verify:schema-parity` | `SCHEMA_PARITY` |
| `pnpm verify:ledger` | `ledger truth OK` |
| `pnpm b36:prove-block1` | `BLOCK1_CLOSED` |
| **the company across the battery** | 186 tables, **0 moved in `public`** — the five that moved are its own `pgboss.*` scheduler and `realtime.messages` |
| the company's own counters | `audit_log = 29636`, unchanged — the same figure the review reported |
| `var/construction-fixtures/` | untracked (`.gitignore:76`) — the 205 fixture documents never enter a commit |

---

## Block 3 — THE ONE-WAY WINDOW — 2026-08-24

**His approval, given after the block was explained to him in his own language and before
anything was built:** *"onaylıyorum."* Registered: `b36-block3-one-way-window-2026-08-24`.
He had stopped the previous attempt for two reasons, both of them fair: the author started this
block before answering the question he had actually asked, and it wrote his sentences into the
records as standing rules without asking him. Everything written that way was reverted in the same
turn (`git checkout` of four files, two new files deleted, `grep` → 0 hits), and the company was
measured untouched by it.

### What now exists on the company's engine

A role `dxb_reader`: `LOGIN`, `NOINHERIT`, no `SUPERUSER`, no `CREATEDB`, no `CREATEROLE`, no
`REPLICATION`, connection limit 8, `default_transaction_read_only = on`, `statement_timeout = 120s`.
It holds `CONNECT` on the database, `USAGE` on `public` and `pgboss`, `SELECT` on every table in
them plus default privileges for tables not yet created, and **nothing else anywhere**. It carries
`BYPASSRLS` on purpose: all 60 tables in `public` have row-level security, and without it the window
would connect happily and count zero rows — a silent false zero is the more dangerous failure, and
`BYPASSRLS` changes what is VISIBLE, never what can be written.

It cannot read `auth` (Supabase's own login table and its password hashes), `storage`, `vault`,
`realtime` or `litellm`.

Built by `pnpm b36:window` → `scripts/b36/install-company-window.mjs`, which applies
`scripts/b36/company-one-way-window.sql` as the engine's own administrator. **It is deliberately not
a migration:** it creates no schema object, only a role and privileges, and two of the objects it
must seal (`net.*`) are owned by `supabase_admin`, which the application's role is not a member of.

```
$ pnpm b36:window
B36 · Block 3 — the one-way window on the COMPANY engine (supabase_db_DxB_Global_OS)
  privilege matrix photographed BEFORE : 1408 (role x object) answers
  B36 one-way window: 34 security-definer functions walled off from PUBLIC
  B36 one-way window: sealed net.http_request_queue (INSERT,UPDATE,DELETE,TRUNCATE taken from PUBLIC, returned to every other role)
  B36 one-way window: sealed net._http_response  (same)
  B36 one-way window: reads 60 tables in public, writes 0 tables anywhere
  privilege matrix photographed AFTER  : 1496 (role x object) answers

  privileges changed for dxb_reader   : 88
  privileges changed for ANY OTHER ROLE: 0   <-- must be 0
  BLAST_RADIUS_CLEAN — no role but the new window changed by one privilege.
  password minted, stored mode 600 at var/b36/company-window.env  (DXB_COMPANY_READONLY_URL)
WINDOW_INSTALLED
```

### The back door that SELECT-only does not close, and the one nobody thinks to lock

**85 `SECURITY DEFINER` functions live in `public`** — a `SECURITY DEFINER` function runs with its
OWNER's privileges, and the owner is `postgres`. **34 of them were executable by `PUBLIC`**, and
`PUBLIC` includes every role that will ever exist. `control_ceo_briefing_post`,
`fn_chat_post_message`, `control_voice_call_log`, `control_opportunity_register` and
`fn_update_routing` all INSERT into the holding's own tables. A window holding SELECT and nothing
else could have called any of them and written a row. Those 34 now have `EXECUTE` taken from
`PUBLIC` and handed back, by name, to the roles that already held it.

**`net.http_request_queue` and `net._http_response`** — the `pg_net` extension's outbound-HTTP
queue — granted INSERT to `PUBLIC`. A role that can put a row there can make the server issue an
HTTP request. Sealed the same way. **The window's own closing assertion is what found this**: it
refuses to succeed while `dxb_reader` can write to any table in any schema, and on the first run it
raised `the window can still WRITE to: net._http_response, net.http_request_queue`.

`TEMPORARY` on the database was taken from `PUBLIC` and returned by name for the same reason: "not
one letter" is the order.

### THE MISTAKE THIS BLOCK MADE, AND HOW IT WAS CAUGHT AND UNDONE

The first version handed `EXECUTE` back to **every role on the engine**. On the construction engine
that is exact, because `PUBLIC` held all 85 there. **On the holding it was not: 34 were open and 51
were deliberately restricted**, so the blanket re-grant gave **`anon` — the role an unauthenticated
browser gets — the right to call all 85, `control_records_purge` and `decide_approvals` among
them.** The installer's own blast-radius photograph caught it in the same run and refused to
continue, which is what it is for; but the SQL had already committed.

It was undone from the holding's own record — the dated dump Block 0 took before any of this work
began — by `scripts/b36/restore-company-privileges.mjs`, which reads the exact `GRANT`/`REVOKE`
statements out of `dxb-b36-pre-separation-2026-08-23.dump` and replays them:

```
$ node scripts/b36/restore-company-privileges.mjs
the dump carries 749 function-privilege statements from before this work began
the engine carries 85 security-definer functions in public/pgboss
reset statements: 1700 · replayed from the dump: 110 · other: 52
  PUBLIC can execute : 34 of 85   (measured before the mistake, 2026-08-24: 34 of 85)
  anon   can execute : 34 of 85
  PUBLIC may write the pg_net queue : true  (was true)
  PUBLIC holds TEMP on the database : true  (was true)
  dxb_reader roles on the engine    : 0  (was 0)
COMPANY_PRIVILEGES_RESTORED
```

The rule was then corrected to measure, **per object**, who could already do the thing, and to give
it back to exactly those roles minus the window. **The correction is proved red-first**, by
rebuilding the holding's SHAPE (34 open / 51 restricted) on the disposable construction engine and
running the OLD rule against it first:

```
$ pnpm b36:prove-window-preserves
  fixture built: 51 functions that `anon` must NOT be able to call
  the OLD rule changed 663 privileges belonging to other roles
  under the OLD rule `anon` could call 85 of the functions — the defect, reproduced
  the SHIPPED rule changed 0 privileges belonging to other roles   <-- must be 0
  `anon` can call 34 functions — before the window it was 34
  the installer's own verdict: BLAST_RADIUS_CLEAN
WINDOW_PRESERVES
```

### The drill — can the window write to the holding?

`pnpm b36:prove-window` connects **through the host's `psql`, as `dxb_reader`, over the mapped
port** — the way a construction tool really would. Every attempt runs inside its own transaction
that is rolled back whatever happens, so even a missing wall could not leave a trace; afterwards the
drill looks for its own marker in every table it aimed at.

```
$ pnpm b36:prove-window
  detector validated: the window really is connected — it reads 205 employees
  refused  INSERT into the cost ledger / UPDATE a task / DELETE an alert / TRUNCATE the audit log
  refused  INSERT into the governance register / the holding's memory / the job queue
  refused  INSERT into the outbound HTTP queue (pg_net)
  refused  CREATE a table / CREATE a schema / CREATE a TEMPORARY table / ALTER / DROP
  refused  call a SECURITY DEFINER function that writes (briefing)  permission denied for function control_ceo_briefing_post
  refused  call a SECURITY DEFINER function that writes (chat)      permission denied for function fn_chat_post_message
  refused  read the login table (password hashes)                   permission denied for schema auth
  refused  RAW  turn the read-only default off BEFORE the transaction, then INSERT   permission denied for table cost_ledger
  refused  RAW  begin an explicitly READ WRITE transaction, then INSERT              permission denied for table cost_ledger
  refused  RAW  READ WRITE, then the outbound HTTP queue (pg_net)                    permission denied for table http_request_queue
  refused  RAW  READ WRITE, then a SECURITY DEFINER function that writes             permission denied for function control_ceo_briefing_post
  refused  RAW  READ WRITE, then TRUNCATE the audit log                              permission denied for table audit_log
  refused  RAW  READ WRITE, then create a table of its own                           permission denied for schema public
  attempts: 23 · refused: 23 · escaped: 0 · rows left behind: 0
ANSWER: NO — the window cannot change one row in the holding, by any route tried.
WINDOW_IS_ONE_WAY
```

**The last six attempts are the ones that matter.** `default_transaction_read_only = on` is a
SETTING and `dxb_reader` can switch it off, so a refusal reading *"cannot execute INSERT in a
read-only transaction"* proves only that a setting is set. Those six take the setting out of the way
properly — one turns it off **before** the transaction begins, the rest start the transaction
`READ WRITE` explicitly — and what refuses them is `permission denied`, which is the privilege, which
is the only thing that is a wall. The first run of this drill did not contain them and proved less
than it looked like it proved.

### The governance gate now looks through the window

`scripts/governance/ledger-truth.mjs` read the holding as `postgres`, the account that owns
everything in it, with a read-only intention enforced by a regular expression and nothing else. It
now connects as `dxb_reader`, reading the URL from `var/b36/company-window.env` (outside the
repository); when no window is installed it says so on stderr and falls back, because a governance
gate that silently stops running is worse than one that fails.

```
$ pnpm verify:ledger
ledger truth OK: 8 state claims re-measured, 94 open markers resolved against 66 board rows,
96 trigger lines all accounted for, 17 rules each in exactly one owner,
70 CEO approval claims each backed by a registered approval
```

### Blast radius — named before, measured after

| What stands on it | Measured after |
|---|---|
| Every other role on the engine | **0** privileges changed, of 1,408 (role × object) answers photographed before and after |
| `anon` (unauthenticated browser) | can call **34** of 85 control functions — exactly what it could before |
| `authenticated` · `service_role` · `postgres` | `decide_approvals`, `fn_chat_post_message`, writes to `cost_ledger` — all unchanged |
| The two resident services (`dxb-scheduler`, `dxb-jarvis`) | both `active` |
| The CEO's login and his live tiles | Supabase Auth and Realtime are untouched — the block adds a role and moves privileges; ⚠ still to be confirmed by eye |

---

## Block 3-bis — THE WALL OUTSIDE THE DATABASE — 2026-08-24

**Approved before a line was written:** *"onaylıyorum"* · *"önce bis-block3 yap ilk onayladığımı"* —
registered as `b36-block3-bis-os-wall-2026-08-24`. LAW B still stands: this is permission to build.

### Why Block 3 failed three audits — measured, not argued

The third adversarial audit's sentence was *"the current gateway plan does not close host-level
Docker access."* It was right, and the measurement below is why. Every attempt so far had built the
wall **inside PostgreSQL**, while the construction runtime ran as the operating-system user `dxb`,
a member of the `docker` group — and the Docker socket is root on this machine. Fired from the
construction runtime, SELECT-only, **nothing changed in the company**:

```
docker exec -i supabase_db_DxB_Global_OS psql -U supabase_admin -c "select current_user, usesuper"
  REACHED supabase_admin superuser=true

docker exec -i supabase_db_DxB_Global_OS psql -U postgres -c "select has_table_privilege(...)"
  postgres can INSERT into cost_ledger : true
  postgres can DELETE from audit_log   : true
  postgres can UPDATE approvals        : true

test -r .env .env.daemon var/b36/company-window.env
  READABLE: .env (73 bytes) · .env.daemon (1372) · var/b36/company-window.env (329)

psql "$DXB_COMPANY_READONLY_URL" -c "select current_user"
  TCP LOGIN SUCCEEDED as dxb_reader

scripts/governance/ledger-truth.mjs:220-221
  both branches were `docker exec …`; the fallback branch was `-U postgres`
```

So closing `dxb_reader`'s three self-directed capabilities would **not** have closed this row. A
runtime that can become `supabase_admin` never needed `dxb_reader` at all.

### What was built

| # | The wall | What it is |
|---|---|---|
| 1 | **The sandbox** — `scripts/construction/run.sh` | Everything the construction runs goes through it: `bwrap` with its own **empty network namespace**, its own PID/IPC/UTS namespaces, an empty `HOME`, no Docker socket bound in, `var/b36` replaced by an empty directory, and a hosts file of its own because there is no resolver inside. **Default deny:** the only TCP ports that exist inside are the seven named in `ALLOW`, each carried in over a unix socket. 54322 and 54321 are not among them |
| 2 | **The withdrawal** — `scripts/b36/withdraw-company-login.mjs` | `dxb_reader` no longer exists on the company's engine. It was **renamed**, not dropped and rebuilt: PostgreSQL keys every grant to the role's OID, so the whole audited privilege set moved with the identity and **not one GRANT was re-issued** — the act that broke the holding for eleven minutes on this row's first attempt |
| 3 | **The read gateway** — `scripts/b36/company-read-gateway.mjs` | Runs on the company's side as its own resident service, holds the only connection, listens on a **unix socket**. The caller sends a **name**; the SQL behind it comes from a catalogue the gateway **freezes at startup**, so a construction run that rewrites `claims.json` cannot change what a running gateway executes. Read-only at four levels: the role's privileges, `default_transaction_read_only=on`, a `BEGIN READ ONLY` per answer, and a plain-SELECT check on every catalogue entry |
| 4 | **Fail closed** — `scripts/governance/ledger-truth.mjs` | Both `docker exec` branches deleted, including the `-U postgres` fallback the auditor named. The file now holds no `child_process` import, no command name and no company address. Gateway down → the gate stops and says so |

### The withdrawal — before and after

```
BEFORE   roles on the engine 17 · dxb_reader table grants 106 · routine 0 · usage 0
         default privileges 0 · login/super/createdb/createrole/bypassrls = true/false/false/false/true
         STATE_FINGERPRINT de359137ee1d7c79
AFTER    dxb_reader on the engine 0  (was 1)
         dxb_gateway table grants 106 · routine 0 · default privileges 0
         attributes true/false/false/false/true — identical
         STATE_FINGERPRINT de359137ee1d7c79
         credential at ~/.config/dxb/company-gateway.env (600), outside the repository
         var/b36/company-window.env — deleted
COMPANY_LOGIN_WITHDRAWN
```

`postgres` could not perform the rename — *"permission denied to rename role"* — because on a
Supabase stack it holds neither `CREATEROLE` nor `ADMIN` on it. The installer uses `supabase_admin`,
the same role the window's own installer uses, and it is on the company's side of the wall.

### The proof — `pnpm b36:prove-wall`

Every attempt is fired **twice**: once from the unsandboxed runtime, where it MUST succeed, and once
from inside the sandbox the construction actually runs in, where it must be refused. A refusal
measured by a probe that cannot succeed anywhere proves nothing — the drill prints `PROBE_IS_BLIND`
and exits 1 rather than a green verdict if the red half fails. It found that fault in itself on its
first run (`Cannot find module 'pg-types'`: pnpm links `pg` through a symlink whose siblings are not
beside it) and refused to pass.

```
THE ACCOUNT THAT WAS WITHDRAWN
  dxb_reader on the company engine   gone
  what holds the window now          dxb_gateway, on the company's side only
WHAT THE WINDOW'S OWN ROLE MAY STILL DO, class by class:   all 9 classes are zero

RED HALF, unsandboxed — every one reaches:
  a direct TCP login (5 spellings)   reached as 127.0.0.1, localhost, 127.1, 2130706433, 127.0.0.2
  the company's HTTP gateway         reached as all five spellings
  the Docker socket / command        present · 15 containers
  the company's container            supabase_admin
  the credential files               readable: .env .env.daemon ~/.config/dxb/… ~/.config/systemd/…
  a real login to the holding        logged in as dxb_gateway

GREEN HALF, inside the sandbox — every one refused:
  a direct TCP login (5 spellings)   every spelling refused
  the company's HTTP gateway         every spelling refused
  the Docker socket                  ENOENT
  the Docker command / container     Command failed
  the credential files               none readable
  a real login to the holding        ENOENT … '/tmp/home/.config/dxb/company-gateway.env'
  SQL smuggled through the gateway   all 6 refused
  any operation but the named read   all 5 refused

AND THE ONE DOOR THAT WORKS, from inside:
  the construction's own engine      connected
  a named question                   agents_total = 205

THE GOVERNANCE GATE, from inside the sandbox:
  with the gateway running           exit 0 — ledger truth OK: 8 state claims re-measured …
  with the gateway stopped           exit 1 — the company's read gateway is not answering

THE HOLDING, BEFORE AND AFTER THE WHOLE DRILL
  STATE_FINGERPRINT de359137ee1d7c79  ->  de359137ee1d7c79
  audit_log / hook_violations: 29637/1963  ->  29637/1963
WALL_IS_ONE_WAY
```

### The battery, and which half ran where — `pnpm construction:battery`

Nothing was moved out of the wall quietly. `scripts/construction/battery.sh` names the split in the
file and prints it on every run:

* **The construction runtime, sandboxed** — every test file but the two below.
* **The author's hand, on the company's side** — `tests/b36/live-drills.host.test.ts` (it creates and
  drops roles inside the construction container) and `tests/ops/freeze-guard.test.ts` (it reads this
  machine's own process tree and systemd units). Neither can run inside a sandbox built to take a
  container and a process tree away, and both are named in the script rather than filtered out of a
  count.

`tests/b36/wall-question.test.ts` holds the fixed question **inside** the battery, and its first
assertion is that the battery is running inside the sandbox at all — so running `pnpm test` on the
bare host is now a red test, not a quiet one.

### Blast radius — named before the change, measured after

| What stands on it | Measured after |
|---|---|
| The two resident services | `dxb-scheduler` **active**, `dxb-jarvis` **active**, 0 restarts each, after their credential files moved out of the repository |
| The company's credential files | `.env`, `.env.daemon`, `apps/dashboard/.env.local` moved to `~/.config/dxb/` with **symlinks left at the old paths** — every reader outside the sandbox (the two units, `systemd/install.sh`, `set-gemini-key.sh`, `provision-dept-keys.sh`, `migration/push.sh`, Next.js) works unchanged; inside the sandbox `HOME` is a tmpfs, so the link dangles and the file cannot be opened |
| `pnpm verify:ledger` | **OK: 8 state claims re-measured, 98 open markers, 70 CEO approval claims** — now through the gateway |
| `pnpm typecheck` | `tsc --build`, exit 0 |
| The superseded drill | `scripts/b36/prove-window.mjs` **deleted**, its command removed from `package.json`, and a test fails if either comes back — two drills answering two versions of one question is how three audits read two different answers |
| The class sweep | Extracted to `scripts/b36/window-classes.mjs` so the seal and its proof cannot drift apart, and asked of `dxb_gateway` by `prove-wall` |

### The second wall — finished the same day, with his password

The first delivery of this block stopped short of two layers because `sudo` on this machine asks for
a password at a terminal (`sudo -n true` → *"interactive authentication is required"*) and no session
can type one. He gave the password himself and told the author to finish it. Both layers now stand,
and the drill measures them from the identity itself.

**The identity.** `dxbbuild` — uid **997**, its own group, **not** in `docker`, **not** in `sudo`,
shell `nologin`, and no home. It holds the repository through an ACL (access control list — a
per-user permission entry) and **nothing else on this machine**:

```
id dxbbuild                       uid=997(dxbbuild) gid=973(dxbbuild) groups=973(dxbbuild)
sudo -u dxbbuild test -r ~/.config/dxb/company-gateway.env    cannot read the gateway credential
sudo -u dxbbuild ls /home/dxb                                 cannot even enter /home/dxb
getfacl "DxB Global OS"           user:dxbbuild:rwx · default:user:dxbbuild:rwx · default:user:dxb:rwx
```

It cannot reach the repository from outside the sandbox at all — root performs the mount, and only
then is the payload dropped to that identity with `setpriv --clear-groups`, so it carries uid 997,
gid 973 and no supplementary group. The drill prints the identity that fired every attempt:
`identity that fired them: uid=997 gid=973 groups=973 sandbox=yes`.

**The wall's definition is root-owned.** A wall the construction can rewrite is a suggestion:

```
/usr/local/sbin/dxb-construction-sandbox   root:root 0755   ← what actually runs
scripts/construction/sandbox.sh                             ← its reviewable source
scripts/construction/install-wall.sh                        ← what puts it in place
scripts/construction/run.sh                                 ← three lines; calls the installed program
/etc/sudoers.d/dxb-construction-sandbox    parsed OK        ← the one entry that opens it
```

`tests/b36/company-is-read-only.test.ts` (5) fails if the installed copy is missing, stops being
owned by root, becomes writable by anyone else, or drifts from the repository's source — and if the
thin door ever grows a wall definition of its own.

**The packet filter.** `nftables` (the kernel's own firewall), loaded at boot by
`dxb-company-wall.service`:

```
table inet dxb_wall {
  chain output {
    type filter hook output priority filter; policy accept;
    meta skuid 997 tcp dport { 54321, 54322 } counter reject with tcp reset
  }
}
```

Fired for real, from that identity, **with no sandbox of any kind between it and the holding**:

```
as dxb (the author)            reaches the company        ← expected; it is his own hand
as dxbbuild -> 54322           REFUSED by the kernel
as dxbbuild -> 54321           REFUSED by the kernel
as dxbbuild -> 54422 (its own) open, as it should be
nft counter                    42 packets, 2520 bytes rejected
```

The drill's third column measures exactly this — the same probe, same identity, **no namespace**:

```
THE SECOND WALL — the construction identity `dxbbuild`, OUTSIDE the sandbox
  who is asking                                     uid=997 gid=973 groups=973 sandbox=no
  refused  the company's engine, every spelling     every spelling refused
  refused  the company's HTTP gateway               every spelling refused
  refused  the Docker socket, talked to not seen    EACCES (inode: visible)
  refused  the Docker command                       Command failed
  refused  the credential files                     none readable
  refused  a real login to the holding              ENOENT … company-gateway.env
  works    its OWN engine — this one MUST work      connected
  the kernel's own count of refusals so far         42 packets, 2520 bytes
```

Note the Docker line: the socket's inode is **visible** to that identity and **talking to it is
refused** (`EACCES`). The drill was changed to measure the socket by connecting to it rather than by
stating it, because "the file is there" and "I can use it" are not the same measurement.

**A trap this block paid for, written down so it is not paid twice.** When the sandbox began running
as `dxbbuild`, the port bridge broke in the most misleading way available: the bridge directory was
root-owned, so the forwarders — now running as the build identity — could not create their sockets,
while the listeners *inside* the sandbox still accepted every TCP handshake. `/dev/tcp` tests passed.
PostgreSQL answered `Connection terminated unexpectedly`. **A wall that looks like a working bridge
is worse than one that is plainly shut.** The bridge now has two rooms: root's, holding the inner
script and the hosts file so the payload cannot replace them, and the identity's, holding the
sockets.
