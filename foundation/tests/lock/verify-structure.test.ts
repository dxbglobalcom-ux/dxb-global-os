import { afterAll, describe, expect, it } from "vitest";
import { expectGreen } from "./fixtures/expect-green.ts";
import { expectRefused } from "./fixtures/expectations.ts";
import { OTHER_PIECE, OTHER_SUBJECT, PIECE, PRODUCT_FILE, SUBJECT, json } from "./fixtures/fixture-files.ts";
import {
  command,
  commit,
  copyOf,
  fixtureOfOneFile,
  git,
  lockAgainAndCommit,
  namesCommit,
  offencesOf,
  read,
  replacing,
  stage,
  tail,
  verdictOf,
  witnessedInstall,
  write,
  writeLock,
  type Answer,
} from "./fixtures/fixture-repo.ts";

// SPEC §5 `verify`, steps 1 and 3, on the fixture: what is read from git alone.
// A verify that finds a structural offence installs nothing and runs nothing —
// shown here by a `pnpm` on its PATH that would note having been started.

const LOCK_PATH = `foundation/locks/${PIECE}.json`;
const INVENTORY = "foundation/locks/inventory.json";
const VALUE_TEST = `${SUBJECT}/value.test.ts`;

const fixture = fixtureOfOneFile();
afterAll(fixture.remove);

/** `verify <args>` on a copy after one change to it, with the install witnessed instead of done. */
async function verifiedWithoutInstall(change: (repo: string) => void | Promise<void>, args = [PIECE]) {
  const built = await fixture.ready();
  const repo = copyOf(built);
  await change(repo);
  const witness = witnessedInstall(built.directory);
  const answer = await command(repo, ["verify", ...args], { path: witness.path });
  return { repo, answer, installStarted: witness.started() };
}

/** Red by exactly these offences, exit 1, the candidate named by the tree id git gives the index — and nothing was installed. */
function expectRedBy(ran: { repo: string; answer: Answer; installStarted: boolean }, offences: { kind: string; detail: string }[]): void {
  const candidate = git(ran.repo, "write-tree");
  expect(offencesOf(ran.answer), tail(ran.answer)).toEqual(offences);
  expect(verdictOf(ran.answer)).toMatchObject({ word: "LOCK_RED", fields: { piece: "piece-a", candidate, offences: String(offences.length) } });
  expect(ran.answer.code).toBe(1);
  expect(ran.installStarted).toBe(false);
}

describe("verify — a staged change to what the lock protects", { timeout: 120_000 }, () => {
  it.each([
    ["a locked test", VALUE_TEST, "\n// changed after the lock\n"],
    ["the config", "foundation/tests/vitest.config.ts", "\n// changed after the lock\n"],
    ["the set-up file", "foundation/tests/support/start-the-product.ts", "\n// changed after the lock\n"],
    ["the lockfile", "pnpm-lock.yaml", "\n# changed after the lock\n"],
  ])("%s → protected-changed <path>, and the tests are not run", async (_what, path, appended) => {
    const ran = await verifiedWithoutInstall((repo) => stage(repo, path, `${read(repo, path)}${appended}`));
    expectRedBy(ran, [{ kind: "protected-changed", detail: path }]);
  });

  // SPEC §10 item 8. The entry carries the locked blob's id, so a comparison of ids alone finds nothing changed.
  it.each([
    ["a gitlink", "160000"],
    ["a link", "120000"],
  ])("a protected path staged as %s that carries the locked blob's id — no regular file → protected-missing <path>", async (_what, mode) => {
    const helper = "foundation/tests/shared/doubled.ts";
    const ran = await verifiedWithoutInstall((repo) => {
      git(repo, "update-index", "--add", "--cacheinfo", `${mode},${git(repo, "rev-parse", `:${helper}`)},${helper}`);
    });
    expectRedBy(ran, [{ kind: "protected-missing", detail: helper }]);
  });

  it("a foundation script of the root package file → scripts-changed <name>", async () => {
    const ran = await verifiedWithoutInstall((repo) => {
      const changed = replacing(read(repo, "package.json"), "vitest run --config foundation/tests/vitest.config.ts", "vitest run --config foundation/tests/vitest.config.ts --bail=1");
      stage(repo, "package.json", changed);
    });
    expectRedBy(ran, [{ kind: "scripts-changed", detail: "foundation:test" }]);
  });

  it("a file added directly in foundation/tests/ — a workspace file beside the config → closed-dir-added <path>", async () => {
    const added = "foundation/tests/vitest.workspace.ts";
    const ran = await verifiedWithoutInstall((repo) => stage(repo, added, 'export default ["./vitest.config.ts"];\n'));
    expectRedBy(ran, [{ kind: "closed-dir-added", detail: added }]);
  });
});

describe("verify — a staged change under foundation/locks/", { timeout: 120_000 }, () => {
  it("an edit of the piece's own lock → locks-touched <path>; the lock that judges is the committed one", async () => {
    const ran = await verifiedWithoutInstall((repo) => {
      const lock = JSON.parse(read(repo, LOCK_PATH)) as { cases: unknown[] };
      stage(repo, LOCK_PATH, json({ ...lock, cases: lock.cases.slice(1) }));
    });
    expectRedBy(ran, [{ kind: "locks-touched", detail: LOCK_PATH }]);
  });

  it("an edit of the inventory → locks-touched <path>", async () => {
    const ran = await verifiedWithoutInstall((repo) => {
      stage(repo, INVENTORY, json({ pieces: [{ piece: PIECE, lock: false, why: "said to be tried by hand" }] }));
    });
    expectRedBy(ran, [{ kind: "locks-touched", detail: INVENTORY }]);
  });

  it("a lock file that is staged and not committed has no lock commit → LOCK_REFUSED, exit 2", async () => {
    const ran = await verifiedWithoutInstall(async (repo) => {
      await writeLock(repo, OTHER_PIECE, OTHER_SUBJECT);
      git(repo, "add", "--", `foundation/locks/${OTHER_PIECE}.json`);
    }, [OTHER_PIECE]);
    expect(ran.answer.lines.at(-1), tail(ran.answer)).toMatch(/^LOCK_REFUSED \S/);
    expect(ran.answer.code).toBe(2);
    expect(ran.installStarted).toBe(false);
  });
});

describe("verify — a lock file that says it is another piece's", { timeout: 120_000 }, () => {
  it("a committed foundation/locks/piece-b.json whose piece says piece-a → verify piece-b is LOCK_REFUSED, exit 2", async () => {
    const ran = await verifiedWithoutInstall((repo) => {
      stage(repo, `foundation/locks/${OTHER_PIECE}.json`, read(repo, LOCK_PATH));
      commit(repo, "the first piece's lock, committed under the other piece's name");
    }, [OTHER_PIECE]);
    expectRefused(ran.answer, "piece-b");
    expect(ran.installStarted).toBe(false);
  });
});

describe("verify — a lock that does not describe the commit it was committed with", { timeout: 120_000 }, () => {
  it("a committed lock whose record of a helper is not that commit's blob → lock-inconsistent <path>, beside protected-changed", async () => {
    const helper = "foundation/tests/shared/doubled.ts";
    const ran = await verifiedWithoutInstall((repo) => {
      const lock = JSON.parse(read(repo, LOCK_PATH)) as { protected: Record<string, string> };
      // A lock written by hand over the tool's: it records a blob the helper never had, and is committed alone.
      stage(repo, LOCK_PATH, json({ ...lock, protected: { ...lock.protected, [helper]: "0123456789abcdef0123456789abcdef01234567" } }));
      commit(repo, "a lock edited by hand, alone");
    });
    const said = offencesOf(ran.answer).map((offence) => `${offence.kind} ${offence.detail}`).sort();
    expect(said, tail(ran.answer)).toEqual([`lock-inconsistent ${helper}`, `protected-changed ${helper}`]);
    expect(verdictOf(ran.answer)).toMatchObject({ word: "LOCK_RED", fields: { offences: "2" } });
    expect(ran.answer.code).toBe(1);
    expect(ran.installStarted).toBe(false);
  });
});

/** The one offence of a red verify, seen to be `lock-commit-impure <that commit> <what makes it impure>`. */
function expectImpure(ran: { repo: string; answer: Answer; installStarted: boolean }, impure: string, madeImpureBy: string): void {
  const offences = offencesOf(ran.answer);
  expect(offences.map((offence) => offence.kind), tail(ran.answer)).toEqual(["lock-commit-impure"]);
  const [named, ...said] = offences[0]?.detail.split(" ") ?? [];
  expect(namesCommit(named, impure), `${named} does not name ${impure}`).toBe(true);
  expect(said.join(" ")).toBe(madeImpureBy);
  expect(verdictOf(ran.answer)).toMatchObject({ word: "LOCK_RED", fields: { candidate: git(ran.repo, "rev-parse", `${impure}^{tree}`), offences: "1" } });
  expect(ran.answer.code).toBe(1);
  expect(ran.installStarted).toBe(false);
}

describe("verify --rev — a lock changed in one commit with product code", { timeout: 120_000 }, () => {
  it("another piece's lock committed together with a product file → lock-commit-impure <commit> <path>", async () => {
    let impure = "";
    const ran = await verifiedWithoutInstall(async (repo) => {
      await writeLock(repo, OTHER_PIECE, OTHER_SUBJECT);
      git(repo, "add", "--", "foundation/locks");
      stage(repo, PRODUCT_FILE, `${read(repo, PRODUCT_FILE)}\n// changed in the commit that carries a lock\n`);
      impure = commit(repo, "a lock and product code in one commit");
    }, [PIECE, "--rev", "HEAD"]);
    expectImpure(ran, impure, PRODUCT_FILE);
  });

  it("the piece's own lock made again and committed together with the product change it was made for → the lock commit itself is impure", async () => {
    let impure = "";
    const ran = await verifiedWithoutInstall(async (repo) => {
      stage(repo, PRODUCT_FILE, replacing(read(repo, PRODUCT_FILE), '["alpha", "beta", "gamma"]', '["alpha", "beta", "gamma", "delta"]'));
      await writeLock(repo, PIECE);
      git(repo, "add", "--", LOCK_PATH);
      impure = commit(repo, "the lock made again, with the product change, in one commit");
    }, [PIECE, "--rev", "HEAD"]);
    expectImpure(ran, impure, PRODUCT_FILE);
  });
});

describe("verify --rev — a merge that brings a change of foundation/locks/ (SPEC §10 item 6)", { timeout: 120_000 }, () => {
  it("a side branch that adds another piece's lock alone, merged → lock-commit-impure <the merge> (a merge of 2 commits)", async () => {
    let merge = "";
    const ran = await verifiedWithoutInstall(async (repo) => {
      git(repo, "checkout", "-q", "-b", "side");
      await writeLock(repo, OTHER_PIECE, OTHER_SUBJECT);
      git(repo, "add", "--", `foundation/locks/${OTHER_PIECE}.json`);
      commit(repo, `the lock of ${OTHER_PIECE}, alone, on a side branch`);
      git(repo, "checkout", "-q", "main");
      stage(repo, PRODUCT_FILE, `${read(repo, PRODUCT_FILE)}\n// changed on the main line\n`);
      commit(repo, "product code on the main line");
      git(repo, "merge", "-q", "--no-ff", "-m", "the side branch, merged", "side");
      merge = git(repo, "rev-parse", "HEAD");
    }, [PIECE, "--rev", "HEAD"]);
    // The plant is seen to be a merge of two before the offence is read: the commit, then its two parents.
    expect(git(ran.repo, "rev-list", "--parents", "-n", "1", merge).split(" ")).toHaveLength(3);
    expectImpure(ran, merge, "(a merge of 2 commits)");
  });
});

describe("verify — what is no structural offence: the tests are run, and they are green", { timeout: 120_000 }, () => {
  it("--rev of a lock commit that removes a locked test — the test gone and the lock made again, in one commit → no lock-commit-impure, LOCK_GREEN", async () => {
    const repo = copyOf(await fixture.ready());
    git(repo, "rm", "-q", "--", `${SUBJECT}/rows.test.ts`);
    const removing = await lockAgainAndCommit(repo, "a locked test removed and the lock made again, in one commit");

    const answer = await command(repo, ["verify", PIECE, "--rev", "HEAD"]);
    expect(offencesOf(answer).filter((offence) => offence.kind === "lock-commit-impure"), tail(answer)).toEqual([]);
    expectGreen(answer, git(repo, "rev-parse", `${removing}^{tree}`));
    const judgedBy = verdictOf(answer).fields.lock;
    expect(namesCommit(judgedBy, removing), `${judgedBy} does not name ${removing}`).toBe(true);
  });

  it("--rev of a later commit that adds another piece's lock alone → LOCK_GREEN by the first piece's own lock commit", async () => {
    const built = await fixture.ready();
    const repo = copyOf(built);
    await writeLock(repo, OTHER_PIECE, OTHER_SUBJECT);
    write(repo, INVENTORY, json({ pieces: [{ piece: PIECE, lock: true }, { piece: OTHER_PIECE, lock: true }] }));
    git(repo, "add", "--", "foundation/locks");
    const later = commit(repo, `the lock of ${OTHER_PIECE}, alone`);

    const answer = await command(repo, ["verify", PIECE, "--rev", later]);
    expectGreen(answer, git(repo, "rev-parse", `${later}^{tree}`));
    const judgedBy = verdictOf(answer).fields.lock;
    expect(namesCommit(judgedBy, built.lockCommit), `${judgedBy} does not name ${built.lockCommit}`).toBe(true);
  });

  it("an unstaged edit of a locked test is not in the candidate → no offence from it, LOCK_GREEN", async () => {
    const repo = copyOf(await fixture.ready());
    const candidate = git(repo, "write-tree");
    write(repo, VALUE_TEST, 'import { expect, it } from "vitest";\n\nit("fails wherever it is run", () => {\n  expect(1).toBe(2);\n});\n');

    const answer = await command(repo, ["verify", PIECE]);
    expectGreen(answer, candidate);
    expect(git(repo, "status", "--porcelain")).toBe(`M ${VALUE_TEST}`);
  });
});
