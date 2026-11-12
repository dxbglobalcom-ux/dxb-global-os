// dxb-motion-graphics — plays the film for a person who opened page/index.html?play.
// A render never loads this file: the picture's only clock there is the time HyperFrames seeks to.
window.ready.then(() => {
  const play = now => {
    window.renderAt((now / 1000) % window.FILM.TOTAL);
    requestAnimationFrame(play);
  };
  requestAnimationFrame(play);
});
