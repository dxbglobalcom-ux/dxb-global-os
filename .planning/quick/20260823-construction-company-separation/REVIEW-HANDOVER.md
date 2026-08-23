# REVIEW HANDOVER — session of 2026-08-23, board row B36

**For an independent auditor (Codex Solo 5.6), commissioned by the CEO.**
Author under review: Opus 5, this session. Repository: `/home/dxb/DxB Global OS`, branch `master`,
base commit `3ab2976a`. **Nothing is committed** — the whole change set is in the working tree.

Your job is to refute, not to agree. Every claim below names the command that produced it. Re-run
them. Where a claim cannot be re-run from a terminal it is marked ⚠ and listed apart.

---

## 0. What the CEO ordered, in sequence

| # | His words | What it demanded |
|---|---|---|
| 1 | *"üçünü de onaylıyorum, tahtaya satırı aç ve planı yaz"* | Register his approval, open a board row, write the plan to a file |
| 2 | *"tersini de onaylıyorum, blok 0 ile başla"* | Approve the architectural reversal, execute Block 0 |
| 3 | *"şu suçlu dediğin şey nedir? onu düzelttin mi? ayrıca şu 5 hatayı da düzelt. sonra başla"* | Fix the writer first, then the five gate failures, then Block 0 |

The subject of the row: **construction data has been reaching the company's own database and the
CEO's own screens.** Registered ten times as complaints C10, C5+, C6, C20, C21, C22, C23, C24, C36,
C47; seven of those were marked ✓ CLOSED.

---

## 1. The change set — 12 modified, 2 new paths

```
$ git status --porcelain
 M .planning/research/INTEGRATION-TRACKER.md
 M .planning/research/LITERATURE.md
 M .planning/research/rival-intel/00-LEDGER.md
 M .planning/research/rival-intel/35-dbsm7rmbszo.md
 M .planning/research/rival-intel/38-da4deqvlocg.md
 M HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md
 M scripts/governance/ceo-approvals.json
 M tests/b21/agent-context.test.ts
 M tests/c9/work-generation.test.ts
 M tests/e10/hook.test.ts
 M tests/ops/freeze-guard.test.ts
 M tools/hooks/src/tag-subscription-call.ts
?? .planning/quick/20260823-construction-company-separation/
?? tests/b36/

$ git diff --stat
 12 files changed, 113 insertions(+), 37 deletions(-)
```

New files: `tests/b36/hook-never-writes-company.test.ts` (139 lines) ·
`.planning/quick/20260823-construction-company-separation/{PLAN.md 288, EVIDENCE.md 246}` · this file.

**No production source file was changed except one hook** (`tools/hooks/src/tag-subscription-call.ts`).
No migration was written. No database row was inserted, updated or deleted by this session outside
its own test fixture. Verify that claim in §7.

---

## 2. Claim A — the writer that put construction cost into the company's ledger is dead

### The defect, as it stood at `3ab2976a`

```
$ git show 3ab2976a:tools/hooks/src/tag-subscription-call.ts | sed -n '66p'
  process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
$ grep -n "tag-subscription" .claude/settings.json
39:            "command": "node \"$CLAUDE_PROJECT_DIR/tools/hooks/dist/tag-subscription-call.js\""
```

That address is the **company** database. The hook runs on `SessionEnd`, sums the session's tokens
from the transcript and inserts them into `cost_ledger` with `department='engineering'`,
`mode='subscription'`, `task_id=null`.

**Evidence it was live, not historical:**

```
$ docker exec supabase_db_DxB_Global_OS psql -U postgres -d postgres -Atc \
  "select created_at::date, model, count(*) from cost_ledger
   where created_at > now() - interval '10 days' group by 1,2 order by 1 desc;"
2026-08-22|<synthetic>|1
2026-08-21|claude-opus-5|2
2026-08-20|<synthetic>|1
2026-08-20|claude-opus-5|3
2026-08-19|claude-opus-5|5
2026-08-17|claude-opus-5|8
2026-08-13|claude-opus-5|1
```

### The fix

`tools/hooks/src/tag-subscription-call.ts` — the fallback is deleted. The hook resolves
`DXB_CONSTRUCTION_DATABASE_URL`, returns without writing when it is unset, and refuses when it equals
`DXB_DATABASE_URL`.

### Red → green, same test, on the COMPILED artefact

`tests/b36/hook-never-writes-company.test.ts` spawns `tools/hooks/dist/tag-subscription-call.js`
with controlled env and stdin — the file Claude Code actually runs.

```
against the pre-fix dist:   Test Files 1 failed (1) · Tests 4 failed (4)
after `pnpm typecheck`:     Test Files 1 passed (1) · Tests 4 passed (4)
```

### What to attack here

1. **Is the fail-closed branch reachable in production?** The hook now returns early whenever
   `DXB_CONSTRUCTION_DATABASE_URL` is unset — which is TODAY ALWAYS, because the construction stack
   does not exist until Block 2. Confirm that this is intended (it is: the CEO's decision is that a
   construction cost never touches the holding) and that no other caller depended on the hook writing.
2. **Does the guard compare the right things?** It compares two environment strings. Two different
   strings can still name the same database (`localhost` vs `127.0.0.1`, a trailing `?sslmode=`).
   That is a real limitation of this fix and is NOT claimed to be closed — the plan's Block 4 puts
   the strong version (a privilege-level wall, `dxb_reader` with SELECT only) in place. Judge whether
   the interim guard is honestly scoped or oversold.
3. **Test case 4** asserts no company URL is *assigned* in source or build, by filtering out comment
   lines. Try to defeat that filter.
4. Does the suite leave residue? It deletes `model='b36t-model'` in `afterAll`. Verify:
   `select count(*) from dxb_test.cost_ledger where model='b36t-model'` → expected 0.

---

## 3. Claim B — the five governance-gate failures were pre-existing, and are closed on merit

**Proof they were not caused by this session** (this is the part most worth re-running):

```
$ git worktree add --detach /tmp/head-check HEAD
$ cd /tmp/head-check && node scripts/governance/ledger-truth.mjs
… the identical 5 failures …
5 failure(s). The corpus and the system disagree.
```

Each line was then judged individually rather than silenced:

| File:line | The sentence | Marker | Reasoning to attack |
|---|---|---|---|
| `.planning/research/INTEGRATION-TRACKER.md:37` | *"The six that remain wait on a CREDENTIAL"* | `<!-- OPEN: B30 -->` | The row's own text already names B30. Verify B30 is open, not closed |
| `.planning/research/LITERATURE.md:46` | *"kalan 6'sı yalnız kimlik bilgisi bekliyor"* | `<!-- OPEN: B30 -->` | Same work in Turkish. Is B30 really its owner, or is this B22's? |
| `.planning/research/rival-intel/00-LEDGER.md:49` | *"What is left of stage 1 is the synthesis … and it waits on him"* | `<!-- OPEN: B22 -->` | Verify B22's text covers the synthesis |
| `.planning/research/rival-intel/35-dbsm7rmbszo.md:292` | a measured gap in our product | `<!-- OPEN: B22 -->` | Precedent: `01-lukebuildsai-jarvis.md:172` and `04-thealinalab.md:203` mark gap tables the same way. Is the precedent right? |
| `.planning/research/rival-intel/38-da4deqvlocg.md:76` | a frame transcription of a rival's landing page at 00:15 | `<!-- HISTORY -->` | **The one to attack hardest.** The claim is that `FUTURE_WORK[0]` matched the phrase *"the next frames … two five-star rows"* — a false positive. If it is actually a promise, this marker hides open work, which is the exact failure the gate exists to prevent |

```
$ pnpm verify:ledger
ledger truth OK: 8 state claims re-measured, 93 open markers resolved against 66 board rows,
96 trigger lines all accounted for, 17 rules each in exactly one owner,
70 CEO approval claims each backed by a registered approval
```

---

## 4. Claim C — Block 0, the safety net, is real and proven by restore

```
$ bash scripts/backup/laptop-pg-dump.sh
BACKUP_OK 2026-08-23 23666672 bytes
OFFSITE_OK 2026-08-23

$ docker exec supabase_db_DxB_Global_OS pg_dump -U postgres -d postgres -Fc \
    > ~/backups/dxb/dxb-b36-pre-separation-2026-08-23.dump
B36_DUMP_OK 23666672 bytes   (sha256 cf87ca2ddaa81958b6f49e98…)
$ ssh dxb-storagebox "ls -l dxb-b36-pre-separation-2026-08-23.dump"
-rw------- 1 u629578-sub1 1053 23666672 Aug 23 09:18 …
```

Proven by restoring, not by size: a scratch database was created, the dump restored into it, and a
row-count fingerprint over **every public base table** compared against live.

```
RESTORE_DIFF = 0   ·   tablo sayısı: 60
```

Two restore errors were ignored — both `permission denied for table secrets` (`vault.secrets`).
Measured rather than waved away: **0 rows live, 0 rows restored**. Recorded as a boundary: if the
vault is ever used, this backup path will not carry it.

### What to attack here

1. The fingerprint counts **base tables only** (`table_type='BASE TABLE'`). Views, sequences, functions,
   RLS policies and grants are **not** compared. Is a row-count fingerprint sufficient to call a dump
   proven? Argue the opposite.
2. The scratch database lived **in the same Postgres instance** as the company, not on a separate
   host. That proves the dump's integrity, not the recovery path's independence. The plan says
   "throwaway container"; this session used a throwaway database. Judge whether the write-up is
   honest about the difference (`EVIDENCE.md` §Block 0).
3. `scripts/backup/laptop-pg-dump.sh` prunes `dxb-laptop-*.dump` after 14 days. The B36 dump was
   deliberately named outside that glob. Confirm it cannot be pruned.

---

## 5. Claim D — four test defects found on the way, fixed at source, none of them this session's

The battery had been reported green at 710/0 the previous night. This session ran `tsc --build`,
which rebuilt packages, and three failures surfaced.

| # | File | Root cause claimed | How to refute |
|---|---|---|---|
| 1 | `tests/b21/agent-context.test.ts` | The case compared `slice(0, -1)`, assuming the approval-gate line was last. `de149a53` (2026-08-21 01:11) appended `noRefusalLaw()` after it (`packages/voice/src/prompt-core.ts:159-168`). The battery stayed green because `packages/voice/dist` predated that source change | Check `git log -1 -- packages/voice/src/prompt-core.ts`. Then decide: should the **test** have been changed, or should the **source** keep the lane-dependent line last? The author chose the test, arguing the contract is "the lanes differ in the gate line and nothing else" — identity, not index. Argue the source side |
| 2 | `tests/c9/work-generation.test.ts` | `order by created_at` over rows written in ONE transaction — all share `now()`, so the tie broke arbitrarily. Now joins `generated_work` and orders by `step_index` | Verify `generated_work.step_index` is written for every generated task (`db/migrations/20260726014500_w25_step_titles.sql:188-191`). If any path inserts a task without a `generated_work` row, the new `join` **drops** it and the `length toBe(2)` assertion would hide a real defect. **This is the strongest attack available in this handover — check it.** |
| 3 | `tests/ops/freeze-guard.test.ts` | The resident `dxb-freeze-guard.service` (`FREEZE_GUARD_INTERVAL=10`, real kills) matches the decoy's own pattern (`scripts/ops/freeze-guard.sh:157`) and reaped it before the case's dry pass could see it | The fix retries the fixture up to 5 times and clears the log first. Argue that a retry loop hides a real defect rather than isolating a test; propose the better fix (e.g. stopping the resident for the case, or a pattern the resident does not match — and say why that would or would not still test the contract) |

---

## 6. Claim E — the fourth defect: root-caused, reproduced on demand, fixed

An earlier version of this handover said this failure was "not root-caused" and proposed leaving it
to its own row. **The CEO refused that in one line** — *"o 5 test'in 1 hata ise neden hatalı testi yok
saymayı teklif ediyorsun?"* — and he was right. That paragraph is deleted, not footnoted. What
follows replaces it.

**The mechanism.** `fn_hook_set_policy` is idempotent BY KEY: given a key it has already recorded it
returns the stored response and **does not apply the change**
(`db/migrations/20260714030000_e10_hook_engine.sql:231-236`, `RETURN v_prev.response`). The suite
calls it with the constant key `e10t-invalid-rule` and cleared its keys **only in `afterAll`**. A run
that never reached `afterAll` left the key behind; the next run got `ok:true` from a replay while the
broken rule was never written, so the gate correctly answered `PASS` and the case failed for a reason
unrelated to the code under test.

It matches the session's own timeline: a battery loop was killed by a two-minute limit (`exit 143`)
mid-run, and the very next full run is the one that failed.

**Reproduced on demand:**

```
insert into control_idempotency(key,request_digest,response)
  values ('e10t-invalid-rule','fake','{"ok":true}');
npx vitest run tests/e10/hook.test.ts   →  Tests  1 failed | 34 passed (35)
```

**Fix:** the suite clears its own keys in `beforeAll` as well. Same residue, after the fix:
`Tests 35 passed (35)`.

**Nine sibling suites touch `control_idempotency`; none was fixed blindly.** Five build keys per run
(`${M}-${randomUUID()}`, or a freshly inserted row's id). The three with constant keys were each
tested by inserting their residue and running them — `e9/library` 13/13, `e9/project-command` 17/17,
`r42/knowledge-shelf` 6/6 — all survive it, so **none of them was touched**. `e10` was the only suite
exposed, because it is the only one that asserts the door's EFFECT rather than its `ok` flag.

### The battery now

| Run | Condition | Result |
|---|---|---|
| 1 | **poisoning residue deliberately present** | `Test Files 96 passed (96)` · `Tests 714 passed \| 15 skipped (729)` |
| 2 | clean | 96 files · 714 passed |
| 3 | clean | 96 files · 714 passed |

```
$ pnpm typecheck      → tsc --build, exit 0
$ pnpm verify:ledger  → ledger truth OK
```

### What to attack here

1. **Is `beforeAll` the right place, or is the door's contract itself wrong?** Argue that a control
   door which returns `ok:true` for a key it has seen — while the caller believes the change was
   applied — is a production hazard, not merely a test-hygiene problem. If a real caller retries with
   a reused key after a crash, it gets a success it did not earn. The author fixed the test, not the
   door. Judge that choice.
2. **Are the five "per-run key" suites really safe?** The author read their key construction rather
   than testing all of them. Re-derive it.
3. **Three green runs is a sample of three.** Say whether that is enough to call an intermittent
   defect closed, given the poisoned run is one of the three.

---

## 7. Claim F — the company's database was not written by any of this

Taken before the work and again after every block:

```
$ psql -d postgres -Atc "select 'cost_ledger='||count(*) from cost_ledger
   union all select 'tasks='||count(*) from tasks
   union all select 'agents='||count(*) from agents
   union all select 'audit_log='||count(*) from audit_log;"
cost_ledger=1612
tasks=217
agents=205
audit_log=29636
```

1612 is exactly the sum of the model groups measured at the start of the session
(950 `<synthetic>` + 282 + 122 + 113 + 109 + 36).

**What to attack:** this is four tables, not sixty. A complete proof would fingerprint all 60 base
tables before and after, which is precisely what the plan's Block 6 (`pnpm verify:separation`) is
for and what this session did NOT build. Judge whether §7's claim is scoped honestly or reads wider
than its evidence.

---

## 8. Records written

| Record | What it now says |
|---|---|
| `scripts/governance/ceo-approvals.json` | New entry `construction-company-db-separation-2026-08-23` with his verbatim words, the three decisions, and the condition that he approved the direction and not the build |
| `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` | New row **B36**, dated **2026-07-19** (the date the complaint family opened, not the date the row was created — check whether that is defensible under board law 4), carrying the ten complaint numbers, the live measurements, his three decisions with a `CEO-OK` marker, and the legs closed today |
| `PLAN.md` | The two required sentences, the measured starting state, the root cause, the architecture with the reversal, eight execution blocks, the blast-radius table, the boundaries and the risks |
| `EVIDENCE.md` | Every command run today and the output it printed |

---

## 9. ⚠ Not machine-checkable — for the record

- No CEO-visible surface changed in this session, so no design pass was owed. The first visible
  change is Block 5, when the coffee-token row leaves his risk register.
- The `.env` file could not be read (blocked by `permissions.deny` in `.claude/settings.json:27-31`).
  Which URL the dashboard resolves at runtime was therefore read from `scripts/systemd/install.sh:17`
  and `db/README.md:22`, both of which name `postgres`. If the auditor can read `.env`, confirm or
  refute that.

---

## 10. The specific verdicts requested

1. Is the hook fix complete **at its source**, or does a construction write path to the company
   database still exist that this session missed? (94 files carry the same fallback shape —
   `grep -rl "54322/postgres" --include=*.ts --include=*.mjs --include=*.js` — and the plan defers
   them to Block 4. Is deferring them defensible, or should they have gone today?)
2. Did any of the three test fixes change what a test PROVES, rather than how it measures it?
3. Is the Block 0 evidence sufficient to call a safety net proven?
4. Is anything in `EVIDENCE.md` or the board row stated more strongly than its evidence supports?
5. Is the B36 row honest about what remains open?
