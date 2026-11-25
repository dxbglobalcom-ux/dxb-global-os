"""Second step after merge.py: puts every opening on its shelf, says what its win proves, drops what is no winning opening,
folds one opening told by several sources into one row, and writes the shelf index.

usage: python3 -I shelve.py <hook-lab folder> <library folder>
Reads  <library>/openings.jsonl (merge.py's output), <lab>/SHELVES.md, <lab>/el/raf*/shelf.jsonl (the labelling hands),
       <lab>/raf/decisions.json (the lead's verdicts), <lab>/raf/dupgroups.json (same opening, several sources).
Writes <library>/openings.jsonl (labelled), left-out.jsonl (with the reason), INDEX.md (per shelf: counts and strongest rows).
"""
import collections
import glob
import json
import os
import re
import sys

LAB, OUT = sys.argv[1], sys.argv[2]
text = open(f'{LAB}/SHELVES.md', encoding='utf-8').read()
room_of, meaning, room = {}, {}, None
for line in text.split('\n'):
    m = re.match(r'^## ([A-Z]+)', line)
    if m:
        room = m.group(1)
        continue
    m = re.match(r'^- `([a-z_]+)` — (.*)', line)
    if m and m.group(1) not in ('proves', 'fits'):
        room_of[m.group(1)] = room
        meaning[m.group(1)] = m.group(2)
label = {}
for f in glob.glob(f'{LAB}/el/raf*/shelf.jsonl'):
    for x in open(f, encoding='utf-8'):
        if x.strip():
            r = json.loads(x)
            label[r['id']] = r
D = json.load(open(f'{LAB}/raf/decisions.json', encoding='utf-8'))
groups = json.load(open(f'{LAB}/raf/dupgroups.json', encoding='utf-8')) if os.path.exists(f'{LAB}/raf/dupgroups.json') else []
notsame = {tuple(sorted(x)) for x in D.get('notsame', [])}
groups = [[i for i in g if i not in D.get('split', [])] for g in groups if tuple(sorted(g)) not in notsame] + D.get('same', [])
rows = [json.loads(x) for x in open(f'{OUT}/openings.jsonl', encoding='utf-8') if x.strip()]
by = {r['id']: r for r in rows}
count = collections.Counter()
TT = {}
if os.path.exists(f'{LAB}/ttcc/selection.json'):
    TT = {x['ad_id']: x for x in json.load(open(f'{LAB}/ttcc/selection.json'))}
YT = {}
if os.path.exists(f'{LAB}/yt/selection.json'):
    YT = {x['ad_id']: x for x in json.load(open(f'{LAB}/yt/selection.json'))}


def numbers(r):
    """strength of a watched ad, from its own measures"""
    t = r.get('result', '')
    if r.get('strength') == 'weak':
        return 'weak'
    if r['channel'] == 'meta_ad':
        days = int((re.search(r'(\d[\d,]*)\s*days', t) or [0, '0'])[1].replace(',', ''))
        rank = int((re.search(r'position (\d+)', t) or [0, '999'])[1])
        copies = int((re.search(r'(\d+) ad', t) or [0, '1'])[1])
        return 'solid' if days >= 365 and (rank <= 15 or copies >= 3) else 'usable'
    if r['channel'] == 'tiktok_ad' and r.get('ad_id') in TT:
        x = TT[r['ad_id']]
        return 'solid' if (x.get('ctr_global') or 1) <= 0.03 and (x.get('r2') or 0) >= 39 else 'usable'
    if r.get('ad_id') in YT:
        x = YT[r['ad_id']]
        return 'solid' if x['times'] >= 50 and x['views'] >= 1000000 else 'usable'
    return r.get('strength', 'usable')


for r in rows:
    if r.get('also') and isinstance(r['also'][0], str):
        r['also'] = [{'id': i} for i in r['also']] if not r.get('ad_id') else []
    lab = label.get(r['id'])
    if lab:
        r.update(shelf=lab['shelf'], shelf2=lab.get('shelf2', ''), proves=lab['proves'], fits=lab['fits'])
    if r['id'] in D['money']:
        r['door'] = 'MONEY'
        r['proves'] = 'whole'
        count['door TEST->MONEY'] += 1
    for tag, ids in D['hold'].items():
        if r['id'] in ids:
            r['hold'] = tag
    if r['id'] in D['doubt']:
        r['doubt'] = (r.get('doubt', '') + '; ' + D['doubt'][r['id']]).strip('; ')
    if r.get('ad_id') or r.get('watched'):
        r['proves'] = r.get('proves') or 'whole'
        if not r.get('kept_strength'):
            r['strength'] = numbers(r)
    r['room'] = room_of.get(r.get('shelf', ''), '')

out = []
for i, why in D['out'].items():
    if i in by:
        out.append({**{k: by[i][k] for k in ('id', 'opening', 'seller', 'result', 'source', 'url')}, 'left_out': why})
        count['left out'] += 1
gone = set(D['out'])

auto = collections.defaultdict(list)
for r in rows:
    k = re.sub(r'[^a-z0-9]+', ' ', re.split(r'\| screen:', r['opening'].lower())[0]).strip()[:70]
    if len(k) >= 30:
        auto[k].append(r['id'])
known = {i for g in groups for i in g}
groups += [g for g in auto.values() if len(g) > 1 and not any(i in known for i in g) and tuple(sorted(g)) not in notsame]
P = {'words': 0, 'whole': 1, 'brand': 2, '': 3, None: 3}
S = {'solid': 0, 'usable': 1, 'weak': 2}
for g in groups:
    g = [i for i in g if i in by and i not in gone]
    if len(g) < 2:
        continue
    g.sort(key=lambda i: (P.get(by[i].get('proves')), S.get(by[i].get('strength'), 1), -len(by[i].get('picture', '')), -len(by[i].get('for_client', ''))))
    head, rest = by[g[0]], [by[i] for i in g[1:]]
    head['also'] = [{'id': x['id'], 'source': x['source'], 'result': x['result']} for x in rest]
    if not head.get('picture'):
        head['picture'] = next((x['picture'] for x in rest if x.get('picture')), '')
    gone |= {x['id'] for x in rest}
    count['same opening, other source'] += len(rest)

keep = [r for r in rows if r['id'] not in gone]
bad = [r['id'] for r in keep if not r.get('shelf') or r['shelf'] not in room_of or r.get('proves') not in ('words', 'whole', 'brand')]
with open(f'{OUT}/openings.jsonl', 'w', encoding='utf-8') as f:
    for r in keep:
        f.write(json.dumps(r, ensure_ascii=False) + '\n')
with open(f'{OUT}/left-out.jsonl', 'w', encoding='utf-8') as f:
    for r in out:
        f.write(json.dumps(r, ensure_ascii=False) + '\n')

live = [r for r in keep if not r.get('hold')]
lines = ['# The shelves — how many winners stand on each, and the strongest', '',
         'Written by `shelve.py`; what each shelf means is in `SHELVES.md`. `words` = only the opening differed · `whole` = the whole ad won · `brand` = only the brand grew. Rows on hold are not counted.', '']
for rm in dict.fromkeys(room_of.values()):
    keys = [k for k in room_of if room_of[k] == rm]
    n = sum(1 for r in live if r['shelf'] in keys)
    lines.append(f'## {rm} — {n}')
    for k in keys:
        L = [r for r in live if r['shelf'] == k]
        c = collections.Counter(r['proves'] for r in L)
        film = sum(1 for r in L if r['channel'] in ('tiktok_ad', 'meta_ad', 'youtube_ad', 'short_organic', 'tv', 'youtube_long') and r.get('picture'))
        lines.append(f"- **{k}** {len(L)} (words {c['words']}, whole {c['whole']}, brand {c['brand']}; filmed {film}) — {meaning[k]}")
        L.sort(key=lambda r: (P[r['proves']], S.get(r['strength'], 1)))
        for r in L[:3]:
            lines.append(f"  - {r['opening'][:110].strip()} — {r['seller'][:40]} · {r['result'][:90]} `{r['id']}`")
    lines.append('')
open(f'{OUT}/INDEX.md', 'w', encoding='utf-8').write('\n'.join(lines))
print('kept', len(keep), '| usable now', len(live), '| on hold', len(keep) - len(live), '|', dict(count), '| without labels', len(bad), bad[:10])
for k in ('door', 'proves', 'fits', 'strength', 'room', 'channel'):
    print(k, dict(collections.Counter(r.get(k) for r in live).most_common()))
