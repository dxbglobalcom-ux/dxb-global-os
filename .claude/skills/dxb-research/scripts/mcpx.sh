#!/usr/bin/env bash
# One call to a keyless MCP door, printed as plain text.
#
# All five doors answer `tools/call` over HTTP with no API key, no account and no
# card — measured 2026-09-16 at 0.22-0.50 s each. They are the reason the anti-
# concentration rule in the gate is enforceable: with one search engine it is an
# aspiration, with five it is a rule.
#
#   mcpx.sh exa       "<query>" [n]
#   mcpx.sh parallel  "<query>" [n]
#   mcpx.sh tavily    "<query>" [n]
#   mcpx.sh firecrawl "<query>" [n]
#   mcpx.sh youcom    "<query>" [n]
#   mcpx.sh fetch-tavily <url>
#
# The endpoints owe us nothing and none of them publishes its keyless rate limit.
# That is why there are five and why every one of them has a fallback chain in
# config/registry.yaml.

set -uo pipefail
DOOR="${1:-}"; Q="${2:-}"; N="${3:-8}"
[ -z "$DOOR" ] || [ -z "$Q" ] && { echo "usage: mcpx.sh <exa|parallel|tavily|firecrawl|youcom|fetch-tavily> \"<query|url>\" [n]" >&2; exit 2; }

jq_esc() { python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$1"; }
QJ=$(jq_esc "$Q")

case "$DOOR" in
  exa)
    URL="https://mcp.exa.ai/mcp"; HDR=()
    BODY="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"web_search_exa\",\"arguments\":{\"query\":$QJ,\"numResults\":$N}}}" ;;
  parallel)
    URL="https://search.parallel.ai/mcp"; HDR=()
    BODY="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"web_search\",\"arguments\":{\"objective\":$QJ,\"search_queries\":[$QJ]}}}" ;;
  tavily)
    URL="https://mcp.tavily.com/mcp/"; HDR=(-H "X-Tavily-Access-Mode: keyless")
    BODY="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"tavily_search\",\"arguments\":{\"query\":$QJ,\"max_results\":$N}}}" ;;
  fetch-tavily)
    URL="https://mcp.tavily.com/mcp/"; HDR=(-H "X-Tavily-Access-Mode: keyless")
    BODY="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"tavily_extract\",\"arguments\":{\"urls\":[$QJ],\"format\":\"markdown\"}}}" ;;
  firecrawl)
    URL="https://mcp.firecrawl.dev/v2/mcp"; HDR=()
    BODY="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"firecrawl_search\",\"arguments\":{\"query\":$QJ,\"limit\":$N}}}" ;;
  youcom)
    URL="https://api.you.com/mcp?profile=free"; HDR=()
    BODY="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"you-search\",\"arguments\":{\"query\":$QJ,\"count\":$N}}}" ;;
  *) echo "unknown door: $DOOR" >&2; exit 2 ;;
esac

curl -sS -m 60 -X POST "$URL" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  "${HDR[@]}" -d "$BODY" \
| python3 -c '
import sys, json
raw = sys.stdin.read()
chunks = []
for line in raw.splitlines():
    line = line.strip()
    if line.startswith("data:"):
        line = line[5:].strip()
    if not line:
        continue
    try:
        d = json.loads(line)
    except Exception:
        continue
    res = d.get("result") or {}
    if d.get("error"):
        print("MCP ERROR:", json.dumps(d["error"])[:400]); sys.exit(1)
    for c in res.get("content", []) or []:
        if c.get("type") == "text":
            chunks.append(c["text"])
    if res.get("structuredContent"):
        chunks.append(json.dumps(res["structuredContent"], ensure_ascii=False))
out = "\n".join(chunks).strip()
print(out if out else "(empty)")
'
