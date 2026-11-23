import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";
import { afterAll, describe, expect } from "vitest";
import { connectionString, readInstances } from "@dxb-foundation/bench";
import { rowsOf } from "@dxb-foundation/chain";
import { removeTheChainRoots } from "../chain/fixtures/chain-on-disk.ts";
import { chainCommand } from "../chain/fixtures/command.ts";
import { orderedSteps } from "../bench/fixtures/ordered-steps.ts";
import { command, tail } from "../bench/fixtures/real-bench.ts";
import { DESTROY_MS, MAKE_MS } from "../roles/fixtures/the-run.ts";
import { expectChainSaid, fixtureEqual, linesOf } from "../snapshot/fixtures/changes.ts";
import { expectEqual, expectRedBy } from "../snapshot/fixtures/the-check.ts";
import { afterC5 } from "./cases/after-c5.ts";
import { aTemporaryDirectory, removeTheRepositories } from "./fixtures/a-repository.ts";
import { giveTheRows } from "./fixtures/the-rows-given.ts";
import { COMMAND_MS, HOSTILE, HOSTILE_AS_SAID, expectKept, expectRowsPrinted, keptSaid, rowsPrinted, shown, textOf, withTheSessionSaying } from "./fixtures/the-rows.ts";
import {
  C_INDEX_LINE, C_LEDGER_LINE, EXPECTED_A_ROWS, EXPECTED_B, EXPECTED_B_ROWS,
  rootA, rootB, rootC, rootEdited, rootRefusedWhenPopulated,
} from "./fixtures/the-roots.ts";

// Piece 6b's SPEC §6 C: a second fresh instance, in order — built at revision A, given rows, met by an applied file
// edited and by a change a populated table refuses, upgraded to B: the text a clean build reached and every row kept;
// then C, which loses rows and makes a structure only because rows stand. Every difference is written down whole.

const step = orderedSteps();

/** What the rows read before the upgrade, kept aside as SPEC §7's proof keeps them: written outside the repository. */
let keptAside = "";

/**
 * os.ticket_seq as the rows given left it — the line of a.rows.txt and of b.rows.txt — and as C.3's refused file leaves
 * it (SPEC §10.1 row 9): drawn once more, 100, 105, 110, then 115 — a draw no rollback undoes. Written by hand.
 */
const TICKET_AS_GIVEN = "sequence-position os.ticket_seq 110 called t ascending t";
const TICKET_DRAWN_BY_C3 = "sequence-position os.ticket_seq 115 called t ascending t";

/** A committed rows' text, but for its one ticket line, which reads as C.3 left it. The line given must stand there once. */
function withTheTicketDrawn(file: string): string {
  const committed = textOf(file);
  expect(committed.split("\n").filter((line) => line === TICKET_AS_GIVEN)).toHaveLength(1);
  return committed.replace(`${TICKET_AS_GIVEN}\n`, `${TICKET_DRAWN_BY_C3}\n`);
}

/**
 * C.5's difference, written by hand from SPEC §5: P-2's grade changed and P-3 deleted, os.ticket_seq put back to its
 * start. Against b.rows.txt, the committed text: its `-` line is the file's (110), not where C.3 left the instance (115).
 */
const C_LOST_AND_BACK = [
  '- row os.parts {"id": 20, "qty": 2, "code": "P-2", "kind": "nut", "size": 20, "grade": 3, "amount": 12.5000, "ratio4": 0.5, "ratio8": 0.30000000000000004}',
  '+ row os.parts {"id": 20, "qty": 2, "code": "P-2", "kind": "nut", "size": 20, "grade": 4, "amount": 12.5000, "ratio4": 0.5, "ratio8": 0.30000000000000004}',
  '- row os.parts {"id": 30, "qty": 3, "code": "P-3", "kind": null, "size": 30, "grade": 3, "amount": null, "ratio4": null, "ratio8": null}',
  "+ sequence-position os.ticket_seq 100 called f ascending t",
  "- sequence-position os.ticket_seq 110 called t ascending t",
  "ROWS_RED lost=2 back=1",
];

/** One value read by a session opened on `address` with no care taken: the hostile settings seen to bite. */
async function aPlainSessionReads(address: string, sql: string): Promise<unknown> {
  const client = new Client({ connectionString: address, connectionTimeoutMillis: 10_000 });
  client.on("error", () => undefined);
  await client.connect();
  try {
    return (await client.query({ text: sql, rowMode: "array" })).rows[0]?.[0];
  } finally {
    await client.end();
  }
}

describe("piece 6b — built at A, given rows, upgraded: on a second fresh instance, in order", () => {
  afterAll(async () => {
    removeTheChainRoots();
    removeTheRepositories();
    await command("down", DESTROY_MS).catch(() => undefined);
  }, DESTROY_MS + 10_000);

  step("fresh makes an instance: INSTANCE_UP, listed", MAKE_MS + DESTROY_MS, async () => {
    const fresh = await command("fresh", MAKE_MS + DESTROY_MS - 5_000);
    expect(fresh.lastLine, tail(fresh.output)).toMatch(/^INSTANCE_UP sysid=\d+ /);
    expect(fresh.code).toBe(0);
    expect(readInstances()).toHaveLength(1);
  });

  step("C.1 chain up --root <A> → CHAIN_GREEN; equal to 6a's fixture text; the rows given — the text still equal; rows is expected/a.rows.txt, byte for byte", 4 * COMMAND_MS, async () => {
    expectChainSaid(await chainCommand(["up", "--root", rootA()], COMMAND_MS), "CHAIN_GREEN applied=4 standing=4 functions=3 reference=1", 0);
    await fixtureEqual();
    await giveTheRows();
    await fixtureEqual();
    const printed = await rowsPrinted();
    expect(printed.stdout, printed.stderr.slice(-1_500)).toBe(textOf(EXPECTED_A_ROWS));
    expect(printed.code).toBe(0);
    keptAside = join(aTemporaryDirectory("dxb-foundation-upgrade-before-"), "before.rows.txt");
    writeFileSync(keptAside, printed.stdout);
  });

  step("C.1 read twice by the library, and once through a connection whose own settings are hostile: the same bytes", 2 * COMMAND_MS, async () => {
    const target = { connectionString: connectionString() };
    expect(await rowsOf(target)).toBe(textOf(EXPECTED_A_ROWS));
    expect(await rowsOf(target)).toBe(textOf(EXPECTED_A_ROWS));
    const hostile = withTheSessionSaying(HOSTILE);
    for (const [name, value] of Object.entries(HOSTILE_AS_SAID)) {
      expect(await aPlainSessionReads(hostile, `select pg_catalog.current_setting('${name}')`), name).toBe(value);
    }
    // The instrument bites: a session that says nothing of its own reads P-2's float otherwise than the text does.
    expect(await aPlainSessionReads(hostile, "select ratio8::text from os.parts where id = 20")).toBe("0.3");
    expect(await rowsOf({ connectionString: hostile })).toBe(textOf(EXPECTED_A_ROWS));
  });

  step("C.2 an applied file edited: chain up --root <edited> → CHAIN_RED, 0003-inside.sql changed; the snapshot still A's; rows is a.rows.txt, byte for byte; rows --kept a.rows.txt → ROWS_KEPT", 4 * COMMAND_MS, async () => {
    const said = await chainCommand(["up", "--root", rootEdited()], COMMAND_MS);
    expect(said.lines, said.stderr.slice(-1_500)).toEqual(["OFFENCE changed 0003-inside.sql", "CHAIN_RED offences=1"]);
    expect(said.code).toBe(1);
    await fixtureEqual();
    // SPEC §10.1 row 9: ROWS_KEPT alone would pass a row added or a sequence drawn.
    await expectRowsPrinted(textOf(EXPECTED_A_ROWS));
    await expectKept(EXPECTED_A_ROWS, 5, 2);
  });

  // SPEC §10.1 row 9: the refused file writes a row and draws from os.ticket_seq before the statement the server
  // refuses (fixtures/variants/0005-not-null-no-default.sql). The row is gone; the sequence stays drawn — its one line.
  step("C.3 a change a populated table refuses: chain up --root <refused-when-populated> is red at 0005; the snapshot still A's — no ledger row for it; rows is a.rows.txt but for os.ticket_seq, drawn once: 115 called t — the row the file wrote is gone; the rows kept", 4 * COMMAND_MS, async () => {
    const said = await chainCommand(["up", "--root", rootRefusedWhenPopulated()], COMMAND_MS);
    expect(said.lines, said.stderr.slice(-1_500)).toEqual([
      'FAILED 0005-not-null-no-default.sql column "must" of relation "parts" contains null values',
      "CHAIN_RED file-failed applied=0",
    ]);
    expect(said.code).toBe(1);
    await fixtureEqual();
    await expectRowsPrinted(withTheTicketDrawn(EXPECTED_A_ROWS));
    await expectKept(EXPECTED_A_ROWS, 5, 2);
  });

  // b.rows.txt is the committed text of a clean upgrade and is not changed: C.4 reads it but for the ticket line C.3
  // drew — nothing put back by hand between the refused upgrade and the one under proof.
  step("C.4 upgraded equals clean: chain up --root <B> → CHAIN_GREEN; SNAPSHOT_EQUAL to b.snapshot.txt; rows is b.rows.txt, byte for byte, but for os.ticket_seq as C.3 left it (115 called t); ROWS_KEPT against a.rows.txt and against what C.1 read", 4 * COMMAND_MS, async () => {
    expectChainSaid(await chainCommand(["up", "--root", rootB()], COMMAND_MS), "CHAIN_GREEN applied=1 standing=5 functions=3 reference=1", 0);
    await expectEqual(EXPECTED_B, linesOf(EXPECTED_B));
    await expectRowsPrinted(withTheTicketDrawn(EXPECTED_B_ROWS));
    await expectKept(EXPECTED_A_ROWS, 5, 2);
    await expectKept(keptAside, 5, 2);
  });

  step("C.5 chain up --root <C> → CHAIN_GREEN; the check is red by exactly 0006's ledger line and the index; rows --kept b.rows.txt → ROWS_RED, its difference whole", 3 * COMMAND_MS, async () => {
    expectChainSaid(await chainCommand(["up", "--root", rootC()], COMMAND_MS), "CHAIN_GREEN applied=1 standing=6 functions=3 reference=1", 0);
    await expectRedBy(EXPECTED_B, { actualOnly: [C_INDEX_LINE, C_LEDGER_LINE] });
    const said = await keptSaid(EXPECTED_B_ROWS);
    expect(said.lines, shown(said)).toEqual(C_LOST_AND_BACK);
    expect(said.code).toBe(1);
  });

  // SPEC §10.1 rows 7, 8 and 10: what the superuser makes in os after C.5, and who reads it (cases/after-c5.ts).
  afterC5(step, C_LOST_AND_BACK);

  step("down → INSTANCE_DOWN", DESTROY_MS, async () => {
    const down = await command("down", DESTROY_MS - 5_000);
    expect(down.lastLine, tail(down.output)).toBe("INSTANCE_DOWN");
    expect(down.code).toBe(0);
  });
});
