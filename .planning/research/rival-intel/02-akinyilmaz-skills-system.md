# SOURCE 02 — Akın Yılmaz (`akinyilmaz.ai` / "Okyanusi"): voice-driven Codex + a skills atlas

> The CEO's note on this row: **"(BURADAKI SKILLERI VS TUM SISTEMI ISTIORZ)"** — he wants the
> skills and the whole system shown here.
>
> The honest headline, stated before the detail: **the skills are not in this video.** What is
> in the video is (a) a real, working voice-controlled agent that drives the computer, and
> (b) a *map* of where hundreds of thousands of skills already exist in public. The map is the
> valuable part, and it is fully readable in the frames. The files themselves sit behind a
> WhatsApp / Skool / PDF lead funnel.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reel/DbTuJhOo69k/ |
| Uploader | `akinyilmaz.ai` — "Okyanusi · Akın Yılmaz" (14,623 posts · 85.5k followers · 202 following, read off the profile in-frame) |
| Kind | Instagram reel, vertical, Turkish |
| File | `media/02-DbTuJhOo69k.mp4` (34,517,899 bytes) |
| **sha256** | `55b778b16a879059e36fe80b3e6f61910f5102fb4da87de67e3f593be940d37e` |
| Duration | 143.15 s — the longest reel in the set |
| Native resolution | 1080 × 1920 |
| Material studied | **148 frames** — 143 at 1 fps + 5 scene cuts — swept as 13 contact sheets, plus targeted reads of the spreadsheet screens |
| Transcript | `transcripts/02.json` — language detected `tr` |
| Hard caption throughout the opening | **"bu yapay zeka gerçek mi ?"** |

**A measurement defect of mine, recorded rather than hidden.** The first contact-sheet sweep
matched frames by a `t0` prefix, so frames `t100`–`t143` were silently dropped — 44 unread
frames, and they contained the entire skills section, which is the part the CEO asked for. It
was caught because one sheet rendered three-quarters black. The sweep now lives in
`scripts/rival-intel/sheets.sh`, sorts numerically, includes the `cut` frames, and prints the
count it swept so a silent omission cannot repeat.

**A limit on the transcript, stated plainly.** The local model is
`Systran/faster-whisper-small`, which mangles Turkish: it produced *"Moriafa"*, *"SunTrench"*,
*"akın Yemez"*, *"cevizleri kurmak"*. **The burned-in Turkish subtitles in the frames are the
authoritative text here, not the transcript**, and every quotation below is read off the
frames. This is also a finding in its own right: the same small model is what our own voice
line uses, and 4 of 9 of the CEO's calls today failed with `empty_transcript`.

---

## 2. Frame-by-frame record

| Time | On screen | Said / captioned | Frame |
|---|---|---|---|
| 0:00 | Creator to camera, a wall of monitors behind him. Hard caption **"bu yapay zeka gerçek mi ?"** | *"Şimdi göstereceğim şey yapay zekanın en son geldiği nokta"* | t001–t004 |
| 0:04 | same | *"O yüzden aşağı doğru kaydırmayı bırak · Videoyu beğen, arkadaşınla paylaş"* | t005–t007 |
| 0:08 | Cut to the desk. Multiple monitors; one shows a video call, one a terminal. Then a dark app: **"What should we build?"** with four choice cards, a `Choose project` control and a model chip bottom-right — the **Codex** launch screen. | *"Şimdi eskiden de artık o Jarvis'leri kurmak, diğer işlemleri yapmak… Codex öyle bir şey çıkardı ki artık…"* | t008–t012 |
| 0:16 | A full-screen dark conversation surface on a ViewSonic monitor. At the bottom centre, a **glowing white-violet orb** — the voice indicator. Above it, the conversation in Turkish bubbles. | *"Bu gördüğünüz ajan benim adıma bilgisayarda işlemleri yapıyor"* | t016–t021 |
| 0:28 | On-screen conversation, readable: *"…bilgisayarda sistem tarafından açıldı ve artık sistem ben konuştuğum her şeyi yapıyor. Merhaba nasılsın"* | he greets it out loud | t028–t030 |
| 0:31 | The agent's reply, on screen: **"Merhaba, iyiyim, teşekkür ederim. Harika bir entegrasyon kurmuşsun gibi duruyor. Ne üzerinde çalışıyorsun?"** — it returns the greeting **and asks him a question back** | — | t031–t036 |
| 0:37 | His command, on screen: **"Tamam benim için şu an bir tarayıcıda… kendi tarayıcında bir YouTube'da benim son videomu açar mısın"** | *"kendi tarayıcında bir…"* | t037–t042 |
| 0:42 | Reply: **"Tamam, hallediyorum."** then **"Düşünüyor"** (thinking), then the decisive line: **"⚙ Control in App Browser becerisi okunuyor"** — *the skill being loaded is named, live, in the transcript, in plain Turkish.* | *"YouTube'dan son videomu bulmak için tarayıcı erişimi üzerinden bakıyorum"* | t043–t050 |
| 0:47 | The browser is now driven by the agent; YouTube is open on `youtube.com/watch?v=…`, with the same voice orb still floating over the page. Video title visible: **"Haftalarca Kurduğum JARVIS'i ChatGPT 10 Dakikada Yaptı" — AKIN YILMAZ ✓, 142k subscribers.** | *"Hatta izlemek isteyen arkadaşlar varsa…"* | t051–t062 |
| 0:52 | He states two more things done by voice in the same session: **playing chess with it** (it moves the pieces), and **building a website** by speaking, then saying "scroll down" and watching the system scroll the page itself. | *"Ben konuşarak… artık olaylar çok farklı boyuta geldi"* | t052–t072 |
| 1:15 | A landing page flashes: *"Öğrenme … dönüşür"*, counters **1.000+** and **20+** | *"Burada gösterdim çünkü 10 dakikada kurulumunu"* | t073–t077 |
| 1:18 | Back to camera. **The pivot of the whole reel.** | **"Şimdi burada önemli bir nokta var — sizler için yetenek geliştirdim… burada yüzlerce yetenek ekledim. Bu yetenekleri eklediğinizde inanılmaz derecede başarılı sonuçlar verir. Yani sadece Codex'e 'bana bunu yap' dediğinizde yapmayacak."** | t078–t090 |
| 1:31 | His Instagram profile `akinyilmaz.ai` with the **Links** modal open: `WhatsApp'tan Hemen Yaz (wa.me/447454184363)` · `Bütün eğitimler Skool` · `Okyanusi Resmi Web Sitesi` · `Bütün Linkler (linktr.ee)` · **`Ücretsiz Yapay Zeka ile E-Ticaret Başlangıç Rehberi (PDF)`** · `Ücretsiz Randevu Al (calendly)` | *"bütün linkleri paylaştım… ücretsiz yapay zeka e-ticaret başlangıç…"* | t091–t101 |
| 1:42 | **The skills atlas — a Google Sheets workbook, multiple tabs.** Tab 1: **"Tüm AI Agent Ekosistemleri — Karşılaştırma Özeti"**, columns `Ekosistem · Geliştirici · Skill Sayısı (yaklaşık) · Olgunluk · Açıklama`. See the table below. | *"Bunun gibi yüzlerce dosya var içerisinde, kullanabileceğiniz bütün yetenekler, altında da farklı farklı kullanabileceğiniz sistemler"* | t102–t110 |
| 1:49 | Tab: **"GitHub'daki En İyi Claude & AI Agent Skill'leri — Kapsamlı Rehber"**, columns `Kaynak/Repo · Kategori · Açıklama`, with a long run of rows tagged **"Resmi Anthropic"** | *"Buraya gelin mesela burada farklı farklı bütün yetenekleri ben paylaştım"* | t111–t116 |
| 1:53 | Tab: **"Hermes Agent (Nous Research) — Skill ve Araç Rehberi"**, categories `Çekirdek` / `Araştırma`, every row carrying a GitHub link | *"Hangi ajanınız için kullanacaksınız, linklerini ve ne amaçla kullanacağınıza kadar da paylaştım"* | t117–t124 |
| 1:58 | Tab: **"OpenClaw (formerly Moltbot/Clawbot) — Skill Rehberi"**, and a scoring column set: **`Puan (/10) · Öncelik · Notlar`** with values `10 Kritik "En popüler"`, `9 Kritik "Resmi"`, `8 Yüksek`, `7 Orta` | — | t125–t130 |
| 2:01 | Back to camera | *"Bunlar ne biliyor musunuz? Sizin bütün gün boyunca yapay zekâ videoları için 'şunu yaz, bunu gönder'… Ben bütün internetteki var olan bütün GitHub depolarını bir depoya çektim. İstediğinizi indirin — artık 1000 tane reel izlemenize gerek yok."* | t131–t138 |
| 2:12 | **"Grafik Görünümü"** — a dark page holding a dense circular constellation of several thousand white dots with bright clusters. He runs his hand across it. | **"Ayrıca son olarak, bakın bu benim yaptığım bütün işlemlerin beyni… artık hiçbir şekilde unutmadan bütün işlemleri yaptığım şekilde hazırlıyor. Sistem burada artık hiçbir bilgi unutmuyor. Bu yeteneği de o dosya içerisinde indirdiğinize emin olun."** | t139–t143 |

### 2.1 The ecosystem table, read off the screen

`Tüm AI Agent Ekosistemleri — Karşılaştırma Özeti`:

| Ekosistem | Geliştirici | Skill sayısı (yaklaşık) | Olgunluk |
|---|---|---|---|
| Hermes Agent | Nous Research | **662+** (Skills Hub) | 🟢 Aktif |
| OpenClaw Community | OpenClaw Community | **5,400+** (ClawHub) | 🟢 Olgun / Yaygın |
| Claude Skills | Anthropic | **1000+** | 🟢 Aktif / Hub |
| Cursor | Anysphere | **30k+ rules** | 🟢 Çok Aktif |
| Codex CLI | OpenAI | **100+ skills** | 🟢 Aktif |
| Gemini CLI | Google | **200+ extensions** | 🟢 Aktif |
| GitHub Copilot | GitHub / Microsoft | yerleşik özellikler | 🟢 Çok Aktif |
| Windsurf | Codeium | topluluk rules | 🟢 Aktif |
| OpenCode | OpenCode | açık kaynak | 🟢 Aktif |
| Frameworks | çeşitli | 10+ büyük framework | 🟢 Çok Aktif |

The Hermes tab expands one of those rows: *"Hermes resmi skill hub'ı: **662 skill, 16 kategori,
4 registry**"*, and the main repo line reads *"Self-improving AI agent; Telegram / Discord /
Slack / WhatsApp / Signal / Email üzerinden çalışır — ~95k GitHub yıldızı"*.

**A conflict between two of the CEO's own sources, recorded rather than smoothed over.** This
sheet says OpenClaw has **5,400+** community skills. Source 16's README says **~13,700**. Both
are on disk; both are quoted here; neither is treated as settled. Whoever builds the import
path measures it at the source.

### 2.2 What the "Resmi Anthropic" skill rows actually are

Read from the GitHub tab, in his words: Word document creation/editing/analysis · PowerPoint
generation · PDF text extraction, form filling, merging and new-PDF creation · high-quality
React/HTML UI generation · **MCP server creation for integrating external APIs and services** ·
**a guide + `SKILL.md` template and best practices for writing your own skill** · a Playwright
toolkit for testing local web apps · React + Tailwind artifact building · PNG/PDF visual design ·
document/newsletter/FAQ writing · comprehensive test discipline (TDD, debugging, refactoring).

---

## 3. Capabilities

| ID | Capability | What the source demonstrates |
|---|---|---|
| **CAP-02-A** | **Voice-driven control of the whole computer** | He speaks; the agent opens a browser, finds his video, plays chess, builds a site, scrolls the page — no keyboard |
| **CAP-02-B** | **The agent greets back and asks a question** | *"Merhaba, iyiyim, teşekkür ederim. Harika bir entegrasyon kurmuşsun gibi duruyor. **Ne üzerinde çalışıyorsun?**"* — it does not wait passively |
| **CAP-02-C** | **The skill being used is named on screen, live** | **"Control in App Browser becerisi okunuyor"** — plain language, mid-answer |
| **CAP-02-D** | **Thinking state is shown, not hidden** | **"Düşünüyor"** appears between command and answer |
| **CAP-02-E** | **The voice surface is an orb over the work, not a separate page** | The orb floats over the conversation *and* over the driven browser |
| **CAP-02-F** | **Turkish end to end** | Every word on screen — commands, replies, skill names, status — is Turkish |
| **CAP-02-G** | **Skills as the difference between working and not** | *"Yani sadece Codex'e 'bana bunu yap' dediğinizde yapmayacak"* — the claim is explicitly that raw agents fail and skills are what make them succeed |
| **CAP-02-H** | **A skills atlas: ecosystems, counts, maturity, links, purpose** | The Google Sheets workbook, four tabs, one row per source with `Skill Sayısı`, `Olgunluk`, link, and intended agent |
| **CAP-02-I** | **Skills scored and prioritised** | `Puan (/10) · Öncelik · Notlar` — `10 Kritik "En popüler"`, `9 Kritik "Resmi"`, `8 Yüksek`, `7 Orta` |
| **CAP-02-J** | **A memory graph presented as "the brain of everything I do"** | The `Grafik Görünümü` constellation; *"the system now forgets no information"* |
| **CAP-02-K** | **Bulk acquisition of public skill repositories** | *"bütün internetteki var olan bütün GitHub depolarını bir depoya çektim"* |

---

## 4. What DXB has today

| ID | DXB status | Evidence taken today |
|---|---|---|
| **CAP-02-A** computer control by voice | **PARTIAL — and this is a boundary, not a gap** | Our wake daemon is live (`systemctl --user is-active dxb-jarvis` → `active` since 01:44:09 today) and the voice line reaches the orchestrator. But DXB voice **may request and never approve** — outward actions pass the approvals gate by law. Full unattended computer control is deliberately *not* our target. |
| **CAP-02-B** greets back, asks a question | **HAVE** | Fixed last night (r31: Hamza returns the salam). |
| **CAP-02-C** names the skill it is using | **NO** | Nothing measured surfaces "which skill/tool am I using right now" to the CEO in plain language. |
| **CAP-02-D** thinking state | **NO evidence found** | Not measured on the chat or voice surface. Given a **29–35 s** answer time today, a silent wait is the worst possible combination — this is the cheapest fix in the whole report. |
| **CAP-02-E** orb over the work | **NO** | Voice lives on its own route (`(command)/voice`); it does not float over whatever the CEO is looking at. |
| **CAP-02-F** Turkish end to end | **HAVE — and stricter** | Bilingual purity is gated: `scripts/i18n-purity-check.sh` plus a two-locale Playwright pass; DB text carries `title_tr` / `display_name_tr`. He has one language; we hold two, pure. |
| **CAP-02-G/H/I** skills atlas, scored | **PARTIAL** | `.planning/research/INTEGRATION-TRACKER.md` is exactly this idea and predates the video: 80 rows, 76 study cards, a five-state lifecycle `STUDY → INSTALL → ADOPT → EMBED → EXCLUDED`. What it lacks is his columns: **an ecosystem-level survey with skill counts, maturity and a 10-point priority score.** |
| **CAP-02-J** memory graph | **HAVE — and it is already doctrine** | The repo root is an Obsidian vault; `.planning/graphs/` plus the graph-first reading rule are binding on every author and subagent. His "Grafik Görünümü" is Obsidian's graph view. We arrived here first, for token economy rather than for a reel. |
| **CAP-02-K** bulk skill acquisition | **NO** | No import path from ClawHub / Hermes Skills Hub / agentskills.io exists. |

---

## 5. The build project

| # | Project | What is built | Owning spec (adaptation — no new spec) | Closes when |
|---|---|---|---|---|
| **P02-1** | **Hamza says what he is doing while he does it** (CAP-02-C, -D) | While an answer is being produced, the surface shows the state in the CEO's language — *"düşünüyorum"*, *"takvimi okuyorum"*, *"Finance'e sordum"* — and names the tool or skill in plain words, not a function name. Stream it; never leave a silent gap. | `CEO_COMMAND_CENTER_SPEC` + `VOICE_INTERACTION_SPEC` | A live call and a live chat turn both show a progress line before the answer; a forced slow answer still shows state within 1 s. |
| **P02-2** | **The ecosystem survey the tracker is missing** (CAP-02-H, -I) | Add to `INTEGRATION-TRACKER.md` an ecosystem tier above the tool rows: `ecosystem · owner · skill count · maturity · registry URL · which DXB agent would use it · score /10 · priority`. Fill it from measurement, not from his sheet — his own two sources already disagree (5,400 vs ~13,700). | `CAPABILITY_ARSENAL_DOCTRINE` (registered adaptation) | The tracker carries the ecosystem tier with a measured count and date per row. |
| **P02-3** | **An import path for public skills** (CAP-02-K) | One reader that can take an `agentskills.io`-shaped `SKILL.md` package and land it on `std.knowledge_shelf` with provenance (source, licence, commit, date) and a quarantine flag until reviewed. Licence and safety review are mandatory — a skill is executable text from a stranger. | `CAPABILITY_ARSENAL_DOCTRINE` | One real public skill is imported, quarantined, reviewed and used by a named agent, with the provenance row to show. |
| **P02-4** | **Fix the Turkish ear** (measured defect, same lane) | The transcript failure in this very report — `faster-whisper-small` mangling Turkish — is the same model behind today's 4 failed calls. Larger model on Friday's workstation is already the plan; **what does not wait** is the `empty_transcript` bug itself and the missing "I did not understand, say again" answer. | `VOICE_INTERACTION_SPEC` + the R3.2 remediation note | 20 consecutive Turkish calls with 0 `empty_transcript`, and a spoken recovery line when confidence is low. |
| **P02-5** | **Judge his claim honestly, once** (no code) | His central claim — *"a raw agent will not do it; skills are what make it work"* — is testable against our own runs. Measure a real DXB task with and without the relevant shelf entry and record the difference. If he is right, skills move up the build order; if not, we stop paying for them. | `CAPABILITY_ARSENAL_DOCTRINE` | One A/B on a real task, with both outputs and the measurement in the tracker row. |

**Not built:** his funnel. WhatsApp/Skool/PDF/Calendly is a customer-acquisition machine, and a
good one, but it is not a capability of the OS. Recorded here so it is not mistaken for one.

---

## 6. Verdict

**`daha iyisi` on the atlas and the memory graph (we already hold both, in stronger form) —
`geride` on three small things that make a system *feel* alive — `reddedildi` on the funnel.**

- **Behind, and it stings because it is cheap:** he shows *"Düşünüyor"* and *"Control in App
  Browser becerisi okunuyor"* while the machine works. DXB makes the CEO wait **29–35 seconds
  in silence**. Two lines of state would change the entire felt quality of the product, and
  they are not built.
- **Behind on one honest capability:** his agent drives a real browser on command. Ours can
  reach MCP tools but does not narrate or show it.
- **Ahead on the atlas:** his skills workbook is a better-presented version of a discipline we
  already run — `INTEGRATION-TRACKER.md`, 80 rows, five-state lifecycle, study cards. We take
  his columns (count, maturity, score, which agent, why) and keep our lifecycle.
- **Ahead on the memory graph:** his "brain that never forgets" is Obsidian's graph view. Our
  repo *is* an Obsidian vault with a graph-first reading rule binding on every author. Same
  idea, already law here.
- **Rejected:** the funnel, and the framing. He sells "hundreds of skills" and delivers a
  spreadsheet of other people's links behind a WhatsApp number. The spreadsheet is genuinely
  useful and it is now read and recorded — but the CEO should know exactly what was behind the
  promise, because that is what he asked me to find out.
