# COST_CONTROL_SPEC — MALİYET VE TOKEN ZEKÂSI

> Dalga 2 · Yazar: Fable 5 bizzat · Üst: [[SYSTEM_ARCHITECTURE]] · Kardeşler: [[OBSERVABILITY_SPEC]] (10.5 akış kaynağı), [[MODEL_ROUTING_SPEC]] (bütçe-stop kesişimi), [[SETTINGS_AND_CONTROL_SPEC]] (bütçe anahtarları)
> Direktif kaynağı: §20 (Cost & Token Intelligence) + madde 10.5 (cost logs) + proje kısıtı: **€50-150/ay OS işletme bütçesi; Cost Monitor: %70 alert, %100'de non-critical hard-stop** (mevcut Phase-4 mekanizması KALIR ve genelleşir).

## 1. Amaç

Her token ve her cent'in NEREDEN geldiğinin (hangi ajan, model, departman, proje, workflow, task, tool) kırılımlı, tahminli ve anomali-uyarılı görünürlüğü + bütçe aşımında OTOMATİK frenleme. "Toplam maliyet kartı" değil (§20): 11 boyutlu drill-down + 10 görselleştirme. Token disiplini kuralı geçerli: kalite riske girecekse maliyet kesilmez — fren non-critical işlere uygulanır.

## 2. Gereksinimler

- R1. §20'nin 11 kırılım boyutu: holding · company · department · project · workflow · employee · model · provider · task · tool · date range — hepsi kombinlenebilir (örn. departman×model×hafta).
- R2. §20'nin 10 görselleştirmesi: cost trend · token trend · cost anomaly · project burn rate · employee cost efficiency · model efficiency · cache usage · spawn cost · forecast · budget risk. Her chart tıklanabilir + hover detay + drill-down (§20 hükmü; DESIGN_SYSTEM chart kuralları).
- R3. Madde 10.5 alanları ledger'da: cache kullanımı, context tüketimi, spawn maliyeti dahil.
- R4. Bütçe zinciri: holding → company → department → project/employee scope'lu limitler; %70 Attention alert, %90 High, %100 non-critical hard-stop (kritik işler + para-çıkışı onay akışı ASLA otomatik durdurulmaz — CEO kararı).
- R5. LiteLLM virtual key bütçeleriyle çift katman: DB bütçesi (politika/görünürlük) + proxy bütçesi (fiziksel kesici). İkisi settings'ten TEK anahtar setiyle senkron yönetilir.
- R6. Forecast dürüst: model basit ve açıklanır (30g EMA + ay-sonu projeksiyon); "AI tahmini" süsü yasak — yöntem chart tooltip'inde yazar.

## 3. Mimari

```
agent_runs kapanışı (OBSERVABILITY trigger) → cost_ledger satırı
  (tokens_in/out, cache_read/write, model, employee, dept, proje,
   workflow, task, tool özeti, spawn_parent)
pg-boss 'cost-rollup' (5dk) → cost_rollups (gün×boyut aggregate)
pg-boss 'cost-guard' (5dk) → bütçe karşılaştırma
  ├─ %70 → alerts Attention   ├─ %90 → alerts High
  └─ %100 → hard-stop: settings 'cost.stop_noncritical'=true (system yazıcı)
       → kernel yeni non-critical task almaz; koşanlar tamamlanır
       → Critical alert + CEO'ya aksiyon seçenekleri
'cost-anomaly' (saatlik): son 24h, 30g aynı-saat ortalamasının >3σ → alert
```

⛔ mimari-kritik: hard-stop kernel KAPISINDA uygulanır (yeni iş almama), koşan işi ÖLDÜRMEZ (yarım iş = israf + veri riski). Kritik sınıf: approval işleme, outbox, health probe, backup.

## 4. Veri modeli

Mevcut `cost_ledger` KALIR + GENİŞLER (0022x ailesiyle birlikte — kaynak trigger orada):

```sql
ALTER TABLE cost_ledger ADD COLUMN IF NOT EXISTS
  company_id uuid, department_id uuid, project_id uuid,
  workflow_run_id uuid, employee_id uuid, agent_run_id uuid,
  model_id text, provider text, task_id uuid,
  tokens_in bigint, tokens_out bigint,
  cache_read bigint, cache_write bigint,     -- 10.5 cache kullanımı
  context_tokens bigint,                     -- 10.5 context tüketimi
  spawn_parent uuid,                         -- 10.5 spawn maliyeti (alt-ajan zinciri toplamı view'da)
  tool_summary jsonb;                        -- R1 tool boyutu
budgets (
  id uuid PK, scope_type text,               -- holding|company|department|project|employee
  scope_id uuid null,                        -- null = holding
  period text,                               -- daily|weekly|monthly
  limit_eur numeric, token_limit bigint null,
  critical_exempt boolean default true,      -- R4 kritik muafiyeti
  litellm_key_alias text null,               -- R5 proxy eşleşmesi
  enabled boolean, updated_by, updated_at,
  UNIQUE(scope_type, scope_id, period)
)
cost_rollups (
  day date, scope_type text, scope_id uuid, model_id text,
  cost numeric, tokens_in bigint, tokens_out bigint,
  cache_read bigint, runs int,
  PRIMARY KEY(day, scope_type, scope_id, model_id)
)
```

## 5. Component yapısı

| Bileşen | Sayfa | İçerik |
|---------|-------|--------|
| `CostIntelligencePanel` | `/fin/costs` | R2 görselleştirmeleri; boyut seçici (R1 kombinasyonu); cost waterfall |
| `TokenIntelligencePanel` | `/fin/tokens` | token trend + cache oranı + context tüketimi + spawn ağacı maliyeti |
| `BudgetBoard` | `/fin/budgets` | scope ağacı + kullanım barları (%70/90/100 renk eşikleri) + hard-stop durumu |
| `ProviderBoard` | `/fin/providers` | provider sağlık+harcama (model_catalog+ledger join) |
| `CapacityBoard` | `/fin/capacity` | VPS kaynakları (health snapshots: RAM/CPU/disk) + kuyruk derinliği — "kapasite" = para+donanım birlikte |
| Overview mini-chart | `/overview` | bugünkü maliyet+token (v_cost_summary, CC-SPEC widget) |

## 6. Backend yapısı

- Rollup/guard/anomaly pg-boss job'ları `packages/kernel` worker'ında (yeni servis yok).
- `fn_set_budget` (control seam): budgets upsert + LiteLLM proxy API'sine key bütçe senkronu (`/key/update`) — tek transaction değil (dış sistem): önce DB, sonra proxy; proxy hatası alert + retry job (eventual consistency, fark BudgetBoard'da "senkron bekliyor" rozeti).
- Hard-stop bayrağı: `settings_values('cost.stop_noncritical', scope)` — kernel task kabulünde resolve eder (SETTINGS cache 30sn).

## 7. Frontend yapısı

RSC: rollup'lardan sayfa-başı tek sorgu (`v_cost_breakdown(dims, range)` parametrik view/fn); chart'lar client adası (etkileşim). Drill-down: chart segmenti → aynı sayfada boyut daralması → satır seviyesi `cost_ledger` sayfalı tablo → satırdan agent_run drawer'ına (OBSERVABILITY bağı).

## 8. API'ler

Reads: `v_cost_breakdown`, `v_budget_status`, `v_cost_anomalies`, `v_spawn_cost(run_id)` (alt-ajan ağacı toplamı). Mutations: `POST /api/control/budgets {op:'set'|'disable', ...}` (idempotency + change_id; settings_change_log'a düşer — undo'lu). Hard-stop manuel kaldırma: `POST /api/control/budgets {op:'release_stop'}` → CEO kararı audit'li.

## 9. Event yapısı

- Eşik olayları → `alerts` kanalı (Attention/High/Critical).
- Hard-stop set/release → `settings` Broadcast (kernel cache invalidate) + `alerts` Critical.
- Günlük özet: 07:00 briefing'e maliyet bloğu (mevcut briefing_view deseni KALIR — 0018 emsali genişler).

## 10. State yönetimi

Chart aralık/boyut seçimi URL query'de (paylaşılabilir drill-down durumu — CC-SPEC drill-down haritasıyla uyumlu); başka client state yok.

## 11. Database tabloları / 12. İlişkiler

§4 → [[DATA_MODEL]] (ledger genişlemesi 0022x, budgets 0021x kontrol ailesi). İlişkiler: ledger N—1 tüm org/iş varlıkları (nullable FK'lar — eski satırlar kırılmaz); budgets scope polymorphic (SETTINGS §11 deseni); rollups türetilmiş (yeniden hesaplanabilir — kaynak gerçek ledger'dır).

## 13. Yetkilendirme

Bütçe değişikliği yalnız `ceo`; hard-stop bayrağını `system` SET edebilir (guard job), RELEASE yalnız `ceo` (asimetri bilinçli: fren otomatik, gaz insan). Ledger'a yazım yalnız trigger (system).

## 14. Logging / 15. Audit

Bütçe değişiklikleri: audit + settings_change_log (undo). Hard-stop olayları: decision_log (kind='cost_hard_stop', gerekçe=eşik+ölçüm) — CEO "neden durdu?" cevabını her zaman görür. Anomaliler alerts'te kalıcı.

## 16. Security

Maliyet verisi iç veridir; dışa API yok. LiteLLM master key yalnız proxy env'inde; `/key/update` çağrısı kernel'den servis-içi ağda (Docker network). Provider fatura mutabakatı manuel CEO işi (aylık; BudgetBoard "beyan edilen vs ölçülen" satırı).

## 17. Error handling / 18. Retry / 19. Fallback

- Rollup job hatası: sonraki koşuda kaldığı günden devam (idempotent upsert); gecikme BudgetBoard'da "son rollup" zaman damgası.
- Proxy senkron hatası: retry 3× → alert High; DB bütçesi geçerli kalır (politika katmanı frenler, fiziksel kesici gecikebilir).
- Ledger trigger hatası: OBSERVABILITY spill deseni (veri kaybı kabul edilmez).
- Guard yanlış-pozitif hard-stop: release tek tık + decision_log; eşikler settings'ten ayarlanabilir.

## 20. Test planı / 21. Acceptance criteria

- Birim: rollup doğruluğu (bilinen ledger seti → beklenen aggregate); eşik tetikleri (%69→yok, %71→Attention); kritik muafiyet (hard-stop'ta approval işleme sürer); spawn ağacı toplamı.
- Entegrasyon: sahte pahalı koşu → ledger → 5dk içinde rollup → BudgetBoard bar günceller.
- Kabul: 11 boyutun tamamı kırılımda seçilebilir · 10 görselleştirme gerçek veriyle render · her chart tıklanabilir/hover/drill-down (Playwright) · hard-stop zinciri uçtan uca kanıtlı (test bütçesiyle) · forecast yöntemi tooltip'te açık.

## 22. Migration planı / 23. Rollback planı

`0021g_budgets.sql` + `0022e_ledger_extend.sql` + `0022f_rollups.sql` (+job kayıtları). ROLLBACK: yeni kolonlar nullable → DROP COLUMN; rollups türetilmiş → DROP güvenli; budgets DROP → guard job devre dışı (mevcut Phase-4 Cost Monitor davranışı bozulmaz — köprü: eski monitör yeni budgets tablosunu okuyana kadar kendi eşiğiyle sürer).

## 24. Uygulama sırası

1. Migration'lar → `psql -c "\d cost_ledger" | grep cache_read` → kolon var
2. Rollup job → test koşusu → `psql -c "SELECT * FROM cost_rollups ORDER BY day DESC LIMIT 3"` → satırlar
3. Guard + hard-stop → test bütçesi limit 0.01€ → `psql -c "SELECT value FROM settings_values WHERE key='cost.stop_noncritical'"` → true + alert satırı
4. LiteLLM senkron → `curl -s litellm:4000/key/info` → bütçe alanı eşleşir
5. UI panelleri (CC-SPEC ekran 8) → Playwright drill-down akışı

Opus-devralma: job'lar + view'lar + paneller bağımsız teslim; eşik/yöntem sabitleri tabloda. ⛔ kritik: hard-stop kapı-seviyesi ilkesi (iş öldürmeme), kritik-muafiyet listesi, fren/gaz asimetrisi — en güçlü model + CEO onayı.

## 25. Bağımlılıklar

Mevcut cost_ledger + Cost Monitor (KALIR) · [[OBSERVABILITY_SPEC]] trigger/snapshots · [[SETTINGS_AND_CONTROL_SPEC]] anahtarlar+undo · [[MODEL_ROUTING_SPEC]] katalog maliyet verisi · LiteLLM proxy API · pg-boss.

## 26. Riskler / 27. Edge case'ler

- **Rollup ile gerçek arasında fark** (5dk pencere): BudgetBoard canlı sorguya "exact" toggle'ı (pahalı sorgu, isteğe bağlı).
- **Çifte sayım** (spawn zinciri): ledger satırı koşu-başı; ağaç toplamı VIEW'da (spawn_parent yürüyüşü) — aggregate'e çocuklar bir kez girer (rollup yalnız satır bazlı).
- **Kur/fiyat değişimi**: model fiyatları model_catalog'dan; fiyat güncellemesi geçmişi YENİDEN FİYATLAMAZ (ledger yazım anındaki maliyeti taşır — muhasebe doğruluğu).
- **€150 tavana yaklaşan ay sonu**: forecast budget risk chart'ı + %90 High alert CEO'ya erken görünür; hard-stop ayın son günü sürpriz olmaz.
- **Bütçesiz scope** (yeni departman): holding bütçesi şemsiyedir — scope bütçesi yoksa üst scope sayacına akar (kaçak yok).

## Registered adaptations — E11.1 (2026-07-14, Fable K1; CEO-visible)

| # | Adaptation | Why |
|---|------------|-----|
| A1 | E11.1 delivers the roadmap row only: `v_cost_breakdown` (shipped 0025x, `20260711002500`) + `/fin/costs` day/dept/model breakdowns on real ledger data + `cost`-channel threshold alarms. §3 pg-boss jobs (rollup/guard/anomaly), `budgets`/`cost_rollups` tables, LiteLLM `/key/update` sync, the full R2 10-chart set and R6 forecast stay on the recorded P7 boundary (E8.4b boundary records stand). | Roadmap row scope; no silent scope inflation |
| A2 | Threshold alarms run TRIGGER-based on `cost_ledger` insert (`fn_alert_on_cost_threshold`, 70/90/100, per-month dedup — shipped at E8.4b), not as the §3 5-min `cost-guard` job. The pg-boss guard adopts these constants at P7; behavior (levels/channel/dedup) already matches §3. | Existing Phase-4 Cost-Monitor lineage generalized early; zero alert latency |
| A3 | The day grain reads `v_cost_breakdown` LIVE (no `cost_rollups` materialization yet). The §26 "rollup vs reality 5-min window" risk therefore does not exist in this stage. | Rollups are derived tables — premature before P7 job infra |
| A4 | Daily panel window/rows = 30 days / 15 rows, mirroring the `/fin/pnl` daily precedent (E6.5); day boundary Europe/Berlin per the P&L D5 decision, identical to the view. | Established idiom, no new design decision |

## Done definition (bu spec)

27 başlık ✓ · §20 11 boyut + 10 görselleştirme eşlenmiş ✓ · madde 10.5 alanları şemada ✓ · %70/100 Cost-Monitor kuralı mekanizmalı + kritik muafiyet ✓ · LiteLLM çift-katman senkronu ✓ · mevcut-varlık (ledger/monitor KALIR) ✓ · doğrulama komutları ✓ · Opus-devralma + ⛔ ✓
