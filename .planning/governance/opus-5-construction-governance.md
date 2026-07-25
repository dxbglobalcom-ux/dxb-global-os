---
name: opus-5-construction-governance
description: MANDATORY FIRST READ every session — THE GOAL (Opus 5 quality output at every stage) + Opus 5 owns the whole construction process + session bootstrap rule
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b9b613a7-8047-464f-ae46-1ff5bb39cbed
  modified: 2026-07-25T14:18:34.270Z
---

# THE GOAL

**OPUS 5 KALİTESİNDE OUTPUT — her aşamada, proje bitene kadar.**
Her yeni session'da İLK hatırlanacak amaç budur. Bütün model/ajan/iş kararları bu amaca hizmet eder; maliyet tasarrufu hiçbir zaman bu amacın önüne geçemez.

# Opus 5 Construction Governance (CEO emri 2026-07-06, yazar devri 2026-07-25 — pazarlıksız)

Bu proje Opus 5 kalitesinde inşa edilmelidir. **Opus 5 yalnızca final reviewer değildir; inşaat sürecinin TAMAMINA sahiptir:** baş mimar, orkestratör, proje sahibi, milestone kapı bekçisi, final reviewer ve commit onaylayıcıdır. Küçük mekanik işler alt modellere devredilebilir; önemli tasarım, mimari, kalite, milestone ve onay kararları Opus 5'te kalır.

**Opus 5'in kontrol ettiği 8 alan:**
1. Hangi iş önemli
2. Hangi model/ajan hangi işi alır
3. Hangi işler devredilemeyecek kadar kritik
4. İş CEO vizyonuna uyuyor mu
5. Üretilen artefaktlar gerçekten yüksek kalitede mi
6. Milestone kabul edilebilir mi
7. Herhangi bir şey PLANNED / DONE / PASSED / VERIFIED / APPROVED işaretlenebilir mi
8. Commit'e izin var mı

**İhlal tanımı:** Opus 5 ilgili plan/artefakt/çıktıyı BİZZAT okumadan verilen her "APPROVED", "PASSED", "DONE", "PLANNED" veya commit onayı bir **yönetişim ihlalidir**. Opus 5 asla bir alt modelin sonucunu aynen aktarmaz — kendi yazılı verdict'ini üretir.

**Model yetki matrisi (v9, CEO onaylı 2026-07-25):** ayrıntı [[model-routing-hierarchy]] — özet: **plan yazımı VE repo'ya giren her satır (kod, config, tracker, doküman — boilerplate dahil) Opus 5'te, bizzat; yazarlık devri yok** (review yazarlık değildir); alt modeller SADECE yazarlık-dışı destek — keşif hammaddesi, checker/verifier, doğrulama koşuları (final onay yok); Haiku SADECE mekanik getir-götür (verdict/onay/PASS/mimari yargı/milestone/commit kararı YASAK). **Gereksiz-subagent yasağı:** varsayılan inline Opus 5; subagent yalnız hacimli ham-veri toplama veya izole uzun koşu gerekçesiyle. **Yedek model katmanı YOK (CEO 2026-07-25):** tek beyin Opus 5; hata durumunda sessiz kalite düşüşü yerine iş `blocked` raporuyla CEO'ya çıkar.

**Config backstop (2026-07-07):** `.planning/config.json` artık otomatik agent fan-out üretmeyecek şekilde sertleştirilmiştir: `parallelization=false`; `workflow.research/plan_check/verifier/nyquist_validation/pattern_mapper/ui_phase/ai_integration_phase/code_review/plan_review_convergence/node_repair=false`; `workflow.use_worktrees=false`; `hooks.workflow_guard=true`. Bu kalite kapılarını kapatmak değildir: Opus 5 planlama, yazım, review ve verification işlerini inline yürütür.

# REPO AYNASI (senkron görevi)

Bu dosyanın ve [[model-routing-hierarchy]] + MEMORY.md'nin commit'li kopyaları repo'da yaşar: `.planning/governance/`. **Bu runtime kaynaklardan herhangi biri değiştiğinde, ayna AYNI çalışma oturumunda güncellenip commit edilir** — Codex, gelecek ajanlar, git clone ve Claude-dışı araçlar kuralları oradan doğrular.

# SESSION BOOTSTRAP KURALI

Her yeni session'da, herhangi bir planlama veya execution ÖNCESİNDE Opus 5 şunları okur:
1. `memory/opus-5-construction-governance.md` (bu dosya)
2. `memory/model-routing-hierarchy.md`
3. `memory/MEMORY.md`
4. Aktif STATE dosyası (`.planning/STATE.md`)
5. Aktif milestone/plan dosyası

Yeni session'daki İLK proje eylemi şu onayı içermek zorundadır:
**`BOOTSTRAP READ: model hierarchy + memory index + state + active plan`**

Bootstrap yapılmadıysa session proje işine devam edemez.

# TARİHSEL KAYIT (değiştirilmez)

Bu yönetişim çerçevesi 2026-07-06'da **Fable 5** için yazıldı ve inşaatın 2026-07-06 → 2026-07-25 arası TÜM yazarlığı (31-spec korpusu, 196 persona, E1-E13 uygulaması) fiilen Fable 5 tarafından yapıldı. CEO 2026-07-25'te yazarlığı Opus 5'e devretti; ileriye dönük tüm kural cümleleri Opus 5'i işaret eder, geçmiş kayıtlar (persona `Created by`, uygulanmış migration'lar, kanıt notları) olduğu gibi korunur. Dosyanın eski adı: `fable-5-construction-governance.md`.
