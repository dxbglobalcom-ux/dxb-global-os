# EVENT_MODEL — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 4 · Yazar: Fable 5 bizzat · Üst: [[SYSTEM_ARCHITECTURE]] §9 · Kardeşler: [[API_CONTRACTS]] (senkron yüzey), [[DATA_MODEL]] (kaynak tablolar), [[OBSERVABILITY_SPEC]] (tüketici)
> Bu dosya olay omurgasının TEK sözlüğüdür: kanal kataloğu + zarf şeması + adlandırma burada normatiftir (ORGANIZATION_ENGINE §9'un devrettiği katalog budur).

## 1. Amaç

Sistemdeki "ne oldu" bilgisinin iki katmanlı modeli: (1) **kaynak gerçek** — append-only DB akışları (kalıcı, sorgulanabilir, drill-down zemini), (2) **canlı yayın** — Supabase Realtime Broadcast (geçici, UI tazeliği). İkisinin ayrımı bağlayıcıdır: Broadcast kaçarsa veri kaybolmaz, yalnız gecikir.

## 2. Gereksinimler

- G1. postgres_changes YASAK — yalnız Broadcast (STACK.md sert kuralı; 0013 trigger emsali).
- G2. Her canlı olay bir kaynak-gerçek satırından türetilir; satırsız olay yayınlanamaz (sahte canlılık yasağı).
- G3. Olay zarfı korelasyon taşır: task→run→workflow_run→project zinciri UI'da kopmaz.
- G4. Dışa dönük hiçbir aksiyon olay yayınıyla tetiklenemez — dış dünyaya tek kapı `outbox` (KALIR, DOKUNULMAZ).

## 3. Mimari

```
yazan taraf (fn/worker) → tablo INSERT (append-only)
                           └─ trigger → realtime.send(channel, event)   [0013 emsali]
UI → kanal aboneliği (tek subscription/kanal) → context fan-out → komponentler
   → kopma/ilk açılış → snapshot re-fetch (v_* view) → aboneliğe devam
```

## 4. Veri modeli (kaynak-gerçek envanteri)

| Akış | Tablo | Etiket |
|------|-------|--------|
| Görev olayları | `task_events` | KALIR |
| Ajan koşuları | `agent_runs` (durum geçişleri) | YENİ (0022x) |
| Kararlar | `decision_log` | YENİ (0022x) |
| Araç çağrıları | `tool_calls` | YENİ (0022x) |
| Dosya değişimleri | `file_changes` | YENİ (0022x) |
| Ayar değişimleri | `settings_change_log` | YENİ (0021x) |
| Workflow koşuları | `workflow_runs` (durum geçişleri) | YENİ (0023x) |
| Onay/maliyet | `approvals`, `cost_ledger` | KALIR |

## 5. Component yapısı / 6. Backend yapısı

Trigger'lar migration-içi tanımlanır (aile migration'ının parçası); yayın fonksiyonu tek yardımcıdan geçer: `notify_broadcast(channel, type, payload)` (SQL fn, 0025x'te; debounce gereken kanallar için NOTIFY-toplayıcı worker — aşağıda §26). UI tarafı: `apps/dashboard/src/lib/realtime.ts` tek abonelik yöneticisi (kanal-başı bir socket aboneliği, komponent fan-out client'ta).

## 7. Frontend yapısı

Komponentler kanala DEĞİL context'e abone olur; context olayları `entity.kind:id` anahtarıyla dağıtır. Optimistic update mutabakatı: `payload.change_id` ([[API_CONTRACTS]] §9).

## 8. API'ler

Olay yayını API değildir; API senkron sonucu döndürür, olay aynı gerçeğin yayınıdır. İkisi arasında sözleşme: aynı `change_id`.

## 9. Event yapısı (bağlayıcı zarf + katalog)

### 9a. Zarf

```json
{
  "event_id": "uuid",
  "ts": "timestamptz",
  "type": "entity.verb_past",
  "actor": "ceo | system | employee:<id>",
  "entity": { "kind": "task|run|workflow_run|employee|setting|approval|alert|project|library_item", "id": "..." },
  "corr": { "task_id": null, "run_id": null, "workflow_run_id": null, "project_id": null },
  "payload": { "...": "olay-özel; change_id mutasyon kaynaklıysa zorunlu" }
}
```

### 9b. Kanal kataloğu (normatif — yeni kanal eklemek bu tabloya satır eklemektir)

| Kanal | İçerik | Başlıca type'lar | Debounce |
|-------|--------|------------------|----------|
| `ops:live` | ajan/koşu canlılığı | `run.started`, `run.progressed`, `run.waiting_approval`, `run.succeeded`, `run.failed`, `task.event_appended` | 1 sn toplu |
| `approvals` | onay kuyruğu (KALIR) | `approval.created`, `approval.decided` | yok |
| `alerts` | kritik uyarılar | `alert.raised`, `alert.acknowledged`, `alert.muted` | yok |
| `settings` | ayar değişimi + library kayıt/grant değişimi | `setting.changed`, `setting.undone`, `library_item.changed`, `library_grant.changed` | yok |
| `org` | org yapısı ([[ORGANIZATION_ENGINE_SPEC]] olay listesi birebir) | `company.created`, `department.created`, `director.assigned`, `employee.moved`, `employee.suspended`, `employee.reactivated`, `employee.archived`, `model_group.assigned` | yok |
| `projects` | proje/milestone durumu | `project.created`, `project.status_changed`, `milestone.reached`, `dependency.blocked` | yok |
| `cost` | bütçe/harcama eşikleri | `budget.threshold_crossed`, `budget.hard_stopped`, `cost.spike_detected` | 5 sn toplu |
| `system` | sağlık/altyapı | `service.unhealthy`, `queue.depth_exceeded`, `backup.completed`, `backup.failed` | yok |

Adlandırma kuralı: `entity.verb_past`, İngilizce, snake_case; kanal adı kısa tekil alan. Type eklemek serbest (append), type ANLAMI değiştirmek breaking → ⛔ protokol.

## 10. State yönetimi

Broadcast **at-most-once, geçici**dir; abonelik durumu client'ta, gerçek DB'de. Reconnect stratejisi: `realtime.ts` kopmayı algılar → ilgili sayfa view'ını re-fetch → aboneliği yeniler (kaçan olaylar snapshot'ta zaten görünür).

## 11. Database tabloları / 12. İlişkiler

Yeni tablo YOK (kaynaklar §4 envanteri). İlişki kuralı: `corr` alanları FK gerçeğinden doldurulur (trigger satırdan okur), UI tahmini yasak.

## 13. Yetkilendirme

Kanallara yalnız `authenticated` CEO oturumu abone olabilir (Realtime authorization: private channel + RLS-bağlı topic yetkisi, mevcut `approvals` kanal deseninin kopyası). Ajanların Broadcast aboneliği YOK — ajanlar kuyruk/DB'den okur (tek yön: sistem → CEO ekranı).

## 14. Logging / 15. Audit

Yayın hatası (realtime.send fail) kaynak yazımını GERİ ALMAZ — trigger hata yutmaz ama yazımı bloklamaz (`EXCEPTION WHEN OTHERS THEN` log+devam deseni); düşen yayın `system` kanal metriğine sayılır. Olayların kendisi audit değildir; audit zinciri [[AUDIT_AND_LOGGING_SPEC]].

## 16. Security

Zarf `payload`ında gizli değer taşınamaz: prompt içeriği, credential, tam diff YASAK (özet+referans). Madde 4 sınırı: yeni kimlik katmanı yok; kanal yetkisi mevcut Auth oturumuna bağlı.

## 17. Error handling / 18. Retry / 19. Fallback

- Yayın kaybı: tolere edilir (tasarım gereği) — telafi snapshot re-fetch.
- Trigger hatası: log+devam (yazım kutsal, yayın opsiyonel).
- Fırtına: debounce kolonu §9b; toplu yayında `payload.batch=[...]` (aynı zarf, çoklu olay).
- Fallback: Realtime servis çökerse UI 30 sn'de bir poll'a düşer (`v_live_ops` — geçici mod, System Health alarmı zaten çalar).

## 20. Test planı / 21. Acceptance criteria

- Trigger kanıtı: test client (vitest + supabase-js) kanala abone → `psql INSERT` → 5 sn içinde zarf-uyumlu olay.
- Zarf şema testi: her type için Zod zarf doğrulaması (packages/shared/src/contracts/events.ts — tek kaynak).
- Kabul: §9b'deki her kanal canlı; `ops:live` 1 sn debounce ölçülür (ardışık 10 INSERT → ≤2 yayın); kopma-sonrası reconnect'te UI 10 sn içinde tutarlı.

## 22. Migration planı / 23. Rollback planı

Trigger'lar ait oldukları aile migration'larında (0021x-0023x) + `notify_broadcast` fn 0025x. Rollback: trigger DROP yayını durdurur, veri akışı bozulmaz (UI poll fallback'i devreye girer) — güvenli tek yönlü geri çekilme.

## 24. Uygulama sırası (doğrulamalı)

```bash
supabase db push
psql "$DB" -c "SELECT tgname FROM pg_trigger WHERE tgname LIKE 'trg_broadcast_%';"   # → aile-başı trigger listesi
node scripts/dev/event-probe.mjs ops:live &                                          # abone ol (script: 06. adımda yazılır)
psql "$DB" -c "INSERT INTO task_events(task_id,kind,detail) SELECT id,'probe','{}' FROM tasks LIMIT 1;"
# probe çıktısı → {"type":"task.event_appended", ...}  (1 sn debounce penceresi içinde)
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: Supabase Realtime (self-hosted compose'da mevcut), 0013 trigger emsali, 0021x-0023x aileleri.
- Risk: debounce worker'ı ayrı resident servis isterse RAM bütçesi zorlanır → karar: debounce DB-içi (`pg_notify` toplayıcı, kernel worker'ın mevcut döngüsünde) — yeni servis AÇILMAZ (R5).
- Edge: aynı entity'ye saniye-altı çift olay → `event_id` uuid ayrıştırır, UI son-yazan-kazanır; abonelik yetki reddi (oturum süresi dolmuş) → login yenileme akışı; TV modu (salt-okunur uzun oturum) → abonelik 24 saatte bir zorunlu tazelenir.

## Opus-devralma notu

Kanal kataloğu + zarf + adlandırma kapalı sözlüktür; Opus yeni olay eklerken §9b'ye satır ekler, zarfı değiştirmez. ⛔ kritik karar: zarf alan silme/anlam değişikliği + yeni kanal sınıfı (dışa yayın gibi) — eldeki en güçlü model + CEO onayı.

## Registered adaptations — B43 the media studio (2026-09-15, W13)

**Registered adaptation (2026-09-15, B43 — W13, audit F059):** <!-- OPEN: B43 --> **A shot produces no live event: `media_jobs` is in no channel of §9b and carries no broadcast trigger.**

Measured on the company engine, 2026-09-15: non-internal triggers on `public.media_jobs` = **0**. The media lane records a job's passage by inserting into `audit_log` (`packages/outbox-executor/src/media-lane.ts`), and this spec's channel catalogue (§9b) contains no `media.*` or `job.*` type. Nothing is published when a card starts to paint, finishes or fails.

**Why this is registered and not merely noted.** The first law of V2 is that the company must be visibly working — *motion IS state*, the worker who is working lights up and is named. A studio screen built on today's sources can only poll, and a polled surface is the "flat book with no life" the CEO named on 2026-08-02. As OBSERVABILITY_SPEC:149 puts it, `audit_log` answers *who changed what*; it is not the *what is happening now* channel.

**The gap, named and not closed here.** A `media_jobs` type set in §9b (a job's `queued → running → done|failed|cancelled` passage, carrying the job's kind, its seat and its task) plus the **trigger** that broadcasts it is a schema and channel change. **Who closes it:** the studio's screen plan (W14), on the CEO's word — a channel is added to the closed envelope dictionary only with the strongest model and his approval (§ Opus-devralma notu). Until then the studio has no live source and any screen drawn for it must say so rather than poll silently.

## Done definition (bu spec)

27 başlık ✓ · kaynak-gerçek/canlı-yayın ayrımı ✓ · kanal kataloğu (8 kanal, type listeleri, debounce) ✓ · bağlayıcı zarf ✓ · reconnect/fallback kontratı ✓ · doğrulama komutları ✓ · Opus-devralma + ⛔ ✓
