# DXB için Claude 5 Context Engineering Rehberi

**Kaynak makale:** “The new rules of context engineering for Claude 5 generation models”  
**Yazar:** Thariq Shihipar, Anthropic  
**Yayın tarihi:** 24 Temmuz 2026  
**Amaç:** Makaledeki yaklaşımı DXB Global Operating System projesine güvenli, izlenebilir ve uygulanabilir biçimde uyarlamak.

---

## 1. Makalenin ana mesajı

Makalenin temel iddiası “Claude 5’e az bilgi verin” değildir.

Doğru mesaj şudur:

> **Modele sürekli olarak her şeyi yüklemek yerine, en küçük fakat en yüksek sinyalli bağlamı verin; geri kalan bilgiyi ihtiyaç oluştuğunda yükletin.**

Anthropic, Claude Opus 5 ve Claude Fable 5 gibi yeni nesil modeller için Claude Code’un sistem promptunun yüzde 80’den fazlasını kaldırdığını ve kodlama değerlendirmelerinde ölçülebilir bir kayıp görmediğini açıklıyor.

Bu sonuç üç önemli şeyi gösterir:

1. Eski modeller için yazılmış birçok kural yeni modellerde artık gerekli değildir.
2. Fazla talimat yalnızca token tüketmez; talimatlar birbirleriyle çelişerek modelin muhakemesini de zorlaştırır.
3. Modern model kullanımındaki asıl mühendislik alanı tek bir “mükemmel prompt” yazmak değil, doğru bağlam mimarisini kurmaktır.

---

## 2. Prompt engineering ile context engineering arasındaki fark

### Prompt engineering

Kullanıcının o anda verdiği görevin nasıl yazıldığıyla ilgilenir.

Örnek:

> “Auth modülündeki yarış koşulunu bul, kök nedeni açıkla ve düzeltme planı hazırla.”

### Context engineering

Modelin bu mesajı işlerken gördüğü bütün bilgi ortamıyla ilgilenir:

- sistem talimatları,
- `CLAUDE.md`,
- proje direktifleri,
- Skills,
- araç tanımları,
- açık dosyalar,
- geçmiş konuşmalar,
- otomatik hafıza,
- planlar,
- testler,
- mockup’lar,
- mimari karar kayıtları,
- çalışma dalgasının spec’i.

Dolayısıyla kötü sonuç çoğu zaman kullanıcının son promptundan değil, çevresindeki bağlamın dağınık, eski, fazla uzun veya çelişkili olmasından kaynaklanır.

DXB açısından mesele şudur:

> Opus 5’in ne kadar zeki olduğu kadar, hangi kaynağı ne zaman ve hangi yetki sırasıyla okuyacağı da önemlidir.

---

## 3. Neden fazla bağlam zararlı olabilir?

Büyük context window, “her şeyi baştan yükleyelim” anlamına gelmez.

Her ek bilgi parçası şu riskleri getirir:

- Güncel ve eski talimatların çakışması
- Ana görevin arka plana düşmesi
- Modelin gereksiz doğrulama döngülerine girmesi
- Eski workaround’ların yeni modele engel olması
- Aynı kuralın farklı dosyalarda farklı yazılması
- Modelin hangi dokümanın otorite olduğunu anlamak için fazla muhakeme harcaması
- Token, süre ve maliyet artışı
- Uzun görevlerde hedef kayması

DXB gibi büyük bir OS projesinde bağlamı azaltmak, bilgi kaybetmek değil; **bilgiyi katmanlandırmak** demektir.

---

# 4. Makaledeki altı değişim ve DXB karşılığı

## 4.1. Eskiden: Kurallar ver  
## Şimdi: Modelin muhakemesini kullanmasına izin ver

Eski yaklaşım, her kötü davranış için genel bir yasak eklemekti:

- “Asla yorum yazma.”
- “Asla yeni dosya oluşturma.”
- “Her zaman üç kez kontrol et.”
- “Hiçbir durumda X yapma.”

Bu kurallar bir problemi önleyebilir; fakat doğru olduğu istisnai durumları da engeller.

Yeni yaklaşım, modelin çevredeki kodu ve kullanıcı niyetini okumasını sağlamaktır.

Örneğin:

**Aşırı katı kural:**

> Never write multi-line comments.

**Daha iyi ilke:**

> Write code that matches the surrounding codebase’s naming, comment density, structure, and idiom.

### DXB’de nasıl uygulanmalı?

Silinmesi veya sadeleştirilmesi muhtemel kurallar:

- Claude’un koddan zaten anlayabileceği standart dil kuralları
- “Temiz kod yaz”, “iyi isim ver”, “hata yapma” gibi belirsiz ifadeler
- Her görevde geçerli olmayan mikro-prosedürler
- Aynı amaca hizmet eden çok sayıda negatif yasak
- Eski modellerin davranışını düzeltmek için eklenmiş workaround’lar

Kalması gereken kritik kurallar:

- CEO onayı olmadan implementasyona başlamama
- Yetkilendirme ve veri güvenliği sınırları
- Yıkıcı işlemler için açık izin gerekliliği
- Tenant izolasyonu
- Veri egemenliği ve regülasyon sınırları
- Onaylanmış spec dışına çıkmama
- Ana branch’e izinsiz değişiklik yapmama
- Gizli bilgiyi loglamama
- Mimari kaynakların otorite sırası

**Önemli ayrım:**  
Daha az kural, daha az yönetişim değildir. Gereksiz mikro-kurallar azalırken gerçek iş ve güvenlik sınırları daha görünür hâle gelir.

---

## 4.2. Eskiden: Araç kullanım örnekleri ver  
## Şimdi: Arayüzü doğru tasarla

Eski modeller, araçları nasıl kullanacağını anlamak için çok sayıda örneğe ihtiyaç duyuyordu. Fakat örnekler modelin keşif alanını daraltabilir ve yalnızca gösterilen biçimi taklit etmesine yol açabilir.

Yeni yaklaşım:

- Açık parametre adları
- Kesin tipler
- Enum değerleri
- Gerekli ve opsiyonel alanların ayrılması
- Doğru hata mesajları
- Araç açıklamasının kendi kendini anlatması

Örnek:

```text
status: "pending" | "in_progress" | "completed"
```

Bu tanım, uzun bir kullanım örneğinden daha açık olabilir.

### DXB’de nasıl uygulanmalı?

DXB’nin iç araçları, scriptleri, CLI komutları ve agent fonksiyonları şu prensiplere göre düzenlenmeli:

- Belirsiz boolean parametrelerden kaçının.
- Serbest metin yerine mümkün olan yerlerde enum kullanın.
- `mode`, `scope`, `environment`, `tenant`, `approval_state` gibi alanları açıkça tanımlayın.
- Araçların yan etkilerini açıklayın.
- Dry-run desteğini parametre seviyesinde görünür yapın.
- Hata mesajları, modelin bir sonraki doğru eylemi seçmesine yardım etsin.
- Aracın nasıl kullanılacağı yalnızca araç açıklamasında bulunsun; sistem promptunda tekrar edilmesin.

**Kötü tasarım:**

```text
deploy(input: string)
```

**Daha iyi tasarım:**

```text
deploy(
  environment: "development" | "staging" | "production",
  service: string,
  strategy: "rolling" | "blue_green",
  dry_run: boolean,
  approval_id?: string
)
```

Bu yaklaşım prompt yükünü azaltır ve davranışı arayüz seviyesinde güvenilir hâle getirir.

---

## 4.3. Eskiden: Her şeyi baştan yükle  
## Şimdi: Progressive disclosure kullan

Progressive disclosure, modelin yalnızca ihtiyaç duyduğu bağlamı ihtiyaç duyduğu anda yüklemesidir.

Her görevde şunların tamamını yüklemek doğru değildir:

- bütün mimari belgeler,
- bütün code-review kuralları,
- deployment prosedürü,
- güvenlik checklist’i,
- bütün rakip araştırması,
- bütün wave spec’leri,
- geçmiş kararların tamamı.

Bunların çoğu yalnızca belirli görevlerde gereklidir.

### DXB’de önerilen katmanlar

#### Katman 1 — Her zaman aktif, çok kısa

`CLAUDE.md` veya eşdeğer giriş dosyası:

- Repo ne içindir?
- Otorite sırası nedir?
- Değiştirilemez birkaç kritik sınır nedir?
- Hangi dosyalar gerektiğinde okunmalıdır?
- Hangi davranış CEO onayı gerektirir?

#### Katman 2 — Proje durumu

İhtiyaç olduğunda:

- `.planning/STATE.md`
- `00-BOARD-OPEN-WORK.md`
- `00-INDEX.md`

#### Katman 3 — Göreve özel bilgi

Yalnızca ilgili dalga için:

- Wave spec
- İlgili ADR’ler
- İlgili modül belgeleri
- İlgili testler
- İlgili API kontratları

#### Katman 4 — İş akışı Skills

Prosedürler kalıcı prompttan çıkarılmalı:

- sistem keşfi,
- dalga planlama,
- implementasyon,
- code review,
- verification,
- migration,
- rival intelligence research,
- release hazırlığı.

Örnek klasör:

```text
.claude/
  skills/
    system-discovery/
      SKILL.md
    wave-planning/
      SKILL.md
    implementation/
      SKILL.md
    verification/
      SKILL.md
    rival-intel/
      SKILL.md
```

Skill’in gövdesi yalnızca ilgili olduğunda yüklenir. Bu, ana context’i temiz tutar.

---

## 4.4. Eskiden: Talimatı tekrar et  
## Şimdi: Tek ve basit araç açıklaması kullan

Aynı talimatın şuralarda tekrarlandığını düşünün:

- sistem promptu,
- `CLAUDE.md`,
- Skill,
- tool description,
- wave spec,
- kullanıcı promptu.

Bu tekrar güvenilirlik sağlamaz. Metinler zamanla farklılaşır ve çatışma üretir.

### DXB’de uygulanacak kural

Her bilgi türünün tek sahibi olmalı.

| Bilgi türü | Birincil kaynak |
|---|---|
| Mevcut çalışma durumu | `.planning/STATE.md` |
| Açık işler | `00-BOARD-OPEN-WORK.md` |
| Master plan yapısı | `00-INDEX.md` |
| Organizasyonel/işletim ilkeleri | DXB Directive Package |
| Dalga kapsamı ve kabul kriterleri | İlgili wave spec |
| Mimari karar gerekçeleri | ADR’ler |
| Çalışan sistem gerçeği | Kod ve testler |
| Prosedür | İlgili Skill |
| Araç kullanım şekli | Tool description |

Bir kural birden fazla yerde gerekiyorsa tamamını kopyalamak yerine ana kaynağa referans verilmelidir.

---

## 4.5. Eskiden: Hafızayı CLAUDE.md içinde elle tut  
## Şimdi: Auto-memory kullan

Claude Code artık kullanıcı ve çalışma için anlamlı bazı bilgileri otomatik olarak hatırlayabilir. Bu nedenle `CLAUDE.md`, günlük not deposuna dönüşmemelidir.

Ancak DXB için kritik bir ayrım vardır:

> **Auto-memory kolaylık katmanıdır; kurumsal source of truth değildir.**

Auto-memory şu amaçlarla kullanılabilir:

- CEO’nun kalıcı iletişim tercihleri
- tekrar eden fakat kritik olmayan çalışma alışkanlıkları
- yerel geliştirme ortamıyla ilgili kişisel tercihler

Auto-memory’ye bırakılmaması gerekenler:

- tamamlanan ve açık işler
- mimari kararlar
- kabul kriterleri
- güvenlik sınırları
- rollout durumu
- migration state
- riskler
- branch veya release durumu
- onay kayıtları

Bunlar mutlaka version-controlled proje dosyalarında bulunmalıdır.

### DXB modeli

- `.planning/STATE.md`: otoriter operasyonel durum
- ADR: otoriter mimari karar
- Wave spec: otoriter iş kontratı
- Board: otoriter backlog/open-work görünümü
- Auto-memory: yardımcı kişiselleştirme, hiçbir zaman nihai gerçek değil

Bu yaklaşım hem makalenin hafif context ilkesine uyar hem de kurumsal izlenebilirliği korur.

---

## 4.6. Eskiden: Basit metin spec  
## Şimdi: Rich references

Model için en iyi açıklama çoğu zaman uzun bir prose dokümanı değildir.

Daha yüksek doğruluk sağlayabilecek referanslar:

- çalışan test suite’i,
- örnek input/output fixture’ları,
- JSON Schema,
- OpenAPI tanımı,
- veri modeli,
- HTML prototipi,
- referans implementation,
- başka repodaki doğru fonksiyon,
- acceptance test,
- mimari diyagram,
- kalite rubric’i.

Örneğin bir UI için:

1. “Modern ve premium bir dashboard yap” — düşük kesinlik
2. Screenshot — orta kesinlik
3. Çalışan HTML/CSS prototipi — yüksek kesinlik
4. Prototip + responsive acceptance test + rubric — çok yüksek kesinlik

### DXB’de kullanım

Her wave spec mümkün olduğunca şu yapıdaki referanslarla desteklenmeli:

```text
wave/
  SPEC.md
  acceptance-tests/
  fixtures/
  reference-implementation/
  architecture/
  rubric.md
```

Spec yalnızca ne istendiğini anlatır. Testler ve rubric, “tamamlandı”nın ölçülebilir anlamını verir.

---

# 5. DXB için önerilen context mimarisi

## 5.1. `CLAUDE.md`: kısa, yüksek sinyalli

Burada bulunması gerekenler:

- DXB reposunun amacı
- Kritik otorite sırası
- CEO approval gate
- Açıkça tahmin edilemeyen gotcha’lar
- Hangi Skill’in hangi durumda kullanılacağına dair kısa yönlendirme
- Tekrarlanmayan temel komutlar

Burada bulunmaması gerekenler:

- Repo klasörlerinin uzun açıklaması
- Koddan görülebilen mimari özet
- Her dilin genel best practice’leri
- Bütün wave’lerin kuralları
- Uzun araştırma dokümanları
- Günlük durum notları
- Tool kullanım örneklerinin tekrarları
- Sürekli değişen backlog detayları

## 5.2. Bootstrap: keşif kapısı

Bootstrap’ın amacı modele bütün sistemi anlatmak değil, doğru keşif sırasını vermektir.

Bootstrap şunları yapmalı:

1. Çalışma modunu belirlemeli.
2. Otorite sırasını vermeli.
3. Başlangıçta hangi dosyaların okunacağını söylemeli.
4. İlk aşamada değişiklik yapılmasını engellemeli.
5. Analizden sonra hangi deliverable’ın beklendiğini söylemeli.

## 5.3. STATE: yaşayan gerçek

`.planning/STATE.md` aşağıdakileri kısa ve güncel tutmalı:

- aktif wave,
- son tamamlanan iş,
- halen açık blocker’lar,
- kritik kararlar,
- bir sonraki eylem,
- bilinen riskler,
- çalışılan branch/commit,
- ilgili spec ve ADR bağlantıları.

STATE, geçmişin romanı değil mevcut operasyonel fotoğraf olmalıdır.

## 5.4. Board ve Index

- Board: yapılmamış işlerin otoriter listesi
- Index: master planın haritası ve doküman ilişkileri

Aynı backlog ayrıntıları STATE, Board ve Index içinde tekrar edilmemeli.

## 5.5. Wave spec

Wave spec görevin gerçek kontratıdır:

- amaç,
- kapsam,
- kapsam dışı,
- bağımlılıklar,
- kabul kriterleri,
- veri ve API kontratları,
- test yaklaşımı,
- rollout,
- rollback,
- güvenlik gereksinimleri.

## 5.6. Skills

Tekrarlanan prosedürler Skill olmalı:

- `/system-discovery`
- `/wave-plan`
- `/implement-wave`
- `/verify-wave`
- `/review-architecture`
- `/rival-intel`

Her Skill tek bir iş akışına odaklanmalı ve gerekmedikçe yüklenmemelidir.

## 5.7. Rubrics

“İyi mimari”, “tam implementation” veya “kaliteli API” gibi kavramlar prose ile bırakılmamalı; rubric’e dönüştürülmelidir.

Örnek mimari rubric:

- domain sınırları korunmuş mu?
- tenant isolation kanıtlanmış mı?
- yeni coupling oluşmuş mu?
- failure mode’lar ele alınmış mı?
- observability eklenmiş mi?
- migration ve rollback mümkün mü?
- testler yalnızca happy path’i mi kapsıyor?
- spec’in her kabul kriteri doğrulanmış mı?

---

# 6. Sizin başlangıç promptunuzun değerlendirmesi

Mevcut promptunuzun güçlü tarafları:

- Rol net.
- Projenin daha önce bozukluklar ürettiği açıklanıyor.
- Okuma sırası veriliyor.
- Implementasyon öncesi sistem anlayışı isteniyor.
- CEO approval gate açıkça belirtiliyor.

Bunlar DXB’ye özel, önemli ve koddan çıkarılamayan bilgilerdir. Bu nedenle kalmalıdır.

Sadeleştirilebilecek tarafları:

- “En zeki ve en mükemmel mimar” gibi ifadeler davranış üretmekten çok retorik yük oluşturur.
- Aynı “dikkatli ol” mesajı farklı cümlelerle tekrarlanmamalıdır.
- Bütün çalışma metodolojisi tek başlangıç promptuna yazılmamalıdır.
- Verification ve implementation prosedürleri ayrı Skill’lere taşınmalıdır.
- Başlangıç promptu yalnızca onboarding ve phase gate’i yönetmelidir.

En doğru model:

> Kısa başlangıç promptu + açık okuma sırası + otorite hiyerarşisi + ilgili görevde yüklenen Skills + yüksek doğruluklu spec/test/rubric.

---

# 7. Önerilen DXB okuma ve çalışma sırası

## Phase 0 — Onboarding / Read-only

1. `Bootstrap`
2. `.planning/STATE.md`
3. `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md`
4. `DXB Global Operating System Directive Package`
5. `HOLDING-OS-MASTER-PLAN/00-INDEX.md`
6. `.planning/research/rival-intel/00-LEDGER.md` — rakip kaynak kuyruğu ve o ana kadar yazılmış raporlar. **Düzeltildi 2026-08-04:** burada eskiden `00-SYNTHESIS.md` yazıyordu; o dosya, CEO'nun reddettiği hükümler üzerine kurulmuştu ve 2026-08-02'de onun emriyle silindi. Yeni bir sentez ancak kuyruğun tamamı raporlandığında yazılır.
7. Sorumlu olunan wave spec
8. Yalnızca gerekli ilgili kod, ADR, test ve referanslar

Bu fazda dosya değiştirilmez.

## Phase 1 — Understanding report

Opus 5 şunları sunar:

- sistemin kısa mimari haritası,
- aktif durum,
- açık işler,
- ilgili wave’in kapsamı,
- bağımlılıklar,
- dokümanlar arası çelişkiler,
- bilinen riskler,
- cevaplanması gereken gerçek belirsizlikler.

## Phase 2 — Plan approval

Plan şunları içermelidir:

- değişecek dosyalar/modüller,
- uygulanacak adımlar,
- veri/API etkileri,
- migration yaklaşımı,
- test ve doğrulama,
- rollout/rollback,
- riskler.

CEO onayı gelmeden implementasyon yapılmaz.

## Phase 3 — Implementation

Yalnızca onaylanan kapsam uygulanır.

Model rutin mikro-kararları kendisi verir; fakat kapsamı veya mimariyi maddi biçimde değiştirecek bir durum çıkarsa bunu açıkça bildirir.

## Phase 4 — Verification

- acceptance criteria matrisi,
- hedefli testler,
- lint/typecheck/build,
- güvenlik ve tenant isolation kontrolleri,
- ilgili rubric,
- değişiklik özeti,
- kalan riskler.

Gereksiz yere çok sayıda verifier agent kullanılmaz. Karmaşık ve bağımsız işlerde ayrı verifier faydalı olabilir.

## Phase 5 — State update

Tamamlanan işten sonra otoriter dosyalar güncellenir:

- `.planning/STATE.md`
- Board
- İlgili spec status
- Gerekiyorsa ADR
- Gerekli handoff notu

Aynı bilginin farklı dosyalarda çelişkili kopyaları bırakılmaz.

---

# 8. DXB için silme denetimi

Her kalıcı talimat için şu sorular sorulmalı:

1. Model bunu kodu okuyarak çıkarabilir mi?
2. Bu talimat başka bir yerde zaten var mı?
3. Bu talimat yalnızca belirli bir görev için mi gerekli?
4. Eski bir model sorununu çözmek için mi yazılmış?
5. İstisnaları olan genel bir yasak mı?
6. Bu talimat kaldırılırsa gerçekten ölçülebilir hata artıyor mu?
7. Talimat yerine daha iyi bir tool schema, test veya rubric tasarlanabilir mi?
8. Bu bilgi güncel kalabilecek mi?
9. Bu dosya doğru source of truth mı?
10. Bu talimat güvenlik, izin veya yönetişim açısından kritik mi?

Son sorunun cevabı “evet” ise, talimat sade fakat açık biçimde korunmalıdır.

---

# 9. Uygulama planı

## Adım 1 — Envanter

Aşağıdakileri listeleyin:

- root `CLAUDE.md`
- nested `CLAUDE.md` dosyaları
- Skills
- commands
- rules
- hooks
- tool descriptions
- Bootstrap
- Directive Package
- STATE / Board / Index
- wave spec’leri

## Adım 2 — Çakışma haritası

Aynı konuyu düzenleyen metinleri bulun:

- comment policy,
- test policy,
- planning policy,
- approval policy,
- documentation policy,
- subagent policy,
- memory policy,
- deployment policy.

## Adım 3 — Tek sahip atama

Her konu için bir primary source belirleyin.

## Adım 4 — Kalıcı context’i küçültme

`CLAUDE.md` ve başlangıç talimatlarından:

- çıkarılabilir bilgiler,
- tekrarlar,
- standart best practice’ler,
- görev-özel prosedürler kaldırılır.

## Adım 5 — Skill’lere bölme

Prosedürler `.claude/skills/<name>/SKILL.md` yapısına taşınır.

## Adım 6 — Rich references oluşturma

Kritik wave’ler için:

- acceptance test,
- fixtures,
- schemas,
- reference code,
- rubrics eklenir.

## Adım 7 — Evals

Eski ve yeni context mimarisi aynı görev setinde karşılaştırılır:

- doğruluk,
- tamamlanma,
- gereksiz dosya değişikliği,
- scope drift,
- token kullanımı,
- süre,
- gerçek bug sayısı,
- false positive,
- CEO düzeltme sayısı.

## Adım 8 — Claude Doctor

Güncel Claude Code sürümünde `/doctor` veya ilgili diagnostic/trim özelliği çalıştırılır. Öneriler otomatik olarak kabul edilmez; DXB’nin kritik yönetişim sınırları insan gözetiminde korunur.

---

# 10. Nihai DXB ilkesi

DXB için doğru formül:

> **Az ama otoriter kalıcı talimat + ihtiyaç anında yüklenen uzmanlık + test ve rubric ile ölçülen sonuç + version-controlled proje durumu.**

Bu makale, DXB’nin bütün planlarını silmesi gerektiğini söylemiyor. Tam tersine, belgelerin daha net görevler üstlenmesini söylüyor:

- `CLAUDE.md`: kısa, sürekli geçerli bağlam
- Bootstrap: keşif ve faz kapısı
- STATE: güncel operasyonel gerçek
- Board: açık işler
- Index: doküman haritası
- Directive Package: kalıcı kurumsal ilkeler
- Wave spec: görev kontratı
- Skill: gerektiğinde yüklenen prosedür
- Test/rubric/reference: yüksek doğruluklu başarı tanımı
- Auto-memory: yardımcı kişiselleştirme, otoriter olmayan hafıza

Bu ayrım yapıldığında Opus 5 daha az çelişki çözer, daha fazla mühendislik yapar.

---

## Resmî kaynaklar

- https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5
- https://code.claude.com/docs/en/best-practices
- https://code.claude.com/docs/en/skills
- https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code
