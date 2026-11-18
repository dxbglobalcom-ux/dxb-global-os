# e2-d — rows e2-07, e2-10, e2-14 (tab "Ekim 15-21 linkleri"), second reading

All three links are the same links as rows in the 24 Sep - 16 Nov WhatsApp tab, and all three already stand on
the board through that tab. Measured: `grep` of the three URLs in
`.planning/research/watch-links/2026-11-16-whatsapp/items.tsv` gives e2-07 = **w036** (line 80), e2-10 = **w039**
(line 6) and e2-14 = **w043** (line 21). w036 is written in `.planning/board-rows/B84.md:232`, w039 in
`.planning/board-rows/B73.md:41-47` and w043 in `.planning/board-rows/B84.md:185-187`. This reading therefore
reports what those placements still lack.

Source texts fetched for this reading (X threads, text only):
`$J/rows/e2-d-src/ek18.yaml` and `$J/rows/e2-d-src/ek22.yaml`, from
`PATH=".claude/skills/dxb-research/bin:$PATH" opencli twitter thread <url> -f yaml`. The bare `opencli` refuses X
outside the research door.

---

## e2-07 (EK15) — a 76-second marketer reel: run a page-by-page SEO audit as a Claude Code `/loop` (a method, no tool)

- **Opened:**
  - The transcript, read whole: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/256bdf75-f60f-462a-b0f6-dc568940ee88/scratchpad/recheck/transcripts/w036-DehmfSekvuX.txt` (76 s, English).
  - Frame sheets: none on disk (`find` for `*DehmfSekvuX*` finds only the .mp4, .err and .lock files in `~/.cache/link-watch/`). The video was not opened, on his order. The old row says the 3/12/30/60 s frames show only the prompt being typed.
  - Yesterday's reading of the twin row w036: `.../recheck/rows/h6.md:13-36`. Board row file: `B84.md:227-232`.
  - Measured on this machine: docker, the npm globals and `command -v` for the SEO tools.
- **His note:** none.
- **What is in it** (transcript):
  - "Give it your website and then say slash loop".
  - The prompt: "SEO analyze a page of my website. Give me everything I need to do to change from technical to text to tracking… write up a change log and save it as a PDF. Then mark that you did that page and go on to the next one."
  - How he describes `/loop`: it makes "a loop trigger… after you finish running this… wait a few minutes and then do it again until I tell you to stop". So it is a timed repeat with no stop condition, not a queue.
  - His claim: page by page, "product by product, service by service", gives "much better results" than "a big broad website hit".
  - Deploying the SEO is "a whole nother conversation" and is not shown.
  - No tool, no number and no result appear.
- **What we have:**
  - `/loop` is the built-in Claude Code skill, listed in this session's skill list ("Run a prompt or slash command on a recurring interval"). Identical. It is eliminated as a tool.
  - The method itself is already written in `B84.md:232` as "The page-by-page SEO audit (row w036, h6.md)". The plan there: compare it with OpenSEO's sampled `seo-audit` (`~/.local/share/dxb/skills/openseo/seo-audit/SKILL.md:51,97`) on 10-20 pages of one of the holding's own sites, using the free crawler and Lighthouse. Minutes and tokens per page set the price.
  - Tools for that trial, measured today:
    - On PATH or in npm globals: no `lighthouse`, `unlighthouse`, `lychee`, `pa11y`, `axe` or Screaming Frog.
    - Docker images `dxbcrawl-librecrawl:local` and `dxbcrawl-seonaut:local` exist. No container of them is running (`docker ps -a` shows none).
    - No OpenSEO image.
- **What it has that we do not:** nothing beyond what B84:232 already holds. One detail is not written there: the reel's loop is timed and open-ended. The B84 trial should run as a page queue with a stop condition. Inside the holding that is one runtime job per page (pg-boss, which `STACK.md` names as the job runtime), not a session `/loop` that "waits a few minutes until I tell you to stop".
- **Board:**
  - Row: B84 (Web Studio, SEO and content).
  - What stands there now: the same method, written at B84.md:232, compared against OpenSEO `seo-audit`.
  - Relation: method (already placed).
  - Use: the office's every-page audit with a per-page log and a done mark. Add the queue shape to that line (one job per URL, status todo/done, stop when the queue is empty or the page/token budget is reached). The rest is unchanged.
  - First trial: as B84:232 already says. Two facts for whoever runs it:
    - Lighthouse, lychee and axe are not installed here.
    - The crawler images exist but are stopped.
  - Stops at the CEO: nothing (no DataForSEO in the trial).
- **The old verdict and reason:** partly holds. `/loop` is ours and the reel carries no tool. But "Gerek yok" under B28 sank a sellable audit method that belongs to B84. The twin row's re-reading already corrected that.
- **Reader's first reading:** Yöntem (already in B84; only the queue line is to be added).

---

## e2-10 (EK18) — Vox's post: run Anthropic's official `claude-security` plugin over the whole repository

- **Opened:**
  - The X thread with all replies, via the research door's `opencli` (`$J/rows/e2-d-src/ek18.yaml`, read whole).
  - The plugin's marketplace copy: `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/claude-security/` (README.md whole, `.claude-plugin/plugin.json`, LICENSE, the agents/workflows/skills file list).
  - `~/.claude/plugins/installed_plugins.json`.
  - `B73.md` lines 1-51.
  - `supabase/splinter` through `gh api` (repo metadata, README head, the `lints/` listing).
  - The repository's Supabase CLI 2.109.0 (`node_modules/.bin/supabase`).
  - `$J/src/e2-10.txt` is empty: there is no video, and the post is text.
- **His note:** none.
- **What is in it:**
  - The post (1,468 likes, 2026-10-16) gives three lines: `/plugin install claude-security@claude-plugins-official`, `/reload-plugins`, `/claude-security scan the whole repo at high`. Then "Suggest patches".
  - The post's claim: "three more agents… only makes the report if two of them agree".
  - The README (v0.12.0) says it differently. Every candidate finding goes to independent verifiers told to disprove it. Once two confirming verifiers have rated a finding, it cannot carry a higher severity than they support. The verification tally is computed in code. No fixed "3" appears.
  - Output: `CLAUDE-SECURITY-<ts>/` holding MD, JSONL with stable finding ids, SARIF 2.1.0, and a revision stamp that marks a dirty tree. The folder has its own `.gitignore`.
  - There is a separate secrets pass, and credentials are redacted in the report.
  - Patches are built in a scratch copy and reviewed. One `F<n>.patch` is written per finding and none is applied.
  - The repository's CLAUDE.md is read as data, not obeyed.
  - Replies worth keeping:
    - nihalsaket1: one CRITICAL, a live service key in a two-year-old migration. "Most of an afternoon", "a serious chunk of my usage for the week".
    - darkguy2008: +20 % weekly usage on a 20x plan.
    - kaizenpromptlab: scan the branch diff first, and ask for a failing test per CRITICAL/HIGH before applying a patch.
    - **DSanchezProf:** the plugin "will not catch the Supabase class that actually leaks". He means a permissive RLS policy or an edge function with `verify_jwt=false`, which are authorization problems, not code smells. "Security Advisor green… is proof the lint passed."
- **What we have:**
  - The plugin is on the shelf, not installed. The marketplace copy is v0.12.0; `installed_plugins.json` has no `claude-security` key (measured `False`).
  - The built-in `/security-review` reviews only the pending change.
  - B73 already carries the recipe and his decision. The recipe was added 2026-11-17 from twin row w039. His decision of 2026-10-15 (YE04): "one narrow scan at this rank — the database migrations and the doors only, at medium; the full and repeated scans after revenue."
  - Supabase's Security Advisor lints (splinter): not found anywhere in board-rows, skills, STACK, db or scripts. The repo's Supabase CLI has no advisor command; `db lint` is only the plpgsql type check.
- **What it has that we do not:**
  1. A whole-repository, verification-gated security scan with stable ids and SARIF. Nothing of ours does this.
  2. Not in B73, and decisive for trusting the scan: **B73 already holds an answer key.** These are the R1/R5/Sol findings (F-R1-3: 16 anon-executable definers; F-R1-4: every signed-in account is CEO; F-R1-5: functions born callable by anyone; F-R1-6: anon may TRUNCATE; F-R1-8: the audit log can be signed as "ceo"; F-R1-10: anon reads number settings). The narrow scan of `db/migrations` can be scored against them: how many of the known ones it finds, how many new real ones, how many false.
  3. From the thread, **supabase/splinter**, the SQL behind Supabase's Security Advisor:
     - https://github.com/supabase/splinter, 292★, pushed 2026-11-17, PostgreSQL licence.
     - One file, `splinter.sql`, runs over a database.
     - Its lints map onto B73 by name: `0028_anon_security_definer_function_executable` and `0029_authenticated_security_definer_function_executable` (F-R1-3), `0019_insecure_queue_exposed_in_api` (the pgboss part of F-R1-5), `0024_rls_policy_always_true`, `0013_rls_disabled_in_public`, `0008_rls_enabled_no_policy`, `0023_sensitive_columns_exposed`.
     - No lint name covers TRUNCATE grants (F-R1-6) or the audit-log signature (F-R1-8).
     - It is deterministic, free, takes seconds and can be re-run on every migration. It is the cheap repeated check that claude-security is not.
- **Board:**
  - **claude-security:**
    - Row: B73.
    - What stands there now: this very plugin, recipe written (B73.md:45-46), not installed.
    - Relation: new (the row has no installed tool for the job).
    - Use: his narrow scan, `--scope db/migrations,<the doors' folders> --effort medium`, run by the lead. Patches go through `dxb-team3` with a failing test first.
    - First trial: that narrow scan, scored against B73's known F-R1 list. Recall on the known findings, plus count of new confirmed findings, plus usage spent. That decides whether the full scan after revenue (B76) is worth its quota.
    - Stops at the CEO: nothing new. The narrow scan is his 2026-10-15 decision. The full and repeated scans wait for revenue by the same decision. It spends quota, not money.
  - **supabase/splinter:**
    - Row: B73.
    - What stands there now: nothing; the row's findings came from reading (R1/R5/Sol) and no lint runs.
    - Relation: new, as the deterministic second beside claude-security.
    - Use: `splinter.sql` read against the construction engine (`DxB_Build`, port 54422) after every migration chain, and once SELECT-only against the company to confirm the F-R1 findings still stand. A finding that is gone is closed with its evidence.
    - First trial: one run on the construction engine. List which F-R1 findings it reproduces (expected: F-R1-3 and the pgboss part of F-R1-5) and what else it reports.
    - Stops at the CEO: nothing.
- **The old verdict and reason:** partly holds. "Dene" and the reading of the README hold. The board row B51/B42 does not: B73 owns it and already carries it. The "run it at once because the repo is public" plan was set aside by his 2026-10-15 decision (B73.md:31-35, 43).
- **Reader's first reading:** Kur (the narrow scan his decision already orders), with splinter as Dene beside it.

---

## e2-14 (EK22) — Vox's prompt: four "first-time user" subagents walk the product before launch; the quoted post: three attacker subagents run 14 attacks with proof

- **Opened:**
  - The X thread with all replies and the quoted post, via the research door's `opencli` (`$J/rows/e2-d-src/ek22.yaml`, read whole).
  - The attached image `HVBCEdBWoAIwino.png` was not opened (old row: not opened either). The full prompt is in the post text.
  - `B84.md:175-199` and `:227-235`, `B03-bis.md` whole, `dxb-surface/SKILL.md` (width rules), `B73.md`.
  - The `security-guidance` plugin's marketplace copy (plugin.json, README head).
  - `$J/src/e2-14.txt` is empty: there is no video.
- **His note:** none.
- **What is in it:**
  - **The prompt** (94 likes, 2026-10-19):
    - Check for a browser MCP, or stop and give the Playwright MCP install.
    - Work out "first success" from the code.
    - Four subagents take turns, one after another: impatient (first button, leaves at the first error), sceptic (pricing, terms, privacy), phone (375 px, slow 3G, "if you can't throttle, say so"), breaker (junk input, back halfway, double clicks).
    - Each spot where a user is confused, stuck or wants to leave gets a screenshot in `qa/first-users/` with the step, what was seen and the intent.
    - Each user also reports "would they come back" and the clicks to success.
    - Local or preview only, test email, test-mode payments.
    - Issues at the same spot count as one and are ranked by how many hit them. Pricing, terms and privacy issues are only reported. Everything else is fixed in one pass, then 4 fresh subagents who never saw the list walk again, and a before/after table is produced.
  - **The quoted post** (2111079716832886886): three subagents with test accounts A, B and an admin run 14 attacks.
    - Anon key → query every table.
    - Swap A's id for B's.
    - Add `role: admin` to a profile edit.
    - Reuse a password reset link.
    - Call disabled or hidden actions directly.
    - Call the API after the free uses run out.
    - 20 parallel requests on low credit.
    - Junk and long input.
    - `?next=` open redirect with `//` and `@`.
    - Stored XSS `<img onerror>`.
    - SSRF to localhost and 169.254.169.254.
    - A's cached pages fetched as B or logged out.
    - Preview links opened without logging in.
    - Prompt injection through an uploaded document.
  - **Its proof rules:** an attack "only read in the code" counts as not proven. After a fix, turn the protection off locally: the attack must succeed; turn it back on: it must be refused. The tests are saved as scripts and re-run before the next launch. It also names Anthropic's `security-guidance` plugin.
  - **Replies with something to take:**
    - enekes_abel: turn each flow a walker found into a saved e2e test.
    - humauxdotgc: the fresh batch must re-check the original table too. One real catch: double clicks created duplicate accounts.
    - liuzhao_666: log whether each click was chosen from the screenshot or from an accessibility label. An agent finds a well-named control a sighted newcomer would not notice.
    - vibemode_site: a persona that sees the hero for 3 seconds and must say what the product does.
    - prismawebdev: a persona browsing in another language.
    - MorrowFunnels: the ad-first fifth persona, already in B84.
    - ajs6888: the agents may be "too clever" and fill the newcomer's gaps.
- **What we have:**
  - The four-walker method is already written as B84's acceptance gate (`B84.md:185-187`, from twin rows w043 + w046). It includes the fresh-walker rerun, the ad-first fifth visitor, "fill no gap with a guess", and TestSprite as the paid twin.
  - Playwright MCP is installed: `~/.npm-global/lib/node_modules/@playwright` exists, and `playwright` is in the MCP list.
  - B73 and B84 carry an "attack pass" leg (w029: "break it"). Neither has the 14-item attack list or the protection-off proof rule: `grep` of B73, B84 and dxb-verify for IDOR, 169.254, "password reset link", "protection off", "must succeed", "e2e test" and "accessibility label" finds nothing.
  - B03-bis checks CEO surfaces at 1280 and 1920 only. `dxb-surface` asks for two widths, one at ~1280-1366, and names no phone width.
  - `security-guidance` v2.0.20 is in the marketplace copy and not installed (`installed_plugins.json`: `False`). It is on no board row.
- **What it has that we do not** (beyond B84:187):
  1. The 14-attack list with its protection-off proof rule. Two of the attacks are B73's own open findings, stated as tests: "anon key → query every table" is F-R1-6 (60 of 62 tables), and "`role: admin` in a profile edit" sits next to F-R1-4.
  2. "Turn every found flow into a saved e2e test". This makes the walk a permanent regression test, not a one-off.
  3. A screenshot-or-label log per click, which answers the "too clever" risk with evidence instead of an instruction.
  4. Two more personas: the 3-second hero test and another-language visitor. The holding is global and every surface ships in two locales.
  5. `security-guidance`: regex warnings on Edit/Write, an LLM diff review on every Stop, and an agentic reviewer on every commit/push. It costs extra usage on every turn.
- **Board:**
  - **Four walkers (the row itself):**
    - Row: B84.
    - What stands there now: the same method (B84.md:187).
    - Relation: method (already placed).
    - Use: add items 2-4 to the acceptance-gate sentence. That means: found flows saved as Playwright tests in the job's repo; the fresh batch re-checks the old table; a screenshot-or-label column; a 3-second hero visitor and a second-language visitor.
    - First trial: the first bench site, already planned. Count the real stumbles found, the stumbles left after the fix round, and the share of clicks found only by label.
    - Stops at the CEO: nothing (TestSprite's account stays his, as written).
  - **The 14 attacks + proof rule:**
    - Row: B73, with B84's attack pass for client sites.
    - What stands there now: the attack-pass leg (B73.md:49-51), with "break it" as its whole instruction.
    - Relation: method.
    - Use: the list becomes the attack pass's checklist, and "protection off → it must succeed, on → refused" becomes its proof rule. On our panel it is run with test accounts A, B and an admin on the construction engine only.
    - First trial: anon-key and id-swap attacks against the construction copy (:3100 / 54422). Expected to reproduce F-R1-6 and F-R1-4. A fix later counts only when the protection-off run succeeds and the protection-on run is refused.
    - Stops at the CEO: nothing (no real users, no service we do not own).
  - **Phone + breaker walkers for his own surfaces:**
    - Row: B03-bis.
    - What stands there now: `eye-proof.mjs` at 1280/1920, no persona and no phone width.
    - Relation: method.
    - Use: only two of the four fit a one-user cockpit. The phone walker (375 px) and the breaker (double clicks and back halfway on approval buttons, since a double approval is the real harm) run with the engineer account on :3100. The visual verdict stays his eye (LAW B).
    - First trial: the breaker on one approval card. Does a double click write one decision or two?
    - Stops at the CEO: nothing.
  - **security-guidance:**
    - No row owns per-turn security review of construction sessions. Nearest: B73 (security), and the construction door `dxb-team3`, where Sol audits blind.
    - Counterparts: the built-in `/security-review` (manual, pending change), Sol's audit, and claude-security's "Scan changes".
    - Relation: second.
    - First trial: one job's session with it on, its findings set beside Sol's audit of the same diff, and the extra usage measured.
    - Stops at the CEO: his word, because it is a new install that spends quota in every session it runs in.
- **The old verdict and reason:** partly holds. "Dene" holds and the method is real. The board row B03-bis/B28 was wrong for the main use: B84 owns it, and it is now there. The quoted post's attack list, which the old row did summarise, was never placed anywhere.
- **Reader's first reading:** Yöntem (into B84's gate and B73's attack pass), with security-guidance as İkinci.

---

## Commands run (main ones)

- `grep -P '^(rid|e2-07|e2-10|e2-14)\t' $J/items.tsv` · `grep … $J/inv/e.tsv` · `cat $J/old/<rid>.json $J/src/<rid>.txt`
- Read of the w036 transcript (whole) and of `.../recheck/rows/h6.md:1-50`.
- `PATH="$S/bin:$PATH" opencli twitter thread <url> -f yaml` for both X posts → `$J/rows/e2-d-src/`.
- `grep -n` of the three URLs in `.planning/research/watch-links/2026-11-16-whatsapp/items.tsv` → w039, w043, w036.
- Reads: `B73.md` 1-80, `B84.md` 175-245, `B03-bis.md`, plugin README/plugin.json/LICENSE.
- `python3 -I` on `installed_plugins.json` → claude-security False, security-guidance False.
- `docker ps -a`, `docker images` (SEO), `command -v lighthouse unlighthouse lychee pa11y axe screamingfrogseospider` → none.
- `gh api repos/supabase/splinter` (+ README, `lints/`).
- `node_modules/.bin/supabase --help` / `db lint --help` / `inspect db --help` → no advisor command.
- `grep -rn` for the method and attack terms across board-rows, the board, skills, STACK and dxb-verify.
