---
name: bedroomcalm
aliases: [yatakodasi, sakinoda]
title_tr: Sakin yatak odası
title_en: Calm bedroom
when_tr: Mülk ilanı, otel ya da kiralık daire; yatak odası huzurlu ve gerçek, sabah ışığında
when_en: Listing, hotel or rental; the bedroom calm and real in morning light
shelf: real-estate
role: base
medium: image
inputs: [product-photo]
slots: {time: "early morning daylight through sheer curtains|soft overcast daylight|warm evening with the bedside lamps on", aspect: "3:2|4:5|16:9"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached photograph of the bedroom as the only source for it: keep its exact layout, walls, windows, floor, bed, furniture and fixtures as photographed; add nothing that is not there, remove nothing that is there, and do not change the room's size. Re-photograph it in {time}, framed for {aspect}, from the corner opposite the bed's foot. The bed is freshly made with the bedding it already has, pulled smooth with a few soft natural creases; pillows plumped; loose personal items put away. Light: the window's daylight falls across the bed from one side, soft shadows under the bedside table, existing lamps glowing warm where they are on. Architectural camera, 20 mm rectilinear lens at f/8, at the height of the top of the mattress, perfectly vertical walls. Real textures: the weave of linen, the grain of the floor, a rug's pile, the slight unevenness of a painted wall. No people. Soft, neutral, restrained grade, fine grain; no fake HDR halos, no oversaturation, no warped windows. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the bedroom photo and say "use the attached room exactly; only the light, the angle correction and tidying change".
- h3-from-still: six seconds, a slow push toward the window; 8 steps.
