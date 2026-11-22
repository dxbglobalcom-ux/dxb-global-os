#!/usr/bin/env python3
import json, os, collections
S = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(S,"collect.json")))
inv, hits = d["inv"], d["hits"]
LIVING = ["STATE","BOARD_OPEN","ROWFILE_OPEN","TEMEL_PLAN","TEMEL_ORDER","APPROVALS","CLAUDE_MD","SKILLS","SPECS","DIRECTIVES"]
INDEX_CITERS = (".planning/graphs/", "graphify-out/")   # generated graph indexes name every file; not a citation
RECENT = "2026-11-12"
# Readers verified by hand (file:line read in this session)
READERS = {
 ".planning/quick/20261003-runtime-isolation": ("STAYS","read by a test: tests/governance/usage-cost.test.ts:13 runs .planning/quick/20261003-runtime-isolation/usage.mjs (file exists)"),
 ".planning/quick/20261112-motion-graphics": ("STAYS","read by a test: tests/b43/motion-graphics.test.ts:1789 reads its CONTRACT.md (file exists)"),
 ".planning/quick/20260823-construction-company-separation": ("STAYS","read by a script: scripts/b36/company-write-watch.mjs:46-47 reads company-write-baseline.json (file exists)"),
 ".planning/quick/20261009-masa-b51": ("STAYS","written by a script: scripts/models/side-by-side.mjs:35 defaults its evidence to this folder's evidence/; db/migrations/20261010070000_b51_p4_opus_5_5_takes_its_seats.sql:38 records a path in it as data; also open board rows B65, B69"),
 ".planning/quick/20261108-kisayol": ("DOUBT","named by a reader: tools/studio-prompts/kisayol/quarry/build_quarry.py:29-33 reads catalog-*.tsv from this folder — but no catalog-*.tsv exists there today (find returned nothing), so the reader is already broken; open row files cite it too"),
 ".planning/quick/20261117-temel": ("STAYS","the foundation's own job folder (B85) — stays whole by the brief; named by STATE and the open board"),
}
FIXED = {}  # path -> (class, reason) for non-generic candidates
def F(p,c,r): FIXED[p]=(c,r)
NC = "NOT A CANDIDATE"
for p in ["apps","packages","db","tests","scripts","tools","supabase","construction","vps","node_modules","HOLDING-OS-MASTER-PLAN"]:
    F(p,NC,"code / specs / dependencies — outside the first cut by the brief")
for p in [".claude",".codex",".github",".vscode",".dockerignore",".env",".env.daemon",".env.example",".gitattributes",".gitignore",".gitleaks.toml",".graphifyignore",".mcp.json",".ripgreprc",".scrollcraft.json","DXB.code-workspace","package.json","pnpm-lock.yaml","pnpm-workspace.yaml","tsconfig.base.json","tsconfig.json","tsconfig.tests.json","vitest.config.ts"]:
    F(p,NC,"configuration / mechanism (hooks, settings, tool config) — not a paper")
F(".agents","(expanded)","x"); F("_unused",NC,"Codex mirror of the skills (.agents/skills, 111 of 122 files tracked); read by Codex sessions — mechanism, not a paper")
F(".agents/skills",NC,"Codex mirror of the skills (111 of 122 files tracked); read by Codex sessions — mechanism, not a paper")
F(".codex","(expanded)","x"); F(".codex/config.toml",NC,"Codex config"); F(".codex/hooks",NC,"Codex hooks"); F(".codex/hooks.json",NC,"Codex hooks")
F("AGENTS.md",NC,"Codex's instruction file (counterpart of .claude/CLAUDE.md) — mechanism")
F("README.md",NC,"repository readme — not a job paper")
F(".planning","(expanded)","expanded below"); F("docs","(expanded)","expanded below"); F("var","(expanded)","expanded below"); F("references","(expanded)","expanded below"); F("tmp","(expanded)","expanded below"); F("graphify-out","(expanded)","expanded below"); F(".archify","(expanded)","expanded below")
F(".planning/quick","(expanded)","expanded below"); F(".planning/research","(expanded)","expanded below"); F(".planning/phases","(expanded)","expanded below"); F(".planning/graphs","(expanded)","expanded below"); F(".planning/study-cards","(expanded)","expanded below"); F(".planning/governance","(expanded)","expanded below")
F(".planning/STATE.md","STAYS","the state record itself — read by .claude/hooks/spec-bootstrap.sh:32 and tests/b43/records-truth.ts:56")
F(".planning/board-rows","STAYS","the board's row files — written by scripts/board/note-done.mjs:33, read by tests/b43/records-truth.ts:239 and scripts/governance/ledger-truth.mjs:143")
F(".planning/STATE-ARCHIVE.md","STAYS","named by STATE.md (4 lines) and scripts/governance/rules.json:3; read flat by scripts/governance/ledger-truth.mjs:140 SCOPE")
F(".planning/REQUIREMENTS.md","STAYS","named by ceo-approvals.json (4) and specs (3); read flat by scripts/governance/ledger-truth.mjs:140 SCOPE")
F(".planning/graphs/BUILD.json","STAYS","canonical graph copy: scripts/governance/graph-refresh.mjs:28 CANON, tests/b23/graph-is-not-stale.test.ts:10")
for g in ["GRAPH_REPORT.md","README.md","graph.html","graph.json"]: F(f".planning/graphs/{g}","STAYS","canonical graph copy: scripts/governance/graph-refresh.mjs:28 CANON, tests/b23/graph-is-not-stale.test.ts:10")
F(".planning/study-cards/speaches.md","STAYS","read by scripts/library/intake.mjs:230 (legacy study-card dir)")
F(".planning/governance/model-routing-hierarchy.md","STAYS","named by specs (5) and ceo-approvals.json (3); the model-routing copy the memory index points to")
F(".planning/research/.cache","GOES","ignored cache (.gitignore:25), 22 files from 2026-07-06; only CODE hit is .gitignore")
F(".planning/research/rival-intel","STAYS","read by tests/c42/rival-intel-ledger.test.ts:20, scripts/rival-intel/{next.sh:12,fetch.sh:16,motion.py:53}, scripts/governance/ledger-truth.mjs:142; PLAN.md cites rival-intel/00-SYNTHESIS.md")
F(".planning/research/study-cards","STAYS","read by scripts/library/intake.mjs:230, scripts/library/register-media-engines.mjs:49, scripts/governance/ledger-truth.mjs:141; named by STATE and 14 open-row-file lines")
F(".planning/research/INTEGRATION-TRACKER.md","STAYS","read by scripts/check-integration-tracker.mjs:17 and tests/phase6/fixtures/known-facts.json:16; 9 open-row-file lines")
F(".planning/research/STACK.md","STAYS",".claude/CLAUDE.md §5 names it ('read before installing'); tests/phase6/fixtures/known-facts.json:15")
# top-level papers / CEO material
F("Dış Denetim Raporu","STAYS","named by a spec (HOLDING-OS-MASTER-PLAN); an audit report addressed to the CEO's plan — his material")
F("MUSTS from Fable 5 - English.md","STAYS","named by 3 spec lines in HOLDING-OS-MASTER-PLAN")
F("Solo -kadro denetim raporu.odt","STAYS","named by 3 spec lines; ignored by git (not in history) — an .odt document, likely his own")
F("dashboard ve hamza ornekleri ve complaints","STAYS","the CEO's own samples and complaints (folder name); named by a spec")
F("d07-desktop.jpeg","GOES","a loose screenshot (2026-11-04), untracked, named by nothing")
F(".playwright-mcp","DOUBT","ignored Playwright-MCP screenshot dump (172 files); named by open row file .planning/board-rows/B62.md:16 — check whether B62 needs a file from it; .gitignore:60 says durable evidence is copied into .planning/phases/*/evidence/")
F("docs/ceo-directives","(expanded)","expanded below")
F("docs/kelam","STAYS","named by an open row file and 3 spec lines")
F("docs/source-architecture-notes-sanitized.md","DOUBT","named only by papers: STATE-ARCHIVE.md, research/rival-intel/00-LEDGER.md (stays), research/rival-intel/16-openjarvis-repo.md (stays)")
for n in ["00_READ_FIRST_MASTER_DIRECTIVE.md","DXB_GLOBAL_OS_CEO_MASTER_DIRECTIVE.BACKUP-2026-08-04.docx","DXB_GLOBAL_OS_CEO_MASTER_DIRECTIVE.docx","README.txt","evidence","source"]:
    F(f"docs/ceo-directives/2026-07-reanalysis/{n}","STAYS","the CEO's directives (docs/ceo-directives/) — his material by the brief")
for n in ["ceo-complaints-2026-07-19","ceo-complaints-2026-07-28","design-bank","design-direction","engineering-craft"]:
    F(f"references/{n}","STAYS","references/** is 'the CEO's own documents' (scripts/governance/ledger-truth.mjs:130-132 comment); also named by specs/skills")
F("tmp/outbox-proof","NOT A CANDIDATE","test scratch: written by tests/phase4/{toctou,gate-canary,double-fire}.test.ts and packages/outbox-executor/src/actions/test-write-file.ts:13 — regenerated each run, ignored (.gitignore:43)")
for n in [".graphify_analysis.json",".graphify_labels.json",".graphify_labels.json.sig",".graphify_root","GRAPH_REPORT.md","cache","graph.html","graph.json","manifest.json"]:
    F(f"graphify-out/{n}","NOT A CANDIDATE","graphify's working output: written by scripts/hooks/post-commit (graphify hook) and read by scripts/governance/graph-refresh.mjs:29 WORKING; ignored (.gitignore:28)")
VAR = {
 "var/b36": ("NOT A CANDIDATE","runtime state written/read by scripts/b36/install-company-window.mjs:346 and prove-*.mjs"),
 "var/board": ("NOT A CANDIDATE","board render output: scripts/board/render.mjs:37,538, movement.mjs:31"),
 "var/board-watch.log": ("NOT A CANDIDATE","service log of the board watcher (scripts/board/watch.mjs)"),
 "var/company-read-gateway.log": ("NOT A CANDIDATE","service log (company read gateway)"),
 "var/construction-fixtures": ("NOT A CANDIDATE","empty runtime dir"),
 "var/construction-gateway-profiles": ("NOT A CANDIDATE","read by vitest.config.ts:93"),
 "var/construction-memory": ("NOT A CANDIDATE","read by tests/phase6/memory-drawer.test.ts:65 and vitest.config.ts:98"),
 "var/freeze-guard.log": ("NOT A CANDIDATE","written by scripts/ops/freeze-guard.sh:61; named by open row file B62.md:36"),
 "var/jarvis.log": ("DOUBT","voice daemon log, last written 2026-09-14; named by open row file C38.md:16 and ceo-approvals.json:723,725 — runtime log, not a job paper"),
 "var/measure": ("NOT A CANDIDATE","written by scripts/measure/startup-budget.sh:74,154,358"),
 "var/media-factory": ("NOT A CANDIDATE","runtime dir named by open row file B28.md:17 and ceo-approvals.json:340"),
 "var/research": ("NOT A CANDIDATE","research engine's run store: .claude/skills/dxb-research/fleet/fleet.sh:490-510, tests/b46/completion-gate.test.ts:155 — 443 MB, ignored"),
 "var/scheduler.log": ("NOT A CANDIDATE","read by scripts/hr/wave-monitor.sh:45; scheduler service log"),
 "var/voice": ("NOT A CANDIDATE","packages/voice/src/paths.ts:22"),
}
FIXED.update(VAR)

def citers(c):
    hs = hits[c]
    liv = [h for h in hs if h[0] in LIVING]
    closed = [h for h in hs if h[0] in ("BOARD_CLOSED","ROWFILE_CLOSED")]
    codec = [h for h in hs if h[0]=="CODE" and h[3]=="code" and h[1] not in (".gitignore",)]
    codecom = [h for h in hs if h[0]=="CODE" and h[3]=="comment"]
    temo = [h for h in hs if h[0]=="TEMEL_OTHER"]
    mem = [h for h in hs if h[0]=="MEMORY"]
    pap = [h for h in hs if h[0] in ("PAPER","OTHER_DOC") and not h[1].startswith(INDEX_CITERS)]
    return liv, closed, codec, codecom, temo, mem, pap
def fl(hs, n=4):
    out=[]; seen=set()
    for h in hs:
        k=f"{h[1]}:{h[2]}" + (f" ({h[3]})" if h[0].startswith("BOARD") else "")
        if k in seen: continue
        seen.add(k); out.append(k)
    s = ", ".join(out[:n]); 
    return s + (f" (+{len(out)-n} more)" if len(out)>n else "")

rows = []
for c, v in inv.items():
    if c in FIXED:
        cls, reason = FIXED[c]
        if cls == "(expanded)": continue
    elif c in READERS:
        cls, reason = READERS[c]
    else:
        liv, closed, codec, codecom, temo, mem, pap = citers(c)
        recent = v["mtime"] >= RECENT
        if liv:
            cats = collections.Counter(h[0] for h in liv)
            approvals_only = set(cats) == {"APPROVALS"}
            cls = "STAYS"
            reason = ("named by living records " + ", ".join(f"{k}×{n}" for k,n in cats.items()) + ": " + fl(liv))
            if approvals_only: reason = "APPROVAL-EVIDENCE ONLY — " + reason
        elif codec:
            cls = "DOUBT"; reason = "named in code (not a verified reader — check): " + fl(codec)
        elif recent:
            cls = "DOUBT"; reason = f"touched {v['mtime']} (inside the last 10 days) and named by no living record — may be work in progress of a running session" + (("; named by papers: " + fl(pap,3)) if pap else "")
        elif closed or codecom or temo or mem:
            parts=[]
            if closed: parts.append("closed row/closing evidence: " + fl(closed,3))
            if codecom: parts.append("code comment: " + fl(codecom,2))
            if temo: parts.append("foundation folder's working papers (not PLAN/ORDER): " + fl(temo,2))
            if mem: parts.append("auto-memory: " + fl(mem,2))
            cls = "DOUBT"; reason = "named only by " + "; ".join(parts)
        elif pap:
            cls = "DOUBT"; reason = "named only by other papers: " + fl(pap,3)
        else:
            cls = "GOES"; reason = "named by nothing living, read by nothing (no hit in any living record, code, paper or memory)"
        # research flat .md: intake reads all of them generically
        if c.startswith(".planning/research/") and c.endswith(".md") and cls in ("GOES","DOUBT"):
            cls = "DOUBT"; reason += "; NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat"
    rows.append(dict(path=c, cls=cls, reason=reason, **v))

# second pass: DOUBT 'named only by other papers' — say whether the naming paper itself goes
clsof = {r["path"]: r["cls"] for r in rows}
def owner(p):
    best=None
    for q in clsof:
        if p==q or p.startswith(q.rstrip("/")+"/"):
            if best is None or len(q)>len(best): best=q
    return best
for r in rows:
    if r["cls"]=="DOUBT" and r["reason"].startswith("named only by other papers"):
        _,_,_,_,_,_,pap = citers(r["path"])
        owners = collections.Counter((owner(h[1]) or h[1]) for h in pap)
        oc = collections.Counter(clsof.get(o,"?") for o in owners)
        r["reason"] += " | the naming papers' own class: " + ", ".join(f"{k}×{n}" for k,n in oc.items())
        if set(oc) <= {"GOES","DOUBT"}: r["sub"]="paper-only (namers do not stay)"
        else: r["sub"]="paper-only (a staying paper names it)"
json.dump(rows, open(os.path.join(S,"rows.json"),"w"), ensure_ascii=False, indent=0)
with open(os.path.join(S,"first-cut.tsv"),"w") as f:
    f.write("path\tclass\tsize_bytes\tfiles\ttracked_files\tuntracked_files\treason\n")
    for r in sorted(rows, key=lambda r:(r["cls"], r["path"])):
        f.write("\t".join([r["path"], r["cls"], str(r["apparent"]), str(r["files"]), str(r["tracked"]), str(r["untracked"]+r["ignored"]), r["reason"].replace("\t"," ")])+"\n")
tot = collections.defaultdict(lambda: [0,0,0,0,0,0])
for r in rows:
    t=tot[r["cls"]]; t[0]+=1; t[1]+=r["apparent"]; t[2]+=r["files"]; t[3]+=r["tracked"]; t[4]+=r["untracked"]+r["ignored"]
    t[5]+= sum(sz for p,(sz,*_) in [] )
for k,t in sorted(tot.items()): print(f"{k:18} entries {t[0]:4}  bytes {t[1]:>13,}  files {t[2]:>7}  tracked {t[3]:>6}  untracked+ignored {t[4]:>7}")
