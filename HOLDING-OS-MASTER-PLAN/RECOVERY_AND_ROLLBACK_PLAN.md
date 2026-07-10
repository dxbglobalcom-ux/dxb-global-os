# RECOVERY_AND_ROLLBACK_PLAN — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 5 · Yazar: Fable 5 bizzat · Kaynak hüküm: §15 + §16 (yedek plan prosedür bacağı) · Üst: [[BACKUP_PLAN]] (senaryo/kapsam sahibi — bu dosya PROSEDÜR sahibi) · Kardeşler: [[DATA_MODEL]] §20-21 (rollback blokları), [[RISK_REGISTER]] ("gerçekleşirse" kolonunun adresi)
> İşbölümü: BACKUP_PLAN "12'sine yetişmezse NE yapılır"; bu dosya "bozulursa NASIL geri dönülür" — komut düzeyinde, koşulabilir.

## 1. Amaç

Her bozulma sınıfı için önceden yazılmış, denenebilir kurtarma prosedürü: kod, şema, ayar, veri, servis, tam felaket, yarım-koşu, devir kazaları. Panik anında düşünülmez — bu dosya koşulur.

## 2. Gereksinimler

- G1. Her prosedür: ön-koşul → adımlar (komutlarıyla) → doğrulama → veri-kaybı beyanı (ne kaybolur, dürüstçe).
- G2. Fail-safe yönü: şüphede SİLME değil DURDUR (append-only + yedek zaten koruyor).
- G3. En az bir prosedür (P2 migration rollback) canlıya çıkmadan test DB'de PROVALI (TEST_STRATEGY §22 bağı).

## 3. Mimari (kurtarma katmanları)

```
P1 kod/UI → git revert (dalga/blok atomik)
P2 şema → migration -- ROLLBACK: blokları (tersten)
P3 ayar → settings_change_log undo zinciri
P4 veri → pg_dump günlük + Storage Box (dxb-backup-1)
P5 servis → compose restart + healthcheck
P6 tam felaket → VPS yeniden kurulum + restore + smoke
P7 yarım-koşu → yetim run temizliği
P8 devir kazası → session restart protokolü (BACKUP §12) + bu dosya
```

## 4. PROSEDÜRLER (bağlayıcı — komut düzeyinde)

### P1 — Kod/UI geri alma

Ön-koşul: bozulmayı getiren commit biliniyor (`git log --oneline`; adım-ID'li mesajlar aramayı kolaylaştırır).
```bash
git revert <sha> --no-edit && pnpm --filter dashboard build   # → build yeşil
pnpm test                                                      # → L1 yeşil
```
Doğrulama: bozulan davranış kayboldu (ilgili L5 senaryosu). Veri kaybı: YOK (kod katmanı). Not: rota-anahtarı commit'i (E2.3) tek revert'le eski kokpite döner — bilinçli tasarım.

### P2 — Şema geri alma (migration rollback)

Ön-koşul: hangi ailenin geri alınacağı belli; sıra TERSTEN (0026x→0020x — FK yönleri); her migration dosyasının sonunda `-- ROLLBACK:` bloğu var (L2 sözdizim kontrolü garantiler).
```bash
psql "$DB" -f <(sed -n '/-- ROLLBACK:/,$p' db/migrations/<dosya>.sql | tail -n +2)
psql "$DB" -c "\dt <aile>_*"                                   # → tablolar düştü / kolonlar kalktı
pnpm -r typecheck                                              # → tip köprüleri (shared) uyumlu mu
```
Veri kaybı beyanı: DATA_MODEL §20 tablosu satır satır söyler (örn. org rollback'i yalnız yeni kolon verisi kaybettirir). Kural: rollback ÖNCESİ hedef tabloların `pg_dump -t` anlık kopyası alınır:
```bash
pg_dump "$DB" -t 'companies' -t 'personas' -f pre-rollback-$(date +%s).sql
```

### P3 — Ayar geri alma (undo zinciri)

Tek değişiklik: UI tek-tık undo VEYA `control_settings_undo(change_id)`. Toplu bozulma (yanlış ayar serisi):
```bash
psql "$DB" -c "SELECT id,key,scope,changed_at FROM settings_change_log WHERE changed_at > '<t0>' ORDER BY id DESC;"
# her id için sırayla (YENİDEN ESKİYE) undo fn çağrısı — sıra önemli, ters yazım çakışması olmaz
```
Doğrulama: `settings_values` beklenen eski değerler; her undo kendisi change_log satırı (kayıt kaybolmaz).

### P4 — Veri restore (pg_dump)

Ön-koşul: Storage Box erişimi (SSH-key-only; RFC4716 gotcha kayıtlı).
```bash
ssh <storagebox> "ls -t backups/*.dump | head -3"              # → en yeni 3 yedek
scp <storagebox>:backups/<en-yeni>.dump /tmp/restore.dump
pg_restore --clean --if-exists -d "$DB" /tmp/restore.dump      # TAM restore — aşağıdaki uyarıyla
```
**Uyarı (Auto-Clarity):** `--clean` mevcut nesneleri DÜŞÜRÜP yedekten yeniden kurar. Yedek anından sonraki TÜM veri kaybolur. Önce kısmi kurtarmayı dene: tek tablo için `pg_restore -t <tablo>`. Tam restore yalnız CEO onayıyla (veri-kaybı kararıdır).
Doğrulama: `psql -c "SELECT max(created_at) FROM task_events;"` → yedek zamanına uyumlu; smoke zinciri (P5 doğrulaması) yeşil.

### P5 — Servis kurtarma

```bash
docker compose ps                                              # → hangi servis unhealthy
docker compose logs --tail 50 <servis>                         # → karar satırı
docker compose restart <servis>                                # tekil; TÜM stack restart son çare
curl -s localhost:3000/api/control/health                      # → {"ok":true}
psql "$DB" -c "SELECT 1;" && echo QUEUE: && psql "$DB" -c "SELECT count(*) FROM pgboss.job WHERE state='active';"
```
Kuyruk Postgres'te — proses ölümü iş kaybettirmez; `restart: unless-stopped` zaten dener. İş kaybı: YOK (park eden job'lar kaldığı yerden).

### P6 — Tam felaket (VPS kaybı)

Sıra: (1) yeni VPS (Hetzner, aynı boyut) → (2) repo clone + `.env` vault'tan yeniden kur (yedekte YOK — bilinçli; secret'lar dump'a girmez) → (3) `docker compose up -d` → (4) P4 restore → (5) migration durumu kontrol (`supabase db push` idempotent — eksikleri tamamlar) → (6) smoke: intent→task→approval→outbox zinciri + Broadcast probe → (7) Caddy/DNS. Hedef süre: yarım gün. Veri kaybı: son yedekten bu yana (≤24 saat — günlük dump; execution yoğun günlerde dump sıklaştırılabilir, tek satır cron).

### P7 — Yarım-koşu temizliği (kesinti/devir sonrası)

```bash
psql "$DB" -c "SELECT id, employee_id, started_at FROM agent_runs WHERE status='running' AND started_at < now() - interval '1 hour';"
# yetimler: status='failed', error='orphaned: session interrupted' — SİLME yok, işaretleme var
psql "$DB" -c "UPDATE ... "   # ilgili fn: control-plane yetim-işaretleme fn'i (E8'de gelir); o güne dek elle UPDATE service_role ile
```
workflow_runs aynı desen; `waiting_approval` PARK'takiler yetim DEĞİLDİR — dokunulmaz (insan kapısı bekliyor).

### P8 — Devir/session kazası

Belirti: session düştü, ilerleme işareti belirsiz. Prosedür: BACKUP §12 açılış sırası → roadmap tablosunda son ✓ adımın kanıt komutunu YENİDEN koş (güven ama doğrula) → geçiyorsa sonraki adımdan devam; geçmiyorsa adımı baştan al. Çift-✓ riski yok: kanıt komutu idempotent okumalardır.

## 5-9. Component/Backend/Frontend/API/Event

Kurtarma araçları mevcut altyapının kendisi (git, psql, compose, fn'ler) — yeni bileşen YOK (madde 4 + R5). Tek gelecek ek: yetim-işaretleme fn'i (E8 kapsamında, ayrı araç değil).

## 10. State yönetimi

Kurtarma sonrası durum beyanı zorunlu: hangi prosedür koşuldu, ne kaybedildi, sistem hangi noktada — STATE.md + (canlıysa) audit_log satırı + CEO'ya ✓/⚠ tablo.

## 11-12. Tablolar / İlişkiler

Yok. Prosedürlerin dokunduğu kritik sıra: P2 rollback TERSTEN (FK), P3 undo YENİDEN-ESKİYE (yazım sırası).

## 13. Yetkilendirme

P1-P3, P5, P7-P8: Fable/Opus koşabilir (kayıtla). P4 tam restore + P6: **CEO onayı zorunlu** (veri-kaybı kararı). Para-çıkışı zinciri hiçbir prosedürde bypass edilmez (kurtarma sırasında bile outbox kapısı aktif).

## 14. Logging / 15. Audit

Her prosedür koşusu kayıt bırakır: koşan, sebep, komutlar, sonuç, kayıp beyanı — STATE.md'ye (sistem ayaktaysa audit_log'a da). "Sessiz kurtarma" yasak.

## 16. Security

Restore edilen dump'ta secret yok (dump şema+veri; .env ayrı — P6/2). Rollback güvenlik omurgasını gevşetemez: O1-O9 mekanizmaları migration rollback'lerinden etkilenmez (mevcut 18 tablo + 0015 fn'leri geri alınmaz — rollback yalnız YENİ aileleri kapsar).

## 17. Error handling / 18. Retry / 19. Fallback

Prosedür ortasında hata: DUR, durumu kaydet, bir üst prosedüre çık (P2 başarısız → P4 kısmi restore; P5 başarısız → P6). Retry yalnız idempotent adımlarda (restore/push). En kötü zincir: P6 tam felaket — o bile yarım günlük, denenmiş yol.

## 20. Test planı / 21. Acceptance criteria

- Prova zorunluluğu: P2 (bir aile, test DB) + P4 (test DB'ye restore) execution döneminde BİRER KEZ koşulur — kanıt STATE'e. P6 masabaşı-provası (komut listesi güncel mi — VPS yeniden kurulmaz).
- Kabul: 8 prosedür komut-düzeyinde + veri-kaybı beyanlı; P4/P6 CEO-onay işaretli; prova kanıtları kayıtlı.

## 22. Migration / 23. Rollback

Bu dosyanın konusu zaten bu; kendi migration'ı yok.

## 24. Uygulama sırası (doğrulamalı)

```bash
grep -c "^### P[0-9]" HOLDING-OS-MASTER-PLAN/RECOVERY_AND_ROLLBACK_PLAN.md   # → 8
grep -rL -- "-- ROLLBACK:" db/migrations/202607*.sql | wc -l                  # → 0 hedefi (0020x+ dosyalarında blok zorunlu; eski 19 dosya muaf — kayıt: sadece yeni aileler rollback-bloklu)
ssh <storagebox> "ls backups/ | tail -1"                                      # → bugünün dump'ı
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: Storage Box canlı (kanıtlı), compose stack, migration rollback blokları (L2 denetimli), git atomik commit disiplini.
- Risk: prova yapılmamış prosedür gerçekte şaşırtır → §20 prova zorunluluğu; Storage Box erişim anahtarı tek kopya → anahtar yedeği CEO vault'unda (kayıt: S6 rotasyon kalemiyle birlikte ele alınır).
- Edge: yedek dosyası bozuk çıkarsa → bir önceki dump (3 nesil tutulur); restore sırasında canlı yazım → önce servisleri durdur (`compose stop kernel outbox-executor`), restore, sonra aç; Opus prosedür ortasında ⛔ ihtiyacı hissederse → DUR + CEO'ya durum tablosu (yanlış kurtarma, bozulmadan beterdir).

## Opus-devralma notu

Prosedürler koşulabilir reçetedir; Opus P1-P3/P5/P7-P8'i kayıtla koşar, P4-tam/P6 CEO onayı ister, sırayı (tersten/yeniden-eskiye) değiştirmez. Yeni prosedür ekleme serbest (append); mevcut adım silme ⛔.

## Done definition (bu spec)

27 başlık ✓ · 8 prosedür komut+doğrulama+veri-kaybı-beyanlı ✓ · CEO-onay kapıları (P4 tam/P6) ✓ · prova zorunluluğu ✓ · fail-safe yönü (durdur>silme; kurtarmada bile outbox kapısı) ✓ · BACKUP_PLAN işbölümü net ✓ · doğrulama komutları ✓
