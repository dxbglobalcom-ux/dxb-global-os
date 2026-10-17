# R8-platform-integration-facts (helper report, 2026-10-17; raw evidence paths inside)

I measured all 11 platforms today, 2026-10-17. All pages are saved in `/tmp/claude-1000/-home-dxb-DxB-Global-OS/780184a8-14f7-45ce-91c0-2943127c7438/scratchpad/h8/raw/`. Per your scope change, there is nothing in this report about company/VAT invoicing or which legal entity invoices.

On Higgsfield (item 7): **Unlimited plans and free generations still do not work through the API, MCP or CLI**. The vendor's current wording:
- "Unlimited access and free generations apply only on higgsfield.ai, so generating through MCP always uses credits at standard rates." (help page modified 2026-09-24)
- "Not on higgsfield.ai. The same models used through MCP, CLI, Canvas, or Supercomputer always deduct credits." This sentence answers "Do Unlimited model generations cost any credits?" on the Unlimited help page (modified 2026-08-28).

Both quotes are from the pages' own FAQ data, which I extracted myself. The pages are `higgsfield.ai/creator-hub/help-center/integrations/what-is-higgsfield-mcp` and `…/credits/what-are-unlimited-models-and-which-plans-include-them`.

Tags: **FH** = I fetched or probed it myself today. **V** = vendor page text read today. **U** = UNVERIFIED. Unless a row says otherwise, docs come from each vendor's own `llms.txt` / `.md` pages.

## 1. Sign-up, accounts, keys

| Platform | Google sign-in | Teams / roles / keys | KYC / verification |
|---|---|---|---|
| fal | Yes: GitHub, Google, SSO/SAML. "Each login method creates a separate account" (Google and GitHub merge on the same email; SSO stays separate). V, `fal.ai/docs/documentation/setting-up/accounts-and-identity` | Teams with roles admin/billing/developer/creator/viewer. Keys belong to the account, not the person. Keys can be created/revoked by API (`/v1/keys`). Organizations add SSO. V, `…/setting-up/teams` | U |
| Runware | Yes: GitHub, Google, Enterprise SSO, or email (FH, `my.runware.ai/signup`) | One key per project, revocable; a key can be shared with a team (V, `runware.ai/docs/llms.txt`). Roles: U | $2 test credit for business-email sign-up (V, `runware.ai/llms.txt`) |
| WaveSpeed | Yes: Google or GitHub; AWS login is a separate reviewed flow (V, `wavespeed.ai/docs/payment-methods`) | Organizations with Owner/Admin/Developer roles; a key inherits its creator's role (V, `/docs/api-authentication`) | Business verification only for a monthly credit line (V, same page) |
| Replicate | **No.** The sign-in page offers "Sign in with GitHub" only (FH, `replicate.com/signin`) | Organizations share tokens and billing. Multiple tokens allowed (V, `/docs/topics/organizations.md`, `/security/api-tokens.md`) | U |
| kie.ai | Yes: Google and Microsoft (FH, login modal via toolbox `fetch.py`) | Per-key rate limits with hourly/daily/total caps (V, `docs.kie.ai/getting-started.md`). Teams: U | U |
| Higgsfield API | Not on the API console: email/password + SSO only (FH, `console.higgsfield.ai/auth/sign-in`) | Organizations with Admin/Member roles, SAML SSO. Credentials are a key ID plus a secret (V, `docs.higgsfield.ai/docs/organizations/managing-members.md`, `/authentication.md`) | U |
| MiniMax | Google, GitHub, email (FH, but from a jina **cached snapshot** of `platform.minimax.io/login`) | Pay-as-you-go API key, separate from the M Plan subscription key (V, `/docs/guides/quickstart-preparation.md`). Teams: U | U |
| Google Gemini API / Vertex | Google account (inherent) | Tiers, caps and rate limits are set per Cloud Billing account. Keys belong to projects (V, `ai.google.dev/gemini-api/docs/billing.md.txt`). Vertex IAM: U | U |
| BytePlus ModelArk | U | U | Account sign-up includes verification and billing info, or a credit-limit request (V, `ai.byteplus.com/en/help/article/what-payment-methods-does-byteplus-support`) |
| Kling | U. The vendor says "Log in using your email" | Multiple named keys; concurrency is shared by all keys of an account (V, `kling.ai/document-api/guides/get-started/quick-start.md`, `concurrency-rules.md`) | U |
| Alibaba Model Studio | U | Alibaba Cloud account or RAM users; workspaces; keys per workspace (V, `alibabacloud.com/help/en/model-studio/get-api-key.md`) | Account information must be completed before activation, effective Sept 15 (V, `new-free-quota.md`) |

## 2. Billing (prepaid/postpaid, minimum, methods, currency, expiry, limits)

| Platform | Model | Minimum top-up | Methods | Currency | Credit expiry | Spend control |
|---|---|---|---|---|---|---|
| fal | Prepaid credits. Concurrency limit grows with purchases: 2 at start, up to 40 self-serve (V, `/docs/documentation/model-apis/pricing`, `concurrency-limits`) | U | U | USD | 365 days; promotional credits 90 days (V, ToS updated Sept 8, 2026) | Billing role includes "spending alerts" (V) |
| Runware | Prepaid balance, "no minimum spend" (V, `/docs/models-api/pricing`) | None (V) | Backup payment method mentioned; card types U | USD | "never expires" (V) | Auto-reload, low-balance alerts (V) |
| WaveSpeed | Prepaid; monthly credit line only after review (V) | U | Stripe card, PayPal, WeChat Pay, Alipay, Naver Pay (V, `/docs/payment-methods`) | USD | "Credits never expire" (V) | Monthly auto-recharge limit, minimum $10. This is not a usage cap (V, `/docs/auto-recharge-limit`) |
| Replicate | Prepaid credit; some accounts billed in arrears (V, `/docs/topics/billing.md`) | Auto-reload threshold ≥$5, reload balance ≥$15 (V, `/billing/prepaid-credit.md`) | Card (U for others) | USD | 1 year, non-refundable (V) | Stronger throttling near zero balance (V, `rate-limits.md`) |
| kie.ai | Prepaid credits. 1 credit = $0.005, derived from the pricing table (30 credits = $0.15) (V, `kie.ai/pricing`) | U | U | USD | "never expire, and refunds are supported" (V, `kie.ai/refund-policy`, terms) | Per-key caps (V) |
| Higgsfield API | Top-up balance, pay per generation (V, `docs.higgsfield.ai/docs/help/faq.md`) | U | U | credits + USD (the estimate endpoint returns both) | 1 year (V, `/docs/concepts/billing-and-retention.md`) | U |
| MiniMax | Pay-as-you-go balance; video packages valid 1 month and **not usable for H3** (V, `/docs/pricing/overview.md`) | U | Online payment and bank transfer (V, `/docs/faq/about-account.md`) | USD | Packages reset at expiry (V) | Balance alert e-mail, autobilling (V) |
| Google Gemini API | Prepay (default for new accounts since Mar 23, 2026) or Postpay (V, `billing.md.txt`) | $5 to enter the paid tier (V) | Via Cloud Billing / AI Studio | USD or local currency | Prepay credits expire after 12 months (V) | Project caps and tier caps ($250 / $2,000 / $20k+) (V) |
| Google Vertex (Veo) | Cloud Billing | n/a | Cloud Billing | — | — | Alert budgets do not cap; a "spend cap budget" page exists (V, `docs.cloud.google.com/billing/docs/how-to/budgets`). **Veo 3.1 on Vertex: "Pay-as-you-go Not supported, Fixed quota Supported", 50 req/min, us-central1 only** (V, Veo 3.1 page, now under "Gemini Enterprise Agent Platform") |
| BytePlus | Pay-as-you-go plus model-specific resource packs; postpaid credit limit on application (V, help articles 2026-08-18) | U | Card (Visa/MC/Amex/Maestro), PayPal for some products (V) | U | Packs valid 3 months (V, saved Seedance 2.5 page) | U |
| Kling | Prepaid resource packages and account balance; balance non-refundable (V, `/guides/protocols/paid-service.md`). 1 Unit = $0.14 list price (V, `kling.ai/dev/pricing`) | U (trial pack exists) | U | USD | "Validity period" exists but its length is U | Concurrency depends on the package (V) |
| Alibaba | Postpaid pay-as-you-go deducted from the Alibaba Cloud account; overdue balance blocks the service (V, `new-free-quota.md`) | n/a | U | USD (intl) | Free quota 90 days (V) | **Monthly budget at account, workspace or API-key level with auto-stop (429)** (V, `budget-management.md`) |

## 3. API shape

| Platform | Async + polling | Webhook | SDKs | Output retention | Concurrency / rate | Failed jobs billed? |
|---|---|---|---|---|---|---|
| fal | Queue submit/status | Yes | JS `@fal-ai/client`, Python `fal_client` | CDN, configurable with `X-Fal-Object-Lifecycle-Preference` | 2→40 concurrent; queued jobs never dropped | No charge for 5xx errors or queue time (V) |
| Runware | `deliveryMethod: async` + `getResponse` | Yes, `webhookURL` | TS `@runware/sdk`, Python | 7 days, adjustable with `ttl` | No hard cap; 2–4 concurrent recommended; 429 with `Retry-After` | "Failed generations are not charged" (V) |
| WaveSpeed | Yes, `/predictions/{id}/result` | Yes, `standard_webhook` (Standard Webhooks signatures) | Python, JS | Up to 7 days (V, `/docs/data-retention-policy`) | Bronze 2 concurrent; Silver 300; Gold 3,000; Ultra 10,000. Tier is set by a single top-up size (V, `/docs/account-levels`) | Automatic refund for failures (V, `/docs/refund-policy`) |
| Replicate | Yes | Yes | Python, JS | **API data deleted after 1 hour** (V, `data-retention.md`) | 600 prediction creates/min (V) | Failed runs not charged; canceled runs on official models may be (V) |
| kie.ai | `recordInfo?taskId=` | Yes, callback URL | U | 14 days for outputs; uploads deleted after 24 h (V) | 20 requests per 10 s; 429s are not queued (V) | U |
| Higgsfield API | `status_url` | Yes | `higgsfield-client` (Python), `@higgsfield/client` (TS) | At least 7 days | Example limit: 4 concurrent; returns **400**, not 429; no `Retry-After` header (V) | Failed/NSFW/timeouts refunded (V) |
| MiniMax | `/v2/query/video_generation/{id}` | Yes, `callback_url` (V, `video-generation-v2-create.md`) | MCP-JS; no video SDK seen | U | MiniMax-H3: 300 RPM, 30 in-flight tasks (V, `rate-limits.md`) | Failed videos not deducted (V) |
| Gemini API Veo | Long-running operation, polling | U (none seen) | google-genai | **2 days** (V, `veo.md.txt`) | Tiered | No charge on 400/500 errors (V) |
| BytePlus | Task create/retrieve | Yes, `callback_url` (V, BytePlus Go SDK on GitHub) | Official Ark SDK | 24 h ModelArk video URLs. **U**: source is a `byteplus-sa` GitHub README | U | U |
| Kling | Yes | Yes, `options.callback_url` plus webhook signature (V) | U | **30 days** (V, t2v doc) | Per package; error code 1303; no QPS limit (V) | U |
| Alibaba Wan | `X-DashScope-Async: enable`; `task_id` valid 24 h | U (none seen) | DashScope | **Video URL valid 24 h** (V, `wan3-video-generation-api-reference.md`) | Dynamic, by monthly spend (V, `quota-management.md`) | "Failed requests are not billed" (V, `model-pricing.md`) |

## 4. Machine-readable catalog and price

| Platform | Catalog | Price | Key needed? |
|---|---|---|---|
| fal | `api.fal.ai/v1/models?category=text-to-video&status=active` | `api.fal.ai/v1/models/pricing` and `/pricing/estimate` | Catalog **public** (FH 200). Price API **needs a key** (FH 401). Per-model `fal.ai/models/<id>/llms.txt` has a public `## Pricing` section that includes the promo text (FH) |
| Runware | `runware.ai/docs/models/index.json`: 380 models, 116 video-capable (FH) | `/docs/models/<id>/schema.json` → `info["x-pricing"]` (FH) | **All public**. How a temporary offer appears in that JSON is U (none seen in the 2 schemas checked) |
| WaveSpeed | `GET api.wavespeed.ai/api/v3/models` (includes `base_price`) | `POST /api/v3/model/price` (base price plus the account's discount) | Key needed (FH 401). Per-model llms.txt is public but has **no price** (FH) |
| Replicate | `/v1/models`, `/collections`, `/search` | **No price field in the OpenAPI spec** (FH: zero "price"/"cost" hits) | Key needed (FH 401). Prices exist only on HTML pages |
| kie.ai | `kie.ai/sitemaps/models-0.xml` | `kie.ai/pricing` with the price JSON embedded in the page (`creditPrice`) (FH) | Public; no documented price API |
| Higgsfield API | `console.higgsfield.ai/explore`; OpenAPI is stale (8 paths) and the vendor calls it "supplementary" | `POST api.higgsfield.ai/estimate/<model>` | Estimate needs a key; pricing page is public HTML |
| MiniMax | — | `platform.minimax.io/docs/pricing/overview.md` | Public markdown |
| Google | `generativelanguage.googleapis.com/v1beta/models` | Cloud Billing Catalog API | Both **need a key** (FH 403) |
| BytePlus | — | Docs are a JavaScript single-page app | U |
| Kling | — | `kling.ai/document-api/pricing/base/video.md` | Public markdown (FH) |
| Alibaba | — | `alibabacloud.com/help/en/model-studio/model-pricing.md` (119 KB) | Public markdown (FH) |

## 5. Change signals (URLs a scanner can read; all returned 200 today unless noted)

| Platform | Changelog / feed | Status | Promotion signal |
|---|---|---|---|
| fal | `fal.ai/docs/changelog/rss.xml` (last item 2026-10-14), `blog.fal.ai/rss/`, `fal.ai/sitemap.xml` | `status.fal.ai/history.rss` | Per-model llms.txt and the page JSON `billingMessage`, e.g. "promotional rates, **35%** off… The discount ends **October 31**" on `minimax/h3-max/text-to-video` |
| Runware | `runware.ai/docs/changelog/rss.xml` (last 2026-10-15), `runware.ai/blog/rss.xml`, `sitemap.xml` | `status.runware.ai/feed.rss` | Offer badge on the model page (V) |
| WaveSpeed | `wavespeed.ai/blog/rss.xml` (last 2026-10-16); **no changelog page** (`/changelog` 404); `sitemap.xml` is nearly empty (75 B) | `status.wavespeed.ai/feed.rss` | `model/price` returns the effective discount (key needed) |
| Replicate | `replicate.com/changelog/rss` and `/atom` (last 2026-04-21), `/blog/rss` | `replicatestatus.com` now redirects to `cloudflarestatus.com/services?search=replicate` (FH) | U |
| kie.ai | `kie.ai/api-updates` is client-rendered ("Loading updates…"), so content is U; `docs.kie.ai/llms.txt`; sitemap index (blog lastmod 2026-10-17) | None (`status.kie.ai` unreachable; `kie.ai/status` 404) | Discount % column on `kie.ai/pricing`; Discord/Telegram |
| Higgsfield | `higgsfield.ai/creator-hub/changelog/rss.xml` | `status.higgsfield.ai` | API console shows "Up to 75% off", "50% OFF", "100% cashback" |
| MiniMax | `platform.minimax.io/docs/release-notes/models.md` (last Jul 31, 2026) and `apis.md` (last Oct 28, 2025): both stale | `status.minimax.io` | "Pricing Update Notice" callouts in pricing overview |
| Google | `ai.google.dev/gemini-api/docs/changelog.md.txt` (last 2026-10-13), `deprecations.md.txt`; Vertex feed `docs.cloud.google.com/feeds/generative-ai-on-vertex-ai-release-notes.xml` (last updated 2026-05-26) | `status.cloud.google.com/incidents.json` | — |
| BytePlus | U | U | Pack offers on the Seedance 2.5 page |
| Kling | `kling.ai/document-api/updates/api.md` (last 09/15/2026) | U | U |
| Alibaba | `…/model-studio/newly-released-models.md` (346 KB) | U | U |

## 6. MCP servers

| Platform | URL / package | Auth | Exposes |
|---|---|---|---|
| fal | `https://mcp.fal.ai/mcp-relay`, plus a separate Platform MCP | OAuth | Model search, schemas, pricing, upload, run (V) |
| Runware | `https://mcp.runware.ai`, or local `npx @runware/mcp` | OAuth wrapping the API key | `run`, `list_models`, … (V) |
| WaveSpeed | `npx -y @wavespeed/mcp` (local) | API key | 7 tools, including `get_price` and `get_balance` (V, GitHub README) |
| Replicate | `mcp.replicate.com`, or npm `replicate-mcp` | Token | The whole HTTP API (V) |
| Higgsfield | `https://mcp.higgsfield.ai/mcp` | OAuth, no API key | Generation; **always charges credits** (V) |
| MiniMax | Local `MiniMax-MCP` (uvx) / `MiniMax-MCP-JS` | API key | Multimodal generation (V) |
| BytePlus | `byteplus-sa/modelark-mcp` | U | Seedance task tools. Official status U |
| kie, Kling, Google, Alibaba | No generation MCP found. kie and Kling publish agent "skills" instead | — | — |

## Summary (router + scanner)

1. **The router can rely on:** public catalog and price data from Runware (full index plus per-model `x-pricing` JSON, no key), fal (public catalog plus per-model llms.txt with price and promo), and Kling, Alibaba and MiniMax (public pricing `.md`).
2. **Exact quotes before a job need a key** on fal (`pricing/estimate`), WaveSpeed (`model/price`, includes the account's discount) and Higgsfield (`/estimate`). Replicate and Google have no price API that works without a key, and Replicate has none in its API at all.
3. **Asynchronous calls with webhooks** are documented everywhere except the Gemini API and Alibaba Wan, which are polling only. Higgsfield signals a full concurrency queue with HTTP 400 instead of 429.
4. **Output must be copied right away:** Replicate keeps API outputs 1 hour, Alibaba 24 hours, Gemini 2 days, WaveSpeed/Runware/Higgsfield about 7 days, kie 14 days, Kling 30 days.
5. **Scanner coverage:** RSS feeds exist for fal, Runware, Replicate, Higgsfield and Vertex, plus status feeds for fal, Runware and WaveSpeed. **Weak spots:** kie's updates page cannot be read without JavaScript, WaveSpeed has no changelog, MiniMax and Vertex release notes are stale, BytePlus docs need a full browser, and promotions are machine-readable only on fal (`billingMessage`) and through WaveSpeed's discount field.
6. **Still unmeasured or risky:** minimum top-ups and payment methods for most platforms (marked U above); Google sign-in for BytePlus, Kling and Alibaba; MiniMax login methods come from a cached snapshot. Replicate has no Google sign-in, and the Higgsfield API console offers email/SSO only, so neither matches a "Google account" opening plan. Vertex Veo 3.1 cannot be bought pay-as-you-go (fixed quota, us-central1 only), so the Gemini API is the route for Veo. Unlimited Higgsfield plans cannot be routed through its API or MCP.

The toolbox's hidden Chrome is unusable right now ("login keyring locked"), so I read JavaScript pages through `fetch.py` instead.