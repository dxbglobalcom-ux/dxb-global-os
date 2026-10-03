import json, glob, os
P = os.path.expanduser("~/.claude/projects/")
OPUS = dict(inp=4.0, w=8.0, r=0.20, out=20.0)          # $/MTok list (claude-api skill)
HAIKU = dict(inp=1.0, w=2.0, r=0.10, out=5.0)          # assumption: haiku 1h write 2x, read 0.1x
FABLE = dict(inp=10.0, out=50.0)
LO = "2026-10-03T13:00:00Z"
probes = ["2026-10-03T17:38:20Z", "2026-10-03T17:41:06Z", "2026-10-03T17:41:27Z", "2026-10-03T17:43:33Z", "2026-10-03T17:44:36Z", "2026-10-03T17:46:42Z"]
ex = {}      # message id -> (ts, model, usage executor parts)
adv = {}     # server_tool_use id -> (ts, in, out)
for f in glob.glob(P + "**/*.jsonl", recursive=True):
    try: fh = open(f)
    except: continue
    for l in fh:
        try: e = json.loads(l)
        except: continue
        ts = e.get("timestamp")
        if not ts or ts < LO: continue
        m = e.get("message") or {}
        if e.get("type") != "assistant" or not m.get("usage"): continue
        u = m["usage"]; its = u.get("iterations") or [u]
        exe = [it for it in its if it.get("type") in (None, "message")]
        ex[m.get("id")] = (ts, m.get("model") or "", exe)
        a = [it for it in its if it.get("type") == "advisor_message"]
        ids = [c.get("id") for c in (m.get("content") or []) if isinstance(c, dict) and c.get("type") == "server_tool_use" and c.get("name") == "advisor"]
        for i in ids:
            if a: adv.setdefault(i, (ts, a[0].get("input_tokens") or 0, a[0].get("output_tokens") or 0))
def price(model, it):
    p = HAIKU if "haiku" in model else OPUS
    return ((it.get("input_tokens") or 0)*p["inp"] + (it.get("cache_creation_input_tokens") or 0)*p["w"] + (it.get("cache_read_input_tokens") or 0)*p["r"] + (it.get("output_tokens") or 0)*p["out"]) / 1e6
def upto(t):
    e = sum(price(mo, it) for ts, mo, exe in ex.values() if ts <= t for it in exe)
    a = sum((i*FABLE["inp"] + o*FABLE["out"]) / 1e6 for ts, i, o in adv.values() if ts <= t)
    return e, a
print("advisor calls in the window:", [(ts[11:19], i, o) for ts, i, o in sorted(adv.values())])
e0, a0 = upto(probes[0])
print(f"to 17:38:20Z (5h=27): executor ${e0:.2f}  Fable ${a0:.2f}")
k1 = 27 / e0; k2 = 27 / (e0 + a0)
for t in probes[1:]:
    e, a = upto(t)
    print(f"to {t[11:19]}Z: executor ${e:.2f} Fable ${a:.2f} | predicted 5h if Fable NOT counted {e*k1:5.1f} · if counted at list {(e+a)*k2:5.1f}")
