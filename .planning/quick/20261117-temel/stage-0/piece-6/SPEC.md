# B85 — stage 0, piece 6a: the snapshot, "clean", and the proofs that go red — the contract

The lead's contract for the first half of BUILD.md §6 piece 6 (2026-11-23). Piece 6 is cut in two where its parts
stand alone **[lead]**: **6a** (this file) — the snapshot's text, its command, the committed expected texts, the
proof "clean" and the proofs that it can go red; **6b** (its own contract, after this) — "upgraded equals clean" and
the proof of what a build changes outside the snapshot's reach (a whole-catalogue reading before and after a build).
Marks: **[lead]** a decision of the lead's inside the cut; everything under §3 is measured.

## 1. What the piece leaves standing

- **The snapshot** — `snapshotOf(target)` in `@dxb-foundation/chain`: one text that says what the database *is*, read
  from the catalogue, the same bytes for the same meaning on any instance and from any session.
- **Its command** — `pnpm foundation:chain snapshot` prints the text; `pnpm foundation:chain snapshot --check <file>`
  compares it with a committed text and says `SNAPSHOT_EQUAL` or names every line that differs.
- **Two committed expected texts**, written by hand from this contract before the code exists, inside the piece's
  locked directory: the real chain's (`foundation/tests/snapshot/expected/real.snapshot.txt`) and a fixture chain's.
- **The proof "clean":** a new instance, the real chain from nothing, equals the committed text.
- **The proofs that go red:** one body, one policy predicate, one grant, one owner — of `os` and of one object in
  it —, one role attribute, one setting a login gave itself, and one file left out of a copy of the chain: each
  turns the check red and the difference names the line.
- **F4 decided** (§7): the expected texts lie in the piece's subject directory, and the text carries the ledger's
  hashes — so the real chain's schema files come under the lock through it.
- **Where the proof stands before a restored database is believed** (§8; piece 5's audit, A5).

Not in this piece: "upgraded equals clean" and the outside proof (6b); what the logins reach in the old schema (7);
`os_clock` (10 — its schema enters the text by itself when `os_owner` owns it, §4.1); the bench command that runs
all of it (13).

## 2. The carry list — the old system's snapshot and drift contracts, read once (a helper's reading, 2026-11-23)

The old system never compared a build with a committed text and never upgraded a database that held rows. Its
closest ancestor, `scripts/schema-inventory-diff.sh`, compared two live servers by md5 and left out function grants,
schema grants, owners, roles and the global default-privilege rows. What is carried, as rules of this contract:

| Old contract | Verdict | Where it lands |
|---|---|---|
| A NULL ACL means the owner's default and is expanded (`scripts/backup/inventory.sql:86-117`) | kept | §4.3 `grant … default` |
| Global default-privilege rows (schema 0) are read, never joined away (`tests/b36/live-drills.host.test.ts:125-141`) | kept | §4.3 `default-acl … in *` |
| The difference is printed line by line; a hash hides which line (`scripts/b36/schema-parity.mjs:202-210`) | kept | §5 |
| Text, not md5, for bodies and predicates (`schema-inventory-diff.sh:34-37, 59-69`) | rewritten | §4.3 |
| `COLLATE "C"`, no oid in the output (`inventory.sql:47-48`) | kept | §4.2 |
| Sequences' `last_value` and run-time partitions are left out by a written rule (`inventory.sql:44-45`) | kept | §4.3, §9 |
| An instrument is seen red in the same run before its green counts (`scripts/governance/company-untouched.mjs:11-17`) | kept | §6 C |
| Roles as `rolcanlogin` and `member_of` only (`inventory.sql:81-85`) | rewritten | §4.3 `role`, `member` |
| Counts of ledger rows, of tables, of `-- ROLLBACK:` blocks (`scripts/test/db-suite.sh:43-55, 149-162`) | dropped | a count is not content |
| Per-function `has_function_privilege` lists kept by hand (`tests/b64/…`, `tests/e9/…`) | rewritten | the text's `grant` lines show them all |
| "Rows survived" as counts (`scripts/b36/company-state-fingerprint.mjs`) / as row text (`prove-restore-content.mjs:3-8`) | moved | 6b |
| Company-against-repository parity, the reader role's guard, the window's classes | moved | 7 and stage 5 |

Never enforced by the old system and visible from here on: every function's settings (`search_path`) and definer
flag, function grants and owners.

## 3. Measured facts (PostgreSQL 17.6, the foundation's bench, 2026-11-23) — not to be re-litigated

Raw output: `piece-6/evidence/` (the whole-catalogue inventories `inv-*.txt.gz` stay on the disk, out of git).

1. **The text is stable.** The probe's text was byte-identical on two fresh instances at four steps (before the
   chain, the real chain, a fixture in `os`, a fixture outside) and on one instance three minutes apart
   (`q2-r1-vs-r2.out`, `q2-same-instance-later.out`). Oids differ between builds and are never printed.
2. **A session's settings change the catalogue's own text:** `TimeZone`, `DateStyle`, `IntervalStyle`,
   `bytea_output`, `quote_all_identifiers`, `standard_conforming_strings`, and `search_path` when it holds `os`
   (a view then reads `FROM q1p`, a trigger `EXECUTE FUNCTION q1trg()`). `extra_float_digits` changes no deparse; it
   changes a float's own text: at 0 `0.1+0.2` reads `0.3` and does not round-trip, at 1 and 3 it reads
   `0.30000000000000004` and does (`q1-diffs.out`, `q7.out`). The bench's default is 0.
3. **A NULL ACL is the owner's default**; `aclexplode(coalesce(acl, acldefault(kind, owner)))` gives the effective
   items for schema, relation, sequence, function, type and database. Stored ACL items stand in grant order, and
   `proconfig` / `reloptions` as written — both are sorted by the reader (`q4-q6a.out`).
4. **A grant no file says survives the functions pass**, and the chain is green over it (`measure-q4-acl-kept.out`).
5. **`os` owned by another role: the real chain is `CHAIN_GREEN`** — and the probe's text differs in three lines
   (`measure-q4-schema-owner-real-chain.out`). With function files the passes go red. The installer cannot change
   an owner; the bench's superuser, inside the database container, can (`measure-q4-owner.sh` is the way).
6. **A login gives itself settings** (`alter role os_reader set …`, also `in database`), over TCP; the text sees
   them. The text is identical before and after `pnpm foundation:instance logins` (`measure-q5.out`).
7. **`pg_db_role_setting` holds the platform's `app.settings.jwt_secret` for all roles** in `postgres`.
8. **`pg_shdepend` is not a whole enumerator of the outside:** it sees an object one of the roles owns, is granted
   on or is named in a policy of — not memberships, settings, grants to PUBLIC or to a platform role, comments,
   publications, event triggers or new roles. Only a whole-catalogue reading before and after a build is exact
   (about 25,400 lines, 440 ms, no noise between instances once toast names and internal foreign-key triggers are
   left out) — **6b's ground** (`q6c-inventory-diffs.out`).
9. **A trigger's function must exist when its schema file runs**, and the functions pass runs after the schema
   files: a schema file makes the function in a first form and the pass replaces the body (piece 4's rule, met again).
10. **The lock protects every file under a piece's subject directory**, a text file like a test
    (`foundation/lock/src/making.ts:80-88`, read by the lead); a new `foundation:*` script, a new package or a
    change to the lock tool turns every standing lock red; a new directory under `foundation/tests/` and new
    files under `foundation/chain/src/` do not.
11. **Piece 3's locked cases pin the usage line** `usage: cli.ts up [--root <dir>] [--wait <seconds>]`
    (`foundation/tests/chain/cases/the-command.ts:16`).
12. Carried on, not this piece's: `alter role all in database postgres set …` by the installer **crashes the
    server** (signal 11, three times — `q6b-segv.out`); the installer can read `pg_authid`; `LEAKPROOF` is refused
    to the owner and the installer; `supabase_read_only_user` reads the ledger. → piece 7's list and stage 5.

## 4. The text

### 4.1 What it covers **[lead]**

- **The chain's roles:** `os_owner` and every role whose name begins with `os_`.
- **The covered schemas:** `os`, the ledger's schema `os_chain`, and every other schema `os_owner` owns. *Every*
  object in a covered schema is read, whoever owns it — an extension's functions that a login put into `os` are
  lines of the text.
- **What ties a chain role to anything else:** memberships in both directions, settings, default privileges, and
  every object anywhere that one of them owns, is granted on (or granted), or is named in a policy of.
- **The database itself:** its owner and its whole ACL.
- **The code-owned reference values:** the rows of every table in a covered schema whose comment begins
  `vocabulary` (piece 4's mark). A table of his policy is structure only.
- **The ledger's rows:** position, file, kind, hash and runner version — not when or by whom.

### 4.2 Its form **[lead]**

- UTF-8; every line ends with one `\n`; the first line is `snapshot-format 1`; **every other line stands alone** —
  it begins with a kind word and carries everything needed to read it — and the lines after the first are sorted
  ascending by their UTF-8 bytes, equal lines kept. The text is therefore a multiset of lines with one spelling.
- Fields are separated by one space. A line is read by its kind's row in §4.3, not by splitting at spaces: a name
  the server spells with a space (`double precision`, a signature, `operator class`) stands where its field stands;
  a field of free text — a definition, an expression, a line of a body, a row — is the last of its line. An empty
  value is `-`; a boolean is `t` or `f`. Inside a line a backslash is written `\\` and a newline `\n`.
- A text of several lines (a function's body, a view's definition, a comment) is one line of the snapshot per line
  of the text, numbered from `00001`: `<kind> <object> <number>|<the line>`, split at `\n` and nothing else.
- Names are the server's own spelling under an empty `search_path`: `regclass`, `regprocedure`, `format_type`,
  `quote_ident`; a role is `quote_ident(rolname)`, role 0 is `PUBLIC`. No oid, xid, ctid, timestamp of an act, or
  sequence position is printed.

### 4.3 Its lines

`<b>` is `t|f`. "covered" is §4.1's. Where a catalogue function is named, its output is the field, unchanged.

| Line | For |
|---|---|
| `database <name> owner <role> encoding <e> collate <c> ctype <c>` | the database |
| `role <role> super <b> inherit <b> createrole <b> createdb <b> login <b> replication <b> bypassrls <b> connlimit <n> validuntil <text\|->` | each chain role; never the password column, nor whether one is set |
| `member <role> has <member> admin <b> inherit <b> set <b> by <grantor>` | each `pg_auth_members` row with a chain role on either side |
| `role-setting <role\|*> in <database\|*> <name>=<value>` | each setting of each `pg_db_role_setting` row whose role is a chain role or all roles, and whose database is this one or all. **The value of a name that holds a dot is written `<hidden>`** — a core setting holds no secret, a custom one may (fact 7) |
| `schema <schema> owner <role>` | each covered schema |
| `default-acl for <role> in <schema\|*> on <r\|S\|f\|T\|n> to <grantee> <PRIVILEGE> option <b>` | each item of each `pg_default_acl` row whose role is a chain role, whose schema is covered, or that names a chain role |
| `relation <regclass> kind <relkind> owner <role> persistence <p\|u\|t> rowsecurity <b> force <b> replident <c> options <a=b,c=d sorted\|->` | each relation of kind `r p v m S f c` in a covered schema |
| `partition-key <regclass> <pg_get_partkeydef>` · `partition-of <regclass> <parent> <bound>` · `inherits <regclass> <parent> <n>` | where they exist |
| `column <regclass> <position> <name> type <format_type> not-null <b> identity <a\|d\|-> generated <s\|-> collation <name\|-> default <pg_get_expr\|->` | each live column; position is its rank among live columns; collation is `-` unless it differs from its type's own |
| `constraint <regclass> <name> type <contype> deferrable <b> deferred <b> validated <b> def <pg_get_constraintdef>` | each table constraint |
| `index <regclass of the table> valid <b> def <pg_get_indexdef>` | each index |
| `trigger <regclass> <name> enabled <O\|D\|R\|A> def <pg_get_triggerdef>` | each trigger that is not internal |
| `rule <regclass> <name> enabled <c> def <pg_get_ruledef>` | each rule but a view's `_RETURN` |
| `policy <regclass> <name> cmd <r\|a\|w\|d\|*> <permissive\|restrictive> to <roles, sorted, comma>` | each policy |
| `policy-using <regclass> <name> <pg_get_expr>` · `policy-check <regclass> <name> <pg_get_expr>` | each predicate that exists — a line of its own, so one changed predicate is one changed line |
| `view <regclass> <number>\|<line of pg_get_viewdef>` | views and materialized views |
| `sequence <regclass> type <format_type> start <n> increment <n> min <n> max <n> cache <n> cycle <b> owned-by <regclass.column\|->` | each sequence; never `last_value` |
| `type <type> kind <typtype> owner <role>` · `enum-label <type> <position> <quoted label>` · `domain <type> base <format_type> not-null <b> collation <name\|-> default <expr\|->` · `domain-constraint <type> <name> validated <b> def <…>` · `range <type> subtype <format_type>` | each type that is neither an array nor a relation's row type |
| `function <regprocedure> kind <prokind> owner <role> language <name> returns <pg_get_function_result\|-> definer <b> volatility <i\|s\|v> strict <b> parallel <s\|r\|u> leakproof <b> cost <n> rows <n>` | each routine |
| `function-arguments <regprocedure> <pg_get_function_arguments>` | when it has any — defaults are meaning |
| `function-setting <regprocedure> <name>=<value>` | each of `proconfig` |
| `function-body <regprocedure> <number>\|<line>` | `prosrc`; a SQL-standard body's `pg_get_function_sqlbody` instead |
| `object <type> <identity> owner <role\|->` | **everything else that stands in a covered schema** (operator, collation, conversion, operator class or family, text-search object, extended statistics …), by `pg_identify_object` — nothing stands in `os` without a line |
| `extension <name> schema <schema> owner <role> version <v>` | an extension whose schema is covered or that has a member in one |
| `publication <name> has <regclass>` | each covered relation a publication names |
| `comment <type> <identity> <number>\|<line>` | each comment on a covered schema or on anything in one, by `pg_identify_object` |
| `grant <database\|schema\|relation\|column\|function\|type> <object> to <grantee> <PRIVILEGE> option <b> by <grantor> <stored\|default>` | **every** item of the database and of each covered object (`default`: the ACL is NULL and the items are `acldefault`'s; a column has stored items only; `<object>` of a column is `<regclass>.<name>`); **and, for an object of these kinds anywhere else, each item whose grantee or grantor is a chain role** |
| `outside <owns\|granted\|in-policy\|other> <role> <type> <identity>` | each `pg_shdepend` row of a chain role whose object is not this database, a covered schema, something in one (a policy, trigger, constraint or column belongs where its relation does) or a default-ACL row. A row of another database: `outside <…> <role> other-database <database> <catalogue>` |
| `reference <regclass> <to_jsonb(row)::text>` | each row of each vocabulary's table |
| `ledger <position> <file> <kind> <hash> runner <runner_version>` | each ledger row |

### 4.4 How it is read **[lead]**

One connection, through the bench's guard as every connection of the chain's; one transaction,
`repeatable read read only`; `set local` of `search_path = ''`, `extra_float_digits = 3`, `TimeZone = 'UTC'`,
`DateStyle = 'ISO, YMD'`, `IntervalStyle = 'postgres'`, `bytea_output = 'hex'`, `quote_all_identifiers = off`,
`standard_conforming_strings = on` before the first read. It reads as whoever the target logs in — no `set role`.
It writes nothing and takes no advisory lock. **A text is whole or there is none:** a read the server refuses is a
failure of the call, never a shorter text. No `ledger` schema standing is not a failure: the text then has no
`ledger` line and no `os_chain` line.

## 5. The command and the library

- `snapshotOf(target: Target): Promise<string>` and the pure `differenceOf(expected: string, actual: string):
  { expectedOnly: string[]; actualOnly: string[] }` (lines as multisets, each list sorted by bytes) are exported
  from `foundation/chain/src/index.ts`. The code lies under `foundation/chain/src/` (fact 10) **[lead]**.
- `pnpm foundation:chain snapshot` — stdout is the text, byte for byte, and nothing else; exit 0.
- `pnpm foundation:chain snapshot --check <file>`:

| Case | stdout | exit |
|---|---|---|
| the bytes are equal | `SNAPSHOT_EQUAL lines=<n>` | 0 |
| they differ | every line only in the file as `- <line>`, every line only in the database as `+ <line>`, all sorted by the line's bytes (`-` before `+` for one line), then `SNAPSHOT_RED expected_only=<a> database_only=<b>` | 1 |
| the file is absent, is no regular file, or cannot be read | `SNAPSHOT_REFUSED no-expected` — before any connection; **the command never writes an expected text** | 2 |
| the file is not a snapshot's spelling (first line, a line out of order, a `\r`, no final newline, an empty line) | `SNAPSHOT_REFUSED expected-malformed` — before any connection | 2 |
| the bench's guard refuses the target | `SNAPSHOT_REFUSED target-<reason>` | 2 |
| `snapshot` with any other words | `usage: cli.ts snapshot [--check <file>]` | 2 |

  Every other call that is not `up …` answers piece 3's usage line unchanged (fact 11). Progress, if any, goes to
  stderr. The difference is never cut short.

## 6. The tests — `foundation/tests/snapshot/`, written before the code

By a hand that will not write the code, as the chain's own callers: the library through `@dxb-foundation/chain`,
the command as a child process. The fixtures of pieces 1–5 are reused, not copied. Each bench module makes its own
fresh instance and destroys it; each file is one command under four minutes.

**The expected texts are written by hand from §4**, not produced by the code under test: `expected/real.snapshot.txt`
(the real chain on a fresh instance) and `expected/fixture.snapshot.txt` (the fixture chain). The probe's texts
(`evidence/snap-r1-1-real-chain.txt`, `snap-r1-3-fixture-outside.txt`) are in the *probe's* form, which is not this
contract's; the server's own deparse texts in them are the server's and may be taken as they are.

**The fixture chain** (`foundation/tests/snapshot/fixtures/…`): the real chain's two schema files byte for byte,
then the fixture's own — inside `os` at least: a table with a primary key, a CHECK, a foreign key, a partial index,
defaults, an identity column, a float4, a float8 and a numeric column, storage options; a trigger and its function;
row security enabled and forced with a USING and a WITH CHECK policy; a definer function with two settings and an
invoker function with argument defaults; a view; a sequence; an enum; a domain; one object of a kind §4.3 gives
only the `object` line; grants on table, column, function, sequence, schema and type, one with grant option; one
`alter default privileges`; a comment of two lines; a vocabulary with a float in its file — and outside `os`: a
table in `public` granted to `os_reader` with a policy naming a login, and a schema with a table `os_owner` owns.

**A — without the bench.**
1. `differenceOf`: equal texts; one changed line; a line twice against once; sorted output; a final newline missing.
2. The command refuses a missing expected file, a directory, and each malformed spelling of §5 — with no instance
   standing; `snapshot` with unknown words answers its own usage line; a call that is neither `up` nor `snapshot`
   answers piece 3's.
3. Both expected texts obey §4.2 (first line, sorted, no `\r`, no empty line, no double space outside a last
   field, final newline) and hold no line of a kind §4.3 does not name.

**B — on a fresh instance, in order.**
1. **Clean (the real chain):** `chain up`, then `snapshot --check expected/real.snapshot.txt` → `SNAPSHOT_EQUAL`.
2. Read twice: the same bytes. Read through a connection whose own settings are hostile (`search_path` holding
   `os`, `DateStyle`, `IntervalStyle`, `TimeZone`, `bytea_output`, `quote_all_identifiers`, `extra_float_digits=0`):
   the same bytes. The transaction is read only: the reader's session cannot be shown to have written.
3. `instance logins`: the same bytes; the text holds none of the file's passwords and no `SCRAM-SHA-256`.
4. **A login gives itself a setting** — a core one and a dotted one, for all databases and in this one: the check
   is red by exactly those `role-setting` lines, the dotted value `<hidden>`; reset: equal.
5. **`os` given to another owner** (the bench's superuser): `chain up` is still `CHAIN_GREEN` — the gap, pinned —
   and the check is red, `schema os owner …` among the lines; put back: equal.
6. **The fixture chain on top** (`chain up --root <fixture>`): `--check expected/fixture.snapshot.txt` →
   `SNAPSHOT_EQUAL`.
7. **Nothing stands unseen:** every relation, live column, routine, type, constraint, trigger, policy and index the
   test itself reads from the catalogue in the covered schemas is named by a line of the text.
8. **Each change turns the check red, the difference is the lines the case wrote down, and undoing it makes the
   check equal again:** a function's body (one `function-body` line out, one in); its definer flag; one of its
   settings; **a policy's predicate** (one `policy-using` line); **a grant** added to a login, to PUBLIC, on a
   column, with grant option, and one removed; a grant no file says, which `chain up` leaves standing — the chain
   green, the check red; a default privilege; **the owner of one object in `os`** (the superuser); a role's
   attribute; a membership; a trigger disabled; row security off, and force off; an index dropped; a constraint
   dropped; a column's default; the vocabulary's comment; a reference value changed by hand (and `chain up` puts
   it back: equal); a sequence's increment; the view; a table nobody's file made; a privileged extension put into
   `os` (lines of another owner appear); outside `os`: a grant to a login on a table of `public`, an
   object `os_owner` owns elsewhere, a policy elsewhere naming a login.
   The difference is asserted **whole** wherever the changed lines can be written down from §4 (every case in bold
   at least); elsewhere the case names the lines that must be among it and the kinds it may touch.

**C — on a second fresh instance, in order: a file left out.** From nothing, a copy of the fixture chain without
its last schema file → the check against the fixture's text is red by that file's lines; then with every schema
file and one function file left out → the chain itself is red (an orphan, piece 4's rule) and the check is red by
that function's body; then with one reference file left out → the case pins what the pass answers (§6a.3); then the whole fixture chain → `SNAPSHOT_EQUAL` — the
same text a second instance reached by another road.

The ordered modules stop at their first red step: before the code exists every bench case is red at B.1 or C.1, and
the test hand shows each later case red for its own reason by neutralising the earlier ones in the working tree and
restoring them.

## 6a. What the tests pinned beyond §6 (the test hand's readings, read and accepted by the lead)

82 locked cases (36 without the bench, 40 on a fresh instance, 6 on a second). A helper read both expected texts
line by line against §4.3 and the fixture's files — no line to correct — and every case against §6; the lead read
the real chain's text, the check's fixture and saw the files red before the code (`evidence/lead-run-on-the-tests.log`).

1. `SNAPSHOT_EQUAL lines=<n>` counts every line, the first included. `*` stands for all roles and all databases.
2. A sequence's three columns are `column` lines (the catalogue has them). `grant type` is for types that have a
   `type` line. `enum-label`'s position is a rank from 1 and its label `quote_literal`. A domain's collation is `-`
   unless it differs from its base type's. A body that begins and ends with a newline has an empty first and an
   empty last numbered line.
3. **A reference file left out on an instance that already holds the rows changes nothing:** the pass is silent
   (`reference=0`), the rows stand and the check is `SNAPSHOT_EQUAL` — pinned, and said in §9.
4. Outside the covered schemas an object a chain role owns is read like one inside: a NULL ACL gives `default`
   lines. A `pg_default_acl` row is only ever `default-acl` lines. A policy on a table of `os` gives no `outside`.
5. The real chain's two schema files are read from `db/schema` at run time, never copied: one copy, and an edit to
   either turns both texts red through its ledger hash.
6. Hostile settings reach the reader through the connection string's `options`. That the reader's transaction is
   read only is shown by the same bytes under `default_transaction_read_only = on` and by nothing changed in the
   covered schemas — **the transaction's own words are read in the code, not proven** (§9).
7. Cases that add or take a grant, or change an owner, use objects whose ACL is already stored: a revoke on a NULL
   ACL leaves a stored one, and the check would not come back to equal. A changed owner rewrites the object's ACL:
   two lines out, two in.
8. The dotted setting of B.4 is one of `plpgsql`'s (a login is refused a made-up prefix — measured). The extension
   of B.8 is `pg_trgm`, put into `os` by the installer; its case asserts lines among the difference and the kinds.
9. `differenceOf` on a text without its final newline is pinned only as "not empty".
10. A.2's refusals have their force because no instance stands while they run — a case of its own says so.

## 7. F4 — what the lock protects **[lead]**

The expected texts lie in `foundation/tests/snapshot/expected/`, inside the piece's subject directory: the lock
that exists protects them, with no change to the tool (fact 10). A writer who changes a body cannot change the
text that judges it in the same diff. And because the real text carries each ledger row's hash, **an edit to an
applied schema file of the real chain turns "clean" red under the lock**; a function's file and a vocabulary's file
are held by their meaning — the body and the rows. BUILD.md §4's `db/__snapshots__/os.snapshot.txt` is replaced by
this place.

**How a later piece changes the chain:** its schema, function or reference file goes in a code commit; the new
expected text — written from that piece's contract, the lead reading its difference line by line — goes in with
piece 6's lock made again, in a commit that holds nothing else (`git add` the text, `pnpm foundation:lock piece-6`,
add the lock, commit); the lock commit comes first, so "clean" is red before the code and green after it. A chain
file never rides in a lock commit (`lock-commit-impure`).

## 8. Where the proof stands before a restored database is believed (piece 5's audit, A5) **[lead]**

`CHAIN_GREEN` says the ledger and the disk agree and the passes ran. It says nothing of an owner, a grant, a
setting, or an object no file names (facts 4, 5). **A database that was not built here from nothing — restored,
copied, or left alone for a time — is believed only when `pnpm foundation:chain up` is green and
`pnpm foundation:chain snapshot --check foundation/tests/snapshot/expected/real.snapshot.txt` says
`SNAPSHOT_EQUAL` on it.** The bench command (13) runs both; the stage's verdict (14), B72's restore drill and stage
5's delivery are told so in their own records when this piece closes. The check is not wired into `chain up`: the
runner stays what piece 3's lock judges, and a red check after a green chain must be readable as what it is.

## 9. Known limits, said before the build

- **What a build changes outside the text's reach is not seen here** — a comment on a platform object, a
  publication, an event trigger, a grant to PUBLIC or to a platform role on a platform object, a role not named
  `os_…`, a schema the installer owns (fact 8). It is 6b's proof, and until 6b stands "every change the chain makes
  to an object outside `os`" is true only of what names a chain role.
- **The text names the bench's installer and platform roles** (`postgres`, `supabase_admin`). The company's
  installing role is stage 5's, and the expected text for that database is decided there.
- **The value of a dotted setting is hidden**, so a change of such a value alone is not seen; its presence is.
- **A vocabulary's rows are printed whole:** a vocabulary holds no secret, by what a vocabulary is.
- **The text is read in one snapshot of the catalogue; `pg_get_*` functions read the catalogue's newest state**
  (PostgreSQL's rule). A check that runs while a chain runs may read a mixture; the proofs run when nothing writes.
- **The platform's date-named partitions** stand outside the covered schemas and are not read; stability across a
  calendar day is not measured (6b meets it).
- Kinds not measured on the bench and held only by §4.3's wording until a fixture meets them: ranges,
  materialized views, partitioned tables, rules, foreign tables. Each has its line; none has a case.
- **A vocabulary's file taken out of the chain leaves its rows on a database that had them**, and nothing says so
  (§6a.3) — piece 4's pass is silent without its file. Only a build from nothing shows it, which is what "clean" is.
- **That the reader's transaction is `repeatable read read only` is read in the code, not proven by a case.**
- Large objects and temporary objects are no part of the text; a large object a chain role owns is an `outside` line.

## 10. Done when

The tests are committed with their lock alone and seen red for the right reason; the code is committed apart;
`pnpm -s foundation:typecheck` is 0; `foundation/tests/snapshot` is green and pieces 3–5's suites are green,
untouched; `pnpm foundation:verify --all --rev HEAD` says `LOCK_GREEN` for pieces 1–6; one blind audit pass by
GPT-6.2 Sol is weighed and its corrections taken tests-first; BUILD.md's piece 6 carries the Done note of 6a.
