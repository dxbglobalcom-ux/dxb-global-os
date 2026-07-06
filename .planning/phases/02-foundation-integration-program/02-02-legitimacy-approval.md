# Plan 02-02 — Package Legitimacy Approval Record

- **Decision:** **approved**
- **Reviewer:** CEO (human decision via interactive checkpoint; evidence gathered and presented by Fable 5)
- **Date:** 2026-07-06 (23:45 GMT+2)
- **Scope:** the two [SUS]-flagged Phase-2 dev dependencies — `vitest`, `@types/node` — gating Plan 02-03's `pnpm install`

## Evidence (fetched live from npm registry, 2026-07-06)

| Check | vitest | @types/node |
|---|---|---|
| Registry name (exact) | `vitest` | `@types/node` |
| First published | 2021-12-03 (5 years of history) | 2016-05-17 (10 years of history) |
| Latest version | 4.1.10 | 26.1.0 |
| Repository | github.com/vitest-dev/vitest | github.com/DefinitelyTyped/DefinitelyTyped |
| Maintainers (sample) | ariperkkio, antfu, hiogawa, oreanno (vitest-dev team) | DefinitelyTyped org |
| Weekly downloads (2026-06-29..07-05) | 67,958,582 | 357,581,789 |
| Catalog spelling match (pnpm-workspace.yaml) | exact — `vitest: ^3.0.0` | exact — `"@types/node": ^22.0.0` |

Commands used: `curl registry.npmjs.org/<pkg>` (metadata), `curl api.npmjs.org/downloads/point/last-week/<pkg>` (downloads), `grep -A6 catalog pnpm-workspace.yaml` (spelling).

## Assessment

The 02-RESEARCH "too-new" SUS flags measured the latest-version publish date, not package age — both packages are decade/half-decade-old, extremely high-traffic, official-org packages shipping routine releases. Heuristic false positive confirmed; no typosquat substitution present in the catalog.

**Effect:** Plan 02-03 (Wave 3 install) is UNBLOCKED.
