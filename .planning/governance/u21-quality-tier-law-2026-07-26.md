---
name: u21-quality-tier-law-2026-07-26
description: "2026-07-26 gecesi: U21 kalite kademe kanunu canlıda (Sonnet kritik işlerden çıktı, 8 model kovuldu), OpenAI abonelik hattı = Codex CLI (API anahtarı kotasız), konsey = çürütücü kapısı"
metadata: 
  node_type: memory
  type: project
  originSessionId: 89e1e9f0-ad11-443e-8df0-a0f508267a51
  modified: 2026-07-26T00:40:47.861Z
---

**2026-07-26 ~01:50-02:40, commit 649cb20 + a7ddc65.** CEO emri: *"ana hedef KALİTE!!! her işte!!! zeka!!!"*

# Kanun (MODEL_ROUTING_SPEC §4d, kayıt 00-INDEX U21)

Hüküm, zevk, yapı ve bir insanın gördüğü her çıktı = **Opus 5**. Ayrım çizgisi maliyet değil, kod-vs-metin değil: *"bu işte zevk, yapı veya insanın göreceği sonuç var mı?"* Varsa L1, **kalıcı** — site/mağaza kurulumu, tasarım, video yönetimi sonradan ucuz kodlayıcı gelse de geri verilmez. L2 Sonnet mekanik backend kodu · L3 Sonnet toplama/taslak · L4 Sonnet düşük efor = yerel modelin ayrılmış koltuğu. Kovulanlar (retired+banned): haiku 4.5, DeepSeek Flash, Kimi 2.7, Kimi 3, GLM 5.2, Qwen 3.6, MiniMax M3, Codex 5.5. 205 beyin glm-5.2 yer tutucusundan çıktı (22 Opus 5 / 183 Sonnet).

**Yeni değişmez:** `worker-shim` modeli YALNIZ `model_tier`'dan çözer — bir kademede iki model artık kusur.

# OpenAI: anahtar ≠ abonelik (ölçüldü)

CEO anahtarı verdi (`~/.dxb/openai.key`, kendi terminalinde yazdı, sohbete girmedi). Anahtar doğrulanıyor (200, 117 model, gpt-5.6-sol/terra/luna dahil) **ama her tamamlama `429 insufficient_quota`** — OpenAI API faturası ChatGPT aboneliğinden ayrı cep. **Çalışan yol: Codex CLI**, zaten abonelik token'larıyla giriş yapmış (`~/.codex/auth.json` auth_mode, OPENAI_API_KEY yok); canlı `gpt-5.6-sol` cevabı alındı. Yani "anahtarla abonelik kotasından koştur" imkânsız; hat CLI üzerinden kurulur.

# Konsey = çürütücü kapısı (§4e, CEO iki kez söyledi + "bunu unutma sakın")

**Opus 5 cevabı YAZAR** → Solo 5.6 + GPT 5.5 **çürütmeye çalışır** (yanlış rakam, atlanan kısıt, doğrulanmamış iddia, fiyatlanmamış risk) → **Opus 5 düzeltir ve imzalar**, itirazlar + akıbetleri kayda geçer. Yalnız para/itibar/yön bağlayan L1 sınıflarında (`needs_council`). v1 CNCL-01 (üç ucuz üretici + kıyas-hakemi) ÖLÜ. **Adaptör HENÜZ YAZILMADI** — beyan edildi, "çalışıyor" denmedi.

# Dersler (tekrar etme)

- `routing_rules` iki model kolonu taşır: `model` (policy.ts) + `model_id` (fn_select_model). Birini güncelleyip diğerini unutmak = U20'de de düşülen tuzak; testler yakaladı.
- storageState "süresi dolmuş" değildi — çerez `localhost` alanına yazılı, ben `127.0.0.1` açmıştım. Aynı hata "oturum öldü" yanılgısı üretir.
- Locale çerezi **`dxb-locale`**; `NEXT_LOCALE` ile koşulan batarya EN'i iki kez render eder ve TR bacağı hakkında yalan söyler.
- :3000 `next start` (production build) koşar — kaynak düzenlemesi rebuild + gerçek restart ister; eski sunucu portu bırakmaz, pid'i `ss` ile bulup öldür.
- Görsel kapı U21'de yönetişim kusuru yakaladı: beş CEO yüzeyi ham katalog kimliğini basıyordu (ekranda `fable-5`). Ortak çözücü: `apps/dashboard/src/lib/model-names.ts`.

İlgili: [[model-routing-hierarchy]] · [[opus-5-construction-governance]] · [[design-verification-rule0]]
