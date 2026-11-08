---
name: lifestyleshot
aliases: [yasamtarzi, gunlukhayat]
title_tr: Yaşam tarzı çekimi
title_en: Lifestyle shot
when_tr: Ürünü gerçek hayattan, yaşanmış bir sahnede gösterir; sosyal medya ve reklam görseli
when_en: Shows the product in a real, lived-in scene; social and ad visuals
shelf: lifestyle
role: base
medium: image
inputs: [product-photo]
slots: {setting: "kitchen counter|window-side desk|bathroom shelf", surface: "white marble|oiled oak|honed grey concrete|pale terrazzo", time: "morning|late afternoon|golden hour", aspect: "4:5|1:1|9:16", market: "*"}
composes_with: [bgconcrete, bglinen, bgmarble, bgterrazzo, bgwood, goldenhour, gradeclean, gradecool, gradefilm, negspace, rimlight, thirds, windowlight]
conflicts: []
cast: house
forms: {codex-image: ok, seedream: unavailable, klein-ref: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Place it naturally on a {setting} of {surface} in {time} window light, framed for {aspect}, as if photographed in a real home in {market} a moment before use, the room and its everyday things those of a home there. The scene is lived-in but calm: a few honest everyday objects slightly out of order, a folded linen cloth, a ceramic cup; nothing competes with the product. If a hand appears it is an adult man's hand from our own cast, relaxed and natural, with real skin texture and visible pores. Shot on a full-frame camera, 50 mm lens at f/2.8, eye-level to slightly above, the product sharp and the background softly out of focus with real lens bokeh. Motivated light from the window, soft natural shadows, true reflections. Restrained grade, fine film grain; no airbrushed skin, no plastic surfaces, no fake HDR. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: a slow four-second drift toward the product from the chosen still; 8 steps.
