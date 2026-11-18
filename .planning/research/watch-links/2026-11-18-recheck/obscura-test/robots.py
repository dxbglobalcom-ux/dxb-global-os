"""Fetch each site's robots.txt with obscura (raw) and check every URL the walks touched."""
import json, glob, os, subprocess, sys, urllib.robotparser
from urllib.parse import urlparse
J = sys.argv[1]
urls = {}
for f in glob.glob(J + "/raw/walk*/*.jsonl"):
    site = os.path.basename(f).rsplit("-", 1)[0]
    for l in open(f):
        r = json.loads(l)
        u = r.get("url")
        if u and r["step"] != "5a-searchpage":
            urls.setdefault(site, set()).add(u)
out = {}
os.makedirs(J + "/raw/robots", exist_ok=True)
for site, us in sorted(urls.items()):
    hosts = {urlparse(u).scheme + "://" + urlparse(u).netloc for u in us}
    res = []
    for h in sorted(hosts):
        p = subprocess.run(["obscura", "--stealth", "fetch", h + "/robots.txt", "--dump", "original", "-q"],
                           capture_output=True, text=True, timeout=40)
        txt = p.stdout
        open(J + f"/raw/robots/{urlparse(h).netloc}.txt", "w").write(txt)
        rp = urllib.robotparser.RobotFileParser(); rp.parse(txt.splitlines())
        for u in sorted(x for x in us if x.startswith(h)):
            res.append((u[:110], rp.can_fetch("*", u), len(txt)))
    out[site] = res
    for u, ok, n in res:
        print(f"{site:12} {'ALLOW' if ok else 'DENY '} robots={n}B {u}")
json.dump(out, open(J + "/raw/robots/check.json", "w"), indent=1)
