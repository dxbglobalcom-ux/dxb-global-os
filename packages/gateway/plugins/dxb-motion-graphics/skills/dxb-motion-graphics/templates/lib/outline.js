// dxb-motion-graphics — lib/outline.js: a closed shape as points along its outline, so that one shape
// can become another. `mg init` puts this file into page/lib/; the page loads it and then has `Outline`:
//
//   <script src="lib/outline.js"></script>
//   const LOGO = Outline.fromPath(d, 240);                            // an SVG path's `d`
//   const PHONE = Outline.resample(Outline.roundRect(w, h, r), 240);  // any points of a closed shape
//   g.beginPath(); Outline.trace(g, Outline.morph(LOGO, PHONE, u)); g.fill();
//
// An outline is n points evenly spaced along the shape, from its top centre, clockwise — the same for
// every shape, so any two outlines of one n can morph. It is plain data: [[x, y], …], in the units the
// shape was given in, to be moved and scaled like any other points.
//
// WHICH POINT MEETS WHICH DECIDES THE SHAPES IN BETWEEN. A morph moves point i of one outline straight
// to point i of the other. Where a feature of one shape — a tail, a notch, a corner — is sent to a
// stretch of the other that has nothing like it, it is dragged along the edge and the shapes between
// come out pinched and lumpy: the first film's speech bubble did that with its tail, half way into a
// phone (2026-11-12). Places are stated as shares of an outline's length from its start, 0 to 1;
// `Outline.place(outline, x, y)` reads one off. Three things move the meeting points:
//   { meet: [[0.59, 0.62]] }  puts this shape's place 0.62 on the point where the other outline has
//                         its place 0.59 — the tail's tip into the phone's corner — and spaces the
//                         points evenly between such meetings. The start stays where it is, so what
//                         stood upright stays upright. Several pairs, in order, carry a whole
//                         feature: the tail's two roots and its tip onto the two ends and the middle
//                         of the corner, and the tail draws in where it stands.
//   { shift: -0.03 }      starts the outline that share of its length further along (negative: back):
//                         every meeting moves by as much, which leans a shape that stood upright.
//   { clockwise: false }  walks the outline the other way round. Two outlines walked in opposite
//                         directions close to a line half way and open again mirrored — a card
//                         turning over. Between two shapes meant to flow into each other, never.
// A morph is looked at step by step (`mg sheet --around-events`) before it is kept.
// Nothing here knows the time or keeps anything from one call to the next.
(() => {
  const CURVE_PIECES = 64;           // the straight pieces a Bézier command is followed in
  const ARC_PIECE = Math.PI / 180;   // an arc is followed a piece to each degree it turns
  const NUMBERS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };   // what each command takes
  const COMMAND = /[\s,]*([MLHVCSQTAZ])/iy, NUMBER = /[\s,]*([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/iy;
  const FLAG = /[\s,]*([01])/y;      // an arc's two flags are one digit each, and may stand against the next number
  const refuse = why => { throw new Error('Outline: ' + why); };
  const lerp = (a, b, u) => a + (b - a) * u;

  // The closed parts of an SVG path, each as the points its commands pass through. A part that does
  // not end in Z is closed all the same: an outline has no open end.
  function partsOf(d) {
    const parts = [];
    let at = 0, x = 0, y = 0, start = [0, 0], part = null, bend = null;   // bend: the control point a smooth command mirrors
    const take = pattern => {
      pattern.lastIndex = at;
      const found = pattern.exec(d);
      if (found) at = pattern.lastIndex;
      return found && found[1];
    };
    const lineTo = (toX, toY) => {
      if (!part) parts.push(part = [[x, y]]);
      part.push([x = toX, y = toY]);
    };
    const cubicTo = (c1x, c1y, c2x, c2y, toX, toY) => {
      const fromX = x, fromY = y;
      for (let i = 1; i <= CURVE_PIECES; i++) {
        const u = i / CURVE_PIECES, v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, e = u * u * u;
        lineTo(a * fromX + b * c1x + c * c2x + e * toX, a * fromY + b * c1y + c * c2y + e * toY);
      }
    };
    // An arc as SVG states it — two radii, the ellipse's turn in degrees, two flags, the end — found
    // by its centre (SVG 1.1, appendix F.6.5) and followed round it.
    const arcTo = (rx, ry, turn, large, sweep, toX, toY) => {
      const cos = Math.cos(turn * Math.PI / 180), sin = Math.sin(turn * Math.PI / 180);
      const px = (cos * (x - toX) + sin * (y - toY)) / 2, py = (cos * (y - toY) - sin * (x - toX)) / 2;
      if (!rx || !ry || (!px && !py)) return lineTo(toX, toY);
      const reach = Math.sqrt(Math.max(1, (px * px) / (rx * rx) + (py * py) / (ry * ry)));   // radii too short to span the ends are grown
      const a = Math.abs(rx) * reach, b = Math.abs(ry) * reach, across = a * a * py * py + b * b * px * px;
      const k = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, a * a * b * b - across) / across);
      const qx = k * a * py / b, qy = -k * b * px / a;
      const cx = cos * qx - sin * qy + (x + toX) / 2, cy = sin * qx + cos * qy + (y + toY) / 2;
      const from = Math.atan2((py - qy) / b, (px - qx) / a);
      let span = Math.atan2((-py - qy) / b, (-px - qx) / a) - from;
      if (sweep && span < 0) span += 2 * Math.PI;
      if (!sweep && span > 0) span -= 2 * Math.PI;
      const pieces = Math.ceil(Math.abs(span) / ARC_PIECE);
      for (let i = 1; i < pieces; i++) {
        const ax = a * Math.cos(from + span * i / pieces), ay = b * Math.sin(from + span * i / pieces);
        lineTo(cx + cos * ax - sin * ay, cy + sin * ax + cos * ay);
      }
      lineTo(toX, toY);
    };

    for (let letter; (letter = take(COMMAND));) {
      const relative = letter !== letter.toUpperCase();   // a small letter counts from where the pen is
      let kind = letter.toUpperCase();
      do {
        const n = Array.from({ length: NUMBERS[kind] }, (_, i) => {
          const read = take(kind === 'A' && (i === 3 || i === 4) ? FLAG : NUMBER);
          if (read === null) refuse(`"${letter}" takes ${NUMBERS[kind]} numbers and is given ${i} in: ${d}`);
          return Number(read);
        });
        const ox = relative ? x : 0, oy = relative ? y : 0, smooth = bend;
        bend = null;
        if (kind === 'M') {
          start = [x = ox + n[0], y = oy + n[1]];
          part = null;
          kind = 'L';   // pairs that follow a move are lines
        } else if (kind === 'L') lineTo(ox + n[0], oy + n[1]);
        else if (kind === 'H') lineTo(ox + n[0], y);
        else if (kind === 'V') lineTo(x, oy + n[0]);
        else if (kind === 'A') arcTo(n[0], n[1], n[2], n[3], n[4], ox + n[5], oy + n[6]);
        else if (kind === 'Z') {
          [x, y] = start;
          part = null;
        } else {
          // C and Q state their control points; S and T take the first as the last one's mirror image.
          const stated = kind === 'C' || kind === 'Q', cubic = kind === 'C' || kind === 'S';
          const mirrored = smooth && smooth.cubic === cubic ? [2 * x - smooth.x, 2 * y - smooth.y] : [x, y];
          const [c1x, c1y] = stated ? [ox + n[0], oy + n[1]] : mirrored, rest = n.slice(stated ? 2 : 0).map((v, i) => v + (i % 2 ? oy : ox));
          if (cubic) {
            bend = { cubic, x: rest[0], y: rest[1] };
            cubicTo(c1x, c1y, ...rest);
          } else {
            // A quadratic is the cubic whose control points stand two thirds of the way to its one.
            const [toX, toY] = rest;
            bend = { cubic, x: c1x, y: c1y };
            cubicTo(lerp(x, c1x, 2 / 3), lerp(y, c1y, 2 / 3), lerp(toX, c1x, 2 / 3), lerp(toY, c1y, 2 / 3), toX, toY);
          }
        }
        NUMBER.lastIndex = at;
      } while (NUMBERS[kind] && NUMBER.test(d));
    }
    if (d.slice(at).trim()) refuse(`the path cannot be read from "${d.slice(at).trim().slice(0, 24)}"`);
    return parts;
  }

  // n points evenly spaced along a closed shape given as points in any order: from its top centre —
  // the highest place it crosses the upright line through the middle of its width — and clockwise,
  // unless `clockwise` is false; `shift` starts that share of the length further along the way walked.
  // `meet` lists [share of the points, share of the length] pairs: the point that far through the
  // outline stands that far along the shape, and the points between two pairs are spaced evenly.
  function resample(points, n, { clockwise = true, shift = 0, meet = [] } = {}) {
    if (!(Number.isInteger(n) && n > 2)) refuse(`an outline has 3 points or more, not ${n}`);
    // Each meeting stands on a point — the one nearest the place given — so a corner of the shape is a point of the outline.
    const meetings = [[0, 0], ...meet.map(([there, here]) => [Math.round(there * n), here]), [n, 1]];
    for (let i = 1; i < meetings.length; i++)
      if (!(meetings[i][0] > meetings[i - 1][0] && meetings[i][1] > meetings[i - 1][1]))
        refuse(`"meet" lists [place on the other outline, place on this shape] pairs in the order they are walked — each between 0 and 1, further along than the one before, on a point of its own among the ${n}: ${JSON.stringify(meet)}`);
    const placeOf = k => {   // the share of the length point k stands at
      const next = meetings.findIndex(([point]) => point > k), [point0, here0] = meetings[next - 1], [point1, here1] = meetings[next];
      return here0 + (here1 - here0) * (k - point0) / (point1 - point0);
    };
    const turn = points.reduce((sum, [px, py], i) => sum + px * points[(i + 1) % points.length][1] - points[(i + 1) % points.length][0] * py, 0);
    const loop = turn > 0 === clockwise ? [...points] : [...points].reverse();
    loop.push(loop[0]);
    const along = [0];
    for (let i = 1; i < loop.length; i++) along.push(along[i - 1] + Math.hypot(loop[i][0] - loop[i - 1][0], loop[i][1] - loop[i - 1][1]));
    const length = along[along.length - 1];
    if (!(length > 0)) refuse('the shape has no length to put points along');

    const middle = (points.reduce((lo, p) => Math.min(lo, p[0]), Infinity) + points.reduce((hi, p) => Math.max(hi, p[0]), -Infinity)) / 2;
    let top = Infinity, first = 0;
    for (let i = 1; i < loop.length; i++) {
      const [px, py] = loop[i - 1], [qx, qy] = loop[i];
      if (Math.min(px, qx) > middle || Math.max(px, qx) < middle) continue;
      const u = px === qx ? (py <= qy ? 0 : 1) : (middle - px) / (qx - px), crossing = lerp(py, qy, u);
      if (crossing < top) [top, first] = [crossing, lerp(along[i - 1], along[i], u)];
    }

    return Array.from({ length: n }, (_, k) => {
      const d = ((first / length + shift + placeOf(k)) % 1 + 1) % 1 * length;
      let lo = 1, hi = along.length - 1;   // the piece the distance d falls in
      while (lo < hi) {
        const half = (lo + hi) >> 1;
        if (along[half] < d) lo = half + 1; else hi = half;
      }
      const u = (d - along[lo - 1]) / (along[lo] - along[lo - 1] || 1);
      return [lerp(loop[lo - 1][0], loop[lo][0], u), lerp(loop[lo - 1][1], loop[lo][1], u)];
    });
  }

  // One closed part of an SVG path `d` (the first, or the one `subpath` counts to from 0) as an outline of n points.
  function fromPath(d, n, { subpath = 0, ...order } = {}) {
    const parts = partsOf(d);
    if (!parts[subpath]) refuse(`the path has ${parts.length} closed part(s), counted from 0, and part ${subpath} is asked for`);
    return resample(parts[subpath], n, order);
  }

  // A rounded rectangle about the origin, as points for `resample` (a circle when r = w/2 = h/2).
  function roundRect(w, h, r) {
    const x = w / 2 - r, y = h / 2 - r, points = [], pieces = Math.round(Math.PI / 2 / ARC_PIECE);
    for (const [cx, cy, quarter] of [[x, -y, -1], [x, y, 0], [-x, y, 1], [-x, -y, 2]])
      for (let i = 0; i <= pieces; i++) {
        const a = (quarter + i / pieces) * Math.PI / 2;
        points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    return points;
  }

  // The outline between A (u = 0) and B (u = 1): every point on the straight way to the one it meets.
  function morph(A, B, u) {
    if (A.length !== B.length) refuse(`two outlines meet point for point, and these have ${A.length} and ${B.length} points`);
    return A.map((p, i) => [lerp(p[0], B[i][0], u), lerp(p[1], B[i][1], u)]);
  }

  // Where on an outline a spot is: the share of the outline's length at its point nearest (x, y). Read
  // off an evenly spaced outline of many points — the answer is as fine as they are close.
  function place(outline, x, y) {
    const away = outline.map(p => Math.hypot(p[0] - x, p[1] - y));
    return away.indexOf(Math.min(...away)) / outline.length;
  }

  // The outline as one closed path on a canvas context, for the caller to fill, stroke or clip to.
  function trace(g, points) {
    points.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
    g.closePath();
  }

  window.Outline = { fromPath, resample, roundRect, morph, place, trace };
})();
