"""The large training set (never an exam): two films of one account, the better at least 6 times the account's usual views (30 neighbours), the other at most the usual, within 60 days, half to twice as long, any date before 14 November 2026.
Films already on this machine (ciftfilm, ciftfilm2, ciftfilm3) are linked, not fetched again."""
import collections, json, os, random, statistics, time
L = os.path.expanduser('~/.local/share/dxb/hook-lab')
D = L + '/ciftfilm4'
films, sec, name = {}, {}, {}
for f in ('list.jsonl', 'list2.jsonl'):
    for x in open(f'{L}/tt_org/{f}', encoding='utf-8'):
        r = json.loads(x)
        if r.get('films'):
            h = r['handle'].lower()
            films.setdefault(h, {}).update({v['id']: v for v in r['films']})
            sec[h], name[h] = r.get('sector'), r['handle']
TO = time.mktime(time.strptime('2026-11-14', '%Y-%m-%d'))
ok = lambda v: bool(v.get('view_count') and v.get('like_count') is not None and v.get('timestamp') and v.get('duration') and 5 <= v['duration'] <= 150 and v['timestamp'] < TO)
out, R = [], random.Random(4)
for h in sorted(films):
    a = sorted((v for v in films[h].values() if ok(v)), key=lambda v: v['timestamp'])
    if len(a) < 20:
        continue
    used, mine = set(), []
    for i, w in enumerate(a):
        med = statistics.median(v['view_count'] for v in a[max(0, i - 15):i] + a[i + 1:i + 16])
        if med < 300 or w['view_count'] < 6 * med or w['view_count'] < 3000 or w['like_count'] < 0.02 * w['view_count']:
            continue
        los = [v for v in a[max(0, i - 12):i] + a[i + 1:i + 13] if abs(v['timestamp'] - w['timestamp']) < 60 * 86400 and 0.15 * med <= v['view_count'] <= med and 0.5 <= v['duration'] / w['duration'] <= 2 and v['id'] not in used]
        if los:
            l = min(los, key=lambda v: abs(v['timestamp'] - w['timestamp']))
            used.add(l['id'])
            mine.append({'handle': name[h], 'sector': sec[h], 'median': med, 'win': w, 'lose': l, 'times': round(w['view_count'] / med, 1)})
    R.shuffle(mine)
    out += mine[:14]          # an account gives at most fourteen pairs
R.shuffle(out)
have = {}
for s in ('ciftfilm3', 'ciftfilm2', 'ciftfilm'):
    for f in os.listdir(f'{L}/{s}/vid'):
        if f.endswith('.mp4'):
            have.setdefault(f[:-4], f'{L}/{s}/vid/{f}')
os.makedirs(D + '/vid', exist_ok=True)
ids = {p[k]['id'] for p in out for k in ('win', 'lose')}
for i in ids & set(have):
    if not os.path.exists(f'{D}/vid/{i}.mp4'):
        os.symlink(have[i], f'{D}/vid/{i}.mp4')
json.dump(out, open(D + '/selection.json', 'w'), ensure_ascii=False)
print('pairs', len(out), 'accounts', len({p['handle'] for p in out}), 'films', len(ids), 'here already', len(ids & set(have)), 'to fetch', len(ids - set(have)))
print(collections.Counter(p['sector'] for p in out).most_common())
