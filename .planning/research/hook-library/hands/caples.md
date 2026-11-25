**1. Counts.** 109 opening rows: TEST 45, MONEY 64, TENFOLD 0. Strength: 46 solid, 52 usable, 11 weak. 40 rules.
Checker's last lines: `openings.jsonl ok 109 {'MONEY': 64, 'TEST': 45}` · `rules.jsonl ok 40` · `ROWS 149 BAD 0`.
- Some winners have several rows, one per test or source: money worries, $25,000→$50,000, cool quiet bedroom, mistakes in English, piano.
- About ten rows are bracketed descriptions of a tested offer, picture or format, because the book prints no wording.
- **Checker trap:** the raw `tam.txt` holds stray `<` and `>`. `check_rows.py` deletes everything between them, and at first failed 45 true quotes. Rows now cite `tam_no_angle.txt`, the same text and line numbers with `< >` turned to spaces. Any other hand quoting this book will hit this.
- I removed 11 rows: three were duplicates, the others had only "effective" or "recommended" behind them.

**2. What was read**
- Whole, in order: `tam.txt` lines 1–18266 (preface to index; ledger in `ledger.txt`). The OCR of headlines inside reproduced ads is partly unreadable. Captions are readable. My reading of the Jaguar questions and the Helmsley line is marked in `doubt`.
- In part: Oxford University Press preview of Battistella on Cody (chapter 1); Advertising Hall of Fame page (whole); SwipeHarbor (the runs); directresponsecontentmarketing (Schwab part); New Yorker "Soosh", 1932 (one paragraph).
- Not opened: WARC case, Schwab's 1939 article, Rowsome 1959.
- Web searches used: 6.

**3. Ten strongest (book page)**
1. "Feel pleasure you never knew existed" (Canyon Ranch, 1994): +97.4% inquiries, +50% conversion against "New life form discovered in Massachusetts" (p.236). First word is from the caption.
2. "IQ TEST ENCLOSED", a test for your copier (Pitney Bowes, 1995): +138% response over the control "Can You Afford A Dumb Worker?", and converted better (p.242).
3. "This is Marie Antoinette riding to her death": 8 times the coupons of any earlier ad for the books (p.186).
4. "How to have a cool, quiet bedroom—even on hot nights": 2.5 times the calls of "Get rid of that humidity" (p.250).
5. "52.7%" above the government standard: 150 carload orders in weeks. Softened to "over 50%", demand fell to a fraction (p.142).
6. "Dry Up Hay Fever": 380 against 297 requests for "Hay Fever", +27% (p.194). The only named headline pair with full counts.
7. "Car owners! Save one gallon of gas in every ten": +20% from two words, newspaper split run (p.194).
8. "FREE MONEY" (Chemical Bank): 578 calls and 349 applications in the first week, three insertions (p.65).
9. "A wonderful two years' trip at full pay": run for seven years (p.118). "How to get the Times delivered to your home": all type, beat every rival, running 14 years (p.213).
10. Bell Atlantic's plain full-disclosure mailing: beat the control, 5% return; four million sales in three years with its dated follow-up (p.120).

Also strong: Jaguar's six questions (2,700 test drives, over $15m sold), Fabrikant's "Lisa Cooper… $4,000 mistake" (advertising grew twelvefold in three years), and "Fix" for "Repair" (+20% orders).
Local-shop coupons with counts: bicycle (200+ coupons, over $14,000 on a $480 ad), free car wash (2,000+ returns), pizza (1,200+), fish 1¢ (1,100+), restaurant 2-for-1 (750+).

**4. What surprised me or contradicts what is taught**
- **"19½ times":** the book prints neither wording, product nor N. It is an anecdote.
- **The 36-headline test** (+300%, +200%): the winning words are not printed either.
- **N is almost never given.** Outside hay fever there are replies for an unnamed client's 11 full-page ads (191–867), Bermuda (<50 vs >400 replies) and headache (2 vs "slightly over a hundred").
- **The ten famous pairs (ch. 17):** only "by a wide margin", no ratio.
- **The 35 formulas (ch. 5):** their example headlines carry almost no results. They should not enter the library as proven.
- **"They laughed…":** nobody I opened has a count of replies or sales. What exists: "record number of coupons" and "several years" (Hall of Fame), and three dated appearances: April 1926, October 1926, November 1927 (SwipeHarbor). The New Yorker, 1932, counts about 65,000 students that year and almost a million since the school began 33 years earlier. Those are the school's numbers, not the ad's.
- **Sherwin Cody:** New York Times ads 1919–1959, two or three a year; 150,000+ students. "Do you make these mistakes…" was "the most often used and the most successful", not the only headline, so "never changed" is loose. Schwab (1939) is reported as nearly 3 times "How to Speak and Write Masterly English" over ten years; that is second-hand.
- **Independent account with N** for any of Caples' split-run pairs: one search, none found.
- **Advertising people guess wrong** about half the time (14 clubs, p.28).
- **Curiosity alone usually fails:** all ten collected failures were curiosity headlines and seven were negative. Two of the biggest modern winners (Canyon Ranch, Pitney Bowes) do use surprise, tied to a benefit or a test.
- **Same ad, other medium:** Fabrikant got practically zero extra in New Jersey suburban papers.

**5. Left out, could not get, to ask**
- Left out by the brief's rule: the finance-company loan ad (2.5 times; kept only as a rule with a warning), "I gambled a postage stamp" (ran for years; gambling word), SmithKline OXY prize draw.
- **To decide: life-insurance and retirement-income rows** (about eight), plus bank, stock-list and investment rows. The brief bans interest loans, not these; I kept them, the insurance and investment ones marked in `doubt`. He may want them out.
- **Use with care:** "RESPOND BY THURSDAY" (+39%) came from a computer error and is safe only with a true, clear deadline. "Do not say a salesman will call" (−75% coupons) is concealment; its row warns against it.
- **Years:** most are "not given". Years from outside the book are named as such, three of them marked UNVERIFIED; "c. 1977" (p.165) is my own reckoning from the book's "20 years".
- **Not legally readable in full:**
  - *How to Make Your Advertising Make Money* (Prentice Hall 1983, 383 pp.) is on archive.org for borrowing only. Used from $1.53 (Alibris); New York-style new copies from $14.14.
  - *Making Ads Pay* (Dover 1957/2011) was not found on archive.org. Used from $3.17 (Alibris), new $15.95 (Dover). Both are cheap; buy both. What they would add is UNVERIFIED.
- **Source status:** archive.org's own library copy of the 1997 edition (`testedadvertisin0000capl`) is marked access-restricted. I did not verify whether the open copy named in the task was uploaded with rights.
- **Primary data that may hold real N:** Caples Papers, Smithsonian, NMAH.AC.0393. Box 49 folder 13 is "U.S. School of Music, 1925"; Subseries 4.3 is "copy testing… results" with lantern slides. A scan request is the only route I found to real reply counts.
- **Also worth getting:** Schwab, *Printers' Ink Monthly*, September 1939; Battistella's later chapters.

**Files**
- /tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook/el/caples/openings.jsonl
- /tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook/el/caples/rules.jsonl
- /tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook/el/caples/ledger.txt
- /tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook/el/caples/tam_no_angle.txt
- /tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook/el/caples/web/