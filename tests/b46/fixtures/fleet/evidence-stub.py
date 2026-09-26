#!/usr/bin/env python3
"""THE LEDGER'S STAND-IN, for the fleet's composition case (tests/b46/fleet-by-platform.test.ts).

It is copied over scripts/evidence.py INSIDE the bench's copy of the engine, never in the
repository, and answers the two subcommands the fleet itself calls, in the shapes the contract
fixes (EVIDENCE-B56 "THE CONTRACTS"): `from-ground <run>` prints one `platform=<p> found=<n>
body=<m>` line per platform and writes the rows to <run>/evidence.jsonl; `list <run> --platform
<p> [--unread]` prints TSV `id \t url \t title \t liveness` — `--unread` leaves out an address with a
cached body and, as the real one does, keeps a closed door (it has no body). The real evidence.py is Lane A's and
has its own cases; what is measured here is what the FLEET does with its answers.
"""
import json
import pathlib
import sys

# platform · id · url · title · liveness · body already cached (1) or not (0)
ROWS = [
    ("x", "L0001", "https://x.com/dev_one/status/1001", "Switched back after a week", "unchecked", 0),
    ("x", "L0002", "https://x.com/dev_two/status/1002", "Full text carried by the ground", "alive", 1),
    ("bluesky", "L0003", "https://bsky.app/profile/dev3.bsky.social/post/3k2", "A Bluesky thread", "unchecked", 0),
    ("reddit", "L0004", "https://www.reddit.com/r/bench/comments/abc123/which_one/", "Which one do you use", "unchecked", 0),
    ("web", "L0005", "https://blog.example/why-we-moved-off", "Why we moved off", "unchecked", 0),
    ("youtube", "L0006", "https://www.youtube.com/watch?v=bench01", "Tested for a month", "unchecked", 0),
    ("x", "L0007", "https://x.com/dev_four/status/1004", "A deleted post", "dead", 0),
]

cmd = sys.argv[1] if len(sys.argv) > 1 else ""
if cmd == "from-ground":
    run = pathlib.Path(sys.argv[2])
    with open(run / "evidence.jsonl", "w", encoding="utf-8") as f:
        for p, i, u, t, live, body in ROWS:
            f.write(json.dumps({"id": i, "run_id": run.name, "kind": "evidence" if body else "discovery",
                                "retrieved_at": "2026-09-26T00:00:00Z", "url": u, "url_canonical": u,
                                "source_type": "first-hand", "title": t, "platform": p, "hunter": "ground",
                                "liveness": live, "bytes": 900 if body else 0}) + "\n")
    for p in dict.fromkeys(r[0] for r in ROWS):
        mine = [r for r in ROWS if r[0] == p]
        print(f"platform={p} found={len(mine)} body={sum(r[5] for r in mine)}")
elif cmd == "list":
    plat = sys.argv[sys.argv.index("--platform") + 1]
    for p, i, u, t, live, body in ROWS:
        if p == plat and not ("--unread" in sys.argv and body):
            print(f"{i}\t{u}\t{t}\t{live}")
elif cmd == "status":
    # nothing owed anywhere, so the fleet's completion gate accepts every role
    args = sys.argv[3:]
    plats = args[args.index("--platform") + 1].split(",") if "--platform" in args else ["all"]
    fmt = args[args.index("--format") + 1] if "--format" in args else "md"
    keys = ("discovered", "pending", "relevant", "irrelevant", "duplicate", "inaccessible",
            "read", "partial", "unread", "judged", "unjudged", "owed")
    zeros = dict.fromkeys(keys, 0)
    if fmt == "json":
        print(json.dumps({"platforms": {p: dict(zeros) for p in plats}, "total": dict(zeros),
                          "reconciled": True}))
    else:
        print("RECONCILED")
else:
    print(f"stand-in: no such subcommand here: {cmd}", file=sys.stderr)
    sys.exit(2)
