---
name: splashslowmo
aliases: [agircekimsicrama, sivisicramavideo]
title_tr: Ağır çekim sıvı sıçraması
title_en: Slow-motion liquid splash
when_tr: Tazelik ve enerji anlatan içecek, cilt bakımı, temizlik ürünü videosu
when_en: Drinks, skincare or cleaning product videos that must say freshness and energy
shelf: product-video
role: base
medium: video
inputs: [product-photo]
slots: {liquid: "crystal-clear water|creamy white milk|golden honey|pale green herbal infusion", backdrop: "deep teal gradient|clean white seamless|warm amber gradient", aspect: "9:16 at 640x1152|4:5|1:1"}
composes_with: [bullettime, dollyin, freezezoom, speedramp]
conflicts: []
cast: none
forms: {h3-from-still: ok, h3: unavailable, seedance: unavailable, kling: unavailable}
status: candidate
samples: []
provenance: video-000706, video-022876, video-000709
version: 1
---

## Prompt

Start from the attached approved still as the first frame: the product upright on a shallow, glassy pool of {liquid} against a {backdrop}. The product stays exactly as in the still for the whole clip: shape, proportions, colours, materials and its own label as photographed; it does not move. A five-second single continuous shot in deep slow motion, as if filmed at 1000 frames per second, framed for {aspect}. A crown of {liquid} rises from behind and both sides of the product in one curling sheet, climbs to just above its shoulders, breaks at the tips into round droplets, hangs for a moment and falls back, leaving a few beads clinging to the product's surface and gentle rings on the pool. The liquid never covers the front face of the product. Physically plausible fluid: gravity-true arcs, thin sheets translucent where they stretch, tiny air bubbles inside, no impossible loops, no liquid passing through the product. Light: two strobes behind left and right backlighting the liquid so its edges glow softly, a soft front fill keeping the product's front clean and readable. Camera: full-frame high-speed camera, 100 mm lens at f/8, at product height, locked off unless a camera move is named. Restrained grade, true colour, fine grain. No CGI gloss, no glowing edges, no flicker, no cuts. No people. Add no text, letters or logos anywhere.

## Notes

- h3-from-still: the first frame is a calm still from codex-image (the image recipe `liquidsplash` makes the mid-splash still if a frozen frame is wanted instead); 8 steps.
- Choose a liquid that belongs to the product; never a drink the house does not show (no alcohol). Picture only.
