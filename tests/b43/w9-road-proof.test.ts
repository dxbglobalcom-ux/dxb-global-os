// W9 — THE ROAD PROOF, not a unit test: a real studio call sheet naming the borrowed Editor,
// dispatched through the same door a director uses, on the construction engine.
//
// The unit cases in assigned-seats.test.ts prove the mechanism on fixtures the test owns. This
// one proves the THING THE CEO ASKED FOR: that `marketing-short-video-editing-coach` — an
// employee of marketing, assigned to the studio on 2026-09-03 and unreachable by the road until
// today (audit F033) — can be named on a media-studio sheet and be given work. It runs against
// the REAL seats and the REAL assignment rows, on the construction engine only; the company
// engine stays SELECT-only in this part (dispatching there would create actual work).
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import { createDxbMcpServer } from "../../packages/dxb-mcp/src/index.js";
import { pinHookOff } from "../helpers/suite-scope.js";

const db = () => getDb();
const M = `w9road-${randomUUID().slice(0, 8)}`;
const EDITOR = "marketing-short-video-editing-coach";
const DIRECTOR = "media-creative-director";

pinHookOff(db);

let client: Client;
let projectId = "";
let authorId = "";
const created: string[] = [];

async function call(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await client.callTool({ name, arguments: args });
  if (res.isError) throw new Error((res.content as Array<{ text: string }>)[0]?.text ?? "tool error");
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}

beforeAll(async () => {
  const server = createDxbMcpServer();
  client = new Client({ name: "w9-road-proof", version: "0.0.0" });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(st), client.connect(ct)]);

  const project = await db()
    .insertInto("projects")
    .values({
      slug: `${M}-film`,
      name: `${M} the studio's job`,
      purpose: `${M} a real sheet that names the borrowed Editor`,
      status: "active",
      name_tr: `${M} stüdyonun işi`,
      purpose_tr: `${M} ödünç Kurgucuyu adıyla çağıran gerçek bir sevk`,
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  projectId = project.id;

  const director = (
    await sql<{ id: string }>`SELECT id FROM agents WHERE slug = ${DIRECTOR}`.execute(db())
  ).rows[0]!.id;
  const author = await db()
    .insertInto("tasks")
    .values({
      department: "media-studio",
      agent_id: director,
      objective: `${M} the director plans the job and writes the sheet`,
      output_contract: "the call sheet, seat by seat",
      model_tier: "L1",
      approval_class: "none",
      budget_max_tokens: 200_000,
      priority: 6,
      status: "running",
      project_id: projectId,
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  authorId = author.id;
  created.push(author.id);
});

afterAll(async () => {
  await sql`DELETE FROM task_events WHERE task_id IN (SELECT id FROM tasks WHERE project_id = ${projectId}::uuid)`.execute(db()).catch(() => {});
  await sql`DELETE FROM audit_log WHERE payload::text LIKE ${"%" + M + "%"}`.execute(db()).catch(() => {});
  await sql`DELETE FROM decision_log WHERE rationale LIKE ${"%" + M + "%"}`.execute(db()).catch(() => {});
  await sql`DELETE FROM tasks WHERE project_id = ${projectId}::uuid`.execute(db());
  await sql`DELETE FROM projects WHERE id = ${projectId}::uuid`.execute(db());
  await client.close();
  await closeDb();
});

describe("W9 · the road proof on the construction engine", () => {
  it("the Editor is recorded as assigned to the studio while staying in marketing", async () => {
    const row = (
      await sql<{ slug: string; home: string; assigned_to: string; since: string; ledger_id: string }>`
        SELECT a.slug, a.department AS home, d.slug AS assigned_to, x.since::text AS since, x.ledger_id
          FROM agent_assignments x
          JOIN agents a ON a.id = x.agent_id
          JOIN departments d ON d.id = x.department_id
         WHERE a.slug = ${EDITOR}
      `.execute(db())
    ).rows[0];
    expect(row).toBeTruthy();
    expect(row!.home).toBe("marketing");
    expect(row!.assigned_to).toBe("media-studio");
    expect(row!.since).toBe("2026-09-03");
    expect(row!.ledger_id).toBe("media-studio-department-and-16-experts-2026-09-03");
  });

  it("a studio sheet naming the Editor is dispatched, and the task row carries his slug", async () => {
    const sheet = await call("queue_dispatch", {
      task_id: authorId,
      code: `${M}-SHEET`,
      seats: [
        {
          seat: "media-ai-video-engineer",
          objective: `${M} shoot the take the brief asks for, whole`,
          output_contract: "the take, with its engine and settings recorded",
          label: "the take",
          label_tr: "çekim",
          deps: [],
        },
        {
          seat: EDITOR,
          objective: `${M} cut the take to the brief's length and rhythm`,
          output_contract: "the cut, with the edit decisions named",
          label: "the cut",
          label_tr: "kurgu",
          deps: [0],
        },
      ],
    });
    expect(sheet.tasks).toHaveLength(2);

    const rows = (
      await sql<{ slug: string; department: string; home: string; status: string }>`
        SELECT a.slug, t.department, a.department AS home, t.status
          FROM tasks t JOIN agents a ON a.id = t.agent_id
         WHERE t.parent_task_id = ${authorId}::uuid
         ORDER BY a.slug
      `.execute(db())
    ).rows;
    const editor = rows.find((r) => r.slug === EDITOR);
    expect(editor, "the Editor's task row must exist").toBeTruthy();
    expect(editor!.department).toBe("media-studio"); // the WORK belongs to the studio
    expect(editor!.home).toBe("marketing"); // the EMPLOYEE still belongs to marketing
    expect(editor!.status).toBe("queued");
  });

  it("a marketing seat with NO assignment is still refused on the same sheet", async () => {
    const stranger = (
      await sql<{ slug: string }>`
        SELECT a.slug FROM agents a
         WHERE a.department = 'marketing' AND a.employment_status = 'active'
           AND NOT EXISTS (SELECT 1 FROM agent_assignments x WHERE x.agent_id = a.id)
         ORDER BY a.slug LIMIT 1
      `.execute(db())
    ).rows[0];
    expect(stranger, "marketing must hold at least one unassigned seat for this case").toBeTruthy();
    const before = (
      await sql<{ n: number }>`SELECT count(*)::int AS n FROM tasks WHERE parent_task_id = ${authorId}::uuid`.execute(db())
    ).rows[0]!.n;
    await expect(
      call("queue_dispatch", {
        task_id: authorId,
        code: `${M}-REFUSED`,
        seats: [
          {
            seat: stranger!.slug,
            objective: `${M} a seat nobody assigned to the studio`,
            output_contract: "nothing — this must not be born",
            label: "stranger",
            label_tr: "yabancı",
            deps: [],
          },
        ],
      }),
    ).rejects.toThrow(/belongs to 'marketing', not 'media-studio'/);
    const after = (
      await sql<{ n: number }>`SELECT count(*)::int AS n FROM tasks WHERE parent_task_id = ${authorId}::uuid`.execute(db())
    ).rows[0]!.n;
    expect(after).toBe(before);
  });
});
