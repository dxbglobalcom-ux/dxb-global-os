---
name: campaignposter
aliases: [kampanyaafisi, afis]
title_tr: Kampanya afişi
title_en: Campaign poster
when_tr: Basılı ya da dijital afiş; güçlü renk alanı, net ürün ve mesaja ayrılmış boş alan; mağaza içi, durak, sosyal medya
when_en: A print or digital poster: a bold colour field, a clear product and space kept for the message; in-store, transit, social
shelf: poster-keyvisual
role: base
medium: image
inputs: [product-photo]
slots: {field: "a saturated colour drawn from the product's own palette|a deep complementary colour to the product|a warm off-white paper tone", shape: "a single large circle behind the product|a clean diagonal split of two tones|one soft-edged arch", aspect: "2:3|3:4|9:16|4:5"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: unavailable}
status: candidate
samples: []
provenance: ads-00209
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Make a poster photograph with a bold, simple hierarchy, framed for {aspect}: a flat background of {field}, with {shape} as the only graphic element, the product placed in the lower-middle so it rises into the shape. The top 30 percent and a narrow band at the very bottom stay plain, flat and even, for the message and the client's mark laid in post. The background is a real painted wall or paper, not a digital fill: faint roller texture, a slight tonal falloff toward the corners. Lighting: a single large softbox high camera-left as key, crisp but soft-edged shadow of the product falling onto the surface below and to the right, a thin rim light behind for separation from the field. Medium-format camera, 100 mm lens at f/8, camera at product height, verticals straight. Restrained grade with one confident colour, fine grain; no gradients that band, no glow. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; the poster's message is added later".
- Print sizes: render native, then the designer sets the message and mark on the plain areas; nothing is enlarged before his eye.
