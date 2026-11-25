"""Selects the winning ads, sector by sector, from the TikTok Creative Center 'Top Ads' measures.

A winner here: the advertiser spent in the highest tier (cost_bucket 2), the ad is in the top 5 % by click rate
(ctr_global <= 0.05), and it was run to sell or to get leads (Conversions / Product sales / Lead Generation).
"""
import duckdb, json, math, re, collections
from langdetect import detect_langs, DetectorFactory
DetectorFactory.seed = 1


def english(t):
    t = re.sub(r'#\S+|@\S+|https?://\S+', ' ', t or '')
    t = re.sub(r'[^\w\s\'.,!?%$]', ' ', t).strip()
    if len(t) < 12:
        return None
    try:
        return any(x.lang == 'en' and x.prob > 0.6 for x in detect_langs(t))
    except Exception:
        return None


D = '/home/dxb/.local/share/dxb/hook-lab/ttcc'
SECT = {
    'health_dental': ['Medical Services', 'Medical Information', 'Oral Care', 'Medicine', 'Aesthetic Medicine', 'Other Health', 'Pet Healthcare x'],
    'supplements': ['Dietary Supplements'],
    'food': ['Food & Fresh Produce', 'Cuisine', 'Non-alcoholic Beverages', 'Food & Cooking', 'Cooking & Recipes', 'Kitchen Accessories', 'Glasses & Drinkware', 'Kitchen & Bathroom Appliances'],
    'home_furniture': ['Home Decor', 'Furniture', 'Home Appliances', 'Daily Essentials', 'Storage Products', 'Large Appliances', 'Other Household Products', 'Gardening', 'Other Home Improvement', 'Home Improvement'],
    'home_services': ['Construction Materials & Lighting', 'Hardware & Electrical', 'Cleaning Supplies', 'Cleaning Appliances', 'Constructional Engineering', 'Pest Control', 'Interior Design & Decorating Services', 'Housekeeping', 'Laundry', 'Machinery & Equipment'],
    'beauty': ['Skincare', 'Cosmetics', 'Haircare', 'Beauty & Personal Care', 'Fragrances & Perfumes', 'Personal Care Appliances', 'Wig & Hair Styling'],
    'fashion': ["Men's Clothing", "Women's Clothing", 'Clothing Accessories', 'Ordinary Jewelry', 'High-end Jewelry', 'Watches', 'Bags', "Men's Shoes", "Women's Shoes", 'Other Apparel & Accessories', 'Apparel & Accessories', 'Traditional & Ceremonial Clothing'],
    'software': ['Internet Services', 'IT Services', 'Utilities', 'Business & Productivity', 'Science & Technology', 'Marketing & Advertising', 'Tech & Electronics'],
    'gadgets': ['Cell Phones', 'Audio & Video Players', 'Digital Devices', 'Computers', 'Computer Accessories', 'Wearable Tech Devices', 'Computers Components', 'Network Products', 'Gaming Devices', 'Photography'],
    'education_books': ['Higher Education', 'Language Training', 'Vocational Training', 'Education', 'Reading', 'Primary & Secondary Education & K-12', 'Non-academic Training (Hobbies)', 'Other Education', 'Early Childhood & Preschool Education'],
    'toys_family': ['Toys', 'Toys for Kids', 'Other Baby, Kids & Maternity', "Children's Apparel", 'Baby Formula', 'Diapers & Baby Wipes', 'Baby Bedding', 'Baby Feeding Supplies', 'Strollers & Cribs', 'Gifts & Flowers'],
    'automotive': ['Auto Accessories', 'Auto Services', 'Automobiles', 'Car Dealerships', 'Auto Parts', 'Motorcycles', 'Electric Scooters', 'Accessories for 2/3-Wheeled Vehicles', 'Bicycles', 'Car Information', 'Used Cars', 'Car Rentals'],
    'travel': ['Travel Agencies & Services', 'Tours & Attractions', 'Hotels & Accommodation', 'Tourist Information', 'Travel'],
    'fitness': ['Sports & Equipment', 'Sports & Fitness', 'Exercise & Fitness', 'Health & Fitness', 'Sports & Outdoor', 'Outdoor Equipment'],
    'pets': ['Pet Household Products', 'Pet Grooming', 'Petfood', 'Pet Healthcare', 'Pet Toys', 'Pet Information', 'Pet Travel Accessories'],
    'b2b_services': ['Business & Economy', 'Recruitment & Job Searching', 'Professional Consultation', 'Other Business Services', 'Office Equipment & Supplies', 'Office Equipment', 'Logistics', 'Legal Services', 'Law', 'Other Life Services', 'Real Estate & Home Rentals', 'Charity & Public Welfare', 'Agriculture, Forestry, Animal Husbandry & Fishing'],
    'ecommerce': ['Small & Medium-sized E-commerce Platforms', 'Large E-commerce Platforms', 'Online Shopping', 'Big Box Retailers', 'Shopping Services'],
}
rev = {i: s for s, L in SECT.items() for i in L}
c = duckdb.connect()
# order of rows inside each split, to address one row later
files = c.execute(f"select split, fname, count(*) n from '{D}/meta/*.parquet' group by 1,2").fetchall()
base = {}
for sp in ('train', 'val', 'test'):
    tot = 0
    for s, f, n in sorted([x for x in files if x[0] == sp], key=lambda x: x[1]):
        base[(s, f)] = tot
        tot += n
Q = f"""select split,fname,file_row_number,ad_id,ad_title,caption,brand_name,industry_name,objective_name,duration,ctr_global,
cost_bucket,like_cnt,comments_cnt,shares_cnt,retention_curve,conversion_curve,clicks_curve,landing_page,highlight_text,keyword_list,n_countries,voice_over,width,height
from '{D}/meta/*.parquet' where cost_bucket=2 and ctr_global<=0.05 and objective_name in ('Conversions','Product sales','Lead Generation')"""
cur = c.execute(Q)
names = [d[0] for d in cur.description]
rows = [dict(zip(names, r)) for r in cur.fetchall()]
med = dict(c.execute(f"select industry_name, median(retention_curve[3]) from '{D}/meta/*.parquet' where cost_bucket=2 group by 1").fetchall())
out = collections.defaultdict(list)
for r in rows:
    s = rev.get(r['industry_name'])
    if not s or not r['duration'] or r['duration'] < 5 or r['duration'] > 120:
        continue
    rc = r['retention_curve'] or []
    if len(rc) < 5:
        continue
    cap = (r['caption'] or '') + ' ' + (r['ad_title'] or '')
    latin = sum(ch.isascii() and ch.isalpha() for ch in cap)
    nonlatin = sum((not ch.isascii()) and ch.isalpha() for ch in cap)
    if nonlatin > latin * 0.15 + 3:
        continue
    if re.search(r'\b(el|la|los|para|con|por|una|que|tu|envío|compra|und|der|die|das|pour|avec|les|des)\b', ' ' + cap.lower() + ' ') and not re.search(r'\b(the|and|your|you|for|with|this|it|to|my)\b', cap.lower()):
        continue
    if english(cap) is not True:
        continue
    r['offset'] = base[(r['split'], r['fname'])] + r['file_row_number']
    r['r1'], r['r2'], r['r3'], r['r6'] = rc[1], rc[2], rc[3] if len(rc) > 3 else None, rc[6] if len(rc) > 6 else None
    m = med.get(r['industry_name']) or 24
    r['score'] = -math.log(r['ctr_global'] + 0.005) + 1.2 * math.log((rc[2] + 1) / (m + 1)) + 0.25 * math.log((r['like_cnt'] or 0) + 1)
    dom = re.sub(r'^https?://(www\.)?', '', r['landing_page'] or '').split('/')[0].split('?')[0]
    r['domain'] = dom
    cc, ck = r['conversion_curve'] or [], r['clicks_curve'] or []
    r['conv_first3'] = round(sum(cc[:3]) / sum(cc), 2) if cc and sum(cc) > 0 else None
    r['click_first3'] = round(sum(ck[:3]) / sum(ck), 2) if ck and sum(ck) > 0 else None
    out[s].append(r)
sel = []
for s, L in out.items():
    L.sort(key=lambda r: -r['score'])
    seen = collections.Counter()
    k = 0
    for r in L:
        key = (r['brand_name'] or r['domain'] or r['ad_id']).lower()
        cap = re.sub(r'\W+', '', (r['caption'] or '').lower())[:40]
        if seen[key] >= 1 or (cap and seen[cap] >= 1):
            continue
        seen[key] += 1
        seen[cap] += 1
        r['sector'] = s
        sel.append(r)
        k += 1
        if k >= 22:
            break
    print(s, 'candidates', len(L), 'taken', k)
for r in sel:
    for k in ('retention_curve', 'conversion_curve', 'clicks_curve'):
        r.pop(k, None)
json.dump(sel, open(D + '/selection.json', 'w'), indent=0)
print('TOTAL', len(sel))
