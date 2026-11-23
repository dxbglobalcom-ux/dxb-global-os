import { randomBytes } from "node:crypto";
import { lstatSync } from "node:fs";
import { dirname } from "node:path";
import { expect } from "vitest";
import { defaultLoginsPath, loginConnectionString, scramVerifier } from "@dxb-foundation/bench";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { logins, saysNothingSecret, tailOf } from "../fixtures/bench-command.ts";
import { THE_FOUR, VERIFIER, storedPasswords } from "../fixtures/catalogue.ts";
import { AS_THE_STEP_WRITES_IT, MINTED_FORM, aPasswordOfTheMintedForm, howTheFileStands, passwordsIfReadable, passwordsInTheFile, readSecretFile, secretFilePath } from "../fixtures/the-logins-file.ts";
import { linesHolding, openTheLogsWindow, theLogsWindow } from "../fixtures/server-log.ts";
import {
  NOT_PERMITTED_TO_LOG_IN,
  PASSWORD_REFUSED,
  expectComesInAs,
  expectEveryWayRefused,
  expectTheInstallerComesIn,
  howRefused,
  withAnotherPassword,
} from "../fixtures/tcp-logins.ts";
import { COMMAND_MS, LOOK_MS, type Step, type TheRun } from "../fixtures/the-run.ts";

// Piece 5's SPEC §8 B.6–B.8: the logins refused before the install step, the step itself — what it said, the file it
// wrote, what the server stores and what its log holds — and the logins coming in after it.

/** A guess as long as a minted password: 32 random bytes, base64url. */
const aGuess = aPasswordOfTheMintedForm;

/** The four stored verifiers by role; a role whose stored password is none answers an empty text. */
async function storedVerifiers(): Promise<Map<string, string>> {
  const stored = await onTheInstance(storedPasswords);
  return new Map(THE_FOUR.map((role) => [role, stored.get(role) ?? ""]));
}

/**
 * SPEC §11 item 8: with none or a wrong password a LOGIN role is refused as NOLOGIN is (28P01, C5); only a right one
 * shows the owner may not log in. The owner is given, as the install step gives one, a verifier of a throwaway
 * password — through a parameter and a `do` block, so that no statement's text carries it to the log — and has none
 * again after the case. Here, after B.7 read its log: no later window that is searched for a verifier holds this second.
 */
async function theOwnerRefusedWithItsOwnPassword(): Promise<void> {
  const password = aPasswordOfTheMintedForm();
  // A failure of its own `alter role` is said without the statement: the error's context would carry the verifier (§3).
  const giveTheOwner = `do $o$ begin execute pg_catalog.format('alter role os_owner password %L', pg_catalog.current_setting('roles_test.verifier'));
    exception when others then raise exception using errcode = sqlstate, message = 'the case could not give os_owner a verifier'; end $o$`;
  await onTheInstance(async (installer) => {
    await installer.query("begin");
    await installer.query("select pg_catalog.set_config('roles_test.verifier', $1, true)", [scramVerifier(password, randomBytes(16))]);
    await installer.query(giveTheOwner);
    await installer.query("commit");
  });
  try {
    expect(await howRefused({ user: "os_owner", password })).toBe(NOT_PERMITTED_TO_LOG_IN);
    expect(await howRefused({ user: "os_owner", password: aGuess() })).toBe(PASSWORD_REFUSED);
  } finally {
    await onTheInstance((installer) => installer.query("alter role os_owner password null"));
  }
  const stored = await onTheInstance(storedPasswords);
  expect(stored.has("os_owner") && stored.get("os_owner") === null).toBe(true);
}

export function theInstallStep(step: Step, run: TheRun): void {
  step("B.6 before the install step, each of the four over TCP — no password, an empty one, a guessed one — is refused as an authentication failure; so is os_owner", LOOK_MS, async () => {
    await expectTheInstallerComesIn();
    await expectEveryWayRefused([...THE_FOUR, "os_owner"], aGuess());
  });

  step("B.7 the install step: logins → LOGINS_SET logins=4 sysid=<the instance's>, exit 0, nothing secret said; the file, the stored verifiers and the server's log as SPEC §8 says", COMMAND_MS + LOOK_MS, async () => {
    // A line of the case's own written to the log before the step and another after it: the log read is seen to hold the window.
    const window = await openTheLogsWindow();

    const said = await logins(COMMAND_MS);
    const verifiers = await storedVerifiers();
    const passwords = passwordsIfReadable(THE_FOUR);
    expect(saysNothingSecret(said, passwords, verifiers.values())).toBe(true);
    expect(said.lastLine, tailOf(said)).toBe(`LOGINS_SET logins=4 sysid=${run.sysid}`);
    expect(said.code).toBe(0);

    // The file: in the state directory, a regular file, mode 600, this user's; this instance's; the four, minted.
    expect(defaultLoginsPath()).toBe(secretFilePath());
    expect(howTheFileStands()).toBe(AS_THE_STEP_WRITES_IT);
    expect((lstatSync(dirname(secretFilePath())).mode & 0o777).toString(8)).toBe("700");
    const held = readSecretFile();
    expect(Object.keys(held).sort()).toEqual(["logins", "sysid"]);
    expect(held.sysid).toBe(run.sysid);
    expect(Object.keys(held.logins).sort()).toEqual([...THE_FOUR]);
    expect(passwords).toHaveLength(4);
    expect(new Set(passwords).size).toBe(4);
    expect(passwords.map((password) => MINTED_FORM.test(password))).toEqual([true, true, true, true]);

    // What the server stores: a verifier of SPEC §6's form for each login, a salt of 16 bytes each, none for the owner.
    const forms = THE_FOUR.map((role) => {
      const parts = VERIFIER.exec(verifiers.get(role) ?? "");
      const [salt, storedKey, serverKey] = (parts?.slice(1) ?? []).map((part) => Buffer.from(part, "base64").length);
      return `${role} ${parts !== null} salt=${salt} keys=${storedKey},${serverKey}`;
    });
    expect(forms).toEqual(THE_FOUR.map((role) => `${role} true salt=16 keys=32,32`));
    expect(new Set([...verifiers.values()].map((verifier) => VERIFIER.exec(verifier)?.[1])).size).toBe(4);
    // Asked as a boolean: were the owner wrongly given a verifier, a failing expectation would print it.
    const stored = await onTheInstance(storedPasswords);
    expect(stored.has("os_owner") && stored.get("os_owner") === null).toBe(true);

    // The log's window around the step: both of the case's own lines are there; no verifier's head and no password is.
    const lines = await theLogsWindow(window);
    expect(linesHolding(lines, [...verifiers.values()].map((verifier) => verifier.slice(0, 40)))).toBe(0);
    expect(linesHolding(lines, passwords)).toBe(0);
  });

  step("B.8 after it: each login comes in with loginConnectionString(<role>) on the bench's address and is itself; a wrong password is still refused; os_owner still is — with a right password too, refused as one that may not log in (28000)", LOOK_MS, async () => {
    const passwords = passwordsInTheFile(THE_FOUR);
    for (const role of THE_FOUR) {
      const address = loginConnectionString(role);
      const url = new URL(address);
      // Spelled, not computed: the bench's constants, read once (SPEC §11 item 8).
      expect(`${url.protocol}//${url.host}${url.pathname} ${decodeURIComponent(url.username)}`).toBe(`postgresql://127.0.0.1:54522/postgres ${role}`);
      expect(decodeURIComponent(url.password) === passwords.get(role)).toBe(true);
      await expectComesInAs(address, role);
      expect(`${role} ${await howRefused(withAnotherPassword(address, aGuess()))}`).toBe(`${role} ${PASSWORD_REFUSED}`);
    }
    await expectTheInstallerComesIn();
    await expectEveryWayRefused(["os_owner"], aGuess());
    const withTheirs: string[] = [];
    for (const password of passwords.values()) withTheirs.push(await howRefused({ user: "os_owner", password }));
    expect(withTheirs).toEqual([PASSWORD_REFUSED, PASSWORD_REFUSED, PASSWORD_REFUSED, PASSWORD_REFUSED]);
    await theOwnerRefusedWithItsOwnPassword();
  });
}
