# Fork measurements — runtime-isolation job, session cbedb76a (2026-10-03)

Fork 1 — Sol's single-pass A1-A3, B1-B4 (critical-gate.ts, the ruler rewrite, four probes, strace)
- 14:22:36 → 14:51:40 (29.1 min), 75 model calls, 82 tool uses, model claude-opus-5-5 (the lead's, effort max)
- new tokens 444,212 = cache writes 252,476 + output 191,584 + uncached input 152; cache reads 24,208,066
- start: context 161,008, of it 158,146 read from the lead's cache, 2,860 written → start-up ≈ 2.9k new
- end: context 429,311 → ≈ 268k tokens of its own work kept OUT of the lead's context
- quality: 18 failing-first cases (Sol's 8 + 10 class cases) red on the old ruler, green after; A2, A3 red → green;
  ruler 80/80, with the gate tests 88/88; typecheck 0; B43 isolation green; battery: pending
- beyond its rows it found: the challengers' effort fell to `none` (phase-2 regression); the CLI opens the
  construction's settings files under settingSources: [] (not applied)

Fork 6 — Sol's single pass on phase 3, A1-A4 (session 79e77b01, effort high, Fable consulted before the brief)
- 17:26:56 → 17:35:24 (8.5 min), 46 model calls, 44 tool uses, claude-opus-5-5
- new tokens 146,201 = cache writes 89,265 + output 56,842 + uncached input 94; cache reads 8,380,217
- quality: ruler 8 red → green (phase3-fix-before-red/after-green), strace-gate self-test 2/12 → 12/12, 135/135
- beyond its rows it found: media-probe resolved ffmpeg through $HOME — HOME now the company home → the
  holding's ffmpeg lost in the dxb-mcp child; fixed by the lead (userInfo), red → green
- the lead's brief came from Fable's advice (allowlist, A4 before A2, HOME set); no widening seen in review

Not in this file before it moved here from the scratchpads (session cbedb76a's handover note): fork 2 2.4 min
40,644 new · fork 3 2.8 min 48,908 · fork 4 (phase-3 measurement + plan) 6.8 min 122,281 · fork 5 (phase-3
build) 5.6 min 100,489 · the lead (cbedb76a) 169.6 min 591,266 new by 17:05. Fable's notes: forks serialize on
the one construction engine (vitest globalSetup); a fork inherits the lead's errors (fork 3's widening came
from the lead's brief); harness `subagent_tokens` ≈ final context, not cost. usage.mjs beside this file.

## The four lead sessions of 2026-10-03, measured (session 79e77b01, 19:30; sessions.py · advisor_forks.py · cost.py beside this file)
$ = API list price equivalent (claude-api skill, cached 2026-09-25: Opus 5.5 in $4 · 1h cache write $8 · cache read $0.20 · out $20;
Fable 5.1 in $10 · out $50) — a common scale for token kinds, not his Max plan's bill (its weighting is not published).

| session | minutes | forks | lead context at the end | kept out by forks | lead $ (reads share) | forks $ | Fable $ |
|---|---|---|---|---|---|---|---|
| 5ed74ad7 | 80 | 0 (1 probe) | 463k | — | 20.88 (59 %) | 0.10 | 2.38 |
| 32178f5b | 52 | 0 | 454k | — | 16.82 (49 %) | 0 | 1.86 |
| cbedb76a | 177 | 5 | 451k | 456k | 18.02 (57 %) | 23.26 | 5.60 |
| 79e77b01 | 144 (~60 idle) | 1 | 205k | 94k | 6.17 (47 %) | 3.53 | 4.08 |

- Fork start-up 403-2,860 new tokens. A fork re-reads the lead's context on every call: fork 5 (from a 409k lead) $0.088
  reads per call, fork 6 (from 131k) $0.037 — 2.4x. Fork from a light lead.
- Fable reads the whole lead transcript UNCACHED each consult: input $0.96 at 96k … $3.69 at 369k; today $13.92 = 13.6 % of
  $102.69. Top-level message usage EXCLUDES the advisor iteration (usage.iterations[type=advisor_message]); the "max context"
  spikes (734k, 384k) were two executor iterations summed, not one context.
- A handover: the new session's first call writes 27-32k ($0.22-0.26) on a 56-61k context, plus orientation reads and the
  note — about $0.5. One lead call reads $0.09 at 450k, $0.012 at 60k: a handover pays back in ~6-7 calls.
- Not comparable per hour: effort differed (max · max · max→high at 16:45 · high) and idle stretches differ.

## Does a Fable advisor consult reach his plan's meters? (2026-10-03 19:38-19:47, session 79e77b01)
usage-probe.mjs reads the /usage windows through the SDK (`usage_EXPERIMENTAL_…`, no model call); usage-series.txt is the
20-second series around one consult (17:39:50Z, Fable read 316,163 · wrote 1,352 — $3.23 at list); window.py predicts the
5-hour meter from every local transcript since the window opened (13:00Z), calibrated on 27 % at 17:38:20Z.
- Fable weekly meter 0 % all day after 8 consults (~$21 at list); usage credits $0 (extra usage off).
- 5-hour meter: 27 → 28 at 19:41:27 and stayed 28 to 19:43:33. Predicted at 17:43:33Z: Fable not counted 28.2 · counted at
  Fable list 29.8 · counted at Opus input rates ~29.0. Then 29 from 19:44:36 to the end (19:46:42), where not counted
  predicts 28.4-28.7 and Fable list 30.0-30.2. Fable at its own list price is excluded; not counted vs counted at a much
  lower weight (Opus-like) is unresolved at a 1-point meter (the lead's research calls ran in the same minutes).
- Weekly all-models 10 → 11 at 19:42:51: unresolvable (one point ≈ $10 of list-price usage).
- Docs (code.claude.com/docs/en/advisor, Cost): on subscription plans advisor usage "counts toward your plan's usage limits";
  the advisor's read "is not cached". Same observation open since 2026-09-06 in anthropics/claude-code#92437 (Max 5x, two
  users, no Anthropic answer); API docs: advisor tokens are not rolled into top-level usage totals.
- Speed (speed.py): call latency does not grow with context (medians 4-10 s at 60k and at 450k); a consult blocks the lead
  42-290 s (8 consults today).
