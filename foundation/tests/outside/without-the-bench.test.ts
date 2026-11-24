import { chmodSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll } from "vitest";
import { removeTheChainRoots } from "../chain/fixtures/chain-on-disk.ts";
import { outsideOfCases } from "./cases/outside-of.ts";
import { refusalCases } from "./cases/refusals.ts";
import { theTextsCases } from "./cases/the-texts.ts";

// Piece 6c's SPEC §6 A: what is true without the bench — the pure outsideOf on inventories written by hand, the
// commands' refusals before any connection and their usage lines, and the three expected texts held to their form.
// Every file a case writes lies in a temporary directory outside the repository.

const scratch = mkdtempSync(join(tmpdir(), "dxb-foundation-outside-a-"));
afterAll(() => {
  try {
    chmodSync(join(scratch, "unreadable.inventory.txt"), 0o600);
  } catch {
    // Not made: the case that makes it did not run.
  }
  rmSync(scratch, { recursive: true, force: true });
  removeTheChainRoots();
});

outsideOfCases();
refusalCases(() => scratch);
theTextsCases();
