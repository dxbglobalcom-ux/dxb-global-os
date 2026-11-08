---
name: seamloop
aliases: [kusursuzdongu, sonsuzdongu]
title_tr: Kusursuz döngü
title_en: Seamless loop
when_tr: Ürün sayfası, web kahraman alanı ya da dijital ekran için sonsuz dönen sakin ürün videosu
when_en: A calm, endlessly looping product video for a product page, a web hero or a digital screen
shelf: platform-video
role: base
medium: video
inputs: [product-photo]
slots: {loop: "a slow orbit of the camera through 30 degrees and back along the same path|ripples spreading across a thin film of water around the base|a soft caustic light from rippled glass drifting across the product", background: "a honed travertine plinth|a dark slate surface|a seamless warm grey paper sweep", aspect: "16:9|1:1|4:5|9:16"}
composes_with: []
conflicts: []
cast: none
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: video-000015, video-012817, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed, the same in every frame; do not redraw or restyle it. A six-second seamless loop framed for {aspect}: the final frame is identical to the first in product position, camera position, light and every reflection, so it repeats with no jump or flash. The product stands on {background}. The only motion: {loop}, continuous and even, no acceleration at the start or end. Nothing else moves; the product's shadow and reflections change only as that motion truly makes them. Lighting: one large soft source high camera-right, a dark flag camera-left for shape, a subtle rim from behind. Real materials: wet surfaces show true transmitted and reflected light, stone and paper show fine grain and tiny imperfections. Medium-format camera, 100 mm macro lens at f/8, camera slightly above product height. Calm, premium pace. Restrained grade, accurate colour, fine grain; no morphing, no flicker, no exposure pumping, the label unchanged. No people. Add no text, letters or logos anywhere.

## Notes

- h3: product photo as `<Picture 1>`; six seconds; 8 steps. Play it twice before handing on; a visible jump fails it.
- h3-from-still: a showcase still in the same aspect as first frame; 8 steps.
- For the Meta feed take feedloop45, which carries the 4:5 framing rules.
