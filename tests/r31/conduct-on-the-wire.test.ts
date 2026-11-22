// The conduct section ON THE WIRE — what every agent call really sends to the model.
//
// CEO order, 2026-11-22: the persona files go, and what was in force inside them must still reach
// every agent from one shared source, with a gate that fails when it is missing.
// tests/r31/standing-conduct.test.ts pins the WORDS (the source against the canon) and the builders.
// The audit of that day found the hole beside it: no test looked at what an executor hands the model,
// so three paths ran green with no conduct section at all — a task on an api-mode route, an unstaffed
// task, and a workflow run started without the seat-prompt dependency. This file closes that hole.
//
// What is compared: the options the executor REALLY passes to the model call (the Agent SDK's query(),
// the LiteLLM client's llmCall()), against the text packages/voice/src/standing-conduct.ts exports.
// Nothing here builds a prompt the way the code does. Both calls are replaced for this file only: they
// record what they were handed and stop the run, so nothing is spent and no run is written.
import { randomUUID } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import { disciplineAndConduct, hamzaCharacterText, handsLine } from "../../packages/voice/src/standing-conduct.js";
import { composeSeatPrompt, defaultExecutor, type ClaimedTask } from "../../packages/orchestrator/src/worker-shim.js";
import {
  defaultWorkflowExecutor,
  drainWorkflowRuns,
  runWorkflowRun,
  seatedExecutor,
  type AgentWork,
  type RunnerDeps,
} from "../../packages/kernel/src/index.js";
import { stepSeat } from "../../packages/kernel/src/workflow/steps/agent.js";

type LlmArgs = { messages: Array<{ role: string; content: string }> };
const wire = vi.hoisted(() => ({
  sdk: [] as Array<Record<string, unknown>>,
  llm: [] as LlmArgs[],
  stopped: "model-call-stopped-by-test",
}));
vi.mock("../../packages/orchestrator/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  query: (args: { options: Record<string, unknown> }) => {
    wire.sdk.push(args.options);
    throw new Error(wire.stopped);
  },
}));
vi.mock("@dxb/shared", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  llmCall: async (args: LlmArgs) => {
    wire.llm.push(args);
    throw new Error(wire.stopped);
  },
}));

const db = () => getDb();

// The expectation: the source's own exports, word for word.
const CONDUCT = disciplineAndConduct();
const HANDS = handsLine();
const HAMZA_CHARACTER = hamzaCharacterText();
const HAMZA_CHARACTER_HEADING = HAMZA_CHARACTER.split("\n")[0];
const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;

// The construction engine routes every tier to the subscription lane, so the api route is a row of this
// suite's own: a class nothing else carries, on the catalogue's LiteLLM model. Removed in afterAll.
const API_CLASS = `r31-wire-api-${randomUUID().slice(0, 8)}`;
const API_MODEL = "deepseek-v4-pro";
const SUBSCRIPTION_MODEL = "claude-opus-5-5";
const OBJECTIVE = "r31 wire probe — write one line";

/** The system prompt that went out carries the conduct section and the hands line once — and Hamza's character only for Hamza. */
function expectConduct(systemPrompt: unknown, where: string, who: "hamza" | "anyone else" = "anyone else"): void {
  expect(typeof systemPrompt, `${where}: a system prompt was sent`).toBe("string");
  const sent = systemPrompt as string;
  expect(count(sent, CONDUCT), `${where}: the conduct section, word for word`).toBe(1);
  expect(count(sent, HANDS), `${where}: the hands line`).toBe(1);
  expect(count(sent, HAMZA_CHARACTER), `${where}: Hamza's character`).toBe(who === "hamza" ? 1 : 0);
  if (who !== "hamza") expect(sent, where).not.toContain(HAMZA_CHARACTER_HEADING);
}

/** Runs one executor call up to its model call and hands back what that call was given. */
async function sentBy(run: () => Promise<unknown>) {
  wire.sdk.length = 0;
  wire.llm.length = 0;
  await expect(run()).rejects.toThrow(wire.stopped);
  return { sdk: [...wire.sdk], llm: [...wire.llm] };
}

/** An api call's messages: the system prompt first, then the task. */
function systemOfLlm(call: LlmArgs, where: string): string {
  expect(call.messages.map((m) => m.role), `${where}: system first, then the task`).toEqual(["system", "user"]);
  expect(call.messages[1].content).toContain(OBJECTIVE);
  return call.messages[0].content;
}

type Seat = { id: string; slug: string; department: string; role_level: string | null };
let seat: Seat; // an ordinary employee
let hamza: Seat;
const saved = { home: process.env.DXB_COMPANY_CLAUDE_HOME, isolation: process.env.DXB_WORKER_ISOLATION };

const sweepApiRoute = () => sql`DELETE FROM routing_rules WHERE task_class LIKE 'r31-wire-api-%'`.execute(db());

beforeAll(async () => {
  const agents = await sql<Seat>`
    SELECT id, slug, department, role_level FROM agents
     WHERE slug IN ('security-engineer', 'agents-orchestrator')`.execute(db());
  seat = agents.rows.find((a) => a.slug === "security-engineer")!;
  hamza = agents.rows.find((a) => a.slug === "agents-orchestrator")!;
  await sweepApiRoute(); // a killed earlier run
  await sql`INSERT INTO routing_rules (task_class, model_tier, model, mode)
            VALUES (${API_CLASS}, 'L1', ${API_MODEL}, 'api')`.execute(db());
  // The company isolation computes its paths from this home; an empty one of the suite's own.
  process.env.DXB_COMPANY_CLAUDE_HOME = mkdtempSync(join(tmpdir(), "dxb-r31-wire-home-"));
  delete process.env.DXB_WORKER_ISOLATION;
});

afterAll(async () => {
  for (const [key, value] of [["DXB_COMPANY_CLAUDE_HOME", saved.home], ["DXB_WORKER_ISOLATION", saved.isolation]] as const) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  await sweepApiRoute();
  await closeDb();
});

const task = (over: Partial<ClaimedTask>): ClaimedTask => ({
  id: randomUUID(),
  department: "security",
  objective: OBJECTIVE,
  output_contract: "one line",
  model_tier: "L1",
  approval_class: "none",
  budget_max_tokens: 1000,
  priority: 0,
  status: "running",
  ...over,
});

describe("the task lane — what defaultExecutor hands the model", () => {
  it("(a) a staffed task on the subscription path", async () => {
    const sent = await sentBy(() => defaultExecutor(task({ agent_id: seat.id })));
    expect([sent.sdk.length, sent.llm.length]).toEqual([1, 0]);
    expectConduct(sent.sdk[0].systemPrompt, "subscription, staffed");
  });

  it("(b) a staffed task on an api-mode route", async () => {
    const sent = await sentBy(() => defaultExecutor(task({ agent_id: seat.id, task_class: API_CLASS })));
    expect([sent.sdk.length, sent.llm.length]).toEqual([0, 1]);
    expectConduct(systemOfLlm(sent.llm[0], "api, staffed"), "api, staffed");
  });

  it("(c) an unstaffed task, on either route", async () => {
    const subscription = await sentBy(() => defaultExecutor(task({ agent_id: null })));
    expect([subscription.sdk.length, subscription.llm.length]).toEqual([1, 0]);
    expectConduct(subscription.sdk[0].systemPrompt, "subscription, unstaffed");

    const api = await sentBy(() => defaultExecutor(task({ agent_id: null, task_class: API_CLASS })));
    expect([api.sdk.length, api.llm.length]).toEqual([0, 1]);
    expectConduct(systemOfLlm(api.llm[0], "api, unstaffed"), "api, unstaffed");
  });

  it("Hamza's own task carries his character — the calls above carried it for nobody else", async () => {
    const sent = await sentBy(() => defaultExecutor(task({ agent_id: hamza.id, department: hamza.department })));
    expectConduct(sent.sdk[0].systemPrompt, "subscription, Hamza", "hamza");
  });
});

describe("the workflow lane — what a step's executor hands the model", () => {
  // The dependency exactly as packages/outbox-executor/src/scheduler.ts hands it in (the line is pinned
  // by tests/b51/p5b-bundle3.test.ts).
  const schedulerSeatPrompt: RunnerDeps["seatPrompt"] = async (who) => composeSeatPrompt(who);
  /** The work an agent step builds for its seat (steps/agent.ts), before the runner joins the prompt. */
  const work = (model: string): AgentWork => ({
    employeeId: seat.id,
    employeeSlug: seat.slug,
    department: seat.department,
    model,
    objective: OBJECTIVE,
    outputContract: "one line",
    seat: stepSeat(seat),
  });

  it("(d) an agent step, on the subscription path and on an api model", async () => {
    const run = seatedExecutor(defaultWorkflowExecutor, schedulerSeatPrompt);
    const subscription = await sentBy(() => run(work(SUBSCRIPTION_MODEL)));
    expect([subscription.sdk.length, subscription.llm.length]).toEqual([1, 0]);
    expectConduct(subscription.sdk[0].systemPrompt, "workflow, subscription");

    const api = await sentBy(() => run(work(API_MODEL)));
    expect([api.sdk.length, api.llm.length]).toEqual([0, 1]);
    expectConduct(systemOfLlm(api.llm[0], "workflow, api"), "workflow, api");
  });

  it("the seat-prompt dependency is required by type", () => {
    // @ts-expect-error — a RunnerDeps without seatPrompt does not compile (pnpm typecheck holds this line)
    const withoutSeatPrompt: RunnerDeps = { sleep: async () => {} };
    expect(withoutSeatPrompt).not.toHaveProperty("seatPrompt");
  });

  it("a run or a drain without the dependency is refused, before anything is read or moved", async () => {
    const noDeps = {} as RunnerDeps; // what a cast or plain JavaScript can still hand in
    await expect(runWorkflowRun(randomUUID(), noDeps)).rejects.toThrow(/seatPrompt/);
    await expect(runWorkflowRun(randomUUID(), undefined as never)).rejects.toThrow(/seatPrompt/);
    // A drain that is NOT refused advances every run in flight, so it is measured only on an idle engine.
    const inFlight = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM workflow_runs WHERE status IN ('running', 'waiting_approval')`.execute(db());
    expect(inFlight.rows[0].n, "workflow runs in flight on the construction engine").toBe(0);
    await expect(drainWorkflowRuns(noDeps)).rejects.toThrow(/seatPrompt/);
  });

  it("a step with no seat, or whose prompt comes out empty, is refused before its executor", async () => {
    const reached: AgentWork[] = [];
    const record = async (w: AgentWork) => {
      reached.push(w);
      return { output: "ran", confidence: 1 };
    };
    await expect(seatedExecutor(record, async () => "")(work(SUBSCRIPTION_MODEL))).rejects.toThrow(/no standing prompt/);
    const seatless = { ...work(SUBSCRIPTION_MODEL), seat: undefined };
    await expect(seatedExecutor(record, schedulerSeatPrompt)(seatless)).rejects.toThrow(/no standing prompt/);
    expect(reached).toHaveLength(0);
  });

  it("the default executor called directly, without a system prompt, makes no model call", async () => {
    wire.sdk.length = 0;
    wire.llm.length = 0;
    for (const model of [SUBSCRIPTION_MODEL, API_MODEL]) {
      await expect(defaultWorkflowExecutor(work(model))).rejects.toThrow(/no standing prompt/);
    }
    expect([wire.sdk.length, wire.llm.length]).toEqual([0, 0]);
  });
});
