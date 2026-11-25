"""Picks the parents for one order: the winners and the methods a writer starts from, the strongest proof first, spread over the shelves.

usage: python3 -I pick.py --for film|text|mail|page|any [--role sell|click|seen|followers|known ...] [--sector furniture ...]
                          [--sells thing|service|place|software|learning|cause|media|job] [--price cheap|mid|dear|free] [--result now|later|unseen|itself]
                          [--need urgent|everyday|considered|impulse|giving|attention] [--known yes|no] [--shelf test …] [--room SHOW …]
                          [--order "name of the client"] [--n 16] [--per 2] [--methods 8] [--clean] [--json]
  --for    film = short film or ad (only rows whose first picture is written) · text = print, post, headline · mail = subject, letter, envelope ·
           page = landing headline or button
  --role   what the film must DO: sell = somebody bought · click = opened, clicked, left a name · seen = watched by strangers, unpaid · followers = the account's
           next films at least doubled · known = remembered
  --sells, --price, --result, --need   what KIND of thing the client sells: winners that sold the same kind of thing come first
  --known  no = the client is a seller nobody knows yet: rows that live on a famous brand, face or song are left out
  --order  the client's name: among rows that fit nearly as well, each client draws others, so that two clients of one trade do not start from the same parents
A third of the list is the trade's own winners, when it has them; for the roles seen and followers the size of the win counts.
With --role, rows that really did that job come first and fill at least two thirds of the list; the rest is there for its power to stop people. A trade with fewer than
five films of that role also gets up to four of its own winners in print, letters and pages at the end of the list.
Every line carries the row id: the writer names it as the parent of what is written.
"""
import argparse
import collections
import hashlib
import json
import math
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
FILM = {'tiktok_ad', 'meta_ad', 'youtube_ad', 'short_organic', 'youtube_long', 'tv'}
KIND = {'film': FILM, 'text': {'print', 'other', 'outdoor', 'search_ad', 'meta_ad', 'radio'}, 'mail': {'email', 'letter', 'envelope'}, 'page': {'landing', 'search_ad'}}
NEAR = [{'home_furniture', 'home_services', 'real_estate', 'gadgets'}, {'beauty', 'fashion', 'fitness', 'health_dental'}, {'food', 'travel', 'local_shop'},
        {'software', 'b2b', 'education_books'}, {'toys_family', 'pets', 'education_books'}, {'automotive', 'gadgets', 'b2b', 'home_services'}]
PROOF, HARD = {'words': 3, 'whole': 2, 'brand': 1}, {'solid': 2, 'usable': 1, 'weak': 0}
WORD = {'sell': 'SOLD', 'paid': 'ITS OWNER KEPT PAYING FOR IT TO SELL', 'click': 'GOT THE CLICK', 'seen': 'WAS SEEN (unpaid)', 'followers': 'MADE THE ACCOUNT GROW', 'known': 'WAS REMEMBERED'}


def size(r):
    """how large the unpaid win was, 0 to 3: the views and the times over the account's own median, in equal parts (a large account's 20 times and a tiny one's 9,000 times both count)"""
    v = re.search(r'([\d.,]+) views', r['result'])
    t = re.search(r'([\d.]+) times|= ?([\d.]+) times|times the[^=]*= ([\d.]+)', r['result'])
    if r['door'] != 'TENFOLD' or not v:
        return 0
    views = float(v.group(1).replace(',', '') or 0)
    times = float(next((g for g in t.groups() if g), '10')) if t else 10
    return max(0, min(3, 0.5 * math.log10(max(times, 1)) + 0.5 * math.log10(max(views / 1e5, 1))))


def score(r, a):
    s = PROOF.get(r.get('proves'), 1) * 1.2 + HARD.get(r.get('strength'), 1) + r.get('beauty', 3) * 0.4
    s += 0.7 * size(r) if 'seen' in a.role or 'followers' in a.role else 0
    if a.sector:
        s += 2.5 if r['sector'] in a.sector else 1.0 if any(r['sector'] in g and set(a.sector) & g for g in NEAR) else 0
    if a.role:
        s += 2.0 if set(r.get('role') or []) & set(a.role) else 0
        s += 1.0 if 'sell' in a.role and 'sell' in (r.get('role') or []) and not paid(r) else 0   # published sales come before 'its owner kept paying'
    s += 1.4 if a.sells and r.get('sells') in a.sells else 0
    s += 1.2 if a.result and r.get('result_seen') in a.result else 0
    s += 0.9 if a.need and r.get('need') in a.need else 0
    s += 0.7 if a.price and r.get('price') in a.price else 0
    if a.known == 'no' and r.get('fits') == 'new':
        s += 0.8
    if a.order:
        s += (0.8 if r['sector'] in a.sector else 1.8) * int(hashlib.sha256(f"{a.order}|{r['id']}".encode()).hexdigest()[:6], 16) / 0xFFFFFF
    if r['channel'] in ('tiktok_ad', 'meta_ad', 'youtube_ad', 'short_organic'):
        s += 0.8 if a.kind == 'film' else 0
    return s


def paid(r):
    """a running time or a spend tier proves that the owner kept paying, not how much was sold"""
    return r['door'] == 'MONEY' and bool(re.match(r'(Meta Ad Library|TikTok Creative Center)', r.get('measured_by', '')))


def did(r):
    """the roles in words"""
    return ' + '.join(WORD['paid' if x == 'sell' and paid(r) else x] for x in r.get('role') or [])


p = argparse.ArgumentParser()
p.add_argument('--for', dest='kind', default='any')
for k in ('role', 'sector', 'sells', 'price', 'result', 'need', 'shelf', 'room'):
    p.add_argument('--' + k, action='append', default=[])
p.add_argument('--known', default='no')
p.add_argument('--order', default='')
p.add_argument('--n', type=int, default=16)
p.add_argument('--per', type=int, default=2, help='at most so many per shelf')
p.add_argument('--methods', type=int, default=8)
p.add_argument('--clean', action='store_true', help='only films that may be shown to anybody')
p.add_argument('--json', action='store_true')
a = p.parse_args()
rows = [json.loads(x) for x in open(f'{HERE}/openings.jsonl', encoding='utf-8') if x.strip()]
L = []
for r in rows:
    if (a.kind in KIND and r['channel'] not in KIND[a.kind]) or (a.kind == 'film' and not r.get('picture')):
        continue
    if a.known == 'no' and r.get('fits') == 'known':
        continue
    if (a.shelf and r['shelf'] not in a.shelf) or (a.room and r['room'] not in a.room) or (a.clean and r.get('clean') is False):
        continue
    L.append((score(r, a), r))
L.sort(key=lambda x: -x[0])
shelf, seller, out = collections.Counter(), collections.Counter(), []
ROLE = set(a.role)
BOTH = [[x for x in L if ROLE & set(x[1].get('role') or [])], [x for x in L if not ROLE & set(x[1].get('role') or [])]] if ROLE else [L]
OWN = [x for x in BOTH[0] if x[1]['sector'] in a.sector] if a.sector else []
for part, room_for in zip([OWN] + BOTH, [a.n // 3] + ([a.n - a.n // 3, a.n] if ROLE else [a.n])):
    for s, r in part:
        if len(out) >= room_for:
            break
        if shelf[r['shelf']] >= a.per or seller[r['seller'][:14]] >= 1 or r in out:
            continue
        shelf[r['shelf']] += 1
        seller[r['seller'][:14]] += 1
        out.append(r)
# a trade with few films of the asked role: its own winners in print, letters and pages come too; their picture is for the film maker to find
if a.kind == 'film' and a.sector and ROLE and sum(1 for r in out if r['sector'] in a.sector and ROLE & set(r.get('role') or [])) < 5:
    more = [(score(r, a), r) for r in rows if r['sector'] in a.sector and r['channel'] not in FILM and ROLE & set(r.get('role') or []) and r['id'] not in {x['id'] for x in out}
            and not (a.known == 'no' and r.get('fits') == 'known')]
    for s, r in sorted(more, key=lambda x: -x[0])[:4]:
        out.append({**r, 'picture': r.get('picture') or '[words only: the picture is for the film maker to find]'})
M = []
if os.path.exists(f'{HERE}/methods.jsonl') and a.methods:
    got = collections.Counter(r['shelf'] for r in out) + collections.Counter(r.get('shelf2') for r in out if r.get('shelf2'))
    mine = {r['id'] for r in out}
    W = {'strong': 2, 'fair': 1, 'thin': 0}
    for x in open(f'{HERE}/methods.jsonl', encoding='utf-8'):
        m = json.loads(x)
        if m.get('kind') == 'working' or (a.kind == 'film' and not m.get('do_film')) or (a.kind in ('text', 'mail', 'page') and not m.get('do_words')):
            continue
        s = W.get(m.get('strength'), 1) + 1.5 * len(mine & set(m.get('winners', []))) + 0.8 * min(2, got[m['shelf']]) + 0.4 * min(1, got[m.get('shelf2')])
        s += 1.0 if a.role and set(a.role) & set(m.get('roles') or []) else 0
        M.append((s, m))
    M.sort(key=lambda x: -x[0])
    M = [m for s, m in M[:a.methods]]
if a.json:
    print(json.dumps({'rows': out, 'methods': M}, ensure_ascii=False, indent=1))
else:
    print(f'{len(L)} rows fit; {len(out)} shown')
    for r in out:
        print(f"\n[{r['id']}] {did(r)} · {r['room']}/{r['shelf']} · {r['channel']} · {r['sector']} · sells {r.get('sells', '?')}, "
              f"{r.get('price', '?')}, result {r.get('result_seen', '?')} · proves {r['proves']} · {r['strength']}")
        print('  OPEN  ', r['opening'][:200])
        if r.get('picture'):
            print('  SEEN  ', r['picture'][:260])
        print('  WON   ', f"{r['seller'][:50]}: {r['result'][:150]}")
        if r.get('depends_on'):
            print('  NEEDS ', r['depends_on'][:220])
        print('  SHAPE ', r['for_client'][:260])
    if M:
        print('\nMETHODS that go with them')
    for m in M:
        print(f"\n({m['id']}) {m['method']} · {m['shelf']} · for {', '.join(m.get('roles') or [])} · {m['n_people']} people, {m['n_winners']} winners · {m.get('strength', '')}")
        print('  DO    ', (m.get('do_film') if a.kind in ('film', 'any') else m.get('do_words') or '')[:260])
        print('  WHERE ', m.get('works_for', '')[:240])
