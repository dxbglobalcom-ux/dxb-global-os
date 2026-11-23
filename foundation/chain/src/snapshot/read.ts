// The snapshot (piece 6a's SPEC §4): one text that says what the database is, read from the catalogue in one
// session and one transaction.
import type { Client } from "pg";
import { sessionsOn } from "../session.ts";
import type { Target } from "../session.ts";
import { grantLines } from "./grants.ts";
import { objectLines } from "./objects.ts";
import { outsideLines } from "./outside.ts";
import { referenceAndLedgerLines } from "./reference-and-ledger.ts";
import { relationPartLines } from "./relation-parts.ts";
import { relationLines } from "./relations.ts";
import { roleLines } from "./roles.ts";
import { routineLines } from "./routines.ts";
import { coveredBy } from "./sql.ts";
import type { Covered } from "./sql.ts";
import { textOf } from "./text.ts";
import { typeLines } from "./types.ts";

// One snapshot of the catalogue, and nothing written in it: the server refuses every write of a read-only
// transaction (SPEC §4.4; the statements this reader sends are recorded by a case — §11.1 row 9).
const BEGIN = "start transaction isolation level repeatable read, read only";

// Said before the first read, for this transaction only, whatever the session said (SPEC §3 fact 2, §4.4): each
// changes a catalogue's deparse or a float's text. The empty search_path makes every name the server spells carry
// its schema. Row security off: a read row security would filter is refused, not answered with fewer rows — a text
// is whole or there is none (§4.4). And the client encoding UTF-8 (§11.1 row 6): the text is UTF-8 whatever
// encoding the session asked for, so a name or a comment outside ASCII reads as the same bytes.
const ITS_OWN_SETTINGS = [
  "set local search_path = ''",
  "set local extra_float_digits = 3",
  "set local timezone = 'UTC'",
  "set local datestyle = 'ISO, YMD'",
  "set local intervalstyle = 'postgres'",
  "set local bytea_output = 'hex'",
  "set local quote_all_identifiers = off",
  "set local standard_conforming_strings = on",
  "set local row_security = off",
  "set local client_encoding = 'UTF8'",
];

/** The readers, subject by subject: each answers its lines, unescaped and in no order. */
const READERS: readonly ((conn: Client, covered: Covered) => Promise<string[]>)[] = [
  roleLines,
  relationLines,
  relationPartLines,
  routineLines,
  typeLines,
  grantLines,
  objectLines,
  outsideLines,
  referenceAndLedgerLines,
];

/**
 * The snapshot of `target` (SPEC §4): one session, through the bench's guard as every session of the chain's; one
 * transaction, `repeatable read read only`, its own settings first; as whoever the target logs in — no `set role` —
 * and with no advisory lock. A read the server refuses is thrown, never a shorter text.
 */
export function snapshotOf(target: Target): Promise<string> {
  return sessionsOn(target)(async (conn) => {
    await conn.query(BEGIN);
    try {
      for (const setting of ITS_OWN_SETTINGS) await conn.query(setting);
      const covered = await coveredBy(conn);
      const lines: string[] = [];
      for (const read of READERS) lines.push(...(await read(conn, covered)));
      return textOf(lines);
    } finally {
      // Nothing to keep: the transaction wrote nothing. A rollback that fails leaves a session about to be closed.
      await conn.query("rollback").catch(() => undefined);
    }
  });
}
