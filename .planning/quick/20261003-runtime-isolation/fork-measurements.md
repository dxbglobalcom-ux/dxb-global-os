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
