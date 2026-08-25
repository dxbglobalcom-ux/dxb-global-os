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


---

## The second wall failed its audit — the container address · 2026-08-24

The auditor did not attack a port. He asked the holding's container for its own address and
connected to it. Re-measured here **connect-only, no login**, from the real construction identity,
before anything was changed:

```
$ sudo -u dxbbuild node knock.mjs …            # a bare TCP handshake, nothing spoken
172.18.0.6:5432          HANDSHAKE SUCCEEDED   <- the holding's database
172.18.0.5:8000          HANDSHAKE SUCCEEDED   <- kong
172.18.0.2:3000          HANDSHAKE SUCCEEDED   <- rest
172.18.0.3:9999          HANDSHAKE SUCCEEDED   <- auth
172.18.0.4:4000          HANDSHAKE SUCCEEDED   <- realtime
192.168.178.44:54322     HANDSHAKE SUCCEEDED   <- this machine's own LAN address
172.17.0.1:54322         HANDSHAKE SUCCEEDED   <- the docker gateway
127.0.0.1:54322          refused: ECONNREFUSED <- the only spelling the wall ever caught
[::1]:54322              refused: ECONNREFUSED
```

**Two reasons, either one of them enough.** The wall named the ports it forbade, and a container
address is not a port. And for every local address except `127.0.0.0/8`, Docker rewrites the
destination in the `nat` OUTPUT hook, which runs **before** the filter hook — so
`192.168.178.44:54322` had already become `172.18.0.6:5432` before any port rule looked at the port.

The wall now names what it **allows**: eight ports, on the loopback address only, and refuses
everything else this identity emits.

### The fix broke something else, and the sweep caught it

The first default-deny let everyone else past with `meta skuid != 997 accept`. A packet the kernel
emits with **no owning socket** carries no skuid, so that rule does not match it and does not accept
it either — it falls into the deny. Measured with **nothing at all running as the construction
identity**:

```
$ ps -u dxbbuild --no-headers | wc -l
0
$ nft insert rule inet dxb_wall output index 3 meta l4proto tcp log prefix "DXBWALL " counter
$ dmesg | grep DXBWALL | head -4
DXBWALL OUT=lo SRC=127.0.0.1 DST=127.0.0.1 SPT=37700 DPT=45388 ACK    <- bun,  pid 20094
DXBWALL OUT=lo SRC=127.0.0.1 DST=127.0.0.1 SPT=45388 DPT=37700 RST
DXBWALL OUT=lo SRC=127.0.0.1 DST=127.0.0.1 SPT=44939 DPT=53246 ACK    <- kilo, pid 3991869
DXBWALL OUT=lo SRC=127.0.0.1 DST=127.0.0.1 SPT=53246 DPT=44939 RST
```

Ten packets in two idle seconds, belonging to two of the CEO's own editor processes, for **every
user on the machine**. The same trap had a second symptom: the RST that `reject` generates is itself
ownerless, so it fell into the deny, generated another, and became a self-feeding storm — **2,769
packets from one connection attempt**, with the caller never told anything and left to hang.

Written as `meta skuid 997 jump construction`, an ownerless packet does not match, falls off the end
of the base chain and meets `policy accept`:

```
at load:            packets 0 packets 0
after idle seconds: packets 0 packets 0      <- nothing else on the machine is touched
one refused attempt: result: ECONNREFUSED    real 0m0.032s
after:              packets 1 packets 0      <- one attempt, one packet
```

### From the auditor's own runtime, after the fix

`dxbbuild`, outside the sandbox, no namespace of any kind between it and the holding:

```
refused  the holding at EVERY address it answers on — the attack that broke wall one
         all 21 addresses refused (19 of them real doors)
refused  a real PostgreSQL login at the holding's CONTAINER address
         172.18.0.6:5432: refused by the network (ECONNREFUSED) — no credential was ever offered
works    its OWN engine — this one MUST work                  connected

the table is loaded                                    yes
it examines the construction identity, and only it     yes
it never tests `skuid != 997` (kills ownerless packets) correct
it is a DEFAULT-DENY, not a list of forbidden ports    yes
no rule forbids by port number (the shape that failed) correct
```

And the red half proves the drill can still do all of it — from the unsandboxed runtime the same
code **reaches all 19 of the real doors** and **logs in at `172.18.0.6:5432` as `dxb_gateway`**, and the same
container-address login code succeeds against the construction engine at `172.20.0.2:5432`. A
refusal measured by a probe that cannot succeed anywhere proves nothing.

The addresses are **not written down**. Every run asks Docker for the address of each container the
holding owns, crosses it with every port that container exposes, adds this host's own addresses and
every bridge gateway, and fires at all of them. If that list ever comes back empty the drill prints
`BLIND` and refuses a verdict.

**The holding did not move while any of this was measured:** `STATE_FINGERPRINT de359137ee1d7c79`
before and after, `audit_log / hook_violations: 29637/1963` before and after.


---

## The holding's own front door was open to the whole house · 2026-08-24

This is not about the construction. It came out of the same audit and it is the
second thing that audit exposed: the auditor's login worked partly because the
holding's database answers **every interface this machine owns**, behind a password
the Supabase CLI documents publicly.

**Measured, from off this machine.** A throwaway container on a different network is
the nearest thing to another device on the wifi that can be produced without a second
device. No login was attempted — only a knock:

```
$ docker run --rm --network bridge alpine nc -z 192.168.178.44 54322
192.168.178.44:54322 REACHABLE          <- the holding's database
$ docker exec supabase_db_DxB_Build …    # the construction engine's own container
  192.168.178.44/54322     REACHABLE
  192.168.178.44/54321     REACHABLE     <- the holding's API gateway
  172.17.0.1/54322         REACHABLE
  172.18.0.6/5432          refused       <- Docker's own network isolation holds here
$ ss -ltn | grep 5432
  0.0.0.0:54322   0.0.0.0:54321   [::]:54322   [::]:54321
```

And the password behind that database, compared without ever printing it:

```
$ docker inspect -f '…POSTGRES_PASSWORD…' supabase_db_DxB_Global_OS   # compared, not printed
the company's postgres password IS the well-known default
$ docker exec … grep '^host' pg_hba.conf
host all all 127.0.0.1/32   trust
host all all 172.16.0.0/12  scram-sha-256      <- a LAN caller arrives here: password required
host all all 0.0.0.0/0      scram-sha-256
```

### Why the password was NOT the lever — measured, not preferred

```
supabase/config.toml            no setting binds the local doors to this machine;
                                [db.network_restrictions] is for the hosted project, enabled = false
verify:schema-parity            spells postgres:postgres against 54322
construction:schema             scripts/bootstrap-db.sh, same
tests/construction-engine.ts    same
dxb_litellm (live container)    LITELLM_DATABASE_URL=postgresql://postgres:…@127.0.0.1:54322
```

Changing it breaks the repository's own canonical migration chain in three named
places and the live model gateway, and `supabase start` writes it back. That is
fighting the tool. **The network is the lever.**

### What was built

A second chain in the same `dxb_wall` table, facing the other way — at PREROUTING,
priority -150, which runs **before** Docker's address rewrite at -100, so the rule
still sees the port a stranger actually dialled:

```
chain company_front_door {
  type filter hook prerouting priority -150; policy accept;
  iifname "lo" return
  tcp dport 54322 counter drop
  tcp dport 54321 counter drop
}
```

Traffic this machine originates never traverses prerouting; loopback returns on the
first line; the holding's own containers were measured to hold no reference to these
two doors (`supabase_auth`'s seven are e-mail URL strings, not connections); and
`dxb_litellm`, which does use the database, runs on the host's network and therefore
over loopback.

### Measured after

```
construction container -> 192.168.178.44/54322     refused
construction container -> 192.168.178.44/54321     refused
construction container -> 172.17.0.1/54322         refused
throwaway container    -> 192.168.178.44:54322     refused
the same probe at a door on this machine that is NOT the holding's   REACHABLE

this machine itself:  127.0.0.1:54322 works · 127.0.0.1:54321 works · [::1]:54322 works · 3000 works
after `systemctl restart dxb-company-wall` (i.e. after a reboot): the chain is still there
the holding's five containers: all Up 34 hours, four of them healthy
dashboard /login 200 · company API gateway 200 · company auth 200
dxb-scheduler active 0 restarts · dxb-jarvis active 0 restarts · dxb-company-read active 0 restarts
```

**Not closed, and named rather than hidden:** the CONSTRUCTION engine's own doors
(54421/54422) remain open to the network with the same default password. They carry
generated data and not one row of the holding's, so they are not a holding risk; that
is a judgement, not a measurement, and it is written here so it can be overruled.


---

## The sweep was counting things that do not exist · corrected 2026-08-24

An acceptance screen was built for the CEO on the same day, and it counted the
holding's addresses independently. It said 21. The drill said 39. **The drill was
wrong**, and the difference is worth the paragraph:

```
$ docker inspect -f '{{range …}}{{$v.IPAddress}} {{$v.GlobalIPv6Address}} {{end}}|…' supabase_db_DxB_Global_OS
172.18.0.6 invalid IP |5432/tcp
```

When a container has no IPv6 address, Docker's template prints the two words
`invalid IP` rather than nothing. The filter only rejected `<no value>`, so both
words became hostnames, and 18 of the 39 "addresses" were names that never
existed. Refusing to resolve a name that does not exist is not evidence — it is
padding, and it made the wall look better tested than it was.

**Corrected, and made stronger than it was before.** The sweep now keeps only
strings that ARE an address, and the red half decides which of them matter: an
address nothing listens on refuses everybody, walled or not.

```
the holding was found at 21 address(es)
of those, 19 are real doors — the unsandboxed runtime reached them
  172.18.0.2:3000 · 172.18.0.4:4000 · 172.18.0.3:9999 · 172.18.0.5:8000 · 172.18.0.5:8088
  172.18.0.5:8443 · 172.18.0.6:5432 · 127.0.0.1:54321 · 127.0.0.1:54322
  192.168.178.44:54321 · 192.168.178.44:54322 · 172.19.0.1:54321 · 172.19.0.1:54322
  172.18.0.1:54321 · 172.18.0.1:54322 · 172.17.0.1:54321 · 172.17.0.1:54322
  172.20.0.1:54321 · 172.20.0.1:54322
all 21 addresses refused          (from inside the sandbox)
all 21 addresses refused          (from the bare construction identity)
WALL_IS_ONE_WAY
```

If the red half ever reaches none of them, the drill prints `BLIND` and refuses a
verdict instead of reporting a clean sweep of an empty list.

**The lesson, and it is the one already written on this repository's wall:**
validate the detector before you trust what it counted. It was caught only because
a second measurement existed to disagree with the first.

## Block 4 — THE COMPANY'S ADDRESS IS NO LONGER A DEFAULT · 2026-08-24 evening

**What was still wrong after Block 3-bis.** The wall built that day stands *outside*
the database: no login, no Docker, no network. It answers the question "can the
construction runtime reach the holding?" — and the answer is no. It does not answer
a smaller, older question: **what does a file in this repository do when nobody has
told it where to work?** Measured at the start of this session, with the committed
counter:

```
$ node scripts/b36/count-company-fallbacks.mjs
EXECUTABLE FALLBACKS (the address really bound to DXB_DATABASE_URL): 95
   tests: 83 · scripts: 8 · db seeds: 3 · apps: 1
```

Ninety-five files answered it the same way: *assume the holding*. Eighty-two suites
opened with `process.env.DXB_DATABASE_URL ??= "…@127.0.0.1:54322/postgres"`, inert
while `vitest.config.ts` set the variable first and live the moment anything else
ran them. Three seeds and six operator tools carried the same address as a `??`
default. `tests/phase5/slice-10of10.sh`, the Phase-5 exit gate that drives ten full
task lifecycles and writes approvals and outbox rows, defaulted to it in bash. And
one **live application route** — `apps/dashboard/src/app/api/voice/call/route.ts:53`
— invented a database for itself on every request.

**What was built.** The address is not a default anywhere:

| What | Before | After |
|---|---|---|
| 82 suites | `??=` the company | the line is gone; `vitest.config.ts` is the only thing that names an engine |
| `db/seed/apply-persona-v2`, `import-personas`, `import-routing-rules` | `??` the company | named refusal, **exit 2** |
| `scripts/library/{enrich,intake,register-arsenal}` | `??` the company | named refusal, **exit 2** |
| `scripts/dev/{ops-live-collector,voice-latency-probe}`, `scripts/org/workforce-gate`, `scripts/phase3-lifecycle-battery` | `??=` the company | named refusal, **exit 2** |
| `tests/phase5/slice-10of10.sh` | `${DXB_DATABASE_URL:-<company>}` | `${DXB_DATABASE_URL:?…}`, **exit 1** |
| `apps/dashboard/.../voice/call/route.ts` | `??=` the company | nothing; the route is handed an address by `scripts/dashboard.sh` |
| `scripts/systemd/install.sh` | writes `DXB_DATABASE_URL=<company>` into `.env.daemon` | writes **`DXB_COMPANY_DATABASE_URL`**; each unit maps it back inside its own `ExecStart`, and nowhere else |

```
$ node scripts/b36/count-company-fallbacks.mjs
EXECUTABLE FALLBACKS (the address really bound to DXB_DATABASE_URL): 0
```

**Every entry point was made to refuse, and the refusal was run.** Not "it should
now throw" — the eleven commands, with the variable removed from the environment:

```
$ env -u DXB_DATABASE_URL node --experimental-strip-types db/seed/apply-persona-v2.ts
apply-persona-v2: DXB_DATABASE_URL is not set. This seed UPDATEs the agents registry
and it carries no default — name the engine explicitly.

exit 2 — db/seed/apply-persona-v2.ts
exit 2 — db/seed/import-personas.ts          (its input directory agency-agents/ had to be
                                              created empty for the run to reach the guard)
exit 2 — db/seed/import-routing-rules.ts
exit 2 — scripts/library/enrich.mjs
exit 2 — scripts/library/intake.mjs
exit 2 — scripts/library/register-arsenal.mjs
exit 2 — scripts/dev/ops-live-collector.mjs
exit 2 — scripts/org/workforce-gate.mjs
exit 2 — scripts/phase3-lifecycle-battery.mjs
exit 1 — tests/phase5/slice-10of10.sh
```

**The gate that keeps it at zero, and it was seen RED first.**
`tests/b36/no-company-fallbacks.test.ts` imports `scan()` and `bindingsIn()` from the
counter itself, so the definition of "a fallback" and the thing that enforces it
cannot drift apart. Case (0) shows the instrument finding a company fallback in all
seven shapes it claims to read before case (2) is allowed to report none. A probe
file carrying one `??=` line was added to the tree, and:

```
$ pnpm vitest run tests/b36/no-company-fallbacks.test.ts     # with the probe tracked
- []
+ [ "scripts/b36/tmp-red-probe.mjs:2  process.env.DXB_DATABASE_URL ??= …  (1)" ]
Tests  1 failed | 3 passed (4)
```

The probe was removed in the same turn and the case went green.
`tests/b36/battery-carries-no-company-key.test.ts` lost its one tolerated shape at the
same time — it used to excuse `DXB_DATABASE_URL ??=` because deleting those lines was
this block's job; the job is done, so the excuse is gone and its self-test now asserts
that shape IS a key.

**A defect found on the way, fixed at its source.** `scripts/library/intake.mjs` did
not appear in a `grep` for the company address, and it does contain it. The file held
**two raw NUL bytes** (offsets 10449 and 10968) — a map-key separator written as a
literal NUL inside a template string. GNU `grep` calls such a file binary and prints
only "binary file matches"; `ugrep`, which is what `grep` resolves to on this machine,
**skips it in silence**. An audit of that file's fallback would have found nothing and
reported clean. The two bytes are now the six-character escape sequence for NUL —
identical at runtime, both key-building sites changed together — and the file is text
to every tool again. Same lesson as the address sweep: *validate the detector*. It was
caught only because the counter, which reads bytes rather than shelling out, disagreed
with grep.

**What the removal broke, and how it was repaired in the same turn.**
`apps/dashboard/.../voice/call/route.ts` is the **only** file in the dashboard that
calls `getDb()`, and after the deletion no dashboard file mentions `DXB_DATABASE_URL`
at all. Next.js reads env files from `apps/dashboard/`, not the repository root, so
that fallback had been the only thing giving the route an address on this machine.
`scripts/dashboard.sh` now does for the dashboard exactly what the units do for the
daemons — source the company's env files, map `DXB_COMPANY_DATABASE_URL` onto
`DXB_DATABASE_URL` for that process only — and `pnpm dashboard` / `pnpm dashboard:start`
are wired to it. `db/README.md` §Environment carries the table of who sets the address
and how.

**The two resident daemons, measured across the rename.** `.env.daemon` was migrated
(backup `.env.daemon.pre-b36-block4`, mode 600; 1372 → 1380 bytes, the eight added
characters, 23 keys before and after), the units reinstalled and restarted:

```
$ tr '\0' '\n' < /proc/<pid>/environ | grep -E '^DXB_(COMPANY_)?DATABASE_URL='
dxb-scheduler pid 598570 → DXB_COMPANY_DATABASE_URL=postgresql://***:***@127.0.0.1:54322/postgres
                           DXB_DATABASE_URL=postgresql://***:***@127.0.0.1:54322/postgres
dxb-jarvis    pid 598578 → (the same two)

$ SELECT application_name, state, backend_start FROM pg_stat_activity …
pgboss | idle | since 19:40:19   (x 9)
dxb-company-read-gateway | idle | since 19:40:19
```

Both daemons carry the mapped variable, pg-boss reconnected to the company engine the
second they came back, and **NRestarts=0** on all four resident units afterwards.

**The gates, after.**

```
pnpm construction:battery   BATTERY_GREEN — 107 files / 775 passed / 15 skipped
                                            + host 2 files / 11 passed
pnpm typecheck              exit 0
pnpm verify:ledger          ledger truth OK — 8 state claims, 97 open markers, 70 CEO approvals
pnpm verify:schema-parity   SCHEMA_PARITY
pnpm b36:prove-wall         WALL_IS_ONE_WAY
gitleaks detect             no leaks found (748 commits)
```

**And the company did not move.** The fingerprint was taken before the battery and
again after everything above:

```
STATE_FINGERPRINT de359137ee1d7c79      (before)
STATE_FINGERPRINT de359137ee1d7c79      (after)
  rows in public 46735 · sequences 18 · large objects 0 · audit_log/hook_violations 29637/1963
```

**One read of the company was NOT taken through the gateway**, and it is named here
rather than left out: the `pg_stat_activity` query above, run with `psql` to prove the
daemons reconnected. The gateway's frozen catalogue holds fourteen named questions and
none of them is "which backends connected recently". It was a `SELECT`; the fingerprint
either side of it is identical.

**Deviations from the plan's Block 4 text, named.** (1) The plan said the `vitest`
`globalSetup` needed a guard against a company address arriving from the environment —
**it already has one**, built in Block 2 after the auditor's second FAIL: `pinTheEngine()`
refuses any `DXB_DATABASE_URL` that is not the construction engine, and
`refuseUnlessConstruction()` then asks the server for its cluster identity on the
connection that does the work. Nothing was added; the existing guard was measured.
(2) The plan's evidence line was `grep -rc "54322/postgres"` → 0 outside the daemon
installer. That test is not honest any more and was not used: `package.json` binds the
company address to `DXB_COMPANY_URL` for `verify:schema-parity` and `b36:prove-block1`,
which are gates that must reach the holding on purpose, and several `tests/b36` files
carry it as an assertion. The counter already separates *binding* from *mentioning* and
prints both lists; the headline it prints is the number that matters, and it is 0.
(3) `.claude/settings.local.json` lost its one permission entry that opened a direct
`psql` door to the company (202 → 201 entries). It is a local, git-ignored file.

## Two things the Block-4 battery runs surfaced · 2026-08-24 night

### 1. A test that failed one battery run in three, and it was never about B36

Proving Block 4 meant running the whole battery repeatedly, and on the fifth run it
went red on a file it had never named before:

```
FAIL tests/phase5/decompose-dispatch.test.ts > dispatch — queue rows + events
     (deterministic) > 2-envelope chain: both queued, depends_on resolved to uuid
AssertionError: expected [ Array(1) ] to deeply equal []
  ❯ tests/phase5/decompose-dispatch.test.ts:212   expect(rows[0].depends_on).toEqual([])
```

Row A came back where row B should have been. The case read the two tasks with
`ORDER BY created_at` and took the first as A and the second as B — and that is a
coin flip, because `tasks.created_at` defaults to `now()`, which in PostgreSQL is
the **transaction's** timestamp, while `dispatch()` inserts the whole batch inside
**one** transaction. Both rows therefore carry the identical timestamp and the tie
is broken however the planner feels that run. Measured on the construction engine:

```
BEGIN;
CREATE TEMP TABLE t (id uuid DEFAULT gen_random_uuid(), created_at timestamptz DEFAULT now());
INSERT INTO t DEFAULT VALUES;  INSERT INTO t DEFAULT VALUES;
→ two rows inserted one after another in ONE transaction; identical created_at: true
  (distinct values: 1)
```

**It is not Block 4's doing, and the record says why rather than asserting it.** The
only change this block made to that file is one deleted line — `git show HEAD --
tests/phase5/decompose-dispatch.test.ts` is a single `-process.env.DXB_DATABASE_URL
??= …`, an inert fallback that `vitest.config.ts` already defeated. The failure is an
ordering assertion, not a connection: the run's own `[global-setup]` line names
construction cluster `7677291653303935015` as usual. The case had been a coin flip
since it was written; a battery that runs five times in an evening is simply the
first thing that flipped it.

**Fixed at source, not retried.** The read no longer has an order to get wrong — the
two rows are looked up by id:

```ts
const byId = new Map(rows.map((r) => [r.id, r]));
expect([a!.status, b!.status]).toEqual(["queued", "queued"]);
expect(a!.depends_on).toEqual([]);
expect(b!.depends_on).toEqual([aId]);
```

The sibling assertion on `task_events` was checked and left alone: that table's `id`
is `GENERATED ALWAYS AS IDENTITY` and `dispatch()` inserts the events as one
multi-row `INSERT` in `taskIds` order, so `ORDER BY id` there really is determined.

**Proof it is stable:** the file alone, **12 consecutive runs — 12 passed, 0 failed**;
then the whole battery **three times in a row, BATTERY_GREEN each time**
(107 files / 775 passed / 15 skipped, plus host 2 files / 11 passed).

### 2. The nightly chore that reported FAILED for having nothing to do

`dxb-screenshot-cleanup.service` had failed at 00:00 every night. His ruling:
*"bu bir başarı değil ki, küçük bir haftalık temizlik görevi… SS varsa çalışsın."*

The cause was one line: `ExecStart=/usr/bin/find %h/Pictures/dxb-screenshots -type f
-mtime +7 -delete`, and `find` exits 1 when the folder does not exist. Two more facts
came out of measuring it, and both matter more than the failure did:

- **`dxb-screenshot` is not on this machine any more.** `/usr/local/bin/dxb-screenshot`
  does not exist, so nothing had been writing to `~/Pictures/dxb-screenshots` at all.
- **The `operator` command — what this machine actually uses for the screen — writes
  somewhere else:** `~/Pictures/operator` (`/opt/dxb-operator/cli.py:20`, `SHOTDIR`).
  A sweep of only the first folder would have been a weekly chore that could never
  find anything, for ever.

**Built:** `scripts/ops/screenshot-sweep.sh` sweeps **both** DXB folders, treats
nothing-to-do as success and keeps a non-zero exit for a real fault. It does **not**
touch `~/Pictures/Screenshots` (GNOME's own, 29 files / 7.2 MB) or the loose files in
`~/Pictures` — those are the CEO's own pictures. The timer is **weekly** with
`Persistent=true`, so a machine that was off on Monday sweeps at the next boot.

**Both unit files are now in the repository.** Until tonight
`dxb-screenshot-cleanup.service` and `.timer` existed ONLY in
`~/.config/systemd/user/`, hand-written, tracked nowhere — the same disease as
`dxb-freeze-guard.service` on 2026-08-21. `scripts/systemd/install.sh` owns them now.

**Drilled in every state, then run through systemd for real:**

```
no folder at all                       → exit 0   "nothing to sweep"     (x2 folders)
folder present, empty                  → exit 0   "held 0; deleted 0"
two folders, 3 old files + 1 fresh     → exit 0   "deleted 3 in total"; the fresh one stays
a folder that cannot be read           → exit 1   "1 folder(s) could not be swept"

$ systemctl --user start dxb-screenshot-cleanup.service     (folder absent)
ActiveState=inactive Result=success ExecMainStatus=0
$ systemctl --user start dxb-screenshot-cleanup.service     (3 files, 2 of them old)
screenshot-sweep: /home/dxb/Pictures/dxb-screenshots held 3 file(s); deleted 2 older than 7 days.
Result=success        kalan: fresh.png
```

The demo folder was removed afterwards, so the machine stands as it was found.
**Machine after: 0 failed units** (it was 1), next fire `Mon 2026-08-31 00:11:42 CEST`,
and all four resident services `active`, `NRestarts=0`.

**⚠ UNVERIFIED — requires a human decision, not a terminal.** `dxb-screenshot` is
gone and nothing has replaced it; whether it should be reinstalled, or whether
`~/Pictures/operator` is now the only screenshot folder that matters, is the CEO's
call and has not been taken.

## The auditor's five instructions, carried out · 2026-08-24 night

The CEO relayed them and ordered them carried out in full: restart the live
dashboard through `scripts/dashboard.sh`, verify the actual listening
`next-server` carries `DXB_DATABASE_URL`, add a gate that fails if the dashboard
is started without the wrapper, prove the authenticated voice-call path end to
end, and remeasure the company fingerprint before and after.

**The company fingerprint, before any of it and after all of it:**

```
STATE_FINGERPRINT de359137ee1d7c79     (before)
STATE_FINGERPRINT de359137ee1d7c79     (after)
  60 tables · 46,735 rows · rows aecfcfa259c9c501 · 18 sequences 98258eb817d8e3b8
  0 large objects · audit_log/hook_violations 29,637/1,963
```

### 1. The auditor was right, and the measurement is worse than the question

Before touching anything:

```
$ ss -ltnp | grep :3000
LISTEN  *:3000   users:(("next-server (v1",pid=3785656))          ← every interface
$ parent chain of 3785656
  pnpm --filter ./apps/dashboard dev   ← started by hand, from a session shell, 6h50m earlier
$ tr '\0' '\n' < /proc/3785656/environ | grep -c '^DXB_DATABASE_URL='
0
```

The dashboard serving the CEO right now carried **no company address at all**.
Block 4 had removed the route's fallback and written the wrapper, and the live
process predated both — so the voice line was already broken and nothing said so;
his next call would have found out.

**And it was not only mis-started. It was published to the house:**

```
127.0.0.1:3000        -> 307        192.168.178.44:3000   -> 307   ← the home network
172.17.0.1:3000       -> 307        172.18.0.1:3000       -> 307
```

Anyone on the network reached the holding's front end. That is the same open door
the CEO ordered shut on the database ports this morning, on a different port.

### 2. Restarted through the wrapper, and the listening process was asked

```
$ pnpm dashboard          (scripts/dashboard.sh dev)
dashboard: dev on 127.0.0.1:3000, address handed in from the company's env files.
✓ Ready in 197ms
[dashboard] started by scripts/dashboard.sh dev; the company address is in hand.

$ ss -ltnp | grep :3000
LISTEN  127.0.0.1:3000   users:(("next-server (v1",pid=854685))    ← loopback only
$ tr '\0' '\n' < /proc/854685/environ | grep -E '^DXB_(DATABASE_URL|DASHBOARD_LAUNCHER)='
DXB_DATABASE_URL=postgresql://***:***@127.0.0.1:54322/postgres
DXB_DASHBOARD_LAUNCHER=scripts/dashboard.sh dev

$ the LAN door, re-measured
192.168.178.44:3000 -> refused        172.17.0.1:3000 -> refused
127.0.0.1:3000      -> 307
```

The wrapper binds to `127.0.0.1` unless `DXB_DASHBOARD_HOST` says otherwise.

### 3. The gate — and both of its refusals were run against a real server

`apps/dashboard/src/instrumentation.ts` is Next's startup hook. It judges the
environment before the first request and stops the process with a named reason.
It is exempt during `next build` (several specs gate on that build) and in the
edge runtime.

```
$ env -u DXB_DASHBOARD_LAUNCHER -u DXB_DATABASE_URL next dev -p 3000
[dashboard] REFUSING TO SERVE — this dashboard was not started by
scripts/dashboard.sh. Start it with `pnpm dashboard` … measured live on 2026-08-24.
exit 2 · nothing left listening

$ env -u DXB_DATABASE_URL DXB_DASHBOARD_LAUNCHER="a hand-typed command" next dev -p 3000
[dashboard] REFUSING TO SERVE — started by a hand-typed command, but
DXB_DATABASE_URL is empty. The wrapper maps DXB_COMPANY_DATABASE_URL …
exit 1 · nothing left listening
```

**A first attempt at this proof was invalid and is recorded rather than quietly
re-run:** the bare server was started while the good one was still up, and Next's
own "another next dev server is already running" check killed it first. The
refusal in that log was not the gate's. The test was redone with the port free.

**In the battery, permanently:** `tests/ops/dashboard-launcher.host.test.ts`,
named in `scripts/construction/battery.sh` HOST_FILES beside the freeze guard —
the sandboxed half has its own PID namespace and must not be able to see this
machine's processes. Five cases: the judgement refuses each fault shape and allows
the wrapper's own environment; the wrapper really exports both things and really
binds loopback; `register()` really consults the judgement and really exits; and
**the live one** — whatever is serving the dashboard right now must carry both.
Seen RED first, against an unstamped listener planted on the port:

```
× (4) LIVE — whatever is serving the dashboard right now was started properly
  → the dashboard serving :3000 (pid 873351) was NOT started by scripts/dashboard.sh.
    Stop it and run `pnpm dashboard`. This is exactly the state the auditor found
    on 2026-08-24 …
```

### 4. The authenticated voice-call path, proven end to end

**Where it was proven, and why there.** The CEO's standing order of 2026-08-23 is
*"bundan sonra TEK BİR HARF DAHİ ŞİRKETİN VERİ TABANINA GİRMESİN"*, and a real
voice call writes: `control_voice_call_log` inserts into `voice_calls` and the
intake inserts an `intents` row. The conflict was named to him rather than decided
quietly. The proof was run against the **construction engine** — which is what B36
built the second engine FOR — through a dashboard started by the same wrapper, so
every link in the chain is the real one and not one row of the holding's moved.

```
$ node_modules/.bin/supabase status --workdir construction        → API 54421, DB 54422
$ POST {API}/auth/v1/admin/users                                  → HTTP 200, a proof-only user
$ construction auth.users: 1 (proof user present: 1)
$ company      auth.users: 1 (proof user present: 0)

$ DXB_DATABASE_URL=<construction> NEXT_PUBLIC_SUPABASE_URL=<construction> pnpm dashboard
[dashboard] started by scripts/dashboard.sh dev; the company address is in hand.
pid 866120 → DXB_DATABASE_URL=postgresql://***:***@127.0.0.1:54422/postgres

$ mint a session with @supabase/ssr itself (not a hand-rolled cookie)
signed in as b36-proof@construction.local (id fe18d003-…)
cookies minted: sb-127-auth-token   (2593 bytes, written mode 600, destroyed after)

$ Piper TTS: "Bugünkü açık işleri özetle." → 75,820 bytes of wav
$ POST /api/voice/call  WITH the session
  → HTTP 201 in 4782 ms
  → {"callId":"dedb323c-08c6-4e0a-a184-6b94069644c5",
     "transcript":"bugünkü açık işleri özetle.",
     "intentId":"b896638f-5658-4843-bcb1-d3793f0177fa","sttMs":4145}

$ POST /api/voice/call  WITHOUT a session   → turned away before the route runs
  (307 to /login for a plain POST; Next answers a multipart POST the wall rewrote
   with 404 "Server action not found" — the wall is apps/dashboard/src/proxy.ts)
```

Real Turkish speech, real Whisper transcription inside the route, a real intent
row, a real 201. **And it landed where it should:**

```
construction voice_calls: 1   → dedb323c-… status 'routing', the Turkish timeline
construction intents:     1   → b896638f-…, the id the route returned
company voice_calls: 102      → rows carrying the proof call id: 0
company intents               → rows carrying the proof intent id: 0
```

The proof user was deleted afterwards (construction `auth.users` back to 0) and
every credential file the proof used was shredded.

**What was NOT proven, said plainly:** the same call has not been fired against the
COMPANY's engine, because that would write into the holding and his order forbids
it. What the company side carries instead: the live server holds the company
address (measured, above), its authentication wall turns strangers away
(307/`/login` 200, measured), and the two engines' `public` schemas are identical
object for object (`SCHEMA_PARITY`, run tonight). **If he wants the last inch —
one real call on the company, which will add one `voice_calls` row, one `intents`
row, and let the scheduler's drain answer it — that is his word to give.**

### 5. Fixing the dashboard's open door broke a gate, and the gate caught it

Binding the dashboard to loopback made `pnpm b36:prove-wall` print
`PROBE_IS_BLIND … WALL_UNPROVEN`. The reason is worth the paragraph: the drill's
**control** probe — the green half that must succeed, so that a refusal means
something — dialled `<this machine's LAN address>/3000`. It only ever answered
there because the CEO's dashboard was published to the home network. **The drill's
proof of its own eyesight was borrowing a security hole**, and closing the hole
blinded it.

Fixed at source: the drill now opens its **own** control door — a listener on port
54499 bound to this machine's routable address, waited for, dialled from inside
the container, then shut.

```
works    a door on this machine that is NOT the holding's     REACHABLE
listeners left on 54499: 0
WALL_IS_ONE_WAY
```

### The gates, after all of it

```
pnpm construction:battery   BATTERY_GREEN — 107 files / 775 passed / 15 skipped
                                            + host 3 files / 16 passed  (was 2 / 11)
pnpm typecheck              exit 0
pnpm verify:ledger          ledger truth OK
pnpm verify:schema-parity   SCHEMA_PARITY
pnpm b36:prove-wall         WALL_IS_ONE_WAY
count-company-fallbacks     0
four resident services      active, NRestarts=0 · 0 failed units on the machine
STATE_FINGERPRINT           de359137ee1d7c79 — unchanged, before and after
```

### Also on his word: the weekly screenshot sweep covers ONE folder

*"sadece ~/Pictures/operator kalsın."* `scripts/ops/screenshot-sweep.sh` no longer
looks at `~/Pictures/dxb-screenshots`; by his ruling that is not the screenshot
folder any more. Proven live through systemd: with one old and one fresh file,
`deleted 1 older than 7 days`, `fresh.png` still there, `Result=success`; with no
folder at all, `nothing to sweep`, exit 0.

### ⚠ UNVERIFIED — a terminal cannot settle these

- ~~**A root-owned `next-server` (pid 11180) has been running 1 day 12 hours.**~~
  **ANSWERED BY HIM, 2026-08-24 night:** *"Leave PID 11180 alone; it belongs to the
  open-notebook container."* It is not a stray; nothing to do, and it is not raised
  again. The question was right to ask and the answer was his to give — a terminal
  could see the process and could not see whose it was.
- The dashboard has not been **looked at by eye** since the restart. It answers
  `307 → /login` and `/login` returns `200`; that a human sees what he expects is
  his eye's to confirm.

## Block 4 — the auditor passed it, and the live screen his eye needs · 2026-08-24 night

**His auditor's verdict, in his own relay:** *"Block 4 passes. Do not write a
synthetic voice call to the company database. Leave PID 11180 alone; it belongs to
the open-notebook container. Proceed to Block 5 under the approved B36 plan."*

**Two of those are decisions, and both are now closed:** the company will NOT be
given a synthetic voice call — the leg this evidence file left open waiting on his
word is shut by his word — and the root-owned process that could not be identified
from a terminal has an owner. Neither is raised again.

**IT IS STILL NOT ACCEPTED.** LAW B, and his own second condition, given before the
auditor answered: *"denetçi onaylamadan asla 4 bitti diyemezsin. onayladıktan sonra
da gözümle gösterilecek şekilde canlı şekilde bana göstermelisin."* The auditor
passing is the first half. The second half is his eye, on a screen that runs.

**The screen:** `pnpm b36:eye-check` → **http://127.0.0.1:4599/blok4**. It lives in
the same file and on the same door as the Block 3-bis screen he already accepted;
that page's four panels are untouched, its stylesheet is now named once so the two
screens cannot drift apart, and each links to the other. Five panels, all RUN while
he watches, nothing pre-computed:

| # | What his eye sees | Measured on the run he watched |
|---|---|---|
| 1 | No file assumes the company's address | 2,837 files scanned · **0** · and the counter is first shown finding a planted fallback (`1`), so a blind zero cannot pass for a clean house |
| 2 | A tool given no address stops instead of guessing | `db/seed/import-routing-rules.ts` → **exit 2**, and the refusal names `DXB_DATABASE_URL` |
| 3 | The dashboard cannot be started by hand | the process serving him (pid 874088) carries the address and the stamp `scripts/dashboard.sh dev`; the gate, run against a bare environment, **exit 2**, refusing for the right reason |
| 4 | The dashboard answers this machine and no other | `127.0.0.1:3000` → **200** · `192.168.178.44:3000` → **closed** |
| 5 | The company did not move | `de359137ee1d7c79` → `de359137ee1d7c79`, audit records `29637/1963` → `29637/1963` |

**RULE #0 design pass — and it caught a law being broken.** The first render was
looked at, not assumed: panels 2 and 3 printed the tools' own **English** sentences
onto a screen that is his, and every CEO-visible surface is 100 % one locale
(`00-CEO-DIRECTIVE-LANGUAGE`). The page was rewritten to carry the FACT in Turkish —
*did it stop · does it name the address · did it refuse for the right reason* — with
the English originals left in this file, where artefacts belong. The second render
was looked at again and is clean.

**One operator mistake, recorded because it is the standing trap.** A reload was
sent with `operator key F5` without first confirming from a screenshot which window
had focus, and it went to the editor rather than the browser. The skill's own second
rule says exactly this. The page was brought forward by opening its address again
instead — no keystroke, so nothing could land in his prompt box.

**Gates on the final state:** `BATTERY_GREEN` 107 files / 775 passed / 15 skipped +
host 3 / 16 · `tsc` 0 · `verify:ledger` OK · `SCHEMA_PARITY` · `WALL_IS_ONE_WAY` ·
fallbacks **0** · four resident services `active`, `NRestarts=0` · 0 failed units ·
`STATE_FINGERPRINT de359137ee1d7c79`.

**HE ACCEPTED IT — 2026-08-24, on the screen above.** <!-- CEO-OK: b36-block4-accepted-2026-08-24 -->
*"göz onayı tamamdır. kabul."* Registered in `scripts/governance/ceo-approvals.json`
as `b36-block4-accepted-2026-08-24`, carrying his words, the auditor's verdict that
preceded it, and the two rulings he attached. The paragraph that stood here — *"there
is no entry … no record may call Block 4 accepted"* — was true for four hours and is
deleted by his word rather than kept beside it (LAW A). **Row B36 stays open:** Block
4 is one block of eight, and Block 5 is next.

---

## Block 5 — the dry-run survey (2026-08-25, nothing moved)

**Nothing in this section changed a row.** Every statement is a `SELECT`, and the
company's fingerprint is printed unchanged at the bottom. The plan's rule is that a
dry-run report goes to the CEO before the first row moves; this is the measurement
behind it.

**How the company was read, said by name.** The construction side's gateway
(`scripts/b36/company-read-client.mjs` → `dxb-company-read.service`) answers 14
NAMED questions and no others:

```
$ node -e 'import("./scripts/b36/company-read-client.mjs").then(m=>m.ask("catalogue",null)).then(console.log)'
agent_runs_total, agents_active, agents_archived, agents_legacy_version_live,
agents_stale_persona_path, agents_total, hr_employees_evaluated, library_empty_kinds,
library_grants_live, library_items_total, library_usage_log_rows, objectives_total,
today, voice_calls_total
```

Not one of them is a residue question, and the survey needs row-level samples the
gateway is not built to return (it answers with a single scalar). **So this survey
was taken with `docker exec … psql -U supabase_admin -d postgres`, SELECT only** —
the same read path `scripts/b36/company-state-fingerprint.mjs` already uses for what
the window cannot reach. It is named here because a read that goes around the gate
must be named in the report.

### First: why `memory_index` was empty, and what the record said instead

The handover asked for this before anything else — a plan that cannot count the rows
it proposes to move is not a plan. Four measurements, in the order they were taken:

```
$ … -c "SELECT count(*) FROM public.memory_index"                    → 0
$ … pg_stat_user_tables WHERE relname='memory_index'                 → n_tup_ins 0 · n_tup_del 0
$ … SELECT pg_postmaster_start_time()                                → 2026-08-25 07:29:53+00
$ … pg_stat_user_tables WHERE relname='audit_log' (29,637 rows)      → n_tup_ins 0 · n_live_tup 0
```

**The statistics prove nothing and are not used as evidence.** The engine had been
running six minutes; every table on it, including the 29,637-row `audit_log`, reads
zero inserts. A counter that says zero for a table with 29,637 rows in it is a
counter that was reset, not a fact about the table.

What the engine *does* carry from before that restart:

```
 relname            | relfilenode | relpages | xid_age
--------------------+-------------+----------+---------
 memory_index       |       28866 |        0 |  250778     ← rewritten far more recently
 project_members    |       28947 |        0 |  478704     ← 0 rows, never populated: the control
 hook_violations    |       28809 |       45 |  478480
 audit_log          |       28640 |      912 |  478493
 agents             |       28584 |       14 |  478818
```

```
 index_name             | relpages | size
------------------------+----------+--------
 memory_index_pkey      |      109 | 872 kB      ← the ghost of ~15k rows on an empty heap
 idx_memory_index_scope |       43 | 344 kB
 idx_memory_kind        |       42 | 336 kB
```

`project_members` is the control: it holds 0 rows and always has, and its frozen-xid
age sits with everything else at ~478,700. `memory_index` sits 227,900 transactions
younger — it was emptied and vacuumed long after its neighbours — and its primary key
still holds 109 pages over a heap of zero. **The table was full and was emptied.**

**By whom, and on whose word — found outside the database, because the database has
no record of it:**

```
$ ls -la ~/backups/dxb/
-rw-rw-r-- 1 dxb dxb  3284938 Aug 23 18:55 memory_index-before-ceo-wipe-2026-08-23.sql
-rw-rw-r-- 1 dxb dxb   721167 Aug 23 18:56 memory_embeddings-before-ceo-wipe-2026-08-23.sql

$ git log -1 --format=%B 9b65a4ae
fix(b36): the holding's memory stops being the construction site's diary
CEO order, 2026-08-23, in his own words:
  "ARTIK HİÇ BİR ŞEY SEN VEYA BAŞKASI ÇALIŞIRKEN YAZILMASIN"
  "şirketin hafızasını tamamen temizle sıfır"
```

The two export files were counted from the files themselves, not from the commit
message:

```
$ python3 scratchpad/count_wipe_file.py memory_index-…sql memory_embeddings-…sql
memory_index       : 15,773 data rows · by store {claude-mem 15,699 · pgvector 37 ·
                     obsidian 32 · notebook 5} · created_at 2026-07-09 → 2026-08-23 16:00
memory_embeddings  :     37 data rows
```

**The answer:** the holding's memory is empty because he ordered it emptied on
2026-08-23, and it was exported first. **Why nobody could explain it from the
company's own record:** two things.

1. **`audit_log` holds no entry for it.** Searched by every deletion-shaped name —
   `action ILIKE '%memor%|%purge%|%truncate%|%delete%|%clear%|%reset%|%wipe%'` — the
   only hit is the `library.purge` of 2026-08-01. The rows were deleted directly,
   not through a path that writes an audit row. **Recorded as a real gap:** 15,773
   rows left the company and its own book says nothing. Whether the holding's record
   should carry a line for it is his to say; nothing was written into `audit_log` to
   fix it, because that table is a boundary he has not opened.
2. **`.planning/STATE.md` said the opposite.** It still carried *"Nothing was changed
   … it goes to Block 5"* about the very job he had ordered dead five hours later.
   That sentence is now deleted rather than annotated (LAW A) and replaced by what he
   ordered, with the counts, the backup path and the commit.

### The dry-run: every candidate group, counted, with samples

**Group 1 — `cost_ledger`: 1,612 rows, and every one of them is the construction's.**

```
 source | model                     |   n | no_task_no_agent | first_day  | last_day   | eur
--------+---------------------------+-----+------------------+------------+------------+------
 hook   | <synthetic>               | 950 |              950 | 2026-07-14 | 2026-08-22 | 0.0000
 hook   | claude-fable-5            | 282 |              282 | 2026-07-14 | 2026-07-25 | 0.0000
 hook   | claude-opus-5             | 122 |              122 | 2026-07-25 | 2026-08-21 | 0.0000
 hook   | claude-sonnet-5           | 113 |              113 | 2026-07-16 | 2026-07-30 | 0.0000
 hook   | claude-opus-4-8           | 109 |              109 | 2026-07-14 | 2026-07-25 | 0.0000
 hook   | claude-haiku-4-5-20251001 |  36 |               36 | 2026-07-17 | 2026-07-25 | 0.0000

 rows with source <> 'hook'                     : 0
 distinct meta keys across all 1,612 rows       : session_id (1,612)
 distinct departments                           : engineering (1,612)
 rows carrying a task_id / agent_id             : 0 / 0
```

Three sample rows (id 2430, 2551, 20707):

```
 2430 | 2026-07-14 10:09:05+00 | hook | <synthetic>   | subscription | engineering | 0.000000 | {"session_id": "3485a34d-…"}
 2551 | 2026-07-14 11:09:29+00 | hook | claude-fable-5| subscription | engineering | 0.000000 | {"session_id": "dfd8ec7c-…"}
20707 | 2026-08-22 18:11:51+00 | hook | <synthetic>   | subscription | engineering | 0.000000 | {"session_id": "0e95a2d8-…"}
```

The plan's fear — that a blind rule would carry the company's own spending out with
the construction's — is answered by measurement rather than by narrowing the rule:
**there is no company spending in this table to protect.** The last row is dated
2026-08-22, the day before Block 1 killed the `SessionEnd` writer, and nothing has
been written since.

**Group 2 — `memory_index` · `memory_embeddings`: 0 and 0.** Already gone on his
order (above). Block 5 has no work here.

**Group 3 — `pgboss`: not residue.**

```
 job 79,178 · queue 22 · schedule 14 · job_dependency 0 · subscription 0
 oldest job on the engine: 2026-08-17     (pg-boss deletes its own completed work)
 queues: chat.drain · voice.drain · task.worker · intent-intake · workflow.run ·
         outbox-tick · library.profile_recompile · lease-reaper · velocity-breaker ·
         orchestration.work_generate · ceo.briefing.morning · revenue.{scan,score,rollup,brief} ·
         hr.{training_queue,performance_daily,probation_check,stale_persona_scan} ·
         tool-pin-check · memory-compaction · __pgboss__send-it
```

Every queue and every schedule is the holding's own. The 303,136 in the plan was a
photograph of a self-pruning table, not a pile of residue; it is 79,178 today because
pg-boss cleaned up after itself, not because anything was moved.

**Group 4 — `project_risks`: 1 of 3.**

```
 4e48b9a4… | DXB Global OS | Approvals brown-token audit deferred by CEO order (2026-07-14) | low    | OPEN
 c03b0990… | DXB Global OS | Workforce activation gap: 219 of 220 employee records dormant  | high   | closed
 27643259… | DXB Global OS | Cost Intelligence surface (E11) pending                        | medium | closed
```

The first is the construction chore standing on his risk page. The other two are the
company's own closed business risks and stay.

**Group 5 — `decision_log`: 1,143 of 4,730, and the plan never named it.**

```
 decided_by matching ^(worker-|r21t|e2e|test) : 1,143      everything else : 3,587
 names: worker-lad-1 (110) · r21t-resident (102) · worker-lad-lc · worker-lad-ok ·
        worker-lad-2 · worker-e2e-1 · worker-fail-1 · worker-dep-1 · worker-dep-2 ·
        worker-hard-1..5 · worker-orch-qa-{appr,mal,done,noc,fail}   — 19 names
 window: 2026-07-24 → 2026-07-28, without exception
```

Three sample rows:

```
18584 | 2026-07-25 03:54:20+00 | worker-lad-1 | employee-selection | no active employee with an MCP profile in 'orch-ladder-a' …
18586 | 2026-07-25 03:54:20+00 | worker-lad-1 | employee-selection | no active employee with an MCP profile in 'orch-ladder-a' …
18588 | 2026-07-25 03:54:20+00 | worker-lad-2 | employee-selection | no active employee with an MCP profile in 'orch-ladder-a' …
```

These are the orchestrator ladder rehearsals of the E-series, written into the
holding's decision record by workers that were never employees. **It goes to him with
the others; nothing is assumed.**

**Group 6 — the boundary, measured but not touched.** `hook_violations` 1,963 ·
`audit_log` 29,637. For his eye when he rules on them: 1,291 audit rows carry a
construction-shaped actor (`fable-5` 809 · `test` 127 · `engineering` 127 · `tracer`
127 · `e125t-test` 66 · `engineering-worker` 35) and 1,789 more are the
`memory_commit` trail of the diary sync he has already had removed.

**Swept and found clean of construction residue:** `control_idempotency` (2,639,
2026-07-12 → 07-28, request keys of the control surface itself), `task_events`
(1,543), `library_change_log` (809), `agent_runs` (378), `tool_calls` (325), `tasks`
(217, of which 213 done), `alerts` (149), and the 46 remaining tables in `public`.
The row counts of all 60 tables were taken in one statement and are the same 46,735
the fingerprint reports.

**The company did not move while it was being read:**

```
$ node scripts/b36/company-state-fingerprint.mjs
  tables in public 60 · rows in public 46735 · audit_log/hook_violations 29637/1963
  STATE_FINGERPRINT de359137ee1d7c79
```

**Nothing in Block 5 proceeds until he has answered the dry-run.** Registered as
still his in the plan §8: which groups are construction and which are the holding's
own record, and whether `audit_log` and `hook_violations` are opened at all.

---

## Block 3-bis — the window into the holding could never open, and the reboot proved it

**Found by running the battery, 2026-08-25, on a machine that had just rebooted.**
The whole sandboxed suite — 107 files — died before a single test ran:

```
$ pnpm construction:battery
=== 1/2 · THE CONSTRUCTION RUNTIME — the sandboxed suite ===
bwrap: Can't find source path /run/user/1000/dxb/company-read.sock: Permission denied
…
sandboxed suite : exit 1 · host suite : exit 1 · BATTERY_RED
```

**The cause, measured, not deduced.** `scripts/construction/sandbox.sh` tests for
the gateway socket as **root** and then binds it with `bwrap`, which
`setpriv --reuid=997` has already dropped to the construction identity — and that
identity cannot even traverse the directory the socket sits in:

```
$ sudo -n -u dxbbuild id           → uid=997(dxbbuild) gid=973(dxbbuild)
$ sudo -n -u dxbbuild ls /run/user/1000/
ls: cannot open directory '/run/user/1000/': Permission denied
$ getfacl -p /run/user/1000        → user::rwx  group::---  other::---   (no ACL)
```

The root test sees the socket, arms the bind, and the unprivileged `bwrap` then
cannot resolve it.

**A CLAIM THAT STOOD HERE FOR AN HOUR IS WRONG AND IS REPLACED, NOT ANNOTATED.** It
said the branch had never worked and that every green battery had run with the
gateway crash-looping. That was reasoning, not measurement, and the measurement
refutes it: run with the gateway deliberately stopped,
`tests/b36/wall-question.test.ts` **fails twice** — *"no route reaches the company,
and the one door answers"* and *"the governance gate reads the holding through the
door, and fails closed without it"*. A green battery therefore could **not** have run
with the door shut. The bind was working before this morning's reboot.

**What is measured, and what is not.** Measured: `bwrap` here is a plain
`-rwxr-xr-x root root` binary with no file capabilities, it runs as uid 997, and uid
997 cannot traverse `/run/user/1000` today. Therefore the bind fails today, and the
repository contains nothing that would ever have made it succeed — no `setfacl`, no
`chmod`, no tmpfiles rule; `getfacl /run/user/1000` shows no ACL. **UNVERIFIED —
could not measure** how the directory was traversable before: `/run/user/1000` is a
tmpfs recreated at every boot, so whatever loosened it was done by hand outside the
repository and is gone. The lesson is the one that matters either way: **the wall
depended on a permission that nothing in this repository sets and no reboot
preserves.**

**Why the obvious fix is refused.** Giving uid 997 a traverse bit on
`/run/user/1000` would hand the construction identity the author's desktop: that
directory holds `bus` and `pipewire-0` at `srw-rw-rw-`.

```
srw-rw-rw- 1 dxb dxb 0 Aug 25 09:29 bus
srw-rw-rw- 1 dxb dxb 0 Aug 25 09:29 pipewire-0
```

**The repair.** The socket is **relayed** into the bridge — the same shape the
allowed TCP ports already use — by a forwarder running as the socket's own owner,
the only identity that has to reach in. `bwrap` then binds a path inside the
root-owned bridge, which uid 997 can resolve. It carries bytes and no privilege.
**Proved end to end before it was written, with the real gateway and the real
construction identity:**

```
$ socat UNIX-LISTEN:/tmp/dxbgw/company-read.sock,fork,mode=666 \
        UNIX-CONNECT:/run/user/1000/dxb/company-read.sock &

$ DXB_COMPANY_READ_SOCKET=/tmp/dxbgw/company-read.sock node …askClaim("agents_total")
agents_total = 205
$ sudo -n -u dxbbuild env DXB_COMPANY_READ_SOCKET=/tmp/dxbgw/… …askClaim("agents_total")
uid997 agents_total = 205
$ sudo -n -u dxbbuild env DXB_COMPANY_READ_SOCKET=/tmp/dxbgw/… …askClaim("SELECT 1")
refused: no such question: SELECT 1
```

The relay was killed and its directory removed in the same turn (`ss -lx | grep -c
dxbgw` → 0).

**INSTALLED, 2026-08-25.** He supplied the one thing this session could not hold:
root. The wall that runs is `/usr/local/sbin/dxb-construction-sandbox`, owned by
root by design so the construction cannot rewrite it, and the sudoers file grants
this session only three passwordless rights — open the sandbox, act as `dxbbuild`,
read the packet filter. The credential was used through `SUDO_ASKPASS` from a file
outside the repository, mode 600, shredded in the same command; the cached sudo
timestamp was dropped afterwards with `sudo -k`. It was never written into the
repository, a record, a log or any output.

```
$ SUDO_ASKPASS=… bash scripts/construction/install-wall.sh
WALL_INSTALLED /usr/local/sbin/dxb-construction-sandbox

$ md5sum /usr/local/sbin/dxb-construction-sandbox scripts/construction/sandbox.sh
8c2e510f091e81b51500c00be95b4657  /usr/local/sbin/dxb-construction-sandbox
8c2e510f091e81b51500c00be95b4657  scripts/construction/sandbox.sh      ← no drift
-rwxr-xr-x 1 root root 8355 Aug 25 10:56 /usr/local/sbin/dxb-construction-sandbox
```

**Nothing else moved with it (his law of 2026-08-17).** The sudoers file still
carries the same four rules and no more; `/usr/local/share/dxb-company-wall.nft`
and `/etc/systemd/system/dxb-company-wall.service` were byte-identical to the
repository's copies before the run and after it; `dxb-company-wall.service` is
`active`; the kernel table still holds its three chains; the gateway still answers
(`agents_total = 205`).

**AND THE BATTERY IS GREEN — the whole of it, with the window OPEN:**

```
$ bash scripts/construction/battery.sh
=== 1/2 · THE CONSTRUCTION RUNTIME — the sandboxed suite ===
 Test Files  107 passed (107)
      Tests  775 passed | 15 skipped (790)
=== 2/2 · THE AUTHOR'S HAND — outside the sandbox ===
 Test Files  3 passed (3)
      Tests  16 passed (16)
sandboxed suite : exit 0 · host suite : exit 0
BATTERY_GREEN
```

**And the drill that crashed this morning now answers its own question.** The
decisive line is the governance gate speaking to the holding FROM INSIDE the
sandbox, through the relay, and failing closed without it:

```
$ pnpm b36:prove-wall
  THE GOVERNANCE GATE, from inside the sandbox:
    with the gateway running   exit 0 — ledger truth OK: … 73 CEO approval claims …
    with the gateway stopped   exit 1 — the company's read gateway is not answering
  THE HOLDING'S OWN FRONT DOOR — can anything that is NOT this machine dial it?
    192.168.178.44/54322 refused · /54321 refused · 172.17.0.1/54322 refused
    192.168.178.44/54422 refused · /54421 refused
    a door on this machine that is NOT the holding's   REACHABLE
  THE HOLDING, BEFORE AND AFTER THIS WHOLE DRILL
    STATE_FINGERPRINT 453b0ef99e03a1f3  ->  453b0ef99e03a1f3
    audit_log / hook_violations 29641/1963 -> 29641/1963
  ANSWER: NO. … The holding is unchanged by the asking.
WALL_IS_ONE_WAY
```

The paragraph that stood here — *"NOT INSTALLED … the battery stays RED"* — is
spent and is deleted rather than kept beside the truth (LAW A). Everything else
was re-run with it:

```
$ pnpm typecheck                       exit 0
$ pnpm verify:ledger                   ledger truth OK · 71 CEO approval claims each registered
$ pnpm verify:schema-parity            SCHEMA_PARITY
$ node scripts/b36/count-company-fallbacks.mjs   EXECUTABLE FALLBACKS: 0
$ gitleaks git --redact -v             754 commits scanned · no leaks found
$ node scripts/b36/company-state-fingerprint.mjs STATE_FINGERPRINT de359137ee1d7c79
```

---

## Block 5 — the residue is OUT, moved and not deleted (2026-08-25)

**His word, given on the measured dry-run above:** *"Üçü de çıksın."* · the boundary
*"kapalı kalsın"* · and one retrospective record authorised, *"1. kabul ediyorum."*
Registered: `scripts/governance/ceo-approvals.json` →
`b36-block5-residue-and-two-databases-2026-08-25`. `scripts/b36/move-residue.mjs`
refuses to run at all if that key is not in the register.

**And he said what the whole row is FOR, unprompted, which is wider than the wipe:**

> *"artık sadece şirket çalışanlarının ve şirketle ilgili herşeyin sadece şirketin
> veritabanına işlesin. Holdingi inşaa ederken yapılanlar da kendi veritabanına
> yazılsın ikisi tamamen ayrı olsun. Şirkette iş yapıldı mı çat kendi veritabanına,
> holdingin bir parçasımı geliştiriliyor çat inşaat veritabanına. Holdingin içinde
> yapılan geliştirme çalıştımı veya çalışıyor mu diye test edilmesi de dahil."*

Each thing writes to its own database — and **testing whether a piece of the holding
works is building, not company business.** His order of 2026-08-23 was therefore never
"the holding may have no memory": `memory_index` is free to fill again with the
COMPANY's own memory, and what is forbidden for ever is the construction writing into
it. Any reading to the contrary is deleted (LAW A).

### What was standing on the tables before anything was deleted

```
foreign keys pointing AT cost_ledger / project_risks / decision_log : 0   (no cascade, no refusal)
triggers on them  : trg_alert_cost_threshold        AFTER INSERT ON cost_ledger
                    trg_broadcast_cost_ledger       AFTER INSERT ON cost_ledger
                    trg_broadcast_opslive_decisions AFTER INSERT ON decision_log
                    → all three are INSERT-only; a DELETE fires nothing, raises no
                      alert and puts no event on his live screen
views reading them : 17 dependencies across 15 views (12 on cost_ledger, 4 on
                     decision_log, 1 on project_risks) — photographed before and after
```

### The move, in the order he set: COPY → VERIFY → DELETE → AUDIT

```
$ node scripts/b36/move-residue.mjs --apply
  his approval         : b36-block5-residue-and-two-databases-2026-08-25
  boundary before      : audit_log/hook_violations 29637/1963
  archive              : dxb_archive CREATED on the construction engine

── cost_ledger      rows 1612 · checksum 9328b28e43145bc47cd5fb5e5ad41e7f
                    archive 1612 · 9328b28e43145bc47cd5fb5e5ad41e7f · verified
                    deleted from company: 1612   left behind: 0
── project_risks    rows    1 · checksum 03c44b5227e952be87615c634416323a
                    archive    1 · 03c44b5227e952be87615c634416323a · verified
                    deleted from company: 1      left behind: 0
── decision_log     rows 1143 · checksum e1a87e4309fad0abaee9ac09fb77f169
                    archive 1143 · e1a87e4309fad0abaee9ac09fb77f169 · verified
                    deleted from company: 1143   left behind: 0

RESIDUE_MOVED   2,756 rows in total
```

Every group's delete and its `audit_log` record are ONE transaction: a row cannot
leave the company without the company's own book saying so. The archive carries a
`manifest` table with the same three checksums and his approval key against each.

**A defect this run found in itself, named rather than hidden.** The first `--apply`
moved two groups and then died on the third:
`ERROR: syntax error at or near "ARRAY"`. The table DDL was being built from
`information_schema.columns`, which calls **every** array column `ARRAY` — and
`decision_log.data_used` is `text[]`. Nothing was deleted for that group, because the
copy failed before the delete: **the order protected it.** The file now takes types
from `format_type(atttypid, atttypmod)`, the only spelling that is always a real type
name, and skips a group that is already empty so a re-run cannot write a second audit
record for work already done. The re-run carried `decision_log` out cleanly.

### The one write he authorised, and it is exactly one

```
$ … INSERT INTO public.audit_log … WHERE NOT EXISTS (… action='memory.cleared_on_ceo_order')
audit_log_before 29640 · already_there 0 · INSERT 0 1 · audit_log_after 29641
 id 74530 | 2026-08-25 08:43:03+00 | ceo | ceo | memory.cleared_on_ceo_order
```

It carries his order verbatim, the date, 15,773 + 37 rows, 15,699 of them
`store='claude-mem'`, both export paths, the commit `9b65a4ae`, the feeder that was
removed, and why it is late. The gap in the company's own book is closed.

### After — measured on both engines

```
COMPANY                       ARCHIVE (supabase_db_DxB_Build / dxb_archive)
  cost_ledger        0          cost_ledger    1612
  project_risks      2          project_risks     1
  decision_log    3587          decision_log   1143
  memory_index       0          manifest: 3 rows, checksums identical to the company's
  hook_violations 1963  ← his boundary, not one row moved
  audit_log      29641  ← 29637 + 3 move records + 1 memory record
  agents 205 · employee_records 199 · personas 408 · tasks 217  ← untouched
```

**His risk register now carries business risk only** — the acceptance test written in
board row C36, met:

```
 Workforce activation gap: 219 of 220 employee records dormant   | high   | closed
 Cost Intelligence surface (E11) pending                          | medium | closed
```

**Nothing broke around it (his law of 2026-08-17).** All 34 views in `public` still
answer. The 15 that were photographed:

```
view                    before   after   verdict
v_audit_trail            29637   29641   CHANGED — the four records of this work
v_cost_breakdown            59       0   CHANGED — intended: construction burn off his cost page
v_cost_entries            1612       0   CHANGED — intended
v_pnl_daily                 28       0   CHANGED — intended
v_decision_log            4730    3587   CHANGED — intended
v_global_search          35277   34138   CHANGED — intended
v_ceo_briefing               1       1   unchanged
v_exec_overview              1       1   unchanged
v_exec_overview_v1           1       1   unchanged
v_morning_briefing           3       3   unchanged
v_objective_progress         2       2   unchanged
v_org_node_detail          199     199   unchanged
v_org_tree                  21      21   unchanged
v_project_command            3       3   unchanged
v_snev                       1       1   unchanged
```

**The company's fingerprint moved, on purpose, and by exactly the right amount:**

```
before  46,735 rows  STATE_FINGERPRINT de359137ee1d7c79
after   43,983 rows  STATE_FINGERPRINT 453b0ef99e03a1f3
        46,735 − 2,756 moved + 4 audit records = 43,983   ✓ to the row
```

**Rollback, if he ever wants it:** every deleted row exists in two places —
`dxb_archive` on the construction engine, and
`~/backups/dxb/dxb-b36-pre-separation-2026-08-23.dump` (23,666,672 bytes, local and
off-site), which predates all of it.

**Gates after the move:** `verify:ledger` OK (72 CEO approval claims, each registered)
· `SCHEMA_PARITY` · company fallbacks **0** · `typecheck` 0 · the kernel wall
`table inet dxb_wall` loaded and holding after the reboot.

**⚠ NOT FINISHED UNDER LAW B, AND SAID PLAINLY.** `construction:battery` is **RED**
for the reason in the section above — the sandbox wall needs one root install this
session has no right to perform. Block 5 is **built and measured**, not accepted: his
auditor has not looked, and he has not seen it with his own eye. That was the order of
work he set for Block 4 and it is expected again here.

### And the rest of the battery is sound — measured, not assumed

Run once with the gateway deliberately stopped (and restarted immediately after,
`is-active` → `active`, socket back at 10:49), purely to see what else the wall
defect was hiding:

```
$ bash scripts/construction/battery.sh
=== 1/2 · THE CONSTRUCTION RUNTIME — the sandboxed suite ===
 Test Files  2 failed | 105 passed (107)
      Tests  3 failed | 772 passed | 15 skipped (790)
=== 2/2 · THE AUTHOR'S HAND — outside the sandbox ===
 Test Files  1 failed | 2 passed (3)
      Tests  1 failed | 15 passed (16)
BATTERY_RED
```

**Every one of the four failures is this one defect, and nothing else:**

| Failing test | Why |
|---|---|
| `company-is-read-only.test.ts` (5) — *the repository's copy has not drifted from the wall that runs* | **Correct behaviour.** The source is repaired and the root-owned copy is not. This gate is what forces the install rather than letting the two drift. |
| `wall-question.test.ts` — *the one door answers* | the gateway was stopped for this run |
| `wall-question.test.ts` — *the governance gate reads the holding through the door* | the gateway was stopped for this run |
| `live-drills.host.test.ts` (6) — *from the construction runtime there is no route to the holding, and the probe proves it can succeed* | the inside probe cannot start: the same bind |

**105 of 107 files and 772 of 790 tests pass**, including the whole of Block 5's
neighbourhood. The battery goes green when one command is run:
`bash scripts/construction/install-wall.sh` — and it will be run and printed here,
not predicted.

### A sweep the install made necessary, and what it found

The credential this session was given for one command is also the CEO's **live
dashboard password**. Before using it and again after, every place it sits was
measured — the value itself is never written here, and the search was run on a
prefix so the whole word is never spelled again.

**Not in the repository, then or now.** `git grep -l HEAD` finds nothing, and the
four files that held it are all ignored:

```
.env                                       untracked (.gitignore:16)  → symlink to ~/.config/dxb/.env
apps/dashboard/.env.local                  untracked (.gitignore:17)  → symlink to ~/.config/dxb/
.planning/.playwright-mcp/page-…42-443Z.yml  untracked (.gitignore:71)
.planning/.playwright-mcp/page-…59-086Z.yml  untracked (.gitignore:71)
```

**Three places had it that had no business having it, and they are redacted:**

- the session-memory note `design-direction-c-hybrid.md`, which is **loaded into
  every session's context** — it carried the live password *and* the superseded
  `DXB-AltinKule-2026` in plain text;
- the two Playwright page dumps of 2026-07-13, which had captured the login form
  with the password typed into it.

Each now reads *«CEO ŞİFRESİ — .env dosyasında, burada tutulmaz»*. Re-swept after:
the only two hits left on the whole machine's repository tree are `.env` and
`apps/dashboard/.env.local`, which is where it belongs — both are symlinks into
`~/.config/dxb/`, mode **600** inside a **700** directory, and the construction
identity is refused by the operating system:

```
$ sudo -n -u dxbbuild cat /home/dxb/.config/dxb/.env
cat: /home/dxb/.config/dxb/.env: Permission denied
```

**⚠ ONE TRACE LEFT, AND IT IS NOT THE AUTHOR'S TO REMOVE.** `~/.bash_history` line 2
is the password on a line of its own. It was not written by this session — the
commands here are compound lines — and it predates it. **Shell history is his**, and
his standing decision of 2026-08-24 withdrew the history-cleaning order; so it is
reported and left untouched. Removing that one line, or rotating the password, is
his to decide. Git history is a separate, already-recorded item (commit `6c096852`)
and is not reopened here.

### The screen his eye needs for Block 5

`pnpm b36:eye-check` → `http://127.0.0.1:4599/blok5`. It shows no stored result:
it asks both engines while he is looking, and every number on it was measured in
the seconds he was watching. Five panels, in his language:

| # | What it asks, live | What it answered |
|---|---|---|
| 1 | is the residue actually out of the company? | `cost_ledger` 0 (was 1,612) · brown-token 0 (was 1) · the 19 workers' decisions 0 (was 1,143) · the company's own 3,587 decisions still there |
| 2 | is every deleted row still recoverable? | archive 1612/1612 · 1/1 · 1143/1143, **checksums recomputed on the spot** and identical to the manifest · the 2026-08-23 dump present, 23,666,672 bytes |
| 3 | was the boundary he shut left alone? | `hook_violations` 1,963 — the same number measured this morning before the move · `audit_log` 29,641, i.e. 29,637 + 4 · **both books' oldest record still in place** (2026-07-17 id 910 · 2026-07-13 id 4873) · the four added records named |
| 4 | do his own surfaces still stand? | 34/34 views answer · risk register 2 rows, 0 open construction chores · `127.0.0.1:3000` open, `192.168.178.44:3000` shut |
| 5 | does the company move while he watches? | `453b0ef99e03a1f3` → `453b0ef99e03a1f3`, `29641/1963` → `29641/1963` |

**RULE #0 design pass — run three times, and it caught three real defects, not one.**
The page was rendered in a real browser (headless, so his desktop was not
disturbed) and LOOKED AT, at 1600 px and again at 1280 px because a wide baseline
hides truncation:

1. **A detector that would have called a healthy system broken.** Panel 3's first
   version proved the boundary with `max(id) === count(*)`. Measured: `hook_violations`
   holds 1,963 rows between id **910** and **9149** — the ids have gaps from the
   table's own history, so that test fails on a perfectly intact book. It was
   replaced with what can actually be right: the count against the value measured
   on this engine **before** the move, plus the oldest record still being the
   oldest — which is what a trimmed history would move.
2. **Text was cut off** in panels 3 and 4 — his ruling of 2026-08-02 forbids that on
   any surface he reads. The long sentences were sitting in the narrow right-hand
   column. They were moved into full-width rows, and `td.v` gained a wrap so it can
   never clip again.
3. **The first wrap fix split a number in half** — `23.666` / `.672` — because
   `overflow-wrap:anywhere` breaks anywhere. Changed to `break-word`, and the units
   moved into the labels so a figure never has to wrap at all. In the same pass the
   query behind panel 4 stopped cutting the risk titles at 64 characters: it was the
   screen doing the truncating.

**Blast radius, measured rather than assumed.** The wrap rule lives in the STYLE
shared with the two screens he has already ACCEPTED. Block 4's screen was
therefore re-rendered and looked at after the change: five panels, all `pass`,
verdict *"Beş maddenin beşi de gözünüzün önünde doğrulandı."*, no console error,
`document.scrollWidth === window.innerWidth` (no sideways scroll). It also gained
the one thing it was missing — a way forward to `/blok5`.

### The archive was sitting on a rebuildable engine — it is not any more

**The gap, found by asking where the archive actually lives.** `dxb_archive` is a
database on the CONSTRUCTION cluster, and that cluster is the one the project
treats as disposable — its `postgres` database is rebuilt from `db/migrations`
plus generated seed whenever the schema moves. A `supabase db reset` would not
touch a second database in the same cluster, but tearing the stack down or
removing its volume takes every database with it. His order is *"kalıntı taşınır,
silinmez"* — a home that a routine rebuild can erase is not a home.

**Closed the same turn.** The archive was dumped off the cluster, restored into a
throwaway database to prove the dump is real, and the checksums were RECOMPUTED
from the restored copy rather than read back from the manifest:

```
$ docker exec supabase_db_DxB_Build pg_dump -U supabase_admin -d dxb_archive -Fc \
    > ~/backups/dxb/dxb-archive-b36-block5-2026-08-25.dump      (84,442 bytes, mode 600)
$ pg_restore -l …            TABLE DATA public cost_ledger / decision_log / manifest / project_risks
$ … restored into dxb_archive_restore_check
  cost_ledger 1612 · project_risks 1 · decision_log 1143 · manifest 3
  cost_ledger  recomputed from the dump  9328b28e43145bc47cd5fb5e5ad41e7f
  decision_log recomputed from the dump  e1a87e4309fad0abaee9ac09fb77f169
  what the manifest recorded             9328b28e43145bc47cd5fb5e5ad41e7f · e1a87e4309fad0abaee9ac09fb77f169
$ DROP DATABASE dxb_archive_restore_check     → _supabase, dxb_archive, postgres
```

**And off this machine**, by the same route Block 0's dump already uses, then
compared byte for byte:

```
$ scp … dxb-storagebox:dxb-archive-b36-block5-2026-08-25.dump
-rw------- 1 u629578-sub1 1053 84442 Aug 25 09:14 dxb-archive-b36-block5-2026-08-25.dump
local  c0f873654177156da863ff5097ba608bb9f8183466dcc633d69a66aaf4e2a1ea
remote c0f873654177156da863ff5097ba608bb9f8183466dcc633d69a66aaf4e2a1ea   IDENTICAL
```

The file is named so the daily retention sweep (which prunes `dxb-laptop-*.dump`
after 14 days) cannot reach it. **The 2,756 moved rows now exist in four places:**
the archive database, its own dump here, that dump off-site, and the whole-company
dump of 2026-08-23 that predates the move.

**Battery after all of it:** `BATTERY_GREEN` — 107/107 files, 775 passed | 15
skipped, host 3/3 and 16/16.

---

## Block 5 — his auditor, his criterion, and the two things it caught that matter

**HE NAMED WHAT THE AUDIT IS FOR, and it is narrower than the audit that ran.**
*"Denetçi"* is the reviewer he runs himself (Solo 5.6); a subagent the author opens
is a self-check and carries no acceptance weight. His criterion, in his own words:

> *"Kayıt taşıma işini denetleme … 10 tane dosya değil de 5 dosya gitmişse sorun
> değil."* · *"silindi silinmedi kaldı kalmadı vs bunlar da önemli değil."*

Everything about the record move is **outside** the audit — how many rows moved,
whether some stayed, deleted or archived, short or over-reaching. What is audited
is the real separation: **can the construction reach the company's database, write
to it, or get past the protection — and do the company's ordinary operations still
work.** Registered: `b36-acceptance-criterion-and-block5-audit-2026-08-25`.

**HIS AUDITOR'S VERDICT, relayed by him:** an earlier FAIL was **withdrawn** once
the criterion was stated — *"Block 5 passes under the CEO's clarified acceptance
criterion. Do not pursue additional residue records merely for completeness.
Proceed to Block 6."*

**WHAT IS THEREFORE CLOSED AND MAY NOT BE REOPENED.** The author's own internal
check had found that the same July rehearsal stayed behind under other names —
`resident-worker` 46, `ctx-rot-*` 104, `orchestrator:dispatch` 221 rows that name
`orch-ladder-a` by title, `system:exam` 2, `e10t` 1. Under his criterion those are
not defects. Measured, recorded here, and **not pursued.**

### The two findings that fall INSIDE his criterion — both fixed the same turn

**1. The relay I built this morning had widened the holding's read gateway to every
local identity.** The gateway's access control was `/run/user/1000` at mode 0700 —
the author and nobody else. The relay re-published that socket in the bridge, and
the first version put it in a **0755** room with a **0666** socket, while the TCP
room beside it is 0700. Measured on a live run:

```
drwxr-xr-x 2 dxb  dxb       /run/dxb-bridge.kgaElB/gw          ← 0755, anyone may enter
srw-rw-rw- 1 dxb  dxb       …/gw/company-read.sock             ← 0666
drwx------ 2 dxbbuild       /run/dxb-bridge.kgaElB/sock        ← the TCP room, 0700
```

**The fix: the directory is the gate again.** The room is now owned by the
forwarder and carries the CONSTRUCTION's group, at 0750. Re-installed
(`WALL_INSTALLED`, `md5 1c374e22b3b160d6d6075563b8622815` on both the running wall
and the repository's copy), and **proved with an instrument that was shown to work
before it was believed** — the probe speaks to the socket with node's own `net`
module and no repository file, so it measures the socket and not whether the caller
can read the repo:

```
drwxr-x--- 2 dxb dxbbuild  /run/dxb-bridge.ZZT4JH/gw           ← 0750

uid 1000: REACHED -> {"ok":true,"value":"205"}      ← the instrument can succeed
uid  997: REACHED -> {"ok":true,"value":"205"}      ← the door still works
uid 65534 (nobody): REFUSED -> EACCES               ← everyone else is out
```

And from inside the real wall, unchanged: `uid inside : 997` · named question
`205` · `SELECT 1` → *"no such question"*. `company-read-gateway.mjs` carried a
comment saying the directory was the gate and *"nothing on this machine can reach
the path"*; that sentence had become false and is rewritten to say what is now
true, with the defect named in it.

**2. `move-residue.mjs` would have overwritten its own archive, and could have
carried the COMPANY's own records out.** He has since ruled that the company itself
writes to these tables again, so a rule of *"every `source='hook'` row"* is a
loaded gun on a future run. Four refusals added, none of them a warning:

- a **hard date bound** at `2026-08-23`, the day Block 1 killed the writer — the
  newest archived row is `2026-08-22 18:11:51`, so nothing the company writes from
  now on can ever be caught;
- a **shape assertion** on every candidate row, aborting if one differs from what he
  was shown;
- **a count he did not approve stops the run** instead of printing `⚠` and carrying
  on;
- **it refuses to overwrite a non-empty archive.** The first version opened the copy
  with `DROP TABLE IF EXISTS`, so a second run would have destroyed the very rows it
  exists to protect while the manifest went on certifying their checksum.

The guards were validated in BOTH directions before being believed, on the archive
copy so the company was not touched:

```
shape guard on the 1612 archived rows                    → odd_rows 0
the same guard with one condition flipped                → odd_rows 1612   (it can see)
rows dated on or after the day the writer died           → 0   (newest 2026-08-22 18:11:51)
archive already holds cost_ledger 1612 / decision_log 1143 / project_risks 1 / manifest 3
                                                          → a re-run now REFUSES instead of dropping
$ node scripts/b36/move-residue.mjs      → RESIDUE_DRY_RUN  0 rows   (a clean no-op today)
```

### One blemish the internal check reported that is simply wrong

It said the rollback dump described as *"local and off-site"* is off-site only under
a different name. Measured:

```
local  dxb-b36-pre-separation-2026-08-23.dump  062aff3d8ebe4cf64f79df8d6da6bc92
remote dxb-b36-pre-separation-2026-08-23.dump  062aff3d8ebe4cf64f79df8d6da6bc92   ← identical
remote dxb-laptop-2026-08-23.dump              cb7b4a51b07e68315d2c39d0b0940bd5   ← a second file
```

The record was right: that exact file is on the Storage Box and byte-identical.
A second daily backup of the same day exists beside it; both are real.

---

## Block 5 — ACCEPTED, 2026-08-25

**His auditor first, then his own eye — the order he set for Block 4, met again.**
His auditor (Solo 5.6) withdrew an earlier FAIL once he stated the criterion and
ruled *"Block 5 passes … Proceed to Block 6."* He then opened
`http://127.0.0.1:4599/blok5` himself, watched the five panels run, and said:

> *"kabul ediyorum."*

Registered: `scripts/governance/ceo-approvals.json` → `b36-block5-accepted-2026-08-25`.
Every line in these records that said Block 5 was *"BUILT, NOT ACCEPTED"* is spent
and is deleted rather than kept beside the truth (LAW A).

**HIS ORDER GIVEN WITH THE ACCEPTANCE, and it was obeyed:** *"block 6 ya geçme yeni
sessionda devam edecek."* **Nothing of Block 6 was begun.** Row B36 stays open —
five blocks of eight are done; the proof command and the records remain.

**The final state of this session, measured:**

```
$ git log -1 --format='%h %s'          (working tree clean)
$ node scripts/b36/company-state-fingerprint.mjs   STATE_FINGERPRINT 453b0ef99e03a1f3
                                                   audit_log / hook_violations 29641/1963
$ bash scripts/construction/battery.sh   BATTERY_GREEN  107/107 files · 775 passed | 15 skipped
                                                        host 3/3 · 16/16
$ pnpm b36:prove-wall                    WALL_IS_ONE_WAY
$ pnpm verify:ledger                     ledger truth OK · 74 CEO approval claims, each registered
$ pnpm typecheck                         exit 0
$ node scripts/b36/count-company-fallbacks.mjs   EXECUTABLE FALLBACKS: 0
$ gitleaks git --redact -v               no leaks found
   four resident services active · 0 failed units · dashboard 127.0.0.1:3000 200, LAN refused
```

---

## Block 6 — the proof command, 2026-08-25

**BUILT AND GREEN. NOT ACCEPTED — LAW B.** His auditor has not looked, and neither has he.

### What was built

| File | What it is |
|---|---|
| `scripts/governance/company-untouched.mjs` | the drill — `pnpm verify:separation` |
| `tests/b36/separation-gate.test.ts` | 12 cases in the battery that keep its judgements honest |
| `scripts/b36/eye-check.mjs` → `/blok6` | his screen: it runs the command and paints it live |
| `package.json` | `"verify:separation": "node scripts/governance/company-untouched.mjs"` |

### THE RED HALF — the instrument caught itself before the run did

The first execution never reached a verdict. It stopped at step 0:

```
$ node scripts/governance/company-untouched.mjs --no-battery
  RED SEEN the row differ notices one row appearing               _b36_red_proof_444836 null → 1
  BLIND    the write prober sees every shape ACCEPTED where it can be 12/13 accepted on the construction engine
           blind to: truncate  TRUNCATE public.agents… → cannot truncate a table referenced in a foreign key constraint
  RED SEEN the repository sweep convicts a planted fallback       scripts/b36/red-proof-company-fallback.tmp.mjs:3
INSTRUMENTS_NOT_PROVEN — an instrument could not be shown finding what it looks for.
Nothing below would mean anything, so nothing below was run.
SEPARATION_UNPROVEN                                                            (exit 1)
```

`TRUNCATE public.agents` is refused to **every** identity alive, a full superuser included, because a
foreign key references that table — so its refusal on the company would have proved nothing at all.
Measured, then retargeted:

```
$ docker exec -i supabase_db_DxB_Global_OS psql -U supabase_admin -d postgres -qtA -c \
    "SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relkind='r'
        AND NOT EXISTS (SELECT 1 FROM pg_constraint k WHERE k.contype='f' AND k.confrelid=c.oid)"
… audit_log … hook_violations …                                (35 of the 60 have no inbound key)
```

The probe now empties **`public.audit_log`** — the legal record, which nothing references and which a
real superuser really can empty. `tests/b36/separation-gate.test.ts` case (7) holds the lesson so the
target cannot drift back.

### THE FULL DRILL — 2026-08-25 12:13, every step

```
$ pnpm verify:separation
=== 0/5 · THE INSTRUMENTS PROVE THEMSELVES RED — nothing green is printed before this ===
  RED SEEN the row differ notices one row appearing               _b36_red_proof_502496 null → 1
  green    and the table it was proven on is removed again        public._b36_red_proof_502496 dropped
  RED SEEN the write prober sees every shape ACCEPTED where it can be 13/13 accepted on the construction engine
  green    and the account it was proven with is withdrawn again  dxb_b36_redproof_502496 dropped
  RED SEEN the repository sweep convicts a planted fallback       scripts/b36/red-proof-company-fallback.tmp.mjs:3
  green    and the walk really covered this repository            2839 tracked files read
  green    and the working tree is exactly as it was found        no change

=== 1/5 · THE COMPANY, PHOTOGRAPHED ===
  tables in public              : 60
  rows in public                : 43983
  audit_log / hook_violations   : 29641/1963
  STATE_FINGERPRINT             : 453b0ef99e03a1f3
  through the READ GATEWAY      : agents_total=205 library_items_total=412

=== 2/5 · THE WHOLE BATTERY ===
  sandboxed suite : exit 0     host suite : exit 0     BATTERY_GREEN      ran for 95s

=== 3/5 · THE COMPANY, PHOTOGRAPHED AGAIN — and the two subtracted ===
  rows in public                : 43983 → 43983
  audit_log / hook_violations   : 29641/1963 → 29641/1963
  STATE_FINGERPRINT             : 453b0ef99e03a1f3 → 453b0ef99e03a1f3
  green    not one table in the company moved a row               all 60 tables identical
  green    the legal and governance records are untouched         29641/1963
  green    no sequence advanced — nothing even tried to write     8370adaf271d44f3
  green    no large object appeared                               0
  green    and the company's own read path still answers, unchanged agents_total=205 library_items_total=412

=== 4/5 · A WRITE, ATTEMPTED AGAINST THE COMPANY AS dxb_gateway — 13 shapes ===
  green  add a row to the employee registry       → cannot execute INSERT in a read-only transaction
  green  change a row in the employee registry    → cannot execute UPDATE in a read-only transaction
  green  delete a row from the employee registry  → cannot execute DELETE in a read-only transaction
  green  take a write lock on an employee row     → cannot execute SELECT FOR UPDATE in a read-only transaction
  green  create a table of its own in the company → cannot execute CREATE TABLE in a read-only transaction
  green  write into the legal record (audit_log)  → cannot execute INSERT in a read-only transaction
  green  write into the governance record         → cannot execute INSERT in a read-only transaction
  green  empty the legal record (audit_log)       → cannot execute TRUNCATE TABLE in a read-only transaction
  green  ask outright for a read-write transaction→ permission denied for table agents
  green  turn its own read-only setting off       → permission denied for table agents
  green  grant itself the right to write          → cannot execute GRANT in a read-only transaction
  green  mint itself a superuser account          → permission denied to create role
  green  run a program on the engine              → permission denied to COPY to or from an external program
  green    all 13 write attempts were refused

=== 5/5 · THE REPOSITORY, SWEPT ===
  tracked files read            : 2838
  green    no tracked file binds the company's address to DXB_DATABASE_URL   0 executable fallbacks

  instruments proven red     : yes — differ, write prober and repository sweep each convicted first
  battery                    : BATTERY_GREEN
  company tables moved       : 0
  write attempts accepted    : 0 of 13
  executable fallbacks       : 0
  company fingerprint        : 453b0ef99e03a1f3 → 453b0ef99e03a1f3
SEPARATION_HOLDS                                                               (exit 0)
```

### WHAT THE DRILL FOUND OUT ABOUT THE WALL, and it is worth his knowing

Two of the thirteen refusals do **not** say *read-only transaction*. `SET TRANSACTION READ WRITE` and
`SET default_transaction_read_only = off` both **succeeded** — `default_transaction_read_only` is a
setting the account is allowed to change about itself:

```
$ docker exec -i supabase_db_DxB_Global_OS psql -U supabase_admin -d postgres -qtA -c \
    "SELECT rolname, rolconfig, rolsuper, rolcreaterole FROM pg_roles WHERE rolname='dxb_gateway'"
dxb_gateway|{default_transaction_read_only=on,statement_timeout=120s,idle_in_transaction_session_timeout=60s}|f|f
```

Both attempts were then stopped one layer down, by the privilege matrix: `permission denied for table
agents`. **The read-only setting is a convenience, not the wall.** The wall is the seal installed by
`scripts/b36/company-one-way-window.sql` (13 classes, 0 leaking). The drill proves that layer every
run, and `separation-gate.test.ts` case (6) fails the battery if either escape is ever dropped.

### The blast radius, re-measured after the change

| What stands on it | Re-measured | Result |
|---|---|---|
| the whole battery | `bash scripts/construction/battery.sh` | `BATTERY_GREEN` · sandboxed exit 0 · host exit 0 |
| `pnpm typecheck` | `tsc --build` | exit 0 |
| the governance gate | `pnpm verify:ledger` | OK · 74 approval claims, each registered |
| the fallback counter (imported, not modified) | `node scripts/b36/count-company-fallbacks.mjs` | 0 executable |
| the two engines' schemas | `pnpm verify:schema-parity` | `SCHEMA_PARITY` · 30/30 triggers, 13/13 sequences |
| the wall | `pnpm b36:prove-wall` | `WALL_IS_ONE_WAY` · fingerprint unchanged across the drill |
| secrets | `gitleaks git --redact -v` | 762 commits scanned, no leaks found |
| the resident services | `systemctl --user` | 4 active, 0 failed |
| the CEO's panel | `curl -L 127.0.0.1:3000` / LAN | 200 at `/login` · LAN 192.168.178.44:3000 refused (curl 7) |
| the company itself | `company-state-fingerprint.mjs` | `453b0ef99e03a1f3`, before and after everything |

**Residue swept, both engines and the tree:**

```
$ git status --porcelain                     M package.json · ?? the two new files. Nothing else.
$ ls scripts/b36/red-proof-company-fallback.tmp.mjs        No such file or directory
$ … pg_class  WHERE relname LIKE '\_b36\_%'  (construction)   <none>
$ … pg_roles  WHERE rolname LIKE 'dxb\_b36\_%' (construction)  <none>
$ … pg_roles / pg_class  LIKE 'dxb\_b36\_%' / '\_b36\_%' (company)  <none>  <none>
```

### ⚠ What a terminal cannot observe — confirmed by eye, screenshots kept

`http://127.0.0.1:4599/blok6`, opened in Chrome on this machine and looked at twice
(`operator shot`): six cards, all green, no truncation and no clipped text at a windowed width of
~1490 px on a 3440-px screen. Card 0 shows the three RED SEEN lines before any green appears — he
watches the gate convict before he watches it pass. The final bar reads **AYRIM SAĞLAM**.

---

## Block 6 — ACCEPTED, 2026-08-25

His auditor first, then his own eye — the order he set for Block 4, met for the third time.
His auditor (Solo 5.6) read commit `edad066d` and passed it; he then said:

> *"tmm denetçi okledi. pass. ben de göz kabulu verdim. şimdi block 7 ye geçebilirsin."*

Registered: `scripts/governance/ceo-approvals.json` → `b36-block6-accepted-2026-08-25`.
Every line in these records that said Block 6 was *"BUILT, NOT ACCEPTED"* is spent and is deleted
rather than kept beside the truth (LAW A). The same sentence authorised Block 7 to begin.

---

## Block 7 — the records, 2026-08-25

**Six items. Every one measured BEFORE it was written.**

### 1 · Row B36 is closed on evidence, with no leg left

The plan's §6 says the row does not delete `dxb_test` before the new stack is green. Measured before
the row was closed:

```
$ docker exec -i supabase_db_DxB_Global_OS psql -U supabase_admin -d postgres -qtA \
    -c "SELECT datname FROM pg_database ORDER BY 1"
_supabase
postgres
template0
template1                                   ← dxb_test is gone; the company carries no test database
```

All eight blocks of the approved plan are built (`PLAN.md` §4: 0 · 1 · 2 · 3+3-bis · 4 · 5 · 6 · 7),
and the four that needed his word have it, each registered with his own sentence:
`b36-block3-bis-accepted-2026-08-24` · `b36-block4-accepted-2026-08-24` ·
`b36-block5-accepted-2026-08-25` · `b36-block6-accepted-2026-08-25` (ten B36 entries in all,
measured `python3 -c "json.load(open('scripts/governance/ceo-approvals.json'))"`). The row's title — *"THE CONSTRUCTION SITE IS STILL INSIDE THE
COMPANY"* — was true the day it was opened and is false today; deleted, not annotated (LAW A).

### 2 · C36 needed no work — Block 5 had already closed it

Board line 167: `✓ CLOSED 2026-08-25 ON MEASUREMENT — the chore left his risk register, moved and not
deleted.` Re-measured, not re-closed.

### 3 · C20 · C21 · C22 · C23 · C24/C25 — annotated, not reopened

**Nothing is withdrawn.** The purges of 2026-07-19 really happened. What was wrong was the claim
about the PRESENT each close carried by implication — that the problem could not come back. It
could, and it did:

```
cost_ledger, company engine, 2026-08-23   1,612 construction rows
                                          — five weeks AFTER C24 closed as "construction separated"
                                          — separated in a VIEW, not in the engine
```

Measured today, in the company's own engine, with SELECT only:

```
$ docker exec -i supabase_db_DxB_Global_OS psql -U supabase_admin -d postgres -qtA -c "…"
cost_ledger=0            (was 1,612)
workflows like 'r23t%'=0
project_risks status open=0
intents=57               (the company's own; the 7 garbled ones went in July)
```

Each of the five rows now carries `✓ CLOSED · **+ WALLED 2026-08-25**` and the sentence *"The close
SWEPT; it did not WALL"*, with one note under the table explaining the difference in his language
and naming the blocks that built the wall.

### 4 · The registered adaptation is in the two specs that own it

Measured before writing — both still drew a one-database world:

```
$ grep -c "B36" HOLDING-OS-MASTER-PLAN/SYSTEM_ARCHITECTURE.md   0
$ grep -c "B36" HOLDING-OS-MASTER-PLAN/TEST_STRATEGY.md         1
```

After: **3 and 3.** `SYSTEM_ARCHITECTURE.md` §3's data layer drew ONE engine; it now draws two with
the wall between them (company `supabase_db_DxB_Global_OS` PG17, 60 tables · the wall: a networkless
sandbox, no Docker socket, no credential, one unix socket to a named-question gateway · construction
`DxB_Build` port 54422, same migrations, data generated from this repository, zero rows of the
holding's), followed by the adaptation itself and the measured fact that
`SET default_transaction_read_only = off` succeeds — so the seal, not the setting, is the wall.
`TEST_STRATEGY.md` §4 carries the sandbox, the two battery halves, the fallback ban, the proof
command, and the rule those two false zeroes bought: **a gate that has never been shown finding
something has not been tested.**

### 5 · `.planning/STATE.md`

Block 6's acceptance registered, Block 7 recorded, the row's closure written, and the six
`<!-- OPEN: B36 -->` markers converted to `<!-- HISTORY -->` because the work they pointed at is
finished.

### 6 · The board's own line 12 said the database was off

```
BEFORE  1. **THE DATABASE IS OFF, AND THAT IS DELIBERATE.** … a session can measure the code
           and not the company; say so rather than guessing.
MEASURED 2026-08-25 12:30
$ docker ps --format '{{.Names}}\t{{.Status}}' | grep supabase_db_
supabase_db_DxB_Build       Up 3 hours (healthy)
supabase_db_DxB_Global_OS   Up 3 hours (healthy)
$ systemctl --user list-units 'dxb-*' --state=failed   → 0
$ systemctl --user is-active dxb-scheduler dxb-jarvis dxb-company-read dxb-freeze-guard
active active active active
```

It was true on 2026-08-17 and is false today. Deleted and replaced (LAW A) with what a session may
now actually do: **read the company with SELECT through the gateway; write everything else to the
construction engine.**

### The gates, after every record was written

```
$ pnpm verify:ledger    ledger truth OK — 8 state claims re-measured, 93 open markers resolved
                        against 68 board rows, 98 trigger lines, 17 rules each in exactly one
                        owner, 75 CEO approval claims each backed by a registered approval
```

---

## After Block 7 — the company is emptied of the construction, 2026-08-25

**He reopened the row minutes after it closed, and he was right to.** Asked whether he
would still see construction junk in the corners of his rooms, the honest answer was
**yes — on the Decisions page.** Two orders followed, both registered:
`b36-no-construction-fragments-visible-2026-08-25` and
`b36-erase-construction-from-the-company-2026-08-25`. The second one **deletes the
boundary he had set earlier the same day** (LAW A): `audit_log` and `hook_violations`
are no longer exempt where their rows are about the construction.

### The measurement that made the cut, before a single row moved

```
$ … "SELECT created_at::date, count(*) FROM public.decision_log GROUP BY 1"
2026-07-13 = 6 · 07-24 = 99 · 07-25 = 431 · 07-26 = 2927 · 07-27 = 120 · 07-28 = 4
                                     ↑ 82% of the whole book, in ONE day
$ … "SELECT count(*) FROM public.tasks WHERE created_at::date='2026-07-18'"        202
$ … "SELECT count(*) FROM public.decision_log WHERE created_at::date='2026-07-18'"   0
```

The company's real hiring wave produced **zero** decisions. What the rows actually said:

```
orchestrator:dispatch | task_plan | dispatched 1 task(s): [0] ctx-rot-managed-63622a82:
                                    run the 50-step synthetic long-task …
orchestrator:dispatch | task_plan | dispatched 1 task(s): [0] orch-ladder-a: produce a
                                    two-sentence summary of the DXB escalation ladder design
orchestrator:dispatch | task_plan | dispatched 1 task(s): [0] orch-test-e2e: write a haiku
                                    about the DXB task queue and store it as text
```

The orchestrator rehearsing on synthetic work — **his own definition of what belongs to the
construction:** *"Holdingin içinde yapılan geliştirme çalıştımı veya çalışıyor mu diye test
edilmesi de dahil."*

### FOUR TIMES THE DETECTOR WAS WRONG, AND EACH TIME IT WAS CAUGHT BEFORE A DELETION

1. **`resident-worker` is the COMPANY's own worker**, not a drill name —
   `packages/orchestrator/src/worker-loop.ts:26  export const RESIDENT_WORKER_ID = "resident-worker"`.
   It claimed **214 of the company's 217 tasks** and wrote **1,122 of its task events**. A previous
   session had put it on the residue list. Its work **stays in the company**.
2. **The purge REFUSED to run** rather than delete the separation's own records:
   ```
   REFUSED: he approved 29 rows for audit_log and the company now holds 32 that match.
   Nothing is moved. Re-measure, put the new number in front of him …
   ```
   The three extra rows were the `residue.moved_out` records the same run had just written —
   they name the archive they wrote to, so an honest sweep convicts them. They are the company's
   own proof of what left, and they are now excluded by name.
3. **`engineering-worker` convicted an employee's own probation brief** — *"5 priorities listed,
   scoped to engineering-worker execution discipline"* — and **`e10t` convicted the CEO's own purge
   decision** (*"e10t test-employee fixture escalation — rejected for purge (C20)"*). Both came off
   the text-marker list and are caught as ACTORS instead. **The CEO's own acts are never residue.**
4. **`max(uuid)` does not exist in PostgreSQL.** The mover's high-water mark died on a uuid-keyed
   table after an earlier group had already moved. Fixed at source, not worked around.

### What left — 27,799 rows, every one in `dxb_archive` on the CONSTRUCTION engine

```
$ docker exec -i supabase_db_DxB_Build psql -U supabase_admin -d dxb_archive -qtA \
    -c "SELECT source_table, rows_moved, ceo_approval FROM public.manifest ORDER BY id"
cost_ledger                      1612   b36-block5-residue-and-two-databases-2026-08-25
project_risks                       1   b36-block5-residue-and-two-databases-2026-08-25
decision_log                     1143   b36-block5-residue-and-two-databases-2026-08-25
decision_log_drill_week          3576   b36-no-construction-fragments-visible-2026-08-25
audit_log_tool_pin_noise        18051   b36-erase-construction-from-the-company-2026-08-25
audit_log_author_diary           1789   b36-erase-construction-from-the-company-2026-08-25
audit_log_construction_identity   322   b36-erase-construction-from-the-company-2026-08-25
audit_log_construction_marker      25   b36-erase-construction-from-the-company-2026-08-25
hook_violations_drill_week        271   b36-erase-construction-from-the-company-2026-08-25
control_idempotency_drill_keys    975   b36-erase-construction-from-the-company-2026-08-25
tool_calls_drill                    7   b36-erase-construction-from-the-company-2026-08-25
audit_log_drill_rounds             26   b36-erase-construction-from-the-company-2026-08-25
alerts_drill                        1   b36-erase-construction-from-the-company-2026-08-25
ARŞİVDEKİ TOPLAM = 27799
```

Every group: **copy → verify (row count AND identical checksum on BOTH engines) → delete → one
`audit_log` record.** Not one checksum differed.

### The company, before and after

```
$ node scripts/b36/company-state-fingerprint.mjs company
  tables in public           60      (unchanged)
  rows in public             18936   (was 43,983)
  audit_log / hook_violations 9438/1692   (was 29,641/1,963)
  STATE_FINGERPRINT  d8beba3f99484a23    (was 453b0ef99e03a1f3)
```

**What stayed, and it is the point:** his own **11 decisions** in the decision book · the company's
**199 employee records** and **197 `employee.evaluated`** audit rows · its **217 tasks** and **1,122
task events** · its **1,692 hook violations** from its own HR wave · its library, settings, approvals
and money records · and the **8 `residue.moved_out` records** that prove what left.

### The runtime side of the same order

*"tüm çalışanlar ve üst düzey yetkililerin hepsinin bağı tamamen inşaat veritabanından kopmalı."*

```
Hamza  (jarvis-daemon pid 3218)  DXB_DATABASE_URL → 127.0.0.1:54322   the COMPANY
                                 the construction address: ABSENT
scheduler (outbox-executor)      DXB_DATABASE_URL → 127.0.0.1:54322   the COMPANY
apps/ and packages/ reading DXB_CONSTRUCTION_DATABASE_URL or 54422 :  0 files
```

**But the CEO's own panel was carrying `DXB_CONSTRUCTION_DATABASE_URL`** — from no file at all,
inherited from the shell that launched it after a session exported it for `verify:schema-parity`.
Nothing read it; a door nobody uses is still a door. `scripts/dashboard.sh` now unsets it before
starting the panel, and the panel was restarted through its own launcher:

```
$ curl -sL -o /dev/null -w '%{http_code} %{url_effective}' http://127.0.0.1:3000/
200 http://127.0.0.1:3000/login
$ pnpm verify:separation  (step 6)
  green  no live company process carries a path to the construction engine
         panel, Hamza and the scheduler carry the company only
```

### Made permanent — so he never has to ask again

`pnpm verify:separation` gained **step 6**: it sweeps **every table in the company** for the
construction's own names and fails on any hit, and it fails if a live company process carries a path
to the construction engine. Its instrument proves itself first, like the other four:

```
=== 0/6 · THE INSTRUMENTS PROVE THEMSELVES RED ===
  RED SEEN the row differ notices one row appearing               _b36_red_proof_692316 null → 1
  RED SEEN the write prober sees every shape ACCEPTED where it can be 13/13 on the construction engine
  RED SEEN the repository sweep convicts a planted fallback       scripts/b36/red-proof-…tmp.mjs:3
  RED SEEN the construction-trace sweep convicts a planted trace  audit_log = 59 (planted row seen)
=== 6/6 · THE COMPANY'S OWN ROOMS, SWEPT FOR A CONSTRUCTION TRACE ===
  names looked for              : 22
  green  no live company process carries a path to the construction engine
  green  not one company table still names the construction     0 traces in 60 tables
SEPARATION_HOLDS                                                              (exit 0)
```

The 22 names live **once**, in `scripts/b36/construction-marks.mjs`, shared with the purge so the
gate and the purge can never disagree. `tests/b36/separation-gate.test.ts` (14 cases) fails the
battery if `resident-worker`, `engineering-worker`, `e10t`, `smoke-e7`, `fable-5` or the bare word
`test` is ever put back on that list.

### Gates, after everything

```
$ pnpm verify:separation   SEPARATION_HOLDS · BATTERY_GREEN (sandboxed exit 0, host exit 0)
                           0 of 60 tables moved · 0 of 13 writes accepted · 0 fallbacks
                           0 construction traces · fingerprint d8beba3f99484a23 unchanged
$ pnpm typecheck           exit 0
$ pnpm verify:ledger       OK · 75 approval claims, each registered
$ npx vitest run tests/b36/separation-gate.test.ts    14 passed
```

### ⚠ ONE THING LEFT ALONE, DELIBERATELY, AND IT IS OUTSIDE HIS ORDER

The project on his screen named **"HR Sandbox" / "İK Kum Havuzu"** is **not** construction: its 201
tasks are the company's own hiring round (*"HR probation: first work sample"*, 18 July), and they are
what produced the 199 employee records. Only its NAME reads like a test area. Its slug `hr-sandbox`
is compiled into five places in the HR factory's own database functions
(`db/migrations/20260712008000_hr_factory_fns_e54b.sql`), so renaming it is a change with a real
blast radius and it is not what he ordered. Reported to him in one line instead.
