// What several bench cases begin from: a first run seen green, and the root it ran from —
// so the case's own run is the one that changes something.
import { expect } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import type { Throwaway } from "../../chain/fixtures/throwaway-database.ts";
import { CLOSED, EVENT_TYPES_TABLE, FAILED, MAKES_OS, OPENED, TWICE, fileOf, greets } from "./pass-files.ts";
import { passesRoot } from "./passes-on-disk.ts";

/** The root of `greetAndTwiceStand`, not yet run: 0001-os.sql, greet.sql ("hello") and twice.sql. */
export const osGreetAndTwice = (): string => passesRoot({ schema: { "0001-os.sql": MAKES_OS }, functions: { "greet.sql": greets("hello"), "twice.sql": TWICE } });

/** `os`, os.greet() answering "hello" and os.twice(n integer), made by a run of their files. Answers the root. */
export async function greetAndTwiceStand(db: Throwaway): Promise<string> {
  const root = osGreetAndTwice();
  expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 2 });
  return root;
}

/** The three event types as the file of `eventTypesStand` holds them. */
export const THE_THREE_EVENT_TYPES = fileOf(OPENED, CLOSED, FAILED);

/**
 * `os` and os.event_types — with `more`, the SQL of whatever else the case's one schema file makes — and the
 * vocabulary's three rows written by a run of event_types.json. Answers the root.
 */
export async function eventTypesStand(db: Throwaway, more = ""): Promise<string> {
  const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + EVENT_TYPES_TABLE + more }, reference: { "event_types.json": THE_THREE_EVENT_TYPES } });
  expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 1 });
  return root;
}
