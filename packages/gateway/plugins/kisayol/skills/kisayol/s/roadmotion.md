---
name: roadmotion
aliases: [yoldahareket, takipcekim]
title_tr: Yolda hareket
title_en: Motion on a road
when_tr: Sürüş hissi isteyen reklam; araç yolda akarken, arka plan hızla bulanık, tekerlekler dönüyor
when_en: An ad that must feel the drive; the car flowing along a road, background streaked, wheels turning
shelf: automotive
role: base
medium: image
inputs: [product-photo]
slots: {road: "a winding coastal road|a mountain pass with stone walls|an empty desert highway|a tree-lined country road", time: "golden hour|soft overcast day|blue hour with headlights on", aspect: "16:9|4:5|9:16"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-05009, house-authored
version: 1
---

## Prompt

Use the attached photo as the only source for the vehicle: keep its exact body shape, proportions, paint colour and finish, wheels, lights, trim and its own badges as photographed; do not redraw, restyle or modify it. Show it driving along {road} at {time}, framed for {aspect}, as a rolling shot taken from a camera car alongside: the car itself sharp, the road surface and the scenery streaked in long horizontal motion blur, the wheels and brake discs blurred by their own rotation, a little road dust or spray lifting behind the rear tyres. The car sits on the road with real weight: a slight body roll in a bend, tyres compressed at the contact patch, its shadow travelling with it. Reflections of the passing scenery stream across the paint and windows; through the glass the cabin is dark and unreadable. The number plate is blank, with no letters or numbers. Full-frame camera, 35 mm lens at 1/30 s shutter, camera at door-handle height, a few metres away. No people visible. Natural, restrained grade, fine grain; no frozen wheels, no warped bodywork, no fake HDR. Add no text, letters or logos anywhere beyond the car's own badges as photographed.

## Notes

- codex-image: attach the car photo and say "use the attached vehicle exactly".
- h3-from-still: six seconds tracking alongside, steady speed, no cuts; 8 steps.
