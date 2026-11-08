---
name: 3dbillboard
aliases: [billboard3d, reklampanosu]
title_tr: 3B köşe billboard
title_en: 3D corner billboard
when_tr: Lansman ya da kampanya; ürün şehir ölçeğinde, dev anamorfik ekranda gösterilir
when_en: Launch or campaign; the product shown city-size on a giant anamorphic screen
shelf: outdoor-ooh
role: base
medium: image
inputs: [product-photo]
slots: {time: "blue hour|golden hour|night", aspect: "4:5|9:16|1:1", market: "*"}
composes_with: [bluehour, centered, goldenhour, gradeclean, gradecool, gradefilm, gradelowkey, heroangle, neonnight, street35, thirds]
conflicts: []
cast: house
forms: {codex-image: ok, seedream: unavailable, klein-ref: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show it as a giant anamorphic 3D display on the curved corner screen of a glass-and-steel tower above a busy junction in a city of {market}, its streets and buildings those of that city, at {time}; the product leans out past the screen's bezel and casts a real shadow on the facade. Photographed from street level across the junction, full-frame camera, 35 mm lens, slight upward tilt, framed for {aspect}. Passers-by in the background are adult men only, in natural motion blur, faces not readable. Real materials: brushed-metal bezel with fine scratches, glass with layered sky reflections, stained concrete, wet asphalt reflections. Motivated light: the screen's own glow adds a cool fill to the pavement. Natural exposure, restrained grade, fine film grain; no glow halos, no fake HDR, no plastic surfaces. Add no text, letters or logos anywhere; leave the screen's lower band a plain dark panel for the client's mark laid in post.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: from the chosen still, a six-second slow push-in from street level, constant exposure, no cuts; 8 steps.
- If the engine garbles the product's own label, the real label is laid in post (rule f).
