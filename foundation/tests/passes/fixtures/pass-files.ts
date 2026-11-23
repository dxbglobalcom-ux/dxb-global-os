// The texts the bench cases write into a fixture root. What a case expects of a database is
// spelled in the case; here is only what it plants.

/** The schema file every bench case begins with: the passes work in `os`, and the chain's own files make it. */
export const MAKES_OS = "create schema os;\n";

/** `greet.sql`: os.greet() answers this word. */
export const greets = (word: string): string => `create or replace function os.greet() returns text language sql as $f$ select '${word}'::text $f$;\n`;

/** `twice.sql`: os.twice(21) answers 42. */
export const TWICE = "create or replace function os.twice(n integer) returns integer language sql as $f$ select n * 2 $f$;\n";

/** `twice.sql` with other argument types: beside the first it is a second signature, alone it is the changed one. */
export const TWICE_OF_A_BIGINT = "create or replace function os.twice(n bigint) returns bigint language sql as $f$ select n * 2 $f$;\n";

/** `halve.sql`: os.halve(10) answers 5. By name it lies between greet.sql and twice.sql. */
export const HALVE = "create or replace function os.halve(n integer) returns integer language sql as $f$ select n / 2 $f$;\n";

/** A function no file holds, as a schema file makes it. */
export const MAKES_A_STRAY = "create function os.stray() returns text language sql as $f$ select 'made by a schema file'::text $f$;\n";

// As long as piece 3's sleeping file sleeps (chain/fixtures/running.ts): what is left of it is the margin of a case that acts meanwhile.
const SLEEP_SECONDS = 3;

/** A function file that sleeps once its function is made: a function file begins with its own function (SPEC §12.1). */
export const thenSleeps = (makes: string): string => `${makes}select pg_sleep(${SLEEP_SECONDS});\n`;

/**
 * The mark of a vocabulary (SPEC §12.5): the table's comment begins with the word, set by the schema file that
 * makes the table. A table of his policy, and a table outside the files, carry none.
 */
export const marked = (table: string): string => `comment on table os.${table} is 'vocabulary';\n`;

/** The vocabulary most reference cases use: three columns a file owns, and one that is the table's own. */
export const EVENT_TYPES_TABLE = [
  "create table os.event_types (",
  "  name text primary key,",
  "  description text not null,",
  "  weight integer not null,",
  "  seen_count integer not null default 0",
  ");",
  "comment on table os.event_types is 'vocabulary: the event types the code emits';",
  "",
].join("\n");

type EventType = { name: string; description: string; weight: number };

export const OPENED: EventType = { name: "job.opened", description: "a job was opened", weight: 1 };
export const CLOSED: EventType = { name: "job.closed", description: "a job was closed", weight: 2 };
export const FAILED: EventType = { name: "job.failed", description: "a job failed", weight: 3 };

/** A reference file's text: these rows as a JSON array of objects, one row a line. */
export const fileOf = (...rows: readonly object[]): string => (rows.length === 0 ? "[]\n" : `[\n${rows.map((row) => `  ${JSON.stringify(row)}`).join(",\n")}\n]\n`);

/**
 * A table of his policy kind (SPEC §5, last sentence): seeded by a schema file, his from then on — no file in
 * reference/, and no mark (SPEC §12.5).
 */
export const ROUTING_RULES_SEEDED = ["create table os.routing_rules (rule text primary key, model text not null);", "insert into os.routing_rules values ('default', 'small');", ""].join("\n");

/** A second vocabulary, for the cases that need two. */
export const SEVERITIES_TABLE = `create table os.severities (level text primary key, rank integer not null);\n${marked("severities")}`;

/** A vocabulary whose key is two columns, in another order than the table's columns. */
export const RATES_TABLE = `create table os.rates (code text, region text, rate integer not null, primary key (region, code));\n${marked("rates")}`;

/** A table of one column, its key — with no mark: a case that needs it a vocabulary adds `marked("topics")`. */
export const TOPICS_TABLE = "create table os.topics (name text primary key);\n";

/**
 * A vocabulary with a column of its own that draws from a sequence. What a sequence gave is not given back when a
 * transaction is rolled back, and a row that is not written draws nothing: it tells what was sent to the table.
 */
export const KINDS_TABLE = `create table os.kinds (name text primary key, label text not null, row_no serial);\n${marked("kinds")}`;

/** What os.kinds' sequence gave last, as `<number>, given` — `1, not yet given` before its first. */
export const WHAT_THE_KINDS_SEQUENCE_GAVE = "select last_value::text || ', ' || case when is_called then 'given' else 'not yet given' end from os.kinds_row_no_seq";

/** What every event-type case reads back: the table in all its columns, by name. */
export const EVENT_TYPES_BY_NAME = 'select name, description, weight, seen_count from os.event_types order by name collate "C"';
