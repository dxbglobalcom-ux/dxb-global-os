**REFUTED — done-list, “personadaki eski kalıpları bitir” emrinin tamamlandığını kanıtlamıyor.** `0467dbb6..4546d4b5` aralığını verilen 5/8, normal seviyede denetledim; puanı değiştirmedim.

Beş düzeltme gerekiyor:

1. **[§9 bildirim satırları silinirken rol kuralları kaybolmuş](/home/dxb/DxB%20Global%20OS/personas/security/agentic-identity-trust.md:108).** Silinen 22 satır yalnız araç adı taşımıyordu. Örneğin kimlik mimarı için “sessiz kimlik-kuralı değişikliği yasak”, compliance için kapsam değişikliği bildirimi, güvenlik mühendisi için kritik bağımlılık/sertleştirme duyuruları da silinmiş. `git diff 0467dbb6..HEAD` bunu gösteriyor. Araç adı kaldırılırken bu yükümlülükler, gerçek araçlarla sahibine yönlendirilerek korunmalı. **Madde 7 çürütüldü.**

2. **[Hamza’nın durum sorgusu hâlâ koşulsuz](/home/dxb/DxB%20Global%20OS/personas/ceo/agents-orchestrator.md:60).** Başlık değişmiş; ancak her intent için STATE, koşular, kuyruk, bütçe ve onay sorgusu duruyor. Slice B, satır 2’nin önerdiği “cevap canlı duruma dayanıyorsa” şartı uygulanmamış. Selamlaşma gibi isteklerde gereksiz sorgu talimatı kalıyor.

3. **[Tek satır sınırı 176 dosyada kalmış](/home/dxb/DxB%20Global%20OS/personas/design/design-ui-designer.md:104).** Eskalasyon cümlesi serbestleştirilmiş, fakat cadence satırındaki `immediate single line` / `tek satır` sınırı korunmuş. Slice C, satır 2 bunu da kısa uyarıya çevirmeyi öneriyor. Mevcut doğrulama script’i bu kalıbı saymıyor.

4. **[R20 uygulanmamış](/home/dxb/DxB%20Global%20OS/personas/risk-audit/automation-governance-architect.md:56).** Slice D1, satır 9’un yedi dosyada önerdiği büyük harf düzeltmeleri kalmış. Örneğin `HEDEFTİR`, `ANAYASASI`, `DOKUNULMAZDIR`, `GENİŞLETMEKTİR` içeren satır başlangıç commit’iyle birebir aynı. Korunan sınır etiketlerine dokunmadan önerilen düzeltmeler tamamlanmalı.

5. **[Hamza’nın dil satırı değişmemiş](/home/dxb/DxB%20Global%20OS/personas/ceo/agents-orchestrator.md:110).** “Teknik terimler ve komutlar aynen İngilizce” talimatı duruyor. Slice B, satır 8 bunu mevcut CEO dil kuralıyla çeliştiği için sadeleştirmeyi öneriyor. Genel `Dil: rapor Türkçe` grep’i bu özel satırı kaçırıyor.

Done-list maddelerinin sonucu:

| Madde | Verdict | Kanıt |
|---|---|---|
| 1 | STANDS AFTER ATTEMPTED REFUTATION | `verify-runtime.py`: bütün şablon sayımları 0/214; kapsam dışı B5 213/214 |
| 2 | STANDS AFTER ATTEMPTED REFUTATION | Üç eski muhakeme başlığına eşleşme yok |
| 3 | STANDS AFTER ATTEMPTED REFUTATION | Persona başlığından sonraki gövdelerde belirtilen kalıplar 0 |
| 4 | STANDS AFTER ATTEMPTED REFUTATION | `notify_broadcast` / `WebSearch/WebFetch` eşleşmesi yok |
| 5 | STANDS AFTER ATTEMPTED REFUTATION | [Ham çıktı](/home/dxb/DxB%20Global%20OS/.planning/quick/20261004-persona-old-patterns/evidence/tests-personas-r31-b43.txt:119): ruler 16/16; 135 test, 15 dosya passed |
| 6 | STANDS AFTER ATTEMPTED REFUTATION | 213 personada §§1–12 mevcut; Hamza’nın §13’ü korunmuş |
| 7 | REFUTED | Araç satırlarıyla birlikte rol yükümlülükleri silinmiş |

Ayrıca 213 dosyanın §12 metni standardın kanonik bloğuyla eşleşiyor; **İslami davranış metninde sıfır değişiklik** var. Hook sürümleri ve R13 satırlarının rol içeriği korunmuş; yeni “web aracı yok” ifadelerinde profil uyuşmazlığı bulmadım. İnşaat veritabanının audit sayacı denetim öncesi ve sonrası **1800 → 1800**.

⚠ **UNVERIFIED:** Testleri yeniden çalıştırmadım; ham çıktıyı denetledim. Tam battery ve kalan zorunlu kontrollerin çıktısı sunulmamış. Dosyalara yazmadım.
