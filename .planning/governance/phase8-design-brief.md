---
name: phase8-design-brief
description: "CEO Faz 8 design vizyonu (2026-07-10 00:01): Burj Al Arab 7-yıldız lüks/elegans, 3 boyutlu, efsane modern + A1 kararları (02:35): WebGL yasağı KALKTI, 34\" ultrawide+çoklu ekran+TV modu, hedef donanım RTX 4090 Linux laptop, göz testi 'referans görselden güzel'"
metadata: 
  node_type: memory
  type: project
  originSessionId: 3d7148a7-6218-475f-a3f8-bda66a38008b
---

# Faz 8 Design Brief — CEO Vizyonu (2026-07-10 00:01, verbatim-özet)

"Mükemmel bir design istiyorum. **3 boyutlu, efsane modern**. Tam bir **büyük holdinge yaraşır** şekilde. Tıpkı dünyanın ilk 7 yıldızlı oteli **Burj Al Arab**'a girerken hissettiğin o **lüks ve elegantlık** — işte öyle."

**Çeviri (design dili):**
- Duygu hedefi: 7-yıldız otel lobisine giriş anı — awe + lüks + elegans; ucuz/şablonvari hiçbir şey yok
- Estetik: premium corporate-luxury; derinlik/3D efektler (katmanlı ışık, cam/derinlik, incelikli motion) — ama gösteriş kurumsal ağırlığı ezmez
- Kimlik: büyük holding ciddiyeti (DXB Global Technology Consultancy) — dashboard bir cockpit ama aynı zamanda şirketin yüzü
- "Efsane modern": 2026 state-of-the-art web estetiği; jenerik admin-panel görünümü İHLAL sayılır

**Yetki:** Tüm design skilleri açık; Claude design da aktive edilebilir (CEO açık izni). Bash/izin sorusu yok ([[ceo-delegation-rule]]).

**Bağ:** B3 giriş şartı hâlâ geçerli — design-bundle STUDY kanıtı olmadan design task başlamaz ([[design-bundle-phase8-bridge]]). Bu brief, study sonrası üretilecek UI-SPEC ve tüm görsel işin kalite pusulasıdır. PHASE-08 master plan LOCKED kararları (exception-first görünüm, risk-gruplu inbox, tazelik damgası, i18n tr/en, telefon-kullanılabilir) brief ile ÇELİŞMEZ — lüks estetik bu iskeletin üstüne giyilir.

# Amendment A1 — CEO kararları (2026-07-10, session-kaybı kurtarması)

Önceki session'ın son turlarında verilen 4 karar diske yazılmadan session kapandı; CEO handoff notuyla kurtarıldı ve UI-SPEC §10 Amendment Log'a commit edildi (08-UI-SPEC.md + 08-CONTEXT.md):

1. **WebGL/Three.js yasağı KALKTI** — render istemci GPU'sunda; "8GB VPS" gerekçesi client render'ı bağlamaz. İmza anlarıyla sınırlı (login, ambient derinlik, Horizon Line), CSS derinlik diline graceful fallback zorunlu, lazy chunk, LCP <2.5s dokunulmaz. Anti-slop yasakları WebGL'de de geçerli.
2. **34" ultrawide (3440×1440) + çoklu ekran + toplantı/TV modu** — ≥1920px'te grid genişler, letterbox yasak; TV modu = salt-okunur sunum görünümü (tip ~1.4×, chrome gizli, canlı paneller kalır).
3. **Hedef donanım profili: RTX 4090 Linux laptop** (CEO kontrol terminali; X230 profili aşıldı) — perf bütçesi üst-uç istemciye kalibre edilebilir, mobil taban ve Lighthouse hedefleri sürer.
4. **Göz testi ölçütü:** cockpit, referans mockup'tan (2026-07-10 "Gece Lobisi" artifact, obs S481) **daha güzel** olmak zorunda — eşitlik yetmez. Faz kapanış kabul adımı, ⚠ UNVERIFIED sınıfı (CEO gözü).

**Why:** Sessiz kayıp = master-plan-fidelity ihlali olurdu ([[master-plan-fidelity]]); CEO "hash yoksa kayıt yok say" dedi.
**How to apply:** Faz 8 görsel işlerinde UI-SPEC §10 A1 bağlayıcı; WebGL kullanan her iş fallback + LCP kanıtı üretir; faz kapanışında göz testi referans karşılaştırması CEO'ya sunulur.

# Amendment A2 — UI dili (CEO canlı emri, 2026-07-10 02:40)

**UI içerik dili iki dilli: İngilizce BİRİNCİL, Türkçe tam eş kapsamlı ikincil.** `DEFAULT_LOCALE = "en"`, root `lang="en"`; tek dilde eksik anahtar = fail; hard-coded string yasağı sürer; locale switch UI 08-07'de. Master-plan "i18n tr/en" LOCKED kararıyla çelişmez (iki dilli desteği şart koşar, birincil dili değil).
