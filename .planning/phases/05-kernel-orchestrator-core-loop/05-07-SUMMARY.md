---
phase: 05-kernel-orchestrator-core-loop
plan: 07
status: complete
completed: 2026-07-08
tasks_completed: 2/2
commits:
  - "08b0873 feat(05-07): dxb intent CLI — KERN-01 front door (classify → route → decompose → dispatch), guarded argv"
  - "(this commit) docs(05-07): plan complete — live step-8 evidence"
---

# 05-07 SUMMARY — `dxb intent`: the KERN-01 front door

**Executed inline by Fable 5 (governance v5 — no subagent).**

## What closed

Master-plan step 8, KERN-01's first real surface: the CEO types one plain
sentence; kernel + orchestrator take it to queued, dependency-ordered tasks.
No tool, model, or department named by the human. Dashboard command bar and
JARVIS (Phases 8-9) reuse this exact seam.

## Module

**tools/dxb-cli/src/intent.ts** — `intent(text)`: trim → non-empty + ≤2000
char cap → `classify(text)` (text is DATA into the prompt) →
`route(ci, loadPolicy(db))` fail-fast (unroutable → exit 1, nothing queued) →
`decompose(ci)` (single: no LLM; multi: drafted chain) → `dispatch()` (one
transaction — partial queue impossible). Registered in index.ts alongside
approve/reject/breaker; exactly one non-flag argument enforced; `IntentError`
→ `error: <reason>`, exit 1; missing arg → usage, exit 2. No child_process,
no SQL strings — Kysely parameters only (T-05-16).

## Evidence

| İddia | Durum | Kanıt |
|---|---|---|
| Argümansız çağrı → usage, exit ≠ 0 | ✓ VERIFIED | `dxb intent` → `intent text required: dxb intent "<one quoted sentence>"`, exit=2 |
| 2001 karakter → red, kuyruk boş | ✓ VERIFIED | `error: intent text is 2001 chars — cap is 2000...`, exit=1; sonrasında `SELECT count(*)` yeni satır yok |
| Build yeşil (yeni workspace deps + references) | ✓ VERIFIED | `pnpm install && pnpm build` → tsc temiz |
| intent.ts'de shell/SQL enterpolasyonu yok | ✓ VERIFIED | modülde child_process importu yok; tek DB yolu Kysely parametreli |
| **Master-plan adım 8 canlı** | ✓ VERIFIED | `node tools/dxb-cli/dist/index.js intent "tek marka X için listeleme taslağı hazırla"` → exit=0, stdout aşağıda |
| Kuyruk SQL kanıtı | ✓ VERIFIED | `SELECT ... FROM tasks WHERE created_at > (run start)` → 1 satır `queued`; `created` event `orchestrator:dispatch` |
| Tam suite regresyonsuz | ✓ VERIFIED | `pnpm test` → **65 passed \| 9 skipped (74)** |

**Canlı CLI stdout (adım 8, komut birebir):**
```
classified: task_class=content.outbound departments=marketing,sales complexity=single
queued 9e310a66-e4f9-4fac-b5c2-f6c07c5f3fb2 dept=marketing tier=L4 deps=[]
```

**SQL satırı (temizlik öncesi):**
```
9e310a66-... | marketing | queued | L4 | {} | internal
```
Kanıt satırları sonrasında silindi (05-09 kendi taze zincirlerini kurar).

## Observed classification — 05-09 determinism note

"tek marka X için listeleme taslağı hazırla" → `content.outbound` /
`marketing,sales` / `single` → marketing L4 internal. Listeleme taslağı
**product departmanına GİTMEDİ** (marketing'e route edildi). 05-09 departman
determinizmi isterse plan kendi veri-tarafı kolunu taşıyor: `routing_rules`
match keyword pin (satır ekleme = data, kod değişmez; kullanımı kayıtlı
uyarlama olur). Bu koşuda kod/route değiştirilmedi — yalnızca gözlem kaydı.

## Deviations

| Sapma | Durum |
|---|---|
| Yok — plan birebir uygulandı | — |

Not (sapma değil, kullanım): CLI süreç ortamında `DXB_DATABASE_URL` ister
(getDb sözleşmesi, db/README.md şablonu). Test suite'i bunu kendisi set eder;
canlı koşuda shell env ile verildi. Secrets .env/vault'ta kalır.
