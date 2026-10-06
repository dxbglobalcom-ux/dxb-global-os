// refuter.sh's gate — the one door to the read-only auditor (U36), held by a machine.
//
// The lead chooses Sol's effort (CEO 2026-10-06: the score card is gone from dxb-team2); the door
// only bounds it to medium, high or xhigh, defaults to high, and forwards nothing that could
// override the effort, the sandbox, the model or the MCP inventory. The cases run the REAL script
// with a stand-in `codex` on PATH (it answers the inventory and echoes the prompt), so no model is
// called and no quota is spent.
import { spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const REPO = join(import.meta.dirname, "..", "..");
const REFUTER = join(REPO, "scripts", "governance", "refuter.sh");
const box = mkdtempSync(join(tmpdir(), "refuter-gate-"));
afterAll(() => rmSync(box, { recursive: true, force: true }));

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
  *" exec "*) if [ -n "\${QUOTE_THEN_FAIL:-}" ]; then
                echo "ERROR: Selected model is at capacity — quoted in the answer"; echo "ERROR: connection lost" >&2; exit 42
              fi
              if [ -n "\${QUOTE_EMPTY_STDERR:-}" ]; then
                echo "ERROR: Selected model is at capacity — quoted in the answer"; exit 42
              fi
              if [ -n "\${CAPACITY_FAILS:-}" ]; then
                n=$(cat "$CAPACITY_FAILS" 2>/dev/null || echo 0)
                if [ "$n" -gt 0 ]; then echo $((n - 1)) > "$CAPACITY_FAILS"; printf 'ERROR: Selected model is at capacity. Please try a different model.\\ntokens used\\n87,812\\n' >&2; exit 1; fi
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

  it("launches at high when no --effort is given, sends the brief alone, and logs the launch", () => {
    const r = run("audit this claim");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain('EFFORT_ARG model_reasoning_effort="high"');
    const prompt = r.stdout.split("PROMPT_BEGIN\n")[1].split("PROMPT_END")[0];
    expect(prompt).toBe("audit this claim\n");
    expect(r.stderr).toMatch(/^AUDIT effort=high$/m);
    expect(r.stderr).not.toMatch(/AUDIT_CARD/);
    const log = readFileSync(join(home, ".local", "state", "dxb", "audits.log"), "utf8").split("\n").filter(Boolean);
    expect(log.at(-1)).toMatch(/^\d{4}-\d{2}-\d{2}T\S+\thigh\ttry=1$/);
  });

  it("launches at the effort the lead chose", () => {
    const r = run("--effort", "xhigh", "audit this claim");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain('EFFORT_ARG model_reasoning_effort="xhigh"');
    expect(r.stderr).toMatch(/^AUDIT effort=xhigh$/m);
  });

  it("refuses an effort outside medium, high and xhigh, before Codex is asked anything", () => {
    for (const bad of ["max", "low"]) {
      const r = run("--effort", bad, "audit this");
      expect(r.status, bad).toBe(1);
      expect(r.stderr).toMatch(/REFUTER_FAIL: --effort takes medium, high or xhigh/);
      expect(r.stdout).not.toMatch(/PROMPT_BEGIN/);
    }
  });

  it("refuses the old --card as an option it does not pass, before Codex is asked anything", () => {
    const f = join(box, "card.md");
    writeFileSync(f, "job: x\n");
    const r = run("--card", f, "audit this");
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/REFUTER_FAIL: '--card' is not passed to the auditor/);
    expect(r.stdout).not.toMatch(/PROMPT_BEGIN/);
  });

  it("refuses every forwarded option that could override the effort or the profile", () => {
    for (const bad of [["-c", 'model_reasoning_effort="medium"'], ['--config=model_reasoning_effort="medium"'],
                       ["-s", "workspace-write"], ["--sandbox", "danger-full-access"], ["-m", "gpt-5.5"],
                       ["-p", "default"], ["--enable", "x"], ["--dangerously-bypass-approvals-and-sandbox"]]) {
      const r = run(...bad, "audit this");
      expect(r.status, bad.join(" ")).toBe(1);
      expect(r.stderr).toMatch(/is not passed to the auditor/);
      expect(r.stdout).not.toMatch(/PROMPT_BEGIN/);
    }
  });

  it("keeps the prompt whole when allowed options come after it, and refuses two prompts", () => {
    const r = run("audit this claim", "--json", "-C", box);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain("--json");
    const prompt = r.stdout.split("PROMPT_BEGIN\n")[1].split("PROMPT_END")[0];
    expect(prompt.trimEnd().endsWith("audit this claim")).toBe(true);
    const two = run("one", "two");
    expect(two.status).toBe(1);
    expect(two.stderr).toMatch(/more than one prompt/);
  });

  it("binds an option's value to it, so a value that looks like an option never reaches Codex as one", () => {
    const r = run("-o", '--config=model_reasoning_effort="medium"', "audit this");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain('ARG --output-last-message=--config=model_reasoning_effort="medium"');
    expect(r.stdout).not.toMatch(/^ARG --config/m);
    expect(r.stdout).toContain('EFFORT_ARG model_reasoning_effort="high"');
  });

  it("accepts the attached short forms of the allowed options, bound", () => {
    const r = run("-C/tmp", "-o=out.txt", "audit this");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain("ARG --cd=/tmp");
    expect(r.stdout).toContain("ARG --output-last-message=out.txt");
  });

  it("takes the prompt after '--', and refuses an empty brief", () => {
    const r = run("--json", "--", "-a brief that starts with a dash");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain("-a brief that starts with a dash");
    for (const empty of [[""], ["   "]]) {
      const e = run(...empty);
      expect(e.status).toBe(1);
      expect(e.stderr).toMatch(/the brief is empty/);
    }
  });

  it("runs the whole audit again when the model is at capacity, and gives up after four tries", () => {
    const counter = join(box, "capacity");
    writeFileSync(counter, "2");
    const r = runWith({ CAPACITY_FAILS: counter }, "audit this");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr.match(/AUDIT_RETRY/g)?.length).toBe(2);
    expect(r.stdout).toContain("PROMPT_BEGIN");
    writeFileSync(counter, "9");
    const gone = runWith({ CAPACITY_FAILS: counter }, "audit this");
    expect(gone.status).toBe(75);
    expect(gone.stderr).toMatch(/stayed at capacity after 4 tries/);
  });

  it("never retries on a capacity sentence quoted in the answer; caps the retries at three; logs every try", () => {
    const q = runWith({ QUOTE_THEN_FAIL: "1" }, "audit this");
    expect(q.status).toBe(42);
    expect(q.stderr).not.toMatch(/AUDIT_RETRY/);
    const e = runWith({ QUOTE_EMPTY_STDERR: "1", DXB_REFUTER_RETRY_WAITS: "0 0 0" }, "audit this");
    expect(e.status).toBe(42);
    expect(e.stderr).not.toMatch(/AUDIT_RETRY/);
    const counter = join(box, "capacity-cap");
    writeFileSync(counter, "9");
    const logFile = join(home, ".local", "state", "dxb", "audits.log");
    const before = readFileSync(logFile, "utf8").split("\n").filter(Boolean).length;
    const r = runWith({ CAPACITY_FAILS: counter, DXB_REFUTER_RETRY_WAITS: "0 0 0 0 0 0" }, "audit this");
    expect(r.status).toBe(75);
    expect(r.stderr.match(/AUDIT_RETRY/g)?.length).toBe(3);
    const after = readFileSync(logFile, "utf8").split("\n").filter(Boolean);
    expect(after.length - before).toBe(4);
    expect(after.at(-1)).toMatch(/try=4$/);
  });

  it("reads the brief from stdin when the prompt is '-'", () => {
    const r = run("--effort", "medium", "-");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain('model_reasoning_effort="medium"');
    expect(r.stdout).toContain("the brief read from stdin");
  });
});
