---
name: malllightbox
aliases: [avmpano, avmisikkutu]
title_tr: AVM ışıklı kutu
title_en: Shopping-mall lightbox
when_tr: Mağaza içi ya da AVM kampanyası; ürün koridordaki serbest duran ışıklı kutuda
when_en: In-mall or retail campaign; the product in a freestanding lightbox on the mall concourse
shelf: outdoor-ooh
role: base
medium: image
inputs: [product-photo]
slots: {background: "soft off-white|warm terracotta|cool slate blue", aspect: "4:5|9:16|1:1"}
composes_with: []
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show it as the image of a slim double-sided freestanding lightbox standing on the concourse of a calm, modern shopping mall: the lightbox face is the product alone on a seamless {background} ground, lit like a studio packshot with a soft key from the upper left and a clean contact shadow. The face glows evenly from within, edge to edge. Photographed at eye level from four metres, full-frame camera, 50 mm lens at f/2.8, the lightbox sharp and the concourse falling into soft real bokeh, framed for {aspect}. Real materials: brushed aluminium frame with a few hairline scuffs, polished terrazzo floor reflecting the lightbox as a soft streak, glass balustrades, warm store practicals far behind. Daylight from a skylight high above mixes with the warm store light; the lightbox is the brightest thing in the frame without blooming. Background shoppers are adult men and elderly women from our own cast, small, in natural motion blur, faces not readable. Restrained grade, true colour, fine grain; no glow halos, no plastic surfaces. Add no text, letters or logos anywhere, including the storefronts, which read as plain lit glass; keep the lightbox face's lower fifth a plain band of the ground colour for the client's mark laid in post.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: a four-second slow push-in toward the lightbox, background figures walking, no cuts; 8 steps.
