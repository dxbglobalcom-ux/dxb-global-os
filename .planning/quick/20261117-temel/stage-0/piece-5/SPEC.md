# B85 · stage 0 · piece 5 — the roles and the schema `os`: the contract

The lead's contract for the piece (BUILD.md §6, piece 5; PLAN.md §2 A "Logins", "Roles"). The test hand writes
`foundation/tests/roles/` from §8 before any code exists; the code hand writes §4–§7 against those tests. A sentence
marked **[lead]** is the lead's decision where the cut and the plan say nothing; **[measured]** rests on
`evidence/measure.out` (a helper's run, 2026-11-23) or `evidence/measure-more.out` (the lead's own).

## 1. What the piece leaves standing

- **The chain's first real files** under `db/`: `db/schema/0001-roles.sql`, `db/schema/0002-os.sql`,
  `db/functions/.gitkeep`, `db/reference/.gitkeep`. Five roles — `os_owner` (no login) and the logins `os_engine`,
  `os_executor`, `os_intake`, `os_reader` — with no attribute but LOGIN, members of nothing, without a password;
  the schema `os`, the owner's; the owner's default privileges, which give PUBLIC nothing.
- **The command's first green run on its real target:** `pnpm foundation:chain up`, no `--root`, on the instance's
  own database.
- **The passes act as the owner of `os`** (§5): a function a pass makes and a row a pass writes are the owner's by
  construction, and the installer holds none of the owner's privileges until it says `set role`.
- **The bench's install step:** `pnpm foundation:instance logins` gives each login a password it mints, kept in one
  file outside the repository (mode 600), and sends the server a SCRAM verifier only — never the password, never in
  a statement's text.

Not in this piece: a grant to any login (there is no door yet — USAGE on `os` arrives with the first door); the
snapshot and the install proofs (6); what the logins reach in the old schema and the platform's (7); `os_reader`'s
limits and the auditor's reach (13); the company's secret store and its installing role (stage 5).

## 2. The carry list — the old roles and logins read once (a helper's reading, 2026-11-23)

The old part: `scripts/b36/company-one-way-window.sql`, `scripts/governance/sol-reader-role.{sh,sql}`,
`scripts/b36/{install-company-window,withdraw-company-login}.mjs`, `scripts/bootstrap/preamble.sql`, and their tests.

| The old contract | Here |
|---|---|
| A login holds none of SUPERUSER, CREATEDB, CREATEROLE, REPLICATION; INHERIT off; member of nothing — checked only inside the installing script | **Kept**, and pinned from outside by a test; the other direction too (who is a member *of* it) |
| No password in any repository statement; a login cannot come in over TCP until the install step | **Kept** — the piece's own sentence |
| The password is minted outside the repository, mode 600; only a SCRAM verifier reaches the engine (`sol-reader-role.sh:66-99`) | **Kept** — the pattern. The two other old logins send the plain password, one in a process's arguments (`withdraw-company-login.mjs:110-114`): **dropped** |
| The install refuses to commit unless the catalogue confirms the role | **Kept** for the attributes and memberships (§6); the per-object reach **moved** to 7 |
| A login cannot create: no schema CREATE, no database CREATE, no TEMPORARY | **Kept** for what persists; TEMPORARY is PUBLIC's on this database and is **not taken away here** (§9) |
| A function is born with no EXECUTE for PUBLIC (`b64_anon_doors_closed`, for `postgres`, functions only) | **Rewritten**: the owner's default privileges close every kind PostgreSQL opens by default — functions and types |
| Future objects carry nothing for `anon`, `authenticated`, `service_role`, revoked role by role | **Rewritten**: in `os` the default is empty for everyone |
| Default privileges that grant future functions to every current role (`company-one-way-window.sql:463-491`) | **Dropped** — a blanket grant; BUILD.md §1 |
| A read role holds `BYPASSRLS` | **Dropped** — PLAN.md: no role with RLS bypass serves at runtime |
| Read-only default, timeouts, connection limit per login ("not the wall") | **Moved** to the piece that gives a login something to do (13 for `os_reader`) |
| A probe that could not log in is not a refusal that held; a refusal is shown red first, with a real TCP login | **Kept** as the tests' method (§8) |
| Role tests by `SET ROLE` from the installer's connection | **Dropped** for login rules — the logins are tried as logins |
| The backup's globals carry no role password | **Moved** to 6 |
| `SECURITY_MODEL.md` O3 "every hand open, behind two walls" | Not this piece's: it is about what a seat's tools reach; a seat holds no database login (PLAN.md §2 C) |

## 3. Measured facts (PostgreSQL 17.6, the foundation's bench, 2026-11-23) — not to be re-litigated

- **The installer.** `postgres` is not a superuser; CREATEROLE, CREATEDB, BYPASSRLS, REPLICATION; it owns database
  `postgres`. `createrole_self_grant` is empty: a role it creates gives it one membership row —
  `admin = true, inherit = false, set = false`, grantor `supabase_admin` — and nothing else happens to a new role
  (no setting, no other membership; M3.e).
- **Acting as an owner with no login** (M1). With that row alone the installer may neither `set role` to the owner
  nor make a schema for it. After `grant <owner> to <installer> with set true, inherit false`: `create schema …
  authorization <owner>` works with no CREATE on the database for the owner; under `set role <owner>` every object
  is the owner's; `alter default privileges` works only as the owner itself (or with INHERIT). **Without INHERIT
  the installer, not saying `set role`, is refused in the owner's schema** (`permission denied for schema`) — so a
  file or a pass that forgets the role fails loudly instead of making an object owned by the installer. With
  INHERIT instead, an object the installer makes there is the installer's (M1.d(iii)).
- **PUBLIC by default** (M2). On a fresh database `pg_default_acl` is empty. PostgreSQL's built-in defaults give
  PUBLIC EXECUTE on functions and procedures and USAGE on types and domains; tables, views and sequences give it
  nothing. `alter default privileges revoke execute on functions from public` and `… revoke usage on types from
  public`, said globally as the owner, close both; said `in schema …` they leave no row and close nothing.
  Default privileges are per database. A cast to an enum succeeds without USAGE on the type (M2.g) — USAGE on a
  type guards its use in definitions, not a value.
- **The login rules of the image** (M3). From the host a connection arrives from the Docker gateway and meets
  `scram-sha-256`: a login without a password is refused (`password authentication failed`, or the client's `no
  password supplied`). **Inside the database container, TCP to 127.0.0.1 and ::1 is `trust`**: any role with LOGIN
  comes in there without a password, the platform's superuser included; the unix socket is `peer`. `ssl = off`.
  `log_statement = ddl`.
- **A verifier, and the log** (M3.c, M7). The server stores a client-computed `SCRAM-SHA-256$4096:…` verifier as
  given; the installer may read `pg_authid.rolpassword`. `alter role … password '<verifier>'` as a statement is
  written to the server's log with the verifier. Sent as a parameter into a transaction-local setting and applied
  by `alter role` inside a `do` block, **nothing of it reaches the log** — unless that `alter role` fails: then the
  log's CONTEXT line and the error's `where` field carry the verifier.
- **What a login that is a member of nothing can do** (M4, M5, M8). Refused: a schema, a table in `public` or any
  schema, a role, a database, a publication; `pg_read_file`, `pg_ls_dir`. Allowed by PUBLIC or by the platform:
  CONNECT and TEMPORARY on the database (temp tables, `pg_temp` functions and types); large objects; LISTEN/NOTIFY;
  advisory locks; `pg_cancel_backend`/`pg_terminate_backend` (which act only on one's own role's backends);
  **`create extension` and `drop extension` for every extension on the platform's privileged list** — tried:
  `pgcrypto`, `pg_net`, `dblink`, `postgres_fdw`, `http`, `pg_stat_statements` are made, owned by `supabase_admin`,
  and dropped again by the same plain login. In database `postgres` PUBLIC also reaches the schema `net`
  (its queue tables and ten functions), 163 functions of `public`, and functions of `auth`, `pgboss`, `realtime`.
- **The guard's reading** (`pg_control_system()`) answers a login that is a member of nothing (M9.a).
- **Row security and the owner** (M9.b). As the owner of a table with `force row level security` and a policy that
  hides its rows, a reading answers 0 rows; with `row_security = off` the server refuses it: `query would be
  affected by row-level security policy for table "…"`.
- **A taken name** (M6.b): `create role` on a name that stands answers `role "…" already exists`.
- The chain's runner refuses, in `db/schema/`, every entry but `NNNN-name.sql` — a `.gitkeep` too; `functions/` and
  `reference/` pass over a regular file named `.gitkeep` (piece 3 §4, piece 4 §12.12).

## 4. The chain's first files — their text is the contract

`db/schema/0001-roles.sql`, after a comment that says what it is and that no password is written in the chain:

```sql
create role os_owner    nologin nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
create role os_engine   login   nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
create role os_executor login   nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
create role os_intake   login   nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
create role os_reader   login   nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
do $installer$ begin execute format('grant os_owner to %I with set true, inherit false', session_user); end $installer$;
```

`db/schema/0002-os.sql`, after its comment:

```sql
create schema os authorization os_owner;
set role os_owner;
alter default privileges revoke execute on functions from public;
alter default privileges revoke usage on types from public;
```

- **[lead] `os_reader` is a login** — the read login of the auditor's hand and of a measurement; a role that
  nobody may be a member of cannot be a group.
- **[lead] The installer is named by `session_user`, not spelled**: the file's bytes are in the ledger for good, and
  the company's installing role is stage 5's question.
- **[lead] No `if not exists`.** A role is cluster-wide and a name is not authority (BUILD.md §4): on a cluster
  where one of the five names stands, the file fails and leaves nothing — a clean install is a new instance.
- **[lead] Every later schema file that makes something in `os` says `set role os_owner` itself**, in its own text;
  one that forgets is refused by the server (§3). The runner sets no role for a schema file — the first file needs
  the installer's CREATEROLE, and a later one may need both hands.
- **Still true from piece 4:** every vocabulary's table carries its mark; no range type and no extension in `os`.
- `db/functions/.gitkeep` and `db/reference/.gitkeep` are empty regular files. No other file is written under
  `db/`, and no old file there is touched.

## 5. The passes act as the owner of `os` — a change to piece 4's runner **[lead]**

Piece 4 fixed that a function file begins with its own function, so a function file cannot say `set role` first;
and with SET alone the installer cannot touch `os` unless it does (§3). So the runner says it:

- **The functions pass:** before each file's text, when a schema `os` stands, the runner says `set role` to that
  schema's owner (read from `pg_namespace`, quoted as an identifier). Its `reset role` and `reset all` after the
  file stand as they are. When no schema `os` stands it says nothing, and the file meets what it met before.
- **The reference pass:** its transaction says `set local role` to the owner of `os` among its own first settings,
  before anything is read from a vocabulary or written.
- A `set role` the server refuses is that file's failure: `pass-failed` at the file — for the reference pass, at
  the first file by name — with the server's message; the pass is rolled back whole, as every failure of a pass is.
- Where the owner of `os` is the runner's own login — every fixture of pieces 3 and 4 — nothing changes: the 219
  locked cases of piece 4 and the 133 of piece 3 stay green, untouched.
- The manifest's reading, the lock asked as each pass's last act and the answer lines are piece 4's, unchanged.

## 6. The install step — `pnpm foundation:instance logins`

In `foundation/bench` (a new file, `src/logins.ts`; the command joins `cli.ts`). It takes the host lock as `up`
does, and the guard reads the identity on the connection that does the work, before the first statement.

1. **An instance stands**, else `LOGINS_REFUSED no-instance`.
2. **The four logins are what the chain made** — read from the catalogue, all four before anything is written.
   The first that is not, by the order `os_engine`, `os_executor`, `os_intake`, `os_reader`, and its first reason by
   this order: `missing` · `not-a-login` · `superuser` · `createrole` · `createdb` · `replication` · `bypassrls` ·
   `member` (it is a member of any role) → `LOGINS_REFUSED <role> <reason>`. Nothing is minted, written or set.
3. **The secret file** — `<state directory>/logins.json` (the bench's state directory, mode 700, beside
   `instances.json`), mode 600, written whole through a temporary file and a rename, as the list file is:
   `{ "sysid": "<the instance's>", "logins": { "os_engine": "<password>", … } }`. When the file stands, is of this
   shape, names this instance and holds all four, its passwords are kept; otherwise four new ones are minted —
   32 bytes from the system's random source, written base64url — and the file is replaced. The file is written
   before the server hears anything.
4. **The verifiers** — `SCRAM-SHA-256$4096:<salt>$<StoredKey>:<ServerKey>` (RFC 5802, RFC 7677; a new 16-byte salt
   each time), computed in this process. One transaction for all four: each verifier travels as a parameter into a
   transaction-local setting and is applied by `alter role` inside a `do` block (§3: nothing in the log). The
   password itself never leaves the process except into the file.
5. **What is said.** `LOGINS_SET logins=4 sysid=<n>`, exit 0. Every refusal of this step: `LOGINS_REFUSED …`,
   exit 6. The lock and the guard answer as they do for every command of the bench (`LOCK_REFUSED` 2,
   `TARGET_REFUSED …` 4). **No output of the step — stdout, stderr, an error's message — holds a password or a
   verifier**: an error of the server inside step 4 is passed on as its primary message only, never its `where`
   (§3: that field carries the verifier).

`down` does not remove the file: what it holds opens nothing once its cluster is gone, and the next `logins`
replaces it.

**What the library exports** (`foundation/bench/src/index.ts`, added):

```ts
export const FOUNDATION_LOGINS: readonly ["os_engine", "os_executor", "os_intake", "os_reader"];
export type FoundationLogin = (typeof FOUNDATION_LOGINS)[number];
export class LoginsRefused extends Error { readonly reason: string }      // "no-instance" | "<role> <reason>" | "no-secret"
/** Steps 1–4, under a held host lock. */
export function setLogins(lock: HostLock): Promise<{ sysid: string; logins: readonly FoundationLogin[] }>;
/** Pure. PostgreSQL's stored form of a SCRAM-SHA-256 verifier for an ASCII password. */
export function scramVerifier(password: string, salt: Uint8Array, iterations?: number): string;   // iterations: 4096
/** The address a resident service or a test logs in with, read from the secret file. LoginsRefused("no-secret")
 *  when the file is missing, malformed or does not hold the role. Never printed by the bench itself. */
export function loginConnectionString(role: FoundationLogin, loginsPath?: string): string;   // default: defaultLoginsPath()
export function defaultLoginsPath(): string;
```

## 7. The command on its real target

`pnpm foundation:chain up` (no `--root`) on a fresh instance answers, as its last line,
`CHAIN_GREEN applied=<n> standing=<n> functions=<f> reference=<r>` with exit 0 — at this piece `n = 2`, `f = r = 0`;
run again, `applied=0` and the same `standing`. The order on a new instance is: `foundation:instance up` →
`foundation:chain up` → `foundation:instance logins`.

## 8. The tests — `foundation/tests/roles/`, written before the code

Real logins over TCP, from the host, on the bench's address. **A refusal counts only after something permitted
succeeded on the same address in the same case** (the installer's own connection, or the login's own `select`);
an error is told apart by its SQLSTATE (`28P01`, `28000`, `42501`, `42710`), never by "it threw". Nothing is
skipped, retried or conditional. What a case makes, it removes by the identity it made.

**A. Without the bench**

1. `scramVerifier` reproduces PostgreSQL's own verifier — two vectors the server computed (2026-11-23):
   - `pencil-of-the-bench`, salt `UNx3tZGuHcbFu2SKdUYfPA==` →
     `SCRAM-SHA-256$4096:UNx3tZGuHcbFu2SKdUYfPA==$/6xTb6SfbNYguIF9RJps8f2bzT3+9coCE00nz76quU8=:U2yl746+8wWUbujZcYfqw0J5eF5GTikVD8NRxD7DFww=` <!-- gitleaks:allow -->
   - `Zq8-throwaway_vector.2`, salt `FhOPpGYFfvxdPt87LkbMPQ==` →
     `SCRAM-SHA-256$4096:FhOPpGYFfvxdPt87LkbMPQ==$ADcREg3jdNTZNvvRfdKEHnPtR8DdgHOz4K6kHvU9AgU=:3n/zve6mEWjr8B6g2Si483cIb+vRy2n050LDOPqGxjM=` <!-- gitleaks:allow -->
2. The real root reads as a chain with no offence; its first two files are `0001-roles.sql` and `0002-os.sql`;
   `db/functions` and `db/reference` each stand and hold a regular file `.gitkeep`.
3. No file under `db/schema`, `db/functions` or `db/reference` sets a password: none holds the word `password`
   followed by a quote, a dollar-quote or `null` (in any letter case).
4. `loginConnectionString` on a secret file that is missing, malformed, or without the role → `LoginsRefused`,
   reason `no-secret` (the file's path handed over as the second argument).

**B. On a fresh instance, in order** (one module; it begins with `fresh` and ends with `down`, as piece 1's does;
a failed step stops the later ones)

1. **Before the chain:** none of the five roles stands and no schema `os`; `logins` → `LOGINS_REFUSED os_engine
   missing`, exit 6, and no secret file is written or changed.
2. **The chain:** `foundation:chain up` as a child, no `--root` → exit 0, last line
   `CHAIN_GREEN applied=<n> standing=<n> functions=<f> reference=<r>`, `n ≥ 2` and equal twice.
3. **The roles, read from the catalogue:** each of the five has exactly the attributes of §4 (LOGIN on four, off on
   `os_owner`; superuser, createdb, createrole, replication, bypassrls, inherit all off; no connection limit; no
   password; no expiry) and no row in `pg_db_role_setting`. None is a member of any role. No role but the installer
   is a member of any of them; the installer inherits from none; it may `SET ROLE` to `os_owner` and to none of the
   four (`pg_has_role`, and the act itself).
4. **The schema:** `os` is `os_owner`'s and no one else holds a privilege on it. `os_owner` has CREATE on no other
   schema and not on the database. The ledger's schema and table are the installer's, and none of the five holds a
   privilege on either.
5. **The default privileges:** `pg_default_acl` holds for `os_owner` exactly the two global rows of §3. And the
   proof: inside a transaction that is rolled back, as `os_owner`, one of each kind is made in `os` — table, view,
   materialized view, sequence, function, procedure, aggregate, enum, domain, composite type; each is owned by
   `os_owner`, and neither `public` nor any of the four logins holds any privilege of its kind on it
   (`has_*_privilege`, every privilege the kind has).
6. **Before the install step**, as each of the four over TCP — no password, an empty one, a guessed one: refused as
   an authentication failure. `os_owner`: refused, here and after the step.
7. **The install step:** `logins` → `LOGINS_SET logins=4 sysid=<the instance's>`, exit 0. Its stdout and stderr
   hold no password and no verifier. The file: in the state directory, a regular file, mode 600, this user's; its
   `sysid` the instance's; exactly the four names; four different passwords of at least 43 characters. Each
   login's stored password has the form `SCRAM-SHA-256$4096:…`; `os_owner`'s is null. The database container's log
   since the step began holds no stored verifier (its first 40 characters) and no password.
8. **After it:** each login comes in with `loginConnectionString(<role>)` and is itself (`current_user`,
   `session_user`); a wrong password is still refused.
9. **None can create**, each tried as the real login, each refused with `42501`: a schema; a table and a function
   in `os`; a table in **every** schema of the database, enumerated from `pg_namespace` (temporary and toast
   schemas apart); a role; a database; a publication; `set role os_owner`; `set role` to the installer; a reading
   of the ledger. Afterwards the counts of schemas, roles, databases and relations are what they were.
10. **What the platform leaves open to every login** — measured, pinned so that a change is seen, carried to piece 7
    and stage 5 (§9): a temporary table; a large object, made and unlinked; an extension of the platform's
    privileged list that does not stand in the database (`hstore`), made and dropped again by the login.
11. **Again:** a second `chain up` → `applied=0`, the same `standing`; the five roles are the same rows (their
    oids) and the logins still come in. A second `logins` keeps the file's passwords and the logins come in. With
    the file's `sysid` changed to another, `logins` mints four new passwords: the old ones are refused, the new
    come in.
12. **The step's refusals**, each leaving every stored password as it was, to the byte, and the file unchanged:
    a login given an attribute (`createdb` on `os_intake`) → `LOGINS_REFUSED os_intake createdb`; a login made a
    member (`pg_monitor` to `os_reader`) → `LOGINS_REFUSED os_reader member`; the host lock held by another →
    `LOCK_REFUSED`, exit 2. Each put back by the case.
13. **A taken name:** the real root applied to a throwaway database of the same instance → `file-failed` at
    `0001-roles.sql`, the message `role "os_owner" already exists`, nothing applied, and that database's ledger
    holds its bootstrap row alone.
14. **The passes as the owner** (§5), on fixture roots in throwaway databases whose first schema file says
    `create schema os authorization os_owner`:
    - a function file → `os.<name>` stands, owned by `os_owner`; run again with another body → the same oid, the
      new body, still `os_owner`'s;
    - a vocabulary made by a schema file under `set role os_owner`, and its file → reconciled, the table and its
      rows the owner's; the installer, not saying `set role`, is refused a reading of it (`42501`);
    - the same vocabulary with `force row level security` and a policy that hides its one standing row →
      `pass-failed` at that file, the message naming row-level security; the row stands as it was;
    - a schema `os` whose owner the runner may not `SET ROLE` to (a role the case makes and removes) →
      `pass-failed` at the first function file, the message `permission denied to set role …`; nothing is made.
15. **At the end**, after `down`: `logins` → `LOGINS_REFUSED no-instance`, exit 6.

The module is long-running by its nature (two makes of an instance): its hooks and steps carry their own timeouts.
The fixtures of `chain/` and `bench/` are reused by import; a new helper lives in `roles/fixtures/`.

## 9. Known limits, said before the build

- **Inside the database container every role logs in without a password** (§3, the image's `trust` on loopback).
  "Refused before the install step" is true of every connection from outside the container. Whoever is inside
  that container already holds the platform's superuser; the image's rules are not the chain's to change.
  Carried to stage 5's move.
- **"None can create … anywhere" is true of what persists in a schema, and of roles, databases and publications.**
  Three things PostgreSQL or the platform gives every login are not closed here, because closing them changes
  ground the old system stands on in the same database, or needs the platform's superuser: temporary objects
  (PUBLIC's TEMPORARY on the database — taking it from PUBLIC and handing it back by name is the old window's
  defect, BUILD.md §1); large objects; and the platform's privileged extensions, which any login may create and
  **drop**. The last is the heavy one: it reaches `pg_net`, `http` and `dblink`, and a drop can take what depends
  on an extension with it. Pinned in §8 B.10, enumerated in piece 7's allow-list, closed at stage 5 in the
  platform's own configuration, where the database is the foundation's alone.
- **A login may change its own password** — PostgreSQL allows every role that; such a statement is written to the
  log with what it sets. The install step puts the file's password back on its next run.
- **That the plain password never reaches the server is read, not proven**: the server stores what it is sent as a
  verifier either way. The lead reads `logins.ts` for it; A.1 proves the verifier is PostgreSQL's own form.
- **A failing `alter role` inside the step writes the verifier to the server's log** (§3). Step 2 reads the roles
  first, so it takes a role removed between that reading and the write. A verifier of a 256-bit random password
  opens nothing.
- **The file's mode is checked, an access-control list on it is not** (the old `construction-window.env` carries
  one). The state directory is mode 700 and made by the bench.
- **Default privileges are per database.** The two rows stand in the database the chain ran on; that is the only
  database the foundation lives in.
- **The real chain's files are not protected by this piece's lock** (piece 2's audit, F4 — decided in piece 6): the
  tests read what stands on the server, not the files' text, so a changed file must still make the same state.
- The runner on the real target logs in as the bench's installer. A runner that is not the ledger's owner is stage
  5's (piece 3 §12, not built).

## 10. Done when

`pnpm foundation:typecheck` exits 0; every case of `foundation/tests/roles/` is green on a clean copy through the
lock; the locked cases of pieces 1–4 are green, untouched; `pnpm foundation:verify --all --rev HEAD` says
`LOCK_GREEN` for pieces 1–5 and `red=0`; the old system's typecheck and a frozen install are as before; the first
green run on the real target is in `evidence/`.
