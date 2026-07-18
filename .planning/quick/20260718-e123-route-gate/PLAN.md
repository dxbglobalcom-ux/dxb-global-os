---
task: E12.3 Route Completeness Gate — ModuleWaiting=0 + per-route DoD matrix
spec_pointer: HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md row E12.3 (direktif §2.1/§6) + CEO_COMMAND_CENTER_SPEC §17/§19/§34 (error containment, skeleton, fallback)
started: 2026-07-18T02:20:00+02:00
---

# PLAN — E12.3 Route Completeness Gate (execution ticket)

- Gate 1: `grep -rl ModuleWaiting src/app | wc -l` → 0 (measured ALREADY 0;
  orphan component file deleted as closure).
- Gate 2: DoD matrix over every nav route (14 columns, roadmap verbatim),
  MEASURED from source by `scripts/dev/route-dod-matrix.mjs` — no guessed
  cells; report lands in `.planning/research/E12.3-ROUTE-DOD-MATRIX.md` and
  registers on the knowledge shelf (std.knowledge_shelf law).
- Defects the measurement surfaces are fixed IN-WAVE when they are gate-class
  (measured: ZERO error.tsx/loading.tsx/not-found.tsx anywhere — raw Next
  crash/404 screens reachable on every route; CC-SPEC §17 violation) →
  (command) group boundaries built from certified Panel states.

## Evidence contract

1. ModuleWaiting grep → 0 quoted; component file gone.
2. Matrix report complete for every nav route; sourceless rows measured and
   explained (dynamic `.from(table)` false-negative fixed in the engine).
3. Boundary surfaces render-proven (real 404 URL; error boundary via dev-
   server crash probe, probe deleted after evidence).
4. Battery: dashboard tsc 0 + next build 0 · full vitest green · purity PASS
   · RULE #0 on touched surfaces EN+TR.
5. Atomic commits, gitleaks clean.
