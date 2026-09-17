## A) OKUDUĞUM KAYNAKLAR

Zeminde (`ground/`, `ground-2/`, `ground-3/`) benim alanıma (GitHub issues/PR/README, Stack Overflow) düşen kanallar: `github-issues.raw`, `github-repos.raw`, `github-trending.raw`, `stackoverflow.raw` (üç sweep'te de). Bunların üstüne `gh api` ile 8 issue/README'in **tam gövdesini ve yorumlarını** çektim (sadece başlık değil):

- `yansircc/ai-cr-test#3` — CI'de Claude Code vs Codex code-review deneyi, 2 takip yorumu dahil (~1.400 kelime, Çince)
- `block/chalkline#3` — goose/Claude Code/Codex "cross-harness parity" testi, 2 sonuç yorumu (~900 kelime)
- `dp-web4/hestia#624` — claude-code/codex/kimi'yi paralel "seat" olarak koşan üretim mimarisinde davranış farkı raporu (~700 kelime)
- `Coder8124/logos#2` — Claude Code+Codex+Cursor'a aynı anda bağlanan bir MCP eklentisinin kurulum arızası raporu (~600 kelime)
- `Orkas-AI/Orkas-Docs#149` — vendor karşılaştırma sayfası (pazarlama içeriği, 0 yorum)
- `waseemnasir2k26/claude-code-vs-codex-cheatsheet` README — "gerçek müşteri işinde" karşılaştırma
- `waprin/claude-vs-codex-dashboard` README — Reddit sentiment analiz aracı (araç, veri değil)
- `distroinfinity/ccwarriors#41`, `byteseek/Mira#53` — kısa roadmap/issue metinleri

**Stack Overflow üç sweep'te de tamamen sessiz** (`stackoverflow.raw` = `[]` her seferinde) — aşağıda kapalı kapı olarak işaretliyorum.

## B) SAYIM (n=8 derinlemesine okunan GitHub kaynağı)

| Kova | Sayı | Örnek |
|---|---|---|
| Gerçek eller-üstünde üretim/CI karşılaştırma raporu | 3/8 | yansircc#3, chalkline#3, cheatsheet README |
| Çoklu-ajan üretim altyapısı sürtünme raporu | 2/8 | hestia#624, logos#2 |
| Vendor/pazarlama karşılaştırma içeriği (organik ses değil) | 1/8 (+1 neredeyse birebir Çince kopyası) | Orkas-Docs#149/#150 |
| Roadmap/feature-request (deneyim raporu değil) | 2/8 | Mira#53, ccwarriors#41 |
| Stack Overflow'dan gelen içerik | **0/0** | — |

GitHub trend verisi: `anthropics/claude-code` 145.799 yıldız — ama daha çarpıcısı, "AI kodlama ajanlarını izole sandbox'ta/paralel çalıştırma" temalı en az 8 ayrı yeni repo aynı sweep'te trend'de (paude, clampdown, agentkernel, vibe-tree, ccmux, Caspian, agentbox-sdk, background-agents) — hiçbiri tek bir aracı terk etmiyor, tam tersine **birden fazla ajanı aynı anda, izole ortamlarda koşturmak** üretimde yaygın bir mimari desen haline gelmiş.

## C) SESLER (verbatim alıntılar)

1. **yansircc**, `ai-cr-test#3`, 2026-03-01: *"CC Agent 模式...实测输出质量显著提升：发现了 6 个问题（含 workflow 变更问题），Codex 同场景只发现 1 个"* (Agent modunda Claude Code 6 sorun buldu, Codex aynı senaryoda sadece 1)
2. **yansircc**, aynı issue, sonuç: *"CC Subagent 模式在探索深度和发现数量上领先，Codex 在速度上领先。两者互补。"* (Derinlik/keşifte Claude Code önde, hızda Codex önde — ikisi birbirini tamamlıyor)
3. **block/chalkline bakımcı botu** (daveh-beep'in ajanı), 2026-07-30: *"Claude Code doesn't read AGENTS.md. Unbridged, the writing system was silently invisible — worst failure mode, because the user believes it's on."*
4. **dp-web4/hestia#624** içinde alıntılanan **dp**, 2026-08-03: *"they don't tell me what i'm approving or why."*
5. **hestia#624** issue gövdesi, 2026-08-26: *"claude-code is the outlier. I am claude-code... claude-code vs codex 6% [satır benzerliği], codex vs kimi 77%."*
6. **Coder8124**, `logos#2`, 2026-09-13: *"At scale, 'install once, works across every app' is the difference between adoption and a queue of 'the server keeps disconnecting / it resumed from an empty vault' reports."*
7. **Waseem Nasir**, cheatsheet README, Eylül 2026: *"Final score: Claude Code 3 – 1 Codex... Use Codex for quick creative passes. Use Claude Code for systems, automation, and dev. Don't pick one — route the task to whoever's strongest."*
8. **Orkas-Docs (vendor)**, 2026-09-14 (organik ses değil, ölçüm iddiası): *"Claude Code's instruction field is invocation-scoped rather than session-scoped... matters a great deal when something else re-launches the process for you."*

## D) KAPALI KAPILAR

- **Stack Overflow** — üç bağımsız sweep (`ground`, `ground-2`, `ground-3`), üçü de `[]` (sıfır sonuç). Bu konuda geliştiriciler soru-cevap formatında değil, Reddit/X/GitHub issue formatında konuşuyor gibi görünüyor.
- **GitHub Issues (ilk sweep, `ground/github-issues.raw`)** — `[]` döndü, ama aynı kapı `ground-2` ve `ground-3`'te farklı sorgu diliyle açıldı (22+18 sonuç) — yani kalıcı kapalı değil, sadece sorgu bağımlıydı.
- **HackerNews, Reddit (ground-2'de), LinkedIn, Weibo, Linux-Do, V2ex-via-Linux-Do, Juejin-via-Linux-Do** kendi alanımda değil ama aynı kapı deseni (`.raw` = 4 bayt veya boş) — not ediyorum çünkü diğer avcılar için de ilgili olabilir.

## E) AYRI İNSAN SAYISI

**6** — yansircc (ai-cr-test), block/chalkline bakımcısı (daveh-beep), dp (hestia), Coder8124 (logos), Waseem Nasir (cheatsheet), byteseek/Mira'nın issue yazarı. Orkas-Docs vendor içeriği ve otomatik arxiv-bot issue'ları bu sayıma dahil değil (organik insan sesi değil).

## F) SONUCU DEĞİŞTİRECEK ŞEY

`ccwarriors` reposundaki canlı "leaderboard" panosu (`/claude-code-leaderboard`, gerçek harcama/pazar payı verisi, Notion GTM linki verilmiş) — eğer bu canlı veri çekilebilseydi, "hangisi terk ediliyor" sorusuna nicel bir cevap (gerçek harcama trendi) verebilirdi. Zaman bütçesi nedeniyle bu panoyu açıp veri çekmedim — bu benim alanımda gitmediğim en somut yol.