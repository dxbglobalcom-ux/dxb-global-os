---
name: emailheader
aliases: [epostabasligi, bulten]
title_tr: E-posta başlık görseli
title_en: Email header image
when_tr: Bülten ya da kampanya e-postasının en üstündeki geniş görsel; açık ve koyu modda temiz durur
when_en: The wide image at the top of a newsletter or campaign email; reads cleanly in light and dark mode
shelf: platform-ads
role: base
medium: image
inputs: [product-photo]
slots: {aspect: "3:1|2:1", background: "a warm mid-tone plaster wall|a soft mid-grey linen backdrop|a muted colour taken from the product"}
composes_with: [gradeclean, gradecool, gradefilm, windowlight]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: unavailable}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Create a wide email header photograph at {aspect}, designed for a 600-pixel-wide email column. The product lies or stands in the right third, three-quarter view, sharp, filling about 70% of the frame's height; the left two thirds are {background} in soft, even light, continuous and calm, for the client's copy and mark laid in post. The frame is mid-toned edge to edge, never pure white and never pure black at the borders, so it sits well in both light and dark mail apps. Lighting: soft window light from camera left travelling across the open area to the product, a gentle shadow falling right, a small bounce lifting the shadow side. Real materials with honest small imperfections, true reflections. Full-frame camera, 85 mm lens at f/5.6, camera at product height, level horizon. The product reads at small size: clear silhouette, the brightest point on the product. Restrained grade, accurate colour, fine grain; no vignetting, no fake HDR, no glowing edges. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- Export at 1200 px wide for sharp screens; check it once on a dark-mode mail view before handing it on.
