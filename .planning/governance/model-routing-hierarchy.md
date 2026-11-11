---
name: model-routing-hierarchy
description: "v20 (CEO 2026-11-10, 2026-11-11): dxb-team3 — baş mühendis Fable 5.2 bütünü elinde tutar, elleri seçer, her parçayı doğrular; yazarlar Fable 5.2, kolay parça Opus 5.5 medium; okuyucular Opus 5.5 ve Sonnet 5.5; her işte kör Sol, önemli işte yanında Fable 5.2; seviye kuralları kapıda (dxb-team3 §2); eski sürümler git geçmişinde"
metadata:
  type: feedback
  originSessionId: 6f441f82-3704-454a-83cd-11cd3bcd26d8
  modified: 2026-11-11T14:10:00.000Z
---

# v20 — dxb-team3 (CEO, 2026-11-10) <!-- CEO-OK: dxb-team3-default-door-fable-5-2-2026-11-10 -->

Tek inşaat kapısı `.claude/skills/dxb-team3/SKILL.md`. Kimin ne yaptığı, seviye kuralları ve gerekçeleri orada (§2, §3);
burada yalnız hangi koltukta hangi modelin oturduğu. `dxb-team2` karşılaştırma için durur, yalnız adıyla açılır.

| Koltuk | Model · tanımındaki seviye |
|---|---|
| Baş mühendis (açılan oturum) | Fable 5.2 — seviyesini kendisi ayarlar (dxb-team3 §2) |
| Kopya (`fork`) | Fable 5.2 — baş mühendisin seviyesinde |
| Yazan yardımcı (`helper-writer`) | Fable 5.2 · `medium` — açılırken verilen seviye geçerlidir (dxb-team3 §2) |
| Kolay parçanın yazarı (`easy-writer`) | Opus 5.5 · `medium` |
| Yükseltme yazarı (`builder`) | Fable 5.2 · `xhigh` — `high`'da iki kez düşen parça |
| Yardımcı (`helper`), salt-okur | Opus 5.5 · `medium` |
| Toplayıcı (`gatherer`), salt-okur | Sonnet 5.5 · `medium` |
| Okuyucu (`scout`, `Explore`) | tek seferlik |
| Yedek planlayıcı (`Plan`) | Opus 5.5 · `high` ya da `max` — Fable 5.2 kotası sıkıştığında (dxb-team3 §1) |
| Denetçi | GPT-6.1 Sol <!-- CEO-OK: auditor-sol-6-1-2026-10-01 -->, yalnız `scripts/governance/refuter.sh` ile — kör, salt-okur, iş başına bir geçiş; yokken `refuter` alt-ajanı (Opus 5.5 · `high`), kayda yazılır |
| İkinci denetçi | Fable 5.2 · `high`, `scripts/governance/fable-audit.sh` ile — önemli işte Sol'un yanında <!-- CEO-OK: lead-chooses-freely-fable-audits-important-jobs-2026-11-10 --> |

`design-eye` bu kapının koltuğu değildir. Koltuk tanımları `~/.claude/agents/` altındadır. Eski sürümler (v1-v19) git geçmişindedir.
