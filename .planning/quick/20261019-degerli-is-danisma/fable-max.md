# Fable 5.1 max — consultation on valuable work (2026-10-19), final answer verbatim

**Kaynaklar** (tam yol bir kez): `MR` = /home/dxb/DxB Global OS/HOLDING-OS-MASTER-PLAN/MODEL_ROUTING_SPEC.md · `AO` = …/AGENT_ORCHESTRATION_SPEC.md · `CC` = …/COST_CONTROL_SPEC.md · `AE` = …/APPROVAL_ENGINE_SPEC.md · `WE` = …/WORKFLOW_ENGINE_SPEC.md · `T/` = /home/dxb/DxB Global OS/.planning/quick/20261012-b64-is-akisi/deneme-2026-10-13/ · `H/` = /home/dxb/DxB Global OS/.planning/quick/20261017-studio-platform-hub/

## 1. CEO'nun sorusu: aynı yazar sorunu nasıl çözülür

Evet, bugünkü tarif aynı yazarın (Opus 5.5) aynı tarifle iki kez yazmasıdır (MR:541-543). İki denemede de (T/, 13 Ekim kör; H/, 17 Ekim kör değil) max planı kazandı ve xhigh planı yalnız "ekler" verdi (T/judge-fable.md:13-23; H/JUDGE-VERDICT.md:11-12). Hataları ise karşılaştırma değil, hakemin **hata listesi** yakaladı; ortak hataları yakalayan hakem öbür sağlayıcıdan olan Sol'du (T/judge-sol.md:25-28), aynı aileden Fable "hukukta ikisi de doğru" dedi (T/judge-fable.md:34). İkinci deneme de aynı şeyi gösterdi: ölçme hakkı olan hakem 8 kaynaksız iddia buldu (H/JUDGE-VERDICT.md:16-27).

**Önerim:** ikinci planı aynı yazara yazdırmak yerine ikinci gözü başka sağlayıcıdan ve sınayan bir göz yapmak.
1. Plan: Opus 5.5 `max`, bir kez, kendi koşusunda.
2. Plan kontrolü: Sol 6.1 `high` (öbür sağlayıcı) plan+tarifi okur, okuma hakkı vardır (mevzuat metni, API dokümanı, depo); üç liste döner: hata, tarife göre eksik, "ölçtüm / ölçmedim" etiketli iddialar. Fable yedek. Tek tur.
3. Başkan "ölçmedim" kalemlerini araştırma kapısından doğrular, birleştirir, imzalar (§4e'nin biçimi, MR:179-181; 17 Ekim'de zaten böyle yapıldı: H/FINAL.md:3).
4. İki plan yalnız kalıbı olmayan (ilk kez yapılan) işte, ve ikinci plan öbür beyinden: Fable 5.1 `xhigh` aynı tarifle ayrı koşuda; Sol kör seçer; başkan birleştirir. Çeşitlilik yalnız burada bir şey satın alır.

**Etkisi.** Kalite: ortak kör noktalar denemede karşılaştırmayla değil, çapraz hata listesiyle bulundu; kontrol oraya taşınır. Süre: bilinen tipte ikinci Opus planı (xhigh 8 dk, max 31 dk — is-akisi.html:384) düşer; başkanın doğrulaması eklenir (listeyle sınırlı). Para: iki deneme de jeton/maliyet kaydetmedi (T/key.md yalnız saniye) — UNVERIFIED; Sol ve Fable katalogda fiyatsız (abonelik), ölçtüm: `claude-opus-5-5 agent-sdk 4|20`, `fable-5.1 agent-sdk NULL`, `gpt-6.1-sol codex-cli NULL`. Fable her değerli işin planında yanmaz ("boşa yakılmaz" ile uyumlu).

**Kabulden önce ölçüm:** kendi işlerimizden 4 tarif (site, kampanya, içerik paketi, danışmanlık; ikisi kalıplı, ikisi ilk kez); her biri iki biçimde (bugünkü / önerilen); koşudan önce iki mühendisin yazdığı hata-eksik cetveli (ona teknik soru yok); her hakem iki kez, sıra ters çevrilerek (13 Ekim'de iki hakem de aynı sırayı gördü, T/key.md:1-3; konum/uzunluk yanlılığı denetlenmedi). Ölçü: yakalanan hata / cetvel, hakemin yanlış iddiası, süre, jeton-kota. Sayfanın kendi cümlesi geçerli: "Tek iş, tek deneme: işaret verir, kural koymaz" (is-akisi.html:389).

## 2. P1-P8

| # | Hüküm | Kanıt | Öneri |
|---|---|---|---|
| P1 | **Kısmen** | Planlar çok yerde ayrışıyor (WhatsApp D-2, takvim, 5-yorum tavanı). Ortak boşluklar gerçek: yorumlar klinik/danışmana bırakılmış (T/plan-max.md:217, T/plan-xhigh.md:47); KVKK m.9 dayanağı yok, danışmana devir (plan-max:69,219; plan-xhigh:65,190); gönder düğmesi (plan-max:213, plan-xhigh:43). Ortak olan "araştırılmamış" boşluklar; seçim bunu yakalayamaz, çapraz hata listesi yakaladı. | §1. |
| P2 | **Gerçek** | judge-fable.md:34 ↔ judge-sol.md:25-27; tek hakem MR:542. Hakeme "başka dosya okuma" dendi (T/brief-and-judge-prompt.md:3): hukuk okumadan hükmedildi. Benim okumam Sol'u haklı gösterir (m.9 2024 değişikliği; tanıtım yönetmeliği) — bu oturumda ölçülmedi, UNVERIFIED. | Doğrulanabilir iddia hakem sayısıyla değil, metne bakılarak çözülür; hakeme okuma hakkı, başkana doğrulama görevi. |
| P3 | **Gerçek** | "D20→D17-18" takvimi değiştirir (judge-fable.md:14); §4e'de yazar düzeltir ve imzalar (MR:181). Uygulama zaten böyle: başkan 5 yanlışı yerinde düzeltti (H/FINAL.md:3). | Metni uygulamaya göre yaz: hakem liste verir, başkan birleştirir-doğrular-imzalar, tek tur. |
| P4 | **Gerçek, daha geniş** | CC:216; katalog ölçümü yukarıda; abonelik satırları fiyat taşımaz (MR:462-464). Yalnız hakem değil: Sol da NULL, müşteriye giden her bütçeli iş kritik kapıda (AO:223) durur. | A6'ya "abonelik koltuğu: kota payı ya da onun girdiği nominal fiyat, bekleme yok" satırı; bekleme yalnız API-ölçümlü fiyatsız satırda. |
| P5 | **Gerçek** | MR:499-501 ve WE:175 kalıbı basit/normal için yazıyor, değerli+kalıp çakışmasını yazmıyor. | Bilinen tipte değerli iş: kalıp + başkanın `xhigh` farkı; hakem kalıp+farkı tarife göre sınar; iki plan yalnız kalıpsız işte. |
| P6 | **Gerçek** | AO:221 kanıt sütunu tek deneme; 17 Ekim ikinci ama kör değil (H/JUDGE-VERDICT.md:1); her ikisinde maliyet yok. Söz verilen test seti (MR:504-505) yok. | §1'deki ölçüm seti yapımdan önce. |
| P7 | **Gerçek** | Tetik yalnız tutar/sözü (MR:541; AO:221); risk sınıfları kapıda var (MR:183), plan katında yok. | Plan kontrolü için iki tetik daha: ilk kez yapılan iş; kişisel/sağlık verisi, hukuk, para akışı. 1.000 $ çizgisi onun, kalır. |
| P8 | **Kısmen** | AE:184; çizgi onun, dolarla (CC:215). Bugün teslim hacmi yok, ölçülemez. | Şimdi dokunma; ilk 20 teslimde "gönderin"e kadar geçen süre ölçülsün, bir iş günü aşarsa ona tek satırlık öneri. |

## 3. Başmühendisin atladıkları

- **Hakemin iddiası doğrulanmıyor.** İki hakem rıza kutusunda birbirine zıt (judge-fable.md:34 ↔ judge-sol.md:27). "Ekler, değiştirmez" kuralı hakemin yanlışını plana taşır.
- **Plan kendi maliyetini bilmiyor.** %30 tavanı (CC:215) çalışma zamanı freni, plan girdisi değil; iki planda holdingin maliyet satırı yok (plan-max:206 kliniğin giderleri; plan-xhigh:3 yalnız sözleşme). Sol fark etti (judge-sol.md:21). Değerli işin planı parça başına model-dakika/jeton tahmini taşımalı.
- **Kapıda bağımsızlık.** Planı şekillendiren hakem aynı işin kapısında oturuyor (MR:175); kapının ilkesi "co-author değil" (critical-gate.ts:7-8). Yedek yolda (Fable düştü → Sol hakem → Sol tek başına kapı, MR:189) bağımsız göz hiç kalmıyor. İşin plan hakemi o işin kapısına oturmasın.
- **İki plan ayrı koşu mu?** Tarif yazmıyor; aynı oturum ikinciyi yazarsa o plan değil, revizyondur. Denemede nasıl yapıldığı klasörde yok — UNVERIFIED.
- **Fikir kaynağı.** Karar 10'un sözü onun notundan ("notlarımda söylediğim gibi", ceo-approvals.json `b64-decision10…`); bugünkü sorusu aynı notun sınanmasıdır, çelişki değil.

## 4. Hüküm

**Değiştirerek tut.** Tek Opus `max` plan + çapraz sağlayıcıdan sınayan hakem + başkan birleştirir-imzalar (§4e biçimi); iki plan yalnız ilk kez yapılan işte ve iki beyinden.
A6'ya abonelik fiyatı, A8/A30'a kalıp-değerli önceliği, plan katına risk tetiği yazılır; hiçbiri yapıdan önce ölçümsüz kabul edilmez.
Değiştirilmezse işler yapımda hakemde (ve kapıda) durur; aynı yazarın ikinci planı ise zaman alır, hata yakalamaz.
