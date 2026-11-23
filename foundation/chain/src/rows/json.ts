// A row's JSON as "kept" compares it (piece 6b's SPEC §5, §6a.1): equal is "the server printed it the same". Each
// value is read into one spelling of its own — a number as its text stands, never through a JavaScript double, so
// `12.5000` is not `12.5` and thirty digits are thirty digits; a string by the characters it holds, whatever its
// escapes; an object by its keys as a set; an array in order. Pure.
import { byBytes } from "../snapshot/text.ts";

// RFC 8259's tokens, each tried where the reading stands (`y`). A string's characters are those JSON allows; it is then
// read by JSON.parse, which holds no number.
const SPACE = /[ \t\n\r]*/y;
const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const STRING = /"(?:[^"\\\u0000-\u001f]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"/y;
const LITERAL = /true|false|null/y;

/** Where a reading stands in its text. */
type Reading = { text: string; at: number };

/** The token `pattern` matches where the reading stands, the reading moved past it; nothing when it matches none. */
function token(reading: Reading, pattern: RegExp): string | undefined {
  pattern.lastIndex = reading.at;
  const [found] = pattern.exec(reading.text) ?? [];
  if (found !== undefined) reading.at = pattern.lastIndex;
  return found;
}

/** Whether `character` stands next, past any white space — and if so, the reading moved past it. */
function takes(reading: Reading, character: string): boolean {
  token(reading, SPACE);
  if (reading.text[reading.at] !== character) return false;
  reading.at += 1;
  return true;
}

/** The members of an object whose `{` was just read, each value in its own spelling; nothing for a key said twice. */
function membersOf(reading: Reading): Map<string, string> | undefined {
  const members = new Map<string, string>();
  if (takes(reading, "}")) return members;
  do {
    token(reading, SPACE);
    const key = token(reading, STRING);
    if (key === undefined || !takes(reading, ":")) return undefined;
    const name = JSON.parse(key) as string;
    const value = valueOf(reading);
    // A key said twice has no one value: no text of the server's holds one (6a §9).
    if (value === undefined || members.has(name)) return undefined;
    members.set(name, value);
  } while (takes(reading, ","));
  return takes(reading, "}") ? members : undefined;
}

/** An object's own spelling: its keys in the order of their bytes, so that two orders of one set read the same. */
const objectSpelled = (members: Map<string, string>): string =>
  `{${[...members.keys()].sort(byBytes).map((name) => `${JSON.stringify(name)}:${members.get(name) ?? ""}`).join(",")}}`;

/** The value that stands next, in its own spelling, the reading moved past it; nothing when no JSON value stands there. */
function valueOf(reading: Reading): string | undefined {
  token(reading, SPACE);
  if (takes(reading, "{")) {
    const members = membersOf(reading);
    return members === undefined ? undefined : objectSpelled(members);
  }
  if (takes(reading, "[")) {
    const items: string[] = [];
    if (takes(reading, "]")) return "[]";
    do {
      const item = valueOf(reading);
      if (item === undefined) return undefined;
      items.push(item);
    } while (takes(reading, ","));
    return takes(reading, "]") ? `[${items.join(",")}]` : undefined;
  }
  const string = token(reading, STRING);
  // Re-spelled from the characters it holds: `é` and `é` are one string.
  if (string !== undefined) return JSON.stringify(JSON.parse(string));
  return token(reading, NUMBER) ?? token(reading, LITERAL);
}

/**
 * The keys of the JSON object `text` is, each with its value's own spelling — or nothing when `text` is not one JSON
 * object and nothing else, or when an object in it says a key twice.
 */
export function membersOfARow(text: string): Map<string, string> | undefined {
  const reading = { text, at: 0 };
  if (!takes(reading, "{")) return undefined;
  const members = membersOf(reading);
  token(reading, SPACE);
  return reading.at === text.length ? members : undefined;
}
