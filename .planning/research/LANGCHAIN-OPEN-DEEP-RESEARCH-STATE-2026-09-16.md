# Is `langchain-ai/open_deep_research` still maintained? — repository state, measured 2026-09-16

**Question shape:** counting + state. A "still maintained?" verdict is only honest with a
distribution behind it: commits per month split bot/human, issue and PR traffic, maintainer
response presence, and the repository's own flags.

**Answer:** NO. The repository was **archived by its owner on 2026-08-21T17:02:43Z** and is
read-only. Human authorship had already stopped **12 months** before that.

---

## 1. Evidence table

| # | Measurement | Command (run 2026-09-16, ~21:32–21:45 UTC) | Decisive output | Source type |
|---|---|---|---|---|
| E1 | Repo is archived | `gh api repos/langchain-ai/open_deep_research` | `"archived":true`, `"pushed_at":"2026-08-10T18:13:37Z"`, `"open_issues_count":73`, `"stargazers_count":12682`, `"forks_count":1835`, `"license":"MIT"`, `"created_at":"2024-11-20"` | primary-api |
| E2 | Exact archive timestamp (independent endpoint) | `gh api graphql … { isArchived archivedAt … }` | `"isArchived":true,"archivedAt":"2026-08-21T17:02:43Z"`, `history.totalCount: 224` | primary-api |
| E3 | Archive banner as rendered to a visitor | `curl -sL https://github.com/langchain-ai/open_deep_research` + grep | `archived by the owner on Aug 21, 2026` … `read-only.` | primary-doc |
| E4 | Same banner via a second, unrelated fetcher | WebFetch on the same URL | *"This repository was archived by the owner on Aug 21, 2026. It is now read-only."* | primary-doc |
| E5 | Last commit of ANY kind | `gh api …/commits?per_page=25` | `2026-08-10T18:13:29Z dependabot[bot] Bump h2 from 4.3.0 to 4.4.1 (#334)` | code |
| E6 | The 25 most recent commits are 25/25 bot | same call | every one `dependabot[bot]` | code |
| E7 | Per-month split, full history (224 commits, 6 API pages) | `gh api …/commits` ×6 + awk tally | 2026-08 `3/3 bot` · 07 `5/5` · 06 `4/4` · 05 `2/2` · 04 `5/5` · 03 `3/3` · 02 `7 = 5 bot + 2 human` · **2025-09 … 2026-01: no commits at all** · 2025-08 `13/13 human` · 2025-07 `12` · 2025-06 `10` · 2025-05 `21` · 2025-04 `31` · 2025-03 `26` · 2025-02 `60` | code |
| E8 | Last human commit | grep -v dependabot on the same tally | `2026-02-08T01:01:40Z jkennedyvz "fix: gh actions deps"` (CI plumbing only) | code |
| E9 | Last commit by the project's own author | same | `2025-08-27T03:59:01Z rlancemartin "Update uv.lock (#191)"` — **12 months and 20 days before the archive** | code |
| E10 | Releases / tags | `gh api …/releases`, `…/tags` | both empty — the project **never cut a release** in 22 months | primary-api |
| E11 | Frozen backlog | `gh api …/issues?state=open`, `…/pulls?state=open` | 73 open = **39 issues + 34 pull requests**; oldest open issue `2025-08-11`, oldest open PR `2025-07-18` | primary-api |
| E12 | Zero maintainer response | 300 newest issue comments, 3 API pages, association tally | `NONE 167` + `CONTRIBUTOR 133`, **`MEMBER`/`OWNER`/`COLLABORATOR` = 0** across `2025-03-26 → 2026-08-14` | primary-api |
| E13 | Last comment by the author | grep CONTRIBUTOR on the same set | `2025-08-27 rlancemartin` — nothing from him afterwards; after that only `jkennedyvz` (2026-03-19) and dependabot | primary-api |
| E14 | Last merged PRs are all bot | `gh api …/pulls?state=closed` merged filter | #334, #331, #330, #295, #292, #291, #289, #285 — **all `dependabot[bot]`** | primary-api |
| E15 | The archive is silent — no notice in the README | `gh api …/readme` + grep `archiv\|deprecat\|deepagents\|no longer\|moved` | **no match** in 10 265 bytes; the README's newest "Recent Update" is still `August 14, 2025` | primary-doc |
| E16 | The org is alive; this one repo is not | `gh api orgs/langchain-ai/repos?sort=pushed` | `deepagents` ⭐29 485 pushed **2026-09-16**, `langchain` ⭐146 467, `langgraph` ⭐41 776, `deepagentsjs`, `managed-deepagents` — all `archived=false`, all pushed today | primary-api |
| E17 | Where the capability lives now | `gh api repos/langchain-ai/deepagents/contents/examples/deep_research/README.md` | the file exists (`deepagents/examples/deep_research`), created `2025-07-27` repo, `archived=false`; **it does NOT mention `open_deep_research`** — no migration pointer either way | primary-doc |
| E18 | The sibling course repo is NOT archived | `gh api repos/langchain-ai/deep_research_from_scratch` | `pushed=2026-08-11 archived=false stars=782` — the archive was targeted at ODR alone | primary-api |

## 2. Contradiction, named and left standing

A web-search summariser (Anthropic WebSearch, same session) concluded from result snippets:
*"I did not find specific information indicating that the open_deep_research repository itself
has been archived. The current search results suggest it remains an active project."*

That is **wrong**, and it is exactly the failure this doctrine exists to catch: a headline read
instead of a source. Four direct measurements of the repository itself (E1–E4), across two
different GitHub endpoints and two independent HTTP fetchers, say `archived: true` with a
timestamp. Search-index snippets lag a 26-day-old archive flag. The contradiction is recorded,
not averaged away.

## 3. What would flip this answer

* **An un-archive.** `isArchived` is a reversible switch; LangChain flipped it on once and can
  flip it off. Re-measure E2; nothing else is needed.
* **A maintained fork becoming the reference.** 1 835 forks exist. Not measured — see §4.
* **Dependabot traffic counted as maintenance.** If "maintained" meant "dependencies patched",
  the answer would have been "barely, by a bot" up to 2026-08-10. It cannot mean that now:
  an archived repo is read-only, so even the bot has stopped.

## 4. Where I did not look

* **The 1 835 forks** — not enumerated, so "is there a living community fork?" is unanswered.
* **Scrapling door FAILED** — `mcp__scrapling__fetch` returned
  `BrowserType.launch_persistent_context: Executable doesn't exist at
  /home/dxb/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome`. Covered by curl (E3)
  and WebFetch (E4); recorded as a hole in this machine's reading chain, not in the answer.
* **Why LangChain archived it** — no blog post, changelog entry or issue comment was found
  stating a reason (E15, E17, and HN Algolia `"open_deep_research" archived` → `nbHits=0`).
  The *fact* of the archive is proven; the *motive* is UNPROVEN and is not claimed here.
* **Reddit / X sentiment** — not swept. The question asked for repository state, which is a
  matter of record rather than of opinion.
