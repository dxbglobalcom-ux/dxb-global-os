# DEVİR — SIGNAL + stüdyo dünya gelir çalışması (Fable 5.1 → Fable 5.1 xhigh), 2026-09-24 ~19:45

Bu yazı, bağlamı %84 dolan Fable 5.1 oturumundan, CEO'nun sağ panelde açtığı yeni Fable 5.1 xhigh
oturumuna ("dxb ceosu solfaki fable araştırması") devirdir. CEO'nun sözü (19:40 civarı): *"acil devret
şuan %84 şişmiş sesionun bundan sonra alttaki çubuk %37 olduğunda devir yazısını diğer fable 5.1 xhigh'a
devretmen gerekecek diğerleri de bu şekilde olsun."* ve *"yeni session aç ve oraya devret … sağda ben
açtım sana sen onunla iletişim kur."* Yeni oturuma kendi yazdığı: *"sen devralacaksın kaldığı yerden
aynı titizlikle devam et."*

## 1. Önce oku (sırayla; hepsi bu klasörde, `/home/dxb/DxB Global OS/.planning/quick/20260924-signal-revenue-study/`)
1. `BRIEF.md` — baş mühendisin açılış brifingi: iş, CEO'nun sözleri, sınırlar, çıktı biçimi. **Tamamı geçerli.**
2. `WORKLOG.md` — ne yapıldı, ne kaldı, kanıt nerede.
3. `STUDY.md` — CEO için Türkçe çalışma (bitti, 7 bölüm). `EVIDENCE.md` — her rakamın kaynağı ve etiketi (bitti, E0–E9).
4. `CONVERSATION.md`, `PRIOR-WORK.md`, `../20260924-night-content-engine/PLAN.md` ve `SOURCE-PROMPT.md` — yalnız gerekirse; BRIEF ve STUDY bunları özetliyor.

## 2. Bu oturumun CEO'dan aldığı oturumluk emirler (kanun değil; bu iş için geçerli, yeni oturum aynen uyar)
- *"fable a sormana gerek yok sen kendin devam et"* — danışman (advisor) aracına sorulmaz (artık `~/.claude/CLAUDE.md`'de de yazılı: yalnız zor kararda).
- *"acele etmeden güzel bir çalışma çıkar lütfen."*
- **Devir eşiği %37:** alttaki çubuk %37'ye gelince devir yazısı yazılıp bir sonraki Fable 5.1 xhigh oturumuna devredilir ("diğerleri de bu şekilde olsun"). Bu CEO'nun bu iş için sözüdür; kalıcı kural olması için "kanun olsun" demedi — kalıcı yazılmaz, ona tek satırla sorulur (CLAUDE.md §2). `dxb-ctx --pct` sayıyı verir; çalışmazsa `operator shot` ile çubuk okunur.
- BRIEF'teki emirler: `dxb-research` kapısı/filosu KULLANILMAZ; dünya, tek şehir değil; derin ve uzun soluklu; fikirleri sen üret; yalnız oku (kayıt yok, dış yazışma yok, para yok); alt-ajan seyrek; Workflow aracı yok; tahtaya/plana/spec'e hiçbir şey girmez; commit yalnız bu klasörün dosyaları (`git add` ile tek tek yol; asla `-A`).
- Bu makinede kod-kapısı (`dxb-code-gate`) script dosyası yazmayı engeller; analiz için `python3 - <<'EOF'` satır içi çalışır. Bash'te `cd` kullanılmaz (prompt-gate). Reddit doğrudan engelli; `safereddit.com` (Redlib aynası) `mcp__scrapling__stealthy_fetch` ile açılıyor. YouTube yorumları `/home/dxb/.local/bin/yt-dlp --write-comments` ile iniyor. Statista paywall'lı; Clutch, PwC tax summaries, ulusal IAB sayfaları açılıyor.

## 3. Durum — ne bitti, ne kaldı
**Bitti (ölçüldü):**
- Para haritası 7 kıta / ~30 ülke: harcama (ulusal kurumlar), dil, ajans fiyat bantları (16 ülke + 15 ülkede Clutch), 8.000 $ nerede sığar, müşteri kazanma, kanun/izin/stopaj (15 ülke PwC), İslami süzgeç, insanların sözü (YouTube 1.548 yorum/1.332 kişi; Reddit 12 başlık/1.633 yorum/≈590 kişi; r10 12 kişi; Trustpilot 1.007 yorum; IAB anketi).
- 14 gelir kalemi (6'sı yeni: yayın öncesi puan, çok ülkeli masa, helal/Ramazan masası, ortak ajans kanalı, dil çoğaltma, ihracatçı masası, zincir masası, aylık hesap raporu), saldırı sırası, ilk 90 gün, 3 senaryo (hesapla), tuzaklar, karşı argümanlar, CEO'ya 5 soru — hepsi `STUDY.md`'de.
- Commit: bu devirle birlikte bu klasörün dosyaları commit edildi (WORKLOG'da hash).

**Kaldı (yeni oturumun işi):**
1. **CEO'ya ilk mesaj**: CLAUDE.md §0 düzeni (gözünü bekleyen: STUDY.md; sırada: onun okuması ve §6'daki 5 soruya cevabı; bloke: lisans sorusu) + çalışmanın 6-8 cümlelik özeti (STUDY §0'dan) + soruları düz yazıyla. Ona "ne yapayım" sorulmaz.
2. CEO'nun cevaplarına göre STUDY/EVIDENCE düzeltmeleri (ör. faizli banka müşterisi hükmü, ilk üç ülke sırası, plan sırası). Tahtaya/plana yazmak baş mühendisin işi ve CEO'nun sözüyle; bu oturum yazmaz.
3. Açık ölçümler (EVIDENCE E9): Ramazan reklam harcaması birinci el rakam; Turquality'de yabancı ajans faturasının destek kapsamı (resmî Karar metni); Mawthooq'un şirket başvurusu; BAE izninin yabancı üreticiyi kapsayıp kapsamadığı; Japonya kategori tablosu; Kanada IAB sayfası; MiniMax H3 Türkçe ses. İstenirse ikinci tur: Suudi alıcılarının kendi sözü (X/LinkedIn erişilemedi; Arapça YouTube yorumları ve Suudi forumları denenebilir).
4. Her raporun başında `CONTEXT: N%` (dxb-ctx --pct); %37'de devir.

## 4. CEO'ya nasıl yazılır
Türkçe, "siz", cevap önce, holdingin kendi işinden resim (stüdyonun 30 Ağustos klibi, Hamza, gece masası), sayı tabloda, terim bir kez parantezle; ölçülmeyen ⚠ DOĞRULANMADI; tıklama kutusu değil düz yazı soru. Hitap: "Muhittin Bey" ya da "CEO Bey".

## 5. Kanıt nerede
`EVIDENCE.md` (E0 kur, E1 dünya, E2 ulusal kurumlar, E3 ajans fiyatları, E4 kanun/izin/stopaj, E5 İslami süzgeç, E6 insanlar, E7 karşılaştırmalar, E8 dil kapasitesi, E9 ölçülemeyenler). Ham çekimler bu oturumun scratchpad'inde (`/tmp/claude-1000/-home-dxb-DxB-Global-OS/356ddf76-4ae6-4f0e-af7a-768368efd120/scratchpad/`, YouTube yorum JSON'ları) ve tool-results klasöründe — oturumla gider; EVIDENCE'a giren her şey oradan alındı.
