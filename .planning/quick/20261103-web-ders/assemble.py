import re,os,sys
J="/home/dxb/DxB Global OS/.planning/quick/20261103-web-ders"
OUT=os.path.expanduser("~/Desktop/DxB Global Web-Studio/9 - Web işi derin çalışma 2026-11-04.md")
ekler=[("Ek 1 · SEO","tracks/1-seo.md"),("Ek 2 · AEO, GEO ve yapay zekâ tarafından bulunmak","tracks/2-aeo-geo.md"),("Ek 3 · E-ticaret","tracks/3-eticaret.md"),("Ek 4 · Reklam, ölçüm ve dönüşüm","tracks/4-reklam-olcum.md"),("Ek 5 · Altyapı, hız, güvenlik, erişilebilirlik, hukuk","tracks/5-altyapi.md"),("Ek 6 · Dünyanın en iyi stüdyoları","tracks/6-studyolar.md"),("Ek 7 · Ajan aletleri rafı","tracks/7-aletler.md"),("Ek 8 · WhatsApp linkleri (Claude Code ve Claude 2)","links.md"),("Ek 9 · Topluluk taraması: AEO ve GEO'da gerçekten ne işe yarıyor","sweep.md")]
def demote(s):
    out=[];fence=False
    for l in s.split('\n'):
        if l.startswith('```'): fence=not fence
        if not fence and re.match(r'#{1,5} ',l):
            if l.startswith('# '): continue
            l='#'+l
        out.append(l)
    return '\n'.join(out)
top=open(J+"/top.md").read().rstrip()
toc="\n\n## Ekler\n\n"+"\n".join(f"- {t}" for t,f in ekler if os.path.exists(J+"/"+f))+"\n"
body=[top,toc]
for t,f in ekler:
    p=J+"/"+f
    if os.path.exists(p):
        body.append(f"\n\n---\n\n## {t}\n\n"+demote(open(p).read()).strip()+"\n")
open(OUT,"w").write("".join(body))
print(OUT,os.path.getsize(OUT),len("".join(body).split()))
