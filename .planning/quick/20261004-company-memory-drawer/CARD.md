# Score card — the company's memory drawer on the company's desk

job: Every company memory note (obsidian = artifact, graphify = relation) is written to and read from one absolute folder, DXB_MEMORY_ROOT — the company Claude home in production, set by the scheduler before any lane runs and inherited by every company call's dxb-mcp child; the construction's own var/construction-memory in the battery — and the reader opens nothing but a note of the writer's exact shape, of its store's kind, inside that folder
range: 7c6a0dc6..628863e1
blast: 1
risk: 2
reasoning: 1
ambiguity: 0

why: one subsystem (memory-router's two file stores and its read door) plus a start-up hook in the scheduler (outbox-executor main.ts, kernel ensureCompanyMemoryRoot), the battery's env and the two tests and one CLI that read notes; risk 2 — security (Sol's phase-3 C1: a ref naming any file reached readFile), company data (the one live note moves, 32 orphaned July notes are deleted) and the agents' memory (24 department profiles grant memory_recall/memory_commit); reasoning 1 — path traversal, symlinks, and one env value crossing three processes (scheduler → company Claude call → dxb-mcp child working in the home's `work` folder); ambiguity 0 — his words "Tamam önerini kabul ediyorum." to a plain proposal, and his "tamam" to the plan (company-memory-drawer-2026-10-04). Total 4, normal, Sol `high`.

arrangement: the lead writes (four source files and their tests; a fork would only re-read the lead's context); Sol's findings fixed by a fork and verified by the lead (sol-single-pass-fixes-by-helper-2026-10-03). The plan was written at `max`, the code at `high` (design-plan-architecture-at-max-2026-10-03).

## Measured (2026-10-04, the approved card fields)

- minutes: plan at `max` 13:20→14:13 (measuring, Fable, his yes); build at `high` 14:16→14:34 (RED test,
  code, battery 1 red → fixed → green); Sol 14:35→14:50 (high, one pass, 147,194 tokens); the fork's fix
  14:51→14:53 (88 s, 414,814 subagent tokens, 6 tool uses); battery + graph refresh 14:53→15:00; deploy
  15:01→15:02. About 1 h 45 min from his yes to live.
- batteries: three full runs — 1 red (poisoning.test.ts read a note relative to cwd; fixed), 1 green,
  1 after Sol's fixes with one unrelated red (tests/b23 graph 151 commits behind, limit 150; graph
  refreshed to 0 behind; b23 + memory-drawer rerun as two files, 19/19 — not a fourth battery).
- Sol's findings: 2 A (a link inside the root redirecting a ref; check/use race) + 2 B (mkdir before the
  boundary; the scheduler keeping an unvalidated inherited root) — all fixed by the fork, verified by the
  lead; 1 C (chat and voice swallow a recall error) stays in SOL.md.
- cost: not summed here (subscription; the transcripts hold message.usage — dxb-team2 §7).
- ⚠ UNVERIFIED: a real task-lane company Claude call whose dxb-mcp child commits and recalls a note
  (Sol's refutation of done-list 6 stands: the probe proved the child resolves the root from its env, not
  through the CLI). The scheduler side is proven live (start-up line, live read).
