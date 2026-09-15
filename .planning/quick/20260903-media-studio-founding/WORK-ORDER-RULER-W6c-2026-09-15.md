# WORK ORDER — the persona ruler, then W6c (2026-09-15, 12:20)

**From the CEO, relayed by the Fable 5.1 checker session (dxb-global-os-2a) before it closed.**
You are a NEW Opus 5 session. You inherit the branch `studio/b43-ferrari-implementation-20260915`
(12 commits, HEAD `b1c099d0`, tree clean) and this order. You are the author (opus-5, U30). Work the way
the checker worked today: **measure before you state, with your own commands; print command → decisive
line for every claim; a count you did not run yourself is a lead, not a fact.** His words for the whole
order: *"gerçekçi, kaliteli ve gelecekte sorun olmaması için"* and *"sakın hata yapmasın, ince ince."*

## Why this order exists (read once)

Today W5, W5b, W6 and W6b were built by an Opus session and re-measured by a Fable session. The doctrine
of the 16 studio seats is correct by both rulers (concept loss 0, residue 0, road check 16/16). The
WRITING is not: the two sessions used different rulers. The builder counted a "sentence" per line and
reported 118 → 0 over-80-word sentences; the checker counted period-to-period and found 116 still over
80 words (longest 260, `design-image-prompt-engineer`). W6b inserted line breaks at `; `, ` → `, ` — `
instead of writing shorter sentences (word counts unchanged: 52 910 → 52 975). Nobody lied; the metre
differed, and the checker's metre had been handed over as prose, not as a script.

The CEO's ruling on the method: **the checker's ruler is a runnable script and is handed to the builder
BEFORE the work; the work order is that script's PASS; both sides run the same script.** Roles are not
fixed (Fable may build and Opus check, or the reverse); the ruler is what stays.

## PART 1 — the sentence for the door (ONLY on his explicit word)

If, and only if, the CEO has said "kural olsun" for this (ask him in ONE line at the start of your
session if his opening message does not say it), add one sentence to `.claude/skills/dxb-verify/SKILL.md`
under "Run these, in this order", as a row of the battery table:

> Every audit's ruler is a runnable script, handed to the builder before the work; the order is that
> script's PASS; builder and checker run the same script and paste its output into the evidence.

No other text. If he has not said it, skip Part 1 and say so in your report. His prohibition of
2026-08-13: nothing becomes a law or a standing rule unless he says so.

## PART 2 — the persona ruler (code; one test, one script, one data file)

Build it so that no persona file can reach the database failing it, and so that any future session —
whoever builds, whoever checks — gets the same numbers.

**Files**
- `tests/personas/persona-ruler.test.ts` — the ruler as a vitest test (runs in the battery).
- `scripts/persona-ruler.sh` — the same ruler for a human or a session at the shell: prints one table,
  one line per file, PASS/FAIL per rule, exit 1 on any FAIL. It must call the same code as the test
  (one implementation; the shell script is a runner, not a second ruler).
- `tests/personas/persona-ruler.concepts.json` — the concept contract per department (start with
  `media-studio` and the two assigned seats; other departments empty until their work comes — no
  bureaucracy ahead of need).
- Wire it into `scripts/sync-personas-to-db.sh` in **submit** mode: a file that fails the ruler is not
  submitted (fail closed, the failure table printed). `--verify` mode is unchanged. Do NOT touch
  `scripts/hooks/pre-commit` (it is gitleaks-only on purpose).
- Add the ruler as one row to the battery table in `.claude/skills/dxb-verify/SKILL.md` (this row is
  a battery entry, not a law — it does not need Part 1).

**Scope of measurement** — the delivered body only: from the line `# PERSONA — ` to the line before
`## 12. `. The dossier table above the header is measured separately (only its factual fields:
`| 33 | Last updated |` must be ≥ the last date in field 31). §12 is measured only for identity.

**Definitions (write them as constants at the top of the test, with these names)**
- SENTENCE: text between sentence terminators. A terminator is `.` `!` `?` followed by whitespace or
  end of line. `;`, `:`, `→`, `—`, `·` and a line break are NOT terminators. (This is the whole
  reason W6b did not count.)
- ENUMERATED STEP LINE: a line beginning with `(n)` or containing ` → ` chains: measured per step
  (split at `(n)` / ` → `), each step ≤ 80 words.
- WORDS: whitespace-separated tokens.
- PARENTHESIS DEPTH: maximum nesting of `(`…`)` within one line.
- DUPLICATE CLAUSE: any 12-word window (normalised: lowercase, punctuation stripped) that occurs twice
  in the same body, excluding the canonical law paragraph (see below) and §12.

**Rules and thresholds (each a named rule with PASS/FAIL and the offending line printed)**
1. `sentence-length`: every SENTENCE ≤ 80 words.
2. `line-terminator`: every non-empty body line that is not a heading, a comment, a list item or an
   enumerated step ends with `.` `:` `)` `?` `!` or `»` — no soft line break inside a sentence.
3. `paren-depth`: PARENTHESIS DEPTH ≤ 1.
4. `paren-balance`: 0 unbalanced lines.
5. `no-duplicate-clause`: 0 DUPLICATE CLAUSES.
6. `voice-residue`: every match of `voice-over|voice over|narration|scratch|AI voice|TTS` in a body is
   inside a prohibition (the same sentence contains `no |never |not |NO |cancelled|removed|refus`).
7. `three-roads`: no sentence that names a client-facing human's entry road with `real photograph`
   and `written sheet` but without `engine-born|casting take|AHMET`. Print the sentence.
8. `no-model-name`: 0 matches of `GPT-6 Astra|GPT Astra|Astra's|Solo 5\.6|Fable 5\.1|Opus 5` in a
   body (dossier field 31 excluded). Model names live in the DB, not in the delivered body.
9. `section-12-identity`: §12 md5 identical across every file measured; the canonical hash is
   whichever hash the majority carries, and every deviation is printed.
10. `delivery-header`: exactly one `# PERSONA — ` line per file.
11. `canonical-law-paragraph`: the shared paragraph that begins `Everything of a piece — script,
    storyboard, panels, stills, first frames, the cut — is made here` is byte-identical in every
    file that carries it (one canonical text; print the md5 and the deviating files). Its own
    sentences obey rule 1.
12. `concept-contract`: for each file, every concept listed for its department in the JSON is present
    (case-insensitive regex, ≥1 hit). Seed the media-studio list from today's checker run: three
    roads · no face drawn outside the engine · road from the brief / "choose the best" · T2V general
    default, I2V not forbidden · local engine first, Flux not in a local take · one take when it
    suffices · joins on the engine's own frames · measured hold · engine's own voice only · LAW D
    order · 4 sampling steps · 1080p ceiling · cast law · skin-mark board rule · lettering · money
    gate. **Mark per concept which seats must carry it** (the sound seat does not need 1080p; the
    delivery seat does not need the road rule). Do not invent a concept a seat never carried; derive
    the per-seat list by grepping HEAD `b1c099d0` first and printing it.
13. `dossier-date`: field 33 ≥ the latest date in field 31.

Thresholds live in ONE constants block. The test prints the per-file table even when it passes.

**Gates for Part 2:** `npx vitest run tests/personas/persona-ruler.test.ts` runs and FAILS on HEAD
(it must — 116 sentences over 80 words exist; a ruler that passes today's files is wrong); the shell
runner prints the same table and exits 1; `scripts/sync-personas-to-db.sh --verify` still PASS (213/0);
`tests/r31/persona-delivery.test.ts` 4/4; `tests/b43/road-consistency.test.ts` 16/16; typecheck of the
new test; i18n PASS; ledger OK; gitleaks. Commit 1: `tooling(ruler): …` — the ruler and its wiring only.
Nothing bound, no migration, `enforce_persona_gate_on_activation` untouched.

## PART 3 — W6c: the writing, until the ruler is green (commit 2)

Run the ruler; edit only what a FAIL line names; rewrite each failing sentence into sentences that END
WITH A PERIOD and are ≤ 80 words, in the seat's own voice. **Doctrine does not change**: the concept
contract (rule 12) is the guard, and the road check must stay 16/16. Keep every date and every CEO
quotation exactly as written. Do not delete a clause; split it. Remove the W6b soft line breaks by
joining them back into sentences and then splitting at real sentence boundaries. The canonical law
paragraph is rewritten ONCE into ≤80-word period-terminated sentences and pasted identically into the
12 files (the paste must never look above `# PERSONA — ` — the 1796-word cut of W6b came from that).
A line already passing every rule is left byte-for-byte.

Repeat until the ruler prints 16/16 PASS. Then: sync every changed seat with `DXB_PERSONA_AUTHOR=opus-5`
(the ruler now runs inside submit), `--verify` 213/0 PASS, `fn_persona_gate` passed, road check 16/16,
delivery test 4/4, i18n, ledger, gitleaks, tree clean. Read every rewritten sentence back in context
before the gate — three of today's defects were found only that way.

Blast radius in the report: bindings still `fable-5 × 16` (SELECT and print), gate function md5
`b21b62c7a5f74a6163dd8eab96f3d592` unchanged, `db/migrations` 0 files, which delivered bodies changed
(`worker-shim.ts:294` reads the file at runtime).

Records: a "Ruler + W6c" section in `EVIDENCE-W5-2026-09-15.md` with the ruler's before/after table
pasted verbatim; one line in `.planning/STATE.md`'s live block; one line on the B43 row. This work-order
file is committed with commit 1 as the record of the order.

## What you do NOT do

- No binding of the 16 seats (B08 step 0 — his sentence "kapıyı U30'a hizala, sonra bağla" is pending).
- No touch of the activation gate, no migration, no change to the six non-media personas.
- No rule or standing order written anywhere without his explicit "kural olsun" (Part 1 only).
- No subagent writes a line. Subagents may audit read-only.
- No `cd` inside a compound Bash command (the prompt gate blocks it; use absolute paths, `git -C`).
- No recursive scan of `/` or `$HOME` (the cost gate blocks it; measure size first).

## Report to the CEO (Turkish, `dxb-ceo-report` shape)

Answer first, a picture from his world, the numbers in one table (ruler before → after per rule), what
it means for him. Both commits *"yazıldı ve kapıdan geçti — gözünüzü bekliyor (KANUN B)"*. Anything a
terminal cannot observe: ⚠ UNVERIFIED, listed apart. Never "ne yapmamı istersiniz". Position line at
the top of every reply: what waits for his eye · what is next · what is blocked on him.

## Baseline the checker measured on `b1c099d0` (so you need not re-derive it)

| ruler (period-based) | value |
|---|---|
| sentences > 80 words, 16 bodies | 116 |
| sentences > 150 words | 14 |
| longest sentence | 260 (`design-image-prompt-engineer`), 251 vfx-post, 231 delivery-qc, 217 film-director |
| body lines not ending in `.` `:` `)` (soft breaks added by W6b) | 35–47 per file |
| parenthesis depth | 1 in all 16 |
| concept loss vs `26f21fea` | 0 |
| shared law paragraph | 12 / 16 files |
| road check · delivery test · sync --verify | 16/16 · 4/4 · 213/0 PASS |
| bindings · gate md5 · migrations | fable-5 × 16 · b21b62c7… · 0 |
