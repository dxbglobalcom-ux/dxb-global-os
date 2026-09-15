# WORK ORDER — W5b + W6 (2026-09-15, 11:40)

**From the CEO, relayed by the Fable 5.1 session (dxb-global-os-2a) after re-measuring W5 claim by claim.**
Result of that re-measurement: 19 of 21 claims true, 2 overstated (F010 "8 of 8 prohibitions", F012 "0 two-road clauses").
His words: *"sakın hata yapmasın, ince ince her şeyi yapsın."*

Rules for the whole order: do it yourself inline (one session, one author = opus-5); no subagent writes;
no binding; no migration; do not touch `enforce_persona_gate_on_activation` (B08 step 0 waits on his word).
Two commits, in this order. Nothing is "done" without the printed command and its decisive line.

---

## PART A — W5b: the six residues + the record (commit 1)

Measured on `7cdf7dd9` (branch `studio/b43-ferrari-implementation-20260915`, tree clean):

- **A1.** `personas/media-studio/media-storyboard-previz.md` line 22, field 13: `animatics (stills with timing and sound scratch)` — a scratch track listed as a competence. Rewrite: silent animatic, timing from the line sheet's measured reading seconds, no scratch track (CEO 2026-09-04).
- **A2.** same file line 64, §2: `The animatic proves the cut: panels with their measured seconds and a scratch of the lines, played through` — an instruction to lay a scratch voice; contradicts lines 53, 69, 110 of the same file. Rewrite: played through silent against the line sheet's reading seconds, never a scratch voice (CEO 2026-09-04).
- **A3.** same file line 91, §6 (b): `the real photograph or the frames of its own engine-born casting take` — two roads. Add the third: or a written sheet where the shot goes text-to-video.
- **A4.** `personas/design/design-image-prompt-engineer.md` line 66, §2: `a face or a product enters as a real photograph bound as reference or as a precise written sheet` — two roads. Open to three: real photographs bound as reference, the frames of its own engine-born casting take (AHMET, JAMES, 2026-09-04), or a precise written sheet on the text-to-video road; no face drawn outside the engine (2026-09-13).
- **A5.** same file line 76, §3: `character sheets from real photographs, the product from its real photographs` — add: or from the frames of an engine-born presenter's own casting take.
- **A6.** `personas/media-studio/media-film-director.md` line 77, §4 Escalates: `a scene that needs a face or product the studio does not hold a real photograph of` — the old photo-only doctrine. Rewrite: a face or product with none of the three roads behind it (no real photograph, no engine-born casting frames, no written sheet).
- **A7.** Record behind reality: `personas/media-studio/media-continuity.md` field 33 says 2026-09-03 and its body stamp (line 50) says 2026-09-03; `personas/media-studio/media-product-brand-consistency.md` field 33 says 2026-09-04, stamp line 50 says 2026-09-04 — both carry 2026-09-14 rulings in field 31 and §3. Bring field 33 and the stamp date to the date of the last content change (2026-09-14) and add a field-31 entry for today's correction. The stamp is inside the delivered body, so these two files also get a new synced version.
- **A8.** The evidence file `.planning/quick/20260903-media-studio-founding/EVIDENCE-W5-2026-09-15.md` overstates two AFTER cells: F010 "8 of 8 are prohibitions" (false — storyboard lines 22 and 64 were not prohibitions) and F012 "0 presenter clauses enumerate two roads" (false — 4 remained: storyboard §6(b), prompt engineer §2 and §3, film director §4). Do NOT rewrite history: keep the original cells and add a section "W5b (2026-09-15, after the CEO's re-measurement)" stating exactly what was overstated, what was found, what was fixed, with the commands and decisive lines. `.planning/STATE.md` live block and the B43 row's "where this row stands" get one line each (records parity — `dxb-close-row`).
- **A9.** Every touched seat: field 31 gets a dated entry `2026-09-15 (W5b …) opus-5 in person`; field 33 = 2026-09-15. §12 untouched. The dossier never enters the delivered body.

**Gates for Part A** (print command → decisive line for each):
- parenthesis balance over all 16 seats → 0 unbalanced lines
- §12 md5 identical in 16/16 (before and after) · `# PERSONA — ` header 16/16
- `grep -ni "voice-over\|voice over\|narration\|scratch\|AI voice"` over the 16 seat bodies → every hit is a prohibition; print the hits
- grep for two-road presenter clauses (real photograph … written sheet with no engine-born / casting-frames road) → 0 in bodies; print what you grepped
- the B43 road check you rebuilt on 2026-09-14 → 16/16
- `DXB_PERSONA_AUTHOR=opus-5 scripts/sync-personas-to-db.sh <each changed seat>` · then `scripts/sync-personas-to-db.sh --verify` → match 213 · diff 0 · VERIFY PASS
- `fn_persona_gate` on every new version → passed (list slug, version, author, quality_gate; the new ones passed, the older ones superseded)
- `bash scripts/i18n-purity-check.sh` → PASS · `npm run verify:ledger` → OK · gitleaks on the commit → no leaks · `git status` clean after commit
- Blast radius named in the report: the 16 seats stay bound to their fable-5 versions (SELECT and print); the activation gate untouched (`pg_get_functiondef` unchanged); `worker-shim.ts` reads the FILE at runtime, so state which files' runtime text changed.

Commit message: `personas(W5b) …` — names the six residues, the record correction, and that two W5 counts were overstated. Co-Authored-By line as your session's reminder says. This work-order file is committed with Part A as the record of the order.

---

## PART B — W6: the writing (commit 2, only after Part A is committed and verified)

The CEO read the seats and asked whether they are well written. Verdict given to him: the craft is real, the prose is patch-on-patch.
Measured: the 120-word "Everything of a piece … made here on this computer …" paragraph is pasted verbatim in 12/16 files (acceptable — law text, keep ONE copy per file); inside `media-creative-director.md` the clause "the road comes from the brief — the CEO or the client says 'with a prompt' … 'choose the best'" appears 4× and "the general default is text-to-video, and image-to-video is not forbidden" 4× (3× inside ONE sentence at §2 line 63); "(MiniMax H3 on this card)" 7× in the storyboard body, 4× each in creative director, product-brand and prompt engineer; the longest sentence in creative director §3 ≈ 500 words with parentheses nested three deep; `media-character-identity.md` carries the cast-law sentence twice (§3 and §4).

**Rules for Part B** — the part where a mistake is easiest:
- **B1. DOCTRINE DOES NOT CHANGE.** Before editing a file, write (in the evidence file) the list of concepts that file must still carry after the edit: three roads · no face drawn outside the engine · road from the brief, seat chooses only on "choose the best" · T2V general default, I2V not forbidden (22:35 governs) · local engine first, Flux not in a local take, stills only for an external engine · one take when it suffices, joins on the engine's own frames, no pre-split · measured hold · engine's own voice only · LAW D order · 4-step keeper · 1080p ceiling · cast law + client's-responsibility addition · skin-mark board rule (not a law) · no engine lettering · no money out. After the edit, grep each concept in that file and print the hit. A concept with 0 hits = the edit is wrong; revert it.
- **B2.** Within-file de-duplication ONLY: a ruling is stated once, fully, at the place that owns it; every later mention becomes a short pointer in the seat's own voice ("on the road the brief named", "as §3 says"). Do not remove the shared cross-file paragraph — one copy per file stays.
- **B3.** Flatten nested parentheses into sentences. No sentence over ~60 words in new text. Keep every date and every CEO quotation exactly as written.
- **B4.** "(MiniMax H3 on this card)" is written in full once per section, then "the local engine".
- **B5.** Do not touch: §12 · field 31 histories (append only) · the dossier's factual fields · any file's meaning · the six non-media files.
- **B6.** Read every edited sentence back in context before the gate (your own 2026-09-15 lesson: four defects of your own were found that way).

**Gates for Part B:** the full Part A gate list again, plus a per-file table in the evidence file — words before / after, duplicate clauses before / after — and the concept grep table (B1). Sync all changed seats (author opus-5), `--verify` PASS, `fn_persona_gate` passed, road check 16/16. Commit: `personas(W6) …`.

---

## REPORT TO THE CEO (Turkish, `dxb-ceo-report` shape)

Answer first, a picture from his world, the measured numbers in one table, what it means for him.
Mark both commits *"yazıldı ve kapıdan geçti — gözünüzü bekliyor (KANUN B)"*; binding still waits on B08 step (0) and his one sentence *"kapıyı U30'a hizala, sonra bağla"*. Anything a terminal cannot observe: ⚠ UNVERIFIED, listed apart. No *"ne yapmamı istersiniz"*.
