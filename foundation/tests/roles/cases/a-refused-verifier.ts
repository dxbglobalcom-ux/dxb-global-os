import { Client } from "pg";
import { expect } from "vitest";
import { assertFoundationTarget, connectionString } from "@dxb-foundation/bench";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { guarded, logins, loginsSaying, tailOf, type Said } from "../fixtures/bench-command.ts";
import { THE_FOUR, storedPasswords, withTheInstallersSetting } from "../fixtures/catalogue.ts";
import { linesHolding, openTheLogsWindow, theLogsWindow, type LogWindow } from "../fixtures/server-log.ts";
import { PASSWORD_REFUSED, everyLoginComesIn, expectTheInstallerComesIn, howRefused } from "../fixtures/tcp-logins.ts";
import { changeTheFilesSysid, digested, passwordsInTheFile, secretFileNow } from "../fixtures/the-logins-file.ts";
import { COMMAND_MS, LOOK_MS, type Step, type TheRun } from "../fixtures/the-run.ts";

// Piece 5's SPEC §11 items 4 and 5 (Sol A2, A3): the transaction that carries the verifiers, made to fail by another
// session holding the last login's row — ended by the step's own lock timeout, or cancelled by the installer's own
// statement timeout — and run with the installer's statement logging on. Either way no verifier reaches the server's
// log; a failed run leaves every stored verifier as it was and the file ahead of the server, and the next run heals
// it. Nothing here sends a verifier in a statement: the log's window must hold none at all.

/**
 * The step's own `alter role` waits behind the open transaction; with its own lock timeout (5 s), or the installer's
 * statement timeout (2 s), it ends long before this.
 */
const WITHIN_MS = 20_000;

/** The installer's own statement timeout in the cancel case: shorter than the step's lock timeout, so a cancel ends it. */
const A_STATEMENT_TIMEOUT = "2s";

/** The window's lines, between the case's two markers: no line holds a verifier's prefix — none at all, whose ever. */
async function expectNoVerifierLogged(window: LogWindow): Promise<void> {
  expect(linesHolding(await theLogsWindow(window), ["SCRAM-SHA-256$"])).toBe(0);
}

/**
 * `logins` started now, and kept in `child` so that the case can wait for its end; answered as an error of the case's
 * own when it has not ended within `WITHIN_MS`.
 */
function loginsWithin(child: { running?: Promise<Said> }): Promise<Said> {
  const running = logins(COMMAND_MS);
  child.running = running;
  let timer: NodeJS.Timeout | undefined;
  const late = new Promise<never>((_ended, refuse) => {
    timer = setTimeout(() => refuse(new Error(`logins did not end within ${WITHIN_MS} ms while another session held os_reader's row`)), WITHIN_MS);
  });
  return Promise.race([running, late]).finally(() => clearTimeout(timer));
}

/**
 * The file's sysid changed so that four are minted, and another session holding `os_reader`'s row — the last login's:
 * a step that committed role by role would have changed three verifiers before it failed. `logins` ends within
 * `WITHIN_MS`, exit 1, its last line the refusal with `sqlstate`; nothing secret said; no verifier in the log's window;
 * every stored verifier as it was and the file ahead of the server. The row let go, `logins` is green with the file as
 * it stood and all four come in.
 */
async function refusedWhileTheLastRowIsHeld(run: TheRun, sqlstate: string): Promise<void> {
  changeTheFilesSysid(`${BigInt(run.sysid) + 1n}`);
  const storedBefore = digested(await onTheInstance(storedPasswords));
  const window = await openTheLogsWindow();

  const holder = new Client({ connectionString: connectionString(), connectionTimeoutMillis: 10_000 });
  holder.on("error", () => undefined);
  await holder.connect();
  const child: { running?: Promise<Said> } = {};
  let fileLeft: ReturnType<typeof secretFileNow> = "absent";
  try {
    await assertFoundationTarget(holder);
    await holder.query("begin");
    await holder.query("alter role os_reader connection limit -1");

    const said = await guarded(() => loginsWithin(child));
    expect(said.lastLine, tailOf(said)).toContain(`the server refused the verifier of os_reader (${sqlstate})`);
    expect(said.code).toBe(1);
    fileLeft = secretFileNow();

    await expectNoVerifierLogged(window);
    expect(digested(await onTheInstance(storedPasswords))).toEqual(storedBefore);
    // The file was written before the server heard anything: its four new passwords open nothing yet.
    await expectTheInstallerComesIn();
    const minted = passwordsInTheFile(THE_FOUR);
    const withTheFiles: string[] = [];
    for (const role of THE_FOUR) withTheFiles.push(`${role} ${await howRefused({ user: role, password: minted.get(role) })}`);
    expect(withTheFiles).toEqual(THE_FOUR.map((role) => `${role} ${PASSWORD_REFUSED}`));
  } finally {
    await holder.query("rollback").catch(() => undefined);
    await holder.end().catch(() => undefined);
    // A run still waiting goes on once the row is let go; it is let end before the case does, so it holds no lock after it.
    await child.running?.catch(() => undefined);
  }

  await loginsSaying(`LOGINS_SET logins=4 sysid=${run.sysid}`, 0, COMMAND_MS);
  expect(secretFileNow()).toEqual(fileLeft);
  await everyLoginComesIn();
}

export function aRefusedVerifier(step: Step, run: TheRun): void {
  step("§11 items 4, 5: another session holds os_reader's row — the last login's — and four are minted → logins ends within 20 s, exit 1, 'the server refused the verifier of os_reader (55P03)', nothing secret said, no SCRAM-SHA-256$ in the log's window, every stored verifier as it was, the file ahead; rolled back, logins green with the file as it stood and all four come in", WITHIN_MS + COMMAND_MS * 2 + LOOK_MS, async () => {
    await refusedWhileTheLastRowIsHeld(run, "55P03");
  });

  step(`§11 item 4, the cancel path: with the installer's own statement_timeout = '${A_STATEMENT_TIMEOUT}' (role-level, put back) and os_reader's row held as above → logins ends within 20 s, exit 1, 'the server refused the verifier of os_reader (57014)', nothing secret said, no SCRAM-SHA-256$ in the log's window, every stored verifier as it was; rolled back, logins green and all four come in`, WITHIN_MS + COMMAND_MS * 2 + LOOK_MS * 2, async () => {
    // PL/pgSQL's `when others` does not take a cancel: a `do` block without `query_canceled` writes the verifier to the log here (C1.d).
    await withTheInstallersSetting(run.installer, "statement_timeout", A_STATEMENT_TIMEOUT, () => refusedWhileTheLastRowIsHeld(run, "57014"));
  });

  step("§11 item 5: with statement logging on for the installer's sessions (log_min_duration_statement = 0, role-level, put back) a green logins leaves no SCRAM-SHA-256$ in the log's window", COMMAND_MS + LOOK_MS * 2, async () => {
    await withTheInstallersSetting(run.installer, "log_min_duration_statement", "0", async () => {
      const window = await openTheLogsWindow();
      await loginsSaying(`LOGINS_SET logins=4 sysid=${run.sysid}`, 0, COMMAND_MS);
      await expectNoVerifierLogged(window);
    });
    await everyLoginComesIn();
  });
}
