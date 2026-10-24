#!/usr/bin/env bash
# The final check of the 24 Oct olive-farm test: Sol 6.1 through the read-only refuter profile, plus a headless
# browser (Playwright MCP) limited to the page's own local origin and Google Fonts. Adapted from the 22 Oct
# run-sol-try.sh; reads only the job folder.
# usage: sol-try.sh <job dir: brief.md plan.md delivery/> <out.md> <port>
set -uo pipefail
dir="$1"; out="$2"; port="$3"
cd "$dir" || exit 2
setsid nohup python3 -m http.server "$port" --bind 127.0.0.1 --directory "$dir" >"$out.http.log" 2>&1 &
srv=$!
trap 'kill $srv 2>/dev/null || true' EXIT
sleep 1
prompt="You are the independent final check of a delivered web page. The folder $dir holds brief.md (the job),
plan.md (the owner's signed plan) and delivery/ (what is delivered). Read nothing outside $dir.

The page is served at http://127.0.0.1:$port/delivery/index.html — open it with the browser tool and TRY it as a
visitor would, at 1440 px and at 390 px wide: scroll it whole, every link and button, every form with good and bad
input, every interactive part. Take screenshots and look at them.

Your one question: does this page do what the brief asks, at the standard the brief sets? Report findings, each
with: what is wrong · where (selector or section, width) · why it matters to a visitor · the correction required ·
severity (blocker / major / minor). Say also what works well, briefly. Law, data protection, regulation and contract
texts are outside this job's scope by the brief's own words — do not raise them. You write nothing."
start=$(date +%s)
deny='permissions.sol_try.filesystem={":root"="read","/home/dxb/DxB Global OS"="deny","/home/dxb/.claude"="deny","/home/dxb/.claude-mem"="deny","/home/dxb/Desktop"="deny","/tmp/claude-1000"="deny","'"$dir"'"="read"}'
timeout 2400 codex -p refuter -c "model_reasoning_effort=\"${SOL_EFFORT:-high}\"" \
  -c 'mcp_servers.dxbdb.enabled=false' -c 'mcp_servers.playwright.enabled=true' \
  -c 'mcp_servers.playwright.default_tools_approval_mode="approve"' \
  -c "mcp_servers.playwright.args=[\"--headless\",\"--isolated\",\"--browser\",\"chromium\",\"--allowed-origins\",\"http://127.0.0.1:$port;https://fonts.googleapis.com;https://fonts.gstatic.com\"]" \
  -c "$deny" -c 'default_permissions="sol_try"' \
  exec --skip-git-repo-check --ephemeral -C "$dir" -o "$out" -- "$prompt" </dev/null >"$out.log" 2>&1
rc=$?
echo "$(date '+%F %T') sol-final end rc=$rc seconds=$(( $(date +%s) - start )) tokens=$(grep -A1 'tokens used' "$out.log" | tail -1)" \
  >>/home/dxb/test-kutu/20261024-zeytin/TIMES.log
echo "EXIT=$rc"
