# Phase 3: every path the company's side (everything but the probe's own node) opened, looked for or
# changed, by class — and the verdict against done-list 32/37/38.
# Usage: <trace dir> <repo> <home> <company home> <lanes output>
#
# FAIL-CLOSED (Sol's single pass on phase 3, A3): the first version answered CLEAN over an empty trace
# dir, took relative paths as unknown places, saw only open/openat, and called "construction files
# reached (0)" what was a filtered subset. Now:
#   - no trace, no process beyond the probe's own node, no `claude` run, or lanes output without
#     PROBE_DONE  → NO_MEASUREMENT, never CLEAN;
#   - every path resolves: absolute as it is; relative against its dirfd (strace -y decodes
#     `AT_FDCWD</cwd>` and `N</dir>`) or the process's own last known cwd; otherwise UNRESOLVED,
#     never CLEAN; a successful open is also judged by the real path strace returns (`= N</path>`);
#   - open/openat/creat, chdir/fchdir, mkdir*, unlink*/rmdir, rename*, link*, symlink* — a change is
#     a write;
#   - every path is counted in a class; LEAK on any touch of the construction's Claude/Codex/claude-mem
#     state or the repository's agent config, and on any write into the repository or the real home
#     outside the company home.
# Exit 0 only on CLEAN.
import glob, os, re, sys

if len(sys.argv) != 6:
    print("usage: phase3-strace-report.py <trace dir> <repo> <home> <company home> <lanes output>")
    print("PHASE3_VERDICT=NO_MEASUREMENT (usage)")
    sys.exit(1)
work, root, home, company, lanes_out = (os.path.normpath(a) for a in sys.argv[1:6])

LINE = re.compile(r"^(\w+)\((.*)\)\s+= (-?\d+)(<[^>]*>)?(?: (\w+))?")
CLONE = {"clone", "clone3", "fork", "vfork"}
# syscall → (kind, [(dirfd arg | None, path arg)], flags arg or None)
CALLS = {
    "open": ("open", [(None, 0)], 1), "openat": ("open", [(0, 1)], 2), "creat": ("write", [(None, 0)], None),
    "chdir": ("chdir", [(None, 0)], None), "fchdir": ("fchdir", [], None),
    "mkdir": ("write", [(None, 0)], None), "mkdirat": ("write", [(0, 1)], None),
    "unlink": ("write", [(None, 0)], None), "unlinkat": ("write", [(0, 1)], None), "rmdir": ("write", [(None, 0)], None),
    "rename": ("write", [(None, 0), (None, 1)], None), "renameat": ("write", [(0, 1), (2, 3)], None),
    "renameat2": ("write", [(0, 1), (2, 3)], None),
    "link": ("write", [(None, 0), (None, 1)], None), "linkat": ("write", [(0, 1), (2, 3)], None),
    "symlink": ("write", [(None, 1)], None), "symlinkat": ("write", [(1, 2)], None),
}


def split_args(s):
    """Top-level arguments of a strace call — quotes, <…>, […] and {…} kept whole."""
    out, cur, depth, q, esc = [], "", 0, False, False
    for ch in s:
        if q:
            cur += ch
            if esc: esc = False
            elif ch == "\\": esc = True
            elif ch == '"': q = False
            continue
        if ch == '"': q = True; cur += ch; continue
        if ch in "[{(<": depth += 1
        elif ch in "]})>": depth -= 1
        if ch == "," and depth == 0: out.append(cur.strip()); cur = ""; continue
        cur += ch
    if cur.strip(): out.append(cur.strip())
    return out


def unquote(tok):
    if not (tok.startswith('"') and tok.endswith('"')): return None
    try:
        return tok[1:-1].encode("latin-1", "backslashreplace").decode("unicode_escape").encode("latin-1").decode("utf-8", "replace")
    except Exception:
        return tok[1:-1]


def fd_path(tok):
    m = re.match(r"^(?:AT_FDCWD|\d+)<(.*)>$", tok or "")
    return m.group(1) if m else None


files = [f for f in glob.glob(os.path.join(work, "trace.*")) if f.rsplit(".", 1)[1].isdigit()]
lines = {f.rsplit(".", 1)[1]: open(f, errors="replace").read().splitlines() for f in files}
parent, own, execs = {}, {}, []
for pid, ls in lines.items():
    for line in ls:
        m = LINE.match(line)
        if not m: continue
        name, args, rc = m.group(1), m.group(2), m.group(3)
        if name in CLONE and int(rc) > 0: parent[rc] = pid
        elif name == "execve" and rc == "0":
            a = split_args(args)
            argv = re.findall(r'"((?:[^"\\]|\\.)*)"', a[1]) if len(a) > 1 else []
            prog = unquote(a[0]) or "?"
            base, first = os.path.basename(prog), os.path.basename(argv[0]) if argv else ""
            own[pid] = base if first in ("", base) else f"{base} (as {first})"
            execs.append(f"{own[pid]}  [{' '.join(argv[:6])[:160]}]")


def owner(pid, d=0):
    if pid in own: return pid
    p = parent.get(pid)
    return owner(p, d + 1) if p and d < 64 else None


roots = sorted(p for p in lines if p not in parent)
root_pid = roots[0] if len(roots) == 1 else None
measured = [p for p in lines if p != root_pid]
problems = []
if not files: problems.append("no trace files")
if len(roots) != 1: problems.append(f"{len(roots)} root processes in the trace, not one")
if not measured: problems.append("no process beyond the probe's own node")
if not any(e.startswith("claude ") or e.startswith("claude  ") for e in execs): problems.append("no claude run in the trace")
try:
    if not re.search(r"^PROBE_DONE$", open(lanes_out, errors="replace").read(), re.M): problems.append("the lanes output holds no PROBE_DONE")
except OSError as e:
    problems.append(f"the lanes output cannot be read ({e.strerror})")

# ── every path, resolved ──
events = []  # (prog, kind, mode, path) — mode: read | dir | write | missing
unresolved = []
for pid in measured:
    o = owner(pid)
    if o == root_pid: continue  # threads of the probe's own node
    prog = own.get(o, "?")
    cwd = None
    for line in lines[pid]:
        m = LINE.match(line)
        if not m or m.group(1) not in CALLS: continue
        name, a, rc, ret_fd, err = m.group(1), split_args(m.group(2)), int(m.group(3)), m.group(4), m.group(5)
        kind, slots, flags_at = CALLS[name]
        for tok in a:
            if tok.startswith("AT_FDCWD<"): cwd = fd_path(tok)
        if name == "fchdir":
            if rc == 0 and a and fd_path(a[0]): cwd = fd_path(a[0])
            elif rc == 0: unresolved.append(f"{prog}: fchdir to an undecoded fd ({line[:120]})"); cwd = None
            continue
        for dfd, pat in slots:
            raw = unquote(a[pat]) if pat < len(a) else None
            if raw is None: unresolved.append(f"{prog}: {name} with an unreadable path ({line[:120]})"); continue
            if os.path.isabs(raw): path = os.path.normpath(raw)
            else:
                base = fd_path(a[dfd]) if dfd is not None and dfd < len(a) else None
                if base is None and (dfd is None or (a[dfd].startswith("AT_FDCWD"))): base = cwd
                if base is None: unresolved.append(f"{prog}: {name}(\"{raw}\") with no known base ({line[:120]})"); continue
                path = os.path.normpath(os.path.join(base, raw))
            if kind == "chdir":
                if rc == 0: cwd = path
                continue
            if kind == "open":
                flags = a[flags_at] if flags_at is not None and flags_at < len(a) else ""
                writes = any(f in flags for f in ("O_WRONLY", "O_RDWR", "O_CREAT", "O_TRUNC"))
                mode = "missing" if rc < 0 else "write" if writes else "dir" if "O_DIRECTORY" in flags else "read"
            else:
                mode = "missing" if rc < 0 else "write"
            events.append((prog, name, mode, path))
            real = fd_path(f"0{ret_fd}") if ret_fd else None
            if real and os.path.normpath(real) != path: events.append((prog, name + "→", mode, os.path.normpath(real)))

# ── classes ──
REPO, HOME, CO = root, home, company
REPO_CONFIG = [os.path.join(REPO, n) for n in (".claude", "CLAUDE.md", "CLAUDE.local.md", ".mcp.json", "AGENTS.md", ".agents", ".codex")]
HOME_CONSTRUCTION = [os.path.join(HOME, n) for n in (".claude", ".claude.json", ".claude-mem", ".codex", os.path.join(".cache", "claude-cli-nodejs"), os.path.join(".config", "claude"))]
RESIDUE = [re.compile(r"^~/\.claude/ide/?$"), re.compile(r"^~/\.claude/state/unattended-serving-consent\.json$"),
           re.compile(r"^~/\.config/anthropic(/|$)"), re.compile(r"^~/\.config/git/(ignore|config)$")]
SYSTEM = ("/usr", "/lib", "/lib64", "/etc", "/proc", "/sys", "/dev", "/run", "/opt", "/bin", "/sbin", "/snap", "/var")


def under(p, base): return p == base or p.startswith(base.rstrip("/") + "/")


def short(p):
    if under(p, CO): return "<company home>" + p[len(CO):]
    if under(p, REPO): return "<repo>" + p[len(REPO):]
    if under(p, HOME): return "~" + p[len(HOME):]
    return p


def classify(p):
    if under(p, CO): return "company home"
    if any(under(p, c) for c in REPO_CONFIG): return "repository agent config"
    if under(p, REPO):
        rel = p[len(REPO):]
        if "/node_modules/" in rel + "/": return "repository node_modules"
        if rel.startswith("/packages/") or rel.startswith("/apps/"): return "repository packages"
        return "repository, other"
    if under(p, HOME):
        if any(r.match(short(p)) for r in RESIDUE): return "named residue under the real ~"
        if any(under(p, c) for c in HOME_CONSTRUCTION): return "construction state under the real ~"
        return "real ~, other"
    if under(p, "/tmp") or under(p, os.environ.get("TMPDIR", "/tmp")): return "temp"
    if any(under(p, s) for s in SYSTEM): return "system"
    return "other"


ORDER = ["company home", "repository node_modules", "repository packages", "repository, other", "repository agent config",
         "named residue under the real ~", "construction state under the real ~", "real ~, other", "temp", "system", "other"]
table = {c: {"read": set(), "dir": set(), "write": set(), "missing": set()} for c in ORDER}
leaks = []
for prog, name, mode, p in events:
    c = classify(p)
    table[c][mode].add(short(p))
    if c in ("repository agent config", "construction state under the real ~"):
        leaks.append(f"{c}: {mode} {short(p)} ({prog}, {name})")
    elif mode == "write" and (under(p, REPO) or (under(p, HOME) and not under(p, CO))):
        leaks.append(f"{c}: write {short(p)} ({prog}, {name})")

print(f"programs executed by the company's side ({len(execs)}):"); [print("  " + e) for e in execs]
print("every path the company's side touched, by class (distinct paths: opened · listed · written · looked for, absent):")
for c in ORDER:
    t = table[c]
    print(f"  {c:38} {len(t['read']):5} · {len(t['dir']):4} · {len(t['write']):4} · {len(t['missing']):4}")
for c in ORDER:
    t = table[c]
    if not any(t.values()) or c in ("system",): continue
    print(f"── {c}")
    for mode in ("write", "read", "dir", "missing"):
        for p in sorted(t[mode]): print(f"  {mode:7} {p}")
res = table["named residue under the real ~"]
print(f"named residue under the real ~ (expected 0 with HOME=<company home>): {sum(len(v) for v in res.values())}")
print(f"unresolved paths ({len(unresolved)}):"); [print("  " + u) for u in unresolved[:200]]
print(f"leaks ({len(leaks)}):"); [print("  " + l) for l in sorted(set(leaks))]
if problems:
    print("PHASE3_VERDICT=NO_MEASUREMENT (" + "; ".join(problems) + ")"); sys.exit(1)
if leaks:
    print(f"PHASE3_VERDICT=LEAK ({len(set(leaks))})"); sys.exit(1)
if unresolved:
    print(f"PHASE3_VERDICT=UNRESOLVED ({len(unresolved)})"); sys.exit(1)
print("PHASE3_VERDICT=CLEAN")
