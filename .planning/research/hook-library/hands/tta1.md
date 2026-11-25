All 46 ads are done: 46 sheets looked at, 15 kept, 31 left out, none missing. I also cut and viewed a denser strip for 12 of the 15 kept (all the beauty 4s and three more). The other three kept are judged from the eight frames.

Left out (31), reasons per id in `left_out.txt`:
- 10: deceiving film or claim, or a false front that is not a brand-price shop: 7442478080294273041, 7504503070753980424, 7465433284680695825, 7459754574825062417, 7571403744216678408, 7585030372455743504, 7618659603886440465, 7589597529102598160, 7545196628626849808, 7632162338602500114 (also immodest)
- 7: immodest: 7517878674344820752, 7565804992105955346, 7532513564014575623, 7519702272202653712, 7479002604057313296, 7425858825678454791, 7587858750611800072
- 6: false-front shops (known brand or costly product at an impossible price, or a "clearance" under a brand's name): 7571018524883927058, 7579957549857538055, 7426195898198425607, 7551726173736140808, 7551634718786748434, 7528376647998947336
- 4: not English: 7506351968848199696, 7493064125284302865, 7372269932215697409, 7386957593913163793
- 2: dull still catalogue slideshows: 7630010710986702866, 7495774880555876368
- 2: meaningless film unrelated to what is sold: 7469503014471958544, 7564741915480997904

Checker: `openings.jsonl ok 15 {'MONEY': 15}` / `rules.jsonl missing` / `ROWS 15 BAD 0`. This task asks for no rules file.

The ten best openings, all judged by my eye:
1. 7586327281318133761, mattress vacuum (reseller), `versus`: a germ drawn in powder is smeared by the old roller, then swallowed by the new tool in 2 s. "Instead of doing this, you could be doing this." The proof is in the picture. Strength weak (reseller).
2. 7329862135495589890, Shinwari Mart, `jolt`: a tower of forty boxes falls toward the lens. The accident puts the product on show with no pitch.
3. 7429157038209630209, Superfood Grocer, `versus`: the famous cup, then a match cut to "mine" in the same pose. The cut is the argument. Not clean (bare shoulders).
4. 7372193129983705104, EDWIN jeans, `odd_detail`: a black screen opens like an eyelid on the label. 55% still watching at 2 s, 40% of conversions in the first 3 s.
5. 7569910658189115399, Bionic Smile dental, `customer`: the closed mouth opens into new teeth, filmed as it happens. Usable for any clinic.
6. 7491624863079202832, Susteas juicer (reseller), `in_use`: whole fruit thrown in on the beat. The line "but I found out" turns the sentence. Weak.
7. 7467843908573741072, getonnice eyeliner, `unfinished`: begins at "my favorite part" with one eye undone. 152,737 likes. Not clean.
8. 7497603740993929217, nasal strips (reseller), `odd_detail`: a silent ritual, then Level 1, 2, 3. 62% still watching at 2 s. Weak and not clean (alcohol brand on the cap).
9. 7571065117702422535, big planters, `in_use`: one man carries the enormous thing through the room and places it. Weak.
10. 7569457780168769552, Alibaba, `wish`: a room full of flowers above the cartons, "POV". 89% of clicks in the first 3 s.

Shelves by main key: `in_use` 4 (and second shelf on 6 more); `versus` 2, `odd_detail` 2; one each of `before_after`, `unfinished`, `wish`, `jolt`, `character`, `customer`, `call_out`. Every opening fitted a shelf.

Surprise: Expatrio 7598545329013080081 keeps only 8% at 2 s, yet its click rate is in the top 4% and 86% of its clicks come in the first 3 s. It names its buyer in the first frame and lets the rest go, so watch-share alone would have thrown it out.

My judgement calls, for the lead to overrule:
- Resellers that nothing proves fake are kept as "weak": 7586327281318133761, 7491624863079202832, 7497603740993929217, 7571065117702422535, 7382106234840186881. Whether their films are taken from others is UNVERIFIED; I judged from landing address and caption only.
- Two strong openings fell only because of the shop: LiberNovo chair 7571018524883927058 ("This battery goes in this chair…") and the RC car 7426195898198425607 ("Worlds biggest RC Drifter!?"). The original makers' own posts could bring them back.

Could not be judged:
- Sound: I heard nothing; spoken words come from the machine transcript, so voice and music effect are not measured.
- The first seven seconds of speech in 7569910658189115399 are unintelligible in the transcript.
- The language of 7329862135495589890 after 4 s is unknown.
- The 100% watch figures on 7544247187837616145 are not believable as a measure (noted in its `doubt`).
- The proof lines are percentiles of click rate and a spend tier, so no row proves the opening alone (`proves` is "whole" on all).

Files: `/home/dxb/.local/share/dxb/hook-lab/el/tta1/openings.jsonl`, `/home/dxb/.local/share/dxb/hook-lab/el/tta1/left_out.txt`. The folder also holds the 12 strips, three later-second strips and `write.py`, which wrote all rows in one run after all sheets were viewed, not after each five.
