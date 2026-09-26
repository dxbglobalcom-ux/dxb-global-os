# B56 — THE RESEARCH DOOR, PERPLEXITY-SHAPED · PLAN v2 (the architecture)

**Status: RUNNING — his "başla" came 2026-09-26 ~00:40; the job runs through `dxb-team1` in the Fable 5.1 session that heard it (lead), Opus 5.5 writers at max, a fresh verifier at high; his eye on the three answers side by side decides acceptance (LAW B).** <!-- OPEN: B56 --> <!-- CEO-OK: research-basla-2026-09-26 -->
Written 2026-09-24 ~23:50 by the Fable 5.1 session he opened himself (`/model` → Fable 5.1) on his
order: *"önemli bir plan mimari spece ihtiyacımız var."* <!-- CEO-OK: research-plan-v2-ordered-2026-09-24 --> On his "başla", §2 of this file replaces the
conclusion sentence of the 14:55 plan (`~/.claude/plans/linear-plotting-breeze.md`: *"Derinlik bizde
zaten var. Filo korunur, yüzey ve doğruluk düzeltilir."*) as a registered adaptation in board row B56
(LAW A). Until then nothing in the repository changes; this file is the only thing written tonight.
Body in Turkish because he reads it (precedent: B43's PLAN.md). Every number below was measured this
session; the commands are in the session transcript, none is quoted from memory.
Revised 2026-09-24 ~23:55 on the Opus 5.5 session's review that he forwarded: the coverage table prints
and never blocks; no quote checker — the page renders quotes from evidence rows; the answer's shape is
the CEO report; and a third cause added: the hunters stop early and are not asked to account for the
unread (measured below).
**His word on the update and the seats, 2026-09-25 ~00:05:** <!-- CEO-OK: research-plan-v2-seats-tmm-2026-09-25 --> *"planı güncellediysen tmm sonra onu yaptırırız
sanırım baş mühendis olarak seninle devam edeceğiz. yazıcı da opus 5.5 olur sanırım yine eskisi gibi."* — a
session order for THIS job: chief engineer = this Fable 5.1 session; writer = the `builder` subagent
(`claude-opus-5-5` · `max`); the work runs later, on his "başla". NOT an approval of the plan (LAW B): the
four decisions of §6 and "başla" are still owed.
**His four words, 2026-09-26 ~00:40** <!-- CEO-OK: research-basla-2026-09-26 -->: *"başla. lakin şuan çalışan oturumla da
anlaşın. işler karışmasın haberi olsun zira commit işi çok hassas ve sağlıklı olmalı ok. ben yatıorm"* — the four
decisions of §6 as recommended (page at once · drawer after his eye, in the morning · growth ruler as a ruler, wired
after the drawer · the door `dxb-team1`, B57's first team job). Two more sentences of his the same quarter-hour, both
registered: the hunters are **Opus 5.5 · low** <!-- CEO-OK: research-hunters-opus-low-2026-09-26 --> (LAW A: the
Sonnet 5 hunter line below is gone), and **no cost ceiling** <!-- CEO-OK: research-no-cost-ceiling-2026-09-26 --> —
the hunters run on his subscription, the dollar figures below are Claude Code's notional print, the real limit is the
weekly quota. Evidence and the done-lists: `EVIDENCE-B56-2026-09-26.md` beside this file.

---

# ARAŞTIRMA KAPISI — PERPLEXITY'NİN ŞEKLİ, BİZİM ELLERİMİZLE · PLAN

## İki cümle

1. **Ne olacak:** Siz soruyu sorarsınız; oturum kendi aklıyla araştırır, konu nerede konuşuluyorsa
   (X, YouTube, TikTok, Instagram, Facebook, LinkedIn, Reddit, forumlar, Çince ve diğer diller, kod
   ve ölçümler) oraya gider, topladığı her alıntı bir **kanıt satırı** olur, cevap yalnız o
   satırlardan yazılır, altında "nereye bakıldı, ne bulundu, ne kullanıldı" tablosu makine tarafından
   basılır ve sayfa **soru sorulmadan** önünüze gelir. Hızlı soru 3 dakika, derin soru 15 dakika.
2. **Bunu kanıtlayan tek komut:** `python3 .claude/skills/dxb-research/scripts/kapsama.py <koşu>` —
   her platform için "bulundu N · okundu M · cevapta K · kapalı kapı: …" basar. Bugünkü koşuya
   koşulunca X için `294 · 3 · 0` basmalı (kusuru gösterir); yeni koşuda X için `okundu ≥ 20 ·
   cevapta ≥ 1` basmalı (kusurun kapandığını gösterir).

## 0. Bu gece ölçülenler (plandan önce)

**Skill bugün:** 69 dosya, 12.488 satır (`find … | xargs wc -l`). 16 Eylül'den beri 36 commit
(16 Eylül 4 · 17 Eylül 16 · 20 Eylül 4 · 21–23 Eylül 4 · 24 Eylül 8).

| Katman | Dosyalar | Satır |
|---|---|---|
| Eller (ulaşım): gizli Chrome, 39 kanallı tarama, 12 kapılı okuyucu, kişi sayıcı, profil kopyası, hızlı yol | hidden.py 913 · sweep.sh 831 · sources.py 723 · rlib.py 648 · fetch.py 601 · profile-sync.sh 468 · digest.py 597 · ask.sh 337 · shortq.py 254 · fleet.sh 297 · merge.py 288 · crowd.sh 176 · probe.sh 126 · urlcheck.py 120 · render.py 114 · mcpx.sh 85 · threaddates.py 65 · keep.sh 46 · crowd-urls.sh 17 · roles.tsv 7 · ARSENAL.md 116 · evidence_row.schema 35 · bin/opencli · registry.yaml | **≈ 6.860** |
| Denetim, kayıt, kapı, puanlama | cite-check.py 1.611 · gate.py 444 · ledger.py 309 · hooks/ 380 · research.py 293 · ingest.py 247 · rubric.py 231 · pplx.py 570 · independence.py 207 · verify.py 150 · accept.sh 235 · coverage.py 122 · policies/ 195 · references/channels.md 208 · claims+question_lock şemaları 39 | **≈ 5.240** |
| Tarif | SKILL.md | 383 |

**Bugünkü derin koşu** (Astra 6 / Fable 5.1 sorusu, 20:10–20:33, 7 avcı, 11,65 $, makine süresi 23 dk;
sayfa sonra "md mi sayfa mı" sorusuyla ~50 dk sizin cevabınızı bekledi — sizin düzeltmeniz bu gece):

| Platform | Bulundu (adres) | Okundu (gövde) | Cevapta kaynak |
|---|---|---|---|
| X | 294 | 3 | 0 |
| YouTube | 58 | 2 | 0 |
| Facebook | 19 | 0 | 0 |
| Instagram | 7 | 2 | 0 |
| LinkedIn | 0 (tarama satırı 3 kez 4 bayt döndü) | 0 | 0 |
| TikTok | 1 (taramada TikTok satırı yok) | 0 | 0 |
| Reddit | 634 | 121 | 12 |
| Diğer (HN, GitHub, Quora, Çince, makale…) | 1.195 | 30 | 10 |

`sources.json` 2.208 satır; cevap 22 kaynak kullandı. X'in gönderi metinleri diskte duruyordu
(`ground*/twitter.raw`: 45–77 KB × 3) ve kimse okumadı, çünkü avcı brifingi *"Work only your lane"*
diyor ve X hiçbir şeridin değil (şeritler: kalabalık · rakip · kod · ölçüm · video · karşı görüş ·
yabancı dil).

**Yazar ne okudu** (oturum 15636eaa'nın alet çağrıları, sayıldı): `HUNTER-*.md` adıyla **0** kez —
Opus 5.5'in dediği doğru. Ama aynı oturum 20:19–20:24'te 7 avcının çıktısını avcıların kendi
kayıtlarından `REPORT-<rol>.md` diye çıkarıp yedisini de `cat` ile açtı (filo `HUNTER-*.md`'yi 20:27'de
yazdı, yani ondan önce); `REPORT-counter.md` X alıntılarını (@andonlabs, @alstras…) adresleriyle
taşıyordu, yani X kanıtı en az bir kez, adresleriyle, yazarın önündeydi; yine de cevapta X'ten 0 kaynak. `SUMMARY.txt` 1 kez, `sources.json` 8
kez açıldı (Opus'un 12 ve 22 sayıları alet çağrısı sayımıyla tutmuyor). **"Avcı raporlarını oku"
satırı bu kaybı kapatmazdı: raporlar okunmuştu.**

**Avcılar erken durdu** (avcı kayıtlarından, ilk ve son alet çağrısı arası; verilen süre 25 dk):
kalabalık 11,8 dk · ölçüm 6,5 · karşı görüş 5,7 · video 5,5 · yabancı dil 5,1 · kod 3,3 · rakip 3,2.
Hiçbiri süre bitti diye durmadı. X'e alet çağrısı yapan avcı: yalnız karşı görüş (14 çağrı) ve rakip (1);
diğer beşinde 0. Video avcısı: tarama 34 ayrı video buldu, avcı 23'üne dokundu, 5'inin yorumlarını
çekti, 6 altyazı denemesinin çoğu kapalı kapıya çarptı (YouTube 429); son cümlesi *"bu benim lanımın
dışında, diğer avcılara bırakıyorum"*. Avcı brifinginde "bulduğun her adresi oku, okumadığını sebebiyle
yaz" diyen bir satır yok.

**17 Eylül yarışı** (`.planning/research/RESEARCH-ENGINE-2026.md` §"the race"): tarif düzyazı olarak
%95 doğru · 159 s/soru; tarif + makine %100 · 675 s/soru; sınav sizin emrinizle silindi (`be5ec5e5`).

**Aletler canlı** (öbür oturumun bu geceki ölçümü, P1'de yeniden ölçülür): TikTok araması 7 s'de 5
video, LinkedIn `mcpx.sh exa` yoluyla 1,7 s'de 7 gönderi.

## 1. Kök neden — düzeltilmiş

Bu gece size iki kez yanlış sebep söylendi ("yazar 187 X kaynağını attı", "yazar raporları açmadı").
Ölçülen sebep şu, iki yerde:

1. **Okuma platforma göre değil konuya göre bölünmüş.** Bu yüzden X 294 adresten 3'ü, YouTube 58'den
   2'si okundu; Facebook, LinkedIn, TikTok hiç. Kaybın büyüğü burada.
2. **Yazar kanıt tablosundan değil, düzyazıdan yazıyor.** Avcı 6 blokluk rapor veriyor, yazar rapordan
   ve kendi grep'inden cevap yazıyor; eline geçen X alıntılarını bile kullanmadı. 22 kaynağın 12'si
   Reddit.
3. **Avcılar erken bırakıyor ve hesap vermiyor.** 25 dakikanın 3–12'sini kullanıp kendi kararıyla
   duruyorlar; "okumadığını sebebiyle yaz" satırı yok, "yalnız kendi şeridinde çalış" satırı ise onları
   bulduklarından uzaklaştırıyor.

Ve üç ağırlık: denetçi (1.611 satır) cümlenin kaynağı var mı diye bakıyor, toplanan kanıt cevaba
girdi mi diye bakmıyor; sayfa "md mi sayfa mı" sorusuyla bekliyor; tarif 383 satır ve alet çantası
kuralların arasında kaybolmuş.

## 2. Mimari

**İlke (sizin 20 Eylül sözünüz):** araştırmayı oturum kendi aklıyla yapar; kapı elindeki alet
çantasıdır. Şekil Perplexity'ninkidir, eller bizim:

```
BUL (tarama, 40 kanal, saniyeler)
 → OKU (platform sahibi avcılar: gövde, yorum, altyazı; kısa soruda oturumun kendisi)
 → KANIT SATIRI (id · platform · adres · yazar · tarih · alıntı KELİMESİ KELİMESİNE)
 → SATIRLARDAN YAZ (cevap yalnız id'leri kullanır; alıntıyı yazar yazmaz, sayfa satırdan basar)
 → KAPSAMA (makine basar, hiçbir şeyi durdurmaz: platform · bulundu · okundu · cevapta · kapalı kapı)
 → SAYFA (hemen, soru yok)
```

| Parça | Bugün | Yeni | Ne değişir |
|---|---|---|---|
| **A. Tarif** | SKILL.md 383 satır, kurallar arasında aletler | ≈ 100 satır: önce **platform → tek satır komut** tablosu (öbür oturumun 52 satırlık taslağı temel), iki adım kanunu (bul → içini al), salt okunur, gizli Chrome, kısa sorgu, cevap biçimi | Yeniden yazılır; anlamı değişen sizin hükmünüz yok, yalnız §9 (karar 1) |
| **B. Zemin** | sweep.sh 39 kanal; TikTok yok; LinkedIn satırı boş | 40 kanal: `tiktok` satırı eklenir, `linkedin` satırı exa yoluna alınır; gövde taşıyan ham dosyalar (X, Facebook, HN, Reddit arama) **avcı beklemeden kanıt satırına çevrilir** | 2 satır + küçük bir çevirici |
| **C. Saha** | 7 avcı, konuya göre; 6 blok düzyazı | 7 avcı, **platforma göre**: ① X · Threads · Bluesky ② YouTube · TikTok · Instagram · Bilibili ③ Reddit · HN · lobste.rs · Stack Overflow · Quora (+ crowd.sh sayımı) ④ LinkedIn · Facebook · Substack · Medium ⑤ GitHub · npm/PyPI · liderlik tabloları · makaleler ⑥ diğer diller ⑦ karşı görüş (her platformda tersini arar). Her avcıya taramanın kendi platformlarında bulduğu **adres listesi** verilir; brifing tek cümledir: *bulduğun her adresi oku, okuyamadığını sebebiyle satıra yaz*; "yalnız kendi şeridinde çalış" cümlesi gider. Her avcı geri **kanıt satırları** + tek HÜKÜM satırı + her platform için durum verir: `bulundu N / okundu M / okunmadı: <sebep> / kapı kapalı: <hata>` | roles.tsv yeniden; fleet.sh satırları toplar; merge.py yalnız sayar. Avcı beyni **Opus 5.5 · low** (sizin sözünüz, 26 Eylül 00:37; 17 Eylül'ün Sonnet ölçümü tarih olarak kalır), komutan oturum |
| **D. Kanıt tablosu** | sources.json = adres listesi (2.208 adres, çoğu okunmamış) | koşu başına tek `evidence.jsonl`; şema zaten var (`schemas/evidence_row.schema.json`, 35 satır): alıntı **fetcher tarafından** yazılır, model yalnız var olan id'yi kullanır | sources.py id verme ve tekilleştirmeye küçülür |
| **E. Yazar** | oturum; kaynak listesindeki numaralara göre yazar | oturum; **yalnız kanıt satırlarından** yazar. Alıntıyı yazar yazmaz: cevapta `[id]` durur, sayfa alıntıyı, yazarını, tarihini ve adresini **kanıt satırından basar**. Uydurma alıntı yapısal olarak imkânsız; denetçi yok | cite-check ve R4 gereksizleşir |
| **F. Kapsama** | yok (cite-check kaynağı sayıyor, kapsamayı değil) | Kapsama scripti ≈ 50 satır: cevabın altına "platform · bulundu · okundu · cevapta · okunmadı/kapalı kapı: sebep" tablosunu basar. **Hiçbir şeyi durdurmaz, kapı değildir**; "X'ten 25 gönderi okundu, 3'ü kullanıldı" diye yazar, gerisini siz görürsünüz | Yeni, küçük |
| **G. Sayfa** | render.py md üretir; "md mi sayfa mı" sonda sorulur; sayfa elle tasarlanır | render → sayfa olarak **hemen** önünüze konur, soru yok; elle tasarlanmış sayfa yalnız siz isterseniz. **Sayfanın biçimi = CEO raporu** (`dxb-ceo-report` kapısı): ilk cümle cevap · cevabı taşıyan sayı (sayım, pay, payda) · ne değiştirirdi ve bakıldı mı · ayakta bırakılan çelişkiler · en altta kapsama tablosu = nereye bakıldı, nereye bakılmadı · alıntılar yazar, tarih ve adresle | **Karar 1** (sizin §9 hükmünüze dokunur) |
| **H. İki derinlik** | ask.sh (hızlı, 28–73 s ölçüldü) + filo | aynı: **hızlı** = oturum + ask.sh/tarama + okuyucu, ≤ 3 dk, dış maliyet 0 · **derin** = tarama + 7 platform avcısı + crowd.sh sayımı, ≤ 15 dk uçtan uca; dış para 0, koşu sizin aboneliğinizden (26 Eylül sözünüz: tavan yok; Claude Code'un bastığı "$" rakamı hayalidir). Derinliği oturum seçer, kimse sormaz | ask.sh'ın `--check` adımı denetçiyle gider |
| **I. Kayıt** | Stop + PostToolUse kancaları, ledger, gate ("kaydet" deyince) | "kaydet" = `final.md` + `evidence.jsonl` `.planning/research/answers/<tarih>-<konu>/` klasörüne kopyalanır (klasör zaten var); kanca yok, defter yok | 17 Eylül emriniz aynen: varsayılan sıfır evrak |

**Değişmeyen hükümleriniz:** varsayılan hiçbir şey yazılmaz (17 Eylül) · 20–30 kanal aynı anda, kapı
kapanınca öbür alet dener, en iyi alet ilk (17 Eylül) · araştırma oturumun kendi işi, etiket ve form
yok, "sizin kararınız" cümlesi yok (20 Eylül) · ekranınıza pencere yok, gizli Chrome (24 Eylül, gözünüzle
kabul) · hesaplar sizin, salt okunur · paragraf arama kutusuna girmez, kısa sorgu.

**Bu planın kapsamadığı:** B56 satırındaki açık kusur listesi (Reddit'in `opencli reddit read`'i
reddetmesi, Google'ın /sorry/ sayfası, `sources.py`'nin adresi `)`'de kesmesi, eski `.agents` aynası
ve diğerleri) bu planla kapanmaz; satırda açık kalır ve ayrıca ele alınır.

## 3. Kabul maddeleri (koddan önce yazıldı; gözünüz karar verir — Kanun B)

**Ölçüm, 26 Eylül 02:34–02:45 (baş mühendis; ayrıntı `EVIDENCE-B56-2026-09-26.md`):** 1 ✔ tiktok.raw 5.267 B · linkedin.raw
15.974 B (doğrulayıcı ayrıca 5.191 / 17.131) · 2 ✔ dünkü koşuda X `294 · 1 · 0` (okundu kuralı tabloda basılı) · 3 kısmen: X
**272 · 130 · 4**, YouTube **41 · 30 · 3**, TikTok 38·38·0, Instagram 2·2·0, Facebook 19·19·0, LinkedIn 19·19·1, kapsama
tablosu cevabın altında, sayfa 1 s, soru sorulmadı, uçtan uca **358 s**; ✘ avcılar 600 saniyenin 51–209'unda bıraktı ve
ikisi dokunmadığı listeye "süre yetmedi" yazdı (Opus 5.5 · low; medium ölçülmedi) · 4 kısmen: ask.sh makine kısmı 14 s,
sayfa oturumun cevabını bekler · 5: cetvel 18/18, b46 11 dosya yeşil, tam batarya bu işin dosyalarında yeşil, dışında
kırmızı (öbür oturumun kanca testleri HOME sanal dizininde — düzeltildi 54817373, yeniden koşuluyor; c42 ×6 ve b23 graf
×1 eski) · Gözünüz: `P6-UC-CEVAP-YAN-YANA-2026-09-26.md` (masaüstünde kopyası).

Makine maddeleri (baş mühendis koşar, çıktıyı yazar):

1. `bash sweep.sh "astra 6 vs fable 5.1" <dir> --tier max` → `tiktok.raw` ve `linkedin.raw` **> 0 bayt**.
2. `kapsama.py` bugünkü koşuya (kopyası P0'da alınır) koşulunca X satırı `294 · 3 · 0` basar — kusuru
   cetvel gösterir.
3. Aynı soru yeni yolla, derin: X **okundu ≥ 20, cevapta ≥ 1** · YouTube **okundu ≥ 5, cevapta ≥ 1** ·
   TikTok, Instagram, Facebook, LinkedIn satırları durumlu (sayı ya da "kapı kapalı: <hata>") ·
   kapsama tablosu cevabın altında (durdurmadan) · sayfadaki her alıntı bir kanıt satırından basılmış
   (cevap dosyasında alıntı metni yok, yalnız `[id]`) · her avcı verilen sürenin en az yarısını kullanmış
   ya da "okunacak adres kalmadı" yazmış · avcılar bittikten sonra sayfa önünüzde **≤ 3 dk** · uçtan uca
   **≤ 15 dk** · soru sorulmadı.
4. Bir cümlelik olgu sorusu (ör. fiyat) hızlı yolla **≤ 3 dk**, kaynaklı, sayfa hemen.
5. `bash scripts/construction/battery.sh` yeşil; `scripts/research-ruler.sh`, `scripts/b48-ruler.sh`,
   `scripts/hooks/pre-commit`, `tests/b46/*`, `tests/b43/records-truth.test.ts` çekmece hareketinden
   sonra yeniden koşulur ve çıktıları yazılır (etki alanı: bunlar skill'in scriptlerini çağırıyor).

Gözünüz: aynı soruya üç cevap tek sayfada yan yana — bugünkü skill'li (X 0), skill'siz (yalnız Reddit
ve HN), yeni. Hangisi iyi, siz söylersiniz.

## 4. Fazlar (dxb-team1, sizin 26 Eylül sözünüzle: Fable 5.1 lider ölçer ve kabul eder · Opus 5.5 yazıcılar max'ta, aynı anda üçe kadar · taze verifier high'ta · sorun çıkarsa refuter xhigh, arbiter max)

| Faz | İş | Kod |
|---|---|---|
| P0 | Taban: bugünkü koşu dosyaları başka oturumun geçici klasöründen kopyalanır (silinebilir); `kapsama.py` yazılır ve bugünkü koşuya koşulur (madde 2) | kapsama.py |
| P1 | Zemin: `tiktok` satırı, `linkedin` satırı exa yoluna; canlı ölçüm (madde 1); ham gövdeleri satıra çeviren küçük adım | sweep.sh +2 satır, küçük çevirici |
| P2 | Saha: roles.tsv platforma göre; avcı çıktısı = kanıt satırı + HÜKÜM + durum; fleet.sh toplar; merge.py yalnız sayar; ARSENAL.md kısalır | roles.tsv, fleet.sh, merge.py |
| P3 | Yazar ve tarif: sayfa alıntıyı satırdan basar (render.py); SKILL.md ≈ 100 satır (taslaktan); cevap biçimi = CEO raporu; §9 karar 1'e göre | SKILL.md, render.py |
| P4 | Sayfa hemen (karar 1 "evet" ise): render → sayfa, soru yok | render.py |
| P5 | Çekmece (karar 2 "sil" ise): §5 listesi silinir, madde 5 yeniden ölçülür | silme + ölçüm |
| P6 | Yan yana: üç cevap tek sayfada, gözünüze | — |

Her fazın kabul maddesi fazdan önce yazılır; verifier yalnız diff'e ve listeye bakar; faz başına commit;
%50 bağlamda devir (`dxb-team1` §5, sizin 26 Eylül 50/55 sözünüz). Lider, "başla"yı duyan Fable 5.1
oturumu; kulvarlar ve kabul listeleri `EVIDENCE-B56-2026-09-26.md`'de.

## 5. Çekmece — yeni yolun çağırmadığı dosyalar (silme yalnız sözünüzle)

| Dosya | Satır | Ne yapıyordu |
|---|---|---|
| scripts/cite-check.py | 1.611 | 9 kurallı denetçi; R4 sayfaları yeniden açıyor |
| scripts/pplx.py | 570 | ücretsiz Perplexity hesabınıza gizli Chrome'la soru soruyor (kıyas için) |
| scripts/gate.py | 444 | tamamlanma kapısı |
| scripts/ledger.py | 309 | kanıt defteri |
| scripts/research.py | 293 | kayıtlı koşu açma |
| hooks/ledger-capture.py + hooks/research-completion.py | 380 | Stop ve PostToolUse kancaları |
| scripts/ingest.py | 247 | deftere alma |
| scripts/accept.sh | 235 | motor sağlık koşusu (37 kanal) |
| scripts/rubric.py | 231 | 10 satırlık puan cetveli |
| scripts/independence.py | 207 | kaynak bağımsızlığı kümeleme |
| references/channels.md | 208 | kanal anlatısı |
| policies/ (3 dosya) | 195 | kanıt planı, kaynak sırası, boşluk şablonu |
| scripts/verify.py | 150 | yerel model ile alıntı-iddia uyumu (tavsiye) |
| scripts/coverage.py | 122 | eski "kuruldu → kullanıldı" zinciri (yeni kapsama.py yerine geçer) |
| schemas/claims + question_lock | 39 | eski şemalar |
| **Toplam** | **≈ 5.240** | |

Bağımlılar (ölçüldü, `grep -rl`): `scripts/research-ruler.sh` (18 satır) · `scripts/b48-ruler.sh` ·
`scripts/construction/battery.sh` · `scripts/hooks/pre-commit` · `tests/b46/a-hunter-cannot-write.test.ts`
· `tests/b46/research-ruler.test.ts` + `.ts` · `tests/b43/records-truth.test.ts` ·
`scripts/governance/ceo-approvals.json` (metin atıfları). Silmeden önce her biri okunur, silme sonrası
her biri koşulur (§3 madde 5). `.agents/skills/dxb-research` aynası da eski; onunla birlikte güncellenir.

## 6. Sizin kararınız — dört kelime

1. **Sayfa hemen, soru yok** — sizin "md mi sayfa mı sonda bir kez sorulur, sayfa elle tasarlanır"
   hükmünüz kalkar (Kanun A ile silinir, dipnot kalmaz): **EVET** (26 Eylül 00:40).
2. **Çekmece** (§5, ≈ 5.240 satır) yeni yol gözünüzden geçtikten sonra silinir: **SİL — sabah, gözünüzden
   sonra; gece silme yok.**
3. **Büyüme cetveli**: SKILL.md ≤ 120 satır ve skill toplamı bataryada bir cetvelle tutulur — kanun değil,
   cetvel: **OLSUN.** Bu gece yazılır ve koşulur, bataryaya çekmece silindikten SONRA bağlanır; toplam
   eşiği o günkü ölçümden alınır (bugün 12.824 satır − ≈ 5.240 = ≈ 7.584, yani 7.500 bu gece tutmaz;
   eşik ölçülünce yazılır, tahmin edilmez).
4. **başla** — geldi (00:40); kapı `dxb-team1`, P0'dan gidildi.

## 7. KADEME 1 — Araştırma Motoru v2 (kayıtlı adaptasyon, sizin 26 Eylül sabah sözünüzle) <!-- CEO-OK: research-v2-k1-staged-opus-low-existing-plan-basla-2026-09-26 -->

**Sözünüz:** *"kademeli, opus low, mevcut plan. başla"* — ve aynı saat: *"tüm aletleri istiorm tabiki"*,
*"tmm bunu tarife koy, ama başlama dur. x üzerinden deneme yap"*. Deneme yapıldı ve kaydedildi
(`x-deneme-2026-09-26/`): aynı 130 X metni tek istemde önüne konunca Opus 5.5 low 130'un 130'unu okudu,
40 gönderide kanıt buldu (gece avcısı: 75'ine bakmış, 16 gönderi); Sonnet 5 high 48; Haiku 4.5 eleme
130/130, 0,14 $. **Bulgu: kayıp modelde değil düzende** — avcıya "adresleri kendin indir, kendin bastır"
dendi, o tek komutta 20.000 harfte kesip 64. saniyede çıktı; kimse "bitti" demesini denetlemedi.

**Kademe 1 ne kurar (mevcut arama/indirme aletleri aynen kalır; avcı bütün aletleriyle çalışır):**

| Parça | Bugün | Kademe 1 |
|---|---|---|
| **Kader** | bulunan adresin sonu belirsiz | her satırda `triage` (bekliyor · ilgili · ilgisiz · tekrar · erişilemez) + sebep; `evidence.py status` toplamları denkleştirir, denk değilse kırmızı |
| **İndirme** | avcı indirir, indirmediği kapalı kalır (142 X adresi) | makine önce hepsini dener (`fetch`), açılmayanı sebebiyle "erişilemez" yazar |
| **Eleme** | yok | Haiku 4.5, 60'ar 60'ar, her gövdeli satıra ilgili/ilgisiz/tekrar + sebep (sabahki istem) |
| **Okuma** | avcı `cat`/`head` ile basar, kesilir; "okundu" avcının beyanı | `evidence.py batch`: makine 10'ar 10'ar gövdeyi TAM basar ve o satırları "okundu" işaretler; ham basma hiçbir şeyi okundu yapmaz; yarım kalan "kısmen" |
| **Kapı** | avcı "bitti" der, filo kabul eder | filo avcı dönünce sayar: ilgili-okunmamış > 0 ve süre varsa aynı avcıyı "N adres duruyor" ile geri gönderir (3 tura kadar); "okundu" sütunu defterden, avcıdan değil |
| **Defter** | oturumun geçici klasörü (yeniden başlatmada silinir) | `var/research/runs/<tarih>-<konu>/`, diskte kalıcı; `/tmp` reddedilir |
| **Yazar** | oturum (Fable) yazar | filo son adımda Opus 5.5 · high yazarı açar: girdi = HÜKÜM satırları + durum tablosu + ilgili satırlar; çıktı `answer.md`, her iddiada `[L…]` |
| **Sayfa** | md, tablo üstte | `render.py` tasarlanmış HTML: üstte hüküm kutusu · her iddianın yanında "(n satır)" · alıntı kartları (yazar, tarih, bağlantı) · kapsama · **altta platform platform çekmece**: gövdesi olan HER satır açılır bağlantı, yazar, kısaltılmış alıntı (X'te 130) |
| **Kapsama** | bulundu · okundu · cevapta | bulundu · indirildi · ilgili · okundu · kısmen · cevapta · elenen (sebep) · kapalı kapı; altında RECONCILED / MISMATCH |

**Üç motor, sizin adlandırmanızla (26 Eylül öğle):** Kademe 1 = **KAPSAMA MOTORU** (ne bulundu, ne elendi, ne gerçekten okundu; "model tembel olabilir, sistem tembel olamaz") · Kademe 2 = **KANIT MOTORU** · Kademe 3 = **RAPOR MOTORU**.

**Kademe 1'in kapsamadığı (Kanıt ve Rapor motorları, sözünüzle):** iddia defteri ve bağımsız kaynak sayımı, karşı-kanıt
avcısı, boşluk turu, doygunluk, soru ayrıştırma, rapor tipine göre şekil, ayrı denetçi ajan.

**Kabul maddeleri (koddan önce yazıldı; komut + beklenen çıktı, `EVIDENCE-B56-K1-2026-09-26.md` §3):**
sabit fikstür = 26 Eylül 02:34 koşusunun ham kopyası. 1 `status` denk · 2 eleme 130/130 sebepli · 3 `batch`
10'ar basar, işaretler, ham basma işaretlemez, uzun gövde "kısmen" · 4 kapı: hemen çıkan sahte avcı geri
gönderilir, bitiren kabul edilir, log satırı · 5 koşu klasörü `var/research/runs/`, `/tmp` reddedilir · 6 yazar
adımı `answer.md` üretir, her iddia `[L…]` · 7 sayfa: hüküm üstte, sayılar iddia yanında, çekmecede X 130 ·
8 kapsama yeni sütunlar + RECONCILED · 9 `tests/b46/*` yeşil, cetveller yeşil, batarya bir kez · 10 gözünüz:
aynı soruya gerçek koşu, tasarlanmış sayfa. Kulvarlar: A defter+eleme · B kontrolcü+yazar · C kapsama+sayfa;
üçü de korunan yol → `builder` max; taze `verifier` high; lider Fable 5.1 ölçer, commit eder.
