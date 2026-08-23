# Quick ticket 20260823-construction-company-separation — board row B36

**Trigger:** CEO order, 2026-08-23 — *"üçünü de onaylıyorum, tahtaya satırı aç ve planı yaz"*, then,
after reading this plan the same day, *"tersini de onaylıyorum, blok 0 ile başla"* — the plan AND the
architectural reversal in §3 are both approved, and Blocks 0 and 1 are built on that word.
Approval registered: `scripts/governance/ceo-approvals.json` →
`construction-company-db-separation-2026-08-23`. Board row: **B36**.

**Spec pointers (the contract lives THERE, not here):** [[DATA_MODEL]] (the company's tables),
[[SYSTEM_ARCHITECTURE]] (where the engine runs), [[TEST_STRATEGY]] §isolation,
[[00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19]] C20/C21/C22/C23/C24, board C36, board history C47.
Every deviation this plan introduces is written back into the spec that owns it as a registered
adaptation — no new spec is opened.

---

## The two sentences (board law 7, CEO-accepted 2026-08-20)

**1 — What will be on the CEO's screen when this row closes.**

> His pages show only the company's own work. While the construction runs — tests, batteries,
> whole night shifts — not one line of his changes.

*(TR, for his eye: Şirket sayfalarında yalnız şirketin kendi işi görünür. İnşaat çalışırken —
testler, bataryalar, bütün gece vardiyaları — onun bir tek satırı bile değişmez.)*

**2 — The single command that proves it.**

```
pnpm verify:separation
```

It photographs every row count in the company database, runs the entire battery, photographs them
again, and prints the difference. It also tries to write to the company as the construction user
and requires that write to be **refused**. Any non-zero difference, or any successful write, is red.

---

## 1. The measured starting state — 2026-08-23, this session, this machine

| # | Measurement | Command |
|---|---|---|
| M1 | One Postgres engine on this machine: `supabase_db_DxB_Global_OS`, port 54322, Supabase CLI project `DxB_Global_OS` | `docker ps` · `supabase/config.toml:5,35` |
| M2 | Databases in it: `template1` (oid 1) · `template0` (oid 4) · **`postgres` (oid 5)** · `_supabase` (16736) · **`dxb_test` (41727)** | `select oid, datname from pg_database order by oid` |
| M3 | **`postgres` is the company** — 94 tables, 205 agents, 217 tasks, 51 approvals, 29,636 audit rows. Its oid is 5, so PostgreSQL's own installer created it; nobody in this project added it. The CEO's memory that *"sadece supabase vardı"* is correct | `scripts/systemd/install.sh:17` · `db/README.md:22` |
| M4 | **`dxb_test` is the construction clone** — created 2026-07-28 to close C47; a full copy of the company's real rows, now 3,517 audit rows adrift | `vitest.config.ts:68` |
| M5 | **`cost_ledger` inside the company:** 950 `<synthetic>` · 282 `claude-fable-5` · 122 `claude-opus-5` · 113 `claude-sonnet-5` · 109 `claude-opus-4-8` · 36 haiku | `select model, count(*) from cost_ledger group by 1` |
| M6 | **It is live, not history** — one `<synthetic>` row landed **2026-08-22 18:11:51**, two `claude-opus-5` rows **2026-08-21 07:24 and 07:48** | `select created_at::date, model, count(*) from cost_ledger where created_at > now() - interval '10 days' group by 1,2` |
| M7 | **`v_cost_breakdown`** — the view behind the CEO's cost page — **carries no filter**; it sums the whole `cost_ledger`. C24's *"construction separated"* holds only for `v_workforce_tokens`, which reads `agent_runs` | `pg_get_viewdef('public.v_cost_breakdown')` |
| M8 | **`memory_index`** — **13,919** rows, of which **13,845** come from the `claude-mem` store (the construction sessions' own diary), every one at `scope='holding'`. *(Re-measured 2026-08-23: the 13,882 that stood here is the count of `kind='fact'`, not the total — 13,845 claude-mem + 37 pgvector + 32 obsidian + 5 notebook = 13,919. Two records carried the wrong total until a third audit found them disagreeing.)* | `select store, scope, count(*) from memory_index group by 1,2` |
| M9 | **`project_risks`** — the coffee-token construction chore is still `open` on his risk page (C36, opened 2026-07-27) | `select title_tr, severity, status from project_risks` |
| M10 | **`pgboss.job`** — 303,136 rows in the company database | `select count(*) from pgboss.job` |
| M11 | **94 files** fall through to the company database when `DXB_DATABASE_URL` is unset — 83 tests, 6 scripts, 3 seeds, 1 tool, **1 live application route** (`apps/dashboard/src/app/api/voice/call/route.ts:53`) | `grep -rl "54322/postgres" --include=*.ts --include=*.mjs --include=*.js` |
| M12 | `packages/shared/src/db.ts:14` already **throws** when the variable is missing — the production path is the one place that is correct today | source |
| M13 | The governance gate reads the company as **superuser**: `docker exec … psql -U postgres -d postgres` | `scripts/governance/ledger-truth.mjs:194` |

---

## 2. The root cause, named at its source

The residue is not left behind by a careless sweep. **Something writes it, on purpose, every
session.**

`.claude/settings.json:39` installs a `SessionEnd` hook:

```
node "$CLAUDE_PROJECT_DIR/tools/hooks/dist/tag-subscription-call.js"
```

`tools/hooks/src/tag-subscription-call.ts:66`:

```ts
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
```

It then reads the construction session's own transcript, sums the tokens per model, and inserts
them into the **company's** `cost_ledger` with `department='engineering'`, `mode='subscription'`,
`task_id=null`.

**So every time a construction session ends, the holding's books get a row for the author's own
token burn.** That is complaint C24 in its original form, still running, and it fired at
2026-08-22 18:11:51. Row M6 is that hook.

Nothing in this plan is finished until that writer is corrected at its source.

---

## 3. The architecture — settled, and settled by him

**THE COMPANY DOES NOT MOVE. THE CONSTRUCTION MOVES OUT.** That is the approved architecture and
there is no open question in it <!-- CEO-OK: construction-company-db-separation-2026-08-23 -->.

His first wording had it the other way round — *"the company gets its own Postgres, its own
container, its own port, its own credentials, named `dxb`"* — the measurement below showed that
direction would break his own live surfaces, it was put back to him, and he answered the same day,
before anything was built: *"tersini de onaylıyorum, blok 0 ile başla"*. That is history, not an
open item; every line that said the reversal was still waiting on him is deleted (LAW A). A third
audit found two of them still standing hours after he had answered.

Why:

1. **The company's live surfaces depend on Supabase Realtime.** `apps/dashboard/src/lib/realtime.ts`
   plus at least ten CEO-facing components — `live-ticker`, `live-feed`, `alert-center`,
   `approval-center`, `workflow-center`, `task-live-refresh`, `freshness-stamp`,
   `approvals/inbox`, `library-actions` — subscribe to it. Moving the company off the Supabase
   stack means rebuilding the thing that makes his screens alive, which is V2's first law.
2. **His login lives in Supabase Auth** (`apps/dashboard/scripts/seed-ceo-user.ts`,
   `reset-ceo-password.ts`).
3. **The Supabase CLI pins the database name to `postgres`.** `supabase/config.toml` has a `[db]`
   section with `port`, `shadow_port` and `major_version` and **no name field**. `dxb` cannot be
   the name of a database inside a Supabase stack.

**Therefore: the company does not move. The construction moves out.**

The disposable side is the side that travels. His records never leave the house they are already
in; nothing of his is at risk during the work; and the wall ends up in a stronger place, because
the two sides are then separated by **different engines on different ports with different
credentials** rather than by two names inside one engine.

`dxb` becomes the name of the construction stack's Supabase project (`DxB_Build`) — a second
stack, not a second database.

### The three walls

| Wall | What it is | Why it cannot be walked past |
|---|---|---|
| **W1 — Two engines** | Construction gets its own Supabase stack: own container set, own ports (api 54421 / db 54422 / shadow 54420 — final numbers fixed at build time against what is free), own password, own volume | A wrong address no longer lands on the company's data; it lands on a port where the company does not exist |
| **W2 — The one-way window** | On the company engine, a role `dxb_reader`: `LOGIN`, `CONNECT`, `USAGE` on `public`, `SELECT` on every table, and default privileges for future tables. **No `INSERT`/`UPDATE`/`DELETE`/`TRUNCATE` anywhere, no `CREATE`.** Every construction reader — the governance gate, the acceptance tests that must measure real rows — connects as this role | The refusal is issued by PostgreSQL, not by our code. A future session that writes the wrong line still cannot write |
| **W3 — No fallback, and a guard that shouts** | Every `?? "postgresql://…54322/postgres"` deleted from all 94 files; they throw like `packages/shared/src/db.ts:14` already does. A `globalSetup` guard refuses to start any suite whose resolved URL points at the company's port or the company's role | A missing variable becomes a loud stop instead of a silent write into the holding |

---

## 4. Execution blocks — in order, each proven before the next begins

### Block 0 — The safety net (nothing is touched before this is green)

- Full `pg_dump` of the company database, dated, written locally **and** to the Hetzner Storage Box
  through the pipeline that already exists (`scripts/restore-db.sh` / `BACKUP_OK` path, live since
  2026-07-18).
- Prove the dump by restoring it into a throwaway container and diffing table counts against live.
- **Evidence:** `BACKUP_OK <bytes>` · `OFFSITE_OK` · restore inventory diff **0**.

### Block 1 — Kill the writer at its source

- `tools/hooks/src/tag-subscription-call.ts`: the fallback is deleted. The hook reads
  `DXB_CONSTRUCTION_DATABASE_URL`; with nothing set it **writes nothing and exits quietly** — a
  construction cost record is never a reason to touch the holding.
- Where does the construction's own token spend go? Into the construction stack's own
  `cost_ledger`. The author's spend is the author's, not the holding's.
- **Red-first test:** `tests/b36/hook-never-writes-company.test.ts` — run the hook with the company
  URL exported and assert the company's `cost_ledger` count is unchanged; run it with no variable
  and assert it exits 0 and writes nothing.

**THE FINISH LINE FOR THIS BLOCK — fixed 2026-08-23, and it is the only thing that reopens it.**
Three audits rejected three different proofs of this block while the block itself was finished, so
the question was narrowed to what Block 1 actually owns. The auditor's wording, put to the CEO and
adopted by him the same day:

> **Can the `SessionEnd` hook send an INSERT, UPDATE or DELETE to the company's database —
> regardless of how the address is spelled, regardless of a missing or stale identity record, and
> regardless of a connection failure?**
>
> **NO** → Block 1 closes and does not reopen. **YES** → only the write path found is repaired and
> the same question is measured again. Counting, backups, record wording, portable builds and
> anything else go to **their own blocks** and do not hold this one. *"Daha iyi olabilir"* is no
> longer a reason to reopen it.

**THE ANSWER, measured 2026-08-23 — `scripts/b36/prove-block1.mjs`, in the battery as
`tests/b36/block1-question.test.ts`:**

```
conditions fired   : 18        (7 spellings of the company · identity record missing · allow list
refused            : 18         empty · company record stale two ways · allow list poisoned with the
tables that moved  : 0          company · company record deleted AND the company allowed · a real
                                database nobody listed · an address that never answers · an
                                unreadable address · a database that does not exist)
write statements the server was asked to run during the run: 0
detector validated: YES — the permitted ledger recorded 1 new write statement(s) from the same hook
ANSWER: NO — the hook cannot send an INSERT, UPDATE or DELETE to the company database.
BLOCK1_CLOSED
```

Measured from the server on both sides: the per-tuple counters of every table the holding owns, and
`pg_stat_statements`, which records a statement that was **sent** even if it then failed. The drill
refuses to pass unless it has also shown, in the same run, that the detector registers a real write —
the first version of that detector was **blind**, because `\b` is a backspace in PostgreSQL's regular
expressions and not a word boundary, and it reported a comfortable zero.

---

### Block 2 — The construction stack moves out — **DONE 2026-08-23**

**Built on his word, "block 2 ye başlayabilirsin". Evidence: `EVIDENCE.md` §Block 2.**
The construction site runs its own Supabase stack (`DxB_Build`, ports 544xx, its own cluster and
volume); `dxb_test` is dropped and the company engine carries only `postgres`, `_supabase` and the
templates. Schema parity proven object for object (`pnpm verify:schema-parity` → `SCHEMA_PARITY`).
Data generated from the repository's own files (`pnpm construction:seed` → `BUILD_SEED_DONE`).
Whole stack destroyed and rebuilt from empty, then **99 test files · 737 tests · exit 0**, with the
company measured **UNTOUCHED** across it.

**Registered adaptations (three), each measured:** the Supabase CLI has no local database-password
field, so the wall is the engine and the port and the credential wall stays Block 3's `dxb_reader`
· the schema is built by `scripts/bootstrap-db.sh` (the canonical chain) because the CLI's own
runner dies on pg-boss's runtime-born schema · `scripts/test/refresh-test-db.sh` is deleted, since
its one job was to clone his rows onto the construction side.

**Seven defects it found, all fixed at source:** the chain resurrects 15 employees he ordered
deleted (new migration `20260823001000`, a no-op on the company) · the velocity breaker and the
monthly cap both die when the LiteLLM spend table is absent, the second one poisoning its own
transaction · the `git` MCP server has been dead holding-wide behind stale pins · `scrapling`
pointed at `/home/ghost` · on any fresh environment the entire senior layer's `persona_path` points
at a planning document (`20260823002000`, also a no-op on the company) · and the sicil sync silently
dropped 28 of 199 employees outside the company, because it matched on a uuid written in the file
instead of on the slug.


- New Supabase project directory for construction, its own `config.toml`
  (`project_id = "DxB_Build"`), its own ports, its own password, started alongside the company's.
- Its schema is built from the **same** `supabase/migrations` — one schema, two engines, so a
  migration can never be true on one side and false on the other.
- **Its data is generated, not copied** (the CEO's decision 2). A new
  `db/seed/build-seed.ts` produces a complete but entirely fictional holding: companies,
  departments, agents, tasks, approvals, costs — enough rows and enough shape for every existing
  test, and not one row of his.
- `vitest.config.ts:68` and `tests/global-teardown.ts` point at the construction engine. The
  realtime-partition creation added on 2026-08-21 travels with them.
- `dxb_test` on the company engine is **dropped last**, only after the new stack has run the full
  battery green — and after Block 0's dump is proven.
- **Evidence:** full battery green against the construction engine; company database untouched
  across that run (row counts identical before and after, all 94 tables).

### Block 3 — The one-way window

- Migration on the company engine creating `dxb_reader` with SELECT-only privileges and default
  privileges for future tables.
- `scripts/governance/ledger-truth.mjs:194` stops using the superuser and connects as `dxb_reader`.
- Any acceptance test that must measure the real company reads
  `DXB_COMPANY_READONLY_URL`; there is no writable company URL anywhere in the construction side.
- **Red-first test:** `tests/b36/company-is-read-only.test.ts` — as `dxb_reader`, attempt
  `INSERT INTO cost_ledger …`, `UPDATE tasks …`, `DELETE FROM alerts …` and `TRUNCATE`; each must
  fail with `permission denied`. A test that passes because the write succeeded is the defect.

### Block 4 — Delete every fallback, and add the guard

- All 94 files lose their `??=` company-database fallback. They throw instead.
- `apps/dashboard/src/app/api/voice/call/route.ts:53` — a live route may never invent a database.
- `vitest` `globalSetup` guard: if the resolved `DXB_DATABASE_URL` names the company's port or the
  company's role, the run aborts before the first test.
- `scripts/systemd/install.sh:17` keeps writing the company URL — that is correct, it is the
  **company's** daemon — but the variable it writes is renamed so a construction tool can never
  pick it up by accident.
- `db/README.md:22` and `.claude/settings.local.json:81` updated to the new shape.
- **Evidence:** `grep -rc "54322/postgres"` over the repository → **0** outside the company's own
  daemon installer.

### Block 5 — The residue moves out (moved, never deleted)

Order is fixed and never varies: **copy → verify → delete → audit.**

1. `dxb_archive` is created **on the construction engine**, so the archive is not stored in the
   company's house either.
2. **A dry-run report is produced first and put in front of the CEO** — every candidate group with
   its exact row count and three sample rows, before a single row moves. His eye decides what is
   construction and what is the company's record. The classification rules the dry-run proposes:

   | Group | Proposed rule | Measured today |
   |---|---|---|
   | `cost_ledger` | `model = '<synthetic>'`, or `source='hook'` with `task_id IS NULL` and `agent_id IS NULL` — i.e. a construction session's own burn | 950 + up to 662 |
   | `memory_index` | `store = 'claude-mem'` — the construction sessions' diary | 13,845 |
   | `pgboss` | completed/archived job history; the live queue tables stay | 303,136 |
   | `project_risks` | the coffee-token row (C36) — a construction chore in a business register | 1 |
   | `hook_violations` · `audit_log` | **BOUNDARY — nothing moves without his word.** These are the holding's governance and legal record; a construction-era row in them may still be the company's history | 1,963 · 29,636 |

3. Each group: copy into `dxb_archive`, verify row count **and** a checksum of the copied rows,
   only then delete from the company, and write one `audit_log` row in the company naming what
   left, how many, and when.
4. **Rollback:** Block 0's dump plus the archive database — every deleted row exists in two places
   before it is deleted from one.

### Block 6 — The proof command

- `scripts/governance/company-untouched.mjs` → `pnpm verify:separation`:
  1. photograph the row count of all 94 company tables;
  2. run the whole battery;
  3. photograph again and diff — any non-zero difference is red;
  4. attempt a write as `dxb_reader` — a successful write is red;
  5. scan the repository for a company-database fallback — any hit is red.
- **Red-first:** the command is written and run **against today's configuration first**, and it
  must FAIL on step 4 and step 5. A gate that has never been seen red has never been tested.
- Wired into the battery so it runs with everything else.

### Block 7 — Records, in the same session

- Board row **B36** closes with its evidence, or its remaining leg is named.
- **C36 closes** — the coffee-token row leaves his risk register — and the board's C36 cell is
  corrected in the same session (ledger parity, board law 5).
- The complaint ledger's C20/C21/C22/C23/C24 closures are **annotated with the truth**: they swept,
  they did not wall. Historical facts are not rewritten; the claim about the present is corrected.
- The registered adaptation is written into [[TEST_STRATEGY]] and [[SYSTEM_ARCHITECTURE]].
- `.planning/STATE.md` updated.
- Board line 12 corrected: *"THE DATABASE IS OFF"* is false — the Supabase Postgres is up; what is
  stopped is the two resident services.

---

## 5. Blast radius — what stands on what is being changed

His law of 2026-08-17: *"birşeyi yaparken veya düzeltirken onu etkileyecek başka şeyleri
bozmasın."* Named before the change; re-measured and printed after it.

| What stands on it | Why it depends | How it is re-measured afterwards |
|---|---|---|
| The whole test battery (95 files, 710 tests) | Reads `DXB_DATABASE_URL` | Full battery green against the construction engine |
| `scripts/governance/ledger-truth.mjs` (gates 23/23) | Reads the company as superuser | Gate run, still 23/23, now through `dxb_reader` |
| `pnpm typecheck` | 94 files change | `tsc --build` exit 0 |
| The two resident services (`dxb-scheduler`, `dxb-jarvis`) | Read the company URL from `.env.daemon` | Installed, started, `active`, 0 restarts, one node process each, queue moving |
| The CEO's login | Supabase Auth on the company stack | Unchanged — the company stack is not touched. Confirmed by an eye test |
| His live surfaces (realtime) | Supabase Realtime on the company stack | Unchanged — same reason. Confirmed by an eye test |
| Backup/restore (`scripts/restore-db.sh`, cron 02:30, Storage Box) | Points at the company database | Drill re-run; `BACKUP_OK` + restore diff 0 |
| The 15 pg-boss schedules | Live in the company database | Counted before and after |
| `db/seed/*` (3 files) | Default to the company database | Re-pointed; a seed run against the construction engine proven |

---

## 6. What this row deliberately does NOT do

- It does not touch V1's screens, and it does not begin V2. It repairs the floor both stand on.
- It does not move `hook_violations` or `audit_log` without the CEO's separate word (Block 5).
- It does not delete `dxb_test` before the new stack is green and the dump is proven.
- It does not change what any page looks like. The only visible change is the coffee-token row
  leaving his risk register, and construction rows leaving his cost page.

---

## 7. Risks

| # | Risk | Guard |
|---|---|---|
| R1 | A dropped row that was actually the company's | Nothing is deleted before it exists in the archive **and** in the dated dump; the dry-run goes to the CEO first |
| R2 | The generated seed does not satisfy tests that assert real-shaped data | Blocks 2 and 6 are not green until the full battery passes on generated data; any test that genuinely needs the real company gets the read-only window instead |
| R3 | Two engines drift apart in schema | One migration folder feeds both; a gate asserts identical schema hashes |
| R4 | Disk and memory — a second Postgres on this machine | Measured before starting; the freeze guard installed 2026-08-21 stays running |
| R5 | The CEO's login or live tiles break | The company stack is not modified at all; still confirmed by eye before the row closes |

---

## 8. What is his, and what he has already answered

**ANSWERED, 2026-08-23** <!-- CEO-OK: construction-company-db-separation-2026-08-23 -->
— *"tersini de onaylıyorum, blok 0 ile başla"*. **The reversal in §3 is approved and Blocks 0 and 1
are built on it.** The line that stood here — "the reversal waits on his word" — is deleted rather
than annotated (LAW A); it was still standing after he had answered it, and a third audit caught the
plan contradicting itself.

**STILL HIS, and nothing moves without them:**

1. **The dry-run in Block 5** — which rows count as construction and which are the holding's own
   record. He sees the list before anything moves.
2. **`hook_violations` and `audit_log`** — whether they are touched at all.
