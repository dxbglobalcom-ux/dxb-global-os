// Piece 6b's SPEC §4 as a test hand reads it: the form of a rows' text — 6a §4.2's, with its own first line — and the
// two kinds of line its table names. Nothing here produces a line; it only judges one.

const B = "[tf]";

/** §4's table, kind by kind: the shape of a whole line. The row's JSON is the last field and may hold spaces. */
export const ROW_SHAPES: Readonly<Record<string, RegExp>> = {
  row: /^row \S+ \{.*\}$/,
  "sequence-position": new RegExp(`^sequence-position \\S+ -?\\d+ called ${B} ascending ${B}$`),
};

/** The tables whose rows are lines of the snapshot instead (§4, "but"): the ledger and the fixture's vocabulary. */
export const NOT_ROWS_TABLES = ["os_chain.ledger", "os.kinds"] as const;

/** Every way a text breaks §4's form, said by line number; none for a text in the form. */
export function rowsOffencesOf(text: string): string[] {
  const said: string[] = [];
  if (!text.endsWith("\n")) said.push("no final newline");
  if (text.includes("\r")) said.push("a carriage return");
  const lines = text.endsWith("\n") ? text.slice(0, -1).split("\n") : text.split("\n");
  if (lines[0] !== "rows-format 1") said.push(`line 1 is not "rows-format 1"`);
  lines.slice(1).forEach((line, at) => {
    const number = at + 2;
    const previous = lines[at] ?? "";
    if (line === "") said.push(`line ${number} is empty`);
    if (at > 0 && Buffer.compare(Buffer.from(previous, "utf8"), Buffer.from(line, "utf8")) > 0) said.push(`line ${number} is out of order`);
    const kind = line.slice(0, line.indexOf(" "));
    const shape = ROW_SHAPES[kind];
    if (shape === undefined) said.push(`line ${number} is of no kind §4 names: ${kind}`);
    else if (!shape.test(line)) said.push(`line ${number} is not of its kind's shape: ${line}`);
    const head = kind === "row" && line.includes(" {") ? line.slice(0, line.indexOf(" {")) : line;
    if (head.includes("  ")) said.push(`line ${number} has a double space outside its last field`);
    const table = line.split(" ")[1] ?? "";
    if (kind === "row" && (NOT_ROWS_TABLES as readonly string[]).includes(table)) said.push(`line ${number} is a row of a table the snapshot reads: ${table}`);
  });
  return said;
}
