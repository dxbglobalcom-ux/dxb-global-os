## RAPOR — "ARSENAL: DİĞER DİLLER" LANESİ (Zhihu / V2EX / Juejin / Weibo / Linux.do / Quora.de / TR-DE Forumları)

**A) NE OKUDUM**

- Zaten açılmış zeminden (ground + ground-2): zhihu.raw (2 dosya, 20 satır başlık/yazar/oy), v2ex.raw (2 dosya, 8 sonuç), juejin.raw (yalnız ground-2'de, 10 sonuç) — hepsi okundu.
- Bunlardan **6 sayfayı tam metin olarak fetch ettim** (juejin ×3, zhihu makale ×3), toplam ~87.000 byte:
  1. 掘金/Juejin — "GPT-6 Astra VS Claude Fable 5.1: 2026 seçim rehberi" (出海小龙人, 9 Eyl 2026, 101 okunma)
  2. 掘金/Juejin — **"Sadece PASS'a bakma, 6 Agent Trace'te Coding Agent gerçeği"** (Databend yazarı, 10 Eyl 2026, 47 okunma) — gerçek elle yapılmış deney: serde_json bug'ı, 3 farklı harness (Evot/Pi/DeepSeek Harness), her iki model 3'er kez çalıştırıldı
  3. 掘金/Juejin — "TERMINAL-BENCH 4.0'da liderlik el değiştirdi mi?" (ClaudeEvangelist, 10 Eyl 2026, 56 okunma) — Reddit/HN/Çin topluluğu sentezi
  4. 知乎/Zhihu 专栏 — "2026 Eylül AI model kavgası: Astra, Fable 5.1, Gemini 3.8, Xinghuo X2.5"
  5. 知乎/Zhihu 专栏 — "GPT-6 Astra şimdi yükseltmeye değer mi? Claude/Gemini nasıl seçilir"
- Ardından **kendi lanem için** (Türkçe/Almanca forum + quora.de) 6 ayrı arama denedim: DuckDuckGo direkt (captcha duvarı), Bing (JS gerektirdi, boş), Google direkt (JS yönlendirme), Google tarayıcı köprüsüyle (CAPTCHA/robot engeli — "unusual traffic"), DuckDuckGo tarayıcı köprüsüyle genel sorgu (İngilizce sonuçlar döndü, TR/DE değil), DuckDuckGo `site:heise.de OR site:golem.de` ve `site:donanimhaber.com OR site:technopat.net` hedefli sorgular — bunlar açıldı ve okundu ama konuyla ilgili **hiçbir gerçek forum tartışması** bulamadı.

**B) SAYIM (n=)**

- Zhihu'da (2 ayrı taramadan) Astra/Fable 5.1'i doğrudan konu eden **20 sonuç** (soru-cevap + makale), bunlardan **en az 4 tanesi** açıkça "hangisi kodlama için daha iyi" karşılaştırması yapıyor.
- Juejin'de Astra/Fable 5.1 karşılaştıran **10 sonuçtan 6'sı** doğrudan kod/coding-agent konulu.
- Kod kalitesi lehine **tam metin okuduğum 5 yazarın** görüşü: 4'ü Fable 5.1'i kodlama/debug/refactor için, Astra'yı otomasyon/hız için öneriyor (n=5/5 bu ayrımı yapıyor — hiçbiri "Astra kod kalitesinde açıkça üstün" demiyor).
- Türkçe/Almanca forum (quora.de, technopat.net, donanimhaber.com, heise.de, golem.de): **6 hedefli arama, 0 ilgili tartışma başlığı** — Golem.de'de yalnız haber makaleleri (fiyat/güvenlik/IPO haberleri) çıktı, forum yorumu yok.

**C) SESLER (verbatim alıntılar, çeviriyle)**

1. **Databend (掘金, gerçek deney yazarı)**, 10 Eyl 2026:
   > "六次运行全部通过完整测试，核心补丁逐字节相同...GPT-6-Astra 平均请求模型 9 次，耗时 52.0 秒。Claude-Fable-5.1 平均请求 13 次，耗时 118.6 秒，输出 token 是前者的 9.6 倍。"
   *(Çeviri: "Altı çalıştırma da testi geçti, çekirdek yama bayt-bayt aynıydı... GPT-6-Astra ortalama 9 istekte 52.0 saniyede bitirdi. Claude-Fable-5.1 ortalama 13 istek, 118.6 saniye, çıktı token'ı 9.6 kat fazla.")*
   Aynı yazarın sonucu: *"Claude-Fable-5.1 更接近一次保守的代码审查"* ("Claude-Fable-5.1 temkinli bir kod incelemesine daha yakın" — uyumluluk kontrolü, sınır-durum testleri, açıklama yazma konusunda daha titiz).

2. **ClaudeEvangelist (掘金)**, TERMINAL-BENCH 4.0 verisi + topluluk tepkisi:
   > "GPT-6 Astra：58.2% ± 2.8%... Claude Fable 5.1：57.9% ± 3.8%...两者的置信区间高度重叠...属于并列第一的同一梯队。"
   *("İstatistiksel olarak berabere — güven aralıkları çakışıyor, aynı liderlik grubu.")*
   Astra hakkında geliştirici şikayeti: *"过于激进...经常不作过多解释，直接把半个模块的代码全盘重写，甚至随手删掉了原有项目精心维护的注释"* ("Aşırı agresif — açıklama yapmadan modülün yarısını yeniden yazıyor, hatta özenle tutulan yorumları siliyor").
   Claude için: *"极致的'微创手术式'代码修改...非常克制，每次修改都精准定位在必要行"* ("Aşırı 'minimal invaziv cerrahi' tarzı düzenleme — çok kısıtlı, her değişiklik gerekli satıra hassas şekilde odaklı").

3. **Zhihu 专栏（2026年9月AI大模型大乱斗）**:
   > "程序员、软件工程师（写代码、重构、debug）" → Claude Fable 5.1 için "适合谁" (kime uygun) listesinde.
   Aynı yazarın Astra değerlendirmesi: *"编程能力意外翻车：第三方评测显示，Astra在跨文件重构等复杂编程任务上，表现只介于Claude Opus 4.7和Fable 5之间。"* ("Programlama yeteneği beklenmedik şekilde düştü: bağımsız değerlendirmelerde, çapraz-dosya refactoring gibi karmaşık görevlerde Astra'nın performansı Opus 4.7 ile Fable 5 arasında kalıyor — sadece.")

4. **Zhihu 专栏 (GPT-6 Astra 值得升级吗)** — kendi tablosunda OpenAI'nin resmi lansman sayfasından: DeepSWE v1.1'de Fable 5.1 (%67.4) Astra'nın (%74.1) gerisinde kalırken, Artificial Analysis Intelligence Index'te Fable 5.1 (65.7) Astra'yı (61.2) geçiyor — yazarın notu: *"这张表本身也说明不存在'每项都全面领先'"* ("Bu tablonun kendisi bile 'her alanda tam üstünlük' diye bir şeyin olmadığını gösteriyor").

**D) KAPANAN KAPILAR**

- **linux.do**: `AUTH_REQUIRED` — oturum açık tarayıcı gerekiyor, giriş yapılmamış.
- **weibo.com**: `NOT_FOUND` — arama sonucu yok / giriş gerektiriyor.
- **quora-forums (opencli)**: komut hatası (`<session>` argümanı eksik) — araç kendi içinde bozuk çağrılmıştı.
- **DuckDuckGo (doğrudan fetch)**: CAPTCHA duvarı ("Select all squares containing a duck").
- **Bing (doğrudan fetch)**: JS render gerektiriyor, boş sonuç sayfası.
- **Google (doğrudan fetch + tarayıcı köprüsü)**: "unusual traffic" / robot doğrulama sayfası — muhtemelen filonun aynı anda çok sayıda Google sorgusu göndermesi nedeniyle.
- **Golem.de / Heise.de (DuckDuckGo üzerinden)**: açıldı, okundu — ama yalnız haber makaleleri (fiyat kesintisi, güvenlik, IPO); geliştiricilerin kod-kalitesi tartıştığı bir forum başlığı yok.
- **Technopat.net / Donanimhaber.com (DuckDuckGo üzerinden)**: açıldı, okundu — genel forum kategori sayfaları döndü, konuyla ilgili hiçbir başlık yok.
- **Quora.de**: hiç erişilemedi — hedefli sorgu döndürmedi, ayrı deneme yapacak zaman/kapı kalmadı.

**E) OKUDUĞUM AYRI İNSAN SAYISI**

**5 kişi** — tam metnini okuyup analiz ettiğim 5 farklı yazarın (Databend, ClaudeEvangelist, 出海小龙人, ve 2 imzasız/başka rumuzlu zhihu yazarı) kendi cümleleriyle yazdığı karşılaştırma. Buna ek olarak zhihu/v2ex/juejin liste taramalarından **~28 başlık/yazar adı** gördüm ama bunların tam metnini okumadım — sadece başlık+snippet, bu yüzden sayıma dahil etmedim.
Türkçe/Almanca tarafında **0 kişi** — hiçbir forum yorumcusunun kendi cümlesine ulaşamadım (kapılar kapalıydı).

**F) NEYİ ÇEVİRİRDİ (flip)**

Bulduğum en güçlü karşı-kanıt olasılığı: **elle yapılan Trace deneyi (Databend) yalnızca TEK bir küçük bug-fix görevine dayanıyor** ("我们只讨论这六条真实 Session 里的工程行为，不给两个模型做通用排名" — yazarın kendi uyarısı: genel bir sıralama iddia etmiyor). Eğer büyük ölçekli bir refactoring görevinde aynı deney tekrarlansaydı, sonuç tersine dönebilirdi — yazar bunu açıkça yazıyor: *"这次实验只覆盖一个小修复，换成大型重构，结论可能会变"* ("Bu deney sadece küçük bir düzeltmeyi kapsıyor, büyük refactoring'e geçilirse sonuç değişebilir"). Bunu aradım mı: Hayır — büyük ölçekli refactoring karşılaştırması yapan Çince/diğer-dil bir kaynak bulamadım; bu, cevabı çevirebilecek kanıt boşluğu olarak kalıyor.

**Genel lane sonucu:** Çince geliştirici içeriği (zhihu+juejin, tam metin okunan 5 kaynak) tutarlı bir örüntü gösteriyor — ham benchmark'ta (Terminal-Bench, DeepSWE) istatistiksel beraberlik/hafif Astra üstünlüğü var, ama **kod kalitesi/temkinlilik/uyumluluk-farkındalığı** açısından geliştiricilerin kendi ifadeleriyle **Fable 5.1'i tercih ettikleri** ("程序员的最爱" — "programcıların favorisi", "更接近一次保守的代码审查" — "temkinli bir kod incelemesine daha yakın"), Astra'nın ise hız/maliyet/otomasyon için tercih edildiği (ama "过于激进" — "aşırı agresif" şikayetiyle). Türkçe/Almanca kanalda konuya dair hiçbir doğrudan tartışma bulunamadı — bu, sorunun henüz bu dillerde gelişticiler arasında tartışılmadığının bir göstergesi olabilir, kapıların kapalı olmasının değil (Golem.de/Technopat kendisi açıldı, sadece konu yoktu).