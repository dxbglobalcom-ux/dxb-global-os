import json, glob, sys, os
J = sys.argv[1]
pat = sys.argv[2] if len(sys.argv) > 2 else "*"
for f in sorted(glob.glob(J + f"/raw/walk/{pat}.jsonl")):
    print("==", os.path.basename(f))
    for l in open(f):
        r = json.loads(l)
        if r["step"] in ("cookies", "end"):
            print("   ", r); continue
        print("  %-13s %5ss %6s ch | %-55s | wall=%s | %s | %s" % (
            r["step"], r.get("secs"), r.get("chars"), (r.get("title") or r.get("error", ""))[:55],
            r.get("wall"), (r.get("url") or "")[:85], (r.get("how", "")[:70] if r["step"] != "1-inner" else "")))
