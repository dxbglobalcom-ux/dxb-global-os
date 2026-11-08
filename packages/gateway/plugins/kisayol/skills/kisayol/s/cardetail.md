---
name: cardetail
aliases: [otodetay, arabamakro]
title_tr: Otomobil detay makrosu
title_en: Car detail macro
when_tr: Kaydırmalı reklam ya da ilan karesi; far, jant, dikiş, boya, rozet çevresi gibi işçilik ayrıntısı
when_en: A carousel or listing card; a headlamp, wheel, stitching, paint or badge surround up close
shelf: automotive
role: base
medium: image
inputs: [product-photo]
slots: {detail: "a headlamp's inner optics|a wheel and brake caliper|the paint and a body crease|the leather stitching of a seat|a door handle", aspect: "1:1|4:5|16:9"}
composes_with: [gradeclean, gradecool, gradefilm, gradelowkey]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00028, house-authored
version: 1
---

## Prompt

Use the attached photo as the only source for the vehicle: keep its exact materials, colours, finishes and the design of every part as photographed; do not invent a detail it does not have. Make a macro detail of {detail}, framed for {aspect}, the detail filling the frame and the body falling away into soft darkness. Show the craft: the layered lenses and reflectors behind a headlamp's glass, the machined spokes and brake dust on a wheel, the depth and flake of the clear-coated paint along a crease, even stitch spacing and the grain of leather, the cold radius of a chrome edge. Light: one long strip light at a low angle from the left so the surface reads, its reflection forming a single clean line, a soft overhead fill. Full-frame camera, 100 mm macro lens with focus stacking at f/11. Real life: a few specks of dust, a faint swirl in the paint under the strip light. No people. Neutral, restrained grade, deep blacks, fine grain; no glow, no fake flares, no plastic surfaces. Add no text, letters or logos anywhere beyond the car's own markings as photographed.

## Notes

- codex-image: attach the closest photo of the detail and say "use the attached vehicle exactly".
- h3-from-still: four seconds, a slow slide along the detail; 8 steps.
