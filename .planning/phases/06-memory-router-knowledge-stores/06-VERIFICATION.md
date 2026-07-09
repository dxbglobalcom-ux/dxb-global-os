---
phase: 06-memory-router-knowledge-stores
status: passed
verified: 2026-07-09
verifier: "Claude Fable 5 — inline, personally (governance v5); battery + compaction + regression executed 2026-07-09 02:18–02:35 GMT+2, evidence from those recorded runs + same-session executed commands"
---

# Phase 6 Verification — Exit Gate Evidence

All four ROADMAP Phase 6 success criteria, each with the executed command and its decisive output. Two-tier reporting: ✓ VERIFIED carries executed evidence; ⚠ UNVERIFIED names what cannot be machine-checked from this terminal.

## Criterion 1 — Every memory write goes through the router's single write path; provenance recorded, untrusted-origin content quarantined, contradictions flagged before promotion; a deliberate poisoning attempt stays in quarantine

- Single door by construction: raw store writers are NOT exported from the package (`packages/memory-router/src/index.ts` T-06-12 note); every physical write is a `commitMemory` registry call. Executed check (06-06): `! grep -rn "StoreNotWiredError" packages/memory-router/src/` → `NO_UNWIRED_ENTRIES` — all four `KIND_STORE` targets live.
- LOCKED rules 1–5 in `write-policy.ts` in order: origin quarantine (rule 1), embed+judge contradiction flag with fail-closed unparseable-judge (rule 2), promotion CLI-only (`tools/dxb-cli/src/promote.ts`, rule 3), ONE transaction for index+store+audit (rule 4), TTL data half (rule 5) — and rule 5's **cron half closed this plan**: `compactExpired` self-tombstones expired rows delete-free with a batch audit row; `pnpm vitest run tests/phase6/known-facts.test.ts -t compaction` → `2 passed | 2 skipped` (marked, recall-excluded both trust modes, audited, row count unchanged, second run marks 0).
- Poisoning held end-to-end: `tests/phase6/poisoning.test.ts` (in the full-suite line below) — web-origin `sk-FAKE-POISON` credential quarantined at birth (confidence 1.0 notwithstanding), default recall returns zero poisoned ids, worker-style prompt assembly does NOT contain the planted string, quarantine reachable only via `include-quarantined` which appends the `quarantined_recall` audit row in-call.
- **PASS ✓ VERIFIED**

## Criterion 2 — Agents read and write memory only via memory-router MCP tools (memory.recall / memory.commit), with the Obsidian vault + claude-mem wired behind them

- MCP surface is exactly two tools (06-05, executed then): `grep -c "registerTool" packages/dxb-mcp/src/groups/memory.ts` → `2` (`memory_recall`, `memory_commit`; `memory_promote` deliberately absent — promotion is CLI-only, LOCKED).
- Obsidian behind the door: adapters-roundtrip `obsidian` test — artifact commit lands the note on disk under `memory-store/`, recall returns the body (suite line below).
- claude-mem behind the door, pointer-sync ONLY (LOCKED — router never writes into claude-mem): `syncClaudeMem` first run `{scanned:2, inserted:2, skipped:0}`, second `{scanned:2, inserted:0, skipped:2}` (idempotent by ref); write-absence grep (06-06) → `NO_CLAUDE_MEM_WRITE`. Hourly freshness is now scheduled: `grep -n "claude-mem-sync" packages/outbox-executor/src/scheduler.ts` → queue + `memSyncCron: "0 * * * *"` + `boss.schedule` registration.
- **PASS ✓ VERIFIED**

## Criterion 3 — Graphify knowledge graph and open-notebook research brain integrated after their study passes, and a known-fact retrieval test validates routing quality across the store composition

- Study-before-install honored: 5 cards filled at 06-01 (graphify, open-notebook, claude-mem, obsidian-stack, headroom), open-notebook verdict recorded BEFORE install (card: INTEG-01 note), pinned tags `lfnovo/open_notebook:1.10.0` + `surrealdb:v2.6.5`.
- Classification quality (spike, 06-02): `SCORE=20/20` (gate ≥16/20), two independent runs identical — `.planning/master-plan/spikes/06-routing.md`.
- Store integration (06-06): adapters-roundtrip → `7 passed (7)` — graphify corpus note + recall, notebook server-assigned-ref round-trip, cross-adapter atomicity negative (dead notebook → typed `NotebookDownError`, zero orphans).
- **Whole-pipeline retrieval (this plan, master step 10)** — same 20 facts as the spike, committed THROUGH the door, recalled through the production read door (classifier live):
  - Fixture-drift guard (T-06-04): `sha256(known-facts.json)` = `ec5547ca…c37da`, byte-identical to the spike commit (`git show 7ba3e46:tests/phase6/fixtures/known-facts.json | sha256sum` → same digest). Note: the spike report pinned the PROMPT hash; the fixture pin is derived from the spike commit content and recorded here.
  - LIVE gate run (`DXB_LIVE_SDK=1`, real glm-5.2 classifier + real embed-small embeddings): **`BATTERY=19/20`** (gate ≥18/20) — per-question table in 06-08-SUMMARY; single miss Q09 (relation, live classifier misroute; within gate tolerance, spike had it correct).
  - Deterministic run (spike-recorded classifications as seam): **`BATTERY=20/20`**, `4 passed (4)`.
- **PASS ✓ VERIFIED**

## Criterion 4 — A long-running task stays inside a clean context via compression (headroom), summaries, and memory offloading — demonstrated against a context-rot scenario

- 06-07 executed demo (real worker shim, 50 steps × ~800 est. tokens): CONTROL (mechanism off) final context **37,018 tokens > 16,000 hard limit** — the rot demonstrated; MANAGED run: 4 compressions at steps 17/28/38/48, every per-step measurement ≤ hardLimit, post-compression ≤ softLimit, compressions evented (`context_compressed`), planted facts evicted from live context recalled back via `recallMemory` (offload is memory, not amnesia).
- Measurement log committed: `tests/phase6/context-rot.log` (51 lines) — `awk -F, 'NR>1 && $2+0 > 16000 {exit 1}'` → `BAND_HELD`.
- Offload rides the single door: `context-budget.ts` grep → `NO_DIRECT_WRITE`, provenance `source:'context-offload'`.
- headroom's role is the SESSION-layer complement per its 06-01 card (plugin active); MEM-04 is satisfied at the OS layer by `context-budget.ts` — not by pointing at a harness plugin.
- Live run with the real summarize-class model green (06-07 SUMMARY).
- **PASS ✓ VERIFIED**

## Full-suite regression (all criteria ride on it)

- `pnpm vitest run` (2026-07-09 02:35) → **`Test Files 23 passed (23)`, `Tests 106 passed | 14 skipped (120)`** — includes poisoning, recall, contradiction, pgvector, adapters-roundtrip, context-rot, known-facts, and the phase-4/5 gates (no regression on closed phases).

## ⚠ UNVERIFIED (honest tier)

- **Cron runtime firing**: `memory-compaction` (daily 03:00) and `claude-mem-sync` (hourly) are registered in the scheduler code and their handlers are test-proven, but no scheduler process runs 24/7 on this laptop — first real scheduled fires happen when the VPS runtime lands (Phase 7). The registration itself is grep-evidenced; the unattended firing is not machine-checkable today.

## Deviations / adaptations (CEO-visible, phase-wide)

1. **[ADAPT] migration 0009→0010 filename** (06-03, recorded then): memory_embeddings landed as `20260709000010_memory_embeddings.sql`.
2. **Spike outcome = NO scope reduction**: 06-02 PASSed 20/20, so no §5 fallback was exercised; all four stores stayed in scope (this is the restatement the plan requires — there is no spike-FAIL deviation to report).
3. **Graph-ingest cron REMOVED after first runtime observation (this plan)**: 06-06 had armed `updateGraphIncremental` for a 06-08 schedule and carried it ⚠ UNVERIFIED. First execution (2026-07-09) showed the bare CLI's `update <path>` re-extracts **code files only** — on the markdown relation corpus it exits nonzero with `No code files found - nothing to rebuild`. A nightly cron calling it would fail every tick. Resolution: no graph-ingest schedule; relation notes ingest at the phase-completion `/gsd-graphify build` cycle (existing repo rule). Card + adapter doc corrected with the observed evidence; function kept exported for code-corpus use.
4. **Live battery run under department `os`** (06-07 precedent): router/classifier spend is attributed to the dxb-os LiteLLM key; synthetic departments have no keys (fail-closed proven).
5. **Package-level `pnpm --filter build` scripts don't exist** (house deviation since 06-03): root `pnpm build` (`tsc --build`) is the equivalent executed verification.

---

## FABLE VERDICT — Phase 6 PASSED

Written personally by Claude Fable 5 after reading, in this session: the live battery per-question table (19/20, single relation misroute within tolerance), the deterministic battery (20/20), the compaction test output, the full-suite line (23 files / 106 pass / 14 skip), the phase commit chain `662ac19 → 7ba3e46 → 43d22a8 → 92cfec0 → 294e107 → f1047b7 → 9f3f441 → (this closure commit)`, and the closure diff.

The phase's promise — *the company remembers safely* — holds on executed evidence: one write door with provenance and quarantine that a deliberate poisoning attempt could not cross; a two-tool MCP surface with promotion kept human-side; a four-store composition whose routing quality is measured at 19/20 live across the WHOLE pipeline on the same facts the spike promised; and a context-rot scenario demonstrated then defeated with recoverable memory. The one design change this closure forced (graph-ingest cron withdrawn after live observation) is the process working as intended: observe before scheduling, record before relying. Checker PASS is not the last word — this verdict is.

**Phase 6: CLOSED — PASSED.** Next: Phase 7 (MCP Gateway & 24/7 VPS Runtime); its planning must begin with the gateway study pass (docker/mcp-gateway, ContextForge, Lasso) per the standing blocker note.
