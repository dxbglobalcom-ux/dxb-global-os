"""Film pairs no model has seen: two films of one account, posted after June 2026, one that reached ten times the account's usual views and one ordinary one.
usage: python3 -I pairs.py            -> pairs.json (every candidate), counts on the screen"""
import collections
import json
import os
import random
import statistics
import time

LAB = os.path.expanduser('~/.local/share/dxb/hook-lab')
D = f'{LAB}/tt_org'
OUT = f'{LAB}/ciftfilm'
FROM = time.mktime(time.strptime('2026-07-01', '%Y-%m-%d'))
TO = time.mktime(time.strptime('2026-11-14', '%Y-%m-%d'))   # eleven days for the views to settle
films, meta = {}, {}
for f in ('list.jsonl', 'list2.jsonl'):
    for x in open(f'{D}/{f}', encoding='utf-8'):
        r = json.loads(x)
        if r.get('films'):
            h = r['handle'].lower()
            films.setdefault(h, {}).update({v['id']: v for v in r['films']})
            meta[h] = {'sector': r.get('sector'), 'handle': r['handle']}


def ok(v):
    return bool(v.get('view_count') and v.get('like_count') is not None and v.get('timestamp') and v.get('duration') and 5 <= v['duration'] <= 150)


out, why = [], collections.Counter()
for h, fs in films.items():
    a = sorted((v for v in fs.values() if ok(v)), key=lambda v: v['timestamp'])
    if len(a) < 20:
        why['short list'] += 1
        continue
    n = len(a)
    for i, w in enumerate(a):
        if not FROM <= w['timestamp'] <= TO:
            continue
        near = a[max(0, i - 15):i] + a[i + 1:i + 16]
        med = statistics.median(v['view_count'] for v in near)
        if med < 300 or w['view_count'] < 10 * med or w['view_count'] < 30000:
            continue
        if w['like_count'] < 0.02 * w['view_count']:
            why['bought or doubtful winner'] += 1
            continue
        los = [v for v in a[max(0, i - 12):i] + a[i + 1:i + 13]
               if FROM <= v['timestamp'] <= TO and abs(v['timestamp'] - w['timestamp']) < 35 * 86400
               and 0.3 * med <= v['view_count'] <= 1.3 * med and 0.5 <= v['duration'] / w['duration'] <= 2]
        if not los:
            why['no ordinary film beside it'] += 1
            continue
        los.sort(key=lambda v: abs(v['timestamp'] - w['timestamp']))
        for l in los[:1]:
            out.append({'handle': meta[h]['handle'], 'sector': meta[h]['sector'], 'median': med, 'win': w, 'lose': l, 'times': round(w['view_count'] / med, 1),
                        'gap': round(w['view_count'] / max(1, l['view_count']), 1), 'days': round(abs(w['timestamp'] - l['timestamp']) / 86400, 1)})
json.dump(out, open(f'{OUT}/pairs.json', 'w'), ensure_ascii=False)
acc = collections.Counter(p['handle'] for p in out)
sec = collections.Counter()
for h in acc:
    sec[next(p['sector'] for p in out if p['handle'] == h)] += 1
print(len(out), 'pairs from', len(acc), 'accounts;', dict(why))
print('accounts by sector', sec.most_common())
print('times the median: median', statistics.median(p['times'] for p in out), '; gap median', statistics.median(p['gap'] for p in out))
