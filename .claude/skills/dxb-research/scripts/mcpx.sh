#!/usr/bin/env bash
# One call to a keyless MCP door, printed as plain text. (Exa alone uses the holding's key when
# ~/.config/dxb/exa.env exists — see its case below. `octen` is a spare: keyed, paid, not MCP, and
# fired by no sweep — it is called by name only.)
#
# The five keyless doors answer `tools/call` over HTTP with no API key, no account and no
# card — measured 2026-09-16 at 0.22-0.50 s each. They are the reason the anti-
# concentration rule in the gate is enforceable: with one search engine it is an
# aspiration, with five it is a rule.
#
#   mcpx.sh exa       "<query>" [n]
#   mcpx.sh parallel  "<query>" [n]
#   mcpx.sh tavily    "<query>" [n]
#   mcpx.sh firecrawl "<query>" [n]
#   mcpx.sh youcom    "<query>" [n]
#   mcpx.sh octen     "<query>" [n]      (the spare)
#   mcpx.sh fetch-tavily <url>
#
# The endpoints owe us nothing and none of them publishes its keyless rate limit.
# That is why there are five and why every one of them has a fallback chain in
# config/registry.yaml.

set -uo pipefail
DOOR="${1:-}"; Q="${2:-}"; N="${3:-8}"
[ -z "$DOOR" ] || [ -z "$Q" ] && { echo "usage: mcpx.sh <exa|parallel|tavily|firecrawl|youcom|octen|fetch-tavily> \"<query|url>\" [n]" >&2; exit 2; }

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
  octen)
    # Ordered into the engine by the CEO on 2026-11-25; the blind trial of that day put it
    # last of four doors, so it stands as a spare. `standard`, because `dynamic` was empty on 13 of 20.
    URL="https://api.octen.ai/search"; OCTEN_API_KEY=""
    OCTEN_ENV="${DXB_OCTEN_ENV:-$HOME/.config/dxb/octen.env}"
    [ -r "$OCTEN_ENV" ] && OCTEN_API_KEY=$(sed -n 's/^OCTEN_API_KEY=//p' "$OCTEN_ENV" | head -1)
    BODY="{\"query\":$QJ,\"count\":$N,\"result_type\":\"standard\"}" ;;
  *) echo "unknown door: $DOOR" >&2; exit 2 ;;
esac

call() {
curl -sS -m 60 -X POST "$URL" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  "$@" -d "$BODY" \
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
# THE QUOTA NOTICE DRESSED AS AN ANSWER. A door whose free allowance is spent can answer a normal,
# non-error result whose only content is the notice: Tavily sent {"code":"monthly_cap_reached_bonus_eligible",
# ...} and keyless Exa sent "You have hit the Exa free MCP rate limit" (reworded: this block sits inside
# single quotes, so it may carry no apostrophe) — both exit 0 here, so the sweep
# counted a spent door as a working one. Measured 2026-10-13; fixed on his word ("yes correct it").
# A JSON body whose "code" names a cap, limit or quota, or a SHORT body that is only such a sentence,
# is an error; a real result that mentions rate limits is long and passes.
import re
notice = None
for ch in chunks:          # the notice can come twice: as text and again as structuredContent
    try:
        j = json.loads(ch)
    except Exception:
        continue
    if isinstance(j, dict) and re.search(r"cap|limit|quota|exceeded|payment", str(j.get("code", "")), re.I):
        notice = str(j.get("message") or j.get("code"))
        break
if notice is None and len(out) < 600 and re.search(
        r"rate limit|reached the .{0,20}limit|quota|limit reached|create (your own|an) .{0,10}api key", out, re.I):
    notice = out
if notice:
    print("MCP ERROR (quota):", notice.strip()[:400]); sys.exit(1)
print(out if out else "(empty)")
'
}

# Octen answers plain JSON. The key goes to curl as a header FILE (a shell-made descriptor), so no
# process list shows it, and a refusal prints our own words, never the server text that may repeat it.
# Octen says out-of-balance with 403 (its API reference), not 402; both are taken.
call_octen() {
[ -n "$OCTEN_API_KEY" ] || { echo "MCP ERROR (quota): octen — no key in $OCTEN_ENV"; return 1; }
curl -sS -m 60 -X POST "$URL" \
  -H 'Content-Type: application/json' \
  -H @<(printf 'x-api-key: %s\n' "$OCTEN_API_KEY") \
  -w '\n%{http_code}' -d "$BODY" \
| python3 -c '
import sys, json
raw, _, status = sys.stdin.read().rpartition("\n")
try:
    d = json.loads(raw)
except Exception:
    d = {}
code = status if status != "200" else str(d.get("code") or 0)   # a 200 can carry the refusal in its body
refused = {"401": "key refused", "402": "out of credit", "403": "out of credit", "429": "rate limit"}.get(code)
if refused:
    print(f"MCP ERROR (quota): octen — {refused} (HTTP {code})"); sys.exit(1)
if code != "0" or not isinstance(d.get("data"), dict):
    msg = str(d.get("msg") or "no readable answer").replace("\n", " ")[:400]
    print(f"MCP ERROR: octen — HTTP {status}, {msg}"); sys.exit(1)
def entry(r):
    return "\n".join([
        "Title: " + (r.get("title") or "N/A"),
        "URL: " + (r.get("url") or "N/A"),
        "Published: " + (r.get("time_published") or "N/A"),
        "Author: " + (r.get("authors") or "N/A"),
        "Highlights:", r.get("highlight") or "",
    ])
print("\n\n---\n\n".join(entry(r) for r in d["data"].get("results") or []) or "(empty)")
'
}
if [ "$DOOR" = octen ]; then call_octen; exit $?; fi

# THE KEY RUNS OUT (his order 2026-10-13: "exa bitince haber verilsin"). A keyed Exa call that fails
# on the key or its credit raises a flag the session opening reads (.claude/hooks/spec-bootstrap.sh)
# and puts one desktop notice on his screen, once; the search itself falls back to the keyless call,
# so research does not stop. The flag clears itself on the next keyed call that answers. Exa's exact
# out-of-credit text was not observable on 2026-10-13 (the account had credit), so the match is broad:
# 401/402/403 or the words credit, balance, insufficient, payment, billing, invalid api key. A rate
# limit or a timeout is not the key running out and raises nothing.
EXA_FLAG="${DXB_EXA_FLAG:-$HOME/.config/dxb/exa-out.flag}"
if [ "$DOOR" = exa ] && [ ${#HDR[@]} -gt 0 ]; then
  OUT=$(call "${HDR[@]}"); RC=$?
  if [ $RC -eq 0 ]; then
    rm -f "$EXA_FLAG"; printf '%s\n' "$OUT"; exit 0
  fi
  if printf '%s' "$OUT" | grep -qiE '\b(401|402|403)\b|credit|balance|insufficient|payment|billing|invalid api key'; then
    if [ ! -e "$EXA_FLAG" ]; then
      mkdir -p "$(dirname "$EXA_FLAG")"
      printf '%s %s\n' "$(date -Is)" "$(printf '%s' "$OUT" | head -c 300 | tr '\n' ' ')" > "$EXA_FLAG"
      notify-send -u critical "Exa kredisi bitti" "Araştırma Exa'yı anahtarsız kullanıyor. Kredi eklemek: dashboard.exa.ai" 2>/dev/null || true
    fi
  fi
  call
  exit $?
fi
call "${HDR[@]}"
