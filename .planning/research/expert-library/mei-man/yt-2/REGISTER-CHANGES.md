# Register changes from Mei Man's other 19 YouTube videos

Study short name proposed: **MY** (`mei-man/yt-2`); merged as **MY2**. Sections cited are this folder's `PLAYBOOK.md` (§n) and
`FOR-THE-HOLDING.md` (idea n). Nothing here edits `SKILLS.md`; the lead merges.

## Additions to existing rows

| # | Skill | The addition to absorb | From |
|---|---|---|---|
| 6 | `ad-funnel-leak-read` | **Never** recommend narrowing targeting or placements because a segment's average cost per result is higher — Meta's "breakdown effect" (business/help/770303663944673): with campaign budget judge at campaign level, with Advantage+ placements at ad set level; a narrowing done that way is itself a finding. Step 2 ("did the page sell") adds **message match**: the ad's offer and product appear on the landing page. When a budget step bought less, check first whether new campaigns **overlap** the old ones. Re-read the last two or three days later — reported conversions grow after the fact | MY §4, §6, §3, §1 |
| 27 | `ad-voice-mining` | Search-phrasing source: each competitor's paid and ranked keywords through DataForSEO, entered as *search language* (not a person's quote), counted, labelled as the competitor's bid, not demand | MY §10, idea 9 |
| 28 | `ad-belief-brief` | Step 7 (compliance) names a fifth case beside testimonials, comments, senders and comparisons: **every deadline, stock count or "last chance" carries its real date or number** — no invented urgency (EU UCPD 2005/29/EC Annex I point 7). Price reframe: show the **larger true number** — percentage under $100, amount above (Berger, Rule of 100). A **context check**: when the market has a live context row (war, disaster, election, mourning, religious season), the brief states which need — comfort, health, relaxation, safety — the concept now serves, or why it runs unchanged; no angle that profits from fear or hoarding | MY §7, §8, ideas 4, 7 |
| 29 | `ad-format-render` | The compliance step reads the same deadline rule on the rendered asset (countdown, strike-through and "last chance" formats from the Q4 shelf carry the brief's real date) | MY §7 |
| 30 | `ad-winner-read` | Step 3's confidence is **computed**: an exact Poisson interval on the count of results and on the cost per result; "too few to say" while the intervals of the two compared ads overlap (worked case, §2). Judge in seven-day windows, never on a day. A budget step is read by **marginal ROAS** (extra revenue ÷ extra spend over the week) against the client's break-even ROAS (1 ÷ contribution margin), with store revenue as the check (§3). Organic **saves per reach** rank which posts are promoted as ads (§6). Never crown or cut a segment by its breakdown average | MY §2, §3, §6, §4 |
| 33 | `short-postmortem` | The same interval rule when two posts are compared on small counts | MY §2 |
| 39 | `first-touch` | A source of conversations to answer: **click-to-message ads** (Messenger, Instagram Direct, WhatsApp) whose destination is this worker; the brief's question is the conversation's first line; reporting by cost per conversation, per qualified conversation, per booking. On WhatsApp the worker stays a business-function bot (the 2026 terms bar general-purpose assistants — reported, to be read at source) | MY §9, idea 3 |
| 44 | `business-diagnosis` | Where ads are a traffic source, the marginal-return table of the last budget steps beside the client's break-even ROAS | MY §3 |
| 48 | `social-profile-setup` | The bio states what the business does, what it stands for and what to do next; the three-second test "would you follow this account?" read on the finished profile | MY §11 |
| `platform-change-ledger` | — | Rows to open (each verified at source before use): Meta learning phase — about 50 results in the week after the last significant edit, and the significant-edit list (read 2026-11-23); Meta breakdown effect page (read 2026-11-23); Chrome third-party cookies kept (Google, 22 Apr 2025); WhatsApp Business Solution AI-provider terms from 15 Jan 2026 (reported only); Meta teen ad targeting by age and location only since Feb 2023 (Meta newsroom, Jan 2023); Instagram hashtag cap of five (reported only) | MY §1, §4, §6, §9, §11 |

## New row

One skill no row holds. Proposed for §4 of the register (the ad office), beside 30.

| # | Skill | What it does | Specified in | Row |
|---|---|---|---|---|
| — | `ad-change-guard` | No edit to a live campaign, ad set or ad without a read first: its learning status and results since the last significant edit, the edit classed by Meta's list (significant / by magnitude / not), a hold while it learns unless the client's stop-loss has fired, a seven-day read, the expected dip after a budget step, and a log row with the date it may be judged | MY idea 1 · Meta learning-phase pages · the ad-office twin of `page-change-guard` · feeds 30, `proof-capture` | B28 |

**Specification, tight enough to author.**

- **Triggers when** any worker or person proposes a change to a live ad account the office manages: a budget or
  bid change, a targeting change, adding or replacing an ad, pausing, killing, changing the optimisation event
  or bid strategy; and once a day over every live ad set, to catch the stop-loss.
- **Inputs.** The ad set's delivery status (Learning / Learning limited / Active); the **Last significant edit**
  and **Results** columns from Ads Manager (or the export); spend, results and cost per result by day for the
  last 14 days; the client's target cost per result or ROAS, break-even ROAS and **stop-loss** written at
  onboarding (e.g. "spend of 3 × target CPA with no result" or "cost per result ≥ 5 × target after 2 days on
  a budget above X" — her own example was 9× on a $500+ budget); the proposed edit and its stated reason; the
  `platform-change-ledger` row for the learning phase; the account's change log.
- **Steps.**
  1. Class the edit by Meta's list: *significant* (targeting, creative, optimisation event, a new ad, a pause of
     seven days or more, a bid-strategy change); *by magnitude* (budget, spending limit, bid/cost/ROAS goal —
     state the size as a percentage); *not significant*. Under Advantage+ campaign budget, a campaign-level
     budget or bid-strategy change counts for every ad set in it.
  2. Read the ad set's state: results since the last significant edit; days since it; whether it is learning.
  3. If the stop-loss has fired, **allow** a kill or a pause at once, and log it.
  4. If the ad set is learning and the edit is significant or large, **hold**, with the date or result count at
     which it may be revisited (≈50 results or seven days after the last significant edit, whichever the
     ledger row now says). Several pending edits are bundled into one, so learning restarts once.
  5. If not learning: require a stated reason that the edit should improve results (Meta's own test) and the
     evidence for it read on a seven-day window, with the count interval of `ad-winner-read`; refuse a reason
     based on one day, on a segment's breakdown average, or on a duplicated ad set.
  6. For a budget step, write the expected dip ("one to two days lower is normal") and the judging date seven
     days out, at which the step is read by marginal ROAS against break-even.
  7. Write the log row: date, object, edit, class, state before, reason, expected effect, judge date, who
     approved under the client's mandate.
- **Output.** A verdict — *allow*, *hold until <date or count>*, or *allow under stop-loss* — with its reason in
  one line, and the change-log row. On the judge date, the row is reopened by `ad-winner-read`.
- **Must never.** Execute anything itself in an account without the client's mandate; treat a single day as a
  trend; restart learning twice in one week for edits that could have been bundled; cite "+20% is safe" or any
  percentage Meta does not publish as a rule; cut a placement, age or gender because its average looked worse.
- **Fixtures** (for `skill-fixture`): raise budget 50% on day 2 of learning → hold; add three ads to a learning
  ad set → hold, bundle; kill after one day at −50% → hold; cost per result $450 against a $50 target after two
  days on $500/day → allow under stop-loss; cut Instagram Stories because its average CPA ($1.46) is higher than
  Facebook Stories' ($1.10) → refuse (breakdown effect), using Meta's own $500 example as the input.

## Not proposed

- A follower-ads skill: the repaired recipe (FOR-THE-HOLDING idea 8b) is a one-time launch setting for the
  holding's own accounts, written once in the launch checklist; it waits on the CEO's spend.
- A crisis-messaging skill: it is one check inside 28 and one context row kept by the research door; a separate
  skill would duplicate the brief.
- A headline-scoring skill: nothing shows such scores predict results.
