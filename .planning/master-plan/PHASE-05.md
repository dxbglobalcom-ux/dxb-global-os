# PHASE 05 — Kernel & Orchestrator Core Loop

**Req:** KERN-01/02, ORCH-01/02/03/04, CNCL-01
**Bağımlılık:** Phase 4 (raylar canlı — bu döngü ilk otonom loop'tur, rayları hazır bulmak ZORUNDA)
**Exit gate:** intent → kernel → worker → QA → approval → kayıtlı sonuç dikey dilimi **10/10 tekrarda** geçer (I9).

## 1. Hedef + Kabul Kapısı

1. CEO intent söyler (şimdilik CLI: `dxb intent "<metin>"`); kernel sınıflandırır, departman/ajan/skill seçer — CEO asla araç adı vermez
2. Routing politikası VERİDİR (`routing_rules` tablosu): kural değişikliği kod dokunmadan routing'i değiştirir — testle kanıtlanır
3. Orchestrator intent'i bağımlı TaskEnvelope'lara böler, kuyruğa yazar, head'lere dispatch eder; sub-agent'lar izole (I3: kuyruk + typed artifact, serbest sohbet yok)
4. Model tier'ı görev sınıfına brain map'ten seçilir; escalation ladder kodda çalışır (worker 2× fail veya düşük güven → specialist → head → Fable final); council yalnız kritik kapılarda, judge gücü golden set'le doğrulanmış
5. Dikey dilim 10/10

## 2. LOCKED Mimari Kararlar

| Karar | Gerekçe |
|---|---|
| Routing politikası `routing_rules` DB tablosu; repo'da seed JSON (`packages/kernel/policy/routing-seed.json`) — kod içinde kural YOK | KERN-02; dashboard Phase 8'de aynı tabloyu düzenler |
| Kernel = Agent SDK programı; sınıflandırma çıktısı Zod-şemalı `ClassifiedIntent` — serbest metin karar YOK | Deterministik seam; test edilebilir |
| Orchestrator TypeScript süreç; LLM yalnız decompose/qa çağrılarında — kontrol akışı kodda | Anti-Pattern: LLM'e kontrol akışı devri |
| Görev bağımlılığı: `depends_on uuid[]` (migration 0008); claim yalnız bağımlılıkları done olan görevleri verir | ORCH-01 "dependent TaskEnvelopes" |
| Escalation sayaçları task_events'ten türetilir — ayrı sayaç tablosu YOK | Tek gerçek kaynak; event log zaten var |
| Council in-house: N paralel ucuz model + 1 judge; YALNIZ `approval_class='outward'` VEYA `model_tier='L1'` görev sonuçlarında | CNCL-01 + maliyet (N+1 çağrı) |
| Derin zincir sınırı: aktif hop ≤3 çoğu görevde (head→specialist→worker); 5 katman yalnız gerçekten karmaşık işte | Pitfall: 6 hop × %95 ≈ %74 |
| Dikey dilim görevi: "tek marka ürün listeleme taslağı" (Outleteuro P11 öncüsü) — dışa DÖNMEYEN, outbox'u test.write_file'la kapanan | Pitfall 1'in önerdiği doğal dilim |

## 3. Dosya-Seviyesi Spec

```
db/migrations/0008_routing_and_deps.sql   # routing_rules + tasks.depends_on
packages/kernel/src/classify.ts           # intent → ClassifiedIntent (Agent SDK çağrısı)
packages/kernel/src/policy.ts             # routing_rules okuma + eşleme motoru
packages/orchestrator/src/decompose.ts    # ClassifiedIntent → TaskEnvelope[] (LLM + Zod)
packages/orchestrator/src/dispatch.ts     # kuyruk yazımı + head bildirimi
packages/orchestrator/src/escalate.ts     # ladder: events'ten fail sayımı → tier yükseltme
packages/orchestrator/src/council.ts      # N+1 council + judge
packages/orchestrator/src/qa.ts           # tek güçlü model default QA
tools/dxb-cli/src/intent.ts               # `dxb intent "<metin>"`
packages/kernel/policy/routing-seed.json  # §10 brain map satırları
tests/phase5/{routing-data,ladder,council-judge,slice-10of10}.test.ts
```

### 0008_routing_and_deps.sql (birebir — LOCKED)

```sql
CREATE TABLE routing_rules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_class  text NOT NULL,        -- 'strategy'|'architecture'|'code.standard'|'code.bulk'
                                    -- |'research.fanout'|'content.outbound'|'summarize'|'orchestration'
  match       jsonb NOT NULL DEFAULT '{}'::jsonb,  -- ileri eşleme alanları (dept, keyword...)
  model_tier  text NOT NULL CHECK (model_tier IN ('L1','L2','L3','L4')),
  model       text NOT NULL,        -- 'fable-5'|'opus-4.8'|'sonnet-5'|'codex-5.5'|'glm-5.2'|...
  mode        text NOT NULL CHECK (mode IN ('subscription','api','free-tier')),
  effort      text NOT NULL DEFAULT 'medium' CHECK (effort IN ('low','medium','high','max')),
  needs_council boolean NOT NULL DEFAULT false,
  priority    integer NOT NULL DEFAULT 0,     -- eşleşme sırası (yüksek önce)
  enabled     boolean NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE routing_rules ENABLE ROW LEVEL SECURITY;

ALTER TABLE tasks ADD COLUMN depends_on uuid[] NOT NULL DEFAULT '{}';

-- claim artık bağımlılık gözetir (0001'deki fonksiyonun yerine geçer)
CREATE OR REPLACE FUNCTION claim_next_task(
  p_worker_id text, p_departments text[], p_lease_seconds integer DEFAULT 900
) RETURNS SETOF tasks AS $$
  UPDATE tasks SET
    status = 'claimed', claimed_by = p_worker_id, claimed_at = now(),
    lease_expires_at = now() + make_interval(secs => p_lease_seconds),
    updated_at = now()
  WHERE id = (
    SELECT t.id FROM tasks t
    WHERE t.status = 'queued' AND t.department = ANY(p_departments)
      AND NOT EXISTS (SELECT 1 FROM tasks d
                      WHERE d.id = ANY(t.depends_on) AND d.status <> 'done')
    ORDER BY t.priority DESC, t.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING *;
$$ LANGUAGE sql;
```

Seed satırları (routing-seed.json → tablo; §10 brain map birebir):
`strategy/architecture/final-approval → L1 fable-5 subscription max, needs_council=true` · `orchestration/decompose/code-review → L1 opus-4.8 subscription medium-high` · `dept-head planning → L2 sonnet-5 subscription` · `code.standard → L3 codex-5.5|sonnet-5` · `code.bulk → L3 kimi-2.7|glm-5.2 api` · `summarize/ingest → L4 deepseek-v4|minimax-3 api low` · `research.fanout → L4 qwen/deepseek api; sentez sonnet-5` · `content.outbound → L4 draft + humanizer + sonnet-5 polish, needs_council=true`.

### ClassifiedIntent + escalation (arayüz — LOCKED)

```typescript
export const ClassifiedIntent = z.object({
  intent_summary: z.string(),
  task_class: z.string(),                       // routing_rules.task_class'a eşlenir
  departments: z.array(z.string()).min(1),
  approval_class: z.enum(["none","internal","outward"]),
  complexity: z.enum(["single","multi"]),       // multi → decompose çağrısı
});

// escalate.ts kuralı (kod, LLM değil):
// fail_count(task) = task_events WHERE event='transition' AND to_status='failed'
// 0→ilk atama tier'ı | 1→aynı tier retry | 2→specialist (bir üst tier) | 3→head review (L2)
// 4→Fable final (L1) | Fable de çözemezse → CEO'ya 'blocked' raporu (asla sessiz düşme)
// low-confidence: worker sonucu {confidence<0.6} bildirirse fail sayılır
```

### Council (CNCL-01 — LOCKED davranış)

`council.ts`: `producers = [glm-5.2, kimi-2.7, qwen-3.6]` paralel; `judge = sonnet-5` (varsayılan) yalnız üretici çıktılarının karşılaştırmalı değerlendirmesini yapar, kendi cevap ÜRETMEZ (bias azaltımı). Golden set: `tests/phase5/golden/` içinde 10 bilinen-cevaplı görev; judge'ın doğru üreticiyi seçme oranı ≥8/10 değilse judge modeli yükseltilir (→opus) ve test tekrarlanır — judge güç doğrulaması budur. Council çağrısı cost_ledger'a `meta.council=true` ile yazılır.

## 4. Adım Listesi (adım = commit)

| # | Adım | Doğrulama |
|---|---|---|
| 1 | Faz toolset study→install (Agent SDK 0.3.201 pin) | study card + `pnpm ls @anthropic-ai/claude-agent-sdk` pin eşleşir |
| 2 | 0008 migration + seed | `supabase db reset`; `SELECT count(*) FROM routing_rules` ≥ 8 |
| 3 | kernel/classify.ts + policy.ts | unit: 5 örnek intent → beklenen task_class/dept; policy satırı UPDATE → aynı intent farklı model (KERN-02 kanıtı) |
| 4 | orchestrator/decompose.ts | multi intent → ≥2 envelope, depends_on zinciri doğru; hepsi Zod geçer |
| 5 | dispatch + worker shim (claim→çalış→transition) | tek envelope uçtan uca done; task_events zinciri tam |
| 6 | escalate.ts | testte worker 2× fail → üçüncü claim üst tier'da (events kanıtı) |
| 7 | qa.ts + council.ts + golden set | judge ≥8/10 golden; council yalnız outward/L1'de tetiklendi (negatif test: normal görevde council çağrısı YOK) |
| 8 | `dxb intent` CLI | `dxb intent "tek marka X için listeleme taslağı hazırla"` → görev zinciri kuyruğa düştü |
| 9 | Dikey dilim betiği | `tests/phase5/slice-10of10.sh`: intent→…→approval(test.write_file)→done, 10 tekrar, exit 0 |
| 10 | Faz kapanışı | 10/10 çıktısı VERIFICATION.md'de satır satır |

## 5. Risk + Fallback

- **LLM decompose kalitesizliği (envelope'lar muğlak):** envelope Zod min-uzunlukları + orchestrator'da "self-contained lint" (objective içinde 'yukarıda/önceki' göndermesi → red). Kalıcı sorunsa decompose modeli tier yükselt (routing_rules satırı — kod değişmez).
- **Ladder sonsuz döngüsü:** fail_count monotonik; 4'ten sonra HARD stop → blocked raporu. Test 6 bunu içerir.
- **Council maliyeti:** needs_council yalnız 2 sınıfta seed'li; genişletme CEO onayı ister (routing satırı ekleme = data, ama politika kararı).
- **10/10 geçmezse:** dilim daraltılır (tek departman, tek worker) — asla "9/10 yeterli" denmez; kök neden `/gsd-debug` ile.

## 6. Bütçe-Fallback İşaretleri

- ⛔ FABLE-ONLY: ClassifiedIntent/envelope şema değişikliği; escalation kural değişikliği; council genişletmesi; 10/10 kapı verdict'i; routing-seed'e L1 satır ekleme.
- Opus uygulayabilir: adım 1–9 (arayüzler ve kurallar birebir; prompt metinlerinin kaleme alınışı Opus işçiliği — ama şema-zorlamalı olduğundan sapma yakalanır).
