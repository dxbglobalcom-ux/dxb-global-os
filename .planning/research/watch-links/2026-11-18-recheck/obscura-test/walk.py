"""Walk one site with obscura's MCP server (one browser session, cookies kept across steps).

usage: python3 -I walk.py <dir> <site> <stealth|plain>
Writes <dir>/raw/walk/<site>-<mode>.jsonl and per-step text excerpts.
"""
import sys, json, time, re, os
from urllib.parse import urlparse
D = sys.argv[1]
sys.path.insert(0, D)
from mcpc import MCP

SITES = {
 "g2": dict(direct=["https://www.g2.com/products/slack/competitors/alternatives","https://www.g2.com/products/microsoft-teams/reviews","https://www.g2.com/categories/team-collaboration"],start="https://www.g2.com/products/slack/reviews",
   steps=[[r"g2\.com/products/(?!slack/)[\w-]+/reviews/?$", r"g2\.com/products/slack/competitors"],
          [r"g2\.com/products/[\w-]+/reviews\?.*page=2", r"g2\.com/categories/[\w-]+/?$"],
          [r"g2\.com/products/[\w-]+/reviews/?$", r"g2\.com/categories/"]],
   search=("url", "https://www.g2.com/search?query=crm")),
 "crunchbase": dict(direct=["https://www.crunchbase.com/organization/anthropic","https://www.crunchbase.com/person/sam-altman","https://www.crunchbase.com/organization/microsoft"],start="https://www.crunchbase.com/organization/openai",
   steps=[[r"crunchbase\.com/organization/(?!openai)[\w-]+/?$"],
          [r"crunchbase\.com/person/[\w-]+", r"crunchbase\.com/organization/[\w-]+/?$"],
          [r"crunchbase\.com/(organization|person|hub)/"]],
   search=("type_on", "https://www.crunchbase.com/", "input[type=search], input[placeholder*=earch], input[aria-label*=earch]", "anthropic")),
 "upwork": dict(direct=["https://www.upwork.com/freelance-jobs/web-scraping/","https://www.upwork.com/hire/python-developers/","https://www.upwork.com/nx/search/jobs/?q=ai%20automation&page=2"],start="https://www.upwork.com/nx/search/jobs/?q=ai%20automation",
   steps=[[r"upwork\.com/(jobs|freelance-jobs/apply)/.*~0"],
          [r"upwork\.com/nx/search/jobs/\?.*page=2", r"upwork\.com/freelance-jobs/[\w-]+/?$", r"upwork\.com/(jobs|freelance-jobs/apply)/.*~0"],
          [r"upwork\.com/(freelance-jobs|hire|resources)/", r"upwork\.com/(jobs|freelance-jobs/apply)/.*~0"]],
   search=("url", "https://www.upwork.com/nx/search/jobs/?q=web%20scraping")),
 "indeed": dict(direct=["https://www.indeed.com/cmp/Google","https://www.indeed.com/cmp/Google/reviews","https://www.indeed.com/jobs?q=ai+engineer&start=10"],start="https://www.indeed.com/jobs?q=ai+engineer",
   steps=[[r"indeed\.com/(rc/clk|viewjob|pagead/clk).*jk="],
          [r"indeed\.com/cmp/[\w-]+/?(\?|$)", r"indeed\.com/(rc/clk|viewjob).*jk="],
          [r"indeed\.com/cmp/[\w-]+/(reviews|jobs|salaries)", r"indeed\.com/jobs\?.*start=10", r"indeed\.com/cmp/"]],
   search=("url", "https://www.indeed.com/jobs?q=data+analyst&l=Austin%2C+TX")),
 "zillow": dict(direct=["https://www.zillow.com/austin-tx/2_p/","https://www.zillow.com/austin-tx/rentals/","https://www.zillow.com/cedar-park-tx/"],start="https://www.zillow.com/austin-tx/",
   steps=[[r"zillow\.com/homedetails/"],
          [r"zillow\.com/homedetails/", r"zillow\.com/[\w-]+-tx/?$"],
          [r"zillow\.com/austin-tx/2_p/", r"zillow\.com/[\w-]+-tx/?$", r"zillow\.com/homedetails/"]],
   search=("url", "https://www.zillow.com/round-rock-tx/")),
 "google": dict(direct=["https://www.google.com/search?q=camoufox+browser&hl=en&start=10","https://camoufox.com/","https://camoufox.com/python/installation/"],start="https://www.google.com/search?q=camoufox+browser&hl=en",
   steps=[[r"google\.com/search\?.*start=10"],
          ["EXTERNAL"],
          ["SAMEHOST"]],
   search=("type_on", "https://www.google.com/?hl=en", "textarea[name=q], input[name=q]", "obscura headless browser rust")),
 "reddit": dict(direct=["https://www.reddit.com/r/LocalLLaMA/new/","https://www.reddit.com/r/MachineLearning/","https://www.reddit.com/r/LocalLLaMA/top/?t=month"],start="https://www.reddit.com/r/LocalLLaMA/top/?t=week",
   steps=[[r"reddit\.com/r/LocalLLaMA/comments/"],
          [r"reddit\.com/(user|u)/[\w-]+/?$", r"reddit\.com/r/LocalLLaMA/comments/"],
          [r"reddit\.com/r/\w+/?$", r"reddit\.com/r/LocalLLaMA/comments/"]],
   search=("url", "https://www.reddit.com/r/LocalLLaMA/search/?q=headless+browser")),
 "linkedin": dict(direct=["https://www.linkedin.com/company/openai/","https://www.linkedin.com/company/microsoft/","https://www.linkedin.com/company/anthropic/jobs/"],start="https://www.linkedin.com/company/anthropic/",
   steps=[[r"linkedin\.com/company/(?!anthropic)[\w-]+/?(\?|$)"],
          [r"linkedin\.com/jobs/view/", r"linkedin\.com/(posts|pulse)/", r"linkedin\.com/company/[\w-]+/?(\?|$)"],
          [r"linkedin\.com/(in|company|posts|pulse|jobs/view)/"]],
   search=("url", "https://www.linkedin.com/jobs/search?keywords=ai%20engineer&location=United%20States")),
 "trustpilot": dict(direct=["https://www.trustpilot.com/review/www.shopify.com?page=2","https://www.trustpilot.com/review/www.wix.com","https://www.trustpilot.com/categories/software_company"],start="https://www.trustpilot.com/review/www.shopify.com",
   steps=[[r"trustpilot\.com/review/www\.shopify\.com\?.*page=2"],
          [r"trustpilot\.com/review/(?!www\.shopify)[\w.-]+/?(\?|$)"],
          [r"trustpilot\.com/categories/", r"trustpilot\.com/review/"]],
   search=("type_on", "https://www.trustpilot.com/", "input[name=query], input[type=search]", "notion")),
 "glassdoor": dict(direct=["https://www.glassdoor.com/Overview/Working-at-Anthropic-EI_IE8109027.11,20.htm","https://www.glassdoor.com/Salary/Anthropic-Salaries-E8109027.htm","https://www.glassdoor.com/Reviews/Anthropic-Reviews-E8109027_P2.htm"],start="https://www.glassdoor.com/Reviews/Anthropic-Reviews-E8109027.htm",
   steps=[[r"glassdoor\.com/Overview/", r"glassdoor\.com/Salary/", r"glassdoor\.com/Salaries/"],
          [r"glassdoor\.com/(Salary|Salaries|Interview|Benefits|Jobs)/"],
          [r"glassdoor\.com/Reviews/.*_P2\.htm", r"glassdoor\.com/(Reviews|Overview)/"]],
   search=("url", "https://www.glassdoor.com/Search/results.htm?keyword=openai")),
 "cf-test": dict(start="https://www.scrapingcourse.com/cloudflare-challenge",
   steps=[["SAMEHOST"], ["SAMEHOST"], ["SAMEHOST"]], search=None),
 "antibot": dict(start="https://www.scrapingcourse.com/antibot-challenge",
   steps=[["SAMEHOST"], ["SAMEHOST"], ["SAMEHOST"]], search=None),
 # five ordinary script-heavy sites
 "ikea": dict(start="https://www.ikea.com/us/en/cat/bookcases-shelving-units-st002/",
   steps=[[r"ikea\.com/us/en/p/"], [r"ikea\.com/us/en/p/"], [r"ikea\.com/us/en/cat/"]],
   search=("type", "input[type=search], input[name=q]", "desk")),
 "yellowpages": dict(direct=["https://www.yellowpages.com/austin-tx/plumbers","https://www.yellowpages.com/austin-tx/dentists","https://www.yellowpages.com/search?search_terms=plumber&geo_location_terms=Austin%2C+TX&page=2"],start="https://www.yellowpages.com/search?search_terms=plumber&geo_location_terms=Austin%2C+TX",
   steps=[[r"yellowpages\.com/[\w-]+-tx/mip/"],
          [r"yellowpages\.com/[\w-]+-tx/mip/", r"yellowpages\.com/[\w-]+-tx/[\w-]+/?$"],
          [r"yellowpages\.com/search\?.*page=2", r"yellowpages\.com/[\w-]+-tx/mip/"]],
   search=("url", "https://www.yellowpages.com/search?search_terms=dentist&geo_location_terms=Austin%2C+TX")),
 "apnews": dict(direct=["https://apnews.com/hub/artificial-intelligence","https://apnews.com/hub/business","https://apnews.com/hub/science"],start="https://apnews.com/hub/technology",
   steps=[[r"apnews\.com/article/"], [r"apnews\.com/article/"], [r"apnews\.com/hub/"]],
   search=("url", "https://apnews.com/search?q=artificial+intelligence")),
 "docsify": dict(start="https://docsify.js.org/#/quickstart",
   steps=[[r"docsify\.js\.org/#/(?!quickstart)[\w-]+"], [r"docsify\.js\.org/#/[\w-]+"], [r"docsify\.js\.org/#/[\w-]+"]],
   search=("type", ".search input, input[type=search]", "plugin")),
 "gmaps": dict(start="https://www.google.com/maps/search/coffee+shops+austin+tx?hl=en",
   steps=[[r"google\.com/maps/place/"], [r"google\.com/maps/place/"], [r"google\.com/maps/"]],
   search=("url", "https://www.google.com/maps/search/bakery+austin+tx?hl=en")),
}

WALL = re.compile(r"(just a moment|attention required|verify (that )?you are (a )?human|are you a human|"
                  r"press (&|and) hold|access denied|access to this page has been denied|unusual traffic|"
                  r"security check|captcha|checking your browser|pardon our interruption|request blocked|"
                  r"help us protect glassdoor|enable javascript and cookies|you have been blocked|"
                  r"sign in to (see|view|continue)|join linkedin|authwall|before you continue to google|"
                  r"robot or human|performing security verification|error 1020|why have i been blocked)", re.I)

LINKS_JS = ("JSON.stringify({u:location.href,t:document.title,n:(document.body&&document.body.innerText||'').length,"
            "tx:(document.body&&document.body.innerText||'').slice(0,4000),"
            "h:[...document.querySelectorAll('h1,h2,h3')].map(e=>e.innerText.trim()).filter(x=>x).slice(0,8),"
            "a:[...document.querySelectorAll('a[href]')].map(a=>[a.href,(a.innerText||a.getAttribute('aria-label')||'').trim().slice(0,90)]).slice(0,1500)})")

def main():
    site, mode = sys.argv[2], sys.argv[3]
    cfg = SITES[site]
    out = os.path.join(D, "raw", "walk"); os.makedirs(out, exist_ok=True)
    log = open(os.path.join(out, f"{site}-{mode}.jsonl"), "w")
    t_all = time.time(); BUDGET = int(os.environ.get("BUDGET", "100"))
    m = MCP(stealth=(mode == "stealth"), stderr_path=os.path.join(out, f"{site}-{mode}.stderr"))
    visited = set()
    state = {"page": None}

    def read(label, how, t0):
        nonlocal m
        time.sleep(3)  # let scripts settle (timers keep running between calls)
        first_wall = None; polls = 0
        while True:
            r = m.tool("browser_evaluate", {"expression": LINKS_JS, "timeoutMs": 8000}, timeout=30)
            if r.get("isError") or "error" in r: break
            pg = json.loads(r["text"])
            wall = WALL.search(pg["t"] + "\n" + pg["tx"][:3000])
            bad = wall or pg["n"] < 300
            if bad and first_wall is None:
                first_wall = (wall.group(0) if wall else f"only {pg['n']} chars")
            if not bad or polls >= 5: break
            polls += 1; time.sleep(3)   # no new request: give a challenge page time to clear itself
        dt = round(time.time() - t0, 1)
        if r.get("isError") or "error" in r:
            rec = dict(step=label, how=how, secs=dt, error=str(r)[:300])
        else:
            state["page"] = pg
            rec = dict(step=label, how=how, secs=dt, url=pg["u"], title=pg["t"][:120], chars=pg["n"],
                       headings=pg["h"][:5], nlinks=len(pg["a"]), wall=(wall.group(0) if wall else None),
                       text_head=re.sub(r"\s+", " ", pg["tx"][:400]), first_wall=first_wall, polls=polls)
            with open(os.path.join(out, f"{site}-{mode}-{label}.txt"), "w") as f:
                f.write(pg["u"] + "\n" + pg["t"] + "\n\n" + pg["tx"])
        rec["t_total"] = round(time.time() - t_all, 1)
        log.write(json.dumps(rec) + "\n"); log.flush()
        print(json.dumps(rec)[:400], flush=True)
        return rec

    def nav(label, url, how="navigate"):
        nonlocal m
        visited.add(url.split("#")[0] if "docsify" not in url else url)
        t0 = time.time()
        try:
            r = m.tool("browser_navigate", {"url": url}, timeout=35)
        except TimeoutError as e:
            rec = dict(step=label, how=how, url=url, secs=round(time.time() - t0, 1), error="navigate timeout 35s")
            log.write(json.dumps(rec) + "\n"); log.flush(); print(json.dumps(rec), flush=True)
            m.p.kill(); m = MCP(stealth=(mode == "stealth"), stderr_path=os.path.join(out, f"{site}-{mode}.stderr"))
            return rec
        if r.get("isError") or "error" in r:
            rec = dict(step=label, how=how, url=url, secs=round(time.time() - t0, 1), error=str(r)[:300])
            log.write(json.dumps(rec) + "\n"); log.flush(); print(json.dumps(rec), flush=True)
            return rec
        return read(label, how, t0)

    def pick(pats):
        pg = state["page"]
        if not pg: return None, None
        cur = urlparse(pg["u"])
        for p in pats:
            for href, txt in pg["a"]:
                if not href.startswith("http"): continue
                key = href if "docsify" in href else href.split("#")[0]
                if key in visited or key == pg["u"].split("#")[0]: continue
                h = urlparse(href)
                if p == "SAMEHOST":
                    ok = h.netloc == cur.netloc and h.path not in ("", "/", cur.path)
                elif p == "EXTERNAL":
                    ok = "google" not in h.netloc and h.netloc != "" and not h.netloc.endswith("gstatic.com")
                else:
                    ok = re.search(p, href) is not None
                if ok: return href, txt
        return None, None

    nav("1-inner", cfg["start"])
    for i, pats in enumerate(cfg["steps"], start=2):
        if time.time() - t_all > BUDGET: break
        time.sleep(4)
        href, txt = pick(pats)
        if not href:
            direct = cfg.get("direct", [])
            if i - 2 < len(direct):
                nav(f"{i}-deeper", direct[i - 2], how="DIRECT URL (no link to follow on the previous page)")
                continue
            rec = dict(step=f"{i}-deeper", error="no matching link on the page", t_total=round(time.time() - t_all, 1))
            log.write(json.dumps(rec) + "\n"); log.flush(); print(json.dumps(rec), flush=True)
            continue
        nav(f"{i}-deeper", href, how=f"follow link '{txt[:50]}'")
    s = cfg.get("search")
    if s and time.time() - t_all < BUDGET:
        time.sleep(4)
        if s[0] == "url":
            nav("5-search", s[1], how="search by URL query")
        else:
            if s[0] == "type_on":
                nav("5a-searchpage", s[1]); sel, words = s[2], s[3]; time.sleep(2)
            else:
                sel, words = s[1], s[2]
            t0 = time.time()
            before = state["page"]["u"] if state["page"] else ""
            r1 = m.tool("browser_fill", {"selector": sel, "value": words}, timeout=20)
            r2 = m.tool("browser_press_key", {"key": "Enter", "selector": sel}, timeout=30) if not r1.get("isError") else {"text": "skipped"}
            time.sleep(3)
            rec = read("5-search", f"typed '{words}' into {sel} + Enter: fill={r1.get('text','')[:80]!r} key={r2.get('text','')[:80]!r} from {before}", t0)
    try:
        ck = m.tool("browser_get_cookies", {}, timeout=15)
        n = ck["text"].count('"name"')
        log.write(json.dumps(dict(step="cookies", count=n)) + "\n")
    except Exception as e:
        pass
    m.close()
    log.write(json.dumps(dict(step="end", t_total=round(time.time() - t_all, 1))) + "\n")
    log.close()

main()
