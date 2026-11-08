---
name: waterripple
aliases: [suhalkasi, dalga]
title_tr: Su halkaları
title_en: Water ripple
when_tr: Nemlendirici, tonik, misel su, temizleyici; ferahlık ve saflığı sığ suda halkalarla gösterir
when_en: Moisturiser, toner, micellar water or cleanser; freshness and purity shown with ripples in shallow water
shelf: cosmetics
role: base
medium: image
inputs: [product-photo]
slots: {water: "clear water over white pebbles|pale aqua water over sand|still water over dark slate", aspect: "4:5|1:1|9:16"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. The product stands upright in two centimetres of {water}, framed for {aspect}. Concentric ripples spread outward from its base as if it had just been set down, their crests catching light; the label stays dry and readable exactly as photographed. Sunlight from high and behind on the right passes through the water and draws moving caustic lines on the bottom and on the base of the product. A few drops cling to its lower edge. Full-frame camera, 85 mm lens at f/8, 35 degrees above the water, the product and the nearest ripple sharp, the far ripples softening. Physically true refraction of the pebbles or sand through the water, real wet sheen on the pack. No people. Fresh, clean, restrained grade, fine grain; no glow halos, no impossible reflections, no plastic water. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: four seconds locked, ripples spreading and caustics moving; 8 steps.
