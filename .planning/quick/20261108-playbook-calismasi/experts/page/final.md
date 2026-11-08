# Tek ajan ve iş kitabı: uzmanlar ne diyor, holding için ne demek

Borja'nın özü doğru, başlığı yanlış. 2026'da laboratuvarların ve sahada ajan kuranların ortak görüşü şu: her iş için ayrı bir ajan yazıp bunları birbirine bağlamak yerine güçlü tek bir ajan çalışmalı ve her iş türünün bir klasörü olmalı. Bu klasörde talimat, dosyalar, kontroller ve düzeltme kaydı durur [1][2][3][4]. "Anthropic ajan kurmayı bıraktı" sözü ise yanlış. Anthropic, paralel araştırma, ayrı bağlam ve bağımsız denetim gereken yerlerde birden çok ajan kullanmaya devam ediyor [5][6][7][8]. "Ajan kendi işini kontrol etsin" de yetmiyor; ayrı bir denetçi gerekiyor [9][10][11]. (11 satır · 8 bağımsız kaynak)

## İddia parça parça

| İddia | Uzmanların söylediği | Hüküm |
|---|---|---|
| "Anthropic ajan kurmayı bıraktı" | Aralık 2025'teki konuşmanın sloganından geliyor. Anlamı "her alan için ayrı ajan yazmayı bıraktık, genel ajana skill veriyoruz" [1][2]. Nisan 2026'da Anthropic hâlâ ajan altyapısı kuruyor [8] (3 satır · 2 bağımsız kaynak) | Abartı |
| Tek genel ajan, iş başına bir klasör | OpenAI, LangChain ve Cognition'ın üçü de önce tek ajanla başlamayı söylüyor [3][4][12]. Skill açık standart oldu, OpenAI de benimsedi [13][14] (5 satır · 4 bağımsız kaynak) | Doğru |
| Vercel'de başarı %80'den %100'e çıktı | 5 soruda 4/5'ten 5/5'e çıkmış. İki sürüm de tek ajan; değişen, 17 özel araç yerine bash ve dosya kullanılması [15][16]. Vercel'in kendi sözü: "yalnız belgelerimiz zaten iyi olduğu için işe yaradı" [17] (3 satır · 1 bağımsız kaynak) | Gerçek ama dar |
| Ajan teslimden önce kendi işini kontrol etsin | Anthropic 2026: ajan vasat işi övüyor; ayrı ve şüpheci bir denetçi kurmak çok daha kolay [9][7]. Merkezî bir denetçi yoksa hata 17,2 kat büyüyor, varsa 4,4 kat [11] (3 satır · 2 bağımsız kaynak) | Eksik |
| Her düzeltme hatayı yapan dosyaya yazılsın | OpenAI: her elle düzeltme, ileride bir kontrole dönüşecek adaydır [18]. Anthropic: başarılı yollar ve yaygın hatalar skill'in içine işlenir [19] (2 satır · 2 bağımsız kaynak) | Doğru |
| Persona ("Sen kıdemli X'sin") | Doğruluğu güvenilir biçimde artırmıyor [20][21]. İlgisiz persona ayrıntısı doğruluğu 30 puana kadar düşürebiliyor [22]. Anthropic'e göre rol yalnız tonu belirler [23] (4 satır · 4 bağımsız kaynak) | Kimlik değil, yöntem ve bilgi taşır |

## Uzmanların ekledikleri

1. **Ayrı denetçi ve insan gözü.** Otomatik denetçiler, doğru görünen ama yanlış olan işi kaçırıyor; en iyisi hataların %87'sini yakaladı [24][25]. Kontrol geçti/kaldı biçiminde olur ve her hata türüne bir kontrol düşer. Kontrolleri, gerçek çıktılara bakarak işin ustası yazar [26][27][28]. (5 satır · 3 bağımsız kaynak)
2. **Kitabı seçmeyi modele bırakmamak.** Vercel'in 2026 ölçümünde skill, vakaların %56'sında hiç açılmadı. Her zaman yüklü kısa bir dizin %100 başarı aldı, açık talimatlı skill %79 [29][30]. Her seferinde tutması gereken kural koda, yani bir kancaya yazılır [31]. (3 satır · 2 bağımsız kaynak)
3. **Ölçek sınırı.** Ajana aynı anda gösterilen araç sayısı 30-50'yi geçince doğru aracı seçmesi bozuluyor [32]. Araçları gerektiğinde arayarak yüklemek, Opus 4'te seçimi %49'dan %74'e, Opus 4.5'te %79,5'ten %88,1'e çıkardı [33]. 58 araç, iş başlamadan yaklaşık 55 bin jeton harcatıyor [34]. Claude Code, skill listesini bağlamın %1'iyle sınırlıyor [35]. Seçimi asıl bozan rollerin sayısı değil, birbiriyle çakışması [36]. (5 satır · 4 bağımsız kaynak)
4. **Birden çok ajan nerede kazanır.** Paralel yürüyebilen geniş işte %80,8 kazanç, sıralı işte %39 ile %70 arası kayıp ölçüldü [37]. Tek ajan zaten %45'in üstündeyse ek ajanların kazancı kayboluyor [38]. Anthropic'in araştırma sistemi %90,2 daha iyi sonuç verdi ama yaklaşık 15 kat jeton harcıyor [5][6]. Kural: işi yazan tek ajan kalır, ötekiler yalnız akıl katar [39]. (5 satır · 3 bağımsız kaynak)

5. **Kitabı ajan değil, işin ustası yazar.** SkillsBench 1.1'de (Haziran 2026) uzmanların hazırladığı skill'ler çözüm oranını %33,9'dan %50,5'e çıkardı. Ajanın kendi yazdığı skill'ler ise hiç skill kullanmamaktan bile kötü sonuç verdi [40][41]. (2 satır · 1 bağımsız kaynak)
6. **Düzeltme önce ders olarak kaydedilir, kural olmak için onay ister.** Bunu ChatGPT'nin cevabı ekliyor: her düzeltmeyi kendiliğinden kitaba yazmak doğru talimatı da bozabilir. Önce hatanın sebebi bulunur, sonra bir deneme vakası yazılır, sonra en küçük değişiklik yapılır, test edilir ve sahibi onaylar. Kaydedilmiş bir ders ile onaylanmış bir kural ayrı şeylerdir.

Bu hükmü değiştirebilecek şey, yüzlerce skill arasından doğru olanın ne sıklıkla seçildiğinin ölçülmesiydi. Bu ölçüm Ekim 2026'da yapıldı ve sonuç hükmü güçlendiriyor. Kütüphaneye 1.000 ilgisiz skill eklenince, işe yarayan skill'in açılma oranı %73,6'dan %27,4'e düştü. Hiç skill açılmayan vakaların oranı %9,3'ten %51,6'ya çıktı. Skill'i işten önce ayrı bir adımda seçmek ise %73,9'u korudu [42]. Kısacası, yüzlerce rolde seçimi işin içinde modele bırakmak çöküyor; seçim işten önce yapılmalı. (1 satır · 1 bağımsız kaynak)

## ChatGPT tarafı

ChatGPT kendi araştırmasında aynı hükme vardı: iddia yön olarak doğru, ama "çok ajan devri bitti" diye okunursa yanlış.

- **İkimizin de bulduğu:**
  - Anthropic'in araştırma sistemindeki %90,2'lik fark ve 15 kat jeton maliyeti;
  - Google'ın ölçtüğü +%80,8 ve −%39 ile −%70 arası sonuçlar;
  - Vercel'in 5 soruluk denemesi ve 8 KB'lık dizinin %100'e karşı %79'u;
  - araç aramanın getirdiği artış;
  - personanın doğruluğa katkı yapmaması;
  - Cognition'ın "tek yazan, ayrı denetçi" düzeni.
- **Yalnız ChatGPT'nin bulduğu, kaynağında kontrol edilen:** SkillsBench 1.1 ölçümü [40][41], Ekim 2026 tarihli 1.000 ilgisiz skill ölçümü [42] ve Anthropic'in Agent Skills standardını Linux Vakfı'na bağlı Agentic AI Foundation'a bağışlaması [43]. Bağış Ekim 2026'da yapıldı; standardı ChatGPT, Cursor ve GitHub Copilot dahil 70'ten fazla platform kullanıyor. (4 satır · 3 bağımsız kaynak)
- **Yalnız bizim bulduğumuz:**
  - Anthropic'in 2026'daki "ayrı şüpheci denetçi" dersi;
  - Claude Code'un %1'lik skill sınırı ve "her seferinde tutması gereken kural kancaya yazılır" kuralı;
  - otomatik denetçilerin %87'lik tavanı.
- **Küçük çelişki:** SkillRouter'da skill'in gövdesi gizlenince yaşanan doğruluk kaybını bizim okuyucu 37-44 puan, ChatGPT 29-44 puan olarak aktardı. İkisi makalenin farklı sürümlerinden olabilir; bu fark hükmü değiştirmiyor.

## Bizde

- **İnşaat sistemimiz (dxb-team2) bu tarifin ta kendisi.** Tek lider oturum çalışıyor. Kapılar iş kitabı görevi görüyor; testler, batarya ve cetveller kontrol katmanı. Sol, temiz bağlamla çalışan kör bir denetçi. Düzeltmeler kapılara ve hafızaya yazılıyor. Yardımcılar yalnız paralel okuma yapıyor ve her dosyayı tek kişi yazıyor. Uzmanların 2026 tarifiyle birebir örtüşüyor; değiştirilecek bir şey yok.
- **Holdingin iskeleti de doğru yönde.**
  - Çalışanlar ayrı ayrı ve sürekli açık ajanlar değil. Tek bir motor (Agent SDK üzerindeki iş döngüsü) her görevde ilgili personayı dosyadan yüklüyor.
  - 213 persona dolapta dosya olarak duruyor ve gerektiğinde çağrılıyor. Uzmanların önerisi de tam bu [44]. (1 satır · 1 bağımsız kaynak)
  - Plandaki iş türü menüsü, her türün ustası ve rafın tek satırlık kartları (A26-A29) aynı yöntem. Üstelik iş türünü yönlendiricinin seçmesi, Vercel'in ölçtüğü %56'lık "skill hiç açılmadı" sorununu baştan çözüyor.
- **Ölçülen eksikler:**
  1. İş türü ustası olarak yazılmış persona dosyası sayısı 0. Hiçbir iş türünün "bitti" kontrolü yok.
  2. 202 reklam tarifinin hepsi aday durumunda, kabul edilen yok. Hükümleriniz ayrı bir dosyada duruyor ve tariflere geri işlenmiyor.
  3. Personalar 136 ile 211 satır arası uzunlukta ve ağırlıkla kimlik anlatıyor.
  4. Her koltuğa açılışta 23 ile 54 arası araç yükleniyor; bu, seçimin bozulduğu aralığın tam içi.
  5. Koltukların dosya ve komut satırı yok, hafıza bloğu boş, iş başına adım sınırı 12 ile 40 arası.

## Ne yapalım

1. **Her iş türüne bir iş kitabı (B64 v2, A27-A29).** Kitap ortak dolaptaki bir klasördür. İçinde `SKILL.md` (ne zaman kullanılır, girdiler, adımlar, kararlar, "bitti" kontrolleri, istisnalar), `files/` (betikler, şablonlar, başvuru dosyaları), `examples/` (sizin onayladığınız işler, başvuru olarak) ve `notes.md` (tarihli düzeltmeler) durur. Usta, kısa bir kimlik ile bu klasörden ibaret olur. Kitabı model seçmez, yönlendirici iliştirir.
2. **Kontroller sizin hükümlerinizden çıkar (A9).** Her reddiniz ilgili iş türünde bir geçti/kaldı kontrolüne dönüşür; örneğin "büyük ekranda çizgi film gibi", "ortam ürüne uymuyor". İşi yapan değil, temiz bağlamlı ayrı bir denetçi bu kontrolleri sizin gözünüzden önce koşar. Sizin hükmünüzle kontrolün hükmü yan yana kaydedilir. Bir iş türünde ikisi sürekli tuttuğunda, gözünüzü o türden kaldırmanın dayanağı bu kayıt olur.
3. **Personalar kısalır (C41).** Kimlik tonu taşır; asıl içerik kitaba geçer, ilgisiz ayrıntı atılır.
4. **Araçlar gerektiğinde yüklenir ve koltuk bir çalışma tezgâhı alır (B41).** Tezgâh, iki duvar arkasında dosya ve komut satırı demek; 4 Ekim emriniz bu.
5. **Kitabı ustası yazar, düzeltme onayla kurala döner.** Bir ders önce kaydedilir; ancak sizin ya da işin sahibinin onayıyla kitapta kurala dönüşür. Bu, holdingin "hafıza notu kanun değildir" ilkesiyle aynı.
6. **Ölçerek büyütülür.** Aynı işler dört düzende denenir: kitapsız, kitap elle verilerek, kitabı yönlendirici seçerek ve buna ek olarak ayrı bir denetçiyle. Karar, kabul edilen iş başına maliyete bakılarak verilir.
7. **İnşaat sistemi olduğu gibi kalır.**

## Kaynaklar

1. **Barry Zhang, Keith Lazuka, Mahesh Murag** · 2025-10-16 · web — “Skills extend Claude's capabilities by packaging your expertise into composable resources for Claude, transforming general-purpose agents into specialized agents that fit your needs.” — https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

2. **Barry Zhang, Keith Lazuka, Mahesh Murag** · 2025-10-16 · web — “Instead of building fragmented, custom-designed agents for each use case, anyone can now specialize their agents with composable capabilities by capturing and sharing their procedural knowledge.” — https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

3. **OpenAI** · 2025-04 · web — “Our general recommendation is to maximize a single agent's capabilities first.” — https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf

4. **Sydney Runkle (LangChain)** · 2026-01-14 · web — “Start with a single agent and good prompt engineering. Add tools before adding agents. Graduate to multi-agent patterns only when you hit clear limits.” — https://www.langchain.com/blog/choosing-the-right-multi-agent-architecture

5. **Jeremy Hadfield, Barry Zhang et al.** · 2025-06-13 · web — “a multi-agent system with Claude Opus 4 as the lead agent and Claude Sonnet 4 subagents outperformed single-agent Claude Opus 4 by 90.2% on our internal research eval.” — https://www.anthropic.com/engineering/multi-agent-research-system

6. **Jeremy Hadfield, Barry Zhang et al.** · 2025-06-13 · web — “agents typically use about 4× more tokens than chat interactions, and multi-agent systems use about 15× more tokens than chats.” — https://www.anthropic.com/engineering/multi-agent-research-system

7. **Prithvi Rajasekaran** · 2026-03-24 · web — “tuning a standalone evaluator to be skeptical turns out to be far more tractable than making a generator critical of its own work” — https://www.anthropic.com/research/harness-design-long-running-apps

8. **Lance Martin, Gabe Cemaj, Michael Cohen** · 2026-04-08 · web — “We've also shown that task-specific agent harnesses excel in narrow domains.” — https://www.anthropic.com/engineering/managed-agents

9. **Prithvi Rajasekaran** · 2026-03-24 · web — “When asked to evaluate work they've produced, agents tend to respond by confidently praising the work—even when, to a human observer, the quality is obviously mediocre.” — https://www.anthropic.com/research/harness-design-long-running-apps

10. **Anthropic Engineering** · 2026-03-24 · web — “Out of the box, Claude is a poor QA agent.” — https://www.anthropic.com/engineering/harness-design-long-running-apps

11. **Kim et al. (Google Research, Google DeepMind, MIT)** · 2025-12 · web — “architectures without centralized verification tend to propagate errors more than those with centralized coordination.” — https://arxiv.org/abs/2512.08296

12. **Walden Yan (Cognition)** · 2025-06-12 · web — “The simplest way to follow the principles is to just use a single-threaded linear agent” — https://cognition.ai/blog/dont-build-multi-agents

13. **Simon Willison** · 2025-12-12 · web — “It turns out OpenAI are doing exactly that, with skills support quietly showing up in both their Codex CLI tool and now also in ChatGPT itself.” — https://simonwillison.net/2025/dec/12/openai-skills/

14. **Simon Willison** · 2025-12-19 · web — “OpenAI [have added Skills to the Codex documentation]” — https://simonwillison.net/2025/Dec/19/agent-skills/

15. **Andrew Qu (Vercel)** · 2025-12-22 · web — “We benchmarked the old architecture against the new file system approach across 5 representative queries.” — https://vercel.com/blog/we-removed-80-percent-of-our-agents-tools

16. **Andrew Qu (Vercel)** · 2025-12-22 · web — “We deleted most of it and stripped the agent down to a single tool: execute arbitrary bash commands.” — https://vercel.com/blog/we-removed-80-percent-of-our-agents-tools

17. **Andrew Qu (Vercel)** · 2025-12-22 · web — “This only worked because our semantic layer was already good documentation.” — https://vercel.com/blog/we-removed-80-percent-of-our-agents-tools

18. **Dominik Kundel, Gabriel Chua (OpenAI)** · 2026-01-22 · web — “is a candidate for a future eval, so you can lock in the intended behavior before evaluating at scale.” — https://developers.openai.com/blog/eval-skills

19. **Anthropic Engineering** · 2025-10-16 · web — “ask Claude to capture its successful approaches and common mistakes into reusable context and code within a skill” — https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

20. **Zheng, Pei, Logeswaran, Lee, Jurgens** · 2024-10-09 · web — “adding personas in system prompts does not improve model performance across a range of questions compared to the control setting where no persona is added” — https://arxiv.org/abs/2311.10054

21. **Basil, Shapiro, Shapiro, Mollick, Mollick, Meincke (Wharton GAIL)** · 2025-12 · web — “Expert personas showed no consistent benefit across models, with few exceptions.” — https://arxiv.org/pdf/2512.05858

22. **Araujo, Röttger, Hovy, Roth** · 2025-08-27 · web — “models are highly sensitive to irrelevant persona details, with performance drops of almost 30 percentage points” — https://arxiv.org/abs/2508.19764

23. **Anthropic docs** · 2026-11-08 · web — “Setting a role in the system prompt focuses Claude's behavior and tone for your use case.” — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices

24. **Antaripa Saha, Hamel Husain** · 2026-09-02 · substack — “The best recovered 87 percent of failures flagged by humans.” — https://hamelhusain.substack.com/p/do-automated-evals-work

25. **Antaripa Saha, Hamel Husain** · 2026-09-02 · substack — “Fully automated approaches always failed to catch interactions that "looked correct" but fell short of providing a great user experience.” — https://hamelhusain.substack.com/p/do-automated-evals-work

26. **Hamel Husain, Shreya Shankar** · 2025-20 · web — “Binary evaluations force clearer thinking and more consistent labeling.” — https://hamel.dev/blog/posts/evals-faq/

27. **Hamel Husain, Shreya Shankar** · 2025-20 · web — “Outsourcing [error analysis](#q-why-is-error-analysis-so-important-in-llm-evals-and-how-is-it-performed) is usually a big mistake” — https://hamel.dev/blog/posts/evals-faq/

28. **Hamel Husain** · 2024-10-29 · web — “Step 1: Find *The* Principal Domain Expert” — https://hamel.dev/blog/posts/llm-judge/

29. **Jude Gao (Vercel)** · 2026-01-27 · web — “In 56% of eval cases, the skill was never invoked.” — https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals

30. **Jude Gao (Vercel)** · 2026-01-27 · web — “A compressed 8KB docs index embedded directly in `AGENTS.md` achieved a 100% pass rate, while skills maxed out at 79% even with explicit instructions telling the agent to use them.” — https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals

31. **Anthropic docs** · 2026-11-08 · web — “**Claude skipped a rule that must hold every time**: move the rule into a [hook](/docs/en/hooks-guide).” — https://code.claude.com/docs/en/skills

32. **Anthropic (Claude docs)** · tarih yok · web — “Claude's ability to pick the right tool degrades once you exceed 30–50 available tools.” — https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool

33. **Anthropic Engineering** · 2025-11-24 · web — “Opus 4 improved from 49% to 74%, and Opus 4.5 improved from 79.5% to 88.1% with Tool Search Tool enabled.” — https://www.anthropic.com/engineering/advanced-tool-use

34. **Anthropic Engineering** · 2025-11-24 · web — “That's 58 tools consuming approximately 55K tokens before the conversation even starts.” — https://www.anthropic.com/engineering/advanced-tool-use

35. **Anthropic (Claude Code docs)** · tarih yok · web — “The budget scales at 1% of the model's context window.” — https://code.claude.com/docs/en/skills

36. **OpenAI** · tarih yok · web — “more than 15 well-defined, distinct tools while others struggle” — https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf

37. **Kim et al. (Google Research, Google DeepMind, MIT)** · 2025-12 · web — “Relative performance change compared to single-agent baseline ranges from +80.8% on decomposable” — https://arxiv.org/abs/2512.08296

38. **Kim et al. (Google Research, Google DeepMind, MIT)** · 2025-12 · web — “(1) a coordination yields diminishing returns once single-agent baselines exceed” — https://arxiv.org/abs/2512.08296

39. **Walden Yan (Cognition)** · 2026-04-22 · web — “multi-agent systems work best today when writes stay single-threaded and the additional agents contribute intelligence rather than actions.” — https://cognition.com/blog/multi-agents-working

40. **SkillsBench** · 2026-06 · web — “curated Skills raise mean resolution rate from 33.9% to 50.5% (+16.6 points)” — https://www.skillsbench.ai/blogs/skillsbench-1-1

41. **SkillsBench** · 2026-06 · web — “In these runs, self-generated Skills are below the no-Skills baseline; curated Skills are above it.” — https://www.skillsbench.ai/blogs/skillsbench-1-1

42. **Liu, Chen, Zhang** · 2026-10 · web — “With 1,000 irrelevant skills, loaded-skill recall falls from 73.6% to 27.4% and the zero-load rate rises from 9.3% to 51.6%, whereas explicit selection from the same library retains 73.9% recall.” — https://arxiv.org/abs/2610.18522

43. **Anthropic** · 2026-10-22 · web — “Today, we're donating [Agent Skills](https://agentskills.io/home), the open standard that gives AI agents specialized knowledge and workflows, to the Agentic AI Foundation (AAIF).” — https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation

44. **Anthropic Engineering** · 2025-10-16 · web — “it provides just enough information for Claude to know when each skill should be used without loading all of it into context” — https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
