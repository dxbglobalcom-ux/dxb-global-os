import { describe, expect, it } from "vitest";
import { keptOf } from "@dxb-foundation/chain";

// Piece 6b's SPEC §10.1, the blind audit's corrections that keptOf obeys (SOL.md A2, B3, B2) — on texts written in the
// case, every expected answer written down whole, in §5's order: each list sorted by the line after its sign, `-`
// before `+` for one line.
//   row 1 (A2): a sequence turned round is `back`, whatever its last_value — after 100, 105, 110 an increment of -5
//               gives 105 again, and both texts read `110 called t`;
//   row 6 (B3): under a row's own key a value is compared as its text stands — a nested object's keys in another order,
//               white space inside a nested value, `é` for `é`: each another text, the row lost;
//   row 8 (B2): 150,000 rows of one table lost, every one printed; and all 150,000 kept.

/** A rows' text of these lines, in the order given — each case writes them already sorted by bytes. */
const text = (...lines: string[]): string => `rows-format 1\n${lines.map((line) => `${line}\n`).join("")}`;

const at = (name: string, value: number, called: "t" | "f", ascending: "t" | "f"): string => `sequence-position ${name} ${value} called ${called} ascending ${ascending}`;

export function keptAsItStandsCases(): void {
  describe("§10.1 row 1 — a sequence whose direction changed is back (SOL A2)", () => {
    it("ascending to descending, last_value and called the same — 110 called t both — the audit's case: back holds the - line of before and the + line of after", () => {
      expect(keptOf(text(at("os.s", 110, "t", "t")), text(at("os.s", 110, "t", "f")))).toEqual({
        lost: [],
        // `ascending f` sorts before `ascending t`: the + line comes first.
        back: ["+ sequence-position os.s 110 called t ascending f", "- sequence-position os.s 110 called t ascending t"],
        rows: 0,
        sequences: 1,
      });
    });

    it("descending to ascending, last_value and called the same: back", () => {
      expect(keptOf(text(at("os.d", -10, "t", "f")), text(at("os.d", -10, "t", "t")))).toEqual({
        lost: [],
        back: ["- sequence-position os.d -10 called t ascending f", "+ sequence-position os.d -10 called t ascending t"],
        rows: 0,
        sequences: 1,
      });
    });

    it("ascending to descending with a last_value further on by the old direction (110 to 120): still back", () => {
      expect(keptOf(text(at("os.s", 110, "t", "t")), text(at("os.s", 120, "t", "f")))).toEqual({
        lost: [],
        back: ["- sequence-position os.s 110 called t ascending t", "+ sequence-position os.s 120 called t ascending f"],
        rows: 0,
        sequences: 1,
      });
    });

    it("descending to ascending with a last_value further on by the old direction (-10 to -20): still back", () => {
      expect(keptOf(text(at("os.d", -10, "t", "f")), text(at("os.d", -20, "t", "t")))).toEqual({
        lost: [],
        back: ["- sequence-position os.d -10 called t ascending f", "+ sequence-position os.d -20 called t ascending t"],
        rows: 0,
        sequences: 1,
      });
    });

    it("called gone from f to t with the direction changed — further on by every other measure: still back", () => {
      expect(keptOf(text(at("os.s", 110, "f", "t")), text(at("os.s", 110, "t", "f")))).toEqual({
        lost: [],
        back: ["- sequence-position os.s 110 called f ascending t", "+ sequence-position os.s 110 called t ascending f"],
        rows: 0,
        sequences: 1,
      });
    });

    it("the direction the same, further on: kept — the rule bites only on a turn", () => {
      expect(keptOf(text(at("os.s", 110, "t", "t")), text(at("os.s", 115, "t", "t")))).toEqual({ lost: [], back: [], rows: 0, sequences: 1 });
    });
  });

  // The lines as a rows' text holds them: every backslash of the JSON doubled (6a §4.2).
  describe("§10.1 row 6 — under a row's own key a value is compared as its text stands (SOL B3)", () => {
    it("two rows that differ only in a nested object's key order: lost, `-` and `+` printed", () => {
      const before = 'row os.a {"id": 1, "doc": {"a": 1, "b": 2}}';
      const after = 'row os.a {"id": 1, "doc": {"b": 2, "a": 1}}';
      expect(keptOf(text(before), text(after))).toEqual({ lost: [`- ${before}`, `+ ${after}`], back: [], rows: 1, sequences: 0 });
    });

    it("two rows that differ only in white space inside a nested object: lost", () => {
      const before = 'row os.a {"id": 1, "doc": {"a": 1}}';
      const after = 'row os.a {"id": 1, "doc": {"a":1}}';
      // A space (0x20) sorts before `1` (0x31): the line of before comes first.
      expect(keptOf(text(before), text(after))).toEqual({ lost: [`- ${before}`, `+ ${after}`], back: [], rows: 1, sequences: 0 });
    });

    it("two rows that differ only in white space inside a nested array: lost", () => {
      const before = 'row os.a {"id": 1, "list": [1, 2]}';
      const after = 'row os.a {"id": 1, "list": [1,2]}';
      expect(keptOf(text(before), text(after))).toEqual({ lost: [`- ${before}`, `+ ${after}`], back: [], rows: 1, sequences: 0 });
    });

    it('"é" against "\\u00e9" under a row\'s own key: lost — another text', () => {
      const before = 'row os.a {"id": 1, "s": "é"}';
      const after = String.raw`row os.a {"id": 1, "s": "\\u00e9"}`;
      // A backslash (0x5c) sorts before é's first byte (0xc3): the line of after comes first.
      expect(keptOf(text(before), text(after))).toEqual({ lost: [`+ ${after}`, `- ${before}`], back: [], rows: 1, sequences: 0 });
    });

    it('"é" against "\\u00e9" inside a nested value: lost', () => {
      const before = 'row os.a {"id": 1, "doc": {"s": "é"}}';
      const after = String.raw`row os.a {"id": 1, "doc": {"s": "\\u00e9"}}`;
      expect(keptOf(text(before), text(after))).toEqual({ lost: [`+ ${after}`, `- ${before}`], back: [], rows: 1, sequences: 0 });
    });

    it("the same nested text, the row's own keys in another order and one added: kept — a row's own keys are still a set", () => {
      const before = text('row os.a {"id": 1, "doc": {"b": 2, "a": 1}}');
      expect(keptOf(before, text('row os.a {"doc": {"b": 2, "a": 1}, "id": 1}'))).toEqual({ lost: [], back: [], rows: 1, sequences: 0 });
      expect(keptOf(before, text('row os.a {"doc": {"b": 2, "a": 1}, "id": 1, "new": null}'))).toEqual({ lost: [], back: [], rows: 1, sequences: 0 });
    });
  });

  // 150,000 rows `{"n": 100000}` … `{"n": 249999}`: six digits each, so the order of their bytes is the order of n.
  const MANY = 150_000;
  // Joined, never spread into `text`'s arguments: the case must not itself meet the limit it pins.
  const manyRows = (): string => `rows-format 1\n${Array.from({ length: MANY }, (_, at) => `row os.a {"n": ${100_000 + at}}\n`).join("")}`;

  describe("§10.1 row 8 — no list is spread into a call's arguments (SOL B2)", () => {
    it("150,000 rows of one table in before and none in after: lost holds 150,000 lines, the first and the last as written; under ten seconds", { timeout: 10_000 }, () => {
      const started = Date.now();
      const answer = keptOf(manyRows(), text());
      const took = Date.now() - started;
      expect(answer.lost).toHaveLength(MANY);
      expect(answer.lost[0]).toBe('- row os.a {"n": 100000}');
      expect(answer.lost[MANY - 1]).toBe('- row os.a {"n": 249999}');
      expect(answer.lost.every((line) => line.startsWith("- row os.a "))).toBe(true);
      expect({ back: answer.back, rows: answer.rows, sequences: answer.sequences }).toEqual({ back: [], rows: MANY, sequences: 0 });
      expect(took).toBeLessThan(10_000);
    });

    it("150,000 rows of one table, all kept; under ten seconds", { timeout: 10_000 }, () => {
      const rows = manyRows();
      expect(keptOf(rows, rows)).toEqual({ lost: [], back: [], rows: MANY, sequences: 0 });
    });
  });
}
