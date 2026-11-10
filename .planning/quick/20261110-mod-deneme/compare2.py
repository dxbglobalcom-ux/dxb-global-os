#!/usr/bin/env python3
"""Second round of the trial: arm C (two windows) beside arms A and B.

Every run of every arm: requests, input, cache write, cache read, output per
model and the list-price total; then the mean per arm; then arm C per session
and per turn. Prices and cost() come from compare.py.

A run is a list of sessions:
  A, A2, ...  -> runs/session-<run>.id
  B, B2, ...  -> runs/session-<run>.id
  C1, C2, ... -> runs/session-<run>o.id (talk, Opus 5.5) + runs/session-<run>f.id (design, Fable 5.2)
Runs whose id files do not exist are skipped. Turn numbers of arm C are mapped
back to the prompt numbers (talk session turns 1,2,3 -> prompts 1,3,4; design
session turns 1,2 -> prompts 2,5).
"""
import importlib.util
from pathlib import Path

JOB = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location("cmp", JOB / "compare.py")
cmp = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(cmp)
rt, cost = cmp.rt, cmp.cost

PROMPT_OF = {"o": {1: 1, 2: 3, 3: 4}, "f": {1: 2, 2: 5}}
KEYS = ("input", "cache_write", "cache_read", "output", "cost")


def sid(name):
    p = JOB / "runs" / f"session-{name}.id"
    return p.read_text().strip() if p.exists() else None


def load_run(run):
    """[(session-name, session-id, rows)] or None."""
    if run.startswith("C"):
        out = []
        for part in ("o", "f"):
            s = sid(run + part)
            if s is None:
                continue
            rows = rt.requests(s)
            for r in rows:
                r["prompt"] = PROMPT_OF[part].get(r["turn"], f"?{r['turn']}")
            out.append((run + part, s, rows))
        return out or None
    s = sid(run)
    if s is None:
        return None
    rows = rt.requests(s)
    for r in rows:
        r["prompt"] = r["turn"]
    return [(run, s, rows)]


def add(t, r):
    t["requests"] += 1
    for k in KEYS:
        t[k] += r[k]


def zero():
    return dict(requests=0, input=0, cache_write=0, cache_read=0, output=0, cost=0.0)


def fmt(label, t):
    return (f"  {label:<26} req {t['requests']:>5.1f}  in {t['input']:>6.0f}  c.write {t['cache_write']:>8.0f}  "
            f"c.read {t['cache_read']:>8.0f}  out {t['output']:>6.0f}  list$ {t['cost']:.4f}")


def main():
    arms = {"A": ["A", "A2", "A3"], "B": ["B", "B2", "B3"], "C": ["C1", "C2", "C3"]}
    per_arm = {}
    detail = {}
    print("Per run (per model, then ALL)")
    for arm, runs in arms.items():
        for run in runs:
            sessions = load_run(run)
            if sessions is None:
                continue
            by_model, allm = {}, zero()
            for _, _, rows in sessions:
                for r in rows:
                    r["cost"] = cost(r)
                    add(by_model.setdefault(r["model"], zero()), r)
                    add(allm, r)
            print(f"\n{run}  " + "  ".join(f"{n}={s}" for n, s, _ in sessions))
            for m, t in sorted(by_model.items()):
                print(fmt(m, t))
            print(fmt("ALL", allm))
            per_arm.setdefault(arm, []).append((run, allm))
            detail[run] = sessions

    print("\nTable: arm x run -> requests, cache write, cache read, output, list$")
    print("  arm run   req  c.write   c.read  output    list$")
    for arm, lst in per_arm.items():
        for run, t in lst:
            print(f"  {arm:<3} {run:<4} {t['requests']:>4} {t['cache_write']:>8} {t['cache_read']:>8} {t['output']:>7} {t['cost']:>8.4f}")
        n = len(lst)
        mean = {k: sum(t[k] for _, t in lst) / n for k in ("requests",) + KEYS}
        lo = min(t["cost"] for _, t in lst)
        hi = max(t["cost"] for _, t in lst)
        print(f"  {arm:<3} mean {mean['requests']:>4.1f} {mean['cache_write']:>8.0f} {mean['cache_read']:>8.0f} "
              f"{mean['output']:>7.0f} {mean['cost']:>8.4f}   (n={n}, list$ range {lo:.4f}-{hi:.4f})")

    print("\nArm C per session and per turn (prompt number in brackets)")
    for run, sessions in detail.items():
        if not run.startswith("C"):
            continue
        for name, s, rows in sessions:
            print(f"\n  {name}  {s}  model(s) on rows: {sorted({r['model'] for r in rows})}")
            turns = {}
            for r in rows:
                add(turns.setdefault((r["turn"], r["prompt"]), zero()), r)
            for (turn, prompt), t in sorted(turns.items()):
                tools = [x for r in rows if r["turn"] == turn for x in r["tools"]]
                print(f"    turn {turn} [p{prompt}] req {t['requests']}  c.write {t['cache_write']:>6}  c.read {t['cache_read']:>7}  "
                      f"out {t['output']:>5}  list$ {t['cost']:.4f}  tools {','.join(tools) or '-'}")

    print("\nPer prompt, all runs (list$, requests)")
    runs = list(detail)
    print("  prompt " + "".join(f"{r:>16}" for r in runs))
    for p in range(1, 6):
        cells = []
        for run in runs:
            rows = [r for _, _, rs in detail[run] for r in rs if r["prompt"] == p]
            cells.append(f"{sum(r['cost'] for r in rows):>10.4f} ({len(rows)}r)")
        print(f"  p{p:<5} " + "".join(f"{c:>16}" for c in cells))


if __name__ == "__main__":
    main()
