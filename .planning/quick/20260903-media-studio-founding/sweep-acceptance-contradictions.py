# KEPT HERE ON 2026-09-16 so the next checker does not re-derive it. Dictated and written by the
# checker session dxb-global-os-e0 (Opus 5) in its own scratchpad; copied into the repository and
# committed by the BUILDER, because the audit law says the checker writes no repo line.
#
# WHAT IT IS FOR, and what it is NOT: ledger-truth.mjs proves every CLAIM of approval is backed by a
# registered one. It does not catch the inverse — a record DENYING an acceptance the ledger holds —
# and that inverse was the whole of the four record defects of 2026-09-16. This is the detector for
# it. It is a SWEEP, not a gate: its DENY pattern is deliberately coarse and does not match subjects,
# so it produces hits, not findings. On the day it was written, 23 hits held ONE real defect; every
# other line was read in context and found honest. READ EVERY HIT BEFORE YOU CALL ANY OF THEM A
# FINDING. Whether this becomes a permanent gate is the CEO's to decide, and he ordered the question
# put to BOTH Codex/Astra and the checker first (his word, 2026-09-16).
#
# READ-ONLY sweep. For every registered CEO acceptance, open the files its own `where` field names
# and look for a sentence still DENYING that his eye passed. Checker session dxb-global-os-e0.
import json,re,os
R="/home/dxb/DxB Global OS"
d=json.load(open(R+"/scripts/governance/ceo-approvals.json",encoding='utf-8'))
DENY=re.compile(r'NOT accepted by his eye|not accepted by his eye|waits only for his eye|WAITS FOR HIS EYE|not yet looked at by him|NOT ACCEPTED BY HIS EYE',re.I)
ACC=re.compile(r'accepted by his eye|göz tmm|onaylı',re.I)
n_entries=0; n_files=0; findings=[]
for k,e in d.items():
    if not isinstance(e,dict): continue
    w=(e.get('what') or '')+' '+(e.get('conditions') or '')
    if not ACC.search(w) and 'accepted' not in k: continue   # acceptance entries only
    n_entries+=1
    where=e.get('where') or ''
    for m in re.finditer(r'[A-Za-z0-9_./-]+\.md',where):
        rel=m.group(0)
        cands=[os.path.join(R,rel)]+[os.path.join(dp,os.path.basename(rel)) for dp,_,fs in os.walk(R+"/.planning") if os.path.basename(rel) in fs]
        path=next((c for c in cands if os.path.isfile(c)),None)
        if not path: continue
        n_files+=1
        for i,line in enumerate(open(path,encoding='utf-8',errors='replace'),1):
            for mm in DENY.finditer(line):
                a=max(0,mm.start()-90); b=min(len(line),mm.end()+90)
                findings.append((k,os.path.relpath(path,R),i,line[a:b].strip()))
print(f"acceptance entries scanned: {n_entries} · files opened from their own `where`: {n_files}")
print(f"contradictions found: {len(findings)}\n")
for k,f,i,txt in findings:
    print(f"- {f}:{i}\n    entry: {k}\n    text : ...{txt}...")
