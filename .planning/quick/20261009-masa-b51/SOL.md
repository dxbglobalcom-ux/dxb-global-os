# Sol — step 1 (commit 8ca146f7), one blind pass

Auditor: GPT-6.1 Sol through `scripts/governance/refuter.sh --effort xhigh`, 2026-10-09 ~21:20–21:25.
Brief: `sol-brief.txt`; raw output: `SOL.md.raw` (both kept on disk, out of git). No A finding.

| # | Claim | Verdict | Class | Disposition |
|---|---|---|---|---|
| 1 | R6 stops a job's last STATE commit while the row is behind | REFUTED — pre-commit cannot see the commit being made | B | Fixed: `scripts/hooks/commit-msg` → `records-truth.ts --commit-msg`; when STATE is staged, every open row named in the subject scope must have its line changed in the staged board. Proven in a temp repo with the real hook (refuse / pass / B03-bis / no STATE / `git commit -- path`). |
| 2 | The scope match names only that row | REFUTED — `-` was a boundary, `B03` matched `B03-bis` | B | Fixed: an id needs a non-`[A-Za-z0-9-]` character on both sides; tests for B03-bis, multi-id scopes, `pre-B03`. |
| 3 | The note command keeps board and row file together; a retry is safe | REFUTED — board written first; a failed file write could not be repaired | B | Fixed: the file is written first; board noted but file missing → `REPAIRED`; both present → refused. Test with a read-only rows folder. |
| 4 | Notes satisfy the HISTORY rule (`dxb-close-row`:44) | REFUTED — no `<!-- HISTORY -->` on the notes | B | Disputed and clarified, not coded: `ledger-truth.mjs:25,210` places a marker on its own line, covering what follows — it cannot stand inside a table row. The note's `✓ <date>` is its event mark; the row file's `## Done notes` is the dated record. Written into `dxb-close-row`. R1 (ledger-truth) stays green. |
| 5 | The opening carries the stale list safely | REFUTED — unbudgeted; 66 stale rows → 12,167 bytes against the 8,000-byte position ruler | B | Fixed: at most five rows, 200 characters each, then a "+N more" line with the command; measured ~1.1 KB for 66 rows. |
| 6 | The battery output covers the final commit | UNVERIFIED | B | Battery run again after the fixes: `evidence/battery-step1-fixes.log`. |
| 7 | "Plan konuşacağız" brings the dxb-team2 reminder | STANDS | — | — |
| 8 | B51 rewritten; a partial finish did not close it; nothing archived | STANDS | — | — |
