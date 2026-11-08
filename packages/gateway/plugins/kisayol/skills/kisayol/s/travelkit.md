---
name: travelkit
aliases: [seyahat, yolculuk]
title_tr: Yolculukta
title_en: On the road
when_tr: Seyahat boyu, taşınabilir, bavula giren ürün; yola hazırlık ya da yolda bir an
when_en: Travel-size, portable, packable products; packing for the road or a moment on the way
shelf: lifestyle
role: base
medium: image
inputs: [product-photo]
slots: {scene: "an open leather weekender on a hotel bed|a train window table with the landscape passing|an airport window ledge at dawn|a car's passenger seat on a coastal road", aspect: "4:5|9:16|1:1", market: "*"}
composes_with: [gradeclean, gradecool, gradefilm, thirds]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00329, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. The product is on {scene}, on a journey in {market}, packed or set down as a real traveller would: a rolled cotton shirt, a passport wallet closed and face-down, a pair of sunglasses folded, a paper boarding pass turned blank side up, a charging cable coiled loosely. The product is the hero and sits on the nearest third, label toward the lens. If a hand appears it is an adult man's hand from our own cast reaching for the product, real skin texture; any traveller in the background is an adult man or an elderly woman, out of focus, face not readable. Light comes from the window or the open sky on camera-left, with the colour of the place: clean morning blue at an airport, warm side light on a train, soft white in a hotel room. Full-frame camera, 35 mm lens at f/2.8, just above the surface, framed for {aspect}; motion only in what lies beyond a moving window. Real materials: grained leather with scuffed corners, creased cotton, scratched window glass with faint reflections of the interior. Restrained grade, fine grain; no postcard sky, no fake HDR. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- Keep printed items blank: no airline, hotel or place names anywhere.
- h3-from-still (train window): the landscape slides past, the product stays still, five seconds; 8 steps.
