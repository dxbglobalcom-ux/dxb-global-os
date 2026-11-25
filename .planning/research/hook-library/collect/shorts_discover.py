"""Finds organic short videos that reached many times their own channel's median, trade by trade (YouTube Shorts, English).

step 1: search YouTube Shorts for each trade's words (relevance) and keep the channels whose hit has at least 200k views
step 2: list up to 200 newest Shorts of each channel with their view counts, take the median, keep the outliers
Nothing is downloaded here. Output: channels.json, outliers.json. Run: python3 -I discover.py
"""
import collections, json, os, re, statistics, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor, as_completed

D = '/home/dxb/.local/share/dxb/hook-lab/yt'
YT = '/home/dxb/.local/bin/yt-dlp'
Q = {
    'health_dental': ['dentist explains teeth', 'dental clinic before after', 'dentist patient reaction', 'optician glasses shop', 'physiotherapist fixes back pain', 'pharmacist tips', 'hearing aid first time'],
    'food': ['small bakery owner', 'restaurant owner kitchen', 'street food vendor', 'pizza shop owner', 'coffee shop owner making', 'ice cream shop', 'honey beekeeper', 'olive oil farm', 'butcher shop', 'cake decorator order'],
    'home_furniture': ['furniture maker custom table', 'furniture flip before after', 'carpenter woodworking build', 'interior designer home makeover', 'sofa cleaning before after', 'kitchen renovation', 'curtain shop', 'mattress store'],
    'home_services': ['carpet cleaning satisfying', 'pressure washing driveway', 'lawn care satisfying mowing', 'plumber shows mistake', 'electrician explains', 'roofer explains', 'window cleaner', 'handyman house repair', 'pest control found', 'locksmith shows how', 'painter decorator tips'],
    'automotive': ['mechanic shows customer car', 'car detailing dirty interior', 'tire shop', 'car wrap shop', 'used car dealer tips', 'motorcycle repair shop', 'windshield repair'],
    'local_shop': ['barber shop transformation', 'florist bouquet order', 'shoe repair cobbler', 'tailor alters suit', 'jeweler makes ring', 'watch repair restoration', 'bookstore owner', 'small business owner packing orders', 'laundry dry cleaner stain', 'phone repair shop', 'toy store owner'],
    'fashion': ['shoe maker handmade shoes', 'leather bag handmade', 'sneaker restoration', 'suit tailor bespoke', 'clothing brand owner behind the scenes'],
    'beauty': ['soap maker small business', 'perfume maker', 'candle maker small business', 'skincare founder'],
    'fitness': ['gym owner tips', 'physical therapist exercise posture', 'running coach tips', 'bike shop repair'],
    'pets': ['dog groomer transformation', 'veterinarian explains', 'dog trainer tips', 'horse farrier hoof', 'aquarium shop'],
    'real_estate': ['realtor house tour', 'real estate agent tips buyers', 'home inspector finds', 'tiny house tour'],
    'travel': ['hotel room tour unusual', 'travel agent tips', 'tour guide shows', 'airbnb host'],
    'education_books': ['english teacher explains', 'math teacher trick', 'book publisher', 'calligraphy handwriting', 'driving instructor tips', 'language learning tip'],
    'software': ['app founder demo', 'excel trick', 'ai tool demo business', 'web designer explains website', 'iphone trick'],
    'gadgets': ['inventor demonstrates product', 'product test does it work', 'kitchen gadget test', 'tool review workshop'],
    'b2b': ['factory how it is made', 'machinist cnc satisfying', 'construction worker shows', 'concrete contractor', 'welding tips', 'sign maker', 'packaging factory', 'warehouse logistics'],
    'toys_family': ['toy maker', 'lego builder', 'mom hack baby product', 'board game inventor'],
    'media': ['marketing expert ad explained', 'copywriter explains', 'brand logo redesign', 'small business marketing tip'],
}


def yt(url, n):
    for k in range(3):
        p = subprocess.run([YT, '--flat-playlist', '--playlist-end', str(n), '-J', '--no-warnings', url], capture_output=True, text=True, timeout=240)
        if p.returncode == 0 and p.stdout.strip().startswith('{'):
            return json.loads(p.stdout).get('entries') or []
        if 'does not have a shorts tab' in p.stderr or 'not exist' in p.stderr:
            return []
        time.sleep(4 * (k + 1))
    return []


def search(sec, q):
    from urllib.parse import quote
    e = yt('https://www.youtube.com/results?search_query=' + quote(q) + '&sp=EgIQCQ%253D%253D', 60)
    return [(sec, q, x.get('channel_id'), x.get('channel'), x.get('view_count') or 0, x.get('id'), x.get('title')) for x in e if x.get('channel_id')]


if __name__ == '__main__':
    chan = {}
    jobs = [(s, q) for s, L in Q.items() for q in L]
    print('searches', len(jobs), flush=True)
    with ThreadPoolExecutor(4) as ex:
        for fu in as_completed([ex.submit(search, *j) for j in jobs]):
            try:
                for sec, q, cid, name, views, vid, title in fu.result():
                    c = chan.setdefault(cid, dict(id=cid, name=name, sector=sec, best=0, hits=0, query=q))
                    c['hits'] += 1
                    if views > c['best']:
                        c.update(best=views, sector=sec, query=q)
            except Exception as e:
                print('SEARCH ERR', str(e)[:120], flush=True)
    json.dump(chan, open(D + '/channels.json', 'w'), indent=0)
    good = [c for c in chan.values() if c['best'] >= 200000]
    by = collections.defaultdict(list)
    for c in good:
        by[c['sector']].append(c)
    pick = []
    for s, L in by.items():
        L.sort(key=lambda c: -(c['hits'] * 3 + min(c['best'], 5_000_000) / 1e6))
        pick += L[:40]
    print('channels', len(chan), 'with a 200k hit', len(good), 'to list', len(pick), flush=True)

    def shorts(c):
        e = yt(f"https://www.youtube.com/channel/{c['id']}/shorts", 200)
        v = [(x.get('view_count') or 0, x.get('id'), x.get('title') or '') for x in e if x.get('view_count')]
        if len(v) < 25:
            return c, None, []
        med = statistics.median(x[0] for x in v)
        out = [dict(id=i, title=t, views=n, median=round(med), times=round(n / med, 1), listed=len(v), channel=c['name'], channel_id=c['id'], sector=c['sector'], query=c['query'])
               for n, i, t in v if med >= 300 and n >= 10 * med and n >= 200000]
        return c, med, out

    allout = []
    done = 0
    with ThreadPoolExecutor(4) as ex:
        for fu in as_completed([ex.submit(shorts, c) for c in pick]):
            try:
                c, med, out = fu.result()
                allout += out
            except Exception as e:
                print('LIST ERR', str(e)[:120], flush=True)
            done += 1
            if done % 25 == 0:
                print('listed', done, 'outliers', len(allout), flush=True)
                json.dump(allout, open(D + '/outliers.json', 'w'), indent=0)
    json.dump(allout, open(D + '/outliers.json', 'w'), indent=0)
    print('DISCOVER DONE channels listed', done, 'outliers', len(allout), flush=True)
