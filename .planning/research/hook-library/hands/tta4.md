The whole list is done: all 45 sheets looked at, none missing, 14 kept and 31 left out.

**Left out, 31 by first reason (each ad once, full reasons in `left_out.txt`):**
- Not English: 10. Four were heard again with the large speech model (all Taglish or Tagalog): 7541678606310490120, 7377273244519219217, 7380386567946813456, 7527622638534377488. The Spanish waist trainer is counted under immodest.
- Immodest, undressed or indecent: 8
- Spam shop, stolen-looking film or false front: 11
- Vape: 1
- Dull opening: 1

**Checker:** `openings.jsonl ok 14 {'MONEY': 14} / rules.jsonl missing / ROWS 14 BAD 0` (no rules were asked for in this task).

**Ten best:**
1. 7488233449268215824, "Real-Look Sunset Mums", `story`: "Texted my mom… she about had a heart attack". The camera tips over from a bare garden to a blaze of flowers, and the mother's fright proves they look real.
2. 7449269100243501074, uoffical, `in_use`: a tree stands far too tall out of a carton and the front wall falls off. A sight that should not be, answered in one second.
3. 7562172785062445063, zephyrman (Bella Vita), `story`: "When she smelled this cologne, she was not having it". A husband caught at the door; 62% still watching at 2 s, the highest of those kept.
4. 7442471259210055697, TikTok Promote, `joke`: an old court painting cut in two; the arm leaves the frame, then the pointing hand is the answer.
5. 7291597735256653825, head lamp, `before_after`: a finger waits on the switch, then a black hall turns white.
6. 7540727996068970504, charmsofficial, `wish`: her things on a drinks tray carried like a handbag, seen from the walker's eyes. Made of one still idea.
7. 7456683461409390593, floor paint, `in_use`: pour, one scraper stroke, tape pulled off. Three things the eye wants to see finished.
8. 7530036496314613761, Lavojoy, `puzzle`: "can you spot my perfect tone-up match?" The viewer chooses before being told.
9. 7364707392342982673, INPLAY, `offer`: ₱5,999 as wide as the screen in frame one over a glowing PC.
10. 7356230984294629377, dog vacuums, `versus`: "I decided to get three of these…". The dog lies behind them as judge.

**Beauty:** one 5 (no. 1), six 4s or above in all (nos. 1–7 are 4–5), the rest 3. A denser strip was cut and looked at for all seven.

**Shelves filled most:** `in_use` 4 and `story` 2; the other eight shelves have one each. **Surprise:** the charm bracelet film took 94% of its clicks in the first 3 s with only 27% still there at 2 s, so one still picture sold it, not the film. No opening failed to fit a shelf.

**Good ideas lost only to language:**
- 7527622638534377488 (rat droppings, the camera goes in): best hold of the list, 92% at 1 s, 77% at 2 s, 67% at 3 s.
- 7484252582958137345 (a viewer's comment "don't cut the video so we see if it really purees", answered uncut): 68% at 2 s.

**Doubts and limits:**
- Six rows are marked `weak`: nos. 1, 2, 3 and 7, the steam cleaner (7472156331810619399) and the water dispenser (7215385375854018562). Their sellers look like resellers. I could not prove whose film it is or that the goods match, so this is UNVERIFIED.
- `clean` is false on four rows: nos. 1, 3 and 8, and the water dispenser (cigar packet with the word cognac).
- For the collagen drink Sip2Glow (7486842292092747783) the source of the collagen is not on the card; check halal before showing it to a food client.
- Music-only films were judged by picture; the sound itself was not heard by ear. The film after the opening was looked at in frames for only five of the kept ads: nos. 1, 3, 9, 10 and the T-shirt ad 7486499299330408464 (plus Sip2Glow, six in all).
- `year` is computed from the ad id (2023–2025). That an ad of 2023 ran without a break until May 2026 is not shown by the card: UNVERIFIED.

Files are in `/home/dxb/.local/share/dxb/hook-lab/el/tta4/`: `openings.jsonl`, `left_out.txt`, the strips (`strip_*.jpg`, `whole_*.jpg`) and my two scripts (`write.py`, `lang.py`).
