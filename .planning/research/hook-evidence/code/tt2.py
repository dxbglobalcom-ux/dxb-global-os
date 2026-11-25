import duckdb,collections,statistics as s,math
B='/tmp/claude-1000/-home-dxb-DxB-Global-OS/eae9dc30-29cf-48b1-8218-5b53dd8d5550/scratchpad/hook-kanit/bilim-video/'
c=duckdb.connect()
R=c.execute(f"SELECT * FROM read_parquet('{B}ttcc_rows/v*.parquet')").fetchall(); cols=[d[0] for d in c.description]
R=[dict(zip(cols,r)) for r in R]; print(len(R))
for r in R[:3]:
    for k in ['industry_name','objective_name','duration','ctr_global','ctr_curve','cvr_curve','clicks_curve','conversion_curve','retention_curve']:
        v=r[k]; print(k, [round(x,4) for x in v[:8]]+['...',len(v)] if isinstance(v,list) else v)
    print()
def rank(v):
    o=sorted(range(len(v)),key=lambda i:v[i]); r=[0]*len(v); i=0
    while i<len(o):
        j=i
        while j+1<len(o) and v[o[j+1]]==v[o[i]]: j+=1
        for k in range(i,j+1): r[o[k]]=(i+j)/2
        i=j+1
    return r
def pear(a,b):
    ma,mb=s.mean(a),s.mean(b); d=math.sqrt(sum((p-ma)**2 for p in a)*sum((q-mb)**2 for q in b)); return sum((p-ma)*(q-mb) for p,q in zip(a,b))/d if d else 0
sp=lambda a,b:pear(rank(a),rank(b))
print(collections.Counter(r['objective_name'] for r in R).most_common(8))
X=[r for r in R if r['retention_curve'] and len(r['retention_curve'])>6 and r['ctr_global'] is not None and r['duration'] and r['duration']>=8]
print('usable',len(X), 'retention max',max(max(r['retention_curve']) for r in X[:500]))
def ret(r,t):
    v=r['retention_curve']; m=v[0] if v[0] else None
    return v[t]/m if m and t<len(v) else None
for t in (1,2,3,5):
    Y=[r for r in X if ret(r,t) is not None]
    print('retention at sec',t,'median',round(s.median(ret(r,t) for r in Y),3),'spearman with CTR rank (positive = better CTR): %.3f n=%d'%(sp([ret(r,t) for r in Y],[-r['ctr_global'] for r in Y]),len(Y)))
for obj,_ in collections.Counter(r['objective_name'] for r in X).most_common(5):
    Y=[r for r in X if r['objective_name']==obj and ret(r,2) is not None]
    print(obj,len(Y),'ret2~CTR %.3f ret5~CTR %.3f'%(sp([ret(r,2) for r in Y],[-r['ctr_global'] for r in Y]), sp([ret(r,5) if ret(r,5) is not None else 0 for r in Y],[-r['ctr_global'] for r in Y])))
# where conversions and clicks happen
def share(cur,n):
    tot=sum(cur); return sum(cur[:n])/tot if tot else None
for name in ('clicks_curve','conversion_curve'):
    Y=[r for r in X if r[name] and sum(r[name])>0 and len(r[name])>=10]
    for n in (1,2,3,6):
        print(name,'share of total in first',n,'sec: median %.3f mean %.3f n=%d'%(s.median(share(r[name],n) for r in Y),s.mean(share(r[name],n) for r in Y),len(Y)))
    print('   uniform benchmark (3 sec / len) median %.3f'%s.median(3/len(r[name]) for r in Y))
Y=[r for r in X if r['cvr_curve'] and len(r['cvr_curve'])>=10 and sum(r['cvr_curve'])>0]
if Y:
    e=[s.mean(r['cvr_curve'][:3]) for r in Y]; l=[s.mean(r['cvr_curve'][3:]) for r in Y]; print('cvr early mean %.4f late mean %.4f n=%d'%(s.mean(e),s.mean(l),len(Y)))
