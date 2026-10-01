// The score card gate — dxb-team2 §3 and §6 held by a machine (CEO 2026-10-01: "tmm makineyi de kur").
//
// scripts/governance/audit-card.mjs reads the lead's card, measures the floor from the files the
// card's range touches, and routes the auditor's effort; scripts/governance/refuter.sh refuses an
// audit without a card or beneath it, and puts the card in front of Sol. The refuter cases run the
// REAL script with a stand-in `codex` on PATH (it answers the inventory and echoes the prompt), so
// no model is called and no quota is spent.
import { spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
// @ts-expect-error — a plain .mjs module without types
import { classOf, floorOf, parseCard, route } from "../../scripts/governance/audit-card.mjs";

const REPO = join(import.meta.dirname, "..", "..");
const GATE = join(REPO, "scripts", "governance", "audit-card.mjs");
const REFUTER = join(REPO, "scripts", "governance", "refuter.sh");
const box = mkdtempSync(join(tmpdir(), "audit-card-"));
afterAll(() => rmSync(box, { recursive: true, force: true }));

// Job 1's own work: 635e32bc..cf95b743 touches scripts/governance — a governance file.
const RANGE = "635e32bc..cf95b743";
const card = (axes: string, extra = "") => {
  const f = join(box, `card-${Math.random().toString(36).slice(2)}.md`);
  writeFileSync(f, `# Score card\njob: Sol's read-only hand into the construction engine\n${extra}${axes}\n`);
  return f;
};
const axes = (b: number, r: number, re: number, a: number, range = RANGE) =>
  `range: ${range}\nblast: ${b}\nrisk: ${r}\nreasoning: ${re}\nambiguity: ${a}`;

describe("the card", () => {
  it("refuses a card without job, range or any axis, and an axis outside 0-2", () => {
    expect(() => parseCard("range: a..b\nblast: 0\nrisk: 0\nreasoning: 0\nambiguity: 0")).toThrow(/job/);
    expect(() => parseCard("job: x\nblast: 0\nrisk: 0\nreasoning: 0\nambiguity: 0")).toThrow(/range/);
    expect(() => parseCard("job: x\nrange: a..b\nblast: 0\nrisk: 0\nreasoning: 0")).toThrow(/ambiguity/);
    expect(() => parseCard("job: x\nrange: a..b\nblast: 3\nrisk: 0\nreasoning: 0\nambiguity: 0")).toThrow(/0, 1 or 2/);
  });

  it("reads markdown bullets and bold keys", () => {
    const c = parseCard("- **job**: x\n- **range**: a..b\n- blast: 1\n* risk: 2\nreasoning: 0\nambiguity: 1");
    expect([c.blast, c.risk, c.reasoning, c.ambiguity]).toEqual([1, 2, 0, 1]);
  });

  it("classes at the door's boundaries: 0-2 light, 3-5 normal, 6-8 critical", () => {
    expect([0, 2, 3, 5, 6, 8].map(classOf)).toEqual(["light", "light", "normal", "normal", "critical", "critical"]);
  });
});

describe("the floor is measured from the files", () => {
  it("names the guard for database, money, security, approval and governance files", () => {
    const f = floorOf([
      "db/migrations/0001_x.sql", "packages/revenue/src/a.ts", "packages/gateway/policy/p.yaml",
      "apps/dashboard/src/components/approvals/Card.tsx", "scripts/governance/refuter.sh", "README.md",
    ]);
    expect(f.min).toBe("normal");
    expect(new Set(f.hits.map((h: { guard: string }) => h.guard))).toEqual(
      new Set(["database", "money", "security", "approval", "governance"]));
    expect(f.hits.some((h: { file: string }) => h.file === "README.md")).toBe(false);
  });

  it("covers the paths Sol's audit found missing: .codex/, scripts/hooks/, the specs, the cost gate", () => {
    const f = floorOf([".codex/hooks.json", "scripts/hooks/pre-commit", "HOLDING-OS-MASTER-PLAN/PERMISSION_MODEL.md",
                       "scripts/ops/dxb-cost-gate.py", "packages/shared/src/db.ts"]);
    for (const file of [".codex/hooks.json", "scripts/hooks/pre-commit", "HOLDING-OS-MASTER-PLAN/PERMISSION_MODEL.md",
                        "scripts/ops/dxb-cost-gate.py", "packages/shared/src/db.ts"])
      expect(f.hits.some((h: { file: string }) => h.file === file), file).toBe(true);
  });

  it("reads the changed lines of code files: a database client or a credential is caught wherever it lives", () => {
    const f = floorOf(["apps/x/src/a.ts"], { "apps/x/src/a.ts": 'import { Pool } from "pg";\n' });
    expect(f.hits.map((h: { guard: string }) => h.guard)).toEqual(["database"]);
    expect(floorOf(["apps/x/src/b.ts"], { "apps/x/src/b.ts": "const apiKey = env.X;\n" }).min).toBe("normal");
    expect(floorOf(["apps/x/src/c.tsx"], { "apps/x/src/c.tsx": "<h1>Merhaba</h1>\n" }).min).toBe(null);
  });

  it("raises a light card that touches a guarded file to normal, and leaves a plain one light", () => {
    const c = parseCard(`job: x\n${axes(0, 0, 1, 0)}`);
    expect(route(c, ["db/migrations/0001_x.sql"]).class).toBe("normal");
    expect(route(c, ["db/migrations/0001_x.sql"]).floorRaised).toBe(true);
    expect(route(c, ["apps/dashboard/src/app/page.tsx"]).class).toBe("light");
    expect(route(c, ["apps/dashboard/src/app/page.tsx"]).effort).toBe("medium");
  });
});

describe("the effort follows the card", () => {
  const critical = parseCard(`job: x\n${axes(2, 2, 2, 1)}`);
  it("sets the effort from the class when none is given — no silent high", () => {
    expect(route(critical, ["README.md"]).effort).toBe("xhigh");
  });
  it("refuses an effort beneath the card and allows one above it", () => {
    expect(() => route(critical, ["README.md"], "high")).toThrow(/beneath the card/);
    const light = parseCard(`job: x\n${axes(0, 0, 0, 0)}`);
    expect(route(light, ["README.md"], "xhigh").effort).toBe("xhigh");
  });
});

describe("the CLI on this repository's own history", () => {
  const check = (f: string, ...extra: string[]) =>
    spawnSync("node", [GATE, "check", f, ...extra], { encoding: "utf8" });

  it("routes job 1's range: governance files, critical axes → xhigh, card in the brief", () => {
    const r = check(card(axes(2, 2, 2, 1)));
    expect(r.status, r.stderr).toBe(0);
    const out = JSON.parse(r.stdout);
    expect(out).toMatchObject({ class: "critical", effort: "xhigh", total: 7 });
    expect(out.floor.guards).toContain("governance");
    expect(out.brief).toMatch(/^THE LEAD'S SCORE CARD/);
    expect(out.brief).toContain("job: Sol's read-only hand");
  });

  it("raises the two real historical ranges Sol's audit named from light to normal", () => {
    // 512be457: the shared Kysely/pg client (packages/shared/src/db.ts) · 022eec2e: the cost gate
    for (const range of ["512be457^..512be457", "022eec2e^..022eec2e"]) {
      const r = check(card(axes(0, 0, 0, 0, range)));
      expect(r.status, r.stderr).toBe(0);
      expect(JSON.parse(r.stdout), range).toMatchObject({ class: "normal", effort: "high", floorRaised: true });
    }
  });

  it("refuses a missing card file, a range that is not a commit, and an empty range", () => {
    expect(check(join(box, "nope.md")).stderr).toMatch(/REFUTER_FAIL: no card at/);
    expect(check(card(axes(0, 0, 0, 0, "deadbeef1..HEAD"))).stderr).toMatch(/not a commit/);
    expect(check(card(axes(0, 0, 0, 0, "HEAD..HEAD"))).stderr).toMatch(/changes no file/);
  });
});

describe("refuter.sh holds the gate", () => {
  // A stand-in codex: answers the MCP inventory, echoes the effort and the prompt of `exec`.
  const bin = join(box, "bin");
  const codexHome = join(box, "codex-home");
  const home = join(box, "home");
  mkdirSync(bin, { recursive: true });
  mkdirSync(codexHome, { recursive: true });
  mkdirSync(home, { recursive: true });
  copyFileSync(join(REPO, "scripts", "governance", "codex-refuter.config.toml"), join(codexHome, "refuter.config.toml"));
  writeFileSync(join(bin, "codex"), `#!/usr/bin/env bash
case " $* " in
  *" mcp list "*) echo '[{"name":"dxbdb","enabled":true}]' ;;
  *" exec "*) if [ -n "\${CAPACITY_FAILS:-}" ]; then
                n=$(cat "$CAPACITY_FAILS" 2>/dev/null || echo 0)
                if [ "$n" -gt 0 ]; then echo $((n - 1)) > "$CAPACITY_FAILS"; echo "ERROR: Selected model is at capacity. Please try a different model." >&2; exit 1; fi
              fi
              for a in "$@"; do case "$a" in model_reasoning_effort=*) echo "EFFORT_ARG $a";; --json) echo "--json";; esac; echo "ARG $a" | head -1; done
              echo "PROMPT_BEGIN"; printf '%s\\n' "\${@: -1}"; echo "PROMPT_END" ;;
esac
`);
  chmodSync(join(bin, "codex"), 0o755);
  const run = (...args: string[]) => runWith({}, ...args);
  const runWith = (extra: Record<string, string>, ...args: string[]) =>
    spawnSync("bash", [REFUTER, ...args], {
      encoding: "utf8",
      input: "the brief read from stdin",
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, CODEX_HOME: codexHome, HOME: home,
             DXB_SOL_PROBE_PORT: "1", DXB_REFUTER_RETRY_WAITS: "0 0 0", ...extra },
    });

  it("refuses an audit without a card, before Codex is asked anything", () => {
    const r = run("audit this");
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/REFUTER_FAIL: no score card/);
    expect(r.stdout).not.toMatch(/PROMPT_BEGIN/);
  });

  it("refuses an effort beneath the card", () => {
    const r = run("--card", card(axes(2, 2, 2, 1)), "--effort", "high", "audit this");
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/beneath the card: critical work is audited at xhigh/);
    expect(r.stdout).not.toMatch(/PROMPT_BEGIN/);
  });

  it("launches at the card's effort with the card in front of the brief, and logs the launch", () => {
    const r = run("--card", card(axes(2, 2, 2, 1)), "audit this claim");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain('EFFORT_ARG model_reasoning_effort="xhigh"');
    const prompt = r.stdout.split("PROMPT_BEGIN\n")[1].split("PROMPT_END")[0];
    expect(prompt).toMatch(/^THE LEAD'S SCORE CARD/);
    expect(prompt.trimEnd().endsWith("audit this claim")).toBe(true);
    expect(r.stderr).toMatch(/AUDIT_CARD class=critical total=7 effort=xhigh/);
    const log = readFileSync(join(home, ".local", "state", "dxb", "audit-cards.log"), "utf8");
    expect(log).toMatch(/"class":"critical"/);
  });

  it("refuses every forwarded option that could override the card or the profile", () => {
    for (const bad of [["-c", 'model_reasoning_effort="medium"'], ['--config=model_reasoning_effort="medium"'],
                       ["-s", "workspace-write"], ["--sandbox", "danger-full-access"], ["-m", "gpt-5.5"],
                       ["-p", "default"], ["--enable", "x"], ["--dangerously-bypass-approvals-and-sandbox"]]) {
      const r = run("--card", card(axes(2, 2, 2, 1)), ...bad, "audit this");
      expect(r.status, bad.join(" ")).toBe(1);
      expect(r.stderr).toMatch(/is not passed to the auditor/);
      expect(r.stdout).not.toMatch(/PROMPT_BEGIN/);
    }
  });

  it("keeps the prompt whole when allowed options come after it, and refuses two prompts", () => {
    const r = run("--card", card(axes(2, 2, 2, 1)), "audit this claim", "--json", "-C", box);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain("--json");
    const prompt = r.stdout.split("PROMPT_BEGIN\n")[1].split("PROMPT_END")[0];
    expect(prompt.trimEnd().endsWith("audit this claim")).toBe(true);
    const two = run("--card", card(axes(2, 2, 2, 1)), "one", "two");
    expect(two.status).toBe(1);
    expect(two.stderr).toMatch(/more than one prompt/);
  });

  it("binds an option's value to it, so a value that looks like an option never reaches Codex as one", () => {
    const r = run("--card", card(axes(2, 2, 2, 1)), "-o", '--config=model_reasoning_effort="medium"', "audit this");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain('ARG --output-last-message=--config=model_reasoning_effort="medium"');
    expect(r.stdout).not.toMatch(/^ARG --config/m);
    expect(r.stdout).toContain('EFFORT_ARG model_reasoning_effort="xhigh"');
  });

  it("takes the prompt after '--', and refuses an empty brief", () => {
    const r = run("--card", card(axes(2, 2, 2, 1)), "--json", "--", "-a brief that starts with a dash");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain("-a brief that starts with a dash");
    for (const empty of [[""], ["   "]]) {
      const e = run("--card", card(axes(2, 2, 2, 1)), ...empty);
      expect(e.status).toBe(1);
      expect(e.stderr).toMatch(/the brief is empty/);
    }
  });

  it("runs the whole audit again when the model is at capacity, and gives up after four tries", () => {
    const counter = join(box, "capacity");
    writeFileSync(counter, "2");
    const r = runWith({ CAPACITY_FAILS: counter }, "--card", card(axes(2, 2, 2, 1)), "audit this");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr.match(/AUDIT_RETRY/g)?.length).toBe(2);
    expect(r.stdout).toContain("PROMPT_BEGIN");
    writeFileSync(counter, "9");
    const gone = runWith({ CAPACITY_FAILS: counter }, "--card", card(axes(2, 2, 2, 1)), "audit this");
    expect(gone.status).toBe(75);
    expect(gone.stderr).toMatch(/stayed at capacity after 4 tries/);
  });

  it("reads the brief from stdin when the prompt is '-'", () => {
    const r = run("--card", card(axes(0, 1, 1, 0)), "-");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain('model_reasoning_effort="high"'); // the governance floor raised light to normal
    expect(r.stdout).toContain("the brief read from stdin");
  });
});
