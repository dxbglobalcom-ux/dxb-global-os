"""Chooses the organic winners of the listed TikTok accounts: at least ten times the account's own median, and liked, so not bought."""
import collections, json, math, re, statistics, sys, time
sys.path.insert(0, '/home/dxb/.local/share/dxb/hook-lab/venv/lib/python3.12/site-packages')
from langdetect import detect_langs, DetectorFactory
DetectorFactory.seed = 1
D = '/home/dxb/.local/share/dxb/hook-lab/tt_org'
q = {}
for l in open(D + '/seeds2.tsv'):
    s, h, qq, p = l.rstrip('\n').split('\t')
    q[h.lower()] = qq
BAD = re.compile(r'\b(kiss|girlfriend|boyfriend|sexy|bikini|beer|wine|whisk|vodka|cocktail|bourbon|casino|poker|betting|crypto|forex|loan|trump|biden|lingerie|tattoo|pork|bacon|gun|rifle|bullet|drunk|bar\b|dating)\w*', re.I)


def eng(t):
    t = re.sub(r'[#@]\S+', '', t or '')
    t = re.sub(r"[^A-Za-z\s']", ' ', t).strip()
    if len(t) < 10:
        return None
    try:
        return any(x.lang == 'en' and x.prob > 0.5 for x in detect_langs(t))
    except Exception:
        return None


rows, seen = [], set()
for f in ('list.jsonl', 'list2.jsonl'):
    for l in open(f'{D}/{f}'):
        r = json.loads(l)
        if r['handle'].lower() in seen:
            continue
        seen.add(r['handle'].lower())
        rows.append(r)
good, stat = [], collections.Counter()
for r in rows:
    F = [x for x in r['films'] if x.get('view_count')]
    if len(F) < 20:
        stat['few films'] += 1
        continue
    E = [e for e in (eng(x['title']) for x in F[:60]) if e is not None]
    if E and sum(E) / len(E) < 0.6:
        stat['not english'] += 1
        continue
    med = statistics.median(x['view_count'] for x in F)
    for x in F:
        v = x['view_count']
        if v < 10 * med or v < 300000:
            continue
        sh = 100 * (x.get('like_count') or 0) / v
        if sh < 2.0:
            stat['bought or doubtful'] += 1
            continue
        if BAD.search(x.get('title') or '') or not (4 <= (x.get('duration') or 30) <= 240):
            stat['words or length'] += 1
            continue
        good.append(dict(id=str(x['id']), handle=r['handle'], sector=r['sector'], query=q.get(r['handle'].lower(), '@' + r['handle']), title=x['title'], views=v, median=int(med), listed=len(F),
                         times=round(v / max(1, med), 1), likes=x.get('like_count'), like_share=round(sh, 2), comments=x.get('comment_count'), shares=x.get('repost_count'),
                         duration=x.get('duration'), date=time.strftime('%Y-%m-%d', time.gmtime(x['timestamp'])) if x.get('timestamp') else ''))
for x in good:
    x['score'] = math.log(x['times']) + 0.35 * math.log(x['views'])
good.sort(key=lambda x: -x['score'])
per, bysec, sel, ids = collections.Counter(), collections.Counter(), [], set()
CAP = int(sys.argv[1]) if len(sys.argv) > 1 else 30
for x in good:
    if x['id'] in ids or per[x['handle']] >= 2 or bysec[x['sector']] >= CAP:
        continue
    ids.add(x['id']); per[x['handle']] += 1; bysec[x['sector']] += 1
    sel.append(x)
for x in sel:
    x['ad_id'] = 't' + x['id']
    x['url'] = f"https://www.tiktok.com/@{x['handle']}/video/{x['id']}"
    x['card'] = (f"VIDEO {x['ad_id']} | sector {x['sector']} | account @{x['handle']} | found by {x['query']}\n"
                 f"PROOF TikTok, read 25 November 2026: {x['views']} views against the account's own median of {x['median']} over its newest {x['listed']} films: {x['times']} times the median\n"
                 f"LIKES {x['likes']} = {x['like_share']}% of views; comments {x['comments']}; shares {x['shares']}; published {x['date']}; length {x['duration']} s\n"
                 f"TITLE {x['title']}\nADDRESS {x['url']}")
json.dump(sel, open(D + '/selection.json', 'w'), indent=0)
print('accounts', len(rows), dict(stat), 'good', len(good), 'of accounts', len({x['handle'] for x in good}), 'selected', len(sel), dict(bysec))
