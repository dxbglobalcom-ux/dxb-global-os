#!/usr/bin/env bash
# frames.sh <job-dir> <video> <sec> [sec...]  — step 2: the frames at the moments that matter,
# side by side on one sheet. Read the SHEET it prints.
set -u
J="$1"; v="$2"; shift 2
d="$J/frames/$(basename "${v%.*}")"; mkdir -p "$d"
files=()
for s in "$@"; do ffmpeg -v error -y -ss "$s" -i "$v" -frames:v 1 -q:v 2 "$d/t$s.jpg" < /dev/null && files+=("$d/t$s.jpg"); done
python3 -I - "$d/sheet-$(date +%s).jpg" "${files[@]}" <<'EOF'
import sys
from PIL import Image
out, fs = sys.argv[1], sys.argv[2:]
ims = [Image.open(f) for f in fs]
h = 900; ims = [im.resize((int(im.width * h / im.height), h)) for im in ims]
sheet = Image.new("RGB", (sum(i.width for i in ims), h), "white"); x = 0
for im in ims: sheet.paste(im, (x, 0)); x += im.width
sheet.save(out, quality=90); print("SHEET", out)
EOF
