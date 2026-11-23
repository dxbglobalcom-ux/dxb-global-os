import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { expectGreen } from "./fixtures/expect-green.ts";
import { expectRefused } from "./fixtures/expectations.ts";
import { PIECE } from "./fixtures/fixture-files.ts";
import {
  REAL_ENTRY,
  command,
  copyOf,
  fixtureOfOneFile,
  namesCommit,
  offencesOf,
  read,
  stage,
  tail,
  verdictOf,
  witnessedInstall,
  write,
  type Answer,
} from "./fixtures/fixture-repo.ts";

// SPEC §3 "Judge" and §5 `verify` step 2, as §10 item 10 corrects them, on the
// fixture: every verify is judged by the tool as it stood at the lock commit,
// extracted — nothing of the working tree's tool judges or reports.

const ENTRY = "foundation/lock/src/cli.ts";
/** A tool that judges nothing and says green, whatever it is asked. */
const SAYS_GREEN = [
  'console.log("JUDGE extracted lock=0000000");',
  'console.log("LOCK_GREEN piece=piece-a lock=0000000 candidate=0000000 cases=12");',
  "",
].join("\n");

const fixture = fixtureOfOneFile();
afterAll(fixture.remove);

/** The commit the first line names after `JUDGE extracted lock=`, when the line says that. */
const extractedFrom = (answer: Answer): string | undefined => /^JUDGE extracted lock=(\S+)$/.exec(answer.lines[0] ?? "")?.[1];

describe("verify — a staged change that makes the candidate's own tool say LOCK_GREEN for everything", { timeout: 120_000 }, () => {
  function expectRedByTheChangedTool(answer: Answer, installStarted: boolean): void {
    expect(offencesOf(answer), tail(answer)).toEqual([{ kind: "protected-changed", detail: "foundation/lock/src/cli.ts" }]);
    expect(verdictOf(answer)).toMatchObject({ word: "LOCK_RED", fields: { piece: "piece-a", offences: "1" } });
    expect(answer.code).toBe(1);
    expect(installStarted).toBe(false);
  }

  it("staged, the working tree's tool as it was locked, started through the fixture's own entry → still LOCK_RED, protected-changed", async () => {
    const built = await fixture.ready();
    const repo = copyOf(built);
    const asLocked = read(repo, ENTRY);
    stage(repo, ENTRY, SAYS_GREEN);
    write(repo, ENTRY, asLocked);

    const witness = witnessedInstall(built.directory);
    const answer = await command(repo, ["verify", PIECE], { path: witness.path });
    expect(namesCommit(extractedFrom(answer), built.lockCommit), tail(answer)).toBe(true);
    expectRedByTheChangedTool(answer, witness.started());
  });

  it("staged and standing in the working tree, started through this repository's entry → still LOCK_RED, protected-changed", async () => {
    const built = await fixture.ready();
    const repo = copyOf(built);
    stage(repo, ENTRY, SAYS_GREEN);
    // The plant is seen to cheat before the judge's refusal is trusted: started by itself, it says green.
    const byItself = await command(repo, ["verify", PIECE]);
    expect(byItself.lines.at(-1)).toMatch(/^LOCK_GREEN /);

    const witness = witnessedInstall(built.directory);
    const answer = await command(repo, ["verify", PIECE], { entry: REAL_ENTRY, path: witness.path });
    expect(namesCommit(extractedFrom(answer), built.lockCommit), tail(answer)).toBe(true);
    expectRedByTheChangedTool(answer, witness.started());
  });
});

describe("verify — which tool judges", { timeout: 120_000 }, () => {
  it("the untouched tool → first line JUDGE extracted lock=<the lock commit>", async () => {
    const built = await fixture.ready();
    const answer = await command(copyOf(built), ["verify", PIECE]);
    expect(namesCommit(extractedFrom(answer), built.lockCommit), tail(answer)).toBe(true);
    expectGreen(answer);
  });

  it("an unstaged edit of the fixture's tool, run through the fixture's own entry → first line JUDGE extracted lock=<the lock commit>", async () => {
    const built = await fixture.ready();
    const repo = copyOf(built);
    const toolFile = "foundation/lock/src/index.ts";
    write(repo, toolFile, `${read(repo, toolFile)}\n// edited in the working tree, not staged\n`);

    const answer = await command(repo, ["verify", PIECE]);
    expect(namesCommit(extractedFrom(answer), built.lockCommit), tail(answer)).toBe(true);
    expectGreen(answer);
  });

  it("an unstaged edit that breaks the reporter → the run is judged by the lock commit's reporter, not by the edited one: LOCK_GREEN", async () => {
    const built = await fixture.ready();
    const repo = copyOf(built);
    const reporter = "foundation/lock/src/reporter.mjs";
    write(repo, reporter, `${read(repo, reporter)}\nthrow new Error("the edited reporter was loaded");\n`);

    const answer = await command(repo, ["verify", PIECE]);
    expect(namesCommit(extractedFrom(answer), built.lockCommit), tail(answer)).toBe(true);
    expectGreen(answer);
  });
});

describe("verify — the argument a judge hands the tool it extracted, given by hand", { timeout: 120_000 }, () => {
  it("--extracted-judge-in <a directory no judge extracted this tool into> → LOCK_REFUSED, exit 2, nothing installed", async () => {
    const built = await fixture.ready();
    const madeByHand = mkdtempSync(join(built.directory, "not-a-work-directory-"));

    const witness = witnessedInstall(built.directory);
    const answer = await command(copyOf(built), ["verify", PIECE, "--extracted-judge-in", madeByHand], { path: witness.path });
    expectRefused(answer, "extracted");
    expect(witness.started()).toBe(false);
  });
});
