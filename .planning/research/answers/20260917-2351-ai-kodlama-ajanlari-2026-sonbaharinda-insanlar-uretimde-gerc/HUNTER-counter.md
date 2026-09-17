## RAPOR — KARŞI-VAKA (Neden bırakılıyor / neden şüpheyle bakılıyor)

**A) OKUDUKLARIM**

Zemin taramasından (ground/ground-2/ground-3, 3 tekrar) kendi hattım için gerçek sinyal taşıyan kanallar:
- **exa.raw** (ground) — 8 tam makale/analiz okudum (~350 satır): omeronal.com, hypergpt.ai, hardwaremania.com, teknolojigo.com.tr, sukruyusufkaya.com, pasqualepillitteri.it, codevelocity.academy — hepsi tam metin.
- **lobste.rs** (ground-2/pages/03-lobste.rs.md) — arXiv makalesi (Cursor difference-in-differences çalışması) + 2 yorum, tam okundu (Sietsebb, mitsuhiko).
- **v2ex.com** (ground-2/pages/06-v2ex.com.md) — tlanyan'ın 2025 AI-kodlama yıl-sonu blog yazısı, tam metin (~1 sayfa, Cursor/Claude Code/Codex arası geçiş hikâyesi dahil), 20 yanıtlı thread.
- **zhihu.com** (ground-2/pages/07-zhihu.com.md) — "摩卡摩" imzalı haber-yorum bülteni, SlopCodeBench bölümü tam okundu.
- **reddit.raw** (ground) — 604 satır grep'le tarandı; Cursor/Windsurf/Codex geçen tek gerçek içerik 2024 tarihli eski bir Windsurf-vs-Cursor karşılaştırma yeniden-postu, benim hattıma (terk/pişmanlık) katkısı yok.
- **quora.com** (ground-3/pages/05-quora.com.md) — arama sorgum için "couldn't find any more results", sadece çerez duvarı döndü.

**B) SAYIM (n=)**

Doğrudan "terk ettim / bıraktım / geri döndüm" diyen **birincil ağızdan** kaynak sayısı çok düşük: **n=1** (tlanyan, v2ex). Buna karşılık **dolaylı/kurumsal kanıt** (araştırma + saha verisi) bolca var:
- Pilot→üretim geçiş oranı: **%11-14** (Gartner/McKinsey/S&P bileşik), kalanı **%86-89** takılıyor (hardwaremania.com, sukruyusufkaya.com).
- İptal edilen agentic projelerde maliyet, tahminin **2-3 katı**.
- Otomatik değerlendirmesi olmayan agent'larda geri-alma (rollback) oranı **%47**; tam kapsamlı değerlendirmesi olanlarda **%9**.
- DORA: mühendislerin **~%30'u** AI-üretimi koda az/hiç güvenmiyor.
- GitClear (623M değişiklik, 2023-2026): kopyala-yapıştır kodun payı **%15,7**'ye çıktı (taşıma/refactor **%3,8**'e düştü) — yani düzenlemekten **~5 kat** fazla kopyalama.
- SlopCodeBench (Humanlayer, 2026-07-25): Opus 5, 17 kontrol noktasından yalnızca **4'ünü (%24)** geçti; kodun **%93'ü** en az bir "şişkinlik" kuralını tetikledi.

**C) SESLER (verbatim, isim + tarih)**

1. **tlanyan** (v2ex, blog, 2026 yıl-sonu yazısı): *"因为个人还是习惯看代码和 review 代码，Claude Code 虽说可以连接 IDE 使但总觉得不方便... 另外一个原因是 Anthropic 的 CEO 对中国有很大偏见和敌意，现在 GPT Codex 的能力上来了，也就用得少了。"* — (Claude Code'u IDE'ye bağlasa da rahatsız buluyor, Anthropic CEO'sunun Çin'e önyargılı olduğunu düşünüyor, Codex güçlenince Claude Code'u daha az kullanmaya başladı.)
2. **tlanyan**, somut arıza örneği: *"让 AI 写 MPI 并行时的稀疏矩阵转置... 在 MPI 多进程并行的情况下还是卡死"* — (MPI paralel seyrek matris transpozunda Cursor ve Claude Code'un kotasını bitirdi, yine de kilitlendi/donduı.)
3. **tlanyan**, performans vakası: *"让 AI 帮忙分析可能的性能提升点，Cursor 和 Claude Code 说的条条是道，交付出来的代码一运行，比优化前还慢了"* — (Cursor ve Claude Code performans önerisinde kulağa çok mantıklı geldi, ama teslim edilen kod optimizasyon öncesinden daha yavaş çalıştı.)
4. **Sietsebb** (lobste.rs, 2025-11-18, arXiv özetini paylaşırken): *"We find that the adoption of Cursor leads to a significant, large, but **transient** increase in project-level development velocity, along with a significant and **persistent** increase in static analysis warnings and code complexity... acts as a major factor **causing long-term velocity slowdown**."*
5. **mitsuhiko** (lobste.rs, 2025-11-18): *"I routinely come across repositories on GitHub now that are entirely AI generated, some of them very obviously so. Many of those are unlikely to last very long given the low quality... I'm incredibly curious to see when the first studies cover Claude Code and similar modern agentic tools."*
6. **摩卡摩** (zhihu bülten yazarı, 2026-07-29, SlopCodeBench yorumu): *"AI能完成一次编程任务，不代表它能长期维护好一个项目... AI每改一次，都可能带来新的问题... 简单地说，AI负责加速，人仍然要负责质量。"* — (AI bir görevi tamamlayabilir ama bir projeyi uzun vadede iyi bakımda tutamaz; her değişiklik yeni sorun getirebilir; AI hız katar, kaliteden hâlâ insan sorumludur.)
7. **Ömer Önal** (omeronal.com, saha danışmanlığı notu, 2026-06-26): *"20-200 dev'li ekiplere AI codegen rollout danışmanlığında gözlemlediğim en kritik hata, 'her dev hangi aracı isterse kullansın' yaklaşımı. Üç ay sonra dev'ler farklı modeller, farklı prompt patterns, farklı IDE kullanıyor — code review tutarsızlığı patlıyor, knowledge transfer çöküyor."*
8. **Pasquale Pillitteri** (pasqualepillitteri.it, 2026-09-07): *"Bu kontrolleri kesenler şimdi birkaç gün kazanıyor, altı ay sonra çok daha fazlasını kaybediyor, çoğalan hatalar, güvenlik açıklarıyla, artık kimsenin açıklayamadığı kod arasında."*

**D) KAPALI KAPILAR**

- **Reddit** (r/ClaudeAI, r/cursor gibi hedef subreddit'ler) — zemin taraması Türkçe/genel sorguyla geldiği için tekrar-postlanmış 2024 tarihli eski bir Windsurf-Cursor karşılaştırması dışında hattıma malzeme getirmedi; taze bir Reddit araması bu oturumda tekrar açılmadı (ground'daki dosya zaten "okundu" sayıldı, tekrar sorgu = zemin kuralına aykırı olurdu).
- **Quora** — arama sorgum ("claude code vs codex vs cursor production experience 2026") için Quora kendi motoruyla *"We couldn't find any more results"* dedi; sayfa esasen çerez-izin duvarına düştü, gerçek cevap alınamadı.
- **Hacker News, GitHub Issues, V2EX (doğrudan), Juejin (doğrudan)** — bu üç round'da (ground/ground-2/ground-3) ilgili .raw dosyaları 0-4 bayt, yani sorgu boş döndü; sistem "via-linux-do" / "via-hackernews" yedek kanallarını denemiş, onlar da 4 bayt (boş) döndü — iki kapı da kapalı.
- **Twitter/X** — genel AI gündemi (Jev, Dario Amodei "pace the frontier", güvenlik olayları) baskın; "Claude Code'u bıraktım/Cursor'a geçtim" tarzı birincil-ağız şikâyet bulunamadı, dolayısıyla bu kanal hattım için kapalı sayılır.

**E) OKUNAN AYRI İNSAN SAYISI**

**6** (tlanyan, Sietsebb, mitsuhiko, Ömer Önal, Şükrü Yusuf Kaya, Pasquale Pillitteri) — kendi imzalı, kendi cümleleriyle yazdıkları metinleri tam okudum. Bunun dışındaki rakamlar (Gartner/DORA/GitClear/Deloitte anketleri) toplu istatistik, tek tek kişi sayılmıyor.

**F) NEYİ ÇEVİRİRDİ**

En kırılgan nokta: elimdeki karşı-kanıtın büyük kısmı **kurumsal/akademik saha verisi** (pilot→üretim uçurumu, kod şişmesi, güven düşüklüğü) — bunlar "araç kötü" demiyor, "disiplinsiz devreye alma kötü" diyor. Gerçekten çeviren şey, **isim-tarihli, "Claude Code'u X ayında bıraktım, Y aracına geçtim, çünkü Z" diyen çok sayıda bağımsız mühendis ifadesi** olurdu — bunu aradım (Reddit r/ClaudeAI, HN "Ask HN: which agent") ama zemindeki dosyalar bu spesifik sorguyla boş/kapalı döndü. tlanyan tek somut birincil-ağız örnek; onun gerekçesi de teknik değil kısmen jeopolitik (Anthropic CEO'sunun Çin'e önyargılı olduğu algısı) ve kota kısıtlaması — bu, "araç teknik olarak yetersiz" tezinden ziyade "sağlayıcı güvenilirliği/erişim politikası" temelli bir terk nedeni. Karşı-vaka şu an **istatistiksel olarak güçlü ama anekdot olarak zayıf**; bu fark giderilene kadar iddia temkinli sunulmalı.