#!/usr/bin/env bash
# W11 (CEO 2026-09-15, "tmm başla") — THE PRODUCT REGISTER'S PERMANENT GATE.
#
# The vitrin and the catalogue are what the CEO opens to see what the studio has produced
# (`~/tools/h3/studio/`, outside git, temporary until B32 draws the studio's own tab). Audit W11
# measured what an ungated register drifts into in twelve days: a cast card template that told him
# every face was drawn in FLUX — including the two the engine itself bore; the voice hand he
# cancelled on 2026-09-04 still advertised as a live engine; 2K promises that outlived his 1080p
# ceiling; pointers into a folder he had deleted by hand; AHMET's reference frames filed under
# another man's code; and twenty-five acceptance claims with no registered word of his behind them.
#
# So the register is gated the way the repository is gated. This file is the door: it reads the
# living artefacts and fails on the classes of drift that were found, not on their instances.
# The audit's own ruler (CHECK-W11-2026-09-15.sh) additionally RENDERS the page; this gate reads
# the source, so it runs anywhere, in a second, with no browser.
#
#   bash scripts/b43/vitrin-register-gate.sh          # exit 0 = the register tells the truth
#
# A machine without the vitrin (a clone, CI) is not a failure — there is nothing to gate there.
set -uo pipefail

V="${DXB_VITRIN_DIR:-$HOME/tools/h3/studio}"
IDX="$V/index.html"; KAT="$V/KATALOG.md"; MEDIA="$V/media"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LEDGER="$REPO/scripts/governance/ceo-approvals.json"
UNIT="$HOME/.config/systemd/user/dxb-vitrin.service"
fail=0
ok(){ printf "PASS  %-58s %s\n" "$1" "$2"; }
no(){ printf "FAIL  %-58s %s\n" "$1" "$2"; fail=1; }
chk(){ if [[ "$2" =~ $3 ]]; then ok "$1" "$2"; else no "$1" "$2 (expected: $3)"; fi; }

if [[ ! -f "$IDX" ]]; then
  echo "vitrin not on this machine ($V) — nothing to gate"; exit 0
fi

echo "== VITRIN REGISTER GATE — $V"

# 1. the cast card names how each face was born, per person, and the template invents nothing
chk "1  every cast entry carries its own origin (kaynak)" \
    "$(( $(grep -c 'slug:"' "$IDX") - $(grep -c 'kaynak:"' "$IDX") ))" "^0$"
chk "2  the card template renders that origin, never a fixed engine name" \
    "$(grep -c '<span class="t">\${p.kaynak}</span>' "$IDX")" "^1$"

# 2. a hand the CEO cancelled is not advertised as a live one
chk "3  the cancelled TTS hand is not named on the vitrin or in the catalogue" \
    "$(( $(grep -c 'edge-tts' "$IDX") + $(grep -c 'edge-tts' "$KAT") ))" "^0$"
chk "4  no 2K promise outside his 1080p ceiling ruling" \
    "$(grep -h '2K\|1440×2592\|1440x2592' "$IDX" "$KAT" | grep -vic 'iptal\|tavan\|1080p')" "^0$"

# 3. nothing points at what he deleted
chk "5  no pointer into the folder he deleted 2026-09-04" \
    "$(( $(grep -c 'Medya OS' "$IDX") + $(grep -c 'Medya OS' "$KAT") ))" "^0$"

# 4. a person's files carry that person's code
chk "6  AHMET's frames are filed under his own code (no a006-birth)" \
    "$(( $(grep -c 'a006-birth' "$IDX") + $(ls "$MEDIA" 2>/dev/null | grep -c '^a006-birth') ))" "^0$"

# 5. LAW B on his own showcase: an acceptance claim names the registered word behind it
chk "7  acceptance claims without a registered ledger id" \
    "$(python3 - "$LEDGER" "$IDX" "$KAT" <<'PY'
import json,re,sys
keys=set(json.load(open(sys.argv[1])).keys()); n=0
for f in sys.argv[2:]:
    for line in open(f,encoding='utf-8'):
        if re.search(r'kabul',line,re.I) and not any(k in line for k in keys): n+=1
print(n)
PY
)" "^0$"

# 6. every file the page shows him exists
chk "8  media referenced by the page but missing on disk" \
    "$(grep -o 'media/[^"'"'"' )>?#]*' "$IDX" | sed 's#^media/##' | sort -u | grep -v '\${' | while read -r f; do [[ -e "$MEDIA/$f" ]] || echo "$f"; done | wc -l)" "^0$"

# 7. the counters are counted from the page, never typed by hand
chk "9  hand-written tab counters in the source" "$(grep -c '<span class="c">[0-9]' "$IDX")" "^0$"

# 8. his review page is not published to the network by accident
if [[ -f "$UNIT" ]]; then
  chk "10 the vitrin service binds loopback only" "$(grep -o 'bind [0-9.]*' "$UNIT" | head -1)" "^bind 127\.0\.0\.1$"
else
  ok "10 the vitrin service binds loopback only" "no unit on this machine"
fi

echo
[[ $fail == 0 ]] && echo "VITRIN REGISTER: PASS" || { echo "VITRIN REGISTER: FAIL"; exit 1; }
