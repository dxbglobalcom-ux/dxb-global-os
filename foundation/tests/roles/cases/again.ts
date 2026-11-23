import { expect } from "vitest";
import { acquireHostLock, loginConnectionString } from "@dxb-foundation/bench";
import { chainCommand } from "../../chain/fixtures/command.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { loginsSaying } from "../fixtures/bench-command.ts";
import { THE_FOUR, membershipsOf, roleOids, storedPasswords } from "../fixtures/catalogue.ts";
import { changeTheFilesSysid, digested, passwordsInTheFile, readSecretFile, secretFileNow } from "../fixtures/the-logins-file.ts";
import { PASSWORD_REFUSED, asLogin, expectComesInAs, expectTheInstallerComesIn, howRefused } from "../fixtures/tcp-logins.ts";
import { COMMAND_MS, LOOK_MS, type Step, type TheRun } from "../fixtures/the-run.ts";

// Piece 5's SPEC §8 B.11 and B.12: the chain and the install step run again — what they keep, what they mint anew —
// and the step's refusals, each of which leaves every stored password and the file as they were.

/** Each of the four comes in with the address the file gives it, and is itself. */
async function everyLoginComesIn(): Promise<void> {
  for (const role of THE_FOUR) await expectComesInAs(loginConnectionString(role), role);
}

/** Every stored password and the file, as they stand — compared by digest, so that a difference prints no secret. */
async function whatTheStepMustNotTouch(): Promise<{ stored: Record<string, string | null>; file: ReturnType<typeof secretFileNow> }> {
  return { stored: digested(await onTheInstance(storedPasswords)), file: secretFileNow() };
}

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
    const onTheInstallers = (sql: string) => async (): Promise<void> => {
      await onTheInstance((installer) => installer.query(sql));
    };
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
}
