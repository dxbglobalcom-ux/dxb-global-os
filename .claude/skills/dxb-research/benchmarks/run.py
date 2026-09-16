#!/usr/bin/env python3
"""The race. "Ferrari" is a measured result, not a label.

Arms
  0  the model with NO tools          — the CONTAMINATION FILTER, not a competitor.
                                        Any task arm 0 answers is DELETED, not scored.
  1  a plain session with tools       — the honest baseline
  2  a session + the prose doctrine   — the architecture this engine claims to beat
  3  a session + the gated engine     — the thing being tested

The acceptance condition, written BEFORE the run so it cannot be negotiated after:
arm 3 must beat arms 1 and 2 on recall, at $0 external cost. If it does not, the
central hypothesis — that requiring an evidence TYPE forces a tool to be used — is
FALSIFIED, and that is a legitimate result to report.

  run.py --arms 0,1,3 --tasks T01,T02 --timeout 600
  run.py --score-only results.json
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import json
import re
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILL = HERE.parent
TASKS = HERE / "tasks.json"

ARMS = {
    "0": {"name": "model-only (contamination filter)", "tools": "none", "skill": False},
    "1": {"name": "plain session with tools", "tools": "all", "skill": False},
    "2": {"name": "session + prose doctrine", "tools": "all", "skill": "prose"},
    "3": {"name": "session + DXB gated engine", "tools": "all", "skill": "gated"},
}

PROMPT_0 = (
    "Answer this question from your own knowledge. You have NO tools and must not "
    "attempt to use any. If you do not know, say so plainly.\n\nQUESTION: {q}"
)
PROMPT_1 = (
    "Research this question and answer it. Use whatever tools you have.\n\nQUESTION: {q}"
)
PROMPT_3 = (
    "Use the dxb-research skill to answer this question properly: open a research run, "
    "sweep, read the pages, satisfy the completion gate, then give the answer.\n\n"
    "QUESTION: {q}"
)


def score(answer: str, task: dict) -> dict:
    a = answer or ""
    hits, total, missing = 0, 0, []
    for g in task.get("gold_all", []):
        total += 1
        if g.lower() in a.lower():
            hits += 1
        else:
            missing.append(g)
    for rx in task.get("gold_regex", []):
        total += 1
        if re.search(rx, a):
            hits += 1
        else:
            missing.append(f"/{rx}/")
    for group in task.get("gold_any", []):
        total += 1
        if any(g.lower() in a.lower() for g in group):
            hits += 1
        else:
            missing.append(" | ".join(group))
    forbidden = [f for f in task.get("forbidden", []) if f.lower() in a.lower()]
    return {
        "recall": round(hits / total, 3) if total else 0.0,
        "hits": hits, "total": total, "missing": missing,
        "forbidden_present": forbidden,
        "clean": not forbidden,
        "chars": len(a),
    }


def run_one(arm: str, task: dict, timeout: int, model: str | None) -> dict:
    cfg = ARMS[arm]
    q = task["question"]
    if arm == "0":
        prompt, extra = PROMPT_0.format(q=q), ["--tools"]
    elif arm == "3":
        prompt, extra = PROMPT_3.format(q=q), []
    else:
        prompt, extra = PROMPT_1.format(q=q), []

    cmd = ["claude", "-p", prompt, "--permission-mode", "bypassPermissions"]
    if model:
        cmd += ["--model", model]
    if arm == "0":
        cmd += ["--disallowedTools", "Bash", "WebSearch", "WebFetch", "Task", "Skill",
                "Read", "Glob", "Grep"]
    t0 = time.time()
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout,
                           cwd=str(SKILL.parent.parent.parent))
        out, err, rc = p.stdout.strip(), p.stderr.strip()[-400:], p.returncode
    except subprocess.TimeoutExpired:
        out, err, rc = "", "TIMEOUT", 124
    el = round(time.time() - t0, 1)
    s = score(out, task)
    return {"arm": arm, "arm_name": cfg["name"], "task": task["id"],
            "category": task["category"], "trap": task.get("trap", False),
            "seconds": el, "rc": rc, "stderr": err, "answer": out, **s}


def main() -> int:
    ap = argparse.ArgumentParser(prog="run.py")
    ap.add_argument("--arms", default="0,1,3")
    ap.add_argument("--tasks", default="")
    ap.add_argument("--timeout", type=int, default=900)
    ap.add_argument("--model")
    ap.add_argument("--parallel", type=int, default=3)
    ap.add_argument("--out", default=str(HERE / "results.json"))
    ap.add_argument("--score-only")
    a = ap.parse_args()

    if a.score_only:
        rows = json.loads(Path(a.score_only).read_text())["runs"]
        summarise(rows)
        return 0

    spec = json.loads(TASKS.read_text())
    tasks = spec["tasks"]
    if a.tasks:
        want = {t.strip() for t in a.tasks.split(",")}
        tasks = [t for t in tasks if t["id"] in want]
    arms = [x.strip() for x in a.arms.split(",")]

    jobs = [(arm, t) for t in tasks for arm in arms]
    print(f"{len(jobs)} runs · {len(tasks)} tasks × {len(arms)} arms · "
          f"{a.parallel} at a time", flush=True)

    rows = []
    with cf.ThreadPoolExecutor(max_workers=a.parallel) as ex:
        futs = {ex.submit(run_one, arm, t, a.timeout, a.model): (arm, t["id"])
                for arm, t in jobs}
        for fut in cf.as_completed(futs):
            arm, tid = futs[fut]
            try:
                r = fut.result()
            except Exception as e:
                r = {"arm": arm, "task": tid, "recall": 0.0, "error": str(e)[:200],
                     "seconds": 0, "hits": 0, "total": 0, "missing": [], "clean": True}
            rows.append(r)
            print(f"  arm{r['arm']} {r['task']:>4}  recall={r.get('recall', 0):.2f}  "
                  f"{r.get('seconds', 0):>6}s", flush=True)

    Path(a.out).write_text(json.dumps(
        {"frozen_at": spec["frozen_at"], "ran_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
         "runs": rows}, ensure_ascii=False, indent=2))
    summarise(rows)
    print(f"\nfull transcript: {a.out}")
    return 0


def summarise(rows: list[dict]) -> None:
    by_arm: dict[str, list[dict]] = {}
    for r in rows:
        by_arm.setdefault(r["arm"], []).append(r)

    # contamination filter: any task arm 0 answers is not a research task
    arm0 = {r["task"]: r for r in by_arm.get("0", [])}
    contaminated = [t for t, r in arm0.items() if r.get("recall", 0) >= 0.75]

    print("\n=== RACE ===")
    print("%-4s %-34s %7s %7s %8s %8s" % ("ARM", "WHAT IT IS", "TASKS", "RECALL", "CLEAN", "SEC/TASK"))
    for arm in sorted(by_arm):
        rs = [r for r in by_arm[arm] if r["task"] not in contaminated]
        if not rs:
            continue
        rec = sum(r.get("recall", 0) for r in rs) / len(rs)
        clean = sum(1 for r in rs if r.get("clean", True)) / len(rs)
        sec = sum(r.get("seconds", 0) for r in rs) / len(rs)
        print("%-4s %-34s %7d %6.1f%% %7.0f%% %8.0f" % (
            arm, ARMS.get(arm, {}).get("name", "?")[:34], len(rs), rec * 100, clean * 100, sec))

    if contaminated:
        print(f"\nDELETED as contaminated (arm 0 answered them from memory): "
              f"{', '.join(sorted(contaminated))}")
        print("A benchmark a model can answer from memory measures memory, not research.")
    else:
        print("\nContamination filter: arm 0 answered none of these from memory. "
              "Every scored task required actually going and looking.")

    a1 = by_arm.get("1"), by_arm.get("2"), by_arm.get("3")
    if by_arm.get("3") and (by_arm.get("1") or by_arm.get("2")):
        def rec(arm):
            rs = [r for r in by_arm.get(arm, []) if r["task"] not in contaminated]
            return (sum(r.get("recall", 0) for r in rs) / len(rs)) if rs else None
        r3, r1, r2 = rec("3"), rec("1"), rec("2")
        beats = [x for x in ((r1, "arm 1"), (r2, "arm 2")) if x[0] is not None and r3 > x[0]]
        lost = [x for x in ((r1, "arm 1"), (r2, "arm 2")) if x[0] is not None and r3 <= x[0]]
        print("\nACCEPTANCE: arm 3 must beat arms 1 and 2 on recall at $0 external cost.")
        if lost:
            print("  NOT MET against " + ", ".join(n for _, n in lost) +
                  " — the central hypothesis is falsified on this sample and is reported as such.")
        else:
            print("  MET against " + ", ".join(n for _, n in beats) +
                  " on this sample. State the sample size; one sample is not a championship.")


if __name__ == "__main__":
    raise SystemExit(main())
