# k3-a — second reading of k3-01, k3-02, k3-11, k3-31 (tab "Kasım 3-4 web linkleri"), 2026-11-18

No video was watched, downloaded or transcribed. Fetched text only (article, Google policy page, X thread, GitHub repo, one agency page). Captures are in `$J/rows/k3-a-src/`.

## k3-01 (c01, twin w073) — a 10-slide SEO/AEO/GEO topic map from an Indian SEO agency's Instagram

- **Opened:** `$J/old/k3-01.json`. The twin: `.planning/research/watch-links/2026-11-16-whatsapp/plan.jsonl:36` and `recheck/h7.md:90-143`. h7 read all 10 slides on 2026-11-17 and wrote them out branch by branch at `h7.md:92-102`, so I did not view them again. `$J/src/k3-01.txt` is empty. I measured the gap list again today (grep over `B84.md`, `tracks/1-seo.md`, `tracks/2-aeo-geo.md` and the 12 OpenSEO `SKILL.md`). I also checked `~/tools/ECC/skills/seo/SKILL.md`, which h7 did not open, and the account owner's site (one exa search). **Not read:** the post's comments.
- **His note:** "Son paylaşım; onun sözü: web işinde SEO, AEO, GEO çok önemli. Slaytlar $J/carousel/seo-aeo-geo/ altında hazır."
- **Where it already stands:** `plan.jsonl:36` has "Gerek yok" with tahta "—". `h7.md:143` has the reader's "İzle", with the suggestion to use the maps as B84's coverage checklist (`h7.md:141`). No board-row file mentions w073: `grep -rn w073 .planning/board-rows` returns nothing.
- **What is in it:** 60 branches with one line each and no sources (see h7.md:92-102). The account is **Nextgen Search Engine**, an agency in Indore founded in 2021 by Ameya Shriwas. Its own site (updated Oct 2026) says it sells SEO, Local SEO, AEO, GEO and ads month to month, with 100+ projects and 35+ clients. The carousels are its top-of-funnel: its page claims 35,000+ Instagram followers, and its other posts carry a "DM PLAN" lead magnet. That funnel has the same shape as ours at `REVENUE-OPPORTUNITIES.md:264`, so there is nothing new in it.
- **What we have:** Every branch that has an owner is mapped in `h7.md:104-127`: OpenSEO skills, `B84.md:77, :89, :181, :182`, and `tracks/1-seo.md` / `2-aeo-geo.md`.
- **What the placement lacks or gets wrong:**
  1. **h7's gap list never reached the board.** I re-measured it today. Each of these has 0 hits in B84.md, 1-seo.md, 2-aeo-geo.md and OpenSEO: voice search, long-tail keywords, featured-snippet / answer-first targeting, NAP consistency, and content refresh/decay as a routine. Rank-tracking cadence: the tools are in B84's trial (`B84.md:91`), but no cadence is written. OpenSEO `local-seo` has no address/phone consistency check, and track §3.10 does not cover NAP either.
  2. **One correction to h7.** h7 found mobile-first in no skill. `~/tools/ECC/skills/seo/SKILL.md:28` has it ("indexing is mobile-first"). ECC is a clone (affaan-m/ECC, commit 5b173d2e, 2026-06-11), not a skill on our shelf.
  3. The slide lines our evidence rejects (FAQ sections and schema, "first 40–60 words", "Be Mentioned on Reddit/Quora") stay rejected. h7 holds on these.
- **Board:** B84.
  - **What stands there now:** the search specialist seat (decision 6) and the graded tracks `1-seo.md` and `2-aeo-geo.md` in the web cupboard (`web-cupboard/INDEX.md`).
  - **Relation:** `method`.
  - **How it is used:** the 60 branches become a one-page coverage matrix in the web cupboard. Each branch points to its graded note, skill or gate line, or is marked "rejected, and why". The five gaps each get a graded note written from primary sources (Google's docs on featured snippets and mobile-first indexing; the GBP guidelines for NAP), not from this carousel.
  - **First trial:** build the matrix from `h7.md:104-136` and count the branches with no owner. It is done when every branch points somewhere.
  - **What stops at the CEO:** nothing.
- **The old verdict and reason:** partly. "Shallow, no lesson in it" holds. "Every heading is in OpenSEO" did not hold (h7). Given his note that SEO, AEO and GEO matter very much, the coverage use should land on B84, not on "—".
- **Reader's first reading:** **Yöntem** (the coverage matrix and five gap notes only; nothing to install or learn from the post itself).

## k3-02 (c02, twin w066) — Voxyz's "12 checks + the phone list" prompt for AI-built sites

- **Opened:** `$J/old/k3-02.json`. The twin: `plan.jsonl:35` ("Kur"), `B84.md:182`, and `REVENUE-OPPORTUNITIES.md:234` (prospect audit). I read the X thread again today through the research door's opencli (`$J/rows/k3-a-src/k3-02-thread.yaml`, 15 KB): the post, the quoted phone post and 16 replies. `$J/src/k3-02.txt` is empty. Nothing unread.
- **His note:** "Yapay zekâ ile kurulan site Google'da adıyla bile bulunamıyor"
- **Where it already stands:** `B84.md:182` places it as a release-gate gain, with our own additions on top (Search Console + URL Inspection first, Organization/site-name markup, hreflang, AI crawlers, INP, CrUX, new-domain silence). `REVENUE-OPPORTUNITIES.md:234` names the 12 checks as part of the secret-shopper prospect audit (B83 H7). Both placements are right.
- **What is in it (re-read):** The post is dated 2026-10-30, with 348 likes and 22 reposts. It has twelve checks in three groups, then a closing instruction to Claude Code. The quoted post (same day) is the phone list.
- **What the placement lacks** (I compared it line by line with `B84.md:182`):
  1. **The method is missing; only the checks are written.** The closing instruction says:
     - one subagent per group checks *without editing* and lists the URLs and files behind each problem;
     - one writer fixes everything from those lists in one pass;
     - every main page is curled before any change (title plus how the body text starts) and again after, and both are shown;
     - anything that does not apply is skipped;
     - the run ends with a list of what must be confirmed by logging in to Search Console.

     This is the executable shape of "the machine" on every job (decision 6), and it matches our own pattern of read-only helpers with one writer.
  2. **Checks missing from :182:**
     - robots.txt / noindex used only for admin and login pages;
     - the sitemap lists only indexable URLs that return 200, and the sitemap is named in robots.txt;
     - **canonical on the production domain, not the preview or staging host** (reply by v3n0msnake007, 2 likes). Our sites are built on a bench or preview and then go live, so this belongs at launch (B84 "A job, end to end", step 8);
     - **analytics actually fires after deploy** (reply by LouieMota88: his collector did not come along when he moved hosts, and he found out days later). This is a launch check too.
  3. **Phone items missing from :182** (:182 has 16 px inputs, the hover media query, 44 px targets, dvh/svh and safe areas):
     - zoom never disabled (`maximum-scale=1` / `user-scalable=no`);
     - the right keyboard (`inputmode="decimal"` or `"numeric"`, `type="email"` or `"tel"`);
     - `touch-action: manipulation`;
     - tap highlight off, with an `:active` state on everything tappable;
     - `user-select: none` on controls only, never on body text;
     - no sideways scroll;
     - `viewport-fit=cover` with `env(safe-area-inset-*)`;
     - the closing line: "tell me which ones won't show up in a phone emulator and need checking on a real phone". What an emulator cannot show is listed for a real-device check.
- **Board:** B84.
  - **What stands there now:** `B84.md:182` itself, the release gates in tracks §6, and the acceptance gate's phone visitor (`B84.md:187`).
  - **Relation:** `method` (additions to an existing placement).
  - **How it is used:** the additions are written into :182 when the cupboard's release-gate list is built (B84 rank steps 3-5). The production canonical and "analytics fires" go into launch step 8.
  - **First trial:** run the post's closing instruction as written on the first bench site, plus a copy deliberately broken in the AI-site ways: empty root, a 404 page that answers 200, a staging canonical, a missing tag. Count planted defects found and fixed. The before/after curl is the evidence.
  - **What stops at the CEO:** nothing.
- **The old verdict and reason:** holds. It is a prompt, it is placed, and the old additions are right. What remains is the list above.
- **Reader's first reading:** **Kur** (already placed at B84.md:182; only the additions above remain).

## k3-11 (c11) — "Real-Time SEO Process", 10 steps on a made-up plant shop (Nextgen Search Engine, AI-made images)

- **Opened:** `$J/old/k3-11.json`. All 10 slides at `.planning/quick/20261103-web-ders/carousel/c11/slide01-10.png`, viewed one by one. Google's spam policies page (fetched today, "Last updated 2026-08-28 UTC"; `$J/rows/k3-a-src/k3-11-spam-policies.md`). The agency's own site, via exa. For comparison: OpenSEO `seo-report` and `local-seo`, `tracks/1-seo.md` §3.11, and `B84.md:115-124`. **Not read:** the 20 comments.
- **His note:** "Ameya Shriwas, SEO PPC web developer"
- **What is in it:** The post is from August 4, with 839 likes, 20 comments and 73 reposts. The old row said 2026-08-08. Instagram labels the account "AI content", and the slide numbers are invented sample figures.
  1. Cover.
  2. Choose the site: business type, products, location, competitors, goals. Output: "SEO objective defined".
  3. Audit with Screaming Frog, Ahrefs, SEMrush and GSC. Sample report: 120 issues, 253 pages, health 78 %, 92 % indexable.
  4. Keyword mapping table: page | primary | secondary | long-tail.
  5. Technical fixes as a before/after table, with the action taken per issue.
  6. On-page checklist (element | current | recommendation | status), with a before/after for title, meta, H1 and URL.
  7. Off-page: guest posting "10+ blogs", business listings "20+ directories", "15+ high-quality backlinks", social signals, DA 32, spam score 2 %.
  8. GA4, GSC, GTM and SEMrush set up, with events for form submit, add to cart, purchase and page view.
  9. A 6-month report: position table (previous / current / change / volume), traffic sources, technical health, backlinks new and lost, next steps, next review in 30 days.
  10. The 10-step workflow.
- **The old reader's two open points are now closed:**
  1. **Ameya Shriwas** is the founder of Nextgen Search Engine (Indore, 2021), the account behind this post and k3-01. Source: the agency's site and its page "Who is Ameya Shriwas?", 2026-10-21.
  2. **Link spam:** Google's policy names as link spam "Low-quality directory or bookmark site links" and "links with optimized anchor text in articles, guest posts, or press releases distributed on other sites". Slide 7's "20+ directories / 10+ guest posts" targets are that shape. Our `tracks/1-seo.md:99` (§3.11) already says the same ("Ceza getiren: satın alma, ağlar…"), so we already have this.
- **What we have:**
  - OpenSEO `seo-audit`, `keyword-clustering` (page mapping), `link-prospecting` and `seo-report` (`~/.local/share/dxb/skills/openseo/`);
  - B84's tools (`B84.md:89`);
  - the measurement template (`tracks/4-reklam-olcum.md` §3.1);
  - link rules (`1-seo.md` §3.11).
- **What it has that we do not:** One thing, and it is structure, not knowledge. The SEO-only client path is written as steps that each leave a named artefact for the client: objective → audit report → keyword map → technical fix log (before/after) → on-page log (before/after) → link plan → tracking proof → monthly report. `B84.md:115-124` ("A job, end to end") is the site-build path. A client who comes only for SEO on an existing site (decision 8 sells "SEO incl. AI search") has no written path. The substance for that path is in our tracks, not in this post. The period-over-period report shape is not in OpenSEO `seo-report`, whose findings are Problem / Change / Expected effect. It belongs to d11's row, which `MERGE.md:5` names as the monthly delivery format.
- **Board:** B84.
  - **What stands there now:** "A job, end to end" (site build only) and the OpenSEO skills.
  - **Relation:** `method` (narrow).
  - **How it is used:** when the "site" job types are written on B64's desk (B84 rank step 5), an SEO-only job type lists the artefact each step leaves, with its content taken from `1-seo.md`.
  - **First trial:** none on its own; it is checked when that job type is written.
  - **What stops at the CEO:** nothing.
- **Note for the lead (one line, not this row's subject):** Google's policy also names "Excessive link exchanges … or partner pages exclusively for the sake of cross-linking", and our own §3.11 counts "ağlar" (networks) as penalised. Decision 15 (the holding's own 25-30 sites linking to clients, `B84.md:75`) is his strategy and stands. The risk is named here once so the newsletter articles are written as real editorial pieces, not as a link network.
- **The old verdict and reason:** holds. It is a beginner process with invented numbers, and its link targets are the shape Google names as spam.
- **Reader's first reading:** **Gerek yok**.

## k3-31 (d21) — Dave Davies (Search Engine Land, 2026-11-02): an action-oriented second brain for SEO, and his public JSON-LD schema skill

- **Opened:** `$J/old/k3-31.json`.
  - `$J/src/k3-31.txt` is **a false match**: 240 unrelated paths `…/audit.5X7wbs/p*/gen/d21/f*.ts|md` from another session's scratch. The article was not on disk.
  - I fetched the article: `fetch.py` resolved share.google to firecrawl, `read=True`, 41,880 bytes, saved at `$J/rows/k3-a-src/k3-31-article.md`. Read whole.
  - The schema skill the old reader could not find is linked in the article: `skills.sh/onlineinference/json-ld-schema-generator`, which leads to GitHub `onlineinference/json-ld-schema-generator`. I read the README and SKILL.md whole (342 lines), read the repo metadata and file tree through `gh api`, and scanned the two scripts' imports.
  - **Not read:** the 7 reference files and the two "Dig deeper" articles (including searchengineland.com/client-brain-ai-context-seo-479095).
- **His note:** "SEO için eyleme dönük ikinci beyin"
- **What is in it:**
  - **The system:** Markdown and JSON in Git, with no vector database and no paid service. It has operating instructions, skills with references, knowledge records, a discovery index, task state and a feedback inbox. Codex runs it each weekday:
    - it starts at 05:30, aims to be ready by 06:30, and stops taking on deep work at 06:20;
    - it takes an inventory, picks up to 10 groups of related tasks (which share source reads) and prepares at most 5 drafts;
    - a draft that is waiting for him is redone only if its input changed, he gave feedback, a defect was verified, or he asks;
    - he gets a "Start here" Slack line: one task, why now, the next action, and a link to the draft.
  - **Approval:** every output is labelled UNREVIEWED and only the human removes the label. An approved example then replaces the old one: one example per task shape ("Twenty near-identical examples give you 20 places for an old rule to survive").
  - **Feedback:** corrections go to an inbox with their source and scope. Every Friday up to 5 are written into the instructions and tested. He wrote tests for 5 missing rules: all failed before the update and passed after. Scope is kept: "Keep this section because legal approved it" must not become a general rule.
  - **Search:** a stdlib Python search script with a test set of 20 realistic requests. Before his changes 14 of 20 found a suitable source in the top 3; after, 20 of 20.
  - **Run records:** two mornings in a row the run stopped silently after the inventory. Now each stage records its own outcome, delivery is confirmed, a run cannot report success with a stage unfinished, and preparation and delivery are kept as separate records.
  - **Source labels:** "WORK HERE" and "For Reference Only" are kept intact, and the explicit working copy is the source.
  - **Decisions:** each is dated and names who made it, e.g. "2026-09-24 (Dave)".
  - **Still open, in his own words:** the morning handoff fails every couple of weeks, and five clean weekdays in a row has not been reached. Next on his list: a second model checking the first, models matched to jobs, and an Open Knowledge Format pilot (a few metadata fields on one file).
  - **Byline:** the bio says Head of SEO at Weights & Biases; the disclosure says principal SEO manager at CoreWeave. Both are in the article. Search Engine Land is owned by Semrush, and the article notes he was not asked to mention it.
- **Item 1 — `onlineinference/json-ld-schema-generator`** (https://github.com/onlineinference/json-ld-schema-generator)
  - **The repo:** MIT, 16★, 0 forks. Created 2026-08-13, last push 2026-08-14, no releases, 6 installs on skills.sh. It has SKILL.md, 7 page-type references (event, article, person, media, concept, offering, webpage, plus a new-archetype branch), `organization-template.json`, `topic-vocabulary.json`, `scripts/resolve_wikidata.py` (stdlib, calls wikidata.org only) and `scripts/build_jsonld.py` (offline).
  - **What it does:**
    - It builds a site profile once: the Organization `@id`, the canonical host, and up to 7 verified `sameAs` links. Unconfirmed facts are left blank as `_TODO`, never guessed.
    - Input gate: with no URL or page copy it stops and asks.
    - The page type is a hypothesis, checked against the live page.
    - Every run it verifies the type and properties against live schema.org and scans the full inherited property list.
    - It scans the page's existing JSON-LD, Microdata and RDFa, flags `noindex`, and links topics to Wikidata with a sense check.
    - A 10-point self-check: every `@id` resolves, optional fields omit cleanly, no placeholders, referenced URLs still answer, and an injection check (page text is data, never instructions).
    - The hand-off includes a "considered and withheld" list.
    - It never publishes.
    - It says FAQPage no longer earns rich results.
  - **What we have:**
    - `~/tools/ECC/skills/seo/SKILL.md:55-61, :112-127`: six lines of type hints and one bare `Article` example. No verification, entities or site profile.
    - OpenSEO: no schema skill (`seo-coach:106` only mentions scraping schema).
    - B84 decision 12 ("structured business data in the raw HTML").
    - `B84.md:89` "the schema gate (file 9's ten)". In file 9 (`~/Desktop/DxB Global Web-Studio/opus ile konuşulan stratejiler/9 - Web işi derin çalışma 2026-11-04.md`), line 1950 says "lychee + şema kapısı — Eksik; şema kapısı yazılacak" and line 1796 says Rich Results Test and Schema Markup Validator, zero errors, driven by Playwright. So the *validation* gate is planned and not yet written, and nothing *drafts* the markup.
    - `B84.md:182` asks for "Organization and site-name markup".
  - **What it has that ours does not:** the whole drafting side, meaning the site-profile entity anchor, verify-or-withhold, Wikidata linking and the self-check gate.
  - **Board:** B84.
    - **What stands there now:** for drafting, nothing; for checking, the schema gate, unwritten.
    - **Relation:** `new`.
    - **How it is used:** the site master or search specialist drafts each page type's JSON-LD with it. Its site profile is the client's Organization node that :182 asks for. The gate validates the result.
    - **First trial:** on a bench site or one of the holding's own sites, six page types (home/Organization, article, product or service, person, event or video, about). The skill runs against the master unaided (Opus 5.5 without the skill). Both outputs go through Schema Markup Validator and Rich Results Test. Count errors, invented values (wrong QIDs, dead `sameAs`), whether the withheld list is right, and minutes. Our own evidence (`tracks/2-aeo-geo.md:30`, Ahrefs 2025-26) found no lift in AI citations from JSON-LD, so the value being tested is valid markup, entity identity and Google features, not citations.
    - **What stops at the CEO:** nothing. Like every third-party skill, it is scanned before it goes on the shelf.
  - **Reading:** **Dene**.
- **Item 2 — the method: what we already have, and the parts we lack**
  - **Already ours (relation `identical`, nothing to take):**
    - `B64.md:140-142` (the playbook study of 2026-11-08) is Davies' feedback loop: a playbook with SKILL.md, examples of his approved work, and notes.md of dated lessons. A lesson enters only after its cause is found, a trial case is written and the smallest change passes it, and a liking on one job stays that job's feedback.
    - UNREVIEWED is LAW B plus `ceo-approvals.json`, and B84 decisions 4 and 5.
    - The second model checking the first is Sol.
    - Models matched to jobs is B51.
  - **(a) One example per shape, replaced, never piled up.** `B64.md:140` says "examples/ of his approved work" with no replace rule.
    - **Owner:** B64. **Relation:** `method`.
    - **Use:** an approved better example replaces the older one of the same shape; a new client or URL is not a new shape.
  - **(b) The router's test set.** `B64.md:140` has the router attach the playbook (measured: leaving the choice to the model collapses as the library grows), but no test is named.
    - **Owner:** B64. **Relation:** `method`.
    - **Use:** 20 realistic requests, each with the playbook it must reach, measured as top-3 before and after every change to the playbook library.
  - **(c) Morning preparation for recurring client work.** This is for the monthly SEO and content packages (B84 decision 8). Nothing in B84 or B64 prepares drafts ahead of the day.
    - **Owner:** B84 (the job desk is B64). **Relation:** `new`.
    - **Use:**
      - a scheduled run on our own scheduler takes an inventory, takes at most N related groups and makes at most M drafts;
      - a draft waiting for review is redone only on changed input, feedback, a verified defect or an ask;
      - the brief opens with "Start here";
      - each client's decisions are dated, with who and where to verify;
      - the client's explicit working copy is the source.
    - **First trial:** one sample client (one of the holding's own sites), two recurring tasks (page review, schema) for a week. Measure how many corrections hold in the next job, which is the author's own measure, and hours saved.
  - **(d) Stage records.** Each stage records its own outcome. A run cannot report success with a stage unfinished. Preparation and delivery are separate records. An unclear tool result is checked before posting again.
    - **Owner:** B75 (the engine hides no failure; its F-R6-4 "the mirror can report success when the main push failed"). The same disease is B72's "writes `BACKUP_OK` and then `scp: Connection closed`".
    - **What stands there now:** `B64.md:150` (the finish contract, COMPLETE/CONTINUE, i011).
    - **Relation:** `method`.
    - **First trial:** the backup job of B72 written as stages (local copy → off-site copy → confirmed), where success is only "all stages confirmed". Seeded with tonight's `scp` failure, it must report failure.
  - **Not taken:** the Open Knowledge Format pilot. The author has no result, and our `CEO-OK` ledger already carries status. Revisit only if B74 asks for record status fields.
- **What stops at the CEO:** nothing in any item. No money, account or contract is involved.
- **The old verdict and reason:** partly.
  - "Dene" and "the skeleton of B84's monthly work" hold.
  - "Half the logic we have" understated it: `B64.md:140-142` already holds the feedback loop, scoped feedback and approved examples, and the old reader wrote "no separate search was made" for exactly those.
  - "The schema skill could not be found" no longer holds: it is found and read above.
  - The old src pointer was a false match.
- **Reader's first reading:** **Dene** (the schema skill), with **Yöntem** for (a)-(d).

## Commands run (decisive ones)

- `python3 fetch.py https://share.google/E9BtLaIXSo9z2LqUY --out …/k3-31-article.md` → `read=True door=firecrawl-scrape bytes=41880`
- `python3 fetch.py https://www.skills.sh/onlineinference/json-ld-schema-generator --no-browser` → `read=True door=scrapling bytes=1980` (shows `npx skills add onlineinference/json-ld-schema-generator`, 6 installs)
- `gh api users/onlineinference/repos` · `gh api repos/onlineinference/json-ld-schema-generator` → `2026-08-13 / 2026-08-14 / 16★ / 0 forks / MIT` · `git/trees/HEAD?recursive=1` (15 files) · `contents/{README.md,SKILL.md,scripts/*.py,references/output-conventions.md}`
- `python3 fetch.py https://developers.google.com/search/docs/essentials/spam-policies --no-browser` → `read=True bytes=60864`, "Last updated 2026-08-28 UTC", link spam list at lines 530-556
- `.claude/skills/dxb-research/bin/opencli twitter thread https://x.com/Voxyz_ai/status/2116304148228722833 -f yaml` → 15,439 bytes, post plus quoted post plus 16 replies. The bare `opencli` refused ("run opencli from the dxb-research door").
- `mcpx.sh exa "Ameya Shriwas nextgensearchengine SEO" 5` → the agency's home page and founder page
- Coverage greps: `grep -ciE "<term>"` over `B84.md`, `tracks/1-seo.md`, `tracks/2-aeo-geo.md`, and `cat ~/.local/share/dxb/skills/openseo/*/SKILL.md | grep -ciE` → 0 for voice search, long-tail, NAP, featured snippet, content decay
- `find ~/tools/ECC ~/.hermes/hermes-agent ~/.hermes/skills -maxdepth 4 -type d | grep -iE "seo|schema"` → `~/tools/ECC/skills/seo` only
- `grep -rn "w073\|w066" .planning/board-rows` → `B84.md:182`, `:199` (w066 only)

## Not read

- The comments under k3-01 and k3-11.
- The json-ld-schema-generator's 7 per-page-type reference files (only `output-conventions.md` was downloaded, and it was not read).
- The two "Dig deeper" articles linked from k3-31.
- k3-01's slides were not viewed again by me; h7.md's transcription of 2026-11-17 was used.
