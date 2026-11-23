import { chmodSync, lstatSync, mkdtempSync, readFileSync, readlinkSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect } from "vitest";
import { loginsSaying } from "../fixtures/bench-command.ts";
import { THE_FOUR } from "../fixtures/catalogue.ts";
import { PASSWORD_REFUSED, everyLoginComesIn, expectTheInstallerComesIn, howRefused } from "../fixtures/tcp-logins.ts";
import {
  AS_THE_STEP_WRITES_IT,
  MINTED_FORM,
  aPasswordOfTheMintedForm,
  howTheFileStands,
  passwordsInTheFile,
  rewriteTheFile,
  secretFilePath,
  secretFileNow,
  standingAt,
} from "../fixtures/the-logins-file.ts";
import { COMMAND_MS, LOOK_MS, type Step, type TheRun } from "../fixtures/the-run.ts";

// Piece 5's SPEC §11 item 2 on the bench: a kept file is a file the step could have written. One it could not have —
// of another mode, a link in its place, two logins holding one password, a password of another form — does not
// stand: `logins` mints four and replaces it, and every password that lay in it is refused afterwards.

/** What a case did to the file, and how it is put back when the step did not replace it: by the identity it changed. */
type Changed = { putBack: () => void };

/**
 * The file as it stands made into something the step could not have written (`change`), then `logins`: green, the
 * path a regular file of mode 600 again, four new passwords of the minted form — none that lay in the file before the
 * change or after it — the old refused and the new come in.
 */
async function notKept(run: TheRun, change: () => Changed): Promise<void> {
  const before = passwordsInTheFile(THE_FOUR);
  const { putBack } = change();
  try {
    const met = passwordsInTheFile(THE_FOUR);
    await loginsSaying(`LOGINS_SET logins=4 sysid=${run.sysid}`, 0, COMMAND_MS);
    expect(howTheFileStands()).toBe(AS_THE_STEP_WRITES_IT);

    const minted = passwordsInTheFile(THE_FOUR);
    expect(THE_FOUR.map((role) => MINTED_FORM.test(minted.get(role) ?? ""))).toEqual([true, true, true, true]);
    expect(new Set(minted.values()).size).toBe(4);
    const lay = [...before.values(), ...met.values()];
    expect(THE_FOUR.map((role) => `${role} new=${!lay.includes(minted.get(role) ?? "")}`)).toEqual(THE_FOUR.map((role) => `${role} new=true`));

    await expectTheInstallerComesIn();
    const withTheOld: string[] = [];
    for (const role of THE_FOUR) {
      for (const old of new Set([before.get(role), met.get(role)])) withTheOld.push(`${role} ${await howRefused({ user: role, password: old })}`);
    }
    expect(withTheOld.filter((said) => !said.endsWith(` ${PASSWORD_REFUSED}`))).toEqual([]);
    await everyLoginComesIn();
  } finally {
    putBack();
  }
}

/** The file rewritten by `change`; put back to its bytes when what stands is still what the case wrote. */
function rewritten(change: (logins: Record<string, unknown>) => Record<string, unknown>): Changed {
  const bytes = readFileSync(secretFilePath());
  rewriteTheFile((file) => ({ ...file, logins: change(file.logins) }));
  const written = secretFileNow();
  return {
    putBack: () => {
      if (JSON.stringify(secretFileNow()) === JSON.stringify(written)) writeFileSync(secretFilePath(), bytes);
    },
  };
}

export function aFileNotKept(step: Step, run: TheRun): void {
  step("§11 item 2: the file made mode 644 → logins green, the file 600 again with four new passwords; the old refused, the new come in", COMMAND_MS + LOOK_MS, async () => {
    await notKept(run, () => {
      const { ino } = lstatSync(secretFilePath());
      chmodSync(secretFilePath(), 0o644);
      return {
        putBack: () => {
          if (lstatSync(secretFilePath()).ino === ino) chmodSync(secretFilePath(), 0o600);
        },
      };
    });
  });

  step("§11 item 2: a symbolic link in the file's place, to a well-formed file of mode 600 → logins green, a regular file of mode 600 in its place with four new passwords, the link's target untouched", COMMAND_MS + LOOK_MS, async () => {
    const directory = mkdtempSync(join(tmpdir(), "dxb-foundation-roles-link-"));
    const target = join(directory, "logins.json");
    try {
      let targetBefore: ReturnType<typeof standingAt> = "absent";
      await notKept(run, () => {
        const bytes = readFileSync(secretFilePath());
        writeFileSync(target, bytes, { mode: 0o600 });
        chmodSync(target, 0o600);
        targetBefore = standingAt(target);
        unlinkSync(secretFilePath());
        symlinkSync(target, secretFilePath());
        return {
          putBack: () => {
            const stands = lstatSync(secretFilePath(), { throwIfNoEntry: false });
            if (stands?.isSymbolicLink() && readlinkSync(secretFilePath()) === target) {
              unlinkSync(secretFilePath());
              writeFileSync(secretFilePath(), bytes, { mode: 0o600 });
            }
          },
        };
      });
      expect(standingAt(target)).toEqual(targetBefore);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  step("§11 item 2: two logins holding one password (os_intake holds os_engine's) → logins green, four new passwords, the old refused, the new come in", COMMAND_MS + LOOK_MS, async () => {
    await notKept(run, () => rewritten((logins) => ({ ...logins, os_intake: logins["os_engine"] })));
  });

  step("§11 item 2: a password of another form (os_reader's: 43 characters, %41 among them) → logins green, four new passwords, the old refused, the new come in", COMMAND_MS + LOOK_MS, async () => {
    const anotherForm = `a%41${aPasswordOfTheMintedForm().slice(0, 39)}`;
    expect([anotherForm.length, MINTED_FORM.test(anotherForm)]).toEqual([43, false]);
    await notKept(run, () => rewritten((logins) => ({ ...logins, os_reader: anotherForm })));
  });
}
