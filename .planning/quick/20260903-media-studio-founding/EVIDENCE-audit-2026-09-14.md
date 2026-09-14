# EVIDENCE — the audit of the day's work and its corrections, 2026-09-14 evening

His order on opening the session (16:1x): *"önce projenin haritasını öğren dolapları aç herşeyin nerede
olduğunu bil ama herşeyi okuma SADECE gerekli dosyaları oku. ve en son yapılanları önce bir denetle.
çelişkiler var mı bunun için denetleyici özelliklerini kullan. 2 veya 3 ajanı bunun için
görevlendirebilirsin."* — then *"denetle herşey doğru yapılmış mı?"* — then, on the report:
*"hatalar varsa düzelt dedim … sorunların bulunması ve düzeltilmesi gerekli diorm ben de. tek tek sırayla
devam etmeliyiz. ayrıca jarvis işini ben yaptırdım. okledim tamam dedim."*
Ledger: `audit-of-the-days-work-corrected-2026-09-14` · `jarvis-silent-listening-voice-04-okayed-2026-09-14`.

Author: Fable 5.1 in person (session model `claude-fable-5-1[1m]`, `~/.claude/settings.json`; no subagent
model override, so the three auditors ran on Fable 5.1 — his check *"ajanlar kimler … fable 5 değil mi?"*).
The auditors were read-only `general-purpose` subagents; every line they cited was re-read by the author
before it was reported or changed. Nothing was tried in production; no film was made.

## 0. The battery before anything was changed (16:16)

```
pnpm typecheck                                   → tsc --build · exit=0
pnpm verify:ledger                               → ledger truth OK … 118 CEO approval claims each backed
pnpm exec vitest run tests/b43                   → Test Files 6 passed · Tests 73 passed (73)
bash scripts/i18n-purity-check.sh                → I18N PURITY: PASS
```
Green — and the audit below shows what green did not see.

## 1. What the three auditors and the author's re-reading found

**Auditor ① — the 16 seat files against the ledger (all 16 read whole):** 49 contradictions in 14 files.
The three high groups, each re-read by the author at the cited lines:
- `media-sound-music.md:60,67,68,72,77,110,115,125` — the engine's voice "muted whole and replaced with the
  studio's voice source … the presenter's own recorded voice or a voice the studio holds with recorded
  consent … a replacement voice is generated once per accepted line … a cloned or synthesised voice … through
  the CEO gate". Ruling `tts-cancelled-engine-voice-only-2026-09-04`: *"şu yapay sesi iptal et tüm video
  üretimlerinde … MiniMax H3'ün kendi sesi olsun."* The file's mtime was 2026-09-03 — it had never been
  read against the ruling; the ruling's `where` named showcase cards only.
- `media-creative-director.md:68` — "(7) enlargement, colour grade and film grain … (9) … the piece lands on
  the showcase for the CEO's accept or reject"; `media-vfx-post.md:57` "every master … leaves this seat as
  delivery-size footage"; `:67` "(3) enlargement to delivery size"; `:24` "enlarge → correct → grade".
  LAW D (`law-d-draft-first-upscale-last-2026-09-03`) and `engine-standard-4-steps-no-upscale-unless-asked-2026-09-04`.
  The same two files carried the law in another sentence (`CD:81`, `VFX:63`) — internal contradiction.
- `media-character-identity.md:57` "every human on the studio's screen is a real, rights-cleared person";
  `:79` "the real-photograph law on client-facing humans"; `:95` "who was never a real, cleared person — the
  seat's critical failure"; `media-creative-director.md:127` and `media-film-director.md:127` "a client-facing
  human/presenter without a real-photograph reference is blocked". Against `road-comes-from-the-brief-t2v-default-2026-09-04`
  (a written human on text-to-video accepted), `ahmet-cast-member-born-in-engine-2026-09-04`,
  `flux-avatars-retired-and-complaint-numbering-2026-09-13` (no new face drawn outside the engine).
  `Identity:60`, `CD:62`, `FD:62` in the same files named the written road — internal contradiction.
Medium (re-read by the author, all confirmed): still-first residue in Storyboard (`:19,28,55,57,63,65,79`) and
the Cinematographer (`:69,74,93`); the Editor's short-shot / "long-take temptation" (`:22,66,90`); the
Advertising Director's "strong road" (`:56,60,67`); the Prompt seat's "its approved still directs the prompt"
(`:76`); the Creative Director's founding hold figures "a few seconds" (`:62`) against the Film Director's
measured 15 s; the Identity seat's "talking face sent through first-and-last-frame conditioning" against the
accepted join; the Failure seat's "a drawn human is a missing real photograph" (`:61,72`); the Screenwriter's
"lines to record / replaced entirely" (`:54,70,85,100`); the Engineer's "route table of station, rented card
and API" (`:19`). Clean: `media-continuity.md`, `media-product-brand-consistency.md`.

**Auditor ② — the records against each other and the commits:** "all 16 seat files" in STATE, the board, the
ledger and commit `afb7b553` against 13 files changed (the other three carried no place word); "44 + 30
sentences replaced" without a command or output; "20/32 → 32/32" attributed to `tests/b43/road-consistency.test.ts`
while that file generated 28 tests and the 32 came from a scratch script outside the repo; STATE.md carried
five approval claims and 0 `CEO-OK` markers; `STATE.md:29` still said "Flux frames are closed on the station's
own road only" (the wording the afternoon ruling declared wrong); row B43 kept "(3) if not, API" beside the
corrected lane list and filed the QA judge's receipt under "accepted" without an id; the ledger's
`external-hands-ready-leg-2026-09-14` said "Astra's rule still waits for his word" eight minutes before
`astra-rule-accepted-…`; the 00:45 handover prompt re-asked a settled question; VOICE-04 in
`.planning/REQUIREMENTS.md` (10:55) was uncommitted and in no record. And the structural one:
`scripts/governance/ledger-truth.mjs:96,500` matched `CEO-OK` without the `g` flag — one marker per line
checked, row B43 carrying 32 (the author counted: 32 on line 146, 1 on line 95, 0 in STATE.md).

**Auditor ③ — the check and the binding:** the test compiled each body through `compilePersonaPrompt`
(`packages/hr`), which no runtime path calls (`grep -rn compilePersonaPrompt packages apps scripts tests` →
the definition, its own test, `persona.ts`'s comment "not compiled … on purpose", and the road test); the
executor delivers the raw body whole (`packages/voice/src/persona.ts:44 readFile`, `worker-shim.ts:294
seatStandingPrompt → composeSeatPrompt → standingPrompt → personaBlock`); the compiler drops the preamble
and any `## 14+`, so a contradiction placed there reached the agent and passed the test (mutations M8/M9);
7 of 9 mutations restating the old doctrine in other words passed 28/28. The binding was true: 16/16 seats'
`agents.persona_id` = the latest passed version, `md5(body_md)` = the file body, 44 submit/gate/bind rows on
2026-09-14 before this session. The daemon reads the persona file at every run (no restart needed); no seat
had run since 2026-09-05 02:55, so pickup is by code only.

## 2. The corrections, one topic at a time, each gated · bound · verified · tested · committed

The procedure for every persona: `DXB_PERSONA_AUTHOR=fable-5 bash scripts/sync-personas-to-db.sh <file>` →
`fn_persona_gate(<new id>,'passed',<the author's verdict>)` → `UPDATE agents SET persona_id=<new id>` +
`audit_log persona.bound` in one transaction → `--verify` → the bound row's `md5(body_md)` against the file's.

| # | Topic | Files | DB versions bound (file md5 = DB md5) | Tests | Commit |
|---|---|---|---|---|---|
| ① | the voice ruling of 2026-09-04 | media-sound-music | v2 (78cc57f0) | r31 + road 45/45 | `0d9e4a9f` |
| ② | LAW D production order | creative-director, vfx-post, cinematographer | v14 (1573f78f) · v3 (7ec088a7) · v5 (1fed3d37) | 32/32 | `dc3cc538` |
| ③ | the three cast roads | character-identity, creative-director, film-director, failure-analysis | v11 (b03092a2) · v15 (1344eeed) · v12 (2e2318dd) · v12 (0bfefd04) | 32/32 | `8b36444d` |
| ④ | the residue, ten seats | storyboard, cinematographer, editing-coach, prompt-engineer, creative-director, film-director, screenwriter, ai-video-engineer, delivery-qc, vfx-post | v11 · v6 · v8 · v8 · v16 · v13 · v5 · v6 · v3 · v4 (all md5-equal) | road 30/32 — the old test's `/long take/` fired on the new Editor sentence "a long take that held is not a defect"; fixed by ⑤ | `6be99d39` |
| ⑤ | the road check | tests/b43/road-consistency.test.ts | — | 16/16 on the roster; on a mutated copy 3 files failed, 8/8 injected sentences named | `ea0ebebf` |
| ⑥ | the approval gate | scripts/governance/ledger-truth.mjs, .planning/STATE-ARCHIVE.md:2008 | — | `verify:ledger` 118 → 193 claims, OK after the archive marker was corrected | `ea0ebebf` |
| ⑦ | the records | STATE.md, STATE-ARCHIVE.md, 00-BOARD-OPEN-WORK.md row 146, ceo-approvals.json, this file, NEXT-SESSION-PROMPT-2026-09-14.md (superseded note, repo + Desktop copy) | — | battery below | the records commit |
| ⑧ | VOICE-04 on his word | .planning/REQUIREMENTS.md | — | — | the records commit |

What each persona correction says now, in one line:
- ① Sound: the engine's own generated voice is the only voice; a take that fails the line sheet's word-error
  line is shot again with the line in the prompt — no TTS, no recorded, cloned or synthesised replacement;
  the seat holds no voice tool.
- ② The line: (7) the finish at native draft resolution → (8) sound → (9) the cut and the draft to his eye →
  (10) enlargement only on an accepted draft and only when he asks, re-run from the archived master with the
  recorded recipe, grain after the enlargement. VFX / Post's hook blocks an enlargement of an unaccepted draft.
- ③ A client-facing human enters as real photographs of a real person, as the frames of an engine-born
  presenter's own casting take (AHMET, JAMES), or as a written sheet on the text-to-video road — the brief
  names the road; no face is drawn outside the engine; a talking face is joined on the shooting engine's
  own frames.
- ④ A panel is written for a local-engine take and a still only for an external engine's take; one take
  when it suffices; the road is the brief's, never the seat's; the hold is the measured one.

The mutation proof of ⑤ (a copied roster under `DXB_ROAD_TEST_ROOT`, nine sentences injected into three
seats — §3 lines, the preamble before §1, a `## 14.` after §13):
```
← "Always pre-split the film into 4–6 shots and draw the first frame in Flux before any take, also on the local engine."
← "Prefer I2V from a storyboard frame as the default road."
← "On an external engine the take may not start from a drawn frame."
← "Every film is divided into four to six locked shots before shooting."
← "The film is pre-cut into six short shots and the first frame is drawn in Flux"            (preamble)
← "Every master is enlarged to delivery size before the CEO sees it."                       (§14)
← "Enlargement to delivery size happens before the CEO's eye on every master."               (vfx-post)
← "A line the engine got wrong is replaced with a recorded voice of the presenter."          (sound-music)
Tests  3 failed | 13 passed (16)
```
What the test is, honestly: a wording regression check on the prompt the executor delivers — it cannot
judge meaning. Meaning was judged by reading, as this audit did, and that is what guards the seats.

The gate's first full run: `FAIL — .planning/STATE-ARCHIVE.md:2008 — CEO-OK marker names approval
"both-roads-in-the-seats-2026-09-04", which is not registered` — written on 2026-09-04 (`cdb696af`) with
an id the ruling never had; corrected to `road-comes-from-the-brief-t2v-default-2026-09-04`, the same
day's registered ruling with the same content. Then: `ledger truth OK … 193 CEO approval claims each backed`.

## 3. The morning's voice work (his, okayed by him)

Measured: `.planning/REQUIREMENTS.md` mtime 10:55:46, uncommitted, the only file naming VOICE-04;
`var/jarvis.log` 1,033,831 bytes / 16,708 lines, last line 08:15Z "SIGTERM — stopping", git-ignored
(`.gitignore:66`); `systemctl --user is-enabled dxb-jarvis.service` → disabled, inactive;
`~/.local/state/wireplumber/backup-2026-09-14` present; `packages/voice/src/jarvis-daemon.ts` unchanged
since 2026-07-28; claude-mem observations #22005–#22017 (10:37–11:07) carry the session's own record.
The work itself was never in question — only that no repo record carried it. Registered on his word.

## 4. The machine, measured 2026-09-14 17:0x

`systemctl --user list-units 'dxb-*' --all` → 8 running (board, comfyui, company-read, freeze-guard,
gpu-guard, operator, scheduler, vitrin), 2 inactive timer targets (backup, screenshot-cleanup), 2 timers
waiting; `dxb-jarvis` disabled. `dxb-scheduler` up since 09:29:43, `NRestarts=0`; it reads the persona
file per run — no restart needed for the seats to see the corrected text. Graph (`.planning/graphs`) built
2026-08-26, 89+ commits behind; the commit hook launches a background rebuild after each commit.

## 5. Not done, by design

- No film, no production run — *instruction corrected, not yet tried in production*.
- `var/jarvis.log` not deleted (waits on his word; listed with its size).
- Hamza (record v2, file v6) untouched — B08 step 0, parked by his word.
- The meaning-level check of a persona remains reading; no LLM judge was built (it would be a new design
  decision — his approval first).
