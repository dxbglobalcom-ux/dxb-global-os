---
name: steamrise
aliases: [buhar, sicakyemek]
title_tr: Buharı tüten yemek
title_en: Rising steam
when_tr: Sıcak yemek ve içecek; çorba, pilav, çay, kahve sıcaklığını gösteren karanlık, sinematik görsel
when_en: Hot food and drink; soup, rice, tea or coffee shown hot in a dark, cinematic frame
shelf: food-drink
role: base
medium: image
inputs: [product-photo]
slots: {background: "near-black painted wall|deep charcoal linen|dark walnut panel", aspect: "4:5|9:16|1:1"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: video-000038, video-000216, video-000210
version: 1
---

## Prompt

Use the attached photo as the only source for the dish or drink: keep the exact food, vessel, portion and colours as photographed; do not add, remove or restyle anything. Place it on a dark matte table against a {background}, framed for {aspect}, low and close. A single hard light from behind and slightly to the right backlights the steam so it rises as thin, uneven wisps that curl and thin out above the vessel, never a uniform fog; the front of the food is lit only by a small soft fill from the left. Full-frame camera, 100 mm macro lens at f/5.6, camera at table height looking slightly down, the nearest surface of the food sharp. Real texture: a skin forming on a sauce, tiny bubbles at the rim, a single drip down the side of the cup or bowl. Physically plausible shadows, deep but not crushed blacks. No people. No alcohol anywhere in the scene. Restrained warm grade, fine film grain; no glow halos, no fake smoke effects, no oversharpening. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached dish exactly; only the setting and light change".
- h3-from-still: a locked-off four-second take in which only the steam moves, rising and curling naturally; the food stays perfectly still; 8 steps.
