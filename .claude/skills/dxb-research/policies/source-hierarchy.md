# Source hierarchy — contextual, never one list

The mistake almost every research system makes is having **one** ranking of sources.
There isn't one. A vendor's pricing page is the worst possible source for "is it any
good" and the **best** source for "what does it cost". The ranking depends on the
question.

| question type | the order that holds |
|---|---|
| technical capability | source code > official docs > release notes > maintainer's comment in an issue > independent test > blog > social post |
| user preference | first-hand accounts at volume > migration stories > community size and activity > independent tests > press > **vendor page (never)** |
| market / adoption | download counts, registry stats, job postings > surveys > analyst reports > press |
| price | the vendor's own pricing page (here the vendor IS the primary source) > docs > third-party summaries |
| current events | primary wire + the actor's own statement > two independent outlets > aggregators |
| scientific | primary literature > systematic review / guideline > dataset > preprint (labelled as one) > press release about the paper |
| project health | the default branch's last commit > release cadence > open-issue shape > stars |

## Five things that look like evidence and are not

- **A search-result snippet.** It tells you a page exists and what it is called. It does
  not tell you what the page says. Quoting one as if it were the page is how a vendor's
  comparison table got cited on 2026-09-16 without anyone opening it.
- **Thirty copies of one announcement.** Independence is measured, not assumed — the
  ledger collapses them into one cluster. What the cluster count measures is byte-level
  and canonical-level copying; non-literal reuse is not detected, so the number
  **under**-counts syndication and must never be reported as "these sources are
  independent".
- **Stars, views and mentions.** Adoption and attention proxies. A preference claim needs
  at least two different kinds of measure and a denominator.
- **A benchmark the vendor sponsors.** Check who created the org and who funds it. State
  it in the report either way.
- **A model's own memory.** Up to 44.5 % of one famous browsing benchmark can be answered
  with no search tool at all — which means that benchmark partly measures memory. Any
  claim about the outside world is a ledger row or it is not a claim.

## Freshness

`pub_date` is mandatory and **"recently" is not a date**. Never trust one date extractor:
htmldate's own benchmark tops out at 0.903 and on three live pages on this machine it got
**one** right. The ledger cross-checks it against JSON-LD `datePublished` and records
`dates_agree`; where they disagree the row is treated as **undated rather than fresh**,
because a freshness gate built on one extractor passes stale facts confidently.

A page legitimately has two true dates — published and modified — and they can be
twenty-three years apart. The report says which one a claim rests on.

**Cite pinned URLs.** `/en/stable/` and `/en/latest/` serve different content on the same
day; a citation to `/latest/` rots by design. The ledger prefers a pinned path whenever
one exists.

## Liveness is three states, not two

`alive` · `dead` · `blocked`. Only `dead` fails the gate. A 403 from a bot wall, a
paywall and a rate limit are **blocked** — cited with that label and counted as weaker
evidence. Measured on this machine: Reddit JSON 403, Mojeek 403, Wayback 503 — a
two-state checker would have called all three "dead" and failed an honest run.
