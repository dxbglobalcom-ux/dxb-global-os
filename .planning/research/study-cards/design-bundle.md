# Study Card: Design bundle — impeccable + taste-skill + open-design + Google Stitch (+ frontend-design, ui-ux-pro-max, playwright)

> STUDY EXECUTED 2026-07-10 00:05–00:25 — Fable 5 bizzat, inline (B3 giriş şartı; [[design-bundle-phase8-bridge]]).
> Kaynak: 6 plugin'in SKILL.md'leri doğrudan okundu; ui-ux-pro-max CLI canlı çalıştırıldı (kanıt aşağıda).

- **Tool:** Design bundle (6 plugin): impeccable 3.9.1 · taste-skill 1.0.0 (13 alt-skill) · open-design (nexu-io marketplace, `od` daemon MCP) · Google Stitch (stitch-skill via taste-skill + opsiyonel Stitch MCP) · frontend-design (Anthropic official) · ui-ux-pro-max 2.6.2 · playwright (`@playwright/mcp`)
- **Slug:** design-bundle
- **Category:** Design
- **Status:** STUDY ✓ (bu doküman) → INSTALL kısmen (plugin'ler settings.json'da aktif 2026-07-09 23:36; `od` daemon + Stitch MCP kurulumu Phase 8 execute'ta)
- **Target Phase:** 8
- **Owner (dept/tier):** Design dept + dashboard build
- **Trigger Type:** skill (5) + MCP (open-design, playwright, Stitch)
- **Source:** plugin cache `~/.claude/plugins/cache/` — impeccable@3.9.1, taste-skill@1.0.0, ui-ux-pro-max@2.6.2, frontend-design+playwright (claude-plugins-official), open-design (nexu-io)
- **Pinned Version:** impeccable 3.9.1 · taste-skill 1.0.0 · ui-ux-pro-max 2.6.2 · playwright MCP `@playwright/mcp@latest` (pin Phase 8 execute'ta sabitlenir)
- **Official Docs URL:** impeccable/taste-skill/ui-ux-pro-max = plugin SKILL.md'leri (self-contained) · Stitch: labs.google/stitch · open-design: github.com/nexu-io/open-design

## Purpose (ne işe yarar — Phase 8 görevi)

CEO cockpit'inin (dashboard + CRM) görsel kalitesini "jenerik AI admin-panel" seviyesinden **7-yıldız holding cockpit'i** seviyesine ([[phase8-design-brief]]) taşıyan disiplin katmanı. Her skill'in rolü farklı:

| Skill | Rol Phase 8'de | Ne zaman fire eder |
|---|---|---|
| **impeccable** | ANA DİSİPLİN: PRODUCT.md/DESIGN.md kurulumu (`init`), `shape`→`craft` build akışı, `critique`/`audit`/`polish` kalite kapıları, **product register** (dashboard = design SERVES product) | Her UI build adımında; setup script'i session başına 1 kez |
| **frontend-design** | Estetik yön + özgünlük zorlaması (anti-template); hero/thesis düşüncesi; copy discipline | UI-SPEC yazımı + her yeni surface tasarımı |
| **taste-skill (core)** | Anti-slop kural seti — AMA kapsam notu: "Not dashboards" der; cockpit'te SEÇİLİ kurallar alınır (renk kilidi, shape kilidi, AI-tells, eyebrow kısıtı, buton kontrast, em-dash yasağı) | UI-SPEC + marketing-yüzeyli sayfalar (login, boş durumlar) |
| **soft-skill** | Premium materyal dili: Double-Bezel nested kartlar, island nav, spring physics, $150k-agency hissi — CEO'nun "lüks" talebinin somut tekniği | Cockpit shell + kart/panel komponentleri |
| **stitch-skill** | DESIGN.md üretim formatı (semantik design system dili); dashboard kısıtları (sans-only, mono sayılar) | UI-SPEC'in design-token bölümü + (ops.) Stitch screen-gen |
| **ui-ux-pro-max** | VERİ MOTORU: `search.py --design-system` (50 stil/161 palet/57 font çifti), `--stack nextjs`, `--domain chart` (COST-04 grafikleri), a11y/perf checklist'leri | Planlama (palet/font kararı) + execute (chart/stack guidance) |
| **open-design** | `od` daemon MCP: 139 skill + design template'leri + preview araçları | Phase 8 execute — kurulum sonrası opsiyonel destek |
| **playwright** | MCP: canlı browser doğrulama — screenshot, interaction, responsive test; Evidence-Before-Done'ın GUI ayağını kısmen makineleştirir (⚠ görsel nitelik yine CEO gözü) | Execute'ta her UI adımının verify'ında |

## Key API / Usage Notes

- **impeccable setup zinciri (ZORUNLU, her session):** `node .claude/skills/impeccable/scripts/context.mjs` → `NO_PRODUCT_MD` ise önce `init` (PRODUCT.md + DESIGN.md üretir). Komutlar: `craft/shape/critique/audit/polish/animate/harden/onboard...` — her komuttan önce `reference/<command>.md` okunur. Dashboard işi **product register** (`reference/product.md`) okur. Yeni projede `palette.mjs` brand seed verir (OKLCH zorunlu). Hooks: UI dosya edit'lerinde detector otomatik koşabilir (`/impeccable hooks on`).
- **ui-ux-pro-max CLI:** `python3 .../search.py "<query>" --design-system --variance V --motion M --density D -p "Ad" [-f markdown] [--persist]`; domain aramaları: `--domain chart|style|typography|color|ux|gsap`; stack: `--stack nextjs`. `--persist` → `design-system/MASTER.md` + `pages/` override hiyerarşisi.
- **stitch DESIGN.md formatı:** 7 bölüm — Atmosphere, Color+Roles(hex), Typography, Component Stylings, Layout, Motion, Anti-Patterns. Dashboard kısıtı: serif YASAK, sans çifti (`Geist`+`Geist Mono` / `Satoshi`+`JetBrains Mono`), density>7'de sayılar mono.
- **taste dials:** `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY` (1-10). Cockpit için Fable kararı: **V6 / M5 / D7** (exception-first ana görünüm D7 cockpit; ayar/CRM sayfaları D5). Premium-consumer beige+brass paleti BANNED-default — cockpit'te zaten dark-lüks yön.
- **playwright MCP:** `npx @playwright/mcp@latest` (`.mcp.json` hazır). Screenshot+interaction+console — adım verify'larında `⚠ görsel` etiketli kanıt üretir.
- **open-design:** MCP stdio; **`od` daemon PATH'te olmalı** (brew/npm/DMG). Kurulmadan tool'lar ölü.

## Known Pitfalls (Fable bulguları)

1. **taste-skill kapsam çelişkisi:** core skill kendini "NOT dashboards" ilan eder. Cockpit'e komple uygulanmaz; anti-slop alt kuralları seçilerek alınır. Birincil disiplin impeccable product register + stitch dashboard kısıtları.
2. **Skill'ler arası font çelişkisi:** ui-ux-pro-max "luxury" sorgusuna serif (Bodoni Moda) önerdi; stitch-skill dashboard'da serif'i YASAKLAR. **Fable kararı: cockpit chrome = sans-only (lüks his materyal+motion+space'ten gelir); serif en fazla login/marketing yüzeyinde düşünülebilir, o da şüpheli.**
3. **Inter yasağı bundle genelinde:** premium bağlamda Inter/Roboto/Arial banned (stitch + soft + taste hemfikir). Aday çiftler: `Geist + Geist Mono` (Vercel, Next.js-native) veya `Satoshi + JetBrains Mono`.
4. **`h-screen` yasak** → `min-h-[100dvh]` (iOS Safari); `window.addEventListener('scroll')` yasak → Motion `useScroll`/IntersectionObserver; animasyon SADECE transform+opacity; `backdrop-blur` sadece fixed/sticky elemanlarda.
5. **Emoji yasak** (yapısal ikon olarak) — ikon ailesi tek: `@phosphor-icons/react` öncelikli; lucide discouraged.
6. **impeccable absolute bans** cockpit'te de geçerli: side-stripe border, gradient text, hero-metric şablonu, identical card grid, her bölümde eyebrow, nested cards.
7. **CEO "3 boyutlu" talebi ile perf guardrail dengesi:** 3D/derinlik = katmanlı ışık, çift-çerçeve (Double-Bezel), tinted gölgeler, cam yüzeyler, spring motion — Three.js DEĞİL (bundle 8GB VPS'te ağır, dashboard'a gereksiz). Derinlik illüzyonu CSS ile; `will-change` idareli.
8. **ui-ux-pro-max app-UI checklist'leri** mobil-app odaklı bölümler içerir (safe-area vs.) — telefon-responsive cockpit (DASH kabulü: telefonda kullanılabilir) için faydalı ama birebir iOS kuralı değil.
9. **open-design `od` daemon** kurulu değilse MCP sessizce işlevsiz; INSTALL adımında `od --version` kanıtı şart.
10. **Stitch MCP** resmi sunucu adı/paketi INSTALL'da doğrulanacak (no-guessing); stitch-skill'in ana değeri (DESIGN.md formatı) MCP'siz de tam çalışır.

## Install Command (kayıt — INSTALL adımında koşulur, körlemesine değil)

```bash
# plugin'ler: settings.json'da zaten aktif (2026-07-09 23:36) — kanıt: bu session skill listesinde görünüyorlar
# open-design daemon (Phase 8 execute):  npm i -g @nexu-io/od  # (paket adı kurulumdan önce docs'tan doğrulanır)
# playwright MCP: .mcp.json hazır — npx @playwright/mcp@latest (ilk çağrıda iner)
# Stitch MCP: sunucu kimliği INSTALL'da araştırılır; gateway grant'i şimdiden kayıtlı (pending_install)
```

## Legitimacy Verdict

**⛔ FABLE VERDICT: PASS — bundle Phase 8 için uygun ve yeterli.** impeccable (Apache 2.0, olgun komut akışı) + Anthropic resmi frontend-design/playwright + veri-motoru ui-ux-pro-max meşru ve düşük riskli; taste/soft/stitch prompt-disiplin dosyaları (kod çalıştırmaz, güvenlik yüzeyi yok); open-design üçüncü-parti daemon — INSTALL'da binary kaynağı doğrulanacak (tek gerçek risk yüzeyi). Bundle'ın bileşik disiplini CEO brief'inin ("Burj Al Arab lüksü, 3D, efsane modern") somut, uygulanabilir tekniklere çevrilmesine yetiyor; UI-SPEC bu study'nin çıktılarıyla yazılır.

## Lifecycle Checklist
- [x] STUDY — 2026-07-10 00:25, Fable bizzat (bu doküman; CLI canlı test kanıtı: `search.py "executive cockpit dashboard luxury premium dark" --design-system` → tam design-system çıktısı döndü)
- [~] INSTALL — plugin'ler aktif ✓; `od` daemon + Stitch MCP + playwright pin → Phase 8 execute adım 1
- [ ] ADOPT — UI-SPEC.md bu disiplinle yazılır (planlama), cockpit kodu altında üretilir (execute)
- [ ] EMBED — impeccable hooks + design dept MCP profili + persona-v2 design ajanlarına aktarım (Phase 10)
