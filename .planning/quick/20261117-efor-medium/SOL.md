# Sol's pass — the effort default (commit d10b90a0), 2026-11-17, medium, one pass

Stood: the hook's paragraph, the door's section 2 and the ledger entry say what he said; the plan / code / managing / xhigh split is kept; nothing outside `sync()` changed.

- **B — the Codex mirror was stale**: `.agents/skills/dxb-team3/SKILL.md:110` still said "The session works at `high`". Fixed: the mirror regenerated (`sync-codex-mirror.sh`; `--check` → `SYNC_OK mirror matches source`).
- **C — STATE.md:36** told the 2026-11-16 job with the old rule in the present tense. Corrected in place: past tense, with the date it was replaced.

Not found by Sol anywhere else: the hook's docstrings, the three dxb-effort skills, the core, the other doors, the session-start hook.
Sol did not rerun the 92-test suite; the lead's run after the change: 92 passed (92).
