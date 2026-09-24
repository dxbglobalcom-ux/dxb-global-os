#!/usr/bin/env bash
# THE RESEARCH-ENGINE RULER at the shell — the same metre the vitest case runs.
#
# This file is a RUNNER, not a second ruler: every rule, every threshold and every message comes
# from tests/b46/research-ruler.ts, which node executes directly (type stripping, node >= 22.18).
# The CEO's ruling of 2026-09-15 is why it exists — an audit's metre is a runnable script, handed
# to the builder BEFORE the work, and builder and checker run the same script.
#
# TWO RULES LIVE HERE, AFTER THE .ts TABLE, AND THIS SAYS WHY (2026-09-24). They were ordered in a
# pass that could not touch tests/, so they print their rows in the .ts table's own format and are
# counted into its total line — the exit code, the table and --verdicts stay ONE metre:
#   no-bridge-browser-call  no executable `opencli browser` line in the skill's scripts/*.sh,
#                           scripts/*.py and fleet/*.sh. That command drives the Bridge inside his
#                           own Chrome: the windows he complained about on 2026-09-24.
#   cite-check-selftest     `python3 <skill>/scripts/cite-check.py --selftest` passes — the citation
#                           ruler's regression probes (the refuter's round-1 phrases), run, not read.
#
# Usage:
#   scripts/research-ruler.sh              # the table
#   scripts/research-ruler.sh --verdicts   # the table, plus one RULER-VERDICT line per rule
# Exit: 0 when every rule passes, 1 on any failure.
set -uo pipefail
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL_DIR="$REPO_DIR/.claude/skills/dxb-research"
TS_OUT="$(node --no-warnings "$REPO_DIR/tests/b46/research-ruler.ts" "$@" 2>&1)"
TS_RC=$?

# no-bridge-browser-call: every line that names the command and is not a comment
R1="$(grep -nH -- 'opencli browser' "$SKILL_DIR"/scripts/*.sh "$SKILL_DIR"/scripts/*.py \
        "$SKILL_DIR"/fleet/*.sh 2>/dev/null | grep -vE '^[^:]+:[0-9]+:[[:space:]]*#' || true)"
# cite-check-selftest: the probes are fired, and their exit code is the verdict
if [ -f "$SKILL_DIR/scripts/cite-check.py" ]; then
  R2="$(python3 "$SKILL_DIR/scripts/cite-check.py" --selftest 2>&1)"; R2_RC=$?
else
  R2="scripts/cite-check.py is missing"; R2_RC=1
fi

VERDICTS=0; for a in "$@"; do [ "$a" = "--verdicts" ] && VERDICTS=1; done
TS_OUT="$TS_OUT" TS_RC="$TS_RC" R1="$R1" R2="$R2" R2_RC="$R2_RC" REPO_DIR="$REPO_DIR" \
VERDICTS="$VERDICTS" python3 - <<'PYEOF'
import os, re, sys
env = os.environ
lines = env["TS_OUT"].splitlines()
repo = env["REPO_DIR"] + "/"
f1 = [l.replace(repo, "") for l in env["R1"].splitlines() if l.strip()]
f2 = [] if env["R2_RC"] == "0" else [
    (env["R2"].strip().splitlines() or [f"--selftest left with exit {env['R2_RC']}"])[-1][:140]]
ours = [("no-bridge-browser-call", f1, "an executable line calls it: "),
        ("cite-check-selftest", f2, "")]
ROW = re.compile(r"^[a-z0-9-]+\s+\d+\s+(PASS|FAIL)$")
SUM = re.compile(r"^RULER: (\d+)/(\d+) rules PASS · (\d+) failures$")
last_row = max((i for i, l in enumerate(lines) if ROW.match(l)), default=None)
summ = next((i for i, l in enumerate(lines) if SUM.match(l)), None)
if last_row is None or summ is None:
    # the .ts ruler did not print its table: say so, never print a green line over it
    print("\n".join(lines))
    print("RULER: the .ts ruler did not run — no verdict")
    sys.exit(1)
rows = [f"{name.ljust(26)}{str(len(f)).rjust(10)}   {'PASS' if not f else 'FAIL'}" for name, f, _ in ours]
details = [f"   {name} · {x}" for name, f, _ in ours for x in f]
p, t, n = map(int, SUM.match(lines[summ]).groups())
p += sum(1 for _, f, _ in ours if not f)
t += len(ours)
n += sum(len(f) for _, f, _ in ours)
body = lines[:last_row + 1] + rows + lines[last_row + 1:summ - 1] + details + [lines[summ - 1]]
body.append(f"RULER: {p}/{t} rules PASS · {n} failures")
body += lines[summ + 1:]
if env["VERDICTS"] == "1":
    body += [f"RULER-VERDICT\t{name}\t{'PASS' if not f else 'FAIL'}" for name, f, _ in ours]
print("\n".join(body))
sys.exit(0 if env["TS_RC"] == "0" and n == 0 else 1)
PYEOF
