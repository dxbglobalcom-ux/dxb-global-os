#!/usr/bin/env python3
"""First cut, weighed (v2). Read-only: computes what stays and what leaves, deletes nothing.
Rule: a job folder in hand or named whole by a living record stays whole; a folder of which living
records name only some files keeps those files; every other job folder leaves. Sizes from lstat."""
import csv, os, re, subprocess, sys, json
ROOT = "/home/dxb/DxB Global OS"
FC = ROOT + "/.planning/quick/20261117-temel/stage-0/first-cut"
Q = ".planning/quick/"
# DOUBT folders the lead keeps whole, with the reason
KEEP_DOUBT = {
 "20261108-kisayol": "code names it (tools/studio-prompts/kisayol)",
 "20261021-uc-seviye": "cited by the foundation's worker evidence",
 "20261023-calisan-sistemi": "cited by the foundation's worker evidence",
 "20261029-web-ofisi-devir": "cited by the foundation's worker evidence",
 "20261028-deneme-sol": "cited by the second trial's ground paper (in hand)",
}
# files code reads inside a folder whose living records name only other files
CODE_READ = {"20260823-construction-company-separation": ["company-write-baseline.json"],
             "20261009-masa-b51": ["evidence"]}
KEEP_NEW = {"20261122-b72-yedek": "work in hand (B72)"}
def git(*a):
    return subprocess.run(["git", "-C", ROOT, *a], capture_output=True, text=True, check=True).stdout
tracked = set(git("ls-files", "-z", "--", ".planning/quick", ".archify", ".playwright-mcp").split("\0"))
rows = list(csv.DictReader(open(FC + "/first-cut.tsv"), delimiter="\t"))
cls = {r["path"]: r for r in rows}
# named sub-paths of partial folders, from FIRST-CUT.md section 6
named = {}
sec = False
for line in open(FC + "/FIRST-CUT.md"):
    if line.startswith("## 6."): sec = True; continue
    if sec and line.startswith("## "): break
    m = re.match(r"\| `([^`]+)` \| [\d,]+ \| (.*?) \| [\d,]+ \| [\d,]+ \|", line) if sec else None
    if m:
        subs = {re.sub(r":\d+(-\d+)?$", "", s.strip()) for s in m.group(2).split(",")}
        named[m.group(1)] = sorted(s for s in subs if s)
def walk(p):
    out = []
    full = os.path.join(ROOT, p)
    if os.path.isfile(full) or os.path.islink(full): return [(p, os.lstat(full).st_size)]
    for d, _, fs in os.walk(full):
        for f in fs:
            fp = os.path.join(d, f)
            out.append((os.path.relpath(fp, ROOT), os.lstat(fp).st_size))
    return out
res = []
folders = sorted(os.listdir(os.path.join(ROOT, Q)))
for name in folders:
    p = Q + name
    r = cls.get(p)
    files = walk(p)
    c = r["class"] if r else "NEW"
    partial = bool(r and "PARTIAL" in r["reason"])
    if name in KEEP_NEW: v, why = "WHOLE", KEEP_NEW[name]
    elif name in KEEP_DOUBT: v, why = "WHOLE", KEEP_DOUBT[name]
    elif c == "STAYS" and partial: v, why = "NAMED", "only: " + ", ".join(named.get(p, ["?"]) + [c + " (code reads it)" for c in CODE_READ.get(name, [])])
    elif c == "STAYS": v, why = "WHOLE", "named whole by a living record or read by code"
    elif c in ("GOES", "DOUBT"): v, why = "GO", ("named by nothing living" if c == "GOES" else "named only by closed rows or other papers")
    else: v, why = "WHOLE", "UNCLASSIFIED — kept"
    keep = set()
    if v == "WHOLE": keep = {f for f, _ in files}
    elif v == "NAMED":
        for s in named.get(p, []) + CODE_READ.get(name, []):
            t = p + "/" + s
            keep |= {f for f, _ in files if f == t or f.startswith(t.rstrip("/") + "/")}
        if not named.get(p): keep = {f for f, _ in files}
    lt = [(f, s) for f, s in files if f not in keep and f in tracked]
    lu = [(f, s) for f, s in files if f not in keep and f not in tracked]
    res.append(dict(folder=name, verdict=v, why=why, files=len(files), bytes=sum(s for _, s in files),
                    keep_files=len(keep), leave_tracked_files=len(lt), leave_tracked_bytes=sum(s for _, s in lt),
                    leave_final_files=len(lu), leave_final_bytes=sum(s for _, s in lu)))
# two piles outside quick/ that are generated working output
for p in (".archify/workflow-b43-sozlesme-sayfasi-20261117-084500", ".archify/workflow-studyo-platformu-20261119-1150", ".playwright-mcp"):
    files = walk(p) if os.path.exists(os.path.join(ROOT, p)) else []
    res.append(dict(folder=p, verdict="GO", why="generated working output", files=len(files), bytes=sum(s for _, s in files),
                    keep_files=0, leave_tracked_files=sum(1 for f, _ in files if f in tracked),
                    leave_tracked_bytes=sum(s for f, s in files if f in tracked),
                    leave_final_files=sum(1 for f, _ in files if f not in tracked),
                    leave_final_bytes=sum(s for f, s in files if f not in tracked)))
json.dump(res, open(sys.argv[1], "w"), indent=1)
MB = 1048576
for v in ("WHOLE", "NAMED", "GO"):
    g = [r for r in res if r["verdict"] == v]
    print(f"{v:6} {len(g):4} folders  on disk {sum(r['bytes'] for r in g)/MB:9.1f} MB  leaves: tracked {sum(r['leave_tracked_bytes'] for r in g)/MB:7.1f} MB ({sum(r['leave_tracked_files'] for r in g)} files)  final {sum(r['leave_final_bytes'] for r in g)/MB:8.1f} MB ({sum(r['leave_final_files'] for r in g)} files)")
print("named-check (kept 0 files in a NAMED folder):", [r["folder"] for r in res if r["verdict"] == "NAMED" and r["keep_files"] == 0])
print("unclassified:", [r["folder"] for r in res if "UNCLASSIFIED" in r["why"]])
