**Counts.** I looked at 48 of 48 sheets and read 48 of 48 cards. 22 kept, 26 left out. No sheet or card was missing.

**Checker:** `openings.jsonl ok 22 {'MONEY': 22}` / `rules.jsonl missing` / `ROWS 22 BAD 0`. Rules are not part of this task.

**Left out, one main reason each** (per ad in `left_out.txt`):
- Dull or empty opening: 8
- Filler talk: 3
- Slow logo: 2
- Medical claim that deceives or overclaims: 3
- Immodest: 4, counting OG Dental, which is also dull
- Alcohol: 2
- Invented urgency: 2. Hobibear says "today" after 498 days; Cloudies says "limited time" after 604 days.
- Religious preaching: 1 (Mercy Bakery)
- Spam shop: 1 (Owlkay)

**Ten best** (beauty 4–5 in the rows; the last one is a 3)
1. m25170993712533498 Nuvia, `trouble`, beauty 5. A denture plops into a glass of water, then a cut to the new arch exactly on the words "dental implants". The trouble's own object says it all.
2. m1069280631032646 Thalairaj Biryani, `maker`. The owner waves you in and a whip cut flies the camera inside. You have entered before deciding to.
3. m1002821064566594 Greenfood, `fast_easy`. "satisfying my Filipino food cravings in... 3, 2, 1", with the plate assembled on the count. The wait has a known length.
4. m1893184628290864 Stepprs, `versus`. Two labelled insoles and one body stepping on both, in one take. You feel it in your own sole.
5. m1188681728347273 Seven Grams, `in_use`. A cookie cracks slowly and is still not broken at 4 s. 1,496 days.
6. m1080542923322809 DND Gel, `in_use`. One nail repainted in a newly named colour every 1.5–2 s. 1,147 days.
7. m800307772846880 The Bentist, `native`. He acts out the comment "YOURE IN PLANO???", then a punch-in and he answers himself.
8. m1049062250331120 Dough Guy, `borrowed`. A known judge is astonished and the cause is withheld. clean=false, because an alcohol brand is on his shirt.
9. m873770030802167 Rave Coffee, `maker`. The bag covers the lens in frame one and is ripped off to show a face. 1,089 days.
10. m955079588751501 Leytonstone Dental, `in_use`, beauty 3. A gap in a row of teeth and the exact part sinks in, with no words. 1,825 days, position 2.

**Shelves.** `in_use` 4; `maker`, `borrowed`, `fast_easy`, `trouble` 2 each; ten others 1 each. Beauty: 5 ×1, 4 ×8, 3 ×10, 2 ×3. Clean: 16 true, 6 false.

**Surprise.** Four of the ten best have no speech at all and their pictures carry the opening. The spoken lines here are mostly soft. GOVX (`joke`) plays a tiny expert problem as a straight-faced infomercial parody. MLab (baking soda poured on a knee) had a strong odd-detail picture but was left out for its medical claim.

**Could not be judged or verified**
- Sound and music: only the machine transcripts were read.
- Whether the Bentist comment is real, whether the AudioCardio news report aired, and whether the Rave speaker is the founder.
- Nuvia's 24-hour claim, Stepprs' relief claim and Move Think Smile's "38 calls in 24 h" are the sellers' own words. Move Think Smile and AudioCardio are marked `weak`.
- "Running since" proves the ad stayed active, not that it sold. Cards with one copy at a low position are thin proof.
- Several ads were found under the wrong country or sector (Thalairaj is Indian, Greenfood Philippine); I set the sectors myself.

**No shelf fits well.** DND Gel's "same spot, next named variant" is neither a pure list nor a pure product shot. Thalairaj's "walked in by the host" has no shelf for being invited or led into a place. Both were filed at the nearest shelf.

**Method note.** Rows were written in one pass after all 48 sheets were seen, not after each five. Dense strips were cut and viewed for every beauty 4–5 and for eight others; three picture descriptions were corrected from them.

Files: `/home/dxb/.local/share/dxb/hook-lab/el/meta1/openings.jsonl`, `/home/dxb/.local/share/dxb/hook-lab/el/meta1/left_out.txt`, `/home/dxb/.local/share/dxb/hook-lab/el/meta1/build.py` (rewrites `openings.jsonl` if run), and `strip_<id>.jpg` in the same folder.
