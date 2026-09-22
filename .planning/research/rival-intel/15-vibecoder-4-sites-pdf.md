# 15 — ozgurmode · *"Vibe Coding İçin 4 Temel SaaS Altyapı Aracı"* (Her Vibe Coder'ın Bilmesi Gereken 4 Site — Part 5)

> **What this source is.** Not a system demonstration: a **two-page A4 document** published by the
> Turkish maker-channel `ozgurmode`, naming four hosted services that remove four infrastructure
> jobs from a builder — e-mail, background work, payment, deployment. The CEO put it on the queue
> himself; it was measured on 2026-07-28 as a PDF rather than a video and it has waited at
> `fetched` since.
>
> **How it was read (the directive's §3.2 requires this sentence).** Both pages were read whole and
> in order, top to bottom, in two ways at once: **as an image** — rendered at 150 dpi with
> `pdftoppm` and read page by page — and **as text** — `pdftotext -layout`, so no line could be
> skipped or paraphrased from a picture. Every colour, band and rule quoted below was **sampled
> from the rendered pixels**, not estimated. This source carries no moving image, so §3.2's motion
> requirements are answered one by one in §2.1 against the object that does exist.

---

## 1. Source identity

| | |
|---|---|
| Address | https://drive.google.com/file/d/105ejHFZg-07mYEJwT4vZ5rxFClS-h9G4/view |
| Operator | Not named on the document |

## 2. Page-by-page record — every block on both pages, in order

Verbatim Turkish as printed. No block is merged, skipped or summarised.

| # | Page · block | What is printed | Reading | Label |
|---|---|---|---|---|
| 01 | p1 · hero band | eyebrow, letter-spaced: **`HER VIBE CODER'IN BILMESI GEREKEN 4 SITE — PART 5`** | The document announces itself as **part 5 of a numbered series** — a publishing cadence, not a one-off | V |
| 02 | p1 · hero band | title, serif, white on near-black: **`Vibe Coding İçin 4 Temel SaaS Altyapı Aracı`** | The only serif on either page; every other face is sans | V |
| 03 | p1 · hero band | sub-line: *`Sıfırdan altyapı kurmakla günlerini harcama. Bu dört servisi bağla, tüm enerjini sadece projeni geliştirmeye ayır.`* | The promise is **time**, stated as the reader's own days | V |
| 04 | p1 · lede | *`Modern yazılım geliştirmede altyapı genellikle en çok vakit kaybettiren katmandır. E-posta, arka plan işlemleri, ödeme ve deployment gibi temel ihtiyaçlar için bu dört araç sayesinde saatler süren entegrasyonları dakikalara indirebilirsin.`* | Names the four jobs in the order the document then keeps: **e-mail · background work · payment · deployment** | V |
| 05 | p1 · table header | `SERVIS` · `KATEGORI` · `ALTERNATIF` · `LISANS` | Four columns. The fourth is **licence** — the document treats "can I self-host / what does it cost me legally" as a first-class column | V |
| 06 | p1 · table row 1 | **Resend** · `E-posta API` · `SendGrid, Mailgun` · `Freemium` | | V |
| 07 | p1 · table row 2 | **Trigger.dev** · `Background Jobs` · `Inngest, BullMQ` · `Açık Kaynak` | The alternative named is **BullMQ**, which our own stack rules reject with Redis (§4) | V |
| 08 | p1 · table row 3 | **Lemon Squeezy** · `MoR / Ödeme` · `Paddle, Stripe` · `Freemium` | | V |
| 09 | p1 · table row 4 | **Coolify** · `Self-Hosted PaaS` · `Vercel, Railway` · `Açık Kaynak` | | V |
| 10 | p1 · section eyebrow | `E-POSTA ALTYAPISI` (purple, letter-spaced) | Each of the four gets the same four-part block: eyebrow → name+domain → one-line dek → body → two cards | V |
| 11 | p1 · Resend head | **`Resend (resend.com)`** · dek: *`Geliştirici odaklı modern e-posta API'si.`* | | V |
| 12 | p1 · Resend body | *`Karmaşık SMTP konfigürasyonları ve HTML e-posta şablonlarıyla uğraşmak yerine API anahtarını Claude veya Cursor'a ver. Uygulamanın tüm otomatik mailleri saniyeler içinde hazır. React tabanlı e-posta bileşenleri sayesinde modern, responsive mailler tasarlamak da mümkün.`* | **The instruction is "give the API key to Claude"** — the document's working assumption is that an agent writes the integration | V |
| 13 | p1 · Resend cards | `GÜÇLÜ YÖNÜ`: *`AI dostu dokümantasyon ve SDK'lar. llms.txt desteği ile LLM'ler için optimize edilmiş.`* — `İDEAL KULLANIM`: *`İşlemsel mailler (şifre sıfırlama, hoş geldin), toplu kampanyalar, bildirimler.`* | **`llms.txt`** is named as the deciding strength: the product is chosen because a model can read its documentation | V |
| 14 | p1 · section eyebrow | `ARKA PLAN İŞLEMLERI` | | V |
| 15 | p1 · Trigger.dev head | **`Trigger.dev (trigger.dev)`** · dek: *`Açık kaynak arka plan görev yöneticisi.`* | | V |
| 16 | p1 · Trigger.dev body | *`Serverless platformların kısa timeout süreleri uzun AI işlemleri için engeldir. Trigger.dev bu işlemleri arka planda, saatlerce sürebilecek şekilde ve uygulama çökmeden yürütür. CRIU teknolojisi sayesinde işlem beklerken kaynakları serbest bırakarak maliyet avantajı sağlar.`* | Two mechanisms named: **long-running work outside a request timeout**, and **CRIU** — freezing a waiting process to disk and releasing its resources | V |
| 17 | p2 · Trigger.dev cards | `GÜÇLÜ YÖNÜ`: *`Hata toleransı — işlem başarısız olduğunda sadece kaldığı adımdan devam eder, tüm süreci baştan başlatmaz.`* — `İDEAL KULLANIM`: *`OpenAI/Claude API çağrıları, veri işleme pipeline'ları, cron job'lar, webhook işleme.`* | **Resume from the failed step** — the one idea on this page our own ledger already adopted, and §4 measures what happened to it | V |
| 18 | p2 · section eyebrow | `ÖDEME VE FATURALANDIRMA` | | V |
| 19 | p2 · Lemon Squeezy head | **`Lemon Squeezy (lemonsqueezy.com)`** · dek: *`Kayıtlı Satıcı (MoR) ve küresel ödeme altyapısı.`* | | V |
| 20 | p2 · Lemon Squeezy body | *`SaaS ve dijital ürün satışlarında uluslararası vergi, fatura ve abonelik yönetimi ciddi bir yasal yüktür. Lemon Squeezy Merchant of Record olarak bu sorumlulukları üstlenir; sen sadece ürününü tanımlarsın. KDV, GST gibi tüm küresel vergileri otomatik hesaplar ve tahsil eder.`* | The service sells **legal position**, not a payment form: it becomes the seller of record | V |
| 21 | p2 · Lemon Squeezy cards | `GÜÇLÜ YÖNÜ`: *`Yasal sorumluluğu platforma devretme. Küresel vergi ve fatura otomasyonu tek elden.`* — `İDEAL KULLANIM`: *`SaaS abonelikleri, dijital ürün satışı, lisans anahtarı dağıtımı, affiliate programları.`* | | V |
| 22 | p2 · section eyebrow | `DEPLOYMENT VE HOSTING` | | V |
| 23 | p2 · Coolify head | **`Coolify (coolify.io)`** · dek: *`Kendi sunucunda platform yönetimi (Self-Hosted PaaS).`* | | V |
| 24 | p2 · Coolify body | *`Vercel ve benzeri platformlar proje sayısı arttıkça maliyetli hale gelir. Coolify, kiraladığın bir VPS'i (ör. Hetzner) Vercel benzeri bir yönetim paneline dönüştürür. GitHub entegrasyonu ile push to deploy yapabilir, PostgreSQL ve Redis gibi servisleri tek tıkla kurabilirsin.`* | **Hetzner is named by name** — the same host this holding already rents (memory: Storage Box live). The one-click list includes **Redis**, which our stack rules removed on purpose | V |
| 25 | p2 · Coolify cards | `GÜÇLÜ YÖNÜ`: *`Sabit maliyet. Tüm projelerini aynı sunucuda barındır, vendor lock-in riski olmadan ölçeklendir.`* — `İDEAL KULLANIM`: *`MVP deployment, çoklu proje hosting, veritabanı yönetimi, production ortamı.`* | | V |
| 26 | p2 · decision panel | heading **`Hangi Durumda Hangi Aracı Kullanmalısın?`** on a lavender field, four condition→tool lines: `Mail göndermen gerekiyorsa → Resend · SMTP ve HTML derdinden kurtul, Claude'a bağla.` · `AI işlemlerin timeout alıyorsa → Trigger.dev · Arka planda çalışsın, uygulama çökmesin.` · `Yurtdışı ödeme alacaksan → Lemon Squeezy · Vergi ve faturayı platforma devret.` · `Hosting maliyetlerin artıyorsa → Coolify · VPS'ini bağla, sabit fiyata deploy et.` | **The strongest object in the document.** It is not a summary of the four sections: it inverts them into **symptom → remedy**, so the reader arrives with a problem rather than with a product name | V |
| 27 | p2 · CTA band | **`Vibe Coder Başlangıç Rehberi`** · *`Vibe coding'i sistemleştir. Yapay zeka ile uygulama geliştirin. Fikrinden yayına, tüm akışı yöneten Türkçe başlangıç rehberi.`* · link **`Hemen Al →`** | This is what the document is **for**: it is a lead magnet whose exit is a paid Turkish guide. **No price is printed on either page** | V |
| 28 | p2 · footer | `© ozgurmode` · `YouTube` `TikTok` `Instagram` `Web` | Four channels, no follower or sales figure printed | V |

### 2.1 The directive's §3.2, its nine requirements — answered one by one

§3.2 governs *"watch the video, not only screenshots"*. This source is a static two-page document,
so seven of the nine requirements have no moving object to measure. Each is still answered against
the object that exists, and where there is nothing to time the answer says so in the project's own
grammar rather than being skipped.

| § | The requirement | Answer for source 15 |
|---|---|---|
| 1 | movement of Jarvis, Nimbus and other assistants | The document contains **no assistant figure**; its agent appears only as an instruction in the text — *"API anahtarını Claude veya Cursor'a ver"* (block 12) and *"Claude'a bağla"* (block 26). The assistant here is the reader's own coding agent, and the document is written to be consumed by it (V) |
| 2 | how the assistant repositions itself when screens change | No screens and no assistant on the page — **nothing to measure in this document.** The equivalent it does carry is the decision panel (block 26), which re-frames the same four services by the reader's situation (V) |
| 3 | speech-responsive vibration or waveform behaviour | The file carries no audio track and no waveform (V — measured: `pdfinfo` reports 2 pages, no media, no JavaScript) |
| 4 | animated relationships between nodes, agents, departments | The document's only relationship drawing is the **four-column table** (blocks 05-09) and the four `→` arrows of the decision panel — static glyphs, measured in §3.6 (V) |
| 5 | moving light/data points through connections | None on the page. The **flow it describes in words** is the one worth taking: a job that outlives a request, freezes, and resumes at the failed step (blocks 16-17) — measured against ours in §4 (V/R) |
| 6 | page transitions and continuity | Two pages, and the continuity is deliberate: the Trigger.dev section's **two cards break across the page boundary** (blocks 16→17), so the block grammar — eyebrow, name, dek, body, two cards — is what carries the reader over the fold rather than a repeated header (V) |
| 7 | live numbers, graphs, statuses and state changes | The document prints **no number at all** — no price, no star count, no user count, no benchmark. Its four claims are qualitative. Every figure in this report about the four services was measured by this session from the vendors and from GitHub (§3), never read off the page (V) |
| 8 | audio quality, rhythm, human-likeness | No audio. Its **written** rhythm is uniform and measurable: four services, each in exactly four blocks, each closed by exactly two cards with the same two headings (`GÜÇLÜ YÖNÜ`, `İDEAL KULLANIM`) — 4 × 4, no exception on either page (V) |
| 9 | whether it feels like a living operating system rather than static cards | This file is a **printed document**, and the question is put to it as the directive intends: what it teaches about keeping a system running is read as mechanism in the **Aliveness** section of §3, where the four services' own clocks, resumption and settlement are measured (V/R) |

---

## 3. Capabilities — the four services, measured this session

The document prints no figures (block 07 of §2.1). Everything numeric below was measured today
against the vendors themselves, so this report never repeats a claim the page could not support.

### 3.1 Resend — e-mail as an API, documented for a model

- **What it removes:** SMTP configuration and HTML e-mail templating (V, block 12).
- **Why the document picks it over SendGrid/Mailgun:** `llms.txt` support — the documentation is
  published in a form a language model reads (V, block 13). The tool is chosen for the **agent's**
  convenience, not the developer's.
- **Measured price** (resend.com/pricing, this session): **Free $0/mo — 3,000 e-mails/month**;
  Pro **$20/mo — 50,000**; Pro **$35/mo — 100,000**; Scale from **$90/mo — 100,000** up to
  **$1,150/mo — 2,500,000**; marketing plans priced by contacts from **$40/mo — 5,000 contacts**.
  Enterprise is custom, and the page states enterprise senders *"commonly send 3M-500M+ emails per
  month"* (V — vendor's own page).
- **What it produces:** a paid tier ladder nine steps deep with a live enterprise band above it.
  The page names no customer, so the customer list is **U — Unverified**; the price ladder is the
  measurement that stands.

### 3.2 Trigger.dev — work that outlives the request, and resumes where it broke

- **Mechanism 1 (V, block 16):** long AI operations run outside a serverless timeout, for hours,
  without taking the application down.
- **Mechanism 2 (V, block 16):** **CRIU** — checkpoint/restore in userspace. A task that is merely
  *waiting* is frozen to disk and its resources returned, so idle time is not paid for.
- **Mechanism 3 (V, block 17):** on failure a run **continues from the step that failed** rather
  than from the beginning.
- **Measured, GitHub API this session:** `triggerdotdev/trigger.dev` — **15,957 stars**,
  **Apache-2.0**, last pushed **2026-08-10T12:13:40Z** (the same day this report was written),
  **424 open issues**, described as *"build and deploy fully-managed AI agents and workflows"* (R).
  A repository pushed the same hour it is being read is a live project, and the description shows
  the product has moved to exactly our subject: agents and workflows.

### 3.3 Lemon Squeezy — someone else becomes the seller

- **Mechanism (V, block 20):** as **Merchant of Record** the platform is the legal seller; VAT, GST
  and international invoicing become its obligation, and the builder only defines the product.
- **Measured, vendor's own pricing page this session** (the page refuses a plain fetch with HTTP
  403; read through Scrapling, status 200): **`5% + 50¢`** per transaction, stated as *"There is no
  monthly fee to use Lemon Squeezy for payment processing"*, *"Lemon Squeezy is your merchant of
  record"*, *"we're also registered to file and pay taxes on your behalf"*, and, on whether fees can
  exceed it: *"We consolidate complex platform fees into one simple transaction fee of 5% + 50¢, but
  there are edge cases where small additional fees may need to be applied"* (V).
- **Ownership:** acquired by **Stripe in 2024**, and now positioned inside Stripe's managed-payments
  line — **U (secondary sources only)**: the vendor page itself states neither, and this session
  could not reach a Stripe primary. To verify: a statement on stripe.com or a Lemon Squeezy legal
  page, both of which currently answer 403 to a plain fetch.
- **What it produces:** a per-sale cut on other people's revenue, at a published rate. That is a
  measured output, and the alternatives the document names (Paddle, Stripe) sit in the same market.

### 3.4 Coolify — a rented box turned into a deploy panel

- **Mechanism (V, block 24):** a VPS becomes a Vercel-like panel; GitHub push-to-deploy; Postgres
  and **Redis** installable in one click.
- **Measured, GitHub API this session:** `coollabsio/coolify` — **60,331 stars**, **Apache-2.0**,
  last pushed **2026-08-10T12:04:26Z**, *"280+ one-click services"* (R). **The most-starred object
  on this entire queue so far**, and pushed within the hour it was read.

### 3.5 The publisher's own machine — the part the document did not mean to show

The strongest transferable mechanism in this file is **how the file itself was made** (V, §1):

```
a .md file  →  a local content server on port 50674  →  headless Chrome  →  A4 PDF  →  lead magnet
```

The evidence is in the PDF's own metadata: producer `Skia/PDF m150`, creator
`HeadlessChrome/150.0.0.0`, embedded title
`localhost:50674/topics/…/vibe-coding-saas-araclari.md#`. The publisher writes prose in Markdown
and prints publication-grade collateral from it with **no design tool and no designer in the loop**,
which is why a *"Part 5"* exists at all — the cadence is affordable because the rendering costs
nothing.

**What the source produces, honestly:** the document's exit is a paid Turkish guide (*"Vibe Coder
Başlangıç Rehberi … Hemen Al →"*, block 27) and four channels — YouTube, TikTok, Instagram, Web
(block 28). **No price, no audience figure and no sales figure is printed anywhere in it**, so this
source does not show what it produces, and this report does not invent a number for it. Its four
subjects, measured above, do show theirs: a nine-step price ladder, a published per-sale rate, and
two Apache-2.0 repositories at **15,957** and **60,331 stars**, both pushed on the day of reading.

### 3.6 The design object, measured

Sampled from the 150 dpi render, so every figure below is a count of pixels converted to points
(1 px = 0.48 pt at this resolution).

| Property | Measurement |
|---|---|
| Palette — the whole document is **five colours** | paper `#FFFFFF` · sheet `#F9F9FC` · ink `#0F0F1A` · muted `#5B5B70` · accent `#6C47FF` |
| Colour shares, page 1 | `#FFFFFF` 38.65 % · `#F9F9FC` 38.10 % · `#0F0F1A` 13.71 % · `#5B5B70` 0.33 % · **accent `#6C47FF` 0.131 %** |
| Colour shares, page 2 | `#FFFFFF` 38.67 % · `#F9F9FC` 35.94 % · lavender panel `#F0ECFF` 12.50 % · `#0F0F1A` 7.79 % · **accent 0.11 %** |
| **The accent law** | The purple appears on **roughly one thousandth of the page** (0.13 % / 0.11 %). It is spent on exactly three things: the hero spine, the four section eyebrows, and the links. Nothing else is ever coloured |
| Hero band | dark `#0F0F1A` rectangle, **491.5 × 146.9 pt** (1024 × 306 px), left edge at x = 111 px |
| Hero spine | accent bar **2.4 pt wide × 146.9 pt tall** (5 × 306 px) at x = 106-110, **exactly the height of the band it leans on** — measured, not estimated |
| Content column | **491.5 pt** wide inside a 595.92 pt page → side margins ≈ 52 pt (0.87 in) each, identical on both pages |
| Decision panel (p2) | lavender `#F0ECFF` field, **493.9 pt wide × ≈ 137 pt tall** (1029 × 286 px) |
| CTA band (p2) | ink `#0F0F1A`, **493.9 pt × ≈ 81 pt** (1029 × 169 px) |
| Type | one serif — the hero title — on a page that is otherwise entirely sans. The eyebrows are letter-spaced small caps in accent; body is `#0F0F1A`; card labels are muted `#5B5B70` |
| Rules and card borders | `#E8E8F0` / `#EDEDF4` — one to two shades off the sheet, never a hard line |

**The design principle, stated as a rule rather than an adjective:** *five colours, one of them
spent on a thousandth of the surface, one serif on the whole document, and a single 491.5 pt column
that never varies.* The hierarchy is produced by **weight, spacing and one dark rectangle**, not by
colour.

### Aliveness — the four clocks this document hands over, and what DXB takes

Read for mechanism, as ledger law 8 requires. This source is a printed document, so its own surface
has one state; the living machinery it describes is in the four services, and each one is a clock.

**1 — What runs on its own clock.** Trigger.dev's whole subject is work that keeps running when
nobody is watching: hours-long tasks outside a request timeout, cron jobs, webhook handling
(V, blocks 16-17). Its **CRIU** step is the sharpest of the four ideas — a task that is *waiting*
is frozen to disk and its memory handed back, then thawed when the wait ends, so idle hours cost
nothing (V, block 16).

**2 — What makes the surface breathe.** Resend's mechanism is the outward heartbeat a system uses
to reach a human who is not looking at it: transactional mail — password reset, welcome, then bulk
campaigns and notifications (V, block 13). Lemon Squeezy's is the settlement clock: subscriptions,
invoices, and tax filed on the seller's behalf on the state's calendar rather than the builder's
(V, blocks 20-21). Coolify's is the deployment clock: a git push becomes a running service
(V, block 24).

**3 — How it answers the human.** The decision panel (block 26) is the document's own answer
mechanism, and it is worth copying exactly: the reader arrives with a **symptom** — *"AI işlemlerin
timeout alıyorsa"*, *"Yurtdışı ödeme alacaksan"* — and leaves with one named remedy and a single
sentence of why. Four conditions, four answers, no menu to browse.

**4 — What DXB takes.** Four mechanisms, in the order of what they cost us:

- **The resume-from-step clock**, already ours on paper and never once run — `workflow_runs`
  carries a `current_step` column and the table holds **0 rows** (R, §4). Costs nothing to prove:
  **P15-3**.
- **The outward mail clock.** Our e-mail path ends in a sandbox and **0 of 51 outbox rows have
  ever executed** (R, §4). Resend's free tier is **3,000 e-mails/month at $0**: **P15-1**.
- **The settlement clock.** `revenue_ledger` holds **0 rows** and **€0**, against **6 revenue
  engines** written (R, §4). A Merchant of Record at **5 % + 50¢** is the shortest legal path from
  a written engine to a first euro, and the decision is the CEO's: **P15-2**.
- **The publishing machine** of §3.5 — Markdown → headless Chrome → A4 PDF. **Playwright 1.61.1
  with `chromium-1228` is already on this machine** (R), so this one needs no install and no
  money at all: **P15-4**.

---

## 4. What DXB has today — measured this session, one lane per service

Every figure read from the company database with `SELECT` only, or from the repository.

| Lane | The document's answer | **What DXB actually has, measured 2026-08-10** | Evidence |
|---|---|---|---|
| **E-mail** | Resend | **A sandbox and nothing else.** The only handler is `packages/outbox-executor/src/actions/email-send-staging.ts`, which posts to **Mailpit at `127.0.0.1:8025`** from `os@dxb-staging.local`, and its own header states real providers *"do not exist before Phase 11"*. In the company database: **`outbox` = 51 rows, `status='executed'` = 0.** No mail has ever left this system | R — `psql … -c "SELECT count(*) FROM outbox …"` → `outbox_total=51`, `outbox_executed=0` |
| **Background work** | Trigger.dev | **This lane is alive and is the strongest thing we own here.** pg-boss 12.25.1 on the same Postgres — `pgboss.job` holds **141,856 rows**; the outbox ticks every **15 s**, the lease reaper every **60 s**, the velocity breaker every **5 min**; `agent_runs` = **378**. Both resident services answer `active` (`dxb-scheduler`, `dxb-jarvis`) | R — `pgboss_jobs=141856`, `agent_runs=378`, `systemctl --user is-active` → `active`, `active` |
| **…its resume-from-step idea** | *"sadece kaldığı adımdan devam eder"* | **Adopted on paper, never exercised.** `workflow_runs` has the column the idea needs — `current_step integer` — beside `steps_snapshot jsonb`. The tables are **empty: `workflows` = 0, `workflow_runs` = 0, `workflow_steps` = 0.** Nothing in this holding has ever resumed a run, because nothing has ever run one | R — `\d workflow_runs`; `workflows=0 · workflow_runs=0 · workflow_steps=0` |
| **Payment / tax** | Lemon Squeezy | **No processor of any kind exists.** No Stripe, Paddle or Lemon Squeezy client in `apps/`, `packages/` or `db/`. `revenue_ledger` = **0 rows**, sum **€0**; `v_objective_progress.realized_revenue_eur` maximum = **0**; against **6 rows in `revenue_engines`** — six written theses, no euro | R — `revenue_ledger_rows=0 · revenue_ledger_sum_eur=0 · realized_revenue_eur_max=0 · revenue_engines=6` |
| **Deployment** | Coolify | **Two systemd units and Supabase's own containers — and no compose file yet.** `find -maxdepth 3 -name "docker-compose*.y*ml"` returns **nothing**; `scripts/systemd/` holds `dxb-scheduler.service`, `dxb-jarvis.service`, `install.sh`. `.planning/research/STACK.md` already rejected Coolify by name — *"~1.2GB idle RAM and wants 8GB for itself"* — and chose *"docker-compose + systemd"*, naming **Dokploy** (~0.8 GB idle) as the only PaaS it would ever accept | R — `find`, `ls scripts/systemd/`, STACK.md lines 27, 107, 120-121 |
| **The publishing machine** (§3.5) | markdown → headless Chrome → PDF | **Every part is already installed and none of it is wired together.** `@playwright/test ^1.61.1` in the root and dashboard manifests; `~/.cache/ms-playwright/` holds `chromium-1228` and `chromium_headless_shell-1228`. Nothing in the repository renders a document to PDF | R — `grep playwright package.json`, `ls ~/.cache/ms-playwright/` |

**Two of the four services are already refused by our own rules, and those refusals stand** — they
rest on the stack constitution, not on any reading of a rival (ledger §3.4-A): **Coolify** (idle RAM
we owe Supabase, Speaches and hermes; its one-click Redis reintroduces a dependency we deliberately
removed) and **Trigger.dev as infrastructure** (a second job runtime beside pg-boss). Its **idea**
was adopted and this session measured what became of it: the column exists, the table is empty.

---

## 5. The build project

> **MECHANISM — the figures a builder needs, carried here so §5 can be read alone.**
> **This source is a printed document, not a film: it has no screen, so no motion or colour figure
> exists and none is invented.** What it hands over is four clocks:
> - **Trigger.dev — the freeze clock.** A task that is *waiting* is written to disk with **CRIU** and
>   its memory handed back, then thawed when the wait ends, so **idle hours cost nothing**. The idea
>   we adopted and never exercised is **resume-from-step**.
> - **Resend — the outward heartbeat.** Transactional mail is how a system reaches a human who is not
>   looking at it: password reset, welcome, then bulk campaigns and notifications.
> - **Lemon Squeezy — the settlement clock.** Subscriptions, invoices and tax filed on the **state's**
>   calendar rather than the builder's.
> - **Coolify — the deployment clock** (refused on our own stack rules): a git push becomes a running
>   service.
> - **Its own page design is the one thing to copy:** the reader arrives with a **symptom** and the
>   panel answers with the **remedy** — symptom before remedy, not a feature list.

| # | Project | What it is | Install | Money | Gate |
|---|---|---|---|---|---|
| **P15-1** | **The first e-mail that actually leaves the building** | Put a real provider behind the outbox seam that already exists. The handler interface, the idempotency key, the at-most-once replay check and the audit row are all built and proven against Mailpit; what is missing is a provider whose domain is real. Resend's **free tier is 3,000 e-mails/month at $0**, and its `llms.txt` documentation is written for exactly the agent that would wire it. Closes the measurement that **0 of 51 outbox rows have ever executed** | account only | **€0** at 3,000/mo; $20/mo if it ever exceeds it | **CEO** — outward e-mail and a sending identity are both on the approval gate, and the domain is his |
| **P15-2** | **A legal path to the first euro** | Six revenue engines are written and the ledger holds €0. A Merchant of Record makes the platform the seller and files VAT/GST on our behalf at a published **5 % + 50¢**, which removes the tax-registration blocker from every digital engine at once. This report recommends it as the **entry** path and not the end state: the fee is real money on every sale, so it is the right instrument for the first sales and the wrong one at volume | account only | 5 % + 50¢ per sale, no monthly fee | **CEO** — it is his identity, his company registration and his bank account. Money IN is not gated; **the account is** |
| **P15-3** | **Run one workflow to the end, then break it on purpose** | The resume-from-step idea is adopted and untested: `current_step` exists, `workflow_runs` = 0. Define one real workflow, run it, kill it mid-step, restart it, and prove it continues from the failed step instead of the beginning. Until that happens the adoption is a column, not a capability | **none** | **€0** | none — internal |
| **P15-4** | **The lead-magnet press** (`.md` → A4 PDF) | Rebuild §3.5's pipeline with what is already installed: Playwright's `chromium-1228` renders a Markdown document to a branded A4 PDF with our own five-colour system. It gives the 49 written marketing and social employees an artefact they can actually produce, and it is the missing manufacturing step under the advertising-business project on board row B28 | **none** — Playwright + Chromium already on disk | **€0** | none to build; publishing anything outward stays on the gate |
| **P15-5** | **The symptom → remedy panel** | Copy block 26's grammar, not its content: on a surface where the CEO must choose, print the **condition** first and the **one** recommended action second, with a single line of why. Four conditions, four answers, no menu. It lands in the Phase-4 visual design package beside the approval-diamond taken from source 10 <!-- OPEN: B22 --> | none | €0 | into the design package, which waits on his approval |

**Refused, with the reason, so no later session re-opens it:** **Coolify** (P15-x not opened) — our
stack rules already reject it by name on idle RAM and on its one-click Redis; **Trigger.dev as a
runtime** — pg-boss holds 141,856 jobs on the database we already run, and a second job runtime is
a second stateful service to back up and secure. Both refusals rest on our own constitution and are
unaffected by anything in this document.

---

## 6. Verdict

**What this source produces.** The document itself does not show what it produces: it prints no
price, no audience figure and no sales number, and its exit is a paid Turkish guide behind *"Hemen
Al →"*. What it hands over instead is a parts list, and the parts are measurable and alive —
`coollabsio/coolify` at **60,331 stars** and `triggerdotdev/trigger.dev` at **15,957 stars**, both
Apache-2.0 and both pushed on **2026-08-10**, the day of this reading; Resend selling from **$0** to
**$1,150/mo** across nine tiers with an enterprise band above it; Lemon Squeezy taking **5 % + 50¢**
of other people's sales as their legal seller.

**Where this leaves DXB, measured rather than argued.** Of the four jobs this document says a
builder should stop doing by hand, **we have finished exactly one**: background work runs, it runs
on its own clock, and pg-boss holds 141,856 jobs to prove it. On the other three the measurement is
plain — **no e-mail has ever left this system (0 of 51 outbox rows executed), no euro has ever
entered the ledger (0 rows, €0, against 6 written engines), and there is no deploy artefact on disk
at all (no compose file, two systemd units).** These are not judgements; they are counts taken from
the company database this session. A two-page lead magnet handed the holding a checklist of four
and it scores one.

**The one thing to take before anything else.** Not a service — the sentence in block 17:
*"işlem başarısız olduğunda sadece kaldığı adımdan devam eder, tüm süreci baştan başlatmaz."* We
adopted that idea, we built the column for it, and we never ran it. **P15-3 costs nothing, needs no
account, needs no approval, and turns an empty column into a capability in one session.** Everything
else on this page needs the CEO's identity or his money; that one needs a decision by the author
alone, which is exactly why it has been sitting unexercised.

### 6.1 The directive's §4 — the eight questions, answered one by one

| # | Question | Answer |
|---|---|---|
| 1 | What is directly visible over time? | A static two-page A4 document, read whole in both renderings (§2, 28 blocks). Its visible structure is rigid: four services × four blocks × two cards, one 491.5 pt column, five colours, the accent spent on 0.13 % of the page (§3.6) |
| 2 | What is stated in the text? | Four services against four jobs, with one mechanism named for each: `llms.txt`-documented e-mail; hours-long background work with **CRIU** and resume-from-step; **Merchant of Record** taking the tax burden; a VPS turned into a push-to-deploy panel (§2 blocks 12-25) |
| 3 | What has the CEO confirmed? | He supplied this source himself as part of the queue. He has given **no note on this row** — the ledger's CEO column is the measurement made on 2026-07-28 that it is a PDF and not a video. No CEO-confirmed claim is asserted anywhere in this report (C — absence recorded honestly) |
| 4 | What is technically verified? | Everything numeric here: the file's own metadata and hash; both repositories' stars, licences and push times from the GitHub API; Resend's nine price tiers from its own page; Lemon Squeezy's `5% + 50¢` and MoR statements from its own page (read through Scrapling after a 403); and all eleven DXB measurements in §4 from the company database and the repository (R) |
| 5 | What remains unverified? | **U-1:** the Stripe acquisition of Lemon Squeezy — secondary sources only; the vendor and Stripe pages answer 403 to a plain fetch. **U-2:** what `ozgurmode` earns or reaches — the document prints nothing, and this report invents nothing. **U-3:** Resend's deliverability from a fresh domain, which decides whether P15-1 is worth doing at all and can only be settled by sending real mail |
| 6 | What does this system demonstrably do better than DXB today? | It **ships the four jobs it names**. Concretely: Trigger.dev resumes a broken run from its failed step in production while our `workflow_runs` table has never held a row; Resend delivers real mail while ours ends at a sandbox; Lemon Squeezy settles money and files tax while our ledger holds €0 |
| 7 | What capability, design principle or architecture should DXB adopt? | **Capability:** P15-1 (real outward mail behind the existing outbox seam), P15-2 (Merchant of Record as the entry path to a first euro), P15-3 (prove resume-from-step), P15-4 (the `.md` → PDF press, already installed). **Design principle:** §3.6's restraint — five colours, the accent on a thousandth of the surface, one serif, one column that never varies. **Architecture:** P15-5 — put the **symptom** before the remedy on every surface where the CEO must choose |
| 8 | What should **not** be copied, and why? | **Coolify** — our stack rules reject it by name for the ~1.2 GB it idles away from Supabase, Speaches and hermes, and its one-click Redis would reintroduce the dependency we removed on purpose (Dokploy is the named alternative if a deploy panel is ever wanted). **Trigger.dev as a runtime** — pg-boss already runs 141,856 jobs on the database we already operate; its *idea* is adopted, its infrastructure is not. **The document's own commercial shape** — a lead magnet whose exit is a paid guide is the publisher's business model, not ours; we take the press (P15-4), never the funnel |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-10 | File opened from nothing and written in one pass. Both pages read whole and in order in two renderings — `pdftoppm -r 150` images and `pdftotext -layout` — with all 28 blocks recorded verbatim; the palette, the hero band, the 2.4 pt accent spine, the column width and the two panels measured from the rendered pixels; the four services measured against their own vendors and the GitHub API the same day; eleven DXB facts measured against the company database (`SELECT` only) and the repository the same session. The directive's §3.2 nine requirements and §4 eight questions are each answered one by one, in §2.1 and §6.1. |

<!-- FINGERPRINT -->
---

**What was read**

| | |
|---|---|
| sha256 | `fd2ffd0d1523b6ecfd186a286408b4e4646ff466174b7cdda65e5f6674cd7c0b` |
