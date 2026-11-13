// dxb-motion-graphics — lib/motion-blur.js: a moving thing drawn as a camera's shutter sees it. A
// frame is not an instant: while the shutter stands open the thing travels, and what the frame holds
// is the average of where it was. `mg init` puts this file into page/lib/; the page loads it and then
// has `MotionBlur`:
//
//   <script src="lib/motion-blur.js"></script>
//   MotionBlur.expose(g, t, (layer, time) => drawCard(layer, time), { samples: 12, shutter: 0.5 / FILM.FPS });
//
// `draw(layer, time)` draws the thing as it stands at second `time`, on `layer` in place of `g`: a
// context that is clear, stands as `g` stands (its transform) and carries none of its styles or its
// clip. It is called once for each sample; the samples' average is then laid over what `g` already
// holds. What stood still through the shutter comes out as solid as drawn once; what moved is spread
// along its way. The layers are canvases of the document `g`'s own canvas names (its ownerDocument).
//
//   shutter   seconds the shutter stands open, centred on t. Half a frame (0.5 / FILM.FPS) is a film
//             camera's; a whole frame is the longest that still reads as one move.
//   samples   how many times the thing is drawn. Enough that two neighbouring samples overlap: the
//             way it travels during the shutter, in pixels, over the samples, stays under the size
//             of its smallest part — fewer and the blur reads as a row of ghosts.
//
// `expose` returns { colorType }: what the average was really kept in, as the browser names it.
//   'float16'  half floats, which HyperFrames' Chrome gives. A still picture comes back within 1 level
//              of 255 of itself drawn once at up to 16 samples, and within 2 at 64.
//   'unorm8'   8 bits, from a browser that does not give half floats. The same steps run and each
//              one rounds: the same picture comes back up to 2 levels off at 16 samples, 5 at 64.
// Both were measured on real canvases in HyperFrames' Chrome 152 on 2026-11-13, and
// tests/b43/motion-graphics-film.host.test.ts measures them again at every run. Nothing is refused on
// 8 bits — the blur is still drawn; a film in which that shift would show reads the answer.
//
// The picture is still a pure function of t: the sample times depend on nothing else, and the work
// layers kept from call to call are wiped before each use. Blur costs a full-frame layer for each
// sample: it is asked for while the thing travels fast, not for the whole film.
(() => {
  const refuse = why => { throw new Error('MotionBlur: ' + why); };
  const layers = new WeakMap();   // for each frame's canvas, its two work layers: one sample, and the samples' average
  // The average is asked for in half floats: in a canvas of 8 bits every sample added rounds (the
  // figures stand at the top of this file). A browser that does not know the option gives 8 bits and
  // the same steps run on those; `expose` returns which of the two it was.
  const HALF_FLOATS = { colorType: 'float16' }, EIGHT_BITS = 'unorm8';

  // The seconds the samples are taken at: spread evenly from the shutter's opening to its closing.
  function times(t, { samples, shutter } = {}) {
    if (!(Number.isInteger(samples) && samples > 0)) refuse(`"samples" is how many times the thing is drawn — a whole number, 1 or more, not ${samples}`);
    if (!(shutter >= 0)) refuse(`"shutter" is the seconds the shutter stands open, such as 0.5 / FILM.FPS, not ${shutter}`);
    return Array.from({ length: samples }, (_, i) => (samples > 1 ? t + (i / (samples - 1) - 0.5) * shutter : t));
  }

  // The layers are made by the document the frame's canvas names as its own: the helper names none.
  function workLayers(canvas) {
    const page = canvas.ownerDocument;
    if (!page) refuse('the work layers are made by the document of the canvas the frame is drawn on, and this canvas names none (ownerDocument)');
    if (!layers.has(canvas)) layers.set(canvas, [undefined, HALF_FLOATS].map(kept => page.createElement('canvas').getContext('2d', kept)));
    for (const layer of layers.get(canvas))
      if (layer.canvas.width !== canvas.width || layer.canvas.height !== canvas.height) Object.assign(layer.canvas, { width: canvas.width, height: canvas.height });
    return layers.get(canvas);
  }

  // Draws onto the frame `g` what `draw` shows over the shutter around second t.
  function expose(g, t, draw, options) {
    const moments = times(t, options), { width, height } = g.canvas, [sample, average] = workLayers(g.canvas);
    moments.forEach((time, i) => {
      sample.save();
      sample.setTransform(1, 0, 0, 1, 0, 0);
      sample.clearRect(0, 0, width, height);
      sample.setTransform(g.getTransform());
      draw(sample, time);
      sample.restore();
      // A running average: what is held is thinned to i parts in i + 1 and the sample added as the
      // one part left. The two shares are one figure, so they make a whole however the canvas
      // rounds it, and a thing that never moved stays as solid as it was drawn.
      average.globalAlpha = 1 / (i + 1);
      average.globalCompositeOperation = 'destination-out';
      average.fillRect(0, 0, width, height);
      average.globalCompositeOperation = 'lighter';
      average.drawImage(sample.canvas, 0, 0);
    });
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.drawImage(average.canvas, 0, 0);
    g.restore();
    // What the average was really kept in, as the browser names it; one that names nothing gave 8 bits.
    return { colorType: (average.getContextAttributes && average.getContextAttributes().colorType) || EIGHT_BITS };
  }

  window.MotionBlur = { times, expose };
})();
