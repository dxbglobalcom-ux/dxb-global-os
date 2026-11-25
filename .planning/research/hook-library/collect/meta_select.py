"""Selects long-running Meta video ads (active on 25 Nov 2026, started at least 184 days before), sector by sector,
downloads them, cuts a strip of the first four seconds and the first 25 s of sound."""
import collections, datetime, glob, json, math, os, re, subprocess, time, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from langdetect import detect_langs, DetectorFactory

DetectorFactory.seed = 1
D = '/home/dxb/.local/share/dxb/hook-lab/meta'
for x in ('vid', 'sheet', 'txt', 'wav'):
    os.makedirs(f'{D}/{x}', exist_ok=True)
qs = {}
for line in open(D + '/queries.tsv'):
    s, q = line.rstrip('\n').split('\t')
    qs[q] = s
now = datetime.datetime(2026, 11, 25).timestamp()
BAD = re.compile(r'\b(loan|mortgage|credit card|casino|bet|betting|slots|poker|wine|beer|whisky|vodka|bourbon|dating|singles|crypto|forex|lottery|sweepstake|payday|refinanc|insurance|lingerie|bikini|thc|cannabis|cbd|vape|hookah|tarot|psychic)\w*', re.I)


def english(t):
    t = re.sub(r'[^\w\s\'.,!?%$]', ' ', re.sub(r'#\S+|https?://\S+|\{\{.*?\}\}', ' ', t or '')).strip()
    if len(t) < 15:
        return None
    try:
        return any(x.lang == 'en' and x.prob > 0.6 for x in detect_langs(t))
    except Exception:
        return None


cand = collections.defaultdict(list)
seen = set()
tot = 0
for f in sorted(glob.glob(D + '/out/*.jsonl')):
    for rank, line in enumerate(open(f), 1):
        o = json.loads(line)
        tot += 1
        s = o['snapshot']
        vids = [v for v in (s.get('videos') or []) if v.get('video_hd_url') or v.get('video_sd_url')]
        if not vids or not o.get('start_date') or not o.get('is_active'):
            continue
        days = (now - o['start_date']) / 86400
        if days < 184:
            continue
        body = ((s.get('body') or {}).get('text') or '')
        title = s.get('title') or ''
        txt = f"{s.get('page_name')} {body} {title} {s.get('link_description') or ''}"
        if BAD.search(txt) or english(body) is not True or '{{' in body:
            continue
        key = (o['page_id'])
        if o['ad_archive_id'] in seen:
            continue
        seen.add(o['ad_archive_id'])
        likes = s.get('page_like_count') or 0
        copies = o.get('collation_count') or 1
        score = math.log(days) + 0.6 * math.log(copies) + 0.15 * math.log(likes + 1) - 0.012 * rank
        cand[qs.get(o['query'], 'other')].append(dict(ad_id='m' + o['ad_archive_id'], lib=o['ad_archive_id'], page=s.get('page_name'), page_id=key, query=o['query'], country=o['country'], days=round(days), started=datetime.date.fromtimestamp(o['start_date']).isoformat(), copies=copies, likes=likes, rank=rank, body=body[:900], title=title, link=s.get('link_url'), cta=s.get('cta_text'), video=vids[0].get('video_hd_url') or vids[0].get('video_sd_url'), platforms=o.get('publisher_platform'), score=score))
sel = []
for sec, L in cand.items():
    L.sort(key=lambda r: -r['score'])
    pages = collections.Counter()
    k = 0
    for r in L:
        if pages[r['page_id']] >= 1:
            continue
        pages[r['page_id']] += 1
        r['sector'] = sec
        r['card'] = (f"AD {r['ad_id']} | sector {sec} | page {r['page']} ({r['likes']} page likes) | found by search '{r['query']}' in {r['country']}\n"
                     f"PROOF Meta Ad Library, read 25 November 2026: active, running since {r['started']} ({r['days']} days); {r['copies']} ads use this same creative and text; position {r['rank']} in the search results sorted by impressions; platforms {', '.join(r['platforms'] or [])}\n"
                     f"TEXT {r['body']}\nHEADLINE {r['title']} | BUTTON {r['cta']} | LINK {r['link']}\nADDRESS https://www.facebook.com/ads/library/?id={r['lib']}")
        sel.append(r)
        k += 1
        if k >= 16:
            break
    print(sec, 'candidates', len(L), 'taken', k, flush=True)
json.dump(sel, open(D + '/selection.json', 'w'), indent=0)
print('ads read', tot, 'selected', len(sel), flush=True)
TIMES = [0.0, 0.4, 0.8, 1.2, 1.8, 2.4, 3.0, 4.0]


def one(r):
    a = r['ad_id']
    mp4, sheet, wav = f'{D}/vid/{a}.mp4', f'{D}/sheet/{a}.jpg', f'{D}/wav/{a}.wav'
    if not os.path.exists(mp4):
        b = urllib.request.urlopen(urllib.request.Request(r['video'], headers={'User-Agent': 'Mozilla/5.0'}), timeout=120).read()
        with open(mp4, 'wb') as f:
            f.write(b)
    if not os.path.exists(sheet):
        n = len(TIMES)
        args = ['ffmpeg', '-v', 'error', '-y']
        for t in TIMES:
            args += ['-ss', str(t), '-i', mp4]
        fc = ''.join(f'[{i}:v]scale=320:568:force_original_aspect_ratio=decrease,pad=320:568:(ow-iw)/2:(oh-ih)/2,setsar=1[v{i}];' for i in range(n))
        fc += ''.join(f'[v{i}]' for i in range(n)) + f'xstack=inputs={n}:layout=0_0|320_0|640_0|960_0|0_568|320_568|640_568|960_568[o]'
        args += ['-filter_complex', fc, '-map', '[o]', '-frames:v', '1', '-q:v', '4', sheet]
        subprocess.run(args, capture_output=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-t', '25', '-ac', '1', '-ar', '16000', wav], capture_output=True)
    return os.path.exists(sheet)


ok = bad = 0
with ThreadPoolExecutor(5) as ex:
    for f in as_completed([ex.submit(one, r) for r in sel]):
        try:
            ok += bool(f.result())
        except Exception as e:
            bad += 1
            print('ERR', str(e)[:120], flush=True)
print('META FETCH ok', ok, 'bad', bad, flush=True)
