// W10 (CEO 2026-09-15, "başla") — THE BRAIN THE CEO READS IS THE BRAIN THAT RUNS.
//
// The defect this closes, measured 2026-09-15 on both engines (audit F035): the studio's 14 seats
// carried `agents.brain = 'fable-5'` while the runtime routed their work through the enabled
// department-scoped `media.creative` row, which his ruling of 2026-09-05 had moved to Fable 5.1.
// His employees and directors pages therefore named a brain that had not run a single job for ten
// days. Correcting the 14 rows once would have been a patch: the next time a brain is switched
// through `fn_update_routing` (MODEL_ROUTING_SPEC §4b) the label would drift again, silently.
//
// So the label now FOLLOWS the router: `trg_agents_brain_follows_routing` on `routing_rules`
// (migration 20260915010000_w10_brain_truth.sql). This file proves the three things that make that
// trigger trustworthy rather than merely present:
//   (1) it bites — enabling a department's creative row moves that department's derived brains;
//   (2) it keeps its hands off a `ceo_override` brain, which is HIS choice and outranks the router;
//   (3) it stays inside the department named by the rule — no other seat in the holding moves.
// And (4): the live studio on this engine reads the brain its own enabled row names.
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import { pinHookOff, sweepByDepartment } from "../helpers/suite-scope.js";

const db = () => getDb();
const M = `w10t-${randomUUID().slice(0, 8)}`;
const DEPT = `${M}-studio`;
const OTHER = `${M}-other`;

pinHookOff(db);

async function makeSeat(slug: string, department: string, source: "slot" | "ceo_override") {
  const agent = await db()
    .insertInto("agents")
    .values({
      slug,
      department,
      role: "specialist",
      role_level: "specialist",
      persona_path: `personas/${slug}.md`,
      mcp_profile: "inherit",
      brain: "fable-5",
      brain_source: source,
      employment_status: "dormant",
      status: "dormant",
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  // the activation gate (E5.4b / G3, aligned with U30 in B08 step 0) refuses an active
  // employee without a passed persona — a fixture is born the way a real hire is.
  const persona = await db()
    .insertInto("personas")
    .values({
      employee_id: agent.id,
      version: 1,
      author: "opus-5",
      body_md: `${M} fixture persona`,
      quality_gate: "passed",
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  await db()
    .updateTable("agents")
    .set({ persona_id: persona.id, employment_status: "active" } as never)
    .where("id", "=", agent.id)
    .execute();
  return agent.id;
}

const brainOf = async (slug: string): Promise<string> =>
  (
    await sql<{ brain: string }>`SELECT brain FROM agents WHERE slug = ${slug}`.execute(db())
  ).rows[0].brain;

const setRule = async (model: string, enabled: boolean, match: object) =>
  sql`INSERT INTO routing_rules (task_class, match, model_tier, model, model_id, mode, effort, priority, enabled)
      VALUES ('media.creative', ${JSON.stringify(match)}::jsonb, 'L1', ${model}, ${model},
              'subscription', 'xhigh', 50, ${enabled})`.execute(db());

beforeAll(async () => {
  await sweepByDepartment(db(), M);
  await sql`DELETE FROM routing_rules WHERE match->>'department' LIKE ${`${M}%`}`.execute(db());
  await sql`INSERT INTO departments (slug, display_name, display_name_tr, status)
            VALUES (${DEPT}, ${`${M} studio`}, ${`${M} stüdyo`}, 'active'),
                   (${OTHER}, ${`${M} other`}, ${`${M} diğer`}, 'active')
            ON CONFLICT (slug) DO NOTHING`.execute(db());
  await makeSeat(`${M}-derived`, DEPT, "slot");
  await makeSeat(`${M}-his-choice`, DEPT, "ceo_override");
  await makeSeat(`${M}-stranger`, OTHER, "slot");
});

afterAll(async () => {
  // the fixture leaves nothing behind: rules, then the agents' persona link (the
  // activation gate refuses a live employee without one), then the rows themselves.
  await sql`DELETE FROM routing_rules WHERE match->>'department' LIKE ${`${M}%`}`.execute(db());
  await sweepByDepartment(db(), M);
  await sql`UPDATE agents SET persona_id = NULL, employment_status = 'dormant' WHERE slug LIKE ${`${M}%`}`.execute(db());
  await sql`DELETE FROM personas WHERE employee_id IN (SELECT id FROM agents WHERE slug LIKE ${`${M}%`})`.execute(db());
  await sql`DELETE FROM agents WHERE slug LIKE ${`${M}%`}`.execute(db());
  await sql`DELETE FROM departments WHERE slug LIKE ${`${M}%`}`.execute(db());
  await closeDb();
});

describe("W10 — the seats' brain follows the enabled creative row", () => {
  it("1. an enabled department-scoped media.creative row moves that department's derived brains", async () => {
    expect(await brainOf(`${M}-derived`)).toBe("fable-5");
    await setRule("fable-5.1", true, { department: DEPT });
    expect(await brainOf(`${M}-derived`)).toBe("fable-5.1");
  });

  it("2. a ceo_override brain is HIS choice and the router never overwrites it", async () => {
    expect(await brainOf(`${M}-his-choice`)).toBe("fable-5");
  });

  it("3. no seat outside the department the rule names is touched", async () => {
    expect(await brainOf(`${M}-stranger`)).toBe("fable-5");
  });

  it("4. a later switch through the row moves the label again — the drift cannot return", async () => {
    await sql`UPDATE routing_rules SET model = 'fable-5', model_id = 'fable-5'
               WHERE match->>'department' = ${DEPT} AND task_class = 'media.creative'`.execute(db());
    expect(await brainOf(`${M}-derived`)).toBe("fable-5");
  });

  it("5. a disabled row routes nothing, so it moves nothing", async () => {
    await sql`UPDATE routing_rules SET enabled = false
               WHERE match->>'department' = ${DEPT} AND task_class = 'media.creative'`.execute(db());
    await sql`UPDATE routing_rules SET model = 'fable-5.1', model_id = 'fable-5.1'
               WHERE match->>'department' = ${DEPT} AND task_class = 'media.creative'`.execute(db());
    expect(await brainOf(`${M}-derived`)).toBe("fable-5");
  });

  it("6. the live studio on this engine reads the brain its own enabled row names", async () => {
    const enabled = (
      await sql<{ brain: string }>`SELECT coalesce(model_id, model) AS brain FROM routing_rules
                                    WHERE task_class = 'media.creative' AND enabled
                                      AND match->>'department' = 'media-studio'`.execute(db())
    ).rows[0];
    expect(enabled?.brain).toBe("fable-5.1");
    const stale = (
      await sql<{ n: number }>`SELECT count(*)::int AS n FROM agents
                                WHERE department = 'media-studio' AND brain_source = 'slot'
                                  AND employment_status <> 'archived'
                                  AND brain IS DISTINCT FROM ${enabled.brain}`.execute(db())
    ).rows[0].n;
    expect(stale).toBe(0);
  });
});
