import { mkdtempSync, existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/index.js";
import {
  compileLibraryProfiles,
  generateProfilesFromPolicy,
  readLibraryLayer,
} from "../../packages/gateway/src/index.js";

// E9.5 verification — HOLDING_LIBRARY_SPEC §5/§13/§14/§20/§21:
//   control_library_action: CEO wall (§13), register/update/grant/revoke,
//   idempotency replay + MISMATCH, change_log INSIDE the fn (§5 — creation
//   entry + field-level diff), owner_dept slug normalization, settings-channel
//   broadcasts (§9), expired grants dead everywhere (adaptation A2),
//   grant→profile compilation (§20 mock-level via generateProfiles + real
//   compileLibraryProfiles staging/swap/hash-skip), §21 E2E: revoke →
//   recompile → gateway resolution refused (tool AND skill legs),
//   usage counter trigger (adaptation A7), anon zero grant.
// Suite deletes ONLY what it creates (tests/helpers rule, E9.3 incident).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();
const M = "e95t"; // suite marker

// ── helpers ──────────────────────────────────────────────────────────────────

async function ceoActionKeyed(
  payload: Record<string, unknown>,
  key: string,
): Promise<Record<string, unknown>> {
  return db()
    .transaction()
    .execute(async (trx) => {
      await sql`SELECT set_config('request.jwt.claims',
        '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`.execute(trx);
      const res = await sql<{ resp: Record<string, unknown> }>`
        SELECT control_library_action(${JSON.stringify(payload)}::jsonb, ${key}) AS resp
      `.execute(trx);
      return res.rows[0].resp;
    });
}

async function ceoAction(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return ceoActionKeyed(payload, `${M}-${randomUUID()}`);
}

/** system-context call (postgres session → actor 'system'). */
async function systemAction(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await sql<{ resp: Record<string, unknown> }>`
    SELECT control_library_action(${JSON.stringify(payload)}::jsonb, ${`${M}-${randomUUID()}`}) AS resp
  `.execute(db());
  return res.rows[0].resp;
}

async function registerItem(
  over: Record<string, unknown> = {},
): Promise<{ itemId: string; resp: Record<string, unknown> }> {
  const resp = await ceoAction({
    action: "register_item",
    kind: "skill",
    name: `${M}-${randomUUID().slice(0, 8)}`,
    ...over,
  });
  expect(resp.ok).toBe(true);
  return { itemId: resp.item_id as string, resp };
}

/** The resolution an MCP-profiled session performs (phase7 runtime idiom):
 *  filter-before-discovery — denied capability fails at SELECTION. */
interface Profile {
  mcpServers: Record<string, unknown>;
  _tools: Record<string, "*" | string[]>;
  _skills?: string[];
}
function resolveTool(profile: Profile, server: string, tool: string) {
  if (!profile.mcpServers[server]) throw new Error(`tool not found: ${server}.${tool}`);
  const allowed = profile._tools[server];
  if (allowed !== "*" && !allowed?.includes(tool)) {
    throw new Error(`tool not found: ${server}.${tool}`);
  }
  return tool;
}
function resolveSkill(profile: Profile, skill: string) {
  // _skills present = the record governs (A5); absent = registry behavior.
  if (profile._skills && !profile._skills.includes(skill)) {
    throw new Error(`skill not found: ${skill}`);
  }
  return skill;
}

async function sweep() {
  // Items created by this suite: e95t-* names or version marker 'e95t'.
  // Grants/usage/change rows cascade with the item.
  const items = await sql<{ id: string }>`
    SELECT id FROM library_items WHERE name LIKE ${`${M}-%`} OR version = ${M}
       OR name LIKE ${`dxb-mcp.${M}%`}
  `.execute(db());
  const ids = items.rows.map((r) => r.id);
  if (ids.length > 0) {
    await sql`DELETE FROM audit_log WHERE action LIKE 'library.%'
      AND (payload->>'item_id')::uuid = ANY(${ids}::uuid[])`.execute(db());
    await sql`DELETE FROM library_items WHERE id = ANY(${ids}::uuid[])`.execute(db());
  }
  await sql`DELETE FROM tool_calls WHERE run_id IN (
    SELECT ar.id FROM agent_runs ar JOIN tasks t ON t.id = ar.task_id
     WHERE t.department = ${`${M}-dept`})`.execute(db());
  await sql`DELETE FROM agent_runs WHERE task_id IN (
    SELECT id FROM tasks WHERE department = ${`${M}-dept`})`.execute(db());
  await sql`DELETE FROM tasks WHERE department = ${`${M}-dept`}`.execute(db());
  await sql`DELETE FROM control_idempotency WHERE key LIKE ${`${M}-%`}`.execute(db());
}

beforeAll(sweep);
afterAll(async () => {
  await sweep();
  await closeDb();
});

// ── §13 CEO wall + grants surface ────────────────────────────────────────────

describe("CEO wall (§13)", () => {
  it("system actor is rejected on every op", async () => {
    for (const payload of [
      { action: "register_item", kind: "skill", name: `${M}-wall` },
      { action: "update_item", item_id: randomUUID(), usage_notes: "x" },
      { action: "grant", item_id: randomUUID(), grantee_kind: "department", grantee_id: "engineering" },
      { action: "revoke_grant", grant_id: 1 },
    ]) {
      const resp = await systemAction(payload);
      expect(resp.ok).toBe(false);
      expect(resp.error).toBe("PERMISSION_DENIED");
    }
  });

  it("anon holds zero execute grant on the fn", async () => {
    const res = await sql<{ ok: boolean }>`
      SELECT has_function_privilege('anon',
        'public.control_library_action(jsonb, text)', 'EXECUTE') AS ok
    `.execute(db());
    expect(res.rows[0].ok).toBe(false);
  });
});

// ── register / update (§5 change_log inside the fn) ─────────────────────────

describe("register_item / update_item", () => {
  it("register writes the creation change_log entry + audit row", async () => {
    const { itemId, resp } = await registerItem({ owner_dept: "engineering", source_ref: "x/y" });
    expect(resp.change_id).toBeTruthy();

    const chg = await sql<{ change: { field: string }[]; changed_by: string }>`
      SELECT change, changed_by FROM library_change_log WHERE item_id = ${itemId}::uuid
    `.execute(db());
    expect(chg.rows).toHaveLength(1);
    expect(chg.rows[0].change[0].field).toBe("*");
    expect(chg.rows[0].changed_by).toBe("ceo");

    // owner_dept slug normalized to the registry uuid.
    const item = await sql<{ owner_dept: string | null }>`
      SELECT owner_dept FROM library_items WHERE id = ${itemId}::uuid
    `.execute(db());
    const eng = await sql<{ id: string }>`
      SELECT id FROM departments WHERE slug = 'engineering'
    `.execute(db());
    expect(item.rows[0].owner_dept).toBe(eng.rows[0].id);

    const audit = await sql<{ actor: string; detail_ref: { table: string } }>`
      SELECT actor, detail_ref FROM audit_log
       WHERE action = 'library.register_item' AND (payload->>'item_id')::uuid = ${itemId}::uuid
    `.execute(db());
    expect(audit.rows).toHaveLength(1);
    expect(audit.rows[0].detail_ref.table).toBe("library_change_log");
  });

  it("idempotency: replay returns the stored response; digest mismatch rejected", async () => {
    const key = `${M}-${randomUUID()}`;
    const payload = { action: "register_item", kind: "sop", name: `${M}-idem` };
    const first = await ceoActionKeyed(payload, key);
    expect(first.ok).toBe(true);
    const replay = await ceoActionKeyed(payload, key);
    expect(replay).toEqual(first);
    const rows = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM library_items WHERE name = ${`${M}-idem`}
    `.execute(db());
    expect(rows.rows[0].n).toBe(1);

    const mismatch = await ceoActionKeyed(
      { action: "register_item", kind: "sop", name: `${M}-idem-other` },
      key,
    );
    expect(mismatch.error).toBe("IDEMPOTENCY_MISMATCH");
  });

  it("duplicate kind/name/version → CONFLICT_STALE; unknown kind → VALIDATION_FAILED", async () => {
    const { resp } = await registerItem({ name: `${M}-dup`, version: "v1" });
    expect(resp.ok).toBe(true);
    const dup = await ceoAction({ action: "register_item", kind: "skill", name: `${M}-dup`, version: "v1" });
    expect(dup.error).toBe("CONFLICT_STALE");
    const bad = await ceoAction({ action: "register_item", kind: "not-a-kind", name: `${M}-bad` });
    expect(bad.error).toBe("VALIDATION_FAILED");
  });

  it("update writes the field-level diff; a no-op update writes NO change row", async () => {
    const { itemId } = await registerItem();
    const upd = await ceoAction({
      action: "update_item",
      item_id: itemId,
      quality_score: 88,
      review_status: "approved",
    });
    expect(upd.ok).toBe(true);
    const chg = await sql<{ change: { field: string; old: unknown; new: unknown }[] }>`
      SELECT change FROM library_change_log
       WHERE item_id = ${itemId}::uuid AND id = ${upd.change_id as number}
    `.execute(db());
    const fields = chg.rows[0].change.map((c) => c.field).sort();
    expect(fields).toEqual(["quality_score", "review_status"]);

    const noop = await ceoAction({
      action: "update_item",
      item_id: itemId,
      quality_score: 88,
      review_status: "approved",
    });
    expect(noop.ok).toBe(true);
    expect(noop.no_change).toBe(true);
    const count = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM library_change_log WHERE item_id = ${itemId}::uuid
    `.execute(db());
    expect(count.rows[0].n).toBe(2); // creation + one real update
  });
});

// ── grant / revoke (§9 broadcast, A2 expiry) ─────────────────────────────────

describe("grant / revoke_grant", () => {
  it("department grant accepts slug or uuid and stores the registry slug; broadcast lands on dxb:settings", async () => {
    const since = new Date(Date.now() - 2000);
    const { itemId } = await registerItem();
    const byUuid = await sql<{ id: string }>`
      SELECT id FROM departments WHERE slug = 'quality'
    `.execute(db());
    const resp = await ceoAction({
      action: "grant",
      item_id: itemId,
      grantee_kind: "department",
      grantee_id: byUuid.rows[0].id,
    });
    expect(resp.ok).toBe(true);
    const grant = await sql<{ grantee_id: string }>`
      SELECT grantee_id FROM library_grants WHERE id = ${resp.grant_id as number}
    `.execute(db());
    expect(grant.rows[0].grantee_id).toBe("quality");

    const msgs = await sql<{ payload: Record<string, any> }>`
      SELECT payload FROM realtime.messages
       WHERE topic = 'dxb:settings' AND extension = 'broadcast'
         AND inserted_at >= ${since.toISOString()}::timestamp
    `.execute(db());
    const mine = msgs.rows.filter(
      (r) => r.payload.type === "library_grant.changed" && r.payload.payload?.grant_id === resp.grant_id,
    );
    expect(mine).toHaveLength(1);

    // Skill-kind grants feed the library layer — leave none behind for the
    // compiler assertions below.
    const rv = await ceoAction({ action: "revoke_grant", grant_id: resp.grant_id });
    expect(rv.ok).toBe(true);
  });

  it("employee grant validates the agent; unknown employee/department rejected", async () => {
    const { itemId } = await registerItem();
    const missing = await ceoAction({
      action: "grant",
      item_id: itemId,
      grantee_kind: "employee",
      grantee_id: randomUUID(),
    });
    expect(missing.error).toBe("VALIDATION_FAILED");
    const badDept = await ceoAction({
      action: "grant",
      item_id: itemId,
      grantee_kind: "department",
      grantee_id: "no-such-dept",
    });
    expect(badDept.error).toBe("VALIDATION_FAILED");
  });

  it("revoke removes the row; second revoke → VALIDATION_FAILED", async () => {
    const { itemId } = await registerItem();
    const g = await ceoAction({
      action: "grant",
      item_id: itemId,
      grantee_kind: "role_level",
      grantee_id: "specialist",
    });
    expect(g.ok).toBe(true);
    const rv = await ceoAction({
      action: "revoke_grant",
      item_id: itemId,
      grantee_kind: "role_level",
      grantee_id: "specialist",
    });
    expect(rv.ok).toBe(true);
    const again = await ceoAction({ action: "revoke_grant", grant_id: g.grant_id });
    expect(again.error).toBe("VALIDATION_FAILED");
  });

  it("expired grants are dead: view grant_count 0, layer omits the subject (A2)", async () => {
    const { itemId } = await registerItem({
      kind: "tool",
      name: `dxb-mcp.${M}_expired_tool`,
    });
    const g = await ceoAction({
      action: "grant",
      item_id: itemId,
      grantee_kind: "department",
      grantee_id: "quality",
      expires_at: new Date(Date.now() - 60_000).toISOString(),
    });
    expect(g.ok).toBe(true);
    const view = await sql<{ grant_count: number }>`
      SELECT grant_count FROM v_library_catalog WHERE id = ${itemId}::uuid
    `.execute(db());
    expect(view.rows[0].grant_count).toBe(0);
    const layer = await readLibraryLayer(db());
    expect(layer.departments.quality).toBeUndefined();
    await ceoAction({ action: "revoke_grant", grant_id: g.grant_id });
  });
});

// ── grant → profile compilation → gateway refusal (§20/§21, A4/A5) ──────────

describe("grant→profile chain (G3, §21 E2E)", () => {
  const outA = mkdtempSync(join(tmpdir(), "dxb-e95-lib-"));
  const outB = mkdtempSync(join(tmpdir(), "dxb-e95-base-"));
  const compileDir = mkdtempSync(join(tmpdir(), "dxb-e95-compile-"));
  afterAll(() => {
    for (const d of [outA, outB, compileDir]) rmSync(d, { recursive: true, force: true });
  });

  it("full record→profile→resolution chain incl. revoke refusal", async () => {
    // Probe items: one concrete tool, one skill, one MCP group (version marker
    // 'e95t' keeps them apart from the intake-registered real rows).
    const tool = await registerItem({ kind: "tool", name: "dxb-mcp.queue_list", version: M });
    const skill = await registerItem({ kind: "skill", name: `${M}-skill-probe` });
    const group = await registerItem({ kind: "mcp", name: "dxb-mcp/queue", version: M });

    // Department grant: 'testing' gets ONLY the queue group.
    const gGroup = await ceoAction({
      action: "grant",
      item_id: group.itemId,
      grantee_kind: "department",
      grantee_id: "quality",
    });
    expect(gGroup.ok).toBe(true);

    // Employee grants: an engineering specialist gets the tool + the skill.
    const agent = await sql<{ id: string; slug: string }>`
      SELECT id, slug FROM agents
       WHERE department = 'engineering' AND employment_status IS DISTINCT FROM 'archived'
       ORDER BY slug LIMIT 1
    `.execute(db());
    const empId = agent.rows[0].id;
    const empSlug = agent.rows[0].slug;
    const gTool = await ceoAction({
      action: "grant", item_id: tool.itemId, grantee_kind: "employee", grantee_id: empId,
    });
    const gSkill = await ceoAction({
      action: "grant", item_id: skill.itemId, grantee_kind: "employee", grantee_id: empId,
    });
    expect(gTool.ok).toBe(true);
    expect(gSkill.ok).toBe(true);

    // Layer reader: union + expansion.
    const layer = await readLibraryLayer(db());
    expect(layer.departments.quality.tools).toContain("dxb-mcp.queue_list");
    expect(layer.departments.quality.tools.every((t) => t.startsWith("dxb-mcp.queue_"))).toBe(true);
    expect(layer.employees[empSlug].tools).toContain("dxb-mcp.queue_list");
    expect(layer.employees[empSlug].skills).toContain(`${M}-skill-probe`);

    // Generate WITH the layer + a baseline WITHOUT it.
    const withLib = await generateProfilesFromPolicy(db(), {
      outDir: outA, generatedAt: "2026-07-14T00:00:00.000Z", library: layer,
    });
    const baseline = await generateProfilesFromPolicy(db(), {
      outDir: outB, generatedAt: "2026-07-14T00:00:00.000Z",
    });

    // §22 backward compat: a dept with ZERO library grants is byte-identical.
    const readP = (dir: string, f: string) => JSON.parse(readFileSync(join(dir, f), "utf8")) as Profile;
    expect(readP(outA, "marketing.mcp.json")._tools).toEqual(readP(outB, "marketing.mcp.json")._tools);

    // A4 intersection: testing keeps ONLY the granted queue_* surface.
    const testing = readP(outA, "quality.mcp.json");
    const testingTools = testing._tools["dxb-mcp"];
    expect(Array.isArray(testingTools) && testingTools.length > 0).toBe(true);
    expect((testingTools as string[]).every((t) => t.startsWith("queue_"))).toBe(true);
    expect(testing._skills).toEqual([]); // record governs, no skill grants
    expect(() => resolveTool(testing, "dxb-mcp", "audit_append")).toThrow(/tool not found/);
    const filtered = withLib.profiles.find((p) => p.department === "quality")!;
    expect(filtered.libraryFiltered).toContain("dxb-mcp.audit_append");

    // Employee overlay: dept baseline ∩ union — tool + skill resolve.
    expect(withLib.employeeProfiles.map((p) => p.employee)).toContain(empSlug);
    const overlay = readP(outA, `${empSlug}.employee.mcp.json`);
    expect(resolveTool(overlay, "dxb-mcp", "queue_list")).toBe("queue_list");
    expect(resolveSkill(overlay, `${M}-skill-probe`)).toBe(`${M}-skill-probe`);

    // §21 E2E leg 1 — revoke the SKILL grant → recompile → skill refused,
    // tool still resolves.
    await ceoAction({ action: "revoke_grant", grant_id: gSkill.grant_id });
    const layer2 = await readLibraryLayer(db());
    await generateProfilesFromPolicy(db(), {
      outDir: outA, generatedAt: "2026-07-14T00:00:00.000Z", library: layer2,
    });
    const overlay2 = readP(outA, `${empSlug}.employee.mcp.json`);
    expect(() => resolveSkill(overlay2, `${M}-skill-probe`)).toThrow(/skill not found/);
    expect(resolveTool(overlay2, "dxb-mcp", "queue_list")).toBe("queue_list");

    // §21 E2E leg 2 — revoke the TOOL grant → the employee holds no
    // employee-kind grants → no overlay emitted at all.
    await ceoAction({ action: "revoke_grant", grant_id: gTool.grant_id });
    const layer3 = await readLibraryLayer(db());
    const after = await generateProfilesFromPolicy(db(), {
      outDir: outB, generatedAt: "2026-07-14T00:00:00.000Z", library: layer3,
    });
    expect(after.employeeProfiles.map((p) => p.employee)).not.toContain(empSlug);

    await ceoAction({ action: "revoke_grant", grant_id: gGroup.grant_id });
  });

  it("compileLibraryProfiles: staging swap, hash-skip, stale overlay cleanup, system event", async () => {
    const since = new Date(Date.now() - 2000);
    const first = await compileLibraryProfiles(db(), {
      outDir: compileDir, generatedAt: "2026-07-14T00:00:00.000Z",
    });
    expect(first.changed).toBe(true);
    expect(existsSync(join(compileDir, "_manifest.json"))).toBe(true);
    expect(existsSync(join(compileDir, "quality.mcp.json"))).toBe(true);
    // No .staging residue after the swap.
    expect(readdirSync(compileDir).some((f) => f.startsWith(".staging-"))).toBe(false);

    const again = await compileLibraryProfiles(db(), {
      outDir: compileDir, generatedAt: "2026-07-14T01:00:00.000Z",
    });
    expect(again.changed).toBe(false); // same record → same hash → no rewrite

    // Grant change moves the hash → rewrite + system channel event.
    const { itemId } = await registerItem({ kind: "tool", name: `dxb-mcp.${M}_compile_tool` });
    const g = await ceoAction({
      action: "grant", item_id: itemId, grantee_kind: "department", grantee_id: "quality",
    });
    const third = await compileLibraryProfiles(db(), {
      outDir: compileDir, generatedAt: "2026-07-14T02:00:00.000Z",
    });
    expect(third.changed).toBe(true);

    const msgs = await sql<{ payload: Record<string, any> }>`
      SELECT payload FROM realtime.messages
       WHERE topic = 'dxb:system' AND extension = 'broadcast'
         AND inserted_at >= ${since.toISOString()}::timestamp
    `.execute(db());
    expect(
      msgs.rows.some(
        (r) => r.payload.type === "profile.recompiled" && r.payload.payload?.source_hash === third.sourceHash,
      ),
    ).toBe(true);

    await ceoAction({ action: "revoke_grant", grant_id: g.grant_id });
    const fourth = await compileLibraryProfiles(db(), {
      outDir: compileDir, generatedAt: "2026-07-14T03:00:00.000Z",
    });
    expect(fourth.changed).toBe(true);
  });
});

// ── usage counter (adaptation A7) ────────────────────────────────────────────

describe("usage counter trigger", () => {
  it("a recorded tool call lands one usage row + bumps last_used_at; unknown tools are silent", async () => {
    const { itemId } = await registerItem({ kind: "tool", name: `dxb-mcp.${M}_probe_tool` });

    const task = await sql<{ id: string }>`
      INSERT INTO tasks (department, objective, output_contract, model_tier, status)
      VALUES (${`${M}-dept`}, 'e95 usage probe', 'none', 'L1', 'running')
      RETURNING id
    `.execute(db());
    const run = await sql<{ id: string }>`
      INSERT INTO agent_runs (task_id, status) VALUES (${task.rows[0].id}::uuid, 'running')
      RETURNING id
    `.execute(db());

    await sql`INSERT INTO tool_calls (run_id, tool, ok)
      VALUES (${run.rows[0].id}::uuid, ${`${M}_probe_tool`}, true)`.execute(db());
    await sql`INSERT INTO tool_calls (run_id, tool, ok)
      VALUES (${run.rows[0].id}::uuid, ${`${M}_unknown_tool`}, true)`.execute(db());

    const usage = await sql<{ run_id: string }>`
      SELECT run_id FROM library_usage_log WHERE item_id = ${itemId}::uuid
    `.execute(db());
    expect(usage.rows).toHaveLength(1);
    expect(usage.rows[0].run_id).toBe(run.rows[0].id);

    const item = await sql<{ last_used_at: string | null }>`
      SELECT last_used_at FROM library_items WHERE id = ${itemId}::uuid
    `.execute(db());
    expect(item.rows[0].last_used_at).not.toBeNull();

    const total = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM library_usage_log
       WHERE run_id = ${run.rows[0].id}::uuid
    `.execute(db());
    expect(total.rows[0].n).toBe(1); // unknown tool wrote nothing
  });
});
