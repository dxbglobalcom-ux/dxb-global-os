# Watching the winning ads — the brief of the watching hands (2026-11-25)

Read first, whole: `/home/dxb/.local/share/dxb/hook-lab/BRIEF.md` (the holding, the CEO's words, the library's door, the row
format, the checker) and `/home/dxb/.local/share/dxb/hook-lab/SHELVES.md` (the shelves).
This task differs in one thing: your sources are real ads, and you LOOK at them.

Your list is a file of ad ids (named in your task), one per line. For each ad there are two files in the folder named in your task:
- `sheet/<id>.jpg` — eight frames of the film at 0.0, 0.4, 0.8, 1.2 s (top row) and 1.8, 2.4, 3.0, 4.0 s (bottom row). Open it with the Read tool and look.
- `txt/<id>.txt` — the card: advertiser, PROOF line (what was measured), the ad's text, and the machine transcript of the first 25 seconds (small model: it mishears names and invents words over music — trust the picture and the sense).
An ad whose sheet or card is missing is written down as "not judged" and passed over.

For every ad decide: keep or leave. The proof line only says the ad was paid for and shown; YOU judge whether its opening is worth learning.
LEAVE OUT: not English; immodest (undressed, sensual) or a product of that kind; alcohol, pork, gambling, loans/credit/insurance/trading, dating, occult, politics, any religion's own preaching; medical claims that deceive, fake reviews, fake countdowns, a false front; spam shops whose film is stolen or meaningless; a pure entertainer's or fan page with nothing to sell; films with no opening worth learning (a still catalogue picture with nothing in it, a slow logo, filler talk before the point).
KEEP: an opening with a clear idea you would use for a paying client. Every kind — plain, funny, dramatic, a demonstration, a question, a price, a face, a problem, a product alone — no favourite mould. Be honest and choosy: a dull ad that happened to run long is left out ("dull opening").

For each ad you mark beauty 4 or 5, cut a second, denser strip and look at it before you write the motion:
`ffmpeg -v error -y -t 3.2 -i <folder>/vid/<id>.mp4 -vf "fps=5,scale=256:-2,tile=4x4" -frames:v 1 <your folder>/strip_<id>.jpg`
Whenever the eight frames leave a doubt, do the same.

For each kept ad append a row to `openings.jsonl` in your folder, in the BRIEF's format, with these meanings:
- `opening`: the first spoken words as heard (first sentence, corrected by sense) and, after " | screen: ", the on-screen words of the first three seconds exactly as you read them in the frames.
- `picture`: what you SAW in the first three seconds, second by second (0 s …; 1 s …; 2–3 s …), with the motion (cut, zoom, hand enters, walk, reveal) — concrete enough for a film maker to rebuild it.
- `channel`: "tiktok_ad" or "meta_ad"; `door`: "MONEY"; `outcome`: "bought" when the objective is sales/conversions/leads or the ad sells, else "clicked".
- `seller`: advertiser — what it sells; `sector`: the one the ad really belongs to (the card's sector comes from a search word and is often wrong).
- `result`: the PROOF facts in one line (TikTok: spend tier, top N % by clicks, share still watching at 2 s, likes; Meta: running since …, days, copies of the same creative, position by impressions).
- `measured_by`: "TikTok Creative Center Top Ads US, May 2026" or "Meta Ad Library, read 25 Nov 2026".
- `family`: your own short name for the opening (the mechanism in plain words).
- `shelf`, `shelf2`, `fits`: from SHELVES.md, exact keys; `proves`: "whole".
- `why`: one plain sentence, [mine].
- `for_client`: the same shape rewritten for a concrete small business of ANOTHER sector, with its first picture and its first words, in English — ready to film.
- `file`: the txt card; `quote`: a verbatim piece of the card (PROOF line or speech) under 300 characters; `line`: 2; `source`: advertiser + platform; `url`: the ADDRESS line for Meta, or https://ads.tiktok.com/business/creativecenter/topads/<id>/pc/en?countryCode=US&period=180 for TikTok; `read`: "whole"; `strength`: "usable" (the lead sets it from the numbers afterwards), "weak" when you doubt the ad itself; `doubt`.
- `ad_id`: the id; `clean`: true/false — may the film be shown as an example to a devout Muslim family man (no immodest dress, no music-video dancing, no alcohol); `beauty`: 1–5, how good an opening it is to a professional's eye (5 = you would put it on the wall; most are 2–3).
Append rows as you go (after each five ads, with a small `python3 -I` script that json.dumps each row). Do not write rows from the card alone: look at every sheet.

Run the checker before you finish: `python3 -I /home/dxb/.local/share/dxb/hook-lab/check_rows.py <your folder>`.
Final message, at most 40 lines: ads looked at / kept / left out by reason; the checker's line; the ten best openings (id, advertiser, shelf, one line each, why); the shelves you filled most and the opening that surprised you; what could not be judged; any opening that fits no shelf.
