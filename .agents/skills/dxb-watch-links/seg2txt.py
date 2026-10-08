# seg2txt.py [offset-seconds] — verbose_json from Speaches on stdin -> "[mm:ss] text" lines on stdout.
# The offset places a 10-minute piece at its real time in the whole video.
import json, sys
off = int(sys.argv[1]) if len(sys.argv) > 1 else 0
try:
    d = json.load(sys.stdin)
    if off == 0:
        print("language:", d.get("language"))
    for s in d.get("segments", []):
        t = int(s["start"]) + off
        print(f"[{t // 60:02d}:{t % 60:02d}] {s['text'].strip()}")
except Exception as e:
    print(f"TRANSCRIBE_FAILED at {off // 60} min:", e)
