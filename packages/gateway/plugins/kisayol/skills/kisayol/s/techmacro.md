---
name: techmacro
aliases: [cihazmakro, iscilik]
title_tr: Cihaz malzeme makrosu
title_en: Device detail macro
when_tr: Kaliteyi anlatan kaydırmalı reklam ya da ürün sayfası karesi; kenar, düğme, ızgara, bağlantı yeri
when_en: A carousel or product-page card that proves build quality; edge, button, grille or port
shelf: electronics
role: base
medium: image
inputs: [product-photo]
slots: {detail: "an edge chamfer and a button|the speaker grille|a port and its surround|a hinge or dial", aspect: "1:1|4:5|16:9"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00028
version: 1
---

## Prompt

Use the attached product photo as the only source for the device: keep its exact materials, colours, finishes and geometry as photographed; do not invent a detail it does not have. Make an extreme macro of {detail}, framed for {aspect}, the detail filling the frame. Show what engineering looks like up close: the crisp, even chamfer reflecting a thin line of light, the bead-blasted or brushed grain of the metal, the precision gap around a button, the perfect rows of holes in a grille, the depth of a port. Light: one hard raking source low from the right that brings out the surface grain, a large soft source above that draws a clean gradient across the flat faces. Full-frame camera, 100 mm macro lens with focus stacking at f/11, the detail sharp from front to back, the rest of the body falling away into soft darkness. Real imperfection: one speck of dust, a microscopic tooling mark. No people. Neutral, restrained grade, deep blacks, fine grain; no oversharpening, no glowing edges, no plastic surfaces. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the closest photo of the detail and say "use the attached device exactly".
- h3-from-still: four seconds, a slow lateral slide along the edge; 8 steps.
