#!/usr/bin/env bash
# One call to a keyless MCP door, printed as plain text. (Exa alone uses the holding's key when
# ~/.config/dxb/exa.env exists — see its case below.)
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
    # Keyless Exa answered "You've hit Exa's free MCP rate limit" on 2026-10-13; the CEO opened an
    # Exa account the same day (his word: "hesap aç"). The key lives outside the repo, 0600, and goes
    # in a header so it never sits in a URL, a process list or an error line. No file -> keyless.
    URL="https://mcp.exa.ai/mcp"; HDR=()
    EXA_ENV="${DXB_EXA_ENV:-$HOME/.config/dxb/exa.env}"
    if [ -r "$EXA_ENV" ]; then
      EXA_API_KEY=$(sed -n 's/^EXA_API_KEY=//p' "$EXA_ENV" | head -1)
      [ -n "$EXA_API_KEY" ] && HDR=(-H "x-api-key: $EXA_API_KEY")
    fi
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
    # THE ERROR INSIDE THE RESULT. A failed tool call arrives as `result.isError: true` with
    # the diagnostic in the same `content` array a result would use. This file printed that
    # diagnostic as the answer of the channel, exit 0 — which is how the coverage table stamped a
    # 135-byte quota notice `ok` and the engine reported five search engines while three were
    # answering. Measured 2026-09-17.
    if res.get("isError"):
        msg = " ".join(c.get("text", "") for c in res.get("content", []) or [])
        print("MCP ERROR (isError):", msg.strip()[:400]); sys.exit(1)
    for c in res.get("content", []) or []:
        if c.get("type") == "text":
            chunks.append(c["text"])
    if res.get("structuredContent"):
        chunks.append(json.dumps(res["structuredContent"], ensure_ascii=False))
out = "\n".join(chunks).strip()
print(out if out else "(empty)")
'
