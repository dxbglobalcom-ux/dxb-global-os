import { expect } from "vitest";
import { chainCommand } from "../../chain/fixtures/command.ts";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { aChange, asTheInstaller, asTheOwner, expectChainSaid } from "../fixtures/changes.ts";
import { EXPECTED_FIXTURE, fixtureRoot } from "../fixtures/the-chains.ts";
import { COMMAND_MS, expectRedAmong } from "../fixtures/the-check.ts";

// SPEC §6 B.8, the third part: a reference value changed by hand and put back by the chain; an extension a login
// creates into os; and outside os — a grant to a login on a table of public, an object os_owner owns elsewhere, a
// policy elsewhere naming a login.

/** What chain up answers over the fixture chain when it applies no schema file. */
const GREEN_AGAIN = "CHAIN_GREEN applied=0 standing=4 functions=3 reference=1";

/** The kinds an extension's members in os may be read as (SPEC §4.3: everything that stands in os has a line). */
const AN_EXTENSIONS_KINDS = ["extension", "function", "function-arguments", "function-setting", "function-body", "type", "object", "grant", "comment"];

export function theVocabularyTheExtensionOutside(step: Step): void {
  aChange(step, "B.8 a reference value changed by hand: one reference line out, one in — and chain up puts it back: equal", {
    change: () => asTheOwner("update os.kinds set label = 'Bolts' where name = 'bolt'"),
    expectedOnly: ['reference os.kinds {"name": "bolt", "label": "Bolt", "weight": 0.1}'],
    actualOnly: ['reference os.kinds {"name": "bolt", "label": "Bolts", "weight": 0.1}'],
    undo: async () => expectChainSaid(await chainCommand(["up", "--root", fixtureRoot()], COMMAND_MS), GREEN_AGAIN, 0),
  });

  aChange(step, "B.8 a privileged extension a login (the installer) creates into os: lines of another owner appear, none goes; dropped: equal", {
    change: () => asTheInstaller("create extension pg_trgm schema os"),
    undo: () => asTheInstaller("drop extension pg_trgm"),
    red: async () => {
      const { expectedOnly, actualOnly } = await expectRedAmong(
        EXPECTED_FIXTURE,
        {
          actualOnly: [
            "extension pg_trgm schema os owner supabase_admin version 1.6",
            "grant function os.similarity(text,text) to PUBLIC EXECUTE option f by supabase_admin default",
            "grant function os.similarity(text,text) to supabase_admin EXECUTE option f by supabase_admin default",
          ],
        },
        AN_EXTENSIONS_KINDS,
      );
      expect(expectedOnly).toEqual([]);
      expect(actualOnly.some((line) => line.startsWith("function os.similarity(text,text) kind f owner supabase_admin "))).toBe(true);
      expect(actualOnly.some((line) => line.startsWith("object operator ") && line.endsWith(" owner supabase_admin"))).toBe(true);
    },
  });

  aChange(step, "B.8 outside os, a grant to a login on a table of public: its grant line and its outside line", {
    change: () => asTheInstaller("grant insert on public.snap_probe to os_engine"),
    undo: () => asTheInstaller("revoke insert on public.snap_probe from os_engine"),
    actualOnly: ["grant relation public.snap_probe to os_engine INSERT option f by postgres stored", "outside granted os_engine table public.snap_probe"],
  });

  const EXTRA_GRANTS = ["DELETE", "INSERT", "MAINTAIN", "REFERENCES", "SELECT", "TRIGGER", "TRUNCATE", "UPDATE"].map(
    (privilege) => `grant relation snap_elsewhere.extra to os_owner ${privilege} option f by os_owner default`,
  );
  aChange(step, "B.8 outside os, an object os_owner owns elsewhere: its outside line and the owner's default grants on it", {
    change: () => asTheOwner("create table snap_elsewhere.extra (id integer)"),
    undo: () => asTheOwner("drop table snap_elsewhere.extra"),
    actualOnly: ["outside owns os_owner table snap_elsewhere.extra", ...EXTRA_GRANTS],
  });

  aChange(step, "B.8 outside os, a policy elsewhere naming a login: its outside line", {
    change: () => asTheInstaller("create policy snap_probe_engine on public.snap_probe for select to os_engine using (true)"),
    undo: () => asTheInstaller("drop policy snap_probe_engine on public.snap_probe"),
    actualOnly: ["outside in-policy os_engine policy snap_probe_engine on public.snap_probe"],
  });
}
