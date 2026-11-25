"""Viral Shorts: did the channel grow after its viral film? Lists each channel's newest 250 Shorts (newest first, with views) and compares the median views of
the 15 films before and the 15 after each selected film. Writes list_channels.jsonl and grow.jsonl (same fields as ttorg_profile.py's).

usage: python3 -I shorts_grow.py <hook-lab>/yt
"""
import concurrent.futures
import json
import os
import statistics
import subprocess
import sys
import time

D = sys.argv[1]
YT = '/home/dxb/.local/bin/yt-dlp'
sel = json.load(open(f'{D}/selection.json', encoding='utf-8'))
fol = {}
for x in open(f'{D}/likes.jsonl', encoding='utf-8'):
    r = json.loads(x)
    fol[r['id']] = r.get('channel_follower_count')
have = {}
if os.path.exists(f'{D}/list_channels.jsonl'):
    for x in open(f'{D}/list_channels.jsonl', encoding='utf-8'):
        r = json.loads(x)
        if r.get('films'):
            have[r['channel_id']] = r['films']


def lst(cid):
    for k in range(3):
        try:
            p = subprocess.run([YT, '--flat-playlist', '--playlist-end', '250', '-J', '--no-warnings', f'https://www.youtube.com/channel/{cid}/shorts'], capture_output=True, text=True, timeout=240)
            if p.returncode == 0 and p.stdout.strip().startswith('{'):
                return cid, [{'id': e.get('id'), 'views': e.get('view_count'), 'title': e.get('title')} for e in json.loads(p.stdout).get('entries') or []]
        except Exception:
            pass
        time.sleep(20 * (k + 1))
    return cid, []


todo = sorted({x['channel_id'] for x in sel} - set(have))
with open(f'{D}/list_channels.jsonl', 'a', encoding='utf-8') as out, concurrent.futures.ThreadPoolExecutor(1) as ex:
    for n, (cid, films) in enumerate(ex.map(lst, todo), 1):
        out.write(json.dumps({'channel_id': cid, 'films': films}, ensure_ascii=False) + '\n')
        out.flush()
        have[cid] = films
        if n % 20 == 0:
            print('channels', n, 'of', len(todo), flush=True)
grow = []
for x in sel:
    L = have.get(x['channel_id']) or []
    i = next((k for k, v in enumerate(L) if v['id'] == x['id']), None)
    g = {'ad_id': x['ad_id'], 'handle': x['channel'], 'sector': x['sector'], 'views': x['views'], 'times': x['times'], 'followers': fol.get(x['id'])}
    if i is not None:
        a = [v['views'] for v in L[max(0, i - 15):i] if v['views'] is not None]
        b = [v['views'] for v in L[i + 1:i + 16] if v['views'] is not None]
        g.update(n_before=len(b), n_after=len(a), before=statistics.median(b) if b else None, after=statistics.median(a) if a else None)
        if len(b) >= 5 and len(a) >= 5 and g['before']:
            g['grew'] = round(g['after'] / g['before'], 2)
    grow.append(g)
with open(f'{D}/grow.jsonl', 'w', encoding='utf-8') as f:
    for g in grow:
        f.write(json.dumps(g, ensure_ascii=False) + '\n')
G = [g['grew'] for g in grow if g.get('grew') and g['n_before'] >= 10 and g['n_after'] >= 10]
print('channels listed', sum(1 for v in have.values() if v), 'of', len({x['channel_id'] for x in sel}), '| before/after known (10+ films each side)', len(G),
      'median', statistics.median(G) if G else None, 'at least 2x', sum(1 for g in G if g >= 2), 'halved', sum(1 for g in G if g <= .5))
