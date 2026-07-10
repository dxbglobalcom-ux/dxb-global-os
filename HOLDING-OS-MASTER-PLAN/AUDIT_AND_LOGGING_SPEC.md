# AUDIT_AND_LOGGING_SPEC — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 4 · Yazar: Fable 5 bizzat · Kaynak hüküm: direktif madde 10.2 (Decision Logs — 8 soru), 10.3 (Tool Logs — 6 soru), 10.4 (File and Code Logs — 9 soru) · Üst: [[SYSTEM_ARCHITECTURE]] §14-15 · Kardeşler: [[OBSERVABILITY_SPEC]] (canlı yüzey sahibi), [[DATA_MODEL]] 4.3 (şema), [[SECURITY_MODEL]] (S5 sicil)
> İşbölümü (bağlayıcı): OBSERVABILITY = "şu an ne oluyor" (canlı görünüm); BU SPEC = "ne olmuştu, kim, neden, kanıtı nerede" (kalıcı kayıt disiplini + drill-down + saklama). Tablolar ortak, sahiplik ayrı.

## 1. Amaç

Her önemli olayın SORGULANABILIR kaydı: karar (gerekçe+alternatif+confidence), araç çağrısı (parametre+süre+sonuç), dosya/kod değişimi (diff+commit+review+rollback imkânı) — CEO'nun "bütün denetim kayıtları" hükmünün (madde 1, alan 18) veri disiplini. Kayıt YAZILMAYAN karar/araç/dosya olayı sistemde "olmamış" sayılır — kayıt kültürün kendisidir.

## 2. Gereksinimler (direktif soruları → kolon karşılığı)

| Direktif sorusu | Karşılık |
|-----------------|----------|
| 10.2: kim, gerekçe, veriler, alternatifler, confidence, risk, approval, sonuç | `decision_log`: decided_by, rationale, data_used, alternatives, confidence, risk, approval_id, outcome (4.3 birebir — 8/8) |
| 10.3: hangi araç, parametreler, hangi ajan, sonuç, süre, hata | `tool_calls`: tool, params_digest, run_id→employee, ok, duration_ms, error (6/6) |
| 10.4: okunan/oluşan/değişen/silinen dosya, diff, ajan, görev, commit, review, rollback | `file_changes`: path, op(read/create/modify/delete), diff_summary, run_id→employee+task, commit_sha; review+rollback **kayıtlı ekler** (§4) |

## 3. Mimari (kayıt disiplini — kim yazar)

```
ajan koşusu (SDK sarmalayıcı, packages/orchestrator):
  tool çağrısı  → tool_calls satırı (otomatik — sarmalayıcı yazar, ajan iradesi yok)
  dosya işlemi  → file_changes satırı (Write/Edit/commit hook'larından otomatik)
karar noktası (kernel/orchestrator/hook):
  → decision_log satırı (yazan KOD'dur — "önemli karar" tanımı §10 listesiyle sabit)
control-plane mutasyonu (SECURITY DEFINER fn):
  → audit_log satırı + detail_ref köprüsü (fn içinde — atlanamaz, O5)
```

Bağlayıcı ilke: log yazımı yürütmeyle AYNI transaksiyonda değilse bile aynı kod yolundadır; ajan "log yazayım mı" kararı VEREMEZ (sarmalayıcı mimarisi).

## 4. Veri modeli (kayıtlı ekler)

4.3 ailesi esas + 10.4'ün review/rollback soruları için ek:

```sql
-- 0022x ailesine ek (0022x-b; Dalga 4 kapanışında DATA_MODEL'e işlenir)
ALTER TABLE file_changes
  ADD COLUMN review_status text NOT NULL DEFAULT 'unreviewed'
    CHECK (review_status IN ('unreviewed','reviewed_ok','reviewed_flagged')),
  ADD COLUMN reverted_by bigint REFERENCES file_changes(id);  -- rollback zinciri: geri alan değişim kaydı

-- audit_log köprü kolonu (mevcut tabloya nullable ek)
ALTER TABLE audit_log ADD COLUMN detail_ref jsonb;             -- {"table":"decision_log","id":123}
```

Saklama sınıfları (bağlayıcı): `audit_log` + `decision_log` = KALICI (silinmez); `tool_calls` + `file_changes` = 180 gün sonra aylık özet tablosuna damıtılır + ham satır arşive (Storage Box, BACKUP_PLAN döngüsü) → sonra prune; `control_idempotency` 7 gün (API_CONTRACTS). Prune job'ları pg-boss `retention.*` ailesi.

## 5. Component yapısı / 6. Backend yapısı

- `packages/orchestrator` SDK sarmalayıcısı: tool_calls + file_changes otomatik yazımı (koşu başına toplu-insert tamponu, 1 sn flush — yazım fırtınası DB'yi boğmaz).
- `packages/kernel` karar noktaları: decision_log yazım yardımcısı `logDecision({...8 alan})` — alanları eksik çağrı derleme hatası (tip zorunlu).
- Retention worker: kernel worker içinde cron job'ları (yeni servis YOK — R5).

## 7. Frontend yapısı

Governance grubu "Audit" sayfası: zaman-akışlı birleşik görünüm (audit_log ana hat) → satır → detail_ref ile aile kaydına in → koşu/görev/karar zinciri. Filtreler: aktör, entity, tarih, risk. Decision Logs ayrı sekme: 8 sütun birebir (madde 10.2 soruları başlık olarak — CEO direktif diliyle okur). Canlı akış OBSERVABILITY yüzeyindedir; burası sorgu+kanıt yüzeyi.

## 8. API'ler

Okuma: PostgREST + `v_audit_trail` view (audit_log ⋈ detail_ref çözümü tek sorguda). Mutasyon YOK (append-only; tek istisna `file_changes.review_status` — `control_audit_mark_reviewed` fn'i, [[API_CONTRACTS]] envanterine kayıtlı ek). Ajan-içi: ajanlar kendi koşu loglarını OKUYABİLİR (öz-düzeltme için), başkasınınkini okuyamaz (profil sınırı).

## 9. Event yapısı

Log yazımları Broadcast ÜRETMEZ (hacim; canlılık ops:live'ın işi). İstisna: `reviewed_flagged` işareti `alerts` kanalına `alert.raised` üretir (insan dikkat çağrısı).

## 10. State yönetimi ("önemli karar" tanımı — bağlayıcı liste)

decision_log yazımı ZORUNLU olan noktalar: model seçimi/fallback düşüşü · görev atama (hangi çalışana neden) · workflow adım dallanması (retry/fallback/escalate tercihi) · hook reddi/escalation · approval'a dönüştürme · bütçe-sınır aksiyonu · persona sürüm terfisi · org değişikliği önerisi. Liste genişletilebilir (append) — daraltma ⛔. Bu liste dışında kalan mikro seçimler task_events düzeyinde kalır (log enflasyonu bilinçli sınırlandı).

## 11. Database tabloları / 12. İlişkiler

4.3 + §4 ekleri. İlişki omurgası: audit_log —detail_ref→ {decision_log|settings_change_log|library_change_log|...}; file_changes.reverted_by self-FK (rollback zinciri); decision_log.approval_id → approvals (karar-onay bağı).

## 13. Yetkilendirme

Append-only grant modeli (O8): INSERT yalnız service_role/fn; UPDATE/DELETE grant'i YOK (tek istisna: file_changes.review_status kolonu fn-yoluyla). Okuma: CEO tümü; ajanlar kendi run_id kapsamı.

## 14. Logging / 15. Audit (log'un log'u)

Uygulama logları (pino/stdout/Docker) TEŞHİS içindir, denetim değil — kalıcılık sözü yok. Denetim sözü yalnız DB kayıtlarına. Prune/damıtma işlemleri kendileri audit_log'a yazılır ("neyi ne zaman arşivledim" — kayıt silme bile kayıtlıdır).

## 16. Security

params_digest/diff_summary İÇERİK değil ÖZET taşır (prompt gövdesi, secret, tam diff YASAK — OBSERVABILITY §16 kuralıyla aynı; tam diff git'te yaşar, commit_sha köprüdür). Satır imzalama ertelendi → [[SECURITY_MODEL]] S5. Madde 4: yeni tarama/bürokrasi yok.

## 17. Error handling / 18. Retry / 19. Fallback

Log yazım hatası yürütmeyi DURDURMAZ (yürütme kutsal) AMA sessiz kalmaz: tampon flush hatası System Health sayacına + 3 deneme sonrası `alerts`. decision_log yazamayan karar noktası koşuyu `degraded_logging` bayrağıyla işaretler (kanıt eksikliği görünür olur). Retention job hatası: prune ATLANIR (veri silmek riskli taraf — fail-safe silmeme yönü).

## 20. Test planı / 21. Acceptance criteria

- Sarmalayıcı testi: mock koşuda N tool çağrısı → N tool_calls satırı (0 kaçak); Write/Edit → file_changes satırı op-doğru.
- logDecision tip testi: eksik alan derlenmez; 8 alan dolu satır.
- Kabul: madde 10.2'nin 8, 10.3'ün 6, 10.4'ün 9 sorusunun HER biri Audit yüzeyinde sütun/alan olarak yanıtlanabilir (soru-sütun denetim tablosu §2); append-only reddi kanıtı (`UPDATE decision_log ... → permission denied`); retention damıtma koşusu test DB'de uçtan uca.

## 22. Migration planı / 23. Rollback planı

`0022x-b_audit_ext` (2 ALTER + prune job kayıtları). Rollback: kolonlar DROP; log aileleri bağımsız yaşar. Retention başlangıcı: damıtma ilk 180 gün dolmadan İŞLEMEZ (boş koşu, kanıt logu üretir).

## 24. Uygulama sırası (doğrulamalı)

```bash
supabase db push && psql "$DB" -c "\d file_changes" | grep -E "review_status|reverted_by"   # → 2 kolon
psql "$DB" -c "UPDATE decision_log SET decision='x' WHERE false;"                            # → permission denied
psql "$DB" -c "SELECT jsonb_typeof(detail_ref) FROM audit_log LIMIT 1;"                      # → object|null (kolon canlı)
pnpm --filter @dxb/orchestrator test -- --grep "tool_calls"                                  # → sarmalayıcı testleri yeşil
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: 0022x ailesi, orchestrator sarmalayıcı noktası, pg-boss cron, Storage Box arşiv hedefi (BACKUP_PLAN).
- Risk: log hacmi 8GB VPS diskini zorlar → tampon+180g retention+özet damıtma üçlüsü; disk doluluk System Health eşiği %80.
- Edge: koşu çökmesi tampon flush öncesi → kayıp en fazla 1 sn'lik pencere, koşu kaydı `degraded_logging`; rollback'in rollback'i → reverted_by zinciri düz liste (döngü FK'da imkânsız — yeni satır her zaman ileri); Fable→Opus devri sırasında yarım koşu → agent_runs status üzerinden yetim tespiti (BACKUP_PLAN devir protokolü adımı).

## Opus-devralma notu

Şema + sarmalayıcı deseni + "önemli karar" listesi + saklama sınıfları kapalıdır; Opus yeni karar noktası eklerken §10 listesine satır ekler ve `logDecision` çağırır — başka mekanizma icat etmez. ⛔ kritik karar: saklama sınıflarını kısaltma / KALICI sınıfı gevşetme — en güçlü model + CEO onayı.

## Done definition (bu spec)

27 başlık ✓ · madde 10.2/10.3/10.4 soru-kolon eşlemesi tam (8+6+9) ✓ · kayıtlı ekler DDL'iyle (review/rollback/detail_ref) ✓ · OBSERVABILITY işbölümü sınırı ✓ · saklama sınıfları + prune disiplini ✓ · "önemli karar" bağlayıcı listesi ✓ · fail-safe yönleri (yürütme kutsal / silmeme) ✓ · doğrulama komutları ✓ · Opus-devralma + ⛔ ✓
