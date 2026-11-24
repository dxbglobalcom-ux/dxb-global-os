// Piece 6c's SPEC §4.2 and §4.3 as a test hand reads them: the form of an inventory and of an outside text — 6a §4.2's
// form with their own first lines — and the kinds of line their tables name. Nothing here produces a line; it only
// judges one.

const MARK = "(in|out)";
const CATALOGUE = "pg_[a-z_]+";
const DIGEST = "[0-9a-f]{64}";
/** An `aclitem` as the server prints it: `<grantee>=<privileges>/<grantor>`, PUBLIC an empty grantee. */
const ITEM = '(?:[^\\s=]*|"[^"]*")=[a-zA-Z*]*/\\S+';

/** §4.2's table, kind by kind: the shape of a whole inventory line. An identity is free text and may hold spaces. */
export const INVENTORY_SHAPES: Readonly<Record<string, RegExp>> = {
  read: new RegExp(`^read ${CATALOGUE} (0|[1-9]\\d*)$`),
  "left-out": new RegExp(`^left-out ${CATALOGUE}$`),
  row: new RegExp(`^row ${MARK} ${CATALOGUE} ${DIGEST} \\S.*$`),
  owner: new RegExp(`^owner ${MARK} ${CATALOGUE} \\S.* is \\S+$`),
  acl: new RegExp(`^acl ${MARK} ${CATALOGUE} \\S.* has ${ITEM}$`),
  held: new RegExp(`^held out (rows|position) ${DIGEST} \\S+$`),
};

/** §4.3's table: the shape of a whole outside line, by its first two words. */
export const OUTSIDE_SHAPES: Readonly<Record<string, RegExp>> = {
  row: new RegExp(`^(added|removed|changed) row ${CATALOGUE} \\S.*$`),
  held: /^(added|removed|changed) held (rows|position) \S+$/,
  owner: new RegExp(`^(added|removed) owner ${CATALOGUE} \\S.* is \\S+$`),
  acl: new RegExp(`^(added|removed) acl ${CATALOGUE} \\S.* has ${ITEM}$`),
};

/** The five catalogues §4.1 leaves out by name. */
export const LEFT_OUT = ["pg_largeobject", "pg_shdepend", "pg_statistic", "pg_statistic_ext_data", "pg_subscription_rel"] as const;

/** What no line of either text may hold (§4.1, fact 3): a name the server makes from an oid, or a temporary schema's. */
export const NEVER_IN_A_LINE: readonly RegExp[] = [/pg_toast\./, /pg_toast_\d/, /pg_toast_temp_/, /pg_temp_/, /RI_ConstraintTrigger/];

const linesOfText = (text: string): string[] => (text.endsWith("\n") ? text.slice(0, -1).split("\n") : text.split("\n"));

/** 6a §4.2's form with this first line: every way a text breaks it, said by line number. */
function formOffences(text: string, firstLine: string, kindOf: (line: string) => string, shapes: Readonly<Record<string, RegExp>>): string[] {
  const said: string[] = [];
  if (!text.endsWith("\n")) said.push("no final newline");
  if (text.includes("\r")) said.push("a carriage return");
  const lines = linesOfText(text);
  if (lines[0] !== firstLine) said.push(`line 1 is not "${firstLine}"`);
  lines.slice(1).forEach((line, at) => {
    const number = at + 2;
    const previous = lines[at] ?? "";
    if (line === "") said.push(`line ${number} is empty`);
    if (at > 0 && Buffer.compare(Buffer.from(previous, "utf8"), Buffer.from(line, "utf8")) > 0) said.push(`line ${number} is out of order`);
    const kind = kindOf(line);
    const shape = shapes[kind];
    if (shape === undefined) said.push(`line ${number} is of no kind the table names: ${kind}`);
    else if (!shape.test(line)) said.push(`line ${number} is not of its kind's shape: ${line}`);
    for (const never of NEVER_IN_A_LINE) if (never.test(line)) said.push(`line ${number} holds ${never.source}`);
  });
  return said;
}

/** Every way an inventory breaks §4.2's form and lines; none for one in the form. */
export const inventoryOffencesOf = (text: string): string[] =>
  formOffences(text, "inventory-format 1", (line) => line.slice(0, line.indexOf(" ")), INVENTORY_SHAPES);

/**
 * Every way an outside text breaks §4.3's form and lines; none for one in the form. Beside the shapes: no digest
 * stands in it, and a `row` or `held` key is said once — one line a key, whatever the number of rows.
 */
export function outsideOffencesOf(text: string): string[] {
  const said = formOffences(text, "outside-format 1", (line) => line.split(" ")[1] ?? "", OUTSIDE_SHAPES);
  const keys = new Set<string>();
  linesOfText(text).slice(1).forEach((line, at) => {
    if (new RegExp(DIGEST).test(line)) said.push(`line ${at + 2} holds a digest`);
    const [, kind, ...key] = line.split(" ");
    if (kind !== "row" && kind !== "held") return;
    const spelled = [kind, ...key].join(" ");
    if (keys.has(spelled)) said.push(`line ${at + 2} says a key said before: ${spelled}`);
    keys.add(spelled);
  });
  return said;
}
