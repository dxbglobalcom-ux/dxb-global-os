---
name: subwayposter
aliases: [metroposteri, metroperonu]
title_tr: Metro peronu afişi
title_en: Subway platform poster
when_tr: Şehir içi yolcuya kampanya; ürün metro peronunda raylara bakan dev yatay afişte
when_en: Commuter campaign; the product on a large landscape cross-track poster in a subway station
shelf: outdoor-ooh
role: base
medium: image
inputs: [product-photo]
slots: {train: "empty tracks|a train leaving in motion blur", aspect: "16:9|4:5|1:1", market: "*"}
composes_with: [gradeclean, gradecool, gradefilm, street35]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ig-029818
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show it on a large landscape cross-track poster on the curved tiled wall of an underground station in a city of {market}, seen across the tracks from the opposite platform, with {train}. The poster is the product alone, large and slightly right of centre, on a clean ground drawn from its own colours, lit like a studio packshot with a soft key from the upper left. The poster sits in a thin steel frame and is lit evenly from the front by a rail of small lamps. Photographed from the platform edge at 1.5 m, full-frame camera, 35 mm lens at f/2.8, framed for {aspect}. Real materials: white glazed wall tiles with grey grout, hairline cracks and a damp stain, steel rails polished bright on top and rusty at the sides, a gravel bed, a yellow tactile strip with worn grooves at the frame's lower edge. Motivated light: cool fluorescent tubes overhead along the platform, the poster lamps warmer. If people stand on the far platform they are adult men from our own cast, few, faces not readable, never in front of the product. Restrained grade, true colour, fine grain; no fake HDR, no glow halos. Add no text, letters or logos anywhere; station wayfinding panels are plain blank colour; keep the poster's left third a plain area for the client's copy and mark laid in post.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: start from the empty-tracks still, five seconds, a train sweeps through in motion blur and clears the poster, locked camera; 8 steps.
