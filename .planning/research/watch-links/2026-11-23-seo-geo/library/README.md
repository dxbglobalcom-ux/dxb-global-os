# Backlink / listing source library (B84 foundation presence)

File: `backlink-sources.tsv`. It has 162 rows, one for each unique site or registry type, with 14 columns. Inputs: `rows/a.jsonl` (s02, s03, s04, s05, s06), `rows/b.jsonl` (s22, s19, k01, k02, k03), `notes/k03-50-backlinks.md`, and the captions in `profiles/harrysandersseo.jsonl` (sources written as `harry:<post code>`). Compiled 2026-11-23.

## What was measured, and how

- **Method.** Each measurement used curl with a desktop Chrome User-Agent and a 20 s timeout, with no login. It read the raw server HTML of one public listing/profile/article page on each site and recorded the `rel` of the outbound link to the listed company's own site. For a few sites a browse page was fetched first only to find a real listing URL. No JavaScript was executed. Nothing was signed up, submitted or posted.
- **Results.** 48 sites have a measured rel value. Two of them come from earlier work. Chrome Web Store was measured in s02 and re-measured today: `ugc nofollow`. Thread Reader App was measured in k01: no rel.
- **Count by rel value:**

| rel_measured | sites |
|---|---|
| follow (no nofollow/ugc/sponsored on the link) | 25 |
| nofollow | 20 |
| ugc nofollow | 1 |
| follow\|nofollow (mixed on the same site) | 2 (Tiny Startups, TinyLaunch) |
| not-measured | 114 |

- **Why 114 are not measured:**
  - 32 sites returned HTTP 403 to curl (bot wall). These include Trustpilot, Clutch, G2, Capterra, GetApp, Software Advice, TrustRadius, Crunchbase, Product Hunt, Medium, Reddit, Quora, Yelp, BBB, Behance, AlternativeTo, SourceForge, Bookshop.org and Forbes.
  - 6 returned 429/5xx/202.
  - About 10 are client-rendered, so the raw HTML has no anchors. Examples: Gumroad, Kaggle, Tech in Asia, SAM.gov, HackMD.
  - About 25 pages were fetched but held no outbound link to the listed company.
  - 2 link only through an internal redirect: Sitejabber (now SmartCustomer) and BetaList. Both redirect anchors carry `rel="nofollow"`. They are recorded as not-measured, as the brief requires.
  - 19 were not fetched at all. These are mostly the small editorial and podcast names from s05, plus generic registry types.
  - Local map platforms (Google Business Profile, Apple Business Connect, Bing Places) are data listings, not links.
- **Limits.**
  - "follow" means only that the server HTML anchor has no nofollow/ugc/sponsored. It does not show whether Google indexes that page, whether JavaScript changes the rel later, or whether a newly created profile gets the same treatment as the sampled one.
  - The `dr_claimed` numbers are the creators' claims (Ahrefs). None was re-measured.
  - The `cost` and `gate` columns come from the sources and common knowledge. Nothing was tested by signing up, and `unknown` means unknown.

**Count by category:** press 33 · review-site 24 · profile-page 15 · publishing-platform 14 · launch-site 12 · startup-database 10 · business-directory 9 · ai-saas-directory 9 · government-register 9 · dev-community 8 · web-directory 6 · local-citation 5 · image-site 5 · forum-qa 3.

## The 20 strongest sources for a new site (from the measurements)

A ranking link needs a measured follow and a page a new business can actually get. The other entries carry AI-citation or entity value; their own rows say so.

1. **buy.NSW supplier hub** (and other Australian state supplier portals). The "Go to supplier website" link is followed, on a .gov.au page. This is the strongest link measured. It needs an Australian ABN, so for the holding it depends on the country.
2. **ProvenExpert.** The business profile's website link is followed. The profile is free, so the reel's claim holds.
3. **Google Business Profile.** It is not a link, but it is the strongest local and AI signal (Harry: S tier).
4. **Trustpilot.** Not measured (403). It is cited by AI on buying queries (s22/k03 claim). Real reviews only.
5. **G2 / Capterra.** Not measured (403). They are cited by AI for software (s22). One Capterra listing also feeds GetApp and Software Advice.
6. **Clutch.** Not measured (403). This is the review profile for agencies, and it feeds The Manifest.
7. **Product Hunt.** Not measured (403). It is a source of AI citations (s22, vendor case study), and its launch title can be phrased as the category search.
8. **DEV Community (dev.to).** The profile website link is followed.
9. **Hashnode.** Profile and blog links are followed.
10. **HackerNoon.** Profile links are followed. Stories go through editor review.
11. **YourStory** (India). The company page's website link is followed. Pages are editorial.
12. **Findly.** The "Visit website" link is followed. Free listing.
13. **LaunchAF.** The "Visit website" link is followed. Avoid its footer "dofollow directory" ring.
14. **SaaSCity.** The product page link is followed. Sponsored slots are marked `sponsored`.
15. **Pitchwall (formerly BetaPage).** The product page link is followed. betapage.co redirects there now.
16. **TrustMRR / Indie Page.** Links are followed. TrustMRR is for startups with verified revenue.
17. **Pinterest business profile.** The claimed website link is followed in the server HTML. It also brings referral traffic for e-commerce.
18. **Hacker News (Show HN).** Front-page story links are followed. This is earned through votes, not owned.
19. **Earned press** (Inc42, GeekWire, Entrepreneur, Starter Story). Body links are followed. This comes from digital PR, which Harry and k02 both rank highest: original data turned into a story pitched to journalists, through SourceBottle, Qwoted or Featured.
20. **Wikidata / Crunchbase.** Their links are nofollow or not measured. They are listed for entity value: knowledge graphs and AI use them to confirm the business is real. Wikidata only accepts notable entities.

## Worthless or risky

- **OpenFuture (k03).** The homepage carries about 1,845 followed links, many to gambling and betting sites (fun88, v9bet, tài xỉu). This is a link-farm neighbourhood, and gambling is outside the Islamic boundary. Excluded.
- **Distribb "Backlinks Exchange" (k02).** These are automatic A→B→C link swaps. Google's spam policy names this as a link scheme ("excessive link exchanges"), so a client site risks a manual penalty. Never used.
- **"Dofollow directory" rings.** The LaunchAF footer links easydofollow.dev, dofollow.tools, boostdomainrating.com and verifieddr.com. Harry also names DR-boost packages (Dei5NbaDvdI), "20,000 social signals for $10" (DfjRMBBpc4b) and the expired-domain trick (DfomYCRG0C6). All of these sell a number, not trust.
- **Fake newsletters** (s05's suggestion). These are spam and dishonest. We publish real content only.
- **Fake or incentivised reviews** on Trustpilot, G2, Capterra, Clutch, Yelp and ProvenExpert. Forbidden. Only real customers may review.
- **Planted Reddit or Quora comments and sock-puppet accounts.** This is deception, and Harry reports it backfiring (Reddit's share of ChatGPT citations fell about 86% in Aug 2026 per Promptwatch, unverified). Only disclosed, genuinely useful answers.
- **Sources the reels call "backlinks" that are nofollow when measured:**
  - Chrome Web Store (s02: "DR 99 backlink"): `ugc nofollow`.
  - GitHub: `nofollow`.
  - Wikipedia: `nofollow`.
  - Hugging Face community articles (s22): `nofollow`. The HF page can rank, but the link passes nothing.
  - Flickr: `nofollow`.
  - Indie Hackers, Latka, SaaSHub, Built In, Serchen, Techreviewer, Alternative.me, Aixploria, Digital Agency Network, Designer News, WIP, Failory and SimilarSiteSearch: all `nofollow`.
  - TechCrunch in-body links: `nofollow`.
  - Sitejabber and BetaList go through a redirect carrying nofollow.
  - These still have brand or AI-citation value, but they must not be sold as ranking links.
- **Weak even when followed.** Thread Reader App is a thin mirror of X content that Google may discount. Linktree, Carrd, Blogger and GitHub Pages are self-made pages. Image sites (Imgur, Pixabay, Pexels) add little.
- **Doubtful claims.** "Indie Niche DR 93" (s05) is implausible. Tiny Startups and TinyLaunch give a followed link to only some listings, probably paid or featured ones (not confirmed).
- **Wikipedia.** Never self-written (conflict-of-interest rules), and it is nofollow anyway.

## The listing kit (from k03), filled once per business

Each listing job fills this form once. Every site then gets the same facts, and the name and description stay identical everywhere (NAP consistency).

| Field | Rule |
|---|---|
| Company name | Exact legal or trading name, the same everywhere |
| Website | Canonical URL (https, one host) |
| Support email | Role address on the company domain |
| Tagline | Under 60 characters, phrased as the search to win (e.g. "AI note taker for sales calls") |
| Short description | 160 characters |
| Long description | About 150 words |
| Category | Primary category, plus 1–2 secondary |
| Pricing | Model and starting price, or "free" |
| Key features | 3–5 bullets |
| Logo | Square 512×512 |
| Banner | Wide, 1200×630 or larger |
| Screenshots | 3–5 |
| Founders | Names (real people) |
| Year started | YYYY |
| Location | City, country; full address and phone for local listings |
| Social links | Official profiles only |
| Registry IDs (added by us) | Company/tax/registry numbers where a government register asks (ABN, UEI, licence no.) |

The run order follows k03. Start with the highest measured value, not the highest claimed DR. Stop at every human gate: email code, captcha, phone, payment, identity or company registration. Money out and identity steps go to the CEO. Never pay, and skip any site with no free option. Keep a log with these columns: site, status (live / waiting for review / needs human / skipped), and profile URL.
