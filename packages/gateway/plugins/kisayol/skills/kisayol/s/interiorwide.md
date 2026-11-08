---
name: interiorwide
aliases: [icmekan, genisoda]
title_tr: Geniş iç mekân
title_en: Interior wide
when_tr: Mülk ilanının salon ya da açık plan karesi; odayı ferah ve gerçek ölçüsünde gösterir
when_en: The living room or open-plan frame of a listing; shows the room airy and at its true size
shelf: real-estate
role: base
medium: image
inputs: [product-photo]
slots: {time: "bright midday daylight|soft morning daylight|late-afternoon warm daylight", aspect: "3:2|16:9|4:5"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: video-000225, video-000199
version: 1
---

## Prompt

Use the attached photograph of the room as the only source for it: keep its exact layout, walls, windows, doors, floor, ceiling, fixtures and furniture as photographed; add nothing that is not there, remove nothing that is there, and do not change the room's size or proportions. Re-photograph the same room as a professional property photographer would, in {time}, framed for {aspect}. Correct the camera: perfectly vertical lines, level horizon, from a corner at chest height, 16 mm rectilinear lens at f/8, the far wall and the near furniture both sharp. Balance the light as a blended exposure: the windows show the real view outside, not blown to white, while the room is evenly lit by daylight from those windows with soft, real shadows under furniture; any lamps in the room are on and warm. Real surfaces: floorboard grain, the weave of a rug, the slight sheen of painted walls, honest wear where it exists. Tidy only by straightening what is already there; nothing new is placed. No people. Neutral, clean, restrained grade, true white balance, fine grain; no fake HDR halos, no oversaturation, no fisheye bending, no warped windows. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the room photo and say "use the attached room exactly; only the camera correction and the light change".
- h3-from-still: eight seconds, a slow dolly forward into the room, walls and windows straight throughout; 8 steps.
