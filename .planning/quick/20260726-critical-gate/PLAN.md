# TICKET 20260726-critical-gate — the §4e gate stops being a written intention

> Execution ticket. Contract: `MODEL_ROUTING_SPEC` §4e (written the same night, U21 item 8). Roadmap row: `00-NOTE-FACTORY-COMPLETION-ROADMAP-2026-07-26` W1 §1.3.

**CEO order (2026-07-26, given twice, closed with "bunu unutma sakın"):** *"solo 5.6 ve gpt 5.5 kullanılacak holdingin içinde … özellikle councilda istiorum bunları senin işlerini kontrol etmek için."*

## Measured before building

| Fact | Evidence |
|---|---|
| `needs_council` was read by nobody who acts on it | `grep -rn needs_council packages/ apps/` → a type, a field copy in `policy.ts`, zero behaviour |
| v1 `council.ts` is dead and unfixable as-is | its three producers (GLM 5.2, Kimi 2.7, Qwen 3.6) were all dismissed by U21 |
| The API key cannot carry the lane | `429 insufficient_quota` on every completion; API billing ≠ ChatGPT subscription |
| The CLI can | `codex exec -m gpt-5.6-sol` and `-m gpt-5.5` both answered, structured JSON via `--output-schema` |
| The CLI blocks without a closed stdin | first probe hung on "Reading additional input from stdin…" until `< /dev/null` |

## Shape built

Opus 5 **writes** → challengers **refute** → Opus 5 **revises and signs**. Challengers are not co-authors: the CEO rejected that shape explicitly, and it was the v1 CNCL-01 error.

- `CRITICAL_GATE_CONFIG` — one config surface, the two models the CEO named.
- `codexRunner` — `--ephemeral -s read-only --skip-git-repo-check`, temp cwd, `--output-schema`, `-o` for the final message, stdin closed.
- `runCriticalGate()` — parallel panel, zod-validated verdicts, `decision_log('critical_gate')` carrying the objections, `feedback` text ready for the revision round.
- `runWorkerOnce` — fires after the QA hook PASSes, one gate round only, `needs_council` is the switch.

## Evidence

1. **Live panel run against a planted flaw** — both challengers `flawed`, 7 sourced objections, `decision_log` id 20251. Recorded verbatim in the U23 row and §4e.
2. `tests/c9/critical-gate.test.ts` 8/8 — panel membership, clean, objections + attribution, one dead challenger, dead panel = `unavailable`, garbage refused, prose-wrapped JSON still read, decision row written.
3. `tsc -b` clean; full suite green.

## Boundary

The gate reviews; it does not yet *cost-account* per challenger call (subscription turns are not in `cost_ledger`). Recorded, not hidden.
