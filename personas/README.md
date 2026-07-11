# personas/ — kadro dosyaları (holding'in çalışan dosyaları)

**Çalışan başına TEK dosya:** `personas/<departman>/<slug>.md` — TÜM kadro bu ağaçta görünür.
Yazım kaynağı BU DOSYALARDIR; DB = runtime + kalite kapısı kopyasıdır (tek yön senkron: dosya→DB).
(Kayıtlı uyarlama: EMPLOYEE_PERSONA_STANDARD §22 hükmü CEO emriyle tersine çevrildi, 2026-07-11.)

**Hedef org CANLI (E5.3b, CEO onayı 2026-07-11):** 19 departman + ceo (CEO Office) + legal-de
(legal pod'u) = 21 DB satırı; aktif kadro dosyası 158, hedef 179 (kalan 21 ADD uzman dalgalarında
açılır). `specialized`, `testing`, `support`, `research` departmanları KAPANDI
(migration `20260711005000_org_closure_e53b.sql`): move 42 uygulandı, merge 6 arşivlendi
(rol emici dosyada yaşar), retire 15 aşağıdaki `_library/`de.

## `_library/` — client-vertical şablon havuzu (aktif kadro DEĞİL)

CEO onaylı retire→library 15 dosya (silme değil arşiv; DB karşılığı: `agents.employment_status='archived'`
+ `library_items` kind='persona', sahip people-hr). Müşteri projesi gelince HR + ilgili head
v2'ye çevirip aktive eder — geri çağırma CEO kararıyla.

## Dosya yapısı

Her çalışan dosyası iki bölümdür:

1. **SİCİL** — 33 alan (EMPLOYEE_PERSONA_STANDARD §5). DB'den bilinenler dolu;
   persona yazımında dolacaklar `⏳ v2 yazımında dolar` işaretli; grant/model gibi
   canlı alanlar "kaynak: canlı DB" notlu (bayat kopya yasak).
2. **KİŞİLİK** — iki dürüst durumdan biri:
   - `# PERSONA — <Unvan>` başlıklı TAM v2 persona (11 bölüm, 150-300 satır, Fable yazımı), YA DA
   - `## KİŞİLİK — ⏳ FABLE-YAZIMI BEKLİYOR` + dalga/sıra bilgisi.

## Kurallar

- **Yazarlık:** TÜM personalar Fable 5 bizzat yazar (CEO K2). İskelet siciller mekaniktir
  (`scripts/gen-workforce-dossiers.sh`), kişilik yazmaz.
- **Eski ajans ham maddesi SALT REFERANSTIR** (CEO emriyle repo dışına arşivlendi:
  `~/dxb-archive/agency-agents-20260711.tar.gz`). Metni hiçbir kadro dosyasına gömülemez,
  "kişilik" diye gösterilemez. Sicilde yalnız "ham madde referansı (arşivde)" satırı bulunur.
  Persona yazarken tek dosya okumak (arşivi açmadan):
  `tar -xOzf ~/dxb-archive/agency-agents-20260711.tar.gz "agency-agents/<sicildeki yol>"`
  Arşiv yoksa (başka makine): persona yine yazılır — ham madde ZORUNLU DEĞİL, esin kaynağıdır;
  rol sözleşmesinin kaynağı WORKFORCE-GAP-MATRIX + spec'lerdir.
- **İsim politikası:** çalışanlara uydurma insan adı verilmez; rol adı/unvan kullanılır (CEO emri 2026-07-11).
- **Senkron:** `scripts/sync-personas-to-db.sh [dosya]` → `fn_persona_submit` (secret+injection
  taraması içeride); `--verify` DB↔dosya eşitliğini hash'le kanıtlar. ⏳ dosyalar atlanır.
- **Kalite kapısı:** submit sonrası `fn_persona_gate` verdikti (Fable 5-soru kontrolü);
  `quality_gate='passed'` olmadan çalışan AKTİVE EDİLEMEZ (DB trigger — spec G3).
- **Taşıma/birleşme:** matris kararı (move/merge) uygulanınca dosya `git mv` ile taşınır,
  DB migration aynı commit'te gider — dosya ağacı her an DB gerçeğini yansıtır.

## Sıra (E5.3 → E5.5)

Müdürler (19 head) → HR ailesi → uzman dalgaları D1-D6 (WORKFORCE-GAP-MATRIX §5.5).
Hedef kadro ve karar matrisi: [[../HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX]].
Yetişmeyenler "Fable-yazımı bekliyor" listesinde sıralanır; kalite düşürülerek kapatılamaz (K2).
