# langchain-ai/open_deep_research — repository state, measured 2026-09-16

Research run `20260916-213245` · class `due-diligence` · mode LIGHT · 29 evidence rows ·
294 discovery rows · 14 clusters · 34 queries · 26 pages opened through the reading chain.
Holes: `runs/20260916-213245/GAPS.md`.

## Answer

**No. It is archived — read-only — and it has not received a human commit of substance in
twelve and a half months.**

> "This repository was archived by the owner on **Aug 21, 2026**. It is now read-only."
> — GitHub's own banner, read live on 2026-09-16 on two distinct pages of the repository
> (home and `/releases`).

## The repository state, measured

| what | value | door |
|---|---|---|
| `archived` | **true** | `gh api repos/langchain-ai/open_deep_research` |
| archived on | **2026-08-21** | GitHub banner, live read (scrapling) |
| default branch | `main` | REST API |
| `main` HEAD | `1b7d2e8` · **2026-08-10T18:13:29Z** | REST API |
| HEAD author | **`dependabot[bot]`** — "Bump h2 from 4.3.0 to 4.4.1" | REST API |
| **last human commit of substance** | **2025-08-27** · `rlancemartin` · "Update uv.lock (#191)" | 224-commit history walk |
| last human commit of any kind | 2026-02-08 · `jkennedyvz` · "chore: dependabot" / "fix: gh actions deps" — i.e. wiring up the bot | history walk |
| releases | **0** | REST API |
| tags | **0** | REST API |
| README "Recent Updates" ends | **August 14, 2025** | `gh api .../readme` |
| README last modified | 2025-08-18 · `rlancemartin` | commits filtered by path |
| deprecation notice in README | **none — never added** | README body |
| frozen open work | **73** = 39 issues + 34 PRs | GitHub search API |
| stars / forks | 12 682 / 1 835 | REST API |
| PyPI `open-deep-research` | last release **0.0.16, 2025-07-16** | pypi.org JSON, HTTP 200 |

### Commits per month on `main`, human vs bot

```
2026-08  human=0   bot=3      2026-02  human=2   bot=5
2026-07  human=0   bot=5      2025-08  human=13  bot=0
2026-06  human=0   bot=4      2025-07  human=12  bot=0
2026-05  human=0   bot=2      2025-06  human=10  bot=0
2026-04  human=0   bot=5      2025-05  human=21  bot=0
2026-03  human=0   bot=3      2025-04  human=31  bot=0
```
2025-09 through 2026-01: **no commits at all.**

## The trap this question is built on

`pushed_at` = 2026-08-10 and `updated_at` = 2026-09-16 both look alive. **Both are noise.**
The pushes are nineteen dependabot dependency bumps merged by a passing engineer; the
`updated_at` moves when anyone stars the repo. The policy in `policies/evidence-plan.md`
names this exact failure: *"Health is the default branch's last commit, never `pushed_at`."*
Here even that is not enough — the default branch's last commit is **also** a bot. The
honest measure is the last commit by a human being, and that is 2025-08-27.

## The end, in its own record

The final pull requests were closed **by the people who opened them**, not by a maintainer:

- `#336 Feat/deepseek support` — opened by `guiyuanhu` 2026-08-17T04:35:45Z, closed by
  `guiyuanhu` **four minutes later**, unmerged.
- `#323`–`#329` — six pull requests opened by `RerankerGuo`, all closed by `RerankerGuo`
  himself in one batch at 2026-08-17T03:50:4xZ, unmerged.
- `#335` — opened 2026-08-10, **still open**, never triaged, now permanently frozen.  <!-- HISTORY -->

Four days after that clean-up, the owner archived the repository.

## Where the work went

| repository | state | stars | last push |
|---|---|---|---|
| **langchain-ai/deepagents** | active | **29 485** | **2026-09-16T21:29** (today) |
| langchain-ai/deepagentsjs | active | 1 560 | 2026-09-16T19:34 |
| langchain-ai/local-deep-researcher | active | 9 347 | 2026-08-23 |
| langchain-ai/deep_research_from_scratch | active | 782 | 2026-08-11 |
| **langchain-ai/open_deep_research** | **ARCHIVED** | 12 682 | 2026-08-10 |
| langchain-ai/generic-researcher | ARCHIVED | 8 | 2026-08-17 |
| langchain-ai/deep-agents-ui | ARCHIVED | 1 709 | 2026-06-21 |

`deepagents` is shipping releases the same day this was measured (`deepagents` 0.7.15,
`deepagents-code` 0.1.70). `rlancemartin` — who wrote **132 of open_deep_research's commits**,
more than every other human combined — now commits to `deepagents`. `jkennedyvz`, who merged
the last dependabot pull requests here, commits across `langchain-ai` daily, just not here.

**Note the limit of this claim:** LangChain never published a statement saying `deepagents`
replaces `open_deep_research`, and `deepagents`' README does not mention it. What is measured
is where the same people and the same subject went — not a declared succession.

## What would flip this answer

An archived repository can be un-archived, and an archived repository whose forks carry on is
not the same as a dead project. I went looking for both:

- No un-archive: `archived: true` on the day of measurement.
- No successor fork: the newest forks all sit at the same frozen commit `2026-08-10T18:13:37Z`
  with 0–1 stars. Nobody has picked it up.

## Holes

Wayback Machine offline (archive date not corroborated from a second archival source) ·
duckduckgo FAIL · hackernews, stackoverflow, github-repos, github-issues returned empty ·
**reddit drifted — 350 KB with zero mentions of the subject, excluded rather than counted** ·
`miro.medium.com` blocked on all eleven doors (an image CDN) · no LangChain statement
explaining the archiving was found in 34 queries; I do not claim none exists.
