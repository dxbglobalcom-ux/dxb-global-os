// U41 — the gate that keeps the corpus honest, and its own regression.
//
// The gate itself (`scripts/governance/ledger-truth.mjs`) runs against the
// COMPANY database, because nothing else can prove what is true in the company.
// This suite runs against the construction site's own engine like every other
// test (C47, and B36 Block 2 which gave the construction its own engine rather
// than a clone inside the company's), so it deliberately covers only what can
// be checked WITHOUT a database: the
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
    // A claim is measured one of exactly two ways, and neither can write.
    //   `sql`  — a bare SELECT the company's read gateway carries by name;
    //   `repo` — a named measurement of THIS repository's own files (B20: the
    //            roadmap tally). No database is touched at all, so there is no
    //            SQL to inspect — which is why this case must know the second
    //            kind rather than demand SQL of it.
    const claims = JSON.parse(readFileSync(CLAIMS, "utf8")) as Record<
      string,
      { sql?: string; repo?: string; field?: string }
    >;
    const REPO_KINDS = new Set(["roadmap"]);
    const entries = Object.entries(claims).filter(([k]) => !k.startsWith("_"));
    expect(entries.length).toBeGreaterThan(0);
    for (const [id, c] of entries) {
      expect(
        Boolean(c.sql) !== Boolean(c.repo),
        `claim ${id} must be measured exactly one way: a SELECT (sql) or a repository measurement (repo)`,
      ).toBe(true);
      if (c.repo) {
        expect(REPO_KINDS.has(c.repo), `claim ${id} names an unknown repository measurement "${c.repo}"`).toBe(true);
        expect(typeof c.field, `claim ${id} names no field to read`).toBe("string");
        continue;
      }
      expect(c.sql!, `claim ${id} must start with SELECT`).toMatch(/^\s*SELECT\b/i);
      expect(
        c.sql!,
        `claim ${id} contains a writing keyword — this would make the gate a mutation`,
      ).not.toMatch(/\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE)\b/i);
    }
  });

  // B36 · Block 3-bis, 2026-08-24. This gate used to hold the guard itself: it
  // built the SQL, refused anything that was not a SELECT, and sent it to the
  // holding through the Docker socket — with a fallback that connected as
  // `postgres`, the owner of every table in the company. The third adversarial
  // audit named that fallback, and the guard moved to where it cannot be talked
  // past: the gate now sends a NAME, and the SQL behind it lives on the
  // company's side of the wall, in a catalogue the gateway freezes at startup.
  it("the gate cannot send a statement to the holding at all, and has no second path", () => {
    const src = readFileSync(SCRIPT, "utf8");

    // It asks by name.
    expect(src, "the gate stopped asking the company's gateway").toContain("company-read-client.mjs");
    expect(src, "the gate can name a question the gateway does not carry")
      .toMatch(/is not a question the company's read gateway carries/);

    // And there is no other way out of this file. Measured on the CODE: the
    // file's comments explain the fallback it lost, so the word "docker" lives
    // in its prose and must not be what this assertion reads.
    expect(src, "the gate can run a program again").not.toContain("node:child_process");
    expect(src, "the gate can run a program again").not.toMatch(/execFileSync|spawnSync|spawn\(/);
    expect(src, "the gate names a command again").not.toMatch(/["'`]docker/i);
    expect(src, "the gate spells a company address again").not.toContain("54322");
    expect(src, "the gate no longer fails closed when the gateway is down")
      .toContain("reads the holding NO other way");
  });

  it("reads EVERY marker on a line, not just the first", () => {
    // The real regression: this exact shape appears in E12.5-WORKFORCE-BASELINE,
    // where three STATE claims share one table row.
    const line =
      "| x | <!-- STATE: agents_total = 205 @ 2026-07-28 --> 205 · <!-- STATE: agents_active = 199 @ 2026-07-28 --> 199 · <!-- STATE: agents_archived = 6 @ 2026-07-28 --> 6 |";
    const ids = [...line.matchAll(ALL_MARKERS)].map((m) => m[1]);
    expect(ids).toEqual(["agents_total", "agents_active", "agents_archived"]);
  });

  // 2026-07-31 — a ✓ row hid Kelam's four unbuilt stages for fourteen days.
  // These read the script's OWN phrase lists, not a copy.
  const listFromScript = (name: string): RegExp[] => {
    const src = readFileSync(SCRIPT, "utf8");
    const body = src.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\];`))?.[1] ?? "";
    return [...body.matchAll(/^\s*(\/(?:[^/\\\n]|\\.)+\/[gimsuy]*)\s*,/gm)].map((m) =>
      eval(m[1]),
    ) as RegExp[];
  };
  const announcesFutureWork = (line: string): boolean =>
    listFromScript("FUTURE_WORK").some((r) => r.test(line)) &&
    !listFromScript("FUTURE_NOT_A_PROMISE").some((r) => r.test(line));

  it("a ✓ row that announces work still to come is caught", () => {
    expect(
      announcesFutureWork(
        "**✓ COMPLETE 2026-07-17** … NEXT Kelam milestones M2-M6 = future roadmap rows (OD-1).",
      ),
    ).toBe(true);
    expect(announcesFutureWork("acoustic mic roundtrip; ADOPT = M2 desktop wave |")).toBe(true);
    expect(announcesFutureWork("- **Status:** INSTALL (… ADOPT = M2 desktop integration wave)")).toBe(true);
  });

  it("naming the future is not promising it — the measured exclusions stay silent", () => {
    expect(announcesFutureWork("belongs to a future roadmap row, record it as a boundary")).toBe(false);
    expect(announcesFutureWork("If a future wave changes a surface, this manual is updated in the SAME commit")).toBe(false);
    expect(announcesFutureWork("Bu metni bir fikir listesi veya “ileride bakarız” notu olarak değil")).toBe(false);
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
