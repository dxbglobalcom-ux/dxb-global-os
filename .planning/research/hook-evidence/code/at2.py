# same data, opening-line type vs ROI with product-cell controls, R2 and permutation
exec(open('/tmp/claude-1000/-home-dxb-DxB-Global-OS/eae9dc30-29cf-48b1-8218-5b53dd8d5550/scratchpad/hook-kanit/bilim-video/at.py').read().split("P={")[0])
# how much of ROI does the cell (product x promo) explain vs the first three seconds
tot=s.pvariance([x['roi'] for x in E]); 
import collections
g=collections.defaultdict(list)
for x in E: g[(x['prod'],x['promo'])].append(x['roi'])
w=sum(len(v)*s.pvariance(v) for v in g.values())/len(E)
print('ROI variance explained by product x promo cell: %.1f%%'%(100*(1-w/tot)))
r=spear([s.mean(x['ic'][:3]) for x in F],[x['rr'] for x in F]); print('first-3s iCTR rank R2 with ROI: %.2f%%'%(100*r*r))
for lo,hi,nm in ((0,.25,'bottom quartile'),(.75,1,'top quartile')):
    o=sorted(F,key=lambda x:s.mean(x['ic'][:3])); k=o[int(lo*len(o)):int(hi*len(o))]; print(nm,'of first-3s CTR: ROI x%.3f CVR x%.3f n=%d'%(s.mean(x['rr'] for x in k),s.mean(x['cr'] for x in k),len(k)))
