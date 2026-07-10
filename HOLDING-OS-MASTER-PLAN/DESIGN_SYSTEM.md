# DESIGN_SYSTEM — DXB GLOBAL EXECUTIVE COMMAND CENTER GÖRSEL KONTRATI

> Dalga 2 · Yazar: Fable 5 bizzat · Üst: [[CEO_COMMAND_CENTER_SPEC]] · Direktif kaynağı: §32 (içerik listesi birebir) + §§3-8, 24, 26-28, 30, 33-35 + A1 (WebGL serbest, 34" ultrawide, TV modu, RTX 4090 hedef) + A2 (EN birincil, TR tam ikincil).
> Hüküm: "yalnızca görsel açıklama değil, uygulanabilir tasarım standardı" — her token kod değeriyle yazılmıştır.
> Faz-8 design brief bağı: Burj Al Arab 7-yıldız lüks/elegans; jenerik admin panel = ihlal; göz testi çıtası "referans görselden güzel".

## 1. Amaç

Tek görsel dil: 26+ sayfanın tamamı aynı premium ürün ailesinden görünür (§31). Bu dosya, Tailwind v4 `@theme` token setinin ve component state kurallarının NORMATİF kaynağıdır — koddaki her renk/boşluk/gölge buradan türetilir; dosyada olmayan görsel değer PR'a giremez.

## 2. Gereksinimler / Brand principles (§32.1)

- B1. Controlled Complexity (§4): güçlü + detaylı, ama kusursuz hiyerarşi. Aşırı minimal boşluk YASAK, oyuncak kalabalık YASAK.
- B2. Malzeme gerçeği (§6): flat yüzey yok — her panelde ana yüzey + kenar ışığı + iç/dış gölge + hafif reflection + katman farkı.
- B3. Işık süs değil hiyerarşi aracıdır (§7): glow her yerde YASAK; neon/cyberpunk çizgi YASAK.
- B4. Gold disiplini (§5): champagne gold yalnız aktif durum, kritik vurgu, seçim, premium kenar, ana CTA, CEO yetkisi, önemli metrik. Parlak sarı / turuncu gold / kahverengi YASAK (göz testi RET dersi: kahverengi glow yasak).
- B5. Tek tema: koyu (§4). Light mode YOK — kayıtlı karar, viewer theme toggle'ı üretilmez.
- B6. İki dil doğuştan (A2): her component metni i18n anahtarıyla; EN birincil, TR tam.
- B7. §35 yasak listesi bu dosyanın lint filtresidir (aşağıda ilgili bölümlere gömülü).

## 3. Mimari — token katmanları

```
tokens.css (@theme, bu dosyadan üretilir)
  └─ primitives: renk/boşluk/radius/gölge/motion ham değerleri
  └─ semantic: --surface-*, --accent-*, --status-*, --text-* rol tokenları
  └─ component: panel/kart/buton/chart başına türetilmiş değerler
apps/dashboard/src/styles/tokens.css  →  Tailwind v4 utilities  →  komponentler
```

⛔ kritik karar: komponentler SEMANTIC katmandan tüketir; primitive'e doğrudan referans code review'da RET (tema bütünlüğü tek dosyadan döner).

## 4. Veri modeli — Color & Surface tokens (§32.2-3)

### Yüzeyler (§5 ana yüzey seti)

| Token | Değer | Kullanım |
|-------|-------|----------|
| `--surface-void` | `#060709` | Sayfa arka planı en dip katman |
| `--surface-obsidian` | `#0B0D11` | Shell zemin (deep obsidian) |
| `--surface-carbon` | `#10131A` | Panel ana yüzeyi (carbon black) |
| `--surface-graphite` | `#161A22` | Yükseltilmiş panel / kart |
| `--surface-anthracite` | `#1D222D` | Hover yüzeyi / inset panel dolgusu |
| `--surface-titanium` | `#272E3B` | En üst katman (dropdown, tooltip zemin) |
| `--surface-glass` | `rgba(16,19,26,.72)` + `backdrop-blur:14px` | Smoked glass (drawer, modal, command palette) — ucuz glassmorphism yasak: blur 14px SABİT, opacity <.6 kullanılmaz |

### Accent (§5 accent seti — gold disiplini B4)

| Token | Değer | Kullanım |
|-------|-------|----------|
| `--accent-champagne` | `#D8B98C` | Birincil accent: aktif/seçili/CTA/CEO yetkisi |
| `--accent-brushed` | `#B99C6B` | İkincil: pasif premium kenar, ikon vurgusu |
| `--accent-amber` | `#DCA55C` | Sıcak uyarı vurgusu (kıt kullanım) |
| `--accent-copper` | `#BE8663` | Grafik kategorik paletinde |
| `--accent-platinum` | `#C9CFD9` | Nötr premium (badge, ayraç ışığı) |
| `--accent-ivory` | `#F0EBDF` | Açık vurgu metni (büyük metrik değerleri) |

### Status (renk-bağımsız gösterim şart — §30)

| Token | Değer | Not |
|-------|-------|-----|
| `--status-ok` | `#63B389` | doygunluğu kısılmış zümrüt; neon yeşil değil |
| `--status-warn` | `#D9A441` | amber ailesi |
| `--status-danger` | `#C4605C` | kontrollü kırmızı; alarm neonu değil |
| `--status-info` | `#7FA7C9` | soğuk mavi — cyberpunk parlaklığına çekilmez |
| `--status-critical` | `#E0655F` + champagne kenar | Emergency seviyesi; "her şeyi kırmızı yapma" (§22) — yalnız Critical/Emergency |

### Metin

`--text-primary #E9E7E2` · `--text-secondary #A8ABB4` · `--text-muted #6E7380` · `--text-inverse #0B0D11` (gold CTA üstü) · sayısal metrikler `--accent-ivory` + tabular-nums.

## 5. Component yapısı — Spacing / Radius / Border / Shadow (§32.4-7)

- **Spacing:** 4px taban; ölçek `4 8 12 16 20 24 32 40 48 64`. Panel iç dolgu 20; kart 16; yoğun tablo hücresi 8×12. Boşluk enflasyonu = "çok fazla boş alan" ihlali (§35).
- **Radius:** `--r-s 6px` (input/badge) · `--r-m 10px` (kart/panel) · `--r-l 14px` (modal/drawer). Pill/daire kart YASAK ("büyük yuvarlak kartlar", "fazla radius" §35); tam daire yalnız avatar + status dot.
- **Border:** 1px `rgba(255,255,255,.06)` default; aktif/seçili: 1px `rgba(216,185,140,.35)` (champagne kenar ışığı); inset panel: border yok + iç gölge.
- **Shadow / elevation (katman farkı B2):**

| Seviye | Değer | Kullanım |
|--------|-------|----------|
| `--e0` | yok | zemin |
| `--e1` | `0 4px 12px rgba(0,0,0,.35)` + `inset 0 1px 0 rgba(255,255,255,.04)` | panel |
| `--e2` | `0 12px 32px rgba(0,0,0,.45)` + aynı inset | kart hover, floating dock |
| `--e3` | `0 24px 64px rgba(0,0,0,.55)` | drawer, modal, palette |
| Reflection | üstten `linear-gradient(rgba(255,255,255,.03), transparent 40%)` overlay | her panel — "hafif reflection" |

## 6. Backend yapısı — token dağıtımı

Tokens tek dosya: `apps/dashboard/src/styles/tokens.css` (`@theme` bloğu). Chart renk eşlemesi TS sabiti `src/design/chart-palette.ts` (CSS var okur, hardcode hex YASAK). İkonlar: `src/design/icons/` tek kaynak (aşağıda §32.9). Doğrulama: `grep -rn "#[0-9A-Fa-f]\{6\}" src/ --include="*.tsx" | grep -v tokens.css` → hedef 0 (hex kaçağı yok).

## 7. Frontend yapısı — Typography scale (§26, §32.8)

- En fazla iki aile (§26) + veri monosu: **Display** = yüksek-kalite grotesk (aday: Space Grotesk / Geist; ⛔ final aile seçimi execution'da CEO göz testiyle) · **Body/UI** = Inter (variable, self-host) · **Data/ID** = Geist Mono (tabular).
- Ölçek (px / weight / tracking): `display-xl 44/600/-0.02em` (Overview ana metrik) · `display 32/600/-0.02em` · `h1 24/600/-0.01em` · `h2 19/600` · `h3 16/600` · `body 14.5/450` · `body-s 13/450` · `caption 12/500/+0.02em` · `label-caps 11.5/600/+0.08em uppercase` (panel başlıkları — otoriter, kontrollü aralık).
- "Çok küçük okunamaz yazı" YASAK (§35): 11.5px altı font PR'a giremez; yoğun tablolarda bile body-s taban.

## 8. API'ler — Icon system (§27, §32.9)

- Taban: Lucide (ince, teknik, tutarlı) 1.5px stroke, 16/20/24 boyut; renk `--text-secondary`, aktif `--accent-champagne`.
- Özel DXB seti (gerektikçe, aynı 1.5px dilinde): DxbMark (dikey-bar skyline — mevcut, KALIR; uydurma logo YASAK), model-node, org-node, hook-status, risk-tier ikonları.
- İkon tek başına anlam TAŞIMAZ (§30 renk-bağımsızlık): status ikonları şekil+renk çifti (ok=daire, warn=üçgen, danger=kare, critical=çift-kenar).

## 9. Event yapısı — Motion tokens (§28, §32.10)

| Token | Değer | Kullanım |
|-------|-------|----------|
| `--t-fast` | `120ms` | hover, focus, press |
| `--t-base` | `200ms` | panel expansion, fade |
| `--t-slow` | `320ms` | drawer/modal giriş |
| `--t-ambient` | `480ms+` | arka plan ışık katmanları |
| `--ease-refined` | `cubic-bezier(0.22,1,0.36,1)` | TEK easing — bounce/elastic/cartoon YASAK (§28) |

Desenler: soft hover elevation (`translateY(-1px)` + e1→e2 + kenar ışığı fade-in) · data pulse (opacity .82→1, 1.2s, yalnız canlı değer değişiminde) · live status transition (renk cross-fade, zıplama yok) · premium press (scale .985, 120ms). `prefers-reduced-motion`: ambient katman + pulse kapanır, geçişler 0ms'e düşer (§30).

## 10. State yönetimi — Component states (§32.11 + §33)

§33'ün 29 zorunlu component'i × 8 state matrisi. Genel kural seti (tek tek ezber yerine türetme kuralı — tutarlılık §31):

| State | Kural |
|-------|-------|
| Default | semantic yüzey + e1 + 1px nötr border |
| Hover | yüzey bir kademe açılır (carbon→graphite) + e2 + kenar ışığı %35 |
| Active/Pressed | press deseni + kenar ışığı %60 |
| Selected | champagne 1px kenar + sol 2px accent bar + label-caps gold |
| Disabled | opacity .45 + pointer yok + gölge e0 (renk değişmez — soluk gold yasak) |
| Loading | skeleton shimmer (aşağıda §34) — spinner yalnız buton-içi |
| Error | `--status-danger` kenar + ikon + kısa neden + retry affordance |
| Critical | `--status-critical` çift-kenar + arka plan `rgba(224,101,95,.06)` — yalnız Critical/Emergency seviyesi |

Component-özel notlar (kritik olanlar): **Executive KPI Module** — değer display-xl ivory, delta ok+renk+yüzde, drillHref zorunlu (CC-SPEC §7). **Holding Health Panel** — radial gösterge ince halka (3px), skor display-xl, explain drawer tetiği görünür. **Live Agent Card** — durum şerit solda 2px, model badge, süre tabular. **Approval Card** — risk badge + para-çıkışı ise kilit ikonu + gold çift kenar. **Advanced Data Table** — satır 40px, zebra YOK (yüzey farkı yerine 1px ayraç), sıralama/filtre başlıkta, sanal scroll >100 satır. **Command Palette** — glass yüzey e3, giriş 15px, sonuç grupları label-caps.

## 11. Database tabloları / 12. İlişkiler

Bu dosya DB varlığı tanımlamaz. Tek kesişim: widget layout şeması `settings_values(scope='ceo_dashboard')` ([[CEO_COMMAND_CENTER_SPEC]] §10) — görsel grid bu şemadan render edilir.

## 13. Yetkilendirme — Control Mode görsel kontratı (§17)

Read-only kip: mutasyon affordance'ları render edilmez (disabled değil — YOK). Control Mode ON: (1) command bar'da gold "CONTROL" rozeti + ince üst çizgi `--accent-champagne` %40, (2) düzenlenebilir yüzeylerde hover'da kalem/tutamaç belirir, (3) drag hedefleri kesikli champagne kenarla yanar. Korkutucu overlay/kırmızı banner YASAK (§17 "korkutucu görünmemeli").

## 14. Logging / 15. Audit — görsel karşılıklar

Audit Log Row: zaman (mono) · aktör badge · işlem · etki alanı · change_id kopyalanabilir; diff görünümü inset panel içinde ± satır renkleri (`--status-ok/danger` %70 doygunluk). "Değişiklik kaydedildi → Geri Al" toast: glass yüzey, 6sn, undo butonu gold metin.

## 16. Security — görsel sınıflar

Para-çıkışı yüzeyleri (approval money_out): gold çift-kenar + kilit ikonu + "CEO onayı gerekir" caption — sistemin geri kalanından görsel olarak AYRIŞIR (B7b görünürlüğü). Permission Badge: seviye adı + renk-bağımsız çentik sayısı (1-5).

## 17. Error / 18. Retry / 19. Fallback — Error/Empty/Loading states (§34, §32.16-19)

- **Empty:** bağlamsal metin + sonraki adım önerisi + ilgili aksiyon ("No data" tek başına YASAK §34). Örn. `/ops/workflows` boş → "No workflows running. 3 scheduled for tonight — view schedule".
- **Loading:** premium skeleton — yapısal placeholder (gerçek layout iskeleti) + soft shimmer (`rgba(255,255,255,.04)` sweep, 1.6s); aşırı spinner YASAK.
- **Error:** widget çerçevesinde kalır (boundary), neden + retry; sayfa geneli hata yalnız shell çökerse.
- **Success:** sessiz onay — toast + yeşil çentik; konfeti/kutlama animasyonu YASAK (cartoon).
- **Critical:** §10 Critical state + sağ ray'a sabitlenir + command bar rozeti.

## 20. Test planı / 21. Acceptance criteria

- Kontrast scripti (mevcut login altyapısı genelleşir): tüm text/surface çiftleri WCAG — body ≥4.5:1, large/display ≥3:1 → rapor 100% PASS.
- Hex kaçağı grep'i (bkz. §6) → 0.
- Görsel regresyon: Playwright screenshot seti (10 ekran §37) — piksel diff'i değil, göz testi girdisi (⚠ UNVERIFIED CEO onayına kadar).
- §38 görsel maddeleri ("renk sistemi ucuz görünmüyor", "gold dengeli", "flat görünmüyor", "materyal derinliği var") kabulü CEO göz testindedir; makine kanıtı token uyumudur.

## 22. Migration planı / 23. Rollback planı

- Mevcut dashboard stilleri `(legacy)` route group'ta izole kalır; tokens.css yalnız `(command)` shell'ine uygulanır — çakışma yok.
- Login "Golden Threshold" stilleri KALIR; 3D hover upgrade bu token setinden besleneceği için login'e ikinci tema sızmaz.
- Rollback: tokens.css + design/ dizini tek commit'te geri alınır; legacy hiç etkilenmez.

## 24. Uygulama sırası (§36: önce sistem, sonra ekran)

1. `tokens.css` + font self-host + icon taban → `pnpm --filter dashboard build` → exit 0
2. Çekirdek primitives: panel/kart/buton/badge/tablo/form + state matrisi → Storybook YOK (token maliyeti) — yerine `/design-audit` gizli route'u: tüm component×state matrisi tek sayfada render → Playwright screenshot → göz testi
3. Grid + shell yüzeyleri (5 katman) → 4. Chart sistemi → 5. Ekranlar (CC-SPEC §24 sırası)

Opus-devralma: bu dosyadaki token değerleri DEĞİŞTİRİLEMEZ sabitlerdir; Opus yalnız yeni component'i mevcut kurallardan türetir. ⛔ yeni renk/font/easing eklemek = en güçlü model + CEO onayı.

## 25. Bağımlılıklar

Tailwind v4 `@theme` · shadcn/ui taban (token'larla override) + Aceternity (yalnız arka plan/ambient efekt, süs enflasyonu yasak) · Lucide · self-host variable fontlar · WebGL (three.js) yalnız: login 3D hover, arka plan derinlik sahnesi, org graph — A1 serbestisi, RTX 4090 hedef donanım; entegre fallback: WebGL yoksa statik katmanlar (§32.14 responsive dahil).

## 26. Riskler / 27. Edge case'ler

- **Gold enflasyonu**: en büyük marka riski → lint: `--accent-champagne` kullanan component sayısı design-audit sayfasında sayılır; sayfa başına aktif-olmayan gold yüzey >%10 ise RET.
- **Glassmorphism ucuzlaması**: blur yalnız e3 yüzeylerde (drawer/modal/palette); kart-üstü blur YASAK.
- **Ultrawide grid**: 3440px'te 16 kolon; 1280 laptop'ta 12→8; widget minimum boyutları korunur, asla üst üste binmez. TV (3840, uzaktan izleme): tip ölçeği ×1.25.
- **Chart okunabilirliği yoğun veride**: sanal örnekleme (>500 nokta decimation) + hover büyüteç; "renkli çocukça chart" yasak — kategorik palet 6 metal tonuyla sınırlı, ötesi desenle ayrışır.
- **Dark-only kontrast tuzağı**: muted text (#6E7380) yalnız caption'da; veri değeri asla muted olamaz.

## Görsel sistemler (§32.20-26 — kalan zorunlu başlıklar)

- **Modal:** e3 + glass, max-w 640 (onay) / 960 (içerik); başlık h2, tek birincil CTA (gold), ikincil ghost; ESC+dış tık kapatır (kritik onayda dış tık kapatmaz).
- **Drawer (Context Drawer):** sağdan, 420/640px, e3; drill-down'un ilk katmanı — sayfa değiştirmeden detay; içinde tam sayfaya "open full" linki.
- **Tooltip:** titanium yüzey, 12px caption, 200ms gecikme, ok yok (ince 1px kenar); veri tooltip'i (chart) zengin: değer+delta+zaman.
- **Command palette:** ⌘K; glass e3; gruplu sonuç (Sayfalar/Varlıklar/Aksiyonlar); aksiyon satırında hedef + risk badge'i (mutasyon ise).
- **Table:** §10 Advanced Data Table kuralları + sticky başlık + kolon yönetimi + satır tık = drawer.
- **Form:** label-caps üstte, input 40px graphite inset, focus champagne kenar; inline doğrulama (submit'te toplu değil); tehlikeli aksiyonlarda yazarak-onay ("PAUSE" yaz).
- **Chart:** §24 direktifi — ince çizgi 1.5px, kontrollü glow (yalnız aktif seri, 4px blur), premium tooltip, drill-down tık, karşılaştırma modu (dönem overlay), zaman aralığı seçici; izinli tipler: line/area/radial health/heatmap/sankey/network/timeline/cost waterfall/dependency map/routing graph/org graph; pie minimum.

## Done definition (bu spec)

27 başlık ✓ (görsel sistemlere uyarlanmış, tamamı dolu) · §32'nin 26 içerik kalemi birebir karşılanmış ✓ · token'lar kod değeriyle ✓ · §35 yasakları bölümlere gömülü ✓ · doğrulama komutları (§6, §21, §24) ✓ · Opus-devralma netliği + ⛔ kararlar (§3, §24) ✓ · A1/A2 işlenmiş ✓
