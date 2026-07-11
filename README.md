# DXB Global OS — KAYNAK HARİTASI (buradan başla)

Tek soruya tek cevap: **"proje nerede, neyi okuyacağım?"**

| Klasör | Ne | Kim okur |
|---|---|---|
| **`HOLDING-OS-MASTER-PLAN/`** | **PROJENİN KENDİSİ** — 31 spec + TÜM CEO direktifleri (`00-CEO-DIRECTIVE-*.md`) + `IMPLEMENTATION_ROADMAP.md` (canlı adım tablosu) + `WORKFORCE-GAP-MATRIX.md` (kadro kararları). Çelişkide BURASI kazanır. | CEO + tüm ajanlar |
| **`personas/`** | Kadro dosyaları — çalışan başına TEK dosya (`<departman>/<slug>.md`): 33-alan sicil + kişilik (yazılmışsa tam, değilse dürüst "⏳ bekliyor"). Kurallar: `personas/README.md` | CEO (göz), HR akışı |
| `.planning/` | Süreç defteri — `STATE.md` (neredeyiz), ROADMAP, faz planları, araştırma. `MASTER-PLAN.md` = eski dönem detayı (SÜPERSEDE bandlı — yeni iş buradan planlanmaz). | Ajanlar (session açılışı) |
| `apps/` · `packages/` · `supabase/` · `db/` | Kod: dashboard (Next.js), @dxb paketleri (hr dahil), migration'lar, seed | Mühendislik işi |
| `scripts/` | İşletim scriptleri (`sync-personas-to-db.sh`, `gen-workforce-dossiers.sh`, denetimler) | Ajanlar |
| `docs/` · `references/` · `graphify-out/` · `memory-store/` | Yardımcı: dokümantasyon, tasarım referansları, bilgi grafı, bellek | İhtiyaç halinde |

Repo DIŞI arşiv: `~/dxb-archive/agency-agents-20260711.tar.gz` — eski ajans ham maddesi (535 dosya).
CEO emriyle (2026-07-11) repo'dan kaldırıldı; persona yazımında SALT REFERANS olarak açılır, kadro
dosyalarına metni GÖMÜLEMEZ. Persona dalgaları bitince CEO kararıyla tamamen silinebilir.
(`planning` bind-mount aynası da aynı emirle söküldü — tek kaynak `.planning/`.)

## Karar hiyerarşisi (çelişkide)

1. CEO direktifleri (`HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-*.md`) — en üst
2. `HOLDING-OS-MASTER-PLAN/` spec korpusu + `IMPLEMENTATION_ROADMAP.md`
3. `.planning/STATE.md` (anlık konum) + faz planları
4. Kod içi yorum/README'ler

Sapma kuralı: master plandan sapma ancak KAYITLI + CEO'ya görünür olur; sessiz sapma yasak.
Kadro kuralları: TÜM personalar Fable 5 bizzat (K2) · uydurma insan adı yok · `agency-agents` salt referans.
