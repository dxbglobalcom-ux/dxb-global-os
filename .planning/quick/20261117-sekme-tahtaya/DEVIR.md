# Hand-over — the WhatsApp tab's "Kur" and "Dene" rows are placed on the board

You are the successor of session f792823f (Fable 5.2), opened on his word of 2026-11-17 at Fable 5.2 · medium. Answer him in Turkish, short; your first reply states the position (core §0). Open the door `dxb-team3` for the job and `dxb-close-row` before you touch the board.

## His order, verbatim (ledger `tab-rows-placed-on-the-board-by-the-next-session-2026-11-17`)

> Start slope'u tabii ki ekle 84'e. Ayrıca yani bu bir sonraki session aç. O session'daki görevi bu olsun. Bunu Fable Medium yapsın. Yani orada kurulacak olan şeyleri satırda, tahtada nereye yerleştireceğini analiz etsin, kursun, yerleştirsin güzelce. Anlatabiliyor muyum? Yeni tahtada satır açılacaksa da onun için özel satır açsın. İlişkili satırda yazsın. Denenecekler, kurulacaklar, kurulsun. Şeklinde.

What brought it: he asked whether what his Excel marks "Kur" or "Dene" is written on the board, and who will know, when the time comes, that a thing is to be tried. The honest answer was: the Excel label wakes nobody; only the owning row's file does, because the session that builds a row opens that file first. So every such row needs its place there.

**My reading, not his word:** "kursun … kurulacaklar kurulsun" = the installs are placed on the board so that each is carried out when its row is built — not "install every tool now". He allowed one install today (camofox) and for the others said *"Nasıl yapılacağı o zaman kurulur"* and *"Vakti gelince yap, ölçülür"*. If you read it otherwise, ask him in one line before installing anything.

## The job

1. The source: `.planning/research/watch-links/2026-11-16-whatsapp/` — `rows/all.jsonl` (what each link is) and `plan.jsonl` (the lead's verdict, plan and board row; its `oneri` wins over the row's). 35 rows are "Kur" or "Dene" (run the count yourself; w090 became "Dene" today).
2. For each of the 35: is it already owned on the board — not by its name only, by its content (memory `part-already-owned-check`)? Read the row file it names. Where it is owned, make sure the row file carries what a builder needs: what it is, the install recipe or the trial, what stops at him. Where it is not, write it into the related row's file as a leg; where no row owns the subject, open a row for it (door `dxb-close-row`; the board row stays under 1,600 bytes, the detail goes to the row file).
3. Only strong candidates get a block (memory `tool-review-ends-as-an-install-block-not-a-report`); a row whose verdict no longer holds is told to him in one line, not silently dropped.
4. Each row in `plan.jsonl` gets its final `tahta`; the workbook's tab follows (door `dxb-watch-links` §4: the master, then his copy only when it is closed and its hash is the one you noted).
5. Tell him at the end, short: how many were already owned, how many you placed and where, which rows you opened, what waits on him.

## A crude first measurement (mine, 2026-11-17 — a name search, not a reading)

Of the 35, the tool's name appears on the board or in a row file for 26; for nine it does not: w006, w033, w037, w043, w050, w070, w077, w093-14, w099. The search errs both ways: a name on the board is not an install block, and w006 (the customer desk) was written into the revenue list under another name on 16 Nov.

## Already placed today — do not redo

- w098: claude-ads → `B28.md` (leg 2026-11-17) · camofox → `B30.md` (installed and measured; study card `study-cards/camofox-browser.md`) · Open-Generative-AI → B43's page (written by the other session).
- Freefield (a link he gave in the talk, not in the tab) → B43's page; recipe and trial in `study-cards/freefield.md`.
- w090: stop-slop → `B84.md` (leg 2026-11-17).
- B32: one approval inbox on his phone. B35: the hidden-screen leg.

## Rules that bit today

- **Another session (d0166f73) is rewriting B43's page and the studio personas.** Do not edit `.planning/board-rows/B43.md` or `personas/`; send it a leg by `SendMessage` (ListAgents shows it) and check its reply.
- Commit only your own paths by pathspec. The ledger is shared: read it again before each entry, append at its end.
- A line in a row file that rests on his word needs `<!-- CEO-OK: id -->` on that line, with the id in the ledger — the pre-commit ruler refuses it otherwise. A commit whose scope names a board row (`records(B30, …)`) needs that row's line on the board freshly edited.
- "Unfiltered" is not a reason to reject a tool; a boundary doubt outside his clear list is asked of him (ledger `unfiltered-is-not-a-reject-reason-2026-11-17`).
- Nothing is installed, bought or signed in to without his word.
