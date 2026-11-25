# Traits — the brief of the labelling hands (2026-11-25)

The CEO today: "Sektörden sektöre, konudan konuya, videodan videoya her şey değişebilir … ürünün kendi özelliğine göre … bir sürü değişken var."
So every winner in the hook library says what KIND of thing it sold, and a writer can ask for winners of things like his own.
You read rows (one JSON object per line in `in.jsonl` of your folder: id, opening, picture, seller, sector, channel, result) and write `traits.jsonl` in your
folder, one object per row: {"id": …, "sells": …, "price": …, "result_seen": …, "need": …, "sense": …}. Judge what was SOLD by the winning opening, reading the row;
no keyword rules. Exact keys:
- `sells`: thing · service (done for you: cleaning, dentist, repair, agency) · place (shop, restaurant, hotel, museum, event) · software (app, site, online tool) ·
  learning (book, course, newsletter, guide) · cause (charity, public good, vote, behaviour) · media (article, film, channel: the thing itself is to be read or watched) · job
- `price`: free · cheap (to about $50) · mid ($50–$500) · dear (over $500) · unknown — the price of what is asked for at that step (a free guide is `free`)
- `result_seen`: now (the result can be SEEN in seconds: clean, repaired, cooked, folded, taste on a face) · later (seen after days or months) ·
  unseen (cannot be shown: safety, advice, data, peace of mind) · itself (the thing's own look or sound is the attraction: fashion, food, car, toy)
- `need`: urgent (something hurts or is broken now) · everyday (bought again and again) · considered (thought over, compared) · impulse (bought on sight) ·
  giving (donation, favour, public behaviour) · attention (only a click, a view, a sign-up is asked)
- `sense`: eye · ear · taste · touch · mind · heart — the one the opening works through most
Read a row twice when in doubt; write every row of your file; append in blocks of about thirty. Check at the end that the ids of `in.jsonl` and `traits.jsonl`
are the same and the keys exact (a small `python3 -I` script in your folder). Change nothing else; never `cd` in a compound command, never `rm`.
Final message, at most five lines: count, the check's line, what was hard to label.
