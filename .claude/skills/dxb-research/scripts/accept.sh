#!/usr/bin/env bash
# THE ACCEPTANCE RUN — the engine is judged by what is on the disk, never by what it printed.
#
# WHY IT EXISTS. Three audits on 2026-09-17 found the same shape of fault: the screen said one
# thing and the folder said another. "okunan 14/14 · okunamayan: 0" while four of the fourteen
# were an XML descriptor, a donation page and two API endpoints. "tavily ok" while tavily had
# answered with 135 bytes of quota notice. "kapak o" while not one new byte had been fetched.
# 783 people while the hunter's own report said ten. Every one of those numbers came from the
# engine's own belief about itself.
#
# So this file runs the engine for real — one fixed question, 37 channels, $0 outside — and then
# it forgets everything the engine said and MEASURES THE FILES. It is the only place that may
# answer "is the research engine working today".
#
#   bash accept.sh                       # the full run, with the browser channels
#   bash accept.sh --no-browser          # for a run that must not touch his screen
#   bash accept.sh --question "..."      # a question of your own
#
# Exit 0 only when every threshold is met. NOTHING is written into the repository: the run lives
# in a temporary folder and is deleted unless --keep is given (his paperwork ban).

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL="$(cd "$HERE/.." && pwd)"
REPO="$(cd "$SKILL/../../.." && pwd)"

QUESTION="what do developers say about on-call burnout in site reliability engineering"
OUT=""
KEEP=0
BROWSER_FLAG=""
while [ $# -gt 0 ]; do
  case "$1" in
    --question) QUESTION="$2"; shift 2 ;;
    --out) OUT="$2"; shift 2 ;;
    --keep) KEEP=1; shift ;;
    --no-browser) BROWSER_FLAG="--no-browser"; shift ;;
    *) shift ;;
  esac
done
[ -z "$OUT" ] && OUT="$(mktemp -d /tmp/dxb-accept-XXXXXX)"
mkdir -p "$OUT"

echo "KABUL KOSUSU — motor gercekten calisiyor mu"
echo "soru   : $QUESTION"
echo "klasor : $OUT   (depoya tek bayt yazilmaz)"
echo

# ── 0. THE RULER FIRST. A prose number that disagrees with the code is a fault on its own. ──
echo "── 0/5 · cetvel ──────────────────────────────────────────────────────────────"
ruler_rc=0
bash "$REPO/scripts/research-ruler.sh" | tail -16 || ruler_rc=1
echo

# ── 1. THE RUN ───────────────────────────────────────────────────────────────────────────
echo "── 1/5 · canli tarama ────────────────────────────────────────────────────────"
start=$(date +%s)
bash "$SKILL/scripts/sweep.sh" "$QUESTION" "$OUT/run" --tier max --pages 14 $BROWSER_FLAG \
  > "$OUT/sweep.log" 2>&1
sweep_rc=$?
secs=$(( $(date +%s) - start ))
tail -4 "$OUT/sweep.log"
echo "   sure: ${secs}s · cikis kodu: $sweep_rc"
echo

# ── 2. WHAT IS ACTUALLY ON THE DISK ──────────────────────────────────────────────────────
echo "── 2/5 · diskteki gercek ─────────────────────────────────────────────────────"
python3 - "$OUT/run" "$SKILL" <<'PYEOF'
import json, pathlib, re, sys
run, skill = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
sys.path.insert(0, str(skill / "scripts"))
import rlib

WORDS = re.compile(r"[A-Za-zÀ-ɏ]{3,}")
CROWD_HOSTS = ("reddit", "ycombinator", "twitter", "x.com", "youtube", "stackoverflow",
               "lobste", "quora", "v2ex", "zhihu", "linux-do", "juejin", "bilibili")
MIN_WORDS = 200
MIN_CROWD = 2

pages = sorted((run / "pages").glob("*.md"))
real, thin, crowd = [], [], []
for f in pages:
    n = len(WORDS.findall(f.read_text(errors="replace")))
    (real if n >= MIN_WORDS else thin).append((f.name, n))
    if any(h in f.name.lower() for h in CROWD_HOSTS) and n >= MIN_WORDS:
        crowd.append(f.name)

raws = sorted(run.glob("*.raw"))
# AN UNEARNED "ok" IS MEASURED, NOT INFERRED. The first version of this check decided for
# itself what the sweep must have printed (exit 0 + a wall body) and reported `tavily` as an
# unearned stamp on a run where the table had in fact failed it. So the stamp is read from the
# table the sweep actually printed, and held against the judge's own verdict on the same file.
table = {}
log = run.parent / "sweep.log"
if log.exists():
    import re as _re
    for line in log.read_text(errors="replace").splitlines():
        m = _re.match(r"^([a-z0-9][a-z0-9._-]*)\s+\d+\s+\d+\s\s(.+?)\s*$", line)
        if m:
            table[m.group(1)] = m.group(2)
unearned = []
for r in raws:
    if "-via-" in r.name:
        continue
    if table.get(r.stem, "") != "ok":
        continue
    if rlib.looks_like_wall(r.read_text(errors="replace")):
        unearned.append(r.stem)

covers = []
for c in run.glob("*-via-*.raw"):
    code = run / (c.stem + ".code")
    rc = code.read_text().strip() if code.exists() else "?"
    covers.append((c.stem, rc, c.stat().st_size))
empty_covers = [c for c in covers if c[1] != "0" or c[2] < 40]

print(f"   kanal dosyasi          : {len(raws)}")
print(f"   okunan sayfa govdesi   : {len(pages)}")
print(f"   gercek icerikli (>={MIN_WORDS} kelime): {len(real)}")
print(f"   ince/bos sayfa         : {len(thin)}  {[t[0] for t in thin][:4]}")
print(f"   KALABALIKTAN okunan    : {len(crowd)}  {crowd[:4]}")
print(f"   hak edilmemis 'ok'     : {len(unearned)}  {unearned[:5]}")
print(f"   ates edilen kapak      : {len(covers)} · bos donen: {len(empty_covers)}")

json.dump({"pages": len(pages), "real": len(real), "thin": len(thin), "crowd": len(crowd),
           "unearned": unearned, "covers": len(covers), "empty_covers": len(empty_covers),
           "channels": len(raws), "min_crowd": MIN_CROWD},
          open(run.parent / "measured.json", "w"))
PYEOF
echo

# ── 3. THE DENOMINATOR, COUNTED BY A MACHINE ─────────────────────────────────────────────
echo "── 3/5 · kalabaligin makine sayimi ──────────────────────────────────────────"
grep -ohE 'https?://(www\.)?(reddit\.com/r/[^ "]+/comments/[^ "]+|news\.ycombinator\.com/item\?id=[0-9]+)' \
  "$OUT/run"/*.raw 2>/dev/null | sed 's/[),.]*$//' | sort -u | head -12 > "$OUT/crowd-urls.txt"
crowd_n=$(wc -l < "$OUT/crowd-urls.txt")
echo "   toplanan baslik adresi: $crowd_n"
people=0
if [ "$crowd_n" -gt 0 ]; then
  bash "$SKILL/scripts/crowd.sh" "$OUT/crowd-urls.txt" "$OUT/crowd" --workers 6 > "$OUT/crowd.log" 2>&1
  line=$(grep -m1 '^CROWD-COUNT' "$OUT/crowd.log" || true)
  [ -n "$line" ] && people=$(printf '%s' "$line" | cut -f3)
  grep -m1 '^TOPLAM' "$OUT/crowd.log" || echo "   (sayim satiri yok)"
fi
echo "   sayilan ayri insan: $people"
echo

# ── 4. THE VERDICT ───────────────────────────────────────────────────────────────────────
echo "── 4/5 · hukum ───────────────────────────────────────────────────────────────"
python3 - "$OUT" "$people" "$ruler_rc" "$sweep_rc" <<'PYEOF'
import json, pathlib, sys
out = pathlib.Path(sys.argv[1]); people = int(sys.argv[2]); ruler_rc = int(sys.argv[3]); sweep_rc = int(sys.argv[4])
m = json.load(open(out / "measured.json"))
checks = [
    ("cetvel yesil",                 ruler_rc == 0,                 "research-ruler.sh"),
    ("tarama temiz bitti",           sweep_rc == 0,                 f"cikis kodu {sweep_rc}"),
    ("kanal sayisi >= 30",           m["channels"] >= 30,           f"{m['channels']} kanal dosyasi"),
    ("gercek icerikli sayfa >= 5",   m["real"] >= 5,                f"{m['real']} sayfa"),
    (f"kalabaliktan >= {m['min_crowd']} sayfa", m["crowd"] >= m["min_crowd"], f"{m['crowd']} sayfa"),
    ("hak edilmemis 'ok' yok",       not m["unearned"],             ", ".join(m["unearned"][:4]) or "-"),
    ("insan sayisi makineden",       people > 0,                    f"{people} kisi"),
]
w = max(len(c[0]) for c in checks)
bad = 0
for name, ok, detail in checks:
    if not ok:
        bad += 1
    print(f"   {name.ljust(w)}  {'GECTI' if ok else 'KALDI'}   {detail}")
print()
print(f"KABUL: {len(checks)-bad}/{len(checks)} gecti")
sys.exit(1 if bad else 0)
PYEOF
verdict=$?

echo
echo "── 5/5 · kagit ───────────────────────────────────────────────────────────────"
if [ "$KEEP" = "1" ]; then
  echo "   koşu saklandi: $OUT"
else
  rm -rf "$OUT"
  echo "   koşu silindi — depoya ve diske kagit birakilmadi (--keep ile saklanir)"
fi
exit $verdict
