---
name: rippleloop
aliases: [sudalga, sudalgalari]
title_tr: Su dalgalanması döngüsü
title_en: Water ripple loop
when_tr: Su ya da ıslak yüzeyli ürün fotoğrafını canlandırmak; cilt bakımı, içecek, spa, temizlik
when_en: Bring a product photo with water or a wet surface to life; skincare, drinks, spa, cleaning
shelf: image-to-video
role: base
medium: video
inputs: [product-photo]
slots: {motion: "a single drop falling beside the product and sending slow rings outward|a gentle surface ripple drifting across the pool|soft caustic light patterns wavering on the surface", aspect: "9:16 at 640x1152|4:5|1:1|16:9"}
composes_with: []
conflicts: []
cast: none
forms: {h3-from-still: ok, h3: unavailable, seedance: unavailable, kling: unavailable}
status: candidate
samples: []
provenance: video-000709, house-authored
version: 1
---

## Prompt

Use the attached still as the exact first frame and the only source for the product: its shape, proportions, colours, materials, position and its own label stay exactly as photographed for the whole clip; the product never moves, morphs, flickers or redraws. A six-second single continuous shot, framed for {aspect}, that loops cleanly. Only the water moves: {motion}. Rings spread evenly, lose height as they widen, and bend around the product's base where it meets the water; reflections of the product and the light wobble with the surface and re-form, true to the product's real colours. Real water: clear, with tiny suspended specks, a thin meniscus where it touches the product, gravity-true drop and splash. Everything else is still; the camera is locked off. Real materials as in the still, fine grain over the whole frame, restrained grade matching the still. No glow, no sparkle, no flicker, no cuts, no added objects. No people. Add no text, letters or logos anywhere.

## Notes

- h3-from-still: attach a still that already shows water (the image recipe `waterripple` makes one); 8 steps.
- Picture only.
