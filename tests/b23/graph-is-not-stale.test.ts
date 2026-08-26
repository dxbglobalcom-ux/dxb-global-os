import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { CANON, STALE_AFTER, commitsBehind, stamp } from "../../scripts/governance/graph-refresh.mjs";

// B23 · THE GRAPH IS EITHER FRESH OR IT SAYS SO OUT LOUD.
//
// THE DEFECT THIS FILE HOLDS, opened 2026-07-30. `.planning/graphs/` was built
// on 2026-07-09 and nobody watched it: 368 commits behind when it was found,
// 593 by 2026-08-26 — while a standing rule told every session to consult it
// before reading the repository. Nothing failed, nothing warned; the artefact
// simply aged into a confident lie, and the only defence anyone could think of
// was to write "do not trust this" in its README.
//
// A README cannot fail a battery. This case can.

const REPO = process.cwd();

describe("B23 — the knowledge graph", () => {
  it("has a canonical copy with all three artefacts", () => {
    for (const f of ["graph.json", "graph.html", "GRAPH_REPORT.md"]) {
      expect(existsSync(join(REPO, CANON, f)), `${CANON}/${f} is missing — run: pnpm graph:refresh`).toBe(true);
    }
  });

  it("carries a build stamp naming the commit it was built at", () => {
    const s = stamp(REPO);
    expect(s, `no build stamp — run: pnpm graph:refresh`).not.toBeNull();
    expect(s.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(s.nodes).toBeGreaterThan(1000);
  });

  it("is not more than STALE_AFTER commits behind HEAD", () => {
    const behind = commitsBehind(REPO);
    expect(behind, "the stamped commit is not in this history — run: pnpm graph:refresh").not.toBeNull();
    expect(
      behind,
      `the graph is ${behind} commits behind (limit ${STALE_AFTER}). Run: pnpm graph:refresh`,
    ).toBeLessThanOrEqual(STALE_AFTER);
  });

  it("holds the repository it claims to map, not a stub", () => {
    const graph = JSON.parse(readFileSync(join(REPO, CANON, "graph.json"), "utf8"));
    expect(graph.nodes.length).toBeGreaterThan(1000);
    const files = new Set(
      graph.nodes.map((n: { source_file?: string }) => n.source_file ?? "").filter(Boolean),
    );
    const joined = [...files].join("\n");
    expect(joined).toContain("packages/");
    expect(joined).toContain("scripts/");
  });

  it("keeps the post-commit rebuild hook installed", () => {
    // The hook is what keeps a refresh cheap: it re-extracts only the files a
    // commit touched, in the background, so `pnpm graph:refresh` is seconds
    // rather than a full pass.
    const hook = join(REPO, "scripts/hooks/post-commit");
    expect(existsSync(hook), "the graphify post-commit hook is gone — run: graphify hook install").toBe(true);
    expect(readFileSync(hook, "utf8")).toContain("graphify-hook-start");
  });
});
