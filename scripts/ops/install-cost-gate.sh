#!/usr/bin/env bash
# Install dxb-cost-gate on this machine — the PreToolUse gate that refuses a
# command whose cost was never measured.
#
# Deliberately NOT part of scripts/systemd/install.sh: that installer enables and
# restarts the resident services, and the services are stopped by CEO order. A
# machine guard must be installable without touching them.
#
# Idempotent. Run it after a fresh machine, a re-image, or a settings reset.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GATE_SRC="${REPO_ROOT}/scripts/ops/dxb-cost-gate.py"
HOOK_DIR="${HOME}/.claude/hooks"
GATE_DST="${HOOK_DIR}/dxb-cost-gate.py"
SETTINGS="${HOME}/.claude/settings.json"

[ -f "$GATE_SRC" ] || { echo "missing: $GATE_SRC" >&2; exit 1; }

mkdir -p "$HOOK_DIR"
cp "$GATE_SRC" "$GATE_DST"
chmod +x "$GATE_DST"
echo "installed: $GATE_DST"

[ -f "$SETTINGS" ] || { echo "no $SETTINGS — register the hook by hand" >&2; exit 1; }

python3 - "$SETTINGS" "$GATE_DST" <<'PY'
import collections, json, sys

settings, gate = sys.argv[1], sys.argv[2]
cmd = "python3 %s" % gate
with open(settings) as f:
    d = json.load(f, object_pairs_hook=collections.OrderedDict)

pre = d.setdefault("hooks", collections.OrderedDict()).setdefault("PreToolUse", [])
if any("dxb-cost-gate" in h.get("command", "") for b in pre for h in b.get("hooks", [])):
    print("already registered")
else:
    pre.append(collections.OrderedDict([
        ("matcher", "Grep|Bash"),
        ("hooks", [collections.OrderedDict([("type", "command"), ("command", cmd)])]),
    ]))
    with open(settings, "w") as f:
        json.dump(d, f, indent=2)
        f.write("\n")
    print("registered in", settings)
PY

echo "--- proof ---"
python3 "${REPO_ROOT}/scripts/ops/test-cost-gate.py"
