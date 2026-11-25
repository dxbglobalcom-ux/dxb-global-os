import csv,json,os,re,random,statistics as s,collections,math
B='/tmp/claude-1000/-home-dxb-DxB-Global-OS/eae9dc30-29cf-48b1-8218-5b53dd8d5550/scratchpad/hook-kanit/bilim-video/'
rows=list(csv.DictReader(open(B+'tags_cn.csv',encoding='utf-8-sig')))
def rank(v):
    o=sorted(range(len(v)),key=lambda i:v[i]); r=[0]*len(v); i=0
    while i<len(o):
        j=i
        while j+1<len(o) and v[o[j+1]]==v[o[i]]: j+=1
        for k in range(i,j+1): r[o[k]]=(i+j)/2
        i=j+1
    return r
def pear(a,b):
    ma,mb=s.mean(a),s.mean(b); x=sum((p-ma)*(q-mb) for p,q in zip(a,b)); return x/math.sqrt(sum((p-ma)**2 for p in a)*sum((q-mb)**2 for q in b))
def spear(a,b): return pear(rank(a),rank(b))
D=[]
for r in rows:
    v=r['ID'].strip()
    try: ic=[float(x['ictr']) for x in csv.DictReader(open(B+f'adstrace_data/ictr/ictr/{v}.csv'))]
    except Exception: ic=None
    try: t=json.load(open(B+f'adstrace_data/transcripts/transcripts/{v}.json'))
    except Exception: t=None
    seg=(t or {}).get('segments') or []
    D.append(dict(id=v,prod=r['商品名字'],promo=r['促销活动'],feat=r['视频特点'],roi=float(r['ROI']),cvr=float(r['CVR']),ic=ic,first=seg[0]['text'] if seg else '',f3=''.join(x['text'] for x in seg if x['start']<3)))
print('n',len(D),'ictr',sum(1 for d in D if d['ic']),'text',sum(1 for d in D if d['first']))
# demean within product x promo (cells>=10)
cell=collections.defaultdict(list)
for d in D: cell[(d['prod'],d['promo'])].append(d)
E=[]
for k,l in cell.items():
    if len(l)<10: continue
    mr=s.mean(x['roi'] for x in l); mc=s.mean(x['cvr'] for x in l)
    for x in l: x['rr']=x['roi']/mr; x['cr']=x['cvr']/mc; E.append(x)
print('in cells>=10:',len(E),'cells',len({(x['prod'],x['promo']) for x in E}))
F=[x for x in E if x['ic'] and len(x['ic'])>=6]
def rep(name,f):
    a=[f(x) for x in F]; print(name,'spearman ROI %.3f CVR %.3f (within product x promo) | raw ROI %.3f CVR %.3f'%(spear(a,[x['rr'] for x in F]),spear(a,[x['cr'] for x in F]),spear(a,[x['roi'] for x in F]),spear(a,[x['cvr'] for x in F])))
print('F',len(F))
rep('iCTR sec0',lambda x:x['ic'][0]); rep('iCTR sec1-2',lambda x:s.mean(x['ic'][1:3])); rep('iCTR 0-2',lambda x:s.mean(x['ic'][:3])); rep('iCTR 3+',lambda x:s.mean(x['ic'][3:])); rep('iCTR all',lambda x:s.mean(x['ic'])); rep('length',lambda x:len(x['ic']))
print('ROI-CVR spearman',spear([x['rr'] for x in F],[x['cr'] for x in F]))
P={'question':r'吗|呢|什么|怎么|为什么|谁|几个|多少|够不够|要不要|是不是|\?|？','offer/price/quantity':r'送|元|块|到手|价|折|拍[一二两三\d]|赠|优惠|便宜|划算|省|\d+件|大箱','dont/warning/negation':r'别|不要|千万|先等|不许|小心|不会|没必要','regret/urgency (not bought yet)':r'再不|没提前买|没有提前买|还没|赶紧|快|最后|只有今天|错过|来得及|抢','first person I':r'^我|我也|我的|我真','gift/man/woman relation':r'女朋友|老婆|男朋友|妈妈|对象|老公|闺蜜|婆婆','surprise/exclaim':r'天哪|天呐|我的天|疯了|居然|竟然|没想到|吓|炸|绝了|哇|离谱|傻眼|震惊|怎么回事'}
T=[x for x in E if x['f3']]
random.seed(1)
def ci(v,n=1000):
    b=sorted(s.mean(random.choices(v,k=len(v))) for _ in range(n)); return b[25],b[974]
print('with words in first 3s',len(T))
for k,p in P.items():
    g=[x for x in T if re.search(p,x['f3'])]; h=[x for x in T if not re.search(p,x['f3'])]
    if len(g)<15: print(k,len(g)); continue
    a=ci([x['rr'] for x in g]); c=ci([x['cr'] for x in g])
    print('%-34s n=%4d ROI x%.3f [%.3f-%.3f] (others x%.3f)  CVR x%.3f [%.3f-%.3f] (others x%.3f)'%(k,len(g),s.mean(x['rr'] for x in g),*a,s.mean(x['rr'] for x in h),s.mean(x['cr'] for x in g),*c,s.mean(x['cr'] for x in h)))
g=[x for x in E if not x['f3']]
if len(g)>15: print('no speech in first 3 s',len(g),s.mean(x['rr'] for x in g),s.mean(x['cr'] for x in g),ci([x['rr'] for x in g]),ci([x['cr'] for x in g]))
# format
for key,pat in [('口播 talking to camera','口播'),('混剪 montage','混剪'),('开箱 unboxing','开箱'),('纯展示/展示 display','展示'),('软广 soft/story ad','软广'),('机制 offer mechanics','(?<!无)机制'),('种草 recommendation','种草')]:
    g=[x for x in E if re.search(pat,x['feat'])]
    if len(g)>=15: print('%-28s n=%4d ROI x%.3f [%.3f-%.3f] CVR x%.3f [%.3f-%.3f]'%(key,len(g),s.mean(x['rr'] for x in g),*ci([x['rr'] for x in g]),s.mean(x['cr'] for x in g),*ci([x['cr'] for x in g])))
