## A) OKUDUĞUM KAYNAKLAR

Zemin taramasından (`ground-2/reddit.raw`, İngilizce sorgu) hedefe uygun 22 gönderiyi ayıkladım, sonra kendi reddit search + read ile 8 iş parçacığını (thread) TAM YORUM zinciriyle açtım, artı community.openai.com'da (Discourse JSON API, `search.json` + `/t/<id>.json`) 2 konu okudum:

1. **r/codex** — "We switched from Claude Code to Codex at work" — 160 puan, **140 yorumun tamamını okudum** (1338 satır tam thread)
2. **r/codex** — "GPT-6-Astra vs Fable 5.1" (kaydırma yayı testi) — 5 puan, **40 yorumun tamamı**
3. **r/codex** — "I re-subbed to claude code, and realized I was spoiled by Codex" — 230 puan, **~50 yorum okudum** (1182 satırlık dosyanın ilk 400 satırı)
4. **r/codex** — "Astra for specs, luna for coding" — 31 puan, **~30 yorum tarandı**
5. **r/ArtificialInteligence** — "Is OpenAI's GPT 6 Astra actually behind Fable, and even Opus?" — **~30 yorum tarandı** (çoğu benchmark-politikası, kod kalitesine değil)
6. **r/ClaudeCodeTLDR** — "Same prompt, Codex (Astra 6) vs Claude (Fable 5.1): balık oyunu" — bot-TLDR + **3 yorumun tamamı**
7. **r/ClaudeAI** — "Robot kol ile Fable 5.1 vs Astra 6 boyama" — 506 puan, **137 yorumun tamamı** (kod değil ama Codex/Claude ajan davranışına dair yan yorumlar içeriyor)
8. **community.openai.com** — Discourse arama API'siyle "Claude code quality" ve "GPT-6 Astra coding" sorguları → 2 konuyu tam okudum (bir tanesi svatel'in "heavy user of both Codex and Claude Code" tekniki karşılaştırması)

**D bloğunda kapanan kapılar** hariç, toplamda **~430 yorum metni okundu**, salt link listesi değil.

## B) SAYIM (n=)

r/codex "switched to Codex at work" thread'inde kod kalitesi hakkında **açık taraf tutan ~35 yorumcu** arasında:
- **Codex/Sol/Astra lehine: 16** (daha az rework, daha az "over-promise", daha isabetli backend/güvenlik kodu)
- **Claude/Opus/Fable lehine: 12** (daha iyi niyet anlama, ama son zamanlarda "yarım bırakma" şikayeti çok)
- **Duruma göre değişir/ikisini de kullanıyorum: 7**

İki **doğrudan kafa-kafaya** kod üretim testinde (kaydırma yayı HTML canvas, balık oyunu React) TLDR/OP sonucu: **2/2 → Claude Fable 5.1 "kalite"de kazandı**, Astra 6 ise "hız" ve "görsel cila"da öndeydi.

**Distinct insan sayısı (E bloğunda ayrıca)**: ~230 farklı reddit kullanıcı adı + 2 OpenAI forumu kullanıcısı.

## C) SESLER (verbatim alıntılar)

1. **unconceivables** (r/codex, +64): *"My experience has been that Sol has consistently generated better code than Opus and catches more stuff."*
2. **Reaper_1492** (r/codex, +11): *"I really hate Anthropic so it pains me to say this, but I'm getting a LOT more throughput out of Opus and Fable right now than I am out of Sol and Astra."*
3. **pigletmonster** (r/codex, +1): *"Fable 5, not 5.1 still produces better code quality than astra. Obviously astra is better at other things, but fable still dominates in code."*
4. **Jon_Has_Landed** (r/codex, +2): *"I've used Codex GH plugin for PR reviews and it consistently finds bugs whenever Fable, Opus, or whichever other model posts a PR... So no: Claude does not produce better code than Codex. And vice versa."*
5. **DaC2k26** (r/codex, orijinal gönderi sahibi): *"Sonnet 4.6 is incredibly lazy... Opus 4.8 is more thorough, but it's still not on the same level as GPT-5.4 or GPT-5.5."*
6. **ShamanJohnny** (r/codex, +14): *"Claude writes decent code, i would say the bulk 80% okay, but the other 20% is terrible, or it lies and says it did it but didn't."*
7. **cctldrping / otomatik-TLDR botu** (r/ClaudeCodeTLDR, balık oyunu): *"The consensus is pretty clear: Claude (Fable 5.1) is the winner here... Codex's version... often described as boring or unnatural."*
8. **shniydder** (r/codex, kaydırma yayı OP): *"Overall I'd say Claude wins on quality and GPT wins on speed."*
9. **svatel** (community.openai.com, Serge Vatel): *"Codex is already a world-class coding model. Its reasoning, code review quality, and implementation discipline are strong enough that I want it deeply integrated into my agent teams"* — ama çoklu-ajan koordinasyonunda Claude Code'u daha "present" buluyor.
10. **Efficient-Cat-1591** (r/codex, +1): *"Overall code quality and intelligence in understanding the task I would say Claude Code models win. However value for money Codex models are better."*

## D) KAPANAN KAPILAR

- **r/codex arama içi `--expand-more true`** → Reddit API "unplaceable comments" hatası verdi (orphan parent), `--expand-more` bayrağı kaldırılarak aşıldı — düzeltildi, kapanmadı.
- **`quora-forums` ve `google-forum` kanalları** (zemin taramasında) → boş/hata döndü (86-137 byte hata mesajı); bu lane'de telafi edilmedi çünkü Discourse JSON API (community.openai.com) doğrudan çalıştı.
- **Discord (OpenAI/Anthropic topluluk sunucuları)** → hiç denenmedi, bu oturumda keyless/web köprüsü yok; **açık delik** olarak işaretliyorum.
- **r/ArtificialInteligence thread'i** kısmen "kapalı kapı" sayılır — 60 yorumun büyük kısmı benchmark-politikası (Artificial Analysis skorlarının güvenilirliği) idi, kod kalitesine dair doğrudan veri azdı.

## E) DİSTİNCT İNSAN SAYISI

**~230 farklı Reddit kullanıcı adı + 2 OpenAI forum kullanıcısı = yaklaşık 232 farklı insanın kendi cümleleri** okundu (bot/silinmiş/[removed] hariç).

## F) NEYİ TERS ÇEVİRİRDİ

En kritik boşluk: okuduğum tüm veri **anekdot ve ikili "aynı prompt" mini-testleri** — kontrollü, çok sayıda PR/görev üzerinden yapılan **istatistiksel bir kod-kalitesi karşılaştırması** (örn. "50-PR code review benchmark" başlıklı gönderiler, `r/ChatGPTCoding` ve `r/ZaiGLM`'de görüldü ama bu lane'de tam okunmadı, sadece başlık listesinde çıktı) bulunsaydı, tercih tablosunu ciddi şekilde netleştirirdi. Ayrıca **community.openai.com içinde doğrudan "hangisi daha iyi" konu başlıklı** bir tartışma bulamadım — OpenAI'nin kendi forumu ağırlıklı olarak kota/quota şikayetleri ve özellik istekleri barındırıyor, doğrudan Claude-vs-Astra kod kalitesi tartışması nadir; bu, vendor forumunun kendi kullanıcılarının rakip ürünü nadiren açıkça kıyasladığını gösteriyor — bu da kendi başına bir bulgu.

**Genel tablo (rakibin kendi evi, r/codex ağırlıklı)**: Gündelik r/codex kullanıcı kitlesi arasında görüş **açıkça bölünmüş**, hafif bir Codex/Sol/Astra lehine eğilim var (daha az rework, daha isabetli backend/matematik kodu, daha az "yalan söyleme"); ama doğrudan kafa-kafaya yaratıcı-kodlama testlerinde (2/2) ve "kod kalitesi" özelinde ayrım yapan yorumcularda Claude Fable lehine bir çekim var. Codex/Astra tarafının asıl gücü hız/token-verimliliği ve "aşırı vaat etmeme"; Claude/Fable tarafının asıl gücü niyeti doğru anlama ve oyunlaştırma/mekanik kalitesi — ikisi de "kod kalitesi" derken farklı şeyi ölçüyor.