# SUMMARY — ledger 3a/3b dead-click sweep (2026-07-24 night)

**Outcome:** row closed — 0 genuine dead-clicks across 50 routes; sweep is now a repeatable repo script.

| Item | Result | Evidence |
|---|---|---|
| Sweep tool | `scripts/test/dead-click-sweep.mjs` — flags cursor-pointer elements with no interactive ancestor and no React onClick within 6 levels (`__reactProps$` inspection), href-less/`#` anchors, enabled no-handler buttons outside forms; exit 1 on findings so batteries can chain it. | Committed; final run output `DEAD-CLICK SWEEP: 0 findings across 50 routes` |
| Coverage | 46 nav routes + /ops/tasks + 3 live-id detail routes (/gov/audit/37577, /approvals/<uuid>, /ops/projects/dxb-global-os). | Route list in script |
| False-positive root cause | React 19 selective hydration: networkidle fires before Suspense islands hydrate — first pass reported 364 "dead" controls (every header button, the whole /gov/audit table, the costs Data-reset button), ALL working. Fix: hydration wait + settle + re-verify pass; flagged controls additionally disproven behaviorally (audit row click aria-expanded 0→1; cost-reset expands; EN button carries onClick in `__reactProps$`). | Measured runs recorded in session; method note in script header |
| /ops/tasks status | ALIVE (HTTP 200 after locale redirect) — C11 removed it from NAV only; 11 code references keep it as the task drill target. Not a dead link. | curl -L 200; grep list |

**Boundaries:** sweep is EN-locale (cursor semantics locale-independent; TR text rendering already covered by RULE #0 batteries); modal/drawer inner states not opened by the crawler — spot-proofs covered the two flagged components; heuristic cannot see handlers attached via raw addEventListener outside React (none found in repo components — all interactivity is React).
