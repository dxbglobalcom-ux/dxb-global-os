#!/usr/bin/env bash
# THE SESSION-OPENING RULER — what a session costs before a word of work is done.
#
# WHY IT EXISTS. The CEO asked on 2026-09-22, seeing 69k on his own screen: "normalde %0 ile
# başlaması gerekmiyor mu". The measured answer (var/measure/context-budget-2026-09-22.md) is
# that ~40k of a 63.5k opening belongs to Claude Code, the model and interactive mode and
# cannot be touched from here, while ~17k is OURS. Of that, MEMORY.md alone was 5,334 tokens:
# 96 entries carried as full text on every single session, growing every day. The doors and
# the deferred tool list obey progressive disclosure (a tool costs 9 tokens as a name and 563
# as a schema); the memory index did not. THE GUARD THIS RULER PROVIDES is the MEMORY.md
# threshold — that one number is what stops the index regrowing silently.
#
# WHAT IT MEASURES, and what it refuses to measure.
#   1. THE TRUTH OF AN OPENING: the first assistant record carrying a REAL `usage` in a
#      session's own transcript. input + cache_creation + cache_read IS the opening cost — it
#      is what the API was actually sent, not an estimate of it. Records with a zero total or
#      a `<synthetic>` model are NOT openings and are skipped; if a transcript holds nothing
#      else, the ruler refuses to print a number (exit 2) instead of reporting a free session.
#   2. THE GATED BASKET — the four things this project and this user put in front of every
#      session that a terminal can count exactly: MEMORY.md, the project CLAUDE.md, the global
#      CLAUDE.md, and the SessionStart hooks' own output. This is NOT the whole of "our layer":
#      the chrome bridge (1,660), the MCP tool names (1,476) and the claude-mem session context
#      (533) exist only inside a live session and are measured in
#      var/measure/context-budget-2026-09-22.md, not here. The second block below counts the
#      remaining ON-DISK items for the picture; they are printed but never gated, and the
#      output says so rather than letting two different "our layer" numbers circulate.
#   3. THE SESSION-START HOOKS by RUNNING every one of them (both settings files), never by
#      guessing their size — a hook is a program whose output changes with the board. A hook
#      that will not run standalone prints UNVERIFIED and the verdict refuses to be green.
#
# ACCURACY, claimed exactly and no wider. The opening totals are NOT estimates. The file counts
# use tiktoken cl100k_base, which is NOT Claude's tokenizer: on 2026-09-22 that encoder
# estimated one measured basket at 12,125 against a real API-measured 12,447 (2.6% low). That
# calibration was taken on the project layer, NOT on this ruler's basket — it is the order of
# the instrument's error, not a warranty on these four lines.
#
# NO NETWORK, ENFORCED RATHER THAN HOPED FOR. tiktoken fetches its encoding when its cache is
# cold; pinning the cache to var/measure/.tiktoken-cache moves the download, it does not stop
# it (proved by this ruler's own refuter, round 2). So the cache is CHECKED before tiktoken is
# asked for anything: a cold cache exits 2 and says how to warm it, and only an explicit
# STARTUP_BUDGET_WARM_CACHE=1 lets a run reach the internet — never a measurement run.
#
# Usage:  scripts/measure/startup-budget.sh [session-id-or-prefix] [--json]
#         An ambiguous prefix is an error, not a guess: it lists the candidates and exits 2.
# Exit :  0 GREEN · 1 RED (a threshold is broken) · 2 the measurement itself could not be taken.
#
# Ruled by the chief-engineer session (Fable 5.1, dxb-global-os-99) in the plan the CEO approved
# by click at 2026-09-22 12:00 (soft-singing-sutton.md, P0); written by the Opus 5 construction
# session that holds the pen; rebuilt the same hour on its refuter's REJECT (8 findings).
set -uo pipefail

# ---- THE THRESHOLDS (the only numbers to change when he moves the gate) ---------------------
MEMORY_MAX_TOKENS=1500      # MEMORY.md is an INDEX: one line per memory, detail in the files.
BASKET_MAX_TOKENS=12000     # the four countable files above, summed.
# ---------------------------------------------------------------------------------------------

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROJECT_SLUG="-home-dxb-DxB-Global-OS"
TRANSCRIPT_DIR="$HOME/.claude/projects/$PROJECT_SLUG"
MEMORY_FILE="$TRANSCRIPT_DIR/memory/MEMORY.md"
CACHE_DIR="$REPO/var/measure/.tiktoken-cache"

WANT_JSON=0
SESSION_ARG=""
POSITIONALS=0
for arg in "$@"; do
  case "$arg" in
    --json) WANT_JSON=1 ;;
    -h|--help) sed -n '2,48p' "${BASH_SOURCE[0]}"; exit 0 ;;
    -*) echo "unknown flag: $arg (see --help)" >&2; exit 2 ;;
    *) SESSION_ARG="$arg"; POSITIONALS=$((POSITIONALS + 1)) ;;
  esac
done
if [[ $POSITIONALS -gt 1 ]]; then
  echo "⚠ CANNOT MEASURE — one session id at a time; $POSITIONALS were given." >&2
  exit 2
fi

# The encoding cache is pinned so a measurement never depends on the network.
command -v python3 >/dev/null 2>&1 || {
  echo "⚠ CANNOT MEASURE — python3 is not on PATH; this ruler is arithmetic, it does not guess." >&2
  exit 2
}
mkdir -p "$CACHE_DIR"
export TIKTOKEN_CACHE_DIR="$CACHE_DIR"
if [[ -z "$(ls -A "$CACHE_DIR" 2>/dev/null)" && "${STARTUP_BUDGET_WARM_CACHE:-0}" != "1" ]]; then
  echo "⚠ CANNOT MEASURE — the tiktoken encoding cache at $CACHE_DIR is empty, and a measurement" >&2
  echo "  run is not allowed to reach the internet. Warm it once:" >&2
  echo "  STARTUP_BUDGET_WARM_CACHE=1 ${BASH_SOURCE[0]} --json >/dev/null" >&2
  exit 2
fi

# Every SessionStart command hook, from both settings files, RUN — not guessed.
HOOKS_FILE="$(mktemp)"
python3 - "$REPO" >"$HOOKS_FILE" <<'PY'
import json, sys, pathlib
repo = pathlib.Path(sys.argv[1])
for name in ("settings.json", "settings.local.json"):
    p = repo / ".claude" / name
    if not p.exists():
        continue
    try:
        groups = json.loads(p.read_text()).get("hooks", {}).get("SessionStart", [])
    except Exception:
        continue
    for group in groups:
        for h in group.get("hooks", []):
            if h.get("type") == "command" and h.get("command"):
                print(f"{name}\t{h['command']}")
PY

HOOK_RESULTS="$(mktemp)"
while IFS=$'\t' read -r origin cmd; do
  [[ -z "${cmd:-}" ]] && continue
  out="$(mktemp)"
  if CLAUDE_PROJECT_DIR="$REPO" bash -c "$cmd" >"$out" 2>/dev/null; then
    printf '%s\tmeasured\t%s\n' "$origin" "$out" >>"$HOOK_RESULTS"   # an empty output is 0 tokens, not a hole
  else
    printf '%s\tunverified\t%s\n' "$origin" "$out" >>"$HOOK_RESULTS"
  fi
done <"$HOOKS_FILE"

MEMORY_MAX_TOKENS="$MEMORY_MAX_TOKENS" BASKET_MAX_TOKENS="$BASKET_MAX_TOKENS" \
TRANSCRIPT_DIR="$TRANSCRIPT_DIR" MEMORY_FILE="$MEMORY_FILE" REPO="$REPO" \
HOOK_RESULTS="$HOOK_RESULTS" SESSION_ARG="$SESSION_ARG" WANT_JSON="$WANT_JSON" python3 <<'PY'
import glob, json, os, sys, pathlib

MEM_MAX    = int(os.environ["MEMORY_MAX_TOKENS"])
BASKET_MAX = int(os.environ["BASKET_MAX_TOKENS"])
want_json  = os.environ["WANT_JSON"] == "1"

def die(msg):
    print(f"⚠ CANNOT MEASURE — {msg}", file=sys.stderr)
    sys.exit(2)

try:
    import tiktoken
    enc = tiktoken.get_encoding("cl100k_base")
except Exception as e:
    die(f"the tiktoken cl100k_base encoding is not available offline ({e}). "
        f"Warm var/measure/.tiktoken-cache once, or install tiktoken; nothing here is guessed.")

def toks(text):  return len(enc.encode(text))
def file_tokens(path):
    try:
        return toks(pathlib.Path(path).read_text(encoding="utf-8", errors="replace"))
    except Exception:
        return None

# ---- 1. THE OPENING AS THE API SAW IT --------------------------------------------------------
tdir  = os.environ["TRANSCRIPT_DIR"]
arg   = os.environ["SESSION_ARG"].strip()
files = sorted(glob.glob(os.path.join(tdir, "*.jsonl")), key=os.path.getmtime, reverse=True)
if arg:
    matches = [f for f in files if os.path.basename(f).startswith(arg)]
    if not matches:
        die(f"no transcript in {tdir} starts with '{arg}'")
    if len(matches) > 1:
        names = ", ".join(os.path.basename(f)[:12] for f in matches[:6])
        die(f"'{arg}' matches {len(matches)} transcripts ({names}{'…' if len(matches) > 6 else ''}) "
            f"— name one, an ambiguous prefix is never guessed")
    files = matches
elif not files:
    die(f"no transcript found in {tdir}")

transcript = files[0]
opening, skipped = None, 0
with open(transcript, encoding="utf-8", errors="replace") as fh:
    for line in fh:
        try:
            rec = json.loads(line)
        except Exception:
            continue
        msg   = rec.get("message") or {}
        usage = msg.get("usage")
        if not usage:
            continue
        model = msg.get("model") or "unknown"
        total = (usage.get("input_tokens", 0) + usage.get("cache_creation_input_tokens", 0)
                 + usage.get("cache_read_input_tokens", 0))
        if total <= 0 or model.startswith("<"):        # a replayed/synthetic record is not an opening
            skipped += 1
            continue
        opening = {"model": model,
                   "input": usage.get("input_tokens", 0),
                   "cache_creation": usage.get("cache_creation_input_tokens", 0),
                   "cache_read": usage.get("cache_read_input_tokens", 0),
                   "total": total,
                   "skipped_synthetic_records": skipped}
        break
if opening is None:
    die(f"{os.path.basename(transcript)} carries no assistant record with a real usage "
        f"({skipped} synthetic or zero-token record(s) were skipped, and a zero opening is "
        f"never reported as a measurement)")

# ---- 2. THE GATED BASKET ---------------------------------------------------------------------
repo = os.environ["REPO"]
basket, holes = [], []

mem_tokens = file_tokens(os.environ["MEMORY_FILE"])
if mem_tokens is None:
    die(f"MEMORY.md could not be read at {os.environ['MEMORY_FILE']} — that is a hole in the "
        f"measurement, not a passing or failing threshold")
basket.append(("MEMORY.md (the memory index)", mem_tokens, ""))

for label, path in (("project .claude/CLAUDE.md", os.path.join(repo, ".claude/CLAUDE.md")),
                    ("global ~/.claude/CLAUDE.md", os.path.expanduser("~/.claude/CLAUDE.md"))):
    t = file_tokens(path)
    if t is None:
        holes.append(label)
        basket.append((label, None, "⚠ UNVERIFIED — unreadable"))
    else:
        basket.append((label, t, ""))

hook_rows = []
with open(os.environ["HOOK_RESULTS"], encoding="utf-8") as fh:
    for raw in fh:
        parts = raw.rstrip("\n").split("\t")
        if len(parts) != 3:
            continue
        origin, status, out_path = parts
        if status == "measured":
            hook_rows.append((f"SessionStart hook ({origin}, run)", file_tokens(out_path), ""))
        else:
            hook_rows.append((f"SessionStart hook ({origin})", None,
                              "⚠ UNVERIFIED — would not run standalone"))
if not hook_rows:
    hook_rows.append(("SessionStart hooks", 0, "none configured"))
for label, t, note in hook_rows:
    if t is None:
        holes.append(label)
    basket.append((label, t, note))

basket_total = sum(t for _, t, _ in basket if t is not None)

# ---- 2b. THE REST OF OUR LAYER THAT DISK CAN SHOW — printed, never gated ---------------------
def dir_description_tokens(pattern):
    import re
    total, count = 0, 0
    for f in sorted(glob.glob(pattern, recursive=True)):
        try:
            head = pathlib.Path(f).read_text(encoding="utf-8", errors="replace")[:6000]
        except Exception:
            continue
        m = re.search(r"^---\n(.*?)\n---", head, re.S)
        fm = m.group(1) if m else ""
        name = re.search(r"^name:\s*(.*)$", fm, re.M)
        desc = re.search(r"^description:\s*(.*(?:\n[ \t].*)*)$", fm, re.M)
        nm = name.group(1).strip() if name else os.path.basename(os.path.dirname(f))
        total += toks(f"- {nm}: {desc.group(1).strip() if desc else ''}\n")
        count += 1
    return total, count

def enabled_plugin_skill_tokens():
    enabled = {}
    for cfg_path in (os.path.expanduser("~/.claude/settings.json"),
                     os.path.join(repo, ".claude/settings.json"),
                     os.path.join(repo, ".claude/settings.local.json")):
        try:
            enabled.update(json.loads(pathlib.Path(cfg_path).read_text()).get("enabledPlugins") or {})
        except Exception:
            continue                                   # project settings win: later update overwrites
    try:
        installed = json.loads(pathlib.Path(
            os.path.expanduser("~/.claude/plugins/installed_plugins.json")).read_text()).get("plugins", {})
    except Exception:
        return None, 0
    total = count = 0
    for key, on in enabled.items():
        if not on:
            continue
        for inst in installed.get(key, []):
            base = inst.get("installPath")
            if not base:
                continue
            t, n = dir_description_tokens(os.path.join(base, "skills/*/SKILL.md"))
            total += t
            count += n
    return total, count

context_rows = []
for label, pattern in (
        ("the 12 doors (descriptions only)", os.path.join(repo, ".claude/skills/*/SKILL.md")),
        ("user skills", os.path.expanduser("~/.claude/skills/*/SKILL.md")),
        ("user agents", os.path.expanduser("~/.claude/agents/*.md"))):
    t, n = dir_description_tokens(pattern)
    context_rows.append((label, t, n))
plugin_tokens, plugin_count = enabled_plugin_skill_tokens()
if plugin_tokens is not None:
    context_rows.append(("enabled plugins' skill descriptions", plugin_tokens, plugin_count))

# ---- 3. THE VERDICT --------------------------------------------------------------------------
breaches = []
if mem_tokens > MEM_MAX:
    breaches.append(f"MEMORY.md {mem_tokens} > {MEM_MAX}")
if basket_total > BASKET_MAX:
    breaches.append(f"gated basket {basket_total} > {BASKET_MAX}")

if breaches:
    verdict, code = "RED", 1
elif holes:
    verdict, code = "UNVERIFIED", 2
else:
    verdict, code = "GREEN", 0

if want_json:
    print(json.dumps({
        "verdict": verdict,
        "transcript": os.path.basename(transcript),
        "opening": opening,
        "gated_basket_total": basket_total,
        "gated_basket_partial": bool(holes),
        "thresholds": {"memory_md": MEM_MAX, "gated_basket": BASKET_MAX},
        "items": [{"label": l, "tokens": t, "note": n} for l, t, n in basket],
        "not_gated_on_disk": [{"label": l, "tokens": t, "files": n} for l, t, n in context_rows],
        "breaches": breaches,
    }, ensure_ascii=False, indent=2))
    sys.exit(code)

print("=== SESSION-OPENING BUDGET ===")
print(f"transcript : {os.path.basename(transcript)}")
print(f"model      : {opening['model']}")
print(f"opening    : input {opening['input']} + cache_creation {opening['cache_creation']}"
      f" + cache_read {opening['cache_read']} = TOTAL {opening['total']} tokens"
      + (f"   ({opening['skipped_synthetic_records']} synthetic record(s) skipped)"
         if opening["skipped_synthetic_records"] else ""))
print()
print(f"GATED BASKET — {len(basket)} countable files (tiktoken cl100k_base, an instrument):")
width = max(len(l) for l, _, _ in basket + [(l, 0, "") for l, _, _ in context_rows])
for label, t, note in basket:
    print(f"  {label.ljust(width)}  {(f'{t:>6}' if t is not None else '     ?')}  {note}")
print(f"  {'TOTAL (gated)'.ljust(width)}  {basket_total:>6}"
      + ("  ⚠ partial — a line above is unmeasured" if holes else ""))
print()
print("NOT GATED, shown so two different 'our layer' numbers cannot circulate:")
for label, t, n in context_rows:
    print(f"  {label.ljust(width)}  {t:>6}  ({n} files)")
print(f"  {'live-session only (chrome 1,660 · MCP names 1,476 · claude-mem 533)'.ljust(width)}"
      f"       —  measured in var/measure/context-budget-2026-09-22.md, not from disk")
print()
print(f"thresholds : MEMORY.md ≤ {MEM_MAX} · gated basket ≤ {BASKET_MAX}")
if breaches:
    print(f"VERDICT    : RED — {'; '.join(breaches)}")
elif holes:
    print(f"VERDICT    : UNVERIFIED — {len(holes)} line(s) could not be measured; nothing here is guessed.")
else:
    print("VERDICT    : GREEN")
sys.exit(code)
PY
STATUS=$?
while IFS=$'\t' read -r _ _ out_path; do [[ -n "${out_path:-}" ]] && rm -f "$out_path"; done <"$HOOK_RESULTS"
rm -f "$HOOKS_FILE" "$HOOK_RESULTS"
exit $STATUS
