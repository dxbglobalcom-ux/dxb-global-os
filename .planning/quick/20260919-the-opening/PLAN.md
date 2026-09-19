# B47 — THE OPENING · PLAN

**Status: SEEN BY THE CEO AND ORDERED BUILT, 2026-09-19** <!-- CEO-OK: opening-discipline-ordered-for-construction-and-holding-2026-09-19 -->. Written by the chief engineer (dxb-global-os-25, Fable 5.1) as `PLAN-ACILIS-2026-09-19.md`; the copy he read is on his Desktop (`ACILIS-PLANI-2026-09-19.md`). Filed here VERBATIM by the builder in STEP 0 so the plan lives in the repository once; the board row is B47 (construction side) and B41 (holding side). Nothing in it is accepted until his eye (LAW B); a step that changes shape after a measurement returns to him in four lines before it runs. Every "sonra" number below is a prediction until the same command re-measures it.

---

# AÇILIŞ PLANI — 2026-09-19

**Baş mühendis:** Fable 5.1 (oturum dxb-global-os-25). **Kaynak:** rakip-istihbarat dosyası 41 (Mert Durmazer'in MCP dersi). **Durum:** PLAN — hiçbir ayar, eklenti, dosya veya kanca değişmedi. Sizin sözünüz gelmeden kimse bir şey yapmayacak.

## Cevap

**Evet, açılışta yapılacak iş var; ama sanılandan küçük ve asıl para başka yerde.**

Bir oturumun ilk isteği **57.657 jeton** (ölçüm: bugün 17:5x açtığım taze oturum 66d92e72, `usage`: 36.610 yazılan + 21.047 okunan önbellek). Bunun kabaca **37 bin'i Claude Code'un kendi sistem metni ve temel alet tarifleri** — bizim elimizde değil, yalnız Anthropic değiştirir. **Bizim elimizdeki ~20 bin:** 18.340 ölçülü (dosya 41 §3.3) + claude-mem ~1.700 (inşaatçı ölçümü) + MCP sunucu tarifleri (⚠ ölçülmedi).

Filmin ana fikri — *"aletler lazım olunca gelsin"* — bizde **zaten çalışıyor:** 126 alet yalnız adıyla geliyor, 1.150 jeton. Yapılacak yeni bir "keşif" düzeneği yok.

## Resim: para nerede

Açılış bir kez yüklenmiyor; **her API çağrısında yeniden okunuyor.** Bugün inşaatçı oturumu 274 çağrı yaptı, her çağrıda ortalama **167.634 jeton** önbellekten okundu, toplam **45,9 milyon** (ölçüm: 4659402f oturum kaydı, `cache_read_input_tokens` toplamı). Açılışın payı bunun **~%12'si; %88'i konuşmanın kendisi.** Yani açılıştan 5 bin jeton kırpmak o oturumda 274 × 5 bin ≈ 1,4 milyon okuma eder; **konuşmayı kısa tutmak (14 Eylül "165k" dersi) daha büyük kaldıraç.** Bu plan açılışı ele alıyor; konuşma uzunluğu ayrı konu, burada yalnız adı geçiyor.

## Adımlar — sırayla, her biri önce/sonra ölçülü

| # | Adım | Bugün (ölçülü) | Sonra (TAHMİN) | Kimin sözü |
|---|---|---|---|---|
| 1 | **Dolap kalır, etiket küçülür** — 9 eklentinin 91 uzun tarifi açılışta gelmez; yerine tek sayfalık **dolap listesi** gelir (hangi yetenek var · ne işe yarar · nasıl açılır). Bir iş o yeteneği isteyince savaşçı çekmeceyi açar, tam tarif o zaman gelir. Eklentiler silinmez, kurulu kalır (CEO'nun 2026-09-19 sözü: savaşçı her şeyin nerede olduğunu bilmeli ve ihtiyacında kullanabilmeli) | **5.595 jeton/açılış** (caveman, taste-skill, skill-creator, frontend-design, obsidian, impeccable, claude-md-management, codex, andrej-karpathy-skills); 402 oturum kaydında **0 skill, 0 MCP çağrısı** (JSON parser, -20 ve -25 ayrı ayrı, aynı sayı). claude-mem kullanılıyor (20 çağrı, 9 oturum) — olduğu gibi kalır | ≈ 300 jeton (liste) — **ölçülecek:** çekmeceyi açmak oturumu yeniden başlatmayı gerektiriyor mu (⚠ UNVERIFIED, adımın ilk işi bunu ölçmek) | **Sizin** — 27 Ağustos "hepsi açık" hükmü; bu adım kapatmıyor, etiketi küçültüyor |
| 2 | **Playwright'ın ikinci bağlantısını (eklenti) kapat — YALNIZ onu** | Üç tarayıcı sunucusundan İKİSİ canlı kullanımda: **claude-in-chrome 128 çağrı / 5 oturum** (göz testleri ve operator işi bununla yürüyor), repo'daki **`playwright` 50 çağrı / 7 oturum**; ölü olan tek şey eklenti playwright: **0 çağrı** (30 gün, 402 kayıt, JSON parser) | ≈ 230 jeton daha az; karışıklık riski sıfırlanır (ölçülen yanlış seçim bugüne kadar 0) | **Sizin** — aynı hüküm |
| 2b | **skill-creator iki kez kurulu** — repo'nun kendi kopyası (`.claude/skills/skill-creator`) ve eklenti kopyası bayt bayt aynı (sha256 dcd4803e…, -20 buldu, -25 doğruladı); listede iki etiket, tek alet ("skill-creator" ve "skill-creator:skill-creator") — filmin 1. iddiasındaki hastalık bizim evde | 402 kayıtta ikisi de 0 çağrı; iki tarif ≈ 2 × ~80 jeton | tek kopya kalır; **önce ölçülür:** ad çağrılınca harness hangisini açıyor, sonra hangisinin gideceği söylenir | **Sizin** — repo kopyası bizim, silmek ayrı söz ister |
| 3 | **Hafıza indeksini (MEMORY.md) kısalt** — Temmuz–Ağustos dersleri yüklenmeyen ikinci indekse taşınır | 11.951 bayt ≈ 2.987 jeton, 88 hatıra | ≤ 1.400 jeton | Sizin (benim dosyam, ama "görmeden yapılmaz") |
| 4 | **claude-mem'in ikinci kopyası** — eklenti SessionStart'ta iki kanca koşturuyor (`worker start` + `context`) | ≈ 1.700 jeton; ikinci kopyanın modele gidip gitmediği **⚠ UNVERIFIED** | ölçülmeden söylenmez | Önce ölçüm, sonra sizin |
| 5 | **Açılış cetveli** — repo'nun sahip olduğu parçalara bayt bütçesi ve testi | CLAUDE.md 12.058 · kanca 7.825 · proje skill tarifleri ≈ 6.700 bayt | bugün kazanç 0; **yeniden büyümeyi durdurur** (STATE bir kez 1.796 satıra geri büyümüştü) | Sizin |

**Toplam (TAHMİN, ölçülmedi):** 1+2+3 ≈ **8.500 jeton/açılış** — bizim 20 bin'in ~%42'si; 274 çağrılık bir oturumda ≈ 2,3 milyon daha az önbellek okuması. Yapıldıktan sonra aynı komutla yeniden ölçülür; bu satır o zamana kadar tahmindir.

**Parçanın sahibi zaten var (CEO'nun sorusu, 2026-09-19, ölçüldü):** dolap sistemi 30 Temmuz 2026'da kuruldu (B21, U42): tek sayfa çekirdek `.claude/CLAUDE.md` + 9 kapı `.claude/skills/dxb-*` (start · close-row · verify · surface · ceo-report · research · rival-intel · persona · hamza-context) — iş gelince açılır; STATE tek sayfa. **Ölçüm:** CLAUDE.md §4'te 9 kapı satırı var ve çalışıyor. **Eklentiler o dolabın DIŞINDA:** dokuz eklentinin hiçbiri CLAUDE.md'de, kapılarda, kancalarda veya direktiflerde anılmıyor (grep: 0 — obsidian ve codex birer kapı içinde geçiyor, o kadar); 27 Ağustos'ta hepsi açıldığında Claude Code 91 tarifi kendisi listelemeye başladı ve dolabı atladı. **Adım 1 yeni sistem değil, var olan dolabın eklentilere uzatılmasıdır.** -20'nin canlı kanıtı (2026-09-19): bir eklenti skill'i oturum içinde açılıyor (`Skill(caveman:caveman-help)` yeniden başlatmasız döndü) — tarif açılıştayken. Kalan tek bilinmeyen ve adımın ilk ölçümü: tarif açılıştan çıkınca aynı çağrı yalnız ADLA çalışıyor mu (kırmızı → yeşil).

**Düzeltme kaydı (2026-09-19, -20'nin itirazı üzerine):** ilk sürüm claude-in-chrome'u 0 ve 10 eklentiyi 4.648 jeton yazmıştı; dedektör hatalıydı (ham metin araması). Yukarıdaki sayılar JSON parser ile iki oturum tarafından ayrı ayrı ölçüldü.

**Not — hiçbir eklenti silinmez.** Tasarım eklentileri (taste-skill, ui-ux-pro-max, frontend-design, impeccable) dolapta durur; Faz 8 tasarım işi başlayınca çekmece açılır (kayıtlı kararınız: Faz-8 yeniden açma). Adım 1'in yapılış biçimi (proje ayarında kapalı + dolap listesi, ya da başka bir yol) inşaatçının ölçümüne göre seçilir ve size sonucu söylenir.

**Ayrı konu, bu plana karışmaz (disk, jeton değil):** eklenti önbelleği diskte 529 MB, 473 MB'ı claude-mem; skill-creator 14 eski sürüm tutuyor. Temizlik bir gün iş olursa 5 Eylül kuralınız uygulanır: klasör klasör liste ve boyut önünüze, tek bakış, sonra silme; kendi başına hiçbir şey gitmez.

## Holdingin kendisi — CEO'nun sorusu (2026-09-19): "holdingin yapısında var mı, tahtaya yazılmış mı?" — ÖLÇÜLDÜ

Sizin sözünüz: videoda anlatılan hem inşaatta hem holdingin kendisinde uygulanacak. Holding tarafında dört parçanın durumu:

| Filmin parçası | Holdingde var mı? | Nerede / ölçüm |
|---|---|---|
| **Kategoriler** ("ajana sadece şunları ver") | **VAR, kurulu** | Geçit (gateway) her çalışana departman + rütbe kitini derliyor; borçlu koltuk kendi kitini tutup yalnız gerekeni ekliyor (`packages/gateway/src/library-profiles.ts`, `generate-profiles.ts`; W9 kaydı: 23 alet → overlay ile 28). Şirket DB: 211 aktif çalışan `inherit`, 2 overlay |
| **Keşif** (çalışan elinde olmayan aleti arayıp bulsun) | **Tahtada yazılı, AÇIK, yapılmadı** | Tahta **B41** (27 Ağustos, sizin sözünüz: "holding kadrosu … bunları nereden temin edecek") — tedarik zinciri ve açılmayan katalog. **C29** de aynı mekanizmayı adıyla anıyor: *progressive disclosure*, kitaplık resmi, "iş gücü için aynı kural = B41" |
| **Kod modu** (ara sonuç bağlama girmesin) | **YAZILI DEĞİL** — ne spec'te ne tahtada (grep: "code mode" 0 anlamlı, "ergonomic" 0) | Araştırma filosu böyle çalışıyor (inşaat tarafı). Çalışanlarda ölçüm: koşu başına 2,5 alet çağrısı; `queue_get` 537 çağrının 300'ü |
| **Ergonomik katman** (sık zincir tek işlem) | **YAZILI DEĞİL** | Filoda var; holdingin kendi MCP'sinde (`packages/dxb-mcp`, 9 grup: approval · audit · cost · crm · dashboard · media · memory · queue · registry) böyle bir sarma yok — ölçüldü, önerilmedi |

**Buradan çıkan iş (sizin sözünüzle, yapılmadan önce görürsünüz):** filmin holding tarafı **yeni tahta satırı değil**; sahibi zaten **B41**. Sizin "her eklediğimiz şey için bunu istiyorum" sözünüz B41'e kayıtlı adaptasyon olarak girer: (a) kategoriler — bitti, kanıtı yazılır; (b) keşif — B41'in kendi işi, sırası gelince; (c) kod modu + ergonomik katman — B41'e iki ölçülü madde eklenir (`queue_get` zinciri ilk aday), inşa yok. Spec tarafında sahibi `AGENT_ORCHESTRATION_SPEC.md` + `CAPABILITY_ARSENAL_DOCTRINE.md`; yeni spec yazılmaz (plan bir kez var).

## Reddedilenler — gerekçeli

- **Proje CLAUDE.md'yi kırpmak (3.014 jeton):** hayır. Sizin anayasanız; 30 Temmuz "sabit metin tek sayfa, sekiz kapı" hükmü zaten bu şekli verdi.
- **"Kod modu" inşa etmek (filmin 4. iddiası):** hayır. Araştırma filosu zaten kod modu (betikler zincirliyor, ara sonuç modele girmiyor). Çalışan ajanlarda ölçüm: **537 alet çağrısı / 219 koşu = koşu başına 2,5** (şirket DB, `tool_calls`); ara sonuç yükü küçük. Tek aday: `queue_get` (537'nin 300'ü) — sarılmadan önce bağlam maliyeti ölçülür; bugün yapılmaz.
- **Çalışanlara kategori vermek (filmin "sadece şunları ver"i):** zaten var. Profil derleyici her çalışana departman kitini veriyor: 211 aktif çalışan `inherit`, 2 stüdyo koltuğu kendi overlay'i (W9, 15 Eylül). Yeni bir şey yok.
- **Yeni "ergonomik katman" aramak:** filo var; başka aday ölçülmedi, uydurulmadı.
- **Filmdeki eşiği (%1–5) bize kural yapmak:** hayır; sizin "kanun olsun" demediğiniz hiçbir şey kanun olmaz. Adım 5'teki bütçe bir test, kural değil.

## Etki alanı (17 Ağustos emriniz: hedefi onar, çevresini bozma)

Açılış her oturumun temeli. Üstünde duranlar: pozisyon kancası (§0), doorlar (dxb-*), operator/playwright ile göz testleri, claude-mem hafızası, araştırma filosu. Her adımdan sonra aynı komutlarla yeniden ölçülür (ek A): taze oturumun ilk istek jetonları · pozisyon dosya açmadan geliyor · oturum-açılış cetveli 4/4 · beklenen skill adları listede var · `mcp__playwright__browser_navigate` taze oturumda çalışıyor · kayıt cetveli ve defter kapısı yeşil.

## Sizden istenen

Tek kelime yeter: hangi adımlar (1–5) yapılsın. Yapan inşaatçı (Opus 5), ölçen ben. Ölçülmüş "sonra" rakamı gelmeden hiçbir yerde "bitti" yazılmaz.

---

## Annex A — for the builder (English, commands)

Measured 2026-09-19 by the checker, all read-only:
- First request of a fresh headless session: `claude -p … --output-format json` → `usage`: cache_creation 36,610 + cache_read 21,047 = 57,657 (session 66d92e72).
- Prefix re-read per call: python over `~/.claude/projects/-home-dxb-DxB-Global-OS/4659402f….jsonl` summing `cache_read_input_tokens` → 274 calls, 45,931,753 read, avg 167,634.
- Browser tool use, 30 days, parsing `type=="tool_use"` blocks over 402 jsonl (1 018 MB; a raw grep for `__browser_` had missed claude-in-chrome entirely and over-counted playwright — detector corrected by dxb-global-os-20, re-run by the checker, same numbers): `claude-in-chrome` 128 calls / 5 sessions · `playwright` (repo mount) 50 / 7 · `plugin_playwright` 0 / 0. **Only the plugin mount is dead; the other two are live and must not be thinned.**
- Mounts: `.mcp.json` → `playwright-mcp --headless --isolated --browser chromium` (binary 0.0.79); plugin `claude-plugins-official/playwright` → `npx @playwright/mcp@latest`. Repo references to browser tool names: `.claude/settings.local.json` (permissions), `scripts/gateway/probe-runtime-chain.mjs`, two research notes.
- Employees' categories: company DB `select mcp_profile,count(*) from agents where employment_status='active'` → inherit 211, two overlays. Tool chains: `tool_calls` 537 calls / 219 runs (2026-07-17 → 09-05), top: queue_get 300, media_probe 57, memory_recall 35.
- claude-mem: `~/.claude/plugins/marketplaces/thedotmack/plugin/hooks/hooks.json` SessionStart matcher `startup|clear|compact`, two hooks (`worker-service start`, `hook claude-code context`).
- `enabledPlugins` lives only in `~/.claude/settings.json` today; project-scoped enablement in `.claude/settings.json` is documented but UNVERIFIED here — step 1 tries it first and measures.

Plugin use, 402 records, JSON parser (Skill `plugin:skill` + `mcp__plugin_*`): nine description-carrying plugins at 0/0 (5,595 tokens); claude-mem 20 calls / 9 sessions; ui-ux-pro-max, context7, open-design 0 use but no description cost measured here.

Step order if he says yes: (5) the ruler first, committed alone (`tests/hooks/opening-budget.test.ts`: CLAUDE.md ≤ 13,000 B · hook ≤ 8,000 B · project skill descriptions ≤ 7,000 B) → (2) plugin playwright off, fresh-session proof that `mcp__playwright__browser_navigate` still works → (1) THE CUPBOARD: first MEASURE whether a plugin enabled mid-session (`claude plugin enable <name>` / settings change) becomes usable without a restart; then the nine plugins off for this project in `.claude/settings.json` `enabledPlugins` (UNVERIFIED that project scope works — measure) and a one-page cupboard index (≈300 tokens; name · what for · how to open) delivered at the opening by the session-start hook, fresh-session proof that the index arrives and a named drawer can be opened → (3) MEMORY.md split → (4) measure claude-mem with a fresh session's jsonl before touching anything. After each: `claude -p` fresh session, paste `usage`. A prediction is never written in the past tense.
