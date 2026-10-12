**A. What I examined**

- **Transcript:** read in full. The manual `en` captions returned HTTP 429. The auto-generated `en-orig` track downloaded fine (99,643 B SRT), and I read every line after removing duplicates. File: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/98d5669e-f759-4609-9b7d-3e469b1b84cd/scratchpad/b64/v4-jev/t.txt`.
- **Frames:** the 720p video downloaded normally with no bot wall. I pulled 33 frames and read 29 of them, all at the moments where the screen carries the content: the explainer, the TypeSafe page, the self-improving loop, the anatomy of a Jev call, both browser races and their summary chart, compaction, the GitHub README, the audit prompt, the audit results table, the "Mistake #4" receipts board, and the AIOS routing diagram.
- **Pages:**
  - The raw GitHub README of `cth9191/jev-compaction-plus`, read in full.
  - The OpenRouter public models API, filtered for Jev.
  - The typesafe.ai homepage HTML, searched for price lines only. The dedicated pricing page was blocked on every fetch path.
- **Date:** the video is from 2026-10-02, which is after Opus 5.5's release on 2026-09-22.

**B. Findings**

1. OPINION/DEFINITION. Jev never writes text. It takes three inputs: the situation, a question, and a rulebook that is sent with every call. Every predefined option comes back with a probability. There are three question types: "yes / no · pick one · score. No text out, ever." Location: 5:30 frame ("What a Jev call looks like"); 2:45 audit prompt text at 14:25.
2. OFFICIAL (TypeSafe, as shown on screen). "193.6x Faster, 444.6x Cheaper… Based on Workflows for System One Tasks." Location: 2:55 frame, typesafe.ai. He rounds this to "200 times faster… 400 times cheaper" at 0:00 and 1:55.
3. OFFICIAL (fetched 2026-10-12). The typesafe.ai homepage says "$42 Per Billion input tokens" and "238x Lower input price than Claude Fable 5.1". Its demo shows Jev at "$0.000081, 0.114s" against LLMs at "$0.013880, 8.566s". In the video he says "$43 per billion" at 2:10 and "$42 for 1 billion" at 18:20.
4. OFFICIAL (OpenRouter API, 2026-10-12). Only `typesafe/jev-router` is listed, with pricing `-1/-1` (dynamic) and a context of 1,000,000. The README instead names `typesafe/jev-1.13` on OpenRouter's "decisions API". Access is through the TypeSafe API (waitlist; he got in within "a couple hours", 2:50) or through OpenRouter.
5. MEASURED (his own email pile). On 328 real emails, with Jev allowed to act only when 90%+ sure and everything else falling to Opus 5.5, Jev's share went from 43% on Sep 15 to 81% on Sep 25. A second box reads "Rulebook v0 → final, same 328 emails: Jev handles 50% → 84%". The accuracy of what Jev handled is not shown. Location: 4:40 and 5:00 frames.
6. EXPERT (the architecture on screen; partly not spoken).
   - **Loop:** New email → Jev (0.2 s, $0.0001) → is it 90%+ sure? If yes, it is handled ($0.0001). If no, Opus 5.5 decides, logs why, and proposes one edit to the rulebook. That edit goes through a "Re-test: more right, nothing broken?" gate. If it passes, a new rulebook is made; if not, the edit is thrown away.
   - **Day 1:** Opus does everything.
   - **Spoken but different:** he describes a "shadow mode" (6:51) in which Jev only watches Opus for 10 days before it acts.
   - **Unspoken:** the regression re-test gate appears only on screen.
   - Location: 7:00, 4:25, 5:15 frames.
7. EXPERT. Always add a "none of these" option, so the model is not pushed into "randomly inflated probabilities" (6:20). The audit prompt repeats this: "ALWAYS include a 'none of these' option" (14:25 frame).
8. MEASURED (browser, Google Flights Austin→New York, search only, "real runs, real time"):
   - Opus 5.5 driving every click: 67.4 s, 36 turns, $0.53.
   - Opus in the loop with Jev clicking: 50.2 s, 12 turns, $0.19 (the winner).
   - Opus planning once with Jev running the plan: "GOT STUCK (0 of 4 runs)".
   - The summary reads "1.3× faster · a third of the cost".
   - A small-print note adds: "plan once + Opus rescues when Jev gets stuck → ~75 s on Flights."
   - Location: 9:50 and 10:50 frames.
9. MEASURED (browser, demo.playwright.dev/todomvc, add 3 todos, tick 1):
   - Opus every click: 21.6 s, 8 turns, $0.11.
   - Loop: 19.2 s, 9 turns, $0.10.
   - Plan once with Jev running: 12.9 s, 1 turn, $0.06 (the winner).
   - The chart notes "Jev adds under $0.001" per task.
   - Location: 10:50 frame.
10. EXPERT (on screen). "It's a jagged frontier." A predictable page means Opus plans once. Surprises such as pop-ups or date pickers mean Opus stays in the loop. Location: 10:50 frame.
11. MEASURED (compaction, a single run as shown in the video). On one 591k-token Claude Code session with Opus 5.5:
    - `/compact` took 35.1 s, scored 6/6 on a memory quiz, and left ~16k tokens.
    - Jev compaction took 0.45 s, scored 6/6, and left ~26k tokens.
    - The slide claims "~75× faster… Still a 96% cut."
    - Location: 12:00 and 13:20 frames.
12. MEASURED (the README states it more carefully). Built-in compaction: 35.1 s. The original fast-jev-compaction: 0.35 s, 5/6, ~7k tokens. The plus version: "0.43–0.74 s, 6/6 (3 runs), ~26k". The README's own words: "one session and one quiz… an example, not a benchmark."
13. OFFICIAL (README mechanics).
    - Jev answers yes/no per old tool result, "does the assistant still need this output word for word?", with `keepThreshold` 0.5.
    - Results under 1,500 characters are always kept. Dropped results move to `.jev-drawer/` behind a one-line label.
    - It falls back to the built-in summary if Jev fails or cuts less than 25%.
    - Jev's per-request limit is 32k.
    - Requirements: Claude Code 2.1.274+ with the early-access function hooks (`CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`) and the `session.compact` hook.
    - Stated limits: compaction is lost on resume; conversation text goes to TypeSafe or OpenRouter; only tool results are cut.
14. EXPERT. The audit prompt (14:25 frame) works like this:
    - It reads skills, hooks, scripts, agents and scheduled jobs in read-only mode and never opens secrets.
    - It finds every "which one? / is this relevant? / should I…? / how good is this? / is this done?" decision.
    - For each one it records: file:line; who decides today; how often; the question type; 2–4 sentences of criteria; the threshold for acting alone, with the fallback below it; what the LLM still does; and the gain.
    - It skips anything that produces text, anything plain code already handles, and anything irreversible.
    - It ranks by frequency × today's cost.
15. EXPERT. His audit results table (14:45):
    - Email sorting: Sonnet today, 50–100 per run.
    - AI-news filter: keyword lists, 100+ per day.
    - "Second-opinion check — is this post good enough to publish?": "The AI grades its own work", every post.
    - "Did the job work? — did this background run actually succeed?": "The exit code only", every run.
    - Carousel picking: 150+ per week.
16. MEASURED, but with a tiny sample (frame at 14:10, "Live receipts Sep 21–24").
    - Jev runs beside the small model and starts at the same moment. If Jev is 90%+ sure, the request goes immediately; otherwise it waits for the model.
    - Jev median 0.32 s against the model's median 5.9 s.
    - "Every sure Jev answer matched the model (4/4)". The unsure cases (47%, 56%) were handed off.
    - "My own 'compound' rule blocked 4 of 6 sure answers → they still waited ~6 s."
17. EXPERT (AIOS routing, 16:20–16:50). A voice or chat bridge sends requests to Jev, which sorts each one into a tier:
    - Tier 1: rules and saved data, no AI, instant.
    - Tier 2: a small fast model (Haiku or Luna).
    - Tier 3: opens a Claude Code or Codex terminal, or runs a skill in the background.
    - Reports go to "THE VAULT", which holds plain markdown, daily notes and "receipts of every request".
    - Before Jev, routing was done by Haiku or Luna and took "up to 5 seconds". He writes "5s → .3s" on screen.
18. OPINION. "It's not the executor… the decision about what we should execute and who should do the executing is something we can offload to Jev" (17:05). Look for "small repeatable judgment calls" (2:44).
19. ANECDOTE. Jev controlling Doom is shown as proof that it can make sequences of decisions. No numbers are given (8:06).

**C. What it means for the question points**

- **Point 5 (who orchestrates).** In his system Jev is a dispatcher, not a manager. It picks the tier, and a stronger model or code executes (findings 17 and 18). His routing runs on rules and probabilities with a fallback to an LLM. That matches a deterministic machine plus a brain, not a brain doing the triage. The Jev-beside-the-model pattern (finding 16) means the cheap classifier only shortcuts work and never blocks it. When it is unsure, the normal path runs. For us this fits under Hamza at the point where an intent turns into an owner or a tier, while the ownership chain stays where it is.
- **Point 6 (model, effort, cost).** These are the cleanest numbers in the video:
  - Opus planning with Jev executing cut the cost of a messy browser task from $0.53 to $0.19, and of a simple one from $0.11 to $0.06 (findings 8 and 9).
  - Triage that drops below a 90% threshold falls through to Opus (finding 5).
  - The design rule: Jev never writes, never does anything irreversible, and never replaces plain code (finding 14).
  - The price claim ($42 per billion input tokens) is confirmed on TypeSafe's own page (finding 3). The 193.6× and 444.6× figures are TypeSafe's own claims under "System One tasks" (finding 2), not independent measurements.
- **Point 7 (who checks).** He proposes Jev for two checks: "is this good enough to publish?" and "did the job work?" (finding 15). Both are judgement calls on a scale that is spelled out in the brief, which matches "verify against the brief". The loop's re-test gate, "more right, nothing broken?" (finding 6), is a real regression test on the rulebook itself. That is the right shape: verify the change against held examples, never "refute toward better". Jev cannot replace a real test that executes something, though. It only scores text.
- **Point 8 (many jobs at once).** Very fast triage (0.2–0.5 s, finding 16) makes it cheap to classify every incoming item on continuous lines such as content, inbox and news. The compaction plugin's mechanics (finding 13: drawer, fallback, minimum cut) show how a long-running agent's context can be kept bounded. Nothing in the video addresses concurrency, budgets or priorities.
- **Point 3 (changing mandates).** The self-improving rulebook (findings 5 and 6) is a working pattern for criteria that drift. The rulebook is data, a strong model proposes edits, and each edit is kept only if it passes the re-test.

**D. Contradictions, doubts, unverified**

- **Routing latency.** Spoken: "tenth of a second… from like 5 seconds to like 3 seconds" (16:12). On screen: "5s → .3s". On the board: median 0.32 s against 5.9 s. "3 seconds" is almost certainly a slip of the tongue.
- **Price.** He says $43 at 2:10 and $42 at 18:20. TypeSafe's site says $42 per billion **input** tokens. The output and decision pricing was not verified, because the pricing page was blocked on every fetch path.
- **Compaction speed-up.** The video says "~75×" and 0.45 s. The README says "0.43–0.74 s" and "50–80×", over 3 runs. The video presents one run as the result.
- **Dates.** The email chart labels Opus 5.5 handling items from Sep 15, and the receipts are dated Sep 21–24. Both are before the 2026-09-22 release date I was given. That points to early access or a loosely used label. UNVERIFIED.
- **Shadow mode against the loop.** He says Jev watches for 10 days and then takes over (7:00). The chart instead shows Jev acting from day 1 at 43%. These are two different deployment modes presented as one.
- **Email accuracy.** No precision or error rate is ever shown for the emails. "Share handled" measures coverage, not correctness. A "90% sure" probability is not shown to be calibrated anywhere.
- **Samples are small.** The routing match is 4/4. The browser results come from "recorded runs", with 0 of 4 for the stuck case and an unstated n elsewhere. The compaction quiz is 6 questions in a single session. Treat all of it as anecdote-grade measurement.
- **Timer mismatch.** The todo race clip shows 15.0 s for Opus at 0:14 of the clip, while the chart shows 21.6 s. The clip timer was probably still running, so I relied on the chart.
- **Compaction trade-offs.** It sends conversation text to a third party (TypeSafe or OpenRouter) and depends on early-access function hooks (finding 13). This plugin would conflict with our secrets and privacy boundary, and with the "no raw provider keys" constraint, because it requires `TYPESAFE_API_KEY` in settings.
- **Not verified:** Jev's accuracy claims, its calibration, its rate limits and its waitlist status. I did not check Luna, Astra or Fable as named products.

**E. Verdict**

The holding should take the pattern, not the hype:

- A cheap probability classifier answers only closed questions (yes/no, pick-one with a "none of these" option, or a score with defined ends) against a written rulebook. It acts alone above a threshold and otherwise hands off to the existing model. Run it beside that model rather than in front of it, so it can only save time and never block.
- Let the rulebook evolve through strong-model edits that are kept only when a re-test on held examples shows more right and nothing broken. This is our "verify against the brief" principle applied to the triage layer.
- The best candidates are per-item triage on continuous lines (inbox, news, content selection) and tier routing at Hamza's dispatch step.
- The browser result is directly useful for step and model allocation. A strong model in the loop with cheap execution won on messy sites at about a third of the cost, and plan-once won only on predictable pages.

What the holding should not take:

- The 200×/400× figures. They are the vendor's own numbers.
- The compaction plugin as it stands. It sends conversation text to a third party, needs a raw key, relies on an early-access hook, and was measured in one session.
- Jev as a replacement for real verification. "Did the job work?" still needs a test that executes something.

Adopting Jev at all would add an external service and a key, so it is a stack decision for the lead. Before any gate relies on it, it needs our own measurement of calibration and accuracy, not coverage.