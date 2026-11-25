"""Final choice of the organic winners: the seed channels (real trades and brands) and the real trades found by search."""
import collections, json, math, re, sys
sys.path.insert(0, '/home/dxb/.local/share/dxb/hook-lab/venv/lib/python3.12/site-packages')
from langdetect import detect_langs, DetectorFactory
DetectorFactory.seed = 1
D = '/home/dxb/.local/share/dxb/hook-lab/yt'
seeds = json.load(open(D + '/outliers_seeds.json'))
found = json.load(open(D + '/outliers.json'))
WHITE = {'Tone and Tighten', 'OsteoTia', 'Dr. Rod', 'The Everyday Dentist', 'Maison Dental', 'Insider Physical Therapy', 'Dr. John Yoo', 'Dr Morad Shaglouf', 'OPAL DENTISTRY',
         'Luke Kahng', 'Dr. Joyce Kahng', 'Dentakay', 'Oasis Dental Studio', 'Dr. Kadish', 'Brevitē', 'Yale Cleaners', 'Jeeves NY', 'Chemical Guys', 'Mini Katana', 'RCXtreme',
         'TheCakingGirl', 'Crayola', 'Alyssa Kuhn, Arthritis Adventure', 'Toddlers Can Read', 'Sam Builds', 'In Office to Hands On Dental Assisting', 'Matt Does Stuff', 'Will Harlow – Over-Fifties Physio'}
found = [x for x in found if x['channel'] in WHITE or x['channel'].startswith(('In Office to Hands', 'Alyssa Kuhn', 'Will Harlow'))]
SEC = {'Brevitē': 'fashion', 'Yale Cleaners': 'local_shop', 'Jeeves NY': 'local_shop', 'Chemical Guys': 'automotive', 'RCXtreme': 'toys_family', 'Crayola': 'toys_family', 'Toddlers Can Read': 'education_books'}
BAD = re.compile(r'\b(kiss|girlfriend|boyfriend|sexy|bikini|beer|wine|whisk|vodka|cocktail|bourbon|casino|poker|bet|crypto|forex|loan|trump|biden|lingerie|tattoo|pork|bacon|gun|rifle|bullet)\w*', re.I)


def eng(t):
    t = re.sub(r'#\S+', '', t)
    t = re.sub(r"[^A-Za-z\s']", ' ', t).strip()
    if len(t) < 8:
        return None
    try:
        return any(x.lang == 'en' and x.prob > 0.5 for x in detect_langs(t))
    except Exception:
        return None


allx = seeds + found
langs = collections.defaultdict(list)
for x in allx:
    e = eng(x['title'])
    if e is not None:
        langs[x['channel_id']].append(e)
good = []
for x in allx:
    L = langs[x['channel_id']]
    if BAD.search(x['title']) or (L and sum(L) / len(L) < 0.6):
        continue
    x['sector'] = SEC.get(x['channel'], x['sector'])
    x['score'] = math.log(x['times']) + 0.35 * math.log(x['views'])
    good.append(x)
good.sort(key=lambda x: -x['score'])
per, bysec, sel, seen = collections.Counter(), collections.Counter(), [], set()
for x in good:
    if x['id'] in seen or per[x['channel_id']] >= 3 or bysec[x['sector']] >= 28:
        continue
    seen.add(x['id'])
    per[x['channel_id']] += 1
    bysec[x['sector']] += 1
    sel.append(x)
for x in sel:
    x['ad_id'] = 'y' + x['id']
    x['card'] = (f"VIDEO {x['ad_id']} | sector {x['sector']} | channel {x['channel']} | found by {x['query']}\n"
                 f"PROOF YouTube Shorts, read 25 November 2026: {x['views']} views against the channel's own median of {x['median']} over its newest {x['listed']} Shorts: {x['times']} times the median\n"
                 f"TITLE {x['title']}\nADDRESS https://www.youtube.com/shorts/{x['id']}")
json.dump(sel, open(D + '/selection.json', 'w'), indent=0)
print('seeds', len(seeds), 'found', len(found), 'good', len(good), 'channels', len(per), 'selected', len(sel), dict(bysec))
