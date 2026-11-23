**Sonuç (kısa):** Parça istenen şeyi ana hatlarıyla yapıyor; şirketin veritabanına yazan ya da şirketin/eski tezgâhın konteynerini silen bir yol bulamadım — A bulgusu yok. Dokuz B bulgusu var; en ağır dördü yarıda öldürülen kurulum, kilidin çocuk süreçleri kapsamaması, geride kalan volume ve liste dosyasının tek başına volume sildirebilmesi. Bu kopyada `.git`, Docker ve `node_modules` yok: commit aralığı ve canlı davranış doğrulanamadı, aşağıda ayrı işaretli.

The audit body is in English, as evidence. Part 0 (conditions and risks, written before the code) is in my previous message.

## What I could not check

- **No `.git` in `/home/dxb/work`.** `git show --stat 46007fc6 e284504c` could not be run.
- **No Docker, no `node_modules`.** Every claim about live behaviour is from reading the code; Supabase CLI internals are from memory and marked.

## Does this do what was asked?

Mostly yes. The frame, the scripts, the lockfile importers, the guard, the lock, the removal by id and the three "tests first" subjects are all present and match SPEC §4. It falls short in four places:

- **"A frozen install proved"** — no evidence of it in the evidence folder (F9).
- **"On the connection that does the work"** — in this piece the guarded connection only reads the ledger count; the chain writes on other connections (F6).
- **"Held from set-up through cleanup"** — true only while the parent process lives (F1).
- **"Destroys it leaving nothing"** — false on the unfinished-make path (F3).

## Claims that stand after attempted refutation

| Claim | Why it stands |
|---|---|
| A container of `DxB_Global_OS` or `DxB_Build` can never be removed | Candidates come only from an exact label filter (`docker.ts:14,55`), then the name/label refusal (`removal.ts:18-22`), then record or pending, then `docker rm --force -- <full id>` (`docker.ts:100`). No `stop`, no prune, no name pattern in the bench's own code. |
| The guard fails closed | Missing or malformed list lists nothing (`instances.ts:50-58`); a bad `refused.json` throws (`guard.ts:33-53`); a refused cluster wins over the list (`guard.ts:61-62`); nothing is sent before the decision except the two selects. |
| Check and act cannot be split on removal | The identity is read by `docker exec` on the same immutable container id that is then removed (`instance.ts:72-86,108-113`). |
| A port answered by another server is caught at make | The database container is the labelled one publishing 54522; its identity inside must equal TCP's, all three fields (`make.ts:88-127`). |
| The lock is the kernel's | `flock(2)` on the open file handed to `flock` as fd 3 (`lock.ts:32-43`); `held()` asks the kernel and compares the inode; `makeInstance`/`destroyInstance` accept only the default-path lock (`lock.ts:95-100`). |
| Exposure | The network option is checked before start (`make.ts:64-75`); every published port is checked after, with removal on failure (`make.ts:78-85`); the instance test reads `ss` itself. I found no path to a standing stack published beyond 127.0.0.1, short of a failed cleanup, which is loud. |
| No company address, key or variable under `foundation/` | Grep for the four ports, `DXB_COMPANY`, JWT-shaped strings and env files: none. `process.env` is read at three places, all names from SPEC §3. |
| The old battery does not pick the foundation up | Root `vitest.config.ts:51` and `tsconfig.tests.json` include neither `foundation/`; the foundation's config sets its own root. |

## Findings

**F1 · B — The lock dies with the parent; its children live on.**
- **Claim:** one host lock from set-up through cleanup. **Verdict:** REFUTED for a killed or timed-out parent.
- **Finding:** the descriptor is opened by Node (close-on-exec) and handed only to the `flock` helper (`lock.ts:34-36,65`). `run.ts:32` gives children nothing of it. `cli.ts` has no signal handler, so SIGTERM/SIGINT end it without the `finally`.
- **The test harness does this itself:** `real-bench.ts:18-19` kills only the CLI on timeout, then `afterAll` runs `down` (`instance.test.ts:87`).
- **Scenario:** `pnpm foundation:instance up`, then `kill -9` the node process during "supabase start", then `pnpm foundation:instance fresh`. The second run takes the lock at once, removes the containers present so far and empties the list; the orphaned CLI creates the rest.
- **Impact:** labelled containers with no record. `status` says FOREIGN, `down` REMOVAL_REFUSED, `up` INSTANCE_STANDS — only a human's hand clears it. Bench-only damage. ⚠ UNVERIFIED live.
- **Correction:** spawn every long child with the lock descriptor in its stdio so the lock lives until the last child exits; handle SIGINT/SIGTERM in `cli.ts` (stop the child, clean up under the lock). Test: kill the CLI mid-`up`; a second `up` must answer `LOCK_REFUSED` while the child lives.

**F2 · B — A record on the list does not mean "made".**
- **Claim:** a made instance has the old schema. **Verdict:** REFUTED for a make killed during the chain.
- **Finding:** the record is written at `make.ts:181`, the chain runs after it at `make.ts:183-187`; `statusOf` (`instance.ts:42-61`) knows nothing of the chain.
- **Scenario:** `kill -9` the CLI during "the old chain". Then `status` prints `INSTANCE_STANDING`, `up` exits 3, the guard allows the identity, and the ledger holds fewer than 188 rows.
- **Impact:** pieces 3–6 take "on the list" as their only target rule and would install on a half-built base.
- **Correction:** a field written only after step 8 (for example `chainAppliedAt`); "standing" requires it. `statusOf` is pure — pin it with a unit test.

**F3 · B — The unfinished-make cleanup leaves labelled volumes, answers "destroyed", and the next make adopts them.**
- **Claim:** after destroy, no volume; a clean install is a new instance. **Verdict:** REFUTED on the pending path.
- **Finding:** a pending record names no volume, so only volumes mounted by found containers go (`removal.ts:34-35`). `instance.ts:129-134` prints "stays…" and returns `"destroyed"`. Step 2 looks at containers only (`make.ts:205`), though SPEC says "anything carrying the project label". `make.ts:177` records every labelled volume, whoever made it.
- **Scenario (runnable):** after a normal `up`, replace the list with `{"instances":[],"pending":{"project":"DxB_Foundation","pending":true,"startedAt":"<a time before the up>"}}`, run `down`. It prints `INSTANCE_DOWN`; `docker volume ls --filter label=com.supabase.cli.project=DxB_Foundation` shows what stayed. SPEC §2 lists `supabase_edge_runtime_<project>` beside five containers, none of which is the edge runtime.
- **Worse case, ⚠ UNVERIFIED:** if the CLI removes its own containers on a failed start and keeps volumes (my recollection of its source), the database volume survives, the next `up` runs Postgres on the previous attempt's data directory and prints `INSTANCE_UP`.
- **Correction:** step 2 refuses when a labelled volume stands; the pending path takes labelled volumes created at or after `startedAt` (the containers' rule); destroy never answers "destroyed" while a labelled volume stands.

**F4 · B — The list file's text alone names volumes for removal.**
- **Claim:** a name or label never authorises a removal by itself. **Verdict:** REFUTED for volumes named by a poisoned record.
- **Finding:** `record.volumes` goes to `docker volume rm` with no label check (`removal.ts:34-35`, `instance.ts:114-120`), and with no identity check when no container is found (`instance.ts:73-74`). The list's path moves with `XDG_STATE_HOME`/`HOME`.
- **Scenario:** `docker volume create dxb_audit_probe`; write a well-formed record naming it in `volumes`; run `down`. The volume is removed and `INSTANCE_DOWN` printed, with zero containers involved.
- **Impact:** the company's volumes are kept only by the substring check at `removal.ts:23-26` and Docker's in-use refusal. No test pins that check — delete those lines and all 110 stay green. Same-user only, so hardening, not escalation.
- **Correction:** a volume is removable only if it also carries the bench's label or is mounted by a found recorded container; add tests for a refused-named volume in a record and for "more than one record".

**F5 · B — "One host lock" has two possible paths.**
- **Claim:** one lock on the host. **Verdict:** REFUTED in one condition.
- **Finding:** `defaultLockPath()` picks `/run/user/<uid>/…` or `/tmp/…` by whether a directory exists now, and is re-evaluated on every assertion (`lock.ts:12-16,97`). This is SPEC §3's own design.
- **Scenario:** run A starts with no login session (directory absent, `/tmp` lock); the user logs in; run B takes the `/run/user` lock. Both hold "the" lock. A fails at its next assertion, its cleanup refuses too, and the CLI prints `LOCK_REFUSED` exit 2 for a half-made stack. Low probability with lingering enabled; I could not check that.
- **Also:** SPEC §3 says no variable moves the list, then names `XDG_STATE_HOME`, which does.
- **Correction:** one fixed path that does not depend on session state; resolve it once per process.

**F6 · B (one sentence in the SPEC) — In this piece the guard does not sit on the working connection.**
- **Verdict:** STANDS for safety; the letter is not met.
- **Finding:** `guarded` at `make.ts:183` checks the TCP client, whose only work is the ledger count. The chain writes through `docker exec` sessions and pg-boss's own TCP connection (`bootstrap-db.sh:31-49`). They are bound to what was checked by container id and by the publishing container, not by session.
- **Correction:** say this limit in the SPEC; piece 3's own runner must check in-session. Note that `Queryable` also accepts a `pg.Pool`, which would split check and work across sockets.

**F7 · B — `refused.json` will go stale silently.**
- **Verdict:** STANDS today; nothing notices tomorrow.
- **Evidence:** both identifiers equal `tools/hooks/ledger-identity.json` now. That file's own note says each reset of the old bench gives the cluster a new identity.
- **Impact:** after the next rebuild of `DxB_Build`, the by-name refusal names a dead cluster; only "not-listed" remains.
- **Correction (lead decides, because BUILD §4 forbids imports from `tools/`):** a static test that reads that JSON as data and compares, or a written step in the old bench's rebuild procedure.

**F8 · B — Test gaps.**
- **Cannot go red for the rule it names:** `removal-authority.test.ts:58-61` ("refuses it with no record") passes by the no-record rule even with the refused-project rule deleted. `instance.test.ts:100` is a tripwire a new cluster can never trip.
- **Recomputes the code's expectation:** `host-lock.test.ts:171-178` copies the `existsSync ? … : …` expression of `lock.ts:15`.
- **Weaker than the code:** `expectNothingStands` finds volumes by name (`real-bench.ts:62-63`) while the code decides by label. The env scan only sees the literal `process.env`; `import { env } from "node:process"` passes it.
- **Unpinned and missing from SPEC §5a:**
  - the lock re-asserted before each destructive step;
  - the default-path rule of `assertTheHostLock` — swap it for `assertHeld` and all stays green;
  - step 6's equality of the two paths and its make-time refusal;
  - step 2 for a foreign or pending state;
  - step 8's failure;
  - `DXB_PSQL` by id rather than by name;
  - the network kept while something is attached;
  - the record removed last;
  - no use of the CLI's `stop`;
  - the list file's modes and atomic write.
- **§5a's "only fault injection could provoke them" is wrong for:** the exposure decision, `statusOf`, the config check (all pure — export and unit-test them), `answerOf`, and step 7's environment (run `status` with a hostile `DOCKER_HOST` set; a leak turns it red).
- **Missing proof of the central promise:** no test asserts that the set of non-bench containers and volumes is identical before and after the run. A read-only `docker ps`/`docker volume ls` comparison would do it.

**F9 · B — Evidence missing for "Done when".**
- **Verdict:** UNVERIFIED.
- **Finding:** the log shows the typecheck and 110 passing tests; the per-file counts match the test files as I counted them. It does not show the revision it ran on, `pnpm install --frozen-lockfile`, the old `pnpm typecheck`, the after-state (`docker ps -a`, `docker volume ls`, `ss -ltn`), or that the other two stacks stand as they were.
- **By reading only:** the lockfile's two importers match the two `package.json` files.
- **Also unverified (no git):** that only the three named old files changed, and that the code commit left the tests untouched. Outside `foundation/` and `.planning/`, only those three files mention the foundation.
- **Correction:** the lead runs these and files the output: `git show --stat` on both commits, and `git diff 46007fc6 e284504c -- foundation/tests`.

**F10 · B (minor) — Hardening.**
- The identity selects are unqualified (`identity.ts:7-8`) and the CLI's own process keeps the caller's `PG*` variables, which `pg` reads (`PGOPTIONS` can set a search path). Qualify with `pg_catalog.`.
- Step 1 checks the file, not what the CLI resolves. ⚠ UNVERIFIED: the CLI may load env files under the workdir and honour `SUPABASE_*` overrides. Every later check still fails closed.
- `destroyInstance` compares the answered identity with the record but never with the refused list (`instance.ts:81`).

**C — older than this work:** the old chain applies a file and its ledger row in two calls (`bootstrap-db.sh:63-64`), already recorded in BUILD §3. A kill between them leaves an applied file unrecorded.

## A make killed at each step

| Killed | What stands | Next `up` | Next `down` |
|---|---|---|---|
| Before step 3 | nothing | proceeds | `INSTANCE_ABSENT` |
| After the network is made | the network | proceeds, reuses it | `INSTANCE_ABSENT`, network stays |
| Pending written, before start | pending record | `INSTANCE_STANDS` though nothing stands | `INSTANCE_DOWN` |
| During start | pending, some containers, orphaned CLI still creating (F1) | `INSTANCE_STANDS` | removes what it sees; unmounted labelled volumes stay (F3) |
| After start, before the record | pending, all containers | `INSTANCE_STANDS` | as above |
| During the chain | full record, partial schema | `INSTANCE_STANDS`, status STANDING (F2) | removes all |
| After step 8 | a whole instance | `INSTANCE_STANDS` | removes all |

## A and B findings in one place

**A:** none.

**B:**
1. F1 — the lock does not cover children of a killed or timed-out parent; no signal handling.
2. F2 — the record is written before the chain; a killed make reads as STANDING.
3. F3 — the pending-path cleanup leaves labelled volumes, says "destroyed", and the next make adopts them.
4. F4 — a record's text alone names volumes for removal; the volume-name refusal has no test.
5. F5 — the lock path depends on a directory that comes and goes; SPEC §3 contradicts itself on the list.
6. F6 — the SPEC must say that the old chain's writes are bound by container id, not by session.
7. F7 — nothing notices when `refused.json` goes stale.
8. F8 — test gaps and an incomplete §5a.
9. F9 — evidence for the frozen install, the after-state, the old typecheck and the git range is missing.
10. F10 — unqualified identity queries, config check reads the file only, no refused-list check in destroy.
