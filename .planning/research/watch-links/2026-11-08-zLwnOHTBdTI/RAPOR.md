# Video incelemesi — "Claude Code'u %90'dan Daha Verimli Kullan! (Claude Subagent)"

**Cevap:** Video, Claude Code'da alt ajanın ne zaman açılıp ne zaman açılmayacağını anlatan 10 dakikalık bir ders. Anlattığı her fikir holdingde zaten bir sahibi olan bir yerde duruyor: holdingin çalışma zamanında AGENT_ORCHESTRATION A19, A27, A28, A29 ve MODEL_ROUTING §4d ile §4e, inşaat oturumlarında da dxb-team2. Sahipsiz bir fikir çıkmadı, bu yüzden yeni satır önerilmiyor. Videonun sonunda tanıtılan CrewCtl kurulmaya değmez, çünkü ikinci bir ajan çatısı olur. Ama canlı ekip sahnesi, B10 ve W-C42-2'nin "canlı organizma" ekranı için bakılacak bir örnek.

## 1. Video nedir

| | |
|---|---|
| Yapan | Ömer Göçmen, "Yapay Zeka & Otomasyon" kanalı |
| Tarih / süre | 5 Kasım 2026 · 10:48 · ~5,6 bin izlenme (8 Kasım) |
| Biçim | Köşede yüz kamerası, ekranda koyu zeminli animasyonlu anlatım kartları. Gerçek bir terminal ya da Claude Code ekranı gösterilmiyor; yalnız son karede CrewCtl'nin GitHub sayfası açılıyor. |
| Bağlantı | https://youtu.be/zLwnOHTBdTI · repo: https://github.com/omergocmen/CrewCtl |

İzleme yöntemi: YouTube'un Türkçe otomatik altyazısının tamamı okundu (`transcripts/v1-zLwnOHTBdTI.txt`). 720p video indirildi ve bölüm başlarından 30 kare alındı (`frames/`). Sahne kesimi aracı kesim bulamadı, çünkü video tek düzen bir kart animasyonu. Bu yüzden kareler bölüm saatlerine göre seçildi.

## 2. Ne anlatıyor, adım adım (dakikasıyla)

- **00:28 Alt ajan nedir.** Ana ajan asistan, alt ajanlar onun yanındaki stajyerler gibi düşünülür. İş parçalara bölünür; böylece ana ajanın bağlamı daha az şişer ve kafası daha az karışır.
- **01:41 Paralel arama.** 1000 dosya dört alt ajana 250'şer olarak bölünür ve aynı anda aranır.
- **02:17 "Alt ajanın beyni sıfır."** Alt ajan yalnız ana ajanın ona aktardığını bilir. Ekrandaki kartta ana ajan "Proje, Kararlar, Dosyalar, Zevk, Geçmiş" bilgisini taşır, alt ajanda bu sıfırdır. Alt ajan ana ajana yalnız sonucunu döner, yaptığı işin tamamı ana ajanın hafızasına yazılmaz.
- **03:21–04:52 Kendi testi: üç sayfada hata (giriş, kayıt, ana sayfa).** Ekrandaki rakamlar şunlar:
  - **Tek ajan** üç sayfayı sırayla düzeltti: **81.022 token, 59,7 sn**. Ana ajanın bağlamı üç sayfayı da içine aldı.
  - **Üç alt ajan** aynı işi paralel yaptı. Giriş sayfası 43,6 sn ve 77.572 token, kayıt sayfası 30,2 sn ve 75.903 token, ana sayfa 45,0 sn ve 76.247 token. Toplam **45,0 sn** ve **229.722 token** tuttu; ana ajanın hafızası şişmedi.
  - Konuşmada rakamları yuvarlak söylüyor ("85 k", "310.000"). Ekrandaki ve açıklamadaki rakamlar ise üç parçanın toplamıyla tam tutuyor. Bu raporda ekrandaki rakamlar esas alındı.
  - Testin hangi modelle koştuğu gösterilmiyor (bkz. §6).
- **04:52 Token neden fazla.** Her alt ajana iş baştan anlatılır, ayrıca sonuçları birleştirmenin de bir maliyeti vardır.
- **05:19 Kendi video kurgu akışı.** Sırası şöyle: ses çıkarılır, yazıya dökülür, parçalara kesilir, sonra kurgulanır. Aceleye geldiğinde video üç parçaya bölünüyor ve üç alt ajan aynı anda kurguluyor. Her alt ajana aynı `edit_formatim.md` dosyası veriliyor. Bildirdiği sonuç: **1 saatlik kurgu 20–25 dakikada bitiyor (05:51), ama token çok fazla gidiyor.**
- **06:09 Model seçimi.** Ana ajan iyi bir model (ekranda Opus 5.5), "amele işleri" küçük bir model (ekranda Haiku). Örneği şu: kurgu Opus 5.5'te yapılıyor, kapak görseli araştırmasını bir Haiku alt ajanı yapıyor (web araması, rakiplerin kapakları, YouTube algoritması, sonunda "bana standart getir").
- **06:55 Kodu başka bir göze inceletmek.** Ajan kendi yazdığı kodun doğru olduğuna inanıyor, o yüzden "AI slop" düzeltilmiyor. Alt ajana ya da Codex'e inceletiyor. Bildirdiği sonuç: **Opus iki öneri verdiyse Codex on öneri veriyor (07:25)**, çünkü kodu kendisi yazmadı ve arkasındaki mühendislik farklı.
- **07:44 Yan soru için alt ajan.** İş sürerken "bu görsel nereden geldi" gibi bir soru, ana bağlamı şişirmesin diye küçük bir alt ajana soruluyor.
- **08:13 Birbirinden bağımsız skill'ler paralel koşar.** Doküman güncelleyen skill Haiku'ya, test yazan skill Sonnet'e veriliyor. İki iş aynı anda bitiyor; hem zaman hem token kazanılıyor.
- **08:48 Büyük dosyalar.** Anthropic'in kendi dokümanındaki tavsiyeyi aktarıyor: büyük log, veritabanı dökümü ya da dokümantasyon ana ajanda işlenmez, alt ajana verilir.
- **09:23 Küçük değişiklikte alt ajan açılmaz.** İki satırlık bir değişiklik için alt ajan 60–70 k bağlam okuyor.
- **09:48 Özet.** Alt ajan her zaman daha pahalıdır, daha az token harcadığı bir senaryo yoktur. Karşılığında işi daha hızlı yapar ve ana ajanın kafası karışmaz.
- **10:12 Orkestratör.** Opus 5.5 yönetici olur; elinin altında Codex, Antigravity ve Gemini çalışır. **10:31 CrewCtl:** kendi açık kaynak orkestratörü. Bir sonraki videoda başka bir orkestratörü inceleyeceğini söylüyor.

**CrewCtl, GitHub'dan ölçüldü (8 Kasım):** Node.js ile yazılmış, sıfır bağımlılıklı, yerel çalışan bir orkestratör. Makinede kurulu Codex CLI, Claude Code, Gemini CLI ve OpenCode'u tek ekip gibi koşturuyor: bir CLI "operatör" olup planlıyor ve dağıtıyor, uzmanlar ayrı süreçler olarak çalışıyor. Canlı bir 3B "Ekip Akışı" sahnesi var: operatör çekirdeği, ajan gezegenleri ve aralarında akan veri paketleri. Ayrıca canlı kod farkı, Kanban panosu, zamanlanmış görevler, iş öncesi kontrol noktası, tek tıkla geri alma ve worktree yalıtımı var. 76 yıldız, 6 çatallama; 9 Temmuz 2026'da açılmış, son gönderim 21 Eylül 2026. README'de MIT rozeti var ama GitHub depo düzeyinde bir lisans tanımıyor (lisans dosyası `orchestrator/LICENSE` altında).

## 3. Holdingin çalışma zamanında karşılığı — her fikrin sahibi

| Videodaki fikir | Holdingde sahibi | Bugün ne duruyor |
|---|---|---|
| İşi parçalara bölüp paralel yaptırmak (üç sayfa, üç video parçası) | AGENT_ORCHESTRATION **A27** ve **A19**, satırı **B64** | İşin ustası (master) sınırlı parçaları uzmanlara dağıtır. Bu, Claude Code'un oturum içi alt ajanıyla değil, holdingin kuyruğundan ve iş masasından yapılır. Böylece parça onun ekranında adıyla görünür, maliyeti işe yazılır ve devirden sonra da yaşar. Oturum içi alt ajan yalnız ustanın kısa, salt-okur aramalarına hizmet eder. Bu onun 28 Ekim kararı (`specialists-through-the-queue-2026-10-28`). A19 dispatch defteri kurulu (`packages/dxb-mcp/src/dispatch-book.ts`). Ustanın bölmesi B64 inşaatında. |
| Alt ajanın beyni sıfır, ana bağlam küçük kalsın | **A29** "bağlam disiplini" (B64) | Her koltuk kısa kimlikle, brifle ve masanın adresiyle açılır. Masa tek doğru kaynaktır; bağlam büyüdükçe üç adımda temizlenir. Bunlar yazılı ve inşaatta. |
| İyi model başta, küçük model angaryada (Haiku) | MODEL_ROUTING **§4d** (kalite katmanı kanunu), **§4f**; satırı **B51** ve **B64** | Katmanlar var: L3 ve L4 ucuz katmanlar. Ama **Haiku kadroda yok** ve L4 "asla `low` değil". Alt katmanın çıktısı hiçbir zaman bitmiş ürün sayılmaz, yalnız üst katmana girdi olur. Videonun Haiku önerisi bu kanuna takılır; bilinçli bir karar olduğu için eksik değildir. |
| Kodu başka bir model incelesin (Codex) | MODEL_ROUTING **§4e**, **A28**, **A32** | Kurulu: `packages/orchestrator/src/critical-gate.ts` Codex CLI'ı abonelik modunda, salt-okur koşturur. Müşteriye giden işi Sol 6.1 high okur ve çalışanı dener; Fable 5.1 high da kör okur. Videonun "kendi yazdığını eleştiremez" gözlemi, bu kapının kuruluş gerekçesiyle aynı. |
| Video kurgusunu üç parçaya bölüp paralel kurgulamak | **A27**'de "onaylı tasarımdan sonra sınırlı parça", **A16** medya hattı, studio, **B28** | Ustanın parçaları dağıtma yolu var. Aynı çalışana tek koşu sınırı var (`employee.max_concurrent_runs`, varsayılan 1, `worker-shim.ts:677`); paralellik farklı koltuklarla sağlanır. Tek GPU'lu istasyonda kurgunun üç kat hızlanıp hızlanmayacağı ölçülmedi: ⚠ UNVERIFIED. |
| Token ve süre ölçerek karar vermek | **B51** (2) maliyet sayacı, (4) iş başı maliyet satırı; **A29** kaydı | Kayıt her işin turunu, bağlamını ve maliyetini tutar. Videodaki "tek ajan mı, üç alt ajan mı" kıyası, bu kayıt kurulunca kendi işlerimizden okunur. |
| Orkestratör: Opus yönetici, Codex/Gemini/Antigravity işçi | MODEL_ROUTING §4d kadrosu, §4e; **B51** | Codex hattı yalnız denetçi koltuğunda açık (Sol 6.1). Gemini anahtarı medya ve hareket okuma için kullanılıyor (B26). "İkinci ajan çatısı yok" kuralı `.claude/CLAUDE.md` §5'te ve `.planning/research/STACK.md`'de duruyor; orkestrasyon Agent SDK'nın işi. |
| CrewCtl'nin canlı ekip sahnesi (gezegenler, akan paketler, kim çalışıyor) | **B10** ("canlı kanlı bir organizma"), **W-C42-2** (canlı örgüt takımyıldızı), AGENT_ORCHESTRATION §7 Live Operations | Satırları açık. CrewCtl'nin sahnesi tasarım için bir başvuru örneği olarak bu satırlara bakılabilir; kod alınmaz. |

**Sahipsiz fikir yok, yeni satır önerilmiyor.**

## 4. İnşaat oturumlarımızda (Claude Code) karşılığı

| Videodaki fikir | Bizde sahibi |
|---|---|
| Paralel alt ajan, ana bağlamı korumak | **dxb-team2**: lider yazanı seçer (kendisi, fork, `helper-writer` Opus 5.5 medium ya da ikisi birlikte). Paralel ölçümü salt-okur `helper`'lar yapar. Küçük işler, liderin bağlamını şişirmesin diye yardımcıya gider (CEO 7 Kasım). |
| Yan soruyu alt ajana sormak | dxb-team2: yardımcılar ölçerken konuşma sürer. Yalnız konum bulmak için `scout` var. |
| Başka gözle inceletmek | dxb-team2: iş başına bir kör **Sol (GPT-6.1)** geçişi, `scripts/governance/refuter.sh`. Sol yoksa `refuter` alt ajanı devreye girer. |
| Küçük model angaryada | Oturum tarafında Haiku kullanılmıyor (`.planning/governance/model-routing-hierarchy.md` v19). Ucuz iş için Sonnet zaten kullanılıyor; örneğin dxb-watch-links §5'te Excel'e taşıma işi. |
| "Alt ajan daha pahalıdır" uyarısı | Hafızada zaten var: maliyet = adım × bağlam (`fresh-master-beats-resumed-giant-session`). Ayrıca `dxb-cost-gate` kancası alt ajanda 4 dakikayı geçen komutları kesiyor; bu incelemede ölçüldü, komut gerçekten kesildi. |
| Küçük değişiklikte alt ajan açılmaz | Agent aracının kendi kuralı ve dxb-team2'deki hafif yol aynısını söylüyor. |

Oturumlar için de yeni bir şey gerekmiyor.

## 5. Kurulacak alet var mı

**Hayır.** CrewCtl güçlü bir aday değil:
- İkinci bir ajan çatısı olur; bu, CLAUDE.md §5 ve STACK.md tarafından yasak.
- Holdingde aynı işi yapan bir yapı zaten var: Agent SDK, dispatch defteri ve critical-gate içindeki Codex CLI.
- Daha genç bir repo (76 yıldız, Eylül'den beri gönderim yok).

Kurulum bloğu yazılmadı.

## 6. Gözlenemeyenler

- ⚠ UNVERIFIED: Üç sayfa testinin hangi modelle koştuğu videoda gösterilmiyor. 81.022 / 229.722 token ve 59,7 / 45,0 sn, yapanın 2026 Kasım'da kendi işinde bildirdiği rakamlar; Opus 5.5 hakkında genel bir ölçü değil.
- ⚠ UNVERIFIED: "Codex 10 öneri, Opus 2 öneri" (07:25) ve "1 saat → 20–25 dk" (05:51) yapanın kendi deneyimi; kıyasın ayrıntısı gösterilmiyor.
- ⚠ UNVERIFIED: Paralel kurgunun bizim tek GPU'lu istasyonumuzda hızlanma getirip getirmeyeceği.
- CrewCtl kurulmadı ve çalıştırılmadı; özellikleri yalnız README'den okundu.
