import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { defaultLockPath, defaultStatePath } from "@dxb-foundation/bench";

// SPEC §5b.1: one list path and one lock path, in one state directory under the
// home the password database gives — moved by no variable.

const sayDefaultPaths = fileURLToPath(new URL("./fixtures/say-default-paths.ts", import.meta.url));

const elsewhere = mkdtempSync(join(tmpdir(), "dxb-foundation-elsewhere-"));
afterAll(() => rmSync(elsewhere, { recursive: true, force: true }));

/** This user's home as the password database gives it — asked of `getent`, not of Node and not of a variable. */
function homeInThePasswordDatabase(): string {
  const asked = spawnSync("getent", ["passwd", String(userInfo().uid)], { encoding: "utf8" });
  const home = asked.stdout.trim().split(":")[5] ?? "";
  expect(home, asked.stderr).toMatch(/^\/./);
  return home;
}

const stateDirectory = (): string => `${homeInThePasswordDatabase()}/.local/state/dxb/foundation-bench`;

/** The two paths as another process answers them, started with PATH and the given variables and nothing else. */
function pathsSaidWith(variables: Record<string, string>): unknown {
  const child = spawnSync(process.execPath, [sayDefaultPaths], {
    env: { PATH: process.env.PATH, ...variables },
    encoding: "utf8",
    timeout: 20_000,
  });
  const said = child.stdout.split("\n").find((line) => line.startsWith("PATHS "));
  expect(said, child.stderr).toBeDefined();
  return JSON.parse((said as string).slice("PATHS ".length));
}

describe("the state directory — <home>/.local/state/dxb/foundation-bench, the home read from the password database", () => {
  it("defaultStatePath() is instances.json in it", () => {
    expect(defaultStatePath()).toBe(`${stateDirectory()}/instances.json`);
  });

  it("defaultLockPath() is host.lock in it, beside the list", () => {
    expect(defaultLockPath()).toBe(`${stateDirectory()}/host.lock`);
  });

  it.each([
    ["HOME", { HOME: elsewhere }],
    ["XDG_STATE_HOME", { XDG_STATE_HOME: elsewhere }],
    ["XDG_RUNTIME_DIR", { XDG_RUNTIME_DIR: elsewhere }],
    ["all three at once", { HOME: elsewhere, XDG_STATE_HOME: elsewhere, XDG_RUNTIME_DIR: elsewhere }],
  ])("a process started with %s pointing at another directory answers the same two paths", (_what, variables) => {
    expect(pathsSaidWith(variables)).toEqual({
      list: `${stateDirectory()}/instances.json`,
      lock: `${stateDirectory()}/host.lock`,
    });
  });
});
