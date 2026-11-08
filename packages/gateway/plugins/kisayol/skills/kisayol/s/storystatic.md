---
name: storystatic
aliases: [hikaye, reelskapak, guvenlialan]
title_tr: Hikâye / Reels 9:16 durağan, güvenli alanlı
title_en: Story / Reels 9:16 static with safe zones
when_tr: Instagram/Facebook hikâye ve Reels yerleşimi için 9:16 durağan reklam; arayüzün kapattığı bantlar boş
when_en: A 9:16 static ad for Stories and Reels placements; the bands the interface covers stay empty
shelf: platform-ads
role: base
medium: image
inputs: [product-photo]
slots: {bottom_clear: "35%|20%", background: "a soft gradient from the product's own colour|a warm stone wall with a window shadow|a cool grey seamless|soft grey-to-white gradient|seamless warm grey paper|a honed travertine plinth"}
composes_with: [bggradient, bgseamless, centered, gradeclean, gradecool, gradefilm, gradehighkey, matfrosted, matmetal, matstone, matwet, rimlight, softbox]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Re-photograph it as a full-screen vertical 9:16 image on {background}. Safe zones are part of the design: the top 14% of the frame and the bottom {bottom_clear} hold no part of the product and no important detail, only calm continuous background, because the platform's interface covers them. The product sits in the central band, upright, filling about 60% of the band's height, slightly above the band's middle so it reads first. Lighting: a large soft key from high camera left, a narrow rim from behind right to separate the silhouette from the ground, a soft contact shadow under the base. Real materials: true highlights on gloss, soft falloff on matte, micro-texture and a few honest imperfections. Full-frame camera, 70 mm lens at f/8, camera at product height, perfectly level. The band just below the product is quiet and even, ready for the client's copy and mark laid in post. Restrained grade, accurate colour, fine grain; no glowing edges, no fake HDR, no oversharpening. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly". Check the safe bands on the result before handing it on.
- bottom_clear 35% is safe for Reels and Stories both; 20% only for a Stories-only placement.
- h3-from-still: five seconds, a slow push-in that keeps the product inside the central band; 8 steps.
