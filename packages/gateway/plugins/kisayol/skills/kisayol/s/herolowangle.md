---
name: herolowangle
aliases: [alttanaci, anitsal]
title_tr: Alttan açı anıtsal kompozisyon
title_en: Low-angle monumental hero
when_tr: Ürünü güçlü, büyük ve iddialı göstermek; lansman afişi, dikey reklam, ana sayfa görseli
when_en: Makes the product read powerful, big and bold; launch posters, vertical ads, homepage visuals
shelf: poster-keyvisual
role: base
medium: image
inputs: [product-photo]
slots: {sky: "a clean deep-blue afternoon sky|a soft dusk sky fading from apricot to blue|a high overcast silver sky", ground: "a weathered concrete slab|a flat dark basalt rock|a rippled sand surface", aspect: "9:16|4:5|2:3"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00169, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Photograph the product from a worm's-eye view, standing on {ground} outdoors with {sky} behind it, framed for {aspect}, so it towers like a monument: the lens almost at ground level, the product filling the lower two thirds and converging gently upward, the sky open above it for the message laid in post. Light: the real sun low and behind camera-right, putting a warm edge along one side of the product and a long shadow across the ground toward the camera; the sky gives a cool, soft fill to the front. Real ground texture sharp in the foreground: grit, small cracks, sand grains. Full-frame camera, 24 mm lens at f/11, camera on the ground tilted up 15 degrees. Natural exposure with detail in sky and shadow, restrained saturation, fine grain; no fake HDR, no sun-flare spam. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; seen from the ground looking up".
- Wide lenses stretch: check the product's proportions against the photo before it goes to his eye.
- h3-from-still: a five-second slow rise of the camera along the product's height; 8 steps.
