---
name: herodish
aliases: [kahramantabak, yemekvitrin]
title_tr: Kahraman tabak
title_en: Hero dish
when_tr: Menü, teslimat uygulaması ya da restoran reklamı; tek tabak iştah açan ana görsel olur
when_en: Menu, delivery app or restaurant ad; one plated dish as the appetising key visual
shelf: food-drink
role: base
medium: image
inputs: [product-photo]
slots: {surface: "weathered oak table|honed dark slate|pale limestone counter", time: "late-morning window light|soft overcast daylight|warm late-afternoon light", aspect: "4:5|1:1|9:16", market: "*"}
composes_with: [gradeclean, gradefilm]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-04444, ads-00774
version: 1
---

## Prompt

Use the attached photo as the only source for the dish: keep the exact food, portion size, ingredient count, garnish, plate or bowl and their colours as photographed; do not add, remove or restyle any ingredient. Re-photograph it as a restaurant hero shot on a {surface} in {time}, framed for {aspect}. Camera at a 30-degree angle above the table, full-frame body, 85 mm lens at f/4, the front edge of the dish razor sharp and the back falling gently soft. Motivated light from one window behind and to the left of the dish, so sauces and oils catch a true specular glint and the side facing the camera falls into soft, readable shadow; a white card on the right lifts it slightly. Real food texture: crisp edges, a few crumbs, a drop of sauce on the rim, herbs with tiny bruises, nothing glossed with fake shine. One or two quiet props at the frame edge, set as a restaurant in {market} would set them, a folded napkin and a plain water glass, out of focus. No people. No alcohol and no pork anywhere in the scene. Natural colour, restrained grade, fine film grain; no oversaturation, no plastic-looking food, no fake HDR. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the dish photo and say "use the attached dish exactly; only the setting and light change".
- h3-from-still: a slow four-second push-in toward the dish, constant exposure; 8 steps.
