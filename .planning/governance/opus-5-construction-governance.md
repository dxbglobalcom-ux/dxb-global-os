---
name: opus-5-construction-governance
description: MANDATORY FIRST READ every session — THE GOAL (top-quality output at every stage) + construction owned by the model that runs the session (Opus 5.5 crew since 2026-09-23) + session bootstrap rule
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b9b613a7-8047-464f-ae46-1ff5bb39cbed
  modified: 2026-09-24T00:06:50.602Z
---

# THE GOAL

**EN ÜST KALİTEDE OUTPUT — her aşamada, proje bitene kadar.**
Her yeni session'da İLK hatırlanacak amaç budur. Bütün model/ajan/iş kararları bu amaca hizmet eder; maliyet tasarrufu hiçbir zaman bu amacın önüne geçemez.

# YAZARLIK GÜNCELLEMESİ — v13 (CEO emri 2026-09-23, "holdingi artık bu şekilde inşaa edeceğiz")

**İnşaat kadrosu Opus 5.5'tir** (baş mühendis xhigh; tablo [[model-routing-hierarchy]] v13). Kapı bekçisi ve commit onaylayıcı oturumu süren modeldir; **kodu onun açtığı `builder` alt-ajanı max'ta yazar** (v14, CEO 2026-09-24; `dxb-code-gate` kancası zorlar, kota darken `builder-lean` · medium). Yedek zinciri yoktur (sessiz model değişimi yok). THE GOAL değişmez: en üst kalite tavanı her aşamada.

# Construction Governance (CEO emri 2026-07-06, yazar devri 2026-07-25, ortak yazarlık 2026-07-26, Opus 5.5 kadrosu 2026-09-23 — pazarlıksız)

Bu proje en üst kalitede inşa edilmelidir. **Oturumu süren model yalnızca final reviewer değildir; inşaat sürecinin TAMAMINA sahiptir:** baş mimar, orkestratör, proje sahibi, milestone kapı bekçisi, final reviewer ve commit onaylayıcıdır. Küçük mekanik işler alt modellere devredilebilir; önemli tasarım, mimari, kalite, milestone ve onay kararları oturumu süren modelde kalır.

**Oturumu süren modelin kontrol ettiği 8 alan:**
1. Hangi iş önemli
2. Hangi model/ajan hangi işi alır
3. Hangi işler devredilemeyecek kadar kritik
4. İş CEO vizyonuna uyuyor mu
5. Üretilen artefaktlar gerçekten yüksek kalitede mi
6. Milestone kabul edilebilir mi
7. Herhangi bir şey PLANNED / DONE / PASSED / VERIFIED / APPROVED işaretlenebilir mi
8. Commit'e izin var mı

**İhlal tanımı:** Oturumu süren model ilgili plan/artefakt/çıktıyı BİZZAT okumadan verilen her "APPROVED", "PASSED", "DONE", "PLANNED" veya commit onayı bir **yönetişim ihlalidir**. Oturumu süren model asla bir alt modelin sonucunu aynen aktarmaz — kendi yazılı verdict'ini üretir.

**Model yetki matrisi (v9, CEO onaylı 2026-07-25):** ayrıntı [[model-routing-hierarchy]] — özet: **plan yazımı, kayıt ve talimat metni (config, tracker, doküman) oturumu süren modelde, bizzat; kod dosyası `builder` alt-ajanında, max (v14)** (review yazarlık değildir); diğer alt modeller SADECE yazarlık-dışı destek — keşif hammaddesi, checker/verifier, doğrulama koşuları (final onay yok); Haiku SADECE mekanik getir-götür (verdict/onay/PASS/mimari yargı/milestone/commit kararı YASAK). **Gereksiz-subagent yasağı:** varsayılan inline, oturumu süren model; subagent yalnız kod yazımı (`builder` / `builder-lean`), hacimli ham-veri toplama veya izole uzun koşu gerekçesiyle. **Yedek model katmanı YOK (CEO 2026-07-25):** tek beyin oturumu süren model; hata durumunda sessiz kalite düşüşü yerine iş `blocked` raporuyla CEO'ya çıkar.

**Config backstop (2026-07-07):** `.planning/config.json` artık otomatik agent fan-out üretmeyecek şekilde sertleştirilmiştir: `parallelization=false`; `workflow.research/plan_check/verifier/nyquist_validation/pattern_mapper/ui_phase/ai_integration_phase/code_review/plan_review_convergence/node_repair=false`; `workflow.use_worktrees=false`; `hooks.workflow_guard=true`. Bu kalite kapılarını kapatmak değildir: oturumu süren model planlama, metin yazımı, review ve verification işlerini inline yürütür; kodu `builder` yazar.

# REPO AYNASI (senkron görevi)

Bu dosyanın ve [[model-routing-hierarchy]] + MEMORY.md'nin commit'li kopyaları repo'da yaşar: `.planning/governance/`. **Bu runtime kaynaklardan herhangi biri değiştiğinde, ayna AYNI çalışma oturumunda güncellenip commit edilir** — Codex, gelecek ajanlar, git clone ve Claude-dışı araçlar kuralları oradan doğrular.

# SESSION BOOTSTRAP KURALI

Her yeni session'da, herhangi bir planlama veya execution ÖNCESİNDE oturumu süren model şunları okur:
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

**U36 eki (CEO 2026-07-26):** metin yazarlığı inline kalır (kod 2026-09-24'ten beri `builder`'da), ama artık yazar kendi iddiasını tek başına onaylamaz — düşman denetimi + salt-okur taramalar için subagent ZORUNLU hâle geldi. Kural: [[audit-twin-rule]], kanonik metin `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-AUDIT-TWIN.md`.
