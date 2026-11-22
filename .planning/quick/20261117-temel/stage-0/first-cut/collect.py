#!/usr/bin/env python3
# Read-only inventory + reference check for the first cut. Writes only into its own folder.
import os, re, subprocess, json, sys, time
R = "/home/dxb/DxB Global OS"
S = os.path.dirname(os.path.abspath(__file__))
def git(*a):
    return subprocess.run(["git","-C",R,*a],capture_output=True,check=True).stdout
tracked = set(p.decode('utf-8','surrogateescape') for p in git("-c","core.quotepath=off","ls-files","-z").split(b"\0") if p)
untr = set(p.decode('utf-8','surrogateescape') for p in git("-c","core.quotepath=off","ls-files","-o","--exclude-standard","-z").split(b"\0") if p)

files = {}
for dp, dns, fns in os.walk(R, followlinks=False):
    rel = os.path.relpath(dp, R)
    if rel == ".": dns[:] = [d for d in dns if d != ".git"]
    for d in list(dns):
        full = os.path.join(dp, d)
        if os.path.islink(full):
            st = os.lstat(full); files[os.path.normpath(os.path.join(rel,d))] = (st.st_size, st.st_blocks*512, st.st_mtime)
    for f in fns:
        full = os.path.join(dp, f)
        try: st = os.lstat(full)
        except FileNotFoundError: continue
        files[os.path.normpath(os.path.join(rel, f))] = (st.st_size, st.st_blocks*512, st.st_mtime)

def stats(prefix):
    a=d=n=t=u=ig=0; mt=0
    pre = prefix.rstrip("/") + "/"
    for p,(sz,dk,m) in files.items():
        if p == prefix or p.startswith(pre):
            a+=sz; d+=dk; n+=1; mt=max(mt,m)
            if p in tracked: t+=1
            elif p in untr: u+=1
            else: ig+=1
    return dict(apparent=a, disk=d, files=n, tracked=t, untracked=u, ignored=ig, mtime=time.strftime("%Y-%m-%d", time.localtime(mt)) if mt else "")

cands = []   # (path, group, core literal, [regex])
def esc(s): return re.escape(s)
def seg(name):
    return r"(?<![\w.\-/])" + esc(name) + r"(?=[/\s`'\")\],:;]|$)"
for n in sorted(os.listdir(R)):
    if n == ".git": continue
    cands.append((n, "top", n, [seg(n), r"['\"]"+esc(n)+r"['\"]"]))
P = ".planning"
for n in sorted(os.listdir(os.path.join(R,P))):
    toks = [esc(f"planning/{n}"), r"['\"]\.planning['\"]\s*,\s*['\"]"+esc(n)+r"['\"]"]
    if n.endswith(".md"): toks.append(r"(?<![\w\-])"+esc(n))
    cands.append((f"{P}/{n}", "planning", n, toks))
for sub in ["quick","research","phases","graphs","study-cards","governance"]:
    base = os.path.join(R,P,sub)
    for n in sorted(os.listdir(base)):
        toks = [esc(f"{sub}/{n}"), r"['\"]"+esc(sub)+r"['\"]\s*,\s*['\"]"+esc(n)+r"['\"]"]
        if sub in ("quick","phases") or (sub=="research" and n.endswith(".md")): toks.append(r"(?<![\w\-])"+esc(n)+r"(?![\w\-])")
        cands.append((f"{P}/{sub}/{n}", sub, n, toks))
for top2 in ["var","references",".archify","docs","tmp",".agents",".codex","graphify-out","docs/ceo-directives/2026-07-reanalysis"]:
    base=os.path.join(R,top2)
    for n in sorted(os.listdir(base)):
        cands.append((f"{top2}/{n}", top2, n, [esc(f"{top2}/{n}"), r"['\"]"+esc(os.path.basename(top2))+r"['\"]\s*,\s*['\"]"+esc(n)+r"['\"]"]))

B = "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"
blines = open(os.path.join(R,B),encoding="utf-8").read().split("\n")
sec5 = next(i for i,l in enumerate(blines) if l.startswith("## Section 5"))
open_ids = subprocess.run(["awk", r"/^## Section 5/{exit} /^\| [A-Z]+[0-9]+[a-z-]* \|/{print $2}", os.path.join(R,B)],capture_output=True,text=True).stdout.split()
rowre = re.compile(r"^\| ([A-Z]+[0-9]+[a-z-]*) \|")

TEXT_EXT = {".md",".txt",".json",".yaml",".yml",".ts",".tsx",".mjs",".js",".cjs",".sh",".py",".sql",".toml",".tsv",".csv",".html",".jsx",".css",""}
SKIPD = {"node_modules","dist",".next",".turbo","coverage"}
def textfiles(root_rel, maxsz=3_000_000):
    out=[]; base=os.path.join(R,root_rel)
    if os.path.isfile(base): return [root_rel]
    for dp,dns,fns in os.walk(base):
        dns[:]=[d for d in dns if d not in SKIPD]
        for f in fns:
            full=os.path.join(dp,f); ext=os.path.splitext(f)[1].lower()
            if ext not in TEXT_EXT or os.path.islink(full): continue
            try:
                if os.path.getsize(full)>maxsz: continue
            except OSError: continue
            out.append(os.path.relpath(full,R))
    return out

sources = []
sources.append(("STATE", ".planning/STATE.md"))
for f in sorted(os.listdir(os.path.join(R,".planning/board-rows"))):
    p=f".planning/board-rows/{f}"
    if os.path.isdir(os.path.join(R,p)):
        for g in textfiles(p): sources.append(("ROWFILE_CLOSED", g))
    elif f[:-3] in open_ids: sources.append(("ROWFILE_OPEN", p))
    else: sources.append(("ROWFILE_CLOSED", p))
sources.append(("TEMEL_PLAN", ".planning/quick/20261117-temel/PLAN.md"))
sources.append(("TEMEL_ORDER", ".planning/quick/20261117-temel/reorder/ORDER.md"))
sources.append(("APPROVALS", "scripts/governance/ceo-approvals.json"))
sources.append(("CLAUDE_MD", ".claude/CLAUDE.md"))
for g in textfiles(".claude/skills"): sources.append(("SKILLS", g))
for f in sorted(os.listdir(os.path.join(R,"HOLDING-OS-MASTER-PLAN"))):
    if f.endswith(".md") and f != os.path.basename(B): sources.append(("SPECS", "HOLDING-OS-MASTER-PLAN/"+f))
for g in textfiles("docs/ceo-directives"): sources.append(("DIRECTIVES", g))
for root in ["tests","scripts","packages","apps","tools","db","vps","supabase","construction",".claude/hooks",".claude/settings.json",".github","package.json","vitest.config.ts",".gitignore",".graphifyignore",".ripgreprc",".mcp.json",".codex","DXB.code-workspace",".vscode","tsconfig.json","tsconfig.tests.json","pnpm-workspace.yaml"]:
    for g in textfiles(root):
        if g == "scripts/governance/ceo-approvals.json": continue
        sources.append(("CODE", g))
for g in textfiles(".planning"):
    if g == ".planning/STATE.md" or g.startswith(".planning/board-rows/") or g in (".planning/quick/20261117-temel/PLAN.md",".planning/quick/20261117-temel/reorder/ORDER.md"): continue
    sources.append(("TEMEL_OTHER" if g.startswith(".planning/quick/20261117-temel/") else "PAPER", g))
for g in ["AGENTS.md","README.md",".claude/CUPBOARD.md","MUSTS from Fable 5 - English.md"]+textfiles("references")+textfiles("docs/kelam")+textfiles("Dış Denetim Raporu")+textfiles(".agents"):
    sources.append(("OTHER_DOC", g))
MEM="/home/dxb/.claude/projects/-home-dxb-DxB-Global-OS/memory"
for f in sorted(os.listdir(MEM)):
    if f.endswith(".md"): sources.append(("MEMORY", "~mem/"+f))

def read(rel):
    p = os.path.join(MEM, rel[6:]) if rel.startswith("~mem/") else os.path.join(R,rel)
    try: return open(p,encoding="utf-8",errors="replace").read().split("\n")
    except Exception: return []

comment_re = re.compile(r"^\s*(//|#|\*|/\*|--|<!--)")
bycore = {}
for c,g,core,toks in cands: bycore.setdefault(core, []).append((c,[re.compile(t) for t in toks]))
pre = re.compile("|".join(esc(k) for k in sorted(bycore, key=len, reverse=True)))
hits = {c: [] for c,_,_,_ in cands}
def scan(cat, rel, lines, boardmode=False):
    for i,l in enumerate(lines):
        found = set(m.group(0) for m in pre.finditer(l))
        if not found: continue
        # overlapping cores: also test every core that is a substring of the line
        for core in list(bycore):
            if core in l: found.add(core)
        for core in found:
            for c,rx in bycore[core]:
                if rel == c or rel.startswith(c.rstrip("/")+"/"): continue
                if any(r.search(l) for r in rx):
                    if boardmode:
                        m = rowre.match(l); rid = m.group(1) if m else "prose"
                        hits[c].append(["BOARD_OPEN" if i < sec5 else "BOARD_CLOSED", rel, i+1, rid])
                    else:
                        extra = ("comment" if comment_re.match(l) else "code") if cat=="CODE" else ""
                        hits[c].append([cat, rel, i+1, extra])
t0=time.time()
for cat, rel in sources: scan(cat, rel, read(rel))
scan("BOARD", B, blines, boardmode=True)
inv = {c: dict(group=g, **stats(c)) for c,g,_,_ in cands}
json.dump(dict(inv=inv, hits=hits, open_ids=open_ids, nsrc=len(sources)+1, sec5_line=sec5+1, nfiles=len(files), ntracked=len(tracked), nuntr=len(untr), sources=sources), open(os.path.join(S,"collect.json"),"w"), ensure_ascii=False)
piles=[]
pile_re = re.compile(r"(\.raw$|\.log$|\.err$|\.out$|DEVIR|HANDOVER|handover|\.png$|\.jpe?g$|\.webp$|\.mp4$|\.webm$|\.mov$|\.wav$|\.mp3$)", re.I)
for p,(sz,dk,m) in files.items():
    if p.startswith(("node_modules/",".planning/")) or "/node_modules/" in p: continue
    if pile_re.search(p): piles.append((p, sz, "tracked" if p in tracked else ("untracked" if p in untr else "ignored")))
json.dump(piles, open(os.path.join(S,"piles.json"),"w"), ensure_ascii=False)
json.dump({p:[v[0],v[1], p in tracked, p in untr] for p,v in files.items() if not p.startswith("node_modules/")}, open(os.path.join(S,"files.json"),"w"), ensure_ascii=False)
print("scan s", round(time.time()-t0,1), "sources", len(sources)+1, "files", len(files), "tracked", len(tracked), "untracked(non-ignored)", len(untr), "candidates", len(cands), "piles", len(piles))
