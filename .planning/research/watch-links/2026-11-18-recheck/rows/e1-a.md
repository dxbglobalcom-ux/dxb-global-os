# e1-a — tab "Ekim 9-15 linkleri", rows e1-01 … e1-04 (second reading with the board, 2026-11-18)

**One fact across all four rows.** All four are X posts in the same format. Each has a viral video with a made-up
quote put in a famous person's mouth (Karpathy, or "an Anthropic engineer"). Each ends with "watch today, then read /
save the full guide below ↓", and each quotes an X article written by another account (hanakoxbt, beamnxw,
LunarResearcher). The captions are false every time. The value, where there is any, is in the quoted article, which
the 2026-10-15 reading never opened for any of the four rows. Two rows (e1-01 and e1-03) point to **the same
article**, hanakoxbt's "Loops and Graphs". I place its parts once, under e1-03.

**No video was watched, downloaded or transcribed.** The 2026-10-15 transcripts lived in that session's scratchpad.
They are gone, and no copy exists on disk: I searched `~/.cache/link-watch/`, `/tmp/claude-1000`, the job folders
and the session JSONLs by status id. Only the media files (`X1-…`, `X2-…`, `X6-….mp4`) remain, and I left them
alone. For e1-01, e1-03 and e1-04 I used yesterday's second reading (`…/256bdf75…/scratchpad/recheck/rows/h9.md`
and `h10.md`), its raw material (threads, articles, the prompt OCR, the Cat Wu subtitles) and my own reading of
those files. For e1-02 nothing had been read before beyond the old row, so I fetched the thread and the quoted
article as text.

---

## e1-01 (EK01) — callanxai: Karpathy's Stanford CS25 V2 lecture (2023) spliced, under a false caption; the "full guide" is hanakoxbt's "Loops and Graphs" article, which is the same article as e1-03

- **Opened:**
  - The thread capture `…/recheck/h9/w020.yaml`: the post, the quoted article id 2091515787366306154 and 11 replies.
  - The article `…/recheck/h9/w020-article.md` and the identical capture `…/recheck/h10/art-2091515787366306154.md`, both read whole.
  - The course site `…/recheck/h10/agent-layers.txt`.
  - The earlier reader's report, `h9.md` §w020, which used the CS25 subtitles in `w020-cs25.txt`.
  - The video was **not** re-watched, and the 2026-10-15 transcript is **not on disk**. Its content rests on the old
    row and on yesterday's subtitle match.
- **His note:** none on this tab.
- **What is in it:**
  - Caption: *"Andrej Karpathy: 'Prompting is going away. Delete everything, keep Graph.'"* (968 likes,
    2026-10-08).
  - The lecture is "Stanford CS25: V2 I Introduction to Transformers w/ Andrej Karpathy" (youtube XfpMkf4rD6E). In
    it, "delete everything … keep attention" is about the 2017 paper dropping RNNs. "Graph" means attention as
    message passing. Prompts are praised as programs, which is the opposite of the caption.
  - The hackathon half of the splice was not identified.
  - The guide is the article "Loops and Graphs: how to stop babysitting agents and only approve the last step"
    (hanakoxbt, 2026-08-23). The funnel behind it: the article, then agent-layers.vercel.app, a course at $150 one
    time (per h9's read of the pricing page), "DM me the word Graph", and a Telegram channel.
- **What we have:**
  - For the lecture: nothing to have; it is transformer internals.
  - For the funnel (a free long article as the lead magnet, then a paid template course, then keyword capture):
    the same method is already written in `.planning/research/REVENUE-OPPORTUNITIES.md` §19 (H3: "Collect Emails"
    free magnet, eCourse with "kanıtsız kurs satılmaz") and in row w093 (ReStructure AI, "şu kelimeyi yaz" → newsletter
    → call, B83/B28).
- **What it has that we do not:** the video has nothing. The article's parts are placed under e1-03.
- **Board:**
  - Video: no row (none).
  - Funnel method: B83 (H3) · the H3 line already names a free magnet and an eCourse · `identical` · nothing to add ·
    no trial · nothing stops at the CEO.
  - Article: see e1-03.
- **The old verdict and reason** ("Alma — old lecture, fake title"): **partly holds.** It is true of the video. It
  missed that the post's real payload is a linked article that carries orchestration methods (e1-03).
- **Reader's first reading:** Gerek yok (the row itself; its article is read under e1-03).

## e1-02 (EK02) — hayatomaruu: an Anthropic Claude Code token-saving webinar (27 min) under a false "100+ agents, Chief agent, PM agents" caption; the "full guide" is beamnxw's "Loop Engineering + Jev Engineering" article

- **Opened:**
  - The thread, fetched today through the research door: `PATH=$S/bin:$PATH opencli twitter thread
    https://x.com/hayatomaruu/status/2108329507442565186 -f yaml` → rc 0, 11,931 bytes, saved as
    `$J/rows/e1-a-src/e1-02.yaml`. The plain `opencli` refused with "Install X only through the X gate"; the door's
    `bin/opencli` worked.
  - `curl -sI https://t.co/gXjyOq2Ga1` → `x.com/i/article/2107859828341157888`.
  - `opencli twitter article 2108101310515925217 -f md` → rc 0, 13,840 bytes, saved as
    `$J/rows/e1-a-src/e1-02-beamnxw-article.md` and read whole. Its code blocks, images and tables did not export
    (for example after "Save this fictional report as issue.json:").
  - **The webinar itself could not be read.** The 2026-10-15 transcript is not on disk, and the video was not touched
    on his order. Everything below about the talk rests on the old row only, and its timestamps (18:24) are not
    re-checked.
- **His note:** none on this tab.
- **What is in it:**
  - Caption (338 likes, 2026-10-08): *"99% of people use Claude Code like Google … I'm running 100+ agents in a loop.
    I have Chief agent, PM agents"*, "a 30-minute workshop". The old row says none of this is in the talk.
  - Talk, per the old row only:
    - prompt cache;
    - `/usage`;
    - `/compact`;
    - splitting CLAUDE.md from skills;
    - admin settings;
    - "subagent cache is 5 minutes everywhere" (18:24);
    - two tips: `/compact` while the cache is still warm, before a break or a hand-over; a quiet test command in
      CLAUDE.md so passing tests' output does not fill the context.
  - The article (beamnxw, 2026-10-08), facts from its text:
    - Jev is "TypeSafe AI's decision model". It takes a state plus typed questions (Choice / Noul / Score) and
      returns a choice with probabilities. `jev-1.13.0` costs $0.042 per M input tokens, output free; limits are
      64k tokens per request and 32k for state plus the longest question.
    - The method:
      - in a recurring loop, first check in plain code whether anything changed (ids, timestamps), and end the tick
        with no model call when nothing did;
      - only then a semantic filter, and only an accepted item reaches Claude;
      - keep exact comparisons and counters in code;
      - evaluate on 30-50 self-labelled cases, recording our route vs. Jev's route, whether the action was right,
        and what caused a disagreement; count missed work as well as wrong admissions;
      - run in **shadow mode** first;
      - pin the model version, and re-evaluate whenever categories, instructions or the model change;
      - claim an item before launch, giving it a stable identity across polls (content hash), so one report never
        becomes two runs;
      - a `PreToolUse` classifier sorts commands by effect (reads / modifies allowed files / deletes or rewrites
        history / talks to an outside destination / unclear → review), never in place of permission rules;
      - completion via a GOAL.md acceptance record: code checks exit codes and files, the semantic check comes
        after; the Stop hook's `stop_hook_active` plus an attempt counter; terminal status completed / blocked /
        budget exhausted;
      - one compact record per decision: item identity, model version, question version, returned values, chosen
        route, eventual outcome, "so an unnecessary Claude run traces back to the rule that admitted it";
      - track "cost per accepted completed task", with corrections included.
  - Replies: none add facts.
- **What we have:**
  - **Jev: identical, already decided and in the stack.** `.planning/research/STACK.md:28` (`typesafe-ai/jev` via
    Vercel AI Gateway, B64 decision 7, CEO-OK); `HOLDING-OS-MASTER-PLAN/CAPABILITY_ARSENAL_DOCTRINE.md:355-361`
    ("the first sorter … 69/70 at 0.3 s; the 70 cost 0.0025 $. Its spend is recorded per call"); B64 row file
    l.103-105 (the intake trial).
  - Shadow trial: B64 row file l.50 ("the desk's shadow trial").
  - Steps with one right answer done by code: `.claude/skills/dxb-team3/SKILL.md:219-221` (added 2026-11-17).
  - Claim and lease: `tasks.claimed_by` / `lease_expires_at` (`packages/orchestrator/src/escalate.ts:244-247`).
  - The finish contract and the attempt cap: B75 ("the attempt cap … the completion contract") and the B64 leg of
    2026-11-17 (COMPLETE/CONTINUE).
  - Cost per accepted change: C40, B34.
  - The "nothing is judged twice" check: B82 plan, `watch_seen` table (`.planning/quick/20261018-gozlem-odasi/PLAN.md`
    Part 2).
  - The 5-minute cache: `~/.claude/hooks/dxb-cost-gate.py` rule 8 and dxb-team3 l.331-332.
  - Before a break we write a hand-over note at about 50 % context rather than `/compact` (dxb-team3 §8; memory
    "Devirde cevap bekleme": "otomatik sıkıştırma araya girer").
  - Quiet tests: the battery runs as a background command, so its output lands in a file (dxb-team3 §4/§7). It uses
    vitest's default reporter (`scripts/construction/battery.sh:155,161`). Whether a writer's single-file
    `vitest run` floods its context: not measured.
- **What it has that we do not:**
  - (1) The **per-decision record** for Jev's routing: question version, returned probabilities, chosen route and
    eventual outcome. The doctrine records spend and who did the work, not why an item was admitted.
  - (2) The plain-code "did anything change?" check **before** any model call in recurring loops. B82 has it. For
    the scheduler's other recurring jobs: not measured (I did not read which of them call a model).
  - The rest we have.
- **Board:**
  - (1) B64 (decision 7, Jev first sorter) · stands now: Jev with spend recorded per call (doctrine l.361) ·
    `method` · each Jev routing writes one row (item, Jev model version, question version, probabilities, route,
    later outcome). When a master's run turns out unnecessary, the row names the rule that admitted it · **first
    trial:** rerun the 70-mail intake set of 2026-10-13 with the record on. Every item must leave a complete row, and
    the 1 wrong item must be traceable to its question text · nothing stops at the CEO (Jev's gateway is his
    approved path).
  - (2) B64 (standing operations have standing owners) · stands now: nothing for non-B82 loops · `method` · a
    recurring job's tick compares ids or hashes in code and makes no model call when nothing changed · **first
    trial:** list the scheduler jobs that call a model and count, over one day, the calls made on an unchanged input.
    If none, the item is closed · nothing stops at the CEO.
  - Webinar tips: no row (construction practice; the nearest is B51 move 7, "cost down wherever possible") ·
    hand-over note instead of `/compact` · `none` · nothing to place.
- **The old verdict and reason** ("İzle — confirms our rule; nothing new to apply"): **partly holds.** It holds for
  the talk as the old row records it. It never opened the linked article, whose tool (Jev) we already run and whose
  decision-record method is small but new.
- **Reader's first reading:** Gerek yok (the row; Jev is identical and installed by decision). Item (1) is a Yöntem
  line for the lead.

## e1-03 (EK03) — hanakoxbt: the account's own "graph prompt" for Claude Code (Opus 5.5), sold as Karpathy's, plus its "Loops and Graphs" article; a funnel to a paid course

- **Opened:**
  - The thread `…/recheck/h10/2108308634727760066.yaml` (19 posts), read.
  - The prompt image OCR `…/recheck/h10/img/w022-ocr.txt`, read whole, and h10.md's eye-checked transcription.
  - The article `…/recheck/h10/art-2091515787366306154.md`, read whole.
  - The course site `agent-layers.txt`.
  - Yesterday's line-by-line comparison against dxb-team3 (h10.md §w022).
  - Today, beyond yesterday's reading: I re-checked dxb-team3 (`SKILL.md` l.180-269), the runtime splitter
    (`packages/orchestrator/src/decompose.ts:174-196`), the retry path (`escalate.ts:230-258`), the B64 row file
    (whole), the C40 row file and board lines B64, B75, B85, C40 and W-C42-5.
- **His note:** none on this tab.
- **What is in it:** a 12-section prompt (goal, role, principles from karpathy/autoresearch, inputs, seven layers,
  execution loop, hand-over, delivery). Its footer says *"Not written or endorsed by Andrej Karpathy."* The full
  text is in h10.md l.21-141. The article explains:
  - a loop = produce/check/correct, and the check comes first; "absence of an error is not evidence of correctness";
  - graph = nodes + edges, and "if you cannot name the variable that crosses, there is no edge";
  - four node kinds (splitter, worker, code node, gate); "describable without judge/decide/assess/summarize → it is
    code";
  - workers in separate contexts;
  - two return paths: the correction edge (one unit back, with reason, evidence and the scope "fix this node only";
    cap 3, after which the plan is at fault) and the learning edge (into the splitter's brief, not the worker's);
  - gates open by blast radius (reversible-contained / reversible-wide / hard-to-reverse, a lane that "does not
    open"); evidence order: deterministic → trajectory → the node's rollback history → model confidence last;
  - the human on one step.
  - karpathy/autoresearch: 100,183 stars, pushed 2026-03-26, licence null (h10, `gh api`).
- **What we have:**
  - **Construction:** `dxb-team3` now carries the code-node rule word for word in spirit (l.219-221, "A step with
    exactly one right answer … is done by code, never handed to a model or a hand", CEO-OK 2026-11-17). Yesterday's
    h10 listed it as missing, and it is no longer missing.
  - Also in construction:
    - lead plans, hands get bounded work (§3);
    - blind gate (§4);
    - escalation after two failures at high (l.230-234);
    - per-finding fixes (l.266);
    - the approval gate as the closed lane (CLAUDE.md §2).
  - **Runtime:**
    - The splitter prompt (`decompose.ts:176-191`) asks for 2-10 isolated envelopes with
      `deps: … EARLIER envelopes this one needs finished first`. It has no "only if it consumes that output" test
      and no code-node class: every envelope goes to a model as a `task_class`.
    - The retry (`escalate.ts:236-258`) requeues at the same tier unless the reason was low confidence, and its event
      carries `ladder`, `fail_count` and `model_tier` but not the failure reason. B64's row file item 2 already
      measured this ("its reason is not carried to the retrying worker").
    - B64 v2: the master owns the job and designs the whole; a playbook folder per job type (SKILL.md, done-checks,
      examples, notes.md); a lesson enters the playbook only after its cause, a trial case and the smallest passing
      change (row file l.140-142). This is the article's learning edge, done more strictly.
    - C40 owns autoresearch's keep-if-better loop, unbuilt.
- **What it has that we do not:**
  - (a) the **edge test** for the runtime splitter;
  - (b) the **code-node class** in the runtime: a deterministic step as a code envelope, not a model task;
  - (c) **"return the unit, not the batch"** with the scope line "fix this node only" and the four things that travel
    with a return. Our runtime retry carries none of them;
  - (d) **split by what each unit must read, or by blast radius, not by folder**, written nowhere: not in dxb-team3,
    not in `decompose.ts`;
  - (e) autoresearch's discipline (baseline, change one thing, record failed attempts), which C40 owns, unbuilt.
- **Board:**
  - (a)+(d) **B64** (the master designs the whole; the job's split) · stands now: `decompose.ts` deps rule and
    "TOTAL ISOLATION"; no split dimension · `method` · two lines in the master's split instruction: an edge only when
    the envelope reads the other's output, and cut by what each unit must read · **first trial:** run the current
    `draftPrompt` and the amended one on the same 10 recorded goals (construction engine). Compare the longest chain
    and the count of deps whose output is never read. The amended prompt wins if chains shorten and no needed dep is
    lost · nothing stops at the CEO.
  - (b) **B64** (same split; second home B85 when the orchestrator part gets its verdict) · stands now: nothing;
    every envelope is a model task · `new` · a `code` envelope kind for merge, sort, dedupe, count and compare, run by
    code, never by a model · **first trial:** on the same 10 goals, count the envelopes whose work is mechanical.
    Price them at the current tier; run them as code and check the output is equal · nothing stops at the CEO.
  - (c) **B64** (W-C42-5 "retry lineage with a stated reason" folds into B64's job desk, board l.313) · stands now:
    `escalate.ts` ladder, the reason not carried · `method` · the retry carries the reason, the evidence, the scope
    "fix this unit only" and the attempt count, and only the failed unit goes back · **first trial:** one recorded
    multi-envelope job with one envelope forced to fail on the construction engine. The retried envelope must
    receive the reason, and the sibling envelopes must not be re-run · nothing stops at the CEO.
  - (e) **C40** · stands now: verify gate (`post-task.ts`, `qa.ts`) and stop ladder; no locked score · `method` ·
    the prompt's `<principles>` block (baseline first, one change at a time, record failed attempts, prefer fewer
    nodes) as the seed of C40's loop brief · **first trial:** C40's own closing bar (one real run against a locked
    score) · nothing stops at the CEO.
  - Learning edge, human-on-one-step, re-runnable template (graph.md / checks.md / progress.md): B64 · `identical`
    (the playbook folder; the approval gate; the hand-over note) · nothing to add.
  - Gate by blast radius: B64/B51 checking seat · approval gate = closed lane, `identical`; "the node's rollback
    history as a gate input" is the one extra, which I note and do not push.
  - Course funnel: see e1-01, `identical` (H3).
- **The old verdict and reason** ("Alma — a weaker copy of dxb-team2"): **does not hold.** "Not Karpathy's" is true.
  But the comparison was made against the construction door only, and against dxb-team2, which is no longer the door.
  Against the runtime the holding sells (B64), four parts are missing today and can be measured in the code.
- **Reader's first reading:** Yöntem (four method lines for B64's split and retry, one seed for C40).

## e1-04 (EK04) — 0xkichiro: Cat Wu's Claude Code segment of Anthropic's "Code with Claude" keynote (22 May 2025) under a false "90 % self-improving loops, agentic graphs" caption; the "full guide" is LunarResearcher's "Harness Engineering" article

- **Opened:**
  - The thread `…/recheck/h10/2110338483256451241.yaml` (7 posts), read.
  - The keynote subtitles `…/recheck/h10/subs/catwu.txt` (53:11-64:08), read whole.
  - The article `…/recheck/h10/art-2096570562625655088.md`, read whole. Its tables and images did not export.
  - h10.md §w027.
  - Today: `escalate.ts:230-258`, `.github/workflows/` (only `gate-canary.yml` and `secret-scan.yml`), and
    `~/.claude/logs/` (`dxb-cost-gate.jsonl` 9,543 bytes and `dxb-context-gate.jsonl` 89,710 bytes exist).
  - The X video was **not** re-watched. Its identification rests on h10 (607 s against the ≈612 s segment, plus the
    subtitles).
- **His note:** none on this tab. The same link on the 16 Nov tab (w027) carried "bunu izlediler mi". The answer:
  it was transcribed whole on 2026-10-15 (`.planning/quick/20261015-ekim-linkleri/RECORD.md:14`), and the keynote's
  own subtitles were read on 2026-11-17. The same RECORD (l.7-8) ties his 14 Oct "bunu izlediler mi" to the
  brodyautomates reel W121 instead. Which item it belongs to stays UNVERIFIED without the WhatsApp export (h10
  named this conflict).
- **What is in it:**
  - The talk: Cat Wu (not "Kat Wu") announces:
    - Claude Code generally available;
    - Claude Opus 4 / Sonnet 4;
    - VS Code and JetBrains inline diffs;
    - the Claude Code SDK;
    - the @claude GitHub Action on PRs and issues.
  - Demo: Excalidraw table component; to-do list first; rights to edit, lint, test and make PRs; "worked for 90
    minutes" (59:09); iterated until lint and tests passed; `gh` PR; @claude updates the docs.
  - The SDK is used by customers for "many Claude Codes in parallel to fix flaky tests, increase test coverage and
    even do on-call triage" (62:06).
  - None of the caption's words appear in the segment. The "10 minutes" is her speaking slot (57:40).
  - The article: harness engineering in 19 sections, each read:
    - a task contract of five questions (outcome, scope, **what must not change**, **what evidence proves
      completion**, which actions need approval);
    - a map, not a manual;
    - a tool gateway;
    - brain / hands / history kept apart;
    - durable state;
    - completion proven by the environment;
    - verification that attacks;
    - policy outside the model;
    - **recovery by failure class: "a retry should change at least one relevant condition. Otherwise the system is
      paying to reproduce the same failure"**, with budgets for attempts, time, spend and destructive scope, and an
      escalation condition;
    - instructions → infrastructure;
    - traces;
    - a change receipt;
    - every failure upgrades the harness;
    - **harness decay**: for every router, evaluator, memory layer and retry rule ask "which failure does this
      prevent, how often does it still occur, what latency/complexity does it add, can it be simpler now, what
      happens if we remove it"; "build to delete";
    - metrics: first-pass acceptance rate, recovery rate, repeated-failure rate, human interventions per task,
      unsupported completion claims, time to verified outcome.
  - A reply by stas_sorokin_ gives his own benchmark (Claude Code with Opus 5.5 at 264 MB, 23 s, 12/12; Codex with
    GPT-6 Astra at 382 MB, 102 s, 10/12). That is his measurement, not ours.
- **What we have:**
  - The talk's features: we run beyond them, except the @claude GitHub Action, which our single-lead,
    commit-to-master way does not use (dxb-team3 l.228-229; two CI workflows only).
  - From the guide:
    - task contract: dxb-team3 §1; the runtime envelope's `output_contract` with done-criteria and `approval_class`
      (`decompose.ts:186-193`);
    - evidence-first completion: dxb-verify;
    - attacking verification: Sol;
    - policy in hooks: `~/.claude/hooks/`;
    - durable state: STATE.md and the task table;
    - change receipt: planned, B64 ("nothing assembles a job or reports its end" is its gap).
  - **Not present:**
    - a retry that must change a condition. `escalate.ts` step 1 is "retry same tier", and the reason is not carried
      (l.236-258);
    - the decay review as a standing step;
    - the metrics beyond cost per accepted change (C40/B34) and B51's "who did it, who checked it, what it cost";
    - at goal level, B64 item 1's brief ("what is wanted, how it should be, its features, how it should work") has
      no "what must not change" field and no "what proves it done" field.
- **What it has that we do not:**
  - (1) a retry rule: change at least one condition, by failure class;
  - (2) the harness-decay questions;
  - (3) the run metrics;
  - (4) the two goal-brief fields.
  - The talk: nothing.
- **Board:**
  - (1) **B64** (W-C42-5 folds here; second home B75 for the cap) · stands now: `escalate.ts` ladder (1 same tier,
    2 specialist, 3 head review, 4 final tier, BLOCKED), with the reason dropped · `method` · the retry reads the
    failure's class and changes one condition (tier, context, specialist, or the brief with the reason), never an
    identical rerun · **first trial:** on the construction engine, a task forced to fail twice with the same reason.
    Today's ladder re-runs it unchanged once; the amended ladder must change a named condition on the first retry,
    and the event must record which · nothing stops at the CEO.
  - (2) **B85** (each foundation part gets a verdict: kept, repaired, rewritten) · stands now: the verdict table,
    with no stated test for "kept" · `method` · the five decay questions become the "kept" test for each runtime
    guard, router and retry rule. For the construction's own hooks there is no row (nearest B85), and the same
    questions apply · **first trial:** answer the five questions for `~/.claude/hooks/dxb-cost-gate.py` rules 1-8
    from its own log (`~/.claude/logs/dxb-cost-gate.jsonl`): how often each rule fired and when last · **stops at
    the CEO:** any removal or weakening of a guard (memory "Kapatmadan önce sor").
  - (3) **B51** (moves 2 and 4, the cost meter and the per-task line; closes with "every job … shows who did it, who
    checked it and what it cost") · stands now: cost per accepted change (C40/B34) · `method` · add first-pass
    acceptance rate and human interventions per job to the same line · **first trial:** compute both from the
    company's existing `tasks` and events for one week (SELECT only) and see whether the numbers exist at all ·
    nothing stops at the CEO.
  - (4) **B64** item 1 (the goal brief) · stands now: four fields · `method` · two more fields: "what must not change"
    and "what proves it done" · **first trial:** the next B64 trial's briefs written with both fields; see whether the
    master's plan names its checks unprompted · nothing stops at the CEO (the brief's shape is his to see, as with
    any CEO-visible surface change: dxb-surface).
  - The talk: no row · `none`.
- **The old verdict and reason** ("Alma — 18-month-old launch video, fake caption"): **partly holds.** It holds for
  the talk. It missed the linked guide, whose retry rule meets a measured gap in `escalate.ts`.
- **Reader's first reading:** Gerek yok (the talk). The guide gives four Yöntem lines (B64 ×2, B85, B51).

---

## Commands run (main ones)

- `ls`/`cat` over `$J/old/e1-0[1-4].json`, `$J/src/e1-0[1-4].txt`, `$J/context.md`, `$J/items.tsv`.
- `find /tmp/claude-1000 ~/.cache …` and `grep -l` over `~/.claude/projects/-home-dxb-DxB-Global-OS/*.jsonl` for the
  four status ids: no transcript anywhere, only the media files.
- Read whole:
  - `…/256bdf75…/scratchpad/recheck/rows/h10.md` and `h9.md` §w020;
  - `h10/art-2091515787366306154.md`;
  - `h10/art-2096570562625655088.md`;
  - `h10/img/w022-ocr.txt`;
  - `h10/subs/catwu.txt`;
  - `h10/*.yaml`;
  - `h9/w020.yaml`, `h9/w020-article.md`.
- `PATH="$S/bin:$PATH" opencli twitter thread https://x.com/hayatomaruu/status/2108329507442565186 -f yaml` → rc 0
  (the bare `opencli` was refused: "Install X only through the X gate").
- `curl -sI https://t.co/gXjyOq2Ga1` → `x.com/i/article/2107859828341157888`.
- `PATH="$S/bin:$PATH" opencli twitter article 2108101310515925217 -f md` → rc 0, 13,840 bytes.
- Repository reads:
  - `.claude/skills/dxb-team3/SKILL.md` l.180-269 + grep;
  - `packages/orchestrator/src/decompose.ts:170-199`;
  - `escalate.ts:230-260`;
  - `.planning/board-rows/{B64,C40}.md`;
  - board lines B34/B51/B64/B75/B85/C40/W-C42-5;
  - `.planning/research/STACK.md:28`;
  - `CAPABILITY_ARSENAL_DOCTRINE.md:355-367`;
  - `REVENUE-OPPORTUNITIES.md` §19;
  - `.planning/quick/20261018-gozlem-odasi/PLAN.md`;
  - `~/.claude/hooks/dxb-cost-gate.py` head;
  - `scripts/construction/battery.sh` grep;
  - `.github/workflows/`, `~/.claude/logs/`.
- Nothing installed, no repository file changed, no video touched.
