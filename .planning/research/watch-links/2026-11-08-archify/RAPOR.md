# Archify — rapor (2026-11-08)

## Cevap

Archify (`tt-a1i/archify`), Claude Code'un içine kurulan açık kaynak bir **skill**'dir. Ajana "şunu çiz" dersiniz; ajan sistemi yazılı bir JSON taslağına döker, Archify bu taslağı kurallara karşı denetler ve tek dosyalık, tıklanabilir bir HTML harita üretir. Haritada bir parçaya tıklayınca neye bağlı olduğu, kimin sorumlu olduğu ve önünde ile arkasında ne olduğu görünür.

- **İnşaat oturumlarımız için güçlü aday, kurulması önerilir.** Planı ona tek bakışta gösterir. Bir işin önceki ve sonraki hâlini yan yana çizer. Bir alt sistemi kaynağa bağlı olarak haritalar. Elimizde bunların hiçbirini yapan bir araç yok.
- **Holdingin canlı ekranları için uygun değil.** Çıktısı durağandır, veritabanından okumaz. Kendi talimatı da "Not for dashboards" der. Yine de görüntüleyicisindeki fikirler OrgGraph tasarımı için referanstır. Müşteriye kurduğumuz sistemlerin teslim paketinde de kullanılabilir.

## 1. Reel neyi gösteriyor (izlendi: 73 saniyenin dökümü + 83 kare, `frames/reel-all/`)

Hesap: Instagram `fabiankiby`. Ekrandaki Claude Code penceresinin tarihi "Wed, Nov 4" (2026-11-04), model "Opus 5.5 Extra high".

| sn | Söylediği | Ekranda |
|---|---|---|
| 00:00–00:04 | "GitHub'daki en az değer gören repo; AI ile yaptığın her şeyi Claude Code'dan tıklanabilir bir haritaya çevirir" | Archify README'si (logo, "#1 Repository Of The Day"). Ardından kendi sistemi "ATLAS — Infrastructure & Cost Map": Telegram Bot → Intent Router → Prompt Assembly → Tool-Use Loop → Trust & Guardrails → Claude Opus 5 / Haiku 4.5 |
| 00:09–00:18 | "Adı Archify; 90 binden fazla yıldız, ücretsiz, açık kaynak; Claude Code, Codex ve Cursor'da çalışır" | README rozetleri: Stars 93k · installs 130K+ · Apache-2.0 · version 3.2.0 · "works with Claude Code / Codex / Cursor / OpenCode" |
| 00:18–00:21 | "Projeye yönelt, 'nasıl çalıştığını çiz' de" | Claude Code'da tek komut: *"Use archify to draw how this works and build out the map"* |
| 00:22–00:24 | "Herhangi bir parçaya tıkla, neye bağlandığını gör" | "Semantic passport" kartı açılıyor: Intent Router, Upstream/Downstream |
| 00:24–00:28 | "Bir onay adımını öne çıkarmak ya da ayrıntı eklemek mi istiyorsun? Söylemen yeter, harita güncellenir" | "Trust & Guardrails" düğümü (taint gate, held writes, exfil check) |
| 00:28–00:46 | "Kendi podcast hattım: müşterinin e-postasından yayınlanan bölüme 12 adım. Claude Code içeriği hazırlıyor, Codex küçük resimleri üretiyor, ekibim ve ben devreye giriyoruz. Intake'e tıklayınca kurgudan önce ne olduğunu görüyorum; her adımın sorumlusunu görüyorum" | "TELESMA Podcast Pipeline", üç evre: Prepare · Produce · Ship. Intake kartında Upstream 1, Downstream 10. Kartlarda "You approve in Telegram" ve "Nothing goes live until you approve it" yazıyor. "Play story" ile rehberli gezinti var |
| 00:46–00:55 | "Ajan sistemlerimi işe yarar kılan bu: boşlukları görüyorum, AI'a körü körüne güvenmek yerine neyin iyileşeceğini görüyorum; AI slop'tan kaçınıyorum" | ATLAS açık temada. Kartlar: **"Where the $20 went (Sep 1-9)"**: 66 çağrı, 20,12 $; çağrıların 40'ı önbelleği yeniden yazmış, yalnız 26'sı okumuş. 12,41 $ yalnız önbellek yazımı. Soğuk bir Opus DM ~0,60 $, aynı soru bir saat önce ~0,11 $. **"56.294 token'ın içinde ne var"**: araç şemaları %33, sistem istemi %30, memory.md %16. **"Dört bellek katmanı, biri bedava"**: ChromaDB yerelde, API maliyeti sıfır |
| 00:56–01:07 | "Kurduğum her karmaşık sisteme standart hijyen olarak bir harita yapıyorum; sistemi kafamda tutmak zorunda kalmıyorum" | Harita ve düğüm kartları |
| 01:07–01:12 | "MAP yaz, kurulumu, kullandığım tek komutu ve zor yoldan öğrendiğim altı şeyi göndereyim" | Yorum çağrısı |

**Bildirdiği sonuçlar** (kendi sözleriyle): Her sistemin boşluklarını ve iyileşecek yerini görüyor, AI slop'tan kaçınıyor ve sistemi kafasında tutmak zorunda kalmıyor. Kendi ATLAS haritasının kartında maliyetin nereye gittiğini bulmuş: 9 günde 20,12 $'ın 12,41 $'ı önbellek yazımına gitmiş. Bu bulguyu haritanın kartlarına kendisi yazmış.

**Doğru repo:** `tt-a1i/archify`. Karelerdeki README birebir bunun README'si: archify.si, "#1 Repository Of The Day", 93k yıldız rozeti, sürüm 3.2.0 ve Kimi Work / Supercode / OpenLux sponsor satırı. Aynı adı taşıyan başka repolar ekrandakiyle eşleşmiyor: `Oct4Pie/archify` macOS ikili dosyalarını küçültür (166★), `Salah-XD/archify` bir tarayıcı eklentisidir (46★), `archify-webui` Çince bir kopyadır.

## 2. Repo — ölçüldü (2026-11-08, `gh api` + sığ klon `src/`, commit `11b0d60`)

- **Sayılar:** 94.719★ · 6.460 çatal · 1.761 commit · 20'den fazla katkıcı (sahibi 1.147 commit; ardından 131, 95, 50…) · 148 açık issue ve 210 açık PR. Lisans Apache-2.0.
- **Hız:** Repo 2026-04-15'te açıldı. v2.9 (4 Tem) ile v3.2.0 (19 Eki) arasında 11 sürüm çıktı. Son push bugün yapıldı.
- **Ne yapar:** On diyagram türü üretir: architecture, workflow, sequence, dataflow, lifecycle, ERD, class, tree, timeline, waterfall. Bunlara ek olarak bir soruyu tek sayfa olarak cevaplayan "explainer" modu ve önce/fark/sonra karşılaştırması yapan **Architecture Delta** (`archify.mjs compare`) vardır.
- **Nasıl çalışır:**
  1. Ajan, sistemi türüne ait şemaya uyan bir JSON taslağı olarak yazar.
  2. `finalize` tek komutla dört kapıdan geçirir: şema ve yerleşim denetimi, atomik teslim, sıkı köken kontrolü, gerçek başsız Chrome ile `browser-check`.
  3. Kapıdan geçemeyen taslak son iyi dosyanın yerine geçmez. Hata, kural koduyla birlikte onarım makbuzu olarak döner.
  4. Kod okunarak çizilen haritalarda düğümler `SRC n` işaretini taşır ve tek bir commit'e sabitlenmiş dosya ile satır aralığına bağlanır. Bizim gibi özel bir repo için `link_mode: "local-only"` modu var.
- **Bağımlılık:** Saf Node, ≥18 (makinede v22.23.3 var). Çalışma zamanında paket bağımlılığı yok, derlenmiş ikili dosya yok (82 `.mjs`). Chrome yolu bulunuyor: `/usr/bin/google-chrome`. Skill klasörü 18 MB.
- **Ağ:** Yeni sürüm olup olmadığını öğrenmek için yaklaşık 24 saatte bir archify.si'ye tek bir GET atar. `ARCHIFY_UPDATE_CHECK_DISABLED=1` bunu kapatır (`finalize.mjs:896`). Hiçbir zaman kendi kendine güncellemez.
- **Dil:** Görüntüleyicinin hazır arayüz katalogları: en, zh-CN, zh-TW, es, ko, ar. **Türkçe katalog yok.** Bunun yerine `meta.translations` ile bir kez Türkçe katalog yazılır (en.json'daki 486 anahtar). Yazılmazsa arayüz İngilizceye düşer, bu da onun ekranlarında tek dil kuralını bozar.
- **Dikkat edilecek iki nokta:**
  - Kendi SKILL.md'si, bir explainer'dan sonra kullanıcıya bir teklif yapar: `~/.claude/CLAUDE.md`'ye `[archify explainer: proactive]` satırının eklenmesi. Bizde bu teklif hiç yapılmamalı; oradaki kural ancak onun sözüyle yazılır.
  - İlgili açık hatalar: #616 (uzun workflow'da dikey kaydırma) ve #1130 (macOS'ta makbuzun kesilmesi). Ötekiler Çince/Korece metin ve timeline ile ilgili, bizi engellemez.
- **Dış ses:** Konu blog ve dizinlerde çok yazılmış. skillcritic'in güvenlik incelemesi kısmidir: 50 dosyadan birini okumuş. HN'de iz yok, Reddit araması sonuçsuz döndü.

## 3. Holding tarafı — tamamlanmış holdinge göre

| Yararlı parça | Sahibi (tahta / şartname) | Bugün | Archify'ın yeri |
|---|---|---|---|
| Tıklanınca bağlantıları, yukarı ve aşağı akışı gösteren organizasyon ve iş haritası | ORGANIZATION_ENGINE_SPEC §5 "OrgGraph canvas" (SIFIRDAN; kütüphane seçimi STACK okuması + CEO görünürlüğü ile) · B32 V2 tasarım paketi · B10 canlı organizma · C27/C61 kartlar bir yere götürmüyor | `apps/dashboard/.../org/graph` yok. Dashboard'da grafik kütüphanesi yok | **Bileşen olarak değil.** OrgGraph canlıdır ve veritabanından okur (P3 şema-önce). Archify'ın PATH/MAP/LENS, "semantic passport", upstream/downstream erişim ve "Play story" fikirleri B32'de OrgGraph çizilirken referans olarak okunur. Kodu Apache-2.0 |
| "Para nereye gitti" maliyet kartı | COST_CONTROL_SPEC · B51 · C63 (grafik yok) | İnşaat hâlinde, satırları var | Archify değil. Canlı grafikler C63'te kurulur |
| Müşteriye kurduğumuz sistemin tıklanabilir haritası (reel sahibinin işi tam olarak bu) | B83 H9 dijital ekip kurulumu (#25) ve H7 ön büro (#23) · B84 web ofisi · B64 müşteri akışı | Satırlar kurulmadı | **Evet, teslim paketinde.** Tek bir HTML dosyası müşteriye gönderilir. Çalışanların bu skill'i kullanması B41'e bağlı ("vakti gelince"). Küresel müşteri için en/es/ar/ko/zh hazır, Türkçe için katalog gerekir |

Hiçbiri kusur değil. Hepsi kendi satırını bekleyen inşaat. Yeni bir satır gerekmiyor.

## 4. İnşaat oturumlarımız (CEO'nun eklediği taraf)

| Ne yapar | Nereye takılır | Elimizdekiyle ilişkisi |
|---|---|---|
| **Plan haritası:** Bir tahta satırının planı (adımlar, dokunduğu yerler, onay durakları) workflow ya da architecture haritası olarak, metnin yanında | dxb-team2 §1 PLAN: "the plan goes to him once, in his language" | Yok. Bugün plan yalnız metin. Hafızadaki "plan onun dilinde, önce konuş" dersine doğrudan hizmet eder |
| **Önce/sonra haritası:** Bir işin mimaride neyi değiştirdiği (Architecture Delta: eklenen, silinen, taşınan) | dxb-team2 §6 TELL ve dxb-verify. LAW B: onun gözü kabul eder | Yok. "Bitti ≠ onaylandı" anında ona bakacak bir sayfa verir |
| **Alt sistem haritası:** Ses daemon'u, orkestratör, onay kapısı gibi bir alt sistemin 8–12 düğümlük, commit'e sabitlenmiş, kaynağa bağlı haritası | dxb-start (yönlenme) · devir (handover) · Sol'a bağlam | graphify (B23, 5.742 düğüm) makinenin sorgu grafiğidir, okunacak bir harita değildir. Archify onu **tamamlar**, yerini almaz. Risk: harita bayatlar. Haritanın üstünde commit'i yazar ama B23'teki gibi bir tazelik testi yoktur |
| **İnşaatın kendi haritası:** dxb-team2 akışı + 13 kapı + kancalar (SessionStart, UserPromptSubmit, PreToolUse) + tahta ve kayıtlar | Tek seferlik. Ona gösterilir, onun gözü karar verir | Bugün böyle bir harita yok. CLAUDE.md'deki kapı tablosu yalnız bir listedir |
| Waterfall: Bir dxb-team2 işinde zamanın ve token'ın nereye gittiği (reel'deki "$20 nereye gitti" kartının bizdeki karşılığı) | B51 (maliyet = adım × bağlam) | claude-mem `agent-cost-report` sayıyı veriyor. Archify yalnız görünümü ekler. İkinci sırada |
| Explainer sayfası (soruyu tek sayfa cevaplama) | — | **Alınmaz.** Lacivert Rapor (onun adlandırdığı stil), Artifact aracı ve dxb-research `final.html` bunu zaten yapıyor |

Kuralların denetimi de bize uyuyor: `finalize`, gerçek Chrome'da açılmadan "geçti" demez. Bu, "kanıt olmadan bitti denmez" kuralımızla aynı çizgide.

## 5. Karar ve kurulum bloğu

**İnşaat için kurulsun. Holdingin çalışma zamanına kurulmasın.** STACK.md'ye uygun: Redis yok, ikinci bir iş çalıştırıcısı yok, ikinci bir ajan çatısı yok, sağlayıcı anahtarı yok. Uygulamaya da paket eklemiyor.

**Sahibi:** C30. Satırın istediği üç şey: gerçek inceleme kartı, gerekçeli kurulum kararı ve onu tüketen kod yolu. Tahtanın sırasını değiştirmez. Bu bir yapım satırı değil, inşaatın aletidir. **Yalnız onun evetiyle kurulur.**

```bash
# 1) Pinned v3.2.0, outside the repository (like graphify in ~/.claude/skills)
T=/tmp/claude-1000/archify-v3.2.0
git clone -q --depth 1 --branch v3.2.0 https://github.com/tt-a1i/archify.git "$T"
cp -r "$T/archify" ~/.claude/skills/archify          # the skill folder only, 18 MB
# 2) Local change, written down: delete the last paragraph of the Output section in
#    ~/.claude/skills/archify/SKILL.md (the offer to add "[archify explainer: proactive]"
#    to ~/.claude/CLAUDE.md) and add one line: "LOCAL: proactive-mode offer removed (DXB)".
# 3) No network check: "ARCHIFY_UPDATE_CHECK_DISABLED": "1" in the env block of ~/.claude/settings.json
#    (a settings change — under his yes)
# 4) Verify, in the scratchpad, not in the repository
node ~/.claude/skills/archify/bin/archify.mjs doctor
node ~/.claude/skills/archify/bin/archify.mjs demo /tmp/claude-1000/archify-demo
node ~/.claude/skills/archify/bin/archify.mjs finalize workflow \
  ~/.claude/skills/archify/examples/agent-tool-call.workflow.json /tmp/claude-1000/archify-demo/wf.html --quality showcase --json
# 5) Turkish viewer catalogue: 486 keys from locales/en.json -> a tr meta.translations file,
#    kept beside the dxb-team2 door; every map for him uses it (one locale on his screen)
# 6) First proof: a map of the construction itself (dxb-team2 flow + 13 doors + hooks + board/records)
#    in front of him — his eye decides (LAW B)
# 7) Only after his yes: one line in dxb-team2 §1 PLAN and §6 TELL — "a board-row plan or
#    architecture change comes with an Archify map (Turkish catalogue)"; C30 records the install
#    and the consuming path
```

**Maliyet:** Dışarıya para çıkışı yok, 0 $. Ücretli eşi (ör. Eraser'ın yapay zekâ diyagramı) yedek olarak yanında durur; fiyatı ölçülmedi.

## Gözlemlenemeyenler

- ~~⚠ UNVERIFIED: Archify bu makinede hiç çalıştırılmadı.~~ **Ölçüldü 2026-11-09, kurulumdan sonra:** `doctor` → "Archify is ready."; örnek workflow ve inşaatın haritası `finalize` ile dört kapıdan geçti (validate, deliver, check, browser-check; başsız Chrome gerçekten koştu, i18n uyarısı 0). Harita: `insaat-haritasi.html`; taslağı `insaat-haritasi.candidate.json` (Türkçe katalog `meta.translations` olarak `.claude/skills/dxb-team2/archify-tr.json`'dan eklenir). Katalog 486 anahtar, yer tutucu uyuşmazlığı 0; çevirisi Opus'un, insan gözünden geçmedi.
- ⚠ UNVERIFIED: Bir haritanın kaç token tuttuğu ölçülmedi. Referans dosyaları büyük: authoring-contract 645 satır, delivery-contract 665 satır.
- ⚠ UNVERIFIED: Reel sahibinin TELESMA ve ATLAS rakamları yalnız onun ekranından okundu.
- ⚠ UNVERIFIED: Yıldız sayısının gerçekliği (7 ayda 94 bin) ayrıca denetlenmedi.
- ⚠ UNVERIFIED: Eraser'ın fiyatı ölçülmedi.
