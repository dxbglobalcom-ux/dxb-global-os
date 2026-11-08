---
name: carlandscape
aliases: [dogadaaraba, manzaraoto]
title_tr: Manzarada otomobil
title_en: Car in a vast landscape
when_tr: Arazi aracı, SUV ya da tur aracı; küçük görünen araç büyük bir doğanın içinde, özgürlük duygusu
when_en: Off-road, SUV or touring car; the car small inside a vast landscape, a feeling of freedom
shelf: automotive
role: base
medium: image
inputs: [product-photo]
slots: {landscape: "red desert dunes|a high mountain plateau|a salt flat|a rocky coastline", time: "sunrise|golden hour|soft overcast day", aspect: "16:9|4:5|9:16"}
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

Use the attached photo as the only source for the vehicle: keep its exact body shape, proportions, paint colour and finish, wheels, lights, trim and its own badges as photographed; do not redraw, restyle or modify it. Place it parked on {landscape} at {time}, framed for {aspect}: the car occupies a small part of the frame on a third line, and the land and sky do the rest. It stands on the ground with real weight: tyres pressing into sand or gravel, a little dust on the lower doors and sills, a faint line of tyre tracks leading to it. The low sun from the side draws one long highlight along the body and a long shadow across the ground; the paint reflects the sky's colour. Full-frame camera, 85 mm lens at f/8 from a distance, slight compression, camera at waist height, horizon perfectly level. Real land: individual rocks, wind ripples, scrub plants. The number plate is blank, with no letters or numbers. No people. Natural, restrained grade, fine grain; no fake HDR, no oversaturated sky, no glow. Add no text, letters or logos anywhere beyond the car's own badges as photographed.

## Notes

- codex-image: attach the car photo and say "use the attached vehicle exactly".
- h3-from-still: eight seconds, a slow wide drift sideways, dust lifting in the wind; 8 steps.
