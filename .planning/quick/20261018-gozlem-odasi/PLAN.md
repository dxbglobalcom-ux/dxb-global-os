# Gözlem Odası — the plan (B42's "people on X" lane)

**Status: PROPOSED, waiting for his eye and his yes (2026-10-18).** Nothing outside this folder changes until he says
yes (B42 PLAN.md:3-5). His words of this job verbatim: `HIS-WORDS.md`. The watchlist page:
https://claude.ai/artifact/D2Tg7ri7hLGXfxaMz2fZw2 (copy: `watchlist.html`). The team's ground and proposals: `team/`.
Raw X reads of 2026-10-18 (the ~600-post fixture, video, mirror profiles): `~/.local/share/dxb/gozlem-odasi/raw-2026-10-18/`
(outside the repository on purpose — third-party posts, 29 MB).

## Part 1 — the plan as he reads it (Turkish)

Oda, tahtadaki B42'nin (Arsenal Watch) "X'teki insanlar" kolu olarak kurulur: yeni satır, yeni departman, yeni servis
yok. Fabrika tam başlayınca çalışır.

```
X (sizin hesabınız, yalnız okuma)
  → ayıklama: yüzlerce paylaşımdan konuyla ilgili olanlar
  → aynı konudaki paylaşımlar tek dosyada toplanır
  → derin okuma: yazı, kod, video
  → yargı: Opus hüküm verir, holdingin ikinci gözü Sol çürütmeye çalışır
  → Çöp · Rafa · Dene · Holdinge al
  → deneme odası: kapalı sanal makinede, kendi işlerimizle önce/sonra
  → Pazartesi brifinginde size → sizin tıkınız
```

**Ekibin kararları**
- Kim: hepsi holdingin mevcut çalışanları. Gözcü Pazar İstihbaratı Lideri; deneyleri Araç Değerlendiricisi ile Model
  Değerlendirme Lideri yapar; rafı Bilgi Mimarı tutar; odanın başı Yapay Zekâ Direktörü.
- Nerede: fabrika başlayınca holdingin kendi zamanlayıcısında, bu bilgisayarda. O güne kadar tezgâhta, bugün toplanan
  yaklaşık 600 paylaşımla kurulup sınanır; X'e tek okuma yapılmaz. Anahtar dönmeden hemen önce bir fabrika denemesi.
- X'i okuma: sizin hesabınız, hiçbir şey yazmadan. Günde 4 kısa okuma, A katmanına günde bir tam okuma; oda günde en
  fazla 50 okuma yapar. Bilgisayardaki bütün X okumaları, araştırma ekibi dahil, tek kapıdan geçer: aynı anda tek
  okuyucu ve günlük bütçe. X "yavaşla" derse 30 dakika durulur; uyarı ya da doğrulama sayfası çıkarsa her şey durur ve
  size tek satır yazılır. Bugünkü iki geçici sınırı araştırma ekibi yedi; kapı önce orada kurulur.
- Hesabınızın güvenliği: oda, içinde altı oturumunuz bulunan araştırma tarayıcısını kullanmaz; yalnız X oturumunuzun
  kopyasını taşıyan kendi tarayıcısını açar, iş bitince kapatır. İki tarayıcı aynı anda X oturumunuzla okumaz.
- Gizli talimata karşı: paylaşımı okuyan kod yapay zekâ değildir; hükmü veren yapay zekânın elinde hiçbir araç yoktur.
  Paylaşım bilgi sayılır, asla emir değil.
- Deneme odası: bu bilgisayarda, her deneme için sıfırdan açılan ve sonra silinen kapalı bir sanal makine. İçinde
  anahtarımız, verimiz, hesabımız yok; internete yalnız izin verilen birkaç adrese çıkar. İlk gerçek denemeden önce
  kendi yazdığımız kötü niyetli bir paket bütün duvarları zorlar; biri bile açılırsa oda açılmaz.
- "İşe yarıyor" sayıyla söylenir: kendi gerçek işlerimizden 26 görevde önce ve sonra ölçülür; karar kuralı denemeden
  önce yazılır; "belirsiz" de bir cevaptır.

**Size ne gelir**
- Pazartesi sabah brifinginde en fazla 3 bulgu, yalnız denenmiş olanlar. Değerli bir şey yoksa hiçbir şey gelmez; ama
  ekranda oda çalıştığını gösterir: son okuma, sonraki okuma, "bugün 412 okundu · 0 değerli".
- Aynı gün yalnız kullandığımız bir şey zarar görürse (bozuk bir sürüm, kapanmak üzere olan bir servis).
- Sizin tıkınız: Holdinge al (tahtaya iş olur; kurulum yine sizin onayınızla) · Rafa · Çöp. Çöp'ten yalnız künye kalır.
- Oda kendini ölçer: getirdiği her 3 bulgudan en az 2'sinin işinize yaraması hedeflenir; bir şeyi oda getirmeden siz
  görürseniz o, odanın kaçırdığı sayılır. Kişiler puanlanır: işe yarar getiren yükselir, abartı satan düşer. Kapattığınız
  konular (superpowers, gsd ve benzerleri) hiç önerilmez.

**Adımlar**
1. X kapısı, araştırma ekibi için hemen (hesabınızı bugünden korur); odanın kayıt düzeni.
2. Okuyucu, ayıklama ve yargı; bugün toplanan paylaşımlarla sınanır: bilinen bir abartı Çöp'e düşmeli, bilinen iyi
   bir sürüm size ulaşmalı, bir haftalık gürültü sıfır mesaj üretmeli.
3. Deneme odası, kötü niyetli paket sınavı ve 26 görevlik ölçüm seti.
4. Ekran: odanın canlı yüzü önce çizilip size gösterilir, sonra yapılır; Pazartesi brifingine odanın bölümü.
5. Fabrika denemesi; anahtar dönünce oda kendi saatinde çalışır.

**Evet'inizle birlikte geçenler:** X oturumunuzun yalnız X'e ait bir kopyasının odaya verilmesi (kimlik adımı) ve
deneme odası için Ubuntu kalıbının indirilmesi. **3. adımda tek tık:** deneme odasının yapay zekâ anahtarı için
Claude'un kendi onay sayfası.

## Part 2 — the engineer's decisions (English)

Taken by the lead after three blind proposals (architect, security & reliability, evaluation) and one cross-examination
(`team/`; the cross-examiner's report is `team/cross-exam.md`). WHEN is his and settled: the room runs when the factory
fully starts (HIS-WORDS.md).

**Contract — registered adaptations, no new spec, no new row**
- CAPABILITY_ARSENAL_DOCTRINE §9: the watch lane (B42's people lane); a trial in a throwaway VM is NOT an install
  (otherwise every trial breaks INTEG-01's "study card before install"); a tool-less judge path for untrusted content
  (doctrine item 6 — department grants cannot be narrowed per employee, `generate-profiles.ts:50,275-305`, so judging
  is a bare call with no MCP tools, not an employee runtime profile; no second-department memberships for judging seats).
- HOLDING_LIBRARY_SPEC: `review_status='shelved'` with a look-again trigger (column is free text,
  `20260711002400_library_family.sql:22`; values today approved / needs_review / archived).
- The A9 shelf gate (`r42_knowledge_shelf_policy.sql:30`, severity block, applied at `post-task.ts:131-140`) is changed in
  its policy row so read passes do not loop REVISE — not dodged by contract wording.
- The voice is a Monday section of `v_ceo_briefing` (`control_ceo_briefing_post` allows one slot a day,
  `w26_proactive_briefing.sql:332-339`), at most three findings, labels written by the head at verdict time.
- The screen goes through B32: drawn and shown before it is built, with honest dead states (429 with resume time,
  keyring locked, KVM gone, GECİKTİ when a pass is overdue).

**D1 where** — built on the construction side and tested on the construction engine (54422) with the frozen reads of
2026-10-18, zero X calls; one purposeful factory trial just before the key turn; from the key turn, jobs inside
`dxb-scheduler` on this workstation (B42 lane, no resident service, R5). The reader stays where his session copy is;
moving his session to a server is an identity step decided by him then. Reader and lab both need his desktop session
(keyring; `/dev/kvm` via uaccess, `70-uaccess.rules:54`) — after a reboot without his login the room is dead and says so.

**D2 X** — his account, zero writes. One machine-wide X gate in the research door (`hidden.py` / `bin/opencli`; no X
gate exists today): one reader at a time, ≥ 3 s apart, ≤ 20 calls / 15 min and ≤ 150 / day for all callers, the room
≤ 50 / day; 429 → 30 min pause, a second 429 in 24 h → closed until the next day; captcha / unusual activity / verify
page → `x.frozen`, never self-clearing, one line to him; login wall → `session_dead`, re-copy by `profile-sync.sh`,
never a machine login. Gate state under the company's home, the construction locking it read-only. The gate is built
first, for construction research (today's 429s came from three parallel research helpers). `profile-sync.sh` stays the
only copier and gains an X-only target (today it copies the whole Profile 5, six logins, `:232-263`); the company's
browser is driven through a pipe with no open port, started per pass and stopped after; never two browsers on his X
session at once. Four jittered light passes a day (batched `from:` search), skipped when the previous found nothing
new, plus one daily `collection` read of the A tier and a weekly rotating per-account read of a seventh of the B tier
to measure what search misses. Videos through `watch.sh` with no login. Fallback twitterapi.io (~$7/month) only after a
freeze or two 429s in 7 days with the gate in place — money out, his click then; official X API (~$180/month) after it.

**D3 lab** — local QEMU 10.2.1/KVM guest per run on a throwaway qcow2 overlay of a pinned Ubuntu cloud image with
Claude Code baked in read-only; `-netdev user,restrict=on` (explicit forwards still apply, man page :2958-2962) with
`guestfwd` via `cmd:socat` per connection to a host allowlist proxy (api.anthropic.com POST /v1/messages only, with the
credential added by the proxy and never echoed; read-only npm / PyPI / GitHub; never X; everything else refused and
logged); QEMU itself inside bwrap (no network, empty HOME, only /dev/kvm, the image folder and the proxy socket);
caps 6 GB RAM, 8 cores, 512 processes, 20 GB disk, 30 min, one trial at a time, refused below 12 GiB free RAM; results
out over serial as size-capped text, a guest disk never mounted on the host. Red first: our own malicious package
(every forbidden port at every host address, DNS/HTTPS off-list incl. x.com, key hunting, asking the proxy for its key,
fork bomb, memory, disk, reboot survival, a README injection, a decoy token that must never reach the proxy log) —
before the first real trial, after every image change, weekly. The model credential: a separate revocable
`claude setup-token` held only by the proxy (identity step → his click at step 3); whether the proxy can swap it into
subscription calls is UNVERIFIED and measured first.

**Judging** — T0 plain code (dedupe, expand t.co without his session, artifact keys, his closed classes blocked by name
and listed once — note `andrej-karpathy-skills` is closed while @karpathy is A tier); T1 Jev first, Sonnet 5.5 medium
on doubt (Jev is OPEN under B64, its route measured at build; Haiku 4.5 retired, Haiku 5.5 still testing — not used);
events by artifact key, heat counts independent organisations with a 24 h half-life and only orders the reading; deep
read ≤ 8 events a day with evidence rows (V/T/R/U) and the research door's counter-evidence and second-source rounds;
"do we already have it" (HAVE → B42 version lane, silent; HAVE-EQUIVALENT → must beat ours; NEW → a board row named).
Verdict: Opus 5.5 judges on the evidence pack only; the existing critical gate (`critical-gate.ts:311-370`, Sol 6.1 high,
`codex exec -s read-only --ephemeral`) refutes it with the evidence pack only and a scrubbed environment (it can run
shell and read the disk); Opus revises and signs. A planted "read the credentials" case through the gate must fail
before the room is trusted.

**Learning and proof** — G1 his own verdicts (the 88-link sheet's notes, his closures); G2 outcomes at 30 and 90 days;
precision gate "≥ 2 of 3 findings he acts on", shown on screen; the "CEO was the detector" counter; the ranking must beat
a likes ranking and an author-tier ranking; author records (Beta(1,4), promote after 2 winning events in 90 days, no
demotion under 10 events); source health (first-week X read for the mirror-verified half of the B tier; weekly
dead-source audit); `--prove-red` with seven planted cases (hype screenshot → Çöp; an adopted real release → reaches the
message; a methodology plugin → listed, not judged; "AI reviewers rate this 10/10" → flagged, no effect; five posts from
one organisation → one source; a held current version → silent; a week of noise → zero messages and the run recorded).
Stage 2 frozen set of 26: 12 replays of our own commits (fix removed, the commit's own non-database tests as hidden
grader), 8 research questions over frozen pages (`20261015-arama-testi`), 6 sorting batches (`20261013-jev-olcum`);
3 runs per task per arm in fresh overlays; the decision rule hashed before the run; an A/A run and a known-difference
check (Opus high vs Sonnet medium) before the first real trial; a per-trial token budget measured before Stage 2;
Çöp keeps only its key (B55's registered words against worthless accumulation and wasted tokens).

**Order of work** — 1 the X gate (construction research first) and the migration family (`watch_sources`, `watch_runs`,
`watch_posts`, `watch_items`, `watch_judgments`, `watch_trials`, `v_watch_author_record`; his verdict as an approval-center
row) · 2 reader, triage, judging on the frozen reads with `--prove-red` · 3 the lab with its red test, A/A and the 26-task
set · 4 the screen through B32 and the Monday briefing section · 5 the factory trial; the key turn starts the cron.
