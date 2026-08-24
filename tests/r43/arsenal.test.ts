import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { readLibraryLayer } from "../../packages/gateway/src/library-profiles.js";

// R4.3 — Capability Arsenal Expansion verification. State-independent by
// design (R4.2 lesson: live production DB): every assertion measures the
// CURRENT live state that this wave's install created and future waves keep.

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const FREE_TRANCHE = ["git", "context7", "playwright", "scrapling"] as const;

const readJson = (rel: string) =>
  JSON.parse(readFileSync(join(ROOT, rel), "utf8")) as Record<string, any>;

describe("R4.3 capability arsenal", () => {
  it("(1) catalog carries every free-tranche server (kurulumsuz-blind = 0 for installed set)", () => {
    const { servers } = readJson("packages/gateway/policy/grants.json");
    for (const s of FREE_TRANCHE) expect(servers[s], s).toBeDefined();
  });

  it("(2) tool_pins hold schema-hashed rows per server, none quarantined at install", async () => {
    const db = getDb();
    const rows = await sql<{ server: string; n: string }>`
      SELECT server, count(*)::text AS n FROM tool_pins
       WHERE server = ANY(${[...FREE_TRANCHE]}) AND NOT quarantined
       GROUP BY server
    `.execute(db);
    const byServer = new Map(rows.rows.map((r) => [r.server, Number(r.n)]));
    expect(byServer.get("git")).toBe(12);
    expect(byServer.get("context7")).toBe(2);
    expect(byServer.get("playwright")).toBe(24);
    expect(byServer.get("scrapling")).toBe(10);
  });

  it("(3) library governs the hands: mcp items exist + department grants active (G3 chain)", async () => {
    const db = getDb();
    const grants = await sql<{ name: string; grantee_id: string }>`
      SELECT li.name, g.grantee_id
        FROM library_grants g JOIN library_items li ON li.id = g.item_id
       WHERE li.kind = 'mcp' AND li.name = ANY(${[...FREE_TRANCHE]})
         AND g.grantee_kind = 'department'
         AND (g.expires_at IS NULL OR g.expires_at > now())
    `.execute(db);
    const pairs = new Set(grants.rows.map((r) => `${r.name}→${r.grantee_id}`));
    for (const expected of [
      "git→engineering",
      "context7→engineering",
      "playwright→engineering",
      "playwright→quality",
      "scrapling→strategy",
    ]) {
      expect(pairs.has(expected), expected).toBe(true);
    }
  });

  it("(4) compiled profiles emit the new servers with denials applied (narrowest cut)", () => {
    const eng = readJson("packages/gateway/profiles/engineering.mcp.json");
    expect(Object.keys(eng.mcpServers)).toEqual(
      expect.arrayContaining(["git", "context7", "playwright"]),
    );
    // git write tools policy-denied (K1 construction rule).
    expect(eng._tools.git).not.toContain("git_commit");
    expect(eng._tools.git).toContain("git_status");
    // exfiltration-surface tools stripped from every playwright grantee.
    for (const dept of ["engineering", "quality"]) {
      const p = readJson(`packages/gateway/profiles/${dept}.mcp.json`);
      expect(p._tools.playwright).not.toContain("browser_run_code_unsafe");
      expect(p._tools.playwright).not.toContain("browser_file_upload");
      expect(p._tools.playwright).toContain("browser_navigate");
    }
    const strat = readJson("packages/gateway/profiles/strategy.mcp.json");
    expect(strat._tools.scrapling).toContain("stealthy_fetch");
    // Non-granted department stays clean (default-deny).
    const fin = readJson("packages/gateway/profiles/finance.mcp.json");
    for (const s of FREE_TRANCHE) expect(fin._tools[s]).toBeUndefined();
  });

  it("(5) library layer expands whole-server mcp items to every pinned tool (expandItem no-group path)", async () => {
    const db = getDb();
    const layer = await readLibraryLayer(db);
    const qual = layer.departments["quality"];
    expect(qual).toBeDefined();
    const playwrightTools = qual!.tools.filter((t) => t.startsWith("playwright."));
    expect(playwrightTools.length).toBe(24); // record layer = full pinned server;
    // the 22-tool emitted surface is the generator's denial subtraction (test 4).
    await closeDb();
  });
});
