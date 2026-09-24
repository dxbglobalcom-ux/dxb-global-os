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
  // THE BITE MUST NOT NAME THE NUMBER. It used to patch the literal "37 channels", and on
  // 2026-09-21 the map grew to 39 (facebook and instagram) - the prose the metre could see
  // was corrected (SKILL.md's frontmatter was NOT, and is corrected in this same commit
  // together with the pattern that could not see it), the literal stopped matching, and
  // this test went red while claiming the
  // ruler had stopped biting. A bite test that hard-codes today's truth breaks on the day
  // the truth changes, which is the one day it has to work. It now reads whatever number
  // the prose currently carries and moves it by one.
  it("catches a prose number that no longer matches the map", () => {
    const r = biteOn("count", (d) => {
      const f = join(d, "SKILL.md");
      const m = /(\d+) channels/.exec(readFileSync(f, "utf8"));
      if (!m) throw new Error("SKILL.md carries no '<n> channels' sentence to break");
      patch(f, m[0], `${Number(m[1]) + 1} channels`);
    });
    expect(r.failures["channel-count"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches a channel whose stand-in was taken away", () => {
    const r = biteOn("cover", (d) =>
      patch(join(d, "config/registry.yaml"), /\n    fallback: \[[^\]]*\]/, "\n    fallback: []"),
    );
    expect(r.failures["every-channel-covered"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches a stand-in that names a channel the map does not have", () => {
    const r = biteOn("ghost", (d) =>
      patch(join(d, "config/registry.yaml"), /fallback: \[/, "fallback: [a-channel-that-does-not-exist, "),
    );
    expect(r.failures["no-ghost-cover"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches a config file that a standard parser cannot read", () => {
    const r = biteOn("yaml", (d) =>
      patch(join(d, "config/registry.yaml"), /^channels:$/m, "channels: this: is: not: yaml"),
    );
    expect(r.failures["registry-parses"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches a second copy of the judge's word list appearing in the sweep", () => {
    const r = biteOn("second-judge", (d) =>
      patch(
        join(d, "scripts/sweep.sh"),
        /^BSESS="google"/m,
        'BSESS="google"\n[ -z "$SITE_ERROR_RE" ] && SITE_ERROR_RE="something went wrong|are you a robot"',
      ),
    );
    expect(r.failures["one-judge"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches a marker being dropped from the judge's vocabulary", () => {
    // exactly what happened at 16:17 on 2026-09-17, and nobody noticed
    const r = biteOn("marker", (d) => patch(join(d, "scripts/rlib.py"), /access denied\|/, ""));
    expect(r.failures["judge-markers"].length).toBeGreaterThan(0);
  }, 30_000);

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
  }, 30_000);

  it("catches a script that no longer compiles", () => {
    const r = biteOn("compile", (d) => patch(join(d, "scripts/rlib.py"), /^import json$/m, "import json ((("));
    expect(r.failures["scripts-compile"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches the same definition written twice", () => {
    const r = biteOn("dup", (d) =>
      patch(join(d, "scripts/rlib.py"), /^QUOTA_MAX_WORDS = 60$/m, "QUOTA_MAX_WORDS = 60\nQUOTA_MAX_WORDS = 60"),
    );
    expect(r.failures["no-duplicate-definition"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches the contract naming a file that is not there", () => {
    const r = biteOn("contract", (d) =>
      // the contract writes this one in its shell form, `"$R/probe.sh"`
      patch(join(d, "SKILL.md"), /\$R\/probe\.sh/, "$R/a-script-that-was-deleted.sh"),
    );
    expect(r.failures["contract-paths-exist"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches the reading chain gaining a door while the prose still says eleven", () => {
    // exactly what happened when the signed-in browser door was added: six sentences, all
    // stale, and no rule watching them. The ruler found five more the moment it existed.
    const r = biteOn("doors", (d) => patch(join(d, "SKILL.md"), /twelve doors/, "eleven doors"));
    expect(r.failures["door-count"].length).toBeGreaterThan(0);
  }, 30_000);

  // ── THE WALL BETWEEN A PARAGRAPH AND A SEARCH BOX (2026-09-20) ─────────────────────
  // A several-sentence complaint went to 37 search boxes verbatim and the engine could not say
  // afterwards what it had sent. Each bite below re-opens one of those holes.

  it("catches the fleet firing before its queries are judged", () => {
    const r = biteOn("nogate", (d) =>
      patch(join(d, "fleet/fleet.sh"),
        /  if ! gate_msg="\$\(python3 "\$SKILL\/scripts\/shortq\.py" --gate "\$q" 2>&1\)"; then/,
        '  # the wall used to stand here'),
    );
    expect(r.failures["queries-before-fleet"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches the sweep taking a paragraph again", () => {
    const r = biteOn("paragraph", (d) =>
      patch(join(d, "scripts/sweep.sh"), /GATE_MSG="\$\(python3 "\$\(dirname "\$\{BASH_SOURCE\[0\]\}"\)\/shortq\.py" --gate "\$QUERY" 2>&1\)"/,
        'GATE_MSG=""; GATE_RC=0; true'),
    );
    expect(r.failures["no-paragraph-to-a-box"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches a box query with no word in it — \"200 %50 5.1\" is not a search", () => {
    const r = biteOn("noword", (d) =>
      patch(join(d, "scripts/shortq.py"), /def _real_word\(text: str\) -> bool:/,
        "def _real_word(text: str) -> bool:\n    return True\n"),
    );
    expect(r.failures["short-query-has-a-word"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches the first word of a question being dropped — the name it is about", () => {
    // THE BITE IS THE ORIGINAL DEFECT ITSELF, put back: the first token was exempted from the
    // name rule, and "Hetzner Storage Box mu Backblaze B2 mi" came back as "Storage Box
    // Backblaze B2" — without the very name the question was about. A weaker mutation (killing
    // the capital rule outright) does NOT bite, because the content-word fallback catches it,
    // and a bite case that passes for the wrong reason proves nothing.
    const r = biteOn("firstword", (d) => {
      patch(join(d, "scripts/shortq.py"), /    for tok in toks:/, "    for _i, tok in enumerate(toks):");
      patch(join(d, "scripts/shortq.py"), /        if _distinctive\(tok, after_name\):/,
        "        if _i and _distinctive(tok, after_name):");
    });
    expect(r.failures["first-word-counts"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches a run that no longer writes down what it sent", () => {
    const r = biteOn("noledger", (d) =>
      patch(join(d, "scripts/sweep.sh"), /printf '%s\\t%s\\n' "\$name" "\$sent" >> "\$OUT\/\.queries"/, "true"),
    );
    expect(r.failures["queries-are-logged"].length).toBeGreaterThan(0);
  }, 30_000);

  // THE AUDITOR'S OWN THREE MUTATIONS, 2026-09-20. Each one took a wall down while leaving the
  // sentence the ruler was reading, and all three passed ALL-GREEN. They are cases now.
  it("catches the sweep's gate being switched off while its text stays", () => {
    const r = biteOn("gate-off", (d) =>
      patch(join(d, "scripts/sweep.sh"), /if \[ "\$GATE_RC" -ne 0 \]; then/, "if false; then"),
    );
    expect(r.failures["no-paragraph-to-a-box"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches the ledger line being deleted and left behind in a comment", () => {
    const r = biteOn("ledger-comment", (d) =>
      patch(join(d, "scripts/sweep.sh"), /^  printf '%s\\t%s\\n' "\$name" "\$sent" >> "\$OUT\/\.queries"$/m,
        '  # the ledger used to be written here: "$OUT/.queries"'),
    );
    expect(r.failures["queries-are-logged"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches a gate that cannot run being treated as a gate that said yes", () => {
    // THE FAIL-OPEN, PUT BACK. The old test asked only "did the gate say 3?", so a gate that
    // could not run at all — exit 1, exit 127 — was read as permission. Both halves are needed
    // to re-open the hole: the old question, and a gate that cannot answer it.
    const r = biteOn("fail-open", (d) => {
      patch(join(d, "scripts/sweep.sh"), /if \[ "\$GATE_RC" -ne 0 \]; then/, 'if [ "$GATE_RC" = "3" ]; then');
      writeFileSync(join(d, "scripts/shortq.py"), "import sys\nsys.exit(1)\n", "utf8");
    });
    expect(r.failures["no-paragraph-to-a-box"].length).toBeGreaterThan(0);
  }, 30_000);

  // ── THE AUDITOR'S SECOND ROUND, 2026-09-20: five repairs that could still be taken down
  // ── silently, because the rules guarding them were reading source instead of behaviour.

  it("catches the stand-in chain and the last resort sending text with no ledger row", () => {
    const r = biteOn("fallback-silent", (d) => {
      patch(join(d, "scripts/sweep.sh"), /^      printf '%s\\t%s\\n' "\$dead-via-\$sub".*$/m, "      true");
      patch(join(d, "scripts/sweep.sh"), /^      printf '%s\\t%s\\n' "\$dead-direct.*$/m, "      true");
    });
    expect(r.failures["queries-are-logged"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches the ledger keeping yesterday's rows", () => {
    const r = biteOn("no-truncate", (d) =>
      patch(join(d, "scripts/sweep.sh"), /^: > "\$OUT\/\.queries"$/m, '# : > "$OUT/.queries"'),
    );
    expect(r.failures["queries-are-logged"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches the last resort typing the whole question into a site's search box", () => {
    const r = biteOn("lastresort-sentence", (d) =>
      patch(join(d, "scripts/sweep.sh"), /search\?q=\$\{UKQ\}/, "search?q=${UQ}"),
    );
    expect(r.failures["no-paragraph-to-a-box"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches the write guard being parked on a dead branch while its text stays", () => {
    // THE BOUNDARY THIS ONE PROTECTS IS HIS SIGNATURE, not a number: the engine reads the world
    // and never speaks in it (CLAUDE.md §2). An auditor parked the guard on `if false &&`, left
    // the regex sitting in the line for the rule to find, put `opencli reddit post` into a live
    // channel — and the ruler stayed green while a writing verb reached the fan-out list.
    const r = biteOn("guard-dead", (d) =>
      patch(join(d, "scripts/sweep.sh"), /^if printf '%s' "\$CHANNELS" \| grep -qE/m,
        `if false && printf '%s' "$CHANNELS" | grep -qE`),
    );
    expect(r.failures["guard-before-fanout"].length).toBeGreaterThan(0);
  }, 30_000);

  // ── 2026-09-24: TWO RULES THAT LIVED IN THE SHELL RUNNER FOR A DAY, NOW ORDINARY RULES ──────

  it("catches an executable `opencli browser` line — the Bridge that opened windows on his screen", () => {
    // THE BITE IS THE ORIGINAL LINE, PUT BACK: until 2026-09-24 google-deep read Google through the
    // Browser Bridge in the CEO's own Chrome, and every run threw windows onto his screen.
    const r = biteOn("bridge", (d) =>
      patch(join(d, "scripts/sweep.sh"), /^google-deep\|browser\|.*$/m,
        `google-deep|browser|opencli browser google open "https://www.google.com/search?q={U}&num=30&hl=en" --window background`),
    );
    expect(r.failures["no-bridge-browser-call"].length).toBeGreaterThan(0);
  }, 30_000);

  it("catches the citation ruler's own probes failing — the round-2 hole put back", () => {
    // THE BITE IS THE ORIGINAL DEFECT: before the refuter's round 2 the checker did not know `.ph`,
    // and `archive.ph/…` was not read as an address. Its probe misses, `--selftest` leaves with 1.
    const r = biteOn("selftest", (d) => patch(join(d, "scripts/cite-check.py"), /"ph\|/, '"'));
    expect(r.failures["cite-check-selftest"].length).toBeGreaterThan(0);
  }, 30_000);

  it("has a case for every rule it declares — a rule nobody proved is a rule nobody trusts", () => {
    // if this fails, a rule was added above without a bite case beneath it
    expect(RULES.length).toBe(18);
  }, 30_000);
});

describe("the engine as it stands", () => {
  it("passes every rule of its own ruler", () => {
    const report = runRuler();
    const red = RULES.filter((r) => report.failures[r].length > 0);
    expect(red, `red rules: ${red.join(", ")}`).toEqual([]);
    expect(report.pass).toBe(true);
  }, 30_000);

  it("counts the channels from the map rather than from any sentence about it", () => {
    expect(runRuler().channels).toBeGreaterThan(0);
  }, 30_000);
});
