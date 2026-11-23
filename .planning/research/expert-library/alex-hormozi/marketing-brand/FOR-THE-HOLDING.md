# Alex Hormozi (marketing and brand) — what the holding does with it

Companion to `PLAYBOOK.md` in this folder; `§` numbers point there, source tags are the same.
Lines served: **B84** DXB Web Studio and its client-finding leg, **B28/B43** the agency seat and ads,
**B83** revenue lines, **DXB Media Studio** for film and images, and the holding's own brand.

**The answer in one paragraph.** The holding's position is the one Hormozi's method was written for and the one
it warns about. It has no audience, no client and no track record, so three of his four channels are closed or
weak today: there is no warm list, content has nobody to reach, and ads have no proof to carry. What is open is
cold outreach — and the holding has what makes cold outreach work in his own example: workers who can build
the thing for the prospect *before* asking, at near-zero marginal cost. So the machine is: **build it first
and show it (cold, 100 a day) → do the first clients free for a stated trade → capture everything delivered as
measured proof → turn the proof into one excellent free diagnostic and narrow content for buyers → put ads
behind what has already won.** His warning applies in full: an AI-run firm selling B2B advice is exactly the
case where an audience demands proof before it listens (§5, +AIC), so every stage is built around
demonstration and measured results, never around personality or claims.

---

## 1. The ideas, ranked by value

### 1. "Built before asked" — cold outreach where the demo is the message
- **What.** His first-customers method (§2.3) needs a warm list we do not have. His own story of being won as
  a client supplies the cold version: "You don't have to do anything. I will take all the stuff you already
  have online and make them… you just need to say yes" (§2.1) — hidden costs removed, value delivered before
  the ask. Add "show what only you can show" (§5): the prospect sees the result on his own material.
- **Where.** B84 client-finding leg; B28/B43 for the agency seat.
- **Form.** A skill plus a daily quota (Rule of 100, §1). Web office: for each prospect, workers rebuild the
  first screen of his site (or his worst landing page) from his public material and attach three measured
  facts about the current one (speed, what an AI search engine says about the business, one lost query).
  Agency seat: the Media Studio makes one 10–15 second ad from his own product photos, in his language.
- **What we build.** `first-five-outreach` (§3 below); a prospect ledger (who, what was built, sent, reply,
  outcome); a private preview link per prospect; the message in his script: who we are, that we take five
  case studies free in this trade, what we ask in return.
- **First test.** One vertical, one country, 100 prospects, 100 built previews, one message and two
  follow-ups. Measure reply rate and yes rate. His benchmark for a free warm offer is 5 in 3,000 (§2.3);
  a built preview should beat that by a wide margin or the idea is wrong.
- **Earns/improves.** The first five clients, five documented case studies, five testimonials, referrals; and
  a measured cost per client that every later decision uses.
- **Needs the CEO.** A sending identity (domain, mailboxes or the accounts that send) — an identity step;
  the choice of first vertical if he wants to make it (our recommendation is in OPEN-QUESTIONS).
- **Risk.** Cold email and direct-message rules differ by country and platform; unsolicited volume from new
  domains is filtered. The built preview uses the prospect's own public material only, is private to him, and
  is deleted on a no. Volume must never outrun quality — one bad preview is a bad pairing (§6).

### 2. The proof factory — document while delivering, and out-work what we cannot yet out-come
- **What.** "Do epic stuff, talk about what you did"; with no result yet, "show the work" (§5, §6). "I'm
  usually not making content. We're just capturing it." "If you only have 10 customers, start doing audits
  for free and document them" (+AIC). A machine can out-work on a scale no human firm can: not 100 dates but
  10,000 audited sites.
- **Where.** The holding's own brand; B84 and B28 content; the OS itself (every job already leaves a record).
- **Form.** A data library plus a content source. Every outreach preview, audit and client job writes rows
  to a proof ledger: before/after numbers at day 1/30/60/90 (§5), the artefact, permission status.
- **What we build.** `proof-ledger` schema and capture hook in the job flow; a quarterly study generator —
  "we audited N sites of [vertical] in [countries]: here is what we measured" — which is original data no
  competitor or model has (this is the same asset the search-side experts in this library call for).
- **First test.** Publish one study from the first 100 previews of idea 1. Check: does a prospect reply
  referencing it; does an AI search engine cite it within 60 days.
- **Earns/improves.** Authority that does not depend on a human face; the raw material for ideas 3, 4, 5.
- **Needs the CEO.** Nothing to start. Publishing a client's numbers needs that client's consent (written
  into the free-work trade).
- **Risk.** Publishing findings about named businesses without consent. Aggregate, never name.

### 3. One excellent free diagnostic — "reveal their problem", personalised, with the personalisation CTA
- **What.** His main lead magnet is a personalised roadmap: enter your details, get your stage, your
  constraint and what to do (§4). Type "reveal their problem", delivered as software — the type that works
  best when the problem worsens with waiting. Its CTA is "want us to apply this to your business?", not "want
  more?". Free must be better than rivals' paid.
- **Where.** B84 (the front door of the web office); later a second one for B28.
- **Form.** A free tool on the holding's site: the visitor enters a URL, gets a scored report — technical
  health, speed, what the answer engines say about the business, the three fixes worth most — in his
  language. The report ends: "want this done for you?" A second tool for ads: paste a product page, get three
  ad hooks and a storyboard frame.
- **What we build.** The tool on tools already decided (Screaming Frog, DataForSEO, OpenSEO, Search Console);
  its landing page to the ten-point standard (§4) through `landing-page-gate`; a UTM on every entry path.
- **First test.** Send the tool link instead of a built preview to half of an outreach batch; compare reply
  and yes rates with idea 1. Then measure opt-in rate of the landing page with two headlines.
- **Earns/improves.** Qualified leads at near-zero marginal cost; the tool itself is a demonstration.
- **Needs the CEO.** DataForSEO spend per report is money out at volume — a cap to approve.
- **Risk.** A shallow report is worse than none ("your reputation is made by the 99%"). Gate it on usefulness:
  would we charge for this report?

### 4. The hook lab and the kaleidoscope — the Media Studio's unfair advantage
- **What.** 50 hooks a session, 40 remade from proven winners, 10 new; 3–5 bodies; 1–3 CTAs; and when one
  wins, ten variants of it before any new idea (§3). A human team finds 35 ads a week heroic. A studio on a
  local GPU with AI writers makes that in an afternoon — in several languages, which adds a variant axis he
  does not have.
- **Where.** B28/B43 as a client service ("your winning ad, squeezed") and for the holding's own ads;
  Media Studio; reads the `kisayol` recipe cupboard for production.
- **Form.** Two skills (`hook-writer`, `winner-kaleidoscope`), a swipe library (competitors' long-running ads
  per vertical and country, with the callout extracted), and a gate: reading level, callout specificity,
  claim backed by the proof ledger.
- **What we build.** The swipe library collector (public ad libraries, read-only); the hook ledger (hook,
  source, language, result); the variant matrix for the studio.
- **First test.** For the first free client with any ad history: take his best ad, produce ten variants and
  20 remade hooks, run them at a small budget he approves, report click-through against his control.
- **Earns/improves.** A productised offer with a measurable promise; the hook ledger compounds across clients.
- **Needs the CEO.** Ad spend is always his gate (the client's money for client ads; his for ours).
- **Risk.** A hook that works in English may not in another language — test per language, never translate
  and assume. His "language over effects" finding was measured on a famous face; for faceless AI film it is
  a hypothesis to test (PLAYBOOK §7 TEST). Real people in ads need consent.

### 5. Content for buyers, counted in money — and the repurposing chain
- **What.** The algorithm rewards what the many like, not what buyers need: his six most-viewed videos of a
  quarter sold nothing (§7.1). Make narrow, deep content from the top buyers' problems; open each piece with
  proof–promise–plan; assume a stranger; lists, steps, stories; one CTA; repost the best (§7.3, §7.4). Track
  revenue or opt-ins per piece by UTM, never views.
- **Where.** The holding's own channels (brand); offered to clients through B28 once proven on ourselves.
- **Form.** `repurposing-chain` skill: one long recorded piece per week (a case walk-through or study from
  the proof ledger) → clips, carousels, text posts, an article — each ending in the same keyword CTA to the
  diagnostic (§8.4). Plus a content revenue ledger.
- **What we build.** The chain on `video-use`/OpenMontage; the ledger (piece, platform, language, UTM,
  opt-ins, replies, clients); a comment-keyword responder on Meta's own private-reply interface.
- **First test.** Four weeks, one platform, one language, one long piece a week → ~20 derivatives. Success =
  opt-ins to the diagnostic per piece. Then add the second language and compare.
- **Earns/improves.** A warm audience (box 3 of the core four) so that later outreach and ads are cheaper.
- **Needs the CEO.** Social accounts and a Meta app for the responder (identity steps); whether a human face
  or voice fronts the long pieces (decision, OPEN-QUESTIONS).
- **Risk.** Volume without substance is the failure he names ("qualume"). Start only after ideas 1–2 have
  given real material; before that there is nothing true to say.

### 6. Free first, then a written price ratchet
- **What.** Five case studies free for use, feedback, a review and referrals; then +20% every five clients
  until conversion × price falls (§2.1–2.2). Real scarcity once capacity fills.
- **Where.** B83/B84 pricing; coordinate with the offers analyst's files in `../offers-business/`.
- **Form.** An offer rule and a script in the outreach skill; the ratchet as a table in the row file.
- **First test.** It is the offer inside idea 1. Record every refusal reason — "hidden costs" to remove.
- **Earns/improves.** Clients before proof exists; a found price instead of a guessed one.
- **Needs the CEO.** The decision to work free for the first five (cost: GPU, tokens, data fees — money out).
- **Risk.** Free clients who never intend to pay. The trade is stated at the start; the fourth test is whether
  they pay afterwards.

### 7. One flagship free thing a year, launched with a waitlist — "defend the belt"
- **What.** Each year he gives away one large asset and launches it as an event: two weeks of "join the
  waitlist", a launch day, then weeks of pieces cut from it (§8.5). It is the brand moment and the year's
  best lead source at once.
- **Where.** The holding's brand. First candidate: the annual study from the proof ledger ("the state of
  [vertical] websites and AI search, measured in N countries"), with the diagnostic tool as its companion.
- **Form.** A dated public commitment + the content chain + the keyword CTA.
- **First test.** A small version in one vertical once idea 2 has 1,000 audited sites.
- **Earns/improves.** A reason for strangers to pay attention; internal alignment around a date.
- **Needs the CEO.** The date and the public commitment.
- **Risk.** Announcing before the material is excellent.

### 8. Brand as a pairing ledger — including the "AI" pairing
- **What.** "Branding is a deliberate pairing of things through an outcome" (§6). Audit every appearance,
  format, partner, tool and client against "does our buyer like this?" His Coca-Cola case says "AI" itself is
  a pairing: welcome to technical buyers, unwelcome to a mass audience.
- **Where.** The holding's brand; every client brand the agency seat touches.
- **Form.** A gate before anything public (`pairing-check`), and a one-page pairing list per brand: what we
  pair with, what we avoid, the fixed visual signature.
- **First test.** Write the list for the holding; run the gate on the current site.
- **Earns/improves.** Pricing power later; fewer accidental associations now.
- **Needs the CEO.** How openly "run by AI workers" is stated to each audience — it is true and must not be
  hidden; the question is emphasis and framing per market (OPEN-QUESTIONS).
- **Risk.** Treating it as decoration. After the sale the product does the branding.

### 9. The referral engine: "who do you want to bring?"
- **What.** Referral as a benefit of being a client, asked at fixed moments, with a gift that makes the
  client look good (§9).
- **Where.** B84 care packages; B28 retainers.
- **Form.** Each client plan includes N free audits or one free landing page "for a business you choose",
  offered at onboarding, at the first visible result and at each monthly report. BAMFAM in the report itself.
- **First test.** The first five free clients: ask at the first result; count introductions.
- **Earns/improves.** His figure: 20–30% of sales when asked consistently.
- **Needs the CEO.** Nothing.  **Risk.** None beyond the cost of the gifted work.

### 10. "The Algorithm" as the factory law for AI workers
- **What.** Question → delete → simplify → accelerate → automate last; "the only thing more efficient than
  automation is elimination"; token cost up without money up means waste (§7.2).
- **Where.** The machine itself — every content and outreach pipeline before it is built.
- **Form.** A pre-build checklist a pipeline must pass: for each step, "what does that mean, how do we know,
  so what?"; and one paired number per pipeline — tokens and fees spent against opt-ins or revenue.
- **First test.** Run it on the repurposing chain design before building it.
- **Earns/improves.** Lower cost per lead; fewer steps to maintain.
- **Needs the CEO.** Nothing.  **Risk.** None.

### 11. Proof sentences with four variables, bottom quintile included
- **What.** "[X% or average] achieve [outcome] in [time] under [conditions]" — fewer conditions over bigger
  numbers; publish the bottom too (§5).
- **Where.** Every sales page, ad and report of B84/B28.
- **Form.** `proof-sentence` builder reading the proof ledger; a gate refusing any numeric claim without a
  ledger row.
- **First test.** After five clients: one sentence per service, including the worst result.
- **Needs the CEO.** Nothing.  **Risk.** Small samples — say the count.

### 12. Online workshop instead of a hall — later
- **What.** His high-trust model: free diagnostic at an event → video → close (§9). Our form is a live online
  teardown session for one vertical: ten sites audited on screen, attendees' sites included.
- **Where.** B84, after ideas 1–3 work.  **First test.** One session for the first vertical's prospects.
- **Needs the CEO.** Whether a human presents.  **Risk.** No audience to invite yet.

---

## 2. The larger picture

**A first-place client-getting machine, built on this, in five stages** — each stage starts only when the one
before has produced its measured result ("create flow, monetize flow, then add friction").

1. **Flow (weeks 1–6).** One vertical, one country, one offer: free, for the stated trade. One hundred built
   previews a day is a quota for workers, not people. Every preview and every reply is a ledger row. The
   output is five clients and a number: cost per reply, per yes.
2. **Proof (weeks 4–12).** The five jobs are delivered with tracking from day one. The ledger yields the first
   four-variable sentences and the first study from the audited hundreds. Refusal reasons are removed one by
   one. Price starts its ratchet.
3. **The front door (from week 8).** The diagnostic tool goes public, its page built to the ten-point
   standard; outreach now sends either a preview or the tool. Each client plan carries gifts to bring a friend.
4. **Audience (from week 12).** One long piece a week from real delivered work, cut into twenty, in two
   languages, every piece ending in one keyword and one free thing; counted in opt-ins. The hook lab feeds on
   what wins. Only now is there something true worth an audience's time.
5. **Scale (when the ratio is known).** Ads behind the pieces and hooks that already won, country by country;
   the kaleidoscope on each winner; the second language becomes the third; the annual flagship is announced.
   A second channel is opened with its own hundred days. The avatar stays one until a second product exists.

**What makes it first-place rather than a copy.** Hormozi's machine runs on one man's credibility and a
$4M-a-cycle media team. Ours inverts the scarce resource: making is nearly free, so we spend it where he says
the return is — the first five seconds (fifty hooks is nothing), the winner's variants, the demonstration built
for one prospect, the free thing better than a rival's paid thing, the same proof in every language. Where he
has a face, we have measured data at a volume no agency can gather. Where he calls leads with a sales floor,
the diagnostic's last screen and the built preview do the first conversation. And the discipline he asks of
humans — delete before automating, count money not views, tell the whole truth including the bottom fifth —
is something a machine with a ledger can actually keep.

**What to refuse from his practice.** Paid-entry prize draws; any scarcity line that is not literally true;
conditions hidden inside a statistic; volume for its own sake; "comment for the link" used to inflate
engagement when a plain link would serve the reader as well (we use the keyword only where it starts a
conversation the person asked for).

---

## 3. Skill candidates

Each is written so the skill file could be authored from it. All are read-only toward the world except where
"sends" is stated, and sending goes through the approval gate's rules.

### 3.1 `hook-writer`
- **Triggers.** Any job that needs an ad, a short video, a landing-page headline, a post or an email subject.
- **Inputs.** Avatar (who, problem, words they use); the offer or free thing; language(s); the swipe library
  slice for this vertical and country; the hook ledger (our past winners); proof-ledger rows allowed in claims.
- **Steps.** (1) Pull the top proven hooks: ours by result; if none, competitors' longest-running ads.
  (2) Write 50: 40 remakes of proven ones, 10 new, each tagged with its parent. (3) Each hook carries a
  callout in one of three forms — problem, yes-question, label — "specific enough for the right people, broad
  enough for many of them". (4) Rewrite to the shortest form; check reading level (grade 3–5 in the target
  language, by that language's own measure). (5) Check every claim against a ledger row; unbacked → rewrite or
  drop. (6) Write 3–5 bodies (lesson, broken belief, list, steps, story, proof) and 1–3 CTAs (what to do, why
  now, plain words). (7) Per language, write natively from the avatar's words — no translation of a hook.
- **Output.** A hook sheet: 50 hooks × language with parent, callout type, reading level, claim source; the
  bodies and CTAs; a recommended first test set of 10. Results flow back into the hook ledger.

### 3.2 `winner-kaleidoscope`
- **Triggers.** An ad or post has beaten its control by an agreed margin, or a client brings a proven ad.
- **Inputs.** The winning asset and its numbers; Media Studio capacity; languages and markets.
- **Steps.** Produce variants on the ten axes — background, props/visuals, re-enactment, re-order, filter,
  effects, captions/fonts, pacing, music, same hook with new body — plus two of ours: language and
  market-specific setting. Keep the hook's first five seconds identical in at least half. Name each variant
  by axis. Refuse to start a new concept until the set has run.
- **Output.** A variant matrix with files, a test plan, and after the run a table: variant, axis, result
  against the original.

### 3.3 `lead-magnet-designer`
- **Triggers.** A line needs leads; a new avatar or market is opened.
- **Inputs.** Avatar; the paid offer the magnet must lead to; top customer problems (from the proof ledger,
  outreach replies, support questions); tools available.
- **Steps.** (1) Pick ONE narrow problem that the paid offer continues from. (2) Choose the type: reveal
  their problem / sample / one step of many. (3) Choose delivery: software, information, service, physical.
  (4) Write 10 names, to be tested headline → image → subheadline. (5) Make it easy to consume (one screen,
  phone first, their language). (6) Apply the charge test: would we sell this for $100+? If not, improve or
  stop. (7) Write the in-magnet CTA as personalisation ("want this applied to your business?") and the
  follow-up sequence. (8) Specify the landing page and hand it to `landing-page-gate`.
- **Output.** A one-page spec: problem, type, delivery, names to test, the build list, CTA, tracking (UTM,
  opt-in, qualified-lead definition).

### 3.4 `landing-page-gate`
- **Triggers.** Before any opt-in or lead page ships — ours or a client's (also sold as an audit).
- **Inputs.** The page URL or build; the ad or message that sends traffic to it; the objections list.
- **Steps.** Check ten points (§4): headline promises one outcome and matches the sending message;
  subheadline adds context; hero shows the thing or the result; button says what and how; form has the fewest
  fields that still qualify (over five → steps); one-line reason to give an email; three objection bullets,
  most common first; proof only if needed; nothing else on the page; mobile, speed, compressed images, legal.
  Apply the razor to every element: "does it raise qualified opt-ins?"
- **Output.** Pass/fail per point with the fix; two alternative headlines for a test.

### 3.5 `first-five-outreach`
- **Triggers.** A line has no clients, or opens a new vertical or country.
- **Inputs.** Vertical, country, language; prospect list source; what we build per prospect (site first
  screen, ad, audit); the free-trade terms; sending identity; daily quota.
- **Steps.** (1) Build the list (public sources) with the decision-maker's public contact. (2) Per prospect,
  spend the "30 seconds": one true, specific observation. (3) Build the preview from his public material
  only; measure three facts about what he has now. (4) Message: observation → what we built and the link →
  who we are, truthfully (including that AI workers did it) → "we are taking five case studies free in
  exchange for using it, feedback and a review if deserved" → one question. (5) Two follow-ups: a proof from a
  similar business; then a closing question. (6) On reply: acknowledge–compliment–ask; if not for him, "who do
  you know?" (7) On no: ask why; log the hidden cost. (8) On yes: onboarding with the proof-ledger baseline.
  (9) After five: change "free" to the next rung of the ratchet. (10) Keep every contacted prospect warm with
  one useful finding a quarter.
- **Output.** Ledger rows (prospect, preview, messages, replies, reason, outcome); a weekly table: sent,
  replied, yes, cost per yes; the refusal-reason list.
- **Gate.** Sends only from the identity the CEO approved, within the per-country rules recorded for that
  market; stops on any complaint.

### 3.6 `repurposing-chain`
- **Triggers.** A long piece exists (a recorded case walk-through, study, teardown session) or a job closes
  with consent to publish.
- **Inputs.** The recording and transcript; proof-ledger rows; the current free thing and its keyword;
  platforms and languages; the content revenue ledger.
- **Steps.** (1) Pre-search: before recording, outline proof–promise–plan and the lists/steps/stories; the
  aim is near-zero editing. (2) Title and thumbnail: clear, not coy; written for a stranger; time-trade stated
  ("N audits in N minutes"). (3) Cut: each self-contained point becomes a 30–90 second clip opening on its
  own hook (from `hook-writer`), words on screen, no effect that does not aid understanding. (4) Derive:
  carousel of the list, text post of the sharpest line, article with the data, email. (5) Every derivative
  ends with the same single CTA; long-form carries it at start, middle and end. (6) Each link gets a UTM.
  (7) Localise by rewriting hooks natively. (8) Schedule; after 30 days read the ledger; repost the top piece;
  retire formats that bring no opt-ins. (9) Questions in comments become next week's topics.
- **Output.** A publishing set with files, captions, UTMs; a ledger update; next week's topic list.

### 3.7 `proof-sentence` (with the proof ledger)
- **Triggers.** Any numeric claim in a page, ad, report or message.
- **Inputs.** Proof-ledger rows for the service; consent flags.
- **Steps.** Compute the median and the bottom quintile; write "[share/average] of [n] clients achieved
  [outcome] in [time] under [condition]"; remove every condition that is not needed; attach the count and the
  date; refuse if n is below the floor set for that service.
- **Output.** The sentence, its bottom-quintile twin, the row ids.

### 3.8 `pairing-check`
- **Triggers.** Before a public appearance, collaboration, sponsorship, client acceptance, or a new format.
- **Inputs.** The brand's pairing list (pair with / avoid / visual signature); the avatar.
- **Steps.** Name what the audience will associate; ask whether the majority of *our buyers* like it; check
  the Islamic boundaries and the no-deception rule first (a refusal there is final and goes to the CEO once);
  estimate who is lost and who is gained.
- **Output.** Go / no-go with the reason; an update to the pairing list.
