"""Picks the parents for one order: the winners a writer starts from, the strongest proof first, spread over the shelves.

usage: python3 -I pick.py --for film|text|mail|page|any [--sector furniture ...] [--job bought|clicked|watched|replied|any]
                          [--known yes|no] [--shelf test --shelf trouble] [--room SHOW] [--n 16] [--lang] [--json]
  --for    film = short film or ad (only rows whose first picture is written) · text = print, post, headline · mail = subject,
           letter, envelope · page = landing headline or button
  --known  no = the client is a seller nobody knows yet: rows that live on a famous brand, face or song are left out
Nothing on hold is ever picked. Every line carries the row id: the writer names it as the parent of what is written.
"""
import argparse
import collections
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FILM = {'tiktok_ad', 'meta_ad', 'youtube_ad', 'short_organic', 'youtube_long', 'tv'}
KIND = {'film': FILM, 'text': {'print', 'other', 'outdoor', 'search_ad', 'meta_ad', 'radio'}, 'mail': {'email', 'letter', 'envelope'}, 'page': {'landing', 'search_ad'}}
NEAR = [{'home_furniture', 'home_services', 'real_estate', 'gadgets'}, {'beauty', 'fashion', 'fitness', 'health_dental'}, {'food', 'travel', 'local_shop'},
        {'software', 'b2b', 'education_books'}, {'toys_family', 'pets', 'education_books'}, {'automotive', 'gadgets', 'b2b', 'home_services'}]
PROOF, HARD = {'words': 3, 'whole': 2, 'brand': 1}, {'solid': 2, 'usable': 1, 'weak': 0}


def score(r, a):
    s = PROOF.get(r.get('proves'), 1) * 1.2 + HARD.get(r.get('strength'), 1) + r.get('beauty', 3) * 0.4
    if a.sector:
        s += 2.5 if r['sector'] in a.sector else 1.0 if any(r['sector'] in g and set(a.sector) & g for g in NEAR) else 0
    if a.job != 'any':
        s += 1.5 if r['outcome'] == a.job else 0
    if a.known == 'no' and r.get('fits') == 'new':
        s += 0.8
    if r['channel'] in ('tiktok_ad', 'meta_ad', 'youtube_ad', 'short_organic'):
        s += 0.8 if a.kind == 'film' else 0
    return s


p = argparse.ArgumentParser()
p.add_argument('--for', dest='kind', default='any')
p.add_argument('--sector', action='append', default=[])
p.add_argument('--job', default='any')
p.add_argument('--known', default='no')
p.add_argument('--shelf', action='append', default=[])
p.add_argument('--room', action='append', default=[])
p.add_argument('--n', type=int, default=16)
p.add_argument('--per', type=int, default=2, help='at most so many per shelf')
p.add_argument('--clean', action='store_true', help='only films that may be shown to anybody')
p.add_argument('--json', action='store_true')
a = p.parse_args()
rows = [json.loads(x) for x in open(f'{HERE}/openings.jsonl', encoding='utf-8') if x.strip()]
L = []
for r in rows:
    if r.get('hold') or (a.kind in KIND and r['channel'] not in KIND[a.kind]) or (a.kind == 'film' and not r.get('picture')):
        continue
    if a.known == 'no' and r.get('fits') == 'known':
        continue
    if (a.shelf and r['shelf'] not in a.shelf) or (a.room and r['room'] not in a.room) or (a.clean and r.get('clean') is False):
        continue
    L.append((score(r, a), r))
L.sort(key=lambda x: -x[0])
shelf, seller, out = collections.Counter(), collections.Counter(), []
for s, r in L:
    if shelf[r['shelf']] >= a.per or seller[r['seller'][:14]] >= 1:
        continue
    shelf[r['shelf']] += 1
    seller[r['seller'][:14]] += 1
    out.append(r)
    if len(out) >= a.n:
        break
if a.json:
    print(json.dumps(out, ensure_ascii=False, indent=1))
else:
    print(f'{len(L)} rows fit; {len(out)} shown')
    for r in out:
        print(f"\n[{r['id']}] {r['room']}/{r['shelf']} · {r['channel']} · {r['sector']} · proves {r['proves']} · {r['strength']}")
        print('  OPEN  ', r['opening'][:200])
        if r.get('picture'):
            print('  SEEN  ', r['picture'][:260])
        print('  WON   ', f"{r['seller'][:50]}: {r['result'][:150]}")
        print('  SHAPE ', r['for_client'][:260])
