# Phase 8: CEO Dashboard & CRM - Context

**Gathered:** 2026-07-10
**Status:** Ready for planning
**Source:** CEO direct brief (2026-07-10 00:01, FULL AUTHORITY session) + MASTER-PLAN PHASE-08 LOCKED decisions + B3 design-bundle study (executed 2026-07-10). discuss-phase yerine geçer: CEO vizyonu sözlü verildi, kalanı Fable'a delege ("SİZE FULL HERŞEYDE İZİN VERİORUM").

<domain>
## Phase Boundary

CEO'nun tüm şirketi tek cockpit'ten yönettiği canlı dashboard + ince CRM: görev panosu, ajan rosteri, risk-gruplu toplu onay inbox'ı, departman/model/mode maliyet sayacı, komut çubuğu (TR/EN intent → kernel), audit drill-down, CRM görünümleri (clients/requests/contacts/deals). Dashboard saf projeksiyondur (I8): ajanlar asla "dashboard günceller", tablolar değişir → Broadcast tetikleri yayınlar. Kapsam DIŞI: JARVIS sesi (Phase 9), departman aktivasyonu (Phase 10), gerçek müşteri operasyonu (Phase 11).

</domain>

<decisions>
## Implementation Decisions

### CEO Design Vizyonu (verbatim-özet, 2026-07-10 00:01 — BAĞLAYICI)
- "Mükemmel bir design istiyorum. **3 boyutlu, efsane modern.** Tam bir **büyük holdinge yaraşır** şekilde. Dünyanın ilk 7 yıldızlı oteli **Burj Al Arab'a girerken hissettiğin o lüks ve elegantlık** — işte öyle."
- Tüm design skilleri açık; "Claude design"ı da aktive etme izni verildi.
- Çeviri ([[phase8-design-brief]] memory): awe+lüks+elegans giriş anı; jenerik admin-panel görünümü = İHLAL; premium corporate-luxury; derinlik/3D efektler kurumsal ağırlığı ezmeden.

### Fable Design Kararları (CEO adına, FULL AUTHORITY; study-temelli)
- **Tema:** Dual-mode token mimarisi; **DARK birincil ve marka-taşıyıcı** (gece-lüks, Burj iç aydınlatması), light = gündüz-operasyon modu (telefonda güneş altında okunabilirlik). Sayfa-içi tema karışımı yasak (theme lock). Saf #000/#fff yasak.
- **Tipografi:** Cockpit chrome **sans-only** — `Geist` + `Geist Mono` (sayısal/veri alanları mono; density>7 panellerde sayılar HER ZAMAN mono). Serif cockpit'te YASAK (stitch dashboard kısıtı; ui-ux-pro-max'ın Bodoni önerisi Fable tarafından REDDEDİLDİ — study card pitfall #2). Inter yasak.
- **Renk stratejisi:** Zengin warm-charcoal nötr skala + TEK accent: kısıtlı altın/şampanya (yüzeyin ≤%8'i; CTA, aktif durum, kritik vurgu). Altın = CEO'nun Burj brief'inden gelen MARKA kararı (refleks değil). Status renkleri ayrı semantik katman (yeşil/amber/kırmızı — onay/risk/maliyet durumları). Kesin hex'ler UI-SPEC'te OKLCH ile.
- **"3 boyutlu"nun teknik karşılığı:** CSS derinlik dili — Double-Bezel nested yüzeyler (soft-skill), katmanlı ışık/gölge (bg-hue-tinted), cam yüzeyler SADECE sabit chrome'da (nav/overlay; scroll içeriğinde blur yasak), spring-physics motion (stiffness~100 damping~20), hover'da mikro-parallax. **Three.js/WebGL YOK** (perf + kapsam + 8GB VPS).
- **Motion:** Amaçlı ve az: panel giriş stagger'ı, canlı veri değişiminde vurgu pulse'ı, onay akışında state-transition animasyonu. `prefers-reduced-motion` zorunlu. `window.addEventListener('scroll')` yasak.
- **Taste dials (cockpit):** VARIANCE 6 / MOTION 5 / DENSITY 7 (ana cockpit); CRM/ayar sayfaları DENSITY 5.
- **İkon:** Tek aile — `@phosphor-icons/react` (light/regular ağırlık, stroke sabit). Emoji yapısal kullanım yasak.
- **Anti-slop bağlayıcı yasaklar (impeccable+taste birleşik):** side-stripe border, gradient text, hero-metric şablonu, birbirinin aynı kart grid'leri, her bölümde eyebrow, nested cards, AI-purple, neon glow, fake-precise sayılar, "John Doe" verisi (seed verisi gerçekçi TR/EN iş verisi olur).

### Mimari (MASTER-PLAN PHASE-08 LOCKED — aynen)
- Next.js 16.2.x App Router + `@supabase/ssr` (auth-helpers YASAK)
- Realtime = `realtime.broadcast_changes` trigger'ları; `postgres_changes` YASAK; kanallar `dxb:task_events` / `dxb:approvals` / `dxb:cost_ledger`; kanal yetkisi realtime.messages RLS
- Varsayılan görünüm **exception-first**: "beni bekleyen + değişen"; tüm-ajanlar duvarı YASAK; her panelde tazelik damgası ("14:32 itibarıyla")
- Onay inbox'ı `approvals.risk_class` gruplu: high=tek-tek çift-teyit, medium=grup listesi, low=tek-tık toplu; batch tek transaction, kısmi hata=rollback+hata paneli; boş inbox = yeşil "kapı temiz"; 50+ birikimde gate-fatigue uyarısı
- **B7b asimetrisi (CEO direktifi):** money-OUT draft'ları onay kuyruğunda; money-IN onaysız akar, cockpit'te SADECE görünürlük (feed + audit). Inbox groupları bunu yansıtır.
- Auth: Supabase Auth, CEO tek kullanıcı, 2FA/passkey zorunlu; RLS: CEO read; yazım YALNIZ intents + approval kararları
- Command bar → kernel dxb-mcp/HTTP seam; dashboard'da LLM çağrısı YOK (`ai` SDK yalnız render/stream; provider SDK import'u lint'le yasak)
- i18n: `messages/tr.json` birincil + `en.json`; hard-coded string YASAK
- Dashboard saf projeksiyon (I8); drill-down audit.trace, firehose YOK

### Süreç
- DASH-07/I5 demir kural: design-bundle study ✓ KAPANDI (2026-07-10, study-cards/design-bundle.md, Fable verdict PASS) — design işi başlayabilir; UI-SPEC bu study'nin disipliniyle yazılır ve ⛔ FABLE-ONLY onaylıdır.
- impeccable akışı execute'ta: `init` (PRODUCT.md/DESIGN.md) → `shape`→`craft` → adım sonu `critique`/`audit`; playwright MCP ile screenshot kanıtı; görsel nitelik ⚠ UNVERIFIED etiketiyle CEO göz testine.
- Evidence-Before-Done her adımda; Lighthouse mobile a11y ≥90 hedefi ölçülür.

### Claude's Discretion
- Kesin OKLCH paleti, spacing scale, tam komponent seti kompozisyonu (UI-SPEC'te sabitlenir)
- pnpm workspace içi dosya organizasyonu detayı, drizzle/kysely kullanım deseni (mevcut packages/shared'a uyum)
- Seed/demo verisi içeriği (gerçekçi, TR-iş bağlamlı)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Master plan + gereksinim
- `.planning/master-plan/PHASE-08.md` — LOCKED kararlar, dosya-seviyesi spec, 11 adım, 0011 trigger kalıbı (ÇATIŞMADA BU KAZANIR)
- `.planning/REQUIREMENTS.md` — DASH-01..07, GATE-03, COST-04 tanımları
- `.planning/ROADMAP.md` — Phase 8 hedef + 5 başarı kriteri

### Design disiplin (B3)
- `.planning/research/study-cards/design-bundle.md` — study bulguları, skill rol matrisi, pitfall'lar, Fable verdict
- `.planning/phases/08-ceo-dashboard-crm/08-UI-SPEC.md` — (bu planlamada üretilir) görsel sözleşme

### Stack
- `.planning/research/STACK.md` — Next.js/Supabase/Broadcast uyum tablosu + Realtime Broadcast notları (Phase 8 bölümü) — UI kodu öncesi zorunlu okuma
- `packages/gateway/policy/grants.json` — design dept stitch grant'i (pending_install)
- CEO direktif kaydı: `CEO-DIRECTIVE-2026-07-09-audit.md` §B3, §B7

</canonical_refs>

<specifics>
## Specific Ideas

- Burj Al Arab referansı: giriş anı hissi — login→cockpit geçişi tek orkestre "kapı açılışı" momenti olabilir (bir kez, kısa, reduced-motion'da anında)
- Maliyet sayacı COST-04: dept/model/mode kırılımı; kart yerine yoğun veri paneli, sayılar mono, SQL toplamıyla birebir eşitlik testi
- Komut çubuğu TR örneği: "Outleteuro için hafta sonu kampanya taslağı hazırla" → kernel intent zinciri → sonuç panoda
- Tazelik damgası deseni: her panel köşesinde "14:32 itibarıyla" + bağlantı koptuğunda amber "canlı değil" durumu

</specifics>

<deferred>
## Deferred Ideas

- JARVIS sesli komut cockpit entegrasyonu → Phase 9 (VOICE-02, wake-word B2)
- Departman bazlı dashboard görünümleri + persona-v2 ajan detay sayfaları → Phase 10
- Gerçek müşteri/CRM verisiyle canlı operasyon → Phase 11 (pilot)
- open-design `od` daemon derin entegrasyonu: kurulum execute adım 1'de; template kullanımı opsiyonel destek

</deferred>

---

*Phase: 08-ceo-dashboard-crm*
*Context gathered: 2026-07-10 via CEO direct brief + FULL AUTHORITY delegation (discuss-phase yerine)*
