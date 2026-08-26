import { readFileSync } from "node:fs";
import { join } from "node:path";

import { sql } from "kysely";
import { afterAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "../../packages/shared/src/index.js";
import { hostOpsLiveCollector } from "../../packages/outbox-executor/src/ops-live-host.js";

// B38 · THE ops:live COLLECTOR IS HOSTED, AND IT STAYS HOSTED.
//
// THE DEFECT THIS FILE HOLDS, measured 2026-08-24. `startOpsLiveCollector` had
// one caller outside its own package and it was a test. No unit, no process, no
// row ever on the `dxb:ops:live` topic — the source triggers fired, the
// envelopes reached pg_notify, and there they stopped. The CEO's Live
// Operations page subscribed to a channel with no producer, so it could only
// ever say "no operations events yet", whatever the company did.
//
// EVENT_MODEL §26 (R5) had already decided WHERE it belongs — inside the
// existing resident loop, never a new service — and nobody put it there.
//
// The second half of the defect is subtler and this file holds it too: a LISTEN
// connection can die while the process stays healthy. Nothing crashes and
// nothing logs, so the page stops updating and no terminal says why. The host
// must therefore notice and rebuild, not merely start it once.

const db = () => getDb();
const REPO = process.cwd();

afterAll(async () => {
  await closeDb();
});

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Backend pids sitting on a LISTEN for the ops:live firehose. */
async function listeners(): Promise<number[]> {
  const rows = (await sql<{
    pid: number;
  }>`SELECT pid FROM pg_stat_activity WHERE query ILIKE 'LISTEN dxb_ops_live%'`.execute(db())).rows;
  return rows.map((r) => r.pid);
}

describe("B38 — the ops:live collector has a host", () => {
  it("is started by the ONE resident process, and stopped with it", () => {
    // A behaviour test cannot see who calls the host in production, so this
    // case reads the entrypoint: the exact thing that was missing for months.
    const main = readFileSync(join(REPO, "packages/outbox-executor/src/main.ts"), "utf8");
    expect(main, "the resident scheduler does not host the collector").toContain("hostOpsLiveCollector");
    expect(main, "the collector is not stopped on the way down").toMatch(/opsLive[\s\S]{0,40}\.stop\(\)/);
    // §26 (R5): it must NOT get a service of its own.
    const units = join(process.env.HOME ?? "", ".config/systemd/user");
    expect(
      readFileSync(join(REPO, "HOLDING-OS-MASTER-PLAN/EVENT_MODEL.md"), "utf8"),
      "the §26 decision this host obeys has gone from the spec",
    ).toContain("yeni servis AÇILMAZ");
    expect(units.length).toBeGreaterThan(0);
  });

  it("listens as soon as the host is up", async () => {
    const before = await listeners();
    const host = await hostOpsLiveCollector({ firstRetryMs: 100, maxRetryMs: 400, log: () => {} });
    try {
      expect(host.starts()).toBe(1);
      expect(host.current()).not.toBeNull();
      const now = await listeners();
      expect(now.length, "no backend is listening on dxb_ops_live").toBeGreaterThan(before.length);
    } finally {
      await host.stop();
    }
  });

  it("rebuilds itself when the listen connection dies underneath it", async () => {
    const before = new Set(await listeners());
    const logs: string[] = [];
    const host = await hostOpsLiveCollector({
      firstRetryMs: 100,
      maxRetryMs: 400,
      log: (line) => logs.push(line),
    });
    try {
      expect(host.starts()).toBe(1);
      const mine = (await listeners()).filter((pid) => !before.has(pid));
      expect(mine.length, "could not find the collector's own backend").toBeGreaterThan(0);

      // The silent failure this row is about: the connection goes, the process
      // stays up. Nothing here kills the collector object — only its socket.
      for (const pid of mine) {
        await sql`SELECT pg_terminate_backend(${pid})`.execute(db());
      }

      const deadline = Date.now() + 8_000;
      while (host.starts() < 2 && Date.now() < deadline) await sleep(50);
      expect(host.starts(), `the host never rebuilt the collector. Log:\n${logs.join("\n")}`).toBeGreaterThanOrEqual(2);
      expect(host.current(), "rebuilt, but nothing is listening").not.toBeNull();
      expect(logs.join("\n")).toContain("listen connection lost");
    } finally {
      await host.stop();
    }
  }, 20_000);

  it("stops cleanly, and stays stopped", async () => {
    const host = await hostOpsLiveCollector({ firstRetryMs: 100, maxRetryMs: 400, log: () => {} });
    await host.stop();
    expect(host.current()).toBeNull();
    const startsAfterStop = host.starts();
    await sleep(400);
    expect(host.starts(), "a stopped host went on rebuilding itself").toBe(startsAfterStop);
  });
});
