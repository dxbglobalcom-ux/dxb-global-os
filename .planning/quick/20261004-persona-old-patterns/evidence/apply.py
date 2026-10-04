"""B51 move 5 + approved cards H13/H14 — session-authored replacements, applied exactly.
Every new text below is written by the lead; the script only places it. Prints per-rule counts."""
import re, glob, collections, sys
ROOT = "/home/dxb/DxB Global OS/personas"
DRY = "--dry" in sys.argv
KEEP_R1 = {"social-media/social-scheduler-publisher.md", "security/blockchain-security-auditor.md", "security/iam-secrets-officer.md"}
NOWEB = "this seat holds no web tool — when an outside source is needed it routes the request and never claims a search it did not run"
HANDS_EN = "Hands: this seat works only through the tools its session grants; a surface named below that the session does not grant is routed to its owner, never claimed as done."
HANDS_TR = "Eller: bu koltuk yalnız oturumunun verdiği araçlarla çalışır; aşağıda adı geçen ama oturumun vermediği bir yüzey sahibine yönlendirilir, yapılmış sayılmaz."

H13_OLD = [
 'Discipline DNA (adapted fable-method; Talep §5.12 — "the discipline of Fable 5 and Solo 5.6 Ultra"):',
 '- Plan before execution: understand → plan → execute → verify → report; verification is executed, never assumed; "done" exists only with executed evidence (Evidence-Before-Done).',
 '- Self-review before handoff: output is re-checked against §6 quality criteria before it leaves this persona; handoffs carry complete context and open risks — silent gaps are defects.',
 '- No lazy proposals: every recommendation rests on researched alternatives with strong tooling (ruling D4); mainstream-by-default without research is a violation.',
 'Inheritance: every future persona is created with this section verbatim (hr-factory template); removing or diluting it is a governance violation.',
]
H13_NEW = [
 'Discipline DNA (Talep §5.12):',
 '- Evidence before done: "done" exists only with executed evidence; verification is executed, never assumed (Evidence-Before-Done).',
 '- Complete handoffs: a handoff carries complete context and open risks — silent gaps are defects.',
 '- Researched proposals: every recommendation compares real alternatives with strong tooling and says why the chosen one wins (ruling D4).',
 None,  # the Inheritance line leaves the seat's text (the rule stays in the standard and the HR template)
]

def web(dept, line):
    m = re.match(r'^([^(]*?)\(([^)]*(?:WebSearch/WebFetch|web fetch and search)[^)]*)\)(.*)$', line)
    if not m: return line, False
    pre, inner, rest = m.groups()
    if dept == "strategy" and ("scrapling" in inner or True):
        new = "scrapling, through the strategy profile — no general web search"
    elif dept == "engineering" and "context7" in inner:
        new = "context7 for library documentation — no general web search"
    else:
        new = NOWEB
    return f"{pre}({new}){rest}", True

def fmt(line):
    l = line
    l = l.replace("Format sabittir: CEO tablo standardı — ", "Format: sonuç ilk cümlede; her iddia etiketli — ")
    l = re.sub(r"^Format sabittir: ", "Format: sonuç ilk cümlede; ", l)
    l = re.sub(r"^Fixed format: CEO table standard — ", "Format: the conclusion in the first sentence; every claim labelled — ", l)
    l = re.sub(r"^Fixed format: ", "Format: the conclusion in the first sentence; ", l)
    l = l.replace("CEO tablo standardına girer", "CEO'ya gider, her iddia etiketli").replace("into the CEO table standard", "to the CEO, every claim labelled")
    return l

cnt = collections.Counter(); touched = set()
files = sorted(glob.glob(ROOT + "/**/*.md", recursive=True))
for f in files:
    rel = f.split("personas/")[1]; dept = rel.split("/")[0]
    if rel in ("README.md",) or rel.startswith("_"): continue
    src = open(f).read(); lines = src.split("\n"); out = []; sec = None; tr = None
    for l in lines:
        h = re.match(r"^## (\d+)\.", l)
        if h: sec = int(h.group(1))
        o = l
        # H13 — §12 canon
        if o in H13_OLD:
            i = H13_OLD.index(o); cnt["H13"] += 1
            if H13_NEW[i] is None: continue
            o = H13_NEW[i]
        # R2 — §11 heading
        if o == "## 11. Fable 5 hook binding": o = "## 11. Hook binding"; cnt["R2"] += 1
        if o == "## 11. Fable 5 hook bağlantısı": o = "## 11. Hook bağlantısı"; cnt["R2"] += 1
        # R1 / R7 — fixed reasoning order lead-in
        if rel not in KEEP_R1:
            n = o.replace("Muhakeme sırası sabittir ve atlanamaz:", "Her intent'te şunları tartar:")
            n = re.sub(r"Muhakeme sırası sabittir", "Her işte tartılan sorular", n)
            n = re.sub(r"Fixed (reasoning|pipeline) order", "Questions weighed", n)
            if n != o: cnt["R1"] += 1; o = n
        # R3 — escalation in one sentence
        n = re.sub(r"^Escalation language: one sentence\s*[—–-]?\s*", "Escalation language: plain whole sentences, conclusion first — ", o)
        n = re.sub(r"^Eskalasyon dili: tek cümle\s*[—–-]?\s*", "Eskalasyon dili: düz, tam cümlelerle, önce sonuç: ", n)
        if n != o: cnt["R3"] += 1; o = n
        # R4 — report language vs English artefacts
        if o.startswith("Dil: rapor Türkçe"):
            o = "Dil: CEO'ya rapor Türkçe, her artefakt İngilizce (CEO direktifi 2026-07-12)" + o[len("Dil: rapor Türkçe"):]; cnt["R4"] += 1
        # H14 — fixed format
        if re.match(r"^(Format sabittir|Fixed format)", o):
            o = fmt(o); cnt["H14"] += 1
        # R13 — grader wording on violation
        if o.startswith("On violation: "): o = "When a hook check fails: " + o[len("On violation: "):]; cnt["R13"] += 1
        if o.startswith("İhlalde davranış: "): o = "Hook kontrolü düşerse: " + o[len("İhlalde davranış: "):]; cnt["R13"] += 1
        # R16 — refusal lead-in
        if "Declines with a reason:" in o:
            o = o.replace("Declines with a reason:", "Redirects, naming the reason and the route that works:"); cnt["R16"] += 1
        # R5 — notify_broadcast is a SQL function, not a seat tool
        if o.startswith("notify_broadcast"): cnt["R5-notify"] += 1; continue
        # R5 — web tools the seat does not hold
        n, hit = web(dept, o)
        if hit: cnt["R5-web"] += 1; o = n
        out.append(o)
        # R12/R15 — one Hands line at the head of §9
        if h and sec == 9:
            tr = "Tool kullanımı" in l or "Araç" in l
            out.append(HANDS_TR if "kullanımı" in l else HANDS_EN); cnt["R15-hands"] += 1
    new = "\n".join(out)
    if new != src:
        touched.add(rel)
        if not DRY: open(f, "w").write(new)
print(dict(cnt)); print("files touched:", len(touched))
