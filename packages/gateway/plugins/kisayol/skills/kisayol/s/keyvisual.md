---
name: keyvisual
aliases: [anakampanya, kv]
title_tr: Kampanya ana görseli
title_en: Campaign key visual
when_tr: Bir kampanyanın bütün mecralara uyarlanacak tek ana görseli; lansman, sezon kampanyası, marka hikâyesi
when_en: The one master image a campaign adapts to every channel; launch, seasonal campaign, brand story
shelf: poster-keyvisual
role: base
medium: image
inputs: [product-photo]
slots: {world: "a sculpted sand-dune landscape at first light|monumental pale stone architecture with deep shadows|a calm sea horizon under a high, clean sky|a quiet forest floor in shafts of light", space: "the upper third|the left third|the right third", aspect: "16:9|4:5|9:16|2:3"}
composes_with: [gradeclean, gradecool, gradefilm, heroangle]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00208, ads-04536
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Build one campaign key visual: the product, larger than life, set into {world}, so that the place carries the campaign's idea and the product is its single, unmistakable centre. Framed for {aspect}, with {space} left as calm, uncluttered space of even tone for the campaign's message laid in post. One clear light idea: a single natural key with a named direction, low sun from behind camera-left raking across the scene and across the product's face, a soft sky fill, long true shadows that tie the product to the ground. The world is photographed, not rendered: real sand grains, stone pores, water texture, haze in the distance for depth. A colour story of two or three tones taken from the product itself, carried through the setting. Full-frame camera, 35 mm lens at f/8, camera low, near the product's base. Filmic contrast, restrained saturation, fine grain; no fantasy glow, no lens-flare spam. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; it is the hero of the scene".
- Render at the widest ratio first and keep the product central so the 4:5 and 9:16 crops come from the same image.
- h3-from-still: a six-second slow push-in, haze drifting, constant exposure; 8 steps.
