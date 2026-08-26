# The knowledge graph — rebuilt 2026-08-26, and it stays fresh by machine

<!-- HISTORY -->

**What it is.** A map of this repository's code: 5,742 nodes and 9,094 edges across 520
communities, built from the source itself (`graph.json` for machines, `graph.html` to look at,
`GRAPH_REPORT.md` to read). It is here so a session can ask *where does X live* without reading
the repository, which is the whole point of the standing graph-first rule.

**What was wrong, and what was deleted with it (board B23, LAW A).** This file used to open with
*"This knowledge graph is STALE. Do not trust it."* — true when it was written on 2026-07-30, and
false now, so it is gone rather than kept beside the truth. The measurement behind it stays on the
record: the graph had been built on **2026-07-09** and was **368 commits** behind then, **593** by
the morning of 2026-08-26.

**How it cannot rot again — three things, not one:**

1. `pnpm graph:refresh` rebuilds and re-stamps the canonical copy in one command
   (`scripts/governance/graph-refresh.mjs`).
2. A **post-commit hook** (`scripts/hooks/post-commit`, installed by `graphify hook install`)
   re-extracts the changed files after every commit in the background, so the working copy in
   `graphify-out/` is never far behind and a refresh is cheap.
3. `tests/b23/graph-is-not-stale.test.ts` runs with the battery and **fails** once the canonical
   copy falls more than **150 commits** behind HEAD. The gate names the command that fixes it.

`BUILD.json` is the stamp the gate reads: the commit the graph was built at, and what it holds.

**It is built code-only, on this machine, on purpose.** graphify's semantic pass wants an LLM key
and would send this repository's documents — the CEO's own words among them — to an outside
provider. Nobody authorised that, so the graph is built from the AST alone: no key, no outbound
call. The trade is honest and worth naming: the graph knows the code, not the specs. For what the
holding *means*, the board, `.planning/STATE.md` and the owning spec are still the sources.
