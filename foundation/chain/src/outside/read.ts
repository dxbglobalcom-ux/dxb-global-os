// The inventory (piece 6c's SPEC §4): a whole reading of the catalogue and of what the tables and sequences outside
// the covered schemas hold, each line marked `in` or `out` — read as the snapshot is, in one session and one transaction.
import type { Target } from "../session.ts";
import { readAsTheSnapshotIs } from "../snapshot/read.ts";
import { textHeadedBy } from "../snapshot/text.ts";
import { catalogueLines } from "./catalogues.ts";
import { heldLines } from "./held.ts";
import { INVENTORY_FIRST_LINE } from "./text.ts";

/**
 * The inventory of `target` (SPEC §4.2): read as the snapshot is (6a §4.4) — its session, its transaction, its
 * settings and its covered sets. A read the server refuses, a row it identifies as null, a table the session may not
 * read: each fails the call. A text is whole or there is none.
 */
export function inventoryOf(target: Target): Promise<string> {
  return readAsTheSnapshotIs(target, async (conn, covered) => {
    const lines = await catalogueLines(conn, covered);
    for (const line of await heldLines(conn, covered)) lines.push(line);
    return textHeadedBy(INVENTORY_FIRST_LINE, lines);
  });
}
