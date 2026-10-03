import json, sys, glob, os
from datetime import datetime, timezone
P = os.path.expanduser("~/.claude/projects/-home-dxb-DxB-Global-OS/")
# handover windows, local time 2026-10-03 (UTC+2) -> compare in UTC
W = {
 "5ed74ad7": ("2026-10-03T00:00:00Z", "2026-10-03T11:16:00Z"),
 "32178f5b": ("2026-10-03T00:00:00Z", "2026-10-03T12:06:00Z"),
 "cbedb76a": ("2026-10-03T00:00:00Z", "2026-10-03T15:11:00Z"),
 "79e77b01": ("2026-10-03T00:00:00Z", "2026-10-03T23:59:00Z"),
}
def calls(f, lo, hi):
    seen = {}
    forks = []
    for l in open(f):
        try: e = json.loads(l)
        except: continue
        ts = e.get("timestamp")
        if not ts or ts < lo or ts > hi: continue
        m = e.get("message") or {}
        if e.get("type") == "assistant":
            if m.get("usage"): seen[m.get("id")] = (ts, m["usage"])
            for c in (m.get("content") or []):
                if isinstance(c, dict) and c.get("type") == "tool_use" and c.get("name") == "Agent":
                    forks.append((ts, (c.get("input") or {}).get("subagent_type"), (c.get("input") or {}).get("description")))
    rows = sorted(seen.values())
    return rows, forks
for s, (lo, hi) in W.items():
    f = glob.glob(P + s + "*.jsonl")[0]
    rows, forks = calls(f, lo, hi)
    if not rows: print(s, "no rows"); continue
    ctx = lambda u: (u.get("input_tokens") or 0) + (u.get("cache_read_input_tokens") or 0) + (u.get("cache_creation_input_tokens") or 0)
    new = lambda u: (u.get("input_tokens") or 0) + (u.get("cache_creation_input_tokens") or 0) + (u.get("output_tokens") or 0)
    first, last = rows[0], rows[-1]
    t0 = datetime.fromisoformat(first[0].replace("Z","+00:00")); t1 = datetime.fromisoformat(last[0].replace("Z","+00:00"))
    print(f"== {s}: {t0.astimezone().strftime('%H:%M')} -> {t1.astimezone().strftime('%H:%M')} ({(t1-t0).total_seconds()/60:.0f} min), calls {len(rows)}")
    print(f"   first call: context {ctx(first[1]):,}  written {first[1].get('cache_creation_input_tokens'):,}")
    print(f"   last call:  context {ctx(last[1]):,}  max context {max(ctx(u) for _,u in rows):,}")
    print(f"   new tokens {sum(new(u) for _,u in rows):,}  cache reads {sum(u.get('cache_read_input_tokens') or 0 for _,u in rows):,}  output {sum(u.get('output_tokens') or 0 for _,u in rows):,}")
    # context every 20 min
    marks = []; nxt = t0
    for ts, u in rows:
        t = datetime.fromisoformat(ts.replace("Z","+00:00"))
        if t >= nxt: marks.append(f"{t.astimezone().strftime('%H:%M')} {ctx(u)//1000}k"); nxt = t.replace(second=0) + (datetime.min.replace(minute=20)-datetime.min)
    print("   curve:", " · ".join(marks))
    for ts, typ, d in forks:
        print(f"   Agent {datetime.fromisoformat(ts.replace('Z','+00:00')).astimezone().strftime('%H:%M')} {typ} — {d}")
