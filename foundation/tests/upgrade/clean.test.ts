import { afterAll, describe, expect } from "vitest";
import { connectionString, readInstances } from "@dxb-foundation/bench";
import { rowsOf } from "@dxb-foundation/chain";
import { removeTheChainRoots } from "../chain/fixtures/chain-on-disk.ts";
import { chainCommand } from "../chain/fixtures/command.ts";
import { orderedSteps } from "../bench/fixtures/ordered-steps.ts";
import { command, tail } from "../bench/fixtures/real-bench.ts";
import { DESTROY_MS, MAKE_MS } from "../roles/fixtures/the-run.ts";
import { expectChainSaid, linesOf } from "../snapshot/fixtures/changes.ts";
import { expectEqual, expectRedBy } from "../snapshot/fixtures/the-check.ts";
import { COMMAND_MS, expectRowsPrinted } from "./fixtures/the-rows.ts";
import { C_LEDGER_LINE, EXPECTED_B, rootB, rootC } from "./fixtures/the-roots.ts";

// Piece 6b's SPEC §6 B: on a fresh instance of its own, revision B built from nothing — the text the upgraded
// instance of upgraded.test.ts must reach. One module, in order: it begins with `fresh` and ends with `down`.

const step = orderedSteps();

/** What a clean B holds (SPEC §4), written by hand: the seeded row, no row of os.parts, both sequences at their start, never drawn. */
const CLEAN_B_ROWS = [
  "rows-format 1",
  'row os.notes {"note": "seeded by B"}',
  "sequence-position os.parts_id_seq 10 called f ascending t",
  "sequence-position os.ticket_seq 100 called f ascending t",
  "",
].join("\n");

describe("piece 6b — B on a fresh instance: clean", () => {
  afterAll(async () => {
    removeTheChainRoots();
    await command("down", DESTROY_MS).catch(() => undefined);
  }, DESTROY_MS + 10_000);

  step("fresh makes an instance: INSTANCE_UP, listed", MAKE_MS + DESTROY_MS, async () => {
    const fresh = await command("fresh", MAKE_MS + DESTROY_MS - 5_000);
    expect(fresh.lastLine, tail(fresh.output)).toMatch(/^INSTANCE_UP sysid=\d+ /);
    expect(fresh.code).toBe(0);
    expect(readInstances()).toHaveLength(1);
  });

  step("B from nothing: chain up --root <B> → CHAIN_GREEN applied=5 standing=5 functions=3 reference=1; snapshot --check expected/b.snapshot.txt → SNAPSHOT_EQUAL", 3 * COMMAND_MS, async () => {
    expectChainSaid(await chainCommand(["up", "--root", rootB()], COMMAND_MS), "CHAIN_GREEN applied=5 standing=5 functions=3 reference=1", 0);
    await expectEqual(EXPECTED_B, linesOf(EXPECTED_B));
  });

  step("rows holds the seeded row and no row of os.parts: the text written here, printed by the command and answered by the library", 3 * COMMAND_MS, async () => {
    await expectRowsPrinted(CLEAN_B_ROWS);
    expect(await rowsOf({ connectionString: connectionString() })).toBe(CLEAN_B_ROWS);
  });

  // Beyond §6 B, and at no instance's cost: SPEC §9 reads from the files' text that C's index is absent from a clean
  // build. Run here on the clean B, whose os.parts holds no row: 0006 is green, writes its ledger row, and makes
  // nothing else the snapshot or the rows read.
  step("C on the clean instance: chain up --root <C> → CHAIN_GREEN applied=1; the check is red by 0006's ledger line alone — no index; rows as before", 3 * COMMAND_MS, async () => {
    expectChainSaid(await chainCommand(["up", "--root", rootC()], COMMAND_MS), "CHAIN_GREEN applied=1 standing=6 functions=3 reference=1", 0);
    await expectRedBy(EXPECTED_B, { actualOnly: [C_LEDGER_LINE] });
    await expectRowsPrinted(CLEAN_B_ROWS);
  });

  step("down → INSTANCE_DOWN", DESTROY_MS, async () => {
    const down = await command("down", DESTROY_MS - 5_000);
    expect(down.lastLine, tail(down.output)).toBe("INSTANCE_DOWN");
    expect(down.code).toBe(0);
  });
});
