SOL_DB_REACH=armed engine=127.0.0.1:54422 tool_sha256=06fc5e586b510191
AUDIT_CARD class=normal total=5 effort=high
**Kart işi düşük puanlıyor: `reasoning=2` olmalı; toplam 6 → critical → Sol `xhigh`.** §3, durum taşıyan, eşzamanlı ve agentic işleri açıkça 2 sayıyor. Çok sayıda çalışan hattın bağlamını, araçlarını ve kalıcılığını değiştirmek bu sınıfa giriyor. `blast=2`, `risk=2`, `ambiguity=0` yerinde.

**Faz 1’de izolasyonsuz kalmış SDK çağrısı bulmadım. Ancak “tam ayrılık kanıtlandı” iddiası henüz ayakta değil.** İki ölçü açığı ve bir makbuz sağlamlığı sorunu var.

1. **Tamamlanma listesi — UNVERIFIED**

   [Madde 9](/home/dxb/DxB%20Global%20OS/.planning/quick/20261003-runtime-isolation/DONE-LIST.md:46), yalnızca yeni `sdk-*` transcript arıyor. SDK 0.3.259’un kendi tanımı dosyayı **`{sessionId}.jsonl`**, alt ajan klasörünü **`{sessionId}/`** olarak adlandırıyor (`sdk.d.ts:561`). Yalnızca `sdk-*` arayan ölçü gerçek bir sızıntıyı kaçırabilir.

   Ayrıca verilen probe, lead ortamında tek bir araçsız Sonnet çağrısı. Sekiz gerçek hattın, özellikle şirket MCP araçları taşıyan task/workflow hatlarının uçtan uca kanıtı değil. Makbuz da skills, agents, hooks veya ayar kaynaklarını göstermiyor.

   **Gerekli düzeltme:** Transcript ölçüsünü gerçek `session_id` ve bütün ilgili dosya yollarıyla kurmak; çalışan hatlardan, şirket araçlarının korunduğunu da gösteren kanıt almak. Madde 9’un `UNVERIFIED` bırakılması doğru.

2. **Çağrı kapsamı — mevcut kod STANDS; ruler REFUTED**

   `packages/*/src` ve `apps/*/src` altında **308 kaynak dosyasını** taradım: sekiz SDK `query()` çağrısının tamamı `companyIsolation()` kullanıyor. Başka bir Claude çalıştırma yolu bulmadım. `critical-gate.ts:168` içindeki Codex çağrısı hâlâ eski ortamı devralıyor; verilen kapsam gereği bu **faz 2**, faz 1 kusuru değil.

   Buna karşılık [ruler](/home/dxb/DxB%20Global%20OS/tests/governance/company-isolation.test.ts:50) bellekte yapılan karşı örneklerde kaçırıyor:

   | Örnek | Ruler sonucu |
   |---|---|
   | `import { query as ask }` | Yakalıyor |
   | `import * as sdk; sdk.query(...)` | `sites=[]` |
   | `require(...)` veya dinamik import | `sites=[]` |
   | `const ask=query; ask(...)` | `sites=[]` |
   | Yardımcıdan sonra izolasyonu geri açan seçenekler | `isolated=true` |
   | Yorumdaki `isolationReceipt(...)` | `receipt=true` |

   Sekiz mevcut çağrı dururken dokuzuncu çağrı bu biçimlerden biriyle eklenirse test yeşil kalabilir.

   **Gerekli düzeltme:** Import/alias bağlantısını, son seçenek değerlerini ve her çağrının makbuz bağlantısını denetlemek; bu karşı örneklerle ruler’ı sınamak.

3. **Yardımcının izolasyonu — belgelenen davranış STANDS; canlı tam kanıt UNVERIFIED**

   [Yardımcının seçenekleri](/home/dxb/DxB%20Global%20OS/packages/kernel/src/sdk-isolation.ts:24) SDK sözleşmesiyle uyumlu:

   - `settingSources: []`: user/project/local ayarlarını kapatır; CLAUDE.md yüklemek için `project` gerekir.
   - `autoMemoryEnabled: false`: auto-memory okumasını ve yazmasını kapatır.
   - `persistSession: false`: `~/.claude/projects/` altında oturum kalıcılığını kapatır.

   [Probe çıktısı](/home/dxb/DxB%20Global%20OS/.planning/quick/20261003-runtime-isolation/evidence/probe-after.txt:1): **44.158 → 480 token**, **58/5/1 → 0/0/0** araç/MCP/eklenti; dört canary `ABSENT`.

   Bu, seçilen ortamda güçlü destek. Ancak skills adları, hook çalışması ve dosya yazılmaması ölçülmemiş. Ayrıca SDK, `settingSources: []` altında managed-policy katmanının hâlâ okunabildiğini söylüyor; bu seçenek bütün filesystem erişimini engelleyen bir sandbox değil.

4. **Davranış değişikliği — yayılma sırası STANDS; logger sağlamlığı REFUTED**

   Model, effort, tools ve systemPrompt değerlerini yanlışlıkla ezen bir seçenek sırası bulmadım. Döngüler hâlâ aynı result mesajında dönüyor/kırılıyor; `seen(msg)` mesajı tüketmiyor.

   Ancak [makbuzun `log()` çağrısı](/home/dxb/DxB%20Global%20OS/packages/kernel/src/sdk-isolation.ts:57) korunmamış. Bellekte başarı sonucu ve hata atan logger verildiğinde çıktı:

   ```text
   successful result logger error propagates: journal sink failed
   ```

   Logger hatası başarılı cevabın işlenmesini durdurabiliyor. Üretimde bunun gerçekleştiğini ölçmedim.

   **Gerekli düzeltme:** Makbuz hatasının şirket çağrısının sonucunu değiştirmemesini sağlamak.

5. **B43 değişikliği — STANDS AFTER ATTEMPTED REFUTATION**

   [Eski test taşınmış](/home/dxb/DxB%20Global%20OS/tests/b43/dispatch-book.test.ts:214), zayıflatılmamış. `settingSources`, `cwd` ve rollback kontrolü korunmuş; auto-memory ve transcript seçenekleri eklenmiş. Ham battery’de B43’ün **20 testi geçiyor**.

6. **Battery — başarısız test yok**

   [Ham çıktı](/home/dxb/DxB%20Global%20OS/.planning/quick/20261003-runtime-isolation/evidence/battery.txt:670): sandbox **1.038 geçti / 45 atlandı**; host **266 geçti**; residue yok; **`BATTERY_GREEN`, `EXIT=0`**.

   Hata gibi görünen kayıtların tamamı şu senaryolarda:

   | Kayıt | Kaynağı ve diff ilişkisi |
   |---|---|
   | `sink down`; bozuk spill JSON’u, üç restore hatası | `obs-wrapper`: kasıtlı hata enjeksiyonu; geçti |
   | DB bağlantısı ve alert için `ECONNREFUSED` | `hook`: kasıtlı erişilemeyen DB; geçti |
   | İki synthetic ladder failure; QA FAIL kayıtları | Retry/reject senaryoları; geçti |
   | `decision_log_approval_id_fkey` | Kasıtlı başarısız karar yazımı; geçti |
   | `load-jobs: audit write failed` | Watchdog ret senaryosu; geçti |
   | Eksik manifest ve bozuk manifest JSON’u | Drift-review senaryoları; geçti |
   | `AttributeError: ... items` | Research ruler’ın bozduğu config; geçti |
   | Üç `SyntaxError: import json (((` | Research ruler’ın bozduğu script; geçti |

   Bu çıktılar izolasyon diff’inin oluşturduğu regresyonlar değil. **Eski kapsam açığı:** Atlanan 30 context/cost hook testi host bölümünde yeniden koşulmamış; kalan 15 test de atlanmış. Dolayısıyla “bütün testler çalıştı” denemez.

Denetimde dosya veya test verisi yazmadım. Bağımsız SQL ölçüsünde `audit_log` ve `v_audit_trail` başlangıçta ve sonda **1.795 / 1.795** kaldı. Çalışan servisin restartını ve gerçek şirket çağrısının makbuzunu bağımsız doğrulayamadım: user bus erişimi reddedildi; bunlar **UNVERIFIED**.
Reading additional input from stdin...
OpenAI Codex v0.159.3
--------
workdir: /home/dxb/DxB Global OS
model: gpt-6.1-sol
provider: openai
approval: never
