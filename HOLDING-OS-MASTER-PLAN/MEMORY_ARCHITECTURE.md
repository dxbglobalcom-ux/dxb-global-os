# MEMORY_ARCHITECTURE — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 4 · Yazar: Fable 5 bizzat · Üst: [[SYSTEM_ARCHITECTURE]] · Kardeşler: [[DATA_MODEL]] (memory_index/embeddings), [[HOLDING_LIBRARY_SPEC]] (envanter köprüsü), [[HOLDING_OS_PRODUCT_SPEC]] §4 alan 15-16 (devir buraya)
> Zemin: Phase 6 canlı kod — `packages/memory-router` (06-02 spike verdict: kompozisyon CONFIRMED 20/20). Bu spec mevcut motoru HOLDING katmanına bağlar; motoru yeniden tasarlamaz.

## 1. Amaç

Holdingin kalıcı hafızasının tek haritası: hangi bilgi türü nerede yaşar, kim yazar, kim okur, CEO nasıl görür ve yönetir. Hedef: her çalışanın işini kurumsal hafızayla yapması (tekrar-öğrenme maliyeti sıfıra iner) + CEO'nun "bütün memory yapılarını" görebilir/değiştirebilir olması (madde 1 hükmü, alan 16).

## 2. Gereksinimler

- G1. Kompozisyon KİLİTLİ (kod: `KIND_STORE`, write-policy.ts): `fact→pgvector · relation→graphify · artifact→obsidian · procedure→notebook`. Router tahminle store SEÇMEZ; kind verilir, eşleme sabittir.
- G2. Yazım politikalıdır: her kayıt sınıflandırılır, redaksiyondan geçer (`redact.ts` — secret sızıntısı store'a inmez), indekslenir.
- G3. Her memory kaydı drill-down'a açıktır: CEO Memory sayfası → kayıt → kaynağı (hangi ajan, hangi koşu, hangi görev).
- G4. Madde 4: yeni erişim bürokrasisi yok; mevcut MCP profil sınırları erişimi belirler.

## 3. Mimari (4-store kompozisyon — KALIR)

| Store | Kind | Fiziksel yer | İçerik |
|-------|------|--------------|--------|
| pgvector | `fact` | `memory_index` + `memory_embeddings` (PG15, KALIR) | atomik olgular, semantik arama |
| graphify | `relation` | `memory-store/relation/*.md` + graph çıktısı | varlıklar-arası ilişki bilgisi |
| obsidian | `artifact` | `memory-store/artifact/*.md` (repo vault) | üretilmiş iş çıktıları, notlar, wiki-link'li |
| notebook | `procedure` | `memory-store/procedure/*.md` (open-notebook hattı) | nasıl-yapılır, SOP-öncesi prosedür bilgisi |

Erişim yolu: ajan → dxb-mcp `memory` grubu (8 MCP grubundan biri, KALIR) → memory-router → classify (`classify-read.ts`: kind→store kesin eşleme) → store adaptörü. Ajanlar store'lara DOĞRUDAN erişmez.

## 4. Veri modeli

`memory_index`, `memory_embeddings` KALIR (0010 pgvector). Yeni tablo AÇILMAZ; HOLDING katmanı iki köprüyle kurulur:
1. **Envanter köprüsü:** her store `library_items(kind='memory_source')` altında BİR kayıt (4 satır + gelecekte eklenen kaynaklar) — sahiplik/erişim/kalite alanları library standardından gelir.
2. **Kaynak köprüsü:** yeni memory yazımları `memory_index` meta'sına `run_id` taşır (kayıtlı ek: `memory_index.run_id uuid` nullable — Dalga 4 kapanışında DATA_MODEL'e işlenir) → agent_runs drill-down zinciri kapanır.

## 5. Component yapısı / 6. Backend yapısı

- `packages/memory-router` KALIR: `write-policy.ts` (sınıflandır+redakte+yaz), `classify-read.ts` (oku), `KIND_STORE` sabiti.
- YENİ (küçük): router'a `scope` parametresi — `holding` (varsayılan, herkes okur) | `dept:<id>` (departman-içi). Fiziksel karşılık: `memory_index.scope text NOT NULL DEFAULT 'holding'` (kayıtlı ek, DATA_MODEL'e işlenir); dosya-store'larda ön-ek dizin (`memory-store/<kind>/dept-<id>/...`). Gateway, ajanın profilindeki departmanla `dept:` scope'unu eşler — profil dışı scope okuması boş döner (hata değil; bilgi sızıntısı sinyali vermez).
- Retrieval bütçesi: okuma yanıtı kompakt (başlık+özet+kaynak ref); tam gövde ayrı çağrı — token disiplini (CLAUDE.md hükmü) motor seviyesinde.

## 7. Frontend yapısı

CEO Memory sayfası (Intelligence grubu, [[CEO_COMMAND_CENTER_SPEC]] rotası): 4 store kartı (boyut, kayıt sayısı, son yazım, kalite sinyali) → store içi arama/liste → kayıt detayı (gövde + kaynak koşu + kullanım geçmişi) → düzenle/arşivle aksiyonları (control seam). "Özet var detay yok" yasağı burada da geçerli.

## 8. API'ler

- Ajan-içi: MCP `memory` araçları (mevcut: commit/recall yüzeyi) — kontrat değişmez, `scope` parametresi eklenir.
- CEO: [[API_CONTRACTS]] 8b'ye ek alan `memory`: `archive_item, edit_item, reclassify, set_scope` (`control_memory_*` fn'leri; Dalga 4 kapanışında API envanter tablosuna işlenir — kayıtlı ek).
- Okumalar: `v_library_catalog` memory_source satırları + `memory_index` RLS-read.

## 9. Event yapısı

Yeni kanal YOK. Memory olayları düşük frekanslıdır: önemli yazımlar (`artifact` üretimi) `ops:live` koşu olayları içinde görünür; arşiv/düzenleme control-seam audit'ine düşer. Gelecek kanal ihtiyacı EVENT_MODEL §9b'ye satır ekleyerek açılır.

## 10. State yönetimi

Hafıza durumu tamamen store'lardadır; router durumsuz (kernel worker içinde kütüphane — resident servis DEĞİL, R5). Dosya-store'lar git'te yaşar → hafızanın kendisi versiyonludur (rollback = git).

## 11. Database tabloları / 12. İlişkiler

Kayıtlı ekler: `memory_index.run_id uuid` + `memory_index.scope text DEFAULT 'holding'`. İlişki: memory_index n─1 agent_runs (kaynak); library_items(memory_source) 1─n store'lar (envanter); embeddings 1─1 index (mevcut).

## 13. Yetkilendirme

- Yazım: yalnız memory-router üzerinden (ajan profillerinde store'lara doğrudan yazım yolu yok; dosya-store dizinleri MCP dosya araçlarının profil kapsamı dışında).
- Okuma: `holding` scope herkese, `dept:` scope profil eşleşmesine; CEO tümünü görür.
- Editing and archiving: the CEO through the control seam; HR processes only propose (an employee's archive yields a clean-up proposal for its scope, never a deletion). The one dream (A1) only proposes too; an accepted proposal is written through the router like any write (B64 decision 18). <!-- CEO-OK: b64-decision18-one-dream-holding-wide-2026-10-14 --> Who accepts a dream proposal: one on a department's own memory (`dept:<id>`) is accepted by Hamza; one on holding-wide memory (`holding`) or touching his rules comes to him through the same control seam (B64 v2, decision 3) <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->.

## 14. Logging / 15. Audit

Her yazım `memory_index` satırı = kendi kaydı (append; düzeltme yeni sürüm). CEO düzenleme/arşiv aksiyonları audit_log'a. Okumalar loglanmaz (hacim + değeri düşük) — bilinçli karar; istisna: boş-dönen `dept:` scope okumaları System Health sayacına (yanlış profil sinyali).

## 16. Security

`redact.ts` katmanı KALIR ve tek geçit olmaya devam eder: credential/secret deseni yakalanan içerik store'a İNMEZ (maskeli özet iner). Dosya-store'lar repo içinde → gitleaks taraması hafızayı da tarar (mevcut kapı). Madde 4: şifreleme-at-rest sertleştirmesi ertelendi → [[SECURITY_MODEL]] sicili.

## 17. Error handling / 18. Retry / 19. Fallback

- Store adaptör hatası: yazımda → kuyruğa geri (pg-boss retry, transient sınıfı); okumada → kalan store'lar yanıt verir + eksik store yanıt meta'sında işaretlenir (sessiz eksik YOK).
- Sınıflandırma belirsizliği: classify LLM çağrısı geçersiz JSON dönerse tek retry → yine bozuksa `artifact`a düşer (en genel kind) + `needs_reclassify` bayrağı (CEO Memory sayfasında kuyruk).
- pgvector çökmesi: fact okumaları geçici olarak metin-arama fallback'i (ILIKE, düşük kalite bayrağıyla) — System Health alarmı zaten çalar.

## 20. Test planı / 21. Acceptance criteria

- Mevcut testler KALIR (memory-router birim + 06-02 spike senaryoları); yeni: scope izolasyon testi (dept-A ajanı dept-B kaydını okuyamaz — boş döner), run_id köprü testi (yazım → memory_index.run_id → agent_runs join).
- Kabul: 4 store'un dördü de canlı adaptörle yanıt verir; CEO Memory sayfası 4 kart + drill-down; redaksiyon testi (canary secret yazımı → store'da maskeli).

## 22. Migration planı / 23. Rollback planı

Kolon ekleri 0025x_api_support'a binmez — ayrı küçük migration `0026x_memory_holding` (2 ADD COLUMN + backfill `scope='holding'`). Rollback: kolon DROP (veri kaybı yalnız scope/run_id meta'sı; gövde store'larda durur).

## 24. Uygulama sırası (doğrulamalı)

```bash
supabase db push && psql "$DB" -c "\d memory_index" | grep -E "run_id|scope"   # → 2 kolon
pnpm --filter @dxb/memory-router test                                           # → mevcut + scope testleri yeşil
psql "$DB" -c "SELECT count(*) FROM library_items WHERE kind='memory_source';"  # → 4 (seed sonrası)
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: pgvector (0010), memory-router paketi, dxb-mcp memory grubu, library ailesi (0024x — envanter köprüsü için önce gelmeli).
- Risk: dosya-store büyümesi repo'yu şişirir → eşik: `memory-store/` 500MB'ta System Health uyarısı; arşiv stratejisi (eski artifact'ler Storage Box'a) BACKUP_PLAN döngüsüne bağlanır.
- Edge: aynı olgunun çift yazımı → embeddings benzerlik eşiğiyle dedup önerisi (otomatik silme YOK; the proposal follows the dream's acceptance path, §13 and A1: on `dept:<id>` Hamza accepts it, on `holding` or touching his rules it waits on the CEO — B64 v2, decision 3 <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->); çalışan arşivlendiğinde scope'lu kayıtları → kalır, sahibi `archived` işaretli; Opus döneminde classify kalitesi düşerse → `needs_reclassify` kuyruğu büyür, eşik alarmı CEO'ya.

## Registered adaptations (B64, 2026-10-14 — CEO-visible; no silent deviation)

Design: `.planning/quick/20261012-b64-is-akisi/is-akisi.html` (decisions 15 and 18). The composition, the redaction gate
and `KIND_STORE` are untouched (⛔ above); both items ride the router as it stands.

- **A1 The one dream (decision 18)** <!-- CEO-OK: b64-decision18-one-dream-holding-wide-2026-10-14 --> <!-- OPEN: B64 -->
  — his words: *"Bu rüya olayı aşırı önemli"*.
  1. One dream for the whole holding, at Ferrari level, with Hermes inside it — never one dream per tool or per
     employee. Every night every employee's work of the day, Hermes's included, is read; recurring patterns,
     contradictions and stale knowledge are found, and a few memory changes are proposed.
  2. Each proposal carries the runs it was seen in, how many times it was seen, and why it is needed.
  3. A proposal never edits memory itself. Accepted, it is written through this router into the holding's memory and
     into Hermes's (A2), so the two never diverge. Who accepts (§13): a proposal on a department's
     own memory (`dept:<id>`) is accepted by Hamza; one on holding-wide memory (`holding`) or touching his rules comes
     to him (B64 v2, decision 3) <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->.
  4. One line on his screen in the morning: *"Dün gece N iş okundu, 3 şey bulundu, 1'i sizi bekliyor."* The line is
     drawn by CEO_COMMAND_CENTER_SPEC; its numbers come from this dream.
  5. The bar: the same job done a second time is better and cheaper — read from the holding's own runs (the check's
     verdict and the cost of the first and the second run of a job type).
  6. The night reading is a queued scheduler job (pg-boss), not a resident service (§10, R5). Reading every
     employee's runs is a named exception to "an agent reads only its own run scope" (AUDIT_AND_LOGGING_SPEC,
     OBSERVABILITY_SPEC). Schema at build.
  7. Measured 2026-10-14: Hermes's core has no dreaming (its documentation, code and 39 releases); a
     community-written dream plugin in its catalogue is not used; the three-phase description (light, deep, REM) written
     on the board in August was OpenClaw's.
- **A2 Hermes's memory lives inside the holding (decision 15)** <!-- CEO-OK: b64-decision15-hermes-holding-hands-and-eyes-2026-10-14 --> <!-- OPEN: B11 -->
  — brain and memory stay in the holding: one brain, never two. Hermes keeps its working memory on the holding's
  server as part of the holding's memory: registered as a `memory_source` in the library bridge (§4), written through
  this router and its redaction gate (§16). The holding's memory is the source; an accepted dream change is written into
  both (A1.3). Schema at build.
- **A3 Hamza's conversation summary, and what a handover needs from memory (B64 v2)** <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- OPEN: B64 -->
  — the day's conversation runs in one append-only session and its compaction summary keeps every decision he gave
  (written to miss nothing first, to be short second), the next day starting from the previous day's (AGENT_ORCHESTRATION A29 (11), steps from A29 (6)); the summary serves
  the conversation only and changes no memory — a durable change goes A1's way. The holding's shared memory must let a
  successor reach anything it needs at once by searching the job's desk and this memory (A29 (12)).

## Opus-devralma notu

Motor canlı ve test-korumalı; Opus'un işi yalnız köprü ekleri (2 kolon + 4 seed satırı + control_memory_* fn'leri) — kompozisyonu, redaksiyonu, KIND_STORE'u DEĞİŞTİRMEZ (⛔ kompozisyon değişikliği = en güçlü model + CEO onayı; 06-02 spike kanıtı geçersizleşir).

## Done definition (bu spec)

27 başlık ✓ · 4-store kompozisyon (kod-kanıtlı, kilitli) ✓ · scope + run_id köprüleri (kayıtlı ekler) ✓ · CEO görünürlük/kontrol yüzeyi ✓ · redaksiyon güvenlik geçidi ✓ · doğrulama komutları ✓ · Opus-devralma + ⛔ ✓ · the one dream and Hermes's memory inside the holding registered (A1, A2 — B64, not built)
