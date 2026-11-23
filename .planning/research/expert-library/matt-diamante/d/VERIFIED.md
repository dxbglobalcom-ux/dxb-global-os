# Verification of the remaining-reels study (analyst D) — 2026-11-23

Checked by a second reader against the study's own sources: the reel transcripts
(`watch-links/2026-11-23-seo-geo/transcripts/matt-<code>.txt`), the profile list
(`profiles/heytony.agency.jsonl`), and eleven primary pages on the web, read whole with the research door's
`fetch.py` on 2026-11-23. Paths below are relative to `.planning/research/watch-links/2026-11-23-seo-geo/`.

## 1. The material, recounted

A script of my own (temp folder, reading the list and the profile only):

```
list 249 + 4 screen-only reels = 253 codes · transcript file present for all 253 · all 253 in the profile, all pt=clips
codes cited in PLAYBOOK.md: 162 distinct · cited but not among the 253: none
dates 2026-01-02 … 2026-10-07 · by month Jan 53 Feb 37 Mar 34 Apr 39 May 9 Jun 11 Jul 32 Aug 12 Sep 15 Oct 11
median 475 likes, 25 comments · profile: 565 posts, 283 reels, earliest 2026-01-02
findquestions.com named in 24 reels, first 2026-04-01 · AnswerThePublic in 14, last teaching use 2026-04-23
reels asking for a comment word: 10 — 0.40 comments per like (sum) against 0.03 for the other 243
```

The study's month counts (Jan 50, Apr 38) and medians (470 / 24) were those of the 249 transcribed reels while
the sentence speaks of 253 — corrected. The last line is my own measure of its "comments follow the word"
claim: the direction holds.

## 2. Claims checked

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | D1: the sixty-minute week — 2 min question, 20 min interview, 5 min three links, 15 min images, 15 min reading; "publishing the most real"; Todd's 60 % in his own words | `DXmXsDnDRY7` 00:44–03:50 | holds |
| 2 | D2: the $20,000 case 76 → 360 → 2,500 → 8,000, written by ChatGPT from three summarised pages; the agency's edited version | `DU5ZWXBiC2C` 00:00–00:47, `DVlK97Dj9Fr` 00:53–01:06 | holds; "a 2024–2025 result" **corrected** to "an older result (the reel gives no date)" |
| 3 | D3: three quotes from a podcast transcript, then the interview | `DUbWkFlj31Z` 00:02–00:46 | holds |
| 4 | D4: the $40,000 client lost traffic four months; the page made "slightly better", "left it alone for four months", one post a week linking back; "one page" | `DZ8Wa6SR6HA` 00:00–00:45, `DaDNcMxxF6b` 00:25 | holds. FOR-THE-HOLDING idea 2's "and nearly left" is not in the reel — **corrected** to "was angry ('they were pissed')" |
| 5 | D5: before deleting a page, check backlinks and traffic | `DTN8PvvDuhO` 00:05–00:20 | holds |
| 6 | D6: fewer than 10 posts on the blog index → 50 | `DWyT-jOjOSW` 00:14–00:18 | holds |
| 7 | D9: the "secret link" is Google's suggestion endpoint; 15 suggestions with `google:suggestrelevance` 601, 600, 562 … 550; `client=firefox` without scores | `Dc1RbQPR_w4` 00:11–00:30; the endpoint run by me for "plumber toronto", `hl=en&gl=ca` | holds exactly (same 15 suggestions and scores) |
| 8 | D10: "NA … means it has no difficulty … almost guaranteed to rank number one" | `DWvvEu2gGOR` 00:17–00:27 | holds |
| 9 | D14: 100 queries, 10 industries; most Overviews from one page; agreeing pages did not show; FAQ blocks mattered less; consensus then own claim; unstable sources | `DZXmZ4dxMog` 00:02–01:02 | holds |
| 10 | D15: Google cites his Facebook post, press release, podcast, YouTube; Bing his ten-minute reviews site; ChatGPT Reddit; "one press release per month" | `DbigxdoRjem` 00:04–00:33 | holds; its pointer "(see D24)" for the Reddit thread **corrected** to D30 |
| 11 | D16: the "King of AEO" method — DEO press release, videos, the site saying "originated by James Dooley"; the HVAC translation | `Dd4G_OjxOlz` 00:22–01:58; WBOC / Wedbush copies of the PRLog release found by search | holds (release dated 31 August or 1 September across copies) |
| 12 | D18: Search Console shows pages recommended by AI, not prompts; Bing shows grounding query, intent, topic | `DZLPKWsRNzN`, `Dcg3jtvxQfR` 00:02–00:33 | holds |
| 13 | D18: the generative-AI performance report — announced 3 June 2026; impressions; pages, countries, devices, dates; no clicks or queries; all sites by 31 August | developers.google.com/search/blog/2026/06/gen-ai-performance-reports; support.google.com/webmasters/answer/16984139 | holds; "31 August (trade press)" **corrected** — Google states it on both pages; "data from 18 May, no backfill" is not on them → unchecked |
| 14 | D19: GA4 → Traffic acquisition → source / medium → "ai-assistant" | `Dcg3jtvxQfR` 00:33–00:47 | holds |
| 15 | D19: GA4's AI Assistant channel, 13 May 2026, medium `ai-assistant` | support.google.com/analytics/answer/9164320 (What's new, 13 May 2026); answer/9756891 (channel definitions) | holds at the primary page. **Added**: the channel excludes AI Overviews and AI Mode — PLAYBOOK D19, idea 3, register additions 3 and 19 |
| 16 | D20: Settings → Search generative AI; the wrong choice removes the site from AI search | `DanRFdfxdO6` 00:05–00:19; support.google.com/webmasters/answer/16908024 | holds: include is the default; exclusion covers AI features only and is "not used as a ranking or inclusion signal" elsewhere; all sites as of 31 August (Google's note — "(trade press)" **corrected**); the UK test of June unchecked |
| 17 | D21: what shipped was a Lighthouse "Agentic browsing" category, a pass ratio, accessibility tree, layout shift, llms.txt marked N/A when absent; not a ranking update | developer.chrome.com/docs/lighthouse/agentic-browsing (and its llms-txt page), both dated 5 May 2026 | holds — "experimental", Chrome 150 or later, "rather than a definitive ranking"; the version 13.3 and PageSpeed Insights' adoption are not on Google's pages — **marked** trade press |
| 18 | D22: "getting rid of the search box" is wrong; the box was redesigned, "biggest upgrade … in over 25 years"; results stay | `DYnQvKcxBys` 00:00–00:42; blog.google/products-and-platforms/products/search/search-io-2026 | holds: "You'll continue to get a range of results from Search, just like you do today" |
| 19 | D23: ChatGPT ads — announced 16 January 2026; test for logged-in adults in the US, Free and Go; bottom of answers; ads do not influence answers | `DTl743vDaEH`; openai.com/index/our-approach-to-advertising-and-expanding-access | holds. OpenAI's own page also says ads "can be transformative for small businesses" — still no evidence of who buys first. Test start 9 February (Axios) not opened |
| 20 | D23: Yelp licenses reviews, photos and business data to OpenAI; Yelp-branded links; OpenAI controls presentation; not exclusive; "instead of Google reviews" is his inference | `DbTHneCxehj` 00:09–00:33; axios.com/2026/07/23/yelp-reviews-chatgpt-geo-partnership | holds ("does not preclude Yelp from making similar deals"). The February earnings disclosure and the 4 August spot check unchecked |
| 21 | D24: linkgap.io, 35 words, one backlink; "a bunch of people filled out this form and Google is using that data" | `DXam8TQjWjU` 00:09–00:48 | holds (his words); Navboost testimony — known 2023 trial record, page not reopened |
| 22 | D25: a domain registered five minutes ago shown in an Overview | `DeGOJv4tzfC` 00:01–00:26 | his words hold; the study's "the reel shows the answer, not the cited source" **corrected** — he says it cites the new site; the transcript cannot show it |
| 23 | D29: the reviews-domain duet; "35 people … in the last 28 days"; his 37-word AI-built site, no sitemap, not in Search Console, indexed after a link from his site | `Daxnu78xkMc` 00:00–02:21 | holds. FTC 16 CFR Part 465 (review suppression; company-controlled review sites) — the rule as published in 2024, page not reopened |
| 24 | D31: Reddit under the business name, "never mention your business name"; Facebook groups as the business, Hamilton Neighborhood Watch 109,000, search inside the group | `DUp8j-7jxJr`, `DXDDDsCAaTd` | holds |
| 25 | D33: "contact one per week"; "reach out to five of these sites" as the weekly task | `DXcW2yGkYOO` 00:48, `DX5HhGeS3Pp` 00:16–00:28 | holds |
| 26 | D34: unlinked.io — 300 found, 283 linking, 16 opportunities; Japanese lyrics and music news, a Brazilian motor festival, bookshops | `DXQU7BGjcf7` (screen reading) | holds against the screen reading |
| 27 | D36: the "dumb customer" prompt and the compare-to-#1 follow-up; the transactional prompt; trust facts 45 years, lifetime guarantee, $5 million insurance, 50,000 projects | `DcbzenPRBou`, `DeMgMjCRXYB`, `DcRM9h8x1yF` | holds |
| 28 | D38: YouTube 2,000 / 193,000; Instagram 550 / 779,000; TikTok 125 / 22,000; X 2 / 830; site 2,700 / 243,000; CTRs ≈ 1.0 / 0.07 / 0.6 / 1.1 % | `DbGz9kwR1rH` 00:00–00:25; arithmetic redone | holds |
| 29 | D44: "This ad has been running for a year and a half, which means this ad is converting" | `DUiORZLDY69` 00:33–00:41 | holds |
| 30 | D45: the Cowork prompt "assess the risk of updating those pages so that you don't lose rankings" — what row 62 rests on | `DdEgYNyRsxc` 00:21–00:36 | holds |
| 31 | §1: three of his four most-liked teaching reels / "likes follow the complete method shown on the screen" | profile; the four transcripts | **corrected**: the most-liked reel (`DaswoU8R3ox`, 56,839) is the social-accounts reel; the method reels are 2nd–4th and 10th; two of the four keep the prompt in a comment |
| 32 | §1: llms.txt taught (13 April), "Google is checking" (22 June), "you don't need llms.txt" (24 August) | `DXEVdGPgkgJ`, `DZ48xXMRKOU`, `DccFHX3RJXA` | holds |
| 33 | §1: AnswerThePublic replaced "on 1 April" | the subject search above | **corrected**: findquestions.com from 1 April; his last AnswerThePublic reel 23 April |
| 34 | §10: "Clients pay us $40,000 a year" for eight pieces and four links a month | `DbBE66gxO-I` 00:23–00:40 | holds |

Bing's AI Performance report (idea 3) — re-read at blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview
(10 February 2026): citations, cited pages, grounding queries "a sample of overall citation activity"; a later
post on the same blog adds Intents, Topics, Citation Share. Holds as idea 3 describes it.

## 3. Against the holding's boundaries

- **Corrected — client-finding stated as open.** Ideas 4 and 5 offered the customer-eye read and the
  rivals page as "a first message" / "a page for a prospect" with "Needs the CEO: nothing". B84 decision 9
  holds client-finding at "not now"; both now say it waits on his word.
- Held: the reviews site of chosen reviews, the Reddit review threads, the Maps directions trick, the
  self-awarded title and "recreate that ad" are refused with their sound versions; the named-method lane refuses
  untrue titles and releases with no news; the community answer is under the business's own name, no seeded
  questions, an AI writing as the business waits on his disclosure decision; the rival inbox is in the holding's
  own name, no false identity, no purchase only to read a funnel; paid wires, SparkToro and ChatGPT ads are
  listed as money out. No synthetic person; no alcohol, gambling or interest-based example.

## 4. Not verified

- The generative-AI report's 18 May data start and no backfill; the control's UK test; GA4's undercount (SEJ).
- Lighthouse 13.3 and PageSpeed Insights' adoption; ChatGPT ads' 9 February start; Yelp's February disclosure
  and the 4 August spot check.
- Claude Design (17 April 2026) — Anthropic's page not opened.
- SparkToro's free tier; the 2.9 % of Meta ads over 90 days (vendor blog); Google's October fact-check wording.
- The Jandovsky "$6 press release" account; the Reddit $60 million (2024 Reuters report, not reopened).
- His 100-query study, the comments he moved prompts into, Claude Projects caching — as OPEN-QUESTIONS says.
- The §1 subject table was spot-checked on one line (findquestions.com 24, by month) and not recounted whole.

## 5. What was not merged, and why

- The proposed new row of "Where the studies disagree" (interaction and AI files as ranking levers) is not a
  disagreement between studies — it is Matt against Google, already answered in PLAYBOOK D21/D24 and in rows 1
  and 25 as merged. The proposed addition to the "Comment a word" row confirms that row on a second format
  (measured above: 0.40 against 0.03 comments per like) but changes nothing in the lead's reading, and its
  wording about his "four most-liked teaching reels" was wrong. Neither was required.
