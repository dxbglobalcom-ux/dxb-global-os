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
# The context gate and the status line live beside it; the repository holds their source too
# (Fable's review, 2026-10-06: they had no tracked copy). Their registration in settings.json is
# not this script's; only the files are put in place.
for twin in dxb-context-gate.py dxb-statusline.js; do
  cp "${REPO_ROOT}/scripts/ops/${twin}" "${HOOK_DIR}/${twin}"
  echo "installed: ${HOOK_DIR}/${twin}"
done

[ -f "$SETTINGS" ] || { echo "no $SETTINGS — register the hook by hand" >&2; exit 1; }

python3 - "$SETTINGS" "$GATE_DST" <<'PY'
import collections, json, sys

settings, gate = sys.argv[1], sys.argv[2]
cmd = "python3 %s" % gate
matcher = "Grep|Bash|Read|SendMessage"
with open(settings) as f:
    d = json.load(f, object_pairs_hook=collections.OrderedDict)

pre = d.setdefault("hooks", collections.OrderedDict()).setdefault("PreToolUse", [])
entries = [b for b in pre if any("dxb-cost-gate" in h.get("command", "") for h in b.get("hooks", []))]
# a machine installed earlier keeps the matcher it was given then: bring it to the current one
stale = [b for b in entries if b.get("matcher") != matcher]
for b in stale:
    b["matcher"] = matcher
if not entries:
    pre.append(collections.OrderedDict([
        ("matcher", matcher),
        ("hooks", [collections.OrderedDict([("type", "command"), ("command", cmd)])]),
    ]))
if stale or not entries:
    with open(settings, "w") as f:
        json.dump(d, f, indent=2)
        f.write("\n")
print("matcher updated to %s in %s" % (matcher, settings) if stale else
      "registered in %s" % settings if not entries else "already registered")
PY

echo "--- proof ---"
python3 "${REPO_ROOT}/scripts/ops/test-cost-gate.py"
