import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { profileDir } from "../../packages/gateway/src/generate-profiles.js";

// B36 — THE CONSTRUCTION SITE DOES NOT WRITE INTO THE COMPANY'S THINGS, and a
// database is not the only thing that belongs to the company.
//
// Measured 2026-08-24, after the CEO saw the working tree go dirty after every
// `pnpm test`: tests/phase4/velocity.test.ts starts the REAL scheduler, the
// scheduler registers the library-recompile job, and that job compiled
// `packages/gateway/profiles/` — a COMMITTED artefact the live gateway reads —
// from the CONSTRUCTION database's records, straight into the tracked tree. 22
// files, every run. Nothing was corrupted because the source hash matched, and
// that is exactly why it went unnoticed for so long.
//
// The battery now compiles into var/, which is gitignored. This file holds that.

const REPO = process.cwd();
const COMMITTED = resolve(REPO, "packages/gateway/profiles");

describe("B36 — the battery writes no company artefact", () => {
  it("the battery's gateway profiles land somewhere disposable, not in the tracked tree", () => {
    const dir = process.env.DXB_GATEWAY_PROFILE_DIR;
    expect(dir, "DXB_GATEWAY_PROFILE_DIR is not set for the battery — vitest.config.ts owns it").toBeTruthy();
    expect(resolve(dir!), "the battery compiles into the COMMITTED profile directory").not.toBe(COMMITTED);
    expect(resolve(dir!).startsWith(COMMITTED), "the battery writes inside the committed tree").toBe(false);
    expect(resolve(dir!).includes(`${REPO}/var/`), "a disposable path lives under var/, which is gitignored").toBe(true);
  });

  it("the compiler obeys that address rather than its own default", () => {
    // The seam itself, not a comment about the seam.
    expect(resolve(profileDir("/anywhere"))).toBe(resolve(process.env.DXB_GATEWAY_PROFILE_DIR!));
  });

  it("neither compiler entry point hard-codes the committed directory as its default", () => {
    for (const f of ["packages/gateway/src/generate-profiles.ts",
                     "packages/gateway/src/library-profiles.ts"]) {
      const src = readFileSync(join(REPO, f), "utf8");
      expect(
        /outDir\s*(\?\?|=)\s*join\(packageRoot,\s*"profiles"\)/.test(src),
        `${f} defaults straight to the committed profile directory again`,
      ).toBe(false);
    }
  });
});
