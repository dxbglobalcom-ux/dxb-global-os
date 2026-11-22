# Evidence for B85 §4 — gathered 2026-11-22

Three read-only hands read the sources; nothing was run from a trial folder. Grades: **MEASURED** (holds as a fact
about our system) · **INDICATION** (one direction, confounded or small) · **NOT A MEASURE**. A figure without a source
here is not to be used.

## A. The holding's own trials

### A1. Second trial, 17–18 Nov 2026 — `/home/dxb/deneme-2/` (Media Studio, Opus 5.5 at high)

Question: "whether the personas make the work better, easier and faster, and where a specialist helps"
(`.planning/board-rows/B64.md:52`). Job text identical in both arms. The masters differ: the team arm's master is the
Creative Director persona (216 lines) with six persona agents chosen by the lead; the single arm has a one-line
`CLAUDE.md` plus the contract page. The team arm's brief was changed after job 1 from "how it uses them is its own"
to "This job is done by the team, not by you alone" (`logs/TIMES.log:29-30`). Four jobs planned, two run, one judged.

| Run | Transcript span | Output tokens | totalCostUSD | Subagents |
|---|---|---|---|---|
| tek-1 (single) | 16 m 44 s | 19,677 | 1.87 | 0 |
| ekip-1-solo (team master, left free) | 43 m 25 s | 32,836 | 2.93 | 0 — "opened none of its six personas" (`TIMES.log:29`) |
| ekip-1 (team, forced) | 80 m 33 s | 312,470 (233,397 in subagents) | 19.04 | 9 Agent calls |
| tek-2 (single) | 31 m 50 s | 97,600 | 6.28 | 0 |
| ekip-2 (team, forced) | 84 m 47 s, stopped, not delivered | 407,606 | 26.88 | 7 Agent calls |

Quota: only "ekip-1 took about 60 points" of a 5-hour window (`TIMES.log:37`); every other run NOT RECORDED.
His judgement, not blind: job 1 — prefers tek-1 "bir tık daha" over **ekip-1-solo** (the parked car sways: "büyük bir
saçmalık") (`TIMES.log:35`). **The forced team's delivery was never judged.** Job 2 — only tek-2 judged, as a failure:
"nerede yaratıcılık" (`.planning/board-rows/B85.md:134-137`, `B43.md:273-275`).
Grade: INDICATION on speed and cost; NOT A MEASURE on quality.

### A2. First trial, 28–29 Oct 2026 — `/home/dxb/deneme-1/` (3-page site, all at max)

Arm A: a master with four specialists written for the job (not the persona library). Arm C: the same brief, the same
master file without the specialist parts, Agent and Task tools off. A: 330.35 $, 2,695,369 output tokens (81 % in the
specialists), about 8.4 hours, two 5-hour limit stops. C: 37.15 $, 409,191 output tokens, about 2 hours.
His judgement, not blind: "Hiçbiri açık ara iyi değil; her birinin iyi tarafları var"
(`.planning/quick/20261029-web-ofisi-devir/DEVIR.md:28,31`).
Grade: INDICATION on cost; NOT A MEASURE on quality (a tie).

### A3. Four ways, 21 Oct 2026 — `.planning/quick/20261021-dort-yollu-olcum/` (one clinic page)

Single maker at high: 1043 s, 135k tokens. Medium + a fix round: 1081 s, 392k. High + a fix round: 1714 s, 407k.
A 9-agent workflow: 2273 s, 1284k (`TIMES.log:2-8`). Judged **blind**: he put the two fix-round arms first; the
9-agent workflow was not chosen (`.planning/STATE-ARCHIVE.md:2568-2569`). The 9-agent arm was "NOT Ultra Code. An
imitation" written by hand (`key.md:3`); the product's own mode never ran. One page, one run.
Grade: INDICATION.

### A4. Olive page, 24–26 Oct 2026 — `.planning/quick/20261024-zeytin-tek-kol/`

The "1,000 $ way" (a head plus persona seats): about 100.39 $. One Opus at high: 831 s, 3.16 $. One Opus at max:
2227 s, 8.20 $ (`TIMES.log:67-70`). Sol, blind, visual only, ranked: high, max, the 1,000 $ way.
The merged page that followed — one master, the best base page chosen and the other pages' good sides added (the
"three hands" way, `.planning/board-rows/B84.md:59`) — closed on his words "Fena değil … Ama bu haliyle tamam dedik"
(`scripts/governance/ceo-approvals.json`, key `olive-merged-page-accepted-by-his-eye-2026-10-26`). By his rule of
22 Nov that is "okey", not liked.
Grade: INDICATION.

### A5. Other studies

`20261021-uc-seviye`, `20261022-iki-yol`, `20261023-calisan-sistemi`: no usable result — NOT A MEASURE.
Cost of continuing a giant session against a fresh one (25 Oct, `/home/dxb/test-kutu/20261025-birlesik/`): resumed
rounds 16.36 / 14.97 / 8.15 $, a fresh session 5.62 $ — a different fix, not controlled, Opus 5.5. INDICATION.

### A6. The five claims

| Claim | Strongest evidence we own | Grade |
|---|---|---|
| One maker is faster on coupled work | 17 m vs 80 m; 32 m vs 85 m undelivered; 1043 s vs 2273 s; ~2 h vs ~8.4 h | INDICATION, four studies, one direction |
| One maker's work is judged better or equal | a tie (not blind); blind, single preferred over a 9-agent imitation; Sol blind ranks the team last | INDICATION, weak — never judged blind against a working persona team |
| A team costs more | 19.04 $ vs 1.87 $; 26.88 $ vs 6.28 $; 330 $ vs 37 $; 100 $ vs 3–8 $; 1284k vs 135k tokens | INDICATION, consistent |
| A master left free calls no specialist | 0 Agent calls in ekip-1-solo, tek-1, tek-2 | MEASURED for these three runs |
| A fresh session is cheaper than a resumed giant one | 5.62 $ vs 8–16 $ per round | INDICATION |

## B. What he praised, and how it was made

By his rule only "wow / süper / mükemmel / elinize sağlık / güzel olmuş" is liking.

- **Praised (2).** EYW-001 v2 film, 4 Sep: "mükemmel olmuş, tam doğal ses ve görüntü" — made in one shot from his own
  636-word prompt with three photos and one voice sample, by a session working the engine directly, never through the
  persona seats (`~/tools/h3/studio/KATALOG.md:37`). An image from a real reference, 5 Nov: "mükemmel" (one word on
  record; `.planning/board-rows/archive/B43-full-record-to-2026-11-17.md:123`).
- **Borderline (3).** 15 shoe storyboards, 20 Nov: "storyboardları çok beğendim. 11 hariç" — one session, each
  storyboard merging the prompts of the most-liked real ads in their own words; the same night storyboards built from
  a session's own ideas were rejected (`.planning/quick/20261120-reklam-storyboardlari/BRIEF.md`). The Lacivert Rapor
  page. One engine test frame.
- **Okey (not liked).** The merged olive page; ORVO 01 and 02 films ("Okeylenenler, bak beğenilenler değil"); the Nike
  billboard on a real street plate; OE-003; EYW-002C; EYW-003 (nine persona seats); motion-graphics film 1 ("iyidi ama
  mükemmel değildi").
- **Rejected.** All 12 recipe-cupboard samples, 8 Nov — 202 recipes written by nine helper agents, images from text
  and AI product photos with no real reference: "AI AI'yim diye bağırıyor". LUMORA ad, three times. ORVO 03. EYW-004
  through the company road with seven seats: "uzun sürdü istemiorz". 18 Nov job 2, single master: "nerede yaratıcılık".

| Making method | Praised | Borderline | Okey | Rejected |
|---|---|---|---|---|
| One session or master working the tools directly | 2 | 3 | 6 | 4+ |
| Persona seats / the company road | 0 | 0 | 2 | 1 |

Too small to carry a conclusion on method. One pattern repeats in both directions: work started from real material
(his detailed prompt, a real reference, the liked ads' own prompts) is what was praised or liked; work started from
text or from a session's own ideas is what was rejected.

## C. The blind audits — `.planning/quick/20261019-degerli-is-danisma/MEASURE.md`

15 jobs recorded. Findings that would have reached him wrong without the audit: a key leaking through an answer; 29 of
31 tests skipped inside the battery; the approval core marked "kept" while what he approved could change before it
runs. A second blind auditor beside the first, 2 jobs: in both it found items the first had not (5 and 5).
Grade: MEASURED — an independent, blind check finds real defects in our work.

## D. The 213 persona files — measured 2026-11-22 over `personas/`

213 files, 20.9 KB each on average, thirteen numbered sections. 81 % of the text occurs in one file only (role
identity, reasoning, working method, decision method, error prevention, quality criteria — written by a model);
8 % is uniform: section 12, "Discipline DNA & Islamic conduct", 1.6 KB, present in all 213 (constitutional; the
persona gate fails without it). That section's text is in no shared prompt layer today
(`packages/voice/src/prompt-core.ts` only refers to the boundaries).

## E. The construction's own daily practice

The construction that builds this holding runs on `.claude/skills/dxb-team3/SKILL.md`: one lead that holds the whole
and manages; read-only helpers for reads that would flood its context; writers given a spec; a blind auditor after
the work; procedures kept as skills loaded when a job matches. Its seats are defined in one table row each — who,
does, never, model and effort — with no character file.

## F. The model maker's current documentation (fetched 2026-11-22; pages undated unless said)

Prompting best practices (covers Fable 5.2, Opus 5.5, Sonnet 5.5):
`platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices`
- Role: "Setting a role in the system prompt focuses Claude's behavior and tone for your use case. Even a single
  sentence makes a difference". No measured effect is published; the per-model pages for the newest models have no
  role section.
- "Think of Claude as a brilliant but new employee who lacks context on your norms and workflows."
- "Examples are one of the most reliable ways to steer Claude's output format, tone, and structure".
- "For simple tasks, sequential operations, single-file edits, or tasks where you need to maintain context across
  steps, work directly".
- "Claude's latest models are extremely effective at discovering state from the local filesystem."

Subagents (`code.claude.com/docs/en/sub-agents`, `/agent-sdk/subagents`, `/best-practices`):
- Use one "when a side task would flood your main conversation… the subagent does that work in its own context and
  returns only the summary." Four stated benefits: context isolation, parallelization, specialized instructions, tool
  restrictions.
- "The only content you pass from parent to subagent is the Agent tool's prompt string"; "only its final message
  returns to the parent".
- "Handing the same task to a subagent doesn't make the answer any better." "a fresh subagent first has to gather
  context… it can end up *slower*".
- Fable 5.2 page: "subagents can account for a large part of what a session costs".
- Opus 5.5 page: "Teams given a budget kept answer quality comparable to the single agent's while finishing
  considerably sooner." (no numbers)

Multi-agent (`anthropic.com/engineering/multi-agent-research-system`, 2025-06-13, Opus 4 era): +90.2 % on a
breadth-first research eval at "about 15×" the tokens; "domains that require all agents to share the same context or
involve many dependencies between agents are not a good fit".

Skills (`platform.claude.com/docs/en/agents-and-tools/agent-skills/overview`, `/best-practices`;
`code.claude.com/docs/en/skills`): at start only each skill's name and description are loaded ("~100 tokens per
Skill"); the body loads when used ("Under 5k tokens"; "Keep the `SKILL.md` body under 500 lines"); bundled files and
scripts load on need. Procedures and team knowledge "goes in a skill". No comparison of skills against personas is
published.

Verification:
- "A fresh reviewer does help, because it hasn't seen your reasoning"; "A reviewer that's asked to find problems will
  always find *something*." (best-practices)
- "tuning a standalone evaluator to be skeptical turns out to be far more tractable than making a generator critical
  of its own work"; the evaluator "is worth the cost when the task sits beyond what the current model does reliably
  solo." (`anthropic.com/research/harness-design-long-running-apps`, 2026-03-24)
- Opus 5 page: "If your prompt contains explicit verification instructions (… 'use a subagent to verify'), remove
  them… no loss in quality." Sonnet 5.5 page: stopping self-started reviewer subagents "cut session cost by about a
  third, with no change in quality" (coding tasks at max effort).

Context: "As token count grows, accuracy and recall degrade, a phenomenon known as *context rot*"
(`…/build-with-claude/context-windows`). Techniques: "compaction, structured note-taking, and multi-agent
architectures" (`anthropic.com/engineering/effective-context-engineering-for-ai-agents`, 2025-09-29). Long work:
a state file, tests as the record, progress notes, one feature at a time; "the model is less likely to
inappropriately change or overwrite JSON files compared to Markdown files"
(`anthropic.com/engineering/effective-harnesses-for-long-running-agents`, 2025-11-26).

## G. Outside measurements (from the 8 Nov study's stored sources, `.planning/quick/20261108-playbook-calismasi/experts/`)

None measured Opus 5.5 or Fable 5.2.
- Personas: three papers (arxiv 2311.10054, 2512.05858, 2508.19764) find a persona does not raise accuracy; no Claude
  model among those measured.
- Skills: SkillsBench 1.1 (2026-06; Haiku 4.5 to Opus 4.8, GPT-5.5, Gemini 3.1 Pro): expert-written skills 33.9 →
  50.5 %; **self-written skills fall below no skills**.
- Vercel (2026-01-27): the skill was never invoked in 56 % of cases; an always-present 8 KB index scored 100 % against
  79 %.
- Kim et al. (arxiv 2512.08296, 2025-12): multi-agent +80.8 % on parallel work, −39 to −70 % on sequential work.
- Cognition (2026-04-22): "agents contribute intelligence while writes stay single-threaded"; review works best when
  coder and reviewer "do not share any context beforehand".

## H. Published nowhere

A measured effect of a role or persona prompt on a current Claude model; a measured comparison of skills against a
persona or a long system prompt; multi-agent token multipliers on the 5.x models.
