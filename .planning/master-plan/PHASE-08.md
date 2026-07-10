# PHASE 08 — CEO Dashboard & CRM

**Req:** DASH-01..07, GATE-03, COST-04
**Bağımlılık:** Phase 5 (kernel istemcisi) + Phase 4 (onay/cost verisi). Phase 6 ile paralel-güvenli.
**Demir kural:** Design bundle (taste, impeccable, open-design, Stitch) faz BAŞINDA study→install→adopt — tek satır UI kodu öncesi (DASH-07, I5).

## 1. Hedef + Kabul Kapısı

1. Design bundle kurulu ve çalışılmış; cockpit onun disiplini altında üretilmiş (study card + UI-SPEC kanıtı)
2. Canlı cockpit: görev panosu, ajan rosteri, RİSK-GRUPLU toplu onay inbox'ı (per-action popup ASLA), departman/model/mode kırılımlı maliyet sayacı — Broadcast-from-DB ile gerçek zamanlı
3. Command bar: Türkçe/İngilizce intent → kernel uçtan uca (dashboard = ilk kernel istemcisi)
4. Her görev tam audit iziне drill-down (firehose YOK); dashboard saf projeksiyon (I8)
5. İnce CRM cockpit içinde; telefonda kullanılabilir; Türkçe-dostu etiketler; non-teknik CEO hatasız kullanır

## 2. LOCKED Mimari Kararlar

| Karar | Gerekçe |
|---|---|
| Next.js 16.2.x App Router + `@supabase/ssr` auth (deprecated auth-helpers YASAK) | CLAUDE.md uyum tablosu |
| Realtime = `realtime.broadcast_changes` trigger'ları; `postgres_changes` YASAK (düşük hacimli tek istisna bile açılmaz) | Pattern 6 |
| Kanal adlandırma: `dxb:{tablo}` — `dxb:task_events`, `dxb:approvals`, `dxb:cost_ledger` | tek konvansiyon |
| Varsayılan görünüm exception-first: "beni bekleyen + değişen" — tüm-ajanlar duvarı YASAK | UX pitfall |
| Her panelde tazelik damgası ("14:32 itibarıyla") | Pitfall 10 |
| Onay inbox'ı risk_class gruplu (approvals.risk_class); high görsel-yüksek, low toplu-onaylanabilir; batch approve tek transaction | GATE-03 |
| Auth: Supabase Auth, CEO tek kullanıcı; 2FA/passkey zorunlu **[Amendment AM-08-AUTH-1, 2026-07-10 — LOKAL DEV İSTİSNASI, aşağıda]**; RLS: authenticated CEO rolü read, yazım YALNIZ intents+approval kararları | güvenlik tablosu |
| Command bar kernel'e dxb-mcp/HTTP seam'inden gider — dashboard'da LLM çağrısı YOK (`ai` SDK yalnız render/stream) | dashboard saf istemci |
| UI metin katmanı i18n dosyasında (`tr` birincil, `en` ikincil) — hard-coded string YASAK | DASH-06 |

## 3. Dosya-Seviyesi Spec

```
db/migrations/0011_broadcast_triggers.sql   # aşağıda kalıp
apps/dashboard/src/app/(auth)/login/
apps/dashboard/src/app/(cockpit)/page.tsx           # exception-first ana görünüm
apps/dashboard/src/app/(cockpit)/tasks/[id]/page.tsx # drill-down: audit.trace render
apps/dashboard/src/app/(cockpit)/approvals/page.tsx  # risk-gruplu inbox + batch
apps/dashboard/src/app/(cockpit)/costs/page.tsx      # dept/model/mode kırılım (COST-04)
apps/dashboard/src/app/(cockpit)/crm/…               # clients/requests/contacts/deals
apps/dashboard/src/components/command-bar.tsx
apps/dashboard/src/lib/{supabase,realtime,i18n}.ts
apps/dashboard/messages/{tr,en}.json
```

### 0011_broadcast_triggers.sql (kalıp — 3 tabloya uygulanır)

```sql
CREATE OR REPLACE FUNCTION broadcast_task_events() RETURNS trigger AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'dxb:task_events', TG_OP, TG_OP, TG_TABLE_NAME, TG_TABLE_SCHEMA, NEW, OLD);
  RETURN NEW;
END $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trg_broadcast_task_events AFTER INSERT ON task_events
  FOR EACH ROW EXECUTE FUNCTION broadcast_task_events();
-- aynı kalıp: approvals (INSERT OR UPDATE), cost_ledger (INSERT)
-- kanal yetkisi: realtime.messages RLS — yalnız authenticated CEO join
```

### Onay inbox davranışı (LOCKED)

- Gruplar: `high` (tek tek, tam payload görünür, onay butonu çift-teyit), `medium` (grup içi liste), `low` (tek "tümünü onayla" + sayaç).
- Batch approve: seçili id'ler tek transaction'da pending→approved; her biri ayrı audit satırı; kısmi hata → hiçbiri (rollback) + hata paneli.
- Boş inbox = yeşil "kapı temiz" durumu; inbox 50+ birikirse üst bantta gate-fatigue uyarısı (rubber-stamp riski — Pitfall UX).

## 4. Adım Listesi (adım = commit)

| # | Adım | Doğrulama |
|---|---|---|
| 1 | Design bundle study→install→adopt; `/gsd-ui-phase` ile UI-SPEC.md | study card'lar + UI-SPEC commit'li |
| 2 | 0011 trigger'lar + kanal RLS | `psql`: task_events INSERT → `realtime.messages`e satır düştü |
| 3 | Next.js app iskeleti + Supabase Auth + 2FA | login → cockpit boş kabuk; anon istek 401 |
| 4 | Görev panosu + ajan rosteri (canlı) | testte task transition → panel <2sn güncellenir (⚠ görsel doğrulama CEO'ya işaretli) |
| 5 | Onay inbox'ı + batch | seed 6 draft (2 high/2 med/2 low) → gruplu render; batch-low tek tıkla approved; audit 2 satır |
| 6 | Maliyet sayacı (COST-04) | cost_ledger+litellm birleşik görünüm; kırılım toplamları SQL toplamıyla eşit |
| 7 | Command bar → kernel | TR intent yaz → görev zinciri kuyruğa; sonuç panosunda |
| 8 | Drill-down audit | görev sayfası audit.trace kronolojisini render eder; firehose yok (sayfa yalnız o task) |
| 9 | CRM görünümleri | 4 tablo CRUD (CEO yazımı yalnız izinli alanlarda); ajan yazımı crm.* MCP'den geldiğinde görünür |
| 10 | i18n + responsive + telefon | `messages/tr.json` tam; Lighthouse mobile erişilebilirlik ≥90 (⚠ görsel akıcılık CEO onayı) |
| 11 | Faz kapanışı: `/gsd-ui-review` + CEO kullanım testi | UI-REVIEW skoru; CEO onay kaydı |

## 5. Risk + Fallback

- **Broadcast helper self-hosted imaj sürümü:** kurulumda `realtime.broadcast_changes` varlığı doğrulanır (`\df`); yoksa imaj güncellenir — polling fallback YAZILMAZ.
- **Non-teknik kullanılabilirlik:** ölçülemez kısım ⚠ UNVERIFIED etiketiyle CEO göz testine; hiçbir adım "görünüyor" diye VERIFIED yazılmaz.
- **`ai` SDK sızması:** dashboard'da model çağrısı lint kuralıyla yasak (`no-restricted-imports`: provider SDK'ları).

## Amendment Log

### AM-08-AUTH-1 — 2026-07-10 (CEO kararı; kayıtlı amendment, sessiz sapma DEĞİL)

| # | CEO kararı | Uygulama |
|---|---|---|
| 1 | LOKAL DEV'de zorunlu TOTP kaldırıldı — password-only login | `NEXT_PUBLIC_DXB_MFA_ENFORCED=false` (build+runtime, yalnız lokal): `proxy.ts` aal2 duvarı flag ile şartlı; login sayfası enroll akışına hiç girmez (`afterPasswordAccepted` erken `openDoor()`) |
| 2 | GoTrue enroll akışı kapalı (lokal) | `supabase/config.toml`: `[auth.mfa.totp] enroll_enabled=false` (verify_enabled=true kalır — mevcut factor'lı hesaplar kilitlenmez) |
| 3 | Oturum uzun — CEO login'i nadir görsün | `supabase/config.toml`: `jwt_expiry=604800` (GoTrue max, 1 hafta) + refresh-token rotation oturumu süresiz taşır |
| 4 | KAPSAM: yalnız lokal dev | VPS/prod rollout'ta 2FA şartı AYNEN yürürlükte (dışa açık yüzey + para onayları). VPS compose/GoTrue bu dosyadan etkilenmez; `NEXT_PUBLIC_DXB_MFA_ENFORCED` VPS'te asla set edilmez — default (unset) = ENFORCED |

**⛔ FABLE VERDICT (AM-08-AUTH-1):** LOCKED "2FA/passkey zorunlu" kararının kapsamı dışa-açık deploy'lardır; lokal laptop CEO'nun kendi kontrol terminalidir ve tehdit modeli farklıdır. Fail-safe yön korunur: flag'in yokluğu ENFORCED demektir, VPS hiçbir zaman set etmez. Çelişki yok, kayıtlı CEO amendment'ı olarak işlendi. — Fable 5, 2026-07-10

## 6. Bütçe-Fallback İşaretleri

- ⛔ FABLE-ONLY: UI-SPEC onayı; risk-grup davranış değişikliği; RLS/auth değişikliği; faz kapanışı.
- Opus uygulayabilir: adım 2–10 (davranışlar ve şemalar verili; görsel işçilik design-bundle disiplinine kilitli).
