import sys, time, json
sys.path.insert(0, sys.argv[1]); from mcpc import MCP
m = MCP(stealth=sys.argv[2] == "stealth"); t0 = time.time()
r = m.tool("browser_navigate", {"url": sys.argv[3]}, timeout=60); print("nav", round(time.time()-t0,1), r["text"][:200])
time.sleep(6)
r = m.tool("browser_evaluate", {"expression": "JSON.stringify({u:location.href,t:document.title,n:document.body.innerText.length,tx:document.body.innerText.slice(0,600)})"})
print(round(time.time()-t0,1), r["text"][:900]); m.close()
