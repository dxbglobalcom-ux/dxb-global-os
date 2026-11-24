import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect } from "vitest";
import { chainCommand } from "../../chain/fixtures/command.ts";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { asTheInstaller, expectChainSaid } from "../../snapshot/fixtures/changes.ts";
import {
  COMMAND_MS, EXPECTED_FURTHER, expectOutsideEqual, expectOutsideRed, inventoryPrinted, keptAside, printedBy, rootFurther,
} from "../fixtures/the-outside.ts";
import type { TheRun } from "./the-build.ts";

// Piece 6c's SPEC §6 B.7 and §9: what the outside text does not see, pinned — a dotted setting's value changed alone
// (its value enters no digest), and a change made and undone inside one build (net effect only).

/** A schema file the case writes into a root of its own: it makes a table and a role outside os and drops both. */
const MADE_AND_UNDONE_FILE = "0007-made-and-undone.sql";
const MADE_AND_UNDONE = [
  "-- Made and undone inside one build (piece 6c, SPEC §6 B.7): nothing of it stands when the build ends.",
  "create table public.made_and_undone (id integer primary key, note text);",
  "create role made_and_undone nologin;",
  "drop role made_and_undone;",
  "drop table public.made_and_undone;",
  "",
].join("\n");

export function pinnedLimits(step: Step, run: TheRun): void {
  step("B.7 a dotted setting's value changed alone is not seen: the row seen when it is made, then nothing for its value, then seen for a core setting beside it; reset → equal", 4 * COMMAND_MS, async () => {
    try {
      await asTheInstaller("alter role further_role set plpgsql.extra_warnings = 'shadowed_variables'");
      await expectOutsideRed(run.built, run.nothing, ["+ added row pg_db_role_setting setting for further_role in *", "OUTSIDE_RED expected_only=0 database_only=1"]);
      const withTheSetting = keptAside("with-the-setting.inventory.txt", await inventoryPrinted());
      await asTheInstaller("alter role further_role set plpgsql.extra_warnings = 'all'");
      const printed = await printedBy(["outside", "--before", withTheSetting]);
      expect(printed.stdout, printed.stderr.slice(-1_500)).toBe("outside-format 1\n");
      expect(printed.code).toBe(0);
      // The instrument bites on the same row: a core setting beside it is seen.
      await asTheInstaller("alter role further_role set work_mem = '5MB'");
      await expectOutsideRed(withTheSetting, run.nothing, ["+ changed row pg_db_role_setting setting for further_role in *", "OUTSIDE_RED expected_only=0 database_only=1"]);
    } finally {
      await asTheInstaller("alter role further_role reset all");
    }
    await expectOutsideEqual(run.built, run.nothing);
    await expectOutsideEqual(run.fresh, EXPECTED_FURTHER);
  });

  step("B.7 a change made and undone inside one build is not seen: chain up --root <B, 0006 and a file that makes a table and a role outside and drops both> → CHAIN_GREEN; equal against the built inventory and against the fresh one", 4 * COMMAND_MS, async () => {
    const root = rootFurther();
    writeFileSync(join(root, "schema", MADE_AND_UNDONE_FILE), MADE_AND_UNDONE);
    expectChainSaid(await chainCommand(["up", "--root", root], COMMAND_MS), "CHAIN_GREEN applied=1 standing=7 functions=3 reference=1", 0);
    await expectOutsideEqual(run.built, run.nothing);
    await expectOutsideEqual(run.fresh, EXPECTED_FURTHER);
  });
}
