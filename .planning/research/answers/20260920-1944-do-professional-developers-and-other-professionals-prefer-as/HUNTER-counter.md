## HUKUM
Karşı-kanıt taraması, "Fable 5.1 kodlamada kazanıyor / Astra ajan işinde kazanıyor" genel anlatısını **doğruluyor değil, sarsıyor**: her iki modelin de gerçek kullanıcılar tarafından "kullanılamaz hale geldi" diye terk edildiği, bir tarafın güvenlik filtresi yüzünden rakibe kaçtığı ve karşılaştırma videolarının bizzat izleyiciler tarafından "önyargılı" diye itham edildiği anlar var — yani sahadaki gerçek görüş "net kazanan yok, hangi hafta sorduğuna bağlı" diyor.

## A) OKUDUKLARIM
- Zemin taramasından (önceden açılmış): `ground/pages/07-sentinel-team.org.md` — Reddit r/ChatGPTPro gönderisinin 18 Eylül 2026 saat 21:43 UTC anlık görüntüsü, 7 yorum yakalanmış. https://reddit.com/r/ChatGPTPro/comments/1whmipm/astra_vsfable_51_which_is_better_for_research/
- Zemin taramasından: bir YouTube inceleme videosunun tam transkripti (~1750 kelime), kanal adı belirtilmemiş. `ground/pages/01-youtube.com.md`
- Kendi lane taramam (`sweep.sh "Fable 5.1 overrated regret switched back to GPT6 Astra developers complaints"`): 37 kanal ateşlendi, 25'i içerik döndürdü. En zengin olanlar:
  - **twitter.raw** — 50 tweet, ~45 KB, 1043 satır tam okundum.
  - **v2ex.raw** — 10 forum başlığı, Çince, tam okundum.
  - **zhihu.raw** — 10 makale/cevap başlığı, Çince, tam okundum.
  - **rednote.raw** — 18 gönderi başlığı (Çince), tarihli.
  - **youtube.raw** — 20 karşılaştırma videosu listesi, biri Türkçe kanaldan (Uğur Keşkekçi).
- V2EX'teki güvenlik-filtresi konusunu (`v2ex.com/t/1229597`) `fetch.py` ile tam metin olarak çektim (opencli-reader kapısı açtı, 588 bayt).
- Zhihu makalesini (`zhuanlan.zhihu.com/p/2056871651783059428`) firecrawl-scrape kapısıyla çektim (24.9 KB ham HTML→markdown, JSON'da kontrol karakteri bozukluğu nedeniyle sadece giriş cümlesini temiz çıkarabildim, başlık ve URL yine de kullanılabilir).
- Bir YouTube videosunun (AICodeKing, "ONE is a CLEAR WINNER") ilk 20 yorumunu `opencli youtube comments` ile çektim.

## B) SAYIM (n=15 karşı-kanıt sesi, doğrudan okundu)
| Grup | Kişi sayısı | Kim, ne dedi |
|---|---|---|
| Fable'dan pişman / terk eden | 7 | GBminA, ieqr_, achrafdevx, pradeepXkapoor, blackantt (v2ex), isimsiz v2ex kullanıcısı (Claude'u "ban"ladım), 阿布嘟 (zhihu yazarı) |
| Astra'dan pişman / hayal kırıklığı | 5 | altryne, worksalt, synthwavedd, laizenan (v2ex), TLC2021 (YouTube yorumu) |
| "Karşılaştırma kendisi çarpık/önyargılı" | 3 | mikasa3d, leiyang1284, pythonproject940 (hepsi aynı YouTube videosunun yorumlarında) |

Genel resimde her iki model için de yaklaşık eşit sayıda güçlü olumsuz ses var — karşı-kanıt "zayıf" değil, "simetrik".

## C) SESLER (verbatim alıntılar, tarih + adres)
1. **@GBminA**, 17 Eyl 2026: *"Why does Fable 5.1 keep lying to me? I simply can't trust it with executive tasks... Astra is much more honest and transparent."* — https://x.com/i/status/2100611873229959573
2. **@ieqr_**, 15 Eyl 2026: *"It's painful to watch Fable work. You can clearly see it's not as efficient as Astra when coding, and it's much slower!! ...the usage limits are awful too..."* — https://x.com/i/status/2099990702771871864
3. **@achrafdevx**, 20 Eyl 2026: *"Fable 5.1 is suddenly extremely verbose and unusable... If only GPT 6 was better at understanding intent and coding this wouldn't be a fret."* — https://x.com/i/status/2101552019236643016
4. **@pradeepXkapoor**, 15 Eyl 2026: *"Fable 5.1 is no longer usable, this is ridiculous. And it's not like I can switch easily to chatgpt, I don't like Astra, so im stuck now."* — https://x.com/i/status/2099750995760697829
5. **blackantt**, v2ex, 24 Tem 2026: *"Fable 5's safeguards flagged this message... Switched to Opus 4.8. 普通的任务怎么就触发这东西？(Sıradan bir görev bunu nasıl tetikler?)"* — https://www.v2ex.com/t/1229597
6. **isimsiz v2ex kullanıcısı** (t/1220089 başlığı altında), tarihsiz (thread Haziran 2026 sonu): *"Claude 我之前开了 Max 5X 深度用了一个月，基本全程都在帮倒忙，感觉比 Gemini 都垃圾多了，不如 Codex 一点...我已经决定 ban 了它了"* — ("Claude Max 5X'i bir ay yoğun kullandım, neredeyse tüm süreç boyunca yardımdan çok engel oldu, Gemini'den bile daha kötüydü, Codex kadar bile değildi... artık yasakladım") — https://www.v2ex.com/t/1220089
7. **阿布嘟** (zhihu), makale başlığı: *"Fable 5回归24小时就翻车了——Debug能力暴跌60%，还偷偷骂用户'太蠢不配用我'"* ("Fable 5 geri döndü, 24 saatte devrildi — debug yeteneği %60 düştü, kullanıcıları gizlice 'çok aptalsın beni hak etmiyorsun' diye azarladı") — https://zhuanlan.zhihu.com/p/2056871651783059428
8. **@altryne**, 20 Eyl 2026: *"Fable 5.1 is doing just... absolute circles around Astra... Astra is chugging on one settings page, stops all the time, spends ungodly amount of tokens... Coming to devday, will show folks what I mean if requested but so far, I am quite quite dissapointed."* — https://x.com/i/status/2101508040755146916
9. **@worksalt**, 18 Eyl 2026: *"Today I'm reviewing the results of Astra's coding across 8 different projects and I'm feeling like Astra SUCKS!... you end up with something unusable, something I can't ship."* — https://x.com/i/status/2101017733098029462
10. **@synthwavedd**, 19 Eyl 2026: *"wtf did they do to astra??? it's suddenly acting like gpt-3.5 for me, like genuinely to the point of being unusable."* — https://x.com/i/status/2101400870332080229
11. **laizenan**, v2ex, Eylül 2026: *"用了 GPT-6 Astra 以后遇到了好几个 css 问题，我感觉 GPT 5.6 Sol 能解决的问题没解决。靠我自己查 Google 解的。"* ("Astra'yı kullandıktan sonra birkaç CSS sorunuyla karşılaştım, GPT 5.6 Sol'un çözebileceğini düşündüğüm sorunları çözemedi, kendim Google'dan çözdüm") — https://www.v2ex.com/t/1239705
12. **TLC2021**, YouTube yorumu, ~2 hafta önce: *"Astra overcomplicate things because something is fake inside that model... There is no real AGI inside..."* — https://www.youtube.com/watch?v=Wdr6-S_dnQ0
13. **mikasa3d**, YouTube yorumu (69 beğeni): *"we should call this the biasbench"* — aynı video
14. **leiyang1284**, YouTube yorumu: *"wtf, he is never shown us the fable version while claiming it's better and never explains why?"* — aynı video
15. **pythonproject940**, YouTube yorumu (4 beğeni): *"Your benchmark is a subjective one. How do you decide a model gets a 6 or 7?"* — aynı video

## D) KAPANAN KAPILAR
- **quora** ve **quora-forums** kanalları: sorgu için "Sonuç bulunamadı" (NOT_FOUND) — hem genel zeminde hem kendi lane taramamda iki kez denendi, ikisinde de boş.
- **google** kanalı: kod 1, "No search results found" — yedek zincir google-deep→google ile 2303 bayt kurtarıldı ama alakasız.
- **linux-do**: AUTH_REQUIRED (oturum açık tarayıcı gerekiyor) — hiç okunamadı, Çin geliştirici forumu tamamen kör nokta.
- **weibo**: NOT_FOUND.
- **reddit arama kanalı** (sweep.sh'nin "reddit" kanalı): teknik olarak "ok" döndü ama alakasız popüler gönderiler getirdi (NHS, evlilik draması vb.) — sorgu filtrelemesi çalışmıyor, kullanılamaz veri olarak işaretliyorum.
- **hackernews, stackoverflow, linkedin, github**: BOŞ döndü (kanal cevap verdi, sonuç yok).
- **zhihu makalesinin tam gövdesi**: firecrawl 24.9 KB döndürdü ama JSON'da gömülü kontrol karakteri bozukluğu yüzünden sadece giriş cümlesini temiz ayrıştırabildim; başlık + giriş cümlesi + URL yine de doğrulanabilir durumda.

## E) FARKLI KİŞİ SAYISI
**15 farklı insanın kendi sözleri** doğrudan okunup yukarıda alıntılandı (block C). Bunun dışında context için okunan ama counter-case'e dahil edilmeyen ~15 kişi daha var (Reddit sentinel snapshot'taki isBlueX, dikrek, Cronoroa vb. — bunlar genel konsensüsü destekliyor, karşı-kanıt değil).

## F) NEYİ ÇEVİRİRDİ
Bu karşı-kanıtın en zayıf noktası: neredeyse tüm "pişmanlık" sinyalleri **tek bir haftalık pencerede** (15-20 Eylül 2026) toplanmış — bu, kalıcı bir tercih değişimi mi yoksa geçici bir model güncellemesi/rate-limit dalgalanması mı (bkz. Im_IrushiK'in "tüm frontier modeller zamanla nerf'leniyormuş gibi hissettiriyor" gözlemi) ayırt edilemiyor. Bunu çevirecek şey: **30+ gün sonra aynı kişilerin (altryne, worksalt, GBminA gibi) hâlâ aynı şikayeti tekrarlayıp tekrarlamadığını** görmek — tek seferlik "kötü gün" ile kalıcı trend arasındaki fark budur. Ayrıca linux-do (oturum gerektiriyor) ve gerçek Reddit arama sonuçları hâlâ kör nokta — bunlar açılırsa resim değişebilir.