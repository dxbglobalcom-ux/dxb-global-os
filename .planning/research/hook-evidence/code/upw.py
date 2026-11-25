import csv,sys,math,re,random
from collections import defaultdict
csv.field_size_limit(10**9)
base=sys.argv[1]
def load(fs):
    g=defaultdict(lambda: defaultdict(lambda:[0,0])); n=0;drop=0
    for f in fs:
        for r in csv.DictReader(open(f'{base}/{f}.csv',encoding='utf-8',newline='')):
            d=r['created_at'][:10]
            if '2013-06-25'<=d<='2014-01-10': drop+=1; continue
            try: im=int(float(r['impressions'])); c=int(float(r['clicks']))
            except: continue
            h=(r['headline'] or '').strip()
            if im<=0 or not h: continue
            n+=1
            x=g[(r['clickability_test_id'],r['eyecatcher_id'])][h]; x[0]+=im; x[1]+=c
    return {k:v for k,v in g.items() if len(v)>=2},n,drop
W=lambda p:re.compile(p,re.I)
NEG=r"\b(wrong|bad|worst|hate|fear|afraid|scared|scary|die|died|death|dead|kill|killed|war|hurt|pain|lie|lies|lying|angry|mad|shame|ashamed|cry|fight|attack|violence|abuse|rape|racist|sexist|terrible|horrible|awful|ugly|sad|stupid|dumb|lost|lose|fail|failed|problem|danger|dangerous|never)\b"
POS=r"\b(love|loves|loved|beautiful|happy|amazing|awesome|best|great|good|wonderful|hope|inspiring|smile|joy|win|perfect|fun|pretty|nice|brilliant|incredible)\b"
F={
'ends with ?':lambda h:h.rstrip('"”\' )').endswith('?'),
'contains ?':lambda h:'?' in h,
'has a digit':lambda h:bool(re.search(r'\d',h)),
'starts with digit':lambda h:bool(re.match(r'\W*\d',h)),
'money ($/dollar)':lambda h:bool(re.search(r'\$|\bdollars?\b',h,re.I)),
'percent':lambda h:bool(re.search(r'%|\bpercent\b',h,re.I)),
'you/your':lambda h:bool(re.search(r"\byou('|’)?(re|ve|ll|d)?\b|\byour\b|\byours\b|\byourself\b",h,re.I)),
'starts If you / When you':lambda h:bool(re.match(r"\W*(if|when) you",h,re.I)),
'starts with If':lambda h:bool(re.match(r"\W*if\b",h,re.I)),
'I/my/me':lambda h:bool(re.search(r"\b(I|I'm|I've|I’m|I’ve)\b",h) or re.search(r"\b(my|me|mine)\b",h,re.I)),
'we/our/us':lambda h:bool(re.search(r"\b(we|our|ours|we're|we’re)\b",h,re.I) or re.search(r"\bus\b",h)),
'she/her':lambda h:bool(re.search(r"\b(she|her|hers|she's|she’s)\b",h,re.I)),
'he/his/him':lambda h:bool(re.search(r"\b(he|his|him|he's|he’s)\b",h,re.I)),
'a woman/man/girl/boy/guy/kid/mom/dad':lambda h:bool(re.search(r"\b(woman|man|girl|boy|guy|kid|mom|dad|mother|father|teacher|lady)\b",h,re.I)),
'this/these':lambda h:bool(re.search(r"\b(this|these)\b",h,re.I)),
"here's/here":lambda h:bool(re.search(r"\bhere('|’)?s?\b",h,re.I)),
'how':lambda h:bool(re.search(r"\bhow\b",h,re.I)),
'starts with How':lambda h:bool(re.match(r"\W*how\b",h,re.I)),
'why':lambda h:bool(re.search(r"\bwhy\b",h,re.I)),
'what happened/happens (next)':lambda h:bool(re.search(r"happen(s|ed)",h,re.I)),
'watch/see/look':lambda h:bool(re.search(r"\b(watch|see|look|looks|saw|seen)\b",h,re.I)),
'video/photo/picture':lambda h:bool(re.search(r"\b(video|clip|photo|photos|picture|pictures|footage)\b",h,re.I)),
'quote marks':lambda h:bool(re.search(r"[\"“”]|(^|\s)'",h)),
'all-caps word (4+)':lambda h:bool(re.search(r"\b[A-Z]{4,}\b",h)),
'!':lambda h:'!' in h,
'two or more sentences':lambda h:len(re.findall(r"[.!?](?:[\"”']?)\s+\S",h))>=1,
'ellipsis ...':lambda h:'...' in h or '…' in h,
'parenthesis':lambda h:'(' in h,
'colon':lambda h:':' in h,
'negative word':lambda h:bool(re.search(NEG,h,re.I)),
'positive word':lambda h:bool(re.search(POS,h,re.I)),
'superlative most/best/worst/ever':lambda h:bool(re.search(r"\b(most|best|worst|ever|greatest|biggest)\b",h,re.I)),
'never':lambda h:bool(re.search(r"\bnever\b",h,re.I)),
'secret/truth/real reason':lambda h:bool(re.search(r"\b(secret|secrets|truth|reason|reasons)\b",h,re.I)),
"don't/stop/can't":lambda h:bool(re.search(r"\b(don.t|stop|can.t|won.t)\b",h,re.I)),
'but (twist)':lambda h:bool(re.search(r"\b(but|then|until|turns out)\b",h,re.I)),
'until/then/turns out':lambda h:bool(re.search(r"\b(until|then|turns out)\b",h,re.I)),
'surprise/shock words':lambda h:bool(re.search(r"\b(surpris\w*|shock\w*|unexpected|stunn\w*|speechless|blew|jaw)\b",h,re.I)),
'you won\'t believe / wait till':lambda h:bool(re.search(r"(won.t believe|wait (till|until)|you.ll never)",h,re.I)),
'just / only':lambda h:bool(re.search(r"\b(just|only)\b",h,re.I)),
}
def dl(es):
    es=[(y,v) for y,v in es]
    k=len(es); w=[1/v for _,v in es]; sw=sum(w); m=sum(y/v for y,v in es)/sw
    Q=sum((y-m)**2/v for y,v in es); C=sw-sum(x*x for x in w)/sw
    t=max(0,(Q-(k-1))/C) if C>0 else 0
    w=[1/(v+t) for _,v in es]; sw=sum(w); m=sum(y/(v+t) for y,v in es)/sw
    return m,math.sqrt(1/sw),math.sqrt(t)
def feat(G,f):
    es=[]
    for k,v in G.items():
        a=[0,0];b=[0,0]
        for h,(im,c) in v.items():
            z=a if f(h) else b; z[0]+=im; z[1]+=c
        if a[0] and b[0]:
            y=math.log((a[1]+.5)/(a[0]+1))-math.log((b[1]+.5)/(b[0]+1))
            es.append((y,1/(a[1]+.5)+1/(b[1]+.5)))
    return es
def main():
    S={'CONF':load(['conf']),'EXP+HOLD':load(['exp','hold'])}
    for s,(G,n,drop) in S.items():
        print(s,'packages kept',n,'dropped window',drop,'same-image groups',len(G),'headline arms',sum(len(v) for v in G.values()),'impr',sum(x[0] for v in G.values() for x in v.values()),'clicks',sum(x[1] for v in G.values() for x in v.values()))
        Q=df=C=0
        for v in G.values():
            e=[(math.log((c+.5)/(im+1)),1/(c+.5)) for im,c in v.values()]
            w=[1/x for _,x in e]; sw=sum(w); m=sum(y/x for y,x in e)/sw
            Q+=sum((y-m)**2/x for y,x in e); df+=len(e)-1; C+=sw-sum(x*x for x in w)/sw
        tau=math.sqrt(max(0,(Q-df)/C)); 
        print('  between-headline true SD of log CTR within same story+image: tau=%.3f'%tau,' E[max of 4]=+%.1f%%'%(100*(math.exp(1.03*tau)-1)),' best vs worst of 4: %.2fx'%math.exp(2.06*tau))
    print('%-40s %6s %8s %8s %8s | %6s %8s %8s'%('feature','n','effect%','lo','hi','n2','eff2%','z2'))
    rows=[]
    for name,f in F.items():
        e1=feat(S['CONF'][0],f); e2=feat(S['EXP+HOLD'][0],f)
        if len(e1)<60: continue
        m,se,t=dl(e1); m2,se2,_=dl(e2) if len(e2)>10 else (0,1,0)
        rows.append((m,name,len(e1),se,len(e2),m2,se2))
    for m,name,k,se,k2,m2,se2 in sorted(rows,reverse=True):
        p=lambda x:100*(math.exp(x)-1)
        print('%-40s %6d %+8.1f %+8.1f %+8.1f | %6d %+8.1f %+8.1f'%(name,k,p(m),p(m-2.58*se),p(m+2.58*se),k2,p(m2),m2/se2))
    # length within group: longest vs shortest, terciles
    G=S['CONF'][0]
    for lab,fn in (('chars',len),('words',lambda h:len(h.split()))):
        es=[]
        for v in G.values():
            hs=sorted(v,key=fn)
            if fn(hs[-1])-fn(hs[0])<(20 if lab=='chars' else 4): continue
            a=v[hs[-1]];b=v[hs[0]]
            es.append((math.log((a[1]+.5)/(a[0]+1))-math.log((b[1]+.5)/(b[0]+1)),1/(a[1]+.5)+1/(b[1]+.5)))
        m,se,t=dl(es); print('longest vs shortest by',lab,len(es),'%.1f%%'%(100*(math.exp(m)-1)),'CI99 %.1f..%.1f'%(100*(math.exp(m-2.58*se)-1),100*(math.exp(m+2.58*se)-1)))
main()
