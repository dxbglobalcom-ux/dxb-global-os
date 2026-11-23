import { chainCommand } from "../../chain/fixtures/command.ts";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { aChange, asTheOwner, expectChainSaid } from "../fixtures/changes.ts";
import { EXPECTED_FIXTURE, fixtureRoot, functionFileOfTheFixture } from "../fixtures/the-chains.ts";
import { COMMAND_MS, expectRedBy } from "../fixtures/the-check.ts";

// SPEC §6 B.8, the first part: a function's body, definer flag and setting; a policy's predicate; the grants; a grant
// no file says; a default privilege. Each difference is written down whole, line by line, from SPEC §4.3.

const COUNT_PARTS = "function os.count_parts(integer) kind f owner os_owner language sql returns bigint definer t volatility s strict t parallel u leakproof f cost 100 rows 0";

export function routinesPoliciesGrants(step: Step): void {
  aChange(step, "B.8 a function's body: one function-body line out, one in", {
    change: () =>
      asTheOwner(
        `create or replace function os.count_parts(min_qty integer) returns bigint language sql stable strict security definer
         set work_mem = '8MB' set search_path = '' as $f$select count(*) from os.parts where qty > min_qty$f$`,
      ),
    undo: () => asTheOwner(functionFileOfTheFixture("count_parts.sql")),
    expectedOnly: ["function-body os.count_parts(integer) 00001|select count(*) from os.parts where qty >= min_qty"],
    actualOnly: ["function-body os.count_parts(integer) 00001|select count(*) from os.parts where qty > min_qty"],
  });

  aChange(step, "B.8 its definer flag: the function line, definer t out, definer f in", {
    change: () => asTheOwner("alter function os.count_parts(integer) security invoker"),
    undo: () => asTheOwner("alter function os.count_parts(integer) security definer"),
    expectedOnly: [COUNT_PARTS],
    actualOnly: [COUNT_PARTS.replace(" definer t ", " definer f ")],
  });

  aChange(step, "B.8 one of its settings: one function-setting line out, one in", {
    change: () => asTheOwner("alter function os.count_parts(integer) set work_mem = '16MB'"),
    undo: () => asTheOwner("alter function os.count_parts(integer) set work_mem = '8MB'"),
    expectedOnly: ["function-setting os.count_parts(integer) work_mem=8MB"],
    actualOnly: ["function-setting os.count_parts(integer) work_mem=16MB"],
  });

  aChange(step, "B.8 **a policy's predicate**: exactly one policy-using line out, one in", {
    change: () => asTheOwner("alter policy parts_read on os.parts using (qty > 1)"),
    undo: () => asTheOwner("alter policy parts_read on os.parts using (qty > 0)"),
    expectedOnly: ["policy-using os.parts parts_read (qty > 0)"],
    actualOnly: ["policy-using os.parts parts_read (qty > 1)"],
  });

  aChange(step, "B.8 **a grant** added to a login: one grant line in", {
    change: () => asTheOwner("grant delete on os.parts to os_reader"),
    undo: () => asTheOwner("revoke delete on os.parts from os_reader"),
    actualOnly: ["grant relation os.parts to os_reader DELETE option f by os_owner stored"],
  });

  aChange(step, "B.8 **a grant** to PUBLIC: one grant line in, its grantee PUBLIC", {
    change: () => asTheOwner("grant execute on function os.next_ticket(text, double precision) to public"),
    undo: () => asTheOwner("revoke execute on function os.next_ticket(text, double precision) from public"),
    actualOnly: ["grant function os.next_ticket(text,double precision) to PUBLIC EXECUTE option f by os_owner stored"],
  });

  aChange(step, "B.8 **a grant** on a column: one grant column line in", {
    change: () => asTheOwner("grant select (code) on os.parts to os_intake"),
    undo: () => asTheOwner("revoke select (code) on os.parts from os_intake"),
    actualOnly: ["grant column os.parts.code to os_intake SELECT option f by os_owner stored"],
  });

  aChange(step, "B.8 **a grant** with grant option: the item's line, option f out, option t in", {
    change: () => asTheOwner("grant select on os.parts to os_reader with grant option"),
    undo: () => asTheOwner("revoke grant option for select on os.parts from os_reader"),
    expectedOnly: ["grant relation os.parts to os_reader SELECT option f by os_owner stored"],
    actualOnly: ["grant relation os.parts to os_reader SELECT option t by os_owner stored"],
  });

  aChange(step, "B.8 **a grant** removed: one grant line out", {
    change: () => asTheOwner("revoke usage on type os.mood from os_reader"),
    undo: () => asTheOwner("grant usage on type os.mood to os_reader"),
    expectedOnly: ["grant type os.mood to os_reader USAGE option f by os_owner stored"],
  });

  aChange(step, "B.8 a grant no file says: chain up leaves it standing and is CHAIN_GREEN, the check is red by its line", {
    change: () => asTheOwner("grant select on os.parts to os_executor"),
    undo: () => asTheOwner("revoke select on os.parts from os_executor"),
    red: async () => {
      expectChainSaid(await chainCommand(["up", "--root", fixtureRoot()], COMMAND_MS), "CHAIN_GREEN applied=0 standing=4 functions=3 reference=1", 0);
      await expectRedBy(EXPECTED_FIXTURE, { actualOnly: ["grant relation os.parts to os_executor SELECT option f by os_owner stored"] });
    },
  });

  aChange(step, "B.8 a default privilege: one default-acl line in", {
    change: () => asTheOwner("alter default privileges in schema os grant usage on sequences to os_engine"),
    undo: () => asTheOwner("alter default privileges in schema os revoke usage on sequences from os_engine"),
    actualOnly: ["default-acl for os_owner in os on S to os_engine USAGE option f"],
  });
}
