# Plan — beyinler, konsey, kayıtlar

Opus 5.5 ve Fable 5.1, 9 Ekim 2026. Ayrıntılar `opus.md` ve `fable.md`'de, çapraz okumalar `itiraz-*.md`'de.

**Bittiğinde ekranınızda:** Tahta her işten sonra kendiliğinden güncel olur. Holdingin çalışanları günün
modellerinde çalışır; yeni bir model çıkınca tek sözünüzle ona geçer. Eski konsey ortadan kalkar; yeni
kontrol kapısının çalıştığı kayıtla görülür.

**Kanıtı:** Kayıt cetveli yeşil yanar ve bayat satır 0 çıkar; model geçişi testi yeşil yanar; kontrol kapısı
ilk gerçek kaydını yazar.

## Üç adım — biri bitmeden öbürü başlamaz

**1. Kayıtlar her zaman güncel**
- Bir işin bir kısmı bitince satır kapanmaz. Satıra tek satırlık not düşülür, örneğin "✓ 4 Eki — xhigh
  sohbet ve seste çalışıyor". Ayrıntılı hikâye satırın kendi dosyasında kalır. Satır ancak her şey bitince kapanır.
- Her işin sonunda o işin satırı aynı anda güncellenir; bu kural kapılara yazılır. Ayrıca bir bekçi konur:
  bir satır adına iş yapılmış ama satır güncellenmemişse iş kapanırken kayıt durur ve oturum açılışında o satır
  listelenir. Bekçi yalnızca adıyla anılan işleri görür; asıl güvence kuralın kendisidir.
- B51 satırı bugünkü duruma göre yeniden yazılır.
- "Plan konuşacağız" dediğinizde kanca, dxb-team2'yi açmamı hatırlatır.

**2. Konsey**
- Eski konsey (GLM, Kimi, Qwen) koddan tamamen silinir; ona yanlış atıf yapan beş yer düzeltilir.
- Yeni kontrol kapısı bir kez gerçek yolundan çalıştırılır: bir strateji işini Opus yazar, iki model
  çürütmeye çalışır, sonuç kayda düşer. Aynı deneme, 5 Eylül'den beri yeni iş görmeyen hattın hâlâ
  çalışıp çalışmadığını da gösterir.

**3. Beyinler sabit kalmasın**
- Bugün bir çalışanın modeli beş ayrı yerde yazılı. Model değişince beşi de elle değiştiriliyor; bu yüzden
  geride kalıyor. Bundan sonra tek yer model kataloğu olur.
- "Halef yap" diye tek bir kapı kurulur. "Opus 5'i 5.5'e geçir" dediğinizde 28 iş kuralı ve 33 çalışan tek
  seferde geçer. Eski model emekliye ayrılır ama silinmez; geçiş tek tıkla geri alınır.
- İlk geçiş sizin istediğiniz: Opus 5'ten 5.5'e, Sonnet 5'ten 5.5'e. Fable 5.1 günün en akıllı modeli olarak
  kalır. Fiyatlar resmi tablodan, kurulum günü kontrol edilerek yazılır.
- Düşünme seviyesi (hamle 3): kritik kararlar medium'dan xhigh'a, kod yazımı high'a çıkar; ucuz işler low'da kalır.
- 2. adımda ölçüldü (9 Eki): çalışan, modeli ve düşünme seviyesini işin türüne göre değil seviyesine göre seçiyor; türün satırındaki ayar hiçbir işe ulaşmıyor. Tür artık görevde yazılı; bu adımda seçim önce türün satırına bakar, yoksa seviyeye düşer. Bu olmadan hamle 3'ün yükseltmeleri kâğıtta kalır.
- Paket 3'ün kod düzeltmeleri de bu adımda yapılır: iş akışı adımları çalışanın kimliği ve düşünme
  seviyesiyle çalışır; sohbetin sabit talimatı önbelleğe alınır.

**Onaydan sonra gelen sözleri (9 Ekim):** *"haiku 5.5 i mi ki sonnet 5.5 ile test edin de sonra"* — Haiku 5.5
kararından önce aynı mekanik işlerde (sınıflandırma, özet, altyazı) Sonnet 5.5 ile yan yana denenir, sonuç ona
gelir, karar sonra. Hamza için: *"işine göre verin hamzaya modeli… hamza opus 5.5 ok. önerilerinize göre yapın
o zaman."* Diğer sorularda "gerekli olanı yapın" önerilerimize onay sayıldı; API anahtarı onun adımı, bekliyor.

## Hamza — ölçtük, önerimiz

- **Bugün:** Ne orkestratör ne sözcü. Konuşuyor ama eli yok, hiçbir aracı yok. İşi bölümlere dağıtan makine
  yanında duruyor; Hamza'nın sohbet hattı ona bağlı değil.
- **Seviyesi:** Genel Müdür. Sizin niyetinizi alır, işi bölümlere dağıtır, sonucu kontrol eder ve size
  raporlar. CEO siz kalırsınız; para çıkışı, sözleşme ve kimlik adımları yine size gelir. Bu, 1 Ağustos'ta
  verdiğiniz ama henüz kurulmamış hükümdür.
- **Beyni:** İş dağıtan koltuklar (orkestrasyon ve işi bölme) için önerimiz Fable 5.1; B51 kaydında 21 Eylül
  tarihli sözünüz olarak da geçiyor: "orkestratör tamamıyla Fable 5.1 olacak". Konuşma koltukları Opus 5.5
  olur. Kritik karar koltukları Fable 5.1'de, xhigh seviyesinde çalışır. Sesli cevap, 1–1,3 saniyelik hız
  hedefiniz yüzünden şimdilik low'da kalır.
- **Eli:** Hamza'nın sohbetten iş dağıtabilmesi ayrı bir iştir; bu planın ardından kendi planıyla gelir.

## Riskler

- 3. adım şirketin canlı verisini değiştirir (iş kuralları, çalışanların modelleri). Değişiklik denetlenen
  kapıdan yapılır, kayda düşer ve tek tıkla geri alınabilir.
- Bekçi yalnızca adıyla anılan işleri görür; asıl güvence, her işin sonunda satırı güncelleme kuralıdır.
- Yeni modeli kendiliğinden öğrenmek için güvenilir bir kaynak gerekiyor; o sizin kararınız (aşağıda 4. soru).

## Sizden — her birinde önerimiz var

1. **Haiku 5.5:** Kayıtlarda üç ayrı söz var: "asla geri dönmez", "yalnızca mekanik işlerde" ve notunuzdaki
   "tekrarlayan işlerde Haiku 5.5". Önerimiz: deneme olarak, yalnızca mekanik işlerde (sınıflandırma, özet,
   altyazı) kullanılsın; karar veremesin.
2. **Yeni model çıkınca:** Önerimiz: büyük koltuklar sizin tek sözünüzle geçsin; mekanik koltuklar fiyat
   artmıyorsa kendiliğinden geçsin ve size tek satırla haber verilsin. Alternatif: her geçiş sizin sözünüzle olsun.
3. **Hamza'nın konuşma koltukları:** Önerimiz Opus 5.5. "Hamza tamamen Fable 5.1 olsun" derseniz daha pahalı
   olur ama en akıllı modelde çalışır.
4. **Yeni modeli kendiliğinden öğrenmek:** Abonelik tarafında bir model listesi var ama güncel değil; Opus
   5.5'i bile göstermiyor. Önerimiz: yalnızca model listesini okuyacak bir API anahtarı. Anahtar kasada durur,
   onu tek bir salt-okur iş kullanır; bu, "ham sağlayıcı anahtarı yok" kuralına sizin sözünüzle bir istisna
   olur. Resmi sayfanın haftalık okunması da mümkün, ama 1 Ekim'de kaldırdığınız eski gözcüye benzediği için
   önermiyoruz.
5. Plana "başla" derseniz 1. adımdan başlarız.

## Beraber çalışma — ikimizin görüşü

İki bağımsız göz planı güçlendirdi: birbirimizin yarısına toplam yedi itiraz getirdik ve hepsinde anlaştık.
Uygulamada kodu tek el yazar, öbürü kaydetmeden önce okur; Sol'un kör denetimi yerinde kalır. Bedeli, plan
aşamasında yaklaşık iki kat jeton; büyük kararlarda buna değer, küçük düzeltmede değmez.
