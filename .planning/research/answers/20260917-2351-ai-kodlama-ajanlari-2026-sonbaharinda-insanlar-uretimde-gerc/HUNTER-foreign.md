# RAPOR — LANE: Diğer Diller (Zhihu, V2EX, Linux.do, Weibo, Juejin, Quora, TR/DE forumlar)

## A) OKUDUĞUM KAYNAKLAR

**Zemin (ground/ground-2/ground-3) taramasından benim alanıma düşenler:**
- `zhihu.raw` (3 taramada da, ~2KB): büyük çoğunluğu konu dışı (güzellik sorusu, genel "AI 100 proje" listeleri), **1 isabetli makale** bulundu ve tam okundu.
- `v2ex.raw` (ground-2 + ground-3, ~5KB her biri): 20 başlık, büyük kısmı doğrudan isabetli (Claude Code vs Codex vs Cursor tartışmaları) — **12 V2EX konusunun tam metnini** (başlık + tüm yorumlar) firecrawl/opencli-reader/scrapling zinciriyle çektim.
- `juejin.raw` (ground-2 + ground-3, ~6.5KB her biri): 20 başlık, tamamı isabetli karşılaştırma makaleleri — **7 makalenin tam metnini** çektim.
- `quora.raw` / `quora-forums.raw`: İngilizce genel AI soruları, konuya özgü değil, saf gürültü.
- `linux-do.raw`, `weibo.raw`: **3 taramanın 3'ünde de 0 byte** — kapalı kapı.

**Kendi ek okuma turumda (mylane/ klasörü, 19 sayfa, hepsi başarıyla okundu):**
- V2EX: t/1210849 (103 yorum), t/1187879 (85 yorum), t/1191621 (36 yorum), t/1167465 (40 yorum), t/1209638 (31 yorum), t/1210423 (uzman blog yazısı + 20 yorum), t/1143327, t/1155803, t/1196632, t/1222256, t/1196166, t/1194541
- Juejin: 7 karşılaştırma makalesi (2026 tarihli, farklı yazarlar)
- Zhihu: "一天用完一个月额度——AI编程Agent 2026年中大洗牌" (老周聊架构, 2026-06-17)

## B) SAYIM (n=)

V2EX'te okuduğum 5 büyük tartışma başlığında (toplam ~295 yorum, n=295) tercih dağılımı kabaca:
- **Codex tercih/övgü ifadesi:** ~55 yorum
- **Claude Code tercih/övgü ifadesi:** ~50 yorum
- **"İkisini birlikte kullanıyorum" (CC+Codex veya CC+Cursor):** ~45 yorum — bu en büyük tek küme
- **Cursor tercih/övgü ifadesi:** ~35 yorum
- **Terk/şikayet ifadesi (hesap yasağı, model "budanması", fiyat şikayeti):** ~30 yorum — bunların büyük kısmı Claude Code'a yönelik
- **OpenCode/diğer (Trae, Qoder, Antigravity, GLM, DeepSeek+OpenCode):** ~50 yorum

Juejin'deki 7 makalenin sonuç bölümlerinde: 3 makale Cursor'u "genel kullanıcı için en iyi" ilan ediyor, 3 makale Claude Code'u "derin/karmaşık iş için en güçlü" ilan ediyor, 1 makale (OpenCode savunan) OpenCode'u önerdi.

## C) SESLER (orijinal + Türkçe çeviri)

1. **gbin, V2EX t/1210849, #85 (May 8):** "claude 模型最近降智太严重了，堪比我老年痴呆的奶�ml。" → *"Claude modeli son zamanlarda çok fena geriledi/budandı, bunamış büyükannem gibi."*

2. **GodVan, V2EX t/1210849, #56 (May 8):** "Claude Code 写的最对，但封号最严重" → *"Claude Code en doğru kodu yazıyor, ama en ağır şekilde hesap banlıyor."*

3. **mogutouer, V2EX t/1167465, #21 (Oct 22, 2025):** "上个月开始这货频繁的出bug...我本来一个月$250可以畅用opus，结果在这个月他又换了计费方式，opus单独计费还有周使用量限制。一气之下转到了codex pro $200" → *"Geçen aydan itibaren sık sık hata vermeye başladı... Ayda 250 dolarla sınırsız Opus kullanabiliyordum, ama bu ay faturalandırmayı değiştirdiler, Opus'u ayrı faturalıyorlar ve haftalık kullanım limiti koydular. Sinirle Codex Pro'ya ($200) geçtim."*

4. **aarontian, V2EX t/1187879, #49 (Jan 24):** "根本原因是cursor去年七月份把计费规则改了...基本用不了多少就超了，然后cc横空出世，会员性价比比cursor高很多" → *"Temel sebep Cursor'ın geçen Temmuz'da faturalandırma kurallarını değiştirmesi... hızla limite çarpılıyordu, sonra Claude Code çıktı ve fiyat/performans olarak Cursor'dan çok daha iyi."*

5. **fennu2333, V2EX t/1210423 (blog yazısı, plugin geliştiricisi):** "虽然最近A\家各种封杀降智不做人，把口碑都败光了，但从Claude Code的插件扩展性来看在Harness Engineering的理解上确实是断档领先" — puanlama: Claude Code 43/45, Codex 19/45 → *"Anthropic son zamanlarda banlama ve model zayıflatma yüzünden itibarını epey harcadı, ama plugin/hook mimarisi açısından Claude Code, Codex'i açık farkla geride bırakıyor."* (Codex'te plugin hook'ları hiç çalışmıyor — GitHub issue #16430'a atıf yapıyor.)

6. **dafanglab, Juejin (2026-04-08), 8 yıllık full-stack tech lead:** "过去大半年，我几乎没有手写过一行代码——所有编码工作都交给了AI...我订阅了Claude Max（$200/月），日常开发的工作流已经从'我写代码'变成了'我审代码'" → *"Son yarım yıldır elimle hemen hiç kod yazmadım — tüm kodlama işini AI'ya verdim. Claude Max'e ($200/ay) abone oldum, günlük iş akışım 'kod yazan' kişiden 'kod inceleyen' kişiye dönüştü."*

7. **老周聊架构, Zhihu (2026-06-17):** "Copilot用户6月1日打开IDE，发现额度从'Premium Requests'变成了'AI Credits'。然后社区爆了一条评论：'一天就用完了一个月的额度。'" → *"Copilot kullanıcıları 1 Haziran'da IDE'yi açtığında kotanın 'Premium Requests'ten 'AI Credits'e döndüğünü gördü. Topluluktan patlayan bir yorum: 'Bir günde bir ayın kotasını tükettim.'"*

8. **Kureha, V2EX t/1209638, #10 (Apr 30):** "codex比claude便宜大碗，可以让cc指挥codex干活" → *"Codex, Claude'dan daha ucuz ve daha 'doyurucu'; Claude Code'a Codex'i yönettirebilirsin (bridge script ile)."*

9. **P233, V2EX t/1210849, #5 (May 7):** "CC 的风格更偏产品思维...Codex 更偏理工思维，解决问题简单直接干脆...改bug和review大概率用codex比cc好。讨论产品功能大概率cc比codex好" → *"Claude Code ürün odaklı düşünür, kendi kararlarını verir; Codex mühendislik odaklı, sorunu doğrudan çözer. Bug düzeltme/inceleme için Codex, ürün özelliği tartışmak için Claude Code daha iyi."*

10. **Juejin (Plankston, 2026-07-26) — güvenlik olayı bulgusu:** "2026年7月，Claude Code爆发了针对中国用户的隐蔽追踪事件...当用户配置非官方ANTHROPIC_BASE_URL时，Claude Code会：读取系统时区、检查代理域名是否命中147+个中国域名黑名单...用Unicode隐写术把分类结果嵌入system prompt" → *"2026 Temmuz'da Claude Code'un Çinli kullanıcıları hedef alan gizli bir izleme mekanizması ortaya çıktı: kullanıcı resmi olmayan bir proxy (ANTHROPIC_BASE_URL) ayarladığında, sistem saat dilimini okuyor, proxy alan adını 147+ Çin alan adı kara listesiyle karşılaştırıyor ve sınıflandırma sonucunu Unicode gizli yazıyla system prompt'a gömüyor."* — İddiaya göre işçin Sanayi Bakanlığı (工信部) bunu "ciddi güvenlik açığı" ilan etmiş, 2 Temmuz'da v2.1.197 ile kaldırılmış. **Bu iddiayı tek bir ikincil kaynaktan (özet blog yazısı) okudum — birincil kaynak/resmi doğrulama görmedim, temkinli değerlendirilmeli.**

## D) KAPALI KAPILAR

- **linux.do** — ground taramasının 3 turunda da (`linux-do.raw`) 0 byte döndü; hem doğrudan arama hem `juejin-via-linux-do` / `v2ex-via-linux-do` dolaylı denemeleri de 0 byte. Bu kanal bu round'da tamamen sessiz kaldı.
- **weibo** — 3 turda da 0 byte, sessiz kanal.
- **Quora / quora-forums** — adres bulundu, içeri girildi, ama içerik "AI coding agent 2026" sorusuyla ilgisiz genel AI/istihdam soruları ve pazarlama spam'i çıktı — kapı açıktı ama içi boştu.
- **quora-direct.md / juejin-direct.md / v2ex-direct.md** (önceki turların "direct" fetch girişimleri) — bunlar hedef sorguyu doğru site içi aramaya çeviremedi (juejin: boş arama sonucu; v2ex: alakasız "arama motoru teknolojisi" node'una düştü), okumaya değer içerik yoktu, kendi taramamla telafi ettim.
- Zhihu'da arama sonuçlarının ~9/10'u konu dışıydı (güzellik sorusu, genel "AI 100 proje" listeleri) — sadece 1 isabetli makale bulundu; Zhihu'nun soru-cevap kısmında (zhihu.com/question) doğrudan "hangi coding agent'ı bıraktınız" tartışması bulunamadı, yalnızca zhuanlan (blog) makaleleri isabetli çıktı.

## E) FARKLI KİŞİ SAYISI

V2EX'teki 5 büyük başlıkta (~295 yorum) tekrar eden kullanıcı adlarını (kapaseker, asd999cxcx, mogutouer, andyskaura vb. birden çok yorum yapanlar) çıkararak yaklaşık **~230 farklı V2EX kullanıcısının** kendi sözlerini okudum. Buna 7 Juejin makalesinin 7 farklı yazarını ve 1 Zhihu yazarını (老周聊架构) ekleyince toplam:

**≈ 238 farklı insanın kendi sözünü okudum.**

## F) BU CEVABI TERSİNE ÇEVİRECEK BULGU

En kritik değişken **hesap yasaklama (封号) ve model "budama" (降智) şikayetlerinin gerçek oranı** — V2EX'te tekrarlı olarak (opeth, GodVan, YanSeven, mogutouer gibi çok sayıda farklı kullanıcı) Claude Code'un hesaplarını agresif şekilde banladığı ve Mayıs-Haziran 2026 civarında modelin performansının düştüğü şikayet ediliyor; bu, "Claude Code'dan Codex'e geçiş" anlatısının ana itici gücü gibi görünüyor. Eğer bu banlama dalgası münhasıran **Çin'den erişilen üçüncü parti proxy/mirror kullanıcılarına** özgüyse (resmi ödeme + resmi bölge kullanan kullanıcılar için sorun yoksa), bu bulgunun "insanlar Claude Code'u terk ediyor" sonucunu büyük ölçüde geçersiz kılar — sadece "coğrafi erişim kısıtlaması sorunu" olur, ürün kalitesi sorunu değil. Bunu doğrulamak için resmi Anthropic hesap askıya alma politikasını veya bölgesel kullanım verisini aramadım; bu **gitmediğim** bir yoldu ve cevabı ciddi şekilde değiştirebilirdi.