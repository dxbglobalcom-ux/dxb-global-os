# The company's memory drawer on the company's own desk — plan (2026-10-04)

**His words:** proposal (session 9bc3fc3e, 2026-10-04): "Şirketin not çekmecesi inşaatın odasından şirketin
kendi masasına taşınsın mı? Not okuyucu da yalnız o çekmeceyi açar; böylece çalışanlarla Hamza notları
yine aynı yerde bulur. Önerim evet." — CEO: *"Tamam önerini kabul ediyorum."* (verbatim, this conversation)
<!-- CEO-OK: company-memory-drawer-2026-10-04 --> The plan went to him once (item 7, the 32 orphans, included);
his "tamam" was taken as yes and said so — see the ledger entry's conditions.

**The job in one sentence:** every company memory note (obsidian = artifact, graphify = relation) is written
to and read from one absolute folder on the company's desk — the company Claude home — and the reader
opens nothing but a note of exactly the shape the writer produces inside that folder.

## What was measured (2026-10-04)

- `classify-read.ts:253-254` — obsidian and graphify readers hand `memory_index.ref` to `readFile` unchecked
  (Sol phase-3 C1). `graphify.ts:readRelationByRef` has a regex guard but is not wired in.
- `obsidian.ts:44-52` — notes are written relative to `process.cwd()`.
- Since phase 3 (restart 2026-10-03 17:49) the dxb-mcp child of a company Claude call runs with
  cwd = `~/.local/share/dxb/company-claude/work` (raw strace, trace.1803976 line 1 `chdir(...work)`, line 305
  `vfork() = 1803986`; trace.1803986 line 1 `execve(node .../dxb-mcp/dist/index.js)`, no chdir), while
  the scheduler (Hamza's chat and voice recall) runs with cwd = the repository. 24 department profiles grant
  `memory_recall` + `memory_commit`. A note committed through dxb-mcp lands under `work/`; the in-process
  recall looks under the repository; chat/voice swallow the error (`.catch(() => rows: [])`).
- Who can write a ref: only `commitMemory` (`write-policy.ts:303`, ref built from a fresh uuid);
  `syncClaudeMem` has no runtime caller; anon/authenticated/service_role hold no INSERT/UPDATE on
  `memory_index` (`20260717070000_grant_hardening_parity.sql:122-124`). Today's exploitability: DB owner only.
- Company DB (SELECT only): memory_index = notebook 1 · obsidian 1 · pgvector 3; graphify 0. The one
  obsidian row: `e6ce767b-c427-4049-9341-d30f17ad571e`, ref `memory-store/artifact/e6ce767b-….md`,
  media-delivery-qc, 2026-09-05. No `memory_ref_broken` audit row ever; last memory_commit 2026-09-05.
- Repository `memory-store/artifact/`: 33 files. Company DB knows 1; construction DB knows 0. The other 32
  (128,151 bytes, all mtime 2026-07): 27 company work notes (strategy/finance/risk/engineering workers,
  July 2026) + 5 `video-learn` notes on the video-ingest test's default video (jNQXAC9IVRw). Their index rows
  went in his 2026-08-23 wipe — audit `memory.cleared_on_ceo_order`: *"şirketin hafızasını tamamen temizle
  sıfır"* (15,773 memory_index rows; files on disk were not touched).
- The CEO's Bellek page shows no store paths (usage_notes join removed 2026-07-28); refs are unchanged by
  this plan, so the page is untouched.
- vitest.config.ts `env:` is "the ONLY place a suite is told where to work" (DXB_DATABASE_URL,
  DXB_GATEWAY_PROFILE_DIR). `/var/` is gitignored.

## Design

1. **One root, spelled once, fail-closed.** `DXB_MEMORY_ROOT` — the absolute folder a ref resolves against
   (it holds `memory-store/`). memory-router throws when it is unset or relative (the `shared/db.ts` idiom
   for `DXB_DATABASE_URL`); no default inside memory-router.
2. **The scheduler sets it from the company home.** `packages/outbox-executor/src/main.ts`, beside
   `companyClaudeLoginLine()`: `DXB_MEMORY_ROOT ??= companyClaudeHome()` (kernel — the home is already
   spelled once there). `??=`, not `=`: the battery starts the real scheduler (tests/phase4/velocity) under
   vitest's env and must keep the construction's root. Company Claude children inherit it through the `DXB_*`
   allowlist (`companyEnvName`), so the dxb-mcp child resolves the same folder whatever its cwd.
   One start-up line: `[memory] root=<path> notes=<n>` (or `root=unset`).
3. **Refs stay as stored** (`memory-store/<kind>/<uuid>.md`) — no company DB write, Bellek search untouched.
4. **One resolver for writer and reader** (`obsidian.ts`): the ref must match exactly what the writer makes —
   obsidian ⇒ `artifact`, graphify ⇒ `relation`, lowercase uuid, `.md`; path = join(root, ref);
   `realpath(path)` inside `realpath(root)` + separator (symlink escape refused); a regular file. A refusal
   throws, and `makeRefReader` turns it into the existing loud `memory_ref_broken` audit + error.
   `readRelationByRef` goes through it (one guard, not two); `updateGraphIncremental`'s default corpus path
   resolves from the root.
5. **The construction keeps its own drawer.** vitest `env`: `DXB_MEMORY_ROOT` =
   `var/construction-memory` (absolute, `fileURLToPath`). adapters-roundtrip and video-ingest resolve their
   files through the exported resolver.
6. **Data:** copy `e6ce767b-….md` to `<company home>/memory-store/artifact/`, compare sha256, then remove
   the repository copy. Nothing is written to the company database.
7. **The 32 orphans:** deleted only on his yes to this plan (summary given in his plan, per his 2026-09-15
   ruling that a summary suffices).

## Card

job: company memory drawer on the company desk · blast 1 (memory-router, plus the scheduler's start-up
hook and the test config) · risk 2 (security confinement, company data, agents' memory) · reasoning 1
(traversal, symlinks, env inheritance across scheduler → company Claude → dxb-mcp child) · ambiguity 0
= **4, normal** → Sol `high`. Arrangement: the lead writes (four source files; a fork would only re-read
this context); Sol's findings fixed by a fork, verified by the lead (PERMANENT 2026-10-03). Plan written at
`max` (design-plan-architecture-at-max-2026-10-03); code at `high` after his `/effort high`.

## Done-list (each written before the code)

1. `tests/phase6/memory-drawer.test.ts` (new) — RED before the code, GREEN after:
   a. unset / relative `DXB_MEMORY_ROOT` → memory-router throws, naming the variable;
   b. a committed artifact lands at `<root>/memory-store/artifact/<id>.md`, not at `<cwd>/memory-store/…`;
   c. recall refuses — and audits `memory_ref_broken` — an absolute ref, a `..` ref, a wrong-kind ref for its
      store, a non-uuid ref, and a symlink inside the root pointing at a canary outside; the canary text
      never appears in any result;
   d. a good ref under the root reads back (obsidian and graphify).
2. `pnpm vitest run tests/phase6/adapters-roundtrip.test.ts tests/phase7/video-ingest.test.ts` → green; their
   notes appear under `var/construction-memory/`, none under the repository's `memory-store/` or the company home.
3. Scheduler hook: unit test — `??=` keeps a given root, sets the company home when unset; the line prints.
4. `pnpm -r build` (memory-router, kernel, outbox-executor, dxb-mcp) + typecheck → 0 errors.
5. `pnpm construction:battery` → `BATTERY_GREEN` (the isolation ruler included).
6. dxb-mcp child probe, no model call: spawn `node packages/dxb-mcp/dist/index.js` with cwd = the company
   `work` folder and the company allowlist env, against the construction engine; `memory_commit` an artifact
   then `memory_recall` it over stdio JSON-RPC → the note returns, the file sits under the given root.
7. Data move: sha256 equal at `<company home>/memory-store/artifact/e6ce767b-….md`; the repository copy
   gone; company `memory_index` and `audit_log` counts equal before and after (SELECT only).
8. (on his yes) the 32 orphans: count and bytes before (32 · 128,151), 0 after; the live note untouched.
9. `systemctl --user restart dxb-scheduler` → log: `[memory] root=/home/dxb/.local/share/dxb/company-claude
   notes=1`, `[isolation] … credentials=present`, the first tick lines.
10. Live read, no writes: the resolver with the production root reads the note whose ref the company DB
    returns (SELECT) → body begins with its frontmatter id `e6ce767b-…`.

## Out of scope (stays in this folder)

- `library_items` usage_notes for obsidian still says "(repo vault)" in the company's catalogue (not on a
  CEO surface; the construction does not write the company DB).
- Notebook `readDoc(ref)` builds a URL from the ref (HTTP to the notebook server, not a file); not part of C1.
- His 2026-10-04 sentences on Hamza using the whole PC with every tool, plugin, skill and mode — unresolved
  in the conversation; carried to STATE Next in his words, not built here.
