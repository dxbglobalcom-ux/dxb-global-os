#!/usr/bin/env python3
"""List every post of one Instagram profile through the hidden research Chrome (read-only).
usage: igprofile.py <username> <out.jsonl> [max_posts]
Opens the profile like a person, scrolls it, and keeps what the page itself loads (its own timeline
answers). One line per post: code, date, type, duration, likes, comments, plays, caption."""
import json, os, random, sys, time, datetime
sys.path.insert(0, "/home/dxb/DxB Global OS/.claude/skills/dxb-research/scripts")
import hidden as H

user, out = sys.argv[1], sys.argv[2]
cap = int(sys.argv[3]) if len(sys.argv) > 3 else 100000
seen = {}
if os.path.exists(out):
    for l in open(out):
        d = json.loads(l); seen[d["code"]] = d


def nodes(o):
    if isinstance(o, dict):
        if "code" in o and "taken_at" in o and ("media_type" in o or "caption" in o):
            yield o
        else:
            for v in o.values():
                yield from nodes(v)
    elif isinstance(o, list):
        for v in o:
            yield from nodes(v)


def keep(i, f):
    if not i.get("code") or i["code"] in seen:
        return 0
    u = (i.get("user") or i.get("owner") or {}).get("username")
    if u and u != user:
        return 0
    capt = i.get("caption")
    d = {"code": i["code"], "date": datetime.datetime.fromtimestamp(i["taken_at"]).strftime("%Y-%m-%d"),
         "mt": i.get("media_type"), "pt": i.get("product_type") or "", "dur": i.get("video_duration") or 0,
         "likes": i.get("like_count") or 0, "comments": i.get("comment_count") or 0,
         "plays": i.get("play_count") or i.get("ig_play_count") or i.get("view_count") or 0,
         "n": i.get("carousel_media_count") or 0, "cap": (capt.get("text") if isinstance(capt, dict) else capt) or ""}
    seen[d["code"]] = d
    f.write(json.dumps(d, ensure_ascii=False) + "\n"); f.flush()
    return 1


H._unlocked()
if not H.version():
    sys.exit("hidden Chrome is down")
H.reap()
with H.slot(600):
    with H.Tab(width=1200, height=1400) as tab:
        page = H.CDP(tab.ws)
        try:
            page.send("Page.enable", {}, 15)
            page.send("Network.enable", {"maxTotalBufferSize": 200000000, "maxResourceBufferSize": 50000000}, 15)
            page.send("Page.navigate", {"url": f"https://www.instagram.com/{user}/"}, 30)
            page.wait_event("Page.loadEventFired", 30)
            time.sleep(5)
            want, idle = {}, 0
            with open(out, "a") as f:
                # what the first paint carried inside the HTML
                html = page.evaluate("[...document.querySelectorAll('script[type=\"application/json\"]')].map(s=>s.textContent).filter(t=>t.includes('taken_at')).join('\\n')", 30) or ""
                for line in html.split("\n"):
                    try:
                        for n in nodes(json.loads(line)):
                            keep(n, f)
                    except Exception:
                        pass
                while len(seen) < cap and idle < 8:
                    page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)", 10)
                    page.wait_event("Network.loadingFinished", random.uniform(2.5, 4.5))
                    time.sleep(random.uniform(0.8, 1.6))
                    try:
                        page.send("Runtime.evaluate", {"expression": "1"}, 5)   # drains pending events
                    except Exception:
                        pass
                    new = 0
                    evs, page.events = page.events, []
                    for e in evs:
                        m, p = e.get("method"), e.get("params") or {}
                        if m == "Network.responseReceived" and "/graphql" in (p.get("response") or {}).get("url", ""):
                            want[p["requestId"]] = False
                        elif m == "Network.loadingFinished" and p.get("requestId") in want:
                            want[p["requestId"]] = True
                    for rid in [r for r, ok in want.items() if ok]:
                        del want[rid]
                        try:
                            body = page.send("Network.getResponseBody", {"requestId": rid}, 20).get("body") or ""
                            if "taken_at" in body:
                                for n in nodes(json.loads(body)):
                                    new += keep(n, f)
                        except Exception:
                            pass
                    idle = 0 if new else idle + 1
                    if new:
                        print(f"{len(seen)} posts", flush=True)
                    if page.evaluate("/login|challenge|checkpoint/.test(location.pathname)", 10):
                        print("REFUSED: the page went to a login or challenge screen", flush=True); sys.exit(2)
        finally:
            page.close()
print(f"DONE {user}: {len(seen)}")
