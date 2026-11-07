# U4 — "Slash komutları" reel'i (instagram.com/reel/DdrSSgtK11Q)

**Anlatan:** Yusuf Kösoğlu, @aifilmakademisi (Ai Film Akademisi). Video 33 sn; döküm ve 7 kare okundu.

## Bunlar ne
Bunlar Claude Code slash komutu ya da skill değil; ChatGPT'nin içinde tanımlı komutlar da değil. Kareler gösteriyor: bir ürün fotoğrafı ChatGPT'ye yükleniyor, mesaj kutusuna `/3dbillboard` gibi düz metin yazılıp gönderiliyor. ChatGPT bu kelimeyi tanımlı bir komut olarak almıyor, sıradan bir istem olarak okuyup niyeti tahmin ediyor ve görsel aracını çağırıyor. Yani "komut" dediği şey, adı tek kelime olan kısa istemler. Son kare: "FIVE COMMANDS … 50 more ChatGPT commands".

## Videodaki 5 komut
| Komut | Yaptığı |
|---|---|
| /3dbillboard | Ürünü bina köşesinde, 3D dış mekân billboard'unda ultra gerçekçi gösterir |
| /metaads | Sosyal medya (Meta) için reklam tasarımı üretir |
| /showcase | Ürün fotoğrafını profesyonel stüdyo çekimine çevirir |
| /360view | Ürünün etrafında 360° dönen çekim üretir |
| /lifestyleshot | Ürünü gerçek hayat sahnesine yerleştirir (kumsal, sepet gibi) |

## Kaynak
Açık bir kaynak yok. Açıklama yazısı şöyle diyor: "Yorumlara '50' yaz ve hesabı takip et… 50 özel ChatGPT komutunu DM'den göndereyim." Liste DM ile verilen bir müşteri mıknatısı; GitHub, Notion, Drive ya da Gumroad bağlantısı yok. Web aramasında bu komut adları hiçbir yerde belgeli çıkmadı. `gh api` ile bakılacak bir depo da olmadığı için yıldız ve lisans sorusu doğmuyor.

## Bizde olanla örtüşme
- Hiçbir skill klasöründe bu adlarla bir komut yok: `~/.claude/skills`, `~/.local/share/dxb/skills` ve projedeki `.claude/skills`.
- B43'ün iş türü tablosunda "hero product shot" ve "people and lifestyle" satırları zaten var. /showcase ve /lifestyleshot bunlarla örtüşüyor.
- /3dbillboard, /360view ve /metaads için adı konmuş bir adım yok.
- B43 ve B41 kayıtlarında "slash" kelimesi hiç geçmiyor.

## Kurulum yolu (şimdi hiçbir şey kurulmadı)
1. **50'lik listeyi almak:** Bir hesapla yorum yazmak ve takip etmek gerekiyor. Bu dışarıya dönük bir hesap adımı olduğu için CEO'da durur.
2. **Gelen dosya:** Kod değil, istem metni olacak. Yine de B41'in gümrük taramasından geçer (taranır, kaynağında ayıklanır, kendi sabitlenmiş kopyamız tutulur).
3. **Stüdyoya yerleşimi:** Tek bir B43 stüdyo skill'i olur, "ürün görseli istem kartı" gibi. Her komut bir satır olur ve stüdyo işçisi gerektiğinde bu kartı tarar. Görsel adımı, B43'te kayıtlı sıradaki görsel aracından yürür.
4. **Beklemeden yapılabilecek:** Videodaki 5 komut yalnızca addan ibaret. Bu 5 adım listeyi beklemeden kendi istemlerimizle yazılabilir.
