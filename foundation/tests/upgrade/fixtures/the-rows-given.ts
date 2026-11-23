// The rows given (piece 6b's SPEC §6): fixtures/rows.sql, run by the bench's superuser — each statement alone,
// through 6a's asTheSuperuser, which first sees the container to be the bench's database container by its name and
// its project label (snapshot/fixtures/superuser.ts). The file holds one statement a line; a line that begins `--` is
// a comment.
import { readFileSync } from "node:fs";
import { asTheSuperuser } from "../../snapshot/fixtures/superuser.ts";
import { ROWS_SQL } from "./the-roots.ts";

/** The statements of rows.sql, in the file's order: every line that is neither empty nor a comment, each ending `;`. */
export function statementsOfTheRows(): string[] {
  const statements = readFileSync(ROWS_SQL, "utf8")
    .split("\n")
    .filter((line) => line.trim() !== "" && !line.startsWith("--"));
  for (const statement of statements) if (!statement.endsWith(";")) throw new Error(`rows.sql: not one statement on its line: ${statement}`);
  return statements;
}

/** Every statement of rows.sql, one call each, in order; the first the server refuses stops the rest. */
export async function giveTheRows(): Promise<void> {
  for (const statement of statementsOfTheRows()) await asTheSuperuser(statement);
}
