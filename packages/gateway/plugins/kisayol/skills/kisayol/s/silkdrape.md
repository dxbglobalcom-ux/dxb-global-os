---
name: silkdrape
aliases: [ipek, ipekuzerinde]
title_tr: İpek üzerinde
title_en: Silk drape
when_tr: Kolye, küpe, broş; parça dökümlü ipeğin kıvrımlarında, yumuşak ve zarif bir editoryal kare
when_en: Necklace, earrings or brooch; the piece in the folds of draped silk, a soft editorial frame
shelf: jewellery
role: base
medium: image
inputs: [product-photo]
slots: {silk: "ivory silk|dusty rose silk|deep emerald silk|midnight blue silk", aspect: "4:5|1:1|9:16"}
composes_with: [gradeclean, gradecool, gradefilm]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the piece: keep its exact design, metal colour and finish, stones, size and proportions as photographed; do not add or restyle anything. Lay it in the soft folds of {silk}, framed for {aspect}: the fabric rises in broad, slow waves and the piece rests in the valley of one fold, its chain following the curve naturally under gravity. The silk behaves like silk: liquid highlights running along the crests, a slight colour shift in the shadows, fine slub in the weave visible close up. Light: one large soft source from the upper right grazing the folds, a small hard spot just for the stones and the polished edges, deep soft shadow in the troughs. Full-frame camera, 100 mm macro lens at f/5.6, camera at 40 degrees above, the piece sharp, the nearest and farthest folds dissolving softly. No people. Elegant, restrained grade, fine grain; no plastic satin, no glow halos, no oversaturation. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached piece exactly".
- h3-from-still: five seconds, the silk shifts slowly as if a breeze lifted it, the piece staying in place; 8 steps.
