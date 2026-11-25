"""Second step after merge.py: puts every opening on its shelf, says what its win proves, drops what is no winning opening,
folds one opening told by several sources into one row, and writes the shelf index.

usage: python3 -I shelve.py <hook-lab folder> <library folder>
Reads  <library>/openings.jsonl (merge.py's output), <library>/SHELVES.md, <lab>/el/raf*/shelf.jsonl and <lab>/el/oz*/traits.jsonl (the
       labelling hands), <library>/decisions.json (the lead's verdicts: out, out_ads, money, fix, keep, same, notsame, split, doubt),
       <library>/dupgroups.json (same opening, several sources), the selections of the watched films (likes, views, spend).
Writes <library>/openings.jsonl (labelled), left-out.jsonl (with the reason), INDEX.md (per shelf: counts and strongest rows).
The CEO's words of 2026-11-25: rows about insurance, retirement, stocks and banks and rows with a political sender leave; nothing that
failed stays, not even in the smallest part: weak proofs and rows whose win is not clean (<lab>/el/kusur*/verdict.jsonl) leave too.
"""
import collections
import glob
import json
import os
import re
import sys

LAB, OUT = sys.argv[1], sys.argv[2]
text = open(f'{OUT}/SHELVES.md', encoding='utf-8').read()
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
def natural(pattern):
    return sorted(glob.glob(pattern), key=lambda f: [int(x) if x.isdigit() else x for x in re.split(r'(\d+)', f)])


label = {}
for f in natural(f'{LAB}/el/raf*/shelf.jsonl'):
    for x in open(f, encoding='utf-8'):
        if x.strip():
            r = json.loads(x)
            label[r['id']] = r
trait = {}
for f in natural(f'{LAB}/el/oz*/traits.jsonl'):  # a later hand's label replaces an earlier one
    for x in open(f, encoding='utf-8'):
        if x.strip():
            r = json.loads(x)
            trait[r.pop('id')] = r
verdict = {}
for f in natural(f'{LAB}/el/kusur*/verdict.jsonl'):
    for x in open(f, encoding='utf-8'):
        if x.strip():
            r = json.loads(x)
            verdict[r['id']] = r
D = json.load(open(f'{OUT}/decisions.json', encoding='utf-8'))
groups = json.load(open(f'{OUT}/dupgroups.json', encoding='utf-8')) if os.path.exists(f'{OUT}/dupgroups.json') else []
notsame = {tuple(sorted(x)) for x in D.get('notsame', [])}
groups = [[i for i in g if i not in D.get('split', [])] for g in groups if tuple(sorted(g)) not in notsame] + D.get('same', [])
rows = [json.loads(x) for x in open(f'{OUT}/openings.jsonl', encoding='utf-8') if x.strip()]
by = {r['id']: r for r in rows}
count = collections.Counter()
TT = {}
if os.path.exists(f'{LAB}/ttcc/selection.json'):
    TT = {x['ad_id']: x for x in json.load(open(f'{LAB}/ttcc/selection.json'))}
YT = {}
for d in ('yt', 'tt_org', 'tt_org2'):
    if os.path.exists(f'{LAB}/{d}/selection.json'):
        YT.update({x['ad_id']: x for x in json.load(open(f'{LAB}/{d}/selection.json'))})


GROW = {}
for d in ('yt', 'tt_org', 'tt_org2'):
    if os.path.exists(f'{LAB}/{d}/grow.jsonl'):
        for x in open(f'{LAB}/{d}/grow.jsonl', encoding='utf-8'):
            g = json.loads(x)
            GROW[g['ad_id']] = g
ROLE = {'bought': 'sell', 'clicked': 'click', 'replied': 'click', 'watched': 'seen', 'shared': 'seen', 'stopped': 'seen', 'remembered': 'known'}


def role(r):
    """what the opening DID: sell, click, seen, known; followers = the films after it drew at least twice the views of the films before it (ten or more each side)"""
    R = [ROLE.get(r.get('outcome'), 'seen')]
    R += [x for x in (r.get('role') or []) if x not in R]
    g = GROW.get(r.get('ad_id'))
    if g and r['door'] == 'TENFOLD':
        if g.get('followers') is not None:
            r['followers'] = g['followers']
        if g.get('grew') and g['n_before'] >= 10 and g['n_after'] >= 10:
            r['grew'] = g['grew']
            if g['grew'] >= 2 and 'followers' not in R:
                R.append('followers')
    return R


def kept(r):
    """its only proof is that the owner kept paying, mailing or airing it: never told as sold (a running time, a spend tier, bought views, a control mailed for years)"""
    if r['door'] != 'MONEY':
        return False
    return bool(re.match(r'(Meta Ad Library|TikTok Creative Center)', r.get('measured_by', '')) or 'Grand Control' in str(r.get('result'))
                or re.match(r'\d+ (days live|months active)', str(r.get('result'))) or r['id'] in D.get('kept', []))


SOUND = {}
for d in ('yt', 'tt_org', 'tt_org2', 'meta', 'meta2', 'ttcc'):
    if os.path.exists(f'{LAB}/{d}/sound.jsonl'):
        for x in open(f'{LAB}/{d}/sound.jsonl', encoding='utf-8'):
            g = json.loads(x)
            SOUND[g['ad_id']] = g
MUTE = ('no speech', 'no words', 'music only', 'no voice', 'silent', 'no spoken', '(music', 'no sound', '(song', 'song only')


def sound(r):
    """what is heard in the first 3 s, told only where the voice detector and the watcher's words agree"""
    g = SOUND.get(r.get('ad_id'))
    if not g:
        return ''
    said = not any(k in r['opening'].lower().split('| screen')[0] for k in MUTE)
    det = g['speech_from'] is not None and g['speech_from'] < 3 and g['speech_share'] >= 0.1
    if said != det:
        return ''
    if det:
        return 'first word at once' if g['speech_from'] <= 0.3 else f"first word at {g['speech_from']} s"
    return 'no word in the first 3 s' + ('' if g['sound_from'] == 0 else ', no sound at all' if g['sound_from'] is None else f", silent until {g['sound_from']} s")


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
        if x.get('organic') == 'doubt' or (x.get('comments') is not None and x['views'] and x['comments'] / x['views'] < 0.00002):
            return 'weak'
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
    if r['id'] in D.get('keep', []):
        r.pop('hold', None)
    if r['id'] in D['doubt']:
        r['doubt'] = (r.get('doubt', '') + '; ' + D['doubt'][r['id']]).strip('; ')
    if r.get('ad_id') or r.get('watched'):
        r['proves'] = r.get('proves') or 'whole'
        if not r.get('kept_strength'):
            r['strength'] = numbers(r)
    r.update(D.get('fix', {}).get(r['id'], {}))
    if r['id'] in trait:
        r.update(trait[r['id']])
    r['room'] = room_of.get(r.get('shelf', ''), '')
    r['role'] = role(r)
    if kept(r):
        r['kept'] = True
        if r['id'] in D.get('kept', []):
            r['role'] = list(dict.fromkeys('sell' if x == 'seen' else x for x in r['role']))
    if sound(r):
        r['sound'] = sound(r)
    second = verdict.get(r['id'], {})  # the second eye: may it be shown, how strongly the first seconds hold, what stops people
    if isinstance(second.get('show'), bool):
        r['clean'] = second['show']
    if r['id'] in D.get('noshow', []):
        r['clean'] = False
    if second.get('beauty'):
        r['beauty'] = second['beauty']
    if second.get('stops'):
        r['stops'] = second['stops']
    if second.get('same_as') in by and second['same_as'] != r['id']:
        groups.append([second['same_as'], r['id']])

out = []
for i, why in D['out'].items():
    if i in by:
        out.append({**{k: by[i][k] for k in ('id', 'opening', 'seller', 'result', 'source', 'url')}, 'left_out': why})
        count['left out'] += 1
WORD = {'finance': 'left on his word (2026-11-25): insurance, retirement, stocks or banks', 'politics': 'left on his word (2026-11-25): political sender'}
for r in rows:
    why = WORD.get(r.get('hold')) or D.get('out_ads', {}).get(r.get('ad_id', ''))
    v = verdict.get(r['id'], {})
    if not why and v.get('clean') is False and r['id'] not in D.get('cleared', []):
        why = f"not a clean win ({v.get('kind', '')}): {v.get('reason', '')}"
    if not why and re.match(r'o-(ad|to|sek|mb)\d+-', r['id']) and r['id'] not in verdict:
        D['out'][r['id']] = ''  # brought by a later hand, not yet seen by a second eye: waits, is not library and not left out
        count['waiting for the second eye'] += 1
        continue
    if not why and r.get('strength') == 'weak':
        why = 'weak proof: ' + (r.get('doubt') or 'the win is in doubt')[:160]
    if why and r['id'] not in D['out']:
        D['out'][r['id']] = why
        out.append({**{k: r[k] for k in ('id', 'opening', 'seller', 'result', 'source', 'url')}, 'left_out': why})
        count[why.split(':')[0]] += 1
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

live = keep
lines = ['# The shelves — how many winners stand on each, and the strongest', '',
         'Written by `shelve.py`; what each shelf means is in `SHELVES.md`. `words` = only the opening differed · `whole` = the whole ad won · `brand` = only the brand grew. ', '']
for rm in dict.fromkeys(room_of.values()):
    keys = [k for k in room_of if room_of[k] == rm]
    n = sum(1 for r in live if r.get('shelf') in keys)
    lines.append(f'## {rm} — {n}')
    for k in keys:
        L = [r for r in live if r.get('shelf') == k]
        c = collections.Counter(r['proves'] for r in L)
        film = sum(1 for r in L if r['channel'] in ('tiktok_ad', 'meta_ad', 'youtube_ad', 'short_organic', 'tv', 'youtube_long') and r.get('picture'))
        lines.append(f"- **{k}** {len(L)} (words {c['words']}, whole {c['whole']}, brand {c['brand']}; filmed {film}) — {meaning[k]}")
        L.sort(key=lambda r: (P[r['proves']], S.get(r['strength'], 1)))
        for r in L[:3]:
            lines.append(f"  - {r['opening'][:110].strip()} — {r['seller'][:40]} · {r['result'][:90]} `{r['id']}`")
    lines.append('')
open(f'{OUT}/INDEX.md', 'w', encoding='utf-8').write('\n'.join(lines))
print('kept', len(keep), '|', dict(count), '| without labels', len(bad), bad[:10])
print('role', dict(collections.Counter(x for r in live for x in r['role']).most_common()))
for k in ('door', 'proves', 'fits', 'strength', 'room', 'channel'):
    print(k, dict(collections.Counter(r.get(k) for r in live).most_common()))
