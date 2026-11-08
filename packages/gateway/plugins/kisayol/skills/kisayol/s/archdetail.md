---
name: archdetail
aliases: [mimaridetay, yapidetay]
title_tr: Mimari detay
title_en: Architectural detail
when_tr: İlan ya da proje tanıtımının detay karesi; merdiven, pencere, kapı, malzeme işçiliği
when_en: The detail frame of a listing or development; a staircase, window, door or material craft
shelf: real-estate
role: base
medium: image
inputs: [product-photo]
slots: {time: "low morning sun|soft overcast daylight|late golden afternoon", aspect: "4:5|3:2|1:1"}
composes_with: [gradeclean, gradecool, gradefilm]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached photograph as the only source for the detail: keep its exact materials, shapes, joints, colours and condition as photographed; add nothing that is not there and do not repair or upgrade anything. Re-photograph it as a close architectural detail in {time}, framed for {aspect}: the camera closes in on the most telling part, the turn of a stair rail, a deep window reveal, a door's hardware, a joint between stone and timber. Light enters from the building's own window or opening, low and from one side, raking across the surface so the grain, tool marks and texture read, with a clean, real shadow line. Full-frame camera, 70 mm lens at f/5.6, the detail sharp, the space beyond softly out of focus but still readable as the same building. Real materials with their honest life: a worn step edge, patina on brass, a hairline crack in plaster. No people. Quiet, warm, restrained grade, fine grain; no fake HDR, no glow, no oversharpening. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the detail photo and say "use the attached detail exactly; only the framing and light change".
