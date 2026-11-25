import duckdb,json,sys
B='/tmp/claude-1000/-home-dxb-DxB-Global-OS/eae9dc30-29cf-48b1-8218-5b53dd8d5550/scratchpad/hook-kanit/bilim-video/'
u=json.load(open(B+'val_urls.json'))
c=duckdb.connect(); c.execute("SET home_directory='%s'"%B); c.execute("INSTALL httpfs; LOAD httpfs;")
i=int(sys.argv[1])
c.execute(f"COPY (SELECT ad_id,industry_name,objective_name,duration,ctr_global,cost_bucket,like_cnt,shares_cnt,ctr_curve,cvr_curve,clicks_curve,conversion_curve,retention_curve,ad_title,landing_page FROM read_parquet('{u[i]}')) TO '{B}ttcc_rows/v{i}.parquet' (FORMAT parquet)")
print(i,c.execute(f"SELECT count(*) FROM '{B}ttcc_rows/v{i}.parquet'").fetchone())
