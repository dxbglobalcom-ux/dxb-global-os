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
// holds. What stood still through the shutter comes out exactly as solid as drawn once; what moved
// is spread along its way.
//
//   shutter   seconds the shutter stands open, centred on t. Half a frame (0.5 / FILM.FPS) is a film
//             camera's; a whole frame is the longest that still reads as one move.
//   samples   how many times the thing is drawn. Enough that two neighbouring samples overlap: the
//             way it travels during the shutter, in pixels, over the samples, stays under the size
//             of its smallest part — fewer and the blur reads as a row of ghosts.
//
// The picture is still a pure function of t: the sample times depend on nothing else, and the work
// layers kept from call to call are wiped before each use. Blur costs a full-frame layer for each
// sample: it is asked for while the thing travels fast, not for the whole film.
(() => {
  const refuse = why => { throw new Error('MotionBlur: ' + why); };
  const layers = new WeakMap();   // for each frame's canvas, its two work layers: one sample, and the samples' average
  // The average is kept in half floats. In a canvas of 8 bits every sample added rounds, and a still
  // picture came back from 16 samples about 5 levels of 255 lighter than drawn once; in half floats
  // it comes back within 1 (measured 2026-11-12 in Chrome 155 and in HyperFrames' Chrome 152). A
  // browser that does not know the option gives 8 bits, and the same steps run on those.
  const HALF_FLOATS = { colorType: 'float16' };

  // The seconds the samples are taken at: spread evenly from the shutter's opening to its closing.
  function times(t, { samples, shutter } = {}) {
    if (!(Number.isInteger(samples) && samples > 0)) refuse(`"samples" is how many times the thing is drawn — a whole number, 1 or more, not ${samples}`);
    if (!(shutter >= 0)) refuse(`"shutter" is the seconds the shutter stands open, such as 0.5 / FILM.FPS, not ${shutter}`);
    return Array.from({ length: samples }, (_, i) => (samples > 1 ? t + (i / (samples - 1) - 0.5) * shutter : t));
  }

  function workLayers(canvas) {
    if (!layers.has(canvas)) layers.set(canvas, [undefined, HALF_FLOATS].map(kept => document.createElement('canvas').getContext('2d', kept)));
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
  }

  window.MotionBlur = { times, expose };
})();
