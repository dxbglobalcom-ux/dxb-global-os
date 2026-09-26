#!/usr/bin/env bash
# THE HUNTER'S STAND-IN — no model is called. It keeps what the fleet launched it with (one argument
# per line, and the hunter name its environment carries) and answers with one final result in the
# shape the arsenal asks for. The fleet runs it inside $OUT/work-<role>, so the role is the folder.
role="${PWD##*/work-}"
{ printf '%s\n' "$@"; printf 'DXB_HUNTER=%s\n' "${DXB_HUNTER:-}"; } > launch.txt
python3 - "$role" <<'PY'
import json, sys
role = sys.argv[1]
text = (f"HÜKÜM: {role} stand-in verdict\n"
        f"PLATFORM {role}: bulundu 1 / okundu 1 / okunmadı: 0 / kapı kapalı: yok\n"
        "KULLANDIĞIM SATIRLAR: L0001\n")
print(json.dumps({"type": "result", "result": text, "total_cost_usd": 0}))
PY
