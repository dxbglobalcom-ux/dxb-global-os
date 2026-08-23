// W2.5 — THE MACHINE OPENS ITS OWN NEXT WORK (AGENT_ORCHESTRATION_SPEC §3,
// §4, §13-15; roadmap row 2.5).
//
// Measured before writing (2026-07-26): every task-creating path in the repo
// starts at a human — dispatch from a CEO intent, the MCP queue tool from
// inside a run a human started, discovery only on `trigger='ceo'`. Nothing
// read a FINISHED task's own output to open the next one, so the W2.4 pilot
// plan was written, filed, and nobody executed it.
//
// This suite pins the seam that closes it: a done plan's steps become staffed
// tasks through an audited door, exactly once, inside a project the CEO
// already approved — and refuse loudly everywhere else.
//
// Every case runs inside a rolled-back transaction against the live database.
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { parsePlanSteps } from "../../packages/orchestrator/src/work-generation.js";

process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const SEED = `c9-gen-${randomUUID().slice(0, 8)}`;
const ROLLBACK = new Error("rollback-sentinel");

type Skip = { step_index: number; reason: string; detail?: string };
type Made = { task_id: string; step_index: number; department: string };
type Out = {
  ok: boolean;
  error?: string;
  detail?: string;
  plan_task_id?: string;
  project_id?: string;
  generated?: Made[];
  skipped?: Skip[];
  capped?: number;
  marked?: boolean;
};

afterAll(async () => {
  await closeDb();
});

const inTrx = async (fn: (trx: never) => Promise<void>) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await fn(trx as never);
      throw ROLLBACK;
    })
    .catch((e) => {
      if (e !== ROLLBACK) throw e;
    });

/** A project the CEO already approved — the only ground autonomous work may
 *  stand on (§13: the machine executes decisions, it never takes them). */
async function project(trx: never, status = "active"): Promise<string> {
  const res = await sql<{ id: string }>`
    insert into projects (slug, name, name_tr, purpose, purpose_tr, status)
    values (${`${SEED}-proj`}, ${`${SEED} pilot`}, ${`${SEED} pilot`},
            'W2.5 seam test', 'W2.5 dikiş testi', ${status})
    returning id
  `.execute(trx);
  return res.rows[0].id;
}

/** The plan task itself: a finished run whose deliverable carries the steps. */
async function planTask(trx: never, projectId: string, status = "done"): Promise<string> {
  const res = await sql<{ id: string }>`
    insert into tasks (department, project_id, objective, output_contract, model_tier,
                       label, label_tr, status, result)
    values ('strategy', ${projectId}::uuid, 'Plan the pilot', 'STEPS … END', 'L1',
            'Pilot plan', 'Pilot planı', ${status},
            jsonb_build_object('text', 'STEPS\n1) do it | owner: commerce | tr: yap\nEND'))
    returning id
  `.execute(trx);
  return res.rows[0].id;
}

const STEPS = (n: number) =>
  JSON.stringify(
    Array.from({ length: n }, (_, i) => ({
      title: `Step ${i + 1}: open the listing channel`,
      owner: i % 2 === 0 ? "commerce" : "sales",
      tr: `Adım ${i + 1}: satış kanalını aç`,
      do: `Instruction ${i + 1}: publish the sheet, then report what went live.`,
    })),
  );

const call = async (trx: never, planId: string, steps: string): Promise<Out> => {
  const res = await sql<{ out: Out }>`
    select control_work_generate(${planId}::uuid, ${steps}::jsonb) as out
  `.execute(trx);
  return res.rows[0].out;
};

describe("W2.5 — reading a plan the way models actually write one", () => {
  it("reads the contracted shape and stops where the STEPS block stops", () => {
    const steps = parsePlanSteps(
      [
        "Here is the pilot plan.",
        "",
        "STEPS",
        "1) List 20 SKUs on the marketplace | owner: commerce | tr: Pazaryerinde 20 ürün listele | do: Pick the 20 highest-margin SKUs from the supplier sheet and publish them.",
        "2) Answer the first 10 buyer questions | owner: customer-success | tr: İlk 10 alıcı sorusunu yanıtla",
        "FIRST_REVENUE: first paid order, recorded in revenue_ledger",
        "GAPS: NONE",
        "STOP_IF: no order in 14 days",
        "END",
      ].join("\n"),
    );
    expect(steps.length).toBe(2);
    expect(steps[0]).toEqual({
      title: "List 20 SKUs on the marketplace",
      owner: "commerce",
      tr: "Pazaryerinde 20 ürün listele",
      do: "Pick the 20 highest-margin SKUs from the supplier sheet and publish them.",
    });
    expect(steps[1].owner).toBe("customer-success");
    expect(steps[1].do).toBeNull(); // old shape still parses; title carries both jobs
  });

  it("tolerates the wrapper models actually produce, and never invents an owner", () => {
    const steps = parsePlanSteps(
      ["STEPS:", "- Open the store | department = Commerce", "* Write the copy", ""].join("\n"),
    );
    expect(steps.length).toBe(2);
    expect(steps[0].owner).toBe("commerce"); // normalised, not guessed
    expect(steps[0].tr).toBeNull(); // missing tr leg is a fallback, not a crash
    expect(steps[1].owner).toBe(""); // no owner named → the door will refuse it
  });

  it("keeps a pipe the model wrote inside its own instruction", () => {
    const steps = parsePlanSteps(
      ["STEPS", "1) Ship it | owner: commerce | do: Do A | then B", "END"].join("\n"),
    );
    expect(steps[0].do).toBe("Do A | then B");
  });

  it("returns nothing when the plan named no step — prose is a legitimate answer", () => {
    expect(parsePlanSteps("We looked at the market and recommend waiting.")).toEqual([]);
    expect(parsePlanSteps(null)).toEqual([]);
  });
});

describe("W2.5 — the door refuses everything that is not executable work", () => {
  it("refuses while the CEO's switch is off, and writes nothing", async () => {
    await inTrx(async (trx) => {
      const plan = await planTask(trx, await project(trx));
      await sql`
        update settings_values set value = 'false'::jsonb
         where key = 'orchestration.autogen.enabled' and scope = 'global'
      `.execute(trx);
      const out = await call(trx, plan, STEPS(2));
      expect(out.ok).toBe(false);
      expect(out.error).toBe("DISABLED");
      const made = await sql<{ n: string }>`
        select count(*)::text as n from tasks where parent_task_id = ${plan}::uuid
      `.execute(trx);
      expect(made.rows[0].n).toBe("0");
    });
  });

  it("refuses a plan that has not finished — an unfinished plan is not a plan", async () => {
    await inTrx(async (trx) => {
      const plan = await planTask(trx, await project(trx), "running");
      const out = await call(trx, plan, STEPS(2));
      expect(out.ok).toBe(false);
      expect(out.error).toBe("PLAN_NOT_DONE");
    });
  });

  it("refuses when the project is paused — stopping the bet stops the work (W2.4)", async () => {
    await inTrx(async (trx) => {
      const plan = await planTask(trx, await project(trx, "paused"));
      const out = await call(trx, plan, STEPS(2));
      expect(out.ok).toBe(false);
      expect(out.error).toBe("PROJECT_NOT_ACTIVE");
    });
  });

  it("records the dead end when a plan carries no steps, so the seam never loops on it", async () => {
    await inTrx(async (trx) => {
      const plan = await planTask(trx, await project(trx));
      const out = await call(trx, plan, "[]");
      expect(out.ok).toBe(false);
      expect(out.error).toBe("NO_STEPS");
      expect(out.marked).toBe(true);
      const mark = await sql<{ n: string }>`
        select count(*)::text as n from generated_work where plan_task_id = ${plan}::uuid
      `.execute(trx);
      expect(mark.rows[0].n).toBe("1");
    });
  });
});

describe("W2.5 — a finished plan becomes staffed work with nobody in the loop", () => {
  it("opens one queued, staffed, bilingual task per step in the named department", async () => {
    await inTrx(async (trx) => {
      const proj = await project(trx);
      const plan = await planTask(trx, proj);
      const out = await call(trx, plan, STEPS(2));
      expect(out.ok).toBe(true);
      expect(out.generated?.length).toBe(2);

      const rows = await sql<{
        department: string; status: string; agent_id: string | null; project_id: string;
        label: string | null; label_tr: string | null; parent_task_id: string | null;
        objective: string; output_contract: string; model_tier: string;
      }>`
        select t.department, t.status, t.agent_id, t.project_id, t.label, t.label_tr,
               t.parent_task_id, t.objective, t.output_contract, t.model_tier
          from tasks t
          join generated_work g on g.task_id = t.id
         where t.parent_task_id = ${plan}::uuid
         order by g.step_index
      `.execute(trx);
      // Ordered by the STEP, not by the clock. This read `order by created_at`
      // until 2026-08-23: every task of one plan is written inside a single
      // transaction, so they all carry the same `now()` and the tie was broken
      // by whatever order the planner felt like — the case passed alone and
      // failed inside the full battery, which is exactly the "nobody can count
      // this project the same way twice" class. `generated_work.step_index` is
      // the order the plan actually has.
      // Counted WITHOUT the join first, so nothing can hide behind it. An audit
      // caught that on 2026-08-23: a third task carrying no `generated_work` row
      // would be dropped by the join and the length assertion would still pass.
      const children = await sql<{ n: number }>`
        select count(*)::int as n from tasks where parent_task_id = ${plan}::uuid
      `.execute(trx);
      expect(children.rows[0].n).toBe(2);
      expect(rows.rows.length).toBe(2);
      expect(rows.rows.map((r) => r.department)).toEqual(["commerce", "sales"]);
      for (const r of rows.rows) {
        expect(r.status).toBe("queued");
        // an unstaffed task runs tool-less by default-deny — staffing is the work
        expect(r.agent_id).not.toBeNull();
        expect(r.project_id).toBe(proj);
        expect(r.label_tr ?? "").toMatch(/Adım/);
        expect(r.label ?? "").toMatch(/Step/);
        // The row the CEO reads is a HEADLINE. The first live harvest wrote
        // 120-char labels cut mid-word (2026-07-26) — the house standard is
        // 41-45, and a cut at the data source is banned.
        expect((r.label ?? "").length).toBeLessThanOrEqual(80);
        expect((r.label_tr ?? "").length).toBeLessThanOrEqual(80);
        // the instruction is not lost by keeping the label short
        expect(r.objective).toMatch(/Instruction \d: publish the sheet/);
        // the brief must carry the boundaries, never assume the worker knows them
        expect(r.objective).toMatch(/approval/i);
        expect(r.output_contract).toMatch(/END/);
        expect(r.model_tier).toBe("L1"); // inherits the tier of the plan that ordered it
      }
    });
  });

  it("writes the audit trail: who generated what, from which plan", async () => {
    await inTrx(async (trx) => {
      const plan = await planTask(trx, await project(trx));
      await call(trx, plan, STEPS(2));
      const audit = await sql<{ actor: string; actor_type: string; payload: Record<string, unknown> }>`
        select actor, actor_type, payload from audit_log
         where action = 'orchestration.work.generated'
           and payload ->> 'plan_task_id' = ${plan}
      `.execute(trx);
      expect(audit.rows.length).toBe(1);
      expect(audit.rows[0].actor_type).toBe("system");
      expect(Number(audit.rows[0].payload.generated)).toBe(2);
    });
  });

  it("cannot open the same work twice — idempotency is structural, not hopeful", async () => {
    await inTrx(async (trx) => {
      const plan = await planTask(trx, await project(trx));
      const first = await call(trx, plan, STEPS(2));
      expect(first.ok).toBe(true);
      const second = await call(trx, plan, STEPS(2));
      expect(second.ok).toBe(false);
      expect(second.error).toBe("ALREADY_GENERATED");
      const n = await sql<{ n: string }>`
        select count(*)::text as n from tasks where parent_task_id = ${plan}::uuid
      `.execute(trx);
      expect(n.rows[0].n).toBe("2");
    });
  });

  it("truncates at the cap and SAYS SO — a silent cap reads as 'covered everything'", async () => {
    await inTrx(async (trx) => {
      const plan = await planTask(trx, await project(trx));
      await sql`
        update settings_values set value = '2'::jsonb
         where key = 'orchestration.autogen.max_steps' and scope = 'global'
      `.execute(trx);
      const out = await call(trx, plan, STEPS(5));
      expect(out.ok).toBe(true);
      expect(out.generated?.length).toBe(2);
      expect(out.capped).toBe(3);
      expect(out.skipped?.filter((s) => s.reason === "capped").length).toBe(3);
    });
  });

  it("refuses at birth the step the constitution can never let a worker run", async () => {
    // Measured on the first live harvest (2026-07-26 16:48): the plan named a
    // halal-evidence dossier and wrote the flagged terms inside the step text.
    // The pre-task hook screens objective+contract with letter boundaries and
    // fail-closes (§11, immutable) — so the task was born only to fail five
    // times and exhaust the escalation ladder. The screen is constitutional and
    // stays; the seam must not mint work it knows the gate will refuse.
    await inTrx(async (trx) => {
      const plan = await planTask(trx, await project(trx));
      const steps = JSON.stringify([
        {
          title: "Map riba exposure across the pipeline",
          owner: "risk-audit",
          tr: "Boru hattındaki riba riskini haritala",
          do: "List every opportunity whose revenue mechanism touches interest.",
        },
        { title: "Write the summary", owner: "strategy", tr: "Özeti yaz", do: "One page." },
      ]);
      const out = await call(trx, plan, steps);
      expect(out.ok).toBe(true);
      expect(out.generated?.length).toBe(1);
      expect(out.skipped?.[0]).toMatchObject({ step_index: 1, reason: "halal_screen" });
      expect(String(out.skipped?.[0].detail ?? "")).toMatch(/riba/);
      const made = await sql<{ n: string }>`
        select count(*)::text as n from tasks
         where parent_task_id = ${plan}::uuid and department = 'risk-audit'
      `.execute(trx);
      expect(made.rows[0].n).toBe("0");
    });
  });

  it("skips a step whose owner is not a real department, and names the reason", async () => {
    await inTrx(async (trx) => {
      const plan = await planTask(trx, await project(trx));
      // `step` is the pre-title field name — still accepted, so a plan written
      // before the headline split keeps generating work.
      const steps = JSON.stringify([
        { step: "Real work", owner: "commerce", tr: "Gerçek iş" },
        { step: "Ghost work", owner: "atlantis", tr: "Hayalet iş" },
      ]);
      const out = await call(trx, plan, steps);
      expect(out.ok).toBe(true);
      expect(out.generated?.length).toBe(1);
      expect(out.skipped).toEqual([{ step_index: 2, reason: "unknown_department" }]);
      const mark = await sql<{ reason: string | null; task_id: string | null }>`
        select reason, task_id from generated_work
         where plan_task_id = ${plan}::uuid and step_index = 2
      `.execute(trx);
      expect(mark.rows[0].reason).toBe("unknown_department");
      expect(mark.rows[0].task_id).toBeNull();
    });
  });
});
