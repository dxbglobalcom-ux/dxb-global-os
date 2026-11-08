---
name: carwetnight
aliases: [islakgece, yagmursonrasi]
title_tr: Islak gecede otomobil
title_en: Car on a wet night street
when_tr: Sinematik kampanya karesi; araç yağmurdan sonra ıslak bir şehir sokağında, ışıklar asfaltta
when_en: A cinematic campaign frame; the car on a city street after rain, lights mirrored on the asphalt
shelf: automotive
role: base
medium: image
inputs: [product-photo]
slots: {street: "an old cobbled street|a modern glass-tower avenue|a quiet street under a stone bridge", aspect: "16:9|4:5|9:16", market: "*"}
composes_with: [gradeclean, gradecool, gradefilm, gradelowkey]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-05009, house-authored
version: 1
---

## Prompt

Use the attached photo as the only source for the vehicle: keep its exact body shape, proportions, paint colour and finish, wheels, lights, trim and its own badges as photographed; do not redraw, restyle or modify it. Park it at night on {street} in a city of {market} just after rain, framed for {aspect}, its headlamps and tail lamps on. The asphalt is wet and black, with shallow puddles that mirror the car's lights and the warm and cool street lamps in long vertical streaks; raindrops bead on the bonnet and roof, the paint carrying sharp reflections of the lamps above. Light: sodium-warm street lamps from behind and above, a cool light from a shopfront to the side, the car's own headlamps throwing two beams through a light mist. No people; the cabin is dark and unreadable. The number plate is blank, with no letters or numbers, and every shop sign is unlit or out of frame. Full-frame camera, 35 mm lens at f/2.8, camera low at bumper height, the car sharp, the street behind in soft bokeh. Moody, restrained grade, deep blacks with detail, fine grain; no glow halos, no neon overload, no fake rain streaks. Add no text, letters or logos anywhere beyond the car's own badges as photographed.

## Notes

- codex-image: attach the car photo and say "use the attached vehicle exactly".
- h3-from-still: six seconds locked, light drizzle, a slow push-in along the bonnet; 8 steps.
