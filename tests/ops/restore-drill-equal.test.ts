// B72 — THE RESTORE DRILL DEMANDS EQUALITY. scripts/backup/restore-drill.sh computes the inventory of the restored
// copy with scripts/backup/inventory.sql and compares it with the one the night's manifest holds: every part equal,
// a sequence not behind — and every difference printed by name with both values. One difference is a failure.
// `docker` is a fake on PATH (restore-drill-fakes.ts); no container and no database is touched.
import { describe, expect, it } from "vitest";
import { type Inventory, OWN_ID, setup } from "./restore-drill-fakes";

describe("restore-drill.sh — equal to the manifest, or it names what differs", () => {
  it("fails when the manifest counts one more row in one table than came back, and names that table with both counts", () => {
    const t = setup({ manifest: (m) => { m.inventory.tables["public.tasks"] = 1001; } });
    const r = t.run();
    expect(r.status).not.toBe(0);
    expect(t.diffs(r)).toEqual(["DIFF tables public.tasks manifest=1001 restored=1000"]);
    expect(t.lastLine(r)).toBe(`RESTORE_DRILL_FAIL 1 difference between the restored copy and the manifest of ${t.stem}`);
    expect(t.removed()).toEqual([`rm -f -v ${OWN_ID}`]); // and the copy it compared is gone
    expect(t.containerStands()).toBe(false);
  });

  // What the restored copy holds that the manifest does not say · the one line the drill prints for it.
  const differences: [string, (i: Inventory) => void, string][] = [
    ["a table came back empty", (i) => { i.tables["public.agents"] = 0; }, "DIFF tables public.agents manifest=44 restored=0"],
    ["a table whose name has a space lost a row", (i) => { i.tables["public.night shift"] = 6; }, "DIFF tables public.night shift manifest=7 restored=6"],
    ["a table did not come back", (i) => { delete i.tables["auth.users"]; }, "DIFF tables auth.users manifest=1 restored=absent"],
    ["a table is there that the night did not hold", (i) => { i.tables["public.stray"] = 0; }, "DIFF tables public.stray manifest=absent restored=0"],
    ["a sequence is behind", (i) => { i.sequences["public.agents_id_seq"].last_value = 43; },
      'DIFF sequences public.agents_id_seq manifest={"last_value":44,"is_called":true} restored={"last_value":43,"is_called":true}'],
    ["a sequence would hand its last value out again", (i) => { i.sequences["public.agents_id_seq"].is_called = false; },
      'DIFF sequences public.agents_id_seq manifest={"last_value":44,"is_called":true} restored={"last_value":44,"is_called":false}'],
    ["a large object appeared", (i) => { i.large_objects = 2; }, "DIFF large_objects manifest=0 restored=2"],
    ["an extension is of another version", (i) => { i.extensions.pgcrypto = "1.2"; }, 'DIFF extensions pgcrypto manifest="1.3" restored="1.2"'],
    ["a role is missing", (i) => { delete i.roles.dxb_gateway; }, 'DIFF roles dxb_gateway manifest={"login":true,"member_of":[]} restored=absent'],
    ["a role lost a membership", (i) => { i.roles.postgres.member_of = []; },
      'DIFF roles postgres manifest={"login":true,"member_of":["anon"]} restored={"login":true,"member_of":[]}'],
    ["the privileges differ", (i) => { i.acl_sha256 = "a0".repeat(32); },
      `DIFF acl_sha256 manifest="${"0f".repeat(32)}" restored="${"a0".repeat(32)}" (the privileges differ)`],
  ];
  for (const [what, differ, line] of differences) {
    it(`fails when ${what}`, () => {
      const t = setup({ restored: differ });
      const r = t.run();
      expect(r.status).not.toBe(0);
      expect(t.diffs(r)).toEqual([line]);
      expect(t.lastLine(r)).toMatch(/^RESTORE_DRILL_FAIL 1 difference /);
    });
  }

  // A sequence is not transactional: the dump may carry a later value than the manifest. Later is not a difference.
  const ahead: [string, (i: Inventory) => void][] = [
    ["its value is greater", (i) => { i.sequences["public.agents_id_seq"] = { last_value: 45, is_called: false }; }],
    ["the same value has since been handed out", (i) => { i.sequences["public.agents_id_seq"].is_called = true; }],
  ];
  for (const [what, moveOn] of ahead) {
    it(`passes when a sequence is ahead of the manifest: ${what}`, () => {
      const t = setup({ manifest: (m) => { m.inventory.sequences["public.agents_id_seq"] = { last_value: 44, is_called: false }; }, restored: moveOn });
      const r = t.run();
      expect(r.status, r.stdout).toBe(0);
      expect(t.diffs(r)).toEqual([]);
    });
  }

  it("prints every difference, not the first", () => {
    const t = setup({ restored: (i) => { i.tables["public.agents"] = 0; i.tables["public.tasks"] = 0; delete i.roles.anon; } });
    const r = t.run();
    expect(t.diffs(r)).toHaveLength(3);
    expect(t.lastLine(r)).toMatch(/^RESTORE_DRILL_FAIL 3 differences /);
  });
});
