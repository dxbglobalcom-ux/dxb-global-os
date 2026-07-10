# Phase 8 UI-SPEC — DXB Cockpit Design Contract

**Authored:** 2026-07-10, Fable 5 bizzat (⛔ FABLE-ONLY onay maddesi — MASTER-PLAN §6)
**Kaynaklar:** CEO brief ([[phase8-design-brief]]) · study-cards/design-bundle.md · 08-CONTEXT.md · STACK.md (Broadcast/Tailwind v4/shadcn+Aceternity)
**Bağlayıcılık:** Cockpit'e giren her UI satırı bu sözleşmeye uyar. Sapma = plan deviation kaydı + Fable onayı. Bu spec stitch-DESIGN.md semantiğiyle yazıldı; execute'ta impeccable `init` PRODUCT.md/DESIGN.md'yi buradan türetir.

---

## 1. Visual Theme & Atmosphere

**"Gece lobisi" (The Night Lobby).** Burj Al Arab'a gece girişi: koyu, sıcak, katmanlı ışık; altın tek disiplinli vurgu; her yüzey işlenmiş hisseder (double-bezel), hiçbir şey bağırmaz. Cockpit yoğun veri taşır ama bir kokpitin ciddiyetiyle — lüks his malzemeden (derinlik, ışık kenarları, spring motion, boşluk ritmi) gelir, süsten değil.

- Register: **product** (design SERVES the product — impeccable product register)
- Dials: VARIANCE 6 · MOTION 5 · DENSITY 7 (ana cockpit) / 5 (CRM+ayarlar) / 3 (login)
- Duygu hedefi: giriş anında awe; kullanım boyunca sükûnet + tam kontrol; asla "jenerik admin template"
- **"3 boyutlu" tanımı:** CSS derinlik dili — katman hiyerarşisi (bg → panel shell → panel core → floating chrome), hue-tinted çift gölge, iç ışık kenarı, sabit-chrome cam yüzeyler, spring micro-motion. **Three.js/WebGL İZİNLİ (Amendment A1.1, 2026-07-10):** yalnız imza anlarında — login sahnesi, cockpit ambient derinlik katmanı, Horizon Line derinliği; veri-UI (tablo/panel/form) DOM+CSS kalır. Feature-detect + `prefers-reduced-motion`'da CSS derinlik diline sessiz düşüş zorunlu; three.js chunk lazy-load, LCP <2.5s hedefini bloklayamaz.

## 2. Color Palette & Roles (OKLCH; Tailwind v4 `@theme` token'ları)

Dual-mode; **dark birincil ve marka-taşıyıcı**. Sayfa içi tema karışımı yasak. Saf `#000`/`#fff` yasak.

### Dark (birincil) — semantic token → OKLCH
| Token | OKLCH | Rol |
|---|---|---|
| `--bg` | `oklch(0.155 0.008 75)` | Sayfa zemini — derin warm-charcoal (gece lobisi duvarı) |
| `--surface` | `oklch(0.195 0.010 78)` | Panel dış kabuğu (shell) |
| `--surface-2` | `oklch(0.235 0.012 80)` | Panel iç çekirdeği / yükseltilmiş yüzey |
| `--surface-3` | `oklch(0.28 0.013 82)` | Hover/aktif satır, popover |
| `--ink` | `oklch(0.955 0.006 90)` | Birincil metin — sıcak beyaz |
| `--ink-2` | `oklch(0.72 0.010 85)` | İkincil metin/etiket (AA: yalnız ≥14px medium üstü) |
| `--line` | `oklch(0.32 0.012 80 / 0.7)` | Hairline ayraçlar (1px) |
| `--edge-light` | `oklch(1 0 0 / 0.06)` | İç üst ışık kenarı (inset highlight — "3D" imzasının yarısı) |
| `--accent` | `oklch(0.80 0.115 92)` | Şampanya altını — CTA, aktif durum, focus, Horizon Line. **Yüzeyin ≤%8'i** |
| `--accent-press` | `oklch(0.70 0.105 88)` | Accent hover/pressed |
| `--on-accent` | `oklch(0.20 0.02 85)` | Altın üzeri metin (koyu) |
| `--ok` | `oklch(0.72 0.14 155)` | Başarı/para-GİRİŞİ akışı |
| `--warn` | `oklch(0.74 0.16 55)` | Uyarı/medium risk — turuncuya çekilmiş, altından ayrışır |
| `--danger` | `oklch(0.63 0.20 25)` | Hata/high-risk/para-ÇIKIŞI bekleyen |
| `--info` | `oklch(0.70 0.10 240)` | Nötr bilgi/işlemde |

### Light ("gündüz operasyon")
| Token | OKLCH | Not |
|---|---|---|
| `--bg` | `oklch(0.975 0 0)` | TRUE off-white, chroma 0 (cream-tell bandına girilmez; sıcaklık accent+yüzeyde) |
| `--surface` | `oklch(1 0 0 / 0.85)` üzeri `oklch(0.99 0.002 90)` | Beyaz panel, hairline'la ayrışır |
| `--surface-2` | `oklch(0.965 0.004 90)` | İç çekirdek |
| `--ink` | `oklch(0.205 0.012 80)` | Warm-black metin |
| `--ink-2` | `oklch(0.45 0.010 80)` | İkincil (AA ✓) |
| `--line` | `oklch(0.87 0.006 85)` | Hairline |
| `--accent` | `oklch(0.60 0.115 85)` | Altın koyulaştı (beyaz üstünde AA-large + 3:1 UI kontrastı için) |
| `--on-accent` | `oklch(0.985 0.005 90)` | |
| status | dark setinin L−0.06 / C+0.01 uyarlaması | AA korunur |

**Kurallar:** Renk tek gösterge OLAMAZ (ikon+metin eşlik eder). Status renkleri yalnız durum semantiğinde — dekorasyonda asla. Gradyan: yalnız Horizon Line (accent→transparent, 1px) + login sahnesindeki tek ambient ışık; başka gradyan yok. AI-purple, neon glow, gradient-text YASAK.

## 3. Typography

| Rol | Font | Spec |
|---|---|---|
| UI/Display | **Geist Sans** (`next/font`, self-host) | Başlık ağırlıkla hiyerarşi: panel title 15px/600, sayfa başlığı 22px/600, cockpit display 28px/650 `tracking-[-0.01em]`. Dev hero yok — cockpit bağırmaz |
| Body | Geist Sans | 14px/400, `leading-relaxed`, uzun metin `max-w-[65ch]` |
| Data/Mono | **Geist Mono** | TÜM sayısal veri (maliyet, sayaç, süre, ID, damga) — istisnasız; tabular-nums |
| Micro | Geist Sans | 11.5px/500 etiketler; UPPERCASE+tracking eyebrow deseni YASAK (bölüm başına eyebrow kuralı: cockpit'te hiç) |

Yasak: Inter/Roboto/Arial; cockpit chrome'da HER TÜRLÜ serif; `clamp()` display >2.5rem cockpit içinde; italik descender kırpması (`leading-[1.1]` min).
i18n (**A2**): **iki dilli — `en` birincil, `tr` tam eş kapsamlı ikincil.** Her UI metni iki katalogda da yaşar (`messages/en.json` + `tr.json`); tek dilde eksik anahtar = fail; hard-coded string yasağı sürer. TR diakritikleri (ş, ğ, İ) Geist'te tam; her iki dilde başlıklarda `text-wrap: balance`.

## 4. Component Stylings

**Taban:** shadcn/ui primitifleri + Tailwind v4 token'ları; Aceternity yalnız login sahnesi + Horizon Line gibi tekil imza anlarında (cockpit içinde showcase efekti yasak). İkon: `@phosphor-icons/react`, tek ağırlık (regular), `strokeWidth` sabit, boyut token'ları 16/20/24.

- **Panel (Double-Bezel — imza yüzey dili):** dış kabuk `--surface`, `rounded-[1.25rem]`, `p-1.5`, 1px `--line` çerçeve + hue-tinted ambient gölge; iç çekirdek `--surface-2`, `rounded-[calc(1.25rem-0.375rem)]`, üstte `--edge-light` inset highlight. Panel başlığı + FreshnessStamp iç çekirdeğin üst satırında. **Nested card yasak** — panel içinde kart açılmaz; iç gruplama `divide-y --line` ile.
- **Buton:** primary = accent dolgu, pill (`rounded-full px-5 h-10`), `active:scale-[0.98]` + `-translate-y-[1px]` tactile; secondary = ghost 1px `--line`; destructive yalnız gerçek yıkıcı işlemde. Tek satır etiket (sarma = fail). Sayfa başına aynı intent tek etiket.
- **ApprovalCard (GATE-03 görsel dili):**
  - `high`: tek-tek; panelin sol iç kenarında DEĞİL (side-stripe yasak) — üst şeritte `--danger` durum rozeti + tam payload açık + çift-teyit butonu (2. tık 600ms sonra aktifleşir)
  - `medium`: grup listesi, satır başına özet + genişletilebilir payload
  - `low`: yoğun satırlar + tek "Tümünü onayla (n)" accent butonu
  - Para-ÇIKIŞI rozeti her zaman görünür (B7b); para-GİRİŞİ inbox'a düşmez, feed'de `--ok` işaretli akar
- **DataTile (COST-04):** kart değil — panel içinde plain layout: mono büyük değer (20px/650) + 12px etiket + mini trend; DENSITY 7'de hairline gruplu. "Hero-metric şablonu" (dev sayı+gradyan) yasak.
- **FreshnessStamp:** her canlı panelde sağ üst: `14:32 itibarıyla` (mono 11.5px `--ink-2`); Broadcast kanalı koptuğunda `--warn` nokta + "canlı değil — son: 14:32" durumuna döner. Bağlantı durumu global olarak Horizon Line'ın sağ ucunda da yaşar.
- **CommandBar (DASH-02):** desktop `⌘K` + topbar'da kalıcı giriş; mobil alt-sabit FAB-şerit. Açılınca modal-katman (backdrop-blur İZİNLİ — sabit overlay), TR/EN placeholder rotasyonu; gönderim → intent zinciri durumu toast değil "işlem şeridi"nde izlenir.
- **Skeleton:** son layout'un şekliyle birebir shimmer; dairesel spinner yasak. **EmptyState:** kompoze (ikon + tek cümle + tek eylem); boş inbox = `--ok` "Kapı temiz" sahnesi.
- **Toast/feedback:** transient işlemler sağ-alt, 1 satır; kritik hata inline panel bandı. Modal scrim `oklch(0 0 0 / 0.55)`.
- **Focus:** 2px accent ring + 2px offset — her interaktif eleman, her iki temada görünür.

## 5. Layout Principles

- **AppShell:** sol ince rail (ikon-nav, 64px; hover'da 220px genişler, mobilde alt-tab bara döner) + üst **Horizon Line şeridi** + içerik ızgarası `max-w-[1600px]`. Cam (backdrop-blur) YALNIZ rail+topbar+modal (sabit chrome); scroll içeriğinde asla.
- **Horizon Line (imza):** topbar altında 1px accent gradyan hat; üzerinde şirket nabzı: aktif görev · bekleyen onay · bugünkü maliyet · canlılık. Tüm sayfalarda sabit — cockpit'in panoramik ufku.
- **Cockpit ana sayfa (exception-first):** 12-col grid: sol 7-8 col "Beni bekleyenler" (onay özeti) + "Az önce değişti" akışı; sağ 4-5 col rail: maliyet DataTile'ları + ajan rosteri. Asimetri sabit — 3'lü eş kart dizisi yasak. "Tüm ajanlar duvarı" yasak.
- Z-scale semantik: `base(0) < sticky(10) < dropdown(20) < backdrop(30) < modal(40) < toast(50) < tooltip(60)` — arbitrary z yasak.
- Spacing ritmi 4/8: panel iç 16/20, panel arası 20/24, bölüm 32/40. `h-screen` yasak → `min-h-[100dvh]`.
- Responsive: <768px tek kolon; rail → alt-tab; tablolar → kart-satır dönüşümü (yatay scroll yalnız kendi konteynerinde); touch hedefi ≥44px; safe-area insets (telefon).
- **Ultrawide + çoklu ekran (A1.2):** birincil CEO donanımı 34" ultrawide (3440×1440) + çoklu ekran. ≥1920px'te içerik letterbox'ta ölmez: `max-w-[1600px]` kalkar, grid genişler (orta akış alanı büyür, sağ rail sabit genişlikte kalır, panel iç yoğunluğu artmaz — boşluk ritmi ölçeklenir). Dev boş margin = fail.
- **Toplantı/TV modu (A1.2):** salt-okunur sunum görünümü (mod toggle / `?mode=tv`): tip skalası ~1.4×, DENSITY 5, interaktif chrome gizli, canlı paneller + Horizon Line + FreshnessStamp kalır. Faz 8 kapsamı: mod altyapısı + cockpit ana görünümü.
- Drill-down (DASH-03): görev sayfası = tek görevin audit.trace kronolojisi, dikey zaman hattı, mono damgalar; firehose görünümü yok.

## 6. Motion & Interaction

- Token'lar: `--dur-fast:150ms · --dur:250ms · --dur-slow:400ms`; ease `cubic-bezier(0.22,1,0.36,1)` (out-quint); spring (Motion): `stiffness:100 damping:20`.
- Panel giriş: 24px fade-up + 40ms stagger (yalnız ilk mount); canlı veri değişimi: değer flip + 600ms accent-soluk pulse; onay kararı: satır kapanış animasyonu (yükseklik+opacity).
- **Login→cockpit "kapı açılışı" (tek seferlik imza):** login kabul → sahne 700ms'de yatay ışık hattı boyunca açılır (clip-path), Horizon Line yerleşir. Session başına 1 kez.
- Perpetual loop yalnız 2 yerde: Horizon Line canlılık nabzı (2.4s soft pulse) + "işlemde" durum noktası. Başka sonsuz animasyon yok.
- `prefers-reduced-motion`: tüm geçişler anlık/crossfade; loop'lar durur. `window scroll` listener yasak (Motion `useScroll`/IO). Animasyon yalnız transform+opacity.

## 7. Anti-Patterns (bağlayıcı yasaklar — Pre-Flight'ta mekanik taranır)

Inter/serif-cockpit · saf #000/#fff · AI-purple/neon glow/gradient-text · side-stripe border · hero-metric şablonu · eş kart grid'i · nested cards · her bölümde eyebrow/numaralı marker · cream-default zemin · 3-eş-kolon özellik dizisi · dairesel spinner · placeholder-as-label · emoji-ikon · `h-screen` · scroll-listener · scroll içeriğinde blur · arbitrary z-index · fake-precise sayı · "John Doe"/Acme seed verisi (gerçekçi TR iş verisi kullanılır) · em-dash UI metinlerinde · toast'a gömülmüş kritik hata · per-action onay popup'ı (GATE-03 ihlali).

## 8. Sayfa Notları

| Sayfa | Özel kural |
|---|---|
| `(auth)/login` | Tek sahne, DENSITY 3: koyu zemin + tek ambient altın ışık + DXB monogram + minimal form (Supabase Auth+2FA). Pazarlama metni yok |
| `(cockpit)/page` | Exception-first ana görünüm (yuk. §5); ilk yük <2s hedef; her panel FreshnessStamp'li |
| `approvals` | Risk-grup sırası: high üstte tek-tek; batch yalnız low; gate-fatigue bandı 50+ |
| `costs` | COST-04 kırılım: dept/model/mode toggle; toplamlar SQL ile birebir; grafik: dataviz disiplini (tek hue skalası + status istisnası), pie yerine bar/line |
| `tasks/[id]` | Audit zaman hattı; her satır: damga(mono) + aktör + eylem + payload disclosure |
| `crm/*` | DENSITY 5; tablo-önce; CEO yazımı yalnız izinli alanlar (RLS ile hizalı form disable) |

## 9. Doğrulama (Evidence hedefleri — plan adımlarına bağlanır)

1. **Kontrast:** tanımlı çiftlerin tamamı ölçülür (script: culori ile OKLCH→sRGB + WCAG oranı): `--ink/--bg ≥ 7:1`, `--ink-2/--surface-2 ≥ 4.5:1` (kullanıldığı boyutta), `--on-accent/--accent ≥ 4.5:1`, status/surface ≥ 3:1 (UI). Çıktı tablo halinde VERIFICATION'a.
2. **Pre-Flight mekanik tarama:** yasak desen grep seti (`#000000`, `h-screen`, `addEventListener('scroll'`, `z-[9`, `border-l-4`, `Inter`, emoji-in-JSX…) → 0 eşleşme.
3. **Playwright:** 375px/768px/1440px screenshot seti + reduced-motion modu + her iki tema; yatay taşma kontrolü.
4. **Lighthouse mobile a11y ≥ 90** (DASH kabulü) + LCP <2.5s cockpit.
5. **Görsel nitelik göz testi (A1.4):** cockpit, referans mockup'tan (2026-07-10 "Gece Lobisi" görsel referans artifact'i, obs S481) **daha güzel** görünmek zorunda — eşitlik yetmez, geçmek gerekir. → ⚠ UNVERIFIED sınıfı, CEO göz testi (faz kapanış adımı).

---
**⛔ FABLE VERDICT (UI-SPEC onayı):** Bu sözleşme CEO brief'ini (lüks/3D/holding ciddiyeti) ölçülebilir token+kural setine çevirir; study-card bulgularıyla (sans-only, CSS-derinlik, anti-slop yasakları) ve MASTER-PLAN LOCKED kararlarıyla çelişkisiz; Broadcast/i18n/RLS mimarisine dokunmaz. ONAYLANDI — cockpit üretimi bu sözleşme altında başlayabilir. — Fable 5, 2026-07-10

---

## 10. Amendment Log

### A1 — 2026-07-10 02:35 (CEO kararları; session-kaybı kurtarması, kaynak: CEO handoff notu + obs #2833)

| # | CEO kararı | Spec etkisi |
|---|---|---|
| A1.1 | WebGL/Three.js yasağı KALKTI | §1 güncellendi. Gerekçe revizyonu: render istemci GPU'sunda çalışır; "8GB VPS" kısıtı sunucu süreçlerine aittir, client render'ı bağlamaz. Disiplin korunur: imza anlarıyla sınırlı, graceful CSS fallback, lazy chunk, LCP hedefi dokunulmaz |
| A1.2 | 34" ultrawide + çoklu ekran + toplantı/TV modu | §5'e iki madde eklendi (ultrawide grid genişlemesi; salt-okunur TV modu — Faz 8'de altyapı + ana cockpit) |
| A1.3 | Hedef donanım profili: RTX 4090 Linux laptop (CEO kontrol terminali) | Performans bütçesi üst-uç istemciye kalibre edilebilir; mobil/düşük-uç destek ve §9 Lighthouse hedefleri AYNEN sürer (4090 tavanı belirler, tabanı değil) |
| A1.4 | Göz testi: "referans görselden güzel olmalı" | §9.5 güncellendi — faz kapanış kabulü referans mockup'ı GEÇMEK zorunda, eşitlik yetmez |

**⛔ FABLE VERDICT (A1):** Dört CEO kararı spec'e çelişkisiz işlendi. Anti-slop yasakları (§7), altın disiplini (≤%8), token sistemi, LOCKED mimari ve motion disiplini aynen yürürlükte; WebGL izni bu yasakları esnetmez (neon/glow/AI-purple WebGL'de de yasak). ONAYLANDI. — Fable 5, 2026-07-10

### A2 — 2026-07-10 02:40 (CEO emri, canlı)

| # | CEO kararı | Spec etkisi |
|---|---|---|
| A2.1 | UI içerik dili **iki dilli: İngilizce BİRİNCİL, Türkçe tam ikincil** | §3 i18n satırı güncellendi; `DEFAULT_LOCALE` en'e döner (`lib/i18n.ts` + root `lang`); tr kataloğu eş kapsamlı kalır, locale switch 08-07'de |

**⛔ FABLE VERDICT (A2):** Master-plan "i18n tr/en" LOCKED kararı iki dilli desteği şart koşar, birincil dili değil — çelişki yok. Katalog altyapısı (08-01) zaten simetrik; değişiklik varsayılan dil + `lang` attribute. ONAYLANDI. — Fable 5, 2026-07-10

### A3 — 2026-07-10 03:35 (makine-kaynaklı token kalibrasyonu; §9.1 audit)

| # | Değişiklik | Gerekçe |
|---|---|---|
| A3.1 | Light tema: `--accent` 0.60→0.55, `--accent-press` 0.54→0.49, `--ok` 0.66→0.60, `--warn` 0.68→0.63 (OKLCH L) | `scripts/contrast-audit.mjs` ilk koşusu 3 FAIL verdi (on-accent/accent 3.81<4.5; ok/surface 2.83<3; warn/surface 2.95<3). Kalibrasyon sonrası 14/14 PASS iki temada. §2 "status = dark seti L−0.06" kuralı bu tablolarla güncellenmiş sayılır — ölçüm kuralı ezer |

**⛔ FABLE VERDICT (A3):** Göz kararı değil ölçüm; dark tema dokunulmadı, marka-taşıyıcı yüzey aynen. ONAYLANDI. — Fable 5, 2026-07-10
