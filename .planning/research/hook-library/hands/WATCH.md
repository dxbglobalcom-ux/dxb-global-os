# Watching the winning ads — the brief of the watching hands (2026-11-25)

Read first: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook/BRIEF.md` (the holding, the CEO's words, the library's door, the row format, the checker).
This task differs in one thing: your sources are real ads, and you LOOK at them.

Your list is a file of ad ids (named in your task), one per line. For each ad there are two files in the folder named in your task:
- `sheet/<id>.jpg` — eight frames of the film at 0.0, 0.4, 0.8, 1.2 s (top row) and 1.8, 2.4, 3.0, 4.0 s (bottom row). Open it with the Read tool and look.
- `txt/<id>.txt` — the card: advertiser, PROOF line (what was measured), the ad's text, and the machine transcript of the first 25 seconds (small model: it mishears names and invents words over music — trust the picture and the sense).
When the eight frames leave a doubt, cut more: `ffmpeg -v error -y -ss <t> -i vid/<id>.mp4 -frames:v 1 <your folder>/x.jpg` and look.

For every ad decide: keep or leave.
LEAVE OUT: not English; immodest (undressed, sensual) or a product of that kind; alcohol, gambling, loans/credit/insurance/trading, dating, occult, politics; medical claims that deceive, fake reviews, fake countdowns, a false front; spam shops whose film is stolen or meaningless; films with no opening worth learning (a still catalogue picture with nothing in it).
KEEP: an opening with a clear idea you would use for a client. Every kind — plain, funny, dramatic, a demonstration, a question, a price, a face, a problem, a product alone — no favourite mould.

For each kept ad append a row to `openings.jsonl` in your folder, in the BRIEF's format, with these meanings:
- `opening`: the first spoken words as heard (first sentence, corrected by sense) and, after " | screen: ", the on-screen words of the first three seconds exactly as you read them in the frames.
- `picture`: what you SAW in the first three seconds, second by second (0 s …; 1 s …; 2–3 s …), with the motion (cut, zoom, hand enters, walk, reveal) — concrete enough for a film maker to rebuild it.
- `channel`: "tiktok_ad" or "meta_ad"; `door`: "MONEY"; `outcome`: "bought" when the objective is sales/conversions/leads or the ad sells, else "clicked".
- `result`: the PROOF facts in one line (TikTok: highest spend tier, top N % by clicks, share still watching at 2 s, likes; Meta: running since …, days, copies of the same creative, position by impressions).
- `measured_by`: "TikTok Creative Center Top Ads US, May 2026" or "Meta Ad Library, read 25 Nov 2026".
- `family`: your own short name for the kind of opening (say what the mechanism is: e.g. "problem shown on the body", "result first, then how", "odd object makes you ask", "owner speaks to you by name of the trouble", "price on screen at second 0", "test in front of your eyes", "two things side by side", "mistake you are making", "satisfying process", "someone reacts").
- `why`: one plain sentence, [mine].
- `for_client`: the same shape rewritten for a concrete small business of ANOTHER sector, with its first picture and its first words, in English — ready to film.
- `file`: the txt card; `quote`: a verbatim piece of the card (PROOF line or speech) under 300 characters; `line`: 2; `source`: advertiser + platform; `url`: the ADDRESS line for Meta, or https://ads.tiktok.com/business/creativecenter/topads/<id>/pc/en?countryCode=US&period=180 for TikTok; `read`: "whole"; `strength`: "solid" when a known real business with strong proof, "usable" otherwise, "weak" when you doubt it; `doubt`.
- two extra fields: `clean`: true/false — may the film be shown as an example to a devout Muslim family man (no immodest dress, no music video dancing, no alcohol); `beauty`: 1–5, how good an opening it is to a professional's eye.
Append rows as you go (after each five ads). Do not write rows from the card alone: look at every sheet.

Run the checker before you finish: `python3 -I /tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook/check_rows.py <your folder>`.
Final message, at most 45 lines: ads looked at / kept / left out by reason; the checker's line; the ten best openings (id, advertiser, one line each, why); the families you saw most and the one that surprised you; what could not be judged.
