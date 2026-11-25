"""Builds the library's methods from the hands' methods (<lab>/el/yon*/methods.jsonl) and the checking hands' verdicts (<lab>/el/my*/check.jsonl).

usage: python3 -I methods.py <hook-lab folder> <library folder> [--dry]
A method enters only when it stood the checking read (verdict in or narrow) and still has three independent trusted people or three winners of different sellers
in today's library; the lead's own decisions stand in method-decisions.json: out {key: why}, same [[head, other, …]], text {key: {field: value}}, kind {key: "working"}.
A key is <hand>.<line>, e.g. yon2.17. Writes methods.jsonl and METHODS.md.
"""
import collections
import glob
import json
import os
import re
import sys

LAB, OUT = sys.argv[1], sys.argv[2]
DRY = '--dry' in sys.argv
read = lambda f: [json.loads(x) for x in open(f, encoding='utf-8') if x.strip()]
rows = {r['id']: r for r in read(f'{OUT}/openings.jsonl')}
exp = {r['id']: r for r in read(f'{OUT}/../hook-evidence/experience.jsonl')}
base, check = {}, {}
for f in sorted(glob.glob(f'{LAB}/el/yon*/methods.jsonl')):
    h = os.path.basename(os.path.dirname(f))
    for i, m in enumerate(read(f), 1):
        base[f'{h}.{i:02d}'] = m
for f in sorted(glob.glob(f'{LAB}/el/my*/check.jsonl')):
    for c in read(f):
        check[f"{c['file']}.{int(c['i']):02d}"] = c
D = json.load(open(f'{OUT}/method-decisions.json', encoding='utf-8')) if os.path.exists(f'{OUT}/method-decisions.json') else {}
slug = lambda s: re.sub(r'[^a-z0-9]+', '', s.lower())
seller = lambda r: slug(re.split(r' — | - |,|\(|:', r['seller'])[0])[:14]
first = lambda s: re.split(r',|\(|;| — ', s)[0].strip()


def people(m, c):
    """the people the checker left standing; a name of his own finding counts too"""
    drop = {slug(first(x['who'])) for x in c.get('people_drop', [])}
    out, seen = [], set()
    src = {slug(first(p['who'])): p for p in m.get('people', [])}
    for w in c.get('people_ok', []):
        k = slug(first(w))
        if not k or k in seen:
            continue
        seen.add(k)
        p = src.get(k) or next((v for q, v in src.items() if q[:8] == k[:8]), None)
        out.append({'who': p['who'] if p else w, 'row': p.get('row', '') if p else '', 'held_in': (p or {}).get('held_in', '')})
    return out


out, left, tally = {}, {}, collections.Counter()
for k, c in sorted(check.items()):
    m = base[k]
    if c['verdict'] == 'out':
        left[k] = c.get('reason', '')
        continue
    w, sellers = [], set()
    for i in list(c.get('winners_ok', [])) + list(c.get('winners_new', [])):
        r = rows.get(i)
        if r and seller(r) not in sellers:
            sellers.add(seller(r))
            w.append(i)
    P = people(m, c)
    x = {'key': k, 'method': c.get('narrow_to') if c['verdict'] == 'narrow' and c.get('narrow_to') else m['method'], 'name': m['method'],
         'name_tr': c.get('name_tr_fix') or m.get('name_tr', ''), 'shelf': m['shelf'], 'shelf2': m.get('shelf2', ''), 'kind': 'working' if m['shelf'] == 'none' else 'opening',
         'roles': c.get('roles') or [], 'roles_note': c.get('roles_note', ''), 'do_film': c.get('do_film_fix') or m.get('do_film', ''), 'do_words': m.get('do_words', ''),
         'why': m.get('why', ''), 'works_for': m.get('works_for', ''), 'care': m.get('care', ''), 'people': P, 'n_people': len(P), 'winners': w, 'n_winners': len(w),
         'strength': c.get('strength', ''), 'client_story_tr': c.get('story_fix') if c.get('story_fix') is not None and c.get('story_fix') != '' else m.get('client_story_tr', ''),
         'for_client': m.get('for_client', '')}
    x.update(D.get('text', {}).get(k, {}))
    if k in D.get('kind', {}):
        x['kind'] = D['kind'][k]
    x['basis'] = 'both' if len(P) >= 3 and len(w) >= 3 else 'experience' if len(P) >= 3 else 'winners' if len(w) >= 3 else 'none'
    if x['basis'] == 'none':
        left[k] = f'{len(P)} people and {len(w)} winners left after the check'
        continue
    if k in D.get('out', {}):
        left[k] = D['out'][k]
        continue
    out[k] = x
for g in D.get('same', []):
    g = [k for k in g if k in out]
    if len(g) < 2:
        continue
    h = out[g[0]]
    for k in g[1:]:
        o = out.pop(k)
        h.setdefault('also_called', []).append(o['method'])
        names = {slug(first(p['who'])) for p in h['people']}
        h['people'] += [p for p in o['people'] if slug(first(p['who'])) not in names]
        sellers = {seller(rows[i]) for i in h['winners']}
        for i in o['winners']:
            if seller(rows[i]) not in sellers:
                sellers.add(seller(rows[i]))
                h['winners'].append(i)
        h['roles'] = h['roles'] + [r for r in o['roles'] if r not in h['roles']]
        left[k] = 'the same method as ' + g[0]
    h['n_people'], h['n_winners'] = len(h['people']), len(h['winners'])
    h['basis'] = 'both' if h['n_people'] >= 3 and h['n_winners'] >= 3 else h['basis']
for k in [k for k, x in out.items() if x['strength'] == 'thin']:
    left[k] = 'thin: barely at the door (' + check[k].get('reason', '')[:160] + ')'
    out.pop(k)
W = {'strong': 0, 'fair': 1, 'thin': 2, '': 1}
L = sorted(out.values(), key=lambda x: (x['kind'], W.get(x['strength'], 1), -(x['n_people'] + x['n_winners'])))
for n, x in enumerate(L, 1):
    x['id'] = f'm-{n:03d}'
    tally[(x['kind'], x['basis'])] += 1
print('checked', len(check), '| entered', len(L), dict(tally), '| strength', dict(collections.Counter(x['strength'] for x in L)), '| left', len(left))
if DRY:
    sys.exit()
with open(f'{OUT}/../hook-evidence/methods-left.jsonl', 'w', encoding='utf-8') as f:  # not library: what did not pass, with its reason and what speaks against
    for k, m in sorted(base.items()):
        if k not in out:
            f.write(json.dumps({'key': k, 'method': m['method'], 'shelf': m['shelf'], 'basis': m['basis'], 'why_left': left.get(k) or f"{m['basis']}: {m.get('against') or 'fewer than three people and three winners'}",
                                'against': check.get(k, {}).get('against', m.get('against', ''))}, ensure_ascii=False) + '\n')
    for k in out:
        if check[k].get('against'):
            f.write(json.dumps({'key': k, 'method': out[k]['method'], 'entered_as': out[k]['id'], 'against': check[k]['against']}, ensure_ascii=False) + '\n')
with open(f'{OUT}/methods.jsonl', 'w', encoding='utf-8') as f:
    for x in L:
        f.write(json.dumps({'id': x['id'], **{a: b for a, b in x.items() if a != 'id'}}, ensure_ascii=False) + '\n')
room_of, room = {}, None
for line in open(f'{OUT}/SHELVES.md', encoding='utf-8'):
    m = re.match(r'^## ([A-Z]+) — (.*)', line)
    if m:
        room = f'{m.group(1)} — {m.group(2).strip()}'
    m = re.match(r'^- `([a-z_]+)` — ', line)
    if m and m.group(1) not in ('proves', 'fits'):
        room_of[m.group(1)] = room
T = ['# The methods — what many trusted makers say worked, or at least three winners show', '',
     'Written by `methods.py`. A method enters with at least three independent trusted people who did it in their own work, or three winners of different sellers in the library;',
     'each was tried to be brought down by a second reader and narrowed to where it held. Full text in `methods.jsonl`.', '']
for rm in list(dict.fromkeys(room_of.values())) + ['working']:
    G = [x for x in L if (x['kind'] == 'working') == (rm == 'working') and (rm == 'working' or room_of.get(x['shelf']) == rm)]
    if not G:
        continue
    T += [f"## {'HOW THE WORK IS DONE — ways of working, not openings' if rm == 'working' else rm} ({len(G)})", '']
    for x in G:
        T.append(f"- **{x['id']} {x['method']}** — {x['shelf']}; for {', '.join(x['roles'])}; {x['n_people']} people, {x['n_winners']} winners; {x['strength']}")
        if x['do_film'] and x['kind'] == 'opening':
            T.append(f"  - film: {x['do_film'][:420]}")
        if x['do_words'] and x['kind'] == 'opening':
            T.append(f"  - words: {x['do_words'][:260]}")
        T.append(f"  - where: {x['works_for'][:320]}")
        if x['people']:
            T.append('  - who: ' + '; '.join(f"{first(p['who'])}{' (' + p['row'] + ')' if p['row'] else ''}" for p in x['people'][:8]))
        if x['winners']:
            T.append('  - winners: ' + ' '.join(x['winners'][:10]))
    T.append('')
open(f'{OUT}/METHODS.md', 'w', encoding='utf-8').write('\n'.join(T))
