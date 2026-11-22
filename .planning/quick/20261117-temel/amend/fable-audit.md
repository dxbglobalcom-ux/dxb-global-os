# Audit of AMENDMENT.md (B85): blind pass

**Verdict:** not ready for the CEO. One finding blocks (the spend envelope can be exceeded as written), and sixteen need fixing first, including three self-contradictions and an application contract that its own clauses break.
**This audit is incomplete:** read access to `PLAN.md`, `00-SYNTHESIS.md` and `HOLDING-OS-MASTER-PLAN/` was refused (only the `blind/` folder was readable), so every check against those sources is UNVERIFIED and must be re-run before it goes to him.

Everything below rests on the amendment's own text and the brief. Nothing was written to the repository.

## 1. Conditions set before opening the amendment

1. Installing an application changes no foundation file or table; otherwise it is a patch.
2. Harmony is enforced: one lifecycle, quality gate, approval gate, ledger, memory and surface grammar, with no second copy per application.
3. Every step from order to delivery to money has one home.
4. The gate cannot be bypassed: an envelope is bounded in amount, scope and time, and nothing draws past it or inherits it silently.
5. Untrusted input stays data and never reaches credentials or gate fields.
6. Application code holds no foundation authority.
7. Model choice by importance of the part is a foundation property an application cannot weaken.
8. Liveness is real state; resting and stopped are different things.
9. No step assumes a second human.
10. What is unproven is named and tried small.
11. Install, upgrade and removal are versioned and do not falsify history.

## 2. Findings

### A — blocks

**A1 · Claim:** "the database refuses a draw past the cap … Money out still stops at him" (`AMENDMENT.md:126-131`). **REFUTED as written.**
- **Finding:** four paths spend past or outside what he approved.
  - The draw is booked at classification, before the call. For usage-priced engines the cost is known only after, and nothing says a later expense row cannot exceed its draw.
  - The envelope has no end. It is not closed with the job, and item 8's `expires_at` covers pending requests, not an approved envelope.
  - "Money rolls up through the link" (`:54`) does not say whether a child film job draws on the parent's envelope. If it does, he approved a site and another master spends it.
  - Billed-but-failed renders and a provider billing in another currency are not addressed.
- **Evidence:** `:126-131`, `:54`, `:142-144`.
- **Correction:** state that the worst-case cost is reserved before the call and settled after; that the envelope ends with its job; that a child never inherits unless the approved text says so; and how failed billed calls and currency conversion are booked.

### B — fix before it goes to him

**B1 · Claim:** only item 5 changes what he decided (`:7-8`). **REFUTED by its own text.**
- **Finding:** four more items are his decisions and are unmarked: 6(ii) reshapes the constitutional gate (one approval, many money-out acts); M.2 moves role ceilings out of code (`:30-31`); §9 settles two conflicts by the lead's choice (`:148-151`); a master opens jobs (`:52-53`).
- **Evidence:** the lines cited; the A10 precedent (`:130-131`) is UNVERIFIED.
- **Correction:** mark each as a decision for him, as item 5 is.

**B2 · Claim:** three resident processes (`:108`). **REFUTED.**
- **Finding:** item 1 lists four: "engine, executor, intake, voice" (`:67`).
- **Evidence:** `:67` against `:108`.
- **Correction:** say what voice is, and correct the count he is asked to approve.

**B3 · Claim:** the application contract is "proven at stage 1, not assumed" (`:61`, `:158`). **REFUTED.**
- **Finding:** stage 1 installs a second job type, not an application. Handlers, readers, own tables, door functions, lanes and upgrades by manifest appear in no stage. Separately, stage 1 tries "a turn that carries the page" (`:158`) while the conversation store is stage 3 (`:160`).
- **Evidence:** `:155-160`.
- **Correction:** name which manifest clauses each stage exercises, and fix the turn/store order.

**B4 · Claim:** installing "changes no table and no file of the foundation" (`:15-17`). **REFUTED by M.4, M.5, M.7 and M.8.**
- **Finding:** each of these clauses leaves the application's folder:
  - handlers enter "the one handler registry" and run inside the executor (`:33-36`);
  - readers add "a line in the reader registry" (`:37`);
  - tables go "inside the same chain" (`:40`);
  - views read the foundation's tables (`:43`), which also contradicts "only through its doors".
- **First forced change (question f):** the executor must load the application's handler code, its SDK dependencies and a new outward credential. That means the foundation's dependency lockfile and credential configuration.
- **Next forced changes:** the CEO-visible names of new job types and action types in both locales (the manifest carries none), and the shell's renderer for a film or a live site preview.
- **Evidence:** `:15-17` against `:33-44`.
- **Correction:** say how registries, chain, dependencies, locale strings and renderers are discovered from the folder, or state honestly what installation changes.

**B5 · Claim:** a handler is safe beside the credentials because it is "verified at the gate's level (F-x)" (`:35-36`). **REFUTED.**
- **Finding:**
  - "F-x" is a dangling reference.
  - Every handler sees every outward credential.
  - Nothing stops a manifest registering a handler for an existing type, such as the payment handler.
  - The folder ruler passes later edits to handler code as application-internal.
  - A registry mismatch stops the executor (`:34-35`), so one application's bad install halts every outward act of the holding.
- **Evidence:** `:16-17`, `:33-36`.
- **Correction:** credentials scoped per handler; action types namespaced and foundation types not overridable; a named verification with an owner; the deploy order of code and manifest.

**B6 · Claim:** the intake is the quarantine line (`:108-118`). **STANDS in direction; REFUTED in three details.**
- **Finding:**
  - Readers are application code in one process (`:37`), so "each reader has its own principal" does not hold against a parser exploit. Mail parsing sits beside the payout, store and client ad-account credentials.
  - The same process may call the revenue door (`:111-112`), and money in is not gated. A forged payment could mark a deal paid and start work.
  - "Read credentials" assumes every provider can issue read-only access, and no sender authentication is recorded.
- **Evidence:** `:37`, `:108-118`.
- **Correction:** bind each reader principal to one door; revenue only from an authenticated feed; state the read-only condition per reader; record sender verification.

**B7 · Claim:** application door functions "run under the calling run's identity and authority" (`:41-42`). **REFUTED — would not hold when built.**
- **Finding:** with caller rights, the run must hold table grants, so "written only through the door" is unenforceable. With owner rights, application-written SQL carries more than the caller's authority. Views (`:43`) by default read with their owner's rights, across companies.
- **Evidence:** `:40-44`.
- **Correction:** state the role model: one owner role per application, with no rights on foundation tables.

**B8 · Claim:** the manifest declares the mandatory checks (`:23-26`). **REFUTED as sufficient.**
- **Finding:** role ceilings have a foundation maximum (`:28-30`); checks have no foundation minimum. A manifest could omit the constitutional checks.
- **Evidence:** `:23-30`.
- **Correction:** a foundation floor of checks that a manifest can only add to.

**B9 · Claim:** item 1 delivers life at rest (`:65-78`). **REFUTED in wording.**
- **Finding:**
  - "Alive while inside its period and at rest otherwise" (`:70-71`) draws a dead engine as resting, against his law and against `:157`.
  - Working, resting and stopped are not mapped to up/down/unknown, and a dead process cannot write "down".
  - A beat "apart from the sweep" (`:73`) can advance while the work loop is dead.
  - Item 2 notifies per job (`:82-83`), so liveness rows have no path to the surface.
- **Evidence:** `:67-74`, `:82-83`, `:157`.
- **Correction:** four drawn states with their derivation; the beat tied to completed work; a system channel.

**B10 · Claim:** `surface_show` needs no gate (`:95-97`). **STANDS on gating; REFUTED on bounds.**
- **Finding:**
  - A master that has read a client's mail can put content on his screen without his click.
  - "A page" is unbounded.
  - Artifact rendering inside his session is unaddressed (a website is HTML).
  - Any manifest could grant the tool to any role.
- **Evidence:** `:28-32`, `:95-97`.
- **Correction:** a closed list of targets by identifier; binding to the live conversation at the door; sandboxed artifact rendering; never focusing an approval control.

**B11 · Claim:** "a job keeps the versions it started on" (`:57`). **REFUTED for code.**
- **Finding:** one registry holds one handler per type, so a job approved under version 1 executes under version 2. Also, "tables leave" (`:58-59`) contradicts "history is never deleted".
- **Evidence:** `:57-59`.
- **Correction:** say which things are versioned per job, and that tables are retired, not dropped.

**B12 · Claim:** the child job is "one column, no new mechanism" (`:50-55`). **REFUTED.**
- **Finding:** it adds a wait on another job, a money roll-up, and an agent opening work. It leaves these unhomed:
  - a film discovered mid-job is a change to the contract, which is gated;
  - a deal that already includes site and film has a second route through the price policy;
  - child failure, parent cancellation and timeout;
  - who rejects an unfit film;
  - a depth or cycle limit;
  - whether the child may sit in another company.
- **Evidence:** `:50-55`.
- **Correction:** state each, or name them in the stage-2 trial.

**B13 · Claim:** the shoe advertisement runs end to end. **REFUTED — steps without a home.**
- **Finding:** the envelope covers model routes only. For ad spend on a platform there is no home for whose account pays, the running drawdown as an expense (the intake books figures, not expenses), or an emergency stop that must not wait for approval. Client acceptance from a spoofable mail, asset rights, and hosting or domain costs that outlive the job are likewise absent; PLAN may cover them (UNVERIFIED).
- **Evidence:** `:108-112`, `:126-131`.
- **Correction:** one line per step naming its home or its stage.

**B14 · Claim:** the envelope is "the pattern A10 already uses" (`:130-131`). **REFUTED as analogy.**
- **Finding:** A10 as described is one approval of a policy. The envelope is one approval per job, so every client job with generation stops at him: baby-sitting at scale.
- **Evidence:** `:126-131`.
- **Correction:** put the choice between per-job and per-policy envelopes to him.

**B15 · Claim:** §9's floor settles model choice (`:148-149`). **REFUTED against his words.**
- **Finding:** a floor per seat forces the strong model on light parts, and it does not stop a weak model on an important part. The manifest carries the job's value tier, not the part's importance.
- **Evidence:** `:23-26`, `:148-149`.
- **Correction:** say where the importance of a part is declared and enforced.

**B16 · Claim:** the cap is consistent with the facts. **UNVERIFIED — conflict not named.**
- **Finding:** his word of 2026-10-28 says cost warns and never cuts a running job; the cap stops the next render.
- **Evidence:** `:128-130` against brief fact 3.
- **Correction:** name the conflict and say why paid routes are money out, plus a warning before the cap.

**B17 · Claim:** it answers F0–F8, section 4 and section 5 (`:3-6`). **UNVERIFIED.**
- **Finding:** nine headings map to F0–F8 by name. The eleven gaps and section 5's needs are not mapped anywhere.
- **Evidence:** the amendment has no gap-by-gap table; the synthesis was not readable.
- **Correction:** a table with one line per gap and per need.

### C — notes

- **C1:** item 4 adds a second timer beside pg-boss. "A line's schedule fires the same way" (`:104`) describes a recurrence, not a job's wait.
- **C2:** "no replay" and "B10's replay" sit in one paragraph (`:86`).
- **C3:** the lane (`:38-39`), table removal and objectives are not needed by the brief now.
- **C4:** a paid generation key "lives where outward keys live" (`:124`), yet the call "passes the model door". Which process makes the call is unstated.
- **C5:** paid tools other than generation, webhooks, and a scheduled publication fired late after downtime have no rule.

### Stands after attempted refutation

- The intake as a separate process with no outward credential, marked as a change to his decision.
- New action types born gated.
- Liveness written by code only, with the stated limit on what is known.
- A closed event catalogue with content-free "look".
- Expiry that never executes and has no class until he says.
- Objectives derived, not stored.
- "The count is reported, target zero" as an honest form.
