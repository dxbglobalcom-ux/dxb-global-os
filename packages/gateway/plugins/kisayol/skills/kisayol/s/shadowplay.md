---
name: shadowplay
aliases: [golgeoyunu, gunesgolge]
title_tr: Gölge oyunu
title_en: Sun and leaf shadow
when_tr: Parfüm, güneş kremi, cilt bakımı; sert güneş ve yaprak gölgesiyle yaz hissi veren editoryal görsel
when_en: Fragrance, sunscreen or skincare; an editorial summer frame of hard sun and leaf shadow
shelf: cosmetics
role: base
medium: image
inputs: [product-photo]
slots: {shadow: "palm frond shadow|olive branch shadow|window lattice shadow", surface: "lime-washed plaster|warm travertine|sun-bleached terracotta", aspect: "4:5|1:1|9:16"}
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

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Stand it on a ledge of {surface} against a wall of the same material, framed for {aspect}, with generous empty space above. One hard sun from high on the left, unfiltered, throws a crisp {shadow} across the wall and partly across the product, the shadow edges sharp near the object and softening further away. Light passing through a glass or translucent pack throws its own coloured light pool onto the ledge. Real surfaces: fine cracks and brush marks in the plaster, pitting in the stone, a little grit on the ledge. Full-frame camera, 70 mm lens at f/8, eye level with the product, perfectly straight verticals. No people. Warm, sunlit but restrained grade, deep clean shadows, fine grain; no fake HDR, no glow, no oversaturation. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly; only the setting and light change".
- h3-from-still: six seconds locked, the leaf shadow sways slowly in a breeze; 8 steps.
