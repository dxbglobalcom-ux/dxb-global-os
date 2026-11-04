# The platforms DxB Web Studio connects to — helper research, 2026-11-03

Read-only helper (Opus 5.5 · medium), briefed by the lead in the Web Studio plan talk. His words: "örnekler olarak hangi platformlara bağlanacağız". Repo figures measured with `gh repo view` on 2026-11-03; prices from each vendor's own page fetched with `fetch.py --batch` (raw pages: the session scratchpad `aw/` and `pr/`). The Awwwards weights were re-read by the lead from the fetched page (Design 40 %, Usability 30 %, Creativity 20 %, Content 10 %).

## 1. Already in the holding

- B43's platform hub (`.planning/quick/20261017-studio-platform-hub/FINAL.md:17,27`): fal, Runware, WaveSpeed, kie.ai, MiniMax, Higgsfield, Replicate — media generation only; approved 18 Oct as "open and connect accounts only, no top-up, no trial"; nothing built. No overlap with a web platform.
- B30 (board:129): Agent-Reach, Scrapling, scroll-craft installed; none is a web platform.
- W-C42-4 (board:302): zero ad or revenue connectors; its first planned build P38-2 is a read-only WooCommerce connector (the holding's one store runs WooCommerce).
- B83 (board:149): lines H1 (local lead sites) and H2 (niche directories) are website businesses; nothing built.
- ORDER.md 47 (Y11, the holding's own site, its host his word) and 48 (Y9, client finding): linked to DxB Web Studio, "not now" (2 Nov).
- STATE: DataForSEO (#47), Apify beyond free (#48) at their ranks; "the site's host (47)"; "Kept for later: where client sites are published."
- OpenSEO's 12 skills (MIT) on the shelf `~/.local/share/dxb/skills/openseo/`; the app self-hosted at #47; DataForSEO needs a ~$50 minimum top-up (money out, his word).

## 2. Platforms by category

**Site building and CMS**

| Option | Open/paid | Agent control | Price | Note |
|---|---|---|---|---|
| Astro | open | code + CLI; withastro/astro 63,698★ | free | static-first, strong Core Web Vitals |
| Next.js | open | vercel/next.js 143,244★ (MIT) | free | apps, i18n, commerce front ends |
| WordPress | open | WordPress/mcp-adapter 1,903★ | free; host not measured | clients know it |
| Webflow | paid | webflow/mcp-server 140★ (MIT, official) | Basic $15/mo yearly | visual editor |
| Framer | paid | Server API; MCP only community (1★) | $10 / $30 per mo | motion-heavy marketing sites |
| Shopify | paid | `@shopify/dev-mcp`; Shopify/shopify-ai-toolkit 627★ | €27 / €79 / €289 per mo | |
| Sanity | paid, OSS studio | sanity-io/agent-toolkit 195★ | free; $15/seat/mo | headless, client edits |
| Payload | open | payloadcms/payload 45,639★ (MIT) | self-host | inside Next.js |
| Strapi | open | strapi/strapi 73,426★ | self-host | |
| Directus | open | directus/mcp 87★; directus 38,810★ | not measured | on any SQL database |
| Decap CMS | open | decaporg/decap-cms 19,461★ (MIT) | free | Git-based |

**E-commerce and payments**

| Option | Open/paid | Agent control | Price | Note |
|---|---|---|---|---|
| WooCommerce | open | woocommerce 10,576★ | free | the holding already runs one |
| Shopify | paid | dev-mcp | from €27/mo | widest global coverage; Shopify Payments opens no business in Turkey or Saudi Arabia |
| Medusa | open | medusa 37,071★; SGFGOV/medusa-mcp 70★ | self-host | headless |
| Saleor | open | saleor 23,502★ (BSD-3) | self-host | GraphQL |
| Stripe | paid | stripe/ai 2,033★ (toolkit + MCP) | not measured | opens no business in Turkey or Saudi Arabia (UAE yes); Managed Payments (+3.5 %) sells digital products only |
| Paddle | paid, merchant of record | PaddleHQ/paddle-mcp-server 49★ | 5 % + 50¢ | handles the seller's tax; digital products only, physical delivery prohibited |
| Lemon Squeezy | paid, merchant of record | community MCP (3★) | 5 % + 50¢ | digital products |
| iyzico | paid (TR) | iyzico/iyzipay-node 246★ | not measured | for Turkish clients, where Stripe is not available |
| PayTR | paid (TR) | czaydev/better-payment 226★ wraps it | not measured | |

**Hosting and deploy**

| Option | Open/paid | Agent control | Price | Note |
|---|---|---|---|---|
| Vercel | paid | official MCP `https://mcp.vercel.com`; CLI | Hobby $0 but closed to commercial use, client work needs Pro; Pro $20/mo incl. $20 usage | best for Next.js; the MCP can make purchases since 2026-07-21, so if connected it sits behind the approval gate |
| Netlify | paid | netlify/netlify-mcp 69★; CLI 1,935★ | free; $9; $20/mo | |
| Cloudflare Pages/Workers | paid | cloudflare/mcp-server-cloudflare 4,441★ | free 100k req/day; from $5/mo; static assets free | edge + DNS |
| Coolify on Hetzner | open | coollabsio/coolify 65,582★; hetznercloud/cli 1,858★ | Hetzner from €5.99/mo excl. VAT | our own server (B09/B11) |
| Dokploy | open | Dokploy/dokploy 38,209★ | self-host | |
| Managed WordPress | paid | not measured | not measured | |

**Domains, e-mail, forms**: Cloudflare DNS/Registrar (Cloudflare MCP; free SSL ⚠ UNVERIFIED) · Resend (resend/mcp-send-email 578★; free 3,000/mo; 100k for $90) · Postmark (postmark-mcp 60★) · Formbricks (13,213★, self-host).

**Measurement and search**: GA4 (googleanalytics/google-analytics-mcp 3,624★, official) · Search Console (AminForou/mcp-gsc 2,097★, community; free ⚠ UNVERIFIED) · Bing Webmaster / IndexNow (not measured) · Plausible (29,760★; cloud $9–19/mo) · Umami (39,897★, self-host) · DataForSEO (mcp-server-typescript 259★; pay-as-you-go, $50 minimum; already #47) · OpenSEO (every-app/open-seo 26,208★; skills on our shelf) · Ahrefs (ahrefs-mcp-server 100★) · Semrush (no MCP found) · Google Business Profile (API not measured) · Lighthouse CI (7,128★) · Uptime Kuma (93,214★).

**Quality**: axe-core (7,743★) · Playwright MCP (39,129★; already pinned 24 times) · CookieConsent (orestbida 5,740★) · Cookiebot (price not read).

**Media delivery**: Bunny CDN/Stream ($1/mo minimum; $0.005–0.06/GB) · Cloudinary (mcp-servers 10★) · Cloudflare Images/Stream.

## 3. The award bar

- Awwwards (awwwards.com/about-evaluation): Design 40 %, Usability 30 %, Creativity 20 %, Content 10 %; at least 18 jurors, the 3 scores furthest from the average dropped; 5-day vote; Honorable Mention ≥ 6.5; Site of the Day = highest jury score. Developer Award sub-criteria not in the fetched text.
- CSS Design Awards: Website of the Day needs an average judge score above 8.00 (varies with the field); public awards UI, UX, Innovation; no weights published.
- FWA: enters at 50, scored out of 100; FWA of the Day ≥ 70 with ≥ 20 judges; no criteria published.
- Webby: Content, Structure & Navigation, Visual Design, Functionality, Interactivity, Innovation, Overall Experience; no weights.

Usability is 30 % at Awwwards and Webby judges Functionality ("loads quickly"): Lighthouse CI, axe and Playwright belong on every job.

## 4. Recommendation

Core set, every job: Astro or Next.js in our own Git · Vercel and Cloudflare side by side (official MCPs), Coolify on Hetzner as the open twin · Search Console, Bing Webmaster/IndexNow, GA4 with Plausible or Umami · DataForSEO + OpenSEO (already #47) · Lighthouse CI, axe-core, Playwright MCP · Resend with Postmark as twin · CookieConsent with Cookiebot as twin · Sanity beside Payload or Decap for client editing.
Per job: Shopify or WooCommerce (W-C42-4/P38-2) · Medusa or Saleor · Stripe, Paddle or Lemon Squeezy, iyzico or PayTR for Turkish clients · Webflow, Framer or WordPress when a client insists · Bunny, Cloudinary or Cloudflare Stream · Google Business Profile (H1) · Ahrefs or Semrush if the client pays · Uptime Kuma for maintenance packages.
Overlap with B43: none. DataForSEO/OpenSEO sit at #47, WooCommerce at W-C42-4/P38-2, the server at B09/B11; hosting is "kept for later" (STATE). Every other connection here is new; its owner row is decided before anything is opened.

## 5. Not measured

Prices of Stripe, Cookiebot, Cloudinary, Cloudflare Images/DNS, Strapi Cloud, Directus Cloud, Ahrefs, Semrush, Adyen, iyzico, PayTR, managed WordPress hosts, the PageSpeed API, Webflow's CMS tier; MCPs for Strapi, Payload, Semrush, Google Business Profile; Framer's Server API access; the Webflow MCP endpoint; some connector searches (GitHub rate limit, HTTP 403); whether vendors need a card before an API key.
