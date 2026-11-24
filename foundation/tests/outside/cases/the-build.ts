import { expect } from "vitest";
import { connectionString } from "@dxb-foundation/bench";
import { inventoryOf } from "@dxb-foundation/chain";
import { chainCommand } from "../../chain/fixtures/command.ts";
import { columnOf } from "../../chain/fixtures/looking.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { expectChainSaid } from "../../snapshot/fixtures/changes.ts";
import { byBytes, sortedByBytes } from "../../snapshot/fixtures/the-check.ts";
import { giveTheRows } from "../../upgrade/fixtures/the-rows-given.ts";
import { fixtureRoot, rootB } from "../../upgrade/fixtures/the-roots.ts";
import { LEFT_OUT, inventoryOffencesOf } from "../fixtures/the-outside-form.ts";
import {
  COMMAND_MS, EXPECTED_FIXTURE, EXPECTED_FURTHER, EXPECTED_REAL,
  expectOutsideEqual, inventoryPrinted, keptAside, printedBy, rootFurther, textOf,
} from "../fixtures/the-outside.ts";

// Piece 6c's SPEC §6 B.1–B.5: the inventory obeys its form and reads every catalogue; the fresh instance's inventory
// is kept aside; the real chain changes nothing outside; the fixture chain changes what its text says and nothing
// else; an upgrade that changes only os adds no line; 0006 changes what further.outside.txt says.

/** What the steps hand on: the inventories kept aside, each a file outside the repository. */
export type TheRun = { fresh: string; built: string; nothing: string };

/** The lines of a text after its first. */
const bodyOf = (text: string): string[] => text.split("\n").slice(1, -1);

/** The catalogues of the server, asked by the test itself: every relation of kind r in pg_catalog. */
const CATALOGUES = "select c.relname::text from pg_catalog.pg_class c where c.relnamespace = 'pg_catalog'::pg_catalog.regnamespace and c.relkind = 'r'";

/** What 0003 makes in os, by the identity pg_identify_object gives it — each read, marked in, and no line of the outside text. */
const MADE_IN_OS_BY_0003 = [
  "pg_class table os.kinds",
  "pg_class table os.parts",
  "pg_class view os.parts_view",
  "pg_class sequence os.ticket_seq",
  "pg_class sequence os.parts_id_seq",
  "pg_class index os.parts_kind_idx",
  "pg_type type os.mood",
  "pg_type type os.code",
  "pg_collation collation os.bytes",
  "pg_trigger trigger parts_touch on os.parts",
  "pg_policy policy parts_read on os.parts",
  "pg_policy policy parts_write on os.parts",
  "pg_proc function os.parts_touch()",
  "pg_description table os.parts",
  "pg_default_acl default acl for role os_owner in schema os on tables",
];

const escaped = (text: string): string => text.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The one line of the fixture's outside text that names os: its trigger outside calls os.parts_touch() (0004). */
const THE_ONE_LINE_NAMING_OS = "added row pg_depend trigger owned_touch on snap_elsewhere.owned -> function os.parts_touch() n";

export function theBuild(step: Step, run: TheRun): void {
  step("B.1 an inventory obeys its form; its read and left-out lines name every relation of kind r in pg_catalog; nothing is in before the chain; read twice, and by the library, the same bytes — kept aside", 4 * COMMAND_MS, async () => {
    const first = await inventoryPrinted();
    expect(inventoryOffencesOf(first)).toEqual([]);
    const lines = bodyOf(first);
    const catalogues = await onTheInstance((client) => columnOf(client, CATALOGUES));
    expect(catalogues.length).toBeGreaterThan(60);
    const read = lines.filter((line) => line.startsWith("read ")).map((line) => line.split(" ")[1] ?? "");
    const leftOut = lines.filter((line) => line.startsWith("left-out ")).map((line) => line.split(" ")[1] ?? "");
    expect(leftOut).toEqual([...LEFT_OUT]);
    expect([...read, ...leftOut].sort(byBytes)).toEqual(sortedByBytes(catalogues));
    // Each read line counts the row lines of its catalogue.
    for (const line of lines.filter((one) => one.startsWith("read "))) {
      const [, catalogue, count] = line.split(" ");
      expect(lines.filter((one) => one.startsWith(`row in ${catalogue} `) || one.startsWith(`row out ${catalogue} `)).length, line).toBe(Number(count));
    }
    // Nothing is covered before the chain: not one line is marked in.
    expect(lines.filter((line) => line.split(" ")[1] === "in")).toEqual([]);
    const second = await inventoryPrinted();
    expect(second === first, "read twice with nothing between: the same bytes").toBe(true);
    const library = await inventoryOf({ connectionString: connectionString() });
    expect(library === first, "the library's text is the command's").toBe(true);
    run.fresh = keptAside("fresh.inventory.txt", first);
    run.nothing = keptAside("nothing.outside.txt", "outside-format 1\n");
  });

  step("B.2 chain up (the real chain) → CHAIN_GREEN; outside --before <fresh> prints the first line alone; --check expected/real.outside.txt → OUTSIDE_EQUAL lines=1; what the chain made is read, marked in", 4 * COMMAND_MS, async () => {
    expectChainSaid(await chainCommand(["up"], COMMAND_MS), "CHAIN_GREEN applied=2 standing=2 functions=0 reference=0", 0);
    const printed = await printedBy(["outside", "--before", run.fresh]);
    expect(printed.stdout, printed.stderr.slice(-1_500)).toBe("outside-format 1\n");
    expect(printed.code).toBe(0);
    await expectOutsideEqual(run.fresh, EXPECTED_REAL);
    const now = await inventoryPrinted();
    expect(now).toMatch(/^row in pg_namespace [0-9a-f]{64} schema os$/m);
    expect(now).toMatch(/^row in pg_namespace [0-9a-f]{64} schema os_chain$/m);
    expect(now).toMatch(/^row in pg_authid [0-9a-f]{64} role os_owner$/m);
    expect(now).toMatch(/^owner in pg_namespace schema os is os_owner$/m);
    expect(now).toMatch(/^row in pg_class [0-9a-f]{64} table os_chain\.ledger$/m);
    expect(now).not.toMatch(/^held out \S+ [0-9a-f]{64} os_chain\.ledger$/m);
  });

  step("B.3 chain up --root <the fixture chain> → CHAIN_GREEN; --check expected/fixture.outside.txt → OUTSIDE_EQUAL; what 0003 makes in os is read, marked in, and no line of the text", 4 * COMMAND_MS, async () => {
    expectChainSaid(await chainCommand(["up", "--root", fixtureRoot()], COMMAND_MS), "CHAIN_GREEN applied=2 standing=4 functions=3 reference=1", 0);
    await expectOutsideEqual(run.fresh, EXPECTED_FIXTURE);
    const now = await inventoryPrinted();
    for (const made of MADE_IN_OS_BY_0003) {
      const [catalogue, ...identity] = made.split(" ");
      expect(now, made).toMatch(new RegExp(`^row in ${catalogue} [0-9a-f]{64} ${escaped(identity.join(" "))}$`, "m"));
    }
    const printed = await printedBy(["outside", "--before", run.fresh]);
    expect(printed.stdout === textOf(EXPECTED_FIXTURE), "the printed text is the committed one").toBe(true);
    expect(bodyOf(printed.stdout).filter((line) => /(^| )os(_chain)?\./.test(line))).toEqual([THE_ONE_LINE_NAMING_OS]);
  });

  step("B.4 the rows of 6b given; chain up --root <B> → CHAIN_GREEN; --check expected/fixture.outside.txt still OUTSIDE_EQUAL: an upgrade that changes only os adds no line", 4 * COMMAND_MS, async () => {
    await giveTheRows();
    await expectOutsideEqual(run.fresh, EXPECTED_FIXTURE);
    expectChainSaid(await chainCommand(["up", "--root", rootB()], COMMAND_MS), "CHAIN_GREEN applied=1 standing=5 functions=3 reference=1", 0);
    await expectOutsideEqual(run.fresh, EXPECTED_FIXTURE);
  });

  step("B.5 chain up --root <B with 0006> → CHAIN_GREEN; --check expected/further.outside.txt → OUTSIDE_EQUAL; the built inventory kept aside, and against it nothing", 4 * COMMAND_MS, async () => {
    expectChainSaid(await chainCommand(["up", "--root", rootFurther()], COMMAND_MS), "CHAIN_GREEN applied=1 standing=6 functions=3 reference=1", 0);
    await expectOutsideEqual(run.fresh, EXPECTED_FURTHER);
    run.built = keptAside("built.inventory.txt", await inventoryPrinted());
    await expectOutsideEqual(run.built, run.nothing);
  });
}
