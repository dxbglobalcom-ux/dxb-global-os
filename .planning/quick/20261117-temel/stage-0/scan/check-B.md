# 0b-B — scan-3 (B43, B64, B83, B84) checked at the source

Sources: scan `.planning/quick/20261117-temel/stage-0/scan/scan-3.md`; PLAN `.planning/quick/20261117-temel/PLAN.md` (read 40-880);
rows `.planning/board-rows/B43.md`, `B64.md`, `B83.md`, `B84.md` at cited lines; `.planning/quick/20261017-studio-platform-hub/FINAL.md`;
`.planning/quick/20261012-b64-is-akisi/PLAN.md`; `reorder/ORDER.md` 1-8, 68-86, 138-184, 234-242; `scripts/governance/ceo-approvals.json:2906-2912`;
`packages/orchestrator/src/critical-gate.ts:14-22`; `db/migrations/20260726015000_w25_halal_birth_refusal.sql:28,133`.

## Count
scan-3 findings in scope: NEEDS 4+2+3+2 = 11; UNSURE 8+5+3+4 = 20; contradiction bullets B43 2, B64 4, B84 2 = 8, of which
scan-3.md:71 ("None between B43.md and ORDER") is not a finding -> 7. B83 has no contradiction bullet (scan-3.md:148 "None").
Total 38 = 38 rows below. Command: awk over scan-3.md section headers (NEEDS/UNSURE/Contradictions per "## Bxx") gave
B43 4/8/2, B64 2/5/4, B83 3/3/0, B84 2/4/2.

## Table
| # | Row · finding | Verdict | Evidence (row) | PLAN | Stage |
|---|---|---|---|---|---|
| N1 | B43 RunPod rented lane, off by default | ALREADY-CARRIED (later, cheap) | B43.md:145 "status: planned · gate: his word"; FINAL.md:197 keeps it out of the hub | M :320-323 a new lane is a named foundation change; F :181 machine-work capacity is a setting; rent = gated money out H; cost = J :258-260 | at B43's rank |
| N2 | B43 Codex image tool on ChatGPT subscription | ALREADY-CARRIED | B43.md:53 "the image tool in Codex on his ChatGPT subscription first" | G :195-196 "the auditor's command-line run" IS the Codex CLI in ChatGPT-subscription mode with the company's own Codex home (critical-gate.ts:14-22); C :118 allow-list; J :256 quota not euro. Wording names it by role only | — |
| N3 | B43 membership / prepaid balance not per request | CONFIRMED-NEED | B43.md:78 "never charged to one job or one film"; FINAL.md:171 low balance stops new cards; B64 plan :85-87 Hermes 100 $ credit | J :258-260 expense row "company, job or line"; N.6 :443 "one posting per charge", :445 top-up = money out — which event is the posting, and a cost with no job/line, unsaid | stage 3 (money records) |
| N4 | B43 halal screen on studio prompts and outputs | CONFIRMED-NEED | B43.md:102 "scope: prompts, asset picks..., cuts, and every new engine's output. It is foundation-grade" | H :234-235 only "steps of the seat runner"; studio hands are parts not seats (D :134); nothing on artifact versions (D :137-141) | stage 2 (checks as parts) |
| N5 | B64 budget thresholds 70/90 warn, 100 stops new | CONFIRMED-NEED | B64 plan :71-72 (plan approved, :12 CEO-OK 2026-10-26); ceo-approvals.json:2910 conditions: "COST_CONTROL A5: alerts, new non-critical work stops at 100 % ... unchanged" | J :263-264 only "per-job cost line warns and never stops"; F :178 start limits per lane only | stage 3 (budgets) |
| N6 | B64 halal screen + recorded refusal at birth | CONFIRMED-NEED (halal half only) | B64.md:174 "calls one function that runs the halal screen ... and records each refusal"; today's birth refusal exists: w25_halal_birth_refusal.sql:28,133 | D :126-128 birth door names no screen; grep halal = :234, :666 only | stage 1 (birth door) |
| N7 | B83 revenue row lacks the line | CONFIRMED-NEED | B83.md:43 "measure realized net profit ... grow or stop" per line | J :252 revenue rows "company, client, job" — expense rows have "job or line" (J :259); B :93 books sale on the channel's account | stage 3 |
| N8 | B83/B84 one approval for whole outreach campaign | CONFIRMED-NEED (no contradiction) | B84.md:64 "approved by him once (niche, city, message template, daily cap), not message by message"; B83.md:118 "Stops at him: the outreach campaign (once)" | H :213-215 approval per request+hash; but N.6 :431-437 already makes one gated card cover many requests — the shape exists, only for paid generation | stage 2 (built with the card); used at B83/B84 rank |
| N9 | B83 client's own staff on the client's panel | REAL-CONTRADICTION (tension) | B83.md:128 "one take-over button"; :129 "a card per lead on the client's panel" | B :101-102 "not built now — there is one human; the columns ... are there"; C :106 kind 'external'. ORDER:83 builds H7 before the key | CEO; build at H7's rank |
| N10 | B84 boxed third-party products (OpenSEO etc.) | CONFIRMED-NEED | B84.md:89 OpenSEO "Core, installed"; :90 "its scheduler is sealed inside it ... scheduled checks spend by themselves" | M :292-295 harmony rule: no timer of its own, no credential, no money record outside J — no class for a boxed product; N.5 :417-418 covers a client approval inside one | later (before the first boxed product serves a job); sentence now |
| N11 | B84 outreach campaign = B83 N2 | = N8 | B84.md:64 | as N8 | — |
| U1 | B43 P4 job born under active project | NOT-FOUNDATION (later, cheap) | B43.md:108-110 "Working practice, not his law ... None of the eight carries his separate word" | §5 row 28d :684 projects inventory first; nullable project ref on jobs = versioned change. Note: J :263 budget chain "company → project or employee → job" while D :123-125 jobs carry no project | — |
| U2 | B43 master archive checksums + off-machine copy | NOT-FOUNDATION (B72's) | B43.md:151 "status: planned · gate: his word" | D :137 hash+path carried; §11 :871 backup repair is B72's; B72.md names no media/artifact path (grep) | — |
| U3 | B43 "Diğerini seç" among card alternatives | ALREADY-CARRIED | FINAL.md:159 | H :213-215 another alternative = another hash = its own request his click approves | — |
| U4 | B43 local non-LLM models (whisper, SeedVR2, SAM) | ALREADY-CARRIED | B43.md:164 | D :134 studio-hands parts; N.6 :428-429 usage in seconds on local card; :444 no money. Ruler scope (G :200-201) to be worded when written | stage 2 ruler |
| U5 | B43 operator's invisible screen as lane | NOT-FOUNDATION | B43.md:159 "Plan first; no code before his yes" | F :181 capacity a setting; M :322 new lane named | — |
| U6 | B43 revision round against client's retainer | NOT-FOUNDATION | B43.md:152 planned, gate his word; FINAL.md:197 L10 out of hub | N.10 :485-487 rounds in standard contract, deal → job (many jobs per deal not excluded); count is a query | — |
| U7 | B43 client reference store, read by both studios | ALREADY-CARRIED | B43.md:299 "Today the reference-set rule ... exists and no store"; B84.md:351 | M.4 :306-309 office records with company+client keys; C :114 "or is shared by grant" | at B43 rank |
| U8 | B43 surface candidates (OGAI, Freefield, InvokeAI) | NOT-FOUNDATION (trial first) | B43.md:175-176, :241 "the trial, at B43's rank" | M :292-295, :320; if taken falls under N10's sentence | — |
| U9 | B64 Jev per-decision routing record | NOT-FOUNDATION (later, cheap) | B64.md:167 workbook idea, "Stops at him: nothing" | G :196-198 run before call, attempt row; extra fields are a record under the menu's subject | — |
| U10 | B64 rewind from step 3 | NOT-FOUNDATION (later, cheap) | B64.md:173 workbook item | D :137-138 versioned artifacts, "a changed version is checked again"; a reopen move is a row in part_transition's table | — |
| U11 | B64 meeting room, ~10 masters | ALREADY-CARRIED | B64 plan :128 decision 2 "Hamza ortada" | N.3 :379-380 Hamza the counterpart; each turn carries speaker's principal; drawing is his eye | — |
| U12 | B64 Workspace CLI, where it runs | ALREADY-CARRIED | B64.md:94, :192 (fallback Google APIs) | C :115 no agent credential; N.5 :403-414 intake / executor trusted read | — |
| U13 | B64 Hermes's own model calls | NOT-FOUNDATION (after the key) | B64 plan :85-88 | G :195 "every carrier" + D :134, G :199-200 name Hermes; §11 :871; its 100 $ credit is N3's case | step 9 |
| U14 | B83 call-tracking forwarder | NOT-FOUNDATION | B83.md:102 "Use:" idea | N.5 records; a fixed forwarding answer is the reader's ack; webhook exposure = server row :424 | — |
| U15 | B83 answer within 60 s when lane full | NOT-FOUNDATION (measure) | B83.md:69 build order | F :178-182; a lane of its own (M :322) or claim order — cheap; measure stage 2 | stage 2 measure |
| U16 | B83 desk inside ChatGPT, outside callers book | NOT-FOUNDATION now (trial; if taken it is a new door) | B83.md:74 "Dene ... Demand is not measured" | C :115-117, N.5; M :320-323 names it if taken | — |
| U17 | B84 seat's on-demand credentialed read | CONFIRMED-NEED | B84.md:251 GA4 run_report, :252 GAQL, :89 DataForSEO, :113 image API keys | C :115 no agent credential; N.5 :405-406 readers call only three doors; :413-414 executor read only for write-capable keys; return path to the run unsaid | stage 2 (three carriers) |
| U18 | B84 live preview and test database | NOT-FOUNDATION | B84.md:274 | M.3 office tooling; M.5 :310-312 deploy as outward handler | — |
| U19 | B84 operator real screen, browser creds | NOT-FOUNDATION (owned by A11/B41) | B84.md:58 | H :221-223 and §8 item 9 leave it open on purpose | — |
| U20 | B84 client reference store = U7 | = U7 | B84.md:351 | as U7 | — |
| C1 | B43 scanner in pg-boss | ROW-STALE | FINAL.md:98, :175 | F :190, N.4 :399 (2026-11-22, his yes :855); §10 d.4 :843 | — |
| C2 | B64 cap refusing at birth | ROW-STALE | B64.md:174 workbook idea, "Stops at him: nothing" | §10 d.3 :840-842, F :178 limits starting, at the claim | — |
| C3 | B64 persona door for new specialist | ROW-STALE | B64 plan :133 (2026-10-26) | §10 d.6 :846-850 (2026-11-22) names "the persona door"; B64 decision 6 not listed by name | — |
| C4 | B64 1,000 $ first-delivery rule | ROW-STALE (already named) | B64 plan :58 | ORDER :237-238; N.9 :475-477 | — |
| C5 | B64 step 6 rests on N.10 (stage 4) | MISREAD | B64 plan :66 "İmza, ödeme ve mail gönderme B05'e bağlıdır" | ORDER row 6 :150 already says N.10 links read at stage 4 for B05's part | — |
| C6 | B84 jobs through pg-boss | ROW-STALE | B84.md:65, :261 | F :190, N.4 :399 | — |
| C7 | B84 placement vs "offices from stage 2 on" | MISREAD | — | ORDER :84 "after B64's machine"; :179 "from stage 2 on" is the earliest start, B43 first | — |

## Proposed sentences (CONFIRMED-NEED)
- N3 → §2 J money-out bullet: "A membership, a subscription fee or a balance top-up is one expense row when it is paid, on the company and the office or line it serves, with no job; a call that draws on prepaid credit or a membership records usage on its attempt and books no second amount." Stage 3.
- N4 → §2 H last bullet: "The halal screen also runs as a mandatory check on every artifact version before it is delivered or published, and on the arguments of every studio-hands part — prompts, picked assets, cuts; an unreadable screen fails the check." Stage 2.
- N5 → §2 J budgets bullet: "A budget carries the thresholds he sets once: at 70 % and 90 % he is warned, at 100 % no new non-critical job or part starts under it, and nothing running is cut (COST_CONTROL A5, kept by his word of 2026-10-28); which work is critical is his policy." Stage 3.
- N6 → §2 D birth-door bullet: "`job_open` runs the halal screen on the brief before anything is born; a hit refuses the birth and records the refusal with its source and key." Stage 1.
- N7 → §2 J revenue bullet: "Revenue rows also carry the line and the channel a sale came through, so a line's realised net is computed from its own rows." Stage 3.
- N8 → N.6: "The card's shape is not only for paid generation: an outreach campaign is one gated request naming the template's hash and a daily cap, and each message is its own request that joins it, refused past the cap or on a changed template." Stage 2.
- N10 → §2 M harmony rule: "A boxed third-party product an office runs (OpenSEO, Chatwoot, OpenProject) sits behind the tool door: its own store holds only its craft data, its keys sit with the intake or the executor, its own spending is bounded by a balance he tops up and booked under §2 J, and the ruler names each one as a change to the foundation." Later, written now.
- U17 → N.5: "A seat's on-demand read that needs a credential is a request classified as reading, run by a read handler in the intake (read-only key) or the executor (write-capable key), and its answer returns to the run as a desk entry; the key never enters the agents' host." Stage 2.

## REAL-CONTRADICTION
- N9. Row: B83.md:128-129 the client's panel with a take-over button (H7, built before the key, ORDER:83). Plan: B :101-102 "there is one human" (2026-11-22, newer) — deferral, columns kept, C :106 'external'. Also CLAUDE.md "One human in it: the CEO".
  CEO question: may a client's own staff sign in to a surface the holding serves, see only that client's leads and take over a conversation?
  Recommendation: yes, as an 'external' principal bound to one client, built at H7's rank, not in B85 — the holding sells to clients of every size and a client panel is a product; the deferral already keeps it cheap; if the H7 trial takes Chatwoot, the sign-in lives in that box and N10 governs.

## Not checked / UNVERIFIED
- Whether `codex exec` can call the image tool unattended (N2) — not run.
- Whether B84 decision 9 (outreach once) carries his own word: the table header (B84.md:52) registers only decisions 3-6, 12, 14.
- §2 M has no CEO-OK marker of its own (N's is at :344); I treated M as the plan's newest text, not checked against the ledger.
- ORDER.md other lines, REVENUE_ENGINE §3, COST_CONTROL A5 text itself (only the approval's conditions read), B72.md beyond a grep.
