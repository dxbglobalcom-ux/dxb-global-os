# CEO Operating Manual · CEO Kullanım Kılavuzu

**Row:** E13.3 (U13 language exception: Turkish primary + English canonical mirror in this ONE file)
**Author:** Fable 5, in person · **Date:** 2026-07-18 · **Status:** LIVE — accompanies the E13.2 eye-test session
**Scope truth:** every screen, button, and rule described below was measured against the running
dashboard and live database on 2026-07-18 (46 nav routes, live enums, settings registry). If a
future wave changes a surface, this manual is updated in the SAME commit (single-source rule).

---

# BÖLÜM 1 — TÜRKÇE (ana metin)

## 1. Bu belge nedir?

Şirketinizin kokpitini nasıl kullanacağınızın tek kaynağı. Şirket 7/24 kendi kendine çalışır;
sizin göreviniz yönetmek, onaylamak ve gerektiğinde durdurmaktır — babysitting değil.
Günde ~15 dakikalık bir rutinle tüm holdingi yönetebilirsiniz.

**Holdinge iş verirken hedef verirsiniz** (B64 kurulunca): bir mühendise iş yazar gibi geniş bir
tarif — ne istendiği, nasıl olacağı, özellikleri. Tek satırlık "niyet" kutusu kalkar. Hamza
hedefinizi bir tarife çevirir: cümleniz aynen kalır, yanına işin "bitti" ölçütü ve değeri yazılır.
İşi, işin türüne göre seçilen ustası baştan sona yürütür; sonuç aynı konuşmada size gelir. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->

## 2. Günlük rutin (sabah, ~15 dk)

1. **Sabah brifingi — Hamza size yazar (W2.6, 2026-07-27'den beri).** Her sabah **07:00'de
   (sizin saatinizle)** Hamza sohbet panosunda YENİ BİR KONUŞMA AÇAR: gece ne bitti, holdingin
   kendi kendine ne başlattığı, sizi bekleyen onay/uyarı, 24 saatlik ve aylık para, gelir hattı.
   `Command → Hamza ile Sohbet (/chat)` — konuşmalar sütununda en üsttedir, "Sabah brifingi"
   rozetiyle. Cevap yazarsanız aynı konuşmada devam eder. Sayılar tek bir SQL görünümünden gelir
   (`v_ceo_briefing`) — hiçbir model yazmaz, dolayısıyla uydurma sayı imkânsızdır.
   **Kapatma anahtarı sizde:** `briefing.proactive.enabled` (ayarlar) ve günlük tavan
   `briefing.proactive.max_per_day`. Aynı brifingi `Komuta → Zekâ Akışı (/intelligence)` sayfasında
   sayfa hâlinde de görürsünüz (kaynak: `v_morning_briefing`).
   **B64 kurulunca brifing değişir:** yalnız istisnalar (kırmızıya dönen, takılan, sizi
   bekleyen), gelen işlerin tek satırı, Önemli mailler, yaklaşan teslim tarihleri, Hermes'in
   gece yaptıkları ve rüyanın tek satırı ("Dün gece N iş okundu, 3 şey bulundu, 1'i sizi
   bekliyor."). Biten işler listelenmez; sonuçlar kendi konuşmalarında size gelir.
   **Önemli bölmesi** (B64 kurulunca, her sayfada sağ şeritte): müşteriden, resmi bir yerden ya da
   gerçek bir kişiden gerçek bir konuda gelen mailler. Emin olunamayan mail de buraya gelir,
   çöpe gitmez.
2. **Onay kutusu** — `Command → Approvals (/approvals)`. Sol menüdeki rozet bekleyen onay
   sayısını canlı gösterir. Kurallar §5'te.
3. **Alarmlar** — `Command → Alerts (/alerts)`. Rozet yüksek-riskli bekleyenleri sayar.
   Seviye tablosu §6'da.
4. Gerisi şirketin işi. Merak ettiğinizde `Live (/live)` canlı akışı, `Overview (/overview)`
   özet kokpiti gösterir.

## 3. Sekiz navigasyon grubu — ne nerede?

| Grup | Ne işe yarar | Sayfalar |
|---|---|---|
| **Komuta** | Günlük yönetim masanız | Yönetici Özeti (özet kokpit, widget'lı) · Hamza ile Sohbet (/chat — sesli hat da burada) · Canlı Operasyonlar (canlı akış) · Zekâ Akışı (brifing) · Onaylar (rozetli) · Uyarılar (rozetli) · Karşılama (dışarıdan gelen her mail ve mesaj, Müşteriler görünümüyle — B64 kurulunca) |
| **Organizasyon** | Şirketin insanları | Holding Yapısı (harita) · Şirketler · Departmanlar (22 departman) · Direktörler · Çalışanlar · İK (yaşam döngüsü) |
| **Operasyon** | İşin kendisi ve para kazanan işler | Projeler · Gelir İstihbaratı · Portföy · CRM · Fırsatlar · Hedefler · İş Akışları · Otomasyonlar |
| **Zekâ** | Beyin ve bilgi | Modeller · Orkestrasyon · Bellek · Bilgi · Kütüphane · Yetenekler · Eklentiler · MCP Sunucuları |
| **Yönetişim** | Kural ve karar | Kararlar · Riskler · Politikalar · Yetkiler · Güvenlik |
| **Finans & Kaynaklar** | Para | Kâr & Zarar — Kazanç · Maliyetler · Tokenlar · Bütçeler · Sağlayıcılar · Kapasite |
| **Sistem** | Makinenin ayarları | Ayarlar · Entegrasyonlar · Sistem Sağlığı · Yedekler |
| **Makine Odası** | Robotların okuduğu telemetri | Denetim (Hook ihlalleri sekmesiyle) · Çalışma Zamanı · Kayıtlar |

Görevler menüde yoktur; sayfa drill bağlantılarıyla açılır.

## 4. Drill-down haritası — "bu sayı nereden geliyor?"

Kokpitteki HER sayı tıklanabilir; tıklayınca kaynağına iner:

- Overview'daki widget sayıları → ilgili liste sayfası (görev sayısı → /ops/tasks, onay → /approvals…).
- Departman kartı → departman detayı → çalışan → çalışanın koşu geçmişi ve maliyeti.
- P&L satırı → gelir kaydı; maliyet → /fin/costs → koşu bazında token dökümü.
- Alarm satırı → kaynak koşu/görev; onay satırı → talep eden çalışan + gerekçe + kanıt.
- CRM: müşteri → kontaklar/fırsatlar/talepler (şirket duvarı: sağ üstteki ŞİRKET
  anahtarıyla evren değişir).
- Kural: bilgi taşımayan alan gösterilmez; "…" kesmesi yasaktır. Görürseniz kusurdur — söyleyin.

## 5. Onay akışı kuralları

Onay merkezi: `/approvals`. Yedi karar aksiyonunuz var (ölçülü, canlı):
**approve · reject · approve_with_modifications · delegate · request_info · reanalyze · change_policy**

- **PARA-ÇIKIŞI ASLA TOPLU İŞLENMEZ.** Toplu onay yalnız düşük-risk rutin kalemler içindir;
  para-çıkışı, sözleşme ve kimlik adımları TEK TEK, gerekçe okuyarak karara bağlanır.
  (Para GİRİŞİ onay istemez — yerleşik kural.)
- **delegate ne zaman?** Karar teknik derinlik istiyorsa — karar işin ustasına ya da hattın kalıcı
  sahibine devredilir, izi `delegated_to` ile kayda geçer.
- **reanalyze ne zaman?** Gerekçe zayıfsa veya bilgi eskiyse — talep yeniden analize gider,
  yeni koşu kanıtıyla döner. "Emin değilim" hissinin doğru düğmesi budur; reddetmek değil.
- **request_info ne zaman?** Tek bir eksik cevap varsa (maliyet? alternatif?) — talep edene soru döner.
- 24 saatten uzun bekleyen para-çıkışı onayı otomatik HIGH alarm üretir (para bekletilmez).
- **B64 kurulunca size gelenler:**
  - Anlaşması 1.000 $ ve üstü olan bir işin ilk teslimi, müşteriye gitmeden önce size gelir. Notunuz
    olursa düzeltilir. Sözleşmedeki düzeltme turları içindeki teslim kontrollerden sonra gider;
    isterseniz herhangi bir teslimi yine görürsünüz. Kartta müşterinin teslim tarihi durur; tarih yaklaşınca Hamza sabah
    hatırlatır. Bakamayacaksanız tek kelime yeter: "gönderin".
    <!-- CEO-OK: b64-after-the-deal-and-plan-merge-rule-2026-10-27 -->
  - Daha küçük tek seferlik işlerde yalnız her yeni hizmet türünün ilk teslimi size gelir.
  - Fiyat politikasını ve standart sözleşme metnini bir kez onaylarsınız. Bunlara uyan teklif ve
    sözleşme size gelmez; uymayan her şey gelir. Reklam harcaması size gelir.

## 6. Alarm seviyeleri ve doğru tepki

Canlı seviye kümesi (ölçülü): **informational · attention · high · critical**

| Seviye | Anlamı | Doğru tepkiniz |
|---|---|---|
| informational | Bilgi; işlem istemez | Okuyun, geçin |
| attention | Bir şey sapmaya başladı | Gün içinde göz atın; mitigasyon önerisini okuyun |
| high | Müdahale bekliyor (ör. bekleyen para-çıkışı, kuyruk yaşlanması) | Aynı gün karar: onayla/reddet/delege et  <!-- HISTORY --> |
| critical | Sistem veya bütçe tehdidi | Hemen bakın; gerekirse §8 Global Pause |

Her alarm satırı olası neden + önerilen aksiyon + sorumlu çalışan taşır. Alarmı susturmak
(`muted_until`) çözmek değildir; çözüm kaydı `resolved_at` ile kapanır.

## 7. Bütçe ve hard-stop davranışı

- Aylık işletme bandı: **€50–150**. Cost Monitor **%70**'te uyarır, **%100**'de kritik-olmayan
  işleri kendiliğinden DURDURUR (hard-stop).
- **Hard-stop'tan çıkış (release) SİZİN kararınızdır** — sistem kendi kendine devam etmez.
  Costs/Budgets sayfasından durumu görür, bütçe anahtarlarını Control Mode'dan değiştirirsiniz.
- Çalışan başı limit: `employee.budget_limit_eur`. Görev başı tavan:
  `orchestrator.max_cost_per_task_eur`.
- **B64 kurulunca:** bütçe holding → şirket → proje → iş diye iner; sürekli bir işin de kendi
  bütçesi olur. Departman bütçesi yoktur; harcama yine departmana göre etiketlenir. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->
  %70'te ve %90'da uyarı gelir; %100'de kritik olmayan yeni iş durur. Değerli bir işin bütçesi anlaşmanın en fazla %30'udur
  (1.000 $'lık işte 300 $). Fiyatı bilinmeyen bir model "0 $" sayılmaz, "maliyet bilinmiyor"
  sayılır. Hermes'e şimdilik harcama sınırı konmaz (15. karar).

## 8. Acil durum: Global Pause

`Sistem → Ayarlar (/sys/settings)` → anahtar: **`os.global_pause`**. Açtığınızda şirket
duraklar: yeni koşu başlamaz, dışa dönük hiçbir adım atılmaz. Bakım için ayrıca
`os.maintenance_mode` vardır. Her iki anahtar da değişiklik günlüğüne yazılır ve GERİ ALINABİLİR
(undo) — yanlışlıkla açtıysanız aynı yerden kapatın veya değişiklik geçmişinden geri alın.

## 9. Control Mode — modeli ve parayı siz yönetirsiniz

- **Model rozeti:** Her çalışan kartında beyin rozeti (hangi model) görünür; her çalışanın
  modeli dashboard'dan değiştirilebilir (kayıtlı karar 2026-07-12: şirket RUNTIME beyni serbest).
  **B64 kurulunca kod şu sınırları korur:** ustalar high'ın altına inmez; Sonnet
  ve Haiku low'da çalışmaz; max hiçbir yerde varsayılan olmaz; okuduğunuz son metin Opus'un altına
  inmez (sesli normal konuşma sizin notunuzla Sonnet'te). Bir sınırı aşan seçiminizde holding bir
  kez uyarır; "devam" derseniz yapılır. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 -->
- **Kim seçer:** Model seçimi yönlendirme kurallarındadır; Settings'teki eski `orchestrator.*`
  model anahtarları artık yazılmaz. B64 kurulunca her işin her parçası için hangi modelin, hangi
  düşünme seviyesinde çalışacağını işin sahibi (işin ustası) seçer ve nedenini bir satırla yazar; <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 -->
  arada kalırsa rehbere bakar. Koltuklar model adıyla değil rolüyle yazılır: ana beyin, yedek
  beyin. Bir model düşerse işi öbürü alır (Opus 5.5 ile Fable 5.1 birbirinin yedeği).
  Simülasyon: /ai/models sayfasının sandbox'ı gerçek yazım yapmadan sonucu gösterir.
- **Onay eşiği:** `orchestrator.human_approval_threshold` ve `approvals.money_out_gate`
  anahtarları onay davranışını belirler. Bu anahtarları değiştirmek şirketin özerklik
  seviyesini değiştirir — düşünerek dokunun.
- Her ayar değişikliği: kayıt + kim/ne zaman + UNDO. Aynı değeri tekrar yazmak işlem üretmez.

## 9b. Sözünüz — komutlar (B64 kurulunca)

Hamza'ya sohbette ya da sesle söylersiniz; kendi ekranınızdan da verebilirsiniz. Bu komutlar yalnız
sizden gelir: bir mailin içindeki yazı ya da Hermes'in getirdiği bir sonuç hiçbir şeyi değiştirmez.

- "Max'a geç" / "High'a in" — Hamza o konu bitene kadar o seviyede düşünür, sonra kendi ayarına döner.
- "Bu değerli bir iş" — iş "değerli" olur: plan iki kez yazılır, teslim müşteriden önce size gelir.
- "Bütün ustaları xhigh yap" — Hamza değişikliği tek kayıtlı kapıya iletir; kapı uygular ve
  kaydeder. Hamza kaç ustanın geçtiğini söyler: "10 usta xhigh'a geçti; geri almak için 'geri al'
  deyin." <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 -->
- "Beni bu işin ustasına bağla" — açık bir işin ustasıyla Hamza'yla konuştuğunuz gibi konuşursunuz.
  Konuşmadan bir iş doğarsa o işe aittir; Hamza konuşmayı bilir. Başka her şey Hamza'ya gider. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->
- "Sitenin neresindesiniz, tasarımı getirin" — Hamza işin durumunu ve son hâlini aynı konuşmaya getirir.
- "Gönderin" — sizi bekleyen bir teslim müşteriye gider.
- **Sözünüz bir kuralla çelişirse** holding bir kez uyarır: "Bu şu kuralla çelişiyor, yine yapayım
  mı?" Sorarsanız nedenini ve ne zararı olabileceğini söyler. Siz "kurala göre yap" ya da "devam et"
  dersiniz. "Devam" bir kerelik istisnadır; kural silinmez, siz "bu kuralı kaldır, şunu koy" diyene
  kadar yerinde kalır.

## 10. Göz testi ve design-bank döngüsü

- Ekran görselleri `references/design-bank/` altında baseline olarak birikir; her görsel iş
  bir Design Verification Pass ile iner (RULE #0) ama **son söz sizin gözünüzdür**.
- Sizden beklenen: bekleyen baseline listesine bakmak, kusur gördüğünüzde SÖYLEMEK
  (kusuru bulmak sizin işiniz değil; bulduğunuzda bildirmeniz yeterli — o bir governance kaydı olur).
- E13.2 oturumu: 10 ekran + görsel maddeler, giriş bilgileri size ÖNCEDEN verilir.

## 11. Sesli hat (Voice) — dürüst durum

`Command → Hamza ile Sohbet (/chat)`: sesli hat bu sayfadadır (24 Temmuz'dan beri `/voice` buraya
yönlenir). Tıkla-konuş; Hamza kendisi cevap verir. Listeden birini seçerseniz o kendi kayıtlı
sesiyle cevap verir (€0 hat); B64 kurulunca listede açık işlerin ustaları durur. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> **Açık kusur defteri var (U15):** STT gecikmeleri ve
yanlış-dil çözümlemesi ölçüldü; çözüm planı `00-NOTE-R32-VOICE-REMEDIATION-PLAN` — sizinle ortak
test seansı gerektirir. O kapanana kadar sesli hat "çalışır ama pürüzlü" statüsündedir.

**B64 kurulunca:** "Beni bu işin ustasına bağla" dediğinizde — sohbette de seste de — o işin
ustasıyla Hamza'yla konuştuğunuz gibi konuşursunuz; konuşma panoda durur, Hamza da bilir. Başka her
şeye Hamza cevap verir. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> Hamza normal
konuşmada orta seviyede düşünür; plan konuşulunca kendisi bir üst seviyeye geçer ve söyler. Uzun
düşünürken önce "Düşünüyorum, Muhittin Bey" der, uzun cevabı ekrana da koyar. Hedef: Hamza'nın
sesi 1–1,3 saniyede gelir.

## 12. Bir şey ters giderse

1. Ekran çöktüyse: "Yeniden dene" paneli gelir (sınır katmanı); gelmiyorsa adresi kontrol edin —
   bilinmeyen adres şık 404 verir.
2. Şirket saçmalıyorsa: §8 Global Pause → sonra Alerts + Audit (/gov/audit) izinden okuyun.
3. Para şüphesi: /fin/costs → koşu bazında döküm; hard-stop zaten %100'de kendiliğinden iner.
4. Her kararınız, her ayar değişiminiz, her onayınız denetim izindedir — hiçbir şey kaybolmaz.

---

# PART 2 — ENGLISH (canonical mirror)

## 1. What this is

The single source for operating your company cockpit. The company runs 24/7 on its own; your
job is to direct, approve, and — when needed — stop it. A ~15-minute daily routine governs
the whole holding.

**You give the holding a goal** (with B64's build): a broad brief, the way a task is written for an
engineer — what is wanted, how it should be, its features. The one-line "intent" box goes. Hamza
turns your goal into a brief: your sentence stays verbatim, beside it the job's "done" criteria and
its value. The master of the job's type runs it end to end, and the result comes back to you in the
same conversation. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->

## 2. Daily routine (morning, ~15 min)

1. **Morning briefing — Hamza writes to you (W2.6, since 2026-07-27).** Every morning at
   **07:00 your time**, Hamza OPENS A NEW CONVERSATION on the chat board: what finished
   overnight, what the holding started by itself, what waits on you, 24-hour and month-to-date <!-- HISTORY -->
   money, the revenue line. `Command → Chat with Hamza (/chat)` — top of the conversation
   column, badged "Morning briefing". Reply and the thread continues. The figures come from one
   SQL view (`v_ceo_briefing`) and no model writes them, so an invented number is impossible.
   **You hold the switch:** `briefing.proactive.enabled` plus the daily ceiling
   `briefing.proactive.max_per_day`. The same briefing is also a page:
   `Command → Intelligence Feed (/intelligence)` (source: `v_morning_briefing`).
   **With B64's build the briefing changes:** only the exceptions (turned red, stuck, waiting on
   you), one line on what came in, the Important mails, due dates coming close, what Hermes did
   overnight, and the dream's one line ("Dün gece N iş okundu, 3 şey bulundu, 1'i sizi
   bekliyor."). Finished work is not listed; results reach you in their own conversations.
   **The Important pane** (with B64's build, in the right rail on every page): mail from a client,
   an official body, or a real person on a real matter. A mail the sorter is unsure of lands here
   too, never in the bin.
2. **Approval inbox** — `Command → Approvals (/approvals)`. The sidebar badge counts pending
   approvals live. Rules in §5.
3. **Alerts** — `Command → Alerts (/alerts)`. The badge counts high-risk pending items.
   Level table in §6.
4. The rest is the company's job. `Live (/live)` streams operations; `Overview (/overview)`
   is the widget cockpit.

## 3. The eight navigation groups

| Group | Purpose | Pages |
|---|---|---|
| **Command** | Your daily desk | Executive Overview (widget cockpit) · Chat with Hamza (/chat — the voice line lives here) · Live Operations · Intelligence Feed (briefing) · Approvals (badged) · Alerts (badged) · Reception (every inbound mail and message, with the Customers view — with B64's build) |
| **Organization** | The company's people | Holding Structure (map) · Companies · Departments (22) · Directors · Employees · HR (lifecycle) |
| **Operations** | The work itself and the money-making work | Projects · Revenue Intelligence · Portfolio · CRM · Opportunities · Objectives · Workflows · Automations |
| **Intelligence** | Brain & knowledge | Models · Orchestration · Memory · Knowledge · Library · Skills · Plugins · MCP Servers |
| **Governance** | Rules & decisions | Decisions · Risks · Policies · Permissions · Security |
| **Finance & Resources** | Money | P&L — Earnings · Costs · Tokens · Budgets · Providers · Capacity |
| **System** | The machine's settings | Settings · Integrations · System Health · Backups |
| **Machine Room** | Telemetry the robots read | Audit (with the Hook Violations tab) · Runtime · Logs |

Tasks has no menu row; the page opens from drill links.

## 4. Drill-down map — "where does this number come from?"

Every number in the cockpit is clickable and descends to its source: overview widgets → the
backing list page; department card → department → employee → run history and cost; P&L line →
revenue record; cost → /fin/costs → per-run token breakdown; alert row → source run/task;
approval row → requesting employee + rationale + evidence; CRM client → contacts/deals/requests
(the COMPANY switch in the chrome inverts the data universe). Standing rule: info-free fields
are never rendered and "…" truncation is banned — if you see either, it is a defect; say so.

## 5. Approval-flow rules

Approval center: `/approvals`. Seven decision actions (measured live):
**approve · reject · approve_with_modifications · delegate · request_info · reanalyze · change_policy**

- **MONEY-OUT IS NEVER PROCESSED IN BULK.** Batch decisions are for low-risk routine items
  only; money-out, contracts, and identity steps are decided ONE BY ONE with the rationale
  read. (Money-IN needs no approval — standing rule.)
- **When delegate?** The decision needs technical depth — it goes to the job's master or the
  line's standing owner, and the decision transfers with a recorded `delegated_to` trail.
- **When reanalyze?** The rationale is weak or stale — the request goes back for a fresh
  analysis run and returns with new evidence. This is the correct button for "not sure",
  not reject.
- **When request_info?** One specific answer is missing (cost? alternative?) — a question
  returns to the requester.
- A money-out approval pending > 24h auto-raises a HIGH alert (money must not sit).
- **What reaches you with B64's build:**
  - The first delivery of a job whose deal is 1,000 $ or more reaches you before the client. A note
    from you → it is corrected. A revision inside the contract's rounds goes out after the checks;
    you may still ask for any delivery. The card carries the client's due date; as it nears, Hamza
    reminds you in the morning. If you cannot look, one word is enough: "gönderin".
    <!-- CEO-OK: b64-after-the-deal-and-plan-merge-rule-2026-10-27 -->
  - In smaller one-off jobs, only the first delivery of each new service type reaches you.
  - You approve the price policy and the standard contract text once. Offers and contracts inside
    them no longer reach you; everything outside does. Ad spend reaches you.

## 6. Alert levels and the correct response

Live level set (measured): **informational · attention · high · critical**

| Level | Meaning | Your response |
|---|---|---|
| informational | FYI; no action | Read, move on |
| attention | Something started drifting | Look same day; read the suggested mitigation |
| high | Awaiting intervention (e.g. pending money-out, queue aging) | Decide same day |
| critical | System or budget threat | Look immediately; §8 Global Pause if needed |

Every alert carries probable cause + suggested action + responsible employee. Muting
(`muted_until`) is not resolving; resolution closes with `resolved_at`.

## 7. Budget and hard-stop behavior

- Monthly operating band: **€50–150**. Cost Monitor alerts at **70%**, and at **100%**
  HARD-STOPS non-critical work by itself.
- **Release from hard-stop is YOUR decision** — the system never resumes itself. See state
  on Costs/Budgets; change budget keys in Control Mode.
- Per-employee: `employee.budget_limit_eur`. Per-task ceiling:
  `orchestrator.max_cost_per_task_eur`.
- **With B64's build:** the budget descends holding → company → project → job; a line of recurring
  work has its own budget too. There is no department budget; spend is still tagged by department.
  <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 --> Alerts at 70%
  and 90%; at 100% non-critical new work stops. A valuable job's budget is at most 30% of the deal
  (300 $ on a 1,000 $ job). A model with no price counts as "cost unknown", never 0 $. For now no
  spend limit is put on Hermes (decision 15).

## 8. Emergency: Global Pause

`System → Settings (/sys/settings)` → key **`os.global_pause`**. When ON, the company pauses:
no new runs start, nothing outward fires. `os.maintenance_mode` exists separately for
maintenance. Both keys are change-logged and UNDO-able.

## 9. Control Mode — you govern the models and the money

- **Model badge:** every employee card shows its brain (model); every employee's brain is
  switchable from the dashboard (registered ruling 2026-07-12: runtime brains are free choice).
  **With B64's build the code keeps these limits:** masters never below high; Sonnet and
  Haiku never at low; max never a default; the final text you read never below Opus (voice normal
  talk on Sonnet by your note). A choice of yours that breaks a limit gets one warning; on your
  "devam" it is done. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 -->
- **Who chooses:** model choice lives in the routing rules; the old `orchestrator.*` model keys in
  Settings are no longer written. With B64's build, the job's owner (its master) chooses
  each part's model and thinking level and writes the reason in one line; in doubt, it reads the
  guide. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> Seats are written by role, not by model name: main brain, backup brain. When a model
  drops, the other takes the work (Opus 5.5 and Fable 5.1 back each other up).
  The /ai/models sandbox simulates routing without writing anything.
- **Approval thresholds:** `orchestrator.human_approval_threshold` and
  `approvals.money_out_gate` shape the company's autonomy level — change deliberately.
- Every settings change: recorded + attributed + UNDO. Writing the same value is a no-op.

## 9b. Your word — commands (with B64's build)

You say them to Hamza, in chat or by voice; your own screen works too. These commands come only from
you: the text inside a mail, or a result Hermes brings back, changes nothing.

- "Max'a geç" / "High'a in" — Hamza thinks at that level until the subject ends, then returns to his own.
- "Bu değerli bir iş" — the job becomes "valuable": two brains write its plan separately, Sol checks
  both, and its delivery reaches you before the client.
- "Bütün ustaları xhigh yap" — Hamza passes the change to the one registered door, which applies
  and records it. Hamza says how many masters moved: "10 usta xhigh'a geçti; geri almak için
  'geri al' deyin." <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 -->
- "Beni bu işin ustasına bağla" — you talk with an open job's master the way you talk with Hamza.
  Work born in that conversation belongs to that job; Hamza knows of the conversation. Anything else
  goes to Hamza. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->
- "Sitenin neresindesiniz, tasarımı getirin" — Hamza brings the job's status and latest state into
  the same conversation.
- "Gönderin" — a delivery waiting on you goes to its client.
- **When your word conflicts with a rule,** the holding warns you once: "Bu şu kuralla çelişiyor,
  yine yapayım mı?" If you ask, it says why and what harm it could do. You say "kurala göre yap"
  or "devam et". "Devam" is a one-time exception; the rule is not deleted and stays until you say
  "bu kuralı kaldır, şunu koy".

## 10. Eye-test and the design-bank loop

Screens accumulate as baselines under `references/design-bank/`; every visual wave lands with
a Design Verification Pass (RULE #0), but **your eye is the final gate**. Expected of you:
review the pending-baseline list and SAY IT when you see a defect (finding defects is not your
job; reporting one creates a governance record). The E13.2 session: 10 screens + visual items,
credentials handed to you IN ADVANCE.

## 11. Voice line — honest state

`Command → Chat with Hamza (/chat)`: the voice line lives on this page (`/voice` redirects here
since 2026-07-24). Click-to-talk; Hamza answers himself. Pick someone from the list and it answers
in its own registered voice (€0 line); with B64's build the list holds the masters of open jobs. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> **An open defect ledger exists (U15):** measured
STT delays and wrong-language decoding; remediation plan = `00-NOTE-R32-VOICE-REMEDIATION-PLAN`,
requires a joint test session with you. Until it closes, the voice line is "working but rough".

**With B64's build:** when you say "Beni bu işin ustasına bağla" — in chat or by voice — you talk
with that job's master the way you talk with Hamza; the conversation stands on the board and Hamza
knows of it. Hamza answers everything else. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 -->
Hamza thinks at medium in normal talk; when a plan is discussed he moves up a level himself and
says so. Thinking long, he first says "Düşünüyorum, Muhittin Bey" and puts a long answer on the
screen too. The target: Hamza's voice arrives within 1-1.3 seconds.

## 12. When something goes wrong

1. A screen crashed: the "Try again" panel appears (boundary layer); unknown addresses get a
   proper 404.
2. The company misbehaves: §8 Global Pause → then read Alerts + the audit trail (/gov/audit).
3. Money doubt: /fin/costs per-run breakdown; hard-stop already self-fires at 100%.
4. Every decision, settings change, and approval you make is in the audit trail — nothing is lost.
