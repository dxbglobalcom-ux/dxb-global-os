---
name: dxb-crew
description: Use when the CEO hands the construction a job that must run on its own — a chief engineer that measures and accepts, a writer that writes, a refuter that tries to break the work — in a phase loop with measurement gates and context-bounded handovers, so the work keeps moving while he is away without the sessions swelling or the quality dropping. Trigger `/dxb-crew <the job in one sentence>`.
---

# The crew — how a job runs itself from intent to record

**Where it came from.** 2026-09-21, the bench-hygiene job (Phases 1–3b, commits `6e1abcea`
→ `2300ce16`): one Fable session measured and ruled, one Opus session wrote, a refuter refused
the ruler seven times and was right seven times, and every phase was re-measured by the chief
engineer's own hands before it counted. The CEO's order on seeing it: *"Bu çalışma sistemini
bir skill haline getir… sistemi öyle kur ki ben dışarda olduğumda da iş yürüsün context şişmeden
ve kalite düşmeden. sanki bir loop gibi."* This door is that system. The laws it obeys are in
`AGENTS.md`; the doors it opens are `dxb-verify`, `dxb-close-row`, `dxb-ceo-report`.

## 1. Three seats, never fewer, never merged

| Seat | Model · effort | Does | Never |
|---|---|---|---|
| **Chief engineer** | Opus 5.5 · `xhigh` | writes the spec, splits the phases, names the dependants, re-measures EVERY number the writer reports with its own commands, rules ACCEPT / REJECT, reports to the CEO | writes a repository line while a writer is open; asks the CEO what to do |
| **Writer** | Opus 5.5 · `max` | writes every repository line inline, runs its own measurements, runs the refuter on its own diff, commits per phase | touches the company engine (54322) for anything but SELECT; touches what the CEO said is his (today: `tests/c42`); guesses a number |
| **Refuter** | Opus 5.5 · `xhigh` (subagent of the writer) | reads the diff, runs the battery itself, tries to break the work; every finding is `file:line` + a concrete scenario, or it is not a finding | writes; rules on taste; runs a third round |

The chief engineer and the writer are two Claude Code sessions in the VS Code editor-area
terminals of this machine, addressed by their `ListAgents` names. The seats were set on
2026-09-23 from Anthropic's official Opus 5.5 charts; the model id is pinned (`claude-opus-5-5`),
so a newer model enters only when it is measured and the CEO says so. Subagents of either are
the pinned roles in `~/.claude/agents/`; the one Fable seat, `design-eye` (Fable 5.1 · `high`,
the design second eye), has no `Agent` tool, because Fable subagents were measured spawning
their own sub-subagents and burning the quota.

**Refutation is finite because the bar is fixed.** A refuter returns measurable defects, at most
**two rounds** per phase; what survives round two becomes a board row and does not hold the
phase. The CEO's worry (*"refute sonsuz, hep bir şey bulunabilir"*) is answered by the bar,
not by skipping the refuter.

**A minor finding is repaired in the SAME pass — his law, 2026-09-22.** <!-- CEO-OK: crew-minors-fixed-in-same-pass-law-2026-09-22 --> He read the rule and made it one: *"bu kural olsun. yani aynı anda düzeltilsin küçük hatalar."* The refuter's minor findings are **listed and repaired in the same pass**: a one-line fix the writer makes at once, anything larger becomes a board row through `dxb-close-row`, and a minor **never gets a round of its own**.

## 2. The loop

```
INTAKE  → the job in ONE sentence, provable by measurement; the CEO's words verbatim;
          what is his and untouchable; the phases (3–5), each with its own proof.
for each PHASE:
  1. DEPENDANTS FIRST  — name what stands on the thing about to change; measure it (numbers, file).
  2. BUILD             — the writer writes; every claim carries command → decisive output.
  3. REFUTE            — the writer's refuter, ≤ 2 rounds, defects only.
  4. RE-MEASURE        — the chief engineer takes every number again with its own hands
                         (battery, table counts, service state, company fingerprint).
                         Mismatch → REJECT with file:line + scenario. Match → ACCEPT.
  5. DEPENDANTS AGAIN  — the same measurements as step 1; print what they printed.
  6. COMMIT            — one commit per phase; the tree is clean before the next phase.
  7. TELL THE CEO      — 5–6 lines, `dxb-ceo-report` shape; the position first; never a question.
  8. CONTEXT GATE      — §3. Hand over here if the rule says so; never mid-phase.
RECORD  → STATE (LAW A: the contradicted sentence is deleted, not footnoted), the board row
          through `dxb-close-row`, EVIDENCE with a dated note, rulers green
          (`pnpm verify:ledger`, the records ruler, `bash scripts/research-ruler.sh`).
          A phase that ends with the record behind reality is not finished.
```

**The job's own ruler.** A job that can leave residue builds its ruler in the first phase and runs
it in every later one (the bench battery counts every table before and after and goes red on a
change). A gate that cannot measure says `⚠ UNVERIFIED` and is red, never silently green.

**Sweep rule.** Whoever writes, sweeps — by ownership (a marker, a run id, a signature), never by
a watermark alone, never with an unscoped DELETE. The sweep runs AFTER the teardown's last
write (measured: a restore that re-granted quality grants wrote 13 rows after the broom passed).

## 3. The context gate — measure it, never guess it

The CEO's rule, 2026-09-21: *"%40 olsun maksimum"* and *"faz 3'ü bitirdi ve %30 … faz 4'te bu
iş çok uzun ve session %45'i geçicek, o zaman yeni devir yapsın."* A writer once reported
"~16 %" while the bar said 44 % — that estimate was a guess, and guessing is what this gate
forbids.

- **Read the bar, in this order:** `dxb-ctx --pct` (the status bar's own number, written by
  `~/.codex/hooks/dxb-statusline.js` for this session), and when it refuses (no record, or
  older than 10 min) `operator shot` and READ the percentage beside the model name at the
  bottom of the terminal. Every report to the other seat opens with `CONTEXT: N% (tokens)`.
- **When:** after every phase (step 8) and before starting one.
- **Hand over if** used ≥ 40 %, **or** used + the next phase's honest estimate > 45 %. A phase
  estimate comes from the phases already done in this job (tokens per phase so far), not from
  hope.
- **Only at a clean break:** no battery running, tree committed, the report sent. A handover in
  the middle of a phase is a breakage, and breakage is the one thing he forbade (*"sakın başka
  şeyleri bozmayın"*).

## 4. The handover — the engineer does it, never the CEO

*"bunları sen yapacaksın ben değil… CEO söyler siz mühendisler yaparsınız."* No step is ever
described to him.

1. **The note** — a file in the outgoing session's scratchpad, then `wl-copy < note`. It holds:
   the two seats and the peer's `ListAgents` name · the CEO's words of this job, verbatim and in
   order · the job sentence · every phase with its status and commit hash · the measurement
   method (commands, baselines, log paths) · the dependants and their measured values · the
   traps met · the first message the successor must send. Session-only orders stay marked as
   such — nothing becomes a law unless he said "make it a law".
2. **The successor is opened by the chief engineer** (its own successor included), in the VS
   Code editor area, through `operator` — look at the screen
   first; if the CEO is typing, wait. **Two measurements from this machine, 2026-09-21, and both
   break the obvious version of this step:** `operator type` INVERTS THE CASE here — the palette
   read `tERMINAL: cREATE nEW…` — and the palette matched it anyway, so a command NAME may still
   be typed; a case-sensitive command line may not, and is pasted instead. And `claude` is not on
   the PATH of a terminal VS Code opens (`claude: command not found`, 17:21), so the binary is
   named by its own path: `/home/dxb/.local/bin/claude` (a symlink into `~/.local/share/claude/versions/`).
   `operator key ctrl+shift+p` → `operator type "Terminal: Create New Terminal in Editor Area"`
   → `operator key Return` → `operator shot` (is the new terminal focused?) →
   `wl-copy '/home/dxb/.local/bin/claude --model claude-opus-5-5 --effort <xhigh|max> "$(cat <note>)"'` (`xhigh` for a chief engineer, `max` for a writer)
   → `operator key ctrl+shift+v` (the terminal's own paste — `ctrl+v` does not reach it, measured)
   → `operator shot` and READ the line before committing to it → `operator key Return` →
   `operator shot`.
3. **Prove it is alive:** `ListAgents` shows the new name; send it its first order; the outgoing
   session stops taking work and says so. A `SendMessage` "success" is a queue, not a delivery —
   the reply or the idle notice is the proof.

## 5. While he is away

- Acceptance inside the loop is by **measurement**; nothing waits for his eye to *continue*.
  What needs his eye to be *accepted* (LAW B) is listed under "waiting on him" in the record
  and in the next report, and the loop moves to the next phase.
- The approval gate is untouched: money out, contracts, e-mail, ad spend, identity steps stop.
  Deleting anything in the company engine stops too — first a list with sizes, then his click.
- Every report he will read on return states the position in four lines (`CLAUDE.md` §0) and
  then the phase result. *"Ne yapmamı istersiniz?"* is a failure.

## 6. Traps already paid for

- `pgrep -f`/`pkill -f "<pattern>"` match the caller's own command line → write `[b]attery.sh`.
- Do not edit a bash script that is running (`battery.sh` reads itself while it runs).
- Two batteries on one engine measure each other → the battery takes a `flock`; the second says
  `REFUSED`.
- A rebuilt engine has a new cluster identity → the ledger-identity guard rightly refuses it;
  re-allow with the tool, `--forget` the vanished one.
- `cd` inside a compound Bash command is blocked → `git -C`, `pnpm -C`, absolute paths.
- A grep for `INSERT` does not find what a library writes → measure the table, not the text.
