# B85 — stage 0, piece 6c: what a build changes outside `os` — the contract

The lead's contract for the last part of BUILD.md §6 piece 6 (2026-11-24). 6a made the snapshot — what the database
*is*, inside the covered schemas and wherever a chain role is named; 6b proved that an upgraded database equals a
clean one and keeps its rows. **6c** (this file) is the proof BUILD.md asks for in the words "every change the chain
makes to an object outside `os`": a whole reading of the catalogue, and of what the platform's tables hold, before
and after a build on one instance, and the difference compared with a committed, hand-written text.
Marks: **[lead]** a decision of the lead's inside the cut; everything under §3 is measured.
6a's contract (`piece-6/SPEC.md`) and 6b's (`piece-6b/SPEC.md`) stand whole and are not repeated.

## 1. What the piece leaves standing

- **The inventory** — `inventoryOf(target)` in `@dxb-foundation/chain`: one text with a line for every row of every
  catalogue of the server, the owner and each ACL item of whatever has one, and what every table and sequence
  outside the covered schemas holds — each line marked `in` or `out` by 6a's own two sets.
- **The outside text** — the pure `outsideOf(before, after)`: what differs between two inventories of one instance
  among the lines marked `out`, said without a digest or an oid: a text a hand can write.
- **Its commands** — `pnpm foundation:chain inventory` prints an inventory; `pnpm foundation:chain outside --before
  <file>` prints the outside text against an earlier inventory; `… --check <file>` compares it with a committed
  text and says `OUTSIDE_EQUAL` or names every line that differs.
- **Three committed expected texts**, written by hand before the code exists: the real chain's
  (`foundation/tests/outside/expected/real.outside.txt` — today its first line alone: the real chain changes nothing
  outside), the fixture chain's, and one for a fixture file that does each thing 6a left to this piece by name.
- **The proofs:** a build of the real chain from nothing changes nothing outside; the fixture chain changes what
  its text says and nothing else — nothing it makes inside `os` is a line; an upgrade that changes only `os` adds
  no line; and the proofs go red: an act outside that the text does not hold turns the check red and names its line.

Not in this piece: the bench command that runs it on every run (13); the snapshot's lines for a kind a later piece
first makes outside `os` (that piece's contract — 6a's rule stands).

## 2. The carry list (PLAN.md §2 K) — read once, by 6a (its §2)

The old system's `scripts/schema-inventory-diff.sh` compared two live servers by md5 and `scripts/backup/inventory.sql`
listed objects; neither read before and after an act. Carried as rules here: the difference is printed line by line
(§5); no hash stands in a committed text (§4.3) — a digest lives only in the inventory, which is never committed;
an instrument is seen red in the same run before its green counts (§6 B); what is left out is left out by a written
rule with its reason (§4.1). Nothing else of the old inventory is carried.

## 3. Measured facts (PostgreSQL 17.6, the foundation's bench, 2026-11-23/24) — not to be re-litigated

Raw output: `piece-6c/evidence/` and, on the disk only, the helper's folder named in `measure-brief.txt`. The probes
are `evidence/inventory2.cjs` (6a's probe with keys for the catalogues it skipped) and `evidence/rows.cjs`.

1. **An idle fresh instance does not change by itself:** the catalogue (34,699 lines) and the rows of all 116
   tables outside `pg_catalog` were byte-identical at +1.5, +5 and +9 minutes, though the platform's realtime
   service holds seven sessions on this database and the `pg_cron` and `pg_net` workers run.
2. **The installer reads everything:** all 64 relations of `pg_catalog`, `pg_authid.rolpassword`, `pg_statistic`
   and `pg_largeobject` among them, and — it has `bypassrls` — every row of every table. A whole reading of the
   catalogue takes about 400 ms, `pg_depend` (7,051 rows) 40 ms of it; the rows of every table 31 ms.
3. **Identity.** `pg_identify_object` answered for every row (no NULL). Two kinds of name carry an oid and differ
   between instances: a toast relation's (`pg_toast.pg_toast_<oid>`, its index, their columns — 2,340 lines) and an
   internal trigger's (`RI_ConstraintTrigger_a_<oid>` — 920 lines); a large object's only name is its oid. With
   those numbers masked, two fresh instances give the same identities. `pg_depend` holds whole rows twice (17
   pairs): a difference must count lines, not hold them as a set. `|` stands in operators' names.
   `pg_identify_object` refuses the class `pg_largeobject_metadata`; a large object is identified by the class
   `pg_largeobject`.
4. **What an act writes** (`evidence/measure-m4.md`, one difference per act): a comment — one `pg_description`
   row; a publication — `pg_publication`, a table added to one — `pg_publication_rel` and two `pg_depend` rows; an
   event trigger — `pg_proc`, `pg_event_trigger`, three `pg_depend` rows; a grant — only the object's ACL; a role
   — `pg_authid` **and a membership nobody wrote** (`<role>` granted to the installer by `supabase_admin`); a
   table — its relation, its index, its toast relation and index, two types, every column and six system columns
   of each relation, its constraint, eight `pg_depend` rows; a setting — the `pg_db_role_setting` row of that role
   and database, changed; a column added — one `pg_attribute` row and the table's own row (`relnatts`); an index
   on a table that had one — no change to the table's row; `vacuum analyze` — nothing but statistics.
   **Extension membership and a sequence's owner stand in `pg_depend` alone.**
5. **Rows are written with no catalogue line:** `vault.create_secret` and an insert into `realtime.messages`
   changed only the tables' rows; `nextval` of a platform sequence changed nothing either probe read. A build of
   the real chain changed the rows of no table but its own ledger.
6. **What the installer may do outside** — and so what a file of the chain could: comment on `public`; make a
   publication and add a table to `supabase_realtime`; make an event trigger; grant on a platform schema to PUBLIC;
   **grant `select` on `auth.users` to `anon`**; make a role, a schema, a database; set a platform role's and the
   database's settings; write a vault secret and a realtime message; make an extension (owned by `supabase_admin`,
   not by the installer); make a large object. Refused to it: a comment on a table it does not own, the password
   of a reserved role (`authenticator`), `alter system`, `alter extension … add/drop` on an extension it does not own.
7. **The real chain's own build** is 78 lines of the probe, every one of the chain's roles, their memberships,
   `os`, `os_chain`, the ledger (with its toast relation, owned by the installer and named by an oid) and
   `os_owner`'s two default-privilege rows. Nothing else.
8. **The day's turn changes nothing** (`evidence/measure-m6-midnight.out`): one fresh instance with the real chain,
   read at 23:32, 23:50 and 23:58 UTC and at 00:01, 00:05 and 00:15 — 34,777 lines each time, no catalogue line and
   no table's rows differing between any two readings, 43 minutes idle. The platform's date-named partitions
   (`realtime.messages_2026_11_22 … _26`, 6b §9) are made when the instance is made, not when the day turns; no
   rule about them is written. Not measured: an instance left standing for days.

## 4. The inventory and the outside text

### 4.1 What is read, and what `in` and `out` mean **[lead]**

**Every catalogue of the server is read** — each relation of kind `r` in `pg_catalog` — but five, left out by
name with the reason: `pg_statistic` and `pg_statistic_ext_data` (the planner's statistics: they move with every
`analyze`); `pg_largeobject` (a large object's bytes; that one stands is `pg_largeobject_metadata`'s row);
`pg_subscription_rel` (a subscription's running state); `pg_shdepend` (it restates what is read where it stands:
an owner, an ACL item, a policy's roles, a tablespace, initial privileges). A catalogue with an `oid` column is
read as objects of it, each `out` unless its object stands in a covered schema — the side on which a row is
compared; **a catalogue without one that is given no reading by name fails the call** (§10.2, B1).

**No line is given to:** anything of a session's temporary schema, that schema itself included (6a's rule and
its one spelling, `inATemporarySchema`); a toast relation, its index, their columns, and a `pg_depend` row with a
toast relation at either end — a toast relation is its table's storage, has no name of its own to write down
(fact 3), and its options are storage, which 6a does not read either.

**`in`** is what 6a's snapshot and 6b's rows already hold whole; **`out`** is everything else. A line is `in`
when what its row belongs to — the table below — **stands in a covered schema or is one of the chain's roles**:
6a §4.1's two sets, computed once per reading by the snapshot's own `coveredBy`, the schema of an object by the
snapshot's own `placeOf`. No second rule is written.

| The row | belongs to |
|---|---|
| of a catalogue whose rows are objects (it has an `oid` column) | that object's schema, as `placeOf` reads it — a policy, trigger, rule or default where its relation is, an extension where its schema is; an object that stands in no schema (a database, a tablespace, a language, a cast, an event trigger, a publication, a foreign-data wrapper or server, an access method, a transform, a parameter, a large object, a replication origin) is `out` |
| `pg_attribute`, `pg_index`, `pg_sequence`, `pg_partitioned_table`, `pg_foreign_table` | their relation's schema |
| `pg_inherits` — **`in` only when the child and the parent both are** (§10.1): a table of `os` made a child or a partition of a table outside changes what that table answers | both |
| `pg_enum`, `pg_range` · `pg_aggregate` · `pg_amop`, `pg_amproc` · `pg_ts_config_map` | their type's · their function's · their operator family's · their configuration's schema |
| `pg_description`, `pg_seclabel`, `pg_init_privs` · `pg_depend` | where the object they speak of is · where the *dependent* object is |
| `pg_publication_rel`, `pg_publication_namespace` · `pg_user_mapping` | `out`: a publication stands in no schema · `out` |
| `pg_authid`, `pg_shdescription`, `pg_shseclabel` | the role itself; of anything else shared, `out` |
| `pg_auth_members` | `in` when either role is the chain's (the snapshot's `member` line holds it whole) |
| `pg_db_role_setting` | its role; a row for all roles is `out` |
| `pg_default_acl` | `in` when its role is the chain's or its schema is covered |

So a grant to a chain role on a platform object, a policy on a platform table that names one, a table of `os`
added to a publication and a setting of the database are `out` — lines of the outside text — though the snapshot
shows the first three too. **Said twice, hidden never:** the outside text is everything a build did to what is
not `os`, not "what the snapshot cannot see"; a subtraction of what the snapshot holds would be a second reader of
its grammar, and a place for a hole.

### 4.2 The inventory's form and lines **[lead]**

The snapshot's form (6a §4.2) with its own first line, `inventory-format 1`: every other line stands alone, the
lines are sorted by their UTF-8 bytes with equal lines kept, the same escapes. It is read as the snapshot is (6a
§4.4, through `readAsTheSnapshotIs`): one guarded connection, one `repeatable read, read only` transaction, the
same ten settings, as whoever the target logs in. **A text is whole or there is none:** a read the server
refuses, an identity it answers NULL, a table the session may not read — each fails the call.

| Line | For |
|---|---|
| `read <catalogue> <n>` · `left-out <catalogue>` | each catalogue read, with the number of `row` lines it gave · each of the five |
| `row <in\|out> <catalogue> <digest> <identity>` | each row of each catalogue read |
| `owner <in\|out> <catalogue> <identity> is <role>` | each row that has an owner: the catalogue's column of type `oid` whose name ends in `owner`, and `pg_database.datdba` |
| `acl <in\|out> <catalogue> <identity> has <item>` | each item of the row's ACL, as the server prints an `aclitem`. **Effective, as 6a reads it (its fact 3):** the stored items, or when the ACL is NULL the owner's default (`acldefault`) — for a relation of kind `r p v m f` and a sequence, a function, a schema, a database, a type that is neither an array nor a relation's row type, a language, a foreign-data wrapper, a server, a tablespace, a parameter, a large object. A NULL ACL of anything else (a column, an index, a default-privilege row) has no line |
| `held out <rows\|position> <digest> <regclass>` | `rows`: each ordinary table (kind `r`, a partition is one; read `only`) that stands in no covered schema, nor in `pg_catalog` or `information_schema` — the digest is of the number of its rows and of every row as the server prints it, and does not depend on their order. `position`: each sequence outside the covered schemas — the digest is of its `last_value` and `is_called` |

- **`<identity>`** is `<type> <identity>` of `pg_identify_object` for the row's own object (catalogue, `oid`, 0).
  Where the row has no `oid` it is the identity of what it belongs to, with what tells the row apart: a column by
  `(pg_class, attrelid, attnum)` — system columns are rows too; an index's, a sequence's, a partitioned or foreign
  table's row by its relation; an aggregate by its function; a range by its type; an enum label as `<its type's
  identity> label <quote_literal>`; a comment, a security label and initial privileges by the object spoken of
  (`classoid, objoid, objsubid`); `pg_inherits` as `<child> inherits <parent> <inhseqno>`; `pg_depend` as
  `<dependent> -> <referenced> <deptype>`; `pg_db_role_setting` as `setting for <role|*> in <database|*>`;
  `pg_ts_config_map` as `<configuration> token <maptokentype> <mapseqno>`; a large object by the class
  `pg_largeobject`. **An internal trigger** (`tgisinternal`) is never spelled by its generated name: it is
  `internal trigger on <regclass> of <its constraint's identity|-> calling <regprocedure>`, as a row and as an end
  of a `pg_depend` line. What this leaves unsaid for a catalogue the bench holds no row of, the code settles and
  the tests pin (§6a).
- **`<digest>`** is the SHA-256, in hex, of the row as the server prints it: every column, by name, as text —
  oids as they are, for both readings are of one instance. Left out, by name: the owner and ACL columns (they are
  lines); every column of type `xid`, `xid8`, `cid`, `tid` or `pg_lsn`; what `vacuum`, `analyze` and a rewrite
  move — `reltuples`, `relpages`, `relallvisible`, `relallfrozen`, `relfilenode`, `relrewrite`; and the hints the
  server sets and clears lazily, each restating rows that are read themselves — `relhasindex`, `relhasrules`,
  `relhastriggers`, `relhassubclass`, `dathasloginevt`.
- **No secret enters a digest that a guess could open:** `rolpassword` enters as itself when it is a SCRAM
  verifier (its own salt is in it) or nothing when there is none; **a password stored in any other form fails the
  call**, the role named and the verifier not (§10.1 — said `<set>`, a change of it would have been unseen); in `pg_db_role_setting.setconfig` the value
  of a name that holds a dot is `<hidden>` (6a's rule); `umoptions` and `subconninfo` enter as `<set>` or nothing.
  **An inventory is never committed** and never an expected text: it is the bench's instrument, kept beside a run.

### 4.3 The outside text **[lead]**

`outsideOf(before: string, after: string): string`, pure. Both are inventories; a text that is not one's spelling
throws — and **an inventory is whole or it is none** (§10.1): each `read <catalogue> <n>` line counts exactly the
`row` lines of its catalogue, a `row` line has its catalogue's `read` line, and a text with no `read` line is no
inventory, so that a file cut short is refused and never read as rows gone. Its form is the snapshot's with the first line `outside-format 1`. **Only lines marked `out` are read**, in
each text by its own mark — a thing `out` before and `in` after is `removed`, and the converse `added`.

| Line | When |
|---|---|
| `added row <catalogue> <identity>` · `removed row …` · `changed row …` | `row` lines are taken by their key, the catalogue and the identity; the digests under one key are a multiset. The key stands only in `after` · only in `before` · in both with different multisets. One line a key, whatever the number of rows |
| `added held <rows\|position> <regclass>` · `removed held …` · `changed held …` | the same, the key being the word and the relation |
| `added owner <catalogue> <identity> is <role>` · `removed owner …` | `owner` lines as a multiset of whole lines: each line of `after` that no equal line of `before` answers · the converse |
| `added acl <catalogue> <identity> has <item>` · `removed acl …` | the same for `acl` lines — a privilege added to an item that stood is its old item removed and its new one added |

`read` and `left-out` lines are not compared. Two equal inventories give the first line alone.

## 5. The commands and the library

`inventoryOf(target: Target): Promise<string>` and `outsideOf` are exported from `foundation/chain/src/index.ts`;
the code lies under `foundation/chain/src/outside/` and reuses the snapshot's session, its covered sets, `placeOf`
and its text's form and difference — one place sets the session, one computes what is covered.

| `pnpm foundation:chain …` | stdout | exit |
|---|---|---|
| `inventory` | the inventory, byte for byte, and nothing else | 0 |
| `outside --before <file>` | the outside text of (the file, the database now), and nothing else | 0 |
| `outside --before <file> --check <file>`, the bytes equal | `OUTSIDE_EQUAL lines=<n>` (the text's lines, its first among them) | 0 |
| …, they differ | every line only in the file as `- <line>`, every line only in the database as `+ <line>`, sorted as 6a §5 sorts them, then `OUTSIDE_RED expected_only=<a> database_only=<b>` | 1 |
| the `--before` file is absent, no regular file, or cannot be read · is not an inventory's spelling | `OUTSIDE_REFUSED no-before` · `OUTSIDE_REFUSED before-malformed` — before any connection | 2 |
| the `--check` file is absent … · is not an outside text's spelling | `OUTSIDE_REFUSED no-expected` · `OUTSIDE_REFUSED expected-malformed` — before any connection, the `--before` file judged first | 2 |
| the bench's guard refuses the target | `INVENTORY_REFUSED target-<reason>` · `OUTSIDE_REFUSED target-<reason>` | 2 |
| `inventory` with any word · `outside` with any other words (the options in this order, each once) | `usage: cli.ts inventory` · `usage: cli.ts outside --before <file> [--check <file>]` | 2 |

Every other call answers as today. Neither command writes a file. The difference is never cut short.

## 6. The tests — `foundation/tests/outside/`, written before the code

By a hand that will not write the code. The three expected texts are written **by hand** from §4 and checked
against the catalogue with the hand's own queries — never taken from a text the code prints; `evidence/measure-m4.md`
says what each kind of act wrote on this bench. A wrong expected line is corrected at the catalogue, never by
bending the code.

**The fixtures.** The fixture chain is 6a's (`0003-inside.sql`, `0004-outside.sql`) and its revision B is 6b's
(`chain-b`), both by import. This piece adds one file on top of B, **`0006-further-outside.sql`**, as small as the
kinds allow: a comment on a platform schema; a publication, and a table added to the platform's; an event trigger
and its function; a grant to PUBLIC on a platform schema; a grant to a platform role on a platform table; a role
not named `os_…`; a policy `to public` on a table outside; a setting of a platform role; a row written into a
platform table; `nextval` of a platform sequence; and a table outside with a foreign key (its internal triggers)
and a `text` column (its toast relation).

**A — without the bench.** `outsideOf` on inventories written in the case: added, removed and changed for each
kind of line; a key that holds two rows; `in` lines never read; a thing `out` then `in`, and `in` then `out`;
`read` and `left-out` not compared; equal texts; a text that is not an inventory thrown. The command's refusals
and usage lines of §5. The three expected texts obey the outside text's form — green before the code: it judges
the hand.

**B — on a fresh instance, one ordered module.**
1. An inventory obeys its form; its `read` and `left-out` lines name every relation of kind `r` in `pg_catalog`,
   asked of the server by the test itself; no line holds `pg_toast.`, `pg_toast_<digits>`, `pg_temp_` or
   `RI_ConstraintTrigger` (the schema `pg_toast` itself is a row like any schema); read twice with nothing
   between, the two are the same bytes.
2. The inventory of the fresh instance is kept aside. `chain up` on the real chain → `outside --before --check
   expected/real.outside.txt` is `OUTSIDE_EQUAL lines=1`.
3. `chain up --root` the fixture chain → `expected/fixture.outside.txt` is equal: every line `0004` causes, and
   **no line for anything `0003` makes in `os`** — its tables, view, types, collation, sequence, trigger, policies,
   comments, grants and default privileges.
4. The rows of 6b are given and `chain up --root` revision B → the same `expected/fixture.outside.txt` is still
   equal: an upgrade that changes only `os` adds no line.
5. `chain up --root` B with `0006` → `expected/further.outside.txt` is equal.
6. **Red, then green again**, each act done by the test itself and undone: a comment on a platform object; a
   grant on an object whose ACL was NULL, then revoked (the stored ACL differs, the meaning does not — equal
   again); the password of a role that is not the chain's; `disable trigger all` on the table with the foreign
   key (its internal triggers' lines, by their spelled names); a row into a platform table. For each the printed
   difference is written down by hand, whole, in the case.
7. Pinned limits: a dotted setting's value changed alone is not seen; a change made and undone inside one build
   is not seen.

## 6a. What the tests pinned beyond §6

The test hand's readings, read and accepted by the lead (2026-11-24). 114 cases without the bench, 14 ordered steps.

1. An internal trigger's constraint is spelled `<type> <identity>` and its function as `regprocedure` prints it
   under the empty `search_path`: `internal trigger on snap_elsewhere.linked of table constraint linked_probe_fkey
   on snap_elsewhere.linked calling "RI_FKey_check_ins"()`.
2. A membership's identity is the server's own (`role membership membership of role postgres in role further_role`);
   a setting's is `setting for authenticated in *`, with no type word before it.
3. Both `pg_depend` rows of a publication's relation are `out`: their dependent object stands in no schema.
4. `outsideOf` throws also on a line of no named kind and on a mark that is neither `in` nor `out`.
5. `inventory` with no instance standing prints nothing on stdout and does not exit 0 (the failure is thrown on,
   as the snapshot's is).
6. Before the chain a fresh instance has no line marked `in`; `os_chain.ledger` has no `held` line.
7. **A change to what the build itself made is not seen against the fresh inventory** — its key stood only after
   already — so each act of B.6 is checked twice, whole: against an inventory kept after the build (where nothing
   is expected) and against the fresh one (where `further.outside.txt` is). `disable trigger all` is red only
   against the first.
8. B.6's acts: the installer is refused `disable trigger all` on a table with a foreign key (a system trigger), so
   the bench's superuser does it, and gives and takes away the password — of `anon`, which has none on a fresh
   instance; the row goes into `realtime.schema_migrations` and is deleted again.
9. B.7: the dotted setting is set on the fixture's own role; the made-and-undone file is written by the case into
   a temporary root.
10. The expected texts were corrected at the catalogue twice before they were signed: the installer's default
    privileges in `public` give `anon`, `authenticated` and `service_role` `Dxtm` on a new table, not every
    privilege; a new function of the installer's has the stored ACL `postgres=X/postgres` — its global default
    takes PUBLIC's execute away — so it has no `=X` line.

## 6b. What the code settled (read and accepted by the lead)

1. A catalogue with an `oid` column is read as an object of it; the others by the readings §4.2 names; a catalogue
   with neither fails the call. `pg_replication_origin` is `replication origin <quote_ident(roname)>`, always `out`.
2. **Every `aclitem[]` column is the row's ACL** — lines, and out of the digest: `attacl`, `defaclacl` and
   `pg_init_privs.initprivs` too, these three as stored. A large object's ACL is effective (`acldefault('L', …)`).
3. What a row belongs to is `schemaOf` — the snapshot's `placeOf` with §4.1's table on top (an enum label where its
   type is, an operator family's member where its family is, a default-privilege row in its schema; a large object,
   a publication's member and a user mapping in none); `in`/`out` is decided in `markOf` alone, and a place that
   cannot be decided is `out`. `placeOf` itself is unchanged: the snapshot asks it of other kinds.
4. A `pg_depend` row with a toast relation or a temporary schema at either end has no line; `pg_inherits` and
   `pg_ts_config_map` spell their relations and configuration as `<type> <identity>`.
5. The digests: a catalogue row's is the SHA-256 of `array[<name>, <value as text>, …]::text` in column order; a
   table's is of `<count> <each row's own SHA-256, sorted under "C", joined by a space>`, each row `(t.*)::text`;
   a sequence's of `<last_value> <t|f>`. In `setconfig` the items keep their order.
6. `--check` judges the expected file's line kinds too: a line of no kind is `expected-malformed`.
7. The snapshot's own code moved in three places and prints what it printed (its 107 cases are green): the dotted
   setting's rule is one function both readers use (`settingSaid`), the effective ACL of a catalogue's row is asked
   of the snapshot's holders (`effectiveAclOf`), and `redLines` takes the verdict's word.

## 7. The lock, and the real chain's own proof **[lead]**

**What a line in `real.outside.txt` costs (after the audit, A1).** A locked case holds that text to its first line
alone, so the first piece that changes anything outside `os` must change that case in a lock commit. In that same
commit it adds, for each line it accepts, a case that reads the thing's final state by a query of its own — the
row's content, the function's body, the table's rows — or its lines in the snapshot; a line without its case is
not accepted. The bench command (13) runs those cases beside the check.

The tests and the three expected texts go in with piece 6's lock made again over three directories —
`pnpm foundation:lock piece-6 foundation/tests/snapshot foundation/tests/upgrade foundation/tests/outside` — in a
commit that holds nothing else. No new lock name, no new `foundation:*` script, no change to the lock tool.

**A later piece whose file changes anything outside `os`** commits its line in `real.outside.txt` in the same lock
commit as its expected snapshot (6a §7) — and a `changed row` line says *that* a thing was touched, not how: 6a's
rule stands, the piece gives that kind its lines in the snapshot first, and an object of the chain's outside `os`
gets a schema `os_owner` owns, where it is `in`.

**The real chain's upgrade** (6b §7), run by the lead by hand until the bench command (13) runs it: the inventory
of the fresh instance is kept before `chain up --root <the chain at from.txt>`; after the upgrade
`outside --before … --check real.outside.txt` is `OUTSIDE_EQUAL` beside `SNAPSHOT_EQUAL` and `ROWS_KEPT`.

## 10. The blind audit and its corrections (GPT-6.2 Sol, xhigh, one pass, 2026-11-24 — `SOL.md`; the lead's weighing)

Verdict: REFUTED — 8 blocking (A1–A8), 6 must-fix (B1–B6), one older (C1). It found the real chain's proof sound
as far as it reaches and the instrument wanting in what it can be made to pass over. Each finding weighed against
what the piece is for; there is no second round.

### 10.1 Taken — tests first, then the code

| # | Finding | Correction |
|---|---|---|
| 1 | **A2** a table of `os` made a child (or a partition) of a table outside changes what the outside table answers, and no line said so: `pg_inherits` was marked by its child alone | `pg_inherits` is `in` only when both ends are (§4.1) |
| 2 | **A5** a password stored in another form than SCRAM entered as `<set>`: one such password changed for another was unseen | such a password fails the call, the role named (§4.2) |
| 3 | **A7** a table's rows were printed by `(t.*)::text`, which takes a cast its owner defined: rows could print alike after a change, and a function of the owner's ran in the reader's session | a row is printed by the server's own output of a record (`record_out`), which asks no cast |
| 4 | **A8** an inventory cut short at a line's end was taken whole: rows it no longer held read as never there, and a row dropped by the build passed | an inventory is whole or none (§4.3); the command refuses one as `before-malformed` |
| 5 | **A6**, its second half: a read the server refuses was thrown with the server's own detail, which can carry a row's value | a refused read of the inventory says the relation and the SQLSTATE, nothing of the server's text |
| 6 | **B4** B.1 counted the catalogue's rows from the product's own lines | B.1 counts five catalogues by the test's own queries |
| 7 | **A3**, **B5** a role `os_…` standing before the chain; the real chain's run did not hold its last answer to exit 1 | §7's run stops when the fresh inventory holds a line marked `in`, and when the red control is not red (the script; §9) |

### 10.2 Not taken — each with its reason, and named in §9 where it is a limit

- **A1** (a line stands for whatever is done to its thing). True, and of the design: a text a hand can write holds
  no digest. Not closed by code — closed by what a line costs (§7): the real text is empty, a locked case holds it
  empty, and the piece that first adds a line adds the case that reads that thing's final state. §9 now says it
  of `added` and `held` too. The auditor's two counter-examples cannot be red against a fresh inventory in any
  text without a digest; they are red against the empty text, which is where the real chain stands.
- **A4** (a date-named partition in a line). It fails red, not green; §9.
- **A6**, its first half (a digest a guess could open). The inventory lives where the bench's login file lives and
  the bench holds no secret of the company; a keyed digest needs a key kept between two processes, which is a
  store of its own — stage 5's decision, written as a condition in §9.
- **B1** (an unknown catalogue with an `oid` column is read by itself). Left: such a row is `out` unless its
  object stands in a covered schema — the side that is compared — and a class `pg_identify_object` does not know
  fails the call by itself; §4.1 now says what stands instead of "decided by a person".
- **B2**, **C1** (what leaves no state; a subscription's tables and skipped position). Named in §9.
- **B3** (an expected text holding one key under two verbs; a link; the moment between judging a file and
  reading it). The first can only be red; the others are the snapshot's own command's manner (6a) and a hand that
  already holds the operator's machine.
- **B6** (the verdict's log named for the code commit ran one records commit later — the same tree under
  `foundation/`; the real chain's upgrade applies nothing new and keeps no row). Said in the records as it is; the
  thin proof is 6b's named limit until piece 8 gives the real chain a table.
- Unverified by the auditor and left: a membership granted twice by two grantors has one identity (its two rows
  are a multiset under it); a security label's provider is not in its identity (no provider on the bench);
  `VACUUM FULL` and `CLUSTER` between two readings (`relfilenode` is out of the digest; not run).

### 10.3 What the corrections' cases pinned (read and accepted by the lead)

1. A `read` line counts the `in` and the `out` rows of its catalogue alike. The first line alone is no longer an
   inventory; the smallest whole one holds one `read` line with 0.
2. The md5-form password: `inventory` and `outside` both fail — not exit 0, nothing on stdout, the role named,
   neither the value nor `md5` followed by hex in what is said; `inventoryOf` rejects the same way.
3. The cast: the update needs `replica identity full` on the table first (it stands in the platform's publication,
   which publishes updates); the case shows that `(t.*)::text` prints the owner's constant before and after.
4. The child of a table outside is one line against the inventory kept after the build and against the fresh one.
5. The five catalogues counted by the test's own queries were the server's numbers before any correction.

## 8. Done when

The tests are committed with the lock alone and seen red for the right reason; the code is committed apart;
`pnpm -s foundation:typecheck` is 0; `foundation/tests/outside` is green and the suites of pieces 3–6b are green,
untouched; `pnpm foundation:verify --all --rev HEAD` says `LOCK_GREEN` for pieces 1–6; the lead has run §7's proof
on the real chain and kept its output; one blind audit pass by GPT-6.2 Sol is weighed and its corrections taken
tests-first; BUILD.md's piece 6 carries the Done note of 6c.

## 9. Known limits, said before the build (and after the audit — §10)

- **A line says that and where, not what** (§7; the audit's A1). The inventory holds a digest; the committed text
  holds none — so `changed row`, `added row` and `changed held` each stand for whatever was done to that thing: a
  second row written into a table whose line is expected, another body for a function whose line is expected, pass
  under the line. Only `owner` and `acl` lines say the whole of what they are. An empty text hides nothing — and
  the real chain's is empty; what a line costs is said in §7.
- **A line that names a day:** a row written into one of the platform's date-named partitions gives
  `changed held rows realtime.messages_<date>` — a text that is red on another day, never green over a change
  (A4). A file of the chain does not write there; a piece that must decides that line's spelling first.
- **What leaves no state is not seen:** a notification sent at commit, an advisory lock, a prepared transaction,
  a replication slot, a replication origin's progress, a subscription's skipped position (`pg_lsn`) and which
  tables a subscription holds (`pg_subscription_rel`) — none stands in a catalogue row that is read (B2, C1).
- **An inventory's digests are plain SHA-256** of rows the reader may read: a short unknown value among known
  ones could be guessed from one (A6). So an inventory stays where the bench's own login file stays — the
  operator's machine, a temporary file, never committed, never shown — and **no inventory is taken of a database
  that holds the company's secrets until stage 5 has decided a keyed digest**.
- A role named `os_…` that stood before the chain is read as the chain's (A3): the fresh instance must hold no
  line marked `in` — pinned on the bench by B.1, checked by §7's run, owed by the bench command (13) and stage 5.
- **Net effect only:** what a build does and undoes between the two readings leaves no line.
- **One instance, moments apart.** Two inventories of different instances are not compared (their oids differ);
  what the platform itself does between the readings would be read as the build's — on an idle instance it does
  nothing, measured over nine minutes and across midnight (§3 facts 1 and 8).
- **Not read:** another database of the server; the server's files (`alter system` is refused to the installer —
  fact 6); a large object's bytes; statistics; a toast relation and its options; a subscription's state; the rows
  of a materialized view or a foreign table; the value of a dotted setting, of a user mapping's options and of a
  subscription's connection — their presence is.
- **A large object's identity is its oid:** a file that makes one gives a line that differs between instances.
- **`held` lines say that a table's rows or a sequence's place differ, not which.** They are read by a session
  that may read every table (fact 2); under a role that may not, the call fails — stage 5 decides its own reading.
- The instrument is the bench's: it reads every table whole. It is not a monitor for a live database.
- Kinds the bench holds no row of (foreign-data wrappers, servers, user mappings, subscriptions, transforms,
  security labels, extended statistics) have their rule in §4 and no case.
