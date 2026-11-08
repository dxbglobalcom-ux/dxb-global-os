---
name: macrotexture
aliases: [makro, dokuyakin]
title_tr: Makro doku çekimi
title_en: Macro texture shot
when_tr: Malzeme kalitesini ve işçiliği yakından göstermek; kumaş, deri, krem, metal, cam; ürün sayfasının detay görseli
when_en: Shows material quality and craft up close; fabric, leather, cream, metal, glass; the detail image of a product page
shelf: studio-product
role: base
medium: image
inputs: [product-photo]
slots: {focus: "the main material surface|an edge, seam or stitch line|the cap, clasp or closure", aspect: "1:1|4:5|16:9"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00028, ads-01582, ads-01584
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Make an extreme macro photograph of {focus} of this same product, framed for {aspect}, the detail filling the frame so the material itself is the subject. Show what only a macro lens sees: the weave or grain, pores in leather, brushed lines in metal, tiny bubbles in glass or cream, the true edge thickness, a single honest flaw such as a loose fibre or a faint tool mark. Lighting: one small hard light at a low raking angle from camera-left so the texture casts micro-shadows, a white card opposite to keep the shadows open. Very shallow depth of field: a thin plane sharp, falling off smoothly into creamy blur with real lens bokeh. Full-frame camera, 100 mm macro lens at 1:1 magnification, f/5.6. Accurate colour matching the photo, restrained grade, fine grain; no oversharpening, no fake detail, no glowing edges. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo, ideally one close photo of the chosen area, and say "use the attached product exactly; this is a macro of its real surface".
- h3-from-still: a four-second slow focus pull across the surface, locked camera; 8 steps.
