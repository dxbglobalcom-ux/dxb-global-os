I've worked out how to install OpenSEO here from its code at commit `46b815be` (v0.1.26, 2026-11-06). The clone is at `/tmp/claude-1000/-home-dxb-DxB-Global-OS/a6280165-46b7-4d68-aed5-b45878956e42/scratchpad/seo-tools/open-seo-src`, and file paths below are relative to it. I ran nothing from the clone and wrote nothing in the repo.

**Prior research corrections (openseo-research.md)**
- **Database:** the Docker edition does not use Postgres. It runs on SQLite under `celld`, an open-source runtime for Cloudflare Workers code (`denoland/celld` v0.5.1). Its setup script hard-codes `DATABASE_PROVIDER: "d1"` (`scripts/celld/runtime/configure.mjs:66`). Postgres only works through Cloudflare's Hyperdrive service (`wrangler.jsonc`, `src/db/provider.ts:35`).
- **Telemetry:** "on by default" is true only of the old single-container image (root `compose.yaml`). The current standalone image forces it off (`configure.mjs:67-68`: `OPENSEO_TELEMETRY_DISABLED:"true"`, `DO_NOT_TRACK:"1"`).
- **"Reuse results within 30 days":** this is only an instruction in SAM's prompt (`src/server/features/sam/samSystemPrompt.ts:30`), not code. The real cache is described in section 3.
- **Shelf skills:** 6 of the 12 `SKILL.md` files on our shelf differ from upstream. The upstream plugin's `plugins/openseo/.mcp.json` points at the paid hosted service `https://app.openseo.so/mcp`, so it must be repointed to our install before use.

## 1. Architecture
- **Services** (`deploy/standalone/compose.yaml`):
  - `storage`: RustFS, an S3-compatible store, pinned by digest. It holds the SQLite database, the cache and key-value data.
  - `runtime`: celld running the app, `mem_limit: 2g`.
  - `init`: runs once per start. It generates secrets, loads the app and applies database migrations (`deploy/standalone/init.sh`).
  - `crawl-gateway`: Node. It lets crawls reach only public addresses on ports 80 and 443 (`scripts/celld/runtime/crawl-gateway.mjs:14-63`).
  - `web`: nginx, published only on `127.0.0.1:${PORT:-3001}`.
- **Languages:** TypeScript (TanStack Start and React) compiled to a Workers bundle; Node 22 for the helper scripts.
- **Queues:** no Redis or BullMQ among the dependencies (`package.json`). Background work runs on celld's own Workflows plus two scheduled jobs, every 5 minutes and daily (`wrangler.standalone.json`). That is a second job runtime sealed inside the container.
- **Auth:** `AUTH_MODE=password` by default. The first visitor becomes admin, after which registration is invitation-only (`src/server/standalone/sign-up.ts`). The admin endpoint is blocked at nginx (`nginx.conf`); admin commands run via `docker compose exec`.
- **Many clients in one install:** yes, as projects. Each project belongs to one organization and has its own Search Console connection (`src/db/app.schema.ts:120`, `src/db/gsc.schema.ts:36`). Users cannot create organizations (`src/lib/auth-config.ts:64`), so it is one workspace. Per-client user isolation was not found (⚠ UNVERIFIED); clients should get shared report links, not logins.
- **Resources:** the docs ask for 4 GiB for Docker and say the stack typically uses 1–2 GiB; the kernel must use 4 KiB memory pages (`docs/SELF_HOSTING_DOCKER.md`).
- **This machine (measured):** Docker 29.1.3, Compose 2.40.3, 30 GB RAM, 24 cores, page size 4096, port 3001 free, Node v22 on the host.

## 2. Data layer
- **DataForSEO is hard-wired.** The API base is a constant (`src/server/lib/dataforseo/core.ts:14`). The only "provider" switch in `src/server/lib/provider-access.ts` decides who attaches the key (us, or their own gateway service), not where data comes from. Every feature consumes DataForSEO's response types.
- **Endpoints used:**
  - Labs: keyword_overview, keyword_ideas, keyword_suggestions, related_keywords, ranked_keywords, relevant_pages, serp_competitors, domain_rank_overview.
  - Google Ads search volume and keyword ideas, through DataForSEO's `keywords_data/google_ads`.
  - SERP Google organic (live and queued), maps and local_finder.
  - Backlinks: summary, backlinks, referring_domains, domain_pages_summary, history.
  - Business Data (listings, profile, reviews, Q&A, updates).
  - On-page Lighthouse.
  - AI optimization (LLM mentions, LLM responses, and scrapers for ChatGPT, Gemini, Claude and Perplexity).
  - Appendix (free calls).
- **Other sources already built in:** Search Console (`src/server/lib/gscClient.ts`), Google Analytics 4 (`ga4Client.ts`) and IndexNow submission (`src/server/features/indexnow/`). They need our own Google OAuth app with redirects `/api/gsc/oauth/callback` and `/api/ga4/oauth/callback`.
- **Not built in:** the Google Ads API directly, Bing Webmaster, and any crawler import (LibreCrawl or Screaming Frog CSV). A grep found none.
- **What it would take:**
  - A fork with new fetchers per feature. Even a DataForSEO-compatible proxy needs a patched `core.ts` and our own image build (`compose.build.yaml`).
  - Or, recommended: keep those sources outside. Our agents call the Ads API, Bing and Screaming Frog themselves and put the result into OpenSEO through `save_report` (it takes finished HTML), `update_project_context` and `save_keywords`. This needs no fork.

## 3. Cost behaviour
- **Cache:** results are cached for 12 hours on SERP, domain and backlinks pages, 24 hours on keyword research, 7 days on prompt responses and 90 days on the dashboard (`src/server/lib/r2-cache.ts`; constants listed above).
- **Rate limit:** at most 4 DataForSEO calls at once per request (`request-slots.ts:10`), and 2 retries on server errors (`core.ts:20`).
- **Spend display: none when self-hosted.** Metering runs only in the paid hosted mode (`dataforseo/client.ts:374-380`). The balance call `fetchUserData` exists but nothing calls it.
- **Safeguards:** the cost estimators `estimate_rank_tracker_cost` and `estimate_ai_visibility_cost`, and a `maxCostCredits` cap on rank checks (`RankCheckWorkflow.ts:97`).
- **The risk:** scheduled rank and AI-visibility checks spend without anyone asking. Our prepaid DataForSEO balance is the only hard stop.
- **Rough raw cost per action**, from the code's own price table (`pricing.ts`, read by them Sep 2026). Tool descriptions quote "credits"; one credit is $0.001 after their 1.28 markup, so raw ≈ credits ÷ 1280. ⚠ UNVERIFIED against real bills.

| Action | Raw cost |
|---|---|
| `research_keywords`, per seed | ~$0.04 (up to ~$0.09 at 500 rows) |
| `get_serp_results`, per keyword at depth 10 | ~$0.004 |
| Rank check, per keyword per device at depth 10 | $0.0018–$0.0036 (3–6 reads × $0.0006) |
| `get_backlinks_overview`, one domain | ~$0.04 |
| `get_domain_overview` | $0.08–$0.23 |
| Lighthouse, per page | $0.005 |
| Google Ads volume, per task | $0.09 |
| LLM mentions, per request | ≥ $0.10 |
| AI-visibility answer, per prompt per engine | $0.0012 (queued) |

## 4. MCP server
- **Tools:** 85, served over Streamable HTTP at `/mcp` (`src/server/mcp/server.ts`, `transport.ts`). The full list is in `src/server/mcp/tools/`.
- **Annotations:** 30 tools are marked read-only and 11 destructive. That is enough to build an allowlist in our MCP gateway.
- **Auth:** an API key with prefix `oseo_`, sent as `Authorization: Bearer` or `x-api-key` (`api-key-auth.ts:16-28`). Keys are bound to the organization and have no rate limit (`src/lib/auth-api-key.ts:31`).
- **Our agents:** they can connect with `{type:"http", url:"http://127.0.0.1:3001/mcp", headers:{Authorization:"Bearer oseo_…"}}`. The API key avoids the OAuth flow, which has a reported bug (#534). ⚠ UNVERIFIED: not run.
- **Do not use `local_noauth` mode:** there `/mcp` has no authentication at all (`transport.ts:259-285`). A browser origin check limits outside websites (`transport.ts:54-80`), but any local process could spend credits.

## 5. SAM agent and telemetry
- **SAM:** leave `OPENROUTER_API_KEY` empty and SAM stays off (`src/server/lib/openrouter.ts`, `serverFunctions/samAccess.ts`).
  - The same key also gates website research, AI prompt suggestions and AI prompt research. No separate SAM switch was found.
  - Pointing `OPENROUTER_BASE_URL` at our LiteLLM with a virtual key would keep the no-raw-key rule, but it would also turn SAM on.
- **Telemetry:** no setting is needed in the standalone image; it is forced off. The browser analytics client (PostHog) loads only in the hosted mode (`src/client/lib/posthog.ts:68`).
- **Remaining outbound calls:** DataForSEO, plus Google, IndexNow, Context.dev and OpenRouter only if configured, plus the crawl targets.

## 6. Risks seen in the code
- **Maturity:** v0.1.x. The standalone image appeared at v0.1.17. v0.1.25 says "DataForSEO features work again on the Docker edition", so it was broken for a stretch. v0.1.26 says "Updating the Docker edition no longer leaves the app down". There is no image for 0.1.23.
- **Migrations:** forward-only. Rolling back means restoring a backup (`docs/SELF_HOSTING_DOCKER.md`). The schema has 69 SQLite migrations so far.
- **Secrets on disk:** the DataForSEO key sits in plain text in the `config` volume (`configure.mjs` writes `wrangler.json`, mode 0600). Backups carry it too.
- **Defaults:** `STORAGE_SECRET_KEY` ships as a placeholder. The `BETTER_AUTH_URL` setting must be HTTPS unless it is loopback.
- **Registration window:** registration is open until the first account exists, so create the admin before exposing the app.
- **No JavaScript rendering** in audits without Context.dev.

## 7. Install recipe for this machine
**Image:**
`ghcr.io/every-app/open-seo-standalone:0.1.26@sha256:b9073630eb107f46b8008e237445092788276cf854517505515ae8cdab73b79c` (index digest measured from the GHCR registry API today). Use only `deploy/standalone/compose.yaml`; it is self-contained and pins RustFS and nginx by digest. Do not use the root `compose.yaml`: it is the old image with `local_noauth` and telemetry left to us.

**`.env`:**
- `STORAGE_ACCESS_KEY` and `STORAGE_SECRET_KEY`: random (`openssl rand -hex 32`).
- `AUTH_MODE=password`, `PORT=3001`.
- `BETTER_AUTH_URL=http://localhost:3001`, or `https://seo.<ours>` behind Caddy.
- `OPENSEO_IMAGE`: the pinned image above.
- `DATAFORSEO_API_KEY`: base64 of `login:password`, from the vault.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: our OAuth app, optional.
- Leave `OPENROUTER_API_KEY` and `CONTEXT_API_KEY` empty.

**Run:**
1. `docker compose -f compose.yaml --env-file .env pull && … up -d`, then wait for `OpenSEO initialized and ready.` in `logs -f init`.
2. Create the admin account at once.
3. Create an API key in Settings and register it in our MCP gateway.
4. Re-pull the 12 skills at the same commit and repoint their MCP address to our install.

**Where data lives:** Docker volumes `openseo-standalone_storage` (database and cache), `_runtime`, `_config` (secrets) and `_web-config`.

**Backups:** `node scripts/celld/backup.mjs backup DIR` from a checkout pinned to the same commit; it uses only docker and Node built-ins. Run it before every update.

**Without DataForSEO:** the app starts; a missing key is only a warning (`src/lib/selfhost-preflight.ts:182`). Still working: projects, project memory, reports and sharing, the site-audit crawler (up to 10k pages; its tool skips Lighthouse by default, `site-audit-tools.ts:123`), Search Console, GA4 and IndexNow. Dead: keywords, SERP, rank tracking, backlinks, domain overview, local SEO, AI visibility and Lighthouse. Nothing works fully offline; crawling and Google both need the internet. Whether the missing-key pop-up can be dismissed is ⚠ UNVERIFIED.

**Conflicts with STACK.md (decision stands; these need handling):**
- Client SEO data lives in OpenSEO's own SQLite, outside our Supabase. Our dashboard can reach it only through MCP, and RustFS is a second store to back up.
- celld's Workflows and scheduled jobs are a second job runtime, sealed inside the appliance. Our job queue (pg-boss) stays the holding's queue.
- The SAM agent framework stays off.
- The DataForSEO key must sit in OpenSEO's config volume. It is not an LLM key, so LiteLLM cannot hold it.

**Not verified:** real DataForSEO bills against these estimates, the Agent SDK connecting to `/mcp`, and Google OAuth working with a localhost redirect.