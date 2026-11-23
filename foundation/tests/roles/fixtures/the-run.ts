// What the steps of the roles module hand on to the steps after them: each is written by the step that learns it,
// and read by later steps only — a step that failed stops every later one (bench/fixtures/ordered-steps.ts).
import { fileURLToPath } from "node:url";
import type { Step } from "../../bench/fixtures/ordered-steps.ts";

export type { Step };

/** The repository's own chain: `db/`, found from this file's place, never from the working directory. */
export const REAL_ROOT = fileURLToPath(new URL("../../../../db/", import.meta.url));

export type TheRun = {
  /** The instance's cluster identifier, as `fresh` said it and the server answers it. */
  sysid: string;
  /** The installer: the login of the bench's own address, as the server names it. */
  installer: string;
  /** The schema rows the real chain left standing (B.2). */
  standing: number;
  /** The five roles' oids as the chain made them (B.3). */
  oids: Record<string, string>;
};

export const aNewRun = (): TheRun => ({ sysid: "", installer: "", standing: -1, oids: {} });

// Measured by the lead: a make takes about 55 s, the old chain inside it 22 s; a destroy about a quarter of a minute.
export const MAKE_MS = 180_000;
export const DESTROY_MS = 60_000;
export const COMMAND_MS = 60_000;
export const LOOK_MS = 30_000;
