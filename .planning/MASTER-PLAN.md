# DXB Global OS — MASTER PLAN

**Yazar:** Claude Fable 5, bizzat (Fable-authorship governance v2, 2026-07-06)
**Statü:** Fable-detay katmanı — ROADMAP.md'nin üzerine, onu değiştirmeden
**Amaç:** 11 fazın tamamı, executor-bağımsız detayda. Bu plan o kadar belirsizliksiz ki bütçe-fallback modunda Opus 4.8 adım adım uygulayabilir; tasarım kalitesi plana gömülü olduğu için korunur.

---

## Nasıl Okunur

- Bu dosya **omurga**: ilkeler, faz-üstü değişmezler, faz indeksi.
- Her fazın derin spec'i ayrı dosyada: `.planning/master-plan/PHASE-XX.md`.
- Her faz dosyası 6 bölüm taşır: **(1) Hedef + kabul kapısı, (2) LOCKED mimari kararlar, (3) Dosya-seviyesi spec (kritik içerik birebir kod), (4) Adım listesi (adım = commit; her adımda doğrulama komutu), (5) Risk + fallback, (6) Bütçe-fallback işaretleri** (Opus'un tek başına yapamayacağı, Fable'a dönmesi gereken adımlar).
- GSD workflow'u geçerli kalır: `/gsd-plan-phase` faz planlarını bu master spec'ten üretir (planner = Fable). Çelişki çıkarsa MASTER-PLAN kazanır, ROADMAP güncellemesi ayrı commit olur.

## Yönetici Özeti (tek cümle)

Supabase Postgres şirketin veri yolu ve tek gerçek kaynağıdır; Kernel, Orchestrator, Hermes, Claude Code session'ları ve Dashboard aynı şemanın istemcileridir — ajanlar state'e yalnız dxb-mcp araçlarından, insanlar yalnız dashboard'dan ulaşır, hiçbir şey eşler arası koordine olmaz.

## Faz-Üstü Değişmezler (her fazda geçerli, pazarlıksız)

| # | Değişmez | Kaynak |
|---|---|---|
| I1 | Bir ajanın kararı, dayanıklı kayda commit edilene kadar halüsinasyondur — durum sadece Postgres'te yaşar | ARCHITECTURE.md |
| I2 | Dışa dönük her eylem (para, sözleşme, e-posta, reklam) DRAFT satırıdır; tek yan-etki yolu outbox executor'dur; onay prompt değil Postgres state machine'dir | Pitfall 2, GATE-01/02 |
| I3 | Ajanlar birbirine mesaj atmaz — kuyruk + typed artifact; free-form agent-chat anti-feature | ORCH-04, Anti-Pattern 1 |
| I4 | Her model çağrısı etiketlenir (mode/model/token/dept/task) ve cost ledger'a düşer; Cost Monitor herhangi bir otonom loop'tan ÖNCE canlıdır | KERN-03, Pitfall 4 |
| I5 | Araçlar kullanan fazın BAŞINDA study→install→adopt→embed ile girer; kör kurulum yok | INTEG-01, §8B |
| I6 | Least privilege = görünürlük filtresi: ajan reddedilen aracı göremez bile; tool-description hash-pin | MCP-02/03, Pitfall 6 |
| I7 | Hafızaya her yazım provenance + karantina + çelişki denetimi taşır; güvenilmeyen içerik gated karar bağlamına giremez | MEM-01, Pitfall 7 |
| I8 | Dashboard saf projeksiyondur — hiçbir ajan "dashboard'u güncellemez" | DASH-05, Pitfall 10 |
| I9 | İskelet inert kalır; hiçbir departman, dikey dilim 10/10 geçmeden aktive olmaz | Pitfall 1, Phase 5 exit gate |
| I10 | Evidence-before-done: her adımın doğrulama komutu koşulur, çıktısı kaydedilir | governance |

## Model Örgüsü (inşaat, governance v2)

Plan yazımı + repo'ya giren her satır (kod, config, doküman — boilerplate dahil): **Fable bizzat**. Normal modda kod yazarlığı istisnasız Fable'dadır; gereksiz subagent açılmaz (varsayılan inline). Keşif hammaddesi + doğrulama koşuları: Sonnet (high effort) / Opus — yazarlık-dışı destek-only. Her commit öncesi diff + verdict: Fable. Bütçe-fallback: bu MASTER-PLAN + Opus 4.8 executor (faz dosyalarındaki "Opus uygulayabilir" bölümleri YALNIZ bu fallback senaryosunu tarif eder).

Runtime (işletim, §10 brain map — inşaat örgüsünden ayrı): L1 Fable/Opus kernel-orchestrator kritik kararlar; L2 Sonnet department heads; L3 Codex/Sonnet/GLM specialists; L4 ucuz worker havuzu (OpenRouter); L5 council sadece kritik kapılarda.

## Faz İndeksi ve Bağımlılık Grafiği

```
1 Security (KAPALI ✓) → 2 Foundation → 3 State Layer (KÖK BAĞIMLILIK)
→ 4 Safety Rails → 5 Kernel Loop (exit: 10/10 dikey dilim)
→ { 6 Memory Router ∥ 8 Dashboard/CRM (paralel-güvenli) }
6 → 7 Gateway+VPS → (sert öncelik) → 10 Departman Dalgaları
8 → 9 JARVIS
{7,8} → 10 → 11 Outleteuro Pilot
```

| Faz | Spec dosyası | Durum | Özet |
|---|---|---|---|
| 1 | [PHASE-01](master-plan/PHASE-01.md) | ✅ Kapalı (2026-07-06, CEO onaylı) | Güvenlik taban çizgisi — kayıt amaçlı |
| 2 | [PHASE-02](master-plan/PHASE-02.md) | Yürüyor (1/5) | Monorepo iskelet + entegrasyon takip programı |
| 3 | [PHASE-03](master-plan/PHASE-03.md) | Bekliyor | Tam Supabase şeması + dxb-mcp çekirdeği (queue/registry/audit/cost) |
| 4 | [PHASE-04](master-plan/PHASE-04.md) | Bekliyor | Onay kapıları, outbox executor, LiteLLM bütçe, hız kesicileri, audit |
| 5 | [PHASE-05](master-plan/PHASE-05.md) | Bekliyor | Kernel + orchestrator çekirdek döngü; 10/10 dikey dilim kapısı |
| 6 | [PHASE-06](master-plan/PHASE-06.md) | Bekliyor | Memory router: tek yazım yolu, provenance, karantina |
| 7 | [PHASE-07](master-plan/PHASE-07.md) | Bekliyor | MCP gateway profilleri + hash-pin + EU VPS 24/7 + Hermes + video |
| 8 | [PHASE-08](master-plan/PHASE-08.md) | Bekliyor | CEO cockpit + CRM (design bundle önce) |
| 9 | [PHASE-09](master-plan/PHASE-09.md) | Bekliyor | JARVIS ses katmanı (ince ikinci istemci) |
| 10 | [PHASE-10](master-plan/PHASE-10.md) | Bekliyor | Departman aktivasyon dalgaları + persona v2 (Fable-yazımı; HR fabrikası hammadde) — korpus düzeltmesi 2026-07-07: 159 gerçek persona ("367" efsaneydi), program PHASE-03 §"Persona v2 Programı" |
| 11 | [PHASE-11](master-plan/PHASE-11.md) | Bekliyor | Outleteuro pilotu — Catalog Automation Rate |

## Bütçe-Fallback Protokolü (maddi kısıt senaryosu)

1. Tetik: Claude subscription/API erişimi kısıtlandı veya CEO fallback ilan etti.
2. Opus 4.8 bu MASTER-PLAN'ı faz sırasıyla, adım adım uygular. Her adımın doğrulama komutunu koşar; komut geçmezse adımı tamamlanmış SAYAMAZ.
3. Her faz dosyasının §6'sındaki **⛔ FABLE-ONLY** işaretli adımlar atlanır ve birikir; Fable erişimi dönünce önce onlar kapanır. Bu adımlar tipik olarak: mimari revizyon kararları, kalite verdict'leri, milestone kapıları, güvenlik istisnaları.
4. Verdict kapıları eldeki en yüksek modelde kalır; hiçbir koşulda Haiku'ya inmez.
5. Kalite beklentisi (dürüst kayıt): tasarım %100 korunur (plana gömülü), mikro-işçilik Opus seviyesi — "Fable tasarımı + Opus işçiliği".

## Kaynaklar

Ana mimari doküman (`bubbly-dazzling-goblet.md`), ROADMAP.md, REQUIREMENTS.md (56 req eşlemesi), `.planning/research/{ARCHITECTURE,PITFALLS,STACK,FEATURES}.md`, 02-RESEARCH.md, proje CLAUDE.md stack tabloları. Sürüm pinleri STACK/CLAUDE.md'den: Agent SDK 0.3.201, MCP SDK 1.29.0, pg-boss 12.25.1, supabase-js 2.110.0, Next.js 16.2.10, LiteLLM 1.91.0, Zod 4.x, Node 22 LTS.
