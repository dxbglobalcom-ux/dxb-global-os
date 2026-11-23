import { chmodSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll } from "vitest";
import { removeTheChainRoots } from "../chain/fixtures/chain-on-disk.ts";
import { beforeSpelledCases } from "./cases/before-spelled.ts";
import { keptAsItStandsCases } from "./cases/kept-as-it-stands.ts";
import { keptCases } from "./cases/kept.ts";
import { refusalCases } from "./cases/refusals.ts";
import { theTextsCases } from "./cases/the-texts.ts";

// Piece 6b's SPEC §6 A.1–A.3: what is true without the bench — the pure "kept", the rows' command's refusals before
// any connection and its usage lines, and the three expected texts held to their form. Every file a case writes
// lies in a temporary directory outside the repository. A.4 (chainAt) is chain-at.test.ts.

const scratch = mkdtempSync(join(tmpdir(), "dxb-foundation-upgrade-"));
afterAll(() => {
  try {
    chmodSync(join(scratch, "unreadable.rows.txt"), 0o600);
  } catch {
    // Not made: the case that makes it did not run.
  }
  rmSync(scratch, { recursive: true, force: true });
  removeTheChainRoots();
});

keptCases();
refusalCases(() => scratch);
theTextsCases();
// SPEC §10.1 rows 1, 6 and 8: the blind audit's corrections, without the bench.
keptAsItStandsCases();
beforeSpelledCases(() => scratch);
