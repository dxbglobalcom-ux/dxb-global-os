import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readChain } from "@dxb-foundation/chain";
import { inventoryOffencesOf, outsideOffencesOf } from "../fixtures/the-outside-form.ts";
import { EXPECTED_FIXTURE, EXPECTED_FURTHER, EXPECTED_REAL, FURTHER_FILE, rootFurther } from "../fixtures/the-outside.ts";

// Piece 6c's SPEC §6 A: the three expected texts obey the outside text's form (§4.3) — green before the code: it
// judges the hand that wrote them. And they say what §4.1 lets them say: no line for anything inside os, os_chain or
// of a chain role — a grant to a chain role on an object outside, and an owner outside that is one, are lines.

const D = "d".repeat(64);
const bodyOf = (path: string): string[] => readFileSync(path, "utf8").split("\n").slice(1, -1);

/** What an outside line is for: a row's identity (a pg_depend row's dependent), an owner's or an acl's object, a held relation. */
export function objectOf(line: string): string {
  const [, kind, ...rest] = line.split(" ");
  if (kind === "held") return rest.slice(1).join(" ");
  const [catalogue, ...words] = rest;
  const identity = words.join(" ");
  if (kind === "owner") return identity.slice(0, identity.lastIndexOf(" is "));
  if (kind === "acl") return identity.slice(0, identity.lastIndexOf(" has "));
  return catalogue === "pg_depend" ? (identity.split(" -> ")[0] ?? "") : identity;
}

/** §4.1's `in`: an object in os or os_chain, one of those schemas, a chain role, a membership or default privilege of one. */
export const isInside = (object: string): boolean =>
  /(^| )(os|os_chain)\./.test(object) || /^schema (os|os_chain)$/.test(object) || /(^|role )os_/.test(object);

export function theTextsCases(): void {
  describe("A the three expected texts obey the outside text's form", () => {
    it("the judges are seen to work first: each finds the offence planted in a text that is otherwise in the form", () => {
      const goodOutside = "outside-format 1\nadded acl pg_namespace schema x has =U/postgres\nadded held rows public.t\nchanged row pg_namespace schema y\n";
      expect(outsideOffencesOf(goodOutside)).toEqual([]);
      const planted: [string, string][] = [
        ["outside-format 1\nadded row pg_namespace schema x", "no final newline"],
        ["outside-format 1\r\nadded row pg_namespace schema x\n", "a carriage return"],
        ["inventory-format 1\nadded row pg_namespace schema x\n", 'line 1 is not "outside-format 1"'],
        ["outside-format 1\nremoved row pg_namespace schema x\nadded row pg_namespace schema x\n", "line 3 is out of order"],
        ["outside-format 1\n\nadded row pg_namespace schema x\n", "line 2 is empty"],
        ["outside-format 1\nadded schema x\n", "line 2 is of no kind the table names: schema"],
        ["outside-format 1\nchanged owner pg_namespace schema x is postgres\n", "line 2 is not of its kind's shape: changed owner pg_namespace schema x is postgres"],
        [`outside-format 1\nadded row pg_namespace ${D} schema x\n`, "line 2 holds a digest"],
        ["outside-format 1\nadded row pg_class table pg_toast.pg_toast_20023\n", "line 2 holds pg_toast\\."],
        ["outside-format 1\nadded row pg_trigger trigger RI_ConstraintTrigger_a_20031 on public.t\n", "line 2 holds RI_ConstraintTrigger"],
        ["outside-format 1\nadded row pg_namespace schema x\nchanged row pg_namespace schema x\n", "line 3 says a key said before: row pg_namespace schema x"],
      ];
      for (const [text, offence] of planted) expect(outsideOffencesOf(text), text).toContain(offence);
      const goodInventory = `inventory-format 1\nacl out pg_namespace schema x has =U/postgres\nheld out rows ${D} public.t\nleft-out pg_largeobject\nowner in pg_namespace schema os is os_owner\nread pg_namespace 1\nrow out pg_namespace ${D} schema x\n`;
      expect(inventoryOffencesOf(goodInventory)).toEqual([]);
      expect(inventoryOffencesOf(`inventory-format 1\nrow out pg_namespace ${D.slice(1)} schema x\n`)).toEqual([`line 2 is not of its kind's shape: row out pg_namespace ${D.slice(1)} schema x`]);
      expect(inventoryOffencesOf(`inventory-format 1\nheld in rows ${D} public.t\n`)).toEqual([`line 2 is not of its kind's shape: held in rows ${D} public.t`]);
    });

    it("expected/real.outside.txt is its first line alone: the real chain changes nothing outside", () => {
      expect(readFileSync(EXPECTED_REAL, "utf8")).toBe("outside-format 1\n");
    });

    it.each([
      ["fixture.outside.txt", EXPECTED_FIXTURE],
      ["further.outside.txt", EXPECTED_FURTHER],
    ])("expected/%s: the first line, sorted by bytes, no \\r, no empty line, a final newline, only §4.3's lines of their shapes, no digest, a key once", (_name, path) => {
      expect(outsideOffencesOf(readFileSync(path, "utf8"))).toEqual([]);
    });

    it("the judge of what a line is for is seen to work", () => {
      expect(objectOf("added row pg_depend trigger t on public.x -> function os.f() n")).toBe("trigger t on public.x");
      expect(objectOf("added acl pg_class table public.x has os_reader=r/postgres")).toBe("table public.x");
      expect(objectOf("added owner pg_class table s.owned is os_owner")).toBe("table s.owned");
      expect(objectOf("changed held rows auth.users")).toBe("auth.users");
      expect(["table os.parts", "table column os_chain.ledger.file", "schema os", "role os_owner", "role membership membership of role postgres in role os_owner", "default acl for role os_owner on functions", "policy p on os.parts"].map(isInside)).toEqual([true, true, true, true, true, true, true]);
      expect(["table public.snap_probe", "schema snap_elsewhere", "role further_role", "trigger owned_touch on snap_elsewhere.owned", "schema os_elsewhere"].map(isInside)).toEqual([false, false, false, false, false]);
    });

    it.each([
      ["fixture.outside.txt", EXPECTED_FIXTURE],
      ["further.outside.txt", EXPECTED_FURTHER],
    ])("expected/%s holds no line for anything inside os or os_chain, or of a chain role", (_name, path) => {
      expect(bodyOf(path).filter((line) => isInside(objectOf(line)))).toEqual([]);
    });

    it("further.outside.txt is fixture.outside.txt and more: every line of the fixture's text stands in it — 0006 changes nothing 0004 made so that a line of it changes", () => {
      const further = bodyOf(EXPECTED_FURTHER);
      expect(bodyOf(EXPECTED_FIXTURE).filter((line) => !further.includes(line))).toEqual([]);
      expect(further.length).toBeGreaterThan(bodyOf(EXPECTED_FIXTURE).length);
    });

    it("the further root, assembled, reads with no offence: revision B's five schema files, then 0006", () => {
      const chain = readChain(rootFurther());
      expect(chain.offences).toEqual([]);
      expect(chain.files.map((file) => file.name)).toEqual(["0001-roles.sql", "0002-os.sql", "0003-inside.sql", "0004-outside.sql", "0005-grade-size-notes.sql", FURTHER_FILE]);
    });
  });
}
