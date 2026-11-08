---
name: beforeafter
aliases: [farkgorseli, ikiyarim, kiyasla, muadilkarsi]
title_tr: Önce-sonra ya da muadille karşılaştırma
title_en: Before and after, or side by side with a generic
when_tr: Ürünün gözle görülen bir işi yaptığı iş (temizlik, düzen, bakım) ya da markasız sıradan bir muadille kıyas; fark gerçek ve iddia doğru
when_en: A job where the product does a visible job (cleaning, organising, care), or a side-by-side with a plain unbranded generic; the difference is real and the claim is true
shelf: lifestyle
role: base
medium: image
inputs: [product-photo]
slots: {change: "cluttered to organised|stained to clean|dull to polished|dry and worn to cared-for|a plain unbranded generic of its kind beside the product itself", layout: "side by side|top and bottom", aspect: "1:1|4:5|9:16", market: "*"}
composes_with: [gradeclean, gradecool, gradefilm, windowlight]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: unavailable}
status: candidate
samples: []
provenance: ads-01559, ads-01561, ads-00011, ads-00324, ads-01576, ads-01573, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. One image made of two photographs of the same real place, as it looks in {market}, arranged {layout} with a thin plain gap between them, framed for {aspect}. Both halves are shot from the identical locked-off camera position, with the same lens, the same height and the same daylight from camera-left, so the only difference is the change: {change}. First half: the honest before, ordinary and believable, not mocked and not exaggerated into disgust or ruin; a generic is a plain object of the same kind with no marks, no brand cues and no resemblance to any real rival, simply less refined in material and finish. Second half: the same place after the product has done its work, or the product itself in the generic's place, label to the lens, used and in its place. The improvement shows only what the product really does; nothing else in the scene is upgraded, moved or added. If hands appear they belong to an adult man or an elderly woman from our own cast, faces out of frame. Full-frame camera, 35 mm lens at f/5.6, everything in focus in both halves. Real materials and real imperfection in both halves: the after state is clean, not new. A plain band across the top of both halves stays clear for the client's copy laid in post. Restrained identical grade on both halves, fine grain; no glow on the after half, no darkening of the before half, no ticks, crosses or icons. Add no text, letters, arrows, numbers or logos anywhere; labels for the two halves are laid in post if the job wants them.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly; two matched halves".
- Not for skin, body or health results: those need a real, recorded case and the client's evidence, never a generated one.
- The job records the claim; if it cannot be backed, this recipe is not used.
