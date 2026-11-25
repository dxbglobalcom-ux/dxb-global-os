"""Viral TikTok films: who the account is and whether it grew. Reads each account's public profile page (followers, bio, link) and, from the listing of
its films, the median views of the films before and after each selected film; writes both into the film's card so that the watcher sees them.

usage: python3 -I ttorg_profile.py <hook-lab>/tt_org
Reads selection.json, list.jsonl, list2.jsonl, txt/<id>.txt; writes profile.jsonl, grow.jsonl; adds an ACCOUNT and a BEFORE/AFTER line to each card (once).
"""
import concurrent.futures
import json
import os
import re
import statistics
import sys
import time
import urllib.request

D = sys.argv[1]
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9'}
sel = json.load(open(f'{D}/selection.json', encoding='utf-8'))
done = {}
if os.path.exists(f'{D}/profile.jsonl'):
    for x in open(f'{D}/profile.jsonl', encoding='utf-8'):
        r = json.loads(x)
        if not r.get('err'):
            done[r['handle']] = r


def profile(h):
    for k in range(3):
        try:
            t = urllib.request.urlopen(urllib.request.Request('https://www.tiktok.com/@' + h, headers=UA), timeout=30).read().decode('utf8', 'replace')
            m = re.search(r'<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>', t, re.S)
            u = json.loads(m.group(1))['__DEFAULT_SCOPE__']['webapp.user-detail']['userInfo']
            a, s = u['user'], u['stats']
            return {'handle': h, 'name': a.get('nickname'), 'bio': a.get('signature'), 'link': (a.get('bioLink') or {}).get('link', ''), 'verified': a.get('verified'),
                    'commerce': (a.get('commerceUserInfo') or {}).get('category') or (a.get('commerceUserInfo') or {}).get('commerceUser'), 'seller': a.get('ttSeller'),
                    'opened': time.strftime('%Y-%m', time.gmtime(a['createTime'])) if a.get('createTime') else '', 'followers': s.get('followerCount'),
                    'hearts': s.get('heartCount'), 'films': s.get('videoCount')}
        except Exception as e:
            err = str(e)[:80]
            time.sleep(2 + 3 * k)
    return {'handle': h, 'err': err}


todo = sorted({x['handle'] for x in sel} - set(done))
with open(f'{D}/profile.jsonl', 'a', encoding='utf-8') as out, concurrent.futures.ThreadPoolExecutor(4) as ex:
    for n, r in enumerate(ex.map(profile, todo), 1):
        out.write(json.dumps(r, ensure_ascii=False) + '\n')
        out.flush()
        if not r.get('err'):
            done[r['handle']] = r
        if n % 50 == 0:
            print('profiles', n, 'of', len(todo), flush=True)
films = {}
for f in ('list.jsonl', 'list2.jsonl'):
    for x in open(f'{D}/{f}', encoding='utf-8'):
        r = json.loads(x)
        if r.get('films'):
            films.setdefault(r['handle'].lower(), {}).update({v['id']: v for v in r['films']})
grow = []
for x in sel:
    L = sorted((v for v in films.get(x['handle'].lower(), {}).values() if v.get('timestamp') and v.get('view_count') is not None), key=lambda v: v['timestamp'])
    i = next((k for k, v in enumerate(L) if v['id'] == x['id']), None)
    g = {'ad_id': x['ad_id'], 'handle': x['handle'], 'sector': x['sector'], 'views': x['views'], 'times': x['times'], 'followers': done.get(x['handle'], {}).get('followers')}
    if i is not None:
        b, a = [v['view_count'] for v in L[max(0, i - 15):i]], [v['view_count'] for v in L[i + 1:i + 16]]
        g.update(n_before=len(b), n_after=len(a), before=statistics.median(b) if b else None, after=statistics.median(a) if a else None)
        if len(b) >= 5 and len(a) >= 5 and g['before']:
            g['grew'] = round(g['after'] / g['before'], 2)
    grow.append(g)
    p = f"{D}/txt/{x['ad_id']}.txt"
    if os.path.exists(p):
        t = open(p, encoding='utf-8').read()
        if '\nACCOUNT ' not in t:
            q = done.get(x['handle'], {})
            one = lambda s: re.sub(r'\s+', ' ', str(s or '')).strip()
            add = f"ACCOUNT {one(q.get('name'))}; followers {q.get('followers')}; films {q.get('films')}; opened {q.get('opened')}; trade label {one(q.get('commerce'))}; bio: {one(q.get('bio'))[:220]}; link: {one(q.get('link'))[:90]}\n" if q else 'ACCOUNT (profile not read)\n'
            if g.get('grew'):
                add += f"BEFORE/AFTER the {g['n_before']} films before it had a median of {int(g['before'])} views, the {g['n_after']} films after it {int(g['after'])} (x{g['grew']})\n"
            t = t.replace('\nTITLE ', '\n' + add + 'TITLE ', 1)
            open(p, 'w', encoding='utf-8').write(t)
with open(f'{D}/grow.jsonl', 'w', encoding='utf-8') as f:
    for g in grow:
        f.write(json.dumps(g, ensure_ascii=False) + '\n')
G = [g['grew'] for g in grow if g.get('grew')]
F = sorted(g['followers'] for g in grow if g.get('followers') is not None)
print('profiles read', len(done), 'of', len({x['handle'] for x in sel}), '| before/after known', len(G), 'median', statistics.median(G) if G else None,
      'at least 2x', sum(1 for g in G if g >= 2), 'fell below 1', sum(1 for g in G if g < 1), '| followers median', F[len(F) // 2] if F else None)
