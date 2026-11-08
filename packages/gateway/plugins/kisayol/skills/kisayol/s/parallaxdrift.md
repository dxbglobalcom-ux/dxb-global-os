---
name: parallaxdrift
aliases: [paralaks, derinlikkayma]
title_tr: Fotoğraftan hafif paralaks
title_en: Subtle parallax from a still
when_tr: Elde onaylı tek bir ürün fotoğrafı var; ürün sayfası, sosyal reklam, web sitesi döngüsü
when_en: One approved product still at hand; product page, social ad, website loop
shelf: image-to-video
role: base
medium: video
inputs: [product-photo]
slots: {move: "a slow push-in of a few centimetres|a slow left-to-right dolly of a few centimetres|a slow rise of a few centimetres", aspect: "9:16 at 640x1152|4:5|1:1|16:9"}
composes_with: []
conflicts: []
cast: none
forms: {h3-from-still: ok, h3: unavailable, seedance: unavailable, kling: unavailable}
status: candidate
samples: []
provenance: video-000181, video-000183, video-000217
version: 1
---

## Prompt

Use the attached still as the exact first frame and the only source for the product: its shape, proportions, colours, materials, position and its own label stay exactly as photographed for the whole clip; the product never moves, morphs, flickers or redraws. A six-second single continuous shot, framed for {aspect}. The camera makes {move}, constant speed with a soft ease at both ends, so the scene gains real depth: the foreground edge slides a little faster than the product, the background a little slower, exactly as a real camera move would separate them. The product keeps its perspective consistent with the move and does not bend. Light stays as photographed: same direction, same softness, same shadows; highlights shift only as much as the small move makes them. Lens behaviour of a full-frame cinema camera with a 65 mm lens: background blur stays steady, no focus breathing jumps. Real materials as in the still, fine grain over the whole frame. Restrained grade matching the still. No warping at the product's edges, no rubbery background, no glow, no flicker, no cuts, no added objects. No people. Add no text, letters or logos anywhere.

## Notes

- h3-from-still: attach the still; 8 steps. Small moves only: a large move makes the engine invent hidden sides.
- Picture only.
