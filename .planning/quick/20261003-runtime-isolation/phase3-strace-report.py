# Phase 3: which files the company's side (everything but the probe's own node) opened or looked for,
# by place — and the verdict against done-list 32. Usage: <trace dir> <repo> <home> <company home>
import glob, os, re, sys
work, root, home, company = sys.argv[1:5]
OPEN = re.compile(r'^(?:openat\((?:AT_FDCWD|\d+), |open\()"([^"]*)", ([A-Z_|]+)[^)]*\) = (-?\d+)(?: (\w+))?')
EXEC = re.compile(r'^execve\("([^"]*)", \[(.*)\], .*\) = (-?\d+)(?: (\w+))?')
CLONE = re.compile(r"^(?:clone3?|v?fork)\(.*\) = (\d+)$")
PLACES = [(company.rstrip("/") + "/", "<company home>/"),
          (os.path.join(home, ".claude.json"), "~/.claude.json"), (os.path.join(home, ".claude") + "/", "~/.claude/"),
          (os.path.join(home, ".cache") + "/", "~/.cache/"), (os.path.join(home, ".codex") + "/", "~/.codex/"),
          (os.path.join(home, ".config") + "/", "~/.config/"), (os.path.join(home, ".claude-mem") + "/", "~/.claude-mem/"),
          (root + "/.claude/", "<repo>/.claude/"), (root + "/", "<repo>/"), ("/etc/claude-code", "/etc/claude-code")]
def short(p):
    for full, name in PLACES:
        if full.endswith("/"):
            if p.startswith(full) or p == full[:-1]: return name + p[len(full):]
        elif p.startswith(full): return name + p[len(full):]
    return None
files = sorted(glob.glob(os.path.join(work, "trace.*")), key=lambda f: int(f.rsplit(".", 1)[1]))
lines = {f.rsplit(".", 1)[1]: open(f, errors="replace").read().splitlines() for f in files}
parent, own, execs = {}, {}, []
for pid, ls in lines.items():
    for line in ls:
        m = CLONE.match(line)
        if m: parent[m.group(1)] = pid; continue
        m = EXEC.match(line)
        if m and m.group(3) == "0":
            args = re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(2))
            base, first = os.path.basename(m.group(1)), os.path.basename(args[0]) if args else ""
            own[pid] = base if first in ("", base) else f"{base} (as {first})"
            execs.append(f"{own[pid]}  [{' '.join(args[:6])[:160]}]")
def owner(pid, d=0):
    if pid in own: return pid
    p = parent.get(pid); return owner(p, d + 1) if p and d < 64 else None
root_pid = files[0].rsplit(".", 1)[1] if files else None
opened, looked = {}, {}
for pid, ls in lines.items():
    o = owner(pid)
    if o == root_pid: continue  # the probe's own node process
    prog = own.get(o, "?")
    for line in ls:
        m = OPEN.match(line)
        if not m: continue
        path, flags, rc, err = m.groups(); sp = short(path)
        if sp is None: continue
        if int(rc) >= 0:
            mode = "dir" if ("O_DIRECTORY" in flags or os.path.isdir(path)) else "write" if any(f in flags for f in ("O_WRONLY", "O_RDWR", "O_CREAT")) else "read"
            opened.setdefault(sp, set()).add(f"{prog}:{mode}")
        else:
            looked.setdefault(sp, set()).add(f"{prog}:{err or rc}")
print(f"programs executed by the company's side ({len(execs)}):"); [print("  " + e) for e in execs]
for title, d in (("OPENED", opened), ("only LOOKED FOR (open failed)", looked)):
    print(f"{title} ({len(d)}):")
    for p in sorted(d): print(f"  {p}  ({','.join(sorted(d[p]))})")
# The verdict (done-list 32). The residue the CLI carries built in is named, not hidden.
RESIDUE = (re.compile(r"^~/\.claude/ide/?$"), re.compile(r"^~/\.claude/state/unattended-serving-consent\.json$"),
           re.compile(r"^~/\.config/anthropic(/|$)"), re.compile(r"^~/\.config/git/ignore$"))
leaks, residue = [], []
for p, modes in sorted(opened.items()):
    write = any(m.endswith(":write") for m in modes)
    if p.startswith("<repo>/.claude/") or p == "<repo>/.claude/": leaks.append(f"opened {p}")
    elif p.startswith("~/.claude-mem"): leaks.append(f"opened {p}")
    elif p.startswith("~/.codex/"): leaks.append(f"opened {p}")
    elif p == "~/.claude.json" or p.startswith("~/.claude.json"): leaks.append(f"opened {p}")
    elif p.startswith("~/.cache/claude-cli-nodejs") and write: leaks.append(f"wrote {p}")
    elif p.startswith("~/.claude/"):
        (residue if any(r.match(p) for r in RESIDUE) else leaks).append(f"opened {p}")
    elif any(r.match(p) for r in RESIDUE): residue.append(f"opened {p}")
for p in sorted(looked):
    if p.startswith("<repo>/.claude/") or p.startswith("~/.claude/settings") or p.startswith("~/.claude/plugins") or p.startswith("~/.claude/projects") or p.startswith("~/.claude/sessions"):
        leaks.append(f"looked for {p}")
    elif any(r.match(p) for r in RESIDUE): residue.append(f"looked for {p}")
print(f"residue, built into the CLI ({len(residue)}):"); [print("  " + r) for r in residue]
print(f"construction files reached ({len(leaks)}):"); [print("  " + l) for l in leaks]
print("PHASE3_VERDICT=" + ("CLEAN" if not leaks else f"LEAK ({len(leaks)})"))
