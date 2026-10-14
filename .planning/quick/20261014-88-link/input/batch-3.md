

## W033 — NVIDIA build.nvidia.com ücretsiz API anahtarı + OpenCode
- Link: https://www.instagram.com/reel/DW1m5ZqiAtS/
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-06-22
- **Tür:** araç
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** Ücretsiz NVIDIA NIM uç noktası (Kimi K2, GLM, DeepSeek R1, Nemotron, GPT-OSS) B06 kimi sınavını ve B51 model ölçümlerini parasız koşturur. NVIDIA Build dev tier STACK.md:7'de zaten kilitli karar. NVIDIA'nın kendi metni anahtarı 'kickstart development' için veriyor (kare); oran sınırı yaklaşık 40 istek/dk (forum, ikincil). Videodaki 'sınırsız' iddiası yanlış. OpenCode ek bir harness'tir, gerek yok. Aynı iş W039'da.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Sınav maliyetini düşürür; tutar küçük ve ölçülmedi. Üretime konamaz.
- **Gelir katmanı:** Maliyet düşürme
- **Nasıl para getirir (okuyucu):** Ücretsiz NVIDIA NIM uç noktası açık modelleri (Kimi K2, GLM, DeepSeek R1, Llama, Nemotron, GPT-OSS) sıfır maliyetle denemeye yarar: B06 kimi sınavı ve B51'in ucuz model ölçümleri para harcamadan yapılabilir. Üretim yükünü taşıyamaz: NVIDIA anahtarı 'geliştirmeye başlamak' için verildiğini söylüyor ve oran sınırı dakikada ~40 istek.
- **Rakam kanıtı:** Karede NVIDIA'nın kendi metni: 'This API key authenticates you to use serverless APIs powered by NVIDIA NIM to kickstart development' (ölçüldü, kare). Oran sınırı ~40 istek/dk: NVIDIA forumu (https://forums.developer.nvidia.com/t/request-for-nvidia-nim-api-rate-limit-increase-40-200-rpm/375340) — ikincil. Videodaki 'sınırsız, limit yok' iddiası yanlış.
- **İlk para:** Elimizde: B06, B51. Eksik: NVIDIA hesabı (kimlik adımı, CEO onayı) ve sınav betiğinin bu uç noktaya bağlanması. Yarım gün, 0 USD.
- **Engel ve aşma:** Üretimde kullanmak şartlara aykırı → yalnız sınav ve deneme. Oran sınırı → gece, sıralı.
- **Öneri:** İzle
- **İkinci turda:** 1/Gerek yok
- **Neden değişti:** Öneri 'Gerek yok'tan 'İzle'ye: model sınavlarını (B06, B51) para harcamadan yapma yolu.
- **Oturum (0-3):** 0
- **Tahta satırı:** B34 (yerel işçi model), B06 (kimi model sınavı)
- **Link(ler):** https://www.instagram.com/reel/DW1m5ZqiAtS/
- **Neye bakıldı:** Üç adım: 1) video 77 sn, döküm (konuşma ilk 41 sn, sonrası sessiz ekran); 2) 12 kare; 3) watchall — 77 karenin tümü (7 sayfa); web araması (oran sınırı, koşullar)

### What it is — the watch record (newest pass)
- **tur:** araç
- **ne_bu:** 76 sn'lik reel: `npm install -g opencode` ile OpenCode'u kurup, build.nvidia.com'da e-postayla oturum açıp 'süresiz' bir API anahtarı üretiyor ve OpenCode'da sağlayıcı olarak NVIDIA'yı seçiyor. Listede görünen modeller: GPT-OSS-120B, Gemma 3/2, Kimi K2 Instruct/Thinking, Llama 3.x/4, Nemotron Super 49B, DeepSeek R1, Devstral 2, GLM-4.7, GLM-5. NVIDIA'nın kendi anahtar ekranı 'bu anahtar yalnız API testi içindir' diyor; ücretsiz katman dakikada yaklaşık 40 istekle sınırlı, videodaki 'sınırsız, limit yok' iddiası yanlış.
- **okundu:** evet — döküm ve kareler; koşullar ikincil kaynaklardan (NVIDIA forumu) doğrulandı, ToS metni okunmadı
- **izlendi:** Üç adım: 1) video 77 sn, döküm (konuşma ilk 41 sn, sonrası sessiz ekran); 2) 12 kare; 3) watchall — 77 karenin tümü (7 sayfa); web araması (oran sınırı, koşullar)
- **zaten_var:** Yok — OpenCode kurulu değil, NVIDIA uç noktası kullanılmıyor; Hamza'nın DeepSeek/Kimi ucuz hatları ve yerel model (B34) var.
- **not:** Ücretsiz anahtar NVIDIA hesabı ister (kimlik adımı). Koşullar: üretim kullanımı yasak sayılıyor, oran sınırı modele ve yüke göre değişiyor. Kaynaklar: https://forums.developer.nvidia.com/t/request-for-nvidia-nim-api-rate-limit-increase-40-200-rpm/375340 , https://forums.developer.nvidia.com/t/is-nim-free/369368


## W035 — Justyn Berkovits — Claude Cowork kurulumu: global instructions + about-me / writing-rules / memory dosyaları + connector'lar + skill'ler
- Link: https://www.instagram.com/reel/DYxkUorPZ-T/
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-06-23
- **Tür:** eğitim
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** Tek işe yarar parça writing-rules.md: Wikipedia'nın 'Signs of AI writing' sayfasından türetilen kurallar. Bu kurallar içerik ve ajans personalarının yazım kuralına ve çıktı denetimine girer; persona değişikliği dxb-persona kapısından geçer. Global instructions, about-me ve memory yapısı bizde zaten var.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Müşteriye ve kendi kanallarımıza giden metnin 'AI kokusu'nu azaltır. B28 ve içerik hattında küçük, dolaylı bir kalite katkısı; ölçülmedi.
- **Gelir katmanı:** Kabiliyet
- **Nasıl para getirir (okuyucu):** Kendi başına para getirmez. Tek işe yarar parça writing-rules.md: Wikipedia'nın 'Signs of AI writing' sayfasından türetilen, 'AI kokan' yazıyı önleyen kurallar. Bunu içerik ve ajans personalarının (pazarlama 33, sosyal medya 13 koltuk) yazım kuralına koymak, müşteriye ve kendi kanallarımıza giden metnin kalitesini yükseltir; bu da B28 ajans işlerinde ve içerik kanallarında küçük, dolaylı bir katkıdır.
- **Rakam kanıtı:** Videoda para rakamı yok. '%99 insandan iyi' sözü iddia, ölçü değil.
- **İlk para:** Elimizde: persona dosyaları ve skill altyapısı. Eksik: tek bir yazım kuralları dosyası. Adım: Wikipedia 'Signs of AI writing' sayfasından kural listesi çıkarılır, içerik personalarının çıktısı buna karşı denetlenir. Süre yarım gün, maliyet 0. Onay: persona değişikliği dxb-persona kapısından; kalıcı kural yapmak onun sözüne bağlı.
- **Engel ve aşma:** Rehberin tamamı yorum/DM arkasında — yorum yazmak yasak; gerek de yok, videoda görünen üç dosya yeterli. Kuralların İngilizce olması: Türkçe çıktılara uyarlanarak geçilir.
- **Öneri:** Dene
- **İkinci turda:** 0/Gerek yok
- **Neden değişti:** Önceki 0 / Gerek yok idi. Kazanç merceğiyle bakınca 'AI kokusu olmayan metin' içerik ve ajans çıktısının kalitesini artıran ucuz bir adım; küçük ama sıfır değil.
- **Oturum (0-3):** 1
- **Tahta satırı:** yok
- **Link(ler):** https://www.instagram.com/reel/DYxkUorPZ-T/
- **Neye bakıldı:** adım 1: video 37 sn, döküm tamamı; adım 2: 6 kare (frames.sh); adım 3: watchall.sh ile tamamı — 38 kare, 4 sayfanın hepsi okundu (Settings → Cowork → Global Instructions, 'Allow Claude to change files' izni, about-me/writing-rules/memory dosyaları, connector dizini, skills listesi)

### What it is — the watch record (newest pass)
- **tur:** eğitim
- **ne_bu:** 37 saniyelik hızlı ekran videosu: Claude masaüstünde Settings → Cowork → Global Instructions'a bir şablon (kim olduğun, hedef kitle, odak alanları, 'benimle nasıl konuş' kuralları) yapıştırılıyor; masaüstünde bir klasör açılıp Cowork'e sürükleniyor ve Claude'dan üç dosya oluşturması isteniyor: about-me.md (iş, ürünler, kitle), writing-rules.md (Wikipedia'daki 'Signs of AI writing' sayfası araştırılarak AI kokan yazıyı önleyen kurallar) ve memory.md (her oturumdan sonra eklenen öğrenme kaydı). Sonra connector'lar (Linear, monday, Canva vb.) ve tekrarlı işler için skill'ler ekleniyor. Adım adım rehber justynai.notion.site'ta, 'Claude' yorumu karşılığında.
- **okundu:** evet — döküm ve kareler; Notion rehberinin yalnız videoda görünen kısmı okundu
- **izlendi:** adım 1: video 37 sn, döküm tamamı; adım 2: 6 kare (frames.sh); adım 3: watchall.sh ile tamamı — 38 kare, 4 sayfanın hepsi okundu (Settings → Cowork → Global Instructions, 'Allow Claude to change files' izni, about-me/writing-rules/memory dosyaları, connector dizini, skills listesi)
- **zaten_var:** Evet — CLAUDE.md, MEMORY.md, .claude/skills; yazım kuralları kısmen CLAUDE.md'deki kısalık kuralında
- **not:** Yorum-yemi videosu. 'Signs of AI writing' fikri istenirse ayrı, küçük bir iş olarak CEO'ya sorulabilir; kalıcı kural yapmak onun sözüne bağlı.


## W039 — build.nvidia.com (NVIDIA NIM API kataloğu) — ücretsiz çıkarım için API anahtarı
- Link: https://build.nvidia.com/
- His note when he sent it: take apı key

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-06-26
- **Tür:** araç
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** Ücretsiz, OpenAI uyumlu NIM ucu (kimi-k3, deepseek-v4-pro, nemotron) Hamza'nın şerit yapısına uyar. B06 kimi-3 sınavını ve B51 şerit karşılaştırmalarını ücret ödemeden koşturur. NVIDIA Build dev tier STACK.md:7'de kilitli karar (CEO notu: 'take api key'). 'Yalnız prototip/test' şartı ve 40 istek/dk sınırı bu turda yeniden doğrulanmadı (UNVERIFIED).
- **Gelir (0-3):** 1
- **Gelire katkısı:** Sınav maliyeti kadar küçük bir tasarruf; ölçülmedi. Üretim yükü bu katmana konamaz.
- **Gelir katmanı:** Maliyet düşürme
- **Nasıl para getirir (okuyucu):** Ücretsiz katman kimi-k3, deepseek-v4-pro, nemotron gibi modelleri OpenAI uyumlu uçtan bedava verir; ama NVIDIA'nın şartları onu prototip/araştırma/test ile sınırlar ve ~40 istek/dk sınırı var. Holdinge katkısı bu yüzden yalnız sınav maliyetidir: B06 kimi-3 sınavı ve B51 şerit karşılaştırmaları ücret ödemeden koşulur. Üretimdeki 214 personelin yükü bu katmana konamaz, yani kalıcı bir maliyet düşüşü değildir.
- **Rakam kanıtı:** Ana sayfa bu turda yeniden okundu: 'Free inference with leading models'. ~40 istek/dk ve 'yalnız prototip/test' şartı önceki turun okuduğu NVIDIA forum/SSS kaynağından; bu turda yeniden doğrulanmadı. Tasarruf tutarı küçük: bir sınav koşusunun API bedeli kadar (birkaç dolar mertebesi, ölçülmedi).
- **İlk para:** Elimizde: B06 sınav satırı, Hamza'nın OpenAI uyumlu şerit yapısı. Eksik: NVIDIA Developer hesabı ve anahtar. Adım: hesap açılır, anahtar kasaya konur, B06 sınavı bu uçtan koşulur. Süre 1 saat, maliyet 0. Onay: hesap açmak kimlik adımıdır — CEO.
- **Engel ve aşma:** Şartlar üretim kullanımını kapsamıyor → yalnız sınav ve karşılaştırma için kullanılır, üretime hiçbir zaman bağlanmaz. Anahtar sızıntısı → kasaya, depoya ve çıktıya asla girmez. Hizmet sürekliliği garanti değil → sınav dışında bağımlılık kurulmaz.
- **Öneri:** Dene
- **İkinci turda:** 2/Dene
- **Neden değişti:** Önceki holding_puan 2 idi. Kazanç merceğiyle: şartlar üretimi yasakladığı için kalıcı tasarruf yok; katkı yalnız birkaç dolarlık sınav maliyeti — küçük bir maliyet kalemi, 1.
- **Oturum (0-3):** 1
- **Tahta satırı:** B06, B51
- **Sizin notunuz:** take apı key
- **Link(ler):** https://build.nvidia.com/
- **Neye bakıldı:** site ana sayfası (scrapling ile okundu); oran sınırı ve kullanım şartları için web araması (NVIDIA forumu ve NIM SSS'si)

### What it is — the watch record (newest pass)
- **tur:** araç
- **ne_bu:** NVIDIA'nın model ve ajan kataloğu. Ana sayfada 'free inference' başlığı altında kimi-k3, deepseek-v4-pro-0813, nemotron-3.5-lightning-30b ve nemotron-3-ultra-550b duruyor; ayrıca 300'ü aşkın hazır 'ajan becerisi' ve NemoClaw (güvenli ajan çalıştırma) planları var. Uç noktalar OpenAI uyumlu (integrate.api.nvidia.com/v1). Ücretsiz katman NVIDIA Developer Program üyeliğiyle açılıyor, model başına değişen yaklaşık 40 istek/dk sınırlı, kredi tabanlı ve NVIDIA'nın SSS'sine göre yalnız prototip/araştırma/test içindir; üretim için ücretli NVIDIA AI Enterprise lisansı gerekir.
- **okundu:** evet — sayfa ve şartlar okundu; anahtar alınmadı (kimlik adımı)
- **izlendi:** site ana sayfası (scrapling ile okundu); oran sınırı ve kullanım şartları için web araması (NVIDIA forumu ve NIM SSS'si)
- **zaten_var:** Kimi/DeepSeek fiyatlı hatları Hamza planında var; NVIDIA anahtarı yok, repoda yalnız bir araştırma önbelleğinde geçiyor
- **not:** Notu 'take api key': NVIDIA hesabı açmak kimlik adımıdır, CEO yapar veya onaylar; anahtar depoya ve çıktılara girmez, kasaya konur. Ücretsiz katman ticari üretim kullanımını kapsamıyor — yalnız sınav/karşılaştırma için kullanılmalı. Hizmetin sürekliliği garanti edilmiyor.


## W040 — OpenDesign (nexu-io/open-design) — açık kaynak 'Claude Design' alternatifi (Oktay'ın gönderdiği)
- Link: (name only)
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-06-27
- **Tür:** repo
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** Open Design bir brief'ten prototip, açılış sayfası, pano, slayt ve MP4 üretir; HTML/PDF/PPTX olarak dışa aktarır. Kendi Claude aboneliğimizle (BYOK) yerelde, Claude Design kotası olmadan çalışır. B32 V2 tasarım paketinde ekranları çizip CEO'ya göstermenin bir aracı. Eklenti kurulu ama kapalı; açmak için tek satır sorulur. Yıldız sayısı (100.023) ile topluluk (14 üye, 2026-09-16 ölçümü) orantısız; karar kendi ölçümümüzle verilir.
- **Gelir (0-3):** 1
- **Gelire katkısı:** B28 ve B17 #8 tekliflerinde müşteri destesi ve taslak sayfa teslimatını hızlandırır. Yeni bir satış kalemi açmaz; süre kazancı ölçülmedi.
- **Gelir katmanı:** Ajans/hizmet geliri + Kabiliyet
- **Nasıl para getirir (okuyucu):** Bir brief'ten prototip, açılış sayfası, pano, slayt ve MP4 üretip HTML/PDF/PPTX olarak dışa aktarır; BYOK, yani kendi Claude aboneliğimizle ek ücretsiz çalışır. Ajans koltuğunda (B28) müşteriye sunum destesi ve taslak açılış sayfası, B17 #8 'pano/kokpit kurulumu' teklifinde görsel prototip hızlanır. Ama aynı işi bugün Claude artifact'ları ve scrollcraft da yapıyor; satılabilir yeni bir şey açmıyor, mevcut teslimatı hızlandırabilir.
- **Rakam kanıtı:** GitHub: Apache-2.0, 100.023 yıldız, son push 2026-10-08 (gh api, bu tur). Bulut sürümü 'OpenDesign Go' ilk ay 8 $ (önceki tur README). 2026-09-16 Reddit ölçümü: topluluk 14 üye — yıldızla orantısız.
- **İlk para:** Elimizde: eklenti kurulu (kapalı). Adım: ilk ajans teklifinde müşteri destesi bununla bir kez üretilir, kendi yöntemimizle süre ve kalite karşılaştırılır. Maliyet 0 (yerel, BYOK). Onay: eklentiyi açmak — 'kapatmadan/açmadan önce sor' kuralı gereği tek satır soru.
- **Engel ve aşma:** Yıldız şişkinliği şüphesi → karar kendi ölçümümüzle verilir, yıldızla değil. README DeepSeek Harness reklamıyla açılıyor → yalnız yerel BYOK kullanılır, bulut sürümüne para çıkmaz. Şablon görünümü → CEO'nun minimalizm hükmü ve dxb-surface ile denetlenir.
- **Öneri:** Dene
- **İkinci turda:** 1/Gerek yok
- **Neden değişti:** Satır yalnız ajans teslimatına baktı. Teknoloji tarafı gözden kaçmıştı: kotasız, yerel BYOK tasarım aracı olarak B32 V2 ekran paketine hizmet ediyor. CEO'nun W025'teki notu da 'bedava laptopa indir'; bu yüzden 2. · Önceki öneri 'Gerek yok' idi. Kurulu ve ücretsiz olduğu için ilk ajans teklifinde bir kez denemek, müşteriye giden deste/prototip hızını ölçmenin bedava yolu.
- **Oturum (0-3):** 1
- **Tahta satırı:** B32 (V2 tasarım paketi)
- **Link(ler):** (name only)
- **Neye bakıldı:** GitHub repo meta verisi ve README (ilk 80 anlamlı satır); depodaki önceki araştırma (Reddit topluluk ölçümü, INTEGRATION-TRACKER satırı) ve installed.txt

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** Bağlantısız, yalnız adla gelen öğe; GitHub'da bulundu. Apache-2.0, ~100 bin yıldız, bugün güncellenmiş bir yerel masaüstü 'tasarım ajanı çalışma alanı': bir brief'ten başlayıp kodlama ajanı (Claude Code, Codex, Cursor, DeepSeek Harness vb.) ile tasarım sistemine uyan prototip, slayt, görsel ve HyperFrames hareketli grafik üretiyor; HTML/PDF/PPTX/MP4 dışa aktarıyor. Claude Code'a 'od mcp install claude' ile MCP olarak bağlanıyor. Bir de ücretli bulut sürümü (OpenDesign Go, ilk ay 8 $) var.
- **okundu:** evet — repo ve README okundu; masaüstü uygulaması bu turda çalıştırılmadı
- **izlendi:** GitHub repo meta verisi ve README (ilk 80 anlamlı satır); depodaki önceki araştırma (Reddit topluluk ölçümü, INTEGRATION-TRACKER satırı) ve installed.txt
- **zaten_var:** Evet — open-design@open-design eklentisi kullanıcı kapsamında kurulu (sürüm 1.0.0); .planning/research/study-cards/design-bundle.md ve 2026-09-16-reddit-claude-design-vs-open-design.md mevcut
- **not:** Zaten kurulu olduğu için yeni iş yok; kullanılacaksa B32 tasarım işinde design-bundle çalışma kartı üzerinden. Bulut sürümü ücretli (para çıkışı CEO onayı). README'nin başı DeepSeek Harness reklamıyla açılıyor; 100 bin yıldız ile 14 üyeli topluluk arasındaki uçurum yıldızların şişirilmiş olabileceğine işaret ediyor.


## W041 — free-claude-code — Claude Code/Codex ve 9 başka harness'i ücretsiz/Çin modelleriyle çalıştıran yerel vekil
- Link: https://github.com/Alishahryar1/free-claude-code
- His note when he sent it: repo: kur. arayüz. çinli modelelri otomatik claude code içinde çalıştır.

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-06-28
- **Tür:** repo
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** Vekil, Claude Code dahil 10 harness'i NIM, OpenRouter ücretsiz katmanları, Groq ve yerel modeller gibi 59 sağlayıcıya bağlar (CEO notu: 'kur, arayüz, Çinli modelleri otomatik Claude Code içinde çalıştır'). İnşaat oturumlarının alt işlerini kimi ve deepseek gibi modellerde koşturmak, B06 ve B34 için gerçek bir kabiliyet. Çelişki var: STACK.md:123 'free-tier-stacking routers' türünü kilitli kararla dışlıyor (ToS). Lisans NOASSERTION, README rozeti AGPL-3.0; kurulum curl|sh ile. Hüküm CEO'nundur. Kazancı esas olarak inşaat oturumlarına; bu, oturum puanında sayılır.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Mekanik işlerin token maliyetini düşürür. Ücretsiz katman şartları üretimi sınırladığı için tasarruf küçük ve kırılgan; ölçülmedi.
- **Gelir katmanı:** Maliyet düşürme
- **Nasıl para getirir (okuyucu):** Vekil, ajan harness'lerini NVIDIA NIM, OpenRouter ücretsiz katmanları, Groq ve yerel modeller gibi 59 sağlayıcıya bağlıyor ('1.3B+ ücretsiz token'). Holding için olası kazanç, mekanik işlerin (etiket, özet, çeviri taslağı) token maliyetini sıfıra çekmek. Ama ücretsiz katmanların çoğu üretim kullanımını yasaklıyor ya da sınırlıyor ve Hamza zaten kendi yönlendiricisine ve ücretli ucuz şeritlere (deepseek-flash, 1M çıkış 0,6 $) sahip; yani gerçek tasarruf küçük ve kırılgan.
- **Rakam kanıtı:** GitHub açıklaması: '1.3B+ free tokens', 'ToS friendly' — iddia; 56.970 yıldız, lisans NOASSERTION (README rozeti AGPL-3.0), son push 2026-10-08 (gh api, bu tur).
- **İlk para:** Elimizde: Hamza şeritleri, B34 yerel işçi model. Eksik: ücretsiz katman hesapları (kimlik adımı). Kısa yol: kurulmaz; yalnız fikir — ücretsiz uçlar sınav için W039 üzerinden. Maliyet 0.
- **Engel ve aşma:** Ücretsiz katman şartları üretimi kapsamıyor → yalnız test. AGPL ve curl|sh yükleyici → B41 gümrük taraması olmadan kurulmaz. STACK.md 'ücretsiz katman yığan yönlendirici yok' → Hamza'nın kendi şeridi kullanılır.
- **Öneri:** İzle
- **İkinci turda:** 1/İzle
- **Oturum (0-3):** 1
- **Tahta satırı:** B41, B34
- **Sizin notunuz:** repo: kur. arayüz. çinli modelelri otomatik claude code içinde çalıştır.
- **Link(ler):** https://github.com/Alishahryar1/free-claude-code
- **Neye bakıldı:** gh api repos/Alishahryar1/free-claude-code (açıklama, yıldız, lisans, push); README önceki turda okunmuştu, bu turda yeniden okunmadı.

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** 56k yıldızlı Python deposu (README rozeti AGPL-3.0, GitHub lisansı NOASSERTION gösteriyor): yerel bir vekil Claude Code, Codex, OpenCode, Cline vb. 11 ajanı 59 sağlayıcıya (NVIDIA NIM, OpenRouter, Groq, yerel modeller) bağlıyor; yönetim arayüzü, sağlayıcı kesintisinde yedek model zinciri, isteğe bağlı RTK ile komut çıktısı token kısaltma, Telegram/Discord/ses. Kurulum curl|sh ile.
- **okundu:** evet — README'nin ilk 220 satırı ve depo bilgisi
- **zaten_var:** Çalışma kartı yalnız taslak (STUB, 'OpenRouter'a işçi model yönlendirme alternatifi'); STACK.md 'ücretsiz katman yığan yönlendiriciler' ToS gerekçesiyle dışlamış.
- **not:** Notundaki 'kur, arayüz, Çin modellerini otomatik Claude Code'da çalıştır' README'yle uyumlu. Kurmadan önce müşteri tarama (B41) ve STACK.md okuması şart; AGPL ve curl|sh yükleyici dikkat. 'Ücretsiz tokenlar' sağlayıcıların koşullarına bağlı, kalıcı değil.


## W042 — 21st.dev (React bileşen kütüphanesi) + Framer Motion (motion kütüphanesi)
- Link: https://21st.dev/
- His note when he sent it: framer motion ekle +21st.dev

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-06-29
- **Tür:** araç
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** motion (MIT, ücretsiz) V2'nin birinci kanunu 'canlı olmalı, hareket durumdur'u React yüzeylerinde uygulayan araç; bugün depoda yok (CEO notu: 'framer motion ekle'). Önce STACK.md'ye ve B32 tasarım paketine girer. 21st.dev bileşenleri yüzey işini hızlandırabilir. Yıldız sayısı ve fiyat önceki turdan; bu turda yeniden okunmadı.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Makinenin canlı yüzü, sponsorları getiren 'ilk dijital OS-kernel holding' vitrinini güçlendirir. 21st'in ücretsiz bileşenleri müşteri sitesi teslimini hızlandırır. Dolaylı katkı; ücretli plan para çıkışıdır (CEO).
- **Gelir katmanı:** Kabiliyet (makinenin teknolojik ilerlemesi) + OS'in kendisi + Ajans/hizmet geliri
- **Nasıl para getirir (okuyucu):** motion (MIT, ücretsiz), V2'nin birinci kanununun — 'CANLI OLMALI, hareket durumdur, bir değer doğru olana kadar hareket eder ve durur' — React yüzeylerindeki doğru aracı; bugün depoda yok. Makinenin yüzünü Ferrari çıtasına taşımak hem teknolojik ilerleme hem holdingin vitrini (sponsorların geldiği 'ilk dijital OS-kernel holding' duruşu). 21st.dev bileşenleri müşteri sitelerinin teslimini hızlandırır; küçük ek.
- **Rakam kanıtı:** motion: MIT, 33.875 yıldız (önceki tur gh api). 21st.dev: 5 ücretsiz Design Bug Bot incelemesi, tam erişim ücretli planlarda (önceki tur fiyat sayfası); bu turda yeniden okunmadı.
- **İlk para:** Elimizde: Next/React/Tailwind yığını. Eksik: motion bağımlılığı. Adım: B32 V2 tasarım paketinde motion değerlendirilir; müşteri sitesi işi gelirse 21st'in ücretsiz bileşenleri denenir. Maliyet 0; 21st ücretli planı para çıkışı — CEO.
- **Engel ve aşma:** Şablon görünümü → minimalizm hükmü ve dxb-surface ile süzülür. Döngüsel süs animasyonu → 'yalnız gerçek değer değişince hareket' kuralı. Paket eklemek → önce STACK.md.
- **Öneri:** Araştır
- **İkinci turda:** 1/Araştır
- **Neden değişti:** Önceki holding_puan 1 idi. CEO'nun düzeltmesiyle makinenin canlılık katmanını sağlayan gerçek bir teknik ilerleme kendi başına puan alır; B32 tasarım paketinde değerlendirme ve ilk deneme gerektirdiği için 2.
- **Oturum (0-3):** 2
- **Tahta satırı:** B32 (V2 tasarım paketi), B10 (canlı organizma görünümü)
- **Sizin notunuz:** framer motion ekle +21st.dev
- **Link(ler):** https://21st.dev/
- **Neye bakıldı:** video yok; 21st.dev ana sayfası ve fiyat sayfası fetch.py ile okundu; motion reposunun metaverisi; repodaki package.json dosyalarında motion/framer-motion arandı

### What it is — the watch record (newest pass)
- **tur:** araç
- **ne_bu:** 21st.dev, 12.000'den fazla React bileşeni, şablon ve shadcn teması sunan bir kütüphane ve pazar. Bileşen kodu MCP üzerinden çekilebiliyor, yapay zekâyla bileşen üretilebiliyor ve PR'lardaki tasarım hatalarını inceleyen bir 'Design Bug Bot' var (5 inceleme ücretsiz). Tam erişim Builder/Team planlarında, aylık kredi ise Builder + AI planında. Framer Motion'ın bugünkü adı 'motion' (motiondivision/motion): React ve JS için animasyon kütüphanesi, MIT, 33.875 yıldız, son push 2026-10-08.
- **okundu:** evet — iki sayfa ve repo okundu
- **izlendi:** video yok; 21st.dev ana sayfası ve fiyat sayfası fetch.py ile okundu; motion reposunun metaverisi; repodaki package.json dosyalarında motion/framer-motion arandı
- **zaten_var:** Hayır. Depoda motion/framer-motion bağımlılığı yok. 21st MCP kurulu değil. ui-ux-pro-max eklentisi kurulu ama kapalı.
- **not:** CEO'nun notu 'framer motion ekle +21st.dev'. Cevap: motion, V2 yüzeylerinin hareket katmanı için B32 tasarım paketinde değerlendirilmeli; CEO'nun ekranına dokunduğu için dxb-surface kapısından geçer. 21st'in ücretli planı para çıkışıdır, CEO onayı ister. 'Boş yere döngü yok' ilkesi animasyonun yalnız gerçek durum değişiminde oynamasını gerektirir. W017 ile aynı konu.


## W043 — OmniSocials — 11 platforma tek API/MCP ile yayın, takvim, birleşik gelen kutusu ve analitik (CEO notu: 'omnisocials.com gibi bir departman')
- Link: https://omnisocials.com/
- His note when he sent it: omnisocials.com gibi bir departman

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-07-02
- **Tür:** araç
- **Holding (0-3):** 3
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** Ajanlara ve sosyal medya departmanının 13 personasına MCP/REST ile 11 platforma takvimli yayın, birleşik gelen kutusu ve analitik eli verir; kanal hattının yayın halkası budur. Lider notuna göre (D1) önce açık kaynak Postiz kendi sunucumuzda 0 $ ile denenir.
- **Gelir (0-3):** 3
- **Gelire katkısı:** Yayın eli olmadan kanal hattı para üretemez. Ajans tarafında müşteri başına bir çalışma alanı ayda 10-12 $ tutar ve aylık sosyal medya yönetimi hizmeti olarak satılır (B28, B17 #2). Fiyat omnisocials.com/pricing sayfasından okundu.
- **Gelir katmanı:** Kabiliyet + Ajans/hizmet geliri + İçerik geliri
- **Nasıl para getirir (okuyucu):** KANAL HATTI'nın ve sosyal medya departmanının yayın elleri: üretilen her video YouTube, Instagram, TikTok, X, Threads, Pinterest, LinkedIn, Facebook, Bluesky, Mastodon, Google Business'a ajanlar tarafından (MCP/REST) takvimle gider; yayın eli olmadan kanal hattı para üretemez. Ajans tarafında müşteri başına bir çalışma alanı = ayda 10-12 $ maliyet; müşteriye 'sosyal medya yönetimi' aylık hizmet olarak satılır (B28, B17 #2). CEO'nun sorusunun cevabı: departman yazılı (13 persona), eksik olan bu eller.
- **Rakam kanıtı:** Resmî fiyat sayfası (https://omnisocials.com/pricing, bugün okundu): tek plan, koltuk/çalışma alanı başına yıllıkta 10 $/ay, aylıkta 12 $/ay; 14 gün ücretsiz deneme; API, SDK, CLI, MCP sunucusu ve webhook her planda; kanal başına ücret yok; X'te bağlantılı gönderi 0,20 $. Departman: personas/social-media/ 13 persona (önceki geçişte depoda doğrulandı).
- **İlk para:** Elimizde: 13 persona, üretim bandı (W012, W068 hattı). Eksik: hesap + platform OAuth bağlantıları (kimlik adımı — CEO), MCP'nin outbox/onay zincirine bağlanması. Adımlar: 14 günlük denemeyle holdingin ilk kanalını bağla, ilk haftanın yayınlarını takvimle; açık kaynak Postiz (kendi sunucumuzda, 0 $) ile yan yana tart. Süre 1-2 gün; deneme 0 $, sonra 10-12 $/ay (para çıkışı, CEO); onay: hesap ve OAuth.
- **Engel ve aşma:** (1) Üçüncü taraf hesap anahtarlarını tutar → çalışma alanı başına ayrı yetki, gerektiğinde iptal; ya da Postiz kendi sunucumuzda. (2) Dışa dönük yayın → departmanın onay zinciri (direktif §3.5) korunur. (3) Abonelik para çıkışı → 14 gün ücretsiz deneme sonra CEO kararı.
- **Öneri:** Dene
- **İkinci turda:** 2/Dene
- **Neden değişti:** Puan 2'den 3'e: kanal hattının gelir üretebilmesi için şimdi gereken yayın eli; 14 gün ücretsiz denemeyle elimizdekilere yalnız bir hesap/onay adımı ekleyerek başlanıyor.
- **Lider notu:** Yayın eli şart. Ücretsiz-önce kuralı (D1) gereği önce açık kaynak Postiz kendi sunucumuzda (0 $) denenir; OmniSocials (ayda 10–12 $, 14 gün ücretsiz deneme) yan yana tartılır, ücretli olan ancak sizin onayınızla.
- **Oturum (0-3):** 0
- **Tahta satırı:** B43 (medya stüdyosu) / sosyal medya departmanı
- **Sizin notunuz:** omnisocials.com gibi bir departman
- **Link(ler):** https://omnisocials.com/
- **Neye bakıldı:** Ana sayfa, fiyat sayfası, docs Quickstart ve MCP sayfası (scrapling ile canlı okundu); depoda direktif ve persona klasörü salt-okur kontrol edildi

### What it is — the watch record (newest pass)
- **tur:** araç
- **ne_bu:** Tek planlı (çalışma alanı başına ayda 10 $, 14 gün deneme) sosyal medya yönetim ürünü: 11 platform/12 kanal (Facebook, Instagram, LinkedIn kişi+sayfa, TikTok, YouTube, X, Threads, Pinterest, Bluesky, Mastodon, Google Business) için insanlara görsel takvim, onay akışı, birleşik gelen kutusu, analitik; ajanlara REST API, webhook ve MCP sunucusu (uzak uç nokta https://mcp.omnisocials.com ve npm paketi @omnisocials/mcp-server; Claude Code dahil). Hesap bağlama yalnız panelden OAuth ile yapılıyor, API'den yapılamıyor.
- **okundu:** evet — site, fiyat ve dokümanlar okundu
- **izlendi:** Ana sayfa, fiyat sayfası, docs Quickstart ve MCP sayfası (scrapling ile canlı okundu); depoda direktif ve persona klasörü salt-okur kontrol edildi
- **zaten_var:** Departman tasarımı ve 13 persona var (personas/social-media/, direktif 00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT.md, roadmap E5.6); gerçek yayın entegrasyonu yok.
- **not:** Ücretli abonelik (para çıkışı) ve hesap bağlama OAuth'u kimlik adımıdır — ikisi de CEO onay kapısında durur. Yayınlama dışa dönük eylem; direktif §3.5'e göre onay zincirine bağlı kalmalı. Üçüncü taraf hesap anahtarlarını tutar — veri/erişim riski. Rakip olarak ücretsiz açık kaynak Postiz (kendi sunucunda) da tartılmalı. 'Sizin notunuz' cevabı: departman var, eksik olan yalnız gerçek platform bağlantısı.


## W044 — Scroll World skill'i (oso95/scroll-world ve cth9191 çatalı) — Higgsfield ile kaydırmalı 3B 'dünya' açılış sayfası
- Link: https://share.google/mrqjuijd78vJikzIy
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-07-12
- **Tür:** repo
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** Mekanik scrollcraft olarak zaten kurulu. Yeni teknik katkı, çataldaki SSIM dikiş denetiminin scrollcraft'a eklenmesi ve sahnelerin yerel kartta MiniMax H3 ile üretilmesi; küçük bir ilerleme.
- **Gelir (0-3):** 2
- **Gelire katkısı:** Markaya kaydırmalı 3B premium açılış sayfası proje başına satılır. Ölçülen piyasa tek sayfada 1.500-3.500 $, çok sahnelide 3.500-8.000 $. Video maliyeti yerel kartla 0 $ olduğu için ilk vitrin sitesi B28 teklifine eklenir.
- **Gelir katmanı:** Ajans/hizmet geliri + Kabiliyet
- **Nasıl para getirir (okuyucu):** Markaya kaydırınca içinde uçulan çok sahneli 'premium' açılış sayfası satılır: müşteri (otel, seyahat, gıda, emlak markası) bize proje başına öder. Serbest çalışan piyasasında tek sayfalık 3B açılış sayfası 1.500-3.500 $, çok sahneli 3B site 3.500-8.000 $, Upwork'te kaydırma animasyonu paketi 2.300-4.000 $. Mekanik bizde scrollcraft olarak zaten kurulu (scroll-world'den alındı); videoda tek seferde 4 sahne / 10 üretim / 32 dakika — işçilik neredeyse sıfır, maliyet üretim kredisi. Video sahnelerini yerel kartta MiniMax H3 ile 0 $'a üretirsek brüt kâr neredeyse fiyatın tamamı.
- **Rakam kanıtı:** Ölçülen piyasa (satıcı sayfaları, yön gösterici): tek sayfa 3B açılış 1.500-3.500 $, çok sahneli 3.500-8.000 $ — https://www.svilenkovic.com/3d/scroll-driven-3d-website ; Upwork kaydırma animasyonu paketi 2.300 $ / 4.000 $ — https://www.upwork.com/services/product/design-smooth-engaging-scroll-animations-for-a-dynamic-website-experience-1893739643453181400 ; Dribbble Framer 3D scroll sitesi 2.000 $ — https://dribbble.com/services/238229-Website-Design-Development-in-Framer . Maliyet: 6 sahne ~800 Higgsfield kredisi, 4 sahne / 10 üretim / 32 dk (videoda, yaratıcının kendi koşusu — iddia ama ekranda). Bizim yerel video: 15 sn çekim ~10 dk, 0 $ (B43 ölçümü).
- **İlk para:** Elimizde: scrollcraft skill'i (kurulu), yerel video motoru (MiniMax H3, 0 $), ücretsiz görsel eli, B28 ajans koltuğu. Eksik: vitrin örneği ve ilk müşteri. Adımlar: 1) DXB'nin kendisi ya da helal bir pilot marka (ör. Outleteuro) için 3-4 sahnelik bir vitrin sitesi, sahneler yerel kartta (1-2 gün, 0 $); 2) bu vitrinle B28 ajans teklifine 'premium açılış sayfası' kalemi eklenir ya da bir serbest çalışan pazarında hizmet ilanı açılır; 3) ilk iş 1.500-2.500 $ bandında. Onay: pazar hesabı açmak kimlik adımı; kie.ai/Higgsfield kredisi kullanılırsa para çıkışı — ikisi de CEO.
- **Engel ve aşma:** Üretim kredisi maliyeti → sahneler yerel kartta üretilir; yalnız müşteri farklı model isterse kredi, fiyata eklenerek. Sahne geçişlerinde sert kesme (videoda yaratıcının kendi şikâyeti) → çataldaki SSIM dikiş denetimi scrollcraft'a eklenir. Ağır sayfa / zayıf telefon → scrollcraft'ın Düşük Güç Modu yedeği ve 9:16 zinciri. İşlevsellik (form, CTA) → standart web işi, sorun değil. Sahte portföy riski → vitrin örneği kendi markamız için yapılır, müşteri işi gibi sunulmaz.
- **İslami sınır:** Sahnelerde kadın tasviri ve enstrümantal müzik stüdyo kurallarına tabi; kendi vitrinimizde kadın yok, müşteri isterse olur.
- **Öneri:** Dene
- **İkinci turda:** 2/Gerek yok
- **Neden değişti:** Önceki öneri 'Gerek yok' idi (mekanik bizde var diye). Mekaniğin bizde olması tam da satışa hazır olduğumuz anlamına geliyor; piyasa fiyatı ölçüldü (1.500-8.000 $) ve video maliyeti yerel kartla sıfıra iniyor — ilk vitrin sitesini yapıp satmak gerekiyor.
- **Oturum (0-3):** 1
- **Tahta satırı:** B40 (kapalı), B28 (ajans koltuğu)
- **Link(ler):** https://share.google/mrqjuijd78vJikzIy
- **Neye bakıldı:** 1) YouTube videosu (share.google → youtube.com/watch?v=KBH8P0z2AL8), 589 sn, Speaches dökümünün tamamı; 2-3) kare ve watchall YAPILAMADI: video indirilemedi (yt-dlp 'Sign in to confirm you're not a bot', tv/web_safari/android/mweb istemcileri de denendi). Ek olarak iki deponun açıklaması ve README'si, scrollcraft CHANGELOG/kaynak karşılaştırması okundu.

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** 9 dk 49 sn'lik YouTube videosu (Chase AI): Peter Wang'ın açık kaynak scroll-world skill'ini (oso95/scroll-world, 9.8k yıldız, MIT) ve kendi çatalını (cth9191/scroll-world, 551 yıldız, MIT) tanıtıyor. Yöntem: tek bir çapa görsel → Seedance ile görselden video → ffmpeg ile kareler → kaydırma konumuna bağlı oynatma; sahneler arası bağlayıcı klipler. Görsel ve videolar Higgsfield MCP/CLI üzerinden (GPT Image 2, Seedance) üretiliyor. Çatalın eklediği: bütçe kademeleri ve harcama onayı (yalın ~8, standart 11-14, vitrin 17+ üretim), ön-taslak geçişi, SSIM ile dikiş denetimi, iOS Düşük Güç Modu yedeği, 9:16 mobil zincir, taranabilir SEO metni. Demo: Japon seyahat markası için 4 sahne, 10 üretim, 32 dakikada tek seferde; 6 sahnelik örnek yaklaşık 800 Higgsfield kredisi tuttu. Yaratıcıya göre sahne geçişlerinde Fable 5, GPT 5.6 Sol'dan daha iyi.
- **okundu:** kısmen — döküm ve depolar okundu; ekran demosunun kareleri YouTube bot engeli yüzünden görülemedi
- **izlendi:** 1) YouTube videosu (share.google → youtube.com/watch?v=KBH8P0z2AL8), 589 sn, Speaches dökümünün tamamı; 2-3) kare ve watchall YAPILAMADI: video indirilemedi (yt-dlp 'Sign in to confirm you're not a bot', tv/web_safari/android/mweb istemcileri de denendi). Ek olarak iki deponun açıklaması ve README'si, scrollcraft CHANGELOG/kaynak karşılaştırması okundu.
- **zaten_var:** Evet — scrollcraft global skill (worldflight modu scroll-world'den alındı; Düşük Güç Modu ve kie.ai kredi/maliyet kuralları var); B40 kapalı ve kabul edildi.
- **not:** Maliyet: Higgsfield kredili ücretli (6 sahne ~800 kredi); scrollcraft kie.ai kullanıyor. Higgsfield hesabı kimlik adımı ister. Videonun watchall adımı bot engeli kalkınca tekrar denenmeli (ör. sonradan yt-dlp çerezli indirme, CEO onayıyla).


## W045 — bepitulaz/obsidian-multivault-mcp — çok kasa, çok kullanıcılı Obsidian MCP sunucusu
- Link: https://share.google/PQvozIJ7yXEvOQqin
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-07-13
- **Tür:** repo
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 0
- **Teknolojiye katkısı:** Holdingin kendi hafızası için gerekmez; claude-mem ve graphify bu işi görüyor. 62 yıldızlı, 2026-07-07'den beri güncellenmemiş genç bir MCP sunucusu.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Yalnız B17 #9 'ikinci beyin' kurulum hizmeti satılırsa aday bir bileşen olur. Hizmet tanımlanmadı, fiyatı ölçülmedi.
- **Gelir katmanı:** Ajans/hizmet geliri (B17 #9 şirket 'ikinci beyin' kurulumu)
- **Nasıl para getirir (okuyucu):** Holdingin kendi hafızası için gerekmez. Tek para açısı B17 #9: müşteri şirkete 'ikinci beyin' kurup bakımını üstlenmek — çalışanların Obsidian kasalarını tek sunucuda, OAuth 2.1 ve yol güvenliğiyle bir AI asistana açmak. Bu sunucu böyle bir kurulumun hazır bir parçası olabilir; ama 62 yıldızlı genç bir proje, hizmetin kendisi daha tanımlanmadı.
- **Rakam kanıtı:** GitHub: 62 yıldız, MIT, son push 2026-07-07 (gh api, bu tur). Hizmet fiyatı ölçülmedi — B17 #9 sunulduğunda ölçülmeli.
- **İlk para:** Elimizde: B17 #9 fikri, persona fabrikası. Eksik: hizmet tanımı, müşteri, sunucu. Bu repo ilk parayı doğurmaz; #9 satılırsa aday bileşenlerden biri. Maliyet 0.
- **Engel ve aşma:** Küçük, genç ve 3 aydır güncellenmeyen proje → müşteri kurulumunda kullanılacaksa önce güvenlik taraması (B41 gümrük). Müşteri verisi sunucuda → sözleşmeyle ve müşterinin kendi sunucusunda kurulur.
- **Öneri:** İzle
- **İkinci turda:** 0/Gerek yok
- **Neden değişti:** Önceki 0 / Gerek yok idi; B17 #9 'ikinci beyin kurulumu' satışında aday bir parça olduğu için 1 / İzle.
- **Oturum (0-3):** 0
- **Link(ler):** https://share.google/PQvozIJ7yXEvOQqin
- **Neye bakıldı:** gh api repos/bepitulaz/obsidian-multivault-mcp (açıklama, yıldız, lisans, push).

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** MIT lisanslı, 62 yıldızlı küçük MCP sunucusu: VPS üzerindeki birden çok Obsidian kasasına çok kullanıcılı okuma/yazma, OAuth 2.1, yol güvenliği; Claude Desktop ve ssh stdio ile.
- **okundu:** evet — depo bilgisi ve README
- **zaten_var:** Obsidian eklentisi (kapalı); claude-mem MCP.
- **not:** Genç ve küçük proje; Hermes'li VPS düzenine göre yazılmış.


## W046 — codebase-memory-mcp (DeusData) — kod tabanını kalıcı bilgi grafiğine çeviren MCP sunucusu (Türkçe tanıtım reeli)
- Link: https://www.instagram.com/reel/DaqFZGMIw_N/
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-07-14
- **Tür:** repo
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** Kod tabanını kalıcı bilgi grafiğine çevirir. Değişiklik etki analizi (kim bunu çağırıyor, bu düzeltme neyi bozar) inşaat oturumlarına ve ileride mühendislik personeline gelir; 'düzeltme etrafını bozmamalı' kanununu ölçülebilir kılar. Yapımcının '%99 daha az token' sözü iddia, bizim depoda ölçülmedi; graphify ile aynı 5 soruda yan yana ölçüm gerekir. Kazancı esas olarak inşaat oturumlarına; bu, oturum puanında sayılır.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Doğrudan gelir yok. Token tasarrufu iddiası (~412.000'e karşı ~3.400 token) ölçülürse maliyet düşer ve makinenin yapım hızı artar; dolaylı.
- **Gelir katmanı:** Kabiliyet (makinenin teknolojik ilerlemesi) + Maliyet düşürme
- **Nasıl para getirir (okuyucu):** Makinenin kendisini ilerletir: değişiklik etki analizi (kim bunu çağırıyor, bu düzeltme neyi bozar) grafikten sorgulanır; inşaat oturumları ve ileride holdingin mühendislik personeli daha hızlı, daha az token harcayarak ve 'bir yeri düzelttim öbürü bozuldu' hatası olmadan çalışır. Bu, 'düzeltme etrafını bozmamalı' kanununu ölçülebilir hâle getiren teknik bir ilerleme; para doğrudan gelmez, makinenin büyüme hızını ve kalitesini — dolayısıyla bütün gelir yollarını — artırır.
- **Rakam kanıtı:** README: 5 yapısal soru ~3.400 token'a karşı dosya dosya ~412.000 token ('%99 daha az' — yapımcının kendi ölçümü, iddia); 46.154 yıldız, MIT, son push 2026-10-07 (gh api, bu tur). Bizim depoda ölçülmedi.
- **İlk para:** Elimizde: graphify ve .planning/graphs; çalışma kartı (STUDY). Eksik: yan yana ölçüm. Adım: --skip-config ile ikili kurulur, sha256 kontrol edilir, graphify ile aynı 5 soruda token/süre/doğruluk karşılaştırılır. Süre yarım gün, maliyet 0. Onay: kalıcı kurulum onun sözüyle.
- **Engel ve aşma:** Kurulum betiği 45 istemci yapılandırmasına yazar → --skip-config, MCP elle eklenir. İki grafik aracı çift bakım → ölçümden sonra biri kalır. '%99' yalnız yapısal sorularda → kendi ölçümümüz karar verir.
- **Öneri:** Dene
- **İkinci turda:** 1/Dene
- **Neden değişti:** Okuyucu 2 vermişti; aynı aletin iki satırı tek puanda birleştirildi — inşaat aleti, holdinge katkısı dolaylı.
- **Lider notu:** W081 ile aynı alet (codebase-memory-mcp); iki okuyucu farklı puan vermişti (2 ve 1), birleştirdim. İnşaat aleti: makinenin yapımını hızlandırır, değeri oturum puanında (3). Graphify ile aynı 5 soruda tek bir yan yana ölçüm.
- **Oturum (0-3):** 3
- **Tahta satırı:** B42 (cephanelik izleme)
- **Link(ler):** https://www.instagram.com/reel/DaqFZGMIw_N/
- **Neye bakıldı:** üç adım da yapıldı: 1) döküm tamamı (163 sn); 2) 5 anahtar kare; 3) watchall.sh ile videonun tamamı — 163 kare, 14 sayfanın hepsi okundu; ayrıca depo README ve GitHub metası, repo içi çalışma kartı

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** Türkçe video (2 dk 43 sn): değişikliğin projede nereleri etkilediğini her seferinde modele taratmanın çok token yaktığını (özellikle Fable 5'te) anlatıp çözüm olarak DeusData/codebase-memory-mcp'yi gösteriyor. Ekranda: GitHub sayfası, README'deki tek satırlık kurulum, Claude Code'da 'Index this project' yazılınca kurulumun MCP sunucusunu ekleyip projeyi indekslemesi, localhost:9749'daki 3B grafik arayüzü (2 proje, 2.070 düğüm, 4.154 kenar), bir dosyaya tıklayınca bağlı olduğu dosyaların görünmesi. Depo gerçek: MIT, 46,1k yıldız, son itme 2026-10-07, tek statik C ikilisi, 162 dil, 17 MCP aracı (çağrı yolu, etki analizi, ölü kod, Cypher sorgusu), README'ye göre 5 yapısal soru ~3.400 token'a karşı dosya dosya arama ~412.000 token; arXiv 2603.27277 ön-baskısı var.
- **okundu:** evet — döküm, tüm kareler, README
- **izlendi:** üç adım da yapıldı: 1) döküm tamamı (163 sn); 2) 5 anahtar kare; 3) watchall.sh ile videonun tamamı — 163 kare, 14 sayfanın hepsi okundu; ayrıca depo README ve GitHub metası, repo içi çalışma kartı
- **zaten_var:** study-cards/codebase-memory-mcp.md (STUDY, 2026-07-17): ADOPT kararı 'graphify ile çakışma ölçümüne' bağlı, ölçüm hiç yapılmadı; graphify skill'i ve .planning/graphs kurulu; INTEGRATION-TRACKER satırı STUDY
- **not:** Kurulum betiği ajan yapılandırma dosyalarına (45 istemci yüzeyi) yazıyor — '--skip-config' ile yalnız ikili kurulup MCP elle eklenmeli; ikili sürümün sha256'sı kontrol edilmeli (kartın şartı). İki grafik aracını birden tutmak çift bakım demek: ölçümden sonra biri kazanır. '%99 daha az token' yapısal sorular içindir, her iş için değil. Maliyet yok, yerel, veri dışarı çıkmıyor.


## W048 — Colibri (JustVugg/colibri) — dev MoE modelleri uzmanları diskten akıtarak yerelde çalıştıran C motoru
- Link: https://www.instagram.com/reel/Davicp5yi42/ ; https://share.google/24jrW8zu6sAldOhp7
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-07-15
- **Tür:** repo
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** Küçük MoE modeller için B34 yerel işçi modele alternatif bir motor. README'ye göre Qwen3.6-35B-A3B CUDA'da ~30 tok/s; dev modeller kullanılamaz (GLM-5.2, 25 GB RAM'de 0,05-0,1 tok/s). Bizim kartta ölçülmedi.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Etiket, özet ve çeviri taslağının API faturasını sıfırlayabilir; bu işler zaten ucuz olduğu için tasarruf küçük.
- **Gelir katmanı:** Maliyet düşürme
- **Nasıl para getirir (okuyucu):** Reelin vaadi 'sıfır token faturası': 744B GLM-5.2'yi dizüstünde çalıştırmak. README'nin kendi ölçümüne göre bu 25 GB RAM'de saniyede 0,05-0,1 token, yani üretimde kullanılamaz. Gerçek tasarruf küçük MoE modellerde: Qwen3.6-35B-A3B CUDA'da ~30 tok/s — B34 yerel işçi modelin (etiket, özet, çeviri taslağı) alternatif motoru olur ve o işlerin API faturasını sıfırlar. Ama bu işler zaten ucuz (deepseek-flash 1M çıkış 0,6 $) ve B34 hattı Gemma/Qwen ile kurulu; ek kazanç küçük.
- **Rakam kanıtı:** README ölçümleri (önceki tur okudu): GLM-5.2 25 GB RAM'de 0,05-0,1 tok/s, 128 GB'da 1,83 tok/s; Qwen3.6-35B-A3B CPU 6, CUDA 30 tok/s. GLM-5.2 int4 diskte 370 GB (reel). 40.520 yıldız, Apache-2.0, son push 2026-10-08 (gh api, bu tur).
- **İlk para:** Elimizde: RTX 5060 Ti 16 GB, B34 yerel işçi model hattı. Adım: yalnız küçük MoE ile B33 tezgâh kuralına uygun tek bir hız/kalite ölçümü; mevcut motordan iyiyse geçilir. Maliyet 0.
- **Engel ve aşma:** Büyük modeller kullanılamaz derecede yavaş → yalnız küçük MoE. GPU tezgâhı tek kapı bekçisine bağlı (B33) → ölçüm kuyruğa girer.
- **Öneri:** İzle
- **İkinci turda:** 1/İzle
- **Neden değişti:** B34 yerel işçi hattı Gemma/Qwen ile kurulu; Colibri aynı küçük modellere alternatif bir motor, kazancı ölçülmemiş ve küçük. B33 tezgâh kuyruğu CEO'nun sırasına bağlı ve kıt; 'Araştır' tahtada zamanlamayacağımız bir ölçüm sözü verir. B34 ikinci motor istediğinde ölçülür — o güne kadar İzle.
- **Oturum (0-3):** 0
- **Tahta satırı:** B34 (yerel işçi model), B33 (tezgâh doktrini)
- **Link(ler):** https://www.instagram.com/reel/Davicp5yi42/ ; https://share.google/24jrW8zu6sAldOhp7
- **Neye bakıldı:** video 67 sn, dökümün tamamı + 4 kare (adım 1-2); share.google yönlendirmesi çözüldü; README'deki model/hız tablosu ve repo metaverisi

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** Colibri saf C ile yazılmış, bağımlılıksız bir çıkarım motoru. Bir MoE modelinin yoğun kısmını RAM'de tutuyor, yönlendirilen uzmanları gerektikçe SSD'den akıtıyor ve OpenAI uyumlu bir uç nokta sunuyor (coliserve). Reel 'GLM-5.2 744B, 25 GB RAM'li dizüstünde, ekran kartı olmadan' diyor. README'deki ölçüme göre bu durumda hız soğuk başlangıçta saniyede 0,05-0,1 token, yani pratikte kullanılamaz; 128 GB'lık makinede 1,83 tok/s. Küçük modeller ise gerçekten kullanışlı: Qwen3.6-35B-A3B CPU'da 6, CUDA ile 30 tok/s. Repo: Apache-2.0, 40.432 yıldız, son push 2026-10-08. share.google bağlantısı da github.com/JustVugg/colibri adresine çıkıyor.
- **okundu:** evet — döküm tam, iki bağlantı da açıldı, iddialar README'nin kendi ölçümüyle karşılaştırıldı
- **izlendi:** video 67 sn, dökümün tamamı + 4 kare (adım 1-2); share.google yönlendirmesi çözüldü; README'deki model/hız tablosu ve repo metaverisi
- **zaten_var:** Hayır (depoda 'colibri' adı geçmiyor). Yerel model hattı B34'te Gemma 4 E4B ve Qwen3.8-27B ile yürüyor.
- **not:** Reeldeki 'sıfır token faturası, ücretli modelleri yener' iddiası abartı: 744B model 25 GB RAM'de saniyede 0,1 tokenın altında çalışıyor ve diskte 370-429 GB yer kaplıyor. Kişisel kullanım için açık lisanslı (Apache-2.0). B34 için bir ölçüm yapılacaksa yalnız küçük MoE modeller denenmeli.
