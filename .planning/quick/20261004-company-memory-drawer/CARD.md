# Score card — the company's memory drawer on the company's desk

job: Every company memory note (obsidian = artifact, graphify = relation) is written to and read from one absolute folder, DXB_MEMORY_ROOT — the company Claude home in production, set by the scheduler before any lane runs and inherited by every company call's dxb-mcp child; the construction's own var/construction-memory in the battery — and the reader opens nothing but a note of the writer's exact shape, of its store's kind, inside that folder
range: 7c6a0dc6..HEAD
blast: 1
risk: 2
reasoning: 1
ambiguity: 0

why: one subsystem (memory-router's two file stores and its read door) plus a start-up hook in the scheduler (outbox-executor main.ts, kernel ensureCompanyMemoryRoot), the battery's env and the two tests and one CLI that read notes; risk 2 — security (Sol's phase-3 C1: a ref naming any file reached readFile), company data (the one live note moves, 32 orphaned July notes are deleted) and the agents' memory (24 department profiles grant memory_recall/memory_commit); reasoning 1 — path traversal, symlinks, and one env value crossing three processes (scheduler → company Claude call → dxb-mcp child working in the home's `work` folder); ambiguity 0 — his words "Tamam önerini kabul ediyorum." to a plain proposal, and his "tamam" to the plan (company-memory-drawer-2026-10-04). Total 4, normal, Sol `high`.

arrangement: the lead writes (four source files and their tests; a fork would only re-read the lead's context); Sol's findings fixed by a fork and verified by the lead (sol-single-pass-fixes-by-helper-2026-10-03). The plan was written at `max`, the code at `high` (design-plan-architecture-at-max-2026-10-03).
