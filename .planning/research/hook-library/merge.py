"""Gathers every hand's rows into one library file, checks each row's proof once more, and drops exact repeats.

usage: python3 -I merge.py <hook-lab folder> <out folder>
A row enters only when its quote stands in the saved source text (the same rule the hands worked by).
The quotes themselves stay in the hook-lab folder; the repository keeps the opening, its result and its address.
"""
import collections
import html
import json
import os
import re
import sys

LAB, OUT = sys.argv[1], sys.argv[2]
OLD = '/tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook'
cache = {}
HOLD = [('finance', re.compile(r'\b(insurance|insurer|retirement|retire|annuity|pension|investment|investing|stocks?|brokerage|securities|mutual fund|chemical bank|social security|tax exemption|barmer)\b', re.I)),
        ('politics', re.compile(r'\b(obama|republican|democrat\w*|trump|bush center|hoover|heritage foundation|pro-life|abortion|senator|filibuster|care net|american cornerstone|romney|congress)\b', re.I))]


def norm(s, tags=False):
    s = html.unescape(s)
    if tags:
        s = re.sub(r'<[^>]{1,400}>', ' ', s)
    for a, b in (('­', ''), ('’', "'"), ('‘', "'"), ('“', '"'), ('”', '"'), ('–', '-'), ('—', '-')):
        s = s.replace(a, b)
    s = re.sub(r'-\s*\n\s*', '', s)
    return re.sub(r'[^a-z0-9%$€£]+', '', s.lower())


def text(p):
    if p not in cache:
        raw = open(p, errors='replace').read()
        cache[p] = norm(raw) + ' ' + norm(raw, True)
    return cache[p]


counts = collections.Counter()
out = {'openings': [], 'rules': []}
for hand in sorted(os.listdir(f'{LAB}/el')):
    for kind in ('openings', 'rules'):
        p = f'{LAB}/el/{hand}/{kind}.jsonl'
        if not os.path.exists(p):
            continue
        for n, line in enumerate(open(p), 1):
            if not line.strip():
                continue
            r = json.loads(line)
            f = str(r.get('file', '')).replace(OLD, LAB)
            q = norm(str(r.get('quote', '')))
            if not os.path.exists(f) or len(q) < 12 or q not in text(f):
                counts[f'{kind} no proof'] += 1
                continue
            for tag, rx in HOLD:
                if kind == 'openings' and rx.search(str(r.get('opening') or '') + ' ' + str(r.get('seller') or '')):
                    r['hold'] = tag
                    counts[f'hold {tag}'] += 1
                    break
            r.pop('quote', None)
            r['file'] = f.replace(LAB + '/', '')
            r = {'id': f'{"o" if kind == "openings" else "r"}-{hand}-{n:03d}', **r}
            out[kind].append(r)
for kind, rows in out.items():
    seen, keep = {}, []
    for r in rows:
        key = (norm(r.get('opening') or r.get('rule'))[:90], norm(r.get('result', ''))[:40])
        if key in seen:
            counts[f'{kind} repeated'] += 1
            seen[key].setdefault('also', []).append(r['id'])
            continue
        seen[key] = r
        keep.append(r)
    with open(f'{OUT}/{kind}.jsonl', 'w') as f:
        for r in keep:
            f.write(json.dumps(r, ensure_ascii=False) + '\n')
    out[kind] = keep
o = out['openings']
print('openings', len(o), 'rules', len(out['rules']), dict(counts))
for k in ('door', 'outcome', 'strength', 'channel', 'sector'):
    print(k, dict(collections.Counter(r.get(k) for r in o).most_common()))
