---
name: rooftopbb
aliases: [catipanosu, catibillboard]
title_tr: Çatı billboard'u
title_en: Rooftop billboard
when_tr: Büyük bütçeli lansman; ürün bir binanın çatısındaki dev yatay panoda, şehir siluetiyle
when_en: Big launch; the product on a giant landscape billboard atop a building, against the skyline
shelf: outdoor-ooh
role: base
medium: image
inputs: [product-photo]
slots: {time: "golden hour|blue hour|midday", aspect: "16:9|4:5|1:1", market: "*"}
composes_with: [bluehour, goldenhour, gradeclean, gradecool, gradefilm, heroangle, noonsun]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show it on a giant landscape billboard, about three times as wide as it is tall, mounted on a steel lattice frame on the roof of a six-storey stone building in a city of {market} at {time}. The billboard is a flat printed face: the product alone, large on the right half, on a clean graduated ground taken from its own dominant colour, with a soft studio shadow; the left half is calm open ground. Photographed from the street a block away, full-frame camera, 85 mm lens for a compressed, monumental perspective, slight upward angle, framed for {aspect} with the billboard, the building's cornice and a wide band of sky. Real materials: galvanised lattice with rust bloom at the joints, a service catwalk with handrail, four downlight lamp arms along the top edge, weathered stone with soot streaks, rooftop water tank and antennas beside it. Motivated light: the sun from camera left rakes the face and the frame; at dusk the four lamps pool light on the face and fall off toward the bottom edge. Natural exposure, restrained grade, fine film grain; no fake HDR, no oversharpening. No people. Add no text, letters or logos anywhere, on the billboard or on the buildings; the open left half stays plain for the client's copy and mark laid in post.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: a six-second slow tilt up from the cornice to the billboard, constant exposure, no cuts; 8 steps.
