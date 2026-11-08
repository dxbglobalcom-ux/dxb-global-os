---
name: metaads
aliases: [metareklam, sosyalreklam]
title_tr: Meta reklam görseli, tek fikirli
title_en: Meta ad visual, one idea
when_tr: Facebook/Instagram reklamı için ürünün faydasını tek görsel fikirle anlatan, kaydırmayı durduran kare
when_en: A Facebook/Instagram ad frame that tells the product's benefit in one visual idea and stops the scroll
shelf: platform-ads
role: base
medium: image
inputs: [product-photo]
slots: {idea: "the product's key ingredient or material shown at giant scale around it|the product resting on the natural element it is made from|the product cutting through a clean sweep of its own colour", aspect: "4:5|1:1|9:16"}
composes_with: [gradeclean, gradecool, gradefilm, rimlight]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Create a paid social ad image framed for {aspect}, built on one visual idea: {idea}. The idea must read in under a second on a phone: the product is the hero and the largest sharp object, the idea surrounds or carries it, and nothing else enters the frame. Every element is real and photographed, not illustrated: real ingredients or materials with true texture, moisture, fibres and small natural flaws, sharing the product's light and casting true shadows on each other. Lighting: a strong soft key from high camera left, a crisp rim from behind right outlining the product, the set falling a stop darker toward the edges so the eye lands on the product. Colour: a restrained palette drawn from the product itself, one accent at most. Full-frame camera, 85 mm lens at f/8, camera slightly below product height so it feels confident. One calm area, a quarter of the frame, at the top for 4:5 and 1:1 or in the centre-upper band for 9:16 (clear of the top 14% and the bottom 35%), holds nothing, for the client's copy and mark laid in post. Restrained grade, fine grain; no fake HDR, no glowing edges, no floating clutter, no plastic CGI look. No people. Add no text, letters or logos anywhere.

## Notes

- The reel's /metaads (u4, 2026-11-07) gave only the name; this recipe is ours.
- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: five seconds, the surrounding elements settle or drift slowly while the product stays still; 8 steps.
