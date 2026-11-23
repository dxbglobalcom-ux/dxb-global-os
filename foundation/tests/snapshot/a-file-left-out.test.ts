import { readFileSync } from "node:fs";
import { afterAll, describe, expect } from "vitest";
import { connectionString, readInstances } from "@dxb-foundation/bench";
import { snapshotOf } from "@dxb-foundation/chain";
import { removeTheChainRoots } from "../chain/fixtures/chain-on-disk.ts";
import { chainCommand } from "../chain/fixtures/command.ts";
import { orderedSteps } from "../bench/fixtures/ordered-steps.ts";
import { command, tail } from "../bench/fixtures/real-bench.ts";
import { DESTROY_MS, MAKE_MS } from "../roles/fixtures/the-run.ts";
import { expectChainSaid, fixtureEqual } from "./fixtures/changes.ts";
import { EXPECTED_FIXTURE, LAST_SCHEMA_FILE, LEFT_OUT_FUNCTION, LEFT_OUT_REFERENCE, fixtureRoot } from "./fixtures/the-chains.ts";
import { COMMAND_MS, expectRedBy } from "./fixtures/the-check.ts";

// Piece 6a's SPEC §6 C: a second fresh instance, in order — a file left out of a copy of the fixture chain, from
// nothing, step by step, and at the end the whole fixture chain: the same text a second instance reached by another
// road. Each difference is written down whole from SPEC §4.3.

const step = orderedSteps();

const PARTS_TOUCH_AS_ITS_FILE_MAKES_IT = [
  "function-body os.parts_touch() 00001|",
  "function-body os.parts_touch() 00002|begin",
  "function-body os.parts_touch() 00003|  new.qty := coalesce(new.qty, 1);",
  "function-body os.parts_touch() 00004|  return new;",
  "function-body os.parts_touch() 00005|end;",
  "function-body os.parts_touch() 00006|",
];

const OWNED_GRANTS = ["DELETE", "INSERT", "MAINTAIN", "REFERENCES", "SELECT", "TRIGGER", "TRUNCATE", "UPDATE"].map(
  (privilege) => `grant relation snap_elsewhere.owned to os_owner ${privilege} option f by os_owner default`,
);

describe("piece 6a — a file left out, on a second fresh instance, in order", () => {
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

  step("C.1 from nothing, the fixture chain without its last schema file → CHAIN_GREEN; the check is red by exactly that file's lines", 3 * COMMAND_MS, async () => {
    const root = fixtureRoot({ schema: [LAST_SCHEMA_FILE] });
    expectChainSaid(await chainCommand(["up", "--root", root], COMMAND_MS), "CHAIN_GREEN applied=3 standing=3 functions=3 reference=1", 0);
    await expectRedBy(EXPECTED_FIXTURE, {
      expectedOnly: [
        "grant relation public.snap_probe to os_reader SELECT option f by postgres stored",
        ...OWNED_GRANTS,
        "grant schema snap_elsewhere to os_owner CREATE option f by postgres stored",
        "grant schema snap_elsewhere to os_owner USAGE option f by postgres stored",
        "ledger 4 0004-outside.sql schema 0662df2a2f858496760b78a70113ad9443820745cf0e11b641ba587b91cd9ebe runner 1",
        "outside granted os_owner schema snap_elsewhere",
        "outside granted os_reader table public.snap_probe",
        "outside in-policy os_reader policy snap_probe_reader on public.snap_probe",
        "outside owns os_owner table snap_elsewhere.owned",
        "policy public.snap_probe snap_probe_reader cmd r permissive to os_reader",
        "policy-using public.snap_probe snap_probe_reader true",
      ],
    });
  });

  step("C.2 every schema file and one function file left out: the last schema file makes that function's first form, the manifest is red, and the check is red by that function's body", 3 * COMMAND_MS, async () => {
    const said = await chainCommand(["up", "--root", fixtureRoot({ functions: [LEFT_OUT_FUNCTION] })], COMMAND_MS);
    expect(said.lines, said.stderr.slice(-1_500)).toEqual(["OFFENCE orphan parts_touch()", "CHAIN_RED manifest offences=1 applied=1"]);
    expect(said.code).toBe(1);
    await expectRedBy(EXPECTED_FIXTURE, {
      expectedOnly: PARTS_TOUCH_AS_ITS_FILE_MAKES_IT,
      actualOnly: ["function-body os.parts_touch() 00001| begin return new; end "],
    });
  });

  step("C.3 one reference file left out: the pass answers reference=0 and writes nothing — the rows C.1 wrote stand, so the check reads them, equal", 3 * COMMAND_MS, async () => {
    expectChainSaid(
      await chainCommand(["up", "--root", fixtureRoot({ reference: [LEFT_OUT_REFERENCE] })], COMMAND_MS),
      "CHAIN_GREEN applied=0 standing=4 functions=3 reference=0",
      0,
    );
    await fixtureEqual();
  });

  step("C.4 the whole fixture chain → CHAIN_GREEN, SNAPSHOT_EQUAL: the committed text's bytes, which B reached on another instance by another road", 3 * COMMAND_MS, async () => {
    expectChainSaid(await chainCommand(["up", "--root", fixtureRoot()], COMMAND_MS), "CHAIN_GREEN applied=0 standing=4 functions=3 reference=1", 0);
    await fixtureEqual();
    expect(await snapshotOf({ connectionString: connectionString() })).toBe(readFileSync(EXPECTED_FIXTURE, "utf8"));
  });

  step("down → INSTANCE_DOWN", DESTROY_MS, async () => {
    const down = await command("down", DESTROY_MS - 5_000);
    expect(down.lastLine, tail(down.output)).toBe("INSTANCE_DOWN");
    expect(down.code).toBe(0);
  });
});
