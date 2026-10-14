import json,sys,os
J=sys.argv[1]; os.makedirs(J+'/input',exist_ok=True)
L=[json.loads(l) for l in open(J+'/links-88.jsonl')]
for b in range(8):
    with open(f'{J}/input/batch-{b+1}.md','w') as f:
        for r in L[b*11:(b+1)*11]:
            f.write(f"\n\n## {r['id']} — {r['excel_row'].get('Başlık','')}\n")
            f.write(f"- Link: {r['link']}\n- His note when he sent it: {r['his_note'] or '(none)'}\n")
            f.write("\n### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)\n")
            for k,v in r['excel_row'].items():
                if k in ('No','Başlık') or not v: continue
                f.write(f"- **{k}:** {v}\n")
            p=r['watch'].get('pass3') or r['watch'].get('pass2') or r['watch'].get('pass1')
            f.write("\n### What it is — the watch record (newest pass)\n")
            for k in ('tur','ne_bu','okundu','izlendi','zaten_var','not'):
                if p.get(k): f.write(f"- **{k}:** {p[k]}\n")
print(sorted(os.listdir(J+'/input')))
