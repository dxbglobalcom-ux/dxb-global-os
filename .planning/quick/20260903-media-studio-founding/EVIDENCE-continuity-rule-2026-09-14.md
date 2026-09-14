# EVIDENCE — B43 leg (3), the continuity rule written into the two directors' personas (2026-09-14)

His word (2026-09-14, this session), after the rule had been put to him engine-agnostic: *"lakin işte flux kareleri sadece bu bilgisayardaki localdeki model için kapalı. diğer runpod veya api veya mcp için değil.çünkü burada yani localde üretim yaptığımızda herşeyi baştan sonra minimax H3 yapıyor. ok."* Read by the author as yes-with-the-amendment and said to him in the same turn. Ledger: `astra-rule-accepted-flux-scoped-to-local-2026-09-14`.

## What changed (files, by the session author Claude Fable 5.1, inline)
- `personas/media-studio/media-creative-director.md` §3: one new line "Continuity between takes — the CEO's rule of 2026-09-14 …"; the engine-floor line now names the external hands (a membership over MCP or a pay-as-you-go engine API, chosen per job — his 2026-09-14 word); dossier row 31 dated.
- `personas/media-studio/media-film-director.md` §3: the "Long form: …" line REPLACED by the continuity rule (LAW A — the old line let a scene be pre-chained; the new rule takes one take first); dossier row 31 dated.
- Board B43: leg (3) header → PARKED with the accepted rule; amendment (c) and leg (3)'s Flux sentence scoped to the station's own engine; STATE.md leg (3) + waits-on-him list; ledger entry.
- No code. `grep -c Flux` on both persona files before the change: 0 and 0 (the closure had never been written into them; it now is, scoped).

## Delivery chain — commands and decisive output (persona door)
```
DXB_PERSONA_AUTHOR=fable-5 bash scripts/sync-personas-to-db.sh <the two files>
  SUBMIT media-creative-director — persona id: fd5ccb88-00e1-43f1-b411-0e6da512d81b · author: fable-5
  SUBMIT media-film-director    — persona id: 816fe584-cf92-4ec2-9ea2-bb5fc8d829b8 · author: fable-5
  submit: 2 · skip(⏳): 0 · fail: 0
SELECT fn_persona_gate(<id>,'passed','…Fable 5.1 in person; deep verdict signed by the author…')
  media-creative-director: v10 → passed
  media-film-director:     v8  → passed
BEGIN; UPDATE agents SET persona_id=<latest passed> … ; INSERT INTO audit_log('fable-5','system','persona.bound', {slug, department, persona_id, from_version, to_version, why}) …; COMMIT
  INSERT 0 2 · COMMIT
  media-creative-director | bound v10 | passed | fable-5
  media-film-director     | bound v8  | passed | fable-5
bash scripts/sync-personas-to-db.sh --verify <the two files>
  match: 2 · diff: 0 · skip(⏳): 0 · fail: 0 · VERIFY: PASS
```

## Battery
```
pnpm exec vitest run tests/r31/persona-delivery.test.ts   → Test Files 1 passed · Tests 4 passed (4)
pnpm verify:ledger  → ledger truth OK: … 118 CEO approval claims each backed by a registered approval
bash scripts/i18n-purity-check.sh → I18N PURITY: PASS
```

## Blast radius (his order of 2026-08-17 — name what stands on the thing changed, then re-measure it)
- The runtime reads a seat's persona from the FILE (`packages/orchestrator/src/worker-shim.ts` `loadPersonaBody(repoRoot, employee.persona_path)`), so the live seats see the new lines at their next run; `agents.persona_id` is the HR record and is now at the passed version (bound v10 / v8). The delivery test (4/4) proves the whole body from `# PERSONA — ` crosses, dossier excluded.
- Nothing in code reads the replaced "Long form" sentence; `tests/b43` + `tests/b39` re-run after the change (result in the session's commit message).
- The four Flux-drawn presenters stay out of use (2026-09-13); his scope did not reopen them and this change does not touch the catalogue or the vitrin.

## Not done, on purpose
- No exam of the rule: it runs on the first job that needs more than one take (the station's limit is one take ≤ 15.1 s; every accepted film is one take).
- No route beyond the station exists yet (leg 6).

---

# SECOND PASS THE SAME DAY — the contradicting sentences removed, on his order

His catch and order (2026-09-14): *"Yeni kuralı yazmışsın ama eski zıt talimatları bırakmışsın … İki yönetmenin ve bu yolu uygulayan çalışanların talimatlarını kontrol et; çelişen eski hükümleri kaldır … Bu düzeltmeyi yapmanı onaylıyorum. İlgili çalışanlara gerçekten ulaştığını ve çevresindeki işleyişi bozmadığını doğrula. Yalnız yeni cümleyi ekleyip eski emri bırakma."* Ledger: `continuity-rule-contradictions-removed-2026-09-14`.

## The sweep — 16 seat files, every hit read in place
Pattern: fixed-count cuts · short-shot mandates · long-take bans · drawn first/last frames handed to the motion engine · "chain of short shots". Files with contradictions: 12 (10 studio seats + the Prompt / Model Specialist `personas/design/design-image-prompt-engineer.md` + the Editor `personas/marketing/marketing-short-video-editing-coach.md`). None in: advertising-director, delivery-qc, vfx-post, sound-music.

Replaced (44 sentences, one all-or-nothing script, each old string asserted unique in its file):
- Creative Director: "(9) the Editor cuts six to ten perfect short shots into the piece"; "(5) … short shots"; "(4) … the first and last frames as stills" for the engine; "a product enters as an approved still handed as the first frame; a shot that carries identity is kept short"; "one long generation is cheaper than several short ones"; "a shot list built on one long take"; the registry cure "product shots are handed an approved first and last frame".
- Film Director: "six to ten perfect short shots cut into thirty seconds beat one thirty-second take every time"; "a long take is where identity dies"; "a longer generation is cheaper"; "frames approved as stills"; product direction "approved still … first frame … short shots … long take"; "Declines: 'one take, thirty seconds'"; "the hold table beats the script's wish for a long take"; "identity-carrying shots short".
- Storyboard / Previz: "the first and last frames handed to the motion lane" (dossier, methodology, §1, §3 ×3, §4, §9); "a panel rides as the first frame of a short shot".
- Prompt / Model Specialist: "hero frames, first and last frames" (4); "an approved still handed as the first frame".
- Editor: "six to ten short generated shots" (2); "the cut is built from short shots, not long takes"; "lived in one long take".
- AI Video Engineer: "first-and-last-frame conditioning for products and exact camera" → joins with the engine's own frames; a native multi-shot run measured before a split.
- Product & Brand: "Product shots travel through first-and-last-frame conditioning: an approved still … as the first frame" and 7 more (methodology, raw material, pattern, escalations, declines, registry cure, relations).
- Character / Identity: "first-and-last-frame conditioning is for products and exact camera".
- Continuity: "Anchors for chains: in a long form or a chained sequence …" → only when the job needs more than one take; the engine's own frame; a native multi-shot run measured first.
- Screenwriter: "eight to twelve scenes, each scene a chain of short shots".
- Failure Analysis: the cure "short identity shots and approved first and last frames".
- Cinematographer: "the first and last frames are lit and framed here before they are drawn … the frame the engine is handed".
Kept on purpose: the measured HOLD TABLE (a limit on take length per shot size, re-measured per engine — a limit, not a split); the continuity seat's "check every take at first and last frames" (a measurement, not a hand-off of drawn frames); the identity seat's "a talking face through first-and-last-frame conditioning is a defect" (a mode choice for faces).

## Delivery (persona door)
```
DXB_PERSONA_AUTHOR=fable-5 bash scripts/sync-personas-to-db.sh <12 files>   → submit: 12 · fail: 0
fn_persona_gate(<each new row>,'passed', …)                                   → 12 × passed
BEGIN; UPDATE agents SET persona_id=<latest passed>; INSERT audit_log persona.bound ×12; COMMIT   → INSERT 0 12 · bound = latest passed: 12
bash scripts/sync-personas-to-db.sh --verify <12 files>                      → match: 12 · diff: 0 · VERIFY: PASS
```

## "Did it really reach the employees?" — the runtime's own loader and compiler, not a grep of the file
`node reach-check.mjs` imports `packages/voice/dist/persona.js` `loadPersonaBody` (the function `worker-shim.ts:294` calls at run time) and `packages/hr/dist/compiler.js` `compilePersonaPrompt`, renders each seat's prompt in full and compact mode, and tests for the rule's own words and for every old phrase:
- FIRST render: **12/24** — six seats' prompts carried none of the four sentences in their own words (product-brand, character-identity, failure-analysis, cinematographer had only the scoped-Flux clause; the Prompt / Model Specialist's new sentence still read "approved still handed as the first frame"; the Editor kept "lived in one long take"). The very failure the CEO named — adding without removing — caught by measurement before the report.
- Fix: the road's rule written into those six in the seat's own terms (one line each under §3), the two phrasings re-worded; re-submitted, gated (prompt-engineer v5, editing-coach v5, product-brand v9, character-identity v9, failure-analysis v9, cinematographer v3), bound (INSERT 0 6), verified 12/12.
- SECOND render: **24/24** prompt renders carry the rule and none of the old sentences; no dossier leak.
- Old-phrase sweep of all 16 seat files: **0** left.

## Surrounding operation, re-measured after the change
- `tests/r31/persona-delivery` + `tests/b43` + `tests/b39`: 9 files, **71/71** passed.
- The seats' status untouched: department media-studio 14 × dormant (as before); the two assigned seats dormant / employment active (as before).
- No code changed; no engine run; no film made.

**Instruction corrected; not yet tried in production.** The first exam is the first job that needs more than one take. This is not an approval to produce a film or to start a paid service.

---

# THIRD PASS THE SAME DAY — his audit: "teslim doğrulandı, fakat çelişki temizliği tamamlanmamış"

His words (2026-09-14, relayed from his auditor): three contradictions still stood, and the check was the fault — it searched one phrase and a list of old words instead of testing the four conditions and meaning. Ledger: `continuity-rule-third-pass-whole-sequences-2026-09-14`.

## What was read
The WHOLE persona body (§1–§11) of every one of the 16 seat files, sentence by sentence, against his four conditions — not a grep. Per seat, the verdict of that reading and what was changed:

| Seat | Read | Found and replaced (this pass) |
|---|---|---|
| Storyboard / Previz | §1–§11 | §2 "the panel is the literal first frame the motion engine receives" (his point 1) → the panel is the frame the prompt is written to; §1 "the engine can only move the frame it is handed" and "what the engine receives is already the film"; §4 "is what the engine receives"; §5 "so nothing is re-framed by the engine"; + the road's rule in the seat's terms |
| Prompt / Model Specialist | §1–§11 | §3 "the shot kept short" and "approved frames handed to the engineer for motion" (his point 2); "the product from its approved still"; §2 the 2026-09-03 "strong default" clause, out of date since his 2026-09-04 22:35 word → the road comes from the brief; §4 "conditioning method per shot" only where the brief says "choose the best"; §7 outputs |
| Film Director | §1–§11 | §2 "text-to-video … the wrong one for faces and products" (his point 3); §1 "holds a face for a few seconds … before it is cut" and "a still made perfect … nobody asks one model to get thirty seconds right"; §2 "a close-up holds identity for about three seconds … a scene longer than the hold time is several shots, never one" — superseded by the measured one-take 15 s films (EYW-002C, 003, 005); §4 "no product shot without an approved still" |
| Creative Director | §1–§11 | §1 "a six-second shot cut into a thirty-second film beats one thirty-second generation" |
| AI Video Engineer | §1–§11 | §1 "frames from Storyboard / Previz", "hosted APIs"; §3 run pattern "frames"; route table "hosted API" → external hand; §7, §9; + the road's rule in the seat's terms |
| Continuity | §1–§11 | §3 "anchor chains" → only where the job needed more than one take; + the road's rule in the seat's terms |
| Product & Brand | §1–§11 | §1 "handed to it as a real photograph in a perfect still" |
| Advertising Director | §1–§11 | §2 "approved still" in the strong road; §3 "close-ups planned as separate shots, never asked of one long generation" |
| Screenwriter | §1–§11 | §2 "a shot holds a face for a few seconds"; + the road's rule in the seat's terms |
| Failure Analysis | §1–§11 | §2 "the cause is the long single take"; "a shot-length and a first/last-frame decision" |
| Editor | §1–§11 | + the road's rule in the seat's terms (R2 and R4 were absent) |
| Character / Identity · Cinematographer · Delivery / QC · VFX / Post · Sound / Music | §1–§11 | consistent — nothing changed this pass (the identity seat's "a talking face through first-and-last-frame conditioning is a defect" is a mode choice for faces; the hold table everywhere is a measured length limit, not a split) |

Total this pass: 30 sentences replaced + 5 rule lines in the seat's own terms + 1 re-wording (the Film Director's negation "or that it is the wrong road for a face" → "or unfit for a face", so no reader mistakes it).

## The check, rebuilt (his order: not word absence — the whole sequence against the method)
`tests/b43/road-consistency.test.ts` (kept in the studio battery): renders each seat's REAL prompt with `loadPersonaBody` (`@dxb/voice`, the runtime's call) and `compilePersonaPrompt` (`packages/hr`), full and compact; for the 12 applying seats every one of the four conditions must be present by CONCEPT (several wordings each, all required), for all 16 seats a broad contradiction list must be absent, and the dossier must not leak.
```
node road-check.mjs (same logic)  BEFORE the fixes: 20/32 — film-director (a negated "wrong road for a face" wording), storyboard (conditions 1, 2 absent in its own words), editor (2, 4), engineer (1, 4), continuity (4), screenwriter (1–4)
                                  AFTER:  32/32
pnpm exec vitest run tests/b43/road-consistency.test.ts → (result in the commit message)
```

## Delivery and surroundings (measured after the change)
```
DXB_PERSONA_AUTHOR=fable-5 bash scripts/sync-personas-to-db.sh <11 changed files>   → submit: 11 · fail: 0
fn_persona_gate ×11 → passed (creative-director v12, film-director v10, storyboard v9, prompt-engineer v6, editing-coach v6, ai-video-engineer v4, product-brand v10, advertising-director v8, continuity v3, screenwriter v3, failure-analysis v10)
BIND: INSERT 0 11 · COMMIT · bound = latest passed: 11
--verify on all 16 seat files → match: 16 · diff: 0 · VERIFY: PASS
LIVE_BOUND_MATCH (16 seats, bound row = latest passed) → 16
old-phrase sweep (13 patterns) over 16 files → 0
tests r31 + b43 + b39 → 71/71 (before the new test was added)
seats' status: department media-studio 14 × dormant, unchanged
```
**Instruction corrected; not yet tried in production.** No film was produced; no paid service was started. The first exam is the first job that needs more than one take.

---

# FOURTH PASS THE SAME AFTERNOON — his three sentences, his (A), and the record's words corrected

His sentences: *"Yerelde: MiniMax her şeyi baştan sona yapar; Flux kullanılmaz. Dışarıda: Üretimde Flux'tan faydalanılabilir. T2V ve I2V: İkisi de sistemde bulunur."* His correction of the record's words: *"bilgisayar dışında ne ya, belki dışarıda api ile oluşturacağımız vitrinin herşeyini biz burada üreteceğiz"* — everything of a piece is made HERE; only the engine that shoots the take differs. His answer to the author's one question: **(A)** — *"sadece minimax h3 iş yaptığı zaman flux'a ihtiyaç yok. bunun dışında dışarıda yapılacak işler için kullanılabilir bir kısıtlama yok. ama içeride kesinlikle öncelik yerel motor minimax begining to end."* Ledger: `flux-local-engine-only-everything-made-here-2026-09-14`.

## Measured before the change ("bu yapıldı mı?")
- (1) "no drawn frame to the local engine": 12 seat files carried it · (3) both roads: 8 seats say the road comes from the brief / both roads live; in the hands `media_submit shoot` takes `prompt` and optional `first_frame` / `last_frame` (`packages/dxb-mcp/src/groups/media.ts:77-78`) — text and picture roads both exist in code · (2) external Flux: 13 files said a still may ride for an external take.
- The gap: the personas still described the still lane (Flux) drawing panels, hero frames and product stills for LOCAL takes (storyboard, prompt specialist, product, cinematographer, both directors, advertising director) — and the record said "on the station's own road / off the station", which he read as "outside the computer" and rightly rejected.

## What changed
- 122 place phrasings → engine phrasings in all 16 seat files: "on the station's own road" / "on this station's own route" → "for a local-engine take (MiniMax H3 on this card)"; "off the station" → "for an external engine's take"; "the station's (own) engine" → "the local engine (MiniMax H3)". "Measured on this station" (this machine as the place of measurement) untouched by design.
- The local still lane closed for local takes in the six seats that described it (storyboard §1/§2/§3/§7/§9 and dossier; prompt specialist dossier/§1/§3/§9; product §3 twice + cure; cinematographer §3 twice + §9; creative director step (4), engine floor, §9; film director §3; advertising director §3): for a local-engine take the panels are written, the hero frame he judges is the engine's own frame, no still is produced; for an external engine's take the still lane draws here and a still may ride as the first frame.
- His canonical sentence appended to the rule line of all 12 applying seats: everything made here on this computer on either route; only the engine that shoots differs; the local engine first, beginning to end; Flux plays no part in a local take; an external engine may be handed a Flux still or first frame made here, without restriction beyond the brief's road; T2V and I2V both open from the start on either route.
- `tests/b43/road-consistency.test.ts`: condition 4 rewritten engine-wise (five wordings, all required in the 12 applying seats: "Flux plays no part / is not used" · "local-engine take" · "external engine's take" · "made here on this computer" · "both roads open" · "the local engine is the first choice"); the place words ("off the station", "on the station's own road", "outside the computer") and the local-still-lane sentences added to the contradiction list. Result **28/28**.
- No code changed in the hands. The `still` hand (a FLUX frame on this card) stays — for external-engine takes and for his explicit orders.

## Delivery and surroundings
```
DXB_PERSONA_AUTHOR=fable-5 bash scripts/sync-personas-to-db.sh <13 changed files>  → submit: 13 · fail: 0
fn_persona_gate ×13 → passed (creative-director v13, film-director v11, storyboard v10, prompt-engineer v7, editing-coach v7, engineer v5, product v11, identity v10, cinematographer v4, continuity v4, screenwriter v4, failure-analysis v11, advertising v9)
BIND: INSERT 0 13 · COMMIT
--verify on all 16 seat files → match: 16 · diff: 0 · VERIFY: PASS
LIVE_BOUND_MATCH (16 seats, bound row = latest passed) → 16
tests r31 + b43 (incl. road-consistency 28) + b39 → 99/99 · typecheck clean
seats' status: department media-studio 14 × dormant, unchanged
```
**Instruction corrected; not yet tried in production.** No film was produced; no paid service was started.
