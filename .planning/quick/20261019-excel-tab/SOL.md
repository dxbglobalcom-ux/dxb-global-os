# Sol 6.1 (medium) — the dated-tab change of the watch-links door (6b73b0ef)

Verdict on his question: yes, a new batch becomes a dated tab in the same workbook; the old sheets' XML and styles
stay byte-identical (Sol's own read-only comparison).

| # | Grade | Finding | Fix |
|---|---|---|---|
| 3 | A | The door compared the two copies once, then copied the master over his Desktop copy — a save he makes while LibreOffice holds the file would be overwritten | SKILL.md §4: wait until he saves and closes (no lock file), compare, note his copy's hash, write, commit, then check the lock and the hash again right before copying; any change → stop and ask |
| 4 | B | `wb.save(OUT)` rewrote the master in place; an interrupted save could leave a broken file | xlsx.py saves beside it, reads the copy back, checks its tabs, then `os.replace`; a failed save leaves the workbook untouched (tested: read-only folder, hash unchanged) |
| 5 | B | The taken-name check was case-sensitive; openpyxl then renamed the tab (`…linkleri1`) | case-insensitive check (tested: "ekim 9-15 linkleri" and an upper-case repeat refused) |
| 6 | B | The `.agents` mirror (Codex) still carried the old door and tool | `scripts/governance/sync-codex-mirror.sh` |
| C | C | Older than this work: the door's command left `$K` and `$J` unquoted though the path has a space | quoted in the rewritten line |

Raw: `sol.raw` (not committed). Tests before and after the fixes: `test-output.txt`, `test-output-after-fix.txt`.

## Second pass — the technology and revenue columns (52cd1bb4), Sol 6.1 medium

No A, B or C. Verified: the four columns sit right after "Holding için neden" and the values follow the same order;
no code still reads a moved column by position (colours, priority, counts go by name); reader.md makes the four keys
required; the `.agents` mirror is equivalent; the ledger entry carries his "evet eklensin". Raw: `sol2.raw`.
