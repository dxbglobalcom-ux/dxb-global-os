---
name: beforeafter
aliases: [farkgorseli, ikiyarim]
title_tr: Önce ve sonra
title_en: Before and after pair
when_tr: Ürünün gözle görülen bir işi yaptığı iş (temizlik, düzen, bakım); fark ölçülebilir ve iddiası doğrudur
when_en: A job where the product does a visible job (cleaning, organising, care); the difference is real and the claim is true
shelf: lifestyle
role: base
medium: image
inputs: [product-photo]
slots: {change: "cluttered to organised|stained to clean|dull to polished|dry and worn to cared-for", layout: "side by side|top and bottom", aspect: "1:1|4:5|9:16"}
composes_with: []
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: unavailable}
status: candidate
samples: []
provenance: ads-01559, ads-01561, ads-00011, ads-00324, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. One image made of two photographs of the same real place, arranged {layout} with a thin plain gap between them, framed for {aspect}. Both halves are shot from the identical locked-off camera position, with the same lens, the same height and the same daylight from camera-left, so the only difference is the change: {change}. First half: the honest problem state, ordinary and believable, not exaggerated into disgust or ruin. Second half: the same place after the product has done its work, with the product standing in it, label to the lens, used and in its place. The improvement shows only what the product really does; nothing else in the scene is upgraded, moved or added. If hands appear they belong to an adult man or an elderly woman from our own cast, faces out of frame. Full-frame camera, 35 mm lens at f/5.6, everything in focus in both halves. Real materials and real imperfection in both halves: the after state is clean, not new. Restrained identical grade on both halves, fine grain; no glow on the after half, no darkening of the before half. Add no text, letters, arrows, numbers or logos anywhere; labels for the two halves are laid in post if the job wants them.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly; two matched halves".
- Not for skin, body or health results: those need a real, recorded case and the client's evidence, never a generated one.
- The job records the claim; if it cannot be backed, this recipe is not used.
