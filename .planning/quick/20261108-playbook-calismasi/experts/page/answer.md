# Tek ajan ve iş kitabı: uzmanlar ne diyor, holding için ne demek

Borja'nın özü doğru, başlığı yanlış. 2026'da laboratuvarların ve sahada ajan kuranların ortak görüşü şu: her iş için ayrı bir ajan yazıp bunları birbirine bağlamak yerine güçlü tek bir ajan çalışmalı ve her iş türünün bir klasörü olmalı. Bu klasörde talimat, dosyalar, kontroller ve düzeltme kaydı durur [L1033][L1034][L2038][L2058]. "Anthropic ajan kurmayı bıraktı" sözü ise yanlış. Anthropic, paralel araştırma, ayrı bağlam ve bağımsız denetim gereken yerlerde birden çok ajan kullanmaya devam ediyor [L1019][L1021][L1046][L1057]. "Ajan kendi işini kontrol etsin" de yetmiyor; ayrı bir denetçi gerekiyor [L1045][L3066][L2051].

## İddia parça parça

| İddia | Uzmanların söylediği | Hüküm |
|---|---|---|
| "Anthropic ajan kurmayı bıraktı" | Aralık 2025'teki konuşmanın sloganından geliyor. Anlamı "her alan için ayrı ajan yazmayı bıraktık, genel ajana skill veriyoruz" [L1033][L1034]. Nisan 2026'da Anthropic hâlâ ajan altyapısı kuruyor [L1057] | Abartı |
| Tek genel ajan, iş başına bir klasör | OpenAI, LangChain ve Cognition'ın üçü de önce tek ajanla başlamayı söylüyor [L2038][L2058][L2032]. Skill açık standart oldu, OpenAI de benimsedi [L2046][L2047] | Doğru |
| Vercel'de başarı %80'den %100'e çıktı | 5 soruda 4/5'ten 5/5'e çıkmış. İki sürüm de tek ajan; değişen, 17 özel araç yerine bash ve dosya kullanılması [L2026][L2027]. Vercel'in kendi sözü: "yalnız belgelerimiz zaten iyi olduğu için işe yaradı" [L2028] | Gerçek ama dar |
| Ajan teslimden önce kendi işini kontrol etsin | Anthropic 2026: ajan vasat işi övüyor; ayrı ve şüpheci bir denetçi kurmak çok daha kolay [L1045][L1046]. Merkezî bir denetçi yoksa hata 17,2 kat büyüyor, varsa 4,4 kat [L2051] | Eksik |
| Her düzeltme hatayı yapan dosyaya yazılsın | OpenAI: her elle düzeltme, ileride bir kontrole dönüşecek adaydır [L2043]. Anthropic: başarılı yollar ve yaygın hatalar skill'in içine işlenir [L3062] | Doğru |
| Persona ("Sen kıdemli X'sin") | Doğruluğu güvenilir biçimde artırmıyor [L3033][L3035]. İlgisiz persona ayrıntısı doğruluğu 30 puana kadar düşürebiliyor [L3046]. Anthropic'e göre rol yalnız tonu belirler [L1068] | Kimlik değil, yöntem ve bilgi taşır |

## Uzmanların ekledikleri

1. **Ayrı denetçi ve insan gözü.** Otomatik denetçiler, doğru görünen ama yanlış olan işi kaçırıyor; en iyisi hataların %87'sini yakaladı [L2077][L2078]. Kontrol geçti/kaldı biçiminde olur ve her hata türüne bir kontrol düşer. Kontrolleri, gerçek çıktılara bakarak işin ustası yazar [L2072][L2074][L2081].
2. **Kitabı seçmeyi modele bırakmamak.** Vercel'in 2026 ölçümünde skill, vakaların %56'sında hiç açılmadı. Her zaman yüklü kısa bir dizin %100 başarı aldı, açık talimatlı skill %79 [L2066][L2067]. Her seferinde tutması gereken kural koda, yani bir kancaya yazılır [L1063].
3. **Ölçek sınırı.** Ajana aynı anda gösterilen araç sayısı 30-50'yi geçince doğru aracı seçmesi bozuluyor [L3042]. Araçları gerektiğinde arayarak yüklemek, Opus 4'te seçimi %49'dan %74'e, Opus 4.5'te %79,5'ten %88,1'e çıkardı [L3017]. 58 araç, iş başlamadan yaklaşık 55 bin jeton harcatıyor [L3018]. Claude Code, skill listesini bağlamın %1'iyle sınırlıyor [L3043]. Seçimi asıl bozan rollerin sayısı değil, birbiriyle çakışması [L3057].
4. **Birden çok ajan nerede kazanır.** Paralel yürüyebilen geniş işte %80,8 kazanç, sıralı işte %39 ile %70 arası kayıp ölçüldü [L2050]. Tek ajan zaten %45'in üstündeyse ek ajanların kazancı kayboluyor [L2052]. Anthropic'in araştırma sistemi %90,2 daha iyi sonuç verdi ama yaklaşık 15 kat jeton harcıyor [L1019][L1021]. Kural: işi yazan tek ajan kalır, ötekiler yalnız akıl katar [L2033].

5. **Kitabı ajan değil, işin ustası yazar.** SkillsBench 1.1'de (Haziran 2026) uzmanların hazırladığı skill'ler çözüm oranını %33,9'dan %50,5'e çıkardı. Ajanın kendi yazdığı skill'ler ise hiç skill kullanmamaktan bile kötü sonuç verdi [L4004][L4005].
6. **Düzeltme önce ders olarak kaydedilir, kural olmak için onay ister.** Bunu ChatGPT'nin cevabı ekliyor: her düzeltmeyi kendiliğinden kitaba yazmak doğru talimatı da bozabilir. Önce hatanın sebebi bulunur, sonra bir deneme vakası yazılır, sonra en küçük değişiklik yapılır, test edilir ve sahibi onaylar. Kaydedilmiş bir ders ile onaylanmış bir kural ayrı şeylerdir.

Bu hükmü değiştirebilecek şey, yüzlerce skill arasından doğru olanın ne sıklıkla seçildiğinin ölçülmesiydi. Bu ölçüm Ekim 2026'da yapıldı ve sonuç hükmü güçlendiriyor. Kütüphaneye 1.000 ilgisiz skill eklenince, işe yarayan skill'in açılma oranı %73,6'dan %27,4'e düştü. Hiç skill açılmayan vakaların oranı %9,3'ten %51,6'ya çıktı. Skill'i işten önce ayrı bir adımda seçmek ise %73,9'u korudu [L4006]. Kısacası, yüzlerce rolde seçimi işin içinde modele bırakmak çöküyor; seçim işten önce yapılmalı.

## ChatGPT tarafı

ChatGPT kendi araştırmasında aynı hükme vardı: iddia yön olarak doğru, ama "çok ajan devri bitti" diye okunursa yanlış.

- **İkimizin de bulduğu:**
  - Anthropic'in araştırma sistemindeki %90,2'lik fark ve 15 kat jeton maliyeti;
  - Google'ın ölçtüğü +%80,8 ve −%39 ile −%70 arası sonuçlar;
  - Vercel'in 5 soruluk denemesi ve 8 KB'lık dizinin %100'e karşı %79'u;
  - araç aramanın getirdiği artış;
  - personanın doğruluğa katkı yapmaması;
  - Cognition'ın "tek yazan, ayrı denetçi" düzeni.
- **Yalnız ChatGPT'nin bulduğu, kaynağında kontrol edilen:** SkillsBench 1.1 ölçümü [L4004][L4005], Ekim 2026 tarihli 1.000 ilgisiz skill ölçümü [L4006] ve Anthropic'in Agent Skills standardını Linux Vakfı'na bağlı Agentic AI Foundation'a bağışlaması [L4007]. Bağış Ekim 2026'da yapıldı; standardı ChatGPT, Cursor ve GitHub Copilot dahil 70'ten fazla platform kullanıyor.
- **Yalnız bizim bulduğumuz:**
  - Anthropic'in 2026'daki "ayrı şüpheci denetçi" dersi;
  - Claude Code'un %1'lik skill sınırı ve "her seferinde tutması gereken kural kancaya yazılır" kuralı;
  - otomatik denetçilerin %87'lik tavanı.
- **Küçük çelişki:** SkillRouter'da skill'in gövdesi gizlenince yaşanan doğruluk kaybını bizim okuyucu 37-44 puan, ChatGPT 29-44 puan olarak aktardı. İkisi makalenin farklı sürümlerinden olabilir; bu fark hükmü değiştirmiyor.

## Bizde

- **İnşaat sistemimiz (dxb-team2) bu tarifin ta kendisi.** Tek lider oturum çalışıyor. Kapılar iş kitabı görevi görüyor; testler, batarya ve cetveller kontrol katmanı. Sol, temiz bağlamla çalışan kör bir denetçi. Düzeltmeler kapılara ve hafızaya yazılıyor. Yardımcılar yalnız paralel okuma yapıyor ve her dosyayı tek kişi yazıyor. Uzmanların 2026 tarifiyle birebir örtüşüyor; değiştirilecek bir şey yok.
- **Holdingin iskeleti de doğru yönde.**
  - Çalışanlar ayrı ayrı ve sürekli açık ajanlar değil. Tek bir motor (Agent SDK üzerindeki iş döngüsü) her görevde ilgili personayı dosyadan yüklüyor.
  - 213 persona dolapta dosya olarak duruyor ve gerektiğinde çağrılıyor. Uzmanların önerisi de tam bu [L3071].
  - Plandaki iş türü menüsü, her türün ustası ve rafın tek satırlık kartları (A26-A29) aynı yöntem. Üstelik iş türünü yönlendiricinin seçmesi, Vercel'in ölçtüğü %56'lık "skill hiç açılmadı" sorununu baştan çözüyor.
- **Ölçülen eksikler:**
  1. İş türü ustası olarak yazılmış persona dosyası sayısı 0. Hiçbir iş türünün "bitti" kontrolü yok.
  2. 202 reklam tarifinin hepsi aday durumunda, kabul edilen yok. Hükümleriniz ayrı bir dosyada duruyor ve tariflere geri işlenmiyor.
  3. Personalar 136 ile 211 satır arası uzunlukta ve ağırlıkla kimlik anlatıyor.
  4. Her koltuğa açılışta 23 ile 54 arası araç yükleniyor; bu, seçimin bozulduğu aralığın tam içi.
  5. Koltukların dosya ve komut satırı yok, hafıza bloğu boş, iş başına adım sınırı 12 ile 40 arası.

## Ne yapalım

1. **Her iş türüne bir iş kitabı (B64 v2, A27-A29).** Kitap ortak dolaptaki bir klasördür. İçinde `SKILL.md` (ne zaman kullanılır, girdiler, adımlar, kararlar, "bitti" kontrolleri, istisnalar), `files/` (betikler, şablonlar, başvuru dosyaları), `examples/` (sizin onayladığınız işler, başvuru olarak) ve `notes.md` (tarihli düzeltmeler) durur. Usta, kısa bir kimlik ile bu klasörden ibaret olur. Kitabı model seçmez, yönlendirici iliştirir.
2. **Kontroller sizin hükümlerinizden çıkar (A9).** Her reddiniz ilgili iş türünde bir geçti/kaldı kontrolüne dönüşür; örneğin "büyük ekranda çizgi film gibi", "ortam ürüne uymuyor". İşi yapan değil, temiz bağlamlı ayrı bir denetçi bu kontrolleri sizin gözünüzden önce koşar. Sizin hükmünüzle kontrolün hükmü yan yana kaydedilir. Bir iş türünde ikisi sürekli tuttuğunda, gözünüzü o türden kaldırmanın dayanağı bu kayıt olur.
3. **Personalar kısalır (C41).** Kimlik tonu taşır; asıl içerik kitaba geçer, ilgisiz ayrıntı atılır.
4. **Araçlar gerektiğinde yüklenir ve koltuk bir çalışma tezgâhı alır (B41).** Tezgâh, iki duvar arkasında dosya ve komut satırı demek; 4 Ekim emriniz bu.
5. **Kitabı ustası yazar, düzeltme onayla kurala döner.** Bir ders önce kaydedilir; ancak sizin ya da işin sahibinin onayıyla kitapta kurala dönüşür. Bu, holdingin "hafıza notu kanun değildir" ilkesiyle aynı.
6. **Ölçerek büyütülür.** Aynı işler dört düzende denenir: kitapsız, kitap elle verilerek, kitabı yönlendirici seçerek ve buna ek olarak ayrı bir denetçiyle. Karar, kabul edilen iş başına maliyete bakılarak verilir.
7. **İnşaat sistemi olduğu gibi kalır.**
