> **Provenans:** CEO direktifi, kaynak dosya `~/Desktop/DXB_GLOBAL_OS_EKIBE_SILLE_PROMPT.md` (2026-07-11 12:16), repo aynası — içerik birebir, değiştirilemez. İşleme kaydı: [[GAP-AUDIT]] + IMPLEMENTATION_ROADMAP entegrasyonu.

# DXB GLOBAL OS — CEO EKSİK KAPATMA VE KADRO GENİŞLETME DİREKTİFİ

Bu metni bir fikir listesi veya “ileride bakarız” notu olarak değil, mevcut DXB Global OS ana planına eklenecek bağlayıcı bir **gap-audit + remediation direktifi** olarak ele alın.

## 0. Değişmez çalışma kuralı

Şu anda yürüyen planı, aktif migration çalışmalarını veya başka bir ajanın dosyalarını ezmeyin. Önce repository gerçeğini, canlı DB gerçeğini, mevcut planları ve devam eden değişiklikleri okuyun. Çakışma tespit ederseniz paralel ve kör implementasyon yapmayın; bulguyu kayda alın, doğru faza/iş paketine yerleştirin ve tek-yazar kuralına uyun.

“Menü var”, “route açılıyor”, “kart görünüyor”, “DB’de satır var”, “persona dosyası var” veya “plan içinde adı geçiyor” hiçbir şekilde **tamamlandı** anlamına gelmez. Tamamlanma yalnız gerçek işlev + gerçek veri + gerçek kontrol + test + kanıt ile ilan edilir.

---

## 1. Önce mevcut gerçeği kabul edin

CEO gözlemi ve repo incelemesi şunu gösteriyor:

- Bu inceleme anında Command Center’daki 40 sol-menü modülünün yalnızca 6’sı gerçek veri sayfası; 34’ü `ModuleWaiting / MODULE IN BUILD` kabuğu. Aktif geliştirme nedeniyle sayı değişirse route matrisiyle yeniden kanıtlayın.
- `not.png` kanıtında HR sayfası “Roadmap step E12.1” diyor ve yalnız “153 Employees” sayısını başka bir canlı yüzeye bağlıyor. Bu bir HR ürünü değildir; geçici durum kartıdır.
- Knowledge, Orchestration, Memory, Models, Library, Skills, Plugins ve MCP gibi AI modülleri kendi domain verisini göstermiyor; geçici olarak genel `task_events`/Live yüzeyine bağlanıyor. Bu yüzden kullanıcı alakasız içerik görüyor.
- Logout/sign-out akışı yok. Oturum açıkken `/login` otomatik `/overview`a dönüyor; kullanıcı güvenli biçimde oturumu kapatamıyor.
- Yeni Command Center kabuğu şu anda büyük ölçüde READ-ONLY. CEO’nun “gör + incele + değiştir + kontrol et” şartı, yalnız metrik görmekle karşılanmış sayılmaz.
- 153 rakamı kuruluş kadrosunun olgunluğu anlamına gelmiyor. Bunlar 11 legacy `agency-agents` dizininden import edilen ajans ağırlıklı personadır. Son kanıtta yalnız 5 Product personası `v2.0-fable`; kalan 148 kayıt legacy durumdadır.
- Legacy frontmatter rol bilgisi taşımadığı için 153 kaydın başlangıçta tamamı `worker` doğmuştur. Dolayısıyla “153 çalışan var” demek; müdürlük zinciri, yetki sınırı, escalation, görev sahipliği ve operasyonel aktivasyon tamam demek değildir.
- Registry’de CEO Office, Research ve Legal-DE gibi ek departman izleri vardır; fakat departman kaydı/profili bulunması o departmanın gerçek kadro, workflow, SLA, KPI ve dashboard yüzeyiyle çalıştığını kanıtlamaz.
- Mevcut planda “153 legacy + Fable’ın olmazsa olmaz ek personaları” hükmü kayıtlıdır. Ancak bu hüküm somut gap matrisi, onaylı ek kadro listesi, sahiplik ve kabul kanıtına dönüşmeden tamamlanmış sayılamaz.

Bu maddeler tartışma konusu değil; audit başlangıç gerçekleridir. Sayılar repository ve canlı DB üzerinden yeniden doğrulanmalı, farklılık varsa kanıtla raporlanmalıdır.

---

## 2. Dashboard “tamamlandı” denmeden önce kapatılacak zorunlu boşluklar

### 2.1 Her sol-menü modülü için gerçek Definition of Done

Her route için tek satırlık bir kabul matrisi çıkarın:

`route | domain owner | source tables/views | gerçek sorgu | detail/drill-down | mutation/control | loading | empty | error | stale/offline | permission-denied | audit event | EN/TR | automated test | status`

Bir modül ancak aşağıdakilerin tamamı varsa tamamdır:

1. Kendi domain’inin gerçek verisini okur; başka bir modülün rastgele sayısını göstermez.
2. Liste/özet değerleri kaynak kayda drill-down yapar.
3. Ürün tanımı gerektiriyorsa CEO Control Mode üzerinden güvenli mutation sunar.
4. Mutation route handler → validation → yetkili DB function → audit → Broadcast zincirini kullanır.
5. Loading, gerçek empty-state, widget-level error, stale/reconnect ve permission-denied durumları vardır.
6. EN/TR metin eşliği, klavye kullanımı ve erişilebilir isimleri vardır.
7. Route-başı en az bir gerçek sorgu testi, bir drill-down testi ve mutation varsa başarı/ret testi vardır.
8. `ModuleWaiting`, dummy widget, sahte metrik, anlamsız yönlendirme ve ölü buton kalmamıştır.

`ModuleWaiting` sayısı final kabulde **0** olmalıdır. İstisna varsa CEO tarafından açıkça scope dışı bırakılmış olmalı; gizlice “sonra yapılacak” bırakılamaz.

### 2.2 Auth ve oturum yaşam döngüsü

Şunları ayrı backlog maddesi değil, teslim kapısı yapın:

- Görünür Logout butonu.
- `supabase.auth.signOut()` sonrası `/login`e `replace` + refresh.
- Geri tuşuyla korumalı sayfaya dönme denemesinde tekrar auth duvarı.
- Oturum süresi bitince anlaşılır uyarı ve güvenli yeniden giriş.
- Çoklu sekmede logout senkronizasyonu.
- Dış deploy’da MFA/AAL2; yerel CEO kararına uygun password-only davranışının regresyon testi.
- Hassas para-çıkışı/sözleşme işlemlerinde gerekiyorsa yeniden doğrulama; approval kapısı asla bypass edilmez.
- Auth hata, network kopması ve cookie bozulması için kurtarma akışı.

### 2.3 Command Center’ın eksik çekirdek davranışları

Planlarda yorum olarak geçip iş paketinde kaybolabilecek aşağıdaki noktaları açık task ve kabul kriterine dönüştürün:

- Global Search ve gerçek sonuç kaynakları.
- `⌘K` Command Palette.
- CEO’nun TR/EN doğal dil intent yazıp kernel’e gönderebildiği gerçek command surface.
- Intent → classification → task/workflow → approval/outbox → audit sonucunun ekrandan izlenmesi.
- READ-ONLY ↔ CONTROL MODE ayrımı; her kontrolün yetki, undo ve audit davranışı.
- Kill switch, emergency stop ve durumunun görünür/doğrulanabilir olması.
- CRM’in yeni Command Center bilgi mimarisine dahil edilmesi. Eski `/crm` kodunun gizli kalması kabul değildir.
- Çok şirketli holding bağlamı: company switch/context, şirket→departman→çalışan→proje drill-down ve şirketler arası veri izolasyonu.
- Notification/alert center: gerçek alarm kaynağı, severity, owner, acknowledgement, escalation, resolved durumu ve dış kanal teslim kanıtı.
- Sağ Intelligence Rail’in yalnız dekorasyon değil; approval, critical alert, anomaly, cost risk ve karar gerektiren olayların gerçek öncelik sırası olması.
- Agent dock’un çalışan ajanı, task’ı, modeli, süresi, maliyeti, son heartbeat’i, block/escalation nedeni ve detay kapısını göstermesi.

### 2.4 AI ve orkestrasyon görünürlüğü

Orchestration sayfasında “ana beyinler” gerçekten görünmelidir:

- Orchestrator/Fable katmanı, 13 rol slotu, atanmış model, fallback zinciri ve policy kaynağı.
- Hangi task’ı hangi modelin neden aldığı; karar kaydı ve maliyeti.
- Sonnet-ban gibi yasakların yalnız metin değil DB/function testiyle reddi.
- Agent hierarchy: CEO Office → department head → specialist/worker; orphan worker 0.
- Queue, retries, parked/dead-letter, timeout, cancellation ve manual intervention görünürlüğü.
- Prompt/persona/version, skill, MCP grant ve autonomy seviyesinin çalıştırılan run ile izlenebilir bağı.
- Model health, rate limit, fallback, kalite/eval skoru, hallucination/prompt-injection/red-team bulguları.
- Shadow/canary rollout, rollback ve model değişikliğinin audit kaydı.

### 2.5 Knowledge, Memory, Library ve öğrenme sistemi

Bu dört kavram birbirine karıştırılmamalıdır. Her biri için sahiplik ve veri akışı gösterin:

- Knowledge: doğrulanmış organizasyon bilgisi, kaynak/provenance, confidence, owner, son doğrulama tarihi.
- Memory: episodic/semantic/procedural ayrımı, retention, contradiction, poisoning quarantine, düzeltme ve unutma.
- Library: intake, lisans/telif, malware/secret scan, grant, version, kullanım geçmişi.
- Research: kaynak kalitesi, citation, freshness, tekrar doğrulama ve karar/iş çıktısına bağ.
- Arama sonucu neden geldi açıklaması; kaynak kayda tek tık iniş.
- Yanlış bilginin düzeltilmesi, silinmesi ve tüm downstream indekslerden temizlenmesi.
- GDPR/kvkk talepleri, retention ve veri sınıflandırması.

### 2.6 Operasyonel ve kurumsal teslim boşlukları

Aşağıdakiler final turda unutulamaz:

- Remote production domain, TLS, güvenli secrets, health probes ve monitoring.
- Backup yalnız “alındı” değil: restore drill, RPO/RTO, off-site kopya ve kanıtlı geri dönüş.
- Database migration rollback/recovery ve bozuk deploy geri alma tatbikatı.
- SLO/SLA, uptime, latency, queue age, failure rate, cost anomaly ve capacity alarmı.
- Audit/export: filtrelenebilir, detail_ref’li, değiştirilemez kayıt ve gerektiğinde CSV/PDF/JSON dışa aktarım.
- Pagination/virtualization, 100+ ve 10.000+ kayıt davranışı; performans bütçesi.
- 34" ultrawide yanında laptop/tablet/mobile minimum kullanılabilirlik.
- Klavye navigasyonu, focus, screen reader, contrast, reduced motion.
- Timezone, para birimi, tarih/sayı biçimi; EN/TR eşliği.
- Onboarding, runbook, incident playbook, ownership ve “bu alarmı kim çözer?” cevabı.
- Her kritik workflow için happy path değil; timeout, duplicate, retry, partial failure, poison message ve idempotency testleri.
- Persona/ajanın yaptığı dış eylemde hangi kimlikle, hangi yetkiyle ve hangi politika sürümüyle hareket ettiğinin kanıtı.

---

## 3. 153 legacy persona sayısını başarı metriği olarak kullanmayı bırakın

Mevcut roster güçlü bazı uzmanlar içeriyor; ancak ağırlığı dijital ajans/marketing/engineering şablonlarıdır. Örneğin yaklaşık 30 Marketing ve 41 “Specialized” kayıt varken kurumsal yönetim, HR, hukuk, strateji, risk, güvenlik, müşteri başarısı ve holding operasyonu aynı olgunlukta değildir.

Yeni hedef “daha çok persona dosyası” değildir. Hedef: **büyük hedefli, çok şirketli, AI-native holdingin her kritik kabiliyetinde net owner, head, yedekleme, yetki, KPI ve workflow bulunmasıdır.**

### 3.1 Önce kanıtlı kadro gap matrisi

153 legacy + mevcut v2 + registry’deki ek kayıtları tek envanterde birleştirin:

`capability | department | required role | existing persona(s) | gerçek kapsam | duplicate/overlap | missing authority | missing workflow | missing skill/MCP | risk if absent | decision: keep/merge/rewrite/add | target phase`

Kurallar:

- Dosya adına bakarak “var” demeyin; persona gövdesini ve gerçek görev kapsamını okuyun.
- Aynı işi yapan 5 yüzeysel persona yerine bir güçlü owner + gerektiğinde specialist pod tercih edin.
- “Specialized” kalıcı çöp çekmecesi olamaz. Her persona gerçek bir departmana ve yöneticiye taşınmalıdır.
- Her departmanda `head` olmak zorunda; her worker’ın escalation zinciri olmalı.
- Tek kritik persona/tek hata noktası varsa deputy veya failover tanımlayın.
- Legacy persona aktivasyondan önce v2 kalite kapısını geçmelidir. Sadece yeniden formatlamak yasaktır.
- Persona = doküman değil canlı çalışan: registry, employee record, model slotu, skill, MCP profile, permission, autonomy, budget, KPI, workflow ve dashboard görünürlüğü birlikte tamamlanmalıdır.
- Yeni departman/rol ekleme permission widening anlamına geliyorsa least-privilege review ve CEO-visible rationale zorunludur.

### 3.2 Asgari zorunlu departman/kabiliyet tabanı

Aşağıdaki aileleri mevcut rosterla karşılaştırın. Gerçek ve tam eşdeğeri yoksa yeni departman veya açıkça sahiplenilmiş pod olarak ekleyin. Bunların “Specialized içinde benzer bir dosya var” gerekçesiyle üstü kapatılamaz.

1. **CEO Office & Executive Operations**
   - Chief of Staff, Executive Operations Manager, Board/Decision Secretary, Strategic Initiatives Lead.
   - CEO’ya görev yığmak yerine kararları paketleyen ve departmanlar arası takibi kapatan katman.

2. **Corporate Strategy & Business Operations**
   - Head of Strategy, Corporate Development/M&A Analyst, Market Intelligence Lead, Portfolio Strategy, OKR/Performance Manager.
   - Holding seviyesinde sermaye, şirket portföyü, yeni pazar ve build/buy/partner kararları.

3. **People / HR / Talent Operations**
   - Head of People/CHRO, Talent Acquisition, Persona/Workforce Architect, Performance & Calibration, Learning & Development, Compensation/Workforce Planning, Employee Relations.
   - HR yalnız onboarding/recruitment dosyaları değildir; 24/7 AI workforce yaşam döngüsünün sahibidir.

4. **Legal, Compliance & Corporate Governance**
   - General Counsel/Head of Legal, Legal-DE, Legal-TR, Commercial Contracts, Corporate/Company Law, Privacy/DPO, IP & Licensing, Regulatory Compliance, Policy Writer, Corporate Secretary.
   - Mevcut policy-writer kararı somut persona + policy workflow + dashboard ownership ile kapatılmalı.

5. **Risk, Internal Audit & Assurance**
   - Enterprise Risk Manager, Internal Auditor, AI/Model Risk Officer, Financial Controls, Vendor/Third-Party Risk, Business Continuity Lead.
   - Compliance checker tek başına üç savunma hattı değildir.

6. **Security, Trust & Safety**
   - CISO/Security Head, AppSec, Cloud/SecOps, IAM & Secrets, Detection/Response, GRC, AI Safety/Red Team, Fraud/Abuse.
   - Engineering içindeki güvenlik uzmanları icracı olabilir; bağımsız risk/assurance ve yönetim sahipliği ayrıca tanımlanmalı.

7. **Data, AI Platform & Evaluation**
   - Chief AI/Data Lead, ML/LLM Engineer, Data Platform/Quality, Analytics/BI, Model Evaluation, Prompt/Context Engineer, Knowledge Architect, AI Observability/FinOps.
   - “AI Engineer var” bütün model yönetişimi, eval, veri kalitesi ve knowledge ownership’i kapsamaz.

8. **Platform, Infrastructure & Reliability**
   - Platform Head, SRE/Cloud, Database Reliability, Network/Edge, Release/Environment Manager, Backup/Disaster Recovery, Capacity/FinOps.
   - Mevcut DevOps/SRE personası varsa gap matrisiyle sahiplik bölünmeli; yeni duplicate yaratılmamalı.

9. **Customer Success & Professional Services**
   - Head of Customer Success, Onboarding/Implementation, Solution Architect, Technical Account Manager, Adoption/Value Realization, Renewal/Expansion, Escalation Manager.
   - Support ticket cevaplamak ile müşteriyi başarıya ulaştırmak aynı fonksiyon değildir.

10. **Revenue Operations & Commercial Excellence**
    - RevOps Head, CRM/Data Steward, Pricing & Packaging, Deal Desk, Sales Operations, Partner/Channel Operations, Revenue Forecasting.
    - Sales ve Marketing arasındaki veri, handoff, attribution ve forecast tek owner’a bağlanmalı.

11. **Partnerships, Alliances & Ecosystem**
    - Strategic Partnerships, Technology Alliances, Channel/Reseller, Developer Ecosystem, Partner Due Diligence.

12. **Corporate Communications & Reputation**
    - PR/Media Relations, Executive Communications, Crisis Communications, Employer Brand, Analyst Relations.
    - Sosyal medya içerik üretimi kurumsal itibar yönetiminin eşdeğeri değildir.

13. **Finance’in kurumsal tamamlayıcı rolleri**
    - CFO/Finance Head, Treasury, Accounts Receivable/Collections, Revenue Accounting, Payroll, Procurement/Vendor Management, Insurance, Financial Risk.
    - Mevcut bookkeeping/FP&A/tax kadrosuyla çakışma analizi yapın; boş kalan kontrol sahiplerini ekleyin.

14. **Global Expansion & Regional Operations**
    - Market Entry, Localization Operations, DE/TR/EU regulatory operations, cross-border tax/contract/data residency koordinasyonu.
    - Çok dil bilen persona ile ülke operasyonu aynı şey değildir.

15. **Quality Management & Operational Excellence**
    - Quality Head, Process Excellence, Root-Cause/Corrective Action, Release Readiness, Service Quality/SLA owner.
    - Testing personası test üretir; şirket çapı kalite sisteminin sahibi ayrıca tanımlanmalıdır.

Bu liste tavan değil tabandır. Gap audit; holdingin gerçek ürünleri, hedef pazarları, regülasyonları, satış modeli ve şirket portföyüne göre ek zorunlu kabiliyetler önerebilir. Ancak bürokrasi üretmek, vanity title eklemek ve işsiz persona çoğaltmak yasaktır.

### 3.3 Her yeni persona için zorunlu sözleşme

Her `add` kararı şu alanlarla teslim edilir:

- Neden mevcut 153 içinde karşılığı yok veya neden mevcut rol yetersiz?
- Department, manager/head, peers, escalation ve deputy/failover.
- Mission, measurable outcomes/KPI, owned workflows ve output contracts.
- Decision scope, authority limits, forbidden actions ve CEO escalation şartı.
- Default model + fallback, effort tier ve cost budget.
- Skills, MCP grants/denials, data access ve secret boundary.
- Autonomy level; para-çıkışı, sözleşme ve dış iletişim politikası.
- Memory/knowledge write policy ve provenance sorumluluğu.
- Quality/evaluation rubric, failure modes ve shutdown/rollback davranışı.
- Dashboard’da nerede görüneceği; run, task, cost, decision ve audit bağlantıları.
- `v2.0-fable` kalite kapısı ve makine-doğrulanabilir activation proof.

---

## 4. Roadmap’e nasıl işlenecek

Önce **tek bir GAP-AUDIT.md** üretin; doğrudan yüzlerce dosya yazmaya başlamayın. Raporda:

1. Dashboard route matrisi ve gerçek/placeholder sayısı.
2. Untracked/comment-only/roadmap dışı kalmış fonksiyonlar.
3. Auth/session gap’leri.
4. CRM + multi-company holding gap’leri.
5. AI orchestration/knowledge/memory/library gap’leri.
6. Operasyon/security/recovery/accessibility gap’leri.
7. 153 persona capability matrisi.
8. Zorunlu yeni departman/persona önerileri; duplicate/merge gerekçeleri.
9. Her bulgunun severity’si: BLOCKER / CRITICAL / MAJOR / MINOR.
10. Her bulgunun doğru fazı, bağımlılığı, owner’ı, kabul testi ve tahmini iş paketi.

Ardından onaylanan bulguları mevcut `IMPLEMENTATION_ROADMAP` içine **numaralı ve kanıt-komutlu** maddeler olarak işleyin. Yalnız GAP-AUDIT.md’ye yazıp bırakmak yasaktır.

Önerilen yeni kapılar:

- **Auth Closure (mevcut sırayı bozmayan yeni roadmap alt-adımı):** logout + session lifecycle.
- **Her E bloğunda module closure:** ilgili placeholder kendi domain adımında kapanır.
- **E12 Route Completeness Gate:** `ModuleWaiting=0`, route matrisi tam.
- **E12 Holding/CRM Integration Gate:** CRM ve company context yeni shell içinde.
- **E12 Workforce Completeness Gate:** hierarchy + gap-approved new personas + activation proof.
- **E13 Operational Readiness:** restore drill, session E2E, accessibility, failure paths, scale/performance.

Numaralandırmayı mevcut bağımlılık düzenini bozmadan ekip belirlesin; fakat maddeler sahipsiz ve fazsız kalmasın.

---

## 5. CEO’ya verilecek ilk cevap formatı

İlk turda “tamamlıyoruz” demeyin. Şu formatta gerçek rapor verin:

### A. Dashboard

- Toplam route:
- Gerçek domain sayfası:
- Placeholder/ModuleWaiting:
- Ölü/yanlış bağlı kontrol:
- Auth blocker:
- Roadmap dışına düşmüş kritik özellik:

### B. Workforce

- Legacy persona:
- v2 persona:
- Aktif/dormant:
- Head sayısı ve head’siz departman:
- Orphan/escalation’sız worker:
- Mevcut departman:
- Önerilen yeni departman/pod:
- Önerilen yeni persona:
- Merge/rewrite önerisi:

### C. En kritik 10 açık

`ID | severity | gerçek kanıt | risk | önerilen faz | owner | acceptance proof`

### D. Karar gerektiren konular

Yalnız gerçekten CEO kararı gereken, 2-3 seçenekli, etkisi ve önerisi yazılmış maddeler. CEO’ya araştırma veya uygulama işi atmayın.

---

## 6. Final kabulte çalıştırılacak sert kontroller

Final raporda en az şu iddialar kanıtlanmalıdır:

- `ModuleWaiting` kullanılan production nav route sayısı = **0**.
- Logout → session yok → `/login`; geri tuşu korumalı içeriği açmaz.
- Her nav route gerçek domain sorgusu + drill-down kanıtına sahip.
- Mutation gereken her domain gerçek control function + audit + Broadcast kanıtına sahip.
- Global Search, Command Palette ve CEO intent uçtan uca çalışır.
- CRM ve multi-company context yeni shell içinde görünür ve testlidir.
- Orchestration panel gerçek rol/model/fallback/audit verisini gösterir.
- Knowledge/Memory/Library sahte çapraz sayılar yerine kendi domain verisini gösterir.
- Restore drill başarıyla yapılmıştır; yalnız backup dosyasının varlığı kabul edilmez.
- EN/TR, accessibility, responsive ve failure-state testleri geçer.
- 153 legacy kaydın her biri için keep/merge/rewrite/retire kararı vardır; CEO onayı olmadan rol silinmez.
- Her aktif departmanda head, escalation ve measurable outcome vardır.
- Her yeni zorunlu persona canlı employee olarak registry + model + skill + MCP + permission + budget + dashboard + audit zincirinde görünür.
- Persona sayısı değil capability coverage raporlanır.
- Kanıtsız “done”, “complete”, “production-ready” ifadesi = otomatik RET.

## Son emir

Bu sistem güzel görünen 40 menülü bir demo veya 153 dosyalı bir persona arşivi olmayacak. Gerçek bir AI-native holding işletim sistemi olacak. Her menü bir işe, her sayı bir kaynağa, her kontrol denetlenebilir bir değişikliğe, her persona ölçülebilir bir sorumluluğa ve her kritik karar geri izlenebilir bir kanıta bağlanacak.

Boşlukları gizlemeyin. Planın içinde adı geçiyor diye tamam saymayın. Önce gerçeği ölçün, sonra doğru faza bağlayın, sonra uygulayın, test edin ve kanıtlayın.
