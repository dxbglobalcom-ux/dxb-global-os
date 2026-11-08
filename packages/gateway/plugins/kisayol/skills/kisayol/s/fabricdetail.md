---
name: fabricdetail
aliases: [kumasdetay, dokuma]
title_tr: Kumaş detayı
title_en: Fabric detail
when_tr: Kaliteyi anlatan yakın plan; dokuma, dikiş, düğme ve astar, ürün sayfası ya da kaydırmalı reklam karesi
when_en: A close-up that proves quality; weave, stitching, buttons and lining for a product page or carousel card
shelf: fashion
role: base
medium: image
inputs: [product-photo]
slots: {detail: "the weave and a seam|a button and its buttonhole|the collar and its inner finish|the cuff and lining", aspect: "4:5|1:1"}
composes_with: [gradeclean, gradecool, gradefilm]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00814, video-000211, ads-00028
version: 1
---

## Prompt

Use the attached product photo as the only source for the garment: keep its exact colour, fabric, weave, stitching, buttons and trims as photographed; do not invent a material it does not have. Make a macro detail of {detail}, framed for {aspect}, the garment lying in a soft natural fold so the fabric rises and falls through the frame. Show what makes it real: individual yarns and their twist, the tiny irregularities of the weave, stitch length and thread tension along the seam, the slight sheen of a pressed edge, a few loose fibres catching the light. Light: one hard, low raking light from the left so the texture casts micro-shadows, a white card on the right keeping the shadows open. Full-frame camera, 100 mm macro lens at f/8, focus stacked so the main detail is sharp from front to back, the fold's far side softening. No people. True colour, restrained grade, fine grain; no oversharpening, no plastic fabric, no perfectly uniform texture. Add no text, letters or logos anywhere; any sewn-in label is shown only as photographed.

## Notes

- codex-image: attach the closest photo of the detail and say "use the attached garment exactly".
- h3-from-still: three seconds, a slow lateral slide across the fabric; 8 steps.
