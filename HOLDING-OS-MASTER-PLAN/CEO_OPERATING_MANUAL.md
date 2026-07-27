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

## 2. Günlük rutin (sabah, ~15 dk)

1. **Sabah brifingi — Hamza size yazar (W2.6, 2026-07-27'den beri).** Her sabah **07:00'de
   (sizin saatinizle)** Hamza sohbet panosunda YENİ BİR KONUŞMA AÇAR: gece ne bitti, holdingin
   kendi kendine ne başlattığı, sizi bekleyen onay/uyarı, 24 saatlik ve aylık para, gelir hattı.
   `Command → Hamza ile Sohbet (/chat)` — konuşmalar sütununda en üsttedir, "Sabah brifingi"
   rozetiyle. Cevap yazarsanız aynı konuşmada devam eder. Sayılar tek bir SQL görünümünden gelir
   (`v_ceo_briefing`) — hiçbir model yazmaz, dolayısıyla uydurma sayı imkânsızdır.
   **Kapatma anahtarı sizde:** `briefing.proactive.enabled` (ayarlar) ve günlük tavan
   `briefing.proactive.max_per_day`. Aynı brifingi `Intelligence → /intelligence` sayfasında
   sayfa hâlinde de görürsünüz (kaynak: `v_morning_briefing`).
2. **Onay kutusu** — `Command → Approvals (/approvals)`. Sol menüdeki rozet bekleyen onay
   sayısını canlı gösterir. Kurallar §5'te.
3. **Alarmlar** — `Command → Alerts (/alerts)`. Rozet yüksek-riskli bekleyenleri sayar.
   Seviye tablosu §6'da.
4. Gerisi şirketin işi. Merak ettiğinizde `Live (/live)` canlı akışı, `Overview (/overview)`
   özet kokpiti gösterir.

## 3. Yedi navigasyon grubu — ne nerede?

| Grup | Ne işe yarar | Sayfalar |
|---|---|---|
| **Command** | Günlük yönetim masanız | Overview (özet kokpit, widget'lı) · Live (canlı akış) · Intelligence (brifing) · Approvals (onaylar, rozetli) · Alerts (alarmlar, rozetli) · Voice (sesli hat) |
| **Organization** | Şirketin insanları | Org (harita) · Companies · Departments (21 departman) · Directors · Employees · HR (yaşam döngüsü) |
| **Operations** | İşin kendisi | Projects · Workflows · Tasks (rozetli) · Automations · Runtime |
| **Intelligence** | Beyin ve bilgi | Models · Orchestration · Memory · Knowledge · Library (Kütüphane) · Skills · Plugins · MCP · Revenue (+Objectives/Opportunities/Portfolio) · CRM |
| **Governance** | Denetim ve kural | Audit · Decisions · Risks · Policies · Permissions · Security |
| **Finance** | Para | P&L (kazanç önce) · Costs · Tokens · Budgets · Providers · Capacity |
| **System** | Makine dairesi | Settings · Integrations · Health · Logs · Backups |

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
- **delegate ne zaman?** Karar teknik derinlik istiyorsa ve güvendiğiniz bir direktör varsa —
  karar o çalışana devredilir, izi `delegated_to` ile kayda geçer.
- **reanalyze ne zaman?** Gerekçe zayıfsa veya bilgi eskiyse — talep yeniden analize gider,
  yeni koşu kanıtıyla döner. "Emin değilim" hissinin doğru düğmesi budur; reddetmek değil.
- **request_info ne zaman?** Tek bir eksik cevap varsa (maliyet? alternatif?) — talep edene soru döner.
- 24 saatten uzun bekleyen para-çıkışı onayı otomatik HIGH alarm üretir (para bekletilmez).

## 6. Alarm seviyeleri ve doğru tepki

Canlı seviye kümesi (ölçülü): **informational · attention · high · critical**

| Seviye | Anlamı | Doğru tepkiniz |
|---|---|---|
| informational | Bilgi; işlem istemez | Okuyun, geçin |
| attention | Bir şey sapmaya başladı | Gün içinde göz atın; mitigasyon önerisini okuyun |
| high | Müdahale bekliyor (ör. bekleyen para-çıkışı, kuyruk yaşlanması) | Aynı gün karar: onayla/reddet/delege et |
| critical | Sistem veya bütçe tehdidi | Hemen bakın; gerekirse §8 Global Pause |

Her alarm satırı olası neden + önerilen aksiyon + sorumlu çalışan taşır. Alarmı susturmak
(`muted_until`) çözmek değildir; çözüm kaydı `resolved_at` ile kapanır.

## 7. Bütçe ve hard-stop davranışı

- Aylık işletme bandı: **€50–150**. Cost Monitor **%70**'te uyarır, **%100**'de kritik-olmayan
  işleri kendiliğinden DURDURUR (hard-stop).
- **Hard-stop'tan çıkış (release) SİZİN kararınızdır** — sistem kendi kendine devam etmez.
  Costs/Budgets sayfasından durumu görür, bütçe anahtarlarını Control Mode'dan değiştirirsiniz.
- Departman bütçesi: `department.budget_eur` anahtarı (Settings). Çalışan başı limit:
  `employee.budget_limit_eur`. Görev başı tavan: `orchestrator.max_cost_per_task_eur`.

## 8. Acil durum: Global Pause

`System → Settings (/sys/settings)` → anahtar: **`os.global_pause`**. Açtığınızda şirket
duraklar: yeni koşu başlamaz, dışa dönük hiçbir adım atılmaz. Bakım için ayrıca
`os.maintenance_mode` vardır. Her iki anahtar da değişiklik günlüğüne yazılır ve GERİ ALINABİLİR
(undo) — yanlışlıkla açtıysanız aynı yerden kapatın veya değişiklik geçmişinden geri alın.

## 9. Control Mode — modeli ve parayı siz yönetirsiniz

- **Model rozeti:** Her çalışan kartında beyin rozeti (hangi model) görünür; direktör/çalışan
  modeli dashboard'dan değiştirilebilir (kayıtlı karar 2026-07-12: şirket RUNTIME beyni serbest).
- **Yönlendirme anahtarları:** `orchestrator.primary_model`, `orchestrator.qa_model`,
  `orchestrator.planning_model`… (Settings'te "orchestrator." ailesi; global veya departman
  kapsamlı). Simülasyon: /ai/models sayfasının sandbox'ı gerçek yazım yapmadan sonucu gösterir.
- **Onay eşiği:** `orchestrator.human_approval_threshold` ve `approvals.money_out_gate`
  anahtarları onay davranışını belirler. Bu anahtarları değiştirmek şirketin özerklik
  seviyesini değiştirir — düşünerek dokunun.
- Her ayar değişikliği: kayıt + kim/ne zaman + UNDO. Aynı değeri tekrar yazmak işlem üretmez.

## 10. Göz testi ve design-bank döngüsü

- Ekran görselleri `references/design-bank/` altında baseline olarak birikir; her görsel iş
  bir Design Verification Pass ile iner (RULE #0) ama **son söz sizin gözünüzdür**.
- Sizden beklenen: bekleyen baseline listesine bakmak, kusur gördüğünüzde SÖYLEMEK
  (kusuru bulmak sizin işiniz değil; bulduğunuzda bildirmeniz yeterli — o bir governance kaydı olur).
- E13.2 oturumu: 10 ekran + görsel maddeler, giriş bilgileri size ÖNCEDEN verilir.

## 11. Sesli hat (Voice) — dürüst durum

`Command → Voice (/voice)`: bas-konuş ile bir direktöre soru sorarsınız, kayıtlı sesle cevap
döner (€0 hat). **Açık kusur defteri var (U15):** STT gecikmeleri ve yanlış-dil çözümlemesi
ölçüldü; çözüm planı `00-NOTE-R32-VOICE-REMEDIATION-PLAN` — sizinle ortak test seansı
gerektirir. O kapanana kadar sesli hat "çalışır ama pürüzlü" statüsündedir.

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

## 2. Daily routine (morning, ~15 min)

1. **Morning briefing — Hamza writes to you (W2.6, since 2026-07-27).** Every morning at
   **07:00 your time**, Hamza OPENS A NEW CONVERSATION on the chat board: what finished
   overnight, what the holding started by itself, what waits on you, 24-hour and month-to-date
   money, the revenue line. `Command → Chat with Hamza (/chat)` — top of the conversation
   column, badged "Morning briefing". Reply and the thread continues. The figures come from one
   SQL view (`v_ceo_briefing`) and no model writes them, so an invented number is impossible.
   **You hold the switch:** `briefing.proactive.enabled` plus the daily ceiling
   `briefing.proactive.max_per_day`. The same briefing is also a page:
   `Intelligence → /intelligence` (source: `v_morning_briefing`).
2. **Approval inbox** — `Command → Approvals (/approvals)`. The sidebar badge counts pending
   approvals live. Rules in §5.
3. **Alerts** — `Command → Alerts (/alerts)`. The badge counts high-risk pending items.
   Level table in §6.
4. The rest is the company's job. `Live (/live)` streams operations; `Overview (/overview)`
   is the widget cockpit.

## 3. The seven navigation groups

| Group | Purpose | Pages |
|---|---|---|
| **Command** | Your daily desk | Overview (widget cockpit) · Live · Intelligence (briefing) · Approvals (badged) · Alerts (badged) · Voice |
| **Organization** | The company's people | Org · Companies · Departments (21) · Directors · Employees · HR (lifecycle) |
| **Operations** | The work itself | Projects · Workflows · Tasks (badged) · Automations · Runtime |
| **Intelligence** | Brain & knowledge | Models · Orchestration · Memory · Knowledge · Library · Skills · Plugins · MCP · Revenue (+Objectives/Opportunities/Portfolio) · CRM |
| **Governance** | Audit & rules | Audit · Decisions · Risks · Policies · Permissions · Security |
| **Finance** | Money | P&L (earnings first) · Costs · Tokens · Budgets · Providers · Capacity |
| **System** | Engine room | Settings · Integrations · Health · Logs · Backups |

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
- **When delegate?** The decision needs technical depth and you trust a director — the
  decision transfers with a recorded `delegated_to` trail.
- **When reanalyze?** The rationale is weak or stale — the request goes back for a fresh
  analysis run and returns with new evidence. This is the correct button for "not sure",
  not reject.
- **When request_info?** One specific answer is missing (cost? alternative?) — a question
  returns to the requester.
- A money-out approval pending > 24h auto-raises a HIGH alert (money must not sit).

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
- Department budget: `department.budget_eur`. Per-employee: `employee.budget_limit_eur`.
  Per-task ceiling: `orchestrator.max_cost_per_task_eur`.

## 8. Emergency: Global Pause

`System → Settings (/sys/settings)` → key **`os.global_pause`**. When ON, the company pauses:
no new runs start, nothing outward fires. `os.maintenance_mode` exists separately for
maintenance. Both keys are change-logged and UNDO-able.

## 9. Control Mode — you govern the models and the money

- **Model badge:** every employee card shows its brain (model); director/employee brains are
  switchable from the dashboard (registered ruling 2026-07-12: runtime brains are free choice).
- **Routing keys:** the `orchestrator.*` family in Settings (primary/qa/planning/execution…),
  global or per-department. The /ai/models sandbox simulates routing without writing anything.
- **Approval thresholds:** `orchestrator.human_approval_threshold` and
  `approvals.money_out_gate` shape the company's autonomy level — change deliberately.
- Every settings change: recorded + attributed + UNDO. Writing the same value is a no-op.

## 10. Eye-test and the design-bank loop

Screens accumulate as baselines under `references/design-bank/`; every visual wave lands with
a Design Verification Pass (RULE #0), but **your eye is the final gate**. Expected of you:
review the pending-baseline list and SAY IT when you see a defect (finding defects is not your
job; reporting one creates a governance record). The E13.2 session: 10 screens + visual items,
credentials handed to you IN ADVANCE.

## 11. Voice line — honest state

`Command → Voice (/voice)`: push-to-talk to a director, spoken answer returns (€0 line).
**An open defect ledger exists (U15):** measured STT delays and wrong-language decoding;
remediation plan = `00-NOTE-R32-VOICE-REMEDIATION-PLAN`, requires a joint test session with
you. Until it closes, the voice line is "working but rough".

## 12. When something goes wrong

1. A screen crashed: the "Try again" panel appears (boundary layer); unknown addresses get a
   proper 404.
2. The company misbehaves: §8 Global Pause → then read Alerts + the audit trail (/gov/audit).
3. Money doubt: /fin/costs per-run breakdown; hard-stop already self-fires at 100%.
4. Every decision, settings change, and approval you make is in the audit trail — nothing is lost.
