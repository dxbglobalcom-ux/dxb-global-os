import { expect } from "vitest";
import { acquireHostLock, loginConnectionString } from "@dxb-foundation/bench";
import { chainCommand } from "../../chain/fixtures/command.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { loginsSaying } from "../fixtures/bench-command.ts";
import { THE_FOUR, membershipsOf, roleOids, storedPasswords } from "../fixtures/catalogue.ts";
import { changeTheFilesSysid, digested, passwordsInTheFile, readSecretFile, secretFileNow } from "../fixtures/the-logins-file.ts";
import { PASSWORD_REFUSED, asLogin, everyLoginComesIn, expectTheInstallerComesIn, howRefused } from "../fixtures/tcp-logins.ts";
import { COMMAND_MS, LOOK_MS, type Step, type TheRun } from "../fixtures/the-run.ts";

// Piece 5's SPEC §8 B.11 and B.12: the chain and the install step run again — what they keep, what they mint anew —
// and the step's refusals, each of which leaves every stored password and the file as they were.

/** Every stored password and the file, as they stand — compared by digest, so that a difference prints no secret. */
async function whatTheStepMustNotTouch(): Promise<{ stored: Record<string, string | null>; file: ReturnType<typeof secretFileNow> }> {
  return { stored: digested(await onTheInstance(storedPasswords)), file: secretFileNow() };
}

/** These statements said by the installer, one after another, on a connection of their own. */
const onTheInstallers =
  (...statements: string[]) =>
  async (): Promise<void> => {
    await onTheInstance(async (installer) => {
      for (const sql of statements) await installer.query(sql);
    });
  };

/** `change` done, `logins` refused as `expected`, nothing it must not touch touched — and `putBack` done whatever happened. */
async function refusedLeavingAllAsItWas(change: () => Promise<void>, putBack: () => Promise<void>, expected: string, code: number): Promise<void> {
  const before = await whatTheStepMustNotTouch();
  try {
    await change();
    await loginsSaying(expected, code, COMMAND_MS);
    expect(await whatTheStepMustNotTouch()).toEqual(before);
  } finally {
    await putBack();
  }
}

export function again(step: Step, run: TheRun): void {
  step("B.11 again: a second chain up → applied=0, the same standing; the five are the same rows and the logins still come in", COMMAND_MS + LOOK_MS, async () => {
    const said = await chainCommand(["up"], COMMAND_MS);
    expect(said.lines.at(-1), `${said.lines.join("\n")}\n${said.stderr.slice(-1_500)}`).toMatch(new RegExp(`^CHAIN_GREEN applied=0 standing=${run.standing} functions=\\d+ reference=\\d+$`));
    expect(said.code).toBe(0);
    expect(await onTheInstance(roleOids)).toEqual(run.oids);
    await everyLoginComesIn();
  });

  step("B.11 again: a second logins keeps the file's passwords — and puts back the one a login changed — and the logins come in", COMMAND_MS + LOOK_MS, async () => {
    const kept = digested(passwordsInTheFile(THE_FOUR));
    // SPEC §9: a login may change its own password; the step's next run puts the file's back.
    await asLogin(loginConnectionString("os_engine"), (engine) => engine.query("alter role os_engine password null"));
    await expectTheInstallerComesIn();
    expect(await howRefused(loginConnectionString("os_engine"))).toBe(PASSWORD_REFUSED);

    await loginsSaying(`LOGINS_SET logins=4 sysid=${run.sysid}`, 0, COMMAND_MS);
    expect(digested(passwordsInTheFile(THE_FOUR))).toEqual(kept);
    await everyLoginComesIn();
  });

  step("B.11 again: with the file's sysid changed to another, logins mints four new passwords — the old are refused, the new come in", COMMAND_MS + LOOK_MS, async () => {
    const old = passwordsInTheFile(THE_FOUR);
    changeTheFilesSysid(`${BigInt(run.sysid) + 1n}`);

    await loginsSaying(`LOGINS_SET logins=4 sysid=${run.sysid}`, 0, COMMAND_MS);
    expect(readSecretFile().sysid).toBe(run.sysid);
    const minted = passwordsInTheFile(THE_FOUR);
    expect(THE_FOUR.map((role) => `${role} new=${minted.get(role) !== old.get(role)}`)).toEqual(THE_FOUR.map((role) => `${role} new=true`));
    await everyLoginComesIn();
    const withTheOld: string[] = [];
    for (const role of THE_FOUR) withTheOld.push(`${role} ${await howRefused({ user: role, password: old.get(role) })}`);
    expect(withTheOld).toEqual(THE_FOUR.map((role) => `${role} ${PASSWORD_REFUSED}`));
  });

  step("B.12 the step's refusals — createdb on os_intake, pg_monitor to os_reader, the host lock held by another — each leaving every stored password and the file as they were, each put back", COMMAND_MS * 3 + LOOK_MS, async () => {
    await refusedLeavingAllAsItWas(onTheInstallers("alter role os_intake createdb"), onTheInstallers("alter role os_intake nocreatedb"), "LOGINS_REFUSED os_intake createdb", 6);
    await refusedLeavingAllAsItWas(onTheInstallers("grant pg_monitor to os_reader"), onTheInstallers("revoke pg_monitor from os_reader"), "LOGINS_REFUSED os_reader member", 6);

    let lock: ReturnType<typeof acquireHostLock> | undefined;
    const holdTheLock = async (): Promise<void> => {
      lock = acquireHostLock();
    };
    const letItGo = async (): Promise<void> => lock?.release();
    await refusedLeavingAllAsItWas(holdTheLock, letItGo, "LOCK_REFUSED", 2);

    // Put back: the step is green again on the roles as the chain made them.
    await onTheInstance(async (installer) => {
      const createdb = await installer.query("select rolcreatedb from pg_catalog.pg_roles where rolname = 'os_intake'");
      expect(createdb.rows).toEqual([{ rolcreatedb: false }]);
      expect(await membershipsOf(installer, "os_reader")).toEqual([]);
    });
    await loginsSaying(`LOGINS_SET logins=4 sysid=${run.sysid}`, 0, COMMAND_MS);
    await everyLoginComesIn();
  });

  step("B.12 the order of SPEC §6 step 2, pinned: a login with two faults says its first reason — os_intake given createdb and made a member of pg_monitor → os_intake createdb; two faulty logins say the first login, not the first reason — os_executor a member, os_reader given createdb → os_executor member", COMMAND_MS * 3 + LOOK_MS, async () => {
    await refusedLeavingAllAsItWas(
      onTheInstallers("alter role os_intake createdb", "grant pg_monitor to os_intake"),
      onTheInstallers("revoke pg_monitor from os_intake", "alter role os_intake nocreatedb"),
      "LOGINS_REFUSED os_intake createdb",
      6,
    );
    // The earlier login holds the later reason: a step that sorted by reason would answer os_reader createdb.
    await refusedLeavingAllAsItWas(
      onTheInstallers("grant pg_monitor to os_executor", "alter role os_reader createdb"),
      onTheInstallers("alter role os_reader nocreatedb", "revoke pg_monitor from os_executor"),
      "LOGINS_REFUSED os_executor member",
      6,
    );

    await onTheInstance(async (installer) => {
      const createdb = `select rolname::text || ' ' || rolcreatedb from pg_catalog.pg_roles where rolname = any($1::text[]) order by rolname::text collate "C"`;
      expect((await installer.query({ text: createdb, values: [[...THE_FOUR]], rowMode: "array" })).rows.flat()).toEqual(THE_FOUR.map((role) => `${role} false`));
      for (const role of THE_FOUR) expect(`${role} ${(await membershipsOf(installer, role)).join()}`).toBe(`${role} `);
    });
    await loginsSaying(`LOGINS_SET logins=4 sysid=${run.sysid}`, 0, COMMAND_MS);
    await everyLoginComesIn();
  });
}
