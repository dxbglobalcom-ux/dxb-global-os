---
name: botanicalmacro
aliases: [bitkisel, hammadde]
title_tr: Bitkisel içerik yakın planı
title_en: Ingredient macro
when_tr: Doğal içerikli kozmetik; ürünü içindeki gerçek bitki ve hammaddelerle yakın planda anlatır
when_en: Natural-ingredient cosmetics; the product told through the real botanicals in its formula
shelf: cosmetics
role: base
medium: image
inputs: [product-photo]
slots: {light: "morning sun through leaves|soft overcast north light", aspect: "4:5|1:1|9:16"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-04515
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Lay it on its side or stand it on a slab of rough natural stone, framed for {aspect}, in {light}. Close around it sit the real raw ingredients its formula names, and only those: a split fruit with its flesh glistening, a sprig of the herb with one leaf torn, a few seeds, a small heap of the clay or a honeycomb fragment, each at true scale. The camera is so close that the ingredients' surfaces read in full: hairs on a leaf, oil pores in a citrus peel, crystals of raw sugar. Full-frame camera, 100 mm macro lens at f/5.6, eye level with the stone, the nearest ingredient and the product's label both in focus, the rest falling softly away. Motivated light with a clear direction from the upper left, real shadow under every piece. No people. Natural, gently warm grade, fine grain; no oversaturated fruit, no waxy leaves, no floating objects. Add no text, letters or logos anywhere.

## Notes

- Show only ingredients on the client's INCI list; nothing implied that the product does not contain.
- codex-image: attach the product photo and say "use the attached product exactly".
