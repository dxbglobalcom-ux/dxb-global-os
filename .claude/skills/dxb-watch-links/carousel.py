#!/usr/bin/env python3
"""Screenshot every slide of an Instagram /p/ carousel in the hidden research Chrome.
usage: carousel.py <url> <outdir>   — writes slide01.png … and prints the count."""
import base64, os, sys, time
sys.path.insert(0, "/home/dxb/DxB Global OS/.claude/skills/dxb-research/scripts")
import hidden as H

url, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
NEXT_JS = """(() => { const b = [...document.querySelectorAll('button[aria-label]')]
  .find(x => /^(Next|İleri|Sonraki)$/i.test(x.getAttribute('aria-label')));
  if (!b) return false; b.click(); return true; })()"""
H._unlocked()
if not H.version():
    sys.exit("hidden Chrome is down")
H.reap()
n = 0
with H.slot(60):
    with H.Tab(width=1080, height=1350) as tab:
        page = H.CDP(tab.ws)
        try:
            page.send("Page.enable", {}, 15)
            page.send("Page.navigate", {"url": url}, 30)
            page.wait_event("Page.loadEventFired", 30)
            time.sleep(4)
            for i in range(20):
                shot = page.send("Page.captureScreenshot", {"format": "png"}, 30)
                n += 1
                open(f"{out}/slide{n:02d}.png", "wb").write(base64.b64decode(shot["data"]))
                if not page.evaluate(NEXT_JS, 10):
                    break
                time.sleep(1.5)
        finally:
            page.close()
print(n)
