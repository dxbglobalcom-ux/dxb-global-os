I have enough primary material now to compile my lane's report.

## A) WHAT I READ
- **Ground sweep dosyaları (github-issues, github-repos, stackoverflow) boştu** (`[]`, 3-4 byte) — sweep'in genel sorgusu bu soruyu yakalamamış. Bu yüzden kendi sorgularımı `gh search issues` ile attım.
- **michaelpaulrattray/Drape#513** — "The reviewer court": Fable 5.1 ve GPT-6 Astra, aynı 10 birleştirilmiş PR üzerinde, aynı `REVIEWER_CHARTER.md` promptuyla, insan elle her bulguyu kodda doğrulayarak karşılaştırılmış. 3 yorum, tam skor tablosu okundu (~3.500 kelime).
- **anthropics/claude-code#93894** — gerçek geliştirici şikayeti (Todd Leonhardt, ekran görüntülü) + 1 yorum, Fable 5.1'in `/code-review high` bütçesini bitirip tamamlanamadığını, Astra'nın (Codex CLI) aynı işi bütçenin %1'inde bitirdiğini anlatıyor.
- **pollography/the-random-maker-theory#7, #9, #14** — otomatik içerik-radar issue'ları (Almanca), YouTube/blog kaynaklarına işaret ediyor ama kendisi geliştirici görüşü değil, editoryal iş takibi.
- **Entelligence-AI/code_review_evals#3** — ilişkili ama farklı model çifti (Luna vs Astra), sadece bağlam.
- WebSearch: `site:stackoverflow.com` sorgusu **sıfır sonuç** verdi — Stack Overflow'da bu iki modeli karşılaştıran soru yok.

## B) THE COUNT (n=1 gerçek baş-başa kod-review testi + 1 gerçek geliştirici şikayeti)
Drape#513 skor tablosu (n=9 PR, tek bağımsız test):
- **Astra: 6 bulgu → 4 gerçek, 2 uydurma** (5 temiz geçiş)
- **Fable: 1 bulgu → 1 gerçek, 0 uydurma** (8 temiz geçiş, ayrıntılı notlarla)
- Her iki taraf da diğerinin kaçırdığı **gerçek bir kusuru** buldu.
- Maliyet: Astra $13.48 (liste fiyatının 1.07–2.46×'i); Fable abonelik içinde (~kapasitenin %10'u).
- Hız: **Astra 6.8–25.4 sn/review; Fable 3dk1sn–6dk43sn** (~15× daha hızlı Astra).
- Kurucunun nihai kararı: **"Keep ours, change nothing"** — Fable reviewer olarak kalıyor.

## C) THE VOICES
1. **michaelpaulrattray** (Drape#513, kurucu, 2026-09-13): *"Keep ours, change nothing"* — *"his eye on the scoresheet decides; a benchmark claim decides nothing."*
2. **michaelpaulrattray** (aynı issue): *"Astra 6.8–25.4 s per review; Fable 3m 1s – 6m 43s — ~15× faster... Astra names its own limits every time, which is honest and is also the shape of what it misses."*
3. **tleonhardt** (claude-code#93894, 2026-09-12): *"My experience with OpenAI and Astra in this regard is infinitely superior... This is a horrible customer experience."*
4. **tleonhardt** (aynı issue): *"This same problem does NOT exist when using Opus 5 for `/code-review high` instead of using Fable 5.1"* — yani sorun Fable'a özgü, Claude ailesine değil.
5. **tb454** (claude-code#93894 yorumu, 2026-09-12): *"over half my usage is in adversarial review of what claude thought it fixed... this is an unhealthy unstable platform"* — aşırı öfkeli/abartılı bir yorum, dikkatli okunmalı (dava tehdidi, "HIPAA" gibi konu dışı iddialar içeriyor — güvenilirliği düşük tek bir kullanıcı sesi).
6. **Drape#513 court kaydı**: *"Astra rediscovered it [a known bug] from the diff alone with no sight of the queue. Neither reviewer missed it."*
7. **Drape#513**: *"❌ invented — #864 'missing capability-atlas entry'... Fable checked this explicitly"* — Astra'nın uydurma bulgu ürettiği somut örnek.

## D) CLOSED DOORS
- **Stack Overflow** — hem ground-sweep dosyası (`stackoverflow.raw` = boş `[]`) hem kendi WebSearch sorgum sıfır sonuç verdi. Kapalı: bu konuda SO trafiği yok (beklenen — SO ürün karşılaştırması için kullanılan bir platform değil).
- **GitHub code search (gh search code)** denenmedi — zaman bütçesi ayrıldı, `gh search issues`/`gh search prs` + WebSearch yeterli malzeme getirdi.

## E) DISTINCT PEOPLE
**3 ayrı insan:** michaelpaulrattray (Drape kurucusu, elle doğrulanmış test), tleonhardt (claude-code kullanıcısı), tb454 (aynı thread'de destek yorumu).

## F) WHAT WOULD FLIP IT
Drape#513'ün kendisi bunu zaten yazmış: **uzun bağlam testi (#872, ~345k token) hiç çalışmadı** — bakiye yetmedi. Kurucunun notu: *"Long context degrades reading, so carrying whole 600 KB files may hurt Astra on exactly those two [outlier PR'lar]."* Eğer o iki büyük PR'da Astra çökerse, "6 gerçek bulgu / 2 uydurma" oranı daha kötüye dönebilir — bu yüzden bulgu şu an **eksik veri üzerine** kurulu, tam sonuç değil. Ayrıca n=1 karşılaştırma (tek repo, 9 PR) — büyük ölçekli/çoklu-dil bir tekrar test bu sonucu kolayca tersine çevirebilir.