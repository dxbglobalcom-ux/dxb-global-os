#!/usr/bin/env bash
# Health is a PROBE, never a status line.
#
# Measured 2026-09-16: `agent-reach doctor` reported reddit and twitter as `warn`
# while both returned real results in 17-19 s, and reported github as `warn` with
# `gh api rate_limit` answering 5000/hr. Doctor does not execute the platform
# command — it checks that a binary and a credential exist. A router that trusted
# it would silently avoid channels that work, which is the exact definition of
# under-search.
#
# One call per channel, 20 s ceiling, all in parallel, cached for the run.
#
#   probe.sh [--out FILE] [--timeout S] [channel ...]

set -uo pipefail
SKILL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMO=20
OUT=""
CHANNELS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --out) OUT="$2"; shift 2 ;;
    --timeout) TMO="$2"; shift 2 ;;
    *) CHANNELS+=("$1"); shift ;;
  esac
done

run_probe() {
  local name="$1"; shift
  local cmd="$*"
  local s e rc bytes state f
  # VALIDATE THE DETECTOR BEFORE TRUSTING IT. Two ways this probe lied on its first
  # run, both measured 2026-09-16:
  #   * piping into `head -c` closes the pipe, the command dies of SIGPIPE, and a
  #     channel that answered with 60 KB was recorded as FAILED;
  #   * a size threshold called `gh api rate_limit --jq .rate.remaining` a failure
  #     because a correct answer is four bytes ("4998").
  # So: capture to a file, judge on the EXIT CODE and the CONTENT, never on size alone.
  f=$(mktemp)
  s=$(date +%s%N)
  timeout "$TMO" bash -c "$cmd" > "$f" 2>&1
  rc=$?
  e=$(( ($(date +%s%N) - s) / 1000000 ))
  bytes=$(wc -c < "$f")
  local head8; head8=$(head -c 4000 "$f")
  if printf '%s' "$head8" | grep -qiE 'AUTH_REQUIRED|please (open|log ?in)|login required|not authenticated'; then
    state=AUTH
  elif [ "$rc" -eq 124 ]; then
    state=TIMEOUT
  elif [ "$rc" -ne 0 ]; then
    state=FAIL
  elif [ "$bytes" -eq 0 ]; then
    state=EMPTY
  elif printf '%s' "$head8" | grep -qiE '^ok: false|"error"[[:space:]]*:|^error:|COMMAND_EXEC|EMPTY_RESULT'; then
    state=FAIL
  else
    state=LIVE
  fi
  rm -f "$f"
  printf '%-14s %-8s %7sms %8s bytes\n' "$name" "$state" "$e" "$bytes"
  [ -n "$OUT" ] && printf '{"channel":"%s","state":"%s","ms":%s,"bytes":%s}\n' \
      "$name" "$state" "$e" "$bytes" >> "$OUT"
  return 0
}

declare -A P
P[exa]="mcporter call 'exa.web_search_exa(query: \"site reliability\", numResults: 2)'"
P[parallel]="curl -sS -m 15 -X POST https://search.parallel.ai/mcp -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'"
P[tavily]="curl -sS -m 15 -X POST https://mcp.tavily.com/mcp/ -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'X-Tavily-Access-Mode: keyless' -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'"
P[firecrawl]="curl -sS -m 15 -X POST https://mcp.firecrawl.dev/v2/mcp -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'"
P[youcom]="curl -sS -m 15 -X POST 'https://api.you.com/mcp?profile=free' -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'"
P[google]="opencli google search 'site reliability' --window background -f yaml"
P[duckduckgo]="opencli duckduckgo search 'site reliability' --window background -f yaml"
P[reddit]="opencli reddit search 'site reliability' --window background -f yaml"
P[twitter]="opencli twitter search 'site reliability' --window background -f yaml"
P[hackernews]="opencli hackernews search 'site reliability' -f yaml"
P[stackoverflow]="opencli stackoverflow search 'site reliability' --window background -f yaml"
P[bluesky]="opencli bluesky search 'site reliability' --window background -f yaml"
P[linkedin]="opencli linkedin search 'site reliability' --window background -f yaml"
P[youtube]="opencli youtube search 'site reliability' --window background -f yaml"
P[zhihu]="opencli zhihu search '可靠性' --window background -f yaml"
P[linux-do]="opencli linux-do search 'claude' --window background -f yaml"
P[weibo]="opencli weibo search '可靠性' --window background -f yaml"
P[bilibili]="bili search 'claude' --type video -n 3"
P[github]="gh api rate_limit --jq .rate.remaining"
P[crossref]="curl -sS -m 15 'https://api.crossref.org/works?rows=1&query=retrieval'"
P[europepmc]="curl -sS -m 15 'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=retrieval&format=json&pageSize=1'"
P[arxiv]="curl -sS -m 15 'https://export.arxiv.org/api/query?search_query=all:retrieval&max_results=1'"
P[openalex]="curl -sS -m 15 'https://api.openalex.org/works?per-page=1'"
P[jina]="curl -sS -m 15 'https://r.jina.ai/https://example.com'"

[ ${#CHANNELS[@]} -eq 0 ] && CHANNELS=("${!P[@]}")
[ -n "$OUT" ] && : > "$OUT"

printf '%-14s %-8s %9s %14s\n' CHANNEL STATE LATENCY SIZE
for c in "${CHANNELS[@]}"; do
  cmd="${P[$c]:-}"
  [ -z "$cmd" ] && { printf '%-14s %-8s\n' "$c" "UNKNOWN"; continue; }
  run_probe "$c" "$cmd" &
done
wait
exit 0
