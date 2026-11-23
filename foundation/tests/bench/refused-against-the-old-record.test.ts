import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// SPEC §5b.9. The old system keeps its own record of the two clusters the bench
// refuses by name — tools/hooks/ledger-identity.json — and each rebuild of the
// old bench gives that cluster a new identifier. While that record lives,
// refused.json must say what it says; it is read here as data, never imported.
//
// THIS FILE LEAVES AT STAGE 5, with the old system and its record.

type Refused = { company?: { sysid?: unknown }; "old-bench"?: { sysid?: unknown } };
type OldRecord = { company?: { sysid?: unknown }; allowed?: { sysid?: unknown; measured_at?: string }[] };

const read = (fromHere: string): unknown =>
  JSON.parse(readFileSync(fileURLToPath(new URL(fromHere, import.meta.url)), "utf8"));

/** Where refused.json no longer says what the old system's record says — empty when the two agree. */
function staleEntries(refused: Refused, oldRecord: OldRecord): string[] {
  const moment = (entry: { measured_at?: string }): number => Date.parse(entry.measured_at ?? "");
  // The old bench is the allowed cluster measured last: a rebuild adds an entry, it does not replace one.
  const [newest] = [...(oldRecord.allowed ?? [])].sort((one, other) => moment(other) - moment(one));
  const said = { company: oldRecord.company?.sysid, "old-bench": newest?.sysid };
  return (["company", "old-bench"] as const).flatMap((name) => {
    if (typeof said[name] !== "string") return [`the old record names no cluster for ${name}`];
    if (refused[name]?.sysid === said[name]) return [];
    return [`${name}: refused.json says ${String(refused[name]?.sysid)}, the old record says ${said[name]}`];
  });
}

describe("the comparison — seen to find a stale entry before its silence is trusted", () => {
  const refused: Refused = { company: { sysid: "7700000000000000001" }, "old-bench": { sysid: "7700000000000000002" } };
  const measured = { sysid: "7700000000000000002", measured_at: "2026-09-28T19:09:37.578Z" };
  const rebuilt = { sysid: "7700000000000000003", measured_at: "2026-12-01T08:00:00.000Z" };
  const company = { sysid: "7700000000000000001" };

  it("is silent when both identifiers agree", () => {
    expect(staleEntries(refused, { company, allowed: [measured] })).toEqual([]);
  });

  it("finds a company identifier that differs", () => {
    const found = staleEntries(refused, { company: { sysid: "7700000000000000009" }, allowed: [measured] });
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(/^company: /);
  });

  it.each([
    ["written after the old one", [measured, rebuilt]],
    ["written before it — the newest is chosen by its moment, not by its place", [rebuilt, measured]],
  ])("finds the old bench rebuilt: a newer allowed entry, %s", (_what, allowed) => {
    const found = staleEntries(refused, { company, allowed });
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(/^old-bench: .*7700000000000000003/);
  });

  it("finds an old record that names no cluster — it never passes for want of something to compare", () => {
    expect(staleEntries(refused, {})).toHaveLength(2);
    expect(staleEntries(refused, { company, allowed: [] })).toHaveLength(1);
  });
});

describe("refused.json — it says what the old system's own record says", () => {
  it("names the company's cluster and the old bench's newest one as tools/hooks/ledger-identity.json does", () => {
    const refused = read("../../bench/refused.json") as Refused;
    const oldRecord = read("../../../tools/hooks/ledger-identity.json") as OldRecord;
    expect(staleEntries(refused, oldRecord)).toEqual([]);
  });
});
