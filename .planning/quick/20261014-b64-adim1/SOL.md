# Sol — B64 step 1 (commit e63b8345), one blind pass, xhigh, 2026-10-14

Raw dump: SOL.md.raw (not in git). Sol's final report, verbatim:

**Overall verdict: REFUTED.** The four pieces contain two blockers and six fixes required now. The named anonymous doors are closed, and the supplied battery passed, but that does not establish the complete security and chat-behaviour claims.

Audited commit: `e63b8345` only. Database evidence came from `sql_read`, engine `7690665340837392423/5/postgres`, address `127.0.0.1:54422`, user `sol_reader`, read-only transaction. `SELECT count(*) FROM public.audit_log` returned **1,835 before and after**. No repository or database writes were performed.

Behaviour probes evaluated the committed TypeScript in memory, including injected failures. They did not call a real model or mutate the construction engine.

| Claim | Verdict | Finding | Evidence | Correction required |
|---|---|---|---|---|
| The four pieces stay within the ordered range | STANDS AFTER ATTEMPTED REFUTATION | The diff implements routing closure, chat levels, the further door closures, and goal wording/intake changes. The deferred Hamza tools and voice model change remain outside it. | `git show e63b8345`; four applied migration records; `voice.answer` remains Opus 5.5 `low`. | None concerning scope. |
| The named writing doors are closed to anonymous callers | STANDS AFTER ATTEMPTED REFUTATION | All fourteen named functions deny `anon` while retaining `authenticated` and `service_role` EXECUTE. | Live `has_function_privilege` results; supplied routing and anonymous-door tests passed. | None for these existing ACLs. |
| New functions cannot reopen anonymous writing | REFUTED | **A1:** the completed battery leaves `anon` in the `postgres/public/functions` default ACL again. | Live `pg_default_acl`; B36 resealing path below. | Preserve the closure through the whole battery and recheck its final ACL state. |
| Actor derivation is correct | REFUTED | **B1:** `fn_org_actor` respects the effective role; the helper used by `fn_update_routing` does not. | Applied function definitions and SQL evaluation of their actor expressions. | Correct the routing actor’s handling of direct connections with `SET ROLE`. |
| Hamza’s levels, confirmations and audit records satisfy the contract | REFUTED | **A2, B2–B6:** quoted text changes effort; renewal, notice, confirmation, audit atomicity and English-turn language have gaps. | Committed-code evaluations and source locations below. | Fix each demonstrated scenario. |
| Goal expansion and locale wording work | STANDS AFTER ATTEMPTED REFUTATION | The 500-character truncation is removed; DB and API accept ordinary long goals; both locale dictionaries have identical keys and no visible “niyet/intent” strings. Two older limitations remain under C. | Applied DB constraint; Zod evaluation; locale traversal; chat-board diff; four supplied goal tests passed. | Address C findings in their owning work. |
| The supplied typecheck and battery passed without a test failure | STANDS AFTER ATTEMPTED REFUTATION | Both battery halves exited zero. The battery nevertheless misses the final default-ACL regression. | Full raw-output inspection, detailed below. | Add final security postcondition checks. |
| Every relevant regression was demonstrated red before and green after | UNVERIFIED | No recorded pre-change red output was supplied. Several checks inspect source text or substitute the answer producer. | Audit directory contents; test implementations. | Supply the red evidence and behavioural coverage for the findings. |
| Every migration-header assertion is established | REFUTED | The future-function assurance fails after the battery; exact DB/Zod character parity also fails. Historical company measurements cannot be independently established in this construction-only audit. | A1 and C2 below; applied definitions and body hashes. | Correct the assurances and distinguish historical measurements from verified current state. |

**A — blocks**

- **A1 · Future-function closure is undone.** [Anonymous-door migration:275](</home/dxb/DxB Global OS/db/migrations/20261014030000_b64_anon_doors_closed.sql:275>) correctly removes the schema’s `anon` grant and removes the global `PUBLIC` default. However, [B36 resealing:467](</home/dxb/DxB Global OS/scripts/b36/company-one-way-window.sql:467>) grants future-function EXECUTE to every current non-window role, including `anon`. The host drill applies that SQL at [prove-window-escapes.mjs:181](</home/dxb/DxB Global OS/scripts/b36/prove-window-escapes.mjs:181>), after the B64 tests. The live result is global `{postgres=X/postgres}`, but the `postgres/public/f` row contains `anon=X/postgres`. Future functions can therefore reopen anonymous access while `BATTERY_GREEN` remains true. **Correction:** make resealing preserve the B64 closure; verify supported function creators and both global and schema defaults after the complete battery. `supabase_admin`’s existing permissive defaults also remain outside the migration’s protection.

- **A2 · A quoted instruction becomes the CEO’s command.** [chat-legs.ts:108](</home/dxb/DxB Global OS/packages/orchestrator/src/chat-legs.ts:108>) strips quotation marks before recognising a command. Evaluating `"Max'a geç", diyor müşteri; bu maili değerlendir` returned `{level:"max", rest:"diyor müşteri; bu maili değerlendir"}`. Evaluating the drain then persisted `max`, answered at `max`, and recorded it as the CEO’s act. Likewise, `Hamza, 'Max’a geç.' cümlesini İngilizceye çevir` triggers a change. This contradicts G1-ter’s explicit treatment of inbound/quoted material as information. **Correction:** preserve quotation context; these examples must leave effort and its audit history unchanged.

**B — fix now**

- **B1 · Routing ignores the effective role on direct connections.** [Routing migration:42](</home/dxb/DxB Global OS/db/migrations/20261014010000_b64_routing_door_closed.sql:42>) delegates to [fn_succession_actor:35](</home/dxb/DxB Global OS/db/migrations/20261010020000_b51_succession_door.sql:35>), which examines JWT role and `session_user`, but not the role GUC. With login `postgres`, effective role `authenticated`, and no JWT/user ID, its expression returns `system`; `fn_org_actor` returns `NULL`. The authenticated role has routing EXECUTE, so this direct downgraded connection passes the routing actor guard. Normal PostgREST authenticated/service requests and direct un-switched postgres are correctly recognised. **Correction:** honour the effective role before applying the direct-login fallback. `service_role` is `NOLOGIN` on this engine; no nonexistent direct service-role login needs to be introduced.

- **B2 · Not every CEO message renews the hold.** The successful daemon-command branch returns at [chat-drain.ts:261](</home/dxb/DxB Global OS/packages/orchestrator/src/chat-drain.ts:261>) before renewal. Evaluation: `Max'a geç` at minute 0 → `kapan` at minute 20 → `selam` at minute 31 clears the hold, although the CEO last messaged only eleven minutes earlier. Also, [line 333](</home/dxb/DxB Global OS/packages/orchestrator/src/chat-drain.ts:333>) uses `>`: exactly thirty quiet minutes still retains and renews it. **Correction:** base renewal on every qualifying CEO message and expire at the specified threshold.

- **B3 · Returning to xhigh can be silent.** [chat-drain.ts:346](</home/dxb/DxB Global OS/packages/orchestrator/src/chat-drain.ts:346>) tracks the previous leg rather than the effective effort transition. Evaluation: strategy → `High'a in` → strategy → 31-minute silence → strategy. The final turn returns to default xhigh and records expiry, but emits no xhigh notice because `last_leg` is already `strategy`. **Correction:** recognise this actual transition while retaining the once-only notice for consecutive unchanged strategy turns.

- **B4 · Model failure hides a successful level change.** For `Max'a geç, şu planı düşün`, the hold and audit row are written before the producer runs. Injecting producer failure returned `{answered:0, failed:1}` with `max` still held and **no Hamza confirmation**. The next greeting also ran at max without confirmation. [chat-drain.ts:361](</home/dxb/DxB Global OS/packages/orchestrator/src/chat-drain.ts:361>) publishes confirmation only after a successful answer. **Correction:** deliver the deterministic level acknowledgement independently of answer-generation success.

- **B5 · A level change can survive without its audit row.** [chat-drain.ts:206](</home/dxb/DxB Global OS/packages/orchestrator/src/chat-drain.ts:206>) updates the session, then inserts the audit separately. Production passes an ordinary DB connection at [scheduler.ts:725](</home/dxb/DxB Global OS/packages/outbox-executor/src/scheduler.ts:725>). Injecting audit-insert failure left `effort_override:"max"`, a failed CEO message, and an empty audit history. **Correction:** make the state change and its audit record atomic. A failed audit write must leave the previous level intact.

- **B6 · English strategy turns receive Turkish system text.** [chat-legs.ts:88](</home/dxb/DxB Global OS/packages/orchestrator/src/chat-legs.ts:88>) defines only `STRATEGY_NOTICE_TR`; the drain inserts it regardless of `lang`. An English strategy question therefore receives a Turkish notice alongside its English answer. **Correction:** render the notice in the resolved conversation language, with both language variants covered.

**C — older than this work**

- **C1 · Chat still rejects goals above 4,000 characters.** [Chat API:12](</home/dxb/DxB Global OS/apps/dashboard/src/app/api/chat/route.ts:12>) is unchanged. Its actual Zod schema accepts 4,000 characters and rejects 4,001, while goal intake permits 20,000. The expansion works for the tested 3,000-character message, but larger briefs cannot enter through this chat route. Address this in the remaining goal-entry work.

- **C2 · DB and Zod count characters differently.** [intent-body.ts:11](</home/dxb/DxB Global OS/apps/dashboard/src/lib/intent-body.ts:11>) counts UTF-16 units; PostgreSQL `char_length` counts Unicode characters. `😀` repeated 10,001 times yields DB length **10,001**, satisfying the DB check, but Zod rejects its JS length **20,002**. This counting mismatch already existed with the former 500 bound. Align counting semantics; the numeric constants alone do not establish parity.

The supplied [battery.raw](</home/dxb/DxB Global OS/.planning/quick/20261014-b64-adim1/battery.raw:793>) records:

```text
TYPECHECK_EXIT=0
Sandbox: 156 files passed; 1 skipped; 1398 tests passed; 15 skipped
Host:     22 files passed;             378 tests passed
sandboxed suite : exit 0
host suite      : exit 0
bench residue   : none
BATTERY_GREEN
BATTERY_EXIT=0
```

No failed-test verdict was found. Expected negative-case diagnostics and missing-memory-key warnings are not test failures. The important missed postcondition is **A1**: row-count cleanliness does not detect altered privileges.

For current anonymous access, the configured exposed schemas are `public` and `graphql_public`. The remaining anonymous public writer functions, `claim_next_task` and `reap_expired_leases`, are invokers without the required table-writing privileges. Anonymous callable definers are readers; trigger-returning functions are not ordinary RPC writers. The construction GraphQL function currently returns “extension is not enabled.” The 27 `fn_org_actor` consumers contain NULL-safe guards, including the corrected work-generation guard.

**UNVERIFIED:** running PostgREST schema configuration, authenticated HTTP/daemon execution, real SDK model calls, rendered UI at both locales/widths, pre-change red runs, historical company-header measurements, and independent proof that nothing was applied to `54322`. The Docker socket was denied; no company connection was attempted. These limits do not invalidate the demonstrated findings above.

## Added by the lead from the board-order review (same job, same commit)

- **B7 · The built files break the company's chat at the next scheduler start.** `packages/orchestrator/dist/chat-drain.js` was rebuilt on 2026-10-14 and reads `chat_sessions.effort_override`, `effort_override_at` and `last_leg`. The company does not have these columns, because the migrations are applied to the construction engine only. The resident scheduler (`node packages/outbox-executor/dist/main.js`) runs those files at its next start, and the machine booted 4 times between 10-11 and 10-14. Found by board-order reviewers R2/R4 (`.planning/quick/20261014-tahta-sirasi/review-R2.md`, `review-R4.md`).

## Fixes (2026-10-14, helper-writers, verified by the lead; no second Sol round)

| Finding | Fix | Test (red before, green after) |
|---|---|---|
| A1 | `scripts/b36/company-one-way-window.sql` never grants anon on reseal and re-states postgres' closure (schema row without anon, global PUBLIC revoke) | `tests/b36/live-drills.host.test.ts` (4-ter): after the drill, `pg_default_acl` for postgres holds no anon and no PUBLIC EXECUTE on functions |
| B1 | `db/migrations/20261014050000_b64_actor_effective_role.sql`: `fn_succession_actor` honours the effective role; a postgres login that stepped down to anon/authenticated with no JWT is NULL | `tests/b64/routing-door-closed.test.ts`: SET ROLE authenticated without JWT refused; service_role, the CEO's JWT and plain postgres served |
| A2 | `chat-legs.ts`: any quote mark in a command, or a message opening with one, is not a command | `tests/c9/chat-legs.test.ts` "A2: …" (two cases) |
| B2 | `chat-drain.ts`: every CEO message renews the hold before any branch answers it; expiry at exactly 30 minutes | "B2: …" (two cases) |
| B3 | a change of level clears `last_leg`, so the xhigh notice follows the effective level | "B3: back at the row's xhigh …" |
| B4 | the level confirmation is written even when the answer fails | "B4: … confirmed even when the answer fails" |
| B5 | the level change and its audit row are one transaction (savepoint inside a caller's transaction) | "B5: … previous level stays" |
| B6 | the strategy notice and the confirmation follow the conversation's language (TR/EN) | "B6: an English strategy turn …" |
| B7 | on undefined column (42703) the drain answers at the leg's own level with no hold and warns once per process; `dist` rebuilt | "B7: without the levels migration (42703) …" |

Not fixed here, older than this work (C): C1 (chat route caps a message at 4,000 while a goal may run to 20,000; the voice intake still cuts at 500), C2 (UTF-16 against code-point counting), and `supabase_admin`'s own default ACL in schema public still grants anon EXECUTE (postgres is not a member of `supabase_admin`, so a migration cannot revoke it) — reported to the board-order review.

Typecheck `TYPECHECK_EXIT=0`; battery after the fixes `BATTERY_GREEN` (sandbox 1,409 passed · host 379 passed · bench residue none), raw output `battery-fix.raw` (not in git).
