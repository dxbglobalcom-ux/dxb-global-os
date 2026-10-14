import zipfile,re,sys,json,html
z=zipfile.ZipFile(sys.argv[1])
ss=[]
x=z.read('xl/sharedStrings.xml').decode() if 'xl/sharedStrings.xml' in z.namelist() else ''
for si in re.findall(r'<si>(.*?)</si>',x,re.S):
    ss.append(html.unescape(''.join(re.findall(r'<t[^>]*>(.*?)</t>',si,re.S))))
def sheet(n):
    s=z.read(f'xl/worksheets/sheet{n}.xml').decode()
    out=[]
    for row in re.findall(r'<row[^>]*>(.*?)</row>',s,re.S):
        cells={}
        for m in re.finditer(r'<c r="([A-Z]+)\d+"([^>]*?)(?:/>|>(.*?)</c>)',row,re.S):
            col,attrs,inner=m.groups(); inner=inner or ''
            v=re.search(r'<v>(.*?)</v>',inner,re.S); t=re.search(r'<t[^>]*>(.*?)</t>',inner,re.S)
            if 't="s"' in attrs and v: val=ss[int(v.group(1))]
            elif t: val=html.unescape(t.group(1))
            elif v: val=html.unescape(v.group(1))
            else: val=''
            cells[col]=val
        out.append(cells)
    return out
n=int(sys.argv[2]); rows=sheet(n)
hdr=rows[0]
for r in rows[1:]:
    print(json.dumps({hdr.get(k,k):v for k,v in r.items()},ensure_ascii=False))
