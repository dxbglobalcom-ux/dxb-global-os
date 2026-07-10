import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// 08-02 Task 3: (a) the broadcast payload shape lib/realtime.ts reads is
// pinned against a real DB write; (b) DASH-05 purity — the dashboard owns
// ZERO write paths — is a machine gate from this plan onward. 08-03/08-05
// extend PURITY_ALLOWLIST explicitly when their write seams land.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const ACTOR = "test:live-projection";
let taskId: string;
let startedAt: string;

beforeAll(async () => {
  const clock = await sql<{ t: string }>`select localtimestamp::text as t`.execute(getDb());
  startedAt = clock.rows[0].t;
  const res = await sql<{ id: string }>`
    insert into tasks (department, objective, output_contract, model_tier)
    values ('engineering', 'live-projection test host task', 'n/a', 'L4')
    returning id
  `.execute(getDb());
  taskId = res.rows[0].id;
});

afterAll(async () => {
  const db = getDb();
  await sql`delete from realtime.messages where topic like 'dxb:%' and inserted_at >= ${startedAt}::timestamp`.execute(db);
  await sql`delete from task_events where actor = ${ACTOR}`.execute(db);
  if (taskId) await sql`delete from tasks where id = ${taskId}::uuid`.execute(db);
  await closeDb();
});

describe("broadcast payload contract (lib/realtime.ts DxbBroadcastPayload)", () => {
  it("task transition write produces the exact field set the UI consumes", async () => {
    await sql`
      insert into task_events (task_id, event, from_status, to_status, actor)
      values (${taskId}::uuid, 'status_change', 'queued', 'running', ${ACTOR})
    `.execute(getDb());

    const res = await sql<{ payload: Record<string, unknown> }>`
      select payload from realtime.messages
      where topic = 'dxb:task_events' and extension = 'broadcast'
        and inserted_at >= ${startedAt}::timestamp
      order by inserted_at desc, id desc limit 1
    `.execute(getDb());

    const payload = res.rows[0].payload;
    // Contract fields (typed in lib/realtime.ts) — all present:
    expect(payload.operation).toBe("INSERT");
    expect(payload.table).toBe("task_events");
    expect(payload.schema).toBe("public");
    expect(payload).toHaveProperty("record");
    expect(payload).toHaveProperty("old_record");

    // Fields the board + Horizon Line deltas read from record:
    const record = payload.record as Record<string, unknown>;
    expect(record.task_id).toBe(taskId);
    expect(record.from_status).toBe("queued");
    expect(record.to_status).toBe("running");
    expect(record.actor).toBe(ACTOR);
    expect(record).toHaveProperty("created_at");
  });
});

// ---------------------------------------------------------------------------
// DASH-05 purity gate: the dashboard is a pure projection. Any PostgREST
// write chain (.from(...)....insert/update/upsert/delete) or .rpc( call in
// apps/dashboard/src must appear in this allowlist or the suite fails.
const PURITY_ALLOWLIST: string[] = [
  // 08-03: CEO approval decisions — single .rpc('decide_approvals') seam
  // (migration 0015; single-tx, audit 1:1, EXECUTE only for authenticated)
  "app/(cockpit)/approvals/actions.ts",
  // 08-05 will add: intent submission path file(s)
];

const DASHBOARD_SRC = join(__dirname, "../../apps/dashboard/src");

function collectSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return collectSourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe("DASH-05 purity gate — zero non-allowlisted write paths", () => {
  it("finds no PostgREST write chains or rpc calls outside the allowlist", () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(DASHBOARD_SRC)) {
      const rel = file.slice(DASHBOARD_SRC.length + 1);
      if (PURITY_ALLOWLIST.includes(rel)) continue;
      const flat = readFileSync(file, "utf8").replace(/\s+/g, "");
      // window after each .from(...) chain start: any write verb is a violation
      const fromChains = flat.matchAll(/\.from\([^)]*\)([^;]{0,300})/g);
      for (const [, chain] of fromChains) {
        if (/\.(insert|update|upsert|delete)\(/.test(chain)) {
          offenders.push(`${rel}: PostgREST write in from-chain`);
        }
      }
      if (/\.rpc\(/.test(flat)) offenders.push(`${rel}: rpc call`);
    }
    expect(offenders).toEqual([]);
  });
});
