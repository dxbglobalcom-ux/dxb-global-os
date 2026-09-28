# Job 1 — done-list (written before the code, 2026-09-28, lead session 58e4dd12)

Each item is a command and the output that makes it true. Plan rev 3 (`PLAN.md`, R1–R9) is the
design; where this list is narrower or wider than the plan's own done-list, the reason is beside it.

| # | Command | Expected |
|---|---|---|
| 1 | `bash scripts/governance/sol-reader-role.sh` | `SOL_READER_OK sysid=<allowed>/5 (postgres)`, exit 0; run twice → same (idempotent) |
| 1b | `DXB_SOL_CONTAINER=supabase_db_DxB_Global_OS bash scripts/governance/sol-reader-role.sh` | exit ≠ 0, `REFUSED` naming the company identity; company `pg_roles` has no `sol_reader` (R1, R8) |
| 2 | psql as `sol_reader` on :54422: INSERT · UPDATE · DELETE · CREATE TABLE · `SELECT … INTO` · `COPY t FROM STDIN` · `SET default_transaction_read_only=off; INSERT` · `SELECT net.http_get(…)` · `SELECT lo_create(0)` · `SELECT pg_advisory_lock(1)` · `SELECT nextval(<any seq>)` · `CREATE TEMP TABLE` | each ERROR (permission denied / read-only / no schema) |
| 2b | `COPY (select 1) TO STDOUT` as sol_reader in psql | succeeds — it is a read (Sol's finding); the TOOL refuses COPY outright (item 3) |
| 3 | `pnpm vitest run tests/governance/sol-db-reach.test.ts` | green: multi-statement, `$tag$` / `E''` / nested-comment smuggling, EXPLAIN ANALYZE spellings (`ANALYSE`, `(ANALYZE)`, `( analyze true )`), DO, `WITH x AS (INSERT …)`, COPY, a 20 s query (cut at 10 s), 10 000 rows (cut at 200), a 1 MB cell (cut at 4 KB), advisory lock (refused), wrong identity (refused), engine busy (refused) |
| 4 | role measurement (in the role script's closing assertion, and printed): `count(*) FROM pg_proc WHERE (<c_effectful>) AND has_function_privilege('sol_reader',oid,'EXECUTE')` · all SECURITY DEFINER · 7 table verbs · sequences · TEMP/CREATE · schemas beyond the four | all 0 (R3) |
| 5 | three RLS tables: `count(*)` as sol_reader vs as supabase_admin | equal, non-zero (R2) |
| 6 | window re-applied to the construction engine inside `BEGIN … ROLLBACK` after `sol_reader` exists | sol_reader holds 0 effectful functions afterwards (R3: a re-run never returns them) |
| 7 | `codex -p refuter mcp list --json` | exactly one enabled server, `dxbdb`; `codex -p refuter features list` shows computer_use / browser_use / apps / plugins / image_generation … false (R6) |
| 8 | `scripts/governance/refuter.sh --proof` | the codex exit status checked; file write refused with the real refusal text; `DB_WRITE_REFUSED` ×3 through the tool; inventory = `dxbdb` only; tool sha256 (R7) |
| 9 | a live Sol call, effort medium, counting rows of one construction table through `sql_read` | rollout shows the tool call completed; the number equals the lead's psql count |
| 10 | engine port closed (probe pointed at a dead port) | `refuter.sh` prints `SOL_DB_REACH=absent` and the audit still starts |
| 11 | company proof: role-absence query + row-count snapshot of the company engine before and after items 8–10 | `sol_reader` absent; snapshot identical (R8) |
| 12 | from-scratch rebuild: `supabase db reset --workdir construction` → `ledger-identity.mjs --allow` → `construction:schema` (ends with the role script) → window → seed | role back with its grants; item 4 all 0 again (R9) |
| 13 | `scripts/governance/sync-codex-mirror.sh --check` · `pnpm verify:ledger` · `pnpm vitest run tests/hooks tests/governance` | clean · green · green |
| 14 | battery once (`pnpm construction:battery`) | green except the known pre-existing red `tests/r43/arsenal.test.ts` (4) |
| 15 | Sol audits the finished diff blind at xhigh AND high | both verdicts recorded with findings, false alarms, minutes, Plus share |

Narrowings, stated: the tool reads the schemas the plan names (`public, pgboss, supabase_migrations,
extensions`) and not `dxb_internal` — the plan did not open it and this list does not widen it.
