#!/usr/bin/env bash
# CONTACT SHEETS — every extracted frame of one source, laid out so a reader can
# sweep all of them by eye without opening 150 files one at a time.
#
#   scripts/rival-intel/sheets.sh 02 [tiles-per-sheet]
#
# Why this exists as a script and not as an inline command: the first inline
# version matched frames with a `t0` prefix, so a source with more than 99
# frames silently dropped t100 and everything after it — 44 unread frames on
# source 02, found only because a sheet came out three-quarters black. A silent
# omission is exactly what C42 forbids, so the sweep now lives in one place,
# sorts numerically, and PRINTS the count it swept for comparison.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NN="${1:-}"
PER="${2:-12}"
[ -n "$NN" ] || { echo "usage: sheets.sh <row number> [tiles per sheet]" >&2; exit 1; }

DIR="$ROOT/.planning/research/rival-intel/frames/$NN"
[ -d "$DIR" ] || { echo "FAIL no frames for row $NN at $DIR" >&2; exit 1; }

python3 - "$DIR" "$PER" <<'PY'
import os, re, subprocess, sys

d, per = sys.argv[1], int(sys.argv[2])
os.chdir(d)

# Numeric sort, and BOTH families: t### are the one-per-second frames, cut###
# are the scene cuts. Neither may be dropped.
def key(f):
    m = re.match(r"([a-z]+)(\d+)\.jpg$", f)
    return (m.group(1), int(m.group(2))) if m else (f, 0)

frames = sorted((f for f in os.listdir(".") if re.match(r"^(t|cut)\d+\.jpg$", f)), key=key)
if not frames:
    raise SystemExit("FAIL no frames matched")

os.makedirs("sheets", exist_ok=True)
for f in os.listdir("sheets"):
    os.remove(os.path.join("sheets", f))

rows = max(1, round(per / 4))
for i in range(0, len(frames), per):
    batch = frames[i : i + per]
    out = f"sheets/sheet{i // per + 1:02d}.png"
    subprocess.run(
        ["montage", *batch, "-tile", f"4x{rows}", "-geometry", "300x533+3+3",
         "-background", "black", "-fill", "white", "-label", "%f", out],
        check=True,
    )

sheets = sorted(os.listdir("sheets"))
print(f"swept {len(frames)} frames ({frames[0]} … {frames[-1]}) into {len(sheets)} sheets")
print("frames per sheet:", per)
PY
