# AUDIT RESPONSE 3 — the third audit of Codex Solo 5.6, 2026-08-23

**0 PASS · 2 PARTIAL · 5 FAIL.** The verdict was right, and on the critical finding it was right
about something the previous two audits had not reached: the guard was **fail-open**, and no amount
of care in comparing identities would have changed that, because the shape of the rule was wrong.

Three guards were built here in one day and three audits broke all three. This is the fourth, and
what changed is not the comparison — it is the direction of the question.

| | The rule | How it was broken |
|---|---|---|
| 1 | the two addresses as TEXT | `localhost` and `127.0.0.1` are one machine written two ways — it wrote a real row |
| 2 | the two addresses as `server:port/database` | six spellings connected to the holding while the parser called them a different database |
| 3 | the SERVER's identity, compared with the holding's | a deny rule only knows what it was told to refuse: rebuild the holding and the record stops matching — **fail-open** |
| **4** | **the SERVER's identity, and it must be on an ALLOW list** | a database that is not on the list is refused whatever it is: a rebuilt company, a new cluster, a stranger, a typo, a hang |

Battery: `Test Files 97 passed (97)` · `Tests 731 passed | 15 skipped (746)` · `tsc --build` exit 0 ·
`pnpm verify:ledger` OK · **the company was not written to once**, measured across every schema.

---

## 1 · FAIL → the guard was fail-open on a rebuilt company, and had no deadline

**The auditor:** *"Şirket veritabanı yeniden kurulup kimliği değişirse eski kimlik dosyası şirketi
farklı sanarak yazmaya izin verebilir. Bağlantının cevap vermemesi için süre sınırı da yok."*

Both true. A deny rule cannot protect against an identity it has never seen, and a guard that hangs
never refuses.

**THE RULE IS NOW AN ALLOW LIST.** `tools/hooks/ledger-identity.json` carries the identities the hook
may write into; `scripts/b36/ledger-identity.mjs` takes them from the server and **refuses to put the
holding on the list**:

```
$ DXB_LEDGER_URL=<the company> node scripts/b36/ledger-identity.mjs --allow "…"
REFUSED: 7674907968528752679/5 (postgres) IS the holding's own database.
         It can never be a construction ledger.
```

Four walls now stand, in this order, before any row is written:

1. **never the holding** — even if someone put it on the list;
2. **never a stale record** — a database carrying the holding's recorded name on its cluster under a
   different oid means it was rebuilt, and the hook stops and says so instead of trusting the record;
3. **never anything that is not on the list** — this is the fail-open, closed;
4. **never a hang** — 4 s to connect, 8 s for an answer, and a 20 s watchdog over the whole run.

**The two cases that encode the auditor's own attack:**

```
✓ refuses the company even when the recorded identity no longer matches it
✓ stops and says so when the recorded company identity has gone stale
✓ refuses a database that is real, harmless and simply not on the list
✓ gives up on an address that answers nothing, instead of hanging   (4117ms)
Tests  21 passed (21)
```

The third of those drives the hook at `_supabase` — a real database, not the company, on nobody's
list. A deny-only guard would have written into it. Measured refusal:

```
tag-subscription-call: _supabase (cluster 7674907968528752679, oid 16736)
  is not a permitted construction ledger — refusing to write
```

The deadlines live in `packages/shared/src/db.ts` as two optional variables that are **off unless a
caller asks for them**, so no existing caller's behaviour changed by one millisecond.

And the six address escapes stay closed, re-provable read-only:

```
$ DXB_COMPANY_URL=… node scripts/b36/prove-address-escapes.mjs
ESCAPES THROUGH THE DELETED RULE: 6 of 6 disguises
ALL_ESCAPES_CLOSED
```

---

## 2 · FAIL → the published reconciliation was stale, and the counter counted text

**The auditor:** *"Komut 12 mention / 114 dosya / 126 eşleşme verdi; rapor 11 / 113 / 125 diyor.
Ayrıca sayaç gerçek bağlantı davranışını değil aynı satırdaki düz metni sayıyor."*

Both true, and the first one is my own doing: **the report itself quotes the address**, so writing
the report moved the number the report published. Any total that includes documentation is stale the
moment the next report is written.

**Two changes.**

**(a) The counter reads the CODE.** TypeScript's own parser, four binding shapes, and — the thing a
line rule cannot do — values that arrive through a `const`:

```
$ node scripts/b36/count-company-fallbacks.mjs
EXECUTABLE FALLBACKS (the address really bound to DXB_DATABASE_URL): 97
   tests: 85 · scripts: 8 · db seeds: 3 · apps: 1
   97 bindings inside them
     apps/dashboard/src/app/api/voice/call/route.ts:53   process.env.DXB_DATABASE_URL ??= …
     db/seed/apply-persona-v2.ts:71                      process.env.DXB_DATABASE_URL ?? …
     db/seed/import-personas.ts:84                       process.env.DXB_DATABASE_URL ?? …
     db/seed/import-routing-rules.ts:35                  process.env.DXB_DATABASE_URL ?? …
     scripts/dev/ops-live-collector.mjs:20               process.env.DXB_DATABASE_URL ??= …
     scripts/dev/voice-latency-probe.mjs:13              process.env.DXB_DATABASE_URL ??= …
     scripts/library/enrich.mjs:49                       process.env.DXB_DATABASE_URL ?? …
     scripts/library/intake.mjs:42                       process.env.DXB_DATABASE_URL ?? …
     scripts/library/register-arsenal.mjs:15             process.env.DXB_DATABASE_URL ?? …
     scripts/org/workforce-gate.mjs:12                   process.env.DXB_DATABASE_URL ??= …
     scripts/phase3-lifecycle-battery.mjs:10             process.env.DXB_DATABASE_URL ??= …
     scripts/systemd/install.sh:17                       line rule
```

The parser immediately earned its place: it found a binding the line rule could not see —
`tests/b36/hook-never-writes-company.test.ts:107`, where the value arrives through a const — so the
honest figure is **97, not 96**. **All eight scripts exist**, printed above with their line numbers.

**(b) Documentation is OUT of the arithmetic, and the record can no longer drift.** The counter
prints the markdown and mention lists but keeps them out of any total, and a new case ties the board
to the measurement:

```
$ npx vitest run tests/b36/fallback-count.test.ts
✓ B36 — the board's fallback figure is the counter's figure > matches, file for file and bucket for bucket
```

From now on the board and the counter cannot disagree without the battery going red.

---

## 3 · FAIL → the restore proved counts, not content — and the project's own drill had never been run

**The auditor:** *"'Satır satır aynı' denmiş fakat gerçek çıktı yalnız ROW_COUNTS_IDENTICAL. İçerik
eşitliği kanıtlanmamış. Projenin asıl kurtarma yolu çalıştırılmamış ve 133 hatanın ham kaydı
saklanmamış."*

All three true. Running the project's own chain found something worse than a missing proof.

**THE CANONICAL DRILL COULD NOT RESTORE A DAILY BACKUP AT ALL.** `scripts/restore-db.sh` was written
for a schema-filtered dump; the daily backup (`scripts/backup/laptop-pg-dump.sh:26`) dumps the WHOLE
database. Replayed into a running Supabase image it collided with the platform's own schemas and the
script correctly refused — **426 errors, exit 1**. The raw log is kept:
`drill-logs/restore-drill-whole-dump-FAIL.log`.

Every one of those errors was in Supabase's own schemas (auth · realtime · storage · graphql · vault
· pgbouncer), owned by roles the drill does not run as. `public` restored perfectly beside them.

**The repair, inside the script that owns it:** a scope. `DXB_RESTORE_SCHEMAS` names the schemas the
drill restores, creates them under the role the restore runs as, and says in the drill record what is
outside the scope. Empty (the default) is exactly today's behaviour. Two measured facts are written
into the script where the next person will need them: `pg_restore -n X` does **not** carry the
`CREATE SCHEMA` entry, and a schema created by the admin role leaves the restore role without
`CREATE` on it (67 then 18 failures respectively, each losing everything behind it).

**The drill now passes, on the copy fetched back from Hetzner:**

```
$ DXB_RESTORE_SCHEMAS="public pgboss supabase_migrations" … bash scripts/restore-db.sh
[restore] scope: public pgboss supabase_migrations (schemas outside it are NOT restored by this drill)
[restore] errors: tolerated platform/preamble collisions only
[restore] ACL normalization (grant-hardening parity replay)
[restore] verify (decisive counts)
ledger 124
agents 205
memory_embeddings present: 1
[restore] done in 3s (RTO for this dump size)
   drill exit=0
```

**And the content is proven, not the count:**

```
$ node scripts/b36/prove-restore-content.mjs
live     : 71 tables in public, pgboss, supabase_migrations
restored : 71 tables in public, pgboss, supabase_migrations
tables compared BY CONTENT: 71
CONTENT_IDENTICAL — every table holds the same rows, not merely the same number of them
```

Each row rendered to text, ordered, reduced to one md5 per table. The same number of *different*
rows cannot pass that.

The off-site copy was fetched from the Storage Box again and compared before any of it:
`cf87ca2ddaa81958b6f49e98d76d860ddfd9081365cd94110b40ab39bf9501fa`, `cmp` clean. Both drill logs are
committed under `drill-logs/`. The probe containers and the fetched copy of his data were destroyed.

---

## 4 · FAIL → the write watch saw one schema out of ten

**The auditor:** *"Ölçüm yalnız public bölümündeki 60 tabloyu kapsıyor. Diğer bölümler, numara
üreteçleri, yetkiler ve yapı değişiklikleri kapsam dışı. Son ölçüm dosyası da saklanmamış."*

True on every count. The watch now covers the whole database and four kinds of change, and it
classifies rather than excludes:

```
$ node scripts/b36/company-write-watch.mjs
company           : postgres
HIS OWN schemas   : pgboss · public · supabase_migrations
services in it    : litellm · net
Supabase platform : _realtime · auth · realtime · supabase_functions · vault
objects watched   : 186 tables · 18 sequences · 2616 grants · 1614 structural objects
engine up since   : 2026-08-23 07:49:54.617414+00
statistics reset  : never (counters run from the engine start above)
HIS OWN TABLES, SINCE THAT EPOCH: 0 inserted · 0 updated · 0 deleted (73 tables)
services living in his database: unchanged as well
Supabase's own internals: unchanged as well
COMPANY UNTOUCHED SINCE THE BASELINE — 0 rows, 0 sequences, 0 grants, 0 structure
```

**Rows** (every tuple inserted, updated, deleted, plus the live count) · **sequences** (a number
taken and rolled back still moves one) · **grants** (as a checksum) · **structure** (every table,
view, function, index, policy, constraint and trigger, as a checksum, so a CREATE, DROP or ALTER
shows). **An unknown schema is treated as HIS** — the scope fails closed. Nothing is excluded;
`litellm` and Supabase's internals are measured and named, they are simply not his records.

That output was taken **after the whole 731-test battery ran**, and it is kept:
`drill-logs/company-untouched-after-the-battery.log`.

---

## 5 · FAIL → the freeze-guard case leaked processes

**The auditor:** *"Başarısız tekrarların önceki süreçlerini temizlemiyor ve hata durumunda kesin
temizlik yok."* True — each retry started another decoy and only the last was ever killed.

**Reproduced, three attempts, the deleted cleanup:**

```
attempts started: 671167 671180 671186
after the deleted cleanup (last only): 2 of 3 still running  ← the leak
after the sweep (every created pid) : 0 of 3 still running
```

Every pid the case creates now goes into a list, the list is emptied in a `finally` that no failure
can skip, and the case ends with a **roll call** on the pids it created — not a pattern search, which
was itself a false witness here (`pgrep -f` matches the shell running the check, because that shell's
own command line carries the pattern; it produced one phantom survivor while this was being written).

```
$ npx vitest run tests/ops/freeze-guard.test.ts        (five consecutive runs)
Tests  8 passed (8) · 8 passed (8) · 8 passed (8) · 8 passed (8) · 8 passed (8)
```

---

## 6 · PARTIAL → the built file did not travel with the commit

**The auditor:** *"Çalışan dist dosyası commit'e dahil değil. Başka makinede 2b10a8d1 tek başına
çalışan dosyayı sağlamıyor."* Correct, and it mattered more here than anywhere else in the
repository: Claude Code runs the BUILT hook at the end of every session, so on a machine where nobody
had run `pnpm typecheck` the wall did not exist.

`.gitignore` now carries exactly one exception, with the reason written beside it, and a case holds
it:

```
✓ travels with the repository — the built file is committed
✓ is built from the source that is on disk right now — byte for byte
```

A committed build that drifts from its source would be worse than none, which is why those two cases
stand together.

**And the honest remainder:** `@dxb/shared` is still compiled output that does not travel. On a
machine where nothing has been built the hook no longer dies with a module-resolution stack trace at
the end of the CEO's session — it is loaded late, so the failure is one line and a clean exit:

```
tag-subscription-call: Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@dxb/shared'
hook exit=0
```

Nothing is written in that state, which is the property that matters.

---

## 7 · FAIL → three records still contradicted each other

**The auditor:** *"B36 aynı anda hem 'şirket taşınır' hem 'şirket kalır' diyor; aynı yerde 84 ve 83
test yazıyor. Onay kaydında eski 13.882, board'da 13.919 var. Plan hâlâ Block 0 başlamadan ters
kararın onayını beklediğini söylüyor."*

Every one of them was there. LAW A says the contradicted text is deleted, not annotated:

| Record | Was | Now |
|---|---|---|
| Board row **B36** | decision (1) still read *"the company gets its own Postgres … named `dxb`"* — the direction he reversed before anything was built | written the way he approved it: the construction moves out, project `DxB_Build`; the withdrawn wording is gone, with one sentence saying it was withdrawn and when |
| Board row **B36** | *"83 of them are tests"* beside *"84 tests"* | **85** in both places, and `tests/b36/fallback-count.test.ts` fails the battery if the row and the counter ever disagree again |
| `ceo-approvals.json` | *"13,845 of the holding's 13,882 memory_index rows"* | **13,919** — measured: 13,845 claude-mem + 37 pgvector + 32 obsidian + 5 notebook. The 13,882 was the count of `kind='fact'`, published as if it were the total |
| `PLAN.md` §8 | *"Waiting on the CEO before Block 0 begins — 1. the reversal in §3"*, after he had approved it | §8 is *"What is his, and what he has already answered"*: the reversal is answered, the two gates that are still his are named |
| `PLAN.md` §3 | *"that direction has to be reversed"* — reads as an open question | *"THE COMPANY DOES NOT MOVE. THE CONSTRUCTION MOVES OUT."* His first wording is kept as one sentence of history, explicitly closed |
| `PLAN.md` M8 | 13,882 | 13,919, with the reason the wrong number existed |

```
$ pnpm verify:ledger
ledger truth OK: 8 state claims re-measured, 94 open markers resolved against 66 board rows,
96 trigger lines all accounted for, 17 rules each in exactly one owner,
70 CEO approval claims each backed by a registered approval
```

---

## What is still open

Blocks 2 through 7 of the plan: the construction stack, the read-only window, the **97** fallbacks,
the residue move (his eye on the dry-run list first), and the proof command.

## ⚠ UNVERIFIED — what a terminal here cannot observe

- **Who wrote a row before 2026-08-23 07:49:54Z.** The counters begin at the engine's start; for
  anything earlier there is no per-tuple record. That claim stays withdrawn.
- **A whole-cluster restore.** The drill proves the holding's own schemas — `public`, `pgboss`,
  `supabase_migrations` — restore completely and identically. Supabase's internals are recreated by a
  Supabase stack, and the drill does not attempt them. That is a named boundary, not a silent skip.
- **The Storage Box's copy after this session.** Fetched, hashed, restored and compared during it;
  nothing here watches it afterwards.
