---
name: garmentflatlay
aliases: [giysiserme, kiyafetduz]
title_tr: Giysi düz serme
title_en: Garment flat lay
when_tr: Moda sosyal medya ve katalog; giysi ve tamamlayıcıları yukarıdan, düzenli bir kombin olarak
when_en: Fashion social and catalogue; the garment with its companions from above, as a composed outfit
shelf: fashion
role: base
medium: image
inputs: [product-photo]
slots: {surface: "unbleached linen sheet|pale oak floorboards|warm off-white paper", season: "spring|summer|autumn|winter", aspect: "4:5|1:1|9:16"}
composes_with: [gradeclean, gradecool, gradefilm, topdown]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-01627, ads-01624, ads-00793
version: 1
---

## Prompt

Use the attached product photo as the only source for the garment: keep its exact cut, proportions, colour, fabric, stitching, trims and its own labels as photographed; do not redraw, restyle or recolour it. Lay it flat on a {surface}, photographed straight down, framed for {aspect}, styled as a {season} outfit: the garment as the hero, slightly off centre, with sleeves folded inward in a natural, unforced way and one small fold of the hem turned back to show the inside. Around it only a few plain companions that belong to the season, unbranded: a pair of shoes, a folded scarf, a leather belt coiled loosely, sunglasses or gloves; nothing overlaps the hero and the spaces between items are even but not rigid. Light: soft daylight from the top of the frame, very short soft shadows showing the garment's thickness. Camera on an overhead rig, 50 mm lens at f/8, sensor parallel to the floor, everything sharp. Real fabric texture, a few relaxed creases, a loose thread at a seam. No people. True colour, restrained grade, fine grain; no plastic sheen, no perfectly ironed cardboard look. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the garment photo and say "use the attached garment exactly".
- h3-from-still: three seconds overhead, a slow rise of the camera away from the outfit; 8 steps.
