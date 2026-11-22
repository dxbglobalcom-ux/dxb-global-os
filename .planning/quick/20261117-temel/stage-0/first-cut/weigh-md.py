import json, sys
res = json.load(open(sys.argv[1])); MB = 1048576
def mb(b): return f"{b/MB:,.1f}"
W = [r for r in res if r["verdict"] == "WHOLE"]; N = [r for r in res if r["verdict"] == "NAMED"]; G = [r for r in res if r["verdict"] == "GO"]
lt = sum(r["leave_tracked_bytes"] for r in res); lf = sum(r["leave_final_bytes"] for r in res)
o = []
o.append("# First cut, weighed — what stays and what leaves (nothing deleted yet)\n")
o.append("Weighed by the lead on 2026-11-22 from `FIRST-CUT.md` (the reader's list). Scope: the job papers — `.planning/quick/` — and three piles of generated working output. Research, references, his directives, the board, the specs and all code are outside this cut. Computed by `weigh.py` (read-only), sizes from `lstat`.\n")
o.append("**The rule.** A job folder that is work in hand, or that a living record names whole, or that code reads, stays whole. A folder of which living records name only some files keeps exactly those files. Every other job folder leaves. *Tracked* files that leave stay in git history; *untracked* files that leave are gone for good.\n")
o.append("| | folders | on disk | leaves, kept in history | leaves for good |\n|---|---:|---:|---:|---:|")
for name, g in (("stays whole", W), ("keeps only the named files", N), ("leaves whole", G)):
    o.append(f"| {name} | {len(g)} | {mb(sum(r['bytes'] for r in g))} MB | {mb(sum(r['leave_tracked_bytes'] for r in g))} MB | {mb(sum(r['leave_final_bytes'] for r in g))} MB |")
o.append(f"| **total** | {len(res)} | {mb(sum(r['bytes'] for r in res))} MB | {mb(lt)} MB | {mb(lf)} MB |\n")
o.append("## The ten largest that leave for good\n\n| folder | verdict | leaves for good | files | what stays |\n|---|---|---:|---:|---|")
for r in sorted(res, key=lambda r: -r["leave_final_bytes"])[:10]:
    o.append(f"| `{r['folder']}` | {r['verdict']} | {mb(r['leave_final_bytes'])} MB | {r['leave_final_files']} | {r['why'] if r['verdict']=='NAMED' else '—'} |")
o.append("\n## Stays whole\n\n| folder | on disk | why |\n|---|---:|---|")
for r in sorted(W, key=lambda r: -r["bytes"]): o.append(f"| `{r['folder']}` | {mb(r['bytes'])} MB | {r['why']} |")
o.append("\n## Keeps only the named files\n\n| folder | stays | leaves, in history | leaves for good |\n|---|---|---:|---:|")
for r in sorted(N, key=lambda r: -r["leave_final_bytes"]): o.append(f"| `{r['folder']}` | {r['why'][6:]} | {mb(r['leave_tracked_bytes'])} MB | {mb(r['leave_final_bytes'])} MB |")
o.append("\n## Leaves whole\n\n| folder | in history | for good | why |\n|---|---:|---:|---|")
for r in sorted(G, key=lambda r: -(r["leave_final_bytes"]+r["leave_tracked_bytes"])): o.append(f"| `{r['folder']}` | {mb(r['leave_tracked_bytes'])} MB | {mb(r['leave_final_bytes'])} MB | {r['why']} |")
open(sys.argv[2], "w").write("\n".join(o) + "\n")
