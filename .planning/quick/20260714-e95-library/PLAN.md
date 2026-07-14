# E9.5 — Holding Library: intake script + catalog UI + grant→profile compilation

**Execution ticket only — zero new design decisions.** Plan lives ONCE in `HOLDING-OS-MASTER-PLAN/` (CEO ruling 2026-07-13). Deviations become registered adaptations in HOLDING_LIBRARY_SPEC, never invented here.

## Spec pointers (read THESE sections, nothing broader)

| Source | Section | Binding content |
|--------|---------|-----------------|
| `HOLDING_LIBRARY_SPEC.md` | whole file (139 lines) | goals G1-G4, data model §4 (SHIPPED 0024x/0024x-b), fns §5/6, UI §7, API §8, events §9, authz §13, logging §14/15, security §16 (body NOT in DB — source reference only), errors §17-19 (atomic profile write, union rule), acceptance §20/21 (intake ≥1 rows in 10 kinds; grant revoke → gateway refusal E2E), §24 verification, edges §27 |
| `API_CONTRACTS.md` | 8b `library` row (line 75) | ops: register_item, update_item, grant, revoke_grant |
| `EVENT_MODEL.md` | §9b settings channel (line 74) | `library_item.changed`, `library_grant.changed`; recompile → `system` channel |
| `PERMISSION_MODEL.md` | G2 + §3 layer 4 + edge (line 141) | profile ∩ library_grants ∩ ceiling; grants union WITHIN layer; `expires_at` column on library_grants (spec assigns it to 0024x — NOT SHIPPED → spec-gap, fix here) |
| `DESIGN_SYSTEM.md` | Registered directive section | Iron Man/JARVIS primary; RULE #0 pass mandatory (UI row) |

## Base already live (verified against DB 2026-07-14 02:15)

- `library_items` (20-kind CHECK enum, UNIQUE(kind,name,version)) + `library_grants` + `library_usage_log` + `library_change_log` — 4 tables in DB; 19 rows (15 persona from E5.3b, 4 memory_source), 0 grants.
- `v_library_catalog` v1 (`20260711002500_api_support.sql:272`) — E9.5 replaces (adds usage_notes/dependencies/source_ref/owner names/change count).
- Profile compiler `packages/gateway/src/generate-profiles.ts` (Phase 7: policy grants/denials + registry + tool_pins → 14 dept `.mcp.json`, deterministic, `_source_hash`). Runtime enforcement idiom: `tests/phase7/profile-denial-runtime.test.ts` resolveTool (filter-before-discovery).
- `/ai/library` = ModuleWaiting stub (pageKey library, step E9.5).
- Control seam idiom: `control_project_action` (20260714010000) + `/api/control/projects/route.ts` + tests/e9 CEO-context helper.
- Scheduler: `packages/outbox-executor/src/scheduler.ts` (self-chain + cron pattern; fn cannot reach pg-boss — E9.1 A1 emsal).
- tool_pins: 21 dxb-mcp tools, 0 quarantined. dxb-mcp groups: 8 (approval, audit, cost, crm, dashboard, memory, queue, registry).

## Interpretations (to be REGISTERED in HOLDING_LIBRARY_SPEC as adaptations at close)

1. **A1 control seam**: single `control_library_action(p_payload, p_idempotency_key)` with action ∈ {register_item, update_item, grant, revoke_grant} — E9.1/E9.3/E9.4 single-door idiom (spec §5 wrote `control_library_{...}` family). update_item writes field-level change_log rows INSIDE the fn (§5 binding, cannot be skipped); register_item writes a `{field:'*', old:null, new:...}` creation entry.
2. **A2 expires_at**: `library_grants.expires_at timestamptz NULL` — PERMISSION_MODEL edge (line 141) assigned this to 0024x, which shipped without it → spec-gap rule, fixed here. Expired grants are dead everywhere (compiler + views skip them).
3. **A3 source_ref**: `library_items.source_ref text` — §16 mandates the item body stay OUT of the DB with a source-location reference (repo path / package name / MCP group), but §4 has no field for it. Registered addition; intake fills it.
4. **A4 grant semantics in the compiler** (PERMISSION_MODEL G2 ∩ + §19 union, spec §22 backward-compat clause): per subject, granted capability set = UNION of employee ∪ department ∪ role_level grants (active, non-expired). Department profile: if the department has ≥1 active grant on gateway-enforceable kinds (tool/mcp/skill/plugin), its `_tools` allowlist is INTERSECTED with the granted tool surface; zero library grants → registry behavior unchanged (§22). Employee overlay: employees holding ≥1 employee-kind grant get `<slug>.employee.mcp.json` = dept baseline ∩ their union set. Tool naming bridge: item kind='tool' name=`<server>.<tool>`; kind='mcp' name=`dxb-mcp/<group>` expands to that group's pinned tools.
5. **A5 skills/plugins in the profile**: granted kind='skill'/'plugin' items compile into a `_skills` allowlist key in the same profile file (same filter-before-discovery resolution model as `_tools`); the acceptance "skill grant removal → gateway refusal" is proven through it.
6. **A6 recompile trigger**: a Postgres fn cannot reach pg-boss (E9.1 A1) → scheduler gains `library.profile_recompile` self-chain (30s): regenerate → compare `_source_hash` → swap files only on change (staged dir + rename = §17 atomic rule) → `system` channel `profile.recompiled` event only on change. Tests mock per §20 ("derleme tetiklenir (mock)").
7. **A7 usage-log path**: spec §6 wrote "pg-boss library.usage job" for asynchrony; the async property is ALREADY provided by the E8.1 observability batch buffer (tool_calls writes never block the agent). The queue hop is dropped as redundant: AFTER INSERT trigger on tool_calls matches kind='tool' items and inserts library_usage_log + bumps last_used_at, errors swallowed (counter, not audit). Weekly reconciliation report → P7 boundary.
8. **A8 intake actor**: §13 keeps mutations CEO-only; intake runs in CEO context (set_config request.jwt.claims inside its transaction — E9.4 dogfood emsal), so every registration flows through the control fn with actor='ceo' audit rows.

## Intake source map (G4 — real inventory, nothing invented)

| kind | source | expected |
|------|--------|----------|
| skill | `~/.claude/skills/*/` (dirs with SKILL.md) | ≥20 |
| plugin | `~/.claude/plugins/cache/<mkt>/<plugin>/<ver>` | ≥10 |
| tool | DB tool_pins (server.tool) | 21 |
| mcp | packages/dxb-mcp/src/groups/*.ts (8, stub-error excluded) | 8 |
| persona | personas/<dept>/*.md (meta reference — body stays in personas table, §27) | ~200 upsert |
| policy | packages/gateway/policy/{grants,denials}.json | 2 |
| governance_rule | HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-*.md | ≥4 |
| sop | references/design-bank/CHECKLIST.md + scripts/i18n-purity-check.sh | 2 |
| research | .planning/research/*.md | ≥1 |
| report | "Solo -kadro denetim raporu.odt" + references/design-bank/INDEX.md | ≥1 |
| project_doc | HOLDING-OS-MASTER-PLAN/*.md specs | 31 |
| training | .planning/study-cards/*.md | 1 |
| code_component | packages/* (9 workspace packages) | 9 |
| design_system | references/design-bank/ + DESIGN_SYSTEM tokens | ≥1 |
| memory_source | already registered (4) — intake leaves them | 4 |
| others (prompt_template, workflow, framework, best_practice, lesson_learned) | none found | honest 0 in report |

Acceptance kinds all covered: skill, plugin, tool, mcp, persona, policy, sop, research, report, memory_source ≥1 each.

## Deliverables

1. Migration `20260714020000_e95_library.sql` (ONE file, idempotent 2×): expires_at + source_ref columns, v_library_catalog v2, control_library_action (4 ops; CEO wall §13; idempotency twin; change_log inside fn §5; audit §15 detail_ref→library_change_log; settings-channel broadcasts §9 with §15 swallow), trg_library_usage on tool_calls (A7), grants/REVOKEs.
2. `packages/gateway/src/library-profiles.ts`: library layer reader (union/A4) + `compileLibraryProfiles` (staging+atomic swap §17, employee overlays, `_skills` A5, system event on change, unchanged-hash skip) + generate-profiles.ts gains optional library-layer input.
3. Scheduler `library.profile_recompile` self-chain (A6).
4. `scripts/library/intake.mjs` — `--dry-run` (per-kind counts report incl. explicit "0 kayıt" kinds — §26 sessiz eksik yok) / `--apply` (CEO-context control fn per item, upsert by kind+name+version).
5. `/api/control/library/route.ts` (Zod 4 ops, Idempotency-Key, ERROR_STATUS map).
6. `/ai/library` real page (ModuleWaiting DIES): kind-grouped catalog (all 20 kinds visible, honest zero-states §7), item detail — 11 fields + tabs Kullanım (usage trend), Erişim (grant list + add/remove via seam), Geçmiş (change_log), Bağımlılıklar (list, v1). EN+TR.
7. Tests `tests/e9/library.test.ts`: CEO wall, idempotency replay+MISMATCH, register→change_log creation entry, update→field-diff rows, grant/revoke rows + broadcast, expires_at exclusion, compiler intersection + backward-compat (zero-grant dept unchanged) + employee overlay + revoke→tool drops→resolveTool throws (E2E §21) + `_skills` leg, usage trigger match/no-match, anon zero grant.
8. Spec adaptations A1-A8 registered; roadmap E9.5 row ✓; STATE.md; purity allowlist if needed.

## Evidence contract (Evidence-Before-Done)

- vitest tests/e9 green + full regression green; migration idempotent 2×.
- §24 sequence: `\dt library_*` → 4 tables; `node scripts/library/intake.mjs --dry-run` → per-kind discovery report; apply + `SELECT kind, count(*) ... GROUP BY kind` → 10 acceptance kinds ≥1; grant via curl/route → `{"ok":true}`.
- §21 E2E: revoke grant → recompile → resolution refused (test + live compile file diff).
- RULE #0: EN+TR × 1280+1920 /ai/library (+detail state), CHECKLIST walk, i18n-purity-check.sh PASS, baselines e95-*.png (PENDING CEO eye).
- Eye-test mutation hygiene: demo grants/probe rows swept; intake records PERSIST (acceptance data, not demo).
- Commit `feat(E9.5): ...` (Fable, K1).
