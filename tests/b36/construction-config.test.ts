import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// B36 Block 2 — the construction site's Supabase stack must never drift away
// from the company's, and must never land on the company's ports.
//
// The whole reason the construction site got its own engine is that a NAME is
// not a wall: `dxb_test` lived inside the company's Postgres and six spellings
// of one address reached the holding through it. The wall now is the engine —
// which only holds while the two stacks stay identical in everything except
// where they listen. A hand-edited config.toml is how that quietly stops being
// true, so the file is generated and this suite fails the battery on any drift.

const REPO = join(__dirname, "../..");
const COMPANY = join(REPO, "supabase/config.toml");
const CONSTRUCTION = join(REPO, "construction/supabase/config.toml");

/** Every `port = NNNNN` / `shadow_port = NNNNN` a config declares. */
function ports(toml: string): number[] {
  return [...toml.matchAll(/^\s*(?:shadow_)?port\s*=\s*(\d+)\s*$/gm)].map((m) => Number(m[1]));
}

describe("B36 — the construction stack's config is derived, not written", () => {
  it("matches exactly what the generator derives from the company's config", () => {
    // The generator exits 1 and prints the reason when the checked-in file is
    // not what the company's config derives to.
    const out = execFileSync("node", [join(REPO, "scripts/b36/make-construction-config.mjs")], {
      cwd: REPO,
      encoding: "utf8",
    });
    expect(out).toContain("matches the company config");
  });

  it("differs from the company's config ONLY in the project name and the ports", () => {
    const company = readFileSync(COMPANY, "utf8").split("\n");
    const construction = readFileSync(CONSTRUCTION, "utf8").split("\n");
    // The generated file carries a header; drop it before comparing bodies.
    const body = construction.slice(construction.indexOf(company[0]));
    expect(body).toHaveLength(company.length);

    const changed = company
      .map((line, i) => [line, body[i]] as const)
      .filter(([a, b]) => a !== b);

    for (const [a, b] of changed) {
      const isProject = a.startsWith("project_id") && b === 'project_id = "DxB_Build"';
      const isPort = /54\d{3}/.test(a) && b === a.replace(/543(\d\d)/g, "544$1");
      const isMigrations = a === "enabled = true" && b === "enabled = false";
      expect(isProject || isPort || isMigrations, `unexpected difference:\n  ${a}\n  ${b}`).toBe(true);
    }
    // The three derivations really are all present — a generator that stopped
    // changing anything would also pass the loop above.
    expect(changed.length).toBeGreaterThanOrEqual(9);
  });

  it("never listens where the company listens", () => {
    const mine = ports(readFileSync(CONSTRUCTION, "utf8"));
    const theirs = new Set(ports(readFileSync(COMPANY, "utf8")));
    expect(mine.length).toBeGreaterThanOrEqual(5);
    expect(mine.filter((p) => theirs.has(p))).toEqual([]);
  });

  it("builds its schema from the ONE migrations folder, not a copy of it", () => {
    expect(realpathSync(join(REPO, "construction/supabase/migrations"))).toBe(
      realpathSync(join(REPO, "supabase/migrations")),
    );
  });
});
