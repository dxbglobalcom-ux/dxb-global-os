# DXB Command Center — Tasarım Yönü Kaydı (R-kapısı, BAĞLAYICI)

> Tarih: 2026-07-11 ~01:56 · Karar veren: CEO ("c-hibrit seçeneği aynen uygula")
> Süreç: 22 referanslık görsel pano (board.html — Artifact kopyası) → CEO seçimi
> Üst kontrat: [[../../HOLDING-OS-MASTER-PLAN/DESIGN_SYSTEM]] (token değerleri DEĞİŞMEZ) · U7 kaydı: 00-INDEX.md

## Seçilen yön: REÇETE C — DXB HİBRİT

**B'nin malzemesi + A'nın derinliği ve bağlantı dili.** Şampanya-obsidyen lüks
zemin üstünde JARVIS derinliği; holo-glow SADECE canlı veri ve seçimde (B3
disiplini). Hem holding ciddiyeti hem "demir adam" anı.

## R-eşleme tablosu (görsel → alınan şey → uygulama yüzeyi)

| Ref | Dosya | Alınan | Uygulama |
|-----|-------|--------|----------|
| R17 | refs/lux-drb-3.jpg | Siyah+şampanya malzeme, finans tipografisi | Panel/kart zemini, fin modülleri |
| R8 | refs/fui-behance-ultron-3.jpg | Panel yüzey dokusu: mikro-grid, kenar ışığı | `ambient-depth` utility, panel katman farkı |
| R23 | refs/auto-porsche-taycan.jpg | Donanım zarafeti, kontrollü parlaklık | Kenar/gölge disiplini, "ucuz parlaklık yok" |
| R13 | refs/cc-drb-7.jpg | KPI şeridi + orta bölge + trend yoğunluk dengesi | Overview kompozisyonu |
| R3 | refs/fui-jayse-hud03.jpg | Merkez odak + çevresel widget halkası | Overview: Health merkez-sol, KPI çevre |
| R4 | refs/fui-jayse-hud04.jpg | Yoğun ama hiyerarşik canlı veri | /live, canlı paneller motion dili |
| R11 | refs/cc-drb-3.jpg | Canlı akış/harita görselleştirme | Live Ops (E8 Broadcast dalgasında) |
| R6 | refs/fui-territory-avengers.jpg | 3D wireframe varlık dili | Org graph / model routing (WebGL, E6.3+) |
| R15 | refs/mc-spacex.jpg | Dev ekran + konsol hiyerarşisi | TV modu (E12), 34" ultrawide grid |
| R12 | refs/cc-drb-5.jpg | Tek tasarım dili 3 cihazda (telefon dahil) | Mobil kokpit hedefi |
| R14 | refs/cc-drb-8.jpg | Telefonda taktik komuta hissi | Mobil kokpit hedefi |
| R21 | refs/voice-drb-4.jpg | Canlı voice orb + komut dökümü | JARVIS ses yüzeyi (E-voice dilimi; renk şampanyaya çevrilir) |
| R2 | refs/fui-jayse-mark7-layout.jpg | Her widget'ın işlevi etiketli fonksiyon haritası | Bağlantı kontratı: ikon=modül=veri ailesi tek kaynak |

## Bağlantı kontratı (CEO şartı: "her şey bağlantılı olacak")

1. İkon + canlı sayaç + drill hedefi tek kaynaktan: `src/config/command-nav.ts`.
2. Modül ↔ canlı veri ailesi eşlemesi: `src/config/module-live.ts` — inşadaki
   her modül kendi ailesinin GERÇEK sayısını ve ilgili canlı yüzeyin kapısını gösterir.
3. Her sayı bir kapıdır (CC-SPEC 2B): drillHref'siz metrik render edilemez.
4. Salt metin placeholder yasak (D4); "No data" tek başına yasak (§34).

## Uygulama durumu

- Dalga 1 (commit 3ac7444): SideNav ikon+sayaç, Holding Health radial, ambient-depth,
  live-glow, ModuleWaiting v2, approvals göçü, legacy köprüler.
- Dalga 2 (2026-07-11): gerçek modül sayfaları CANLI — /ops/tasks (durum
  çipleri + KPI + gerçek kuyruk), /org/employees (153 kadro, departman
  çipleri, persona v1→v2 görünürlüğü), /fin/costs (COST-04 tek-kaynak
  kırılımlar + defter) + /design-audit (çalıştırılmış kontrat kontrolleri:
  hex-leak, sözlük paritesi, bağlantı kontratı). "Aktif" tek tanıma indi
  (queued+claimed+running — view/bar/nav/modül aynı sayı).
- Sıradaki: chart sistemi, mobil kokpit pası, TV modu.

## Yasaklar (değişmedi)

Parlak sarı/turuncu/kahverengi gold YOK · glow enflasyonu YOK (yalnız canlı
veri + seçim) · ucuz glassmorphism YOK (blur yalnız e3) · neon-cyberpunk
temel çizgi DEĞİL (U6 gevşemesi: kontrollü holo vurgu serbest) · pie chart
minimum · fake metrik YASAK (§35).
