---
name: turntable
aliases: [donertabla, dondurme360]
title_tr: Döner tabla çekimi
title_en: Turntable rotation
when_tr: Ürünün her yanını göstermek; ürün sayfası, pazaryeri videosu, katalog
when_en: Show the product from every side; product page, marketplace video, catalogue
shelf: product-video
role: base
medium: video
inputs: [product-photo]
slots: {arc: "a slow 45-degree turn and back to the front|a full 360-degree turn when the job supplies photos of every side", background: "seamless warm grey paper|clean white seamless|soft grey-to-white gradient", aspect: "1:1|9:16 at 640x1152|4:5|16:9"}
composes_with: []
conflicts: []
cast: none
forms: {h3-from-still: ok, h3: unavailable, seedance: unavailable, kling: unavailable}
status: candidate
samples: []
provenance: video-004882, video-007436, video-000007
version: 1
---

## Prompt

Start from the attached approved still as the first frame. The product stays exactly as in it: shape, proportions, colours, materials and its own label as photographed; it turns as one rigid object and never stretches, melts or redraws. An eight-second single continuous shot, framed for {aspect}. The product stands on a matte turntable disc flush with a {background}; the disc rotates at a steady, unhurried speed, carrying the product through {arc}. Constant angular speed, no wobble, no jitter; the product stays centred on its own vertical axis. Light stays fixed while the product turns: a large softbox high camera-left as the key, a white bounce camera-right, a thin strip light behind for a rim, so highlights glide across the surface as it rotates, exactly as in a real studio. The soft contact shadow stays under the product and turns with it. Camera: full-frame cinema camera, 85 mm lens at f/8, at product height, locked off, perfectly level horizon. Real materials with fine texture and true specular highlights; physically plausible reflections. Restrained grade, accurate colour, fine grain. No flicker, no morphing details, no cuts. No people. Add no text, letters or logos anywhere.

## Notes

- h3-from-still: first frame from codex-image (studio still from the product photo); 8 steps.
- The engine cannot know a side it has not seen: the full turn only when the job supplies every side; otherwise the 45-degree arc.
- Picture only.
