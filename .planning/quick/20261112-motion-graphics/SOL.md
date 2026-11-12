# Sol — the blind audits of this job (GPT-6.1 Sol, read-only, 2026-11-12)

## 1. The plan audit (before the build) — three A, four B; all seven applied in PLAN.md §7

**Kısmen. Plan ana yöntemi taşıyor; fakat mevcut haliyle talebi tam karşılamıyor. Üç A engeli ve dört B bulgusu var.** Denetim salt okunur yapıldı; hiçbir dosyaya yazılmadı.

Brief’i tek başına okurken çıkardığım kabul koşulları: “önce kendi stüdyolarımızı kullanacağız”, mevcut olanı yeniden yazmayacağız, videonun yöntemini geliştirerek aktaracağız ve sonuç CEO’nun bakabileceği gerçek, “wow dedirtecek”, “Ferrari seviyesinde” bir film olacak. Başlıca riskler; örnek estetiği genel yasağa çevirmek, çalışanlara yalnız okunabilen bir skill teslim etmek ve teknik render başarısını görsel kaliteyle karıştırmaktı.

1. **A — Çalışanların skill’i okuyabilmesi, filmi üretebilmesi sayılıyor.**

   **Claim:** Planın 5–12. satırları, plugin ve grant ile iki kullanıcı grubuna da çalışan bir skill teslim edileceğini söylüyor.  
   **Verdict:** **REFUTED**  
   **Finding:** [plan.md:11](/home/dxb/DxB%20Global%20OS/.planning/quick/20261112-motion-graphics/blind/plan.md:11) çalışanlara grant veriyor; üretim ise dışarıdaki `mg.mjs` komutuna dayanıyor. Çalışan skill’i açtığında bu komutu çalıştıracağı yol tanımlanmamış.  
   **Evidence:** [runtime-profile.ts:137](/home/dxb/DxB%20Global%20OS/packages/gateway/src/runtime-profile.ts:137) plugin grant’inin yalnız `Skill` ve plugin dizinine sınırlı `Read` getirdiğini gösteriyor. Araç yetkileri ayrıca profilden geliyor. [kisayol/SKILL.md:70](/home/dxb/DxB%20Global%20OS/packages/gateway/plugins/kisayol/skills/kisayol/SKILL.md:70) bile üretim yetkisi olan koltuk ile işi oturuma devreden koltuğu ayırıyor.  
   **Correction required:** Çalışanın `mg` üretimine ulaşacağı mevcut araç/devir yolu belirtilmeli ve derlenmiş çalışan profiliyle inşaat motorunda uçtan uca sınanmalı. Şirkete dağıtımın kendi sırasını beklemesi kusur değil.

2. **A — Örnek reklam sınırlaması bütün müşteri reklamlarına uygulanıyor.**

   **Claim:** Holdingin sahip olmadığı markalarla yapılan filmler “Spec ad. Not affiliated…” ile bitecek; yayımlanmayacak ve ücretli reklamda kullanılmayacak.  
   **Verdict:** **REFUTED**  
   **Finding:** [plan.md:63](/home/dxb/DxB%20Global%20OS/.planning/quick/20261112-motion-graphics/blind/plan.md:63) müşterinin sipariş ettiği kendi marka reklamını da kapsıyor. Holding müşterinin markasına sahip olmayacağı için skill, ajansın gerçek teslimatını engeller ve yanlış bir ilişkisizlik beyanı üretir.  
   **Evidence:** [method.md:212](/home/dxb/DxB%20Global%20OS/.planning/research/watch-links/2026-11-12-motion/method.md:212) bu sınırı **spec ads** için taşıyor. [B43.md:13](/home/dxb/DxB%20Global%20OS/.planning/board-rows/B43.md:13) ise müşterinin kampanyasını ilk brief’ten son teslimata kadar üretmeyi görev olarak koyuyor.  
   **Correction required:** Sınır, yetkilendirilmiş müşteri işi ile bağımsız örnek reklamı ayırmalı. İki deneme filminin spec olarak tutulması uygun.

3. **A — Videonun belirli görünümü bütün işlerin zorunlu görünümüne dönüşüyor.**

   **Claim:** Her işte tek ışık, sığ alan derinliği, ortalanmış konu, sürekli hareket ve yalnız kelime kelime kayan yazı kullanılacak.  
   **Verdict:** **REFUTED**  
   **Finding:** [plan.md:36](/home/dxb/DxB%20Global%20OS/.planning/quick/20261112-motion-graphics/blind/plan.md:36) ve [plan.md:44](/home/dxb/DxB%20Global%20OS/.planning/quick/20261112-motion-graphics/blind/plan.md:44), bir yöntemi tek görsel kalıba kapatıyor. Örneğin düz kinetik tipografi işinde alan derinliği; marka yönlendirmesinde farklı ışık veya yazı hareketi gerektiğinde bu kurallar işi yanlış biçimde reddeder.  
   **Evidence:** [method.md:161](/home/dxb/DxB%20Global%20OS/.planning/research/watch-links/2026-11-12-motion/method.md:161) bunları videonun önerileri olarak taşıyor; bütün holding işleri için CEO kararı olarak taşımıyor. Üstelik AirPods örneğinde yazılar kenarlarda ve fade ile geliyor ([method.md:278](/home/dxb/DxB%20Global%20OS/.planning/research/watch-links/2026-11-12-motion/method.md:278)). CEO’nun kayıtlı hükmü, örneklerin kalite çıtasını göstermesi ve her işin görünümünün brief’inden çıkması: [ceo-approvals.json:3084](/home/dxb/DxB%20Global%20OS/scripts/governance/ceo-approvals.json:3084).  
   **Correction required:** Bunlar gerekçeleriyle açılan yaratıcı teknikler olmalı. İşin onaylı yönüyle çelişen genel görsel yasaklar kaldırılmalı. Brief’in açıkça istediği storyboard ve dönüşüm yöntemi korunmalı.

4. **B — “Mevcut olan çağrılır, yalnız eksik yazılır” iddiasının karşılığı eksik.**

   **Claim:** `mg` mevcut araçları çağıran ince bir katman olacak; yalnız eksikleri ekleyecek.  
   **Verdict:** **UNVERIFIED**  
   **Finding:** [plan.md:66](/home/dxb/DxB%20Global%20OS/.planning/quick/20261112-motion-graphics/blind/plan.md:66) HyperFrames çağrılarını açıklıyor; fakat `kisayol`, mevcut tasarım becerileri, ScrollCraft ve hazır materyal kaynaklarının hangi ihtiyaçta açılacağını göstermiyor. Bunların yerine ikinci bir tarif veya zanaat kütüphanesi yazılmayacağı henüz doğrulanamıyor. Fiilen kopya yazılmış olduğunu söylemiyorum.  
   **Evidence:** [B84.md:62](/home/dxb/DxB%20Global%20OS/.planning/board-rows/B84.md:62) ortak dolabı; [B84.md:109](/home/dxb/DxB%20Global%20OS/.planning/board-rows/B84.md:109) hazır HDRI ve malzemeleri taşıyor. [register-design-skills.mjs:33](/home/dxb/DxB%20Global%20OS/scripts/library/register-design-skills.mjs:33) Emil Kowalski’nin becerilerinin zaten `dxb-design` içinde bulunduğunu gösteriyor.  
   **Correction required:** Skill’in ilgili adımlarından mevcut kaynaklara doğrudan yönlendirme eklenmeli; yeni kitin hangi somut boşluğu doldurduğu belirtilmeli. Her ince sarmalayıcıyı yeniden yazım saymak da yanlış olur.

5. **B — İşe özel teknik değerler genel teslimat kuralı oluyor.**

   **Claim:** Final daima 4K; hız 25/30 fps veya basamaklı 2D’de 24 fps; film −14 LUFS olacak ve bu stüdyonun genel rakamı.  
   **Verdict:** **REFUTED**  
   **Finding:** [plan.md:52](/home/dxb/DxB%20Global%20OS/.planning/quick/20261112-motion-graphics/blind/plan.md:52) ve [plan.md:57](/home/dxb/DxB%20Global%20OS/.planning/quick/20261112-motion-graphics/blind/plan.md:57), teslimat ihtiyacından bağımsız değerler koyuyor. Örneğin başka kare hızındaki çekime birleşecek bir film için kaynakla uyum yerine sabit liste uygulanır.  
   **Evidence:** −14 LUFS kaydı [B43.md:132](/home/dxb/DxB%20Global%20OS/.planning/board-rows/B43.md:132) içinde **UGC bitirme zincirine** ait. Videonun final çözünürlük ve codec ayarları gösterilmemiş ([method.md:88](/home/dxb/DxB%20Global%20OS/.planning/research/watch-links/2026-11-12-motion/method.md:88)); 24 fps önerisi ise lisansı belirsiz kopyanın eklerinden geliyor ([method.md:199](/home/dxb/DxB%20Global%20OS/.planning/research/watch-links/2026-11-12-motion/method.md:199)).  
   **Correction required:** Bunlar bağlamı belirtilmiş başlangıç değerleri olmalı; gerçek çözünürlük, kare hızı ve ses hedefi işin mecrasından ve teslimat brief’inden çıkmalı.

6. **B — Dosyayı olay anına koymak, duyulan etkiyi o ana yerleştirmeyi garanti etmiyor.**

   **Claim:** `window.EVENTS` üzerinden yerleştirilen sesin vuruşa uzaklığı “by construction” 0 ms olacak.  
   **Verdict:** **REFUTED**  
   **Finding:** [plan.md:49](/home/dxb/DxB%20Global%20OS/.planning/quick/20261112-motion-graphics/blind/plan.md:49). İçinde başlangıç sessizliği bulunan bir efekt veya doruğu 300 ms sonra gelen bir whoosh, dosya başlangıcı doğru yerde olsa bile görsel vuruşu kaçırır.  
   **Evidence:** Kaynağın ses sözleşmesi başlangıç, doruk ve bitişi ayrı hizalama noktaları olarak taşıyor: `align: peak|start|end` ([method.md:200](/home/dxb/DxB%20Global%20OS/.planning/research/watch-links/2026-11-12-motion/method.md:200)). Planın testleri bu ayrımı kapsamıyor.  
   **Correction required:** Cue, hangi ses noktasının hangi olaya oturacağını belirtmeli; ölçüm son render’ın çözülmüş sesinde yapılmalı. “0 ms” yalnız zaman çizelgesindeki dosya başlangıcından çıkarılmamalı.

7. **B — Müşteri teslimatında CEO’nun son bakışı akışta eksik.**

   **Claim:** Teknik doğrulama ve doğrulanamayanların listelenmesiyle film teslim edilir.  
   **Verdict:** **REFUTED**  
   **Finding:** [plan.md:60](/home/dxb/DxB%20Global%20OS/.planning/quick/20261112-motion-graphics/blind/plan.md:60) son teslimat adımında CEO kapısını taşımıyor. Planın sonunda CEO bakışı iki deneme filmi için açık; skill’in ilerideki müşteri teslimatı için açık değil. Storyboard’u yaratıcı yönetmenin onaylaması bu son kapının yerine geçmez.  
   **Evidence:** [ceo-approvals.json:3078](/home/dxb/DxB%20Global%20OS/scripts/governance/ceo-approvals.json:3078), ilk ücretli işten başlayarak ilk teslimat ve revizyonların müşteriye gitmeden CEO’nun bakışını beklemesini şart koşuyor.  
   **Correction required:** Mevcut teslimat/onay kapısına bağlantı eklenmeli; yeni bir onay sistemi yazılmamalı.

Çürütme girişiminden sonra ayakta kalan iddialar:

- **Claim:** Storyboard → üretim → hareket incelemesi → kilitli görüntü → ses sırası. **Verdict: STANDS AFTER ATTEMPTED REFUTATION.** Yöntem notu bunu taşıyor; düzeltme gerekmiyor.
- **Claim:** Gemini API ile 10 fps hareket okuma holdingde mevcut. **Verdict: STANDS AFTER ATTEMPTED REFUTATION.** [B84.md:86](/home/dxb/DxB%20Global%20OS/.planning/board-rows/B84.md:86) bunu doğruluyor. Bu, teknik hareket incelemesidir; CEO kabulünün yerine geçmez.
- **Claim:** Müzik kararı ve HyperFrames’in güncel sürüm/5 saniyelik test koruması doğru aktarılmış. **Verdict: STANDS AFTER ATTEMPTED REFUTATION.** Müzik kayıtları ve [YE03:52](/home/dxb/DxB%20Global%20OS/.planning/quick/20261014-tahta-sirasi/HIS-WORDS-2026-10-15.md:52) planı destekliyor; düzeltme gerekmiyor.

**Ferrari seviyesinde sonuç üretileceği UNVERIFIED:** bu bir plan denetimi; ortaya çıkmış film yok. Gerçek materyalli, yalnız skill ve brief ile üretilen denemeyi CEO’nun izlemesi uygun kabul yoludur. C sınıfında eski bir kusuru bu işin bulgusu olarak açmadım.

## 2. The code audit (commits e67611a9, 3bc81e6e) — not clean; A: findings 4, 5, 6 · B: 1, 2, 3, 9 and parts of 5-8

Status 2026-11-12, evening: the document findings (1, 3) were fixed in 6c9f8825; the code and test findings (2, 4, 5, 6, 9, verify.mjs's line in 3) are fixed in the commit that carries this line — each with a test that was red before; the battery then ran all 59 of the job's tests, none skipped (`battery-2.out`: 31 inside the wall, 25 + 3 in the host half; BATTERY_GREEN). No second audit round. Left open, named by the fixer: the guard page draws on a 2D canvas, so a WebGL picture frozen under seek is not proven by it; a script loaded from another host is not read for WebGL; `masterOf` is ambiguous for a format named like `a-2x`; `mg`'s own process runner has no timeout. Findings 7 (the kit on a GPU) and 8 (licence proofs, listening) stand as Sol left them.

**Kısmen karşılıyor; bu iki commit için temiz denetim veremiyorum.** Ana yöntem taşınmış, fakat ses doğrulaması eksik cue’yu geçirebiliyor, yazılım GL kontrolü açık kalabiliyor ve çıktı yolları iş klasöründen kaçabiliyor.

Denetim salt okunur yapıldı. İncelenen dosyalar `3bc81e6e` ile aynı; kök `package.json` iki commit’te de değişmemiş. Bataryanın tamamını okudum: `BATTERY_GREEN`, `EXIT=0`; typecheck: `TYPECHECK_EXIT=0`. **Ancak bu bataryada işin 31 testinden 29’u atlanmış.**

Aşağıda **A: engeller**, **B: şimdi düzelt**, **C: eski işten**. C sınıfında bulgu yok.

1. **Yöntemin eksiksiz taşınması · REFUTED · B**

   **Bulgu:** Ana zincir mevcut: gerçek malzeme → onaylı storyboard → dönüşümler → görüntü kilidi → ses → inceleme. Ancak öğreticinin ikinci seviyesindeki **puppet/pin-mesh warp yöntemi**, [SKILL.md:56](/home/dxb/DxB%20Global%20OS/packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/SKILL.md:56)’da yalnızca “kesilip canlandırılır” düzeyinde kalmış; referanslarda uygulama yolu veya mevcut araç karşılığı yok. Ayrıca [storyboard.md:39](/home/dxb/DxB%20Global%20OS/packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/references/storyboard.md:39) düz kesmeye izin verirken ana skill her planın sonrakine dönüşmesini istiyor.

   **Kanıt:** `method.md` §1, Level 2’de pin-mesh warp açıkça anlatılıyor; teslim edilen referanslarda `puppet`, `pin` veya `warp` açıklaması yok.

   **Düzeltme:** Puppet tekniğini ve mevcut/lisansı uygun uygulama yolunu açıklayın; geçiş şartını dosyalar arasında tutarlı kılın.

   **Kaynak kopyalama alt iddiası:** **STANDS AFTER ATTEMPTED REFUTATION.** Kamu kopyasının 25 metnini teslimin 22 metniyle yapı ve sözcük dizileri üzerinden karşılaştırdım. Ayırt edici kod veya kural metni aktarımı bulmadım. Ortak yöntem ve cue sözleşmesi verilen kontratta zaten mevcut; bunları kopyalama kanıtı saymıyorum.

2. **Skill’in komutlarla eşleşmesi · REFUTED · B**

   Komut tablosunun ana bayrakları ve çıktı yerleri uygulamayla uyuşuyor. Bulduğum uyumsuzluklar:

   - [SKILL.md:72](/home/dxb/DxB%20Global%20OS/packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/SKILL.md:72)’deki `--4k`, zaten 3840×2160 olan işte başarısız: [picture.mjs:88](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/lib/picture.mjs:88) yalnızca 2–6 katlarını arıyor. **Ölçüm:** `scaleFor({w:3840,h:2160}, …fourK:true)` → `REFUSED 3840×2160 reaches no 4K size`.
   - [SKILL.md:94](/home/dxb/DxB%20Global%20OS/packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/SKILL.md:94)’teki `verify [file]`, verilen dosya yolunu kullanmıyor. [mg.mjs:137](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/mg.mjs:137) yolu `basename` ile atıp işin `out/` klasöründeki ada bakıyor. Başka bir dosya istendiğinde aynı adlı eski çıktı denetlenebilir.
   - Ses indeksinin [INDEX.md:9](/home/dxb/DxB%20Global%20OS/packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/sfx/INDEX.md:9) açıklaması “10 ms’lik en yüksek bölüm, `align:peak` bunu kullanır” diyor; [sound.mjs:12](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/lib/sound.mjs:12) **5 ms** kullanıyor. Gerçek dosyada `whoosh-long-airy-03.wav`: indeks **905 ms**, uygulamanın noktası **1096,28 ms**. Fark **191 ms**.

   **Düzeltme:** Yerel 4K’yı 1× kabul edin; `verify` yol sözleşmesini açık ve güvenilir yapın; peak tanımını ve indeksi aynı ölçüme bağlayın. Yazılım GL vaadinin uyumsuzluğu ayrıca 4’te.

3. **Görünüm/teslim sayısı dayatmaması; müzik ve müşteri ayrımı · REFUTED · B**

   **Bulgu:** Ana skill’in serbestlik cümlesine rağmen [references/blender.md:22](/home/dxb/DxB%20Global%20OS/packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/references/blender.md:22) tek büyük ışık ve karanlık dünyadan başlamayı; 25–28. satırlar 70–100 mm lensi, geniş diyaframı ve nesne/kameranın **daima hareketini** emir olarak veriyor. [sound.md:32](/home/dxb/DxB%20Global%20OS/packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/references/sound.md:32) son iki saniyeyi end card’a ayırıyor. [brief.md:14](/home/dxb/DxB%20Global%20OS/packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/references/brief.md:14) üç destekleyici bilgi sınırı koyuyor. Bunlar işe bağlı öneri olarak yazılmamış.

   Ayrıca [verify.mjs:11](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/lib/verify.mjs:11), göz kontrolünün şartları arasına “no frame standing still” koyuyor; §7 bunun kontrol olmamasını kararlaştırmıştı.

   **Düzeltme:** Bunları nedenleri ve kullanım koşullarıyla teknik öneriye çevirin; keyfî sayıları kaldırın.

   **Ayakta kalanlar:** Skill müzik eklemiyor. Spec-ad satırı ve yayın yasağı bağımsız spec işe özgü; müşterinin sipariş filmine uygulanmıyor.

4. **Render güvenlikleri ve sürüm koruması · REFUTED · A**

   **Bulgu:** [picture.mjs:111](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/lib/picture.mjs:111) yalnızca yakaladığı `mg:gl` satırlarını tarıyor. Satır yoksa `gl=[]` ile filmi kabul ediyor. Sadece iki ad tanınıyor: `SwiftShader`, `llvmpipe`. Sürüm korumasındaki “satır gelmeli” şartı normal render’da yok.

   [guard/index.html:57](/home/dxb/DxB%20Global%20OS/packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/templates/guard/index.html:57) WebGL açılamazsa `mg:gl no WebGL` basıyor. [hyperframes.mjs:51](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/lib/hyperframes.mjs:51) bunu yeterli satır sayıyor; GPU kanıtı aramıyor. Guard’ın hareket eden görüntüsünün gerçekten değiştiği de ölçülmüyor: seek bozulup görüntü donarken metadata ve ses doğruysa yeni sürüm kaydedilebilir.

   **Düzeltme:** WebGL kullanılan render’da eksik/belirsiz renderer kanıtını reddedin. Guard’da çalışan donanım WebGL’yi ve farklı zamanlardaki gerçek görüntü değişimini doğrulayın.

   **Ayakta kalanlar:** `--start` ve `--end=…` gerçek CLI çağrılarında reddedildi. Upload/publish/cloud çağrı yolu bulmadım. İyi sürüm kaydı, render ve verify sonrasında yazılıyor; bu aşamalardaki olağan başarısızlık eski kaydı koruyor. Depo kökü istisnası 9’da.

5. **Ses hizalaması ve yanlış filmi reddetme · REFUTED · A**

   **Bulgu:** [sound.mjs:103](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/lib/sound.mjs:103) her cue’yu bağımsız eşliyor; aynı duyulan ses birden fazla cue’yu karşılayabiliyor. Üç saniyelik gerçek bir filmde **yalnızca 1,000 s’de tek tick** ürettim. 1,000 ve 1,020 s’de iki cue bildirildiğinde ikisi de aynı tick üzerinden geçti:

   ```text
   cue 1: planned 1.000, measured 1.000, heard true, ok true
   cue 2: planned 1.020, measured 1.000, heard true, ok true
   film: ok true
   ```

   Film ve ffprobe/decoded-audio çıktıları ffmpeg ile RAM’de üretildi; üretimdeki `verifyFilm` gövdesi ve ses fonksiyonları kullanıldı, yalnızca dosya/proses sınırı bellekteki gerçek çıktılarla beslendi. Bu, tam `mg` CLI uçtan uca koşusu değildir.

   **İkinci bulgu · B:** [sound.mjs:24](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/lib/sound.mjs:24) stereo kanalları mono’ya indiriyor. Gerçek ffmpeg örneğinde `L=0.5·sin`, `R=−0.5·sin` duyulabilir stereo ses **SILENT** sayıldı. Doğru stereo kaynak/film reddedilebilir.

   **Üçüncü bulgu · B:** [verify.mjs:18](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/lib/verify.mjs:18) alpha/piksel biçimini okumuyor; `.mov` master’ın şeffaflığı hiç kontrol edilmiyor. Opaque görüntü doğru süre/boyutla geçiyor.

   **Düzeltme:** Yakın/örtüşen cue’ları birlikte sınayın; bir sesin birden çok eksik cue’yu örtmesini önleyin. Kanal enerjisini koruyun. Alpha master’ı gerçek kanal üzerinden denetleyin.

   Süre, kare sayısı, sessizlik ve loudness reddetme koşulları kodda mevcut; verilen batarya bunların çalıştırıldığını kanıtlamıyor.

6. **Testlerin gerçekten kırmızı olabilmesi · REFUTED · A/B**

   [motion-graphics.test.ts:45](/home/dxb/DxB%20Global%20OS/tests/b43/motion-graphics.test.ts:45)’te herhangi bir araç eksikse dört ana grubun tamamı atlanıyor. Blender’ın yokluğu, Blender gerektirmeyen ses ve CLI testlerini de kaldırıyor. [battery.out:8](/home/dxb/DxB%20Global%20OS/.planning/quick/20261112-motion-graphics/battery.out:8): HyperFrames ve Blender eksik; **29 skipped**. Host yarısında bu test yeniden çalışmıyor.

   | Grup | Denetim sonucu |
   |---|---|
   | **İş/görüntü — 15 test** | Gerçek render/still testleri var. Yazılım GL testi yalnızca sahte log yanıtını sınar; gerçekten yazılmış yazılım-render filminin kaldırıldığını sınamaz. 4K testi yalnızca gönderilen argümanı sınar. **Board testi**, çizilen PNG’de planların bulunduğunu ölçmez: planları çizen döngü kaldırılıp JSON ve footer bırakılırsa mevcut kontroller geçer ([test:292](/home/dxb/DxB%20Global%20OS/tests/b43/motion-graphics.test.ts:292)). **B** |
   | **Ses — 7 test** | Start/peak için bağımsız zaman ölçümleri iyi. **End hizalaması testi yok.** Yakın/örtüşen tekrarlar ve stereo fazı yok. Loudness beklentisi [test:105](/home/dxb/DxB%20Global%20OS/tests/b43/motion-graphics.test.ts:105)’te üretimle aynı ebur128 regex’inden hesaplanıp hedef yapılıyor; ortak okuma hatasını kaçırabilir. **B** |
   | **Sürüm koruması — 3 test** | Başarı yolu gerçek araçla yazılmış. Başarısız guard testi render’ın gerçekleştiğini veya süre nedeniyle reddedildiğini doğrulamaz; npm hatası da aynı beklentileri karşılar ([test:419](/home/dxb/DxB%20Global%20OS/tests/b43/motion-graphics.test.ts:419)). Donmuş görüntü/eksik WebGL yok. **B** |
   | **Blender başlatma — 4 test** | Bellek sorgusu sahte; çalıştırılan örnek Workbench kullanıyor. Bu grup gerçek VRAM sorgusunu, Cycles GPU’yu veya kit seçimini kanıtlamaz. Ayrı kit testleri bu ayrımı açıkça taşımıyor. **B** |
   | **Depo — 2 test** | Yardım ve package hash’i ölçülüyor. Ana 29 test atlandığında da bu grup geçiyor; bu koşu render’ın depoyu koruduğuna kanıt olamaz. **A: kanıt eksikliği** |

   **Düzeltme:** Araç gereksinimini test bazında ayırın; bu makinedeki gerekli gerçek testleri çalıştıran zorunlu koşu sağlayın. Eksik senaryoları ekleyin; görsel çıktıyı yalnızca dosya imzasıyla doğrulamayın.

7. **Blender kit · UNVERIFIED — GPU kısmı; diğerleri STANDS AFTER ATTEMPTED REFUTATION**

   **Kanıt:** Blender **5.2.4** içinde, disk üretmeyen kit test gövdelerini çalıştırdım:

   ```text
   READ_ONLY_PASS keyframe_eases_and_the_easing_changes_the_curve
   READ_ONLY_PASS orbit_keeps_the_radius_and_lands_on_its_angles
   GET_DEVICES_CALLS []
   ```

   [kit.py:135](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/blender/kit.py:135) güvenli `get_devices_for_type` çağrısını kullanıyor. Hazır primitive sahne üretmiyor; primitive test nesneleri test dosyasında.

   **Sınır:** Bu ortam GPU aygıtı göstermedi; seçim CPU’ya düştü ve OptiX testi başarısız oldu. Bunu kit arızası saymıyorum. Tam kit testi geçici dosyalar üretir; “hiçbir yere yazma” sınırınız altında çalıştırmadım.

   **Gerekli kanıt · B:** GPU erişimli ortamda tam `test_kit.py` çıktısı ve gerçek Cycles/OptiX render’ı.

8. **Ses dosyaları, lisans ve müzik olmaması · UNVERIFIED**

   **Doğrulanan:** Commit’teki **89/89 WAV** hem `INDEX.md` hem `LICENCES.md` içinde; eksik veya hayalet kayıt yok. **89/89 dosya 48 kHz, 24-bit.** Atıflar kaynak ve özgün dosya adını taşıyor.

   **Lisans metinleri:** Alıntılardaki CC0 atamaları ticari kullanım ve yeniden dağıtımla uyumlu. Kenney metinleri ticari kullanımı açıkça söylüyor; qubodup alıntısı “any use/public domain/CC0” diyor. Pixabay ve Sonniss’in kütüphane dağıtımı sınırlamaları belirtilmiş; bunlardan dosya paketlenmemiş.

   **Doğrulanamayan · B: kanıt:** Beş Kenney ve altı OpenGameArt kaynağındaki alıntıların aslını, dosya-kaynak eşleşmesini ağ olmadan bağımsız doğrulayamadım. İndeks, dosyaların dinlenmediğini de açıkça söylüyor. Sayısal/spektral özellikler **“hiçbiri müzik değil”** hükmünü tek başına kanıtlamaz.

   **Düzeltme:** Özgün lisans kanıtlarını saklayın; müzik/efekt sınıflamasını dinleyerek doğrulayın. Peak indeksi kusuru 2’de.

9. **Klasör sınırları, sırlar, dış servisler ve kök dosya · REFUTED · B**

   **Bulgu:** [job.mjs:97](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/lib/job.mjs:97) format adında yol parçalarını kabul ediyor. [picture.mjs:42](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/lib/picture.mjs:42) bunu doğrudan çıktı yoluna katıyor. Salt okunur hesap:

   ```text
   job.dir = /jobs/example
   format.name = ../../../../outside
   stillsDirectory = /outside
   ```

   Sonraki `mkdirSync` ve snapshot çıktısı iş klasörünün dışına gider.

   Ayrıca [layOutJob:78](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/lib/job.mjs:78) depo kökünü iş klasörü yapmayı engellemiyor. Böyle bir iş açılırsa [hyperframes.mjs:33](/home/dxb/DxB%20Global%20OS/tools/motion-graphics/lib/hyperframes.mjs:33)’ün `cwd:job.dir` şartı sağlanırken HyperFrames **depo kökünden** çalışır. “Asla kökten çalışmaz” garantisi uygulanmış değil.

   **Düzeltme:** Format adlarını güvenli adlarla sınırlandırın, çözülen çıktı yollarının iş klasöründe kaldığını denetleyin; gerçek yol üzerinden depo kökünü reddedin.

   **Ayakta kalanlar:** İki commit yalnızca belirtilen **115 dosyaya** dokunuyor. Kök `package.json` değişmemiş. Sır sızıntısı veya gizli upload/publish çağrısı bulmadım; npm sürüm sorgusu ve paket çalıştırma açıkça araç yolunun parçası.

Çalışanların üretim yolunun sonraya bırakılmasını kusur saymadım. İlk filmin görsel ve işitsel kalitesi bu denetimde doğrulanmış değildir; CEO kabulü çıkarılamaz. Hiçbir dosya değiştirmedim.

## 3. The friction piece — Sol's blind pass over 713fe5f4, c7ae49e4, 851336e7 (2026-11-12 night)

GPT-6.1 Sol, high, one pass, read-only. The report as it came: `SOL-FRICTION-REPORT.md`. Fable did not audit.

| # | Class | Finding | Outcome |
|---|---|---|---|
| A1 | A | The Gemini key could leave through a successful answer (the reading's text, the upload's name and address, a block reason) or through a thrown error. | Fixed: one boundary cleans everything `ask` returns or throws; an upload address that is not the service's own is refused. The four counter-examples are tests, red first. |
| A2 | A | `mg motion-read <file>` sent any file with a film's extension, also from outside the job. | Fixed: the film's real path stays inside the job folder and ffprobe finds a picture in it, before the key is read or anything is sent. The old test that expected an outside file to be sent is turned around. |
| A3 | A | The runner's time limit did not end a tool that ignores the stop signal; `DXB_MG_TOOL_TIMEOUT=Infinity` raised a raw RangeError. | Fixed: a small watch process asks the tool to stop at the limit and ends it five seconds later; a limit no timer can be set to is refused in words; the default (two hours) is proven by asking the function. |
| B1 | B | `mg sheet --window Infinity` is accepted and sends `NaN` as a time. | OPEN |
| B2 | B | An `sfx:` name is checked by its written path only; a link inside the starter set that leaves it is followed. | OPEN — `staysInside(root, path)` in `lib/job.mjs` serves it as it is. |
| B3 | B | `motion-blur.js` asks the global `document` for its layer; the claim "a still picture reads back as drawn" is stated without its condition (float16), is proven only on a fake canvas, and falls back to 8 bit silently. | OPEN |
| B4 | B | The board's sandbox tests rest on one another's page; the blur's determinism test opens a new canvas each time. | OPEN |
| B5 | B | motion-read's privacy and outside-file tests. | Fixed with A1 and A2. |
| C | C | SKILL.md's command table lacks `init --title`, `stills --format`, `hf update --guard`, `blender --need-mb`, and says `--job` of every command; CONTRACT.md says host tests skip on a missing tool; a format named `all` cannot be chosen alone; `init --dur Infinity` leaves a half-made job; the guard's host tests rest on the 0.9.37 state an earlier test leaves. | OPEN — the table lines are small text; the rest older than this piece, in this report. |

Stood after attempted refutation: items 1, 2, 3, 4, 7b, 7c, 8a, 9a, 9b as built; nothing prescribes a look or adds music; HyperFrames runs from the job folder; the root package.json is the same blob; the skill has one copy.
Not verified by anyone: the real service's daily-quota answer, a 503 and an answer slower than 200 s against the live service; float16 in HyperFrames' Chrome measured by a test; how the morph and the blur read in motion in a real film.
