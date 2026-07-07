import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// Gate criterion 3: a claimed task whose owner dies by kill -9 is re-claimable
// after lease expiry — zero state loss, 'reaped' event recorded.
// Timing: lease 2s, single 3s wait (margin, no polling) — flake-resistant.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const WORKER = fileURLToPath(new URL("./crash-worker.mjs", import.meta.url));
const DEPT = "crash-test";

beforeAll(async () => {
  const db = getDb();
  await db.deleteFrom("task_events").execute();
  await db.deleteFrom("tasks").where("department", "=", DEPT).execute();
});

afterAll(async () => {
  await closeDb();
});

describe("crash durability (QUEUE-02, kill -9)", () => {
  it("reaps the dead owner's lease and hands the SAME task to a new worker", async () => {
    const db = getDb();
    const task = await db
      .insertInto("tasks")
      .values({
        department: DEPT,
        objective: "crash test: survive a SIGKILLed claim owner without state loss",
        output_contract: "task re-claimable after reap",
        model_tier: "L4",
        status: "queued",
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // 1-2. real child process claims with a 2s lease and reports the id
    const child = spawn(process.execPath, [WORKER, DEPT, "2"], {
      env: { ...process.env },
      stdio: ["ignore", "pipe", "inherit"],
    });
    const [chunk] = (await once(child.stdout, "data")) as [Buffer];
    const claimedId = chunk.toString().trim();
    expect(claimedId).toBe(task.id);

    const midCrash = await db.selectFrom("tasks").select(["status", "claimed_by"]).where("id", "=", task.id).executeTakeFirstOrThrow();
    expect(midCrash.status).toBe("claimed");
    expect(midCrash.claimed_by).toContain("crash-victim");

    // 3. hard death — no cleanup path
    child.kill("SIGKILL");
    const [, signal] = (await once(child, "exit")) as [number | null, string | null];
    expect(signal).toBe("SIGKILL");

    // 4. wait past lease expiry (2s lease + 1s margin), then reap
    await new Promise((r) => setTimeout(r, 3000));
    const { rows } = await sql<{ reap_expired_leases: number }>`SELECT reap_expired_leases()`.execute(db);
    expect(Number(rows[0].reap_expired_leases)).toBeGreaterThanOrEqual(1);

    // 5. zero state loss: same task back to queued, lease cleared, 'reaped' evented
    const afterReap = await db.selectFrom("tasks").selectAll().where("id", "=", task.id).executeTakeFirstOrThrow();
    expect(afterReap.status).toBe("queued");
    expect(afterReap.claimed_by).toBeNull();
    expect(afterReap.lease_expires_at).toBeNull();

    const reapedEvent = await db
      .selectFrom("task_events")
      .selectAll()
      .where("task_id", "=", task.id)
      .where("event", "=", "reaped")
      .executeTakeFirstOrThrow();
    expect((reapedEvent.payload as any).was_claimed_by).toContain("crash-victim");

    // 6. a NEW worker claims the SAME task
    const { rows: reclaim } = await sql<Record<string, unknown>>`
      SELECT * FROM claim_next_task('worker-after-crash', ${sql.val([DEPT])}::text[], 900)
    `.execute(db);
    expect(reclaim[0]?.id).toBe(task.id);
    expect(reclaim[0]?.claimed_by).toBe("worker-after-crash");
  }, 20000);
});
