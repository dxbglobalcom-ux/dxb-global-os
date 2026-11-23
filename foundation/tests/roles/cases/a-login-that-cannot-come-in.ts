import { expect } from "vitest";
import { loginConnectionString } from "@dxb-foundation/bench";
import { valueOf } from "../../chain/fixtures/looking.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { loginsSaying } from "../fixtures/bench-command.ts";
import { THE_FOUR, isTheVerifierOf, storedPasswords } from "../fixtures/catalogue.ts";
import { TOO_MANY_CONNECTIONS, everyLoginComesIn, expectComesInAs, expectTheInstallerComesIn, howRefused } from "../fixtures/tcp-logins.ts";
import { digested, passwordsInTheFile, secretFileNow } from "../fixtures/the-logins-file.ts";
import { COMMAND_MS, LOOK_MS, type Step, type TheRun } from "../fixtures/the-run.ts";

// Piece 5's SPEC §11 item 1: `LOGINS_SET` is said only after each login came in. A login the catalogue finds
// faultless that still cannot come in — here a connection limit of 0 — refuses the step after its commit: the file
// and the verifiers stand as the step set them, which is not B.12's "all as it was".

export function aLoginThatCannotComeIn(step: Step, run: TheRun): void {
  step("§11 item 1: connection limit 0 on os_executor → logins → LOGINS_REFUSED os_executor cannot-log-in, exit 6; the file kept, the verifiers the step's new ones of it; put back, logins green and all four come in", COMMAND_MS * 2 + LOOK_MS, async () => {
    const fileBefore = secretFileNow();
    const storedBefore = digested(await onTheInstance(storedPasswords));
    await onTheInstance((installer) => installer.query("alter role os_executor connection limit 0"));
    try {
      await loginsSaying("LOGINS_REFUSED os_executor cannot-log-in", 6, COMMAND_MS);

      // The file named this instance and held all four: kept, not written. The step set a verifier of each of its
      // passwords — a new salt each — and committed, before it tried the logins.
      expect(secretFileNow()).toEqual(fileBefore);
      const passwords = passwordsInTheFile(THE_FOUR);
      const stored = await onTheInstance(storedPasswords);
      const storedNow = digested(stored);
      const set = THE_FOUR.map((role) => `${role} new=${storedNow[role] !== storedBefore[role]} of-the-file=${isTheVerifierOf(stored.get(role), passwords.get(role))}`);
      expect(set).toEqual(THE_FOUR.map((role) => `${role} new=true of-the-file=true`));

      // The refusal is the limit's: os_executor's own password is right, and the server answers 53300 to it; the
      // other three come in.
      await expectTheInstallerComesIn();
      expect(await howRefused(loginConnectionString("os_executor"))).toBe(TOO_MANY_CONNECTIONS);
      for (const role of THE_FOUR.filter((login) => login !== "os_executor")) await expectComesInAs(loginConnectionString(role), role);
    } finally {
      await onTheInstance((installer) => installer.query("alter role os_executor connection limit -1"));
    }
    expect(await onTheInstance((installer) => valueOf(installer, "select rolconnlimit from pg_catalog.pg_roles where rolname = 'os_executor'"))).toBe(-1);
    await loginsSaying(`LOGINS_SET logins=4 sysid=${run.sysid}`, 0, COMMAND_MS);
    await everyLoginComesIn();
  });
}
