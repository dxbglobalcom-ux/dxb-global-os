#!/usr/bin/env python3
import json, os
S = os.path.dirname(os.path.abspath(__file__))
rows = json.load(open(os.path.join(S,"rows2.json"))); tot = json.load(open(os.path.join(S,"totals.json"))); d=json.load(open(os.path.join(S,"collect.json")))
def mb(b): return f"{b/1e6:,.1f} MB"
def esc(s): return s.replace("|","\\|")
L=[]
A=L.append
A("# First cut — what stays and what goes (proposal, nothing deleted)\n")
A("Measured 2026-11-22 on `/home/dxb/DxB Global OS` (master @ 52374cf2 + working tree). Read-only. Scripts and raw data: this folder (`collect.py`, `classify.py`, `refine.py`, `build.py`, `md.py`; `collect.json`, `rows2.json`, `refine.json`, `files.json`). Machine table: `first-cut.tsv`.\n")
A("**Units.** `size` = apparent bytes (what `du -sb` reports), summed by the script from `lstat`; `disk` = allocated blocks. `tracked` = in `git ls-files`; `untracked` = in `git ls-files -o --exclude-standard`; `ignored` = on disk, in neither (git-ignored). Untracked and ignored files are NOT in git history: deleting them is permanent. Tracked files stay recoverable from history.\n")
A("**Reference check.** 16,416 text files scanned (≤3 MB each, text extensions only; `.raw`/`.log`/`.jsonl`/binaries not scanned as citers). Each candidate's name is matched as a path token. Board lines are split at `## Section 5` (line %d): above = OPEN, below = CLOSED. Open rows = the brief's awk command (%d ids). Open-row files = `.planning/board-rows/<open id>.md`; every other row file and `board-rows/archive/` = CLOSED. The generated graph indexes (`.planning/graphs/*`, `graphify-out/*`) name every file and are not counted as citations.\n" % (d["sec5_line"], len(d["open_ids"])))
A("Living = STATE.md · open board · open-row files · temel `PLAN.md` + `reorder/ORDER.md` · `ceo-approvals.json` · `.claude/CLAUDE.md` · `.claude/skills/**` · `HOLDING-OS-MASTER-PLAN/*.md` · `docs/ceo-directives/**` · code that reads the path (tests, scripts, hooks, packages, apps, tools, db, configs).\n")
A("## 1. Totals\n")
A("| class | entries | size | disk | files | tracked files | untracked files | ignored files | tracked bytes | untracked+ignored bytes |")
A("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|")
for k in ["STAYS","GOES","DOUBT","NOT A CANDIDATE"]:
    v=tot[k]; A(f"| {k} | {v['entries']} | {mb(v['bytes'])} | {mb(v['disk'])} | {v['files']:,} | {v['tracked']:,} | {v['untracked']:,} | {v['ignored']:,} | {mb(v['tracked_bytes']) if 'tracked_bytes' in v else '—'} | {mb(v['untracked_bytes']) if 'untracked_bytes' in v else '—'} |")
A("\nCross-check: all rows sum to 5,101,302,869 B / 117,624 files = the full walk of the repository minus `.git` and `node_modules` (exact match). `.planning/quick/` holds 173 job folders (not ~175): STAYS 72, GOES 56, DOUBT 45.\n")
ap=[r for r in rows if r["reason"].startswith("APPROVAL-EVIDENCE ONLY")]
pr=sorted([r for r in rows if r.get("partial_rem")], key=lambda r:-r["partial_rem"])
A(f"**Two STAYS groups the lead should weigh** (kept STAYS by the brief's rule, flagged):\n- **Approval-evidence only** — {len(ap)} quick folders, {mb(sum(r['apparent'] for r in ap))}: the ONLY living record naming them is `ceo-approvals.json` (the evidence line of an accepted item). They are listed in §5 with `APPROVAL-EVIDENCE ONLY`.\n- **Partial** — {len(pr)} staying folders where the living records name only specific files inside; the remainder ({mb(sum(r['partial_rem'] for r in pr))}) is named by nothing living. Table in §6. The three biggest: `20261022-iki-yol` (only `RUNBOOK.md` named, by C41.md:40; 1,856.8 MB / 59,747 untracked+ignored files unnamed), `20261103-web-ders` (only `tracks/4-reklam-olcum.md`, by B28.md; 327.8 MB unnamed), `20261104-web-bedava-aletler` (only `crawl-test/RUN.md`, by B84.md:87; 80.2 MB unnamed).\n")
A("## 2. Readers — what would break\n")
A("""Mechanisms that read a path under `.planning/` or another pile (each `file:line` read in this session):

| reader | reads | runs when |
|---|---|---|
| `scripts/hooks/pre-commit:88` → `tests/b43/records-truth.ts:56,229,309` | `.planning/STATE.md`, the board, `scripts/governance/ceo-approvals.json` | every commit staging a record |
| `scripts/hooks/commit-msg:16` → `tests/b43/records-truth.ts:352` | the staged board | every commit |
| `scripts/hooks/pre-commit:107` → `tests/hooks/opening-budget.ts:65-78` | `.claude/CLAUDE.md`, `.claude/skills/*/SKILL.md`, `.claude/CUPBOARD.md` | commits touching those |
| `scripts/hooks/pre-commit:53` → `scripts/research-ruler.sh` / `tests/b46/research-ruler.ts:419` | `.claude/skills/dxb-research/**`, checks that paths its SKILL.md/ARSENAL.md cite exist | commits touching the research engine |
| `scripts/hooks/post-commit`, `post-checkout` (graphify) | writes `graphify-out/` | every commit / checkout |
| `.claude/hooks/spec-bootstrap.sh:32,123,130-141` | `.planning/STATE.md`, the board | every session start |
| `tests/governance/usage-cost.test.ts:13` | `.planning/quick/20261003-runtime-isolation/usage.mjs` | test suite |
| `tests/b43/motion-graphics.test.ts:1789` | `.planning/quick/20261112-motion-graphics/CONTRACT.md` | test suite |
| `scripts/b36/company-write-watch.mjs:46-47` | `.planning/quick/20260823-construction-company-separation/company-write-baseline.json` | b36 watch |
| `scripts/models/side-by-side.mjs:35` | writes into `.planning/quick/20261009-masa-b51/evidence/` (default) | on run |
| `tools/studio-prompts/kisayol/quarry/build_quarry.py:29-33` | `catalog-*.tsv` in `.planning/quick/20261108-kisayol/` — **none exists today; already broken** | on run |
| `tests/c42/rival-intel-ledger.test.ts:20`; `scripts/rival-intel/next.sh:12`, `fetch.sh:16`, `motion.py:53` | `.planning/research/rival-intel/` (`00-LEDGER.md`) | test suite / on run |
| `tests/b23/graph-is-not-stale.test.ts:10`; `scripts/governance/graph-refresh.mjs:28-29` | `.planning/graphs/` (canon), `graphify-out/` (working) | test suite / `graph:check` |
| `scripts/governance/ledger-truth.mjs:139-146` (+ `tests/governance/ledger-truth.test.ts:33-36`) | flat: `.planning/*`, `.planning/research/*`, `research/study-cards`, `research/rival-intel`, `.planning/board-rows` | `verify:ledger`, test suite |
| `scripts/check-integration-tracker.mjs:17`; `tests/phase6/fixtures/known-facts.json:15-16` | `research/INTEGRATION-TRACKER.md`, `research/STACK.md` | on run / test |
| `scripts/library/intake.mjs:193,230`; `register-media-engines.mjs:49` | every `.md` directly in `.planning/research/`; `research/study-cards/`, `.planning/study-cards/` | library intake run |
| `scripts/board/note-done.mjs:33`, `render.mjs:37,538`, `movement.mjs:31` | `.planning/board-rows/`, `var/board/` | board tools |
| `scripts/governance/sol-dump-sweep.sh:23` (+ test) | deletes ignored files under `.planning/quick/` older than N days — generic | on run |
| `scripts/governance/rules.json:3` | names `.planning/STATE-ARCHIVE.md` | ledger rules |
| `vitest.config.ts:93,98`; tests under `tests/phase4`, `phase6` | `var/construction-gateway-profiles`, `var/construction-memory`, `tmp/outbox-proof` | test suite |

**No GOES entry is read by any of these** (by construction: GOES requires zero hits in code, comments, living records, papers and memory). Deleting a STAYS reader target would break the listed test or script; the commit hooks themselves read only STATE, the board, the approvals ledger, CLAUDE.md, the skills and the research engine — none of which is a candidate.
""")
def table(cls, sortkey=lambda r:-r["apparent"], withsub=False):
    A("| path | size | files | tracked | untracked+ignored | last change | reason |"); A("|---|---:|---:|---:|---:|---|---|")
    for r in sorted([r for r in rows if r["cls"]==cls], key=sortkey):
        A(f"| `{esc(r['path'])}` | {r['apparent']:,} | {r['files']} | {r['tracked']} | {r['untr_all']} | {r['mtime']} | {esc((r.get('sub','')+' — ') if r.get('sub') else '')}{esc(r['reason'])} |")
A("## 3. Inventory — top level and `.planning/`\n")
A("| path | size | files | tracked | untracked | ignored | last change | class |"); A("|---|---:|---:|---:|---:|---:|---|---|")
for c,v in d["inv"].items():
    if v["group"] in ("top","planning"):
        cls = next((r["cls"] for r in rows if r["path"]==c), "(expanded below)")
        A(f"| `{esc(c)}` | {v['apparent']:,} | {v['files']} | {v['tracked']} | {v['untracked']} | {v['ignored']} | {v['mtime']} | {cls} |")
A("\nOther paper piles found: `.raw` 1,541 files / 65.5 MB, `.err` 2,101 / 24.5 MB, `.log` 458 / 9.7 MB, `.out` 190 — all inside `.planning/` (inside the quick folders above). Outside `.planning/`: `.playwright-mcp/` (172 ignored screenshots), `d07-desktop.jpeg`, `.archify/` (2 workflow folders, untracked), `graphify-out/`, `var/` logs, `tmp/outbox-proof`. A nested git repository sits at `.planning/research/watch-links/2026-11-08-archify/src/.git`.\n")
A("## 4. `.planning/quick/` — one line per job folder\n")
A("| folder | class | size | tracked | untracked+ignored | last change |"); A("|---|---|---:|---:|---:|---|")
for r in sorted([r for r in rows if r["path"].startswith(".planning/quick/")], key=lambda r:r["path"]):
    A(f"| `{r['path'][16:]}` | {r['cls']} | {r['apparent']:,} | {r['tracked']} | {r['untr_all']} | {r['mtime']} |")
A("\n## 5. The proposal\n")
A("### STAYS\n"); table("STAYS")
A("\n### GOES\n"); table("GOES")
A("\n### DOUBT\n"); table("DOUBT")
A("\n### NOT A CANDIDATE (code, config, runtime state, generated output)\n"); table("NOT A CANDIDATE", sortkey=lambda r:r["path"])
A("\n## 6. Partial — inside staying folders, what living records name\n")
A("| folder | size | named sub-paths | named bytes | unnamed remainder |"); A("|---|---:|---|---:|---:|")
ref=json.load(open(os.path.join(S,"refine.json")))
for r in pr:
    v=ref[r["path"]]; A(f"| `{r['path']}` | {v['total']:,} | {esc(', '.join(v['subs'][:6]))} | {v['named_bytes']:,} | {r['partial_rem']:,} |")
A("\n## 7. The twenty largest GOES\n")
A("| # | path | size | tracked files | untracked+ignored files | untracked+ignored bytes (permanent on delete) |"); A("|---:|---|---:|---:|---:|---:|")
for i,r in enumerate(sorted([r for r in rows if r["cls"]=="GOES"], key=lambda r:-r["apparent"])[:20],1):
    A(f"| {i} | `{r['path']}` | {r['apparent']:,} | {r['tracked']} | {r['untr_all']} | {r['ub']:,} |")
A("""
## 8. Findings the brief did not anticipate

- **PLAN.md does not cite `research/STACK.md` or `research/web-cupboard/`.** `grep` of `.planning/quick/20261117-temel/PLAN.md` and `reorder/ORDER.md` finds only `.planning/research/rival-intel/00-SYNTHESIS.md` (PLAN) and `research/LITERATURE.md`, `quick/20261014-tahta-sirasi/ORDER.md`, `quick/20261012-b64-is-akisi/PLAN.md` (ORDER). STACK.md stays on `.claude/CLAUDE.md` §5; web-cupboard stays on `.planning/board-rows/B84.md:299`.
- **`build_quarry.py` is already broken:** it reads `catalog-image-general.tsv`, `catalog-image-ads.tsv`, `catalog-video.tsv` from `quick/20261108-kisayol/`; `find` returns none.
- **A previous cleaning exists:** `ceo-approvals.json:1111` — "ROW B50 — THE HOUSE IS CLEANED: his one click on the folder-by-folder list with sizes". Not read further.
- **Memory backup copy inside a job folder:** `quick/20261110-fable-5-2-calisma/yedek/memory/` holds copies of auto-memory files; they name several folders and were counted as papers, not as memory.
- **One `.env` file was opened by the scan script:** `vps/litellm/.env` (the text-extension filter let a dot-file with no extension through). It was only regex-matched; it produced 0 hits; nothing from it was printed or stored except its path in `collect.json`'s source list.

## 9. Not inspected

- Contents of `.raw`, `.log`, `.jsonl`, `.err`, `.out`, images, video, `.docx`/`.odt`, and text files over 3 MB were not scanned as citers (a citation inside them is not seen).
- References written in a way that does not contain the folder name as a path token (e.g. a path assembled from a date variable at runtime) — only the generic readers in §2 were found by hand-grep for `"quick"`, `readdir`, `glob`.
- Whether a running session or service is writing into a folder right now (only last-change dates are reported; folders touched since 2026-11-12 and named by nothing living are DOUBT for that reason).
- Git history: what a tracked folder's last commit was, and whether a deleted tracked folder would be restored by any script.
- `node_modules/` (1,050 MB, ignored) and `.git/` (1,220 MB) — outside the cut; not classified beyond NOT A CANDIDATE.
- Whether CLOSED row text or `STATE-ARCHIVE.md` should count as living — the brief puts closed-row-only citations in DOUBT and I followed it; STATE-ARCHIVE is treated as a staying paper (STATE.md names it).
- The auto-memory directory was scanned (133 files) but no candidate was decided by it.
""")
open(os.path.join(S,"FIRST-CUT.md"),"w").write("\n".join(L)+"\n")
print("lines", len(L))
