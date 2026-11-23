import { expect } from "vitest";
import { chainCommand } from "../../chain/fixtures/command.ts";
import { valueOf } from "../../chain/fixtures/looking.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { loginsSaying } from "../fixtures/bench-command.ts";
import { THE_FIVE, installerOn, withTheInstallersSetting } from "../fixtures/catalogue.ts";
import { secretFileNow } from "../fixtures/the-logins-file.ts";
import { COMMAND_MS, LOOK_MS, type Step, type TheRun } from "../fixtures/the-run.ts";

// Piece 5's SPEC §8 B.1 and B.2: the instance as `fresh` made it, before the chain — and the command's first run on
// its real target. The chain is run as it is run: `foundation:chain up`, a child, no `--root` — by an installer that
// has given itself `createrole_self_grant = 'set, inherit'` (SPEC §11 item 6), which B.3 then finds no trace of.

const CHAIN_GREEN = /^CHAIN_GREEN applied=(\d+) standing=(\d+) functions=(\d+) reference=(\d+)$/;

export function beforeTheChain(step: Step, run: TheRun): void {
  step("B.1 before the chain: none of the five roles and no schema os stands; logins → LOGINS_REFUSED os_engine missing, exit 6, the secret file untouched", LOOK_MS + COMMAND_MS, async () => {
    await onTheInstance(async (installer) => {
      run.installer = await installerOn(installer);
      expect(await valueOf(installer, "select count(*)::int from pg_catalog.pg_roles where rolname = any($1::text[])", [[...THE_FIVE]])).toBe(0);
      expect(await valueOf(installer, "select count(*)::int from pg_catalog.pg_namespace where nspname = 'os'")).toBe(0);
    });
    const before = secretFileNow();
    await loginsSaying("LOGINS_REFUSED os_engine missing", 6, COMMAND_MS);
    expect(secretFileNow()).toEqual(before);
  });

  step("B.2 the chain: foundation:chain up, no --root, by an installer whose own createrole_self_grant is 'set, inherit' (put back after it) → exit 0, CHAIN_GREEN applied=n standing=n, n ≥ 2", COMMAND_MS + LOOK_MS, async () => {
    const said = await withTheInstallersSetting(run.installer, "createrole_self_grant", "set, inherit", () => chainCommand(["up"], COMMAND_MS));
    const green = CHAIN_GREEN.exec(said.lines.at(-1) ?? "");
    expect(green, `${said.lines.join("\n")}\n${said.stderr.slice(-1_500)}`).not.toBeNull();
    expect(said.code).toBe(0);
    const [applied, standing] = [Number(green?.[1]), Number(green?.[2])];
    expect(applied).toBeGreaterThanOrEqual(2);
    expect(standing).toBe(applied);
    run.standing = standing;
  });
}
