# Labelling the library's rows — the brief of the labelling hands (2026-11-25)

THE HOLDING: a digital holding that sells, among other things, an ad office, a video studio, a web office and a social-media
office to clients of every size and sector worldwide. Its hook library holds only openings that won; a worker who writes for
a client must find, in seconds, the winners of the right kind, and know what each win really proves. You give each row its
labels. You work for the chief engineer; he checks a sample against his own labels.

Read whole: `/home/dxb/.local/share/dxb/hook-lab/SHELVES.md`. Your rows: `in.jsonl` in your folder (one JSON object per line).
Read them with the Read tool in pieces and judge EVERY row yourself; no keyword rule, no script that guesses labels.

For each row write one line into `shelf.jsonl` in your folder (append after every 20–25 rows, with a small `python3 -I` script):
{"id": "...", "shelf": "<key>", "shelf2": "<key or ''>", "proves": "words|whole|brand", "fits": "any|known|new", "flag": "", "note": ""}
- `flag`: "" or one of: `haram` (the thing sold is alcohol, pork, gambling, interest lending, immodest) · `deceives` (the opening worked by a lie: invented urgency, fake sender, false front, hidden advertising) · `norival` (called TEST but the "rival" was no ad / people who did not see it, so no opening was beaten) · `nowords` (neither the words nor the picture of the opening is there: nothing a writer could use) · `notopening` (it is not an opening: a price test, a channel test, a closing line).
- `note`: under 120 characters, only when needed (why the flag; or "no shelf fits: …").
`proves` is decided from `beat`, `measured_by`, `result` and `doubt`, not from the door's name: a TEST in which two whole films or two whole letters met is `whole`; a split run of two headlines over the same text is `words`.

When done, run: `python3 -I /home/dxb/.local/share/dxb/hook-lab/raf/check.py <your folder>` and correct what it names.
Never `cd` in a compound command; absolute paths; never `rm`; change nothing outside your folder.
Final message, at most 30 lines: the checker's line; how many rows per shelf; how many `words`/`whole`/`brand`; every flagged id with its reason; the shelves whose border was hard to see and how you decided; rows no shelf fits.
