import { loginConnectionString } from "@dxb-foundation/bench";
import { chainCommand } from "../../chain/fixtures/command.ts";
import { asLogin } from "../../roles/fixtures/tcp-logins.ts";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { expectChainSaid, linesOf } from "../fixtures/changes.ts";
import { asTheSuperuser } from "../fixtures/superuser.ts";
import { EXPECTED_REAL } from "../fixtures/the-chains.ts";
import { COMMAND_MS, expectEqual, expectRedBy } from "../fixtures/the-check.ts";

// SPEC §6 B.4 and B.5, on the real chain: what a login gives itself, and an owner the installer cannot change. The
// chain's own verdict says nothing of either (SPEC §8); the check names each line.

/** Statements said by os_reader itself, over TCP, with the password the install step gave it. */
const asTheReader = (...statements: string[]): Promise<void> =>
  asLogin(loginConnectionString("os_reader"), async (client) => {
    for (const statement of statements) await client.query(statement);
  });

export function whatTheChainDoesNotSee(step: Step): void {
  step("B.4 a login gives itself settings — core and dotted, for all databases and in this one: red by exactly those role-setting lines, a dotted value <hidden>; reset: equal", 4 * COMMAND_MS, async () => {
    // A dotted setting a login may give itself is one a loaded library defines as the user's (measured: a bare
    // placeholder such as app.x is refused to a login, 42501): plpgsql's, once plpgsql is loaded in the session.
    await asTheReader(
      "do $$ begin end $$",
      "alter role os_reader set work_mem = '7MB'",
      "alter role os_reader set plpgsql.print_strict_params = 'on'",
      "alter role os_reader in database postgres set statement_timeout = '5s'",
      "alter role os_reader in database postgres set plpgsql.extra_warnings = 'shadowed_variables'",
    );
    try {
      await expectRedBy(EXPECTED_REAL, {
        actualOnly: [
          "role-setting os_reader in * plpgsql.print_strict_params=<hidden>",
          "role-setting os_reader in * work_mem=7MB",
          "role-setting os_reader in postgres plpgsql.extra_warnings=<hidden>",
          "role-setting os_reader in postgres statement_timeout=5s",
        ],
      });
    } finally {
      await asTheReader("alter role os_reader reset all", "alter role os_reader in database postgres reset all");
    }
    await expectEqual(EXPECTED_REAL, linesOf(EXPECTED_REAL));
  });

  step("B.5 os given to another owner by the bench's superuser: chain up is still CHAIN_GREEN — the gap, pinned — and the check is red by the schema's owner and its default grants; put back: equal", 4 * COMMAND_MS, async () => {
    await asTheSuperuser("alter schema os owner to postgres");
    try {
      expectChainSaid(await chainCommand(["up"], COMMAND_MS), "CHAIN_GREEN applied=0 standing=2 functions=0 reference=0", 0);
      await expectRedBy(EXPECTED_REAL, {
        expectedOnly: [
          "schema os owner os_owner",
          "grant schema os to os_owner CREATE option f by os_owner default",
          "grant schema os to os_owner USAGE option f by os_owner default",
        ],
        actualOnly: [
          "schema os owner postgres",
          "grant schema os to postgres CREATE option f by postgres default",
          "grant schema os to postgres USAGE option f by postgres default",
        ],
      });
    } finally {
      await asTheSuperuser("alter schema os owner to os_owner");
    }
    await expectEqual(EXPECTED_REAL, linesOf(EXPECTED_REAL));
  });
}
