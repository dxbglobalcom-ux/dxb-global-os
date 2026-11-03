# WordPress / WooCommerce for DxB Web Studio — helper research, 2026-11-03

Read-only helper (Opus 5.5 · medium), briefed by the lead in the Web Studio plan talk. His words: "tabii ki WooCommerce bir de bir şey daha vardı WooCommerce'le birlikte, WooCommerce ve WordPress. Bu ikisi hani aynı zamanda bunda uzmanları olmalı yani. Belki bununla ilgili repo da ben zannedersem daha önce holdinge bununla ilgili repolar da söylenmişti. Belki bunun çok daha gelişmiş repoları GitHub'da vardır. Araştırılmasını istiyorum."
Lead's spot-check, 2026-11-03: `gh repo view` WordPress/agent-skills 2,328★ pushed 2026-10-26 · WordPress/mcp-adapter 1,903★ pushed 2026-11-02 · Automattic/wordpress-mcp archived — all as reported; agent-skills' 20 skill folders listed by `gh api`.

## 1. Earlier mentions in the holding

| file:line | What it says | Status | Date |
|---|---|---|---|
| `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md:129` (B30) | "WooCommerce's official MCP, scheduled for a staging store first"; CEO item "the live Outleteuro store access" | planned, not installed | row 2026-08-19 |
| `.planning/research/study-cards/woocommerce-mcp.md:1-60` | Official WooCommerce MCP: a WooCommerce feature + the WordPress MCP Adapter + `@automattic/mcp-wordpress-remote`; Woo 10.3+/10.7, WP 6.9+, Node 22+; vendor "developer preview"; tools products-list/get/create/update/delete, orders-list/get/create/update; "INSTALL — awaits his word" | idea (study) | 2026-08-19 / 08-20 |
| `.planning/research/INTEGRATION-TRACKER.md:107`, `LITERATURE.md:61` | the same MCP, awaiting his word | idea | 2026-08-19 |
| `HOLDING-OS-MASTER-PLAN/CAPABILITY_ARSENAL_DOCTRINE.md:95,127` | WooCommerce write paths "Phase-11 LOCKED"; read lanes first, writes behind the approval engine | planned (locked) | — |
| `HOLDING-OS-MASTER-PLAN/MASTER_PLAN.md:26,114` | Outleteuro, the company's existing WooCommerce/WordPress store; its pilot "İPTAL (U19, CEO 2026-07-19)" | pilot cancelled | 2026-07-10 / 07-19 |
| `.planning/research/R4.2-LIBRARY-GAP-MATRIX.md:71,90` | G-3 "Outleteuro/WooCommerce toolset → install at use-phase" | planned | July |
| `personas/commerce/woocommerce-architect.md:74,113` | WP-CLI and config-in-code over admin clicks; on production WP-CLI only through the release workflow | persona | 2026-10-06 |
| `personas/engineering/engineering-cms-developer.md:32,109` | WP-CLI/Drush as backbone; deputy for the Woo architect | persona | — |
| `.planning/research/watch-links/2026-10-08-whatsapp/items.tsv:123` (W122) | his note "important for wordpress website yapacak takım veya uzman için" — a WordPress speed video (EWWW, W3TC, Cloudflare, Cloudways) | idea / standard | 2026-10-06 |
| same, W027 | "WordPress Studio + Claude Code ile eklenti yazmak" | idea | 2026-06-21 |
| `.planning/quick/20261014-88-link/MERGE.md:55-56` | offer 11 WordPress measured speed fix (150–700 $); offer 12 halal-niche WordPress plugins | idea | 2026-10-14 |
| `.planning/research/REVENUE-OPPORTUNITIES.md:72,187` | "WordPress site yenileme (K10)" tied to revenue line H5 | halal for now | 2026-11-01/02 |
| `.planning/research/PITFALLS.md:166,250` | a WordPress admin credential once leaked in a source .odt; staging and draft products first | lesson | early |

No WordPress/Woo repository URL was ever named in the repo. Nothing WordPress-related is installed: `wp`, `wp-env`, `php`, `composer` not found; Docker, gh, Node v22.23.3 present; `claude mcp list` has no WordPress server.

## 2. GitHub, measured with `gh repo view` (2026-11-03)

| Repo | Stars | Last push | Licence | Maintainer | Gives an agent | Studio use |
|---|---|---|---|---|---|---|
| WordPress/agent-skills | 2,328 | 2026-10-26 | other | official | 20 skills (blueprint, wp-block-themes, wp-block-development, wp-interactivity-api, wp-patterns, wp-performance, wp-phpstan, wp-playground, wp-env, wp-wpcli-and-ops, wp-rest-api, wp-abilities-api/audit/verify, wpds, wp-plugin-development…) | the expert knowledge layer for every WordPress seat |
| WordPress/mcp-adapter | 1,903 | 2026-11-02 | GPL-2.0 | official | Abilities API → MCP; the canonical WordPress MCP | agent drives the running site |
| Automattic/mcp-wordpress-remote | 186 | 2026-11-02 | MIT | official | local stdio proxy to a remote site's MCP | Claude Code ↔ staging/client sites |
| WordPress/abilities-api | 215 | 2026-01-17 | GPL-2.0 | official, archived (in core since 6.9) | machine-readable site abilities | custom abilities |
| Automattic/wordpress-mcp | 947 | 2026-09-17 | none | official, archived/deprecated | readme points to mcp-adapter | do not use |
| woocommerce/woocommerce | 10,576 | 2026-11-03 | GPL-2.0 | official | core + built-in MCP feature + Blocks + Store API | the commerce base |
| woocommerce/wc-mcp-ability | 6 | 2026-11-03 | none | official | demo for custom Woo MCP abilities | store-specific tools |
| wp-cli/wp-cli | 5,175 | 2026-11-02 | MIT | official | full site/db/plugin/content control from the shell | every build and deploy |
| WordPress/wordpress-playground | 1,985 | 2026-11-03 | GPL-2.0 | official | WordPress in WebAssembly; CLI; `@wp-playground/mcp` | throwaway sandboxes; blueprint builds |
| WordPress/blueprints | 119 | 2026-10-13 | none | official | JSON site recipes | reproducible builds |
| Automattic/studio | 548 | 2026-11-03 | GPL-2.0 | official | desktop app + CLI, WP-CLI inside, preview links, `skills/studio-cli` | local dev and client previews (W027's tool) |
| WordPress/gutenberg | 11,780 | 2026-11-03 | other | official | block editor, Interactivity API, wp-env, e2e-test-utils-playwright | block/FSE builds, Docker dev, tests |
| WordPress/create-block-theme | 425 | 2026-10-01 | GPL-2.0 | official | create/export block themes | theme packaging |
| WordPress/performance | 466 | 2026-10-31 | GPL-2.0 | official | Performance Lab | speed standard (W122) |
| GoogleChrome/lighthouse-ci | 7,128 | 2026-11-03 | Apache-2.0 | Google | Lighthouse on every commit | performance gate |
| WordPress/WordPress-Coding-Standards | 2,839 | 2026-11-03 | MIT | official | PHPCS rules | code gate |
| szepeviktor/phpstan-wordpress | 334 | 2026-11-01 | MIT | community | static analysis | code gate |
| WordPress/ai | 381 | 2026-11-03 | GPL-2.0 | official | AI features plugin | watch |
| WordPress/php-ai-client | 309 | 2026-10-28 | GPL-2.0 | official | provider-agnostic AI SDK | client-site AI |
| Automattic/agents-api | 34 | 2026-10-21 | none | official | building blocks for WordPress AI agents | watch |
| wp-graphql/wp-graphql | 3,796 | 2026-11-02 | GPL-3.0 | community-official | GraphQL API | headless |
| wp-graphql/wp-graphql-woocommerce | 714 | 2026-11-02 | GPL-3.0 | community | Woo over GraphQL | headless store |
| wpengine/faustjs | 1,608 | 2026-11-03 | other | WP Engine | headless toolkit for Next.js | headless award sites |
| w3bdesign/nextjs-woocommerce | 610 | 2026-11-02 | AGPL-3.0 | community | Next.js + Woo storefront | principles only |
| msrbuilds/elementor-mcp | 759 | 2026-11-01 | GPL-2.0 | community | Elementor tools | only for Elementor clients |
| AgriciDaniel/wp-mcp-ultimate | 170 | 2026-08-04 | GPL-2.0 | community | 58 abilities | backup to mcp-adapter |
| techspawn/woocommerce-mcp-server | 104 | 2025-11-10 | not measured | community | REST-based Woo MCP | outdated next to the official one |
| Automattic/wordpress-agent-skills | 120 | 2026-03-17 | none | official | older skills | replaced by WordPress/agent-skills |

Practitioner view (InstaWP guide, 2026-10-27, via exa — two blog sources only, ⚠ UNVERIFIED as a consensus): MCP for the live site, shell/WP-CLI/Git for code; check the site itself, not the agent's summary (in their test one of five reported plugin updates had happened); never push a staging database over a live Woo store — push code, replay content and settings.

## 3. Paid twins

| Open piece | Paid twin | Price |
|---|---|---|
| Playground / Studio / wp-env | InstaWP sandboxes + managed hosting, InstaMCP (43 tools), Claude connector | $5/mo per site, $2 per staging sandbox (instawp.com/pricing) |
| self-hosted WordPress | Kinsta | $35/mo, $30/mo yearly (exa, kinsta.com/pricing) |
| self-hosted WordPress | WP Engine, WordPress.com Business/Commerce, Pressable | not measured |
| WooCommerce core + Blocks | paid Woo.com extensions, e.g. Subscriptions | $279/yr; others from $79/yr |
| mcp-adapter / community MCPs | Elementor MCP Pro; AI Engine Pro | Elementor Pro $60–$204/yr (secondary source); AI Engine not measured |
| create-block-theme / FSE | Kadence, GeneratePress Premium, Bricks | not measured |
| Lighthouse CI / Performance Lab | Cloudflare APO, Cloudways | not measured |
| WPGraphQL / Faust | WP Engine Atlas | not measured |

## 4. Recommendation (in order)

1. WordPress/agent-skills — official expert knowledge already written as agent skills.
2. WP-CLI — every repeatable build, fill and deploy step.
3. WordPress Playground + its MCP + Blueprints — disposable sandboxes and JSON site recipes.
4. WordPress Studio CLI or wp-env (Docker) — persistent local staging with preview links.
5. WordPress/mcp-adapter + mcp-wordpress-remote + WooCommerce's built-in MCP — writes off by default, behind the gate.
6. Gutenberg toolchain + create-block-theme — block themes, FSE, Interactivity API; e2e-test-utils-playwright.
7. Quality gates — WordPress-Coding-Standards, phpstan-wordpress, Lighthouse CI, Performance Lab.
8. Headless option — WPGraphQL, wp-graphql-woocommerce, Faust.js for a Next.js front end.

The WordPress/WooCommerce seat's path: brief → Playground blueprint → persistent site in Studio or wp-env → block theme with patterns and Interactivity API in Git → content and products by WP-CLI or the Woo MCP on staging → gates (PHPCS, PHPStan, Playwright incl. checkout, Lighthouse CI) → Studio preview link to the client → deploy code by Git/rsync with WP-CLI migrations, never overwrite the live database → live MCP writes and money-touching settings behind the approval gate.

## 5. Not measured

Reddit (no results) and HN (one post) gave no practitioner consensus; prices of WP Engine, WordPress.com, Pressable, AI Engine Pro, Kadence/GeneratePress/Bricks, Cloudflare APO; the licence meaning of "none"/"other" on several official repos; whether WooCommerce's MCP is still a developer preview; whether `@wp-playground/mcp` and the Studio CLI run on this machine (not run).
