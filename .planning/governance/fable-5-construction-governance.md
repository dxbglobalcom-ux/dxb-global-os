<!-- REPO MIRROR — committed for portability/auditability (Codex, future agents, git clone, non-Claude tools).
     Runtime Claude memory source: ~/.claude/projects/-home-ghost-DxB-Global-OS/memory/fable-5-construction-governance.md
     Sync rule: whenever the runtime source changes, this mirror is updated in the same work session. -->

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

**Model yetki matrisi:** ayrıntı [[model-routing-hierarchy]] — özet: Opus taslak üretir (onay yetkisi yok), Sonnet execute/araştırır/yapısal kontrol yapar (final onay yok), Haiku SADECE mekanik getir-götür (verdict/onay/PASS/mimari yargı/milestone/commit kararı YASAK — Haiku çıktısı ham girdidir, hüküm değildir).

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
