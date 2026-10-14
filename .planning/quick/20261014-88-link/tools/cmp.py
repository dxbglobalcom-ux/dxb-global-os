import re,sys
def parse(path):
    txt=open(path).read()
    body=re.split(r'\n#+ Closing',txt)[0]
    blocks=re.split(r'\n### (W\d{3})',body)
    out={}
    for i in range(1,len(blocks),2):
        wid=blocks[i]; b=blocks[i+1]
        def f(name):
            m=re.search(r'- '+name+r':\s*(.*)',b); return m.group(1).strip() if m else ''
        g=f('Gives'); cat=re.match(r'(revenue|machine|both|nothing today|nothing)',g.lower()); cat=cat.group(1) if cat else g[:20]
        board=f('Board'); ranks=sorted(set(re.findall(r'#(\d+)',board)),key=int)
        new='NEW' if re.search(r'candidate NEW|candidate new',board,re.I) else ''
        ov=f(r'Old verdict[^:]*\)'); 
        m=re.search(r'Öneri:\s*([^)]+)\)',b); old=m.group(1).strip() if m else '?'
        agree='agree' if re.match(r'\s*agree',ov.lower()) or ov.lower().startswith('agree') else ('changed' if 'changed' in ov.lower()[:30] else ov[:15])
        to=re.search(r'changed\s*→\s*([A-Za-zİıŞşÇçÖöÜüĞğ ]+?)[;,.:—(]',ov); to=to.group(1).strip() if to else ''
        conf=f('Confidence').split()[0] if f('Confidence') else ''
        ideas=f('New revenue ideas'); n=len(re.findall(r'\(\d\)',ideas))
        out[wid]=dict(cat=cat,ranks=','.join(ranks),new=new,old=old,agree=agree,to=to,conf=conf,ideas=n)
    return out
o=parse(sys.argv[1]); f=parse(sys.argv[2])
ids=sorted(set(o)|set(f))
print(len(o),len(f),len(ids))
agree_cat=0; rows=[]
for i in ids:
    a=o.get(i,{}); b=f.get(i,{})
    same_cat=a.get('cat')==b.get('cat'); agree_cat+=same_cat
    ra=set(a.get('ranks','').split(','))-{''}; rb=set(b.get('ranks','').split(','))-{''}
    rk='=' if ra==rb else ('~' if ra&rb else 'X')
    vd='=' if (a.get('agree'),a.get('to'))==(b.get('agree'),b.get('to')) else 'X'
    flag='' if same_cat and rk!='X' and vd=='=' else ' <<'
    print(f"{i} old={a.get('old','?'):9.9} | O:{a.get('cat',''):13.13} r[{a.get('ranks','')}]{a.get('new','')} {a.get('agree','')}{('→'+a['to']) if a.get('to') else ''} i{a.get('ideas',0)} | F:{b.get('cat',''):13.13} r[{b.get('ranks','')}]{b.get('new','')} {b.get('agree','')}{('→'+b['to']) if b.get('to') else ''} i{b.get('ideas',0)} | cat{'=' if same_cat else 'X'} rank{rk} verd{vd}{flag}")
print('same category',agree_cat)
