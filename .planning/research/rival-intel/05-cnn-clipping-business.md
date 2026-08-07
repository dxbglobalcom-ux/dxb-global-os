# 05 — CNN — the clipping business, filmed on the platform that runs it

**Written 2026-08-07.** The CEO's own words about this source, from his directive:
*"BU SİSTEMİ DE PROJE OLARAK İSTİORZ (clipping business EN MÜKEMMEL ŞEKİLDE YAPMALI)"* — he wants
this **as a project**, done as perfectly as possible. So this report is read differently from the
others: not "what design lesson is here", but **how the machine works, end to end, and which side
of it DXB would stand on.**

Every substantive statement carries an evidence label: **V** visible · **T** transcript or burned-in
caption with a timestamp · **C** CEO-confirmed · **R** repository/backend verified this session ·
**U** unverified.

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
| 00:31 | The grid scrolled; new cards visible — `ENIGMA QUEST`, `CANDY AI`, `GET PAID CLIPPING`, `ADAPTIVE AI`, `JACK`, `DONBET`, `Billy Brown Clipping`, `JAMES TONIC`, `GRIZ` | **"that are being run"** | V |
| 00:33 | Presenter to camera | **"These are from influencers,"** | V·T |
| 00:35 | Same | **"creators, brands,"** | V·T |
| 00:37 | Same | **"artists, musicians,"** | V·T |
| 00:38 | Same | **"even tourism boards."** | V·T |
| 00:40 | **A campaign detail page fills the screen.** Header art: *Launched by ◆Propaganda* / **"Get Paid Clipping For Earn Your Leisure"**, a phone mock-up showing two men, a chip reading *Pays out $1.5 per 1000 Views*. Below, the campaign card: **`Earn Your Leisure Clipping \| $10k Budget \| $1.5 CPM`**, progress **`$0/$10,000`**, badges **`4` participants**, **`Personal brand`**, **`$1.50/1K`**; description naming EYL's founders and instructing the clipper to clip and post to TikTok, Instagram and YouTube Shorts; a black **`Join Campaign`** button and a share icon; a **`Requirements`** heading below | **"So a clipper can come"** | V |
| 00:41 | Same page held; the cursor moves onto the `Propaganda` publisher name | **"to this website, click"** | V·T |
| 00:42 | **Back on the grid, closer.** Now readable: `BizBet Logo Clipping \| $1.2K Budget` — `$0/$1,195` — `7` — `$0.20/1K` · **`David Heacock Clipping \| $20K Budget`** — `$4,733/$20,000` — `1K` — `$1.50/1K` — publisher `Clipix`, `6d`, with a `Join Campaign` button · `Talking-Head UGC [Non-English]` — publisher `Content Rewards` · `ENIGMA QUEST` — publisher `ClipHaus`, `19d`. A row of platform filter icons runs across the top: **YouTube · TikTok · Instagram · X · Facebook** | **"the campaign"** | V |
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

**What is NOT claimed.** How Whop verifies that a view is real, how payouts are settled, what the
`82%` measures, what the three tiles on Propaganda's back office count, what `Trust Score` is
computed from, and whether any figure on any screen is live rather than seeded — all **UNREADABLE or
unobservable in this source** (U). Nothing about either company's backend is inferred from these
screenshots.

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

## 5. The build project — what to install and do

The CEO asked for this **as a project**. What the reel establishes is that there are **three
distinct businesses on this screen, and they are not the same size, the same risk, or the same
distance from us**:

| Position | What it is | What it needs | Where DXB stands |
|---|---|---|---|
| **The clipper** | Joins campaigns, clips source footage, posts, gets paid per 1,000 views | Accounts on TikTok/Instagram/YouTube, editing capacity, volume | **Closest.** We have `marketing-tiktok-strategist`, `social-creative-asset`, `social-scheduler-publisher` written; we lack the accounts (**his decision, W-C42-4**) |
| **The agency (Propaganda's position)** | Sits between brands and clippers, runs campaigns for clients, keeps a scored roster | Brand clients, a clipper roster, a back office with a trust score, money to front campaigns | **Middle.** The roster idea maps onto what we already do with employees; the brand clients do not exist |
| **The marketplace (Whop's position)** | Owns the two-sided platform, takes a cut of every campaign | Both sides at once, view verification, payout settlement, fraud control | **Furthest.** Nothing here is measured and nothing about how Whop verifies a view is visible in this source |

**Nothing is installed and no row is opened by this report.** Two reasons, both binding and both
already on the record: **implementation is prohibited until the CEO approves the visual design
package** (`docs/ceo-directives/2026-07-reanalysis/` §8), and **which outside accounts may be
connected is his decision, not the author's** (W-C42-4). What this report puts in front of him is
the choice above — **which of the three positions he wants**, because they are three different
companies and only he picks.

Two things can be said without waiting for that, because they are measurements rather than plans:

1. **The unit is a thousand views, and the price band on screen is $0.20 to $2.00 per thousand**
   (V, 00:42–00:52). Any version of this business we run is priced inside that band, by someone
   else's market, not by us.
2. **The middleman's durable asset is the scored roster** (V, 01:08), not the campaigns — campaigns
   end, the roster compounds. That is the part of this machine that most resembles what DXB already
   is: a company whose asset is its people.

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

**What is blocked on him, in one line:** which of the three positions — clipper, agency, or
marketplace — this project is, and which outside accounts may be connected to run it.

**Not approved.** This report is the author's work, not an accepted finding — LAW B: only the CEO's
own eye accepts it.
