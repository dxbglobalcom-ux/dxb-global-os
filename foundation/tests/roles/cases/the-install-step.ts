import { randomBytes } from "node:crypto";
import { lstatSync } from "node:fs";
import { userInfo } from "node:os";
import { dirname } from "node:path";
import { expect } from "vitest";
import { connectionString, defaultLoginsPath, loginConnectionString } from "@dxb-foundation/bench";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { holdsNoneOf, logins, tailOf } from "../fixtures/bench-command.ts";
import { THE_FOUR, VERIFIER, partsOf, storedPasswords } from "../fixtures/catalogue.ts";
import { passwordsIfReadable, passwordsInTheFile, readSecretFile, secretFilePath } from "../fixtures/the-logins-file.ts";
import { linesHolding, serverLogSince } from "../fixtures/server-log.ts";
import { PASSWORD_REFUSED, expectComesInAs, expectEveryWayRefused, expectTheInstallerComesIn, howRefused, withAnotherPassword } from "../fixtures/tcp-logins.ts";
import { COMMAND_MS, LOOK_MS, type Step, type TheRun } from "../fixtures/the-run.ts";

// Piece 5's SPEC §8 B.6–B.8: the logins refused before the install step, the step itself — what it said, the file it
// wrote, what the server stores and what its log holds — and the logins coming in after it.

/** A guess as long as a minted password: 32 random bytes, base64url. */
const aGuess = (): string => randomBytes(32).toString("base64url");

/** The four stored verifiers by role; a role whose stored password is none answers an empty text. */
async function storedVerifiers(): Promise<Map<string, string>> {
  const stored = await onTheInstance(storedPasswords);
  return new Map(THE_FOUR.map((role) => [role, stored.get(role) ?? ""]));
}

export function theInstallStep(step: Step, run: TheRun): void {
  step("B.6 before the install step, each of the four over TCP — no password, an empty one, a guessed one — is refused as an authentication failure; so is os_owner", LOOK_MS, async () => {
    await expectTheInstallerComesIn();
    await expectEveryWayRefused([...THE_FOUR, "os_owner"], aGuess());
  });

  step("B.7 the install step: logins → LOGINS_SET logins=4 sysid=<the instance's>, exit 0, nothing secret said; the file, the stored verifiers and the server's log as SPEC §8 says", COMMAND_MS + LOOK_MS, async () => {
    // A line of the case's own, written to the log before the step: the log read afterwards is seen to hold the step's window.
    const marker = `roles-test-log-window-${randomBytes(8).toString("hex")}`;
    const since = new Date(Date.now() - 1_000);
    await onTheInstance((installer) => installer.query(`do $m$ begin raise log '${marker}'; end $m$`));

    const said = await logins(COMMAND_MS);
    const verifiers = await storedVerifiers();
    const passwords = passwordsIfReadable(THE_FOUR);
    expect(holdsNoneOf(said, [...passwords, ...partsOf(verifiers.values())])).toBe(true);
    expect(holdsNoneOf(said, ["SCRAM-SHA-256$"])).toBe(true);
    expect(said.lastLine, tailOf(said)).toBe(`LOGINS_SET logins=4 sysid=${run.sysid}`);
    expect(said.code).toBe(0);

    // The file: in the state directory, a regular file, mode 600, this user's; this instance's; the four, minted.
    expect(defaultLoginsPath()).toBe(secretFilePath());
    const file = lstatSync(secretFilePath());
    expect(file.isFile()).toBe(true);
    expect((file.mode & 0o777).toString(8)).toBe("600");
    expect(file.uid).toBe(userInfo().uid);
    expect((lstatSync(dirname(secretFilePath())).mode & 0o777).toString(8)).toBe("700");
    const held = readSecretFile();
    expect(Object.keys(held).sort()).toEqual(["logins", "sysid"]);
    expect(held.sysid).toBe(run.sysid);
    expect(Object.keys(held.logins).sort()).toEqual([...THE_FOUR]);
    expect(passwords).toHaveLength(4);
    expect(new Set(passwords).size).toBe(4);
    expect(passwords.map((password) => /^[A-Za-z0-9_-]{43,}$/.test(password))).toEqual([true, true, true, true]);

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

    // The log since the step began: the case's own line is there; no verifier's head and no password is.
    const lines = await serverLogSince(since);
    expect(linesHolding(lines, [marker])).toBeGreaterThan(0);
    expect(linesHolding(lines, [...verifiers.values()].map((verifier) => verifier.slice(0, 40)))).toBe(0);
    expect(linesHolding(lines, passwords)).toBe(0);
  });

  step("B.8 after it: each login comes in with loginConnectionString(<role>) on the bench's address and is itself; a wrong password is still refused; os_owner still is", LOOK_MS, async () => {
    const bench = new URL(connectionString());
    const passwords = passwordsInTheFile(THE_FOUR);
    for (const role of THE_FOUR) {
      const address = loginConnectionString(role);
      const url = new URL(address);
      expect(`${url.host}${url.pathname} ${decodeURIComponent(url.username)}`).toBe(`${bench.host}${bench.pathname} ${role}`);
      expect(decodeURIComponent(url.password) === passwords.get(role)).toBe(true);
      await expectComesInAs(address, role);
      expect(`${role} ${await howRefused(withAnotherPassword(address, aGuess()))}`).toBe(`${role} ${PASSWORD_REFUSED}`);
    }
    await expectTheInstallerComesIn();
    await expectEveryWayRefused(["os_owner"], aGuess());
    const withTheirs: string[] = [];
    for (const password of passwords.values()) withTheirs.push(await howRefused({ user: "os_owner", password }));
    expect(withTheirs).toEqual([PASSWORD_REFUSED, PASSWORD_REFUSED, PASSWORD_REFUSED, PASSWORD_REFUSED]);
  });
}
