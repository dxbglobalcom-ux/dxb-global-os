import json, re, html, os, glob, collections
LAB = '/home/dxb/.local/share/dxb/hook-lab'
OLD = '/tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook'
src = {}
for hand in sorted(os.listdir(LAB + '/el')):
    p = f'{LAB}/el/{hand}/openings.jsonl'
    if os.path.exists(p):
        for n, l in enumerate(open(p), 1):
            if l.strip():
                r = json.loads(l)
                src[f'o-{hand}-{n:03d}'] = str(r.get('file', '')).replace(OLD, LAB)


def norm(s, tags=False):
    s = html.unescape(str(s))
    if tags:
        s = re.sub(r'<[^>]{1,400}>', ' ', s)
    for a, b in (('­', ''), ('’', "'"), ('‘', "'"), ('“', '"'), ('”', '"'), ('–', '-'), ('—', '-')):
        s = s.replace(a, b)
    s = re.sub(r'-\s*\n\s*', '', s)
    return re.sub(r'[^a-z0-9%$€£]+', '', s.lower())


cache = {}


def text(p):
    if p not in cache:
        raw = open(p, errors='replace').read() if os.path.exists(p) else ''
        cache[p] = norm(raw) + ' ' + norm(raw, True)
    return cache[p]


pairs = [json.loads(l) for l in open(LAB + '/cift/pairs.jsonl')]
c = collections.Counter()
bad = []
for p in pairs:
    f = src.get(p['id'], '')
    t = text(f)
    w = norm(p['winner'])[:120]
    l = norm(p['loser'])[:120]
    wi, li = (w in t) if len(w) > 3 else None, (l in t) if len(l) > 3 else None
    vw = str(p.get('winner_value') or '')
    vl = str(p.get('loser_value') or '')
    num = lambda s: [re.sub(r'[^0-9.]', '', x).strip('.') for x in re.findall(r'\d[\d,]*\.?\d*', s)]
    nw = all(norm(x) in t or x.replace(',', '') in t for x in num(vw)) if num(vw) else None
    nl = all(norm(x) in t or x.replace(',', '') in t for x in num(vl)) if num(vl) else None
    p['_chk'] = dict(win=wi, lose=li, wv=nw, lv=nl, src=bool(t.strip()))
    if p['loser_known'] == 'verbatim':
        c['verbatim'] += 1
        c['both in source'] += bool(wi and li)
        c['win only'] += bool(wi and not li)
        c['lose only'] += bool(li and not wi)
        c['neither'] += bool(not wi and not li)
        if not (wi and li):
            bad.append((p['id'], p['pair'], p['winner'][:70], p['loser'][:70], wi, li, os.path.basename(f)))
    if vw and vl:
        c['both values'] += 1
        c['values in source'] += bool(nw and nl)
print(dict(c))
for b in bad[:70]:
    print(b)
json.dump(pairs, open(LAB + '/cift/checked.json', 'w'), ensure_ascii=False)
