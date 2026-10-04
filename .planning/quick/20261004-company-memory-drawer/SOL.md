# Sol's single pass — company memory drawer (card 4, normal, high)

Denetim sonucu: **REFUTED — çekmece sınırı henüz tam sağlanmıyor.** Kartı değiştirmeden, verilen `high` düzeyinde tek geçiş yaptım.

1. **A / P1 — Geçerli bir referans, kök içindeki başka dosyayı okutabiliyor.**  
   [obsidian.ts:76](/home/dxb/DxB%20Global%20OS/packages/memory-router/src/adapters/obsidian.ts:76) türü bağlantı çözülmeden önce denetliyor; `insideRoot` ise çözülen hedefin yalnızca kökün altında olduğunu doğruluyor. Böylece `artifact/<uuid>.md` bağlantısı, `relation/<uuid>.md` veya kökteki sıradan bir dosyaya yönlenebiliyor.

   **Kanıt:** Gerçek kaynak fonksiyonlarını bellek içi dosya sistemiyle çalıştırdığım ölçümde iki hedef de `static redirect ACCEPTED` verdi. Kök dışındaki sabit hedef reddedildi.  
   **Gerekli düzeltme:** Açılan gerçek hedef de beklenen türün ve not yolunun sınırında kalmalı; kökte bulunması tek başına yeterli olmamalı.

2. **A / P1 — Kontrol ile dosyanın açılması arasında yarış var.**  
   [obsidian.ts:94](/home/dxb/DxB%20Global%20OS/packages/memory-router/src/adapters/obsidian.ts:94) ayrı `realpath`, `stat`, `readFile` çağrıları kullanıyor. Yazıcı da dizini kontrol ettikten sonra özgün yolu `writeFile` ile yeniden çözüyor. Bu aralarda dosya veya üst dizin bağlantıya çevrilirse işlem dışarı yönlenebilir. `wx`, üst dizin bağlantısına karşı koruma sağlamaz.

   **Kanıt:** Kaynak fonksiyonlarının bellek içi yarış ölçümü: `read race CANARY opened=/outside/canary.txt`; yazıcı da başarılı referans döndürürken hedef `/outside/<uuid>.md` oldu. Bunlar gerçek diskte saldırı çalıştırılması değildir; fonksiyonların denetim sırasının yürütülebilir kanıtıdır.  
   **Gerekli düzeltme:** Açma işlemi köke atomik biçimde bağlı olmalı; doğrulama ve okuma aynı dosya tanıtıcısı üzerinden yapılmalı. Yalnız son bileşene `O_NOFOLLOW` eklemek, üst dizin yarışını kapatmaz.

3. **B / P2 — Yazıcı, reddetmeden önce dışarıda dizin oluşturabiliyor.**  
   [obsidian.ts:125](/home/dxb/DxB%20Global%20OS/packages/memory-router/src/adapters/obsidian.ts:125) `mkdir` işlemini sınır denetiminden önce yapıyor. `memory-store` dışarı yönlenen mevcut bir bağlantıysa, dışarıda `artifact` dizini oluşturulabilir; ardından işlem reddedilir.

   **Kanıt:** Ölçüm çıktısı: `effects:["mkdir /outside/artifact"]`, ardından `resolves outside the memory root`.  
   **Gerekli düzeltme:** Dizin oluşturma dahil hiçbir dosya sistemi etkisi, sınır güvenceye alınmadan gerçekleşmemeli.

4. **B / P2 — Üretim ortamındaki kök değeri şirket masasının sınırını aşabiliyor.**  
   [sdk-isolation.ts:122](/home/dxb/DxB%20Global%20OS/packages/kernel/src/sdk-isolation.ts:122) verilen herhangi bir dolu değeri koruyor. Bataryanın kendi kökünü koruması tasarım kararıdır; sorun, üretimde verilen değerin doğrulanmamasıdır.

   **Kanıt:** `node --input-type=module` ile mevcut modülde ölçtüm: repository kökü ve `var/construction-memory`, hem scheduler kökü olarak korundu hem `companyIsolation().env` üzerinden çocuğa taşındı. Göreli değer de başlangıçta korundu; okuyucu sonradan reddetti. İncelediğim `.env` ve `.env.daemon` dosyalarında bu değişken yok; **mevcut bir yanlış yönlendirme saptamadım**.  
   **Gerekli düzeltme:** Batarya istisnası korunurken üretim kökü şirket evinin doğrulanmış sınırına bağlanmalı.

İstenen altı iddianın kalan ölçümleri:

| İddia | Verdict | Sonuç |
|---|---|---|
| Done-list hedefi bütünüyle kanıtlıyor | **REFUTED** | Yukarıdaki bağlantı ve yarış durumları eksik. Ayrıca done-list 6’nın probu şirketin `work` klasörünü kullanmıyor: geçici cwd oluşturuyor, `HOME`/`PWD` değerlerini değiştiriyor ve Claude üzerinden geçmeden doğrudan Node çocuğu başlatıyor. Aynı çocuğun commit→recall turunu kanıtlıyor; scheduler ile gerçek çalışan çocuğunun aynı notu okumasını kanıtlamıyor. |
| Her üretim okuyucusu ortak korumadan geçiyor | **STANDS AFTER ATTEMPTED REFUTATION** | Paketler, araçlar, uygulamalar ve scriptlerde başka doğrudan not-ref açma yolu bulmadım. Video CLI de `readNote` kullanıyor. Testlerde dört doğrudan `readFile(root + ref)` kaldı; bunlar fixture incelemeleri. |
| Köksüz süreçler yüksek sesle reddediliyor | **KISMEN REFUTED** | Doğrudan not okuma/yazma değişkeni adlandırarak reddediliyor. Fakat bağımsız CLI/MCP/scheduler çağrıları kökü kendiliğinden almıyor. Chat ve voice mevcut `.catch(() => rows: [])` yollarında hatayı boş hafızaya çeviriyor; uygun not satırı varsa `memory_ref_broken` audit kaydı oluşuyor, cevap akışı kaybı göstermiyor. Bu yutma davranışı aralık öncesinden kalmış **C** bulgusudur. |
| Normal batarya şirket çekmecesine yazmıyor | **STANDS AFTER ATTEMPTED REFUTATION** | Vitest kökü construction klasörüne sabitliyor; sandbox şirket evini bağlamıyor. Repository’de hâlâ 33 eski artifact var: 32 Temmuz notu toplam **128.151 bayt**, canlı not **2.066 bayt**. Construction çekmecesinde 11 artifact ve 10 relation ölçtüm. Host üzerinden yanlış kök verilmesi ayrıca yukarıdaki ortam bulgusuna tabidir. |
| Reddedilen şirket evi ele alınıyor | **STANDS AFTER ATTEMPTED REFUTATION** | Kök önceden verilmemişse reddedilen ev kökü unset bırakıyor; doğrudan not işlemi reddediliyor. Chat/voice yutma sınırı geçerli. |

**✓ VERIFIED:** Ham kanıtlarda yeni test **10 passed**, hedefli testler **119 passed / 1 skipped**, batarya **1146 + 266 passed**, `BATTERY_GREEN`, `EXIT=0`. Kendi `sql_read` sorgularımda construction `memory_index=0`; `audit_log` denetim öncesi ve sonrası **1795 → 1795**.

**⚠ UNVERIFIED:** Build/typecheck için verilen kanıt klasöründe ham çıktı yok. Veri taşıma, silme, restart ve canlı okuma — done-list **7–10** — bildirildiği üzere henüz yapılmamış. Bu nedenle canlı teslim ve çalışanlarla Hamza’nın gerçek süreçler üzerinden ortak notu bulması doğrulanmış sayılmaz.
tokens used
147,194
EXIT=0
