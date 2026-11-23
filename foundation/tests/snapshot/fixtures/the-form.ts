// SPEC §4.2's form and §4.3's lines, as a test hand reads them — what A.3 holds both expected texts to. Each kind's
// shape is §4.3's row written as a pattern; nothing here produces a line, it only judges one.

const B = "[tf]";

/** §4.3, kind by kind: the shape of a whole line. A field written `.+` is one the server's text fills. */
export const SHAPES: Readonly<Record<string, RegExp>> = {
  database: /^database \S+ owner \S+ encoding \S+ collate \S+ ctype \S+$/,
  role: new RegExp(`^role \\S+ super ${B} inherit ${B} createrole ${B} createdb ${B} login ${B} replication ${B} bypassrls ${B} connlimit -?\\d+ validuntil .+$`),
  member: new RegExp(`^member \\S+ has \\S+ admin ${B} inherit ${B} set ${B} by \\S+$`),
  "role-setting": /^role-setting \S+ in \S+ [^=\s]+=.*$/,
  schema: /^schema \S+ owner \S+$/,
  "default-acl": new RegExp(`^default-acl for \\S+ in \\S+ on [rSfTn] to \\S+ [A-Z]+ option ${B}$`),
  relation: new RegExp(`^relation \\S+ kind [rpvmSfc] owner \\S+ persistence [put] rowsecurity ${B} force ${B} replident [dnfi] options \\S+$`),
  "partition-key": /^partition-key \S+ .+$/,
  "partition-of": /^partition-of \S+ \S+ .+$/,
  inherits: /^inherits \S+ \S+ \d+$/,
  column: new RegExp(`^column \\S+ \\d+ \\S+ type .+ not-null ${B} identity [ad-] generated [s-] collation \\S+ default .+$`),
  constraint: new RegExp(`^constraint \\S+ \\S+ type [cfpuxtn] deferrable ${B} deferred ${B} validated ${B} def .+$`),
  index: new RegExp(`^index \\S+ valid ${B} def .+$`),
  trigger: /^trigger \S+ \S+ enabled [ODRA] def .+$/,
  rule: /^rule \S+ \S+ enabled \S def .+$/,
  policy: /^policy \S+ \S+ cmd [rawd*] (permissive|restrictive) to \S+$/,
  "policy-using": /^policy-using \S+ \S+ .+$/,
  "policy-check": /^policy-check \S+ \S+ .+$/,
  view: /^view \S+ \d{5}\|.*$/,
  sequence: new RegExp(`^sequence \\S+ type .+ start -?\\d+ increment -?\\d+ min -?\\d+ max -?\\d+ cache \\d+ cycle ${B} owned-by \\S+$`),
  type: /^type \S+ kind [edrm] owner \S+$/,
  "enum-label": /^enum-label \S+ \d+ '.*'$/,
  domain: new RegExp(`^domain \\S+ base .+ not-null ${B} collation \\S+ default .+$`),
  "domain-constraint": new RegExp(`^domain-constraint \\S+ \\S+ validated ${B} def .+$`),
  range: /^range \S+ subtype .+$/,
  function: new RegExp(
    `^function \\S.*\\) kind [fpaw] owner \\S+ language \\S+ returns .+ definer ${B} volatility [isv] strict ${B} parallel [sru] leakproof ${B} cost \\S+ rows \\S+$`,
  ),
  "function-arguments": /^function-arguments \S.*\) .+$/,
  "function-setting": /^function-setting \S.*\) [^=\s]+=.*$/,
  "function-body": /^function-body \S.*\) \d{5}\|.*$/,
  object: /^object .+ owner \S+$/,
  extension: /^extension \S+ schema \S+ owner \S+ version \S+$/,
  publication: /^publication \S+ has \S+$/,
  comment: /^comment .+ \d{5}\|.*$/,
  grant: new RegExp(`^grant (database|schema|relation|column|function|type) .+ to \\S+ [A-Z]+ option ${B} by \\S+ (stored|default)$`),
  outside: /^outside (owns|granted|in-policy|other) \S+ .+$/,
  reference: /^reference \S+ \{.*\}$/,
  ledger: /^ledger \d+ \S+ (ledger|schema) [0-9a-f]{64} runner \S+$/,
};

/** The kinds §4.3 names — the line's first word. */
export const KINDS = Object.keys(SHAPES);

/**
 * The part of a line before its last field — the field §4.2 lets hold spaces: a numbered line's text after `|`, a
 * definition after ` def `, a default after ` default `, an expression, the arguments, a setting's value, a row, an
 * identity. Where a kind's last field cannot hold spaces, the whole line.
 */
export function headOf(line: string): string {
  const kind = line.slice(0, line.indexOf(" "));
  const cutAt = (marker: string): string => (line.includes(marker) ? line.slice(0, line.indexOf(marker)) : line);
  const firstWords = (count: number): string => line.split(" ").slice(0, count).join(" ");
  switch (kind) {
    case "view":
    case "comment":
    case "function-body":
      return cutAt("|");
    case "constraint":
    case "index":
    case "trigger":
    case "rule":
    case "domain-constraint":
      return cutAt(" def ");
    case "column":
    case "domain":
      return cutAt(" default ");
    case "role":
      return cutAt(" validuntil ");
    case "function-arguments":
    case "function-setting":
      return cutAt(") ");
    case "policy-using":
    case "policy-check":
    case "role-setting":
    case "outside":
    case "partition-of":
      return firstWords(3);
    case "reference":
    case "partition-key":
    case "range":
      return firstWords(2);
    default:
      return line;
  }
}

/** Every way a text breaks §4.2 or §4.3, said by line number; none for a text in the form. */
export function offencesOf(text: string): string[] {
  const said: string[] = [];
  if (!text.endsWith("\n")) said.push("no final newline");
  if (text.includes("\r")) said.push("a carriage return");
  const lines = text.endsWith("\n") ? text.slice(0, -1).split("\n") : text.split("\n");
  if (lines[0] !== "snapshot-format 1") said.push(`line 1 is not "snapshot-format 1"`);
  lines.slice(1).forEach((line, at) => {
    const number = at + 2;
    const previous = lines[at] ?? "";
    if (line === "") said.push(`line ${number} is empty`);
    if (at > 0 && Buffer.compare(Buffer.from(previous, "utf8"), Buffer.from(line, "utf8")) > 0) said.push(`line ${number} is out of order`);
    const kind = line.slice(0, line.indexOf(" "));
    const shape = SHAPES[kind];
    if (shape === undefined) said.push(`line ${number} is of no kind §4.3 names: ${kind}`);
    else if (!shape.test(line)) said.push(`line ${number} is not of its kind's shape: ${line}`);
    if (headOf(line).includes("  ")) said.push(`line ${number} has a double space outside its last field`);
    const setting = /^role-setting \S+ in \S+ ([^=\s]+)=(.*)$/.exec(line);
    if (setting?.[1]?.includes(".") && setting[2] !== "<hidden>") said.push(`line ${number} says the value of a dotted setting`);
  });
  return said;
}
