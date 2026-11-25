import csv,math,json,re
from collections import defaultdict
csv.field_size_limit(10**9)
B='/home/dxb/.local/share/dxb/hook-lab/upw'
g=defaultdict(lambda: defaultdict(lambda:[0,0]))
for f in ('conf','exp','hold'):
    for r in csv.DictReader(open(f'{B}/{f}.csv',encoding='utf-8',newline='')):
        d=r['created_at'][:10]
        if '2013-06-25'<=d<='2014-01-10': continue
        try: im=int(float(r['impressions'])); c=int(float(r['clicks']))
        except: continue
        h=(r['headline'] or '').strip()
        if im<=0 or not h: continue
        x=g[(r['clickability_test_id'],r['eyecatcher_id'])][h]; x[0]+=im; x[1]+=c
out=[]
for k,v in g.items():
    if len(v)<3: continue
    L=sorted(((h,i,c,c/i) for h,(i,c) in v.items()),key=lambda x:-x[3])
    w=L[0]; rest=L[1:]
    ri=sum(x[1] for x in rest); rc=sum(x[2] for x in rest)
    if w[1]<1500 or ri<3000 or rc<10: continue
    p1=w[3]; p0=rc/ri
    se=math.sqrt(p1*(1-p1)/w[1]+p0*(1-p0)/ri)
    z=(p1-p0)/se
    lift=p1/p0
    # lower bound of log ratio
    lb=math.log(lift)-1.96*math.sqrt((1-p1)/w[2]+(1-p0)/rc)
    if z>=4 and math.exp(lb)>=1.4:
        out.append(dict(test=k[0],headline=w[0],imps=w[1],clicks=w[2],ctr=round(100*p1,2),rest_ctr=round(100*p0,2),lift=round(lift,2),lift_low=round(math.exp(lb),2),z=round(z,1),n_variants=len(L),rivals=[dict(h=x[0],imps=x[1],ctr=round(100*x[3],2)) for x in rest]))
out.sort(key=lambda x:-x['lift_low'])
print(len(g),'groups;',len(out),'clear winners')
json.dump(out,open(B+'/winners.json','w'),indent=0)
for o in out[:40]: print(o['lift'],o['lift_low'],o['imps'],o['ctr'],'|',o['headline'],'|| rival:',o['rivals'][-1]['h'])
