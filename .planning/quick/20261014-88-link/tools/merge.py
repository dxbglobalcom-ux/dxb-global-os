import json,sys,glob,csv
D,J=sys.argv[1],sys.argv[2]
items={r['id']:r for r in csv.DictReader(open(D+'/items.tsv'),delimiter='\t')}
watch={}
for f in sorted(glob.glob(D+'/rows/*.jsonl')):
    tag=f.rsplit('/',1)[1].split('-')[0]
    for l in open(f):
        if l.strip():
            r=json.loads(l); watch.setdefault(r['id'],{})['pass'+tag]=r
out=open(J+'/links-88.jsonl','w'); n=0
for l in open(J+'/tum-linkler.jsonl'):
    x=json.loads(l); i=x['No']
    rec={'id':i,'link':items[i]['links'],'his_note':items[i]['ceo_note'],'excel_row':x,'watch':watch.get(i,{})}
    out.write(json.dumps(rec,ensure_ascii=False)+'\n'); n+=1
print(n, sum(1 for l in open(J+'/links-88.jsonl') if '"watch": {}' in l), 'without watch')
