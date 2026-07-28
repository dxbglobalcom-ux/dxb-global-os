// U41 — the gate that keeps the corpus honest, and its own regression.
//
// The gate itself (`scripts/governance/ledger-truth.mjs`) runs in the battery
// against the COMPANY database, because a clone cannot prove what is true in
// the company. This suite runs against `dxb_test` like every other test (C47),
// so it deliberately covers only what can be checked WITHOUT a database: the
// marker grammar, the board's declared sections, and the read-only guarantee.
// The stale-number check is the script's job and is proven red-first by hand.
//
// Why these cases exist, each traceable to a defect measured on 2026-07-28:
//   - multi-marker lines: the first version of the gate read only the FIRST
//     marker on a line and reported 5 claims where the corpus held 8.
//   - SELECT-only: a claim query that could write would turn an audit into a
//     mutation, which is the one thing an audit may never be.
//   - declared sections: the board's open/closed state must never be guessed.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO = process.cwd();
const SCRIPT = join(REPO, "scripts/governance/ledger-truth.mjs");
const CLAIMS = join(REPO, "scripts/governance/claims.json");
const BOARD = join(REPO, "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md");

const SCOPE = [
  "HOLDING-OS-MASTER-PLAN",
  ".planning",
  ".planning/research",
  ".planning/research/study-cards",
  ".planning/research/rival-intel",
];

const ALL_MARKERS =
  /<!--\s*(?:STATE:\s*([a-z0-9_]+)\s*=\s*(.+?)\s*@\s*(\d{4}-\d{2}-\d{2})|OPEN:\s*([A-Za-z0-9.\-]+)|(HISTORY))\s*-->/gi;

function corpusFiles(): string[] {
  const out: string[] = [];
  for (const dir of SCOPE) {
    const abs = join(REPO, dir);
    if (!existsSync(abs)) continue;
    for (const f of readdirSync(abs)) if (f.endsWith(".md")) out.push(join(dir, f));
  }
  return out;
}

function boardSections(): Map<string, "open" | "closed"> {
  const rows = new Map<string, "open" | "closed">();
  let section: "open" | "closed" | null = null;
  for (const line of readFileSync(BOARD, "utf8").split("\n")) {
    const s = line.match(/<!--\s*BOARD-SECTION:\s*(open|closed)\s*-->/i);
    if (s) {
      section = s[1].toLowerCase() as "open" | "closed";
      continue;
    }
    if (!/^\|/.test(line) || /^\|\s*-+/.test(line)) continue;
    const id = line.split("|").map((c) => c.trim())[1];
    if (!/^[BC]\d+(-bis)?$/.test(id ?? "")) continue;
    if (section) rows.set(id, section);
  }
  return rows;
}

describe("U41 ledger-truth gate", () => {
  it("every claim query is read-only — an audit may never mutate", () => {
    const claims = JSON.parse(readFileSync(CLAIMS, "utf8")) as Record<string, { sql?: string }>;
    const entries = Object.entries(claims).filter(([k]) => !k.startsWith("_"));
    expect(entries.length).toBeGreaterThan(0);
    for (const [id, c] of entries) {
      expect(c.sql, `claim ${id} has no sql`).toBeTruthy();
      expect(c.sql!, `claim ${id} must start with SELECT`).toMatch(/^\s*SELECT\b/i);
      expect(
        c.sql!,
        `claim ${id} contains a writing keyword — this would make the gate a mutation`,
      ).not.toMatch(/\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE)\b/i);
    }
  });

  it("the script refuses a non-SELECT query by construction, not by trust", () => {
    const src = readFileSync(SCRIPT, "utf8");
    expect(src).toMatch(/refused: claim query is not read-only/);
    expect(src).toMatch(/\^\\s\*SELECT\\b/);
  });

  it("reads EVERY marker on a line, not just the first", () => {
    // The real regression: this exact shape appears in E12.5-WORKFORCE-BASELINE,
    // where three STATE claims share one table row.
    const line =
      "| x | <!-- STATE: agents_total = 205 @ 2026-07-28 --> 205 · <!-- STATE: agents_active = 199 @ 2026-07-28 --> 199 · <!-- STATE: agents_archived = 6 @ 2026-07-28 --> 6 |";
    const ids = [...line.matchAll(ALL_MARKERS)].map((m) => m[1]);
    expect(ids).toEqual(["agents_total", "agents_active", "agents_archived"]);
  });

  it("every board row sits inside a declared open/closed section", () => {
    const text = readFileSync(BOARD, "utf8");
    const declared = boardSections();
    const allIds = text
      .split("\n")
      .filter((l) => /^\|/.test(l) && !/^\|\s*-+/.test(l))
      .map((l) => l.split("|").map((c) => c.trim())[1])
      .filter((id) => /^[BC]\d+(-bis)?$/.test(id ?? ""));
    const undeclared = allIds.filter((id) => !declared.has(id));
    expect(undeclared, `board rows outside any BOARD-SECTION: ${undeclared.join(", ")}`).toEqual([]);
    expect(declared.size).toBeGreaterThanOrEqual(53);
  });

  it("every OPEN marker in the corpus names a board row that exists and is open", () => {
    const board = boardSections();
    const bad: string[] = [];
    for (const rel of corpusFiles()) {
      const lines = readFileSync(join(REPO, rel), "utf8").split("\n");
      lines.forEach((line, i) => {
        for (const m of line.matchAll(ALL_MARKERS)) {
          if (!m[4]) continue;
          const status = board.get(m[4]);
          if (!status) bad.push(`${rel}:${i + 1} -> ${m[4]} does not exist`);
          else if (status === "closed") bad.push(`${rel}:${i + 1} -> ${m[4]} is closed`);
        }
      });
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("every STATE marker names a claim registered in claims.json", () => {
    const claims = JSON.parse(readFileSync(CLAIMS, "utf8")) as Record<string, unknown>;
    const bad: string[] = [];
    for (const rel of corpusFiles()) {
      const lines = readFileSync(join(REPO, rel), "utf8").split("\n");
      lines.forEach((line, i) => {
        for (const m of line.matchAll(ALL_MARKERS)) {
          if (!m[1]) continue;
          if (!(m[1] in claims)) bad.push(`${rel}:${i + 1} -> ${m[1]}`);
        }
      });
    }
    expect(bad, `unregistered STATE claims: ${bad.join("; ")}`).toEqual([]);
  });

  it("the board still declares the two laws this gate enforces", () => {
    const text = readFileSync(BOARD, "utf8");
    expect(text).toMatch(/If work is open anywhere in the corpus, it has a row here/);
    expect(text).toMatch(/Ledger parity/);
    expect(text).toMatch(/Laws 1 and 5 are enforced by machine \(U41/);
  });
});
