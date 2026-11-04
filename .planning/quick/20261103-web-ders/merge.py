import json
J="/home/dxb/DxB Global OS/.planning/quick/20261103-web-ders"
def load(n):
    d={}
    for l in open(f"{J}/rows/{n}.jsonl"):
        l=l.strip()
        if l:
            try:o=json.loads(l);d[o['id']]=o
            except: pass
    return d
a,b=load('opus'),load('fable')
# id: (hüküm, holding, sıra, gerekçe, plan, nerede, tahta, kim, onay, risk)
C={
"c02":("Kur",3,1,"İki okuyucu aynı hükümde. Yapay zekâ ile kurulan sitenin gerçek hastalığını anlatıyor: boş HTML, tek canonical, sahte 404.","12 kontrol INP, hreflang ve şema ile tamamlanıp yayın kapısına girer","Ortak dolap: yayın kapısı listesi","B84","Site ustası","Yok; aletler B84 sırasında","Listedeki FAQ sinyali eskidi"),
"d21":("Dene",3,2,"İkisi de Dene. Kendi başarısızlığını yazan tek uygulayıcı yazısı; UNREVIEWED etiketi bizim LAW B ile aynı.","Tek örnek müşteri ve iki beceriyle aylık SEO işinin iskeleti denenir; ölçü düzeltmelerin kaçının sonraki işte tuttuğu","Aylık SEO işi","B84","Arama uzmanı","Yok","Tek kişi ölçümü; sıralama artışı söylemiyor"),
"d11":("Dene",3,3,"Ayrışma: Kur / Dene. Dene seçtim: döngü doğru, ama FAQ şeması, llms.txt ve tek koşuluk 'Cited 3/5' bölümleri Ek 1 ve Ek 2'ye aykırı. Kurulacak bir şey de henüz yok.","Denetle, teşhis et, düzelt, yeniden denetle döngüsü aylık ürünün teslim biçimi olur; yapay zekâ verisi aylık ve en az 8 koşu","Aylık SEO ve AEO paketi","B84, B83","Arama uzmanı","DataForSEO ve benzeri para çıkışı","Rehber kapalı, yalnız ekran okundu"),
"d07":("Araştır",3,4,"Ayrışma: Araştır 3 / İzle 2. Araştır seçtim: lüks e-ticaretin ölçüsü bu ve içerikle satan mağaza kapısı. Söküm tamamlanamadı (403); kendi Chrome'unuzda bitirilir.","Dergi gibi kurulan mağaza okuması tamamlanır: ham HTML, saha hızı, sepet ve ödeme","Referans dosyası, ortak dolap","B84, B43","Kreatif direktör","Yok","Altı h1, ağır izleyici yükü örnek alınmaz"),
"c10":("Dene",2,5,"Ayrışma: Kur / Dene. Dene seçtim: değerli olan 12 akışlık liste; TestSprite ücretli, önce Playwright.","12 akış (başka kullanıcının verisi, sepet, boş durum, geri tuşu) Playwright ile kabul kapısı olur","Yayın kapısı","B84","Site ustası","TestSprite bulutu para çıkışı","—"),
"d09":("Kur",2,6,"Ayrışma: Kur / Araştır. Listeden yalnız claude-ads için Kur; Ek 4 ve Ek 7 aynı sonuca vardı. Sınavı ve kurulumu B84 sırasında.","claude-ads rafa girer; W096 satırı düzeltilir","Ortak raf","B84, B28","Ölçüm ve reklam uzmanı","Yok","Listedeki AutoHedge ve Vibe-Trading İslami sınıra değiyor; önerilmez"),
"c04":("Dene",2,7,"İkisi de Dene. Tıkla-not revizyonu, sizin onay tıkı çalışma biçiminize oturur.","Önizleme sitesinde tıkla, not bırak, ajana git akışı denenir","İş tipi aleti","B84","Kreatif direktör","Yok","React ister; lisans PolyForm Shield"),
"c09":("Dene",2,8,"İkisi de Dene. AEO'nun alıntıdan kullanıma geçtiği yer.","Sitenin bir işlevi ChatGPT içinde çalıştırılır; satılabilir yeni kalem adayı","B84 satış listesi","B84, B83","Arama uzmanı","Dizin yayını kimlik adımı","Erken aşama"),
"d10":("Dene",2,9,"Ayrışma: Dene / Araştır. Dene seçtim, çünkü Ek 7'nin körlü sınavı tam bunu istiyor.","marketingskills'ten 3-4 beceri ve claude-seo, OpenSEO ile aynı sitede karşılaştırılır; biri kalır","Ortak raf","B84, B41","Dolap sahibi","Yok","Yıldız sayıları görsellerde tutmuyor"),
"d01":("Araştır",2,10,"İkisi de Araştır. Post sığ, yön gerçek. Fable AdAdvisor'ı bulamadı, Opus fiyatlarıyla buldu; var sayıldı, kurulumda doğrulanır.","Resmî Meta Ads MCP önce yalnız okuma ile denenir","Ortak MCP","B28","Ölçüm ve reklam uzmanı","Yazma izni para çıkışı","Canlı bütçe anında değişiyor"),
"c05":("Araştır",2,11,"Ayrışma: Araştır / Dene. Araştır seçtim: gördüğümüz bir demo, ürün bulunamadı. Gelir fikri olarak değerli.","Formdan sonraki ilk dakikayı satan akış gelir listesine aday","Gelir listesi","B83, B64","Hesap sahibi","Yok","25 bin $ iddiası kanıtsız"),
"d03":("Dene",1,12,"Ayrışma: Dene / Araştır. Ücretsiz ve kolay; siteden marka DNA'sı çıkarma adımı teklif öncesi işe yarayabilir.","Teklif öncesi örnek için bir kez denenir","İş tipi aleti","B84","Kreatif direktör","Hesap açmak kimlik adımı","Google Labs deneyi, kapanabilir"),
"d14":("Dene",1,13,"Ayrışma: Dene / Gerek yok. Tek alınacak: sayfayı yerel Gutenberg bloğu olarak teslim etme; WordPress kiti kurulurken denenir.","Etkileşimin bloklara dönüşümden sağ çıkıp çıkmadığı sınanır","WordPress kiti","B84","Platform uzmanı","Yok","Video görülemedi"),
"d16":("Araştır",1,14,"Ayrışma: Dene / Araştır. Media Studio aynı işi yapıyor; 'on kat ucuz' grafiği başka şeyi karşılaştırıyor.","Toplu ürün reklamı ihtiyacı stüdyonun iş listesine not düşülür","Media Studio","B43, B28","Görsel yapımcı","Kredi satın alma para çıkışı","Yapay UGC aldatıcı tanıklık sayılabilir; hukuk"),
"d17":("Gerek yok",1,None,"Ayrışma: Dene / Gerek yok. Scrapling elimizde, Hermes gerekmiyor. Aday listesi yolu Y9'un işi.","","","Y9","","","Kayıt doğruluğu ölçülmeden liste sayılmaz"),
"c01":("Gerek yok",1,None,"Ayrışma: Gerek yok / Dene. Bu sizin son paylaşımınız: on slayt doğru başlık listesi, ama ders değil. Başlıkların hepsi Ek 1 ve Ek 2'de derinlemesine var. FAQ ve şema önerileri eskidi.","","","B84","","",""),
"c07":("İzle",1,None,"Ayrışma: Gerek yok / Araştır. Liste yeni bir şey getirmiyor; Chatwoot ve Cal.com kendi sıralarında bakılır.","","","B05","","",""),
"d02":("Gerek yok",1,None,"Ayrışma: Gerek yok / Dene. Başlangıç özeti; Ek 4 bunun çok ötesinde.","","","B28","","",""),
"d06":("Gerek yok",1,None,"Ayrışma: İzle / Gerek yok. Konu dışı. /last30days Polymarket bahis oranlarını kaynak sayıyor; kullanılırsa o kaynak kapalı tutulur.","","","","","",""),
"d19":("Gerek yok",1,None,"Ayrışma: Gerek yok / Dene. OpenMontage kurulu; stüdyonun işi (B42). Reel lisansı yanlış yazıyor (AGPL).","","","B42","","",""),
"c08":("Gerek yok",1,None,"Ayrışma: İzle / Gerek yok. Sekiz depo adsız, on iki aramada bulunamadı.","","","","","",""),
"c06":("İzle",1,None,"Ayrışma: İzle / Araştır. Konu dışı; stüdyonun ses işi.","","","B43","","",""),
"d18":("İzle",1,None,"Ayrışma: İzle / Araştır. operator bu işi görüyor.","","","B35","","",""),
"c03":("Gerek yok",1,None,"İkisi aynı. Araştırma kapımız bunu yapıyor.","","","","","",""),
"c11":("Gerek yok",1,None,"İkisi aynı. Başlangıç listesi.","","","","","",""),
"d05":("Gerek yok",1,None,"İkisi aynı. Konu dışı; superpowers ve gstack 27 Ağustos emrinizle dışarıda.","","","","","",""),
"d13":("Gerek yok",0,None,"Konu dışı; ders bizde ölçülü.","","","","","",""),
"d15":("Gerek yok",0,None,"İkisi aynı. Ücretsiz araç dizinleri; müşteri verisi oralara girmez.","","","","","",""),
"d20":("Gerek yok",0,None,"İkisi aynı. Saç kesimi reeli, web işiyle bağı yok.","","","","","",""),
"d08":("Gerek yok",0,None,"Gönderi kaldırılmış ya da gizli; iki kapı denendi, içerik bilinmiyor.","","","","","",""),
"d12":("Gerek yok",0,None,"Notunuz 'chatgpt de aramada çıkmak'. Gönderi kaldırılmış ya da gizli; içerik bilinmiyor. Konunun kendisi Ek 2'de.","","","","","",""),
}
order=[l.split('\t')[0] for l in open(J+"/items.tsv")][1:]
assert set(order)==set(C),set(order)^set(C)
with open(J+"/plan.jsonl","w") as f:
    for i in order:
        h,hp,s,why,plan,ner,tah,kim,onay,risk=C[i]
        f.write(json.dumps({"id":i,"sira":s or "","oneri":h,"holding_puan":hp,"plan":plan or why,"nerede":ner,"tahta":tah or a[i].get('tahta',''),"kim":kim,"onay":onay,"risk":risk},ensure_ascii=False)+"\n")
top="""Otuz bir linkin çoğu liste ya da "yorum yaz, linki atayım" kapısıdır; iki okuyucu da aynı sonuca vardı: **bu linklerden SEO öğrenilmez**, derin bilgi Ek 1-7'dedir. Linklerin değeri yöntem ve alet göstermesindedir. Otuz bir linki iki okuyucu birbirini görmeden okudu (Opus ve Fable, high), ayrışmaları ben hakem olarak karara bağladım. Hiçbiri kurulmadı.

**İşe yarayanlar, sırayla:** c02 (yayın kapısı) · d21 (aylık SEO işinin iskeleti) · d11 (aylık ürünün teslim biçimi, düzeltilerek) · d07 (Net-a-Porter, lüks mağazanın ölçüsü) · c10 (kabul testi) · d09'dan claude-ads.

**Sizin kararınıza kalanlar:** AutoHedge ve Vibe-Trading (d09, işlem yapan finans ajanları) · /last30days'ın Polymarket kaynağı (d06) · gerçek olmayan kişiyle ürün tanıklığı, yapay UGC (d16).

**Görülemeyenler:** d08 ve d12 kaldırılmış ya da gizli. d14'ün videosu YouTube engeline takıldı, konuşması okundu. d07'nin ham HTML'i, saha hızı ve ödeme akışı alınamadı. d11'in rehberi kapalı. c08'in depoları adsız.

| Id | Tarih | Ne | Opus | Fable | Hüküm | Sebep |
|---|---|---|---|---|---|---|
"""
items={l.split('\t')[0]:l.rstrip('\n').split('\t') for l in open(J+"/items.tsv")}
rows=[]
key=lambda i:(C[i][2] if C[i][2] else 99,-C[i][1],i)
for i in sorted(order,key=key):
    t=(a[i].get('baslik') or '').replace('|','/')[:90]
    rows.append(f"| {i} | {items[i][1][5:]} | {t} | {a[i].get('oneri')} {a[i].get('holding_puan')} | {b[i].get('oneri')} {b[i].get('holding_puan')} | **{C[i][0]}** {C[i][1]} | {C[i][3].replace('|','/')} |")
tail="\n\nPuan 0-3 arasıdır. c satırları Claude Code grubundan, d satırları Claude 2 grubundandır. İki okuyucunun tam metinleri: `.planning/quick/20261103-web-ders/reader-opus.md` ve `reader-fable.md`. Ayrıntı Excel'inizde \"Kasım 3-4 web linkleri\" sekmesindedir.\n"
open(J+"/links.md","w").write(top+"\n".join(rows)+tail)
open(J+"/MERGE.md","w").write("# Referee's merge (lead, max, 2026-11-04)\n\n"+top+"\n".join(rows)+tail)
print('ok',len(rows))
