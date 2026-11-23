import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readInstances } from "@dxb-foundation/bench";
import { chainCommand } from "../../chain/fixtures/command.ts";
import { COMMAND_MS } from "../fixtures/the-rows.ts";

// Piece 6b's SPEC §10.1 row 6, its second half (SOL.md B3): a `before` file is refused as malformed when a
// `sequence-position`'s value is not an integer in its one spelling (`000110`, `-0`), or when a part of a name that
// stands unquoted is not `[a-z_][a-z0-9_]*` — what `regclass` leaves unquoted. A quoted part may hold what an unquoted
// one may not. With no instance standing, as A.2's refusals: a refusal is the file's, and a file the command accepts
// can only be answered by its reach for a connection, which fails.

const TAB = "\t";

export function beforeSpelledCases(scratch: () => string): void {
  const kept = (name: string, content: string) => {
    const path = join(scratch(), name);
    writeFileSync(path, content);
    return chainCommand(["rows", "--kept", path], COMMAND_MS);
  };

  describe("§10.1 row 6 — rows --kept refuses a spelling the server never prints", { timeout: COMMAND_MS }, () => {
    it("no instance stands while these cases run", () => {
      expect(readInstances()).toEqual([]);
    });

    const malformed: [string, string][] = [
      ["a last_value with leading zeros: 000110", "rows-format 1\nsequence-position os.s 000110 called t ascending t\n"],
      ["a last_value of minus zero: -0", "rows-format 1\nsequence-position os.s -0 called t ascending t\n"],
      ["a last_value of minus zero with leading zeros: -0010", "rows-format 1\nsequence-position os.s -0010 called t ascending f\n"],
      ["a row whose unquoted name part holds a tab", `rows-format 1\nrow os.a${TAB}bad {}\n`],
      ["a row whose unquoted table part holds an upper-case letter", "rows-format 1\nrow os.Abc {}\n"],
      ["a row whose unquoted schema part holds an upper-case letter", "rows-format 1\nrow Os.abc {}\n"],
      ["a row whose unquoted name part holds a $", "rows-format 1\nrow os.a$b {}\n"],
      ["a row whose unquoted name part begins with a digit", "rows-format 1\nrow os.1a {}\n"],
      ["a sequence whose unquoted name part holds an upper-case letter", "rows-format 1\nsequence-position os.Seq 1 called t ascending t\n"],
    ];
    it.each(malformed)("%s → ROWS_REFUSED before-malformed, exit 2", async (what, content) => {
      const said = await kept(`spelled-${what.replaceAll(/[^a-z0-9]+/gi, "-")}.rows.txt`, content);
      expect(said.lines, said.stderr.slice(-1_500)).toEqual(["ROWS_REFUSED before-malformed"]);
      expect(said.code).toBe(2);
    });

    // What must still be accepted beside the refusals above: the rule is the server's own spelling, no narrower.
    const accepted: [string, string][] = [
      ["a quoted name part holding a tab", `rows-format 1\nrow os."a${TAB}b" {}\n`],
      ["a quoted name part holding upper-case letters", 'rows-format 1\nrow os."Abc" {}\n'],
      ["a quoted name part holding a $", 'rows-format 1\nrow os."a$b" {}\n'],
      ["a quoted name part holding a space and a doubled quote", 'rows-format 1\nrow os."Odd ""Table" {}\n'],
      ["an unquoted name with an underscore and digits: _a1.b_2", "rows-format 1\nrow _a1.b_2 {}\n"],
      ["a last_value of 0, and a negative one", "rows-format 1\nsequence-position os.d -10 called t ascending f\nsequence-position os.s 0 called f ascending t\n"],
    ];
    it.each(accepted)("%s → no refusal of the file: the refused connection", async (what, content) => {
      const said = await kept(`accepted-${what.replaceAll(/[^a-z0-9]+/gi, "-")}.rows.txt`, content);
      for (const refusal of ["ROWS_REFUSED before-malformed", "ROWS_REFUSED no-before"]) expect(said.lines).not.toContain(refusal);
      expect(said.stderr).toMatch(/ECONNREFUSED/);
    });
  });
}
