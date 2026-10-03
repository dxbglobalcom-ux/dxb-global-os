import json, glob, os, statistics
from datetime import datetime
P = os.path.expanduser("~/.claude/projects/-home-dxb-DxB-Global-OS/")
W = {"5ed74ad7": "2026-10-03T11:16:00Z", "32178f5b": "2026-10-03T12:06:00Z", "cbedb76a": "2026-10-03T15:11:00Z", "79e77b01": "2026-10-03T23:59:00Z"}
T = lambda ts: datetime.fromisoformat(ts.replace("Z", "+00:00"))
for s, hi in W.items():
    f = glob.glob(P + s + "*.jsonl")[0]
    ents = []
    for l in open(f):
        try: e = json.loads(l)
        except: continue
        ts = e.get("timestamp")
        if not ts or ts > hi: continue
        ents.append(e)
    # first entry index per assistant message id, preceding non-assistant entry's time
    first = {}
    prev_ts = None
    lat = []   # (ctx, seconds, has_advisor)
    msg_usage = {}
    for e in ents:
        m = e.get("message") or {}
        if e.get("type") == "assistant" and m.get("id"):
            mid = m["id"]
            if m.get("usage"): msg_usage[mid] = m["usage"]
            if mid not in first and prev_ts: first[mid] = (prev_ts, e["timestamp"])
            last_ts = e["timestamp"]
            first.setdefault(mid, (e["timestamp"], e["timestamp"]))
            first[mid] = (first[mid][0], e["timestamp"])  # keep start, extend end
        elif e.get("type") in ("user",):
            prev_ts = e["timestamp"]
    adv = []; rows = []
    for mid, (start, end) in first.items():
        u = msg_usage.get(mid)
        if not u: continue
        its = u.get("iterations") or [u]
        ex = [it for it in its if it.get("type") in (None, "message")]
        ctx = (ex[0].get("input_tokens") or 0) + (ex[0].get("cache_read_input_tokens") or 0) + (ex[0].get("cache_creation_input_tokens") or 0) if ex else 0
        dur = (T(end) - T(start)).total_seconds()
        out = sum(it.get("output_tokens") or 0 for it in ex)
        if any(it.get("type") == "advisor_message" for it in its):
            a = [it for it in its if it.get("type") == "advisor_message"][0]
            adv.append((T(start).astimezone().strftime("%H:%M"), a.get("input_tokens"), round(dur)))
        elif 0 < dur < 900:
            rows.append((ctx, dur, out))
    def bucket(lo, hi):
        b = [d for c, d, o in rows if lo <= c < hi]
        o = [o for c, d, o in rows if lo <= c < hi]
        return f"{len(b):3d} calls median {statistics.median(b):5.1f}s (median output {statistics.median(o):,.0f})" if b else "  — "
    print(f"== {s}")
    print("   <150k :", bucket(0, 150_000))
    print("   150-300k:", bucket(150_000, 300_000))
    print("   300k+ :", bucket(300_000, 10**9))
    for t, i, d in adv: print(f"   advisor {t}: Fable read {i:,} → the lead waited {d}s")
