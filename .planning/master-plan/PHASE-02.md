# PHASE 02 — Foundation & Integration Program (YÜRÜYOR, 1/5)

**GSD planları mevcut ve Fable-onaylı** (02-FABLE-REVIEW.md): 02-01 ✅ / 02-02, 02-03, 02-04, 02-05 bekliyor. Bu dosya, mevcut planların üstünde master-bağlam verir; detay o planlarda — yeniden yazılmaz (çift kaynak yaratma).

## 1. Hedef + Kabul Kapısı

Şirketin inşaata hazır evi: onaylı mimariyi birebir yansıtan pnpm monorepo iskeleti + hiçbir doc-mandated aracın atlanmadığını/kör kurulmadığını garanti eden takip programı.

Kapı (ROADMAP success criteria, ölçülebilir):
1. `pnpm install && pnpm -r exec tsc --build && pnpm vitest run` temiz geçer — 9 proje (`db/` + `packages/{shared,dxb-mcp,gateway,kernel,orchestrator,memory-router,outbox-executor}` + `apps/{dashboard,jarvis}`)
2. Her §8B kaleminin study→install→adopt→embed satırı var (INTEGRATION-TRACKER.md); tracker-integrity validator makine-denetimli geçer
3. Phase 3 toolset'inin 9 study card'ı kurulumdan ÖNCE mevcut
4. Excluded kalemler (kickbacks.ai, automaton, llm-council, ToS-gray) gerekçeli kayıtlı; re-admission = CEO sign-off satırı

## 2. LOCKED Kararlar

- Workspace: pnpm catalog pinning (02-01'de kuruldu); Corepack pnpm pin
- tsconfig.base.json: strict, ES2022, NodeNext (kuruldu — değişmez)
- Phase-3+ bağımlılığı bu fazda YOK (supabase-js, pg-boss vb. Phase 3 başında study card'la girer)
- İskelet inert: hiçbir paket çalışan servis değil, sadece derlenen iskelet (I9)

## 3. Dosya-Seviyesi Spec

02-01 ile kuruldu (34 dosya, commit 45cb475/388a26d/8ed5c91/e46896d). Kalan planların dosya listeleri kendi PLAN.md'lerinde — otorite onlar.

## 4. Adım Listesi (kalan)

| Adım | Plan | Doğrulama |
|---|---|---|
| 1. Integration tracker + 9 Phase-3 study card | 02-04 | `grep -c '| ' INTEGRATION-TRACKER.md` satır sayısı §8B kalem sayısına eşit; 9 study card dosyası `ls .planning/research/study-cards/` |
| 2. vitest + @types/node package-legitimacy human-verify | 02-02 | CEO checkpoint kaydı; npm registry publisher doğrulaması kayıtlı |
| 3. Retroaktif + stub study cards, tracker-integrity validator | 02-05 | validator script exit 0 |
| 4. Corepack aktivasyon + install + build + smoke | 02-03 | `pnpm -r exec tsc --build` exit 0; `pnpm vitest run` 1 passed |

Yürütme: `/gsd-execute-phase 2` (kaldığı yerden). Executor = Sonnet, spec'ler mevcut planlarda; belirsizlik çıkarsa Fable'a escalate.

## 5. Risk + Fallback

- **Supply-chain (02-02 kapısı):** vitest/@types/node meşruiyeti insan gözü ister — CEO checkpoint. Şüphe halinde sürüm pinle, `npm audit` + provenance kontrol.
- **Corepack/pnpm sürüm uyumsuzluğu:** Node 22 LTS sabit; pnpm sürümü package.json `packageManager` alanında pinli — değiştirme.

## 6. Bütçe-Fallback İşaretleri

- ⛔ FABLE-ONLY: Faz kapanış verdict'i (5 planın SUMMARY'lerini okuyup phase-complete ilanı).
- Opus uygulayabilir: adım 1–4'ün tamamı (planlar belirsizliksiz; her adımın doğrulama komutu yazılı).
