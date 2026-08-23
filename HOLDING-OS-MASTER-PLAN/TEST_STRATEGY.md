# TEST_STRATEGY — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 5 · Yazar: Fable 5 bizzat · Kaynak hüküm: §15 (zorunlu dosya) + madde 14 şablonu (test planı her sistemde) · Üst: [[MASTER_PLAN]] · Kardeşler: [[ACCEPTANCE_CRITERIA]] (ürün kabulü), [[IMPLEMENTATION_ROADMAP]] (adım-içi kanıtlar), tüm spec'lerin §20'leri (modül test planları buraya toplanır)
> İlke: test = evidence-before-done'ın otomatikleştirilmiş hali. Kanıt üretmeyen test yazılmaz; test üretmeyen "done" yasak.

## 1. Amaç

Yedi test katmanının (L1-L7) tek stratejisi: ne, hangi araçla, hangi kapıda, hangi kanıtla test edilir. Mevcut altyapı (vitest workspace + Playwright plugin + gitleaks) üstüne kurulur — yeni test framework'ü EKLENMEZ.

## 2. Gereksinimler

- G1. Her roadmap adımının kanıt komutu ya bu katmanlardan birine aittir ya tek-seferlik shell kanıtıdır.
- G2. GUI/görsel sonuçlar hiçbir katmanda "makine-PASSED" ilan edilemez — L7 CEO göz testi ayrı tier (⚠).
- G3. Test verisi gerçek şema üstünde (test DB); mock yalnız dış servis sınırında (LLM çağrıları, Hetzner API).
- G4. Opus penceresinde test yazımı serbesttir (madde 18: Test = Opus görevi) AMA test SİLME/gevşetme yasak.

## 3. Mimari (katman haritası)

| Katman | Kapsam | Araç | Kapı |
|--------|--------|------|------|
| L1 Birim | packages/* saf fonksiyonlar (kernel, hook, memory-router, hr derleyici, shared Zod) | vitest (mevcut workspace) | her commit |
| L2 DB/Migration | boş DB'de 0001→son sıralı push; idempotency; kısıt/trigger/append-only/RLS testleri | supabase local + psql script | migration commit'i |
| L3 Kontrat | alan×eylem Zod round-trip + control fn entegrasyonu + idempotency çifti | vitest + test DB | control-plane commit'i |
| L4 Canlılık | Broadcast trigger→olay zarfı; debounce ölçümü; reconnect | vitest + supabase-js probe | EVENT değişimi |
| L5 E2E | login→overview→drill-down→settings set/undo→approval decide→workflow smoke | Playwright (plugin mevcut) | blok kapanışı |
| L6 Statik/i18n | typecheck, lint, build, EN/TR çeviri tamlığı, kontrast denetimi, gitleaks | tsc/eslint/next build/i18n sayacı/gitleaks | her commit |
| L7 Kabul | §38 maddeleri + §37 10 ekran — insan gözü | CEO oturumu | teslim |

## 4. Veri modeli (test verisi)

- Test DB: **inşaatın kendi Supabase yığını** — `DxB_Build`, port 54422, kendi kümesi (kayıtlı uyarlama, B36 Blok 2, 2026-08-23). Şirket motorunda test veritabanı YOK; `dxb_test` klonu düşürüldü. ASLA canlı DB.
- Fixture seti: `db/seed/test/` — 1 company, 3 departman, 5 çalışan (v2 persona'lı 3 + v2'siz 2 — negatif test için), 2 proje, 1 workflow (5 adım), 20 task, cost satırları. Deterministik ID'ler (uuid sabit) — snapshot karşılaştırılabilir.
- Kural: fixture gerçek şemadan sapamaz (migration değişince fixture güncellenir, aynı commit'te).

## 5. Component yapısı / 6. Backend yapısı

- Test konumları: paket-içi `src/**/*.test.ts` (mevcut desen KALIR); DB testleri `tests/db/` (SQL+shell); E2E `tests/e2e/`.
- L2 koşucusu: `scripts/test/db-suite.sh` — boş DB kur → push → assert seti → ikinci push idempotent (0 değişim) → rollback blokları sözdizim kontrolü (`-- ROLLBACK:` var mı her dosyada).

## 7. Frontend yapısı

L5 senaryoları rota-bazlı; her §31 sayfası için asgari: yüklenir + gerçek veri render + bir drill-down çalışır. Görsel regresyon aracı EKLENMEZ (bilinçli — CEO göz testi tek görsel otorite; screenshot'lar kanıt arşivine `tests/e2e/evidence/`).

## 8. API'ler

L3 zorunlu çiftler: (a) mutlu yol → `{ok:true}` + change_log/audit satırı; (b) idempotent tekrar → aynı yanıt, yeni satır YOK; (c) yetkisiz → `PERMISSION_DENIED`; (d) şema ihlali → `VALIDATION_FAILED`; (e) approval'a dönüşen → `APPROVAL_REQUIRED` + approval_id. Her yeni alan×eylem bu beşliyi almadan merge edilemez.

## 9. Event yapısı

L4 zorunlu: kanal-başı en az bir trigger→zarf testi (EVENT_MODEL §20); `ops:live` debounce kanıtı (10 hızlı INSERT → ≤2 yayın); reconnect senaryosu (abonelik kes → INSERT → yeniden bağlan → snapshot tutarlı).

## 10. State yönetimi

Test durumu commit'e bağlı: her test koşusu temiz fixture'dan başlar (DB reset); testler arası durum paylaşımı yasak (paralel koşu güvenliği).

## 11. Database tabloları / 12. İlişkiler

Yeni tablo yok. L2 assert envanteri (bağlayıcı çekirdek): v2'siz persona aktivasyon reddi · fallback döngü reddi · append-only UPDATE reddi · task_dependencies self/döngü reddi · money_out onaysız outbox reddi (O1 — HER koşuda) · settings value_schema ihlal reddi · idempotency mismatch 409.

## 13. Yetkilendirme (test yetkileri)

RLS testleri üç rolle koşar: `service_role` (bypass kanıtı), `authenticated`+CEO (tam okuma), anon (ret). Gateway profil testi: profil-dışı araç çağrısı reddi (L1, gateway paketi).

## 14. Logging / 15. Audit (testin kendisi)

Test çıktıları CI log'unda; kanıt satırı roadmap adımına yapıştırılır (komut + decisive output). E2E screenshot/video arşivi git-lfs DEĞİL — `tests/e2e/evidence/` gitignore'da, son koşu VPS'te yaşar (BACKUP döngüsüne girmez; yeniden üretilebilir).

## 16. Security testleri

Kapsam (madde 4 sınırında — yeni bürokrasi değil, mevcut omurganın kanıtı): O1 para-çıkışı reddi · gitleaks her commit · redact.ts canary (secret yazımı → maskeli) · profil least-privilege reddi · `://user:pass@` links reddi (PROJECT_OS fn). Pentest/scan turu AÇILMAZ (SECURITY_MODEL sicili).

## 17. Error handling / 18. Retry / 19. Fallback (test disiplini)

- Flaky test politikası: 2 kez üst üste flake → karantina etiketi + RISK_REGISTER satırı; sessiz retry-until-green YASAK.
- Timeout'lar sabit (vitest 30s, E2E 60s/senaryo); aşan test optimize edilir, süre uzatma gerekçe ister.
- LLM-mock sınırı: classify/persona derleme testleri sabit yanıt fixture'ı kullanır; canlı LLM çağrısı test suite'inde YOK (maliyet + determinizm).

## 20. Test planı (kapı takvimi) / 21. Acceptance criteria

- Her commit: L1 (etkilenen paketler) + L6.
- Migration commit'i: + L2 tam.
- Control-plane/Broadcast değişimi: + L3/L4 ilgili set.
- Blok kapanışı (E-blok): + L5 ilgili senaryolar.
- E13: L1-L6 TAM + L7 CEO oturumu.
- Kabul: L1-L6 yeşil = makine-tier tamam; L7 olmadan ürün "bitti" İLAN EDİLEMEZ (⚠ tier ayrımı).

## 22. Migration planı / 23. Rollback planı

Test altyapısı migration'ı yok (araçlar mevcut). Rollback testi L2'nin parçası: örnek ailede `-- ROLLBACK:` bloğu gerçekten koşulur (0020x üzerinde bir kez, test DB'de) — "rollback yazıldı ama hiç denenmedi" riskine karşı.

## 24. Uygulama sırası (doğrulamalı)

```bash
pnpm test                                   # → L1 workspace yeşil (mevcut testler + yeniler)
bash scripts/test/db-suite.sh               # → "PUSH OK / IDEMPOTENT OK / ASSERTS 7/7 / ROLLBACK BLOCKS n/n"
pnpm --filter dashboard exec playwright test # → E2E senaryoları yeşil
pnpm -r typecheck && pnpm --filter dashboard build && gitleaks detect --no-banner | tail -1  # → yeşil + no leaks
node scripts/test/i18n-audit.mjs            # → "EN keys == TR keys, missing: 0"
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: vitest workspace (canlı), Playwright plugin (canlı), supabase local, fixture seti (E4.4 ile birlikte yazılır).
- Risk: X230'da tam suite yavaş → tam L2+L5 VPS'te koşar, lokalde etkilenen-alt-küme; süre eşiği 10 dk (aşarsa böl).
- Edge: Opus test yazarken assert'i gevşetirse → test diff'i de evidence-before-done kapsamında, kabul kapısında L2/L3 assert SAYISI düşemez (sayaç denetimi: `grep -c "expect(" ...` bazlı kaba kapı + review); fixture drift → migration+fixture aynı commit kuralı; CEO göz testi RET → E13 döngüsü: bulgu listesi → düzeltme → yeniden L7 (RET kaydı ACCEPTANCE'a işlenir).

## Opus-devralma notu

Test yazımı Opus'un ana görev sınıfı (madde 18); bu strateji sınırları çizer: katman araçları sabit, beşli kontrat çifti zorunlu, assert gevşetme yasak, L7 insan. Yeni katman/araç eklemek ⛔ (en güçlü model + CEO onayı).

## Done definition (bu spec)

27 başlık ✓ · L1-L7 katman haritası (araç+kapı) ✓ · L2 assert çekirdek envanteri ✓ · L3 beşli kontrat çifti ✓ · fixture disiplini ✓ · flaky/gevşetme politikaları ✓ · doğrulama komut seti ✓ · Opus sınırları + ⛔ ✓
