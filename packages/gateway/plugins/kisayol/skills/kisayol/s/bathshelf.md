---
name: bathshelf
aliases: [banyorafi, lavabo]
title_tr: Banyo rafında
title_en: On the bathroom shelf
when_tr: Kişisel bakım, kozmetik, tıraş ve hijyen ürünü; sabah rutininin sakin anı
when_en: Personal care, cosmetics, shaving and hygiene products; the quiet moment of a morning routine
shelf: lifestyle
role: base
medium: image
inputs: [product-photo]
slots: {surface: "white glazed tiles|pale travertine|matte green ceramic tiles|white marble|pale terrazzo|honed grey concrete", time: "early morning|bright midday", aspect: "4:5|9:16|1:1", market: "*"}
composes_with: [bgconcrete, bgmarble, bgterrazzo, gradeclean, gradecool, gradefilm, thirds, windowlight]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-01727, ads-00763, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. The product stands on a shelf of {surface} beside a basin in a home bathroom in {market}, in the {time}, just used: its cap set down beside it, a few water droplets on the shelf and on the product's shoulder, a folded cotton towel with a soft crease, a glass with a wooden toothbrush, a small round mirror catching part of the window. Fine fog fading at the mirror's edge from a warm shower. No people. Light: diffuse daylight from a frosted window high on camera-left, soft wrap on the product, a crisp window-shaped highlight on its glossy surfaces, water drops each with its own tiny highlight and shadow. Full-frame camera, 60 mm macro lens at f/4, product at eye level, framed for {aspect}; tiles behind fall softly out of focus while their grout lines stay straight. Real materials: glaze with tiny pits, grout slightly darker in the corners, towel loops and lint. Clean but lived-in, never sterile. Restrained cool-neutral grade, fine grain; no plastic gloss, no fake steam glow. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly; water drops sit on it, the label stays clear".
- h3-from-still: one drop runs down the product's side, the mirror fog clears slowly; four seconds; 8 steps.
