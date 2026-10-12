## Research report: how work should flow through a multi-company holding run by AI agents

The answer is that a real holding of this shape works like this. The centre keeps strategy, capital, decision rights and quality standards. Every piece of work has a written brief and one owner. A dedicated scheduling seat (the agency "traffic" role) moves the work. Finished output passes several review rounds. The top executive sees exceptions and a weekly scorecard, not every task.

**Tool limits during this run:** Exa returned "free MCP rate limit" and Tavily returned "monthly keyless … limit". I did not pay or answer Tavily's bonus questions. All searching used the parallel search plus `fetch.py`, and every page cited below was actually fetched and read. Raw files are in `/tmp/claude-1000/-home-dxb-DxB-Global-OS/98d5669e-f759-4609-9b7d-3e469b1b84cd/scratchpad/b64/r-holding-ops/pages{1,2,3}/`.

### A. Sources examined

| # | Source | Date | URL |
|---|---|---|---|
| S1 | McKinsey, "Acting where it makes a difference: the corporate center that can flex" | 2022-05-03 | mckinsey.com/capabilities/operations/our-insights/acting-where-it-makes-a-difference-the-corporate-center-that-can-flex |
| S2 | McKinsey, "Why corporate-center efficiency matters" | 2019-02-28 | mckinsey.com/…/why-corporate-center-efficiency-matters |
| S3 | Menz, Kunisch, Collis, "What Do We Know About Corporate Headquarters?", HBS WP 14-016 | 2013-08-19 | hbs.edu/ris/Publication Files/14-016_….pdf |
| S4 | Bain, "Winning Operating Models That Convert Strategy to Results" | 2026-10-07 | bain.com/insights/winning-operating-models-that-convert-strategy-to-results/ |
| S5 | Bain, "RAPID Decision Making Framework" | 2023-10-13 | bain.com/insights/rapid-decision-making/ |
| S6 | IPA / BetterBriefs / Ritson, "The best way for a client to brief an agency" | 2022-07-04 | aaaa.org/wp-content/uploads/IPA-Best_way_for_client_to_brief_agency.pdf |
| S7 | 4A's + ANA, "Decoding Compensation Models" | 2024-04-10 | aaaa.org/wp-content/uploads/4As-ANA-Decoding-Compensation-Models-and-Implementing-the-Right-Model.pdf |
| S8 | Function Point, "Traffic Manager" persona | 2025-02-12 | functionpoint.com/blog/running-a-successful-ad-agency-the-traffic-manager-part-4 |
| S9 | Function Point, "Role of production and traffic managers" | undated | functionpoint.com/blog/traffic-managers-production-managers-roles-at-agency-2 |
| S10 | Sidekick Accounting, "Retainer vs Project Billing" | 2026-03-26 | sidekickaccounting.co.uk/insights/agency-billing-models-project-retainer |
| S11 | Haus Advisors, "Agency Retainer vs. Project" | 2026-06-18 | hausadvisors.com/blog/agency-retainer-vs-project-economics |
| S12 | "How to Succeed in MrBeast Production" (leaked internal handbook) | 2024-09 per Fortune 2024-09-26 | cdn.prod.website-files.com/…/How-To-Succeed-At-MrBeast-Production (2).pdf |
| S13 | Storyblocks, "Video production timeline" | 2025-05-09 | storyblocks.com/resources/blog/video-production-timeline |
| S14 | Working Backwards (Bryar/Carr), "The Amazon Operating Cadence" | 2026-06-29 | workingbackwards.com/concepts/amazon-operating-cadence |
| S15 | Biovest Delegation of Authority Policy, SEC exhibit 99.6 | 2004 | sec.gov/Archives/edgar/data/704384/000119312504051976/dex996.htm |
| S16 | McKinsey, "The agentic organization" | 2025-09-26 | mckinsey.com/…/the-agentic-organization-contours-of-the-next-paradigm-for-the-ai-era |
| S17 | Anthropic (K. Swanson), "Building effective human-agent teams" | 2026-06-24 | claude.com/blog/building-effective-human-agent-teams |
| S18 | Claude/Asana, "Agents you can coach: how Asana builds human-agent teams" | 2026-09-29 | claude.com/resources/articles/agents-you-can-coach-how-asana-builds-human-agent-teams-with-claude |
| S19 | IBM Think, "How to manage AI agents without wrecking your business" | 2026-08-18 | ibm.com/think/news/how-to-manage-AI-agents |
| S20 | HBR, Campbell/Goold/Alexander, "The Quest for Parenting Advantage" | 1995-03 | Paywalled: title and authors only |

### B. Findings

**Holding vs operating company**
1. PRACTICE · McKinsey names five corporate-centre archetypes: financial holding (hands-off, invest/divest), operator (runs shared operations), strategic driver (sets strategy and policy, leaves execution to the units), dynamic entrepreneur (builds selected central infrastructure, manages the portfolio aggressively) and adjustor (changes its steering per unit and maturity). · S1 sections "Are you set up to succeed?", "What does it mean to be an adjustor?"; S2.
2. PRACTICE · The strategic driver stays the most common archetype. The shift is toward adjustors, which act hands-off for some units, policy-setting for others and hands-on for the rest. · S1 "Time for a new model?"
3. RESEARCH (literature review) · Headquarters has three roles: obligatory company functions, centralised services, and value creation (allocating and deploying corporate resources). · S3 pp. ~8-9, lines 355-366 of the extracted text.
4. RESEARCH · Only about 9% of companies are sustained value creators, and 85% name the organisation, not strategy, as the barrier. Unilever's switch to five business groups, each owning its P&L end to end, sped up decisions. · S4 "At a Glance", Unilever case.
5. PRACTICE · Bain's operating-model practices include stitching "seams" where P&L and accountability naturally sit, and deploying mission-driven teams for change work alongside the P&L lines. · S4 "four best practices".

**Decision rights and approvals**
6. PRACTICE · RAPID roles are Recommend, Agree, Perform, Input and Decide. There is "only one recommender" and ideally "one decider for each decision". "Agree" is reserved for mandatory (legal/regulatory) vetoes, and the Recommender arrives with a recommendation, not a question. · S5 FAQ section.
7. PRACTICE · A delegation-of-authority policy: the CEO delegates set limits, sub-delegation must be written, related transactions are combined to decide the approval level, and anything not covered goes up a level. · S15 policy text.

**Agency job flow**
8. PRACTICE · The brief is the backbone of the job: objectives, audience and budget, plus success criteria agreed before the work starts. Only 30% of brands have evaluation criteria in place, and about a third of marketing budget is "potentially wasted" through poor briefs (BetterBriefs 2021 survey). · S6 "Build the backbone", "evaluation", "The importance of briefs".
9. PRACTICE · The traffic manager sits between account executives and production: they set the schedule, assign people to each step, check progress daily and reschedule dependent tasks when one slips. · S8 role section; S9.
10. PRACTICE · Without traffic, account executives fight over shared resources and creatives end up prioritising work themselves. Traffic also runs daily and weekly status meetings covering tasks, budget burn and time spent. · S9.
11. PRACTICE · A retainer is a recurring fee for a defined scope or capacity, with an out-of-scope process. A project is a fixed scope with an end. The hybrid model (retainer as base, projects quoted on top) is common. · S10 "Hybrid model".
12. PRACTICE · Retainer meetings and reporting are scoped separately from output-based work. Fixed fee was the most used model (149 agencies surveyed, Q1 2024). · S7 lines 47-49, 528-533.
13. OPINION (advisory firm) · Project risk is idle capacity between jobs (15-25%). Retainer risk is scope creep and client concentration. · S11.

**Content production line**
14. PRACTICE · A video moves through planning → pre-production → production → post → distribution, with fixed review rounds: script, storyboard, rough cut and fine cut. · S13 "Phase 1-5" and timeline bullets.
15. PRACTICE (internal document, leaked) · Three channel metrics drive decisions: CTR, AVD and AVP ("This is what dictates what we do for videos"). · S12 extract lines 136-146.
16. PRACTICE · There is "always someone responsible for everything… if multiple people are responsible… that's a problem". The owner names their bottleneck and checks in daily. "Critical components" (things without which there is no video) get backups and close tracking. · S12 lines 325-345, 454-472, 478-483.
17. PRACTICE · Escalation to the top comes "with context and options", already pre-cleared on budget and creative, because the founder runs "4 channels, 3 businesses, a charity". · S12 lines 428-442.

**Executive view**
18. EXPERT · The weekly business review answers three questions: what customers experienced, how the business performed, and whether it is on track. The annual plan (OP1) is bottom-up per unit, and the CEO decides which initiatives are funded. · S14 WBR and OP1 sections.
19. EXPERT · About 15% of unit goals become top-team goals. The S-Team spent about 75% of meeting time on those goals and on clearing roadblocks, with yellow and red items reported quarterly with recovery plans. Amazon 2010: 452 goals, each with an owner, deliverables and a date. · S14 "S-Team goals".

**AI-native operations, 2026**
20. PRACTICE · At Anthropic, agents hold named roles on one shared roster. Humans set the north star and review output. Autonomy is granted "in proportion to demonstrated reliability". Every task is made verifiable before a human looks, often with one agent doing and another checking. A weekly "lessons & missteps" report is required. Human attention is treated as scarce, so agents batch questions and limit how much each human sees. · S17 sections on roles, north star, autonomy, verification.
21. PRACTICE · At Asana, agents work inside the same graph of owners and dependencies as people. Each has a profile listing purpose, admins, skills and permissions, and its access is bounded by whoever triggers it. Only admins can commit to an agent's memory. All agent activity is visible on the task. An agent reads every at-risk renewal and pushes a daily three-bucket digest to the chief customer officer. · S18.
22. EXPERT (consultancy claim, no data shown) · Two to five humans can supervise 50-100 agents running an end-to-end process. Governance becomes real-time and embedded (critic, guardrail and compliance agents), and "human oversight capacity" becomes the bottleneck. · S16 "Operating model", "Governance".
23. EXPERT/RESEARCH-cited · Managers review "AI employee" output less carefully (a cited study). Accountability for agent output must sit with a named human process owner. A vendor requires an explicit "approve" click on high-stakes actions such as sending a contract. · S19.

### C. Operating patterns that recur

1. **Three kinds of work.** A job with an end (project), a recurring line (retainer or channel) and an evolving mandate (strategy or OP1 that is re-planned). Sources: S10, S11, S7, S14.
2. **Brief first, with done-criteria agreed before work starts.** Sources: S6, S5 (the Recommender aligns criteria with the Decider first), S12.
3. **One owner per job, and one per component.** Sources: S12, S5, S14, S17.
4. **A separate traffic/scheduling seat** that owns capacity, the timeline, daily checks and rescheduling, distinct from the account owner and the makers. Sources: S8, S9.
5. **Staged review gates** (script, storyboard, rough cut, fine cut, client approval), with the brief as the yardstick. Sources: S13, S6, S17 (verification before human review).
6. **Explicit decision rights and money limits, written down; anything uncovered goes up.** Sources: S5, S15, S19.
7. **Lean centre, autonomous units.** The centre keeps capital, strategy, mandatory functions and selected shared services; steering intensity differs per unit. Sources: S1, S2, S3, S4.
8. **The executive sees cadence plus exceptions:** a weekly metric review, a small set of top goals marked red/yellow/green, and escalation that arrives with options. Sources: S14, S12, S18, S17.
9. **Lines adapt from their own data.** CTR, AVD and AVP steer channel content; the WBR leads to "double down or fix". Sources: S12, S14.

### D. Mapping onto an AI holding

| Pattern | Transfers directly | Changes with AI workers | Does not transfer |
|---|---|---|---|
| Three kinds of work | Project, retainer line and mandate as distinct objects with different economics | Recurring lines become scheduled agent runs. Idle capacity between projects stops being a real cost, so retainer-vs-project margin logic (S10, S11) matters only for external client pricing. | — |
| Brief with done-criteria | Fully; criteria must be machine-checkable | More important than with humans, because agents execute literally. S17: "if it's not written down… it doesn't exist." | — |
| One owner | One accountable seat per job and per critical component | The owner can be an agent persona, but S19 and S16 say accountability must trace to a human-set rule and a named human. In this holding that is the CEO, plus the gate. | A human as the "throat to choke" at each level does not transfer; only one human exists. |
| Traffic seat | The role transfers as a dedicated scheduler/dispatcher | Daily check-ins become continuous. The constraint moves from staff hours to model cost, rate limits and the verification queue. | Timesheets and utilisation % lose meaning; token and dollar cost per job replaces them. |
| Review gates | Staged gates per deliverable | Doer and checker can be separate agents (S17). There is a risk of rubber-stamping, since reviewers trust "AI employee" output less critically (S19). | Client approval stays human (the external client). Internal "creative director taste" is UNVERIFIED as reproducible by agents. |
| Decision rights / DoA | A written matrix of limits with escalate-if-uncovered | Enforced in code, not by memory. Autonomy is widened stepwise as reliability is demonstrated (S17). | — |
| Lean centre, autonomous units | Centre = strategy, capital, gate and shared services (finance, legal, the persona/skill library). Companies run their own lines. | An "adjustor" centre is cheap: steering intensity can be set per company in configuration. | Unit managers with their own P&L incentive have no agent equivalent; incentives become config and metrics. |
| Cadence plus exceptions | Weekly review, few top goals, red/yellow/green, escalation with options | Can be daily or real-time (S18 digest). Human attention is the scarce resource, so batch it (S17). | — |
| Data-driven lines | Per-line metrics feed the next brief | Faster loops and more parallel tests | — |

### E. Doubts

- HBR's Goold/Campbell parenting-styles article was paywalled. I rely on the S3 literature review and the McKinsey archetypes instead.
- I found no primary source for the agency "job number" mechanics. That job numbers anchor every agency job is UNVERIFIED from my reading; S9 only implies job tracking through software.
- Several sources have a commercial interest: FP, Sidekick and Haus sell to agencies, and S17/S18 are Anthropic describing its own product.
- S12 is a single leaked founder document, not industry-wide practice.
- McKinsey's "2-5 humans supervise 50-100 agents" figure has no data behind it in the article.
- I found no study with data on content-pipeline performance and no academic work on agency traffic.
- A 4A's retainer figure could not be found beyond the fixed-fee survey line.

### F. Verdict

A real holding of this shape would run as a lean "adjustor" centre over companies that run themselves. The centre keeps the strategy and each company's mandate, the money, the written approval limits, a few shared services and the quality bar. Each company runs two kinds of work side by side: recurring lines (channels, client retainers) on a fixed calendar steered by their own metrics, and one-off jobs. Every job opens with a brief that states success criteria and budget, gets exactly one owner, and is moved by a dedicated scheduling seat that watches capacity and deadlines daily. Work passes staged reviews where the checker is not the maker, and anything over a written limit, or not covered by one, goes up with options. The top executive does not watch tasks. He sees a weekly scorecard, a short list of top goals marked red/yellow/green, a daily exception digest, and only the decisions the rights matrix reserves for him.

With AI workers, the same shape gets faster and more parallel, and capacity is measured in model cost rather than hours. Two things carry more weight than in a human firm: written briefs and machine-checkable done-criteria, and verification. Agent autonomy should be widened only as reliability is proven. Accountability and the approval gate stay with the one human.