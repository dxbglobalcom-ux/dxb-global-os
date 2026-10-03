import json, glob, os
from datetime import datetime
P = os.path.expanduser("~/.claude/projects/-home-dxb-DxB-Global-OS/")
# list prices $/MTok (claude-api skill, cached 2026-09-25): Opus 5.5 in 4, out 20, cache read 0.20, 1h write 2x in = 8
OP = dict(inp=4.0, w1h=8.0, w5m=5.0, read=0.20, out=20.0)
FB = dict(inp=10.0, out=50.0, read=0.25)
W = {"5ed74ad7": "2026-10-03T11:16:00Z", "32178f5b": "2026-10-03T12:06:00Z", "cbedb76a": "2026-10-03T15:11:00Z", "79e77b01": "2026-10-03T23:59:00Z"}
def usage_rows(f, hi="9999"):
    seen = {}
    for l in open(f):
        try: e = json.loads(l)
        except: continue
        ts = e.get("timestamp")
        if not ts or ts > hi: continue
        m = e.get("message") or {}
        if e.get("type") == "assistant" and m.get("usage"): seen[m.get("id")] = (ts, m["usage"])
    return sorted(seen.values())
def cost_exec(rows):
    c = dict(inp=0, w=0, read=0, out=0)
    adv_in = adv_out = 0
    for _, u in rows:
        its = u.get("iterations") or [u]
        for it in its:
            if it.get("type") in (None, "message"):
                c["inp"] += it.get("input_tokens") or 0
                c["read"] += it.get("cache_read_input_tokens") or 0
                c["w"] += it.get("cache_creation_input_tokens") or 0
                c["out"] += it.get("output_tokens") or 0
            else:
                adv_in += (it.get("input_tokens") or 0) + (it.get("cache_creation_input_tokens") or 0)
                adv_out += it.get("output_tokens") or 0
    d = dict(inp=c["inp"]*OP["inp"]/1e6, w=c["w"]*OP["w1h"]/1e6, read=c["read"]*OP["read"]/1e6, out=c["out"]*OP["out"]/1e6)
    adv = adv_in*FB["inp"]/1e6 + adv_out*FB["out"]/1e6
    return c, d, adv
tot = {}
for s, hi in W.items():
    f = glob.glob(P + s + "*.jsonl")[0]
    rows = usage_rows(f, hi)
    c, d, adv = cost_exec(rows)
    fk = 0.0; fk_reads = 0.0
    for sf in glob.glob(P + s + "*/subagents/*.jsonl"):
        fc, fd, fadv = cost_exec(usage_rows(sf))
        fk += sum(fd.values()) + fadv; fk_reads += fd["read"]
    t0 = datetime.fromisoformat(rows[0][0].replace("Z","+00:00")); t1 = datetime.fromisoformat(rows[-1][0].replace("Z","+00:00"))
    lead = sum(d.values())
    print(f"{s}: {(t1-t0).total_seconds()/60:4.0f} min | lead ${lead:6.2f} (reads ${d['read']:.2f} = {100*d['read']/lead:.0f}%, writes ${d['w']:.2f}, output ${d['out']:.2f}) | forks ${fk:6.2f} (of it reads ${fk_reads:.2f}) | Fable ${adv:5.2f} | total ${lead+fk+adv:6.2f}")
