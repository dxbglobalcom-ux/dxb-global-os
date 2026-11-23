import { afterAll, describe, expect } from "vitest";
import { readInstances } from "@dxb-foundation/bench";
import { removeTheChainRoots } from "../chain/fixtures/chain-on-disk.ts";
import { valueOf } from "../chain/fixtures/looking.ts";
import { onTheInstance } from "../chain/fixtures/throwaway-database.ts";
import { orderedSteps } from "../bench/fixtures/ordered-steps.ts";
import { command, tail } from "../bench/fixtures/real-bench.ts";
import { DESTROY_MS, MAKE_MS } from "../roles/fixtures/the-run.ts";
import { clean } from "./cases/clean.ts";
import { ownersRolesStructure } from "./cases/owners-roles-structure.ts";
import { routinesPoliciesGrants } from "./cases/routines-policies-grants.ts";
import { theAuditGrantsPublicationLargeObject } from "./cases/the-audit-grants-publication-large-object.ts";
import { theAuditReading } from "./cases/the-audit-reading.ts";
import { theAuditTriggersIndexesPolicies } from "./cases/the-audit-triggers-indexes-policies.ts";
import { theFixture } from "./cases/the-fixture.ts";
import { theVocabularyTheExtensionOutside } from "./cases/the-vocabulary-extension-outside.ts";
import { whatTheChainDoesNotSee } from "./cases/what-the-chain-does-not-see.ts";

// Piece 6a's SPEC §6 B: one module, in order, on an instance made for it — it begins with `fresh` and ends with
// `down`. Each step stands on what the steps before it left; once one has failed, the later ones fail at once and
// do nothing. Every change a B.8 case makes is undone in the same step, and the check is equal again before the next.

const step = orderedSteps();

describe("piece 6a — the snapshot on a fresh instance, in order: clean, and every change seen", () => {
  afterAll(async () => {
    // Whatever happened above, the module leaves no instance standing.
    removeTheChainRoots();
    await command("down", DESTROY_MS).catch(() => undefined);
  }, DESTROY_MS + 10_000);

  step("fresh makes an instance: INSTANCE_UP with its cluster identifier, listed, and answering it", MAKE_MS + DESTROY_MS, async () => {
    const fresh = await command("fresh", MAKE_MS + DESTROY_MS - 5_000);
    expect(fresh.lastLine, tail(fresh.output)).toMatch(/^INSTANCE_UP sysid=\d+ /);
    expect(fresh.code).toBe(0);
    const sysid = /sysid=(\d+)/.exec(fresh.lastLine)?.[1] ?? "";
    expect(readInstances().map((record) => record.sysid)).toEqual([sysid]);
    expect(await onTheInstance((installer) => valueOf(installer, "select system_identifier::text from pg_catalog.pg_control_system()"))).toBe(sysid);
  });

  clean(step);
  whatTheChainDoesNotSee(step);
  theFixture(step);
  routinesPoliciesGrants(step);
  ownersRolesStructure(step);
  theVocabularyTheExtensionOutside(step);
  // SPEC §11.1: the blind audit's corrections, each case red by its own lines before the code obeys them.
  theAuditTriggersIndexesPolicies(step);
  theAuditGrantsPublicationLargeObject(step);
  theAuditReading(step);

  step("down → INSTANCE_DOWN", DESTROY_MS, async () => {
    const down = await command("down", DESTROY_MS - 5_000);
    expect(down.lastLine, tail(down.output)).toBe("INSTANCE_DOWN");
    expect(down.code).toBe(0);
  });
});
