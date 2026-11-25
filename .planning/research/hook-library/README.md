# The hook library — openings that really won, and nothing that failed (2026-11-25)

The CEO's order (2026-11-25): only success in the library, read deeply, with its proof, every kind of opening, English
sources, ChatGPT beside us <!-- CEO-OK: hook-system-rests-on-proven-research-2026-11-25 -->. **Nothing is built into the
OS; this is the raw library.** It replaces the first scan (`../hook-evidence/`) wherever the two differ.

## The door
A row enters only as **TEST** (it beat a rival in a split run, A/B or randomised experiment), **MONEY** (its owner kept paying for it for years or many months,
or its sales result is published) or **TENFOLD** (ten times its own account's median, and liked: bought views are out), and only when its proof sentence stands
word for word in the saved source (`merge.py` looks every quote up). Every row says **what its win proves**: `words` = only the opening differed · `whole` =
the whole ad, letter, page or film won or kept running · `brand` = only the brand grew.
**His words of 2026-11-25** <!-- CEO-OK: hook-library-takes-experience-2026-11-25 -->: (1) nothing that failed stays, not even in the smallest part; (2) what
many experienced people say really worked enters too, as a method (`methods.jsonl`, below); (3) rows about insurance, retirement, stocks, banks and rows with a
political sender are out; (4) what works changes by sector, subject and product, and the worker picks by them.
So 1,784 gathered rows became **1,276**: 428 left (172 weak proofs · 158 wins that were not clean: lost on another count, beaten later, uncertain, trouble behind
them · 43 by subject · 55 no winning opening), each with its reason in `left-out.jsonl`; 80 told the same opening from another source (`also`).

## What is in it (counts of 2026-11-25, 12:35; `shelve.py` prints them)
| | |
|---|---|
| `openings.jsonl` | **1,276 winners**: TEST 516, MONEY 500, TENFOLD 260 · proves words 386, whole 812, brand 78 · solid 642, usable 634 |
| `INDEX.md`, `SHELVES.md` | **41 shelves in 7 rooms and one corner**: a shelf says why the person stops; per shelf the counts and the three strongest |
| traits on every row | `sells` (thing, service, place, software, learning, cause, media) · `price` · `result_seen` (now, later, unseen, itself) · `need` (urgent, everyday, considered, impulse, giving, attention) · `sense`; organic films also `depends_on`. On organic films `price` and `need` still describe the view asked, not the business: to be relabelled |
| `methods.jsonl` | **being made**: the methods that at least three independent trusted people say worked in their own work, or at least three clean winners show. The raw base, 685 rows of about 190 people, is `../hook-evidence/experience.jsonl` (not library) |
| `pick.py` | picks the parents for an order (film / text / mail / page, sector, job, known or unknown seller): strongest proof first, spread over the shelves |
| `RULES-CARD.md` | 495 rules read whole and brought down to 30. It still names where each rule failed: that part goes to the engineers' folder, the card keeps where a rule held |
| `pairs.jsonl` | 613 tested pairs, winner and loser side by side, for the scorer; **139 are clean in every way** (both wordings and both values looked up in the source, only the words different) |
| `hands/` | each hand's final word and ledger |
| `verdicts.jsonl` | truth check of 32 small vendors and preprints: 1 keep, 19 keep with a limit, 12 drop |
| `chatgpt-deep.md`, `beside.jsonl` | ChatGPT's deep report (201 searches), its 100 openings checked one by one: 39 right, 50 weaker than told, 10 wrong, 1 ours; 29 entered |
| `merge.py` → `shelve.py` | always both, in this order: gathers the hands' rows and checks each proof; then shelves, traits, strength, verdicts (`decisions.json`), repeats (`dupgroups.json`), what leaves |
| `collect/` | the collecting scripts: Meta Ad Library, TikTok Top Ads, viral Shorts, TikTok accounts, Upworthy's archive, frame sheets, transcripts |

Row fields: opening (verbatim; `[…]` = the source gives the result without printing the words) · picture · channel · seller · sector · year · door · beat · result ·
outcome · measured_by · family · room · shelf · shelf2 · proves · fits (any / known brand only / unknown seller) · traits · why (`[mine]` = ours) · for_client · source ·
url · read · strength · doubt · also; watched films also ad_id, beauty (1–5), clean (may the film be shown to anybody). Saved pages, books' text, films, frames and
quotes stay on this machine, outside git: `~/.local/share/dxb/hook-lab/` (`el/<hand>/` per hand; `file` is relative to it).
**The labels were checked:** 40 random rows labelled blind by the lead: 37 the same shelf, 39 the same or the neighbour, 37 the same proof label; two viral rows laid beside their frames: exact.

## The winners themselves, watched (frames of the first 4 s, card, machine transcript; sound not heard)
- **Meta: 286 of 288 looked at, 137 entered.** Video ads active 184+ days and high in their search's order by impressions, 16 in each of 18 sectors, out of 8,243 read.
- **TikTok ads: all 262 that could be had looked at, 78 entered, the weak ones (43) have left again.** Highest spend tier, top 5 % by clicks, out of 61,789 (`huggingface.co/datasets/liangyuch/ttcc-v0_2_0`). The list is dirty: resellers with taken films, false fronts, other languages, immodest.
- **Viral Shorts: 248 looked at, 201 kept.** 288 chosen from real trades and brands at ten times their own median; **30 were bought views** (Zillow 20 million views with 0.03 % likes, Wix, Airbnb, Shopify, IKEA) and went out: below 0.3 % likes = paid, 0.3–0.5 % or hardly any comment = weak, out.
- **Viral TikTok films: collecting** (`hook-lab/tt_org/chain.log`): about 730 accounts listed with views and likes (free, no login: `yt-dlp` on the profile; search by `opencli tiktok search`), at least ten times the account's median, 300,000 views and 2 % likes; about 400 to be watched.
- **Upworthy's archive: 730 clear headline winners read**, 150 shapes entered. Counted over all 843: "he/she" won 144 to 68, "I/my" 99 to 64; a line ending in "?" lost 29 to 64, Why/How first 12 to 28.
- **What the viral ones share in the first second** (six hands' own counts over 201): the thing or the work itself fills the frame in 124 of 201, a plain talking face in about one of five (35 of the 171 where it was counted); something is already moving or half done; a short plain label or no words at all; a question left open in the picture (will it hold, what is under it, what does it cost). A greeting: 2 named in 201.

## What a reading model can pick (measured 2026-11-25)
Opus 5.5 at medium, blind: **126 of 150** clear headline pairs of Upworthy's held-out file (84 %; when sure 14 of 14, when unsure 39 of 53) and **67 of 81** of our clean pairs it did not recognise (83 %). People: 45–52 %, the 38-rule model 65.1 %. **Limit:** the pairs are public and the winning headline is the one that was published, so part may be memory; the pairs are clear-cut ones. The scorer's bar is this, not 65.1 %, until it is measured on pairs no model has seen.

## Read, honestly
Whole: Caples' *Tested Advertising Methods* (18,266 lines), both Hopkins books, Sugarman's handbook, Schwartz's
*Breakthrough Advertising*, Ogilvy's ch. VI and five Ogilvy & Mather house ads, Schwab's 100 headlines, about 25 papers
(bodies), Motion 2026, both System1/TikTok reports, the BIT organ-donor and giving reports, both vaccine megastudies,
the MrBeast memo, and many case pages. Not whole: Haldeman-Julius (most chapters), most field-experiment papers (method
and results), the archives of NextAfter (3,948 pages saved, tables read by script) and MarketingExperiments. Not read:
Hormozi's hook playbooks, Kane's books, *Great Leads*, *Million Dollar Mailings*, Collier, GoodUI (masked), TikTok's 200 cases.

## What it already says (the lead's reading; the numbers stand in `RULES-CARD.md`)
1. **A hook is a family, not a mould.** Plain and loud, long and short, question and statement all have winners; what decides is the job (stop, click, buy, remember), the channel and how known the seller is.
2. **Plain beats clever where it was counted**, and the promise matters more than its wording (the same thing under another promise: up to 19½ times).
3. **The thing shown beats the thing said** in film: Dr. Best's tomato, Purple's egg, Blendtec, M&S's pudding; in the watched ads four of the ten best of one list have no speech at all.
4. **The product must be the striking moment** (Yang 2025; Zhang, Peng & Tan 2026; one experiment, small numbers).
5. **Early brand costs small brands sales** (System1 2025); entertaining openings suit small brands, hard sell suits leaders.
6. **Holding the many and selling are two things**: ads that kept only 8 % at two seconds stood in the top 4 % by clicks with 86 % of their clicks in the first three seconds: they named their buyer and let the rest go. Opens and views mislead in the same way.
7. **The largest proven gain in wording is a writer trained on tested pairs**: +32 % clicks over 36 campaigns and 283 million e-mails; plain ChatGPT added nothing (one author works for the vendor).
8. **Real lifts are modest** (126 trials of two public units: +8 % on average) and **luck is large** (one changed article moved a headline by a third): small gaps are not believed.
9. **Winners wear out**: the library must be refreshed; `collect/` is the tried way.

## Corrections to the first scan (`../hook-evidence/`)
- Figures dropped, sources not credible or not checkable: Hyperbeam (contrast, comparison), Advize, Galvor (start in the middle, acted problem), Haven, Scrptly, Kaufman, OpusClip, Ad Radar, GenSumo, 1of10, Realeyes, Mishra. The methods behind them live or die by the methods' door: comparison is told by 13 trusted people, starting in the middle or leaving it unfinished by 27, the trouble shown by 20, and each has its own winners.
- "Price first 1.53×", "As a dentist 3.16×", "If you… 1.29×", "words on screen 1.79×": small cells the same evidence contradicts; not used.
- Meta's paper does not show that the first three seconds drive conversions; Teixeira, Tucker, Molina, Mishra and Packard were misread (`hands/bilimvideo.md` §4, `hands/bilimsoz.md` §4).

## Still running and next
1. Viral TikTok films: the list, then watched by hands (`hook-lab/WATCH-ORG.md`), sifted (`KUSUR.md`), labelled (`OZ.md`), merged. 2. `methods.jsonl` from the four hands (`hook-lab/METHOD.md`, `el/yon1–4`), weighed by the lead. 3. Sector cards (18): what won there, the five strongest to show a client, the methods of that trade's owners, what it depends on. 4. The rules card without its failures. 5. The writer's rule: **no opening leaves the house without a parent row or a method of the library.** The scorer (Fable 5.2 · high) after 28 November.
6. To buy or get with one click, his word needed (prices seen): Caples' *How to Make Your Advertising Make Money* (used from $1.53) and *Making Ads Pay* ($3.17), Schwab's book ($24.99), *Great Leads* ($10–15), *Million Dollar Mailings*, *Hook Point* and *The Guide to Going Viral*, *From Poop to Gold*, *Writing for Busy Readers*; Brunson's "108 Proven Split Test Winners" and MECLABS' swipe files ask for an e-mail address.
