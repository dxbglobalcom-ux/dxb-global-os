// W9 (CEO 2026-09-15, "onay") — THE TWO ASSIGNED SEATS CAN TAKE A STUDIO TASK.
//
// The defect this closes, measured 2026-09-15 (audit F033): the Media Studio was founded with 16
// seats, two of which are not new hires but existing employees of other departments assigned to the
// studio (ledger media-studio-department-and-16-experts-2026-09-03, "2 existing experts assigned").
// The assignment lived only in prose, so the machine did not know it: both dispatcher doors refused
// the two seats ("belongs to 'design', not 'media-studio'") and their gateway profiles emitted 0
// media_* tools where the studio's emits 5. The department was described as sixteen seats and
// fourteen of them could be dispatched.
//
// The record is now `agent_assignments` — a SECOND MEMBERSHIP, never a move: agents.department stays
// the home department, and a seat with no assignment row is refused exactly as before. That last part
// is the half that matters: this file proves the door still closes.
//
// On the profile side the cut stays an INTERSECTION (PERMISSION_MODEL G2 — the library can narrow,
// never widen). What widened is the membership, in the org record: an assigned seat's ceiling is the
// union of the surfaces of the departments it BELONGS to, and its own grants cut that ceiling down.
// Nobody else in the home department gains a tool, which this file also proves.
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import { createDxbMcpServer } from "../../packages/dxb-mcp/src/index.js";
import { readLibraryLayer } from "../../packages/gateway/src/library-profiles.js";
import { generateProfiles } from "../../packages/gateway/src/generate-profiles.js";
import { pinHookOff, sweepByDepartment, watchLedgers } from "../helpers/suite-scope.js";

const db = () => getDb();

// Its own footprints in audit_log / decision_log, swept in afterAll below.
const ledgerScope = watchLedgers(db);
const M = `w9t-${randomUUID().slice(0, 8)}`;
const STUDIO = `${M}-studio`;
const HOME = `${M}-home`;

pinHookOff(db);

let client: Client;
let projectId = "";
let studioDeptId = "";
const personaIds: string[] = [];
const agentIds = new Map<string, string>();

async function call(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await client.callTool({ name, arguments: args });
  if (res.isError) throw new Error((res.content as Array<{ text: string }>)[0]?.text ?? "tool error");
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}

async function makeActiveAgent(slug: string, department: string): Promise<string> {
  const agent = await db()
    .insertInto("agents")
    .values({
      slug,
      department,
      role: slug.endsWith("director") ? "head" : "specialist",
      role_level: slug.endsWith("director") ? "director" : "specialist",
      persona_path: `personas/${slug}.md`,
      mcp_profile: "inherit",
      employment_status: "dormant",
      status: "dormant",
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
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
  personaIds.push(persona.id);
  await db()
    .updateTable("agents")
    .set({ persona_id: persona.id, employment_status: "active" } as never)
    .where("id", "=", agent.id)
    .execute();
  agentIds.set(slug, agent.id);
  return agent.id;
}

async function authorTask(): Promise<string> {
  const row = await db()
    .insertInto("tasks")
    .values({
      department: STUDIO,
      agent_id: agentIds.get(`${M}-director`)!,
      objective: `${M} the director's plan for the sheet`,
      output_contract: "the sheet written",
      model_tier: "L1",
      approval_class: "none",
      budget_max_tokens: 123_456,
      priority: 7,
      status: "running",
      project_id: projectId,
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

const seat = (slug: string, deps: number[] = []) => ({
  seat: `${M}-${slug}`,
  objective: `${M} ${slug}: do the ${slug} work of this job, whole`,
  output_contract: `${slug} deliverable as the sheet asks`,
  label: `${slug} · sheet`,
  label_tr: `${slug} · sevk`,
  deps,
});

beforeAll(async () => {
  const server = createDxbMcpServer();
  client = new Client({ name: "w9-assigned-seats-test", version: "0.0.0" });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(st), client.connect(ct)]);
  await sweepByDepartment(db(), M);
  await sql`INSERT INTO departments (slug, display_name, display_name_tr, status)
            VALUES (${STUDIO}, ${`${M} studio`}, ${`${M} stüdyo`}, 'active'),
                   (${HOME},   ${`${M} home`},   ${`${M} ev`},     'active')
            ON CONFLICT (slug) DO NOTHING`.execute(db());
  studioDeptId = (
    await sql<{ id: string }>`SELECT id FROM departments WHERE slug = ${STUDIO}`.execute(db())
  ).rows[0]!.id;
  const project = await db()
    .insertInto("projects")
    .values({
      slug: `${M}-film`,
      name: `${M} film`,
      purpose: `${M} the sheet's project`,
      status: "active",
      name_tr: `${M} film`,
      purpose_tr: `${M} projenin amacı`,
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  projectId = project.id;
  await makeActiveAgent(`${M}-director`, STUDIO);
  await makeActiveAgent(`${M}-engineer`, STUDIO);
  await makeActiveAgent(`${M}-assigned`, HOME); // the borrowed expert
  await makeActiveAgent(`${M}-stranger`, HOME); // the same home department, NO assignment
  // the assignment: a second membership for ONE of the two home-department seats
  await sql`
    INSERT INTO agent_assignments (agent_id, department_id, seat_title, since, ledger_id)
    VALUES (${agentIds.get(`${M}-assigned`)!}::uuid, ${studioDeptId}::uuid,
            ${`${M} borrowed expert`}, DATE '2026-09-03', ${`${M}-ledger`})
  `.execute(db());
});

afterAll(async () => {
  // 2026-09-21: and the two append-only ledgers too. Measured by running
  // every sandboxed file alone: this one left the rows named below, which
  // no FK chain reaches. Watermark AND signature — never the watermark alone.
  await ledgerScope.sweep({ decidedByLike: ["w9t-%"] });
  await sql`DELETE FROM agent_assignments WHERE ledger_id = ${`${M}-ledger`}`.execute(db()).catch(() => {});
  await sql`DELETE FROM audit_log WHERE payload::text LIKE ${"%" + M + "%"} OR actor LIKE ${M + "%"}`
    .execute(db())
    .catch(() => {});
  await sweepByDepartment(db(), M);
  await sql`UPDATE agents SET persona_id = NULL, employment_status = 'dormant' WHERE slug LIKE ${M + "%"}`.execute(db());
  await sql`DELETE FROM personas WHERE id = ANY(${personaIds}::uuid[])`.execute(db());
  await sql`DELETE FROM agents WHERE slug LIKE ${M + "%"}`.execute(db());
  await sql`DELETE FROM projects WHERE id = ${projectId}::uuid`.execute(db());
  await sql`DELETE FROM departments WHERE slug LIKE ${M + "%"}`.execute(db());
  await client.close();
  await closeDb();
});

describe("W9 · the dispatcher accepts an assigned seat and still refuses a stranger", () => {
  it("a sheet naming the assigned seat is dispatched — the task is born staffed under the studio", async () => {
    const author = await authorTask();
    const r = await call("queue_dispatch", {
      task_id: author,
      code: `${M}-OK`,
      seats: [seat("engineer"), seat("assigned", [0])],
    });
    expect(r.tasks).toHaveLength(2);
    const rows = (
      await sql<{ slug: string; department: string }>`
        SELECT a.slug, t.department FROM tasks t JOIN agents a ON a.id = t.agent_id
         WHERE t.parent_task_id = ${author}::uuid ORDER BY a.slug
      `.execute(db())
    ).rows;
    expect(rows.map((x) => x.slug)).toContain(`${M}-assigned`);
    // the task belongs to the AUTHOR's department; the seat keeps its home one
    expect(new Set(rows.map((x) => x.department))).toEqual(new Set([STUDIO]));
    const home = (
      await sql<{ department: string }>`SELECT department FROM agents WHERE slug = ${`${M}-assigned`}`.execute(db())
    ).rows[0]!.department;
    expect(home).toBe(HOME);
  });

  it("a sheet naming a seat of the same home department WITHOUT an assignment is refused, and writes nothing", async () => {
    const author = await authorTask();
    const before = (
      await sql<{ n: number }>`SELECT count(*)::int AS n FROM tasks WHERE parent_task_id = ${author}::uuid`.execute(db())
    ).rows[0]!.n;
    await expect(
      call("queue_dispatch", {
        task_id: author,
        code: `${M}-NO`,
        seats: [seat("engineer"), seat("stranger", [0])],
      }),
    ).rejects.toThrow(/belongs to/);
    const after = (
      await sql<{ n: number }>`SELECT count(*)::int AS n FROM tasks WHERE parent_task_id = ${author}::uuid`.execute(db())
    ).rows[0]!.n;
    expect(after).toBe(before);
  });

  it("queue_create_task takes the assigned seat and refuses the stranger", async () => {
    const envelope = {
      department: STUDIO,
      objective: `${M} one task for a borrowed seat, named in the brief`,
      output_contract: "the deliverable the brief asks for",
      model_tier: "L1",
      approval_class: "none",
      budget: { max_tokens: 50_000, max_cost_eur: 1 },
      priority: 5,
    };
    const born = await call("queue_create_task", { ...envelope, agent_slug: `${M}-assigned`, project_id: projectId });
    expect(born.id).toBeTruthy();
    await expect(
      call("queue_create_task", { ...envelope, agent_slug: `${M}-stranger`, project_id: projectId }),
    ).rejects.toThrow(/belongs to/);
  });

  it("the assignment is a membership, not a move — dropping it closes the door again", async () => {
    await sql`DELETE FROM agent_assignments WHERE ledger_id = ${`${M}-ledger`}`.execute(db());
    const author = await authorTask();
    await expect(
      call("queue_dispatch", { task_id: author, code: `${M}-GONE`, seats: [seat("assigned")] }),
    ).rejects.toThrow(/belongs to/);
    // put it back for the layer cases below
    await sql`
      INSERT INTO agent_assignments (agent_id, department_id, seat_title, since, ledger_id)
      VALUES (${agentIds.get(`${M}-assigned`)!}::uuid, ${studioDeptId}::uuid,
              ${`${M} borrowed expert`}, DATE '2026-09-03', ${`${M}-ledger`})
    `.execute(db());
  });
});

describe("W9 · the drawer reaches the assigned seat and nobody else", () => {
  it("the library layer gives the assigned seat its studio membership, and the stranger none", async () => {
    const layer = await readLibraryLayer(db());
    // the fixture seats hold no employee-kind grants, so they carry no overlay at all —
    // which is itself the contract: an overlay exists only where an employee grant does.
    expect(layer.employees[`${M}-stranger`]).toBeUndefined();
    // the real pair the CEO's order names must be in the layer, each with its studio membership
    for (const slug of ["design-image-prompt-engineer", "marketing-short-video-editing-coach"]) {
      const emp = layer.employees[slug];
      expect(emp, `${slug} must hold an employee-kind grant`).toBeTruthy();
      expect(emp!.assignedDepartments).toContain("media-studio");
      expect(emp!.department).not.toBe("media-studio"); // home department untouched
    }
  });

  it("the media group reaches the overlay THROUGH the assignment, on fixtures this test owns", async () => {
    // Everything here is the test's own: two fixture departments, one fixture employee
    // grant. The real pair is measured by the case above and by the ruler; this case
    // measures the MECHANISM, and it must give the same answer on either engine. (An
    // absolute "the home department has no media tool" claim would pass on the company
    // engine and fail on the construction one, whose seed grants design the whole media
    // drawer at department level — one claim measuring two different things is exactly
    // what the ruler rule exists to stop.)
    const item = async (name: string) =>
      (await sql<{ id: string }>`SELECT id FROM library_items WHERE kind = 'mcp' AND name = ${name}`.execute(db()))
        .rows[0]!.id;
    const media = await item("dxb-mcp/media");
    const queue = await item("dxb-mcp/queue");
    const assignedId = agentIds.get(`${M}-assigned`)!;

    // the home department is GOVERNED but holds no media; the studio holds it; the
    // borrowed seat holds it as an employee. A department absent from the layer would
    // keep its whole policy surface (§22) and prove nothing, so the home one is granted
    // something real and narrow.
    await sql`
      INSERT INTO library_grants (item_id, grantee_kind, grantee_id, granted_by) VALUES
        (${queue}::uuid, 'department', ${HOME},   ${M}),
        (${queue}::uuid, 'department', ${STUDIO}, ${M}),
        (${media}::uuid, 'department', ${STUDIO}, ${M}),
        (${media}::uuid, 'employee',   ${assignedId}, ${M})
    `.execute(db());

    const outDir = `/tmp/w9-profiles-${M}`;
    const policy = {
      servers: { "dxb-mcp": { command: "node", args: ["dxb-mcp"] } },
      grants: { [HOME]: { "dxb-mcp": "*" as const }, [STUDIO]: { "dxb-mcp": "*" as const } },
    };
    const compile = async () =>
      generateProfiles(db(), {
        denials: {},
        policy,
        outDir,
        generatedAt: "2026-09-15T00:00:00.000Z",
        library: await readLibraryLayer(db()),
      });
    const mediaOf = (tools: Record<string, string[] | "*">) =>
      Object.values(tools)
        .flatMap((v) => (v === "*" ? [] : v))
        .filter((t) => t.startsWith("media_"));

    try {
      const withAssignment = await compile();
      const overlay = withAssignment.employeeProfiles.find((p) => p.employee === `${M}-assigned`);
      expect(overlay, "the borrowed seat must get an overlay").toBeTruthy();
      expect(overlay!.department).toBe(HOME); // home department untouched
      expect(overlay!.assignedDepartments).toEqual([STUDIO]);
      expect(mediaOf(overlay!.tools).length).toBeGreaterThan(0);

      // and NOBODY ELSE of the home department gained anything: the home profile itself
      // carries no media tool, and the stranger has no overlay at all.
      const homeProfile = withAssignment.profiles.find((p) => p.department === HOME);
      expect(mediaOf(homeProfile!.tools)).toHaveLength(0);
      expect(withAssignment.employeeProfiles.find((p) => p.employee === `${M}-stranger`)).toBeUndefined();

      // take the membership away: the ceiling falls back to the home surface and the
      // employee's media grant has nothing left to stand on.
      await sql`DELETE FROM agent_assignments WHERE ledger_id = ${`${M}-ledger`}`.execute(db());
      const without = await compile();
      const shrunk = without.employeeProfiles.find((p) => p.employee === `${M}-assigned`);
      expect(shrunk!.assignedDepartments).toBeUndefined();
      expect(mediaOf(shrunk!.tools)).toHaveLength(0);
    } finally {
      await sql`DELETE FROM library_grants WHERE granted_by = ${M}`.execute(db());
      await sql`
        INSERT INTO agent_assignments (agent_id, department_id, seat_title, since, ledger_id)
        VALUES (${assignedId}::uuid, ${studioDeptId}::uuid, ${`${M} borrowed expert`}, DATE '2026-09-03', ${`${M}-ledger`})
        ON CONFLICT (agent_id, department_id) DO NOTHING
      `.execute(db());
    }
  });
});
