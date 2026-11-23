import { afterAll, describe, expect } from "vitest";
import {
  benchContainers,
  benchVolumes,
  command,
  createTheStrayVolume,
  expectNothingStands,
  removeTheStrayVolume,
  tail,
  theRestOfTheHostStandsAsBefore,
  upSignalledOnceAContainerShows,
} from "./fixtures/real-bench.ts";
import { orderedSteps } from "./fixtures/ordered-steps.ts";

// The real thing, when a make does not finish (SPEC §5b.2, §5b.4): a command
// killed in the middle of its start, one told to stop, and a labelled volume
// that no record explains. One sequence, like `instance.test.ts`, and never run
// beside it — both stand on the one bench. Nothing here reaches the company's
// stack or the old bench's.

// Measured by the lead: a make takes about a minute, a destroy about a quarter of one.
const MAKE_MS = 180_000;
const DESTROY_MS = 60_000;
const LOOK_MS = 30_000;
// How long a `down` waits for the host lock here: a start that lost its parent
// holds it until it ends by itself, and the lead measured that start at 32 s.
const LOCK_WAIT_SECONDS = 150;
const WAITING_DOWN_MS = LOCK_WAIT_SECONDS * 1_000 + DESTROY_MS;

const STRAY_VOLUME = "dxb_foundation_test_stray";
const step = orderedSteps();

describe("the instance — a make that does not finish, and a volume no record explains, in order", () => {
  afterAll(async () => {
    // Whatever happened above, this file leaves nothing standing: its own stray
    // volume first, which `down` rightly refuses, then the bench's own removal —
    // waiting, because a start that lost its parent may still hold the lock.
    const volumes = await benchVolumes().catch((): string[] => []);
    if (volumes.includes(STRAY_VOLUME)) await removeTheStrayVolume().catch(() => undefined);
    await command("down", WAITING_DOWN_MS, LOCK_WAIT_SECONDS).catch(() => undefined);
  }, WAITING_DOWN_MS + LOOK_MS);

  step("it begins with nothing standing", WAITING_DOWN_MS + LOOK_MS, async () => {
    const down = await command("down", WAITING_DOWN_MS, LOCK_WAIT_SECONDS);
    expect(down.code, tail(down.output)).toBe(0);
    await expectNothingStands();
  });

  step("up killed with SIGKILL once a container stands: at once another up says LOCK_REFUSED, exit 2 — the start it left still holds the kernel's lock", MAKE_MS + LOOK_MS, async () => {
    const killed = await upSignalledOnceAContainerShows("SIGKILL", MAKE_MS);
    expect(killed.signal).toBe("SIGKILL");
    const up = await command("up", LOOK_MS);
    expect(up.lastLine, tail(up.output)).toBe("LOCK_REFUSED");
    expect(up.code).toBe(2);
  });

  step("down, waiting for the lock, removes what the killed make left: INSTANCE_DOWN, exit 0, and nothing stands", WAITING_DOWN_MS + LOOK_MS, async () => {
    const down = await command("down", WAITING_DOWN_MS, LOCK_WAIT_SECONDS);
    expect(down.lastLine, tail(down.output)).toBe("INSTANCE_DOWN");
    expect(down.code).toBe(0);
    await expectNothingStands();
  });

  step("up sent SIGTERM once a container stands stops its start, removes what it made and exits 143 — nothing stands, with no command after it", MAKE_MS + DESTROY_MS, async () => {
    const stopped = await upSignalledOnceAContainerShows("SIGTERM", MAKE_MS);
    expect({ code: stopped.code, signal: stopped.signal }, tail(stopped.output)).toEqual({ code: 143, signal: null });
    await expectNothingStands();
  });

  step("a labelled volume that no record explains: status INSTANCE_FOREIGN 5, up INSTANCE_STANDS 3, down REMOVAL_REFUSED 4 — and the volume is untouched", MAKE_MS + LOOK_MS * 3, async () => {
    await createTheStrayVolume();
    try {
      const status = await command("status", LOOK_MS);
      expect(status.lastLine, tail(status.output)).toMatch(/^INSTANCE_FOREIGN \S/);
      expect(status.code).toBe(5);
      // A make that adopted the volume would run whole: it is given the time, so that the answer is read and not a timeout.
      const up = await command("up", MAKE_MS);
      expect(up.lastLine, tail(up.output)).toBe("INSTANCE_STANDS");
      expect(up.code).toBe(3);
      const down = await command("down", LOOK_MS);
      expect(down.lastLine, tail(down.output)).toMatch(/^REMOVAL_REFUSED \S/);
      expect(down.code).toBe(4);
      // Found by its label alone — its name does not carry the project as the bench spells it.
      expect(await benchVolumes()).toEqual([STRAY_VOLUME]);
      expect(await benchContainers()).toEqual([]);
    } finally {
      await removeTheStrayVolume();
    }
    await expectNothingStands();
  });

  theRestOfTheHostStandsAsBefore();
});
