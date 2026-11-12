// B43 dxb-motion-graphics (CEO 2026-11-12) — `mg blender` really starts Blender.
//
// The host half of `mg`'s Blender tests (see motion-graphics.test.ts for the three files). Blender
// stands in the home's ~/.local/bin, which the construction sandbox does not have, so this file is in
// the battery's HOST_FILES; on this machine Blender is there and a missing one is a FAILURE, never a
// skip. The graphics card's free memory is answered by the test — that rule is held in
// motion-graphics.test.ts — and the scene draws with Workbench: what is held here is that Blender is
// started headless from factory settings, and that its frames and its errors come back.
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { mg, missingTools, recorder } from "./motion-graphics-fixtures.js";

describe("B43 dxb-motion-graphics — Blender runs a scene headless", () => {
  const dir = mkdtempSync(join(tmpdir(), "mg-blender-"));
  const scene = join(dir, "scene.py");
  writeFileSync(scene, [
    "import bpy, sys",
    'out = sys.argv[sys.argv.index("--") + 1]',
    "s = bpy.context.scene",
    's.render.engine = "BLENDER_WORKBENCH"',
    "s.render.resolution_x, s.render.resolution_y, s.render.resolution_percentage = 64, 36, 100",
    "s.render.filepath = out",
    "bpy.ops.render.render(write_still=True)",
    "",
  ].join("\n"));
  const roomOnTheCard = () => recorder((cmd) => (cmd === "nvidia-smi" ? { code: 0, out: "12000\n", err: "" } : undefined));

  it("Blender answers on this machine", () => {
    expect(missingTools("Blender")).toEqual([]);
  }, 60_000);

  it("with room, runs the scene headless from factory settings and prints the frames written", async () => {
    const frame = join(dir, "frame.png");
    const rec = roomOnTheCard();
    const r = await mg(["blender", scene, "--need-mb", "4000", "--", frame], { run: rec.run });
    expect(r.code).toBe(0);
    const blender = rec.calls.find((c) => c.cmd === "blender")!;
    expect(blender.args).toEqual(["-b", "--factory-startup", "--python", scene, "--", frame]);
    expect(existsSync(frame)).toBe(true);
    expect(r.out).toContain(frame);
  }, 60_000);

  it("a scene that raises is a failure, though Blender itself exits 0 after a script error", async () => {
    const raising = join(dir, "raising.py");
    writeFileSync(raising, 'raise RuntimeError("the scene broke")\n');
    const r = await mg(["blender", raising], { run: roomOnTheCard().run });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/the scene broke/);
  }, 60_000);
});
