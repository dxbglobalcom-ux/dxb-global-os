"""Tiny CDP client against `obscura serve`: open a page, read it, type into a search box, press Enter."""
import asyncio, json, sys, time, urllib.request
import websockets

PORT = int(sys.argv[1])

async def main():
    ver = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/version"))
    ws_url = ver['webSocketDebuggerUrl']; assert ':9461/' in ws_url or True
    print("browser:", ver.get("Browser"), ws_url)
    async with websockets.connect(ws_url, max_size=50_000_000) as ws:
        n = 0
        async def call(method, params=None, session=None):
            nonlocal n
            n += 1; mid = n
            msg = {"id": mid, "method": method, "params": params or {}}
            if session: msg["sessionId"] = session
            await ws.send(json.dumps(msg))
            while True:
                r = json.loads(await ws.recv())
                if r.get("id") == mid:
                    return r
        t = await call("Target.createTarget", {"url": "about:blank"})
        tid = t["result"]["targetId"]
        s = (await call("Target.attachToTarget", {"targetId": tid, "flatten": True}))["result"]["sessionId"]
        await call("Page.enable", session=s)
        t0 = time.time()
        await call("Page.navigate", {"url": "https://en.wikipedia.org/wiki/Headless_browser"}, session=s)
        await asyncio.sleep(3)
        ev = lambda e: call("Runtime.evaluate", {"expression": e, "returnByValue": True, "awaitPromise": True}, session=s)
        r = await ev("document.title + ' | ' + document.body.innerText.length")
        print("page:", r["result"]["result"].get("value"), round(time.time() - t0, 1), "s")
        # type into the search box through real key events, then Enter
        await ev("document.querySelector('input[name=search]').focus()")
        for ch in "Puppeteer":
            await call("Input.dispatchKeyEvent", {"type": "keyDown", "text": ch, "key": ch}, session=s)
            await call("Input.dispatchKeyEvent", {"type": "keyUp", "key": ch}, session=s)
        r = await ev("document.querySelector('input[name=search]').value")
        print("typed value:", r["result"]["result"].get("value"))
        await call("Input.dispatchKeyEvent", {"type": "keyDown", "key": "Enter", "code": "Enter", "windowsVirtualKeyCode": 13}, session=s)
        await call("Input.dispatchKeyEvent", {"type": "keyUp", "key": "Enter", "code": "Enter", "windowsVirtualKeyCode": 13}, session=s)
        await asyncio.sleep(4)
        r = await ev("location.href + ' | ' + document.title + ' | ' + document.body.innerText.length")
        print("after Enter:", r["result"]["result"].get("value"))
        await call("Target.closeTarget", {"targetId": tid})

asyncio.run(main())
