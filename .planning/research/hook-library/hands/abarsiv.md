**1. Counts**
- Openings: 173, all TEST (MONEY 0, TENFOLD 0). Rules: 25.
- Checker: `openings.jsonl ok 173 {'TEST': 173} / rules.jsonl ok 25 / ROWS 198 BAD 0`
- Strength: 57 solid, 108 usable, 8 weak. Outcome: 56 sign-ups or leads (`replied`), 48 sales or gifts (`bought`), 47 clicks, 20 opens (`stopped`), 1 watched, 1 shared.
- About half the rows (90) are NextAfter, so charity weighs heavily. Each carries its total sample and confidence; the rest often have "N not given".
- Files: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook/el/abarsiv/openings.jsonl`, `rules.jsonl`, `ledger.txt`; saved texts in `p/`.

**2. What was read** (23 rows marked whole, 144 section, 6 second-hand)
- Whole:
  - Behavioural Insights Team organ-donor report; Optimizely's Obama 2008 post
  - 37signals' Highrise headline and person-page posts (articles, not all comments)
  - VWO cases (Movexa, Tulos, AwayFind, VenueSphere) and Imsider
  - MarketingSherpa "6 before and after headlines" and "30 powerful headlines"; MarketingExperiments "Site Headlines Tested" and "Optimizing Headlines"
  - Wikimedia 2011 test updates, June to August
- In part:
  - **NextAfter:** 3,948 experiment pages saved, every result table parsed by script, roughly 330 records looked at (my estimate, not a count). The full page was read for few, and wording inside pictures for none.
  - **MarketingExperiments:** 1,361 of 1,597 posts saved. About 35 read by passage, the rest only searched by keyword.
  - **Wikimedia:** 2010 test tables, reports 2012–2025, talk pages 2023–2025.
  - **Others:** Conversion Rate Experts (Moz, Voices, daFlores), Wiebe's Business of Software talk, Unbounce/Aagaard, AdEspresso (its result tables are images), Duolingo's KDD paper, Wired/Slate/ABC/Smithsonian on Obama 2012, Neil Patel's 100-case list.
- No rows from: GoodUI (pages open, but every number masked "XX.X %"), Bloomberg, The Atlantic (blocked), CXL headline posts, Copyhackers case pages, Campaign Monitor (404), HubSpot sender test, Groove, Litmus, Mailchimp.
- Not opened: Behave/WhichTestWon, WiderFunnel, Airbnb/Booking/Etsy, Khan Academy, Change.org, MoveOn, Adalysis. PPC Hero and Crazy Egg were saved but not used. Upworthy's archive was left out (dataset, not read).

**3. Ten strongest**
1. "If you needed an organ transplant, would you have one? If so, please help others." Registration 3.2% vs 2.3%, best of eight, N 1,085,322.
2. "If everyone reading this donated $5." 590 gifts vs 277 for "Only 4 days left", about 2.7 million impressions each.
3. "Please read: A personal appeal from Wikipedia founder Jimmy Wales." 3.68% clicks, 62 gifts; the best slogan got 0.25% and 5. "Please read:" alone won 6 of 6 pairs.
4. "Dear Wikipedia readers: We are the small non-profit that runs the #5 website…" About 3× the donations of the photo appeal in some tests.
5. "If you think you need rehab you do" (found by mining reviews). 400%+ more clicks and 26% more leads than "Your addiction ends here".
6. "Order in the next n hours for delivery today." +27% orders; "Thanks to our 600,000+ Facebook fans", +44% sales (daFlores).
7. "$50-off coupon" vs "15%-off": 170% more revenue, with opens and clicks equal.
8. "Dental Plans for $8.33 a month. Acceptance Guaranteed." +72.76%, best of six (preliminary numbers).
9. "Don't Break the Streak, [FirstName]!" +65.4% donations, N 48,607.
10. "Join 172,783+ professionals who achieved their goals by using the Self Journal." +26.8% sales, N not given.

Near misses: "Yes, I can give $25" button, +32.5% donations (N 113,294); "Get More Readers as Early as Tomorrow", +321%.

**4. Surprises and contradictions**
- **Only half the archive proves anything.** 2,015 of 3,947 NextAfter pages are valid at 95%; the treatment won in 1,488 of those. It is a published archive, so failures may be under-counted.
- **The winning click can lose the sale.** "Learn how" drew +43% clicks and lost sign-ups to "Get eBook" (+49%). Evo's revenue gap did not show in opens or clicks at all.
- **Plain offer beat promise and fear in ads**, against "sell the benefit". Benefit plus offer together won too (+55.6% clicks, Boys Town, N 956,322).
- **"Almost nobody gives" beat "everyone does"** for a free shared service, in dozens of Wikimedia tests. For organ donors the social line won, but fell below the control once a stock group photo was added.
- **Shorter is not better in appeals.** Wikipedia's minimalist banner lost 95%. Doubling the mobile copy (with a redesign) gave +40%.
- **Duolingo:** a new wording often lifts simply because it is new, so keep several and rotate.
- **A famous second-hand list is wrong.** Neil Patel's "100 case studies" tells daFlores' 44% test backwards; Conversion Rate Experts' own page says the 600,000-fans line won. Six rows still rest on that list and are marked second-hand.
- **"My" on buttons** won in English (+90%) and did not in Danish, according to its own tester.
- **"Humbly"** gave about +11% in 2022 and nothing in the 2023 retest.
- **The winning subject "Wikipedia was just a dream"** was called confusing by readers, yet "once a dream" lost 14–17%.

**5. Gaps, and what to buy or ask**
- **GoodUI membership:** the masked sample and effect numbers for its headline patterns (22, 27, 61). Price not seen.
- **MECLABS "Marketing Swipe File Bundle" and "Research-based Subscription Swipe File":** a free-download form on MarketingSherpa that needs an e-mail. They would give sample sizes and exact wording for about 25 of my rows.
- **Bloomberg 2012:** the 18 Obama subject lines with what each raised. Needs a subscription. I have only 3 sums and some of the rival lines.
- **Pictures:** many NextAfter, MarketingExperiments and VWO wordings exist only as screenshots. A visual pass over the roughly 1,400 valid NextAfter wins would multiply exact headlines.
- **Row caveats:**
  - A few rows carry a label or phrase rather than the full line, and one says so for a photo page; `doubt` names most of them.
  - Excluded on purpose: forex, loans, lottery, term-life, political-news and sex-offender headlines, most partisan NextAfter organisations, and before/after changes without a split.
  - Political senders remain where the wording is neutral: Obama's sign-up page and e-mails, Bush Center, Hoover, American Cornerstone; Care Net is a pro-life sender. Drop those rows if unwanted.