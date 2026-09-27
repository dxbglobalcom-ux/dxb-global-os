// B46 · K1 — A HUNTER READS THE WORLD AND CHANGES NOTHING HERE.
//
// WHAT WAS MEASURED, 2026-09-17, from a hunter's own transcript: seven of them ran at the ROOT of
// this repository, in `bypassPermissions`, holding 115 tools — `Write`, `Edit`, `NotebookEdit`,
// `Task`, `CronCreate`, `CronDelete`, `RemoteTrigger`, `ScheduleWakeup`, `SendMessage` and
// `mcp__claude_ai_Claude_Docs__delete`, which deletes the CEO's own cloud documents. Nothing bad
// had happened. The hole was structural, and it stood against this project's own audit law: a
// subagent audits, refutes and sweeps — it NEVER writes.
//
// THE REPAIR, AND THE THING IT TAUGHT. Narrowing the tools was measured live the same hour:
//
//     before                119 tools · Write Edit NotebookEdit Task CronCreate SendMessage
//     --allowed-tools only   99 tools · no writers, but Workflow, TaskCreate, a browser that
//                                       runs arbitrary code, and Claude_Docs__delete remained
//     + --strict-mcp-config   7 tools · Bash Glob Grep Read ToolSearch WebFetch WebSearch
//
// and with those seven the hunter STILL created a file in this repository, with `echo >`, because
// a hunter needs Bash and Bash writes. A permission list is not a wall. bubblewrap is: the
// repository is bound read-only, the run folder writable. Re-measured with the same prompt, the
// hunter answered "Dosya sistemi salt okunur olduğu için … oluşturulamadı" and no file appeared.
//
// A live model call cannot sit in the battery — it costs money and it needs the network. What is
// guarded here is the LAUNCH: the fleet may never again start a hunter without these restraints.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const FLEET = readFileSync(join(process.cwd(), ".claude/skills/dxb-research/fleet/fleet.sh"), "utf8");
const launch = FLEET.slice(FLEET.indexOf("timeout \"$TMO\""), FLEET.indexOf("$role.meta"));
// B56, 2026-09-27 — THE HOME FOLDER TOO. The jail bound only the repository read-only, and the rest of $HOME stayed
// writable (the lead, during a live run: files changed under ~/.cache, ~/.claude, ~/.local/state, ~/.opencli, ~/.npm,
// and ~/.claude.json). What a hunter must write under $HOME was measured with strace on a hunter-shaped `claude -p`
// and on every weapon of ARSENAL.md (fleet.sh's JAIL comment names each and why): these, and nothing else.
const HOME_RW = [".local/share/dxb-research-chrome/run"];                  // hidden.py's slots: the real folder, bound
const HOME_OWN = [".claude/shell-snapshots", ".claude/session-env"];      // claude's own scratch: a private tmpfs each

describe("the fleet may not launch a hunter that can change this repository", () => {
  it("refuses every writing, scheduling and messaging tool by name", () => {
    for (const tool of [
      "Write", "Edit", "NotebookEdit", "Task", "CronCreate", "CronDelete",
      "RemoteTrigger", "ScheduleWakeup", "SendMessage", "Workflow",
    ]) {
      expect(FLEET, `${tool} is not in the hunter's deny list`).toMatch(new RegExp(`HUNTER_DENY="[^"]*\\b${tool}\\b`));
    }
  });

  it("switches the MCP servers off — an allow list alone left 99 tools standing", () => {
    expect(launch).toMatch(/--strict-mcp-config/);
  });

  it("carries the allow list and the deny list into the launch", () => {
    expect(launch).toMatch(/--allowed-tools \$HUNTER_ALLOW/);
    expect(launch).toMatch(/--disallowed-tools \$HUNTER_DENY/);
  });

  it("binds this repository read-only, because Bash writes and no tool list can stop it", () => {
    // as an ARRAY: this repository's own path carries a space, and a string would have handed
    // bwrap three arguments where one was meant — the jail would simply not have started.
    expect(FLEET).toMatch(/JAIL=\(bwrap [^)]*--ro-bind "\$REPO_ROOT" "\$REPO_ROOT"/);
    expect(launch).toMatch(/"\$\{JAIL\[@\]\}" claude -p/);
  });

  it("binds $HOME read-only and lets a hunter write under it only the measured set — a later widening shows here", () => {
    const jail = /^ *JAIL=\(bwrap [^\n]*\)$/m.exec(FLEET)?.[0] ?? "";
    expect(jail).toMatch(/JAIL=\(bwrap --dev-bind \/ \/ --ro-bind "\$HOME" "\$HOME" "\$\{HOME_W\[@\]\}" --ro-bind "\$REPO_ROOT"/);
    expect(jail.match(/\$HOME/g), "every writable path under $HOME comes from HOME_W").toHaveLength(2);
    const list = (name: string) => (new RegExp(`^${name}=\\(([^)]*)\\)$`, "m").exec(FLEET)?.[1] ?? "").split(/\s+/).filter(Boolean);
    expect(list("HUNTER_HOME_RW")).toEqual(HOME_RW);
    expect(list("HUNTER_HOME_OWN")).toEqual(HOME_OWN);
    // HOME_W is filled from those two lists alone: the shared folder bound, claude's own scratch a private tmpfs
    expect(FLEET.match(/HOME_W\+=\([^)]*\)/g)).toEqual(['HOME_W+=(--bind "$HOME/$d" "$HOME/$d")', 'HOME_W+=(--tmpfs "$HOME/$d")']);
    expect(FLEET).toMatch(/for d in "\$\{HUNTER_HOME_RW\[@\]\}"; do mkdir -p "\$HOME\/\$d" && HOME_W\+=\(--bind /);
    expect(FLEET).toMatch(/for d in "\$\{HUNTER_HOME_OWN\[@\]\}"; do mkdir -p "\$HOME\/\$d" && HOME_W\+=\(--tmpfs /);
  });

  it("says so loudly when the jail is not available instead of going ahead in silence", () => {
    expect(FLEET).toMatch(/bwrap yok[\s\S]{0,120}deliktir/);
  });

  it("runs the hunter in its own folder, not at the root of the repository", () => {
    // outside the repository altogether since B56 K1 (the run folder moved under var/): completion-gate.test.ts
    expect(FLEET).toMatch(/builtin cd "\$HUNT_TMP\/work-\$role"/);
  });
});
