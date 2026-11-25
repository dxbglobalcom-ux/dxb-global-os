import collections, importlib.util, json, statistics, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
D = '/home/dxb/.local/share/dxb/hook-lab/yt'
spec = importlib.util.spec_from_file_location('discover', D + '/discover.py')
d = importlib.util.module_from_spec(spec)
spec.loader.exec_module(d)
seeds = [x.rstrip('\n').split('\t') for x in open(D + '/seeds.tsv') if x.strip()]
out, done, empty = [], 0, []


def one(sec, h):
    e = d.yt(f'https://www.youtube.com/@{h}/shorts', 250)
    v = [(x.get('view_count') or 0, x.get('id'), x.get('title') or '') for x in e if x.get('view_count')]
    if len(v) < 20:
        return h, None, []
    med = statistics.median(x[0] for x in v)
    return h, med, [dict(id=i, title=t, views=n, median=round(med), times=round(n / med, 1), listed=len(v), channel=h, channel_id=h, sector=sec, query='@' + h)
                    for n, i, t in v if med >= 300 and n >= 10 * med and n >= 100000]


with ThreadPoolExecutor(5) as ex:
    for fu in as_completed([ex.submit(one, *s) for s in seeds]):
        try:
            h, med, o = fu.result()
            done += 1
            if med is None:
                empty.append(h)
            out += o
        except Exception as e:
            print('ERR', str(e)[:100], flush=True)
        if done % 25 == 0:
            print('channels', done, 'outliers', len(out), flush=True)
json.dump(out, open(D + '/outliers_seeds.json', 'w'), indent=0)
print('SEEDS DONE', done, 'outliers', len(out), 'without shorts', len(empty), empty, flush=True)
