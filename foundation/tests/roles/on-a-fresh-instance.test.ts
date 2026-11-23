import { afterAll, describe, expect } from "vitest";
import { readInstances } from "@dxb-foundation/bench";
import { removeTheChainRoots } from "../chain/fixtures/chain-on-disk.ts";
import { valueOf } from "../chain/fixtures/looking.ts";
import { databasesLeft, databasesMade, onTheInstance } from "../chain/fixtures/throwaway-database.ts";
import { orderedSteps } from "../bench/fixtures/ordered-steps.ts";
import { command, tail } from "../bench/fixtures/real-bench.ts";
import { again } from "./cases/again.ts";
import { defaultPrivileges } from "./cases/default-privileges.ts";
import { passesAsTheOwner } from "./cases/passes-as-the-owner.ts";
import { theRealRootElsewhere } from "./cases/the-real-root-elsewhere.ts";
import { beforeTheChain } from "./cases/the-chain.ts";
import { theInstallStep } from "./cases/the-install-step.ts";
import { theRoles } from "./cases/the-roles.ts";
import { whatALoginCanDo } from "./cases/what-a-login-can-do.ts";
import { loginsSaying } from "./fixtures/bench-command.ts";
import { secretFileNow } from "./fixtures/the-logins-file.ts";
import { COMMAND_MS, DESTROY_MS, LOOK_MS, MAKE_MS, aNewRun } from "./fixtures/the-run.ts";

// Piece 5's SPEC §8 B: one module, in order, on an instance made for it — it begins with `fresh` and ends with
// `down`, as piece 1's module does. Each step stands on what the steps before it left; once one has failed, the
// later ones fail at once and do nothing. Every step looks at what stands afterwards from a connection of its own.

const step = orderedSteps();
const run = aNewRun();

describe("piece 5 — the roles and the schema os on a fresh instance, in order", () => {
  afterAll(async () => {
    // Whatever happened above, the module leaves no instance standing; `down` keeps every refusal of its own.
    removeTheChainRoots();
    await command("down", DESTROY_MS).catch(() => undefined);
  }, DESTROY_MS + 10_000);

  step("fresh makes an instance: INSTANCE_UP with its cluster identifier, listed, and answering it", MAKE_MS + DESTROY_MS, async () => {
    const fresh = await command("fresh", MAKE_MS + DESTROY_MS - 5_000);
    expect(fresh.lastLine, tail(fresh.output)).toMatch(/^INSTANCE_UP sysid=\d+ /);
    expect(fresh.code).toBe(0);
    run.sysid = /sysid=(\d+)/.exec(fresh.lastLine)?.[1] ?? "";
    expect(readInstances().map((record) => record.sysid)).toEqual([run.sysid]);
    expect(await onTheInstance((installer) => valueOf(installer, "select system_identifier::text from pg_catalog.pg_control_system()"))).toBe(run.sysid);
  });

  beforeTheChain(step, run);
  theRoles(step, run);
  defaultPrivileges(step);
  theInstallStep(step, run);
  whatALoginCanDo(step, run);
  again(step, run);
  theRealRootElsewhere(step);
  passesAsTheOwner(step, run);

  step("what the module made, it removed: no throwaway database it made still stands", LOOK_MS, async () => {
    expect(databasesMade()).toBeGreaterThan(0);
    expect(await databasesLeft()).toEqual([]);
  });

  let fileAtTheEnd: ReturnType<typeof secretFileNow> = "absent";
  step("down → INSTANCE_DOWN, and the secret file stands as it stood: down does not remove it", DESTROY_MS, async () => {
    fileAtTheEnd = secretFileNow();
    expect(fileAtTheEnd).not.toBe("absent");
    const down = await command("down", DESTROY_MS - 5_000);
    expect(down.lastLine, tail(down.output)).toBe("INSTANCE_DOWN");
    expect(down.code).toBe(0);
    expect(secretFileNow()).toEqual(fileAtTheEnd);
  });

  step("B.15 at the end, after down: logins → LOGINS_REFUSED no-instance, exit 6, and the secret file untouched", COMMAND_MS, async () => {
    await loginsSaying("LOGINS_REFUSED no-instance", 6, COMMAND_MS);
    expect(secretFileNow()).toEqual(fileAtTheEnd);
  });
});
