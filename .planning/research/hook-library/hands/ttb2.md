The whole list is done: I looked at all 39 sheets and kept 3 ads. This batch is mostly throwaway shops running other people's films, plus ads that are not in English.

**Looked at 39, kept 3, left out 36, not judged 0.**

Left out, by main reason (several have more than one):
- **False front, 14:** a branded or costly item at $29–90 by an unrelated shop, a shop calling itself "TikTok Shop" or "TikTok for Business", or a pasted or borrowed film.
- **Not English, 9:** Tagalog 5, Indonesian 2, Malay 1, Spanish 1. For 7499688743198457872, 7483103737570967559 and 7533438061591527425 I re-heard the sound with the large whisper model, because the card's English transcript was invented. The other six I judged by on-screen words or the card.
- **Deceiving, 8:** paid-to-watch scheme 2, medical 2 (one of them also obscene), fake counter, power saver, faked teeth, "who visits your profile" (also Spanish).
- **Immodest, 3:** one of them is also a health claim.
- **Vape with a beer-brand shirt, 1. Foul spoken opening, 1.**

**Checker:** `openings.jsonl ok 3 {'MONEY': 3}` · `rules.jsonl missing` · `ROWS 3 BAD 0`. This task asked for no rules.

**Kept (only three, so no ten best)**
1. 7427054623552323591 wallwheels · `spectacle` + `in_use` · beauty 4, weak. Toy cars already drive on a living-room wall while father and son look up, with three still words. The impossible is under way at frame 0 and the turned heads point at it. 53,547 likes, but 34% at 2 s and only 2% of conversions in the first 3 s.
2. 7127394317497335810 TikTok Promote · `trouble` + `native` · beauty 3, usable. "I want more followers… but I just don't know how"; her second self in glasses answers at 3.8 s. Best hold of the list among clean ideas (66% at 2 s). The platform advertises on its own ground, the likes on the card are not this film's, and I set `clean` false for the sleeveless top.
3. 7466420872657289233 The FingerPrints Ph · `plain_gain` + `call_out` · beauty 2, weak. "Pov: I found the perfect gift idea for our anniversary" is written over an open, glowing gift box. Only 23% at 2 s, but 34% of clicks fall in the first 3 s: it sorts buyers rather than stopping strangers.

**Strong shapes left out by the rules** (named in `left_out.txt`, in case you want the shape from its rightful owner)
- 7499688743198457872: a wall of water hits a still rider, then he opens the jacket on a dry white shirt. Tagalog voice, and the suit in the inset is another one.
- 7566098296294686728: a palm-sized V8 running, a paper held at its exhaust, 53% at 2 s. The account calls itself "TikTok for Business".
- 7495691372008521736: RC car carried in, shell lifted off. It looks like the film tta1 left out as 7426195898198425607, going by that hand's description; I did not open that film.
- 7540222818925658130: a laughing man lifts a folded fat bike and unfolds it.
- 7566103152129163265: result first, with a small "before" picture in the corner.

**Shelves:** none filled more than once. **Surprise:** the near-still gift box. It has the weakest hold of the three kept, yet about a third of its clicks come at once.

**Judgement calls for you**
- Following the earlier hands' practice, I kept a reseller's film as "weak" only when the opening itself deceives nobody (the wall car). Impossible prices and impersonated brands went out.
- "Stolen" or "unrelated shop" is read from the picture, name, price and landing address. I opened no shop page, so it is UNVERIFIED.

**Could not be judged:** nothing was missing. No opening lacked a shelf.

Files are in `/home/dxb/.local/share/dxb/hook-lab/el/ttb2/`: `openings.jsonl`, `left_out.txt`, the strips, and the helpers `ttb2_write.py` and `ttb2_lang.py`.
