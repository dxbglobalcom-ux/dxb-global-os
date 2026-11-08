---
name: ingredientspread
aliases: [icindekiler, malzemeler]
title_tr: Malzeme yayılımı
title_en: Ingredients spread
when_tr: Ambalajlı gıda, sos, çorba ya da içecek; içindekileri ürünün etrafında gerçek malzemeyle anlatır
when_en: Packaged food, sauce, soup or drink; tells what is inside with the real ingredients around it
shelf: food-drink
role: base
medium: image
inputs: [product-photo]
slots: {surface: "flour-dusted oak board|cool grey concrete|unbleached linen", view: "straight overhead|three-quarter from above", aspect: "4:5|1:1|9:16"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ig-017818, ads-04446
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Place it at the centre of a {surface}, photographed {view}, framed for {aspect}. Around it, in a loose, unforced arrangement, lie the raw ingredients its own pack names or shows, and only those: whole pieces beside cut ones, a few seeds and leaves scattered, a small ceramic dish holding a spice, one ingredient half-peeled. Odd numbers, varied heights, generous breathing room; no symmetrical grid, nothing floating. Light: soft directional daylight from the top-left as if from a large window, crisp short shadows to the lower right, a white card opposite. Full-frame camera, 50 mm lens at f/8, everything sharp from edge to edge. Real produce with imperfections: a blemish on a tomato skin, a curled herb leaf, a crack in a garlic clove. No people. No alcohol and no pork anywhere. Natural colour, restrained grade, fine grain; no oversaturation, no waxy fruit. Add no text, letters or logos anywhere.

## Notes

- Read the ingredient list from the client's pack before writing; an ingredient not in the product is never shown.
- codex-image: attach the product photo and say "use the attached product exactly".
