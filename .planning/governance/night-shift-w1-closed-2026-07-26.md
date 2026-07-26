---
name: night-shift-w1-closed-2026-07-26
description: "2026-07-26 gecesi (01:50-04:50, 12 commit): W1 tamamen kapandı + W2.1; konsey kapısı CANLI kanıtlandı; Hermes ölçüldü (canlı ama beyinsiz); kendi kusurlarım ve süreç dersleri"
metadata: 
  node_type: memory
  type: project
  originSessionId: 89e1e9f0-ad11-443e-8df0-a0f508267a51
  modified: 2026-07-26T02:49:33.126Z
---

**CEO uyumaya gitti, ayakta emir bıraktı:** *"sen projeye devam et. onay isteme… bana en mükemmel tarafını göster ve ispatla."* 12 commit: `649cb20..bd9f50a`.

# Kapananlar

- **U21 kalite kademe kanunu** — Sonnet her kritik koltuktan çıktı, 8 model kovuldu, 205 beyin yeniden atandı, kademe-tekliği değişmezi doğdu, ses `effort` çakması kalktı.
- **U22 beyin tabanı** — `model_catalog.tier_floor` + `fn_tier_rank` + `fn_effective_tier`. Beyin kademeyi **yükseltir, asla düşürmez**. §4b step-0 (ceo_override) nihayet inşa edildi. `resolveExecutionRoute` ayrıldı ki kablolama canlı model çağırmadan test edilebilsin.
- **U23 kritik kapı CANLI** — Solo 5.6 + GPT 5.5, **Codex CLI abonelik hattı** üzerinden (`--ephemeral -s read-only --output-schema`). `runWorkerOnce` içinde QA kapısı PASS verdikten sonra ateşlenir; itirazlar **tek** revizyon turu olarak yazara döner. Bilerek kusurlu bir öneri 7 kaynaklı itiraz aldı (`decision_log` 20251).
- **U24 Hamza'nın iki ayağı** — `chat.strategy` (max) / `chat.brief` (medium), **ikisi de L1**. Rapor ayağına canlı rakamlar VERİLİR ve başka rakam eklemesi yasaklanır; "boş tablo kusur değildir" kuralı artık prompt'ta yaşıyor.
- **U25 aylık fren gerçek** — uyarı katmanı zaten vardı (iki trigger), eksik olan **yazıcı**ydı. 5 dakikalık tick, defter+proxy harcaması, kritik sınıf muaf, serbest bırakma **elle** kalır.
- **U26 sohbet konuşmaları** — `chat_sessions` + `session_id`, iplik kararı sunucuda (12 saat sessizlik = yeni konuşma), **bağlam penceresi her iki hatta da iplikle sınırlı**, ses aynası gerçek ipliğe katıldı (8 öksüz satır sahiplendirildi).
- **W2.1 hedef kapısı** — CEO artık psql'siz hedef koyuyor. Tarayıcıda uçtan uca kanıtlandı: "e2e door proof" €75 aktif, sonra denetimli kapıdan kapatıldı.

# Hermes gerçeği (W3.1)

**CANLI** — servis 07-25 08:05'ten beri ayakta, işler yüklü, yığın 2 haftadır çalışıyor. Kutuya **IPv6** ile girildi (`dxb@2a01:4f8:c0c:cf01::1`); IPv4'te tek bir root denemesi fail2ban'ı tetikleyip portu kapattı — **kullanıcı `dxb`, asla root**.

**Asıl kusur:** Hermes **beyinsiz**. Son işi `HTTP 402` ile öldü (OpenRouter kredisi bitmiş) ve istediği model **`glm-5.2`** — U21'in kovduğu model. Çözümü **para sorusu** (OpenRouter yükle / VPS'e abonelik hattı koy / yerel modeli bekle) → CEO kararı, 3.1c olarak kayıtlı, etrafından dolanılmadı.

**Ayrıca:** CEO'nun dashboard'ı **laptop** veritabanında, Hermes **VPS** veritabanında. "Holding'in içinde görünsün" bir sayfa değil, bir **kalp atışı** ister (satır 3.2).

# Kendi kusurlarım (hepsi düzeltildi, hepsi kayıtlı)

1. `tests/c9/monthly-cap` geri-alma işlemi DIŞINA yazdı (yardımcılar `getDb()` çağırıyordu) — **canlı freni tetikledi**, €105 sahte harcama + 3 gerçek uyarı. Dakikası içinde temizlendi, `audit_log budget.hard_stop.reverted`. `checkMonthlyCap(db)` bu yüzden enjekte edilebilir.
2. U21 migration'ı `routing_rules.model`'i güncelledi ama `model_id`'yi değil — 2 slot satırı yasaklı haiku'da kaldı (U20'deki **aynı iki-kolon tuzağı**; testler commit öncesi yakaladı).
3. Beş CEO yüzeyi ham katalog kimliği basıyordu — ekranda `fable-5`. Ortak çözücü `lib/model-names.ts`.
4. `chat_sessions` RLS/grant'siz çıktı → pano boş göründü.
5. Eski iplik İngilizce başlıkla Türkçe panoya düştü.
6. `control_objective_*` `authenticated`'a hiç verilmemişti — **yalnız gerçek arayüzü sürerek** bulundu.

# Süreç dersleri

- storageState **süresi dolmamıştı**: çerez `localhost` alanına yazılı, ben `127.0.0.1` açtım.
- Locale çerezi **`dxb-locale`** — `NEXT_LOCALE` ile koşulan batarya EN'i iki kez basar ve TR bacağı hakkında **yalan söyler**.
- `:3000` production build koşar: kaynak değişikliği rebuild + `ss` ile port sahibini öldürmeyi ister.
- `codex exec` stdin kapatılmazsa **sonsuza kadar bekler**; nihai mesaj `-o <dosya>`dan okunur (stdout CLI gürültüsü taşır).

# Teslim durumu

Tam batarya **77 dosya / 566 test / 0 hata**, `tsc -b` temiz, i18n saflık 2378=2378, RULE #0 bataryaları 7 rota × EN+TR × 1280/1920. Canlı durum temiz: `hard_stopped=f`, 0 açık uyarı, €0.00 aylık harcama, 0 öksüz sohbet satırı.

**Sıradaki:** W2.2 keşif motoru — araçlar kurulu ve bugüne dek **sıfır kez** çağrılmış (scrapling 10 / playwright 24 → 0). Sıralı kuyruk: `HOLDING-OS-MASTER-PLAN/00-NOTE-FACTORY-COMPLETION-ROADMAP-2026-07-26.md`.

İlgili: [[u21-quality-tier-law-2026-07-26]] · [[model-routing-hierarchy]] · [[opus-5-construction-governance]]
