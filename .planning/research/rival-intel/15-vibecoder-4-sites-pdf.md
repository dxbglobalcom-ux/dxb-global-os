# SOURCE 15 — `ozgurmode`: "Her Vibe Coder'ın Bilmesi Gereken 4 Site — Part 5" (PDF)

> The CEO supplied this as a Google Drive link among the reels. Measured on 2026-07-28: **it is
> not a video.** It is a two-page Turkish PDF one-pager naming four SaaS infrastructure services.
>
> It is the only source in the sixteen that is a straight procurement document, and — usefully —
> **one of its four recommendations is already banned by DXB's own stack rules**, which makes it
> a good test of whether this programme reads sources critically or just copies them.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://drive.google.com/file/d/105ejHFZg-07mYEJwT4vZ5rxFClS-h9G4/view |
| Resolved | `drive.usercontent.google.com`, HTTP 200 |
| Author | **© ozgurmode** — footer links to YouTube · TikTok · Instagram · Web |
| Kind | PDF, **2 pages**, Turkish |
| File | `media/15-vibecoder-4-sites.pdf` (115,940 bytes) |
| **sha256** | `fd2ffd0d1523b6ecfd186a286408b4e4646ff466174b7cdda65e5f6674cd7c0b` |
| Title | *"Vibe Coding İçin **4 Temel SaaS Altyapı Aracı**"* |
| Subtitle | *"Sıfırdan altyapı kurmakla günlerini harcama. Bu dört servisi bağla, tüm enerjini sadece projeni geliştirmeye ayır."* |
| Read with | `pdftotext -layout` — the full text is extracted below, so nothing here is inferred from a thumbnail |

---

## 2. Page-by-page record

### 2.1 The summary table, verbatim

| SERVIS | KATEGORI | ALTERNATIF | LISANS |
|---|---|---|---|
| **Resend** | E-posta API | SendGrid, Mailgun | Freemium |
| **Trigger.dev** | Background Jobs | Inngest, BullMQ | Açık Kaynak |
| **Lemon Squeezy** | MoR / Ödeme | Paddle, Stripe | Freemium |
| **Coolify** | Self-Hosted PaaS | Vercel, Railway | Açık Kaynak |

Framing line: *"Modern yazılım geliştirmede altyapı genellikle en çok vakit kaybettiren
katmandır. E-posta, arka plan işlemleri, ödeme ve deployment gibi temel ihtiyaçlar için bu dört
araç sayesinde **saatler süren entegrasyonları dakikalara indirebilirsin**."*

### 2.2 The four entries, each read in full

| # | Service | What the page claims | `GÜÇLÜ YÖNÜ` (its stated strength) | `İDEAL KULLANIM` |
|---|---|---|---|---|
| 1 | **Resend** (`resend.com`) — *"Geliştirici odaklı modern e-posta API'si"* | Instead of wrestling with SMTP config and HTML templates, hand the API key to Claude or Cursor and the app's automatic mail is ready in seconds; React-based email components allow modern responsive mail | **"AI dostu dokümantasyon ve SDK'lar. `llms.txt` desteği ile LLM'ler için optimize edilmiş."** | transactional mail (password reset, welcome), bulk campaigns, notifications |
| 2 | **Trigger.dev** (`trigger.dev`) — *"Açık kaynak arka plan görev yöneticisi"* | Serverless platforms' short timeouts block long AI jobs; Trigger.dev runs them in the background for hours without crashing the app; **CRIU** lets it release resources while a job waits, for cost advantage | **"Hata toleransı — işlem başarısız olduğunda **sadece kaldığı adımdan devam eder**, tüm süreci baştan başlatmaz."** | OpenAI/Claude API calls, data pipelines, cron jobs, webhook processing |
| 3 | **Lemon Squeezy** (`lemonsqueezy.com`) — *"Kayıtlı Satıcı (MoR) ve küresel ödeme altyapısı"* | International tax, invoicing and subscription management are a serious legal burden; as **Merchant of Record** the platform takes that responsibility — you only define the product; VAT, GST and other global taxes are calculated and collected automatically | **"Yasal sorumluluğu platforma devretme. Küresel vergi ve fatura otomasyonu tek elden."** | SaaS subscriptions, digital product sales, licence-key distribution, affiliate programmes |
| 4 | **Coolify** (`coolify.io`) — *"Kendi sunucunda platform yönetimi (Self-Hosted PaaS)"* | Vercel-class platforms get expensive as project count grows; Coolify turns a rented VPS (**e.g. Hetzner**) into a Vercel-like panel, push-to-deploy via GitHub, one-click PostgreSQL and Redis | **"Sabit maliyet. Tüm projelerini aynı sunucuda barındır, vendor lock-in riski olmadan ölçeklendir."** | MVP deployment, multi-project hosting, database management, production |

### 2.3 The decision table, verbatim

| Durum | Araç |
|---|---|
| Mail göndermen gerekiyorsa | → **Resend** · SMTP ve HTML derdinden kurtul, Claude'a bağla |
| AI işlemlerin timeout alıyorsa | → **Trigger.dev** · Arka planda çalışsın, uygulama çökmesin |
| Yurtdışı ödeme alacaksan | → **Lemon Squeezy** · Vergi ve faturayı platforma devret |
| Hosting maliyetlerin artıyorsa | → **Coolify** · VPS'ini bağla, sabit fiyata deploy et |

Page 2 closes with a promotion for *"Vibe Coder Başlangıç Rehberi"* — a paid Turkish guide —
and the `ozgurmode` footer.

---

## 3. Capabilities

This source names services rather than demonstrating a system, so the IDs are the *ideas* worth
weighing, not features to copy.

| ID | Idea | Why it is worth weighing |
|---|---|---|
| **CAP-15-A** | **`llms.txt` — documentation written for the model, not the human** | An integration is only as fast as the docs an agent can read. This is a cheap standard we could both consume and publish. |
| **CAP-15-B** | **Resume from the failed step, not from the beginning** | Trigger.dev's stated strength, and the exact principle this C42 programme already implements at row level (claim → fetch → report, one commit per source). |
| **CAP-15-C** | **Merchant of Record: sell without owning the tax problem** | For a holding that intends to sell internationally, MoR moves VAT/GST liability off the company. |
| **CAP-15-D** | **Self-hosted PaaS for fixed-cost, multi-project hosting** | The one recommendation DXB has already ruled out — see §4. |
| **CAP-15-E** | **A one-page "which tool for which situation" table** | The presentation format itself: four rows, one decision each. |

---

## 4. What DXB has today

| ID | DXB status | Evidence |
|---|---|---|
| **CAP-15-A** `llms.txt` | **NO** | Not measured anywhere in the repo. Cheap to adopt when we integrate a third party, and cheap to *publish* if any DXB surface is ever consumed by another agent. |
| **CAP-15-B** resume-from-step | **HAVE at the programme level, PARTIAL in the runtime** | This very programme is built on it: `00-LEDGER.md` claims a row before work, one commit per source, `next.sh` resumes exactly where a dead session stopped — built today because two of the CEO's sessions died on 2026-07-27 with their work unfiled. In the **agent runtime**, however, nothing measured resumes a failed run from its failed step; source 08's `heartbeat_runs` shows what that looks like properly done (`retryOfRunId`, `scheduledRetryReason`, `sessionIdBefore/After`). |
| **CAP-15-C** Merchant of Record | **NO — and it is a real gap on the revenue side** | `public.objectives` and `revenue_ledger` exist and hold €0 realised. If the CEO opens any selling motion — the clipping engine of source 05, or the deferred Outleteuro store (U19) — international VAT is a live legal question that nothing in the stack answers today. |
| **CAP-15-D** Coolify | **EXCLUDED — by our own stack rules, before this source existed** | `.claude/CLAUDE.md`, hard rules: *"no Kubernetes/Coolify"*. DXB runs **Docker Compose on a Hetzner 8 GB VPS behind Caddy**, with self-hosted Supabase Postgres and **pg-boss on the same Postgres** — and separately *"no Redis/BullMQ"*, which Coolify's one-click Redis would invite back in. The PDF's Coolify entry even names Hetzner as the VPS: we already have that half, and deliberately not the panel. |
| **Trigger.dev vs our queue** | **EXCLUDED, with the reason stated** | `.planning/research/STACK.md` fixes **pg-boss 12.x on the same Postgres, no Redis**. Adding Trigger.dev means a second job runtime, a second failure surface and another line on a €50–150/month budget. Its *fault-tolerance idea* is worth taking; its infrastructure is not. |
| **Resend vs our outbox** | **STUDY** | `packages/outbox-executor` already exists and enforces an **allowlist**; every outward e-mail stops at the approvals gate. A sending provider is a question of transport, and any adoption must keep the gate in front of it. |
| **CAP-15-E** one-page decision table | **PARTIAL** | `INTEGRATION-TRACKER.md` (80 rows, five-state lifecycle) is a richer version of this and predates the source. What it lacks is his brevity — a "which tool when" line per row. |

---

## 5. The build project

| # | Project | What is built | Owning spec (adaptation — no new spec) | Closes when |
|---|---|---|---|---|
| **P15-1** | **Record all four as tracker rows, with verdicts** | `Resend` → **STUDY** (transport behind the existing outbox gate) · `Trigger.dev` → **EXCLUDED**, reason: pg-boss on the same Postgres, no second runtime · `Lemon Squeezy` → **STUDY**, gated on the CEO opening a selling motion · `Coolify` → **EXCLUDED**, reason: existing hard rule, Docker Compose + Caddy on Hetzner, and its one-click Redis conflicts with "no Redis". A rejection with a written reason is worth more than a silent omission. | `.planning/research/INTEGRATION-TRACKER.md` + `CAPABILITY_ARSENAL_DOCTRINE` | Four rows exist with verdicts, reasons and this report as their study card. |
| **P15-2** | **Resume-from-step in the agent runtime** (CAP-15-B) | Take the idea, not the vendor: a failed run records the step it died on and resumes there. Composes directly with **P08-5** (run liveness, retry lineage, `retryOfRunId` / `scheduledRetryReason` from source 08). | `ORCHESTRATOR` spec | A deliberately failed multi-step run resumes at its failed step, shown as command → output. |
| **P15-3** | **Answer the tax question before the first sale** (CAP-15-C) | Before any selling motion opens — clipping (source 05) or the deferred store (U19) — the CEO gets one page: which jurisdictions, who is the merchant of record, what MoR would cost and what it removes. **This is a CEO decision with legal consequences, not an engineering choice**, and it must be answered before revenue rather than after. | `REVENUE` spec + U-table boundary row | The CEO has the one-pager and a recorded decision, before `realized_revenue_eur` moves for the first time. |
| **P15-4** | **`llms.txt` where we integrate** (CAP-15-A) | When choosing between two equivalent third parties, prefer the one whose docs an agent can read; and if any DXB surface is ever consumed by an outside agent, publish one. Small, cheap, recorded so it is not forgotten. | `CAPABILITY_ARSENAL_DOCTRINE` | The doctrine carries the preference, and one integration cites it. |

---

## 6. Verdict

**`reddedildi` on half of it — `daha iyisi` on the half we already solved — and one genuine
finding the rest of the sixteen never touched.**

- **Rejected, with reasons, not with a shrug.** Coolify is already banned by our own stack rules
  and its one-click Redis would reintroduce a dependency we deliberately removed; we run Docker
  Compose on Hetzner behind Caddy, which is the same idea without the panel. Trigger.dev is a
  second job runtime for a company that decided on pg-boss over the same Postgres precisely to
  avoid a second runtime and a second bill. **Two of four recommendations are excluded — and
  that is a good outcome, because it means the stack decisions made months ago hold up against
  a fresh source.**
- **Already ahead on the idea that matters.** Trigger.dev's headline strength — *"resumes from
  the step it stopped at, not from the beginning"* — is the exact principle this programme was
  built on today, at the ledger level, because two of the CEO's sessions died with their work
  unfiled. We do not need the vendor; we should finish carrying the idea into the agent runtime.
- **One genuine gap nothing else in the sixteen surfaced: Merchant of Record.** Fifteen sources
  are about making a system *work*. This one is about being allowed to *sell*. If the CEO opens
  the clipping engine or the store, international VAT becomes a real legal obligation, and today
  the holding has no answer to it. That question belongs on the board now, not after the first
  euro.
- **And a note on the source itself, in fairness:** it is a competent, honest one-pager with a
  clean decision table. It ends in a paid guide — the same funnel shape as sources 02, 03 and 04
  — but unlike those, it delivers real content before the ask.
