# DXB Global OS

## Mevcut Plan Tamamlandıktan Sonra Kalabilecek Açıklar ve Fable 5 Denetim Raporu

**Hazırlayan:** Codex — bağımsız salt-okunur mimari inceleme  
**Muhatap:** Muhittin Bey, CEO — DXB Global Holding ve Fable 5  
**Tarih:** 16 Temmuz 2026  
**Belge türü:** Kapanış öncesi kapsam ve doğruluk denetimi  
**Yetki durumu:** Bu rapor uygulama, kod değişikliği, migration, commit veya canlı sistem mutasyonu için yetki vermez.

> **Kapsam ayrımı:** Bu rapor, CEO'nun Masaüstünde hazırladığı “Fable 5'ten talep” belgesinden tamamen bağımsızdır. O belgedeki ticari felsefe, gelir hedefi, hukuk/İslami ilke tartışmaları ve yeni talepler burada değerlendirilmemektedir. Bu rapor yalnızca mevcut proje korpusu, canonical roadmap, kaynak kod, şema, çalışan servisler ve canlı veri durumuna dayanır.

---

# 1. Yönetici hükmü

Canonical `IMPLEMENTATION_ROADMAP.md` baştan sona tamamlanıp bütün E satırları kapatılsa dahi DXB Global OS'un bazı kritik çalışma kabiliyetleri eksik kalabilir.

Bunun nedeni şudur:

> **Roadmap satırlarının %100 kapanması, hedeflenen ürün kabiliyetlerinin %100 gerçekleştiğini tek başına kanıtlamaz.**

İnceleme anında canonical E tablosunda:

- Toplam E satırı: **57**
- Kanıtla kapalı görünen: **50**
- Açık kalan: **7**
- Roadmap satırı bazında kapanış: yaklaşık **%87,7**

Açık yedi satır E12.2–E13.2 aralığındadır. Bunlar ağırlıklı olarak widget layout, rota bütünlüğü, CRM/company context, workforce completeness, operational readiness, tam test turu ve CEO görsel kabulüdür.

Bu maddeler önemlidir; ancak normal task kuyruğunu 24/7 işleyen gerçek resident worker, gerçek tool/MCP execution, grant'ların runtime enforcement'ı, gerçek provider handler'ları ve bazı ertelenmiş ürün kabiliyetleri için açık bir canonical uygulama satırı bulunmamaktadır.

Dolayısıyla mevcut plan hiçbir düzeltme yapılmadan tamamlanırsa ortaya şu risk çıkar:

> Dashboard, organizasyon, audit ve test yüzeyleri “tamamlandı” görünürken dijital çalışanların gerçek araçlarla dış dünyada iş yapma kabiliyeti eksik kalabilir.

---

# 2. Kaynak otoritesi ve kapsam sınırı

## 2.1 Canonical yürütme kaynağı

Bağlayıcı yürütme tablosu:

`HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md`

Eski GSD roadmap'i:

`.planning/ROADMAP.md`

dosyanın başında açıkça **“SUPERSEDED FOR EXECUTION”** olarak işaretlenmiştir. Bu nedenle eski Phase 8–11 vaatleri, canonical roadmap'e taşınmadıkları sürece otomatik olarak kalan iş kabul edilemez.

## 2.2 Bu denetimin sorduğu soru

Bu raporun tek ana sorusu:

> “Canonical roadmap'teki kalan yedi madde eksiksiz tamamlanırsa, mevcut kod ve mimari üzerinde hangi kabiliyet açıkları yine de kalabilir?”

## 2.3 Bu denetimin sormadığı sorular

Bu rapor şunları değerlendirmez:

- Holdingin yeni ticari hedefleri
- Yeni revenue-first anayasa önerileri
- CEO'nun yeni talep belgesindeki tercihler
- Haram/helal veya hukuki politika tartışmaları
- Yeni departman kurulup kurulmaması
- Fable Method'un organizasyona nasıl uygulanacağı

Bu konular CEO ile ayrıca konuşulmalıdır.

---

# 3. Kalan canonical roadmap maddelerinin gerçek kapsamı

| Madde | Kapsam | Bu rapordaki kritik execution açıklarını kapatır mı? |
|---|---|---|
| E12.2 | CEO dashboard widget ekle/kaldır/taşı ve layout persist | **Hayır** |
| E12.3 | Route completeness ve ModuleWaiting=0 | **Hayır; yalnız UI/rota bütünlüğü** |
| E12.4 | CRM, company context ve şirketler arası veri izolasyonu | **Kısmen; CRM seam'i** |
| E12.5 | Workforce completeness, persona/skill/MCP/permission/budget kapsamı | **Kısmen; runtime tüketimi ayrıca kanıtlanmalı** |
| E13.0 | Restore, rollback, accessibility, failure path, pagination/performance | **Kısmen; recovery ve operasyonel dayanıklılık** |
| E13.1 | L1–L6 tam test turu | **Açıkları yakalayabilir; onları kendiliğinden inşa etmez** |
| E13.2 | CEO görsel kabul oturumu | **Hayır; görsel/ürün kabulü** |

Önemli ayrım:

> **Bir test maddesi eksik capability'yi inşa eden uygulama maddesi değildir. Test alarmdır; motor değildir.**

---

# 4. Plan tamamlandığında kalabilecek kritik açıklar

## F-01 — Normal task kuyruğu için production resident worker

**Önem:** CRITICAL  
**Mevcut plan kapsamı:** Açık bir kalan E satırında yok  
**Yanlış kapanış riski:** Çok yüksek

`runWorkerOnce` fonksiyonu tanımlı ve testlerde çağrılıyor. Ancak normal `tasks` kuyruğunu production ortamında sürekli tüketen resident worker çağrı zinciri bulunmadı.

Scheduler şu aileleri ele alıyor:

- intent intake,
- workflow,
- outbox,
- HR,
- Library,
- health/alert sınıfı işler.

Fakat normal task execution için `runWorkerOnce` fonksiyonunu sürekli çağıran üretim döngüsü görünmüyor.

Eski veya tamamlanmış maddelerde “Phase-7 resident worker bunu daha sonra bağlar” şeklinde sınır kayıtları bulunuyor. Buna rağmen canonical roadmap'in açık kalan satırlarında bu işi üstlenen bir madde yok.

### Neden önemlidir?

CEO intent'i alınabilir, sınıflandırılabilir ve task satırı üretilebilir. Fakat task'ın manuel test çağrısı olmadan kendiliğinden çalışması garanti değildir. Bu, anti-babysitting hedefinin önündeki doğrudan engeldir.

### Fable 5'in istemesi gereken kanıt

1. Production ile aynı servis topolojisi ayağa kalkar.
2. CEO intent yüzeyinden gerçek bir intent gönderilir.
3. Hiçbir geliştirici `runWorkerOnce` veya özel test helper'ı çağırmaz.
4. Task kuyruktan kendiliğinden alınır.
5. `agent_runs` satırı doğar.
6. Task terminal duruma ulaşır.
7. Servis restart sonrası kuyruğun devam ettiği kanıtlanır.

Bu zincir yoksa resident execution tamamlanmış sayılamaz.

---

## F-02 — Normal worker gerçek araç yüzeyi kullanmıyor

**Önem:** CRITICAL  
**Mevcut plan kapsamı:** Yok  
**Yanlış kapanış riski:** Çok yüksek

`packages/orchestrator/src/worker-shim.ts` içindeki default execution yolu Agent SDK'yı boş araç listesiyle çalıştırıyor:

`tools: []`

Bu nedenle default worker gerçek MCP/gateway araçlarını kullanmadan metinsel sonuç üretebilir.

Observability katmanı tool call kaydetmeye hazır olsa da çalışma zamanında modele araç verilmemesi hâlinde gerçek tool call üretilemez. Testlerde sahte executor ile `tool_calls` satırı üretilmesi, default production executor'ın gerçek araç kullandığını kanıtlamaz.

### Yanlış tamamlanma örneği

- Task succeeded olur.
- Agent run kapanır.
- Model metin çıktısı üretir.
- Hook çıktı biçimini kabul eder.
- Fakat hiçbir gerçek araştırma, dosya, CRM, platform veya provider işlemi yapılmamıştır.

### Fable 5'in istemesi gereken kanıt

1. Gerçek bir çalışan için runtime gateway profili derlenir.
2. İzinli araç Agent SDK oturumunda görünür.
3. Çalışan izinli aracı gerçekten çağırır.
4. Çağrı `tool_calls` tablosuna aynı `run_id` ile yazılır.
5. Araç çıktısı task sonucunda kanıt olarak referanslanır.
6. İzin verilmeyen araç listede görünmez veya gateway tarafından reddedilir.
7. Ham credential modele veya tool parametresine sızmaz.

---

## F-03 — Workflow executor da gerçek araç yüzeyi kullanmıyor

**Önem:** CRITICAL  
**Mevcut plan kapsamı:** Yok  
**Yanlış kapanış riski:** Yüksek

`packages/kernel/src/workflow/executor.ts` içindeki Agent SDK yolu da `tools: []` kullanıyor.

Workflow'ların create/run smoke testini geçmesi, workflow adımının dış dünyada gerçek iş yaptığı anlamına gelmez. Bir workflow yalnızca metinsel çıktı üreterek `succeeded` olabilir.

FABLE Hook spec içinde workflow executor'ın aynı hook binding'ini ve execution yolunu “P7 worker unification” sırasında benimseyeceği yazılmıştır. Ancak bu unification için açık kalan canonical roadmap satırı bulunmamaktadır.

### Fable 5'in istemesi gereken kanıt

- Workflow gerçek bir tool step çalıştırır.
- Pre-task hook geçmeden araç görünmez.
- Her tool çağrısı aynı run zincirine bağlanır.
- Post-task hook gerçek evidence package'i kontrol eder.
- Pause/cancel/timeout sinyalleri gerçek araç turunda etkili olur.
- Normal task runner ile workflow runner farklı güvenlik anayasaları uygulamaz.

---

## F-04 — Library grant → gateway profile → runtime worker zinciri tamamlanmamış

**Önem:** CRITICAL  
**Mevcut plan kapsamı:** E12.5 tarafından kısmen kapsanabilir  
**Yanlış kapanış riski:** Çok yüksek

Library tarafında grant/revoke ve gateway profile compilation mekanizması bulunuyor. Ancak inceleme anında canlı `library_grants` sayısı sıfırdı. Daha önemlisi, normal worker'ın derlenmiş çalışan profilini alıp Agent SDK araç yüzeyine bağladığı bir runtime tüketim yolu bulunmadı.

E12.5 her çalışanın skill/MCP/permission/budget zincirini raporlayabilir. Fakat DB'de grant bulunması ile o grant'ın gerçek oturumda enforcement üretmesi farklı kanıtlardır.

### Tamamlanma kanıtı

1. Çalışana belirli bir tool grant edilir.
2. Profil yeniden derlenir.
3. Yeni run'da tool görünür ve çalışır.
4. Grant revoke edilir.
5. Profil hash'i değişir.
6. Yeni run'da aynı tool görünmez veya reddedilir.
7. Eski oturum/grant cache'i yetkiyi sürdürmez.

---

## F-05 — Agent Orchestration Spec ile gerçek runner arasında uygulama boşluğu

**Önem:** HIGH  
**Mevcut plan kapsamı:** Açık bir kalan satır yok  
**Yanlış kapanış riski:** Yüksek

`AGENT_ORCHESTRATION_SPEC.md` şu yaşam döngüsünü vaat ediyor:

> spawn → hook pre-gate → model seçimi → gerçek SDK yürütmesi → tool/file/decision kayıtları → kontrol sinyalleri → hook post-gate → kapanış

Spec ayrıca `packages/orchestrator/runner` adlı yeni bir runner bileşeni öngörüyor. Gerçek kodda ise ana yol `worker-shim.ts` üzerinden ilerliyor.

Bu durum iki ihtimal doğurur:

1. Spec'in runner tasarımı bilinçli olarak iptal edilmiştir fakat karar kaydı eksiktir.
2. Runner işi plan dışına düşmüştür.

Her iki durumda da Fable 5 bunu “zaten kapalı” varsaymamalı; kararın ve uygulamanın eşleşmesini doğrulamalıdır.

---

## F-06 — Gerçek dış dünya outbox handler'ları yok

**Önem:** CRITICAL  
**Mevcut plan kapsamı:** CRM dışında kalan yedi maddede yok  
**Yanlış kapanış riski:** Yüksek

Outbox executor çekirdeği güçlüdür:

- approval tekrar kontrolü,
- idempotency,
- audit,
- retry/failure disiplini

mevcuttur.

Ancak `packages/outbox-executor/src/actions/index.ts` handler registry'sinde gerçek provider işlemleri yerine yalnızca zararsız proof handler bulunuyor.

Dolayısıyla approval ve outbox tablolarının bulunması, sistemin gerçekten e-posta gönderdiği, sözleşme oluşturduğu, ödeme bağlantısı ürettiği veya platformda işlem yaptığı anlamına gelmez.

### Fable 5'in istemesi gereken kanıt

En az bir staging provider için:

1. İşlem taslağı oluşur.
2. Gerekli approval sınıfı doğru belirlenir.
3. Onay verilmeden handler çalışmaz.
4. Onay sonrası handler yalnız bir defa çalışır.
5. Aynı idempotency key tekrar gönderildiğinde dış işlem tekrarlanmaz.
6. Provider response ref audit'e bağlanır.
7. Credential yalnız executor tarafında kalır.

Bu kanıt production para veya müşteri verisi kullanmadan staging/sandbox üzerinde yapılmalıdır.

---

## F-07 — Sosyal, ödeme ve commerce entegrasyonları belgelerde “sonra” denmiş fakat canonical açık işe bağlanmamış

**Önem:** HIGH  
**Mevcut plan kapsamı:** Yok veya yalnız CRM ile sınırlı  
**Yanlış kapanış riski:** Yüksek

Çeşitli belgelerde aşağıdaki entegrasyonların daha sonraki execute fazlarında bağlanacağı yazıyor:

- sosyal platform API'leri,
- YouTube/TikTok platform payout ingestion,
- WooCommerce yazma yolları,
- Stripe/DocuSign,
- Revolut/Wise,
- banka/CRM otomatik revenue ingestion.

Eski `.planning/ROADMAP.md` Phase 11 bazılarını içeriyordu. Fakat bu roadmap yürütme için superseded edilmiştir. Canonical E12.2–E13.2 satırları bunları açıkça sahiplenmemektedir.

Bu nedenle Fable 5 eski roadmap'te yazılı olmalarını “gelecekte zaten yapılacak” kanıtı saymamalıdır.

### Denetim kararı

Her entegrasyon için iki yoldan biri CEO tarafından açıkça seçilmelidir:

- canonical roadmap'e kanıt ölçütlü iş olarak eklenmesi,
- isim verilerek ve gerekçesi yazılarak sonraki milestone'a ertelenmesi.

Sessiz kapsam dışı bırakma kabul edilmemelidir.

---

## F-08 — Migration geçmişi ile canlı migration ledger uyumsuz

**Önem:** CRITICAL  
**Mevcut plan kapsamı:** E13.0 tarafından kısmen kapsanıyor  
**Yanlış kapanış riski:** Yüksek

İnceleme anında repo tarafında 73 migration dosyası bulunurken canlı `supabase_migrations` geçmişi 14 migration kaydı gösteriyordu.

Canlı şemanın doğru görünmesi yeterli değildir. Şu sorular cevaplanmalıdır:

- Boş bir ortam yalnız repo migration'larıyla aynı şemaya kurulabiliyor mu?
- Migration sırası ve version ledger gerçeği temsil ediyor mu?
- Disaster recovery sonrası tekrar deploy güvenli mi?
- Staging ve production aynı migration zincirini kullanabilecek mi?

E13.0 “migration rollback tatbikatı” içeriyor. Ancak yalnız son migration'ı geri almak bu uyumsuzluğu çözmez.

### Zorunlu kanıt

1. Tamamen boş ve izole bir veritabanı oluşturulur.
2. Canonical migration komutu baştan sona çalıştırılır.
3. Şema, fonksiyon, view, trigger, RLS ve grant envanteri canlı referansla karşılaştırılır.
4. Kritik smoke akışları çalışır.
5. Restore drill sonrası aynı kontroller tekrar geçer.
6. Migration history ve repo dosya seti deterministik olarak eşleşir.

Fresh bootstrap kanıtı olmadan migration kapanışı verilmemelidir.

---

## F-09 — E13 kabul turu production capability yerine mock/demo kanıtıyla geçebilir

**Önem:** HIGH  
**Mevcut plan kapsamı:** E13.0–E13.2  
**Yanlış kapanış riski:** Çok yüksek

Mevcut testlerin önemli bölümü sahte executor, probe satırı, manuel fonksiyon çağrısı veya işlem sonrası temizlenen demo verisiyle çalışıyor. Bunlar birim ve entegrasyon doğrulaması için değerlidir; fakat production topolojisinin kendi başına çalıştığını kanıtlamaz.

### Fable 5'in ayırması gereken kanıt türleri

| Kanıt türü | Neyi kanıtlar? | Neyi kanıtlamaz? |
|---|---|---|
| Unit test | Saf fonksiyon davranışı | Servis topolojisi |
| Mock executor testi | Orkestrasyon kontratı | Gerçek Agent SDK/tool execution |
| DB probe | Trigger/fn davranışı | Kullanıcıdan dış dünyaya uçtan uca akış |
| UI E2E | Tarayıcı ve API seam'i | 24/7 worker sürekliliği |
| Sandbox provider E2E | Dış entegrasyon kontratı | Production credential ve gerçek müşteri akışı |
| Production smoke | Gerçek deployment zinciri | Uzun süreli dayanıklılık |

E13 raporu her acceptance iddiasının hangi kanıt sınıfıyla desteklendiğini açıkça yazmalıdır.

---

## F-10 — Canlı tabloların boş olması hata değildir; fakat production çalışmasının kanıtlanmadığını gösterir

**Önem:** HIGH  
**Mevcut plan kapsamı:** Dolaylı  
**Yanlış yorum riski:** Yüksek

İnceleme anındaki bazı canlı değerler:

- workflow: 0,
- workflow run: 0,
- revenue ledger: 0,
- approval: 0,
- outbox: 0,
- Library grant: 0,
- dolu training need: 0.

Bu değerler tek başına kod hatası değildir. Test mutasyonlarının temizlenmesi ve gerçek operasyonun henüz başlamamış olmasıyla açıklanabilir.

Ancak şu iddiaları da desteklemezler:

- Workflow sistemi production'da düzenli çalışıyor.
- Dijital çalışanlar gerçek araçlara sahip.
- Approval/outbox gerçek dış işlemleri yönetiyor.
- Revenue ingestion canlı.
- HR training loop aktif.

Fable 5 iki hatadan da kaçınmalıdır:

1. “Tablo sıfır, sistem yok” demek.
2. “Kod ve test var, production capability kanıtlandı” demek.

Doğru sonuç: **Implementation mevcut olabilir; production operational proof henüz yoktur.**

---

## F-11 — HR ve Library yapı taşları mevcut; aktif eğitim/capability yaşam döngüsü kanıtlanmamış

**Önem:** HIGH  
**Mevcut plan kapsamı:** E12.5 kısmen  
**Yanlış kapanış riski:** Orta-yüksek

HR tarafında create, grant, probation, evaluate ve promote fonksiyonları bulunuyor. Library tarafında katalog, grant/revoke ve profil derleme bulunuyor.

Ancak HR training job'ı eğitimi yürütmüyor; yalnızca sayım/audit üretiyor. Canlı training need ve Library grant sayılarının sıfır olması da aktif eğitim döngüsünün henüz işletilmediğini gösteriyor.

E12.5 workforce completeness yalnız kadro ve capability coverage raporu üretirse bu açık kapanmaz.

### Gerekli kanıt

Gerçek fakat risksiz bir çalışan sandbox'ında:

1. Performans veya capability gap tespit edilir.
2. Training need oluşur.
3. İlgili Library materyali atanır.
4. Eğitim/eval gerçekleştirilir.
5. Başarı kriteri sağlanırsa grant verilir.
6. Probation görevi gerçek tool profile ile çalışır.
7. Başarısızlıkta grant verilmez veya geri alınır.
8. Bütün kararlar audit'e bağlanır.

---

## F-12 — University bağımsız çalışan ürün katmanı olarak mevcut değil

**Önem:** MEDIUM  
**Mevcut plan kapsamı:** Yok  
**Yanlış kapanış riski:** Orta

Training library item türleri ve HR alanları bulunmasına rağmen “University” adıyla çalışan müfredat, eval, mezuniyet, sertifikasyon ve grant ilişkisi bulunan bağımsız bir ürün katmanı tespit edilmedi.

Bu bilinçli bir isimlendirme tercihi olabilir. Fable 5 önce şu kararı istemelidir:

- University ayrı bir subsystem olmak zorunda mı?
- Yoksa HR + Library + eval birleşimi bu ihtiyacı karşılıyor mu?

Karar verilmeden “University tamamlandı” veya “University eksik” şeklinde mutlak hüküm kurulamaz. Mevcut gerçek: **adı geçen bağımsız bir runtime subsystem kanıtlanmamıştır.**

---

## F-13 — JARVIS canonical kapanış kapsamına bağlı değil

**Önem:** MEDIUM / kapsam kararına bağlı  
**Mevcut plan kapsamı:** E12.2–E13.2 içinde yok  
**Yanlış kapanış riski:** Yüksek

JARVIS'in ayrı beyin değil, aynı kernel'e açılan ikinci komut kanalı olması doğru biçimde tasarlanmıştır. Ancak uygulama ertelenmiş ve `apps/jarvis/src/index.ts` esasen iskelet durumundadır.

Eski roadmap Phase 9 JARVIS'i içeriyordu; canonical yürütme pivotundan sonra kalan E satırlarında JARVIS teslimatı bulunmuyor.

Bu nedenle final kapanıştan önce kapsam açıkça etiketlenmelidir:

- “DXB Global OS core complete, JARVIS deferred” veya
- JARVIS canonical roadmap'e geri eklenir.

JARVIS eksikken ürünün ses katmanıyla birlikte tamamen teslim edildiği söylenmemelidir.

---

## F-14 — Eski roadmap, STATE ve canonical roadmap arasında durum drift'i var

**Önem:** MEDIUM  
**Mevcut plan kapsamı:** E13 raporlamasında ele alınabilir  
**Yanlış kapanış riski:** Orta-yüksek

`.planning/STATE.md` hâlâ Phase 09/JARVIS ve eski progress bilgileri taşımaktadır. `.planning/ROADMAP.md` ise superseded olmasına rağmen açık Phase 8–11 kutuları taşır. Canonical `IMPLEMENTATION_ROADMAP.md` farklı bir kapanış modeli kullanır.

Bir sonraki model veya insan aşağıdaki hatalara düşebilir:

- Yanlış roadmap'ten devam etmek,
- Kapanmış işi yeniden yapmak,
- Eski “TBD” maddelerini hâlâ binding sanmak,
- Canonical planda bulunmayan eski vaatleri otomatik kapsam saymak,
- Eski progress yüzdesini ürün olgunluğu sanmak.

### Gerekli kapanış kanıtı

- Tek canonical yürütme kaynağı açık biçimde işaretlenir.
- Superseded dosyalar tarihçe olarak korunur fakat aktif talimat üretmez.
- STATE canonical satır ve gerçek çalışma durumuyla eşleştirilir.
- Final raporda “tamamlanan kapsam” ile “ertelenen kapsam” ayrı listelenir.

---

## F-15 — Gerçek iş pilotu canonical kapanışta zorunlu görünmüyor

**Önem:** HIGH / ürün tanımına bağlı  
**Mevcut plan kapsamı:** Kalan yedi maddede yok  
**Yanlış kapanış riski:** Yüksek

Product ve Master Plan belgeleri yalnız cockpit değil, çalışan bir şirket tarafını da tarif ediyor. Eski roadmap'te Outleteuro Pilot, outward integrations ve department activation bunun kanıtıydı.

Canonical kalan satırlarda ise gerçek bir iş pilotunu zorunlu kılan açık acceptance bulunmuyor.

Bu nedenle final ürün şu iki statüden biriyle dürüstçe etiketlenmelidir:

1. **Control plane / holding OS foundation complete; real business pilot deferred.**
2. **Real business operating proof required before final completion.**

CEO hangi kapsamı seçerse seçsin, dashboard ve demo verisi gerçek iş pilotu yerine geçirilmemelidir.

---

# 5. Mevcut planın gerçekten kapatabileceği bulgular

Fable 5 yalnız eksiklere değil, kalan planın doğru biçimde kapatabileceği alanlara da dikkat etmelidir.

## 5.1 E12.2

- Widget ekleme/kaldırma/taşıma
- `settings_values(scope='ceo_dashboard')` persistence
- Yeni oturumda aynı layout

Bu madde yalnız dashboard kişiselleştirmesidir; execution gap kapatmaz.

## 5.2 E12.3

- ModuleWaiting=0
- Bütün nav rotaları için veri, state ve test matrisi
- Loading/empty/error/stale/permission durumları

Bu madde UI completeness sağlar; çalışanların gerçek araç kullandığını kanıtlamaz.

## 5.3 E12.4

- CRM yeni shell entegrasyonu
- Company switch/context
- Şirketler arası veri izolasyonu
- Eski rotaların kaldırılması

Bu madde doğru yapılırsa CRM/company context açığını gerçekten kapatabilir.

## 5.4 E12.5

- Head'siz departman sıfır
- Orphan worker sıfır
- Persona/model/skill/MCP/permission/budget/dashboard/audit kapsamı
- Stale persona path sıfır

Bu madde workforce metadata completeness'i kapatabilir. Runtime tool enforcement için F-04 kanıtı ayrıca gereklidir.

## 5.5 E13.0

- Backup restore drill
- Migration rollback
- Session E2E
- Accessibility
- Timeout/duplicate/retry/partial failure/idempotency
- 100+/10k kayıt performansı

Fresh bootstrap ve migration-ledger parity eklenirse F-08 kapatılabilir.

## 5.6 E13.1–E13.2

- Makine denetimli test turu
- CEO görsel ve kullanım kabulü

Bu aşamalar yeni capability inşa etmek için değil, mevcut capability'yi doğrulamak içindir. Testte eksik bulunan bir capability ayrı roadmap işi olmadan sessizce “kapsam dışı” sayılamaz.

---

# 6. Yanlış “tamamlandı” kararlarına karşı denetim kuralları

Fable 5 aşağıdaki eşitlemeleri kesinlikle yapmamalıdır:

| Yanlış eşitleme | Doğru yorum |
|---|---|
| Route açılıyor = modül çalışıyor | Veri, hata durumları, mutasyon ve gerçek E2E gerekir |
| Persona dosyası var = çalışan üretimde | Runtime worker, model, grant, araç ve görev kanıtı gerekir |
| Tool katalogda = agent kullanabiliyor | Grant→profile→SDK→tool call zinciri gerekir |
| Tool call tablosu var = gerçek çağrı yapıldı | Default executor'dan gerçek kayıt gerekir |
| Mock executor geçti = production runner çalışıyor | Production topolojisinde manuel çağrısız E2E gerekir |
| Workflow succeeded = dış iş yapıldı | Gerçek tool/provider etkisi ve kanıtı gerekir |
| Approval/outbox kodu var = dış entegrasyon var | En az bir gerçek sandbox handler E2E gerekir |
| P&L sayfası var = gelir sistemi çalışıyor | Gerçek veya doğrulanmış ingestion kaynağı gerekir |
| Backup dosyası var = recovery hazır | Restore drill ve RPO/RTO ölçümü gerekir |
| Migration son sürümü canlı = yeniden kurulabilir | Boş DB bootstrap ve schema parity gerekir |
| Test suite yeşil = ürün tam | Acceptance kapsamı ve production kanıt sınıfı incelenir |
| Roadmap 57/57 = bütün vizyon tamamlandı | Ertelenen ve plan dışı kabiliyetler ayrıca listelenir |

---

# 7. Fable 5 için zorunlu ilk denetim protokolü

## 7.1 İlk tur salt-okunur olmalı

Fable 5 ilk turda:

- hiçbir dosyayı değiştirmemeli,
- migration yazmamalı veya uygulamamalı,
- servis restart etmemeli,
- test verisi eklememeli,
- commit atmamalı,
- roadmap satırı kapatmamalı,
- “uygulamaya geçiyorum” dememelidir.

## 7.2 Her bulguyu bağımsız doğrulamalı

Bu rapordaki her F bulgusu için şu tabloyu üretmelidir:

| Alan | Beklenen içerik |
|---|---|
| Finding ID | F-01…F-15 |
| Verdict | CONFIRMED / PARTIAL / REFUTED / STALE |
| Primary evidence | Dosya + satır veya çalıştırılmış salt-okunur sorgu |
| Current canonical owner | Hangi açık/kapalı E satırı? |
| Coverage status | Tam / kısmi / yok / bilinçli deferred |
| False-positive risk | Neden ilk bakışta yanlış anlaşılabilir? |
| Required proof | Kapanış için hangi gerçek kanıt gerekir? |
| CEO decision needed | Evet/hayır ve kararın tam konusu |

## 7.3 Önce çürütmeye çalışmalı

Fable 5'in görevi raporu onaylamak değil, bulguları çürütmeye çalışmaktır.

Örnek:

- Resident worker bulunduysa tam call site ve production boot kaydı gösterilmelidir.
- Gerçek tool execution varsa default worker'dan başarılı ve reddedilmiş araç kanıtı gösterilmelidir.
- Migration parity varsa boş DB bootstrap raporu gösterilmelidir.
- Provider handler varsa registry ve sandbox E2E gösterilmelidir.

Belge veya yorum, çalışan kod kanıtının yerine geçmez.

## 7.4 Kanıt hiyerarşisi

En güçlüden en zayıfa:

1. Production-equivalent uçtan uca çalıştırma
2. Sandbox provider E2E
3. Gerçek DB + gerçek servis entegrasyon testi
4. Birim testi
5. Kod incelemesi
6. Spec veya roadmap iddiası
7. Yorum/TODO/gelecek zaman ifadesi

Alt seviye kanıt, üst seviye capability iddiasını tek başına destekleyemez.

---

# 8. Fable 5'in cevaplaması gereken zorunlu sorular

1. Normal task kuyruğunu production'da hangi resident proses tüketiyor?
2. Bu proses nerede boot ediliyor ve restart sonrası nasıl geri geliyor?
3. `runWorkerOnce` test dışı hangi call site'tan çağrılıyor?
4. Default worker neden `tools: []` kullanıyor?
5. Gateway profili Agent SDK'nın araç listesine hangi kod yoluyla dönüşüyor?
6. Grant ve revoke gerçek yeni oturumda tool visibility'yi değiştiriyor mu?
7. Workflow executor neden `tools: []` kullanıyor?
8. Workflow ve normal task execution aynı hook/gateway/observability anayasasına bağlı mı?
9. `AGENT_ORCHESTRATION_SPEC` içindeki runner tasarımı uygulandı mı, değiştirildi mi, yoksa plan dışına mı düştü?
10. Outbox registry'de hangi gerçek provider handler'ları var?
11. Sosyal, commerce, ödeme ve revenue ingestion entegrasyonlarının canonical sahibi hangi satırdır?
12. Repo migration seti boş veritabanını tek komut zinciriyle kurabiliyor mu?
13. 73 repo migration'ı ile 14 live ledger kaydı arasındaki farkın açıklaması nedir?
14. E13 testlerinin hangileri mock, hangileri gerçek servis, hangileri production-equivalent?
15. Library grant sayısı neden sıfır ve runtime activation bundan nasıl etkileniyor?
16. HR training job gerçek eğitim yürütüyor mu, yalnız audit mi yazıyor?
17. JARVIS final kapsamda mı, bilinçli deferred mı?
18. Gerçek iş pilotu final kabul için zorunlu mu?
19. Eski superseded roadmap'teki açık vaatler hangi kararla korunmuş veya kaldırılmıştır?
20. Ürün finalde hangi ifadeyle teslim edilecek: “core platform”, “full holding OS” veya “business-operating holding”?

---

# 9. Kapanış sınıflandırması

Her bulgu yalnız aşağıdaki durumlardan biriyle kapatılmalıdır:

## CLOSED — VERIFIED

- Gerçek capability uygulanmıştır.
- Tanımlı acceptance kanıtı çalıştırılmıştır.
- Kanıt yolu kalıcıdır.
- Regression testi mevcuttur.

## DEFERRED — CEO ACCEPTED

- Capability uygulanmamıştır.
- Erteleme gerekçesi ve hedef milestone yazılıdır.
- Bağımlı “tamamlandı” iddiaları buna göre daraltılmıştır.
- CEO ertelemeyi açıkça kabul etmiştir.

## NOT REQUIRED — SCOPE DECISION

- Capability'nin ürün için gerekli olmadığı kararlaştırılmıştır.
- Çelişen spec/roadmap vaatleri güncellenmiştir.
- Ürün teslim dili bu capability'yi varmış gibi göstermemektedir.

## OPEN — BLOCKING

- Capability final ürün iddiası için gereklidir.
- Uygulama veya doğrulama kanıtı yoktur.
- Final completion verilemez.

Şu durumlar kapanış değildir:

- “Kod var gibi görünüyor.”
- “Spec'te yazıyor.”
- “Test mock ile geçti.”
- “Sonra bağlanacak.”
- “Roadmap satırı daha önce ✓ olmuş.”
- “CEO ekranında kartı görüyor.”

---

# 10. Fable 5'e doğrudan denetim talimatı

> **Fable 5, bu raporu bir uygulama emri olarak değil, kapanış öncesi bağımsız denetim girdisi olarak kullan.**
>
> CEO'nun ayrı talep belgesini ve oradaki yeni fikirleri bu denetime karıştırma. Önce yalnız mevcut canonical planın ve mevcut kodun kendi vaatlerini karşılayıp karşılamadığını incele.
>
> İlk cevabında hiçbir dosyayı değiştirme. F-01–F-15 bulgularının her birini CONFIRMED, PARTIAL, REFUTED veya STALE olarak sınıflandır. Her kararını birincil dosya/satır, salt-okunur canlı sorgu veya production-equivalent kanıtla destekle.
>
> Özellikle roadmap'in %100 kapanması ile ürün capability'sinin %100 gerçekleşmesini birbirine eşitleme. Test, UI, persona, tablo ve spec varlığını gerçek runtime execution kanıtı yerine kullanma.
>
> Normal resident task worker, default worker'ın tool yüzeyi, workflow executor'ın tool yüzeyi, Library grant'ın runtime enforcement'ı, gerçek provider handler'ları, fresh migration bootstrap, JARVIS scope'u ve gerçek iş pilotunun canonical sahipliğini açıkça belirle.
>
> Bulgu doğrulanırsa hemen kod yazmaya başlama. Önce hangi bulgunun mevcut açık E satırıyla kapanacağını, hangisinin yeni bağlayıcı roadmap maddesi gerektirdiğini, hangisinin CEO kapsam kararı istediğini göster. CEO “uygula” demeden mutasyon yapma.
>
> Nihai amacın bu raporu haklı çıkarmak değil; DXB Global OS'un yanlış bir “%100 tamamlandı” beyanıyla kapanmasını engellemek ve gerçek teslim kapsamını kanıtla belirlemektir.

---

# 11. Kanıt indeksi

## Canonical ve durum belgeleri

- `HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md`
- `HOLDING-OS-MASTER-PLAN/HOLDING_OS_PRODUCT_SPEC.md`
- `HOLDING-OS-MASTER-PLAN/MASTER_PLAN.md`
- `HOLDING-OS-MASTER-PLAN/AGENT_ORCHESTRATION_SPEC.md`
- `HOLDING-OS-MASTER-PLAN/ACCEPTANCE_CRITERIA.md`
- `HOLDING-OS-MASTER-PLAN/TEST_STRATEGY.md`
- `HOLDING-OS-MASTER-PLAN/FABLE_5_HOOK_SPEC.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`

## Runtime ve execution

- `packages/orchestrator/src/worker-shim.ts`
- `packages/orchestrator/src/intent-intake.ts`
- `packages/orchestrator/src/decompose.ts`
- `packages/orchestrator/src/ops-live-collector.ts`
- `packages/kernel/src/workflow/executor.ts`
- `packages/kernel/src/workflow/`

## Gateway, Library ve HR

- `packages/gateway/src/library-profiles.ts`
- `packages/gateway/src/`
- `packages/hr/src/jobs.ts`
- `packages/hr/src/`
- `db/migrations/20260712008000_hr_factory_fns_e54b.sql`
- `db/migrations/20260714020000_e95_library.sql`

## Outbox ve dış eylem

- `packages/outbox-executor/src/index.ts`
- `packages/outbox-executor/src/actions/index.ts`
- `packages/dxb-mcp/src/groups/`

## Revenue ve entegrasyon sınırları

- `db/migrations/20260712011000_revenue_pnl_e65.sql`
- `db/migrations/20260712012000_content_monetization_e65b.sql`
- `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT.md`
- `.planning/research/study-cards/`

## JARVIS

- `apps/jarvis/src/index.ts`
- `.planning/phases/09-jarvis-voice-layer/` veya mevcut Phase 09 artefact'ları

---

# 12. Son denetim hükmü

Mevcut canonical planın kalan yedi maddesi tamamlandığında DXB Global OS'un dashboard, rota, CRM, workforce metadata, operasyonel hazırlık ve görsel kabul seviyesi önemli ölçüde yükselecektir.

Ancak aşağıdaki çekirdek sorular cevaplanmadan “tam çalışan dijital holding” kapanışı verilmemelidir:

1. Task'ları production'da kim ve hangi resident proses çalıştırıyor?
2. Çalışanlar gerçek least-privilege araç yüzeyine sahip mi?
3. Workflow ve normal task execution aynı güvenlik/kanıt zincirine bağlı mı?
4. En az bir gerçek provider işlemi sandbox'ta uçtan uca kanıtlandı mı?
5. Sistem boş veritabanından deterministik olarak yeniden kurulabiliyor mu?
6. Final kapsamdan çıkarılan veya ertelenen kabiliyetler açıkça yazıldı mı?
7. “Test geçti” ile “production capability kanıtlandı” ayrımı korunuyor mu?

Bu sorular cevaplanmadan 57/57 roadmap kapanışı yalnızca **mevcut satırların tamamlandığını** gösterir; bütün ürün vizyonunun eksiksiz gerçekleştiğini göstermez.

---

**Belge sonu — 16 Temmuz 2026**
