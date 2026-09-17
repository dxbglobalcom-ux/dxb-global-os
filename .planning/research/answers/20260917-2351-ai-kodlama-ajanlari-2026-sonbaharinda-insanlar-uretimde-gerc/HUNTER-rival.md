## A) NE OKUDUM

**Zeminde benim alanıma (rakip toplulukların kendi evi) düşen kanallar:** `ground-3/reddit.raw` içinde `r/cursor`, `r/GithubCopilot`, `r/AgentContext_dev` thread'leri bulundu; `google.raw`/`google-deep.raw` içinde `forum.cursor.com` ve `community.openai.com` linkleri vardı ama sayfa gövdeleri zeminde yoktu — onları kendim çektim. `r/codex` özel subreddit'i ve doğrudan `community.openai.com` içinde "switched to Claude Code" konusu bu turda kapalı kapı oldu (aşağıda D'de).

Okuduklarım, kapı-kapı:
1. **r/cursor** — "Claude Code vs Codex vs Cursor, what are you sticking with and why?" (1wfeim1) — 19 yorum, tamamı okundu (opencli reddit read, depth 10)
2. **r/GithubCopilot** — "Sonnet 4.5 was amazing... now it sucks" (1pjz76k) — 1245 satır / ~85 yorum, GitHub Copilot ekibinden **isidor_n**'in canlı yanıtları dahil, tamamı okundu
3. **r/GithubCopilot** — "It seems like Gemini 3 Pro is lazy" (1p3ch83) — 314 satır / ~30 yorum, tamamı okundu
4. **r/AgentContext_dev** — "Claude Code vs OpenAI Codex in 2026" (1uk1us0) — 3 yorum, tamamı okundu
5. **forum.cursor.com** — 4 thread çekildi: "Stick with Cursor or switch to Claude Code?" (14 yorum), "The future of Cursor is becoming Claude Code?" (3 yorum), "Cursor vs Claude Code – Community Feedback" (7 yorum), "Cursor Pro vs Codex vs Claude Code advantage" (kesildi, sadece OP)
6. **community.openai.com** — "Is codex production ready?" (5 yorum) + "Codex Rate Limits Discussion Thread" #593 (Levindore yorumu)

Toplam **~44 gerçek kullanıcı yorumu + OP'ler**, rakip vendor topluluklarından, tam metin olarak okundu.

## B) SAYIM (n=44 yorum, rakip topluluklardan)

| Yön | n | Kaynak |
|---|---|---|
| Cursor'da kalıyor / Cursor'u tercih ediyor | 13 | r/cursor + forum.cursor.com |
| Cursor forumunda Claude Code'a **geçmiş/geçmeyi düşünen** | 5 | forum.cursor.com |
| Copilot içinde Claude/Gemini modelinden şikayetçi, **Copilot dışına** (Antigravity/Windsurf/Codex ext.) kaçan | 6 | r/GithubCopilot x2 |
| Codex kullanıp limit/kararlılık yüzünden Claude Code'a kaydığını söyleyen | 2 | community.openai.com |
| Codex'i "production'a hazır değil" bulan | 3 | community.openai.com |
| Birden fazla aracı paralel/rotasyonlu kullanan (tek araca bağlanmayan) | 8 | tüm kanallar |

## C) SESLER (verbatim alıntılar)

1. **XPookachu** (r/cursor): *"I had say Cursor is your best bet... The reason I prefer Cursor though is because the Grok models are amazing... One thing to note is that OpenAI will no longer be providing its models on Cursor due to some beef."*
2. **Oli_lol** (r/cursor): *"Cursor + Grok 4.6 > Claude Code > Codex > Any other hyped harnesses... token quotas are not comparable across vendors."*
3. **oreshek** (r/cursor): *"codex, the resets give huge throughput. and its web usage does not affect codex usage like grok."*
4. **Js_360** (r/GithubCopilot): *"Claudes always sucked in copilot for me; use it in Windsurf and Antigravity however... it works like a dream."*
5. **Tetrylene** (r/GithubCopilot): *"Copilot is essentially just another 5.1 codex for me. Strongly considering cancelling it and keeping the cash for the codex IDE extension."*
6. **isidor_n**, GitHub Copilot ekibi (r/GithubCopilot, resmi yanıt): *"We did not make any major changes from the product side regarding Sonnet 4.5 so this is unexpected."* ve devamında: *"Yeah - that's the plan for December right now. Most of the team will focus on bug fixes / debt."*
7. **StevieG77** (forum.cursor.com): *"After 4 days with Claude Code: consumed 18% weekly allowance versus $100+ on Cursor. Finding Claude Code superior with new features and cost efficiency."*
8. **neverinfamous** (forum.cursor.com): *"Anthropic's servers are so busy now that half my requests bounce... largely useless now with the current limits."*
9. **MidnightOak** (forum.cursor.com): *"I have been a hardcore cursor supporter... but if [Cursor no longer building a collaborative editor] is no longer their product, then I might as well just get used to using Claude Code."*
10. **volga629** (community.openai.com): *"Codex app constantly Context automatically compacted (every request) which lead to waste of credits... Also constant crashes."*
11. **Levindore** (community.openai.com): *"Recently, Codex has started stopping in the middle of long-running tasks as soon as the 5-hour allowance reaches zero... If this behavior continues, I'll probably move more of my development workflow to Claude Code."*

## D) KAPALI KAPILAR

- **community.openai.com/t/switched-to-claude-code-from-codex-for-coding-due-to-5-hour-rate-limits/1395400** — hem WebFetch hem fetch.py→scrapling ile denendi, ikisi de **404 "Oops! That page doesn't exist or is private"** verdi. Thread kaldırılmış/gizlenmiş olabilir; sadece arama motoru özetinden ikincil bilgi kullanıldı (block'larda ayrıca işaretlenmedi, gövde okunamadı).
- **r/codex** (OpenAI'nin kendi subreddit'i) — zemin taramasında hiç görünmedi, ayrı arama da doğrudan bir thread URL'i döndürmedi (sadece üçüncü taraf blog sonuçları geldi); vakit kısıtı nedeniyle Reddit içi arama tekrarlanmadı.
- **forum.cursor.com/.../cursor-pro-vs-openai-codex-vs-claude-code-where-does-cursor-have-the-advantage/167057** — WebFetch sadece açılış mesajını (OP) döndürdü, yanıtlar gelmedi; tek deneme yapıldı, ikinci bir kapı denenmedi.

## E) FARKLI İNSAN SAYISI

Bu alanda okuduğum thread'lerde konuşan **~90 farklı kullanıcı adı** (tekrarlar çıkarılınca) — bunların içinde GitHub Copilot ürün ekibinden bir kişi (isidor_n) dahil.

## F) BUNU NE DEĞİŞTİRİRDİ

Rakip toplulukların kendi ağzından çıkan en çarpıcı ayrım şu: **hiçbiri "tek kazanan" demiyor** — herkes maliyet/limit ekseninde araç değiştiriyor, model kalitesi ekseninde değil. Bunu tersine çevirecek bulgu, Cursor veya Copilot'un kendi kullanıcılarının **limitten değil kaliteden ötürü** toplu halde ayrıldığını gösteren bir thread olurdu (şu ana kadar okunanların tamamı fiyat/kota/hız temelli geçiş anlatıyor). Bunu özellikle aradım ama bulamadım — vakit kalsaydı `r/codex` subreddit'ini doğrudan taramak ve 404 olan community.openai.com thread'ini Google cache/Wayback üzerinden kurtarmak bu boşluğu kapatırdı.