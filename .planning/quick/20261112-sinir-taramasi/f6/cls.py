import sys,re
t=open(sys.argv[1],encoding='utf-8').read().rstrip('\n')
sp=[l.rstrip('\n').split('|',1) for l in open(sys.argv[2],encoding='utf-8') if l.strip()]
pos=0; out=[]
for c,a in sp:
    i=t.find(a,pos)
    if i<0: print("NOTFOUND",a); sys.exit(1)
    out.append([c,i,a]); pos=i+1
if out[0][1]!=0: print("first not 0")
res=[]
for k,(c,i,a) in enumerate(out):
    e=out[k+1][1] if k+1<len(out) else len(t)
    res.append((c,i,e))
mk=re.compile(r'<!-- CEO-OK: ([a-z0-9\-]+) -->')
tot={'L':0,'J':0,'U':0}; ids={'L':set(),'J':set(),'U':set()}
for c,s,e in res:
    seg=t[s:e]; tot[c]+=e-s
    m=sorted(set(mk.findall(seg))); ids[c]|=set(m)
    w=seg.replace('<br>','').split()
    print(f"{c} {s}-{e} ({e-s}) | {' '.join(w[:10])} … {' '.join(w[-6:])} | {', '.join(m)}")
print(tot, sum(tot.values()))
allids=set(mk.findall(t))
for c in 'LJU': print(c,len(ids[c]))
print('union',len(ids['L']|ids['J']|ids['U']),'all',len(allids))
print('onlyJ',sorted(ids['J']-ids['L']-ids['U']))
print('onlyU',sorted(ids['U']-ids['L']-ids['J']))
print('onlyL',sorted(ids['L']-ids['J']-ids['U']))
print('multi',sorted((ids['L']&ids['J'])|(ids['L']&ids['U'])|(ids['J']&ids['U'])))
