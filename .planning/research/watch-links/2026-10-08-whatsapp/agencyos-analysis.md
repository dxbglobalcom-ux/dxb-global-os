# AgencyOS / JARVIS — derin inceleme

> Ekran görüntüleri (`shots/`, 53 kare) ve dökümler depoda değil, diskte: `~/.cache/link-watch/2026-10-08-whatsapp/` (shots/, transcripts/, transcript.txt).

**Kaynak:** Mert Durmazer | Digital Academy, "Yapay Zeka Ajansı Kurmak Bu Kadar Kolay Olmamıştı" — https://www.youtube.com/watch?v=68smw4td9ZU (23:12, yayın 15 Nis 2026; 2026-10-08 itibarıyla 10.759 görüntüleme).
**Nasıl okundu:** CEO'nun Chrome'unda, kendi sekmemde. Transkript YouTube'un otomatik Türkçe dökümünden alındı (`transcript.txt`). Ekranlar 1080p'de, tiyatro modunda, uygulama bölgesine yakınlaştırılarak çekildi (`shots/`, dosya adı = videodaki saniye).
**İşaretler:** (V) ekranda görüldü · (T) transkriptte söyleniyor · (W) web kaynağı. Pazarlama rakamları **"onun iddiası"** diye yazıldı.

## 0. Konu haritası (saniye → konu → ekran)

| Zaman | Konu | Ekran |
|---|---|---|
| 0:00–1:47 | Giriş, Jarvis benzetmesi, araya giren arayüz görüntüleri | `0060-intro-talking-head`, `0095-map-karsiyaka-lead-card-voice`, `0120-lead-detail-ai-enrichment` |
| 1:47–3:13 | Kendini tanıtma, Skool reklamı | `0196-skool-community` |
| 3:13–3:40 | Skool dersi "AI Ajansı Operasyon Sistemi" ve AgencyOS ders metni | `0207`, `0209`, `0211`, `0211.3`, `0211.5`, `0211.7`, `0212`, `0212.2`, `0212.3`, `0212.5`, `0213` |
| 3:40–4:44 | Harita + JARVIS LIVE paneli | `0225-map-turkey-jarvis-live`, `0250-map-80-leads-jarvis-offline` |
| 4:44–8:04 | Sesli konuşma: İzmir lead'leri → Karşıyaka diş klinikleri → %85 skor → premium paket → CRM ve proje | `0300-map-izmir-clusters-voice`, `0440-map-lead-card-voice-speaking` |
| 8:04–9:43 | Yazılı komut: Beşiktaş'ta 20 diş kliniği → Apify → 20 pin, araç çağrıları | `0505`, `0536`, `0552`, `0578` |
| 9:43–10:32 | CRM kanbanı ve satış hunisi | `0616-crm-pipeline-kanban-drag`, `0630-crm-sales-funnel` |
| 10:32–10:55 | Dashboard (KPI, hızlı başlangıç, entegrasyonlar), AI Asistan | `0636`, `0642`, `0655-ai-assistant-global-error404` |
| 10:55–11:02 | Gelir Yolculuğu | `0660-revenue-journey-platform` |
| 11:02–13:17 | Projeler, proje çekmecesi, servis kataloğu, tekrarlayan görev, haftalık takvim | `0667`, `0680`, `0695`, `0742` |
| 13:17–15:23 | İş Formülleri; sesle "eski müşteri canlandırma" ekleme | `0800`, `0806`, `0812`, `0890` |
| 15:23–16:00 | Projede ikinci servis | `0936-project-two-services-currency-mix` |
| 16:00–16:16 | Olay akışı, intake kuyruğu, operasyon kaydı | `0968`, `0974` |
| 16:16–16:24 | Yönetim Kurulu | `0978`, `0980` |
| 16:24–17:21 | Projeler (hata), niş playbook'ları, offer kütüphanesi, case study'ler | `0982`, `0988`, `0998`, `1010` |
| 17:21–17:45 | Ayarlar → Claude Code token | `1050-settings-claude-code-token` |
| 17:45–22:22 | Claude Code: mcp.json, 62 araç, projeler, denetim, plan, reaktivasyon sprintleri | `1075`, `1110`, `1140`, `1165`, `1225`, `1345` |
| 22:22–23:12 | Kapanış: e-posta, WhatsApp ve Instagram vaadi; topluluğa davet | (konuşan kafa) |

## 1. Sistem gerçekte ne, ne yapıyor

**Ne olduğu.** Tek kişilik bir AI ajansı için yazılmış bir web uygulaması. Netlify'da duruyor (`agencyos-app-88990.netlify.app`, şimdi `ajans.digitalacademy.com.tr` adresine yönleniyor) (V `0212.2`, W). Verisi Postgres/Supabase'de (V `0636`). Ayrı satılmıyor; Digital Academy Skool üyelerine veriliyor (T 3:13, 17:06; W). Model düzeni BYOK: kullanıcı kendi Gemini anahtarını Vault'a koyuyor; Apify ve OpenRouter anahtarları isteğe bağlı (V `0211`, `0655`).

**Sol menüde 8 bölüm var** (V `0211.3`, `0636`): Harita + JARVIS · CRM Pipeline · Dashboard · AI Asistan · Gelir Yolculuğu · Projeler · Oyun Kitapları · Ayarlar. Ayarların sekmeleri: Altyapı, Vault, Ekip, Claude Code, Özel Alanlar, Telegram (V `1050`). Üstte bir "AJANS / MÜŞTERİ" geçişi var (V `0974`); müşteri görünümü hiç açılmadı.

**JARVIS.** Panelin altında "GEMINI 3.1 FLASH LIVE • 100 İŞLETME • 15 ŞEHİR • 54 TOOL" yazıyor (V `0225`). Ders metnine göre ses Gemini 3.1 Live Preview ile, yazı Gemini 2.0 Flash ile çalışıyor (V `0211.3`). Kendisi de yazının sesten ucuz olduğunu söylüyor (T 8:28). Araç çağrıları panelde görünüyor: `SCAN_GOOGLE_MAPS`, `✓ ADD_TO_CRM`, `✓ CREATE_PROJECT`, `✓ ADD_SERVICE_TO_PROJECT` (V `0505`, `0552`). Ses bağlantısı bir kez "Bağlantı kapandı — code=1000" ile koptu (V `0250`).

**Canlı çalıştığı görülenler** (kanıtı güçlüden zayıfa):
1. **Lead tarama.** "istanbul beşiktaş 20 tane diş kliniği" komutu verildi. Sıra şöyle ilerledi: "Apify tarama başlatıldı" → "taranıyor" → "20 işletme haritaya eklendi" → "CRM: 20 yeni lead eklendi". Sayaç 80'den 100'e çıktı ve iş yaklaşık 1 dakika sürdü (saat 15:21 → 15:22) (V `0505` → `0536` → `0552`). Lead kartında telefon, adres ve "SCORE: 76%" görünüyor (V `0578`).
2. **Konuşarak kayıt.** Ses ya da yazıyla lead "Contacted" yapılıyor, proje açılıyor, servis ekleniyor (V `0552`, `0578`, `0680`).
3. **Proje çekmecesi.** İçinde bağlı lead, retainer, servisler (duraklat), görevler, haftalık takvim (sabah/öğlen/akşam × 7 gün), notlar ve "Otomasyonlar (canlı · 30s poll)" var (V `0680`, `0742`).
   - Tekrar seçenekleri: tek seferlik, her gün adıyla, ayın 1'i, ayın 15'i, çeyreklik (V `0695`).
   - Servis kataloğu: GEO $1500, Reklam $2000, AI Agent Fleet $1500, İçerik $800, Pazar Araştırması $5000, Özel Servis $1000 (hepsi aylık) (V `0695`).
4. **Claude Code köprüsü.** Akış şöyle:
   - Ayarlar'dan MCP token alınıyor ve `~/.claude/mcp.json` dosyasına yazılıyor.
   - Uç nokta curl ile doğrulanıyor ve "Tool count: 62" dönüyor. İlk beş araç: `list_businesses`, `get_statistics`, `scan_google_maps`, `scrape_status`, `import_scraped_leads` (V `1075`).
   - MCP oturuma yüklenmediği için Claude Code HTTP üzerinden 3 projeyi tablo olarak çekiyor (V `1110`).
   - Ortam: Opus 4.6 (1M), dal `feat/lead-dashboard`, "Now using extra usage" (V `1075`).
5. **Claude Code önce JARVIS'in verisini denetledi** (V `1165`). Bulduğu hatalar:
   - Lead aşaması hâlâ "Contacted" (Won olmalıydı).
   - Brief boş, `companyId: null`.
   - "GEO raporu" görevi mükerrer eklenmiş.
   - Toplam fatura ₺0.
   - Playbook'un önerdiği GEO ve Google Ads servisleri eksik.

   Sonra 3 fazlı bir plan yazdı ve upsell önerdi (MRR ₺52K → ₺87K) (V `1165`). Ardından 6 sprintlik bir reaktivasyon planı çıkardı: KVKK onay kontrolü, 4 persona, WhatsApp drip (Gün 0/3/7/14/30), booking akışı, 300 kişilik pilot, KPI'lar, "günde 500 kontakt" sınırı. Plan "Onay verirsen…" diye bitiyor (V `1225`, `1345`). **Videoda hiçbir şey inşa edilmedi.** "Çözümü de kendi oluşturuyor" (T 4:36) ekranda görülmedi; görülen yalnızca bir plan.

**Kapalı ya da çalışmayanlar:**
- Entegrasyonlar: N8N, SUITECRM, DOCUMENSO, INVOICESHELF, INFISICAL **KAPALI**; yalnız APIFY ve POSTGRES **BAĞLI** (V `0636`, `0642`, `0968`). Üst çubukta da "N8N: KAPALI" yazıyor (V `0974`). Yani "sözleşme oluşturuyor, ödeme alıyor" (T 4:19, 19:03) yalnız sözde kalıyor; kendi demosunda sözleşme ve fatura yolu kapalı.
- KPI'lar: Ajans getirisi **$0 "ANLAŞMA YOK"**, Cluster sağlığı %29 (2/7) (V `0636`). "Olay Akışı: NO EVENTS", "Intake: QUEUE EMPTY" (V `0968`).
- Yönetim Kurulu: yalnız boş ekran gösterildi ("Kurul hazır… İlk mesajını bekliyor, TUR: 0"). Kadroda "Strateji Direktörü" var. Dashboard adımı "KEY GEREKLİ, MODELS: —, STAGE2: OFF" diyor (V `0978`, `0980`, `0642`). Hiç çalıştırılmadı.
- AI Asistan ve Projeler sayfaları "ERROR 404 Request failed" verdi (V `0655`, `0982`). Oyun Kitapları açılışta "Yükleniyor…" ekranında kaldı (V `0800`).
- Telegram: yalnız bir sekme başlığı (V `1050`) ve ders metni var (V `0212.5`). Canlı gösterilmedi.
- Üst şerit sistemin kendi olaylarını yazıyor ("AI: Pitch şablonları güncellendi", "OPS: Lead puanlama modeli güncellendi", "İSTİHBARAT: Pazar verileri güncellendi") (V `0440`, `0536`, `0552`). CEO'nun hükmü (2026-10-08): bu sistemde hiçbir şey süs değil.

**Bilgi katmanı (V):**
- **İş Formülleri** (`0806`, `0812`): 6 formül var. Her birinde sorun hikâyesi, değer hikâyesi, kopyala-yapıştır satış scripti, örnek rakamlar, TR/Global fiyat ("TRY 12,000/ay +setup 100,000"), uygulama notu ve **ANTI-PATTERNS** bölümü bulunuyor.
- **Niş playbook'ları** (`0988`): Muhasebe $4.000, oto galeri $3.800, güzellik salonu $1.800, koç $3.300, inşaat $4.500, diş $4.000, e-ticaret $3.000, spor salonu $3.000 (aylık). JSON'da itiraz cevapları, Türkçe teklif şablonu, `claudePromptHints` ve TR/EN `pitchArguments` var (`1140`).
- **Offer Kütüphanesi** (`0998`): Ana kalıp "X'i Y sürede yaparım VEYA Z risk karşılığı", formül "Conversion = (ROI × Güven) / Friction". Örnekler: "Garanti Lead Üreten Ads", "Ücretsiz SEO Denetimi".
- **Case study'ler** (`1010`): 32 adet, hepsi "anonimleştirilmiş". Doğrulanamazlar.
- **Gelir Yolculuğu** (`0660`): Funnel hesaplayıcı (Hedef MRR 5000, retainer 800, kapanış %25, görüşme %15), 0/7 adım. Pipeline potansiyeli $40.000; faturalanan $0.
- **CRM** (`0616`, `0630`, `0211.7`): Aşamalar New → Contacted → Replied → Booked → Proposal → Won, bir de Lost. Kanban sürükle-bırak çalışıyor. Lead detayında "AI Zenginleştirme: Hızlı (Gemini) / Derin (Sonnet)" seçeneği var (`0120`).

**Onun iddiaları:**
- "Bu ay … 40.000 dolara vardı" (T 12:39)
- "Ayda 10.000$" (T 4:00, video açıklaması)
- "İki startup dünya devleriyle rekabet ediyor" (T 2:25)
- "Globalde de yapanı görmedim" (T 22:55)
- "%1200 ROI": bir şablon alanı, ölçülmüş sonuç değil (V `0812`)

## 2. Yetenek tablosu

CEO'nun hükmü (2026-10-08): bu, B28'den ayrı bir çalışma — B28 ile bağlantılı ama B28 değil.

Dosya yolları `/home/dxb/DxB Global OS/` altında. Kısaltmalar: `M/` = `db/migrations/`, `P/` = `packages/`, `D/` = `apps/dashboard/src/app/(command)/`, `HP/` = `HOLDING-OS-MASTER-PLAN/`. "Bizde" sütunu, depoyu salt-okunur tarayan bir ajanın 2026-10-08 ölçümünden geliyor.

| Yetenek | Onda nasıl | Bizde ne var (dosya) | Eksik | Tahta satırı | Bizim daha iyi yapacağımız |
|---|---|---|---|---|---|
| Lead bulma | Apify Maps taraması, ses ya da yazıyla, ~1 dk (V `0505`–`0552`) | `P/revenue/src/discovery.ts`, `M/20260726009000_revenue_discovery.sql`: iş fikri arıyor, müşteri listesi değil | Prospect tablosu, Maps adaptörü, koordinat | Ayrı çalışma (B17 ile bağlantılı) | Helal eleme taramadan önce yapılır; her lead'de kaynak ve tarih; mükerrer kayıtlar birleştirilir |
| Lead skorlama | %72–%87 skor; Gemini/Sonnet zenginleştirme (V `0120`, `0578`) | `P/revenue/src/jobs.ts` (`revenueScore`), `M/20260726012000_w23_revenue_gates.sql`: yalnız fırsat skoru | Lead skoru ve gerekçesi | B17, B34 | Skorun nedeni görünür; ucuz ilk geçişi B34'teki yerel model yapar |
| CRM pipeline | 6 aşama + Lost, kanban, huni (V `0616`, `0630`) | `M/20260707000006_crm.sql`, `M/20260710000017_crm_ceo_edit_path.sql`, `D/revenue/crm/*`, `apps/dashboard/src/lib/crm.ts`. Aşamalar yalnız `open/proposal/won/lost`. Ajan aracı `crm_get` STUB | contacted/replied/booked aşamaları; ajanın CRM'e yazması | Ayrı çalışma (B05 ile bağlantılı) | Aşama değişimi olay olarak canlı akar (B10); tutarlılık yazma anında kontrol edilir (onda bunu sonradan Claude Code buldu, `1165`) |
| Paket ve fiyat önerisi | Skora göre premium paket (T 6:34); $ katalog (V `0695`, `0988`) | Yalnız `crm_deals.value_eur` | Servis kataloğu, fiyat listesi, teklif | Ayrı çalışma (B43 ile bağlantılı) | Para birimi alanı zorunlu; onda TL ve $ karışıyor |
| Teklif, sözleşme, fatura | "Sözleşme oluşturuyor" (T); Documenso/InvoiceShelf KAPALI (V `0636`) | `P/outbox-executor/src/actions/email-send-staging.ts` (yalnız test); `D/fin/providers/page.tsx`; gerçek Gmail/Stripe/DocuSign yok | Tümü | B05 | **Onay kapısında durur**: taslağı sistem yazar, gönderimi CEO onaylar |
| Proje ve tekrarlayan görev | Çekmece, retainer, servis, haftalık takvim (V `0680`–`0742`) | `M/20260711002300_workflow_project_family.sql`, `M/20260713090000_e91_workflow_engine.sql` (cron), `M/20260727001000_w26_proactive_briefing.sql` | Proje–müşteri–servis bağı; müşteri raporu | Ayrı çalışma (B43 ile bağlantılı) | Görev "yapıldı" sayılmak için çıktı kanıtı ister; mükerrer görevi şema engeller |
| Niş playbook'ları | 20 niş, fiyat, itiraz, pitch, Claude ipucu (V `0988`, `1140`) | `M/20260711002400_library_family.sql`, `M/20260714020000_e95_library.sql`, `HP/HOLDING_LIBRARY_SPEC.md`: depo var, içerik yok | İçerik | Ayrı çalışma (B17 ile bağlantılı) | Her rakamda kaynak ve tarih; anti-pattern alanı alınır |
| İş formülleri | 6 çapraz-niş formül (V `0806`, `0812`) | `.planning/research/REVENUE-OPPORTUNITIES.md` | Yapılandırılmış katalog | B17 | Sonuçlar gerçek projelerden ölçülür |
| Offer kütüphanesi | Garanti / risk kalıbı (V `0998`) | Yok | Tümü | Ayrı çalışma | Garanti maddeleri CEO'nun helal hükmüne gider |
| Case study'ler | 32 anonim şablon (V `1010`) | Yok | Tümü | Ayrı çalışma | Yalnız kendi işimizden gerçek vaka |
| Gelir yolculuğu | Hedef MRR hesaplayıcı, 7 adım (V `0660`) | `M/20260717020000_r12a_revenue_engines_seed.sql`, `M/20260717020100_r12b_objectives_opportunities.sql`, `M/20260712011000_revenue_pnl_e65.sql`, `D/revenue/{objectives,opportunities,portfolio}`, `HP/REVENUE_ENGINE_SPEC.md`: kurulu | 16 yapı raporu 2026-07-09'dan beri CEO'ya sunulmadı | B17 | Gerçek P&L zaten var; huni hesabı gerçek oranlarla beslenir |
| Yönetim kurulu | Boş ekran; "KEY GEREKLİ" (V `0978`, `0642`) | `HP/VOICE_INTERACTION_SPEC.md` §3.4 (yalnız spec); `P/orchestrator/src/critical-gate.ts` bir çürütme kapısı, toplantı değil | Tümü | B01 | Direktörler sesli tartışır, CEO dinler, karar ve gerekçe kayda girer |
| Sesli asistan | Gemini 3.1 Flash Live, 54 araç (V `0225`) | `P/voice/src/*`, `apps/jarvis`, `D/voice`. Hız 2.73 s. **Hamza'nın ses ve chat yolunda `tools: []`** (`P/voice/src/answer.ts`, `P/orchestrator/src/chat-drain.ts`) | Hamza'ya araç; 1.0–1.3 s hedefi | B03, B12 | Sesle kayıt yapar; dışarı giden her araç onaydan geçer |
| Telegram | Sekme ve ders metni; canlı yok (V `1050`, `0212.5`) | Kaynakta yok | Tümü | yok | CEO kanalı: brifing, onay bekleyenler, tek dokunuşla onay/ret |
| Claude Code MCP köprüsü | Kullanıcı tokenı, HTTP MCP, 62 araç (V `1050`, `1075`, `1110`) | `P/dxb-mcp/src/index.ts`, `groups/*.ts`: holdingin işçileri için 28 araç; `.mcp.json`'da yok | İnşaat oturumlarına salt-okunur köprü | B41, B51 | Salt-okunur, süreli token; yazma araçları onay kapısından; token ekrana basılmaz |
| İki çalışan modeli | "Jarvis CEO'nuz, Claude Code mühendisiniz" (T 19:52–20:16) | `P/kernel/src/sdk-isolation.ts`, `AGENTS.md` (~170. satır, ayrı `DxB_Build`), `.claude/skills/dxb-hamza-context`: kodda ayrık, tek belgede adı konmamış | Tek sayfalık tanım | B51 | "Mühendis önce asistanın verisini denetler" kural olur (`1165`) |
| Harita | Koyu harita, kümeler, filtre, lead kartı (V `0225`, `0300`) | Harita yok, lat/lng yok; canlı akış var: `D/live/page.tsx`, `v_live_ops`, `M/20260713060000_e83_ops_live_triggers.sql` | Harita | Ayrı çalışma (B10 ile bağlantılı) | Pin tarama bitince düşer (onda da öyle, V `0505`→`0552`) |
| Canlı dashboard | KPI, entegrasyon "LIVE", "NO EVENTS" (V `0636`, `0968`) | `D/live` | B10 açık | B10 | Sıfır da gerçek cevaptır; "son ne zaman bildi, ne zaman uyanır" gösterilir |
| Onay kapısı | Yok: sesle anında yazıyor; soğuk arama, WhatsApp, Instagram vaadi (T 5:32, 15:50, 22:32) | `M/20260707000003_approvals_outbox.sql`, `M/20260713110000_approval_center.sql`, `P/outbox-executor/src/scheduler.ts`, `D/approvals`: kurulu; yalnız 2 eylem türü izinli | Gerçek dış kanal | B15 | Yabancıya giden ilk mesaj, para ve sözleşme CEO'da durur |
| İslami sınır | Görünmedi | `M/20260717010000_r15_halal_screen_policy.sql`, `P/hook/src/pre-task.ts:120`, `M/20260726015000_w25_halal_birth_refusal.sql`, `P/outbox-executor/src/scheduler.ts:91`: kapalıyken reddeder | Lead ve niş seviyesinde eleme | anayasal | Taranan işletme ve playbook helal ekranından geçer |

## 3. Alınacak en değerli 5 şey (sırayla)

Sıralama, videoda gerçekten çalıştığı görülenlere göre yapıldı.

1. **Konuşarak tarama → harita → CRM döngüsü** (V `0505`–`0578`). Tek cümle 1 dakikada 20 pin ve 20 kayıt üretti. **Uygulama (ayrı çalışma; B10 ile):** Bir `prospects` tablosu (kaynak, tarih, koordinat, helal kararı, skor gerekçesi). Tarama aracı scrapling ya da bir sağlayıcı olur; önce `.planning/research/STACK.md` okunur, çünkü Apify yeni bir bağımlılık. Pin ancak tarama bitince düşer.
2. **Hamza'ya yazma araçları** (V `0552`). Bizde Hamza'nın 0 aracı var. **Uygulama (B03/B12 + B15):** `dxb-mcp`'nin kayıt araçları (CRM, proje, görev) Hamza'ya açılır. Dışarı giden her şey onay kuyruğuna düşer. Panel, araç çağrısını onay durumuyla birlikte gösterir.
3. **Playbook, formül ve itiraz/pitch şeması** (V `0806`, `0812`, `0988`, `1140`). **Uygulama (ayrı çalışma; B17 ile):** Kütüphane sözleşmesinin içine (`HP/HOLDING_LIBRARY_SPEC.md`) "playbook" ve "formül" türleri eklenir. Her rakam kaynak ve tarih taşır. Anti-pattern alanı alınır. Helal ekranını geçemeyen niş giremez.
4. **Proje çekmecesi: müşteri × servis × tekrarlayan görev × rapor** (V `0680`–`0742`, `0212`). **Uygulama (ayrı çalışma; e91 motoru):** Projelere müşteri ve servis bağı eklenir. Tekrar, cron tetikleyicisine bağlanır. Mükerrer görevi şema engeller. Bir görev ancak çıktı kanıtıyla "yapıldı" sayılır.
5. **Mühendise salt-okunur MCP köprüsü ve "önce denetle" kuralı** (V `1075`, `1110`, `1165`). **Uygulama (B41/B51):** `dxb-mcp`'nin salt-okunur bir alt kümesi, süreli bir tokenla inşaat oturumlarına açılır (SELECT-only kuralına uygun). Sıra: plan → CEO onayı → inşa → Sol denetimi.

## 4. Kopyalanmayacaklar

- **Onay kapısız dış iletişim.** Soğuk arama (T 5:32), "Instagram'dan yakasına yapışılacak", WhatsApp (T 22:37), hastalara WhatsApp drip'i (V `1345`). Bizde bunlar CEO onayında durur. KVKK açık rızası ve WhatsApp Business kuralları da var; Claude Code'un kendi planı bile KVKK maddesini koydu (V `1225`).
- **Para birimi karmaşası.** Kendisi "40.000 bu dolar değil" diyor (T 11:12), ama ekranda `$40000/mo` ve `MRR: $52,000/mo` görünüyor (V `0680`, `0936`). Formülde "TRY 12,000/ay +setup 100,000" yazıyor, çekmecede "$12,000/mo + $100,000 setup" (V `0812` ↔ `0936`). Claude Code ise "₺40.000/ay" yazdı (V `1110`).
- **Anonim case study'ler ve "%1200 ROI"** (V `1010`, `0812`). Ölçülmemiş bir şeyi kanıt diye sunmak bizim kuralımıza aykırı.
- **Garanti / risk-tersine çevirme kalıbı** (V `0998`). İade mi, ceza mı, şarta bağlı ücret mi olduğu şer'î açıdan CEO'nun hükmüne kalır. Ben hüküm vermiyorum; hükümden önce kullanılmamalı.
- **BYOK Gemini + n8n + SuiteCRM + Documenso + InvoiceShelf + Infisical yığını** (V `0636`, `0211`). STACK kuralımıza çarpıyor (ikinci iş runtime'ı yok, ham anahtar yok). Üstelik kendi demosunda hepsi kapalı.
- **Sırrı ekrana basmak.** Canlı MCP bearer token (`agcos_mcp_…`) ekranda okunuyor (V `1075`). Bu notlara alınmadı.
- **"Teknik bilgi yok" vaadi** (T 22:12). Bizim işimiz kurs satmak değil; iddialar kanıtla ölçülür.

## 5. Doğrulayamadıklarım

- **Uygulamanın içi.** `ajans.digitalacademy.com.tr` yalnız "🏢 AgencyOS — Giriş yap" gösteriyor (W, 2026-10-08). Kayıt, üyelik ya da ödeme yapılmadı. 54 JARVIS aracının ve 62 MCP aracının tam listesi görülmedi. Yalnız ders metnindeki örnekler biliniyor: `scan_google_maps`, `list_businesses`, `add_to_crm`, `update_lead_stage`, `add_lead_note`, `create_project`, `add_task`, `save_project_report`, `get_playbook`, `apply_playbook`, `find_case_studies`, `get_daily_briefing`, `check_payments` (V `0212.3`).
- **Herkese açık repo yok.** GitHub'daki "agencyos" repolarının hiçbiri Durmazer ya da Digital Academy'ye bağlanamadı (W, `gh search repos`).
- **Fiyat — kaynaklar çelişiyor** (W, 2026-10-08):
  - skool.com/otomasyon/about: $29/ay, $200/yıl, 428 üye.
  - digitalacademy.com.tr Standard: $89/ay (₺1.590/ay ya da ₺7.999/yıl).
  - digitalacademy.com.tr Premium: $329/ay (₺3.390/ay, ₺25.000/yıl).
  - Mentorluk: Temel ₺7.999, Pro ₺30.000/ay.
  - Çekim günü Skool 341 üye gösteriyordu (V `0196`). Hangisinin güncel olduğu bilinmiyor.
- **Ölçülemeyenler.** Ses gecikmesi ölçülemedi (video kesilmiş olabilir). Skor algoritması gösterilmedi (T 9:39).
- **Ekranda hiç çalışmayanlar.** Dış iletişim, sözleşme, ödeme, Yönetim Kurulu ve Telegram.
- **Ekran ile söz çelişkileri:**
  - JARVIS "40.000 TL" dedi (V `0578`), arayüz $40,000 kaydetti (V `0680`).
  - CRM kanbanı 64 yeni lead gösteriyor (V `0616`), harita 100 (V `0552`).
  - MCP yanıtında üç proje de "active", arayüzde ikisi "INTAKE" (V `1110` ↔ `0667`).
- **Otomatik transkript.** "350 KTL" (T 6:52) belirsiz; tahminle düzeltilmedi.

**Kaynaklar (W):** https://www.skool.com/otomasyon/about · https://digitalacademy.com.tr · https://ajans.digitalacademy.com.tr/ · GitHub araması: https://github.com/subtract0/AgencyOS ve diğer "agencyos" repoları (hiçbiri ilgili değil).