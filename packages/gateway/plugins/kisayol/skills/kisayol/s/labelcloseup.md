---
name: labelcloseup
aliases: [etiketyakin, etiketdetay]
title_tr: Etiket yakın çekimi
title_en: Label close-up
when_tr: Etiketin baskı kalitesini ve özel işlemlerini göstermek; kabartma, yaldız, lak, dokulu kâğıt; premium ambalaj
when_en: Shows the label's print quality and finishes; emboss, foil, spot varnish, textured paper; premium packs
shelf: mockup-packaging
role: base
medium: image
inputs: [product-photo]
slots: {finish: "blind embossing on textured cotton paper|hot-foil detail catching the light|spot gloss varnish on a matte label", aspect: "1:1|4:5|16:9"}
composes_with: [gradeclean, gradecool, gradefilm]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-01584, ads-00028
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw, translate or restyle the label. Make a close-up of the label on the product, framed for {aspect}, the label filling most of the frame and curving gently away at one side, with the finish shown as {finish}. Show what a print buyer looks for: the paper's fibre and tooth, ink sitting on the surface, the crisp edge where the label meets the pack, a raised or recessed area throwing a hairline shadow, foil or varnish flashing only where the light hits. Lighting: one small hard light at a low raking angle from camera-left to reveal relief, a soft white card opposite, a moving highlight across the finish. Shallow depth of field: one band of the label pin-sharp, the rest falling into soft blur with real bokeh. Full-frame camera, 100 mm macro lens at f/4, the lens nearly square to the label. Accurate colour, restrained grade, fine grain; no oversharpening, no invented graphics. No people. Add no text, letters or logos beyond what the label already carries.

## Notes

- codex-image: attach a sharp, close photo of the real label and say "use the attached label exactly".
- Engines garble small print: if any of it changes, the real label is laid in post (rule f), or the sharp band is moved to a plain area of the label.
- h3-from-still: a four-second slow light sweep across the finish, locked camera; 8 steps.
