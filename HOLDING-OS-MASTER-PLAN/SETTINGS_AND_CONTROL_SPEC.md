# SETTINGS_AND_CONTROL_SPEC — TAM MANUEL KONTROL MERKEZİ

> Dalga 2 · Yazar: Fable 5 bizzat · Üst: [[CEO_COMMAND_CENTER_SPEC]] · Kardeşler: [[MODEL_ROUTING_SPEC]] (model rolleri), [[APPROVAL_ENGINE_SPEC]] (onay eşiği), [[COST_CONTROL_SPEC]] (bütçe anahtarları)
> Direktif kaynağı: §18 (settings tasarımı) + madde 6.1-6.4 (orchestrator/department/employee/workflow ayarları) + madde 2 ("CEO her şeyi manuel değiştirebilmeli").

## 1. Amaç

Settings = holdingin GERÇEK kontrol merkezi (§18: "sıradan ayar listesi olmayacak"). CEO'nun madde 2'deki 22 müdahale yetkisinin ve madde 6'nın dört ayar ailesinin TAMAMI tek yazım seamı üzerinden, geri alınabilir ve audit'li olarak sunulur. Yüzeysel toggle listesi = RET.

## 2. Gereksinimler

- R1. §18'in 22 kategori bölümü birebir: Global OS · Models · Orchestrator · Fallback Routing · Employees · Departments · Workflows · Approvals · Permissions · Budgets · Token Limits · Providers · Skills · Plugins · Memory · Logging · Audit · Security · Notifications · Integrations · Backups · Recovery.
- R2. Her ayar satırında (§18 zorunlu meta): mevcut değer · önceki değer · etkilenecek alanlar · risk · cost impact · approval requirement · change history.
- R3. Her değişiklik tek seam'den: route handler → SECURITY DEFINER fn → audit + change_log + Broadcast (SYSTEM_ARCHITECTURE R3).
- R4. Undo birinci sınıf: `settings_change_log` her değişimin öncekini tutar, tek tık geri al (SYSTEM_ARCHITECTURE §27 CEO-yanlış-ayar edge'i).
- R5. Scope kademesi: global → company → department → employee/workflow; alt scope üstü override eder, çözümleme deterministik.
- R6. Para-ÇIKIŞI onay kapısı settings'ten KAPATILAMAZ (B7b) — kod-seviyesi sabit; UI bu anahtarı kilitli+açıklamalı gösterir.
- R7. Yeni güvenlik bürokrasisi eklenmez (madde 4): ayar değişiklikleri onaysız uygulanır (undo garantili); yalnız `approval_required=true` işaretli dar küme (para-çıkışı politikaları) approval'a düşer.

## 3. Mimari

Üç panel yerleşimi (§18): sol kategori navigasyonu (22 bölüm, 7 nav grubuyla uyumlu ikonlar) · orta ayar listesi (aranabilir, bölüm-içi gruplar) · sağ **Live Impact Preview** paneli (seçili ayarın etki analizi: etkilenen varlık sayıları, tahmini maliyet farkı, risk açıklaması, son 5 değişiklik). Route: `/sys/settings/[section]`. Command palette'ten ayara doğrudan atlama ("set orchestrator model" → ilgili satır focus'lu açılır).

## 4. Veri modeli

[[DATA_MODEL]] settings ailesi (migration 0021x) — normatif tanım burada:

```sql
settings_registry (            -- ayar TANIMLARI (seed ile gelir, koddan üretilmez)
  key text PK,                 -- örn. 'orchestrator.primary_model'
  section text,                -- §18 kategorisi (22 değer)
  scope_types text[],          -- {global|company|department|employee|workflow|model_role}
  value_type text,             -- string|number|boolean|enum|json|model_ref|duration
  enum_values jsonb,           -- value_type=enum ise
  default_value jsonb,
  risk_class text,             -- none|low|medium|high|money_out_policy
  affected_areas text[],       -- Live Impact Preview kaynağı
  cost_impact text,            -- none|per_task|per_day|structural
  approval_required boolean,   -- R7 dar kümesi
  locked boolean,              -- B7b sabitleri: true → UI kilitli, fn reddeder
  description_i18n jsonb       -- {en, tr}
)
settings_values (
  id uuid PK, key FK→registry, scope_type text, scope_id uuid null,  -- null=global
  value jsonb, version int,    -- optimistic concurrency
  updated_at, updated_by,      -- 'ceo' | 'system'; B64 adds via 'hamza' + the sentence's reference (schema at build)
  UNIQUE(key, scope_type, scope_id)
)
settings_change_log (
  change_id uuid PK, key, scope_type, scope_id,
  old_value jsonb, new_value jsonb, changed_at, changed_by,
  reverted_by uuid null        -- undo zinciri (geri almanın da kaydı olur)
)
```

Çözümleme: `resolve_setting(key, employee_id)` SQL fn — employee → department → company → global → registry.default sırasıyla ilk bulunan döner. Kernel/orchestrator HER okumada resolve kullanır (cache 30sn, `settings` Broadcast'iyle invalidate).

## 5. Component yapısı

| Bileşen | İçerik |
|---------|--------|
| `SettingsShell` | 3 panel; DESIGN_SYSTEM Settings Panel + Form kuralları |
| `SettingRow` | label + mevcut değer + tip-uygun editör + meta rozetleri (risk, cost impact, approval) |
| `ImpactPreview` | affected_areas → canlı sayılar (örn. "3 departman, 12 çalışan bu değeri miras alıyor") + değişim maliyet tahmini + son değişiklikler |
| `ChangeHistoryDrawer` | change_log satırları + tek-tık Revert |
| `ScopeSwitcher` | global/company/department/employee sekmesi — hangi scope'u düzenlediği HER AN görünür (yanlış-scope edge'i) |
| `LockedSettingRow` | B7b kilitli anahtarlar: kilit ikonu + neden metni; editör render edilmez |

## 6. Backend yapısı

- `POST /api/control/settings` `{key, scope_type, scope_id, value, expected_version, idempotency_key}` → Zod → `fn_set_setting(...)`: registry doğrulaması (tip/enum/scope/locked) → optimistic version kontrolü → values upsert + change_log insert + audit_log insert + `settings` Broadcast — TEK transaction.
- `POST /api/control/settings/revert` `{change_id}` → `fn_revert_setting`: old_value'yu yeni değişiklik olarak uygular (history hiç silinmez).
- Registry seed: `supabase/seed/settings_registry.sql` — madde 6.1'in 23 anahtarı (13 model rolü + the backup pair written by role — main brain, backup brain (B64 decision 13; the old fallback order closes with it, B66), timeout, max token, max maliyet, context limiti, retry politikası, confidence threshold, escalation politikası, human-approval eşiği, Opus-review zorunluluğu — key `orchestrator.fable_review_required`, the id kept under U20) + 6.2 departman seti + 6.3 çalışan seti (28 alan) + 6.4 workflow seti (17 alan) + sistem anahtarları (Global Pause, Maintenance). Model rolü anahtarlarının değer uzayı `model_catalog`dan (MODEL_ROUTING_SPEC).

## 7. Frontend yapısı

RSC: bölüm sayfası registry+values'u tek sorguyla yükler (`v_settings_section` view — key, resolved chain, son değişiklik). Client adaları: editor input'ları, ImpactPreview canlı sayıları, undo toast. Arama: bölüm-içi fuzzy (client), global ayar araması command palette'ten (`v_global_search` settings tipini içerir).

## 8. API'ler

Reads: `v_settings_section(section)` + `v_setting_impact(key, scope)` (affected_areas → count sorguları). Mutations: yukarıdaki iki control endpoint'i. Idempotency + `{ok, change_id, affected[]}` sözleşmesi (SYSTEM_ARCHITECTURE §8). Employee/department ayarlarının org tablosu alanlarıyla (örn. `employees.model`) kesişimi: kaynak-gerçek ORG TABLOSUDUR; settings seam bu alanlar için `fn_set_employee_field`a delege eder (çift kaynak YASAK) — registry satırı `delegate:'org'` işaretli.

## 9. Event yapısı

`settings` Broadcast kanalı: `{key, scope_type, scope_id, change_id}` yayını → (a) açık settings sayfası satırı günceller + "changed" vurgusu, (b) kernel/orchestrator resolve cache invalidate, (c) etkilenen modül sayfası banner ("Model routing değişti — yenile"). Global Pause/Maintenance anahtarları ayrıca `alerts` kanalına Attention seviyesi düşürür.

## 10. State yönetimi

Form draft'ı client'ta; kaydetmeden bölüm değiştirme = onay sorusu. `expected_version` uyuşmazlığı (başka session değiştirdi): satır kilitlenir, "yenile ve tekrar dene" — sessiz overwrite YASAK.

## 11. Database tabloları / 12. İlişkiler

Bkz. §4 (normatif). İlişkiler: registry 1—N values 1—N change_log; values.scope_id → companies/org_units/employees/workflows (scope_type'a göre polymorphic, FK'sız + CHECK; bütünlük fn içinde doğrulanır). [[DATA_MODEL]] bu şemayı 0021x ailesine aynen alır.

## 13. Yetkilendirme

Yazma yalnız `ceo` (tek insan) + `system` (kernel'in kendi runtime ayar güncellemeleri — örn. cost monitor hard-stop bayrağı; changed_by='system' ile ayrışır). Since B64 two more hands write through the same seam, never around it (A1, A2): Hamza on his word, and a line's owner on its own line. `locked=true` anahtarlar: fn KOŞULSUZ reddeder (CEO dahil — B7b para-çıkışı kapatma girişimi 'policy' hatası döner ve audit'e düşer); `locked` belongs to the money-out lock alone (A3).

## 14. Logging / 15. Audit

Her fn çağrısı audit_log + change_log (çift kayıt: audit=kim/ne zaman/ne, change_log=undo malzemesi). Registry seed değişiklikleri migration'la gelir → git geçmişi + audit'te 'migration' aktörü.

## 16. Security

Madde 4: yeni sertleştirme yok. Mevcut RLS read-policy deseni settings tablolarına kopyalanır (0014 emsali). Secrets bu sisteme GİRMEZ: provider API anahtarları vault/.env + LiteLLM'de kalır — Jev's Vercel AI Gateway key among them; the one registered exception, the Hermes-only key, lives in the vault and is given to Hermes alone ([[MODEL_ROUTING_SPEC]] R5, B64 decision 15); settings yalnız referans/politika tutar (sert kural — registry'de secret value_type YOKTUR).

## 17. Error handling / 18. Retry / 19. Fallback

- Doğrulama hatası: satırda inline neden (tip/enum/aralık); registry dışı key = 404 policy hatası.
- Version çakışması: §10 kuralı. Fn transaction'ı atomik — yarım değişiklik imkânsız.
- Broadcast kaçarsa: 30sn cache TTL doğal düzeltir (en kötü 30sn eski ayar); kritik anahtarlar (Pause/Maintenance) pg-boss job'uyla da doğrulanır (çift kanal).
- Yanlış ayar felaketi: undo + `settings_change_log` tam zincir; toplu geri alma (son N değişikliği sırayla revert) ChangeHistoryDrawer'dan.

## 20. Test planı / 21. Acceptance criteria

- Birim (SQL): resolve zinciri (employee>dept>company>global>default) 5 senaryo; locked reddi; version çakışması; revert-of-revert.
- Playwright: ayar değiştir → Impact Preview günceller → kaydet → toast+undo → change history satırı → revert → değer eski haline.
- Kabul: 22 bölümün tamamı dolu ve GERÇEK anahtarlara bağlı (boş bölüm sahte menü = §35 ihlali) · her satırda 7 meta alanı görünür · madde 6.1'in 23 anahtarının tamamı çalışır · B7b kilidi kanıtlı (locked deneme → policy hatası).

## 22. Migration planı / 23. Rollback planı

- 0021x ailesi: `0021a_settings_tables.sql` (3 tablo + RLS) · `0021b_settings_fns.sql` (set/revert/resolve) · `0021c_settings_seed.sql` (registry). Her dosyada `-- ROLLBACK:` bloğu (DROP fn → DROP tablo sırası).
- Veri taşıma: mevcut dağınık ayarlar (env/config sabitleri) registry'ye AŞAMALI alınır — önce okuma çifti (eski kaynak + resolve karşılaştırma logu), fark 0 olunca eski kaynak silinir (iki sürüm birlikte yaşar deseni).

## 24. Uygulama sırası

1. 0021a-c migration → `psql -c "SELECT count(*) FROM settings_registry"` → ≥80 satır (seed sayısı)
2. resolve fn + kernel cache → `psql -c "SELECT resolve_setting('orchestrator.primary_model', NULL)"` → default döner
3. control endpoint'leri → `curl -X POST localhost:3000/api/control/settings -d '{"key":"os.timezone",...}'` → `{ok:true, change_id}`
4. SettingsShell + 3 bölüm (Global OS, Models, Orchestrator) → Playwright akışı yeşil
5. Kalan 19 bölüm + ImpactPreview + undo → kabul listesi

Opus-devralma: bölüm-başı teslim; registry seed'e anahtar ekleme mekaniktir (şablon: key+section+tip+risk+affected). ⛔ kritik: locked küme değişikliği, resolve sırası, seam sözleşmesi — en güçlü model + CEO onayı.

## 25. Bağımlılıklar

[[DATA_MODEL]] 0021x · [[MODEL_ROUTING_SPEC]] model_catalog (model_ref değer uzayı) · [[APPROVAL_ENGINE_SPEC]] (approval_required akışı) · [[OBSERVABILITY_SPEC]] alerts kanalı · CEO_COMMAND_CENTER shell.

## 26. Riskler / 27. Edge case'ler

- **Registry şişmesi** (her şeyi ayar yapma dürtüsü): kural — bir değer YILDA 1'den az değişecekse config/koddur, registry'ye girmez.
- **Çift kaynak sapması** (org alanı ↔ settings): delegate deseni (§8) tek kaynak garantisi; test 21'de karşılaştırma senaryosu.
- **system yazıcısı CEO'yu ezmesi**: system yalnız kendi anahtar kümesine yazabilir (fn içi whitelist); CEO değerini değiştirmez, runtime bayraklarını değiştirir.
- **Scope karmaşası**: ScopeSwitcher her an görünür; global değişiklik onay metni "TÜM holding'i etkiler (N varlık)".
- **Seed drift** (kod yeni anahtar bekler, registry eski): uygulama açılışta registry sürüm kontrolü; eksik anahtar → alerts Attention + default'la çalış.

## Registered adaptations — B64 how work reaches the holding (2026-10-14) <!-- CEO-OK: b64-decision6-hamza-changes-brains-on-his-word-2026-10-13 --> <!-- CEO-OK: b64-decisions-1-5-8-9-11-12-16-his-yes-2026-10-14 --> <!-- CEO-OK: b64-decision14-model-room-2026-10-14 --> <!-- CEO-OK: b64-decision17-his-word-over-a-rule-as-exception-2026-10-14 --> <!-- OPEN: B64 -->

The design he answered decision by decision: `.planning/quick/20261012-b64-is-akisi/is-akisi.html` (v15). Not built yet.
These items touch the seam contract (§24's ⛔ class); his answers to decisions 6, 9, 14 and 17 are that approval.

| # | Adaptation | Why |
|---|------------|-----|
| A1 | **Hamza writes on his word.** A change he gives Hamza — his own brain or effort, one conversation's, or in bulk — goes through this seam as `changed_by='ceo'` with `via='hamza'` and the sentence's reference (the "CEO context" precedent); accepted only from his chat, his voice or his own screen; a write whose source is a mail or any inbound text is refused. Undo is the ordinary undo: Hamza says *"22 müdür xhigh'a geçti; geri almak için 'geri al' deyin"*. | Decision 6 |
| A2 | **A line's owner changes its own line** — the line's definition, within the limits he drew — through the workflow seam ([[WORKFLOW_ENGINE_SPEC]]), recorded and undoable like every change; today only he can. | Decision 9 |
| A3 | **`locked` is the money-out lock alone (B7b).** The code-kept limits of the model guide ([[MODEL_ROUTING_SPEC]] A-2026-10-14 item 1: heads and managers never below `high`, Sonnet and Haiku never at `low`, `max` never a default, the final human-read text never below Opus, no part over its job's budget) are holding rules, not locks: when his change conflicts with one, the seam warns once (*"Bu şu kuralla çelişiyor, yine yapayım mı?"*), answers why and what harm if he asks, and on his "devam" applies it once, recorded as an `override` line; the rule stays until he says "bu kuralı kaldır, şunu koy". Decision 17 has no edges <!-- CEO-OK: b64-q3-decision17-covers-everything-2026-10-14 -->: it covers the Islamic boundaries too, the rule unchanged; for money, a contract or identity his approval is still given on his approval card, never by voice. | Decision 17 |
| A4 | **Every standing assignment carries its date, who decided and why.** A model-role change records its reason beside `changed_at` and `changed_by` (schema at build); when a new model enters the catalogue, the mechanical seats move by themselves with one line to him and the big seats wait for his word. The "Models" and "Fallback Routing" sections show the backup pair by role (main brain ⇄ backup brain). | Decision 14 — the model room |

## Done definition (bu spec)

27 başlık ✓ · şema + fn sözleşmeleri kod seviyesinde ✓ · §18 22 bölüm + madde 6.1-6.4 anahtar kümeleri eşlenmiş ✓ · B7b kilit mekanizması tanımlı ✓ · undo birinci sınıf ✓ · adım-başı doğrulama komutları ✓ · Opus-devralma + ⛔ kararlar ✓
