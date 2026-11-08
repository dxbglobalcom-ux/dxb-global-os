---
name: streetscreen
aliases: [dijitalekran, sokakekrani]
title_tr: Sokak dijital ekranı
title_en: Digital street screen
when_tr: Dijital açık hava (DOOH) kampanyası; ürün yaya caddesindeki dikey LED ekranda
when_en: DOOH campaign; the product on a portrait LED screen on a pedestrian street
shelf: outdoor-ooh
role: base
medium: image
inputs: [product-photo]
slots: {time: "dusk|night|rainy night", aspect: "9:16|4:5|1:1"}
composes_with: []
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show it on a freestanding portrait digital screen, about three metres tall, set into the paving of a pedestrian shopping street at {time}. The screen shows the product alone, centred, on a deep ground drawn from its own colours, with a soft studio light and a gentle shadow. Up close the screen is a real LED panel: at this distance the pixel grid is just visible in the flat areas, the black is a true dark grey, and the brightness is set for night, so the product is crisp and nothing blooms. Photographed from six metres down the street, full-frame camera, 50 mm lens at f/2, camera height 1.5 m, framed for {aspect}, shop windows falling into round bokeh behind. Real materials: a dark anodised enclosure with a ventilation grille and a scuffed base plate, granite setts and drain channels, the screen's colour spilling onto the wet stones. Passers-by are adult men from our own cast, in natural motion blur, faces not readable, never in front of the screen. Motivated light: the screen itself as the key on the street, warm shop light as fill from behind. Restrained grade, fine film grain; no glow halos, no fake HDR. Add no text, letters or logos anywhere, on the screen or the shop windows; keep the screen's top fifth a plain area of the ground colour for the client's mark laid in post.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: six seconds, the product on the screen turns slowly a quarter turn while the street stays still, locked camera; 8 steps.
