---
name: chat-repair-discovery-2026-07-26
description: "2026-07-26 sabahı: CEO'nun chat'i ölüydü (kolon-bazlı grant + yerleşik servis yeniden başlatılmamış); U27 tamiri + W2.2 keşif motoru canlı kanıtla kapandı; motor CEO-tetikli"
metadata: 
  node_type: memory
  type: project
  originSessionId: f4d4d08f-07f8-4496-b60a-f8bda0013418
  modified: 2026-07-26T09:37:41.536Z
---

**2026-07-26 05:45-11:00, 4 commit (adb206c, fc825ba, 6132ccc, 02f9d9a).** CEO gece
vardiyasının işini kullanmaya kalktı ve chat ölüydü. Sabahın tamamı bunun tamiri +
W2.2.

## En pahalı iki ders (tekrarlamayacak)

1. **Kolon-bazlı GRANT tuzağı.** `grant insert (role, content, mode)` — W1.5
   `session_id` ekledi, izni genişletmedi. RLS masumdu, duvar tablo iznindeydi ve
   `role_table_grants` bunu HİÇ göstermiyor (kolon izni ayrı katalogda). Kalıcı
   çözüm: tek kapı `fn_chat_post_message` + doğrudan INSERT iptal + yeni kapı testi
   `tests/c9/dashboard-doors.test.ts` (dashboard'ın çağırdığı her `.rpc()`/`.from()`
   kaynaktan okunur, `authenticated` izni makinece doğrulanır).
2. **Runtime kodu yayınlamak ≠ yayınlamak.** Yerleşik zamanlayıcı 25 Tem 17:16'dan
   beri koşuyordu, W1.5 ise 26 Tem 03:56'da çıktı — U23/U24/U25/U26'nın TAMAMI
   bellekte hiç yüklenmedi. **Yeni kural: aynı turda `dxb-scheduler` + `dxb-jarvis`
   yeniden başlatılır ve restart kanıtın parçasıdır.** Değişmez artık şemada
   (`chat_messages.session_id NOT NULL`) — test, bayat süreci durduramaz.

## Diğer kusurlar (hepsi kapandı)

- ChatBoard soft-navigation'da yeniden kurulmuyordu: "yeni konuşma" eski konuşmayla
  açılıyordu → `key={sessionId}`; Broadcast da konuşmaya kapsandı.
- `if (res.ok)` else'siz: 500 sessizdi. Artık sebep ekranda, yazı kutuda kalır.
- Tasarım: çip duvarı → kendi kaydırmalı konuşma sütunu; yazma alanı ekranın
  ALTINDA kalıyordu, artık içeride; başlıksız konuşma CEO'nun kendi ilk cümlesini
  alır (`v_chat_threads`).
- `/ai/models` ham katalog id'si basıyordu (CEO kendi modelini "fable-5" diye
  okudu) → yalnız başka adı olmayan satırda gösterilir.

## W2.2 — keşif motoru (U28)

scrapling projede **hiç çağrılmamıştı**. Kuruldu: `commissionScoutingRun` +
`harvestScoutingRuns` + `revenue_scout_runs`, mevcut işçi rayında.
**Dört kusuru holdingin KENDİ kapıları yakaladı** (hepsi benim): proje bağı yok;
brief yasak kategorileri sayınca halal ekranı kendi talimatında kapandı (CEO'nun
"bahis" sınıfı — sınır artık kural, kelime listesi değil, mekanik testli);
JSON-içinde-JSON dört canlı koşuya mal oldu (satır bloğu formatına geçildi); ve
**bilgi-rafı kuralı yapısal olarak sağlanamazdı** — kapı `ref` istiyor, `WorkerEvidence`
şemasında `ref` alanı yoktu, Zod siliyordu (2026-07-24'te "deterministik döngü" diye
açık kaydedilen madde). Düzeltilince sıradaki koşu **ilk denemede** geçti.
Canlı kanıt: 5 fırsat, her biri 3 ayrı çekilmiş URL, €0 sermaye, halal `pending`.

## CEO'nun sabah emirleri

- **"Ben görev vermedikçe çalışmasın."** Zamanlanmış hat artık `not_autonomous`
  döner (`revenue.discovery.auto=false`); motor kapalı değil, **CEO'nun elinde**.
- **"Canlı akış Türkçe sayfada Türkçe olsun."** `tasks.objective_tr` +
  `v_live_ops.label_tr` + locale'e göre ray; CEO niyetinden doğan görevin Türkçe
  etiketi **onun kendi cümlesidir**. Fırsat başlıkları da `title_tr` (scout kaynakta
  iki dili birden yazar).

## U29 — talimat etiket değildir (11:10, CEO ekran görüntüsü)

CEO: *"canlı türkçe değil hala ingilizce."* İki kusur, tek belirti. (a) 009300'de
Türkçe bacağı ekledim ama YALNIZ rayı öğrettim — sayfa/kuyruk/dock/görev
ızgarası/proje/onay/karar defteri hepsi hâlâ eser dilini basıyordu. **Ders: bir
i18n bacağı eklerken o alanı okuyan TÜM yüzeyler aynı turda değişir**, yoksa
CEO'nun işaret ettiği yer düzelir, gerisi yalan söyler. (b) Asıl kusur: akış
satırının kendisi `tasks.objective` idi ve scout brifingi ~1700 karakter — yani
satır bir sayfa İngilizce metin basıyordu. Çeviri yanlış çözüm olurdu: **brifing
etiket değildir**, eser dili kuralı da haklı. Şekil değişti: görev artık iki dilde
KISA BAŞLIK taşır (`label`/`label_tr`), uzun talimat ayrı; geri-düşme zinciri
(başlık → objective'in İLK SATIRI, asla kelime ortası kesme, asla "…") görünümde
TEK yerde. Aynı taramada iki kesme daha öldü: `v_morning_briefing`'in
`left(objective,80)`'i (sayfa `truncate` ile sarınca = yasaklı "…") ve proje
sayfası. Kapı: `tests/c9/feed-headlines.test.ts`.

İlgili: [[night-shift-w1-closed-2026-07-26]] · [[evidence-before-done]] ·
[[ceo-design-minimalism-ruling]] ·
[[ui-bilingual-purity-gate]] · [[systemd-resident-services]]
