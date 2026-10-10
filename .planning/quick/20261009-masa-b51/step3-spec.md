# B51 step 3 — the spec agreed at the table (Opus 5.5 lead + Fable 5.1 second eye, 2026-10-09 night)

Design source: `fable.md` §1 and §4, with `itiraz-opus.md`'s five objections applied, and the step-2 findings.
His acceptance sentence (registered `all-brains-stay-current-gate-judges-2026-10-09`): *"hey opus 6 çıkmış ey hamza"
dediğimde cart diye modeller güncellenmeli.* No API key exists — subscriptions only (Claude + ChatGPT), his word.

## Pieces, in order — each tested, read by the second eye, committed before the next

| | Piece | Status |
|---|---|---|
| P1 | The catalogue is the one place every model id lives (below) | built 2026-10-10 — see "P1 as built" |
| P2 | `fn_succeed_model(old, new, rationale, authority, key)` — one audited door moves routing rules, employees' brains, model settings and defaults, the gate's two judge seats and the fallback chain in one transaction; old row `retired`, never deleted, no alias; `fn_undo_succession` | built 2026-10-10 — MODEL_ROUTING_SPEC A-2026-10-10 §5 |
| P3 | `resolveExecutionRoute` prefers the task's class row (department-scoped first), falls to tier when `task_class` is NULL — so move 3's efforts reach runs | built 2026-10-10 — A-2026-10-10 §6; goes live with P5 (one scheduler restart) |
| P4 | First succession on the company through P2: Opus 5 → 5.5, Sonnet 5 → 5.5; `codex-5.6` retired through the door on his judges word (`all-brains-stay-current-gate-judges-2026-10-09`; the plan names only the first two) | Sonnet 5.5 + judge retired (20261010040000); Opus 5.5 undone (20261010050000) — the SDK's CLI 2.1.259 cannot call it |
| P5 | Move 3 efforts (critical decisions medium → xhigh, code → high, cheap work stays low) + bundle 3 (C2-3, C2-4, C2-9, C2-12, C2-13 — `.planning/quick/20261004-his-list/item3-report.md`) | P5a efforts built 2026-10-10 (A-2026-10-10 §7); P5b bundle 3 built 2026-10-10 (§8; C2-13 done in step 2) |
| P6 | Hamza: level Genel Müdür, `role` → `general_manager`; talking seats on Opus 5.5 (`voice.answer` stays `low` until B12 measures `medium`); `orchestration`/`decompose` rows on Fable 5.1 (his 2026-09-21 word); SİCİL field 8 names no model | not started |
| P7 | Haiku 5.5 beside Sonnet 5.5 on the same mechanical jobs (classify, summarize, subtitle) — result to him, his decision; B51's "Haiku never returns" stays until his word | not started |
| P8 | New models learned without a key: the source is HIS word — "Halef yap" in the `/ai/models` drawer and Hamza's brain tool. No timer, no scraping (B55 removed that shape on his word). Hamza, asked, says what the lanes list, the catalogue's `last_checked_at`, and that the SDK's own list lags (measured: `supportedModels()` 6 entries, no Opus 5.5) | design agreed |

**Scope question for him (morning, one line under "Sizi bekleyen"):** objection 5 kept Hamza's hands as a separate job,
but his acceptance sentence needs ONE tool in Hamza — the brain tool calling P2's door. Recommendation: only that tool
inside step 3; intent-intake wiring and read tools stay their own job.

## P1 — the catalogue is the one place

**P1.1 One id space, history unbroken.** Live rows carry catalogue ids: the 10 `routing_rules.model = 'sonnet-5'` rows
become `claude-sonnet-5` through the audited path. `model_catalog.aliases text[] default '{}'` keeps retired spellings
(`claude-sonnet-5`: {sonnet-5}; `fable-5`: {opus-5, opus-4.8} — the U20 map's keys), so undo chains, old routing rows
and old evidence still resolve. A ruler (test): no LIVE `routing_rules.model` or `agents.brain` is an alias; each is a
catalogue id with status in {active, testing}. FK on `agents.brain`. **Measure first #1:** which routing column carries
the FK — `model` (what every reader reads) or `model_id` (e71's FK, 25 NULL) — see the measurement below.

**P1.2 New catalogue columns.** `api_model_id text` (the name the lane is called with: anthropic → the SDK id; openai →
the `codex -m` id; local → NULL) · `lane text CHECK IN ('agent-sdk','codex-cli','litellm','local')` (replaces
`workflow/executor.ts:60`'s "in the map → subscription, else api"; **measure first #2:** who reads `routing_rules.mode`
today) · `family text` (opus/sonnet/haiku/fable/gpt-sol/gpt-astra/codex) · `succeeds text FK model_catalog(id)` ·
`released_at date` · `last_checked_at timestamptz` (B42's last-checked date; the price carries this date) ·
`aliases text[]`. CHECK: `status='active' AND lane<>'local'` → `api_model_id NOT NULL`. `fallback_of` is not touched
in P1 (its direction is ambiguous in the data — `fable-5.1→fable-5`, `claude-opus-4-8→claude-sonnet-5`).

**P1.3 New rows (migration, canonical chain).** `claude-opus-5-5`, `claude-sonnet-5-5`: `testing` (P4 activates
through the door), lane agent-sdk, `api_model_id` = id, tier floor L1 / L2, prices from the official table on the
build day (objection 2), `last_checked_at` = that day. `claude-haiku-5-5`: `testing`, `mechanical_only`, L4 — born for
P7's side-by-side test, not activated without his word. `fable-5` / `fable-5.1` keep their names (the core's gotcha);
`api_model_id` = `claude-opus-5` / `claude-fable-5-1`. `gpt-6.1-sol`, `gpt-6-astra`: provider openai, lane codex-cli,
`api_model_id` = id, tier floor L1, not mechanical, status `active` (smoke-tested on their own lane — live gate runs
5-7 on disk; a registered adaptation of §4c's "through LiteLLM" sentence: the smoke test runs on the model's own lane,
no key). `gpt-6.1-sol.succeeds = codex-5.6` (testing, his 2026-08-26 word); `codex-5.6` retires in P4 through the door,
never by hand, on his judges word (`all-brains-stay-current-gate-judges-2026-10-09`). `display_name` = the name he sees (Sol 6.1 / Astra 6).

**P1.4 The judges are routing slot rows** (not a setting, not a role column): two rows, `role_slot`
'gate_challenger_1' / 'gate_challenger_2', `task_class` 'slot.gate_challenger_1/2', department NULL, L1, model
`gpt-6.1-sol` / `gpt-6-astra`, effort high, mode subscription, `needs_council` false, enabled.
`CRITICAL_GATE_CONFIG` is deleted; the gate reads `role_slot LIKE 'gate_challenger_%' AND enabled ORDER BY role_slot`
at claim → {model: catalogue `api_model_id`, label: catalogue `display_name`, effort: the row's effort} — the row's
effort replaces the `model_reasoning_effort="high"` constant (`critical-gate.ts:245`). Why: P2's rewrite of
`routing_rules.model` carries the judges for free; `workClasses()` already keeps role_slot rows out of classification;
the `/ai/orchestration` slot surface shows them without new UI. **Measure first #3:** what
`fn_agents_brain_follows_routing()` does when a department-less slot row changes; whether `fn_select_model` selects by
a role_slot prefix that 'gate_challenger_%' would collide with.

**P1.5 Kernel.** `SDK_MODEL_IDS` is deleted; `resolveModel(name)` → {id, apiModelId, lane, mode, displayName, provider,
status}; retired / disabled / banned is refused loudly (fail-closed); the 8 call sites call it (`voice/answer.ts:131`,
`qa.ts:92`, `chat-drain.ts:135`, `decompose.ts:143`, `worker-shim.ts:413`, `classify.ts:99`,
`workflow/executor.ts:60,109`). Cache: TTL ≤ 60 s plus a `models.version` settings key that P2's door bumps (§4b
Broadcast carries it) → no restart.

**P1.6 Verification.** `tests/c9/model-catalog-one-place.test.ts` red first: (a) no alias on a live row, all catalogue
ids; (b) every active, non-local row has `api_model_id`; (c) the two judge seats exist and the gate reads them
(`CRITICAL_GATE_CONFIG` grep 0); (d) `resolveModel` resolves an alias and refuses a retired id; (e) the executor's mode
comes from the lane. `tests/c9/brain-floor` (14), the routing tests and the seed JSON (regenerated from the live table,
§4e rule) stay green. Sol at xhigh (database + agents). Company writes only through the canonical chain or the audited
function — never a session UPDATE.

## Measurements for P1 (filled in below when taken)
Taken 2026-10-09 ~00:05 by a read-only helper; function bodies have the same `md5(prosrc)` on both engines.

**#1 — `model` vs `model_id`.** The only FK is `routing_rules_model_id_fkey` (`model_id` → `model_catalog.id`);
`routing_rules.model` and `agents.brain` carry none (`agents.brain` defaults to `'glm-5.2'`). Both engines: 39 rows,
25 `model_id` NULL (24 non-slot rows + the disabled `media.creative`), 2 rows differ — `slot.fast_task` and
`slot.low_cost`: `model=sonnet-5`, `model_id=claude-sonnet-5`. Readers of `model_id`: `fn_select_model`
(`JOIN model_catalog m ON m.id = r.model_id`, `20260726002000_brain_floor.sql:117`), `fn_update_routing` (writes
`model` and `model_id` to the same value, `20260713050000_e72_model_stats_onboard.sql:106`),
`fn_agents_brain_follows_routing` (`coalesce(NEW.model_id, NEW.model)`), views `v_role_slots` and `v_model_stats`, the
dashboard's `/ai/orchestration` page (through `v_role_slots`). Every TS reader of the table reads `model`
(`policy.ts`, `write-policy.ts:104`, `classify-read.ts:71`, `context-budget.ts:94`, `workflow/executor.ts:53`).
→ P1.1 closes: `model` becomes the catalogue id on every row and `model_id` is set equal to it in the same migration
(no reader breaks); the FK moves to `model` and `model_id` is dropped only after the five SQL readers above read
`model` — a later piece, not P1.

**#2 — `mode`.** No SQL function reads it; `fn_update_routing` writes only `'subscription'`. Readers: `policy.ts:78`
(ResolvedRoute.mode), `classify.ts:160` and `decompose.ts:243` (refuse non-subscription), `worker-shim.ts:399` (SDK
`query()` vs `llmCall`) and `:524` (tool surface only on subscription), `workflow/executor.ts:50-61,103` (reads the
highest-priority enabled row with `model = work.model`; with none, `SDK_MODEL_IDS[model]` decides; subscription → SDK
`query()` with the seat's tools, else `llmCall` through LiteLLM with no tools).
→ P1.2: the executor's fallback reads the catalogue's `lane` (agent-sdk → subscription) instead of map membership;
`routing_rules.mode` stays the row's own switch.

**#3 — judge seats as routing slot rows COLLIDE (P1.4 must change).** (a) `fn_agents_brain_follows_routing` fires on
every routing row but acts only for `media.creative` rows with `match ? 'department'` — a slot row's change does
nothing to brains. (b) `fn_select_model` selects by `role_slot = p_role_slot` after checking it against
`fn_routing_slots()`, a FIXED list of 13 (primary, backup, planning, execution, review, critical_decision, fast_task,
low_cost, research, coding, design, qa, hr): 'gate_challenger_*' would be refused (`VALIDATION_FAILED 'unknown
role_slot'`) by `fn_select_model`, `fn_update_routing` and `fn_model_fallback`, and `v_role_slots` would not show it.
(c) Worse: `resolveExecutionRoute` picks, among department-less enabled rows, the first of the task's tier by
`priority DESC, updated_at DESC`. Company winners today: L1 `slot.coding` (100, fable-5), L2 `code.bulk` (10),
L3 `video.summarize` (10), L4 `slot.fast_task` (100). A new department-less L1 judge row at priority ≥ 100, being the
newest, would take EVERY L1 worker task onto `gpt-6.1-sol` (inferred from the ordering — UNVERIFIED live).
→ P1.4 is reopened at the table. Options: (i) P3 first — execution routes by class and never by a slot row's tier,
then judge rows are safe; (ii) judge rows at a priority below every execution row plus a `fn_routing_slots()`
extension; (iii) judge seats outside `routing_rules` (a catalogue column or a settings key naming two catalogue ids).

## P1 as built (2026-10-10, lead Opus 5.5 `dxb-global-os-2e`, second eye Fable 5.1 `dxb-global-os-e2`)
- **P1.4 settled:** option (iii) as ONE settings key, `gate.challengers` — not a routing row (#3), not a table
  (it would need its own surface and undo chain; the settings family has both and /sys/settings shows it).
  Integrity at write time by trigger `trg_gate_challengers_check` (two seats, different, active, Codex lane,
  effort low…max — codex `models_cache.json` lists low…max + ultra for Sol/Astra; ultra is codex-only).
  Read per run; a seat gone bad → `unavailable` + alert `gate-seat:<n>`, the work runs on. Codex lane only:
  a Claude challenger would judge its own family's work.
- **No `models.version`:** the kernel reads the catalogue per call, uncached (like `loadPolicy`), so there is
  nothing to invalidate. P2 needs no version bump.
- **Nine call sites, not eight:** `tools/dxb-cli/src/promote.ts:83` used the map too.
- **agents.brain default** was `glm-5.2` (retired + banned), also on `fn_hr_create_employee`; both now
  `fn_default_brain()` = the `low_cost` seat's model, so a succession of that seat moves the default.
- **For P2:** the door must also move (a) the 13 `orchestrator.*_model` registry defaults
  (`value_schema->'default'`, `model_ref`) and any `model_ref` settings value; (b) `gate.challengers`;
  `settings_change_log.change_source` CHECK is ui|api|system|undo — 'succession' needs the CHECK widened or
  'system' with the rationale; `control_settings_set` whitelists the system actor to four keys, so the door
  writes the values itself (SECURITY DEFINER) and logs the change rows.
- **For P3:** the department-less fallback takes the highest-priority row of the tier; consider tying it to a
  named seat (Fable's note) — measure and decide there.
- `codex-5.6` = `gpt-5.6-sol` (the gate's 2026-07-26 config); OpenAI prices stay NULL (no per-token price for
  the subscription slugs); `released_at` NULL where the vendor page states no date.


## P5b as built (2026-10-10, lead Opus 5.5 `dxb-global-os-21`, second eye Fable 5.1 `dxb-global-os-e2` → `-1b`)
- SDK fallback held at the primary's tier floor (second eye's B1): today fable-5.1 → claude-opus-5, fable-5 and
  claude-sonnet-5 → none. The isolation ruler stays strict (no opaque spread): `fallbackModel` was added to its
  list, each site writes `model: sdk.model` + a conditional `fallbackModel`.
- **For P4 (second eye's C3):** the door copies fable-5's `fallback_of` (claude-sonnet-5, L2) onto
  claude-opus-5-5, which the floor then drops — Opus 5.5's L1 seats would have no SDK fallback; fable-5.1's
  chain re-points to claude-opus-5-5 (L1, good). Decide in P4 and say it in its diff.
- Open, outside P5b: when the SDK does fall over, nothing records the model that really ran (agent_runs keeps
  the primary) — report "Bulunan", its own small job. Plan mode on chat = two system-prompt variants = two
  cache keys (accepted). The cache hit itself is ⚠ UNVERIFIED (no live call made).

## P4 as built (2026-10-10)
- **Opus 5.5 undone.** A live call after the company migration (~02:45): `claude-opus-5-5` through the company
  SDK → "API Error: 400 Claude Code 2.1.259 does not support this model; version 2.1.280 or newer is
  required", returned as subtype success with is_error true (the lanes read only the result text and would have
  stored the error as the answer; raw: evidence/live-probe-p4-2026-10-10.txt). Undone on the
  company through `fn_undo_succession(76079)` at once (audit 76082), then canonically by 20261010050000; the
  seed's 14 Opus rows back on fable-5; claude-opus-5-5 back to 'testing' (no seat; second eye's B3). Sonnet
  5.5, Opus 5 and Fable 5.1 answered OK through the same path.
  Opus 5.5 returns through the door after an SDK upgrade, a live call first.
- A migration that calls the door three times (guarded: skipped once the old row is retired), the seed's 22
  rows moved to the successors, the bench first (battery), then the company. Calls 1-2 on the plan's key,
  call 3 (codex-5.6 → gpt-6.1-sol) on `all-brains-stay-current-gate-judges-2026-10-09` (second eye's B1:
  the plan never names codex-5.6).
- Standing after the undo: fable-5 → claude-sonnet-5-5 (L2, so no SDK fallback on Opus 5 runs — B1);
  fable-5.1 → fable-5 (L1); claude-opus-5-5 testing with no seat, fallback_of claude-sonnet-5-5;
  gpt-6.1-sol inherited codex-5.6's fallback (claude-opus-5-5) — fn_model_fallback filters no lane, its one
  caller is select-model.ts; the gate reads gate.challengers. Persona bodies name `fable-5` 812 times —
  authorship records (author column, version comments), not brains; untouched.

## SDK and B2 as built (2026-10-10, lead Opus 5.5 `dxb-global-os-e4`, second eye Fable 5.1 `dxb-global-os-1b`)
- **SDK 0.3.296** (785113e8): CLI 2.1.296 = the station's interactive Claude Code; Opus 5.5 answered live
  through company isolation. Three plugins now load in every company call, all bundled in the CLI
  (agents-md, telemetry, plugin-authoring; 0.3.259 loaded none) — what the telemetry builtin sends is
  ⚠ UNVERIFIED (not measurable from the terminal without a network trace).
- **B2 — the smoke gate in the door** (20261010060000): `smoke_ok_at` / `smoke_cli`; the door refuses an
  unstamped successor with SMOKE_REQUIRED; one writer of the stamp, `fn_model_smoke_passed`, for the system
  actor only (a dashboard session cannot attest a call), one audit row `model.smoke` per stamp; its `p_at`
  (default now()) is the call's own time — a stamp from a recorded call carries that time (second eye's B6);
  `scripts/models/smoke.mjs` makes the call (agent-sdk under companyIsolation(): subtype success,
  is_error false, served = asked, "OK"; codex-cli through the gate's own runner, a parsed verdict; litellm
  and local are not stamped). Measured on the bench: opus-5-5, gpt-6.1-sol, haiku-5-5 stamped; a model the
  CLI refuses (claude-opus-9-9) came back subtype success + is_error true and was NOT stamped.
- **Numbering:** B2 took 060000, so Opus 5.5's return is 070000.
