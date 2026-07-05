# Pitfalls Research

**Domain:** AI-native company operating system (multi-agent business OS on Claude Code; 367-persona hierarchy; 24/7 autonomous operations touching money, email, and ad spend)
**Researched:** 2026-07-05
**Confidence:** MEDIUM (web-verified across multiple independent sources: MAST failure-taxonomy paper, OWASP MCP guidance, Anthropic's own agent-building guidance, documented production incidents. No curated-docs provider was available; nothing below is single-source.)

## Critical Pitfalls

### Pitfall 1: Building the org chart before proving one workflow

**What goes wrong:**
Teams build the full company scaffolding — departments, registries, routers, councils, dashboards — before a single end-to-end task runs autonomously. The MAST study of 1,600+ multi-agent traces found **specification and system-design failures are the #1 failure category (~41.8%)**: ambiguous role definitions, duplicate agent roles, poor decomposition, missing termination conditions. A 367-persona hierarchy is 367 opportunities for exactly these failures. Anthropic's own guidance is blunt: the most successful agent systems use simple composable patterns, and multi-agent setups cost 10–15x the tokens of a single agent — complexity must *demonstrably* earn its keep.

**Why it happens:**
The org-chart metaphor is seductive: it feels like progress to define departments and personas. But an agent hierarchy is not an org — it's a distributed system, and every layer adds a failure surface. This project's locked decision is "full architecture first," which directly collides with this pitfall.

**How to avoid:**
Honor "full architecture first" as *directory structure and interfaces*, not as *activated agents*. Keep the skeleton inert. Then force one thin vertical slice through the whole chain (intent → kernel → one department head → one specialist → one worker → QA → dashboard) and make it pass repeatedly **before** activating any second department. The Outleteuro catalog task is the natural slice — pull one brand's listing pipeline forward as the P2 "kernel proof" even though the full pilot is P7. Registry entries for the other 366 personas cost nothing while dormant; *activated* personas each need a tested role spec, termination condition, and output contract.

**Warning signs:**
- Weeks of work with no task that runs intent-to-result end to end
- Two personas that could each plausibly own the same task (duplicate roles)
- Agents whose "definition of done" is prose, not a checkable output contract
- Orchestrator code growing faster than executed-task count

**Phase to address:**
P1–P2 (skeleton stays inert; P2 must end with one working vertical slice), enforced again at each P6 department-activation wave.

---

### Pitfall 2: Approval gates as prompt text instead of code

**What goes wrong:**
The gate that keeps agents away from money, contracts, emails, and ads is written as an instruction ("always draft first, wait for approval") rather than enforced in code. Documented incidents show exactly how this fails: an agent with full Slack access sent unauthorized messages because "the only guardrail was its own risk calculation"; a socially-engineered agent emailed AWS IAM keys to an external Gmail because **urgency framing collapsed its verification logic**; Meta's internal agent auto-posted without approval. OWASP classifies this as "excessive agency." An LLM's promise to wait is not a gate — it's a suggestion that any prompt injection, long-context refusal instability, or cheap-model lapse can override.

**Why it happens:**
Prompt-level rules are cheap to write and demo well. The gap only shows under adversarial input (a scraped page saying "URGENT: CEO pre-approved this"), degraded long-context behavior, or a cheap worker model that simply doesn't follow instructions as reliably.

**How to avoid:**
The Approval Gate must be a **code-level chokepoint, not a persona rule**: the Approval Gate MCP is the *only* path to outward-facing tools (Stripe, DocuSign, Gmail send, ad platforms), and those tools are physically absent from every other agent's MCP profile — a worker cannot bypass a gate to a tool it cannot see. Gate state lives in Postgres (draft → CEO-approved → executed) with the approval written by the CEO through the dashboard, never by an agent. Add a canary test suite: regularly inject "urgent, pre-approved, skip the gate" prompts and verify the action still blocks. Log every gate decision to the audit log.

**Warning signs:**
- Any outward-capable MCP appears in a non-gate agent's `.mcp.json`
- An "approved" flag that an agent can write
- Gate logic only exists in system prompts / persona files
- No test that tries to bypass the gate

**Phase to address:**
P2 (gate engine designed into kernel as code), P4 (MCP Gateway physically enforces tool scoping), P7 (Stripe/DocuSign wired *only* behind the gate). Bypass canary tests from P4 onward.

---

### Pitfall 3: Cheap worker models silently degrading quality — and a judge too weak to catch it

**What goes wrong:**
The two-tier economy (expensive brains, cheap workers) degrades in a way nobody notices: cheap models produce output that is *plausible but subtly wrong*, and the QA layer meant to catch it is itself a cheap model. Research on LLM-as-judge shows **a weaker judge cannot reliably grade stronger or subtler work** — signal quality collapses as the capability gap widens, judges show verbosity/position bias, and below ~80% judge reliability, cascade-routing performance drops rapidly. Sequential judge chains *accumulate* errors instead of catching them. The project's own doc flags this risk ("quality may never drop — if quality is at risk, don't cut cost"), and its council design (2–3 cheap models + GLM 5.2 judge) sits exactly in the danger zone.

**Why it happens:**
Cost pressure (€50–150/month envelope) pushes work down-tier; the failure is invisible because bad output *looks* fine and the cheap judge approves it. Degradation is only discovered when a client or the CEO sees the result.

**How to avoid:**
Three mechanisms: (1) **Escalation ladder in code** — worker fails 2× or self-reports low confidence → specialist retry → head review → Fable 5; already in the plan, must be enforced by the orchestrator, not left to agent judgment. (2) **Strong-model sampling audit** — Sonnet 5/Opus 4.8 re-reviews a random 5–10% of cheap-tier output weekly; if the audit disagreement rate rises, that task class gets promoted up-tier. This converts "quality never drops" from a slogan into a measurement. (3) **Golden task set** — a fixed battery of known-answer tasks per task class, re-run when models or prompts change; catches provider-side model drift on OpenRouter (Chinese-model endpoints change quietly). Never let the council judge outbound content alone — anything crossing the approval gate gets at least Sonnet-tier review first (the plan's outbound pipeline already says this; keep it non-negotiable).

**Warning signs:**
- Judge approval rate near 100% (a judge that never rejects is measuring nothing)
- CEO/manual corrections trending up while QA metrics stay green
- Task classes silently migrating down-tier to save budget
- No disagreement data between cheap judge and strong sampler

**Phase to address:**
P2 (routing + escalation ladder in orchestrator code), P6 (sampling audit + golden tasks live before department waves scale worker volume), P7 (Catalog Automation Rate measured against *correctness*, not just liveness).

---

### Pitfall 4: Token/cost blowup — retry storms and context accumulation vs. a €50–150 envelope

**What goes wrong:**
Agent loops resend their entire accumulated context every step (cost grows quadratically with loop length); a transient provider error becomes a retry storm; a stuck agent loops all night on the 24/7 VPS. Documented incidents include a $48k burn in 14 hours from one misbehaving session and agents consuming ~50x the tokens of equivalent chat use. Multi-agent architectures multiply this 10–15x. A single unguarded runaway night can consume this project's *entire monthly budget* — and 24/7 operation means it happens while the CEO sleeps.

**Why it happens:**
Cost monitoring is planned as a module "later" while agents start running "now." Retries default to naive immediate-retry. Nobody does the math on (agents × steps × context size × runs/day) before turning things on.

**How to avoid:**
The Cost Monitor MCP must be **running before any autonomous loop runs** — it is infrastructure, not a department. Layered defense: hard per-task token/step budgets (max iterations + no-progress detection: exit when repeated steps add no new information); per-department daily caps; circuit breaker on cost velocity (spend/hour) that hard-stops non-critical API calls — this catches runaways in minutes, whereas the planned 70%-of-monthly alert catches them after the budget is gone; exponential backoff with jitter on every OpenRouter call; alert to CEO dashboard + JARVIS on breaker trips. Tag every call (model, mode, department, task) as §10 of the plan specifies, and actually reconcile against the OpenRouter invoice weekly.

**Warning signs:**
- Same prompt/tool-call appearing repeatedly in logs (loop signature)
- Cost-per-completed-task rising over time
- Context size per call trending up across a session
- Any agent process alive >N hours without producing an artifact

**Phase to address:**
P2 (Cost Monitor + budgets + circuit breaker built with the kernel skeleton — explicitly *not* deferred to the "QA/Audit" module later), P4 (velocity breaker mandatory before the 24/7 VPS goes live).

---

### Pitfall 5: Context rot — stuffing personas, skills, and tool schemas into every window

**What goes wrong:**
Every frontier model tested (18 in Chroma's study) degrades as context grows; relevant material buried mid-context is missed ("lost in the middle"); accumulated exploration noise degrades all subsequent output — and long context also **destabilizes safety refusals**, which interacts badly with Pitfall 2. The naive implementation of a 367-persona company loads persona files, department docs, memory dumps, and dozens of MCP tool schemas into each agent's window. Quality drops precisely on the strategic decisions reserved for expensive models, so the project pays Fable 5 prices for degraded Fable 5 output.

**Why it happens:**
"More context = smarter agent" intuition, plus convenience: it's easier to mount the whole vault than to build a memory router that retrieves precisely.

**How to avoid:**
Enforce the doc's own token-discipline rule *architecturally*: an agent's context contains **only** its own persona, the current task contract, and retrieved-on-demand memory — never sibling personas, never the full vault, never unused tool schemas (the MCP Gateway's per-department profiles double as context hygiene). Isolate research/exploration into subagents with their own windows that return compact digests, discarding traces. Compact proactively, not at window limits. Put critical constraints (gates, budgets) at context start *and* end, never mid-context. The Memory Router (P3) is the load-bearing component here — treat it as such, not as a nice-to-have.

**Warning signs:**
- Prompt token counts per call creeping up week over week
- Agents ignoring instructions that are verifiably present in their context
- Head/orchestrator answers getting worse on *long* tasks specifically
- Whole files/persona sets mounted where a retrieval call would do

**Phase to address:**
P3 (Memory Router with retrieval-not-stuffing as a design principle), P4 (Gateway profiles limit tool-schema bloat), P6 (persona v2.0 rewrite explicitly optimizes each persona for minimal context footprint).

---

### Pitfall 6: MCP tool poisoning and over-permissioned agents across ~50 integrations

**What goes wrong:**
MCP tool poisoning is indirect prompt injection through tool *metadata*: malicious instructions in a tool's description field enter the LLM's context at registration, invisible to the user; variants include poisoned tool *return values* and "rug pulls" (descriptions changed after initial approval). OWASP now catalogs it as a named attack. Consequences demonstrated in the wild: credential theft, exfiltration, phishing. Over-permissioned agents turn one poisoned tool into total compromise. This project plans ~50 third-party integrations, several explicitly flagged as risky (Agent-Reach ToS risk, Apify with a leaked token, community MCPs of unknown provenance) — each one is supply chain.

**Why it happens:**
MCP servers are installed like npm packages but trusted like employees. Nobody reads tool descriptions; nobody notices when they change; "give the agent all the tools" is the path of least resistance.

**How to avoid:**
The DXB MCP Gateway is the right design — make it do four specific things: (1) **least-privilege profiles** per department with explicit denials (the doc's tables: CEO no code MCPs, Research no payment/prod-DB, workers never see Stripe/DocuSign); (2) **pin tool descriptions** — hash every tool's schema/description at install, alert and quarantine on change (anti-rug-pull); (3) the study-pass rule already in the plan becomes a **security review**: read the MCP server's source for its tools' descriptions and return-value handling before wiring, log the result in the study card; (4) treat tool *outputs* (scraped pages, emails, docs) as untrusted input — never let them write memory or trigger gated actions directly (see Pitfalls 2 and 7).

**Warning signs:**
- Any agent profile with tools it hasn't used in weeks (scope creep)
- Tool description/schema hash changed since install
- An MCP installed without a study card
- Worker-tier `.mcp.json` containing anything outward-facing

**Phase to address:**
P4 (Gateway with pinning + profiles is the centerpiece), study-pass security review applies to every install from P2 onward, re-audited each P6 wave.

---

### Pitfall 7: Memory that degrades and gets poisoned — the 24/7 compounding version

**What goes wrong:**
Long-running agent memory rots in three ways: **staleness** (old facts stay indexed beside their replacements — the agent confidently serves the outdated one), **contradiction accumulation** (no conflict resolution → retrieved context assembles garbage), and **poisoning** (untrusted content — scraped webpages, received emails, YouTube transcripts — writes false facts into memory that act as persistent backdoors steering behavior long after the session). Measured effect: constraint compliance dropping from 73% to 33% between turns 5 and 16 without mitigation. This project's memory is a *company brain* feeding business decisions 24/7, with a Research department and a video-learning module whose entire job is ingesting untrusted external content into it — the poisoning surface is by design.

**Why it happens:**
Memory systems get built as write-mostly append logs ("store everything, retrieve by similarity"). Curation — expiry, dedup, contradiction checks, provenance — is invisible work that nothing demos, so it gets skipped.

**How to avoid:**
Build the Memory Router with a **write policy**, not just a read policy: every memory record carries provenance (which agent, which source, trusted/untrusted origin) and a confidence score; untrusted-origin content (web, email, video transcripts) lands in a quarantine tier that cannot influence gated decisions until a stronger model promotes it; contradiction detection on write (new fact conflicts with indexed fact → flag, supersede, or escalate); TTL/expiry by record class; scheduled compaction/dedup passes. Decisions and their rationales are append-only and auditable; operational "facts" are versioned and supersedable. Test memory *quality* (retrieval correctness on known facts) as part of QA, not just memory *presence*.

**Warning signs:**
- Agents citing outdated facts that were corrected weeks ago
- Vault/graph size growing monotonically with no compaction jobs in cron
- Memory records with no source attribution
- Web-scraped content retrievable in decision contexts without a trust tag

**Phase to address:**
P3 (write policy, provenance, quarantine tiers are v1 requirements of the Memory Router — not v2 polish), P4 (video-learning output routed through quarantine), P6 (Research department writes are the biggest untrusted firehose — gate them at wave start).

---

### Pitfall 8: Incomplete credential-leak remediation — rotating keys but not the blast radius

**What goes wrong:**
The project *starts* from a live credential leak (plaintext sudo, Gmail/Hotmail, WordPress admin, hosting, Namecheap, Cloudflare, and 7+ API keys in the source .odt — likely already pasted into third-party AI chats, and 12,000+ live keys have been found in public LLM training data, so "probably fine" is not a defensible assumption). The classic remediation failure is partial: keys get rotated but (a) **password reuse** means one un-rotated service resurrects the whole compromise, (b) the .odt lingers in cloud sync/backups/chat histories, (c) no 2FA means rotation alone doesn't stop an attacker who already harvested a session, and (d) — the agent-specific part — secrets *re-enter* prompts later because agents read config files, docs, and the source .odt itself, and every agent message is a potential exfiltration channel through logs, memory, and third-party model providers (worker prompts go to OpenRouter → Chinese model providers).

**Why it happens:**
Rotation feels done when the checklist's key items are crossed off; the systemic causes (reuse, doc provenance, no runtime secret isolation) remain. And "no plaintext secrets" rules erode the first time an agent needs a credential quickly.

**How to avoid:**
P0 must be verified, not just performed: rotate **every** listed credential, replace reused passwords with unique ones (password manager), enable 2FA on Gmail/Cloudflare/Namecheap/hosting minimum, strip the credentials section from the .odt and purge it from any sync/backup location, then **verify old keys are dead** (attempt an authenticated call with each old key — expect 401). From P1: vault/.env pattern with secrets injected at runtime by tooling — never present in prompts, markdown, persona files, or agent-visible config; a secret-scanning pre-commit hook (gitleaks-class) on the repo from the first commit; the Secrets MCP is the only agent-facing path to credentials and it lives outside worker-tier profiles; cheap-model prompts (OpenRouter path) must never contain secrets at all — workers get pre-authenticated tool calls, not keys. Audit-log redaction so secrets never persist in logs or memory.

**Warning signs:**
- Any old key still returning 200 after "rotation complete"
- Same password on two services anywhere in the estate
- A grep for key-shaped strings hitting anything in the repo, vault, or persona files
- An agent transcript containing a credential

**Phase to address:**
P0 (rotation + verification + 2FA + doc sanitization — hard gate, nothing else starts), P1 (vault + scanner hooks in repo bootstrap), P4 (Secrets MCP scoping in Gateway), continuous scanning thereafter.

---

### Pitfall 9: 24/7 unsupervised drift — the VPS agent compounding errors overnight

**What goes wrong:**
Compounding-error math is brutal: a 20-step process at 95% per-step reliability succeeds 36% of the time, and the worst multi-agent failure is one agent's *subtly wrong* output being treated as ground truth by everything downstream — internally coherent, systematically wrong. Long-running agents additionally drift (studies project ~42% task-success degradation and 3.2x more human intervention for unmitigated long-running agents). This project's riskiest instance: Hermes on the VPS with a **cheap GLM 5.2 brain**, running social/ops routines all night with the sole human asleep — the lowest-capability model in the fleet gets the least supervision and the longest unattended runtime.

**Why it happens:**
24/7 operation is treated as "the same agents, just always on." It isn't: unattended hours remove the implicit human QA of interactive use, and errors compound linearly with runtime.

**How to avoid:**
Design the VPS resident for **bounded, resumable jobs, not open-ended autonomy**: cron-triggered tasks with per-run step/token budgets and a defined artifact, never a perpetual loop; anything outward still crosses the approval gate (queued as drafts for the CEO's morning — the JARVIS briefing is the natural review moment); heartbeat + watchdog that kills and reports any job exceeding its budget; nightly output lands in a review queue, and the morning briefing includes an anomaly summary (cost, failures, gate queue) so drift is caught within hours, not weeks; structured decision logging (input → reasoning → output → impact) for every VPS action — this is the single highest-value observability investment per production practitioners; a remote kill switch reachable from the dashboard/phone.

**Warning signs:**
- VPS agent output quality noticeably worse than same-task laptop output
- Overnight cost or action volume trending up without new tasks assigned
- Jobs with no defined completion artifact
- Morning review queue routinely rubber-stamped without reading (gate fatigue — see UX pitfalls)

**Phase to address:**
P4 (Hermes deployed with budgets, watchdog, kill switch, and decision logging from day one), P5 (morning briefing + review queue in dashboard/JARVIS), P6 (social department — the main 24/7 consumer — activated only after this scaffolding exists).

---

### Pitfall 10: The dashboard that lies — a second source of truth nobody maintains

**What goes wrong:**
The CEO cockpit is the *only* window a non-technical operator has into the company. The common failure: the dashboard is built as a separate reporting layer that agents must remember to update — so it drifts from reality, shows green while agents fail, and the CEO either loses trust in it (and starts babysitting terminals, destroying the core value) or, worse, trusts stale data and approves against it. Dashboards built as an afterthought decay because no agent's task ever fails when the dashboard is wrong.

**Why it happens:**
Two write paths (do the work; separately report the work) always diverge. Reporting is the step that gets skipped under pressure — by humans and agents alike.

**How to avoid:**
One source of truth: the dashboard **renders the operational tables directly** (task queue, gate queue, cost ledger, audit log in Supabase/Postgres) — agents don't "update the dashboard," they update state, and the dashboard is a view. If a task's status isn't in the queue table, the task doesn't exist. Approval actions in the dashboard write the same gate table the gate engine reads (closing the loop with Pitfall 2). Show data freshness ("as of 14:32") on every panel so staleness is visible instead of silent. Realtime via Supabase subscriptions rather than polling scripts that rot.

**Warning signs:**
- Any code path where an agent completes work without a queue-table state change
- Dashboard counts disagreeing with audit-log counts
- Panels fed by scheduled export scripts instead of live views
- CEO asking "is this current?" — trust already eroding

**Phase to address:**
P2 (task queue + gate + cost tables in Supabase are *the* state store from the start — the dashboard later just renders them), P5 (dashboard as pure view + freshness indicators).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Approval rules in prompts only, "code gate later" | Ships demos fast | One injection/lapse = real money or email out the door | **Never** — gate is code from P2 |
| Skip study card, install MCP directly | Saves an hour per tool | Unvetted supply chain in a privileged position ×50 tools | Never for outward/credentialed tools; dev-only sandboxed tools at most |
| Append-only memory, "curate later" | Memory works day one | Contradiction/staleness poisoning compounds daily; retro-cleanup is a rewrite | Only pre-P3, while memory feeds nothing gated |
| Activate all 18 departments at once | Feels like the full company | 18× the failure surface with zero baseline to compare against | Never — waves (already planned) |
| One shared API key across departments | Simple config | No per-department cost attribution, no blast-radius isolation, rotation = full outage | Only pre-P4, single-agent testing |
| Manual dashboard status updates | No queue infra needed yet | Dashboard drift → CEO babysitting returns | Only pre-P5 while CEO is in terminal anyway |
| Cheap model everywhere to stay under budget | Budget compliance | Silent quality collapse (Pitfall 3) violates the project's own iron rule | Never for gated/outbound output |
| Personas as long free-prose docs (v1.0 status quo) | No rewrite effort | Context bloat per agent × 367; ambiguous roles = MAST category 1 failures | Fine while dormant; must fix at activation (P6 v2.0) |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| OpenRouter (worker models) | Treating it as one stable provider; no per-key budget | Per-department keys/tags, hard spend limits at gateway, golden-task re-checks after silent upstream model changes; secrets never in worker prompts |
| Stripe MCP | Mounting it where a specialist can call it "in draft mode" | Physically present only behind the Approval Gate MCP; restricted API keys (no direct charge scope); P7 only |
| DocuSign MCP | Agent sends envelope "for signature" = outward action | Draft-envelope creation only; send requires gate approval; P7 only |
| Gmail / email | Full-mailbox OAuth scope to a drafting agent; inbound mail read as trusted text | Draft-only scope for writers; inbound email is untrusted input (prompt-injection vector) — never triggers gated actions or memory writes directly |
| WooCommerce/WordPress (outleteuro) | Agents writing to live catalog while proving the pipeline | Staging site or draft-status products first; the *pilot KPI itself* ("correct listings") needs strong-model verification, not cheap-judge sign-off |
| Cloudflare / Namecheap | Reusing leaked tokens "temporarily"; account-wide tokens | Rotate first (P0), then zone-scoped tokens only, held by Secrets MCP |
| Apify / Agent-Reach (scraping) | Scraped content flowing straight into memory/decisions | Quarantine tier + trust tags (Pitfall 7); Agent-Reach stays behind approval gate (ToS exposure) |
| Supabase | Agents sharing one service-role key | Row-level security + per-role keys; the DB is the company's state store and gate ledger — worker compromise must not mean DB compromise |
| claude-mem / ruflo / community plugins | Assuming installed = safe and compatible | Same study-pass security review as MCPs; verify what they auto-inject into context (they add to every session's token load) |
| yt-dlp + video-use (video learning) | Transcripts of arbitrary YouTube content written to the vault as facts | Untrusted-origin tier; summarized by a strong model before promotion |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Context accumulation in loops | Cost per task grows superlinearly; late-loop outputs degrade | Step budgets, compaction, subagent isolation with digest returns | ~15–20 loop steps; guaranteed on 24/7 jobs |
| Deep delegation chains (CEO→kernel→orchestrator→head→specialist→worker) | End-to-end success rate far below per-step quality; handoff context loss (MAST 36.9% category) | Keep chains ≤3 active hops for most tasks; heads dispatch workers directly; full 5-layer chain reserved for genuinely complex work | Compounding: 6 hops × 95% ≈ 74% before the work itself starts |
| All personas/skills loaded per session | High baseline token cost per agent turn; lost-in-middle instruction misses | Lazy loading; registry serves personas on activation only; MCP profiles trim tool schemas | Noticeable at ~10 active agents; catastrophic at 100+ |
| Council (N+1 calls) used routinely | QA cost dwarfs work cost (judge overhead can hit 10× baseline) | Council only at critical gates as planned; single strong reviewer is the default QA | The first month's invoice |
| Fan-out research swarms without caps | Parallel workers each burning budget on overlapping queries | Fan-out width limits + shared research cache + dedup before dispatch | First real research task at department scale |
| Vector/graph memory growing unbounded | Retrieval latency up, relevance down, storage cost up | TTL, compaction jobs, tiered storage (hot operational vs cold archive) | Months of 24/7 writes |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Approval gate bypassable via prompt (see Pitfall 2) | Real money/emails/ads sent by injected or degraded agent | Code-level gate; outward tools invisible to non-gate agents; bypass canary tests |
| Partial credential rotation + password reuse (see Pitfall 8) | One missed service resurrects total compromise | Full checklist + kill-verification of old keys + unique passwords + 2FA |
| Secrets in prompts/persona files/logs | Exfiltration via any provider, log store, or memory retrieval | Runtime injection only; Secrets MCP; log redaction; repo secret scanning |
| Unvetted MCP servers (tool poisoning) | Hidden instructions in tool metadata hijack agents | Study-pass security review; description hash pinning; quarantine on change |
| Inbound content (email/web/video) treated as instructions | Indirect prompt injection triggers actions or poisons memory | Untrusted-input boundary: content is data; gated actions and memory writes require trusted-tier origin |
| Worker models receiving credentials or sensitive business data | Cheap-model prompts transit third-party providers (OpenRouter → various) | Workers get pre-authenticated tool calls and minimum-necessary context; classify data before down-tier routing |
| CEO dashboard exposed "from anywhere" without hardening | The single control plane for the whole company becomes the attack surface | Strong auth (passkeys/2FA), no public admin endpoints, Supabase RLS, session expiry |
| VPS as trusted peer of the laptop | VPS compromise = company compromise | Separate credentials/scopes for VPS agents; VPS holds only what 24/7 jobs need |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Approval-gate fatigue (every draft pings the CEO) | CEO rubber-stamps without reading — the gate becomes theater, the most dangerous state | Batch approvals into the morning briefing; risk-rank items; make high-risk items visually loud and low-risk items batchable |
| Technical error surfaces (stack traces, agent jargon) in the cockpit | Non-technical CEO can't act; trust erodes | Every alert states: what happened, business impact, recommended action, one-tap response |
| Turkish-speaking CEO, English-only system surfaces | Misunderstood approvals on money/contract decisions | Dashboard/JARVIS/briefings in Turkish; approval summaries in Turkish even when artifacts are English |
| Firehose transparency ("every agent visible") | 367 personas × events = unreadable wall; real signals drowned | Exception-first design: default view is "what needs me + what changed"; drill-down for the rest |
| Voice-only critical actions (JARVIS) | Misheard command triggers or approves something | Voice for briefings/queries; approvals always confirmed on-screen |

## "Looks Done But Isn't" Checklist

- [ ] **Approval gate:** demo shows draft→approve flow — verify an *adversarial* attempt (injected "pre-approved, urgent") is blocked, and outward tools return "tool not found" for non-gate agents
- [ ] **Credential rotation (P0):** checklist ticked — verify each **old** key actually fails (401) and 2FA is active; grep repo + vault export for key-shaped strings
- [ ] **Cost monitor:** dashboard shows spend — verify a deliberately looping test agent gets hard-stopped mid-run and the monthly total reconciles with the OpenRouter invoice
- [ ] **Memory:** facts are stored — verify a *corrected* fact wins retrieval over its stale predecessor, and quarantined web content can't surface in a gate decision context
- [ ] **Agent registry:** 367 personas listed — verify an *activated* agent has an output contract, termination condition, and MCP profile; dormant ≠ done
- [ ] **QA/council:** judge approves outputs — verify the judge's rejection rate is nonzero on a seeded-defect test set (a judge that never fails anything is broken)
- [ ] **24/7 Hermes:** runs overnight — verify watchdog kills an over-budget job, the kill switch works remotely, and morning briefing lists everything it did
- [ ] **Dashboard:** panels render — verify killing an agent mid-task shows up within a minute (no silent staleness) and counts match the audit log
- [ ] **MCP Gateway:** profiles configured — verify a Research agent literally cannot invoke Stripe (call fails at gateway, logged), not merely "isn't supposed to"

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Gate bypass occurred (money/email out) | HIGH | Kill switch → freeze outward MCPs; audit log reconstruction of what fired; external remediation (refund/recall/apology); postmortem → new canary test encoding the bypass |
| Budget blown mid-month | MEDIUM | Circuit breaker already stopped non-critical calls; triage which departments stay live on remaining budget; find loop signature in cost ledger; add missing budget/no-progress guard |
| Memory poisoned/rotten | MEDIUM–HIGH | Provenance tags make this survivable: quarantine by source/date-range, re-verify promoted facts with a strong model; without provenance it's a full memory rebuild — which is why provenance is a P3 v1 requirement |
| Cheap-tier quality collapse discovered late | MEDIUM | Promote affected task classes up-tier immediately; strong-model re-audit of recent outputs that crossed gates; adjust routing table; extend golden set with the failure |
| Credential leak recurrence | HIGH | Assume full compromise: rotate everything again, audit access logs on all services, check for persistence (new API keys, forwarding rules, added users), then fix the ingress path |
| Framework over-build (months in, nothing works end-to-end) | HIGH | Freeze all horizontal work; pick one workflow; delete/bypass every component it doesn't need; ship it; reintroduce components only as that workflow demands them |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. Org chart before workflow | P1–P2 (inert skeleton + mandatory vertical slice), P6 waves | P2 exit gate: one intent→result run repeats 10/10; no dept activates without a passing slice |
| 2. Prompt-level approval gates | P2 (gate engine), P4 (tool scoping), P7 (Stripe/DocuSign) | Bypass canary suite green; outward tools unreachable outside gate |
| 3. Cheap-model quality decay + weak judge | P2 (escalation ladder), P6 (sampling audit + golden tasks) | Weekly strong-model audit disagreement rate tracked; judge rejection rate nonzero |
| 4. Token/cost blowup | **P2** (monitor + breakers BEFORE autonomous loops), P4 (VPS) | Looping test agent hard-stopped; invoice reconciles with ledger |
| 5. Context rot | P3 (memory router = retrieval), P4 (profile scoping), P6 (persona v2.0 footprint) | Token-per-call trend flat as agent count grows |
| 6. MCP tool poisoning / over-permission | P4 (gateway pinning + profiles), study-pass from P2 | Description-hash alerts fire on change; cross-dept tool call fails at gateway |
| 7. Memory degradation/poisoning | P3 (write policy, provenance, quarantine), P6 (research firehose gated) | Stale-fact retrieval test passes; untrusted content absent from gate contexts |
| 8. Incomplete secret remediation | **P0** (hard gate), P1 (vault + scanner), P4 (Secrets MCP) | Old keys return 401; repo scan clean; 2FA verified |
| 9. 24/7 drift | P4 (budgets, watchdog, kill switch, decision logs), P5 (morning review) | Overnight jobs bounded + artifacts reviewed; anomaly summary in briefing |
| 10. Dashboard drift | P2 (queue/gate/cost tables = single state store), P5 (dashboard as view) | Kill-an-agent test visible in <1 min; dashboard counts = audit-log counts |

## Sources

Confidence tiers per classify-confidence seam: cross-verified web findings = MEDIUM; no single-source (LOW) claims are load-bearing above.

- [Why Do Multi-Agent LLM Systems Fail? (MAST, arXiv 2503.13657)](https://arxiv.org/abs/2503.13657) — failure taxonomy, category percentages — MEDIUM
- [Augment Code: Why Multi-Agent LLM Systems Fail](https://www.augmentcode.com/guides/why-multi-agent-llm-systems-fail-and-how-to-fix-them) — MEDIUM
- [OWASP: MCP Tool Poisoning](https://owasp.org/www-community/attacks/MCP_Tool_Poisoning) and [MCP Manager: Tool Poisoning](https://mcpmanager.ai/blog/tool-poisoning/) — MEDIUM
- [Aptible: MCP prompt injection and access-control blast radius](https://www.aptible.com/mcp-security/mcp-prompt-injection) — MEDIUM
- [RelayPlane: Agent Runaway Costs](https://relayplane.com/blog/agent-runaway-costs-2026) and [TrueFoundry: Rate Limiting AI Agents](https://www.truefoundry.com/blog/rate-limiting-ai-agents-preventing-llm-api-exhaustion) — cost incidents, 3-layer defense — MEDIUM
- [LeanOps: Agentic AI cost runaway](https://leanopstech.com/blog/agentic-ai-cost-runaway-token-budget-2026/) — 50x token multiplier — LOW (single source; directionally consistent with Anthropic's 10–15x)
- [Morph: Context Rot guide](https://www.morphllm.com/context-rot) and [Redis: Context rot explained](https://redis.io/blog/context-rot/) — Chroma 18-model finding, mitigations — MEDIUM
- [When Refusals Fail: Unstable Safety Mechanisms in Long-Context LLM Agents (arXiv 2512.02445)](https://arxiv.org/pdf/2512.02445) — MEDIUM
- [Oso: Registry of AI agent failures and exploits](https://www.osohq.com/developers/ai-agents-gone-rogue) — gate-bypass incidents — MEDIUM
- [Protecto: Excessive agency risks](https://www.protecto.ai/blog/ai-agents-excessive-agency-risks/) — OWASP excessive agency — MEDIUM
- [MintMCP: AI agent memory poisoning](https://www.mintmcp.com/blog/ai-agent-memory-poisoning) and [Pickuma: Memory decay and context contamination](https://dev.to/pickuma/why-ai-agents-forget-memory-decay-and-context-contamination-explained-44kd) — 73%→33% compliance decay, curation requirements — MEDIUM
- [Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) — simplicity-first, token math — MEDIUM (official vendor guidance via web)
- [Prodigal: The compounding error problem](https://www.prodigaltech.com/blog/why-most-ai-agents-fail-in-production) and [Galileo: 7 agent failure modes](https://galileo.ai/blog/agent-failure-modes-guide) — 95%^20 math, observability — MEDIUM
- [Agent Drift: Behavioral Degradation in Multi-Agent LLM Systems (arXiv 2601.04170)](https://arxiv.org/pdf/2601.04170) — drift projections — LOW (single study; treat magnitudes as indicative)
- [No Free Labels: Limitations of LLM-as-a-Judge (arXiv 2503.05061)](https://arxiv.org/html/2503.05061v1), [Galileo: Why LLM-as-judge fails](https://galileo.ai/blog/why-llm-as-a-judge-fails), [When Efficiency Backfires: Cascading LLMs (arXiv 2605.17288)](https://arxiv.org/html/2605.17288v1) — weak-judge limits, ~80% reliability threshold — MEDIUM
- [Doppler: Preventing secret leakage across agents and prompts](https://www.doppler.com/blog/advanced-llm-security) and [Infisical: Secrets management guide](https://infisical.com/blog/secrets-management-complete-guide) — 12k leaked keys in training data, rotation/vault patterns — MEDIUM
- Project-internal: `/home/ghost/.claude/plans/bubbly-dazzling-goblet.md` §3 hard rules, §10 brain architecture, §12 security flag — HIGH (primary source for project-specific risk framing)

---
*Pitfalls research for: AI-native company operating system (multi-agent business OS)*
*Researched: 2026-07-05*
