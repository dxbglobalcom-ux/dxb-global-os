---
name: levitation
aliases: [havada, yuzenurun]
title_tr: Havada süzülen ürün
title_en: Levitation float shot
when_tr: Ürüne hafiflik ve yenilik duygusu vermek; teknoloji, kozmetik, ayakkabı reklamı
when_en: Gives the product lightness and novelty; tech, cosmetics and footwear ads
shelf: studio-product
role: base
medium: image
inputs: [product-photo]
slots: {backdrop: "pale sage seamless paper|soft sky-blue gradient|warm sand seamless paper|deep graphite seamless paper", tilt: "a gentle 12-degree forward tilt|perfectly upright", aspect: "4:5|1:1|9:16"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00250, ads-00248, ads-04428
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show it floating in mid-air about a hand's width above a matte surface in front of a {backdrop}, held in {tilt}, framed for {aspect}, as if caught by a high-speed flash in a real studio. The float must read as physical: a soft, slightly blurred oval shadow on the surface directly below it, its size and softness matching the gap, and a faint bounce of the backdrop colour on the product's underside. Lighting: a large overhead softbox angled from camera-left as the key, a white card below and in front to open the underside, a thin rim light behind. No visible strings, rods, hands or supports. Real materials with fine texture and true specular highlights. Full-frame camera, 85 mm lens at f/8, camera at the product's height. Clean, restrained grade, accurate colour, fine grain; no glow, no motion trails, no surreal sparkle. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; it floats, nothing else about it changes".
- h3-from-still: a four-second slow bob of a few millimetres with the shadow breathing in step; 8 steps.
