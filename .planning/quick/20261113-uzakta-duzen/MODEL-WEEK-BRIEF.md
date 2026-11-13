# A model's own week, watched — the lead's brief (2026-11-13)

You are a writing seat of the DxB Global OS construction. The lead is "the user" below.

THE HOLDING: This holding produces high technology, aims at large revenue and will found large companies; its goals are very large. Its business lines' clients are small, medium and large, reaching up to the biggest clients in the world.

## The job, in one sentence
Beside the account's 5-hour window and its all-models week there is a weekly window per model; read it, say it on the quota line every turn, and keep the session's warm-wait clock from waking a session into a full week of its own model.

## Why (measured today — do not re-investigate)
- At 15:15 on 2026-11-13 Fable 5.2's own weekly window ran out while the two windows we read stood at 11 % and 59 %. A Fable writer and the lead (a Fable session) died on it; the lead's clock then woke the dead session at 15:57 and ended.
- Claude Code does not hand that window to the status line: in the installed 2.1.323 the status line's `rate_limits` is built from `five_hour` and `seven_day` only (and `spend_limit` behind a gateway). Its `/usage` screen reads the per-model window from Anthropic's usage address.
- The lead's one read of that address, 18:03: `GET https://api.anthropic.com/api/oauth/usage` with the headers `Authorization: Bearer <accessToken>`, `anthropic-beta: oauth-2025-04-20`, `User-Agent: dxb-usage` → HTTP 200, JSON. The token is `claudeAiOauth.accessToken` in `~/.claude/.credentials.json` (the file also holds a refresh token and other fields — none of them are used). The response's `limits` list holds entries `{kind, group, percent, severity, resets_at, scope, is_active}`; the per-model one is `kind: "weekly_scoped"`, `scope.model.display_name: "Fable"`, `percent: 100`, `resets_at: "2026-11-14T08:00:00.391986+00:00"` (ISO 8601 with an offset). The response's many other top-level keys are not ours.

## His words (verbatim, Turkish)
- "Bir tek Fable'ınki aynı zamanda Fable'ın kotası da izlensin, o kadar. Başka bir şey yok. Yani ekstra incik cincik bir şeylerin yapılmasına gerek olduğunu düşünmüyorum."
- After he was told the only way is the address `/usage` reads, with the account's sign-in key, never printed: "Tamam. Okuyabilirsiniz. Okey. Tek yöntem, tek yolu oysa. Tamamdır. Onay veriyorum."

So: this, and nothing beyond it. **Keep it small** — he said it twice today: no fiddly extras. Three parts and a
handful of tests that carry their behaviour; no machinery the three parts do not need.

## What you build

1. **`scripts/ops/dxb-usage`** (Python, stdlib only, executable) — the one reader.
   - It reads the access token from that file at the moment of the call and uses it only in that one request's header. It never prints, logs, stores or passes the token on a command line, and never refreshes it: a 401 or 403 means unknown (Claude Code refreshes its own login).
   - It keeps per-model weekly windows only — `{<display_name lowercased>: {"used": <percent>, "resets_at": <epoch seconds>}}` with `"read_at"` — in `$XDG_RUNTIME_DIR/claude-ctx/usage-scoped.json`, written atomically, mode 600. Nothing else from the response is kept. A percent that is not a finite number from 0 to 100, or a reset that is missing or unreadable, leaves that model out.
   - **When it asks — his word (2026-11-13): only near 80 %, then every ten minutes; never below.** That is known
     without asking. A model's allowance is a share of the all-models week (the response's `weekly_scoped_shares`
     entry, `allowance_percent_of_weekly`, 50 for Fable today; keep it in the record), and the all-models week is in
     the status line's record on every turn. So a model's week can have risen at most (100 / share) times what the
     all-models week rose since its last reading: bound = last reading + 2 × (week now − week at that reading); with
     no reading, or once its reset has passed, bound = 2 × the week now. Bound below 80 → no request. At 80 or
     above → a request at most every ten minutes, for the whole machine, with a 10-second limit. No share known →
     every ten minutes. A failure leaves the last record as it was; a record older than 30 minutes counts as unknown.
   - `dxb-usage` prints one line per model (`fable 100% · resets 09:00 · read 2 min ago`) or `unknown: <reason>`; `--json` prints the record; `--refresh` asks now when the five-minute rule allows. Exit 0, except 2 for bad usage.
2. **The quota line** — `.claude/hooks/dxb-effort-warn.py` (it runs from the repository on every prompt of every session; its tests are `tests/hooks/effort-warn.test.ts`). The `QUOTA --` line gains, for a model whose last reading stands at 80 % or more, `Fable's own week is X% used and resets in Yh`; below 80 % nothing is said. The hook never waits on the network: it reads the record, and when a request is due by part 1's rule it starts `scripts/ops/dxb-usage --refresh` detached (its own session, output to nowhere) and goes on; the next turn has the fresh figure. Unknown or old → that part is left out; never a figure it does not have.
3. **The clock** — `scripts/ops/dxb-warm-wait`. Its room check (today: both windows below 98 %) also checks the session's own model's week. The session's model is the `model` field of the status line's record `$XDG_RUNTIME_DIR/claude-ctx/<session>.json` (`"Fable 5.2"` → `fable`). At 98 % or more there is no room: it sleeps to that window's reset plus the margin, and its `cold:` line says which window. It may wait for a fetch (it is a background process). Unknown → today's behaviour, unchanged.
4. **Text, two sentences, no more.** `.claude/skills/dxb-warm-wait/SKILL.md`: one sentence that the clock also weighs the session model's own week. `.claude/skills/dxb-team3/SKILL.md` §3, the quota paragraph: the hook says the 5-hour window, the week and a model's own week (Fable 5.2 has one, measured 2026-11-13). No change to any skill's `description:` (the opening budget is at its ceiling). No `CEO-OK` marker: the lead writes the ledger entry and the marker.

## Tests — written first, red before the code
- `scripts/ops/test-usage.py` (new): a fake `HOME` with a credentials file holding a dummy token, and a fake answer (an injected opener) — no real network, no real key in any test. The dummy token is absent from the output and the record on every path, errors included; no request while the bound stays below 80 %, one at most every ten minutes from it; a refused or failed request leaves the figure out.
- `scripts/ops/test-warm-wait.py`: the session model's week at 98 % → the clock sleeps to that reset; another model's full week does not stop a Fable session; unknown → unchanged.
- `tests/hooks/effort-warn.test.ts`: the new part of the line, and its absence when unknown or old; and that the hook does not wait (look at how the file fakes the record). Run it with `DXB_ENGINE_LOCK_WAIT=200 pnpm vitest run tests/hooks/effort-warn.test.ts`.
- At the end, one real run: `scripts/ops/dxb-usage --refresh` then `scripts/ops/dxb-usage` — the only real request — and show its output.

## Working facts
- Never `cd <dir> && …` in a Bash line (a hook blocks it): absolute quoted paths, `git -C`, `pnpm -C`.
- Touch only: `scripts/ops/dxb-usage`, `scripts/ops/test-usage.py`, `scripts/ops/dxb-warm-wait`, `scripts/ops/test-warm-wait.py`, `.claude/hooks/dxb-effort-warn.py`, `tests/hooks/effort-warn.test.ts`, and the two sentences in the two skills. Not `~/.local/bin/dxb-quota`, not the status line, not `~/.claude/settings.json`.
- The lead's session has a live clock and an away marker. Your shell carries the lead's session id: never run `dxb-warm-wait` against the real runtime folder; every test uses its own `XDG_RUNTIME_DIR` and `HOME`.
- `dxb-warm-wait` is running live: write your changes to a scratch copy and move it in by rename at the end, as the last writer did.
- Never print or copy the credentials file, an env file or a key; read only `claudeAiOauth.accessToken`, only inside `dxb-usage`.
- Write by the principles in `/home/dxb/DxB Global OS/references/engineering-craft/codebase-design.md`; check your own lines once against its 12 smells before hand-over. Do not run the battery. Do not commit.

## Working rules (verbatim)
> Before you say it's done, run the tests and show me the output. If something is missing or broken, tell me instead of working around it.

> Please avoid stopping while you still owe work the user asked for. Be persistent and do not stop unless needed.
> While status notes are welcome, as is clarifying with the user on open decisions, carry on with work that does not depend on the user's answer without unnecessary stops.
> If you notice yourself inviting the user to redirect you or offering to wait, instead proceed on the next part of the task. You may meet ordinary obstacles like errors, timeouts, locked files, empty results or failing tools. Diagnose them first, and when they are not real blockers, work through them with the access you have (wait and retry, fix the request, use another tool or source) rather than stopping unnecessarily.
> If someone clearly decided something is a hard blocker, such as a file marked not to be touched, access that was intentionally withheld, or a safety guardrail, leave it alone, say plainly what you found, and look for another safe way to finish the task. Stopping before the task is complete is very rarely merited, as in when the task can't move forward without user input, or where the blocker is deliberate and should not be worked past. This does not override the need for confirmation on risky or destructive actions.

## Report
Start and end clock. Per part (1–4): what changed (file:line), the test that carries it, its red line before and green after. The full output of the three test files. The real run's output. Every decision where this brief left a choice. Anything wrong, unbuildable or left open — plainly.
