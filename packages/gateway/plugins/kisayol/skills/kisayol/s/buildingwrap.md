---
name: buildingwrap
aliases: [binagiydirme, cepheafisi]
title_tr: Bina giydirme
title_en: Building wrap
when_tr: Şehir ölçeğinde dikkat çekme; ürün bir binanın bütün cephesini kaplayan file afişte
when_en: City-scale attention; the product on a mesh banner covering a whole building facade
shelf: outdoor-ooh
role: base
medium: image
inputs: [product-photo]
slots: {time: "bright overcast day|late afternoon sun|blue hour", aspect: "4:5|9:16|16:9"}
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

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show it as a building wrap: a printed mesh banner stretched over the whole street facade of an eight-storey building under renovation at {time}. The banner's image is the product alone, many storeys tall, standing on a clean ground drawn from its own colours, with a soft shadow beneath it. Real construction: the mesh is tensioned by ropes through steel grommets every half metre, scaffolding pokes out at both sides and the top, and the window grid of the building reads faintly through the open weave where the light is behind it. Photographed from across a wide boulevard, full-frame camera with a 24 mm shift lens, camera height 1.7 m, verticals corrected, framed for {aspect}. Real materials: slight sag and ripples in the mesh between ropes, a dusty lower edge, neighbouring stone facades with weathering, plane trees and parked cars in the foreground at the frame edge. Pedestrians on the far pavement are adult men and elderly women from our own cast, small, faces not readable. Motivated light: the sky as the main source, the sun from camera left when present, true shadows of the scaffolding on the mesh. Restrained grade, fine grain; no fake HDR, no glow. Add no text, letters or logos anywhere; keep the wrap's top storeys a plain band of ground for the client's mark laid in post.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: a six-second slow push-in across the boulevard, a light breeze rippling the mesh, no cuts; 8 steps.
