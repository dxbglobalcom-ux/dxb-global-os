import duckdb,statistics as s
B='/tmp/claude-1000/-home-dxb-DxB-Global-OS/eae9dc30-29cf-48b1-8218-5b53dd8d5550/scratchpad/hook-kanit/bilim-video/'
c=duckdb.connect()
R=c.execute(f"SELECT duration,ctr_global,clicks_curve,conversion_curve,retention_curve,cvr_curve FROM read_parquet('{B}ttcc_rows/v*.parquet') WHERE objective_name IN ('Conversions','Product sales')").fetchall()
Y=[r for r in R if r[3] and sum(r[3])>0 and len(r[3])>=12 and r[2] and sum(r[2])>0 and max(r[3])>0 and sum(1 for x in r[3] if x>0)>=8]
print('sales-objective ads with full curves',len(Y))
for n in (1,2,3,6,10):
    print(n,'s: clicks median %.3f | conversions median %.3f (IQR %.3f-%.3f) | conv. pooled mean %.3f'%(s.median(sum(r[2][:n])/sum(r[2]) for r in Y), s.median(sum(r[3][:n])/sum(r[3]) for r in Y), *[s.quantiles([sum(r[3][:n])/sum(r[3]) for r in Y],n=4)[i] for i in (0,2)], s.mean(sum(r[3][:n])/sum(r[3]) for r in Y)))
print('retention median at 1,2,3,6 s',[round(s.median(r[4][t] for r in Y if r[4] and len(r[4])>t),1) for t in (1,2,3,6)])
# conversions per remaining viewer
print('conv per remaining viewer, first 3s vs after (ratio medians):',round(s.median((sum(r[3][3:])/max(sum(r[4][3:]),1e-9))/(max(sum(r[3][:3]),1e-9)/max(sum(r[4][:3]),1e-9)) for r in Y if r[4]),2))
# CTR top vs bottom quartile by 2-s retention
Z=sorted([r for r in R if r[4] and len(r[4])>6 and r[1] is not None],key=lambda r:r[4][2]/r[4][0] if r[4][0] else 0)
q=len(Z)//4
print('n',len(Z),'median CTR percentile (lower=better): bottom quartile of 2-s retention',round(s.median(r[1] for r in Z[:q]),3),'top quartile',round(s.median(r[1] for r in Z[-q:]),3))
print('share of top-retention-quartile ads with CTR worse than the median ad: %.2f'%(sum(r[1]>s.median(x[1] for x in Z) for r in Z[-q:])/q))
