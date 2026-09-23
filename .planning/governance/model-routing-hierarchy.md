---
name: model-routing-hierarchy
description: "v13 (CEO 2026-09-23): İNŞAAT kadrosu Opus 5.5 — baş mühendis xhigh, yazar max, çürütücü/teşhisçi xhigh, tasarımda ikinci göz Fable 5.1; yazar = oturumu süren model; v10 runtime kalite kademe kanunu; v9 yedek katman yok; v8-v5 tarihsel kayıt"
metadata:
  type: feedback
  originSessionId: 6f441f82-3704-454a-83cd-11cd3bcd26d8
  modified: 2026-09-23T22:00:42.000Z
---

# v13 — İNŞAAT KADROSU OPUS 5.5 (CEO, 2026-09-23)

1. **CEO emri (2026-09-23): "holdingi artık bu şekilde inşaa edeceğiz."** Koltuklar Anthropic'in resmî Opus 5.5 grafiklerine göre seçildi: **baş mühendis** = açılan oturum, `claude-opus-5-5` · `xhigh` · **yazar** = ayrı oturum, `claude-opus-5-5` · `max` · **çürütücü ve teşhisçi** alt-ajanları `claude-opus-5-5` · `xhigh` · **tasarımda ikinci göz** `design-eye`, `claude-fable-5-1` · `high`, yalnız okur, `Agent` aracı yok · `scout` haiku · low (yalnız konum). Kanonik tablo: `.claude/skills/dxb-crew/SKILL.md` §1; ajan dosyaları `~/.claude/agents/`.
2. **İnşaat yazarı = oturumu süren model** (v11'in "Opus 5 VEYA Fable 5" hükmünün yerini alır). Model kimliği sabit yazılır; daha güçlü bir model çıktığında koltuk ölçülerek ve CEO'nun sözüyle değişir.
3. **Yedek zinciri yoktur** (v9 madde 2 aynen): hata/timeout durumunda sessiz model değişimi yok, iş `blocked` raporuyla CEO'ya çıkar. Tek oturum = tek yazar.
4. **K1 değişmez:** repo'ya giren her satır o oturumun yazarının, bizzat ve inline; alt-ajan yazarlığı ihlaldir.
5. **Kapsam yalnız İNŞAAT.** Şirketin runtime çalışanlarının modeli (routing satırları, B51) bu kararla değişmedi; o karar CEO'nundur.
6. **Tarihsel kayıt + iç teknik ID hükümleri** (v9 madde 4-5) aynen geçerli; U20'nin "CEO'ya görünen etiket" hükmü katalog satırlarını yönetmeye devam eder.
7. Kayıt: `scripts/governance/ceo-approvals.json` → `crew-opus-5-5-seats-2026-09-23` · `MODEL_ROUTING_SPEC` A-2026-09-23 · ayna: `.planning/governance/model-routing-hierarchy.md`.

# v10 — RUNTIME KALİTE KADEME KANUNU (CEO, 2026-07-26) — U21

Bu blok **RUNTIME ağacıdır** (şirketin ajanları hangi modelle koşar), inşaat yazarlığı değil. v8 madde 2'nin "Sonnet runtime tamamen serbest" hükmünü DARALTIR.

1. **Kanun:** hüküm, zevk, yapı ve bir insanın (CEO veya müşteri) gördüğü her çıktı **Opus 5**'ten çıkar. Alt kademenin çıktısı asla bitmiş ürün değildir — üst kademenin girdisidir.
2. **Ayrım çizgisi maliyet DEĞİL, kod-vs-metin DEĞİL:** "bu işte zevk, yapı veya insanın göreceği bir sonuç var mı?" Varsa L1, ve **kalıcı olarak** L1 — sonradan ucuz bir kodlayıcı model gelmesi bunu geri almaz (CEO: "site mağaza kurulumunu sen yapacaksın tasarım vs … videolarda alt yazı başka model ama videoların tasarımı vs sen").
3. **Kademeler:** L1 Opus 5 (strateji, karar, para, QA/helal hükmü, araştırma SENTEZİ, site/mağaza kurulumu, tasarım + video yönetimi, ürün kodu, departman planlaması, dışa giden içerik, CEO sohbeti yazılı+sesli, hafıza terfisi) · L2 Sonnet (görsel/yapısal yargı içermeyen mekanik backend kodu) · L3 Sonnet (toplama, taslak, özet — sadece ham malzeme) · L4 Sonnet `effort=low`, yerel modelin ayrılmış koltuğu (sınıflandır, ayıkla, deşifre, alt yazı).
4. **Kovulanlar** (`retired` + `banned`, silinmez): haiku 4.5 · DeepSeek V4 Flash · Kimi 2.7 Code · Kimi 3 · GLM 5.2 · Qwen 3.6 Flash · MiniMax M3 · Codex 5.5. DeepSeek V4 Pro `mechanical_only` olarak kalır — hüküm üretemez.
5. **Kademe tekliği (yeni değişmez):** `worker-shim` modeli YALNIZ `model_tier`'dan çözer; bir kademede iki farklı model artık kusurdur, tercih değil.
6. **GPT/Codex hattı API anahtarıyla açılmaz** (ölçüldü 2026-07-26): anahtar doğrulanıyor ama her tamamlama `429 insufficient_quota` — OpenAI API faturası ChatGPT aboneliğinden ayrıdır. Çalışan yol: **Codex CLI abonelik oturumu** (canlı `gpt-5.6-sol` cevabı alındı). CEO emri: Solo 5.6 + GPT 5.5 holdingde kullanılacak, **özellikle konseyde Opus 5'in işini denetleyen çürütücüler olarak**.
7. Normatif metin: `MODEL_ROUTING_SPEC` §4d · kayıt: `00-INDEX` U21 · migration `20260726001000_u21_quality_tier_law.sql`.

# v9 — YAZARLIK DEVRİ: Fable 5 → OPUS 5 + yedek katman kaldırıldı (CEO, 2026-07-25)

1. **İnşaat yazarı artık OPUS 5.** v5-v8'de "Fable bizzat" diyen HER kural cümlesi bundan böyle **Opus 5 bizzat** okunur: plan yazımı, repo'ya giren her satır (boilerplate dahil), tüm personalar (K2), modül kapanışları (K1), her commit öncesi diff okuma + final verdict. Yazarlık devri yoktur; subagent yazarlığı — Opus 5 modelli subagent dahil — ihlaldir.
2. **Yedek model katmanı KALDIRILDI.** v6'nın "Fable bizzat → en kötü ihtimal Opus 4.8" zinciri ve v5'in "bütçe-fallback: Opus 4.8 adım adım uygular" modu İPTAL. Zincir tek elemanlıdır: **Opus 5**. Hata/timeout/rate-limit durumunda sessizce alt modele düşülmez — iş `blocked` raporuyla CEO'ya çıkar (§"never a silent drop"). Gerekçe: birincil ve yedek aynı model olsaydı katman anlamsız; sessiz kalite düşüşü CEO'nun kalite tavanı hükmüne aykırı.
3. **"4.8" ifadeleri.** Projede model sürümü olarak geçen `Opus 4.8` / `claude-opus-4-8` ileriye dönük kural metinlerinde **Opus 5**'e çevrildi; tek istisna, tarihsel kayıtlarda (kim ne zaman ne yazdı) olduğu gibi bırakılmasıdır.
4. **Tarihsel kayıt dokunulmazdır (CEO kararı 2026-07-25).** Persona `Created by: fable-5`, canlı DB'deki `persona_version='v2.0-fable'`, uygulanmış migration dosyaları ve kanıt notları DEĞİŞTİRİLMEZ — inşaatı 2026-07-06 → 2026-07-25 arası gerçekten Fable 5 yaptı; bunu değiştirmek §35 sıfır-uydurma kuralının ihlali olurdu.
5. **İç teknik kimlikler korunur (CEO kararı 2026-07-25).** Çalışma-zamanı ID'leri — `model_catalog.id='fable-5'`, ayar anahtarı `orchestrator.fable_review_required`, escalation basamağı `fable-final`, `FABLE_5_HOOK_SPEC.md` dosya adı, persona §11 başlığı (`packages/hr/src/template.ts:25`, kapı bu başlıkla eşleşir) — teknik anahtar olarak yerinde kalır. CEO'ya GÖRÜNEN her etiket Opus 5'tir.
6. Aşağıdaki v8-v5 blokları **tarihsel kayıttır** (o tarihlerde verilmiş CEO emirleri); çelişkide v9 üsttedir.

# v8 — Runtime/inşaat ağaç ayrımı + Sonnet runtime serbest (CEO, 2026-07-12)

1. **İki ayrı ağaç:** bu memory'deki TÜM kurallar İNŞAAT YAZARLIĞIDIR (kim spec/persona/kod yazar — Claude Code session'ları). Şirketin RUNTIME ajan beyinleri (`agents.brain` + rol slotları) AYRI yönetişimdir: MODEL_ROUTING_SPEC yönetir, dashboard'dan CEO değiştirir (spec §4b).
2. **Sonnet runtime SERBEST (CEO kararı 2026-07-12 ~01:00):** v6'nın "Sonnet defedildi" hükmü yalnız inşaat yazarlığında yaşar. Şirket içinde ajan beyni olarak Sonnet atanabilir havuzda (`banned=false`; varsayılan slot ataması yok — CEO panel/settings'ten atar). İşlendiği yerler: MODEL_ROUTING_SPEC üstbilgi+R2+§4+§13+§21+§24 · API_CONTRACTS models · roadmap E7.2 · MASTER_PLAN §8 kapsam notu.
3. İnşaat tarafında HİÇBİR ŞEY değişmedi: Sonnet spec/persona/kod yazamaz, verdict veremez; zincir Fable bizzat → Opus 4.8; Haiku getir-götür.

# v7 — GAP-AUDIT K1-K2 hükmü (CEO, 2026-07-11, tartışmasız)

1. **K1:** Dashboard modül/placeholder kapanışlarının (ModuleWaiting → gerçek sayfa; E6-E12 modül işleri) yürütücüsü **yalnız Fable ve GPT 5.6 solo**. Başka model (Opus dahil) modül KAPATAMAZ. Roadmap F/O kolonunun devralması bu kapsamda GPT 5.6 solo demektir. v6'nın "Opus devralır" zinciri modül-dışı işlerde (test koşuları, migration uygulaması vb. roadmap devir protokolü) geçerli kalır — çelişki durumunda K1 üstündür.
2. **K2:** TÜM personalar (orkestratör, müdürler, HR, 153 legacy v2 dalgaları, gap-onaylı yeniler) **Fable bizzat, en mükemmel kalitede** yazar. hr-factory İLK oluşumda yazarlık yapmaz (altyapısı kurulur, Fable-sonrası dönem için). Yetişmeyen "Fable-yazımı bekliyor" listesine düşer; kalite düşürülerek kapatılamaz. CEO: personalar+skiller+MCP profilleri+HR yapısı HAYATİ. Kaynak: [[gap-audit-directive-2026-07-11]].

# v6 — BEKLENTİLER dönemi (CEO, 2026-07-10, pazarlıksız)

1. **SONNET DEFEDİLDİ.** Hiçbir rolde kullanılamaz — araştırma, checker, verifier, keşif dahil. v5'in "Sonnet high-effort destek" maddeleri İPTAL.
2. Zincir: **Fable bizzat → en kötü ihtimal Opus 4.8.** Haiku yasağı sürer. Korpus (HOLDING-OS-MASTER-PLAN/) bitmeden Fable'dan başka el değmez.
3. Sıra: korpus %100 → **Fable execution'a bizzat devam (12 Temmuz son geceye kadar)** → Fable erişimi bitince **Opus 4.8 kaldığı yerden devralır** (IMPLEMENTATION_ROADMAP'teki devralma noktaları + BACKUP_PLAN devir protokolü). Verdict kapıları eldeki en güçlü modelde.
4. Persona yazarlığı: TÜM personalar + HR ilk oluşumu bizzat Fable ([[beklentiler-directive-2026-07-10]] madde 7).
5. v5'in inline-yazarlık, subagent-yasağı, evidence-before-done kuralları aynen geçerli.

---

CEO-approved runtime build-workflow authority matrix (v5, 2026-07-08 — v4 kuralları korunur; v5 ek kuralı: **plan/artefakt yazımı YALNIZ inline Fable — gsd-planner/gsd-debugger'ın "Fable modelini miras alır, sayılır" istisnası CEO tarafından İPTAL edildi; aynı model (claude-fable-5) bile olsa subagent yazarlığı ihlaldir; "bizzat" = aktif conversation'daki Fable**. Tarihçe: v1 "Opus taslak yazar" → v2 "Fable plan+kritik kod" → v2'deki "boilerplate'i Sonnet daktilo eder" istisnası CEO tarafından kaldırıldı → v3 "Fable TÜM yazarlık" → v4 otomatik fan-out config'de kapalı → v5 planner-subagent istisnası iptal). Scope: Claude Code/GSD session'larının DXB Global OS'u nasıl inşa ettiği. Şirket/ürün yönetişimi DEĞİL — proje dosyalarına (ROADMAP.md, PROJECT.md, REQUIREMENTS.md, faz planları, proje CLAUDE.md) asla yazılmaz. Üst çerçeve: [[opus-5-construction-governance]] (THE GOAL + bootstrap kuralı — her session ilk okuma).

**İlke: repo'ya giren HER satır Fable'dan çıkar — kod, config, migration, tracker, study card, doküman. İstisna yok (boilerplate dahil).**

**Yetki matrisi (CEO onaylı tablo, v3):**

| İş | Kim | Neden |
|---|---|---|
| Plan yazımı | **Fable, bizzat** | Tavan kalite, çift harcama yok |
| Kod + her repo artefaktı (boilerplate dahil) | **Fable, bizzat yazar** | Kalite tavanı her satırda Fable'da |
| Keşif/araştırma hammaddesi | Sonnet (high effort) / Opus paralel | Ham veri, yargı yok |
| Doğrulama koşuları, kontrol taramaları | Sonnet (high effort) | Yazarlık-dışı destek |
| Her commit öncesi diff okuma + verdict | **Fable** | Zaten kural |

**GEREKSİZ-SUBAGENT YASAĞI (CEO, sert kural):** Varsayılan her iş inline Fable — token şişmesi yasak. Subagent yalnız iki gerekçeyle açılır: (1) ana bağlamı şişirecek hacimli ham-veri toplama (kompakt dönüşle), (2) izole edilmesi şart uzun doğrulama koşusu. Tek komutluk işe subagent açmak ihlaldir. GSD akışında da geçerli: onaylı plan varsa executor subagent'ı yerine inline yürütme tercih edilir.

**Rol tanımları:**

- **Fable 5:** Baş mimar + orkestratör + inşaat sahibi + **plan yazarı + TÜM kod/artefakt yazarı**. Planlar subagent'a devredilmez — **Fable modelli subagent dahil (v5)**; repo'ya giren her satır (boilerplate dahil) bizzat, aktif conversation içinde Fable'dan çıkar — normal modda yazarlık devri YOKTUR. Kritik artefaktları BİZZAT okur, final verdict verir, milestone statüsünü onaylar, commit'leri onaylar. **Fable incelemesi olmadan hiçbir final statü (PLANNED/DONE/PASSED/VERIFIED/APPROVED) ilan edilemez.**
- **Opus:** SADECE paralel keşif/araştırma hammaddesi. Taslak plan YAZAMAZ, mimari "aday karar" ÜRETEMEZ, kod YAZAMAZ; bulguları ham veridir, sentez ve karar Fable'da. İstisna: bütçe-fallback modu (aşağıda).
- **Sonnet:** Yazarlık-dışı destek, HIGH effort'ta: keşif/araştırma hammaddesi, checker/verifier koşuları (gsd-verifier, gsd-plan-checker, gsd-phase-researcher vb.), doğrulama komutları, kontrol taramaları. KOD/ARTEFAKT YAZAMAZ; bulgu raporlar ama final proje onayı VEREMEZ.
- **Haiku:** SADECE mekanik getir-götür: dosya getir, dosya varlığı kontrolü, grep sayımı, dosya adı listeleme, mekanik özet, ham metin çıkarma. **Kalite yargısı YOK. Verdict YOK. Onay YOK. "Passed" YOK. Mimari yargı YOK. Risk yargısı YOK. Milestone kararı YOK. Commit onayı YOK.** Haiku çıktısı verdict değil, HAM GİRDİdir.

**Checker PASS ≠ bitti (yönetişim maddesi):** Alt model (Sonnet dahil) "PASSED" dese bile iş bitmiş sayılmaz. Fable, "planned/done/approved" ilan etmeden önce üretilen artefaktları BİZZAT okur ve kendi yazılı verdict'ini üretir. Alt model çıktısını aynen aktarmak = yönetişim ihlali ([[opus-5-construction-governance]]).

**Bütçe-fallback modu (CEO onaylı, 2026-07-06):** Maddi kısıt durumunda onaylı fallback: Fable'ın yazdığı detaylı planı (MASTER-PLAN) **Opus 4.8 adım adım uygular**; verdict/diff-okuma kapıları mümkün olan en yüksek modelde kalır. Dürüst kalite beklentisi: tasarım kalitesi %100 korunur (plana gömülü), mikro-implementasyon (isimlendirme, hata mesajı, spec'in sustuğu edge-case refleksi) Opus seviyesinde kalır — "Fable tasarımı + Opus işçiliği". Verdict kapısı da düşerse güvence, plandaki yazılı adım-başı doğrulama komutlarına iner; MASTER-PLAN bu yüzden her adıma "çalıştır → şu çıktıyı gör" kontrolü gömer.

**Why:** (1) 2026-07-05: her GSD subagent'ı session modelini (claude-fable-5[1m]) miras aldı — $46.40'lık session'ın $46.14'ü yandı. Kök neden: `resolve_model_ids: "omit"`. Ders: `model=` her spawn'da açık; miras ancak BİLİNÇLİ karar olarak kullanılır (bkz. planner istisnası aşağıda). (2) 2026-07-06: gsd-plan-checker Haiku'da koştu ve Fable, 5 plan dosyasını okumadan Haiku'nun PASSED'ini son söz sayıp "PLANNED ✓" ilan etti — CEO yakaladı: zayıf modele büyük işin son kararı verilemez, Fable bizzat okumadan hiçbir şey onaylanamaz. (3) 2026-07-06 (v2): CEO, Opus-taslak+Fable-review örgüsünü reddetti — review yazarlık değildir; artefaktın kalite tavanını yazan belirler, reviewer sadece tabanı garanti eder.

**Observation/verification routing (CEO uzantısı):** Mekanik gözlem (screenshot, polling, log tail, tekrarlı durum kontrolü) ucuz subagent'lara gider (haiku salt-mekanikse; yorum gerekiyorsa sonnet). Fable dönen kanıtı OKUR ve karar verir. Tek atımlık komut (bir scrot, bir grep) subagent spawn'dan ucuz — inline Fable koşar. [[evidence-before-done]] her katmanda geçerli.

**How to apply:**
- Subagent spawn'da `model=` HER ZAMAN açıkça geçilir. **v5 (CEO, 2026-07-08): eski "gsd-planner/gsd-debugger Fable modelini miras alır, plan yazarlığı sayılır" istisnası İPTAL.** Plan/artefakt yazan subagent spawn edilemez — model claude-fable-5 olsa bile. GSD plan-phase akışında planner spawn'ı yerine Fable planları inline yazar. Config'deki `planner/debugger → claude-fable-5` override'ı yalnız kaza-backstop'udur (istem dışı spawn'da en azından Fable modeli çalışsın) — meşrulaştırma değildir. **Emsal kaydı:** Phase 5 planları (commit 0eef3b9) gsd-planner subagent'ıyla (claude-fable-5) yazıldı; Fable 9/9 planı bizzat okuyup verdict verdi; CEO 2026-07-08'de bu partiyi kabul etti ("plan kalsın + kural sıkılaşsın") — aynı yol bundan sonra ihlaldir.
- `.planning/config.json` backstop (v4, 2026-07-07): `model_profile: "adaptive"`, `resolve_model_ids: "resolve"`, `model_overrides`: **planner/debugger/executor → claude-fable-5** (yazarlık yine Fable modeli; varsayılan yine inline); phase-researcher/plan-checker/integration-checker/nyquist-auditor/verifier → sonnet. **Otomatik fan-out kapalı:** `parallelization=false`, `workflow.research/plan_check/verifier/nyquist_validation/pattern_mapper/ui_phase/ai_integration_phase/code_review/plan_review_convergence/node_repair=false`, `workflow.use_worktrees=false`, `hooks.workflow_guard=true`. Sonnet desteği böylece workflow varsayılanından değil, Fable'ın açık gerekçesinden doğar. Haiku hiçbir kalite kapısında seçilemez.
- Yürütme varsayılanı INLINE: onaylı plan varsa executor subagent'ı açılmaz, Fable doğrudan uygular; subagent yalnız yukarıdaki iki gerekçeyle.
- Haiku'ya verilebilecek işler: gsd-codebase-mapper tarzı salt mekanik tarama/özet, dosya listeleme, sayım. Verdict cümlesi kurduracak hiçbir prompt Haiku'ya gitmez.
- Usage hygiene: 4+ paralel session'dan kaçın; 150k+ bağlam maratonu yerine faz başına taze session; terminal session'ı için düz Fable 5 yeterli (`[1m]` değil).

**v12 (2026-07-26, U36): DENETİM HATTI ayrı bir hat oldu.** İnşaat yazarlığı hâlâ tek yazar (Opus 5 / Fable 5, inline). Yeni: en kritik kapıda (CEO kabul oturumu) denetçi ÇAPRAZ MODEL — Codex hattı (`codex exec -s read-only`), runtime konseyinin kullandığı borunun aynısı; Claude'u Claude denetlerse aynı kör noktayı paylaşır. Geniş salt-okur taramalarda Claude subagent yeter (Read/Grep/Glob, Bash yok). Detay: [[audit-twin-rule]].
