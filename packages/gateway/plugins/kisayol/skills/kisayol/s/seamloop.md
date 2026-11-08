---
name: seamloop
aliases: [kusursuzdongu, sonsuzdongu, sinemagraf, canlidongu, akisdongu, metadongu]
title_tr: Kusursuz döngü video
title_en: Seamless loop video
when_tr: Ürün sayfası, web başlığı, Meta akışı (4:5), e-posta ya da dijital ekran için sonsuz dönen sakin ürün videosu; sinemagraf dahil
when_en: A calm, endlessly looping product video for a product page, web hero, the Meta feed (4:5), email or a digital screen; cinemagraphs included
shelf: platform-video
role: base
medium: video
inputs: [product-photo]
slots: {loop: "a slow orbit of the camera through 30 degrees and back along the same path|a slow full turn of the product on a hidden turntable|ripples spreading across a thin film of water around the base|a soft caustic light from rippled glass drifting across the product|the soft shadow of leaves drifting across the product and back|a slow rise and fall of a few millimetres as if floating, the shadow breathing with it|a sheer curtain behind the product breathing in the air|the leaves of a plant behind the product stirring|a candle flame beside the product flickering softly", background: "a honed travertine plinth|a dark slate surface|a seamless warm grey paper sweep|a soft sand-coloured plaster wall", aspect: "4:5|16:9|1:1|9:16"}
composes_with: []
conflicts: []
cast: none
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: video-000015, video-012817, video-000182, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed, the same in every frame; do not redraw or restyle it. A six-second seamless loop framed for {aspect}: the final frame is identical to the first in product position, camera position, light and every reflection, so it repeats with no jump or flash. The product stands on {background}; in 4:5 it fills about 55% of the frame height, slightly above centre, so it reads first in a feed. The only motion: {loop}, continuous and even, no acceleration at the start or end. Nothing else moves, like a photograph that breathes; the product's shadow and reflections change only as that motion truly makes them, and any light the moving element gives touches nearby surfaces faintly and honestly. Lighting: one large soft source high camera-right, a dark flag camera-left for shape, a subtle rim from behind. Real materials: wet surfaces show true transmitted and reflected light, stone and paper show fine grain and tiny imperfections. Medium-format camera, 100 mm macro lens at f/8, camera slightly above product height. Calm, premium pace. Restrained grade, accurate colour, fine grain; no morphing, no flicker, no exposure pumping, the label unchanged. No people. Add no text, letters or logos anywhere.

## Notes

- h3: product photo as `<Picture 1>`; six seconds; 8 steps. Play it twice before handing on; a visible jump fails it.
- h3-from-still: a showcase still in the same aspect as first frame; 8 steps. A curtain, plant or flame must already be in that still.
- A full turn only when the job supplies every side; otherwise choose a light or element loop.
