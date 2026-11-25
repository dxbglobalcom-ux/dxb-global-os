**1. Counts**
- 18 openings, all TEST: 0 MONEY, 0 TENFOLD. 65 rules.
- Checker's last output: `openings.jsonl ok 18 {'TEST': 18}` · `rules.jsonl ok 65` · `ROWS 83 BAD 0`
- The rules file is sorted by `trust_rank` (1 = where I would first put a client's money). Every row says randomised or not, which outcome was measured, and where it failed.
- Files: /tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook/el/bilimsoz/openings.jsonl · …/bilimsoz/rules.jsonl · …/bilimsoz/ledger.txt (what was read, source by source)

**2. What was read**
- **Whole body (references skipped, no online supplement):** Gligorić 2023, Jung 2022, Robertson 2023, Aubin Le Quéré & Matias 2025, Peters 2026, Banerjee & Urminsky correlation paper (March 2026), the Yale paper (Wang, Sudhir, Zhou 2025, with appendix), Shulman 2024, Upworthy data paper and its update, Toubia 2021 (body).
- **In part:**
  - Text and main results read, some pages or appendices not: Banerjee & Urminsky January 2021 draft (appendix word tables skimmed), Tan 2014, Berger & Milkman 2012, Nickl 2025 (end of discussion not), Berger-Moe-Schweidel, Molina, Mandler, Packard & Berger "you", Angelopoulos/Lee/Misra.
  - Selected parts only: LOLA (algorithm sections not), HypotheSAEs, Lee-Hosanagar-Nair, Ghibellini & Meier, both TikTok preprints, Maiorano, Lemaire/Yin/Netzer, Fang et al. retail experiments, Meta AdLlama, Mercari, Kutzner, Packard & Berger concrete (working paper), Meguellati, Ushno.
- **Abstract or extract only:** Fang & Wheeler 2026; Kalyanam/Thomadsen/Zhao 2025; Lai & Farbrot; the Yale article on serial fiction (its SSRN paper not opened).
- **Not at all:** Banerjee & Urminsky 2024 final text (the file on disk is the landing page).
- Papers already on disk were read from disk; most of their DOI addresses were not reopened.

**3. Ten strongest openings**
1. Landing: "No stress with cleaning…" + button "A clean apartment without any stress": 59 % pressed, against 45 % and 45 % (randomised, 956 visitors over eight pages).
2. Landing: "Dreaming instead of Cleaning" + button "At last, time for dreaming": 58 %, against 51 % and 42 %.
3. "Why Yoko Ono Is The Only Thing Standing Between New York And Catastrophic Gas Fracking": 34/2,734 clicks, against 19/2,639 and 15/2,675.
4. "A senator's surprise call for filibuster reform…": CTR 4.441 %, against 2.827 % with the bill number and without "surprise".
5. "Meghan and Harry are talking to Oprah. Here's why they shouldn't say too much.": 2.373 %, against 1.768 % for the question version.
6. "I Knew Which One She's Pick, But It Still Crushed Me" (sic): 1.10 %, against 0.85 / 0.83 / 0.66 %.
7. E-mail: "You've been selected to shop sunny-day styles for less…" beat the same offer without those words (size not printed; only usable if true).
8. E-mail: "You're getting up to 60% off clothing & shoes for Easter" beat "Get ready for Easter family photos…" (size not printed).
9. E-mail: "You've lucked out: up to 70% off home musthaves" beat "Ready to redecorate?…" (size not printed).
10. "COMPLETE THIS SENTENCE: Crafting is best with ____": 416 comments, against 132 and 12 (matched, not randomised, and fewer likes than both).

Items 4-5 were transcribed by eye from a figure. I left out Gligorić's printed pair (12.3 % against 5.5 %) and a few others for their subject.

**4. Surprises and corrections to the first round**
- **The biggest proven wording gain is a pair-trained rewriter, not a rule.** Over 36 campaigns and 283 million e-mails, clicks rose 32 % and 35 of 36 campaigns won. Plain ChatGPT gained nothing. One author works for the vendor.
- **Very few rows measure buying.**
  - Randomised: thin product pages filled in, sales +6.5 % (+2.1 % overall); a benefit beside the discount, more sign-ups and retention; a cut-off teaser at the pay step, 18.3 % against 33.3 % bought.
  - Flat on buying: e-mail titles that raised taps 24 %; push messages (orders up, sales not proven); AI Google titles (views −7.7 %, clicks −10.3 %).
- **"We analysed N posts" studies** point the wrong way 20 % (Upworthy) to 50 % (398 outlets) of the time against real tests. Ushno's preprint is milder. This weakens every observational row, the TikTok, Facebook and Twitter ones included.
- **Emotion splits by job.** Click: sad +, fear −, anger 0. Finish: worry and anger +, sad −. Share: anger, awe and usefulness +, sad −. First-round F11 blurred this.
- **"You"** is null or negative on headlines, but it is what the winning e-mail model adds. Digits win on news but are what that same model removes. The channel decides.
- **Concreteness (F6):** 50.9 % of tests were too concrete, 8.7 % too vague. The gains, 5.5 % and 9.9 %, hold only at the extremes.
- **Photo or picture words** were the strongest feature in HypotheSAEs (+26 points, though rare). F9 left it out.
- **F10 is wrong as written:** Molina's win for plain headlines compared different stories. With the same story there was no difference at all (N=249).
- **First-round contradiction 1 is wrong:** in Mishra's own numbers "you" (0.039) beats the question (0.036), and how-to (0.029) is lowest.
- **F14:** Nastišin did find that stronger feeling goes with more views (two of three tools). The correlation of 0.02 stands.
- **F20:** the file on disk held no paper. I read the $32.73 → $42.80 in the authors' working paper: not randomised, 13 % in the careful model.
- **Misnamed files:** clickplos.txt is Jung et al.; banerjee_urminsky_plos.pdf is Gligorić.
- **The one strong pro-question test** (Lai & Farbrot: +137 % and +257 % on small ads) is tiny, not randomised by person, and reversed for a washing machine.
- **Testing:** seven looks at a running test invent a winner 16.32 % of the time instead of 5 %. Students, journalists and heavy readers all pick winners at about 50 %.

**5. Could not get; what to buy or ask**
- Banerjee & Urminsky, *Marketing Science* 44(3), 2025, 566-592 (prices not seen): replaces our draft rows with 50 features on the full archive. Cheapest way: e-mail the authors, or take the code and data at osf.io/v3zu5.
- Fang & Wheeler, *J. Consumer Psychology* 2026: the size of the question effect (data at osf.io/mgeqx).
- Kalyanam/Thomadsen/Zhao, SSRN 5338643: SSRN and WashU both refused. Its winning mail texts are the most useful missing item, because it is a purchase test. Ask the authors.
- Lai & Farbrot full text (Taylor & Francis), Haans 2013, and the online supplements of Shulman, Peters, Robertson and Aubin Le Quéré.
- Replication data for the +32 % e-mail study: doi.org/10.7910/dvn/lpaelj (seen in search, not opened). If subject-line pairs are in it, they are the best training bank for our own improver.
- Not found by these searches: a public randomised test of spoken first lines with watch time or sales, or a large public ad-copy archive with purchases.
- An empty file FINAL.md lies in my folder; I did not write it and left it.