# Verification of the yt-3 study (Harry Sanders' 47 further YouTube videos) — 2026-11-23

Checked by a second reader against the study's own sources: the transcripts of `lists/harry-yt-new-2.files`
(`watch-links/2026-11-23-seo-geo/transcripts/hsyt-<id>.txt`), `youtube/harry.videos.tsv`, and primary pages on the
web read whole with the research door's `fetch.py` on 2026-11-23. Paths below are relative to
`.planning/research/watch-links/2026-11-23-seo-geo/`.

## 1. The material, recounted

```
list 47 files · all 47 present in transcripts/ · 43,255 words (study: 43,255)
ids cited in PLAYBOOK.md: all 47 of the list, none outside it
youtube/harry.videos.tsv: all 47 present; 46 with a view count, 60,702 in all (study: 60,702 across 46)
```

## 2. Claims checked at the transcript

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | C1: keyword "density of two to three percent" taught as the recommendation (not as a myth being refuted) | `oIeMGiRsq74` 00:04-01:05, whole video read | holds — it follows "hogwash" about stuffing and is given as the rule |
| 2 | C2: "the best backlinks are those with a large domain score" | `oIeMGiRsq74` 01:05 | holds |
| 3 | C3: a planned anchor mix — exact, phrase, partial, branded, naked — "for it to look natural" | `u50m7hO65mI` 01:01-03:04 | holds |
| 4 | C4: organic bounce rate "around that 60 % mark, 80 % okay … 95 %, 96 % you can start looking" | `f7VV_peYB7U` 03:02 | holds |
| 5 | C9: review wording "more important than the star rating"; "phenomenal, best" pushed up | `z6pwA_792Ew` | holds; minute **corrected** 03:04 → 04:04 |
| 6 | §2.1: robots.txt `Disallow: /` fixed to `/wp-admin/`; Settings → Reading → "discourage search engines … very common" | `kGaHHT8IIcU` 01:01-02:01 | holds |
| 7 | §5: kangaroo — the questions differ by country (AU "how to draw a kangaroo", US "are kangaroos dangerous"); 4th of July — AU "what is", US "is Costco open" | `noprSYGApa8` 01:02-03:02 | holds (both countries' first question is "what do kangaroos eat"; the difference is the second) |
| 8 | §5: "different domains, international href[lang]s … quite an exercise"; advanced US practice transplanted to Australia wins | `noprSYGApa8` 04:03-05:04 | holds |
| 9 | §5/§13: "in Australia … three companies doing SEO at a really good level … triple that in the UK … very few … scale out an SEO operation" | `wqqjqcn7uI0` 09:13 | holds |
| 10 | §13: plans affiliates two years ahead; "in two years I could sell this for … a couple hundred grand"; sold travel affiliates before COVID, tried to buy during it | `gvHI7n8dq8I` 06:05, 10:07 | holds |
| 11 | §13: Lawrence — buy "an affiliate website" to learn on ("something like a flipper"); the Academy leaderboard | `rigwQ9JnqN4` 03:03 | holds |
| 12 | §8: wine or a present after a link; editors run "three to ten different websites" | `jBOM4o7ftGU` 01:04 | holds |
| 13 | §9: "a million … transactions and a survey of over twelve thousand consumers from MIT"; licensing matters less than reviews | `z6pwA_792Ew` 00:02-01:02 | holds as his words |
| 14 | §4: SEOquake flags text-to-HTML ratio; meta keywords "not a ranking factor"; a green tick for `en-US` on an Australian shop | `zvii3qPiZm4` 00:07-02:08 | holds |
| 15 | C11 / §6: faceted navigation "canonicalizing back, which is really good" | `j0FyjKzo-UA` 02:17 | holds |
| 16 | C6: "they used to say … for people by people … now … for people" | `zErVdOEnb0Q` 00:11-01:11 | holds |
| 17 | §1: Lawrence — never seen a site rank well without links | `zErVdOEnb0Q` 03:11 | holds |
| 18 | §10: back up, do not update everything at once, PHP current, "koala boss" | `gMa_T2THIik` 04:08-05:08 | holds ("one at a time" is the study's paraphrase of "very slowly, methodically … don't try to update everything at once") |
| 19 | §13: the product-reviews update "really hammering hard on affiliates" | `xsRB-cls8sk` 01:11 | holds |
| 20 | §3: "historical data is good … make the change sooner" | `dVFNIQGsoRQ` 02:11-03:11 | holds |

## 3. Platform claims checked at the primary source

| # | Claim | Source read | Verdict |
|---|---|---|---|
| 21 | §5 hreflang: each version lists itself and all others; "if two pages don't both point to each other, the tags will be ignored"; `x-default`; ISO 639-1 with optional ISO 3166-1, never a region alone | developers.google.com/search/docs/specialty/international/localized-versions | holds word for word ("You can't specify the country code by itself") |
| 22 | §5 structure: ccTLD / subdomain / subdirectory pros and cons, URL parameters "Not recommended"; "Avoid automatically redirecting" — it can stop users and search engines seeing all versions; one language per page, no side-by-side translations | developers.google.com/search/docs/specialty/international/managing-multi-regional-sites | holds |
| 23 | §4: Google does not use `lang` attributes for a page's language | the same page | holds ("We don't use any code-level language information such as `lang` attributes") |
| 24 | §2.1 the five launch switches: WordPress 5.3 removed `Disallow: /` and outputs a robots meta noindex; for staging, an `X-Robots-Tag` header is advised | make.wordpress.org/core/2019/09/02/changes-to-prevent-search-engines-indexing-sites | holds (`noindex,nofollow` meta; the header method given for development sites) |
| 25 | §2.2: attachment pages off on new installs from WordPress 6.4; on upgrade the option is set to 1 | make.wordpress.org/core/2023/10/16/changes-to-attachment-pages | holds |
| 26 | §3: GA4 event-level retention 2 or 14 months (standard); governs explorations and funnel reports, not standard aggregated reports | support.google.com/analytics/answer/7667196 | holds; **added**: Large and XL properties are held at 2 months |
| 27 | §13: "Empire Flippers … average listing multiples of 2.3× … typical, 2.6× premium, 3.4× seven-figure premium"; FOR-THE-HOLDING: "Brokers price such sites at about 2.3-3.4×" | empireflippers.com/switching-to-annual-multiples (8 Sept 2026) | figures hold; **corrected**: one broker, average **listing (asking)** multiples across **all** the online businesses it lists, from its 2026 State of the Industry report — not content sites alone, not sale prices; the distressed figure 1.1× added |
| 28 | §6 / C11: faceted URLs — robots.txt disallow or URL fragments; canonical and nofollow "generally less effective in the long term" | developers.google.com/search/docs/crawling-indexing/crawling-managing-faceted-navigation | holds |

## 4. Against the holding's boundaries

- **Owned search assets** (FOR-THE-HOLDING idea 3, OPEN-QUESTIONS 3.1, `site-asset-diligence`): it already said
  "new work", "money out" and the Islamic boundaries, but its first test was "a desk read **now**".
  **Corrected**: the first test runs only on his word, and starts with the niches, affiliate programmes and any
  ad network tested against the Islamic boundaries before anything else.
- **Held:** the gift tactic is refused as a link scheme and as a hidden inducement (§8); review wording is not
  steered (C9); machine translation unread by a native reader and doorway copies per country are refused;
  `site:` on a prospect is named as client-finding that waits on his word; ccTLD purchases are money out.

## 5. Not verified

- The helpful content system's merger into core (trade press, March 2024); Gary Illyes at Pubcon 2023; MUM's
  announcement figures; mobile-first indexing's dates; Discover's image and policy rules; Google's review-content
  guidance; the FTC's 16 CFR 255; NBER w26601's figures; Bing's 2011 `content-language` post; UA's 1 July 2023
  switch-off — each named with its source in the playbook, not reopened here.
- Who narrates the five unnamed videos; "koala boss".
