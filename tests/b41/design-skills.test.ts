// B41 first slice — THE DESIGN SKILLS REACH THE DESIGN SEATS (CEO 2026-10-13: "5-tmm yani tasarım
// skilleri tasarım yapılınca kendileri çağıracak ajan tarafından değil mi?" — listed for the granted
// seat, opened by the seat itself when the job needs it, never loaded at opening).
//   1. the plugin the company reads: Emil Kowalski's 15 skills (MIT) as one local plugin, its licence
//      and provenance beside it
//   2. grant → profile → runtime: a profile whose `_skills` names the plugin gives the seat the plugin
//      and its skill names; a profile without it gives nothing; a name that is not a plugin folder, or
//      that would leave the plugin root, gives nothing
//   3. the SDK options: a granted seat gets the Skill tool and a Read confined to the plugin folder
//      (live probe 2026-10-13: Read(//<plugin>/**) read CATALOG.md and refused /etc/hostname and the
//      repository); an ungranted seat keeps `tools: []` and no plugin
//   4. the record: the seed registers the plugin and grants it to the design department and the three
//      named seats through control_library_action (construction engine only)
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { getDb } from "@dxb/shared";
import { buildSdkToolOptions, resolveRuntimeProfile } from "../../packages/gateway/src/runtime-profile.js";

const REPO = join(import.meta.dirname, "..", "..");
const PLUGIN = join(REPO, "packages", "gateway", "plugins", "dxb-design");
const EMIL = [
  "animate", "animate-expo", "animation-performance", "animation-vocabulary", "apple-design", "ask-sonner",
  "break-ui", "emil-design-eng", "find-animation-opportunities", "improve-animations", "mobile-native",
  "pick-ui-library", "prototype", "review-animations", "write-swift",
];

const boxes: string[] = [];
function box(): { profiles: string; plugins: string } {
  const root = mkdtempSync(join(tmpdir(), "b41t-"));
  boxes.push(root);
  const profiles = join(root, "profiles");
  const plugins = join(root, "plugins");
  mkdirSync(profiles);
  mkdirSync(join(plugins, "dxb-design", ".claude-plugin"), { recursive: true });
  writeFileSync(join(plugins, "dxb-design", ".claude-plugin", "plugin.json"), '{"name":"dxb-design"}\n');
  for (const s of ["break-ui", "animate"]) {
    mkdirSync(join(plugins, "dxb-design", "skills", s), { recursive: true });
    writeFileSync(join(plugins, "dxb-design", "skills", s, "SKILL.md"), `---\nname: ${s}\n---\n# ${s}\n`);
  }
  mkdirSync(join(plugins, "dxb-design", "skills", "no-skill-file"), { recursive: true });
  return { profiles, plugins };
}
function profile(dir: string, file: string, skills?: string[]): void {
  writeFileSync(join(dir, file), JSON.stringify({
    _tools: { "dxb-mcp": ["queue_get"] },
    ...(skills ? { _skills: skills } : {}),
    mcpServers: { "dxb-mcp": { command: "node", args: ["/x/dxb-mcp.js"] } },
  }));
}
afterAll(() => { for (const b of boxes) rmSync(b, { recursive: true, force: true }); });

describe("B41 — the plugin the company reads", () => {
  it("is one local plugin named dxb-design holding Emil Kowalski's 15 skills, each with its SKILL.md", () => {
    const manifest = JSON.parse(readFileSync(join(PLUGIN, ".claude-plugin", "plugin.json"), "utf8")) as { name: string };
    expect(manifest.name).toBe("dxb-design");
    const skills = readdirSync(join(PLUGIN, "skills")).sort();
    expect(skills).toEqual([...EMIL].sort());
    for (const s of skills) {
      const head = readFileSync(join(PLUGIN, "skills", s, "SKILL.md"), "utf8").split("\n").slice(0, 6).join("\n");
      expect(head).toMatch(new RegExp(`^name: ${s}$`, "m"));
    }
  });

  it("carries its MIT licence and where it came from", () => {
    expect(readFileSync(join(PLUGIN, "LICENSE"), "utf8")).toMatch(/MIT License/);
    expect(readFileSync(join(PLUGIN, "PROVENANCE.txt"), "utf8")).toMatch(/emilkowalski\/skills/);
  });

  it("holds markdown only — nothing a seat could run", () => {
    const walk = (d: string): string[] =>
      readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
    const odd = walk(PLUGIN).filter((f) => !/\.(md|json|txt)$/.test(f) && !f.endsWith("/LICENSE"));
    expect(odd).toEqual([]);
  });
});

describe("B41 — grant → profile → runtime", () => {
  it("a profile naming the plugin gives the seat the plugin and its skills", () => {
    const b = box();
    profile(b.profiles, "design.mcp.json", ["dxb-design"]);
    const s = resolveRuntimeProfile({ slug: "design-ui-designer", department: "design" }, b.profiles, b.plugins);
    expect(s.plugins).toEqual([
      { name: "dxb-design", path: join(b.plugins, "dxb-design"), skills: ["dxb-design:animate", "dxb-design:break-ui"] },
    ]);
  });

  it("an employee overlay naming the plugin gives it to that seat alone", () => {
    const b = box();
    profile(b.profiles, "engineering.mcp.json", []);
    profile(b.profiles, "engineering-frontend-developer.employee.mcp.json", ["dxb-design"]);
    expect(resolveRuntimeProfile({ slug: "engineering-frontend-developer", department: "engineering" }, b.profiles, b.plugins).plugins).toHaveLength(1);
    expect(resolveRuntimeProfile({ slug: "engineering-backend-architect", department: "engineering" }, b.profiles, b.plugins).plugins).toEqual([]);
  });

  it("a seat without the grant gets nothing — an empty list, an absent key, no profile at all", () => {
    const b = box();
    profile(b.profiles, "finance.mcp.json", []);
    profile(b.profiles, "legal.mcp.json");
    expect(resolveRuntimeProfile({ slug: "x", department: "finance" }, b.profiles, b.plugins).plugins).toEqual([]);
    expect(resolveRuntimeProfile({ slug: "x", department: "legal" }, b.profiles, b.plugins).plugins).toEqual([]);
    expect(resolveRuntimeProfile({ slug: "x", department: "nowhere" }, b.profiles, b.plugins).plugins).toEqual([]);
  });

  it("a granted name that is a skill, not a plugin folder, or that would leave the plugin root gives nothing", () => {
    const b = box();
    profile(b.profiles, "design.mcp.json", ["break-ui", "../plugins/dxb-design", "dxb-design/../dxb-design", "/etc", "missing"]);
    expect(resolveRuntimeProfile({ slug: "x", department: "design" }, b.profiles, b.plugins).plugins).toEqual([]);
  });
});

describe("B41 — what the seat's SDK call receives", () => {
  const base = { source: "department" as const, mcpServers: {}, allowedTools: ["mcp__dxb-mcp__queue_get"], grantedPairs: ["dxb-mcp.queue_get"] };

  it("a granted seat: the Skill tool, Read confined to the plugin folder, the plugin and its skills", () => {
    const path = "/srv/plugins/dxb-design";
    const o = buildSdkToolOptions({ ...base, plugins: [{ name: "dxb-design", path, skills: ["dxb-design:break-ui"] }] }, ["mcp__dxb-mcp__queue_get", "mcp__dxb-mcp__queue_dispatch"]);
    expect(o.tools).toEqual(["Read", "Skill"]);
    expect(o.allowedTools).toEqual(["Read(//srv/plugins/dxb-design/**)", "Skill", "mcp__dxb-mcp__queue_get"]);
    expect(o.disallowedTools).toEqual(["mcp__dxb-mcp__queue_dispatch"]);
    expect(o.plugins).toEqual([{ type: "local", path }]);
    expect(o.skills).toEqual(["dxb-design:break-ui"]);
    expect(o.strictMcpConfig).toBe(true);
  });

  it("an ungranted seat: no built-in tool, no plugin, no skill — the surface it had before", () => {
    const o = buildSdkToolOptions(base, ["mcp__dxb-mcp__queue_get"]);
    expect(o.tools).toEqual([]);
    expect(o.plugins).toEqual([]);
    expect(o.skills).toEqual([]);
    expect(o.allowedTools).toEqual(["mcp__dxb-mcp__queue_get"]);
  });

  it("both task lanes hand the compiled tools, plugins and skills to the call — never a literal", () => {
    for (const f of ["packages/orchestrator/src/worker-shim.ts", "packages/kernel/src/workflow/executor.ts"]) {
      const src = readFileSync(join(REPO, f), "utf8");
      expect(src, f).toMatch(/tools: toolOpts\.tools,/);
      expect(src, f).toMatch(/plugins: toolOpts\.plugins/);
      expect(src, f).toMatch(/skills: toolOpts\.skills/);
    }
  });
});

describe("B41 — the record (construction engine)", () => {
  const db = () => getDb();

  it("the seed registered dxb-design as a plugin and granted it to design and the three named seats", async () => {
    const item = await sql<{ id: string; review_status: string }>`
      SELECT id, review_status FROM library_items WHERE kind = 'plugin' AND name = 'dxb-design'`.execute(db());
    expect(item.rows).toHaveLength(1);
    const grants = await sql<{ grantee_kind: string; who: string }>`
      SELECT g.grantee_kind, coalesce(a.slug, g.grantee_id) AS who
        FROM library_grants g LEFT JOIN agents a ON g.grantee_kind = 'employee' AND a.id::text = g.grantee_id
       WHERE g.item_id = ${item.rows[0]!.id}
       ORDER BY 1, 2`.execute(db());
    expect(grants.rows).toEqual([
      { grantee_kind: "department", who: "design" },
      { grantee_kind: "employee", who: "engineering-frontend-developer" },
      { grantee_kind: "employee", who: "media-creative-director" },
      { grantee_kind: "employee", who: "media-product-brand-consistency" },
    ]);
  });

  it("the record compiles: design names the plugin, a named seat's overlay names it and keeps its department's tools", async () => {
    const { readLibraryLayer } = await import("../../packages/gateway/src/library-profiles.js");
    const layer = await readLibraryLayer(db());
    expect(layer.departments.design?.skills).toContain("dxb-design");
    expect(layer.departments.finance?.skills ?? []).not.toContain("dxb-design");
    const fe = layer.employees["engineering-frontend-developer"];
    expect(fe?.skills).toContain("dxb-design");
    expect(fe?.tools.length).toBeGreaterThan(0);
    expect(fe?.tools).toEqual(expect.arrayContaining(layer.departments.engineering?.tools ?? []));
  });

  it("the seed step exists and the registrar writes only through control_library_action", () => {
    expect(readFileSync(join(REPO, "db", "seed", "build-seed.ts"), "utf8")).toMatch(/register-design-skills\.mjs/);
    const reg = readFileSync(join(REPO, "scripts", "library", "register-design-skills.mjs"), "utf8");
    expect(reg).toMatch(/control_library_action/);
    expect(reg).not.toMatch(/INSERT INTO library_(items|grants)/i);
    expect(existsSync(join(REPO, "scripts", "library", "register-design-skills.mjs"))).toBe(true);
  });
});
