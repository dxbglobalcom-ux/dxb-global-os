---
name: herogiant
aliases: [devurun, olcekoyunu]
title_tr: Dev ürün ölçek kompozisyonu
title_en: Giant product scale composition
when_tr: Durduran, akılda kalan kampanya görseli; ürün manzarada bir yapı kadar büyük, yanında küçük bir insan ölçek verir
when_en: A thumb-stopping, memorable campaign image; the product as big as a building in a landscape, a small figure gives scale
shelf: poster-keyvisual
role: base
medium: image
inputs: [product-photo]
slots: {landscape: "a wide salt flat|a green hill meadow|a pale desert plain|an empty city plaza at dawn", aspect: "16:9|4:5|9:16"}
composes_with: [gradeclean, gradecool, gradefilm]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show the product enlarged to the height of a three-storey building, standing on {landscape}, framed for {aspect}. A single adult man from our own cast, small in the frame, walks toward it from the foreground, seen from behind, face not readable, giving the true scale. The giant product obeys the world: the same sun lights it and the ground, it casts one long true shadow, distant haze softens its top slightly, its surface keeps fine real-scale texture so it reads as the real object made huge, not a model. Light: low morning sun from camera-left, a clear sky fill. Plain sky above the product stays calm for the message laid in post. Full-frame camera, 35 mm lens at f/8, camera at standing eye height, horizon level. Natural exposure, restrained grade, fine grain; no fantasy glow, no surreal clouds. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; it is giant in the landscape".
- h3-from-still: a six-second slow walk of the figure with the camera holding still; 8 steps.
