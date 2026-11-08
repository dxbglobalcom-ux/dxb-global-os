---
name: productmorph
aliases: [urundonusumu, morf]
title_tr: İki ürün arası dönüşüm
title_en: Morph between two products
when_tr: Aynı markanın iki ürünü ya da iki rengi; biri ötekine fiziksel olarak dönüşür
when_en: Two products or two colours of one range; one physically turns into the other
shelf: transitions
role: effect
medium: video
inputs: [product-photo]
slots: {}
composes_with: [bumper6, reelsmoment, preroll15]
conflicts: []
cast: none
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Transition: the first attached product turns into the second attached product in one continuous, physically believable morph of about one second, in the same place, at the same scale, under the same light. The silhouette eases from one outline to the other while surfaces cross over in their own true materials: gloss stays gloss, matte stays matte, metal reflects the same room the whole time; the contact shadow reshapes with the outline. Before the morph the first product is exactly as in its photo; after it the second is exactly as in its photo, each with its own label as photographed. In between no label or marking is invented. No melting, no liquid splash, no flash, no fade; one smooth change, then the second product holds still.

## Notes

- Needs two product photos: h3 takes them as `<Picture 1>` and `<Picture 2>`; 8 steps.
- h3-from-still: start from a still of the first product; the second product photo is the reference; 8 steps.
- Check both ends for label fidelity; the middle frames must not carry readable marks.
