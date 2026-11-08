---
name: liquidsplash
aliases: [sicrama, sivisicrama]
title_tr: Sıvı sıçraması
title_en: Liquid splash shot
when_tr: Tazelik ve enerji anlatan içecek, cilt bakımı, temizlik ürünü reklamı
when_en: Drinks, skincare or cleaning products whose ad must say freshness and energy
shelf: studio-product
role: base
medium: image
inputs: [product-photo]
slots: {liquid: "crystal-clear water|creamy white milk|golden honey|pale green herbal infusion", backdrop: "deep teal gradient|clean white seamless|warm amber gradient", aspect: "4:5|1:1|9:16"}
composes_with: [centered, gradeclean, gradecool, gradefilm, macro100, rimlight]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-04436, ads-04437, ads-01499, ads-00288
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Photograph the product upright at the centre of a crown of {liquid} frozen mid-splash, the liquid rising from behind and both sides in a single curling sheet that breaks into droplets at its tips, framed for {aspect} against a {backdrop}. High-speed flash look, as if shot at 1/10000 s: every droplet sharp and round, thin sheets translucent where they stretch, tiny air bubbles inside, a few beads of liquid clinging to the product's surface. The splash never covers the front face of the product. Lighting: two strobes behind left and right backlighting the liquid so it glows at its edges, a soft front fill keeping the product's front clean and readable. Physically plausible fluid: gravity-true arcs, no impossible loops, no liquid passing through the product. Full-frame camera, 100 mm lens at f/11, camera at product height. Restrained grade, true colour, fine grain; no CGI gloss, no glowing edges. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; only the splash and setting are new".
- Choose a liquid that belongs to the product: never a drink the house does not show (no alcohol).
- h3-from-still: a three-second slow-motion rise of the same splash, locked camera; 8 steps.
