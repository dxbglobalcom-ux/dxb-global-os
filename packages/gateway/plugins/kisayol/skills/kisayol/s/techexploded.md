---
name: techexploded
aliases: [cihazici, icyapi]
title_tr: Parçalarına ayrılmış görünüm
title_en: Exploded internals
when_tr: Teknik ürün lansmanı; cihazın iç parçaları sırasıyla havada, mühendisliğini gösterir
when_en: Technical product launch; the device's internals floating in order, showing its engineering
shelf: electronics
role: base
medium: image
inputs: [product-photo]
slots: {axis: "vertical stack|horizontal row along one axis|isometric float", background: "clean light-grey seamless|deep graphite seamless", aspect: "4:5|16:9|1:1"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-01619, ads-01622, ads-00002
version: 1
---

## Prompt

Use the attached product photo as the only source for the device's outside: keep its exact shape, proportions, colours, materials and its own markings as photographed. Show it as a precise exploded view, {axis}, on a {background}, framed for {aspect}: the outer shell parts separated along their real assembly direction, and between them the believable internal layers such a device has, in order and correctly scaled, such as the cover glass, the display panel, the frame, the circuit board with its chips and shielding cans, the battery, the speaker and the fasteners, each gap equal and the parts perfectly aligned so they would slot back together. Every component looks manufactured: machined edges, anodised and matte finishes, copper traces, tiny screws, ribbon cables. Every screen is dark and blank, with no interface, no text and no icons. Light: a large soft key from the upper left, a rim light behind separating each layer, clean, soft shadows between parts. Full-frame camera, 90 mm lens at f/11, camera at a three-quarter angle slightly above. No people. Clean, neutral grade, fine grain; no callouts, no lines or arrows, no glowing parts, no impossible geometry. Add no text, letters or logos anywhere.

## Notes

- The internals are illustrative unless the client supplies a teardown; never claim a specific component the device does not have.
- h3-from-still: five seconds, the parts glide together into the closed device; 8 steps.
