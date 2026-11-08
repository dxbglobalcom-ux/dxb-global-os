---
name: ytthumb
aliases: [kucukresim, videokapagi]
title_tr: Video küçük resmi tarzı ürün karesi
title_en: Thumbnail-style product frame
when_tr: YouTube küçük resmi ya da video kapağı; ürün küçük boyutta bile bir bakışta okunur
when_en: A YouTube thumbnail or video cover; the product reads at a glance even at tiny size
shelf: platform-ads
role: base
medium: image
inputs: [product-photo]
slots: {background: "a deep saturated colour complementary to the product|a dark graded studio wall|a bright clean colour from the product's own palette"}
composes_with: [gradeclean, gradecool, gradefilm, rimlight]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: unavailable}
status: candidate
samples: []
provenance: ads-01710
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Create a 16:9 thumbnail-style frame that must work at 160 pixels wide. The product is big: it fills about 70% of the frame's height, placed in the right half, tilted a few degrees toward camera, on {background}. Bold value separation: a strong key from camera right makes the product the brightest object, a hard rim light from behind left traces its whole silhouette in a thin bright edge, and the ground falls darker toward the corners. One real-world proof of scale or use may enter from the lower right edge, an adult man's hand from our own cast holding or pointing at the product, real skin texture, no face in frame. Real materials: crisp specular highlights, visible micro-texture, nothing smoothed. Full-frame camera, 35 mm lens close to the product for gentle, energetic perspective, camera slightly below product height. The left half is clean ground, darker and even, for the client's copy and mark laid in post. Contrast and colour vivid yet believable; no oversaturation, no glowing halos, no fake HDR, no added arrows, circles or stickers. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- Check it shrunk to 160 px before handing it on: the product must still read.
