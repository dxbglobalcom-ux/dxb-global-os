# APPROVAL_ENGINE_SPEC — ONAY MOTORU VE APPROVAL CENTER

> Dalga 2 · Yazar: Fable 5 bizzat · Üst: [[SYSTEM_ARCHITECTURE]] · Kardeşler: [[SETTINGS_AND_CONTROL_SPEC]] (politika anahtarları), [[COST_CONTROL_SPEC]] (maliyet etkisi), [[OBSERVABILITY_SPEC]] (decision_log bağı)
> Direktif kaynağı: §21 (Approval Center) + madde 11 (approval sistemi) + **B7b: para-ÇIKIŞI onay kapısı + outbox KALIR — pazarlıksız** + madde 4 (yeni onay bürokrasisi AÇILMAZ).

## 1. Amaç

Anti-baby-sitting dengesinin kalbi: dışa dönük/riskli işlemler CEO onayından geçer, geri kalan HER ŞEY otonom akar. "2-3 approval gösteren sağ panel" değil (madde 11): ana dashboard'da özet + `/approvals`ta tam Approval Center. Onay yorgunluğu (gate fatigue) sistemin kendisinin izlediği bir metriktir — kapı enflasyonu da kapı eksikliği kadar ihlaldir.

## 2. Gereksinimler

- R1. B7b DOKUNULMAZ: `risk_class='money_out'` işlemi insan onayı olmadan outbox'a düşemez; bu kural settings'ten kapatılamaz (SETTINGS R6 locked kümesi).
- R2. Madde 4 dengesi: YENİ zorunlu onay sınıfı eklenmez; mevcut dış-dünya kapıları (para-çıkışı, sözleşme, kimlik) kalır; para GİRİŞİ ve rutin dış iletişim onaysız (ceo-delegation-rule).
- R3. §21 kart alanları birebir: talep sahibi · departman · işlem · risk · maliyet · deadline · kullanılacak model · etkilenecek sistem · recommended action · reasoning summary. Detayda: full context · alternatives · decision history · related files/tasks · previous reviews · cost impact · risk impact.
- R4. Madde 11 CEO aksiyonlarının 7'si de: approve · reject · **approve with modifications** · delegate (başka çalışana devret / assign reviewer) · request more info (revision) · **re-analyze with stronger model** · **change policy permanently**.
- R5. Payload CEO gözünde HAM JSON OLAMAZ (mevcut okunur-payload çalışması KALIR ve genelleşir; ham JSON yalnız audit disclosure arkasında).
- R6. Fatigue guard: bekleyen onay sayısı + günlük onay oranı izlenir; eşik aşımında sistem politika önerisi üretir ("bu sınıf hep onaylanıyor → otonom yapılsın mı?") — karar CEO'nun.
- R7. Karar bağı: her approval kararı decision_log'a; onaylanan işlem outbox/task'e kararla bağlı gider.

## 3. Mimari

```
ajan işlemi → risk sınıflandırıcı (kernel içi, kural tablolu)
  ├─ sınıf: autonomous  → doğrudan yürütme (log yeter)
  ├─ sınıf: notify      → yürüt + CEO'ya bilgi (alert informational)
  └─ sınıf: gated       → approvals INSERT (pending)
        └─ Broadcast 'approvals' → sağ ray + Approval Center
        CEO aksiyonu → fn_decide_approval → durum + decision_log + audit
          approve(±modifications) → hedef kuyruk/outbox'a salınır
          money_out ise → outbox satırı YALNIZ bu yoldan doğar (B7b)
```

⛔ mimari-kritik: sınıflandırma KERNEL'dedir (tek nokta); ajanlar kendi işlemini "autonomous" İLAN EDEMEZ — sınıf, işlem tipinden kural tablosuyla türetilir.

## 4. Veri modeli

Mevcut `approvals` tablosu KALIR + GENİŞLER (0023x, breaking change yasak — nullable kolon ekleme):

```sql
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS
  requester_employee_id uuid,        -- §21 talep sahibi
  department_id uuid, project_id uuid,
  operation text, purpose text,      -- işlem + amacı (madde 11)
  risk_class text,                   -- money_out|contract|identity|high_cost|other (mevcut sınıflarla uyum)
  cost_estimate numeric, deadline timestamptz,
  model_to_use text, affected_systems text[], affected_files text[],
  recommended_action text, reasoning_summary text,
  alternatives jsonb, previous_reviews jsonb,
  decided_at timestamptz, decided_action text,   -- R4 7 aksiyon
  modifications jsonb,               -- approve-with-modifications farkı
  delegated_to uuid, reanalysis_run_id uuid,     -- re-analyze bağı
  policy_change_id uuid;             -- change-policy aksiyonunun settings bağı
approval_rules (                      -- sınıflandırma kural tablosu
  id uuid PK, operation_pattern text, -- örn. 'outbox.payment.*'
  risk_class text, gate text,        -- autonomous|notify|gated
  locked boolean default false,      -- money_out satırları true (B7b)
  enabled boolean, priority int, updated_by, updated_at
)
```

Fatigue metrikleri tablo İSTEMEZ: `v_approval_fatigue` view (7g bekleyen ortalaması, onay oranı sınıf-başı, ortalama karar süresi).

## 5. Component yapısı

| Bileşen | İçerik |
|---------|--------|
| `ApprovalCard` | R3 alan seti; okunur payload (etiketli satırlar, i18n alan sözlüğü — mevcut bileşen KALIR); money_out: gold çift kenar + kilit (DESIGN_SYSTEM §16) |
| `ApprovalDetail` (`/approvals/[id]`) | R3 detay seti + karar geçmişi + ilgili dosya/task linkleri (drill-down) |
| `ApprovalActions` | 7 aksiyon; approve-with-modifications = payload editörü + fark özeti; re-analyze = model seçici (katalogdan, banned hariç) |
| `ApprovalCenter` (`/approvals`) | filtre (sınıf/departman/yaş), toplu seçim (yalnız autonomous-aday sınıflar; money_out TOPLU ONAYLANAMAZ), fatigue banner |
| `IntelligenceRail` özeti | pending sayı + en yaşlı + money_out rozeti (CC-SPEC sağ ray) |

## 6. Backend yapısı

- `fn_classify_operation(operation, payload)` — kural taraması, öncelik sıralı; eşleşme yoksa DEFAULT `gated` (bilinmeyen işlem otonom akamaz — güvenli taraf).
- `fn_decide_approval(approval_id, action, payload)` — tek transaction: durum + decision_log + audit + (approve ise) hedefe salım; money_out salımı outbox INSERT'i BU FN İÇİNDE (başka yazım yolu yok, DB grant'leriyle garanti).
- Re-analyze: `fn_decide_approval(..., 'reanalyze', {model_id})` → yeni task (analiz) kuyruğa → sonuç approval'a `previous_reviews` olarak eklenir → approval pending'e döner.
- Policy change: aksiyon `approval_rules` güncellemesi üretir (locked satır reddi) + settings_change_log ile undo'lu.

## 7. Frontend yapısı

`/approvals` RSC (pending + son kararlar tek sorgu `v_approvals_center`); karar aksiyonları client adası. Ana dashboard özeti Broadcast'ten canlı. Mobil monitoring görünümünde approvals birincil modüldür (§29: mobilde executive summary + alerts + approvals).

## 8. API'ler

Reads: `v_approvals_center`, `v_approval_fatigue`. Mutations: `POST /api/control/approvals {op:'decide', approval_id, action, payload, idempotency_key}` → fn. İdempotency kritik: aynı karar iki kez POST edilirse ikincisi `{ok:true, already:true}` döner (çift salım imkânsız).

## 9. Event yapısı

`approvals` Broadcast (mevcut 0013 trigger KALIR): insert/decide olayları `{approval_id, risk_class, state}`. Deadline yaklaşan pending (kalan <%25 süre) → `alerts` Attention; money_out pending >24h → High (para akışı bekletilmemeli — ama otomatik onay ASLA).

## 10. State yönetimi

Karar formu draft'ı client'ta; optimistic update YOK (karar sonucu Broadcast dönüşüyle boyanır — yanlış "onaylandı" görüntüsü felaket sınıfı hata). Toplu seçim client state; submit tek tek fn çağrısı (transaction bütünlüğü approval-başı).

## 11. Database tabloları / 12. İlişkiler

§4 → [[DATA_MODEL]] 0023x. İlişkiler: approvals ⋈ employees (requester/delegated) ⋈ org_units ⋈ projects ⋈ agent_runs (reanalysis) ⋈ outbox (salım FK'sı `outbox.approval_id` — mevcutsa KALIR); approval_rules bağımsız. decision_log.approval_id çapraz bağ (OBSERVABILITY §4).

## 13. Yetkilendirme

Karar: yalnız `ceo` (delegate aksiyonu bile CEO kararıdır — devredilen çalışan ANALİZ yapar, nihai salım yine fn'de CEO kaydıyla). `system`: yalnız INSERT (pending) + reanalysis sonucu ekleme. Outbox INSERT grant'i YALNIZ `fn_decide_approval`a (SECURITY DEFINER) — B7b'nin DB-seviyesi kanıtı.

## 14. Logging / 15. Audit

Her karar: audit_log (kim/ne/ne zaman) + decision_log (gerekçe: CEO aksiyonu + varsa not) + approvals satırının kendisi (kalıcı kayıt). Policy değişiklikleri settings_change_log'da undo'lu. Fatigue önerileri de decision_log'a yazılır (sistem önerdi, CEO ne yaptı — kurumsal öğrenme).

## 16. Security

B7b üç katmanda: (1) kural tablosu locked, (2) fn-only outbox yazımı, (3) UI kilit göstergesi. Sınıflandırıcı bilinmeyeni gated'e atar (fail-closed). Madde 4: bu spec YENİ kapı eklemez — mevcut sınıfların şemalaştırılmasıdır.

## 17. Error handling / 18. Retry / 19. Fallback

- fn hatası: transaction rollback — approval pending kalır, UI neden gösterir; retry idempotent.
- Salım sonrası hedef hata (outbox işleme hatası): approval decided kalır, outbox kendi retry'ı (outbox-executor deseni KALIR); approval'a işlem sonucu geri yazılmaz (ayrı kaygılar).
- Reanalysis task hatası: approval pending'e döner + hata notu; CEO eski bilgiyle karar verebilir.

## 20. Test planı / 21. Acceptance criteria

- Birim (SQL): sınıflandırma önceliği; bilinmeyen→gated; locked kural değişikliği reddi; çift karar idempotency; money_out outbox'ının fn-dışı INSERT denemesinin grant reddi (kanıt sorgusu).
- Playwright: pending kart → detay → approve-with-modifications → fark özeti → decided; re-analyze akışı; toplu onayda money_out seçilemezliği.
- Kabul: §21 kart+detay alanları eksiksiz · 7 aksiyon çalışır · ham JSON CEO gözünde yok (payload testi mevcut) · fatigue view gerçek veri · B7b DB-seviyesi kanıtlı.

## 22. Migration planı / 23. Rollback planı

0023x: `0023a_approvals_extend.sql` (ALTER + approval_rules + seed kurallar: mevcut money_out/contract/identity sınıfları) · `0023b_approval_fns.sql` · `0023c_approval_views.sql`. ROLLBACK: yeni kolonlar nullable — DROP COLUMN blokları; fn/view DROP; mevcut approvals akışı eski haliyle çalışmaya devam eder (köprü dönemi: eski onay UI'ı yeni kolonları görmezden gelir).

## 24. Uygulama sırası

1. 0023a-c → `psql -c "SELECT count(*) FROM approval_rules WHERE locked"` → ≥1 (money_out)
2. Sınıflandırıcı kernel bağı → test işlemi → `psql -c "SELECT gate FROM ..."` → bilinmeyen op 'gated'
3. fn_decide + grant kanıtı → `psql -c "INSERT INTO outbox ..." ` (doğrudan) → permission denied
4. ApprovalCenter UI + 7 aksiyon → Playwright akışları
5. Fatigue view + banner → `psql -c "SELECT * FROM v_approval_fatigue"` → satır döner

Opus-devralma: fn sözleşmeleri + kural seed'i sabit; UI aksiyon-başı teslim. ⛔ kritik: locked kural kümesi, fail-closed default, fn-only outbox — en güçlü model + CEO onayı; B7b hiçbir koşulda esnetilemez.

## 25. Bağımlılıklar

Mevcut approvals+outbox+0013 trigger (KALIR) · [[SETTINGS_AND_CONTROL_SPEC]] (policy undo) · [[MODEL_ROUTING_SPEC]] (reanalyze model seçimi) · [[OBSERVABILITY_SPEC]] (decision_log/alerts) · [[DATA_MODEL]] 0023x.

## 26. Riskler / 27. Edge case'ler

- **Kapı enflasyonu** (her şey gated'e kayar): fatigue view + autonomous-aday önerileri; kural değişikliği tek tıkla CEO'da.
- **Kapı erozyonu** (her şey autonomous'a kayar): locked küme + bilinmeyen→gated; kural değişiklikleri audit'te görünür.
- **Bayat approval** (bağlam değişti): detayda "context yaşı" göstergesi; 7g+ pending otomatik "stale" işareti + re-analyze önerisi.
- **Deadline geçen pending**: işlem iptal EDİLMEZ (karar CEO'nun); expired işareti + alert; talep sahibi ajana "beklemede" durumu (OBSERVABILITY awaiting_approval).
- **Delegasyon zinciri**: tek seviye — devredilen tekrar devredemez (analiz döner, karar CEO'da kalır).

## Registered adaptations — E9.3 execution (2026-07-14, Fable K1; CEO-visible)

Recorded at implementation time per the master-plan fidelity rule (adaptation ≠ deviation; every item below implements this spec's intent against the live system's actual shape). Ticket: `.planning/quick/20260713-e93-approval-center/PLAN.md`.

- **A1 — operation_class carries the §4 classification domain.** Spec §4 lists `risk_class` as money_out|contract|identity|high_cost|other, but the live `approvals.risk_class` column already holds severity values (low/medium/high/critical) consumed by inbox grouping and v_alerts_active. New nullable `operation_class` column carries the classification; `risk_class` stays severity. B7b keys on `operation_class='money_out'` OR the legacy `action_type` prefix (`fn_is_money_out`).
- **A2 — money_out outbox INSERT realized through the 0003 enqueue trigger** firing INSIDE `control_approvals_action`'s transaction (single-transaction guarantee holds; a duplicated direct INSERT would violate outbox UNIQUE). Grant proof unchanged: authenticated/anon hold no outbox write path (`has_table_privilege` all false).
- **A3 — fn name follows the control-seam idiom:** `control_approvals_action(p_payload, p_idempotency_key)` (alerts/workflows twin) implements this spec's fn_decide_approval contract. `decide_approvals` (0015) stays untouched beside it; the legacy inbox path remains green.
- **A4 — §9 deadline/money_out sweeps land as additive checks inside `fn_alerts_evaluate`** (E8.4b's single sweep door) instead of a new sweep fn — existing checks byte-identical.
- **A5 — reanalyze/delegate produce analysis TASKS** (tasks table, holding department); the resident worker that executes them is Phase-7 scope. Tests drive the system-append path directly.
- **A6 — approve_with_modifications semantics:** effective payload = `payload || modifications` written back to `payload` (executor reads one field); the `modifications` column keeps the delta; audit carries the original payload_hash.
- **A7 — migration shipped as ONE file** `20260713110000_approval_center.sql` (0023a-c folded, repo idiom of one migration per roadmap row); TRUNCATE grant revoke on approvals/outbox included (broken grant found during recon = fixed immediately; B7b infrastructure is the explicit exception to the security-hardening deferral).
- **A8 — probation-wave hook escalations are orchestrator-managed (CEO standing order 2026-07-18, in-session).** Precedent: the E12.5 activation wave parked 113 `hook_escalation` approvals in the CEO queue; by wave end 113/113 were success-superseded (85 original task `done` via ladder, 28 employee passed via correction round) — zero needed a real CEO decision; the CEO batch-approved in person (audit `approval.approve` ×113) and ruled the class delegated. Mechanism: `fn_approvals_supersede_sweep()` (migration `20260718214000`) closes pending `hook_escalation` approvals ONLY when success is proven in data (task `done`, or its agent holds a `done` HR-probation sample); `decided_by='orchestrator:success-supersede'`, audit row per closure; wave-monitor invokes it at wave close. Everything unproven stays pending for the CEO; money_out/contract/identity classes untouched (§13 CEO-only law intact).

## Done definition (bu spec)

27 başlık ✓ · §21 + madde 11 alan/aksiyon eşlemesi eksiksiz ✓ · B7b üç-katman mekanizması + DB-kanıt komutu ✓ · madde 4 dengesi (yeni kapı yok, fail-closed) ✓ · mevcut-varlık eşlemesi (approvals/outbox/trigger KALIR) ✓ · doğrulama komutları ✓ · Opus-devralma + ⛔ ✓
