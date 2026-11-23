#!/usr/bin/env bash
# ytsubs.sh <job-dir> <prefix> <id> ... — English subtitles of YouTube videos, rolling captions de-duplicated,
# one paragraph a minute, into <job-dir>/transcripts/<prefix>-<id>.txt. No audio fallback.
J="$1"; P="$2"; shift 2; Y="$J/youtube/subs"; mkdir -p "$Y" "$J/transcripts"
for v in "$@"; do
  out="$J/transcripts/$P-$v.txt"; [ -s "$out" ] && continue
  timeout 90 yt-dlp -q --no-warnings --skip-download --write-auto-subs --write-subs --sub-langs "en" --convert-subs srt -o "$Y/$v.%(ext)s" "https://www.youtube.com/watch?v=$v" </dev/null 2>/dev/null
  [ -s "$Y/$v.en.srt" ] && python3 -I - "$Y/$v.en.srt" "$out" <<'PY'
import sys,re
words=[];out=[];last=-999;sec=0
for blk in open(sys.argv[1],encoding="utf-8",errors="replace").read().split("\n\n"):
    ls=[l for l in blk.strip().split("\n") if l.strip()]
    if len(ls)<3: continue
    m=re.match(r"(\d+):(\d+):(\d+)",ls[1])
    if not m: continue
    sec=int(m[1])*3600+int(m[2])*60+int(m[3])
    w=re.sub(r"<[^>]+>","", " ".join(ls[2:])).split()
    k=0
    for n in range(min(len(w),len(words),40),0,-1):
        if words[-n:]==w[:n]: k=n;break
    new=w[k:]
    if not new: continue
    if sec-last>=60: out.append(f"\n[{sec//60:02d}:{sec%60:02d}]"); last=sec
    out.append(" ".join(new)); words=(words+new)[-80:]
open(sys.argv[2],"w").write("source: youtube subtitles (auto captions, de-duplicated)\n"+" ".join(out)+"\n")
PY
  [ -s "$out" ] || echo "NOSUB $v"
  sleep 2
done
