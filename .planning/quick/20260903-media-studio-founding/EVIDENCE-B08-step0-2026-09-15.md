# EVIDENCE — B08 step (0): the activation gate aligned with U30, then the bind (2026-09-15)

**Author:** opus-5 in person (U30), builder session, branch `studio/b43-ferrari-implementation-20260915`.
**His order, verbatim:** *"kapıyı U30'a hizala, sonra bağla ve onay."*
Registered: `scripts/governance/ceo-approvals.json` → `activation-gate-aligned-with-u30-2026-09-15`.
**The ruler for this part** (handed over before the work, the ruler rule):
`.planning/quick/20260903-media-studio-founding/CHECK-W9-B08-2026-09-15.sh`, md5 `e6faab13b0b14828b038c616d5238c0a`.

Every line below is a command and the output that decided it. Nothing here is quoted from memory.

---

## 0. THE BLAST RADIUS, NAMED BEFORE THE CHANGE

What stands on `enforce_persona_gate_on_activation()`:

```
$ docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At -F'|' \
    -c "select tgname, c.relname, pg_get_triggerdef(t.oid) from pg_trigger t
        join pg_class c on c.oid=t.tgrelid where t.tgfoid='enforce_persona_gate_on_activation'::regproc"
trg_agents_activation_gate|agents|CREATE TRIGGER trg_agents_activation_gate BEFORE INSERT OR UPDATE OF employment_status, persona_id ON public.agents FOR EACH ROW EXECUTE FUNCTION enforce_persona_gate_on_activation()
```

Every trigger on `public.agents` (two of the three fire on `persona_id`):

```
$ ... "select tgname, p.proname from pg_trigger t join pg_proc p on p.oid=t.tgfoid
       join pg_class c on c.oid=t.tgrelid where c.relname='agents' and not t.tgisinternal"
trg_agents_activation_gate|enforce_persona_gate_on_activation   BEFORE INSERT OR UPDATE OF employment_status, persona_id
trg_agents_manager_cycle  |fn_org_manager_cycle_guard           BEFORE INSERT OR UPDATE OF manager_id          (not on this path)
trg_agents_persona_passed |enforce_persona_id_passed            BEFORE INSERT OR UPDATE OF persona_id          (quality_gate only — untouched by this work)
```

Every code path that binds a persona:

```
$ grep -rn "persona_id" --include=*.ts --include=*.sh scripts src apps | wc -l
5
scripts/hr-demo-hire.sh:21   UPDATE agents SET persona_id=NULL  ...
scripts/hr-demo-hire.sh:53   UPDATE agents SET persona_id='$PID' ...
scripts/hr-demo-hire.sh:92   UPDATE agents SET persona_id=NULL  ...
apps/dashboard/src/app/api/org/node/route.ts:45,49   READS personas.body_md through detail.persona_id
```

Is there a `fn_`/`control_` door that writes the bind? **No — measured, not assumed:**

```
$ ... "select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and pg_get_functiondef(p.oid) ~* 'SET[[:space:]]+persona_id|persona_id[[:space:]]*='
       and p.prokind='f'"
(empty)
```

`fn_persona_gate` sets `quality_gate` only; `fn_persona_submit` writes a new version row; `scripts/sync-personas-to-db.sh`
contains no `persona_id` at all. **Therefore the bind below is a raw UPDATE, declared as such** (the work order's rule:
"a raw UPDATE only if no door exists, and say so").

The tests that assert the gate:

```
$ grep -rln "activation denied\|enforce_persona_gate" tests
tests/r23/unified-constitution.test.ts
```

Hamza's record (B08 names him):

```
$ ... "select a.slug, a.employment_status, pb.version, pb.author,
        (select max(version) from personas p2 where p2.employee_id=a.id and p2.quality_gate='passed')
       from agents a left join personas pb on pb.id=a.persona_id where a.slug='agents-orchestrator'"
agents-orchestrator | active | 2 | fable-5 | 6     (newest passed author: opus-5)
```

---

## 1. WHAT WAS WRONG — THE FOURTH COPY OF ONE LIST

`EMPLOYEE_PERSONA_STANDARD` §G4-bis (2026-07-27) states the U30 gap "was live in three places at once and all three
were closed in the same turn it was found". A **fourth** carried the same list and was missed: the trigger function,
born with the org family (`20260711002000_org_family.sql`, 2026-07-11). The constraint was widened on 2026-07-28
(`20260728001000_persona_author_u30.sql`); the trigger's copy was not. **The two disagreed for 49 days.**

Before the change, both engines:

```
$ docker exec -i supabase_db_DxB_Global_OS psql ... -c "select md5(pg_get_functiondef('enforce_persona_gate_on_activation'::regproc))"
b21b62c7a5f74a6163dd8eab96f3d592
$ docker exec -i supabase_db_DxB_Build      psql ... (same query)
b21b62c7a5f74a6163dd8eab96f3d592
```

The two lists side by side:

```
trigger:    IF v_gate IS DISTINCT FROM 'passed' OR v_author NOT IN ('fable-5','hr-factory') THEN
constraint: CHECK ((author = ANY (ARRAY['opus-5'::text, 'fable-5'::text, 'hr-factory'::text])))
```

**Why no ruler caught it.** `scripts/sync-personas-to-db.sh --verify` compares the file against the **newest** version:

```
scripts/sync-personas-to-db.sh:96
  db_hash="$(... SELECT md5(body_md) FROM personas WHERE employee_id='$emp_id' ORDER BY version DESC LIMIT 1;)"
```

Not against the **bound** one. The persona ruler and the road check read the `.md` files. So a seat bound to superseded
text, whose file matched the new text, read **PASS on every metre in the house**. The baseline run of this part's ruler
shows exactly that: 9 battery lines, 8 PASS, and Part A red only on what it measures directly.

**What the drift actually cost.** The seat's RUNTIME loads the persona from the FILE:

```
packages/orchestrator/src/worker-shim.ts:288-295
  /** ... file-first: the .md is the source of authorship, `agents.persona_path` names it. */
  const personaBody = await loadPersonaBody(repoRoot, employee.persona_path ?? null);
```

— so the live agent already had the accepted writing. But **the CEO's own employee card** reads the BOUND row:

```
apps/dashboard/src/app/api/org/node/route.ts:44-51
  if (parsed.data.include === "persona" && detail.persona_id) {
    .from("personas").select("body_md").eq("id", detail.persona_id)
```

and the bound row was the old text — measured, one seat:

```
$ ... "select p.version, p.author, length(p.body_md), md5(p.body_md) from personas p join agents a on a.id=p.employee_id
       where a.slug='media-creative-director' and p.version in (16,21) order by p.version"
16 | fable-5 | 27367 | 0404a62bba34f6d752ec9189daea2af8    <- what his page served
21 | opus-5  | 26910 | 270f13e211a41339741af13494a752cb    <- the accepted writing
```

The state of the whole holding before the change:

```
$ ... "select count(*) filter (where a.persona_id is not null) as bound,
        count(*) filter (where ... version <> newest passed version) as behind_newest,
        count(*) filter (where a.employment_status='active') as active from agents a left join personas pb ..."
 bound | behind_newest | active
   213 |            17 |    213
$ ... "select pb.author, count(*) from agents a join personas pb on pb.id=a.persona_id group by 1"
 fable-5 | 213
```

**17 rows behind, and exactly 17 rows in this order's scope** (16 studio seats + Hamza). Nothing else in the holding
was drifting.

---

## 2. THE MIGRATION — ONE FILE, BOTH ENGINES, THE CANONICAL CHAIN

`db/migrations/20260915001000_activation_gate_author_list_u30.sql` replaces the author list inside the function with
the SAME set `personas_author_check` carries. Nothing else moves: the NULL branch, the `quality_gate='passed'`
condition and **both RAISE texts are byte-identical** to the 2026-07-11 body. `CREATE OR REPLACE FUNCTION` keeps the
trigger binding; the trigger is not redefined.

Construction engine first (`tests/construction-engine.ts`, port 54422):

```
$ pnpm construction:schema
[bootstrap] applying 20260915001000_activation_gate_author_list_u30.sql
[bootstrap] done — applied 1, skipped 164, ledger total 165
```

The gate test green on it before the company was touched:

```
$ pnpm exec vitest run tests/r23/unified-constitution.test.ts
 ✓ tests/r23/unified-constitution.test.ts (4 tests) 188ms
      Tests  4 passed (4)
```

Then the company engine (`127.0.0.1:54322`) through the same script:

```
$ DXB_DATABASE_URL=postgresql://...54322/postgres DXB_PSQL='docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres' \
  DXB_PSQL_ADMIN='docker exec -i supabase_db_DxB_Global_OS psql -U supabase_admin -d postgres' bash scripts/bootstrap-db.sh
[bootstrap] applying 20260915001000_activation_gate_author_list_u30.sql
[bootstrap] done — applied 1, skipped 164, ledger total 165
```

`pg_get_functiondef` on both AFTER the change — the decisive line and the two md5s:

```
    IF v_gate IS DISTINCT FROM 'passed' OR v_author NOT IN ('opus-5','fable-5','hr-factory') THEN

company md5      = 0474830ef879abb6f5ac60d0d53aa77a
construction md5 = 0474830ef879abb6f5ac60d0d53aa77a
```

### ROLLBACK

The previous body, taken verbatim from `pg_get_functiondef` on BOTH engines BEFORE the change (md5
`b21b62c7a5f74a6163dd8eab96f3d592`). It is also pasted as a comment block inside the migration itself:

```sql
CREATE OR REPLACE FUNCTION public.enforce_persona_gate_on_activation()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_gate text;
  v_author text;
BEGIN
  IF NEW.employment_status = 'active' THEN
    IF NEW.persona_id IS NULL THEN
      RAISE EXCEPTION 'activation denied: agent % has no persona (v2 persona with passed quality gate required)', NEW.id;
    END IF;
    SELECT quality_gate, author INTO v_gate, v_author
      FROM public.personas WHERE id = NEW.persona_id;
    IF v_gate IS DISTINCT FROM 'passed' OR v_author NOT IN ('fable-5','hr-factory') THEN
      RAISE EXCEPTION 'activation denied: persona % has quality_gate=%, author=% (need passed + v2 author)',
        NEW.persona_id, v_gate, v_author;
    END IF;
  END IF;
  RETURN NEW;
END $$;
```

**A rollback of the function alone is not safe once the seats are bound.** Any agent bound to an `opus-5` persona would
fail its next activation-touching UPDATE. The order of a rollback is: re-bind those 17 rows to their newest `fable-5`
passed version FIRST, then replace the function. Written here so a later session does not learn it the hard way.

---

## 3. THE BIND — 17 ROWS, ONE TRANSACTION, A DECLARED RAW UPDATE

No door exists (§0). One transaction, `BEGIN … COMMIT`, `RETURNING` printed:

```
$ docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -v ON_ERROR_STOP=1 <<'SQL'
BEGIN; WITH target AS (... newest quality_gate='passed' per seat ...), moved AS (UPDATE public.agents ... RETURNING ...)
SELECT slug, old, new FROM moved ORDER BY slug; COMMIT;
SQL

                slug                 |     was      |     now
 agents-orchestrator                 | 2 (fable-5)  | 6 (opus-5)
 design-image-prompt-engineer        | 8 (fable-5)  | 14 (opus-5)
 marketing-short-video-editing-coach | 8 (fable-5)  | 11 (opus-5)
 media-advertising-director          | 10 (fable-5) | 14 (opus-5)
 media-ai-video-engineer             | 6 (fable-5)  | 9 (opus-5)
 media-character-identity            | 11 (fable-5) | 17 (opus-5)
 media-cinematographer               | 6 (fable-5)  | 8 (opus-5)
 media-continuity                    | 4 (fable-5)  | 7 (opus-5)
 media-creative-director             | 16 (fable-5) | 21 (opus-5)
 media-delivery-qc                   | 3 (fable-5)  | 5 (opus-5)
 media-failure-analysis              | 12 (fable-5) | 14 (opus-5)
 media-film-director                 | 13 (fable-5) | 17 (opus-5)
 media-product-brand-consistency     | 11 (fable-5) | 16 (opus-5)
 media-screenwriter                  | 5 (fable-5)  | 9 (opus-5)
 media-sound-music                   | 2 (fable-5)  | 4 (opus-5)
 media-storyboard-previz             | 11 (fable-5) | 18 (opus-5)
 media-vfx-post                      | 4 (fable-5)  | 7 (opus-5)
(17 rows)
COMMIT
```

The gate accepted an `opus-5` author — that acceptance IS the proof the migration did its work; before it, the same
statement returned `activation denied: persona ... author=opus-5 (need passed + v2 author)`.

Hamza was bound only after his file and his record were proved equal — `--verify` compares file ↔ newest version, and
his row is in the 213 that MATCH:

```
$ DXB_PERSONA_AUTHOR=fable-5 bash scripts/sync-personas-to-db.sh --verify | grep orchestrator
MATCH agents-orchestrator — DB↔dosya gövde eş (md5 6ce115f40198b2f0cfd9fca4d9f8a6fc)
```

---

## 4. THE DEPENDANTS, RE-MEASURED AFTER THE CHANGE

| What stands on it | Command | Decisive output |
|---|---|---|
| The 16 seats vs newest passed | SELECT mismatch count | **0** |
| The 16 seats' bound author | SELECT author, count | **opus-5 x 16** |
| The whole holding | SELECT bound / behind / active | **213 · 0 · 213** |
| File ↔ DB | `sync-personas-to-db.sh --verify` | `match: 213 · diff: 0 · skip: 0 · fail: 0` · **VERIFY: PASS** |
| Persona writing | `scripts/persona-ruler.sh` | **RULER: 16/16 PASS** · §12 canon `0195b993` · law canon `578bf86a` |
| Road + delivery | `vitest run tests/b43/road-consistency tests/r31/persona-delivery` | **20 passed (20)** |
| The wider battery | `vitest run tests/b43 tests/r31 tests/b39 tests/personas tests/r23` | **15 files, 133 passed (133)** |
| Types | `pnpm typecheck` | `tsc --build`, clean, no error line |
| Records | `node scripts/governance/ledger-truth.mjs` | `ledger truth OK: … 228 CEO approval claims each backed …` |
| Both locales | `scripts/i18n-purity-check.sh` | `dictionary parity: en 2395 = tr 2395` · **I18N PURITY: PASS** |
| The resident services | `systemctl --user list-units 'dxb-*'` | 8 services `active running`, 2 timers waiting |
| Work in flight | SELECT status, count FROM tasks WHERE status IN (running, claimed, queued) | **(0 rows)** |

**No restart was performed and none was needed.** The change lives in the database catalogue; the worker reads the
persona from the file at spawn and the gate from the catalogue at write time. In-flight = 0 was measured anyway, so a
restart would have been safe had one been required.

**⚠ Do not generalise that sentence.** It is true of THIS change and was false of W9 the same afternoon: a change to
COMPILED CODE that a resident daemon holds in memory is not delivered until that daemon restarts, and W9's first
commit shipped overlay files the five-hour-old scheduler had silently rewritten two minutes earlier. The two cases
look alike from outside and are not alike — see `EVIDENCE-W9-2026-09-15.md` § 3 correction.

---

## 5. THE PERMANENT GATE AGAINST A FIFTH COPY

The defect class is "one rule, two hand-written copies, no metre comparing them". The migration closes today's
instance; `tests/personas/activation-gate-author-list.test.ts` closes the class: it reads BOTH lists out of the live
catalogue and fails the moment either side moves alone.

```
$ pnpm exec vitest run tests/personas/activation-gate-author-list.test.ts
 ✓ tests/personas/activation-gate-author-list.test.ts (3 tests) 14ms
      Tests  3 passed (3)
```

**A gate is not a gate until it is seen to close.** The old body was restored on the CONSTRUCTION engine only, the test
re-run, and then the canonical chain put the migration back:

```
$ docker exec -i supabase_db_DxB_Build psql ... <old body>
REVERTED-ON-CONSTRUCTION md5=b21b62c7a5f74a6163dd8eab96f3d592
$ pnpm exec vitest run tests/personas/activation-gate-author-list.test.ts
   × the trigger function's author list equals personas_author_check's
     → expected [ 'fable-5', 'hr-factory' ] to deeply equal [ 'fable-5', 'hr-factory', 'opus-5' ]
   × the list is the U30 set — Opus 5 and Fable 5 are equal authors (CEO 2026-07-26)
     → expected [ 'fable-5', 'hr-factory' ] to deeply equal [ 'fable-5', 'hr-factory', 'opus-5' ]
   ✓ the gate still refuses an unauthorized author and a persona that never passed
      Tests  2 failed | 1 passed (3)

$ ... DELETE FROM supabase_migrations.schema_migrations WHERE version='20260915001000'   → DELETE 1
$ pnpm construction:schema
[bootstrap] applying 20260915001000_activation_gate_author_list_u30.sql
[bootstrap] done — applied 1, skipped 164, ledger total 165
construction = 0474830ef879abb6f5ac60d0d53aa77a
company      = 0474830ef879abb6f5ac60d0d53aa77a
      Tests  3 passed (3)
```

That replay also proves the migration is safely re-runnable through the canonical chain.

---

## 6. THE RECORDS BROUGHT TO THE TRUTH

- `EMPLOYEE_PERSONA_STANDARD.md` — **§G4-ter** written (the fourth copy, what it cost, how it was closed, the gate);
  §G4-bis corrected in place: it said the gap was live in three places and all three were closed, and a fourth existed.
- `DATA_MODEL.md` — `personas.author` carried the pre-U30 list `('fable-5','hr-factory')` since 2026-07-28. The founding
  DDL line stays as written; the registered adaptation is written beneath it naming both enforcers and the test.
- `00-BOARD-OPEN-WORK.md` row **B08** — step (0) marked BUILT with its evidence and the `CEO-OK` marker; **steps (1)–(7)
  stay parked**, his sentence covered step (0) only.
- `.planning/STATE.md` — the live block gains this work; and the stale sentence that claimed the 16 seats had been
  "bound at their latest passed version" on 2026-09-14 is corrected in place with today's measurement (not one of those
  16 versions was the latest).
- `scripts/governance/ceo-approvals.json` — `activation-gate-aligned-with-u30-2026-09-15`, his words verbatim.

---

## 7. WHAT THIS PART DID NOT DO

- No persona text was changed; no version was re-authored; no historical row was relabelled (U20 boundary).
- No brain switch, no per-employee model control, no add-model drawer — **B08 steps (1)–(7) are untouched and parked.**
- The 196 non-studio holding seats were not re-bound; measured, none of them was behind.
- No money out, no outward message, no identity step.
- No merge to master.

## 8. ⚠ UNVERIFIED — what a terminal cannot observe

- **Whether the CEO's employee-card page now renders the newer persona text to his eye.** The data path is measured
  (the card reads `personas.body_md` through `agents.persona_id`; that row is now v21 and not v16), but a RULE #0 eye
  pass in the real browser was not run in this part — no `DXB_E2E_STATE` exists in an author session and automated
  login is forbidden (board row B03-bis). Requires human-eye confirmation.
