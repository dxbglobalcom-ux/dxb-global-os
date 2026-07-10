# FABLE_5_HOOK_SPEC — FABLE 5 INTELLIGENCE & DISCIPLINE HOOK

> Dalga 3 · Yazar: Fable 5 bizzat · Kaynak hüküm: madde 7 birebir ("bu hook yalnızca bir prompt olmamalıdır")
> Üst: [[SYSTEM_ARCHITECTURE]] (R6) · Kardeşler: [[AGENT_ORCHESTRATION_SPEC]] (çağrı noktaları), [[EMPLOYEE_PERSONA_STANDARD]] (hook bağlantısı), [[HR_OPERATING_SYSTEM_SPEC]] (otomatik donanım)

## 1. Amaç

Holding'deki HER ajan — hangi temel modeli kullanırsa kullansın — Fable 5'in tanımladığı merkezi çalışma standardına bağlanır. Hook = `packages/hook` kütüphanesi: ajan spawn yolunu saran policy motoru. Prompt değil, YÜRÜTME KATMANI: pre-task gate, post-task gate, koşu-içi kurallar, ihlal kaydı, escalation.

## 2. Gereksinimler — madde 7'nin 17 standardı (normatif eşleme)

| # | Standart (direktif birebir) | Uygulama mekanizması |
|---|------------------------------|----------------------|
| 1 | Görevi tam anlama | Pre-gate: görev tanımı + kabul kriteri eksikse spawn RED (`missing_acceptance`) |
| 2 | Yüzeysel cevap vermeme | Post-gate: çıktı-kabul eşlemesi denetimi (aşağıda §7 kalite kapısı) |
| 3 | Eksik plan yapmama | Pre-gate: `plan_required=true` görevlerde plan adımı kanıtı (decision_log satırı) |
| 4 | Tembellik yapmama | Post-gate: kabul kriterlerinin her maddesine çıktı karşılığı |
| 5 | Gereksiz token tüketmeme | Koşu kuralı: token bütçesi run başına (settings); aşım uyarı → hard-stop COST_CONTROL |
| 6 | Sebepsiz devir yapmama | Spawn kuralı: sub-agent açılışında gerekçe zorunlu; derinlik limiti (ORCHESTRATION §6) |
| 7 | Kanıtsız sonuç üretmeme | Post-gate: "done" iddiası doğrulama kanıtı ister (Evidence-Before-Done — ürünleşmiş hali) |
| 8 | Eksik teslim yapmama | Post-gate: çıktı şeması (görev tipine göre) doğrulanır |
| 9 | Kalite kontrolsüz tamam saymama | Post-gate geçilmeden run `succeeded` OLAMAZ (runner kilidi — ORCHESTRATION §13) |
| 10 | Görev bağlamını kaybetmeme | Koşu kuralı: context özeti eşiği; kayıpta memory-router'dan yeniden yükleme |
| 11 | Holding hedefleriyle çelişmeme | Pre-gate: görev-proje bağı (`tasks.project_id`) + proje amacı enjekte edilir |
| 12 | Yetki sınırlarını ihlal etmeme | Pre-gate: MCP profil + tool grant kontrolü (PERMISSION_MODEL matrisi) |
| 13 | Gerekli escalation'ı yapma | Koşu kuralı: `policy` reddi/`confidence < eşik` → escalation zinciri (§7) |
| 14 | Önemli karar gerekçesi kaydetme | decision_log `rationale NOT NULL` (OBSERVABILITY şeması zaten zorlar) |
| 15 | Yapılan işi doğrulama | Post-gate: doğrulama komutu koşuldu mu (tool_calls'ta kanıt) |
| 16 | Çıktı-talep uygunluğu kontrolü | Post-gate: kabul kriteri eşlemesi (standart 4 ile aynı denetim, çıktı yönü) |
| 17 | Sistem hafızasına doğru kayıt | Post-gate: memory yazımı görev tipi gerektiriyorsa kanıtı; yanlış-kayıt HR hata sicili |

Madde 7'nin 12 uygulama katmanı (system policy, governance, pre/post validation, quality gates, review/logging/escalation/cost-control/security/memory/audit hooks) yukarıdaki mekanizmalara şöyle dağılır: policy+governance = kural seti (§4); pre/post validation + quality gate = §6-7; review hook = post-gate revizyon turu; logging/audit = OBSERVABILITY/audit_log entegre; escalation = §7; cost-control = COST_CONTROL bağı; security = PERMISSION bağı; memory hook = standart 10+17.

## 3. Mimari

```
orchestrator.dispatch
  └─ hook.preTask(ctx)  ── kural seti (DB'den) ──→ PASS | REJECT(reason)
       ctx: {employee, persona_version, task, project, grants, budget, settings}
  └─ [SDK koşusu — koşu-içi kurallar runner'a enjekte: token bütçe, spawn kuralı, context eşiği]
  └─ hook.postTask(output, evidence) ──→ PASS | REVISE(feedback) | ESCALATE(chain)
```

Mevcut-varlık eşlemesi: `packages/hook` YENİ (kütüphane — resident servis DEĞİL, R5); kural seti DB'de YENİ (aşağıda); system-prompt derleme (persona + hook standartları metni) HR persona derleyicisiyle ORTAK (EMPLOYEE_PERSONA_STANDARD §6); runner çağrı noktaları ORCHESTRATION §3'te sabit.

## 4. Veri modeli

```sql
-- 0022x içinde (görünürlük ailesiyle; hook ihlali görünürlük verisidir)
CREATE TABLE hook_policies (
  id text PRIMARY KEY,                  -- örn 'std.no_unverified_done'
  standard_no int NOT NULL CHECK (standard_no BETWEEN 1 AND 17),
  gate text NOT NULL CHECK (gate IN ('pre','runtime','post')),
  rule jsonb NOT NULL,                  -- makine-okur kural parametreleri
  severity text NOT NULL DEFAULT 'block' CHECK (severity IN ('block','warn')),
  enabled boolean NOT NULL DEFAULT true,
  version int NOT NULL DEFAULT 1
);

CREATE TABLE hook_violations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id uuid REFERENCES agent_runs(id),
  policy_id text NOT NULL REFERENCES hook_policies(id),
  gate text NOT NULL,
  detail text NOT NULL,
  action_taken text NOT NULL CHECK (action_taken IN ('rejected','revised','escalated','warned')),
  created_at timestamptz NOT NULL DEFAULT now()
);
```

`agents.hook_version` (DATA_MODEL 4.1) = çalışanın bağlandığı hook sürümü; sürüm artışında HR yeniden-bağlama akışı (madde 9 entegrasyonu). `hook_violations` append-only; HR performans/hata sicilinin otomatik girdisi.

## 5. Component yapısı

| Component | Konum | Etiket |
|-----------|-------|--------|
| `packages/hook` (policy yükleyici + gate motoru + prompt derleyici katkısı) | yeni paket | YENİ |
| `hook_policies` seed (17 standart × varsayılan kurallar) | migration 0022x seed | YENİ |
| Hook status UI (çalışan kartındaki "Fable 5 Hook status" alanı — §16) | employee command page içinde | SIFIRDAN |
| İhlal akışı UI | `(command)/gov/violations` | SIFIRDAN |

## 6. Backend yapısı — gate'ler

- **preTask:** kural sırası: yetki (std 12) → görev tamlığı (std 1,3) → bütçe uygunluğu (std 5, COST_CONTROL sorgusu) → proje bağı (std 11) → persona kalite kapısı (`passed` değilse spawn RED — EMPLOYEE_PERSONA kuralı). Herhangi `block` reddi: run hiç doğmaz, task `failed(policy)`, ihlal satırı + alert.
- **runtime:** runner'a enjekte edilen sınırlar (token bütçe sayacı, spawn gerekçe zorunluluğu, context eşiği) — hook kütüphanesi sınır İZLER, kesme kararını runner uygular (tek kesme otoritesi — çift beyin yok).
- **postTask:** kanıt paketi `{output, evidence[], acceptance_map}` üzerinden: her kabul kriterine karşılık (std 4,16), doğrulama komutu kanıtı (std 7,15), çıktı şeması (std 8), memory kaydı (std 17). Sonuç: PASS → run kapanır; REVISE → geri bildirimle revizyon turu (limit ORCHESTRATION §19); ESCALATE → §7.
- Denetim maliyeti ilkesi: post-gate denetimlerinin çoğu MEKANİKTİR (satır var/yok, şema uyar/uymaz — LLM çağrısı yok). Örneklem tabanlı derin kalite denetimi (çıktının gerçek kalitesi) HR review görevi olarak AYRI koşuda yapılır (madde 9) — hook her koşuya LLM-denetçi bindirmez (token disiplini).

## 7. Escalation zinciri

`çalışan → müdürü (department director) → orchestrator → CEO (alert 'high' + approval öğesi)`. Her sıçrama decision_log'a; zincir `settings 'hook.escalation_chain'` ile departman bazında özelleştirilebilir. Escalation SONUÇ üretmek zorunda: açık escalation 24s cevapsız kalırsa alert `critical` (kaybolmuş sorumluluk = ihlal).

## 8. API'ler / 9. Event yapısı / 10. State yönetimi

- Hook kütüphane API'si (TS): `loadPolicies(ctx)`, `preTask(ctx)`, `runtimeLimits(ctx)`, `postTask(ctx, result)` — saf fonksiyonlar, durum DB'de.
- Event: ihlaller `alerts` kanalına (severity eşlemesiyle); `run.finished` payload'ında `hook_result` alanı (ops:live — Live Operations rozet gösterimi).
- Policy cache: process-içi 60sn TTL; `settings` Broadcast'ı `hook_policies` değişiminde cache düşürür (SETTINGS deseniyle aynı).

## 11. Database tabloları / 12. İlişkiler

§4 DDL. İlişkiler: `hook_violations n─1 agent_runs`, `n─1 hook_policies`; HR sicil bağı: `employee_records.error_history` beslenir (HR job'ı günlük toplar — çift yazım değil, türetim).

## 13. Yetkilendirme

Policy düzenleme: yalnız CEO (control-plane fn `fn_hook_set_policy` — settings seamiyle aynı desen, audit'li). `severity='block'` politikayı `warn`a düşürmek `risk='high'` ayar değişimidir (Live Impact Preview gösterir — SETTINGS_AND_CONTROL). Hook'u çalışan bazında KAPATMAK YOKTUR — devre dışı bırakma yalnız policy bazında ve global (kısmi hook'suz çalışan = madde 7 ihlali).

## 14. Logging / 15. Audit

Gate kararları (PASS dahil, özet sayaçla) run kapanışında `agent_runs`'a; ihlaller `hook_violations` + `audit_log` (policy değişimleri). "Hook neden reddetti" her zaman UI'dan okunabilir (detail insan-okur, TR/EN).

## 16. Security

Hook güvenlik kapısı DEĞİL güvenlik TAMAMLAYICISIDIR: yetki gerçeği PERMISSION_MODEL + MCP profillerinde; hook bunları spawn öncesi OKUR ve erken reddeder (derin savunma). Para-çıkışı yolu hook'tan bağımsız DOKUNULMAZ (approval kapısı).

## 17. Error handling / 18. Retry / 19. Fallback

Hook motoru hatası (policy yüklenemedi, DB erişilemez): **fail-closed** — spawn durur, alert `critical`. Gerekçe: hook'suz koşu = kayıt-dışı standart-dışı iş; kuyruk bekler, iş kaybolmaz (pg-boss). Policy JSON'u bozuksa o policy atlanmaz, gate reddeder (`invalid_policy` ihlali) — sessiz devre dışı kalma yok.

## 20. Test planı

- Birim: 17 standardın her mekanizması için en az 1 RED + 1 PASS vakası (34 vaka tabanı).
- Entegrasyon: kanıtsız "done" iddiası → REVISE; revizyon limiti aşımı → ESCALATE → müdür decision_log satırı.
- Fail-closed: DB kesintisi simülasyonu → spawn yok + alert; kuyruk birikimi sonrası otomatik akış.

## 21. Acceptance criteria

- Her aktif çalışan kartında hook status dolu (`hook_version` NULL olan aktif çalışan sayısı = 0 — SQL kanıt).
- Kanıtsız tamamlama post-gate'ten geçemez: test ajanına doğrulamasız çıktı verdirilir → run `succeeded` OLMAZ, ihlal satırı düşer.
- 17 standardın tamamı `hook_policies` seed'inde en az bir kuralla karşılanmış: `SELECT count(DISTINCT standard_no) FROM hook_policies` → 17.

## 22. Migration planı / 23. Rollback planı

0022x: 2 tablo + seed + `fn_hook_set_policy`. Rollback: tablolar DROP; `packages/hook` çağrıları feature-flag `settings 'hook.enabled'` arkasında — flag kapalıyken dispatch eski yoldan akar (kademeli geçiş ORCHESTRATION §23 ile aynı flag ailesi). Flag kapalı dönem geçicidir ve alert'lidir (hook'suz üretim kalıcı durum OLAMAZ).

## 24. Uygulama sırası (adım-başı doğrulama)

```bash
# 1. tablolar + seed
psql "$DB" -c "SELECT count(*) FROM hook_policies;"                    # → ≥17
psql "$DB" -c "SELECT count(DISTINCT standard_no) FROM hook_policies;" # → 17
# 2. paket birimi
pnpm --filter hook test                                                 # → yeşil (≥34 vaka)
# 3. entegrasyon: kanıtsız done reddi
pnpm --filter orchestrator test -- --grep "post-gate evidence"          # → yeşil
# 4. fail-closed kanıtı (test DB'si düşürülür)
pnpm --filter hook test -- --grep "fail-closed"                         # → spawn reject assert
```

## 25. Bağımlılıklar

0022x (observability ailesi — run_id FK) · settings ailesi (0021x — eşik ayarları) · PERMISSION_MODEL matrisi (pre-gate yetki okuması) · EMPLOYEE_PERSONA kalite kapısı alanı. Paket bağımlılığı: yalnız `packages/shared` (yeni dış bağımlılık YOK).

## 26. Riskler / 27. Edge case'ler

- Risk: post-gate mekanik denetimi kanıt-şekilciliğine kayar (kanıt var ama anlamsız) — panzehir: HR örneklem derin denetimi + ihlal istatistiği trendi (gov/violations ekranı).
- Risk: policy seti şişer, spawn gecikir — bütçe: pre-gate < 100ms (DB tek sorgu + cache); ölçüm health snapshot'ta.
- Edge: hook sürümü yükselirken koşan run'lar (eski sürümle biter — `agent_runs` başlangıç sürümünü taşır); CEO'nun kendisi standart-dışı iş isterse (hook CEO emrini engellemez, `warn` + audit ile kayıt altına alır — tek insan otoritesi ilkesi); iki policy çelişirse (en kısıtlayıcı kazanır + alert `medium` çelişki kaydı).

## Done definition (bu spec)

27 başlık ✓ · 17 standart → mekanizma eşleme tablosu (normatif) ✓ · 12 uygulama katmanı dağılımı ✓ · fail-closed ilkesi ✓ · token-disiplinli denetim ilkesi (mekanik post-gate + örneklem HR) ✓ · KALIR/YENİ eşleme ✓ · doğrulama komutları ✓ · Opus-devralma: DDL + seed listesi + gate sırası kopyala-uygula düzeyinde ✓
