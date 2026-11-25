**Lines read:** 365 of 365, whole, in order. **Rows kept:** 75 openings (TEST, 75 different client trades) and 11 rules.
**Checker:** `openings.jsonl ok 75 {'TEST': 75}` / `rules.jsonl ok 11` / `ROWS 86 BAD 0`
Two fields go beyond the BRIEF: `client_trade`, and `also_tests` (filled on 22 rows, naming 29 tests). `why` and `for_client` are mine. No row is below 1.25 times its best rival. Eight rows are under 1.41 and say so in `doubt`.

**Ten most useful shapes** (winner against its best rival):
1. A simple {fix}, involving {odd part}, {odd part} and {odd part}, for {problem}: 1.41% v 0.71%. "An incredibly simple fix, involving 2 wedges, a candle and a strip of felt, for a door that sticks."
2. If you can't {see it}, it's because she's that good: 3.63 v 2.19. "If you can't find the scratch we repaired on this bag, it's because she's that good."
3. *Don't* {accepted good habit}. Here's why: 2.37 v 1.25. "*Don't* brush straight after orange juice. Or after lemonade. Here's why."
4. If your default answer to '{question}' is '{stock reply}', this might be for you: 1.43 v 0.78. "…'How's your back?' is 'Oh, you know'…"
5. Got {thing he owns}? You must read this: 1.41 v 0.77. "Got a flat roof? You must read this."
6. Usually {act} ruins {thing}. In this case…: won 2 tests. "Usually, pouring coffee over a pale sofa ruins it. In this case, we do it every morning."
7. I wouldn't {act} if I were you... it's not {obvious danger}, it's just...: won 3 tests. "I wouldn't put that in the wash if I were you... It won't shrink or anything, it's just..."
8. {Person} feared {X}. Instead, {other} said '{odd exact words}': 2.78 v 1.80. "He thought we were going to sell him a gearbox. Instead, we said, 'Come back in 15 minutes.'"
9. At first, I wasn't convinced. But then they show what this one does: 2.98 v 2.25, over its own earlier winning wording. "At first, I wasn't convinced. But then they showed me what this little machine does every night."
10. I'm not going to 'trick' you. It's {drawback}. But it's real for {people}: 3.57 v 2.20. "I'm not going to 'trick' you into watching this. It's about gutters. But it's real for every house on this street."

**Shelves filled (26):** odd_detail 12; story, fast_easy, insider 5 each; unfinished, call_out, objection 4 each; character, question, mistake, before_after 3 each; plain_gain, puzzle, crowd, ask, honest, trouble, odd_fact, enemy, test 2 each; expert, customer, warning, list, in_use, dare 1 each. As `shelf` none for versus, spectacle, offer, news, wish, yours, deadline, maker, borrowed, personal, joke, jolt, native, button, object (some stand as `shelf2`).

**What surprised me (counted; each headline once, winner against best rival):**
- A question mark, "you", and praise words make no difference: 29 to 28, 52 to 53, 21 to 24 tests where only one side had it.
- Three dots lose: 3 to 16 (z −3.0). A finished sentence with the secret left out does better. Shape 7 is the exception.
- The witness "I/my/me" wins 45 to 22 (z 2.8). About 20 features were counted at once, so one or two may be luck.
- Winners are not shorter: 15.5 words against 14.9. Eight words or fewer: 3 winners, 11 best rivals.
- Luck is large: changing "a" to "this" gave 2.92% v 2.12% (line 249), "the world" to "people around the world" 1.43% v 2.0% (line 320). Two headlines beat each other in turn (lines 314, 358). Trust gaps of 1.5 times the best rival or more (185 of 365 tests), or repeated wins.
- The "at least 1.4 times" is against all rivals together. Against the best rival alone the gap is under 1.25 in 58 tests.

**Not measured:** the best rivals' number of readers is not in the file, so single winner-rival gaps have no confidence interval. Tests that had no clear winner are not in the file either.
**Files:** `/home/dxb/.local/share/dxb/hook-lab/el/upw2/openings.jsonl`, `/home/dxb/.local/share/dxb/hook-lab/el/upw2/rules.jsonl`, `/home/dxb/.local/share/dxb/hook-lab/el/upw2/ledger.txt`
