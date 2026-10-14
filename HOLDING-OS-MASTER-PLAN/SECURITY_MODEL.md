# SECURITY_MODEL — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 4 · Yazar: Fable 5 bizzat · Kaynak hüküm: CEO hizalaması madde 4 (sertleştirme DURUR; para-ÇIKIŞI kapısı + outbox KALIR; bu dosya ertelenmiş-sertleştirme sicilini tutar) · Üst: [[SYSTEM_ARCHITECTURE]] §16 · Kardeşler: [[PERMISSION_MODEL]] (yetki matrisi), [[APPROVAL_ENGINE_SPEC]] (B7b), [[AUDIT_AND_LOGGING_SPEC]]
> BAĞLAYICI SINIR: Bu spec yeni güvenlik İŞİ AÇMAZ. İki içeriği vardır: (1) değişmez omurganın kaydı, (2) ertelenen kalemlerin sicili. Sicil pasif kayıttır — execution görevi üretmez.
> **Registered exception (B64, 2026-10-14):** the security work in B64's design — closing the routing door that runs without a login (O5, decision 6) and the O7 secret line (its plan) — is opened by B64's build; this file only records it. The backbone changes it carries are recorded under §22-23 before any technical work.

## 1. Amaç

Güvenlik duruşunun dürüst tek-sayfası: neyin korunduğu (omurga — dokunulmaz), neyin bilinçli ertelendiği (sicil — CEO kararıyla, tetik koşullarıyla). "Sessiz güvenlik borcu" yerine kayıtlı, görünür, tetiklenebilir erteleme.

## 2. Gereksinimler

- G1. Omurga kalemleri hiçbir spec/execution kararıyla zayıflatılamaz (⛔ + CEO onayı bile ÖNCE bu dosyayı günceller).
- G2. Her ertelenen kalem: ne, neden ertelendi, hangi tetikte açılır, hangi spec sahiplenir.
- G3. Yeni bürokrasi yasağı: MFA, ek kimlik adımı, yeni onay katmanı, yeni tarama zorunluluğu EKLENMEZ (CEO emri; tek insan-CEO işletimi).

## 3. Mimari — DEĞİŞMEZ OMURGA (KALIR; O5 and O7 carry gaps measured 2026-10-14, closing in B64's build)

| # | Kalem | Mekanizma | Kanıt yolu |
|---|-------|-----------|-----------|
| O1 | Para-ÇIKIŞI insan kapısı | `approvals.risk_class='money_out'` onaysız `outbox`a satır düşemez (B7b) | 0015 karar yolu + APPROVAL_ENGINE testi |
| O2 | Outward exits — two named paths, no third | (1) `outbox` + packages/outbox-executor: the one exit for outward actions the holding's own workers take (mail, message, post); money, contract and identity through it wait on his approval card, routine outward communication does not. (2) Hermes's computer work — sites, forms, its WhatsApp (official business channel) and Telegram door (B64 decision 15): every step recorded, every change reversible; money, a contract, identity and an outward critical step stop at his gate; at the payment step Hermes stops and he pays. Labels and moves inside his own Gmail are not outward actions. | R7 · ⛔ B64-2 (§22-23) <!-- OPEN: B11 --> |
| O3 | Ajan yetki sınırı | Every hand open, behind two walls (CEO 2026-10-04, CAPABILITY_ARSENAL §1 item 5 — replaces least privilege under LAW A): the construction's and the holding's databases stay apart; everyone works at its own desk. Until board row B41 builds it, the compiled per-department MCP profiles (registry-generated) are what runs. Hermes: no restriction beyond his approval gate (B64 decision 15). | profile files · ⛔ B64-1 (§22-23) <!-- OPEN: B41 --> |
| O4 | Model anahtar izolasyonu | LiteLLM virtual keys; a raw provider key stands in no config or prompt — ONE registered exception: the Hermes-only key on the Max plan's 100 $ monthly API credit (B64 decision 15; his exception, protected: in the vault, given to Hermes alone, never in the repository, a prompt or any output; tried at install only after his Claude subscription). Jev's Vercel AI Gateway key is no exception: it lives in LiteLLM's environment like every provider key, and Jev is called through LiteLLM's `vercel_ai_gateway/` route (LiteLLM's documentation, read 2026-10-14; the running build is measured at build). | LiteLLM kurulumu (canlı) · ⛔ B64-3 (§22-23) |
| O5 | Yazım seamı | control-plane mutasyonları yalnız SECURITY DEFINER fn; doğrudan tablo grant'i yok. **Open gap, measured 2026-10-14 on the company engine:** `fn_update_routing(text,jsonb,text)` is EXECUTE-able by `anon` and `authenticated` — the routing door runs without a login. B64 decision 6 closes it first, before Hamza changes a brain on his word. | 0015 emsali → genelleme <!-- OPEN: B64 --> |
| O6 | Okuma sınırı | RLS read-policy seti (0014 deseni yeni ailelere kopyalanır) | migration'lar |
| O7 | Secret hijyeni | vault/.env dışında credential yok; gitleaks commit kapısı; memory-router `redact.ts` geçidi. **Added by B64 (Omnigent's method 4; in B64's plan for his yes):** a secret never stands in an agent's environment — the agent still does everything, the key stays inside a tool the main process runs — and dxb-mcp checks who calls it. Measured gap, 2026-10-14: every company Agent SDK child carries every `DXB_*` value, the database URLs and the departments' LiteLLM keys included (`packages/kernel/src/sdk-isolation.ts`, the `companyEnvName` allowlist), and dxb-mcp's source holds no caller check. For Hermes this line is named in B64's plan for his word (decision 15: no restriction beyond his gate) and is not applied to Hermes before he answers. | Phase 1 kapısı + her dalga taraması <!-- OPEN: B64 --> |
| O8 | Append-only kayıt | log/audit ailelerinde UPDATE/DELETE grant'i yok (0008 emsali) | DATA_MODEL §12 |
| O9 | Login | mevcut Supabase Auth akışı KALIR (3D hover görsel upgrade davranışı değiştirmez) | CEO_COMMAND_CENTER §16 |

## 4. Veri modeli

Yeni tablo YOK. Sicil bu dosyada yaşar (markdown tablo — düşük frekans, CEO-okur artefakt; DB'ye taşımak sicili "iş" yapardı, madde 4'e aykırı). İstisna işareti: sicil kalemi AÇILDIĞINDA normal spec/migration süreci işler ve satır güncellenir.

## 5-10. Component/Backend/Frontend/API/Event/State

Bu spec'in yürütme bileşeni yoktur (G3). Dashboard'daki tek yüzeyi: Governance grubunda salt-okunur "Security Posture" kartı — O1-O9 durum satırları (yeşil=canlı) + sicil özeti (`⏸ ertelenmiş: N kalem`). Kaynak: bu dosyanın yapılandırılmış bloğu (build-time parse; DB'siz).

## 11. Database tabloları / 12. İlişkiler

Yok (yukarıda). İlişki: diğer spec'lerin "SECURITY_MODEL siciline" referansları BU tabloya düşer (§13 sicil).

## 13. ERTELENMİŞ-SERTLEŞTİRME SİCİLİ (bağlayıcı kayıt)

| # | Kalem | Neden ertelendi | Açılma tetiği | Sahip spec |
|---|-------|-----------------|---------------|------------|
| S1 | MFA / 2FA zorunluluğu | CEO kararı: tek kullanıcı, hız önce; kapatıldı | CEO kararı VEYA sistemin internete CEO-dışı kullanıcıya açılması | (bu dosya) |
| S2 | Local erişim kısıtlama | geliştirme hızı; local açık kalır | VPS'in üretim-tek-kaynak olması + CEO kararı | BACKUP_PLAN ortamı  <!-- HISTORY --> |
| S3 | API rate-limit + IP allowlist | dış-açık API yok (Caddy yalnız dashboard) | API'nin dışa açılması | API_CONTRACTS §16 |
| S4 | Kolon-düzeyi şifreleme (at-rest) | tek-tenant VPS, disk şifreleme yeterli sayıldı | müşteri verisi (Outleteuro PII) tabloya girdiğinde | DATA_MODEL §14 |
| S5 | Audit satır imzalama (tamper-evidence) | append-only grant modeli yeterli sayıldı | dış denetim/uyum ihtiyacı | AUDIT_AND_LOGGING §16 |
| S6 | Credential rotasyon otomasyonu + kadans | rotasyon CEO-manuel (Phase 1 düzeni); bilinen bekleyen rotasyon kalemi CEO checklist'inde | Outleteuro canlı ödeme akışı ÖNCESİ zorunlu gözden geçirme | (bu dosya; Phase 1 checklist emsali) |
| S7 | 2-kişi kuralı (kritik değişimde ikinci onaycı) | N/A — tek insan var | ikinci yetkili insan katılırsa | PERMISSION_MODEL §100 notu |
| S8 | Session sertleştirme (kısa TTL, cihaz bağlama) | CEO tek cihaz seti; mevcut Auth TTL yeterli | S1 ile birlikte | (bu dosya) |
| S9 | CSP/headers sıkılaştırma turu | dış kullanıcı yok; Next.js varsayılanları | dışa açılma VEYA Phase sonu boş pencere | CEO_COMMAND_CENTER §16 |
| S10 | Ajan çıktı-içerik DLP taraması (redact dışı katman) | redact.ts + outbox insan kapısı yeterli sayıldı | dış-iletişim otonomisinin genişlemesi — **met 2026-10-14 by Hermes's outward path (B64 decision 15); not opened: his decision answers it with record-and-undo instead of a restriction** | FABLE_5_HOOK post-gate |

Sicil değişiklik kuralı: satır ekleme serbest (kayıtlı erteleme her zaman sessiz borçtan iyi); satır SİLME yalnız kalem açılıp uygulandığında (satır "AÇILDI → <spec/migration ref>" notuyla kalır — tarih silinmez).

## 14. Logging / 15. Audit

Bu dosyanın değişiklik tarihi git'tedir (sicilin audit'i = commit geçmişi). Posture kartı görüntülemeleri loglanmaz.

## 16. Security (tehdit modeli — mevcut duruşun dürüst özeti)

- **Koruma hedefi sıralaması:** (1) para/dış-aksiyon kötüye kullanımı — O1/O2 ile insan kapılı; (2) credential sızıntısı — O4/O7; (3) ajan taşması (compromised/hallüsinasyonlu ajanın yetki aşımı) — O3/O5/O6 + hook kapıları, with O5's and O7's measured gaps closing in B64's build; (4) kayıt bütünlüğü — O8.
- **Inbound text is information, never a command (B64):** a mail's text, a scraped page, a client's message and anything Hermes brings back never change a setting, a brain or a rule and never start a payment; his commands are accepted only from him — his chat, his voice, his own screen (CAPABILITY_ARSENAL §1 item 6).
- **Hermes's one risk (B64 decision 15)** <!-- CEO-OK: b64-decision15-hermes-holding-hands-and-eyes-2026-10-14 -->: a hidden instruction on an open web page could make it touch the holding's data — in Anthropic's test of 1,100 attempts with safeguards off, Opus 5.5 was fooled once. The remedy, by his decision, is not a restriction: every change Hermes makes is recorded and reversible, and what it brings back is information, never an order.
- **Kabul edilen risk yüzeyi (bilinçli):** tek-faktör CEO girişi (S1), local geliştirme erişimi (S2), at-rest kolon şifresizliği (S4), Hermes's injection risk above (decision 15). Bunlar CEO kararıyla açık risklerdir; sicil tetikleri izler.
- **En zayıf halka dürüstlüğü:** insan-CEO'nun tek oturumu. Telafi: para-çıkışı yine ayrı onay ekranından geçer (oturum çalınsa bile outbox kuyruğu görünürdür; kritik alarm `alerts` kanalında).

## 17. Error handling / 18. Retry / 19. Fallback

Güvenlik mekanizması hatası her zaman KAPALI-güvenli (fail-closed): O1 onay sorgusu hata verirse outbox'a yazım REDDEDİLİR; gateway profili yüklenemezse ajan araçsız başlar (çalışamaz — sızamaz). Fallback yönü hiçbir zaman "açık geç" değildir.

## 20. Test planı / 21. Acceptance criteria

- O1 kanıtı: onaysız money_out outbox denemesi → fn reddi (mevcut test KALIR, her dalga koşulur).
- O7 kanıtı: gitleaks dalga-sonu taraması 0 leak; redact canary testi (MEMORY_ARCHITECTURE §20).
- Kabul: Posture kartı O1-O9 canlı gösterir; sicil tablosu dashboard özetiyle eş sayıda (N kalem); fail-closed testleri (O1, gateway) yeşil.

## 22. Migration planı / 23. Rollback planı

Migration yok. "Rollback" bu dosyada tersine işler: bir omurga kalemini gevşetme talebi = ÖNCE bu dosyada ⛔ değişiklik + CEO onayı + gerekçe satırı; sonra teknik iş.

**⛔ Backbone changes — B64 (2026-10-14), recorded here before any technical work.** Design:
`.planning/quick/20261012-b64-is-akisi/is-akisi.html`.
- **B64-1 · O3 (recorded late):** least privilege gave way to "every hand open, behind two walls" on his order of
  2026-10-04 <!-- CEO-OK: open-tools-two-walls-ordered-2026-10-04 -->; the row was not rewritten then. Reason: his order;
  the two walls (the databases apart, everyone at its own desk) carry the safety. Built by B41.
- **B64-2 · O2:** a second named outward path — Hermes's computer work — beside the outbox
  <!-- CEO-OK: b64-decision15-hermes-holding-hands-and-eyes-2026-10-14 -->. Reason: decision 15 makes Hermes the
  holding's 24/7 hands and eyes with no restriction beyond his approval gate; the safety moves to his gate (money,
  contract, identity, an outward critical step), the record of every step and the reversibility of every change.
- **B64-3 · O4:** one exception to "no raw provider key": the Hermes-only key, protected. Reason: his own words on
  decision 15 — *"İstisna olur yani, o API anahtarı koru"*; tried at install only after his Claude subscription.
- **B64-4 · O5 and O7 tightened, not loosened:** the routing door that runs without a login closes first
  (decision 6 <!-- CEO-OK: b64-decision6-hamza-changes-brains-on-his-word-2026-10-13 -->); secrets leave the agents'
  environment and dxb-mcp checks its caller (B64's plan) — for Hermes named in that plan for his word.

## 24. Uygulama sırası (doğrulamalı)

```bash
grep -c "^| O[0-9]" HOLDING-OS-MASTER-PLAN/SECURITY_MODEL.md    # → 9 (omurga tam)
grep -c "^| S[0-9]" HOLDING-OS-MASTER-PLAN/SECURITY_MODEL.md    # → 10 (sicil tam)
gitleaks detect --source . --no-banner | tail -1                 # → no leaks found
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: mevcut Phase 1-7 güvenlik varlıkları (canlı); hiçbir yeni kurulum yok.
- Risk: sicilin unutulması → tetik koşulları Outleteuro/dışa-açılma fazlarının giriş kriterlerine yazılır (IMPLEMENTATION_ROADMAP D5'e madde: "Faz 11 girişinde S4+S6 zorunlu gözden geçirme").
- Edge: ertelenen kalemin tetiklenmesi Fable-sonrası döneme denk gelirse → Opus sicili okur, kalemi normal spec sürecinde açar (⛔: omurga gevşetme Opus'a KAPALI — yalnız eldeki en güçlü model + CEO).

## Opus-devralma notu

Bu dosya Opus için "dokunma listesi"dir: O1-O9'a dokunma, S1-S10'u tetiksiz açma, tetik gelirse sahip spec'e git. Sicil formatı sabit — satır ekle, silme.

## Done definition (bu spec)

27 başlık ✓ · omurga 9 kalem (kanıt yollu) ✓ · sicil 10 kalem (neden+tetik+sahip) ✓ · yeni-iş-açmama sınırı açık ✓ · fail-closed ilkesi ✓ · tehdit modeli dürüst özeti ✓ · doğrulama komutları ✓ · Opus dokunma-listesi ✓ · B64's ⛔ backbone changes recorded (O2, O3, O4; O5 and O7 gaps named, closing in its build)
