// B46 — THE RULER'S OWN TEST: does the metre BITE before anything is judged by it?
//
// The house rule the CEO registered on 2026-09-15: an audit's ruler is a runnable script, handed
// to the builder before the work, and builder and checker run the same script. A ruler nobody has
// tested is a second opinion, not a metre. This file does to `tests/b46/research-ruler.ts` what
// `tests/personas/persona-ruler.test.ts` does to the persona ruler: it breaks the engine on
// purpose, one rule at a time, on a COPY, and checks that the rule goes red — and then that the
// engine as it actually stands passes every rule.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { RULES, RulerReport, runRuler } from "./research-ruler.js";

const SKILL = join(process.cwd(), ".claude/skills/dxb-research");

let root = "";
beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "dxb-ruler-"));
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

/** A fresh copy of the engine, mutated by `edit`, measured by the ruler. */
function biteOn(name: string, edit: (dir: string) => void): RulerReport {
  const dir = join(root, name);
  execFileSync("cp", ["-a", SKILL, dir]);
  rmSync(join(dir, "scripts", "__pycache__"), { recursive: true, force: true });
  edit(dir);
  return runRuler({ skillDir: dir, records: [] });
}

const patch = (file: string, from: string | RegExp, to: string) => {
  const t = readFileSync(file, "utf8");
  writeFileSync(file, t.replace(from, to), "utf8");
};

describe("the ruler bites", () => {
  it("catches a prose number that no longer matches the map", () => {
    const r = biteOn("count", (d) => patch(join(d, "SKILL.md"), /37 channels/, "34 channels"));
    expect(r.failures["channel-count"].length).toBeGreaterThan(0);
  });

  it("catches a channel whose stand-in was taken away", () => {
    const r = biteOn("cover", (d) =>
      patch(join(d, "config/registry.yaml"), /\n    fallback: \[[^\]]*\]/, "\n    fallback: []"),
    );
    expect(r.failures["every-channel-covered"].length).toBeGreaterThan(0);
  });

  it("catches a stand-in that names a channel the map does not have", () => {
    const r = biteOn("ghost", (d) =>
      patch(join(d, "config/registry.yaml"), /fallback: \[/, "fallback: [a-channel-that-does-not-exist, "),
    );
    expect(r.failures["no-ghost-cover"].length).toBeGreaterThan(0);
  });

  it("catches a config file that a standard parser cannot read", () => {
    const r = biteOn("yaml", (d) =>
      patch(join(d, "config/registry.yaml"), /^channels:$/m, "channels: this: is: not: yaml"),
    );
    expect(r.failures["registry-parses"].length).toBeGreaterThan(0);
  });

  it("catches a second copy of the judge's word list appearing in the sweep", () => {
    const r = biteOn("second-judge", (d) =>
      patch(
        join(d, "scripts/sweep.sh"),
        /^BSESS="google"/m,
        'BSESS="google"\n[ -z "$SITE_ERROR_RE" ] && SITE_ERROR_RE="something went wrong|are you a robot"',
      ),
    );
    expect(r.failures["one-judge"].length).toBeGreaterThan(0);
  });

  it("catches a marker being dropped from the judge's vocabulary", () => {
    // exactly what happened at 16:17 on 2026-09-17, and nobody noticed
    const r = biteOn("marker", (d) => patch(join(d, "scripts/rlib.py"), /access denied\|/, ""));
    expect(r.failures["judge-markers"].length).toBeGreaterThan(0);
  });

  it("catches the sign-in guard drifting below the line that fires the channels", () => {
    const r = biteOn("guard", (d) => {
      const f = join(d, "scripts/sweep.sh");
      const t = readFileSync(f, "utf8");
      const start = t.indexOf("if printf '%s' \"$CHANNELS\" | grep -qE");
      const end = t.indexOf("fi\n", start) + 3;
      const guard = t.slice(start, end);
      writeFileSync(f, t.slice(0, start) + t.slice(end) + "\n" + guard, "utf8");
    });
    expect(r.failures["guard-before-fanout"].length).toBeGreaterThan(0);
  });

  it("catches a script that no longer compiles", () => {
    const r = biteOn("compile", (d) => patch(join(d, "scripts/rlib.py"), /^import json$/m, "import json ((("));
    expect(r.failures["scripts-compile"].length).toBeGreaterThan(0);
  });

  it("catches the same definition written twice", () => {
    const r = biteOn("dup", (d) =>
      patch(join(d, "scripts/rlib.py"), /^QUOTA_MAX_WORDS = 60$/m, "QUOTA_MAX_WORDS = 60\nQUOTA_MAX_WORDS = 60"),
    );
    expect(r.failures["no-duplicate-definition"].length).toBeGreaterThan(0);
  });

  it("catches the contract naming a file that is not there", () => {
    const r = biteOn("contract", (d) =>
      // the contract writes this one in its shell form, `"$R/probe.sh"`
      patch(join(d, "SKILL.md"), /\$R\/probe\.sh/, "$R/a-script-that-was-deleted.sh"),
    );
    expect(r.failures["contract-paths-exist"].length).toBeGreaterThan(0);
  });

  it("catches the reading chain gaining a door while the prose still says eleven", () => {
    // exactly what happened when the signed-in browser door was added: six sentences, all
    // stale, and no rule watching them. The ruler found five more the moment it existed.
    const r = biteOn("doors", (d) => patch(join(d, "SKILL.md"), /twelve doors/, "eleven doors"));
    expect(r.failures["door-count"].length).toBeGreaterThan(0);
  });

  it("has a case for every rule it declares — a rule nobody proved is a rule nobody trusts", () => {
    // if this fails, a rule was added above without a bite case beneath it
    expect(RULES.length).toBe(11);
  });
});

describe("the engine as it stands", () => {
  it("passes every rule of its own ruler", () => {
    const report = runRuler();
    const red = RULES.filter((r) => report.failures[r].length > 0);
    expect(red, `red rules: ${red.join(", ")}`).toEqual([]);
    expect(report.pass).toBe(true);
  });

  it("counts the channels from the map rather than from any sentence about it", () => {
    expect(runRuler().channels).toBeGreaterThan(0);
  });
});
