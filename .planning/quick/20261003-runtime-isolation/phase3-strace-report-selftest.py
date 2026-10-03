# The strace gate tried on fabricated traces (done-list 37; Sol's single pass on phase 3, A3: the first
# report answered CLEAN over an empty trace dir and passed a relative `.claude/settings.json` and a
# write into the repository). Each case is a trace dir in strace -ff -y shape; the gate must answer
# CLEAN only where nothing was touched. Usage: python3 phase3-strace-report-selftest.py <report.py>
import os, subprocess, sys, tempfile

REPORT = sys.argv[1]
REPO, HOME = "/fx/repo", "/fx/home"
CO = HOME + "/.local/share/dxb/company-claude"
ROOT = ['execve("/usr/bin/node", ["node", "lanes-probe.mjs"], 0x1 /* 9 vars */) = 0',
        'clone3({flags=CLONE_VM, child_tid=0x1}, 88) = 200']
CLAUDE = ['execve("/fx/repo/node_modules/.pnpm/x/claude", ["/fx/repo/node_modules/.pnpm/x/claude", "--output-format"], 0x1 /* 9 vars */) = 0',
          f'openat(AT_FDCWD<{CO}/work>, "{CO}/.claude.json", O_RDONLY|O_CLOEXEC) = 3<{CO}/.claude.json>']
DONE = "PROBE_DONE\n"
CASES = [
    # name, {pid: lines} (None = no trace files at all), lanes output, expected verdict prefix
    ("an empty trace dir", None, DONE, "NO_MEASUREMENT"),
    ("only the probe's own node", {"100": ROOT[:1]}, DONE, "NO_MEASUREMENT"),
    ("a clean run", {"100": ROOT, "200": CLAUDE}, DONE, "CLEAN"),
    ("a clean run whose lanes never finished", {"100": ROOT, "200": CLAUDE}, "LANES_EXIT=1\n", "NO_MEASUREMENT"),
    ("a relative .claude/settings.json from cwd=<repo>",
     {"100": ROOT, "200": CLAUDE + [f'openat(AT_FDCWD<{REPO}>, ".claude/settings.json", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)']}, DONE, "LEAK"),
    ("a write into the repository",
     {"100": ROOT, "200": CLAUDE + [f'openat(AT_FDCWD<{CO}/work>, "{REPO}/notes.txt", O_WRONLY|O_CREAT|O_TRUNC, 0644) = 4<{REPO}/notes.txt>']}, DONE, "LEAK"),
    ("a rename into ~/.claude",
     {"100": ROOT, "200": CLAUDE + [f'renameat2(AT_FDCWD<{CO}/work>, "{CO}/a.tmp", AT_FDCWD<{CO}/work>, "{HOME}/.claude/sessions/9.json", RENAME_NOREPLACE) = 0']}, DONE, "LEAK"),
    ("a relative mkdir after chdir into the repository",
     {"100": ROOT, "200": CLAUDE + [f'chdir("{REPO}") = 0', 'mkdir("scratch", 0775) = 0']}, DONE, "LEAK"),
    ("a company path that is a link into the repository's .claude",
     {"100": ROOT, "200": CLAUDE + [f'openat(AT_FDCWD<{CO}/work>, "{CO}/linked/settings.json", O_RDONLY) = 5<{REPO}/.claude/settings.json>']}, DONE, "LEAK"),
    ("a relative open whose base is unknown",
     {"100": ROOT, "200": [CLAUDE[0], 'open("settings.json", O_RDONLY) = 3']}, DONE, "UNRESOLVED"),
    ("the construction's ~/.claude.json read",
     {"100": ROOT, "200": CLAUDE + [f'openat(AT_FDCWD<{CO}/work>, "{HOME}/.claude.json", O_RDONLY) = 6<{HOME}/.claude.json>']}, DONE, "LEAK"),
    ("a named residue read stays CLEAN and is counted",
     {"100": ROOT, "200": CLAUDE + [f'openat(AT_FDCWD<{CO}/work>, "{HOME}/.claude/ide", O_RDONLY|O_DIRECTORY) = 7<{HOME}/.claude/ide>']}, DONE, "CLEAN"),
]

failed = 0
for name, traces, lanes, want in CASES:
    with tempfile.TemporaryDirectory() as d:
        for pid, ls in (traces or {}).items():
            open(os.path.join(d, f"trace.{pid}"), "w").write("\n".join(ls) + "\n")
        lo = os.path.join(d, "lanes.out")
        open(lo, "w").write(lanes)
        r = subprocess.run([sys.executable, REPORT, d, REPO, HOME, CO, lo], capture_output=True, text=True)
        verdict = next((l.split("=", 1)[1] for l in r.stdout.splitlines() if l.startswith("PHASE3_VERDICT=")), "(none)")
        ok = verdict.startswith(want) and ((r.returncode == 0) == (want == "CLEAN"))
        failed += not ok
        print(f"{'ok  ' if ok else 'FAIL'} {name}: verdict={verdict} exit={r.returncode} (want {want})")
print(f"SELFTEST {'GREEN' if not failed else 'RED'}: {len(CASES) - failed}/{len(CASES)}")
sys.exit(1 if failed else 0)
