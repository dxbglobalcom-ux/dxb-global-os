All 277 rows of `raf1` are labelled, each judged by reading it, and the checker found nothing missing, extra or malformed.

**Checker:** `shelves known 41 | rows wanted 277 labelled 277 missing 0 [] extra 0 bad 0` (file has 277 lines, so no duplicate ids)

**Rows per shelf:** plain_gain 41, button 28, offer 26, fast_easy 16, yours 15, ask 14, news 12, odd_detail 10, story 10, wish 9, trouble 9, maker 8, personal 7, native 7, list 6, question 6, borrowed 6, call_out 6, customer 5, crowd 4, mistake 4, enemy 3, odd_fact 3, deadline 3, puzzle 3, joke 3, insider 2, honest 2, before_after 2; 1 each: unfinished, objection, spectacle, dare, in_use, warning, object. Not used: test, versus, expert, character, jolt as main shelf.
**proves:** words 159, whole 111, brand 7. **fits:** any 248, known 27, new 2.

**Flagged (8):**
- nowords: `o-abarsiv-080` (exact winning words not printed), `o-abarsiv-121` (only the angle told), `o-abarsiv-122` (opening paragraphs not printed).
- notopening: `o-bilimsoz-018` (a shop assistant's reply), `o-caples-045` (tests letter length).
- deceives: `o-caples-012` (looks like a job ad, sells a course), `o-caples-050` (question hints at an impossible youth claim).
- norival: `o-caples-041` (mailing plus call against a cold call alone).

**Hard borders:**
- `words`/`whole`: headline and picture both changed, or page parts changed, is `whole`; a picture alone swapped under the same headline is `words` (`o-bilimvideo-005`, `o-caples-032`). Headline plus button on the same page stayed `words` (`o-abarsiv-093`). Two Caples headlines compared as headlines are `words`; ads with different pictures or appeals are `whole`. Campaign-only growth is `brand`. Least sure: `o-abarsiv-089`, `o-caples-004`, `005`, `015`, `069`.
- `button`/`plain_gain`: words on a button, link or closing step are `button`; an action line that serves as the ad's headline is `plain_gain`, or `offer` when "free" is what it says.
- When both arms held the offer, the shelf follows the part that differed (`o-abarsiv-009`, `035`, `114`, `144`; `o-bilimsoz-011`, `012`, `013`).
- Short charity act lines are `plain_gain`; a modest request or small sum is `ask`. "How … accident/stunt" is `odd_detail`, with `story` second.
- Email lists of people who already know the sender are `known` only where the line needs that history.

**Flag doubts left open, for you:**
- Not flagged `deceives`, noted instead: `o-bilimsoz-012` ("You've been selected"), `o-caples-063` (Thursday without a date), `039` (notice look). I also left `o-abarsiv-066` ("Quick question") with a note.
- Not flagged `haram`, because the list names interest lending only: insurance (`o-abarsiv-145`; `o-caples-006`, `015`, `029`, `068`, `069`, `081`), bank (`o-caples-023`, `032`), brokerage (`o-caples-027`). Each carries a note.
- Not flagged `notopening`: `o-caples-062` (the many-choice card was tested, not its headline) and `o-abarsiv-171` (two coupons of unequal worth).

**No shelf fits well:** `o-abarsiv-059` (warm greeting "Friend", put in `personal`), `o-abarsiv-029` and `030` (a small gap the reader can close, put in `yours`).

File: `/home/dxb/.local/share/dxb/hook-lab/el/raf1/shelf.jsonl`
