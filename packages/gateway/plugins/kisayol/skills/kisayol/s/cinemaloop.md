---
name: cinemaloop
aliases: [sinemagraf, canlidongu]
title_tr: Yaşayan sinemagraf döngüsü
title_en: Living cinemagraph loop
when_tr: Tek bir öğesi kımıldayan sonsuz döngü; web sitesi başlığı, e-posta, dijital ekran, sosyal gönderi
when_en: An endless loop where one element moves; website hero, email, digital screen, social post
shelf: image-to-video
role: base
medium: video
inputs: [product-photo]
slots: {element: "a sheer curtain behind the product breathing in the air|a candle flame beside the product flickering softly|leaves of a plant in the background stirring|a thin stream of liquid pouring into a glass beside the product", aspect: "9:16 at 640x1152|4:5|1:1|16:9"}
composes_with: []
conflicts: []
cast: none
forms: {h3-from-still: ok, h3: unavailable, seedance: unavailable, kling: unavailable}
status: candidate
samples: []
provenance: video-000182, house-authored
version: 1
---

## Prompt

Use the attached still as the exact first frame and the only source for the product: its shape, proportions, colours, materials, position and its own label stay exactly as photographed for the whole clip; the product never moves, morphs, flickers or redraws. A four-second single continuous shot, framed for {aspect}, made to repeat without a visible seam: the last frame matches the first. One element moves and nothing else: {element}. Its motion is small, calm and true to its material, and any light it gives or catches touches nearby surfaces faintly and honestly. The rest of the frame, the product included, is frozen exactly as photographed, like a photograph that breathes. The camera is locked off; no zoom, no drift. Real materials as in the still, fine grain over the whole frame, restrained grade matching the still. No glow, no flicker in the frozen areas, no cuts, no added objects. No people. Add no text, letters or logos anywhere.

## Notes

- h3-from-still: attach the photo; 8 steps. The moving element must already be in the still; the edit makes the loop seamless if the engine does not.
- Picture only.
