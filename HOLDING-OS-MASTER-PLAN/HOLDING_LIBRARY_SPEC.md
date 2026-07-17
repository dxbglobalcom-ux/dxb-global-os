# HOLDING_LIBRARY_SPEC — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 4 · Yazar: Fable 5 bizzat · Kaynak hüküm: direktif madde 13 (Holding Library — 20 içerik türü + 11 öğe alanı + CEO erişim yönetimi) · Üst: [[SYSTEM_ARCHITECTURE]] · Kardeşler: [[DATA_MODEL]] 4.5, [[PERMISSION_MODEL]] (erişim), [[MEMORY_ARCHITECTURE]] (memory_source köprüsü)

## 1. Amaç

Holdingin merkezi bilgi ve kapasite kütüphanesi: skills, plugins, tools, MCP'ler, prompt template'ler, personalar, policy'ler, SOP'lar, kod bileşenleri, araştırmalar… tek kayıt sisteminde — kim sahibi, hangi sürüm, kim kullanabilir, ne kadar kaliteli. CEO "kimin hangi skill veya plugin'i kullanabileceğini" buradan ayarlar (madde 13 kapanış hükmü); MCP gateway profilleri bu kayıttan DERLENİR — kayıt dışı yetenek fiilen kullanılamaz hale gelir.

## 2. Gereksinimler

- G1. Madde 13'ün 20 içerik türü birebir `library_items.kind` enum'udur (DATA_MODEL 4.5 — kod listesi oradadır, birebir).
- G2. Madde 13'ün 11 öğe alanı karşılıksız kalamaz (eşleme tablosu §4).
- G3. Grant değişikliği FİİLİ etki üretir: `library_grants` → gateway profil derlemesi (kayıt-yetki-uygulama zinciri kopmaz).
- G4. Mevcut dağınık varlıklar (skills dizinleri, study-cards, personas/, 8 MCP grubu, plugin seti, tool_pins) intake ile kayda GİRER — envanter sıfırdan uydurulmaz.

## 3. Mimari

```
kayıt: control_library_* fn'leri → library_items / library_grants (+ change/usage logları)
derleme: registry-generated MCP profilleri (Phase 7 deseni KALIR) ← library_grants okur
kullanım: gateway her araç çağrısında profil kontrol + library_usage_log satırı (asenkron, kuyruk)
görünüm: v_library_catalog → Library sayfası (Intelligence grubu) → öğe detayı → drill-down
```

## 4. Veri modeli (madde 13 alan eşlemesi + kayıtlı ekler)

| Direktif alanı | Karşılık |
|----------------|----------|
| Sahibi | `owner_employee_id uuid REFERENCES agents(id)` — **kayıtlı ek** (4.5'te yoktu) |
| Departmanı | `owner_dept` (mevcut) |
| Versiyonu | `version` (mevcut) |
| Kullanım alanı | `usage_notes` (mevcut) |
| Bağımlılıkları | `dependencies text[]` (mevcut) |
| Erişim yetkisi | `library_grants` (mevcut; grantee: department/employee/role_level) |
| Son güncelleme | `updated_at` (mevcut) |
| Kullanım geçmişi | **kayıtlı ek** `library_usage_log` (aşağıda) |
| Kalite puanı | `quality_score` (mevcut) |
| Review durumu | `review_status` (mevcut) |
| Değişiklik geçmişi | **kayıtlı ek** `library_change_log` (aşağıda) |

```sql
-- 0024x ailesine ek (Dalga 4 kapanışında DATA_MODEL'e işlenir)
ALTER TABLE library_items ADD COLUMN owner_employee_id uuid REFERENCES agents(id);

CREATE TABLE library_usage_log (             -- append-only
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  used_by uuid REFERENCES agents(id),
  run_id uuid REFERENCES agent_runs(id),
  used_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE library_change_log (            -- append-only
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  changed_by text NOT NULL,
  change jsonb NOT NULL,                     -- {field, old, new} listesi
  changed_at timestamptz NOT NULL DEFAULT now()
);
```

## 5. Component yapısı / 6. Backend yapısı

- Kayıt fn ailesi: `control_library_{register_item,update_item,grant,revoke_grant}` — update her seferinde change_log satırı üretir (fn içi, atlanamaz).
- Profil derleyici: mevcut registry→profil üretim yolu (Phase 7, 14 profil) KALIR; girdisine `library_grants` eklenir — derleme çıktısı değişince profil dosyaları yeniden yazılır + `system` kanalına olay.
- Usage log yazıcı: gateway çağrı yolunda asenkron (pg-boss `library.usage` job; ana çağrıyı BLOKLAMAZ, kayıp tek-satır tolere edilir — sayaçtır, audit değildir).

## 7. Frontend yapısı

Library sayfası: kind-gruplu katalog (20 tür; boş türler görünür ama "0 kayıt" — sahte doluluk YOK) → öğe kartı (11 alan) → sekmeler: Kullanım (usage_log trend), Erişim (grant listesi + ekle/kaldır), Geçmiş (change_log), Bağımlılıklar (grafik değil liste — v1). Grant düzenleme CEO Control Mode yüzeyinde.

## 8. API'ler

[[API_CONTRACTS]] 8b `library` alanı (register_item, update_item, grant, revoke_grant) + okuma `v_library_catalog`. Ajan-içi: ajanlar kataloğu SORGULAYABİLİR (kendi grant kapsamını — "elimde hangi yetenekler var"), grant DEĞİŞTİREMEZ.

## 9. Event yapısı

Kanal eklenmez; grant/kayıt değişimleri `settings` kanalı üzerinden `library_item.changed`, `library_grant.changed` type'larıyla yayınlanır (EVENT_MODEL §9b settings kanalı kapsam notu olarak işlenir — kayıtlı ek). Profil yeniden-derlemesi `system` kanalına.

## 10. State yönetimi

Katalog durumu tamamen DB'de; profil dosyaları türetilmiş artefakttır (yeniden üretilebilir — kaynak gerçek DB). UI filtre/görünüm tercihi client state.

## 11. Database tabloları / 12. İlişkiler

`library_items` (+owner_employee_id), `library_grants`, `library_usage_log`, `library_change_log`. İlişkiler: items 1─n grants/usage/change; items n─1 agents (sahip); usage n─1 agent_runs (drill-down: "bu skill'i en çok kim kullandı → hangi koşularda").

## 13. Yetkilendirme

- Kayıt/grant mutasyonu: yalnız CEO (control seam). HR onboarding otomasyonu istisnası: yeni çalışana rol-standart grant seti `role_level` grantee'siyle ZATEN kuruludur — kişi-başı otomatik grant açılmaz (HR fn'i sadece role_level ataması yapar; [[HR_OPERATING_SYSTEM_SPEC]] ekipman adımı buna dayanır).
- Fiili yaptırım noktası MCP gateway'dir (profil derlemesi); UI listesi bilgilendirme katmanıdır — [[PERMISSION_MODEL]] dört-katman matrisinde katman sırası korunur.

## 14. Logging / 15. Audit

change_log = alan-düzeyi fark (append-only, UPDATE/DELETE grant'i yok); usage_log = sayaç. Üst-düzey audit: her control_library_* çağrısı audit_log satırı (`detail_ref` → library_change_log id).

## 16. Security

Öğe gövdesi (skill/prompt içeriği) DB'de DEĞİL — kaynak konumu referanslıdır (repo yolu / paket adı / MCP grup adı); library META kayıttır. Gerekçe: secret sızıntı yüzeyini büyütmemek + git zaten içerik sürümlüyor. Madde 4: yeni erişim bürokrasisi yok — grant modeli mevcut profil mekanizmasının kayda bağlanmasıdır.

## 17. Error handling / 18. Retry / 19. Fallback

- Profil derleme hatası: eski profil seti YÜRÜRLÜKTE kalır (atomik yazım: yeni set tamamen üretilmeden eskisi değişmez); hata `alerts` kanalına.
- Usage job kaybı: tolere (sayaç); birikimli tutarsızlık haftalık mutabakat sorgusuyla raporlanır.
- Grant çakışması (aynı öğe hem employee hem role_level grant'li): İZİN VERİCİ birleşim (union) — çakışma hatası yok, kural PERMISSION_MODEL'de aynı.

## 20. Test planı / 21. Acceptance criteria

- Fn testleri: update→change_log satırı; grant→profil derleme tetiklenir (mock); revoke→profilden düşer.
- Kabul: intake sonrası katalogda ≥1 kayıt bulunan türler: skill, plugin, tool, mcp, persona, policy, sop, research, report, memory_source (mevcut varlık gerçeği); CEO bir çalışandan skill grant'ini kaldırır → o çalışanın profili yeniden derlenir → gateway çağrısı reddedilir (uçtan uca kanıt).

## 22. Migration planı / 23. Rollback planı

0024x ailesi + bu spec'in ekleri (owner kolonu + 2 log tablosu — aynı aile numarasında ek migration `0024x-b`). Rollback: ek tablolar DROP, kolon DROP; profil derleyici grant girdisi yoksa mevcut registry davranışına düşer (geriye uyumlu).

## 24. Uygulama sırası (doğrulamalı)

```bash
supabase db push && psql "$DB" -c "\dt library_*"                    # → items, grants, usage_log, change_log
node scripts/library/intake.mjs --dry-run                            # → keşfedilen varlık sayısı raporu (intake script'i execution'da yazılır)
psql "$DB" -c "SELECT kind, count(*) FROM library_items GROUP BY kind ORDER BY 2 DESC;"  # → tür dağılımı
curl -s -X POST localhost:3000/api/control/library -H "Idempotency-Key: $(uuidgen)" -H "Cookie: $CEO_SESSION" \
  -d '{"action":"grant","payload":{"item_id":"...","grantee_kind":"department","grantee_id":"..."}}'   # → {"ok":true,...}
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: 0024x, MCP gateway profil üretimi (Phase 7 canlı), agent_runs (usage köprüsü).
- Risk: intake'in dağınık kaynakları eksik taraması → intake raporu CEO'ya tür-başı sayımla sunulur, "0 kayıt" türler açıkça listelenir (sessiz eksik yok).
- Edge: aynı yeteneğin iki sürümü aktif (v1 skill + v2 skill) → `UNIQUE(kind,name,version)` izin verir, grant sürüm-özel; sahibi arşivlenen öğe → owner `archived` işaretli kalır, HR devir önerisi üretir; kind listesi genişletme → enum CHECK değişikliği = migration + bu spec'e satır (⛔ değil, kayıtlı ek yeter); persona kayıtları ↔ personas tablosu çakışması → library'deki `kind='persona'` satırı personas tablosuna REFERANStIR (meta), gövde personas'ta (tek kaynak).

## Registered adaptations (E9.5 execution, 2026-07-14 — CEO-visible; no silent deviation)

- **A1 single-door seam:** §5's `control_library_{register_item,update_item,grant,revoke_grant}` family landed as ONE `control_library_action(p_payload, p_idempotency_key)` with `action` discriminator — the E9.1/E9.3/E9.4 control-seam idiom (idempotency twin, audit row, §13 CEO wall in one place). API_CONTRACTS 8b op list unchanged.
- **A2 expires_at:** `library_grants.expires_at timestamptz` added (PERMISSION_MODEL edge line 141 assigned it to 0024x, which shipped without it — spec-gap fixed here). Expired grants are dead everywhere: catalog view count, layer reader, profile compiler.
- **A3 source_ref:** `library_items.source_ref text` added — §16 mandates a source-location reference but §4 had no field for it. Intake fills it (repo path / package path / `~/.claude` path).
- **A4 compiler semantics:** subject's granted set = PERMISSIVE UNION (employee ∪ department ∪ role_level, §19); applied as INTERSECTION onto the policy profile (PERMISSION_MODEL G2 — library can narrow, never widen). Subject PRESENT in the layer = record governs (empty set = deny-all); subject with ZERO grants = registry behavior unchanged (§22 backward compatibility). Employees holding employee-kind grants get `<slug>.employee.mcp.json` overlay profiles (= dept surface ∩ their union).
- **A5 skills/plugins enforcement key:** granted skill/plugin items compile into a `_skills` allowlist in the same profile files (same filter-before-discovery resolution model as `_tools`); §21's "skill grant revoked → gateway refusal" is proven through it.
- **A6 recompile vehicle:** a Postgres fn cannot reach pg-boss (E9.1 A1 emsal) → scheduler self-chain `library.profile_recompile` (30 s) regenerates against the live record, swaps files only on source-hash change (staged dir + last-stamped manifest = §17 atomic rule) and emits `profile.recompiled` on the `system` channel only when changed.
- **A7 usage counter path:** §6 wrote a pg-boss `library.usage` hop for asynchrony; that property is already provided by the E8.1 observability batch buffer (tool_calls writes never block the agent), so the counter rides an AFTER INSERT trigger on `tool_calls` (errors swallowed — counter, not audit). Weekly reconciliation report stays a P7 job.
- **A8 intake actor:** §13 keeps mutations CEO-only; `scripts/library/intake.mjs` runs inside CEO context (jwt claims set in its transaction — E9.4 dogfood emsal), so every registration flows through the control fn with actor=ceo audit + change_log rows. Conservative update rule: intake only NULL-fills existing rows, never overwrites curated metadata.
- **Found+fixed in-pass:** Phase-7 policy files (`packages/gateway/policy/*.json`) still referenced the pre-E5.x department registry (research/legal-de/specialized/support/testing) — the profile generator failed against the live table. Re-keyed to the 21 live departments with NO privilege widening (classes moved with their function: finance=payments, legal=docusign, engineering=code MCPs, design=stitch; tightening additions only). Stale dept profile files are now cleaned by the compiler swap.
- **A9 knowledge-shelf gate (R4.2, 2026-07-17):** the roadmap R4.2 rule "no research without report, no report without registration" is enforced at the POST-TASK hook gate, not in this module's UI: policy row `std.knowledge_shelf` (filed under standard 16 — a research delivery not on the shelf is an incomplete delivery; halal-screen precedent for filing under an existing 1..17 standard) + `library_registration` check in `packages/hook/src/post-task.ts`. Identification is contract-based (`rule.match_field`/`rule.pattern`, default `\b(research|araştırma)` — no trailing `\b`: Turkish suffixed forms must match). A research-marked task must carry a file-kind evidence artifact (the report) or the gate returns REVISE; the gate then registers the artifact itself as a `kind='research'` row through `control_library_action` under the A8 CEO standing-order context (`packages/hook/src/knowledge-shelf.ts`; md5(source_ref) idempotency, name-collision retry with deterministic version suffix). §13's CEO-only wall is preserved — the gate executes the CEO's codified standing rule, actor=ceo audit + change_log rows. Tests: `tests/r42/knowledge-shelf.test.ts`.
- **R4.2 enrichment pass (2026-07-17, measured):** metadata depth closed via `scripts/library/enrich.mjs` (intake idiom: control-fn writes, CEO context, md5 idempotency) — owner_dept 208→438 (custody map in `.planning/research/R4.2-LIBRARY-GAP-MATRIX.md` §4), quality_score 0→438 (deterministic formula, §3 of the report), review_status 0→423 real values (418 approved / 5 needs_review; 15 archived preserved). Core grant package v1: 21 departments × 8 dxb-mcp group items = 168 grants — an IDENTITY MIRROR of the enforced policy surface (post-recompile diff: 21/21 dept `_tools` byte-identical, `_skills:[]` keys appear = honest zero-skill record). Per-department narrowing is a registered FOLLOW-UP (gap report G-7: derive minimal sets from usage actuals; policy-file decision, CEO-visible), never a silent write. Persona items are deliberately NOT granted (custody ≠ capability; compiler reads only tool/mcp/skill/plugin). Skill/plugin items are deliberately NOT granted (build-layer assets; `_skills` consumed nowhere at runtime — measured; grants follow reality when runtime skills ship).

## Opus-devralma notu

Şema + fn aile deseni + profil derleme entegrasyon noktası kapalıdır; Opus'un işi intake script'i + Library sayfası + derleyici girdi eki — hepsi desen kopyasıdır. ⛔ kritik karar: grant modelinin yaptırım noktasını gateway dışına taşımak — en güçlü model + CEO onayı.

## Done definition (bu spec)

27 başlık ✓ · madde 13'ün 20 türü (DATA_MODEL enum birebir) + 11 alanı eşlendi (3 kayıtlı ek dahil) ✓ · grant→profil fiili yaptırım zinciri ✓ · intake gerçek-envanter kuralı ✓ · append-only log ayrımı (audit vs sayaç) ✓ · doğrulama komutları ✓ · Opus-devralma + ⛔ ✓
