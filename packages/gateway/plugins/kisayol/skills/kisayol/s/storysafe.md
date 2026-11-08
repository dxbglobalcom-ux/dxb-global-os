---
name: storysafe
aliases: [hikayevideo, hikayebantli]
title_tr: Güvenli alanlı hikâye reklamı
title_en: Story ad with safe zones
when_tr: Instagram/Facebook hikâye ya da Reels yerleşimi; arayüzün örttüğü bantlar boş kalır
when_en: Instagram/Facebook Stories or Reels placement; the bands the interface covers stay clear
shelf: platform-video
role: base
medium: video
inputs: [product-photo]
slots: {background: "a soft grey-to-white gradient|a seamless warm grey paper sweep|a deep charcoal sweep with a soft pool of light", bottom_clear: "35%|20%", motion: "the product rises slowly into the central band and settles|a slow straight push-in that keeps the product inside the band|a soft band of light sweeps once across the product"}
composes_with: []
conflicts: []
cast: none
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed, the same in every frame; do not redraw or restyle it. A full-screen vertical 9:16 video of five seconds on {background}. Safe zones are part of the design in every frame: the top 14% and the bottom {bottom_clear} hold no part of the product and no important detail, only calm continuous background, because the platform's interface covers them. Motion: {motion}. The product sits upright in the central band, about 60% of the band's height, slightly above the band's middle; the quiet band just below it stays even and plain, ready for the client's copy and mark laid in post. Lighting: a large soft key high camera-left, a narrow rim from behind right that separates the silhouette, a soft contact shadow under the base. Real materials with micro-texture and true reflections. Full-frame camera, 70 mm lens at f/8, camera at product height, level horizon. Restrained grade, accurate colour, fine grain; no morphing, no flicker, no glowing edges, the label steady. No people. Add no text, letters or logos anywhere.

## Notes

- bottom_clear 35% is safe for Reels and Stories both; 20% only for a Stories-only placement.
- h3: product photo as `<Picture 1>`; 640x1152; 8 steps. Check the safe bands on every frame of the draft.
- h3-from-still: start from a storystatic still with the same bottom_clear; 8 steps.
