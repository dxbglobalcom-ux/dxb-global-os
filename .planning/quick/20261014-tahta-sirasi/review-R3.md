# Review R3 — the workforce (L3)

Reviewer R3, 2026-10-14. The company was read SELECT-only through `company-gateway.env` (role `dxb_gateway`). The
construction engine was not touched. `Q "<sql>"` below means
`psql "$DXB_COMPANY_GATEWAY_URL" -Atc "<sql>"`, with the URL loaded from the env file and never printed.

**Measured clean on the company. These are not findings and are listed so nobody measures them again:**
- 1 company, 22 departments, 213 agents. Every agent's department exists. Every department has exactly one director,
  and that director is a `director` in the same department. Only `agents-orchestrator` has no manager. No manager
  points at a missing agent or at an agent in another department. No duplicate slugs.
- Personas: all 213 agents are bound to a `passed` persona and `persona_version` = the bound version (0 mismatches).
  0 orphan persona rows. All 213 `persona_path` files exist on disk. Apart from `personas/README.md`, no persona file
  lacks a DB row. The body hash matches between file and DB for **213/213**, using the sync script's own
  `extract_body`, which takes the body from `# PERSONA — ` to the end of the file. For all 213, the dossier's
  Employee ID and Department match the DB row.
- Brains: all 213 `agents.brain` values are active catalogue rows that are not banned (`claude-sonnet-5-5` 166 ·
  `claude-opus-5-5` 33 · `fable-5.1` 14). No retired or banned model is assigned to anyone, and that includes Kimi 3.
  Every `routing_rules` model is active and not banned.
- Library grants: no grant points at a missing item or a missing grantee, and no grant has expired.
- `bash scripts/persona-ruler.sh` → `RULER: 16/16 PASS`, exit 0. The script is read-only (header: "a RUNNER, not a
  second ruler"). It measures only the 16 studio seats by design (`tests/personas/persona-ruler.ts:14-15`). Pointed at
  all 213 files, it reports the other 197 as `NOT-MEASURED (outside the ruler's contract)`. That is the ruler's design
  and not a defect.
- No hard-coded headcount and no "Fable 5" model label appear in `apps/dashboard/messages/*.json` or `src/`. The
  catalogue shows `fable-5` as "Claude Opus 5".

**KNOWN, confirmed on the company (owner: B64 step 1 — built, not applied):** Hamza's levels are not on the company.
`chat_sessions.effort_override` / `last_leg` are absent, and `routing_rules` still reads `chat.answer|high` and
`chat.strategy|max`. Migration `20261014020000_b64_hamza_levels.sql:50-60` targets `medium` / `xhigh`.

### F-R3-1 — The workforce check fails on the real company, but its test stays green because the test bench is seeded to pass it
- Evidence: Running `DXB_DATABASE_URL=<company gateway> node scripts/org/workforce-gate.mjs` (read-only: SELECTs
  only) against the company gives `FAIL  persona-chain  unbound 0 · no-mcp 0 · stale-tag 213` → `GATE FAIL:
  persona-chain`. The other 8 gates pass. The gate and its test still require `persona_version = 'v2.0-fable'`
  (`scripts/org/workforce-gate.mjs:80`, `tests/e125/workforce-gate.test.ts:91-100`). Since W15, the bind door writes
  `'v' || version` (`db/migrations/20260916010000_w15_persona_bind_door.sql:85`), so the company holds `v3`…`v7` on
  all 213 rows. The vitest stays green only because the bench seed hard-writes the old tag
  (`db/seed/build-seed.ts:396`: `persona_version = 'v2.0-fable'`). The roadmap still claims
  `✓ COMPLETE … → 9/9 PASS` (`HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md:159`). The data agrees with itself.
  What lies is the gate, the seed and the roadmap line.
- Owner row: NONE. No open row mentions the workforce gate, `stale-tag` or E12.5. The only claim of "done" is the
  roadmap's E12.5 row, not a board row.
- Layer: L3 · Severity: hurts · Needs his eye: no

### F-R3-2 — The persona folder's README describes a roster from July that no longer exists
- Evidence: `personas/README.md:7-17` says "19 departman + ceo + legal-de (legal pod'u) = 21 DB satırı; aktif kadro
  dosyası 158, hedef 179" and describes a `_library/` folder holding 15 retired files backed by
  `agents.employment_status='archived'`. Measured: `Q "select count(*) from departments"` → 22, and no `legal-de` exists
  (`ls personas/legal-de` → No such file). There are 213 persona files. `ls -la personas/_library` holds only an empty
  `.impeccable/`, because the 15 files were deleted on the CEO's confirmation in `3ae5ac95` on 2026-07-19.
  `Q "select employment_status,count(*) from agents group by 1"` → `active|213`, with 0 archived.
  `Q "… library_items where kind='persona' and source_ref like 'personas/_library/%'"` → 0. The README was last
  touched on 2026-07-11 (`e4295f38`).
- Owner row: NONE
- Layer: L3 · Severity: cosmetic · Needs his eye: no

### F-R3-3 — The persona procedure says the holding has 199 personas; the company holds 213
- Evidence: `.claude/skills/dxb-persona/SKILL.md:8` says "199 of them", `:26` says "identical in all 199" and `:30`
  says "the other 198 personas". Measured: `Q "select count(*) from agents"` → 213, all bound to a passed persona. The
  board's own law text uses "199 active employees" as its example of a STATE claim
  (`00-BOARD-OPEN-WORK.md:65`). That is an illustration, not a claim.
- Owner row: NONE
- Layer: L3 · Severity: cosmetic · Needs his eye: no

### F-R3-4 — The employee drawer shows a persona's author as the raw internal id "opus-5"
- Evidence: `apps/dashboard/src/components/org/org-tree.tsx:553-556` renders `{labels.personaBy}
  {detail.persona_author}` as-is. `apps/dashboard/src/app/api/org/node/route.ts:52-58` adds a CEO-visible
  `brain_label` for exactly this kind of id leak (the U21 comment: the CEO "read the frozen technical id") but adds
  nothing for the author. On the company, `Q "select persona_author,count(*) from v_org_node_detail group by 1"` →
  `opus-5|213`. The drawer therefore reads "by opus-5" in English and "yazan opus-5" in Turkish (`messages/*.json:652`).
- Owner row: NONE
- Layer: L3 (shown on an L7 surface) · Severity: cosmetic · Needs his eye: yes (how it reads on screen)

### F-R3-5 — Two dashboard labels still say the build sessions are "Fable's", and one repeats a date range the code itself calls false
- Evidence: `messages/en.json` → `command.tokens.constructionTitle` = "Build sessions (Fable)" (the Turkish version is
  "İnşaat oturumları (Fable)"). It is the panel title on `/fin/tokens`
  (`apps/dashboard/src/app/(command)/fin/tokens/page.tsx:295`) and on `/ai/memory` (`ai/memory/page.tsx:362`). The
  build crew has been Opus 5.5 since 2026-09-23 (MODEL_ROUTING_SPEC A-2026-09-23). The `/ai/memory` help tip
  (`page.tsx:282`, `help.memory.sections.1.b`) still reads "Fable's own build-session notes (10-24 July)". Twenty
  lines further down, the same page's comment (`page.tsx:351-355`) records that claim as measured false, because the
  store runs past Fable's last day, and records that the panel was renamed for that reason. The rename never reached
  the help text or the title.
- Owner row: NONE
- Layer: L7 (labels about who built it) · Severity: cosmetic · Needs his eye: yes

### F-R3-6 — The employee drawer says "inherit" for three employees who actually run with their own tool set
- Evidence: At runtime the employee's own overlay file is chosen by slug, whatever the DB column says
  (`packages/gateway/src/runtime-profile.ts:167-168`). Overlays exist for 5 employees
  (`packages/gateway/profiles/_manifest.json` `employee_profiles`), matching the 5 employee-kind library grants on
  the company. `Q "select slug,mcp_profile from v_org_node_detail where slug in (…)"` → `media-creative-director|inherit`
  and `engineering-frontend-developer|inherit`. `media-product-brand-consistency` reads `inherit` as well (only 2 of
  the 213 rows carry an overlay name). The drawer prints that column (`org-tree.tsx:606-608`). Three of the five
  overlay holders are therefore shown as inheriting the department kit when they do not.
- Owner row: NONE. The nearest is B41, which measured the same column as "categories — DONE" (`board-rows/B41.md:16`)
  without comparing it with the overlays.
- Layer: L3 · Severity: cosmetic · Needs his eye: no

### F-R3-7 — The Library lists 199 personas; the 14 studio employees are missing from it
- Evidence: `Q "select kind,count(*) from v_library_catalog group by 1"` → `persona|199`. The query listing agents with
  no persona library item returns exactly the 14 `media-*` seats (media-advertising-director … media-vfx-post). There
  are 0 library persona items without an agent. The studio seats joined on 2026-09-03 (B43) without a library row.
  The library screen and the agents' knowledge shelf both read this catalogue (`ai/library/page.tsx`,
  `packages/hook/src/knowledge-shelf.ts`).
- Owner row: NONE. B43, the studio row, lists its open legs (`board-rows/B43.md:42`) and this is not among them.
- Layer: L3 · Severity: cosmetic · Needs his eye: no

### F-R3-8 — The model spec's studio paragraph says two models are in states the catalogue contradicts
- Evidence: `HOLDING-OS-MASTER-PLAN/MODEL_ROUTING_SPEC.md:43` says "GPT Solo 5.6 (`codex-5.6`, catalogue `testing`
  today), GPT Astra 6 (no catalogue row yet …)". The company's
  `Q "select id,status,banned from model_catalog"` → `codex-5.6|retired|f` and `gpt-6-astra|active|f`.
- Owner row: B08, partly. Its row words are "Per-employee brain switch … the top tier a set, new models addable from
  the dashboard, a studio brain panel". Reader A already found that the row names old models. This is the same
  staleness in the spec paragraph B08 rests on.
- Layer: L3 (studio brains; the catalogue is L2) · Severity: cosmetic · Needs his eye: no

## Unsettled

- **Sonnet slots run at `low`.** `Q "… routing_rules where role_slot in ('fast_task','low_cost')"` →
  `claude-sonnet-5-5|low` on both. MODEL_ROUTING_SPEC §4 (line 98, and the roster at line 148) says "Sonnet and Haiku
  never run at `low`". `fn_default_brain()` takes the `low_cost` row, which is why 166 agents carry Sonnet. To settle:
  find out whether "never at low" is in force today or is B64's plan not yet applied (A-2026-10-14), then pass it to R2
  (the engine), whose area this is.
- **All 14 studio seats are on `fable-5.1`.** `MODEL_ROUTING_SPEC.md:43` gives Fable only to "the director, the
  screenwriter and every creative seat", and "every other employee" a different default. Continuity, delivery-QC,
  failure-analysis and sound also read `fable-5.1`, because `trg_agents_brain_follows_routing` moves every slot seat
  of the department with the `media.creative` row. To settle: is a QC or continuity seat a "creative seat" in his
  ruling `studio-brains-open-set-defaults-switchable-2026-09-15`? B64 q2 moves the creative seats to Opus 5.5 later
  anyway.

## For his eye

- ⚠ UNVERIFIED — requires human-eye confirmation: F-R3-4. This is how "yazan opus-5" reads in the employee drawer
  (Organizasyon → an employee).
- ⚠ UNVERIFIED — requires human-eye confirmation: F-R3-5. These are the "İnşaat oturumları (Fable)" panel titles on
  the token-cost and memory screens, and the memory help tip's "Fable'ın kendi yapım-oturumu notları (10-24 Temmuz)".
