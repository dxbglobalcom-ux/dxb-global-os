Open the door `Skill("dxb-team3")` before anything else: you carry this job on as its lead, the orchestrator, not as a fresh session. Effort: managing at high (open `Skill("dxb-effort-high")` first on a managing turn).

# Handover — the motion-graphics skill (2026-11-12, from session 4957fd57)

## The job's place in the whole
The CEO sent a tutorial video (https://www.youtube.com/watch?v=cDb-wPq0Iyk) and ordered: learn it, then build the holding's own motion-graphics skill — for the Media Studio (B43), the Web Studio (B84), the agency and the construction's sessions — using what the holding already has, its own studios first, outside sources when needed; better than the video where it can be; ending in a film he can look at. He handed the management over ("Yönetim sende. Devam edin."). The skill ChatGPT wrote the day before was deleted on his word.

## His words of this job (verbatim, from this conversation; the long first message is whole in `.planning/quick/20261112-motion-graphics/blind/brief.md`)
- "Gerekirse o mevcut hani şeyi de silebilirsin yani. […] Sen kendinkini, siz kendinkini yapın. Onu direkt silin ya."
- "Bir de baksınlar güncel sürümleri varsa bu bizdeki şeylerin, onları da güncellesin yani. Elimizde olanlar falan filan."
- "sudo istenirse sen yazacağım yeri aç sadece ben yazarım."
- "Limite takılmıştık. Devam edelim lütfen. […] Ben Max Ultra'da değilim. 5X kotasındayım. […] En fazla 3 tane ajan çalıştıralım. Yani sen kendi işçi alanında ucuzlardan artı 2 tane, pahalılardan en fazla 3 tane, ucuzlardan en fazla 1 veya 2 tane çalıştıralım. Çünkü kota dolmasın, iş bitsin. Bak iş kaldı. Bunun stratejisini sen yap. […] Yönetim sende. Devam edin."  — SESSION-ONLY order (the agent cap and the quota strategy): at most 3 agents at once; I ran at most 2 expensive writers and did light verification myself.
- "Çünkü Fable'lar çalışıyordu. Çok güzel. Onları çalıştırabilirsin."

## Phases — status and commit
| Phase | Status |
|---|---|
| Watch the video (dxb-watch-links, one Opus 5.5 medium reader) | DONE — `.planning/research/watch-links/2026-11-12-motion/method.md` (committed in 6c9f8825) |
| Inventory, HyperFrames bench, placement, versions (helpers) | DONE — facts in `blind/brief.md` |
| Updates he ordered | DONE: HyperFrames 0.9.20→0.9.38, Blender 5.2.1→5.2.4 (old folder kept), yt-dlp, VoiceStudio clone pulled. NOT done, waiting on his word (I asked, he has not answered): ComfyUI (483 behind), OpenMontage (312), Remotion, ffmpeg, Voicebox, Chrome (sudo — open the password line for him only), Playwright. My recommendation to him: not now, at the studio's rank with a before/after test shot. |
| Plan + Sol's blind plan audit | DONE — `.planning/quick/20261112-motion-graphics/PLAN.md` (§7 = the audit's seven corrections; it replaces what it contradicts) |
| Build: Blender kit | DONE — e67611a9, KIT_TESTS_GREEN 19/19 |
| Build: skill (SKILL.md, references), `mg` command, templates, sfx set (89 CC0 files), test (31 passed alone) | DONE — 3bc81e6e; linked for sessions at `~/.claude/skills/dxb-motion-graphics` |
| Typecheck + battery | GREEN — but see Sol finding 6: the battery SKIPPED 29 of the 31 tests |
| Sol's code audit | DONE, NOT CLEAN — `.planning/quick/20261112-motion-graphics/SOL.md` §2. Document findings (1, 3) fixed in 6c9f8825. **CODE AND TEST FINDINGS OPEN — your first piece.** |
| Proof film 1 (WhatsApp spec, 15 s, 16:9 + 9:16) | RENDERED, sent to him (SendUserFile) — `/home/dxb/Videos/dxb-motion/film-1-whatsapp/` (out/*.mp4, board/board.png). NOT yet seen by him as far as I know; nobody has watched it as motion (Gemini read failed 4 times: 503 and time-outs — retry with `…/film-1-whatsapp/tools/motion-read.py`). |
| Board placement (the earlier job of this session) | DONE — d2f395fe |

## What is left, in order
1. **Fix Sol's open code findings** (one fresh `helper-writer` at high; give it SOL.md §2 findings 2, 4, 5, 6, 9 and the verify.mjs line of 3, the contract `.planning/quick/20261112-motion-graphics/CONTRACT.md`, and the files): `--4k` on a native-4K job; `verify <file>` must use the path given; one peak definition for `mg sound` and `sfx/INDEX.md` (regenerate the index's peak column with the command's own measurement); a missing or unknown GL renderer line fails a WebGL render, the guard proves hardware WebGL and that the picture really changes over time; cues matched jointly so one sound cannot satisfy two cues; stereo energy kept (anti-phase stereo is not silence); alpha checked on a transparent master; format names restricted and outputs kept inside the job folder; the repository root refused as a job folder; `verify.mjs:11` drop "no frame standing still"; tests split by the tool each needs so the BATTERY really runs them (HyperFrames and Blender were not found inside the battery — find out why: PATH of `scripts/construction/battery.sh`), an `align:"end"` test, the board test must measure that shots are drawn. No second Sol round (door §4); the lead verifies each finding's own case; then typecheck + battery again and READ how many of the 31 ran.
2. **The film writer's friction list** (its report is in the film folder's history; the list): `mg init` cannot state a second format and SKILL.md does not explain `job.json` (formats, spec, brand, lufs); `mg --help`; no place for asset sources (`assets/SOURCES.md` convention) and nothing on a brand pack behind a terms tick box (the writer rightly did not tick it — that is the CEO's); the board has no thumbnails per shot and one format per film; the page template's global `W, H` stay 1920×1080 in other formats (only `FILM.W/H` is true) — a template bug; no SVG-path → morphable outline helper; no motion-blur helper though craft.md asks for blur; `mg sheet` one format per call and a fixed 0.5 s window around events; no motion-read command ships although SKILL step 5 names it; sound.md's starting levels gave −41.5 LUFS (too quiet) and chosen effects must be copied by hand; `mg verify` judges every mp4 in `out/`. These are skill and command improvements — fold the code ones into piece 1 or a second writer, the text ones are the lead's.
3. **My honest read of film 1** (from a one-frame-a-second sheet, `.planning/quick/20261112-motion-graphics/film-1-sheet-16x9.jpg`): real logo, real store screens, clean type, joins designed from the logo's own outline — far above yesterday's rejected film; but flat: the phone is cut by the frame's bottom edge in 16:9, the holds are quiet, the opening second is nearly still, no depth or camera. Not yet "wow" against the tutorial's Spotify spot. Do not start a second round before HIS eye and his notes — it is a draft (Law D). Tell him plainly.
4. After his eye on film 1: **film 2** (a physical product in Blender, 8–10 s, real open-licence model + reference photos) and the **employees' road** (a `motion` kind on `media_submit` running `mg` on a job folder; built and tested on the construction engine with a compiled employee profile; a register script like `scripts/library/register-design-skills.mjs`) — PLAN §7.1.
5. **Records still owed:** a leg note in `.planning/board-rows/B43.md` and a pointer in B84.md (B43's board line is at the 1600-byte ceiling — row file only); his order in `scripts/governance/ceo-approvals.json` (ONLY where a record rests on it; read the ledger first, append textually before the final `}` — never rewrite in place); one line in `.planning/quick/20261019-degerli-is-danisma/MEASURE.md` (Sol alone audited; no Fable audit on this job); STATE's three headings at the end (replace, never append). Do not name a board row id in a commit's scope unless that row's line changes in the same commit (ruler R6).
6. **Open questions to him, each asked once already, unanswered:** delete yesterday's ChatGPT output folder `.planning/research/watch-links/2026-11-11-motion-graphics` (707 MB)? · which risky updates now? · place the other Excel-walk decisions (YE02–YE18's rest) on the board the same way? · make "the line's mission and vision at the head of every plan brief" permanent in dxb-team3? (the door already says it in §1.1 — check before asking again).

## Traps met
- An `npx hyperframes` call run from the repository root rewrote the repo's `package.json` (reverted). `mg` always runs it from the job folder; keep it so.
- The cost gate refuses `SendMessage` to a subagent idle over 5 minutes: after a quota cut, open a FRESH writer and point it at what is on disk.
- The account's 5-hour limit cut three writers at once (three Fable writers in parallel were too many for the 5× plan). Two at most.
- `cd` in a compound Bash command is blocked; a `cd` inside a script file is fine.
- The helpers' scratch (bench pages, stepper, version notes) is in `/tmp/claude-1000/-home-dxb-DxB-Global-OS/4957fd57-7f50-42ac-abf2-2089df3f710e/scratchpad/` — it may not outlive the session; nothing there is needed except as reading.
- B72 (opened today): the company's off-site backup has failed every night since 2026-09-25 — said to him once; he has not ruled on it.

## Your first message to him (Turkish, short)
State the position: film 1 is in front of him and waits for his eye; Sol's code findings are being fixed; what waits on him (his look at the film; the open questions above, once, as a short list). Then start piece 1.

If anything here is unclear, read the part you need in this session's own conversation: `~/.claude/projects/-home-dxb-DxB-Global-OS/4957fd57-7f50-42ac-abf2-2089df3f710e.jsonl`.
