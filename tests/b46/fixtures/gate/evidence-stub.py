#!/usr/bin/env python3
"""THE LEDGER'S STAND-IN FOR THE COMPLETION GATE (tests/b46/completion-gate.test.ts).

Copied over scripts/evidence.py INSIDE the bench's copy of the engine, never in the repository. It keeps
real state in <run>/evidence.jsonl and answers what the fleet and its stand-in hunter call, in the shapes
the contract fixes (EVIDENCE-B56-K1 §2.1-2.2 and the lead's verdict addition of 2026-09-26): from-ground,
list, fetch, status, batch, add, verdict, verdict-bulk, show. The real evidence.py is Lane A's and has its
own cases; what is measured here is what the FLEET does with the answers.

`batch` cuts a body longer than --max-chars (partial, read_bytes where it stopped) and the next batch
continues a partial row; `status --format json` carries each platform's `owed` = unread + partial +
unjudged. FAKE_STATUS=unreadable makes `status` print nothing and leave with code 2.
"""
import argparse
import fcntl
import json
import os
import sys
from pathlib import Path

ADD = "evidence.py add"
# id · platform · address · title · author · liveness at birth · body at birth · what `fetch` finds there
ROWS = [
    ("L0001", "x", "https://x.com/dev_one/status/1001", "Astra wins the 3D test", "dev_one", "alive",
     "Astra 6 won ten of fifteen tasks. The cost was lower too.", None),
    ("L0002", "x", "https://x.com/dev_two/status/1002", "Fable plans better", "dev_two", "alive",
     "Fable 5.1 plans a refactor better. I keep it for code.", None),
    ("L0003", "x", "https://t.co/abc123", "a short link", None, "unchecked", None, "open"),
    ("L0004", "x", "https://x.com/i/status/1004", "a status link", None, "unchecked", None, "shut"),
    ("L0005", "x", "https://x.com/dev_five/status/1005", "offtopic giveaway", "dev_five", "alive",
     "Win a free phone today, retweet to enter.", None),
    ("L0006", "reddit", "https://www.reddit.com/r/bench/comments/abc/which_one/", "Which one", "u_six", "alive",
     "I moved from Fable to Astra last week.", None),
    ("L0007", "x", "https://x.com/dev_seven/status/1007", "a deleted post", None, "dead", None, None),
]
OPENED = "Astra 6 is cheaper per task. I switched my whole team to it."
COLS = ("discovered", "pending", "relevant", "irrelevant", "duplicate", "inaccessible",
        "read", "partial", "unread", "judged", "unjudged")


def load(run):
    p = run / "evidence.jsonl"
    return [json.loads(x) for x in p.read_text(encoding="utf-8").splitlines() if x.strip()] if p.exists() else []


def save(run, rows):
    (run / "evidence.jsonl").write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8")


def body(run, r):
    p = run / "bodies" / f"{r['id']}.txt"
    return p.read_text(encoding="utf-8") if (r.get("bytes") or 0) > 0 and p.exists() else None


def give_body(run, r, text):
    (run / "bodies").mkdir(exist_ok=True)
    (run / "bodies" / f"{r['id']}.txt").write_text(text, encoding="utf-8")
    r.update(kind="evidence", liveness="alive", bytes=len(text.encode()), passage=text[:300])


def addresses(rows):
    return [r for r in rows if r.get("tool") != ADD]


def main():
    ap = argparse.ArgumentParser(prog="evidence.py")
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("from-ground", "list", "fetch", "status", "batch", "add", "verdict", "verdict-bulk", "show"):
        s = sub.add_parser(name)
        s.add_argument("run")
        if name == "show":
            s.add_argument("id")
    a = sub.choices
    a["list"].add_argument("--platform", required=True)
    a["list"].add_argument("--unread", action="store_true")
    a["list"].add_argument("--no-body", dest="no_body", action="store_true")
    a["fetch"].add_argument("--url", required=True)
    a["fetch"].add_argument("--print", action="store_true")
    a["status"].add_argument("--platform", action="append")
    a["status"].add_argument("--format", choices=("md", "tsv", "json"), default="md")
    a["batch"].add_argument("--hunter", required=True)
    a["batch"].add_argument("--platform", required=True)
    a["batch"].add_argument("--n", type=int, default=10)
    a["batch"].add_argument("--max-chars", type=int, default=20000)
    for k in ("--url", "--quote"):
        a["add"].add_argument(k, required=True)
    for k in ("--author", "--date", "--title"):
        a["add"].add_argument(k)
    a["verdict"].add_argument("--hunter", required=True)
    a["verdict"].add_argument("--id", required=True)
    a["verdict"].add_argument("--verdict", required=True, choices=("evidence", "none"))
    a["verdict"].add_argument("--reason")
    a["verdict-bulk"].add_argument("--hunter", required=True)
    a["verdict-bulk"].add_argument("--json", required=True)
    g = ap.parse_args()
    run = Path(g.run)
    with open(run / "evidence.lock", "a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        return do(g, run, load(run))


def do(g, run, rows):
    if g.cmd == "from-ground":
        rows = []
        for i, p, u, t, who, live, text, _ in ROWS:
            r = {"id": i, "kind": "discovery", "tool": "ground", "platform": p, "url": u, "url_canonical": u,
                 "title": t, "author": who, "pub_date": "2026-09-20", "liveness": live, "bytes": 0, "hunter": "ground",
                 "triage": "pending", "read_status": "unread", "verdict": None}
            if text:
                give_body(run, r, text)
            rows.append(r)
        save(run, rows)
        for p in dict.fromkeys(r["platform"] for r in rows):
            mine = [r for r in rows if r["platform"] == p]
            print(f"platform={p} found={len(mine)} body={sum(1 for r in mine if r['bytes'])}")
        return 0
    if g.cmd == "list":
        for r in addresses(rows):
            if g.platform not in ("all", r["platform"]) or (g.no_body and body(run, r) is not None):
                continue
            if g.unread and not (r["triage"] == "relevant" and r["read_status"] == "unread"):
                continue
            print(f"{r['id']}\t{r['url']}\t{r['title']}\t{r['liveness']}")
        return 0
    if g.cmd == "show":
        for r in rows:
            if r["id"] == g.id:
                print(json.dumps(r, ensure_ascii=False, indent=2))
                return 0
        return 2
    if g.cmd == "fetch":
        hit = next((r for r in addresses(rows) if r["url"] == g.url), None)
        todo = next((x[7] for x in ROWS if x[2] == g.url), None)
        if hit is None:
            print(f"REFUSED not an address of this bench: {g.url}")
            return 2
        if todo == "shut":
            hit.update(liveness="blocked", triage="inaccessible", triage_reason="HTTP 403")
            save(run, rows)
            print(f"KAPALI KAPI {g.url} HTTP 403")
            return 3
        if body(run, hit) is None:
            give_body(run, hit, OPENED)
            save(run, rows)
        print(f"OK {hit['id']} {hit['bytes']}B {run / 'bodies' / (hit['id'] + '.txt')}")
        return 0
    if g.cmd == "status":
        if os.environ.get("FAKE_STATUS") == "unreadable":
            print("stand-in: the ledger's status cannot be read", file=sys.stderr)
            return 2
        table = {}
        for r in addresses(rows):
            c = table.setdefault(r["platform"], dict.fromkeys(COLS, 0))
            c["discovered"] += 1
            c[r["triage"]] += 1
            if r["triage"] == "relevant":
                c[r["read_status"]] += 1
                if r["read_status"] == "read":
                    c["judged" if r.get("verdict") else "unjudged"] += 1
        want = [p for w in (g.platform or []) for p in w.split(",")]
        table = {p: table.get(p, dict.fromkeys(COLS, 0)) for p in (want or table)}
        for t in table.values():
            t["owed"] = t["unread"] + t["partial"] + t["unjudged"]
        total = {k: sum(t[k] for t in table.values()) for k in (*COLS, "owed")}
        if g.format == "json":
            print(json.dumps({"platforms": table, "total": total, "reconciled": True}))
            return 0
        print("| platform | " + " | ".join(COLS) + " |")
        print("|---|" + "---:|" * len(COLS))
        for p, t in [*table.items(), ("TOTAL", total)]:
            print(f"| {p} | " + " | ".join(str(t[k]) for k in COLS) + " |")
        print("RECONCILED")
        return 0
    if g.cmd == "batch":
        left = [r for r in addresses(rows) if r["platform"] == g.platform and r["triage"] == "relevant"
                and r["read_status"] in ("unread", "partial") and body(run, r) is not None]
        shown, used = [], 0
        for r in left[:g.n]:
            start = (r.get("read_bytes") or 0) if r["read_status"] == "partial" else 0
            whole = body(run, r)
            text = whole[start:]
            if used + len(text) > g.max_chars:
                if shown:
                    break
                text = text[:g.max_chars]
            used += len(text)
            end = start + len(text)
            r.update(read_status="read" if end >= len(whole) else "partial", read_by=g.hunter, read_bytes=end)
            shown.append((r, text, len(whole)))
        save(run, rows)
        for r, text, size in shown:
            print(f"### {r['id']} | @{r['author']} | {r['pub_date']} | {r['url']}\n{text}\n")
            if r["read_status"] == "partial":
                print(f"PARTIAL {r['id']}: bytes 0-{r['read_bytes']} of {size} printed\n")
        owed = sum(1 for r in addresses(rows) if r["platform"] == g.platform and r["read_status"] == "read"
                   and r["triage"] == "relevant" and not r.get("verdict"))
        rest = sum(1 for r in left if r["read_status"] != "read")
        print(f"BATCH: printed {len(shown)} · remaining relevant unread {rest} (platform {g.platform}) · unjudged {owed}"
              if shown or rest else f"BATCH: nothing left — okunacak adres kalmadı · unjudged {owed}")
        return 0
    if g.cmd == "add":
        hit = next((r for r in addresses(rows) if r["url"] == g.url), None)
        text = body(run, hit) if hit else None
        if text is None or g.quote not in text:
            print(f"REFUSED quote not in body: {g.url}")
            return 2
        new = dict(hit, id=f"L{len(rows) + 1:04d}", tool=ADD, kind="evidence", passage=g.quote,
                   hunter=os.environ.get("DXB_HUNTER"), triage="pending", read_status="unread", verdict=None)
        if not hit.get("verdict"):
            hit.update(verdict="evidence", verdict_by=os.environ.get("DXB_HUNTER"))
        save(run, rows + [new])
        print(new["id"])
        return 0
    if g.cmd in ("verdict", "verdict-bulk"):
        items = ([{"id": g.id, "verdict": g.verdict, "reason": g.reason}] if g.cmd == "verdict"
                 else json.loads(Path(g.json).read_text(encoding="utf-8"))["verdicts"])
        for v in items:
            for r in rows:
                if r["id"] == v["id"]:
                    r.update(verdict=v["verdict"], verdict_reason=v.get("reason"), verdict_by=g.hunter)
        save(run, rows)
        print(f"verdicts: {len(items)}")
        return 0
    return 2


if __name__ == "__main__":
    sys.exit(main())
