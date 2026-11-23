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

/** The vocabulary most reference cases use: three columns a file owns, and one that is the table's own. */
export const EVENT_TYPES_TABLE = [
  "create table os.event_types (",
  "  name text primary key,",
  "  description text not null,",
  "  weight integer not null,",
  "  seen_count integer not null default 0",
  ");",
  "",
].join("\n");

type EventType = { name: string; description: string; weight: number };

export const OPENED: EventType = { name: "job.opened", description: "a job was opened", weight: 1 };
export const CLOSED: EventType = { name: "job.closed", description: "a job was closed", weight: 2 };
export const FAILED: EventType = { name: "job.failed", description: "a job failed", weight: 3 };

/** A reference file's text: these rows as a JSON array of objects, one row a line. */
export const fileOf = (...rows: readonly object[]): string => (rows.length === 0 ? "[]\n" : `[\n${rows.map((row) => `  ${JSON.stringify(row)}`).join(",\n")}\n]\n`);

/** What every event-type case reads back: the table in all its columns, by name. */
export const EVENT_TYPES_BY_NAME = 'select name, description, weight, seen_count from os.event_types order by name collate "C"';
