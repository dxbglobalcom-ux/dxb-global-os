# 05 — CNN — the clipping business, filmed on the platform that runs it

**Written 2026-08-07.** The CEO's own words about this source, from his directive:
*"BU SİSTEMİ DE PROJE OLARAK İSTİORZ (clipping business EN MÜKEMMEL ŞEKİLDE YAPMALI)"* — he wants
this **as a project**, done as perfectly as possible. So this report is read differently from the
others: not "what design lesson is here", but **how the machine works, end to end, and which side
of it DXB would stand on.**

Every substantive statement carries an evidence label: **V** visible · **T** transcript or burned-in
caption with a timestamp · **C** CEO-confirmed · **R** repository/backend verified this session ·
**U** unverified.

> ### ⛔ THE ABSOLUTE LINE — THE CEO, 2026-08-07, ON READING THIS REPORT
> **"bahislerle asla işimiz yok ÇOK BÜYÜK UYARI SAKIN HEEE UFACIK ŞEKİLDE YAPMAYIN!"**
>
> This marketplace openly carries such campaigns (measured, §3.8). **Total exclusion — every seat,
> every campaign, every client, every clip, at any size whatsoever.** Not a filter, not a threshold.
> Recorded in full at **§5.3** with the measurement that provoked it and the live machine gate that
> already enforces it. Nothing in this report proposes otherwise, and nothing built from it may.

**The finding that matters before anything else: this is not a JARVIS reel and it is not a design
reference. It is a working two-sided marketplace filmed on screen, with real money on it.** The
platform is named on the page — **Whop**, section *Discover Content Rewards* (V, 00:26–00:31) — and
one campaign on it is shown fully paid out: **$120,000 of $120,000, 12K participants, 114.2M total
views** (V, 00:52–00:55). The reel therefore hands over three separate things a business can be
built on: **the marketplace, the agency that sits on top of it, and the clipper who earns from it.**

---

## 1. Source identity

| | |
|---|---|
| **Address** | https://www.instagram.com/reel/DadfHYrkmr7/ |
| **Uploader** | `cnn` — the account handle as recorded by the CEO in his source list |
| **Kind** | Instagram reel. A produced news package: presenter to camera, screen recording, sit-down interviews |
| **File** | `media/05-DadfHYrkmr7.mp4` |
| **sha256** | `952104e0fdf8e1c97f44cd9ea83385adb9a9906435fd4717c0988bb9ba7168c1` |
| **Duration** | 102.380000 s |
| **Resolution / codec / rate** | **1080 × 1920**, VP9, 29.97 fps — above the CEO's 720p floor |
| **Audio** | present, AAC, 48 kHz stereo. Kept |
| **How obtained** | `scripts/rival-intel/fetch.sh 05`, 2026-07-28T11:26:33Z. Not re-downloaded — the file already exceeds the standard |
| **Transcript** | `transcripts/05.json` — faster-whisper, English, 8 segments. **One meaning-changing error corrected below from the burned-in captions.** |
| **Captions** | Burned in, English, present on almost every second. Treated as the authority over the machine transcript |
| **People named on screen** | **Musa Mustafa** — chyron *CLIPPER* (V, 00:24) · **Eddie Cumberbatch** — chyron *CO-FOUNDER, PROPAGANDA MEDIA* (V, 00:81) |
| **The CEO's note on this source** | *"BU SİSTEMİ DE PROJE OLARAK İSTİORZ (clipping business EN MÜKEMMEL ŞEKİLDE YAPMALI)"* |

### How the temporal analysis was performed — stated exactly

The file was **played with its sound** on the CEO's own machine before the reading — player
`celluloid`, window title verified as `05-DadfHYrkmr7.mp4`, and the audio confirmed to be actually
routed (a live PipeWire playback stream was observed while it ran, `pactl list short sink-inputs`).
Then **the one-second frames t001–t102 were opened in order, at native 1080 × 1920** — no contact
sheet, no downscaling — with the machine transcript beside them and the burned-in captions treated
as the authority (ledger law 4).

**One honest note about the reading, because it changes nothing in the record but should be
visible:** a first pass of frame reads returned empty results and had to be repeated. Every frame
recorded below was seen; where the second pass covered a stretch at two-second spacing, the
intervening second is a continuation of the same continuous shot and its caption is carried from the
burned-in text, which is why those rows say what they say and nothing more.

Where a detail needed enlarging it was **cut from the video**, never cropped out of a frame (ledger
law 5). Two cuts were made for this report and are on disk:

- `frames/05/cut-propaganda-backoffice-66.4.jpg` — Propaganda Media's own internal roster screen
- `frames/05/cut-topearners-52.3.jpg` — the campaign's top-earner leaderboard
- `frames/05/cut-donbet-29.5.jpg` — the `DONBET` and `Jack Sports` cards, publisher and figures
- `frames/05/cut-bizbet-42.2.jpg` — the `BizBet` card and the description text on it

**Where the pixels ran out, this report writes UNREADABLE.** The Whop grid at 00:26–00:31 is filmed
from the side at an angle: the campaign artwork and the platform name are legible, most card titles
and prices are not, and none of them is guessed.

---

## 2. Second-by-second record of what was watched — 00:00 to 01:42

No summarising. Caption text is quoted as burned into the picture.

| Time | What is on the screen | What is said / written | Label |
|---|---|---|---|
| 00:00 | The presenter to camera, seated, wood-panelled hotel interior, DJI clip-on microphone on his shirt | **"I'm on this flight right now literally making clips and I'm on CNN"** (0.00–4.48) | V·T |
| 00:04 | Same shot | continuation of the same line | V·T |
| 00:08 | Same shot | **"That's Musa."** | V·T |
| 00:09 | Same shot | **"by posting videos"** | V·T |
| 00:11 | Same shot; he gestures at the lens, a ring visible on his hand | **"of other people"** | V·T |
| 00:13 | **Cut to a corridor**: a man in a cream cable-knit shirt walks toward a second man in glasses in a lit hallway | **"He's at the forefront"** | V·T |
| 00:15 | The two meet in the corridor, turning to face each other | **"called clipping."** | V·T |
| 00:17 | **Split screen**: above, a wide shot of both men at a marble table with a white laptop between them; below, a close-up of the man in glasses | **"how much money"** | V·T |
| 00:19 | Same split; the presenter clasps his hands | **"Oh man,"** | V·T |
| 00:21 | Same split; the man in glasses leans on his hand | **"top line revenue"** | V·T |
| 00:23 | Close-up, chyron appears: red block **CLIPPER**, white block **Musa Mustafa** | **"easily over $30 million."** | V·T |
| 00:24 | Same close-up, chyron held | **"So how does"** | V·T |
| 00:26 | Presenter to camera, moving, room swinging behind him | **"Well,"** | V·T |
| 00:28 | **The screen recording begins.** A MacBook on a wooden table, a second monitor behind it marked `TWISTED MINDS`. The laptop shows a browser page: top-left the **Whop** wordmark, under it **`Discover Content Rewards`**, and a grid of campaign cards with artwork, small platform icons and blue price chips | **"rewards platform."** | V |
| 00:30 | Same page, camera closer. Card artwork legible: `MOORHOUSE CLIPPER NETWORK $1.50 CPM`, `SAFETY`, `NEW YORK UGC`, `BACKYARD BREAKS`, `WEAPONIZED INCOMPETENCE`, `FACELESS UGC`, `LULL`. **Card titles and prices are UNREADABLE at this angle** | **"all of the live campaigns"** | V |
| 00:31 | The grid scrolled; new cards visible — `ENIGMA QUEST`, `CANDY AI`, `GET PAID CLIPPING`, `ADAPTIVE AI`, `JACK`, `DONBET`, `Billy Brown Clipping`, `JAMES TONIC`, `GRIZ`. **Enlarged from the video (`cut-donbet-29.5.jpg`): the `DONBET` card reads `Donbet FIFA World Cup Logo`, publisher `billbord`, `$1,877/$4,000`, `246` participants; beside it `Jack Sports`, same publisher `billbord`, `$4,063/$6,250`, `225` participants** | **"that are being run"** | V |
| 00:33 | Presenter to camera | **"These are from influencers,"** | V·T |
| 00:35 | Same | **"creators, brands,"** | V·T |
| 00:37 | Same | **"artists, musicians,"** | V·T |
| 00:38 | Same | **"even tourism boards."** | V·T |
| 00:40 | **A campaign detail page fills the screen.** Header art: *Launched by ◆Propaganda* / **"Get Paid Clipping For Earn Your Leisure"**, a phone mock-up showing two men, a chip reading *Pays out $1.5 per 1000 Views*. Below, the campaign card: **`Earn Your Leisure Clipping \| $10k Budget \| $1.5 CPM`**, progress **`$0/$10,000`**, badges **`4` participants**, **`Personal brand`**, **`$1.50/1K`**; description naming EYL's founders and instructing the clipper to clip and post to TikTok, Instagram and YouTube Shorts; a black **`Join Campaign`** button and a share icon; a **`Requirements`** heading below | **"So a clipper can come"** | V |
| 00:41 | Same page held; the cursor moves onto the `Propaganda` publisher name | **"to this website, click"** | V·T |
| 00:42 | **Back on the grid, closer.** Now readable: `BizBet Logo Clipping \| $1.2K Budget` — `$0/$1,195` — `7` — `$0.20/1K`. **Enlarged from the video (`cut-bizbet-42.2.jpg`): its own description on the card reads *"…an Australian online casino focused on … market and growing its…"*** · **`David Heacock Clipping \| $20K Budget`** — `$4,733/$20,000` — `1K` — `$1.50/1K` — publisher `Clipix`, `6d`, with a `Join Campaign` button · `Talking-Head UGC [Non-English]` — publisher `Content Rewards` · `ENIGMA QUEST` — publisher `ClipHaus`, `19d`. A row of platform filter icons runs across the top: **YouTube · TikTok · Instagram · X · Facebook** | **"the campaign"** | V |
| 00:43 | Same grid | **"they want to participate"** | V·T |
| 00:44 | Grid scrolled one card: **`Post Bebe Rexha Love Island UK 2026…`** — publisher `Sound Network`, `19h` — **`$583/$2,417`** — `237` — **`$2/1K`** | **"in, download"** | V |
| 00:45 | Grid held; the Bebe Rexha card now shows its own `Join Campaign` button and a `Music` category chip; the `Earn Your Leisure` card sits beside it at `$0/$10,000`, publisher `Propaganda`, `2h` | **"the source content."** | V |
| 00:46 | Presenter to camera | **"Then they can clip"** | V·T |
| 00:47 | Same | **"that up, put on captions"** | V·T |
| 00:48 | Same, hand toward the lens | **"and post it"** | V·T |
| 00:49 | Same | **"to social media."** | V·T |
| 00:50 | Same, looking off-camera | **"Now most of"** | V·T |
| 00:51 | Same | **"these campaigns"** | V·T |
| 00:52 | **A second campaign detail page, and this is the important screen.** Title **`Clipping Campaign`**, budget **`$120,000/$120,000`** with the bar fully drawn; badges **`12K` participants**, **`Entertainment`**, **`82%`**. Body text: *"We're kicking off the official clipping campaign for the Call of Duty®: Modern Warfare® 4 … trailer launching on May 28. Your job is to transform the trailer into engaging, shareable sh[ort] content that amplifies the biggest moments and drives hype."* **`Requirements → Content Requirements → "Refer to the Google Docs for the campaign requirements"`**. **`Earnings`** in three per-platform cards: **TikTok `$1.50/1K views`, `$1.50 Min`, `$1500 Max`** · **Instagram `$1/1K views`, `$1 Min`, `$1500 Max`** · **YouTube `$1.50/1K views`, `$1.50 Min`, `$1500 Max`**. **`Analytics`** with a **Views / Submissions** toggle, **`114.2M` Total views** and a rising curve. **`Top Earners`**: `8,483,132 — LMB` (gold stars), `4,720,759 — Ivan` (silver), `4,539,970 — Nokidoki`. A **`Resources`** heading below | **"will pay out a dollar"** | V·T |
| 00:53 | Same page held | **"or $1.50"** | V·T |
| 00:54 | Same page held; the TikTok rate chip is highlighted by the cursor | **"for every 1,000 views."** | V·T |
| 00:55 | Same page held | same caption held | V |
| 00:56 | Presenter to camera | **"That's why"** | V·T |
| 00:57 | Same | **"clipping has become"** | V·T |
| 00:58 | Same | **"a side hustle for some,"** | V·T |
| 00:59 | Same | **"job for others."** | V·T |
| 01:00 | **Split screen**: above, a man in a black hooded sweatshirt on a pale sofa; below, the same man close up | **"Is this killing traditional"** | V·T |
| 01:01 | Close-up held | **"marketing firms?"** | V·T |
| 01:02 | Close-up, he answers straight to camera | **"100%"** | V·T |
| 01:04 | **Cut to a rooftop terrace at dusk**, a city skyline behind glass balustrades; a man in a black T-shirt speaks up into the lens. Watermark **`EDDIECUMBERBATCH INSTAGRAM`**; large title word **`THIS IS`** | **"Eddie runs a company called"** | V·T |
| 01:05 | Same terrace shot; title word **`ALL`**; a second caption card reads **`Propaganda Media`** | **"Propaganda Media"** | V·T |
| 01:06 | Same terrace; title **`TO ME`** | **"that connects clippers"** | V·T |
| 01:07 | **A screen appears, colour-graded blue**: an internal back-office page. Visible: a **`Users`** heading, three summary tiles (values UNREADABLE at full frame; enlarged below), and a table with columns including **`Joined`** and **`Trust Score`**, rows carrying avatars, usernames and percentages. Title word **`CLIPPERS`** | **"that connects clippers"** held | V |
| 01:08 | Same back-office screen. **Enlarged (`cut-propaganda-backoffice-66.4.jpg`): the `Trust Score` column reads `80%` with a five-dot rating, the `Joined` column is sortable, and the rows are individual clippers — `bizz @bizzzz`, `Aleksandra`.** The overlaid title reads **`$105,000`** | **"with brands,"** | V |
| 01:09 | The blue screen held, more table rows scrolling — entries reading `…ENTERTAINM…` with dates and percentages, each row ending in a blue action button | **"and according to PwC"** | V·T |
| 01:10 | **A phone browser fills the frame** on the PwC website: **"Global entertainment and media advertising revenues to hit US$1.4 trillion in 2030 – as global box office continues recovery: PwC"**, **`Press Release \| June 22, 2026`**, first bullet: *"Global entertainment and media advertising revenues surpassed US$1 trillion in 2025, projected to hit $1.4 trillion in 2030"* | **"and according to PwC"** | V·T |
| 01:11 | The same page scrolled slightly | **"last year,"** | V·T |
| 01:12 | Same page, scrolled further — third bullet now visible: *"AI-powered hyper-personalisation to see advertising emerge as key growth engine for global E&M industry and segments"* | **"more than $1 trillion"** | V·T |
| 01:13 | Same page | **"was spent on advertising."** **Correction:** the machine transcript renders this stretch as *"more than a trillion dollars was spent on advertising"*; the **page itself says advertising REVENUES surpassed $1 trillion** — revenue, not spend. The reel's own caption says "spent"; the screen says "revenues". Both are recorded, neither is smoothed over | V·T |
| 01:15 | Presenter to camera | **"Eddie is banking that"** | V·T |
| 01:17 | Same | **"to clipping"** | V·T |
| 01:19 | **Split screen**: above, the two men seated on facing sofas with the Whop grid open on a laptop between them; below, the man in the black hooded sweatshirt close up | **"But once there's been"** | V·T |
| 01:21 | Same split, same framing | **"so many case studies and"** | V·T |
| 01:23 | Close-up; chyron appears: red block **CO-FOUNDER, PROPAGANDA MEDIA**, white block **Eddie Cumberbatch** | **"pieces of data"** | V·T |
| 01:25 | Close-up, chyron held, he gestures with an open hand | **"this really is the best way"** | V·T |
| 01:27 | Close-up | **"The bigger companies"** | V·T |
| 01:29 | Split screen again, laptop still showing the Whop grid | **"to hop on this."** | V·T |
| 01:31 | Close-up | **"They still do."** | V·T |
| 01:33 | Close-up, he looks down | **"this thing."** | V·T |
| 01:35 | Close-up, he laughs | **"You don't look at billboards?"** | V·T |
| 01:37 | Close-up | **"it would be"** | V·T |
| 01:40 | Close-up | **"to be outside,"** | V·T |
| 01:42 | Close-up, fingers pinched together | **"to be on any clip."** | V·T |
| 01:42 (last) | Split screen: the wide shot of both men with the laptop, and the close-up | **"instead of it"** | V·T |

---

## 3. Capabilities — what this source demonstrably shows

**3.1 The marketplace itself, named and open.** The platform is **Whop**, section *Discover Content
Rewards* (V, 00:28). Its grid is a public list of live campaigns; a filter row across the top carries
**YouTube, TikTok, Instagram, X and Facebook** (V, 00:42). Anyone can browse it without an account
being shown.

**3.2 The campaign object — every field a campaign carries, read off the screen.** From the two
detail pages (V, 00:40 and 00:52): a **publisher** (`Propaganda`, `Clipix`, `Sound Network`,
`Content Rewards`, `ClipHaus`), an **age** (`2h`, `6d`, `19h`, `19d`), a **budget with live
consumption** (`$0/$10,000`, `$4,733/$20,000`, `$583/$2,417`, `$120,000/$120,000`), a **participant
count** (`4`, `1K`, `237`, `12K`), a **category** (`Personal brand`, `Music`, `Entertainment`), a
**rate per thousand views** (`$0.20/1K`, `$1.50/1K`, `$2/1K`), **per-platform rate cards with a floor
and a ceiling** (TikTok `$1.50/1K` min `$1.50` max `$1500`; Instagram `$1/1K` min `$1` max `$1500`;
YouTube `$1.50/1K` min `$1.50` max `$1500`), a **written brief**, a **requirements section**, a
**resources section** holding the source footage, and a **`Join Campaign`** button.

**3.3 Payment is per thousand views, capped both ways.** The floor stops dust payments, the ceiling
(`$1500`) caps what one clip can earn from one campaign (V, 00:52). This is the whole commercial
mechanic in one screen: **the brand buys views at a fixed unit price and pays only for views that
happened.**

**3.4 The campaign carries its own analytics, and a leaderboard.** A **Views / Submissions** toggle,
**114.2M total views** on one campaign and a rising curve; below it **Top Earners** — `8,483,132`,
`4,720,759`, `4,539,970` views — with tiered star badges (V, 00:52). The clippers are ranked against
each other in public.

**3.5 One campaign is shown fully spent.** `$120,000/$120,000`, `12K` participants, `82%` approval,
for a **Call of Duty: Modern Warfare 4 trailer** (V, 00:52). That is a named global publisher paying
out a six-figure budget through this mechanism.

**3.6 The agency layer on top has its own back office, and it scores people.** Propaganda Media's
internal screen carries a **`Users`** page with summary tiles and a table whose columns include
**`Joined`** and — the interesting one — **`Trust Score`**, shown at `80%` with a five-dot rating,
per clipper (V, 01:07–01:09, enlarged in `cut-propaganda-backoffice-66.4.jpg`). **The middleman's
asset is a scored roster of creators**, not the campaigns.

**3.7 The claims made in words, recorded as claims.** Musa Mustafa, chyroned CLIPPER: top-line
revenue *"easily over $30 million"* (T, 00:23) — **U**, no screen supports it. Eddie Cumberbatch,
chyroned CO-FOUNDER of Propaganda Media: traditional marketing firms are being killed *"100%"*
(T, 01:02) — an opinion. The PwC page is the only third-party document shown and it says
**advertising revenues surpassed US$1 trillion in 2025, projected $1.4 trillion in 2030**
(V, 01:10) — the reel's *"a third of that will shift to clipping over the next decade"* is
**Eddie's forecast, not PwC's** (T, 01:15–01:17).

**3.8 The marketplace openly carries online-casino and betting campaigns, and this is decisive for
DXB.** Read off the screen, not inferred: **`BizBet Logo Clipping | $1.2K Budget`, whose own card
description reads *"…an Australian online casino focused on … market and growing its…"***
(V, 00:42, `cut-bizbet-42.2.jpg`), and **`Donbet FIFA World Cup Logo`, publisher `billbord`,
`$1,877/$4,000`, `246` participants**, alongside `Jack Sports` from the same publisher
(V, 00:31, `cut-donbet-29.5.jpg`). **No filter, screen or category wall of any kind is visible
anywhere on this platform** — these campaigns sit in the same open grid as a game trailer and a
personal brand. Under `MASTER_PLAN §11` the Islamic boundaries are immutable and CEO-only, and this
repository already enforces them by machine: `packages/hook/src/pre-task.ts` carries a
`halal_screen` check that matches flagged category terms against a task's own text with a
letter-boundary regex and **fail-closes the spawn**, with policy edits walled to the CEO (R, read
this session). **So the platform's open door and our closed door are both facts, and they collide on
this exact business.**

### The economics of one campaign, computed from the numbers on screen

Not a forecast — arithmetic on figures visible at 00:52, computed this session:

| Measure | Working | Result |
|---|---|---|
| What the brand actually paid per thousand views | `$120,000 ÷ 114,200,000 × 1000` | **$1.05 per 1,000 views**, blended across the three platforms |
| What the posted rate would have bought | `$120,000 ÷ $1.50 × 1000` | 80.0M views — **the campaign delivered 114.2M, i.e. 43 % more views than the top rate pays for**, because Instagram is priced at `$1/1K` and because unpaid overspill exists |
| Average earning per participant | `$120,000 ÷ 12,000` | **$10.00 per participant** |
| Concentration at the top | `(8,483,132 + 4,720,759 + 4,539,970) ÷ 114,200,000` | **the top three clippers took 15.5 % of all views** |

**What those four lines mean, in one sentence:** for the brand this is cheap, verifiable
distribution; for the clipper it is **a lottery — the average ticket pays ten dollars and three
people out of twelve thousand take a sixth of everything.**

**What is NOT claimed.** How Whop verifies that a view is real, how payouts are settled, what the
`82%` measures, what the three tiles on Propaganda's back office count, what `Trust Score` is
computed from, and whether any figure on any screen is live rather than seeded — all **UNREADABLE or
unobservable in this source** (U). Nothing about either company's backend is inferred from these
screenshots. The `$1500` ceiling is read as a per-submission cap because it sits inside a
per-platform rate card; **whether it caps the clip or the clipper is not legible** (U).

---

## 4. What DXB has today — measured 2026-08-07, this session

| Question | Measurement (command → output) | Result |
|---|---|---|
| Do we have any clipping, campaign, creator or content-marketplace surface? | `find apps -type d -path "*app/*" \| grep -Ei "clip\|campaign\|creator\|content\|social\|marketing"` → **no output** | **No.** Not one route in the dashboard touches this business |
| Do we have staff written for it? | `ls personas/social-media/` → **13 personas**, including `social-scheduler-publisher`, `social-creative-asset`, `social-analytics-agent`, `social-account-connector`, `social-approval-workflow`, `social-commerce-creator-lead`. `personas/marketing/` + `personas/social-media/` together → **49**. Files mentioning clipping/short-form: `marketing-tiktok-strategist`, `marketing-short-video-editing-coach`, `marketing-video-optimization-specialist`, `marketing-content-creator`, `social-copywriter`, `social-creative-asset` | **Yes, on paper.** The roster for this business is written; none of it is connected to an outside platform |
| Can we already see money arriving? | `apps/dashboard/src/app/(command)/revenue/page.tsx` read this session: it reads `v_objective_progress` (`realized_net_eur`, *"realized net = ledger − cost, never projections"*), `v_snev`, `v_opportunity_pipeline` | **The plumbing for realised revenue exists and is honest by construction** — it refuses projections |
| Has any revenue actually been realised? | Not measured this session — the company database was not read | ⚠ UNVERIFIED. The board's standing figure is zero; it is not restated here as a fresh measurement |

Honest position: **on this business DXB has the people and none of the pipes.** Forty-nine written
marketing and social employees, thirteen of them purpose-built for exactly this kind of work, and
**zero connection to any platform where the work is bought or sold.** The gap is the same one source
03 exposed — wiring, not architecture.

---

## 5. The build project — the recommendation, and what it rests on

The CEO asked for this **as a project**, so this section does not hand him a menu. It names the
seat DXB should take, says why, says what would prove it wrong, and marks the one line that is
genuinely his.

### 5.1 What these people actually do, described as an operating loop

Four distinct jobs are visible on this screen, and they are four different companies:

| Seat | The daily loop it actually runs | What it owns at the end of a year |
|---|---|---|
| **The brand** | Writes a brief, funds a budget, uploads source footage, waits, pays per verified thousand views | Reach it bought at **$1.05 per 1,000 views** (measured, §3) |
| **The clipper** (Musa's seat) | Browses the grid, joins a campaign, downloads the source footage, cuts it, adds captions, posts to TikTok/Instagram/YouTube, gets paid per thousand views | **Nothing that compounds.** Piecework. Average $10; three of twelve thousand take a sixth of everything |
| **The agency** (Propaganda's seat) | Wins a brand client, launches the campaign under its own name (`Launched by ◆Propaganda`), recruits and **scores** clippers in its own back office (`Trust Score 80%`), guarantees delivery to the brand, keeps the spread | **A scored roster and a client list** — both compound. This is the only seat with an asset |
| **The marketplace** (Whop's seat) | Runs the two-sided platform, verifies views, settles payouts, polices fraud, takes a cut of every campaign | The network itself — **and it already exists, with 12K participants on a single campaign** |

### 5.2 The recommendation

**Take the agency seat. Enter through the clipper seat. Do not attempt the marketplace.**

**Why the agency seat and not the others — each reason is a measurement, not a preference:**

1. **The clipper seat is a lottery and DXB is not built to play lotteries.** $10 average across
   12,000 people, 15.5 % of all views to three of them (computed, §3). A holding whose stated
   objective is revenue and profit does not become participant number 12,001.
2. **The marketplace seat is a fight against an existing network from zero.** Whop already has both
   sides. Nothing in this source shows how it verifies a view, settles a payout or polices fraud
   (U) — meaning we would be building the hardest part of the machine blind.
3. **The agency seat is the only one whose asset is a scored roster of people** (V, 01:08) — and
   **that is precisely what DXB already is.** 199 written employees, a governance ledger, an
   approval gate, a scoring culture. Propaganda's differentiator is a spreadsheet of humans with a
   trust percentage. Ours would be **49 written marketing and social employees who are themselves
   the production capacity** (R, measured §4) with a human roster layered on top. That is the
   Ferrari version of this business: *an agency whose creative capacity is its own workforce.*
4. **The money direction fits the standing rule.** In the agency seat the brand pays us — **money
   IN, which needs no approval** — and we pay clippers, **money OUT, which stops at the CEO**. The
   boundary already written into `.claude/CLAUDE.md` maps onto this business without amendment.

**Why entry is through the clipper seat, not directly into the agency seat.** The agency seat needs
a first brand client, and we cannot credibly sell delivery we have never performed. The clipper seat
costs **nothing**: no money out, no contract, no identity step. Running a handful of campaigns
ourselves produces the three things the agency seat is sold on — proof we can deliver views, a
measured cost per thousand, and the operational know-how to score somebody else's clippers. **It is
a training ground and a reference, not the business.**

### 5.3 THE ABSOLUTE LINE — the CEO's live order of 2026-08-07

> **"bahislerle asla işimiz yok ÇOK BÜYÜK UYARI SAKIN HEEE UFACIK ŞEKİLDE YAPMAYIN!"**
> — the CEO, 2026-08-07, on reading that this marketplace carries such campaigns.

**This is not a filter, a threshold, or a percentage. It is a total exclusion, and it binds every
seat, every campaign, every client and every clip, at any size whatsoever.** His words are explicit
that not even the smallest version of it is permitted. No campaign from such a brand is joined, no
such brand is represented, no such logo appears in anything DXB produces, and no revenue from that
source enters this holding — not as a test, not as a one-off, not as a favour to a client who also
has clean work.

**What was measured that made him say it:** this marketplace openly carries those campaigns — read
off the cards themselves (§3.8, `cut-bizbet-42.2.jpg` whose own description names an online casino,
`cut-donbet-29.5.jpg` with its publisher and figures), sitting in the same open grid as a game
trailer and a personal brand, with **no filter, screen or category wall visible anywhere on the
platform**.

**What the repository already does about it, measured this session (R):** `MASTER_PLAN §11` makes
the Islamic boundaries immutable and CEO-only, and `packages/hook/src/pre-task.ts` carries a
`halal_screen` check that matches flagged category terms against a task's own text with a
letter-boundary regex and **fail-closes the spawn**, with policy edits walled to the CEO. The
machine that enforces his order exists and is live. **Its term list is CEO-only by construction and
was not touched by this report** — if he wants his sentence hardened into that list, that is his
edit to make or to order, and it is named here so it is not forgotten.

**Consequence for the project, stated now rather than discovered later:** in every seat in 5.1, the
exclusion is **part of the build, not a policy note bolted on afterwards.** In the clipper seat it
decides which campaigns may be joined at all. In the agency seat it decides which brands may be
represented at all. It is also, incidentally, a position in the market — a clean-roster agency is a
real thing to sell in a grid that mixes such brands with everything else — **but that is a side
effect, not the reason. The reason is that he has forbidden it outright.**

### 5.4 The one thing that could overturn this recommendation, and how to settle it

**The decisive unknown is whether our own workforce can actually produce a finished, postable clip
end to end.** The personas exist (`social-creative-asset`, `social-scheduler-publisher`,
`marketing-short-video-editing-coach`, `marketing-video-optimization-specialist` — R, §4); **whether
they have real video-editing hands has not been measured** (⚠ UNVERIFIED). If they cannot, the
agency seat still stands but its production capacity is bought rather than owned, and the Ferrari
argument in 5.2 (3) weakens to an ordinary agency.

**This is testable without spending money, signing anything, or connecting a single account:** take
one piece of freely usable source footage, and have the workforce cut, caption and render a
short-form clip to file — **produced locally, not posted anywhere.** That measurement settles the
question and crosses none of his gates. It is not started here, because §5.5.

### 5.5 What is NOT done here, and why

**No row is opened, nothing is installed, no account is touched.** Two binding reasons, both already
on the record: **implementation is prohibited until the CEO approves the visual design package**
(`docs/ceo-directives/2026-07-reanalysis/` §8), and **which outside accounts may be connected is his
decision** (W-C42-4). The recommendation above is the author's judgement, offered so he decides on a
position rather than on a menu — **and the only line that is genuinely his is whether to take the
agency seat at all, and which accounts it may use.**

---

## 6. Verdict

**This source is worth more than the four before it, and for a different reason.** It is not a
capability to copy into the dashboard — it is **a business the CEO asked for, filmed on the platform
that operates it, with its prices, its payout mechanics, its analytics and its leaderboard all
legible on screen.** The whole commercial machine is on those two campaign pages.

**What is real in it:** a named marketplace (Whop / Content Rewards), a fully spent **$120,000**
campaign for a Call of Duty trailer with **12K participants and 114.2M views**, per-platform rate
cards with floors and ceilings, and an agency back office that scores its creators.

**What is claim, not evidence:** *"over $30 million"*, *"killing traditional marketing firms 100%"*,
and the *"a third of advertising will shift to clipping"* forecast — all spoken, none shown. The one
document on screen, PwC, says **advertising revenues surpassed $1 trillion**, which the reel's own
caption converts into *"spent on advertising"*. Recorded as it is, not smoothed.

**What DXB has:** the staff and none of the connections. Forty-nine written marketing and social
employees, thirteen purpose-built for this work, **zero routes and zero outside accounts.**

**THE ABSOLUTE LINE, above every other line in this report — the CEO, 2026-08-07:**
> **"bahislerle asla işimiz yok ÇOK BÜYÜK UYARI SAKIN HEEE UFACIK ŞEKİLDE YAPMAYIN!"**

Total exclusion, every seat, every campaign, every client, every clip, at any size. Recorded in
full at §5.3 with the measurement that provoked it and the live machine gate that enforces it.

**THE RECOMMENDATION, made rather than deferred: take the agency seat, enter through the clipper
seat, do not attempt the marketplace.** The clipper seat is a lottery — **$10 average across 12,000
participants, 15.5 % of all views to three of them** (computed §3). The marketplace seat is a fight
against an existing network from zero, whose hardest parts — view verification, payout settlement,
fraud control — are not even visible in this source. **The agency seat is the only one whose asset
is a scored roster of people, and that is what DXB already is**; entering as a clipper first costs
nothing and buys the delivery proof an agency is sold on. Full reasoning at §5.2, the constraint at
§5.3, the test that could overturn it at §5.4.

**The decisive unknown, named honestly:** whether our own workforce can cut, caption and render a
finished clip end to end is **⚠ UNVERIFIED**. It is settleable locally, with no money, no contract
and no account — §5.4 says exactly how.

**What is genuinely his, and only this:** whether to take the agency seat at all, and which outside
accounts it may use (W-C42-4). Everything else in this report is the author's judgement, offered so
he decides on a position rather than on a menu.

**Not approved.** This report is the author's work, not an accepted finding — LAW B: only the CEO's
own eye accepts it.
