# The draft checks of plan §4a that a script can run. Reads only; writes nothing.
import re, json, hashlib, sys
ROOT = '/home/dxb/DxB Global OS/'
JOB = ROOT + '.planning/quick/20261117-b43-sozlesme-sayfasi/'
old_raw = open(ROOT + '.planning/board-rows/archive/B43-full-record-to-2026-11-17.md', 'rb').read()
old = old_raw.decode('utf-8').split('\n')
draft_raw = open(sys.argv[1] if len(sys.argv) > 1 else JOB + 'B43.page.md', 'rb').read()
draft = draft_raw.decode('utf-8')
dl = draft.split('\n')
table = open(JOB + 'rules-table.md', encoding='utf-8').read()
mp = open(JOB + 'map.md', encoding='utf-8').read()
led = json.load(open(ROOT + 'scripts/governance/ceo-approvals.json', encoding='utf-8'))
MK = re.compile(r'<!--\s*CEO-OK:\s*([a-z0-9\-]+)\s*-->')
fails = 0
def line(ok, label, val=''):
    global fails
    if not ok: fails += 1
    print(('PASS' if ok else 'FAIL'), '-', label, ('· ' + str(val)) if val != '' else '')

print('old file: %d bytes, %d lines, sha256 %s' % (len(old_raw), len(old) - 1, hashlib.sha256(old_raw).hexdigest()[:16]))
# (a) every CEO-OK id in the draft is a ledger key
ids = MK.findall(draft)
missing = sorted({i for i in ids if i not in led})
line(not missing, '(a) every CEO-OK id in the draft is a key of the ledger', '%d markers, %d distinct, missing %s' % (len(ids), len(set(ids)), missing))
# (b) Done notes block byte-identical to old lines 225-end (the old file ends at line 237, not 240)
oh = old.index('## Done notes')
old_done = '\n'.join(old[oh:len(old) - 1]).encode()
dh = dl.index('## Done notes'); de = next(j for j in range(dh + 1, len(dl)) if re.match(r'#{1,2} ', dl[j]))
while dl[de - 1].strip() == '': de -= 1
new_done = '\n'.join(dl[dh:de]).encode()
line(old_done == new_done, '(b) "## Done notes" block byte-identical to old lines %d-%d' % (oh + 1, len(old) - 1), '%d bytes, sha256 %s = %s' % (len(new_done), hashlib.sha256(old_done).hexdigest()[:12], hashlib.sha256(new_done).hexdigest()[:12]))
# (c) mission-and-vision block byte-identical to old lines 11-17
old_m = '\n'.join(old[10:17]).encode()
mh = next(j for j, l in enumerate(dl) if l.startswith('## Mission and vision'))
new_m = '\n'.join(dl[mh:mh + 7]).encode()
line(old_m == new_m, '(c) mission-and-vision block byte-identical to old lines 11-17', '%d bytes, sha256 %s = %s' % (len(new_m), hashlib.sha256(old_m).hexdigest()[:12], hashlib.sha256(new_m).hexdigest()[:12]))
# (d) the five strings are absent
for s in ['1080 is the ceiling', 'born inside the take', 'Flux plays no part', '$0.00', 'one prompt, one take']:
    line(draft.count(s) == 0, '(d) absent from the draft: "%s"' % s, 'count %d' % draft.count(s))
# (e) L and U spans of out.txt == their rows in map.md
spans = [(m.group(1), m.group(2)) for m in (re.match(r'([LJU]) (\d+-\d+) ', l) for l in open(ROOT + '.planning/quick/20261112-sinir-taramasi/f6/out.txt', encoding='utf-8')) if m]
lu = [(c, o) for c, o in spans if c in 'LU']
rows = re.findall(r'^\| ([LU]) (\d+-\d+) \|', mp, re.M)
line(len(lu) == len(rows) and set(lu) == set(rows) and len(set(rows)) == len(rows), '(e) L+U spans in out.txt == their rows in map.md', 'out.txt L %d + U %d = %d; map rows %d; same set %s' % (sum(c == 'L' for c, _ in lu), sum(c == 'U' for c, _ in lu), len(lu), len(rows), set(lu) == set(rows)))
# extra 1: every map row has exactly one of the four ends
ENDS = {'on the page', 'superseded', 'owned elsewhere', 'history'}
bad = []; n = 0
for l in mp.split('\n'):
    if l.startswith('|') and not re.match(r'\|\s*-', l) and not re.match(r'\| (Span|Lines|Mark) ', l):
        cells = [c.strip() for c in l.strip().strip('|').split(' | ')]
        n += 1
        if cells[2] not in ENDS: bad.append(l[:60])
line(not bad, 'extra: every map row has exactly one end', '%d rows, without an end %d' % (n, len(bad)))
# extra 2: the 22 non-CEO marks of the old file each have a row
marks = [m for l in old for m in re.findall(r'<!--\s*(.*?)\s*-->', l) if not m.startswith('CEO-OK')]
mrows = len(re.findall(r'^\| `<!-- (?:HISTORY|OPEN: B43|STATE: [^`]+|W14-L\d\d|/W14) -->` \|', mp, re.M))
line(len(marks) == mrows, 'extra: non-CEO marks in the old file == their rows in map.md', '%d marks, %d rows' % (len(marks), mrows))
# extra 3: every marker on the page is quoted in rules-table.md; every quoted fragment is a literal substring of that entry
tids = set(re.findall(r'`([a-z0-9\-]+-20\d\d-\d\d-\d\d)`', table))
line(set(ids) <= tids, 'extra: every marker on the page has its row in rules-table.md', 'on the page and not in the table: %s' % sorted(set(ids) - tids))
norm = lambda s: ' '.join(s.split())
nf = 0; nb = 0
for l in table.split('\n'):
    lids = [x for x in re.findall(r'`([a-z0-9\-]+-20\d\d-\d\d-\d\d)`', l) if x in led]
    for q in re.findall(r'«([^»]+)»', l):
        for f in [x.strip() for x in q.split('…') if x.strip()]:
            nf += 1
            if not any(norm(f) in norm(str(led[k].get('what', ''))) + ' || ' + norm(str(led[k].get('conditions', ''))) for k in lids): nb += 1; print('   not found:', f[:80])
line(nb == 0, 'extra: every « » fragment in rules-table.md is a literal substring of the ledger entry named on its row', '%d fragments, %d not found' % (nf, nb))
# extra 4: every R/S/P number named in the map and the table exists on the page
nums = set(re.findall(r'\*\*((?:R|S|P)\d+)[ .]', draft))
used = set(re.findall(r'\b([RSP]\d{1,2})\b', mp + table))
ghost = sorted(used - nums)
line(not ghost, 'extra: every R/S/P number named in map.md and rules-table.md is on the page', 'page has R1-R%d, S1-S%d, P1-P%d; unknown %s' % (max(int(x[1:]) for x in nums if x[0] == 'R'), max(int(x[1:]) for x in nums if x[0] == 'S'), max(int(x[1:]) for x in nums if x[0] == 'P'), ghost))
# extra 5: the W14 block is the old text word for word, minus the one clause named to the lead
L25 = old[24]; seg = L25[82404:91424][len('**THE LEGS:** '):]
i0 = draft.index('- <!-- W14-L01 -->'); i1 = draft.index('<!-- /W14 -->') + len('<!-- /W14 -->')
blk = draft[i0:i1]
flat = ' · '.join(x[2:] for x in blk.split('\n'))
CL = ' with no Flux still anywhere in its history'
line(flat == seg.replace(CL, '') and seg.count(CL) == 1, 'extra: the eleven W14 legs are the old text word for word, minus one clause of leg (11)', '%d characters' % len(flat))
# extra 6: the legs' own grammar (CHECK-W14-2026-09-16.sh, lines 70-112), run on the page
mk = [m.start() for m in re.finditer(r'<!--\s*W14-L(\d\d)\s*-->', draft)]; wid = re.findall(r'<!--\s*W14-L(\d\d)\s*-->', draft)
cl = re.search(r'<!--\s*/W14\s*-->', draft); okg = wid == ['%02d' % k for k in range(1, 12)] and cl is not None
words = {'01': 'two-roads', '02': 'router', '03': 'runpod', '04': 'machine', '05': 'dial', '06': 'scene', '07': 'agency', '08': 'licen', '09': 'backup', '10': 'revision', '11': 'presenter'}
if okg:
    b = mk + [cl.start()]
    for k, (s, e) in enumerate(zip(b[:-1], b[1:])):
        sg = draft[s:e]; nn = wid[k]
        g = all(re.search(re.escape(f) + r'\s*\S', sg) for f in ['owner:', 'finding:', 'deliverable:', 'accept:', 'proves:']) and len(re.findall(r'`[^`]+`', sg)) == 1 and re.search(words[nn], sg, re.I) and re.search(r'status:\s*planned\b', sg) and re.search(r'gate:\s*his word', sg, re.I) and re.search(r'finding:\s*F0\d\d', sg)
        okg = okg and bool(g)
line(okg, 'extra: 11 W14 marks + /W14, each leg with owner · finding · deliverable · accept · one proving command · planned · gate')
# extra 7: the ledger ruler's two claim patterns (ledger-truth.mjs:86-103), run on the page
AC = re.compile(r"\bon (his|the CEO'?s) (own )?(word|order)\b", re.I)
AB = re.compile(r"\b(done|built|closed|purged|deleted|removed|written|registered|corrected|applied|made|taken|cancelled|struck|rewritten|amended|restored|accepted|approved|fixed|merged|installed|enabled|disabled|ran|run)\b[^.!?]{0,60}$", re.I)
QA = re.compile(r'^\s*[*_`]*["“«]')
APP = re.compile(r"\bCEO[- ](APPROVED|approved|accepted)\b|CEO ONAYI VERİLDİ|CEO onayı (verildi|alındı)|CEO kabul etti|Accepted by the CEO|CEO acceptance \d{4}-\d{2}-\d{2}")
ring = []
for j, l in enumerate(dl, 1):
    m = AC.search(l)
    if m and (AB.search(l[:m.start()]) or QA.search(l[m.end():])) and not MK.search(l) and '<!-- OPEN' not in l: ring.append(j)
    if APP.search(l) and not MK.search(l): ring.append(j)
line(not ring, 'extra: no line of the page would ring the ledger ruler\'s claim patterns', 'lines %s' % ring)
# extra 8: his quoted words on the page are in the old file
qs = re.findall(r'\*"([^"]+)"\*', draft); qb = [p for q in qs for p in [x.strip() for x in q.split('…') if x.strip()] if p not in '\n'.join(old)]
line(not qb, 'extra: every quotation of his words on the page is in the old file', '%d quotations, %d not found' % (len(qs), len(qb)))
print('B43.page.md: %d bytes, %d lines · rules-table.md: %d bytes · map.md: %d bytes' % (len(draft_raw), len(dl) - 1, len(table.encode()), len(mp.encode())))
print('RESULT:', 'ALL PASS' if fails == 0 else '%d FAIL' % fails)
sys.exit(1 if fails else 0)
