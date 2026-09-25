---
name: dxb-crew
description: Use when the CEO hands the construction a job that must run on its own — a chief engineer that measures and accepts, a builder subagent that writes the code at max, a refuter that tries to break the work — in a phase loop with measurement gates and context-bounded handovers, so the work keeps moving while he is away without the sessions swelling or the quality dropping. Trigger `/dxb-crew <the job in one sentence>`.
---

# The crew — how a job runs itself from intent to record

**Where it came from.** 2026-09-21, the bench-hygiene job (Phases 1–3b, commits `6e1abcea`
→ `2300ce16`): one Fable session measured and ruled, one Opus session wrote, a refuter refused
the ruler seven times and was right seven times, and every phase was re-measured by the chief
engineer's own hands before it counted. The CEO's order on seeing it: *"Bu çalışma sistemini
bir skill haline getir… sistemi öyle kur ki ben dışarda olduğumda da iş yürüsün context şişmeden
ve kalite düşmeden. sanki bir loop gibi."* This door is that system. The laws it obeys are in
`.claude/CLAUDE.md`; the doors it opens are `dxb-verify`, `dxb-close-row`, `dxb-ceo-report`.

## 0. What he says is done by us — never handed back to him

**His order, 2026-09-24, with his word to write it here.** <!-- CEO-OK: engineers-do-what-he-says-by-operator-2026-09-24 -->
*"benim söylediğim herşey mutlaka siz mühendislerim tarafından yapılmadı okadar. bunu crew tarafına da
yazabilirsin. etkili olacak şekilde."* Anything he would otherwise do himself at this machine — a
Claude Code command such as `/goal`, a click, a key, a browser page, a window, a setting — is done by
the engineer through `operator` (`~/.claude/skills/operator/SKILL.md`: `operator shot`, look, act, look
again; the mechanics for this screen are in `dxb-operator`). A reply that tells him *"you type it"*,
*"you click it"* or *"only you can"* is not sent: it is replaced by the act itself. **Why it is here:**
the night he gave it, he had ordered `/goal` before every commit and the chief engineer answered that
only he could type it; `operator` then put it into the successor's prompt box in four commands, and he
saw `Goal set` on his own screen.

## 1. Three seats, never fewer, never merged

| Seat | Model · effort | Does | Never |
|---|---|---|---|
| **Chief engineer** | Opus 5.5 · `xhigh` | writes the spec, splits the phases, names the dependants, hands every code change to the builder, re-measures EVERY number the builder reports with its own commands, rules ACCEPT / REJECT, commits per phase, reports to the CEO | writes a code file (the hook refuses it); asks the CEO what to do |
| **Builder** | Opus 5.5 · `max` (subagent of the chief engineer); `builder-lean` · `medium` for simple work, and for all code while the weekly quota is ≥ 80 % | writes every line of code from the chief's spec, runs its own measurements, reports command → decisive output | commits; touches the company engine (54322) for anything but SELECT; touches what the CEO said is his (today: `tests/c42`); guesses a number |
| **Refuter** | Opus 5.5 · `xhigh` (subagent of the chief engineer) | reviews the phase's diff against its acceptance items and runs them itself; sorts every finding (`file:line` + a concrete scenario) into A, B or C (below); the phase passes when A is empty | writes; rules on taste; hunts outside the diff; opens a new hunt in round 2 |

The chief engineer is a Claude Code session in the VS Code editor-area terminals of this
machine, addressed by its `ListAgents` name; the builder and the refuter are its subagents.
**Code is written by the builder, at max — his order, 2026-09-24:** *"kod işi mi var hemen bir
agent opus 5.5 max açılır sub-agent … o kodu o seviyede yazması için! … bu da bir hook ile
sabitlensin."* <!-- CEO-OK: code-by-builder-at-max-hook-2026-09-24 --> Anthropic's pages chose the
subagent over a teammate: a subagent file carries its own effort, a teammate inherits the lead's.
The global hook `dxb-code-gate.py` refuses a code-file write (Write, Edit, a Bash redirect) made at
any other effort, and turns a `builder` call into `builder-lean` only while the weekly quota the
status line persists is at or above 80 %. **Simple work runs at medium — his yes, 2026-09-24:**
*"tmm güzel. yapın."* <!-- CEO-OK: simple-code-at-medium-rule-2026-09-24 --> Measured first (T8, two
of this repository's own past fixes written at both efforts and judged by a refuter): simple work
equal at `medium` and 5.6× cheaper; harder work better at `max`. Simple = one code file, at most 40
changed lines, no money / approval / database / security / governance path → the chief picks
`builder-lean`; anything else, or any doubt → `builder`. The hook holds the line: a `builder-lean`
write outside it is refused, and the work goes to the `builder`. The seats were set on
2026-09-23 from Anthropic's official Opus 5.5 charts; the model id is pinned (`claude-opus-5-5`),
so a newer model enters only when it is measured and the CEO says so. The other subagents are
the pinned roles in `~/.claude/agents/`: `refuter` and `debugger` Opus 5.5 · `xhigh`, `scout`
Haiku · `low` (locations only), and the one Fable seat, `design-eye` (Fable 5.1 · `high`, the
design second eye), which has no `Agent` tool, because Fable subagents were measured spawning
their own sub-subagents and burning the quota.

The builder seat is for code; record and instruction text is written by the chief engineer
itself, at `xhigh`. No seat but the builder goes to `max` unless a quality gain has been measured
on our own work — Anthropic's own instruction: *"Reserve xhigh and max for work where you've
measured a quality gain."* <!-- CEO-OK: crew-writer-code-max-only-2026-09-24 -->

**Refutation ends because the line is drawn before the work — his decision, 2026-09-24.** <!-- CEO-OK: refuter-redesign-2026-09-24 -->
Measured before it: 12 of the 13 refuter verdicts on record were a fail, because any finding anywhere
rejected the work and every round was a fresh hunt (*"3 veya 10 sınırda koysanız yine de
çürütecektir"*). The chief engineer writes each phase's acceptance items before the phase starts —
numbered, each a command and its expected output. Pass or fail is those items plus the battery.
The refuter reads only the diff and sorts every finding:
**A** — breaks an acceptance item, or is a real defect this work made: the phase does not pass until
it is fixed. **B** — a small defect this work made: repaired in the same pass (next paragraph).
**C** — a defect older than this work: a board row through `dxb-close-row`, never a blocker.
Round 2 re-checks only round 1's A list and opens no new hunt; an A item still open after round 2
goes to the CEO with its reason.

**A minor finding is repaired in the SAME pass — his law, 2026-09-22.** <!-- CEO-OK: crew-minors-fixed-in-same-pass-law-2026-09-22 --> He read the rule and made it one: *"bu kural olsun. yani aynı anda düzeltilsin küçük hatalar."* The refuter's minor findings are **listed and repaired in the same pass**: a one-line fix the builder makes at once, anything larger becomes a board row through `dxb-close-row`, and a minor **never gets a round of its own**.

## 2. The loop

```
INTAKE  → the job in ONE sentence, provable by measurement; the CEO's words verbatim;
          what is his and untouchable; the phases (3–5), each with its acceptance items
          (numbered, each a command and its expected output), written before the phase starts.
for each PHASE:
  1. DEPENDANTS FIRST  — name what stands on the thing about to change; measure it (numbers, file).
  2. BUILD             — the builder writes from the chief's spec; every claim carries
                         command → decisive output.
  3. REFUTE            — the refuter sorts the diff's findings into A / B / C (§1); B is
                         repaired at once; round 2 re-checks round 1's A list only.
  4. RE-MEASURE        — the chief engineer takes every number again with its own hands
                         (battery, table counts, service state, company fingerprint).
                         Mismatch → REJECT with file:line + scenario. Match → ACCEPT.
  5. DEPENDANTS AGAIN  — the same measurements as step 1; print what they printed.
  6. COMMIT            — the chief engineer, one commit per phase; the tree is clean before the next.
  7. TELL THE CEO      — short, `dxb-ceo-report` shape; the position first; never a question.
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

The CEO's numbers, 2026-09-26: **50 / 55** — *"tmm önerini yapalım"* on the recommendation put
to him (a 1M window; a handover costs ≈ 8 % of it in the successor's opening alone; ~2 jobs a
session under 40, ~3 under 50). They replace his 40 / 45 of 2026-09-21 (LAW A), which were set
after a writer reported "~16 %" while the bar said 44 % — that estimate was a guess, and guessing
is what this gate forbids. Since B59 (2026-09-26) a hook holds both numbers
(`~/.claude/hooks/dxb-context-gate.py`): the red line on every prompt from 50 %, the Agent tool
refused from 55 % in every session opened after it.

- **Read the bar, in this order:** `dxb-ctx --pct` (the status bar's own number, written by
  `~/.claude/hooks/dxb-statusline.js` for this session), and when it refuses (no record, or
  older than 10 min) `operator shot` and READ the percentage beside the model name at the
  bottom of the terminal. Every report to the CEO opens with `CONTEXT: N% (tokens)`.
- **When:** after every phase (step 8) and before starting one.
- **Hand over if** used ≥ 50 %, **or** used + the next phase's honest estimate > 55 %. A phase
  estimate comes from the phases already done in this job (tokens per phase so far), not from
  hope.
- **Only at a clean break:** no battery running, tree committed, the report sent. A handover in
  the middle of a phase is a breakage, and breakage is the one thing he forbade (*"sakın başka
  şeyleri bozmayın"*).

## 4. The handover — the engineer does it, never the CEO

*"bunları sen yapacaksın ben değil… CEO söyler siz mühendisler yaparsınız."* No step is ever
described to him.

1. **The note** — a file in the outgoing session's scratchpad, then `wl-copy < note`. It holds:
   the seats (chief engineer session; `builder` / `builder-lean` and `refuter` subagents) · the CEO's words of this job, verbatim and in
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
   `wl-copy 'systemd-run --user --scope --quiet --collect -p MemoryMax=16G -p MemorySwapMax=4G -- /home/dxb/.local/bin/claude --model claude-opus-5-5 --effort xhigh "$(cat <note>)"'` (only chief engineer sessions are opened — code is written by the builder subagent inside the session; the `systemd-run` prefix is the memory box that `~/.bashrc`'s `claude()` wrapper gives a typed `claude` — a session opened by its full path skips that wrapper and ran unboxed, `MemoryMax=infinity`, measured 2026-09-24)
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
- The approval gate is untouched: money out, contracts, ad spend, identity steps and the subjects he
  marks stop.
  Deleting anything in the company engine stops too — first a list with sizes, then his click.
- Every report he will read on return opens with the position (`CLAUDE.md` §0 — a line with
  nothing in it is dropped, not announced) and then the phase result. *"Ne yapmamı istersiniz?"* is a failure.

## 6. Traps already paid for

- `pgrep -f`/`pkill -f "<pattern>"` match the caller's own command line → write `[b]attery.sh`.
- Do not edit a bash script that is running (`battery.sh` reads itself while it runs).
- Two batteries on one engine measure each other → the battery takes a `flock`; the second says
  `REFUSED`.
- A rebuilt engine has a new cluster identity → the ledger-identity guard rightly refuses it;
  re-allow with the tool, `--forget` the vanished one.
- `cd` inside a compound Bash command is blocked → `git -C`, `pnpm -C`, absolute paths.
- A grep for `INSERT` does not find what a library writes → measure the table, not the text.
