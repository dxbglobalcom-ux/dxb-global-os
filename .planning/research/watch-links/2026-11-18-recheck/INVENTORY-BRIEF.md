# Inventory pass — which named tools are already installed here

A gathering job with a fixed template. You list and look up; you do not judge whether a tool is good,
useful or needed.

J=/tmp/claude-1000/-home-dxb-DxB-Global-OS/7d8f2f4c-6fca-4474-b904-473ec48eefce/scratchpad/job
R="/home/dxb/DxB Global OS"

Your rows are given with this brief as a list of `rid`s. For each rid:

1. Read `$J/old/<rid>.json` whole (an earlier reading of one link the CEO saved).
2. List EVERY tool, repository, skill, plugin, model, MCP server or product it names — in the title, in
   "Ne bu", "Not", "Uygulama planı", "Bizde zaten var mı", "Link(ler)" and every other field. A list post
   ("10 repos", "21 things") gives one line per item. A row that names no tool (a talk, a method) gives one
   line with tool `-`.
3. For each named thing, look for it on this machine — case-insensitive, by its name and by its repo slug
   (`owner/repo` and `repo`):
   - `grep -ril -- "<name>" "$R/.planning/research/STACK.md" "$R/.planning/board-rows" "$R/.claude/skills" "$R/.planning/research/web-cupboard" "$R/.planning/research/study-cards" "$R/HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md" ~/.claude/skills ~/.local/share/dxb/skills 2>/dev/null | head -8`
   - `ls ~/.local/bin ~/tools ~/.local/share/dxb/tools ~/.claude/plugins/cache ~/.claude/plugins/marketplaces 2>/dev/null | grep -i -- "<name>"`
   - `ls -d ~/*<name>* 2>/dev/null` and `command -v <name>`
   - for a Python or Node package also: `ls ~/.venvs 2>/dev/null | grep -i -- "<name>"`, `npm ls -g --depth=0 2>/dev/null | grep -i -- "<name>"`
   A very short or very common name (e.g. "loop", "graph") is searched by its repo slug only.
4. For every hit, open the place and copy the ONE line that shows what it is there (installed / on a
   shelf / only mentioned in a row file / marked removed or rejected). Mentioned is not installed — write
   which it is, in the words of the line you copied.

Rules: read only. Install nothing, run no script from an old job folder, change no file except your one
output file. No network is needed. Do not skip a row or an item; if a field is unreadable say so.

OUTPUT — write `$J/inv/<your-file>.tsv` (the name is given with your rids), tab-separated, one line per
named thing, header first:

rid	tool	url_or_slug	found	where	evidence

- `found`: `installed` (a binary, a skill folder, a plugin, a venv, a model on disk) · `shelf` (kept but not
  loaded) · `mentioned` (only named in a document or row file) · `removed` (a record says it was removed or
  rejected) · `no` (nothing found).
- `where`: the path(s), `;`-separated, or `-`.
- `evidence`: the one line you copied, shortened to 160 characters, or `-`.

Finish your reply with only: the file path, the count of lines per `found` value, and the rids (if any)
you could not read.
