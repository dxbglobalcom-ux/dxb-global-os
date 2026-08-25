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
| M8 | **`memory_index`** — **13,919** rows, of which **13,845** come from the `claude-mem` store (the construction sessions' own diary), every one at `scope='holding'`. *(Re-measured 2026-08-23: the 13,882 that stood here is the count of `kind='fact'`, not the total — 13,845 claude-mem + 37 pgvector + 32 obsidian + 5 notebook = 13,919. Two records carried the wrong total until a third audit found them disagreeing.)* **SPENT, 2026-08-25: the table is empty — 0 rows.** He ordered the holding's memory cleared to zero the same evening (commit `9b65a4ae`); the 15,773 rows it held by then live in `~/backups/dxb/memory_index-before-ceo-wipe-2026-08-23.sql`. | `select store, scope, count(*) from memory_index group by 1,2` |
| M9 | **`project_risks`** — the coffee-token construction chore is still `open` on his risk page (C36, opened 2026-07-27) | `select title_tr, severity, status from project_risks` |
| M10 | **`pgboss.job`** — 303,136 rows in the company database. **RE-MEASURED 2026-08-25: 79,178, and falling on its own** — pg-boss deletes its own completed work, so the number was never residue to move; the oldest job on the engine is 2026-08-17 | `select count(*) from pgboss.job` |
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

### Block 3-bis — THE WALL IS OUTSIDE THE DATABASE — **BUILT AND ACCEPTED 2026-08-24.**

**ACCEPTED BY THE CEO ON 2026-08-24, AFTER HIS AUDITOR PASSED IT** — *"denetçi tamam dedi herşeyi kaydet. onaylıyorum."* Registered as `b36-block3-bis-accepted-2026-08-24`. The line that stood here — *"Not yet accepted (LAW B)"* — is deleted by that word, not footnoted beside it. His earlier *"onaylıyorum"* was permission to BUILD, in his own correction; this one is the acceptance of the result. **B36 itself stays OPEN:** Blocks 4-7 are untouched.

**Why the version that stood here was replaced (LAW A).** The first shape of this block — "withdraw
the login, put a read-only gateway beside the company" — was audited on 2026-08-24 and **failed a
third time**, and the auditor's reason is correct: *"the current gateway plan does not close
host-level Docker access."* A gateway that guards the front door is decoration while the caller
holds the key to the building. The old text is deleted rather than annotated, because it described
a wall that would not have stood.

**THE ROOT CAUSE OF THREE FAILED AUDITS, named once.** Every attempt so far fought **inside
PostgreSQL** — roles, GRANTs, REVOKEs, event triggers, receipt walls. The route that defeats all of
them is **outside** PostgreSQL: the construction runtime runs as the operating-system user `dxb`,
which is a member of the `docker` group, and the Docker socket is root on this machine. Measured
from the construction runtime on 2026-08-24, this session, with SELECT-only statements — **nothing
was changed in the company**:

| # | Route out of the construction runtime | Command | Measured result |
|---|---|---|---|
| D1 | The company's engine as its **true superuser** | `docker exec -i supabase_db_DxB_Global_OS psql -U supabase_admin …` | `REACHED supabase_admin superuser=true` |
| D2 | The company's engine as the **owner of every table** | `docker exec … psql -U postgres …` + `has_table_privilege` | `INSERT cost_ledger=true · DELETE audit_log=true · UPDATE approvals=true` |
| D3 | The company's **credential files** | `test -r` on `.env`, `.env.daemon`, `var/b36/company-window.env` | all three **READABLE** (73 / 1372 / 329 bytes) |
| D4 | A **direct TCP login** as the window role | `psql "$DXB_COMPANY_READONLY_URL"` | `TCP LOGIN SUCCEEDED as dxb_reader` |
| D5 | **The governance gate itself** goes through the socket | `scripts/governance/ledger-truth.mjs:220-221` | both branches are `docker exec …`; the fallback branch is `-U postgres`, i.e. **the owner of everything** |

D1 and D2 make every privilege measurement in Block 3 irrelevant: a runtime that can become
`supabase_admin` does not need `dxb_reader` to hold anything. **That is why closing the three
self-directed capabilities would still not have closed this row**, and why the honest verdict on
2026-08-24 was `WINDOW_LEAKS` on both engines.

---

#### The finish line — fixed BEFORE the work starts, and it is the only thing that reopens this block

Block 1 stopped reopening the moment its question was fixed in the CEO's own hearing. Block 3 gets
the same device, and for the same reason: three audits have now rejected three different proofs by
asking a wider question than the one the proof answered.

> **From the construction runtime — the identity that runs the tests, the batteries, the drills and
> the night shifts — is there any route that reaches the company's database and changes it, or
> produces any effect there beyond a read? The routes counted are: a direct TCP login; the Docker
> socket; the company's container by any other means; any credential file; any service environment;
> the company's HTTP gateway (Supabase REST / Realtime / Auth on 54321); and the read gateway
> itself.**
>
> **NO** → Block 3 closes and does not reopen. **YES** → only the route found is closed and the same
> question is measured again.

**Explicitly OUTSIDE this question, and named here so no audit reopens the block on them silently.**
Each is either a different row or a thing that cannot be walled without ending the machine:

1. **The author's own administrative hand.** The session that builds this repository runs as the
   human's own account and holds `sudo` and `docker` by definition. A machine on which the builder
   cannot administer the machine has no builder. **What is being walled is the automated
   construction runtime, not the human's hand on his own laptop.**
2. **The company's own roles and daemons** — `supabase_admin`, `postgres`, `anon`, `authenticated`,
   `dxb-scheduler`, `dxb-jarvis`. They are the company working; B36 is not about them.
3. **Poisoning the repository and waiting for a human to run it.** The construction runtime writes
   the repository — that is its job; a tree it cannot write is a build that cannot build. That is a
   supply-chain question, it is real, and if the CEO wants it, it opens as its **own board row**.
   It does not hold this one.

---

#### AS BUILT — 2026-08-24, and it is now BOTH walls

He approved this block — *"onaylıyorum"*, then *"önce bis-block3 yap ilk onayladığımı"* — and it was
built the same day. It was first delivered without the two layers that need root, because `sudo` on
this machine asks for a password at a terminal and no session can type one; **he then gave the
password himself** and told the author to finish it. Both layers now stand. Evidence:
`EVIDENCE.md` §Block 3-bis. Verdict of its own drill: `pnpm b36:prove-wall` → **`WALL_IS_ONE_WAY`**.

**AND IT FAILED ITS AUDIT ON THE SAME DAY — ON THE SECOND WALL, NOT THE FIRST. FIXED, MEASURED,
AND WRITTEN INTO THE BATTERY.** The auditor did not attack a port. He asked the holding's container
for its own address and connected to it: **`172.18.0.6:5432`**, from the real `dxbbuild` identity,
a live PostgreSQL login, with INSERT/UPDATE/DELETE true. Re-measured here, connect-only, before
anything was changed — it was worse than the finding: the database, kong, rest, auth and realtime
all answered on their container addresses, **and so did this machine's own LAN address and the
docker gateway** on the published port. Only the two `127.0.0.1` spellings were ever caught.

**Two independent reasons, either one of them enough.** (a) The wall named the ports it forbade,
and the container address was never a named port at all. (b) For every local address except
`127.0.0.0/8`, Docker rewrites the destination in the `nat` OUTPUT hook, which runs **before** the
filter hook — so this host's LAN address on the published port had already become the container's
address on 5432 by the time a port rule looked at the port. **A wall that names what it forbids will
always be shorter than the list of ways to spell an address.** It now names what it ALLOWS: eight
ports, on the loopback address only, and everything else this identity emits is refused — every
other address, every container bridge, every port, IPv4 and IPv6, TCP and non-TCP.

**Measured after the change, from the auditor's own runtime** (`dxbbuild`, outside the sandbox, no
namespace of any kind): **21 addresses discovered from Docker this run, the 19 of them that are real doors all refused** **THAT COUNT WAS WRONG AND IS CORRECTED HERE, 2026-08-24:** a second, independent measurement built for the CEO's acceptance screen disagreed with the drill, and the drill was the one that was wrong. Docker's template prints the two words `invalid IP` when a container has no IPv6 address, and the sweep's filter turned both words into hostnames — so 18 of those 39 were names that never existed, and refusing to resolve a name that does not exist proves nothing. The real numbers, measured after the fix: **21 addresses discovered, 19 of them real doors** (two exposed ports have nothing listening behind them), **and every one of the 19 refused** from both walled runtimes. The drill now separates the two and prints `BLIND` if the red half reaches none of them., and the live
PostgreSQL login at `172.18.0.6:5432` **refused by the network before any credential was offered**.
Its own engine still answers. The drill no longer guesses how the holding can be spelled: it asks
Docker for the address of every container the holding owns, crosses it with every port that
container exposes, adds this host's own addresses and every bridge gateway, and fires at all of
them — and it prints `BLIND` and refuses a verdict if that list ever comes back empty.

**THE FIX ITSELF BROKE SOMETHING ELSE FOR THIRTY MINUTES, AND THE SWEEP CAUGHT IT.** The first
default-deny let everyone else past with `meta skuid != 997 accept`. A packet the kernel emits with
**no owning socket** — the ACK and RST that close a connection whose socket is already gone —
carries no skuid at all, so that rule does not MATCH it and therefore does not accept it either: it
fell straight into the default-deny. Measured on this machine while nothing at all was running as
the construction identity: **ten packets destroyed in two idle seconds, belonging to two of the
CEO's own editor processes**, for every user on the machine. The same trap had a second symptom —
the RST that `reject` generates is itself ownerless, so it fell into the deny, generated another,
and became a self-feeding storm: **2,769 packets from one connection attempt**, with the caller
never told anything and left to hang. Written instead as `meta skuid 997 jump construction`, an
ownerless packet simply does not match, falls off the end of the base chain and meets `policy
accept`. Measured after: **zero packets while idle**, and one refused attempt costs **exactly one
packet** and answers `ECONNREFUSED` in **32 milliseconds**.

**Both lessons are now in the battery, measured on the file and not on prose** —
`tests/b36/company-is-read-only.test.ts` (6): no deny rule may name a port, every door must be
bound to the loopback address, the wall must say `skuid 997 jump` and must never say `skuid != 997`,
and the installed copy must be byte-identical to the repository's. `prove-wall.mjs` checks the same
four things against the **live** ruleset and refuses a green verdict if the kernel is holding the
shape that failed.

**What actually runs, and where it lives.** The wall's definition is **not in the repository**. It
is `/usr/local/sbin/dxb-construction-sandbox`, owned by **root**, mode 0755 — the construction
holds write access to the repository (it has to build) and therefore must not hold write access to
the thing that confines it. `scripts/construction/sandbox.sh` is its reviewable source,
`scripts/construction/install-wall.sh` installs it, and a test fails if the two ever drift apart or
if the installed copy stops being root-owned. `scripts/construction/run.sh` is three lines: it calls
the installed program through one `sudoers` entry and carries no wall definition of its own.

**The one deviation that remains, and it is deliberate:** `dxb_reader` was **renamed** to
`dxb_gateway` rather than dropped and rebuilt. The account is gone from the company's engine either
way; the rename carries the whole audited privilege set across on the role's OID and re-issues **not
one GRANT**. Re-issuing that privilege set is the single act that already broke the holding for
eleven minutes on this row.

**A limit, not a deviation:** two test files cannot run inside the sandbox, because one enters the
construction container and the other reads this machine's own process tree. They are named in
`scripts/construction/battery.sh`, run on the company's side, and printed as their own half on every
run. Neither touches the holding's data.

**And one thing that got better than the plan promised.** The third item named as outside the fixed
question — poisoning the repository and waiting for a human to run it — is now **partly closed**
rather than merely named: `.git` is bound **read-only** inside the sandbox, so the construction
cannot rewrite the holding's history, and the wall's own definition is root-owned, so it cannot
widen the room it is standing in. What remains open is the working tree, which the construction must
be able to write in order to build at all.

#### The wall — four layers, and the first one is the operating system

*(This is the shape he approved. What was actually built is above; read them together — the layers
are the same four, and the section above says exactly where each one ended up.)*

**Layer 1 — the construction runtime gets its own operating-system identity.**
A new unix user **`dxbbuild`**: not in `docker`, not in `sudo`, no password. Measured today, this
lands cleanly on the permissions that already exist — `/home/dxb` is `drwxr-x---` and `~/.config` is
`drwx------`, so a member of the `dxb` group reaches the repository (`drwxrwxr-x`) and **nothing
else**, and every credential file is mode `600` and therefore unreadable to it. Every construction
command — `pnpm test`, the batteries, the drills, the seeds, the night shift — runs through one
door, `scripts/construction/run.sh`, which is `sudo systemd-run --uid=dxbbuild` with
`NoNewPrivileges=yes`, `PrivateDevices=yes`, `ProtectHome=` shaped to the repository, and
`InaccessiblePaths=` on the Docker socket and on `var/b36`.

**Layer 2 — the network is closed to that identity.**
One `nftables` rule in the output path: packets owned by uid `dxbbuild` to `127.0.0.1:54322` (the
company's database) and `127.0.0.1:54321` (the company's REST / Realtime / Auth gateway — a
`service_role` key writes through it, so a wall that forgets the HTTP door is not a wall) are
**rejected**. The construction's own ports, 54421 and 54422, stay open. The rule is installed by a
unit so it survives a reboot, and the drill proves it is loaded before it proves anything else.

**Layer 3 — the account is withdrawn, and the only reader is a named catalogue.**
`dxb_reader` is **dropped** from the company's engine: there is no credential left to steal, and
the three self-directed capabilities disappear with the role that held them. In its place, on the
**company's** side, a small service — its own systemd unit, running as the company's identity —
holds the only connection, opened with `default_transaction_read_only=on` and wrapping every answer
in a `BEGIN READ ONLY` transaction it starts itself. It listens on a **unix socket**
(`/run/dxb/company-read.sock`, group-readable by `dxbbuild`) so no TCP port exists to find, and it
answers a **fixed catalogue of named questions** — row counts per table, the ledger's claim
measurements, the schema inventory. **The caller never sends SQL.** A question that is not in the
catalogue cannot be asked, so there is no statement for a future session to get wrong.

**Layer 4 — fail closed.**
`scripts/governance/ledger-truth.mjs` loses **both** `docker exec` branches, including the
`-U postgres` fallback the auditor named. It asks the catalogue, or it stops with a non-zero exit and
says why. There is no second way for it to read the company, and a missing gateway is a loud stop —
never a quiet promotion to the owner of everything.

---

#### The proof — what `pnpm b36:prove-wall` must print, and it runs INSIDE the sandbox

Every attempt below is fired **as `dxbbuild`, inside the sandbox that the real construction runs
in** — the auditor's requirement, and the thing no previous proof did. Nothing that mutates is ever
fired at the company: the company-side attempts are refusals by nature (a login that is rejected, a
file that cannot be read, a socket that is not there), and every mutating attempt runs on the
construction engine (54422), which is disposable.

| # | Attempt, from the construction runtime | Must print |
|---|---|---|
| P1 | direct TCP login to 54322, every spelling, every role | refused — connection rejected |
| P2 | `docker ps` / `docker exec` / a raw write to `/var/run/docker.sock` | refused — no such socket, no permission |
| P3 | read `.env`, `.env.daemon`, `var/b36/*.env`, the systemd unit files | refused — permission denied, on each |
| P4 | HTTP write to the company's gateway on 54321 (REST insert with any key found) | refused — connection rejected |
| P5 | `ALTER ROLE`, `ALTER DEFAULT PRIVILEGES`, `NOTIFY`, any function call, through the catalogue | refused — not an operation in the catalogue |
| P6 | every write verb against every company table, through the catalogue | refused — read-only transaction |
| P7 | the catalogue's own read questions | **answered** — and `pnpm verify:ledger` runs to 23/23 through it |
| P8 | the company's fingerprint and its two governance counters, before and after the whole drill | **identical** |

**Red before green, on every line.** P1-P6 are re-fired from the unsandboxed identity against the
**construction** engine and must SUCCEED there, in the same run — a refusal that was never tested
against a working attempt is not a measurement. P7 is re-fired with the gateway stopped and must
fail closed. A drill that cannot show its own red half does not print a green verdict.

The verdict line is `WALL_IS_ONE_WAY` **only** when P1-P6 are all refused, P7 answers, and P8 is
identical. Anything else prints `WALL_LEAKS` and the exact route, exits 1, and the block stays open.

---

#### Blast radius — named before the change, re-measured after it

| What stands on it | Why it depends | How it is re-measured |
|---|---|---|
| The whole battery (106 files / 775 tests) | It will run as a different OS user, in a sandbox | Full battery green **inside the sandbox**, same counts |
| `pnpm verify:ledger` (23/23) | Loses both `docker exec` branches | Gate run through the catalogue, still 23/23 |
| The 15 company scripts that `docker exec` today (`i18n-purity-check.sh`, `sync-personas-to-db.sh`, the HR wave scripts, the backup dump, …) | They administer the **company**; they are the company's hand, not the construction's | Each is classified: company-side scripts keep the socket and are run by the company's identity; anything the battery calls moves to the catalogue. The classification is printed |
| `scripts/b36/*` drills | They hold the company's address | `prove-window` is replaced by `prove-wall`; the old drill is deleted, not kept beside it |
| The two resident services | They are the company's daemons, unchanged | `active`, 0 restarts, one node process each, queue moving |
| The CEO's login and his live surfaces | Supabase Auth / Realtime on the company stack | Untouched — the company stack is not modified. Confirmed by eye |
| Backup / restore, cron 02:30 | Runs as the company's identity | Drill re-run, `BACKUP_OK` + restore diff 0 |

#### What it costs, honestly

One more resident service to keep alive. A catalogue that must be extended, in code, whenever a gate
needs a number it does not carry — and the end of ad-hoc reading of the company from a test. A
sandbox that the battery must run inside, which will find every place that quietly assumed it was
root. And the first run of the battery under a new identity will fail somewhere for reasons that
have nothing to do with security; that is expected, and it is inside this block.

#### What it does NOT do

It does not touch the company's own roles or daemons. It does not change a single screen. It does
not move one row. It does not begin Block 4.

**BUILT, AUDITED AND ACCEPTED — 2026-08-24.** The sentence that stood here — *"NOTHING HERE IS
BUILT"* — is deleted by what happened (LAW A). The corrected plan went to Muhittin Bey, he answered,
the block was built, its auditor passed it, and he then ran the acceptance screen with his own eye
and accepted it: `scripts/governance/ceo-approvals.json` → `b36-block3-bis-accepted-2026-08-24`.

### Block 4 — Delete every fallback, and add the guard — **ACCEPTED 2026-08-24**

<!-- CEO-OK: b36-block4-accepted-2026-08-24 -->
**LAW B, and he set both halves before the work was judged:** *"denetçi onaylamadan asla 4 bitti diyemezsin. onayladıktan sonra da gözümle gösterilecek şekilde canlı şekilde bana göstermelisin."* His auditor passed it — *"Block 4 passes … Proceed to Block 5 under the approved B36 plan"* — and he then ran the live acceptance screen himself (`pnpm b36:eye-check` → `http://127.0.0.1:4599/blok4`, five panels, all green, the company's fingerprint identical before and after) and said *"göz onayı tamamdır. kabul."* Registered: `scripts/governance/ceo-approvals.json` → `b36-block4-accepted-2026-08-24`. The sentence that stood here — *"NOT ACCEPTED … nothing here may be called done"* — is spent and is deleted rather than kept beside the truth (LAW A).

Measured before: **95** files bound the company's address to `DXB_DATABASE_URL` as a default
(83 tests · 8 scripts · 3 seeds · 1 live route). Measured after: **0**.
Evidence: `EVIDENCE.md` §"Block 4 — the company's address is no longer a default".

- 82 suites lost the `??=` line. The battery's engine is named once, in `vitest.config.ts`
  `test.env`, from the one spelling in `tests/construction-engine.ts`. A suite that arrives without
  an address now throws in `packages/shared/src/db.ts:39`.
- `tests/phase5/slice-10of10.sh` — the Phase-5 exit gate drives ten real lifecycles and used to
  default to the holding in bash. Now `${DXB_DATABASE_URL:?…}`, **exit 1**.
- The three seeds and the six operator tools refuse with a named reason and **exit 2**. Each of the
  eleven refusals was RUN, not predicted.
- `apps/dashboard/src/app/api/voice/call/route.ts:53` — gone. It is the only file in the dashboard
  that calls `getDb()`, and Next.js does not read the repository-root env files, so the fallback had
  been its only address. `scripts/dashboard.sh` (`pnpm dashboard`) now hands it one, by the same
  mechanism the daemons use.
- `scripts/systemd/install.sh` keeps writing the company URL — it is the **company's** daemon — but
  under `DXB_COMPANY_DATABASE_URL`. The two units map it back to `DXB_DATABASE_URL` inside their own
  `ExecStart` and nowhere else. `.env.daemon` migrated; both daemons measured carrying it, pg-boss
  reconnected, `NRestarts=0`.
- `db/README.md` §Environment rewritten: the variable has no default anywhere, plus the table of who
  sets it and how. `.claude/settings.local.json` lost the one permission that opened a direct `psql`
  door to the company (202 → 201 entries).
- **The gate:** `tests/b36/no-company-fallbacks.test.ts` imports `scan()`/`bindingsIn()` from
  `scripts/b36/count-company-fallbacks.mjs`, so the definition and the enforcement cannot drift
  apart. Its case (0) proves the instrument sees a fallback in all seven shapes before case (2) is
  allowed to report none, and the gate was **seen RED first** on a probe file.
  `tests/b36/battery-carries-no-company-key.test.ts` lost its one tolerated shape in the same turn.

**Deviations, named.** (1) The `vitest` `globalSetup` guard the plan asked for **already existed** —
Block 2 built it after the auditor's second FAIL (`pinTheEngine()` refuses a foreign address;
`refuseUnlessConstruction()` asks the server for its cluster identity on the connection that does
the work). It was measured, not rebuilt. (2) The planned evidence line, `grep -rc "54322/postgres"`
→ 0, was **not used**: `package.json` binds the company address to `DXB_COMPANY_URL` for
`verify:schema-parity` and `b36:prove-block1`, gates that must reach the holding on purpose, and
several `tests/b36` files carry it as an assertion. The committed counter separates *binding* from
*mentioning*, prints both lists, and its headline is the honest number.

### Block 5 — The residue moves out (moved, never deleted)

**BUILT AND MEASURED 2026-08-25 — NOT ACCEPTED (LAW B).** <!-- CEO-OK: b36-block5-residue-and-two-databases-2026-08-25 -->
`node scripts/b36/move-residue.mjs --apply` → **RESIDUE_MOVED, 2,756 rows**: `cost_ledger` 1612 ·
`project_risks` 1 · `decision_log` 1143, each copied to `dxb_archive` on the construction engine,
each verified by row count **and** an identical checksum on both engines, only then deleted, each
delete and its `audit_log` record in one transaction. The company: 46,735 → 43,983 rows
(−2,756 +4 records, to the row); `STATE_FINGERPRINT de359137ee1d7c79 → 453b0ef99e03a1f3`;
`hook_violations` 1,963 untouched; all 34 views still answer; his risk register carries business
risk only (board C36 closed). Evidence: `EVIDENCE.md` §"Block 5 — the residue is OUT".
**Gates on the final state:** `BATTERY_GREEN` (107/107 files · 775 passed | 15 skipped · host
3/3 and 16/16) · `WALL_IS_ONE_WAY` · `typecheck` 0 · `verify:ledger` OK · `SCHEMA_PARITY` ·
fallbacks 0 · gitleaks clean · 0 failed units.
**His eye's screen is built:** `pnpm b36:eye-check` → `http://127.0.0.1:4599/blok5`, five live panels;
RULE #0 pass run three times and it caught three defects, all repaired (`EVIDENCE.md` §"The screen his
eye needs for Block 5").
**What is NOT done, and it is the only thing left:** his auditor has not looked, and he has not seen
it by eye. That is the order he set for Block 4 and it holds here (LAW B).

Order is fixed and never varies: **copy → verify → delete → audit.**

1. `dxb_archive` is created **on the construction engine**, so the archive is not stored in the
   company's house either.
2. **A dry-run report is produced first and put in front of the CEO** — every candidate group with
   its exact row count and three sample rows, before a single row moves. His eye decides what is
   construction and what is the company's record. The classification rules the dry-run proposes:

   **REGISTERED ADAPTATION, 2026-08-25 — THE TABLE BELOW IS THE MEASUREMENT, NOT THE ESTIMATE.**
   The five rows written here on 2026-08-23 were re-measured against the live company engine before
   the dry-run was drafted, and three of them had stopped being true. The old table is replaced
   rather than annotated (LAW A). Evidence and the exact statements: `EVIDENCE.md`
   §"Block 5 — the dry-run survey".

   | Group | What it actually is | Plan said (08-23) | MEASURED 2026-08-25 | Verdict |
   |---|---|---|---|---|
   | `cost_ledger` | the construction author's own token burn: **every one of the 1,612 rows** is `source='hook'`, `department='engineering'`, `task_id`/`agent_id` NULL, `cost_eur` 0.0000, one `meta` key (`session_id`), models `<synthetic>` / fable-5 / opus-5 / sonnet-5 / opus-4-8 / haiku-4-5, dated 07-14 → 08-22 (the day Block 1 killed the writer). **The company has never written a row here** — 0 with a task, 0 with an agent, 0 in any other department, 0 from any other source | 950 + up to 662 | **1,612 — the whole table** | moves whole; the plan's two-part rule is redundant and would have moved exactly the same rows |
   | `memory_index` · `memory_embeddings` | **already gone, on his own order.** *"şirketin hafızasını tamamen temizle sıfır"* — 15,773 + 37 rows exported to `~/backups/dxb/memory_*-before-ceo-wipe-2026-08-23.sql` and deleted the same evening (commit `9b65a4ae`, 18:59), together with the hourly `claude-mem-sync` job that fed them | 13,845 | **0 · 0** | **NOTHING TO MOVE.** Block 5 has no work here |
   | `pgboss` | not residue: the **company's own** live queue, and it prunes itself. 22 queues and 14 schedules, all of them the holding's (`chat.drain`, `voice.drain`, `task.worker`, `ceo.briefing.morning`, `revenue.*`, `hr.*`); the job table holds only 2026-08-17 onward because pg-boss deletes its own completed work | 303,136 | **79,178, self-pruning** | **NOTHING TO MOVE.** Moving a self-pruning queue's history would be moving the holding's own record |
   | `project_risks` | 3 rows, all on project *DXB Global OS*. One is the construction chore: *"Approvals brown-token audit deferred by CEO order (2026-07-14)"*, severity low, **still `open` on his risk page**. The other two are closed business risks (workforce activation, cost-intelligence surface) | 1 | **1 of 3** | moves — it is the only row in the group |
   | `decision_log` | **NEW — the plan never named it.** 1,143 of 4,730 rows were decided by a test-shaped worker that never existed in the holding: `worker-lad-*`, `worker-hard-1..5`, `worker-dep-1/2`, `worker-e2e-1`, `worker-fail-1`, `worker-orch-qa-*`, `r21t-resident` — 19 names, all inside 2026-07-24 → 07-28, all writing *employee-selection* decisions about tasks in projects such as `orch-ladder-a` | — | **1,143 of 4,730** | **HIS DECISION.** It is the construction's rehearsal written into the holding's decision record |
   | `hook_violations` · `audit_log` | **BOUNDARY — nothing moves without his word.** The holding's governance and legal record. For his eye when he rules on it: 1,291 of the 29,637 audit rows carry a construction-shaped actor (`fable-5` 809, `test` 127, `engineering` 127, `tracer` 127, `e125t-test` 66, `engineering-worker` 35), and 1,789 more are the `memory_commit` trail of the diary sync he has already had deleted | 1,963 · 29,636 | **1,963 · 29,637** | untouched until he says otherwise |

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

**ANSWERED, 2026-08-25 — BOTH OF THEM, AND THE ROW GAINED ITS OWN SENTENCE.**
<!-- CEO-OK: b36-block5-residue-and-two-databases-2026-08-25 -->
The two questions that stood here as *"still his"* are spent and are deleted rather than kept beside
the answers (LAW A). He was shown the measured dry-run — not a list to adjudicate, but each group
explained in his language with the author's recommendation on it — and he ruled:

1. **The residue: all three groups move.** `cost_ledger` **1,612** (the whole table; measured to hold
   no company row at all) · `project_risks` **1 of 3** (the brown-token colour audit) · `decision_log`
   **1,143 of 4,730** (the 19 test-shaped workers). Order unchanged: **copy → verify → delete → audit**.
2. **The boundary stays shut.** `audit_log` and `hook_violations` — *"kapalı kalsın"*. Not one row,
   including the 1,291 that carry a construction-shaped actor and the 1,789 `memory_commit` rows.
3. **One write he authorised:** a single retrospective `audit_log` row for the 15,773 memory rows
   deleted on 2026-08-23, which had left no trace in the company's own book.

**AND HE SAID WHAT HE HAD ACTUALLY MEANT ON 2026-08-23 — this is B36 in one sentence, from its owner:**

> *"artık sadece şirket çalışanlarının ve şirketle ilgili herşeyin sadece şirketin veritabanına
> işlesin. Holdingi inşaa ederken yapılanlar da kendi veritabanına yazılsın ikisi tamamen ayrı olsun.
> Şirkette iş yapıldı mı çat kendi veritabanına, holdingin bir parçasımı geliştiriliyor çat inşaat
> veritabanına. Holdingin içinde yapılan geliştirme çalıştımı veya çalışıyor mu diye test edilmesi de
> dahil."*

**EACH THING WRITES TO ITS OWN DATABASE.** The company's employees and everything about the company →
the company's engine. Everything done while BUILDING the holding — **including testing whether a piece
of the holding works** → the construction's engine. His *"şirketin hafızasını tamamen temizle sıfır"*
of 2026-08-23 was never an order that the holding may have no memory: **`memory_index` is free to fill
again with the COMPANY's own memory**, and what is forbidden for ever is the construction writing into
it (held by `tests/b36/company-memory-is-not-a-diary.test.ts`). Any reading of that day's order as
"the holding's memory stays empty" is deleted by this (LAW A). Registered with his words in
`scripts/governance/ceo-approvals.json` → `b36-block5-residue-and-two-databases-2026-08-25`; he
authorised it being written down (*"bunu önemli gördüğün yere de yazabilirsin"*) as his decision, not
as a new standing rule.
