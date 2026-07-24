# Execution ticket — ledger 3a/3b (full dead-click + pointer-cursor sweep)

**Spec pointers:** complaint ledger C3 (pointer cursor without action, dead "view all" buttons) + completeness-audit row 3a/3b ("route-by-route cursor sweep has no recorded evidence" — the C6 legacy kill removed the worst, evidence of a full sweep was the open debt).

**Scope:** machine sweep of all 46 nav routes + live-id detail routes (/gov/audit/[id], /approvals/[id], /ops/projects/[slug]) flagging (a) cursor-pointer elements with no interactive ancestor and no React onClick within 6 levels, (b) anchors without href / href="#", (c) enabled buttons outside forms with no React onClick. Repeatable script promoted to `scripts/test/dead-click-sweep.mjs` (exit 1 on findings) so future passes rerun it.

**Method notes (measured):** React delegates listeners to the root — CDP getEventListeners is blind; `__reactProps$` inspection is the reliable signal. React 19 selective hydration makes first-pass scans lie (364 false positives measured); every candidate re-verifies after a settle.

**Evidence contract:** sweep output 0 findings (or each finding fixed in-turn); behavioral spot-proofs for late-hydrating flagged controls; ledger row closed with the run output; commit + STATE.md.
