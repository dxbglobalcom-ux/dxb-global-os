All 46 ads are done: every sheet was opened and every card read (none missing). 11 were kept and 35 left out.

**Left out, by main reason**
- Spam shop, knock-off or someone else's film: 12 (Jordans ×3, Samsung, Huawei, Segway, Graco, pots ×2, laser light, recliner, shoe cabinet).
- Not English: 7 (Tagalog 3, Indonesian 2, Spanish 1, Hindi 1). I confirmed the Hindi with the multilingual speech model.
- Immodest: 5. Two of these also carry a medical claim or a false endorsement.
- Claim that deceives: 5 (fake followers ×2, GLP-1 patch, invented teeth animation, "stains in one second").
- False front: 2. Dull opening: 4.

**Checker line:** `openings.jsonl ok 11 {'MONEY': 11}` / `rules.jsonl missing` / `ROWS 11 BAD 0`

**Ten best, in order** (all 11 rows are TikTok, highest spend tier)
1. 7512457256694284304, "nomissed" nose strips, `test`. "Has anyone actually made it to level four before?", with the first and last level held to the lens. A ladder in one second; the only beauty 5. Weak: the film looks made for Intake.
2. 7362252464411836432, Pixella photo case, `objection`. "The best anniversary gift doesn't exist… His gift:". The blank window draws their own photo; top 1% by clicks, 49% at 2 s.
3. 7553411063312973840, children's cooking set, `character`. A serious child offers raw meat over a toy stove that works. Best hold of the kept ads after the first second except the clock (77% at 1 s, 57% at 2 s). Weak: throwaway shop.
4. 7267811452643311618, HB Jewelry, `news`. A customer's "restock pls" is answered by the necklace lifted out of the tray. 53% of clicks come in the first 3 s.
5. 7480449413421629457, Litter-Robot, `puzzle`. "GUESS THAT SOUND", finger raised. 81% of clicks come in the first 3 s.
6. 7260902383459057666, kessw glow-tube clock, `odd_detail`. An unknown object is built piece by piece without a word; 62% at 2 s, 43% at 6 s. Weak.
7. 7389511136150929425, aurora projector, `odd_detail`. A dark room is held for four seconds before the light; 625,283 likes.
8. 7291572929325416449, name mirror, `in_use`. A thumb presses and a name lights up; 14,362 shares.
9. 7343907261351346194, mesca.dk car screen, `plain_gain`. "power move: … instead of buying a whole new car" sets its price against a car. Weak.
10. 7552194148902223889, TikTok-ads course, `warning`. "Before you waste your money on TikTok ads *again*"; "again" picks out the buyer already burned.

The eleventh is 7544680251260338184, a garlic peeler (`in_use`, weak).

**Shelves filled most:** `in_use` 2, `odd_detail` 2, the other seven once each. `in_use` and `odd_detail` are also the second shelf on 2 rows each.

**What surprised me:** the aurora ad, the most liked on the list, is a nearly black picture with no words for four seconds. The two ads with the biggest early click shares (Litter-Robot, HB Jewelry) hold only 25% and 35% at 2 s, so clicking early and watching on are different things.

**For your decision:** three good openings were left out only because of who ran them, so their money proof belongs to a fake offer:
- 7592620826072776722: giant tablet, "guess what?", folds in half.
- 7171050726457524225: empty armchair, a woman walks in, drops and kicks up her feet (56% at 2 s).
- 7582177772928483346: a shopkeeper stacks pots.

If the originals can be found with their own proof, they deserve rows. I applied the stolen-film rule by judgement:
- **Left out:** throwaway domains with knock-off goods, impossible prices or a mismatched offer.
- **Kept, marked weak:** five rows from unrelated or throwaway shops that sell the product shown, each with the doubt written in.

**Not judged**
- Sound and music were not heard, only transcripts. So the "guess the sound" noise and the rhythm of the aurora and mirror ads are UNVERIFIED.
- The year is written "seen May 2026", because the cards give no first-run date.
- "Stolen" is inferred from a mismatch between film and seller, or a throwaway domain with a fake-sale offer. No owner was traced.
- 7267811452643311618 is `clean: false` only because of a swear word in the song; the picture is clean.

Every opening found a shelf. The nearest to a missing one is "climb the levels" (7512…), filed under `test` + `dare`.

Files are in `/home/dxb/.local/share/dxb/hook-lab/el/tta2/`: `openings.jsonl`, `left_out.txt`, and 14 `strip_*.jpg` (every beauty 4–5 row has a 0–3.2 s strip).
