# Job 1 (dxb-team2) — Sol's own read-only reach into the construction engine — PLAN (draft, rev 3)

## The CEO's sentence
"önerin tmm" — on the proposal: give the auditor (GPT-6 Sol via Codex) a read-only way to query the
construction engine itself, so it gathers database evidence with its own hand instead of receiving the
author's output; never the company's database.

## Score card
Blast radius 2 (the audit channel every job passes through + the construction engine) · Risk 2
(database, security) · Reasoning 2 (the read-only guarantee must hold against side-effect functions,
multi-statement input, long queries, a same-named company database) · Ambiguity 0. **Total 6 →
critical.** Auditor effort: xhigh, with high on the same diff side by side (the owed measurement).

## Ground (measured 2026-09-28)
- Codex read-only sandbox: TCP to 127.0.0.1:54422 and AF_UNIX sockets → "Operation not permitted".
- A Codex MCP server runs outside the command sandbox; its tool reached TCP 54422 only with
  `approval_mode = "approve"` on that tool; the sandbox still refused a file write in the same run.
- Two engines, same database name and credential: company `supabase_db_DxB_Global_OS` :54322,
  construction `supabase_db_DxB_Build` :54422, both `postgres`. Their identities differ:
  `tools/hooks/ledger-identity.json` — company sysid 7674907968528752679, allowed[] = the build engine.
- The base `~/.codex/config.toml` declares three MCP servers (memory, openaiDeveloperDocs, node_repl —
  the last runs arbitrary Node outside the sandbox) which the refuter profile inherits.

## Design
1. **Identity, not name, is the guard.** Both the role script and the tool read
   `pg_control_system().system_identifier` at connect and proceed only if it is in
   `ledger-identity.json.allowed[]` and is not `company.sysid` (the mechanism `tests/global-teardown.ts`
   already uses). Every tool response echoes sysid, `inet_server_port()`, `current_user`,
   `transaction_read_only`.
2. **Role** `sol_reader` (script `scripts/governance/sol-reader-role.sh`, idempotent, run as `postgres`
   — not superuser here — never as `supabase_admin`): LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
   NOINHERIT, CONNECTION LIMIT 3, `default_transaction_read_only=on`, `statement_timeout=10s`,
   `idle_in_transaction_session_timeout=15s`, `temp_file_limit`. USAGE + SELECT on an explicit schema
   list only — `public, pgboss, supabase_migrations, extensions` — never `net, vault, auth, storage`;
   default privileges `FOR ROLE postgres` on those schemas. **No REVOKE from PUBLIC** (the engine's own
   PostgREST, pg-boss and realtime need set_config, advisory locks and notify).
   Wired into `package.json` `construction:schema` (engine-only), **not** into `scripts/bootstrap-db.sh`
   (which also serves the company chain and would fail at the guard). Rebuild order is documented:
   `ledger-identity.mjs --allow` → `sol-reader-role.sh`.
3. **Tool** `scripts/governance/sol-db-mcp.mjs` — dependency-free MCP stdio server, ONE tool
   `sql_read(query)`: the query goes by pg's extended protocol (the server itself refuses multiple
   commands); leading comments stripped; must start with SELECT / WITH / TABLE / VALUES / SHOW /
   EXPLAIN, and EXPLAIN with ANALYZE/ANALYSE in any spelling is refused; runs inside `BEGIN READ ONLY`
   + `SET LOCAL statement_timeout='10s'` as a `NO SCROLL CURSOR` + `FETCH 201` (cap 200 rows, 64 KB);
   ROLLBACK always, then `SELECT pg_advisory_unlock_all()`. Credential in
   `~/.config/dxb/sol-reader.env` (mode 600, outside git — readable by the sandbox, harmless without
   sockets; the records say so). Every call appended as a JSON line to
   `~/.local/state/dxb/sol-db-mcp.log`.
4. **Channel.** `~/.codex/refuter.config.toml` sets `enabled = false` for memory, openaiDeveloperDocs
   and node_repl and declares `[mcp_servers.dxbdb]` with `tools.sql_read.approval_mode = "approve"` —
   the only approved tool. `refuter.sh` greps these lines as it greps sandbox_mode, probes
   127.0.0.1:54422 and registers the tool only when the engine is up, printing
   `SOL_DB_REACH=armed|absent`. `--proof` prints: the file-write refusal, `DB_WRITE_REFUSED` for three
   write attempts through the tool, the three disabled servers, and the tool file's sha256.
5. **Records.** `dxb-team2` §5: Sol queries the construction engine itself and reads
   `sol-db-mcp.mjs` before trusting it; `dxb-verify` refuter sentence; audit-twin §3.

## Rev 3 — what Fable (architecture) and Sol (blind audit, xhigh, OVERALL: BLOCKS) found, as design facts
Measured by the lead after both reports (2026-09-28, read-only queries on each engine):
- construction engine: `postgres` rolsuper=f, rolcreaterole=t, rolbypassrls=t; `supabase_admin` super;
  `dxb_reader` exists (BYPASSRLS); **62 public tables have row-level security enabled.**
- Sol's "postgres lacks CREATEROLE" is false on this engine today (the 2026-08-24 note measured the
  company stack); the installer still uses `supabase_admin` through `docker exec supabase_db_DxB_Build`,
  as the existing window installers do, and verifies identity first in the same session.
Changes to the design above (these override it):
R1. Identity is the full triple — sysid + database oid + database name — checked in the same session
    as every statement, against `ledger-identity.json.allowed[]`; the company sysid is refused.
R2. `sol_reader` gets **BYPASSRLS** (otherwise the 62 RLS tables read as empty — false evidence).
R3. Side-effect functions: the existing one-way window mechanism (`scripts/b36/company-one-way-window.sql`,
    which takes them from PUBLIC and returns them to every other role) is extended so `sol_reader`, like
    `dxb_reader`, is left out of the return — the app roles keep them; measured after install:
    `has_function_privilege('sol_reader', …)` = 0 over the window's whole list and every SECURITY DEFINER.
R4. Default privileges for BOTH object owners, `postgres` and `supabase_admin`.
R5. Tool: SELECT/WITH/VALUES/TABLE through a cursor; SHOW and EXPLAIN (never ANALYZE) as plain reads
    in the same READ ONLY transaction with the same caps; COPY refused outright; every cell cut at 4 KB.
    The tool refuses while the battery's single-run lock is held ("engine busy").
R6. Codex inventory: the base config also enables plugins (browser, google-drive, sites, visualize,
    context7, claude-mem) that the refuter profile inherits TODAY. The profile disables every plugin and
    MCP server except `dxbdb`; the real inventory of a `codex -p refuter` session is measured and printed
    by `--proof`. The tool's own log is the only write, made by the tool process, not by Sol — stated.
R7. `--proof` checks the codex exit status and the refusal text, not only a missing file (today's
    `|| true` can print green on a codex failure).
R8. Company proof: a role-absence query on the company engine plus a company snapshot before and after
    the live tool trials; the battery runs once, separately.
R9. Rebuild: one from-scratch rebuild of the construction engine through `construction:schema` with
    the identity allow step, proving the role returns with its grants.
Done-list additions: R1 wrong-database and wrong-port trials; R2 sol_reader count = supabase_admin count
on three RLS tables; R3 the zero-privilege measurement; R6 the printed inventory holds only `sql_read`;
R9 the rebuild; the critical job's owed measurement — Sol high vs xhigh on the same code diff.

## Done-list (commands and expected output, written before code)
1. `bash scripts/governance/sol-reader-role.sh` → `SOL_READER_OK sysid=<allowed>`; pointed at :54322 →
   exit 1 `REFUSED company sysid`.
2. As sol_reader through psql: INSERT, UPDATE, DELETE, CREATE TABLE, `SELECT … INTO`, COPY … TO,
   `SELECT net.http_get('http://172.17.0.1:54322')` → each ERROR; `pg_extension` holds none of dblink /
   postgres_fdw / http; `count(*) FROM pg_proc WHERE prosecdef AND has_function_privilege('sol_reader',
   oid,'EXECUTE')` → 0; `SELECT count(*)` on three tables → numbers.
3. vitest `tests/governance/sol-db-reach.test.ts`: multi-statement, `$tag$` / `E''` / nested-comment
   smuggling, EXPLAIN ANALYZE spellings, DO block, `WITH x AS (INSERT …)`, a 20 s query, a 10 000-row
   select, an advisory lock left behind, the company sysid → each refused, capped or released; green.
4. `scripts/governance/refuter.sh --proof` → the write refusal line, `DB_WRITE_REFUSED` ×3, the three
   servers disabled, the sha256.
5. A live Sol call (effort medium) counting rows in one construction table through `sql_read` → the
   rollout shows the tool call completed and the number matches the author's psql count.
6. Engine stopped → `refuter.sh` prints `SOL_DB_REACH=absent` and an audit still runs.
7. `scripts/governance/company-untouched.mjs` → the company engine has no `sol_reader` role and its
   row counts are unchanged.
8. Battery once; `sync-codex-mirror.sh --check`; `verify:ledger`.

## What it must not do
Touch the company engine; give Sol any write path (file or database); approve any MCP tool but
`sql_read`; revoke anything from PUBLIC; change `bootstrap-db.sh` or the test suites; put a credential
in the repository.
