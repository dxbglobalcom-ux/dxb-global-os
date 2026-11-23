import { describe, expect, it } from "vitest";
import { keptOf } from "@dxb-foundation/chain";

// Piece 6b's SPEC §6 A.1: keptOf on texts written in the case — rows as multisets, a row kept when a row of the
// same table holds every key of it with an equal value, a sequence kept when it stands not behind. Every expected
// answer is written down whole, in §5's order: each list sorted by the line after its sign, `-` before `+` for one line.

/** A rows' text of these lines, in the order given — each case writes them already sorted by bytes. */
const text = (...lines: string[]): string => `rows-format 1\n${lines.map((line) => `${line}\n`).join("")}`;

const kept = (rows: number, sequences: number) => ({ lost: [], back: [], rows, sequences });

export function keptCases(): void {
  describe("A.1 keptOf — rows", () => {
    it("equal texts: nothing lost, nothing back, the counts of before", () => {
      const before = text('row os.a {"id": 1, "x": "one"}', 'row os.a {"id": 2, "x": "two"}', "sequence-position os.s 5 called t ascending t");
      expect(keptOf(before, before)).toEqual(kept(2, 1));
    });

    it("the first line alone against the first line alone: zero rows, zero sequences", () => {
      expect(keptOf(text(), text())).toEqual(kept(0, 0));
    });

    it("a column added costs nothing: every key of before is held, with its value", () => {
      expect(keptOf(text('row os.a {"id": 1}', 'row os.a {"id": 2}'), text('row os.a {"id": 1, "new": null}', 'row os.a {"id": 2, "new": 7}'))).toEqual(kept(2, 0));
    });

    it("a row added, and a table added, cost nothing", () => {
      expect(keptOf(text('row os.a {"id": 1}'), text('row os.a {"id": 1}', 'row os.a {"id": 2}', 'row os.b {"id": 1}'))).toEqual(kept(1, 0));
    });

    it("a value changed: one `-` for the row before, one `+` for what it became; the rows that answered are not named", () => {
      const before = text('row os.a {"id": 1, "x": "one"}', 'row os.a {"id": 2, "x": "two"}');
      const after = text('row os.a {"id": 1, "x": "one"}', 'row os.a {"id": 2, "x": "zwei"}');
      expect(keptOf(before, after)).toEqual({ lost: ['- row os.a {"id": 2, "x": "two"}', '+ row os.a {"id": 2, "x": "zwei"}'], back: [], rows: 2, sequences: 0 });
      // Sorted by the line after its sign: when what it became sorts first, its `+` comes first.
      const upper = text('row os.a {"id": 1, "x": "one"}', 'row os.a {"id": 2, "x": "TWO"}');
      expect(keptOf(before, upper)).toEqual({ lost: ['+ row os.a {"id": 2, "x": "TWO"}', '- row os.a {"id": 2, "x": "two"}'], back: [], rows: 2, sequences: 0 });
    });

    it("a value inside a nested JSON value that gained a key is a changed value: only a row's own keys may be added", () => {
      const before = text('row os.a {"id": 1, "doc": {"k": 1}}');
      const after = text('row os.a {"id": 1, "doc": {"k": 1, "m": 2}}');
      expect(keptOf(before, after)).toEqual({ lost: ['+ row os.a {"id": 1, "doc": {"k": 1, "m": 2}}', '- row os.a {"id": 1, "doc": {"k": 1}}'], back: [], rows: 1, sequences: 0 });
    });

    it("a row deleted: its `-` alone — every row left in its table answered for one", () => {
      const before = text('row os.a {"id": 1}', 'row os.a {"id": 2}', 'row os.a {"id": 3}');
      expect(keptOf(before, text('row os.a {"id": 1}', 'row os.a {"id": 3}'))).toEqual({ lost: ['- row os.a {"id": 2}'], back: [], rows: 3, sequences: 0 });
    });

    it("a table gone — or emptied, or renamed — loses every row of it; the rows of another table are not named", () => {
      const before = text('row os.a {"id": 1}', 'row os.a {"id": 2}', 'row os.b {"id": 9}');
      const lost = ['- row os.a {"id": 1}', '- row os.a {"id": 2}'];
      expect(keptOf(before, text('row os.b {"id": 9}'))).toEqual({ lost, back: [], rows: 3, sequences: 0 });
      expect(keptOf(before, text('row os.b {"id": 9}', 'row os.c {"id": 1}', 'row os.c {"id": 2}'))).toEqual({ lost, back: [], rows: 3, sequences: 0 });
    });

    it("a column gone loses every row of its table, each beside the row of after that answered for none", () => {
      const before = text('row os.a {"id": 1, "x": "one"}', 'row os.a {"id": 2, "x": "two"}');
      const after = text('row os.a {"id": 1}', 'row os.a {"id": 2}');
      // `,` sorts before `}`: the row of before, with its second key, comes before the row it became.
      expect(keptOf(before, after)).toEqual({
        lost: ['- row os.a {"id": 1, "x": "one"}', '+ row os.a {"id": 1}', '- row os.a {"id": 2, "x": "two"}', '+ row os.a {"id": 2}'],
        back: [],
        rows: 2,
        sequences: 0,
      });
    });

    it("a column retyped — its value's JSON changed — loses the rows whose value changed", () => {
      const before = text('row os.a {"id": 1, "n": 7}', 'row os.a {"id": 2, "n": null}');
      const after = text('row os.a {"id": 1, "n": "7"}', 'row os.a {"id": 2, "n": null}');
      expect(keptOf(before, after)).toEqual({ lost: ['+ row os.a {"id": 1, "n": "7"}', '- row os.a {"id": 1, "n": 7}'], back: [], rows: 2, sequences: 0 });
    });

    it("rows are a multiset: two equal rows against one lose one; two against two lose none", () => {
      const twice = text('row os.a {"x": 1}', 'row os.a {"x": 1}');
      expect(keptOf(twice, text('row os.a {"x": 1}'))).toEqual({ lost: ['- row os.a {"x": 1}'], back: [], rows: 2, sequences: 0 });
      expect(keptOf(twice, twice)).toEqual(kept(2, 0));
      expect(keptOf(twice, text('row os.a {"x": 1, "y": 0}', 'row os.a {"x": 1, "y": 1}'))).toEqual(kept(2, 0));
    });

    it("one row of after answers for one row of before at most: two rows of before that it would each match lose one", () => {
      const before = text('row os.a {"x": 1}', 'row os.a {"x": 1}');
      expect(keptOf(before, text('row os.a {"x": 1, "y": 5}'))).toEqual({ lost: ['- row os.a {"x": 1}'], back: [], rows: 2, sequences: 0 });
    });
  });

  // The lead's reading of SPEC §5 (2026-11-23): two JSON values are equal when the server printed them the same. A
  // number is compared by its text as it stands in the line; strings, booleans and null by value; an object by its
  // keys and their values, an array in order. A line's JSON is written in the text's own escapes (6a §4.2): every
  // backslash of the JSON doubled — the literals below are the lines as a rows' text holds them.
  describe("A.1 keptOf — equal is printed the same (the lead's reading of §5)", () => {
    it("a number's text changed with its value unchanged — 12.5000 to 12.5, 1.0 to 1, 1e-7 to 0.0000001 — loses the row, `-` and `+` printed", () => {
      expect(keptOf(text('row os.a {"id": 1, "n": 12.5000}'), text('row os.a {"id": 1, "n": 12.5}'))).toEqual({
        lost: ['- row os.a {"id": 1, "n": 12.5000}', '+ row os.a {"id": 1, "n": 12.5}'],
        back: [],
        rows: 1,
        sequences: 0,
      });
      expect(keptOf(text('row os.a {"id": 1, "n": 1.0}'), text('row os.a {"id": 1, "n": 1}'))).toEqual({
        lost: ['- row os.a {"id": 1, "n": 1.0}', '+ row os.a {"id": 1, "n": 1}'],
        back: [],
        rows: 1,
        sequences: 0,
      });
      expect(keptOf(text('row os.a {"id": 1, "n": 1e-7}'), text('row os.a {"id": 1, "n": 0.0000001}'))).toEqual({
        lost: ['+ row os.a {"id": 1, "n": 0.0000001}', '- row os.a {"id": 1, "n": 1e-7}'],
        back: [],
        rows: 1,
        sequences: 0,
      });
    });

    const N1 = '{"id": 1, "n": 0.100000000000000000000000000001, "f": 0.30000000000000004}';
    const N2 = '{"id": 1, "n": 0.100000000000000000000000000002, "f": 0.30000000000000004}';
    const N1_NEW = '{"id": 1, "n": 0.100000000000000000000000000001, "f": 0.30000000000000004, "new": true}';
    const N2_NEW = '{"id": 1, "n": 0.100000000000000000000000000002, "f": 0.30000000000000004, "new": true}';

    it("two rows that differ only in a digit a double cannot hold, unchanged while a column is added: both kept", () => {
      expect(keptOf(text(`row os.a ${N1}`, `row os.a ${N2}`), text(`row os.a ${N1_NEW}`, `row os.a ${N2_NEW}`))).toEqual(kept(2, 0));
    });

    it("after holds the …0001 row twice and no …0002: one row lost — a value rounded through a double would have kept it", () => {
      expect(keptOf(text(`row os.a ${N1}`, `row os.a ${N2}`), text(`row os.a ${N1_NEW}`, `row os.a ${N1_NEW}`))).toEqual({
        lost: [`+ row os.a ${N1_NEW}`, `- row os.a ${N2}`],
        back: [],
        rows: 2,
        sequences: 0,
      });
    });

    it("a row's keys are a set: the same keys in another order are kept, with a key added too", () => {
      const before = text('row os.a {"a": 1, "b": 2}');
      expect(keptOf(before, text('row os.a {"b": 2, "a": 1}'))).toEqual(kept(1, 0));
      expect(keptOf(before, text('row os.a {"b": 2, "c": 3, "a": 1}'))).toEqual(kept(1, 0));
    });

    // The JSON string `say \"hi\" \\ back\nline é`, as the text holds it: each backslash doubled.
    const ESCAPED = String.raw`row os.a {"id": 1, "s": "say \\"hi\\" \\\\ back\\nline é"}`;
    const ESCAPED_TAB = String.raw`row os.a {"id": 1, "s": "say \\"hi\\" \\\\ back\\tline é"}`;

    it("a string holding \\\", \\\\ and \\n escapes and an é is equal to itself", () => {
      expect(keptOf(text(ESCAPED), text(ESCAPED))).toEqual(kept(1, 0));
      expect(keptOf(text(ESCAPED), text(String.raw`row os.a {"id": 1, "s": "say \\"hi\\" \\\\ back\\nline é", "new": null}`))).toEqual(kept(1, 0));
    });

    it("a string that differs only inside an escape — \\n becomes \\t — loses its row", () => {
      expect(keptOf(text(ESCAPED), text(ESCAPED_TAB))).toEqual({ lost: [`- ${ESCAPED}`, `+ ${ESCAPED_TAB}`], back: [], rows: 1, sequences: 0 });
    });
  });

  describe("A.1 keptOf — sequences", () => {
    const at = (name: string, value: number, called: "t" | "f", ascending: "t" | "f"): string => `sequence-position ${name} ${value} called ${called} ascending ${ascending}`;

    it("further on is kept: ascending higher, descending lower, and `called` from f to t at the same value", () => {
      expect(keptOf(text(at("os.s", 10, "t", "t")), text(at("os.s", 20, "t", "t")))).toEqual(kept(0, 1));
      expect(keptOf(text(at("os.s", 10, "t", "t")), text(at("os.s", 11, "f", "t")))).toEqual(kept(0, 1));
      expect(keptOf(text(at("os.d", -10, "t", "f")), text(at("os.d", -11, "t", "f")))).toEqual(kept(0, 1));
      expect(keptOf(text(at("os.s", 10, "f", "t")), text(at("os.s", 10, "t", "t")))).toEqual(kept(0, 1));
    });

    it("behind, ascending: its line of before and its line of after", () => {
      expect(keptOf(text(at("os.s", 10, "t", "t")), text(at("os.s", 9, "t", "t")))).toEqual({
        lost: [],
        back: ["- sequence-position os.s 10 called t ascending t", "+ sequence-position os.s 9 called t ascending t"],
        rows: 0,
        sequences: 1,
      });
    });

    it("behind, descending: a higher last_value", () => {
      expect(keptOf(text(at("os.d", -10, "t", "f")), text(at("os.d", -9, "t", "f")))).toEqual({
        lost: [],
        back: ["- sequence-position os.d -10 called t ascending f", "+ sequence-position os.d -9 called t ascending f"],
        rows: 0,
        sequences: 1,
      });
    });

    it("`called` gone back from t to f at the same value; sorted by the line after its sign, so the `+` comes first", () => {
      expect(keptOf(text(at("os.s", 10, "t", "t")), text(at("os.s", 10, "f", "t")))).toEqual({
        lost: [],
        back: ["+ sequence-position os.s 10 called f ascending t", "- sequence-position os.s 10 called t ascending t"],
        rows: 0,
        sequences: 1,
      });
    });

    it("a sequence gone: its line of before alone", () => {
      expect(keptOf(text(at("os.s", 10, "t", "t"), at("os.t", 1, "f", "t")), text(at("os.t", 1, "f", "t")))).toEqual({
        lost: [],
        back: ["- sequence-position os.s 10 called t ascending t"],
        rows: 0,
        sequences: 2,
      });
    });
  });

  describe("A.1 keptOf — the lists' order and the counts", () => {
    it("lost across tables and back apart, each sorted by the line after its sign — `x\": 0` before `x\": 2`, `os.p 6` before `os.p 7` before `os.q`; the rows of a table that lost none are not named; the counts are the lines of before", () => {
      const before = text(
        'row os.a {"id": 1, "x": 1}',
        'row os.a {"id": 2, "x": 2}',
        'row os.b {"id": 1}',
        'row os.c {"id": 3}',
        "sequence-position os.p 7 called t ascending t",
        "sequence-position os.q 5 called t ascending t",
        "sequence-position os.r 1 called t ascending t",
      );
      const after = text(
        'row os.a {"id": 1, "x": 1}',
        'row os.a {"id": 2, "x": 0}',
        'row os.c {"id": 3}',
        'row os.c {"id": 4}',
        "sequence-position os.p 6 called t ascending t",
        "sequence-position os.r 2 called f ascending t",
      );
      expect(keptOf(before, after)).toEqual({
        lost: ['+ row os.a {"id": 2, "x": 0}', '- row os.a {"id": 2, "x": 2}', '- row os.b {"id": 1}'],
        back: ["+ sequence-position os.p 6 called t ascending t", "- sequence-position os.p 7 called t ascending t", "- sequence-position os.q 5 called t ascending t"],
        rows: 4,
        sequences: 3,
      });
    });

    it("sorted by UTF-8 bytes, not by UTF-16 code units: U+FF01 before U+1F600", () => {
      const before = text('row os.a {"x": "\u{1F600}"}', 'row os.a {"x": "！"}');
      expect(keptOf(before, text())).toEqual({ lost: ['- row os.a {"x": "！"}', '- row os.a {"x": "\u{1F600}"}'], back: [], rows: 2, sequences: 0 });
    });
  });
}
