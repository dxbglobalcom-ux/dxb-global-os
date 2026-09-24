---
name: audit-twin-rule
description: "U36 denetim ikizi — düşman denetimi; kodu builder alt-ajanı max'ta yazar (CEO 2026-09-24), denetleyen alt-ajanlar asla yazmaz"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 2771dd36-00f5-41c5-b24a-ccec22a42bb2
  modified: 2026-09-24T00:06:25.197Z
---

**U36 (CEO hükmü 2026-07-26): inşaatçı kendi işini kendi onaylamayı bıraktı.** Kanonik metin: `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-AUDIT-TWIN.md`; CLAUDE.md standing order 11 **Amendment A1**.

- **K1 değişti (CEO 2026-09-24, `code-by-builder-at-max-hook-2026-09-24`):** kod dosyasını `builder` alt-ajanı Opus 5.5 · max'ta yazar (basit işte ve haftalık kota ≥ %80 iken `builder-lean` · medium); `~/.claude/hooks/dxb-code-gate.py` başka effort'ta yazılan kodu reddeder. Kayıt ve talimat metni oturumun kendisinindir. Denetleyen alt-ajanlar (refuter, scout, debugger, design-eye) asla yazmaz.
- **Subagent iki işte ZORUNLU:** (a) düşman denetimi — eline iddia + nerede ölçüleceği verilir, görevi ÇÜRÜTMEK (benim sonucum verilmez); (b) salt-okur geniş tarama, sonucu tablo.
- **Salt-okurluk mekanik:** `codex exec -s read-only` veya Read/Grep/Glob'a kısıtlı Claude ajanı. Ölçen komut serbest, YAZAN komut asla, test suite asla (fixture canlı DB'ye yazar — 3.087 sahte satır emsali). Yazar denetim öncesi/sonrası `audit_log`/`tasks`/`agent_runs` satır sayar; fark = denetim geçersiz.
- **Üç tetik, başka yok:** CEO kabul oturumu (çapraz model, Codex — Claude'u Claude denetlerse aynı kör nokta), makineyle ölçülemeyen kanıt bacağı olan satır kapanışı, CEO'nun yakaladığı kusurun SINIFININ repo-geneli taraması. Her koşuda/commit'te DEĞİL.
- **Bulgu kanıttır, hüküm değil:** ✓'yi yazar imzalar. Denetçi-yazar anlaşamaz ve kimse kanıtlayamazsa iddia `⚠ UNVERIFIED`'a düşer, ✓ kalamaz. Denetim TAM bataryadan SONRA koşar; makineyle yakalanabilir bulgu = YAZARIN kusuru.
- **Pilot ölçütleri koşudan önce yazıldı** (≥24/27 komutlu çürütme denemesi · ≥%80 komut destekli bulgu · ≤%25 yanlış alarm · yazma kontrolü birebir) + **durdurma kuralı**: yanlış alarm yüksekse veya bataryanın bulmadığı bir şey çıkmazsa ikiz kaldırılır.
- **Maliyet ölçümü:** `cost_ledger` 30 günde 3.59 milyar token / €0.0000 — inşaat ve runtime abonelik hattında, metrekare €50-150 OS bütçesi etkilenmiyor. Proje sonuna ~10 denetim ≈ 1M token = TAHMİN, pilot ölçecek.

**Why:** Runtime'da doktrin zaten vardı (`critical-gate.ts:4` — Opus 5 yazar, `gpt-5.6-sol`/`gpt-5.5` çürütür); yalnız inşaatçı muaftı. CEO'nun gözüne ulaşan her kusur "yazar kendi işini onaylıyor" sınıfından geldi — makine kapıları kod kusurunu yakalar, İDDİA kusurunu yakalamaz.

**How to apply:** İlk uygulama = W5.1 kabul denetimi. İlgili: [[opus-5-construction-governance]], [[model-routing-hierarchy]], [[evidence-before-done]], [[design-verification-rule0]].
