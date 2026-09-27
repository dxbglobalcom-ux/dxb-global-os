# JEV (TypeSafe Jev) — Negative Evidence & Critical Findings

Toplama tarihi: 2026-09-23. Kimlik doğrulandı: Jev = TypeSafe AI'nin "System One" tipli karar modeli
(jevtypesafeai.com, OpenRouter typesafe/jev-1.13). Bu dosya SADECE eleştirel/olumsuz/sınırlayıcı
kanıtları toplar — övgü/pozitif claim'ler jev-community.md ve resmi kaynaklarda.

---

## 1. Stratejik karar kalitesi — poker deneyi (CONFIRMED, tek kaynak)

- **Kaynak:** "Typesafe's Jev is the fish at the poker table" — backnotprop, 2026-09-17
  https://backnotprop.com/blog/jev-poker/ (HN: https://news.ycombinator.com/item?id=49745212, 2 puan, 1 yorum)
- **Kaynak tipi:** INDEPENDENT / bireysel blog, kod + solver karşılaştırması var (methodology şeffaf)
- **İddia:** En iyi eli tutarken (nuts, K♦10♦ on Q♠9♦4♠J♥) Jev %62 ihtimalle all-in yaptı, oysa
  solver %100 "check" diyor — temel stratejik hata.
- **Kalibrasyon sorunu:** Güven skorları (all-in için %59-65 aralığı) el gücünden bağımsız olarak
  yapay şekilde sabit kaldı → belirsizlik ölçümü (uncertainty quantification) zayıf.
- **30 spot'ta solver kararlarıyla sadece %63 eşleşme** — finansal/yüksek-stake kararlar için yetersiz.
- **Yazarın notu:** "TypeSafe skipped published evals in this release" — yayınlanmış eval yok,
  bu da naif entegrasyonların baseline'sız yapılmasına yol açıyor.
- **Güç:** Tek kaynak, düşük HN puanı (2), ama methodology (solver karşılaştırması) ciddi. Reprodüksiyon yok.
- **Sınıflandırma:** UNVERIFIED (tekrarlanmamış) ama COMMUNITY OBSERVATION olarak güçlü metodoloji.

---

## 2. Görsel/vision sınırlaması + sınıflandırma bias — çizim deneyi (CONFIRMED, resmi doküman + bağımsız test)

- **Kaynak:** "TypeSafe's Jev Can't See. I Made It Guess What I Drew Anyway" — mikulskibartosz.name, 2026-09-19
  https://mikulskibartosz.name/typesafe-jev-guess-what-i-drew (HN: 49768633, 3 puan)
- **Resmi doküman doğrulaması:** "images, audio, and video are not supported yet" (TypeSafe'in kendi
  limitations listesinde) — bu VENDOR CLAIM değil, VENDOR-ACKNOWLEDGED LIMITATION.
- **TypeSafe'in kendi yayınladığı zayıflık listesi:** sayısal veride zorlanma, hex renk yakınlığı
  karşılaştırmasında zorlanma, kelime-bazlı görevlerde sayı-bazlı görevlerden daha iyi.
- **Deney:** Google Quick, Draw! setinden 400 el çizimi, SVG koordinat metnine çevrilip 10 kategoriden
  sınıflandırma istendi.
- **Sonuçlar (tablo):**
  | Setup | Accuracy |
  |---|---|
  | Jev + SVG koordinat metni | ~%35 |
  | Jev + base64 PNG metni | ~%9 (rastgele tahminle eşdeğer) |
  | Claude Sonnet 5 + gerçek görsel | ~%91 |
  | Claude Sonnet 5 + aynı SVG | ~%57 |
- **Kritik bulgu:** Jev 400 çizimden 200+'sine (**%52**) "airplane" cevabı verdi — uçakta %85 doğruluk,
  kedide %0 → dengesiz/yanlı sınıflandırma, gerçek "anlama" değil.
- **Sınıflandırma:** INDEPENDENTLY VERIFIED (deney + kod, tekil ama şeffaf) + VENDOR-ACKNOWLEDGED (vision desteklenmiyor).

---

## 3. Dil/uzunluk sınırlaması — İngilizce dışı performans (INDEPENDENT, tek kaynak ama nicel)

- **Kaynak:** "An early-access test of TypeSafe's Jev: calibrated judgments for half a cent" — lindfors.no, 2026-09-18
  https://lindfors.no/blog/a-first-look-at-typesafes-jev/ (HN: 49752426, 1 puan)
- **Bulgu:** İngilizce dışı dillerde (Norveççe test edildi) "değişken doğruluk" (variable accuracy).
- **32.000 token limiti** Norveççe metinde ~64.000 karaktere denk geliyor — uzun context'te sıkışma riski.
- **Kalibrasyon POZİTİF yönde de var:** 0.9+ güven seviyesinde %93 doğruluk (DeepSeek reasoning'in
  0.7-0.9 aralığındaki %48 doğruluğuna karşı iyi) — yani kalibrasyon HER YERDE kötü değil, poker
  deneyindeki (madde 1) kalibrasyon sorunu görev-spesifik olabilir. **ÇELİŞKİ — CONFLICTS.md'ye taşınacak.**
- **Bulgu:** "Uzun, nitelikli talimatlar performansı düşürüyor" — prompt/instruction tasarımı hassas.
- **Fiyat/performans:** 1000 dokümanda Jev $0.22 vs DeepSeek reasoning $3.08 — aynı doğrulukta 14x ucuz, 7x hızlı (bu POZİTİF claim, dengeleme için not edildi).

---

## 4. Matematik/sayma/tarih mantığı zayıflığı (VENDOR-ACKNOWLEDGED + bağımsız teyit)

- **Kaynak:** flaviocopes.com/jev/ deep-dive, 2026-09-20 (HN: 49774157, 2 puan)
- **Bulgular:** Matematiksel işlemleri güvenilir yapmıyor, sayma/karşılaştırma zayıf, tarih mantığı
  muğlak sonuçlar veriyor, metafor/dolaylı ifadeleri zayıf anlıyor.
- **Yapısal sınırlama (tasarım gereği, kusur değil):** Metin üretemez — sadece choice/score/noul
  seçimi yapar. Serbest metin/reasoning trace yok.

---

## 5. Vendor lock-in, latency, gizlilik eleştirisi — yerel alternatif motivasyonları (COMMUNITY, çoklu kaynak)

- **Kaynak:** github.com/wfzyx/von README (HN: 49781612, "Sub-15ms non-autoregressive local drop-in
  alternative to TypeSafe Jev", 2026-09-21)
  - Von: sub-15ms yerel vs Jev API ~115ms bulut gecikmesi.
  - Von: yerel/ücretsiz (Apache 2.0) vs Jev $0.042/1M token bulut maliyeti.
  - **Vendor lock-in eleştirisi açık:** "Jev is Cloud Only... creates cloud provider dependency."
  - Gizlilik: yerel işlem hassas veriyi dışarı göndermiyor (Jev'e karşı zımni eleştiri).
  - Von, ViZDoom oyun testinde Jev'i **%60.1 daha fazla başarıyla geçti** (+3.38 kill farkı) —
    performans üstünlüğü iddiası (VENDOR CLAIM — Von'un kendi reposu, bağımsız doğrulama yok).
- **Diğer alternatif repolar (motivasyon = aynı eleştiriler):**
  - github.com/r-ms/mini-jev — "typesafe's Jev implemented on top of an LLM locally" (HN: 49748643)
  - github.com/ikermoel/open-alternative-jev — "Open alternative to TypeSafe's Jev, running locally
    on your own GPU" (HN: 49750584)
  - Bu üç ayrı bağımsız proje aynı üç şikayeti tekrarlıyor: latency, cloud-only maliyet, vendor lock-in.
    **Üç bağımsız kaynak aynı yönde → bu tek anekdot değil, tekrarlanan bir desen.**

---

## 6. Yayınlanmamış eval / şeffaflık eksikliği (tekrar eden tema)

- Madde 1'deki backnotprop yazısı: "TypeSafe skipped published evals in this release."
- TypeSafe stealth'ten 2026-09-15'te çıktı (flaviocopes'e göre), $40M seed aldı — çok yeni şirket,
  3. parti bağımsız/akademik benchmark HENÜZ YOK. Tüm nicel karşılaştırmalar (poker, çizim, event
  validation) topluluk üyelerinin KENDİ deneyleri, tek-kişilik, tekrarlanmamış.

---

## ÖZET — 5 en kritik negatif/eleştirel bulgu

1. **Poker deneyinde temel stratejik hata + kalibrasyon tutarsızlığı** (backnotprop, 2026-09-17) — solver'a göre %63 eşleşme, en iyi elde bile yanlış all-in kararı.
2. **Vision desteklenmiyor + sınıflandırma bias** — 400 çizimden %52'sine "airplane" dedi, kedide %0 doğruluk (mikulskibartosz, 2026-09-19).
3. **Matematik/sayma/tarih mantığı zayıf, İngilizce dışı dillerde değişken doğruluk** (flaviocopes + lindfors).
4. **Vendor lock-in, cloud-only mimari, ~115ms latency — üç bağımsız yerel-alternatif projesi aynı şikayeti tekrarlıyor** (von, mini-jev, open-alternative-jev).
5. **Yayınlanmış/bağımsız eval yok — şirket 2026-09-15'te stealth'ten çıktı, tüm kanıt topluluk kaynaklı tekil deneyler, reprodüksiyon yok.**

**Not:** Kasıtlı arandı — HN algolia API, GitHub, blog aramaları. Reddit/Twitter'da (bu forkun ayrı
kısmı jev-community.md'de) ayrıca doğrudan Jev'e özel bir tartışma bulunamadı (ürün çok yeni, HN
dışında henüz yayılmamış olabilir) — bu UNKNOWN olarak işaretlenmeli, "negative evidence yok" ile
karıştırılmamalı.
