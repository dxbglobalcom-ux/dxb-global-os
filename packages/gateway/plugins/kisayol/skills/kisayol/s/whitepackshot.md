---
name: whitepackshot
aliases: [beyazfon, pazaryeriana]
title_tr: Beyaz fon pazaryeri çekimi
title_en: White-background marketplace packshot
when_tr: Pazaryeri ana görseli saf beyaz fon istediğinde; ilanın ilk görseli
when_en: A marketplace main image that must sit on pure white; the first image of a listing
shelf: studio-product
role: base
medium: image
inputs: [product-photo]
slots: {angle: "straight-on front view|slight three-quarter view from the left", shadow: "a faint soft contact shadow directly beneath it|no shadow at all", aspect: "1:1|4:5"}
composes_with: [centered, gradeclean]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: unavailable}
status: candidate
samples: []
provenance: ads-00790
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Re-photograph it as a marketplace main image: the product alone, centred, in a {angle}, filling about 85 percent of the frame height, framed for {aspect}, on a pure white (#FFFFFF) seamless background with no gradient, vignette or texture, and {shadow}. Lighting: two large softboxes at 45 degrees left and right at product height for even, shadow-free coverage, a white overhead scrim to lift the top edges, and the background lit separately one stop brighter so it clips to white without spilling onto the product's edges. Colour must match the photo exactly: neutral white balance, no cast, true blacks. Real material behaviour: clean specular highlights on gloss, soft falloff on matte, fine surface texture visible. Medium-format camera, 90 mm lens at f/11, lens at the product's centre height, verticals perfectly straight. Edges crisp and clean, no halo or cut-out fringe. No props, no packaging the photo does not show, no people. Add no text, letters, badges, watermarks or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; only the background and light change".
- Marketplace rules differ (Amazon wants 85 percent fill and RGB 255 white): check the pixel value of the corners before upload.
- If the label comes out garbled, the real label is laid in post (rule f).
