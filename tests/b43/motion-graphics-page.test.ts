// B43 dxb-motion-graphics (CEO 2026-11-12) — the helpers a film's page loads from page/lib/.
//
// This is the node-only part of `mg`'s tests that needs no tool at all (see motion-graphics.test.ts for
// the five files). `mg init` copies templates/lib/ into a job's page/lib/; each helper is a plain script
// a page loads with <script src="lib/…">, and is run here the same way, in a context of its own with no
// browser behind it. Every expected point and level is a literal worked out on paper: a square's
// corners, a circle's radius, the share of a shutter a thing was in front of.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { TEMPLATES } from "./motion-graphics-fixtures.js";

/** A helper as a page gets it: the script run with a `window` to hang itself on, and nothing else — no document. */
function load(name: string): any {
  const window: Record<string, any> = {};
  vm.runInNewContext(readFileSync(join(TEMPLATES, "lib", name), "utf8"), { window });
  return window;
}
/** Numbers of the helper's own realm as plain ones, rounded to a hundredth (and −0 as 0). */
const hundredths = (numbers: Iterable<number>) => Array.from(numbers, (n) => Math.round(n * 100) / 100 + 0);
const rounded = (points: Iterable<number[]>) => Array.from(points, (point) => hundredths(point));

describe("B43 dxb-motion-graphics — page/lib/outline.js: a path's outline as points that can morph", () => {
  const { Outline } = load("outline.js");
  const SQUARE = "M0,0 H100 V100 H0 Z"; // 100 on a side, drawn clockwise from its top left corner
  const TOP_RIGHT_BOTTOM_LEFT = [[50, 0], [100, 50], [50, 100], [0, 50]];

  it("gives n points evenly spaced, clockwise from the top centre", () => {
    expect(rounded(Outline.fromPath(SQUARE, 4))).toEqual(TOP_RIGHT_BOTTOM_LEFT);
    expect(rounded(Outline.fromPath(SQUARE, 8))).toEqual([[50, 0], [100, 0], [100, 50], [100, 100], [50, 100], [0, 100], [0, 50], [0, 0]]);
    // The same square drawn the other way round, and from another corner, is the same outline.
    expect(rounded(Outline.fromPath("M100,100 V0 H0 V100 Z", 4))).toEqual(TOP_RIGHT_BOTTOM_LEFT);
  });

  it("turns the other way, and starts further along, when asked", () => {
    expect(rounded(Outline.fromPath(SQUARE, 4, { clockwise: false }))).toEqual([[50, 0], [0, 50], [50, 100], [100, 50]]);
    expect(rounded(Outline.fromPath(SQUARE, 4, { shift: 0.25 }))).toEqual([[100, 50], [50, 100], [0, 50], [50, 0]]);
    expect(rounded(Outline.fromPath(SQUARE, 4, { shift: -0.25 }))).toEqual([[0, 50], [50, 0], [100, 50], [50, 100]]);
    expect(rounded(Outline.fromPath(SQUARE, 4, { clockwise: false, shift: 0.25 }))).toEqual([[0, 50], [50, 100], [100, 50], [50, 0]]);
  });

  it("reads a path as SVG writes it: relative commands, repeated ones, numbers run together", () => {
    const inset = [[50, 10], [90, 50], [50, 90], [10, 50]]; // the square from 10 to 90
    for (const d of ["m10,10 h80 v80 h-80 z", "M10 10 90 10 90 90 10 90Z", "M10,10l80,0,0,80-80,0Z", "M10,10L90,10L90,90L10,90L10,10Z", "M1e1,1e1h.8e2v80h-80z"])
      expect(rounded(Outline.fromPath(d, 4)), d).toEqual(inset);
    expect(() => Outline.fromPath("M10,10 L90", 4)).toThrow(/Outline/);
    expect(() => Outline.fromPath("", 4)).toThrow(/Outline/);
  });

  it("follows curves: arcs, cubics and quadratics, their smooth forms too", () => {
    // A circle of radius 50 about (50, 50), as two half-turn arcs.
    const circle = Outline.fromPath("M100,50 A50,50 0 1 1 0,50 A50,50 0 1 1 100,50 Z", 360);
    for (const [x, y] of circle) expect(Math.abs(Math.hypot(x - 50, y - 50) - 50)).toBeLessThan(0.05);
    const quarters = (points: number[][]) => [0, 1, 2, 3].map((k) => points[k * points.length / 4].map((v) => Math.round(v) + 0));
    expect(quarters(circle)).toEqual(TOP_RIGHT_BOTTOM_LEFT);
    // The same circle with its arcs' two flags and the number after them run together ("110,50" is 1, 1, 0, 50), as optimisers leave them.
    expect(quarters(Outline.fromPath("M100,50A50,50,0,110,50A50,50,0,11100,50Z", 360))).toEqual(TOP_RIGHT_BOTTOM_LEFT);
    // A quarter turn only, the short way round: from the right of the circle to its bottom, and straight back.
    const quarter = Outline.fromPath("M100,50 A50,50 0 0 1 50,100 Z", 200).map((p: number[]) => Math.hypot(p[0] - 50, p[1] - 50));
    expect(Math.max(...quarter)).toBeLessThan(50.05);
    expect(Math.abs(Math.min(...quarter) - 50 * Math.SQRT1_2)).toBeLessThan(0.3); // the chord's middle

    // A quadratic from (0,0) to (100,0) pulled down to (50,100) reaches (50,50) at its middle; the smooth
    // quadratic after it mirrors the control point and reaches (150,-50).
    const pulled = Outline.fromPath("M0,0 Q50,100 100,0 Z", 400), ys = pulled.map((p: number[]) => p[1]);
    expect(Math.abs(Math.max(...ys) - 50)).toBeLessThan(0.1);
    const wave = Outline.fromPath("M0,0 Q50,100 100,0 T200,0 Z", 800).map((p: number[]) => p[1]);
    expect(Math.abs(Math.max(...wave) - 50)).toBeLessThan(0.1);
    expect(Math.abs(Math.min(...wave) - -50)).toBeLessThan(0.1);
    // A cubic whose control points stand on its ends is the straight line between them.
    expect(rounded(Outline.fromPath("M0,0 C0,0 100,0 100,0 L100,100 C100,100 0,100 0,100 Z", 4))).toEqual(TOP_RIGHT_BOTTOM_LEFT);
    // A cubic bulging to (50, 75) at its middle, and its smooth continuation bulging the other way.
    const bulge = Outline.fromPath("M0,0 C0,100 100,100 100,0 S200,-100 200,0 Z", 800).map((p: number[]) => p[1]);
    expect(Math.abs(Math.max(...bulge) - 75)).toBeLessThan(0.1);
    expect(Math.abs(Math.min(...bulge) - -75)).toBeLessThan(0.1);
  });

  it("takes each closed part of a path on its own", () => {
    const ring = "M0,0H100V100H0Z m25,25 h50 v50 h-50 z"; // a square, and a smaller one inside it
    expect(rounded(Outline.fromPath(ring, 4))).toEqual(TOP_RIGHT_BOTTOM_LEFT);
    expect(rounded(Outline.fromPath(ring, 4, { subpath: 1 }))).toEqual([[50, 25], [75, 50], [50, 75], [25, 50]]);
    expect(() => Outline.fromPath(ring, 4, { subpath: 2 })).toThrow(/Outline: .*2 closed part/);
  });

  it("a rounded rectangle stands about the origin and starts where every outline does", () => {
    const pill = Outline.resample(Outline.roundRect(200, 100, 50), 4); // two half circles of radius 50 and two straight sides
    expect(rounded(pill)).toEqual([[0, -50], [100, 0], [0, 50], [-100, 0]]);
    expect(rounded(Outline.resample(Outline.roundRect(100, 100, 0), 4))).toEqual([[0, -50], [50, 0], [0, 50], [-50, 0]]);
  });

  it("morphs point to point — so where two outlines start decides the shape between them", () => {
    const A = Outline.fromPath(SQUARE, 8), B = Outline.fromPath("M200,0 H300 V100 H200 Z", 8);
    expect(rounded(Outline.morph(A, B, 0))).toEqual(rounded(A));
    expect(rounded(Outline.morph(A, B, 1))).toEqual(rounded(B));
    expect(rounded(Outline.morph(A, B, 0.25))[0]).toEqual([100, 0]); // a quarter of the way from (50,0) to (250,0)
    // The same square against itself started half way round: every point crosses the centre, and at the
    // middle of the morph the whole outline has collapsed onto it.
    const halfRound = Outline.fromPath(SQUARE, 8, { shift: 0.5 });
    expect(rounded(Outline.morph(A, halfRound, 0.5))).toEqual(Array(8).fill([50, 50]));
    expect(() => Outline.morph(A, Outline.fromPath(SQUARE, 4), 0.5)).toThrow(/Outline: .*8.*4/);
  });

  it("puts a place of the shape on the point where the other outline has its like, and spaces the points evenly between such meetings", () => {
    // Of 8 points the fifth is half way through them. It is given the square's right middle, a quarter of the
    // way round: four points share the 100 from the top centre to there, four the 300 back to the top centre.
    expect(rounded(Outline.fromPath(SQUARE, 8, { meet: [[0.5, 0.25]] }))).toEqual([[50, 0], [75, 0], [100, 0], [100, 25], [100, 50], [75, 100], [0, 100], [0, 25]]);
    // Two meetings: the right middle on the third point of 8, the left middle on the seventh.
    expect(rounded(Outline.fromPath(SQUARE, 8, { meet: [[0.25, 0.25], [0.75, 0.75]] }))).toEqual(rounded(Outline.fromPath(SQUARE, 8)));
    expect(rounded(Outline.resample(Outline.roundRect(100, 100, 0), 4, { meet: [[0.75, 0.5]] }))).toEqual([[0, -50], [50, -33.33], [50, 33.33], [0, 50]]);
    // A meeting stands on a point, the one nearest the place given, so a corner of the shape is a point of the
    // outline and is not cut: 0.45 of the way through 8 points is nearest the fifth, as 0.5 is.
    expect(rounded(Outline.fromPath(SQUARE, 8, { meet: [[0.45, 0.25]] }))).toEqual(rounded(Outline.fromPath(SQUARE, 8, { meet: [[0.5, 0.25]] })));
    // Meetings are walked in order, each further along both outlines than the one before, none at an end, no two on one point.
    for (const meet of [[[0.5, 0.25], [0.4, 0.6]], [[0.5, 0.6], [0.7, 0.6]], [[1, 0.5]], [[0.5, 0]], [[0.5]], [[0.45, 0.25], [0.55, 0.3]]])
      expect(() => Outline.fromPath(SQUARE, 8, { meet }), JSON.stringify(meet)).toThrow(/Outline: .*"meet"/);
  });

  it("says where on an outline a spot is, as the share of its length that meetings and shifts are stated in", () => {
    const outline = Outline.fromPath(SQUARE, 400); // a point to each unit of the 400 round the square
    expect(Outline.place(outline, 100, 50)).toBe(0.25);   // the right middle
    expect(Outline.place(outline, 130, 104)).toBe(0.375); // nearest the bottom right corner
    expect(Outline.place(outline, 50, -9)).toBe(0);       // the top centre, where the outline starts
    expect(Outline.place(outline, 20, 3)).toBe(0.925);    // 30 short of it
  });

  it("traces an outline as one closed path for the caller to fill, stroke or clip to", () => {
    const drawn: string[] = [];
    const g = { moveTo: (x: number, y: number) => drawn.push(`M${x},${y}`), lineTo: (x: number, y: number) => drawn.push(`L${x},${y}`), closePath: () => drawn.push("Z") };
    Outline.trace(g, TOP_RIGHT_BOTTOM_LEFT);
    expect(drawn.join(" ")).toBe("M50,0 L100,50 L50,100 L0,50 Z");
  });
});

/**
 * A canvas of one pixel, composited as the canvas specification says (colours premultiplied by alpha):
 * what a helper would get from a browser, reduced to the arithmetic. It knows the operations a helper
 * may use and refuses any other. Like a page's canvas it names the document that makes more of its
 * kind, and nothing else here does. With `halfFloats` off it is a browser that does not know the
 * option: asked for half floats it gives the usual 8 bits and names no colour type. `asked` hears what
 * each canvas made by that document was asked to keep its colours in.
 */
function onePixelCanvas({ halfFloats = true, asked = [] as string[] } = {}) {
  const blend: Record<string, (s: number[], d: number[]) => number[]> = {
    "source-over": (s, d) => s.map((v, i) => v + d[i] * (1 - s[3])),
    "destination-out": (s, d) => d.map((v) => v * (1 - s[3])),
    lighter: (s, d) => s.map((v, i) => Math.min(1, v + d[i])),
    copy: (s) => [...s],
  };
  const paint: Record<string, number[]> = { "#000": [0, 0, 0, 1], "#fff": [1, 1, 1, 1] };
  const canvas: any = { width: 1, height: 1, pixel: [0, 0, 0, 0] };
  const lay = (source: number[]) => {
    if (!blend[g.globalCompositeOperation]) throw new Error(`the one-pixel canvas has no "${g.globalCompositeOperation}"`);
    canvas.pixel = blend[g.globalCompositeOperation](source.map((v) => v * g.globalAlpha), canvas.pixel);
  };
  const states: [number, string, string, unknown][] = [];
  const g: any = {
    canvas, globalAlpha: 1, globalCompositeOperation: "source-over", fillStyle: "#000", stands: "as it began",
    save: () => states.push([g.globalAlpha, g.globalCompositeOperation, g.fillStyle, g.stands]),
    restore: () => ([g.globalAlpha, g.globalCompositeOperation, g.fillStyle, g.stands] = states.pop()!),
    // A transform is one word here, where the context stands; the six numbers of the identity put it back as it began.
    getTransform: () => g.stands,
    setTransform: (...to: unknown[]) => (g.stands = to.length === 1 ? to[0] : "as it began"),
    clearRect: () => (canvas.pixel = [0, 0, 0, 0]),
    fillRect: () => {
      if (!paint[g.fillStyle]) throw new Error(`the one-pixel canvas has no paint "${g.fillStyle}"`);
      lay(paint[g.fillStyle]);
    },
    drawImage: (from: any) => lay(from.pixel),
    getContextAttributes: () => (halfFloats ? { colorType: canvas.colorType } : {}),
  };
  canvas.getContext = (_kind: string, kept?: { colorType?: string }) => {
    canvas.colorType = kept?.colorType ?? "unorm8";
    return g;
  };
  canvas.ownerDocument = {
    createElement: () => {
      const made = onePixelCanvas({ halfFloats }), context = made.getContext;
      made.getContext = (kind: string, kept?: { colorType?: string }) => (asked.push(kept?.colorType ?? "the usual"), context(kind, kept));
      return made;
    },
  };
  return canvas;
}

describe("B43 dxb-motion-graphics — page/lib/motion-blur.js: a frame exposed over the time its shutter is open", () => {
  // No document stands behind the helper but the one a frame's canvas names.
  const { MotionBlur } = load("motion-blur.js");
  const level = (pixel: number[]) => pixel.map((v) => Math.round(v * 1000) / 1000);
  /** A white thing that is there only while `shown(time)`, and the times it was drawn at. */
  const thing = (shown: (time: number) => boolean, times: number[] = []) => (layer: any, time: number) => {
    times.push(time);
    if (!shown(time)) return;
    layer.fillStyle = "#fff";
    layer.fillRect();
  };
  /** A frame of opaque black, exposed at second 1 to such a thing. */
  const exposed = (shown: (time: number) => boolean, options: { samples: number; shutter: number }, clear = false) => {
    const frame = onePixelCanvas(), g = frame.getContext("2d"), times: number[] = [];
    if (!clear) g.fillRect();
    MotionBlur.expose(g, 1, thing(shown, times), options);
    return { pixel: level(frame.pixel), times: times.map((time) => Math.round(time * 1000) / 1000), g };
  };

  it("spreads its samples evenly across the shutter, centred on the frame's own time", () => {
    expect(hundredths(MotionBlur.times(1, { samples: 5, shutter: 0.4 }))).toEqual([0.8, 0.9, 1, 1.1, 1.2]);
    expect(hundredths(MotionBlur.times(2, { samples: 2, shutter: 0.1 }))).toEqual([1.95, 2.05]);
    expect(Array.from(MotionBlur.times(3.2, { samples: 1, shutter: 0.5 }))).toEqual([3.2]); // one sample is the frame itself
    expect(() => MotionBlur.times(1, { samples: 0, shutter: 0.1 })).toThrow(/MotionBlur/);
    expect(() => MotionBlur.times(1, { samples: 4 })).toThrow(/MotionBlur: .*shutter/);
  });

  it("draws the thing once for each sample, at that sample's time", () => {
    expect(exposed(() => true, { samples: 4, shutter: 0.3 }).times).toEqual([0.85, 0.95, 1.05, 1.15]);
  });

  it("a thing in front of the shutter all the time is as solid as if it were drawn once", () => {
    expect(exposed(() => true, { samples: 4, shutter: 0.3 }).pixel).toEqual([1, 1, 1, 1]);
    expect(exposed(() => true, { samples: 16, shutter: 0.3 }).pixel).toEqual([1, 1, 1, 1]);
  });

  it("a thing there for half the samples covers half: mid grey on black, half clear on a clear frame", () => {
    const secondHalf = (time: number) => time > 1;
    expect(exposed(secondHalf, { samples: 4, shutter: 0.3 }).pixel).toEqual([0.5, 0.5, 0.5, 1]);
    expect(exposed((time) => time < 1, { samples: 4, shutter: 0.3 }).pixel).toEqual([0.5, 0.5, 0.5, 1]); // whichever half it was
    expect(exposed((time) => time > 1.1, { samples: 4, shutter: 0.3 }).pixel).toEqual([0.25, 0.25, 0.25, 1]);
    expect(exposed(secondHalf, { samples: 4, shutter: 0.3 }, true).pixel).toEqual([0.5, 0.5, 0.5, 0.5]);
    expect(exposed(() => false, { samples: 4, shutter: 0.3 }).pixel).toEqual([0, 0, 0, 1]); // nothing drawn, nothing changed
  });

  it("makes its work layers in the page of the canvas it is handed, and asks for half floats once, for the average", () => {
    // What a real browser gives for the option, and what a still picture then reads back as, is measured
    // in HyperFrames' own Chrome by motion-graphics-film.host.test.ts. What is held here is the asking.
    const asked: string[] = [];
    const g = onePixelCanvas({ asked }).getContext("2d");
    MotionBlur.expose(g, 1, () => {}, { samples: 4, shutter: 0.1 });
    MotionBlur.expose(g, 2, () => {}, { samples: 4, shutter: 0.1 }); // the layers are kept for the next frame
    expect(asked.sort()).toEqual(["float16", "the usual"]);

    // A canvas that names no document has no page to make a layer in: said in words, not as a missing `document`.
    const pageless = onePixelCanvas();
    delete pageless.ownerDocument;
    expect(() => MotionBlur.expose(pageless.getContext("2d"), 1, () => {}, { samples: 4, shutter: 0.1 })).toThrow(/MotionBlur: .*ownerDocument/);
  });

  it("says what the average was really kept in: half floats, or 8 bits from a browser that does not give them", () => {
    const keptIn = (frame: any) => MotionBlur.expose(frame.getContext("2d"), 1, thing(() => true), { samples: 4, shutter: 0.1 }).colorType;
    expect(keptIn(onePixelCanvas())).toBe("float16");
    expect(keptIn(onePixelCanvas({ halfFloats: false }))).toBe("unorm8");
  });

  it("the thing is drawn on a layer that stands as the frame stands, at every sample", () => {
    const frame = onePixelCanvas(), g = frame.getContext("2d"), stood: unknown[] = [];
    g.setTransform("pushed in");
    MotionBlur.expose(g, 1, (layer: any) => {
      stood.push(layer.stands);
      layer.setTransform("moved by the thing itself"); // what one sample's drawing leaves behind is not the next one's start
    }, { samples: 3, shutter: 0.1 });
    expect(stood).toEqual(["pushed in", "pushed in", "pushed in"]);
    expect(g.stands).toBe("pushed in");
  });

  it("the same time gives the same frame on the same canvas, whatever was drawn on it between, and the frame's own drawing state is left as it was", () => {
    // One canvas, so one pair of work layers: what the frame between leaves in them must not reach the next.
    const frame = onePixelCanvas(), g = frame.getContext("2d"), secondHalf = (time: number) => time > 1;
    const drawnAt = (t: number, shown: (time: number) => boolean) => {
      const times: number[] = [];
      g.clearRect();
      g.fillRect(); // the frame's own black, before the thing
      MotionBlur.expose(g, t, thing(shown, times), { samples: 8, shutter: 0.2 });
      return { pixel: level(frame.pixel), times };
    };
    const first = drawnAt(1, secondHalf), between = drawnAt(1.5, () => true), again = drawnAt(1, secondHalf);
    expect(first.pixel).toEqual([0.5, 0.5, 0.5, 1]);
    expect(between.pixel).toEqual([1, 1, 1, 1]); // another frame: the thing in front of the whole shutter
    expect(again).toEqual(first);
    expect([g.globalAlpha, g.globalCompositeOperation]).toEqual([1, "source-over"]);
  });
});
