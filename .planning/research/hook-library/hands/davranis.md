# Field experiments: what changed what people did

**1. Counts.** 100 openings (TEST 100, MONEY 0, TENFOLD 0) and 64 rules. Strength: 75 solid, 20 usable, 5 weak.
Checker's last lines: `openings.jsonl ok 100 {'TEST': 100}` / `rules.jsonl ok 64 {'-': 64}` / `ROWS 164 BAD 0`
- **31 of the 100 openings are descriptions, not verbatim.** The source described the winning message or picture but did not print it. Use those as shapes only.
- **Not all "acted" outcomes are purchases.** Many are payments, gifts, sign-ups, attendance or vaccinations. Several BIT and SBST rows test a new letter against no letter; that stands in `beat`/`doubt`.
- **The checker has a trap.** Its tag-stripper treats "p<0.01 … >" as an HTML tag and deletes the text between. My saved copies have `<` and `>` replaced by `‹ ›`; other hands with papers will see false "quote not in file".

Files: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook/el/davranis/openings.jsonl`, `rules.jsonl` and `ledger.txt` in the same folder; texts in `t/`.

**2. Read.** Most papers were not read whole, though the order asked for it. 75 of 100 openings carry `read: section`.
- **Whole or near whole:** BIT Charitable Giving 2013, BIT Update 2013-15, BIT Organ Donation 2013, Hallsworth 2015 (appointment texts), Grant & Hofmann 2011, both Milkman vaccine megastudies (without their supplements), Strohmetz candy study, Rogers & Lasky-Fink's two articles, Blamey stairs. The Goldstein towel and Cialdini wood-theft papers: method and results only.
- **In part (method wording and results):**
  - Behavioural units: BIT Fraud 2012, BIT 2015-16, BIT 2016-17, EAST 2024, SBST 2015 and 2016, DellaVigna & Linos.
  - Official letters and texts: Hallsworth 2017, Haynes, Dai, Danish NUDGE-FLU (abstract), UCLA texts 2024, Gerber, Ferraro, Allcott.
  - Giving: Gneezy 2014, Once and Done, Karlan-List 2006 and 2012, Sudhir, Shang-Croson, Kessler-Milkman, Karlan-Wood, Andreoni, DellaVigna 2012. Wikimedia fund-raising reports and its 2012 test diary were mostly read in order.
  - Shops and food: Hershfield, Nunes-Drèze, Sparkman-Walton, Cai, Homonoff, Poortinga, Bleich, Turnwald 2019, WRI names, sale signs, $9 endings (abstract), pay-what-you-want 2012, Qubit.
  - Language: Packard ×3, Berger-Fitzsimons, Sahni, Bertrand, Garner, Cochrane reply-rate review, gym megastudy (abstract), Reger (abstract).
- **Second-hand only:** Turnwald 2017 (via WRI), Irish Revenue Post-it and antibiotics letter (via EAST), the every-other-sentence fund-raising test (via a podcast).
- **Downloaded, not read or barely:** Ayres, Gosnell, Halperin, Fryer, Levitt, Karlan SMS, Bacon, Schultz 2007, Landry, Tucker, Damgaard, Simester 2015, Webb/Eves, Gonzales 1986, Ganzach.
- **Not opened at all:** Jalil, Gourville, Aguirre, Milkman 2011, Castleman-Page, and the books themselves.

**3. Ten strongest**
1. "If everyone reading this donated $5, we would only have to fundraise for one day a year…" — 1,041 gifts vs 579 (+80%), live Wikipedia test.
2. "Make one gift now and we'll never ask for another donation again." (envelope) — 0.66% vs 0.34% gave; $152,928 vs $71,566; 415,226 households got the line.
3. "A private donor … a grant … to cover all the overhead costs" — 8.55% vs 3.36% plain, 4.41% matched; 40,000 letters.
4. "$5 a day" — 29.9% signed up vs 7.1% for "$150 a month".
5. "We have reserved a place for you…" — 31.1% attended vs 13.9% (19.1% for the simplified letter without the line); N = 1,213.
6. "Cumberland-Spiced Veggie Sausage & Mash" vs "Meat-Free Sausage and Mash" — sales +76%.
7. "Please take a few minutes to complete this for us. Thank you!" on a handwritten Post-it — 76% vs 48% vs 36%. Irish Revenue firms: 36.0% vs 19.2%.
8. "Many of our customers like to leave money to charity… Are there any causes you're passionate about?" — 15.4% vs 10.8% vs 4.9%.
9. "…Not attending costs NHS £160 approx." — 8.4% missed vs 11.1%; held at 8.2% in a second trial.
10. "'I'd rather be waiting at the DMV during the holidays', said NO ONE EVER" — opened 29.5% vs 25.9%, clicks +17%; N = 70,896.

Close behind: "Please help us forget fundraising and get back to Wikipedia" +32%; "Dear Wikipedia reader" +15%; city named in the drive 5.51% vs 4.12%; "Previous Gift: <date>" +20%; two free stamps on a card 34% vs 19%.

**4. What contradicts the usual teaching**
- **Real lifts are small.** All 126 trials of two nudge units: +1.4 points (8.1%). Journal papers: +8.7 points. Promise clients 5-10%, not a doubling.
- **Faces.** A portrait helped a personal appeal (up to 30%) but the facts banner without a face drew 1.6-2.3 times the gifts. A stock group photo turned a winning line into a loser (2.9% → 2.2%; control 2.3%). A real colleague's photo doubled sign-ups.
- **Shorter is not always better.** A request e-mail cut from 127 to 49 words: 2.7% → 4.8%. Cutting Wikipedia's facts lost 31% of gifts. A longer e-mail won where a benefit had to be understood.
- **Winners wear out.** The founder's appeal was unbeaten in 2010; the facts banner beat it 3-4 times in 2012.
- **Pennies a day flips.** Daily won for app saving; monthly beat daily by 71% for charity.
- **Loss vs gain is not a law.** Equal in the large tax test; loss won for organ donors and US borrowers.
- **Norms.** "9 in 10 do" alone is weak (+1.3 points); adding "you are in the small minority who have not" gave +5.1, repeated the next year.
- **The line people like loses:** slogan liked 4.11 vs 1.91, only the disliked one changed eating (N = 59).
- **Envelope teasers:** no effect in Cochrane for surveys, yet "never ask again" doubled givers.
- **"Reserved for you"** won in 2020 but did nothing list-wide at UCLA in 2022-23 (262,085 patients).

**Do not use (failed, retracted or too weak)**
- *Page opened by me:* signing at the top (retracted); Ten Commandments honesty prime (replication run; result UNVERIFIED by me); watching eyes (two meta-analyses, no effect); identifiable victim in the lab (effect .000; the India mailing did work, 0.24% vs 0.09%); Wansink (retracted; excluded, including "limit 12 per person"); Guéguen (five more retractions); Langer's "because" copier line (cited copies failed); decoy effect (Frederick et al.: disappears with realistic products); Ariely anchoring (very weak on goods, none on lotteries); hotel "75% of guests" (two German hotels, no advantage); average effect of published nudges (title: no evidence after bias correction).
- *From the saved paper or BIT's words:* "be a voter" noun (Gerber 2016; abstract only); dynamic meat norm (BIT: "the jury remains out"); stairs signs beside a lift (+0.1% average).
- *From memory, UNVERIFIED:* money and social priming, ego depletion, jam choice overload.
- *Left out on purpose:* the "300 pennies" confusion trick, pique panhandling, the attractive-solicitor result, prize draws as offers.

**5. Not obtained**
- **Paywalled or blocked:** Turnwald 2017 full text, Reger 1998 body with its advertisements, Anderson-Simester $9 figures, Inman 1997, Sahni figures beyond the abstract, Bolkan & Andersen, Milkman supplement texts, Bleich 2012.
- **Book to buy:** *Writing for Busy Readers* (Dutton, 2023) for its trial tables; price not checked.
- **Best next dig, free:** Wikimedia's year pages from 2013 on, which report hundreds of live tests, and the linked banner pages, which carry wordings the diary only links to.