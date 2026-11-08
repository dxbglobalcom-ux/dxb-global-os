---
name: flatlay
aliases: [ustten, duzserim]
title_tr: Üstten düz serim
title_en: Overhead flat lay
when_tr: Ürünü yanındaki eşyalarla kuşbakışı düzenli bir serimde göstermek; moda, kırtasiye, kozmetik, sosyal medya
when_en: The product in an ordered top-down arrangement with companion objects; fashion, stationery, cosmetics, social
shelf: studio-product
role: base
medium: image
inputs: [product-photo]
slots: {surface: "ivory linen|pale oak boards|honed travertine|warm grey paper|white marble|honed grey concrete|pale terrazzo|oiled oak", props: "two or three quiet objects that belong with the product|nothing but the product and its shadow", light: "soft overcast window light|low morning sun", aspect: "1:1|4:5|9:16"}
composes_with: [bgconcrete, bglinen, bgmarble, bgterrazzo, bgwood, gradeclean, gradecool, gradefilm, topdown]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00125, ads-01624, ads-01626, ads-00793
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Photograph it from directly overhead as a flat lay on {surface}, framed for {aspect}, with {props}. The product is the hero, placed off-centre on a thirds point; companion objects are real, unbranded and in a palette that serves the product's own colours, set on a quiet grid with generous breathing room and one item slightly askew so it feels arranged by a person, not a machine. Light: {light} from the top of the frame, giving soft directional shadows that fall the same way for every object. Real surface texture: linen weave and creases, wood grain, stone pores, paper tooth. Full-frame camera on an overhead rig, 50 mm lens at f/8, sensor perfectly parallel to the surface so nothing keystones. Restrained grade, true colour, fine grain; no plastic sheen, no fake shadows. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; seen from above".
- h3-from-still: a four-second slow overhead drift across the layout; 8 steps.
