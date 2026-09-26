#!/usr/bin/env python3
"""THE MODEL'S STAND-IN — no model is called (tests/b46/completion-gate.test.ts).

THE HUNTER, when launched as one (`--effort low`), plays what FAKE_HUNTER names and leaves with FAKE_RC:
  exit     leaves at once, reads nothing, and says it is finished — the hunters of 2026-09-26 did
  batch    reads every relevant row through the `batch` lines of its prompt and gives each a verdict
           (the first row a quote through `add`, the rest `verdict none`)
  nojudge  reads everything through batch and judges nothing — until its prompt starts with DEVAM,
           then it judges what it read (verdict-bulk)
  declare  reads nothing and writes "okundu 130" in its PLATFORM line
  partial  reads two rows whole and judges them, prints the third only in part (batch --max-chars 20)
           and leaves; resumed (DEVAM), it reads on through batch, which continues the partial row
Its answer names the round it was in ("first" or "resumed"), so a case can tell whose HÜKÜM stood.
THE WRITER, when launched as one (`--effort high`), keeps its arguments and its stdin beside it and
answers with the text of FAKE_ANSWER_FILE in the `claude -p --output-format json` envelope.
Both write the folder they stand in into cwd.txt there, so a case can see where a `claude` was started.
"""
import json
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path

argv = sys.argv[1:]
effort = argv[argv.index("--effort") + 1] if "--effort" in argv else ""
Path("cwd.txt").write_text(os.getcwd() + "\n", encoding="utf-8")
if effort == "high":
    Path("writer-launch.txt").write_text("\n".join(argv) + "\n", encoding="utf-8")
    Path("writer-stdin.txt").write_text(sys.stdin.read(), encoding="utf-8")
    answer = Path(os.environ["FAKE_ANSWER_FILE"]).read_text(encoding="utf-8")
    print(json.dumps({"type": "result", "subtype": "success", "is_error": False, "result": answer,
                      "total_cost_usd": 0.4213, "duration_ms": 1234}))
    sys.exit(0)

prompt = argv[argv.index("-p") + 1] if "-p" in argv else ""
role, mode = os.environ.get("DXB_HUNTER", "?"), os.environ.get("FAKE_HUNTER", "exit")
resumed = prompt.startswith("DEVAM")
batches = [shlex.split(c) for c in re.findall(r'^\s+(python3 ".+" batch ".+)$', prompt, re.M)]


def call(*args):
    return subprocess.run(list(args), capture_output=True, text=True).stdout


def read_all(judge, extra=(), once=False):
    """Every batch line of the prompt (with `extra` arguments) until it says nothing is left — or one call
    each when `once`; the first row printed gets a quote."""
    used = []
    for cmd in batches:
        evi, run = cmd[1], cmd[3]
        while True:
            out = call(*cmd, *extra)
            for rid, url, text in re.findall(r"^### (L\d+) \| [^|]* \| [^|]* \| (\S+)\n(.*)$", out, re.M):
                if not judge:
                    continue
                if not used:
                    call("python3", evi, "add", run, "--url", url, "--quote", text.split(". ")[0].rstrip(".") + ".")
                else:
                    call("python3", evi, "verdict", run, "--hunter", role, "--id", rid, "--verdict", "none",
                         "--reason", "says nothing")
                used.append(rid)
            if once or "nothing left" in out or "BATCH: printed 0" in out:
                break
    return used


used = []
if mode == "batch" or (mode == "partial" and resumed):
    used = read_all(judge=True)
elif mode == "partial":
    used = read_all(judge=True, extra=("--n", "2"), once=True)
    read_all(judge=False, extra=("--max-chars", "20"), once=True)
elif mode == "nojudge" and not resumed:
    read_all(judge=False)
elif mode == "nojudge":
    evi, run = batches[0][1], batches[0][3]
    rows = [json.loads(x) for x in Path(run, "evidence.jsonl").read_text(encoding="utf-8").splitlines() if x.strip()]
    owed = [r["id"] for r in rows if r.get("read_by") == role and not r.get("verdict")]
    Path("verdicts.json").write_text(json.dumps(
        {"verdicts": [{"id": i, "verdict": "none", "reason": "says nothing"} for i in owed]}), encoding="utf-8")
    call("python3", evi, "verdict-bulk", run, "--hunter", role, "--json", str(Path.cwd() / "verdicts.json"))
    used = owed

turn = "resumed" if resumed else "first"
line = "bulundu 3 / okundu 130 / okunmadı: 0 / kapı kapalı: 0" if mode == "declare" else f"stand-in verdict ({turn})"
text = (f"HÜKÜM: {role} stand-in verdict, {turn} round\n"
        f"PLATFORM x: {line}\n"
        f"KULLANDIĞIM SATIRLAR: {', '.join(used) or 'L0001'}\n"
        "okunacak adres kalmadı\n")
print(json.dumps({"type": "result", "result": text, "total_cost_usd": 0.05}))
sys.exit(int(os.environ.get("FAKE_RC", "0")))
