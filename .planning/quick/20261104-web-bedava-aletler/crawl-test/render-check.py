#!/usr/bin/env python3
"""Rendered DOM against the raw curl body, paced at 2 requests/s, images and fonts aborted.
usage: render-check.py urls.txt out.jsonl    (runs inside the LibreCrawl image: it carries Playwright)"""
import asyncio, json, re, sys, time

import requests
from playwright.async_api import async_playwright

UA = "Mozilla/5.0 (compatible; SiteAudit/1.0)"
JS = """() => ({title: document.title, h1: document.querySelectorAll('h1').length,
 h1text: (document.querySelector('h1')||{}).innerText||'',
 canonical: (document.querySelector('link[rel=canonical]')||{}).href||null,
 hreflang: document.querySelectorAll('link[rel=alternate][hreflang]').length,
 links: document.querySelectorAll('a[href]').length, text: document.body.innerText.length})"""


def raw(url):
    b = requests.get(url, headers={"User-Agent": UA}, timeout=30).text
    t = re.sub(r"(?is)<(script|style|noscript)\b.*?</\1>", " ", b)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return {"bytes": len(b), "text": len(re.sub(r"\s+", " ", t).strip()), "h1": len(re.findall(r"(?i)<h1[\s>]", b)),
            "links": len(re.findall(r"(?i)<a\s[^>]*href", b))}


async def main():
    lock, count = asyncio.Lock(), [0]

    async def pace(route):
        if route.request.resource_type in ("image", "font", "media"):
            return await route.abort()
        async with lock:
            await asyncio.sleep(0.5)
            count[0] += 1
        await route.continue_()

    async with async_playwright() as p:
        br = await p.chromium.launch()
        ctx = await br.new_context(user_agent=UA)
        await ctx.route("**/*", pace)
        out = open(sys.argv[2], "w")
        for url in filter(None, map(str.strip, open(sys.argv[1]))):
            r = raw(url); await asyncio.sleep(1)
            page = await ctx.new_page(); count[0] = 0; t0 = time.time(); st = None
            try:
                resp = await page.goto(url, wait_until="load", timeout=90000)
                st = resp.status if resp else None
                await asyncio.sleep(3)
                d = await page.evaluate(JS)
            except Exception as e:
                d = {"error": str(e)[:200]}
            await page.close()
            out.write(json.dumps({"url": url, "status": st, "raw": r, "dom": d, "reqs": count[0], "secs": round(time.time()-t0, 1)}, ensure_ascii=False) + "\n"); out.flush()
        await br.close()

asyncio.run(main())
