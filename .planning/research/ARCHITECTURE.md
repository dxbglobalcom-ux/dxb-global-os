# Architecture Research

**Domain:** AI-native company operating system (multi-agent business OS on Claude Code; sole human = CEO)
**Researched:** 2026-07-05
**Confidence:** MEDIUM overall (patterns cross-verified against official Anthropic/Supabase docs = MEDIUM; DXB-specific composition is reasoned design = flagged where LOW)

This document respects the locked decisions in `/home/ghost/.claude/plans/bubbly-dazzling-goblet.md` (§4 core modules, §6 data flow, §9 locked decisions, §10 brain architecture). It answers three questions: component boundaries, data flow, and build order — plus the consistency question (Claude Code sessions + VPS agent + dashboard over one Postgres).

## The One Sentence That Organizes Everything

**Supabase Postgres is the operating system's bus and single source of truth; the Kernel, Orchestrator, Hermes, Claude Code sessions, and the Dashboard are all just clients of the same schema — agents reach it through MCP tools, humans reach it through the dashboard, and nothing coordinates peer-to-peer.**

Every architectural decision below follows from that sentence. Production reports on durable agent systems converge on the same rule: *"an agent's decision is a hallucination until it is committed to a durable record."* If a task status, approval, cost entry, or decision only exists inside a Claude context window, it does not exist.

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│ INTERFACE PLANE (humans)                                                 │
│  ┌──────────────────┐  ┌───────────────┐  ┌──────────────────────────┐  │
│  │ CEO Dashboard+CRM │  │ JARVIS voice  │  │ Claude Code terminal      │  │
│  │ (Next.js+Supabase)│  │ (voicebox+    │  │ (laptop, subscription;    │  │
│  │  Realtime         │  │  whisper)     │  │  builder + CEO sessions)  │  │
│  └────────┬─────────┘  └──────┬────────┘  └───────────┬──────────────┘  │
│           │ reads/writes DB    │ transcribes → intent   │ intent          │
├───────────┼───────────────────┴────────────────────────┼─────────────────┤
│ CONTROL PLANE (decides, never executes side effects)   │                 │
│  ┌────────▼────────────────────────────────────────────▼─────────────┐   │
│  │ KERNEL — intent parsing, policy, classification (Fable 5/Opus 4.8)│   │
│  └────────┬───────────────────────────────────────────────────────── ┘   │
│  ┌────────▼──────────────────────────┐  ┌───────────────────────────┐    │
│  │ ORCHESTRATOR — decomposition,     │  │ APPROVAL GATE — state     │    │
│  │ dispatch, model routing, council, │  │ machine over `approvals`  │    │
│  │ escalation ladder (§10)           │  │ table; executes NOTHING   │    │
│  └────────┬──────────────────────────┘  └───────────────────────────┘    │
│  ┌────────▼──────────────┐ ┌────────────────┐ ┌────────────────────┐     │
│  │ COST MONITOR (ledger  │ │ AUDIT LOG      │ │ QA / COUNCIL gates │     │
│  │ + envelope enforcer)  │ │ (append-only)  │ │ (N cheap + 1 judge)│     │
│  └───────────────────────┘ └────────────────┘ └────────────────────┘     │
├──────────────────────────────────────────────────────────────────────────┤
│ EXECUTION PLANE (does the work)                                          │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐    │
│  │ VPS (24/7, Hetzner)   │  │ Laptop (control terminal)             │    │
│  │ · queue workers       │  │ · interactive Claude Code sessions    │    │
│  │ · Hermes resident     │  │ · claude -p short background jobs     │    │
│  │   (GLM 5.2 brain)     │  │   (subscription, schema-based)        │    │
│  │ · open-notebook svc   │  │ · Codex CLI (eng second brain)        │    │
│  │ · cron/schedules      │  │                                       │    │
│  └──────────┬────────────┘  └──────────────────┬────────────────────┘    │
│             │  L2 heads → L3 specialists → L4 workers (OpenRouter)       │
├─────────────┼─────────────────────────────────┼──────────────────────────┤
│ TOOL PLANE  ▼                                 ▼                          │
│  ┌────────────────────────────────────────────────────────────────┐      │
│  │ DXB MCP GATEWAY — per-department profiles, default-deny,       │      │
│  │ filters tools/list so agents never SEE denied tools            │      │
│  │  ├── dxb-mcp (ONE server, 8 tool groups: registry, queue,      │      │
│  │  │   memory-router, dashboard, crm, approval, cost, audit)     │      │
│  │  └── external MCPs (supabase, github, playwright, stripe…)     │      │
│  └───────────────────────────┬────────────────────────────────────┘      │
├──────────────────────────────┼───────────────────────────────────────────┤
│ STATE PLANE                  ▼                                           │
│  ┌────────────────────────────────────────────────────────────────┐      │
│  │ SUPABASE POSTGRES — single source of truth                     │      │
│  │  tasks · task_events · agents(registry) · approvals · outbox   │      │
│  │  cost_ledger · audit_log · crm_* · memory_index                │      │
│  │  + Realtime broadcast-from-DB triggers → dashboard             │      │
│  └────────────────────────────────────────────────────────────────┘      │
│  ┌──────────────┐ ┌──────────┐ ┌───────────────┐ ┌──────────────┐        │
│  │ Obsidian     │ │ Graphify │ │ open-notebook │ │ vector store │        │
│  │ vault (files)│ │ (graph)  │ │ (research)    │ │ (pgvector)   │        │
│  └──────┴───────┘ └────┴─────┘ └───────┴───────┘ └──────┴───────┘        │
│         └──────────────┴───── MEMORY ROUTER ─────────────┘               │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Owns (and ONLY this) | Talks to | Typical implementation |
|-----------|----------------------|----------|------------------------|
| **Kernel** | Intent → classified request; policy rules (what may run, what needs approval class); never picks concrete tools | Orchestrator (down), Approval Gate (policy), Audit Log | Prompt + policy table; runs as Fable 5/Opus 4.8 session or `claude -p` job |
| **Orchestrator** | Decomposition into tasks; department dispatch; model-tier routing (§10 table); escalation ladder; council invocation at critical gates | Task Queue (write), Agent Registry (read), Cost Monitor (pre-dispatch check) | Code (TypeScript) + LLM calls; the routing table is data, not prompt text |
| **Agent Registry** | Who exists: dept → head → specialist → worker; persona file path; model tier; MCP profile name; status | Read by Orchestrator, Gateway, Dashboard, HR factory (write) | `agents` table in Postgres, synced from `agency-agents/*.md` frontmatter; persona bodies stay as files |
| **Task Queue** | Task lifecycle: `queued → claimed → running → review → done/failed`; retries; DLQ | Written by Orchestrator; claimed by workers (VPS + laptop); observed by Dashboard | Postgres `FOR UPDATE SKIP LOCKED` — pgmq or pg-boss on Supabase (see Patterns) |
| **Memory Router** | Read-path classification (graph vs vector vs notes vs procedural) + write-path fan-out (extract facts → stores) | All agents (via MCP tool); Obsidian, Graphify, open-notebook, pgvector, claude-mem | Small classifier (cheap model) + adapters; exposed as `memory.*` MCP tools |
| **MCP Gateway** | Identity → tool allowlist enforcement; filters `tools/list`; audit of every tool call | Sits between every agent and every MCP server | Profile-generated `.mcp.json` per department (v1) → real proxy (v2) |
| **dxb-mcp (8 custom MCPs)** | Agent-facing API over the Postgres schema — thin CRUD/state-machine adapters, no business logic | Postgres only | **One MCP server, 8 tool groups** (see Patterns — this is an opinionated consolidation) |
| **Approval Gate** | `approvals` state machine: `draft → pending → approved/rejected → executed`; idempotency keys | Written by agents (draft), decided by CEO (dashboard/voice), read by outbox executor | Postgres table + trigger-guarded transitions; **no code path from "approved" to side effect except the outbox executor** |
| **Cost Monitor** | Per-call ledger (model, tokens, dept, task, mode tag); envelope math; 70% alert / 100% hard-stop | Hooked into every dispatch; Dashboard reads | `cost_ledger` table + PostToolUse/post-call hook + pre-dispatch budget check |
| **Audit Log** | Append-only record of every tool call, transition, decision | Everything writes; nothing updates/deletes | Postgres append-only table (revoke UPDATE/DELETE) |
| **Dashboard + CRM** | Human-facing view + command surface; approval UI; CRM records | Supabase (reads via RLS, writes intents/approvals); Realtime broadcast | Next.js + Supabase Realtime (broadcast-from-DB, not `postgres_changes` — see Patterns) |
| **Hermes (VPS)** | 24/7 resident execution: claims queued tasks for always-on departments, runs cron routines | Task Queue (claim), MCP Gateway (tools), OpenRouter (GLM 5.2 brain) | hermes-agent harness + a thin queue-worker shim |
| **JARVIS voice** | STT/TTS shell only — converts speech ↔ the same intents/queries the dashboard uses | Kernel (intent in), Dashboard API (data out) | voicebox + whisper; **no independent state or privileges** |
| **QA/Council** | Verify critical outputs before approval gate; single strong model default, N+1 council only at critical gates | Orchestrator invokes; verdicts to task_events | Parallel OpenRouter calls + judge (in-house, per locked decision) |

**Boundary rules (what may NOT happen):**
- The Kernel never executes; the Orchestrator never touches external services; only the **outbox executor** performs outward side effects, and only for `approved` rows.
- Agents never message each other directly. Coordination is lead-agent → subagent (within one session) or via the Task Queue (across sessions/machines). This mirrors Anthropic's production finding: subagents get self-contained task descriptions and don't know their siblings exist.
- The Dashboard never holds truth. It renders Postgres and writes intents/approvals into Postgres. If the dashboard dies, the company keeps running.
- JARVIS and the Dashboard are the same client in different clothes — same API, same permissions (CEO identity), zero extra capability.
- Persona files (`agency-agents/`) are content; the Registry table is identity/authority. Gateway decisions key on the table, never on file contents.

## Recommended Project Structure

```
dxb-os/
├── db/                        # THE SPINE — Supabase migrations, in order
│   ├── migrations/            # tasks, task_events, agents, approvals,
│   │                          # outbox, cost_ledger, audit_log, crm_*
│   └── seed/                  # registry sync from agency-agents/
├── packages/
│   ├── shared/                # types, zod schemas, db client, event names
│   ├── dxb-mcp/               # ONE MCP server, 8 tool groups (registry,
│   │                          # queue, memory, dashboard, crm, approval,
│   │                          # cost, audit) — thin adapters over db/
│   ├── gateway/               # profile generator (dept → .mcp.json) + audit
│   ├── kernel/                # intent parsing prompts + policy tables
│   ├── orchestrator/          # decompose, dispatch, routing table, council
│   ├── memory-router/         # read classifier + write fan-out adapters
│   └── outbox-executor/       # the ONLY side-effect runner (approved rows)
├── apps/
│   ├── dashboard/             # Next.js + Supabase Realtime + CRM + approvals
│   └── jarvis/                # voicebox/whisper shell over kernel + dashboard API
├── agents/                    # → agency-agents/ personas (367 files, v1→v2)
├── profiles/                  # generated per-department MCP profiles (gitignored secrets)
├── vps/                       # hermes config, queue-worker shim, systemd units, cron
├── vault/                     # Obsidian vault (memory: notes plane)
└── .planning/                 # planning + research state
```

### Structure Rationale

- **`db/` first-class and top-level:** the schema *is* the OS kernel's data model; every package depends on it; migrations are the only way state shape changes.
- **`packages/dxb-mcp` as one server:** the doc lists 8 custom MCPs; all 8 are thin adapters over the same Postgres schema. Building 8 separate server processes multiplies boilerplate, connection pools, and deploy targets for zero isolation benefit — isolation is the **gateway profile's** job (which tools each department sees), not the process boundary's. One codebase, 8 tool groups, profile-filtered. *(Opinionated consolidation — flag for roadmap discussion, confidence MEDIUM.)*
- **`outbox-executor` as its own package:** the single most safety-critical invariant ("approved before side effect, exactly once") deserves a dedicated, tiny, heavily-tested process — not a code path inside the orchestrator.
- **`profiles/` generated, not hand-written:** per-department `.mcp.json` files are compiled from the Registry table + a policy file, so least-privilege never drifts from the registry.

## Architectural Patterns

### Pattern 1: Orchestrator–Worker (Anthropic production pattern)

**What:** A lead agent parses intent, writes an explicit plan to durable memory, then spawns parallel subagents. Each subagent receives a *self-contained* task description, an output format, and a fresh context window; subagents cannot see or coordinate with each other; they return condensed findings the lead synthesizes.
**When to use:** Everywhere. This is the shape of Kernel → Orchestrator → Heads → Specialists → Workers. Anthropic measured 90.2% improvement over single-agent on research tasks with this pattern.
**Trade-offs:** Token cost multiplies with parallelism (why the §10 model-tier routing matters); vague task descriptions cause duplicate work — task descriptions must carry objective, output format, tool budget, and done-criteria.

**Example (task envelope written to the queue):**
```typescript
// Every queued task is a self-contained envelope — the claiming worker
// needs NOTHING else to execute it.
interface TaskEnvelope {
  id: string;
  department: string;          // routing key → head/specialist
  agent_id: string | null;     // assigned by head, null while queued
  objective: string;           // self-contained: context inlined, no "see above"
  output_contract: string;     // format + done-criteria
  model_tier: "L1"|"L2"|"L3"|"L4";  // from §10 routing table
  budget: { max_tokens: number; max_cost_eur: number };
  approval_class: "none"|"internal"|"outward";  // outward ⇒ result becomes a DRAFT
  parent_task_id: string | null;
}
```

### Pattern 2: Postgres as Coordination Bus (SKIP LOCKED queue + event log)

**What:** The task queue is a Postgres table claimed with `FOR UPDATE SKIP LOCKED`; every state transition appends to `task_events`. No Redis, no broker — Supabase Postgres is already the locked state store.
**When to use:** All cross-machine, cross-session work handoff (laptop ↔ VPS ↔ scheduled). Recommended implementation: **pgmq** (Postgres extension, available on Supabase, SQS-like semantics with visibility timeouts) or **pg-boss** (Node, adds cron/retry/DLQ) — either is fine; pick pg-boss if the workers are Node anyway.
**Trade-offs:** SKIP LOCKED queues top out around 100–200 jobs/sec and generate VACUUM load at high throughput — completely irrelevant at company-OS scale (tens–hundreds of jobs/day). `LISTEN/NOTIFY` reduces wake-up latency but is *not* a delivery guarantee: workers must also poll.

**Example (the claim query every worker runs):**
```sql
UPDATE tasks SET status = 'claimed', claimed_by = $worker_id, claimed_at = now()
WHERE id = (
  SELECT id FROM tasks
  WHERE status = 'queued' AND department = ANY($worker_departments)
  ORDER BY priority DESC, created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
RETURNING *;
```

### Pattern 3: Approval Gate as State Machine + Transactional Outbox

**What:** Outward actions (money, contracts, emails, ads) are never function calls — they are rows. An agent's final act is writing a `draft` row containing *all inputs* of the action. The CEO's approval flips it to `approved`. A separate, tiny **outbox executor** is the only process that performs external side effects, and only for `approved` rows, with an idempotency key checked at execution time.
**When to use:** Every `approval_class = "outward"` task; also useful for internal-but-expensive actions (VPS provisioning, bulk API spend).
**Trade-offs:** Adds one hop of latency to outward actions (correct — that latency is the approval). Requires discipline: no MCP tool with real send/pay capability may exist in any agent profile; agents get `approval.submit_draft` instead, and Stripe/DocuSign/Gmail-send credentials live only in the outbox executor's environment.

**Example:**
```sql
-- approvals: draft → pending → approved/rejected → executed  (trigger-enforced)
CREATE TABLE approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id),
  action_type text NOT NULL,            -- 'email.send' | 'payment' | 'contract' | 'ad_spend'
  payload jsonb NOT NULL,               -- ALL inputs, frozen at draft time
  status text NOT NULL DEFAULT 'draft',
  idempotency_key text UNIQUE NOT NULL, -- prevents double-execution on retry
  decided_by text, decided_at timestamptz,
  executed_at timestamptz, execution_result jsonb
);
-- Executor loop: claim approved rows (SKIP LOCKED), re-check status inside the
-- transaction, perform side effect, write execution_result — one row, one effect, once.
```

### Pattern 4: Gateway = Filtered Visibility, Not Just Blocked Calls

**What:** Least privilege for LLM agents has a special twist: the model can only call tools it *sees*. The gateway must filter the `tools/list` response per agent identity, not merely reject bad calls at invoke time. Registry table = source of truth for identity → profile; default-deny.
**When to use:** From the first department activation. v1 = generated per-department `.mcp.json` profiles (Claude Code's native mechanism — each department session/subagent is launched with only its profile). v2 (when Hermes + SDK sessions multiply) = an actual proxy process that validates each call against the registry and writes the audit row.
**Trade-offs:** Profile-file approach is simple but trusts the launcher; proxy approach is airtight but is another 24/7 process. Start with profiles + audit hooks; graduate to proxy when non-Claude-Code runtimes (Hermes workers) need the same enforcement.

### Pattern 5: Memory Router (read-path classifier over heterogeneous stores)

**What:** Production agent memory has converged on hybrid stores: vector answers "what is similar," knowledge graph answers "what is related and how," notes/documents hold full artifacts, procedural store holds how-tos. A small, cheap classifier on the **read path** routes each query to the right store instead of querying all of them; the **write path** is an extraction pipeline turning task outputs into atomic, scoped facts fanned out to the stores.
**When to use:** This is exactly the doc-mandated Memory Router over Obsidian (notes) + Graphify (graph) + open-notebook (research corpus) + pgvector (similarity) + claude-mem (session memory, stays autonomous as a hook).
**Trade-offs:** The router is a quality-critical chokepoint — misrouting silently degrades every agent. Keep a `memory_index` table in Postgres (what exists where, provenance, freshness) so the router routes on metadata, not guesses; log routing decisions to audit for tuning.

**Example (MCP tool surface — the only way agents touch memory):**
```typescript
// memory.* tool group in dxb-mcp
memory.recall({ query, kind?: "fact"|"relation"|"artifact"|"procedure" })
  // router classifies (unless kind forced) → graph | vector | vault | notebook
memory.commit({ facts: AtomicFact[], artifact?: {path, body}, task_id })
  // extraction already done by the agent's closing step; router fans out
```

### Pattern 6: Broadcast-from-Database for the Dashboard

**What:** Workers and agents write **only** to Postgres; database triggers call Supabase Realtime's broadcast (`realtime.broadcast_changes`); the dashboard subscribes to broadcast channels (`task_events`, `approvals`, `cost_ledger`).
**When to use:** All dashboard realtime. Avoid `postgres_changes` subscriptions except for trivially low-volume tables: each change is checked against every subscriber's RLS, rides logical replication (50–200 ms), and degrades under WAL load; broadcast is <50 ms and scales.
**Trade-offs:** Broadcast requires writing the trigger per table (minutes of work) and defining channel auth; that cost buys the property that **no producer ever needs to know the dashboard exists** — which is the whole consistency model.

## Data Flow

### Request Flow (the doc's §6 flow, made concrete)

```
CEO intent (dashboard / JARVIS / terminal)   client request (CRM)   cron/schedule
        │                                         │                     │
        ▼                                         ▼                     ▼
   KERNEL: classify intent, apply policy, tag approval_class
        │  (writes: audit_log)
        ▼
   ORCHESTRATOR: decompose → TaskEnvelopes; route model tier (§10);
   pre-check Cost Monitor envelope
        │  (writes: tasks[status=queued], task_events)
        ▼
   TASK QUEUE (Postgres) ──SKIP LOCKED──► claimed by:
        ├─ VPS queue worker → Hermes / OpenRouter L3-L4 workers (24/7 depts)
        └─ laptop claude -p / Codex CLI (subscription-tier work)
        │  each worker: registry lookup → persona + MCP profile → execute
        ▼
   QA gate (single strong model; council only at critical gates)
        │  (writes: task_events[verdict])
        ├─ approval_class = none/internal ──► tasks[status=done]
        └─ approval_class = outward ──► approvals[status=draft→pending]
                                              │
                                   CEO approves (dashboard/voice)
                                              │
                                   OUTBOX EXECUTOR (only side-effect path,
                                   idempotency-key checked) → external world
                                              │
        ┌─────────────────────────────────────┘
        ▼
   Results → tasks/crm updated → MEMORY ROUTER commit (facts→graph/vector,
   artifacts→vault/notebook) → DB triggers broadcast → DASHBOARD renders
   Every hop: audit_log append + cost_ledger entry (model, tokens, dept, mode tag)
```

### State Management — the consistency answer

**Question:** how do production systems keep Claude Code sessions, a VPS resident agent, and a web dashboard consistent over one Postgres/Supabase store?

**Answer: they don't synchronize the three runtimes — they demote all three to stateless clients of one schema.**

1. **One writer discipline per fact.** Each table has a clear owner-class: agents write `tasks/task_events/approvals(draft)/memory_index` **through dxb-mcp tools only** (never raw SQL — the MCP layer is where validation, audit, and cost hooks live); the CEO writes `approvals(decision)/intents` through the dashboard; the outbox executor alone writes `executed`.
2. **Claims, not assignments.** Work moves by workers *claiming* queue rows (`SKIP LOCKED`), so a laptop session and the VPS worker can never grab the same task, with zero coordination protocol between them.
3. **Transitions are events.** Status never silently mutates; every transition appends to `task_events` (and `audit_log`). The dashboard's timeline, replays, and debugging all read the event stream — the event log is the primary record, per the durable-execution literature (DBOS / event-log pattern: checkpoint every step in Postgres, no extra broker).
4. **Side effects go through the outbox.** State-change and intent-to-act are committed in one transaction; execution happens later, once, idempotently. A crashed worker leaves either "nothing happened" or "row says done" — never a half-sent email.
5. **The dashboard is a projection.** It subscribes to broadcast-from-DB channels and re-reads on reconnect. It can be closed for a week; nothing breaks.
6. **Sessions are cattle.** Claude Code session JSONL is scratch memory. Anything worth surviving the session is committed via `memory.commit` or a task event before the session ends (claude-mem hooks catch the residue). A killed session = an unclaimed or timed-out task that gets re-queued by visibility timeout — not a lost fact.

### Key Data Flows

1. **Intent flow:** interface → Kernel (classify) → Orchestrator (decompose) → queue. Only flow where LLM judgment creates new work.
2. **Execution flow:** queue → claim → persona+profile load → work → QA → done/draft. Only flow that consumes tokens at scale; Cost Monitor meters every hop.
3. **Approval flow:** draft → pending → CEO decision → outbox → executed. Only flow that touches the outside world.
4. **Memory flow:** task close → extraction → router fan-out (write); agent question → router classify → store (read). Only flow that makes the company smarter over time.
5. **Observation flow:** every write → trigger → broadcast → dashboard; append-only audit + cost ledger underneath. Read-only; can never affect execution.

## Suggested Build Order (dependency graph)

The locked roadmap shape (P0–P7) is dependency-correct with **one refinement**: the Supabase schema + core dxb-mcp tool groups are the true root dependency and must open P2 *before* kernel/orchestrator logic — otherwise the kernel skeleton has nothing durable to write to and gets rebuilt once the schema lands.

```
P0 Vault/secrets ─► P1 Repo+structure
                        │
                        ▼
        P2a DB SCHEMA (tasks, task_events, agents, approvals,
             outbox, cost_ledger, audit_log)          ◄── ROOT DEPENDENCY
                        │
        P2b dxb-mcp core tool groups (queue, registry, audit, cost)
                        │
        P2c Kernel + Orchestrator skeleton (writes through 2b)
             ├──────────────┬──────────────────┐
             ▼              ▼                  ▼
     P3 Memory Router   P4 Gateway profiles  P5 Dashboard/CRM + JARVIS
     (stores + router;  + full Registry      (needs 2a schema + broadcast
      needs 2a index    + VPS/Hermes worker   triggers; buildable in parallel
      table)            (needs registry)      with P3/P4 after 2a is stable)
             └──────────────┴──────────────────┘
                        ▼
        P6 Department activation waves (needs gateway profiles for
           least privilege + dashboard for approval UI + memory for context)
                        ▼
        P7 Outleteuro pilot (needs activated departments + gated
           Stripe/DocuSign/Cloudflare via outbox executor)
```

**Build-order implications for the roadmap:**

- **Schema-first inside P2.** Design `tasks/approvals/audit/cost` tables before writing kernel prompts. Cheap to do, brutal to retrofit.
- **Approvals + audit tables exist from P2** even though the approval *UI* arrives in P5: the state machine must exist before any agent can produce an outward draft, and early phases can approve via a one-line CLI (`dxb approve <id>`) until the dashboard lands. The safety invariant never waits for UI.
- **The outbox executor is P2-scoped** (skeleton) even though its first real credentials (Stripe/DocuSign) arrive P7 — build and test the exactly-once machinery on a harmless action (e.g., write-a-file) early.
- **P3 (memory) and P5 (dashboard) are parallel-safe** after P2a: both are pure clients of the schema. If calendar pressure hits, dashboard read-only views can even start earlier since they only need the schema.
- **P4 before P6 is hard-ordered:** never activate a department without its least-privilege profile existing first (matches the doc's iron rule: tools installed at phase start).
- **Hermes (P4) needs only the queue + gateway,** not the dashboard — the VPS can start doing useful 24/7 work one phase before the CEO can watch it in the cockpit (audit log + CLI cover the gap).

## Scaling Considerations

| Scale | Architecture adjustments |
|-------|--------------------------|
| Pilot (1 human, ~10 active agents, tens of tasks/day) | Everything above as-is; single VPS; pg-boss/pgmq; profile-file gateway. No queue or Realtime bottlenecks exist at this scale. |
| Full holding (18 depts active, hundreds of tasks/day, 24/7 loops) | Gateway graduates from profile files to a proxy process (uniform enforcement for Hermes/SDK runtimes); partition Realtime channels per department; cost ledger rollups via pg_cron. |
| Venture factory (multiple subsidiaries) | Per-venture schema or Postgres RLS tenancy on the same tables; second VPS worker pool; only then consider extracting the queue if job volume approaches ~50+/sec (it won't soon). |

### Scaling Priorities

1. **First bottleneck: token spend, not throughput.** The €50–150 envelope is hit long before Postgres sweats. The Cost Monitor's pre-dispatch check and the §10 routing table are the real scaling mechanisms.
2. **Second bottleneck: CEO attention on approvals.** Batch approvals in the dashboard (approve-all-similar, daily digest via JARVIS) before adding any agent capacity that produces outward drafts.
3. **Third: context/memory quality.** As task volume grows, sloppy `memory.commit` extraction poisons recall; invest in the extraction pipeline before adding departments.

## Anti-Patterns

### Anti-Pattern 1: Peer-to-peer agent chatter

**What people do:** Let agents message other agents directly ("marketing agent asks engineering agent"), or share one long context across departments.
**Why it's wrong:** Anthropic's production experience is explicit — subagents work best with self-contained tasks and no sibling awareness; emergent multi-agent conversation is unpredictable, unauditable, and burns tokens. Cross-department requests that bypass the queue also bypass cost metering, audit, and approval class.
**Do this instead:** Cross-department needs become new TaskEnvelopes through the Orchestrator. The queue is the only inter-agent channel across sessions.

### Anti-Pattern 2: Approval as review, execution as function call

**What people do:** Give agents a real `send_email`/`create_payment` MCP tool and rely on prompts ("always ask the CEO first") or post-hoc review.
**Why it's wrong:** Prompt-level gates fail under retries, injection, and model drift; retrospective review means the money already moved. Retries after worker restarts cause double-execution without idempotency keys.
**Do this instead:** Capability separation: agents can only `approval.submit_draft`; send/pay credentials exist solely in the outbox executor; idempotency key + execution-time status re-check (Pattern 3).

### Anti-Pattern 3: N databases of truth

**What people do:** Task status in the queue, "real" status in the dashboard's store, agent notes in Obsidian, costs in a spreadsheet — then build sync jobs.
**Why it's wrong:** Every sync is a consistency bug factory; the CEO sees stale or contradictory state; agents act on the wrong copy.
**Do this instead:** One schema (Supabase). Obsidian/Graphify/notebook hold *knowledge*, never *operational state*; `memory_index` in Postgres tracks what lives where.

### Anti-Pattern 4: Building all 367 agents (or all 8 MCPs, or the whole dashboard) before the loop closes

**What people do:** Bottom-up construction — perfect registry, perfect personas, perfect cockpit, then try to run a task.
**Why it's wrong:** The system's risk is in the *loop* (intent → queue → execute → QA → approve → record), not in any component. Persona quality is explicitly deferred to the HR factory (locked decision) — the skeleton only needs the envelope format and a handful of working personas.
**Do this instead:** Close the thinnest full loop in P2 (one department, one fake outward action through the whole state machine), then widen per the P0–P7 waves.

### Anti-Pattern 5: `postgres_changes` everywhere + LISTEN/NOTIFY as a queue

**What people do:** Subscribe the dashboard to raw table changes and drive workers off NOTIFY alone.
**Why it's wrong:** `postgres_changes` re-checks RLS per subscriber per change and rides WAL (latency + scale ceiling); NOTIFY is fire-and-forget — a worker that was restarting misses the wake-up forever.
**Do this instead:** Broadcast-from-DB triggers for the UI; SKIP LOCKED polling (NOTIFY only as a latency optimization) for workers.

## Integration Points

### External Services

| Service | Integration pattern | Notes |
|---------|---------------------|-------|
| Supabase | Direct Postgres (migrations) + Realtime broadcast + RLS for dashboard | The state plane itself; agents go through dxb-mcp, never raw SQL |
| OpenRouter | Orchestrator's model-router client (L4 workers, council, Hermes brain) | Every call tagged `api` and metered; envelope hard-stop at 100% |
| Claude Code / `claude -p` | Subscription-side execution on laptop; sessions launched with dept profile | Agent SDK on VPS would bill per-token via API — locked decision keeps Hermes on GLM 5.2 instead; SDK also disallows subscription auth for products (verified in official docs) |
| Hermes (VPS) | systemd service + queue-worker shim claiming dept-scoped tasks | Same MCP profiles as everyone; no special powers |
| Stripe / DocuSign / Gmail-send | **Outbox executor only**; MCP servers for these never appear in agent profiles | Draft-only per locked decision; idempotency keys mandatory |
| Obsidian / Graphify / open-notebook / pgvector | Behind Memory Router adapters; open-notebook runs as VPS service | Agents see only `memory.*` tools |
| GitHub | Standard MCP in engineering profile; repo = code truth (not state truth) | Marketing/Sales profiles: no GitHub write (per doc's denial tables) |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Kernel ↔ Orchestrator | In-process call / classified-intent record | Kernel outputs policy-tagged intent; never tasks |
| Orchestrator ↔ workers (laptop/VPS) | Task Queue rows only | Never direct invocation across machines |
| Any agent ↔ state | dxb-mcp tools via gateway profile | Raw DB access is a boundary violation |
| Any agent ↔ memory | `memory.recall` / `memory.commit` only | Router owns store selection |
| Agents ↔ outside world | approvals table → outbox executor | The only side-effect path |
| Postgres ↔ Dashboard/JARVIS | RLS reads + broadcast channels; writes = intents/decisions | Projection, not participant |
| Cost/Audit ↔ everything | Hooks (PreToolUse/PostToolUse, post-call) appending rows | Observation may never block except budget hard-stop |

## Sources

- [Anthropic — How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) (official; orchestrator-worker, subagent isolation) — MEDIUM (verified)
- [Claude Agent SDK overview — official docs](https://code.claude.com/docs/en/agent-sdk/overview) (sessions/resume, hooks, per-session MCP config, subagents, API-key-auth constraint) — MEDIUM (official, fetched)
- [Supabase Realtime: Postgres Changes docs](https://supabase.com/docs/guides/realtime/postgres-changes), [Broadcast from Database](https://supabase.com/blog/realtime-broadcast-from-database), [Realtime architecture](https://supabase.com/docs/guides/realtime/architecture) — MEDIUM (official)
- [PostgreSQL SKIP LOCKED job queues](https://www.dbpro.app/blog/postgresql-skip-locked), [graphile/worker](https://github.com/graphile/worker), [pg-boss production tutorial](https://nerdleveltech.com/pg-boss-postgres-job-queue-node-typescript-production-tutorial), [Choose Postgres queue technology (HN)](https://news.ycombinator.com/item?id=37636841) — MEDIUM (cross-verified)
- [MCP Gateway pattern (Arcade)](https://www.arcade.dev/blog/mcp-gateway-pattern/), [MCP access control / least privilege (AppSentinels)](https://appsentinels.ai/blog/mcp-access-control-how-to-enforce-least-privilege-across-ai-agent-tool-chains/), [MCP gateway vs proxy (Permit)](https://www.permit.io/blog/mcp-gateway-vs-proxy) — MEDIUM (cross-verified)
- [Durable execution with just Postgres (Ronacher)](https://lucumr.pocoo.org/2025/11/3/absurd-workflows/), [Pydantic AI + DBOS](https://pydantic.dev/articles/pydantic-ai-dbos), [Operationalizing AI agents with durable event logs](https://www.automq.com/blog/operationalizing-ai-agents-with-durable-event-logs), [Revisiting the outbox pattern (Decodable)](https://www.decodable.co/blog/revisiting-the-outbox-pattern) — MEDIUM (cross-verified)
- [HITL Draft→Approve→Execute](https://medium.com/data-science-collective/human-in-the-loop-for-ai-agents-draft-approve-execute-c7fe0b72b0af), [Cloudflare Agents: human-in-the-loop patterns](https://developers.cloudflare.com/agents/concepts/agentic-patterns/human-in-the-loop/) — MEDIUM (cross-verified)
- [Agent memory frameworks compared (vectorize.io)](https://vectorize.io/articles/best-ai-agent-memory-systems), [Vector DB vs knowledge graph for agent memory (Atlan)](https://atlan.com/know/vector-database-vs-knowledge-graph-agent-memory/) — MEDIUM (cross-verified); the specific DXB store composition is design reasoning — LOW until validated in P3

---
*Architecture research for: AI-native company operating system (DXB Global OS)*
*Researched: 2026-07-05*
