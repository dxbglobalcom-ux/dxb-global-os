# Sol's single pass on the runtime-isolation job — the verdict (2026-10-03)

Run: `refuter.sh --card CARD.md`, brief `sol-claim-pass2.txt`; gpt-6.1-sol at `high` (card: normal,
total 5 — the lead's grading); range `6e3f693b..5de3595e`; Codex session
`01a101a3-4761-7a02-83ea-26700624f29b`; 14:00 → 14:16; tokens used 148,401; `EXIT=0`. Sol did not
re-grade the card. The CEO's order for this job: one pass, its findings fixed by a fork, no second
round.

## The verdict, verbatim

**Verdict: REFUTED — “tam ayrılık kanıtlandı” iddiası henüz ayakta değil.** Mevcut sekiz SDK çağrısı izolasyonu kullanıyor; logger düzeltmesi çalışıyor. Ancak ruler hâlâ aşılabiliyor, Codex home override’ı inşaatın evini seçebiliyor ve Codex çağrıları istenen izolasyon kaydını yazmıyor. Kartı yeniden puanlamadım; verilen `high` düzeyinde denetledim.

1. **Part A — ilk denetimin düzeltmeleri**

   | İstenen düzeltme | Sonuç |
   |---|---|
   | Transcript’i gerçek session id ile ölçmek; gerçek hatları çalıştırmak | **Kısmen karşılandı.** Gerçek chat drain ve task executor çalıştırılmış; dört session id için transcript kontrolü var. |
   | Ruler’ın kaçırdığı import, alias, seçenek ve receipt biçimlerini kapatmak | **REFUTED.** Eski örnekler kapatılmış; aşağıdaki yeni örnekler geçiyor. |
   | Logger hatasının başarılı cevabı bozmaması | **STANDS AFTER ATTEMPTED REFUTATION.** Hata atan sink, getter ve bozuk mesajlarla bellekte çalıştırdım: `no throw`. |
   | B43 izolasyon kontrolünü korumak | **STANDS.** Kontroller korunmuş; `strictMcpConfig` eklenmiş. |

   308 runtime kaynak dosyasını ölçtüm: sekiz mevcut SDK çağrısının tamamı yardımcıyı kullanıyor ve receipt’i döngünün ilk adımında besliyor. Mevcut kodda izolasyonsuz dokuzuncu çağrı bulmadım.

2. **Ruler — maddeler 10a ve 13 REFUTED**

   Dosyadaki gerçek analiz fonksiyonlarını TypeScript/VM ile **bellekte**, test suite’i çalıştırmadan denedim:

   | Karşı örnek | Ölçülen sonuç |
   |---|---|
   | Yeni dosyada `require("@anthropic-ai/" + "claude-agent-" + "sdk")` | `sites=[]`, `problems=[]` |
   | SDK import yolunda `\u0073dk` | `sites=[]`, `problems=[]` |
   | Yardımcıyı `./fake/sdk-isolation.js` üzerinden almak | Çağrı kabul edildi |
   | Profile `Object.assign(profile, {strictMcpConfig:false, mcpServers:…})` uygulamak | Çağrı kabul edildi |
   | Receipt adını döngü içindeki hoisted fonksiyonla gölgelemek | Receipt kabul edildi; gerçekte boş fonksiyon çağrılıyor |
   | `cp["execFile"]("codex", …)` | `launches=[]`, `problems=[]` |
   | `exec("env CODEX_HOME=/home/dxb/.codex codex exec …")` | Program `env` sayıldı; Codex kontrolünden geçti |
   | Geçerli `env` sonrasında `...{env:process.env}` yaymak | `companyHome=true`; gerçek son `env` denetlenmedi |

   Bunlar, dosya dışında oluşturulan program adlarına ilişkin kabul edilmiş sınırın ötesinde: örnekler aynı dosyada okunabiliyor.

   Kaynaklar: [SDK erken çıkışı](</home/dxb/DxB Global OS/tests/governance/company-isolation.test.ts:363>), [yardımcı yolunun kabulü](</home/dxb/DxB Global OS/tests/governance/company-isolation.test.ts:152>), [profil takibi](</home/dxb/DxB Global OS/tests/governance/company-isolation.test.ts:174>), [launcher ve env okuması](</home/dxb/DxB Global OS/tests/governance/company-isolation.test.ts:508>).

   **Gerekli düzeltme:** Ham substring filtresini kaldırmak; gerçek modül ve binding kimliğini çözmek; profilin mutasyonunu/başkasına verilmesini izlemek veya reddetmek; namespace element erişimini ve shell wrapper’larını okumak; launch seçeneklerinin **son etkili değerini** denetlemek. Bu örneklerin her biri kendi nedeniyle kırmızı olmalı.

3. **Strict MCP ve canlı kanıt — mevcut seçenekler STANDS; tam kapsam UNVERIFIED**

   Yardımcı `strictMcpConfig:true` veriyor. Task ve workflow’un sonradan geçirdiği profil değeri de `buildSdkToolOptions()` içinde sabit `true`; mevcut iki hat bunu gevşetmiyor.

   [Ham lanes kanıtı](</home/dxb/DxB Global OS/.planning/quick/20261003-runtime-isolation/evidence/lanes-probe.txt:1>) gerçek built chat/task kodunu çalıştırıyor. Wrapper’ın çalışma dizini ve env yükleme biçimi scheduler unit’iyle eşleşiyor. Chat’te şirket dışı MCP yok; task’ta şirketin `dxb-mcp` araçları korunmuş. Session id ile yapılan kontroller, eski `sdk-*` ölçüsünden daha güçlü.

   Ancak:

   - Sekiz hattın ikisi canlı çalıştırılmış. Init isimleri ve canlı MCP durumları ayrıca yapılan **shape çağrılarından** geliyor.
   - [Connectors probe](</home/dxb/DxB Global OS/.planning/quick/20261003-runtime-isolation/connectors-probe.mjs:35>) bugün karşılaştırmayı yeniden üretemiyor: `{}` ve `{strictMcpConfig:true}` varyantlarının ikisi de yardımcıdan `true` alıyor. Bellekte seçenekleri ölçtüm: **iki varyant aynı**. Negatif varyant açıkça `false` vermeli.
   - Transcript wrapper’ı okuma hatalarını bastırıyor; başarısız probe veya eksik session id sonunda shell başarıyla çıkabiliyor. Başarısızlık ve okunamayan kapsam açıkça reddedilmeli.
   - `hooks=0`, SDK’nin görünür hook olaylarını sayıyor; bütün hook türlerinin yokluğunu tek başına kanıtlamıyor.

   Resident logunda `[isolation]` satırı bulamadım. Restart ölçüsü de user bus erişiminde `Operation not permitted` döndü. **Resident’in gerçek şirket çağrısı ve bu pass sonrası restartı UNVERIFIED.** Önceden bildirilen ortak Claude-home ayak izini yeni diff kusuru olarak saymadım.

4. **Part B — Codex kapısı**

   Varsayılan home doğru. Kaynaktaki runner’ı bellekte stand-in ile ölçtüm: devralınan `CODEX_HOME=/home/dxb/.codex`, şirket home’u ile eziliyor.

   **Fakat kesin “inşaatın home’una ulaşamaz” iddiası REFUTED:**

   ```text
   DXB_COMPANY_CODEX_HOME=/home/dxb/.codex
   → runner’ın çocuğa verdiği CODEX_HOME=/home/dxb/.codex
   ```

   [Yardımcı](</home/dxb/DxB Global OS/packages/orchestrator/src/critical-gate.ts:159>) override’ı doğrulamadan kabul ediyor. Yer değiştirme seçeneği korunabilir; çözümlenen yolun inşaat home’u veya ona yönelen bir link olması reddedilmeli. Mevcut kurulumda bu override’ın kullanıldığını ölçmedim.

   Madde 11’in kanıtı: login çıktısı mevcut; bağımsız `stat` ölçümünde iki auth dosyası farklı inode’larda, tek linkli normal dosyalar. İçeriklerini okumadım.

   Madde 12’nin çıktısı, seçilen şirket home’unda iki canary’nin yokluğunu destekliyor. **Stderr’de MCP satırı olmaması, bütün MCP başlangıçlarının yokluk kanıtı değil.** Probe tam stdout/stderr’i kaldırıyor, üretimdeki schema bayrağını kullanmıyor ve ikinci model için yalnızca `ok` kaydı var.

   Ayrıca [runner](</home/dxb/DxB Global OS/packages/orchestrator/src/critical-gate.ts:175>) hiçbir izolasyon receipt’i üretmiyor. Bellekte başarı ve hata senaryolarının tamamında **`stdoutJournalLines=0`**. Panelin `decision_log` kaydı, her challenger’ın ne yüklediğini ve ne okuduğunu taşımıyor. **Done-list bu açık şartı hiç sınamıyor.** Her Codex çağrısı için ölçülen yükleme/okuma kaydı eklenmeli.

5. **Davranış değişikliği — STANDS AFTER ATTEMPTED REFUTATION**

   Logger’ın hata yayması düzeltilmiş. Mevcut seçenek sıralarında model, effort, tools veya systemPrompt’u yanlışlıkla ezen değer bulmadım. `defaultExecutor` export’u fonksiyonun davranışını değiştirmiyor.

   Gate’in başarı, exec hatası ve eksik çıktı yollarını yazmayan stand-in’lerle ölçtüm: sırasıyla `ok:true`, `ok:false / runner timeout`, `ok:false / missing output`. Diff’in error path’i değiştirdiğini bulmadım.

6. **Battery — başarısız test yok**

   Verilen [878 satırlık ham çıktı](</home/dxb/DxB Global OS/.planning/quick/20261003-runtime-isolation/evidence/battery.txt:671>) şunu söylüyor: sandbox **1.086 geçti / 45 atlandı**, host **266 geçti**, residue yok; **`BATTERY_GREEN`, `EXIT=0`**.

   Hata gibi görünen kayıtların tamamı:

   | Kayıt | Diff ilişkisi |
   |---|---|
   | `sink down`; üç bozuk spill restore hatası | Kasıtlı obs hata senaryoları; geçti |
   | İki `ECONNREFUSED` | Erişilemeyen DB/alert senaryosu; geçti |
   | İki synthetic ladder failure | Retry senaryosu; geçti |
   | Üç QA `FAIL` | Reject/escalation senaryoları; geçti |
   | `decision_log_approval_id_fkey` | Kasıtlı başarısız yazım; geçti |
   | `load-jobs: audit write failed` | Watchdog hata senaryosu; geçti |
   | Eksik ve bozuk manifest | Drift-review senaryoları; geçti |
   | Bir `AttributeError`, üç `SyntaxError` | Research ruler’ın bilerek bozduğu dosyalar; geçti |

   Bunlar bu diff’in oluşturduğu test başarısızlıkları değil. **Eski kapsam açığı sürüyor:** 30 context/cost hook testi host bölümünde yeniden koşulmamış; toplam 45 test atlanmış.

Denetimde repo veya test verisi yazmadım. `sol_reader` ile başlangıç ve son ölçümünde `audit_log / v_audit_trail` **1.795 / 1.795** kaldı.

## The lead's sorting

A blocks · B is repaired in this same pass · C is older than this work and stays here. One fork writes
the A and B fixes, each proven by a test that failed first; the lead measures and commits.

| # | Class | Finding (Sol's section) | Correction |
|---|---|---|---|
| A1 | A | The ruler accepts eight new counter-examples (§2; done-list 10a and 13 refuted): a computed `require` specifier, a `sdk` escape, the helper taken from `./fake/sdk-isolation.js`, `Object.assign(profile, {strictMcpConfig:false, …})`, a receipt shadowed by a hoisted function, `cp["execFile"]("codex", …)`, `exec("env CODEX_HOME=… codex exec …")`, `...{env: process.env}` after a valid `env` | each red for its own reason: no raw-substring prefilter; module and binding identity resolved, not read as text (escapes decoded, a non-literal specifier refused); the helper's real module checked; the profile's mutation or hand-off refused; element access on a `child_process` namespace and shell wrappers read; the last effective `env` checked |
| A2 | A | `DXB_COMPANY_CODEX_HOME` can name the construction's home (§4; `packages/orchestrator/src/critical-gate.ts:159`) | resolved and refused when it is the construction's `~/.codex`, inside it, or a link to it; the challenger is then recorded unavailable, never run from there |
| A3 | A | The Codex runner writes no isolation line (§4). The card's job sentence asks that each call write one journal line saying what it loaded and what it read; the done-list never tested it | one `[isolation] lane=gate …` line per Codex call, success or failure, from what was measured; it never touches the call |
| B1 | B | `connectors-probe.mjs` compares two identical options — the helper forces `strictMcpConfig: true` in both (§3) | the negative variant passes `false` explicitly; re-run in the resident's shape |
| B2 | B | `run-lanes-probe.sh` swallows read errors; a failed probe or a missing session id can still exit 0 (§3) | both fail loudly |
| B3 | B | `gate-probe.sh` drops the full stdout/stderr, does not use the runner's own flags (`--output-schema`), keeps only `ok` for the second model (§4) | both streams kept whole, the runner's flags, both models' raw output |
| B4 | B | `hooks=0` counts only the hook events the SDK shows; "no MCP line on stderr" does not prove that no MCP server started (§3, §4) | what each probed call opened and started, measured (`strace -f`): no construction file opened, no MCP server process started beyond the lane's own |
| — | UNVERIFIED | The resident's own first receipt (the company has made no call since the restart); six of the eight lanes are proven by their options and the shape calls, two run live (§3) | stays UNVERIFIED and is said so in the report |
| C1 | C | 30 context/cost hook tests skipped host-side, 45 skipped in all (§6) — older than this work | stays in this folder |
