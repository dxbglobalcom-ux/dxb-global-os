// B63 — the Codex mirror's check names every stale path and is not fooled by compiled Python.
//
// Measured by K3 stage 2's fresh verifier, 2026-09-27 06:40: `sync-codex-mirror.sh --check` said
// the mirror was stale, and the file that really was stale (split.py) was not in what it printed.
// The listing was cut at `head -10` and filled with __pycache__/*.pyc lines, which the check
// compared although no door owns them.
//
// THE REAL SCRIPT, RUN WHERE IT CANNOT REACH THE REPOSITORY. Each case copies the script's bytes,
// at run time, into <scratch>/scripts/governance/, so its own `$(dirname BASH_SOURCE)/../..` is the
// scratch root: no mode of it — the write mode that builds the clean mirror here included — can
// touch the real .agents/ or AGENTS.md. It is the real file, never a copy of its logic: put the
// `head -10` back into scripts/governance/sync-codex-mirror.sh and the eleven-file case turns red.
// TMPDIR points inside the same scratch tree, so the script's own mktemp stage lands there too.
import { spawnSync } from "node:child_process";
import { appendFileSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const REL = join("scripts", "governance", "sync-codex-mirror.sh");
const SCRIPT = join(import.meta.dirname, "..", "..", REL);
// Eleven: one more than the old `head -10` let through.
const PAGES = Array.from({ length: 11 }, (_, i) => `page-${String(i + 1).padStart(2, "0")}.md`);

const boxes: string[] = [];
afterAll(() => {
  for (const d of boxes) rmSync(d, { recursive: true, force: true });
});

function put(root: string, rel: string, text: string): void {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), text);
}

function run(root: string, ...args: string[]) {
  const r = spawnSync("bash", [join(root, REL), ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, TMPDIR: join(root, "tmp") },
  });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

/** the script's inputs in miniature, and the mirror its own write mode makes from them */
function scratch(): string {
  const root = mkdtempSync(join(tmpdir(), "codex-mirror-check-"));
  boxes.push(root);
  mkdirSync(join(root, "tmp"));
  mkdirSync(dirname(join(root, REL)), { recursive: true });
  copyFileSync(SCRIPT, join(root, REL));
  put(root, ".claude/CLAUDE.md", "# Core\nDoors: .claude/skills/ · orders: .claude/hooks/\n");
  put(root, ".claude/skills/door-a/SKILL.md", "# Door A\nRead .claude/CLAUDE.md first.\n");
  for (const p of PAGES) put(root, `.claude/skills/door-a/${p}`, `# ${p}\n`);
  put(root, ".claude/hooks/order.sh", "#!/usr/bin/env bash\necho .claude/skills/door-a/SKILL.md\n");
  const made = run(root);
  expect(made.code, made.err).toBe(0);
  return root;
}

describe("sync-codex-mirror.sh --check (B63)", () => {
  it("passes a mirror its own write mode has just made", () => {
    const r = run(scratch(), "--check");
    expect(r.code, r.err).toBe(0);
    expect(r.out).toContain("SYNC_OK mirror matches source");
  });

  it("names every one of eleven stale mirror files — none is cut off", () => {
    const root = scratch();
    for (const p of PAGES) appendFileSync(join(root, ".agents/skills/door-a", p), "a hand edit\n");
    const r = run(root, "--check");
    expect(r.code).toBe(1);
    expect(r.err).toContain("SYNC_STALE");
    for (const p of PAGES) expect(r.err).toContain(`.agents/skills/door-a/${p}`);
  });

  it("ignores a __pycache__/*.pyc that only the source side has", () => {
    const root = scratch();
    put(root, ".claude/skills/door-a/__pycache__/x.cpython-313.pyc", "compiled\n");
    const r = run(root, "--check");
    expect(r.code, r.err).toBe(0);
    expect(r.out).toContain("SYNC_OK mirror matches source");
    expect(r.out + r.err).not.toMatch(/__pycache__|\.pyc/);
  });
});

// Sol's single pass on the design-max job, 2026-10-04: the mirror of dxb-team2 named
// `.codex/hooks/dxb-design-max.py`, a file that does not exist — the script copies only the
// `*.sh` hooks, yet rewrote every `.claude/hooks/` path, and the home path
// `~/.claude/hooks/dxb-cost-gate.py` became `~/.codex/hooks/…` the same way. A hook path is
// rewritten only where the mirror really holds the file: the hooks folder itself and its `*.sh`.
describe("sync-codex-mirror.sh rewrites only the hook paths it mirrors", () => {
  it("a .sh hook and the bare hooks folder move to .codex/hooks/; a .py hook and a home path stay", () => {
    const root = scratch();
    put(root, ".claude/skills/door-b/SKILL.md", [
      "Orders: `.claude/hooks/` · the order `.claude/hooks/order.sh`",
      "The gate `.claude/hooks/gate.py` and its home twin `~/.claude/hooks/home-gate.py`.",
      "",
    ].join("\n"));
    const made = run(root);
    expect(made.code, made.err).toBe(0);
    const door = spawnSync("cat", [join(root, ".agents/skills/door-b/SKILL.md")], { encoding: "utf8" }).stdout;
    expect(door).toContain("Orders: `.codex/hooks/` · the order `.codex/hooks/order.sh`");
    expect(door).toContain("The gate `.claude/hooks/gate.py` and its home twin `~/.claude/hooks/home-gate.py`.");
    expect(door).not.toMatch(/\.codex\/hooks\/(gate|home-gate)\.py/);
    expect(run(root, "--check").code).toBe(0);
  });
});
