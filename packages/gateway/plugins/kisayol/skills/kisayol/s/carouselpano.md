---
name: carouselpano
aliases: [karusel, panoramakarusel]
title_tr: Kesintisiz panorama karusel
title_en: Seamless panorama carousel
when_tr: Kaydırdıkça devam eden karusel reklam; tek panorama 3-5 kareye bölünür
when_en: A carousel ad that continues as you swipe; one panorama cut into 3-5 square frames
shelf: platform-ads
role: base
medium: image
inputs: [product-photo]
slots: {frames: "3|4|5", setting: "a long honed stone counter against a plaster wall|a pale oak shelf running along a sunlit wall|a continuous seamless sweep in the product's own colour"}
composes_with: [gradeclean, gradecool, gradefilm, windowlight]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: unavailable}
status: candidate
samples: []
provenance: ads-00436
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Create one continuous wide panorama exactly {frames} squares wide and one square tall (aspect {frames}:1), to be cut later into {frames} equal 1:1 frames along invisible vertical lines. The scene is {setting}, photographed as one real place with one light. The product appears once, large, in the first frame, standing so that no cut line passes through it; the following frames continue the same surface and light with a quiet trail of its story: a close detail of the same product at a different angle in the middle, and a calm open stretch in the last frame. Lines that tie the frames together cross every cut: the counter edge, a long soft window shadow, a fold of linen. Each frame stands on its own as a good image. Lighting: soft window light from camera left across the whole panorama, falling off gently to the right. Real materials with small imperfections, true reflections, consistent perspective: a long, level, straight-on view, as if shot with a 50 mm lens from a sliding camera at product height. Restrained grade, accurate colour, fine grain; no visible seams, no repeated tiles, no warped perspective. No people. Add no text, letters or logos anywhere; the last frame's open stretch is kept plain for the client's copy and mark laid in post.

## Notes

- codex-image: attach the product photo; ask for the wide canvas; cut in post into equal squares, as many as the frames slot says, and check that no cut crosses the product.
- If the engine refuses a 5:1 canvas, make it 3:1 and say so with the draft.
