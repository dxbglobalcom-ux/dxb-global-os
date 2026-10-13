# Fable 5.1 (effort high), blind judge — A = max plan, B = xhigh plan (key revealed after the verdict)

1. **Better plan: A — clear.** B is more honest about the schedule and about what cannot be proven on day 21; A covers the brief more faithfully, is more correct on the law, and is more executable piece by piece.

2. **Why**
- **Brief item 2 (requests reach the clinic by WhatsApp).** A builds it (§2 form backend: Cloud API, template submitted D5, R2 fallback to a prefilled message only if Meta is late). B's default D-2 Option A makes WhatsApp delivery depend on the patient tapping send — the request does not "reach the clinic" by itself. B delegates a signed requirement to a client decision with the weaker option as default.
- **KVKK correctness.** A §3 names every recipient and its country (Vercel, Resend, Meta, Google, Sanity) and builds the legal texts from a data-flow sheet (P9 → P7). B's P8 names only Vercel and the e-mail service; Meta (if Option B) and Google (map) are missing.
- **Health-advertising detail that a checker can actually apply.** A §3: registered titles (Dt., Uzm. Dt., Dr. Dt.), no "implant uzmanı", facility name as on the ruhsat, the closing sentence on every treatment page, stock images never posing as the clinic. B's compliance list (§7) is a shorter version of the same thing.
- **Per-piece pass criteria.** A §6 says what "passed" means for each piece (P9: 20 test requests, one channel off, both off; P11: one hop, no chains). B has a good whole-site QA matrix but no per-piece acceptance line beyond "its lines in P1".
- **Dentist review pacing.** A: pilot page D3, then two batches with 2 business days each (R12). B sends all Turkish copy on day 7 and expects it back on day 9 — the critical path hangs on one two-day window.
- **Money discipline.** A §9.3 / R10: no cost falls on the holding without the CEO gate. B only says the clinic pays.

3. **Add to A**
- B's schedule float: A's cutover D20 with delivery D21 leaves one day; a rollback on D20 means a missed delivery. Move cutover to D17–D18 (B goes live day 17, slip limit day 20) or declare the slip rule.
- B §7's honesty on requirement 7: ranking preservation cannot be proven on D21; say so to the client on D1 and put the +14/+28-day position check in writing.
- B's registrar-lost risk (login held by a former agency; recovery can outlast the job) — A's R5 covers only "no access".
- Places API returns at most five reviews, chosen by Google (B D-3) — set that expectation; A §1.1 item 4 implies all reviews.
- Redirect the old site's query-string URLs (B P14).
- A request-received page (B has it; A's form success is a screen state only).
- Old-site backup as a listed deliverable (A makes the archive in P2 but §9.1 does not hand it over).
- B's photo guide detail: originals, not sent through WhatsApp (compression).
- B's P15 check: a non-engineer (copywriter) does the ten editor tasks cold, before the receptionist.
- B's "no password travels by e-mail or chat; ownership moves on the call".

4. **Errors**
- B D-2: "E-mail delivery is guaranteed" — no channel is guaranteed; B's own QA line tests the e-mail service being down.
- B D-2 default does not meet brief item 2 as written; if kept, it needs the client's written acceptance of the deviation, which B does not ask for.
- B internal contradictions: DNS "must be in hand by day 12" (§6) vs. due day 6 (§9); treatments due day 2 (§9) vs. decision D-1 by day 3.
- B P8 recipient list incomplete (Meta, Google) — see above.
- B go-live on a Friday 10:00 with +14/+28 the only position checks; acceptable, but the weekend watch should be named.
- A §1.1 item 4 "the reviews Google returns, unedited" — technically correct but hides the five-review cap.
- A §9.1 omits the old-site archive from deliverables though P2 produces it.
- A calendar: staging opened D13 evening, feedback due D15 12:00 with training on D14 in between — one effective business day for the client's only staging round; not wrong, but R1 should name it.
- Neither plan is wrong on the law as stated; both correctly treat the information notice as a link and consent as a separate unticked box, keep both locales required, merge SPF rather than add a second record, and refuse Vercel Hobby for a commercial site.
