// The fixture files whose hash a test spells. Each SHA-256 was computed once, by
// `sha256sum` over the very bytes of `text`, and stands here as a literal beside
// it: no test computes the value it expects the runner to have computed.

export type FixtureFile = { name: string; text: string; sha256: string };

/** A file's text: each line ended by one newline. */
const lines = (...written: string[]): string => written.map((line) => `${line}\n`).join("");

export const PEOPLE: FixtureFile = {
  name: "0001-people.sql",
  text: lines("create table public.people (", "  id integer primary key,", "  name text not null", ");"),
  sha256: "59dd47a3654ce3f928fb9e5976654035fdf2ef4185282c4b5d2321b38018a82e",
};

export const PLACES: FixtureFile = {
  name: "0002-places.sql",
  text: lines("create table public.places (", "  id integer primary key,", "  name text not null", ");"),
  sha256: "cc440621aa15b8bbdf33746beb77b8178b05b61e51907fda286aa6e370c8d213",
};

// Needs both tables before it: applied out of order, it fails.
export const VISITS: FixtureFile = {
  name: "0003-visits.sql",
  text: lines(
    "create table public.visits (",
    "  person integer not null references public.people (id),",
    "  place integer not null references public.places (id),",
    "  primary key (person, place)",
    ");",
  ),
  sha256: "4cdc2dc5979465c21382a17798a0342e160239bcd4829d8ca0b1e2e7faca3414",
};

// An upgrade of a database that holds people already: it alters their table and adds another.
export const BORN_AND_PETS: FixtureFile = {
  name: "0003-born-and-pets.sql",
  text: lines(
    "alter table public.people add column born integer;",
    "create table public.pets (",
    "  id integer primary key,",
    "  owner integer not null references public.people (id)",
    ");",
  ),
  sha256: "c6dab46bc1d29ad6412b06e3d855ef3ca35fa06c42db0f9b261196d1eb7af405",
};

// Its comment is not ASCII: the hash is of the file's bytes, the text is those bytes read as UTF-8.
export const REMARKS: FixtureFile = {
  name: "0010-remarks.sql",
  text: lines("-- déjà vu — what a visitor remarked", "create table public.remarks (remark text not null);"),
  sha256: "1b8f7af285389e82d2e2bc954566fc915380d8e4a0c097c83d64d0e670d7a668",
};

/** The files of a chain as `chainRoot` takes them: name → text. */
export const chainOf = (...files: FixtureFile[]): Record<string, string> =>
  Object.fromEntries(files.map((file) => [file.name, file.text]));
