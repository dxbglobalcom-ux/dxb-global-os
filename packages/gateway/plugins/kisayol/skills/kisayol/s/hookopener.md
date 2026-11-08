---
name: hookopener
aliases: [kanca, ikisaniye]
title_tr: 2 saniyelik kaydırma durduran açılış
title_en: 2-second scroll-stopping hook opener
when_tr: Her kısa video reklamın ilk iki saniyesi; akışta parmağı durduracak açılış hareketi
when_en: The first two seconds of any short video ad; the opening motion that stops a thumb in the feed
shelf: platform-video
role: base
medium: video
inputs: [product-photo]
slots: {hook: "the product drops into frame from above and lands with one small settle|the product is pushed into frame from the edge by an adult man's hand from our own cast|the camera rushes from a wide frame to a tight close-up of the product and stops", surface: "a matte stone slab|a seamless warm grey paper sweep|a dark oiled wood plank", aspect: "9:16|4:5|1:1"}
composes_with: [crashzoom, freezezoom, speedramp]
conflicts: []
cast: house
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: video-000227, video-000107, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed, the same in every frame; do not redraw or restyle it. A two-second opening shot built to stop a thumb mid-scroll: the very first frame already carries motion, never an empty or still start. {hook}, on {surface}, framed for {aspect}. By the end of the second second the product is still, sharp, filling about half the frame, its label toward the lens. Lighting: a hard key from high camera-right draws a crisp shadow and a bright specular edge that travels across the product as it moves; a white card camera-left lifts the shadow side. Real physics: the product has weight, settles once, and its contact shadow and faint reflection follow it exactly. Full-frame cinema camera, 50 mm lens at f/4, camera at product height, 24 fps, natural motion blur on the fast part only. Any hand is an adult man's hand from our own cast with real skin texture; no face in frame. Contrast is bold but colour stays true, fine grain; no morphing, no flicker, no change to the product's shape or label between frames. Add no text, letters or logos anywhere.

## Notes

- h3: the product photo as `<Picture 1>`; two seconds; 8 steps.
- h3-from-still: the still is the settled last frame's look; the motion runs into it; 8 steps.
- Cut the opener onto the job's main take in the edit; it stands alone only as a teaser.
