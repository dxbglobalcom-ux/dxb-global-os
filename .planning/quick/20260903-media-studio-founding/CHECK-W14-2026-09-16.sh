#!/usr/bin/env bash
# CHECK-W14-2026-09-16.sh — the checker's ruler for W14 (dictated by the checker session dxb-global-os-c7,
# Fable 5.1, 2026-09-16; copied and committed ALONE by the builder as `records(ruler): …` BEFORE the first line
# of W14 work — the audit law c7570071). Builder and checker run the SAME script.
#
# W14 (STUDIO_AUDIT_HANDOFF.md §7, row W14): the Ferrari legs he ordered first, WRITTEN AS OWNED LEGS WITH
# ACCEPTANCE TESTS — planning only. Nothing is built until he approves. Findings: F036 F066 F067 F068 F073 F074
# F075 F077. Acceptance: each leg on the board with an owner row, a single proving command and a CEO-facing
# deliverable named.
#
# THE GRAMMAR THE RULER MEASURES (dictated so the metre can see it; the words are the builder's):
#   Each of the 11 legs is written on the board (HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md) as ONE segment
#   opened by the marker  <!-- W14-Lnn -->  (nn = 01..11) and closed by the next W14 marker; the last leg is
#   closed by  <!-- /W14 -->  (so no leg's segment can borrow words from the rest of the row).
#   Inside its segment every leg carries these seven fields, each spelled exactly so:
#     owner:        who owns the leg (a seat, a service or "the building session") — not empty
#     finding:      the F-id(s) it closes (F0nn)
#     deliverable:  the CEO-facing thing he will hold or see, named (a table, a screen, a directive, a row…)
#     accept:       the acceptance test in words — what is true when the leg is done
#     proves:       EXACTLY ONE command in backticks — the single proving command
#     status: planned
#     gate: his word
#   The eleven legs, in the handoff's order, and the word each segment must contain (case-insensitive):
#     L01 two-roads cost table          → "two-roads"
#     L02 shot router as data           → "router"
#     L03 RunPod lane                   → "runpod"
#     L04 engine × machine measurement  → "machine"
#     L05 visible dial, cost before     → "dial"
#     L06 job → scene → shot records    → "scene"
#     L07 DxB Agency chain              → "agency"
#     L08 rights / licensing            → "licen"
#     L09 master archive + backup       → "backup"
#     L10 intake → revision → delivery  → "revision"
#     L11 elderly-woman presenter       → "presenter"
#
# MODES
#   baseline        — today's tree: prints every line; legs are RED BY DESIGN (a ruler green before the work is a wrong ruler)
#   w14             — the grammar check above + the eight findings named + no "built" claim inside any leg
#   guard <range>   — the W14 commit(s) touched NOTHING under db/ packages/ apps/ tests/ scripts/ (planning only);
#                     migrations count unchanged; ledger carries no W14 approval without his verbatim
#   battery         — the shared battery, unchanged: CHECK-W9-B08-2026-09-15.sh battery
#
# Exit 0 = all lines PASS in that mode; 1 otherwise.

set -u
R="/home/dxb/DxB Global OS"
BOARD="$R/HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"
HANDOFF="$R/.planning/quick/20260903-media-studio-founding/STUDIO_AUDIT_HANDOFF.md"
LEDGER="$R/scripts/governance/ceo-approvals.json"
STATE="$R/.planning/STATE.md"
SHARED="$R/.planning/quick/20260903-media-studio-founding/CHECK-W9-B08-2026-09-15.sh"
MIGRATIONS_EXPECTED=169   # measured 2026-09-15 (W13 ledger entry: "migrations 169/169/169")

fails=0
line() { # line <PASS|FAIL> <label> <value>
  printf '%-4s  %-58s %s\n' "$1" "$2" "$3"; [ "$1" = PASS ] || fails=$((fails+1)); }
expect_eq() { # expect_eq <label> <got> <want>
  if [ "$2" = "$3" ]; then line PASS "$1" "$2"; else line FAIL "$1" "$2 (expected: $3)"; fi; }

mode="${1:-baseline}"; shift || true

grammar_check() {
python3 - "$BOARD" "$HANDOFF" <<'PY'
import re, sys
board = open(sys.argv[1], encoding='utf-8').read()
out = []
def L(ok, label, val):
    out.append(("PASS" if ok else "FAIL", label, val))

markers = [m.start() for m in re.finditer(r'<!--\s*W14-L(\d\d)\s*-->', board)]
ids = re.findall(r'<!--\s*W14-L(\d\d)\s*-->', board)
L(sorted(set(ids)) == ['%02d' % i for i in range(1, 12)] and len(ids) == 11,
  "11 leg markers W14-L01..L11, each exactly once", f"{len(ids)} markers, distinct {len(set(ids))}")
closer = re.search(r'<!--\s*/W14\s*-->', board)
L(bool(closer), "closing marker <!-- /W14 --> present", "1" if closer else "0")

# segments
segs = {}
if markers and closer and len(markers) == 11 and closer.start() > markers[-1]:
    bounds = markers + [closer.start()]
    for i, (s, e) in enumerate(zip(bounds[:-1], bounds[1:])):
        segs[ids[i]] = board[s:e]
    L(all(s < closer.start() for s in markers), "all legs before the closing marker", "yes")
else:
    L(False, "segments could be cut (markers + closer in order)", "no")

words = {'01':'two-roads','02':'router','03':'runpod','04':'machine','05':'dial','06':'scene',
         '07':'agency','08':'licen','09':'backup','10':'revision','11':'presenter'}
fields = ['owner:', 'finding:', 'deliverable:', 'accept:', 'proves:']
for nn in ['%02d' % i for i in range(1, 12)]:
    seg = segs.get(nn, '')
    if not seg:
        L(False, f"L{nn} segment present", "missing"); continue
    missing = [f for f in fields if not re.search(re.escape(f) + r'\s*\S', seg)]
    ticks = re.findall(r'`[^`]+`', seg)
    has_word = re.search(words[nn], seg, re.I) is not None
    status_ok = re.search(r'status:\s*planned\b', seg) is not None
    gate_ok = re.search(r'gate:\s*his word', seg, re.I) is not None
    built_claim = re.search(r'\b(built|done|delivered|accepted)\b(?!\s+until)', seg, re.I)
    # allow the phrase "nothing built until" / "not built"
    built_claim = built_claim and not re.match(r'(?i)(nothing|not)\s+built', seg[max(0,built_claim.start()-8):built_claim.end()])
    fid_ok = re.search(r'finding:\s*F0\d\d', seg) is not None
    ok = (not missing) and len(ticks) == 1 and has_word and status_ok and gate_ok and fid_ok and not built_claim
    detail = []
    if missing: detail.append("missing " + ",".join(missing))
    if len(ticks) != 1: detail.append(f"{len(ticks)} backticked commands (want 1)")
    if not has_word: detail.append(f"word '{words[nn]}' absent")
    if not status_ok: detail.append("status: planned absent")
    if not gate_ok: detail.append("gate: his word absent")
    if not fid_ok: detail.append("finding: F0nn absent")
    if built_claim: detail.append("claims built/done/delivered/accepted")
    L(ok, f"L{nn} owner·finding·deliverable·accept·proves(1 cmd)·planned·gate", "ok" if ok else "; ".join(detail))

allseg = "".join(segs.values())
for f in ['F036','F066','F067','F068','F073','F074','F075','F077']:
    L(f in allseg, f"finding {f} named on a W14 leg", "yes" if f in allseg else "no")

# the W14 row in the handoff still lists all eleven legs (scope not shrunk in the plan file)
hand = open(sys.argv[2], encoding='utf-8').read()
row = re.search(r'^\| W14 \|.*$', hand, re.M)
L(bool(row) and all(w in row.group(0).lower() for w in ['two-roads','router','runpod','machine','dial','scene','agency','licens','backup','revision','presenter']),
  "handoff W14 row still names all 11 legs", "yes" if row else "row missing")

for st, lab, val in out:
    print(f"{st:<4}  {lab:<58} {val}")
sys.exit(0 if all(s == "PASS" for s, _, _ in out) else 1)
PY
}

case "$mode" in
  baseline|w14)
    echo "== W14 LEGS ON THE BOARD ($mode)"
    grammar_check || fails=$((fails+1))
    ;;
  guard)
    range="${1:-}"; [ -n "$range" ] || { echo "usage: guard <hash|range>  (a single hash means that one commit)"; exit 2; }
    case "$range" in *..*) ;; *) range="${range}^..${range}";; esac
    echo "== W14 GUARD — planning only, nothing built ($range)"
    touched=$(git -C "$R" diff --name-only "$range" -- db packages apps tests scripts ':!scripts/governance/ceo-approvals.json' | wc -l | tr -d ' ')
    expect_eq "files under db/ packages/ apps/ tests/ scripts/ (ledger excepted)" "$touched" "0"
    [ "$touched" = 0 ] || git -C "$R" diff --name-only "$range" -- db packages apps tests scripts ':!scripts/governance/ceo-approvals.json' | sed 's/^/      /'
    mig=$(ls "$R/db/migrations" | grep -c '\.sql$')
    expect_eq "db/migrations *.sql count" "$mig" "$MIGRATIONS_EXPECTED"
    bad=$(python3 - "$LEDGER" <<'PY'
import json,sys,re
d=json.load(open(sys.argv[1],encoding='utf-8'))
bad=[k for k,v in d.items() if not k.startswith('_') and re.search(r'w14',k,re.I) and re.search(r'approv|accept|başla|basla',k,re.I) and not str(v.get('verbatim','')).strip()]
print(len(bad)); [print("      "+k) for k in bad]
PY
)
    expect_eq "ledger W14 approval entries without his verbatim" "$(echo "$bad" | head -1)" "0"
    echo "$bad" | tail -n +2
    w14_ledger=$(python3 -c "import json,re,sys;d=json.load(open(sys.argv[1],encoding='utf-8'));print(', '.join(k for k in d if re.search('w14',k,re.I)) or '(none)')" "$LEDGER")
    line PASS "ledger keys naming W14 (for the eye, not a gate)" "$w14_ledger"
    st=$(grep -c 'W14' "$STATE"); line "$([ "$st" -gt 0 ] && echo PASS || echo FAIL)" "STATE.md names W14" "$st line(s)"
    ;;
  battery)
    exec bash "$SHARED" battery
    ;;
  *) echo "usage: $0 {baseline|w14|guard <hash|range>|battery}"; exit 2;;
esac

echo
if [ "$fails" -eq 0 ]; then echo "CHECK W14 [$mode]: PASS"; exit 0; else echo "CHECK W14 [$mode]: FAIL ($fails)"; exit 1; fi
