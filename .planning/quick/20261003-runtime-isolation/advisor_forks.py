import json, glob, os
from datetime import datetime
P = os.path.expanduser("~/.claude/projects/-home-dxb-DxB-Global-OS/")
W = {"5ed74ad7": "2026-10-03T11:16:00Z", "32178f5b": "2026-10-03T12:06:00Z", "cbedb76a": "2026-10-03T15:11:00Z", "79e77b01": "2026-10-03T23:59:00Z"}
loc = lambda ts: datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone().strftime("%H:%M")
print("ADVISOR CALLS (second iteration of a lead call)")
for s, hi in W.items():
    f = glob.glob(P + s + "*.jsonl")[0]
    seen = {}
    for l in open(f):
        try: e = json.loads(l)
        except: continue
        ts = e.get("timestamp")
        if not ts or ts > hi: continue
        m = e.get("message") or {}
        if e.get("type") == "assistant" and m.get("usage"):
            seen[m.get("id")] = (ts, m["usage"])
    tot_in = tot_out = n = 0
    for ts, u in sorted(seen.values()):
        its = u.get("iterations") or []
        for it in its[1:]:
            if it.get("type") != "message":
                n += 1; tot_in += it.get("input_tokens", 0) + it.get("cache_read_input_tokens", 0) + it.get("cache_creation_input_tokens", 0); tot_out += it.get("output_tokens", 0)
                print(f"  {s} {loc(ts)} type={it.get('type')} model={it.get('model')} in={it.get('input_tokens'):,} cache_read={it.get('cache_read_input_tokens')} out={it.get('output_tokens'):,}")
    print(f"  {s}: {n} advisor calls, input {tot_in:,}, output {tot_out:,}")
print("FORKS")
for s in W:
    for f in sorted(glob.glob(P + s + "*/subagents/*.jsonl")):
        seen = {}
        for l in open(f):
            try: e = json.loads(l)
            except: continue
            m = e.get("message") or {}
            if e.get("type") == "assistant" and m.get("usage"):
                seen[m.get("id")] = (e.get("timestamp"), m["usage"])
        rows = sorted(seen.values())
        if not rows: continue
        c = lambda u: (u.get("input_tokens") or 0) + (u.get("cache_read_input_tokens") or 0) + (u.get("cache_creation_input_tokens") or 0)
        new = sum((u.get("input_tokens") or 0) + (u.get("cache_creation_input_tokens") or 0) + (u.get("output_tokens") or 0) for _, u in rows)
        reads = sum(u.get("cache_read_input_tokens") or 0 for _, u in rows)
        mins = (datetime.fromisoformat(rows[-1][0].replace("Z","+00:00")) - datetime.fromisoformat(rows[0][0].replace("Z","+00:00"))).total_seconds()/60
        print(f"  {s} {loc(rows[0][0])} calls {len(rows):3d} {mins:5.1f} min  start ctx {c(rows[0][1]):,} (written {rows[0][1].get('cache_creation_input_tokens'):,})  end ctx {c(rows[-1][1]):,}  new {new:,}  reads {reads:,}")
