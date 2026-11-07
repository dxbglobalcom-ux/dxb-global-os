# The ChatGPT side — same question, 2026-11-07

Asked by the session in his ChatGPT (chatgpt.com, Thinking · High, web search) through the Claude-in-Chrome
tools; worked 5 min 28 s. The conversation stays in his ChatGPT history as "Viral Video Araçlarını Karşılaştırma"
(`https://chatgpt.com/c/6aef5678-8d24-83ed-86a8-f3809d433a63`). Condensed by the session; the source links live
in that conversation. These are ChatGPT's claims, compared with the fleet's rows in the table at the end.

## Its ranking (its own technical judgement, not a measured test)

| # | Tool | Strongest at | Cost (its figures) | Runs on our side |
|---|---|---|---|---|
| 1 | Apify MCP + `apify-ads-intelligence` skill | Meta, Google, TikTok, LinkedIn ad libraries behind one agent; start/end dates → days running | free $5 credit; Starter $19/mo; Meta actor ~$3.40–5.80 per 1,000 results | hybrid (actors in Apify's cloud) |
| 2 | ScrapeCreators social-media-research-skills | outlier-post-finder (against the account's own median), transcript intelligence, ad-library teardown | 100 free credits; $47 once for 25,000 | hybrid (their API) |
| 3 | Foreplay (Discovery, Spyder, Lens) | 200M+ saved ads, long-running filter, competitor tracking, "Winner Identified" when one of a batch survives | $59/mo; $175 with own-account analytics | SaaS |
| 4 | n8n | weekly loop: last-7-days stats + transcripts, week-over-week, AI analysis, report | self-hosted community edition | yes |
| 5 | Revid.ai | ~2.77M viral posts searchable; API/MCP/CLI; publish → results → remix | $39–199/mo | SaaS |
| 6 | AdSpyder | cheap multi-network ad search, running-time filter | $10–30/mo | SaaS |
| 7 | TikTok Creative Center + the official libraries | first-party Top Ads with CTR and 2/6-second view rates; free check of other tools' "winners" | free | view only |
| 8 | Adspy MCP | 30+ day Meta/Google ads inside Claude; weak usage evidence | $19–99/mo | hybrid |

Fully local extras it named: `davidteather/TikTok-Api`, `thenavidm/facebook-ad-library-mcp-cli`, `apify/awesome-skills`,
`lucaswalter/n8n-ai-automations`. Practitioner videos: Michele Torti's Meta ad spy build (Apify + Gemini + Sheets),
Julian Weber's TikTok Top Ads tutorial, an n8n weekly viral-research workflow (Reddit, 82 votes), a Meta ad audit
automation (Apify + Gemini + Gamma).

## Its method

- Keep `creative_id, advertiser_id, first_seen, last_seen, active_status, platform, format, hook, views_snapshot,
  source_url` per creative, so "still running after 30 days" is measured, not screenshotted.
- Two scores: a "proven format" score for others' content (research priority only) and a weekly-winner score for
  our own videos, compared within the same platform and length band: 7-day view velocity 30 %, retention 30 %,
  shares + saves 20 %, target conversion 20 % — its proposed starting weights, not validated.
- A running ad is not proof of profit; the winner is chosen only from accounts we can read.

## Beside the fleet (`final.md` in this folder)

| | ChatGPT | Fleet |
|---|---|---|
| Both | outlier against own median · ScrapeCreators skills · running time ≠ profit · Foreplay · Revid's MCP | same |
| Only here | Apify ads-intelligence (its #1) · n8n weekly template · scoring weights · AdSpyder · Adspy MCP · TikTok Creative Center | — |
| Only the fleet | — | yt-viral / ig-viral (MIT) · self-hosted meta-ads-competitor-tracker · competitor-creative-analysis (~7k stars) · rea-video · Meta Andromeda treats variations as one ad · library scraping hits 403 / IP blocks |

The holding's choice (his yes, 2026-11-07): free tools first, paid twins noted, the weekly loop on the holding's own
engine — n8n is not taken (no second job runtime, `.planning/research/STACK.md`); written into B28 and revenue list #22.
