# B85 · stage 0 · piece 1 — the frame and the foundation's own bench: the contract

Cut from `../BUILD.md` §6 piece 1. This file is the contract the tests are written from and the code is written to.
The lead wrote it (2026-11-23); what it decides beyond BUILD.md is marked **[lead]** with its reason.

## 1. What the piece leaves standing

1. A workspace root `foundation/*` with two packages — `foundation/bench` (`@dxb-foundation/bench`) and
   `foundation/tests` (`@dxb-foundation/tests`) — their own typecheck, their own test run, a frozen install that passes.
2. One command that makes a fresh instance of the foundation's bench (a local Supabase stack of the old bench's
   version, the old chain applied once), and one that destroys it leaving nothing.
3. A guard that reads the server's identity **on the connection that does the work** and refuses every target the
   bench did not make — the company's engine and the old bench by name.
4. One host lock; no destructive step without it.

Nothing of this touches the old bench (`DxB_Build`), the company (`DxB_Global_OS`), or any old file except
`pnpm-workspace.yaml`, the root `package.json` and `pnpm-lock.yaml`.

## 2. Measured facts (the lead's runs, 2026-11-23 00:00–00:15) — not to be re-litigated

- Node 22.23.3 runs a `.ts` file directly (type stripping on by default). pnpm 11.10.0. `flock` (util-linux 2.41.3),
  host `psql`, `docker` 29.1.3 are present. The Supabase CLI is the workspace dependency `supabase` (catalog
  2.109.0), binary `node_modules/.bin/supabase`; it is not on PATH.
- **The exposure.** The CLI publishes its ports on `0.0.0.0` and has no setting for it; this machine's kernel wall
  names only the four old ports and is a root-owned file. A Docker network created with
  `-o com.docker.network.bridge.host_binding_ipv4=127.0.0.1` and handed to `supabase start --network-id <net>` makes
  every published port bind `127.0.0.1` only — measured: `ss` shows `127.0.0.1:54521` and `127.0.0.1:54522`, and a
  probe from a container on the default bridge to the LAN address and to `172.17.0.1` is refused on both, while the
  control port published without the option is reachable.
- A third stack beside the two: `supabase start` 31.7 s (images present), about 425 MiB (db 83, realtime 220,
  kong 93, rest 15, auth 11). Containers: `supabase_{db,kong,auth,realtime,rest}_<project>`, each labelled
  `com.supabase.cli.project=<project>`; volumes `supabase_db_<project>` and `supabase_edge_runtime_<project>`.
  `docker port supabase_db_<project>` prints `5432/tcp -> 127.0.0.1:54522`.
- The old chain on it: `scripts/bootstrap-db.sh` with `DXB_DATABASE_URL` (TCP), `DXB_PSQL='docker exec -i <db> psql -U
  postgres -d postgres'` and `DXB_PSQL_ADMIN='docker exec -i <db> psql -U supabase_admin -d postgres'` — 21.6 s, exit
  0, `applied 188, skipped 0, ledger total 188`; then `public` has 62 tables, 34 views, 234 functions; schemas
  `auth` (23 tables) and `realtime` are the platform's real ones; `pgboss` and `dxb_internal` exist.
- `supabase stop --no-backup --workdir <dir>`: 11.2 s, no container and no volume left; a network passed with
  `--network-id` is left standing.
- Identity is `(system_identifier, database oid, database name)` read from the server:
  `select system_identifier::text from pg_control_system()` and `select oid::text, datname from pg_database where
  datname = current_database()`. Tonight: company `7674907968528752679`, old bench `7690665340837392423`; the
  database is `5 | postgres` in all three clusters, so the cluster's identifier is what tells them apart.
- The CLI's local credential is fixed and public (`postgres` / `postgres`); it is the bench's address, not a secret.

## 3. Names and places

| What | Value |
|---|---|
| Project id | `DxB_Foundation` |
| Ports | API `54521`, database `54522` (shadow `54520`; the config's other ports in the `545xx` range) |
| Docker network | `dxb_foundation_bench`, created with `com.docker.network.bridge.host_binding_ipv4=127.0.0.1` |
| Stack config | `foundation/bench/supabase/config.toml` — the old bench's, with only project id and ports changed |
| Refused identities | `foundation/bench/refused.json` — committed: `company` and `old-bench`, each with `sysid`, `measured`, `why` |
| The list of made instances | `${XDG_STATE_HOME:-$HOME/.local/state}/dxb/foundation-bench/instances.json` — machine state, never committed |
| The host lock | `/run/user/<uid>/dxb-foundation-bench.lock`; if that directory is absent, `/tmp/dxb-foundation-bench-<uid>.lock` |
| Root scripts | `foundation:typecheck` · `foundation:test` · `foundation:instance` (takes `up`, `down`, `fresh`, `status`) |

**[lead] The list is machine state, not a committed file** (BUILD.md §4 put the identity file in `foundation/bench`).
Every `up` gives a new cluster identifier; a committed list would dirty the tree on each run, and piece 2 verifies on
a clean copy of the candidate, which must find the same standing instance. What is committed is what never changes
by itself: the refused identities.

**[lead] No environment variable moves the list or the lock.** Library functions take an explicit path for tests;
the command uses the fixed defaults. The only variable the command reads beside `HOME`, `PATH`, `XDG_STATE_HOME` and
`XDG_RUNTIME_DIR` is `DXB_FOUNDATION_LOCK_WAIT` (a positive integer of seconds).

## 4. The contract — `@dxb-foundation/bench` (`foundation/bench/src/index.ts` exports all of it)

TypeScript, ESM, run by Node directly — no build step, only erasable syntax, imports spelled with `.ts`.

```ts
// ---- identity
export type Identity = { sysid: string; dboid: string; dbname: string };
/** Anything that can run one SQL text — a `pg` Client satisfies it. */
export type Queryable = { query(text: string): Promise<{ rows: Record<string, unknown>[] }> };
export function readIdentity(conn: Queryable): Promise<Identity>;

// ---- the guard
export type RefusalReason = "company" | "old-bench" | "not-listed" | "unreadable";
export class TargetRefused extends Error { readonly reason: RefusalReason; readonly identity?: Identity }
/** Pure. A refused identity wins over the list. */
export function decide(identity: Identity, listed: readonly Identity[]):
  { allowed: true } | { allowed: false; reason: Exclude<RefusalReason, "unreadable"> };
/** Reads the identity ON `conn`, decides against the list file; throws TargetRefused. */
export function assertFoundationTarget(conn: Queryable, opts?: { statePath?: string }): Promise<Identity>;
/** assertFoundationTarget on `conn`, then `work(conn)` on the same `conn`. */
export function guarded<T>(conn: Queryable, work: (conn: Queryable) => Promise<T>, opts?: { statePath?: string }): Promise<T>;

// ---- the list
export type InstanceRecord = Identity & {
  project: string; dbContainer: string; containers: string[]; volumes: string[]; madeAt: string;
};
export function defaultStatePath(): string;
export function readInstances(statePath?: string): InstanceRecord[];   // file: { "instances": InstanceRecord[] }

// ---- the host lock
export class LockRefused extends Error {}
export type HostLock = { readonly path: string; held(): boolean; release(): void };
export function defaultLockPath(): string;
/** Synchronous. Not acquired at once (or within waitSeconds) → LockRefused. */
export function acquireHostLock(opts?: { path?: string; waitSeconds?: number }): HostLock;
/** Throws unless this process holds the lock now — asked of the kernel, not of a flag. */
export function assertHeld(lock: HostLock): void;

// ---- removal authority (pure)
export type ContainerFacts = { id: string; name: string; project: string; createdAt: string; volumes: string[] };
export class RemovalRefused extends Error {}
export function selectRemovalTargets(found: readonly ContainerFacts[], record: InstanceRecord | PendingRecord | undefined):
  { containers: string[]; volumes: string[] };
export type PendingRecord = { project: string; pending: true; startedAt: string };

// ---- the instance
export class InstanceStands extends Error {}
export class ExposureRefused extends Error {}
export const BENCH: { readonly project: "DxB_Foundation"; readonly apiPort: 54521; readonly dbPort: 54522;
  readonly network: "dxb_foundation_bench"; readonly bind: "127.0.0.1" };
export function connectionString(): string;   // postgresql://postgres:postgres@127.0.0.1:54522/postgres
export type Status =
  | { state: "absent" }
  | { state: "standing"; record: InstanceRecord }
  | { state: "foreign"; detail: string };   // something carries the project label that the list does not explain
export function instanceStatus(): Promise<Status>;
export function makeInstance(lock: HostLock): Promise<InstanceRecord>;
export function destroyInstance(lock: HostLock): Promise<"destroyed" | "absent">;
```

### The rules behind the signatures

**The guard.**
- `decide`: an identity whose `sysid` equals a refused one is refused with that name **whatever the list says and
  whatever the database**; otherwise allowed only when all three fields equal one listed identity; otherwise
  `not-listed`.
- `assertFoundationTarget`: the identity is read with queries on `conn` itself and nothing is written on `conn`
  before the decision. A list file that is missing, unreadable or malformed lists nothing (fail closed). An identity
  that cannot be read → `unreadable`.
- `refused.json` is read once; the two entries tonight are spelled in §2. Its absence or a malformed file is a
  thrown error, never an empty list.

**The lock.** Kernel-held (`flock`), so it dies with the process — SIGKILL included — and no stale file can hold
it. No pid file, no flag in the environment. `held()` is false after `release()`. Two `acquireHostLock` on the same
path from one process: the second is refused like any other.

**Removal authority.** A name or a label never authorises a removal by itself:
- a container whose `project` or `name` carries a refused project (`DxB_Global_OS`, `DxB_Build`) → `RemovalRefused`,
  before anything else;
- with an `InstanceRecord`: every found container's `id` must be in `record.containers`, else `RemovalRefused`
  naming the stranger; the result is the found ids and `record.volumes` joined with the found containers' volumes;
- with a `PendingRecord` (a make that died before it could write its record): every found container must have
  `createdAt >= startedAt`, else `RemovalRefused`;
- with no record and containers found → `RemovalRefused`; with no record and nothing found → both lists empty.

**`makeInstance(lock)`** — in this order, `assertHeld(lock)` first and again before each destructive step:
1. `foundation/bench/supabase/config.toml` must say project `DxB_Foundation` and the two ports of `BENCH`; else throw
   before anything starts.
2. Anything carrying the project label, or a record on the list → `InstanceStands`; nothing is changed.
3. The network: created with the binding option if absent; if it exists **without** the option → throw.
4. A `PendingRecord` is written; `supabase start --workdir foundation/bench --network-id dxb_foundation_bench`.
5. Every published port of every container of the project must be bound to `127.0.0.1` and nowhere else; otherwise
   the stack is removed and `ExposureRefused` is thrown.
6. The identity is read on both paths the old chain will use — `docker exec` into the database container **by its
   id**, and TCP at `connectionString()` — the two must be equal and `decide` against an empty list must answer
   `not-listed` (never `company`, never `old-bench`). Then the `InstanceRecord` replaces the pending one.
7. `guarded(...)` on the TCP connection, then the old chain: `bash scripts/bootstrap-db.sh` from the repository
   root, its `DXB_PSQL` and `DXB_PSQL_ADMIN` addressing the database container by id, with an environment that
   holds `PATH`, `HOME` and those three variables and nothing else of the caller's.
8. The ledger (`supabase_migrations.schema_migrations`) holds exactly as many rows as `db/migrations/*.sql` has files.
9. Any failure after step 4 removes what this run made (containers, volumes, the record) and rethrows.

**`destroyInstance(lock)`**: `assertHeld`; nothing with the label and no record → `"absent"`. Otherwise
`selectRemovalTargets` decides; when the database container is running, its identity (read by `docker exec` on its
id) must equal the record's; then the containers are removed by id, the volumes by the names returned, the network
when nothing is attached to it, and last the record. The CLI's `stop` is **not** used: it removes by project name.
After it: no container, no volume, no listener on the two ports, no record.

**Subprocesses**: `execFile`-style, an argument array, never a shell string; the repository root comes from the
package's own location, never from the working directory.

### The command — `node foundation/bench/src/cli.ts <up|down|fresh|status>`

| Call | Prints (last line) | Exit |
|---|---|---|
| `up` | `INSTANCE_UP sysid=<id> db=127.0.0.1:54522 seconds=<n>` | 0 |
| `up`, one stands | `INSTANCE_STANDS` | 3 |
| `down` | `INSTANCE_DOWN` or `INSTANCE_ABSENT` | 0 |
| `fresh` | as `up`, after a `down` under the same lock | 0 |
| `status` | `INSTANCE_STANDING sysid=<id>` · `INSTANCE_ABSENT` · `INSTANCE_FOREIGN <detail>` | 0 · 0 · 5 |
| lock not acquired | `LOCK_REFUSED` | 2 |
| guard or removal refusal | `TARGET_REFUSED reason=<reason>` · `REMOVAL_REFUSED <why>` | 4 |
| anything else | the error | 1 |

## 5. The tests — `foundation/tests/bench/`, written before the code

Run: `pnpm foundation:test` (`vitest run --config foundation/tests/vitest.config.ts`; files in series; the config
sets its own root and never loads the repository's root `vitest.config.ts`, whose environment points at the old bench).

1. **`guard-decision`** (pure): listed → allowed; not listed → `not-listed`; the company's and the old bench's
   identifiers → refused by name even when the list holds them and for any database name; same cluster, other
   database → `not-listed`. The two identifiers are spelled in the test, so an entry dropped from `refused.json`
   turns it red.
2. **`guard-connection`**: with a stub `Queryable` — the company's identity → `TargetRefused("company")` and `work`
   never called; the identity queries reach the stub before any other text; a failing query → `unreadable`; a
   missing, empty and malformed list file each refuse.
3. **`host-lock`** (real processes, a lock path in a temporary directory): a second process is refused while the
   first holds; with `waitSeconds` it acquires after the first lets go; a holder killed with SIGKILL frees the lock;
   `assertHeld` throws after `release()`.
4. **`removal-authority`** (pure, invented container facts — never the real containers of the company): each rule
   of "Removal authority" above, one case each.
5. **`instance`** (the real thing, one file, in order; about two minutes): `fresh` → every published port on
   `127.0.0.1` only; the recorded identity equals what TCP and `docker exec` each answer; the old schema stands
   (ledger rows = files in `db/migrations`; `public.approvals`, `public.task_events`, `public.cost_ledger`,
   `public.chat_messages`, `auth.users`, `realtime.messages`, schema `pgboss`); **no foundation object** (no schema
   `os` or `os_clock`, no role named `os_%`); on the real connection `guarded` runs its work with the real list and
   refuses — `work` not called, no row written — with an empty list, and refuses a throwaway database made in the
   same cluster; `up` while it stands → exit 3, the same identity still answers; `down` with the list emptied →
   exit 4 and the instance still stands; `down` → no container, volume, listener or record; `down` again →
   `INSTANCE_ABSENT`, exit 0.
6. **`no-old-address`** (static, over `foundation/**` without `node_modules`): no spelling of the four old ports,
   of a company variable or of an env file of the old system; `process.env` is read only for the names of §3.

A test never recomputes its expected value the way the code does, never connects to the company or the old bench,
and never removes a container, volume or network it did not see made by this bench.

## 5a. What the tests pinned beyond §4 (the test hand's readings, accepted by the lead)

- The identity queries are §2's two, and their columns keep the server's names: `system_identifier`, `oid`, `datname`.
- `refused.json` is an object keyed `company` and `old-bench`, found relative to the package; a `{}` is malformed.
- `assertHeld` refuses an object that merely says it is held: it must know the locks this process took and ask the
  kernel about that one.
- `createdAt >= startedAt` compares moments, not texts (Docker trims trailing zeros of the fraction).
- `record.containers` holds every container of the project by its id, `record.dbContainer` among them.
- The command runs with only §3's variables in its environment.
- After `down` the network is gone too; `status` with containers and no record says `INSTANCE_FOREIGN`.

Not pinned by a test, because only fault injection could provoke them — these rest on the lead's reading of the
code: step 1 (a config that differs), step 3's refusal, step 5's `ExposureRefused`, step 7's environment, step 9's
cleanup, `destroyInstance`'s identity mismatch, and `TARGET_REFUSED` from the command.

## 5b. After the blind audit (`fable-audit.md`, 2026-11-23) — the contract as corrected

No A finding; ten B. Each is taken; where this section and §3–§5a differ, this section holds.

1. **One lock path, one list path, moved by nothing** (F5). The state directory is
   `<home>/.local/state/dxb/foundation-bench`, `<home>` read from the password database (`os.userInfo().homedir`),
   never from a variable. The list is `instances.json` in it, the host lock `host.lock` in it. Both are resolved once
   per process. `XDG_STATE_HOME` and `XDG_RUNTIME_DIR` are no longer read: the command reads `PATH` and
   `DXB_FOUNDATION_LOCK_WAIT` and nothing else.
2. **The lock outlives a killed parent while its work goes on** (F1). Every child that makes or changes the stack —
   the CLI's start, the old chain — is given the lock's open file, so the kernel keeps the lock until the last of
   them ends. On SIGINT or SIGTERM the command stops its child, removes what the run made under the lock, and exits
   with 130 or 143.
3. **A record is not yet a made instance** (F2). `InstanceRecord` gains `chainAppliedAt?: string`, written only after
   step 8. `standing` requires it; a record without it is `foreign` ("the chain did not finish"), which `fresh`
   removes and remakes. The guard's list is unchanged on purpose: it answers "did the bench make this database",
   and a half-made one is still the bench's to write on and to remove.
4. **Volumes stand under the same authority as containers** (F3, F4).
   `selectRemovalTargets(found, record, labelled)` takes a third argument, the volumes that carry the project's
   label now — `VolumeFacts = { name: string; createdAt: string }`.
   - A volume is removed only when it carries the label now or is mounted by a found container; a name that stands
     only in the list file's text removes nothing.
   - With an `InstanceRecord`: a labelled volume that is neither in `record.volumes` nor mounted by a found container
     → `RemovalRefused`. With a `PendingRecord`: a labelled volume created before `startedAt` (both taken to the whole
     second — Docker gives a volume's creation to the second) → `RemovalRefused`. With no record: any labelled
     volume → `RemovalRefused`.
   - `makeInstance` step 2 and `statusOf` count a labelled volume as something that stands: with no record it is
     `foreign`, and a make never adopts it.
   - `destroyInstance` answers `"destroyed"` only after it has looked again and found no container and no volume
     carrying the label; otherwise it throws. It removes the bench's network, when nothing is attached, on every
     path — the `"absent"` one included.
5. **Removal also asks the refused list** (F10): a running database container that answers the company's or the old
   bench's cluster is refused whatever the record says.
6. **The identity queries are schema-qualified** (F10): `pg_catalog.pg_control_system()`, `pg_catalog.pg_database`,
   `pg_catalog.current_database()`; the columns keep their names.
7. **What "on the connection that does the work" means in this piece** (F6). The old chain opens its own sessions
   and may not be edited, so here the work is bound to the checked server by the database container's id and by the
   one container that publishes the port — both paths read and compared at step 6 — not by the session. From piece 3
   on the foundation's own runner checks in the very session that writes. A `Queryable` handed to the guard is one
   session, never a pool.
8. **Pure decisions are exported so that tests pin them** (F8): `statusOf(containers, labelled, list)`,
   `exposedBeyondLoopback(containers): string[]`, `configMismatch(tomlText): string | undefined`,
   `answerOf(failure): { line: string; exit: number }`, with the types `BenchContainer`, `VolumeFacts`, `ListFile`.
9. **`refused.json` is compared with the old system's own record while that record lives** (F7): one test reads
   `tools/hooks/ledger-identity.json` as data — `company.sysid` and the newest `allowed[].sysid` — and fails when
   `refused.json` differs. It leaves with the old system at stage 5.

Still pinned by no test, and why — these rest on reading: the lock asked again before each single removal call and
the record removed last (an observer cannot stop the run between two calls); `ExposureRefused` at step 5 on a live
stack (step 3 refuses the same cause first; the decision itself is now pinned as `exposedBeyondLoopback`); step 6's
two-path inequality (needs a second server on the port); the list file's atomic write.

Known limits after the fixes (the code hand's probes, the lead's reading): the killed-make test passes because the
orphaned start outlives its parent for some seconds (measured 5–11 s) — one that ended within a fraction of a second
would turn that step red without a defect; a create the Docker daemon finishes for a killed start after the removal
has looked again would leave a labelled container with an empty list, which `status` says as `INSTANCE_FOREIGN` and
a hand clears (not seen in five probes); the removal's own Docker calls are not handed the lock.

## 6. Done when

`pnpm foundation:typecheck` exits 0 · `pnpm install --frozen-lockfile` exits 0 with the lockfile unchanged ·
`pnpm foundation:test` passes whole · after it `docker ps -a`, `docker volume ls` and `ss -ltn` show nothing of
`DxB_Foundation` and the two other stacks stand as they were · the old `pnpm typecheck` still exits 0.
