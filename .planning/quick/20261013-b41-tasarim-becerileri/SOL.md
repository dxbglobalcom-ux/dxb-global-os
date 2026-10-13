# B41 first slice — Sol 6.1 (xhigh), one blind pass, 2026-10-13

Range: 0a0db653 (build), d0bc5366 (probe). Sol ran no suite and wrote nothing (audit_log 1832 before and after);
it read the battery log (BATTERY_GREEN, 1342 + 378) and queried the construction engine with sql_read.

| # | Claim | Verdict | Class | Fix |
|---|---|---|---|---|
| 0 | the seat can open all 15 skills itself | REFUTED — pick-ui-library, prototype, review-animations carry `disable-model-invocation: true` | A | the flag removed in our copy, recorded in PROVENANCE |
| 1 | an ungranted seat gets no plugin, Skill or Read | STANDS | — | — |
| 2 | Read stays inside the plugin folder | REFUTED — the CLI allows Read inside the call's working folder | A | Read denied under the call's cwd for a granted seat |
| 3 | `_skills` cannot load a folder outside the plugin root | REFUTED — a symlinked folder with a valid name was accepted (no symlink exists today) | B | realpath boundary for plugin and skill folders |
| 4 | the new employee overlays keep the seat's MCP tools | STANDS (frontend 59 = 59) | — | — |
| 5 | ungranted seats behave as before | STANDS | — | — |
| 6 | the ruler proves plugins/skills come from the compiled profile | REFUTED — buildSdkToolOptions' argument was not traced; a hand-made surface passed | A (blindness older, B41 raised its stakes) | the builder's argument must be an unmodified one-argument resolveRuntimeProfile result |
| 7 | the registrar writes only through the door, idempotently, fail-closed | REFUTED — absent targets and a stale idempotency answer reported success | B | targets checked before writing, active grants re-read after, fresh key |
| + | a granted plugin reaches a seat with no MCP tools | REFUTED — both lanes built options only when MCP tools exist | B | plugin presence is its own condition; tools_allowed=false still yields nothing |

Fixes: see the fix commit after this file; verified by the lead (touched tests, typecheck, battery, live re-run).
