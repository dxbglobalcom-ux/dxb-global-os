# Web study — the common brief

**What this is.** The holding is setting up its web office (DxB Web Studio, board row B84): client sites at world-competition level, plus everything around a site. Its CEO has told us that a shallow "here is how SEO is done" list is not acceptable: every part of the web trade has to be truly learned, from the best sources, with the best tools found, and placed where the holding keeps such things. Read `his-words.md` in this folder first. He also told us not to be swayed by his words: test them.

**Your job.** One track of the study (named in your prompt). Learn it the way the best practitioner in the world knows it, then write what an office has to know and do. Not a listicle. A reader who finishes your file should be able to run this work at the top of the trade, and should know where the evidence is strong, where it is weak, and where the industry is selling air.

**Job folder:** `J="/home/dxb/DxB Global OS/.planning/quick/20261103-web-ders"`. Write only your own file under `$J/tracks/`. Do not touch any other repository file. Do not read other tracks' files.

## How to research
- **Sources, in order:** official documentation and standards; the platforms' own engineers; controlled studies, papers, court records; practitioners with a public record of results. Vendor numbers are labelled as vendor numbers. Every claim that changes what we would do carries its source, its date and how it was measured, and has two independent sources where they exist; where sources disagree, say so; the official page settles a disagreement. A number from an older model or an older year is said to be that.
- **Both sides, always:** Claude's WebSearch/WebFetch AND the holding's research toolbox, never one alone:
  `S="/home/dxb/DxB Global OS/.claude/skills/dxb-research"; export PATH="$S/bin:$PATH"` then
  `bash "$S/scripts/sweep.sh" "<3-6 words>" <outdir under $J/tracks/ground-<track>> --tier max --pages 8` (40 channels) · `bash "$S/scripts/mcpx.sh" exa|tavily|parallel|youcom|firecrawl "<q>" 10` · `python3 "$S/scripts/fetch.py" <url>` for a page that refuses · `opencli reddit search "<q>" -f yaml` · `opencli hackernews search "<q>" -f yaml` · `opencli twitter search "<q>" -f yaml` · `opencli youtube search "<q>" -f yaml` and `opencli youtube transcript <url> -f plain` · `gh search repos "<q>"`, `gh api repos/O/R --jq '.description,.stargazers_count,.pushed_at,.license.spdx_id'`. Short queries, many in parallel. A channel that gives nothing twice is dead for this question: move on. Full table: `$S/SKILL.md`.
- **Read the real thing.** Open the documents; read past the headline. A tool a post names is looked up at its real source. Hype is not repeated. Long videos by the field's best people: read the transcript.
- **What we already have:** `$J/excel-web-rows.json` holds the links the holding has already judged (W072, W073, W082, W087, W096, W097, W122, EK12 …); `.planning/research/REVENUE-OPPORTUNITIES.md` (#21 H5 web office, #17 H1); his folder `~/Desktop/DxB Global Web-Studio/` files 2 and 7; `.planning/quick/20261103-web-studio-kesif/research/WP-WOO.md` and `PLATFORMS.md`; the shelf `ls ~/.local/share/dxb/skills/` (OpenSEO's 12 skills, reverse-engineer-anything, Emil Kowalski's skills …); `personas/marketing/`. Say "we have it" rather than re-proposing it, and say what is wrong or missing in what we have.

## The holding's rulings you must honour
- The holding is **global, not Turkish**: law, tax, market and platform questions are answered with the global principle first, then the main countries side by side, Turkey one of them.
- Sites and visual work are showy, luxurious, wow. Never steer toward plainness; do not use words of that direction (sade, minimal, basit, yalın, restraint, understated, "less is more"). Speed, accessibility and search are floors under the wow, not a reason to reduce it: when they collide, find how the best sites keep both.
- Copying means taking images, names and content; a design may be identical.
- Open-source tools and platform terms are not written up as obstacles; licences are stated as a fact, never as a blocker. Every open-source tool is listed with its paid twin as the fallback, and every paid tool with its open twin. Never "X, not the paid Y".
- Islamic boundaries: no gambling, betting, interest-based finance, haram content. If an industry practice touches one (for example interest-bearing buy-now-pay-later), name it in one line for the CEO; do not decide it.
- Money out, contracts, identity steps and ad spend stop at the CEO. Nothing is installed, bought, signed up to or posted. Read only toward the world. Never type the holding's own names or unreleased work into a search box.

## What to write: `$J/tracks/<your file>`, in Turkish, correct Turkish characters, names and code unchanged
2,500-4,500 words. Plain, complete sentences. Tables where they carry data.

1. **Özet** — ten lines: the most important things, the answer first.
2. **Kanıt durumu** — a table: claim · how strong (resmî / kontrollü ölçüm / uygulayıcı / satıcı iddiası / efsane) · source and date. Include what is widely said and false.
3. **Dünya seviyesi nasıl yapılır** — step by step, with thresholds and numbers, the way the best do it. What a beginner agency skips.
4. **Wow ile çatışma** — where this collides with heavy film, 3D and motion, and how the best keep both.
5. **Aletler** — a table: name · what it really does · real? (stars, last update, licence, price) · paid/open twin · do we have it · where it belongs (shared shelf, an MCP, a persona's knowledge, a monthly job).
6. **Ofisin işi** — who does what: what is done once at build, what is automatic, what is monthly; which part is a specialist's, which is the site master's; what must be in the master's hands from day one.
7. **Satılabilecekler** — what clients really pay for here, with market prices from a named source.
8. **En iyi kaynaklar** — the people, documents and courses worth learning from, and why; what should go into the holding's shared knowledge.
9. **Bilinmeyenler** — what could not be established and what would settle it.

End your final message with only: the file path, word count, and any part you could not finish and why.
