#!/usr/bin/env python3
"""Independent ground truth: fetch each URL with curl, parse with the stdlib.
usage: truth.py urls.txt out.jsonl [delay_seconds] [body_dir]
"""
import hashlib, json, os, subprocess, sys, time
from html.parser import HTMLParser

UA = "Mozilla/5.0 (compatible; SiteAudit/1.0)"


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title, self.in_title = None, False
        self.canonical, self.hreflang, self.h1 = None, 0, 0
        self.description, self.robots = None, None

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): v for k, v in attrs}
        if tag == "title" and self.title is None:
            self.title, self.in_title = "", True
        elif tag == "h1":
            self.h1 += 1
        elif tag == "link":
            rel = (a.get("rel") or "").lower()
            if rel == "canonical" and self.canonical is None:
                self.canonical = a.get("href")
            if rel == "alternate" and a.get("hreflang"):
                self.hreflang += 1
        elif tag == "meta":
            name = (a.get("name") or "").lower()
            if name == "description" and self.description is None:
                self.description = a.get("content")
            if name == "robots" and self.robots is None:
                self.robots = a.get("content")

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


def fetch(url):
    r = subprocess.run(
        ["curl", "-sS", "--compressed", "-A", UA, "-m", "30", "-o", "-",
         "-w", "\n%{http_code} %{time_total} %{redirect_url}", url],
        capture_output=True)
    body, _, tail = r.stdout.rpartition(b"\n")
    if len(sys.argv) > 4:
        with open(os.path.join(sys.argv[4], hashlib.sha1(url.encode()).hexdigest() + ".html"), "wb") as f:
            f.write(body)
    code, secs, *loc = tail.decode().split(" ", 2) + [""]
    p = Page()
    p.feed(body.decode("utf-8", "replace"))
    return {"url": url, "status": int(code or 0), "secs": float(secs or 0),
            "location": (loc[0] if loc else "").strip() or None,
            "bytes": len(body), "title": (p.title or "").strip() or None,
            "canonical": p.canonical, "hreflang": p.hreflang, "h1": p.h1,
            "description": p.description, "robots": p.robots}


urls = [u.strip() for u in open(sys.argv[1]) if u.strip()]
delay = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
with open(sys.argv[2], "w") as out:
    for u in urls:
        out.write(json.dumps(fetch(u), ensure_ascii=False) + "\n")
        out.flush()
        time.sleep(delay)
