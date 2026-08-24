import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// B36 · Block 3-bis — THE LIVE DRILLS THAT RUN ON THE COMPANY'S SIDE OF THE WALL.
//
// This file is NOT part of the sandboxed battery, and that is deliberate rather
// than convenient. Every drill in it has to enter a container — it creates and
// drops roles on the construction engine, or it listens on the holding's own
// channel — and a container is entered through the Docker socket, which on this
// machine is root. The whole of Block 3-bis exists to take that socket away from
// the construction runtime, so a drill that needs it belongs to the AUTHOR's
// hand, on the company's side, and is run there:
//
//   scripts/construction/battery.sh   — runs the sandboxed suite, then this file
//                                       and tests/ops/freeze-guard.test.ts on the
//                                       host, and prints which ran where.
//
// Nothing is hidden by that split. `pnpm b36:prove-wall` answers the fixed
// question from inside the sandbox, and tests/b36/wall-question.test.ts holds
// the same question inside the battery itself.

const REPO = process.cwd();

/** execFileSync throws everything the script printed away unless it is read back
 *  off the error — the mistake this row already made once. */
function runNode(args: string[]): string {
  try {
    return execFileSync("node", args, { cwd: REPO, encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string };
    return `${err.stdout ?? ""}\n${err.stderr ?? ""}`;
  }
}

describe("B36 · Block 3-bis — the live drills, on the company's side", () => {
  it(
    "(4) LIVE — the two audited escapes reproduce with the real role, then the server refuses them",
    { timeout: 240_000 },
    () => {
      const out = runNode(["scripts/b36/prove-window-escapes.mjs"]);

      // Red first. If the escape cannot be reproduced, the green half proves
      // nothing — that is the whole lesson of the audit.
      expect(out, `the escape proof did not run:\n${out}`).toContain("large object");
      expect(out, `escape 1 did not reproduce RED — the proof is worthless:\n${out}`)
        .toMatch(/RED 1\s+large object\s+CREATED, oid \d+/);
      expect(out, `escape 2 did not reproduce RED — the counter did not move:\n${out}`)
        .toMatch(/RED 2\s+counter\s+TURNED/);
      expect(out, `the counter's move was undone by the ROLLBACK, so it proves nothing:\n${out}`)
        .toContain("the ROLLBACK did not put it back");

      // Then green, from the server and not from our code.
      expect(out, `escape 1 is still open after the seal:\n${out}`)
        .toMatch(/GREEN 1\s+large object\s+refused: permission denied/);
      expect(out, `escape 2 is still open after the seal:\n${out}`)
        .toMatch(/GREEN 2\s+counter\s+refused: permission denied/);
      expect(out).toContain("ESCAPES_RED_THEN_GREEN");
    },
  );

  it(
    "(5) LIVE — a forged live event reached the screen, and now it is refused",
    { timeout: 240_000 },
    () => {
      // THE SECOND AUDIT'S ORDER, 2026-08-24: "Önce sahte ve biçimi geçerli bir
      // NOTIFY mesajının ekrana geçtiğini kırmızıyla kanıtla; sonra aynı
      // mesajın reddedildiğini, gerçek şirket olaylarının ise çalışmaya devam
      // ettiğini kanıtla."
      const out = runNode(["scripts/b36/prove-forged-event.mjs"]);

      expect(out, `the forged-event proof did not run:\n${out}`).toContain("forged events on the CEO's channel");
      expect(out, `the forgery did not reproduce RED — the refusal proves nothing:\n${out}`)
        .toMatch(/RED\s+with the OLD listener, forged events on the CEO's channel: [1-9]/);
      expect(out, `a forged event still reaches the CEO's screen:\n${out}`)
        .toMatch(/GREEN with the SHIPPED collector, forged events on the CEO's channel: 0/);
      expect(out, `the company's own events stopped arriving — the fix broke the surface:\n${out}`)
        .toMatch(/GREEN events issued through the company's own door that arrived : [1-9]/);
      expect(out, "the receipt is not consumed — an event can be replayed").toContain("must stay");
      expect(out).toContain("FORGED_EVENT_REFUSED");
    },
  );

  it(
    "(6) LIVE — from the construction runtime there is no route to the holding, and the probe proves it can succeed",
    { timeout: 900_000 },
    () => {
      const out = runNode([join(REPO, "scripts/b36/prove-wall.mjs")]);

      // The account is gone, not merely restricted.
      expect(out, `the drill did not run:\n${out}`).toContain("THE ACCOUNT THAT WAS WITHDRAWN");
      expect(out, `dxb_reader is back on the company engine:\n${out}`)
        .toMatch(/dxb_reader on the company engine\s+gone/);

      // Every class of privilege the window's own role could hold is zero.
      expect(out, `a privilege class is open on the company:\n${out}`).toContain("all 9 classes are zero");

      // THE RED HALF. A refusal measured by a probe that cannot succeed anywhere
      // proves nothing — that is the lesson of three failed audits, and the drill
      // refuses to print a verdict without it.
      expect(out, `the probe is blind — it could not reach the holding even unsandboxed:\n${out}`)
        .not.toContain("PROBE_IS_BLIND");
      expect(out, `the unsandboxed probe could not log in to the holding:\n${out}`)
        .toMatch(/reaches\s+a real login to the holding with a real credential\s+logged in as/);
      expect(out, `the unsandboxed probe could not enter the company's container:\n${out}`)
        .toMatch(/reaches\s+the company's container, entered as supabase_admin/);

      // THE GREEN HALF, from inside the sandbox the construction actually runs in.
      for (const shape of [
        /refused\s+a direct TCP login to the company's engine \(5 spellings\)\s+every spelling refused/,
        /refused\s+the company's HTTP gateway/,
        /refused\s+the Docker socket/,
        /refused\s+the company's container, entered as supabase_admin/,
        /refused\s+the credential files and the service environments\s+none readable/,
        /refused\s+SQL smuggled through the read gateway\s+all 6 refused/,
      ]) {
        expect(out, `a route into the holding is open from the construction runtime:\n${out}`).toMatch(shape);
      }

      // And the one door that is supposed to work, works — including the gate.
      expect(out, `the read gateway stopped answering named questions:\n${out}`)
        .toMatch(/works\s+a named question is answered/);
      expect(out, `the governance gate did not run through the gateway:\n${out}`)
        .toMatch(/with the gateway running\s+exit 0/);
      expect(out, `the governance gate found another way to read the holding:\n${out}`)
        .toMatch(/with the gateway stopped\s+exit 1/);

      expect(out, `the drill printed a leak:\n${out}`).not.toContain("WALL_LEAKS");
      expect(out).toContain("WALL_IS_ONE_WAY");
    },
  );
});
