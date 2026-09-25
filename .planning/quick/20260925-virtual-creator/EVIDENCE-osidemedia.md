# VC pre-audit — OSideMedia/higgsfield-ai-prompt-skill (read-only, 2026-09-25)

- Read-only clones stayed in the session scratchpad (not kept in the repo); the commit ids read are stated below.
- Read-only clones stayed in the session scratchpad (not kept in the repo); the commit ids read are stated below.
Nothing was installed or executed. All paths below are relative to the OSide repo root. R = read at path:line this session; U = not measured.

The repo tags its own evidence: `[OFFICIAL]` (vendor/Higgsfield source), `[FIELD]` (harvested production), `[DEMO]` (tutorial), `[EMPIRICAL]` (practitioner report), `[UNPROVEN HERE]` (one production, not re-tested). The tags are carried into the verdicts below.
**Engine fit caveat for every FORK verdict (R):** the repo says MiniMax H3 (`minimax_h3`, on Higgsfield since the 2026-08-01 snapshot: 5–15s, 2K, start/end image + image/video/audio refs — specs/model-specs.json:1047-1101) has "no prompt doctrine or comparison-table rows yet — pending real generations" (CHANGELOG.md:610; model-guide.md:49). So FORK-AFTER-AUDIT means "the doctrine is written engine-agnostically"; whether it holds on our local H3 is **U** for every rule.

## 1. The 33 skill folders (+ shared/)

All 33 frontmatter `name` values equal the folder name (R, frontmatter dump). Stage keys: ID=identity lock · SHEET=character sheet · STILL · VID=video directing · CAM=camera & shot grammar · ACT=acting & micro-expression · MOT=motion · AUD=audio-voice · FAC=content factory · MKT=marketing · HF-UI=Higgsfield-app-specific · TS=troubleshooting · OTH=other.

| # | folder (`higgsfield-…`) | ver / updated | one-line purpose (R, frontmatter + body) | stage | overlap w/ official | verdict (provenance) |
|---|---|---|---|---|---|---|
| 1 | acting | 1.2.0 / 2026-08-22 | Performance as behavior under pressure: objective, obstacle, tactics, beats, subtext, eye life, 150–220-word master profile, locked voice prompt | ACT, AUD | no | **FORK-AFTER-AUDIT** ([OFFICIAL — Hell Grind brief] + [FIELD]) |
| 2 | apps | 3.0.1 / 2026-05-04 | Which Higgsfield one-click App to use | HF-UI | partial (generate/workflows.md) | HIGGSFIELD-ONLY |
| 3 | assist | 3.1.1 / 2026-07-06 | Higgsfield Assist (GPT-5 copilot), credits, plan choice | HF-UI | no | HIGGSFIELD-ONLY |
| 4 | audio | 3.7.0 / 2026-08-22 | Dialogue/SFX/ambient/BGM layers, lip-sync rules, audio refs as conditioning, cutting separately-generated clips to one music track, Seed Audio/TTS catalog | AUD | yes (generate: Seed Audio 1.0) | **FORK-AFTER-AUDIT, partial** — four layers (:51-169), lip-sync rules (:196-255), scope an audio ref (:279), cutting to music (:376); model sections (:459+) HF-only. Voice generation itself is moot: our voice is the engine's own by CEO law |
| 5 | camera | 3.5.0 / 2026-08-09 | Named camera moves, angles, shot sizes, camera-emotion sync, lens by purpose, shot durations, micro-move distances, what a video reference can/can't carry | CAM | partial (47-line prompt-engineering) | **FORK-AFTER-AUDIT** (drop Cinema Studio 3.0 block :293-370, HF-only; [OFFICIAL — shotlist-builder] + [EMPIRICAL]) |
| 6 | canvas | 1.0.0 / 2026-06-03 | Higgsfield node-graph Canvas | HF-UI | no | HIGGSFIELD-ONLY |
| 7 | character-design | 1.2.0 / 2026-08-22 | World-first story bible: premise → 6-dim world → 9-question character + web → story spine → Style Sheet (hex + Forbidden List) → sheet construction laws → screen test/audition | SHEET, ID (pre) | no | **FORK-AFTER-AUDIT** ([FIELD] sheet laws; [EMPIRICAL — community] screen test) |
| 8 | cinema | 3.4.0 / 2026-08-22 | Cinema Studio 2.5/3.0/3.5 UI, 512-char cap, Elements, Soul Cast, grading presets (2,034 lines) | HF-UI, VID | no | HIGGSFIELD-ONLY (Manual-Style "≤2,000-char block of project LAWS" idea at quick-facts is liftable; U whether it transfers) |
| 9 | content-factory | 1.0.0 / 2026-06-03 | 5-stage campaign pipeline on Marketing Studio: research → plan → generate → publish to Meta Ads → cost report | FAC, MKT | yes (generate/references/marketing-*.md) | HIGGSFIELD-ONLY (pattern lift only: per-batch gate, producibility check). Stage 4 publishes to Meta Ads with a budget tier (publish-and-report-workflow.md:39,70) = ad spend → CEO approval gate |
| 10 | facs | 1.1.1 / 2026-07-26 | Facial acting by FACS Action Unit codes; plan-first sheet; emotion→AU recipes; body micro-beats; per-line dialogue beats | ACT | no | **FORK-AFTER-AUDIT** (AU science standard; model reading of codes [EMPIRICAL], "not a guarantee" :81-107) |
| 11 | gpt-image-2 | 1.2.0 / 2026-06-27 | GPT Image 2 prompt formats A/B/C; product reference-sheet workflow; static ads | STILL, SHEET | partial (product-photoshoot runs on GPT Image 2) | HIGGSFIELD-ONLY (model-specific; reference-sheet-workflow.md §5 views :284 and §6 red-arrow :316 liftable) |
| 12 | image-shots | 3.0.0 / 2026-04-06 | Still-image framing (10 sizes), angles (10), implied motion keywords, still formula | STILL, CAM | no | **FORK-AFTER-AUDIT** (generic vocabulary; low novelty) |
| 13 | marketing-studio | 1.0.0 / 2026-05-18 | Marketing Studio 9 ad presets, hooks, avatars, MCP model | MKT | **yes** — official generate/references/marketing-*.md is the vendor source | HIGGSFIELD-ONLY (superseded by official) |
| 14 | mixed-media | 3.0.0 / 2026-04-06 | Higgsfield artistic preset styles (Noir, Sketch…) | HF-UI | no | HIGGSFIELD-ONLY |
| 15 | models | 3.2.0 / 2026-07-05 | Model selection across the Higgsfield catalog, star ratings, decision tree | OTH | yes (generate/references/model-catalog.md) | HIGGSFIELD-ONLY |
| 16 | moodboard | 3.0.0 / 2026-04-06 | Moodboard presets, Soul Hex colour transfer | HF-UI, STILL | no | HIGGSFIELD-ONLY |
| 17 | motion | 3.2.1 / 2026-07-26 | Named Higgsfield motion/VFX presets; intent-first choreography; Kling Motion Control | MOT | no | HIGGSFIELD-ONLY (intent-first / one-action-per-shot :215-275 liftable) |
| 18 | motion-design | 1.0.1 / 2026-06-22 | MCP flow for animated logo/brand ads | MKT, MOT | loose (video-explainer) | HIGGSFIELD-ONLY |
| 19 | pipeline | 3.5.0 / 2026-08-22 | Chaining Higgsfield tools (Popcorn → … → Recast → assemble); project-first fields; one job per scene; extend-a-clip chain caps | VID, FAC | partial (generate/references/workflows.md) | **FORK-AFTER-AUDIT, partial** (Steps 01–10 method, 80% rule, chain cap 2/hard 3; the tool chain is HF-only) |
| 20 | prompt | 3.7.0 / 2026-08-09 | MCSLA formula, I2V "describe only what moves", one-variable iteration, generic-emotion decomposition, anti-slop list, age-blind rule, double-contrast cut | VID, STILL | partial (47-line prompt-engineering) | **FORK-AFTER-AUDIT** |
| 21 | recall | 3.0.0 / 2026-04-06 | Silently query local filter/quality DBs via `scripts/higgsfield_memory.py` before every prompt and apply fixes without telling the user | TS, OTH | no | **SKIP** — its "run SILENTLY / do not tell the user" directive (:8-10, :49, :104-110) collides with the holding's visibility law; runs repo scripts; DB holds 4 filter + 5 quality entries (db/*.json). The log→recall *pattern* is liftable |
| 22 | recipes | 3.0.0 / 2026-04-06 | 9 genre scene templates (action, drama, product, horror…) | VID | no | **FORK-AFTER-AUDIT** (low value; each recipe names a Higgsfield model) |
| 23 | scene-engine | 1.0.0 / 2026-08-22 | Pre-shoot scene audit: Goal · Obstacle · Tactic · Reversal · Value Shift | OTH (story) | no | **FORK-AFTER-AUDIT** ([DEMO — Tigran] [UNPROVEN HERE], :14) |
| 24 | seedance | 1.14.0 / 2026-08-22 | Seedance 2.0 six-slot formula, filter diagnosis + linter; satellites ENGINE-RULES (84 l.), FAILURE-MODES (579), HELL-GRIND (509), PRODUCTION-PATTERNS (217) | VID, CAM | partial (official defaults to Seedance 2.5) | **FORK-AFTER-AUDIT, satellites only** (Hell Grind pipeline, failure atlas, engine rules are written as craft); filter/linter/enum material is Seedance-on-Higgsfield only. Satellites read at heading level only — depth U |
| 25 | seedance-2-5 | 1.4.0 / 2026-08-22 | Seedance 2.5 omni-reference dialect: mode router, reference roles + exclusions + fidelity grades, material budget, staged long video, emotion cues, real-person formula, hard limits | VID, ID | yes (official generate defaults video to Seedance 2.5) | **FORK-AFTER-AUDIT** for roles/fidelity/staging/emotion/limits ([OFFICIAL — Dreamina] vendor doctrine, :53-66); param surface (:100-136) and Dreamina-only (:648) HF-only |
| 26 | seedance-vfx | 1.0.0 / 2026-06-30 | Video-to-video transformation of the user's REAL footage (add element / swap environment), 4K Seedance std | OTH (VFX) | no | **SKIP** — built on real source footage; the studio's footage is engine-born. Lighting-integration notes are a minor lift |
| 27 | shotlist-director | 1.2.0 / 2026-08-09 | Brief → one connected shotlist: global Style Prefix, @-asset glossary with fidelity grades, named 15s per-scene prompts, tempo and monotony checks | VID, CAM | no | **FORK-AFTER-AUDIT** (drop the HTML/localStorage artifact :334+ and Elements auto-attach; [OFFICIAL — shotlist-builder] + [EMPIRICAL]) |
| 28 | soul | 3.10.0 / 2026-08-22 | Soul ID consistency: identity/motion split, sheets, reference plate, anchor block, state sheets, micro-expressions, variety sheets, Soul Cast | ID, SHEET, ACT | **yes** — official higgsfield-soul-id (trains a Soul Character) | **FORK-AFTER-AUDIT, partial** (sheet/plate/anchor/state rules); Soul ID/Soul Cast/Soul Cinema sections HF-only; **Hybrid Sheet :418-455 SKIP** — pastes a real person's photo into the portrait panel, conflicts with engine-born identity |
| 29 | stack | 1.2.1 / 2026-05-18 | How this skill coexists with Higgsfield CLI / MCP / official skills | HF-UI | describes official — **stale**: says official is v0.3.0 with 3 skills (:28); measured v0.12.0 with 8 | HIGGSFIELD-ONLY (out of date) |
| 30 | style | 3.1.0 / 2026-07-26 | Style/grade/lighting vocabulary, one-style-anchor, "cinematic does nothing", CGI material contract, register poles, 8 style recipes | STILL, VID | no | **FORK-AFTER-AUDIT** (Core Platform Styles :16-91 are Higgsfield presets) |
| 31 | troubleshoot | 3.2.0 / 2026-08-09 | Failure fixes, take triage (5 verdicts), attempt budget, retry ladder, continuation-failure atlas, vision-grounded diagnosis | TS | yes (official generate/references/troubleshooting.md, 34 l.) | **FORK-AFTER-AUDIT** (the ledger/script calls :349-420 are optional) |
| 32 | vibe-motion | 3.0.1 / 2026-06-22 | Higgsfield Vibe Motion: Remotion-code motion graphics | MKT, MOT | loose (video-explainer) | HIGGSFIELD-ONLY |
| 33 | workspaces | 1.2.0 / 2026-06-03 | Which Higgsfield workspace for which job | HF-UI | no | HIGGSFIELD-ONLY |
| + | shared/negative-constraints.md | (no frontmatter, 223 l.) | Artifact → cause → positive prevention phrase tables (body, face, texture, temporal, filter) | TS | no | **FORK-AFTER-AUDIT** (drop Cinema Studio sections :140-170) |

**Counts (of 33 folders):** FORK-AFTER-AUDIT **16** (acting, audio*, camera, character-design, facs, image-shots, pipeline*, prompt, recipes, scene-engine, seedance*, seedance-2-5, shotlist-director, soul*, style, troubleshoot; * = partial) · HIGGSFIELD-ONLY **15** · SKIP **2** (recall, seedance-vfx). `shared/` is a FORK candidate on top.

## 2. The eight deep skills — the rules they carry (R, quoted with path:line)

**soul (skills/higgsfield-soul/SKILL.md)**
- Identity/motion split: "every prompt MUST be split into two blocks" (:100); Identity Block "Does NOT contain: any motion, camera, speed, or temporal language" (:105); Motion Block "Does NOT contain: any character appearance repetition" (:109). Table of which descriptor goes where (:189-200).
- Two-image floor: "never hand a video model a character on a single image. The minimum is one clear face view + one full body" (:368-370) [DEMO].
- Grey ground: sheets on "neutral grey, not white or black" (:373); why: high-contrast edges amplify halo/edge instability (:380-386) [DEMO][UNPROVEN HERE].
- "A sheet is not a menu": "If it sees a detail, it will try to show it" (:225) — erase non-default states, one sheet per scenario (:231-237); captions on a sheet "do almost nothing for video" (:242) [FIELD 2026-08-06].
- Untouched base: face pass in close-up, then looks pass; "the original close-up portrait is never run through a model again" (:261-262); "a new state is a new asset with a new name, never an overwrite" (:280) [FIELD 2026-08-13].
- Reference plate, two axes: Axis 1 biological realism ON (:291); Axis 2 photographic capture OFF on every plate (:296); "The plate carries zero lighting; the scene prompt does all the lighting later" (:303); background "is a FIELD, not a ROOM" (:316); flattering-realism ceiling (:326-332) [DEMO][UNPROVEN HERE].
- Prompt economy: with strong references attached, lean prompts; "say what each one carries" when ≥2 refs (:334-358).
- 6-panel sheet: one prompt, one 16:9 image, 3×2 grid — Panel 1 front body … Panel 6 face detail close-up (:479-503); close with "Identical character identity locked across all six panels. Uniform studio backdrop and lighting" (:505-506).
- Split-panel outfit sheet: ghost-mannequin outfit LEFT, identity close-up RIGHT declared "face matches input 100%" (:516-532).
- Character Anchor Block, 10 per-shot fields: identity · screen position (qualitative + %) · depth layer · frame occupancy % · body orientation · pose · gaze direction · contact points · state lock · facial expression (:541-576).
- Multi-form state: "a separate anchor sheet per state" (:584); five stages = five sheets, shot list names the sheet (:588-593).
- Face-from-wide workaround: crop the face from a closer panel and replace in post (:601-613). Tricky-prop sheets: inside / outside / state variations (:615-633).
- Micro-expression presets: 9 core (Deadpan Neutral, Fierce Focus, Subtle Arrogance, Candid Profile, Post-Workout Fatigue, Predator Glare, Sunblind Squint, Total Dissociation, Controlled Breath) (:706-718) + 10 extended (Suppressed Smile … Vulnerable Openness) (:720-733).
- Variety sheet: a single-character ref "makes a clone army" (:760); build a lineup of distinct people and label it "VARIETY reference" (:773-783) [DEMO].
- Conflict for the studio: § Hybrid Sheet (:418-455) erases generated heads and pastes a real person's photo — against our engine-born identity; its consent clause (:450) confirms it is a real-person technique.

**character-design (skills/higgsfield-character-design/SKILL.md)**
- Fixed order: premise → world (6 dims) → character → spine → style sheet → hand off; "you don't loop back" (:34-43).
- 9-question sheet: thematic role, external goal, internal goal, psychological need, moral need, wound, spark, silhouette, contradiction (:83-94). Web: opponent / ally / mentor / foil (:96-99). Spine beats joined by "therefore / but", never "and then" (:101-111).
- Style Sheet: palette as 5–7 hex codes, "Inject the hex, don't describe colors in prose" (:117); "The Forbidden List is the most valuable field" (:124).
- Sheet laws [FIELD 2026-08-08]: "Plain grey background, always" (:181); creature sheets carry mouth-open and mouth-closed head close-ups (:185); face-lock crop — "Crop the heads out of the full-body panels" so the close-up is the single face source (:191-195); size-ref frame + "render the smaller subject smaller, never larger" (:199-205); fix a flawed sheet with a one-line edit, don't rebuild (:207).
- Screen test before scenes [EMPIRICAL — community]: casting read → 3–6 role options → 3 lines → voice triggers "≤3 comma-separated qualities" (:226) → user picks → one audition prompt "under 3500 characters", MCU/locked camera, unresolved ending (:228-235); divergence rule: a new role type rebuilds the acting from scratch (:237). Silhouette test (:259).

**acting (skills/higgsfield-acting/SKILL.md)**
- Objective is "a verb aimed at the partner… Never a state" (:81-85); 2–4 visible beat changes per scene (:101).
- Master profile: "150–220 words, one flowing paragraph", fixed block order (:282-299); "Every tic has a trigger" (:305); "Build in the mask AND the crack… at least one 'However, when X — …' clause" (:311-316); "No wardrobe" / no camera, no colour (:319-321); "Age is not a profile field" (:326).
- Eye life: "Dead eyes are the number-one tell of AI-generated acting" (:334); "dead eyes are not fixed by lighting tricks, they are fixed by giving the eyes a task" (:342); "Eyes lead the thought" (:353); phased blink "one lazy blink → a quick DOUBLE-BLINK → one HARD reset-blink" (:358).
- Scene adaptation "Transform, don't delete" (:375). Voice: "voice is locked", pasted verbatim (:386); "Not even a synonym… swapping *warm* for *rich*… moves the generated voice" — keep a voice bible (:390-395) [FIELD 2026-08-13].
- "States, not transitions": "mid-throw, arm extended" (:410-417). Ensemble "in a wave, never in sync" (:425). Scale 0–5, "two-truths rule" at 5, "Aim every hero shot at 4+" (:474-490). Pre-send checklist (:492-508).

**facs (skills/higgsfield-facs/SKILL.md)**
- Provenance: the Seedance spec "exposes no FACS field, no expression enum, nothing facial" (:90); "Never tell the user a FACS prompt is deterministic" (:100-101).
- "Plan the expressions you need → generate a FACS sheet for only those → write the codes" (:113); "3–4 expressions max per generation" (:218); codes-only vs codes + anatomical description, test both (:206-214); beat-synced schedule summing to duration (:231-255).
- Recipes (EMFACS): Duchenne AU6+AU12 (:357), forced smile "AU12 only (no AU6)" (:358), sadness AU1+AU4+AU15, fear AU1+AU2+AU4+AU5+AU7+AU20, anger AU4+AU5+AU7+AU23, contempt AU12+AU14 one-sided (:348-366).
- Body micro-beats [OFFICIAL — shotlist-builder]: pick 2–4 tells per register (:375-399); "No tears unless the script explicitly calls for them" (:401); "Never perfect sync across characters" — stagger 0.3–0.5s (:406-408); "Listeners in bokeh are not statues" (:409); the anti-AI test (:413).
- Dialogue: one AU set per spoken beat, 1–2 AUs per beat (:427-440); every line gets pre-line / during / post-line beats (:442-458).

**camera (skills/higgsfield-camera/SKILL.md)**
- "The camera is the emotional double of the focal character" (:194); register → camera table, e.g. anger = handheld jittery (:207), breakdown = slow pull-back, "leave the character alone" (:213); arcs change the camera in named phases (:215-227).
- Max two compatible layered moves; sequenced moves get explicit timing (:182); static pan vs glide stated explicitly (:184).
- Lens by purpose [OFFICIAL]: emotional ECU 85/100mm F1.4 (:244) … wide 35mm F4–5.6; focus-lock clause (:252) and distortion-forbid clause.
- Durations: flash establish 0.3–0.5s (:269), dialogue line 3–7s, wordless reaction 5–10s, emotional CU 8–15s (:262-273).
- Micro-moves: state travel and time, "10–15 centimeters" over 7s (:279); reverse check — "the stated move must be able to produce the stated end framing" (:283) [EMPIRICAL].
- One-Move Rule (:299, Cinema Studio 3.0 section). Video reference: reads world/material/physics/camera character, not identity (:371-440); "Prompt wins on action, reference wins on texture and world feel" (:444).

**shotlist-director (skills/higgsfield-shotlist-director/SKILL.md)**
- Three layers: global Style Prefix (verbatim in every prompt, :55) → @-asset glossary → named per-scene prompts (:61-110). "Multi-state variants get their own locked entry" (:92); each entry carries a fidelity grade (:96).
- Per-scene law: `[STYLE PREFIX] → Characters → Off-screen → Scene → CUT 1..N` (:122-143); Off-screen line = exit side + last state, carried one prompt (:129-132, :161-165, sourced "[EMPIRICAL — MiniMax H3 skill corpus; re-derived]"); target 15s (:146); spell choreography beat by beat (:156); match-cut on a repeated anchor action (:167).
- Density: group rows only when ALL of same cast / location / emotional unit / ≤15s / length (:183-191); split on ANY of location cut, cast change, setup change, performance arc, insert — "Don't fragment grief" (:193-203); complexity budget (:205).
- Whole-sequence gates: tempo budget, durations sum exactly to runtime, one 6–8s hero hold (:241-247); monotony audit — no 3 consecutive cuts share shot size AND move (:249-255). Prompts in English (:327).

**content-factory (skills/higgsfield-content-factory/SKILL.md)**
- UGC-first (:34); button-driven questions (:41); user-facing language rule: no tool names, stage banners (:49-70).
- Mix: 5 formats × 20%, `per_format = floor(VIDEO_COUNT / 5)` (:101-117). Producibility self-check before an idea enters the plan (:174). "Per-batch gate: never fire a whole campaign at once", ask before each batch (:192-199). No on-screen text in prompts (:201). Escape hatch to other models (:212). Stage 4 = Meta Ads scheduling with budget tier (publish-and-report-workflow.md:39-90) — ad spend, CEO gate.

**seedance-2-5 (skills/higgsfield-seedance-2-5/SKILL.md)**
- Formula: subject+action → scene → style → camera → audio; "Generation parameters are not prompt text" (:137-162) [OFFICIAL — Dreamina].
- Every material: role AND exclusion, "Do not use the people in the image" (:35, :166-181); several views "must say they are one subject" (:190); never place a handle in a shot where the subject is absent (:197); "Character sheets leak their staging" — exclude backdrop/panels/layout (:199-202); "Beat lines name characters, never handles" (:203-208).
- Fidelity grades full-preserve / partial-preserve / attribute-transfer (named target) / loose-guide (:210-228) — sourced "[EMPIRICAL — MiniMax H3 skill corpus, re-derived]" (:212).
- Material budget: 30 images (stable 1–8 subjects), 10 videos ≤30s, 10 audio (:230-246). "Spend one view on a strong expression, not four resting faces" — canonical four views incl. facial dynamics and teeth (:248-255).
- Long video: each stage "one primary state change" + explicit end state + [Maintain Consistency] (:310-339); split by JOB (physics vs performance), "a perfect 30s render does not exist" (:341-376).
- Emotion: "Two to four cues is enough for one transition" (:520); real-person 7-slot block with "House override on slot 1… Do not write age" (:564-591); hard limits — "Timestamps allocate time; they are not frame-accurate edit points" (:622-646).

## 3. Customs pre-audit (the B41 / INTEG-01 class)

**Inventory (R):**
- `scripts/` (9 Python files, 6,693 lines): build_index.py, generate_user_guide.py, higgsfield_memory.py, refresh_specs.py, seedance_lint.py, sub_skill_descriptions.py, sync_specs.py, validate.py, validate_user_guide.py. `evals/run_evals.py` (200 l.).
- `requirements.txt`: one package, `fpdf2>=2.8.7,<3` (:6), for the PDF guide only; pytest noted as CI-only (:9).
- `db/`: filter-memory.json (4 entries), quality-memory.json (5), routing-log.json (0), ledger/_global.json (0 rows), ledger/_demo.json (0 rows), memory-summary.md, ledger/README.md.
- `tests/`: conftest.py + 7 test_*.py + 3 JSON fixtures (captured CLI output and a catalog snapshot).
- `.claude/`: settings.json, commands/release.md, commands/validate.md, rules/*.md (5 six-line pointer files). No hooks key in settings.json (R, grep).
- `.github/workflows/`: validate.yml (push to main / PR), spec-drift.yml (weekly cron).

**Imports (R):** stdlib only (json, re, sys, argparse, pathlib, subprocess, shutil, hashlib, csv, io, difflib, datetime, dataclasses) plus fpdf (generate_user_guide.py:28-29), optional pdfplumber (validate_user_guide.py:154), pytest. **No** urllib/requests/http/socket/ftplib/smtplib import anywhere.

**Network (R):** none in Python. The only `https://` strings in .py are text printed into the PDF guide (generate_user_guide.py:386, :422). Network exists only in CI YAML: spec-drift.yml:54 `curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh` (GitHub runner, not local); validate.yml:30, :59 `pip install`.

**Subprocess / shell (R):**
- refresh_specs.py:63 `CLI = "higgsfield"`, :231-233 `shutil.which(CLI)` then `subprocess.run([CLI, *args, "--json"])` — runs whatever `higgsfield` binary is first on PATH (PATH trust). List form, no shell=True. Used for spec-drift pulls.
- validate.py:422 runs evals/run_evals.py; :879 `git ls-files`; :983 runs generate_user_guide.py --dry-run — all `sys.executable`/list form, repo-local.
- validate_user_guide.py:147 `pdftotext` on the repo's own PDF.
- tests: test_memory.py:19, test_validate.py:79/87, test_sync_specs.py:91 run repo scripts.

**File reads/writes outside the repo (R):**
- No `.env`, `expanduser`, `Path.home`, `~/.claude`, `$HOME` or `../` read in any .py (grep). Every script anchors on `Path(__file__).resolve().parent.parent` (e.g. validate.py:27, higgsfield_memory.py:53).
- higgsfield_memory.py:59 lets env var `HF_DB_DIR` relocate the whole DB directory (read + write there); writes via temp files at :108, :286, :423, :1495; ledger project names are regex-validated (:251-257, :916) — no path traversal. `_load_shot_manifest` reads a caller-named path (:1029-1032), read-only.
- Writes elsewhere stay in-repo: specs/ (sync_specs.py:478, refresh_specs.py:425), INDEX.md (build_index.py:194), docs/user-guide/MANIFEST.json (validate_user_guide.py:238).

**Credentials (R):** no key/token patterns (eyJ…, sk-…, ghp_…, AKIA…) anywhere in the tree; zero hits for bearer/api_key/access_token/refresh_token/password in tests/fixtures and specs. The only credential handling is CI: spec-drift.yml:74-82 writes the GitHub secret `HIGGSFIELD_CREDENTIALS` to `$HOME/.config/higgsfield/credentials.json` (chmod 600) **on the GitHub runner**; README.md:297 and spec-drift.yml:11 tell the maintainer to `gh secret set … < ~/.config/higgsfield/credentials.json` (a manual step, not code).

**Install hooks (R):** none — no setup.py, pyproject, package.json, postinstall, Makefile or git hook in the tree. README.md:44 install is `git clone … ~/.claude/skills/higgsfield`; README.md:64 and stack/SKILL.md:26 recommend `curl … install.sh | sh` for the Higgsfield CLI; README.md:79 recommends `npx skills add higgsfield-ai/skills`; CONTRIBUTING.md:11 `pip install -r requirements.txt`.

**Findings that matter at the gate (R):**
- **F1 — shipped permission widening.** `.claude/settings.json:4-10` pre-allows `Bash(git push *)`, `Bash(python3 *)`, `Bash(gh *)`, `Edit(*.py)`, `Edit(*.md)`, `Edit(db/**)`, `Edit(.claude/**)`. If the folder is ever opened as a Claude Code project root, an agent may push, run any python3 and any gh command without a prompt. Strip on fork.
- **F2 — silent-agent directive.** recall/SKILL.md:8-10, :49, :104-110, :136 tell the agent to run the memory script and change the user's prompt without saying so; content-factory:49-55, :163, :195 run steps "silently". Behavioural, not a secret leak — but against the holding's "surface is permanently attached to what the system is doing" law. Strip or rewrite on fork.
- **F3 — agent-run scripts.** Skills instruct the agent to run `python3 scripts/seedance_lint.py` / `higgsfield_memory.py` (recall:75-78, :190-248; troubleshoot:349-420; shotlist-director:287; seedance-2-5:128; facs:480). Local, stdlib, no network — but they execute code on our machine and write into db/. The linter targets Seedance's filter, not H3.
- **F4 — PATH-trust subprocess** (refresh_specs.py:231-233) — only reached by the maintainer's spec-drift job.
- `.claude/commands/release.md:11` sanitises `$ARGUMENTS` before shell use and :21 asks before commit/push — maintainer tooling, irrelevant to us.

**Plain verdict (R):** nothing in this repository reads, collects or sends secrets; no Python file opens a socket or reads `.env`/home/`~/.claude`. The only risks are F1 (permission file) and F2 (silent directives), both removed by forking markdown only and leaving `.claude/`, `scripts/`, `db/`, `tests/`, `evals/`, `.github/` behind.

## 4. License

- R: MIT, "Copyright (c) 2026 O-Side Media" (LICENSE:1-3); root SKILL.md:18 `license: MIT`; README.md:3 badge.
- R: the chain is not clean. content-factory:22, :246 and publish-and-report-workflow.md:161 are "Translated from Adil Aliyev's higgsfield-content-factory source skill"; gpt-image-2:16, :254 and static-ads-workflow.md:27 from Aliyev's corpus; marketing-studio:680 from "Adil — Higgsfield's marketing-tools creator"; canvas:36 and gpt-image-2/reference-sheet-workflow.md:38 from Higgsfield's official guides. CHANGELOG.md:480: "the xianxia repo carries no license; MiniMax skills carry no per-file attribution… All content re-derived in house voice — no source text copied". DISCIPLINE.md:325-328 self-certifies "IP-safe per the audit's pattern-not-text classification".
- U: whether the translated/re-derived passages are legally clean — no upstream license is named in the repo for the Aliyev, Hell Grind or MiniMax sources.

## 5. What the three reference files claim

- R DISCIPLINE.md (no date header): patterns observed in a "Higgsfield-team-adjacent author bundle" of five skills "used inside the Higgsfield production team's actual pipeline… fifteen people, fourteen days, one 90-minute AI feature shipped for Cannes" (:11); three tiers — workflow (confirmation gate, explicit stop between phases, lock-before-generate, falsifiable success criteria, log every generation), output (single-variable iteration, systematic-vs-stochastic fork, anti-bombast), architectural (3-stage/4-phase loop, closing block in every prompt, strict-order phases) (:19-320); only dated example: v3.7.10 dogfood 2026-05-18 (:88).
- R production-benchmarks.md: Hell Grind 90-min feature — 108,859 generations, 9,540,047 credits, ~$400k generation, ~$500k total, 15 people, 14 days (:17-25); acceptance ≈1.0% image / 1.5% video, "quadruple-confirmed" (:31-45); lead character ≈800 generations (600 Soul Cinema + 200 GPT Image 2) before any narrative shot (:47-59); one 10s establishing shot = 72 generations (:61-71); traditional equivalent ~$50M → "roughly 1%" (:85-99). Community harvest `[FIELD — 2026-07-18]`, 13 projects, ~4,000 prompts: 65–100 generations per kept shot, TESTS = 61% of the flagship project, five-bucket folder discipline, best-second splicing (:134-144). Source: the Higgsfield-produced "Road to Cannes" video series (:146-170) — a vendor's own promotion. Internal inconsistency: 90-minute here vs "95-minute" at HELL-GRIND.md:4 and acting/SKILL.md:14.
- R model-guide.md: head-to-head star tables for Higgsfield video/image models; aspect/resolution columns sourced from the `models_explore` snapshot 2026-08-07 (:43); Seedance 2.5 and FLUX 3 Video "not yet field-rated" (2026-08-07, :47); MiniMax H3 and Happy Horse "not yet field-rated" (2026-08-01, :49); Sora 2 UI-only as of 2026-07-05 (:129, :202). U: the basis of the star ratings — no method is stated in the file (grep for rating/methodology found none).

## U items

- U: whether any rule here holds on MiniMax H3 (local) — the repo itself has no H3 doctrine or ratings (CHANGELOG.md:610; model-guide.md:49); nothing was generated.
- U: the "MiniMax H3 skill corpus" that three rules cite (shotlist-director:165; seedance-2-5:212; troubleshoot:324; CHANGELOG.md:480 "MiniMax-H3 bundled skills") — not located or read; a primary source for our own engine likely exists outside this repo.
- U: depth of skills/higgsfield-seedance/ satellites (ENGINE-RULES, FAILURE-MODES, HELL-GRIND, PRODUCTION-PATTERNS) and of cinema, pipeline, gpt-image-2, audio beyond headings/quick facts.
- U: legal cleanliness of translated passages (no upstream licenses named).
- U: basis of model-guide star ratings.
- U: whether the Higgsfield MCP under Plus exposes the Soul ID / Elements / Cinema Studio features the HF-only skills assume (not measured; several are marked Business/Team-only, e.g. soul:848).
- U: the ★636 / 112 forks / pushed 2026-08-23 figures in the brief — the clone shows the last commit 2026-08-22 (R); GitHub counters were not fetched. — RESOLVED 2026-09-25 by the chief engineer via the GitHub API: ★636, 112 forks, pushed 2026-08-23 (EVIDENCE-field-sweep.md §0).
