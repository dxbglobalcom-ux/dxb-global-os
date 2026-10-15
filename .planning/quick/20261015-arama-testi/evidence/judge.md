# The blind judge's scoring (helper, Opus 5.5 medium, 2026-10-15) — verbatim table and notes

The judge read only QUESTIONS.md and the four arm files under blind labels (arm-1 = both, arm-2 = Vane,
arm-3 = Claude web, arm-4 = our toolbox — `MAPPING-lead-only.txt`). Scale: 0-5 per question — correct,
specific, fresh, honest about gaps; an invented number or citation = 0 for that question. It checked Q1 with
`gh api …/releases` (v0.8.162 2026-10-15T12:19:26Z), Q2 on apify.com/pricing ("Includes $19 of monthly
prepa…" → $19), and opened up to two cited URLs per arm for Q3/Q4; Google Maps (Q5) and Reddit could not be
reached by it and stay UNVERIFIED.

| Arm | Q1 | Q2 | Q3 | Q4 | Q5 | Total | Seconds |
|---|---|---|---|---|---|---|---|
| arm-1 (both) | 5 | 5 | 5 | 4 | 4 | **23** | 334 |
| arm-2 (Vane) | 3 | 1 | 1 | 1 | 1 | **7** | 648 |
| arm-3 (Claude web) | 5 | 5 | 4 | 4 | 3 | **21** | 129 |
| arm-4 (toolbox) | 5 | 5 | 4 | 4 | 3 | **21** | 204 |

Its notes, condensed: arm-1 cross-checked (third-party $29 identified as the old price; three Q3 sources'
figures found word for word) and was honest that Q5 was "first page only"; its live-Maps and Reddit sources
could not be verified by the judge. arm-2 failed every question but Q1 (said the Starter price was "not
stated" although the page states it; German tourism pages for Q3). arm-3 fastest and honest (said its Q4
source was dated 22 Sept, flagged an unverifiable X page); weak on Q5 (directories, not live data). arm-4
cross-checked Q2 with official docs and itself marked its Q5 top three UNVERIFIED. No arm was found to invent
a number or a citation in these final answers.
