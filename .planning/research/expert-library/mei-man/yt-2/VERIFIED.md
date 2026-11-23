# Verification of the yt-2 study (Mei Man's other 19 YouTube videos) — 2026-11-23

Checked by a second reader against the study's own sources: the transcripts of `lists/meyt-new.files`
(`watch-links/2026-11-23-seo-geo/transcripts/meyt-<id>.txt`), `youtube/mei.videos.tsv`, her captions
(`lists/mei-ig-captions.md`), and primary pages on the web read whole with the research door's `fetch.py` on
2026-11-23. Paths below are relative to `.planning/research/watch-links/2026-11-23-seo-geo/`.

## 1. The material, recounted

```
list 19 files · all 19 present in transcripts/ · 34,627 words (study: 34,627)
ids cited in PLAYBOOK.md: all 19 of the list; two more named (HLoI-apde24, vCvTrakWHTU) as the channel's videos
without subtitles, not as sources
youtube/mei.videos.tsv: 36 videos (study: 36); none titled on cost caps or bid caps
"Those 20-30% increases won't cut it" — in her captions (mei-ig-captions.md line 320)
```

## 2. Claims checked at the transcript, and the arithmetic

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | §1: "at least a two day window where Facebook is recalibrating … increasing the budget, decreasing the budget, testing new ads, you essentially restart the learning phase" | `meyt-EdFB7QFwAzM` 00:40-01:30 | holds |
| 2 | §1: a 50 % drop for a day is left alone; down 50 % "for five days straight" is a problem; conversions reported late | `meyt-EdFB7QFwAzM` 02:50-03:10 | holds |
| 3 | §1: $300 → $350 brings a dip "that day and potentially the next … nine times out of ten" | `meyt-EdFB7QFwAzM` 05:50-06:50 | holds |
| 4 | §1: CBO two days; "I would even go as far to let things run for seven days" (opted-out users) | `meyt-EdFB7QFwAzM` 10:02 | holds |
| 5 | §1: "anything less than seven days you're royally [wrong] … sometimes even 14" | `meyt-NZjDPYgpiU4` 01:00-02:01 | holds |
| 6 | §1: the stop-loss — over $500, normal $50 per result, $450 after two days | `meyt-NZjDPYgpiU4` 02:01 | holds |
| 7 | §2: $500 / 40,000 impressions vs $50 / 5,000; the neon case — $100, 10,000 impressions, 8 sales vs $20, 2,000, 1 sale; homeowners not written off | `meyt-NZjDPYgpiU4` 04:50-06:20 | holds |
| 8 | §2: exact Poisson 95 % intervals 3.45-15.76 (8) and 0.025-5.57 (1); CPA ranges ≈ $6-29 and ≈ $3.60-800 | arithmetic redone | holds |
| 9 | §3: 5× at $10k → "4.8, 4.9, maybe 4.6" at $15k; the $9,000 / $300-a-day client at ~9× raised to ~$450, sales fell | `meyt-NZjDPYgpiU4` 07:01-08:01 | holds |
| 10 | §3: marginal ROAS 4.4 (at 4.8) and 3.8 (at 4.6); break-even 2.5 at a 40 % margin | arithmetic redone | holds |
| 11 | §3: "at most your ads will reach 10 % of that total population … slice of the pie" | `meyt-AiPXyOJcMfo` 05:03-06:04 | holds |
| 12 | §4: Breakdown as "my secret hack"; women 34-55 in the news feed → an audience of only that, news feed only | `meyt-C3DTsPWZL4A` 06:06-07:07 | holds |
| 13 | §4: "I have never seen a case where it spends like 50 % of my budget in … audience network if there hasn't been any conversions" | `meyt-iqv-6jD1gsA` 09:06 | holds |
| 14 | §7: "free shipping limited time only, ok so it's slightly misleading … okay to be vague about the timing" | `meyt-C3DTsPWZL4A` 01:03 | holds |
| 15 | §7: "$100 off is the bigger offer only when the price is under $333" | arithmetic | holds (30 % of $333 ≈ $100) |
| 16 | §8: four needs — comfort, staying healthy, relaxed, safe and secure; "stockpile on healthy snacks … ROAS of 24 for four weeks straight" | `meyt-QDcglPtOeCo` 03:04-04:06, 07:10 | holds |
| 17 | §9: "under five minutes are 12 times more likely to close"; the worst mistake is not answering | `meyt-dBsbkVDLswQ` 02:02 | holds |
| 18 | §6: views < likes < comments < saves, "a super like" | `meyt-WYqyukj8FY0` 07:07-08:08 | holds |

## 3. Platform claims checked at the primary source

| # | Claim | Source read | Verdict |
|---|---|---|---|
| 19 | §1: an ad set leaves learning "as soon as it can deliver stably … usually … after about 50 results in the week after the ad set's last significant edit"; Last significant edit and Results columns; avoid high ad volumes; realistic budget, no frequent budget changes; edit only with "reason to believe" | facebook.com/business/help/112167992830700 | holds word for word |
| 20 | §1: significant edits — targeting, creative, optimisation event, a new ad, a pause of 7 days or longer, bid strategy; by magnitude — spending limit, bid / cost / ROAS goal, budget ($100 → $101 vs $100 → $1,000); Advantage+ campaign budget: a campaign-level change may send several ad sets back; an ad-set-level edit does not reset the others | facebook.com/business/help/316478108955072 | holds |
| 21 | §4: the "breakdown effect" — "the misinterpretation that our system shifts impressions and spending into underperforming ad sets, placements or ads"; the $500 Facebook / Instagram Stories example ($0.35 vs $0.72 on day 1; final $450 at $1.46, $50 at $1.10); evaluate at campaign level under Advantage+ campaign budget, at ad set level under Advantage+ placements | facebook.com/business/help/770303663944673 | holds word for word. **Corrected** in REGISTER-CHANGES' fixture: the misreading cuts **Instagram** Stories (the higher average, $1.46), not Facebook Stories ($1.10) |
| 22 | §7: EU UCPD 2005/29/EC Annex I point 7 — "falsely stating that a product will only be available for a very limited time … in order to elicit an immediate decision" | eur-lex.europa.eu, CELEX 32005L0029 | holds (point 7) |

## 4. Against the holding's boundaries

- **Corrected — client-finding stated as open.** Idea 3 (conversation ads answered by our worker) named the
  holding's own office as the advertiser and listed identity and money only; ads run for the holding's office
  reach prospects and offering the product is client-finding — it now says it waits on the CEO's word
  (decision 9). Idea 2's audit finding "a prospect cannot argue with" now says it waits on his word when shown
  to a prospect.
- **Held:** invented deadlines refused (UCPD Annex I point 7, the holding's rule), with the real-date form; the
  "stockpile" angle refused as profiting from fear and hoarding; "incognito to avoid paying" refused; follower ads
  never worldwide-for-cheapness and never to minors; every edit in a client's account only under the client's
  written mandate; the seed audience is money out and waits on him. No fake review, no hidden promotion, no pitch
  in a person's name.

## 5. Not verified

- WhatsApp Business Solution terms on AI providers from 15 January 2026 (reported only); the HBR 2011 article's
  own text; Google's 22 April 2025 Privacy Sandbox update; Meta's teen ad targeting since February 2023;
  Audience Insights' closure; the Instagram hashtag cap; IGTV's history; Berger's Rule of 100 in *Contagious* —
  each named with its source in the playbook, not reopened here.
- Her figures (ROAS 13, 24, "12×", emojis +25 %, the pandemic statistics) are her claims, and none is used.
