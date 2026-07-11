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

## Görünüm katmanları (kokpit / makine dairesi / arşiv)

**1. KOKPİT (VS Code'da gördüğün):** `HOLDING-OS-MASTER-PLAN/` · `personas/` · kod (`apps` `packages`
`supabase` `db` `scripts`) · `docs` `references` `tests` · bu README. Başka hiçbir şey göz kirletmez.

**2. MAKİNE DAİRESİ (var ama Explorer'da gizli — `.vscode/settings.json` files.exclude):**
`.planning/` (ajanların süreç defteri: STATE, roadmap, faz planları) · `memory-store/` (şirket kalıcı
hafızası — artifact/relation; insan okumaz, ajanlar kullanır) · `graphify-out/` + `tmp/` (araç önbellekleri) ·
`node_modules/` + config dosyaları (package.json, tsconfig…) · `.claude/ .github/ .obsidian/` (araç ayarları) ·
`tools/ vps/` (altyapı scriptleri). **Hiçbiri silinmedi** — geri görmek: `.vscode/settings.json` içinde
ilgili satırı sil/false yap.

**3. ARŞİV (repo DIŞI — `~/dxb-archive/`):**
- `agency-agents-20260711.tar.gz` (535 dosya) — eski ajans ham maddesi. Persona yazımında SALT REFERANS;
  kadro dosyalarına metni GÖMÜLEMEZ. Tek dosya okumak:
  `tar -xOzf ~/dxb-archive/agency-agents-20260711.tar.gz "agency-agents/<yol>"`. Dalgalar bitince CEO kararıyla silinir.
- `ceo-sources/` — CEO'nun ham kaynak dosyaları (BEKLENTİLER metni + ODT mimari notları).
  Sanitize edilmiş kanonik kopyaları korpusta: `00-CEO-DIRECTIVE-BEKLENTILER.md` (+ 00-INDEX).

(`planning` bind-mount aynası da CEO emriyle söküldü — tek kaynak `.planning/`.)

## Karar hiyerarşisi (çelişkide)

1. CEO direktifleri (`HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-*.md`) — en üst
2. `HOLDING-OS-MASTER-PLAN/` spec korpusu + `IMPLEMENTATION_ROADMAP.md`
3. `.planning/STATE.md` (anlık konum) + faz planları
4. Kod içi yorum/README'ler

Sapma kuralı: master plandan sapma ancak KAYITLI + CEO'ya görünür olur; sessiz sapma yasak.
Kadro kuralları: TÜM personalar Fable 5 bizzat (K2) · uydurma insan adı yok · `agency-agents` salt referans.
