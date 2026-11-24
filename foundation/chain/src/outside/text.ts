// The inventory and the outside text as text (piece 6c's SPEC §4.2, §4.3) — pure: whether a text is one's spelling,
// and the outside text of two inventories. Both are the snapshot's form (6a §4.2) under their own first lines; its
// order, escapes and judgement of the form are the snapshot's own (`snapshot/text.ts`).
import { byBytes, isFormedUnder, textHeadedBy, unescaped } from "../snapshot/text.ts";

/** The inventory's first line (§4.2), alone of its kind. */
export const INVENTORY_FIRST_LINE = "inventory-format 1";

/** The outside text's first line (§4.3), alone of its kind. */
export const OUTSIDE_FIRST_LINE = "outside-format 1";

/**
 * An inventory's line as `outsideOf` takes it: `counted` — `read` and `left-out`, which are not compared; `keyed` — a
 * `row` or `held` line, by its key and with its digest; `whole` — an `owner` or `acl` line, as a whole without its mark.
 */
type InventoryLine = { kind: "counted" } | { kind: "keyed"; mark: string; key: string; digest: string } | { kind: "whole"; mark: string; line: string };

// §4.2's lines, each read whole as it was before its escapes: a name, an identity and a relation may hold a space or
// a newline, a catalogue's name and a digest do not.
const READ = /^read \S+ (?:0|[1-9]\d*)$/;
const LEFT_OUT = /^left-out \S+$/;
const ROW = /^row (in|out) (\S+) ([0-9a-f]{64}) ([\s\S]+)$/;
const HELD = /^held (out) (rows|position) ([0-9a-f]{64}) ([\s\S]+)$/;
const OWNER = /^owner (in|out) (\S+ [\s\S]+ is [\s\S]+)$/;
const ACL = /^acl (in|out) (\S+ [\s\S]+ has [\s\S]+)$/;

/** An inventory's line, read as one of §4.2's kinds; nothing when it is of none. */
function inventoryLineOf(raw: string): InventoryLine | undefined {
  if (READ.test(raw) || LEFT_OUT.test(raw)) return { kind: "counted" };
  const row = ROW.exec(raw);
  if (row !== null) return { kind: "keyed", mark: row[1] ?? "", key: `row ${row[2] ?? ""} ${row[4] ?? ""}`, digest: row[3] ?? "" };
  const held = HELD.exec(raw);
  if (held !== null) return { kind: "keyed", mark: held[1] ?? "", key: `held ${held[2] ?? ""} ${held[4] ?? ""}`, digest: held[3] ?? "" };
  for (const [word, shape] of [["owner", OWNER], ["acl", ACL]] as const) {
    const whole = shape.exec(raw);
    if (whole !== null) return { kind: "whole", mark: whole[1] ?? "", line: `${word} ${whole[2] ?? ""}` };
  }
  return undefined;
}

// §4.3's lines, read as they were before their escapes.
const OUTSIDE_LINES = [
  /^(?:added|removed|changed) row \S+ [\s\S]+$/,
  /^(?:added|removed|changed) held (?:rows|position) [\s\S]+$/,
  /^(?:added|removed) owner \S+ [\s\S]+ is [\s\S]+$/,
  /^(?:added|removed) acl \S+ [\s\S]+ has [\s\S]+$/,
];

/** The lines after the first of a text of the form under `first`, each as it was before its escapes; nothing when the text is not of the form. */
function rawLinesOf(first: string, text: string): string[] | undefined {
  if (!isFormedUnder(first, text)) return undefined;
  const raw: string[] = [];
  for (const line of text.slice(0, -1).split("\n").slice(1)) {
    const said = unescaped(line);
    if (said === undefined) return undefined;
    raw.push(said);
  }
  return raw;
}

/** An inventory's lines read, or nothing when the text is not an inventory's spelling (§4.2). */
function inventoryLinesOf(text: string): InventoryLine[] | undefined {
  const raw = rawLinesOf(INVENTORY_FIRST_LINE, text);
  if (raw === undefined) return undefined;
  const lines: InventoryLine[] = [];
  for (const one of raw) {
    const line = inventoryLineOf(one);
    if (line === undefined) return undefined;
    lines.push(line);
  }
  return lines;
}

/** Whether `text` is an inventory's spelling (§4.2): of the form under its first line, every other line of a kind §4.2 names. */
export const isAnInventory = (text: string): boolean => inventoryLinesOf(text) !== undefined;

/** Whether `text` is an outside text's spelling (§4.3): of the form under its first line, every other line of a kind §4.3 names. */
export function isAnOutsideText(text: string): boolean {
  const raw = rawLinesOf(OUTSIDE_FIRST_LINE, text);
  return raw !== undefined && raw.every((line) => OUTSIDE_LINES.some((shape) => shape.test(line)));
}

/** The `out` lines of an inventory (§4.3): its keys with their digests, and its whole lines — each counted. */
type OutLines = { keyed: Map<string, string[]>; whole: Map<string, number> };

/** The `out` lines of `text`, each text read by its own marks; a text that is not an inventory's spelling throws. */
function outLinesOf(text: string, which: string): OutLines {
  const lines = inventoryLinesOf(text);
  if (lines === undefined) throw new Error(`outsideOf: the ${which} text is not an inventory's spelling`);
  const out: OutLines = { keyed: new Map(), whole: new Map() };
  for (const line of lines) {
    if (line.kind === "counted" || line.mark !== "out") continue;
    if (line.kind === "whole") {
      out.whole.set(line.line, (out.whole.get(line.line) ?? 0) + 1);
      continue;
    }
    const digests = out.keyed.get(line.key);
    if (digests === undefined) out.keyed.set(line.key, [line.digest]);
    else digests.push(line.digest);
  }
  return out;
}

/** Whether two lists of digests are one multiset: equal once both are sorted by bytes. */
function theSameDigests(one: readonly string[], other: readonly string[]): boolean {
  const sorted = (digests: readonly string[]): string => [...digests].sort(byBytes).join(" ");
  return one.length === other.length && sorted(one) === sorted(other);
}

/** Each whole line of `these` that no equal line of `those` answers, as many times as it is left unanswered. */
function unanswered(these: ReadonlyMap<string, number>, those: ReadonlyMap<string, number>): string[] {
  const left: string[] = [];
  for (const [line, count] of these) for (let at = those.get(line) ?? 0; at < count; at += 1) left.push(line);
  return left;
}

/**
 * Pure (SPEC §4.3): the outside text of an inventory `before` and an inventory `after` of one instance. Only `out`
 * lines are read. A `row` or `held` key only after is `added`, only before `removed`, in both with another multiset of
 * digests `changed` — one line a key. An `owner` or `acl` line of one text that no equal line of the other answers is
 * `added` or `removed`, once for each. `read` and `left-out` are not compared. Sorted by bytes; two equal inventories
 * give the first line alone. A text that is not an inventory's spelling throws.
 */
export function outsideOf(before: string, after: string): string {
  const was = outLinesOf(before, "before");
  const now = outLinesOf(after, "after");
  const lines: string[] = [];
  for (const [key, digests] of now.keyed) {
    const then = was.keyed.get(key);
    if (then === undefined) lines.push(`added ${key}`);
    else if (!theSameDigests(then, digests)) lines.push(`changed ${key}`);
  }
  for (const key of was.keyed.keys()) if (!now.keyed.has(key)) lines.push(`removed ${key}`);
  for (const line of unanswered(now.whole, was.whole)) lines.push(`added ${line}`);
  for (const line of unanswered(was.whole, now.whole)) lines.push(`removed ${line}`);
  return textHeadedBy(OUTSIDE_FIRST_LINE, lines);
}
