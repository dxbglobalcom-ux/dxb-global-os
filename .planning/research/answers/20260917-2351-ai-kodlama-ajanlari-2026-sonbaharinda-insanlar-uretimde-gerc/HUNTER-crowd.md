## A) NE OKUDUM

**Reddit** — sweep'in kendi `reddit.raw`'ı `ground-2`'de boştu (4 byte, kapalı kapı), ama `ground` ve `ground-3`'te toplam **15 alakalı thread** buldum. `opencli reddit read` varsayılan `--expand-more`/`--expand-rounds` ayarıyla 7 thread'de "orphan comment" hatasıyla çöktü (sadece sayfa metni kaldı) — `--expand-more false` ile tekrar denedim ve hepsini açtım. Sonuç: **15 thread, 2658 yorum/gönderi, ~1698 ayrı kullanıcı** okundu. En ağır thread'ler: "Claude Code (~100 hours) vs. Codex (~20 hours)" (213 kayıt), "GPT-5.3 Codex vs Opus 4.6 benchmark" (286 kayıt, içinde bir moderatör-botunun 200-yorum sonrası otomatik özeti var), "Claude-powered agent production silme olayı" 4 çapraz-gönderi halinde (r/technology x2, r/pcmasterrace x2 — toplam 1409 kayıt), "leaked source code for Claude Code" (216 kayıt), "im a software engineer with a decade of..." (143 kayıt), "Vibe Coding vs Production reality" (211 kayıt), + 7 küçük thread (AgentContext_dev, AI_Agents, WebAfterAI, webdev, r/claudeskills "Fable 5 Ultracode" 126 kayıt, r/hermesagent megathread 35 kayıt).

**Hacker News** — sweep'in `hackernews.raw`'ı **3 taramanın 3'ünde de boştu** (4 byte). Kapıyı zorladım: Algolia API'sine doğrudan `curl` ile bağlandım (scrapling ile de doğrulandı) ve **2 doğrudan-alakalı thread** buldum: "Ask HN: Claude Code or Codex?" (33 yorum, 27 kişi) ve "Ask HN: Is anyone experimenting with different ways of using LLMs for coding?" (206 yorum, 156 kişi). Toplam: **239 yorum, 183 ayrı kişi**.

**Lobste.rs** — sweep sonuçları sadece arama-motoru snippet'iydi; 5 story'yi (`claude code is not making your product better`, `why I stopped using AI code editors`, `neovim users what AI tools`, `where's the shovelware`, `is claude code going to cost $100/month`) `fetch.py` ile tam sayfa olarak çektim: **295 yorum, ~145 ayrı kişi**.

**dev.to** — sweep'te bulunanlar tartışma değil, SEO listicle makaleleriydi ("Claude Code vs Codex vs Cursor: 2026 Field Test" vb.) — yorum bölümleri pratikte boş; kalabalığın olduğu bir yer değil, sadece başlık/tez olarak not ettim.

**StackOverflow** — sweep 3 taramada da boştu; doğrudan Stack Exchange API'sine sorgu attım, "Claude Code" ile 30+ soru var ama hepsi kurulum/hata-ayıklama (teknik destek), konumuzla (üretimde hangisini koşuyorlar/bırakıyorlar) ilgili sıfır tartışma.

## B) SAYIM (n=3192 okunan kayıt — 2658 reddit + 295 lobsters + 239 HN)

Ham geçiş sayıları (korpus genelinde): "codex" 196 kez, "claude code" 149 kez, "opus" 91 kez, "gemini" 55 kez, "cursor" sadece 21 kez geçiyor — bu korpusta Cursor, Claude Code/Codex ikilisinin çok gerisinde kalıyor (subreddit seçimi bunu bir miktar etkiliyor, ama HN "Claude Code or Codex?" başlığının kendisi de Cursor'u üçüncü seçenek olarak bile anmıyor).

- **Hâlâ koşanlar (temsili görüş):** Claude Code'da kalan ağır kullanıcılar var (`kingkongjaffa`: lansmandan beri ağır kullanıcı, "Fable" lansmanına kadar çok memnundu), Opus'a sadık kalanlar var (qxr7vs thread'inde moderatör-botunun 200-yorum özeti: "hard split... loyal Opus 4.6 users calling BS"). Codex tarafında da net memnuniyet var (`jdw64`: "Personally, I think Codex is better"; `Talpur1` tam tersi Claude'da kalıyor).
- **Bırakanlar/geçenler:** Az sayıda ama net — Codex'e "bağlantı kopmaları" ve harness kısıtlaması yüzünden geçenler (`jdw64`, `OleksandrC`), Claude aboneliğinin sadece Claude Code ile kullanılabilmesi (Anthropic ToS) Codex lehine bir itici güç olarak öne çıkıyor.
- **Üçüncü ve büyüyen kamp — "marka önemsizleşiyor":** Hem HN hem Reddit'te giderek daha fazla kişi kendi "harness"ını kuruyor ve altında hem Claude hem Codex modellerini değiştirerek koşuyor (`217` @HN: "harness did make them mostly interchangeable"; moderatör-botu: "best strategy is to be a model polygamist").
- **Cursor'a özel:** Cursor doğrudan "hangisini koşuyorsunuz" tartışmalarında neredeyse hiç anılmıyor; tek büyük Cursor teması, üretim-veritabanı-silme olayında (bkz. Block F) Cursor'un altyapısının (Claude modelleriyle) suçlanmasıydı — marka tercihi değil, güven/gözetim krizi.
- **Terk gerekçeleri (Codex'ten Claude'a değil, genel "tam-otonom ajan"dan):** 4 çapraz-gönderilmiş "silme olayı" thread'inde (1409 kayıt) baskın tema marka değil, **yetki/gözetim** — "neden production'a bu kadar geniş izin verdin", "backup yoksa backup değildir", "junior developer gibi" gibi yorumlar en çok oy alanlar.

## C) SESLER (verbatim, yazar + tarih)

1. **PetyrLightbringer**, r/ClaudeAI (2026): *"'All our software engineers aren't writing code anymore' -Dario. Yeah that's pretty freaking apparent dude"* [1161 upvote]
2. **bcherny** (Anthropic Claude Code ekibinden Boris), r/ClaudeAI (2026): *"Confirming this is patched in the next release, however this is a <1% win unfortunately."* [309 upvote]
3. **ClaudeAI-mod-bot** (otomatik topluluk özeti), r/ClaudeAI (2026): *"The real TL;DR: the community believes the best strategy is to be a model polygamist—use each for its strengths."*
4. **jdw64**, Hacker News, "Ask HN: Claude Code or Codex?" (2026-07-21): *"I use both. Claude I use up to 5, and Codex I use up to 20 for PRO. Personally, I think Codex is better. Aside from the frequent resets, since the Fable incident, there have been cases where connections drop."*
5. **OleksandrC**, Hacker News (2026-07-21): *"One significant advantage of Codex subscription over Claude is that you can use any agent harness with it. Meanwhile Anthropic insists that Claude subscription must only be used with Claude Code itself."*
6. **kingkongjaffa**, Hacker News (2026-07-21): *"I have personally been a heavy claude code user since it launched... Until the launch of Fable I'd been very happy with claude code besides the outages."*
7. **dpc_pw**, Lobste.rs, "claude code is not making your product better" (2026-05-05): *"LLM assistance allows producing a lot of features/code at certain average quality much faster... but it is not what allows you to 'build things that were not done before.'"*
8. **Unrefined5508**, r/technology, silme-olayı thread (2026): *"Just like a junior developer!"* [5538 upvote]
9. **titan-of-hunger**, r/pcmasterrace, silme-olayı thread (2026): *"If you allow AI to make code changes to your source with no oversight... you get what you fuckin deserve."* [783 upvote]
10. **Canamerican726** (OP), r/ClaudeCode, "Claude Code (~100 hours) vs. Codex (~20 hours)" (2026): *"14 year engineer... Plan mode first with a fairly thorough and scoped prompt. plan-review skill... runs 8 subagents (architecture, coding standards, ui design, performance)."*

## D) KAPALI KAPILAR

- **HN (sweep'in kendisi):** `hackernews.raw` her 3 turda da 4 byte döndü → **kapalı**, ama Algolia API'ye doğrudan gidip **açtım** (2 thread, 239 yorum).
- **StackOverflow (sweep):** 3 turda da boş → **kapalı**, Stack Exchange API'ye doğrudan gittim, **açıldı ama konu-dışı**: sadece kurulum/hata-ayıklama soruları, "hangisini üretimde koşuyorsunuz" tartışması yok.
- **dev.to:** kapı açık ama içerik "kalabalık" değil — SEO listicle makaleler, aktif yorum tartışması yok, o yüzden sayıma dahil etmedim.
- **opencli reddit read (varsayılan `--expand-more`):** 7 thread'de "Reddit /api/morechildren returned unplaceable comments" hatasıyla çöktü → `--expand-more false` ile **tamamı açıldı**, hiçbir thread okunmadan bırakılmadı.
- **Lobsters/HN'de platformlar-arası kimlik tekilleştirmesi yapılmadı** — aynı kişi birden fazla platformda farklı kullanıcı adıyla sayılmış olabilir; bu bir delik değil ama bir metodoloji sınırı.

## E) AYRI İNSAN

**~2026 ayrı insan** kendi sözleriyle okundu (Reddit ~1698 + Lobste.rs ~145 + Hacker News 183; platformlar arası tekilleştirme yapılmadı, farklı kimlik uzayları).

## F) NEYİ ÇEVİRİRDİ

Şu an elimdeki en güçlü sinyal, marka tercihinin (Claude Code vs Codex vs Cursor) giderek **"harness-agnostik" çoklu-model kullanımına** kayması — moderatör-botunun kendi topluluğuna dair otomatik özeti bunu "model polygamist" diye adlandırıyor ve HN'de birden fazla kişi bunu doğruluyor. Bunu çevirecek bulgu: **Anthropic'in Claude aboneliğini sadece Claude Code'a kilitleme politikasının** (OleksandrC'nin bahsettiği) gevşetilip gevşetilmediği — eğer gevşerse "terk" hikayesi bir anda tersine dönüp Claude Code'un payını büyütebilir, çünkü mevcut kaçışın en somut teknik gerekçesi bu kilit. Bunu aradım: doğrudan bir "Anthropic changed the Claude Code lock-in policy" arattım ama korpusta buna dair yeni bir duyuru bulamadım — hâlâ açık bir soru.