---
name: livingroom
aliases: [oturmaodasi, salon]
title_tr: Oturma odasında
title_en: In the living room
when_tr: Ev ürünü, mobilya aksesuarı, elektronik, tekstil; evin sıcak, yaşanmış hâli
when_en: Home goods, decor, electronics, textiles; the warm, lived-in state of a home
shelf: lifestyle
role: base
medium: image
inputs: [product-photo]
slots: {place: "a low walnut side table|a wool rug beside a sofa|a deep window sill", time: "late afternoon sun|soft overcast daylight|evening lamp light", aspect: "4:5|16:9|1:1", market: "*"}
composes_with: [candlewarm, gradeclean, gradecool, gradefilm, thirds]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00763, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. The product rests on {place} in a calm living room in {market} in {time}, furnished as a home there: a linen sofa with a cushion pressed in where someone sat, a wool throw half-folded over the arm, a stack of two closed books with plain spines, a potted plant near the window, a glass of water with a ring beside it. The room is real and tidy enough, not a showroom. If a person is present it is an adult man or an elderly woman from our own cast, seen from behind or cropped at the shoulder, face not readable, resting in the background. Light motivated by the window on camera-left (or a fabric-shaded floor lamp in the evening), long warm patches on the floor, the shadow side of the room still holding detail. Full-frame camera, 35 mm lens at f/2.8, seated eye height, framed for {aspect} with the product on a third; product sharp, room in gentle falloff. Real materials: wool fibres, linen slubs, walnut grain, dust in the light beam only if the sun is direct. Restrained grade, fine grain; no fake HDR, no plastic textures, no staged symmetry. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- For furniture or large products the product is the place itself: describe it as standing in the room, at real scale.
- h3-from-still: a slow lateral slide of twenty centimetres, five seconds, light constant; 8 steps.
