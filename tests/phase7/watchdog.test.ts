import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  ARTIFACTLESS_LIMIT_MS,
  decideKill,
  validateJob,
  type RunningJobFacts,
} from "../../tools/dxb-cli/src/watchdog-decide.js";
import { killSwitch, type KillSwitchDeps } from "../../tools/dxb-cli/src/kill-switch.js";

// 07-06 Task 2 deterministic halves (plan): kill decisions + loader rejection
// + kill-switch state transitions with the LiteLLM/systemctl seam mocked —
// the live halves (real key block, real unit stop) are proven on the VPS in
// Task 3. DB parts run against the local stack like every phase-3+ suite.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const BUDGET = { max_steps: 30, max_tokens: 150000, max_cost_eur: 0.5 };
const NOW = new Date("2026-07-09T08:00:00Z");

function facts(over: Partial<RunningJobFacts> = {}): RunningJobFacts {
  return {
    job: "social-morning-scan",
    budget: BUDGET,
    startedAt: new Date("2026-07-09T06:00:00Z"), // 2h ago exactly
    artifactExists: false,
    spentEur: 0.1,
    steps: 5,
    tokens: 20000,
    ...over,
  };
}

describe("watchdog decideKill (master rule parity)", () => {
  it("kills when over cost budget", () => {
    const d = decideKill(facts({ spentEur: 0.51 }), NOW);
    expect(d.kill).toBe(true);
    expect(d.reason).toMatch(/^over_budget:cost/);
  });

  it("kills when over step budget", () => {
    const d = decideKill(facts({ steps: 31 }), NOW);
    expect(d.kill).toBe(true);
    expect(d.reason).toMatch(/^over_budget:steps/);
  });

  it("kills when over token budget", () => {
    const d = decideKill(facts({ tokens: 150001 }), NOW);
    expect(d.kill).toBe(true);
    expect(d.reason).toMatch(/^over_budget:tokens/);
  });

  it("kills an artifactless job past 2 hours", () => {
    const past = new Date(NOW.getTime() - ARTIFACTLESS_LIMIT_MS - 60_000);
    const d = decideKill(facts({ startedAt: past }), NOW);
    expect(d.kill).toBe(true);
    expect(d.reason).toMatch(/^artifactless_2h/);
  });

  it("leaves an artifactless job under 2 hours untouched", () => {
    const recent = new Date(NOW.getTime() - 30 * 60_000);
    expect(decideKill(facts({ startedAt: recent }), NOW).kill).toBe(false);
  });

  it("leaves a long job WITH artifact untouched (healthy)", () => {
    const past = new Date(NOW.getTime() - 3 * 60 * 60 * 1000);
    const d = decideKill(facts({ startedAt: past, artifactExists: true }), NOW);
    expect(d.kill).toBe(false);
    expect(d.reason).toBeNull();
  });
});

describe("job validation (Pitfall 9 — loader parity)", () => {
  it("accepts the shipped template job (all mandatory fields)", () => {
    const text = readFileSync("vps/hermes/jobs/social-morning-scan.md", "utf8");
    expect(validateJob(text)).toEqual([]);
  });

  it("reports every missing mandatory field", () => {
    const missing = validateJob("job: bad\nschedule: \"0 6 * * *\"\nmax_steps: 5\n");
    expect(missing).toEqual(["max_tokens:", "max_cost_eur:", "artifact:", "on_output:"]);
  });

  it("load-jobs.sh REJECTS a fixture job missing artifact, loudly", () => {
    const dir = mkdtempSync(join(tmpdir(), "hermes-loader-"));
    try {
      mkdirSync(join(dir, "jobs"));
      writeFileSync(
        join(dir, "jobs", "bad-job.md"),
        'schedule: "0 6 * * *"\nbudget: { max_steps: 1, max_tokens: 10, max_cost_eur: 0.01 }\non_output: queue_review\n',
      );
      // stub sudo so the audit fallback path runs deterministically (no docker here)
      writeFileSync(join(dir, "sudo"), "#!/bin/sh\nexit 1\n");
      chmodSync(join(dir, "sudo"), 0o755);
      let out = "";
      try {
        out = execFileSync("vps/hermes/load-jobs.sh", {
          env: { ...process.env, HERMES_DIR: dir, PATH: `${dir}:${process.env.PATH}` },
          encoding: "utf8",
          stderr: "pipe",
        });
      } catch (e) {
        out = String((e as { stdout?: string }).stdout ?? "") + String((e as { stderr?: string }).stderr ?? "");
      }
      expect(out).toContain("LOAD_JOBS_OK enabled=0 rejected=1");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("kill-switch state transitions (deps seam; live halves in Task 3)", () => {
  const db = getDb();
  let initialHardStop: boolean | null = null;

  function mockDeps(keyState: Map<string, boolean>, failAlias?: string): KillSwitchDeps {
    return {
      db,
      listKeys: async () =>
        [...keyState.entries()].map(([alias, blocked]) => ({
          token: `tok-${alias}`,
          key_alias: alias,
          blocked,
        })),
      setKeyBlocked: async (token, blocked) => {
        const alias = token.replace(/^tok-/, "");
        if (alias === failAlias) throw new Error("proxy 500");
        keyState.set(alias, blocked);
      },
      systemctl: async (action) => (action === "is-active" ? "inactive" : "ok"),
    };
  }

  async function auditCount(action: string): Promise<number> {
    const r = await db
      .selectFrom("audit_log")
      .select(db.fn.countAll<string>().as("n"))
      .where("action", "=", action)
      .executeTakeFirstOrThrow();
    return Number(r.n);
  }

  afterAll(async () => {
    if (initialHardStop !== null) {
      await db.updateTable("budget_state").set({ hard_stopped: initialHardStop }).execute();
    }
    await closeDb();
  });

  it("on: flips hard_stopped, blocks all keys, stops hermes, audits", async () => {
    const state = await db.selectFrom("budget_state").select("hard_stopped").executeTakeFirstOrThrow();
    initialHardStop = state.hard_stopped;
    const keys = new Map([["dxb-finance", false], ["dxb-hermes", false]]);
    const before = await auditCount("kill_switch.on");

    const r = await killSwitch("on", mockDeps(keys));

    expect(r.hard_stopped).toBe(true);
    expect(r.keys_changed.sort()).toEqual(["dxb-finance", "dxb-hermes"]);
    expect(r.key_errors).toEqual([]);
    expect(r.hermes).toBe("stopped");
    expect([...keys.values()]).toEqual([true, true]);
    const flag = await db.selectFrom("budget_state").select("hard_stopped").executeTakeFirstOrThrow();
    expect(flag.hard_stopped).toBe(true);
    expect(await auditCount("kill_switch.on")).toBe(before + 1);
  });

  it("off: explicit reverse with its own audit row", async () => {
    const keys = new Map([["dxb-finance", true], ["dxb-hermes", true]]);
    const before = await auditCount("kill_switch.off");

    const r = await killSwitch("off", mockDeps(keys));

    expect(r.hard_stopped).toBe(false);
    expect(r.keys_changed.sort()).toEqual(["dxb-finance", "dxb-hermes"]);
    expect(r.hermes).toBe("started");
    expect([...keys.values()]).toEqual([false, false]);
    const flag = await db.selectFrom("budget_state").select("hard_stopped").executeTakeFirstOrThrow();
    expect(flag.hard_stopped).toBe(false);
    expect(await auditCount("kill_switch.off")).toBe(before + 1);
  });

  it("half-applied switch is VISIBLE: one key fails, error recorded, rest applied (T-07-23)", async () => {
    const keys = new Map([["dxb-finance", false], ["dxb-hermes", false]]);
    const r = await killSwitch("on", mockDeps(keys, "dxb-hermes"));

    expect(r.keys_changed).toEqual(["dxb-finance"]);
    expect(r.key_errors).toHaveLength(1);
    expect(r.key_errors[0]).toContain("dxb-hermes");
    // cleanup: reverse for the next assertion runs
    await killSwitch("off", mockDeps(keys));
  });

  it("status: reports each effect independently, no state change", async () => {
    await killSwitch("off", mockDeps(new Map()));
    const keys = new Map([["dxb-finance", true], ["dxb-hermes", false]]);

    const r = await killSwitch("status", mockDeps(keys));

    expect(r.action).toBe("status");
    expect(r.hard_stopped).toBe(false);
    expect(r.keys_changed).toEqual(["dxb-finance"]); // blocked keys reported
    expect(r.hermes).toBe("inactive");
    expect([...keys.values()]).toEqual([true, false]); // untouched
  });
});
