# Prompt audit — the holding's prompt surface against Claude Opus 5.5 (Job 2, 2026-09-24)

Procedure: Anthropic's `prompt-audit` (claude-api skill, Steps 0–7). Plan: Job 2 of
`~/.claude/plans/sizin-onay-n-z-bekleyen-tek-giggly-robin.md`, approved by his click on 2026-09-23.
Nothing here is accepted until he looks (LAW B).

## Step 0 — scope and target (stated, not asked)

- **Target model:** `claude-opus-5-5`. The construction crew runs it since 2026-09-23. The runtime
  (the company's employees, `packages/orchestrator` + `packages/voice` + `packages/kernel`) still runs
  Opus 5 through its routing rows. Whether it moves is his decision, board row B51. Runtime text is
  judged against Opus 5.5 anyway, and a row says where the defect is also live on Opus 5 today.
- **Scope:** 256 files, 3.68 MB of persona bodies among them (`slices/BRIEF.md`):
  - construction, 32 files: both CLAUDE.md files, the 12 doors and their references, the 5 agent
    files, the 3 prompt hooks, MEMORY.md, the vendored skill-creator;
  - runtime: 213 persona bodies (214 files under `personas/`, one of them not a persona);
  - 11 runtime code files: prompt-core, answer, persona, chat-drain, chat-legs, decompose, qa,
    worker-shim, council, executor, classify.
- **Coverage:** every line of every file was read by a read-only Opus 5.5 · xhigh auditor.
  - Slice A: construction.
  - Slice B: personas 1–107.
  - Slice C: personas 108–213 and the code. Slice C read 43 of its 106 bodies in full and said so.
  - Slices D1–D3: the other 63, all read in full.
  - Every finding was then re-verified at its `file:line` by the chief engineer
    (`verify-runtime.out`, the checks below). A slice report is a lead, not a finding.

## Summary

- **Construction** (slice A, 28 rows):
  - 11 applied (bucket 1), plus one of the same pattern found by the refuter (B1-12);
  - 12 went to him (bucket 2); H10 was withdrawn by his words of 2026-09-24 00:47, 11 remain;
  - 2 overtaken by the night's refuter redesign;
  - 1 re-judged as keep-list;
  - 5 low flags.
- **Runtime** (slices B, C, D): template-level patterns repeated across up to 213 personas, plus
  file-specific rows and 13 code rows. All of it is report and diff only.
- **Highest impact:**
  1. **Six runtime SDK calls omit `settingSources`.** These are chat, voice, classify, decompose,
     the workflow executor and council. So the construction crew's own instructions — the global
     caveman block, the project CLAUDE.md, the per-prompt hooks — can reach Hamza's answers to the
     CEO. The repository already fixed this leak for seats and QA only (`sdk-isolation.ts:4-23`).
     Which text actually arrives is ⚠ UNVERIFIED: no model call was made.
  2. **Personas hand seats tools they do not hold.** `notify_broadcast` appears in 186 files and
     `WebSearch/WebFetch` in 76. Twelve more files name pg-boss, publish APIs, OAuth, the vault and
     sandboxes. A seat runs with built-in tools off (`worker-shim.ts:376 tools: []`), and 0 of the
     24 gateway profiles grant these names. Taken literally, this sends the model hunting, or leads
     it to claim a check it could not run.
  3. **The always-on construction text is split between old and current wording.** The caveman
     block was measured on Opus 5. The SO13 line says "print the evidence every turn", while the
     report door says "proof only when he asks". The report door still says "a postman" after his
     16 September order. All three are his to decide (bucket 2).

## Bucket 1 — session-written text: APPLIED in P5

Checked by `check-bucket1.py` (acceptance item 8). The diff is in `PROPOSED.diff` section 1.

| id | Location | Finding (pattern) | Change |
|---|---|---|---|
| B1-1 | `~/.claude/agents/scout.md:3` | "Keşif gerektiğinde proaktif kullan." is routing text that invites Opus 5.x over-delegation and contradicts "tek grep → baş mühendis kendi yapar" (G3) | used only for wide multi-directory location sweeps |
| B1-2 | `~/.claude/agents/scout.md:19` | "Çıktı en fazla 40 satır" is a numeric output ceiling (1f) | audience framing: the chief engineer's narrow context; most relevant first; say how many were left out |
| B1-3 | `~/.claude/agents/builder.md:3` | "Uygulama işi geldiğinde kullan" invites a subagent to write code in DXB, where subagents never write (G3, contradicts `.claude/CLAUDE.md` §2) | "— DxB Global OS'ta değil: orada her satırı oturumun yazarı yazar" |
| B1-4 | `~/.claude/CLAUDE.md:57` | subagent brief item "çıktı uzunluk sınırı" (1f) | "çıktıyı kimin, ne için okuyacağı" |
| B1-5 | `dxb-crew/SKILL.md:68` | "TELL THE CEO — 5–6 lines" (1f) | "short" (his own word for it is "az ve öz", SO14) |
| B1-6 | `dxb-crew/SKILL.md:139` | "states the position in four lines" contradicts §0 "empty is silent" (1c, rules that disagree) | "opens with the position (§0 — a line with nothing in it is dropped, not announced)" |
| B1-7 | `dxb-start/SKILL.md:62` | "The two required subagent uses are in dxb-verify": dxb-verify has one audit twin with three triggers (G2, stale fact) | points at `dxb-verify` § The audit twin |
| B1-8 | `dxb-start/SKILL.md:55-56` | tombstone for deleted standing order 11 (1d, migration-relative) | removed; his deletion stands in git and in this report |
| B1-9 | `dxb-rival-intel/SKILL.md:28-29` | tombstone for a deleted length rule (1d) | removed |
| B1-10 | `dxb-research/references/channels.md:47,54-59`; `dxb-research/SKILL.md:168-171` | "twelve doors … all eleven fail". Both prose lists name 11 doors and leave out `browser-signed-in`, door 6 of 12 in `scripts/fetch.py:381-392` (G3, contract mismatch) | both lists name the 12 doors in code order (item 11) |
| B1-11 | `dxb-surface/SKILL.md` § "Opus 5.5's default looks" (new section after his rulings) | add: Opus 5.5's named default looks (1e exception; keep-list 11). Refuter round 1 A-1: first placed inside "His standing rulings", which it is not; moved to its own section with its source | cream page, italic headline accents, "01/02/03" labels, pill buttons stay out unless his approved design shows them; sessions extend this list, never his rulings. Monospace is **not** on the list: the dashboard uses Geist Mono (`globals.css:89`, 9 components) |
| B1-12 | `.planning/STATE.md:123` | "gives him the position in four lines", the same pattern as B1-6 (refuter round 1 C-1, repaired in the same pass) | "opens with the position (core §0 — a line with nothing in it is dropped, not announced)" |

## Bucket 2 — his words: for HIM to decide, line by line, NOT applied

Each goes to him in plain Turkish with the proposed rewrite. The hunks are in `PROPOSED.diff`
section 2, where one exists; the others give their replacement text here.

H10 (softening the global Tooling Mandate's "never answer I can't" and ranking a project's install
rules above it) is withdrawn: his live words of 2026-09-24 00:47 (*"CEO OLARAK BU PROJEDE NE İSTERSEM
YAPILACAK TECH İLE İLGİLİ HERŞEY MÜMKÜN ÇÖZÜMÜ SİZ ÜRETİP FERRARİ SEVİYESİNDEKİNİ SİZ YAPACAKSINIZ"*)
reaffirm the mandate at full strength (LAW A). 20 rows remain.

| id | Location | What is dated (pattern) | Proposed | Why it is his |
|---|---|---|---|---|
| H1 | `dxb-start/SKILL.md:96-98` | "Before ending any turn, answer in writing: measured? · complete? · recorded? · verified?" This is the self-check form he replaced on 2026-08-16 (1d, Opus 5 self-check) | remove; SO13's current line carries it on every prompt | restates SO13's old closing line (`no-laziness.sh:11-17`) |
| H2 | `~/.claude/CLAUDE.md:62-74` | the caveman block: fragments and a fixed `[thing] [action] [reason]` pattern, measured on Opus 5 (1f + 1d re-test) | the brevity rule written as choice of content, in whole sentences; re-measure on 5.5 | his global instruction file; the −49 % was his measurement |
| H3 | `.claude/hooks/no-laziness.sh:56` | "full capacity on every turn" (1a booster). "print the evidence … before the turn ends" disagrees with `dxb-ceo-report` "proof … never before he asks" (1c) | booster out; evidence rule kept, reconciled with the report door | STANDING ORDER 13 |
| H4 | `memory/MEMORY.md:102` | always-loaded index lists "Kanun C" as a law. Registered ruling `law-c-not-a-ceo-law-source-unverified-2026-09-15` says it is not (1c) | index line without the law label | laws index; the previous session named it for him |
| H5 | `dxb-ceo-report/SKILL.md:74-79` | "a company, a person, a door, a postman, a warehouse" against his order of 2026-09-16 ("never a factory or a postman", ledger `ceo-analogies-from-our-own-holding-and-short-2026-09-16`) (1c) | comparisons drawn from the holding's own work | SO14 shape |
| H6 | `dxb-verify/SKILL.md:103-110` | the perfection gate as a written three-question ritual on every delivery (1d self-check; scope-expansion tendency) | the bar stated once, as the standard a delivery meets | RULE #0-B, `00-CEO-DIRECTIVE-PERFECTION-GATE.md` |
| H7 | `dxb-verify/SKILL.md:16-18` vs `dxb-operator/SKILL.md:25-27` | two opposite labels for what the author can look at with `operator` (1c) | only what cannot be observed is ⚠ UNVERIFIED; what was observed still waits for his eye | his operator quote; evidence law |
| H8 | `dxb-close-row/SKILL.md:30-38` | capitals and the incident story around a rule the code enforces (1a + G2) | the rule, the order and the two enforcing files | his "1-KOY" order and quote |
| H9 | `dxb-ceo-report/SKILL.md:12-16, 23-27` | capitals and history (C37; 2026-07-30) above the rule (1a + G2) | one sentence each; his quote of 07-30 goes | SO14; his quotes |
| H11 | `no-laziness.sh`, `ceo-language.sh` (UserPromptSubmit) | two lines re-inserted on every prompt (1d, instruction re-insertion) | re-test on 5.5 with both at session start only; move only if drift does not reproduce. No hunk: a test comes first | his ruling `ceo-two-standing-orders-must-be-short-2026-09-14` |
| H12 | `dxb-research/SKILL.md:3` | 186-word description carrying behaviour in capitals (G3 behaviour-smuggling, G2 enumeration) | routing categories + one sentence of what the door is | carries his correction of 2026-09-20 (memory `research-is-my-own-plus-the-door-2026-09-20`) |
| H13 | persona §12, 213 files (e.g. `finance/cfo.md:131-141`) | "Plan before execution" (1b), "Self-review before handoff" (Opus 5 self-check), "No lazy proposals" (1a), "Fable 5 and Solo 5.6 Ultra" (G2), "Inheritance…" (author text in a seat prompt, 1c) | the evidence, handoff and D4 substance kept; the rest out. Must move with ruler R9 canon `0195b993`, `packages/hr/src/fixtures.ts:65`, `EMPLOYEE_PERSONA_STANDARD.md` §4.1 | his rulings D4, D5, D6 and Talep §5.12 |
| H14 | persona §8 "Format sabittir", 213 files (e.g. `cfo.md:104`) | fixed table format vs the later SO14 shape in the same prompt (1f) | conclusion first; the ✓/⚠/❌ labels kept | his directive `00-CEO-DIRECTIVE-AUDIT-2026-07-09.md` |
| H15 | `personas/ceo/agents-orchestrator.md:165-170, 176-203` | SO13's construction laziness list inside Hamza (1a), plus IDs and gate text (G2, 1c) | replacement text in `slices/b-personas-1-107.md` rows 17-18 | his rulings 2026-07-27 |
| H16 | `personas/data-ai/prompt-context-engineer.md:55,100` | "PERSONA YAZARLIĞI … Fable bizzat yazar", in capitals, naming a retired author (G2, 1a) | "…inşaat oturumunun yazarı bizzat yazar" | K2 (`00-CEO-DIRECTIVE-MUST-ROSTER.md:22`) |
| H17 | studio seats: `design/design-image-prompt-engineer.md:64,77`; media-studio rows in `slices/c-…` row 9 | dated "the CEO rejected … on …" narratives; "later word governs" (G2, 1d) | the current rule stated alone | his B43 rulings |
| H18 | `packages/voice/src/prompt-core.ts:111-119` vs eight seats: four social-media seats in slice D2 and, in slice D3, two sales and two social seats (`slices/d3-personas.md` row 3). His own sources also disagree: `.claude/CLAUDE.md` §2 stops e-mail at the CEO; `00-CEO-DIRECTIVE-AUDIT-2026-07-09.md:85` lets routine mail run on its own | the standing approval line stops "an external message" at the CEO. The seats treat routine client reports as autonomous, which matches his directive (`00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT.md:46`) (1c) | text in `slices/d2-personas.md` row 3 | approval gate, CLAUDE.md §2 |
| H19 | `prompt-core.ts:134-135` vs 3 seats | "every deliverable in English" vs client reports in the client's language (1c) | text in `slices/d2-personas.md` row 4 | language directive 2026-07-12 |
| H20 | `prompt-core.ts:148-155` (honesty line, "never estimate") vs the seats whose job is a labelled estimate: ERM, corporate development, deal strategist, workflow optimizer and others (`slices/d1-personas.md` row 3, `slices/d3-personas.md` row 4) | the standing line is stricter than his RULE #0-A, which allows a hypothesis labelled as one (1c) | allow an estimate only where the role calls for one, labelled with its range and basis, never written as measured; the current line's "never recall a figure from an earlier conversation" and "never answer a question you did not understand with a polite guess" are kept (slice D3 row 4 keeps them; slice D1 row 3's text dropped the second, refuter C-3 2026-09-24). Pinned by `tests/b21/agent-context.test.ts:132` | RULE #0-A |
| H21 | `personas/social-media/social-commerce-creator-lead.md:55,70,74,79,99,102` | "MUST-B", "(F6)" and "rejected as vanity" archaeology in a seat prompt (G2) | text in `slices/d1-personas.md` row 7 | `00-CEO-DIRECTIVE-MUST-ROSTER.md:15,20` |

## Bucket 3 — runtime: report and diff only (applying waits for B51)

Representative hunks for the text rows are in `PROPOSED.diff` section 3 (R1–R11). The code-logic
rows (C2-1 … C2-4, C2-9, C2-10, C2-12) are described, not diffed. By his order of 2026-09-24, code
is written by the writer seat at `max` when he decides B51.

**Template rows.** Re-counted by `verify-runtime.py`: files with a hit, of 214. The grep is in the
script.

| id | Pattern | Files | Proposal |
|---|---|---|---|
| R1 | §2 "Muhakeme sırası sabittir / Fixed reasoning order" lead-in (1c) | 142 | the lead-in only ("Her işte tartılan sorular:"). Skip real sequences: `social-scheduler-publisher.md:60`, `blockchain-security-auditor.md:68`, `iam-secrets-officer.md:67` (keep-list 3) |
| R2 | §11 heading "Fable 5 hook" (G2) | 213 + `packages/hr/src/template.ts:33` | "Hook binding / bağlantısı". Keep the gate keys (`hook_version`) |
| R3 | §8 escalation "one sentence / tek cümle" (1f) | 212 | whole sentences, conclusion first; the file's own fields kept |
| R4 | §8 "Dil: rapor Türkçe" vs the task lane's English-artefact line (1c) | 82 | Turkish to the CEO, English in every artefact (slice C row 3) |
| R5 | §9 `notify_broadcast` / `WebSearch/WebFetch` named as tools the seat lacks (G3) | 186 / 76 | delete the notify line. Research line per slice C row 1, **except** strategy (scrapling) and quality (playwright) seats, which do hold a web tool through their profile (slice D2 correction) |
| R12 | §9 execution surfaces not granted: pg-boss, publish APIs, OAuth, vault, sandbox (G3) | 12 (slice D2 row 2) | one "Hands" boundary line |
| R13 | §11 "rejected post-task" / "On violation" (1c grader wording) | 213 | state the requirement; keep `hook_version` |
| R14 | version comment `<!-- v… · fable-5 … -->` and the §12 comment reach the model (G2, 1c) | 213 | one code line: strip HTML comments in `packages/voice/src/persona.ts:50` |

**File-specific rows:**
- R6 and R7: Hamza's no-skip script and fixed reasoning order (`agents-orchestrator.md:60,67`, High).
- Slice D2: `head-of-strategy.md:67` (High), `revops-head.md:54` stale "until the seats exist",
  `social-media-orchestrator.md:54,73` (12 vs 13 seats), gate wording (`iam-secrets-officer.md:105`,
  `head-of-strategy.md:83`).
- Slice B: rows 9, 10, 20-24.
- Slice C: rows 6, 9-12.
- Slices D1 and D3, the rows with the widest reach:
  - **R15, §9 prose tool lists.** Scanners, k6, CRM writes, pg-boss, publish APIs, the vault: about 50 files (D1 row 1, D2 row 2, D3 rows 1-2). Rewrite as one "work through the tools this session grants; route the rest" line. `product-trend-researcher.md:109` calls web search "the primary instrument" and holds none (High).
  - **R16, "Declines with a reason:".** In 97 files. Written before his no-refusal law of 2026-08-20; lead-in to "Redirects, naming the reason and the route that works:" (D1 row 4).
  - **R17, issue quotas the model will fill by inventing findings.** `testing-evidence-collector.md:62` ("3-5 real issues"), `testing-reality-checker.md:63`, `sales-pipeline-analyst.md:57` ("at least one deal") (D3 rows 5-7).
  - **R18, budget fields the seat never receives.** `product-manager.md:68` names `max_tokens` and `max_cost_eur`, which only the LiteLLM path sends (D1 row 2, High).
  - **R19, stale "until the seats exist" conditions.** `revops-head.md:54`, `enterprise-risk-manager.md:55`, and the migration-relative parentheses in 7 files (D2 row 5, D3 rows 10 and 12).
  - **R20, capitals density.** 15-21 emphatic words in 7 files (D1 row 9), and `social-approval-workflow.md:60` (D3 row 11).
  - Everything else is in `slices/d1-personas.md` and `slices/d3-personas.md`.

**Code rows** (slice C part 2, re-verified in `verify-runtime.out`):
- **C2-1:** 6 SDK sites omit `settingSources` (High). This is item 1 of the summary.
- **C2-2:** `chat-drain.ts:116`, `answer.ts:117`: an `xhigh` routing row silently runs at `low`.
  `xhigh` has been legal in routing rules since `20260903190000_b43_media_hands.sql` (High).
- **C2-3:** `executor.ts:103-118` passes no `effort` (High).
- **C2-4:** `executor.ts:74`: workflow steps run a named seat with a one-line identity, with no
  persona and no laws (High).
- **C2-5 = R8:** `decompose.ts:158` "chain <= 3" against `MAX_HOP_DEPTH = 5`, his order 2026-08-27
  (High).
- **C2-6, C2-7 = R10, R9:** chat's "no markdown headers / under 8 sentences" and PLAN MODE capitals
  (Medium).
- **C2-8 = R11:** voice "2-4 sentences" (Medium).
- **C2-9:** the standing prompt is sent in the user turn, uncached, with per-turn memory above fixed
  text (Medium).
- **C2-10:** "Output JSON ONLY" prose beside `outputFormat` json_schema (Medium).
- **C2-11:** worker-shim sends "verify with a real tool call" and grader wording to tool-less seats
  (Medium).
- **C2-12:** no `fallbackModel`, and an empty result is stored as a reply. This matters only if B51
  moves the runtime to 5.5 (Medium).
- **C2-13:** classify and council model pins; council is dead code and LOCKED CNCL-01 (Low, his
  call).

Tests that move with these rows: `slices/c-personas-108-213-code.md` § Coverage.

## Slice rows not taken, and why

- **A-6 and A-26 (refuter scaffolding, `refuter.md` ASLA):** overtaken. His refuter redesign of
  2026-09-24 rewrote both. `refuter.md` was re-read: no capitals, acceptance items first.
- **A-8, the `~/.claude/CLAUDE.md` half:** already fixed in P2 (line 44). The `builder.md` half is
  B1-3.
- **A-18 (ARSENAL.md capitals):** re-judged as keep-list 5 and 7. Nearly every emphasised line
  carries a measured failure and its reason:
  - STEP 0: 3 of 7 hunters, 2026-09-17;
  - the address rule: 1,549 sources, 0 addresses;
  - READ ONLY: "his signature";
  - HUKUM: a merge-parsed format line.

  Emphasis there is the tested, scoped fix the procedure keeps.
- **A-21:** applied as B1-11, but without "monospace labels", which the dashboard uses.
- **A-23, A-24, A-25, A-27, A-28:** Low. Flag only, per Step 6.
- **Slice C row 1's replacement:** corrected by slice D2 (strategy and quality profiles grant web
  tools). The row stands as R5 with the exception.

## Verification

- Every runtime row was re-verified at `file:line`: `python3 verify-runtime.py`.
  - 25 point checks: 22 at the stated line, 3 moved a few lines (query( 116→112, opus-4.8 35→39,
    workerIsolation 371→364).
  - The template counts are printed in `verify-runtime.out`.
- `worker-shim.ts:376` reads `tools: []`, and 0 of 24 `packages/gateway/profiles/*.mcp.json` grant
  `notify_broadcast|WebSearch|WebFetch` (grep, 2026-09-24).
- P5 was gated by the acceptance items in `ACCEPTANCE.md`, written before the first edit, and by the
  refuter under the redesign (A/B/C). Its result and the rulers' output go in the commit.

## Older defects met on the way (C-class: board row, not this job)

- `scripts/governance/sync-codex-mirror.sh` deletes the Codex-only `.agents/skills/agent-reach` on
  every run.
- The frontmatter of memory `expo-after-measurement-2026-09-03.md` fails YAML.
- `.claude/skills/dxb-research/.browser.lock` is tracked in git.
- `executor.ts:26-30`: `WorkerEvidence` has no `ref` field (the zod-strip bug fixed in worker-shim).
- `tests/phase6/poisoning.test.ts:196-205` is a hand copy of the worker prompt that will drift
  silently.
- `.agents/skills/agent-reach/` (8 files in HEAD): the source door was deleted on his order of 2026-09-20 (`35ddc3d8`), the Codex mirror copy stayed, so `sync-codex-mirror.sh --check` is red at HEAD and a plain sync deletes it (refuter C-2). This job restored it to HEAD each time, a net zero.
- Pill buttons in the live dashboard (`approvals/approval-card.tsx:136,303`, `batch-bar.tsx:24`, `rounded-full`) against `DESIGN_SYSTEM.md:76`. Whether an approved design shows them is ⚠ UNVERIFIED (refuter C-3).
- Project CLAUDE.md §5 says a "persona-gate heading" keeps `fable-5` on purpose. The gate matches
  only the section number (`packages/hr/src/gate.ts:69-74`).

## Files

- `ACCEPTANCE.md`: P5 items.
- `check-bucket1.py`: item 8 and item 11.
- `PROPOSED.diff`: section 1 applied, sections 2 and 3 proposed.
- `verify-runtime.py` and `.out`.
- `slices/`: the auditors' briefs and their full tables.
