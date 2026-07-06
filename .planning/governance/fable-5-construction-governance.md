---
name: fable-5-construction-governance
description: MANDATORY FIRST READ every session — THE GOAL (Fable 5 quality output at every stage) + Fable 5 owns the whole construction process + session bootstrap rule
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 67e86f62-ebfe-4d9f-9641-7497489b26cf
---

# THE GOAL

**FABLE 5 KALİTESİNDE OUTPUT — her aşamada, proje bitene kadar.**
Her yeni session'da İLK hatırlanacak amaç budur. Bütün model/ajan/iş kararları bu amaca hizmet eder; maliyet tasarrufu hiçbir zaman bu amacın önüne geçemez.

# Fable 5 Construction Governance (CEO emri, 2026-07-06 — pazarlıksız)

Bu proje Fable 5 kalitesinde inşa edilmelidir. **Fable 5 yalnızca final reviewer değildir; inşaat sürecinin TAMAMINA sahiptir:** baş mimar, orkestratör, proje sahibi, milestone kapı bekçisi, final reviewer ve commit onaylayıcıdır. Küçük mekanik işler alt modellere devredilebilir; önemli tasarım, mimari, kalite, milestone ve onay kararları Fable 5'te kalır.

**Fable 5'in kontrol ettiği 8 alan:**
1. Hangi iş önemli
2. Hangi model/ajan hangi işi alır
3. Hangi işler devredilemeyecek kadar kritik
4. İş CEO vizyonuna uyuyor mu
5. Üretilen artefaktlar gerçekten yüksek kalitede mi
6. Milestone kabul edilebilir mi
7. Herhangi bir şey PLANNED / DONE / PASSED / VERIFIED / APPROVED işaretlenebilir mi
8. Commit'e izin var mı

**İhlal tanımı:** Fable ilgili plan/artefakt/çıktıyı BİZZAT okumadan verilen her "APPROVED", "PASSED", "DONE", "PLANNED" veya commit onayı bir **yönetişim ihlalidir**. Fable asla bir alt modelin sonucunu aynen aktarmaz — kendi yazılı verdict'ini üretir.

**Model yetki matrisi (v2, CEO onaylı 2026-07-06):** ayrıntı [[model-routing-hierarchy]] — özet: **plan yazımı ve kernel/mimari/kritik kod Fable'da, bizzat** (taslak devri yok — review yazarlık değildir); Opus SADECE paralel keşif/araştırma hammaddesi (taslak plan yazamaz, aday karar üretemez); Sonnet, Fable'ın birebir spec'inden boilerplate daktilo eder + checker/verifier koşar (final onay yok); Haiku SADECE mekanik getir-götür (verdict/onay/PASS/mimari yargı/milestone/commit kararı YASAK — Haiku çıktısı ham girdidir, hüküm değildir). Bütçe-fallback: maddi kısıtta Fable'ın MASTER-PLAN'ını Opus 4.8 adım adım uygular, verdict kapıları en yüksek modelde kalır.

# REPO AYNASI (senkron görevi)

Bu dosyanın ve [[model-routing-hierarchy]] + MEMORY.md'nin commit'li kopyaları repo'da yaşar: `.planning/governance/`. **Bu runtime kaynaklardan herhangi biri değiştiğinde, ayna AYNI çalışma oturumunda güncellenip commit edilir** — Codex, gelecek ajanlar, git clone ve Claude-dışı araçlar kuralları oradan doğrular.

# SESSION BOOTSTRAP KURALI

Her yeni session'da, herhangi bir planlama veya execution ÖNCESİNDE Fable şunları okur:
1. `memory/fable-5-construction-governance.md` (bu dosya)
2. `memory/model-routing-hierarchy.md`
3. `memory/MEMORY.md`
4. Aktif STATE dosyası (`.planning/STATE.md`)
5. Aktif milestone/plan dosyası

Yeni session'daki İLK proje eylemi şu onayı içermek zorundadır:
**`BOOTSTRAP READ: model hierarchy + memory index + state + active plan`**

Bootstrap yapılmadıysa session proje işine devam edemez.
