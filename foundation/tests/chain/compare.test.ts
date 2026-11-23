import { describe, expect, it } from "vitest";
import { compare, type ChainFile, type LedgerRow } from "@dxb-foundation/chain";

// SPEC §4's second table — the disk against the ledger, in both directions. Pure:
// every file and every ledger row below is invented, and every offence's kind and
// detail is spelled here. A hash is one letter sixty-four times: `compare` reads
// hashes, it computes none.

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);
const HASH_C = "c".repeat(64);
const HASH_D = "d".repeat(64);
const HASH_E = "e".repeat(64);
const HASH_F = "f".repeat(64);

const onDisk = (number: number, name: string, hash: string): ChainFile => ({ name, number, hash, text: `-- ${name}\n` });
const ledgered = (position: number, file: string, hash: string): LedgerRow => ({ position, file, hash });

const A = onDisk(1, "0001-a.sql", HASH_A);
const B = onDisk(2, "0002-b.sql", HASH_B);
const C = onDisk(3, "0003-c.sql", HASH_C);

/** The ledger of a database where A, B and C were applied, in that order. */
const LEDGER_OF_THREE = [ledgered(1, "0001-a.sql", HASH_A), ledgered(2, "0002-b.sql", HASH_B), ledgered(3, "0003-c.sql", HASH_C)];

// A file after the last: pending when there is no offence — and so the proof, in an offence's case, that nothing is.
const NEXT = onDisk(4, "0004-next.sql", HASH_D);

describe("compare — a disk and a ledger that agree", () => {
  it("the same files as the ledger holds: no offence, nothing pending", () => {
    expect(compare([A, B, C], LEDGER_OF_THREE)).toEqual({ offences: [], pending: [] });
  });

  it("no file and no row: no offence, nothing pending", () => {
    expect(compare([], [])).toEqual({ offences: [], pending: [] });
  });

  it("an empty ledger: every file is pending, by number", () => {
    expect(compare([A, B, C], [])).toEqual({ offences: [], pending: [A, B, C] });
  });

  it("new files after the last ledgered one are pending, in order — and only they", () => {
    const later = onDisk(7, "0007-later.sql", HASH_E);
    expect(compare([A, B, C, NEXT, later], LEDGER_OF_THREE)).toEqual({ offences: [], pending: [NEXT, later] });
  });
});

describe("compare — each offence of the disk against the ledger", () => {
  it("changed: a ledgered name is on the disk with another hash", () => {
    const rewritten = onDisk(2, "0002-b.sql", HASH_F);
    expect(compare([A, rewritten, C, NEXT], LEDGER_OF_THREE)).toEqual({
      offences: [{ kind: "changed", detail: "0002-b.sql" }],
      pending: [],
    });
  });

  it("missing: a ledgered name is not on the disk, and no file carries its hash", () => {
    expect(compare([A, C, NEXT], LEDGER_OF_THREE)).toEqual({
      offences: [{ kind: "missing", detail: "0002-b.sql" }],
      pending: [],
    });
  });

  it("renamed: the ledgered name is gone and one new file carries its hash — one offence, not also missing, nor before-applied", () => {
    const underANewName = onDisk(2, "0002-b-renamed.sql", HASH_B);
    expect(compare([A, underANewName, C, NEXT], LEDGER_OF_THREE)).toEqual({
      offences: [{ kind: "renamed", detail: "0002-b.sql 0002-b-renamed.sql" }],
      pending: [],
    });
  });

  it("a rename whose hash two new files carry is missing — which of them it became cannot be said", () => {
    // Both lie after the last ledgered number, so neither is before-applied; that they are twins is the disk's own offence.
    const one = onDisk(4, "0004-b-here.sql", HASH_B);
    const other = onDisk(5, "0005-b-there.sql", HASH_B);
    expect(compare([A, C, one, other], LEDGER_OF_THREE)).toEqual({
      offences: [{ kind: "missing", detail: "0002-b.sql" }],
      pending: [],
    });
  });

  it("before-applied: a new file with a number lower than the greatest ledgered one", () => {
    const ledger = [ledgered(1, "0001-a.sql", HASH_A), ledgered(2, "0003-c.sql", HASH_C)];
    expect(compare([A, B, C, NEXT], ledger)).toEqual({
      offences: [{ kind: "before-applied", detail: "0002-b.sql" }],
      pending: [],
    });
  });

  it("before-applied: a new file with a number equal to the greatest ledgered one", () => {
    const twin = onDisk(3, "0003-c-twin.sql", HASH_E);
    expect(compare([A, B, C, twin, NEXT], LEDGER_OF_THREE)).toEqual({
      offences: [{ kind: "before-applied", detail: "0003-c-twin.sql" }],
      pending: [],
    });
  });

  it("reordered: a row whose number is lower than the number of the row before it — said of that row", () => {
    const ledger = [ledgered(1, "0001-a.sql", HASH_A), ledgered(2, "0003-c.sql", HASH_C), ledgered(3, "0002-b.sql", HASH_B)];
    expect(compare([A, B, C, NEXT], ledger)).toEqual({
      offences: [{ kind: "reordered", detail: "0002-b.sql" }],
      pending: [],
    });
  });

  it("reordered: a row whose number is equal to the number of the row before it", () => {
    const twin = onDisk(2, "0002-b-twin.sql", HASH_E);
    const ledger = [ledgered(1, "0001-a.sql", HASH_A), ledgered(2, "0002-b.sql", HASH_B), ledgered(3, "0002-b-twin.sql", HASH_E)];
    expect(compare([A, B, twin, NEXT], ledger)).toEqual({
      offences: [{ kind: "reordered", detail: "0002-b-twin.sql" }],
      pending: [],
    });
  });
});

describe("compare — several faults at once", () => {
  it("says every one, by kind as SPEC §4 lists them, and nothing is pending", () => {
    const ledger = [
      ledgered(1, "0001-a.sql", HASH_A),
      ledgered(2, "0002-b.sql", HASH_B),
      ledgered(3, "0003-c.sql", HASH_C),
      ledgered(4, "0006-f.sql", HASH_F),
    ];
    const disk = [
      onDisk(1, "0001-a.sql", HASH_D), // changed
      // 0002-b.sql is gone, and nothing carries its hash: missing
      onDisk(3, "0003-c-renamed.sql", HASH_C), // renamed
      onDisk(5, "0005-late.sql", HASH_E), // new, and not after the last ledgered number: before-applied
      onDisk(6, "0006-f.sql", HASH_F),
      onDisk(7, "0007-next.sql", "0".repeat(64)), // rightly new — and still not pending
    ];
    expect(compare(disk, ledger)).toEqual({
      offences: [
        { kind: "changed", detail: "0001-a.sql" },
        { kind: "renamed", detail: "0003-c.sql 0003-c-renamed.sql" },
        { kind: "missing", detail: "0002-b.sql" },
        { kind: "before-applied", detail: "0005-late.sql" },
      ],
      pending: [],
    });
  });
});
