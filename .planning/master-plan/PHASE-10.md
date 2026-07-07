# PHASE 10 — Department Activation Waves & Persona Factory

**Req:** DEPT-01..05
**Bağımlılık:** Phase 7 (SERT: gateway profilleri + VPS aktivasyondan önce) + Phase 8 (autonomy dial dashboard'da)
**İlke:** Kanıtlanmış iskeletten kadrolu şirkete — kalite çökmesi olmadan. Hiçbir dalga, ölçüm altyapısı canlı olmadan açılmaz.

## 1. Hedef + Kabul Kapısı

1. Golden-task bataryası + güçlü-model örnekleme denetimi (ucuz-tier çıktının %5–10'u) İLK dalga aktive olmadan ÖNCE canlı
2. Her dalga: plugin/MCP'ler dalga başında study→install; golden task'lar + gateway profil re-audit geçmeden canlıya alınmaz
3. Legal (DE/TR), HR fabrikası, Research registry'de kadrolu ve çalışır (research yazımları karantina arkasında)
4. HR fabrikası persona v2.0 rewrite'ını sistematik yapar — en az BİR TAM departmanda gösterilmiş; humanizer her outbound pipeline'da onay kapısından önce
5. Onay sıkılığı departman/eylem sınıfı bazında denetlenmiş sicile göre gevşer; CEO dashboard'dan ayarlar

## 2. LOCKED Kararlar

| Karar | Gerekçe |
|---|---|
| Dalga sırası: W1 Engineering+Research → W2 Marketing+Sales+Social → W3 Finance+Legal+HR → W4 kalanlar | doc rollout'u; en denetlenebilir işler önce |
| Golden battery: görev sınıfı başına ≥5 bilinen-cevaplı görev; model/prompt/upstream değişiminde re-run (OpenRouter sessiz model değişimine karşı) | Pitfall 3 |
| Örnekleme denetimi: pg-boss haftalık cron, ucuz-tier çıktının %5–10'u sonnet-5 re-review; disagreement>%15 → o görev sınıfı OTOMATİK üst tier'a (routing_rules update + audit + CEO bildirimi) | "kalite asla düşmez"i ölçüme çevirir |
| Judge red oranı izlenir: golden set'te seeded-defect yakalama <%80 → judge yükselt | hiç reddetmeyen judge bozuktur |
| autonomy_level anlamı (agents tablosu): 0=her çıktı head review; 1=internal serbest, outward draft; 2=düşük-risk outward toplu onaya; 3=orta-risk toplu onaya. Seviye atlama YALNIZ sicil metriğiyle (≥50 görev, düzeltme<%5) + CEO dashboard onayı | DEPT-05 |
| Persona v2.0 şablonu: role/objective/output_contract/termination/skills/mcp_profile/context_budget alanları ZORUNLU — serbest düzyazı yasak | MAST kategori-1 önleme |
| Humanizer: outbound content pipeline'ında zorunlu adım (orchestrator content.outbound rotasında kodlu) — atlanamaz | DEPT-04 |
| HR fabrikası kendisi bir departman: rewrite işleri normal TaskEnvelope; çıktı persona PR'ı (git) + registry update | süreç kendi OS'ini kullanır |

## 3. Dosya-Seviyesi Spec

```
db/migrations/0013_quality_metrics.sql   # golden_runs, sampling_audits tabloları
packages/orchestrator/src/quality/{golden.ts,sampling.ts}
agency-agents/_templates/persona-v2.md   # zorunlu alanlı şablon
tools/dxb-cli/src/{autonomy.ts,wave.ts}  # dial + dalga aç/kapa (CEO)
tests/phase10/{golden-gate,sampling-promote,autonomy-dial}.test.ts
```

### 0013_quality_metrics.sql (çekirdek)

```sql
CREATE TABLE golden_runs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_class text NOT NULL, model text NOT NULL,
  passed integer NOT NULL, total integer NOT NULL,
  trigger text NOT NULL,            -- 'wave-gate'|'model-change'|'weekly'
  created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE sampling_audits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES tasks(id),
  worker_model text NOT NULL, auditor_model text NOT NULL,
  disagreement boolean NOT NULL, notes text,
  created_at timestamptz NOT NULL DEFAULT now());
-- haftalık görünüm: disagreement oranı per task_class → routing promotion kararının verisi
```

## 4. Adım Listesi

| # | Adım | Doğrulama |
|---|---|---|
| 1 | 0013 + golden battery altyapısı (sınıf başına 5 görev, beklenen çıktılarla) | `golden.ts --class code.bulk` → passed/total kaydı |
| 2 | Örnekleme denetim cron'u | sahte 20 ucuz çıktı → ≥1 audit satırı; disagreement>%15 senaryosunda routing_rules satırı otomatik güncellendi + audit |
| 3 | Persona v2 şablonu + HR fabrika iş akışı (HR = hammadde/taslak; nihai metin ⛔ Fable) | şablon lint'i (zorunlu alanlar); bir persona v2'ye çevrildi (Fable-yazımı, `personas/<dept>/`), PR + registry `persona_version='v2.0-fable'` kanıtı |
| 4 | W1: Engineering+Research aktivasyonu | dalga başı study→install kayıtları; golden gate geçti; gateway re-audit temiz (research profilde payment YOK); registry'de active |
| 5 | Bir TAM departman v2.0 (Research önerilir — en küçük riskli) | departmanın tüm persona'ları v2 şablonunda; context_budget toplamı eski v1 ortalamasının altında |
| 6 | Humanizer pipeline'a | content.outbound rotası testi: draft→humanizer→sonnet polish→draft(approval) zincirinde humanizer adımı event'te görünür |
| 7 | Autonomy dial | `dxb autonomy set <agent> 1` yalnız sicil şartı sağlanınca çalışır; dashboard'dan aynı işlem; audit |
| 8 | W2 aktivasyonu (Marketing+Sales+Social) | W1 kapı prosedürünün aynısı; sabah kuyruğu sosyal işleri gösteriyor |
| 9 | W3 (Finance+Legal DE/TR + HR resmî) | Legal DE/TR personaları v2 kadrolu; finance profili draft-only kanıtı |
| 10 | Faz kapanışı | 5 kriter + dalga başına kapı kanıtları |

## 5. Risk + Fallback

- **Golden task'lar oyunlaşırsa (memorization):** battery çeyrek başı %20 yenilenir; beklenen çıktılar repo'da hash'li.
- **Örnekleme maliyeti:** %5–10 oran budget_state'e bağlı; breaker triplerse örnekleme kritik sınıflara daralır (denetim asla sıfırlanmaz).
- **v2 rewrite hacmi (159 — "367" düzeltilmiş efsane, ölçüm 2026-07-07):** dalga-gerektikçe: yalnız aktive edilen departman rewrite edilir; dormant v1.0-legacy kalır (maliyet sıfır). **Yazarlık Fable'da** (⛔): HR fabrikası hammadde/taslak hazırlar, nihai v2 metni Fable yazar — v2'siz departman aktive edilemez (PHASE-03 "Persona v2 Programı").

## 6. Bütçe-Fallback İşaretleri

- ⛔ FABLE-ONLY: dalga açma verdict'i (her dalga!); **persona v2 nihai metni (her persona)**; autonomy politika değişikliği; golden battery içerik onayı; faz kapanışı.
- Opus uygulayabilir: adım 1–3, 5–7 mekanik kısımları; dalga kapıları Fable'sız AÇILAMAZ — fallback modunda dalga aktivasyonu DURUR (birikir).
