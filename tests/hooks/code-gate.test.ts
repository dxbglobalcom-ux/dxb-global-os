// THE CODE GATE under vitest — the real hook and the real status line, run where they stand.
// The CEO's order, 2026-09-24: code is written at Opus 5.5 · max, and at medium only when the
// weekly quota is tight — "bu da bir hook ile sabitlensin". Both pieces live outside the
// repository, in ~/.claude/hooks, and are spawned there with sample stdin: never a copy of their
// logic. Every case gets its own temporary directory as XDG_RUNTIME_DIR (where the quota record
// lives) and as the gate's log directory, so nothing lands in the machine's own claude-ctx or
// ~/.claude/logs.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const HOOKS = join(homedir(), ".claude", "hooks");
const GATE = join(HOOKS, "dxb-code-gate.py");
const STATUS_LINE = join(HOOKS, "dxb-statusline.js");
const HOUR = 3600;

const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

/** a fresh directory standing in for XDG_RUNTIME_DIR and the gate's log directory; its name holds
 *  no guarded word and no word boundary before the random part, so files made in it are not guarded */
function box(): string {
  const dir = mkdtempSync(join(tmpdir(), "cgbox"));
  tmp.push(dir);
  return dir;
}

/** a quota record in the shape the status line writes; `used` is the seven-day percentage */
function quota(dir: string, used: number, o: { ageH?: number; resetsInH?: number } = {}): void {
  const now = Date.now() / 1000;
  mkdirSync(join(dir, "claude-ctx"), { recursive: true });
  writeFileSync(join(dir, "claude-ctx", "rate-limits.json"), JSON.stringify({
    session_id: "0d08dc67-test",
    seven_day: { used_percentage: used, resets_at: Math.round(now + (o.resetsInH ?? 48) * HOUR) },
    five_hour: { used_percentage: 2, resets_at: Math.round(now + HOUR) },
    written_at: new Date(Date.now() - (o.ageH ?? 0) * HOUR * 1000).toISOString(),
  }));
}

/** a PreToolUse input as Claude Code sends it; `agent` makes it a subagent's, `id` names its instance */
function call(tool: string, input: Record<string, unknown>, effort = "xhigh", agent?: string, id = "a0") {
  return {
    session_id: "0d08dc67-test", hook_event_name: "PreToolUse", tool_name: tool, tool_input: input,
    effort: { level: effort }, ...(agent ? { agent_id: id, agent_type: agent } : {}),
  };
}

/** runs the real gate; exit 0 and a clean stderr are part of every answer */
function gate(dir: string, input: unknown): string {
  const r = spawnSync("python3", [GATE], {
    input: typeof input === "string" ? input : JSON.stringify(input),
    encoding: "utf8",
    env: { ...process.env, XDG_RUNTIME_DIR: dir, DXB_CODE_GATE_LOG_DIR: join(dir, "logs"), PYTHONDONTWRITEBYTECODE: "1" },
  });
  expect(r.status, r.stderr).toBe(0);
  expect(r.stderr).toBe("");
  return r.stdout;
}

const answer = (out: string) => JSON.parse(out).hookSpecificOutput;
const write = (tool: string, file_path: string) =>
  tool === "Write" ? { file_path, content: "x" } : { file_path, old_string: "a", new_string: "b" };
const CODE = ["x.ts", "y.py", "z.sh", "w.mjs"].map((f) => `/work/src/${f}`);
const spawnAgent = (subagent_type: string, model?: string) =>
  call("Agent", { description: "d", prompt: "p", subagent_type, ...(model ? { model } : {}) });
/** n distinct lines, each ending in a newline */
const lines = (n: number, tag = "l") => Array.from({ length: n }, (_, i) => `${tag}${i}\n`).join("");

describe("NORMAL: a code file is written only at max", () => {
  it("denies a main session at xhigh a Write or Edit on .ts .py .sh .mjs, and names the builder at max", () => {
    const dir = box();
    for (const path of CODE) {
      for (const tool of ["Write", "Edit"]) {
        const a = answer(gate(dir, call(tool, write(tool, path))));
        expect(a.permissionDecision, `${tool} ${path}`).toBe("deny");
        expect(a.permissionDecisionReason).toContain("builder subagent at Opus 5.5 · max effort");
        expect(a.permissionDecisionReason).toContain("runs at xhigh");
        expect(a.permissionDecisionReason).toContain('subagent_type "builder"');
      }
    }
  });
  it("names both routes when it denies: builder-lean for simple work, builder for anything else", () => {
    const dir = box();
    for (const [effort, agent] of [["xhigh", undefined], ["medium", "builder"]] as const) {
      const reason = answer(gate(dir, call("Write", write("Write", "/work/src/x.ts"), effort, agent))).permissionDecisionReason;
      expect(reason, `${effort} ${agent}`).toContain("simple work (one code file, at most 40 changed lines");
      expect(reason).toContain('subagent_type "builder-lean"');
      expect(reason).toContain('anything else with subagent_type "builder"');
    }
  });
  it("lets the builder at max write the same files", () => {
    const dir = box();
    for (const path of CODE) {
      for (const tool of ["Write", "Edit"]) expect(gate(dir, call(tool, write(tool, path), "max", "builder"))).toBe("");
    }
  });
  it("never gates text and config: .md and .json at xhigh pass", () => {
    const dir = box();
    expect(gate(dir, call("Write", write("Write", "/work/notes.md")))).toBe("");
    expect(gate(dir, call("Edit", write("Edit", "/work/package.json")))).toBe("");
  });
  it("denies a Bash command that writes a code file: redirect, heredoc, tee, sed -i", () => {
    const dir = box();
    for (const command of [
      "printf 'print(1)\\n' > y.py",
      "cat <<EOF > z.ts\nexport const z = 1;\nEOF",
      "printf 'x' | tee a.ts",
      "sed -i 's/a/b/' b.mjs",
    ]) {
      expect(answer(gate(dir, call("Bash", { command }))).permissionDecision, command).toBe("deny");
    }
  });
  it("lets a Bash command that only reads pass: cat, grep, node -e", () => {
    const dir = box();
    for (const command of ["cat a.ts", "grep x b.py", 'node -e "console.log(1 + 1)"']) {
      expect(gate(dir, call("Bash", { command })), command).toBe("");
    }
  });
  it("counts tee only in command position", () => {
    const dir = box();
    expect(gate(dir, call("Bash", { command: "grep tee a.ts" }))).toBe("");
    expect(answer(gate(dir, call("Bash", { command: 'echo x | tee "a.ts"' }))).permissionDecision).toBe("deny");
  });
  it("counts tee after prefix commands — sudo, env, xargs, timeout — with their own options", () => {
    const dir = box();
    for (const command of [
      "echo x | sudo tee a.ts", "echo x | env FOO=1 tee a.ts", "ls | xargs tee b.py",
      "echo x | timeout 5 tee a.ts", "ls | xargs -0 tee b.py", "echo x | sudo -u x tee a.ts",
    ]) {
      expect(answer(gate(dir, call("Bash", { command }))).permissionDecision, command).toBe("deny");
    }
    for (const command of ["grep tee a.ts", "sudo grep tee a.ts"]) {
      expect(gate(dir, call("Bash", { command })), command).toBe("");
    }
  });
  it("reads no write inside a quoted string or a heredoc body, and still sees a real redirect to a quoted target", () => {
    const dir = box();
    for (const command of ['git commit -m "move a.ts -> b.ts"', "git commit -F - <<'EOF'\nmove a.ts -> b.ts\nEOF"]) {
      expect(gate(dir, call("Bash", { command })), command).toBe("");
    }
    for (const command of [`printf 'x' > "y.py"`, "cat <<EOF > z.ts\nexport const z = 1;\nEOF"]) {
      expect(answer(gate(dir, call("Bash", { command }))).permissionDecision, command).toBe("deny");
    }
  });
  it("treats a file with no extension that starts with #! as code, and .mts / .cts too", () => {
    const dir = box();
    const script = join(dir, "run-me");
    writeFileSync(script, "#!/usr/bin/env python3\nprint(1)\n");
    for (const input of [
      call("Write", { file_path: "/repo/scripts/hooks/pre-commit", content: "#!/bin/sh\nexit 0\n" }),
      call("Edit", { file_path: script, old_string: "print(1)", new_string: "print(2)" }),
      call("Bash", { command: "echo x > a.mts" }),
      call("Write", write("Write", "/repo/src/b.cts")),
    ]) {
      expect(answer(gate(dir, input)).permissionDecision, JSON.stringify(input.tool_input)).toBe("deny");
    }
    expect(gate(dir, call("Write", { file_path: "/repo/NOTES", content: "plain text\n" }))).toBe("");
  });
  it("gates notebooks too: a .ipynb write at xhigh is denied", () => {
    const dir = box();
    expect(answer(gate(dir, call("NotebookEdit", { notebook_path: "/work/n.ipynb", new_source: "x = 1" }))).permissionDecision).toBe("deny");
    expect(answer(gate(dir, call("Write", write("Write", "/work/n.ipynb")))).permissionDecision).toBe("deny");
  });
});

describe("the builder is routed by the weekly quota", () => {
  it("LEAN (a fresh record at 80 %): Agent(builder) becomes builder-lean, with no model key", () => {
    const dir = box();
    quota(dir, 80);
    const a = answer(gate(dir, spawnAgent("builder", "opus")));
    expect(a.permissionDecision).toBe("allow");
    expect(a.updatedInput).toEqual({ description: "d", prompt: "p", subagent_type: "builder-lean" });
  });
  it("NORMAL: Agent(builder) is left alone when the record is under 80, stale, past its reset, missing or corrupt", () => {
    const under = box(); quota(under, 79);
    const stale = box(); quota(stale, 95, { ageH: 7 });
    const reset = box(); quota(reset, 95, { resetsInH: -1 });
    const missing = box();
    const corrupt = box();
    mkdirSync(join(corrupt, "claude-ctx"));
    writeFileSync(join(corrupt, "claude-ctx", "rate-limits.json"), '{"seven_day": {"used_perc');
    for (const [name, dir] of Object.entries({ under, stale, reset, missing, corrupt })) {
      expect(gate(dir, spawnAgent("builder")), name).toBe("");
    }
  });
  it("NORMAL: Agent(builder-lean) is not rewritten — the chief's choice stands", () => {
    expect(gate(box(), spawnAgent("builder-lean"))).toBe("");
  });
  it("drops any model key from builder and builder-lean, so the model the agent file pins wins", () => {
    const dir = box();
    for (const type of ["builder", "builder-lean"]) {
      const a = answer(gate(dir, spawnAgent(type, "sonnet")));
      expect(a.permissionDecision, type).toBe("allow");
      expect(a.updatedInput).toEqual({ description: "d", prompt: "p", subagent_type: type });
    }
  });
});

describe("LEAN: code may be written at medium", () => {
  it("lets medium and max write, and denies xhigh naming medium", () => {
    const dir = box();
    quota(dir, 90);
    const at = (effort: string, agent?: string) => gate(dir, call("Write", write("Write", "/work/src/x.ts"), effort, agent));
    expect(at("medium", "builder-lean")).toBe("");
    expect(at("max", "builder")).toBe("");
    const a = answer(at("xhigh"));
    expect(a.permissionDecision).toBe("deny");
    expect(a.permissionDecisionReason).toContain("Opus 5.5 · medium effort");
  });
});

// The CEO's yes of 2026-09-24 ("tmm güzel. yapın."): simple code runs at medium — one code file,
// at most 40 changed lines, no money / approval / database / security / governance path.
describe("NORMAL: simple work may be written at medium, by builder-lean only", () => {
  const lean = (dir: string, tool: string, input: Record<string, unknown>, id = "lean-1") =>
    gate(dir, call(tool, input, "medium", "builder-lean", id));
  const NOT_SIMPLE = "stop and report back: the chief hands it to the builder at max";

  it("allows one code file and its rewrites, denies a second file, and keeps each instance's envelope apart", () => {
    const dir = box();
    expect(lean(dir, "Write", { file_path: "/work/src/a.ts", content: lines(12) })).toBe("");
    expect(lean(dir, "Edit", { file_path: "/work/src/a.ts", old_string: "l0", new_string: "x0" })).toBe("");
    const a = answer(lean(dir, "Write", { file_path: "/work/src/b.ts", content: lines(1) }));
    expect(a.permissionDecision).toBe("deny");
    expect(a.permissionDecisionReason).toContain("second code file");
    expect(a.permissionDecisionReason).toContain(NOT_SIMPLE);
    expect(lean(dir, "Write", { file_path: "/work/src/b.ts", content: lines(1) }, "lean-2")).toBe("");
  });
  it("allows 40 changed lines in all: Write diffs the file on disk, Edit and MultiEdit count their strings, a denied write costs nothing", () => {
    const dir = box();
    const file = join(dir, "a.ts");
    writeFileSync(file, lines(30));
    // a Write over the 30 lines on disk that changes 10 of them: 10
    expect(lean(dir, "Write", { file_path: file, content: lines(30).replace(/^l(\d)$/gm, "x$1") })).toBe("");
    // a MultiEdit of 1 -> 15 lines and 10 -> 1 lines: 25, so 35 in all
    const edits = [{ old_string: "l10", new_string: lines(15, "m") }, { old_string: lines(10, "n"), new_string: "n" }];
    expect(lean(dir, "MultiEdit", { file_path: file, edits })).toBe("");
    // an Edit of 6 lines would make 41: denied, and it costs nothing — 5 more make exactly 40
    const over = answer(lean(dir, "Edit", { file_path: file, old_string: "l20", new_string: lines(6, "o") }));
    expect(over.permissionDecision).toBe("deny");
    expect(over.permissionDecisionReason).toContain("41 in all, past the limit of 40");
    expect(over.permissionDecisionReason).toContain(NOT_SIMPLE);
    expect(lean(dir, "Edit", { file_path: file, old_string: "l20", new_string: lines(5, "p") })).toBe("");
    expect(answer(lean(dir, "Edit", { file_path: file, old_string: "l21", new_string: "q" })).permissionDecision).toBe("deny");
  });
  it("counts a replace_all Edit once per occurrence in the file: 11 × a 4-line block is 44 lines", () => {
    const dir = box();
    const file = join(dir, "r.ts");
    writeFileSync(file, "a\nb\nc\nd\n".repeat(11));
    const edit = { file_path: file, old_string: "a\nb\nc\nd", new_string: "w\nx\ny\nz" };
    const a = answer(lean(dir, "Edit", { ...edit, replace_all: true }));
    expect(a.permissionDecision).toBe("deny");
    expect(a.permissionDecisionReason).toContain("changes 44 lines");
    expect(lean(dir, "Edit", edit)).toBe("");
  });
  it("guards this repository's own money, approval, database, security and governance code, and lets ordinary names through", () => {
    const dir = box();
    for (const path of [
      "scripts/bootstrap-db.sh", "packages/shared/src/db.ts", "tools/dxb-cli/src/approve.ts",
      "apps/dashboard/scripts/reset-ceo-password.ts", "packages/orchestrator/src/critical-gate.ts",
      "apps/dashboard/src/app/(command)/fin/pnl/page.tsx",
    ]) {
      const a = answer(lean(dir, "Edit", { file_path: `/repo/${path}`, old_string: "a", new_string: "b" }));
      expect(a.permissionDecision, path).toBe("deny");
      expect(a.permissionDecisionReason, path).toContain("is a guarded path");
    }
    for (const [k, path] of ["src/navigate.ts", "src/aggregate.ts", "src/utils/format.ts"].entries()) {
      expect(lean(dir, "Edit", { file_path: `/repo/${path}`, old_string: "a", new_string: "b" }, `plain-${k}`), path).toBe("");
    }
  });
  it("never counts a guarded path as simple, in any letter case", () => {
    const dir = box();
    for (const path of ["/work/scripts/governance/x.mjs", "/work/src/q.sql", "/work/src/Billing.ts"]) {
      const a = answer(lean(dir, "Write", { file_path: path, content: lines(1) }));
      expect(a.permissionDecision, path).toBe("deny");
      expect(a.permissionDecisionReason, path).toContain("is a guarded path");
      expect(a.permissionDecisionReason, path).not.toContain("second code file");
    }
  });
  it("denies builder-lean a code write through Bash, whose size cannot be measured", () => {
    const a = answer(lean(box(), "Bash", { command: "printf 'x' > y.py" }));
    expect(a.permissionDecision).toBe("deny");
    expect(a.permissionDecisionReason).toContain("Make this change with Write or Edit");
  });
  it("leaves everyone else as before: xhigh and medium outside builder-lean are denied, a max builder has no envelope", () => {
    const dir = box();
    expect(answer(gate(dir, call("Write", write("Write", "/work/src/a.ts")))).permissionDecision).toBe("deny");
    const medium = answer(gate(dir, call("Write", write("Write", "/work/src/a.ts"), "medium", "builder")));
    expect(medium.permissionDecisionReason).toContain("Opus 5.5 · max effort");
    for (const path of ["/work/src/a.ts", "/work/src/b.ts", "/work/scripts/governance/c.mjs"]) {
      expect(gate(dir, call("Write", { file_path: path, content: lines(100) }, "max", "builder")), path).toBe("");
    }
  });
  it("lets a builder-lean spawned in LEAN keep writing when the mode turns NORMAL, under the envelope", () => {
    const dir = box();
    quota(dir, 90);
    for (const f of ["a.ts", "b.ts", "c.ts"]) {
      expect(lean(dir, "Write", { file_path: `/work/src/${f}`, content: lines(50) }), f).toBe("");
    }
    rmSync(join(dir, "claude-ctx", "rate-limits.json"));
    expect(lean(dir, "Write", { file_path: "/work/src/d.ts", content: lines(20) })).toBe("");
    expect(answer(lean(dir, "Write", { file_path: "/work/src/e.ts", content: lines(1) })).permissionDecision).toBe("deny");
  });
});

describe("the gate never breaks a session, and records only what it decided", () => {
  it("answers malformed stdin with exit 0 and nothing on stdout, and keeps the traceback", () => {
    const dir = box();
    expect(gate(dir, "{not json")).toBe("");
    expect(readFileSync(join(dir, "logs", "dxb-code-gate.err"), "utf8")).toContain("JSONDecodeError");
  });
  it("logs a deny and a model strip as one JSON line each, and nothing for a call that passes", () => {
    const dir = box();
    gate(dir, call("Write", write("Write", "/work/src/x.ts")));
    gate(dir, spawnAgent("builder", "sonnet"));
    gate(dir, call("Write", write("Write", "/work/notes.md")));
    gate(dir, call("Bash", { command: "cat a.ts" }));
    const logged = readFileSync(join(dir, "logs", "dxb-code-gate.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
    expect(logged.map((l) => [l.tool, l.target, l.effort, l.mode, l.decision])).toEqual([
      ["Write", "/work/src/x.ts", "xhigh", "NORMAL", "deny"],
      ["Agent", "builder", "xhigh", "NORMAL", "strip-model"],
    ]);
    expect(Object.keys(logged[0]).sort()).toEqual(["agent_type", "decision", "effort", "mode", "session_id", "target", "tool", "ts"]);
  });
});

// A real status-line input (Claude Code 2.1.281, 2026-09-24), cut to the fields the bar reads.
const SAMPLE = {
  session_id: "df6b050f-e6fe-4e45-a7ac-bc580be8b672",
  effort: { level: "xhigh" },
  model: { id: "claude-opus-5-5[1m]", display_name: "Opus 5.5 (1M context)" },
  context_window: {
    total_input_tokens: 58429, total_output_tokens: 83, context_window_size: 1000000,
    current_usage: { input_tokens: 2, output_tokens: 83, cache_creation_input_tokens: 30108, cache_read_input_tokens: 28319 },
    used_percentage: 6, remaining_percentage: 94,
  },
  rate_limits: {
    five_hour: { used_percentage: 2, resets_at: 1790221800 },
    seven_day: { used_percentage: 47, resets_at: 1790409600 },
  },
};

/** runs the real status line with its workspace in `dir`, so the bar and its files stay there */
function statusLine(dir: string, input: object): string {
  const r = spawnSync("node", [STATUS_LINE], {
    input: JSON.stringify({ ...input, workspace: { current_dir: dir, project_dir: dir } }),
    encoding: "utf8",
    env: { ...process.env, XDG_RUNTIME_DIR: dir },
  });
  expect(r.status, r.stderr).toBe(0);
  return r.stdout;
}

describe("the status line persists the quota for the gate", () => {
  it("writes both windows and written_at to rate-limits.json, and renders the same line as without them", () => {
    const dir = box();
    const before = Date.now();
    const withQuota = statusLine(dir, SAMPLE);
    const rec = JSON.parse(readFileSync(join(dir, "claude-ctx", "rate-limits.json"), "utf8"));
    expect(rec).toMatchObject({
      session_id: SAMPLE.session_id,
      seven_day: SAMPLE.rate_limits.seven_day,
      five_hour: SAMPLE.rate_limits.five_hour,
    });
    expect(Date.parse(rec.written_at)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(rec.written_at)).toBeLessThanOrEqual(Date.now());
    const { rate_limits: _dropped, ...without } = SAMPLE;
    expect(withQuota).toContain("Opus 5.5 (1M)");
    expect(statusLine(dir, without)).toBe(withQuota);
  });
  it("hands the gate what it reads: a week at 80 % rendered by the bar sends the builder to builder-lean", () => {
    const dir = box();
    const week = { used_percentage: 80, resets_at: Math.round(Date.now() / 1000) + 72 * HOUR };
    statusLine(dir, { ...SAMPLE, rate_limits: { ...SAMPLE.rate_limits, seven_day: week } });
    expect(answer(gate(dir, spawnAgent("builder"))).updatedInput.subagent_type).toBe("builder-lean");
  });
});
