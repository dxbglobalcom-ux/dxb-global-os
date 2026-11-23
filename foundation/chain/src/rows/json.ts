// A row's JSON as "kept" compares it (piece 6b's SPEC §5, §6a.1, §10.1 row 6): equal is "the server printed it the
// same". A row's own keys are a set; under each of them the value is compared as its text stands — the exact slice of
// the line it occupies, white space inside kept, nothing re-spelled: `12.5000` is not `12.5`, a nested object's keys
// in another order are another text, and `é` is not `é`. The grammar is still walked, to find where each value
// ends and to refuse what is no JSON. Pure.

// RFC 8259's tokens, each tried where the reading stands (`y`). A string's characters are those JSON allows.
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

/** An object's key and its `:`, past any white space before them; the key as JSON spells it, or nothing. */
function keyOf(reading: Reading): string | undefined {
  token(reading, SPACE);
  const key = token(reading, STRING);
  return key !== undefined && takes(reading, ":") ? key : undefined;
}

/**
 * Whether one JSON value stands next, past any white space — and if so, the reading moved to where it ends. Its
 * insides are walked, not kept: nothing of a nested value is compared but its text (§10.1 row 6), so a key said twice
 * inside one is no concern here. Iterative, the closers still owed on a list of their own: no depth of nesting reaches
 * the stack.
 */
function passesAValue(reading: Reading): boolean {
  const owed: string[] = [];
  for (;;) {
    // A value begins here: an object or an array opens — or closes at once, empty — or a token stands whole.
    if (takes(reading, "{")) {
      if (!takes(reading, "}")) {
        if (keyOf(reading) === undefined) return false;
        owed.push("}");
        continue;
      }
    } else if (takes(reading, "[")) {
      if (!takes(reading, "]")) {
        owed.push("]");
        continue;
      }
    } else if ((token(reading, STRING) ?? token(reading, NUMBER) ?? token(reading, LITERAL)) === undefined) {
      return false;
    }
    // A value ended here: a `,` begins the next of the innermost object or array, or what is owed closes.
    for (;;) {
      const closer = owed.at(-1);
      if (closer === undefined) return true;
      if (takes(reading, ",")) {
        if (closer === "}" && keyOf(reading) === undefined) return false;
        break;
      }
      if (!takes(reading, closer)) return false;
      owed.pop();
    }
  }
}

/**
 * The keys of the JSON object `text` is — each read as the name it says, so that its escapes do not make it another
 * key — with each value's text as it stands; or nothing when `text` is not one JSON object and nothing else, or when
 * it says one of its own keys twice: no text of the server's holds one (6a §9).
 */
export function membersOfARow(text: string): Map<string, string> | undefined {
  const reading = { text, at: 0 };
  if (!takes(reading, "{")) return undefined;
  const members = new Map<string, string>();
  if (!takes(reading, "}")) {
    do {
      const key = keyOf(reading);
      if (key === undefined) return undefined;
      const name = JSON.parse(key) as string;
      token(reading, SPACE);
      const from = reading.at;
      if (!passesAValue(reading) || members.has(name)) return undefined;
      members.set(name, text.slice(from, reading.at));
    } while (takes(reading, ","));
    if (!takes(reading, "}")) return undefined;
  }
  token(reading, SPACE);
  return reading.at === text.length ? members : undefined;
}
