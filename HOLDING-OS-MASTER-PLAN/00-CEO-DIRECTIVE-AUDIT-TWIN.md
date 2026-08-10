# CEO DIRECTIVE — THE AUDIT TWIN (inline authorship + adversarial audit)

> **Status:** BINDING on every construction session until the project ends.
> **Ruling:** CEO, 2026-07-26 — *"B onayla, W5.1 denetimini bu kurallarla koş. bunu claude md ve olması gereken yerlere nakşet en mükemmel şekilde."*
> **Registered as:** U36 in `00-INDEX.md`. (It amended Standing Order 11, which the CEO deleted on
> 2026-08-10 — "sil"; this directive stands on its own and is unaffected.)
> **Does NOT amend:** K1 (inline authorship), RULE #0, RULE #0-A, RULE #0-B. Those stand unchanged.

---

## 1. Why this exists

The holding already forbids an agent from approving its own critical work: the
runtime council writes with one model and *refutes* with another
(`packages/orchestrator/src/critical-gate.ts:4` — "Opus 5 WRITES the answer.
Challengers try to REFUTE it", challengers `gpt-5.6-sol` and `gpt-5.5`,
line 125 "another model owns authorship").

The builder was exempt from his own rule. Measured 2026-07-26: Standing Order 11
excluded subagents from construction entirely, so every "done" claim in this repo
rested on machine gates plus the author's own word. The machine gates are strong
and they catch code defects — 632 tests, `tsc -b`, the DB suite, the E2E tier,
`scripts/i18n-purity-check.sh`, the RULE #0 pass. They do not catch **claim
defects**: "this is finished" when it is not, "this was verified" when the
verification measured something else, a record that no longer matches reality.

Every defect that has reached the CEO's eye belongs to that class — the ellipsis
truncation, the English cards on the Turkish board, the dead chat, the U28
record-versus-reality mismatch, a RULE #0 pass that reported PASS while
photographing the login page. The audit twin exists for exactly that class, and
for nothing else.

**The principle, in one line: the rule the holding imposes on its agents applies
to the one who builds them.**

---

## 2. The line that must never move

| | Allowed | Forbidden |
|---|---|---|
| **Authorship** | The session's authorized author (Opus 5 / Fable 5, U30) writes every repo line **inline** | A subagent writing, editing, or generating any repo content — code, migration, spec, test, commit message. K1 is untouched. |
| **Audit** | An independent agent given a *claim* and its *evidence pointers*, whose only job is to **refute** | An agent asked "does this look good?", or asked to approve, sign off, or close a row |
| **Breadth** | Read-only sweeps that return a table ("which routes are still single-language", "which tables have no RLS") | Any sweep that edits, seeds, migrates, restarts, or otherwise mutates |
| **Verdict** | The session author owns every verdict and every ✓ | A subagent's finding is EVIDENCE, never a verdict. No row closes on a subagent's word. |

A subagent that writes is a governance violation of the same tier as a silent
deviation (RET + recorded). This directive widens nothing about authorship; it
only removes the exemption the author had from adversarial review.

---

## 3. Read-only is MECHANICAL, not promised

An auditor that promises not to write is not read-only. Enforcement is by tool:

- **Codex lane (cross-model, the critical gate):** `codex exec -s read-only`
  — the sandbox refuses writes; this is the same mechanism the runtime council
  already runs under (`critical-gate.ts:161` `codexRunner`). The working
  directory is the repo for an audit (the council's own runner uses a temp dir;
  pointing it at the repo is the only adaptation needed).
- **Claude lane (breadth sweeps):** tool set restricted to `Read`, `Grep`,
  `Glob`. No `Edit`, no `Write`, no `NotebookEdit`.
- **When a measurement genuinely needs a command** (a `psql` count, a `git log`),
  the rule is not "no commands" — an auditor that cannot measure is theatre. The
  rule is **no writing commands**: no `INSERT/UPDATE/DELETE`, no migrations, no
  service restarts, and **never the test suites**, because fixtures seed the live
  database (measured precedent: test fixtures once wrote 3,087 false
  `tool_missing` rows into the live audit table).
- **Proof, not trust:** the author records row counts of `audit_log`, `tasks`,
  `opportunities` and `agent_runs` **before and after** every audit. A
  difference invalidates the audit and is recorded as a defect of the audit
  itself.

---

## 4. When the twin fires — three triggers, no others

1. **The CEO acceptance session** (`ACCEPTANCE_CRITERIA.md`, roadmap W5.1) — the
   most critical gate, therefore **cross-model** (Codex lane). A Claude auditing
   a Claude shares its blind spots.
2. **A row closing whose evidence has a leg the machine cannot check** — a claim
   about completeness, about a record matching reality, about "nobody has to do
   this by hand any more". Rows that close on tests + `tsc` + E2E + RULE #0 alone
   do NOT need an auditor; there, the machine already refutes.
3. **A defect the CEO caught** — the auditor sweeps that defect's **class**
   across the whole repo, not the one instance. One bad label means "find every
   surface that can produce a bad label".

**Not every run. Not every commit.** An audit on work the batteries already
prove is ritual, and ritual costs without buying anything.

---

## 5. The auditor's contract

**Input** — the claim, and where to measure it. Never the author's summary,
never his conclusion. A file path, a command, a table name; the auditor forms its
own opinion from the same ground the author stood on.

**Task** — *refute*. Not review, not improve, not rewrite. Written in the prompt
in those words, the same way the runtime gate words it.

**Output** — one row per claim:

| claim | verdict | the command that was run | its decisive output |
|---|---|---|---|

- `REFUTED` — with the measurement that breaks it.
- `STANDS` — **only** with the commands that failed to break it. "Looks fine" is
  not an output; a silent audit is an invalid audit.
- `UNMEASURABLE` — the honest third answer, with the reason.

**Disagreement** — the auditor refutes, the author defends, neither can prove:
the claim **cannot stay ✓**. It drops to `⚠ UNVERIFIED` in the report and in the
record. Silence in favour of the author is forbidden.

**Sequence** — the audit runs **after** the author's full battery, never instead
of it. A machine-catchable defect that the auditor finds is recorded as the
**author's** defect, not as an audit success. Otherwise the checklist quietly
degrades into "the auditor will catch it".

---

## 6. Pilot measurement (written before the first run, W5.1)

| Metric | Threshold |
|---|---|
| Criteria that received a command-backed refutation attempt | ≥ 24 / 27 |
| Findings supported by a command / total findings | ≥ 80% |
| False alarms (finding disproved by measurement) | ≤ 25% |
| Write-check: row counts before vs after | identical, exactly |
| Wall-clock + token cost | recorded (no measurement exists yet — the pilot produces the first) |

**Stop rule.** If the false-alarm rate exceeds 25%, or the audit surfaces
nothing the batteries did not already have, the twin is withdrawn. It stays
because it works, not because it is written down.

**Cost, honestly.** Measured basis: `cost_ledger` carries 3.59 billion tokens
over 30 days at €0.0000 — construction and runtime both ride subscription lanes,
so the OS's metered €50-150 budget is untouched by this. Estimated cost to
project completion: ~10 audit runs, ~1M tokens total, roughly 0.03% of current
volume; the real currency is subscription headroom and wall-clock (5-15 minutes
per audit), not euros. Everything in this paragraph after the first sentence is
an ESTIMATE and is labelled as one until the pilot measures it.

---

## 7. What this does NOT do

- It does not raise the quality ceiling. It **lowers variance** — it removes the
  worst days, not improves the best ones.
- It does not delegate the CEO's eye. `ACCEPTANCE_CRITERIA.md` marks 11 of 27
  criteria as tier **C**, explicitly *"hiçbir modele devredilemez"*. On those
  rows the auditor's only legitimate job is to confirm that **nobody claimed
  them as verified**.
- It does not create authority. A subagent cannot close a row, cannot approve, and
  cannot sign. The author signs; the record shows what was attacked and what
  survived.

---

## 8. Pilot result — run 1 (2026-07-26 23:00-23:50, W5.1 pre-acceptance)

| Metric | Threshold | Measured | Verdict |
|---|---|---|---|
| Criteria given a command-backed refutation attempt | ≥ 24 / 27 | **19 / 27** (8 UNMEASURABLE: 6 tier-C rows correctly refused as never-delegable, 2 blocked because the sandbox cannot reach the database container) | **MISSED** — and the reason is the author's prompt, not the auditor: the Codex sandbox has no database, which was foreseeable and unaddressed |
| Findings backed by a command | ≥ 80% | **14 / 14 = 100%** (every block carried the command it ran) | MET |
| False alarms | ≤ 25% | **3 / 14 = 21%** (RLS "gap" was fail-closed by design — zero grants; "Command Center" is the wordmark, not untranslated copy; the org-graph row named the wrong view in the DOC, the product reads the right one) | MET |
| Write-check (`audit_log`/`tasks`/`agent_runs`/`opportunities`) | identical | **26753/216/377/5 → 26753/216/377/5** | MET |
| Cost | record it | 4 agents, ~250k tokens, ~50 min wall-clock, €0 metered (subscription lanes) | recorded |

**What it caught that the batteries did not** — three confirmed defects, all fixed in the same turn:

1. **§35 violation live in the product.** `/design-preview` shipped in the production build and rendered invented metrics ("Active agents 24", "Daily cost 6.80 EUR", an agent table with 128 runs at €4.12), and `/design-audit` linked to it from the command side. §35 makes fake metric data an automatic RET. Now dev-only (404 in production) with an E2E gate.
2. **The risk register was half-translated.** `project_risks` had no `title_tr`/`note_tr`, so /gov/risks and every project's Command View showed English sentences on the Turkish board. Migrations 20260726017000 + 017500, both consumers localised, purity gate extended.
3. **The acceptance record contradicted the roadmap.** This file said "no session yet" while `IMPLEMENTATION_ROADMAP.md:160` carried a verbatim CEO approval from 2026-07-18. U28 class. Reconciled above.

**And one the CEO caught while the audit ran** — seven "Başarısız" rows on his Görevler board were test probes from the e8 observability suites, left behind when a suite failed mid-run. The global teardown now sweeps that class (fourth one it owns). That is a defect of the author, not of the audit — the pilot's own rule.

**Author-side lessons recorded:** the Codex lane needs the prompt on **stdin** (a positional argument makes `codex exec` wait for stdin and burn the whole timeout); the breadth sweep found no dummy data because the author scoped it to `(command)` pages while the fake-metric route lived outside that group — a narrow scope produces a clean answer that means nothing.

**Verdict on the twin itself: it earns its place.** It found a §35 automatic-RET defect on a shipped surface that six months of machine gates never flagged, at a false-alarm rate inside the threshold and with a clean write-check. The missed coverage metric is fixable (give the auditor database reach, or split the DB-dependent rows to a lane that has it) and is scheduled for run 2, before the CEO's acceptance session.
