---
name: twilightexterior
aliases: [aksamcephe, gecedis]
title_tr: Alacakaranlıkta dış cephe
title_en: Exterior at twilight
when_tr: Satılık ya da kiralık mülk ilanının kapak görseli; ev akşam mavisinde, pencereleri sıcak ışıkla
when_en: Cover image of a sale or rental listing; the house in evening blue, its windows glowing warm
shelf: real-estate
role: base
medium: image
inputs: [product-photo]
slots: {sky: "clear deep-blue twilight|twilight with thin high clouds lit pink", aspect: "3:2|16:9|4:5"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00039, house-authored
version: 1
---

## Prompt

Use the attached photograph of the property as the only source for it: keep the building's exact architecture, materials, colours, windows, doors, roof, garden, trees, fences and surroundings as photographed; add nothing that is not there, remove nothing that is there, and do not enlarge, tidy or improve the property. Change only the time: re-light the same view as the blue moment after sunset, a {sky}, framed for {aspect}. Every interior room visible through a window glows with warm, slightly uneven tungsten light, brighter near the lamps and falling off toward the corners; existing exterior fixtures, porch and path lights are switched on and throw real pools of light on walls and paving; nothing glows that has no lamp. The facade keeps a soft cool ambient fill so its materials stay readable; wet or glossy surfaces carry faint true reflections. Architectural camera: the same viewpoint as the photograph, perfectly vertical walls with corrected perspective, 24 mm tilt-shift lens at f/8. No people, no cars that are not in the photograph. Balanced warm-and-cool grade, natural exposure, fine grain; no fake HDR halos, no oversaturated sky, no glowing edges. Add no text, letters or logos anywhere.

## Notes

- Many markets require an altered sky or virtual twilight to be disclosed in the listing; the disclosure goes in the listing copy, never inside the image.
- codex-image: attach the exterior photo and say "use the attached property exactly; only the time of day changes".
- h3-from-still: six seconds locked, the sky deepens slowly and the window light grows; 8 steps.
