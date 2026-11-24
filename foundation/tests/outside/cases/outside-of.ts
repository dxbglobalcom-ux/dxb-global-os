import { describe, expect, it } from "vitest";
import { outsideOf } from "@dxb-foundation/chain";
import { inventoryOffencesOf, outsideOffencesOf } from "../fixtures/the-outside-form.ts";

// Piece 6c's SPEC §6 A: the pure outsideOf on inventories written here, by hand, in §4.2's grammar and sorted by their
// UTF-8 bytes; the outside text each must give written beside it, whole, from §4.3.

const A = "a".repeat(64);
const B = "b".repeat(64);
const C = "c".repeat(64);

/** An inventory: its first line, then the lines as written here — a case's own text, in the order the hand wrote it. */
const inventory = (...lines: string[]): string => `${["inventory-format 1", ...lines].join("\n")}\n`;
/** An outside text: its first line, then the lines as written here. */
const outside = (...lines: string[]): string => `${["outside-format 1", ...lines].join("\n")}\n`;

const NOTHING = outside();
const DEPEND = "pg_depend table public.t -> schema public n";

/** Every inventory and every outside text this file writes — what the first case holds to the form. */
const written: { inventories: string[]; outsides: string[] } = { inventories: [], outsides: [] };
const inv = (...lines: string[]): string => {
  const text = inventory(...lines);
  written.inventories.push(text);
  return text;
};
const out = (...lines: string[]): string => {
  const text = outside(...lines);
  written.outsides.push(text);
  return text;
};

type Case = [string, string, string, string];

/**
 * Texts in every way of §4.2's form but whole (SPEC §4.3, §10.1 row 4): a `read <catalogue> <n>` line that does
 * not count its catalogue's `row` lines, `row` lines whose catalogue has no `read` line, no `read` line at all —
 * each no inventory, as a before and as an after, and the command's `before-malformed` (cases/refusals.ts).
 */
export const WHOLE_OR_NONE: [string, string][] = [
  ["the auditor's: read pg_class 1 and no row line of pg_class", "inventory-format 1\nread pg_class 1\n"],
  ["a read line that counts one row too many", `inventory-format 1\nread pg_namespace 2\nrow out pg_namespace ${A} schema x\n`],
  ["a read line that counts one row too few", `inventory-format 1\nread pg_namespace 0\nrow out pg_namespace ${A} schema x\n`],
  ["a read line that counts the out rows alone, beside an in row", `inventory-format 1\nread pg_class 1\nrow in pg_class ${A} table os.t\nrow out pg_class ${A} table public.t\n`],
  ["cut short at a line's end: the last catalogue's row gone, its read line standing", `inventory-format 1\nread pg_class 1\nread pg_namespace 1\nrow out pg_class ${A} table public.t\n`],
  ["a catalogue's rows with no read line, another's read line beside them", `inventory-format 1\nread pg_class 0\nrow out pg_namespace ${A} schema x\n`],
  ["no read line at all, a row line standing", `inventory-format 1\nrow out pg_namespace ${A} schema x\n`],
  ["no read line at all, an owner, an acl and a held line standing", `inventory-format 1\nacl out pg_namespace schema x has postgres=UC/postgres\nheld out rows ${A} public.t\nleft-out pg_largeobject\nowner out pg_namespace schema x is postgres\n`],
  ["the first line alone: no read line", "inventory-format 1\n"],
];

const CASES: Case[] = [
  ["two equal inventories → the first line alone",
    inv("acl out pg_namespace schema x has postgres=UC/postgres", `held out rows ${A} public.t`, "left-out pg_largeobject", "owner out pg_namespace schema x is postgres", "read pg_namespace 1", `row out pg_namespace ${A} schema x`),
    inv("acl out pg_namespace schema x has postgres=UC/postgres", `held out rows ${A} public.t`, "left-out pg_largeobject", "owner out pg_namespace schema x is postgres", "read pg_namespace 1", `row out pg_namespace ${A} schema x`),
    NOTHING],
  ["two inventories that read one catalogue of no row → the first line alone", inv("read pg_namespace 0"), inv("read pg_namespace 0"), NOTHING],
  ["a row whose key stands only after → added row", inv("read pg_namespace 0"), inv("read pg_namespace 1", `row out pg_namespace ${A} schema x`), out("added row pg_namespace schema x")],
  ["a row whose key stands only before → removed row", inv("read pg_namespace 1", `row out pg_namespace ${A} schema x`), inv("read pg_namespace 0"), out("removed row pg_namespace schema x")],
  ["a row whose key stands in both with another digest → changed row", inv("read pg_namespace 1", `row out pg_namespace ${A} schema x`), inv("read pg_namespace 1", `row out pg_namespace ${B} schema x`), out("changed row pg_namespace schema x")],
  ["a key that holds two equal rows, after once → changed row", inv("read pg_depend 2", `row out pg_depend ${A} table public.t -> schema public n`, `row out pg_depend ${A} table public.t -> schema public n`), inv("read pg_depend 1", `row out pg_depend ${A} table public.t -> schema public n`), out(`changed row ${DEPEND}`)],
  ["a key that holds two equal rows, after twice → nothing", inv("read pg_depend 2", `row out pg_depend ${A} table public.t -> schema public n`, `row out pg_depend ${A} table public.t -> schema public n`), inv("read pg_depend 2", `row out pg_depend ${A} table public.t -> schema public n`, `row out pg_depend ${A} table public.t -> schema public n`), NOTHING],
  ["a key that holds two rows, one of them changed → one changed row", inv("read pg_depend 2", `row out pg_depend ${A} table public.t -> schema public n`, `row out pg_depend ${B} table public.t -> schema public n`), inv("read pg_depend 2", `row out pg_depend ${A} table public.t -> schema public n`, `row out pg_depend ${A} table public.t -> schema public n`), out(`changed row ${DEPEND}`)],
  ["a key that holds one row before and two after → one changed row, whatever the number of rows", inv("read pg_depend 1", `row out pg_depend ${A} table public.t -> schema public n`), inv("read pg_depend 2", `row out pg_depend ${B} table public.t -> schema public n`, `row out pg_depend ${C} table public.t -> schema public n`), out(`changed row ${DEPEND}`)],
  ["held: a table's rows changed, a sequence gone, a sequence new",
    inv(`held out position ${A} public.s`, `held out rows ${A} public.t`, "read pg_class 0"),
    inv(`held out position ${A} public.s2`, `held out rows ${B} public.t`, "read pg_class 0"),
    out("added held position public.s2", "changed held rows public.t", "removed held position public.s")],
  ["held: the word is part of the key — rows and position of one name are two keys", inv(`held out rows ${A} public.t`, "read pg_class 0"), inv(`held out position ${A} public.t`, "read pg_class 0"), out("added held position public.t", "removed held rows public.t")],
  ["an owner changed → its old line removed and its new one added", inv("owner out pg_class table public.t is postgres", "read pg_class 0"), inv("owner out pg_class table public.t is anon", "read pg_class 0"), out("added owner pg_class table public.t is anon", "removed owner pg_class table public.t is postgres")],
  ["owner lines are a multiset of whole lines: twice before, once after → removed once", inv("owner out pg_class table public.t is postgres", "owner out pg_class table public.t is postgres", "read pg_class 0"), inv("owner out pg_class table public.t is postgres", "read pg_class 0"), out("removed owner pg_class table public.t is postgres")],
  ["a privilege added to an item that stood → its old item removed, its new one added",
    inv("acl out pg_class table public.t has anon=r/postgres", "acl out pg_class table public.t has postgres=arwdDxtm/postgres", "read pg_class 0"),
    inv("acl out pg_class table public.t has anon=rw/postgres", "acl out pg_class table public.t has postgres=arwdDxtm/postgres", "read pg_class 0"),
    out("added acl pg_class table public.t has anon=rw/postgres", "removed acl pg_class table public.t has anon=r/postgres")],
  ["an item for PUBLIC added → added acl, its grantee empty as the server prints it", inv("acl out pg_namespace schema extensions has postgres=UC/postgres", "read pg_namespace 0"), inv("acl out pg_namespace schema extensions has =U/postgres", "acl out pg_namespace schema extensions has postgres=UC/postgres", "read pg_namespace 0"), out("added acl pg_namespace schema extensions has =U/postgres")],
  ["acl lines are a multiset of whole lines: once before, twice after → added once", inv("acl out pg_class table public.t has anon=r/postgres", "read pg_class 0"), inv("acl out pg_class table public.t has anon=r/postgres", "acl out pg_class table public.t has anon=r/postgres", "read pg_class 0"), out("added acl pg_class table public.t has anon=r/postgres")],
  ["in lines are never read: every kind of in line changed, added and removed → the first line alone",
    inv("acl in pg_class table os.t has os_owner=arwdDxtm/os_owner", "owner in pg_class table os.t is os_owner", "read pg_class 1", "read pg_namespace 1", `row in pg_class ${A} table os.t`, `row in pg_namespace ${A} schema os`),
    inv("acl in pg_class table os.t has os_reader=r/os_owner", "owner in pg_class table os.t is postgres", "read pg_class 2", "read pg_namespace 0", `row in pg_class ${B} table os.t`, `row in pg_class ${B} table os.u`),
    NOTHING],
  ["a thing out, then in → removed", inv("read pg_namespace 1", `row out pg_namespace ${A} schema x`), inv("read pg_namespace 1", `row in pg_namespace ${A} schema x`), out("removed row pg_namespace schema x")],
  ["a thing in, then out → added", inv("read pg_namespace 1", `row in pg_namespace ${A} schema x`), inv("read pg_namespace 1", `row out pg_namespace ${A} schema x`), out("added row pg_namespace schema x")],
  ["an owner line out, then in → removed; an acl line in, then out → added",
    inv("acl in pg_namespace schema x has postgres=UC/postgres", "owner out pg_namespace schema x is postgres", "read pg_namespace 0"),
    inv("acl out pg_namespace schema x has postgres=UC/postgres", "owner in pg_namespace schema x is postgres", "read pg_namespace 0"),
    out("added acl pg_namespace schema x has postgres=UC/postgres", "removed owner pg_namespace schema x is postgres")],
  ["a key whose out rows are the same and an in row is new beside them → nothing: each text is read by its own marks", inv("read pg_depend 1", `row out pg_depend ${A} table public.t -> schema public n`), inv("read pg_depend 2", `row in pg_depend ${B} table public.t -> schema public n`, `row out pg_depend ${A} table public.t -> schema public n`), NOTHING],
  ["read and left-out lines are not compared: other catalogues, another count (of in rows)",
    inv("left-out pg_largeobject", "read pg_class 1", "read pg_old 0", `row in pg_class ${A} table os.t`),
    inv("left-out pg_shdepend", "read pg_class 2", "read pg_newer 0", `row in pg_class ${A} table os.t`, `row in pg_class ${B} table os.u`),
    NOTHING],
  ["one of each, the lines sorted by their bytes",
    inv("acl out pg_class table public.t has anon=r/postgres", `held out rows ${A} public.t`, "owner out pg_class table public.t is postgres", "read pg_class 2", `row out pg_class ${A} table public.gone`, `row out pg_class ${A} table public.t`),
    inv("acl out pg_class table public.t has anon=rw/postgres", `held out rows ${B} public.t`, "owner out pg_class table public.t is postgres", "read pg_class 2", `row out pg_class ${A} table public.new`, `row out pg_class ${B} table public.t`),
    out("added acl pg_class table public.t has anon=rw/postgres", "added row pg_class table public.new", "changed held rows public.t", "changed row pg_class table public.t", "removed acl pg_class table public.t has anon=r/postgres", "removed row pg_class table public.gone")],
  ["sorted by UTF-8 bytes, not by UTF-16 code units", inv("read pg_namespace 0"), inv("read pg_namespace 2", `row out pg_namespace ${A} schema "！"`, `row out pg_namespace ${A} schema "\u{1F600}"`), out('added row pg_namespace schema "！"', 'added row pg_namespace schema "\u{1F600}"')],
];

const GOOD = inventory("read pg_namespace 1", `row out pg_namespace ${A} schema x`);

const MALFORMED: [string, string][] = [
  ["no bytes at all", ""],
  ["a snapshot's first line", "snapshot-format 1\n"],
  ["an outside text, not an inventory", "outside-format 1\nadded row pg_namespace schema x\n"],
  ["a first line missing", `read pg_namespace 1\nrow out pg_namespace ${A} schema x\n`],
  ["a line out of order", `inventory-format 1\nread pg_namespace 2\nrow out pg_namespace ${B} schema x\nrow out pg_namespace ${A} schema x\n`],
  ["out of order by UTF-8 bytes, though in order by UTF-16 code units", `inventory-format 1\nread pg_namespace 2\nrow out pg_namespace ${A} schema "\u{1F600}"\nrow out pg_namespace ${A} schema "！"\n`],
  ["a carriage return ending each line", `inventory-format 1\r\nread pg_namespace 1\r\nrow out pg_namespace ${A} schema x\r\n`],
  ["no final newline", `inventory-format 1\nread pg_namespace 1\nrow out pg_namespace ${A} schema x`],
  ["an empty line", `inventory-format 1\n\nread pg_namespace 1\nrow out pg_namespace ${A} schema x\n`],
  ["an empty last line", `inventory-format 1\nread pg_namespace 1\nrow out pg_namespace ${A} schema x\n\n`],
  ["a line of no kind §4.2 names", "inventory-format 1\nread pg_namespace 0\nschema os owner os_owner\n"],
  ["a row line marked neither in nor out", `inventory-format 1\nread pg_namespace 1\nrow maybe pg_namespace ${A} schema x\n`],
  // Whole or none (SPEC §4.3, §10.1 row 4): a text cut short is no inventory.
  ...WHOLE_OR_NONE,
];

export function outsideOfCases(): void {
  describe("A outsideOf(before, after), on inventories written by hand", () => {
    it("the hand's own texts are seen to be in the form first: every inventory and every outside text written here", () => {
      for (const text of written.inventories) expect(inventoryOffencesOf(text), text).toEqual([]);
      for (const text of written.outsides) expect(outsideOffencesOf(text), text).toEqual([]);
      expect(inventoryOffencesOf(GOOD)).toEqual([]);
    });

    it.each(CASES)("%s", (_what, before, after, expected) => {
      expect(outsideOf(before, after)).toBe(expected);
    });

    it("pure: the same two texts give the same text, and neither is changed", () => {
      const [, before, after, expected] = CASES.at(-2) as Case;
      const copies = [`${before}`, `${after}`];
      expect(outsideOf(before, after)).toBe(expected);
      expect(outsideOf(before, after)).toBe(expected);
      expect([before, after]).toEqual(copies);
    });

    it("the judge is seen to work: each malformed text below is one the form refuses", () => {
      for (const [what, text] of MALFORMED) expect(inventoryOffencesOf(text), what).not.toEqual([]);
    });

    // A throw counts only from the function itself: before the code exists, the name is no function at all.
    it.each(MALFORMED)("a before that is not an inventory's spelling throws: %s", (_what, text) => {
      expect(typeof outsideOf).toBe("function");
      expect(outsideOf(GOOD, GOOD)).toBe(NOTHING);
      expect(() => outsideOf(text, GOOD)).toThrow();
    });

    it.each(MALFORMED)("an after that is not an inventory's spelling throws: %s", (_what, text) => {
      expect(typeof outsideOf).toBe("function");
      expect(outsideOf(GOOD, GOOD)).toBe(NOTHING);
      expect(() => outsideOf(GOOD, text)).toThrow();
    });

    // The audit's A8, as its author wrote it: a reading cut short is never read as rows gone, nor as rows new.
    it("the auditor's own pair: read pg_class 1 with no row line of pg_class, against read pg_class 0 — thrown either way", () => {
      const fresh = inventory("read pg_class 0");
      const cut = inventory("read pg_class 1");
      expect(typeof outsideOf).toBe("function");
      expect(outsideOf(fresh, fresh)).toBe(NOTHING);
      expect(() => outsideOf(fresh, cut)).toThrow();
      expect(() => outsideOf(cut, fresh)).toThrow();
    });
  });
}
