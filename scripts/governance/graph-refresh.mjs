#!/usr/bin/env node
// B23 — THE KNOWLEDGE GRAPH IS REBUILT AND THEN KEPT HONEST.
//
// THE DEFECT, opened 2026-07-30. `.planning/graphs/` was built on 2026-07-09
// and left there: measured 2026-08-26 it was **593 commits** behind HEAD, while
// a standing instruction told every session to consult it before reading the
// repository. A rule that points at a stale artefact is worse than no rule,
// because it is confidently misleading — so the graph's own README had to be
// turned into a warning sign, which is not a fix.
//
// Two commands and one gate close it:
//   node scripts/governance/graph-refresh.mjs          rebuild + sync + stamp
//   node scripts/governance/graph-refresh.mjs --check   how far behind is it?
// and tests/b23/graph-is-not-stale.test.ts fails the battery once the canonical
// copy falls further behind than STALE_AFTER commits.
//
// The rebuild is CODE-ONLY and local: graphify's semantic pass would need an
// LLM key and would send this repository's documents — the CEO's own words
// among them — to an outside provider. That is an outward-facing act nobody
// authorised, so the graph is built from the AST alone, on this machine.

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const CANON = ".planning/graphs";
export const WORKING = "graphify-out";
export const STAMP = `${CANON}/BUILD.json`;
/** How far behind the canonical copy may fall before the battery says so. */
export const STALE_AFTER = 150;

const ARTEFACTS = ["graph.json", "graph.html", "GRAPH_REPORT.md"];

function git(...args) {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8" }).trim();
}

/** What the stamp says, or null when the graph was never synced by this file. */
export function stamp(repo = REPO) {
  const at = path.join(repo, STAMP);
  if (!existsSync(at)) return null;
  try {
    return JSON.parse(readFileSync(at, "utf8"));
  } catch {
    return null;
  }
}

/** Commits landed since the canonical copy was built. null = never stamped. */
export function commitsBehind(repo = REPO) {
  const s = stamp(repo);
  if (!s?.commit) return null;
  try {
    return Number(
      execFileSync("git", ["rev-list", "--count", `${s.commit}..HEAD`], {
        cwd: repo,
        encoding: "utf8",
      }).trim(),
    );
  } catch {
    return null; // the stamped commit is not in this history (a fresh clone)
  }
}

function refresh() {
  console.log("[graph] extracting (code only, local AST, no key, nothing leaves this machine)…");
  execFileSync("graphify", [".", "--update", "--code-only"], { cwd: REPO, stdio: "inherit" });
  console.log("[graph] clustering…");
  execFileSync("graphify", ["cluster-only", "."], { cwd: REPO, stdio: "inherit" });

  mkdirSync(path.join(REPO, CANON), { recursive: true });
  for (const f of ARTEFACTS) {
    const from = path.join(REPO, WORKING, f);
    if (!existsSync(from)) throw new Error(`graphify did not produce ${WORKING}/${f}`);
    copyFileSync(from, path.join(REPO, CANON, f));
  }
  const graph = JSON.parse(readFileSync(path.join(REPO, CANON, "graph.json"), "utf8"));
  const built = {
    commit: git("rev-parse", "HEAD"),
    built_at: git("log", "-1", "--format=%cI"),
    synced_by: "scripts/governance/graph-refresh.mjs",
    mode: "code-only (local AST — no LLM, no key, no outbound call)",
    nodes: graph.nodes?.length ?? 0,
    edges: graph.edges?.length ?? graph.links?.length ?? 0,
  };
  writeFileSync(path.join(REPO, STAMP), `${JSON.stringify(built, null, 2)}\n`, "utf8");
  console.log(`[graph] canonical copy synced — ${built.nodes} nodes, ${built.edges} edges, at ${built.commit.slice(0, 8)}`);
}

function check() {
  const s = stamp();
  if (!s) {
    console.error(`[graph] no build stamp at ${STAMP} — run: pnpm graph:refresh`);
    process.exit(1);
  }
  const behind = commitsBehind();
  console.log(`[graph] built at ${s.commit.slice(0, 8)} · ${s.nodes} nodes · ${behind} commit(s) behind HEAD`);
  if (behind === null || behind > STALE_AFTER) {
    console.error(`[graph] STALE: more than ${STALE_AFTER} commits behind. Run: pnpm graph:refresh`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--check")) check();
  else refresh();
}
