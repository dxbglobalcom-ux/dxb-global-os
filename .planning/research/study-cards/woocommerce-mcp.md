# Study Card: WooCommerce MCP (official) — the wire to the store we actually own

> **FOUND 2026-08-19, AND IT IS AWAITING HIS WORD.** Surfaced by **Agent-Reach's very first live search**, minutes after the CEO ordered it installed — which is itself the argument for the tool.

- **Tool:** WooCommerce's **own official MCP server** — lets an agent read and act on a WooCommerce store in natural language, inside the store's existing permissions.
- **Slug:** woocommerce-mcp
- **Category:** Commerce
- **Status:** STUDY
- **Target Phase:** 10
- **Owner (dept/tier):** Commerce — `commerce-integration-engineer`, `woocommerce-architect` (both already written)
- **Trigger Type:** mcp-profile
- **Source:** https://woocommerce.com/posts/woocommerce-mcp/ — published **2026-04-15**, author Kamlesh Vidhani
- **What it actually is, measured 2026-08-20 at the vendor's own page — three parts, not one:** (1) a **feature built into WooCommerce itself**, switched on at `WooCommerce > Settings > Advanced > Features`; (2) the **WordPress MCP Adapter**, open source, a separate repository; (3) `@automattic/mcp-wordpress-remote`, a **local Node proxy** on our machine.
- **Requirements:** **WooCommerce 10.7** (or 10.3+) · **WordPress 6.9+** (for the core Abilities API) · **Node.js 22+**. Then a REST API key, and the MCP client configured with it.
- **Status at the vendor: DEVELOPER PREVIEW**, their own word, and their own advice is to put it on **a staging site** first.
- **Licence / price:** **Free — no vendor, no subscription.** The feature ships inside WooCommerce; the adapter is open source.
- **What an agent gets, exactly:** `products-list` · `products-get` · `products-create` · `products-update` · `products-delete` · `orders-list` · `orders-get` · `orders-create` · `orders-update`. Custom abilities can be added.

## CORRECTION — this is NOT the free version of Sell The Trend

The report that opened this card wrote that WooCommerce MCP is *"the free official form of the only paid candidate that survived rival source 38"*. **That is wrong and is corrected here so no later session inherits it.**

| | Sell The Trend ($19.97/mo) | WooCommerce MCP (free) |
|---|---|---|
| Find products worth selling | **Yes** — NEXUS AI over ~11M products, 26+ signals, 83 niches | **No** |
| Find and match suppliers | **Yes** — vetted USA and global suppliers | **No** |
| Automate order fulfilment to a supplier | **Yes** — sync, tracking, stock | **No** |
| Ad finders (Facebook, TikTok) | **Yes** | **No** |
| **Connect an agent to OUR OWN store** | Yes, one part of the product | **Yes — and this is all it does** |

**The MCP replaces the WIRE and nothing else.** The research and supplier halves of Sell The Trend have no equivalent inside it — those would come from the arsenal (Crawl4AI, changedetection.io, MediaCrawler) or from a decision to buy the seat.
- **Purpose (their own words):** *"Show me my low-stock products"* or *"Create a product called Winter Hoodie for $39.99"* — the store answers, does the work and returns the result. No dashboard clicking, no hand-written REST integration.

## Why this row matters more than the rest of the arsenal

Rival source 38 measured the gap it closes:

- The one storefront this holding owns is **WooCommerce** (`.planning/PROJECT.md:59` — *"outleteuro.com: existing WooCommerce/WordPress store, 73 brands, hosting live"*; `MASTER_PLAN.md:26` carries the CEO's own 2026-07-10 correction).
- **63 commerce, marketing, social-media and paid-media employees are written**, and there is **no connector of any kind** between them and that store.
- **Revenue reaches the CEO's screen because a person types it into `revenue-entry-form.tsx`.**

**This is the free, official form of the only paid candidate that survived source 38's research** — Sell The Trend, $19.97/month, the one program of the five that supported WooCommerce at all. It is **P38-2** with a better answer than the one the report proposed: not a connector we write, but the one the platform publishes.

## Known Pitfalls

1. **Read-only first.** Every outward action — a price change, a published product, a refund — is the approval gate, unchanged.
2. It is an MCP server: it enters through the department profile mechanism with tools pinned and write tools denied by default, exactly as `mcp-server-git` was (12 tools pinned, 7 read tools emitted, write tools K1-denied).
3. Credentials for a **live** store: which account may be connected is **W-C42-4's own CEO cell** and stays his.

## Lifecycle Checklist
- [x] STUDY — found and recorded 2026-08-19
- [ ] INSTALL — awaits his word on connecting the live Outleteuro store
- [ ] ADOPT
- [ ] EMBED
