# Sol's single pass — isolation phase 3 (card CARD-PHASE3.md, normal, high; range 551b8af5^..b146822b), 2026-10-03

SOL_DB_REACH=armed engine=127.0.0.1:54422 tool_sha256=06fc5e586b510191
AUDIT_CARD class=normal total=5 effort=high
**“Şirket çağrısı inşaattan hiçbir şey açamaz” iddiasını doğrulayamadım. Dört engelleyici bulgu var.** Verilen normal/high kartını değiştirmeden tek geçiş yaptım; depoya yazmadım.

1. **A1 — Şirket evi kontrolü eksik.** [companyClaudeHome()](/home/dxb/DxB%20Global%20OS/packages/kernel/src/sdk-isolation.ts:72) yalnız kullanıcının `~/.claude` klasörünü engelliyor. Gerçek yardımcıyı çağırdığımda `<repo>/.claude`, depo kökü, göreli `company-claude` ve boş değer kabul edildi. Göreli değer kontrol sırasında bir yerde, çocuk sürecin çalışma klasöründe başka yerde çözülüyor. Ayrıca `work`, `cache` ve iç dosyaların bağlantıları kontrol edilmiyor: bellekte kurduğum bağlantı örneğinde çalışma klasörü depoya, cache inşaat cache’ine, `.claude.json` inşaat dosyasına yönelirken yardımcı geçti. **Düzeltme:** mutlak ve kanonik yol döndürmek; inşaat yollarını ve kullanılan alt yolların bağlantılarını da reddetmek. Mevcut şirket klasörlerinde böyle bir bağlantı gözlemedim.

2. **A2 — Ortam üzerinden cetveli geçen yol var.** [Yardımcı](/home/dxb/DxB%20Global%20OS/packages/kernel/src/sdk-isolation.ts:86) `CLAUDE*` değişkenlerini gerçekten düşürüyor; fakat `HOME`, `XDG_CONFIG_HOME`, `ANTHROPIC_CONFIG_DIR`, `GIT_CONFIG_GLOBAL` ve diğer değişkenleri geçiriyor. `GIT_CONFIG_GLOBAL=<repo>/.claude/skills/dxb-team2/SKILL.md` ile salt okunur Git komutu çalıştırdım: `fatal: bad config line 1 in file …/SKILL.md` çıktısı dosyaya ulaşıldığını gösterdi. Cetvelin analiz fonksiyonlarında doğrudan `cwd`/`env` eklemeleri reddedildi; çağrıdan önce `process.env.DXB_COMPANY_CLAUDE_HOME` veya `XDG_CONFIG_HOME` ataması ise `problems=[]` ile geçti. **Düzeltme:** dosya ve kimlik yollarını değiştiren ortam değişkenlerini de şirket sınırına bağlamak; cetvele bu karşı örnekleri eklemek.

3. **A3 — Strace kapısı ölçüm başarısızken de başarılı dönebiliyor.** [Probe](/home/dxb/DxB%20Global%20OS/.planning/quick/20261003-runtime-isolation/phase3-strace-probe.sh:28), `LANES_EXIT` değerini yazıyor fakat başarısızlığı durdurmuyor; son `grep`, `LEAK` satırında da başarılı olur. [Okuyucu](/home/dxb/DxB%20Global%20OS/.planning/quick/20261003-runtime-isolation/phase3-strace-report.py:19) olmayan trace klasörüne karşı çalıştırıldığında **0 program, 0 açılış, `PHASE3_VERDICT=CLEAN`** verdi. Bellekteki syscall örneklerinde göreli `.claude/settings.json` açılışı, depoya yazma ve çözülemeyen çocuk süreç de CLEAN geçti; mutlak proje ayarı kontrol örneği LEAK verdi. Göreli yollar, bağlantı hedefleri ve `rename`/`unlink` gibi işlemler bu kayıtla tam ölçülmüyor. Ham trace dosyaları da probe sonunda siliniyor. **Düzeltme:** eksik ölçümde kapıyı kapatmak, hata kodlarını taşımak, yolları süreç/FD bağlamında çözmek ve ham izleri saklamak.

4. **A4 — Hafıza yasağının sınırı değişken HOME’a bağlı.** [companyOwned()](/home/dxb/DxB%20Global%20OS/packages/memory-router/src/adapters/claude-mem.ts:52), inşaatın adresini her çağrıda `os.homedir()` üzerinden yeniden belirliyor. Bellekteki örnekte homedir `/home/dxb` iken gerçek inşaat DB yolu reddedildi; homedir şirket klasörüne çevrilince aynı yol kabul edildi. Gerçek HOME’u değiştirmedim ve DB’yi açmadım. **Düzeltme:** inşaat kimliğini çağrının değiştirebildiği ortamdan bağımsız belirlemek.

**C1 — Önceden var olan başka hafıza yolu:** [obsidian ve graphify okuyucuları](/home/dxb/DxB%20Global%20OS/packages/memory-router/src/classify-read.ts:251) `ref` yolunu doğrudan `readFile`’a veriyor. Sanal DB/dosya örneğinde `ref=/home/dxb/.claude-mem/claude-mem.db` dosya okuyucusuna ulaştı. Bu eski açıklık; kaldırılan `claude-mem` okuyucusunun geri geldiği anlamına gelmiyor. Ancak “her yol kapalı” iddiasını desteklemiyor.

**Canlı kanıtın gösterdiği kapsam:** [phase3-strace.txt](/home/dxb/DxB%20Global%20OS/.planning/quick/20261003-runtime-isolation/evidence/phase3-strace.txt:74) 633 ayrı açılış listeliyor:

| Yer | Açılış |
|---|---:|
| Şirket evi | 29 |
| Depo `node_modules` | 557 |
| Depodaki diğer runtime/paket dosyaları | 45 |
| Adlandırılmış residue | 2 |

Depodaki **602 dosyanın tamamının adları** [OPENED envanterinde](/home/dxb/DxB%20Global%20OS/.planning/quick/20261003-runtime-isolation/evidence/phase3-strace.txt:104); diğer 45 dosya [burada](/home/dxb/DxB%20Global%20OS/.planning/quick/20261003-runtime-isolation/evidence/phase3-strace.txt:661). Bunlar `dxb-mcp`, `memory-router`, `shared` kodları ve bağımlılıkları; şirket MCP sunucusunun çalışması için açılmışlar. İnşaat bağlamının modele sızdığına kanıt değiller. Fakat rapordaki “construction files reached (0)” bütün depo açılışlarının sayımı değil; kapsam istisnası açıkça yazılmalı.

Kayıtta **21 yazma amaçlı dosya açılışı** var; tamamı şirket evinde: dokuz `.claude.json.tmp…`, `.last-cleanup`, bir backup, iki MCP cache günlüğü ve sekiz session/anahtar geçici dosyası. Tam adları [yazma kayıtlarında](/home/dxb/DxB%20Global%20OS/.planning/quick/20261003-runtime-isolation/evidence/phase3-strace.txt:78). Adlandırılmış residue dışında inşaat ayarı veya transcript açılışı/yazması bu özet kayıtta görünmüyor. Syscall kapsamı nedeniyle bunu “bütün yazmaların eksiksiz listesi” diye imzalayamam.

`phase3-lanes-probe.txt` içindeki `79e77b01…` transcriptini şirket yazması saymadım; verilen kimlik bilgisine göre lead’in oturumu. Genel `.claude.json` mtime kaydı tek başına süreç aidiyeti göstermez.

**✓ Ölçülen ve tutanlar:**

- Cetvelin fonksiyonlarını test paketini başlatmadan 308 runtime dosyasında çalıştırdım: sekiz lane bulundu, `sdkProblems=[]`, `launchProblems=[]`; tek agent launch gate’in Codex çağrısıydı.
- Gerçek hafıza adaptörü varsayılan, açık ve `/proc/self/root/…` bağlantılı inşaat DB yollarını açmadan reddetti. İki adaptör fonksiyonunun runtime çağırıcısı bulunmadı; `recallMemory` içindeki `claude-mem` okuyucusu kaldırılmış.
- [Scheduler günlüğünde](/home/dxb/DxB%20Global%20OS/var/scheduler.log:12369) şirket evi ve `credentials=present` satırı var. Bu dosya varlığını ölçüyor; geçerli login’in kanıtı ayrı `auth status` çıktısı.
- [§8 alıntı cümlesi](/home/dxb/DxB%20Global%20OS/.agents/skills/dxb-team2/SKILL.md:192), konuşmadan kelimesi kelimesine ve kaynağı işaretlenmiş alıntıyı izin verilen kapsamda tutuyor. Ledger’daki eski “yalnız register’dan” hükmü silinmiş; genişletme/daraltma bulmadım.
- İnşaat DB denetim sayıları başlangıç/son: `audit_log=1795`, `v_audit_trail=1795`. Değişmedi.

**Ham çıktılardaki başarısızlıklar:**

- Önceki kodda dokuz beklenen kırmızı test: yardımcı şekli, varsayılan ev, yasak ev/bağlantı, login satırı, üç receipt testi, hafıza yasağı ve kaldırılmamış okuyucu.
- `phase3-tsc-outbox-executor.txt`: **TS2305**, `companyClaudeLoginLine` export’u bulunamadı; **exit=2**. Sonraki build/typecheck kayıtları **exit=0**.
- Son test kayıtları: isolation/gate **96 geçti**; hafıza **16 geçti / 1 atlandı**; B43 hedefli **1 geçti / 19 atlandı**.
- [Son batarya](/home/dxb/DxB%20Global%20OS/.planning/quick/20261003-runtime-isolation/evidence/battery-phase3.txt:682): sandbox **1119 geçti / 45 atlandı**, host **266 geçti**, **BATTERY_GREEN**, residue yok. Başarısız test yok. Python traceback’leri bozuk fixture’ları reddeden araştırma cetveli testlerinin içinde; suite başarısızlığı değil.
- `git diff --check` yalnız ham çıktı dosyalarındaki sondaki boşluk/boş satırlar nedeniyle başarısız.

**⚠ UNVERIFIED:** şirket DB’sindeki pointer satırları ölçülmedi. Sekiz lane’in tamamında canlı strace yok; chat/task ölçülmüş. Bu sandbox’tan systemd durum sorgusu ve yeni strace denemesi yetki hatası verdi. Sunulan phase-3 çıktılarında ayrı i18n, gitleaks ve canlı ledger-parity sonuçları yok; bunlara PASS demiyorum.

Log tail: EXIT=0
