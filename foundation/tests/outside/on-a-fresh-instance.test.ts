import { afterAll, describe, expect } from "vitest";
import { readInstances } from "@dxb-foundation/bench";
import { removeTheChainRoots } from "../chain/fixtures/chain-on-disk.ts";
import { orderedSteps } from "../bench/fixtures/ordered-steps.ts";
import { command, tail } from "../bench/fixtures/real-bench.ts";
import { DESTROY_MS, MAKE_MS } from "../roles/fixtures/the-run.ts";
import { afterTheAudit } from "./cases/after-the-audit.ts";
import { pinnedLimits } from "./cases/pinned-limits.ts";
import { redThenGreen } from "./cases/red-then-green.ts";
import { type TheRun, theBuild } from "./cases/the-build.ts";
import { removeWhatWasKeptAside } from "./fixtures/the-outside.ts";

// Piece 6c's SPEC §6 B: one module, in order, on an instance made for it — it begins with `fresh` and ends with
// `down`. The fresh instance's inventory is kept aside first; every check after it is of what the builds and the
// acts changed outside os since. Each step stands on what the steps before it left; once one has failed, the later
// ones fail at once and do nothing. Every act of B.6 and B.7 is undone in its own step, and the checks are equal
// again before the next.

const step = orderedSteps();
const run: TheRun = { fresh: "", built: "", nothing: "" };

describe("piece 6c — what a build changes outside os, on a fresh instance, in order", () => {
  afterAll(async () => {
    // Whatever happened above, the module leaves no instance standing and nothing it kept aside.
    removeTheChainRoots();
    removeWhatWasKeptAside();
    await command("down", DESTROY_MS).catch(() => undefined);
  }, DESTROY_MS + 10_000);

  step("fresh makes an instance: INSTANCE_UP, listed", MAKE_MS + DESTROY_MS, async () => {
    const fresh = await command("fresh", MAKE_MS + DESTROY_MS - 5_000);
    expect(fresh.lastLine, tail(fresh.output)).toMatch(/^INSTANCE_UP sysid=\d+ /);
    expect(fresh.code).toBe(0);
    expect(readInstances()).toHaveLength(1);
  });

  theBuild(step, run);
  redThenGreen(step, run);
  pinnedLimits(step, run);
  // The audit's corrections last (SPEC §10.1): every standing step has run before the first of them.
  afterTheAudit(step, run);

  step("down → INSTANCE_DOWN", DESTROY_MS, async () => {
    const down = await command("down", DESTROY_MS - 5_000);
    expect(down.lastLine, tail(down.output)).toBe("INSTANCE_DOWN");
    expect(down.code).toBe(0);
  });
});
