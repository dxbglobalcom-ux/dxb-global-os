---
name: bedside
aliases: [komodin, yatakbasi]
title_tr: Komodinde, akşam
title_en: On the bedside table, evening
when_tr: Gece bakımı, uyku, okuma, şarj edilen cihaz; günün sonundaki sakin an
when_en: Night care, sleep, reading, charging devices; the calm moment at the end of the day
shelf: lifestyle
role: base
medium: image
inputs: [product-photo]
slots: {lamp: "a linen-shaded table lamp|a brass reading lamp|the blue last light from a window", aspect: "4:5|9:16|1:1"}
composes_with: []
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. The product stands on a wooden bedside table late in the evening, lit by {lamp}: a closed book with a plain cover and a bookmark ribbon, reading glasses folded on it, a glass of water half full, a crumpled corner of a cotton duvet entering the frame. No people in frame. The lamp is the only motivated source: warm light falling off quickly across the table, a soft round pool, the product's near side bright and its far side sinking into shadow, a small warm highlight on its gloss. The dark corners keep detail. Full-frame camera, 50 mm lens at f/2, at the height of the table, framed for {aspect}; the product sharp, the bed a soft dark shape behind. Real materials: oiled wood with a water ring, crumpled cotton, glass with a refracted lamp spot. Fine grain, slightly more in the shadows as in a real low-light photo; restrained warm grade, no neon, no glowing outlines, no evenly brightened darkness. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: the lamp light holds steady, a slow push-in of five centimetres over four seconds; 8 steps.
