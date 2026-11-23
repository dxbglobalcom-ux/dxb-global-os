# Verification of the carousel study (analyst C) — 2026-11-23

Checked by a second reader against the study's own sources: the four reader notes
(`watch-links/2026-11-23-seo-geo/notes/matt-carousels/read-0…3.md`), two slide images, the list
`lists/matt-carousels.tsv`, and five primary pages on the web. Paths below are relative to
`.planning/research/watch-links/2026-11-23-seo-geo/`; `read-1:59` is the line where that post begins.

## 1. The counts of §10, recomputed

A script of my own (temp folder, reading the list only) took the study's class lists from
`OPEN-QUESTIONS.md` §1 and the comment and like columns of `lists/matt-carousels.tsv`:

```
posts 40 · classed 40 · unique 40 · none missing · none extra
slides 313 · median 8 · min 2 · max 11 · total likes 134,092 · total comments 33,271
A 16  comments 2,389 / median 92.5   likes 106,226 / median 3,625.5   comments per like 0.02   like share 79.2 %
B 14  comments 23,706 / median 449.5 likes 25,788 / median 595        comments per like 0.92   like share 19.2 %
C  7  comments 6,084 / median 621    likes 1,589 / median 248         comments per like 3.83   like share 1.2 %
D  3  comments 1,092 / median 266    likes 489 / median 181           comments per like 2.23   like share 0.4 %
```

"Comments per like" is the class's comment sum over its like sum. The median of the per-post ratios gives
the same order (A 0.02 · B 1.15 · C 3.31 · D 2.27), so the finding does not hang on how the ratio is taken.
How the posts were classed: by the analyst, from each post's slides and caption — A the method complete on
the slides and no comment word; B complete plus a word for a link or fuller version; C the substance only by
DM; D his own offer. I re-read the last slide and caption of six posts (`DWK1aI_jUNo` B: TOPIC for the link
after a complete walkthrough, read-0:115; `DUqPtYGDbqe` C: two slides, no method, read-0:52; `DcN7G7uFVHE` C:
the strings only by DM, read-0:127; `DTbo3RwDdNY` A; `DaupsPsmd65` A: "check the caption", which carries no
code; `Dfmi5P6FSrb` A: no word, read-2:123) and agree with each. The subject table's sums add to the totals
(33,271 comments, 134,092 likes, 40 posts). The five repost ratios recompute exactly (19/21, 19/19, 51/43,
33/30, 174/70 %). Cover labels recounted from every slide 1: BREAKING 19 · SEO HACK 8 · WTF? 2 · EXPOSED 1 ·
plain 10. Re-hook slides: 11 posts.

## 2. Claims checked

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | C20: 3.83 comments per like when the slides teach nothing, 0.02 when they teach everything | list, recomputed (§1) | holds |
| 2 | C20: "the 16 posts that ask for nothing hold 79 % of the likes" | list, recomputed; last slides and captions | **corrected** — 106,226 of 134,092 holds; three of the 16 ask for a follow, so "ask for no comment word" |
| 3 | C21: reposts reach "a fifth to a half" of the original | list, recomputed | **corrected** — true in four of five pairs; the fifth drew 174 % of the comments, 70 % of the likes (same in the format specification) |
| 4 | C1: "Have AI get prices", "Plumber Service Request", the e-mail with "Businesses we couldn't reach", the s6 claim about ranking | read-1:59 (s2–s8), read-2:224–231 | holds |
| 5 | C1: AI Mode calls only when a business has limited information online; "Check for me"; up to 30 minutes; English, signed-in, 18+ | support.google.com/websearch/answer/17104441, read 2026-11-23 | holds; the page also offers "don't call" (used in correction 9) |
| 6 | C1: calls recorded; US except Indiana, Louisiana, Minnesota, Montana, Nebraska; Merchant Center stock not called about; e-mail or SMS; the opt-out path, "Please stop calling my business", STOP | support.google.com/business/answer/7690269 (the cited answer/16190256 redirects there), read 2026-11-23 | holds; address note added |
| 7 | C2: "How do customers usually interact…", DNS host `openai-business-profile.`, optional phone and e-mail, government-ID step, products and side panel, Mentions and Website clicks; Brand Insights, top 5 discovery topics; business agent fed with documents | read-2:123 (s5–s11), read-3:86 (s7–s8), `DfjwAyimfnp` s3, s5 in read-3 | holds |
| 8 | C3: Business Welcome Message limited to 120 characters | read-2:183, line 210 | holds |
| 9 | C4: the Bing path and loop (import from GSC, AI Performance, pages, "do more of that") | read-3:46 (s2–s7) | holds |
| 10 | C4: AI Performance a public preview of Feb 2026; Copilot, Bing AI summaries, partners; citations not clicks; grounding queries | blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview, read 2026-11-23 | **corrected** — the page names Copilot, Bing's AI summaries and "select partner integrations"; it does not say ChatGPT is excluded, so "not ChatGPT" became "ChatGPT is not named among them" (also FOR-THE-HOLDING idea 4) |
| 11 | C5: the repost re-dates the announcement (July 7th → July 30th) | read-0:21 s2; slide image `carousel/matt/DbbhwTbGfx_/slide02.png` | holds |
| 12 | C5: "Your YouTube content had 17.8K clicks", Web 13.7K / Video 3.89K / Discover 233 / Image 22; Top queries sorted by Impressions | read-3:59 (s5–s6) | holds |
| 13 | C6: AI-powered configuration, 4 Dec 2025, filters / comparisons / metrics, Search results only, cannot sort or export | developers.google.com/search/blog/2025/12/ai-powered-configuration, read 2026-11-23 | holds (the daily cap from trade reports unchecked) |
| 14 | C7: the repost's regex has `nearme|instock|sameday`; its caption has no code; the February caption has the spaces | slide image `carousel/matt/DaupsPsmd65/slide06.png`; list captions of `DaupsPsmd65`, `DUmnsqxjV3Y` | holds |
| 15 | C8: title ≤ 60, meta 120–156, 1,000-word minimum, 3–4 internal links, 1–2 external, 3–4 images WEBP, GBP link | read-1:73 (s2–s9) | holds |
| 16 | C9: "Delve into" / "In conclusion" / "Today's digital landscape"; the "biggest client" rule | read-1:129 s7; read-1:102 s8–s9 | holds |
| 17 | C9: Google's guidance — 4.6.5 / 4.6.6, manual fact-check, IPTC DigitalSourceType on AI images, AI product data labelled | developers.google.com/search/docs/fundamentals/using-gen-ai-content, read 2026-11-23 | holds |
| 18 | C12: whatismywebsiteabout.com, sitemap input, treemap 31.5 % / 127 pages | read-0:115 (s3–s5) | holds; its internal pointer "see C17" **corrected** to C18 |
| 19 | C14: linkseeker's PDF for "manicures" (43 pages) opens with a Tucson hotel article and a dermatology journal; the slides mix "pedicures" (38) | read-0:115–125 | holds |
| 20 | C18: the February 2026 update was Discover-only, "locally relevant content from websites based in their country", less clickbait, topic expertise | developers.google.com/search/blog/2026/02/discover-core-update (Thursday, 5 February 2026), read 2026-11-23; read-3:5 (s2–s9) | holds. The page adds a point the study omits: released first to English-language users in the US. The run dates 5–27 February come from trade press and were not checked |
| 21 | §10.1 cover labels; §10.2 eleven re-hook posts; median 8 slides | every slide 1 and slide line of read-0…3 | holds |
| 22 | "No face needed": the strongest posts used stock images or a logo on a building | read-0:5, read-1:59, `DTbo3RwDdNY` slide 1 | holds |

## 3. Against the holding's boundaries

- **Corrected — a test that would deceive third parties.** Idea 1's first test and the proposed row's step 7
  ran "Check for me" three times for a trade and town: each run makes Google phone real local businesses for a
  job nobody will buy. Rewritten to Google's own "don't call" option for the online read, and the calls logged
  as they arrive on the client's own line (FOR-THE-HOLDING idea 1, REGISTER-CHANGES row 49).
- **Corrected — a gate stated as open.** Idea 3 said sending brand previews to prospects needs nothing from
  the CEO; client-finding is held at "not now" by B84 decision 9 (README, SKILLS.md). Now it says it starts on
  his word.
- Held: the answering worker says it is AI and quotes only the client's signed prices; the carousel format
  refuses "BREAKING" on our own offer and untrue covers and needs no face; no synthetic person; guest posts
  only editorial with plain anchors; link swaps refused; no alcohol, gambling or interest-based business among
  the examples (plumbers, dry cleaners, a realtor, pizza).

## 4. Not verified

- Pomelli's launch countries and dates, Photoshoot of 19 February 2026, the 170+ countries (C16) — not opened.
- The ChatGPT business profile at OpenAI (C2) — the study already marks it third-party only.
- Search Console platform properties' blog and help pages and their dates (C5) — not opened.
- The Discover update's end date (27 February) and Bing's June 2026 additions (C4) — trade press, not opened.
- Meta's "engagement bait" page (C20 caveat); Qwen-Image-Layered (C17-b); whatismywebsiteabout.com's text.
- The re-hook and cover counts rest on the reader notes, not on all 313 images; two images were opened.
</content>
</invoke>
