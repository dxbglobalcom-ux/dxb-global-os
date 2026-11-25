All 277 rows are labelled. I read each one and used no keyword rules. I did not write append batches of 20–25: I appended 50, 50, 90 and 87 at a time. The checker had nothing to correct.

**Checker** (`python3 -I /home/dxb/.local/share/dxb/hook-lab/raf/check.py /home/dxb/.local/share/dxb/hook-lab/el/raf2`)
`shelves known 41 | rows wanted 277 labelled 277 missing 0 [] extra 0 bad 0` (no duplicate ids)

**Rows per shelf:** plain_gain 63, crowd 18, offer 16, ask 15, odd_detail 12, yours 12, question 10, fast_easy 10, personal 10, insider 9, story 8, warning 8, mistake 8, wish 7, odd_fact 7, honest 6, call_out 6, maker 6, customer 5, borrowed 5, dare 5, native 4, button 4, deadline 4, expert 3, puzzle 2, news 2, spectacle 2, enemy 2, list 2; trouble, jolt, joke, object, objection and test 1 each.
**proves:** whole 132, words 124, brand 21. **fits:** any 262, known 10, new 5.

**Flags, 27 rows:**
- **haram (4):** caples-091 beauty-pageant franchise; hopkins-012, -013, -034 pork and beans.
- **deceives (2):** hopkins-011 refund did not cover one-bottle buyers; hopkins-026 the paste did not remove the film.
- **norival (8):** davranis-002 earlier period in which nobody asked; -017, -019, -027, -028 rival was no letter; -070 town without the campaign; -084 no sign; klasik-045 rival was only the yearly minimum.
- **nowords (3):** caples-100 headline-position test; davranis-030 only "one page" is told; davranis-089 text without a face.
- **notopening (10):** caples-096, -097, -098 hidden or end-of-ad offers; chatgpt-028 placement; chatgpt-029 colour; davranis-038 and -064 gestures with the bill; -055 split into two texts; -090 strip size; klasik-022 section in the list.
- **Not flagged, only noted:** caples-083 (annuity), davranis-091 (shames with private records), hopkins-010 (pretext-like advice request), davranis-033, -035 and -047 (later trials found little or no effect).

**Hard borders and how I decided:**
- `proves` for Caples's ten pairs (082–088) and Cody (caples-108): the rest of the ads is not shown to be the same, so `whole`.
- Little Blue Books: same book retitled is `words`, also where the section heading changed with it (noted on four rows). Twin books with different insides are `whole`. Envelope teasers are `whole`.
- Government letters: one added sentence or stamp is `words`; differing or redesigned letters are `whole`.
- Hopkins: one ad, letter or coupon counted is `whole`; campaign or yearly sales is `brand`.
- plain_gain / story, trouble, insider: a plain renamed title stays plain_gain. "The truth about" and "what never to" went to insider; "do you make these mistakes" to mistake.
- yours / personal / call_out: reserved, earned or begun is yours; name, town or record is personal; country, site or reader type is call_out.
- maker / object: handwritten sticky notes went to maker, as SHELVES.md names them there.

**No shelf fits well** (nearest key given; the first four and the layout row carry a note, the dish names do not): caples-099 a smile (wish); davranis-008 PAY NOW stamp (button); davranis-037 prohibition sign (mistake); davranis-069 everyday-object reminder (call_out); caples-100 layout (plain_gain); sensory dish names davranis-060 to -063 (plain_gain + wish).

Output: `/home/dxb/.local/share/dxb/hook-lab/el/raf2/shelf.jsonl`
