import { afterAll, describe, expect, it } from "vitest";
import { OTHER_PIECE, OTHER_SUBJECT, PIECE, json } from "./fixtures/fixture-files.ts";
import { command, commit, copyOf, fixtureOfOneFile, git, offencesOf, stage, tail, verdictOf, writeLock } from "./fixtures/fixture-repo.ts";

// SPEC §5 `verify --all`, on the fixture: the inventory against the lock files,
// then every locked piece verified for real.

const INVENTORY = "foundation/locks/inventory.json";

const fixture = fixtureOfOneFile();
afterAll(fixture.remove);

/** A copy of the fixture — one piece locked, the inventory naming it. */
const aCopy = async (): Promise<string> => copyOf(await fixture.ready());

/** Commits the inventory with these pieces — a commit that changes foundation/locks/ and nothing else. */
function commitInventory(repo: string, pieces: { piece: string; lock: boolean; why?: string }[]): void {
  stage(repo, INVENTORY, json({ pieces }));
  commit(repo, "the inventory, alone");
}

/** Locks the fixture's second subject directory as the other piece and commits that lock file alone. */
async function commitTheOtherLock(repo: string): Promise<void> {
  await writeLock(repo, OTHER_PIECE, OTHER_SUBJECT);
  git(repo, "add", "--", `foundation/locks/${OTHER_PIECE}.json`);
  commit(repo, `the lock of ${OTHER_PIECE}, alone`);
}

describe("verify --all — every piece the inventory says is locked", { timeout: 120_000 }, () => {
  it("one piece, present and green → LOCKS_GREEN pieces=1, exit 0", async () => {
    const answer = await command(await aCopy(), ["verify", "--all"]);
    expect(offencesOf(answer), tail(answer)).toEqual([]);
    expect(answer.lines.at(-1)).toBe("LOCKS_GREEN pieces=1");
    expect(answer.code).toBe(0);
  });

  it("two pieces present and green, and one the inventory says is not locked → LOCKS_GREEN, each verified in the inventory's order", async () => {
    const repo = await aCopy();
    await commitTheOtherLock(repo);
    commitInventory(repo, [
      { piece: OTHER_PIECE, lock: true },
      { piece: "piece-c", lock: false, why: "tried live, on demand" },
      { piece: PIECE, lock: true },
    ]);

    const answer = await command(repo, ["verify", "--all"]);
    expect(offencesOf(answer), tail(answer)).toEqual([]);
    expect(verdictOf(answer).word).toBe("LOCKS_GREEN");
    expect(answer.code).toBe(0);
    const verified = answer.lines.filter((line) => line.startsWith("LOCK_GREEN ")).map((line) => /piece=(\S+)/.exec(line)?.[1]);
    expect(verified).toEqual(["piece-b", "piece-a"]);
  });

  it("a piece the inventory says is locked and that has no lock file → lock-owed <piece>, LOCKS_RED, exit 1", async () => {
    const repo = await aCopy();
    commitInventory(repo, [
      { piece: PIECE, lock: true },
      { piece: OTHER_PIECE, lock: true },
    ]);

    const answer = await command(repo, ["verify", "--all"]);
    expect(offencesOf(answer), tail(answer)).toEqual([{ kind: "lock-owed", detail: "piece-b" }]);
    expect(verdictOf(answer)).toMatchObject({ word: "LOCKS_RED", fields: { red: "0", owed: "1" } });
    expect(answer.code).toBe(1);
  });

  it("a lock file whose piece the inventory does not name → lock-unlisted <piece>, red, exit 1", async () => {
    const repo = await aCopy();
    await commitTheOtherLock(repo);

    const answer = await command(repo, ["verify", "--all"]);
    expect(offencesOf(answer), tail(answer)).toEqual([{ kind: "lock-unlisted", detail: "piece-b" }]);
    expect(verdictOf(answer).word).toBe("LOCKS_RED");
    expect(answer.code).toBe(1);
  });

  it("no inventory → LOCK_REFUSED, exit 2", async () => {
    const repo = await aCopy();
    git(repo, "rm", "-q", "--", INVENTORY);
    commit(repo, "the inventory removed");

    const answer = await command(repo, ["verify", "--all"]);
    expect(answer.lines.at(-1), tail(answer)).toMatch(/^LOCK_REFUSED \S/);
    expect(answer.code).toBe(2);
  });
});
