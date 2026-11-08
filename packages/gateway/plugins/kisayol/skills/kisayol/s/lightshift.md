---
name: lightshift
aliases: [isikdegisimi, gunesgecisi]
title_tr: Değişen ışık
title_en: Light change on a still
when_tr: Durgun ürün fotoğrafına zamanın geçtiğini hissettirmek; ev, mobilya, kozmetik, yaşam tarzı
when_en: Give a still product photo the feeling of time passing; home, furniture, cosmetics, lifestyle
shelf: image-to-video
role: base
medium: video
inputs: [product-photo]
slots: {change: "window shadows sliding slowly across the surface as the sun moves|a passing cloud softening then restoring the sunlight|leaf shadows swaying gently over the scene", aspect: "9:16 at 640x1152|4:5|1:1|16:9"}
composes_with: []
conflicts: []
cast: none
forms: {h3-from-still: ok, h3: unavailable, seedance: unavailable, kling: unavailable}
status: candidate
samples: []
provenance: video-000223, house-authored
version: 1
---

## Prompt

Use the attached still as the exact first frame and the only source for the product: its shape, proportions, colours, materials, position and its own label stay exactly as photographed for the whole clip; the product never moves, morphs, flickers or redraws. A six-second single continuous shot, framed for {aspect}. Only the light changes: {change}. The light keeps the still's own direction and colour; shadows move as one coherent pattern across surfaces, wrapping honestly over the product's real shape, and its highlights rise and fall with the light without changing its colours or its label. Exposure follows the light the way a real camera on fixed settings would: brighter where the sun lands, never pumping. Everything else is still; the camera is locked off. Real materials as in the still, fine grain over the whole frame, restrained grade matching the still. No lens flares, no glow, no flicker, no cuts, no added objects. No people. Add no text, letters or logos anywhere.

## Notes

- h3-from-still: attach the photo; 8 steps. Needs a still with a clear window or sun direction.
- Picture only.
