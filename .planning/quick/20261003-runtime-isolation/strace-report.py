# The report of strace-probe.sh: from one trace file per process, every file each PROGRAM opened (or
# only looked for) under ~/.claude, ~/.claude.json*, the repository's .claude/ and ~/.codex, and every
# program executed; then the verdicts done-list item 21 asks for. A process is the program it last
# executed, or — a thread or a fork that never executed — the program of the process that cloned it.
# The probe's own process (the first one, `node <probe>`) reads the construction on purpose — to set
# the company's names against it — so the verdicts are about every OTHER process: the company's CLI
# and whatever it started.
# Each opened path carries how: `dir` (a directory listing), `read` (a file read), `write`.
# Usage: python3 strace-report.py <work dir> <repo root> <home>
import glob
import os
import re
import sys

work, root, home = sys.argv[1:4]
OPEN = re.compile(r'^(?:openat\((?:AT_FDCWD|\d+), |open\()"([^"]*)", ([A-Z_|]+)[^)]*\) = (-?\d+)(?: (\w+))?')
EXEC = re.compile(r'^execve\("([^"]*)", \[(.*)\], .*\) = (-?\d+)(?: (\w+))?')
CLONE = re.compile(r"^(?:clone3?|v?fork)\(.*\) = (\d+)$")
PLACES = [
    (os.path.join(home, ".claude.json"), "~/.claude.json"),
    (os.path.join(home, ".claude") + "/", "~/.claude/"),
    (os.path.join(root, ".claude") + "/", "<repo>/.claude/"),
    (os.path.join(home, ".codex") + "/", "~/.codex/"),
]
FORBIDDEN = re.compile(r"(CLAUDE\.md|/settings[^/]*\.json|/skills(/|$)|/plugins(/|$)|/agents(/|$)|/hooks(/|$)|/memory(/|$)|/projects(/|$))")


def short(p):
    for full, name in PLACES:
        if full.endswith("/"):
            if p.startswith(full) or p == full[:-1]:
                return name + p[len(full):]
        elif p.startswith(full):
            return name + p[len(full):]
    return None


def label(prog, args):
    base = os.path.basename(prog)
    first = os.path.basename(args[0]) if args else base
    # the SDK's bundled native `claude` also serves as `rg` when started under that name
    return f"{base} (as {first})" if first != base else base


for lane in ("chat", "gate"):
    print(f"══ {lane} — the run's own output, whole")
    print(open(os.path.join(work, f"{lane}.out")).read().rstrip())
    files = sorted(glob.glob(os.path.join(work, f"{lane}.trace.*")), key=lambda f: int(f.rsplit(".", 1)[1]))
    lines = {f.rsplit(".", 1)[1]: open(f, errors="replace").read().splitlines() for f in files}
    parent, own, execs, failed_exec = {}, {}, [], 0
    for pid, ls in lines.items():
        for line in ls:
            m = CLONE.match(line)
            if m:
                parent[m.group(1)] = pid
                continue
            m = EXEC.match(line)
            if m:
                prog, argv, rc, _err = m.groups()
                if rc != "0":
                    failed_exec += 1
                    continue
                args = re.findall(r'"((?:[^"\\]|\\.)*)"', argv)
                own[pid] = label(prog, args)
                execs.append(f"pid {pid} (parent {parent.get(pid, '?')}): {prog}  [{' '.join(args[:4])[:200]}]")
    # a clone line lives in the parent's file, which may sort after the child's: resolve owners afterwards
    def owner(pid, depth=0):
        """The process whose program this one runs: itself if it executed one, else its cloner's owner."""
        if pid in own:
            return pid
        p = parent.get(pid)
        return owner(p, depth + 1) if p and depth < 64 else None

    root_pid = files[0].rsplit(".", 1)[1] if files else None
    by_prog = {}
    for pid, ls in lines.items():
        o = owner(pid)
        key = f"{own.get(o, '?')}{' — the probe itself' if o == root_pid else ''}"
        for line in ls:
            m = OPEN.match(line)
            if not m:
                continue
            path, flags, rc, err = m.groups()
            sp = short(path)
            if sp is None:
                continue
            slot = by_prog.setdefault(key, ({}, {}))
            if int(rc) >= 0:
                # a directory opened without O_DIRECTORY is still a listing: asked of the disk at report time
                listing = "O_DIRECTORY" in flags or os.path.isdir(path)
                mode = "dir" if listing else "write" if any(f in flags for f in ("O_WRONLY", "O_RDWR", "O_CREAT")) else "read"
                slot[0].setdefault(sp, set()).add(mode)
            else:
                slot[1].setdefault(sp, set()).add(err or rc)
    print(f"── {lane}: {len(files)} processes and threads traced")
    print(f"── {lane}: programs executed ({len(execs)}; {failed_exec} failed PATH lookups left out)")
    for e in execs:
        print(f"  {e}")
    company_opened = {}
    for key in sorted(by_prog):
        opened, looked = by_prog[key]
        print(f"── {lane}: {key} — OPENED under ~/.claude, ~/.claude.json, <repo>/.claude/, ~/.codex ({len(opened)})")
        for p in sorted(opened):
            print(f"  {p}  ({','.join(sorted(opened[p]))})")
        print(f"── {lane}: {key} — only LOOKED FOR there, the open failed ({len(looked)})")
        for p in sorted(looked):
            print(f"  {p}  ({','.join(sorted(looked[p]))})")
        if "the probe itself" not in key:
            for p in list(opened) + [f"{q} (looked for)" for q in looked]:
                company_opened.setdefault(p, set()).add(key)
    modes = {}
    for key in by_prog:
        if "the probe itself" in key:
            continue
        for p, m in by_prog[key][0].items():
            modes.setdefault(p, set()).update(m)
    bad = sorted(p for p in company_opened if FORBIDDEN.search(p.replace(" (looked for)", "")) and not p.startswith("~/.codex/") and "(looked for)" not in p)
    bad_read = sorted(p for p in bad if modes.get(p, set()) - {"dir"})
    codex = sorted(p for p in company_opened if p.startswith("~/.codex/"))
    claude_home = sorted(p for p in company_opened if p.startswith("~/.claude") and "(looked for)" not in p)
    print(f"VERDICT {lane}: construction paths OPENED by the company's processes (CLAUDE.md, settings*.json, skills/, plugins/, agents/, hooks/, memory/, projects/) — {len(bad)}, of which {len(bad) - len(bad_read)} only as a directory listing")
    print(f"VERDICT {lane}: of those, opened to READ or WRITE a file (not a listing) — {len(bad_read)}: {bad_read}")
    files_only = sorted(f"{p} ({','.join(sorted(m))})" for p, m in modes.items() if m - {"dir"})
    print(f"VERDICT {lane}: every FILE (not a listing) the company's processes opened in those places — {len(files_only)}:")
    for f in files_only:
        print(f"  {f}")
    print(f"VERDICT {lane}: anything under ~/.codex opened or looked for by the company's processes — {codex or 'none'}")
    print(f"VERDICT {lane}: everything the company's processes opened under ~/.claude and ~/.claude.json — {len(claude_home)} paths")
    print()
print("STRACE_PROBE_DONE")
