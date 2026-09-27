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
FAKE_HUNTER may be a comma list: a hunter plays its first mode that is not a claim role's (B56 K2).
THE CLAIM HUNTERS (DXB_HUNTER karsi or bosluk) close every claim of the list in their prompt through the
`link` line it hands them: karsi links its first `adaylar` row against the claim, else closes it with
--none; bosluk links its first `adaylar` row for it, else `add`s a sentence of another author's relevant
row and links that, else --none. `karsi-lazy` / `bosluk-lazy` in FAKE_HUNTER link nothing. Every call they
make is written out as the stream-json of `claude -p` (a tool_use, then its tool_result) before the result,
and before each link a call of its own `show`s the row it links — for a --none the first row the claim stands
on (K2c: the gate reads the transcript). `karsi-blind` / `bosluk-blind` link without that show on every round,
`karsi-blind-once` / `bosluk-blind-once` on the first round only, and `karsi-fetch-blind` / `bosluk-fetch-blind`
first fetch a page no claim stands on (the bench's Reddit thread) and then link without a show.
FAKE_LATE_FETCH=<address>: a hunter, after its reading, fetches that address — a row whose body came after the
triage, as the x hunter's L1688 and L1692 did on the K2 run.
THE WRITER, when launched as one (`--effort medium`, K3), keeps its arguments and its stdin beside it and
answers with the text of FAKE_ANSWER_FILE in the `claude -p --output-format json` envelope — on the first
pass (its prompt says there is no claim ledger yet) with FAKE_DRAFT_FILE when that is set. FAKE_WRITER_SLEEP=<s>:
it sleeps that long before it answers — a writer slower than its clock (fleet.sh --writer-timeout), stopped by it.
THE AUDITOR (B56 K3 stage 3), a call with `--tools ""` whose stdin holds `### C0…` claim headings (scripts/audit.py
without FAKE_AUDIT), agrees with every claim it was handed: `{"verdicts":[…]}`, each `ok`, reason "denetçi taklidi",
in the `--output-format json` envelope, total_cost_usd 0 — so a tail that sets no FAKE_AUDIT still runs its auditor.
All of them write the folder they stand in into cwd.txt there, so a case can see where a `claude` started.
"""
import itertools
import json
import os
import re
import shlex
import subprocess
import sys
import time
from pathlib import Path

argv = sys.argv[1:]
effort = argv[argv.index("--effort") + 1] if "--effort" in argv else ""
Path("cwd.txt").write_text(os.getcwd() + "\n", encoding="utf-8")
if effort == "medium":
    Path("writer-launch.txt").write_text("\n".join(argv) + "\n", encoding="utf-8")
    stdin = sys.stdin.read()
    Path("writer-stdin.txt").write_text(stdin, encoding="utf-8")
    time.sleep(float(os.environ.get("FAKE_WRITER_SLEEP") or 0))
    draft = "(ilk geçiş — iddia defteri henüz yok)" in stdin and os.environ.get("FAKE_DRAFT_FILE")
    answer = Path(draft or os.environ["FAKE_ANSWER_FILE"]).read_text(encoding="utf-8")
    print(json.dumps({"type": "result", "subtype": "success", "is_error": False, "result": answer,
                      "total_cost_usd": 0.4213, "duration_ms": 1234}))
    sys.exit(0)
if "--tools" in argv and argv[argv.index("--tools") + 1:][:1] == [""]:     # a tool-less call: the split's or the auditor's
    stdin = sys.stdin.read()
    claims = re.findall(r"^### (C\d+)", stdin, re.M)
    if claims:
        Path("auditor-launch.txt").write_text("\n".join(argv) + "\n", encoding="utf-8")
        said = {"verdicts": [{"id": c, "verdict": "ok", "reason": "denetçi taklidi"} for c in claims]}
        print(json.dumps({"type": "result", "subtype": "success", "is_error": False,
                          "result": json.dumps(said, ensure_ascii=False), "total_cost_usd": 0}))
        sys.exit(0)

prompt = argv[argv.index("-p") + 1] if "-p" in argv else ""
CLAIM_ROLES = ("karsi", "bosluk")
modes = os.environ.get("FAKE_HUNTER", "exit").split(",")
role = os.environ.get("DXB_HUNTER", "?")
mode = next((m for m in modes if not m.startswith(CLAIM_ROLES)), "exit")
resumed = prompt.startswith("DEVAM")
batches = [shlex.split(c) for c in re.findall(r'^\s+(python3 ".+" batch ".+)$', prompt, re.M)]
TOOL_IDS = itertools.count(1)


def call(*args):
    return subprocess.run(list(args), capture_output=True, text=True).stdout


def step(*args):
    """One Bash call of the claim hunter: made, and written out as `claude -p --output-format stream-json` does."""
    got = call(*args)
    tid = f"toolu_stand_in_{next(TOOL_IDS)}"
    print(json.dumps({"type": "assistant", "message": {"content": [
        {"type": "tool_use", "id": tid, "name": "Bash", "input": {"command": shlex.join(args)}}]}}))
    print(json.dumps({"type": "user", "message": {"content": [{"type": "tool_result", "tool_use_id": tid, "content": got}]}}))
    return got


def claim_hunter():
    """The karsi / bosluk stand-in: every claim block of the prompt's list, closed through its link line."""
    cla, run = re.search(r'^\s+python3 "(.+?)" link "(.+?)" --claim', prompt, re.M).groups()
    evi = re.search(r'^\s+python3 "(.+?)" add "(.+?)" --url', prompt, re.M).group(1)
    blind = f"{role}-blind" in modes or f"{role}-fetch-blind" in modes or (f"{role}-blind-once" in modes and not resumed)
    if f"{role}-fetch-blind" in modes:
        step("python3", evi, "fetch", run, "--url", "https://www.reddit.com/r/bench/comments/abc/which_one/")
    claims, cur, part = [], None, None
    for line in prompt.splitlines():
        m = re.match(r"### (C\d+) \|", line)
        if m:
            cur = {"id": m.group(1), "authors": set(), "rows": [], "cands": []}
            claims.append(cur)
            part = None
        elif cur is not None and line.startswith(("dayanak", "adaylar")):
            part = line[:7]
        elif cur is not None and part and re.match(r"\s*\[L\d+\]", line):
            rid, who = re.match(r"\s*\[(L\d+)\] \S+ · @(\S+)", line).groups()
            if part == "dayanak":
                cur["authors"].add(who)
                cur["rows"].append(rid)
            else:
                cur["cands"].append(rid)
        elif not line.strip():
            cur = None
    added, out = {}, []
    for c in [] if f"{role}-lazy" in modes else claims:
        pick = c["cands"][0] if c["cands"] else None
        if pick is None and role == "bosluk":
            rows = [json.loads(x) for x in Path(run, "evidence.jsonl").read_text(encoding="utf-8").splitlines() if x.strip()]
            other = next((r for r in rows if r.get("tool") != "evidence.py add" and r.get("triage") == "relevant"
                          and r.get("bytes") and r.get("author") and r["author"] not in c["authors"]), None)
            if other:
                if other["url"] not in added:
                    quote = other["passage"].split(". ")[0].rstrip(".") + "."
                    added[other["url"]] = step("python3", evi, "add", run, "--url", other["url"], "--quote", quote).strip()
                pick = added[other["url"]]
        if not blind and (pick or c["rows"]):
            step("python3", evi, "show", run, pick or c["rows"][0])
        if pick:
            step("python3", cla, "link", run, "--claim", c["id"], "--against" if role == "karsi" else "--for", pick,
                 "--by", role)
            out.append(f"{c['id']} — {'karşı' if role == 'karsi' else 'ikinci kaynak'}: {pick}")
        else:
            step("python3", cla, "link", run, "--claim", c["id"], "--none", "--kind",
                 "counter" if role == "karsi" else "gap", "--reason", "stand-in searched, found nothing", "--by", role)
            out.append(f"{c['id']} — yok: stand-in searched, found nothing")
    print(json.dumps({"type": "result", "result": "\n".join(out) or "(liste bos)", "total_cost_usd": 0.03}))
    sys.exit(int(os.environ.get("FAKE_RC", "0")))


if role in CLAIM_ROLES:
    claim_hunter()


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

if os.environ.get("FAKE_LATE_FETCH") and batches:
    call("python3", batches[0][1], "fetch", batches[0][3], "--url", os.environ["FAKE_LATE_FETCH"])
turn = "resumed" if resumed else "first"
line = "bulundu 3 / okundu 130 / okunmadı: 0 / kapı kapalı: 0" if mode == "declare" else f"stand-in verdict ({turn})"
text = (f"HÜKÜM: {role} stand-in verdict, {turn} round\n"
        f"PLATFORM x: {line}\n"
        f"KULLANDIĞIM SATIRLAR: {', '.join(used) or 'L0001'}\n"
        "okunacak adres kalmadı\n")
print(json.dumps({"type": "result", "result": text, "total_cost_usd": 0.05}))
sys.exit(int(os.environ.get("FAKE_RC", "0")))
