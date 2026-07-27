---
name: proactive-briefing-w26
description: "W2.6 (2026-07-27) — Hamza sabah 07:00'de konuşmayı KENDİ açar: tek SQL görünümü, sıfır model çağrısı, iki dil bacağı; tarih-sürücü tuzağı ve view-replace tuzağı"
metadata: 
  node_type: memory
  type: project
  originSessionId: 86c8c1b0-70c3-435e-8189-4a340c6cb429
  modified: 2026-07-27T00:14:37.190Z
---

**W2.6 kapandı (U37, 2026-07-27 gecesi, yazar Opus 5).** Ölçüm önce: `scheduler.ts`'te 14 zamanlanmış iş vardı ve **hiçbiri `chat_messages`'a yazmıyordu** — 2026-07-19'dan beri CEO'nun panosundaki her satır onun yazdığı bir şeyin cevabıydı. Artık holding CEO'ya kendi konuşmasını açıyor.

- **İçerik tek görünümden, model YOK:** `v_ceo_briefing` ölçer, `renderBriefing()` yalnız biçimlendirir (Faz 9 LOCKED: "brifing tek SQL görünümden; ajan brifing yazmaz"). Üç sonuç kasıtlı: sıfır token, uydurma sayı imkânsız, **abonelik hattı ölse bile CEO'nun sabahı susmaz**.
- **Sistem yazımı metin = i18n yüzeyi:** `chat_messages.content_tr` + `chat_sessions.title_tr`. U26 bu kuralı "sistem hiç başlık yazmasın" diye çözmüştü — o çözüm yalnız OS sessizken geçerli. Sohbet turları (CEO'nun sözleri, Hamza'nın cevapları) tek bacak kalır: onlar çeviri değil.
- **Anahtar + tavan CEO'da:** `briefing.proactive.enabled`, `briefing.proactive.max_per_day`; DISABLED/DAILY_CAP retleri audit'e yazılır (kapalı ≠ bozuk). Tam-bir-kez yapısal: `ceo_briefings UNIQUE(briefing_date, slot)`.
- **İlk non-UTC cron:** `0 7 * * *` + `tz: 'Europe/Berlin'` (diğer 14 satır UTC). pg-boss `schedule(name, cron, data, {tz})` destekliyor.

**BEDELİ ÖDENMİŞ İKİ TUZAK (tekrar satın alma):**
1. **`date` kolonu sürücüden YEREL gece yarısı `Date` olarak gelir; `toISOString().slice(0,10)` takvimi bir gün geri alır.** Canlı ilk koşu 27'sinin 01:30'unda kendini "26 Temmuz" diye dosyaladı. Çözüm: günü görünüm **TEXT** olarak versin (`to_char(...,'YYYY-MM-DD')`), istemcide asla tekrar türetme.
2. **`CREATE OR REPLACE VIEW` ortaya kolon ekleyemez, kolon tipi değiştiremez** ("cannot change name/data type of view column") → `DROP VIEW` + `CREATE VIEW`.
3. **`scripts/bootstrap-db.sh` CANLI DB'de koşmaz** (eski kayıtsız migration'lar "relation already exists" verir): tek dosyayı `docker exec -i ... psql` ile uygula, sonra `supabase_migrations.schema_migrations`'a versiyonu elle yaz.

**BRİFİNGİN ORTAYA ÇIKARDIĞI ESKİ KUSUR (bir haftalık):** Hamza'nın yeni thread'ine ilk düşen şey `tests/r31` sesli probe turlarıydı — çağrı cevaplanınca iki tur chat panosuna AYNALANIR (U15 D13), r31 suite'i `voice_calls`/`intents`'i siliyor ama aynayı bilmiyordu, 12 saat kuralı da yeni turları EN YENİ thread'e bağlıyor. Pano geneli ölçüm: **192 probe sesli tur 2026-07-19'dan beri CEO'nun kendi konuşmalarının içinde yaşıyordu** (98 mesajlık thread'in 81'i test gürültüsü). Süpürüldü; süpürge aynı turda İKİ katmana kondu (r31 dosya-içi + `tests/global-teardown.ts` 5. sınıf). **Desen ILIKE + KÖK olmalı, cümle değil:** intake probe metnini aynadan önce normalize ediyor (aynı soru panoya "R31 probe:", "F31 Probe", "Pre-31 Probe", "ve otuz bir probe … görevin nedir" olarak düşüyor) — büyük/küçük harfe duyarlı ilk desen 178 satır sildi, 15'ini bıraktı.

**E2E oturum tuzağı:** `~/.dxb/e2e-state.json` çerezinin `expires` alanı mint'ten 1 saat sonra doluyor, oysa taşıdığı JWT haftalarca geçerli — batarya sessizce /login ölçmeye başlıyor (7 vaka düştü). Çerez ömrü kendi token'ının `exp`'ine hizalandı (yedek: `.bak.20260727`).

İlgili: [[chat-repair-discovery-2026-07-26]], [[ui-bilingual-purity-gate]], [[evidence-before-done]], [[systemd-resident-services]].
