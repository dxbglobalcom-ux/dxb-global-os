---
name: displayset
aliases: [gorselagi, displayreklam, banneriset]
title_tr: Görüntülü reklam ağı seti
title_en: Display-network ad set
when_tr: Google görüntülü reklam ağı gibi duyarlı reklamlar; tek kare 1.91:1, 1:1 ve 4:5'e kırpılabilir kurulur
when_en: Responsive display-network ads; one master frame built to crop cleanly to 1.91:1, 1:1 and 4:5
shelf: platform-ads
role: base
medium: image
inputs: [product-photo]
slots: {background: "a soft graded wall in the product's own colour|warm sand seamless|cool pale grey seamless"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: unavailable}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Create one landscape master frame at 1.91:1 on {background}, built so the same image can be cropped to 1:1 and 4:5 without losing anything that matters. The product stands in the exact centre, inside a central safe square whose height is the frame's height, filling about 55% of that square's height, upright and three-quarter to camera; nothing important lies outside the central square. The wings left and right are continuous, calm background with soft tonal falloff, no objects, no hard lines, so they can be cut away or carry the client's copy and mark in post. The product must read at small display sizes: clean silhouette, strong value contrast with the ground, the brightest point on the product. Lighting: a large soft key from high camera left, a white fill card right, a thin rim from behind to separate it from the ground, a soft contact shadow centred under the product. Real material behaviour with small imperfections. Medium-format camera, 100 mm lens at f/8, camera at product height, perfectly level. Restrained grade, accurate colour, fine grain; no vignetting, no glowing edges, no fake HDR. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- In post: crop 1:1 and 4:5 from the centre; sizes such as 300 x 250 or 728 x 90 are crops or new layouts, never enlargements.
