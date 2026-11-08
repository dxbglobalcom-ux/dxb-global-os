---
name: drinkpour
aliases: [dokum, icecekdokum]
title_tr: İçecek dökülüşü
title_en: Drink pour
when_tr: Alkolsüz içecek markası; şişeden bardağa akan anın canlı, ferah reklam görseli
when_en: Non-alcoholic drink brand; the fresh moment the drink pours from bottle into glass
shelf: food-drink
role: base
medium: image
inputs: [product-photo]
slots: {background: "soft daylight-white seamless|pale sage gradient|sunlit terracotta wall", aspect: "4:5|9:16|1:1"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-04515, video-003124
version: 1
---

## Prompt

Use the attached product photo as the only source for the bottle or can: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. The drink is a non-alcoholic beverage in exactly the colour the product shows. Freeze the instant of the pour: the product tilted above a clear, heavy-based tumbler, a continuous stream of the drink entering the glass, a crown of small bubbles and a few airborne droplets frozen around the impact, the level a third of the way up. Set against a {background}, framed for {aspect}. Light: a large softbox behind the glass so the liquid glows from within, two narrow strip lights at the sides drawing clean highlights along the bottle and the glass, a little fill from the front so the label reads naturally. Full-frame camera, 90 mm lens at f/8, eye level with the rim of the glass, a fast flash freeze with no motion smear. Real condensation beads on the cold glass, one drop running down. No people, no hands. No alcohol, no stemmed glassware, nothing that suggests a bar. Clean, fresh grade, accurate colour, fine grain; no plastic liquid, no impossible splashes. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: two seconds of the pour continuing in slow motion, locked camera; 8 steps.
- A drink whose label or content is alcoholic is refused, whatever the brief says.
