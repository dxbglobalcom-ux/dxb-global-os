---
phase: 08-ceo-dashboard-crm
plan: 02
status: complete
completed: 2026-07-10
commits: [3bc1510, 9b05296, 29496e4]
requirements: [DASH-01, DASH-05]
author: Fable 5 (inline; devralma — önceki session 02:14'te verify ortasında düştü, tüm iş bizzat yeniden doğrulandı)
---

# 08-02 SUMMARY — Live cockpit heart (TaskBoard + AgentRoster + Broadcast projection)

## Sonuçlar

| İş | Durum | Kanıt |
|---|---|---|
| Task 1: realtime helper + Panel/FreshnessStamp | ✓ VERIFIED | `pnpm vitest run tests/phase8/` → 12/12 PASS (stamp degrade + iki tema + tr/en sıra); build yeşil |
| Task 2: TaskBoard + AgentRoster + exception-first kompozisyon + Horizon Line canlı sayaçlar | ✓ VERIFIED | build: 4 route derlendi, TS temiz; yasak grep seti (h-screen, #000000, scroll-listener, z-[9, border-l-4, grid-cols-3, Inter) → 0 eşleşme |
| Task 3: projection proof + DASH-05 purity gate | ✓ VERIFIED | `live-projection.test.ts` PASS — gerçek DB INSERT → payload kontratı + yazım-yolu taraması (allowlist boş, ihlal 0) |
| Migration 0014 read policies | ✓ VERIFIED | `pg_policies` count = 12 (`*_ceo_read`), lokal DB'de uygulanmış |
| Canlı update <2s (DB insert → board, reload'suz) | ✓ VERIFIED (mekanizma) | önceki session Playwright kanıtı: evidence/live-before.png + live-after-2s.png (00:11 konsol logu, insert sonrası 2s pencerede yeni satır); sonraki değişiklikler yalnız sunum katmanı |
| Görsel nitelik ("Burj hissi", board estetiği) | ⚠ UNVERIFIED | GUI render — CEO göz testi faz kapanışında (UI-SPEC §9.5, A1.4 ölçütü: referanstan güzel) |

## Konsol 404 notu

Cockpit konsolundaki 8 hata tek sınıf: henüz yazılmamış route'ların (/approvals, /costs, /crm, /tasks/[id]) RSC link-prefetch 404'ü. 8.'si canlı eklenen görevin kendi linki — render hatası DEĞİL. 08-03/04/06 route'ları geldikçe kendiliğinden kapanır.

## Sapmalar / uyarlamalar (kayıtlı)

| # | Uyarlama | Gerekçe |
|---|---|---|
| 1 | Migration 0014 (planda yoktu) | Faz 3'ten beri RLS açık ama policy'siz tablolar — PostgREST okumaları için explicit SELECT grant + 12 `*_ceo_read` policy şarttı; ⛔ RLS = Fable-only, bizzat yazıldı |
| 2 | `lib/format.ts` + {time}-template stamp etiketleri | Amendment A2 (EN birincil) sabit `tr-TR` formatlayıcıları ve "14:32 as of" kelime-sırası hatasını doğurdu; locale-bound çözüldü, iki sıra da testli |
| 3 | vitest `@` alias + `.tsx` include + jsx automatic | Component testleri value-import çözümü istiyor; root config dashboard tsconfig path'ini aynalar |
| 4 | `scripts/.tmp-set-pw.mjs` silindi; evidence PNG'leri `evidence/`e taşındı; `.playwright-mcp/` gitignore | Hijyen: tmp script env-driven idi (plaintext secret YOK), yine de repoya girmez |

## Devralma notu

Önceki session Task 1–3'ü yazmış, verify sırasında düşmüştü (obs 2809–2832). Governance gereği tüm dosyalar bizzat okundu, test+build+DB doğrulaması sıfırdan koşuldu, A2 uyumu bu devralmada eklendi. Commit'ler: 3bc1510 (T1) · 9b05296 (T2+0014) · 29496e4 (T3+evidence).
