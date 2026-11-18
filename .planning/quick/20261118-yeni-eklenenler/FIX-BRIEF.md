THE HOLDING: This holding produces high technology, aims at large revenue and will found large companies; its goals are very large. Its business lines' clients are small, medium and large, reaching up to the biggest clients in the world.

# Fix the blind audit's findings on commit 0ce31f3f — the 'Yeni eklenenler' placement

Commit 0ce31f3f wrote the second reading of the CEO's workbook tab 'Yeni eklenenler' into row files. A blind
auditor (GPT-6.2 Sol) refuted part of it. Its verdict, whole: `.planning/quick/20261118-yeni-eklenenler/SOL.md`
— read it first. You fix the findings listed below, in the files named, with the Edit tool. You do not commit.
The original method and records: `.planning/research/watch-links/2026-11-18-recheck/yeni-eklenenler/`
(WRITER-BRIEF.md for form and voice; h1.md, lead.jsonl, pack.json, notes.json).

R="/home/dxb/DxB Global OS". Every fact you write you check at its source first (the path, the line, `ls`,
`grep`, `gh api`); where you cannot confirm a finding, leave the line and say so in your reply. A finding the
source shows wrong is not applied — say why. Keep each change small: correct the bullet in place, do not add
new legs. Markers: any new line that rests on his order carries
`<!-- CEO-OK: yeni-eklenenler-second-reading-by-a-successor-and-one-helper-2026-11-18 -->` only where the
existing leg's lines already do; nothing is written as approved or accepted. A licence is never a blocker
(ledger `licence-word-standing-rule-2026-11-07`).

## The fixes

1. **YE05, B43 (the Playwright CLI recorder bullet of the 2026-11-18 'Yeni eklenenler' leg).** Our installed
   Playwright MCP 0.0.79 already records video with action callouts and an animated cursor
   (`~/.npm-global/lib/node_modules/@playwright/mcp/README.md` — `browser_video_*`, `browser_video_show_actions`,
   opt-in via `--caps=devtools`; the repo's `.mcp.json` does not pass that cap). Rewrite the bullet as a
   **second**: our MCP is the counterpart; the trial is the same 30-second flow through the MCP (with
   `--caps=devtools`) and through the CLI, and whether the CLI's 60 fps changes the film. Move it under the
   leg's "Seconds" group.
2. **YE27, B43.** The older w089 bullet (around B43:213) says Remotion "stays the fallback engine"; the new
   bullet and OpenMontage's README (`~/tools/OpenMontage/README.md` ~:296) say OpenMontage picks Remotion as the
   default for data explainers. Make the scope explicit in the new bullet: HyperFrames is the motion-graphics
   default (dxb-motion-graphics); inside OpenMontage Remotion is the default for data explainers. Also: the
   `@remotion/web-renderer` 4.0.484 on disk is not a measured in-browser delivery — say so in B84's bullet if it
   reads otherwise.
3. **YE26, B30.** In `fetch.py`'s actual order Firecrawl is the 9th door, after Tavily (check
   `.claude/skills/dxb-research/scripts/fetch.py` around :525 against the comment at :23); `door_pdf` takes PDF URLs
   only (~:455). Correct "door 8" and the document-format claim; add to the trial the unused formats (one PDF, one
   DOCX, one page) and that `tavily_crawl` is first checked to work keyless.
4. **YE10, B84 and B31.** B84's Y9 Apify lines (~:156-158) must carry the account / OAuth identity step as
   stopping at him beside the money past the free credit; B31:17's corrected sentence states the condition
   plainly — the free-plan Y9 trial first, paid research use is money out — and the stale "optional" in the same
   paragraph is made consistent with it.
5. **YE20, B64.** The TLA+ bullet: say that the model checks the model, not the code — the trial needs the mapping
   from the model's steps to the job desk's code and an implementation test beside it; state the assumptions
   (failure and progress) under which "no job lost or done twice" is checked; the one-minute target stands apart.
6. **YE23, B84.** B84 already has a pre-delivery attack pass (~:270: an attacker model, a test database, separate
   users, a reference and a deliberately broken version). Name it as the counterpart; relation **second**; what the
   skill adds is a stack-specific checklist; the trial counts the verified findings the existing pass missed on the
   same sample. Move the bullet to "Seconds".
7. **YE07, B51.** A local counterpart exists: `/home/dxb/deneme-2/OKU.md` (~:49) and its `kullanim.py` (read only —
   that folder is another session's; never run or change anything there) sum lead and helper token use per
   transcript. Name it as the counterpart; relation second; the trial compares the same three jobs through both,
   subscription quota and API-price equivalent measured apart.
8. **YE15, C40.** C40:36 already carries the failed-trial log and a simplification line. Keep only the real
   additions; say how an equal score is settled (fewer lines wins only on an equal score) and that C40:12's hard stop
   and escalation outrank the never-stop overnight mode.
9. **YE11, B32 / YE12, B05.** B32: the bullet is the refresh of a shelf copy we have — put it under a heading that
   says so (not "To install"). B05: give `upgrade-stripe` its own first trial or say the trial covers the planner
   only.
10. **The records of the reading** (`.planning/research/watch-links/2026-11-18-recheck/yeni-eklenenler/`):
    - `lead.jsonl`: add one record each for YE03 (HyperFrames — used by `~/.claude/skills/dxb-motion-graphics`),
      YE14, YE16 (`~/.claude/skills/scrollcraft`), YE17 (`~/.claude/plugins/cache/thedotmack/claude-mem`), with the
      evidence path. YE14: the plugin is installed and closed (`~/.claude/plugins/cache/open-design`), its service
      was measured absent and its first trial is already written in B84 (~:235) — check `gh api repos/nexu-io/open-design`
      for anything new since that leg and write it, or "nothing new". Its reading becomes "Zaten tahtada".
    - YE01 and YE08's `reading` becomes "Zaten tahtada" (placed, not installed).
    - `notes.json`: YE14 → "Zaten tahtada → B84 · eklenti kurulu ama kapalı, deneme yazılı"; YE01 and YE08 unchanged
      in meaning; YE05 → "İkinci → B43 · kurulu Playwright MCP'nin kaydıyla yan yana"; YE23 → "İkinci → B84 · mevcut
      teslim kontrolünün yanında"; YE07 → "İkinci → B51 · Ekim kararınız (gerekince npx) satıra yazıldı". Short,
      Turkish, the same style as the file.
11. **The licence condition elsewhere (C in the audit; his standing rule applies — LAW A, the contradicting text
    goes):** `.planning/research/study-cards/firecrawl.md` (~:24) and `.planning/research/INTEGRATION-TRACKER.md`
    (~:102) still put an AGPL call on the CEO. Remove that condition in place with one clause naming the rule
    `licence-word-standing-rule-2026-11-07`, as B30:28 now does.

Not yours: the board (`00-BOARD-OPEN-WORK.md`), STATE, the doors, the workbook, ceo-approvals.json.

## Before you say it's done

Run the tests and show me the output: `git -C "$R" diff --stat`, the jsonl parse check
(`python3 -I -c "import json,sys; [json.loads(l) for l in open(sys.argv[1])]" <file>`) on lead.jsonl, and
`python3 -I -c "import json,sys; json.load(open(sys.argv[1]))"` on notes.json. If something is missing or
broken, tell me instead of working around it. Do not stop while a fix of this list is undone.

Reply with only: per fix number, what changed (file:line) or why it was not applied; and the outputs.
