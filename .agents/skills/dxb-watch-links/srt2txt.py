# srt2txt.py <in.srt> <out.txt> — YouTube subtitles -> "[mm:ss] text" lines, repeats dropped
import re, sys
t = open(sys.argv[1], encoding="utf-8", errors="ignore").read()
out, last = [], ""
for blk in re.split(r"\n\s*\n", t):
    m = re.search(r"(\d\d):(\d\d):(\d\d)", blk)
    lines = [l for l in blk.splitlines() if l and not l.strip().isdigit() and "-->" not in l]
    txt = re.sub(r"<[^>]+>", "", " ".join(lines)).strip()
    if m and txt and txt != last:
        out.append(f"[{int(m.group(1)) * 60 + int(m.group(2)):02d}:{m.group(3)}] {txt}"); last = txt
open(sys.argv[2], "w").write("source: youtube subtitles\n" + "\n".join(out) + "\n")
