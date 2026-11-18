import sys, json, time
sys.path.insert(0, sys.argv[1])
from mcpc import MCP
m = MCP(stealth=True)
t=time.time(); r=m.tool("browser_navigate", {"url": sys.argv[2]}); print("NAV", round(time.time()-t,1), r["text"][:300])
r=m.tool("browser_evaluate", {"expression":"JSON.stringify({t:document.title,n:document.body.innerText.length,u:location.href})"}); print("EVAL", r)
r=m.tool("browser_links", {"limit":8,"internal_only":True}); print("LINKS", r["text"][:800])
r=m.tool("browser_snapshot", {"max_chars":600}); print("SNAP", r["text"][:1200])
m.close()
